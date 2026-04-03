/**
 * FaceSeek Integration Service
 * 
 * Integrates with FaceSeek.online for advanced face search
 * FaceSeek provides better accuracy than raw API calls with caching and optimization
 */

import axios, { AxiosInstance } from 'axios';

export interface FaceSeekSearchOptions {
  imageUrl?: string;
  imageBase64?: string;
  personName?: string;
  searchDeepWeb?: boolean;
  includeVideos?: boolean;
  searchSocialMedia?: boolean;
}

export interface FaceSeekMatch {
  url: string;
  title?: string;
  source: string;
  domain: string;
  imageUrl: string;
  similarity: number;
  crawlDate?: string;
  isVideo?: boolean;
  videoPreview?: string;
  metadata?: {
    imageSize?: string;
    uploadDate?: string;
    location?: string;
    context?: string;
  };
}

export interface FaceSeekResult {
  requestId: string;
  status: 'completed' | 'processing' | 'failed';
  matches: FaceSeekMatch[];
  totalMatches: number;
  searchTime: number;
  coverage: {
    socialMedia: number;
    web: number;
    videos: number;
    deepWeb?: number;
  };
  qualityScore: number;
  warnings?: string[];
}

export class FaceSeekService {
  private apiClient: AxiosInstance;
  private baseUrl: string = 'https://www.faceseek.online/api';
  private apiKey: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.FACESEEK_API_KEY || '';
    this.isConfigured = !!this.apiKey;

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
    });
  }

  /**
   * Perform face search via FaceSeek.online
   * Converts local image formats to FaceSeek API format
   */
  async searchFace(options: FaceSeekSearchOptions): Promise<FaceSeekResult> {
    if (!this.isConfigured) {
      console.warn(
        '[FaceSeek] API key not configured. Set FACESEEK_API_KEY environment variable.',
      );
      return this.getEmptyResult();
    }

    try {
      const payload: any = {
        searchDeepWeb: options.searchDeepWeb !== false,
        includeVideos: options.includeVideos !== false,
        searchSocialMedia: options.searchSocialMedia !== false,
      };

      // Handle image input
      if (options.imageBase64) {
        payload.imageData = this.cleanBase64(options.imageBase64);
        payload.imageFormat = 'base64';
      } else if (options.imageUrl) {
        payload.imageUrl = options.imageUrl;
        payload.imageFormat = 'url';
      } else {
        throw new Error('Either imageUrl or imageBase64 must be provided');
      }

      // Include person name if provided
      if (options.personName) {
        payload.personName = options.personName;
      }

      // Send request to FaceSeek API
      const response = await this.apiClient.post<FaceSeekResult>('/v1/search/face', payload);

      // Normalize and enhance results
      return this.normalizeResults(response.data);
    } catch (error) {
      console.error('[FaceSeek] Search failed:', error instanceof Error ? error.message : error);
      return this.getEmptyResult();
    }
  }

  /**
   * Get search status and cached results
   */
  async getSearchStatus(requestId: string): Promise<FaceSeekResult> {
    if (!this.isConfigured) {
      return this.getEmptyResult();
    }

    try {
      const response = await this.apiClient.get<FaceSeekResult>(`/v1/search/status/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('[FaceSeek] Status check failed:', error instanceof Error ? error.message : error);
      return this.getEmptyResult();
    }
  }

  /**
   * Reverse search for video content
   */
  async searchVideo(videoUrl: string): Promise<FaceSeekResult> {
    if (!this.isConfigured) {
      return this.getEmptyResult();
    }

    try {
      const response = await this.apiClient.post<FaceSeekResult>('/v1/search/video', {
        videoUrl,
        extractFrames: true,
        fps: 2, // Extract every 2 frames
      });

      return response.data;
    } catch (error) {
      console.error('[FaceSeek] Video search failed:', error instanceof Error ? error.message : error);
      return this.getEmptyResult();
    }
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(options: FaceSeekSearchOptions & {
    minSimilarity?: number;
    maxResults?: number;
    filterDomains?: string[];
    dateRange?: { from: string; to: string };
  }): Promise<FaceSeekResult> {
    if (!this.isConfigured) {
      return this.getEmptyResult();
    }

    try {
      const payload: any = {
        ...options,
        minSimilarity: options.minSimilarity || 0.7,
        maxResults: options.maxResults || 100,
      };

      // Convert base64 if needed
      if (options.imageBase64) {
        payload.imageData = this.cleanBase64(options.imageBase64);
        payload.imageFormat = 'base64';
      }

      const response = await this.apiClient.post<FaceSeekResult>(
        '/v1/search/advanced',
        payload,
      );

      return response.data;
    } catch (error) {
      console.error('[FaceSeek] Advanced search failed:', error instanceof Error ? error.message : error);
      return this.getEmptyResult();
    }
  }

  /**
   * Get available search sources and coverage
   */
  async getSearchCoverage(): Promise<{ sources: string[]; coverage: number }> {
    if (!this.isConfigured) {
      return { sources: [], coverage: 0 };
    }

    try {
      const response = await this.apiClient.get<{ sources: string[]; coverage: number }>(
        '/v1/search/coverage',
      );
      return response.data;
    } catch (error) {
      console.error('[FaceSeek] Coverage check failed:', error instanceof Error ? error.message : error);
      return { sources: [], coverage: 0 };
    }
  }

  /**
   * Normalize FaceSeek results to standard format
   */
  private normalizeResults(results: FaceSeekResult): FaceSeekResult {
    if (!results.matches) {
      results.matches = [];
    }

    // Sort by similarity descending
    results.matches.sort((a, b) => b.similarity - a.similarity);

    // Calculate quality score based on results
    results.qualityScore = Math.min(100, results.matches.length * 10);

    return results;
  }

  /**
   * Clean base64 string (remove data: prefix if present)
   */
  private cleanBase64(base64: string): string {
    if (base64.startsWith('data:')) {
      return base64.split(',')[1];
    }
    return base64;
  }

  /**
   * Get empty result structure
   */
  private getEmptyResult(): FaceSeekResult {
    return {
      requestId: '',
      status: 'failed',
      matches: [],
      totalMatches: 0,
      searchTime: 0,
      coverage: { socialMedia: 0, web: 0, videos: 0 },
      qualityScore: 0,
      warnings: ['FaceSeek API not configured. Please set FACESEEK_API_KEY.'],
    };
  }
}

export default new FaceSeekService();
