/**
 * fair-share — la logique PURE du partage équitable (1AM, unité 4 « الكتابات الكسرية », درس « حاصل القسمة والكسر »,
 * manuel نشاط 1 p. 53 et معارف 1 p. 55). Aucun React ici. Toute la vérité est EXACTE, par fractions
 * (`@smarter-academy/core/arithmetic/linear.js`, importé par chemin — jamais le barrel du core).
 *
 * L'idée (refonte 2026-10-15). a gâteaux ronds sont posés sur la table pour b enfants. La main fait DEUX gestes discrets :
 *   n  « قسّم كل كعكة إلى n قطع » — chaque gâteau est coupé en n parts égales (n = 1, 2, 3 … 12) ;
 *   m  « كل واحد يأخذ m قطع » — chaque enfant prend m de ces parts : sa PART vaut x = m / n gâteau.
 * Le labo juge le TOTAL b × x contre a :
 *
 *   exact  b × x = a   rien ne reste, rien ne manque ;
 *   short  b × x < a   il reste (a − b × x) de gâteau sur la table ;
 *   over   b × x > a   il manque (b × x − a) : du gâteau qui n'existe pas.
 *
 * La découverte : couper en dixièmes (n = 10) ne tombe JUSTE ni pour 3 ÷ 4 (2,8 puis 3,2) ni pour 2 ÷ 3 (1,8 puis 2,1) — il reste ou
 * il manque toujours un peu —, alors que couper en n = b parts tombe juste pour tout a et tout b ≠ 0 (m = a), comme tout multiple de b.
 * Le nombre qui, multiplié par b, donne a existe toujours ; son écriture est a/b ; il n'est décimal que parfois (0,75 oui, 0,666… non).
 * n = 10 est la coupe « décimale » : c'est elle qui sert de contre-exemple aux essais de la phase formelle.
 *
 *     let s = init({ orders: [[3, 4], [2, 3]] });
 *     s = commitM(setN(s, 4), 3);   // exact : 4 enfants × 3 quarts = 12 quarts = 3 gâteaux (en dixièmes : jamais juste)
 *     s = next(s);                  // le contraste : 2 gâteaux pour 3 enfants
 *     s = commitM(setN(s, 10), 6);  // short : 3 × 0,6 = 1,8 — il reste 0,2 ; 7 → over
 *     s = commitM(setN(s, 3), 2);   // exact : 3 enfants × 2 tiers = 6 tiers = 2 gâteaux
 *
 * Un défaut n'est pas un essai (MANIPULATION_CONTRACT §6bis.2) : la scène s'ouvre à n = 1, m = 0 sans verdict ; un essai est un
 * nombre de parts m ≥ 1 choisi par l'élève.
 */
import { frac, mul, sub, neg, cmp, fracText, fracDecimal } from '@smarter-academy/core/arithmetic/linear.js';

export const SPLIT_LIMITS = Object.freeze([1, 12]);
/** La coupe « décimale » : les dixièmes. */
const DECIMAL_SPLIT = 10;

/** La plus grande part que l'élève peut poser (en gâteaux) : ⌈a / b⌉, plus un gâteau quand b divise a (la part juste ne doit pas être au bout). */
export const railMax = (a, b) => Math.floor((a + b - 1) / b) + (a % b === 0 ? 1 : 0);

/** Le nombre maximal de parts par enfant pour une coupe en n : railMax gâteaux de n parts. */
export const mMaxOf = (a, b, n) => railMax(a, b) * n;

/** Le nombre de chiffres après la virgule de a/b quand son écriture décimale s'arrête en ≤ 3 chiffres ; null sinon (jamais de décimale exacte). */
export function decimalDigits(a, b) {
  const t = fracDecimal(frac(a, b), 3);
  if (t === null) return null;
  return (t.split(',')[1] ?? '').length;
}

