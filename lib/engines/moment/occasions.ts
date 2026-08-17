// ─────────────────────────────────────────────────────────────
// OLFRA™ — Occasion, mood and context profiles
//
// Each context is expressed as accord preferences plus performance
// constraints. Recommending is then a matching problem: score every
// candidate against the combined target profile.
//
// Encoding these explicitly means the advice is auditable — you can read
// exactly why a job interview steers away from heavy gourmands.
// ─────────────────────────────────────────────────────────────

import type { CanonicalAccord } from '../../fragrance/accords';

export interface ContextProfile {
  /** Accord preferences, -1 (avoid) .. 1 (seek). */
  accords: Partial<Record<CanonicalAccord, number>>;
  /** Ideal sillage 1..10. Distance from this is penalised. */
  idealSillage?: number;
  /** Hard ceiling on sillage — exceeding it is heavily penalised. */
  maxSillage?: number;
  /** One-line rationale surfaced in the UI. */
  guidance?: string;
}

export interface Occasion {
  id: string;
  label: string;
  emoji: string;
  profile: ContextProfile;
  /** What to steer clear of, shown as "what to avoid". */
  avoid: string;
}

export const OCCASIONS: readonly Occasion[] = [
  {
    id: 'date-night',
    label: 'Date Night',
    emoji: '🌹',
    profile: {
      accords: { amber: 0.7, woody: 0.6, vanilla: 0.5, musky: 0.6, 'warm-spicy': 0.5, rose: 0.4, aquatic: -0.5, ozonic: -0.4 },
      idealSillage: 6,
      maxSillage: 8,
      guidance: 'Restraint reads as confidence. The aim is to be discovered at close range, not announced across a room.',
    },
    avoid: 'Aquatics and sharp green fougères — they signal daytime utility rather than evening intimacy.',
  },
  {
    id: 'interview',
    label: 'Job Interview',
    emoji: '💼',
    profile: {
      accords: { citrus: 0.6, woody: 0.5, aromatic: 0.5, musky: 0.4, green: 0.3, gourmand: -0.8, oud: -0.7, animalic: -0.9, 'warm-spicy': -0.4 },
      idealSillage: 3,
      maxSillage: 5,
      guidance: 'The goal is to be remembered for what you said. Anything detectable beyond a handshake is working against you.',
    },
    avoid: 'Gourmands, oud, and anything with real projection. Scent should not enter the room before your answers do.',
  },
  {
    id: 'wedding',
    label: 'Wedding Guest',
    emoji: '💍',
    profile: {
      accords: { floral: 0.6, 'white-floral': 0.5, woody: 0.5, amber: 0.4, iris: 0.4, powdery: 0.3, animalic: -0.5 },
      idealSillage: 6,
      maxSillage: 8,
      guidance: 'Elegant and warm, but never competing with the couple. Classic structures outperform statement scents here.',
    },
    avoid: 'Anything polarising or enormous — you are in close quarters with strangers for several hours.',
  },
  {
    id: 'night-out',
    label: 'Night Out',
    emoji: '🕺',
    profile: {
      accords: { sweet: 0.7, amber: 0.6, gourmand: 0.6, 'warm-spicy': 0.5, tobacco: 0.4, woody: 0.4, aquatic: -0.4 },
      idealSillage: 8,
      guidance: 'Loud is the point. You are competing with crowds, noise, and other people’s fragrance.',
    },
    avoid: 'Subtle skin scents — they will be completely lost in a crowded venue.',
  },
  {
    id: 'gym',
    label: 'Gym',
    emoji: '💪',
    profile: {
      accords: { citrus: 0.8, aquatic: 0.7, green: 0.6, ozonic: 0.6, aromatic: 0.4, gourmand: -0.9, amber: -0.7, oud: -0.8, animalic: -0.9 },
      idealSillage: 2,
      maxSillage: 4,
      guidance: 'Heat and sweat amplify everything. Clean and nearly-absent is the only safe brief.',
    },
    avoid: 'Anything sweet, heavy, or animalic — body heat will turn it into a problem for everyone nearby.',
  },
  {
    id: 'beach',
    label: 'Beach Day',
    emoji: '🏖️',
    profile: {
      accords: { aquatic: 0.8, coconut: 0.7, citrus: 0.6, ozonic: 0.5, green: 0.4, oud: -0.7, tobacco: -0.6, gourmand: -0.3 },
      idealSillage: 5,
      guidance: 'Solar and salt-adjacent profiles work with the setting instead of fighting it.',
    },
    avoid: 'Dense woods and smoky compositions — they read as wrong-season under strong sun.',
  },
  {
    id: 'work',
    label: 'Work',
    emoji: '🏢',
    profile: {
      accords: { citrus: 0.5, woody: 0.5, aromatic: 0.4, musky: 0.4, green: 0.3, gourmand: -0.5, animalic: -0.7, oud: -0.4 },
      idealSillage: 4,
      maxSillage: 6,
      guidance: 'Shared air for eight hours. Something inoffensive that you would not mind a colleague noticing once.',
    },
    avoid: 'Anything a desk neighbour would still smell after you leave the room.',
  },
  {
    id: 'travel',
    label: 'Travel',
    emoji: '✈️',
    profile: {
      accords: { citrus: 0.5, musky: 0.5, woody: 0.4, aromatic: 0.4, green: 0.3, gourmand: -0.6, animalic: -0.7 },
      idealSillage: 3,
      maxSillage: 5,
      guidance: 'Recirculated air and no escape route for anyone around you. Keep it close and clean.',
    },
    avoid: 'Heavy or sweet compositions — a confined cabin turns them oppressive fast.',
  },
  {
    id: 'lazy-sunday',
    label: 'Lazy Sunday',
    emoji: '☕',
    profile: {
      accords: { vanilla: 0.6, musky: 0.6, powdery: 0.5, woody: 0.5, gourmand: 0.4, iris: 0.4 },
      idealSillage: 4,
      guidance: 'A comfort scent worn for your own benefit. Skin-close and soft is the whole brief.',
    },
    avoid: 'Formal or projecting compositions — they turn a quiet day into an occasion.',
  },
  {
    id: 'first-day',
    label: 'First Day',
    emoji: '🌟',
    profile: {
      accords: { citrus: 0.6, woody: 0.5, aromatic: 0.5, musky: 0.4, animalic: -0.7, gourmand: -0.4 },
      idealSillage: 4,
      maxSillage: 6,
      guidance: 'You are meeting many people at once and forming a first impression with each. Clean and competent beats memorable.',
    },
    avoid: 'Statement fragrances — save the signature scent until people know you.',
  },
  {
    id: 'creative',
    label: 'Creative Work',
    emoji: '🎨',
    profile: {
      accords: { iris: 0.5, woody: 0.5, resinous: 0.5, smoky: 0.4, earthy: 0.4, green: 0.3 },
      idealSillage: 4,
      guidance: 'Something textured and slightly odd to sit with for hours without tiring of it.',
    },
    avoid: 'Loud crowd-pleasers — they get boring by the third hour at a desk.',
  },
  {
    id: 'funeral',
    label: 'Funeral',
    emoji: '🕯️',
    profile: {
      accords: { iris: 0.5, powdery: 0.5, woody: 0.4, musky: 0.4, resinous: 0.3, sweet: -0.7, gourmand: -0.8, animalic: -0.8 },
      idealSillage: 2,
      maxSillage: 4,
      guidance: 'Near-invisible and sober. Anything noticeable is the wrong choice here.',
    },
    avoid: 'Sweetness, projection, and anything celebratory in character.',
  },
] as const;

