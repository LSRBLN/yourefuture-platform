import assert from 'node:assert/strict';
import { createHmac, generateKeyPairSync, sign as signSignature } from 'node:crypto';
import test from 'node:test';

import { createApiApp } from './app.module.js';

const adminHeaders = {
  'x-trustshield-subject': 'ops-admin-1',
  'x-trustshield-role': 'admin',
} as const;

function createUserHeaders(subject: string) {
  return {
    'x-trustshield-subject': subject,
    'x-trustshield-role': 'user',
  } as const;
}

const userHeaders = (subject: string) =>
  ({
    'x-trustshield-subject': subject,
    'x-trustshield-role': 'user',
  }) as const;

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function signHs256Jwt(payload: Record<string, unknown>, secret: string) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function signRs256Jwt(payload: Record<string, unknown>, privateKey: Parameters<typeof signSignature>[2], kid: string) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = signSignature('RSA-SHA256', Buffer.from(`${header}.${body}`), privateKey).toString('base64url');
  return `${header}.${body}.${signature}`;
}

async function invoke(path: string, method: string, body?: unknown, headers?: Record<string, string>) {
  const app = createApiApp();
  return invokeWithApp(app, path, method, body, headers);
}

async function invokeWithApp(
  app: ReturnType<typeof createApiApp>,
  path: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>,
) {
  let responseBody = '';
  const response = {
    writeHead: (_statusCode: number, _headers: Record<string, string>) => undefined,
    end: (chunk?: string) => {
      responseBody = chunk ?? '';
    },
  } as unknown as import('node:http').ServerResponse;

  async function* bodyIterator() {
    if (body !== undefined) {
      yield Buffer.from(JSON.stringify(body));
    }
  }

  const request = {
    method,
    url: path,
    headers,
    [Symbol.asyncIterator]: bodyIterator,
  } as unknown as import('node:http').IncomingMessage;

  await app.handle(request, response);
  return JSON.parse(responseBody) as Record<string, unknown>;
}

function createInvoker() {
  const app = createApiApp();

  return {
    invoke: (path: string, method: string, body?: unknown, headers?: Record<string, string>) =>
      invokeWithApp(app, path, method, body, headers),
  };
}

async function invokeWithRawBody(path: string, method: string, rawBody: string, headers?: Record<string, string>) {
  const app = createApiApp();
  let responseBody = '';
  let statusCode = 0;
  const response = {
    writeHead: (nextStatusCode: number) => {
      statusCode = nextStatusCode;
    },
    end: (chunk?: string) => {
      responseBody = chunk ?? '';
    },
  } as unknown as import('node:http').ServerResponse;

  async function* bodyIterator() {
    yield Buffer.from(rawBody);
  }

  const request = {
    method,
    url: path,
    headers,
    [Symbol.asyncIterator]: bodyIterator,
  } as unknown as import('node:http').IncomingMessage;

  await app.handle(request, response);
  return {
    statusCode,
    body: JSON.parse(responseBody) as Record<string, unknown>,
  };
}

test('GET /api/v1/health liefert versionierte Plattform-Metadaten', async () => {
  const result = await invoke('/api/v1/health', 'GET');

  assert.equal(result.status, 'ok');
  assert.equal(result.apiVersion, 'v1');
  assert.equal(result.apiBasePath, '/api/v1');
  assert.equal(result.transitionTarget, 'none');
});

test('POST /api/v1/auth/register registriert Nutzer und liefert Tokens', async () => {
  const client = createInvoker();
  const result = await client.invoke('/api/v1/auth/register', 'POST', {
    email: 'member@example.com',
    password: 'supersecret1',
    fullName: 'Member Example',
  });

  assert.equal((result.user as { email: string }).email, 'member@example.com');
  assert.equal((result.user as { role: string }).role, 'user');
  assert.equal(typeof result.token, 'string');
  assert.equal(typeof result.refreshToken, 'string');
});

test('POST /api/v1/auth/register blockiert doppelte Registrierung', async () => {
  const client = createInvoker();

  await client.invoke('/api/v1/auth/register', 'POST', {
    email: 'duplicate@example.com',
    password: 'supersecret1',
  });

  const duplicate = await client.invoke('/api/v1/auth/register', 'POST', {
    email: 'duplicate@example.com',
    password: 'supersecret1',
  });

  assert.equal((duplicate.error as { message: string }).message, 'User with this e-mail already exists');
});

test('POST /api/v1/auth/login und GET /api/v1/auth/me bilden Bearer-Flow ab', async () => {
  const client = createInvoker();

  await client.invoke('/api/v1/auth/register', 'POST', {
    email: 'session@example.com',
    password: 'supersecret1',
  });

  const login = await client.invoke('/api/v1/auth/login', 'POST', {
    email: 'session@example.com',
    password: 'supersecret1',
  });

  const me = await client.invoke('/api/v1/auth/me', 'GET', undefined, {
    authorization: `Bearer ${login.token as string}`,
  });

  assert.equal((me.id as string).length > 0, true);
  assert.equal(me.email, 'session@example.com');
  assert.equal(me.role, 'user');
});

