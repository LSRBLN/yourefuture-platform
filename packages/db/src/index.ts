export type DatabaseConfig = {
  provider: 'postgresql';
  connectionEnvVar: 'DATABASE_URL';
  migrationsDir: 'packages/db/migrations';
  schemaFile: 'packages/db/src/schema.ts';
  driver: 'drizzle-orm';
};

export const databaseConfig: DatabaseConfig = {
  provider: 'postgresql',
  connectionEnvVar: 'DATABASE_URL',
  migrationsDir: 'packages/db/migrations',
  schemaFile: 'packages/db/src/schema.ts',
  driver: 'drizzle-orm',
};

export * from './client.js';
export * from './repositories/assets.repository.js';
export * from './repositories/checks.repository.js';
export * from './repositories/evidence-snapshots.repository.js';
export * from './repositories/jobs.repository.js';
export * from './repositories/removal-actions.repository.js';
export * from './repositories/removal-cases.repository.js';
export * from './repositories/review-items.repository.js';
export * from './repositories/sources.repository.js';
export * from './repositories/support-requests.repository.js';
export * from './schema.js';

import { mockRemovalCases, mockReviewQueue, mockSupportRequests, workerJobCatalog } from '@trustshield/core';
import type {
  AssetRecord,
  CreateCheckRequestContract,
  CreateSourceRequestContract,
  CreateSupportRequestContract,
  EvidenceCoverage,
  EvidenceSnapshot,
  RemovalActionRecord,
  RemovalCaseRecord,
  RemovalCaseType,
  RemovalStatus,
  ReviewQueueItem,
  ReviewStatus,
  Severity,
  SlaRisk,
  SupportRequestRecord,
  SupportStatus,
  WorkerJobName,
  WorkerQueueName,
} from '@trustshield/core';

export type CheckEntity = {
  id: string;
  ownerUserId?: string;
  type: CreateCheckRequestContract['type'];
  input: CreateCheckRequestContract['input'];
  status: 'queued';
  submittedSourceIds: string[];
  createdAt: string;
};

export type SourceEntity = {
  id: string;
  ownerUserId?: string;
  sourceType: CreateSourceRequestContract['sourceType'];
  sourceUrl: string;
  platformName?: string;
  pageTitle?: string;
  notes?: string;
  assetId?: string;
  checkId?: string;
  createdAt: string;
};

export type AssetEntity = AssetRecord;

export type JobEntity = {
  id: string;
  queue: WorkerQueueName;
  name: WorkerJobName;
  status: 'queued' | 'running' | 'completed' | 'failed';
  resourceType: 'asset' | 'check' | 'support_request' | 'removal_case';
  resourceId: string;
  payload: Record<string, unknown>;
  requestedBy?: string;
  attempts: number;
  maxAttempts: number;
  dedupeKey?: string;
  enqueuedAt: string;
  availableAt: string;
  lastError?: string;
};

export type RetentionSweepCandidate = {
  resourceType: 'support_request' | 'job';
  resourceId: string;
  retentionUntil: string;
};

export type RetentionSweepResult = {
  asOf: string;
  policyScope: 'all' | 'support_requests' | 'jobs';
  deleted: {
    supportRequests: number;
    jobs: number;
  };
};

export type CreateRemovalCaseInput = {
  caseType: RemovalCaseType;
  platform: string;
  targetUrl: string;
  status?: RemovalStatus;
  severity: Severity;
  summary: string;
  legalBasis?: string;
  checkId?: string;
  assetId?: string;
};

export type AppendRemovalActionInput = {
  actionType: RemovalActionRecord['actionType'];
  recipient?: string;
  payloadSummary: string;
  resultStatus: string;
  externalTicketId?: string;
};

export type CreateSupportRequestInput = CreateSupportRequestContract;

export type SupportRequestAssignmentInput = {
  assignedTo?: string;
  assignedBy?: string;
  reason?: string;
};

export type SupportRequestStatusTransitionInput = {
  status: SupportStatus;
  changedBy?: string;
  reason?: string;
};

export type OwnershipContext = {
  actorSubject?: string;
  canReadAll?: boolean;
};

export type TrustshieldRepository<TRecord, TCreateInput> = {
  create(input: TCreateInput): TRecord;
  getById(id: string): TRecord | undefined;
  list(): TRecord[];
};

export type TrustshieldMutableRepository<TRecord, TCreateInput, TUpdateInput> = TrustshieldRepository<TRecord, TCreateInput> & {
  update(id: string, input: TUpdateInput): TRecord | undefined;
};

