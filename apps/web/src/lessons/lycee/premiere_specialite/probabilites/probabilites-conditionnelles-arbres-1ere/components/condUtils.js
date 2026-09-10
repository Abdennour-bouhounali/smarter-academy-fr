/**
 * Noyau de calcul de « Probabilités conditionnelles : arbres et probabilités
 * totales » — fonctions PURES, testées avant toute JSX (condUtils.test.js).
 *
 * DEUX EXIGENCES DE JUSTESSE, qui commandent toute la conception :
 *
 * 1. LES EFFECTIFS SONT ENTIERS ET SOMMENT EXACTEMENT AU TOTAL. La leçon
 *    affirme « 990 sur 2 970 » : si un effectif était 989,999 la figure
 *    mentirait. Toute composition passe par `crossFromCounts`, qui refuse un
 *    tableau non entier ou dont la somme n'est pas le total annoncé.
 *
 * 2. LES PROBABILITÉS SONT DES FRACTIONS D'ENTIERS, JAMAIS DES FLOTTANTS
 *    ACCUMULÉS. 0,6 × 0,02 + 0,3 × 0,05 + 0,1 × 0,10 rend 0,037000000000000005
 *    en virgule flottante, et la somme des branches d'un nœud rend
 *    0,9999999999999999 : un arbre JUSTE serait alors signalé comme faux par
 *    ProbabilityTree (qui teste |s − 1| > 1e−6 … de justesse), et « la somme
 *    vaut 1 EXACTEMENT » deviendrait une phrase que le code contredit. D'où
 *    `rat`/`ratAdd`/`ratMul` : addition et multiplication d'entiers, réduction
 *    par le PGCD, égalité par produit croisé. `ratValue` n'intervient qu'au
 *    dernier moment, pour l'affichage.
 *
 * PÉRIMÈTRE CODÉ, PAS COMMENTÉ (perimetre_executable_lecon) : `totalProbability`
 * REFUSE une famille qui ne partitionne pas — poids ne sommant pas à 1, ou
 * parts qui se recouvrent. La formule des probabilités totales n'a de sens que
 * sur une partition, et le noyau ne laisse pas écrire le contraire.
 */

/* ══ Arithmétique exacte des rationnels ══════════════════════════════════ */

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { const t = y; y = x % y; x = t; }
  return x || 1;
};

/** Fraction n/d réduite, dénominateur toujours positif. `d = 0` est refusé. */
export function rat(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new Error(`rat: numérateur et dénominateur doivent être entiers (reçu ${n}/${d})`);
  }
  if (d === 0) throw new Error('rat: dénominateur nul');
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (s * n) / g, d: (s * d) / g };
}

export const ratAdd = (x, y) => rat(x.n * y.d + y.n * x.d, x.d * y.d);
export const ratMul = (x, y) => rat(x.n * y.n, x.d * y.d);
export const ratSub = (x, y) => rat(x.n * y.d - y.n * x.d, x.d * y.d);
/** Égalité EXACTE, par produit croisé : aucune tolérance, aucun flottant. */
export const ratEq = (x, y) => x.n * y.d === y.n * x.d;
export const ratIsOne = (x) => x.n === x.d;
/** Valeur décimale — pour l'AFFICHAGE seulement, jamais pour un calcul. */
export const ratValue = (x) => x.n / x.d;
export const ratSum = (list) => list.reduce(ratAdd, rat(0, 1));

/* ══ Formatage ═══════════════════════════════════════════════════════════ */

/** Décimal à la française : 0.075 → « 0,075 ». */
export const fr = (v, dp = 3) => {
  const s = v.toFixed(dp).replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', ',');
};

/** Pourcentage à la française : 1/3 → « 33,3 % ». */
export const pct = (x, dp = 1) => `${fr(ratValue(x) * 100, dp)} %`;

/** « 990 / 2970 » — le quotient en toutes lettres, jamais son seul résultat. */
export const quotient = (n, d) => `${n} / ${d}`;

/* ══ Tableau croisé sur des EFFECTIFS ENTIERS ════════════════════════════ */

/**
 * Un tableau croisé vérifié : deux critères, des effectifs entiers, un total
 * qui tombe juste. C'est l'unique porte d'entrée des données de la leçon.
 *
 * @param {{rows:string[], cols:string[], cells:Object, total:number}} spec
 */
export function crossFromCounts({ rows, cols, cells, total }) {
  let sum = 0;
  for (const r of rows) {
    for (const c of cols) {
      const v = cells?.[r]?.[c];
      if (!Number.isInteger(v) || v < 0) {
        throw new Error(`crossFromCounts: effectif non entier positif en [${r}][${c}] : ${v}`);
      }
      sum += v;
    }
  }
  if (sum !== total) {
    throw new Error(`crossFromCounts: la somme des effectifs vaut ${sum}, pas ${total}`);
  }
  const rowTotals = Object.fromEntries(rows.map((r) => [r, cols.reduce((a, c) => a + cells[r][c], 0)]));
  const colTotals = Object.fromEntries(cols.map((c) => [c, rows.reduce((a, r) => a + cells[r][c], 0)]));
  return { rows, cols, cells, total, rowTotals, colTotals };
}

