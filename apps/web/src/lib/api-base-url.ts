const DEFAULT_BACKEND_ORIGIN = 'http://localhost:4000';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/**
 * Normalisierte API-Basis für Browser- und Server-Code.
 * Liefert immer eine URL inkl. `/api/v1` ohne abschließenden Slash.
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_TRUSTSHIELD_API_URL ??
    DEFAULT_BACKEND_ORIGIN;

  const normalized = trimTrailingSlash(raw);
  return normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`;
}

export function resolveApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

