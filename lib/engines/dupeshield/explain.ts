// ─────────────────────────────────────────────────────────────
// OLFRA™ — Dupe explanations
//
// Replaces the LLM-generated "why it smells similar" sentence with prose
// composed from the actual score breakdown. Less lyrical than a language
// model, but every clause is backed by a number the user can check —
// and it can't invent a note that isn't in the pyramid.
// ─────────────────────────────────────────────────────────────

import type { DupeBreakdown } from '../../fragrance/similarity';
import type { Fragrance } from '../../fragrance/types';

/** Verdict label for a score, in ranked position order. */
export function verdictFor(
  score: number,
  rank: number,
  candidate: Fragrance,
  original: Fragrance,
): string {
  const cheaper =
    typeof candidate.priceUSD === 'number' &&
    typeof original.priceUSD === 'number' &&
    candidate.priceUSD < original.priceUSD * 0.35;

  if (rank === 0 && score >= 75) return 'Best Overall Dupe';
  if (cheaper && score >= 60) return 'Budget Champion';
  if (score >= 75) return 'Very Close Match';
  if (score >= 60) return 'Strong Alternative';
  if (score >= 45) return 'Loose Interpretation';
  return 'Shares a Theme';
}

/**
 * Compose an explanation from the breakdown.
 *
 * Reads the three signals that actually moved the score and describes them
 * in plain language, leading with whichever dominated.
 */
export function explainMatch(
  breakdown: DupeBreakdown,
  sharedNotes: string[],
  candidate: Fragrance,
  original: Fragrance,
): string {
  const clauses: string[] = [];

  // 1. Accord shape — the dominant signal.
  clauses.push(accordClause(breakdown.accordCosine));

  // 2. Drydown overlap, named where we can name it.
  const sharedBase = candidate.notes.base.filter((note) =>
    original.notes.base.some(
      (other) => other.toLowerCase() === note.toLowerCase(),
    ),
  );

  if (sharedBase.length > 0) {
    clauses.push(
      `the base shares ${formatList(sharedBase)}, so the drydown lands in the same place`,
    );
  } else if (breakdown.baseNoteOverlap === 0 && sharedNotes.length > 0) {
    clauses.push(
      `the overlap is in the opening rather than the base, so they diverge as they dry down`,
    );
  }

  // 3. Performance, only when it is a genuine differentiator.
  const performanceNote = performanceClause(candidate, original);
  if (performanceNote) clauses.push(performanceNote);

  return `${capitalise(clauses.join('; '))}.`;
}

function accordClause(cosine: number): string {
  const percent = Math.round(cosine * 100);

  if (cosine >= 0.9) {
    return `the accord profiles are near-identical (${percent}% match)`;
  }
  if (cosine >= 0.75) {
    return `they share most of the same accord structure (${percent}%)`;
  }
  if (cosine >= 0.55) {
    return `the accord profiles clearly overlap (${percent}%) without being twins`;
  }
  return `the accords overlap only partially (${percent}%)`;
}

function performanceClause(
  candidate: Fragrance,
  original: Fragrance,
): string | null {
  if (
    typeof candidate.longevity !== 'number' ||
    typeof original.longevity !== 'number'
  ) {
    return null;
  }

  const delta = candidate.longevity - original.longevity;
  if (delta >= 2) return 'it also lasts noticeably longer on skin';
  if (delta <= -2) return 'it fades faster, so expect to reapply';
  return null;
}

/** One-paragraph summary of a whole report. */
export function summariseReport(
  original: Fragrance,
  matches: Array<{ score: number }>,
): string {
  if (matches.length === 0) {
    return (
      `No close matches for ${original.name} in the current catalogue. ` +
      `That usually means it is genuinely distinctive — or that our catalogue ` +
      `does not yet cover its corner of the market.`
    );
  }

  const best = matches[0].score;
  const strong = matches.filter((match) => match.score >= 70).length;

  if (best >= 85) {
    return (
      `${original.name} is well covered: the closest match reaches ${best}% on accord ` +
      `structure and drydown overlap. Scores this high usually smell interchangeable ` +
      `at arm's length, though skin chemistry still separates them up close.`
    );
  }
  if (strong > 0) {
    return (
      `${strong} strong alternative${strong === 1 ? '' : 's'} to ${original.name}, ` +
      `topping out at ${best}%. Expect the same family and a similar drydown rather ` +
      `than a note-for-note copy.`
    );
  }
  return (
    `Nothing comes very close to ${original.name} — the best match is ${best}%. ` +
    `The results below share its theme, but each takes a meaningfully different route.`
  );
}

// ─── formatting ──────────────────────────────────────────────

function formatList(items: string[]): string {
  const trimmed = items.slice(0, 3);
  if (trimmed.length === 1) return trimmed[0];
  if (trimmed.length === 2) return `${trimmed[0]} and ${trimmed[1]}`;
  return `${trimmed.slice(0, -1).join(', ')} and ${trimmed[trimmed.length - 1]}`;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