test('GET /api/v1/auth/me akzeptiert OIDC-kompatible Bearer-Tokens mit passendem Issuer und Audience', async () => {
  const previousMode = process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE;
  const previousSecret = process.env.TRUSTSHIELD_OIDC_SHARED_SECRET;
  const previousIssuer = process.env.TRUSTSHIELD_OIDC_ISSUER;
  const previousAudience = process.env.TRUSTSHIELD_OIDC_AUDIENCE;

  process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = 'oidc';
  process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = 'oidc-test-secret';
  process.env.TRUSTSHIELD_OIDC_ISSUER = 'https://issuer.example.com';
  process.env.TRUSTSHIELD_OIDC_AUDIENCE = 'trustshield-api';

  try {
    const token = signHs256Jwt(
      {
        sub: 'oidc-user-1',
        email: 'oidc-user@example.com',
        iss: 'https://issuer.example.com',
        aud: 'trustshield-api',
        exp: Math.floor(Date.now() / 1000) + 60,
        scope: 'checks:create checks:read',
        trustshield_role: 'user',
        token_use: 'access',
      },
      'oidc-test-secret',
    );

    const me = await invoke('/api/v1/auth/me', 'GET', undefined, {
      authorization: `Bearer ${token}`,
    });

    assert.equal(me.id, 'oidc-user-1');
    assert.equal(me.email, 'oidc-user@example.com');
    assert.equal(me.role, 'user');
  } finally {
    process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = previousMode;
    process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = previousSecret;
    process.env.TRUSTSHIELD_OIDC_ISSUER = previousIssuer;
    process.env.TRUSTSHIELD_OIDC_AUDIENCE = previousAudience;
  }
});

test('GET /api/v1/auth/me akzeptiert RS256-OIDC-Bearer via JWKS-JSON', async () => {
  const previousMode = process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE;
  const previousJwks = process.env.TRUSTSHIELD_OIDC_JWKS_JSON;
  const previousIssuer = process.env.TRUSTSHIELD_OIDC_ISSUER;
  const previousAudience = process.env.TRUSTSHIELD_OIDC_AUDIENCE;

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const jwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;

  process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = 'oidc';
  process.env.TRUSTSHIELD_OIDC_JWKS_JSON = JSON.stringify({
    keys: [{ ...jwk, kid: 'jwks-key-1', use: 'sig', alg: 'RS256' }],
  });
  process.env.TRUSTSHIELD_OIDC_ISSUER = 'https://issuer.example.com';
  process.env.TRUSTSHIELD_OIDC_AUDIENCE = 'trustshield-api';

  try {
    const token = signRs256Jwt(
      {
        sub: 'oidc-jwks-user-1',
        email: 'oidc-jwks@example.com',
        iss: 'https://issuer.example.com',
        aud: 'trustshield-api',
        exp: Math.floor(Date.now() / 1000) + 60,
        scope: 'checks:create checks:read',
        trustshield_role: 'user',
        token_use: 'access',
      },
      privateKey,
      'jwks-key-1',
    );

    const me = await invoke('/api/v1/auth/me', 'GET', undefined, {
      authorization: `Bearer ${token}`,
    });

    assert.equal(me.id, 'oidc-jwks-user-1');
    assert.equal(me.email, 'oidc-jwks@example.com');
    assert.equal(me.role, 'user');
  } finally {
    process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = previousMode;
    process.env.TRUSTSHIELD_OIDC_JWKS_JSON = previousJwks;
    process.env.TRUSTSHIELD_OIDC_ISSUER = previousIssuer;
    process.env.TRUSTSHIELD_OIDC_AUDIENCE = previousAudience;
  }
});

test('GET /api/v1/auth/me weist OIDC-Bearer mit falschem Issuer oder Audience ab', async () => {
  const previousMode = process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE;
  const previousSecret = process.env.TRUSTSHIELD_OIDC_SHARED_SECRET;
  const previousIssuer = process.env.TRUSTSHIELD_OIDC_ISSUER;
  const previousAudience = process.env.TRUSTSHIELD_OIDC_AUDIENCE;

  process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = 'oidc';
  process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = 'oidc-test-secret';
  process.env.TRUSTSHIELD_OIDC_ISSUER = 'https://issuer.example.com';
  process.env.TRUSTSHIELD_OIDC_AUDIENCE = 'trustshield-api';

  try {
    const token = signHs256Jwt(
      {
        sub: 'oidc-user-2',
        email: 'oidc-user2@example.com',
        iss: 'https://wrong-issuer.example.com',
        aud: 'wrong-audience',
        exp: Math.floor(Date.now() / 1000) + 60,
        trustshield_role: 'user',
        token_use: 'access',
      },
      'oidc-test-secret',
    );

    const rejected = await invoke('/api/v1/auth/me', 'GET', undefined, {
      authorization: `Bearer ${token}`,
    });

    assert.equal((rejected.error as { message: string }).message, 'Invalid bearer token');
  } finally {
    process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = previousMode;
    process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = previousSecret;
    process.env.TRUSTSHIELD_OIDC_ISSUER = previousIssuer;
    process.env.TRUSTSHIELD_OIDC_AUDIENCE = previousAudience;
  }
});

