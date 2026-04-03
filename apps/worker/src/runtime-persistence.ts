import {
  AssetsRepository,
  ChecksRepository,
  createDatabasePool,
  createDatabaseRuntimeConfig,
  createDrizzleDatabase,
  JobsRepository,
  OsintHistoryRepository,
  OsintResultsRepository,
  OsintSearchesRepository,
  RemovalActionsRepository,
  RemovalCasesRepository,
  SupportRequestsRepository,
} from '@trustshield/db';
import type { RetentionCleanupJobPayload } from '@trustshield/validation';

function isPersistenceDisabled() {
  return process.env.TRUSTSHIELD_DISABLE_DB_RUNTIME === 'true';
}

type WorkerPersistenceRuntime = {
  assetsRepository: AssetsRepository;
  checksRepository: ChecksRepository;
  jobsRepository: JobsRepository;
  osintHistoryRepository: OsintHistoryRepository;
  osintResultsRepository: OsintResultsRepository;
  osintSearchesRepository: OsintSearchesRepository;
  removalActionsRepository: RemovalActionsRepository;
  removalCasesRepository: RemovalCasesRepository;
  supportRequestsRepository: SupportRequestsRepository;
};

let runtime: WorkerPersistenceRuntime | null | undefined;

function getRuntime() {
  if (runtime !== undefined) {
    return runtime;
  }

  if (isPersistenceDisabled()) {
    runtime = null;
    return runtime;
  }

  const pool = createDatabasePool(createDatabaseRuntimeConfig());
  const db = createDrizzleDatabase(pool);
  runtime = {
    assetsRepository: new AssetsRepository(db),
    checksRepository: new ChecksRepository(db),
    jobsRepository: new JobsRepository(db),
    osintHistoryRepository: new OsintHistoryRepository(db),
    osintResultsRepository: new OsintResultsRepository(db),
    osintSearchesRepository: new OsintSearchesRepository(db),
    removalActionsRepository: new RemovalActionsRepository(db),
    removalCasesRepository: new RemovalCasesRepository(db),
    supportRequestsRepository: new SupportRequestsRepository(db),
  };
  return runtime;
}

async function withRuntime<T>(action: (value: WorkerPersistenceRuntime) => Promise<T>) {
  const value = getRuntime();

  if (!value) {
    return undefined;
  }

  return action(value);
}

