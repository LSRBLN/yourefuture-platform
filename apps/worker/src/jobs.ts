import { workerJobCatalog, createBullmqRuntimeConfig, getWorkerQueueTopology } from '@trustshield/core';
import { safeParseBullmqJobEnvelope, type BullmqJobEnvelope } from '@trustshield/validation';

export { createBullmqRuntimeConfig, getWorkerQueueTopology, workerJobCatalog };

export function createBootstrapJobs(enqueuedAt = new Date().toISOString()): BullmqJobEnvelope[] {
  return [
    {
      jobId: 'job-asset-scan-bootstrap-1',
      traceId: 'trace-bootstrap-asset-1',
      dedupeKey: 'asset:scan:asset-bootstrap-1',
      attempts: workerJobCatalog['asset.scan'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'assets',
      name: 'asset.scan',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        assetId: 'asset-bootstrap-1',
        assetType: 'image',
        mimeType: 'image/png',
        quarantineStorageKey: 'quarantine/svc-api/asset-bootstrap-1/input.png',
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-check-bootstrap-1',
      traceId: 'trace-bootstrap-1',
      dedupeKey: 'check:check-bootstrap-1',
      attempts: workerJobCatalog['check.execute'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'checks',
      name: 'check.execute',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        checkId: 'check-bootstrap-1',
        checkType: 'video',
        submittedSourceIds: ['source-bootstrap-1'],
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-review-bootstrap-1',
      traceId: 'trace-bootstrap-2',
      dedupeKey: 'review:review-bootstrap-1',
      attempts: workerJobCatalog['review.materialize'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'reviews',
      name: 'review.materialize',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        reviewItemId: 'review-bootstrap-1',
        checkId: 'check-bootstrap-1',
        priority: 'high',
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-support-bootstrap-1',
      traceId: 'trace-bootstrap-3',
      dedupeKey: 'support:support-bootstrap-1',
      attempts: workerJobCatalog['support.triage'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'support',
      name: 'support.triage',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        supportRequestId: 'support-bootstrap-1',
        priority: 'urgent',
        checkId: 'check-bootstrap-1',
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-removal-submit-bootstrap-1',
      traceId: 'trace-bootstrap-4',
      dedupeKey: 'removal:submit:RM-bootstrap-1',
      attempts: workerJobCatalog['removal.submit'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'removals',
      name: 'removal.submit',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        removalCaseId: 'RM-bootstrap-1',
        platform: 'ClipShare',
        targetUrl: 'https://clips.example.org/watch/fake',
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-removal-sync-bootstrap-1',
      traceId: 'trace-bootstrap-5',
      dedupeKey: 'removal:sync:RM-bootstrap-1',
      attempts: workerJobCatalog['removal.sync_status'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'removals',
      name: 'removal.sync_status',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        removalCaseId: 'RM-bootstrap-1',
        externalTicketId: 'provider-123',
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-asset-promote-bootstrap-1',
      traceId: 'trace-bootstrap-asset-2',
      dedupeKey: 'asset:promote:asset-bootstrap-1',
      attempts: workerJobCatalog['asset.promote'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'assets',
      name: 'asset.promote',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        assetId: 'asset-bootstrap-1',
        quarantineStorageKey: 'quarantine/svc-api/asset-bootstrap-1/input.png',
        requestedBy: 'svc-api',
      },
    },
    {
      jobId: 'job-retention-bootstrap-1',
      traceId: 'trace-bootstrap-6',
      dedupeKey: 'retention:cleanup:daily',
      attempts: workerJobCatalog['retention.cleanup'].defaultJobOptions.attempts,
      enqueuedAt,
      queue: 'retention',
      name: 'retention.cleanup',
      requestedBy: { subject: 'svc-api', role: 'service', scopes: ['*'] },
      payload: {
        runAt: enqueuedAt,
        policyScope: 'all',
        requestedBy: 'svc-api',
      },
    },
  ];
}

export function validateBootstrapJobs(jobs: BullmqJobEnvelope[]) {
  return jobs.map((job) => {
    const validation = safeParseBullmqJobEnvelope(job);

    return {
      jobId: job.jobId,
      queue: job.queue,
      name: job.name,
      success: validation.success,
      issueCount: validation.issues.length,
    };
  });
}
