import type { CreateSourceRequestContract } from '@trustshield/core';
import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateSourceRequest } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export type CreateSourceDto = {
  sourceType: CreateSourceRequestContract['sourceType'];
  sourceUrl: string;
  platformName?: string;
  pageTitle?: string;
  notes?: string;
  assetId?: string;
  checkId?: string;
};

export class SourcesService {
  constructor(private readonly store: TrustshieldStore) {}

  async create(dto: CreateSourceDto, context: ApiRequestContext) {
    const validation = safeParseCreateSourceRequest(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Source contract validation failed', validation.issues);
    }

    const source = this.store.createSource(validation.data, context.actor.subject);
    return {
      status: 'accepted',
      data: {
        id: source.id,
        sourceType: source.sourceType,
        sourceUrl: source.sourceUrl,
        platformName: source.platformName,
        checkId: source.checkId,
        assetId: source.assetId,
        createdAt: source.createdAt,
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const source = this.store.getSourceById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!source) {
      throw new HttpError(404, `Source ${id} not found`);
    }

    return { status: 'ok', data: source };
  }
}
