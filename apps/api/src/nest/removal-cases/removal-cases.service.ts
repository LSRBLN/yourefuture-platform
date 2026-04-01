import { Inject, Injectable } from '@nestjs/common';

import type {
  EvidenceSnapshot,
  RemovalActionRecord,
  RemovalCaseRecord,
} from '@trustshield/core';
import type {
  EvidenceSnapshotsRepository,
  JobInsert,
  JobsRepository,
  RemovalActionInsert,
  RemovalActionsRepository,
  RemovalCaseInsert,
  RemovalCaseRow,
  RemovalCasesRepository,
  ReviewItemInsert,
  ReviewItemsRepository,
} from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { workerJobCatalog } from '@trustshield/core';

import {
  EVIDENCE_SNAPSHOTS_REPOSITORY,
  JOBS_REPOSITORY,
  REMOVAL_ACTIONS_REPOSITORY,
  REMOVAL_CASES_REPOSITORY,
  REVIEW_ITEMS_REPOSITORY,
} from '../database/database.module.js';
import { HttpError } from '../../modules/shared/http.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';
import type { AppendRemovalActionDto, CreateRemovalCaseDto } from '../../modules/removal-cases/removal-cases.service.js';
import { QueueProducerService } from '../queue/queue-producer.service.js';

function mapEvidenceSnapshot(snapshot?: EvidenceSnapshot): EvidenceSnapshot {
  if (snapshot) {
    return snapshot;
  }

  return {
    id: 'snapshot-missing',
    snapshotType: 'review_brief',
    summary: 'No linked evidence snapshot yet',
    coverage: 'partial',
    retentionNote: 'Retention policy pending',
    capturedAt: new Date().toISOString(),
    sources: [],
    evidence: {},
  };
}

function mapRemovalAction(action: {
  id: string;
  actionType: string;
  recipient: string | null;
  payloadSummary: string | null;
  resultStatus: string | null;
  externalTicketId: string | null;
  createdAt: Date;
}): RemovalActionRecord {
  return {
    id: action.id,
    actionType: action.actionType as RemovalActionRecord['actionType'],
    recipient: action.recipient ?? undefined,
    payloadSummary: action.payloadSummary ?? undefined,
    resultStatus: action.resultStatus ?? undefined,
    externalTicketId: action.externalTicketId ?? undefined,
    createdAt: action.createdAt.toISOString(),
  };
}

function deriveNextActionLabel(status: RemovalCaseRow['status']) {
  switch (status) {
    case 'submitted':
      return 'Wartefenster beobachten';
    case 'followup_required':
      return 'Vollscreenshot mit Zeitstempel anfordern';
    case 'escalated':
      return 'Eskalationspfad mit Legal abstimmen';
    default:
      return 'Provider-Kommunikation vorbereiten';
  }
}

@Injectable()
export class NestRemovalCasesService {
  constructor(
    @Inject(REMOVAL_CASES_REPOSITORY) private readonly removalCasesRepository: RemovalCasesRepository,
    @Inject(REMOVAL_ACTIONS_REPOSITORY) private readonly removalActionsRepository: RemovalActionsRepository,
    @Inject(EVIDENCE_SNAPSHOTS_REPOSITORY) private readonly evidenceSnapshotsRepository: EvidenceSnapshotsRepository,
    @Inject(REVIEW_ITEMS_REPOSITORY) private readonly reviewItemsRepository: ReviewItemsRepository,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
  ) {}

