/**
 * External API Integrations for TrustShield
 * Leak Checks, Image Analysis, Video Analysis
 * 
 * @module external-apis
 * @description Centralized utilities for integrating with free & trial APIs
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// INTERFACES
// ============================================================================

export interface LeakCheckResult {
  found: boolean;
  breaches: number;
  sources: string[];
  lastBreachDate?: string;
  isSensitive: boolean;
}

export interface PasswordCheckResult {
  isPwned: boolean;
  occurrences: number;
  lastSeenInBreaches?: string;
}

export interface ImageAnalysisResult {
  hasNSFW: boolean;
  nsfw_score?: number;
  labels?: string[];
  faces: number;
  contains_deepfake: boolean;
  deepfake_confidence?: number;
  moderation_labels?: string[];
}

export interface ReverseImageSearchResult {
  found: boolean;
  source_url?: string;
  similarity_percentage?: number;
  matches: Array<{
    title?: string;
    url?: string;
    similarity: number;
  }>;
}

export interface VideoAnalysisResult {
  frames_analyzed: number;
  has_faces: number;
  contains_deepfake: boolean;
  deepfake_confidence?: number;
  contains_violence: boolean;
  contains_nudity: boolean;
  processing_time_seconds: number;
}

// ============================================================================
// LEAK CHECK SERVICE
// ============================================================================

export class LeakCheckService {
  private client: AxiosInstance;
  private apiKey: string;
  private rateLimit: { requests: number; resetAt: number };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LEAKCHECK_API_KEY || '';
    this.client = axios.create({
      baseURL: process.env.LEAKCHECK_BASE_URL || 'https://leakcheck.io/api/v2',
      timeout: 15000,
    });
    this.rateLimit = { requests: 0, resetAt: Date.now() };
  }

  /**
   * Check if email appears in known breaches
   * @param email Email address to check
   * @returns LeakCheckResult
   */
  async checkEmail(email: string): Promise<LeakCheckResult> {
    try {
      this.checkRateLimit();
      
      const response = await this.client.get('/search', {
        params: {
          query: email,
          type: 'email',
        },
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      const data = response.data;
      return {
        found: data.found || false,
        breaches: data.result?.length || 0,
        sources: data.result?.map((r: any) => r.source) || [],
        lastBreachDate: data.result?.[0]?.date,
        isSensitive: false,
      };
    } catch (error) {
      console.error('LeakCheck email check failed:', error);
      throw new Error('Failed to check email leaks');
    }
  }

  /**
   * Check if username appears in known breaches
   * @param username Username to check
   * @returns LeakCheckResult
   */
  async checkUsername(username: string): Promise<LeakCheckResult> {
    try {
      this.checkRateLimit();
      
      const response = await this.client.get('/search', {
        params: {
          query: username,
          type: 'username',
        },
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      return {
        found: response.data.found || false,
        breaches: response.data.result?.length || 0,
        sources: response.data.result?.map((r: any) => r.source) || [],
        lastBreachDate: response.data.result?.[0]?.date,
        isSensitive: false,
      };
    } catch (error) {
      console.error('LeakCheck username check failed:', error);
      throw new Error('Failed to check username leaks');
    }
  }

  /**
   * Check if domain appears in known breaches
   * @param domain Domain to check
   * @returns LeakCheckResult
   */
  async checkDomain(domain: string): Promise<LeakCheckResult> {
    try {
      this.checkRateLimit();
      
      const response = await this.client.get('/search', {
        params: {
          query: domain,
          type: 'domain',
        },
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      return {
        found: response.data.found || false,
        breaches: response.data.result?.length || 0,
        sources: response.data.result?.map((r: any) => r.source) || [],
        lastBreachDate: response.data.result?.[0]?.date,
        isSensitive: true,
      };
    } catch (error) {
      console.error('LeakCheck domain check failed:', error);
      throw new Error('Failed to check domain leaks');
    }
  }

  private checkRateLimit() {
    const now = Date.now();
    if (now > this.rateLimit.resetAt) {
      this.rateLimit.requests = 0;
      this.rateLimit.resetAt = now + 60000; // Reset every minute
    }
    
    const limit = parseInt(process.env.LEAKCHECK_RATE_LIMIT || '10');
    if (this.rateLimit.requests >= limit) {
      throw new Error('LeakCheck rate limit exceeded');
    }
    
    this.rateLimit.requests++;
  }
}

// ============================================================================
// PWNED PASSWORDS SERVICE
// ============================================================================

export class PwnedPasswordsService {
  private baseUrl = 'https://api.pwnedpasswords.com';

  /**
   * Check if password has been pwned (k-anonymity safe)
   * Uses hash-based lookup - only sends first 5 chars of SHA1
   * @param password Plain text password
   * @returns PasswordCheckResult
   */
  async checkPassword(password: string): Promise<PasswordCheckResult> {
    try {
      // Compute SHA1 hash
      const crypto = require('crypto');
      const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = sha1.substring(0, 5);
      const suffix = sha1.substring(5);

      // Query API with only prefix (k-anonymity)
      const response = await axios.get(`${this.baseUrl}/range/${prefix}`, {
        timeout: 10000,
      });

      // Search for exact hash in response
      const hashes = response.data.split('\n');
      const found = hashes.find((line: string) => {
        const [hashSuffix, count] = line.split(':');
        return hashSuffix === suffix;
      });

      if (found) {
        const [, count] = found.split(':');
        return {
          isPwned: true,
          occurrences: parseInt(count),
        };
      }

      return {
        isPwned: false,
        occurrences: 0,
      };
    } catch (error) {
      console.error('Pwned passwords check failed:', error);
      throw new Error('Failed to check password');
    }
  }
}

// ============================================================================
// IMAGE ANALYSIS SERVICE (Using Hugging Face)
// ============================================================================

export class ImageAnalysisService {
  private hfClient: AxiosInstance;
  private gcvClient: AxiosInstance;
  private provider: 'huggingface' | 'google-cloud';

  constructor(provider: 'huggingface' | 'google-cloud' = 'huggingface') {
    this.provider = provider;

    // Hugging Face setup
    this.hfClient = axios.create({
      baseURL: 'https://api-inference.huggingface.co',
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Google Cloud Vision setup
    this.gcvClient = axios.create({
      baseURL: 'https://vision.googleapis.com/v1',
      timeout: 30000,
    });
  }

  /**
   * Analyze image for NSFW content, deepfakes, and labels
   * @param imageUrl URL to image or base64-encoded image
   * @returns ImageAnalysisResult
   */
  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    if (this.provider === 'huggingface') {
      return this.analyzeImageHuggingFace(imageUrl);
    } else {
      return this.analyzeImageGoogleCloud(imageUrl);
    }
  }

  private async analyzeImageHuggingFace(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      // NSFW Detection
      const nsfw_response = await this.hfClient.post('/models/Falconsai/nsfw_image_detection', {
        inputs: imageUrl,
      });

      // Deepfake Detection
      const deepfake_response = await this.hfClient.post(
        '/models/dima806/deepfake_detection',
        { inputs: imageUrl }
      );

      // Object Detection (for faces)
      const face_response = await this.hfClient.post(
        '/models/dlib-community/face-detection-dlib-rn50',
        { inputs: imageUrl }
      );

      return {
        hasNSFW: this.getNsfw(nsfw_response.data),
        nsfw_score: this.getNsfw_score(nsfw_response.data),
        faces: face_response.data?.length || 0,
        contains_deepfake: this.isDeepfake(deepfake_response.data),
        deepfake_confidence: this.getDeepfakeConfidence(deepfake_response.data),
      };
    } catch (error) {
      console.error('Hugging Face image analysis failed:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private async analyzeImageGoogleCloud(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      const response = await this.gcvClient.post(
        '/images:annotate',
        {
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: 'LABEL_DETECTION' },
                { type: 'FACE_DETECTION' },
                { type: 'SAFE_SEARCH_DETECTION' },
              ],
            },
          ],
        },
        {
          params: {
            key: process.env.GOOGLE_CLOUD_API_KEY,
          },
        }
      );

      const annotations = response.data.responses[0];
      return {
        hasNSFW: annotations.safeSearchAnnotation?.adult === 'VERY_LIKELY',
        labels: annotations.labelAnnotations?.map((l: any) => l.description) || [],
        faces: annotations.faceAnnotations?.length || 0,
        contains_deepfake: false, // GCV doesn't have deepfake detection
      };
    } catch (error) {
      console.error('Google Cloud image analysis failed:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private getNsfw(data: any): boolean {
    if (Array.isArray(data) && data.length > 0) {
      return data.some((item: any) => item.label === 'nsfw' && item.score > 0.5);
    }
    return false;
  }

  private getNsfw_score(data: any): number {
    if (Array.isArray(data) && data.length > 0) {
      const nsfw = data.find((item: any) => item.label === 'nsfw');
      return nsfw?.score || 0;
    }
    return 0;
  }

  private isDeepfake(data: any): boolean {
    if (Array.isArray(data) && data.length > 0) {
      return data.some((item: any) => item.label === 'deepfake' && item.score > 0.5);
    }
    return false;
  }

  private getDeepfakeConfidence(data: any): number {
    if (Array.isArray(data) && data.length > 0) {
      const deepfake = data.find((item: any) => item.label === 'deepfake');
      return deepfake?.score || 0;
    }
    return 0;
  }
}

// ============================================================================
// VIDEO ANALYSIS SERVICE (AWS Rekognition)
// ============================================================================

export class VideoAnalysisService {
  /**
   * Note: Requires AWS SDK v3 setup with credentials
   * This is a placeholder for actual AWS Rekognition integration
   */
  async analyzeVideo(videoPath: string): Promise<VideoAnalysisResult> {
    // Implementation would use AWS SDK for Rekognition
    // For MVP, return mock response or use frame extraction
    throw new Error('Video analysis not implemented yet');
  }
}

// ============================================================================
// REVERSE IMAGE SEARCH SERVICE (SauceNAO - Free)
// ============================================================================

export class ReverseImageSearchService {
  private baseUrl = 'https://saucenao.com/api/lookup';
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
    });
  }

  /**
   * Search for image source using SauceNAO (FREE API)
   * No API key required, 200 requests/day free limit
   * @param imageUrl URL to image
   * @returns ReverseImageSearchResult
   */
  async searchImage(imageUrl: string): Promise<ReverseImageSearchResult> {
    try {
      const response = await this.client.get(this.baseUrl, {
        params: {
          url: imageUrl,
          numres: 5,
          api_key: process.env.SAUCENAO_API_KEY || '', // Optional - higher limits if provided
        },
      });

      const results = response.data.results || [];
      
      if (results.length === 0) {
        return {
          found: false,
          matches: [],
        };
      }

      // Get the best match (first result)
      const bestMatch = results[0];
      const similarity = bestMatch.header?.similarity || 0;

      return {
        found: similarity > 50, // Consider match if > 50% similar
        source_url: bestMatch.data?.ext_urls?.[0],
        similarity_percentage: parseFloat(similarity),
        matches: results.slice(0, 5).map((result: any) => ({
          title: result.data?.title || result.data?.ext_urls?.[0],
          url: result.data?.ext_urls?.[0],
          similarity: parseFloat(result.header?.similarity || 0),
        })),
      };
    } catch (error) {
      console.error('SauceNAO reverse search failed:', error);
      // Return safe default instead of throwing
      return {
        found: false,
        matches: [],
      };
    }
  }
}

