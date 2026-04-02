'use client';

import { useState } from 'react';

export interface CreateCheckInput {
  type: 'leak_email' | 'leak_username' | 'leak_phone' | 'leak_domain' | 'image' | 'video' | 'source_only';
  input: {
    email?: string;
    username?: string;
    phone?: string;
    domain?: string;
    assetId?: string;
  };
  submittedSourceIds?: string[];
}

export interface CheckResponse {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

interface UseCreateCheckOptions {
  onSuccess?: (data: CheckResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateCheck(options: UseCreateCheckOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<CheckResponse | null>(null);

  const mutate = async (input: CreateCheckInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create check: ${response.statusText}`
        );
      }

      const result: CheckResponse = await response.json();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    error,
    data,
    isSuccess: !isLoading && data && !error,
  };
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}
