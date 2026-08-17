// ─────────────────────────────────────────────────────────────
// OLFRA™ — ScentMoment engine
//
// Blends occasion, mood, time of day and weather into one target accord
// profile, then ranks the catalogue against it. Optionally weights the
// result by the wearer's ScentDNA affinities, so the same occasion gives
// different answers to different skin.
// ─────────────────────────────────────────────────────────────

import {
  ACCORD_LABELS,
  CANONICAL_ACCORDS,
  type CanonicalAccord,
} from '../../fragrance/accords';
import { inferAccordsFromNotes } from '../../fragrance/note-accords';
import { toAccordVector } from '../../fragrance/accords';
import type { Fragrance } from '../../fragrance/types';
import type { FragranceRepository } from '../../fragrance/repository/port';
import type { DnaProfile } from '../dna';
import {
  MOODS,
  OCCASION_BY_ID,
  TIMES_OF_DAY,
  WEATHERS,
  type ContextProfile,
} from './occasions';

export * from './occasions';

/** How much each context dimension shapes the target profile. */
const CONTEXT_WEIGHTS = {
  occasion: 1.0,
  mood: 0.6,
  time: 0.5,
  weather: 0.8,
  dna: 0.5,
} as const;

export interface MomentRequest {
  occasionId: string;
  mood: string;
  time: string;
  weather: string;
  /** Desired wear time in hours, 2..12. */
  longevityHours: number;
  /** Optional — personalises ranking to the wearer's skin. */
  dna?: DnaProfile | null;
}

export interface MomentRecommendation {
  fragrance: Fragrance;
  /** 0..100 fit against the blended context. */
  fit: number;
  whyItFits: string;
  longevityFit: 'excellent' | 'good' | 'borderline';
}

export interface MomentResult {
  primary: MomentRecommendation;
  alternatives: MomentRecommendation[];
  occasionInsight: string;
  whatToAvoid: string;
  applicationTip: string;
  /** Accords the blended context asked for, strongest first. */
  targetAccords: Array<{ label: string; weight: number }>;
}

export class NoMomentMatchError extends Error {
  constructor() {
    super('No fragrance in the catalogue fits this combination');
    this.name = 'NoMomentMatchError';
  }
}

export class MomentEngine {
  constructor(private readonly repository: FragranceRepository) {}

  async recommend(request: MomentRequest): Promise<MomentResult> {
    const occasion = OCCASION_BY_ID.get(request.occasionId);
    if (!occasion) {
      throw new Error(`Unknown occasion: ${request.occasionId}`);
    }

    const target = blendProfiles([
      [occasion.profile, CONTEXT_WEIGHTS.occasion],
      [MOODS[request.mood], CONTEXT_WEIGHTS.mood],
      [TIMES_OF_DAY[request.time], CONTEXT_WEIGHTS.time],
      [WEATHERS[request.weather], CONTEXT_WEIGHTS.weather],
      [dnaToProfile(request.dna), CONTEXT_WEIGHTS.dna],
    ]);

    // A broad pull: the target profile is synthetic, so there is no single
    // "query fragrance" to search by — we score whatever the catalogue has.
    const candidates = await this.repository.search({ q: '', limit: 200 });
    if (candidates.length === 0) throw new NoMomentMatchError();

    const ranked = candidates
      .map((fragrance) => ({
        fragrance,
        fit: scoreFit(fragrance, target, occasion.profile),
        longevityFit: longevityFit(fragrance, request.longevityHours),
      }))
      .sort((a, b) => b.fit - a.fit);

    const [best, ...rest] = ranked;
    if (!best) throw new NoMomentMatchError();

    const targetAccords = topTargetAccords(target);

    return {
      primary: {
        fragrance: best.fragrance,
        fit: best.fit,
        longevityFit: best.longevityFit,
        whyItFits: explainFit(best.fragrance, targetAccords, occasion.profile.guidance),
      },
      alternatives: rest.slice(0, 2).map((entry) => ({
        fragrance: entry.fragrance,
        fit: entry.fit,
        longevityFit: entry.longevityFit,
        whyItFits: explainFit(entry.fragrance, targetAccords),
      })),
      occasionInsight: occasion.profile.guidance ?? '',
      whatToAvoid: occasion.avoid,
      applicationTip: applicationTip(request, occasion.profile),
      targetAccords,
    };
  }
}

// ─── scoring ─────────────────────────────────────────────────

type TargetProfile = Partial<Record<CanonicalAccord, number>>;

function blendProfiles(
  inputs: Array<[ContextProfile | undefined | null, number]>,
): TargetProfile {
  const blended: TargetProfile = {};

  for (const [profile, weight] of inputs) {
    if (!profile) continue;
    for (const [accord, value] of Object.entries(profile.accords)) {
      const key = accord as CanonicalAccord;
      blended[key] = (blended[key] ?? 0) + (value ?? 0) * weight;
    }
  }

  return blended;
}

