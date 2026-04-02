'use client';

import { useState } from 'react';

export interface SupportRequest {
  id: string;
  requestType: 'support' | 'removal' | 'upload_review' | 'identity_review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'triaged' | 'assigned' | 'in_progress' | 'waiting_user' | 'escalated' | 'resolved' | 'closed';
  message: string;
  checkId?: string;
  assetId?: string;
  removalCaseId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportRequestInput {
  requestType: 'support' | 'removal' | 'upload_review' | 'identity_review';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  checkId?: string;
  assetId?: string;
  removalCaseId?: string;
  message: string;
}

interface UseSupportRequestOptions {
  enabled?: boolean;
}

export function useSupportRequests(options: UseSupportRequestOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { enabled = true } = options;
  const [data, setData] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/support-requests', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch support requests: ${response.statusText}`);
      }

      const results = await response.json();
      setData(Array.isArray(results) ? results : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (input: CreateSupportRequestInput): Promise<SupportRequest | null> => {
    try {
      const response = await fetch('/api/v1/support-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Failed to create support request: ${response.statusText}`);
      }

      const newRequest: SupportRequest = await response.json();
      setData((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw error;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchRequests,
    createRequest,
  };
}

export function useSupportRequestDetail(requestId: string) {
  const [data, setData] = useState<SupportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/support-requests/${requestId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch support request: ${response.statusText}`);
      }

      const request: SupportRequest = await response.json();
      setData(request);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchDetail };
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}