// ============================================================================
// GOOGLE CLOUD VISION SERVICE (Dedicated)
// ============================================================================

export class GoogleCloudVisionService {
  private client: AxiosInstance;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    
    // Use service account credentials if available
    const keyPath = process.env.GOOGLE_CLOUD_API_KEY_PATH;
    let apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey && keyPath) {
      try {
        const fs = require('fs');
        const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        // For service account, we'd need to generate access token
        // For now, use API key approach if available
      } catch (error) {
        console.warn('Could not load Google Cloud key file:', error);
      }
    }

    this.client = axios.create({
      baseURL: 'https://vision.googleapis.com/v1',
      timeout: 30000,
    });
  }

  /**
   * Analyze image using Google Cloud Vision API
   * Free tier: 1,000 images/month
   * @param imageUrl URL to image
   * @returns ImageAnalysisResult
   */
  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
      
      if (!apiKey && !process.env.GOOGLE_CLOUD_API_KEY_PATH) {
        throw new Error('Google Cloud API key not configured');
      }

      const response = await this.client.post(
        '/images:annotate',
        {
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'FACE_DETECTION', maxResults: 10 },
                { type: 'SAFE_SEARCH_DETECTION' },
                { type: 'OBJECT_LOCALIZATION' },
              ],
            },
          ],
        },
        {
          params: apiKey ? { key: apiKey } : {},
        }
      );

      const annotations = response.data.responses?.[0];
      
      if (!annotations) {
        throw new Error('No annotations returned from Vision API');
      }

      const safeSearch = annotations.safeSearchAnnotation || {};
      const nsfw = 
        safeSearch.adult === 'VERY_LIKELY' || 
        safeSearch.racy === 'VERY_LIKELY' ||
        safeSearch.violence === 'VERY_LIKELY';

      return {
        hasNSFW: nsfw,
        nsfw_score: nsfw ? 0.9 : 0.1,
        labels: annotations.labelAnnotations?.map((l: any) => l.description) || [],
        faces: annotations.faceAnnotations?.length || 0,
        contains_deepfake: false, // GCV doesn't detect deepfakes
        moderation_labels: this.getModerationLabels(safeSearch),
      };
    } catch (error) {
      console.error('Google Cloud Vision analysis failed:', error);
      throw new Error('Failed to analyze image with Google Cloud Vision');
    }
  }

  private getModerationLabels(safeSearch: any): string[] {
    const labels: string[] = [];
    if (safeSearch.adult === 'VERY_LIKELY') labels.push('adult');
    if (safeSearch.racy === 'VERY_LIKELY') labels.push('racy');
    if (safeSearch.violence === 'VERY_LIKELY') labels.push('violence');
    if (safeSearch.medical === 'VERY_LIKELY') labels.push('medical');
    return labels;
  }
}

