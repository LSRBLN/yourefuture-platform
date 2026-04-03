import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export class ReviewItemsService {
  constructor(private readonly store: TrustshieldStore) {}

  async list(context: ApiRequestContext) {
    return {
      status: 'ok',
      data: this.store.listReviewItems({
        actorSubject: context.actor.subject,
        canReadAll: context.actor.role !== 'user',
      }),
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const reviewItem = this.store.getReviewItemById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!reviewItem) {
      throw new HttpError(404, `Review item ${id} not found`);
    }

    return { status: 'ok', data: reviewItem };
  }
}
