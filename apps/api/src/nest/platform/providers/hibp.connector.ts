/**
 * Have I Been Pwned (HIBP) Leak Provider Connector
 *
 * Checks if an email address has been compromised in known data breaches.
 * API: https://haveibeenpwned.com/api/v3
 *
 * Rate Limit: 1 request/sec (with API key)
 * Cost: Requires paid subscription
 */

import type { BreachResult, ILeakProvider } from '@trustshield/core';

interface HibpBreachPayload {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  LogoPath: string;
}

export class HibpConnector implements ILeakProvider {
  name = 'HIBP';
  enabled: boolean;

  private apiKey: string;
  private baseUrl = 'https://haveibeenpwned.com/api/v3';
  private userAgent = 'TrustShield/1.0';
  private rateLimitDelay = 1100; // 1.1 sec to stay under rate limit

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HIBP_API_KEY || '';
    this.enabled = !!this.apiKey;
  }

  /**
   * Search for breaches containing an email
   */
  async searchEmail(email: string): Promise<BreachResult[]> {
    if (!this.enabled) {
      console.warn('[HIBP] Connector disabled (missing API key)');
      return [];
    }

    try {
      const url = `${this.baseUrl}/breachedaccount/${encodeURIComponent(email)}`;
      const headers = {
        'User-Agent': this.userAgent,
        'hibp-api-key': this.apiKey,
      };

      const response = await fetch(url, { headers });

      if (response.status === 404) {
        // No breaches found
        return [];
      }

      if (response.status === 429) {
        throw new Error('HIBP API rate limit exceeded');
      }

      if (!response.ok) {
        throw new Error(`HIBP API error: ${response.status} ${response.statusText}`);
      }

      const breaches: HibpBreachPayload[] = await response.json();
      return breaches.map((breach) => this.mapBreachResult(breach));
    } catch (error) {
      console.error('[HIBP] Error searching email:', error);
      throw error;
    }
  }

  /**
   * Search for breaches by username
   * Note: HIBP primarily works with emails, not usernames
   * This is a fallback that returns empty
   */
  async searchUsername(username: string): Promise<BreachResult[]> {
    console.info('[HIBP] searchUsername not directly supported for HIBP');
    return [];
  }

  /**
   * Search for breaches by phone
   * Note: HIBP doesn't support phone number searches
   */
  async searchPhone(phone: string): Promise<BreachResult[]> {
    console.info('[HIBP] searchPhone not supported for HIBP');
    return [];
  }

  /**
   * Search for breaches by domain
   * Note: Requires special endpoint (not available in v3 API with standard key)
   */
  async searchDomain(domain: string): Promise<BreachResult[]> {
    console.info('[HIBP] searchDomain limited support (enterprise only)');
    return [];
  }

  /**
   * Health check HIBP API availability
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/breachedaccount/test@example.com`, {
        headers: {
          'User-Agent': this.userAgent,
          'hibp-api-key': this.apiKey,
        },
      });

      // 404 is expected for this test email; anything else besides 429 is fine
      return response.status !== 429;
    } catch (error) {
      console.error('[HIBP] Health check failed:', error);
      return false;
    }
  }

  /**
   * Map HIBP breach response to internal BreachResult format
   */
  private mapBreachResult(breach: HibpBreachPayload): BreachResult {
    return {
      providerName: 'HIBP',
      breachName: breach.Name,
      breachDate: breach.BreachDate,
      dataClasses: breach.DataClasses || [],
      description: breach.Description,
      isVerified: breach.IsVerified,
      isRetired: breach.IsRetired,
      isFabricated: breach.IsFabricated,
      sourceUrl: `https://haveibeenpwned.com/api/v3/breachedaccount/${breach.Name}`,
    };
  }
}
