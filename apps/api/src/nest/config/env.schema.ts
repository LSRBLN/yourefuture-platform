import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');
const databaseSslModeSchema = z.enum(['disable', 'require']);

const optionalUrlSchema = z.preprocess((value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? undefined : trimmedValue;
}, z.string().url().optional());

const optionalNonEmptyStringSchema = z.preprocess((value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? undefined : trimmedValue;
}, z.string().min(1).optional());

const optionalBooleanFromStringSchema = z.preprocess((value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

export const envSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    PORT: z.coerce.number().int().positive().default(4000),
    NEST_PORT: z.coerce.number().int().positive().optional(),

    DATABASE_URL: z.string().url(),
    DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(0),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(30_000),
    DATABASE_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(10_000),
    DATABASE_SSL_MODE: databaseSslModeSchema.optional(),
    DATABASE_SSL_REJECT_UNAUTHORIZED: optionalBooleanFromStringSchema,
    REDIS_URL: z.string().url(),

    JWT_PRIVATE_KEY: optionalNonEmptyStringSchema,
    JWT_PUBLIC_KEY: optionalNonEmptyStringSchema,
    JWT_PRIVATE_KEY_PATH: optionalNonEmptyStringSchema,
    JWT_PUBLIC_KEY_PATH: optionalNonEmptyStringSchema,
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(2_592_000),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(5_184_000),
    JWT_ISSUER: optionalNonEmptyStringSchema,
    JWT_AUDIENCE: optionalNonEmptyStringSchema,

    S3_ENDPOINT: z.string().url(),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(1),
    S3_USE_SSL: optionalBooleanFromStringSchema.default(false),
    S3_PRESIGNED_PUT_EXPIRY_SECONDS: z.coerce.number().int().min(60).max(3_600).default(900),
    S3_PRESIGNED_GET_EXPIRY_SECONDS: z.coerce.number().int().min(60).max(3_600).default(900),
    S3_TEMP_OBJECT_TTL_SECONDS: z.coerce.number().int().min(300).max(604_800).default(86_400),
    S3_ALLOWED_CONTENT_TYPES: z.string().default(''),

    CORS_ALLOWLIST: z.string().default('http://localhost:3000'),

    RATE_LIMIT_DEFAULT_MAX_REQUESTS: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_DEFAULT_WINDOW_MS: z.coerce.number().int().min(1_000).default(60_000),
    RATE_LIMIT_PREFIX: z.string().min(1).default('trustshield:ratelimit:v1'),
    TRUSTSHIELD_TEST_USE_INMEMORY_RATE_LIMIT_REDIS: optionalBooleanFromStringSchema.default(false),

    SENTRY_DSN: optionalUrlSchema,

    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

    OTEL_ENABLED: optionalBooleanFromStringSchema.default(false),
    OTEL_EXPORTER_OTLP_ENDPOINT: optionalUrlSchema,

    METRICS_ENABLED: optionalBooleanFromStringSchema.default(true),
    METRICS_PATH: z.string().min(1).default('/metrics'),
  })
  .superRefine((env, ctx: z.RefinementCtx) => {
    if (env.DATABASE_POOL_MIN > env.DATABASE_POOL_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_POOL_MIN'],
        message: 'DATABASE_POOL_MIN darf nicht größer als DATABASE_POOL_MAX sein.',
      });
    }

    if (!env.JWT_PRIVATE_KEY && !env.JWT_PRIVATE_KEY_PATH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_PRIVATE_KEY'],
        message: 'JWT_PRIVATE_KEY oder JWT_PRIVATE_KEY_PATH muss gesetzt sein.',
      });
    }

    if (!env.JWT_PUBLIC_KEY && !env.JWT_PUBLIC_KEY_PATH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_PUBLIC_KEY'],
        message: 'JWT_PUBLIC_KEY oder JWT_PUBLIC_KEY_PATH muss gesetzt sein.',
      });
    }
  });

export type EnvSchema = z.infer<typeof envSchema>;
