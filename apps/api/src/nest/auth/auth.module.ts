import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { NestMinioModule } from '../storage/minio/minio.module.js';
import { NestAuthController, NestUsersController } from './auth.controller.js';
import { NestAuthService } from './nest-auth.service.js';

@Module({
  imports: [DatabaseModule, PlatformModule, NestMinioModule],
  controllers: [NestAuthController, NestUsersController],
  providers: [NestAuthService],
  exports: [NestAuthService],
})
export class NestAuthModule {}
