'use client';
import type { TargetAndTransition } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

type TransitionDef = { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition };
const transitions: Record<string, TransitionDef> = {
  '/dupeshield': {
    initial: { opacity: 0, backgroundColor: 'rgba(192,57,43,0.1)' },
    animate: { opacity: 1, backgroundColor: 'transparent' },
    exit: { opacity: 0, y: -10 },
  },
  '/culture': {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
  '/moment': {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  '/dna': {
    initial: { opacity: 0, scale: 1.02 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  default: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
};

function getTransition(pathname: string) {
  for (const key of Object.keys(transitions)) {
    if (key !== 'default' && pathname.startsWith(key)) {
      return transitions[key];
    }
  }
  return transitions.default;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = getTransition(pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={t.initial}
        animate={t.animate}
        exit={t.exit}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
