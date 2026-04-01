import {
  AssetsRepository,
  ChecksRepository,
  createDatabasePool,
  createDatabaseRuntimeConfig,
  createDrizzleDatabase,
  JobsRepository,
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
  async markJobRunning(jobId: string) {
    return withRuntime(({ jobsRepository }) =>
      jobsRepository.updateById(jobId, {
        status: 'running',
        attempts: 1,
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
