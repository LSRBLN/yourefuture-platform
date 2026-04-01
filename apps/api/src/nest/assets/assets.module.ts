import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestAssetsController } from './assets.controller.js';
import { NestAssetsService } from './assets.service.js';

@Module({
  imports: [DatabaseModule, QueueModule],
  controllers: [NestAssetsController],
  providers: [NestAssetsService],
})
export class NestAssetsModule {}
