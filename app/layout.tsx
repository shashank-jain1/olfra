import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from './fonts';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/layout/PageTransition';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: {
    default: 'OLFRA™ — The Intelligence of Scent',
    template: '%s · OLFRA™',
  },
  description:
    'Fragrance intelligence built on measurable chemistry. Dupe detection scored from accord structure, skin-chemistry profiling, and occasion matching — deterministic, explainable, and the same every time.',
  keywords: [
    'fragrance',
    'perfume',
    'dupe finder',
    'fragrance similarity',
    'scent profile',
    'OLFRA',
  ],
  openGraph: {
    title: 'OLFRA™ — The Intelligence of Scent',
    description:
      'Dupe detection scored from accord structure and drydown overlap. Deterministic, explainable, reproducible.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#06080A',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      {/* `.grain` paints a fixed film-grain layer over the whole document —
          one static SVG rather than the per-frame canvas noise it replaces. */}
      <body className="bg-obsidian text-ink antialiased grain">
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <QueryProvider>
          <Navbar />
          <div id="main">
            <PageTransition>{children}</PageTransition>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
