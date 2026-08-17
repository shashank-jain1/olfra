// ─────────────────────────────────────────────────────────────
// OLFRA™ — ScentDNA store
//
// One home for the computed profile. Previously two competing stores held
// it (`useUserStore.dnaProfile` and `useDNAStore.profile`), neither was
// written to, and no page read either — so the profile could never reach
// ScentMoment or the social feed.
//
// Persisted locally; syncs to `dna_profiles` once auth lands.
// ─────────────────────────────────────────────────────────────

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DnaAnswers, DnaProfile } from '@/lib/engines/dna';

interface DnaState {
  answers: DnaAnswers;
  profile: DnaProfile | null;
  computedAt: string | null;

  setAnswer: (questionId: string, answer: string) => void;
  setProfile: (profile: DnaProfile) => void;
  reset: () => void;
}

export const useDnaStore = create<DnaState>()(
  persist(
    (set) => ({
      answers: {},
      profile: null,
      computedAt: null,

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),

      setProfile: (profile) =>
        set({ profile, computedAt: new Date().toISOString() }),

      reset: () => set({ answers: {}, profile: null, computedAt: null }),
    }),
    { name: 'olfra-dna', version: 2 },
  ),
);

/**
 * Affinity of a DNA profile for a named accord or family, 0..100.
 *
 * Used by the social feed and wardrobe to show "how well would this suit
 * me". Returns null when there is no profile — callers should hide the
 * badge rather than display a fabricated number.
 */
export function dnaAffinityFor(
  profile: DnaProfile | null,
  accordOrFamily: string,
): number | null {
  if (!profile) return null;

  const needle = accordOrFamily.toLowerCase();

  const best = profile.bestFamilies.find(
    (entry) =>
      entry.accord.toLowerCase().includes(needle) ||
      entry.label.toLowerCase().includes(needle) ||
      needle.includes(entry.label.toLowerCase()),
  );
  if (best) return Math.round(70 + best.affinity * 30);

  const worst = profile.worstFamilies.find(
    (entry) =>
      entry.accord.toLowerCase().includes(needle) ||
      entry.label.toLowerCase().includes(needle) ||
      needle.includes(entry.label.toLowerCase()),
  );
  if (worst) return Math.round(45 + worst.affinity * 30);

  // Known profile, unremarkable accord — a neutral, honest middle.
  return 62;
}
