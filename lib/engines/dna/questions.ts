// ─────────────────────────────────────────────────────────────
// OLFRA™ — ScentDNA questionnaire
//
// Lives in the domain layer, not the page component, so the engine, the
// API route, and any future native client all read the same definition.
//
// `evidence` records how well-supported each factor actually is. It drives
// the disclosure shown under the result — a profiler that quietly presents
// folklore as chemistry is not something we want to ship.
// ─────────────────────────────────────────────────────────────

export type DnaQuestionId =
  | 'skin_type'
  | 'body_heat'
  | 'climate'
  | 'diet'
  | 'skin_tone'
  | 'longevity';

export type EvidenceLevel = 'established' | 'plausible' | 'anecdotal';

export interface DnaQuestion {
  id: DnaQuestionId;
  question: string;
  emoji: string;
  options: readonly string[];
  /** Strength of the mechanism linking this factor to fragrance behaviour. */
  evidence: EvidenceLevel;
  /** Shown in the methodology disclosure. */
  rationale: string;
}

export const DNA_QUESTIONS: readonly DnaQuestion[] = [
  {
    id: 'skin_type',
    question: 'What is your skin type?',
    emoji: '💧',
    options: ['Dry', 'Normal', 'Combination', 'Oily'],
    evidence: 'established',
    rationale:
      'Sebum acts as a fixative — oil-rich skin holds aromatic molecules longer, so the same ' +
      'fragrance measurably outlasts its performance on dry skin.',
  },
  {
    id: 'body_heat',
    question: 'How would you describe your body heat?',
    emoji: '🌡️',
    options: ['I run cool', 'Average', 'I run warm', 'I sweat easily'],
    evidence: 'established',
    rationale:
      'Skin temperature drives evaporation rate. Warmer skin pushes volatile top notes out ' +
      'faster — bigger projection early, shorter overall wear.',
  },
  {
    id: 'climate',
    question: 'What climate do you live in?',
    emoji: '🌍',
    options: ['Cold & dry', 'Temperate', 'Warm & humid', 'Hot & arid'],
    evidence: 'established',
    rationale:
      'Humidity carries scent molecules through air; heat accelerates their release. Both ' +
      'change how far a fragrance travels and how long it reads on skin.',
  },
  {
    id: 'longevity',
    question: 'How long do fragrances usually last on you?',
    emoji: '⏱️',
    options: ['Under 2 hours', '2–4 hours', '4–6 hours', '6+ hours'],
    evidence: 'established',
    rationale:
      'Your own observed history is the single most predictive input here — it already ' +
      'reflects every variable we cannot measure directly.',
  },
  {
    id: 'diet',
    question: 'What best describes your diet?',
    emoji: '🥗',
    options: ['Plant-based', 'Mediterranean', 'Meat-heavy', 'Spicy & rich'],
    evidence: 'plausible',
    rationale:
      'Diet influences skin pH and sebum composition, which can shift how a drydown reads. ' +
      'The mechanism is real but the effect size in everyday wear is small and poorly quantified.',
  },
  {
    id: 'skin_tone',
    question: 'What is your skin tone?',
    emoji: '✨',
    options: ['Very fair', 'Fair–medium', 'Medium–olive', 'Deep'],
    evidence: 'anecdotal',
    rationale:
      'Widely repeated in fragrance communities, but there is no established mechanism by ' +
      'which melanin alters fragrance chemistry. We collect it for completeness and give it ' +
      'no weight in your score.',
  },
] as const;

export const DNA_QUESTION_COUNT = DNA_QUESTIONS.length;

export type DnaAnswers = Partial<Record<DnaQuestionId, string>>;

export function isComplete(answers: DnaAnswers): boolean {
  return DNA_QUESTIONS.every((question) => Boolean(answers[question.id]));
}
