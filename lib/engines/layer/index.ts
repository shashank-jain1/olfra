// ─────────────────────────────────────────────────────────────
// OLFRA™ — ScentLayer engine
//
// Judges whether two fragrances combine well. The interesting insight is
// that maximum similarity is NOT the goal: two near-identical scents layer
// to no effect, while two unrelated ones fight. The best pairings share a
// base to anchor them and differ up top to add something.
//
// So the score peaks at moderate overlap, and drops off in both directions.
// ─────────────────────────────────────────────────────────────

import {
  ACCORD_LABELS,
  CANONICAL_ACCORDS,
  toAccordVector,
  type CanonicalAccord,
} from '../../fragrance/accords';
import { inferAccordsFromNotes } from '../../fragrance/note-accords';
import { cosineSimilarity } from '../../fragrance/similarity';
import type { Fragrance } from '../../fragrance/types';

export type LayerVerdict =
  | 'Sublime Match'
  | 'Good Pairing'
  | 'Interesting Contrast'
  | 'Avoid';

export interface LayerResult {
  compatibilityScore: number;
  verdict: LayerVerdict;
  /** The combined accord picture, strongest first. */
  layeredAccords: Array<{ label: string; weight: number }>;
  applicationOrder: {
    first: string;
    second: string;
    waitTime: string;
    reason: string;
  };
  description: string;
  /** Specific conflicts detected, empty when none. */
  warnings: string[];
  breakdown: {
    /** How much accord DNA they share, 0..1. */
    overlap: number;
    /** How close their projection strengths are, 0..1. */
    balance: number;
    /** Anchoring: do they share base-note territory? 0..1. */
    anchor: number;
  };
}

/**
 * Accord pairs that reliably fight each other. Not exhaustive — these are
 * the combinations that come up often enough to be worth calling out.
 */
const CLASHES: Array<[CanonicalAccord, CanonicalAccord, string]> = [
  ['aquatic', 'oud', 'Marine freshness and dense oud pull in opposite directions; the result usually reads as confused rather than complex.'],
  ['aquatic', 'gourmand', 'Sweet gourmand over a clean aquatic tends to smell synthetic — like scented cleaning product.'],
  ['gourmand', 'mossy', 'Sugar against damp oakmoss is a difficult contrast that rarely resolves.'],
  ['ozonic', 'animalic', 'Clean air notes make animalic facets read as unwashed rather than sensual.'],
  ['citrus', 'tobacco', 'Bright citrus flattens against tobacco’s density and disappears within minutes.'],
];

/** Overlap sweet spot: enough shared DNA to cohere, enough difference to matter. */
const IDEAL_OVERLAP = 0.55;

export function scoreLayering(a: Fragrance, b: Fragrance): LayerResult {
  const accordsA = resolveAccords(a);
  const accordsB = resolveAccords(b);
  const vectorA = toAccordVector(accordsA);
  const vectorB = toAccordVector(accordsB);

  const overlap = cosineSimilarity(vectorA, vectorB);
  const balance = intensityBalance(a, b);
  const anchor = baseAnchor(a, b);
  const warnings = detectClashes(accordsA, accordsB);

  const score = computeScore({ overlap, balance, anchor, clashCount: warnings.length });
  const verdict = verdictFor(score, overlap);
  const order = decideOrder(a, b);

  return {
    compatibilityScore: score,
    verdict,
    layeredAccords: combineAccords(vectorA, vectorB),
    applicationOrder: order,
    description: describe(a, b, { overlap, balance, anchor }, verdict),
    warnings,
    breakdown: { overlap, balance, anchor },
  };
}

// ─── scoring ─────────────────────────────────────────────────

function computeScore(input: {
  overlap: number;
  balance: number;
  anchor: number;
  clashCount: number;
}): number {
  // Peak at IDEAL_OVERLAP, falling off symmetrically in both directions.
  // Divisor tuned so total dissimilarity (0) and total identity (1) both
  // land near zero on this term.
  const overlapFit = 1 - Math.abs(input.overlap - IDEAL_OVERLAP) / 0.55;

  const weighted =
    Math.max(0, overlapFit) * 0.5 + input.balance * 0.25 + input.anchor * 0.25;

  const clashPenalty = input.clashCount * 0.18;
  return Math.round(Math.min(100, Math.max(0, (weighted - clashPenalty) * 100)));
}

function verdictFor(score: number, overlap: number): LayerVerdict {
  if (score >= 78) return 'Sublime Match';
  if (score >= 60) return 'Good Pairing';
  // A low score with low overlap is a contrast worth trying; a low score
  // with high overlap just means the pairing is pointless.
  if (score >= 40) return overlap < 0.4 ? 'Interesting Contrast' : 'Avoid';
  return 'Avoid';
}

