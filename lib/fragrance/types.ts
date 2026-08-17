// ─────────────────────────────────────────────────────────────
// OLFRA™ — Fragrance domain types
//
// Pure data shapes. No framework, no I/O, no vendor types. Everything
// upstream (Supabase rows, Fragella JSON, seed fixtures) is mapped INTO
// these; everything downstream (engines, UI) reads only these.
// ─────────────────────────────────────────────────────────────

/** Where a fragrance record came from. Surfaced in the UI so users can tell
 *  first-party curated data from a third-party gap-fill. */
export type FragranceSource = 'local' | 'fragella' | 'seed';

export type Concentration =
  | 'Parfum'
  | 'EDP'
  | 'EDT'
  | 'EDC'
  | 'Extrait'
  | 'Oil'
  | 'Unknown';

/** Note pyramid. Any tier may be empty — plenty of real records are partial. */
export interface NotePyramid {
  top: string[];
  heart: string[];
  base: string[];
}

/**
 * Accord weights, keyed by canonical accord slug (see `accords.ts`).
 * Values are 0..1 and are expected — but not required — to sum to ~1.
 * Normalisation happens in `toAccordVector`, so callers may pass raw weights.
 */
export type AccordWeights = Record<string, number>;

export interface Fragrance {
  id: string;
  slug: string;
  name: string;
  brand: string;
  year?: number;
  concentration: Concentration;
  /** Marketing family, e.g. "Aromatic Fougère". Display only — never scored. */
  family?: string;
  notes: NotePyramid;
  accords: AccordWeights;
  /** 1..10, self-reported/aggregate. Undefined when unknown. */
  longevity?: number;
  /** 1..10. */
  sillage?: number;
  /** Community rating 0..5. */
  rating?: number;
  priceUSD?: number;
  imageUrl?: string;
  description?: string;
  source: FragranceSource;
}

/** A fragrance plus its dense accord vector, ready for similarity math. */
export interface VectorizedFragrance extends Fragrance {
  vector: Float64Array;
}

export interface FragranceSearchQuery {
  q: string;
  limit?: number;
}
