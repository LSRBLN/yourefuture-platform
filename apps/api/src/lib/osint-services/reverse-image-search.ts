/**
 * Reverse Image Search Service
 * 
 * Integration with:
 * - Qdrant (Vector Database for similarity search)
 * - MRISA (Meta Reverse Image Search API)
 * - CLIP embeddings for image similarity
 * 
 * Self-hosted, privacy-focused, no external image storage
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageEmbedding {
  imageUrl: string;
  embedding: number[];
  metadata?: {
    width?: number;
    height?: number;
    extractedAt?: string;
    source?: string;
  };
}

export interface ReverseImageMatch {
  url: string;
  title?: string;
  source: string;
  similarity_score: number;
  imageUrl: string;
  crawlDate?: string;
  domain?: string;
}

export interface ReverseImageSearchResult {
  query: string;
  totalMatches: number;
  matches: ReverseImageMatch[];
  searchTime: number;
  sources: string[];
}

export class ReverseImageSearchService {
  private qdrantClient: AxiosInstance;
  private mrisaClient: AxiosInstance;
  private qdrantUrl: string = process.env.QDRANT_URL || 'http://localhost:6333';
  private mrisaUrl: string = process.env.MRISA_URL || 'http://localhost:5000';
  private collectionName: string = 'images';

  constructor() {
    this.qdrantClient = axios.create({
      baseURL: this.qdrantUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.mrisaClient = axios.create({
      baseURL: this.mrisaUrl,
      timeout: 30000,
    });
  }

  /**
   * Reverse image search - primary method
   * Combines Qdrant (local) + MRISA (web)
   */
  async reverseSearch(imageUrl: string, includeWeb: boolean = true): Promise<ReverseImageSearchResult> {
    const startTime = Date.now();
    const allMatches: ReverseImageMatch[] = [];
    const sources: Set<string> = new Set();

    try {
      // Search local Qdrant collection
      const qdrantResults = await this.searchQdrant(imageUrl);
      if (qdrantResults && qdrantResults.length > 0) {
        allMatches.push(...qdrantResults);
        sources.add('Qdrant (Local)');
      }

      // Search web via MRISA if enabled
      if (includeWeb) {
        const mrisaResults = await this.searchMRISA(imageUrl);
        if (mrisaResults && mrisaResults.length > 0) {
          allMatches.push(...mrisaResults);
          sources.add('MRISA');
        }
      }

      // Deduplicate and rank
      const uniqueMatches = this.deduplicateMatches(allMatches);
      const rankedMatches = uniqueMatches.sort((a, b) => b.similarity_score - a.similarity_score);

      return {
        query: imageUrl,
        totalMatches: rankedMatches.length,
        matches: rankedMatches.slice(0, 100),
        searchTime: Date.now() - startTime,
        sources: Array.from(sources),
      };
    } catch (error) {
      console.error('[ReverseImageSearch] Error:', error);
      return {
        query: imageUrl,
        totalMatches: 0,
        matches: [],
        searchTime: Date.now() - startTime,
        sources: Array.from(sources),
      };
    }
  }

  /**
   * Search local Qdrant vector database
   */
  private async searchQdrant(imageUrl: string): Promise<ReverseImageMatch[]> {
    try {
      // Get embedding for input image
      const embedding = await this.generateEmbedding(imageUrl);
      if (!embedding) {
        return [];
      }

      // Search Qdrant for similar vectors
      const response = await this.qdrantClient.post('/search/points', {
        collection_name: this.collectionName,
        vector: embedding,
        limit: 100,
        score_threshold: 0.7,
      });

      if (!response.data.result || !response.data.result.length) {
        return [];
      }

      return response.data.result.map((item: any) => ({
        url: item.payload.url,
        title: item.payload.title,
        source: 'Qdrant',
        similarity_score: item.score,
        imageUrl: item.payload.imageUrl || item.payload.url,
        crawlDate: item.payload.crawlDate,
        domain: item.payload.domain,
      }));
    } catch (error) {
      console.warn('[Qdrant] Search failed:', error);
      return [];
    }
  }

  /**
   * Search web via MRISA (Meta Reverse Image Search API)
   */
  private async searchMRISA(imageUrl: string): Promise<ReverseImageMatch[]> {
    try {
      const response = await this.mrisaClient.get('/search', {
        params: {
          image: imageUrl,
          limit: 50,
        },
      });

      if (!response.data.results) {
        return [];
      }

      return response.data.results.map((result: any) => ({
        url: result.url,
        title: result.title,
        source: result.source || 'MRISA',
        similarity_score: result.similarity || 0.8,
        imageUrl: result.image,
        domain: this.extractDomain(result.url),
      }));
    } catch (error) {
      console.warn('[MRISA] Search failed:', error);
      return [];
    }
  }

  /**
   * Generate embedding for image using CLIP or similar model
   */
  private async generateEmbedding(imageUrl: string): Promise<number[] | null> {
    try {
      // Call embedding service (Python backend with sentence-transformers)
      const response = await axios.post('http://localhost:8001/embeddings', {
        image_url: imageUrl,
      });

      return response.data.embedding;
    } catch (error) {
      console.warn('[Embeddings] Generation failed:', error);
      return null;
    }
  }

  /**
   * Index image in Qdrant collection
   * Called when new images are uploaded
   */
  async indexImage(imageUrl: string, metadata?: any): Promise<boolean> {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(imageUrl);
      if (!embedding) {
        return false;
      }

      // Create point in Qdrant
      const pointId = this.generatePointId();
      const response = await this.qdrantClient.post(`/collections/${this.collectionName}/points`, {
        points: [
          {
            id: pointId,
            vector: embedding,
            payload: {
              url: imageUrl,
              imageUrl: imageUrl,
              title: metadata?.title || 'Untitled',
              domain: this.extractDomain(imageUrl),
              crawlDate: new Date().toISOString(),
              ...metadata,
            },
          },
        ],
      });

      return response.status === 200;
    } catch (error) {
      console.error('[Qdrant] Indexing failed:', error);
      return false;
    }
  }

  /**
   * Batch index multiple images
   */
  async indexBatch(images: Array<{ url: string; metadata?: any }>): Promise<{ indexed: number; failed: number }> {
    let indexed = 0;
    let failed = 0;

    try {
      // Generate embeddings for all images
      const embeddings = await Promise.all(
        images.map(async (img) => {
          const embedding = await this.generateEmbedding(img.url);
          return {
            url: img.url,
            embedding,
            metadata: img.metadata,
          };
        }),
      );

      // Filter out failed embeddings
      const validEmbeddings = embeddings.filter((e) => e.embedding !== null);
      failed = embeddings.length - validEmbeddings.length;

      if (validEmbeddings.length === 0) {
        return { indexed, failed };
      }

      // Batch insert to Qdrant
      const points = validEmbeddings.map((item: any, idx: number) => ({
        id: this.generatePointId(),
        vector: item.embedding,
        payload: {
          url: item.url,
          imageUrl: item.url,
          title: item.metadata?.title || 'Untitled',
          domain: this.extractDomain(item.url),
          crawlDate: new Date().toISOString(),
          ...item.metadata,
        },
      }));

      const response = await this.qdrantClient.post(
        `/collections/${this.collectionName}/points`,
        { points },
      );

      indexed = response.status === 200 ? validEmbeddings.length : 0;

      return { indexed, failed };
    } catch (error) {
      console.error('[Qdrant] Batch indexing failed:', error);
      return { indexed, failed: images.length };
    }
  }

  /**
   * Delete image from index
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const response = await this.qdrantClient.delete(
        `/collections/${this.collectionName}/points`,
        {
          data: {
            filter: {
              must: [
                {
                  key: 'url',
                  match: {
                    value: imageUrl,
                  },
                },
              ],
            },
          },
        },
      );

      return response.status === 200;
    } catch (error) {
      console.error('[Qdrant] Delete failed:', error);
      return false;
    }
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<any> {
    try {
      const response = await this.qdrantClient.get(`/collections/${this.collectionName}`);
      return {
        name: this.collectionName,
        pointCount: response.data.result.points_count,
        vectorSize: response.data.result.config.params.vectors.size,
      };
    } catch (error) {
      console.warn('[Qdrant] Stats retrieval failed:', error);
      return null;
    }
  }

  /**
   * Initialize collection if not exists
   */
  async initializeCollection(vectorSize: number = 512): Promise<boolean> {
    try {
      // Check if collection exists
      try {
        await this.qdrantClient.get(`/collections/${this.collectionName}`);
        return true; // Already exists
      } catch {
        // Collection doesn't exist, create it
      }

      // Create collection
      const response = await this.qdrantClient.put(`/collections/${this.collectionName}`, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine',
        },
      });

      return response.status === 201;
    } catch (error) {
      console.error('[Qdrant] Collection initialization failed:', error);
      return false;
    }
  }

  // ============ UTILITY METHODS ============

  private deduplicateMatches(matches: ReverseImageMatch[]): ReverseImageMatch[] {
    const seen = new Set<string>();
    return matches.filter((match) => {
      if (seen.has(match.url)) return false;
      seen.add(match.url);
      return true;
    });
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname || url;
    } catch {
      return url;
    }
  }

  private generatePointId(): number {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }
}

export default new ReverseImageSearchService();
