// ─────────────────────────────────────────────────────────────
// OLFRA™ — Supabase server client
//
// Uses the SERVICE ROLE key, which bypasses Row Level Security. It must
// never be imported into a client component — `server-only` turns that
// mistake into a build error rather than a leaked God-mode credential.
// ─────────────────────────────────────────────────────────────

import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '../config/env';

let cached: SupabaseClient | null = null;

/** Service-role client, or null when Supabase is not configured. */
export function supabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const env = serverEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;

  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
