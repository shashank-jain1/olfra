// ─────────────────────────────────────────────────────────────
// OLFRA™ — Note → accord inference
//
// Most fragrance data sources publish a note pyramid but no accord weights.
// This module derives accords from notes so every record lands in the same
// vector space, whether it came from our DB, Fragella, or a seed fixture.
//
// Tier weighting is the important part: base notes dominate the drydown,
// and the drydown is what makes two fragrances read as "the same thing".
// A shared citrus top note means far less than a shared amberwood base.
// ─────────────────────────────────────────────────────────────

import type { AccordWeights, NotePyramid } from './types';
import type { CanonicalAccord } from './accords';

/** How much each pyramid tier contributes to the accord profile. */
export const TIER_WEIGHTS = {
  top: 0.4,
  heart: 0.7,
  base: 1.0,
} as const;

/** Note substring → accords it contributes to, with relative strength. */
const NOTE_ACCORD_MAP: Array<[string, Partial<Record<CanonicalAccord, number>>]> = [
  // ─── Citrus ───
  ['bergamot', { citrus: 1, 'fresh-spicy': 0.2 }],
  ['lemon', { citrus: 1 }],
  ['grapefruit', { citrus: 1, fruity: 0.3 }],
  ['orange', { citrus: 1, sweet: 0.2 }],
  ['mandarin', { citrus: 1, sweet: 0.3 }],
  ['neroli', { citrus: 0.6, 'white-floral': 0.7 }],
  ['petitgrain', { citrus: 0.7, green: 0.5 }],
  ['lime', { citrus: 1, green: 0.2 }],
  ['yuzu', { citrus: 1, fruity: 0.2 }],

  // ─── Spice ───
  ['pink pepper', { 'fresh-spicy': 1, fruity: 0.2 }],
  ['sichuan pepper', { 'fresh-spicy': 1 }],
  ['black pepper', { 'fresh-spicy': 0.8, 'warm-spicy': 0.4 }],
  ['pepper', { 'fresh-spicy': 0.8 }],
  ['cardamom', { 'fresh-spicy': 0.8, aromatic: 0.3 }],
  ['ginger', { 'fresh-spicy': 0.9 }],
  ['cinnamon', { 'warm-spicy': 1, sweet: 0.3 }],
  ['clove', { 'warm-spicy': 1 }],
  ['nutmeg', { 'warm-spicy': 0.9 }],
  ['saffron', { 'warm-spicy': 0.8, leather: 0.4 }],
  ['cumin', { 'warm-spicy': 0.8, animalic: 0.5 }],

  // ─── Woods ───
  ['sandalwood', { woody: 1, powdery: 0.3, balsamic: 0.2 }],
  ['cedar', { woody: 1, earthy: 0.2 }],
  ['cedarwood', { woody: 1, earthy: 0.2 }],
  ['vetiver', { woody: 0.7, earthy: 0.8, green: 0.4 }],
  ['patchouli', { earthy: 0.9, woody: 0.5, mossy: 0.3 }],
  ['oud', { oud: 1, woody: 0.6, animalic: 0.4, smoky: 0.3 }],
  ['agarwood', { oud: 1, woody: 0.6, animalic: 0.4 }],
  ['guaiac', { woody: 0.8, smoky: 0.6 }],
  ['hinoki', { woody: 1, green: 0.3 }],
  ['cypress', { woody: 0.7, green: 0.5, aromatic: 0.3 }],
  ['amberwood', { amber: 0.9, woody: 0.8 }],
  ['ambroxan', { amber: 1, musky: 0.5, woody: 0.4 }],
  ['ambrox', { amber: 1, musky: 0.5 }],
  ['iso e super', { woody: 0.8, musky: 0.4 }],
  ['birch', { smoky: 0.8, leather: 0.6, woody: 0.4 }],

  // ─── Amber / resins / balsams ───
  ['amber', { amber: 1, sweet: 0.3, balsamic: 0.4 }],
  ['ambergris', { amber: 0.8, musky: 0.7, animalic: 0.4 }],
  ['labdanum', { amber: 0.8, balsamic: 0.7, resinous: 0.6 }],
  ['benzoin', { balsamic: 1, sweet: 0.5, vanilla: 0.3 }],
  ['myrrh', { resinous: 1, balsamic: 0.6, smoky: 0.3 }],
  ['frankincense', { resinous: 1, smoky: 0.6 }],
  ['incense', { smoky: 0.9, resinous: 0.8 }],
  ['olibanum', { resinous: 1, smoky: 0.5 }],
  ['elemi', { resinous: 0.8, citrus: 0.3 }],
  ['fir', { resinous: 0.7, green: 0.6, aromatic: 0.4 }],
  ['styrax', { balsamic: 0.9, smoky: 0.4 }],

  // ─── Florals ───
  ['jasmine', { 'white-floral': 1, floral: 0.6, animalic: 0.2 }],
  ['tuberose', { 'white-floral': 1, floral: 0.6 }],
  ['gardenia', { 'white-floral': 1, floral: 0.5 }],
  ['orange blossom', { 'white-floral': 1, citrus: 0.3 }],
  ['ylang', { 'white-floral': 0.9, floral: 0.5, sweet: 0.3 }],
  ['lily of the valley', { floral: 0.9, green: 0.4 }],
  ['muguet', { floral: 0.9, green: 0.4 }],
  ['rose', { rose: 1, floral: 0.7 }],
  ['damask', { rose: 1, floral: 0.7 }],
  ['geranium', { rose: 0.5, floral: 0.6, green: 0.4, aromatic: 0.3 }],
  ['iris', { iris: 1, powdery: 0.8, floral: 0.4 }],
  ['orris', { iris: 1, powdery: 0.8 }],
  ['violet', { floral: 0.7, powdery: 0.6, green: 0.3 }],
  ['lavender', { aromatic: 1, herbal: 0.6, floral: 0.3 }],
  ['peony', { floral: 0.9, fruity: 0.3 }],
  ['magnolia', { floral: 0.8, 'white-floral': 0.5, citrus: 0.2 }],
  ['freesia', { floral: 0.8, green: 0.3 }],

  // ─── Fruit ───
  ['apple', { fruity: 1, green: 0.3 }],
  ['pear', { fruity: 1 }],
  ['peach', { fruity: 1, sweet: 0.4 }],
  ['blackcurrant', { fruity: 1, green: 0.3 }],
  ['cassis', { fruity: 1, green: 0.3 }],
  ['raspberry', { fruity: 1, sweet: 0.4 }],
  ['pineapple', { fruity: 1, sweet: 0.4 }],
  ['fig', { fruity: 0.8, green: 0.5, coconut: 0.2 }],
  ['plum', { fruity: 1, sweet: 0.4 }],
  ['lychee', { fruity: 1, floral: 0.3 }],
  ['berry', { fruity: 1, sweet: 0.3 }],

  // ─── Gourmand / sweet ───
  ['vanilla', { vanilla: 1, sweet: 0.7, gourmand: 0.5 }],
  ['tonka', { vanilla: 0.7, sweet: 0.6, gourmand: 0.5, balsamic: 0.4 }],
  ['caramel', { gourmand: 1, sweet: 0.9 }],
  ['chocolate', { gourmand: 1, sweet: 0.7 }],
  ['cocoa', { gourmand: 1, earthy: 0.3 }],
  ['coffee', { gourmand: 0.9, earthy: 0.4, smoky: 0.3 }],
  ['honey', { sweet: 0.9, animalic: 0.4, gourmand: 0.5 }],
  ['almond', { gourmand: 0.8, sweet: 0.5, powdery: 0.3 }],
  ['praline', { gourmand: 1, sweet: 0.8 }],
  ['sugar', { sweet: 1, gourmand: 0.6 }],
  ['coconut', { coconut: 1, sweet: 0.5, gourmand: 0.3 }],

  // ─── Green / herbal / aromatic ───
  ['mint', { herbal: 1, green: 0.5, aromatic: 0.4 }],
  ['basil', { herbal: 1, aromatic: 0.6, green: 0.4 }],
  ['sage', { herbal: 1, aromatic: 0.7 }],
  ['rosemary', { herbal: 1, aromatic: 0.7 }],
  ['thyme', { herbal: 1, aromatic: 0.6 }],
  ['juniper', { herbal: 0.8, aromatic: 0.6, green: 0.4 }],
  ['galbanum', { green: 1, herbal: 0.5 }],
  ['grass', { green: 1 }],
  ['tea', { green: 0.7, aromatic: 0.4 }],
  ['tomato leaf', { green: 1, herbal: 0.4 }],
  ['bamboo', { green: 0.8, aquatic: 0.3 }],

  // ─── Aquatic / ozonic ───
  ['sea', { aquatic: 1, ozonic: 0.5 }],
  ['marine', { aquatic: 1, ozonic: 0.5 }],
  ['calone', { aquatic: 1, ozonic: 0.6 }],
  ['salt', { aquatic: 0.7, ozonic: 0.4, musky: 0.3 }],
  ['water', { aquatic: 0.9, ozonic: 0.4 }],
  ['rain', { ozonic: 1, aquatic: 0.5 }],
  ['air', { ozonic: 1 }],

  // ─── Musk / powder / animalic ───
  ['musk', { musky: 1, powdery: 0.3 }],
  ['white musk', { musky: 1, powdery: 0.4, sweet: 0.2 }],
  ['civet', { animalic: 1, musky: 0.6 }],
  ['castoreum', { animalic: 1, leather: 0.6 }],
  ['heliotrope', { powdery: 1, sweet: 0.4, vanilla: 0.3 }],
  ['aldehyde', { aldehydic: 1, powdery: 0.5, musky: 0.3 }],

  // ─── Leather / smoke / tobacco / moss ───
  ['leather', { leather: 1, animalic: 0.4 }],
  ['suede', { leather: 0.9, powdery: 0.3 }],
  ['tobacco', { tobacco: 1, sweet: 0.3, gourmand: 0.2 }],
  ['smoke', { smoky: 1 }],
  ['tar', { smoky: 1, leather: 0.5 }],
  ['oakmoss', { mossy: 1, earthy: 0.6, green: 0.4 }],
  ['moss', { mossy: 1, earthy: 0.5 }],
  ['soil', { earthy: 1 }],
  ['metal', { metallic: 1 }],
];

