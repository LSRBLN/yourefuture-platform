const ACCESS_TOKEN_KEY = 'accessToken';
const LEGACY_AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getAccessToken(): string {
  if (!canUseStorage()) {
    return '';
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY) || '';
}

export function setAccessToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearAuthTokens() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