test('GET /api/v1/auth/me priorisiert Bearer-Identitaet vor widerspruechlichen Bridge-Headern', async () => {
  const previousMode = process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE;
  const previousSecret = process.env.TRUSTSHIELD_OIDC_SHARED_SECRET;
  const previousIssuer = process.env.TRUSTSHIELD_OIDC_ISSUER;
  const previousAudience = process.env.TRUSTSHIELD_OIDC_AUDIENCE;
  const previousAllowHeaderAuth = process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH;

  process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = 'oidc';
  process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = 'oidc-test-secret';
  process.env.TRUSTSHIELD_OIDC_ISSUER = 'https://issuer.example.com';
  process.env.TRUSTSHIELD_OIDC_AUDIENCE = 'trustshield-api';
  process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH = 'true';

  try {
    const token = signHs256Jwt(
      {
        sub: 'oidc-user-priority',
        email: 'priority@example.com',
        iss: 'https://issuer.example.com',
        aud: 'trustshield-api',
        exp: Math.floor(Date.now() / 1000) + 60,
        trustshield_role: 'user',
        token_use: 'access',
      },
      'oidc-test-secret',
    );

    const me = await invoke('/api/v1/auth/me', 'GET', undefined, {
      authorization: `Bearer ${token}`,
      'x-trustshield-subject': 'spoofed-admin',
      'x-trustshield-role': 'admin',
    });

    assert.equal(me.id, 'oidc-user-priority');
    assert.equal(me.email, 'priority@example.com');
    assert.equal(me.role, 'user');
  } finally {
    process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = previousMode;
    process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = previousSecret;
    process.env.TRUSTSHIELD_OIDC_ISSUER = previousIssuer;
    process.env.TRUSTSHIELD_OIDC_AUDIENCE = previousAudience;
    process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH = previousAllowHeaderAuth;
  }
});

test('GET /api/v1/auth/me faellt bei kaputtem Bearer nicht still auf Bridge-Header zurueck', async () => {
  const previousMode = process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE;
  const previousSecret = process.env.TRUSTSHIELD_OIDC_SHARED_SECRET;
  const previousIssuer = process.env.TRUSTSHIELD_OIDC_ISSUER;
  const previousAudience = process.env.TRUSTSHIELD_OIDC_AUDIENCE;
  const previousAllowHeaderAuth = process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH;

  process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = 'oidc';
  process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = 'oidc-test-secret';
  process.env.TRUSTSHIELD_OIDC_ISSUER = 'https://issuer.example.com';
  process.env.TRUSTSHIELD_OIDC_AUDIENCE = 'trustshield-api';
  process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH = 'true';

  try {
    const token = signHs256Jwt(
      {
        sub: 'oidc-user-invalid',
        email: 'invalid@example.com',
        iss: 'https://wrong-issuer.example.com',
        aud: 'trustshield-api',
        exp: Math.floor(Date.now() / 1000) + 60,
        trustshield_role: 'user',
        token_use: 'access',
      },
      'oidc-test-secret',
    );

    const rejected = await invoke('/api/v1/auth/me', 'GET', undefined, {
      authorization: `Bearer ${token}`,
      'x-trustshield-subject': 'fallback-user',
      'x-trustshield-role': 'admin',
    });

    assert.equal((rejected.error as { message: string }).message, 'Invalid bearer token');
  } finally {
    process.env.TRUSTSHIELD_AUTH_VERIFIER_MODE = previousMode;
    process.env.TRUSTSHIELD_OIDC_SHARED_SECRET = previousSecret;
    process.env.TRUSTSHIELD_OIDC_ISSUER = previousIssuer;
    process.env.TRUSTSHIELD_OIDC_AUDIENCE = previousAudience;
    process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH = previousAllowHeaderAuth;
  }
});

