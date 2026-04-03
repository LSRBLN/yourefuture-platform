import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { ApiV1Module } from './api-v1.module.js';
import type { AppConfig } from './config/app-config.js';
import { ApiExceptionFilter } from './platform/api-exception.filter.js';
import { applyGlobalSecurity } from './platform/security.js';

const adminHeaders = {
  'x-trustshield-subject': 'ops-admin-nest-e2e',
  'x-trustshield-role': 'admin',
} as const;

const userHeaders = {
  'x-trustshield-subject': 'member-nest-e2e',
  'x-trustshield-role': 'user',
} as const;

let baseUrl = '';
let closeServer: (() => Promise<void>) | undefined;
let previousDisableQueueRuntime: string | undefined;
const hasDatabaseE2E = process.env.TRUSTSHIELD_ENABLE_DB_E2E === 'true';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    statusCode: response.status,
    headers: response.headers,
    body: (await response.json()) as Record<string, unknown>,
  };
}

async function registerUserAndToken(input?: { fullName?: string; password?: string }) {
  const email = uniqueEmail('nest-users-e2e');
  const password = input?.password ?? 'supersecret1';
  const fullName = input?.fullName ?? 'Nest Users E2E';
  const rateLimitBypassKey = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  const registered = await request('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': rateLimitBypassKey,
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
    }),
  });

  assert.equal(registered.statusCode, 201);
  assert.equal(typeof registered.body.token, 'string');

  return {
    email,
    password,
    token: registered.body.token as string,
  };
}

before(async () => {
  previousDisableQueueRuntime = process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME;
  process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME = 'true';

  const app = await NestFactory.create(ApiV1Module, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  if (!appConfig) {
    throw new Error('Fehlende Konfiguration: app');
  }

  applyGlobalSecurity(app, appConfig);
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(0);

  const address = app.getHttpServer().address();

  if (!address || typeof address === 'string') {
    throw new Error('Unable to resolve Nest E2E server address');
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
  closeServer = () => app.close();
});

after(async () => {
  await closeServer?.();
  process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME = previousDisableQueueRuntime;
});

test('Nest runtime serves versioned health endpoint', async () => {
  const result = await request('/api/v1/health');

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.status, 'ok');
  assert.equal(result.body.apiVersion, 'v1');
});

test('Nest runtime setzt Security-Header via Helmet/CSP/HSTS', async () => {
  const result = await request('/api/v1/health');

  assert.equal(typeof result.headers.get('x-content-type-options'), 'string');
  assert.equal(typeof result.headers.get('x-frame-options'), 'string');
  assert.match(result.headers.get('content-security-policy') ?? '', /default-src 'self'/u);
  assert.equal(result.headers.get('strict-transport-security') !== null, true);
});

test('Nest runtime erzwingt CORS-Allowlist', async () => {
  const allowed = await request('/api/v1/health', {
    method: 'GET',
    headers: {
      origin: 'http://localhost:3000',
    },
  });

  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:3000');

  const blocked = await request('/api/v1/health', {
    method: 'GET',
    headers: {
      origin: 'https://evil.example',
    },
  });

  assert.equal(blocked.headers.get('access-control-allow-origin'), null);
});

test('Nest runtime lehnt unzulässige Payloads durch ValidationPipe ab', async () => {
  const result = await request('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: 'not-an-email',
      password: 'supersecret1',
      fullName: 'Pipe Test User',
    }),
  });

  console.info('[api-v1.e2e] validation-pipe-check', {
    email: 'not-an-email',
    statusCode: result.statusCode,
    body: result.body,
  });

  assert.equal(result.statusCode, 400);
});

