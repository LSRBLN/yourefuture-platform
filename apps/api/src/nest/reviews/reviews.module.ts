import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { NestReviewsController } from './reviews.controller.js';
import { NestReviewsService } from './reviews.service.js';

@Module({
  imports: [PlatformModule, DatabaseModule],
  controllers: [NestReviewsController],
  providers: [NestReviewsService],
})
export class NestReviewsModule {}
