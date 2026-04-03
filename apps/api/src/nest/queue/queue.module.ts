import { Module } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { createBullmqRuntimeConfig, workerJobCatalog } from '@trustshield/core';
import { QueueProducerService } from './queue-producer.service.js';
import { ASSETS_QUEUE, BULLMQ_CONNECTION, CHECKS_QUEUE, OSINT_QUEUE, REMOVALS_QUEUE, RETENTION_QUEUE, REVIEWS_QUEUE, SUPPORT_QUEUE } from './queue.tokens.js';

class NoopQueue {
  async add(name: string, data: unknown, options: Record<string, unknown>) {
    return {
      id: typeof options.jobId === 'string' ? options.jobId : `${name}-noop`,
      name,
      data,
      opts: options,
      queueName: 'noop',
    };
  }
}

function createQueue(queueName: string, connection: IORedis, prefix: string) {
  return new Queue(queueName, {
    connection,
    prefix,
    defaultJobOptions: {
      // Standard retry with exponential backoff
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s initial delay
      },
      // Remove jobs after completion to prevent memory bloat
      removeOnComplete: {
        age: 3600, // Keep for 1 hour
      },
      removeOnFail: false, // Keep failed jobs for inspection
    },
  });
}

function isQueueRuntimeDisabled() {
  return process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME === 'true';
}

function createQueueProvider(queueName: string, token: symbol) {
  return {
    provide: token,
    inject: [BULLMQ_CONNECTION],
    useFactory: (connection: IORedis | null) => {
      if (!connection) {
        return new NoopQueue() as unknown as Queue;
      }

      return createQueue(queueName, connection, createBullmqRuntimeConfig().prefix);
    },
  };
}

@Module({
  providers: [
    {
      provide: BULLMQ_CONNECTION,
      useFactory: async () => {
        const logger = new Logger('QueueModule');

        if (isQueueRuntimeDisabled()) {
          return null;
        }

        const runtime = createBullmqRuntimeConfig();
        const connection = new IORedis(runtime.connectionUrl, {
          maxRetriesPerRequest: null,
          lazyConnect: true,
        });

        // Health check: ensure Redis is reachable on startup
        try {
          await connection.ping();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown Redis error';
          logger.error(`Redis health check failed on startup: ${message}`);
          throw new Error(`Redis initialization failed: ${message}`);
        }

        return connection;
      },
    },
    createQueueProvider(workerJobCatalog['asset.scan'].queue, ASSETS_QUEUE),
    createQueueProvider(workerJobCatalog['check.execute'].queue, CHECKS_QUEUE),
    createQueueProvider(workerJobCatalog['review.materialize'].queue, REVIEWS_QUEUE),
    createQueueProvider(workerJobCatalog['support.triage'].queue, SUPPORT_QUEUE),
    createQueueProvider(workerJobCatalog['removal.submit'].queue, REMOVALS_QUEUE),
    createQueueProvider(workerJobCatalog['retention.cleanup'].queue, RETENTION_QUEUE),
    createQueueProvider(workerJobCatalog['osint.execute'].queue, OSINT_QUEUE),
    QueueProducerService,
  ],
  exports: [BULLMQ_CONNECTION, ASSETS_QUEUE, CHECKS_QUEUE, REVIEWS_QUEUE, SUPPORT_QUEUE, REMOVALS_QUEUE, RETENTION_QUEUE, OSINT_QUEUE, QueueProducerService],
})
export class QueueModule {}
