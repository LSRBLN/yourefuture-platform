import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { AssetRecord } from '@trustshield/core';
import { workerJobCatalog } from '@trustshield/core';
import type { AssetInsert, AssetRow, AssetsRepository, JobInsert, JobsRepository } from '@trustshield/db';
import type { ApiRequestContext, CreateAssetUploadIntentRequest } from '@trustshield/validation';
import { safeParseCompleteAssetUploadRequest, safeParseCreateAssetUploadIntentRequest, safeParseFinalizeAssetSecurityRequest } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { ASSETS_REPOSITORY, JOBS_REPOSITORY } from '../database/database.module.js';
import { QueueProducerService } from '../queue/queue-producer.service.js';
import { canReadAll, requireActorSubject } from '../shared/ownership.js';
import { NestMinioService } from '../storage/minio/minio.service.js';

const acceptedMimeTypesByAssetType: Record<CreateAssetUploadIntentRequest['assetType'], string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/quicktime'],
  document: ['application/pdf'],
  other: [],
};

const maxSizeBytesByAssetType: Record<CreateAssetUploadIntentRequest['assetType'], number> = {
  image: 25 * 1024 * 1024,
  video: 250 * 1024 * 1024,
  document: 15 * 1024 * 1024,
  other: 15 * 1024 * 1024,
};

function requirePrivilegedAssetOperator(context: ApiRequestContext) {
  if (context.actor.role !== 'admin' && context.actor.role !== 'service') {
    throw new HttpError(403, 'Insufficient permissions');
  }
}

function getAssetScanStage(asset: AssetRecord) {
  switch (asset.status) {
    case 'pending_upload':
      return 'awaiting_secure_upload';
    case 'uploaded':
      return 'uploaded_pending_scan';
    case 'scanning':
      return 'scanning';
    case 'ready':
      return 'ready_for_analysis';
    case 'flagged':
      return 'blocked_security_review';
    case 'failed':
      return 'upload_failed';
    default:
      return 'awaiting_secure_upload';
  }
}

