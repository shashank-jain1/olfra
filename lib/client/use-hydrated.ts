'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * True once the client has hydrated.
 *
 * Persisted Zustand stores read localStorage, which does not exist during
 * server rendering — rendering their contents directly causes a hydration
 * mismatch. `useSyncExternalStore` gives the correct answer on both sides
 * without the setState-in-effect pattern that React now warns about.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client
    () => false, // server
  );
}