export const MOODS: Record<string, ContextProfile> = {
  Confident: { accords: { woody: 0.5, amber: 0.4, leather: 0.4, 'warm-spicy': 0.3 } },
  Romantic: { accords: { rose: 0.6, vanilla: 0.5, musky: 0.5, amber: 0.4, 'white-floral': 0.4 } },
  Calm: { accords: { iris: 0.5, powdery: 0.4, green: 0.4, aquatic: 0.3, musky: 0.3 } },
  Energetic: { accords: { citrus: 0.7, 'fresh-spicy': 0.5, green: 0.4, ozonic: 0.4 } },
  Mysterious: { accords: { oud: 0.6, smoky: 0.5, resinous: 0.5, leather: 0.4, animalic: 0.3 } },
  Playful: { accords: { fruity: 0.6, sweet: 0.5, gourmand: 0.5, coconut: 0.3 } },
  Professional: { accords: { citrus: 0.5, woody: 0.5, aromatic: 0.4, gourmand: -0.4 } },
  Grieving: { accords: { iris: 0.4, powdery: 0.4, musky: 0.3, sweet: -0.5 } },
};

export const TIMES_OF_DAY: Record<string, ContextProfile> = {
  Morning: { accords: { citrus: 0.6, green: 0.4, aromatic: 0.4, ozonic: 0.3, oud: -0.3, gourmand: -0.3 } },
  Afternoon: { accords: { woody: 0.3, citrus: 0.3, floral: 0.3 } },
  Evening: { accords: { amber: 0.5, woody: 0.4, 'warm-spicy': 0.4, vanilla: 0.3, citrus: -0.2 } },
  'Late Night': { accords: { oud: 0.5, amber: 0.5, tobacco: 0.4, smoky: 0.4, gourmand: 0.3, citrus: -0.4, aquatic: -0.4 } },
};

export const WEATHERS: Record<string, ContextProfile> = {
  'Hot & Humid': { accords: { aquatic: 0.7, citrus: 0.6, ozonic: 0.5, green: 0.4, amber: -0.5, gourmand: -0.5, oud: -0.4 } },
  'Cold & Dry': { accords: { amber: 0.6, oud: 0.5, gourmand: 0.5, resinous: 0.5, tobacco: 0.4, aquatic: -0.6, citrus: -0.3 } },
  'Mild Spring': { accords: { floral: 0.6, green: 0.5, citrus: 0.4, 'white-floral': 0.4, oud: -0.3 } },
  Rainy: { accords: { earthy: 0.6, ozonic: 0.5, green: 0.4, woody: 0.4, mossy: 0.4, citrus: -0.2 } },
};

export const OCCASION_BY_ID = new Map(
  OCCASIONS.map((occasion) => [occasion.id, occasion]),
);
