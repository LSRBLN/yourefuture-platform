import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AssetsRepository,
  ChecksRepository,
  createDatabasePool,
  createDrizzleDatabase,
  EvidenceSnapshotsRepository,
  JobsRepository,
  OsintExportsRepository,
  OsintHistoryRepository,
  OsintResultsRepository,
  OsintSavedItemsRepository,
  OsintSearchesRepository,
  RemovalActionsRepository,
  RemovalCasesRepository,
  ReviewItemsRepository,
  SourcesRepository,
  SupportRequestsRepository,
  UserImagesRepository,
  UserSessionsRepository,
  UsersRepository,
} from '@trustshield/db';

import type { AppConfig } from '../config/app-config.js';

export const DATABASE_POOL = Symbol('DATABASE_POOL');
export const DRIZZLE_DB = Symbol('DRIZZLE_DB');
export const ASSETS_REPOSITORY = Symbol('ASSETS_REPOSITORY');
export const CHECKS_REPOSITORY = Symbol('CHECKS_REPOSITORY');
export const EVIDENCE_SNAPSHOTS_REPOSITORY = Symbol('EVIDENCE_SNAPSHOTS_REPOSITORY');
export const REMOVAL_ACTIONS_REPOSITORY = Symbol('REMOVAL_ACTIONS_REPOSITORY');
export const REMOVAL_CASES_REPOSITORY = Symbol('REMOVAL_CASES_REPOSITORY');
export const SOURCES_REPOSITORY = Symbol('SOURCES_REPOSITORY');
export const REVIEW_ITEMS_REPOSITORY = Symbol('REVIEW_ITEMS_REPOSITORY');
export const SUPPORT_REQUESTS_REPOSITORY = Symbol('SUPPORT_REQUESTS_REPOSITORY');
export const JOBS_REPOSITORY = Symbol('JOBS_REPOSITORY');
export const OSINT_SEARCHES_REPOSITORY = Symbol('OSINT_SEARCHES_REPOSITORY');
export const OSINT_RESULTS_REPOSITORY = Symbol('OSINT_RESULTS_REPOSITORY');
export const OSINT_EXPORTS_REPOSITORY = Symbol('OSINT_EXPORTS_REPOSITORY');
export const OSINT_HISTORY_REPOSITORY = Symbol('OSINT_HISTORY_REPOSITORY');
export const OSINT_SAVED_ITEMS_REPOSITORY = Symbol('OSINT_SAVED_ITEMS_REPOSITORY');
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
export const USER_IMAGES_REPOSITORY = Symbol('USER_IMAGES_REPOSITORY');
export const USER_SESSIONS_REPOSITORY = Symbol('USER_SESSIONS_REPOSITORY');

@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.get<AppConfig>('app');

        if (!appConfig) {
          throw new Error('Fehlende Konfiguration: app');
        }

        return createDatabasePool({
          connectionString: appConfig.database.url,
          minConnections: appConfig.database.pool.min,
          maxConnections: appConfig.database.pool.max,
          idleTimeoutMs: appConfig.database.pool.idleTimeoutMs,
          connectionTimeoutMs: appConfig.database.pool.connectionTimeoutMs,
          sslMode: appConfig.database.ssl.mode,
          sslRejectUnauthorized: appConfig.database.ssl.rejectUnauthorized,
        });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [DATABASE_POOL],
      useFactory: (pool: ReturnType<typeof createDatabasePool>) => createDrizzleDatabase(pool),
    },
    {
      provide: ASSETS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new AssetsRepository(db),
    },
    {
      provide: CHECKS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new ChecksRepository(db),
    },
    {
      provide: SOURCES_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new SourcesRepository(db),
    },
    {
      provide: REVIEW_ITEMS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new ReviewItemsRepository(db),
    },
    {
      provide: EVIDENCE_SNAPSHOTS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new EvidenceSnapshotsRepository(db),
    },
    {
      provide: REMOVAL_CASES_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new RemovalCasesRepository(db),
    },
    {
      provide: REMOVAL_ACTIONS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new RemovalActionsRepository(db),
    },
    {
      provide: SUPPORT_REQUESTS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new SupportRequestsRepository(db),
    },
    {
      provide: JOBS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new JobsRepository(db),
    },
    {
      provide: OSINT_SEARCHES_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new OsintSearchesRepository(db),
    },
    {
      provide: OSINT_RESULTS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new OsintResultsRepository(db),
    },
    {
      provide: OSINT_EXPORTS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new OsintExportsRepository(db),
    },
    {
      provide: OSINT_HISTORY_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new OsintHistoryRepository(db),
    },
    {
      provide: OSINT_SAVED_ITEMS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new OsintSavedItemsRepository(db),
    },
    {
      provide: USERS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new UsersRepository(db),
    },
    {
      provide: USER_IMAGES_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new UserImagesRepository(db),
    },
    {
      provide: USER_SESSIONS_REPOSITORY,
      inject: [DRIZZLE_DB],
      useFactory: (db: ReturnType<typeof createDrizzleDatabase>) => new UserSessionsRepository(db),
    },
  ],
  exports: [
    DATABASE_POOL,
    DRIZZLE_DB,
    ASSETS_REPOSITORY,
    CHECKS_REPOSITORY,
    SOURCES_REPOSITORY,
    REVIEW_ITEMS_REPOSITORY,
    EVIDENCE_SNAPSHOTS_REPOSITORY,
    REMOVAL_CASES_REPOSITORY,
    REMOVAL_ACTIONS_REPOSITORY,
    SUPPORT_REQUESTS_REPOSITORY,
    JOBS_REPOSITORY,
    OSINT_SEARCHES_REPOSITORY,
    OSINT_RESULTS_REPOSITORY,
    OSINT_EXPORTS_REPOSITORY,
    OSINT_HISTORY_REPOSITORY,
    OSINT_SAVED_ITEMS_REPOSITORY,
    USERS_REPOSITORY,
    USER_IMAGES_REPOSITORY,
    USER_SESSIONS_REPOSITORY,
  ],
})
export class DatabaseModule {}
