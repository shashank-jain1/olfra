// ─────────────────────────────────────────────────────────────
// OLFRA™ — HTTP response envelope
//
// One shape for every API response so the client can branch on `ok`
// without per-endpoint special cases, and one place that maps domain
// errors to status codes — route handlers stay thin.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AiUnavailableError, AiResponseError } from '../ai/port';
import { FragranceNotFoundError } from '../engines/dupeshield';
import { IncompleteAnswersError } from '../engines/dna';

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    /** Field-level detail for validation failures. */
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json<ApiFailure>(
    { ok: false, error: { code, message, details } },
    { status },
  );
}

/**
 * Map a thrown error to a response.
 *
 * Known domain errors get a specific code and status. Anything else is
 * logged server-side and returned as a generic 500 — internal messages
 * and stack traces must not reach the client.
 */
export function handleError(error: unknown, context: string): NextResponse {
  if (error instanceof ZodError) {
    return fail('invalid_request', 'Request validation failed', 400, error.issues);
  }

  if (error instanceof FragranceNotFoundError) {
    return fail(
      'fragrance_not_found',
      `We could not find "${error.query}" in the catalogue.`,
      404,
    );
  }

  if (error instanceof IncompleteAnswersError) {
    return fail('incomplete_answers', error.message, 400, {
      missing: error.missing,
    });
  }

  if (error instanceof AiUnavailableError) {
    return fail(error.code, error.message, 501);
  }

  if (error instanceof AiResponseError) {
    return fail(error.code, error.message, 502);
  }

  console.error(`[api:${context}]`, error);
  return fail(
    'internal_error',
    'Something went wrong on our side. Please try again.',
    500,
  );
}
