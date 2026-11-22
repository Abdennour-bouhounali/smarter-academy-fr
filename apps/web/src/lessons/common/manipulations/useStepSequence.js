import { useCallback, useMemo, useState } from 'react';

/**
 * Une séquence d'étapes bornée : un curseur `index` (combien d'étapes sont
 * FAITES), `next`/`prev`/`reset`, et `isDone`. Rien d'autre — ni mode, ni
 * indices, ni nombres : ces notions vivent dans `useManipulation`, qui
 * compose ce hook. Il est extrait pour que chaque manipulation puisse porter
 * plusieurs séquences indépendantes (la chaîne des différences ET la preuve).
 */
export function useStepSequence(total, initialIndex = 0) {
  const [index, setIndex] = useState(initialIndex);
  const max = Math.max(0, total);
  const clamped = Math.min(index, max);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, max)), [max]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const reset = useCallback(() => setIndex(0), []);
  const goTo = useCallback((i) => setIndex(Math.max(0, Math.min(i, max))), [max]);
  const complete = useCallback(() => setIndex(max), [max]);

  return useMemo(() => ({
    index: clamped, total: max, next, prev, reset, goTo, complete,
    isDone: max > 0 && clamped >= max,
  }), [clamped, max, next, prev, reset, goTo, complete]);
}