/** Une part x en texte : « 0,75 » si elle est décimale, sinon la fraction. */
export const decimalText = (x) => fracDecimal(x, 3) ?? fracText(x);

/**
 * Le verdict EXACT de « n parts par gâteau, m parts chacun » pour a gâteaux et b enfants.
 *   { a, b, n, m, x: m/n, total: b·x, gap: a − b·x, kind, ok, left: gâteau restant (short) ou null, missing: gâteau manquant (over) ou null }
 */
export function judge(a, b, n, m) {
  const x = frac(m, n);
  const total = mul(x, frac(b));
  const gap = sub(frac(a), total);
  const c = cmp(total, frac(a));
  const kind = c === 0 ? 'exact' : c < 0 ? 'short' : 'over';
  return Object.freeze({
    a, b, n, m, x, total, gap, kind, ok: c === 0,
    left: c < 0 ? gap : null, missing: c > 0 ? neg(gap) : null,
  });
}

/* ── État ─────────────────────────────────────────────────────────────────────────── */

const put = (s, patch) => Object.freeze({ ...s, ...patch });

/**
 * `orders` : la liste des demandes [a, b] (gâteaux, enfants) — la première, puis le contraste (la carte « طلب جديد »).
 */
export function init({ orders }) {
  const [a, b] = orders[0];
  return Object.freeze({
    orders: Object.freeze(orders.map((o) => Object.freeze([...o]))),
    base: orders.length,   // les demandes de la leçon ; au-delà : la demande LIBRE de l'élève (index `base`), jamais comptée
    i: 0, a, b,
    n: 1, m: 0,
    trials: Object.freeze([]),
    last: null,
  });
}
/** « إعادة » : tout recommencer, mémoire des essais comprise. */
export const reset = (s) => init({ orders: s.orders.slice(0, s.base) });
/** « أعِد التجربة » (questions du labo) : LA MÊME demande repart (coupe, parts et ses essais effacés). */
export const retryOrder = (s) => put(s, { n: 1, m: 0, last: null, trials: Object.freeze(s.trials.filter((t) => t.i !== s.i)) });

const clampN = (n) => Math.max(SPLIT_LIMITS[0], Math.min(SPLIT_LIMITS[1], Math.round(n)));
const clampM = (s, m, n = s.n) => Math.max(0, Math.min(mMaxOf(s.a, s.b, n), Math.round(m)));

/** Couper chaque gâteau en n parts : les parts d'un enfant repartent à zéro (ce n'est pas un essai). */
export function setN(s, n) {
  const nn = clampN(n);
  return nn === s.n ? s : put(s, { n: nn, m: 0, last: null });
}

/** Choisir m parts par enfant : un ESSAI jugé (m ≥ 1). Deux choix identiques de suite ne comptent qu'une fois. */
export function commitM(s, m) {
  const mm = clampM(s, m);
  if (mm === 0) return put(s, { m: 0, last: null });
  const v = judge(s.a, s.b, s.n, mm);
  const prev = s.trials.at(-1);
  const again = prev && prev.i === s.i && prev.n === s.n && prev.m === mm;
  const trial = Object.freeze({
    i: s.i, a: s.a, b: s.b, n: s.n, m: mm, kind: v.kind, ok: v.ok, free: isFree(s),
    ruler: s.n === s.b ? 'cut' : s.n === DECIMAL_SPLIT ? 'dec' : 'other',
    x: `${mm}/${s.n}`, total: fracText(v.total), gap: fracText(v.gap),
  });
  return put(s, {
    m: mm,
    trials: again ? s.trials : Object.freeze([...s.trials, trial]),
    last: Object.freeze({ i: s.i, n: s.n, m: mm, verdict: v }),
  });
}

/** Le verdict à montrer : celui du dernier choix, seulement s'il porte sur la coupe et les parts affichées. */
export const shownVerdict = (s) => (s.last && s.last.i === s.i && s.last.n === s.n && s.last.m === s.m ? s.last.verdict : null);

