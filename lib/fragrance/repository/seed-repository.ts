// ─────────────────────────────────────────────────────────────
// OLFRA™ — Seed repository (in-memory)
//
// Zero-config adapter over the curated catalogue. This is what makes the
// app work on a fresh clone with no .env file: every feature runs, just
// over a small catalogue instead of the full one.
// ─────────────────────────────────────────────────────────────

import type { Fragrance, FragranceSearchQuery } from '../types';
import { SEED_BY_ID, SEED_CATALOGUE } from '../data/catalogue';
import type { FragranceRepository } from './port';

export class SeedFragranceRepository implements FragranceRepository {
  readonly name = 'seed';

  constructor(private readonly catalogue: Fragrance[] = SEED_CATALOGUE) {}

  async search({ q, limit = 10 }: FragranceSearchQuery): Promise<Fragrance[]> {
    const needle = q.trim().toLowerCase();
    if (!needle) return this.catalogue.slice(0, limit);

    return this.catalogue
      .map((fragrance) => ({
        fragrance,
        rank: relevance(fragrance, needle),
      }))
      .filter((entry) => entry.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, limit)
      .map((entry) => entry.fragrance);
  }

  async findById(id: string): Promise<Fragrance | null> {
    return SEED_BY_ID.get(id) ?? null;
  }

  async candidatesFor(
    fragrance: Fragrance,
    limit: number,
  ): Promise<Fragrance[]> {
    // The seed catalogue is small enough to score exhaustively.
    return this.catalogue
      .filter((candidate) => candidate.id !== fragrance.id)
      .slice(0, limit);
  }
}

/** Higher is better; 0 means no match. */
function relevance(fragrance: Fragrance, needle: string): number {
  const name = fragrance.name.toLowerCase();
  const brand = fragrance.brand.toLowerCase();
  const combined = `${brand} ${name}`;

  if (name === needle) return 100;
  if (combined === needle) return 95;
  if (name.startsWith(needle)) return 80;
  if (combined.includes(needle)) return 60;
  if (brand.includes(needle)) return 40;
  if (fragrance.family?.toLowerCase().includes(needle)) return 20;

  // Fall back to matching any note, so "oud" or "vanilla" returns something.
  const notes = [
    ...fragrance.notes.top,
    ...fragrance.notes.heart,
    ...fragrance.notes.base,
  ];
  if (notes.some((note) => note.toLowerCase().includes(needle))) return 10;

  return 0;
}
