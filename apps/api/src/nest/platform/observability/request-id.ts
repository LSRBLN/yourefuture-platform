import { randomUUID } from 'node:crypto';

export type HttpHeadersLike = Record<string, string | string[] | undefined>;

function normalizeSingleHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveRequestId(headers?: HttpHeadersLike): string {
  return normalizeSingleHeaderValue(headers?.['x-request-id']) ?? randomUUID();
}

