'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, Users, BarChart2, X } from 'lucide-react';

// ─── Mock Trend Data ──────────────────────────────────────────
const CITIES = [
  { name: 'Mumbai', lat: 73, lng: 56, trend: 'Oud & Amber', velocity: 'fast', colorClass: 'text-amber', bgClass: 'bg-amber', shadowClass: 'shadow-[0_0_12px_rgba(200,146,42,0.8)]', borderClass: 'border-amber/40', glowClass: 'bg-amber/20 border-amber/60' },
  { name: 'Dubai', lat: 63, lng: 51, trend: 'Rose Oud', velocity: 'fast', colorClass: 'text-crimson', bgClass: 'bg-crimson', shadowClass: 'shadow-[0_0_12px_rgba(192,57,43,0.8)]', borderClass: 'border-crimson/40', glowClass: 'bg-crimson/20 border-crimson/60' },
  { name: 'Paris', lat: 49, lng: 27, trend: 'Iris & Musks', velocity: 'medium', colorClass: 'text-lime', bgClass: 'bg-lime', shadowClass: 'shadow-[0_0_12px_rgba(168,204,44,0.8)]', borderClass: 'border-lime/40', glowClass: 'bg-lime/20 border-lime/60' },
  { name: 'London', lat: 47, lng: 25, trend: 'Vetiver Green', velocity: 'medium', colorClass: 'text-lime', bgClass: 'bg-lime', shadowClass: 'shadow-[0_0_12px_rgba(168,204,44,0.8)]', borderClass: 'border-lime/40', glowClass: 'bg-lime/20 border-lime/60' },
  { name: 'New York', lat: 46, lng: 12, trend: 'Clean Musk', velocity: 'fast', colorClass: 'text-amber', bgClass: 'bg-amber', shadowClass: 'shadow-[0_0_12px_rgba(200,146,42,0.8)]', borderClass: 'border-amber/40', glowClass: 'bg-amber/20 border-amber/60' },
  { name: 'Tokyo', lat: 55, lng: 79, trend: 'Hinoki Wood', velocity: 'medium', colorClass: 'text-mint', bgClass: 'bg-mint', shadowClass: 'shadow-[0_0_12px_rgba(47,255,168,0.8)]', borderClass: 'border-mint/40', glowClass: 'bg-mint/20 border-mint/60' },
  { name: 'Seoul', lat: 52, lng: 78, trend: 'Aquatic Fresh', velocity: 'slow', colorClass: 'text-mint', bgClass: 'bg-mint', shadowClass: 'shadow-[0_0_12px_rgba(47,255,168,0.8)]', borderClass: 'border-mint/40', glowClass: 'bg-mint/20 border-mint/60' },
  { name: 'São Paulo', lat: 67, lng: 18, trend: 'Tropical Florals', velocity: 'medium', colorClass: 'text-rose', bgClass: 'bg-rose', shadowClass: 'shadow-[0_0_12px_rgba(194,98,122,0.8)]', borderClass: 'border-rose/40', glowClass: 'bg-rose/20 border-rose/60' },
  { name: 'Lagos', lat: 57, lng: 32, trend: 'Sweet Vanillic', velocity: 'slow', colorClass: 'text-rose', bgClass: 'bg-rose', shadowClass: 'shadow-[0_0_12px_rgba(194,98,122,0.8)]', borderClass: 'border-rose/40', glowClass: 'bg-rose/20 border-rose/60' },
  { name: 'Riyadh', lat: 57, lng: 53, trend: 'Smoky Oud', velocity: 'fast', colorClass: 'text-crimson', bgClass: 'bg-crimson', shadowClass: 'shadow-[0_0_12px_rgba(192,57,43,0.8)]', borderClass: 'border-crimson/40', glowClass: 'bg-crimson/20 border-crimson/60' },
  { name: 'LA', lat: 49, lng: 7, trend: 'Solar Beach', velocity: 'medium', colorClass: 'text-lime', bgClass: 'bg-lime', shadowClass: 'shadow-[0_0_12px_rgba(168,204,44,0.8)]', borderClass: 'border-lime/40', glowClass: 'bg-lime/20 border-lime/60' },
  { name: 'Singapore', lat: 61, lng: 76, trend: 'Spiced Patchouli', velocity: 'slow', colorClass: 'text-amber', bgClass: 'bg-amber', shadowClass: 'shadow-[0_0_12px_rgba(200,146,42,0.8)]', borderClass: 'border-amber/40', glowClass: 'bg-amber/20 border-amber/60' },
];

