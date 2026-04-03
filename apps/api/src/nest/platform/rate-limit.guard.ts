import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type IORedis from 'ioredis';

import { HttpError } from '../../modules/shared/http.js';
import type { AppConfig } from '../config/app-config.js';
import { RATE_LIMIT_KEY, type RateLimitConfig } from './rate-limit.decorator.js';
import { RATE_LIMIT_REDIS } from './rate-limit.tokens.js';
import type { NestHttpRequestWithContext } from './request-context.guard.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly defaultMaxRequests: number;
  private readonly defaultWindowMs: number;
  private readonly keyPrefix: string;

  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_REDIS) private readonly redis: Pick<IORedis, 'incr' | 'pexpire' | 'pttl'>,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    const appConfig = configService.get<AppConfig>('app');

    if (!appConfig) {
      throw new Error('Fehlende Konfiguration: app');
    }

    this.defaultMaxRequests = appConfig.rateLimit.defaultMaxRequests;
    this.defaultWindowMs = appConfig.rateLimit.defaultWindowMs;
    this.keyPrefix = appConfig.rateLimit.prefix;
  }

  async canActivate(context: ExecutionContext) {
    const config =
      this.reflector.getAllAndOverride<RateLimitConfig | undefined>(RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? {
        maxRequests: this.defaultMaxRequests,
        windowMs: this.defaultWindowMs,
      };

    const request = context.switchToHttp().getRequest<NestHttpRequestWithContext & { method?: string; route?: { path?: string } }>();
    const forwardedFor = request.headers?.['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const actorKey = request.trustshieldContext?.actor.subject ?? ipAddress ?? 'anonymous';
    const routeKey = request.route?.path ?? request.method ?? 'unknown';
    const key = `${this.keyPrefix}:${routeKey}:${actorKey}`;

    try {
      const count = await this.redis.incr(key);

      if (count === 1) {
        await this.redis.pexpire(key, config.windowMs);
      }

      if (count > config.maxRequests) {
        const ttlMs = await this.redis.pttl(key);
        const retryAfterSeconds = Math.max(1, Math.ceil(Math.max(0, ttlMs) / 1000));
        throw new HttpError(429, 'Rate limit exceeded', { retryAfterSeconds });
      }

      return true;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(503, 'Rate limiter unavailable');
    }
  }
}
