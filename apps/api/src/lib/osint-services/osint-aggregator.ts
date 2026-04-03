/**
 * OSINT Aggregator Service
 * 
 * Unified interface for multiple open-source OSINT tools:
 * - Reverse Image Search (MRISA, Qdrant)
 * - People/Username Search (Blackbird, SpiderFoot)
 * - Phone OSINT (PhoneInfoga)
 * - Email Search (theHarvester)
 * - Breach Search (Self-hosted HIBP)
 * 
 * All tools are self-hosted, privacy-focused, and GDPR-compliant.
 */

import axios, { AxiosInstance } from 'axios';
import { spawn } from 'child_process';
import * as path from 'path';

export interface OSINTSearchQuery {
  query: string;
  type: 'username' | 'email' | 'phone' | 'image' | 'domain' | 'ip' | 'name';
  searchScope?: 'quick' | 'comprehensive'; // quick = fast tools only
  includeBreachCheck?: boolean;
  timeout?: number;
}

export interface OSINTResult {
  source: string;
  type: string;
  data: any;
  timestamp: string;
  accuracy?: number;
  verified?: boolean;
}

export interface AggregatedOSINTResult {
  query: string;
  queryType: string;
  results: OSINTResult[];
  summary: {
    totalSources: number;
    criticalFindings: number;
    warnings: string[];
  };
  searchTime: number;
}

export class OSINTAggregator {
  private apiClient: AxiosInstance;
  private toolPaths: {
    blackbird?: string;
    spiderfoot?: string;
    phoneinfoga?: string;
    harvester?: string;
    mrisa?: string;
  };

