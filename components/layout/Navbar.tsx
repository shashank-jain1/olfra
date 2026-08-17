'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, User, ShoppingBag, Menu, X, Settings } from 'lucide-react';

const modules = [
  { label: 'DupeShield', href: '/dupeshield', color: 'var(--color-crimson)' },
  { label: 'ScentCulture', href: '/culture', color: 'var(--color-lime)' },
  { label: 'ScentMoment', href: '/moment', color: 'var(--color-rose)' },
  { label: 'ScentDNA', href: '/dna', color: 'var(--color-mint)' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'h-14 bg-obsidian-2/95 border-b border-white/5 backdrop-blur-2xl' 
            : 'h-16 bg-transparent border-b border-transparent backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-light to-amber flex items-center justify-center shadow-glow-amber">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-serif text-[22px] font-medium text-amber tracking-wider">
                OLFRA™
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 relative">
            {modules.map((mod) => {
              const isActive = pathname.startsWith(mod.href);
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className={`relative px-4 py-2 text-[13px] font-medium font-mono uppercase tracking-widest transition-colors ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {mod.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-0 left-4 right-4 h-[1px]"
                      style={{ background: mod.color, boxShadow: `0 0 8px ${mod.color}` }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-1">
            <NavIconBtn href="/snap" icon={<Search size={16} />} label="ScentSnap" />
            <NavIconBtn href="/wardrobe" icon={<ShoppingBag size={16} />} label="Wardrobe" />
            <NavIconBtn href="/settings" icon={<Settings size={16} />} label="Settings" />
            <Link
              href="/profile/me"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-light to-amber flex items-center justify-center ml-2 shadow-glow-amber transition-transform hover:scale-105"
            >
              <User size={14} className="text-white" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full glass hover:-translate-y-0.5 transition-transform"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 glass border-b border-white/5 shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-1">
              {modules.map((mod) => {
                const isActive = pathname.startsWith(mod.href);
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-mono tracking-wider uppercase transition-colors hover:bg-white/5"
                    style={{ color: isActive ? mod.color : 'rgba(255,255,255,0.7)' }}
                  >
                    {mod.label}
                  </Link>
                );
              })}
              <div className="flex items-center gap-4 px-4 pt-4 border-t border-white/5 mt-2">
                <Link href="/snap" className="text-xs uppercase font-mono text-white/40 hover:text-white transition-colors">ScentSnap</Link>
                <Link href="/wardrobe" className="text-xs uppercase font-mono text-white/40 hover:text-white transition-colors">Wardrobe</Link>
                <Link href="/profile/me" className="text-xs uppercase font-mono text-white/40 hover:text-white transition-colors">Profile</Link>
                <Link href="/settings" className="text-xs uppercase font-mono text-white/40 hover:text-white transition-colors">Settings</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavIconBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-full transition-all text-white/40 hover:text-white hover:bg-white/5 hover:-translate-y-0.5"
    >
      {icon}
    </Link>
  );
}
