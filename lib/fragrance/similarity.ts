// ─────────────────────────────────────────────────────────────
// OLFRA™ — Similarity math
//
// This is DupeShield's core. Pure functions over plain data: same inputs
// always produce the same score, which is the whole point — a dupe score
// that drifts between page loads is worthless to the person deciding
// whether to spend $300.
//
// Nothing here does I/O. Everything here is unit-testable.
// ─────────────────────────────────────────────────────────────

import type { Fragrance, NotePyramid } from './types';
import { toAccordVector } from './accords';
import { inferAccordsFromNotes } from './note-accords';
import {
  rankedSharedNotes,
  weightedNoteOverlap,
  type NoteIdf,
} from './note-idf';

/**
 * Relative contribution of each signal to the final dupe score.
 * Tuned so accord *shape* dominates while shared base notes — the drydown
 * you actually live with for six hours — carry real weight.
 * Must sum to 1.
 */
export const DUPE_WEIGHTS = {
  accordCosine: 0.62,
  baseNoteOverlap: 0.22,
  allNoteOverlap: 0.1,
  performance: 0.06,
} as const;

export interface DupeBreakdown {
  accordCosine: number;
  baseNoteOverlap: number;
  allNoteOverlap: number;
  performance: number;
}

export interface DupeScore {
  /** 0..100, rounded. */
  score: number;
  breakdown: DupeBreakdown;
  sharedNotes: string[];
  sharedAccords: string[];
}

/** Cosine similarity of two equal-length vectors. Returns 0..1. */
export function cosineSimilarity(a: Float64Array, b: Float64Array): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector dimension mismatch: ${a.length} vs ${b.length}. ` +
        'Both vectors must come from the same accord space version.',
    );
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (magA === 0 || magB === 0) return 0;

  const similarity = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  // Guard against tiny floating-point overshoot above 1.
  return Math.min(1, Math.max(0, similarity));
}

/** Jaccard index over normalised note names. Returns 0..1. */
export function noteOverlap(a: string[], b: string[]): number {
  const setA = normaliseNotes(a);
  const setB = normaliseNotes(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const note of setA) if (setB.has(note)) intersection++;

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Notes present in both, preserving the original casing from `a`. */
export function sharedNotes(a: string[], b: string[]): string[] {
  const setB = normaliseNotes(b);
  const seen = new Set<string>();

  return a.filter((note) => {
    const key = normaliseNote(note);
    if (!setB.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Closeness of longevity + sillage. Returns 0..1; 1 when both match exactly. */
export function performanceSimilarity(a: Fragrance, b: Fragrance): number {
  const pairs: Array<[number | undefined, number | undefined]> = [
    [a.longevity, b.longevity],
    [a.sillage, b.sillage],
  ];

  const known = pairs.filter(
    (pair): pair is [number, number] =>
      typeof pair[0] === 'number' && typeof pair[1] === 'number',
  );

  // Unknown performance is neutral, not a penalty — most catalogue records
  // are missing it, and absent data shouldn't look like a bad match.
  if (known.length === 0) return 0.5;

  const total = known.reduce(
    (sum, [x, y]) => sum + (1 - Math.abs(x - y) / 9),
    0,
  );
  return clamp01(total / known.length);
}

/** All notes in a pyramid, flattened. */
export function flattenNotes(pyramid: NotePyramid): string[] {
  return [...pyramid.top, ...pyramid.heart, ...pyramid.base];
}

/**
 * Score how well `candidate` duplicates `original`.
 *
 * Accords are used when a record carries them, and inferred from the note
 * pyramid otherwise, so records from different sources stay comparable.
 */
export function scoreDupe(
  original: Fragrance,
  candidate: Fragrance,
  /** Corpus note rarity. Omit and every note is weighted equally, which
   *  inflates scores for pairs that only share ubiquitous notes. */
  idf?: NoteIdf,
): DupeScore {
  const originalVector = resolveVector(original);
  const candidateVector = resolveVector(candidate);

  const breakdown: DupeBreakdown = {
    accordCosine: cosineSimilarity(originalVector, candidateVector),
    baseNoteOverlap: weightedNoteOverlap(
      original.notes.base,
      candidate.notes.base,
      idf,
    ),
    allNoteOverlap: weightedNoteOverlap(
      flattenNotes(original.notes),
      flattenNotes(candidate.notes),
      idf,
    ),
    performance: performanceSimilarity(original, candidate),
  };

  const weighted =
    breakdown.accordCosine * DUPE_WEIGHTS.accordCosine +
    breakdown.baseNoteOverlap * DUPE_WEIGHTS.baseNoteOverlap +
    breakdown.allNoteOverlap * DUPE_WEIGHTS.allNoteOverlap +
    breakdown.performance * DUPE_WEIGHTS.performance;

  return {
    score: Math.round(clamp01(weighted) * 100),
    breakdown,
    // Ranked by rarity so the UI leads with the informative overlaps
    // ("Ambroxan") rather than the filler ones ("Cedar").
    sharedNotes: rankedSharedNotes(
      flattenNotes(original.notes),
      flattenNotes(candidate.notes),
      idf,
    ),
    sharedAccords: sharedAccordLabels(original, candidate),
  };
}

// ─── internals ───────────────────────────────────────────────

function resolveVector(fragrance: Fragrance): Float64Array {
  const hasAccords = Object.keys(fragrance.accords ?? {}).length > 0;
  return toAccordVector(
    hasAccords ? fragrance.accords : inferAccordsFromNotes(fragrance.notes),
  );
}

function sharedAccordLabels(a: Fragrance, b: Fragrance): string[] {
  const accordsA = Object.keys(a.accords ?? {});
  const accordsB = new Set(Object.keys(b.accords ?? {}));
  return accordsA.filter((accord) => accordsB.has(accord));
}

function normaliseNote(note: string): string {
  return note.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normaliseNotes(notes: string[]): Set<string> {
  return new Set(notes.map(normaliseNote).filter(Boolean));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
