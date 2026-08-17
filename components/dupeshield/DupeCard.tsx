'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { DupeMatch } from '@/lib/engines/dupeshield';
import { ScoreRing } from '@/components/shared/ScoreRing';

interface DupeCardProps {
  match: DupeMatch;
  index: number;
}

export function DupeCard({ match, index }: DupeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { fragrance } = match;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        className="glass w-full p-6 rounded-3xl text-left cursor-pointer border-white/5 hover:border-white/10 relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="inline-block text-[10px] px-3 py-1 rounded-full font-mono uppercase tracking-[0.1em] bg-amber/10 text-amber border border-amber/20 mb-3">
              {match.verdict}
            </span>
            <h3 className="text-white/90 font-serif text-2xl tracking-wide mb-1 group-hover:text-white transition-colors">
              {fragrance.name}
            </h3>
            <p className="text-white/50 text-[13px] font-mono tracking-wider">
              {fragrance.brand}
              {fragrance.concentration !== 'Unknown' && ` · ${fragrance.concentration}`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <ScoreRing score={match.score} />
            {typeof fragrance.priceUSD === 'number' && (
              <div className="text-right">
                <p className="font-mono text-white/90 text-lg mb-0.5">
                  ~${fragrance.priceUSD}
                </p>
                {match.savingsUSD !== undefined && (
                  <p className="font-mono text-[11px] uppercase tracking-wider text-mint">
                    Save ~${match.savingsUSD}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {match.sharedNotes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 relative z-10">
            {match.sharedNotes.slice(0, 5).map((note) => (
              <span
                key={note}
                className="text-[11px] px-3 py-1 rounded-full font-mono bg-white/5 text-white/60 border border-white/10"
              >
                {note}
              </span>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden relative z-10"
            >
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-white/60 font-serif text-lg leading-relaxed italic mb-6">
                  {match.explanation}
                </p>
                <ScoreBreakdown breakdown={match.breakdown} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 right-6 z-10 pointer-events-none">
          <ChevronDown
            size={18}
            className="text-white/20 transition-transform duration-500 group-hover:text-white/40"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </motion.button>
    </motion.div>
  );
}

/** The four signals behind the score, shown so the number is auditable. */
function ScoreBreakdown({ breakdown }: { breakdown: DupeMatch['breakdown'] }) {
  const rows = [
    { label: 'Accord profile', value: breakdown.accordCosine, weight: '62%' },
    { label: 'Shared base notes', value: breakdown.baseNoteOverlap, weight: '22%' },
    { label: 'All shared notes', value: breakdown.allNoteOverlap, weight: '10%' },
    { label: 'Performance match', value: breakdown.performance, weight: '6%' },
  ];

  return (
    <div>
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">
        How this score was calculated
      </p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-white/40 w-36 shrink-0">
              {row.label}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full rounded-full bg-amber/60"
                style={{ width: `${Math.round(row.value * 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-white/50 w-10 text-right">
              {Math.round(row.value * 100)}%
            </span>
            <span className="text-[10px] font-mono text-white/20 w-10 text-right">
              ×{row.weight}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
