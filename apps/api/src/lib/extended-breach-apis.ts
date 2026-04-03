/**
 * Extended Breach Detection APIs
 * DeHashed, Google Search, SecurityTrails, Pastebin Integration
 * All FREE tier or trials (no cost for 1-2 weeks)
 */

import axios from 'axios';

// ============================================================================
// INTERFACES
// ============================================================================

export interface DeHashedResult {
  credentials_leaked: boolean;
  total_breach_count: number;
  password_included: boolean;
  breach_sources: string[];
  sample_data?: {
    username?: string;
    password_hash?: string;
    ip?: string;
  };
}

export interface GoogleSearchBreachResult {
  found: boolean;
  sources: Array<{
    title: string;
    site: string;
    url: string;
    snippet: string;
  }>;
}

export interface SecurityTrailsResult {
  breaches_found: boolean;
  breach_count: number;
  breach_events: Array<{
    type: string;
    date: string;
    details: string;
  }>;
}

export interface PastebinSearchResult {
  pastes_found: boolean;
  paste_count: number;
  recent_pastes: Array<{
    title: string;
    url: string;
    posted_date: string;
    exposure_type: string;
  }>;
}

export interface ComprehensiveBreachReport {
  email: string;
  total_breaches: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  sources_affected: string[];
  breaches: Array<{
    source: string;
    count: number;
    breach_type: string;
    details?: string;
  }>;
  recommendations: string[];
}

// ============================================================================
// DEHASHED SERVICE
// ============================================================================

export class DeHashedService {
  private apiKey: string;
  private baseUrl = 'https://api.dehashed.com/api/search';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEHASHED_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchEmail(email: string): Promise<DeHashedResult> {
    if (!this.isConfigured()) {
      return {
        credentials_leaked: false,
        total_breach_count: 0,
        password_included: false,
        breach_sources: [],
      };
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: { query: `email:${email}` },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'Mozilla/5.0 (TrustShield)',
        },
        timeout: 10000,
      });

      const entries = response.data.entries || [];
      if (entries.length === 0) {
        return {
          credentials_leaked: false,
          total_breach_count: 0,
          password_included: false,
          breach_sources: [],
        };
      }

      const sources = [...new Set(entries.map((e: any) => e.source || 'Unknown'))];
      const hasPassword = entries.some((e: any) => e.password);

      return {
        credentials_leaked: true,
        total_breach_count: entries.length,
        password_included: hasPassword,
        breach_sources: sources,
        sample_data: {
          username: entries[0]?.username,
          password_hash: hasPassword ? '[REDACTED]' : undefined,
          ip: entries[0]?.ip,
        },
      };
    } catch (error: any) {
      console.warn(`DeHashed API Error: ${error.message}`);
      return {
        credentials_leaked: false,
        total_breach_count: 0,
        password_included: false,
        breach_sources: [],
      };
    }
  }

  async searchUsername(username: string): Promise<DeHashedResult> {
    if (!this.isConfigured()) {
      return {
        credentials_leaked: false,
        total_breach_count: 0,
        password_included: false,
        breach_sources: [],
      };
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: { query: `username:${username}` },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'Mozilla/5.0 (TrustShield)',
        },
        timeout: 10000,
      });

      const entries = response.data.entries || [];
      const sources = [...new Set(entries.map((e: any) => e.source || 'Unknown'))];

      return {
        credentials_leaked: entries.length > 0,
        total_breach_count: entries.length,
        password_included: entries.some((e: any) => e.password),
        breach_sources: sources,
      };
    } catch (error: any) {
      console.warn(`DeHashed API Error: ${error.message}`);
      return {
        credentials_leaked: false,
        total_breach_count: 0,
        password_included: false,
        breach_sources: [],
      };
    }
  }

  async searchDomain(domain: string): Promise<{
    total_entries: number;
    unique_emails: string[];
    breach_sources: string[];
  }> {
    if (!this.isConfigured()) {
      return {
        total_entries: 0,
        unique_emails: [],
        breach_sources: [],
      };
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: { query: `domain:${domain}` },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'Mozilla/5.0 (TrustShield)',
        },
        timeout: 10000,
      });

      const entries = response.data.entries || [];
      const emails = [...new Set(entries.map((e: any) => e.email))];
      const sources = [...new Set(entries.map((e: any) => e.source || 'Unknown'))];

      return {
        total_entries: entries.length,
        unique_emails: emails,
        breach_sources: sources,
      };
    } catch (error: any) {
      console.warn(`DeHashed API Error: ${error.message}`);
      return {
        total_entries: 0,
        unique_emails: [],
        breach_sources: [],
      };
    }
  }
}

// ============================================================================
// GOOGLE CUSTOM SEARCH SERVICE
// ============================================================================

