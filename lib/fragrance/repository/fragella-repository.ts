// ─────────────────────────────────────────────────────────────
// OLFRA™ — Fragella repository (gap-fill source)
//
// SERVER-ONLY. The API key must never reach the browser; all access goes
// through our own route handlers.
//
// Fixes the previous integration, which called `/fragrances/search` with no
// auth header. Those paths return the marketing site's HTML with a 200, so
// `res.ok` passed, `res.json()` threw, and every lookup silently fell back
// to mock data — the integration had never worked.
//
// Verified against the published examples (2026-08):
//   GET /api/v1/fragrances?search=Sauvage&limit=1
//   GET /api/v1/fragrances/similar?name=Sauvage&limit=3
//   GET /api/v1/notes?search=Bergamot&limit=3
//   GET /api/v1/accords?search=Woody
//   GET /api/v1/brands/{brand}?limit=2
//   Auth: x-api-key header. Rate limit: 60 req/min.
// ─────────────────────────────────────────────────────────────

import 'server-only';

import type { Concentration, Fragrance, FragranceSearchQuery } from '../types';
import { TokenBucket } from '../../shared/rate-limit';
import type { FragranceRepository } from './port';

const FRAGELLA_BASE = 'https://api.fragella.com/api/v1';

/** Upstream allows 60/min; we stay just under to absorb clock skew. */
const limiter = TokenBucket.perWindow(55, 60_000);

export class FragellaUnavailableError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'FragellaUnavailableError';
  }
}

export class FragellaRepository implements FragranceRepository {
  readonly name = 'fragella';

  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('FragellaRepository requires an API key');
    }
  }

  async search({ q, limit = 10 }: FragranceSearchQuery): Promise<Fragrance[]> {
    const payload = await this.get('/fragrances', {
      search: q,
      limit: String(limit),
    });
    return extractList(payload).map(mapFragrance).filter(isUsable);
  }

  async findById(id: string): Promise<Fragrance | null> {
    const payload = await this.get(`/fragrances/${encodeURIComponent(id)}`, {});
    const [first] = extractList(payload).map(mapFragrance).filter(isUsable);
    return first ?? null;
  }

  async candidatesFor(
    fragrance: Fragrance,
    limit: number,
  ): Promise<Fragrance[]> {
    const payload = await this.get('/fragrances/similar', {
      name: fragrance.name,
      limit: String(limit),
    });
    return extractList(payload)
      .map(mapFragrance)
      .filter(isUsable)
      .filter((candidate) => candidate.id !== fragrance.id);
  }

  private async get(
    path: string,
    params: Record<string, string>,
  ): Promise<unknown> {
    const gate = limiter.take('fragella');
    if (!gate.allowed) {
      throw new FragellaUnavailableError(
        `Fragella rate limit reached; retry in ${gate.retryAfterMs}ms`,
        429,
      );
    }

    const url = new URL(`${FRAGELLA_BASE}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'x-api-key': this.apiKey, accept: 'application/json' },
        // Cache upstream responses; the catalogue barely changes hour to hour.
        next: { revalidate: 60 * 60 * 24 },
      });
    } catch (cause) {
      throw new FragellaUnavailableError(
        `Fragella request failed: ${(cause as Error).message}`,
      );
    }

    if (!response.ok) {
      throw new FragellaUnavailableError(
        `Fragella responded ${response.status}`,
        response.status,
      );
    }

    // The marketing site answers unknown paths with HTML and a 200, so a
    // successful status is not enough — check we actually got JSON.
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new FragellaUnavailableError(
        `Fragella returned ${contentType || 'unknown content-type'}, expected JSON. ` +
          'This usually means the endpoint path is wrong.',
      );
    }

    return response.json();
  }
}

// ─── mapping ─────────────────────────────────────────────────
//
// Deliberately tolerant: the exact field names are not published in full,
// and a shape change upstream should degrade to a partial record rather
// than crash a request. Anything unmappable is dropped by `isUsable`.

type Json = Record<string, unknown>;

function extractList(payload: unknown): Json[] {
  if (Array.isArray(payload)) return payload as Json[];
  if (!payload || typeof payload !== 'object') return [];

  const container = payload as Json;
  for (const key of ['data', 'fragrances', 'results', 'items']) {
    const value = container[key];
    if (Array.isArray(value)) return value as Json[];
  }

  // A single-object response.
  return container.name ? [container] : [];
}

function mapFragrance(raw: Json): Fragrance {
  const name = str(raw.name) ?? str(raw.fragrance) ?? '';
  const brand = str(raw.brand) ?? str(raw.designer) ?? str(raw.house) ?? '';
  const id =
    str(raw.id) ??
    str(raw._id) ??
    `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    id,
    slug: id,
    name,
    brand,
    year: num(raw.year) ?? num(raw.launchYear) ?? num(raw.launch_year),
    concentration: mapConcentration(
      str(raw.oilType) ?? str(raw.oil_type) ?? str(raw.concentration),
    ),
    family: str(raw.family) ?? str(raw.olfactiveFamily),
    notes: {
      top: strArray(raw.topNotes ?? raw.top_notes ?? nested(raw.notes, 'top')),
      heart: strArray(
        raw.heartNotes ??
          raw.heart_notes ??
          raw.middleNotes ??
          nested(raw.notes, 'heart') ??
          nested(raw.notes, 'middle'),
      ),
      base: strArray(
        raw.baseNotes ?? raw.base_notes ?? nested(raw.notes, 'base'),
      ),
    },
    accords: mapAccords(raw.accords),
    longevity: num(raw.longevity),
    sillage: num(raw.sillage),
    rating: num(raw.rating) ?? num(raw.userRating),
    priceUSD: num(raw.price) ?? num(raw.priceUSD),
    imageUrl: str(raw.image) ?? str(raw.imageUrl) ?? str(raw.transparentImage),
    description: str(raw.description),
    source: 'fragella',
  };
}

