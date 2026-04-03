import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestRemovalCasesController } from './removal-cases.controller.js';
import { NestRemovalCasesService } from './removal-cases.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule, QueueModule],
  controllers: [NestRemovalCasesController],
  providers: [NestRemovalCasesService],
})
export class NestRemovalCasesModule {}
