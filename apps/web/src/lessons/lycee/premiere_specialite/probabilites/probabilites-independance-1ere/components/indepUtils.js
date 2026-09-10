/**
 * Noyau de calcul de « Probabilités : inverser le conditionnement et
 * l'indépendance » — fonctions PURES, testées avant toute JSX
 * (indepUtils.test.js).
 *
 * D'OÙ VIENT CETTE ARITHMÉTIQUE. La leçon voisine
 * `probabilites-conditionnelles-arbres-1ere` a établi, dans son
 * `components/condUtils.js`, une arithmétique RATIONNELLE EXACTE
 * (`rat`/`ratAdd`/`ratMul`/`ratEq`, `crossFromCounts`, `treeFromCross`,
 * `totalProbability`, `inverseFromTree`, `conditional`). Cette leçon en est la
 * suite directe et en reprend le contrat au caractère près. La copie est
 * DÉLIBÉRÉE et non une duplication par négligence : le fichier voisin est un
 * fichier de LEÇON, pas un module partagé — l'importer d'un dossier frère
 * ferait dépendre la présente leçon du cycle de vie d'une autre, et le modifier
 * était explicitement interdit. Le jour où une troisième leçon en aura besoin,
 * ce noyau montera dans `lessons/common/stats` ; c'est signalé au rapport.
 *
 * TROIS EXIGENCES DE JUSTESSE, qui commandent toute la conception :
 *
 * 1. LES EFFECTIFS SONT ENTIERS ET SOMMENT EXACTEMENT AU TOTAL. Toute
 *    composition passe par `crossFromCounts`, qui refuse un tableau non entier
 *    ou dont la somme n'est pas le total annoncé.
 *
 * 2. LES PROBABILITÉS SONT DES FRACTIONS D'ENTIERS, JAMAIS DES FLOTTANTS
 *    ACCUMULÉS. La leçon AFFIRME « les deux poids sont IDENTIQUES » et « la
 *    somme des branches vaut 1 » : sur des flottants, 0,3 × 0,4 + 0,7 × 0,4
 *    rend 0,4000000000000001 et l'affirmation deviendrait fausse à l'écran,
 *    précisément au moment où l'élève doit la constater. `ratEq` compare par
 *    produit croisé : aucune tolérance, aucun epsilon.
 *
 * 3. L'INDÉPENDANCE EST UN TEST EXACT SUR DES ENTIERS. Sur une population de
 *    N individus, A et B sont indépendants si et seulement si
 *
 *        n(A ∩ B) × N = n(A) × n(B)
 *
 *    — une égalité d'ENTIERS, qui ne dépend d'aucun arrondi. `independence`
 *    ne compare jamais deux décimaux : c'est ce qui permet au laboratoire de
 *    dire « ici, EXACTEMENT » et non « ici, à peu près ».
 *
 * PÉRIMÈTRE CODÉ, PAS COMMENTÉ (perimetre_executable_lecon) :
 *   · `conditional` REFUSE de rendre 0 sur un univers vide — il rend `null`,
 *     parce qu'une probabilité conditionnelle sachant l'impossible n'existe
 *     pas, et que rendre 0 ferait passer l'indéfini pour du certain ;
 *   · `inversionPair` REFUSE d'inverser vers un univers vide, pour la
 *     même raison ;
 *   · `independence` REFUSE une paire dont l'un des deux événements est vide
 *     ou plein : la question « sont-ils indépendants ? » y est vraie
 *     trivialement et ne prouve rien, et la leçon ne doit pas pouvoir
 *     l'exhiber comme un exemple.
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
export const ratEq = (x, y) => x !== null && y !== null && x.n * y.d === y.n * x.d;
export const ratIsOne = (x) => x.n === x.d;
export const ratIsZero = (x) => x.n === 0;
/** Valeur décimale — pour l'AFFICHAGE seulement, jamais pour un calcul. */
export const ratValue = (x) => x.n / x.d;
export const ratSum = (list) => list.reduce(ratAdd, rat(0, 1));

/* ══ Formatage ═══════════════════════════════════════════════════════════ */

