import { Inject, Injectable } from '@nestjs/common';

import type { SourceInsert, SourcesRepository } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateSourceRequest } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { SOURCES_REPOSITORY } from '../database/database.module.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

@Injectable()
export class NestSourcesService {
  constructor(@Inject(SOURCES_REPOSITORY) private readonly sourcesRepository: SourcesRepository) {}

  async create(body: unknown, context: ApiRequestContext) {
    const validation = safeParseCreateSourceRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Source contract validation failed', validation.issues);
    }

    const timestamp = new Date();
    const input: SourceInsert = {
      id: `source-${crypto.randomUUID()}`,
      ownerUserId: context.actor.subject,
      checkId: validation.data.checkId,
      assetId: validation.data.assetId,
      sourceType: validation.data.sourceType,
      sourceUrl: validation.data.sourceUrl,
      platformName: validation.data.platformName,
      pageTitle: validation.data.pageTitle,
      notes: validation.data.notes,
      validationStatus: 'pending',
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const source = await this.sourcesRepository.create(input);

    return {
      status: 'accepted',
      data: {
        id: source.id,
        sourceType: source.sourceType,
        sourceUrl: source.sourceUrl,
        platformName: source.platformName,
        checkId: source.checkId,
        assetId: source.assetId,
        createdAt: source.createdAt.toISOString(),
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const source = await this.sourcesRepository.findById(id);

    if (!source) {
      throw new HttpError(404, `Source ${id} not found`);
    }

    if (!canReadAll(context) && source.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Source ${id} not found`);
    }

    return {
      status: 'ok',
      data: {
        ...source,
        createdAt: source.createdAt.toISOString(),
        updatedAt: source.updatedAt.toISOString(),
        retentionUntil: source.retentionUntil?.toISOString(),
      },
    };
  }
}
