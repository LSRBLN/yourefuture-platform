import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestIntakeController } from './intake.controller.js';
import { NestIntakeService } from './intake.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule, QueueModule],
  controllers: [NestIntakeController],
  providers: [NestIntakeService],
})
export class NestIntakeModule {}
