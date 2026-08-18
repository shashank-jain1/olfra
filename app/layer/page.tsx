'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, X, AlertTriangle } from 'lucide-react';
import { useLayerAnalysis } from '@/lib/client/hooks';
import { ScoreRing, scoreColor } from '@/components/shared/ScoreRing';
import { ErrorNotice } from '@/components/shared/ErrorNotice';
import { CatalogueNotice } from '@/components/shared/CatalogueNotice';

const SUGGESTED_PAIRS = [
  ['Baccarat Rouge 540', 'Grand Soir'],
  ['Santal 33', 'By the Fireplace'],
  ['Sauvage', 'Bleu de Chanel'],
  ['Acqua di Giò Profumo', 'Oud Wood'],
] as const;

export default function ScentLayerPage() {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const analysis = useLayerAnalysis();

  const canAnalyse = first.trim() && second.trim() && !analysis.isPending;

  const analyse = (a = first, b = second) => {
    if (!a.trim() || !b.trim()) return;
    analysis.mutate({ first: a.trim(), second: b.trim() });
  };

  const result = analysis.data;

  return (
    <main className="min-h-screen pt-20 pb-16 bg-obsidian">
      <div className="max-w-2xl mx-auto px-6 pt-12">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layers size={18} className="text-amber" />
            <span className="font-mono text-xs uppercase tracking-widest text-amber">
              ScentLayer™
            </span>
          </div>
          <h1 className="text-4xl text-white mb-3 font-serif font-light">
            Master the art of <em className="text-amber not-italic font-serif italic">layering</em>
          </h1>
          <p className="text-ink-faint leading-relaxed">
            Scored on accord overlap, intensity balance and shared base notes.
            Identical scents score low — the goal is complement, not duplication.
          </p>
        </header>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 gap-3 mb-4">
            {[
              { value: first, set: setFirst, placeholder: 'First fragrance', id: 'layer-first' },
              { value: second, set: setSecond, placeholder: 'Second fragrance', id: 'layer-second' },
            ].map((input) => (
              <div key={input.id} className="relative">
                <label htmlFor={input.id} className="sr-only">
                  {input.placeholder}
                </label>
                <input
                  id={input.id}
                  value={input.value}
                  onChange={(event) => input.set(event.target.value)}
                  placeholder={input.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-ink-ghost outline-none pr-10 bg-white/[0.05] border border-hairline-strong focus:border-amber/40 transition-colors text-sm"
                />
                {input.value && (
                  <button
                    type="button"
                    aria-label={`Clear ${input.placeholder}`}
                    onClick={() => input.set('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={() => analyse()}
            disabled={!canAnalyse}
            whileHover={canAnalyse ? { scale: 1.02 } : undefined}
            whileTap={canAnalyse ? { scale: 0.98 } : undefined}
            className={`w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider transition-all ${
              canAnalyse
                ? 'bg-gradient-to-br from-amber-light to-amber text-white cursor-pointer'
                : 'bg-white/5 text-ink-ghost cursor-not-allowed'
            }`}
          >
            {analysis.isPending ? 'Analysing…' : 'Test Compatibility →'}
          </motion.button>
        </div>

        {analysis.isError && (
          <ErrorNotice error={analysis.error} onRetry={() => analyse()} className="mb-4" />
        )}

        {result && !analysis.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-4"
            style={{ borderColor: `${scoreColor(result.compatibilityScore)}44` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span
                  className="text-xs font-mono uppercase tracking-wider"
                  style={{ color: scoreColor(result.compatibilityScore) }}
                >
                  {result.verdict}
                </span>
                <p className="text-ink-soft font-mono text-xs mt-2">
                  {result.first.name} + {result.second.name}
                </p>
              </div>
              <ScoreRing score={result.compatibilityScore} size={84} />
            </div>

            <p className="text-ink-muted font-serif text-base leading-relaxed mb-6">
              {result.description}
            </p>

            {result.warnings.length > 0 && (
              <div className="mb-6 space-y-2">
                {result.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="flex items-start gap-3 p-4 rounded-xl bg-crimson/5 border border-crimson/20"
                  >
                    <AlertTriangle size={14} className="text-crimson shrink-0 mt-0.5" />
                    <p className="text-ink-soft text-[13px] leading-relaxed">{warning}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-hairline mb-6">
              <p className="text-[10px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-3">
                Application Order
              </p>
              <p className="text-ink-muted font-serif text-lg mb-2">
                {result.applicationOrder.first} → wait{' '}
                {result.applicationOrder.waitTime} → {result.applicationOrder.second}
              </p>
              <p className="text-ink-faint text-[13px] leading-relaxed">
                {result.applicationOrder.reason}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-3">
                Combined Accord Profile
              </p>
              <div className="flex flex-wrap gap-2">
                {result.layeredAccords.map((accord) => (
                  <span
                    key={accord.label}
                    className="text-[11px] px-3 py-1.5 rounded-full font-mono bg-amber/10 text-amber border border-amber/20"
                  >
                    {accord.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8">
          <p className="text-xs font-mono text-ink-faint uppercase tracking-widest mb-3">
            Try a pairing
          </p>
          <div className="space-y-2 mb-6">
            {SUGGESTED_PAIRS.map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => {
                  setFirst(a);
                  setSecond(b);
                  analyse(a, b);
                }}
                className="glass-card w-full p-4 flex items-center justify-between text-left hover:border-hairline-strong transition-colors"
              >
                <span className="text-sm font-mono text-ink-soft">
                  {a} <span className="text-ink-ghost">+</span> {b}
                </span>
                <span className="text-xs font-mono text-ink-faint">Test →</span>
              </button>
            ))}
          </div>
          <CatalogueNotice />
        </div>
      </div>
    </main>
  );
}
