import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export class JobsService {
  constructor(private readonly store: TrustshieldStore) {}

  async list(context: ApiRequestContext) {
    return {
      status: 'ok',
      data: this.store.listJobs({
        actorSubject: context.actor.subject,
        canReadAll: context.actor.role !== 'user',
      }),
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const job = this.store.getJobById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!job) {
      throw new HttpError(404, `Job ${id} not found`);
    }

    return { status: 'ok', data: job };
  }
}
