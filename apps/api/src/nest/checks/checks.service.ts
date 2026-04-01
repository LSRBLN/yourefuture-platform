import { Inject, Injectable } from '@nestjs/common';

import { workerJobCatalog } from '@trustshield/core';
import type { CheckInsert, ChecksRepository, JobInsert, JobsRepository } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateCheckRequest } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { CHECKS_REPOSITORY, JOBS_REPOSITORY } from '../database/database.module.js';
import { QueueProducerService } from '../queue/queue-producer.service.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

@Injectable()
export class NestChecksService {
  constructor(
    @Inject(CHECKS_REPOSITORY) private readonly checksRepository: ChecksRepository,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
  ) {}

  async create(body: unknown, context: ApiRequestContext) {
    const validation = safeParseCreateCheckRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Check contract validation failed', validation.issues);
    }

    const timestamp = new Date();
    const actorSubject = context.actor.subject;
    const input: CheckInsert = {
      id: `check-${crypto.randomUUID()}`,
      ownerUserId: actorSubject,
      type: validation.data.type,
      status: 'queued',
      input: validation.data.input,
      risk: {},
      submittedSourceIds: validation.data.input.submittedSourceIds ?? [],
      reviewItemIds: [],
      removalCaseIds: [],
      retentionUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const row = await this.checksRepository.create(input);
    const jobInsert: JobInsert = {
      id: `job-${crypto.randomUUID()}`,
      ownerUserId: actorSubject,
      queue: 'checks',
      name: 'check.execute',
      status: 'queued',
      resourceType: 'check',
      resourceId: row.id,
      payload: {
        checkId: row.id,
        checkType: row.type,
        submittedSourceIds: row.submittedSourceIds,
        requestedBy: actorSubject,
      },
      requestedBy: actorSubject,
      attempts: 0,
      maxAttempts: workerJobCatalog['check.execute'].defaultJobOptions.attempts,
      dedupeKey: `check:${row.id}`,
      enqueuedAt: timestamp,
      availableAt: timestamp,
      retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const job = await this.jobsRepository.create(jobInsert);
    await this.queueProducerService.enqueueCheckExecute(job.id, job.payload);

    return {
      status: 'accepted',
      data: {
        id: row.id,
        type: row.type,
        status: row.status,
        submittedSourceIds: row.submittedSourceIds,
        createdAt: row.createdAt.toISOString(),
      },
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const record = await this.checksRepository.findById(id);

    if (!record) {
      throw new HttpError(404, `Check ${id} not found`);
    }

    if (!canReadAll(context) && record.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Check ${id} not found`);
    }

    return {
      status: 'ok',
      data: {
        ...record,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        retentionUntil: record.retentionUntil?.toISOString(),
      },
    };
  }
}
