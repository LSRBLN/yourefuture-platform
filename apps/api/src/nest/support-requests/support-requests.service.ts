import { Inject, Injectable } from '@nestjs/common';

import { workerJobCatalog } from '@trustshield/core';
import type { JobInsert, JobsRepository, ReviewItemInsert, ReviewItemsRepository, SupportRequestInsert, SupportRequestsRepository } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateSupportRequest, safeParseTransitionSupportRequestStatus, safeParseUpdateSupportRequestAssignment } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { JOBS_REPOSITORY, REVIEW_ITEMS_REPOSITORY, SUPPORT_REQUESTS_REPOSITORY } from '../database/database.module.js';
import { QueueProducerService } from '../queue/queue-producer.service.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';

@Injectable()
export class NestSupportRequestsService {
  constructor(
    @Inject(SUPPORT_REQUESTS_REPOSITORY) private readonly supportRequestsRepository: SupportRequestsRepository,
    @Inject(REVIEW_ITEMS_REPOSITORY) private readonly reviewItemsRepository: ReviewItemsRepository,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
  ) {}

  async create(body: unknown, context: ApiRequestContext) {
    const validation = safeParseCreateSupportRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Support request contract validation failed', validation.issues);
    }

    const timestamp = new Date();
    const actorSubject = context.actor.subject;
    const input: SupportRequestInsert = {
      id: `support-${crypto.randomUUID()}`,
      ownerUserId: actorSubject,
      checkId: validation.data.checkId,
      assetId: validation.data.assetId,
      removalCaseId: validation.data.removalCaseId,
      requestType: validation.data.requestType,
      priority: validation.data.priority ?? 'medium',
      status: 'open',
      preferredContact: validation.data.preferredContact,
      message: validation.data.message,
      assignmentHistory: [],
      statusHistory: [{ toStatus: 'open', changedAt: timestamp.toISOString(), reason: 'created' }],
      audit: { lastAction: 'created', createdBy: actorSubject },
      retention: {
        policyKey: 'support-request-default',
        retainUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewedAt: timestamp.toISOString(),
      },
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const row = await this.supportRequestsRepository.create(input);
    let reviewJob:
      | {
          id: string;
          queue: string;
          name: string;
        }
      | undefined;

    if (row.checkId) {
      const reviewItem = await this.reviewItemsRepository.create({
        id: `review-${crypto.randomUUID()}`,
        ownerUserId: actorSubject,
        checkId: row.checkId,
        sourceId: undefined,
        supportRequestId: row.id,
        removalCaseId: row.removalCaseId,
        reviewType: 'support_escalation',
        priority: row.priority,
        status: 'open',
        assignedTo: undefined,
        evidenceCoverage: 'partial',
        slaRisk: 'watch',
        recommendedAction: 'handover_support',
        decisionOutcome: undefined,
        decisionSummary: 'Review item created from standalone support request.',
        queueName: 'reviews',
        dueAt: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000),
        decidedAt: undefined,
        retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
        createdAt: timestamp,
        updatedAt: timestamp,
      } satisfies ReviewItemInsert);

      const reviewJobInsert: JobInsert = {
        id: `job-${crypto.randomUUID()}`,
        ownerUserId: actorSubject,
        queue: 'reviews',
        name: 'review.materialize',
        status: 'queued',
        resourceType: 'check',
        resourceId: row.checkId,
        payload: {
          reviewItemId: reviewItem.id,
          checkId: row.checkId,
          priority: reviewItem.priority,
          requestedBy: actorSubject,
        },
        requestedBy: actorSubject,
        attempts: 0,
        maxAttempts: workerJobCatalog['review.materialize'].defaultJobOptions.attempts,
        dedupeKey: `review:${reviewItem.id}`,
        enqueuedAt: timestamp,
        availableAt: timestamp,
        retentionUntil: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const createdReviewJob = await this.jobsRepository.create(reviewJobInsert);
      await this.queueProducerService.enqueueReviewMaterialize(createdReviewJob.id, createdReviewJob.payload);
      reviewJob = {
        id: createdReviewJob.id,
        queue: createdReviewJob.queue,
        name: createdReviewJob.name,
      };
    }

    const jobInsert: JobInsert = {
      id: `job-${crypto.randomUUID()}`,
      ownerUserId: actorSubject,
      queue: 'support',
      name: 'support.triage',
      status: 'queued',
      resourceType: 'support_request',
      resourceId: row.id,
      payload: {
        supportRequestId: row.id,
        priority: row.priority,
        checkId: row.checkId,
        requestedBy: actorSubject,
      },
      requestedBy: actorSubject,
      attempts: 0,
      maxAttempts: workerJobCatalog['support.triage'].defaultJobOptions.attempts,
      dedupeKey: `support:${row.id}`,
      enqueuedAt: timestamp,
      availableAt: timestamp,
      retentionUntil: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const job = await this.jobsRepository.create(jobInsert);
    await this.queueProducerService.enqueueSupportTriage(job.id, job.payload);

    return {
      status: 'accepted',
      data: {
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        retentionUntil: row.retentionUntil?.toISOString(),
      },
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
        reviewJob,
      },
    };
  }

