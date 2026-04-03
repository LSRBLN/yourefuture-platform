import type { Job } from 'bullmq';

import type {
  AssetPromoteJobPayload,
  AssetScanJobPayload,
  BullmqJobEnvelope,
  CheckExecutionJobPayload,
  OsintExecuteJobPayload,
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
  const payloadDedupeKey =
    typeof job.data === 'object' && job.data !== null && 'dedupeKey' in job.data && typeof (job.data as { dedupeKey?: unknown }).dedupeKey === 'string'
      ? (job.data as { dedupeKey: string }).dedupeKey
      : undefined;

  const validation = safeParseBullmqJobEnvelope({
    jobId: typeof job.id === 'string' ? job.id : `${name}-unknown`,
    traceId: typeof job.id === 'string' ? `${job.id}-trace` : `${name}-trace`,
    dedupeKey: payloadDedupeKey ?? (typeof job.opts?.jobId === 'string' ? job.opts.jobId : undefined),
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
  async 'osint.execute'(job) {
    const envelope = requireValidEnvelope(job, 'osint.execute');
    const payload = envelope.payload as OsintExecuteJobPayload;
    const jobId = typeof job.id === 'string' ? job.id : `${envelope.name}-unknown`;
    const effectiveDedupeKey = payload.dedupeKey ?? payload.idempotencyKey ?? (typeof job.opts?.jobId === 'string' ? job.opts.jobId : undefined);

    await workerPersistence.ensureOsintSearchQueued({
      searchId: payload.searchId,
      ownerUserId: payload.requestedBy ?? null,
      query: payload.query,
      queryType: payload.queryType,
      scope: payload.scope,
      providers: payload.providers,
      requestedBy: payload.requestedBy ?? null,
      latestJobId: jobId,
      dedupeKey: effectiveDedupeKey,
    });

    await workerPersistence.markOsintSearchRunning(payload.searchId, jobId);

    try {
      const existingResults = (await workerPersistence.listOsintResultsBySearch(payload.searchId)) ?? [];

      if (existingResults.length === 0) {
        const nowIso = new Date().toISOString();
        const defaultSourceUrl = payload.queryType === 'domain' || payload.queryType === 'ip'
          ? `https://${payload.query}`
          : `https://osint.local/search?q=${encodeURIComponent(payload.query)}`;

        const unified = {
          schemaVersion: '1.0' as const,
          searchId: payload.searchId,
          status: 'completed' as const,
          query: payload.query,
          queryType: payload.queryType,
          scope: payload.scope,
          confidence: 0.2,
          confidenceScore: 0.2,
          providers: payload.providers,
          sources: [
            {
              tool: payload.providers[0] ?? 'mock-osint-worker',
              provider: payload.providers[0] ?? null,
              url: defaultSourceUrl,
              title: `OSINT search for ${payload.query}`,
              metadata: {
                mode: 'mock',
                worker: 'osint.execute',
              },
              capturedAt: nowIso,
            },
          ],
          evidence: {
            summary: 'No provider integration configured in worker runtime.',
          },
          timestamps: {
            discoveredAt: nowIso,
            collectedAt: nowIso,
            updatedAt: nowIso,
          },
          results: [
            {
              id: `osint-item-${crypto.randomUUID()}`,
              source: payload.providers[0] ?? 'mock-osint-worker',
              type: payload.queryType,
              score: 20,
              confidence: 0.2,
              confidenceScore: 0.2,
              severity: 'low' as const,
              sources: [
                {
                  tool: payload.providers[0] ?? 'mock-osint-worker',
                  provider: payload.providers[0] ?? null,
                  url: defaultSourceUrl,
                  title: `OSINT source for ${payload.query}`,
                  metadata: {
                    queryType: payload.queryType,
                  },
                  capturedAt: nowIso,
                },
              ],
              evidence: {
                note: 'Synthetic placeholder result for queue/worker baseline.',
              },
              timestamps: {
                discoveredAt: nowIso,
                collectedAt: nowIso,
                updatedAt: nowIso,
              },
              normalized: {
                query: payload.query,
                queryType: payload.queryType,
              },
            },
          ],
        };

        await workerPersistence.createOsintResult({
          searchId: payload.searchId,
          ownerUserId: payload.requestedBy ?? null,
          sourceTool: payload.providers[0] ?? 'mock-osint-worker',
          sourceProvider: payload.providers[0] ?? null,
          sourceUrl: defaultSourceUrl,
          sourceTitle: `OSINT result for ${payload.query}`,
          confidenceScore: 20,
          payload: unified,
          discoveredAt: new Date(nowIso),
          collectedAt: new Date(nowIso),
        });
      }

      const finalResults = (await workerPersistence.listOsintResultsBySearch(payload.searchId)) ?? [];
      await workerPersistence.markOsintSearchCompleted(payload.searchId, jobId, finalResults.length);

      return createResult(job, 'osint.execute', 'osint_execution_completed', {
        searchId: payload.searchId,
        query: payload.query,
        queryType: payload.queryType,
        scope: payload.scope,
        providers: payload.providers,
        resultCount: finalResults.length,
        idempotentReplay: existingResults.length > 0,
        idempotencyKey: payload.idempotencyKey ?? null,
        dedupeKey: effectiveDedupeKey ?? null,
        maxAttempts: payload.maxAttempts,
        backoff: payload.backoff,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown osint execution error';
      await workerPersistence.markOsintSearchFailed(payload.searchId, jobId, message);

      console.error(JSON.stringify({
        status: 'error',
        job: 'osint.execute',
        searchId: payload.searchId,
        message: `OSINT execution failed: ${message}`,
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