/* ── Les essais d'une demande ─────────────────────────────────────────────────────── */

const ofOrder = (s, i) => s.trials.filter((t) => t.i === i);
/** Les essais en DIXIÈMES (n = 10) de la demande i, un seul par valeur distincte. */
function decimalTrials(s, i = s.i) {
  const seen = new Set();
  return ofOrder(s, i).filter((t) => t.n === DECIMAL_SPLIT).filter((t) => { if (seen.has(t.m)) return false; seen.add(t.m); return true; });
}
export const orderSolved = (s, i = s.i) => ofOrder(s, i).some((t) => t.ok);
/** Cette demande a-t-elle une part DÉCIMALE exacte ? (3 ÷ 4 oui ; 2 ÷ 3, 5 ÷ 6, 7 ÷ 3 non.) */
export const decimalLands = (a, b) => decimalDigits(a, b) !== null;

/* ── Ses propres nombres : la demande LIBRE ───────────────────────────────────────── */

export const FREE_LIMITS = Object.freeze({ cakes: [1, 12], kids: [2, 8] });
const within = ([lo, hi], v) => Math.max(lo, Math.min(hi, Math.round(v)));

/** La demande courante est-elle celle de l'élève (hors parcours de la leçon) ? */
export const isFree = (s) => s.i >= s.base;

/**
 * « جرّب أعدادك » : l'élève choisit a gâteaux et b enfants (a ∈ 1–12, b ∈ 2–8). La demande libre est UNE case après les demandes de la
 * leçon : elle repart à zéro (coupe, parts, essais) à chaque changement, et ne compte JAMAIS pour la découverte ni la phase formelle.
 */
export function setCustom(s, a, b) {
  const aa = within(FREE_LIMITS.cakes, a);
  const bb = within(FREE_LIMITS.kids, b);
  if (isFree(s) && s.a === aa && s.b === bb) return s;
  const orders = Object.freeze([...s.orders.slice(0, s.base), Object.freeze([aa, bb])]);
  return put(s, {
    orders, i: s.base, a: aa, b: bb, n: 1, m: 0, last: null,
    trials: Object.freeze(s.trials.filter((t) => t.i < s.base)),
  });
}

/** Quitter la demande libre : la première demande de la leçon pas encore résolue (sinon la dernière). */
export function toGuided(s) {
  if (!isFree(s)) return s;
  let i = s.orders.slice(0, s.base).findIndex((_, k) => !orderSolved(s, k));
  if (i < 0) i = s.base - 1;
  const [a, b] = s.orders[i];
  return put(s, { i, a, b, n: 1, m: 0, last: null });
}

/* ── Le contraste : la demande suivante ───────────────────────────────────────────── */

export const canNext = (s) => s.i < s.base - 1 && orderSolved(s);
export function next(s) {
  if (!canNext(s)) return s;
  const [a, b] = s.orders[s.i + 1];
  return put(s, { i: s.i + 1, a, b, n: 1, m: 0, last: null });
}
/** Revenir à une demande précédente (la mémoire des essais est gardée). */
export function back(s, i = s.i - 1) {
  if (i < 0 || i >= s.i) return s;
  const [a, b] = s.orders[i];
  return put(s, { i, a, b, n: 1, m: 0, last: null });
}

/** La découverte s'ouvre quand TOUTES les demandes de la leçon sont résolues (par la coupe que l'élève a choisie). */
export function discoveryReady(s) {
  return s.orders.slice(0, s.base).every((_, i) => orderSolved(s, i));
}

/* ── Ce que la leçon reçoit ───────────────────────────────────────────────────────── */

/** Un essai pour `onTrial` (la leçon l'écoute via `state.report`). */
export const trialEvidence = (tr) => ({ order: `${tr.a}/${tr.b}`, ruler: tr.ruler, n: tr.n, m: tr.m, x: tr.x, kind: tr.kind, ok: tr.ok, free: Boolean(tr.free) });
export const finishedEvidence = (s) => ({ orders: s.orders.slice(0, s.base).map(([a, b]) => `${a}/${b}`) });