/**
 * Décimal à la française : 0.075 → « 0,075 », 40 → « 40 ».
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST, et corrigé ici. La version naïve — celle que la
 * leçon voisine porte encore — retire les zéros de FIN sans vérifier qu'il y a
 * une virgule : `fr(40, 0)` rendait « 4 ». Un pourcentage de 40 % s'affichait
 * donc « 4 % » dès qu'on demandait zéro décimale, c'est-à-dire exactement dans
 * les explications qui n'ont pas de partie décimale. La troncature ne s'applique
 * qu'à la PARTIE DÉCIMALE, et seulement s'il y en a une. Signalé au rapport
 * pour `condUtils.js`, qu'il ne m'appartient pas de modifier.
 */
export const fr = (v, dp = 3) => {
  const s = v.toFixed(dp);
  const trimmed = s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  return trimmed.replace('.', ',');
};

/** Pourcentage à la française : 1/3 → « 33,3 % ». */
export const pct = (x, dp = 1) => (x === null ? '—' : `${fr(ratValue(x) * 100, dp)} %`);

/** « 200 / 500 » — le quotient en toutes lettres, jamais son seul résultat. */
export const quotient = (n, d) => `${n} / ${d}`;

/* ══ Tableau croisé sur des EFFECTIFS ENTIERS ════════════════════════════ */

/**
 * Un tableau croisé vérifié : deux critères, des effectifs entiers, un total
 * qui tombe juste. C'est l'unique porte d'entrée des données de la leçon.
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

export const nInter = (t, r, c) => t.cells[r][c];
export const pInter = (t, r, c) => rat(t.cells[r][c], t.total);
export const pRow = (t, r) => rat(t.rowTotals[r], t.total);
export const pCol = (t, c) => rat(t.colTotals[c], t.total);

/**
 * P_condition(événement) sur les effectifs : n(condition ∩ événement) / n(condition).
 * `given` désigne la CONDITION — celle qui donne le dénominateur.
 * Rend `null` si la condition est vide.
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

/* ══ Arbres pondérés à deux niveaux ══════════════════════════════════════ */

/**
 * Arbre pondéré construit sur des EFFECTIFS. Le premier niveau porte P(Aᵢ), le
 * second les poids CONDITIONNELS P_Aᵢ(B) : les deux niveaux sont exacts par
 * construction, et la somme des branches d'un nœud vaut 1 au sens de `ratEq`.
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
  if (c.p === null) return rat(0, 1);
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
 * FORMULE DES PROBABILITÉS TOTALES — acquise au module précédent de la
 * progression, employée ici comme DÉNOMINATEUR de l'inversion. Le noyau
 * VÉRIFIE la partition au lieu de la supposer.
 */
export function totalProbability(tree, secondId) {
  const s = ratSum(tree.map((b) => b.p));
  if (!ratIsOne(s)) {
    throw new Error(
      `totalProbability: la famille ne partitionne pas l'univers (somme des poids = ${s.n}/${s.d})`,
    );
  }
  const paths = pathsTo(tree, secondId);
  return { total: ratSum(paths.map((p) => p.product)), paths };
}

/* ══ P1 — INVERSER LE CONDITIONNEMENT ════════════════════════════════════ */

/**
 * L'INVERSION, sur le tableau croisé : de P_A(B) on passe à P_B(A).
 *
 * Le numérateur ne bouge pas — c'est le même effectif d'intersection. Seul le
 * DÉNOMINATEUR change de camp : n(A) devient n(B). C'est exactement ce que la
 * leçon fait constater, et le noyau le rend explicite en renvoyant les DEUX
 * quotients avec leurs effectifs, pas seulement leurs valeurs.
 *
 * Rend `null` sur un univers d'arrivée vide : inverser vers l'impossible n'a
 * pas de sens, et rendre 0 le ferait passer pour un résultat.
 */
export function inversionPair(t, { fromAxis, fromKey, toKey }) {
  const toAxis = fromAxis === 'row' ? 'col' : 'row';
  const direct = conditional(t, { axis: fromAxis, key: fromKey }, toKey);
  const inverse = conditional(t, { axis: toAxis, key: toKey }, fromKey);
  const nInterCell = fromAxis === 'row' ? t.cells[fromKey][toKey] : t.cells[toKey][fromKey];
  const nFrom = fromAxis === 'row' ? t.rowTotals[fromKey] : t.colTotals[fromKey];
  const nTo = toAxis === 'row' ? t.rowTotals[toKey] : t.colTotals[toKey];
  return {
    direct, inverse,
    numerator: nInterCell,
    denomDirect: nFrom,
    denomInverse: nTo,
    /** Les deux sens coïncident-ils ? En général NON — et c'est le point. */
    same: direct !== null && inverse !== null && ratEq(direct, inverse),
  };
}

