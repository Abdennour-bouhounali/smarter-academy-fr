import { useCallback, useRef } from 'react';
import MathText from '../../components/MathText';
import { playSfx } from '../../utils/playEffect';

/**
 * Aides communes des quatre labos de l'unité 9 « خاصية طالس » (parallel-level, segment-divider, shadow-world, cone-cylinder)
 * pour les QUESTIONS PENDANT LE LABO (rollout lot 4, 2026-10-28) : écriture TeX, nœud de texte i18n et son du geste.
 * Aucun texte arabe ici : les textes sont dans `lesson.manipulation.json › <labo>.cp.*`.
 */
export const $ = (s) => `$${s}$`;

/** Le texte d'une clé `cp.<key>` du labo (île KaTeX). */
export const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/**
 * Jusqu'à `n` distracteurs distincts de `right` (comparés par `same`, `===` par défaut), pris dans l'ordre de `cands`
 * ([{ v, why }]) puis complétés par `fillers`.
 */
export function distinct(right, cands, n = 2, same = (a, b) => a === b) {
  const out = [];
  for (const c of cands) {
    if (out.length >= n) break;
    if (!same(c.v, right) && !out.some((o) => same(o.v, c.v))) out.push(c);
  }
  return out;
}

/** Le son du geste : un déclic au plus toutes les 35 ms (MANIPULATION_CONTRACT §8quinquies). */
export function useTick(name = 'tooth') {
  const at = useRef(0);
  return useCallback((pitch = 1) => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - at.current > 35) { playSfx(name, { pitch }); at.current = now; }
  }, [name]);
}

/**
 * La bonne réponse d'une question à choix ne doit pas toujours être la première : `spread` la range à une place qui dépend de l'id de la
 * question et d'une graine tirée des nombres du labo (stable d'un rendu à l'autre, jamais au hasard). Les questions `number` passent telles quelles.
 */
function spread(q, seed = 0) {
  if (!q || q.kind !== 'choice' || !Array.isArray(q.options) || q.options.length < 2) return q;
  let h = Math.abs(Math.round(Number(seed) || 0));
  for (const c of String(q.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const ci = q.options.findIndex((o) => o.correct);
  const target = h % q.options.length;
  if (ci < 0 || ci === target) return q;
  const options = [...q.options];
  const [right] = options.splice(ci, 1);
  options.splice(target, 0, right);
  return { ...q, options };
}

/** Enveloppe chaque constructeur de `raw` pour ranger la bonne réponse (`spread`) selon la graine `seedOf(lab)`. */
export const spreadAll = (raw, seedOf) => Object.fromEntries(Object.entries(raw).map(([id, fn]) => [id, (lab, ...rest) => spread(fn(lab, ...rest), seedOf(lab))]));
