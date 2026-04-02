/**
 * LeakCheck.io Leak Provider Connector
 *
 * Checks for email, username, domain, and other data in known breaches.
 * API: https://leakcheck.io/api
 *
 * Rate Limit: Variable (depends on plan)
 * Cost: Subscription-based
 */

import type { BreachResult, ILeakProvider } from '@trustshield/core';

interface LeakCheckApiResponse {
  public: boolean;
  sources: LeakCheckSource[];
}

interface LeakCheckSource {
  source: string;
  email?: string;
  username?: string;
  password?: string;
  lastSeen?: string;
}

export class LeakCheckConnector implements ILeakProvider {
  name = 'LeakCheck';
  enabled: boolean;

  private apiKey: string;
  private baseUrl = 'https://leakcheck.io/api';
  private rateLimitDelay = 500; // 500ms between requests

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LEAKCHECK_API_KEY || '';
    this.enabled = !!this.apiKey;
  }

  /**
   * Search for breaches containing an email
   */
  async searchEmail(email: string): Promise<BreachResult[]> {
    if (!this.enabled) {
      console.warn('[LeakCheck] Connector disabled (missing API key)');
      return [];
    }

    try {
      const results = await this.query('email', email);
      return results.map((source) => this.mapSourceToBreachResult(source));
    } catch (error) {
      console.error('[LeakCheck] Error searching email:', error);
      throw error;
    }
  }

  /**
   * Search for breaches containing a username
   */
  async searchUsername(username: string): Promise<BreachResult[]> {
    if (!this.enabled) {
      console.warn('[LeakCheck] Connector disabled');
      return [];
    }

    try {
      const results = await this.query('username', username);
      return results.map((source) => this.mapSourceToBreachResult(source));
    } catch (error) {
      console.error('[LeakCheck] Error searching username:', error);
      throw error;
    }
  }

  /**
   * Search for breaches containing a phone
   * Note: LeakCheck may not support phone directly; depends on plan
   */
  async searchPhone(phone: string): Promise<BreachResult[]> {
    console.info('[LeakCheck] Phone search may not be available on all plans');
    return [];
  }

  /**
   * Search for breaches containing a domain
   */
  async searchDomain(domain: string): Promise<BreachResult[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const results = await this.query('domain', domain);
      return results.map((source) => this.mapSourceToBreachResult(source));
    } catch (error) {
      console.error('[LeakCheck] Error searching domain:', error);
      throw error;
    }
  }

  /**
   * Health check LeakCheck API availability
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/check?key=${this.apiKey}&check=test@example.com&type=email`, {
        method: 'GET',
      });

      return response.ok || response.status === 404; // 404 is OK (no data found)
    } catch (error) {
      console.error('[LeakCheck] Health check failed:', error);
      return false;
    }
  }

  /**
   * Generic query to LeakCheck API
   */
  private async query(type: 'email' | 'username' | 'domain', value: string): Promise<LeakCheckSource[]> {
    const url = new URL(`${this.baseUrl}/check`);
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('check', value);
    url.searchParams.append('type', type);

    const response = await fetch(url.toString(), { method: 'GET' });

    if (response.status === 404) {
      // No results found
      return [];
    }

    if (response.status === 429) {
      throw new Error('LeakCheck API rate limit exceeded');
    }

    if (!response.ok) {
      throw new Error(`LeakCheck API error: ${response.status} ${response.statusText}`);
    }

    const data: LeakCheckApiResponse = await response.json();
    return data.sources || [];
  }

  /**
   * Map LeakCheck source to internal BreachResult format
   */
  private mapSourceToBreachResult(source: LeakCheckSource): BreachResult {
    return {
      providerName: 'LeakCheck',
      breachName: source.source,
      breachDate: source.lastSeen || new Date().toISOString().split('T')[0],
      dataClasses: this.inferDataClasses(source),
      description: `Data found in ${source.source} breach`,
      isVerified: true,
      sourceUrl: `https://leakcheck.io`,
    };
  }

  /**
   * Infer what data classes are exposed based on available fields
   */
  private inferDataClasses(source: LeakCheckSource): string[] {
    const classes = [];
    if (source.email) classes.push('Email');
    if (source.username) classes.push('Username');
    if (source.password) classes.push('Passwords');
    return classes.length > 0 ? classes : ['Other'];
  }
}
