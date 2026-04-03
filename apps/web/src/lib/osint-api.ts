/**
 * OSINT API Client with React Query Integration
 * Optimized for Syncfusion Components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage, requestApi } from './http-client';

// ============ Types ============

export interface OSINTSearchQuery {
  query: string;
  type: 'username' | 'email' | 'phone' | 'domain' | 'ip' | 'image' | 'name';
  searchScope?: 'quick' | 'comprehensive';
  timeout?: number;
}

export interface OSINTResult {
  source: string;
  type: string;
  data: unknown;
  timestamp: string;
  accuracy: number;
  verified: boolean;
}

export interface OSINTSearchResponse {
  status?: string;
  success?: boolean;
  data: {
    query: string;
    queryType: string;
    results: OSINTResult[];
    summary: {
      totalSources: number;
      criticalFindings: number;
      warnings: string[];
    };
    searchTime: number;
  };
  timestamp: string;
}

export interface BreachData {
  name: string;
  date: string;
  dataClasses: string[];
  affectedCount: number;
}

export interface EmailSearchResponse {
  status?: string;
  success?: boolean;
  data: {
    email: string;
    breachesFound: boolean;
    breaches: BreachData[];
    otherResults: OSINTResult[];
    totalSources: number;
  };
}

export interface ImageSearchResult {
  url: string;
  title: string;
  source: 'Qdrant' | 'MRISA';
  similarity_score: number;
  imageUrl: string;
  domain: string;
  crawlDate?: string;
}

export interface ImageSearchResponse {
  status?: string;
  success?: boolean;
  data: {
    query: string;
    totalMatches: number;
    matches: ImageSearchResult[];
    searchTime: number;
    sources: string[];
  };
}

export interface CollectionStats {
  totalPoints: number;
  vectorSize: number;
  estimatedMemory: string;
  lastUpdated: string;
}

type OsintSearchStatus = 'queued' | 'running' | 'completed' | 'failed' | 'partial_failure' | 'cancelled';

type OsintUnifiedResult = {
  query: string;
  queryType: string;
  results: Array<{
    source: string;
    type: string;
    score?: number;
    evidence?: Record<string, unknown>;
    timestamps?: { updatedAt?: string };
  }>;
  sources?: Array<{ tool?: string; url?: string }>;
};

type OsintSearchSnapshot = {
  id: string;
  status: OsintSearchStatus;
  query?: string;
  queryType?: string;
  completedAt?: string | null;
  updatedAt?: string;
  lastError?: string | null;
  unifiedResult?: OsintUnifiedResult | null;
};

// ============ Query Keys ============

export const osintQueryKeys = {
  all: ['osint'] as const,
  searches: () => [...osintQueryKeys.all, 'searches'] as const,
  search: (query: string, type: string) => [...osintQueryKeys.searches(), { query, type }] as const,
  username: (username: string) => [...osintQueryKeys.all, 'username', username] as const,
  email: (email: string) => [...osintQueryKeys.all, 'email', email] as const,
  phone: (phone: string) => [...osintQueryKeys.all, 'phone', phone] as const,
  domain: (domain: string) => [...osintQueryKeys.all, 'domain', domain] as const,
  ip: (ip: string) => [...osintQueryKeys.all, 'ip', ip] as const,
  image: (imageUrl: string) => [...osintQueryKeys.all, 'image', imageUrl] as const,
  stats: () => [...osintQueryKeys.all, 'stats'] as const,
};

// ============ API Functions ============

function mapTypeToBackend(type: OSINTSearchQuery['type']) {
  return type === 'image' ? 'image_url' : type;
}

function toOsintResult(unified: OsintUnifiedResult | null | undefined): OSINTResult[] {
  if (!unified?.results) {
    return [];
  }

  return unified.results.map((item) => ({
    source: item.source || item.evidence?.providerName?.toString() || 'unknown',
    type: item.type || 'result',
    data: item.evidence ?? {},
    timestamp: item.timestamps?.updatedAt ?? new Date().toISOString(),
    accuracy: typeof item.score === 'number' ? Math.max(0, Math.min(1, item.score / 100)) : 0,
    verified: typeof item.score === 'number' ? item.score >= 70 : false,
  }));
}

async function pollOsintSearch(searchId: string): Promise<OsintSearchSnapshot> {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const snapshot = await requestApi<OsintSearchSnapshot>(`/osint/searches/${encodeURIComponent(searchId)}`);

    if (snapshot.status === 'completed' || snapshot.status === 'failed' || snapshot.status === 'partial_failure' || snapshot.status === 'cancelled') {
      return snapshot;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('OSINT search timed out');
}

async function executeOsintSearch(query: string, type: OSINTSearchQuery['type'], searchScope: OSINTSearchQuery['searchScope'] = 'quick') {
  const created = await requestApi<{ id: string }>('/osint/search', {
    method: 'POST',
    body: JSON.stringify({
      query,
      queryType: mapTypeToBackend(type),
      scope: searchScope,
    }),
  });

  const snapshot = await pollOsintSearch(created.id);

  if (snapshot.status === 'failed' || snapshot.status === 'cancelled') {
    throw new Error(snapshot.lastError || 'OSINT search failed');
  }

  return snapshot;
}

// Universal Search
export async function universalSearch(params: OSINTSearchQuery): Promise<OSINTSearchResponse> {
  const snapshot = await executeOsintSearch(params.query, params.type, params.searchScope ?? 'quick');
  const results = toOsintResult(snapshot.unifiedResult);

  return {
    status: 'ok',
    success: true,
    data: {
      query: snapshot.query ?? params.query,
      queryType: snapshot.queryType ?? params.type,
      results,
      summary: {
        totalSources: snapshot.unifiedResult?.sources?.length ?? results.length,
        criticalFindings: results.filter((item) => item.accuracy >= 0.8).length,
        warnings: snapshot.lastError ? [snapshot.lastError] : [],
      },
      searchTime: 0,
    },
    timestamp: snapshot.completedAt ?? snapshot.updatedAt ?? new Date().toISOString(),
  };
}

// Username Search
export async function searchUsername(
  username: string,
  comprehensive: boolean = false
): Promise<OSINTSearchResponse> {
  return universalSearch({
    query: username,
    type: 'username',
    searchScope: comprehensive ? 'comprehensive' : 'quick',
  });
}

// Email Search with Breach Detection
export async function searchEmail(
  email: string,
  checkBreaches: boolean = true
): Promise<EmailSearchResponse> {
  const result = await universalSearch({
    query: email,
    type: 'email',
    searchScope: 'quick',
  });

  const breaches: BreachData[] = checkBreaches
    ? result.data.results
      .filter((item) => item.type.toLowerCase().includes('breach'))
      .map((item, index) => {
        const evidence = (item.data ?? {}) as Record<string, unknown>;
        return {
          name: typeof evidence.breachName === 'string' ? evidence.breachName : `Breach ${index + 1}`,
          date: typeof evidence.breachDate === 'string' ? evidence.breachDate : item.timestamp,
          dataClasses: Array.isArray(evidence.dataClasses)
            ? evidence.dataClasses.filter((value): value is string => typeof value === 'string')
            : [],
          affectedCount: typeof evidence.affectedCount === 'number' ? evidence.affectedCount : 0,
        };
      })
    : [];

  return {
    status: result.status,
    success: result.success,
    data: {
      email,
      breachesFound: breaches.length > 0,
      breaches,
      otherResults: result.data.results.filter((item) => !item.type.toLowerCase().includes('breach')),
      totalSources: result.data.summary.totalSources,
    },
  };
}

// Phone Search
export async function searchPhone(phone: string): Promise<OSINTSearchResponse> {
  return universalSearch({ query: phone, type: 'phone', searchScope: 'quick' });
}

// Domain Search
export async function searchDomain(
  domain: string,
  comprehensive: boolean = false
): Promise<OSINTSearchResponse> {
  return universalSearch({
    query: domain,
    type: 'domain',
    searchScope: comprehensive ? 'comprehensive' : 'quick',
  });
}

// IP Search
export async function searchIP(ip: string): Promise<OSINTSearchResponse> {
  return universalSearch({ query: ip, type: 'ip', searchScope: 'quick' });
}

// Reverse Image Search
export async function reverseImageSearch(
  imageUrl: string,
  includeWeb: boolean = true
): Promise<ImageSearchResponse> {
  void includeWeb;

  const result = await universalSearch({
    query: imageUrl,
    type: 'image',
    searchScope: 'quick',
  });

  const matches: ImageSearchResult[] = result.data.results.map((item, index) => {
    const evidence = (item.data ?? {}) as Record<string, unknown>;
    const url = typeof evidence.url === 'string' ? evidence.url : imageUrl;
    const similarity = typeof evidence.similarity === 'number' ? evidence.similarity : item.accuracy;

    return {
      url,
      title: typeof evidence.title === 'string' ? evidence.title : `Match ${index + 1}`,
      source: 'Qdrant',
      similarity_score: similarity,
      imageUrl: typeof evidence.imageUrl === 'string' ? evidence.imageUrl : url,
      domain: typeof evidence.domain === 'string' ? evidence.domain : 'unknown',
      crawlDate: item.timestamp,
    };
  });

  return {
    status: result.status,
    success: result.success,
    data: {
      query: imageUrl,
      totalMatches: matches.length,
      matches,
      searchTime: result.data.searchTime,
      sources: Array.from(new Set(matches.map((item) => item.source))),
    },
  };
}

// Index Image
export async function indexImage(
  imageUrl: string,
  metadata: Record<string, unknown> = {}
): Promise<{ success?: boolean; status?: string; id: string }> {
  return requestApi<{ success?: boolean; status?: string; id: string }>('/osint/index-image', {
    method: 'POST',
    body: JSON.stringify({
      imageUrl,
      metadata,
    }),
  });
}

// Batch Index Images
export async function batchIndexImages(
  images: Array<{ url: string; metadata?: Record<string, unknown> }>
): Promise<{ success?: boolean; status?: string; indexed: number; failed: number }> {
  return requestApi<{ success?: boolean; status?: string; indexed: number; failed: number }>('/osint/batch-index', {
    method: 'POST',
    body: JSON.stringify({ images }),
  });
}

// Get Collection Stats
export async function getCollectionStats(): Promise<{ success?: boolean; status?: string; data: CollectionStats }> {
  try {
    const payload = await requestApi<{ success?: boolean; status?: string; data?: CollectionStats }>(
      '/osint/stats',
      {},
      { unwrapData: false }
    );

    return {
      success: payload.success ?? true,
      status: payload.status ?? 'ok',
      data: payload.data ?? {
        totalPoints: 0,
        vectorSize: 0,
        estimatedMemory: 'n/a',
        lastUpdated: new Date(0).toISOString(),
      },
    };
  } catch {
    return {
      success: false,
      status: 'unavailable',
      data: {
        totalPoints: 0,
        vectorSize: 0,
        estimatedMemory: 'n/a',
        lastUpdated: new Date(0).toISOString(),
      },
    };
  }
}

// ============ React Query Hooks ============

// Universal Search Hook
export function useOSINTSearch(params: OSINTSearchQuery, enabled: boolean = false) {
  return useQuery({
    queryKey: osintQueryKeys.search(params.query, params.type),
    queryFn: () => universalSearch(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Username Search Hook
export function useUsernameSearch(username: string, comprehensive: boolean = false) {
  return useQuery({
    queryKey: osintQueryKeys.username(username),
    queryFn: () => searchUsername(username, comprehensive),
    enabled: !!username && username.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Email Search Hook with Breach Detection
export function useEmailSearch(email: string, checkBreaches: boolean = true) {
  return useQuery({
    queryKey: osintQueryKeys.email(email),
    queryFn: () => searchEmail(email, checkBreaches),
    enabled: !!email && email.includes('@'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Phone Search Hook
export function usePhoneSearch(phone: string) {
  return useQuery({
    queryKey: osintQueryKeys.phone(phone),
    queryFn: () => searchPhone(phone),
    enabled: !!phone && phone.length > 5,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Domain Search Hook
export function useDomainSearch(domain: string, comprehensive: boolean = false) {
  return useQuery({
    queryKey: osintQueryKeys.domain(domain),
    queryFn: () => searchDomain(domain, comprehensive),
    enabled: !!domain && domain.includes('.'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// IP Search Hook
export function useIPSearch(ip: string) {
  return useQuery({
    queryKey: osintQueryKeys.ip(ip),
    queryFn: () => searchIP(ip),
    enabled: !!ip && ip.length > 6,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Reverse Image Search Hook
export function useReverseImageSearch(imageUrl: string, includeWeb: boolean = true) {
  return useQuery({
    queryKey: osintQueryKeys.image(imageUrl),
    queryFn: () => reverseImageSearch(imageUrl, includeWeb),
    enabled: !!imageUrl && imageUrl.startsWith('http'),
    staleTime: 10 * 60 * 1000, // Longer cache for images
    gcTime: 20 * 60 * 1000,
  });
}

// Collection Stats Hook
export function useCollectionStats() {
  return useQuery({
    queryKey: osintQueryKeys.stats(),
    queryFn: getCollectionStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// Index Image Mutation
export function useIndexImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { imageUrl: string; metadata?: Record<string, unknown> }) =>
      indexImage(params.imageUrl, params.metadata),
    onSuccess: () => {
      // Invalidate stats after indexing
      queryClient.invalidateQueries({ queryKey: osintQueryKeys.stats() });
    },
  });
}

// Batch Index Images Mutation
export function useBatchIndexImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (images: Array<{ url: string; metadata?: Record<string, unknown> }>) =>
      batchIndexImages(images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: osintQueryKeys.stats() });
    },
  });
}

// ============ Error Handler ============

export function getErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}
