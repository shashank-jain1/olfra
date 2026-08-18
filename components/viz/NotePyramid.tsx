'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { NotePyramid as NotePyramidData } from '@/lib/fragrance/types';

/**
 * The note pyramid, drawn as a pyramid.
 *
 * Perfumery already has a canonical way to describe a composition — top,
 * heart, base — and it encodes time: what you smell in the first minutes,
 * what emerges over the next hour, what's still there at bedtime. The
 * previous UI flattened all three into one undifferentiated pill row,
 * throwing that structure away.
 *
 * Tiers reveal top-down, in the order you actually encounter them.
 */

const TIERS = [
  {
    key: 'top' as const,
    label: 'Top',
    timing: 'First 15 minutes',
    color: 'var(--color-amber-light)',
    width: '62%',
  },
  {
    key: 'heart' as const,
    label: 'Heart',
    timing: '20 min – 2 hours',
    color: 'var(--color-rose)',
    width: '82%',
  },
  {
    key: 'base' as const,
    label: 'Base',
    timing: '2 hours onward',
    color: 'var(--color-amber)',
    width: '100%',
  },
];

export function NotePyramid({
  notes,
  className = '',
}: {
  notes: NotePyramidData;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const populated = TIERS.filter((tier) => notes[tier.key]?.length > 0);

  if (populated.length === 0) {
    return (
      <p className="text-ink-faint text-sm">
        No note breakdown available for this fragrance.
      </p>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {populated.map((tier, tierIndex) => (
        <motion.div
          key={tier.key}
          style={{ width: tier.width }}
          className="max-w-full"
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: tierIndex * 0.14,
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div
            className="rounded-2xl border px-5 py-4 backdrop-blur-sm"
            style={{
              borderColor: `color-mix(in srgb, ${tier.color} 26%, transparent)`,
              background: `color-mix(in srgb, ${tier.color} 5%, transparent)`,
            }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: tier.color }}
              >
                {tier.label}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-ghost whitespace-nowrap">
                {tier.timing}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center">
              {notes[tier.key].map((note, noteIndex) => (
                <motion.span
                  key={`${note}-${noteIndex}`}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: tierIndex * 0.14 + 0.18 + noteIndex * 0.04,
                    duration: 0.3,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full font-mono text-ink-muted bg-white/[0.04] border border-hairline"
                >
                  {note}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
