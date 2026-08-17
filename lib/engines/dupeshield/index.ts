// ─────────────────────────────────────────────────────────────
// OLFRA™ — DupeShield engine
//
// Orchestrates: resolve the query to a fragrance → pull a candidate pool →
// score every candidate → rank, filter, explain.
//
// The engine takes its repository by injection, so it can be unit-tested
// against the seed catalogue with no database and no network.
// ─────────────────────────────────────────────────────────────

import { scoreDupe } from '../../fragrance/similarity';
import { buildNoteIdf, type NoteIdf } from '../../fragrance/note-idf';
import type { Fragrance } from '../../fragrance/types';
import type { FragranceRepository } from '../../fragrance/repository/port';
import { explainMatch, verdictFor } from './explain';
import {
  DUPE_DEFAULTS,
  type DupeMatch,
  type DupeReport,
  type DupeSearchOptions,
} from './types';

export * from './types';
export { summariseReport } from './explain';

export class FragranceNotFoundError extends Error {
  constructor(readonly query: string) {
    super(`No fragrance matched "${query}"`);
    this.name = 'FragranceNotFoundError';
  }
}

export class DupeShieldEngine {
  constructor(private readonly repository: FragranceRepository) {}

  /** Find dupes for a free-text query such as "Baccarat Rouge 540". */
  async findDupesByQuery(
    query: string,
    options: DupeSearchOptions = {},
  ): Promise<DupeReport> {
    const [original] = await this.repository.search({ q: query, limit: 1 });
    if (!original) throw new FragranceNotFoundError(query);
    return this.findDupes(original, options);
  }

  async findDupes(
    original: Fragrance,
    options: DupeSearchOptions = {},
  ): Promise<DupeReport> {
    const { limit, minScore, candidatePoolSize } = {
      ...DUPE_DEFAULTS,
      ...options,
    };

    const candidates = await this.repository.candidatesFor(
      original,
      candidatePoolSize,
    );

    // Note rarity is measured against the pool we are actually ranking, so
    // "common" means common among these candidates rather than in some
    // fixed global list.
    const idf = buildNoteIdf([original, ...candidates]);

    const matches = candidates
      .filter((candidate) => !isSameFragrance(original, candidate))
      .map((candidate) => toMatch(original, candidate, idf))
      .filter((match) => match.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      // Verdict depends on final rank, so assign after sorting.
      .map((match, rank) => ({
        ...match,
        verdict: verdictFor(match.score, rank, match.fragrance, original),
      }));

    return {
      original,
      matches,
      candidatePoolSize: candidates.length,
      limitedCatalogue: original.source === 'seed',
    };
  }
}

function toMatch(
  original: Fragrance,
  candidate: Fragrance,
  idf: NoteIdf,
): DupeMatch {
  const { score, breakdown, sharedNotes } = scoreDupe(original, candidate, idf);

  return {
    fragrance: candidate,
    score,
    breakdown,
    sharedNotes,
    explanation: explainMatch(breakdown, sharedNotes, candidate, original),
    verdict: '', // assigned after ranking
    savingsUSD: computeSavings(original, candidate),
  };
}

/**
 * Two records for the same juice (a flanker, a reformulation, the same
 * scent in a different concentration) are not a "dupe" — filter them out
 * so DupeShield doesn't proudly recommend the thing you already searched.
 */
function isSameFragrance(a: Fragrance, b: Fragrance): boolean {
  if (a.id === b.id) return true;

  const sameBrand = a.brand.trim().toLowerCase() === b.brand.trim().toLowerCase();
  if (!sameBrand) return false;

  return normaliseName(a.name) === normaliseName(b.name);
}

function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /\b(eau de parfum|eau de toilette|eau de cologne|parfum|extrait|edp|edt|edc|intense|elixir)\b/g,
      '',
    )
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function computeSavings(
  original: Fragrance,
  candidate: Fragrance,
): number | undefined {
  if (
    typeof original.priceUSD !== 'number' ||
    typeof candidate.priceUSD !== 'number'
  ) {
    return undefined;
  }
  const savings = original.priceUSD - candidate.priceUSD;
  return savings > 0 ? Math.round(savings) : undefined;
}
