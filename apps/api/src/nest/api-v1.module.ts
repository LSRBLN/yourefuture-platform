import { Module } from '@nestjs/common';

import { NestAssetsModule } from './assets/assets.module.js';
import { NestAuthModule } from './auth/auth.module.js';
import { NestChecksModule } from './checks/checks.module.js';
import { NestEvidenceSnapshotsModule } from './evidence-snapshots/evidence-snapshots.module.js';
import { NestIntakeModule } from './intake/intake.module.js';
import { NestJobsModule } from './jobs/jobs.module.js';
import { PlatformModule } from './platform/platform.module.js';
import { NestRemovalCasesModule } from './removal-cases/removal-cases.module.js';
import { NestReviewsModule } from './reviews/reviews.module.js';
import { NestSourcesModule } from './sources/sources.module.js';
import { NestSupportRequestsModule } from './support-requests/support-requests.module.js';

@Module({
  imports: [
    NestAssetsModule,
    NestAuthModule,
    PlatformModule,
    NestIntakeModule,
    NestChecksModule,
    NestSourcesModule,
    NestJobsModule,
    NestSupportRequestsModule,
    NestRemovalCasesModule,
    NestReviewsModule,
    NestEvidenceSnapshotsModule,
  ],
})
export class ApiV1Module {}