  async list(context: ApiRequestContext) {
    const rows = canReadAll(context)
      ? await this.supportRequestsRepository.listAll()
      : await this.supportRequestsRepository.listVisibleForUser(requireActorSubject(context));

    return {
      status: 'ok',
      data: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        retentionUntil: row.retentionUntil?.toISOString(),
      })),
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const row = canReadAll(context)
      ? await this.supportRequestsRepository.findById(id)
      : await this.supportRequestsRepository.findVisibleForUser(id, requireActorSubject(context));

    if (!row) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    return {
      status: 'ok',
      data: {
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        retentionUntil: row.retentionUntil?.toISOString(),
      },
    };
  }

  async assign(id: string, body: unknown) {
    const validation = safeParseUpdateSupportRequestAssignment(body);

    if (!validation.success) {
      throw new HttpError(400, 'Support request assignment validation failed', validation.issues);
    }

    const existing = await this.supportRequestsRepository.findById(id);

    if (!existing) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    const timestamp = new Date().toISOString();
    const updated = await this.supportRequestsRepository.updateAssignment(id, {
      assignedTo: validation.data.assignedTo,
      assignmentHistory: [
        ...(existing.assignmentHistory ?? []),
        {
          assignedTo: validation.data.assignedTo,
          assignedBy: validation.data.assignedBy,
          reason: validation.data.reason,
          changedAt: timestamp,
        },
      ],
      audit: {
        ...(existing.audit ?? {}),
        lastAction: 'assignment_updated',
      },
      retention: {
        ...(existing.retention ?? {}),
        lastReviewedAt: timestamp,
      },
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    return {
      status: 'accepted',
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        retentionUntil: updated.retentionUntil?.toISOString(),
      },
    };
  }

  async transitionStatus(id: string, body: unknown) {
    const validation = safeParseTransitionSupportRequestStatus(body);

    if (!validation.success) {
      throw new HttpError(400, 'Support request status transition validation failed', validation.issues);
    }

    const existing = await this.supportRequestsRepository.findById(id);

    if (!existing) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    const timestamp = new Date().toISOString();
    const updated = await this.supportRequestsRepository.updateStatus(id, {
      status: validation.data.status,
      statusHistory: [
        ...(existing.statusHistory ?? []),
        {
          toStatus: validation.data.status,
          changedAt: timestamp,
          changedBy: validation.data.changedBy,
          reason: validation.data.reason,
        },
      ],
      audit: {
        ...(existing.audit ?? {}),
        lastAction: 'status_transition',
      },
      retention: {
        ...(existing.retention ?? {}),
        lastReviewedAt: timestamp,
      },
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    return {
      status: 'accepted',
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        retentionUntil: updated.retentionUntil?.toISOString(),
      },
    };
  }
}
