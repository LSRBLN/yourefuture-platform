/**
 * Checks Controller
 * Endpoints für Leak-Checks und Image/Video Analysis
 * All APIs are FREE: LeakCheck, HIBP, Hugging Face, Google Cloud Vision, SauceNAO
 * Extended APIs: DeHashed, Google Search, SecurityTrails, Pastebin
 */

import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { ExternalAPIService } from '../lib/external-apis';
import { LeakCheckResult, PasswordCheckResult, ImageAnalysisResult, ReverseImageSearchResult } from '../lib/external-apis';
import {
  DeHashedService,
  GoogleSearchBreachService,
  SecurityTrailsService,
  PastebinAggregatorService,
  ComprehensiveBreachAggregator,
  ComprehensiveBreachReport,
} from '../lib/extended-breach-apis';
import {
  FaceOnLiveService,
  YandexImagesService,
  CompreFaceService,
  VideoFrameExtractorService,
  ComprehensiveFaceReverseSearchAggregator,
} from '../lib/face-reverse-search-apis';

export interface LeakCheckRequest {
  email?: string;
  username?: string;
  password?: string;
  domain?: string;
}

export interface ImageAnalysisRequest {
  imageUrl: string;
  imageBase64?: string;
}

export interface LeakCheckResponse {
  success: boolean;
  data?: {
    email?: LeakCheckResult;
    password?: PasswordCheckResult;
    summary: {
      found: boolean;
      riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
      message: string;
    };
  };
  error?: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  data?: ImageAnalysisResult;
  error?: string;
}

@Controller('api/v1/checks')
export class ChecksController {
  private externalAPI = new ExternalAPIService();
  private deHashed = new DeHashedService();
  private googleSearch = new GoogleSearchBreachService();
  private securityTrails = new SecurityTrailsService();
  private pastebin = new PastebinAggregatorService();
  private comprehensiveAggregator = new ComprehensiveBreachAggregator();
  
  // Face Reverse Search Services
  private faceOnLive = new FaceOnLiveService();
  private yandex = new YandexImagesService();
  private compreface = new CompreFaceService();
  private videoExtractor = new VideoFrameExtractorService();
  private facereverseAggregator = new ComprehensiveFaceReverseSearchAggregator();

