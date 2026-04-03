import { Inject, Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';

import { workerJobCatalog } from '@trustshield/core';

import { ASSETS_QUEUE, CHECKS_QUEUE, OSINT_QUEUE, REMOVALS_QUEUE, RETENTION_QUEUE, REVIEWS_QUEUE, SUPPORT_QUEUE } from './queue.tokens.js';

@Injectable()
export class QueueProducerService {
  constructor(
    @Inject(ASSETS_QUEUE) private readonly assetsQueue: Queue,
    @Inject(CHECKS_QUEUE) private readonly checksQueue: Queue,
    @Inject(REVIEWS_QUEUE) private readonly reviewsQueue: Queue,
    @Inject(SUPPORT_QUEUE) private readonly supportQueue: Queue,
    @Inject(REMOVALS_QUEUE) private readonly removalsQueue: Queue,
    @Inject(RETENTION_QUEUE) private readonly retentionQueue: Queue,
    @Inject(OSINT_QUEUE) private readonly osintQueue: Queue,
  ) {}

  private enqueue(queue: Queue, jobName: keyof typeof workerJobCatalog, jobId: string, payload: Record<string, unknown>) {
    const registration = workerJobCatalog[jobName];

    return queue.add(registration.name, payload, {
      jobId,
      attempts: registration.defaultJobOptions.attempts,
      removeOnComplete: registration.defaultJobOptions.removeOnComplete,
      removeOnFail: registration.defaultJobOptions.removeOnFail,
      backoff: {
        type: registration.defaultJobOptions.backoff.type,
        delay: registration.defaultJobOptions.backoff.delayMs,
      },
    });
  }

  enqueueAssetScan(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.assetsQueue, 'asset.scan', jobId, payload);
  }

  enqueueAssetPromote(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.assetsQueue, 'asset.promote', jobId, payload);
  }

  enqueueCheckExecute(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.checksQueue, 'check.execute', jobId, payload);
  }

  enqueueReviewMaterialize(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.reviewsQueue, 'review.materialize', jobId, payload);
  }

  enqueueSupportTriage(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.supportQueue, 'support.triage', jobId, payload);
  }

  enqueueRemovalSubmit(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.removalsQueue, 'removal.submit', jobId, payload);
  }

  enqueueRetentionCleanup(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.retentionQueue, 'retention.cleanup', jobId, payload);
  }

  enqueueOsintExecute(jobId: string, payload: Record<string, unknown>) {
    return this.enqueue(this.osintQueue, 'osint.execute', jobId, payload);
  }
}
