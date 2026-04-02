/**
 * TrustShield API Client (Frontend)
 * Wrapper for leak check, image analysis, and password strength APIs
 */

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Check if email appears in breaches
   */
  async checkEmailLeak(email: string): Promise<LeakCheckResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/checks/leak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to check email');
      }

      return data.data;
    } catch (error) {
      console.error('Email leak check failed:', error);
      throw error;
    }
  }

  /**
   * Check password strength and if it's been pwned
   */
  async checkPasswordStrength(password: string): Promise<PasswordStrengthResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/checks/password-strength`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to check password');
      }

      return data.data;
    } catch (error) {
      console.error('Password strength check failed:', error);
      throw error;
    }
  }

  /**
   * Analyze image for deepfakes, NSFW content, etc
   */
  async analyzeImage(
    imageUrl: string | File
  ): Promise<ImageAnalysisResult | null> {
    try {
      let body: any;

      if (typeof imageUrl === 'string') {
        // URL provided
        body = JSON.stringify({ imageUrl });
      } else {
        // File provided – convert to base64
        const base64 = await this.fileToBase64(imageUrl);
        body = JSON.stringify({
          imageBase64: base64.split(',')[1], // Remove data:image/...;base64, prefix
        });
      }

      const response = await fetch(`${this.baseUrl}/checks/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      return data.data;
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  }

  /**
   * Comprehensive check (email + image)
   */
  async comprehensiveCheck(email: string, imageUrl?: string): Promise<{
    leaks: LeakCheckResult | null;
    image: ImageAnalysisResult | null;
  } | null> {
    try {
      const body: any = {};
      if (email) body.email = email;
      if (imageUrl) body.imageUrl = imageUrl;

      const response = await fetch(`${this.baseUrl}/checks/comprehensive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to run comprehensive check');
      }

      return data.data;
    } catch (error) {
      console.error('Comprehensive check failed:', error);
      throw error;
    }
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
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { status: 'error', message: 'API unreachable' };
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;