test('POST /api/v1/auth/refresh rotiert Access-Token und GET /api/v1/auth/me verlangt Auth', async () => {
  const client = createInvoker();

  const registered = await client.invoke('/api/v1/auth/register', 'POST', {
    email: 'refresh@example.com',
    password: 'supersecret1',
  });

  const refreshed = await client.invoke('/api/v1/auth/refresh', 'POST', {
    refreshToken: registered.refreshToken,
  });

  assert.equal(typeof refreshed.token, 'string');
  assert.equal(typeof refreshed.refreshToken, 'string');

  const unauthorized = await client.invoke('/api/v1/auth/me', 'GET');
  assert.equal((unauthorized.error as { message: string }).message, 'Authentication required');
});

test('GET /api/v1/jobs/topology blockiert Header-Bootstrap ohne explizites Fallback-Flag', async () => {
  const previousAllowHeaderAuth = process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH;

  process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH = 'false';

  try {
    const result = await invoke('/api/v1/jobs/topology', 'GET', undefined, adminHeaders);
    assert.equal((result.error as { message: string }).message, 'Authentication required');
  } finally {
    process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH = previousAllowHeaderAuth;
  }
});

test('POST /api/v1/auth/login begrenzt wiederholte Fehlversuche per Rate-Limit', async () => {
  const client = createInvoker();
  const rateLimitHeaders = {
    'x-forwarded-for': '203.0.113.10',
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await client.invoke(
      '/api/v1/auth/login',
      'POST',
      {
        email: 'unknown@example.com',
        password: 'supersecret1',
      },
      rateLimitHeaders,
    );

    assert.equal((result.error as { message: string }).message, 'Invalid credentials');
  }

  const blocked = await client.invoke(
    '/api/v1/auth/login',
    'POST',
    {
      email: 'unknown@example.com',
      password: 'supersecret1',
    },
    rateLimitHeaders,
  );

  assert.equal((blocked.error as { message: string }).message, 'Rate limit exceeded');
  assert.equal(typeof ((blocked.error as { details: { retryAfterSeconds: number } }).details.retryAfterSeconds), 'number');
});

test('GET/PATCH/DELETE /api/v1/users/me bilden Self-Service-Profilfluss ab', async () => {
  const client = createInvoker();
  const registered = await client.invoke('/api/v1/auth/register', 'POST', {
    email: 'profile@example.com',
    password: 'supersecret1',
  });
  const authHeaders = {
    authorization: `Bearer ${registered.token as string}`,
  };

  const updated = await client.invoke(
    '/api/v1/users/me',
    'PATCH',
    {
      fullName: 'Profile Example',
      locale: 'de',
      timezone: 'Europe/Berlin',
      preferredContact: 'secure_portal',
    },
    authHeaders,
  );

  assert.equal(updated.fullName, 'Profile Example');
  assert.equal(updated.locale, 'de');

  const me = await client.invoke('/api/v1/users/me', 'GET', undefined, authHeaders);
  assert.equal(me.fullName, 'Profile Example');
  assert.equal(me.email, 'profile@example.com');

  const deleted = await client.invoke('/api/v1/users/me', 'DELETE', undefined, authHeaders);
  assert.equal(deleted.status, 'deleted');
});

test('POST /api/v1/assets erstellt einen quarantänisierten Upload-Intent', async () => {
  const result = await invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'image',
      originalFilename: 'profile-photo.png',
      mimeType: 'image/png',
      fileSizeBytes: 1024 * 1024,
      sha256: 'abc123',
    },
    createUserHeaders('asset-owner-1'),
  );

  assert.equal(result.status, 'accepted');
  assert.equal((result.data as { status: string }).status, 'pending_upload');
  assert.equal((result.upload as { mode: string }).mode, 'quarantine_intent');
  assert.equal((result.upload as { method: string }).method, 'PUT');
  assert.equal(typeof ((result.upload as { uploadUrl: string }).uploadUrl), 'string');
  assert.equal(typeof ((result.upload as { expiresAt: string }).expiresAt), 'string');
});

test('POST /api/v1/assets weist unerlaubte MIME-Types ab', async () => {
  const result = await invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'image',
      originalFilename: 'payload.exe',
      mimeType: 'application/x-msdownload',
      fileSizeBytes: 1024,
    },
    createUserHeaders('asset-owner-1'),
  );

  assert.equal((result.error as { message: string }).message, 'Asset upload intent validation failed');
});

test('GET /api/v1/assets/:id erzwingt Ownership', async () => {
  const client = createInvoker();
  const created = await client.invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'image',
      originalFilename: 'evidence.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 2048,
    },
    createUserHeaders('asset-owner-2'),
  );

  const assetId = (created.data as { id: string }).id;

  const allowed = await client.invoke(`/api/v1/assets/${assetId}`, 'GET', undefined, createUserHeaders('asset-owner-2'));
  assert.equal((allowed.data as { id: string }).id, assetId);

  const denied = await client.invoke(`/api/v1/assets/${assetId}`, 'GET', undefined, createUserHeaders('different-user'));
  assert.equal((denied.error as { message: string }).message, `Asset ${assetId} not found`);
});

