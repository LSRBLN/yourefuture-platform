import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NestAssetsModule } from './assets/assets.module.js';
import { NestAuthModule } from './auth/auth.module.js';
import { NestChecksModule } from './checks/checks.module.js';
import { appConfig } from './config/app-config.js';
import { validateEnv } from './config/validated-env.js';
import { NestEvidenceSnapshotsModule } from './evidence-snapshots/evidence-snapshots.module.js';
import { NestIntakeModule } from './intake/intake.module.js';
import { NestJobsModule } from './jobs/jobs.module.js';
import { NestOsintModule } from './osint/osint.module.js';
import { PlatformModule } from './platform/platform.module.js';
import { NestRemovalCasesModule } from './removal-cases/removal-cases.module.js';
import { NestReviewsModule } from './reviews/reviews.module.js';
import { NestSourcesModule } from './sources/sources.module.js';
import { NestMinioModule } from './storage/minio/minio.module.js';
import { NestSupportRequestsModule } from './support-requests/support-requests.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      validate: validateEnv,
    }),
    NestAssetsModule,
    NestAuthModule,
    PlatformModule,
    NestIntakeModule,
    NestChecksModule,
    NestOsintModule,
    NestSourcesModule,
    NestJobsModule,
    NestMinioModule,
    NestSupportRequestsModule,
    NestRemovalCasesModule,
    NestReviewsModule,
    NestEvidenceSnapshotsModule,
  ],
})
export class ApiV1Module {}
