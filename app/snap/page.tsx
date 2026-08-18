'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Zap } from 'lucide-react';

const MOCK_SNAP_RESULT = {
  name: 'Chanel No. 5',
  brand: 'Chanel',
  year: 1921,
  concentration: 'EDP',
  family: 'Floral Aldehyde',
  topNotes: ['Aldehyde', 'Neroli', 'Bergamot', 'Ylang-ylang'],
  heartNotes: ['Iris', 'Rose', 'Lily of the Valley', 'Jasmine'],
  baseNotes: ['Sandalwood', 'Vetiver', 'Civet', 'Oakmoss', 'Amber'],
  longevity: 8,
  sillage: 7,
  description: 'The most famous fragrance in the world. A timeless, complex aldehrdic floral that defined modern perfumery.',
};

export default function ScentSnapPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK_SNAP_RESULT | null>(null);
  const [text, setText] = useState('');

  const handleSnap = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setResult(MOCK_SNAP_RESULT);
  };

  return (
    <main className="min-h-screen pt-20 pb-16" style={{ background: '#080B0F' }}>
      <div className="max-w-2xl mx-auto px-6 pt-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera size={18} style={{ color: '#C8922A' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#C8922A' }}>ScentSnap™</span>
          </div>
          <h1 className="text-4xl text-white mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
            Identify any bottle <em style={{ color: '#C8922A' }}>instantly</em>
          </h1>
          <p className="text-ink-faint">Upload a photo or describe a fragrance for AI identification.</p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div
              onClick={handleSnap}
              className="glass-card p-12 cursor-pointer text-center transition-all hover:border-amber-500/30"
              style={{ borderStyle: 'dashed' }}
            >
              {loading ? (
                <motion.div className="flex flex-col items-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 rounded-full border-2 border-transparent" style={{ borderTopColor: '#C8922A' }} />
                  <p className="text-ink-faint font-mono text-sm">Identifying bottle…</p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Camera size={40} style={{ color: 'rgba(200,146,42,0.4)' }} />
                  <p className="text-ink-faint font-mono text-sm">Click to upload or take a photo</p>
                  <p className="text-ink-ghost font-mono text-xs">(demo: auto-identifies Chanel No. 5)</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-ink-faint font-mono text-xs">OR</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe the bottle or fragrance name…"
                className="flex-1 px-4 py-3 rounded-xl text-white placeholder-ink-ghost outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-sans)' }}
              />
              <button onClick={handleSnap} className="px-5 py-3 rounded-xl font-mono text-sm" style={{ background: 'linear-gradient(135deg, #C8922A, #8B5E1A)', color: 'white' }}>
                <Zap size={16} />
              </button>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-6 mb-4" style={{ borderColor: 'rgba(200,146,42,0.3)' }}>
              <p className="text-xs font-mono text-ink-faint uppercase mb-3">Identified</p>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl text-white" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>{result.name}</h2>
                  <p className="text-ink-soft font-mono text-sm mt-1">{result.brand} · {result.year} · {result.concentration}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-ink-faint mb-1">Longevity</div>
                  <div className="font-mono font-medium" style={{ color: '#C8922A' }}>{result.longevity}/10</div>
                </div>
              </div>
              <p className="text-ink-soft text-sm mb-4" style={{ fontFamily: 'var(--font-serif)' }}>{result.description}</p>
              <div className="space-y-3">
                {[
                  { label: 'Top', notes: result.topNotes, color: '#E8A83C' },
                  { label: 'Heart', notes: result.heartNotes, color: '#C2627A' },
                  { label: 'Base', notes: result.baseNotes, color: '#8B5E1A' },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-start gap-3">
                    <span className="text-xs font-mono text-ink-faint w-8 shrink-0 mt-1">{tier.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tier.notes.map((n) => (
                        <span key={n} className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: `${tier.color}20`, color: tier.color }}>{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setResult(null)} className="w-full py-3 rounded-xl font-mono text-sm text-ink-faint border border-white/08 hover:bg-white/5 transition-all">
              Identify Another
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
