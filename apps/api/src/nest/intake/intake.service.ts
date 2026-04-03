import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { workerJobCatalog } from '@trustshield/core';
import type {
  CheckInsert,
  ChecksRepository,
  JobInsert,
  JobsRepository,
  ReviewItemInsert,
  ReviewItemsRepository,
  SourceInsert,
  SourcesRepository,
  SupportRequestInsert,
  SupportRequestsRepository,
} from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseIntakeOrchestrator } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import {
  CHECKS_REPOSITORY,
  JOBS_REPOSITORY,
  REVIEW_ITEMS_REPOSITORY,
  SOURCES_REPOSITORY,
  SUPPORT_REQUESTS_REPOSITORY,
} from '../database/database.module.js';
import { QueueProducerService } from '../queue/queue-producer.service.js';

@Injectable()
export class NestIntakeService {
  constructor(
    @Inject(CHECKS_REPOSITORY) private readonly checksRepository: ChecksRepository,
    @Inject(SOURCES_REPOSITORY) private readonly sourcesRepository: SourcesRepository,
    @Inject(SUPPORT_REQUESTS_REPOSITORY) private readonly supportRequestsRepository: SupportRequestsRepository,
    @Inject(REVIEW_ITEMS_REPOSITORY) private readonly reviewItemsRepository: ReviewItemsRepository,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
  ) {}

  async create(body: unknown, context: ApiRequestContext) {
    const validation = safeParseIntakeOrchestrator(body);

    if (!validation.success) {
      throw new HttpError(400, 'Intake orchestrator validation failed', validation.issues);
    }

    const timestamp = new Date();
    const actorSubject = context.actor.subject;

    const checkInsert: CheckInsert = {
      id: `check-${randomUUID()}`,
      ownerUserId: actorSubject,
      type: validation.data.payload.check.type,
      status: 'queued',
      input: validation.data.payload.check.input,
      risk: {},
      submittedSourceIds: validation.data.payload.check.input.submittedSourceIds ?? [],
      reviewItemIds: [],
      removalCaseIds: [],
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const check = await this.checksRepository.create(checkInsert);

    const sourceInsert: SourceInsert = {
      id: `source-${randomUUID()}`,
      ownerUserId: actorSubject,
      checkId: check.id,
      assetId: validation.data.payload.source.assetId,
      sourceType: validation.data.payload.source.sourceType,
      sourceUrl: validation.data.payload.source.sourceUrl,
      platformName: validation.data.payload.source.platformName,
      pageTitle: validation.data.payload.source.pageTitle,
      notes: validation.data.payload.source.notes,
      validationStatus: 'pending',
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const source = await this.sourcesRepository.create(sourceInsert);

    const supportInsert: SupportRequestInsert = {
      id: `support-${randomUUID()}`,
      ownerUserId: actorSubject,
      checkId: check.id,
      assetId: validation.data.payload.support.assetId,
      removalCaseId: validation.data.payload.support.removalCaseId,
      requestType: validation.data.payload.support.requestType,
      priority: validation.data.payload.support.priority ?? 'medium',
      status: 'open',
      preferredContact: validation.data.payload.support.preferredContact,
      message: validation.data.payload.support.message,
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

    const support = await this.supportRequestsRepository.create(supportInsert);

    const reviewItemInsert: ReviewItemInsert = {
      id: `review-${randomUUID()}`,
      ownerUserId: actorSubject,
      checkId: check.id,
      sourceId: source.id,
      supportRequestId: support.id,
      removalCaseId: undefined,
      reviewType: 'support_escalation',
      priority: support.priority,
      status: 'open',
      assignedTo: undefined,
      evidenceCoverage: 'partial',
      slaRisk: 'watch',
      recommendedAction: 'handover_support',
      decisionOutcome: undefined,
      decisionSummary: 'Review item created from intake orchestrator flow.',
      queueName: 'reviews',
      dueAt: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000),
      decidedAt: undefined,
      retentionUntil: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const reviewItem = await this.reviewItemsRepository.create(reviewItemInsert);

    const checkJobInsert: JobInsert = {
      id: `job-${randomUUID()}`,
      ownerUserId: actorSubject,
      queue: 'checks',
      name: 'check.execute',
      status: 'queued',
      resourceType: 'check',
      resourceId: check.id,
      payload: {
        checkId: check.id,
        checkType: check.type,
        submittedSourceIds: check.submittedSourceIds,
        requestedBy: actorSubject,
      },
      requestedBy: actorSubject,
      attempts: 0,
      maxAttempts: workerJobCatalog['check.execute'].defaultJobOptions.attempts,
      dedupeKey: `check:${check.id}`,
      enqueuedAt: timestamp,
      availableAt: timestamp,
      retentionUntil: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const supportJobInsert: JobInsert = {
      id: `job-${randomUUID()}`,
      ownerUserId: actorSubject,
      queue: 'support',
      name: 'support.triage',
      status: 'queued',
      resourceType: 'support_request',
      resourceId: support.id,
      payload: {
        supportRequestId: support.id,
        priority: support.priority,
        checkId: support.checkId,
        requestedBy: actorSubject,
      },
      requestedBy: actorSubject,
      attempts: 0,
      maxAttempts: workerJobCatalog['support.triage'].defaultJobOptions.attempts,
      dedupeKey: `support:${support.id}`,
      enqueuedAt: timestamp,
      availableAt: timestamp,
      retentionUntil: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const reviewJobInsert: JobInsert = {
      id: `job-${randomUUID()}`,
      ownerUserId: actorSubject,
      queue: 'reviews',
      name: 'review.materialize',
      status: 'queued',
      resourceType: 'check',
      resourceId: check.id,
      payload: {
        reviewItemId: reviewItem.id,
        checkId: check.id,
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

    const checkJob = await this.jobsRepository.create(checkJobInsert);
    const supportJob = await this.jobsRepository.create(supportJobInsert);
    const reviewJob = await this.jobsRepository.create(reviewJobInsert);

    await this.queueProducerService.enqueueCheckExecute(checkJob.id, checkJob.payload);
    await this.queueProducerService.enqueueSupportTriage(supportJob.id, supportJob.payload);
    await this.queueProducerService.enqueueReviewMaterialize(reviewJob.id, reviewJob.payload);

    return {
      status: 'accepted' as const,
      apiVersion: 'v1' as const,
      requestId: `intake-${check.id}-${support.id}`,
      concern: validation.data.concern,
      created: {
        checkId: check.id,
        sourceId: source.id,
        supportRequestId: support.id,
        reviewItemId: reviewItem.id,
      },
      queue: {
        reviewPriority: support.priority,
        nextStep: 'Review-Triage mit optionalem Removal-Handover',
        enqueuedJobs: [
          { queue: checkJob.queue, name: checkJob.name, jobId: checkJob.id },
          { queue: supportJob.queue, name: supportJob.name, jobId: supportJob.id },
          { queue: reviewJob.queue, name: reviewJob.name, jobId: reviewJob.id },
        ],
      },
      validation: {
        checkIssueCount: 0,
        sourceIssueCount: 0,
        supportIssueCount: 0,
      },
    };
  }
}
