// ─────────────────────────────────────────────────────────────
// OLFRA™ — Fragrance repository port
//
// The seam between "where fragrance data lives" and "what we do with it".
// Engines and route handlers depend on this interface only; swapping
// Supabase for Fragella, or adding a cache layer, touches no feature code.
// ─────────────────────────────────────────────────────────────

import type { Fragrance, FragranceSearchQuery } from '../types';

export interface FragranceRepository {
  /** Human-readable adapter name, surfaced in /api/health and logs. */
  readonly name: string;

  /** Fuzzy search by name or brand. Ordered by relevance, best first. */
  search(query: FragranceSearchQuery): Promise<Fragrance[]>;

  /** Exact lookup. Returns null when not found — never throws for a miss. */
  findById(id: string): Promise<Fragrance | null>;

  /**
   * Candidate pool for similarity search.
   *
   * DupeShield scores every candidate against the query fragrance, so this
   * needs to return enough of the catalogue to find real matches without
   * pulling 100k rows into memory. Implementations should pre-filter on a
   * cheap signal (shared accords, family) where the backing store allows it.
   */
  candidatesFor(fragrance: Fragrance, limit: number): Promise<Fragrance[]>;
}

/** Optional capability: repositories that can persist gap-filled records. */
export interface WritableFragranceRepository extends FragranceRepository {
  upsert(fragrances: Fragrance[]): Promise<void>;
}

export function isWritable(
  repository: FragranceRepository,
): repository is WritableFragranceRepository {
  return typeof (repository as WritableFragranceRepository).upsert === 'function';
}
