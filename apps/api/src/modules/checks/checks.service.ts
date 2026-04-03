import type { CreateCheckRequestContract } from '@trustshield/core';
import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateCheckRequest } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export type CreateCheckDto = {
  type: CreateCheckRequestContract['type'];
  input: CreateCheckRequestContract['input'];
};

export class ChecksService {
  constructor(private readonly store: TrustshieldStore) {}

  async create(dto: CreateCheckDto, context: ApiRequestContext) {
    const validation = safeParseCreateCheckRequest(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Check contract validation failed', validation.issues);
    }

    const check = this.store.createCheck(validation.data, context.actor.subject);
    return {
      status: 'accepted',
      data: {
        id: check.id,
        type: check.type,
        status: check.status,
        submittedSourceIds: check.submittedSourceIds,
        createdAt: check.createdAt,
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const check = this.store.getCheckById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!check) {
      throw new HttpError(404, `Check ${id} not found`);
    }

    return { status: 'ok', data: check };
  }
}
