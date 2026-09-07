/**
 * factorTowerUtils — une tour est une LISTE DE FACTEURS, pas un exposant.
 *
 * C'est toute la correction pédagogique de la leçon. L'ancien modèle portait
 * `{ base, n }` : l'exposant était l'état, et les blocs n'en étaient qu'un
 * dessin. Un élève pouvait donc régler « n = 2 » sans jamais voir deux
 * facteurs, et la fusion se réduisait à une addition d'entiers cachée.
 *
 * Ici l'état EST la collection de facteurs :
 *
 *     { base: 3, factors: ['a1', 'a2'] }   ←  3 × 3
 *
 * L'exposant n'existe nulle part comme donnée : `exponent(t)` le COMPTE.
 * On ne peut donc pas afficher « 3² » sans qu'il y ait, à l'écran, deux
 * blocs à compter — l'écriture ne peut pas mentir sur le dessin.
 *
 * Chaque facteur porte un `id` stable et un `from` ('a' | 'b') disant de
 * quelle tour il vient. C'est ce qui permet, après la fusion, d'écrire
 * (3 × 3) × (3 × 3 × 3) : les deux groupes restent identifiables DANS la
 * tour résultat, au lieu d'être fondus en un « 5 » que l'élève devrait
 * croire sur parole.
 *
 * Les exposants négatifs restent modélisés comme dans `powerUtils` (le
 * sous-sol du module 2), par un compte de facteurs SOUS le sol : la tour
 * garde `below`, une seconde liste, et vaut alors 1 / base^|below|.
 */

/* ─────────────────────────── Construire ─────────────────────────── */

let seq = 0;
/** Un identifiant stable, pour que React ne recycle pas les blocs. */
const nextId = (from) => `${from}${(seq += 1)}`;

/**
 * Une tour de `n` facteurs `base`, tous marqués comme venant de `from`.
 * `makeTower(3, 2)` → 3 × 3, dessiné en deux blocs.
 */
export function makeTower(base, n = 0, from = 'a') {
  const t = { base, factors: [], below: [] };
  for (let i = 0; i < Math.abs(n); i += 1) {
    (n >= 0 ? t.factors : t.below).push({ id: nextId(from), from });
  }
  return t;
}

/** L'exposant : il se COMPTE, il ne se stocke pas. */
export const exponent = (t) => t.factors.length - t.below.length;

/** Le nombre de facteurs visibles au-dessus du sol. */
export const factorCount = (t) => t.factors.length;

/* ──────────────────────── Les gestes, purs ──────────────────────── */

/**
 * Poser un facteur de plus sur la tour. Sous le sol, poser un facteur
 * REMONTE d'un cran (on annule une division) — c'est la continuité de la
 * descente du module 2, pas une règle séparée.
 */
export function addFactor(t, from = 'a') {
  if (t.below.length > 0) return { ...t, below: t.below.slice(0, -1) };
  return { ...t, factors: [...t.factors, { id: nextId(from), from }] };
}

/**
 * Retirer le facteur du sommet. Une tour vide qui perd encore un facteur
 * passe SOUS le sol : c'est ainsi que 3^0 puis 3^{-1} se rencontrent, en
 * continuant le même geste.
 */
export function removeFactor(t) {
  if (t.factors.length > 0) return { ...t, factors: t.factors.slice(0, -1) };
  return { ...t, below: [...t.below, { id: nextId('d'), from: 'd' }] };
}

/**
 * Verser la tour `src` dans la tour `dst` : les facteurs de src viennent se
 * poser sur ceux de dst, EN GARDANT leur marque d'origine. Rien n'est
 * additionné — c'est une concaténation, et l'addition des exposants en est
 * la CONSÉQUENCE, pas la définition.
 *
 * Bases différentes → null : la règle ne s'applique pas, et le module doit
 * pouvoir le dire.
 */
export function mergeInto(dst, src) {
  if (dst.base !== src.base) return null;
  return {
    ...dst,
    factors: [...dst.factors, ...src.factors],
    below: [...dst.below, ...src.below],
  };
}

/**
 * Retirer de `t` autant de facteurs que `by` en contient : diviser, c'est
 * enlever des facteurs. Chaque retrait consomme une PAIRE (un facteur en
 * haut, un facteur du diviseur) — voir `simplifyPairs`, qui rend cette
 * simplification lisible avant que le résultat n'apparaisse.
 */
export function removeMany(t, count) {
  let out = t;
  for (let i = 0; i < count; i += 1) out = removeFactor(out);
  return out;
}

/**
 * Répéter une tour `k` fois. Le résultat n'est PAS une pile : c'est une
 * liste de k paquets de m facteurs. Le groupement doit rester visible,
 * sinon (3²)³ se dessine comme 3² × 3² × 3² et l'élève ne peut pas
 * distinguer la règle du produit de celle de la répétition.
 */
export function duplicate(t, k) {
  return Array.from({ length: k }, (_, i) =>
    ({ ...t, factors: t.factors.map((f) => ({ id: nextId(`p${i}`), from: `p${i}` })) }));
}

/* ─────────────────────────── Les écritures ──────────────────────── */

/** `3 \times 3 \times 3` — le produit développé, sans regroupement. */
export function expandedText(t) {
  if (t.factors.length === 0) return '1';
  return t.factors.map(() => t.base).join(' \\times ');
}

/**
 * `(3 \times 3) \times (3 \times 3 \times 3)` — le produit développé qui
 * GARDE la trace des deux tours d'origine. C'est l'écriture intermédiaire
 * que l'ancienne version sautait, et sans laquelle la règle est un tour de
 * magie.
 *
 * Quand tous les facteurs viennent du même endroit, il n'y a rien à
 * regrouper : on rend le produit simple.
 */
export function groupedText(t) {
  if (t.factors.length === 0) return '1';
  const groups = [];
  for (const f of t.factors) {
    const last = groups[groups.length - 1];
    if (last && last.from === f.from) last.n += 1;
    else groups.push({ from: f.from, n: 1 });
  }
  if (groups.length < 2) return expandedText(t);
  return groups
    .map((g) => `\\left(${Array.from({ length: g.n }, () => t.base).join(' \\times ')}\\right)`)
    .join(' \\times ');
}

/**
 * La simplification d'un quotient, montrée AVANT son résultat :
 * `simplifyPairs(5, 2)` décrit 3⁵ ÷ 3² comme 2 paires qui valent 1 et
 * 3 facteurs qui restent.
 */
export function simplifyPairs(numerator, denominator) {
  const cancelled = Math.min(numerator, denominator);
  return {
    cancelled,
    remaining: numerator - cancelled,
    // Ce qui reste AU DÉNOMINATEUR quand on a enlevé plus qu'il n'y avait :
    // la tour passe sous le sol, et le résultat s'écrit en fraction.
    leftover: denominator - cancelled,
  };
}

/** Le compte de paquets d'une répétition, lu sur les colonnes dessinées. */
export function packetCount(packets) {
  return {
    packets: packets.length,
    perPacket: packets[0] ? packets[0].factors.length : 0,
    total: packets.reduce((s, p) => s + p.factors.length, 0),
  };
}
