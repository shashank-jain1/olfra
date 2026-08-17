import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getFragranceRepository } from '@/lib/fragrance/repository';
import { enforceRateLimit } from '@/lib/http/guard';
import { handleError, ok } from '@/lib/http/respond';

const querySchema = z.object({
  q: z.string().max(120).default(''),
  limit: z.coerce.number().int().min(1).max(25).default(10),
});

/** Catalogue search — powers autocomplete across the app. */
export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, 'engine');
  if (limited) return limited;

  try {
    const { q, limit } = querySchema.parse({
      q: request.nextUrl.searchParams.get('q') ?? '',
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    const repository = getFragranceRepository();
    const results = await repository.search({ q, limit });

    return ok({ results, source: repository.name });
  } catch (error) {
    return handleError(error, 'fragrances');
  }
}
