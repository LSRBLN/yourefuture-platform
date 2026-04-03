import type { RemovalCaseRecord } from '@trustshield/core';

const trustshieldApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_TRUSTSHIELD_API_URL ??
  'http://localhost:4000';

const trustshieldBridgeHeaders = {
  'x-trustshield-subject': 'member-web-app',
  'x-trustshield-role': 'user',
} as const;

type ApiEnvelope<T> = {
  status?: string;
  data?: T;
};

async function fetchApi<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${trustshieldApiBaseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...trustshieldBridgeHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    return undefined;
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export async function fetchRemovalCases() {
  const envelope = await fetchApi<RemovalCaseRecord[]>('/api/v1/removal-cases');
  return Array.isArray(envelope?.data) ? envelope.data : [];
}

export async function fetchRemovalCase(caseId: string) {
  const envelope = await fetchApi<RemovalCaseRecord>(`/api/v1/removal-cases/${caseId}`);
  return envelope?.data;
}

export function getTrustshieldApiBaseUrl() {
  return trustshieldApiBaseUrl;
}

export function getTrustshieldBridgeHeaders() {
  return trustshieldBridgeHeaders;
}