/** A record with no name or no notes cannot be scored — drop it. */
function isUsable(fragrance: Fragrance): boolean {
  const noteCount =
    fragrance.notes.top.length +
    fragrance.notes.heart.length +
    fragrance.notes.base.length;
  return Boolean(fragrance.name) && (noteCount > 0 || Object.keys(fragrance.accords).length > 0);
}

function mapConcentration(value: string | undefined): Concentration {
  const known: Concentration[] = ['Parfum', 'EDP', 'EDT', 'EDC', 'Extrait', 'Oil'];
  if (!value) return 'Unknown';
  const upper = value.trim().toUpperCase();
  return known.find((c) => c.toUpperCase() === upper) ?? 'Unknown';
}

/** Accepts `{woody: 45}`, `[{name, percent}]`, or `["woody"]`. */
function mapAccords(value: unknown): Record<string, number> {
  if (!value) return {};

  if (Array.isArray(value)) {
    const entries = value.map((item): [string, number] | null => {
      if (typeof item === 'string') return [item, 1];
      if (item && typeof item === 'object') {
        const record = item as Json;
        const key = str(record.name) ?? str(record.accord);
        if (!key) return null;
        return [key, num(record.percent) ?? num(record.weight) ?? 1];
      }
      return null;
    });
    return Object.fromEntries(entries.filter((e): e is [string, number] => e !== null));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Json)
      .map(([key, weight]): [string, number] | null => {
        const parsed = num(weight);
        return parsed === undefined ? null : [key, parsed];
      })
      .filter((e): e is [string, number] => e !== null);
    return Object.fromEntries(entries);
  }

  return {};
}

function nested(value: unknown, key: string): unknown {
  return value && typeof value === 'object' ? (value as Json)[key] : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function num(value: unknown): number | undefined {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      typeof item === 'string' ? item : str((item as Json)?.name),
    )
    .filter((item): item is string => Boolean(item));
}
