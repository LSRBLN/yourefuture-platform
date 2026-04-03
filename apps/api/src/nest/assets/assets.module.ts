import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { QueueModule } from '../queue/queue.module.js';
import { NestMinioModule } from '../storage/minio/minio.module.js';
import { NestAssetsController } from './assets.controller.js';
import { NestAssetsService } from './assets.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule, QueueModule, NestMinioModule],
  controllers: [NestAssetsController],
  providers: [NestAssetsService],
})
export class NestAssetsModule {}
