import { createHmac } from 'node:crypto';

export type SecureStorageRuntimeConfig = {
  endpoint: string;
  quarantineBucket: string;
  privateBucket: string;
  presignSecret: string;
  ttlSeconds: number;
};

export type SecureStorageUploadDescriptor = {
  method: 'PUT';
  uploadUrl: string;
  expiresAt: string;
  headers: Record<string, string>;
  bucket: string;
  objectKey: string;
};

export type SecureStorageConfirmation = {
  acknowledged: true;
  quarantineStorageKey: string;
};

export type SecureStoragePromotion = {
  acknowledged: true;
  privateStorageKey: string;
};

export function createSecureStorageRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): SecureStorageRuntimeConfig {
  return {
    endpoint: (environment.TRUSTSHIELD_STORAGE_ENDPOINT ?? 'http://localhost:9000').replace(/\/+$/, ''),
    quarantineBucket: environment.TRUSTSHIELD_STORAGE_QUARANTINE_BUCKET ?? 'trustshield-quarantine',
    privateBucket: environment.TRUSTSHIELD_STORAGE_PRIVATE_BUCKET ?? 'trustshield-private',
    presignSecret: environment.TRUSTSHIELD_STORAGE_PRESIGN_SECRET ?? 'trustshield-local-dev-secret',
    ttlSeconds: Number.parseInt(environment.TRUSTSHIELD_STORAGE_PRESIGN_TTL_SECONDS ?? '900', 10),
  };
}

function createSignature(secret: string, value: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export class SecureAssetStorageService {
  constructor(private readonly config = createSecureStorageRuntimeConfig()) {}

  createQuarantineUploadDescriptor(input: {
    objectKey: string;
    mimeType?: string;
    sha256?: string;
    fileSizeBytes?: number;
  }): SecureStorageUploadDescriptor {
    const expiresAt = new Date(Date.now() + this.config.ttlSeconds * 1000).toISOString();
    const signaturePayload = [
      'PUT',
      this.config.quarantineBucket,
      input.objectKey,
      expiresAt,
      input.mimeType ?? '',
      input.sha256 ?? '',
      `${input.fileSizeBytes ?? ''}`,
    ].join('\n');
    const signature = createSignature(this.config.presignSecret, signaturePayload);
    const uploadUrl = new URL(`${this.config.endpoint}/${this.config.quarantineBucket}/${input.objectKey}`);

    uploadUrl.searchParams.set('expires', expiresAt);
    uploadUrl.searchParams.set('signature', signature);

    return {
      method: 'PUT',
      uploadUrl: uploadUrl.toString(),
      expiresAt,
      bucket: this.config.quarantineBucket,
      objectKey: input.objectKey,
      headers: {
        'content-type': input.mimeType ?? 'application/octet-stream',
        'x-trustshield-upload-signature': signature,
        ...(input.sha256 ? { 'x-trustshield-sha256': input.sha256 } : {}),
        ...(typeof input.fileSizeBytes === 'number' ? { 'content-length': `${input.fileSizeBytes}` } : {}),
      },
    };
  }

  confirmQuarantineUpload(quarantineStorageKey: string): SecureStorageConfirmation {
    return {
      acknowledged: true,
      quarantineStorageKey,
    };
  }

  promoteFromQuarantine(quarantineStorageKey: string) {
    const normalizedKey = quarantineStorageKey.replace(/^quarantine\//, '');
    const privateStorageKey = `private/${normalizedKey}`;

    return {
      acknowledged: true,
      privateStorageKey,
    } satisfies SecureStoragePromotion;
  }
}
