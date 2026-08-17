// ─────────────────────────────────────────────────────────────
// OLFRA™ — Generative AI port
//
// The deterministic engines cover DupeShield, ScentDNA, ScentMoment and
// ScentLayer completely. Only two jobs genuinely need a language model,
// and both are isolated behind this interface:
//
//   1. identifyBottle  — reading a fragrance from a photo (vision)
//   2. writeEditorial  — turning computed trend stats into prose
//
// Everything else in the product works with this provider absent. That is
// deliberate: no API key, no signup, no per-request cost for core features.
// ─────────────────────────────────────────────────────────────

export interface BottleIdentification {
  name: string;
  brand: string;
  year?: number;
  concentration?: string;
  confidence: 'high' | 'medium' | 'low';
  /** Why the model landed here — shown to the user alongside the guess. */
  reasoning: string;
}

/** Computed inputs for the editorial. The model writes prose ABOUT these
 *  numbers — it never invents them, which is what keeps the column honest. */
export interface EditorialInput {
  weekOf: string;
  risingNotes: Array<{ name: string; changePercent: number }>;
  fallingNotes: Array<{ name: string; changePercent: number }>;
  topRegion?: { name: string; trend: string };
  totalEvents: number;
}

export interface Editorial {
  paragraphs: string[];
  pullQuote: string;
}

export interface AiProvider {
  readonly name: string;

  /** @param imageBase64 Raw base64, no data-URI prefix. */
  identifyBottle(
    imageBase64: string,
    mimeType: string,
  ): Promise<BottleIdentification>;

  writeEditorial(input: EditorialInput): Promise<Editorial>;
}

/** Thrown when a feature needs a provider and none is configured. */
export class AiUnavailableError extends Error {
  readonly code = 'ai_unavailable';

  constructor(feature: string) {
    super(
      `${feature} needs a generative AI provider. Set GEMINI_API_KEY to enable it — ` +
        'every other OLFRA feature works without one.',
    );
    this.name = 'AiUnavailableError';
  }
}

/** Thrown when the provider replies with something unusable. */
export class AiResponseError extends Error {
  readonly code = 'ai_response_invalid';

  constructor(message: string) {
    super(message);
    this.name = 'AiResponseError';
  }
}
