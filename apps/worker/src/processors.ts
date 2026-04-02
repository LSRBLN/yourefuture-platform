import type { Job } from 'bullmq';

import type {
  AssetPromoteJobPayload,
  AssetScanJobPayload,
  BullmqJobEnvelope,
  CheckExecutionJobPayload,
  RemovalSubmitJobPayload,
  RemovalSyncStatusJobPayload,
  RetentionCleanupJobPayload,
  ReviewMaterializeJobPayload,
  SupportTriageJobPayload,
  WorkerJobName,
} from '@trustshield/validation';
import {
  safeParseBullmqJobEnvelope,
} from '@trustshield/validation';
import { workerPersistence } from './runtime-persistence.js';

// Mock provider service for now (will be injected from NestJS in production)
class MockLeakAggregatorService {
  async searchEmail(email: string) {
    return {
      email,
      breaches: [],
      summary: 'No breaches found',
      riskLevel: 'none' as const,
      riskScore: 0,
      recommendedActions: [],
      timestamp: new Date().toISOString(),
    };
  }

  async searchUsername(username: string) {
    return {
      username,
      breaches: [],
      summary: 'No breaches found',
      riskLevel: 'none' as const,
      riskScore: 0,
      recommendedActions: [],
      timestamp: new Date().toISOString(),
    };
  }
}

const leakAggregator = new MockLeakAggregatorService();

type JobProcessorResult = {
  ok: true;
  queue: string;
  name: WorkerJobName;
  jobId: string;
  processedAt: string;
  action: string;
  details: Record<string, unknown>;
};

type JobProcessor = (job: Job) => Promise<JobProcessorResult>;

type EnvelopeFor<TName extends WorkerJobName> = Extract<BullmqJobEnvelope, { name: TName }>;

function requireValidEnvelope<TName extends WorkerJobName>(job: Job, name: TName): EnvelopeFor<TName> {
  const validation = safeParseBullmqJobEnvelope({
    jobId: typeof job.id === 'string' ? job.id : `${name}-unknown`,
    traceId: typeof job.id === 'string' ? `${job.id}-trace` : `${name}-trace`,
    dedupeKey: typeof job.opts?.jobId === 'string' ? job.opts.jobId : undefined,
    attempts: typeof job.attemptsMade === 'number' ? Math.max(job.attemptsMade, 1) : 1,
    enqueuedAt: new Date().toISOString(),
    queue: job.queueName,
    name,
    requestedBy: { subject: 'worker-runtime', role: 'service', scopes: ['*'] },
    payload: job.data,
  });

  if (!validation.success) {
    throw new Error(`Invalid ${name} payload`);
  }

  return validation.data as EnvelopeFor<TName>;
}

function createResult(job: Job, name: WorkerJobName, action: string, details: Record<string, unknown>): JobProcessorResult {
  return {
    ok: true,
    queue: job.queueName,
    name,
    jobId: typeof job.id === 'string' ? job.id : `${name}-unknown`,
    processedAt: new Date().toISOString(),
    action,
    details,
  };
}

