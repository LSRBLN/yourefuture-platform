import assert from 'node:assert/strict';
import test from 'node:test';

import type { JobInsert, JobsRepository } from '@trustshield/db';

import type { AppConfig } from '../../config/app-config.js';
import { NestMinioService } from './minio.service.js';

class FakeMinioClient {
  public bucketExistsCalls = 0;
  public makeBucketCalls = 0;
  public createdBuckets: string[] = [];

  constructor(private existsInitially: boolean) {}

  async bucketExists() {
    this.bucketExistsCalls += 1;
    return this.existsInitially;
  }

  async makeBucket(bucketName: string) {
    this.makeBucketCalls += 1;
    this.createdBuckets.push(bucketName);
    this.existsInitially = true;
  }

  async presignedPutObject(bucket: string, objectKey: string, expires: number) {
    return `https://storage.local/${bucket}/${objectKey}?method=PUT&expires=${expires}`;
  }

  async presignedGetObject(bucket: string, objectKey: string, expires: number) {
    return `https://storage.local/${bucket}/${objectKey}?method=GET&expires=${expires}`;
  }
}

class InMemoryJobsRepository {
  public createdJobs: JobInsert[] = [];

  async create(input: JobInsert) {
    this.createdJobs.push(input);
    return input as never;
  }
}

class QueueProducerMock {
  public enqueued: Array<{ jobId: string; payload: Record<string, unknown> }> = [];

  async enqueueRetentionCleanup(jobId: string, payload: Record<string, unknown>) {
    this.enqueued.push({ jobId, payload });
  }
}

function createService(options?: { bucketExistsInitially?: boolean; allowedContentTypes?: string[] }) {
  const config: AppConfig = {
    nodeEnv: 'test',
    app: { port: 4000 },
    database: {
      url: 'postgresql://example.invalid/test',
      pool: { min: 0, max: 1, idleTimeoutMs: 1000, connectionTimeoutMs: 1000 },
      ssl: { mode: 'disable', rejectUnauthorized: false },
    },
    redis: { url: 'redis://localhost:6379' },
    jwt: {
      accessTtlSeconds: 3600,
      refreshTtlSeconds: 86400,
    },
    minio: {
      endpoint: 'http://localhost:9000',
      bucket: 'trustshield-local',
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
      useSsl: false,
      presignedPutExpirySeconds: 900,
      presignedGetExpirySeconds: 600,
      tempObjectTtlSeconds: 86_400,
      allowedContentTypes: options?.allowedContentTypes ?? [],
    },
    cors: { allowlist: ['http://localhost:3000'] },
    rateLimit: {
      defaultMaxRequests: 60,
      defaultWindowMs: 60_000,
      prefix: 'trustshield:ratelimit:test',
    },
    sentry: {},
    logging: { level: 'info' },
    otel: { enabled: false },
    metrics: { enabled: false, path: '/metrics' },
  };

  const configService = {
    get: () => config,
  };

  const jobsRepository = new InMemoryJobsRepository();
  const queueProducer = new QueueProducerMock();
  const client = new FakeMinioClient(options?.bucketExistsInitially ?? false);

  const service = new NestMinioService(
    configService as never,
    jobsRepository as unknown as JobsRepository,
    queueProducer as never,
    client,
  );

  return { service, jobsRepository, queueProducer, client };
}

test('NestMinioService initialisiert Bucket idempotent', async () => {
  const first = createService({ bucketExistsInitially: false });
  const firstInit = await first.service.initializeBucket();

  assert.equal(firstInit.created, true);
  assert.equal(first.client.makeBucketCalls, 1);

  const second = createService({ bucketExistsInitially: true });
  const secondInit = await second.service.initializeBucket();

  assert.equal(secondInit.created, false);
  assert.equal(second.client.makeBucketCalls, 0);
});

test('NestMinioService erstellt signierte PUT/GET URLs mit sicheren Expiry-Grenzen', async () => {
  const { service } = createService();

  const putUrl = await service.createSignedPutUrl({
    objectKey: 'quarantine/user-1/asset-1/file.png',
    contentType: 'image/png',
    expiresInSeconds: 9_999,
  });

  assert.equal(putUrl.method, 'PUT');
  assert.match(putUrl.url, /expires=900/u);

  const getUrl = await service.createSignedGetUrl({
    objectKey: 'private/user-1/asset-1/file.png',
    expiresInSeconds: 30,
  });

  assert.equal(getUrl.method, 'GET');
  assert.match(getUrl.url, /expires=60/u);
});

test('NestMinioService erzwingt optionale Content-Type-Allowlist', async () => {
  const { service } = createService({ allowedContentTypes: ['image/jpeg'] });

  await assert.rejects(
    () =>
      service.createSignedPutUrl({
        objectKey: 'quarantine/user-2/asset-2/file.png',
        contentType: 'image/png',
      }),
    /nicht erlaubt/u,
  );
});

test('NestMinioService wired Cleanup-Hook beim Modulstart', async () => {
  const { service, jobsRepository, queueProducer } = createService();

  await service.onModuleInit();

  assert.equal(jobsRepository.createdJobs.length, 1);
  assert.equal(queueProducer.enqueued.length, 1);
  assert.equal(queueProducer.enqueued[0]?.payload.scope, 'minio.temp-objects');
});
