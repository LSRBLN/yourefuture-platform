/**
 * TrustShield API Client (Frontend)
 * Wrapper for leak check, image analysis, and password strength APIs
 */

import { requestApi } from './http-client';

export interface LeakCheckResult {
  email?: {
    found: boolean;
    breaches: number;
    sources: string[];
  };
  password?: {
    isPwned: boolean;
    occurrences: number;
  };
  summary: {
    found: boolean;
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
    message: string;
  };
}

export interface ImageAnalysisResult {
  hasNSFW: boolean;
  nsfw_score?: number;
  labels?: string[];
  faces: number;
  contains_deepfake: boolean;
  deepfake_confidence?: number;
}

export interface PasswordStrengthResult {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
  isPwned: boolean;
  suggestions: string[];
}

class APIClient {
  /**
   * Check if email appears in breaches
   */
  async checkEmailLeak(email: string): Promise<LeakCheckResult | null> {
    const payload = await requestApi<LeakCheckResult>('/checks/leak', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return payload;
  }

  /**
   * Check password strength and if it's been pwned
   */
  async checkPasswordStrength(password: string): Promise<PasswordStrengthResult | null> {
    const payload = await requestApi<PasswordStrengthResult>('/checks/password-strength', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return payload;
  }

  /**
   * Analyze image for deepfakes, NSFW content, etc
   */
  async analyzeImage(
    imageUrl: string | File
  ): Promise<ImageAnalysisResult | null> {
    let body: string;

    if (typeof imageUrl === 'string') {
      body = JSON.stringify({ imageUrl });
    } else {
      const base64 = await this.fileToBase64(imageUrl);
      body = JSON.stringify({
        imageBase64: base64.split(',')[1],
      });
    }

    const payload = await requestApi<ImageAnalysisResult>('/checks/image', {
      method: 'POST',
      body,
    });
    return payload;
  }

  /**
   * Comprehensive check (email + image)
   */
  async comprehensiveCheck(email: string, imageUrl?: string): Promise<{
    leaks: LeakCheckResult | null;
    image: ImageAnalysisResult | null;
  } | null> {
    const body: Record<string, string> = {};
    if (email) body.email = email;
    if (imageUrl) body.imageUrl = imageUrl;

    const payload = await requestApi<{ leaks: LeakCheckResult | null; image: ImageAnalysisResult | null }>('/checks/comprehensive', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return payload;
  }

  /**
   * Helper: Convert File to Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      return await requestApi<{ status: 'ok' | 'error'; message: string }>('/health', {}, false);
    } catch {
      return { status: 'error', message: 'API unreachable' };
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;