/** Closeness of projection strength, 0..1. Mismatched pairs get bulldozed. */
function intensityBalance(a: Fragrance, b: Fragrance): number {
  if (typeof a.sillage !== 'number' || typeof b.sillage !== 'number') return 0.6;
  return Math.max(0, 1 - Math.abs(a.sillage - b.sillage) / 6);
}

/** Shared base-note territory, which is what holds a layering together. */
function baseAnchor(a: Fragrance, b: Fragrance): number {
  const basesA = new Set(a.notes.base.map((note) => note.toLowerCase()));
  const basesB = new Set(b.notes.base.map((note) => note.toLowerCase()));
  if (basesA.size === 0 || basesB.size === 0) return 0.5;

  let shared = 0;
  for (const note of basesA) if (basesB.has(note)) shared++;

  // One shared base note is usually enough to anchor a pairing; we cap the
  // credit at two so a long shared base list doesn't dominate the score.
  return Math.min(1, shared / 2);
}

function detectClashes(
  accordsA: Record<string, number>,
  accordsB: Record<string, number>,
): string[] {
  const warnings: string[] = [];
  const strongIn = (accords: Record<string, number>, accord: CanonicalAccord) => {
    const vector = toAccordVector(accords);
    return vector[CANONICAL_ACCORDS.indexOf(accord)] > 0.25;
  };

  for (const [first, second, message] of CLASHES) {
    const conflict =
      (strongIn(accordsA, first) && strongIn(accordsB, second)) ||
      (strongIn(accordsA, second) && strongIn(accordsB, first));
    if (conflict) warnings.push(message);
  }

  return warnings;
}

// ─── output shaping ──────────────────────────────────────────

function decideOrder(
  a: Fragrance,
  b: Fragrance,
): LayerResult['applicationOrder'] {
  // The heavier, longer-lasting scent goes on skin first as the anchor;
  // the lighter one sits on top where its volatile notes can still read.
  const weightA = (a.longevity ?? 5) + (a.sillage ?? 5);
  const weightB = (b.longevity ?? 5) + (b.sillage ?? 5);
  const [base, top] = weightA >= weightB ? [a, b] : [b, a];

  return {
    first: base.name,
    second: top.name,
    waitTime: '5–10 minutes',
    reason:
      `${base.name} is the heavier of the two, so it goes on skin first as the anchor. ` +
      `Letting it settle before applying ${top.name} stops the two openings colliding.`,
  };
}

function combineAccords(
  vectorA: Float64Array,
  vectorB: Float64Array,
): Array<{ label: string; weight: number }> {
  return CANONICAL_ACCORDS.map((accord, i) => ({
    label: ACCORD_LABELS[accord],
    weight: Number(((vectorA[i] + vectorB[i]) / 2).toFixed(3)),
  }))
    .filter((entry) => entry.weight > 0.05)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);
}

function describe(
  a: Fragrance,
  b: Fragrance,
  breakdown: { overlap: number; balance: number; anchor: number },
  verdict: LayerVerdict,
): string {
  if (verdict === 'Avoid' && breakdown.overlap > 0.85) {
    return (
      `${a.name} and ${b.name} are close enough that layering them changes almost nothing — ` +
      `you would be spending two fragrances to smell like one. Wear either on its own.`
    );
  }

  if (verdict === 'Avoid') {
    return (
      `These two pull against each other. ${a.name} and ${b.name} share little structural ` +
      `common ground, and without a shared base to hold them together the combination reads ` +
      `as two separate scents rather than one.`
    );
  }

  if (verdict === 'Interesting Contrast') {
    return (
      `An unusual pairing. ${a.name} and ${b.name} have little in common, which makes this a ` +
      `deliberate contrast rather than a blend — worth trying on a strip before committing to skin.`
    );
  }

  const anchorText =
    breakdown.anchor >= 0.5
      ? 'A shared base holds them together as they dry down'
      : 'They meet in the middle rather than the base, so the blend shifts over the first hour';

  return (
    `${a.name} and ${b.name} overlap enough to read as one composition while each still ` +
    `contributes something. ${anchorText}. Expect the combination to sit closer to ` +
    `${(a.sillage ?? 5) >= (b.sillage ?? 5) ? a.name : b.name} overall.`
  );
}

function resolveAccords(fragrance: Fragrance): Record<string, number> {
  return Object.keys(fragrance.accords).length > 0
    ? fragrance.accords
    : inferAccordsFromNotes(fragrance.notes);
}
