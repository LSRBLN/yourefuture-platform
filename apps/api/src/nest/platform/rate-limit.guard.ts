import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HttpError } from '../../modules/shared/http.js';
import { RATE_LIMIT_KEY, type RateLimitConfig } from './rate-limit.decorator.js';
import type { NestHttpRequestWithContext } from './request-context.guard.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly entries = new Map<string, { count: number; windowStartedAt: number }>();

  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const config =
      this.reflector.getAllAndOverride<RateLimitConfig | undefined>(RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? undefined;

    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest<NestHttpRequestWithContext & { method?: string; route?: { path?: string } }>();
    const forwardedFor = request.headers?.['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const actorKey = request.trustshieldContext?.actor.subject ?? ipAddress ?? 'anonymous';
    const routeKey = request.route?.path ?? request.method ?? 'unknown';
    const key = `${routeKey}:${actorKey}`;
    const now = Date.now();
    const current = this.entries.get(key);

    if (!current || now - current.windowStartedAt >= config.windowMs) {
      this.entries.set(key, { count: 1, windowStartedAt: now });
      return true;
    }

    if (current.count >= config.maxRequests) {
      const retryAfterSeconds = Math.ceil((config.windowMs - (now - current.windowStartedAt)) / 1000);
      throw new HttpError(429, 'Rate limit exceeded', { retryAfterSeconds });
    }

    current.count += 1;
    return true;
  }
}
