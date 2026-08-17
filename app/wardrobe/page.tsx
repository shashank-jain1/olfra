'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';
import {
  useWardrobeStore,
  totalInvested,
  countByFamily,
  dnaAffinityFor,
  useDnaStore,
} from '@/store';
import { AddBottleDialog } from '@/components/wardrobe/AddBottleDialog';
import { useHydrated } from '@/lib/client/use-hydrated';

export default function WardrobePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const bottles = useWardrobeStore((state) => state.bottles);
  const removeBottle = useWardrobeStore((state) => state.removeBottle);
  const dnaProfile = useDnaStore((state) => state.profile);

  // Persisted stores rehydrate after mount; rendering their contents on the
  // server would produce a hydration mismatch.
  const hydrated = useHydrated();

  const invested = totalInvested(bottles);
  const families = countByFamily(bottles);

  return (
    <main className="min-h-screen pt-20 pb-16 bg-obsidian">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <header className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={16} className="text-amber" />
              <span className="font-mono text-xs uppercase tracking-widest text-amber">
                My Wardrobe
              </span>
            </div>
            <h1 className="text-3xl text-white font-serif font-light">
              {!hydrated
                ? 'Your collection'
                : bottles.length === 0
                  ? 'Your collection is empty'
                  : `${bottles.length} bottle${bottles.length === 1 ? '' : 's'} in your collection`}
            </h1>
          </div>

          <motion.button
            type="button"
            onClick={() => setDialogOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs shrink-0 bg-amber/15 text-amber border border-amber/30 hover:bg-amber/25 transition-colors"
          >
            <Plus size={12} /> Add Bottle
          </motion.button>
        </header>

        {hydrated && bottles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatTile
              label="Bottles"
              value={String(bottles.length)}
              color="#C8922A"
            />
            <StatTile
              label="Total Invested"
              value={invested > 0 ? `$${invested.toLocaleString()}` : '—'}
              color="#2FFFA8"
            />
            <StatTile
              label="Top Family"
              value={families[0]?.family ?? '—'}
              color="#A8CC2C"
              small
            />
          </div>
        )}

        {!hydrated ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/30 font-mono text-xs uppercase tracking-widest">
              Loading your collection…
            </p>
          </div>
        ) : bottles.length === 0 ? (
          <EmptyState onAdd={() => setDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {bottles.map((bottle) => {
                const affinity = dnaAffinityFor(dnaProfile, bottle.family ?? '');

                return (
                  <motion.article
                    key={bottle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="min-w-0">
                        <h3 className="text-white font-serif text-lg truncate">
                          {bottle.name}
                        </h3>
                        <p className="text-white/40 font-mono text-xs truncate">
                          {bottle.brand}
                          {bottle.concentration && bottle.concentration !== 'Unknown'
                            ? ` · ${bottle.concentration}`
                            : ''}
                          {bottle.bottleSizeMl ? ` · ${bottle.bottleSizeMl}ml` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBottle(bottle.id)}
                        className="text-white/20 hover:text-crimson transition-colors shrink-0 p-1"
                        aria-label={`Remove ${bottle.name} from wardrobe`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {bottle.family && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber/10 text-amber">
                          {bottle.family}
                        </span>
                      )}
                      {affinity !== null && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-mint/10 text-mint"
                          title="Match against your ScentDNA profile"
                        >
                          {affinity}% DNA fit
                        </span>
                      )}
                    </div>

                    {typeof bottle.purchasePrice === 'number' && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono text-white/30">Paid</span>
                        <span className="font-mono text-white/70">
                          ${bottle.purchasePrice}
                        </span>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {hydrated && bottles.length > 0 && (
          <p className="mt-8 text-white/25 text-[12px] leading-relaxed">
            Saved in this browser only. Sign-in and cross-device sync arrive with
            accounts — see the roadmap.
          </p>
        )}
      </div>

      <AddBottleDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </main>
  );
}

function StatTile({
  label,
  value,
  color,
  small = false,
}: {
  label: string;
  value: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-xs font-mono text-white/30 uppercase mb-1">{label}</div>
      <div
        className={`font-mono font-medium truncate ${small ? 'text-sm' : 'text-xl'}`}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-amber/5 border border-amber/15">
        <ShoppingBag size={24} className="text-amber/50" />
      </div>
      <p className="text-white/60 font-serif text-xl mb-2">Nothing here yet</p>
      <p className="text-white/35 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
        Add the bottles you own to track what you have paid, see which families you
        gravitate toward, and check new finds against your collection.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-[11px] uppercase tracking-[0.15em] bg-amber/15 text-amber border border-amber/30 hover:bg-amber/25 transition-colors"
      >
        <Plus size={12} /> Add your first bottle
      </button>
    </div>
  );
}