function dnaToProfile(dna: DnaProfile | null | undefined): ContextProfile | null {
  if (!dna) return null;

  const accords: TargetProfile = {};
  for (const entry of dna.bestFamilies) accords[entry.accord] = entry.affinity;
  for (const entry of dna.worstFamilies) accords[entry.accord] = entry.affinity;

  return { accords };
}

/**
 * Dot product of the fragrance's accord vector against the target, plus a
 * sillage-appropriateness term. Returns 0..100.
 */
function scoreFit(
  fragrance: Fragrance,
  target: TargetProfile,
  occasionProfile: ContextProfile,
): number {
  const accords =
    Object.keys(fragrance.accords).length > 0
      ? fragrance.accords
      : inferAccordsFromNotes(fragrance.notes);
  const vector = toAccordVector(accords);

  let alignment = 0;
  let targetMagnitude = 0;

  for (let i = 0; i < CANONICAL_ACCORDS.length; i++) {
    const desired = target[CANONICAL_ACCORDS[i]] ?? 0;
    alignment += vector[i] * desired;
    targetMagnitude += Math.abs(desired);
  }

  // Normalise into 0..1. Alignment can be negative when a fragrance leans
  // hard into accords the context wants to avoid.
  const normalised =
    targetMagnitude === 0 ? 0.5 : (alignment / targetMagnitude + 1) / 2;

  return Math.round(
    Math.min(100, Math.max(0, normalised * 100 * sillagePenalty(fragrance, occasionProfile))),
  );
}

/** 0..1 multiplier. Exceeding a hard sillage ceiling is punished sharply. */
function sillagePenalty(
  fragrance: Fragrance,
  profile: ContextProfile,
): number {
  if (typeof fragrance.sillage !== 'number') return 1;

  if (profile.maxSillage && fragrance.sillage > profile.maxSillage) {
    const excess = fragrance.sillage - profile.maxSillage;
    return Math.max(0.35, 1 - excess * 0.18);
  }

  if (profile.idealSillage) {
    const distance = Math.abs(fragrance.sillage - profile.idealSillage);
    return Math.max(0.7, 1 - distance * 0.05);
  }

  return 1;
}

function longevityFit(
  fragrance: Fragrance,
  desiredHours: number,
): MomentRecommendation['longevityFit'] {
  if (typeof fragrance.longevity !== 'number') return 'good';

  // Rough mapping: a 1-10 longevity rating spans about 2-12 hours of wear.
  const estimatedHours = 2 + (fragrance.longevity - 1) * (10 / 9);
  const shortfall = desiredHours - estimatedHours;

  if (shortfall <= 0) return 'excellent';
  if (shortfall <= 2) return 'good';
  return 'borderline';
}

// ─── explanation ─────────────────────────────────────────────

function topTargetAccords(
  target: TargetProfile,
): Array<{ label: string; weight: number }> {
  return Object.entries(target)
    .filter(([, weight]) => (weight ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 4)
    .map(([accord, weight]) => ({
      label: ACCORD_LABELS[accord as CanonicalAccord],
      weight: Number((weight ?? 0).toFixed(2)),
    }));
}

function explainFit(
  fragrance: Fragrance,
  targetAccords: Array<{ label: string }>,
  guidance?: string,
): string {
  const accords =
    Object.keys(fragrance.accords).length > 0
      ? fragrance.accords
      : inferAccordsFromNotes(fragrance.notes);

  const present = topTargetAccords(accords as TargetProfile)
    .map((entry) => entry.label.toLowerCase())
    .filter((label) =>
      targetAccords.some((target) => target.label.toLowerCase() === label),
    );

  const lead =
    present.length > 0
      ? `Its ${present.slice(0, 2).join(' and ')} character is exactly what this combination calls for.`
      : `Its profile sits closest to what this combination calls for.`;

  return guidance ? `${lead} ${guidance}` : lead;
}

function applicationTip(
  request: MomentRequest,
  profile: ContextProfile,
): string {
  if (profile.maxSillage && profile.maxSillage <= 4) {
    return 'One spray, to clothing rather than skin. You want it findable at conversation distance and invisible beyond that.';
  }
  if (request.weather === 'Hot & Humid') {
    return 'Apply to cooler points — inner elbows, the back of the neck — rather than the throat. Heat there will push it too hard.';
  }
  if (request.longevityHours >= 8) {
    return 'Apply to moisturised skin and consider a light re-application after six hours; nothing survives a full day at full strength.';
  }
  return 'Two sprays to the inner wrists and one to the base of the throat. Let it settle for ten minutes before judging it.';
}
