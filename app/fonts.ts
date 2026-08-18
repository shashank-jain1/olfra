// ─────────────────────────────────────────────────────────────
// OLFRA™ — Typography
//
// Loaded through next/font instead of an @import in globals.css.
// The CSS import was render-blocking, shipped a flash of unstyled text,
// and depended on Google's CDN at runtime. next/font self-hosts the files,
// inlines the @font-face rules, and sizes the fallback metrics to match —
// so there is no layout shift when the real face arrives.
//
// Three roles, three voices:
//   Cormorant Garamond — display. High-contrast old-style serif; the
//     editorial, perfume-counter register the brand runs on.
//   Inter — interface. Neutral, excellent at small sizes.
//   DM Mono — data. Labels, scores, note counts, anything tabular.
// ─────────────────────────────────────────────────────────────

import { Cormorant_Garamond, DM_Mono, Inter } from 'next/font/google';

export const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif-src',
  display: 'swap',
});

export const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans-src',
  display: 'swap',
});

export const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono-src',
  display: 'swap',
});

export const fontVariables = `${serif.variable} ${sans.variable} ${mono.variable}`;
