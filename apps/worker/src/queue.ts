import { Worker } from 'bullmq';
import IORedis from 'ioredis';

import { createBullmqRuntimeConfig, workerJobCatalog } from '@trustshield/core';
import { workerProcessors } from './processors.js';
import { workerPersistence } from './runtime-persistence.js';

class NoopWorker {
  constructor(public readonly name: string) {}

  async close() {
    return undefined;
  }
}

function isQueueRuntimeDisabled() {
  return process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME === 'true';
}

export function createWorkerConnection() {
  if (isQueueRuntimeDisabled()) {
    return null;
  }

  const runtime = createBullmqRuntimeConfig();

  const connection = new IORedis(runtime.connectionUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  // Health check: validate Redis connectivity on connection creation
  connection.on('error', (error) => {
    const message = error instanceof Error ? error.message : 'Unknown Redis error';
    console.error(JSON.stringify({ 
      status: 'error', 
      message: `Redis connection error: ${message}`,
      context: 'worker-queue-connection'
    }));
  });

  return connection;
}

export function createQueueWorkers() {
  const connection = createWorkerConnection();
  const runtime = createBullmqRuntimeConfig();

  return Object.values(workerJobCatalog).map((registration) => {
    if (!connection) {
      return new NoopWorker(registration.name);
    }

    return new Worker(
      registration.queue,
      async (job) => {
        const jobId = typeof job.id === 'string' ? job.id : `${registration.name}-unknown`;

        await workerPersistence.markJobRunning(jobId);

        try {
          const result = await workerProcessors[registration.name](job);
          await workerPersistence.markJobCompleted(jobId);
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown worker error';
          await workerPersistence.markJobFailed(jobId, message);
          throw error;
        }
      },
      {
        connection,
        prefix: runtime.prefix,
        concurrency: registration.concurrency,
      },
    );
  });
}
