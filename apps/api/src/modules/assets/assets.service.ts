import { randomUUID } from 'node:crypto';

import type { AssetRecord } from '@trustshield/core';
import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext, CompleteAssetUploadRequest, CreateAssetUploadIntentRequest, FinalizeAssetSecurityRequest } from '@trustshield/validation';
import { safeParseCompleteAssetUploadRequest, safeParseCreateAssetUploadIntentRequest, safeParseFinalizeAssetSecurityRequest } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';
import { SecureAssetStorageService } from './secure-storage.js';

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

export type CreateAssetUploadIntentDto = CreateAssetUploadIntentRequest;
export type CompleteAssetUploadDto = CompleteAssetUploadRequest;
export type FinalizeAssetSecurityDto = FinalizeAssetSecurityRequest;

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

export class AssetsService {
  private readonly storage = new SecureAssetStorageService();

  constructor(private readonly store: TrustshieldStore) {}

  async create(dto: CreateAssetUploadIntentDto, context: ApiRequestContext) {
    const validation = safeParseCreateAssetUploadIntentRequest(dto);

    if (!validation.success) {
      const mimeIssue = validation.issues.find((issue) => issue.path === 'mimeType');
      const sizeIssue = validation.issues.find((issue) => issue.path === 'fileSizeBytes');
      throw new HttpError(sizeIssue ? 413 : mimeIssue ? 415 : 400, 'Asset upload intent validation failed', validation.issues);
    }

    if (!context.actor.subject) {
      throw new HttpError(401, 'Authentication required');
    }

    const timestamp = new Date().toISOString();
    const assetId = `asset-${randomUUID()}`;
    const quarantineObjectKey = `${context.actor.subject}/${assetId}/${validation.data.originalFilename.replace(/\s+/g, '-').toLowerCase()}`;
    const uploadDescriptor = this.storage.createQuarantineUploadDescriptor({
      objectKey: quarantineObjectKey,
      mimeType: validation.data.mimeType,
      sha256: validation.data.sha256,
      fileSizeBytes: validation.data.fileSizeBytes,
    });
    const record: AssetRecord = {
      id: assetId,
      assetType: validation.data.assetType,
      status: 'pending_upload',
      summary: 'Upload intent created. Asset remains quarantined until verified and scanned.',
      originalFilename: validation.data.originalFilename,
      mimeType: validation.data.mimeType,
      fileSizeBytes: validation.data.fileSizeBytes,
      sha256: validation.data.sha256,
      dimensions: {},
      storageKey: `quarantine/${quarantineObjectKey}`,
      ownerUserId: context.actor.subject,
      flags: {
        nsfw: false,
        sensitive: true,
        malwareScanned: false,
        malwareDetected: false,
      },
      primaryCheckId: validation.data.primaryCheckId,
      representationIds: [],
      sourceIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.createAsset(record);

    return {
      status: 'accepted',
      data: record,
      upload: {
        mode: 'quarantine_intent',
        method: uploadDescriptor.method,
        uploadUrl: uploadDescriptor.uploadUrl,
        expiresAt: uploadDescriptor.expiresAt,
        headers: uploadDescriptor.headers,
        bucket: uploadDescriptor.bucket,
        quarantineStorageKey: record.storageKey,
        acceptedMimeTypes: acceptedMimeTypesByAssetType[validation.data.assetType],
        maxSizeBytes: maxSizeBytesByAssetType[validation.data.assetType],
      },
    };
  }

  async getById(id: string, context: ApiRequestContext) {
    const asset = this.store.getAssetById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!asset) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    return {
      status: 'ok',
      data: asset,
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

  async completeUpload(id: string, dto: CompleteAssetUploadDto, context: ApiRequestContext) {
    const validation = safeParseCompleteAssetUploadRequest(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Asset upload completion validation failed', validation.issues);
    }

    const existing = this.store.getAssetById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!existing) {
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

    this.storage.confirmQuarantineUpload(existing.storageKey ?? '');
    const updated = this.store.updateAsset(id, {
      status: 'uploaded',
      summary: 'Upload completed in quarantine. Asset is awaiting secure scan.',
      fileSizeBytes: validation.data.uploadedSizeBytes ?? existing.fileSizeBytes,
      sha256: validation.data.sha256 ?? existing.sha256,
      mimeType: validation.data.mimeType ?? existing.mimeType,
      updatedAt: new Date().toISOString(),
    });

    const job = this.store.createJob({
      id: `job-${randomUUID()}`,
      queue: 'assets',
      name: 'asset.scan',
      status: 'queued',
      resourceType: 'asset',
      resourceId: id,
      payload: {
        assetId: id,
        assetType: existing.assetType,
        mimeType: validation.data.mimeType ?? existing.mimeType,
        quarantineStorageKey: existing.storageKey,
        requestedBy: context.actor.subject,
      },
      requestedBy: context.actor.subject,
      attempts: 0,
      maxAttempts: 5,
      dedupeKey: `asset:scan:${id}`,
      enqueuedAt: new Date().toISOString(),
      availableAt: new Date().toISOString(),
    });

    return {
      status: 'accepted',
      data: updated,
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
      },
    };
  }

  async startScan(id: string, context: ApiRequestContext) {
    requirePrivilegedAssetOperator(context);

    const existing = this.store.getAssetById(id, {
      actorSubject: context.actor.subject,
      canReadAll: true,
    });

    if (!existing) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (existing.status !== 'uploaded') {
      throw new HttpError(409, `Asset ${id} is not ready to enter scanning`);
    }

    const updated = this.store.updateAsset(id, {
      status: 'scanning',
      summary: 'Secure scan in progress.',
      updatedAt: new Date().toISOString(),
    });

    return {
      status: 'accepted',
      data: updated,
    };
  }

  async finalizeSecurity(id: string, dto: FinalizeAssetSecurityDto, context: ApiRequestContext) {
    requirePrivilegedAssetOperator(context);

    const validation = safeParseFinalizeAssetSecurityRequest(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Asset security finalization validation failed', validation.issues);
    }

    const existing = this.store.getAssetById(id, {
      actorSubject: context.actor.subject,
      canReadAll: true,
    });

    if (!existing) {
      throw new HttpError(404, `Asset ${id} not found`);
    }

    if (existing.status !== 'scanning' && existing.status !== 'uploaded') {
      throw new HttpError(409, `Asset ${id} is not in secure scanning flow`);
    }

    if (!validation.data.mimeTypeVerified) {
      const failed = this.store.updateAsset(id, {
        status: 'failed',
        summary: 'Asset blocked because the verified MIME-Type does not match policy.',
        flags: {
          ...existing.flags,
          malwareScanned: true,
          malwareDetected: false,
        },
        updatedAt: new Date().toISOString(),
      });

      return { status: 'ok', data: failed };
    }

    if (validation.data.malwareDetected) {
      const flagged = this.store.updateAsset(id, {
        status: 'flagged',
        summary: 'Asset flagged during secure scan and requires security review.',
        flags: {
          ...existing.flags,
          malwareScanned: true,
          malwareDetected: true,
        },
        updatedAt: new Date().toISOString(),
      });

      return { status: 'ok', data: flagged };
    }

    const promotion = this.storage.promoteFromQuarantine(existing.storageKey ?? '');
    const ready = this.store.updateAsset(id, {
      status: 'ready',
      summary: 'Asset cleared secure scan and was promoted to private storage.',
      storageKey: promotion.privateStorageKey,
      flags: {
        ...existing.flags,
        malwareScanned: true,
        malwareDetected: false,
      },
      updatedAt: new Date().toISOString(),
    });
    const job = this.store.createJob({
      id: `job-${randomUUID()}`,
      queue: 'assets',
      name: 'asset.promote',
      status: 'queued',
      resourceType: 'asset',
      resourceId: id,
      payload: {
        assetId: id,
        quarantineStorageKey: existing.storageKey,
        requestedBy: context.actor.subject,
      },
      requestedBy: context.actor.subject,
      attempts: 0,
      maxAttempts: 5,
      dedupeKey: `asset:promote:${id}`,
      enqueuedAt: new Date().toISOString(),
      availableAt: new Date().toISOString(),
    });

    return {
      status: 'ok',
      data: ready,
      queue: {
        jobId: job.id,
        queue: job.queue,
        name: job.name,
      },
    };
  }
}
