import { createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto';
import type { JsonWebKey as CryptoJsonWebKey } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import type { ApiActorRole, ApiScopeToken } from '@trustshield/validation';
import { safeParseAuthClaims } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

type TokenKind = 'access' | 'refresh';
type AuthVerifierMode = 'bridge' | 'hybrid' | 'oidc';

type RawTokenPayload = {
  sub: string;
  email: string;
  role: ApiActorRole;
  scopes: ApiScopeToken[];
  tenantId?: string;
  type: TokenKind;
  exp: number;
};

export type VerifiedAuthToken = {
  subject: string;
  email: string;
  role: ApiActorRole;
  scopes: ApiScopeToken[];
  tenantId?: string;
  type: TokenKind;
  expiresAt: number;
};

type JwtHeader = {
  alg?: string;
  typ?: string;
  kid?: string;
};

type OidcLikePayload = {
  sub?: string;
  email?: string;
  scope?: string | string[];
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
  azp?: string;
  token_use?: string;
  org_id?: string;
  tenantId?: string;
  [claimName: string]: unknown;
};

type JwkKey = CryptoJsonWebKey & {
  kid?: string;
  use?: string;
  alg?: string;
  kty?: string;
};

type JwksDocument = {
  keys?: JwkKey[];
};

function getAuthTokenSecret() {
  const secret = process.env.TRUSTSHIELD_AUTH_TOKEN_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new HttpError(500, 'Missing TRUSTSHIELD_AUTH_TOKEN_SECRET');
  }

  return 'trustshield-dev-secret';
}

function getAuthVerifierMode(): AuthVerifierMode {
  const mode = process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE?.trim().toLowerCase();

  if (mode === 'bridge' || mode === 'hybrid' || mode === 'oidc') {
    return mode;
  }

  return process.env.NODE_ENV === 'production' ? 'hybrid' : 'bridge';
}

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signSignature(input: string) {
  return createHmac('sha256', getAuthTokenSecret()).update(input).digest('base64url');
}

function parseTokenParts(token: string) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  return {
    encodedHeader: parts[0],
    encodedPayload: parts[1],
    signature: parts[2],
  };
}

function parseBase64UrlJson<T>(value: string): T {
  try {
    return JSON.parse(decodeBase64Url(value)) as T;
  } catch {
    throw new HttpError(401, 'Invalid bearer token');
  }
}

function normalizeScopes(rawScopes: unknown): ApiScopeToken[] {
  if (Array.isArray(rawScopes)) {
    return rawScopes
      .map((scope) => (typeof scope === 'string' ? scope.trim() : ''))
      .filter(Boolean) as ApiScopeToken[];
  }

  if (typeof rawScopes === 'string') {
    return rawScopes
      .split(/[,\s]+/u)
      .map((scope) => scope.trim())
      .filter(Boolean) as ApiScopeToken[];
  }

  return [];
}

function readOidcRole(payload: OidcLikePayload): ApiActorRole {
  const configuredClaim = getOptionalEnv('TRUSTSHIELD_OIDC_ROLE_CLAIM') ?? 'trustshield_role';
  const rawValue = payload[configuredClaim];

  if (typeof rawValue === 'string' && rawValue.length > 0) {
    return rawValue as ApiActorRole;
  }

  return 'user';
}

function readOidcScopes(payload: OidcLikePayload): ApiScopeToken[] {
  const configuredClaim = getOptionalEnv('TRUSTSHIELD_OIDC_SCOPES_CLAIM') ?? 'scope';
  return normalizeScopes(payload[configuredClaim]);
}

function readOidcTenantId(payload: OidcLikePayload) {
  const configuredClaim = getOptionalEnv('TRUSTSHIELD_OIDC_TENANT_CLAIM') ?? 'org_id';
  const rawValue = payload[configuredClaim] ?? payload.tenantId;
  return typeof rawValue === 'string' && rawValue.length > 0 ? rawValue : undefined;
}

function readOidcAudience(payload: OidcLikePayload) {
  if (Array.isArray(payload.aud)) {
    return payload.aud.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }

  return typeof payload.aud === 'string' && payload.aud.length > 0 ? [payload.aud] : [];
}

function readOidcJwksKeys() {
  const rawValue = getOptionalEnv('TRUSTSHIELD_OIDC_JWKS_JSON');

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as JwksDocument;
    return Array.isArray(parsed.keys) ? parsed.keys : [];
  } catch {
    throw new HttpError(500, 'Invalid TRUSTSHIELD_OIDC_JWKS_JSON');
  }
}

function resolveOidcVerificationKey(header: JwtHeader) {
  const jwksKeys = readOidcJwksKeys();

  if (jwksKeys.length > 0) {
    const matchingKey =
      jwksKeys.find((key) => key.kid && header.kid && key.kid === header.kid) ??
      jwksKeys.find((key) => !header.kid && (!key.use || key.use === 'sig')) ??
      jwksKeys.find((key) => !key.use || key.use === 'sig');

    if (matchingKey) {
      return createPublicKey({
        key: matchingKey as CryptoJsonWebKey,
        format: 'jwk',
      });
    }
  }

  const publicKey = getOptionalEnv('TRUSTSHIELD_OIDC_PUBLIC_KEY');
  return publicKey ? createPublicKey(publicKey) : undefined;
}

