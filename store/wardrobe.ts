// ─────────────────────────────────────────────────────────────
// OLFRA™ — Wardrobe store
//
// Local-first: the wardrobe works with no account, persisted to
// localStorage. When Supabase auth lands, this same shape syncs to
// `wardrobe_items` — the component API does not change.
//
// Replaces the previous setup where the page imported this store and then
// ignored it, keeping three mock bottles in component state that reset on
// every refresh and could not be added to.
// ─────────────────────────────────────────────────────────────

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WardrobeBottle {
  id: string;
  /** Links to the catalogue when the bottle was added from search. */
  fragranceId?: string;
  name: string;
  brand: string;
  concentration?: string;
  family?: string;
  bottleSizeMl?: number;
  purchasePrice?: number;
  notes?: string;
  addedAt: string;
}

export type NewBottle = Omit<WardrobeBottle, 'id' | 'addedAt'>;

interface WardrobeState {
  bottles: WardrobeBottle[];
  addBottle: (bottle: NewBottle) => void;
  removeBottle: (id: string) => void;
  updateBottle: (id: string, patch: Partial<NewBottle>) => void;
  clear: () => void;
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set) => ({
      bottles: [],

      addBottle: (bottle) =>
        set((state) => ({
          bottles: [
            {
              ...bottle,
              id:
                typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `bottle-${Date.now()}-${state.bottles.length}`,
              addedAt: new Date().toISOString(),
            },
            ...state.bottles,
          ],
        })),

      removeBottle: (id) =>
        set((state) => ({
          bottles: state.bottles.filter((bottle) => bottle.id !== id),
        })),

      updateBottle: (id, patch) =>
        set((state) => ({
          bottles: state.bottles.map((bottle) =>
            bottle.id === id ? { ...bottle, ...patch } : bottle,
          ),
        })),

      clear: () => set({ bottles: [] }),
    }),
    { name: 'olfra-wardrobe', version: 2 },
  ),
);

// ─── derived selectors ───────────────────────────────────────
//
// Kept as plain functions rather than store methods so they never trigger
// a re-render subscription of their own.

export function totalInvested(bottles: WardrobeBottle[]): number {
  return bottles.reduce((sum, bottle) => sum + (bottle.purchasePrice ?? 0), 0);
}

export function countByFamily(
  bottles: WardrobeBottle[],
): Array<{ family: string; count: number }> {
  const counts = new Map<string, number>();

  for (const bottle of bottles) {
    const family = bottle.family?.trim() || 'Uncategorised';
    counts.set(family, (counts.get(family) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([family, count]) => ({ family, count }))
    .sort((a, b) => b.count - a.count);
}