export class GoogleSearchBreachService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor(apiKey?: string, searchEngineId?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
    this.searchEngineId = searchEngineId || process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.searchEngineId;
  }

  async searchForLeaks(email: string): Promise<GoogleSearchBreachResult> {
    if (!this.isConfigured()) {
      return { found: false, sources: [] };
    }

    try {
      const queries = [
        `"${email}" breach`,
        `"${email}" leaked`,
        `"${email}" compromised`,
        `"${email}" "stolen credentials"`,
      ];

      const allResults: Array<{
        title: string;
        site: string;
        url: string;
        snippet: string;
      }> = [];

      for (const query of queries) {
        try {
          const response = await axios.get(this.baseUrl, {
            params: {
              key: this.apiKey,
              cx: this.searchEngineId,
              q: query,
              num: 5,
            },
            timeout: 8000,
          });

          const items = response.data.items || [];
          items.forEach((item: any) => {
            allResults.push({
              title: item.title,
              site: new URL(item.link).hostname || item.link,
              url: item.link,
              snippet: item.snippet,
            });
          });
        } catch (e) {
          // Continue with next query
        }
      }

      // Deduplicate by URL
      const uniqueResults = Array.from(
        new Map(allResults.map((item) => [item.url, item])).values()
      );

      return {
        found: uniqueResults.length > 0,
        sources: uniqueResults.slice(0, 10),
      };
    } catch (error: any) {
      console.warn(`Google Search Error: ${error.message}`);
      return { found: false, sources: [] };
    }
  }
}

// ============================================================================
// SECURITYTRAILS SERVICE
// ============================================================================

export class SecurityTrailsService {
  private apiKey: string;
  private baseUrl = 'https://api.securitytrails.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SECURITYTRAILS_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async getDomainBreaches(domain: string): Promise<SecurityTrailsResult> {
    if (!this.isConfigured()) {
      return {
        breaches_found: false,
        breach_count: 0,
        breach_events: [],
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/domain/${domain}/breach`, {
        headers: {
          'APIKEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (TrustShield)',
        },
        timeout: 10000,
      });

      const breaches = response.data.breaches || [];

      return {
        breaches_found: breaches.length > 0,
        breach_count: breaches.length,
        breach_events: breaches.map((breach: any) => ({
          type: breach.type || 'Unknown',
          date: breach.date || 'Unknown',
          details: breach.title || breach.description || 'No details',
        })),
      };
    } catch (error: any) {
      console.warn(`SecurityTrails API Error: ${error.message}`);
      return {
        breaches_found: false,
        breach_count: 0,
        breach_events: [],
      };
    }
  }

  async getSubdomainBreach(domain: string): Promise<{
    total_subdomains: number;
    compromised_subdomains: string[];
  }> {
    if (!this.isConfigured()) {
      return {
        total_subdomains: 0,
        compromised_subdomains: [],
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/domain/${domain}/subdomains`, {
        headers: {
          'APIKEY': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (TrustShield)',
        },
        timeout: 10000,
      });

      const subdomains = response.data.subdomains || [];

      return {
        total_subdomains: subdomains.length,
        compromised_subdomains: subdomains
          .filter((sub: any) => sub.breach_count && sub.breach_count > 0)
          .map((sub: any) => sub.subdomain),
      };
    } catch (error: any) {
      console.warn(`SecurityTrails API Error: ${error.message}`);
      return {
        total_subdomains: 0,
        compromised_subdomains: [],
      };
    }
  }
}

// ============================================================================
// PASTEBIN AGGREGATOR SERVICE
// ============================================================================

export class PastebinAggregatorService {
  private apiKey: string;
  private baseUrl = 'https://scrape.pastebin.com/api_scrape.php';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PASTEBIN_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchPublicPastes(email: string): Promise<PastebinSearchResult> {
    try {
      // Search for email mentions in public pastes (no API key needed for basic search)
      const encodedEmail = encodeURIComponent(email);

      const response = await axios.get(`${this.baseUrl}?action=search&q=${encodedEmail}`, {
        timeout: 8000,
      });

      const pastes = response.data.pastes || [];

      if (pastes.length === 0) {
        return {
          pastes_found: false,
          paste_count: 0,
          recent_pastes: [],
        };
      }

      return {
        pastes_found: true,
        paste_count: pastes.length,
        recent_pastes: pastes.slice(0, 5).map((paste: any) => ({
          title: paste.paste_title || 'Unnamed Paste',
          url: `https://pastebin.com/${paste.paste_key}`,
          posted_date: new Date(parseInt(paste.paste_date) * 1000).toISOString(),
          exposure_type: paste.paste_size > 10000 ? 'Large Dump' : 'Leak',
        })),
      };
    } catch (error: any) {
      console.warn(`Pastebin Search Error: ${error.message}`);
      return {
        pastes_found: false,
        paste_count: 0,
        recent_pastes: [],
      };
    }
  }

