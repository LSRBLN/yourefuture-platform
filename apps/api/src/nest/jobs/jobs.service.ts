import { Inject, Injectable } from '@nestjs/common';

import type { JobsRepository } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { JOBS_REPOSITORY } from '../database/database.module.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

@Injectable()
export class NestJobsService {
  constructor(@Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository) {}

  async list(context: ApiRequestContext) {
    const rows = canReadAll(context)
      ? await this.jobsRepository.listAll()
      : await this.jobsRepository.listForOwner(requireActorSubject(context));

    return {
      status: 'ok',
      data: rows.map((row) => ({
        ...row,
        enqueuedAt: row.enqueuedAt.toISOString(),
        availableAt: row.availableAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        retentionUntil: row.retentionUntil?.toISOString(),
      })),
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const row = await this.jobsRepository.findById(id);

    if (!row) {
      throw new HttpError(404, `Job ${id} not found`);
    }

    if (!canReadAll(context) && row.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Job ${id} not found`);
    }

    return {
      status: 'ok',
      data: {
        ...row,
        enqueuedAt: row.enqueuedAt.toISOString(),
        availableAt: row.availableAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        retentionUntil: row.retentionUntil?.toISOString(),
      },
    };
  }
}