test('Nest runtime blockt nach Rate-Limit-Threshold', async () => {
  for (let index = 0; index < 5; index += 1) {
    const attempt = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: `ratelimit-user-${index}@example.com`,
        password: 'invalid-password',
      }),
    });

    assert.equal(attempt.statusCode === 401 || attempt.statusCode === 400, true);
  }

  const blocked = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: 'ratelimit-user-blocked@example.com',
      password: 'invalid-password',
    }),
  });

  assert.equal(blocked.statusCode, 429);
  assert.equal((blocked.body.error as { message: string }).message, 'Rate limit exceeded');
});

test('Nest runtime supports register/login/me bearer flow', async () => {
  const email = uniqueEmail('nest-e2e');
  const registered = await request('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: 'supersecret1',
      fullName: 'Nest E2E User',
    }),
  });

  console.info('[api-v1.e2e] register-flow-check', {
    email,
    statusCode: registered.statusCode,
    body: registered.body,
  });

  assert.equal(registered.statusCode, 201);
  assert.equal(typeof registered.body.token, 'string');

  const me = await request('/api/v1/auth/me', {
    headers: {
      authorization: `Bearer ${registered.body.token as string}`,
    },
  });

  assert.equal(me.statusCode, 200);
  assert.equal(me.body.email, email);
  assert.equal(me.body.role, 'user');
});

test('Nest runtime unterstützt users/me + profile update nur mit Bearer', async () => {
  const auth = await registerUserAndToken();

  const me = await request('/api/v1/users/me', {
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(me.statusCode, 200);
  assert.equal(me.body.email, auth.email);

  const updated = await request('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${auth.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fullName: 'Updated E2E User',
      locale: 'de',
    }),
  });

  assert.equal(updated.statusCode, 200);
  assert.equal(updated.body.fullName, 'Updated E2E User');
  assert.equal(updated.body.locale, 'de');
});

test('Nest runtime unterstützt change-password mit currentPassword und rotiert Login-Berechtigung', async () => {
  const auth = await registerUserAndToken({ password: 'oldpassword1' });

  const changed = await request('/api/v1/users/me/change-password', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${auth.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword: 'oldpassword1',
      newPassword: 'newpassword1',
    }),
  });

  assert.equal(changed.statusCode, 201);
  assert.equal(changed.body.sessionsRevoked, true);

  const oldLogin = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.210',
    },
    body: JSON.stringify({
      email: auth.email,
      password: 'oldpassword1',
    }),
  });

  assert.equal(oldLogin.statusCode, 401);

  const newLogin = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.211',
    },
    body: JSON.stringify({
      email: auth.email,
      password: 'newpassword1',
    }),
  });

  assert.equal(newLogin.statusCode, 201);
  assert.equal(typeof newLogin.body.token, 'string');
});

