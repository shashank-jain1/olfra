// ─────────────────────────────────────────────────────────────
// OLFRA™ — Composite repository
//
// Implements the "own DB primary, Fragella fills the gaps" strategy:
//
//   1. Ask the primary (our Postgres). If it answers, we're done — free,
//      fast, no rate limit.
//   2. On a miss, ask the fallback (Fragella).
//   3. Write anything the fallback found back into the primary, so the
//      same lookup never costs a second upstream call.
//
// Fallback failures are contained: a Fragella outage or exhausted quota
// degrades results, it never fails the request.
// ─────────────────────────────────────────────────────────────

import type { Fragrance, FragranceSearchQuery } from '../types';
import { isWritable, type FragranceRepository } from './port';

export interface CompositeOptions {
  /** Called when the fallback is used or fails. Wire to your logger. */
  onEvent?: (event: CompositeEvent) => void;
}

export type CompositeEvent =
  | { type: 'fallback-hit'; operation: string; count: number }
  | { type: 'fallback-error'; operation: string; error: string }
  | { type: 'cache-write'; count: number }
  | { type: 'cache-write-error'; error: string };

export class CompositeFragranceRepository implements FragranceRepository {
  readonly name: string;

  constructor(
    private readonly primary: FragranceRepository,
    private readonly fallback: FragranceRepository | null,
    private readonly options: CompositeOptions = {},
  ) {
    this.name = fallback
      ? `${primary.name}+${fallback.name}`
      : primary.name;
  }

  async search(query: FragranceSearchQuery): Promise<Fragrance[]> {
    const local = await this.primary.search(query);
    if (local.length > 0) return local;

    const remote = await this.viaFallback('search', (repo) =>
      repo.search(query),
    );
    if (remote.length > 0) await this.cache(remote);
    return remote;
  }

  async findById(id: string): Promise<Fragrance | null> {
    const local = await this.primary.findById(id);
    if (local) return local;

    const [remote] = await this.viaFallback('findById', async (repo) => {
      const found = await repo.findById(id);
      return found ? [found] : [];
    });

    if (remote) await this.cache([remote]);
    return remote ?? null;
  }

  async candidatesFor(
    fragrance: Fragrance,
    limit: number,
  ): Promise<Fragrance[]> {
    const local = await this.primary.candidatesFor(fragrance, limit);

    // Unlike search, a thin candidate pool is still worth topping up —
    // more candidates means better dupe coverage.
    if (local.length >= limit) return local;

    const remote = await this.viaFallback('candidatesFor', (repo) =>
      repo.candidatesFor(fragrance, limit - local.length),
    );
    if (remote.length > 0) await this.cache(remote);

    return dedupeById([...local, ...remote]).slice(0, limit);
  }

  private async viaFallback(
    operation: string,
    run: (repo: FragranceRepository) => Promise<Fragrance[]>,
  ): Promise<Fragrance[]> {
    if (!this.fallback) return [];

    try {
      const results = await run(this.fallback);
      this.options.onEvent?.({
        type: 'fallback-hit',
        operation,
        count: results.length,
      });
      return results;
    } catch (error) {
      // Contained on purpose: a degraded result beats a failed request.
      this.options.onEvent?.({
        type: 'fallback-error',
        operation,
        error: (error as Error).message,
      });
      return [];
    }
  }

  private async cache(fragrances: Fragrance[]): Promise<void> {
    if (!isWritable(this.primary)) return;

    try {
      await this.primary.upsert(fragrances);
      this.options.onEvent?.({ type: 'cache-write', count: fragrances.length });
    } catch (error) {
      // A failed write-back is not worth failing a successful read over.
      this.options.onEvent?.({
        type: 'cache-write-error',
        error: (error as Error).message,
      });
    }
  }
}

function dedupeById(fragrances: Fragrance[]): Fragrance[] {
  const seen = new Set<string>();
  return fragrances.filter((fragrance) => {
    if (seen.has(fragrance.id)) return false;
    seen.add(fragrance.id);
    return true;
  });
}