  async searchByUsername(username: string): Promise<PastebinSearchResult> {
    try {
      const encodedUsername = encodeURIComponent(username);

      const response = await axios.get(`${this.baseUrl}?action=search&q=${encodedUsername}`, {
        timeout: 8000,
      });

      const pastes = response.data.pastes || [];

      return {
        pastes_found: pastes.length > 0,
        paste_count: pastes.length,
        recent_pastes: pastes.slice(0, 5).map((paste: any) => ({
          title: paste.paste_title || 'Unnamed Paste',
          url: `https://pastebin.com/${paste.paste_key}`,
          posted_date: new Date(parseInt(paste.paste_date) * 1000).toISOString(),
          exposure_type: paste.paste_size > 10000 ? 'Large Dump' : 'Leak',
        })),
      };
    } catch (error: any) {
      console.warn(`Pastebin Search Error: ${error.message}`);
      return {
        pastes_found: false,
        paste_count: 0,
        recent_pastes: [],
      };
    }
  }
}

// ============================================================================
// COMPREHENSIVE BREACH AGGREGATOR
// ============================================================================

export class ComprehensiveBreachAggregator {
  private deHashed: DeHashedService;
  private googleSearch: GoogleSearchBreachService;
  private securityTrails: SecurityTrailsService;
  private pastebin: PastebinAggregatorService;

  constructor(
    deHashedKey?: string,
    googleSearchKey?: string,
    googleSearchEngineId?: string,
    securityTrailsKey?: string,
    pastebinKey?: string
  ) {
    this.deHashed = new DeHashedService(deHashedKey);
    this.googleSearch = new GoogleSearchBreachService(googleSearchKey, googleSearchEngineId);
    this.securityTrails = new SecurityTrailsService(securityTrailsKey);
    this.pastebin = new PastebinAggregatorService(pastebinKey);
  }

  /**
   * Comprehensive breach search across all sources
   * Returns aggregated results with risk assessment
   */
  async comprehensiveBreachSearch(email: string): Promise<ComprehensiveBreachReport> {
    const breaches: Array<{
      source: string;
      count: number;
      breach_type: string;
      details?: string;
    }> = [];

    const sourcesAffected = new Set<string>();
    let totalBreachCount = 0;

    // 1. DeHashed Search
    if (this.deHashed.isConfigured()) {
      try {
        const dehashedResult = await this.deHashed.searchEmail(email);
        if (dehashedResult.credentials_leaked) {
          breaches.push({
            source: 'DeHashed',
            count: dehashedResult.total_breach_count,
            breach_type: dehashedResult.password_included ? 'Credentials & Password' : 'Credentials',
            details: dehashedResult.breach_sources.join(', '),
          });
          dehashedResult.breach_sources.forEach(s => sourcesAffected.add(s));
          totalBreachCount += dehashedResult.total_breach_count;
        }
      } catch (e) {
        console.warn('DeHashed search failed');
      }
    }

    // 2. Google Search
    if (this.googleSearch.isConfigured()) {
      try {
        const googleResult = await this.googleSearch.searchForLeaks(email);
        if (googleResult.found) {
          breaches.push({
            source: 'Web Search Results',
            count: googleResult.sources.length,
            breach_type: 'Web Mention',
            details: googleResult.sources
              .slice(0, 3)
              .map(s => s.site)
              .join(', '),
          });
        }
      } catch (e) {
        console.warn('Google search failed');
      }
    }

    // 3. Pastebin Search
    if (this.pastebin.isConfigured()) {
      try {
        const pastebinResult = await this.pastebin.searchPublicPastes(email);
        if (pastebinResult.pastes_found) {
          breaches.push({
            source: 'Pastebin',
            count: pastebinResult.paste_count,
            breach_type: 'Public Paste',
            details: pastebinResult.recent_pastes
              .slice(0, 2)
              .map(p => p.title)
              .join(', '),
          });
          totalBreachCount += pastebinResult.paste_count;
        }
      } catch (e) {
        console.warn('Pastebin search failed');
      }
    }

    // Determine risk level
    let riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe' = 'safe';

    if (totalBreachCount > 10) riskLevel = 'critical';
    else if (totalBreachCount > 5) riskLevel = 'high';
    else if (totalBreachCount > 2) riskLevel = 'medium';
    else if (totalBreachCount > 0) riskLevel = 'low';

    // Generate recommendations
    const recommendations: string[] = [];

    if (riskLevel !== 'safe') {
      recommendations.push('Change password immediately on all affected services');
      recommendations.push('Enable two-factor authentication where available');
    }

    if (sourcesAffected.size > 5) {
      recommendations.push('Consider changing your email address if possible');
    }

    if (totalBreachCount > 3) {
      recommendations.push('Monitor your accounts for suspicious activity');
      recommendations.push('Consider identity theft protection services');
    }

    if (riskLevel === 'safe') {
      recommendations.push('Keep monitoring for new breaches periodically');
    }

    return {
      email,
      total_breaches: totalBreachCount,
      risk_level: riskLevel,
      sources_affected: Array.from(sourcesAffected),
      breaches,
      recommendations,
    };
  }
}

export default {
  DeHashedService,
  GoogleSearchBreachService,
  SecurityTrailsService,
  PastebinAggregatorService,
  ComprehensiveBreachAggregator,
};
