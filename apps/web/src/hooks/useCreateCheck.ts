'use client';

import { useState } from 'react';
import { getApiErrorMessage, requestApi } from '@/lib/http-client';

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

      const result = await requestApi<CheckResponse>('/checks', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = new Error(getApiErrorMessage(err, 'Check could not be created'));
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