test('GET /api/v1/assets/:id/deepfake-results liefert leeren sicheren Platzhalterstatus', async () => {
  const client = createInvoker();
  const created = await client.invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'video',
      originalFilename: 'clip.mp4',
      mimeType: 'video/mp4',
      fileSizeBytes: 5 * 1024 * 1024,
    },
    createUserHeaders('asset-owner-3'),
  );

  const assetId = (created.data as { id: string }).id;
  const results = await client.invoke(`/api/v1/assets/${assetId}/deepfake-results`, 'GET', undefined, createUserHeaders('asset-owner-3'));

  assert.equal(results.status, 'ok');
  assert.equal((results.data as { assetId: string }).assetId, assetId);
  assert.deepEqual((results.data as { results: unknown[] }).results, []);
});

test('POST /api/v1/assets/:id/complete-upload queued sicheren Scan nach Upload-Abschluss', async () => {
  const client = createInvoker();
  const created = await client.invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'image',
      originalFilename: 'secure.png',
      mimeType: 'image/png',
      fileSizeBytes: 4096,
      sha256: 'sha-secure',
    },
    createUserHeaders('asset-owner-4'),
  );

  const assetId = (created.data as { id: string }).id;
  const completed = await client.invoke(
    `/api/v1/assets/${assetId}/complete-upload`,
    'POST',
    {
      uploadedSizeBytes: 4096,
      sha256: 'sha-secure',
      mimeType: 'image/png',
    },
    createUserHeaders('asset-owner-4'),
  );

  assert.equal((completed.data as { status: string }).status, 'uploaded');
  assert.equal((completed.queue as { name: string }).name, 'asset.scan');
});

test('POST /api/v1/assets/:id/start-scan blockiert normale User und erlaubt Admin-Operatoren', async () => {
  const client = createInvoker();
  const created = await client.invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'image',
      originalFilename: 'scan-me.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 2048,
    },
    createUserHeaders('asset-owner-5'),
  );
  const assetId = (created.data as { id: string }).id;

  await client.invoke(
    `/api/v1/assets/${assetId}/complete-upload`,
    'POST',
    {
      uploadedSizeBytes: 2048,
      mimeType: 'image/jpeg',
    },
    createUserHeaders('asset-owner-5'),
  );

  const denied = await client.invoke(`/api/v1/assets/${assetId}/start-scan`, 'POST', undefined, createUserHeaders('asset-owner-5'));
  assert.equal((denied.error as { message: string }).message, 'Insufficient permissions');

  const allowed = await client.invoke(`/api/v1/assets/${assetId}/start-scan`, 'POST', undefined, adminHeaders);
  assert.equal((allowed.data as { status: string }).status, 'scanning');
});

test('POST /api/v1/assets/:id/finalize-security promotet saubere Assets und flaggt Malware', async () => {
  const cleanClient = createInvoker();
  const cleanCreated = await cleanClient.invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'video',
      originalFilename: 'clean.mp4',
      mimeType: 'video/mp4',
      fileSizeBytes: 1024 * 1024,
    },
    createUserHeaders('asset-owner-6'),
  );
  const cleanAssetId = (cleanCreated.data as { id: string }).id;
  await cleanClient.invoke(`/api/v1/assets/${cleanAssetId}/complete-upload`, 'POST', { uploadedSizeBytes: 1024 * 1024, mimeType: 'video/mp4' }, createUserHeaders('asset-owner-6'));
  await cleanClient.invoke(`/api/v1/assets/${cleanAssetId}/start-scan`, 'POST', undefined, adminHeaders);
  const cleanFinalized = await cleanClient.invoke(
    `/api/v1/assets/${cleanAssetId}/finalize-security`,
    'POST',
    {
      mimeTypeVerified: true,
      malwareDetected: false,
    },
    adminHeaders,
  );

  assert.equal((cleanFinalized.data as { status: string }).status, 'ready');
  assert.equal((cleanFinalized.queue as { name: string }).name, 'asset.promote');

  const flaggedClient = createInvoker();
  const flaggedCreated = await flaggedClient.invoke(
    '/api/v1/assets',
    'POST',
    {
      assetType: 'document',
      originalFilename: 'payload.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 4096,
    },
    createUserHeaders('asset-owner-7'),
  );
  const flaggedAssetId = (flaggedCreated.data as { id: string }).id;
  await flaggedClient.invoke(`/api/v1/assets/${flaggedAssetId}/complete-upload`, 'POST', { uploadedSizeBytes: 4096, mimeType: 'application/pdf' }, createUserHeaders('asset-owner-7'));
  await flaggedClient.invoke(`/api/v1/assets/${flaggedAssetId}/start-scan`, 'POST', undefined, adminHeaders);
  const flaggedFinalized = await flaggedClient.invoke(
    `/api/v1/assets/${flaggedAssetId}/finalize-security`,
    'POST',
    {
      mimeTypeVerified: true,
      malwareDetected: true,
    },
    adminHeaders,
  );

  assert.equal((flaggedFinalized.data as { status: string }).status, 'flagged');
});

