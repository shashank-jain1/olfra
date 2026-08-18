'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEED_BY_ID } from '@/lib/fragrance/data/catalogue';
import { scoreDupe } from '@/lib/fragrance/similarity';
import { buildNoteIdf } from '@/lib/fragrance/note-idf';
import { SEED_CATALOGUE } from '@/lib/fragrance/data/catalogue';
import { AccordFingerprint } from '@/components/viz/AccordFingerprint';

/**
 * Live proof, not a claim.
 *
 * This runs the real scoring engine in the browser on real catalogue data
 * and draws the result. Every number on screen is computed at render time
 * from the same code path the product uses — so the homepage demonstrates
 * the thing it is selling instead of asserting it.
 *
 * It replaces three invented testimonials attributed to people who do not
 * exist, and a "99.2% AI accuracy" figure that was never measured.
 */

const PAIRS = [
  {
    id: 'aventus',
    original: 'creed-aventus',
    dupe: 'armaf-club-de-nuit-intense-man',
    note: 'The best-known dupe in modern perfumery — and the engine finds it unprompted.',
  },
  {
    id: 'br540',
    original: 'maison-francis-kurkdjian-baccarat-rouge-540',
    dupe: 'lattafa-khamrah',
    note: 'Same sweet-amber territory, reached by a different route.',
  },
  {
    id: 'santal',
    original: 'le-labo-santal-33',
    dupe: 'zara-vibrant-leather',
    note: 'Shared dry woods and leather, at a twentieth of the price.',
  },
] as const;

export function ProofPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = PAIRS[activeIndex];

  const result = useMemo(() => {
    const original = SEED_BY_ID.get(active.original);
    const dupe = SEED_BY_ID.get(active.dupe);
    if (!original || !dupe) return null;

    const idf = buildNoteIdf(SEED_CATALOGUE);
    return { original, dupe, ...scoreDupe(original, dupe, idf) };
  }, [active]);

  if (!result) return null;

  const saving =
    typeof result.original.priceUSD === 'number' &&
    typeof result.dupe.priceUSD === 'number'
      ? result.original.priceUSD - result.dupe.priceUSD
      : null;

  return (
    <section className="py-28 md:py-40 px-6 border-t border-hairline bg-obsidian-2 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="eyebrow mb-6">Computed in your browser, right now</p>
          <h2 className="text-title text-ink mb-5">
            Every score shows its <em className="text-gradient-amber not-italic">working</em>
          </h2>
          <p className="text-ink-soft measure-sm mx-auto leading-relaxed">
            Two accord signatures, overlaid. Where they agree is the match —
            and the same four measurements produce the same number every time
            you ask.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {PAIRS.map((pair, index) => {
            const label = SEED_BY_ID.get(pair.original)?.name ?? pair.id;
            const selected = index === activeIndex;

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={selected}
                className={`px-5 py-2.5 rounded-full font-mono text-[11px] tracking-wide transition-all duration-300 border ${
                  selected
                    ? 'bg-amber/10 text-amber border-amber/35'
                    : 'bg-white/[0.02] text-ink-faint border-hairline hover:text-ink-muted hover:border-hairline-strong'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="glass-card p-8 md:p-12 rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-baseline gap-4 flex-wrap mb-8">
                  <span className="font-mono text-[52px] md:text-[64px] leading-none text-amber tabular">
                    {result.score}
                    <span className="text-2xl text-ink-ghost">%</span>
                  </span>
                  <span className="eyebrow">match</span>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
                  <Pair
                    label="Original"
                    name={result.original.name}
                    brand={result.original.brand}
                    price={result.original.priceUSD}
                    color="var(--color-amber)"
                  />
                  <Pair
                    label="Alternative"
                    name={result.dupe.name}
                    brand={result.dupe.brand}
                    price={result.dupe.priceUSD}
                    color="var(--color-mint)"
                  />
                </div>

                <div className="space-y-2.5 mb-8">
                  <Bar label="Accord profile" value={result.breakdown.accordCosine} weight="62%" />
                  <Bar label="Shared base notes" value={result.breakdown.baseNoteOverlap} weight="22%" />
                  <Bar label="All shared notes" value={result.breakdown.allNoteOverlap} weight="10%" />
                  <Bar label="Performance" value={result.breakdown.performance} weight="6%" />
                </div>

                <p className="text-ink-soft font-serif text-lg leading-relaxed measure">
                  {active.note}
                  {saving !== null && saving > 0 && (
                    <span className="text-mint">
                      {' '}
                      Roughly ${saving} less per bottle.
                    </span>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center lg:justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <AccordFingerprint
                    fragrance={result.original}
                    compare={result.dupe}
                    size={300}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-ghost mt-8">
          Solid: original · Dashed: alternative · Prices approximate
        </p>
      </div>
    </section>
  );
}

function Pair({
  label,
  name,
  brand,
  price,
  color,
}: {
  label: string;
  name: string;
  brand: string;
  price?: number;
  color: string;
}) {
  return (
    <div>
      <span
        className="font-mono text-[9px] uppercase tracking-[0.18em] block mb-2"
        style={{ color }}
      >
        {label}
      </span>
      <p className="text-ink font-serif text-lg leading-snug">{name}</p>
      <p className="text-ink-faint font-mono text-[11px] mt-1">
        {brand}
        {typeof price === 'number' && ` · ~$${price}`}
      </p>
    </div>
  );
}

function Bar({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  const percent = Math.round(value * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] text-ink-faint w-32 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-amber/70"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="font-mono text-[10px] text-ink-soft w-9 text-right tabular">
        {percent}%
      </span>
      <span className="font-mono text-[9px] text-ink-ghost w-9 text-right">
        ×{weight}
      </span>
    </div>
  );
}