/** n(ligne ∩ colonne). */
export const nInter = (t, r, c) => t.cells[r][c];
/** P(ligne ∩ colonne), fraction exacte sur le total. */
export const pInter = (t, r, c) => rat(t.cells[r][c], t.total);
/** P(ligne), P(colonne) — les marges. */
export const pRow = (t, r) => rat(t.rowTotals[r], t.total);
export const pCol = (t, c) => rat(t.colTotals[c], t.total);

/**
 * P_condition(événement) sur les effectifs : n(A ∩ B) / n(condition).
 * `given` désigne la CONDITION — celle qui donne le dénominateur.
 * Renvoie `null` si la condition est vide : un univers vide n'a pas de
 * probabilité, et rendre 0 ferait passer l'impossible pour du certain.
 */
export function conditional(t, given, of) {
  const { axis, key } = given;
  const denom = axis === 'row' ? t.rowTotals[key] : t.colTotals[key];
  if (!denom) return null;
  const num = axis === 'row' ? t.cells[key][of] : t.cells[of][key];
  return rat(num, denom);
}

/** Les deux nombres du quotient conditionnel, pour l'afficher entier. */
export function conditionalCounts(t, given, of) {
  const { axis, key } = given;
  const denominator = axis === 'row' ? t.rowTotals[key] : t.colTotals[key];
  const numerator = axis === 'row' ? t.cells[key][of] : t.cells[of][key];
  return { numerator, denominator };
}

/* ══ L'arbre comme INSTRUMENT DE CALCUL ══════════════════════════════════ */

/**
 * Arbre pondéré à deux niveaux, construit sur des EFFECTIFS.
 * Le premier niveau porte P(Aᵢ) = n(Aᵢ)/total, le second les poids
 * CONDITIONNELS P_Aᵢ(B) = n(Aᵢ ∩ B)/n(Aᵢ). Les deux niveaux sont donc exacts
 * par construction, et la somme des branches d'un nœud vaut 1 au sens de
 * `ratEq` — pas « à 1e−6 près ».
 */
export function treeFromCross(t, { firstAxis = 'row' } = {}) {
  const firstKeys = firstAxis === 'row' ? t.rows : t.cols;
  const secondKeys = firstAxis === 'row' ? t.cols : t.rows;
  return firstKeys.map((k) => ({
    id: k,
    count: firstAxis === 'row' ? t.rowTotals[k] : t.colTotals[k],
    p: firstAxis === 'row' ? pRow(t, k) : pCol(t, k),
    children: secondKeys.map((s) => ({
      id: s,
      count: firstAxis === 'row' ? t.cells[k][s] : t.cells[s][k],
      p: conditional(t, { axis: firstAxis, key: k }, s),
    })),
  }));
}

/** Probabilité d'un chemin : le PRODUIT des poids rencontrés. */
export function pathProbability(tree, firstId, secondId) {
  const b = tree.find((x) => x.id === firstId);
  if (!b) throw new Error(`pathProbability: branche inconnue ${firstId}`);
  const c = b.children.find((x) => x.id === secondId);
  if (!c) throw new Error(`pathProbability: feuille inconnue ${secondId}`);
  return ratMul(b.p, c.p);
}

/** Tous les chemins qui mènent à une même issue de second niveau. */
export const pathsTo = (tree, secondId) =>
  tree.map((b) => ({
    firstId: b.id,
    p1: b.p,
    p2: b.children.find((c) => c.id === secondId).p,
    product: pathProbability(tree, b.id, secondId),
  }));

/**
 * FORMULE DES PROBABILITÉS TOTALES — l'apport propre de la Première.
 *
 * P(B) = Σᵢ P(Aᵢ) × P_Aᵢ(B), et cette écriture n'est légitime QUE si les Aᵢ
 * partitionnent l'univers. Le noyau le VÉRIFIE au lieu de le supposer :
 *   · somme des P(Aᵢ) = 1 EXACTEMENT (rationnels, pas de tolérance) ;
 *   · chaque nœud a bien la même issue B disponible.
 * Une famille qui ne partitionne pas fait lever une erreur : la leçon ne peut
 * pas afficher une « probabilité totale » sur une famille qui n'en est pas une.
 */
export function totalProbability(tree, secondId) {
  const weights = tree.map((b) => b.p);
  const s = ratSum(weights);
  if (!ratIsOne(s)) {
    throw new Error(
      `totalProbability: la famille ne partitionne pas l'univers (somme des poids = ${s.n}/${s.d})`,
    );
  }
  const paths = pathsTo(tree, secondId);
  return { total: ratSum(paths.map((p) => p.product)), paths };
}

/**
 * L'inversion du conditionnement LUE SUR L'ARBRE : P_B(Aᵢ), c'est-à-dire la
 * part du chemin i dans la somme de tous les chemins menant à B. C'est la
 * probabilité totale au dénominateur — d'où sa place APRÈS elle.
 */
