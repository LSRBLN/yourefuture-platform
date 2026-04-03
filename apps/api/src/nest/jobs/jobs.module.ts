import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { NestJobsController } from './jobs.controller.js';
import { NestJobsService } from './jobs.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule],
  controllers: [NestJobsController],
  providers: [NestJobsService],
})
export class NestJobsModule {}
