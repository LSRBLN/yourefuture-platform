import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestSupportRequestsController } from './support-requests.controller.js';
import { NestSupportRequestsService } from './support-requests.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule, QueueModule],
  controllers: [NestSupportRequestsController],
  providers: [NestSupportRequestsService],
})
export class NestSupportRequestsModule {}
