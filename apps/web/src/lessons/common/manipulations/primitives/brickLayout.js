import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { divmod } = divisibility;

/**
 * UN MUR EN BRIQUES DE LONGUEUR n — pure géométrie, testée.
 *
 * `value` unités de longueur, bâties en briques de `unit` : `count` briques
 * entières et, si la longueur ne tombe pas juste, un morceau de `partial`
 * unités. Dans la leçon 3 (`divisor-properties`) tout tombe juste par
 * hypothèse (n | a et n | b) et c'est précisément ce que le dessin montre :
 * a + b, a − b et le reste sont des murs SANS morceau — donc des multiples
 * de n. Le morceau existe quand même dans la géométrie, parce que le
 * laboratoire libre laisse l'élève choisir des nombres où il apparaît.
 *
 * Les coordonnées sont en UNITÉS de longueur : la vue les met à l'échelle
 * commune (`scale` = la plus grande longueur à l'écran) pour que deux murs
 * se comparent d'un regard.
 */
export function brickLayout({ value, unit }) {
  const n = Math.max(1, unit | 0);
  const v = Math.max(0, value | 0);
  const { q, r } = divmod(v, n);
  return {
    value: v,
    unit: n,
    count: q,
    partial: r,
    /** chaque brique : [x0, x1] en unités */
    bricks: Array.from({ length: q }, (_, i) => [i * n, (i + 1) * n]),
    partialSpan: r > 0 ? [q * n, q * n + r] : null,
    whole: r === 0,
  };
}

/**
 * Le mur du RESTE : `a` mesuré par des panneaux de `b` ; le bout qui dépasse
 * est le reste, lui-même fait de briques entières de n quand n | a et n | b.
 */
export function measureLayout({ a, b, unit }) {
  const { q, r } = divmod(a, b);
  return {
    panels: Array.from({ length: q }, (_, i) => [i * b, (i + 1) * b]),
    rest: r > 0 ? [q * b, a] : null,
    restBricks: brickLayout({ value: r, unit }),
    q, r,
  };
}
