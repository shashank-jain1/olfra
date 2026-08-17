// ─────────────────────────────────────────────────────────────
// OLFRA™ — ScentDNA scoring rules
//
// A lookup table, deliberately. Every rule is visible, adjustable, and
// produces the same output for the same answers — which an LLM could not
// promise, and which matters when a user retakes the quiz and expects
// their profile to be stable.
//
// Two independent outputs:
//   1. Performance modifiers — how long/loud fragrance runs on this skin.
//   2. Accord affinities — which accord families flatter or fight it.
// ─────────────────────────────────────────────────────────────

import type { CanonicalAccord } from '../../fragrance/accords';
import type { DnaAnswers, DnaQuestionId } from './questions';

/** Effect of one answer. Longevity/projection are multiplicative deltas. */
export interface AnswerEffect {
  /** Added to the longevity multiplier. +0.2 means +20%. */
  longevity: number;
  /** Added to the projection multiplier. */
  projection: number;
  /** Accord affinity deltas, -1..1. Positive means it performs well. */
  accords: Partial<Record<CanonicalAccord, number>>;
}

const NEUTRAL: AnswerEffect = { longevity: 0, projection: 0, accords: {} };

type RuleTable = Record<DnaQuestionId, Record<string, AnswerEffect>>;

export const DNA_RULES: RuleTable = {
  // Sebum as fixative: the best-supported factor we have.
  skin_type: {
    Dry: {
      longevity: -0.25,
      projection: -0.1,
      // Dry skin burns through volatile top notes; heavy bases survive.
      accords: { citrus: -0.4, aquatic: -0.35, green: -0.3, amber: 0.2, oud: 0.2, resinous: 0.25 },
    },
    Normal: NEUTRAL,
    Combination: {
      longevity: 0.05,
      projection: 0,
      accords: {},
    },
    Oily: {
      longevity: 0.25,
      projection: 0.1,
      // Oil holds heavy molecules well but can push sweet accords cloying.
      accords: { amber: 0.35, oud: 0.3, woody: 0.25, vanilla: 0.2, gourmand: -0.15, aquatic: 0.1 },
    },
  },

  // Skin temperature drives evaporation rate.
  body_heat: {
    'I run cool': {
      longevity: 0.15,
      projection: -0.2,
      accords: { citrus: 0.2, aquatic: 0.25, green: 0.2, ozonic: 0.2, oud: -0.15, 'warm-spicy': -0.1 },
    },
    Average: NEUTRAL,
    'I run warm': {
      longevity: -0.1,
      projection: 0.25,
      accords: { 'warm-spicy': 0.3, amber: 0.25, oud: 0.2, tobacco: 0.2, aquatic: -0.2 },
    },
    'I sweat easily': {
      longevity: -0.2,
      projection: 0.3,
      // Heat plus moisture amplifies animalic and heavy sweet accords,
      // often past where the wearer wants them.
      accords: { animalic: -0.35, gourmand: -0.3, 'warm-spicy': -0.15, aquatic: 0.3, citrus: 0.25, ozonic: 0.3 },
    },
  },

  climate: {
    'Cold & dry': {
      longevity: 0.1,
      projection: -0.25,
      // Cold air suppresses diffusion — heavy scents get room to work.
      accords: { amber: 0.3, oud: 0.3, resinous: 0.25, gourmand: 0.25, tobacco: 0.2, aquatic: -0.3, citrus: -0.2 },
    },
    Temperate: NEUTRAL,
    'Warm & humid': {
      longevity: -0.1,
      projection: 0.3,
      accords: { aquatic: 0.35, citrus: 0.3, green: 0.25, ozonic: 0.3, amber: -0.25, gourmand: -0.3, oud: -0.2 },
    },
    'Hot & arid': {
      longevity: -0.2,
      projection: 0.15,
      accords: { citrus: 0.25, woody: 0.2, aromatic: 0.25, oud: 0.15, gourmand: -0.25, aquatic: 0.1 },
    },
  },

  // Self-reported history — our strongest single predictor.
  longevity: {
    'Under 2 hours': { longevity: -0.35, projection: -0.1, accords: { citrus: -0.3, aquatic: -0.3, amber: 0.25, oud: 0.25 } },
    '2–4 hours': { longevity: -0.15, projection: 0, accords: { amber: 0.1, woody: 0.1 } },
    '4–6 hours': NEUTRAL,
    '6+ hours': { longevity: 0.3, projection: 0.1, accords: { citrus: 0.2, aquatic: 0.2, green: 0.15 } },
  },

  // Real mechanism (skin pH, sebum composition), small and noisy effect —
  // so the weights here are deliberately modest.
  diet: {
    'Plant-based': { longevity: 0, projection: -0.05, accords: { green: 0.15, aquatic: 0.1, animalic: -0.1 } },
    Mediterranean: NEUTRAL,
    'Meat-heavy': { longevity: 0.05, projection: 0.05, accords: { animalic: 0.15, leather: 0.1, citrus: 0.05 } },
    'Spicy & rich': { longevity: 0.05, projection: 0.1, accords: { 'warm-spicy': 0.15, animalic: 0.1, aquatic: -0.05 } },
  },

  // No established mechanism. Deliberately zero-weight — see questions.ts.
  // Kept as a question because removing it mid-flow would invalidate saved
  // profiles; kept at zero because inventing an effect would be dishonest.
  skin_tone: {
    'Very fair': NEUTRAL,
    'Fair–medium': NEUTRAL,
    'Medium–olive': NEUTRAL,
    Deep: NEUTRAL,
  },
};

/** Sum the effects of every answered question. Unknown answers are ignored. */
export function accumulateEffects(answers: DnaAnswers): AnswerEffect {
  const total: AnswerEffect = { longevity: 0, projection: 0, accords: {} };

  for (const [questionId, answer] of Object.entries(answers)) {
    if (!answer) continue;
    const effect = DNA_RULES[questionId as DnaQuestionId]?.[answer];
    if (!effect) continue;

    total.longevity += effect.longevity;
    total.projection += effect.projection;

    for (const [accord, delta] of Object.entries(effect.accords)) {
      const key = accord as CanonicalAccord;
      total.accords[key] = (total.accords[key] ?? 0) + (delta ?? 0);
    }
  }

  return total;
}
