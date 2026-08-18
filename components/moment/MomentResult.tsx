'use client';

import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { MomentResult as MomentResultData } from '@/lib/engines/moment';

const LONGEVITY_STYLES: Record<string, string> = {
  excellent: 'bg-mint/10 text-mint border-mint/30',
  good: 'bg-amber/10 text-amber border-amber/30',
  borderline: 'bg-crimson/10 text-crimson border-crimson/30',
};

export function MomentResultView({
  result,
  context,
  onReset,
  personalised,
}: {
  result: MomentResultData;
  context: string;
  onReset: () => void;
  personalised: boolean;
}) {
  const { primary } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={16} className="text-rose" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose">
            Your ScentMoment
          </span>
        </div>
        <p className="text-ink-faint font-mono text-sm tracking-widest uppercase">
          {context}
        </p>
        {personalised && (
          <p className="text-mint/70 font-mono text-[10px] uppercase tracking-[0.15em] mt-3">
            Ranked against your ScentDNA profile
          </p>
        )}
      </header>

      <article className="glass p-10 md:p-14 mb-6 rounded-3xl border-rose/30 shadow-[0_0_80px_rgba(194,98,122,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose/10 to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-[11px] font-mono text-rose/70 uppercase tracking-[0.2em] mb-4">
            Best fit · {primary.fit}/100
          </p>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-hairline pb-8">
            <div>
              <h2 className="text-4xl md:text-5xl text-ink font-serif font-light mb-2 tracking-tight">
                {primary.fragrance.name}
              </h2>
              <p className="text-ink-soft font-mono text-sm uppercase tracking-widest">
                {primary.fragrance.brand}
                {primary.fragrance.concentration !== 'Unknown' &&
                  ` · ${primary.fragrance.concentration}`}
              </p>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-widest border self-start whitespace-nowrap ${
                LONGEVITY_STYLES[primary.longevityFit] ?? LONGEVITY_STYLES.good
              }`}
            >
              {primary.longevityFit} longevity
            </span>
          </div>

          <p className="text-ink-muted leading-relaxed mb-8 font-serif text-lg md:text-xl tracking-wide">
            {primary.whyItFits}
          </p>

          <div className="bg-rose/5 rounded-2xl p-6 border border-rose/10">
            <p className="text-[10px] font-mono text-rose/50 uppercase tracking-[0.2em] mb-3">
              Application
            </p>
            <p className="text-ink-muted font-serif text-lg leading-relaxed">
              {result.applicationTip}
            </p>
          </div>
        </div>
      </article>

      {result.alternatives.length > 0 && (
        <section className="glass p-8 mb-6 rounded-2xl border-hairline">
          <p className="text-[11px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-6">
            Also considered
          </p>
          <div className="space-y-4">
            {result.alternatives.map((alternative) => (
              <div
                key={alternative.fragrance.id}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <div className="mt-1 bg-white/5 rounded-full p-1 shrink-0">
                  <ChevronRight size={14} className="text-ink-faint" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <span className="text-ink font-serif text-xl">
                      {alternative.fragrance.name}
                    </span>
                    <span className="text-ink-faint font-mono text-[11px] uppercase tracking-wider">
                      {alternative.fragrance.brand} · {alternative.fit}/100
                    </span>
                  </div>
                  <p className="text-ink-soft font-serif text-base leading-relaxed">
                    {alternative.whyItFits}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InsightCard
          label="Why this occasion works this way"
          value={result.occasionInsight}
          accent="text-rose"
        />
        <InsightCard
          label="What to avoid"
          value={result.whatToAvoid}
          accent="text-crimson"
        />
      </div>

      <section className="glass p-6 rounded-2xl border-hairline mb-10">
        <p className="text-[10px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-4">
          Accords this combination called for
        </p>
        <div className="flex flex-wrap gap-2">
          {result.targetAccords.map((accord) => (
            <span
              key={accord.label}
              className="text-[11px] px-3 py-1.5 rounded-full font-mono bg-rose/10 text-rose border border-rose/20"
            >
              {accord.label}
            </span>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-4 rounded-full font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft border border-hairline-strong hover:bg-white/5 hover:text-ink transition-all duration-300"
      >
        Start over
      </button>
    </motion.div>
  );
}

function InsightCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass p-8 rounded-2xl border-hairline">
      <p
        className={`text-[11px] font-mono mb-4 uppercase tracking-[0.2em] ${accent}`}
      >
        {label}
      </p>
      <p className="text-ink-soft font-serif text-lg leading-relaxed">{value}</p>
    </div>
  );
}
