import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { drizzleSchema } from './schema.js';

export type TrustshieldDatabase = NodePgDatabase<typeof drizzleSchema>;

export type DatabaseRuntimeConfig = {
  connectionString: string;
  minConnections: number;
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  sslMode: 'require' | 'disable';
  sslRejectUnauthorized: boolean;
};

export function createDatabaseRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): DatabaseRuntimeConfig {
  const nodeEnv = environment.NODE_ENV ?? 'development';
  const sslMode = environment.DATABASE_SSL_MODE ?? (nodeEnv === 'production' ? 'require' : 'disable');

  return {
    connectionString: environment.DATABASE_URL ?? 'postgresql://trustshield:trustshield@localhost:5432/trustshield',
    minConnections: Number.parseInt(environment.DATABASE_POOL_MIN ?? '0', 10),
    maxConnections: Number.parseInt(environment.DATABASE_POOL_MAX ?? '10', 10),
    idleTimeoutMs: Number.parseInt(environment.DATABASE_POOL_IDLE_TIMEOUT_MS ?? '30000', 10),
    connectionTimeoutMs: Number.parseInt(environment.DATABASE_POOL_CONNECTION_TIMEOUT_MS ?? '10000', 10),
    sslMode: sslMode === 'require' ? 'require' : 'disable',
    sslRejectUnauthorized:
      environment.DATABASE_SSL_REJECT_UNAUTHORIZED !== undefined
        ? environment.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
        : sslMode === 'require' && nodeEnv === 'production',
  };
}

export function createDatabasePool(config = createDatabaseRuntimeConfig()) {
  return new Pool({
    connectionString: config.connectionString,
    min: config.minConnections,
    max: config.maxConnections,
    idleTimeoutMillis: config.idleTimeoutMs,
    connectionTimeoutMillis: config.connectionTimeoutMs,
    ssl: config.sslMode === 'require' ? { rejectUnauthorized: config.sslRejectUnauthorized } : undefined,
  });
}

export function createDrizzleDatabase(pool: Pool) {
  return drizzle(pool, { schema: drizzleSchema });
}