export function inverseFromTree(tree, secondId, firstId) {
  const { total, paths } = totalProbability(tree, secondId);
  if (total.n === 0) return null;
  const one = paths.find((p) => p.firstId === firstId);
  if (!one) throw new Error(`inverseFromTree: branche inconnue ${firstId}`);
  return rat(one.product.n * total.d, one.product.d * total.n);
}

/* ══ La barre du module 1 : « le monde qui rétrécit » ════════════════════ */

/**
 * Composition d'une population de `total` individus, réglée par DEUX
 * SÉPARATIONS QU'ON FAIT GLISSER (aucun bouton ± : voir SplitPopulationLab) :
 *
 *   nB    — combien d'individus vérifient B  (première séparation)
 *   nAB   — parmi eux, combien vérifient aussi A  (seconde séparation)
 *
 * Le reste de la population est complété pour que la somme des quatre cases
 * fasse EXACTEMENT `total`. Le troisième effectif `nAnotB` (les A parmi les
 * non-B) est fixé par le scénario : il ne change ni P(A ∩ B) ni P_B(A), les
 * deux nombres que la mission compare.
 *
 * PIÈGE ATTRAPÉ PAR LE TEST : `nAnotB` fixe est un effectif ABSOLU, alors que
 * le groupe qui doit le contenir rétrécit quand l'élève tire la première
 * séparation vers la droite. À nB = 950, il n'y a plus que 50 individus hors
 * de B et le scénario en demandait 120 : l'état était mathématiquement
 * impossible, et le laboratoire jetait au milieu d'un glissement. Le scénario
 * déclare donc un PLAFOND, borné par la place réellement disponible — la
 * contrainte est appliquée au lieu d'être supposée.
 */
export const BAR_TOTAL = 1000;
/** Pas du glisser : 10 individus. Toute cible de la leçon tombe sur un cran. */
export const BAR_STEP = 10;

export function composition({ total = BAR_TOTAL, nB, nAB, nAnotB = 0 }) {
  if (![total, nB, nAB, nAnotB].every(Number.isInteger)) {
    throw new Error('composition: tous les effectifs doivent être entiers');
  }
  if (nB < 0 || nB > total) throw new Error(`composition: nB hors bornes (${nB})`);
  if (nAB < 0 || nAB > nB) throw new Error(`composition: nAB hors de B (${nAB} > ${nB})`);
  const nNotB = total - nB;
  if (nAnotB < 0) throw new Error(`composition: nAnotB négatif (${nAnotB})`);
  const nAOut = Math.min(nAnotB, nNotB);
  return crossFromCounts({
    rows: ['B', 'nonB'],
    cols: ['A', 'nonA'],
    cells: {
      B: { A: nAB, nonA: nB - nAB },
      nonB: { A: nAOut, nonA: nNotB - nAOut },
    },
    total,
  });
}

/** Les trois nombres que la mission du module 1 fait diverger. */
export function barReadings(state) {
  const t = composition(state);
  const inter = pInter(t, 'B', 'A');
  const condBA = conditional(t, { axis: 'row', key: 'B' }, 'A');   // P_B(A)
  const condAB = conditional(t, { axis: 'col', key: 'A' }, 'B');   // P_A(B)
  return {
    table: t,
    nAB: t.cells.B.A,
    nB: t.rowTotals.B,
    nA: t.colTotals.A,
    inter, condBA, condAB,
  };
}

/**
 * La mission du module 1 : DEUX compositions de même P(A ∩ B) et de P_B(A)
 * DIFFÉRENTS. Réussie dès que l'élève a visité deux états qui la réalisent.
 * `visited` est la liste des états déjà réglés, dans l'ordre.
 */
export function missionPairs(visited) {
  const out = [];
  for (let i = 0; i < visited.length; i += 1) {
    for (let j = i + 1; j < visited.length; j += 1) {
      const a = barReadings(visited[i]);
      const b = barReadings(visited[j]);
      if (ratEq(a.inter, b.inter) && !ratEq(a.condBA, b.condBA)) out.push([visited[i], visited[j]]);
    }
  }
  return out;
}

export const missionAccomplie = (visited) => missionPairs(visited).length > 0;

/**
 * Le chemin qui mène d'un état à l'autre AU GLISSER, cran par cran, en
 * respectant la contrainte nAB ≤ nB à chaque instant. Sert à PROUVER (test)
 * que la mission est réalisable au doigt, sans passage par un état interdit.
 */
export function dragPath(from, to, step = BAR_STEP) {
  const path = [{ ...from }];
  let cur = { ...from };
  const guard = 10000;
  let k = 0;
  // On élargit B avant de bouger nAB quand la cible est plus large, et
  // l'inverse sinon : nAB ≤ nB reste vrai à chaque cran.
  const order = to.nB >= from.nB ? ['nB', 'nAB'] : ['nAB', 'nB'];
  for (const key of order) {
    while (cur[key] !== to[key]) {
      if ((k += 1) > guard) throw new Error('dragPath: ne converge pas');
      const d = to[key] > cur[key] ? step : -step;
      const next = { ...cur, [key]: cur[key] + d };
      composition(next);            // lève si l'état est interdit
      cur = next;
      path.push({ ...cur });
    }
  }
  return path;
}
