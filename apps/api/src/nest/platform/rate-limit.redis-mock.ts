type RateLimitBucket = {
  count: number;
  expiresAt: number;
};

export type RateLimitRedisLike = {
  incr(key: string): Promise<number>;
  pexpire(key: string, ttlMs: number): Promise<number>;
  pttl(key: string): Promise<number>;
};

function isExpired(bucket: RateLimitBucket, now: number): boolean {
  return bucket.expiresAt <= now;
}

export function createInMemoryRateLimitRedisMock(): RateLimitRedisLike {
  const buckets = new Map<string, RateLimitBucket>();

  return {
    async incr(key: string): Promise<number> {
      const now = Date.now();
      const existing = buckets.get(key);

      if (!existing || isExpired(existing, now)) {
        buckets.set(key, {
          count: 1,
          expiresAt: Number.POSITIVE_INFINITY,
        });
        return 1;
      }

      existing.count += 1;
      return existing.count;
    },
    async pexpire(key: string, ttlMs: number): Promise<number> {
      const now = Date.now();
      const bucket = buckets.get(key);

      if (!bucket || isExpired(bucket, now)) {
        buckets.delete(key);
        return 0;
      }

      bucket.expiresAt = now + Math.max(1, ttlMs);
      return 1;
    },
    async pttl(key: string): Promise<number> {
      const now = Date.now();
      const bucket = buckets.get(key);

      if (!bucket) {
        return -2;
      }

      if (isExpired(bucket, now)) {
        buckets.delete(key);
        return -2;
      }

      if (!Number.isFinite(bucket.expiresAt)) {
        return -1;
      }

      return Math.max(0, Math.floor(bucket.expiresAt - now));
    },
  };
}

