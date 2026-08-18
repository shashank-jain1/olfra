'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Page-entry animation.
 *
 * Rewritten from an `AnimatePresence mode="wait"` wrapper, which had three
 * problems: every navigation waited for the outgoing page's exit animation
 * to finish before the new page painted (a deliberate ~500ms delay on each
 * click), each route used a different direction so navigation felt
 * inconsistent, and it ignored prefers-reduced-motion entirely.
 *
 * Now the incoming page animates on its own — no exit gate, no wait — with
 * a single direction across the app so movement reads as one system.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
