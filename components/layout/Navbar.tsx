'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  Camera,
  Globe,
  ShoppingBag,
  User,
  Menu,
  X,
  Settings,
  Shield,
  Dna,
  Layers,
  Users,
  Repeat,
} from 'lucide-react';

/**
 * Primary navigation.
 *
 * Rebuilt for three problems in the previous version: the icon-only links
 * (Snap, Wardrobe, Settings) had no active state, so you could not tell
 * where you were; the mobile sheet listed a different, smaller set of
 * destinations than desktop; and it had no scroll lock, so the page kept
 * scrolling underneath the open menu.
 */

const PRIMARY = [
  { href: '/dupeshield', label: 'DupeShield', icon: Shield, hue: 'var(--color-rose)' },
  { href: '/dna', label: 'ScentDNA', icon: Dna, hue: 'var(--color-mint)' },
  { href: '/moment', label: 'ScentMoment', icon: Sparkles, hue: 'var(--color-amber)' },
  { href: '/layer', label: 'ScentLayer', icon: Layers, hue: 'var(--color-lime)' },
] as const;

const SECONDARY = [
  { href: '/snap', label: 'ScentSnap', icon: Camera },
  { href: '/culture', label: 'ScentCulture', icon: Globe },
  { href: '/wardrobe', label: 'Wardrobe', icon: ShoppingBag },
  { href: '/social', label: 'Community', icon: Users },
  { href: '/circle', label: 'Marketplace', icon: Repeat },
  { href: '/settings', label: 'Status', icon: Settings },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change — otherwise the sheet stays open over the new page.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll and support Escape while the sheet is open.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <motion.nav
        aria-label="Primary"
        initial={reduceMotion ? false : { y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'h-14 bg-obsidian/85 border-b border-hairline backdrop-blur-2xl'
            : 'h-[68px] bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-5 md:px-6 gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="OLFRA home"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-light to-amber flex items-center justify-center shadow-glow-amber group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={13} className="text-obsidian" />
            </span>
            <span className="font-serif text-[21px] text-amber tracking-wide">
              OLFRA
              <span className="text-[10px] align-super text-amber/50">™</span>
            </span>
          </Link>

          {/* Desktop primary — a shared layoutId slides the indicator
              between items instead of cross-fading it. */}
          <div className="hidden lg:flex items-center gap-1">
            {PRIMARY.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-[12px] font-mono uppercase tracking-[0.13em] transition-colors duration-200 ${
                    active ? 'text-ink' : 'text-ink-faint hover:text-ink-muted'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-0 left-3 right-3 h-px"
                      style={{
                        background: item.hue,
                        boxShadow: `0 0 8px ${item.hue}`,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-0.5">
            {SECONDARY.slice(0, 5).map((item) => (
              <IconLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
            <IconLink
              href="/settings"
              label="Status"
              icon={Settings}
              active={isActive('/settings')}
            />
            <Link
              href="/profile/me"
              aria-label="Your profile"
              aria-current={isActive('/profile') ? 'page' : undefined}
              className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 transition-all duration-300 hover:scale-105 ${
                isActive('/profile')
                  ? 'bg-gradient-to-br from-amber-light to-amber shadow-glow-amber'
                  : 'bg-white/[0.06] border border-hairline-strong hover:bg-white/10'
              }`}
            >
              <User
                size={13}
                className={isActive('/profile') ? 'text-obsidian' : 'text-ink-muted'}
              />
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full glass border-hairline-strong text-ink-muted"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-obsidian/85 backdrop-blur-md lg:hidden"
            />

            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[68px] inset-x-3 z-50 lg:hidden rounded-3xl bg-obsidian-2 border border-hairline-strong shadow-2xl max-h-[calc(100dvh-88px)] overflow-y-auto"
            >
              <div className="p-3">
                <p className="eyebrow px-3 pt-3 pb-2">Engines</p>
                {PRIMARY.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3.5 px-3 py-3.5 rounded-2xl transition-colors ${
                        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <item.icon
                        size={17}
                        strokeWidth={1.4}
                        style={{ color: active ? item.hue : undefined }}
                        className={active ? '' : 'text-ink-faint'}
                      />
                      <span
                        className={`font-mono text-[13px] tracking-wide ${
                          active ? 'text-ink' : 'text-ink-muted'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                <div className="rule my-3" />

                <p className="eyebrow px-3 pb-2">Everything else</p>
                <div className="grid grid-cols-2 gap-1">
                  {SECONDARY.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl transition-colors ${
                          active
                            ? 'bg-white/[0.06] text-ink'
                            : 'text-ink-faint hover:bg-white/[0.03]'
                        }`}
                      >
                        <item.icon size={15} strokeWidth={1.4} />
                        <span className="font-mono text-[12px]">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="rule my-3" />

                <Link
                  href="/profile/me"
                  className="flex items-center gap-3.5 px-3 py-3.5 rounded-2xl hover:bg-white/[0.03] transition-colors"
                >
                  <User size={17} strokeWidth={1.4} className="text-ink-faint" />
                  <span className="font-mono text-[13px] text-ink-muted">Profile</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function IconLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Camera;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
        active
          ? 'text-amber bg-amber/10'
          : 'text-ink-faint hover:text-ink hover:bg-white/[0.05]'
      }`}
    >
      <Icon size={15} strokeWidth={1.5} />
    </Link>
  );
}
