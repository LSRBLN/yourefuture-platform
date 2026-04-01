import { Inject, Injectable } from '@nestjs/common';

import type { EvidenceSnapshot, ReviewQueueItem } from '@trustshield/core';
import type { ReviewItemRow, ReviewItemsRepository } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { REVIEW_ITEMS_REPOSITORY } from '../database/database.module.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

function coerceEvidenceSnapshot(row: ReviewItemRow): EvidenceSnapshot {
  const snapshot = (row as unknown as { evidenceSnapshot?: EvidenceSnapshot }).evidenceSnapshot;

  if (snapshot) {
    return snapshot;
  }

  return {
    id: `snapshot-${row.id}`,
    snapshotType: 'review_brief',
    summary: row.decisionSummary ?? row.reviewType,
    coverage: row.evidenceCoverage,
    retentionNote: row.retentionUntil ? `Retain until ${row.retentionUntil.toISOString()}` : 'Retention policy pending',
    capturedAt: row.updatedAt.toISOString(),
    linkedCheckId: row.checkId ?? undefined,
    linkedReviewItemId: row.id,
    linkedAssetId: row.sourceId ?? undefined,
    sources: [],
    evidence: {
      queueName: row.queueName,
      status: row.status,
    },
  };
}

function mapReviewItem(row: ReviewItemRow): ReviewQueueItem {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    summary: row.decisionSummary ?? undefined,
    reviewType: row.reviewType,
    priority: row.priority,
    status: row.status,
    linkedCheckId: row.checkId ?? undefined,
    linkedAssetId: row.sourceId ?? undefined,
    linkedRemovalCaseId: row.removalCaseId ?? undefined,
    linkedSupportRequestId: row.supportRequestId ?? undefined,
    assignedTo: row.assignedTo ?? undefined,
    recommendedAction: row.recommendedAction ?? 'monitor',
    finalDecision: row.decisionOutcome ?? undefined,
    reviewerNotes: row.decisionSummary ?? undefined,
    evidenceSnapshot: coerceEvidenceSnapshot(row),
  };
}

@Injectable()
export class NestReviewsService {
  constructor(@Inject(REVIEW_ITEMS_REPOSITORY) private readonly reviewItemsRepository: ReviewItemsRepository) {}

  async list(context: ApiRequestContext) {
    const rows = canReadAll(context)
      ? await this.reviewItemsRepository.listAll()
      : await this.reviewItemsRepository.listVisibleForUser(requireActorSubject(context));

    return {
      status: 'ok',
      data: rows.map(mapReviewItem),
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const row = canReadAll(context)
      ? await this.reviewItemsRepository.findById(id)
      : await this.reviewItemsRepository.findVisibleForUser(id, requireActorSubject(context));

    if (!row) {
      throw new HttpError(404, `Review item ${id} not found`);
    }

    return {
      status: 'ok',
      data: mapReviewItem(row),
    };
  }
}
