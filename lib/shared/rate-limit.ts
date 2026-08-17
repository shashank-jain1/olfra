// ─────────────────────────────────────────────────────────────
// OLFRA™ — Token-bucket rate limiter
//
// Two jobs:
//   1. Stay inside upstream quotas (Fragella allows 60 req/min).
//   2. Stop our own public routes being used to drain a paid key.
//
// In-memory, so it is per-process: correct for a single Node server,
// approximate across serverless instances. Swap the backing store for
// Redis before running multi-instance in production.
// ─────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  /** Tokens left after this call. */
  remaining: number;
  /** Milliseconds until at least one token is available. 0 when allowed. */
  retryAfterMs: number;
}

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

export class TokenBucket {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly capacity: number,
    private readonly refillPerMs: number,
  ) {}

  /** `capacity` requests per `windowMs`, refilling continuously. */
  static perWindow(capacity: number, windowMs: number): TokenBucket {
    return new TokenBucket(capacity, capacity / windowMs);
  }

  take(key: string, cost = 1): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key) ?? {
      tokens: this.capacity,
      lastRefillMs: now,
    };

    const elapsed = now - bucket.lastRefillMs;
    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + elapsed * this.refillPerMs,
    );
    bucket.lastRefillMs = now;

    if (bucket.tokens < cost) {
      this.buckets.set(key, bucket);
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        retryAfterMs: Math.ceil((cost - bucket.tokens) / this.refillPerMs),
      };
    }

    bucket.tokens -= cost;
    this.buckets.set(key, bucket);

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfterMs: 0,
    };
  }

  /** Drop buckets that have been idle long enough to be full again. */
  prune(): void {
    const now = Date.now();
    const fullAfterMs = this.capacity / this.refillPerMs;

    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastRefillMs > fullAfterMs) this.buckets.delete(key);
    }
  }
}
