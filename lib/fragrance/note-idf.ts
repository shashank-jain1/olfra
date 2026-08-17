// ─────────────────────────────────────────────────────────────
// OLFRA™ — Note rarity weighting (inverse document frequency)
//
// Without this, DupeShield rewards notes that appear in nearly everything.
// Cedar, musk and vanilla are in a large share of the catalogue, so two
// unrelated fragrances "share" them and score far too high — in testing,
// Chanel No. 5 came back as a 62% match for Creed Aventus purely on shared
// musk, oakmoss and vanilla.
//
// IDF fixes that by scoring a shared note in proportion to how rare it is:
// sharing Ambroxan says something; sharing Cedar says almost nothing.
// ─────────────────────────────────────────────────────────────

import type { Fragrance } from './types';

export type NoteIdf = Map<string, number>;

/** Weight applied to notes absent from the corpus — treated as rare. */
const UNKNOWN_NOTE_IDF = 1.5;

export function normaliseNoteKey(note: string): string {
  return note.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Build IDF weights from a corpus.
 *
 * Standard smoothed IDF: ln(N / (1 + df)) + 1, floored at a small positive
 * value so a note present in every record still contributes a little rather
 * than being cancelled out entirely.
 */
export function buildNoteIdf(corpus: Fragrance[]): NoteIdf {
  const documentFrequency = new Map<string, number>();

  for (const fragrance of corpus) {
    const unique = new Set(
      [
        ...fragrance.notes.top,
        ...fragrance.notes.heart,
        ...fragrance.notes.base,
      ].map(normaliseNoteKey),
    );

    for (const note of unique) {
      documentFrequency.set(note, (documentFrequency.get(note) ?? 0) + 1);
    }
  }

  const total = Math.max(1, corpus.length);
  const idf: NoteIdf = new Map();

  for (const [note, frequency] of documentFrequency) {
    idf.set(note, Math.max(0.15, Math.log(total / (1 + frequency)) + 1));
  }

  return idf;
}

export function idfFor(idf: NoteIdf | undefined, note: string): number {
  if (!idf) return 1;
  return idf.get(normaliseNoteKey(note)) ?? UNKNOWN_NOTE_IDF;
}

/**
 * IDF-weighted Jaccard: shared rare notes count for more than shared
 * common ones, on both the intersection and the union.
 */
export function weightedNoteOverlap(
  a: string[],
  b: string[],
  idf?: NoteIdf,
): number {
  const setA = new Set(a.map(normaliseNoteKey).filter(Boolean));
  const setB = new Set(b.map(normaliseNoteKey).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionWeight = 0;
  let unionWeight = 0;

  for (const note of new Set([...setA, ...setB])) {
    const weight = idfFor(idf, note);
    unionWeight += weight;
    if (setA.has(note) && setB.has(note)) intersectionWeight += weight;
  }

  return unionWeight === 0 ? 0 : intersectionWeight / unionWeight;
}

/** Shared notes ordered by rarity — the most informative overlaps first. */
export function rankedSharedNotes(
  a: string[],
  b: string[],
  idf?: NoteIdf,
): string[] {
  const setB = new Set(b.map(normaliseNoteKey));
  const seen = new Set<string>();

  return a
    .filter((note) => {
      const key = normaliseNoteKey(note);
      if (!setB.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((x, y) => idfFor(idf, y) - idfFor(idf, x));
}
