import { Module } from '@nestjs/common';

import { ApiExceptionFilter } from './api-exception.filter.js';
import { PlatformController } from './platform.controller.js';
import { PlatformService } from './platform.service.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { RbacGuard } from './rbac.guard.js';
import { RequestContextGuard } from './request-context.guard.js';

@Module({
  controllers: [PlatformController],
  providers: [PlatformService, RequestContextGuard, RbacGuard, RateLimitGuard, ApiExceptionFilter],
  exports: [PlatformService, RequestContextGuard, RbacGuard, RateLimitGuard, ApiExceptionFilter],
})
export class PlatformModule {}
