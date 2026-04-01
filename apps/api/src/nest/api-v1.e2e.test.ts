import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';

import { NestFactory } from '@nestjs/core';

import { ApiV1Module } from './api-v1.module.js';
import { ApiExceptionFilter } from './platform/api-exception.filter.js';

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

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    statusCode: response.status,
    body: (await response.json()) as Record<string, unknown>,
  };
}

before(async () => {
  previousDisableQueueRuntime = process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME;
  process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME = 'true';

  const app = await NestFactory.create(ApiV1Module, {
    bufferLogs: true,
  });
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

test('Nest runtime supports register/login/me bearer flow', async () => {
  const registered = await request('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: 'nest-e2e@example.com',
      password: 'supersecret1',
      fullName: 'Nest E2E User',
    }),
  });

  assert.equal(registered.statusCode, 201);
  assert.equal(typeof registered.body.token, 'string');

  const me = await request('/api/v1/auth/me', {
    headers: {
      authorization: `Bearer ${registered.body.token as string}`,
    },
  });

  assert.equal(me.statusCode, 200);
  assert.equal(me.body.email, 'nest-e2e@example.com');
  assert.equal(me.body.role, 'user');
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
