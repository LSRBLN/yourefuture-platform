/**
 * OSINT Controller
 * 
 * Unified API for all OSINT operations:
 * - Username/Email/Phone searches
 * - Reverse image search
 * - Domain/IP intelligence
 * - Breach checks
 * 
 * All endpoints use open-source, self-hosted tools
 * Privacy-first, GDPR-compliant
 */

import { Controller, Post, Get, Body, BadRequestException, Query } from '@nestjs/common';
import OSINTAggregator, { OSINTSearchQuery, AggregatedOSINTResult } from '../lib/osint-services/osint-aggregator';
import ReverseImageSearchService, { ReverseImageSearchResult } from '../lib/osint-services/reverse-image-search';

export interface OSINTSearchRequest {
  query: string;
  type: 'username' | 'email' | 'phone' | 'image' | 'domain' | 'ip' | 'name';
  searchScope?: 'quick' | 'comprehensive';
  includeBreachCheck?: boolean;
  timeout?: number;
}

export interface ReverseImageSearchRequest {
  imageUrl: string;
  includeWeb?: boolean;
}

export interface BatchIndexRequest {
  images: Array<{
    url: string;
    metadata?: any;
  }>;
}

@Controller('api/v1/osint')
export class OSINTController {
  /**
   * Universal OSINT Search
   * Route to appropriate search based on query type
   */
  @Post('/search')
  async universalSearch(@Body() body: OSINTSearchRequest): Promise<{
    success: boolean;
    data?: AggregatedOSINTResult;
    error?: string;
  }> {
    try {
      if (!body.query || !body.type) {
        throw new BadRequestException('query and type are required');
      }

      // Validate query format
      if (!this.validateQuery(body.query, body.type)) {
        throw new BadRequestException(`Invalid format for ${body.type}`);
      }

      const result = await OSINTAggregator.search({
        query: body.query,
        type: body.type,
        searchScope: body.searchScope || 'quick',
        includeBreachCheck: body.includeBreachCheck !== false,
        timeout: body.timeout || 30000,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OSINT search failed',
      };
    }
  }

  /**
   * Username Search
   * Searches across 600+ websites
   */
  @Post('/username-search')
  async usernameSearch(
    @Body() body: { username: string; comprehensive?: boolean }
  ): Promise<any> {
    try {
      if (!body.username) {
        throw new BadRequestException('username required');
      }

      const result = await OSINTAggregator.search({
        query: body.username,
        type: 'username',
        searchScope: body.comprehensive ? 'comprehensive' : 'quick',
      });

      return {
        success: true,
        data: {
          username: body.username,
          results: result.results,
          totalSources: result.summary.totalSources,
          criticalFindings: result.summary.criticalFindings,
          searchTime: result.searchTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Email Search
   * Searches breaches, online mentions, email leaks
   */
  @Post('/email-search')
  async emailSearch(
    @Body() body: { email: string; checkBreaches?: boolean; comprehensive?: boolean }
  ): Promise<any> {
    try {
      if (!body.email) {
        throw new BadRequestException('email required');
      }

      const result = await OSINTAggregator.search({
        query: body.email,
        type: 'email',
        searchScope: body.comprehensive ? 'comprehensive' : 'quick',
        includeBreachCheck: body.checkBreaches !== false,
      });

      // Separate breach results
      const breachResults = result.results.filter((r) => r.type === 'breach_found');
      const otherResults = result.results.filter((r) => r.type !== 'breach_found');

      return {
        success: true,
        data: {
          email: body.email,
          breachesFound: breachResults.length > 0,
          breaches: breachResults.length > 0 ? breachResults[0].data : [],
          otherResults,
          totalSources: result.summary.totalSources,
          warnings: result.summary.warnings,
          searchTime: result.searchTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Phone Number Search
   * Carrier lookup, location, footprints
   */
  @Post('/phone-search')
  async phoneSearch(@Body() body: { phone: string }): Promise<any> {
    try {
      if (!body.phone) {
        throw new BadRequestException('phone required');
      }

      const result = await OSINTAggregator.search({
        query: body.phone,
        type: 'phone',
      });

      return {
        success: true,
        data: {
          phone: body.phone,
          information: result.results.length > 0 ? result.results[0].data : null,
          searchTime: result.searchTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Domain Intelligence
   * WHOIS, DNS, subdomains
   */
  @Post('/domain-search')
  async domainSearch(
    @Body() body: { domain: string; comprehensive?: boolean }
  ): Promise<any> {
    try {
      if (!body.domain) {
        throw new BadRequestException('domain required');
      }

      const result = await OSINTAggregator.search({
        query: body.domain,
        type: 'domain',
        searchScope: body.comprehensive ? 'comprehensive' : 'quick',
      });

      // Organize results by type
      const whois = result.results.find((r) => r.type === 'domain_registration')?.data;
      const dns = result.results.find((r) => r.type === 'dns_records')?.data;
      const subdomains = result.results.find((r) => r.type === 'subdomains')?.data;

      return {
        success: true,
        data: {
          domain: body.domain,
          whois,
          dns,
          subdomains,
          totalRecords: result.summary.totalSources,
          searchTime: result.searchTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * IP Intelligence
   * Geolocation, reverse DNS, threat intel
   */
  @Post('/ip-search')
  async ipSearch(@Body() body: { ip: string }): Promise<any> {
    try {
      if (!body.ip) {
        throw new BadRequestException('ip required');
      }

      const result = await OSINTAggregator.search({
        query: body.ip,
        type: 'ip',
      });

      const geolocation = result.results.find((r) => r.type === 'ip_location')?.data;
      const reverseDns = result.results.find((r) => r.type === 'reverse_dns')?.data;

      return {
        success: true,
        data: {
          ip: body.ip,
          geolocation,
          reverseDns,
          searchTime: result.searchTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reverse Image Search
   * Local (Qdrant) + Web (MRISA)
   */
  @Post('/reverse-image')
  async reverseImageSearch(
    @Body() body: ReverseImageSearchRequest
  ): Promise<{
    success: boolean;
    data?: ReverseImageSearchResult;
    error?: string;
  }> {
    try {
      if (!body.imageUrl) {
        throw new BadRequestException('imageUrl required');
      }

      const result = await ReverseImageSearchService.reverseSearch(
        body.imageUrl,
        body.includeWeb !== false,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Reverse image search failed',
      };
    }
  }

  /**
   * Index Image for Reverse Search
   * Add image to local Qdrant collection
   */
  @Post('/index-image')
  async indexImage(
    @Body() body: { imageUrl: string; metadata?: any }
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      if (!body.imageUrl) {
        throw new BadRequestException('imageUrl required');
      }

      const indexed = await ReverseImageSearchService.indexImage(body.imageUrl, body.metadata);

      return {
        success: indexed,
        message: indexed ? 'Image indexed successfully' : 'Failed to index image',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch Index Images
   * Efficiently add multiple images to collection
   */
  @Post('/batch-index')
  async batchIndex(
    @Body() body: BatchIndexRequest
  ): Promise<{
    success: boolean;
    indexed: number;
    failed: number;
    error?: string;
  }> {
    try {
      if (!body.images || body.images.length === 0) {
        throw new BadRequestException('images array required');
      }

      const result = await ReverseImageSearchService.indexBatch(body.images);

      return {
        success: result.indexed > 0,
        indexed: result.indexed,
        failed: result.failed,
      };
    } catch (error: any) {
      return {
        success: false,
        indexed: 0,
        failed: body.images?.length || 0,
        error: error.message,
      };
    }
  }

  /**
   * Delete Image from Index
   */
  @Post('/delete-image')
  async deleteImage(
    @Body() body: { imageUrl: string }
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      if (!body.imageUrl) {
        throw new BadRequestException('imageUrl required');
      }

      const deleted = await ReverseImageSearchService.deleteImage(body.imageUrl);

      return {
        success: deleted,
        message: deleted ? 'Image deleted from index' : 'Failed to delete image',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Collection Statistics
   */
  @Get('/stats')
  async getStats(): Promise<{
    success: boolean;
    data?: any;
  }> {
    try {
      const stats = await ReverseImageSearchService.getCollectionStats();
      return {
        success: !!stats,
        data: stats,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Initialize Collection
   */
  @Post('/init-collection')
  async initCollection(
    @Body() body?: { vectorSize?: number }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const initialized = await ReverseImageSearchService.initializeCollection(
        body?.vectorSize || 512,
      );

      return {
        success: initialized,
        message: initialized ? 'Collection initialized' : 'Failed to initialize collection',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ============ VALIDATION ============

  private validateQuery(query: string, type: string): boolean {
    if (!query || query.trim().length === 0) {
      return false;
    }

    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
      case 'phone':
        return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(
          query.replace(/\s/g, ''),
        );
      case 'domain':
        return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(query);
      case 'ip':
        return (
          /^(\d{1,3}\.){3}\d{1,3}$/.test(query) || /^[a-f0-9:]+$/.test(query)
        );
      case 'username':
        return /^[a-zA-Z0-9_.-]{3,}$/.test(query);
      default:
        return true;
    }
  }
}
