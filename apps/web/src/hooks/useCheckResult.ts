'use client';

import { useEffect, useState } from 'react';
import { getApiErrorMessage, requestApi } from '@/lib/http-client';

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

interface ApiEnvelope<T> {
  status: string;
  data: T;
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
        const payload = await requestApi<ApiEnvelope<CheckResult>>(`/checks/${checkId}`, {}, { unwrapData: false });
        const result = payload.data;
        setData(result);
        setError(null);

        // Stop polling if check is completed
        if (result.status === 'completed' || result.status === 'failed') {
          return; // Stop refetching
        }
      } catch (err) {
        setError(new Error(getApiErrorMessage(err, 'Check result could not be loaded')));
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