/**
 * L'inversion LUE SUR UN ARBRE (la « formule de Bayes » sans son nom) :
 * P_B(Aᵢ) est la part du chemin i dans la somme de TOUS les chemins menant à
 * B. La probabilité totale est au dénominateur — d'où sa place après elle.
 */
export function inverseFromTree(tree, secondId, firstId) {
  const { total, paths } = totalProbability(tree, secondId);
  if (ratIsZero(total)) return null;
  const one = paths.find((p) => p.firstId === firstId);
  if (!one) throw new Error(`inverseFromTree: branche inconnue ${firstId}`);
  return rat(one.product.n * total.d, one.product.d * total.n);
}

/* ══ P2, P3 — L'INDÉPENDANCE ═════════════════════════════════════════════ */

/**
 * INDÉPENDANCE, TESTÉE SUR LES ENTIERS.
 *
 * Trois écritures équivalentes, que la leçon fait constater comme équivalentes
 * au lieu de les asséner :
 *      P(A ∩ B) = P(A) × P(B)     ⟺     P_B(A) = P(A)     ⟺     P_A(B) = P(B)
 * Sur une population de N individus, la première s'écrit sans aucune division :
 *      n(A ∩ B) × N = n(A) × n(B)
 * C'est ce produit croisé d'ENTIERS que le noyau teste. Aucune tolérance,
 * aucun epsilon : le laboratoire peut donc afficher « exactement », et non
 * « à peu près ».
 *
 * @returns {{independent, exact:{left,right}, pA, pB, pInter, pAtimesPB,
 *            condAB, condBA, degenerate}}
 */
export function independence(t, { rowKey, colKey }) {
  const N = t.total;
  const nA = t.rowTotals[rowKey];
  const nB = t.colTotals[colKey];
  const nAB = t.cells[rowKey][colKey];
  const left = nAB * N;
  const right = nA * nB;
  // CAS DÉGÉNÉRÉ : un événement vide ou plein rend l'égalité vraie sans rien
  // apprendre (∅ est indépendant de tout). La leçon ne doit pas pouvoir
  // exhiber cela comme un exemple d'indépendance, donc on le SIGNALE.
  const degenerate = nA === 0 || nB === 0 || nA === N || nB === N;
  return {
    independent: left === right,
    degenerate,
    exact: { left, right },
    counts: { nA, nB, nAB, N },
    pA: rat(nA, N),
    pB: rat(nB, N),
    pInter: rat(nAB, N),
    pAtimesPB: ratMul(rat(nA, N), rat(nB, N)),
    condAB: conditional(t, { axis: 'row', key: rowKey }, colKey),   // P_A(B)
    condBA: conditional(t, { axis: 'col', key: colKey }, rowKey),   // P_B(A)
  };
}

/**
 * P4 — INDÉPENDANT n'est pas INCOMPATIBLE, et le noyau le DÉMONTRE au lieu de
 * l'affirmer.
 *
 * Deux événements sont incompatibles quand n(A ∩ B) = 0. Si de plus P(A) > 0
 * et P(B) > 0, alors P(A) × P(B) > 0 = P(A ∩ B) : ils ne PEUVENT PAS être
 * indépendants. La fonction rend le verdict ET les deux nombres qui le
 * fondent, pour que le module les affiche côte à côte — c'est un CONSTAT, pas
 * une récitation.
 */
export function compatibility(t, { rowKey, colKey }) {
  const ind = independence(t, { rowKey, colKey });
  const incompatible = ind.counts.nAB === 0;
  const bothPossible = ind.counts.nA > 0 && ind.counts.nB > 0;
  return {
    incompatible,
    bothPossible,
    independent: ind.independent,
    pInter: ind.pInter,
    pAtimesPB: ind.pAtimesPB,
    /**
     * Le théorème, sous forme exécutable : incompatibles et tous deux
     * possibles ⇒ jamais indépendants. Vrai quand la situation le vérifie.
     */
    provesNotIndependent: incompatible && bothPossible && !ind.independent,
  };
}

