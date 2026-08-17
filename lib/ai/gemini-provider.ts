// ─────────────────────────────────────────────────────────────
// OLFRA™ — Gemini provider
//
// SERVER-ONLY. Uses structured output (responseSchema) so replies are
// parseable JSON by construction rather than by prompt-begging.
// ─────────────────────────────────────────────────────────────

import 'server-only';

import { GoogleGenAI, Type } from '@google/genai';
import {
  AiResponseError,
  type AiProvider,
  type BottleIdentification,
  type Editorial,
  type EditorialInput,
} from './port';

const MODEL = 'gemini-2.5-flash';

/** Base64 payload ceiling (~8MB raw). Guards cost and request limits. */
const MAX_IMAGE_BASE64_BYTES = 11_000_000;

export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GeminiProvider requires an API key');
    this.client = new GoogleGenAI({ apiKey });
  }

  async identifyBottle(
    imageBase64: string,
    mimeType: string,
  ): Promise<BottleIdentification> {
    if (imageBase64.length > MAX_IMAGE_BASE64_BYTES) {
      throw new AiResponseError('Image too large — please use one under ~8MB.');
    }

    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            {
              text:
                'Identify the fragrance in this bottle photo. Use the bottle shape, cap, ' +
                'label typography and any visible text. If you cannot identify it with ' +
                'confidence, set confidence to "low" and give your closest guess rather ' +
                'than refusing — the result is checked against a catalogue afterwards.',
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brand: { type: Type.STRING },
            year: { type: Type.INTEGER },
            concentration: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            reasoning: { type: Type.STRING },
          },
          required: ['name', 'brand', 'confidence', 'reasoning'],
        },
      },
    });

    return parseJson<BottleIdentification>(response.text, 'bottle identification');
  }

  async writeEditorial(input: EditorialInput): Promise<Editorial> {
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `Write this week's fragrance intelligence briefing (week of ${input.weekOf}).\n\n` +
                `These figures are computed from ${input.totalEvents} real user events. ` +
                `Write ONLY about them — do not introduce statistics, brands, or regional ` +
                `claims that are not in this data.\n\n` +
                `Rising: ${format(input.risingNotes)}\n` +
                `Falling: ${format(input.fallingNotes)}\n` +
                (input.topRegion
                  ? `Most active region: ${input.topRegion.name}, trending toward ${input.topRegion.trend}\n`
                  : '') +
                `\nThree paragraphs, max 220 words total. Authoritative and lightly ` +
                `editorial — a senior trade-publication editor. Flowing prose, no bullet ` +
                `points, no filler. Also give one short pull quote.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'You are a senior editor at a fragrance trade publication. You never invent ' +
          'statistics. Every number you cite must appear in the data you were given.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paragraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pullQuote: { type: Type.STRING },
          },
          required: ['paragraphs', 'pullQuote'],
        },
      },
    });

    return parseJson<Editorial>(response.text, 'editorial');
  }
}

function format(notes: Array<{ name: string; changePercent: number }>): string {
  if (notes.length === 0) return 'no significant movement';
  return notes
    .map((note) => `${note.name} ${note.changePercent >= 0 ? '+' : ''}${note.changePercent}%`)
    .join(', ');
}

function parseJson<T>(text: string | undefined, label: string): T {
  if (!text) throw new AiResponseError(`Gemini returned an empty ${label} response`);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiResponseError(
      `Gemini returned unparseable ${label} JSON: ${text.slice(0, 200)}`,
    );
  }
}
