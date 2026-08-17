// ─────────────────────────────────────────────────────────────
// OLFRA™ — ScentDNA engine
//
// Turns six answers into a stable skin-behaviour profile. Pure function:
// no I/O, no randomness, no clock. Same answers → same profile, forever.
// ─────────────────────────────────────────────────────────────

import { ACCORD_LABELS, type CanonicalAccord } from '../../fragrance/accords';
import { accumulateEffects } from './rules';
import { DNA_QUESTIONS, isComplete, type DnaAnswers } from './questions';

export * from './questions';
export { DNA_RULES } from './rules';

export interface FamilyAffinity {
  accord: CanonicalAccord;
  label: string;
  /** -1..1. */
  affinity: number;
  reason: string;
}

export interface DnaProfile {
  /** 0..100. How favourable this skin is for fragrance performance overall. */
  skinChemistryScore: number;
  /** Signed percentage string, e.g. "+22%". */
  longevityModifier: string;
  longevityExplanation: string;
  projectionProfile: 'Soft' | 'Moderate' | 'Medium-High' | 'Powerful';
  projectionExplanation: string;
  /** Best-performing accords, strongest first. */
  bestFamilies: FamilyAffinity[];
  /** Accords that underperform, worst first. */
  worstFamilies: FamilyAffinity[];
  signatureAccords: string[];
  headline: string;
  skinInsight: string;
  applicationTip: string;
  /** Factors that fed the score, for the methodology disclosure. */
  methodology: {
    weightedFactors: string[];
    unweightedFactors: string[];
  };
}

export class IncompleteAnswersError extends Error {
  constructor(readonly missing: string[]) {
    super(`ScentDNA needs all questions answered. Missing: ${missing.join(', ')}`);
    this.name = 'IncompleteAnswersError';
  }
}

export function computeDnaProfile(answers: DnaAnswers): DnaProfile {
  if (!isComplete(answers)) {
    throw new IncompleteAnswersError(
      DNA_QUESTIONS.filter((q) => !answers[q.id]).map((q) => q.id),
    );
  }

  const effects = accumulateEffects(answers);

  const longevityPercent = Math.round(effects.longevity * 100);
  const projection = projectionBand(effects.projection);

  const ranked = Object.entries(effects.accords)
    .map(([accord, affinity]) => ({
      accord: accord as CanonicalAccord,
      label: ACCORD_LABELS[accord as CanonicalAccord],
      affinity: affinity ?? 0,
    }))
    .sort((a, b) => b.affinity - a.affinity);

  const bestFamilies = ranked
    .filter((entry) => entry.affinity > 0.15)
    .slice(0, 3)
    .map((entry) => ({ ...entry, reason: reasonFor(entry.accord, entry.affinity, answers) }));

  const worstFamilies = ranked
    .filter((entry) => entry.affinity < -0.15)
    .slice(-3)
    .reverse()
    .map((entry) => ({ ...entry, reason: reasonFor(entry.accord, entry.affinity, answers) }));

  return {
    skinChemistryScore: computeScore(effects.longevity, effects.projection),
    longevityModifier: formatSigned(longevityPercent),
    longevityExplanation: longevityExplanation(answers, longevityPercent),
    projectionProfile: projection,
    projectionExplanation: projectionExplanation(answers, projection),
    bestFamilies,
    worstFamilies,
    signatureAccords: bestFamilies.map((entry) => entry.label).slice(0, 5),
    headline: buildHeadline(answers, projection),
    skinInsight: buildInsight(answers, longevityPercent, projection),
    applicationTip: buildApplicationTip(answers),
    methodology: {
      weightedFactors: DNA_QUESTIONS.filter((q) => q.evidence !== 'anecdotal').map(
        (q) => q.question,
      ),
      unweightedFactors: DNA_QUESTIONS.filter((q) => q.evidence === 'anecdotal').map(
        (q) => q.question,
      ),
    },
  };
}

// ─── derivations ─────────────────────────────────────────────

/**
 * A single 0-100 figure for "how well does fragrance behave on this skin".
 * Centred on 65 so an average profile scores average, not mediocre — and
 * capped well short of 100 because no questionnaire earns that confidence.
 */
function computeScore(longevity: number, projection: number): number {
  const raw = 65 + longevity * 45 + projection * 15;
  return Math.round(Math.min(94, Math.max(28, raw)));
}

function projectionBand(value: number): DnaProfile['projectionProfile'] {
  if (value >= 0.35) return 'Powerful';
  if (value >= 0.15) return 'Medium-High';
  if (value >= -0.1) return 'Moderate';
  return 'Soft';
}

function formatSigned(percent: number): string {
  return percent >= 0 ? `+${percent}%` : `${percent}%`;
}

