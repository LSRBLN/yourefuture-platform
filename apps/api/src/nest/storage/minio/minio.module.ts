import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module.js';
import { QueueModule } from '../../queue/queue.module.js';
import { NestMinioService } from './minio.service.js';

@Module({
  imports: [DatabaseModule, QueueModule],
  providers: [NestMinioService],
  exports: [NestMinioService],
})
export class NestMinioModule {}

