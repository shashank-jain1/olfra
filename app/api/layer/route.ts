import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { scoreLayering } from '@/lib/engines/layer';
import { getFragranceRepository } from '@/lib/fragrance/repository';
import { FragranceNotFoundError } from '@/lib/engines/dupeshield';
import { enforceRateLimit } from '@/lib/http/guard';
import { handleError, ok } from '@/lib/http/respond';

const requestSchema = z.object({
  first: z.string().min(1).max(120),
  second: z.string().min(1).max(120),
});

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, 'engine');
  if (limited) return limited;

  try {
    const { first, second } = requestSchema.parse(await request.json());
    const repository = getFragranceRepository();

    const [a, b] = await Promise.all([
      repository.search({ q: first, limit: 1 }).then((results) => results[0]),
      repository.search({ q: second, limit: 1 }).then((results) => results[0]),
    ]);

    if (!a) throw new FragranceNotFoundError(first);
    if (!b) throw new FragranceNotFoundError(second);

    return ok({ first: a, second: b, ...scoreLayering(a, b) });
  } catch (error) {
    return handleError(error, 'layer');
  }
}
