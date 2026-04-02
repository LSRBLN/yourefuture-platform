'use client';

import { useEffect, useState } from 'react';

export interface CheckResult {
  id: string;
  type: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'partial_failure' | 'failed' | 'cancelled';
  input: Record<string, unknown>;
  risk?: {
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    summary: string;
    breaches?: Array<{
      providerName: string;
      breachName: string;
      breachDate: string;
      dataClasses: string[];
      isVerified: boolean;
    }>;
  };
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseCheckResultOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useCheckResult(checkId: string, options: UseCheckResultOptions = {}) {
  const { enabled = true, refetchInterval = 2000 } = options;
  const [data, setData] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !checkId) return;

    const fetchCheck = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/v1/checks/${checkId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch check: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);

        // Stop polling if check is completed
        if (result.status === 'completed' || result.status === 'failed') {
          return; // Stop refetching
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheck();

    // Poll for updates if check is still running
    const interval = setInterval(fetchCheck, refetchInterval);

    return () => clearInterval(interval);
  }, [checkId, enabled, refetchInterval]);

  return { data, isLoading, error, isSuccess: !isLoading && data && !error };
}

function getAuthToken(): string {
  // Get token from localStorage (set during login)
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}
