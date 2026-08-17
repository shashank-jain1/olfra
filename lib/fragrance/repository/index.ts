// ─────────────────────────────────────────────────────────────
// OLFRA™ — Repository composition root
//
// The single place that decides which adapters are in play. Feature code
// calls `getFragranceRepository()` and never learns whether it is talking
// to Postgres, Fragella, or the seed catalogue.
//
// Resolution order:
//   Supabase configured  → Supabase primary
//   otherwise            → seed catalogue primary
//   Fragella configured  → wrapped as gap-fill fallback
// ─────────────────────────────────────────────────────────────

import 'server-only';

import { serverEnv } from '../../config/env';
import { supabaseAdmin } from '../../supabase/server';
import { CompositeFragranceRepository } from './composite-repository';
import { FragellaRepository } from './fragella-repository';
import { SeedFragranceRepository } from './seed-repository';
import { SupabaseFragranceRepository } from './supabase-repository';
import type { FragranceRepository } from './port';

export type { FragranceRepository, WritableFragranceRepository } from './port';
export { SeedFragranceRepository } from './seed-repository';

let cached: FragranceRepository | null = null;

export function getFragranceRepository(): FragranceRepository {
  if (cached) return cached;

  const env = serverEnv();
  const client = supabaseAdmin();

  const primary: FragranceRepository = client
    ? new SupabaseFragranceRepository(client)
    : new SeedFragranceRepository();

  const fallback = env.FRAGELLA_API_KEY
    ? new FragellaRepository(env.FRAGELLA_API_KEY)
    : null;

  cached = new CompositeFragranceRepository(primary, fallback, {
    onEvent: (event) => {
      if (event.type.endsWith('error')) {
        console.warn('[fragrance-repository]', event);
      }
    },
  });

  return cached;
}

/** Test seam — drops the memoised instance. */
export function resetFragranceRepository(): void {
  cached = null;
}
