import { createHmac, createHash } from 'node:crypto';

/**
 * Secure storage configuration supporting both local MinIO and AWS S3.
 * 
 * For S3:
 * - TRUSTSHIELD_STORAGE_ENDPOINT: https://s3.amazonaws.com (or region endpoint)
 * - TRUSTSHIELD_STORAGE_USE_S3_SIGV4: "true" 
 * - TRUSTSHIELD_STORAGE_AWS_REGION: region for SigV4
 * - TRUSTSHIELD_STORAGE_AWS_KEY_ID: AWS access key
 * - TRUSTSHIELD_STORAGE_AWS_SECRET_KEY: AWS secret key
 * 
 * For MinIO (default dev):
 * - TRUSTSHIELD_STORAGE_ENDPOINT: http://localhost:9000
 * - TRUSTSHIELD_STORAGE_PRESIGN_SECRET: HMAC secret
 */
export type SecureStorageRuntimeConfig = {
  endpoint: string;
  quarantineBucket: string;
  privateBucket: string;
  presignSecret: string;
  ttlSeconds: number;
  useS3Sigv4?: boolean;
  awsRegion?: string;
  awsKeyId?: string;
  awsSecretKey?: string;
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
    useS3Sigv4: environment.TRUSTSHIELD_STORAGE_USE_S3_SIGV4 === 'true',
    awsRegion: environment.TRUSTSHIELD_STORAGE_AWS_REGION,
    awsKeyId: environment.TRUSTSHIELD_STORAGE_AWS_KEY_ID,
    awsSecretKey: environment.TRUSTSHIELD_STORAGE_AWS_SECRET_KEY,
  };
}

function createSignature(secret: string, value: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

/**
 * AWS SigV4 signing for S3 presigned URLs
 * Implements AWS Signature Version 4
 */
function createS3SigV4Signature(input: {
  method: string;
  bucket: string;
  objectKey: string;
  region: string;
  keyId: string;
  secretKey: string;
  expiresInSeconds: number;
  contentType?: string;
}): {
  signature: string;
  amzDate: string;
  datestamp: string;
  credentialScope: string;
} {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const datestamp = amzDate.slice(0, 8);
  const expiresInStr = input.expiresInSeconds.toString();

  const credentialScope = `${datestamp}/${input.region}/s3/aws4_request`;
  const algorithm = 'AWS4-HMAC-SHA256';

  const canonicalHeaders = [
    `host:${input.bucket}.s3.${input.region}.amazonaws.com`,
    '',
  ].join('\n');

  const signedHeaders = 'host';

  const canonicalQueryString = [
    `X-Amz-Algorithm=${algorithm}`,
    `X-Amz-Credential=${encodeURIComponent(`${input.keyId}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresInStr}`,
    `X-Amz-SignedHeaders=${signedHeaders}`,
  ]
    .sort()
    .join('&');

  const payloadHash = createHash('sha256').update('').digest('hex');

  const canonicalRequest = [
    input.method,
    `/${input.objectKey}`,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const kSecret = `AWS4${input.secretKey}`;
  const kDate = createHmac('sha256', kSecret).update(datestamp).digest();
  const kRegion = createHmac('sha256', kDate).update(input.region).digest();
  const kService = createHmac('sha256', kRegion).update('s3').digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return {
    signature,
    amzDate,
    datestamp,
    credentialScope,
  };
}

export class SecureAssetStorageService {
  constructor(private readonly config = createSecureStorageRuntimeConfig()) {}

  createQuarantineUploadDescriptor(input: {
    objectKey: string;
    mimeType?: string;
    sha256?: string;
    fileSizeBytes?: number;
  }): SecureStorageUploadDescriptor {
    if (this.config.useS3Sigv4 && this.config.awsRegion && this.config.awsKeyId && this.config.awsSecretKey) {
      return this.createS3SigV4UploadDescriptor('quarantine', input);
    }

    return this.createMinioUploadDescriptor('quarantine', input);
  }

  private createMinioUploadDescriptor(
    scope: 'quarantine' | 'private',
    input: { objectKey: string; mimeType?: string; sha256?: string; fileSizeBytes?: number },
  ): SecureStorageUploadDescriptor {
    const expiresAt = new Date(Date.now() + this.config.ttlSeconds * 1000).toISOString();
    const bucket = scope === 'quarantine' ? this.config.quarantineBucket : this.config.privateBucket;
    const signaturePayload = [
      'PUT',
      bucket,
      input.objectKey,
      expiresAt,
      input.mimeType ?? '',
      input.sha256 ?? '',
      `${input.fileSizeBytes ?? ''}`,
    ].join('\n');
    const signature = createSignature(this.config.presignSecret, signaturePayload);
    const uploadUrl = new URL(`${this.config.endpoint}/${bucket}/${input.objectKey}`);

    uploadUrl.searchParams.set('expires', expiresAt);
    uploadUrl.searchParams.set('signature', signature);

    return {
      method: 'PUT',
      uploadUrl: uploadUrl.toString(),
      expiresAt,
      bucket,
      objectKey: input.objectKey,
      headers: {
        'content-type': input.mimeType ?? 'application/octet-stream',
        'x-trustshield-upload-signature': signature,
        ...(input.sha256 ? { 'x-trustshield-sha256': input.sha256 } : {}),
        ...(typeof input.fileSizeBytes === 'number' ? { 'content-length': `${input.fileSizeBytes}` } : {}),
      },
    };
  }

  private createS3SigV4UploadDescriptor(
    scope: 'quarantine' | 'private',
    input: { objectKey: string; mimeType?: string; sha256?: string; fileSizeBytes?: number },
  ): SecureStorageUploadDescriptor {
    if (!this.config.awsRegion || !this.config.awsKeyId || !this.config.awsSecretKey) {
      throw new Error('AWS configuration incomplete for S3 SigV4');
    }

    const bucket = scope === 'quarantine' ? this.config.quarantineBucket : this.config.privateBucket;
    const sig4 = createS3SigV4Signature({
      method: 'PUT',
      bucket,
      objectKey: input.objectKey,
      region: this.config.awsRegion,
      keyId: this.config.awsKeyId,
      secretKey: this.config.awsSecretKey,
      expiresInSeconds: this.config.ttlSeconds,
      contentType: input.mimeType,
    });

    const uploadUrl = new URL(`https://${bucket}.s3.${this.config.awsRegion}.amazonaws.com/${input.objectKey}`);
    uploadUrl.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
    uploadUrl.searchParams.set('X-Amz-Credential', `${this.config.awsKeyId}/${sig4.credentialScope}`);
    uploadUrl.searchParams.set('X-Amz-Date', sig4.amzDate);
    uploadUrl.searchParams.set('X-Amz-Expires', this.config.ttlSeconds.toString());
    uploadUrl.searchParams.set('X-Amz-SignedHeaders', 'host');
    uploadUrl.searchParams.set('X-Amz-Signature', sig4.signature);

    const expiresAt = new Date(Date.now() + this.config.ttlSeconds * 1000).toISOString();

    return {
      method: 'PUT',
      uploadUrl: uploadUrl.toString(),
      expiresAt,
      bucket,
      objectKey: input.objectKey,
      headers: {
        'content-type': input.mimeType ?? 'application/octet-stream',
        ...(input.sha256 ? { 'x-amz-checksum-sha256': input.sha256 } : {}),
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
