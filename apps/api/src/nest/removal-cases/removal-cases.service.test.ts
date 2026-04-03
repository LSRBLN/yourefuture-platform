import assert from 'node:assert/strict';
import test from 'node:test';

import type { ApiRequestContext } from '@trustshield/validation';

import { NestRemovalCasesService } from './removal-cases.service.js';

test('NestRemovalCasesService erstellt Removal-Case inklusive Job und Queue-Enqueue', async () => {
  const createdJobs: Array<{ id: string; payload: Record<string, unknown> }> = [];
  let enqueuedRemovalJob: { jobId: string; payload: Record<string, unknown> } | undefined;

  const service = new NestRemovalCasesService(
    {
      async create(input: Record<string, unknown>) {
        return input;
      },
      async findById() {
        return undefined;
      },
      async listAll() {
        return [];
      },
      async listByOwner() {
        return [];
      },
      async update() {
        return undefined;
      },
    } as never,
    {
      async create() {
        return undefined;
      },
      async listByRemovalCaseId() {
        return [];
      },
    } as never,
    {
      async create(input: Record<string, unknown>) {
        return input;
      },
      async listByRemovalCaseId() {
        return [];
      },
    } as never,
    {
      async create(input: Record<string, unknown>) {
        return input;
      },
      async findById() {
        return undefined;
      },
      async listAll() {
        return [];
      },
      async listVisibleForUser() {
        return [];
      },
      async findVisibleForUser() {
        return undefined;
      },
    } as never,
    {
      async create(input: Record<string, unknown>) {
        createdJobs.push({ id: input.id as string, payload: input.payload as Record<string, unknown> });
        return input;
      },
    } as never,
    {
      async enqueueRemovalSubmit(jobId: string, payload: Record<string, unknown>) {
        enqueuedRemovalJob = { jobId, payload };
        return { id: jobId };
      },
    } as never,
  );

  const context: ApiRequestContext = {
    requestId: 'req-test',
    apiVersion: 'v1',
    actor: {
      subject: 'member-web-app',
      role: 'user',
      scopes: [],
      tenantId: undefined,
    },
  };

  const result = await service.create(
    {
      caseType: 'impersonation',
      platform: 'Instagram',
      targetUrl: 'https://instagram.example/fake-profile',
      severity: 'high',
      summary: 'Fake profile claims to be the victim',
      legalBasis: 'identity_theft',
      checkId: 'check-123',
      assetId: 'asset-123',
    },
    context,
  );

  assert.equal(result.status, 'accepted');
  assert.equal(result.data.platform, 'Instagram');
  assert.equal(result.queue.queue, 'removals');
  assert.equal(result.queue.name, 'removal.submit');
  assert.equal(createdJobs.length, 1);
  assert.equal(createdJobs[0]?.payload.removalCaseId, result.data.id);
  assert.deepEqual(enqueuedRemovalJob, {
    jobId: result.queue.jobId,
    payload: createdJobs[0]?.payload,
  });
});
