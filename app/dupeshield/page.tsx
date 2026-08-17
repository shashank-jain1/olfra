'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { useDupeSearch } from '@/lib/client/hooks';
import { DupeCard } from '@/components/dupeshield/DupeCard';
import { CatalogueNotice } from '@/components/shared/CatalogueNotice';
import { ErrorNotice } from '@/components/shared/ErrorNotice';

const EXAMPLES = [
  'Baccarat Rouge 540',
  'Aventus',
  'Sauvage',
  'Oud Wood',
  'Layton',
  'Delina',
];

export default function DupeShieldPage() {
  const [query, setQuery] = useState('');
  const search = useDupeSearch();

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) search.mutate(trimmed);
  };

  const runExample = (example: string) => {
    setQuery(example);
    search.mutate(example);
  };

  const report = search.data;

  return (
    <main className="min-h-screen pt-20 pb-24 bg-obsidian">
      <div className="relative overflow-hidden pt-20 pb-16 px-6 bg-gradient-to-b from-rose/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose/10 border border-rose/30 shadow-[0_0_20px_rgba(194,98,122,0.15)]">
                <Shield size={20} className="text-rose" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-rose">
                DupeShield™
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl text-white/90 mb-6 font-serif font-light tracking-tight leading-tight">
              Find the <em className="text-rose italic font-light pr-2">perfect dupe</em>
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-light tracking-wide mb-12 max-w-2xl mx-auto">
              Similarity scored from accord structure and drydown overlap. Same
              search, same score, every time.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
              <div className="relative flex items-center">
                <Search
                  size={20}
                  className="absolute left-6 text-white/30 transition-colors group-focus-within:text-rose pointer-events-none"
                />
                <label htmlFor="dupe-query" className="sr-only">
                  Fragrance name
                </label>
                <input
                  id="dupe-query"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search any fragrance… e.g. Baccarat Rouge 540"
                  className="w-full pl-16 pr-40 py-6 rounded-full text-white/90 placeholder-white/30 outline-none transition-all duration-300 bg-white/[0.03] border border-white/10 focus:border-rose/50 focus:bg-white/[0.05] font-sans text-lg tracking-wide"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={search.isPending || !query.trim()}
                  className="absolute right-3 px-8 py-4 rounded-full font-mono text-[11px] uppercase tracking-[0.2em] transition-all bg-white text-obsidian hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {search.isPending ? <Zap size={16} className="animate-pulse" /> : 'ANALYZE'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        {search.isPending && <LoadingState />}

        {search.isError && (
          <ErrorNotice
            error={search.error}
            onRetry={() => query.trim() && search.mutate(query.trim())}
          />
        )}

        {report && !search.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <OriginalCard report={report} />

            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-8 h-px bg-white/20" />
                  {report.matches.length} match
                  {report.matches.length === 1 ? '' : 'es'} from{' '}
                  {report.candidatePoolSize} candidates
                </p>
              </div>

              {report.matches.length === 0 ? (
                <div className="glass p-10 rounded-3xl border-white/5 text-center">
                  <p className="text-white/60 font-serif text-xl leading-relaxed">
                    {report.summary}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {report.matches.map((match, index) => (
                    <DupeCard key={match.fragrance.id} match={match} index={index} />
                  ))}
                </div>
              )}

              <div className="mt-12 space-y-4">
                <CatalogueNotice />
                <div className="glass p-6 rounded-2xl border-white/5 flex items-start gap-4">
                  <AlertCircle size={20} className="shrink-0 text-amber mt-0.5" />
                  <p className="text-sm text-white/50 font-serif leading-relaxed italic pr-4">
                    Scores measure olfactory overlap, not identity. Skin chemistry
                    changes the drydown enough that a 90% match can still smell
                    distinctly different on you — always sample before committing.
                    Prices are approximate and drift constantly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!report && !search.isPending && !search.isError && (
          <EmptyState onPick={runExample} />
        )}
      </div>
    </main>
  );
}

function OriginalCard({ report }: { report: NonNullable<ReturnType<typeof useDupeSearch>['data']> }) {
  const { original } = report;
  const allNotes = [
    ...original.notes.top,
    ...original.notes.heart,
    ...original.notes.base,
  ];

  return (
    <div className="mb-14">
      <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <span className="w-8 h-px bg-white/20" /> Original Reference
      </p>
      <div className="glass p-8 md:p-10 rounded-3xl border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl text-white/90 font-serif font-light mb-2 tracking-tight">
              {original.name}
            </h2>
            <p className="text-white/50 font-mono text-sm tracking-widest uppercase mb-6">
              {original.brand}
              {original.year ? ` · ${original.year}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {allNotes.slice(0, 6).map((note) => (
                <span
                  key={note}
                  className="text-[11px] px-3 py-1.5 rounded-full font-mono bg-rose/10 text-rose border border-rose/20"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
          <div className="md:text-right shrink-0 relative z-10">
            {typeof original.priceUSD === 'number' && (
              <p className="text-5xl font-mono font-light text-white/90 mb-2">
                ~${original.priceUSD}
              </p>
            )}
            <p className="text-white/40 font-mono text-[11px] uppercase tracking-widest">
              {original.family ?? original.concentration}
            </p>
          </div>
        </div>
      </div>

      <p className="text-white/50 font-serif text-lg leading-relaxed mt-6 px-2">
        {report.summary}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-24" role="status" aria-live="polite">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border border-white/5 border-t-rose border-r-rose/30 mx-auto mb-8"
      />
      <p className="mt-6 text-white/40 font-mono text-[11px] uppercase tracking-[0.2em]">
        Scoring accord profiles…
      </p>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (example: string) => void }) {
  return (
    <div className="text-center py-24">
      <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center bg-rose/5 border border-rose/10">
        <Sparkles size={32} className="text-rose/40" />
      </div>
      <p className="text-white/30 font-mono text-[13px] uppercase tracking-widest mb-10">
        Try one of these
      </p>
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-12">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="px-5 py-2.5 rounded-full text-[12px] font-mono transition-all duration-300 bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/10 hover:text-white/90 hover:border-white/20"
          >
            {example}
          </button>
        ))}
      </div>
      <div className="max-w-2xl mx-auto">
        <CatalogueNotice />
      </div>
    </div>
  );
}