/* ── Les écritures de la phase formelle (tout sort des essais de l'élève) ──────────── */

/**
 * Pour chaque demande : la fraction a/b, sa valeur décimale quand elle existe (3/4 = 0,75), et sinon les DEUX valeurs
 * décimales encadrantes — celles de l'élève (la plus grande part `short`, la plus petite part `over` de ses essais en dixièmes)
 * sinon celles au centième.
 */
export function formalOf(s) {
  return s.orders.slice(0, s.base).map(([a, b], i) => {
    const q = frac(a, b);
    const dec = fracDecimal(q, 3);
    let approx = null;
    if (dec === null) {
      const dt = decimalTrials(s, i);
      const toX = (t) => frac(t.m, t.n);
      const shorts = dt.filter((t) => t.kind === 'short').map(toX).sort((p, r) => cmp(r, p));
      const overs = dt.filter((t) => t.kind === 'over').map(toX).sort((p, r) => cmp(p, r));
      const fromTrials = Boolean(shorts[0] && overs[0]);
      const below = fromTrials ? shorts[0] : frac(Math.floor((a * 100) / b), 100);
      const above = fromTrials ? overs[0] : frac(Math.floor((a * 100) / b) + 1, 100);
      approx = { below: decimalText(below), above: decimalText(above), fromTrials };
    }
    return { a, b, i, solved: orderSolved(s, i), fraction: `${a}/${b}`, decimal: dec, approx };
  });
}

/** Les réfutations des fausses conjectures, avec les chiffres de l'élève (demande i) : la part en dixièmes « presque juste » et la fraction renversée. */
export function refutations(s, i = s.i) {
  const [a, b] = s.orders[i];
  const dt = decimalTrials(s, i).filter((t) => !t.ok);
  const x = (t) => frac(t.m, t.n);
  const gapOf = (t) => { const g = sub(frac(a), mul(x(t), frac(b))); return g.n < 0 ? neg(g) : g; };
  const best = dt.length ? dt.reduce((p, t) => (cmp(gapOf(t), gapOf(p)) < 0 ? t : p)) : null;
  const decimal = best
    ? { x: decimalText(x(best)), total: decimalText(mul(x(best), frac(b))), gap: decimalText(gapOf(best)), kind: best.kind }
    : null;
  const inv = frac(b, a);
  const invTotal = mul(inv, frac(b));
  return {
    a, b,
    decimal,
    inverse: { x: fracText(inv), total: fracText(invTotal), kind: cmp(invTotal, frac(a)) > 0 ? 'over' : cmp(invTotal, frac(a)) < 0 ? 'short' : 'exact' },
  };
}

/* ── Onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ────────────────────────── */

/**
 * La prochaine commande à montrer à l'élève — jamais la réponse (ni n, ni m) : seulement le CONTRÔLE.
 *   pieces  avant tout essai de la demande : « كل واحد يأخذ » (le choix du nombre de parts) ;
 *   split   après un essai qui n'a pas tombé juste : « قسّم كل كعكة » (la coupe) ;
 *   again   puis tant que la demande n'est pas résolue : on rechoisit les parts ;
 *   next    la carte « طلب جديد » une fois la demande résolue ;
 * `null` quand la découverte est gagnée. Un pas n'est montré qu'une fois (LabCoach retient les ids).
 * @returns {{ id: string, target: string, gesture: 'tap' } | null}
 */
