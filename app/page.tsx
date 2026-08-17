'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Globe, Sparkles, Dna, ArrowRight, Star } from 'lucide-react';

// ─── CSS Shader Background ─────────────────────────────────────
function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let t = 0;
    let animId: number;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', resize);

    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

    function noise(x: number, y: number, time: number) {
      return (
        Math.sin(x * 0.8 + time) * 0.5 +
        Math.sin(y * 0.6 + time * 0.7) * 0.5 +
        Math.sin((x + y) * 0.4 + time * 1.2) * 0.3
      );
    }

    const blobs = [
      { x: 0.3, y: 0.4, r: 0.35, color: [200, 146, 42], speed: 0.2 },
      { x: 0.7, y: 0.5, r: 0.28, color: [139, 94, 26], speed: 0.15 }, /* Amber deep */
      { x: 0.5, y: 0.7, r: 0.22, color: [232, 168, 60], speed: 0.25 }, /* Amber light */
    ];

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#06080A'; // Deep obsidian
      ctx.fillRect(0, 0, W, H);

      blobs.forEach((b) => {
        const nx = noise(b.x * 3, b.y * 3, t * b.speed);
        const ny = noise(b.y * 3, b.x * 3, t * b.speed + 10);
        const cx = lerp(0, W, b.x + nx * 0.15);
        const cy = lerp(0, H, b.y + ny * 0.15);
        const radius = Math.min(W, H) * b.r;

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, `rgba(${b.color.join(',')},0.12)`); // Softened opacity
        g.addColorStop(0.5, `rgba(${b.color.join(',')},0.04)`);
        g.addColorStop(1, `rgba(${b.color.join(',')},0)`);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Ultra-fine grain overlay
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.01})`;
        ctx.fillRect(x, y, 1, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full mix-blend-screen opacity-70"
    />
  );
}


// ─── Module Card for scroll section ───────────────────────────
const MODULES = [
  {
    icon: <Shield size={48} strokeWidth={1} />, // Thinner icons for premium feel
    name: 'DupeShield',
    desc: 'AI-powered dupe detection & brand protection intelligence',
    href: '/dupeshield',
    colorVar: 'var(--color-crimson)',
    bgClass: 'hover:border-crimson/30 hover:shadow-[0_8px_30px_rgba(192,57,43,0.06)]',
    textClass: 'text-crimson',
  },
  {
    icon: <Globe size={48} strokeWidth={1} />,
    name: 'ScentCulture',
    desc: 'Real-time global fragrance trend intelligence dashboard',
    href: '/culture',
    colorVar: 'var(--color-lime)',
    bgClass: 'hover:border-lime/30 hover:shadow-[0_8px_30px_rgba(168,204,44,0.06)]',
    textClass: 'text-lime',
  },
  {
    icon: <Sparkles size={48} strokeWidth={1} />,
    name: 'ScentMoment',
    desc: 'Occasion & mood-based fragrance recommendation engine',
    href: '/moment',
    colorVar: 'var(--color-rose)',
    bgClass: 'hover:border-rose/30 hover:shadow-[0_8px_30px_rgba(194,98,122,0.06)]',
    textClass: 'text-rose',
  },
  {
    icon: <Dna size={48} strokeWidth={1} />,
    name: 'ScentDNA',
    desc: 'Skin chemistry profiler — predicts how scent evolves on YOU',
    href: '/dna',
    colorVar: 'var(--color-mint)',
    bgClass: 'hover:border-mint/30 hover:shadow-[0_8px_30px_rgba(47,255,168,0.06)]',
    textClass: 'text-mint',
  },
];

function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section ref={ref} className="py-40 px-6 overflow-hidden bg-obsidian-2 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-24"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30 mb-6">The Four Pillars</p>
          <h2 className="text-4xl md:text-5xl text-white font-serif font-light tracking-tight">
            Intelligence in every dimension
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="h-full"
            >
              <Link href={mod.href} className="block h-full">
                <div
                  className={`glass-card p-8 h-full flex flex-col gap-6 cursor-pointer group transition-all duration-500 ease-out bg-obsidian-3/40 border-white/5 ${mod.bgClass}`}
                >
                  <div className={`${mod.textClass} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}>
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl text-white/90 mb-3 font-serif font-light tracking-wide group-hover:text-white transition-colors duration-500">
                      {mod.name}
                    </h3>
                    <p className="text-white/40 text-[15px] leading-relaxed group-hover:text-white/60 transition-colors duration-500">
                      {mod.desc}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-[11px] font-mono tracking-widest mt-auto opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0 ${mod.textClass}`}
                  >
                    EXPLORE <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Ticker ──────────────────────────────────────────────
const STATS = [
  { value: '74,000+', label: 'Fragrances' },
  { value: '12', label: 'Cities Tracked' },
  { value: '99.2%', label: 'AI Accuracy' },
  { value: '6', label: 'Skin Factors Analyzed' },
  { value: '8', label: 'Modules' },
  { value: '< 1s', label: 'Analysis Time' },
];

function StatsTicker() {
  return (
    <div className="border-y border-white/5 py-10 px-6 overflow-hidden bg-obsidian relative z-10">
      <motion.div
        className="flex gap-24"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[...STATS, ...STATS, ...STATS].map((s, i) => (
          <div key={i} className="flex items-center gap-8 shrink-0">
            <div className="text-right">
              <div className="text-[22px] font-mono font-light text-amber mb-1">{s.value}</div>
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.15em]">{s.label}</div>
            </div>
            <div className="w-px h-10 bg-white/5" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: 'DupeShield saved me $400 on a BR540 clone. The 91% match was incredibly accurate.', author: 'Priya M., Mumbai' },
  { quote: 'ScentDNA finally explained why Aventus smells like baby powder on my specific skin chemistry.', author: 'James R., London' },
  { quote: 'The ScentMoment recommendation for my wedding was absolutely perfect. It matched the exact vibe.', author: 'Sofia A., Dubai' },
];

export default function HomePage() {
  return (
    <main className="bg-obsidian">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
        <ShaderHero />
        <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-12 bg-amber/5 border border-amber/20 backdrop-blur-md"
            >
              <Star size={12} className="text-amber" />
              <span className="font-mono text-[10px] text-amber tracking-[0.2em] font-medium">
                POWERED BY Shashank Jain · FRAGELLA API
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-6xl md:text-[110px] text-white/90 mb-8 leading-[0.9] font-serif font-light tracking-tighter">
              The{' '}
              <em className="font-serif italic text-gradient-amber pr-2 relative -left-2">
                intelligence
              </em>
              <br />
              <span className="relative -left-4">of scent.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/40 mb-14 max-w-2xl mx-auto font-sans font-light leading-relaxed tracking-wide">
              OLFRA™ is the world&apos;s most advanced fragrance intelligence platform.
              AI that understands <em className="text-white/70 font-serif italic text-2xl pr-1">chemistry</em>, not just notes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
              <Link href="/dna">
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 px-8 py-4 min-w-[240px] rounded-full bg-gradient-to-tr from-amber-light to-amber text-white font-mono text-[12px] uppercase tracking-[0.15em] shadow-glow-amber transition-all duration-300"
                >
                  Discover Your ScentDNA <ArrowRight size={14} />
                </motion.div>
              </Link>
              
              <Link href="/dupeshield">
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 px-8 py-4 min-w-[240px] rounded-full glass border border-white/10 text-white/60 hover:text-white font-mono text-[12px] uppercase tracking-[0.15em] transition-all duration-300"
                >
                  Find a Dupe <Shield size={14} />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-amber/40 to-transparent" />
        </motion.div>
      </section>

      {/* Stats */}
      <StatsTicker />

      {/* Module Cards */}
      <ParallaxSection />

      {/* Testimonials */}
      <section className="py-32 px-6 border-t border-white/5 bg-obsidian relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30 mb-6">What Enthusiasts Say</p>
            <h2 className="text-3xl md:text-5xl text-white/90 font-serif font-light tracking-tight">
              Trusted by fragrance communities worldwide
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
                className="glass p-10 rounded-2xl border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-colors duration-500"
              >
                <div className="flex gap-1 mb-8 opacity-80">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber text-amber" />
                  ))}
                </div>
                <p className="text-white/60 leading-relaxed mb-8 font-serif italic text-xl">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-white/30 font-mono text-[11px] uppercase tracking-[0.1em]">{t.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center border-t border-white/5 bg-gradient-to-b from-obsidian to-obsidian-2 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl text-white/90 mb-8 font-serif font-light tracking-tight">
            Your scent. <em className="text-gradient-amber italic pr-2">Decoded.</em>
          </h2>
          <p className="text-white/40 mb-14 text-lg font-light tracking-wide">
            Begin with your ScentDNA profile — it takes 60 seconds.
          </p>
          <Link
            href="/dna"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-tr from-amber-light to-amber text-white font-mono text-[13px] uppercase tracking-[0.2em] shadow-glow-amber hover:shadow-[0_8px_60px_rgba(200,146,42,0.4)] transition-all duration-500 hover:-translate-y-1"
          >
            Start Free <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-white/5 bg-obsidian-2 relative z-10">
        <p className="font-mono text-[10px] text-white/20 tracking-[0.15em] uppercase">
          OLFRA™ — Built with Claude Sonnet + Fragella API · &copy; 2026
        </p>
      </footer>
    </main>
  );
}
