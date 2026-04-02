/**
 * Checks Controller
 * Endpoints für Leak-Checks und Image/Video Analysis
 */

import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { ExternalAPIService } from '../lib/external-apis';
import { LeakCheckResult, PasswordCheckResult, ImageAnalysisResult } from '../lib/external-apis';

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
}