export function coachOf(s) {
  if (discoveryReady(s) && !canNext(s)) return null;
  const mine = ofOrder(s, s.i);
  if (mine.length === 0) return { id: 'pieces', target: '[data-fs-take]', gesture: 'tap' };
  if (!orderSolved(s)) {
    const splits = new Set(mine.map((t) => t.n));
    if (splits.size === 1 && mine.length >= 2) return { id: 'split', target: '[data-fs-split]', gesture: 'tap' };
    return { id: 'again', target: '[data-fs-take]', gesture: 'tap' };
  }
  if (canNext(s)) return { id: 'next', target: '[data-fs-next-button]', gesture: 'tap' };
  return null;
}

/* ── Géométrie (px), pure et testée ───────────────────────────────────────────────── */

/**
 * La TABLE : N = b × railMax cases rondes (toute part possible y tient : b parts de railMax gâteaux au plus), les `a` premières
 * portent un VRAI gâteau, les suivantes un gâteau fantôme (du gâteau qui n'existe pas) quand la demande dépasse. Les cases sont
 * rangées en 1, 2 ou 3 rangées ; `d` est le diamètre d'un gâteau.
 *   cell(i) : { cx, cy, r } du i-ème gâteau ; height : la hauteur de la table.
 */
export function cakesLayout({ width, a, b, pad = 10, top = pad, maxD = 92 }) {
  const rail = railMax(a, b);
  const N = b * rail;
  const gap = 6;
  // le plus GRAND diamètre : 1, 2 ou 3 rangées, celle qui donne les gâteaux les plus larges (à égalité, la moins haute)
  const fit = (r) => Math.max(22, Math.min(maxD, Math.floor((width - 2 * pad - (Math.ceil(N / r) - 1) * gap) / Math.ceil(N / r))));
  const rows = [1, 2, 3].reduce((best, r) => (fit(r) > fit(best) ? r : best), 1);
  const cols = Math.ceil(N / rows);
  const d = fit(rows);
  const rowW = (n) => n * d + (n - 1) * gap;
  const cell = (i) => {
    const row = Math.floor(i / cols);
    const inRow = Math.min(cols, N - row * cols);
    const col = i - row * cols;
    const x0 = (width - rowW(inRow)) / 2;
    return { cx: x0 + col * (d + gap) + d / 2, cy: top + d / 2 + row * (d + gap), r: d / 2 };
  };
  return { N, A: N, rail, rows, cols, d, gap, cell, height: top + pad + rows * d + (rows - 1) * gap };
}

/**
 * Les TRANCHES : l'enfant i prend, de la ligne continue de gâteaux, l'intervalle [i·x, (i+1)·x] (x en gâteaux, fraction n/d) ;
 * ce qui tombe sur le gâteau c est une tranche d'angles [a0, a1] (en tours, 0 = midi, sens horaire).
 *   → [{ kid, cake, a0, a1 }, …] ; une part qui chevauche deux gâteaux donne deux tranches. `rest` : ce que la demande laisse intact
 *   (le même découpage de [b·x, a]), vide si rien ne reste.
 */
export function slicesOf({ a, b, x }) {
  const EPS = 1e-9;
  const xv = x.n / x.d;
  const cut = (from, to, tag) => {
    const out = [];
    if (to - from < EPS) return out;
    for (let c = Math.floor(from + EPS); c < to - EPS; c += 1) {
      const lo = Math.max(from, c);
      const hi = Math.min(to, c + 1);
      if (hi - lo > EPS) out.push({ ...tag, cake: c, a0: lo - c, a1: hi - c });
    }
    return out;
  };
  const kids = [];
  for (let i = 0; i < b; i += 1) kids.push(...cut(i * xv, (i + 1) * xv, { kid: i }));
  const total = b * xv;
  return { kids, rest: total < a - EPS ? cut(total, a, { kid: -1 }) : [], total };
}

/** Les b enfants : l'abscisse centrale de chacun (répartis sur la largeur) et la place d'un enfant. */
export function kidsLayout({ width, b, pad = 10 }) {
  const slot = (width - 2 * pad) / b;
  return { slot, cx: (i) => pad + (i + 0.5) * slot };
}
