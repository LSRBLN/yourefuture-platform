import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestChecksController } from './checks.controller.js';
import { NestChecksService } from './checks.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule, QueueModule],
  controllers: [NestChecksController],
  providers: [NestChecksService],
})
export class NestChecksModule {}