const TRENDING_NOTES = [
  { name: 'Oud', family: '🌿 Wood', change: '+34%', positive: true },
  { name: 'Iris', family: '🌸 Floral', change: '+21%', positive: true },
  { name: 'Ambergris', family: '🌊 Marine', change: '+18%', positive: true },
  { name: 'Rose', family: '🌹 Floral', change: '+12%', positive: true },
  { name: 'Vetiver', family: '🌱 Green', change: '+9%', positive: true },
  { name: 'Aquatics', family: '💧 Fresh', change: '-5%', positive: false },
];

const DEMOGRAPHICS = [
  { label: 'Men', data: [40, 25, 20, 10, 5], top: 'Woody Aromatic' },
  { label: 'Women', data: [35, 30, 20, 10, 5], top: 'Floral Musk' },
  { label: 'Unisex', data: [30, 28, 22, 12, 8], top: 'Oriental Amber' },
  { label: 'Gen Z', data: [45, 22, 18, 10, 5], top: 'Sweet Gourmand' },
];

const FAMILIES = ['Woody', 'Floral', 'Oriental', 'Fresh', 'Musk'];
const FAMILY_COLORS = ['bg-amber', 'bg-rose', 'bg-amber-light', 'bg-lime', 'bg-mint'];

export default function ScentCulturePage() {
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [activeDemographic, setActiveDemographic] = useState(0);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-20 pb-16 bg-obsidian">
      {/* Header */}
      <div className="relative pt-16 pb-12 px-6 text-center bg-gradient-to-b from-lime/5 to-transparent">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe size={18} className="text-lime" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-lime">ScentCulture™</span>
          </div>
          <h1 className="text-5xl md:text-6xl text-ink mb-6 font-serif font-light tracking-tight">
            What the world is <em className="text-lime italic pr-1">smelling</em> right now
          </h1>
          <p className="text-ink-faint text-lg font-light tracking-wide max-w-2xl mx-auto">
            Real-time fragrance trend intelligence across 12 global cities
          </p>
        </motion.div>
      </div>

      {/* World Map */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden mb-16 bg-obsidian-2 border border-white/5 shadow-2xl">
          <div className="relative w-full aspect-[2/1] min-h-[400px]">
            {/* Grid lines overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(168,204,44,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,204,44,1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Map base */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-[200px] md:text-[300px] font-serif select-none grayscale">🌍</div>
            </div>
            
            {/* City dots */}
            {CITIES.map((city) => (
              <button
                key={city.name}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${city.lng}%`, top: `${city.lat}%` }}
                onMouseEnter={() => setHoveredCity(city.name)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={() => setSelectedCity(city)}
                aria-label={`View trends for ${city.name}`}
              >
                {/* Pulse ring */}
                <div
                  className={`absolute w-10 h-10 rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 border ${city.glowClass}`}
                  style={{
                    animation: `pulse-ring ${city.velocity === 'fast' ? '1.5s' : city.velocity === 'medium' ? '2.5s' : '4s'} cubic-bezier(0.16, 1, 0.3, 1) infinite`,
                  }}
                />
                {/* Inner dot */}
                <div
                  className={`relative w-2.5 h-2.5 rounded-full z-10 transition-transform duration-300 group-hover:scale-[2] ${city.bgClass} ${city.shadowClass}`}
                />
                
                {/* Tooltip */}
                <AnimatePresence>
                {hoveredCity === city.name && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute bottom-6 left-1/2 z-20 whitespace-nowrap px-4 py-2.5 rounded-xl text-xs -translate-x-1/2 bg-obsidian-3/95 border backdrop-blur-md shadow-2xl ${city.borderClass}`}
                  >
                    <div className="font-medium text-ink font-serif text-sm tracking-wide mb-1">{city.name}</div>
                    <div className={`${city.colorClass} text-[10px] font-mono uppercase tracking-wider`}>↑ {city.trend}</div>
                  </motion.div>
                )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* City Panel */}
          <AnimatePresence>
          {selectedCity && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`absolute top-0 right-0 bottom-0 w-80 p-8 bg-obsidian-3/95 backdrop-blur-2xl border-l shadow-2xl ${selectedCity.borderClass}`}
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-3xl text-ink font-serif font-light mb-2">{selectedCity.name}</h3>
                  <p className="text-[10px] font-mono text-ink-faint uppercase tracking-[0.15em]">This Week&apos;s Trend</p>
                </div>
                <button 
                  onClick={() => setSelectedCity(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full glass border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <X size={14} className="text-ink-soft" />
                </button>
              </div>

              <div className={`glass p-6 rounded-2xl mb-8 border ${selectedCity.borderClass} bg-white/[0.02]`}>
                <div className={`text-2xl mb-3 font-serif italic ${selectedCity.colorClass}`}>
                  {selectedCity.trend}
                </div>
                <div className="text-[11px] font-mono text-ink-faint uppercase tracking-widest flex items-center gap-2">
                  Velocity: <span className="text-ink-muted">{selectedCity.velocity === 'fast' ? '🔥 Hot' : selectedCity.velocity === 'medium' ? '📈 Rising' : '📊 Steady'}</span>
                </div>
              </div>

              <div className="space-y-1">
                {['Top 5 Fragrances', 'Regional Shoppers', 'Age Distribution'].map((item) => (
                  <div key={item} className="text-[11px] font-mono text-ink-faint flex items-center justify-between py-4 border-b border-white/5 uppercase tracking-wider">
                    <span>{item}</span>
                    <span className="text-ink-ghost text-[9px]">Coming soon</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Two column layout: Trending Notes + Demographic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Trending Notes */}
          <div>
            <div className="flex items-center gap-3 mb-6 px-1">
              <TrendingUp size={18} className="text-lime" />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Trending Notes</h2>
            </div>
            <div className="space-y-3">
              {TRENDING_NOTES.map((note, i) => (
                <motion.div
                  key={note.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="glass p-5 rounded-xl flex items-center justify-between border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <span className="text-ink font-serif text-lg tracking-wide">{note.name}</span>
                    <span className="text-ink-faint text-[11px] uppercase tracking-wider ml-4 font-mono">{note.family}</span>
                  </div>
                  <span
                    className={`font-mono text-[13px] tracking-wider ${note.positive ? 'text-mint' : 'text-crimson'}`}
                  >
                    {note.change}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Demographic Intelligence */}
          <div>
            <div className="flex items-center gap-3 mb-6 px-1">
              <Users size={18} className="text-lime" />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Demographic Intel</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {DEMOGRAPHICS.map((d, i) => (
                <button
                  key={d.label}
                  onClick={() => setActiveDemographic(i)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-widest transition-all duration-300 border ${
                    activeDemographic === i 
                      ? 'bg-lime/10 text-lime border-lime/30 shadow-[0_0_15px_rgba(168,204,44,0.1)]' 
                      : 'bg-white/5 text-ink-faint border-transparent hover:bg-white/10 hover:text-ink-muted'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="glass p-8 rounded-2xl border-white/5">
              <p className="text-[10px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-2">Top Family</p>
              <p className="text-3xl mb-8 font-serif font-light text-lime">
                {DEMOGRAPHICS[activeDemographic].top}
              </p>

              <div className="space-y-5">
                {FAMILIES.map((fam, idx) => (
                  <div key={fam} className="flex items-center gap-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ink-faint w-24 shrink-0">{fam}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${DEMOGRAPHICS[activeDemographic].data[idx]}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${FAMILY_COLORS[idx]}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-ink-faint w-10 text-right">
                      {DEMOGRAPHICS[activeDemographic].data[idx]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Weekly Report */}
        <div className="pb-10">
          <div className="flex items-center gap-3 mb-6 px-1">
            <BarChart2 size={18} className="text-lime" />
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">AI Weekly Report</h2>
          </div>

          <div className="glass p-10 md:p-14 rounded-3xl relative overflow-hidden border-white/5">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-lime/40 to-transparent" />

            <div className="space-y-8 pl-4 max-w-4xl mx-auto">
              {[
                'Oud and amber-forward compositions continue their meteoric rise across Gulf markets and are now bleeding into Western European mainstream. Seoul and Tokyo maintain a preference for quieter, skin-close musks that pair with the wellness movement\'s demand for non-intrusive formulations.',
                'Regional Spotlight: Mumbai saw a 34% surge in bespoke oud blends this week — notably a shift from traditional Indian attars to French-house interpretations of oud. Maison Francis Kurkdjian and Amouage are the most-searched brands in the market, indicating rising aspirational luxury consumption.',
                'Forward Prediction: Expect the "quiet luxury" musk category to dominate entering next week as post-workday social occasions increase. Solar gourmands with coconut and solar musks will spike in the Southern Hemisphere approaching their late summer.',
              ].map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-ink-soft leading-loose font-serif text-lg md:text-xl tracking-wide"
                >
                  {para}
                </motion.p>
              ))}

              <motion.blockquote
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-2xl md:text-3xl text-ink italic pl-8 py-4 my-10 border-l-4 border-lime/50 font-serif leading-tight bg-gradient-to-r from-lime/5 to-transparent rounded-r-2xl"
              >
                &ldquo;The nose of 2026 is neither loud nor silent — it is precisely calibrated.&rdquo;
              </motion.blockquote>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
