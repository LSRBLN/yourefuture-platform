import { Inject, Injectable } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { from, map, type Observable } from 'rxjs';

import { workerJobCatalog } from '@trustshield/core';
import type {
  JobInsert,
  JobsRepository,
  OsintHistoryRepository,
  OsintResultsRepository,
  OsintSearchesRepository,
} from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateOsintSearchRequest, safeParseOsintUnifiedResult } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import {
  JOBS_REPOSITORY,
  OSINT_HISTORY_REPOSITORY,
  OSINT_RESULTS_REPOSITORY,
  OSINT_SEARCHES_REPOSITORY,
} from '../database/database.module.js';
import { QueueProducerService } from '../queue/queue-producer.service.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

@Injectable()
export class NestOsintService {
  constructor(
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(OSINT_SEARCHES_REPOSITORY) private readonly osintSearchesRepository: OsintSearchesRepository,
    @Inject(OSINT_RESULTS_REPOSITORY) private readonly osintResultsRepository: OsintResultsRepository,
    @Inject(OSINT_HISTORY_REPOSITORY) private readonly osintHistoryRepository: OsintHistoryRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
  ) {}

  async createSearch(body: unknown, context: ApiRequestContext) {
    const validation = safeParseCreateOsintSearchRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'OSINT search contract validation failed', validation.issues);
    }

    const timestamp = new Date();
    const actorSubject = requireActorSubject(context);
    const searchId = `osint-${crypto.randomUUID()}`;
    const dedupeKey = validation.data.idempotencyKey
      ? `osint:idempotency:${validation.data.idempotencyKey}`
      : `osint:${validation.data.queryType}:${validation.data.query}`;

    const jobInsert: JobInsert = {
      id: `job-${crypto.randomUUID()}`,
      ownerUserId: actorSubject,
      queue: 'osint',
      name: 'osint.execute',
      status: 'queued',
      resourceType: 'osint_search',
      resourceId: searchId,
      payload: {
        searchId,
        query: validation.data.query,
        queryType: validation.data.queryType,
        scope: validation.data.scope,
        providers: validation.data.providers,
        idempotencyKey: validation.data.idempotencyKey,
        dedupeKey,
        maxAttempts: workerJobCatalog['osint.execute'].defaultJobOptions.attempts,
        backoff: workerJobCatalog['osint.execute'].defaultJobOptions.backoff,
        requestedBy: actorSubject,
      },
      requestedBy: actorSubject,
      attempts: 0,
      maxAttempts: workerJobCatalog['osint.execute'].defaultJobOptions.attempts,
      dedupeKey,
      enqueuedAt: timestamp,
      availableAt: timestamp,
      retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const job = await this.jobsRepository.create(jobInsert);
    await this.osintSearchesRepository.create({
      id: searchId,
      ownerUserId: actorSubject,
      query: validation.data.query,
      queryType: validation.data.queryType,
      scope: validation.data.scope,
      status: 'queued',
      schemaVersion: '1.0',
      requestedBy: actorSubject,
      providers: validation.data.providers,
      resultCount: 0,
      dedupeKey,
      latestJobId: job.id,
      startedAt: null,
      completedAt: null,
      lastError: null,
      retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await this.queueProducerService.enqueueOsintExecute(job.id, job.payload);

    return {
      status: 'accepted',
      data: {
        id: searchId,
        query: validation.data.query,
        queryType: validation.data.queryType,
        scope: validation.data.scope,
        providers: validation.data.providers,
        status: 'queued',
        schemaVersion: '1.0',
        createdAt: job.createdAt.toISOString(),
      },
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
        maxAttempts: job.maxAttempts,
        backoff: workerJobCatalog['osint.execute'].defaultJobOptions.backoff,
      },
    };
  }

  async getSearchById(id: string, context: ApiRequestContext) {
    const search = await this.osintSearchesRepository.findById(id);

    if (search) {
      if (!canReadAll(context) && search.ownerUserId !== requireActorSubject(context)) {
        throw new HttpError(404, `OSINT search ${id} not found`);
      }

      const history = canReadAll(context)
        ? await this.osintHistoryRepository.listBySearch(id)
        : await this.osintHistoryRepository.listBySearchForOwner(id, requireActorSubject(context));
      const results = canReadAll(context)
        ? await this.osintResultsRepository.listBySearch(id)
        : await this.osintResultsRepository.listBySearchForOwner(id, requireActorSubject(context));

      const parsedUnified = results
        .map((item) => safeParseOsintUnifiedResult(item.payload))
        .find((item) => item.success === true);

      return {
        status: 'ok',
        data: {
          id,
          status: search.status,
          schemaVersion: search.schemaVersion,
          query: search.query,
          queryType: search.queryType,
          scope: search.scope,
          providers: search.providers,
          requestedBy: search.requestedBy,
          latestJobId: search.latestJobId,
          resultCount: search.resultCount,
          startedAt: search.startedAt?.toISOString() ?? null,
          completedAt: search.completedAt?.toISOString() ?? null,
          createdAt: search.createdAt.toISOString(),
          updatedAt: search.updatedAt.toISOString(),
          lastError: search.lastError,
          unifiedResult: parsedUnified && parsedUnified.success ? parsedUnified.data : null,
          history: history.map((entry) => ({
            id: entry.id,
            eventType: entry.eventType,
            message: entry.message,
            payload: entry.payload,
            createdBy: entry.createdBy,
            createdAt: entry.createdAt.toISOString(),
          })),
        },
      };
    }

    const rows = await this.jobsRepository.listByResource('osint_search', id);
    const row = rows[0];

    if (!row) {
      throw new HttpError(404, `OSINT search ${id} not found`);
    }

    if (!canReadAll(context) && row.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `OSINT search ${id} not found`);
    }

    return {
      status: 'ok',
      data: {
        id,
        status: row.status,
        schemaVersion: '1.0',
        requestedBy: row.requestedBy,
        queue: row.queue,
        name: row.name,
        attempts: row.attempts,
        maxAttempts: row.maxAttempts,
        enqueuedAt: row.enqueuedAt.toISOString(),
        availableAt: row.availableAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        lastError: row.lastError,
        result: row.payload,
      },
    };
  }

  streamSearch(id: string, context: ApiRequestContext): Observable<MessageEvent> {
    return from(this.getSearchById(id, context)).pipe(
      map((snapshot) => ({
        type: 'osint.search.snapshot',
        data: snapshot.data,
      })),
    );
  }
}
