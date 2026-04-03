import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'trustshield:rate-limit';

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export function RateLimit(maxRequests: number, windowMs: number) {
  return SetMetadata(RATE_LIMIT_KEY, {
    maxRequests,
    windowMs,
  } satisfies RateLimitConfig);
}