export const workerProcessors: Record<WorkerJobName, JobProcessor> = {
  async 'asset.scan'(job) {
    const envelope = requireValidEnvelope(job, 'asset.scan');
    const payload = envelope.payload as AssetScanJobPayload;
    await workerPersistence.transitionAssetToScanning(payload.assetId);

    return createResult(job, 'asset.scan', 'validated_asset_scan_payload', {
      assetId: payload.assetId,
      assetType: payload.assetType,
      mimeType: payload.mimeType,
      quarantineStorageKey: payload.quarantineStorageKey,
    });
  },
  async 'asset.promote'(job) {
    const envelope = requireValidEnvelope(job, 'asset.promote');
    const payload = envelope.payload as AssetPromoteJobPayload;
    await workerPersistence.finalizeAssetPromotion(payload.assetId, payload.quarantineStorageKey);

    return createResult(job, 'asset.promote', 'validated_asset_promote_payload', {
      assetId: payload.assetId,
      quarantineStorageKey: payload.quarantineStorageKey,
    });
  },
  async 'check.execute'(job) {
    const envelope = requireValidEnvelope(job, 'check.execute');
    const payload = envelope.payload as CheckExecutionJobPayload;
    await workerPersistence.markCheckRunning(payload.checkId);

    try {
      let leakResult: any = null;

      // Execute check based on type
      // Note: The actual input data is stored in the database check record
      // Payload only contains checkId, checkType, and submittedSourceIds
      switch (payload.checkType) {
        case 'leak_email':
          // In a real flow, we would load the actual email from the check record
          // For now, we perform a generic search
          leakResult = {
            email: 'check-input-from-db',
            breaches: [],
            summary: 'Leak email check completed (providers not configured)',
            riskLevel: 'none' as const,
            riskScore: 0,
            recommendedActions: [],
            timestamp: new Date().toISOString(),
          };
          break;

        case 'leak_username':
          leakResult = {
            username: 'check-input-from-db',
            breaches: [],
            summary: 'Leak username check completed (providers not configured)',
            riskLevel: 'none' as const,
            riskScore: 0,
            recommendedActions: [],
            timestamp: new Date().toISOString(),
          };
          break;

        case 'leak_phone':
          // TODO: Implement phone search when providers support it
          leakResult = {
            phone: 'check-input-from-db',
            breaches: [],
            summary: 'Phone search not yet available',
            riskLevel: 'none' as const,
            riskScore: 0,
            recommendedActions: [],
            timestamp: new Date().toISOString(),
          };
          break;

        case 'leak_domain':
          // TODO: Implement domain search
          leakResult = {
            domain: 'check-input-from-db',
            breaches: [],
            summary: 'Domain search not yet available',
            riskLevel: 'none' as const,
            riskScore: 0,
            recommendedActions: [],
            timestamp: new Date().toISOString(),
          };
          break;

        case 'image':
        case 'video':
          // TODO: Implement image/video analysis
          leakResult = {
            summary: 'Media analysis not yet available',
            riskLevel: 'none' as const,
            riskScore: 0,
            recommendedActions: [],
            timestamp: new Date().toISOString(),
          };
          break;

        default:
          leakResult = {
            summary: `Check type ${payload.checkType} not implemented`,
            riskLevel: 'none' as const,
            riskScore: 0,
            recommendedActions: [],
            timestamp: new Date().toISOString(),
          };
      }

      // Mark check as completed (using existing method)
      await workerPersistence.markCheckCompleted(payload.checkId);

      return createResult(job, 'check.execute', 'check_execution_completed', {
        checkId: payload.checkId,
        checkType: payload.checkType,
        submittedSourceCount: payload.submittedSourceIds.length,
        riskLevel: leakResult?.riskLevel,
        breachCount: leakResult?.breaches?.length ?? 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown execution error';
      console.error(JSON.stringify({
        status: 'error',
        job: 'check.execute',
        checkId: payload.checkId,
        message: `Check execution failed: ${message}`,
      }));

      throw error;
    }
  },
  async 'review.materialize'(job) {
    const envelope = requireValidEnvelope(job, 'review.materialize');
    const payload = envelope.payload as ReviewMaterializeJobPayload;

    return createResult(job, 'review.materialize', 'validated_review_materialization_payload', {
      reviewItemId: payload.reviewItemId,
      checkId: payload.checkId,
      priority: payload.priority,
    });
  },
  async 'support.triage'(job) {
    const envelope = requireValidEnvelope(job, 'support.triage');
    const payload = envelope.payload as SupportTriageJobPayload;
    await workerPersistence.markSupportInProgress(payload.supportRequestId);

    const result = createResult(job, 'support.triage', 'validated_support_triage_payload', {
      supportRequestId: payload.supportRequestId,
      priority: payload.priority,
      checkId: payload.checkId,
    });

    await workerPersistence.markSupportTriaged(payload.supportRequestId);
    return result;
  },
  async 'removal.submit'(job) {
    const envelope = requireValidEnvelope(job, 'removal.submit');
    const payload = envelope.payload as RemovalSubmitJobPayload;
    
    try {
      await workerPersistence.markRemovalSubmitted(payload.removalCaseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown persistence error';
      console.error(JSON.stringify({
        status: 'error',
        job: 'removal.submit',
        removalCaseId: payload.removalCaseId,
        message: `Failed to mark removal as submitted: ${message}`,
      }));
      throw error;
    }

    return createResult(job, 'removal.submit', 'validated_removal_submission_payload', {
      removalCaseId: payload.removalCaseId,
      platform: payload.platform,
      targetUrl: payload.targetUrl,
    });
  },
  async 'removal.sync_status'(job) {
    const envelope = requireValidEnvelope(job, 'removal.sync_status');
    const payload = envelope.payload as RemovalSyncStatusJobPayload;

    return createResult(job, 'removal.sync_status', 'validated_removal_status_sync_payload', {
      removalCaseId: payload.removalCaseId,
      externalTicketId: payload.externalTicketId,
    });
  },
  async 'retention.cleanup'(job) {
    const envelope = requireValidEnvelope(job, 'retention.cleanup');
    const payload = envelope.payload as RetentionCleanupJobPayload;
    const cleanupResult = await workerPersistence.cleanupRetentionCandidates(new Date(payload.runAt), payload.policyScope);

    return createResult(job, 'retention.cleanup', 'validated_retention_cleanup_payload', {
      policyScope: payload.policyScope,
      runAt: payload.runAt,
      cleanup: cleanupResult ?? {
        asOf: payload.runAt,
        policyScope: payload.policyScope,
        deleted: {
          supportRequests: 0,
          jobs: 0,
        },
      },
    });
  },
};