test('GET /api/v1/health/live liefert Liveness-Status', async () => {
  const result = await invoke('/api/v1/health/live', 'GET');

  assert.equal(result.status, 'ok');
  assert.equal(result.check, 'live');
  assert.equal(result.apiVersion, 'v1');
});

test('GET /api/v1/health/ready liefert Readiness-Status', async () => {
  const result = await invoke('/api/v1/health/ready', 'GET');

  assert.equal(result.status, 'ok');
  assert.equal(result.check, 'ready');
  assert.equal((result.dependencies as { database: string }).database, 'configured');
  assert.equal((result.dependencies as { queue: string }).queue, 'configured');
});

test('GET /api/v1/jobs/topology liefert Queue-Topologie fuer autorisierte Rollen', async () => {
  const result = await invoke('/api/v1/jobs/topology', 'GET', undefined, adminHeaders);

  assert.equal(result.status, 'ok');
  assert.equal(result.apiVersion, 'v1');
  assert.equal(Array.isArray(result.data), true);
  assert.equal((result.data as Array<{ name: string }>).some((job) => job.name === 'check.execute'), true);
});

test('GET /api/v1/jobs/topology verweigert nicht autorisierten Rollen den Zugriff', async () => {
  const result = await invoke('/api/v1/jobs/topology', 'GET', undefined, userHeaders('member-1'));

  assert.equal((result.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.error as { message: string }).message, 'Insufficient permissions');
});

test('GET /api/v1/jobs listet enqueuete Jobs aus dem Intake-Pfad', async () => {
  const client = createInvoker();

  const check = await client.invoke(
    '/api/v1/checks',
    'POST',
    {
      type: 'source_only',
      input: { submittedSourceIds: ['source-seed-1'] },
    },
    userHeaders('member-jobs-1'),
  );

  const checkId = (check.data as { id: string }).id;
  const jobs = await client.invoke('/api/v1/jobs', 'GET', undefined, adminHeaders);

  assert.equal(jobs.status, 'ok');
  assert.equal(Array.isArray(jobs.data), true);
  assert.equal(
    (jobs.data as Array<{ resourceId: string; name: string }>).some(
      (job) => job.resourceId === checkId && job.name === 'check.execute',
    ),
    true,
  );
});

test('GET /api/v1/jobs/:id liefert Job-Detail fuer autorisierte Rollen', async () => {
  const client = createInvoker();

  const check = await client.invoke(
    '/api/v1/checks',
    'POST',
    {
      type: 'source_only',
      input: { submittedSourceIds: ['source-seed-1'] },
    },
    userHeaders('member-jobs-2'),
  );

  assert.equal(check.status, 'accepted');
  const checkId = (check.data as { id: string }).id;
  const jobs = await client.invoke('/api/v1/jobs', 'GET', undefined, adminHeaders);
  const queuedJob = (jobs.data as Array<{ id: string; name: string; resourceId: string }>).find(
    (job) => job.name === 'check.execute' && job.resourceId === checkId,
  );

  assert.ok(queuedJob);

  const jobDetail = await client.invoke(`/api/v1/jobs/${queuedJob.id}`, 'GET', undefined, adminHeaders);

  assert.equal(jobDetail.status, 'ok');
  assert.equal((jobDetail.data as { id: string }).id, queuedJob.id);
});

test('Unbekannte Routen liefern das standardisierte Error-Envelope', async () => {
  const result = await invoke('/api/v1/does-not-exist', 'GET', undefined, adminHeaders);

  assert.equal((result.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.error as { message: string }).message, 'Route GET /api/v1/does-not-exist not found');
  assert.equal(typeof (result.error as { requestId: string }).requestId, 'string');
});

test('POST /checks und POST /sources bilden echten Intake-Pfad ab', async () => {
  const check = await invoke('/checks', 'POST', {
    type: 'leak_domain',
    input: { domain: 'example.org', submittedSourceIds: ['source-seed-1'] },
  });

  assert.equal(check.status, 'accepted');
  const checkId = (check.data as { id: string }).id;

  const source = await invoke('/sources', 'POST', {
    sourceType: 'document_url',
    sourceUrl: 'https://example.org/profile',
    platformName: 'Archivmirror',
    checkId,
  });

  assert.equal(source.status, 'accepted');
});

