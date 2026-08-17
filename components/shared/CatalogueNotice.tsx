'use client';

import { Info } from 'lucide-react';
import { useCapabilities } from '@/lib/client/hooks';

/**
 * Tells the user what data they are actually looking at.
 *
 * The previous build presented a hardcoded mock as a search across "74,000
 * fragrances". If we are running on the seed catalogue, we say so — an
 * honest limitation costs less trust than a discovered exaggeration.
 */
export function CatalogueNotice({ className = '' }: { className?: string }) {
  const { data } = useCapabilities();

  if (!data?.catalogue.seedOnly) return null;

  return (
    <div
      className={`glass p-4 rounded-2xl border-white/5 flex items-start gap-3 ${className}`}
    >
      <Info size={16} className="shrink-0 text-amber/70 mt-0.5" />
      <p className="text-[12px] text-white/50 leading-relaxed">
        Running on the built-in seed catalogue —{' '}
        <span className="text-white/70">a curated set of well-known releases</span>, not
        the full database. Scores are computed the same way; only the pool of
        candidates is smaller. Connect a catalogue source to search the full set.
      </p>
    </div>
  );
}
