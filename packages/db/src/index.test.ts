import assert from 'node:assert/strict';
import test from 'node:test';

import { createTrustshieldStore } from './index.js';

test('executeRetentionSweep loescht abgelaufene Support-Requests und abgeschlossene Jobs', () => {
  const store = createTrustshieldStore();
  const supportRequestsBefore = store.listSupportRequests({ canReadAll: true }).length;
  const jobsBefore = store.listJobs({ canReadAll: true }).length;
  const createdSupportRequest = store.createSupportRequest({
    requestType: 'support',
    priority: 'medium',
    preferredContact: 'secure_portal',
    message: 'Retention candidate',
  }, 'member-retention-1');
  store.transitionSupportRequestStatus(createdSupportRequest.id, {
    status: 'resolved',
    changedBy: 'ops-reviewer-1',
    reason: 'retention_terminal_state',
  });

  store.createJob({
    id: 'job-retention-expired-1',
    queue: 'support',
    name: 'support.triage',
    status: 'completed',
    resourceType: 'support_request',
    resourceId: createdSupportRequest.id,
    payload: {
      supportRequestId: createdSupportRequest.id,
      priority: 'medium',
    },
    attempts: 1,
    maxAttempts: 3,
    enqueuedAt: '2026-01-01T00:00:00.000Z',
    availableAt: '2026-01-02T00:00:00.000Z',
  });

  store.createJob({
    id: 'job-retention-queued-1',
    queue: 'checks',
    name: 'check.execute',
    status: 'queued',
    resourceType: 'check',
    resourceId: 'check-keep-1',
    payload: {
      checkId: 'check-keep-1',
      checkType: 'source_only',
      submittedSourceIds: [],
    },
    attempts: 0,
    maxAttempts: 3,
    enqueuedAt: '2026-01-01T00:00:00.000Z',
    availableAt: '2026-01-01T00:00:00.000Z',
  });

  const retentionSweep = store.executeRetentionSweep('2028-01-01T00:00:00.000Z');

  assert.deepEqual(retentionSweep.deleted, {
    supportRequests: 1,
    jobs: 1,
  });
  assert.equal(store.getSupportRequestById(createdSupportRequest.id, { canReadAll: true }), undefined);
  assert.equal(store.getJobById('job-retention-expired-1', { canReadAll: true }), undefined);
  assert.notEqual(store.getJobById('job-retention-queued-1', { canReadAll: true }), undefined);
  assert.equal(store.listSupportRequests({ canReadAll: true }).length, supportRequestsBefore);
  assert.equal(store.listJobs({ canReadAll: true }).length, jobsBefore + 2);
});

test('executeRetentionSweep respektiert policyScope jobs', () => {
  const store = createTrustshieldStore();
  const supportRequestsBefore = store.listSupportRequests({ canReadAll: true }).length;
  const jobsBefore = store.listJobs({ canReadAll: true }).length;
  const createdSupportRequest = store.createSupportRequest({
    requestType: 'support',
    priority: 'medium',
    preferredContact: 'secure_portal',
    message: 'Retention scope candidate',
  }, 'member-retention-2');

  store.createJob({
    id: 'job-retention-expired-2',
    queue: 'support',
    name: 'support.triage',
    status: 'completed',
    resourceType: 'support_request',
    resourceId: createdSupportRequest.id,
    payload: {
      supportRequestId: createdSupportRequest.id,
      priority: 'medium',
    },
    attempts: 1,
    maxAttempts: 3,
    enqueuedAt: '2026-01-01T00:00:00.000Z',
    availableAt: '2026-01-02T00:00:00.000Z',
  });

  const retentionSweep = store.executeRetentionSweep('2028-01-01T00:00:00.000Z', 'jobs');

  assert.deepEqual(retentionSweep.deleted, {
    supportRequests: 0,
    jobs: 1,
  });
  assert.notEqual(store.getSupportRequestById(createdSupportRequest.id, { canReadAll: true }), undefined);
  assert.equal(store.getJobById('job-retention-expired-2', { canReadAll: true }), undefined);
  assert.equal(store.listSupportRequests({ canReadAll: true }).length, supportRequestsBefore + 1);
  assert.equal(store.listJobs({ canReadAll: true }).length, jobsBefore + 1);
});