// ============================================================================
// FACTORY / MAIN SERVICE
// ============================================================================

export class ExternalAPIService {
  leakCheck: LeakCheckService;
  pwnedPasswords: PwnedPasswordsService;
  imageAnalysis: ImageAnalysisService;
  googleCloudVision: GoogleCloudVisionService;
  reverseImageSearch: ReverseImageSearchService;

  constructor() {
    this.leakCheck = new LeakCheckService();
    this.pwnedPasswords = new PwnedPasswordsService();
    this.imageAnalysis = new ImageAnalysisService('huggingface');
    this.googleCloudVision = new GoogleCloudVisionService();
    this.reverseImageSearch = new ReverseImageSearchService();
  }

  /**
   * Comprehensive leak check combining multiple sources
   */
  async fullLeakCheck(email: string): Promise<{
    leakcheck: LeakCheckResult;
    hibp: PasswordCheckResult | null;
    combined: { found: boolean; totalBreaches: number };
  }> {
    const leakcheck_result = await this.leakCheck.checkEmail(email);
    
    return {
      leakcheck: leakcheck_result,
      hibp: null,
      combined: {
        found: leakcheck_result.found,
        totalBreaches: leakcheck_result.breaches,
      },
    };
  }

  /**
   * Comprehensive image analysis combining Hugging Face + Google Cloud Vision
   */
  async comprehensiveImageAnalysis(
    imageUrl: string,
    useGoogleCloud: boolean = false
  ): Promise<{
    huggingface: ImageAnalysisResult;
    googlecloud?: ImageAnalysisResult;
    reverseSearch?: ReverseImageSearchResult;
  }> {
    const results: any = {
      huggingface: await this.imageAnalysis.analyzeImage(imageUrl),
    };

    // Try Google Cloud Vision if configured and requested
    if (useGoogleCloud) {
      try {
        results.googlecloud = await this.googleCloudVision.analyzeImage(imageUrl);
      } catch (error) {
        console.warn('Google Cloud Vision analysis failed, skipping');
      }
    }

    // Always try reverse image search (free)
    try {
      results.reverseSearch = await this.reverseImageSearch.searchImage(imageUrl);
    } catch (error) {
      console.warn('Reverse image search failed, skipping');
    }

    return results;
  }
}

export default new ExternalAPIService();