/* ══ LE LABORATOIRE DU MODULE 1 : « l'arbre qu'on retourne » ═════════════ */

/**
 * LA POPULATION, ET CE QUI SE GLISSE.
 *
 * `LAB_TOTAL` individus. DEUX séparations qu'on attrape et qu'on fait glisser
 * (règle utilisateur du 2026-09-10, « le glisser d'abord » — aucun bouton ±) :
 *
 *   nA   — combien vérifient A                      (première séparation)
 *   nAB  — parmi eux, combien vérifient aussi B     (seconde séparation)
 *
 * `LAB_NB` — combien vérifient B — est FIXÉ par le scénario. Ce choix est
 * pédagogique, pas technique : l'arbre de droite (conditionné par B d'abord)
 * garde alors des poids de PREMIER niveau immobiles, si bien que tout ce qui
 * bouge à droite est le SECOND niveau. L'élève voit donc, sans être distrait,
 * les deux poids de deuxième génération se rapprocher puis coïncider.
 *
 * ATTEIGNABILITÉ (prouvée par balayage dans indepUtils.test.js). Avec
 * N = 1000, n(B) = 400 et un pas de 10, l'égalité entière n(A∩B)·N = n(A)·n(B)
 * a DIX-NEUF solutions non dégénérées atteignables, de (nA, nAB) = (50, 20) à
 * (950, 380) — dont (500, 200), l'état-cible affiché par la mission. Ce n'est
 * pas un hasard heureux : n(B)/N = 2/5 est une fraction de dénominateur 5, et
 * le pas de 10 fait que nAB = (2/5)·nA reste entier ET multiple de 10 dès que
 * nA est multiple de 50.
 */
export const LAB_TOTAL = 1000;
export const LAB_NB = 400;
/** Pas du glisser : 10 individus. Toute cible de la leçon tombe sur un cran. */
export const LAB_STEP = 10;

/** Bornes de validité de (nA, nAB) : les quatre cases doivent rester ≥ 0. */
export const nABMin = (nA, total = LAB_TOTAL, nB = LAB_NB) => Math.max(0, nA + nB - total);
export const nABMax = (nA, nB = LAB_NB) => Math.min(nA, nB);

/** L'état est-il atteignable au glisser ? (crans, bornes, entiers) */
export function isLabState({ nA, nAB }, { total = LAB_TOTAL, nB = LAB_NB, step = LAB_STEP } = {}) {
  if (!Number.isInteger(nA) || !Number.isInteger(nAB)) return false;
  if (nA % step !== 0 || nAB % step !== 0) return false;
  if (nA < 0 || nA > total) return false;
  return nAB >= nABMin(nA, total, nB) && nAB <= nABMax(nA, nB);
}

/**
 * Le tableau croisé de l'état du laboratoire. Les quatre cases sont DÉRIVÉES
 * de (nA, nAB) et somment exactement au total — `crossFromCounts` le refuse
 * autrement.
 */
export function labTable({ nA, nAB }, { total = LAB_TOTAL, nB = LAB_NB } = {}) {
  return crossFromCounts({
    rows: ['A', 'nonA'],
    cols: ['B', 'nonB'],
    cells: {
      A: { B: nAB, nonB: nA - nAB },
      nonA: { B: nB - nAB, nonB: total - nA - (nB - nAB) },
    },
    total,
  });
}

/**
 * LES DEUX ARBRES DE LA MÊME POPULATION, à la même seconde.
 *
 *   `byA` — A d'abord : premier niveau P(A), P(Ā) ; second niveau P_A(B), P_Ā(B).
 *   `byB` — B d'abord : premier niveau P(B), P(B̄) ; second niveau P_B(A), P_B̄(A).
 *
 * MÊMES quatre cases, MÊMES 1 000 individus — et pourtant des poids
 * différents. C'est le constat 1 du module 1. Le constat 2 : il existe des
 * réglages où, DANS UN MÊME ARBRE, les deux poids de deuxième génération sont
 * ÉGAUX. `identicalSecondLevel` le dit exactement.
 */
export function twoTrees(state, opts = {}) {
  const t = labTable(state, opts);
  return { table: t, byA: treeFromCross(t, { firstAxis: 'row' }), byB: treeFromCross(t, { firstAxis: 'col' }) };
}

