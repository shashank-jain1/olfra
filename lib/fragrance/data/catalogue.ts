// ─────────────────────────────────────────────────────────────
// OLFRA™ — Seed catalogue
//
// A small curated set of widely-known fragrances so every feature works
// end to end with zero configuration — no database, no API key, no signup.
// The real catalogue replaces this via the Supabase repository; this stays
// as the dev/offline fallback and as fixtures for engine tests.
//
// Accords are intentionally omitted: they are derived from the note pyramid
// by `inferAccordsFromNotes`, which keeps this file to verifiable facts
// (notes, house, year) rather than hand-tuned weights.
//
// Prices are approximate full-bottle retail in USD and drift constantly.
// They are illustrative, not quoted — never present them as live pricing.
// ─────────────────────────────────────────────────────────────

import type { Concentration, Fragrance } from '../types';

interface SeedInput {
  name: string;
  brand: string;
  year: number;
  concentration: Concentration;
  family: string;
  /** Published main accords with relative strength 0..1. Present here for
   *  well-documented releases; omitted entries fall back to note inference. */
  accords?: Record<string, number>;
  top: string[];
  heart: string[];
  base: string[];
  longevity: number;
  sillage: number;
  rating: number;
  priceUSD: number;
  description: string;
}

function slugify(brand: string, name: string): string {
  return `${brand}-${name}`
    .normalize('NFD')
    // Strip combining marks so "Giò" becomes "gio" rather than losing the
    // character entirely and producing a mangled slug.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function seed(input: SeedInput): Fragrance {
  const slug = slugify(input.brand, input.name);
  return {
    id: slug,
    slug,
    name: input.name,
    brand: input.brand,
    year: input.year,
    concentration: input.concentration,
    family: input.family,
    notes: { top: input.top, heart: input.heart, base: input.base },
    accords: input.accords ?? {}, // falls back to note inference when absent
    longevity: input.longevity,
    sillage: input.sillage,
    rating: input.rating,
    priceUSD: input.priceUSD,
    description: input.description,
    source: 'seed',
  };
}

