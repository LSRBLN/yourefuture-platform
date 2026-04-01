import { Inject, Injectable } from '@nestjs/common';

import type { EvidenceSnapshot } from '@trustshield/core';
import type { EvidenceSnapshotRow, EvidenceSnapshotsRepository } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { EVIDENCE_SNAPSHOTS_REPOSITORY } from '../database/database.module.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

function mapEvidenceSnapshot(row: EvidenceSnapshotRow): EvidenceSnapshot {
  const metadata = row.metadata ?? {};
  const sources = Array.isArray(metadata.sources) ? metadata.sources : [];

  return {
    id: row.id,
    snapshotType: row.snapshotType,
    summary: typeof metadata.summary === 'string' ? metadata.summary : row.snapshotType,
    coverage: (typeof metadata.coverage === 'string' ? metadata.coverage : 'partial') as EvidenceSnapshot['coverage'],
    retentionNote:
      typeof metadata.retentionNote === 'string'
        ? metadata.retentionNote
        : row.retentionUntil
          ? `Retain until ${row.retentionUntil.toISOString()}`
          : 'Retention policy pending',
    capturedAt: row.capturedAt.toISOString(),
    linkedCheckId: row.checkId ?? undefined,
    linkedReviewItemId: row.reviewItemId ?? undefined,
    linkedAssetId: row.sourceId ?? undefined,
    sources: sources as EvidenceSnapshot['sources'],
    evidence: row.payload ?? {},
  };
}

@Injectable()
export class NestEvidenceSnapshotsService {
  constructor(
    @Inject(EVIDENCE_SNAPSHOTS_REPOSITORY) private readonly evidenceSnapshotsRepository: EvidenceSnapshotsRepository,
  ) {}

  async getById(id: string, context: ApiRequestContext) {
    const row = canReadAll(context)
      ? await this.evidenceSnapshotsRepository.findById(id)
      : await this.evidenceSnapshotsRepository.findVisibleForUser(id, requireActorSubject(context));

    if (!row) {
      throw new HttpError(404, `Evidence snapshot ${id} not found`);
    }

    return {
      status: 'ok',
      data: mapEvidenceSnapshot(row),
    };
  }
}