test('GET /api/v1/checks/:id respektiert Ownership fuer Endnutzer', async () => {
  const client = createInvoker();

  const created = await client.invoke(
    '/api/v1/checks',
    'POST',
    {
      type: 'source_only',
      input: { submittedSourceIds: ['source-seed-1'] },
    },
    userHeaders('member-owner-1'),
  );

  const checkId = (created.data as { id: string }).id;
  const ownResult = await client.invoke(`/api/v1/checks/${checkId}`, 'GET', undefined, userHeaders('member-owner-1'));
  const foreignResult = await client.invoke(`/api/v1/checks/${checkId}`, 'GET', undefined, userHeaders('member-foreign-1'));

  assert.equal(ownResult.status, 'ok');
  assert.equal((ownResult.data as { id: string }).id, checkId);
  assert.equal((foreignResult.error as { message: string }).message, `Check ${checkId} not found`);
});

test('POST /support-requests persistiert den Support-Intake-Endpunkt', async () => {
  const result = await invoke('/support-requests', 'POST', {
    requestType: 'support',
    priority: 'high',
    checkId: 'check-1',
    message: 'Bitte Support-Queue übernehmen',
    preferredContact: 'secure_portal',
  });

  assert.equal(result.status, 'accepted');
  assert.equal(typeof (result.data as { id: string }).id, 'string');
  assert.equal((result.data as { message: string }).message, 'Bitte Support-Queue übernehmen');
  assert.equal(Array.isArray((result.data as { statusHistory: unknown[] }).statusHistory), true);
});

test('GET /api/v1/support-requests listet fuer Endnutzer nur eigene Requests', async () => {
  const ownResult = await invoke('/api/v1/support-requests', 'GET', undefined, createUserHeaders('system-seed'));
  const foreignResult = await invoke('/api/v1/support-requests', 'GET', undefined, createUserHeaders('user-foreign-1'));

  assert.equal(ownResult.status, 'ok');
  assert.equal(Array.isArray(ownResult.data), true);
  assert.equal(
    (ownResult.data as Array<{ id: string }>).some((item) => item.id === 'support-req-1'),
    true,
  );
  assert.equal(foreignResult.status, 'ok');
  assert.equal(Array.isArray(foreignResult.data), true);
  assert.equal((foreignResult.data as unknown[]).length, 0);
});

test('POST /support-requests liefert Failure-Pfad bei ungültigem Payload', async () => {
  const result = await invoke('/support-requests', 'POST', {
    requestType: 'support',
    priority: 'medium',
    message: '   ',
  });

  assert.equal((result.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.error as { message: string }).message, 'Support request contract validation failed');
  assert.equal(typeof (result.error as { requestId: string }).requestId, 'string');
});

test('POST /checks liefert 400 mit requestId bei ungültigem JSON', async () => {
  const result = await invokeWithRawBody('/checks', 'POST', '{"type":"image",');

  assert.equal(result.statusCode, 400);
  assert.equal((result.body.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.body.error as { message: string }).message, 'Invalid JSON payload');
  assert.equal(typeof (result.body.error as { requestId: string }).requestId, 'string');
});

test('Intake-Pfad erstellt Check, Source und persistierten Support-Request als E2E-Flow', async () => {
  const check = await invoke('/checks', 'POST', {
    type: 'source_only',
    input: { submittedSourceIds: ['source-seed-1'] },
  });
  const checkId = (check.data as { id: string }).id;

  const source = await invoke('/sources', 'POST', {
    sourceType: 'document_url',
    sourceUrl: 'https://example.org/evidence',
    checkId,
  });

  const support = await invoke('/support-requests', 'POST', {
    requestType: 'support',
    priority: 'high',
    checkId,
    message: 'Bitte E2E-Intake übernehmen',
    preferredContact: 'secure_portal',
  });

  assert.equal(source.status, 'accepted');
  assert.equal(support.status, 'accepted');
  assert.equal((support.data as { checkId: string }).checkId, checkId);
});

test('POST /intake/orchestrator erstellt transaktionalen Intake-Pfad serverseitig', async () => {
  const result = await invoke('/intake/orchestrator', 'POST', {
    concern: 'request-help',
    payload: {
      check: {
        type: 'source_only',
        input: { submittedSourceIds: ['source-seed-1'] },
      },
      source: {
        sourceType: 'other_url',
        sourceUrl: 'https://example.org/intake',
        checkId: 'check-seed-1',
      },
      support: {
        requestType: 'removal',
        priority: 'urgent',
        checkId: 'check-seed-1',
        message: 'Bitte transaktional übernehmen',
      },
    },
  });

  assert.equal(result.status, 'accepted');
  assert.equal(typeof (result.created as { checkId: string }).checkId, 'string');
  assert.equal(typeof (result.created as { supportRequestId: string }).supportRequestId, 'string');
});

