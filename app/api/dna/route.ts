import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { computeDnaProfile, DNA_QUESTIONS } from '@/lib/engines/dna';
import { enforceRateLimit } from '@/lib/http/guard';
import { handleError, ok } from '@/lib/http/respond';

/** Answers must be one of the offered options — free text is rejected. */
const answersSchema = z.object(
  Object.fromEntries(
    DNA_QUESTIONS.map((question) => [
      question.id,
      z.enum(question.options as unknown as [string, ...string[]]),
    ]),
  ) as Record<string, z.ZodTypeAny>,
);

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, 'engine');
  if (limited) return limited;

  try {
    const answers = answersSchema.parse(await request.json());

    // Pure computation — no database, no vendor, no cost.
    return ok(computeDnaProfile(answers));
  } catch (error) {
    return handleError(error, 'dna');
  }
}

/** The questionnaire definition, so the client never hardcodes it. */
export async function GET() {
  return ok({ questions: DNA_QUESTIONS });
}
