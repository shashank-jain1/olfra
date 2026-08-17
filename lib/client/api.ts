// ─────────────────────────────────────────────────────────────
// OLFRA™ — Typed API client
//
// One fetch wrapper that understands the { ok, data | error } envelope,
// so callers get either typed data or a typed ApiError — never a raw
// Response to unwrap by hand.
// ─────────────────────────────────────────────────────────────

import type { ApiResponse } from '../http/respond';

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True when the failure is the user's input rather than our fault. */
  get isUserFacing(): boolean {
    return this.status < 500;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(
      'network_error',
      'Could not reach the server. Check your connection and try again.',
      0,
    );
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'invalid_response',
      'The server returned an unexpected response.',
      response.status,
    );
  }

  if (!payload.ok) {
    throw new ApiError(
      payload.error.code,
      payload.error.message,
      response.status,
      payload.error.details,
    );
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
