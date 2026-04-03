import { randomUUID } from 'node:crypto';

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

import { workerJobCatalog } from '@trustshield/core';
import type { JobInsert, JobsRepository } from '@trustshield/db';

import type { AppConfig } from '../../config/app-config.js';
import { JOBS_REPOSITORY } from '../../database/database.module.js';
import { QueueProducerService } from '../../queue/queue-producer.service.js';

export type CreateSignedPutUrlInput = {
  objectKey: string;
  contentType?: string;
  expiresInSeconds?: number;
};

export type CreateSignedGetUrlInput = {
  objectKey: string;
  expiresInSeconds?: number;
};

export type SignedStorageUrl = {
  method: 'PUT' | 'GET';
  bucket: string;
  objectKey: string;
  url: string;
  expiresAt: string;
  headers: Record<string, string>;
};

export type MinioStorageConfirmation = {
  acknowledged: true;
  quarantineStorageKey: string;
};

export type MinioStoragePromotion = {
  acknowledged: true;
  privateStorageKey: string;
};

type MinioClientLike = {
  bucketExists(bucketName: string): Promise<boolean>;
  makeBucket(bucketName: string, region?: string): Promise<void>;
  presignedPutObject(
    bucketName: string,
    objectName: string,
    expires?: number,
    reqParams?: Record<string, string>,
  ): Promise<string>;
  presignedGetObject(
    bucketName: string,
    objectName: string,
    expires?: number,
    respHeaders?: Record<string, string>,
  ): Promise<string>;
};

function normalizeEndpoint(endpoint: string) {
  const parsed = new URL(endpoint);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : parsed.protocol === 'https:' ? 443 : 80,
    pathStyle: true,
  };
}

function sanitizeFilenamePart(input: string) {
  return input.replace(/\s+/g, '-').toLowerCase();
}

@Injectable()
export class NestMinioService implements OnModuleInit {
  private readonly logger = new Logger(NestMinioService.name);
  private readonly appConfig: AppConfig;
  private readonly client: MinioClientLike;

  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
    clientOverride?: MinioClientLike,
  ) {
    const appConfig = configService.get<AppConfig>('app');

    if (!appConfig) {
      throw new Error('Fehlende Konfiguration: app');
    }

    this.appConfig = appConfig;
    const endpoint = normalizeEndpoint(appConfig.minio.endpoint);
    this.client =
      clientOverride ??
      new Client({
        endPoint: endpoint.host,
        port: endpoint.port,
        useSSL: appConfig.minio.useSsl,
        accessKey: appConfig.minio.accessKey,
        secretKey: appConfig.minio.secretKey,
        pathStyle: endpoint.pathStyle,
      });
  }

  async onModuleInit() {
    await this.initializeBucket();
    await this.enqueueStartupTempCleanup();
  }

  async initializeBucket() {
    const bucketName = this.appConfig.minio.bucket;
    const exists = await this.client.bucketExists(bucketName);

    if (exists) {
      return { bucket: bucketName, created: false as const };
    }

    await this.client.makeBucket(bucketName);
    return { bucket: bucketName, created: true as const };
  }

  buildQuarantineStorageKey(params: { ownerSubject: string; assetId: string; filename: string }) {
    return `quarantine/${params.ownerSubject}/${params.assetId}/${sanitizeFilenamePart(params.filename)}`;
  }

  buildPrivateStorageKeyFromQuarantine(quarantineStorageKey: string) {
    const normalized = quarantineStorageKey.replace(/^quarantine\//, '');
    return `private/${normalized}`;
  }

  async createSignedPutUrl(input: CreateSignedPutUrlInput): Promise<SignedStorageUrl> {
    this.assertContentTypeAllowed(input.contentType);

    const expiresIn = this.resolveExpiry(input.expiresInSeconds, this.appConfig.minio.presignedPutExpirySeconds);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const reqParams = input.contentType ? { 'Content-Type': input.contentType } : undefined;
    const url = await this.client.presignedPutObject(this.appConfig.minio.bucket, input.objectKey, expiresIn, reqParams);

    return {
      method: 'PUT',
      bucket: this.appConfig.minio.bucket,
      objectKey: input.objectKey,
      url,
      expiresAt,
      headers: input.contentType
        ? {
            'content-type': input.contentType,
          }
        : {},
    };
  }

  async createSignedGetUrl(input: CreateSignedGetUrlInput): Promise<SignedStorageUrl> {
    const expiresIn = this.resolveExpiry(input.expiresInSeconds, this.appConfig.minio.presignedGetExpirySeconds);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const url = await this.client.presignedGetObject(this.appConfig.minio.bucket, input.objectKey, expiresIn);

    return {
      method: 'GET',
      bucket: this.appConfig.minio.bucket,
      objectKey: input.objectKey,
      url,
      expiresAt,
      headers: {},
    };
  }

  async enqueueStartupTempCleanup() {
    const now = new Date();
    const threshold = new Date(now.getTime() - this.appConfig.minio.tempObjectTtlSeconds * 1000);
    const dedupeWindow = now.toISOString().slice(0, 13);

    const jobInsert: JobInsert = {
      id: `job-${randomUUID()}`,
      ownerUserId: undefined,
      queue: workerJobCatalog['retention.cleanup'].queue,
      name: 'retention.cleanup',
      status: 'queued',
      resourceType: 'storage',
      resourceId: this.appConfig.minio.bucket,
      payload: {
        scope: 'minio.temp-objects',
        bucket: this.appConfig.minio.bucket,
        expiresBefore: threshold.toISOString(),
      },
      requestedBy: 'system:minio-module-init',
      attempts: 0,
      maxAttempts: workerJobCatalog['retention.cleanup'].defaultJobOptions.attempts,
      dedupeKey: `retention:cleanup:minio-temp:${dedupeWindow}`,
      enqueuedAt: now,
      availableAt: now,
      retentionUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const job = await this.jobsRepository.create(jobInsert);
      await this.queueProducerService.enqueueRetentionCleanup(job.id, job.payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Startup cleanup hook konnte nicht enqueued werden: ${message}`);
    }
  }

  confirmQuarantineUpload(quarantineStorageKey: string): MinioStorageConfirmation {
    return {
      acknowledged: true,
      quarantineStorageKey,
    };
  }

  promoteFromQuarantine(quarantineStorageKey: string): MinioStoragePromotion {
    return {
      acknowledged: true,
      privateStorageKey: this.buildPrivateStorageKeyFromQuarantine(quarantineStorageKey),
    };
  }

  private resolveExpiry(requested: number | undefined, configuredDefault: number) {
    const input = typeof requested === 'number' ? requested : configuredDefault;
    return Math.min(Math.max(Math.floor(input), 60), configuredDefault);
  }

  private assertContentTypeAllowed(contentType?: string) {
    if (!contentType) {
      return;
    }

    const allowlist = this.appConfig.minio.allowedContentTypes;
    if (allowlist.length === 0) {
      return;
    }

    if (!allowlist.includes(contentType)) {
      throw new Error(`Content-Type '${contentType}' ist für presigned PUT nicht erlaubt.`);
    }
  }
}
