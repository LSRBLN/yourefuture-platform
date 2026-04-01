export type WorkerQueueName = 'assets' | 'checks' | 'reviews' | 'support' | 'removals' | 'retention';

export type WorkerJobName =
  | 'asset.scan'
  | 'asset.promote'
  | 'check.execute'
  | 'review.materialize'
  | 'support.triage'
  | 'removal.submit'
  | 'removal.sync_status'
  | 'retention.cleanup';

export type WorkerJobRegistration = {
  queue: WorkerQueueName;
  name: WorkerJobName;
  concurrency: number;
  description: string;
  defaultJobOptions: {
    attempts: number;
    removeOnComplete: number;
    removeOnFail: number;
    backoff: {
      type: 'fixed' | 'exponential';
      delayMs: number;
    };
  };
};

export const workerJobCatalog: Record<WorkerJobName, WorkerJobRegistration> = {
  'asset.scan': {
    queue: 'assets',
    name: 'asset.scan',
    concurrency: 4,
    description: 'Validiert MIME, Hash und Malware-Status für quarantänisierte Assets.',
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'fixed', delayMs: 15000 },
    },
  },
  'asset.promote': {
    queue: 'assets',
    name: 'asset.promote',
    concurrency: 2,
    description: 'Promotet bereits verifizierte Assets aus der Quarantäne in den privaten Storage.',
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'exponential', delayMs: 30000 },
    },
  },
  'check.execute': {
    queue: 'checks',
    name: 'check.execute',
    concurrency: 4,
    description: 'Fuehrt primaere Check-Analysen fuer neue oder erneut geplante Checks aus.',
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'exponential', delayMs: 30000 },
    },
  },
  'review.materialize': {
    queue: 'reviews',
    name: 'review.materialize',
    concurrency: 8,
    description: 'Materialisiert Review-Items fuer menschliche Triage und Priorisierung.',
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'exponential', delayMs: 30000 },
    },
  },
  'support.triage': {
    queue: 'support',
    name: 'support.triage',
    concurrency: 6,
    description: 'Leitet Support-Faelle in Triage-, Assignment- und SLA-Pfade ueber.',
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'fixed', delayMs: 15000 },
    },
  },
  'removal.submit': {
    queue: 'removals',
    name: 'removal.submit',
    concurrency: 3,
    description: 'Erzeugt Provider-Submissions fuer Removal-Cases.',
    defaultJobOptions: {
      attempts: 10,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'exponential', delayMs: 60000 },
    },
  },
  'removal.sync_status': {
    queue: 'removals',
    name: 'removal.sync_status',
    concurrency: 3,
    description: 'Synchronisiert Provider-Status und Follow-up-Zustaende fuer Removal-Cases.',
    defaultJobOptions: {
      attempts: 10,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'exponential', delayMs: 60000 },
    },
  },
  'retention.cleanup': {
    queue: 'retention',
    name: 'retention.cleanup',
    concurrency: 1,
    description: 'Prueft abgelaufene Retention-Fenster und markiert Cleanup-Kandidaten fuer Loeschung oder Review.',
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      backoff: { type: 'fixed', delayMs: 300000 },
    },
  },
};

export function createBullmqRuntimeConfig(environment: NodeJS.ProcessEnv = process.env) {
  return {
    connectionUrl: environment.REDIS_URL ?? 'redis://localhost:6379',
    prefix: environment.BULLMQ_PREFIX ?? 'trustshield',
    stalledIntervalMs: 30000,
    lockDurationMs: 300000,
  };
}

export function getWorkerQueueTopology() {
  return Object.values(workerJobCatalog).map((job) => ({
    queue: job.queue,
    name: job.name,
    concurrency: job.concurrency,
    attempts: job.defaultJobOptions.attempts,
    backoff: job.defaultJobOptions.backoff,
  }));
}
