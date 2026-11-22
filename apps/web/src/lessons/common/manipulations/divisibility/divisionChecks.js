/**
 * Aides communes des questions pendant le labo des labos de la division (team-builder, divisor-explorer-books, common-divisors, factor-pairs).
 * Pas de texte arabe ici : les chaînes vivent dans `lesson.manipulation.json › <labo>.cp.*`.
 */

/** Les FAUSSES égalités de « n = g × q + r » : des erreurs réelles (sommer, permuter q et r, soustraire r…), seulement celles qui ne valent pas n. */
export function wrongEqualities({ n, g, q, r }) {
  const all = [
    { tex: `${g} + ${q} + ${r}`, v: g + q + r, kind: 'sum' },
    { tex: `${g} \\times ${r} + ${q}`, v: g * r + q, kind: 'swap' },
    { tex: `${q} \\times ${r} + ${g}`, v: q * r + g, kind: 'swap2' },
    { tex: `${g} \\times ${q} - ${r}`, v: g * q - r, kind: 'minus' },
    { tex: `${g} \\times ${q + 1} + ${r}`, v: g * (q + 1) + r, kind: 'more' },
  ].filter((o) => o.v !== n);
  return all.slice(0, 2);
}

/** n = g × q + r en TeX. */
export const eqTex = ({ n, g, q, r }) => `${n} = ${g} \\times ${q} + ${r}`;

/** « n:g » → { n, g, q, r } (la division euclidienne de n par g). */
export function splitKey(key) {
  const [n, g] = String(key).split(':').map(Number);
  return { n, g, q: Math.floor(n / g), r: n % g };
}

/**
 * Quatre PASTILLES de nombres consécutifs qui contiennent `value` (réponse « fill » d'un toucher, pilote 2026-11-07) — jamais
 * sous `min`, et la bonne réponse n'est pas toujours à la même place (son rang suit `value % 4`). Déterministe.
 */
export function chipsAround(value, { min = 0, count = 4 } = {}) {
  const start = Math.max(min, value - (value % count));
  return Array.from({ length: count }, (_, i) => start + i);
}

/** L'ordre des TUILES de « n = g × q + r » à bâtir : mêlé (jamais l'ordre de l'égalité), déterministe. */
export const buildTiles = ({ n, g, q, r }) => [r, n, q, g];
