import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export class EvidenceSnapshotsService {
  constructor(private readonly store: TrustshieldStore) {}

  async getById(id: string, context: ApiRequestContext) {
    const snapshot = this.store.getEvidenceSnapshotById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!snapshot) {
      throw new HttpError(404, `Evidence snapshot ${id} not found`);
    }

    return { status: 'ok', data: snapshot };
  }
}