test('Nest runtime invalidiert Session nach users/me delete', async () => {
  const auth = await registerUserAndToken();

  const deleted = await request('/api/v1/users/me', {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(deleted.statusCode, 200);
  assert.equal(deleted.body.status, 'deleted');

  const meAfterDelete = await request('/api/v1/auth/me', {
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(meAfterDelete.statusCode, 401);
});

test('Nest runtime liefert GDPR-export in erwarteter JSON-Struktur', async () => {
  const auth = await registerUserAndToken();

  const exported = await request('/api/v1/users/me/export', {
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(exported.statusCode, 200);
  assert.equal(exported.body.apiVersion, 'v1');
  assert.equal(typeof exported.body.exportedAt, 'string');
  assert.equal(typeof (exported.body.user as { id: string }).id, 'string');
  assert.equal(typeof (exported.body.data as { assets: unknown[] }).assets.length, 'number');
  assert.equal(typeof (exported.body.data as { checks: unknown[] }).checks.length, 'number');
});

test('Nest runtime erstellt Avatar Signed-URL Intent + Signed GET für /users/me/avatar', async () => {
  const auth = await registerUserAndToken();

  const uploadIntent = await request('/api/v1/users/me/avatar/upload-intent', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${auth.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contentType: 'image/png',
      filename: 'avatar.png',
    }),
  });

  assert.equal(uploadIntent.statusCode, 201);
  assert.equal(typeof (uploadIntent.body.upload as { url: string }).url, 'string');
  assert.equal((uploadIntent.body.upload as { method: string }).method, 'PUT');

  const avatarView = await request('/api/v1/users/me/avatar', {
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(avatarView.statusCode, 200);
  assert.equal((avatarView.body.view as { method: string }).method, 'GET');
  assert.equal(typeof (avatarView.body.view as { url: string }).url, 'string');

  const avatarDelete = await request('/api/v1/users/me/avatar', {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(avatarDelete.statusCode, 200);
  assert.equal(avatarDelete.body.status, 'deleted');
});

test('Nest runtime enforces RBAC on jobs topology', async () => {
  const forbidden = await request('/api/v1/jobs/topology', {
    headers: userHeaders,
  });

  assert.equal(forbidden.statusCode, 403);
  assert.equal((forbidden.body.error as { message: string }).message, 'Insufficient permissions');

  const allowed = await request('/api/v1/jobs/topology', {
    headers: adminHeaders,
  });

  assert.equal(allowed.statusCode, 200);
  assert.equal(allowed.body.status, 'ok');
  assert.equal(Array.isArray(allowed.body.data), true);
});

const databaseE2ETest = hasDatabaseE2E ? test : test.skip;

databaseE2ETest('Nest runtime persists intake orchestrator flow through repositories and jobs', async () => {
  const created = await request('/api/v1/intake/orchestrator', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      concern: 'request-help',
      payload: {
        check: {
          type: 'source_only',
          input: { submittedSourceIds: ['source-seed-1'] },
        },
        source: {
          sourceType: 'other_url',
          sourceUrl: 'https://example.org/nest-intake',
          checkId: 'stale-check-id',
        },
        support: {
          requestType: 'support',
          priority: 'high',
          checkId: 'stale-check-id',
          message: 'Nest intake persistence check',
          preferredContact: 'secure_portal',
        },
      },
    }),
  });

  assert.equal(created.statusCode, 201);
  assert.equal(created.body.status, 'accepted');

  const ids = created.body.created as { checkId: string; sourceId: string; supportRequestId: string };

  const check = await request(`/api/v1/checks/${ids.checkId}`, {
    headers: adminHeaders,
  });
  const source = await request(`/api/v1/sources/${ids.sourceId}`, {
    headers: adminHeaders,
  });
  const support = await request(`/api/v1/support-requests/${ids.supportRequestId}`, {
    headers: adminHeaders,
  });
  const jobs = await request('/api/v1/jobs', {
    headers: adminHeaders,
  });

  assert.equal(check.statusCode, 200);
  assert.equal((check.body.data as { id: string }).id, ids.checkId);
  assert.equal(source.statusCode, 200);
  assert.equal((source.body.data as { checkId: string }).checkId, ids.checkId);
  assert.equal(support.statusCode, 200);
  assert.equal((support.body.data as { checkId: string }).checkId, ids.checkId);
  assert.equal(
    (jobs.body.data as Array<{ resourceId: string; name: string }>).some(
      (job) => job.resourceId === ids.checkId && job.name === 'check.execute',
    ),
    true,
  );
  assert.equal(
    (jobs.body.data as Array<{ resourceId: string; name: string }>).some(
      (job) => job.resourceId === ids.supportRequestId && job.name === 'support.triage',
    ),
    true,
  );
});

databaseE2ETest('Nest runtime rejects invalid intake payload without partial persistence side effects', async () => {
  const jobsBefore = await request('/api/v1/jobs', {
    headers: adminHeaders,
  });
  const supportBefore = await request('/api/v1/support-requests', {
    headers: adminHeaders,
  });

  const invalid = await request('/api/v1/intake/orchestrator', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      concern: 'request-help',
      payload: {
        check: {
          type: 'source_only',
          input: { submittedSourceIds: ['source-seed-1'] },
        },
        source: {
          sourceType: 'other_url',
          sourceUrl: 'not-a-valid-url',
          checkId: 'stale-check-id',
        },
        support: {
          requestType: 'support',
          priority: 'high',
          checkId: 'stale-check-id',
          message: 'This payload must fail',
        },
      },
    }),
  });

  const jobsAfter = await request('/api/v1/jobs', {
    headers: adminHeaders,
  });
  const supportAfter = await request('/api/v1/support-requests', {
    headers: adminHeaders,
  });

  assert.equal(invalid.statusCode, 400);
  assert.equal((invalid.body.error as { message: string }).message, 'Intake orchestrator validation failed');
  assert.equal((jobsAfter.body.data as Array<unknown>).length, (jobsBefore.body.data as Array<unknown>).length);
  assert.equal((supportAfter.body.data as Array<unknown>).length, (supportBefore.body.data as Array<unknown>).length);
});

databaseE2ETest('Nest runtime queues OSINT search and exposes it via versioned endpoint', async () => {
  const created = await request('/api/v1/osint/search', {
    method: 'POST',
    headers: {
      ...userHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: 'alice@example.com',
      queryType: 'email',
      scope: 'quick',
      providers: ['haveibeenpwned'],
      idempotencyKey: `osint-e2e-${Date.now()}`,
    }),
  });

  assert.equal(created.statusCode, 201);
  assert.equal(created.body.status, 'accepted');
  const search = created.body.data as { id: string; schemaVersion: string; status: string };
  assert.equal(typeof search.id, 'string');
  assert.equal(search.schemaVersion, '1.0');
  assert.equal(search.status, 'queued');

  const fetched = await request(`/api/v1/osint/searches/${search.id}`, {
    headers: userHeaders,
  });

  assert.equal(fetched.statusCode, 200);
  assert.equal(fetched.body.status, 'ok');
  assert.equal((fetched.body.data as { id: string }).id, search.id);
  assert.equal(typeof (fetched.body.data as { query?: unknown }).query, 'string');
  assert.equal(Array.isArray((fetched.body.data as { history?: unknown }).history), true);
});

databaseE2ETest('Nest runtime exposes OSINT search snapshot via SSE endpoint', async () => {
  const created = await request('/api/v1/osint/search', {
    method: 'POST',
    headers: {
      ...userHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: 'sse-smoke@example.com',
      queryType: 'email',
      scope: 'quick',
      providers: ['haveibeenpwned'],
      idempotencyKey: `osint-sse-e2e-${Date.now()}`,
    }),
  });

  assert.equal(created.statusCode, 201);
  const searchId = (created.body.data as { id: string }).id;

  const response = await fetch(`${baseUrl}/api/v1/osint/searches/${searchId}/stream`, {
    headers: {
      ...userHeaders,
      accept: 'text/event-stream',
    },
  });

  assert.equal(response.status, 200);
  const contentType = response.headers.get('content-type') ?? '';
  assert.equal(contentType.includes('text/event-stream'), true);

  const bodyText = await response.text();
  assert.equal(bodyText.includes('event: osint.search.snapshot'), true);
  assert.equal(bodyText.includes(searchId), true);
});

databaseE2ETest('Nest runtime enforces OSINT search ownership boundaries', async () => {
  const created = await request('/api/v1/osint/search', {
    method: 'POST',
    headers: {
      ...userHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: 'alice@example.com',
      queryType: 'email',
      scope: 'quick',
      providers: [],
    }),
  });

  assert.equal(created.statusCode, 201);
  const searchId = (created.body.data as { id: string }).id;

  const foreignRead = await request(`/api/v1/osint/searches/${searchId}`, {
    headers: {
      'x-trustshield-subject': 'another-member-nest-e2e',
      'x-trustshield-role': 'user',
    },
  });

  assert.equal(foreignRead.statusCode, 404);

  const adminRead = await request(`/api/v1/osint/searches/${searchId}`, {
    headers: adminHeaders,
  });

  assert.equal(adminRead.statusCode, 200);
});
