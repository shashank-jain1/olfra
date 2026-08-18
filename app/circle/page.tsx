'use client';
import { motion } from 'framer-motion';
import { RefreshCw, Plus } from 'lucide-react';

const MOCK_LISTINGS = [
  { id: '1', title: 'Creed Aventus 30ml', user: 'AlejandroR', location: 'Paris', type: 'Swap', seeking: 'Tom Ford equivalent', price: null, ml: 30 },
  { id: '2', title: 'Maison Margiela Replica — Lazy Sunday 50ml', user: 'NishaMV', location: 'Mumbai', type: 'Sale', seeking: null, price: 65, ml: 50 },
  { id: '3', title: 'MEMO Paris African Leather 5ml Sample', user: 'SebastianW', location: 'Berlin', type: 'Sample', seeking: null, price: 12, ml: 5 },
  { id: '4', title: 'Tobacco Oud Tom Ford 10ml Decant', user: 'XiuL', location: 'Singapore', type: 'Sale', seeking: null, price: 55, ml: 10 },
  { id: '5', title: 'Baccarat Rouge 540 Extrait 50ml (80% full)', user: 'MarieT', location: 'Lyon', type: 'Swap', seeking: 'Amouage Interlude', price: null, ml: 40 },
  { id: '6', title: 'Niche Sample Pack — 10 × 2ml', user: 'RaviK', location: 'Dubai', type: 'Sale', seeking: null, price: 48, ml: 20 },
];

const typeColors: Record<string, string> = { Swap: '#2FFFA8', Sale: '#C8922A', Sample: '#C2627A' };

export default function ScentCirclePage() {
  return (
    <main className="min-h-screen pt-20 pb-16" style={{ background: '#080B0F' }}>
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={16} style={{ color: '#C8922A' }} />
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#C8922A' }}>ScentCircle™</span>
            </div>
            <h1 className="text-3xl text-white" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
              P2P Fragrance Marketplace
            </h1>
            <p className="text-ink-faint text-sm mt-1">Swap, sell, and sample with the global fragrance community</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm"
            style={{ background: 'linear-gradient(135deg, #C8922A, #8B5E1A)', color: 'white', fontSize: '12px' }}
          >
            <Plus size={14} /> List Item
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_LISTINGS.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 cursor-pointer"
              whileHover={{ scale: 1.02, y: -3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2 py-0.5 rounded-full font-mono text-xs"
                  style={{ background: `${typeColors[listing.type]}20`, color: typeColors[listing.type], border: `1px solid ${typeColors[listing.type]}44` }}
                >
                  {listing.type}
                </span>
                <span className="font-mono text-xs text-ink-faint">{listing.ml}ml</span>
              </div>

              <h3 className="text-white font-medium mb-1" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', lineHeight: 1.3 }}>{listing.title}</h3>
              <p className="text-ink-faint font-mono text-xs mb-3">{listing.user} · {listing.location}</p>

              {listing.seeking && (
                <div className="flex items-center gap-1.5 mb-3">
                  <RefreshCw size={11} className="text-ink-faint" />
                  <span className="text-xs text-ink-faint font-mono">Seeking: {listing.seeking}</span>
                </div>
              )}

              {listing.price && (
                <div className="text-xl font-mono font-medium" style={{ color: '#C8922A' }}>${listing.price}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
