import { createPrivateKey, createPublicKey, sign as signSignature, verify as verifySignature } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { HttpError } from '../../modules/shared/http.js';

export type JwtTokenKind = 'access' | 'refresh';

export type JwtPayload = {
  sub: string;
  jti: string;
  typ: JwtTokenKind;
  iat: number;
  exp: number;
  aud?: string;
  iss?: string;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new HttpError(500, `Missing ${name}`);
  }

  return value;
}

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function resolvePrivateKeyPem() {
  const inline = readOptionalEnv('JWT_PRIVATE_KEY');

  if (inline) {
    return inline;
  }

  const path = readRequiredEnv('JWT_PRIVATE_KEY_PATH');
  return readFileSync(path, 'utf8');
}

function resolvePublicKeyPem() {
  const inline = readOptionalEnv('JWT_PUBLIC_KEY');

  if (inline) {
    return inline;
  }

  const path = readRequiredEnv('JWT_PUBLIC_KEY_PATH');
  return readFileSync(path, 'utf8');
}

function getPrivateKey() {
  return createPrivateKey(resolvePrivateKeyPem());
}

function getPublicKey() {
  return createPublicKey(resolvePublicKeyPem());
}

export function signJwt(payload: JwtPayload) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = signSignature('RSA-SHA256', Buffer.from(signingInput), getPrivateKey()).toString('base64url');
  return `${signingInput}.${signature}`;
}

export function verifyJwt(token: string, expectedType: JwtTokenKind) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = Buffer.from(encodedSignature, 'base64url');
  const validSignature = verifySignature('RSA-SHA256', Buffer.from(signingInput), getPublicKey(), signature);

  if (!validSignature) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  let payload: JwtPayload;

  try {
    payload = JSON.parse(decodeBase64Url(encodedPayload)) as JwtPayload;
  } catch {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const nowEpoch = Math.floor(Date.now() / 1000);

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.jti !== 'string' ||
    payload.typ !== expectedType ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number' ||
    payload.exp <= nowEpoch
  ) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const issuer = readOptionalEnv('JWT_ISSUER');

  if (issuer && payload.iss !== issuer) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  const audience = readOptionalEnv('JWT_AUDIENCE');

  if (audience && payload.aud !== audience) {
    throw new HttpError(401, 'Invalid bearer token');
  }

  return payload;
}

export function readBearerTokenFromHeaders(headers: Record<string, string | string[] | undefined> | undefined) {
  const rawHeader = headers?.authorization;
  const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!headerValue?.startsWith('Bearer ')) {
    return undefined;
  }

  return headerValue.slice('Bearer '.length).trim();
}

