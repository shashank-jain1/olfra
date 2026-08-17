// ─────────────────────────────────────────────────────────────
// OLFRA™ — Accord taxonomy & vectorisation
//
// The canonical accord list defines a fixed vector space. Every fragrance
// maps into the same dimensions in the same order, which is what makes
// cosine similarity meaningful across the catalogue.
//
// Adding an accord is a breaking change for any persisted vector: append
// only, never reorder, and bump ACCORD_SPACE_VERSION so stored vectors can
// be recomputed.
// ─────────────────────────────────────────────────────────────

export const ACCORD_SPACE_VERSION = 1;

/** Fixed dimension order. APPEND ONLY — see note above. */
export const CANONICAL_ACCORDS = [
  'citrus',
  'fresh-spicy',
  'warm-spicy',
  'woody',
  'amber',
  'floral',
  'white-floral',
  'rose',
  'iris',
  'sweet',
  'vanilla',
  'gourmand',
  'fruity',
  'green',
  'aromatic',
  'herbal',
  'aquatic',
  'ozonic',
  'musky',
  'powdery',
  'leather',
  'smoky',
  'animalic',
  'earthy',
  'balsamic',
  'resinous',
  'oud',
  'tobacco',
  'coconut',
  'aldehydic',
  'mossy',
  'metallic',
] as const;

export type CanonicalAccord = (typeof CANONICAL_ACCORDS)[number];

export const ACCORD_DIMENSIONS = CANONICAL_ACCORDS.length;

const ACCORD_INDEX = new Map<string, number>(
  CANONICAL_ACCORDS.map((accord, i) => [accord, i]),
);

/** Human-facing labels for UI. */
export const ACCORD_LABELS: Record<CanonicalAccord, string> = {
  citrus: 'Citrus',
  'fresh-spicy': 'Fresh Spicy',
  'warm-spicy': 'Warm Spicy',
  woody: 'Woody',
  amber: 'Amber',
  floral: 'Floral',
  'white-floral': 'White Floral',
  rose: 'Rose',
  iris: 'Iris',
  sweet: 'Sweet',
  vanilla: 'Vanilla',
  gourmand: 'Gourmand',
  fruity: 'Fruity',
  green: 'Green',
  aromatic: 'Aromatic',
  herbal: 'Herbal',
  aquatic: 'Aquatic',
  ozonic: 'Ozonic',
  musky: 'Musky',
  powdery: 'Powdery',
  leather: 'Leather',
  smoky: 'Smoky',
  animalic: 'Animalic',
  earthy: 'Earthy',
  balsamic: 'Balsamic',
  resinous: 'Resinous',
  oud: 'Oud',
  tobacco: 'Tobacco',
  coconut: 'Coconut',
  aldehydic: 'Aldehydic',
  mossy: 'Mossy',
  metallic: 'Metallic',
};

export function isCanonicalAccord(value: string): value is CanonicalAccord {
  return ACCORD_INDEX.has(value);
}

/** Loose input (`"Fresh Spicy"`, `"fresh_spicy"`) → canonical slug, or null. */
export function normaliseAccordKey(raw: string): CanonicalAccord | null {
  const slug = raw.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return isCanonicalAccord(slug) ? slug : null;
}

/**
 * Build an L2-normalised dense vector from accord weights.
 *
 * L2 normalisation is what lets cosine similarity compare a fragrance with
 * three strong accords against one with eight faint ones — it measures the
 * *direction* of the scent profile, not how many accords were tagged.
 */
export function toAccordVector(accords: Record<string, number>): Float64Array {
  const vector = new Float64Array(ACCORD_DIMENSIONS);

  for (const [rawKey, rawWeight] of Object.entries(accords)) {
    const key = normaliseAccordKey(rawKey);
    if (key === null) continue;
    const weight = Number(rawWeight);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    vector[ACCORD_INDEX.get(key)!] += weight;
  }

  let sumOfSquares = 0;
  for (const value of vector) sumOfSquares += value * value;

  if (sumOfSquares === 0) return vector; // no usable accords — caller decides
  const magnitude = Math.sqrt(sumOfSquares);
  for (let i = 0; i < vector.length; i++) vector[i] /= magnitude;

  return vector;
}

/** Vector → sorted accord weights, for display and explanations. */
export function topAccords(
  vector: Float64Array,
  count = 3,
): Array<{ accord: CanonicalAccord; label: string; weight: number }> {
  return Array.from(vector)
    .map((weight, i) => ({
      accord: CANONICAL_ACCORDS[i],
      label: ACCORD_LABELS[CANONICAL_ACCORDS[i]],
      weight,
    }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count);
}