  /**
   * POST /api/v1/checks/leak
   * Check if email/password appears in known breaches
   */
  @Post('leak')
  async checkLeak(@Body() body: LeakCheckRequest): Promise<LeakCheckResponse> {
    try {
      if (!body.email && !body.password && !body.username && !body.domain) {
        throw new BadRequestException('At least one of email, password, username, or domain required');
      }

      const response: LeakCheckResponse = {
        success: true,
        data: {
          summary: {
            found: false,
            riskLevel: 'safe',
            message: 'No leaks detected',
          },
        },
      };

      let hasBreaches = false;

      // Check Email
      if (body.email) {
        try {
          response.data!.email = await this.externalAPI.leakCheck.checkEmail(body.email);
          if (response.data!.email.found) {
            hasBreaches = true;
          }
        } catch (error) {
          console.error('Email check failed:', error);
          // Don't fail entire request, just skip this check
        }
      }

      // Check Password
      if (body.password) {
        try {
          response.data!.password = await this.externalAPI.pwnedPasswords.checkPassword(body.password);
          if (response.data!.password.isPwned) {
            hasBreaches = true;
          }
        } catch (error) {
          console.error('Password check failed:', error);
        }
      }

      // Update summary based on findings
      if (hasBreaches) {
        const emailBreaches = response.data!.email?.breaches || 0;
        const pwdOccurrences = response.data!.password?.occurrences || 0;

        if (emailBreaches > 0 || pwdOccurrences > 10) {
          response.data!.summary.riskLevel = 'critical';
          response.data!.summary.message = `⚠️ CRITICAL: Email found in ${emailBreaches} breaches, password appeared ${pwdOccurrences} times`;
        } else if (pwdOccurrences > 0) {
          response.data!.summary.riskLevel = 'high';
          response.data!.summary.message = `⚠️ WARNING: Password appeared ${pwdOccurrences} times in breaches`;
        } else {
          response.data!.summary.riskLevel = 'high';
          response.data!.summary.message = '⚠️ WARNING: Email found in data breaches';
        }
        response.data!.summary.found = true;
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Leak check failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/image
   * Analyze image for NSFW, deepfakes, faces
   */
  @Post('image')
  async analyzeImage(@Body() body: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    try {
      if (!body.imageUrl && !body.imageBase64) {
        throw new BadRequestException('imageUrl or imageBase64 required');
      }

      // Use imageUrl if provided, otherwise convert base64 to data URL
      const imageInput = body.imageUrl || `data:image/jpeg;base64,${body.imageBase64}`;

      const result = await this.externalAPI.imageAnalysis.analyzeImage(imageInput);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Image analysis failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/comprehensive
   * Full leak check + image analysis in one call
   */
  @Post('comprehensive')
  async comprehensiveCheck(
    @Body() body: { email?: string; imageUrl?: string }
  ): Promise<{
    success: boolean;
    data?: {
      leaks: LeakCheckResponse['data'];
      image?: ImageAnalysisResult;
    };
    error?: string;
  }> {
    try {
      const results: any = {
        leaks: null,
        image: null,
      };

      // Run leak check if email provided
      if (body.email) {
        const leakResult = await this.checkLeak({ email: body.email });
        results.leaks = leakResult.data;
      }

      // Run image analysis if imageUrl provided
      if (body.imageUrl) {
        const imageResult = await this.analyzeImage({ imageUrl: body.imageUrl });
        results.image = imageResult.data;
      }

      return {
        success: true,
        data: results,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Comprehensive check failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/password-strength
   * Check password strength + if pwned
   */
  @Post('password-strength')
  async checkPasswordStrength(@Body() body: { password: string }): Promise<{
    success: boolean;
    data?: {
      strength: 'weak' | 'fair' | 'good' | 'strong';
      score: number;
      isPwned: boolean;
      suggestions: string[];
    };
    error?: string;
  }> {
    try {
      if (!body.password || body.password.length < 1) {
        throw new BadRequestException('Password required');
      }

      const pwd = body.password;
      let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
      let score = 0;
      const suggestions: string[] = [];

      // Length check
      if (pwd.length >= 8) score += 20;
      if (pwd.length >= 12) score += 20;
      if (pwd.length >= 16) score += 10;

      // Complexity checks
      if (/[a-z]/.test(pwd)) score += 15;
      if (/[A-Z]/.test(pwd)) score += 15;
      if (/\d/.test(pwd)) score += 15;
      if (/[^a-zA-Z\d]/.test(pwd)) score += 15;

      // Determine strength
      if (score >= 80) strength = 'strong';
      else if (score >= 60) strength = 'good';
      else if (score >= 40) strength = 'fair';

      // Suggestions
      if (pwd.length < 12) suggestions.push('Use at least 12 characters');
      if (!/[A-Z]/.test(pwd)) suggestions.push('Add uppercase letters');
      if (!/\d/.test(pwd)) suggestions.push('Add numbers');
      if (!/[^a-zA-Z\d]/.test(pwd)) suggestions.push('Add special characters (!@#$%)');

      // Check if pwned
      let isPwned = false;
      try {
        const pwnedResult = await this.externalAPI.pwnedPasswords.checkPassword(pwd);
        isPwned = pwnedResult.isPwned;
        if (isPwned) {
          suggestions.push(`⚠️ This password was found in ${pwnedResult.occurrences} breaches. Choose a different one!`);
        }
      } catch (error) {
        console.error('Pwned check failed:', error);
      }

      return {
        success: true,
        data: {
          strength,
          score,
          isPwned,
          suggestions,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password strength check failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/reverse-search
   * Find where image appears online (SauceNAO - FREE)
   */
  @Post('reverse-search')
  async reverseImageSearch(@Body() body: { imageUrl: string }): Promise<{
    success: boolean;
    data?: ReverseImageSearchResult;
    error?: string;
  }> {
    try {
      if (!body.imageUrl) {
        throw new BadRequestException('imageUrl required');
      }

      const result = await this.externalAPI.reverseImageSearch.searchImage(body.imageUrl);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Reverse search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/image-advanced
   * Comprehensive image analysis with multiple providers
   * Hugging Face + Google Cloud Vision + Reverse Search (all FREE)
   */
  @Post('image-advanced')
  async imageAnalysisAdvanced(@Body() body: { imageUrl: string; includeGoogleCloud?: boolean }): Promise<{
    success: boolean;
    data?: {
      huggingface: ImageAnalysisResult;
      googlecloud?: ImageAnalysisResult;
      reverseSearch?: ReverseImageSearchResult;
      summary: {
        isNsfw: boolean;
        isDeepfake: boolean;
        foundOnline: boolean;
        riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
        message: string;
      };
    };
    error?: string;
  }> {
    try {
      if (!body.imageUrl) {
        throw new BadRequestException('imageUrl required');
      }

      const results = await this.externalAPI.comprehensiveImageAnalysis(
        body.imageUrl,
        body.includeGoogleCloud || false
      );

      const hf = results.huggingface;
      const gv = results.googlecloud;
      const rs = results.reverseSearch;

      // Determine risk level
      let riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe' = 'safe';
      let message = 'Image appears safe';

      if ((hf.contains_deepfake && hf.deepfake_confidence! > 0.8) || (gv?.hasNSFW)) {
        riskLevel = 'critical';
        message = '🚨 CRITICAL: Image may be deepfake or explicit content';
      } else if (hf.hasNSFW || rs?.found) {
        riskLevel = 'high';
        message = '⚠️ WARNING: Image contains unsafe content or found online';
      } else if (hf.faces > 0 && rs?.found) {
        riskLevel = 'medium';
        message = '⚠️ Faces detected and image found online - verify source';
      }

      return {
        success: true,
        data: {
          huggingface: hf,
          googlecloud: gv,
          reverseSearch: rs,
          summary: {
            isNsfw: hf.hasNSFW || gv?.hasNSFW || false,
            isDeepfake: hf.contains_deepfake || false,
            foundOnline: rs?.found || false,
            riskLevel,
            message,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Advanced image analysis failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/dehashed
   * Search DeHashed breach database (FREE TRIAL: 5 lookups/day)
   */
  @Post('dehashed')
  async dehashedSearch(@Body() body: { email?: string; username?: string; domain?: string }) {
    if (!body.email && !body.username && !body.domain) {
      throw new BadRequestException('Email, username, or domain required');
    }

    try {
      let result;

      if (body.email) {
        result = await this.deHashed.searchEmail(body.email);
      } else if (body.username) {
        result = await this.deHashed.searchUsername(body.username);
      } else {
        result = await this.deHashed.searchDomain(body.domain!);
      }

      return {
        success: true,
        data: {
          service: 'DeHashed',
          query: body.email || body.username || body.domain,
          result,
          note: 'DeHashed provides access to compiled breach databases with actual credentials',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'DeHashed search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/web-search
   * Search the web for breach/leak mentions (FREE: 100 queries/day with Google Custom Search)
   */
  @Post('web-search')
  async webBreachSearch(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email required');
    }

    try {
      const result = await this.googleSearch.searchForLeaks(body.email);

      return {
        success: true,
        data: {
          service: 'Google Custom Search',
          query: body.email,
          found: result.found,
          sources: result.sources,
          note: 'Searches publicly indexed web pages for breach mentions',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Web search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/domain-intel
   * Get domain breach intelligence from SecurityTrails (FREE: 50 requests/month)
   */
  @Post('domain-intel')
  async domainIntelligence(@Body() body: { domain: string }) {
    if (!body.domain) {
      throw new BadRequestException('Domain required');
    }

    try {
      const breaches = await this.securityTrails.getDomainBreaches(body.domain);
      const subdomains = await this.securityTrails.getSubdomainBreach(body.domain);

      return {
        success: true,
        data: {
          service: 'SecurityTrails',
          domain: body.domain,
          breaches,
          subdomains,
          note: 'Domain breach history and compromised subdomains',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Domain intelligence lookup failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/pastebin-search
   * Search public pastebin data for leaked credentials (FREE)
   */
  @Post('pastebin-search')
  async pastebinSearch(@Body() body: { email?: string; username?: string }) {
    if (!body.email && !body.username) {
      throw new BadRequestException('Email or username required');
    }

    try {
      let result;

      if (body.email) {
        result = await this.pastebin.searchPublicPastes(body.email);
      } else {
        result = await this.pastebin.searchByUsername(body.username!);
      }

      return {
        success: true,
        data: {
          service: 'Pastebin',
          query: body.email || body.username,
          ...result,
          note: 'Searches public pastebin data for credential leaks',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Pastebin search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/comprehensive-breach-report
   * Comprehensive search across ALL free breach databases
   * Combines: LeakCheck, DeHashed, Google Search, Pastebin, HIBP
   */
  @Post('comprehensive-breach-report')
  async comprehensiveBreachReport(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email required');
    }

    try {
      // Get from LeakCheck
      const leakcheckResult = await this.externalAPI.leakCheck.checkEmail(body.email);

      // Get from comprehensive aggregator (DeHashed, Google, Pastebin, etc.)
      const aggregatedResult = await this.comprehensiveAggregator.comprehensiveBreachSearch(
        body.email
      );

      // Combine results
      const totalBreaches = aggregatedResult.total_breaches + leakcheckResult.breaches;

      return {
        success: true,
        data: {
          email: body.email,
          summary: {
            total_breaches: totalBreaches,
            risk_level: aggregatedResult.risk_level,
            sources_affected: [
              ...new Set([
                ...aggregatedResult.sources_affected,
                ...leakcheckResult.sources,
              ]),
            ],
          },
          leakcheck_result: {
            found: leakcheckResult.found,
            breaches: leakcheckResult.breaches,
            sources: leakcheckResult.sources,
          },
          aggregated_result: aggregatedResult,
          recommendations: aggregatedResult.recommendations,
          message: `Email found in ${totalBreaches} breaches. Risk level: ${aggregatedResult.risk_level}`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Comprehensive breach report failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/face-reverse-search
   * Search entire internet for a person's face
   * Finds: Images, Videos, Deepfakes, NSFW content
   * FREE APIs: FaceOnLive + Yandex
   */
  @Post('face-reverse-search')
  async faceReverseSearch(
    @Body() body: { imageUrl?: string; imageBase64?: string; checkDeepfakes?: boolean; checkNSFW?: boolean }
  ) {
    if (!body.imageUrl && !body.imageBase64) {
      throw new BadRequestException('Image URL or base64 required');
    }

    try {
      const result = await this.facereverseAggregator.comprehensiveFaceSearch(
        body.imageUrl || '',
        body.imageBase64,
        body.checkDeepfakes !== false,
        body.checkNSFW !== false
      );

      return {
        success: true,
        data: {
          service: 'Comprehensive Face Reverse Search',
          search_type: 'Internet-Scale Face Search',
          sources: ['FaceOnLive', 'Yandex Images'],
          ...result,
          message: `Found ${result.total_matches} potential matches. Risk level: ${result.risk_assessment.overall_risk}`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Face reverse search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/faceonlive-search
   * Direct FaceOnLive search (Free unlimited basic tier)
   */
  @Post('faceonlive-search')
  async faceOnLiveSearch(
    @Body() body: { imageUrl?: string; imageBase64?: string }
  ) {
    if (!body.imageUrl && !body.imageBase64) {
      throw new BadRequestException('Image URL or base64 required');
    }

    try {
      const result = await this.faceOnLive.searchFace(body.imageUrl || '', body.imageBase64);

      return {
        success: true,
        data: {
          service: 'FaceOnLive',
          ...result,
          note: 'FaceOnLive provides unlimited basic searches, free tier',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'FaceOnLive search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/yandex-reverse-search
   * Yandex Images reverse search (Free)
   * Often better than Google for face detection
   */
  @Post('yandex-reverse-search')
  async yandexReverseSearch(@Body() body: { imageUrl: string }) {
    if (!body.imageUrl) {
      throw new BadRequestException('Image URL required');
    }

    try {
      const result = await this.yandex.searchFace(body.imageUrl);

      return {
        success: true,
        data: {
          service: 'Yandex Images',
          ...result,
          note: 'Yandex often finds face matches better than Google',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Yandex search failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/compreface-extract-embedding
   * Extract face embedding (requires CompreFace self-hosted)
   * Returns face confidence + bounding box + optional embedding
   */
  @Post('compreface-extract-embedding')
  async compreFaceExtract(@Body() body: { imageUrl: string }) {
    if (!body.imageUrl) {
      throw new BadRequestException('Image URL required');
    }

    try {
      const result = await this.compreface.extractFaceEmbedding(body.imageUrl);

      return {
        success: true,
        data: {
          service: 'CompreFace (Self-hosted)',
          ...result,
          note: 'Requires CompreFace Docker instance running locally',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'CompreFace extraction failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/video-frame-extract
   * Extract frames from video URL for face analysis
   * Requires FFmpeg installed on system
   */
  @Post('video-frame-extract')
  async extractVideoFrames(@Body() body: { videoUrl: string; fps?: number }) {
    if (!body.videoUrl) {
      throw new BadRequestException('Video URL required');
    }

    try {
      const fps = body.fps || 1;
      const frames = await this.videoExtractor.extractFrames(body.videoUrl, undefined, fps);
      const duration = await this.videoExtractor.getVideoDuration(body.videoUrl);

      return {
        success: true,
        data: {
          service: 'Video Frame Extractor',
          videoUrl: body.videoUrl,
          frames_extracted: frames.length,
          frame_paths: frames.slice(0, 10), // Return first 10
          duration_seconds: duration,
          extraction_rate_fps: fps,
          note: 'Requires FFmpeg installed on system',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Frame extraction failed',
      };
    }
  }

  /**
   * POST /api/v1/checks/face-exposure-report
   * Comprehensive face exposure report
   * Combines all face search sources + deepfake + NSFW analysis
   * This is the MAIN endpoint for users uploading their own face
   */
  @Post('face-exposure-report')
  async faceExposureReport(
    @Body()
    body: {
      imageUrl?: string;
      imageBase64?: string;
      checkDeepfakes?: boolean;
      checkNSFW?: boolean;
      personName?: string;
    }
  ) {
    if (!body.imageUrl && !body.imageBase64) {
      throw new BadRequestException('Image URL or base64 required');
    }

    try {
      // Main search
      const faceSearchResult = await this.facereverseAggregator.comprehensiveFaceSearch(
        body.imageUrl || '',
        body.imageBase64,
        body.checkDeepfakes !== false,
        body.checkNSFW !== false
      );

      // Additional analysis on key findings
      let deepfakeAnalysis = null;
      let nsfwAnalysis = null;

      // If deepfakes found, get more details from Hugging Face
      if (faceSearchResult.deepfake_count > 0) {
        try {
          const topMatch = faceSearchResult.matches[0];
          if (topMatch.imageUrl) {
            deepfakeAnalysis = await this.externalAPI.imageAnalysis.analyzeImage(topMatch.imageUrl);
          }
        } catch (e) {
          console.warn('Deepfake detail analysis failed');
        }
      }

      // If NSFW content found
      if (faceSearchResult.nsfw_count > 0) {
        nsfwAnalysis = {
          count: faceSearchResult.nsfw_count,
          type: 'Non-consensual intimate images detected',
          action: 'Consider DMCA removal / legal action',
        };
      }

      return {
        success: true,
        data: {
          person: body.personName || 'Unknown',
          search_summary: {
            total_images: faceSearchResult.total_matches,
            videos_found: faceSearchResult.video_matches,
            deepfakes: faceSearchResult.deepfake_count,
            nsfw_content: faceSearchResult.nsfw_count,
          },
          risk_assessment: faceSearchResult.risk_assessment,
          top_matches: faceSearchResult.matches.slice(0, 10),
          deepfake_analysis: deepfakeAnalysis,
          nsfw_analysis: nsfwAnalysis,
          recommendations: faceSearchResult.recommendations,
          next_steps: [
            'Review all matches carefully',
            'Report non-consensual content to platforms',
            'Consider DMCA takedowns for infringing content',
            'Monitor for new matches periodically',
            'Document evidence for potential legal action',
          ],
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Face exposure report failed',
      };
    }
  }
}