export const workerPersistence = {
  async markJobRunning(jobId: string, attempts = 1) {
    return withRuntime(({ jobsRepository }) =>
      jobsRepository.updateById(jobId, {
        status: 'running',
        attempts: Math.max(attempts, 1),
        updatedAt: new Date(),
      }));
  },

  async markJobCompleted(jobId: string) {
    return withRuntime(({ jobsRepository }) =>
      jobsRepository.updateById(jobId, {
        status: 'completed',
        updatedAt: new Date(),
      }));
  },

  async markJobFailed(jobId: string, errorMessage: string) {
    return withRuntime(({ jobsRepository }) =>
      jobsRepository.updateById(jobId, {
        status: 'failed',
        lastError: errorMessage,
        updatedAt: new Date(),
      }));
  },

  async ensureOsintSearchQueued(input: {
    searchId: string;
    ownerUserId: string | null;
    query: string;
    queryType: 'username' | 'email' | 'phone' | 'domain' | 'ip' | 'name' | 'image_url';
    scope: 'quick' | 'comprehensive';
    providers: string[];
    requestedBy: string | null;
    latestJobId: string;
    dedupeKey?: string;
  }) {
    return withRuntime(async ({ osintSearchesRepository }) => {
      const existing = await osintSearchesRepository.findById(input.searchId);

      if (existing) {
        return existing;
      }

      const now = new Date();
      return osintSearchesRepository.create({
        id: input.searchId,
        ownerUserId: input.ownerUserId,
        query: input.query,
        queryType: input.queryType,
        scope: input.scope,
        status: 'queued',
        schemaVersion: '1.0',
        requestedBy: input.requestedBy,
        providers: input.providers,
        resultCount: 0,
        dedupeKey: input.dedupeKey,
        latestJobId: input.latestJobId,
        startedAt: null,
        completedAt: null,
        lastError: null,
        retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      });
    });
  },

  async markOsintSearchRunning(searchId: string, jobId: string) {
    return withRuntime(async ({ osintHistoryRepository, osintSearchesRepository }) => {
      const record = await osintSearchesRepository.findById(searchId);

      if (!record || record.status === 'running') {
        return record;
      }

      const now = new Date();
      const updated = await osintSearchesRepository.updateById(searchId, {
        status: 'running',
        latestJobId: jobId,
        startedAt: record.startedAt ?? now,
        completedAt: null,
        lastError: null,
        updatedAt: now,
      });

      await osintHistoryRepository.create({
        id: `osint-history-${crypto.randomUUID()}`,
        searchId,
        ownerUserId: record.ownerUserId,
        eventType: 'job_running',
        message: 'OSINT worker started processing search.',
        payload: {
          jobId,
          status: 'running',
        },
        createdBy: 'worker-runtime',
        createdAt: now,
      });

      return updated;
    });
  },

  async markOsintSearchCompleted(searchId: string, jobId: string, resultCount: number) {
    return withRuntime(async ({ osintHistoryRepository, osintSearchesRepository }) => {
      const record = await osintSearchesRepository.findById(searchId);

      if (!record) {
        return record;
      }

      const now = new Date();
      const updated = await osintSearchesRepository.updateById(searchId, {
        status: 'completed',
        latestJobId: jobId,
        resultCount,
        completedAt: now,
        lastError: null,
        updatedAt: now,
      });

      await osintHistoryRepository.create({
        id: `osint-history-${crypto.randomUUID()}`,
        searchId,
        ownerUserId: record.ownerUserId,
        eventType: 'job_completed',
        message: 'OSINT worker completed search processing.',
        payload: {
          jobId,
          status: 'completed',
          resultCount,
        },
        createdBy: 'worker-runtime',
        createdAt: now,
      });

      return updated;
    });
  },

  async markOsintSearchFailed(searchId: string, jobId: string, errorMessage: string) {
    return withRuntime(async ({ osintHistoryRepository, osintSearchesRepository }) => {
      const record = await osintSearchesRepository.findById(searchId);

      if (!record) {
        return record;
      }

      const now = new Date();
      const updated = await osintSearchesRepository.updateById(searchId, {
        status: 'failed',
        latestJobId: jobId,
        lastError: errorMessage,
        updatedAt: now,
      });

      await osintHistoryRepository.create({
        id: `osint-history-${crypto.randomUUID()}`,
        searchId,
        ownerUserId: record.ownerUserId,
        eventType: 'job_failed',
        message: 'OSINT worker failed to process search.',
        payload: {
          jobId,
          status: 'failed',
          errorMessage,
        },
        createdBy: 'worker-runtime',
        createdAt: now,
      });

      return updated;
    });
  },

  async listOsintResultsBySearch(searchId: string) {
    return withRuntime(({ osintResultsRepository }) => osintResultsRepository.listBySearch(searchId));
  },

  async createOsintResult(input: {
    searchId: string;
    ownerUserId: string | null;
    sourceTool: string;
    sourceProvider: string | null;
    sourceUrl: string | null;
    sourceTitle: string | null;
    confidenceScore: number;
    payload: Record<string, unknown>;
    discoveredAt?: Date;
    collectedAt?: Date;
  }) {
    return withRuntime(({ osintResultsRepository }) => {
      const now = new Date();
      return osintResultsRepository.create({
        id: `osint-result-${crypto.randomUUID()}`,
        searchId: input.searchId,
        ownerUserId: input.ownerUserId,
        sourceTool: input.sourceTool,
        sourceProvider: input.sourceProvider,
        sourceUrl: input.sourceUrl,
        sourceTitle: input.sourceTitle,
        confidenceScore: input.confidenceScore,
        payload: input.payload,
        discoveredAt: input.discoveredAt,
        collectedAt: input.collectedAt,
        retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      });
    });
  },

  async transitionAssetToScanning(assetId: string) {
    return withRuntime(async ({ assetsRepository }) => {
      const asset = await assetsRepository.findById(assetId);

      if (!asset || asset.status !== 'uploaded') {
        return asset;
      }

      return assetsRepository.updateById(assetId, {
        status: 'scanning',
        summary: 'Worker picked up secure scan job.',
        updatedAt: new Date(),
      });
    });
  },

  async finalizeAssetPromotion(assetId: string, quarantineStorageKey: string) {
    return withRuntime(async ({ assetsRepository }) => {
      const asset = await assetsRepository.findById(assetId);

      if (!asset) {
        return asset;
      }

      const privateStorageKey = quarantineStorageKey.replace(/^quarantine\//, 'private/');

      return assetsRepository.updateById(assetId, {
        status: asset.status === 'flagged' || asset.status === 'failed' ? asset.status : 'ready',
        storageKey: asset.storageKey ?? privateStorageKey,
        flags: {
          ...(asset.flags as Record<string, unknown>),
          malwareScanned: true,
          malwareDetected: Boolean((asset.flags as Record<string, unknown> | undefined)?.malwareDetected),
        },
        updatedAt: new Date(),
      });
    });
  },

  async markCheckRunning(checkId: string) {
    return withRuntime(async ({ checksRepository }) => {
      const record = await checksRepository.findById(checkId);

      if (!record || record.status !== 'queued') {
        return record;
      }

      return checksRepository.updateById(checkId, {
        status: 'running',
        summary: 'Check execution picked up by worker runtime.',
        updatedAt: new Date(),
      });
    });
  },

  async markCheckCompleted(checkId: string) {
    return withRuntime(async ({ checksRepository }) => {
      const record = await checksRepository.findById(checkId);

      if (!record) {
        return record;
      }

      return checksRepository.updateById(checkId, {
        status: 'completed',
        summary: 'Check execution finished by worker runtime.',
        updatedAt: new Date(),
      });
    });
  },

  async markSupportInProgress(supportRequestId: string) {
    return withRuntime(async ({ supportRequestsRepository }) => {
      const record = await supportRequestsRepository.findById(supportRequestId);

      if (!record || record.status !== 'open') {
        return record;
      }

      const statusHistory = Array.isArray(record.statusHistory)
        ? [...record.statusHistory, { toStatus: 'in_progress', changedAt: new Date().toISOString(), reason: 'worker_triage_started' }]
        : [{ toStatus: 'in_progress', changedAt: new Date().toISOString(), reason: 'worker_triage_started' }];

      return supportRequestsRepository.updateById(supportRequestId, {
        status: 'in_progress',
        statusHistory,
        audit: {
          ...(record.audit as Record<string, unknown>),
          lastAction: 'worker_triage_started',
        },
        updatedAt: new Date(),
      });
    });
  },

  async markSupportTriaged(supportRequestId: string) {
    return withRuntime(async ({ supportRequestsRepository }) => {
      const record = await supportRequestsRepository.findById(supportRequestId);

      if (!record) {
        return record;
      }

      const statusHistory = Array.isArray(record.statusHistory)
        ? [...record.statusHistory, { toStatus: 'triaged', changedAt: new Date().toISOString(), reason: 'worker_triage_completed' }]
        : [{ toStatus: 'triaged', changedAt: new Date().toISOString(), reason: 'worker_triage_completed' }];

      return supportRequestsRepository.updateById(supportRequestId, {
        status: 'triaged',
        statusHistory,
        audit: {
          ...(record.audit as Record<string, unknown>),
          lastAction: 'worker_triage_completed',
        },
        updatedAt: new Date(),
      });
    });
  },

  async markRemovalSubmitted(removalCaseId: string) {
    return withRuntime(async ({ removalActionsRepository, removalCasesRepository }) => {
      const record = await removalCasesRepository.findById(removalCaseId);

      if (!record) {
        return record;
      }

      const now = new Date();
      await removalActionsRepository.create({
        id: `${removalCaseId}-worker-submit`,
        removalCaseId,
        actionType: 'provider_request',
        recipient: record.platform,
        payloadSummary: 'Worker submitted the initial provider takedown request.',
        resultStatus: 'submitted',
        externalTicketId: null,
        createdAt: now,
      });

      return removalCasesRepository.update(removalCaseId, {
        status: 'submitted',
        nextActionLabel: 'Wartefenster beobachten',
        lastUpdateAt: now,
        updatedAt: now,
      });
    });
  },

  async cleanupRetentionCandidates(asOf: Date, policyScope: RetentionCleanupJobPayload['policyScope']) {
    return withRuntime(async ({ jobsRepository, supportRequestsRepository }) => {
      const deleted = {
        supportRequests: 0,
        jobs: 0,
      };

      if (policyScope === 'all' || policyScope === 'support_requests') {
        const removedSupportRequests = await supportRequestsRepository.deleteExpired(asOf);
        deleted.supportRequests = removedSupportRequests.length;
      }

      if (policyScope === 'all' || policyScope === 'jobs') {
        const removedJobs = await jobsRepository.deleteExpiredCompleted(asOf);
        deleted.jobs = removedJobs.length;
      }

      return {
        asOf: asOf.toISOString(),
        policyScope,
        deleted,
      };
    });
  },
};