/**
 * Les deux poids de deuxième génération d'un arbre sont-ils identiques ?
 * `null` (univers vide) n'est jamais « identique » à quoi que ce soit : un
 * arbre dont une branche n'existe pas ne montre rien.
 */
export function identicalSecondLevel(tree, secondId) {
  const ps = tree.map((b) => b.children.find((c) => c.id === secondId).p);
  if (ps.some((p) => p === null)) return false;
  return ps.every((p) => ratEq(p, ps[0]));
}

/** Toutes les lectures que le laboratoire affiche, dérivées d'un seul état. */
export function labReadings(state, opts = {}) {
  const { table, byA, byB } = twoTrees(state, opts);
  const ind = independence(table, { rowKey: 'A', colKey: 'B' });
  return {
    table, byA, byB, ...ind,
    /** Constat 1 : P_A(B) et P_B(A) diffèrent-ils ? */
    sensesDiffer: ind.condAB !== null && ind.condBA !== null && !ratEq(ind.condAB, ind.condBA),
    /** Constat 2 : les poids de 2ᵉ génération coïncident-ils dans CHAQUE arbre ? */
    flatA: identicalSecondLevel(byA, 'B'),
    flatB: identicalSecondLevel(byB, 'A'),
  };
}

/**
 * TOUS les réglages d'indépendance atteignables au glisser, par BALAYAGE.
 * Les cas dégénérés sont exclus : ils satisfont l'égalité sans rien montrer.
 * C'est cette fonction qui PROUVE que la cible du module 1 est atteignable —
 * le test l'exécute, la leçon ne le suppose pas.
 */
export function independentStates({ total = LAB_TOTAL, nB = LAB_NB, step = LAB_STEP } = {}) {
  const out = [];
  for (let nA = 0; nA <= total; nA += step) {
    for (let nAB = nABMin(nA, total, nB); nAB <= nABMax(nA, nB); nAB += step) {
      if (nAB % step !== 0) continue;
      const t = labTable({ nA, nAB }, { total, nB });
      const ind = independence(t, { rowKey: 'A', colKey: 'B' });
      if (ind.independent && !ind.degenerate) out.push({ nA, nAB });
    }
  }
  return out;
}

/**
 * LE CHEMIN AU GLISSER, cran par cran, d'un état à l'autre — chaque état
 * intermédiaire étant lui-même valide. Sert à PROUVER (test) que la cible
 * s'atteint au doigt sans passer par un état interdit.
 *
 * L'ordre des deux séparations n'est pas indifférent : élargir A avant de
 * pousser l'intersection (et l'inverse en rétrécissant) garantit
 * nAB ≤ min(nA, nB) et nAB ≥ nA + nB − N à chaque cran.
 */
export function dragPath(from, to, { total = LAB_TOTAL, nB = LAB_NB, step = LAB_STEP } = {}) {
  const clampAB = (nA, nAB) => Math.min(nABMax(nA, nB), Math.max(nABMin(nA, total, nB), nAB));
  const path = [{ ...from }];
  let cur = { ...from };
  const guard = 10000;
  let k = 0;
  const order = to.nA >= from.nA ? ['nA', 'nAB'] : ['nAB', 'nA'];
  for (const key of order) {
    while (cur[key] !== to[key]) {
      if ((k += 1) > guard) throw new Error('dragPath: ne converge pas');
      const d = to[key] > cur[key] ? step : -step;
      const nextRaw = { ...cur, [key]: cur[key] + d };
      // La seconde séparation SUIT la première quand celle-ci la pousse : c'est
      // ce que fait le laboratoire sous le doigt, et le chemin doit le refléter.
      const next = { nA: nextRaw.nA, nAB: clampAB(nextRaw.nA, nextRaw.nAB) };
      if (!isLabState(next, { total, nB, step })) {
        throw new Error(`dragPath: état interdit (${next.nA}, ${next.nAB})`);
      }
      cur = next;
      path.push({ ...cur });
    }
  }
  if (cur.nA !== to.nA || cur.nAB !== to.nAB) {
    throw new Error(`dragPath: n'atteint pas la cible (${cur.nA}, ${cur.nAB})`);
  }
  return path;
}
