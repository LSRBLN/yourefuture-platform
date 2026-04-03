import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { NestEvidenceSnapshotsController } from './evidence-snapshots.controller.js';
import { NestEvidenceSnapshotsService } from './evidence-snapshots.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule],
  controllers: [NestEvidenceSnapshotsController],
  providers: [NestEvidenceSnapshotsService],
})
export class NestEvidenceSnapshotsModule {}