  private async mapRecord(row: RemovalCaseRow): Promise<RemovalCaseRecord> {
    const actions = await this.removalActionsRepository.listByRemovalCaseId(row.id);
    const snapshots = await this.evidenceSnapshotsRepository.listByRemovalCaseId(row.id);
    const snapshot = snapshots[0];

    return {
      id: row.id,
      caseType: row.caseType,
      platform: row.platform,
      targetUrl: row.targetUrl,
      legalBasis: row.legalBasis ?? undefined,
      status: row.status,
      severity: row.severity,
      summary: row.summary,
      evidenceCoverage: row.evidenceCoverage,
      slaRisk: row.slaRisk,
      reviewStatus: row.reviewStatus,
      supportRequested: row.supportRequested,
      assignedTo: undefined,
      linkedAssetId: row.linkedAssetId ?? undefined,
      linkedCheckId: row.linkedCheckId ?? undefined,
      nextActionLabel: row.nextActionLabel ?? deriveNextActionLabel(row.status),
      evidenceSnapshot: mapEvidenceSnapshot(
        snapshot
          ? {
              id: snapshot.id,
              snapshotType: snapshot.snapshotType,
              summary:
                typeof snapshot.metadata?.summary === 'string'
                  ? snapshot.metadata.summary
                  : snapshot.snapshotType,
              coverage:
                typeof snapshot.metadata?.coverage === 'string'
                  ? (snapshot.metadata.coverage as EvidenceSnapshot['coverage'])
                  : 'partial',
              retentionNote:
                typeof snapshot.metadata?.retentionNote === 'string'
                  ? snapshot.metadata.retentionNote
                  : snapshot.retentionUntil
                    ? `Retain until ${snapshot.retentionUntil.toISOString()}`
                    : 'Retention policy pending',
              capturedAt: snapshot.capturedAt.toISOString(),
              linkedCheckId: snapshot.checkId ?? undefined,
              linkedReviewItemId: snapshot.reviewItemId ?? undefined,
              linkedAssetId: snapshot.sourceId ?? undefined,
              sources: Array.isArray(snapshot.metadata?.sources)
                ? (snapshot.metadata.sources as EvidenceSnapshot['sources'])
                : [],
              evidence: snapshot.payload ?? {},
            }
          : undefined,
      ),
      actions: actions.map(mapRemovalAction),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      lastUpdateAt: row.lastUpdateAt.toISOString(),
    };
  }

  async list(context: ApiRequestContext) {
    const rows = canReadAll(context)
      ? await this.removalCasesRepository.listAll()
      : await this.removalCasesRepository.listByOwner(requireActorSubject(context));

    return {
      status: 'ok',
      data: await Promise.all(rows.map((row) => this.mapRecord(row))),
    };
  }

