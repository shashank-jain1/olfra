// ─────────────────────────────────────────────────────────────
// OLFRA™ — Supabase browser client
//
// Anon key only. Every table this touches has Row Level Security enabled
// (see supabase/migrations/0002), so the policies — not the client — are
// what stop one user reading or writing another's rows.
// ─────────────────────────────────────────────────────────────

'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicEnv } from '../config/env';

let cached: SupabaseClient | null = null;

/** Anon client, or null when Supabase is not configured. */
export function supabaseBrowser(): SupabaseClient | null {
  if (cached) return cached;

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = publicEnv;
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

  cached = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: true, autoRefreshToken: true } },
  );

  return cached;
}
