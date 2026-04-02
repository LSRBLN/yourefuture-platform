/**
 * Leak Provider Aggregator Service
 *
 * Orchestrates queries across multiple leak providers and aggregates results.
 * Implements risk scoring and summary generation.
 */

import { Injectable, Logger } from '@nestjs/common';
import type { AggregatedLeakCheckResult, BreachResult, ILeakProvider } from '@trustshield/core';
import { HibpConnector } from './hibp.connector';
import { LeakCheckConnector } from './leakcheck.connector';

@Injectable()
export class LeakAggregatorService {
  private logger = new Logger(LeakAggregatorService.name);
  private providers: ILeakProvider[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize all available leak providers
    const hibp = new HibpConnector();
    const leakcheck = new LeakCheckConnector();

    // Register only enabled providers
    if (hibp.enabled) {
      this.providers.push(hibp);
      this.logger.log('HIBP provider enabled');
    }

    if (leakcheck.enabled) {
      this.providers.push(leakcheck);
      this.logger.log('LeakCheck provider enabled');
    }

    if (this.providers.length === 0) {
      this.logger.warn('No leak providers are configured. Set HIBP_API_KEY and/or LEAKCHECK_API_KEY');
    }
  }

  /**
   * Search for email across all configured providers
   */
  async searchEmail(email: string): Promise<AggregatedLeakCheckResult> {
    const allBreaches: BreachResult[] = [];

    for (const provider of this.providers) {
      try {
        this.logger.debug(`Searching ${provider.name} for email: ${email}`);
        const breaches = await provider.searchEmail(email);
        allBreaches.push(...breaches);
      } catch (error) {
        this.logger.error(`Provider ${provider.name} search failed:`, error);
        // Continue with other providers on error
      }
    }

    // Deduplicate breaches by name
    const uniqueBreaches = this.deduplicateBreaches(allBreaches);

    return this.aggregateResults(email, undefined, undefined, undefined, uniqueBreaches);
  }

  /**
   * Search for username across all configured providers
   */
  async searchUsername(username: string): Promise<AggregatedLeakCheckResult> {
    const allBreaches: BreachResult[] = [];

    for (const provider of this.providers) {
      try {
        this.logger.debug(`Searching ${provider.name} for username: ${username}`);
        const breaches = await provider.searchUsername(username);
        allBreaches.push(...breaches);
      } catch (error) {
        this.logger.error(`Provider ${provider.name} search failed:`, error);
      }
    }

    const uniqueBreaches = this.deduplicateBreaches(allBreaches);
    return this.aggregateResults(undefined, username, undefined, undefined, uniqueBreaches);
  }

  /**
   * Search for phone across all configured providers
   */
  async searchPhone(phone: string): Promise<AggregatedLeakCheckResult> {
    const allBreaches: BreachResult[] = [];

    for (const provider of this.providers) {
      try {
        const breaches = await provider.searchPhone(phone);
        allBreaches.push(...breaches);
      } catch (error) {
        this.logger.error(`Provider ${provider.name} search failed:`, error);
      }
    }

    const uniqueBreaches = this.deduplicateBreaches(allBreaches);
    return this.aggregateResults(undefined, undefined, phone, undefined, uniqueBreaches);
  }

  /**
   * Search for domain across all configured providers
   */
  async searchDomain(domain: string): Promise<AggregatedLeakCheckResult> {
    const allBreaches: BreachResult[] = [];

    for (const provider of this.providers) {
      try {
        const breaches = await provider.searchDomain(domain);
        allBreaches.push(...breaches);
      } catch (error) {
        this.logger.error(`Provider ${provider.name} search failed:`, error);
      }
    }

    const uniqueBreaches = this.deduplicateBreaches(allBreaches);
    return this.aggregateResults(undefined, undefined, undefined, domain, uniqueBreaches);
  }

  /**
   * Health check all providers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const provider of this.providers) {
      try {
        results[provider.name] = await provider.healthCheck();
      } catch (error) {
        this.logger.error(`Health check failed for ${provider.name}:`, error);
        results[provider.name] = false;
      }
    }

    return results;
  }

  /**
   * Deduplicate breaches by breach name (same breach found in multiple providers)
   */
  private deduplicateBreaches(breaches: BreachResult[]): BreachResult[] {
    const seen = new Set<string>();
    return breaches.filter((breach) => {
      const key = `${breach.breachName}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Aggregate results and compute risk score & summary
   */
  private aggregateResults(
    email?: string,
    username?: string,
    phone?: string,
    domain?: string,
    breaches: BreachResult[] = [],
  ): AggregatedLeakCheckResult {
    const riskScore = this.computeRiskScore(breaches);
    const riskLevel = this.getRiskLevel(riskScore);
    const summary = this.generateSummary(breaches, riskLevel);
    const recommendations = this.getRecommendations(riskLevel, breaches);

    return {
      email,
      username,
      phone,
      domain,
      breaches,
      summary,
      riskLevel,
      riskScore,
      recommendedActions: recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Compute risk score (0-100) based on breach count and severity
   */
  private computeRiskScore(breaches: BreachResult[]): number {
    if (breaches.length === 0) {
      return 0;
    }

    // Base score: 10 points per breach
    let score = Math.min(breaches.length * 15, 80);

    // Bonus points for verified breaches
    const verifiedCount = breaches.filter((b) => b.isVerified).length;
    score += Math.min(verifiedCount * 5, 20);

    // Clamp to 0-100
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (score === 0) return 'none';
    if (score <= 20) return 'low';
    if (score <= 40) return 'medium';
    if (score <= 70) return 'high';
    return 'critical';
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(breaches: BreachResult[], riskLevel: string): string {
    if (breaches.length === 0) {
      return 'No known breaches found. Your data appears to be safe.';
    }

    const verifiedCount = breaches.filter((b) => b.isVerified).length;
    const verb = verifiedCount === breaches.length ? 'were confirmed in' : 'were found in';

    return `Your information ${verb} ${breaches.length} known breach${breaches.length !== 1 ? 'es' : ''}. Risk level: ${riskLevel.toUpperCase()}.`;
  }

  /**
   * Get actionable recommendations based on risk level
   */
  private getRecommendations(riskLevel: string, breaches: BreachResult[]): string[] {
    const recommendations = [
      'Review the breaches that exposed your data',
      'Change passwords for all accounts with this email/username',
    ];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Enable two-factor authentication on all your accounts');
      recommendations.push('Monitor your accounts for suspicious activity');
      recommendations.push('Consider credit monitoring if financial info was exposed');
    }

    if (breaches.some((b) => b.dataClasses?.includes('Passwords'))) {
      recommendations.push('Your passwords were exposed. Change all passwords immediately.');
    }

    return recommendations;
  }
}
