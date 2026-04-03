import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

import type { AppConfig } from '../config/app-config.js';
import { DatabaseModule } from '../database/database.module.js';
import { ApiExceptionFilter } from './api-exception.filter.js';
import { PlatformController } from './platform.controller.js';
import { PlatformService } from './platform.service.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { createInMemoryRateLimitRedisMock } from './rate-limit.redis-mock.js';
import { RATE_LIMIT_REDIS } from './rate-limit.tokens.js';
import { RbacGuard } from './rbac.guard.js';
import { RequestContextGuard } from './request-context.guard.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PlatformController],
  providers: [
    {
      provide: RATE_LIMIT_REDIS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.get<AppConfig>('app');

        if (!appConfig) {
          throw new Error('Fehlende Konfiguration: app');
        }

        const useInMemoryRateLimitRedis = appConfig.nodeEnv === 'test' && appConfig.testing.useInMemoryRateLimitRedis;

        if (useInMemoryRateLimitRedis) {
          return createInMemoryRateLimitRedisMock();
        }

        return new IORedis(appConfig.redis.url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
      },
    },
    PlatformService,
    RequestContextGuard,
    RbacGuard,
    RateLimitGuard,
    ApiExceptionFilter,
  ],
  exports: [RATE_LIMIT_REDIS, PlatformService, RequestContextGuard, RbacGuard, RateLimitGuard, ApiExceptionFilter],
})
export class PlatformModule {}
