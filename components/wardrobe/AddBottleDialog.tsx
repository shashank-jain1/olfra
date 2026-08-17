'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { useFragranceSearch } from '@/lib/client/hooks';
import { useWardrobeStore } from '@/store';
import type { Fragrance } from '@/lib/fragrance/types';

/**
 * Add-bottle flow. Search the catalogue to link a real fragrance record —
 * or add anything by hand, because no catalogue covers every bottle a
 * collector owns.
 */
export function AddBottleDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Fragrance | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [price, setPrice] = useState('');
  const [sizeMl, setSizeMl] = useState('');

  const search = useFragranceSearch(query, !selected);
  const addBottle = useWardrobeStore((state) => state.addBottle);

  const reset = () => {
    setQuery('');
    setSelected(null);
    setManualName('');
    setManualBrand('');
    setPrice('');
    setSizeMl('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const name = selected?.name ?? manualName.trim();
    const brand = selected?.brand ?? manualBrand.trim();
    if (!name || !brand) return;

    addBottle({
      fragranceId: selected?.id,
      name,
      brand,
      concentration: selected?.concentration,
      family: selected?.family,
      bottleSizeMl: sizeMl ? Number(sizeMl) : undefined,
      purchasePrice: price ? Number(price) : undefined,
    });

    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Add a bottle to your wardrobe"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl bg-obsidian-2 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="font-serif text-xl text-white/90">Add a bottle</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
              {selected ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber/5 border border-amber/20">
                  <div>
                    <p className="text-white/90 font-serif text-lg">{selected.name}</p>
                    <p className="text-white/40 font-mono text-xs">
                      {selected.brand}
                      {selected.concentration !== 'Unknown' && ` · ${selected.concentration}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-white/30 hover:text-white/70 text-xs font-mono"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="bottle-search"
                    className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2"
                  >
                    Search the catalogue
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      id="bottle-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="e.g. Layton"
                      autoComplete="off"
                      className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/90 placeholder-white/25 outline-none focus:border-amber/40 text-sm"
                    />
                    {search.isFetching && (
                      <Loader2
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 animate-spin"
                      />
                    )}
                  </div>

                  {search.data && search.data.results.length > 0 && (
                    <ul className="mt-2 rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
                      {search.data.results.slice(0, 5).map((fragrance) => (
                        <li key={fragrance.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(fragrance);
                              setQuery('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                          >
                            <span className="text-white/80 text-sm block">
                              {fragrance.name}
                            </span>
                            <span className="text-white/35 font-mono text-[11px]">
                              {fragrance.brand}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {query.trim().length >= 2 &&
                    search.data?.results.length === 0 &&
                    !search.isFetching && (
                      <p className="mt-3 text-white/35 text-[12px] leading-relaxed">
                        Not in the catalogue — add it by hand below.
                      </p>
                    )}
                </div>
              )}

              {!selected && (
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="manual-name"
                    label="Name"
                    value={manualName}
                    onChange={setManualName}
                    placeholder="Fragrance name"
                  />
                  <Field
                    id="manual-brand"
                    label="Brand"
                    value={manualBrand}
                    onChange={setManualBrand}
                    placeholder="House"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="bottle-price"
                  label="Paid (USD)"
                  value={price}
                  onChange={setPrice}
                  placeholder="145"
                  type="number"
                />
                <Field
                  id="bottle-size"
                  label="Size (ml)"
                  value={sizeMl}
                  onChange={setSizeMl}
                  placeholder="100"
                  type="number"
                />
              </div>

              <button
                type="submit"
                disabled={!selected && (!manualName.trim() || !manualBrand.trim())}
                className="w-full py-3.5 rounded-xl font-mono text-[11px] uppercase tracking-[0.2em] bg-gradient-to-br from-amber-light to-amber text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                Add to wardrobe
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={type === 'number' ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/90 placeholder-white/25 outline-none focus:border-amber/40 text-sm"
      />
    </div>
  );
}
