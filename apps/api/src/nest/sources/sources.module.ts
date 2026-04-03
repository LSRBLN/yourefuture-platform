import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { NestSourcesController } from './sources.controller.js';
import { NestSourcesService } from './sources.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule],
  controllers: [NestSourcesController],
  providers: [NestSourcesService],
})
export class NestSourcesModule {}
