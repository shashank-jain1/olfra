// ─────────────────────────────────────────────────────────────
// OLFRA™ — Route guards
//
// Public routes spend our upstream quota (Fragella) and our AI budget
// (Gemini), so they are rate limited per client. This is the protection
// the previous /api/claude route lacked entirely: it forwarded any body
// the browser sent straight to a paid API, with no ceiling.
// ─────────────────────────────────────────────────────────────

import type { NextRequest } from 'next/server';
import { TokenBucket } from '../shared/rate-limit';
import { fail } from './respond';

/** Generous for engine routes — they are pure computation, no vendor cost. */
const engineLimiter = TokenBucket.perWindow(120, 60_000);

/** Tight for AI routes — each call costs money and upstream quota. */
const aiLimiter = TokenBucket.perWindow(10, 60_000);

export type LimiterKind = 'engine' | 'ai';

/**
 * Best-effort client identity. Behind a proxy this is the forwarded
 * address; direct, it falls back to a shared bucket. Not a security
 * boundary — an abuse ceiling. Real per-user limits need authentication.
 */
function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'anonymous';
}

/** Returns a 429 response when the caller is over budget, else null. */
export function enforceRateLimit(
  request: NextRequest,
  kind: LimiterKind,
): Response | null {
  const limiter = kind === 'ai' ? aiLimiter : engineLimiter;
  const result = limiter.take(`${kind}:${clientKey(request)}`);

  if (result.allowed) return null;

  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
  const response = fail(
    'rate_limited',
    `Too many requests. Try again in ${retryAfterSeconds}s.`,
    429,
  );
  response.headers.set('retry-after', String(retryAfterSeconds));
  return response;
}