export const SEED_CATALOGUE: Fragrance[] = [
  seed({
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    year: 2015,
    concentration: 'EDP',
    family: 'Amber Floral',
    accords: { sweet: 0.9, amber: 0.8, woody: 0.5, 'warm-spicy': 0.45, floral: 0.35, musky: 0.3 },
    top: ['Saffron', 'Jasmine'],
    heart: ['Amberwood', 'Ambergris'],
    base: ['Fir Resin', 'Cedar'],
    longevity: 9,
    sillage: 9,
    rating: 4.3,
    priceUSD: 325,
    description:
      'A luminous saffron-and-amberwood accord with a sweet, resinous trail that reads as almost edible.',
  }),
  seed({
    name: 'Cloud',
    brand: 'Ariana Grande',
    year: 2018,
    concentration: 'EDP',
    family: 'Gourmand Floral',
    accords: { sweet: 0.9, gourmand: 0.7, coconut: 0.6, vanilla: 0.55, powdery: 0.45, musky: 0.35 },
    top: ['Lavender', 'Pear', 'Bergamot'],
    heart: ['Coconut', 'Praline', 'Orchid'],
    base: ['Musk', 'Woody Notes', 'Vanilla'],
    longevity: 7,
    sillage: 7,
    rating: 4.1,
    priceUSD: 55,
    description:
      'A creamy praline-and-coconut gourmand that occupies similar sweet territory at a fraction of the price.',
  }),
  seed({
    name: 'Aventus',
    brand: 'Creed',
    year: 2010,
    concentration: 'EDP',
    family: 'Fruity Chypre',
    accords: { fruity: 0.85, smoky: 0.6, woody: 0.6, citrus: 0.5, mossy: 0.4, musky: 0.35 },
    top: ['Bergamot', 'Blackcurrant', 'Apple', 'Pineapple'],
    heart: ['Birch', 'Patchouli', 'Rose', 'Jasmine'],
    base: ['Musk', 'Oakmoss', 'Ambergris', 'Vanilla'],
    longevity: 8,
    sillage: 8,
    rating: 4.4,
    priceUSD: 445,
    description:
      'Smoky birch over bright pineapple — the fruit-and-smoke contrast that spawned a hundred imitators.',
  }),
  seed({
    name: 'Club de Nuit Intense Man',
    brand: 'Armaf',
    year: 2015,
    concentration: 'EDT',
    family: 'Fruity Chypre',
    accords: { fruity: 0.85, smoky: 0.6, woody: 0.55, citrus: 0.55, musky: 0.4, amber: 0.3 },
    top: ['Lemon', 'Pineapple', 'Blackcurrant', 'Apple', 'Bergamot'],
    heart: ['Birch', 'Jasmine', 'Rose'],
    base: ['Musk', 'Ambergris', 'Patchouli', 'Vanilla'],
    longevity: 8,
    sillage: 9,
    rating: 4.2,
    priceUSD: 35,
    description:
      'The most cited Aventus alternative — near-identical structure with a louder, sharper opening.',
  }),
  seed({
    name: 'Sauvage',
    brand: 'Dior',
    year: 2015,
    concentration: 'EDP',
    family: 'Aromatic Fougère',
    accords: { 'fresh-spicy': 0.85, amber: 0.7, aromatic: 0.6, citrus: 0.5, woody: 0.45 },
    top: ['Bergamot', 'Pepper'],
    heart: ['Sichuan Pepper', 'Lavender', 'Pink Pepper', 'Vetiver', 'Geranium', 'Elemi'],
    base: ['Ambroxan', 'Cedar', 'Labdanum'],
    longevity: 8,
    sillage: 9,
    rating: 4.0,
    priceUSD: 165,
    description:
      'A peppery, ambroxan-driven blast built for projection — ubiquitous for a reason.',
  }),
  seed({
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    year: 2014,
    concentration: 'EDP',
    family: 'Woody Aromatic',
    accords: { woody: 0.8, citrus: 0.6, aromatic: 0.55, smoky: 0.4, 'fresh-spicy': 0.4 },
    top: ['Grapefruit', 'Lemon', 'Mint', 'Pink Pepper'],
    heart: ['Ginger', 'Nutmeg', 'Jasmine'],
    base: ['Incense', 'Vetiver', 'Cedar', 'Sandalwood', 'Patchouli', 'Labdanum'],
    longevity: 8,
    sillage: 7,
    rating: 4.2,
    priceUSD: 145,
    description:
      'Citrus and ginger over a smoky incense-and-sandalwood base. Polished, versatile, hard to dislike.',
  }),
  seed({
    name: 'Y Eau de Parfum',
    brand: 'Yves Saint Laurent',
    year: 2018,
    concentration: 'EDP',
    family: 'Aromatic Fougère',
    accords: { aromatic: 0.7, woody: 0.6, amber: 0.5, fruity: 0.5, 'fresh-spicy': 0.4 },
    top: ['Apple', 'Ginger', 'Bergamot'],
    heart: ['Sage', 'Juniper', 'Geranium'],
    base: ['Amberwood', 'Cedar', 'Tonka', 'Vetiver'],
    longevity: 8,
    sillage: 7,
    rating: 4.1,
    priceUSD: 120,
    description:
      'Crisp apple and sage over a warm amberwood drydown — a cleaner cousin to the ambroxan crowd.',
  }),
  seed({
    name: 'Oud Wood',
    brand: 'Tom Ford',
    year: 2007,
    concentration: 'EDP',
    family: 'Woody Oriental',
    accords: { woody: 0.85, oud: 0.7, 'warm-spicy': 0.4, vanilla: 0.35, amber: 0.3 },
    top: ['Rosewood', 'Cardamom', 'Black Pepper'],
    heart: ['Oud', 'Sandalwood', 'Vetiver'],
    base: ['Tonka', 'Vanilla', 'Amber'],
    longevity: 7,
    sillage: 6,
    rating: 4.3,
    priceUSD: 285,
    description:
      'A tamed, creamy oud — smoky wood softened by vanilla and tonka rather than sharpened by it.',
  }),
  seed({
    name: 'Tobacco Vanille',
    brand: 'Tom Ford',
    year: 2007,
    concentration: 'EDP',
    family: 'Oriental Spicy',
    accords: { tobacco: 0.9, vanilla: 0.8, sweet: 0.7, 'warm-spicy': 0.55, gourmand: 0.5 },
    top: ['Tobacco Leaf', 'Clove', 'Ginger'],
    heart: ['Tonka', 'Tobacco Blossom', 'Cocoa'],
    base: ['Vanilla', 'Dried Fruits', 'Woody Notes'],
    longevity: 9,
    sillage: 8,
    rating: 4.4,
    priceUSD: 310,
    description:
      'Pipe tobacco steeped in vanilla and dried fruit. Dense, sweet, unmistakably cold-weather.',
  }),
  seed({
    name: 'Khamrah',
    brand: 'Lattafa',
    year: 2022,
    concentration: 'EDP',
    family: 'Oriental Spicy',
    accords: { sweet: 0.85, vanilla: 0.7, 'warm-spicy': 0.65, gourmand: 0.6, amber: 0.5 },
    top: ['Cinnamon', 'Nutmeg', 'Bergamot'],
    heart: ['Dates', 'Praline', 'Tonka', 'Mahogany'],
    base: ['Vanilla', 'Tonka', 'Benzoin', 'Amber'],
    longevity: 9,
    sillage: 8,
    rating: 4.2,
    priceUSD: 40,
    description:
      'Spiced dates and praline over a heavy vanilla-benzoin base — enormous performance for the money.',
  }),
  seed({
    name: 'Santal 33',
    brand: 'Le Labo',
    year: 2011,
    concentration: 'EDP',
    family: 'Woody Aromatic',
    accords: { woody: 0.85, leather: 0.5, musky: 0.45, aromatic: 0.35, iris: 0.3 },
    top: ['Cardamom', 'Iris', 'Violet'],
    heart: ['Papyrus', 'Ambroxan', 'Sandalwood'],
    base: ['Leather', 'Cedar', 'Musk'],
    longevity: 7,
    sillage: 6,
    rating: 4.0,
    priceUSD: 220,
    description:
      'Dry sandalwood and leather with a papyrus smokiness. Skin-close, unisex, endlessly imitated.',
  }),
  seed({
    name: 'Layton',
    brand: 'Parfums de Marly',
    year: 2016,
    concentration: 'EDP',
    family: 'Oriental Floral',
    accords: { sweet: 0.7, vanilla: 0.6, 'warm-spicy': 0.55, fruity: 0.5, woody: 0.5, floral: 0.4 },
    top: ['Apple', 'Bergamot', 'Lavender'],
    heart: ['Geranium', 'Violet', 'Jasmine', 'Pepper', 'Cardamom'],
    base: ['Vanilla', 'Sandalwood', 'Guaiac', 'Patchouli'],
    longevity: 9,
    sillage: 8,
    rating: 4.4,
    priceUSD: 355,
    description:
      'Apple and spice riding a vanilla-sandalwood base. Sweet without tipping into gourmand.',
  }),
  seed({
    name: 'Acqua di Giò Profumo',
    brand: 'Giorgio Armani',
    year: 2015,
    concentration: 'Parfum',
    family: 'Aromatic Aquatic',
    accords: { aquatic: 0.8, aromatic: 0.6, resinous: 0.5, citrus: 0.45, smoky: 0.35 },
    top: ['Bergamot', 'Sea Notes'],
    heart: ['Rosemary', 'Geranium', 'Sage'],
    base: ['Incense', 'Patchouli'],
    longevity: 8,
    sillage: 7,
    rating: 4.3,
    priceUSD: 130,
    description:
      'Marine freshness darkened by incense — an aquatic with actual weight behind it.',
  }),
  seed({
    name: 'Voyage',
    brand: 'Nautica',
    year: 2006,
    concentration: 'EDT',
    family: 'Aromatic Aquatic',
    accords: { aquatic: 0.85, fruity: 0.6, green: 0.5, citrus: 0.4, musky: 0.3 },
    top: ['Apple', 'Green Leaf', 'Lemon'],
    heart: ['Lotus', 'Water Notes', 'Mimosa'],
    base: ['Cedar', 'Musk', 'Amber'],
    longevity: 6,
    sillage: 6,
    rating: 3.9,
    priceUSD: 25,
    description:
      'A clean, watery apple freshie that punches far above its price for warm-weather daily wear.',
  }),
  seed({
    name: 'Le Male',
    brand: 'Jean Paul Gaultier',
    year: 1995,
    concentration: 'EDT',
    family: 'Aromatic Fougère',
    accords: { sweet: 0.7, vanilla: 0.65, aromatic: 0.6, 'warm-spicy': 0.5, powdery: 0.35 },
    top: ['Mint', 'Lavender', 'Bergamot', 'Cardamom'],
    heart: ['Cinnamon', 'Orange Blossom', 'Cumin'],
    base: ['Vanilla', 'Tonka', 'Sandalwood', 'Amber'],
    longevity: 8,
    sillage: 8,
    rating: 4.1,
    priceUSD: 85,
    description:
      'Mint and lavender over a sweet vanilla-tonka base — the blueprint for the modern sweet fougère.',
  }),
  seed({
    name: 'Eros',
    brand: 'Versace',
    year: 2012,
    concentration: 'EDT',
    family: 'Aromatic Fougère',
    accords: { sweet: 0.7, aromatic: 0.65, vanilla: 0.55, herbal: 0.45, woody: 0.4 },
    top: ['Mint', 'Green Apple', 'Lemon'],
    heart: ['Tonka', 'Geranium', 'Ambroxan'],
    base: ['Vanilla', 'Cedar', 'Vetiver', 'Oakmoss'],
    longevity: 8,
    sillage: 8,
    rating: 4.0,
    priceUSD: 95,
    description:
      'Sharp mint and apple crashing into vanilla. Loud, young, unapologetically club-ready.',
  }),
  seed({
    name: 'Dior Homme Intense',
    brand: 'Dior',
    year: 2011,
    concentration: 'EDP',
    family: 'Woody Floral Musk',
    accords: { iris: 0.9, powdery: 0.8, woody: 0.5, floral: 0.35 },
    top: ['Lavender'],
    heart: ['Iris', 'Ambrette', 'Pear'],
    base: ['Virginia Cedar', 'Vetiver'],
    longevity: 8,
    sillage: 7,
    rating: 4.4,
    priceUSD: 135,
    description:
      'Powdery iris and cedar — the reference point for makeup-box elegance in men’s perfumery.',
  }),
  seed({
    name: 'No. 5',
    brand: 'Chanel',
    year: 1921,
    concentration: 'EDP',
    family: 'Floral Aldehyde',
    accords: { aldehydic: 0.85, floral: 0.8, powdery: 0.6, 'white-floral': 0.5, musky: 0.4, mossy: 0.35 },
    top: ['Aldehydes', 'Ylang-Ylang', 'Neroli', 'Bergamot', 'Lemon'],
    heart: ['Iris', 'Jasmine', 'Rose', 'Lily of the Valley'],
    base: ['Sandalwood', 'Vetiver', 'Vanilla', 'Amber', 'Civet', 'Oakmoss'],
    longevity: 8,
    sillage: 7,
    rating: 4.2,
    priceUSD: 165,
    description:
      'The aldehydic floral that defined modern perfumery. Soapy brightness over a mossy, animalic base.',
  }),
  seed({
    name: 'By the Fireplace',
    brand: 'Maison Margiela Replica',
    year: 2015,
    concentration: 'EDT',
    family: 'Woody Gourmand',
    accords: { smoky: 0.85, sweet: 0.6, woody: 0.55, vanilla: 0.5, gourmand: 0.45 },
    top: ['Clove', 'Orange Blossom', 'Pink Pepper'],
    heart: ['Chestnut', 'Guaiac', 'Cashmeran'],
    base: ['Vanilla', 'Peru Balsam', 'Cade'],
    longevity: 7,
    sillage: 7,
    rating: 4.3,
    priceUSD: 145,
    description:
      'Woodsmoke and roasted chestnut wrapped in vanilla. Comfort scent, almost literally.',
  }),
  seed({
    name: 'Naxos',
    brand: 'Xerjoff',
    year: 2015,
    concentration: 'EDP',
    family: 'Oriental Fougère',
    accords: { tobacco: 0.75, sweet: 0.75, vanilla: 0.65, 'warm-spicy': 0.5, gourmand: 0.45 },
    top: ['Bergamot', 'Lavender', 'Lemon'],
    heart: ['Cinnamon', 'Honey', 'Tobacco'],
    base: ['Tonka', 'Vanilla', 'Cashmere Wood'],
    longevity: 9,
    sillage: 8,
    rating: 4.5,
    priceUSD: 340,
    description:
      'Honeyed tobacco over tonka and vanilla — refined where most sweet tobaccos are heavy-handed.',
  }),
  seed({
    name: 'Asad',
    brand: 'Lattafa',
    year: 2022,
    concentration: 'EDP',
    family: 'Aromatic Fougère',
    accords: { sweet: 0.7, tobacco: 0.6, fruity: 0.55, amber: 0.5, aromatic: 0.4 },
    top: ['Pineapple', 'Black Pepper', 'Bergamot'],
    heart: ['Tobacco', 'Violet', 'Lavender'],
    base: ['Vanilla', 'Amberwood', 'Tonka'],
    longevity: 8,
    sillage: 8,
    rating: 4.0,
    priceUSD: 30,
    description:
      'Pineapple and tobacco over sweet amberwood — a budget crowd-pleaser with real projection.',
  }),
  seed({
    name: 'Interlude Man',
    brand: 'Amouage',
    year: 2012,
    concentration: 'EDP',
    family: 'Woody Spicy',
    accords: { smoky: 0.85, resinous: 0.7, leather: 0.55, oud: 0.5, woody: 0.5 },
    top: ['Bergamot', 'Oregano', 'Pimento'],
    heart: ['Frankincense', 'Amber', 'Myrrh', 'Cistus'],
    base: ['Leather', 'Patchouli', 'Sandalwood', 'Oud'],
    longevity: 9,
    sillage: 9,
    rating: 4.3,
    priceUSD: 390,
    description:
      'A smoky incense-and-leather monolith. Divisive, enormous, and completely uninterested in your approval.',
  }),
  seed({
    name: 'Delina',
    brand: 'Parfums de Marly',
    year: 2017,
    concentration: 'EDP',
    family: 'Floral Fruity',
    accords: { rose: 0.8, floral: 0.75, fruity: 0.6, sweet: 0.5, woody: 0.4, musky: 0.35 },
    top: ['Lychee', 'Rhubarb', 'Bergamot', 'Nutmeg'],
    heart: ['Turkish Rose', 'Peony', 'Vanilla'],
    base: ['Musk', 'Cashmere Wood', 'Vetiver', 'Incense'],
    longevity: 8,
    sillage: 8,
    rating: 4.4,
    priceUSD: 335,
    description:
      'Lychee and Turkish rose over cashmere woods — bright, feminine, and extremely persistent.',
  }),
  seed({
    name: 'Vibrant Leather',
    brand: 'Zara',
    year: 2019,
    concentration: 'EDT',
    family: 'Woody Leather',
    accords: { leather: 0.85, woody: 0.6, musky: 0.4, 'fresh-spicy': 0.3 },
    top: ['Bergamot', 'Pink Pepper'],
    heart: ['Leather', 'Violet'],
    base: ['Vetiver', 'Cedar', 'Musk'],
    longevity: 6,
    sillage: 6,
    rating: 3.9,
    priceUSD: 30,
    description:
      'A clean, modern leather at supermarket pricing — light on complexity, heavy on wearability.',
  }),
  seed({
    name: 'Silver Mountain Water',
    brand: 'Creed',
    year: 1995,
    concentration: 'EDP',
    family: 'Woody Aromatic',
    accords: { green: 0.7, citrus: 0.65, musky: 0.55, fruity: 0.45, aquatic: 0.35 },
    top: ['Bergamot', 'Mandarin'],
    heart: ['Green Tea', 'Blackcurrant'],
    base: ['Musk', 'Sandalwood'],
    longevity: 6,
    sillage: 6,
    rating: 4.0,
    priceUSD: 400,
    description:
      'Green tea and blackcurrant over clean musk — a cold, mineral freshness unlike the usual aquatics.',
  }),
  seed({
    name: 'Grand Soir',
    brand: 'Maison Francis Kurkdjian',
    year: 2016,
    concentration: 'EDP',
    family: 'Amber Vanilla',
    accords: { amber: 0.9, vanilla: 0.8, sweet: 0.6, balsamic: 0.55, resinous: 0.4 },
    top: ['Lavender'],
    heart: ['Amber', 'Benzoin', 'Labdanum'],
    base: ['Vanilla', 'Tonka'],
    longevity: 8,
    sillage: 7,
    rating: 4.4,
    priceUSD: 275,
    description:
      'Amber and vanilla with almost nothing in the way — a warm, resinous evening scent stripped to essentials.',
  }),
];

/** Fast lookup by id/slug. */
export const SEED_BY_ID = new Map(
  SEED_CATALOGUE.map((fragrance) => [fragrance.id, fragrance]),
);