export type TrustshieldPersistenceAdapter = {
  assets: TrustshieldRepository<AssetEntity, AssetEntity>;
  checks: TrustshieldRepository<CheckEntity, CreateCheckRequestContract>;
  sources: TrustshieldRepository<SourceEntity, CreateSourceRequestContract>;
  jobs: TrustshieldRepository<JobEntity, JobEntity>;
  reviewItems: TrustshieldRepository<ReviewQueueItem, ReviewQueueItem>;
  evidenceSnapshots: TrustshieldRepository<EvidenceSnapshot, EvidenceSnapshot>;
  supportRequests: TrustshieldMutableRepository<SupportRequestRecord, CreateSupportRequestInput, never> & {
    assign(id: string, input: SupportRequestAssignmentInput): SupportRequestRecord | undefined;
    transitionStatus(id: string, input: SupportRequestStatusTransitionInput): SupportRequestRecord | undefined;
  };
  removalCases: TrustshieldMutableRepository<RemovalCaseRecord, CreateRemovalCaseInput, AppendRemovalActionInput>;
};

export type TrustshieldStore = ReturnType<typeof createTrustshieldStore>;

type CreateTrustshieldStoreOptions = {
  seedDemoData?: boolean;
};

export function createTrustshieldStore(options: CreateTrustshieldStoreOptions = {}) {
  const seedDemoData = options.seedDemoData === true;
  const assets = new Map<string, AssetEntity>();
  const checks = new Map<string, CheckEntity>();
  const sources = new Map<string, SourceEntity>();
  const jobs = new Map<string, JobEntity>();
  const removalCases = new Map<string, RemovalCaseRecord>(
    seedDemoData ? mockRemovalCases.map((item) => [item.id, structuredClone(item)]) : [],
  );
  const reviewItems = new Map<string, ReviewQueueItem>(
    seedDemoData ? mockReviewQueue.map((item) => [item.id, structuredClone(item)]) : [],
  );
  const evidenceSnapshots = new Map<string, EvidenceSnapshot>(
    seedDemoData ? mockReviewQueue.map((item) => [item.evidenceSnapshot.id, structuredClone(item.evidenceSnapshot)]) : [],
  );

  const createId = (prefix: string, currentSize: number) => `${prefix}-${currentSize + 1}`;
  const now = () => new Date().toISOString();
  const addRetentionDays = (base: string, days: number) => new Date(Date.parse(base) + days * 24 * 60 * 60 * 1000).toISOString();
  const createSupportRetention = (timestamp: string) => ({
    policyKey: 'support-request-default',
    retainUntil: addRetentionDays(timestamp, 365),
    lastReviewedAt: timestamp,
  });
  const createDefaultRemovalEvidenceSnapshot = (input: CreateRemovalCaseInput, timestamp: string): EvidenceSnapshot => ({
    id: `snapshot-removal-${removalCases.size + 1}`,
    snapshotType: 'review_brief',
    summary: input.summary,
    coverage: 'partial',
    retentionNote: 'Retention policy pending',
    capturedAt: timestamp,
    linkedCheckId: input.checkId,
    linkedAssetId: input.assetId,
    sources: [],
    evidence: {
      platform: input.platform,
      targetUrl: input.targetUrl,
      legalBasis: input.legalBasis,
    },
  });
  const supportRequestReachedRetentionTerminalState = (status: SupportStatus) => status === 'resolved' || status === 'closed';
  const enqueueJob = (input: {
    name: WorkerJobName;
    resourceType: JobEntity['resourceType'];
    resourceId: string;
    payload: Record<string, unknown>;
    requestedBy?: string;
    dedupeKey?: string;
  }) => {
    const timestamp = now();
    const registration = workerJobCatalog[input.name];
    const entity: JobEntity = {
      id: createId('job', jobs.size),
      queue: registration.queue,
      name: input.name,
      status: 'queued',
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      payload: input.payload,
      requestedBy: input.requestedBy,
      attempts: 0,
      maxAttempts: registration.defaultJobOptions.attempts,
      dedupeKey: input.dedupeKey,
      enqueuedAt: timestamp,
      availableAt: timestamp,
    };
    jobs.set(entity.id, entity);
    return entity;
  };
  const canAccessOwnedRecord = (ownerUserId: string | undefined, context?: OwnershipContext) => {
    if (context?.canReadAll) {
      return true;
    }

    if (!context?.actorSubject || !ownerUserId) {
      return false;
    }

    return ownerUserId === context.actorSubject;
  };
  const canAccessSupportRequest = (record: SupportRequestRecord | undefined, context?: OwnershipContext) => {
    if (!record) {
      return false;
    }

    if (context?.canReadAll) {
      return true;
    }

    if (!context?.actorSubject) {
      return false;
    }

    return (
      record.audit.createdBy === context.actorSubject ||
      record.assignedTo === context.actorSubject
    );
  };
  const canAccessRemovalCase = (record: RemovalCaseRecord | undefined, context?: OwnershipContext) => {
    if (!record) {
      return false;
    }

    if (context?.canReadAll) {
      return true;
    }

    if (!context?.actorSubject) {
      return false;
    }

    return (
      record.assignedTo === context.actorSubject ||
      record.actions.some((action) => action.recipient === context.actorSubject)
    );
  };
  const canAccessCheck = (record: CheckEntity | undefined, context?: OwnershipContext) =>
    Boolean(record && (context?.canReadAll || !record.ownerUserId || canAccessOwnedRecord(record.ownerUserId, context)));
  const canAccessSource = (record: SourceEntity | undefined, context?: OwnershipContext) =>
    Boolean(record && (context?.canReadAll || !record.ownerUserId || canAccessOwnedRecord(record.ownerUserId, context)));
  const canAccessReviewItem = (record: ReviewQueueItem | undefined, context?: OwnershipContext) => {
    if (!record) {
      return false;
    }

    if (context?.canReadAll) {
      return true;
    }

    if (!context?.actorSubject) {
      return false;
    }

    if (record.assignedTo === context.actorSubject) {
      return true;
    }

    if (record.linkedCheckId) {
      return canAccessCheck(checks.get(record.linkedCheckId), context);
    }

    if (record.linkedSupportRequestId) {
      return canAccessSupportRequest(supportRequests.get(record.linkedSupportRequestId), context);
    }

    return false;
  };
  const canAccessEvidenceSnapshot = (record: EvidenceSnapshot | undefined, context?: OwnershipContext) => {
    if (!record) {
      return false;
    }

    if (context?.canReadAll) {
      return true;
    }

    if (record.linkedReviewItemId) {
      return canAccessReviewItem(reviewItems.get(record.linkedReviewItemId), context);
    }

    if (record.linkedCheckId) {
      return canAccessCheck(checks.get(record.linkedCheckId), context);
    }

    return false;
  };
  const canAccessJob = (record: JobEntity | undefined, context?: OwnershipContext) => {
    if (!record) {
      return false;
    }

    if (context?.canReadAll) {
      return true;
    }

    switch (record.resourceType) {
      case 'asset':
        return canAccessOwnedRecord(assets.get(record.resourceId)?.ownerUserId, context);
      case 'check':
        return canAccessCheck(checks.get(record.resourceId), context);
      case 'support_request':
        return canAccessSupportRequest(supportRequests.get(record.resourceId), context);
      case 'removal_case':
        return canAccessRemovalCase(removalCases.get(record.resourceId), context);
      default:
        return false;
    }
  };
  const normalizeSupportRequest = (record: SupportRequestRecord): SupportRequestRecord => ({
    ...record,
    assignmentHistory: structuredClone((record as SupportRequestRecord & { assignmentHistory?: SupportRequestRecord['assignmentHistory'] }).assignmentHistory ?? []),
    statusHistory: structuredClone((record as SupportRequestRecord & { statusHistory?: SupportRequestRecord['statusHistory'] }).statusHistory ?? [{ toStatus: record.status, changedAt: record.createdAt, reason: 'seeded' }]),
    audit: structuredClone((record as SupportRequestRecord & { audit?: SupportRequestRecord['audit'] }).audit ?? { lastAction: 'seeded' }),
    retention: structuredClone((record as SupportRequestRecord & { retention?: SupportRequestRecord['retention'] }).retention ?? createSupportRetention(record.createdAt)),
  });
  const supportRequests = new Map<string, SupportRequestRecord>(
    seedDemoData ? mockSupportRequests.map((item) => [item.id, normalizeSupportRequest(structuredClone(item))]) : [],
  );

  const adapter: TrustshieldPersistenceAdapter = {
    assets: {
      create(input) {
        assets.set(input.id, input);
        return input;
      },
      getById(id) {
        return assets.get(id);
      },
      list() {
        return [...assets.values()];
      },
    },
    checks: {
      create(input: CreateCheckRequestContract) {
        const entity: CheckEntity = {
          id: createId('check', checks.size),
          type: input.type,
          input: input.input,
          status: 'queued',
          submittedSourceIds: input.input.submittedSourceIds ?? [],
          createdAt: now(),
        };
        checks.set(entity.id, entity);
        return entity;
      },
      getById(id: string) {
        return checks.get(id);
      },
      list() {
        return [...checks.values()];
      },
    },
    sources: {
      create(input: CreateSourceRequestContract) {
        const entity: SourceEntity = {
          id: createId('source', sources.size),
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          platformName: input.platformName,
          pageTitle: input.pageTitle,
          notes: input.notes,
          assetId: input.assetId,
          checkId: input.checkId,
          createdAt: now(),
        };
        sources.set(entity.id, entity);
        return entity;
      },
      getById(id: string) {
        return sources.get(id);
      },
      list() {
        return [...sources.values()];
      },
    },
    jobs: {
      create(input: JobEntity) {
        jobs.set(input.id, input);
        return input;
      },
      getById(id: string) {
        return jobs.get(id);
      },
      list() {
        return [...jobs.values()];
      },
    },
    reviewItems: {
      create(input: ReviewQueueItem) {
        reviewItems.set(input.id, input);
        return input;
      },
      getById(id: string) {
        return reviewItems.get(id);
      },
      list() {
        return [...reviewItems.values()];
      },
    },
    evidenceSnapshots: {
      create(input: EvidenceSnapshot) {
        evidenceSnapshots.set(input.id, input);
        return input;
      },
      getById(id: string) {
        return evidenceSnapshots.get(id);
      },
      list() {
        return [...evidenceSnapshots.values()];
      },
    },
    supportRequests: {
      create(input: CreateSupportRequestInput) {
        const id = createId('support', supportRequests.size);
        const timestamp = now();
        const record: SupportRequestRecord = {
          id,
          requestType: input.requestType,
          priority: input.priority ?? 'medium',
          status: 'open' as SupportStatus,
          preferredContact: input.preferredContact,
          message: input.message,
          checkId: input.checkId,
          assetId: input.assetId,
          removalCaseId: input.removalCaseId,
          createdAt: timestamp,
          updatedAt: timestamp,
          assignmentHistory: [],
          statusHistory: [{ toStatus: 'open' as SupportStatus, changedAt: timestamp, reason: 'created' }],
          audit: { lastAction: 'created' },
          retention: createSupportRetention(timestamp),
        };
        supportRequests.set(id, record);
        return record;
      },
      getById(id: string) {
        return supportRequests.get(id);
      },
      list() {
        return [...supportRequests.values()];
      },
      update() {
        return undefined;
      },
      assign(id: string, input: SupportRequestAssignmentInput) {
        const existing = supportRequests.get(id);
        if (!existing) {
          return undefined;
        }

        const timestamp = now();
        const next: SupportRequestRecord = {
          ...existing,
          assignedTo: input.assignedTo,
          updatedAt: timestamp,
          assignmentHistory: [...existing.assignmentHistory, { assignedTo: input.assignedTo, assignedBy: input.assignedBy, reason: input.reason, changedAt: timestamp }],
          audit: {
            ...existing.audit,
            lastModifiedBy: input.assignedBy,
            lastAction: 'assignment_changed',
          },
          retention: {
            ...existing.retention,
            lastReviewedAt: timestamp,
          },
        };
        supportRequests.set(id, next);
        return next;
      },
      transitionStatus(id: string, input: SupportRequestStatusTransitionInput) {
        const existing = supportRequests.get(id);
        if (!existing) {
          return undefined;
        }

        const timestamp = now();
        const next: SupportRequestRecord = {
          ...existing,
          status: input.status,
          updatedAt: timestamp,
          statusHistory: [...existing.statusHistory, { fromStatus: existing.status, toStatus: input.status, changedBy: input.changedBy, reason: input.reason, changedAt: timestamp }],
          audit: {
            ...existing.audit,
            lastModifiedBy: input.changedBy,
            lastAction: 'status_transition',
          },
          retention: {
            ...existing.retention,
            lastReviewedAt: timestamp,
          },
        };
        supportRequests.set(id, next);
        return next;
      },
    },
    removalCases: {
      create(input: CreateRemovalCaseInput) {
        const id = createId('RM', removalCases.size);
        const timestamp = now();
        const record: RemovalCaseRecord = {
          id,
          caseType: input.caseType,
          platform: input.platform,
          targetUrl: input.targetUrl,
          legalBasis: input.legalBasis,
          status: input.status ?? 'open',
          severity: input.severity,
          summary: input.summary,
          evidenceCoverage: 'partial' as EvidenceCoverage,
          slaRisk: 'watch' as SlaRisk,
          reviewStatus: 'queued' as ReviewStatus,
          supportRequested: true,
          evidenceSnapshot: createDefaultRemovalEvidenceSnapshot(input, timestamp),
          actions: [],
          createdAt: timestamp,
          updatedAt: timestamp,
          lastUpdateAt: timestamp,
          nextActionLabel: 'Provider-Kommunikation vorbereiten',
          linkedCheckId: input.checkId,
          linkedAssetId: input.assetId,
        };
        removalCases.set(id, record);
        return record;
      },
      getById(id: string) {
        return removalCases.get(id);
      },
      list() {
        return [...removalCases.values()];
      },
      update(id: string, input: AppendRemovalActionInput) {
        const existing = removalCases.get(id);
        if (!existing) {
          return undefined;
        }
        const action: RemovalActionRecord = {
          id: `${id}-action-${existing.actions.length + 1}`,
          actionType: input.actionType,
          recipient: input.recipient,
          payloadSummary: input.payloadSummary,
          resultStatus: input.resultStatus,
          externalTicketId: input.externalTicketId,
          createdAt: now(),
        };
        const next: RemovalCaseRecord = {
          ...existing,
          status: input.resultStatus === 'escalated' ? 'escalated' : input.resultStatus === 'submitted' ? 'submitted' : existing.status,
          actions: [...existing.actions, action],
          updatedAt: now(),
          lastUpdateAt: now(),
        };
        removalCases.set(id, next);
        return next;
      },
    },
  };

  return {
    createAsset(input: AssetEntity) {
      return adapter.assets.create(input);
    },
    updateAsset(id: string, input: Partial<AssetEntity>) {
      const existing = adapter.assets.getById(id);

      if (!existing) {
        return undefined;
      }

      const next = {
        ...existing,
        ...input,
        flags: {
          ...existing.flags,
          ...input.flags,
        },
        dimensions: {
          ...existing.dimensions,
          ...input.dimensions,
        },
        updatedAt: input.updatedAt ?? now(),
      } satisfies AssetEntity;
      assets.set(id, next);
      return next;
    },
    getAssetById(id: string, context?: OwnershipContext) {
      const record = adapter.assets.getById(id);
      return canAccessOwnedRecord(record?.ownerUserId, context) || !record?.ownerUserId
        ? record
        : undefined;
    },
    createJob(input: JobEntity) {
      jobs.set(input.id, input);
      return input;
    },
    createCheck(input: CreateCheckRequestContract, ownerUserId?: string) {
      const entity = adapter.checks.create(input);
      entity.ownerUserId = ownerUserId;
      checks.set(entity.id, entity);
      enqueueJob({
        name: 'check.execute',
        resourceType: 'check',
        resourceId: entity.id,
        requestedBy: ownerUserId,
        dedupeKey: `check:${entity.id}`,
        payload: {
          checkId: entity.id,
          checkType: entity.type,
          submittedSourceIds: entity.submittedSourceIds,
          requestedBy: ownerUserId,
        },
      });
      return entity;
    },
    getCheckById(id: string, context?: OwnershipContext) {
      const record = adapter.checks.getById(id);
      return canAccessOwnedRecord(record?.ownerUserId, context) || !record?.ownerUserId
        ? record
        : undefined;
    },
    createSource(input: CreateSourceRequestContract, ownerUserId?: string) {
      const entity = adapter.sources.create(input);
      entity.ownerUserId = ownerUserId;
      sources.set(entity.id, entity);
      return entity;
    },
    getSourceById(id: string, context?: OwnershipContext) {
      const record = adapter.sources.getById(id);
      return canAccessSource(record, context) ? record : undefined;
    },
    listJobs(context?: OwnershipContext) {
      const records = adapter.jobs.list();
      return context?.canReadAll ? records : records.filter((record) => canAccessJob(record, context));
    },
    getJobById(id: string, context?: OwnershipContext) {
      const record = adapter.jobs.getById(id);
      return canAccessJob(record, context) ? record : undefined;
    },
    listRetentionCandidates(asOf = now()) {
      const supportCandidates: RetentionSweepCandidate[] = [...supportRequests.values()]
        .filter((record) => supportRequestReachedRetentionTerminalState(record.status) && record.retention.retainUntil <= asOf)
        .map((record) => ({
          resourceType: 'support_request',
          resourceId: record.id,
          retentionUntil: record.retention.retainUntil,
        }));

      const jobCandidates: RetentionSweepCandidate[] = [...jobs.values()]
        .filter((record) => Boolean(record.availableAt <= asOf && record.status === 'completed'))
        .map((record) => ({
          resourceType: 'job',
          resourceId: record.id,
          retentionUntil: record.availableAt,
        }));

      return [...supportCandidates, ...jobCandidates];
    },
    executeRetentionSweep(
      asOf = now(),
      policyScope: RetentionSweepResult['policyScope'] = 'all',
    ): RetentionSweepResult {
      const deleted = {
        supportRequests: 0,
        jobs: 0,
      };

      if (policyScope === 'all' || policyScope === 'support_requests') {
        for (const record of [...supportRequests.values()]) {
          if (supportRequestReachedRetentionTerminalState(record.status) && record.retention.retainUntil <= asOf) {
            supportRequests.delete(record.id);
            deleted.supportRequests += 1;
          }
        }
      }

      if (policyScope === 'all' || policyScope === 'jobs') {
        for (const record of [...jobs.values()]) {
          if (record.status === 'completed' && record.availableAt <= asOf) {
            jobs.delete(record.id);
            deleted.jobs += 1;
          }
        }
      }

      return {
        asOf,
        policyScope,
        deleted,
      };
    },
    listReviewItems(context?: OwnershipContext) {
      const records = adapter.reviewItems.list();
      return context?.canReadAll ? records : records.filter((record) => canAccessReviewItem(record, context));
    },
    getReviewItemById(id: string, context?: OwnershipContext) {
      const record = adapter.reviewItems.getById(id);
      return canAccessReviewItem(record, context) ? record : undefined;
    },
    listEvidenceSnapshots(context?: OwnershipContext) {
      const records = adapter.evidenceSnapshots.list();
      return context?.canReadAll ? records : records.filter((record) => canAccessEvidenceSnapshot(record, context));
    },
    getEvidenceSnapshotById(id: string, context?: OwnershipContext) {
      const record = adapter.evidenceSnapshots.getById(id);
      return canAccessEvidenceSnapshot(record, context) ? record : undefined;
    },
    createSupportRequest(input: CreateSupportRequestInput, ownerUserId?: string) {
      const record = adapter.supportRequests.create(input);
      record.audit.createdBy = ownerUserId;
      supportRequests.set(record.id, record);
      enqueueJob({
        name: 'support.triage',
        resourceType: 'support_request',
        resourceId: record.id,
        requestedBy: ownerUserId,
        dedupeKey: `support:${record.id}`,
        payload: {
          supportRequestId: record.id,
          priority: record.priority,
          checkId: record.checkId,
          requestedBy: ownerUserId,
        },
      });
      return record;
    },
    getSupportRequestById(id: string, context?: OwnershipContext) {
      const record = adapter.supportRequests.getById(id);
      return canAccessSupportRequest(record, context) ? record : undefined;
    },
    listSupportRequests(context?: OwnershipContext) {
      const records = adapter.supportRequests.list();
      return context?.canReadAll ? records : records.filter((record) => canAccessSupportRequest(record, context));
    },
    assignSupportRequest(id: string, input: SupportRequestAssignmentInput) {
      return adapter.supportRequests.assign(id, input);
    },
    transitionSupportRequestStatus(id: string, input: SupportRequestStatusTransitionInput) {
      return adapter.supportRequests.transitionStatus(id, input);
    },
    createRemovalCase(input: CreateRemovalCaseInput, ownerUserId?: string) {
      const record = adapter.removalCases.create(input);
      if (ownerUserId && !record.assignedTo) {
        record.assignedTo = ownerUserId;
        removalCases.set(record.id, record);
      }
      enqueueJob({
        name: 'removal.submit',
        resourceType: 'removal_case',
        resourceId: record.id,
        requestedBy: ownerUserId,
        dedupeKey: `removal:submit:${record.id}`,
        payload: {
          removalCaseId: record.id,
          platform: record.platform,
          targetUrl: record.targetUrl,
          requestedBy: ownerUserId,
        },
      });
      return record;
    },
    getRemovalCaseById(id: string, context?: OwnershipContext) {
      const record = adapter.removalCases.getById(id);
      return canAccessRemovalCase(record, context) ? record : undefined;
    },
    appendRemovalAction(id: string, input: AppendRemovalActionInput) {
      return adapter.removalCases.update(id, input);
    },
    repositories: adapter,
  };
}