function mapAsset(row: AssetRow): AssetRecord {
  const flags = row.flags as AssetRecord['flags'] | undefined;
  const dimensions = row.dimensions as AssetRecord['dimensions'] | undefined;

  return {
    id: row.id,
    assetType: row.assetType,
    status: row.status,
    summary: row.summary ?? undefined,
    originalFilename: row.originalFilename ?? undefined,
    mimeType: row.mimeType ?? undefined,
    fileSizeBytes: row.fileSizeBytes ?? undefined,
    sha256: row.sha256 ?? undefined,
    dimensions: dimensions ?? {},
    storageKey: row.quarantineStorageKey ?? row.storageKey ?? undefined,
    ownerUserId: row.ownerUserId ?? undefined,
    flags: flags ?? {
      nsfw: false,
      sensitive: true,
      malwareScanned: false,
      malwareDetected: false,
    },
    primaryCheckId: row.primaryCheckId ?? undefined,
    representationIds: row.representationIds,
    sourceIds: row.sourceIds,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class NestAssetsService {
  constructor(
    @Inject(ASSETS_REPOSITORY) private readonly assetsRepository: AssetsRepository,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(QueueProducerService) private readonly queueProducerService: QueueProducerService,
    @Inject(NestMinioService) private readonly storage: NestMinioService,
  ) {}

  async createUploadIntent(body: unknown, context: ApiRequestContext) {
    const validation = safeParseCreateAssetUploadIntentRequest(body);

    if (!validation.success) {
      const mimeIssue = validation.issues.find((issue) => issue.path === 'mimeType');
      const sizeIssue = validation.issues.find((issue) => issue.path === 'fileSizeBytes');
      throw new HttpError(sizeIssue ? 413 : mimeIssue ? 415 : 400, 'Asset upload intent validation failed', validation.issues);
    }

    const actorSubject = requireActorSubject(context);
    const now = new Date();
    const assetId = `asset-${randomUUID()}`;
    const quarantineStorageKey = this.storage.buildQuarantineStorageKey({
      ownerSubject: actorSubject,
      assetId,
      filename: validation.data.originalFilename,
    });
    const uploadDescriptor = await this.storage.createSignedPutUrl({
      objectKey: quarantineStorageKey,
      contentType: validation.data.mimeType,
    });

    const inserted = await this.assetsRepository.create({
      id: assetId,
      ownerUserId: actorSubject,
      primaryCheckId: validation.data.primaryCheckId,
      assetType: validation.data.assetType,
      status: 'pending_upload',
      summary: 'Upload intent created. Asset remains quarantined until verified and scanned.',
      originalFilename: validation.data.originalFilename,
      mimeType: validation.data.mimeType,
      fileSizeBytes: validation.data.fileSizeBytes,
      sha256: validation.data.sha256,
      dimensions: {},
      storageKey: undefined,
      quarantineStorageKey,
      flags: {
        nsfw: false,
        sensitive: true,
        malwareScanned: false,
        malwareDetected: false,
      },
      representationIds: [],
      sourceIds: [],
      uploadCompletedAt: undefined,
      scannedAt: undefined,
      retentionUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    } satisfies AssetInsert);
    return {
      status: 'accepted',
      data: mapAsset(inserted),
      upload: {
        mode: 'quarantine_intent',
        method: uploadDescriptor.method,
        uploadUrl: uploadDescriptor.url,
        expiresAt: uploadDescriptor.expiresAt,
        headers: uploadDescriptor.headers,
        bucket: uploadDescriptor.bucket,
        quarantineStorageKey,
        acceptedMimeTypes: acceptedMimeTypesByAssetType[validation.data.assetType],
        maxSizeBytes: maxSizeBytesByAssetType[validation.data.assetType],
        notes: [
          'Storage promotion is disabled until MIME, hash and malware checks pass.',
          'This endpoint creates an upload intent and metadata record, not a completed binary upload.',
        ],
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const row = canReadAll(context)
      ? await this.assetsRepository.findById(id)
      : await this.assetsRepository.findById(id);

    if (!row) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (!canReadAll(context) && row.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    return {
      status: 'ok',
      data: mapAsset(row),
    };
  }

  async getDeepfakeResults(id: string, context: ApiRequestContext) {
    const asset = await this.getById(id, context);

    return {
      status: 'ok',
      data: {
        assetId: id,
        assetStatus: asset.data.status,
        scanStage: getAssetScanStage(asset.data),
        results: [],
      },
    };
  }

  async completeUpload(id: string, body: unknown, context: ApiRequestContext) {
    const validation = safeParseCompleteAssetUploadRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Asset upload completion validation failed', validation.issues);
    }

    const existing = await this.assetsRepository.findById(id);

    if (!existing) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (!canReadAll(context) && existing.ownerUserId !== requireActorSubject(context)) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (existing.status !== 'pending_upload') {
      throw new HttpError(409, `Asset ${id} is not awaiting upload completion`);
    }

    if (validation.data.mimeType && existing.mimeType && validation.data.mimeType !== existing.mimeType) {
      throw new HttpError(415, 'Uploaded MIME-Type does not match declared asset MIME-Type');
    }

    if (validation.data.sha256 && existing.sha256 && validation.data.sha256 !== existing.sha256) {
      throw new HttpError(409, 'Uploaded asset hash does not match declared sha256');
    }

    this.storage.confirmQuarantineUpload(existing.quarantineStorageKey ?? '');
    const now = new Date();
    const updated = await this.assetsRepository.updateById(id, {
      status: 'uploaded',
      summary: 'Upload completed in quarantine. Asset is awaiting secure scan.',
      fileSizeBytes: validation.data.uploadedSizeBytes ?? existing.fileSizeBytes,
      sha256: validation.data.sha256 ?? existing.sha256,
      mimeType: validation.data.mimeType ?? existing.mimeType,
      uploadCompletedAt: now,
      updatedAt: now,
    });

    if (!updated) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    const jobInsert: JobInsert = {
      id: `job-${randomUUID()}`,
      ownerUserId: existing.ownerUserId,
      queue: 'assets',
      name: 'asset.scan',
      status: 'queued',
      resourceType: 'asset',
      resourceId: id,
      payload: {
        assetId: id,
        assetType: existing.assetType,
        mimeType: validation.data.mimeType ?? existing.mimeType,
        quarantineStorageKey: existing.quarantineStorageKey,
        requestedBy: context.actor.subject,
      },
      requestedBy: context.actor.subject,
      attempts: 0,
      maxAttempts: workerJobCatalog['asset.scan'].defaultJobOptions.attempts,
      dedupeKey: `asset:scan:${id}`,
      enqueuedAt: now,
      availableAt: now,
      retentionUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    };
    const job = await this.jobsRepository.create(jobInsert);
    await this.queueProducerService.enqueueAssetScan(job.id, job.payload);

    return {
      status: 'accepted',
      data: mapAsset(updated),
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
      },
    };
  }

  async startScan(id: string, context: ApiRequestContext) {
    requirePrivilegedAssetOperator(context);

    const existing = await this.assetsRepository.findById(id);

    if (!existing) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (existing.status !== 'uploaded') {
      throw new HttpError(409, `Asset ${id} is not ready to enter scanning`);
    }

    const updated = await this.assetsRepository.updateById(id, {
      status: 'scanning',
      summary: 'Secure scan in progress.',
      updatedAt: new Date(),
    });

    return {
      status: 'accepted',
      data: mapAsset(updated ?? existing),
    };
  }

  async finalizeSecurity(id: string, body: unknown, context: ApiRequestContext) {
    requirePrivilegedAssetOperator(context);
    const validation = safeParseFinalizeAssetSecurityRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Asset security finalization validation failed', validation.issues);
    }

    const existing = await this.assetsRepository.findById(id);

    if (!existing) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (existing.status !== 'scanning' && existing.status !== 'uploaded') {
      throw new HttpError(409, `Asset ${id} is not in secure scanning flow`);
    }

    const now = new Date();
    if (!validation.data.mimeTypeVerified) {
      const failed = await this.assetsRepository.updateById(id, {
        status: 'failed',
        summary: 'Asset blocked because the verified MIME-Type does not match policy.',
        flags: {
          ...(existing.flags as Record<string, unknown>),
          malwareScanned: true,
          malwareDetected: false,
        },
        scannedAt: now,
        updatedAt: now,
      });

      return { status: 'ok', data: mapAsset(failed ?? existing) };
    }

    if (validation.data.malwareDetected) {
      const flagged = await this.assetsRepository.updateById(id, {
        status: 'flagged',
        summary: 'Asset flagged during secure scan and requires security review.',
        flags: {
          ...(existing.flags as Record<string, unknown>),
          malwareScanned: true,
          malwareDetected: true,
        },
        scannedAt: now,
        updatedAt: now,
      });

      return { status: 'ok', data: mapAsset(flagged ?? existing) };
    }

    const promotion = this.storage.promoteFromQuarantine(existing.quarantineStorageKey ?? '');
    const ready = await this.assetsRepository.updateById(id, {
      status: 'ready',
      summary: 'Asset cleared secure scan and was promoted to private storage.',
      storageKey: promotion.privateStorageKey,
      flags: {
        ...(existing.flags as Record<string, unknown>),
        malwareScanned: true,
        malwareDetected: false,
      },
      scannedAt: now,
      updatedAt: now,
    });
    const jobInsert: JobInsert = {
      id: `job-${randomUUID()}`,
      ownerUserId: existing.ownerUserId,
      queue: 'assets',
      name: 'asset.promote',
      status: 'queued',
      resourceType: 'asset',
      resourceId: id,
      payload: {
        assetId: id,
        quarantineStorageKey: existing.quarantineStorageKey,
        requestedBy: context.actor.subject,
      },
      requestedBy: context.actor.subject,
      attempts: 0,
      maxAttempts: workerJobCatalog['asset.promote'].defaultJobOptions.attempts,
      dedupeKey: `asset:promote:${id}`,
      enqueuedAt: now,
      availableAt: now,
      retentionUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    };
    const job = await this.jobsRepository.create(jobInsert);
    await this.queueProducerService.enqueueAssetPromote(job.id, job.payload);

    return {
      status: 'ok',
      data: mapAsset(ready ?? existing),
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
      },
    };
  }
}
