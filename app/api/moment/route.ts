import type { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  MomentEngine,
  MOODS,
  OCCASIONS,
  TIMES_OF_DAY,
  WEATHERS,
} from '@/lib/engines/moment';
import { getFragranceRepository } from '@/lib/fragrance/repository';
import { enforceRateLimit } from '@/lib/http/guard';
import { handleError, ok } from '@/lib/http/respond';

const requestSchema = z.object({
  occasionId: z.enum(
    OCCASIONS.map((occasion) => occasion.id) as [string, ...string[]],
  ),
  mood: z.enum(Object.keys(MOODS) as [string, ...string[]]),
  time: z.enum(Object.keys(TIMES_OF_DAY) as [string, ...string[]]),
  weather: z.enum(Object.keys(WEATHERS) as [string, ...string[]]),
  longevityHours: z.number().int().min(2).max(12),
  /** Optional ScentDNA profile — personalises the ranking when present. */
  dna: z.any().optional(),
});

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, 'engine');
  if (limited) return limited;

  try {
    const body = requestSchema.parse(await request.json());
    const engine = new MomentEngine(getFragranceRepository());

    return ok(await engine.recommend(body));
  } catch (error) {
    return handleError(error, 'moment');
  }
}

/** Option lists, so the UI renders from one source of truth. */
export async function GET() {
  return ok({
    occasions: OCCASIONS.map(({ id, label, emoji }) => ({ id, label, emoji })),
    moods: Object.keys(MOODS),
    times: Object.keys(TIMES_OF_DAY),
    weathers: Object.keys(WEATHERS),
  });
}
