import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAiProvider, AiUnavailableError } from '@/lib/ai';
import { getFragranceRepository } from '@/lib/fragrance/repository';
import { enforceRateLimit } from '@/lib/http/guard';
import { fail, handleError, ok } from '@/lib/http/respond';

const requestSchema = z
  .object({
    /** Text lookup — no AI needed, works with zero configuration. */
    description: z.string().min(1).max(200).optional(),
    /** Raw base64, no data-URI prefix. Requires a configured AI provider. */
    imageBase64: z.string().min(1).optional(),
    mimeType: z
      .enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
      .optional(),
  })
  .refine((body) => body.description || body.imageBase64, {
    message: 'Provide either a description or an image',
  })
  .refine((body) => !body.imageBase64 || body.mimeType, {
    message: 'mimeType is required when sending an image',
  });

export async function POST(request: NextRequest) {
  try {
    const body = requestSchema.parse(await request.json());
    const repository = getFragranceRepository();

    // ─── Text path: pure catalogue search, no vendor, no cost. ───
    if (!body.imageBase64) {
      const limited = enforceRateLimit(request, 'engine');
      if (limited) return limited;

      const [match] = await repository.search({
        q: body.description!,
        limit: 1,
      });

      if (!match) {
        return fail(
          'fragrance_not_found',
          `Nothing in the catalogue matches "${body.description}".`,
          404,
        );
      }

      return ok({ fragrance: match, method: 'catalogue-search' as const });
    }

    // ─── Image path: needs a vision model. ───
    const limited = enforceRateLimit(request, 'ai');
    if (limited) return limited;

    const provider = getAiProvider();
    if (!provider) throw new AiUnavailableError('Photo identification');

    const identification = await provider.identifyBottle(
      body.imageBase64,
      body.mimeType!,
    );

    // Ground the model's guess against the catalogue. The catalogue record
    // is authoritative for notes and accords — we never let the model's
    // recollection of a note pyramid into the data layer.
    const [match] = await repository.search({
      q: `${identification.brand} ${identification.name}`,
      limit: 1,
    });

    return ok({
      identification,
      fragrance: match ?? null,
      method: 'vision' as const,
      /** True when the model named something we have real data for. */
      grounded: Boolean(match),
    });
  } catch (error) {
    return handleError(error, 'snap');
  }
}
