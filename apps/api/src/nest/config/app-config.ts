import { registerAs } from '@nestjs/config';

import { envSchema, type EnvSchema } from './env.schema.js';

export type AppConfig = {
  nodeEnv: EnvSchema['NODE_ENV'];
  app: {
    port: number;
  };
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
      idleTimeoutMs: number;
      connectionTimeoutMs: number;
    };
    ssl: {
      mode: 'disable' | 'require';
      rejectUnauthorized: boolean;
    };
  };
  redis: {
    url: string;
  };
  jwt: {
    privateKey?: string;
    publicKey?: string;
    privateKeyPath?: string;
    publicKeyPath?: string;
    accessTtlSeconds: number;
    refreshTtlSeconds: number;
    issuer?: string;
    audience?: string;
  };
  minio: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    useSsl: boolean;
    presignedPutExpirySeconds: number;
    presignedGetExpirySeconds: number;
    tempObjectTtlSeconds: number;
    allowedContentTypes: string[];
  };
  cors: {
    allowlist: string[];
  };
  rateLimit: {
    defaultMaxRequests: number;
    defaultWindowMs: number;
    prefix: string;
  };
  testing: {
    useInMemoryRateLimitRedis: boolean;
  };
  sentry: {
    dsn?: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
  otel: {
    enabled: boolean;
    otlpEndpoint?: string;
  };
  metrics: {
    enabled: boolean;
    path: string;
  };
};

function toAllowlist(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function toCsvList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function toAppConfig(env: EnvSchema): AppConfig {
  const sslMode = env.DATABASE_SSL_MODE ?? (env.NODE_ENV === 'production' ? 'require' : 'disable');
  const rejectUnauthorized =
    env.DATABASE_SSL_REJECT_UNAUTHORIZED ?? (sslMode === 'require' && env.NODE_ENV === 'production');

  return {
    nodeEnv: env.NODE_ENV,
    app: {
      port: env.NEST_PORT ?? env.PORT,
    },
    database: {
      url: env.DATABASE_URL,
      pool: {
        min: env.DATABASE_POOL_MIN,
        max: env.DATABASE_POOL_MAX,
        idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS,
        connectionTimeoutMs: env.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
      },
      ssl: {
        mode: sslMode,
        rejectUnauthorized,
      },
    },
    redis: {
      url: env.REDIS_URL,
    },
    jwt: {
      privateKey: env.JWT_PRIVATE_KEY,
      publicKey: env.JWT_PUBLIC_KEY,
      privateKeyPath: env.JWT_PRIVATE_KEY_PATH,
      publicKeyPath: env.JWT_PUBLIC_KEY_PATH,
      accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
      refreshTtlSeconds: env.JWT_REFRESH_TTL_SECONDS,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
    minio: {
      endpoint: env.S3_ENDPOINT,
      bucket: env.S3_BUCKET,
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY,
      useSsl: env.S3_USE_SSL,
      presignedPutExpirySeconds: env.S3_PRESIGNED_PUT_EXPIRY_SECONDS,
      presignedGetExpirySeconds: env.S3_PRESIGNED_GET_EXPIRY_SECONDS,
      tempObjectTtlSeconds: env.S3_TEMP_OBJECT_TTL_SECONDS,
      allowedContentTypes: toCsvList(env.S3_ALLOWED_CONTENT_TYPES),
    },
    cors: {
      allowlist: toAllowlist(env.CORS_ALLOWLIST),
    },
    rateLimit: {
      defaultMaxRequests: env.RATE_LIMIT_DEFAULT_MAX_REQUESTS,
      defaultWindowMs: env.RATE_LIMIT_DEFAULT_WINDOW_MS,
      prefix: env.RATE_LIMIT_PREFIX,
    },
    testing: {
      useInMemoryRateLimitRedis: env.TRUSTSHIELD_TEST_USE_INMEMORY_RATE_LIMIT_REDIS,
    },
    sentry: {
      dsn: env.SENTRY_DSN,
    },
    logging: {
      level: env.LOG_LEVEL,
    },
    otel: {
      enabled: env.OTEL_ENABLED,
      otlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    },
    metrics: {
      enabled: env.METRICS_ENABLED,
      path: env.METRICS_PATH,
    },
  };
}

export const appConfig = registerAs('app', (): AppConfig => {
  const parsedEnv = envSchema.parse(process.env);
  return toAppConfig(parsedEnv);
});
