// ─────────────────────────────────────────────────────────────
// OLFRA™ — Supabase repository (primary source)
//
// Reads the catalogue from our own Postgres, and uses pgvector to
// pre-filter dupe candidates by accord direction before the engine does
// the finer-grained scoring in Node.
// ─────────────────────────────────────────────────────────────

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Concentration, Fragrance, FragranceSearchQuery } from '../types';
import { toAccordVector, ACCORD_SPACE_VERSION } from '../accords';
import { inferAccordsFromNotes } from '../note-accords';
import type { WritableFragranceRepository } from './port';

const TABLE = 'fragrances';

/** Row shape as stored. Snake_case here, camelCase everywhere else. */
interface FragranceRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  year: number | null;
  concentration: string;
  family: string | null;
  top_notes: string[] | null;
  heart_notes: string[] | null;
  base_notes: string[] | null;
  accords: Record<string, number> | null;
  longevity: number | null;
  sillage: number | null;
  rating: number | null;
  price_usd: number | null;
  image_url: string | null;
  description: string | null;
  source: string;
}

export class SupabaseFragranceRepository implements WritableFragranceRepository {
  readonly name = 'supabase';

  constructor(private readonly client: SupabaseClient) {}

  async search({ q, limit = 10 }: FragranceSearchQuery): Promise<Fragrance[]> {
    const needle = q.trim();
    if (!needle) return [];

    // Escape PostgREST's `or` filter delimiters so a comma or paren in the
    // query can't break out of the expression.
    const safe = needle.replace(/[,()]/g, ' ');

    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .or(`name.ilike.%${safe}%,brand.ilike.%${safe}%`)
      .limit(limit);

    if (error) throw new Error(`Supabase search failed: ${error.message}`);
    return (data as FragranceRow[]).map(toDomain);
  }

  async findById(id: string): Promise<Fragrance | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) throw new Error(`Supabase lookup failed: ${error.message}`);
    return data ? toDomain(data as FragranceRow) : null;
  }

  async candidatesFor(
    fragrance: Fragrance,
    limit: number,
  ): Promise<Fragrance[]> {
    const vector = resolveVector(fragrance);

    const { data, error } = await this.client.rpc('match_fragrances', {
      query_vector: Array.from(vector),
      match_count: limit,
      exclude_id: fragrance.id,
    });

    if (error) throw new Error(`Supabase similarity search failed: ${error.message}`);
    return (data as FragranceRow[]).map(toDomain);
  }

  async upsert(fragrances: Fragrance[]): Promise<void> {
    if (fragrances.length === 0) return;

    const rows = fragrances.map(toRow);
    const { error } = await this.client
      .from(TABLE)
      .upsert(rows, { onConflict: 'id' });

    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

// ─── mapping ─────────────────────────────────────────────────

function toDomain(row: FragranceRow): Fragrance {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    year: row.year ?? undefined,
    concentration: (row.concentration as Concentration) ?? 'Unknown',
    family: row.family ?? undefined,
    notes: {
      top: row.top_notes ?? [],
      heart: row.heart_notes ?? [],
      base: row.base_notes ?? [],
    },
    accords: row.accords ?? {},
    longevity: row.longevity ?? undefined,
    sillage: row.sillage ?? undefined,
    rating: row.rating ?? undefined,
    priceUSD: row.price_usd ?? undefined,
    imageUrl: row.image_url ?? undefined,
    description: row.description ?? undefined,
    source: 'local',
  };
}

function toRow(fragrance: Fragrance) {
  const accords =
    Object.keys(fragrance.accords).length > 0
      ? fragrance.accords
      : inferAccordsFromNotes(fragrance.notes);

  return {
    id: fragrance.id,
    slug: fragrance.slug,
    name: fragrance.name,
    brand: fragrance.brand,
    year: fragrance.year ?? null,
    concentration: fragrance.concentration,
    family: fragrance.family ?? null,
    top_notes: fragrance.notes.top,
    heart_notes: fragrance.notes.heart,
    base_notes: fragrance.notes.base,
    accords,
    longevity: fragrance.longevity ?? null,
    sillage: fragrance.sillage ?? null,
    rating: fragrance.rating ?? null,
    price_usd: fragrance.priceUSD ?? null,
    image_url: fragrance.imageUrl ?? null,
    description: fragrance.description ?? null,
    source: fragrance.source,
    // Vector is computed on write so similarity search never has to.
    accord_vector: Array.from(toAccordVector(accords)),
    accord_space_version: ACCORD_SPACE_VERSION,
  };
}

function resolveVector(fragrance: Fragrance): Float64Array {
  const hasAccords = Object.keys(fragrance.accords ?? {}).length > 0;
  return toAccordVector(
    hasAccords ? fragrance.accords : inferAccordsFromNotes(fragrance.notes),
  );
}
