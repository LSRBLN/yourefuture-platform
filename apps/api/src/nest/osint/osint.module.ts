import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestOsintController } from './osint.controller.js';
import { NestOsintService } from './osint.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule, QueueModule],
  controllers: [NestOsintController],
  providers: [NestOsintService],
})
export class NestOsintModule {}
