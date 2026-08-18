'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, BookmarkPlus } from 'lucide-react';

const MOCK_FEED = [
  {
    id: '1',
    user: 'alejandroR',
    avatar: 'AR',
    fragrance: 'Creed Aventus',
    caption: 'The first true cold morning of autumn. Aventus bonfires are unreal on cold skin — the smokiness lingers like a ghost in wool.',
    notes: ['Birch', 'Patchouli', 'Musk'],
    likes: 312,
    comments: 24,
    dnaMatch: 78,
  },
  {
    id: '2',
    user: 'nishaMV',
    avatar: 'NM',
    fragrance: 'BR540 Extrait',
    caption: 'Three hours in and it still turns heads in every meeting. The amberwood is just extraordinary — like warm skin, magnified.',
    notes: ['Saffron', 'Jasmine', 'Amberwood'],
    likes: 524,
    comments: 41,
    dnaMatch: 91,
  },
  {
    id: '3',
    user: 'sebastianW',
    avatar: 'SW',
    fragrance: 'Chanel No. 5 EDP',
    caption: 'Wore this to a client dinner. Three people asked what I was wearing. The iris-rose heart is simply timeless — no trend will ever kill it.',
    notes: ['Iris', 'Rose', 'Aldehyde'],
    likes: 187,
    comments: 15,
    dnaMatch: 53,
  },
  {
    id: '4',
    user: 'marieTL',
    avatar: 'MT',
    fragrance: 'Tobacco Oud — Tom Ford',
    caption: 'Late night Paris café. Tobacco Oud is sinful on a cold stone terrace — the smoke becomes you.',
    notes: ['Tobacco', 'Oud', 'Vanilla'],
    likes: 409,
    comments: 38,
    dnaMatch: 88,
  },
];

function dnaColor(n: number) {
  if (n >= 90) return { bg: 'rgba(47,255,168,0.1)', color: '#2FFFA8', label: 'Perfect Match' };
  if (n >= 70) return { bg: 'rgba(200,146,42,0.1)', color: '#C8922A', label: 'Good Match' };
  if (n >= 50) return { bg: 'rgba(200,146,42,0.1)', color: '#E8A83C', label: 'Try Before Buy' };
  return { bg: 'rgba(192,57,43,0.1)', color: '#C0392B', label: 'May Not Suit You' };
}

export default function ScentSocialPage() {
  const [liked, setLiked] = useState<Set<string>>(new Set());

  return (
    <main className="min-h-screen pt-20 pb-16" style={{ background: '#080B0F' }}>
      <div className="max-w-xl mx-auto px-6 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-white mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
            ScentSocial<em style={{ color: '#C8922A' }}>™</em>
          </h1>
          <p className="text-ink-faint text-sm">What the community is wearing right now</p>
        </div>

        <div className="space-y-4">
          {MOCK_FEED.map((post, i) => {
            const dna = dnaColor(post.dnaMatch);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                {/* User */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-medium"
                      style={{ background: 'linear-gradient(135deg, #C8922A, #8B5E1A)', color: 'white' }}
                    >
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-mono text-sm text-white">@{post.user}</p>
                      <p className="text-xs text-ink-faint font-mono">{post.fragrance}</p>
                    </div>
                  </div>
                  {/* DNA Match Badge */}
                  <div className="px-2 py-1 rounded-full text-xs font-mono" style={{ background: dna.bg, color: dna.color }}>
                    {post.dnaMatch}% match
                  </div>
                </div>

                {/* Caption */}
                <p className="text-ink-muted leading-relaxed mb-3" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>
                  {post.caption}
                </p>

                {/* Notes */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.notes.map((n) => (
                    <span key={n} className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(200,146,42,0.1)', color: '#C8922A' }}>{n}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() =>
                      setLiked((prev) => {
                        const next = new Set(prev);
                        if (next.has(post.id)) next.delete(post.id);
                        else next.add(post.id);
                        return next;
                      })
                    }
                    className="flex items-center gap-1.5 text-sm font-mono transition-colors"
                    style={{ color: liked.has(post.id) ? '#C2627A' : 'rgba(255,255,255,0.3)' }}
                  >
                    <Heart size={14} fill={liked.has(post.id) ? '#C2627A' : 'none'} />
                    {post.likes + (liked.has(post.id) ? 1 : 0)}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-mono text-ink-faint hover:text-ink-soft transition-colors">
                    <MessageCircle size={14} /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-mono text-ink-faint hover:text-ink-soft transition-colors">
                    <BookmarkPlus size={14} />
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-mono text-ink-faint hover:text-ink-soft transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