/** Longest-first so "orange blossom" wins over "orange", "white musk" over "musk". */
const SORTED_NOTE_MAP = [...NOTE_ACCORD_MAP].sort(
  (a, b) => b[0].length - a[0].length,
);

/** Accord contributions for a single note string. Empty when unrecognised. */
export function accordsForNote(
  note: string,
): Partial<Record<CanonicalAccord, number>> {
  const haystack = note.trim().toLowerCase();
  if (!haystack) return {};

  for (const [needle, accords] of SORTED_NOTE_MAP) {
    if (haystack.includes(needle)) return accords;
  }
  return {};
}

/**
 * Derive accord weights from a note pyramid, weighting base > heart > top.
 * Returns raw (un-normalised) weights — `toAccordVector` normalises.
 */
export function inferAccordsFromNotes(pyramid: NotePyramid): AccordWeights {
  const weights: AccordWeights = {};

  for (const tier of ['top', 'heart', 'base'] as const) {
    const tierWeight = TIER_WEIGHTS[tier];

    for (const note of pyramid[tier] ?? []) {
      for (const [accord, strength] of Object.entries(accordsForNote(note))) {
        weights[accord] = (weights[accord] ?? 0) + strength * tierWeight;
      }
    }
  }

  return weights;
}

/** How many of a pyramid's notes we could map — a data-quality signal. */
export function noteCoverage(pyramid: NotePyramid): number {
  const all = [...pyramid.top, ...pyramid.heart, ...pyramid.base];
  if (all.length === 0) return 0;
  const matched = all.filter(
    (note) => Object.keys(accordsForNote(note)).length > 0,
  ).length;
  return matched / all.length;
}
