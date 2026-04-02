/**
 * OSINT API Client with React Query Integration
 * Optimized for Syncfusion Components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// API Client Instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  data: any;
  timestamp: string;
  accuracy: number;
  verified: boolean;
}

export interface OSINTSearchResponse {
  success: boolean;
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
  success: boolean;
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
  success: boolean;
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

// Universal Search
export async function universalSearch(params: OSINTSearchQuery): Promise<OSINTSearchResponse> {
  const response = await apiClient.post('/osint/search', params);
  return response.data;
}

// Username Search
export async function searchUsername(
  username: string,
  comprehensive: boolean = false
): Promise<OSINTSearchResponse> {
  const response = await apiClient.post('/osint/username-search', {
    username,
    comprehensive,
  });
  return response.data;
}

// Email Search with Breach Detection
export async function searchEmail(
  email: string,
  checkBreaches: boolean = true
): Promise<EmailSearchResponse> {
  const response = await apiClient.post('/osint/email-search', {
    email,
    checkBreaches,
  });
  return response.data;
}

// Phone Search
export async function searchPhone(phone: string): Promise<OSINTSearchResponse> {
  const response = await apiClient.post('/osint/phone-search', { phone });
  return response.data;
}

// Domain Search
export async function searchDomain(
  domain: string,
  comprehensive: boolean = false
): Promise<OSINTSearchResponse> {
  const response = await apiClient.post('/osint/domain-search', {
    domain,
    comprehensive,
  });
  return response.data;
}

// IP Search
export async function searchIP(ip: string): Promise<OSINTSearchResponse> {
  const response = await apiClient.post('/osint/ip-search', { ip });
  return response.data;
}

// Reverse Image Search
export async function reverseImageSearch(
  imageUrl: string,
  includeWeb: boolean = true
): Promise<ImageSearchResponse> {
  const response = await apiClient.post('/osint/reverse-image', {
    imageUrl,
    includeWeb,
  });
  return response.data;
}

// Index Image
export async function indexImage(
  imageUrl: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; id: string }> {
  const response = await apiClient.post('/osint/index-image', {
    imageUrl,
    metadata,
  });
  return response.data;
}

// Batch Index Images
export async function batchIndexImages(
  images: Array<{ url: string; metadata?: Record<string, any> }>
): Promise<{ success: boolean; indexed: number; failed: number }> {
  const response = await apiClient.post('/osint/batch-index', { images });
  return response.data;
}

// Get Collection Stats
export async function getCollectionStats(): Promise<{ success: boolean; data: CollectionStats }> {
  const response = await apiClient.get('/osint/stats');
  return response.data;
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
    mutationFn: (params: { imageUrl: string; metadata?: Record<string, any> }) =>
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
    mutationFn: (images: Array<{ url: string; metadata?: Record<string, any> }>) =>
      batchIndexImages(images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: osintQueryKeys.stats() });
    },
  });
}

// ============ Error Handler ============

export function getErrorMessage(error: any): string {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten';
}
