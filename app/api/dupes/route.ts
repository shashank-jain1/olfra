import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { DupeShieldEngine, summariseReport } from '@/lib/engines/dupeshield';
import { getFragranceRepository } from '@/lib/fragrance/repository';
import { enforceRateLimit } from '@/lib/http/guard';
import { handleError, ok } from '@/lib/http/respond';

const querySchema = z.object({
  q: z.string().min(1, 'Search for a fragrance by name').max(120),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, 'engine');
  if (limited) return limited;

  try {
    const { q, limit } = querySchema.parse({
      q: request.nextUrl.searchParams.get('q') ?? '',
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    const engine = new DupeShieldEngine(getFragranceRepository());
    const report = await engine.findDupesByQuery(q, { limit });

    return ok({
      ...report,
      summary: summariseReport(report.original, report.matches),
    });
  } catch (error) {
    return handleError(error, 'dupes');
  }
}
