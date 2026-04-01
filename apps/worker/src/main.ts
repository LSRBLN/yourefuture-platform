import { createAppManifest, workerEnvironment } from '@trustshield/core';

import { createBootstrapJobs, createBullmqRuntimeConfig, getWorkerQueueTopology, validateBootstrapJobs } from './jobs.js';
import { createQueueWorkers } from './queue.js';

function bootstrap() {
  const manifest = createAppManifest('worker');
  const bootstrapJobs = createBootstrapJobs();
  const workers = createQueueWorkers();

  console.log(
    JSON.stringify(
      {
        status: 'worker-bootstrap-ready',
        app: manifest,
        env: workerEnvironment,
        queueRuntime: createBullmqRuntimeConfig(),
        queueTopology: getWorkerQueueTopology(),
        workerRegistrations: workers.map((worker) => worker.name),
        bootstrapJobs: validateBootstrapJobs(bootstrapJobs),
        jobs: bootstrapJobs,
      },
      null,
      2,
    ),
  );
}

bootstrap();