test('GET /support-requests listet persistierte Support-Requests', async () => {
  const result = await invoke('/api/v1/support-requests', 'GET', undefined, adminHeaders);

  assert.equal(result.status, 'ok');
  assert.equal(Array.isArray(result.data), true);
});

test('GET /api/v1/support-requests erzwingt Authentifizierung fuer Backoffice-Queues', async () => {
  const result = await invoke('/api/v1/support-requests', 'GET');

  assert.equal((result.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.error as { message: string }).message, 'Authentication required');
});

test('GET /api/v1/reviews liefert Review-Queue fuer autorisierte Rollen', async () => {
  const result = await invoke('/api/v1/reviews', 'GET', undefined, adminHeaders);

  assert.equal(result.status, 'ok');
  assert.equal(Array.isArray(result.data), true);
});

test('GET /api/v1/evidence-snapshots/:id liefert Evidence-Detail fuer autorisierte Rollen', async () => {
  const result = await invoke('/api/v1/evidence-snapshots/EV-1001', 'GET', undefined, adminHeaders);

  assert.equal(result.status, 'ok');
  assert.equal((result.data as { id: string }).id, 'EV-1001');
});

test('GET /api/v1/support-requests/:id erlaubt Owner-Zugriff fuer normale User', async () => {
  const result = await invoke('/api/v1/support-requests/support-req-1', 'GET', undefined, createUserHeaders('system-seed'));

  assert.equal(result.status, 'ok');
  assert.equal((result.data as { id: string }).id, 'support-req-1');
});

test('GET /api/v1/support-requests/:id blendet fremde Support-Requests fuer normale User aus', async () => {
  const result = await invoke('/api/v1/support-requests/support-req-1', 'GET', undefined, createUserHeaders('user-foreign-1'));

  assert.equal((result.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.error as { message: string }).message, 'Support request support-req-1 not found');
});

test('GET /api/v1/reviews verweigert normale User trotz Authentifizierung per RBAC', async () => {
  const result = await invoke('/api/v1/reviews', 'GET', undefined, createUserHeaders('system-seed'));

  assert.equal((result.error as { code: string }).code, 'HTTP_ERROR');
  assert.equal((result.error as { message: string }).message, 'Insufficient permissions');
});

test('POST /support-requests/:id/assign aktualisiert Assignment-Historie', async () => {
  const before = await invoke('/api/v1/support-requests/support-req-1', 'GET', undefined, adminHeaders);
  const result = await invoke(
    '/api/v1/support-requests/support-req-1/assign',
    'POST',
    {
      assignedTo: 'Murat S.',
      assignedBy: 'admin-console',
      reason: 'Priorisiert',
    },
    adminHeaders,
  );

  assert.equal(result.status, 'accepted');
  assert.equal((result.data as { assignedTo: string }).assignedTo, 'Murat S.');
  assert.equal(Array.isArray((result.data as { assignmentHistory: unknown[] }).assignmentHistory), true);
  assert.notEqual(
    (result.data as { retention: { lastReviewedAt: string } }).retention.lastReviewedAt,
    (before.data as { retention: { lastReviewedAt: string } }).retention.lastReviewedAt,
  );
});

test('POST /support-requests/:id/status aktualisiert Status-Historie', async () => {
  const result = await invoke(
    '/api/v1/support-requests/support-req-1/status',
    'POST',
    {
      status: 'in_progress',
      changedBy: 'admin-console',
      reason: 'Bearbeitung begonnen',
    },
    adminHeaders,
  );

  assert.equal(result.status, 'accepted');
  assert.equal((result.data as { status: string }).status, 'in_progress');
  assert.equal(Array.isArray((result.data as { statusHistory: unknown[] }).statusHistory), true);
});

test('POST /removal-cases/:id/actions aktualisiert Removal-Case-Flow', async () => {
  const result = await invoke(
    '/api/v1/removal-cases/RM-2041/actions',
    'POST',
    {
      actionType: 'legal_escalation',
      payloadSummary: 'Escalated',
      resultStatus: 'escalated',
    },
    adminHeaders,
  );

  assert.equal(result.status, 'accepted');
  assert.equal((result.data as { status: string }).status, 'escalated');
});

test('POST /removal-cases/:id/actions blendet fremde Faelle fuer normale User aus', async () => {
  const result = await invoke(
    '/api/v1/removal-cases/RM-2041/actions',
    'POST',
    {
      actionType: 'legal_escalation',
      payloadSummary: 'Escalated',
      resultStatus: 'escalated',
    },
    createUserHeaders('member-removal-outsider'),
  );

  assert.equal((result.error as { code?: string } | undefined)?.code, 'HTTP_ERROR');
  assert.equal((result.error as { message?: string } | undefined)?.message, 'Removal case RM-2041 not found');
});