function longevityExplanation(answers: DnaAnswers, percent: number): string {
  const drivers: string[] = [];

  if (answers.skin_type === 'Oily') drivers.push('sebum-rich skin acting as a natural fixative');
  if (answers.skin_type === 'Dry') drivers.push('low sebum giving aromatic molecules little to bind to');
  if (answers.body_heat === 'I run warm' || answers.body_heat === 'I sweat easily') {
    drivers.push('elevated skin temperature accelerating evaporation');
  }
  if (answers.body_heat === 'I run cool') drivers.push('cooler skin slowing the burn-off rate');
  if (answers.climate === 'Hot & arid') drivers.push('dry heat stripping the top and heart faster');

  const direction = percent >= 0 ? 'above' : 'below';
  const driverText = drivers.length > 0 ? drivers.join(' and ') : 'your reported profile';

  return `Expect longevity roughly ${Math.abs(percent)}% ${direction} a fragrance's stated performance, driven by ${driverText}.`;
}

function projectionExplanation(
  answers: DnaAnswers,
  band: DnaProfile['projectionProfile'],
): string {
  if (band === 'Powerful') {
    return 'Your skin temperature and climate push molecules outward hard — apply less than the bottle suggests, not more.';
  }
  if (band === 'Medium-High') {
    return 'Fragrance carries a comfortable arm’s-length distance on you without dominating a room.';
  }
  if (band === 'Soft') {
    return answers.body_heat === 'I run cool'
      ? 'Cooler skin keeps scent close. This reads as intimate rather than weak — but loud fragrances will land quieter than intended.'
      : 'Scent stays close to the skin. Layering or a higher concentration will do more for you than extra sprays.';
  }
  return 'Projection sits near the average — most fragrances will behave roughly as described.';
}

function buildHeadline(
  answers: DnaAnswers,
  projection: DnaProfile['projectionProfile'],
): string {
  const climate = answers.climate ?? 'Temperate';
  const character =
    answers.skin_type === 'Oily'
      ? 'Amplifying'
      : answers.skin_type === 'Dry'
        ? 'Fast-Burning'
        : 'Balanced';
  return `${climate} · ${character} · ${projection} Projector`;
}

function buildInsight(
  answers: DnaAnswers,
  percent: number,
  projection: DnaProfile['projectionProfile'],
): string {
  const base =
    answers.skin_type === 'Oily'
      ? 'Your skin holds fragrance unusually well — heavier, resinous compositions get room to develop rather than collapsing.'
      : answers.skin_type === 'Dry'
        ? 'Your skin releases fragrance quickly, so light and citrus-led compositions can disappear before they properly open.'
        : 'Your skin sits close to the reference profile most fragrances are formulated against.';

  const second =
    projection === 'Powerful' || projection === 'Medium-High'
      ? 'Combined with your projection, restraint in application will serve you better than reaching for stronger scents.'
      : 'Reach for higher concentrations rather than more sprays when you want more presence.';

  return `${base} ${second} Expect roughly ${formatSigned(percent)} against stated longevity.`;
}

function buildApplicationTip(answers: DnaAnswers): string {
  if (answers.skin_type === 'Dry') {
    return 'Apply to unscented moisturiser first — hydrated skin gives fragrance something to hold onto, and this alone can add an hour or two. Favour pulse points over clothing.';
  }
  if (answers.body_heat === 'I sweat easily') {
    return 'Spray onto clothing or hair rather than warm pulse points, which will amplify the base past where you want it. Two sprays will read like four on someone else.';
  }
  if (answers.body_heat === 'I run cool') {
    return 'Use warm pulse points deliberately — inner wrists, behind the ears, the base of the throat. Your skin needs the heat to lift the composition.';
  }
  return 'Apply to inner wrists and the base of the throat, and do not rub — friction shatters the top notes and shortens the whole arc.';
}

function reasonFor(
  accord: CanonicalAccord,
  affinity: number,
  answers: DnaAnswers,
): string {
  const label = ACCORD_LABELS[accord];

  if (affinity > 0) {
    if (answers.skin_type === 'Oily' && ['amber', 'oud', 'woody', 'vanilla'].includes(accord)) {
      return `${label} compositions bind well to sebum-rich skin, so they develop fully instead of flashing off.`;
    }
    if (answers.climate === 'Warm & humid' && ['aquatic', 'citrus', 'green', 'ozonic'].includes(accord)) {
      return `Humidity carries ${label.toLowerCase()} accords further, and they stay comfortable when heavier scents would not.`;
    }
    if (answers.climate === 'Cold & dry') {
      return `Cold air suppresses diffusion, which gives dense ${label.toLowerCase()} compositions the space they need.`;
    }
    return `${label} accords sit well with your reported skin and climate profile.`;
  }

  if (answers.skin_type === 'Dry' && ['citrus', 'aquatic', 'green'].includes(accord)) {
    return `${label} notes are the most volatile in a composition — on low-sebum skin they burn off first.`;
  }
  if (answers.body_heat === 'I sweat easily' && ['animalic', 'gourmand'].includes(accord)) {
    return `Heat and moisture amplify ${label.toLowerCase()} accords quickly, usually past where you want them.`;
  }
  return `${label} accords tend to underperform on this combination of skin and climate.`;
}
