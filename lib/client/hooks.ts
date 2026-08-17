// ─────────────────────────────────────────────────────────────
// OLFRA™ — React Query hooks
//
// The QueryProvider has been wrapping the app since the first commit
// without a single query behind it. These are those queries: one hook per
// capability, so pages describe *what* they need and never manage loading
// or error state by hand.
// ─────────────────────────────────────────────────────────────

'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { DupeReport } from '../engines/dupeshield';
import type { DnaAnswers, DnaProfile } from '../engines/dna';
import type { MomentRequest, MomentResult } from '../engines/moment';
import type { LayerResult } from '../engines/layer';
import type { Fragrance } from '../fragrance/types';

// ─── Catalogue ───────────────────────────────────────────────

export interface SearchResponse {
  results: Fragrance[];
  source: string;
}

export function useFragranceSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['fragrances', query],
    queryFn: () =>
      api.get<SearchResponse>(
        `/api/fragrances?q=${encodeURIComponent(query)}&limit=8`,
      ),
    // Below two characters the result set is noise, not suggestions.
    enabled: enabled && query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── DupeShield ──────────────────────────────────────────────

export type DupeResponse = DupeReport & { summary: string };

export function useDupeSearch() {
  return useMutation({
    mutationFn: (query: string) =>
      api.get<DupeResponse>(`/api/dupes?q=${encodeURIComponent(query)}`),
  });
}

// ─── ScentDNA ────────────────────────────────────────────────

export function useComputeDna() {
  return useMutation({
    mutationFn: (answers: DnaAnswers) =>
      api.post<DnaProfile>('/api/dna', answers),
  });
}

// ─── ScentMoment ─────────────────────────────────────────────

export function useMomentRecommendation() {
  return useMutation({
    mutationFn: (request: MomentRequest) =>
      api.post<MomentResult>('/api/moment', request),
  });
}

// ─── ScentLayer ──────────────────────────────────────────────

export type LayerResponse = LayerResult & {
  first: Fragrance;
  second: Fragrance;
};

export function useLayerAnalysis() {
  return useMutation({
    mutationFn: (input: { first: string; second: string }) =>
      api.post<LayerResponse>('/api/layer', input),
  });
}

// ─── ScentSnap ───────────────────────────────────────────────

export type SnapResponse =
  | { method: 'catalogue-search'; fragrance: Fragrance }
  | {
      method: 'vision';
      identification: {
        name: string;
        brand: string;
        confidence: 'high' | 'medium' | 'low';
        reasoning: string;
      };
      fragrance: Fragrance | null;
      grounded: boolean;
    };

export function useSnapIdentify() {
  return useMutation({
    mutationFn: (
      input:
        | { description: string }
        | { imageBase64: string; mimeType: string },
    ) => api.post<SnapResponse>('/api/snap', input),
  });
}

// ─── Capabilities ────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  capabilities: {
    database: boolean;
    catalogueGapFill: boolean;
    generativeAi: boolean;
  };
  catalogue: { adapter: string; seedOnly: boolean };
  ai: { provider: string | null; gatedFeatures: string[] };
}

/** Lets the UI say precisely what is and isn't wired up. */
export function useCapabilities() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<HealthResponse>('/api/health'),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}
