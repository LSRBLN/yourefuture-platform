'use client';

import { useState } from 'react';
import { getApiErrorMessage, requestApi } from '@/lib/http-client';

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

interface ApiEnvelope<T> {
  status: string;
  data: T;
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
      const payload = await requestApi<ApiEnvelope<SupportRequest[]>>('/support-requests', {}, { unwrapData: false });
      const results = payload.data;
      setData(Array.isArray(results) ? results : []);
      setError(null);
    } catch (err) {
      setError(new Error(getApiErrorMessage(err, 'Support requests could not be loaded')));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (input: CreateSupportRequestInput): Promise<SupportRequest | null> => {
    try {
      const payload = await requestApi<ApiEnvelope<SupportRequest>>('/support-requests', {
        method: 'POST',
        body: JSON.stringify(input),
      }, { unwrapData: false });
      const newRequest: SupportRequest = payload.data;
      setData((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      const error = new Error(getApiErrorMessage(err, 'Support request could not be created'));
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
      const payload = await requestApi<ApiEnvelope<SupportRequest>>(
        `/support-requests/${requestId}`,
        {},
        { unwrapData: false }
      );
      const request: SupportRequest = payload.data;
      setData(request);
      setError(null);
    } catch (err) {
      setError(new Error(getApiErrorMessage(err, 'Support request could not be loaded')));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchDetail };
}