  async create(body: unknown, context: ApiRequestContext) {
    const dto = body as CreateRemovalCaseDto;

    if (!dto.targetUrl?.startsWith('http://') && !dto.targetUrl?.startsWith('https://')) {
      throw new HttpError(400, 'Removal target URL must be http:// or https://');
    }

    const timestamp = new Date();
    const inserted = await this.removalCasesRepository.create({
      id: `RM-${crypto.randomUUID()}`,
      ownerUserId: context.actor.subject,
      linkedCheckId: dto.checkId,
      linkedAssetId: dto.assetId,
      caseType: dto.caseType,
      platform: dto.platform,
      targetUrl: dto.targetUrl,
      legalBasis: dto.legalBasis,
      status: dto.status ?? 'open',
      severity: dto.severity,
      summary: dto.summary,
      evidenceCoverage: 'partial',
      slaRisk: 'watch',
      reviewStatus: 'open',
      supportRequested: true,
      nextActionLabel: 'Provider-Kommunikation vorbereiten',
      lastUpdateAt: timestamp,
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    } satisfies RemovalCaseInsert);

    await this.evidenceSnapshotsRepository.create({
      id: `snapshot-${inserted.id}`,
      ownerUserId: context.actor.subject,
      checkId: dto.checkId,
      sourceId: undefined,
      reviewItemId: undefined,
      removalCaseId: inserted.id,
      snapshotType: 'review_brief',
      sourceKind: 'audit_log',
      sourceStatus: 'pending',
      sourceUrl: dto.targetUrl,
      storageKey: undefined,
      sha256: undefined,
      metadata: {
        summary: dto.summary,
        coverage: 'partial',
        retentionNote: 'Retention policy pending',
        sources: [],
      },
      payload: {
        platform: dto.platform,
        legalBasis: dto.legalBasis,
      },
      capturedAt: timestamp,
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    let reviewJob:
      | {
          id: string;
          queue: string;
          name: string;
        }
      | undefined;

    if (inserted.linkedCheckId) {
      const reviewItem = await this.reviewItemsRepository.create({
        id: `review-${crypto.randomUUID()}`,
        ownerUserId: context.actor.subject,
        checkId: inserted.linkedCheckId,
        sourceId: undefined,
        supportRequestId: undefined,
        removalCaseId: inserted.id,
        reviewType: 'removal_review',
        priority: inserted.severity === 'critical' ? 'urgent' : inserted.severity === 'high' ? 'high' : 'medium',
        status: 'open',
        assignedTo: undefined,
        evidenceCoverage: inserted.evidenceCoverage,
        slaRisk: inserted.slaRisk,
        recommendedAction: 'recommend_removal',
        decisionOutcome: undefined,
        decisionSummary: 'Review item created from removal case creation.',
        queueName: 'reviews',
        dueAt: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000),
        decidedAt: undefined,
        retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
        createdAt: timestamp,
        updatedAt: timestamp,
      } satisfies ReviewItemInsert);

      const reviewJobInsert: JobInsert = {
        id: `job-${crypto.randomUUID()}`,
        ownerUserId: context.actor.subject,
        queue: 'reviews',
        name: 'review.materialize',
        status: 'queued',
        resourceType: 'check',
        resourceId: inserted.linkedCheckId,
        payload: {
          reviewItemId: reviewItem.id,
          checkId: inserted.linkedCheckId,
          priority: reviewItem.priority,
          requestedBy: context.actor.subject,
        },
        requestedBy: context.actor.subject,
        attempts: 0,
        maxAttempts: workerJobCatalog['review.materialize'].defaultJobOptions.attempts,
        dedupeKey: `review:${reviewItem.id}`,
        enqueuedAt: timestamp,
        availableAt: timestamp,
        retentionUntil: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const createdReviewJob = await this.jobsRepository.create(reviewJobInsert);
      await this.queueProducerService.enqueueReviewMaterialize(createdReviewJob.id, createdReviewJob.payload);
      reviewJob = {
        id: createdReviewJob.id,
        queue: createdReviewJob.queue,
        name: createdReviewJob.name,
      };
    }

    const jobInsert: JobInsert = {
      id: `job-${crypto.randomUUID()}`,
      ownerUserId: context.actor.subject,
      queue: 'removals',
      name: 'removal.submit',
      status: 'queued',
      resourceType: 'removal_case',
      resourceId: inserted.id,
      payload: {
        removalCaseId: inserted.id,
        platform: inserted.platform,
        targetUrl: inserted.targetUrl,
        requestedBy: context.actor.subject,
      },
      requestedBy: context.actor.subject,
      attempts: 0,
      maxAttempts: workerJobCatalog['removal.submit'].defaultJobOptions.attempts,
      dedupeKey: `removal:submit:${inserted.id}`,
      enqueuedAt: timestamp,
      availableAt: timestamp,
      retentionUntil: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const job = await this.jobsRepository.create(jobInsert);
    await this.queueProducerService.enqueueRemovalSubmit(job.id, job.payload);

    return {
      status: 'accepted',
      data: await this.mapRecord(inserted),
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
        reviewJob,
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const row = canReadAll(context)
      ? await this.removalCasesRepository.findById(id)
      : (() => this.removalCasesRepository.findById(id))();

    const resolvedRow = await row;

    if (!resolvedRow) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    if (!canReadAll(context) && resolvedRow.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    return {
      status: 'ok',
      data: await this.mapRecord(resolvedRow),
    };
  }

  async appendAction(id: string, body: unknown, context: ApiRequestContext) {
    const dto = body as AppendRemovalActionDto;
    const existing = await this.removalCasesRepository.findById(id);

    if (!existing) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    if (!canReadAll(context) && existing.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    const timestamp = new Date();
    await this.removalActionsRepository.create({
      id: `${id}-action-${crypto.randomUUID()}`,
      removalCaseId: id,
      actionType: dto.actionType,
      recipient: dto.recipient,
      payloadSummary: dto.payloadSummary,
      resultStatus: dto.resultStatus,
      externalTicketId: dto.externalTicketId,
      createdAt: timestamp,
    } satisfies RemovalActionInsert);

    const nextStatus =
      dto.resultStatus === 'escalated'
        ? 'escalated'
        : dto.resultStatus === 'submitted'
          ? 'submitted'
          : existing.status;

    const updated = await this.removalCasesRepository.update(id, {
      status: nextStatus,
      nextActionLabel: deriveNextActionLabel(nextStatus),
      lastUpdateAt: timestamp,
      updatedAt: timestamp,
    });

    if (!updated) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    return {
      status: 'accepted',
      data: await this.mapRecord(updated),
    };
  }
}
