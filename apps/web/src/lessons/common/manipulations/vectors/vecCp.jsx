import { useCallback, useRef } from 'react';
import MathText from '../../components/MathText';
import { playSfx } from '../../utils/playEffect';

/**
 * Aides communes des cinq labos de l'unité 12 (« الأشعة في معلم ») pour les QUESTIONS PENDANT LE LABO (rollout lot 3,
 * 2026-10-28) : écriture TeX des nombres signés, construction des distracteurs numériques, nœud de texte i18n et son du geste.
 * Aucun texte arabe ici : les textes sont dans `lesson.manipulation.json › <labo>.cp.*`.
 */
export const $ = (s) => `$${s}$`;

/** Le texte d'une clé `cp.<key>` du labo (île KaTeX). */
export const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/**
 * Jusqu'à `n` distracteurs NUMÉRIQUES distincts de `right`, pris dans l'ordre de `cands` ([{ v, why }]) puis complétés par des voisins.
 * Retourne [{ v, why }] ; `why` est la clé (ou le nœud) d'explication du candidat.
 */
export function distractors(right, cands, n = 2, fallbackWhy = null) {
  const out = [];
  const seen = new Set([right]);
  for (const c of [...cands, { v: right + 1, why: fallbackWhy }, { v: right - 1, why: fallbackWhy }, { v: right + 2, why: fallbackWhy }]) {
    if (out.length >= n) break;
    if (!seen.has(c.v)) { seen.add(c.v); out.push(c); }
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