function verifyOidcSignature(header: JwtHeader, signedContent: string, signature: string) {
  const signatureBuffer = Buffer.from(signature, 'base64url');

  if (header.alg === 'RS256') {
    const publicKey = resolveOidcVerificationKey(header);

    if (!publicKey) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    const verified = verifySignature('RSA-SHA256', Buffer.from(signedContent), publicKey, signatureBuffer);

    if (!verified) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    return;
  }

  if (header.alg === 'HS256') {
    const secret = getOptionalEnv('TRUSTSHIELD_OIDC_SHARED_SECRET') ?? getOptionalEnv('TRUSTSHIELD_AUTH_TOKEN_SECRET');

    if (!secret) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    const expected = createHmac('sha256', secret).update(signedContent).digest('base64url');

    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    return;
  }

  throw new HttpError(401, 'Invalid bearer token');
}

function verifyOidcToken(token: string, expectedType: Extract<TokenKind, 'access'>): VerifiedAuthToken {
  const { encodedHeader, encodedPayload, signature } = parseTokenParts(token);
  const header = parseBase64UrlJson<JwtHeader>(encodedHeader);
  const payload = parseBase64UrlJson<OidcLikePayload>(encodedPayload);
  const signedContent = `${encodedHeader}.${encodedPayload}`;

  verifyOidcSignature(header, signedContent, signature);

  if (!payload.sub || !payload.exp || payload.exp * 1000 <= Date.now()) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const expectedIssuer = getOptionalEnv('TRUSTSHIELD_OIDC_ISSUER');

  if (expectedIssuer && payload.iss !== expectedIssuer) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const expectedAudience = getOptionalEnv('TRUSTSHIELD_OIDC_AUDIENCE');

  if (expectedAudience) {
    const audiences = readOidcAudience(payload);

    if (!audiences.includes(expectedAudience)) {
      throw new HttpError(401, 'Invalid bearer token');
    }
  }

  if (expectedType === 'access' && payload.token_use && payload.token_use !== 'access') {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const claims = safeParseAuthClaims({
    subject: payload.sub,
    role: readOidcRole(payload),
    scopes: readOidcScopes(payload),
    tenantId: readOidcTenantId(payload),
  });

  if (!claims.success) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  return {
    subject: payload.sub,
    email: typeof payload.email === 'string' && payload.email.length > 0 ? payload.email : `${payload.sub}@external.invalid`,
    role: claims.data.role,
    scopes: claims.data.scopes,
    tenantId: claims.data.tenantId,
    type: expectedType,
    expiresAt: payload.exp,
  };
}

function verifyToken(token: string, expectedType: TokenKind): VerifiedAuthToken {
  const { encodedHeader, encodedPayload, signature } = parseTokenParts(token);
  const signedContent = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signSignature(signedContent);

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  let payload: RawTokenPayload;

  try {
    payload = JSON.parse(decodeBase64Url(encodedPayload)) as RawTokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const claims = safeParseAuthClaims({
    subject: payload.sub,
    role: payload.role,
    scopes: payload.scopes,
    tenantId: payload.tenantId,
  });

  if (!claims.success || payload.type !== expectedType || payload.exp * 1000 <= Date.now()) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  return {
    subject: claims.data.subject ?? payload.sub,
    email: payload.email,
    role: claims.data.role,
    scopes: claims.data.scopes,
    tenantId: claims.data.tenantId,
    type: payload.type,
    expiresAt: payload.exp,
  };
}

function verifyTokenByMode(token: string, expectedType: TokenKind) {
  const mode = getAuthVerifierMode();
  const tryOidc = mode === 'hybrid' || mode === 'oidc';
  const tryBridge = mode === 'hybrid' || mode === 'bridge';

  if (tryOidc && expectedType === 'access') {
    try {
      return verifyOidcToken(token, expectedType);
    } catch (error) {
      if (!tryBridge) {
        throw error;
      }
    }
  }

  if (tryBridge) {
    return verifyToken(token, expectedType);
  }

  throw new HttpError(401, 'Invalid bearer token');
}

function signToken(
  tokenKind: TokenKind,
  payload: {
    subject: string;
    email: string;
    role: ApiActorRole;
    scopes: ApiScopeToken[];
    tenantId?: string;
  },
  ttlSeconds: number,
) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(
    JSON.stringify({
      sub: payload.subject,
      email: payload.email,
      role: payload.role,
      scopes: payload.scopes,
      tenantId: payload.tenantId,
      type: tokenKind,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    } satisfies RawTokenPayload),
  );

  return `${header}.${body}.${signSignature(`${header}.${body}`)}`;
}

export function readBearerToken(request: IncomingMessage) {
  const rawHeader = request.headers?.authorization;
  const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!headerValue?.startsWith('Bearer ')) {
    return undefined;
  }

  return headerValue.slice('Bearer '.length).trim();
}

export function signAccessToken(payload: {
  subject: string;
  email: string;
  role: ApiActorRole;
  scopes: ApiScopeToken[];
  tenantId?: string;
}) {
  // Access tokens valid for 15 minutes
  // Must be refreshed via /api/v1/auth/refresh endpoint using refresh_token
  return signToken('access', payload, 15 * 60);
}

export function signRefreshToken(payload: {
  subject: string;
  email: string;
  role: ApiActorRole;
  scopes: ApiScopeToken[];
  tenantId?: string;
}) {
  // Refresh tokens valid for 7 days
  // Used only at /api/v1/auth/refresh to obtain new access_token
  // Never sent to backend APIs; kept client-side in secure storage
  return signToken('refresh', payload, 7 * 24 * 60 * 60);
}

export function verifyAccessToken(token: string) {
  return verifyTokenByMode(token, 'access');
}

export function verifyRefreshToken(token: string) {
  return verifyTokenByMode(token, 'refresh');
}