  constructor() {
    this.apiClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (OSINT Tool)',
      },
    });

    // Initialize tool paths
    this.toolPaths = {
      blackbird: process.env.BLACKBIRD_PATH || '/usr/local/bin/blackbird',
      spiderfoot: process.env.SPIDERFOOT_PATH || '/opt/spiderfoot',
      phoneinfoga: process.env.PHONEINFOGA_PATH || '/usr/local/bin/phoneinfoga',
      harvester: process.env.HARVESTER_PATH || '/usr/local/bin/theHarvester',
      mrisa: process.env.MRISA_URL || 'http://localhost:5000',
    };
  }

  /**
   * Execute comprehensive OSINT search
   */
  async search(query: OSINTSearchQuery): Promise<AggregatedOSINTResult> {
    const startTime = Date.now();
    const results: OSINTResult[] = [];
    const warnings: string[] = [];

    try {
      // Route to appropriate search method
      switch (query.type) {
        case 'username':
          results.push(...(await this.searchUsername(query.query, query.searchScope)));
          break;

        case 'email':
          results.push(...(await this.searchEmail(query.query, query.searchScope)));
          if (query.includeBreachCheck) {
            results.push(...(await this.checkBreaches(query.query)));
          }
          break;

        case 'phone':
          results.push(...(await this.searchPhone(query.query)));
          break;

        case 'image':
          results.push(...(await this.reverseImageSearch(query.query)));
          break;

        case 'domain':
          results.push(...(await this.searchDomain(query.query, query.searchScope)));
          break;

        case 'ip':
          results.push(...(await this.searchIP(query.query)));
          break;

        case 'name':
          results.push(...(await this.searchName(query.query, query.searchScope)));
          break;
      }

      // Deduplicate and rank results
      const deduplicatedResults = this.deduplicateResults(results);
      const rankedResults = this.rankResults(deduplicatedResults);

      return {
        query: query.query,
        queryType: query.type,
        results: rankedResults,
        summary: {
          totalSources: rankedResults.length,
          criticalFindings: rankedResults.filter((r) => r.accuracy && r.accuracy > 0.85).length,
          warnings,
        },
        searchTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[OSINT] Search failed:', error);
      warnings.push(`Search error: ${error instanceof Error ? error.message : 'Unknown'}`);
      return {
        query: query.query,
        queryType: query.type,
        results,
        summary: {
          totalSources: results.length,
          criticalFindings: 0,
          warnings,
        },
        searchTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Search by username across 600+ websites (Blackbird)
   */
  private async searchUsername(username: string, scope?: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      // Validate username format
      if (!this.isValidUsername(username)) {
        return results;
      }

      // Try Blackbird CLI
      const blackbirdResults = await this.executeBlackbird(username);
      if (blackbirdResults.length > 0) {
        results.push({
          source: 'Blackbird',
          type: 'username_presence',
          data: blackbirdResults,
          timestamp: new Date().toISOString(),
          accuracy: 0.9,
          verified: true,
        });
      }

      // Quick scope: stop here
      if (scope === 'quick') {
        return results;
      }

      // Comprehensive: Add more sources
      const socmedResults = await this.searchSocialMedia(username);
      if (socmedResults) {
        results.push(socmedResults);
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] Username search failed:', error);
      return results;
    }
  }

  /**
   * Search by email
   */
  private async searchEmail(email: string, scope?: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      if (!this.isValidEmail(email)) {
        return results;
      }

      // Search across known breaches (HaveIBeenPwned-style)
      const breachResults = await this.searchEmailBreaches(email);
      if (breachResults) {
        results.push(breachResults);
      }

      // Search for email mentions online
      const onlineResults = await this.searchEmailOnline(email);
      if (onlineResults) {
        results.push(onlineResults);
      }

      if (scope === 'quick') {
        return results;
      }

      // theHarvester for comprehensive email search
      const harvesterResults = await this.executeHarvester(email);
      if (harvesterResults) {
        results.push(harvesterResults);
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] Email search failed:', error);
      return results;
    }
  }

  /**
   * Search phone number (PhoneInfoga)
   */
  private async searchPhone(phoneNumber: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      if (!this.isValidPhone(phoneNumber)) {
        return results;
      }

      const phoneResults = await this.executePhoneInfoga(phoneNumber);
      if (phoneResults) {
        results.push({
          source: 'PhoneInfoga',
          type: 'phone_information',
          data: phoneResults,
          timestamp: new Date().toISOString(),
          accuracy: phoneResults.confidence || 0.8,
          verified: phoneResults.verified || false,
        });
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] Phone search failed:', error);
      return results;
    }
  }

  /**
   * Reverse image search (MRISA or Qdrant)
   */
  private async reverseImageSearch(imageUrlOrPath: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      // Use MRISA for web-based reverse search
      const mrisaResults = await this.executeMRISA(imageUrlOrPath);
      if (mrisaResults && mrisaResults.length > 0) {
        results.push({
          source: 'MRISA',
          type: 'reverse_image_search',
          data: mrisaResults.slice(0, 20),
          timestamp: new Date().toISOString(),
          accuracy: 0.85,
        });
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] Reverse image search failed:', error);
      return results;
    }
  }

  /**
   * Search by domain (WHOIS, DNS, Subdomains)
   */
  private async searchDomain(domain: string, scope?: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      if (!this.isValidDomain(domain)) {
        return results;
      }

      // WHOIS lookup
      const whoisResults = await this.whoisLookup(domain);
      if (whoisResults) {
        results.push({
          source: 'WHOIS',
          type: 'domain_registration',
          data: whoisResults,
          timestamp: new Date().toISOString(),
          accuracy: 0.95,
        });
      }

      // DNS records
      const dnsResults = await this.dnsList(domain);
      if (dnsResults) {
        results.push({
          source: 'DNS',
          type: 'dns_records',
          data: dnsResults,
          timestamp: new Date().toISOString(),
          accuracy: 1.0,
        });
      }

      if (scope === 'quick') {
        return results;
      }

      // Subdomain enumeration
      const subdomains = await this.findSubdomains(domain);
      if (subdomains && subdomains.length > 0) {
        results.push({
          source: 'Subdomain Enum',
          type: 'subdomains',
          data: subdomains,
          timestamp: new Date().toISOString(),
          accuracy: 0.9,
        });
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] Domain search failed:', error);
      return results;
    }
  }

  /**
   * Search IP address
   */
  private async searchIP(ip: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      if (!this.isValidIP(ip)) {
        return results;
      }

      // IP Geolocation
      const geoResults = await this.ipGeolocation(ip);
      if (geoResults) {
        results.push({
          source: 'IP Geolocation',
          type: 'ip_location',
          data: geoResults,
          timestamp: new Date().toISOString(),
          accuracy: 0.85,
        });
      }

      // Reverse DNS
      const reverseDns = await this.reverseIP(ip);
      if (reverseDns) {
        results.push({
          source: 'Reverse DNS',
          type: 'reverse_dns',
          data: reverseDns,
          timestamp: new Date().toISOString(),
          accuracy: 0.9,
        });
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] IP search failed:', error);
      return results;
    }
  }

  /**
   * Search by person name
   */
  private async searchName(name: string, scope?: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      // Social media profiles
      const socialResults = await this.searchSocialMedia(name);
      if (socialResults) {
        results.push(socialResults);
      }

      if (scope === 'quick') {
        return results;
      }

      // SpiderFoot for comprehensive search
      const spiderfootResults = await this.executeSpiderFoot(name);
      if (spiderfootResults) {
        results.push(spiderfootResults);
      }

      return results;
    } catch (error) {
      console.warn('[OSINT] Name search failed:', error);
      return results;
    }
  }

  /**
   * Check if email is in known breaches
   */
  private async checkBreaches(email: string): Promise<OSINTResult[]> {
    const results: OSINTResult[] = [];

    try {
      const breachData = await this.searchEmailBreaches(email);
      if (breachData) {
        results.push(breachData);
      }
      return results;
    } catch (error) {
      console.warn('[OSINT] Breach check failed:', error);
      return results;
    }
  }

  // ============ TOOL EXECUTORS ============

  /**
   * Execute Blackbird (username search)
   */
  private async executeBlackbird(username: string): Promise<any[]> {
    return new Promise((resolve) => {
      try {
        const process = spawn('blackbird', ['-u', username, '--json'], {
          timeout: 30000,
        });

        let output = '';

        process.stdout.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', () => {
          try {
            const results = JSON.parse(output);
            resolve(results || []);
          } catch {
            resolve([]);
          }
        });

        process.on('error', () => {
          resolve([]);
        });
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Execute PhoneInfoga
   */
  private async executePhoneInfoga(phone: string): Promise<any> {
    try {
      const response = await this.apiClient.get('http://localhost:5001/api', {
        params: { number: phone },
      });
      return response.data;
    } catch {
      return null;
    }
  }

  /**
   * Execute theHarvester
   */
  private async executeHarvester(domain: string): Promise<any> {
    return new Promise((resolve) => {
      try {
        const process = spawn('theHarvester', ['-d', domain, '-l', '500', '-b', 'all'], {
          timeout: 45000,
        });

        let output = '';

        process.stdout.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', () => {
          resolve({
            source: 'theHarvester',
            type: 'email_harvest',
            data: this.parseHarvesterOutput(output),
            timestamp: new Date().toISOString(),
            accuracy: 0.8,
          });
        });

        process.on('error', () => {
          resolve(null);
        });
      } catch {
        resolve(null);
      }
    });
  }

  /**
   * Execute SpiderFoot
   */
  private async executeSpiderFoot(query: string): Promise<any> {
    try {
      const response = await this.apiClient.post('http://localhost:5800/api/scan/start', {
        scanname: `scan_${Date.now()}`,
        scantarget: query,
      });

      return {
        source: 'SpiderFoot',
        type: 'comprehensive_osint',
        data: response.data,
        timestamp: new Date().toISOString(),
        accuracy: 0.85,
      };
    } catch {
      return null;
    }
  }

  /**
   * Execute MRISA (Meta Reverse Image Search)
   */
  private async executeMRISA(imageUrl: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`${this.toolPaths.mrisa}/search`, {
        params: { image: imageUrl },
      });
      return response.data.results || [];
    } catch {
      return [];
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Deduplicate results from multiple sources
   */
  private deduplicateResults(results: OSINTResult[]): OSINTResult[] {
    const seen = new Set<string>();
    return results.filter((result) => {
      const key = `${result.source}:${JSON.stringify(result.data)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Rank results by accuracy and verification
   */
  private rankResults(results: OSINTResult[]): OSINTResult[] {
    return results.sort((a, b) => {
      const scoreA = (a.accuracy || 0) * (a.verified ? 1.2 : 1);
      const scoreB = (b.accuracy || 0) * (b.verified ? 1.2 : 1);
      return scoreB - scoreA;
    });
  }

  /**
   * Parse theHarvester output
   */
  private parseHarvesterOutput(output: string): any {
    const lines = output.split('\n');
    const emails: string[] = [];
    const hosts: string[] = [];

    for (const line of lines) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emailMatch) emails.push(...emailMatch);

      if (line.includes('Host :')) {
        hosts.push(line.split('Host :')[1]?.trim() || '');
      }
    }

    return { emails: [...new Set(emails)], hosts: [...new Set(hosts)] };
  }

  // ============ API METHODS ============

  private async searchEmailBreaches(email: string): Promise<OSINTResult | null> {
    try {
      // Query self-hosted HIBP (amipwned or similar)
      const response = await this.apiClient.get(`http://localhost:8080/api/breaches`, {
        params: { email },
      });

      if (response.data.breaches && response.data.breaches.length > 0) {
        return {
          source: 'HIBP (Self-hosted)',
          type: 'breach_found',
          data: response.data.breaches,
          timestamp: new Date().toISOString(),
          accuracy: 0.95,
          verified: true,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private async searchEmailOnline(email: string): Promise<OSINTResult | null> {
    // Implementation for searching email mentions online
    return null;
  }

  private async searchSocialMedia(query: string): Promise<OSINTResult | null> {
    // Implementation for social media search
    return null;
  }

  private async whoisLookup(domain: string): Promise<any> {
    // Implementation using node-whois or similar
    return null;
  }

  private async dnsList(domain: string): Promise<any> {
    // Implementation using dns module or similar
    return null;
  }

  private async findSubdomains(domain: string): Promise<string[]> {
    // Implementation using crt.sh or similar
    return [];
  }

  private async ipGeolocation(ip: string): Promise<any> {
    // Implementation using free IP geolocation API
    return null;
  }

  private async reverseIP(ip: string): Promise<any> {
    // Implementation using reverse DNS lookup
    return null;
  }

  // ============ VALIDATION ============

  private isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_.-]{3,}$/.test(username);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(
      phone.replace(/\s/g, ''),
    );
  }

  private isValidDomain(domain: string): boolean {
    return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain);
  }

  private isValidIP(ip: string): boolean {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^[a-f0-9:]+$/.test(ip);
  }
}

export default new OSINTAggregator();
