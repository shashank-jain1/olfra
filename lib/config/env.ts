// ─────────────────────────────────────────────────────────────
// OLFRA™ — Environment configuration
//
// One place that reads process.env. Everything else imports typed values
// from here, so a missing variable surfaces as a clear boot-time message
// rather than `undefined` propagating into a fetch call.
//
// Every integration is OPTIONAL by design: with an empty .env the app runs
// on the seed catalogue with the deterministic engine, and the features
// that genuinely need a vendor degrade with an explicit message.
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

const serverSchema = z.object({
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  FRAGELLA_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof publicSchema>;

function parseServerEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid server environment:\n${issues}`);
  }

  return result.data;
}

let cachedServerEnv: ServerEnv | null = null;

/** Server-side env. Throws on malformed values, tolerates missing ones. */
export function serverEnv(): ServerEnv {
  cachedServerEnv ??= parseServerEnv();
  return cachedServerEnv;
}

/**
 * Public env. Next.js inlines NEXT_PUBLIC_* at build time, so these must be
 * referenced as full literal property accesses — do not refactor to
 * `process.env[key]`, which the compiler cannot statically replace.
 */
export const publicEnv: PublicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// ─── capability flags ────────────────────────────────────────
//
// The UI reads these to explain *why* something is unavailable, instead of
// showing a dead button or silently pretending demo data is real.

export interface Capabilities {
  /** Supabase configured — accounts, wardrobe, social, marketplace persist. */
  database: boolean;
  /** Fragella key present — catalogue gaps can be filled on demand. */
  catalogueGapFill: boolean;
  /** Gemini key present — bottle photo ID and editorial generation. */
  generativeAi: boolean;
}

export function serverCapabilities(): Capabilities {
  const env = serverEnv();
  return {
    database: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    catalogueGapFill: Boolean(env.FRAGELLA_API_KEY),
    generativeAi: Boolean(env.GEMINI_API_KEY),
  };
}

export function publicCapabilities(): Pick<Capabilities, 'database'> {
  return {
    database: Boolean(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL &&
        publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}
