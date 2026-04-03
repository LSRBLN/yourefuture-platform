import { resolveApiUrl } from './api-base-url';
import { getAccessToken } from './auth-storage';

type ApiEnvelope<T> = {
  status?: string;
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestApiOptions = {
  requireAuth?: boolean;
  unwrapData?: boolean;
};

function resolveRequestApiOptions(thirdArg?: boolean | RequestApiOptions): Required<RequestApiOptions> {
  if (typeof thirdArg === 'boolean') {
    return {
      requireAuth: thirdArg,
      unwrapData: true,
    };
  }

  return {
    requireAuth: thirdArg?.requireAuth ?? true,
    unwrapData: thirdArg?.unwrapData ?? true,
  };
}

export function getApiErrorMessage(error: unknown, fallback = 'Ein unbekannter Fehler ist aufgetreten'): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return fallback;
}

export async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  thirdArg?: boolean | RequestApiOptions
): Promise<T> {
  const { requireAuth, unwrapData } = resolveRequestApiOptions(thirdArg);
  const token = requireAuth ? getAccessToken() : '';
  const headers = new Headers(init.headers ?? {});

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });

  const raw = await response.text();
  let payload: ApiEnvelope<T> | T | null = null;

  try {
    payload = raw ? (JSON.parse(raw) as ApiEnvelope<T> | T) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string' && payload.message) ||
      (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' && payload.error) ||
      `HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }

  if (unwrapData && payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as ApiEnvelope<T>;

    if (envelope.success === false) {
      throw new ApiError(envelope.message || envelope.error || 'API request failed', response.status);
    }

    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }

  return payload as T;
}
