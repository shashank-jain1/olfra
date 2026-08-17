// ─────────────────────────────────────────────────────────────
// OLFRA™ — AI composition root
// ─────────────────────────────────────────────────────────────

import 'server-only';

import { serverEnv } from '../config/env';
import { GeminiProvider } from './gemini-provider';
import type { AiProvider } from './port';

export * from './port';

let cached: AiProvider | null | undefined;

/** Configured provider, or null when no key is set. */
export function getAiProvider(): AiProvider | null {
  if (cached !== undefined) return cached;

  const { GEMINI_API_KEY } = serverEnv();
  cached = GEMINI_API_KEY ? new GeminiProvider(GEMINI_API_KEY) : null;

  return cached;
}

/** Test seam. */
export function resetAiProvider(): void {
  cached = undefined;
}
