'use client';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { User, Star, Dna, ShoppingBag, Globe } from 'lucide-react';

const MOCK_PROFILE = {
  username: 'me',
  displayName: 'You',
  bio: 'Fragrance enthusiast. Collector of rare orientals and classic chypres.',
  location: 'Mumbai, India',
  bottles: 12,
  swaps: 3,
  followers: 142,
  following: 89,
  dna: { score: 84, profile: 'Warm & Humid · Spice-forward' },
  recentFragrances: [
    { name: 'Bleu de Chanel', brand: 'Chanel' },
    { name: 'Sauvage', brand: 'Dior' },
    { name: 'Baccarat Rouge 540', brand: 'MFK' },
    { name: 'Tobacco Oud', brand: 'Tom Ford' },
  ],
};

export default function ProfilePage() {
  // Previously this component ignored its route param entirely, so
  // /profile/anyone rendered the same hardcoded person. Read it, so the
  // page reflects the URL until real profiles land with auth.
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params?.username ?? 'me');

  const p = {
    ...MOCK_PROFILE,
    username,
    displayName: username === 'me' ? 'You' : `@${username}`,
  };

  return (
    <main className="min-h-screen pt-20 pb-16" style={{ background: '#080B0F' }}>
      <div className="max-w-2xl mx-auto px-6 pt-12">
        {/* Profile Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C8922A, #8B5E1A)', fontSize: '24px' }}
            >
              <User size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl text-white" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>{p.displayName}</h1>
              <p className="text-ink-faint font-mono text-xs mt-0.5">@{p.username} · {p.location}</p>
              <p className="text-ink-soft text-sm mt-2" style={{ fontFamily: 'var(--font-serif)' }}>{p.bio}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Bottles', value: p.bottles, icon: <ShoppingBag size={12} /> },
              { label: 'Swaps', value: p.swaps, icon: <Globe size={12} /> },
              { label: 'Followers', value: p.followers, icon: <Star size={12} /> },
              { label: 'Following', value: p.following, icon: <User size={12} /> },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-mono font-medium text-white">{s.value}</div>
                <div className="flex items-center justify-center gap-1 mt-1 text-ink-faint" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DNA Profile Card */}
        <div className="glass-card p-5 mb-6" style={{ borderColor: 'rgba(47,255,168,0.2)' }}>
          <div className="flex items-center gap-3">
            <Dna size={20} style={{ color: '#2FFFA8' }} />
            <div>
              <p className="text-xs font-mono text-ink-faint uppercase">ScentDNA Profile</p>
              <p className="text-white font-medium mt-0.5" style={{ fontFamily: 'var(--font-serif)' }}>{p.dna.profile}</p>
            </div>
            <div className="ml-auto font-mono font-medium text-2xl" style={{ color: '#2FFFA8' }}>{p.dna.score}</div>
          </div>
        </div>

        {/* Recent Fragrances */}
        <div className="glass-card p-5">
          <p className="text-xs font-mono text-ink-faint uppercase mb-4">Recent Fragrances</p>
          <div className="space-y-3">
            {p.recentFragrances.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-ghost" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Star size={12} />
                </div>
                <div>
                  <p className="text-sm text-white" style={{ fontFamily: 'var(--font-serif)' }}>{f.name}</p>
                  <p className="text-xs text-ink-faint font-mono">{f.brand}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
