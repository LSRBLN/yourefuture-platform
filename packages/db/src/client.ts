import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { drizzleSchema } from './schema.js';

export type TrustshieldDatabase = NodePgDatabase<typeof drizzleSchema>;

export type DatabaseRuntimeConfig = {
  connectionString: string;
  maxConnections: number;
  sslMode: 'require' | 'disable';
};

export function createDatabaseRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): DatabaseRuntimeConfig {
  return {
    connectionString: environment.DATABASE_URL ?? 'postgresql://trustshield:trustshield@localhost:5432/trustshield',
    maxConnections: Number.parseInt(environment.DATABASE_POOL_MAX ?? '10', 10),
    sslMode: environment.DATABASE_SSL === 'require' ? 'require' : 'disable',
  };
}

export function createDatabasePool(config = createDatabaseRuntimeConfig()) {
  return new Pool({
    connectionString: config.connectionString,
    max: config.maxConnections,
    ssl: config.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
  });
}

export function createDrizzleDatabase(pool: Pool) {
  return drizzle(pool, { schema: drizzleSchema });
}
