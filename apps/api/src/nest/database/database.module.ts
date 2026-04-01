import { Module } from '@nestjs/common';

import {
  AssetsRepository,
  ChecksRepository,
  createDatabasePool,
  createDatabaseRuntimeConfig,
  createDrizzleDatabase,
  EvidenceSnapshotsRepository,
  JobsRepository,
  RemovalActionsRepository,
  RemovalCasesRepository,
  ReviewItemsRepository,
  SourcesRepository,
  SupportRequestsRepository,
} from '@trustshield/db';

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

@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: () => createDatabasePool(createDatabaseRuntimeConfig()),
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
  ],
})
export class DatabaseModule {}
