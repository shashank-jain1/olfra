import type { DupeBreakdown } from '../../fragrance/similarity';
import type { Fragrance } from '../../fragrance/types';

export interface DupeMatch {
  fragrance: Fragrance;
  /** 0..100. */
  score: number;
  breakdown: DupeBreakdown;
  sharedNotes: string[];
  /** Templated, deterministic explanation of the score. */
  explanation: string;
  /** Short label, e.g. "Best Overall Dupe". */
  verdict: string;
  /** Positive when the dupe is cheaper than the original. */
  savingsUSD?: number;
}

export interface DupeReport {
  original: Fragrance;
  matches: DupeMatch[];
  /** Where the candidate pool came from, for UI honesty about coverage. */
  candidatePoolSize: number;
  /** True when results came only from the small seed catalogue. */
  limitedCatalogue: boolean;
}

export interface DupeSearchOptions {
  /** Max matches returned. */
  limit?: number;
  /** Scores below this are dropped rather than padded with weak matches. */
  minScore?: number;
  /** Candidates pulled from the repository before scoring. */
  candidatePoolSize?: number;
}

export const DUPE_DEFAULTS = {
  limit: 5,
  minScore: 35,
  candidatePoolSize: 60,
} as const satisfies Required<DupeSearchOptions>;
