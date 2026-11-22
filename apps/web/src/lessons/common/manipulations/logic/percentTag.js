import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as PR from '@smarter-academy/core/arithmetic/proportional.js';

const { frac, parseNumber, mul, sub, add, div, eq, cmp, toNumber, fracDecimal, fracLatex } = LIN;

/**
 * percent-tag — L'ÉTIQUETTE QU'ON ÉTIRE (unité 6 « الدالة الخطية والتناسبية », leçon 4
 * « تطبيقات التناسبية »).
 *
 * Un prix (ou un volume) est une BARRE. L'élève choisit زيادة / تخفيض et tire la poignée t % :
 * la nouvelle barre est l'ancienne MULTIPLIÉE par 1 ± t/100. Le multiplicateur k et la fonction
 * linéaire x ⟼ k·x s'écrivent dessous, comme conséquence. Les nombres viennent de la leçon :
 *
 *   price="1200" steps="+5"        نشاط 5 (p. 67) : +5 % sur 1200 DA → 1260 DA, y = 1,05x
 *   price="30"   steps="-30|+15"   طرائق (p. 71) : le réservoir de 30 m³ vidé de 30 %, puis
 *                                  rempli de 15 % de ce qu'il contient → 24,15 m³
 *
 * DEUX FORMES d'un même instrument, lues sur le nombre de changements (`steps`) :
 *   single  un changement : la vitrine (plusieurs articles x, le même t %) ; la barre
 *           ADDITIVE « x + t » peut être essayée — elle ne coïncide pas avec la barre
 *           multipliée (RÉSISTANCE, MISC-NISBA-JAM) ; un tableau x | y de l'élève montre
 *           y / x constant : la fonction linéaire x ⟼ k·x ;
 *   chain   des changements SUCCESSIFS : l'élève PARIE d'abord le changement global, puis
 *           construit la chaîne pas à pas ; le pari « on additionne » (−30 + 15 = −15 %) est
 *           réfuté par la barre elle-même (0,7 × 1,15 = 0,805 → −19,5 %, MISC-NISBA-TATABU-JAM) ;
 *           CONTRASTE : −20 % puis +20 % ne revient pas au départ (0,8 × 1,2 = 0,96).
 *
 * Toute l'arithmétique vient de packages/core/arithmetic/proportional.js (`percentMultiplier`,
 * `chainMultiplier`, `percentChange`) sur les fractions exactes de linear.js : aucune égalité de
 * flottants, aucune règle recalculée ici. Ce module ne fait que l'INTERACTION : les essais, les
 * refus, la mémoire, la découverte, et l'écriture (affichage).
 *
 * Un ESSAI est une valeur VALIDÉE (relâchement de la poignée, pause clavier) — pas une valeur
 * que le doigt traverse. Une valeur s est un ENTIER signé : +5 = « زيادة بـ 5% », −30 =
 * « تخفيض بـ 30% ». Le pari se règle par DEMI-points (b = −39 ⇔ −19,5 %).
 */

/** La poignée t % : de −T_MAX à +T_MAX (entiers). */
export const T_MAX = 50;
/** Le pari, en demi-points de pourcentage : −50 % … +10 %. */
export const BET_RANGE = Object.freeze({ min: -100, max: 20 });
/** Au plus trois changements dans une chaîne. */
export const CHAIN_MAX = 3;

/** Les articles de la vitrine (monde `mall`) : le premier est celui de la leçon. */
const MALL_ARTICLES = Object.freeze([
  Object.freeze({ id: 'sneakers', price: null }),       // le prix de la leçon (1200 DA, نشاط 5)
  Object.freeze({ id: 'jersey', price: '3000' }),       // plateforme : le maillot de l'équipe nationale
  Object.freeze({ id: 'cap', price: '800' }),           // plateforme : la casquette
]);

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

/* ── Lecture des nombres de la leçon ─────────────────────────────────────────────── */

/** « +5 » → [5] ; « -30|+15 » → [-30, 15]. Des entiers signés non nuls, |s| ≤ T_MAX. */
export function parseSteps(steps) {
  const out = String(steps).split('|').map((s) => s.trim().replace(/[−–]/g, '-').replace('%', ''));
  return out.map((s) => {
    if (!/^[+-]\d+$/.test(s)) throw new Error(`percent-tag: un changement s'écrit « +5 » ou « -30 » (« ${steps} »)`);
    const v = Number(s);
    if (v === 0 || Math.abs(v) > T_MAX) throw new Error(`percent-tag: changement hors de ±${T_MAX} % (« ${s} »)`);
    return v;
  });
}

/** Le multiplicateur d'un changement signé : s > 0 زيادة, s < 0 تخفيض, 0 → 1. */
export function multiplier(s) {
  if (s === 0 || s == null) return frac(1);
  return PR.percentMultiplier(Math.abs(s), s > 0 ? 'increase' : 'decrease');
}

/** Le multiplicateur d'une chaîne [s1, s2, …] (produit — `chainMultiplier`). */
export function chainK(steps) {
  return PR.chainMultiplier(steps.map((s) => [Math.abs(s), s > 0 ? 'increase' : 'decrease']));
}

/** Le changement global d'un multiplicateur, en pourcentage SIGNÉ exact (−19,5 → frac(-39, 2)). */
export function netPercent(k) {
  const c = PR.percentChange(k);
  if (c.kind === 'none') return frac(0);
  return c.kind === 'increase' ? c.t : sub(frac(0), c.t);
}

/* ── L'état ──────────────────────────────────────────────────────────────────────── */

/**
 * init({ price, steps, theme }) — l'état initial du laboratoire.
 *   mode   'single' (un changement) | 'chain' (plusieurs)
 *   world  'mall' | 'tank' (le thème ; à défaut, déduit de la forme)
 */
export function init({ price, steps, theme } = {}) {
  const target = parseSteps(steps);
  const start = F(price);
  if (cmp(start, frac(0)) <= 0) throw new Error(`percent-tag: une grandeur positive (« ${price} »)`);
  const mode = target.length === 1 ? 'single' : 'chain';
  const world = theme === 'mall' || theme === 'tank' ? theme : mode === 'single' ? 'mall' : 'tank';
  const articles = world === 'mall'
    ? MALL_ARTICLES.map((a, i) => ({ id: a.id, x: i === 0 ? start : F(a.price) }))
    : [{ id: 'tank', x: start }];
  return {
    mode, world, start, target, articles,
    selected: articles[0].id,
    s: 0,               // la poignée t % (le brouillon du pas suivant en mode chaîne)
    additive: null,     // { id, s } : la barre additive affichée (mode single)
    trials: [],         // single : { id, x, s } validés (s ≠ 0)
    additiveTrials: [], // single : { id, x, s }
    bet: null,          // chain : le pari en demi-points
    firstBet: null,
    chain: [],          // chain : les pas validés
    chains: [],         // chain : les chaînes de ≥ 2 pas déjà construites { steps }
    betTrials: [],      // chain : { bet, steps, ok } — un pari confronté à une chaîne complète
    capacity: world === 'tank' ? start : null,
    last: null,         // le dernier verdict { kind, … }
  };
}

const articleOf = (lab, id = lab.selected) => lab.articles.find((a) => a.id === id) ?? lab.articles[0];
const sameSteps = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const clampS = (s) => Math.max(-T_MAX, Math.min(T_MAX, Math.round(s)));

/* ── Mode single : la vitrine ────────────────────────────────────────────────────── */

/** Choisir un article (toucher son étiquette). La poignée garde son t %. */
export function select(lab, id) {
  if (!lab.articles.some((a) => a.id === id)) return lab;
  return { ...lab, selected: id, additive: null, last: { kind: 'select', id } };
}

/** La lecture d'un article sous le changement s : x, k, y = k·x, et l'additif x + s. */
export function reading(lab, s = lab.s, id = lab.selected) {
  const a = articleOf(lab, id);
  const k = multiplier(s);
  return { id: a.id, x: a.x, s, k, y: mul(a.x, k), plus: add(a.x, frac(s)) };
}

/**
 * Valider une valeur de la poignée (mode single) : un ESSAI si s ≠ 0, retenu une fois par
 * (article, s). La barre additive affichée tombe (elle parlait de l'ancien t).
 */
export function setS(lab, s) {
  const v = clampS(s);
  const next = { ...lab, s: v, additive: null };
  if (lab.mode !== 'single' || v === 0) return { ...next, last: { kind: 'zero' } };
  const a = articleOf(lab);
  const seen = lab.trials.some((t) => t.id === a.id && t.s === v);
  return {
    ...next,
    trials: seen ? lab.trials : [...lab.trials, { id: a.id, x: a.x, s: v }],
    last: { kind: 'trial', id: a.id, s: v },
  };
}

/**
 * « جرّب: أضف t » — la barre ADDITIVE x + t, dessinée à côté de la barre multipliée. Elle ne
 * coïncide jamais (t ≠ 0, x ≠ 100) : c'est le refus (MISC-NISBA-JAM).
 */
export function tryAdditive(lab) {
  if (lab.s === 0) return { ...lab, last: { kind: 'needT' } };
  const a = articleOf(lab);
  const seen = lab.additiveTrials.some((t) => t.id === a.id && t.s === lab.s);
  return {
    ...lab,
    additive: { id: a.id, s: lab.s },
    additiveTrials: seen ? lab.additiveTrials : [...lab.additiveTrials, { id: a.id, x: a.x, s: lab.s }],
    last: { kind: 'additive', id: a.id, s: lab.s },
  };
}

/** Le tableau de l'élève : les articles essayés AU t % de la leçon, dans l'ordre des essais. */
export function table(lab, s = lab.target[0]) {
  const rows = [];
  for (const t of lab.trials) {
    if (t.s !== s || rows.some((r) => r.id === t.id)) continue;
    const k = multiplier(s);
    rows.push({ id: t.id, x: t.x, y: mul(t.x, k), ratio: k });
  }
  return rows;
}

/** Le t % de la leçon a été posé sur l'article de la leçon. */
export const targetSet = (lab) => lab.mode === 'single' && lab.trials.some((t) => t.id === lab.articles[0].id && t.s === lab.target[0]);

/* ── Mode chain : le réservoir ───────────────────────────────────────────────────── */

/** Le pari (demi-points), validé. Confronté à la chaîne courante si elle est complète. */
export function setBet(lab, b) {
  const v = Math.max(BET_RANGE.min, Math.min(BET_RANGE.max, Math.round(b)));
  let next = { ...lab, bet: v, firstBet: lab.firstBet ?? v, last: { kind: 'bet', bet: v } };
  if (lab.chain.length >= 2) next = confront(next);
  return next;
}

/** Le brouillon du pas suivant (la poignée t %), sans le valider. */
export const setDraft = (lab, s) => ({ ...lab, s: clampS(s) });

/** Le volume (ou le prix) après la chaîne validée — exact. */
export const current = (lab, steps = lab.chain) => mul(lab.start, chainK(steps));

/** Le volume qu'on aurait en ajoutant le brouillon à la chaîne (aperçu pendant le geste). */
export const preview = (lab, s = lab.s) => mul(current(lab), multiplier(s));

/** Pourquoi un pas ne peut pas être ajouté : null si possible. */
function canCommit(lab, s = lab.s) {
  if (lab.bet == null) return 'betFirst';
  if (s === 0) return 'needT';
  if (lab.chain.length >= CHAIN_MAX) return 'full';
  if (lab.capacity && cmp(preview(lab, s), lab.capacity) > 0) return 'overflow';
  return null;
}

/** Ajouter le brouillon à la chaîne (« أضف هذا التغيّر »). */
export function commitStep(lab) {
  const why = canCommit(lab);
  if (why) return { ...lab, last: { kind: why, s: lab.s } };
  const chain = [...lab.chain, lab.s];
  let next = { ...lab, chain, s: 0, last: { kind: 'step', s: lab.s, steps: chain } };
  if (chain.length >= 2) {
    const seen = lab.chains.some((c) => sameSteps(c.steps, chain));
    next = { ...next, chains: seen ? lab.chains : [...lab.chains, { steps: chain }] };
    next = confront(next);
  }
  return next;
}

/** « سلسلة جديدة » : le réservoir repart du départ ; le pari et la mémoire restent. */
export const newChain = (lab) => ({ ...lab, chain: [], s: 0, last: { kind: 'newChain' } });

/** Le pari (en %, exact) : b demi-points → b/2. */
export const betPercent = (b) => frac(b, 2);

/** Le pari confronté à la chaîne courante : le volume parié et le volume réel. */
export function betVerdict(lab) {
  if (lab.bet == null || lab.chain.length < 2) return null;
  const k = chainK(lab.chain);
  const net = netPercent(k);
  const bet = betPercent(lab.bet);
  const betK = add(frac(1), div(bet, frac(100)));
  return { ok: eq(net, bet), net, bet, k, betK, real: current(lab), betted: mul(lab.start, betK), sum: frac(lab.chain.reduce((t, s) => t + s, 0)) };
}

function confront(lab) {
  const v = betVerdict(lab);
  if (!v) return lab;
  const seen = lab.betTrials.some((t) => t.bet === lab.bet && sameSteps(t.steps, lab.chain));
  return {
    ...lab,
    betTrials: seen ? lab.betTrials : [...lab.betTrials, { bet: lab.bet, steps: lab.chain, ok: v.ok }],
    last: { kind: v.ok ? 'betOk' : 'betKo', bet: lab.bet, steps: lab.chain },
  };
}

/** La chaîne de la leçon a été construite (dans l'ordre du texte). */
export const targetChainDone = (lab) => lab.chains.some((c) => sameSteps(c.steps, lab.target));
/** Le pari JUSTE a été confronté à la chaîne de la leçon. */
export const betMatched = (lab) => lab.betTrials.some((t) => t.ok && sameSteps(t.steps, lab.target));
/** Un pari faux a été confronté à la chaîne de la leçon (la réfutation a eu lieu). */
export const betRefuted = (lab) => lab.betTrials.find((t) => !t.ok && sameSteps(t.steps, lab.target)) ?? null;
/** Le contraste : une chaîne de deux changements opposés (−t puis +t, ou l'inverse). */
export const contrastChain = (lab) => lab.chains.find((c) => c.steps.length === 2 && c.steps[0] === -c.steps[1]) ?? null;

/**
 * « أعِد التجربة » d'une étape (questions pendant le labo) : efface SEULEMENT ce que cette étape avait construit.
 *   set       l'essai du t % de la leçon sur l'article de la leçon ;
 *   table     les essais au t % de la leçon sur les AUTRES articles ;
 *   add       les essais de la barre additive ;
 *   chain     la chaîne courante, la chaîne de la leçon et ses paris confrontés ;
 *   contrast  les chaînes de deux changements opposés (et leurs paris).
 */
export function retryTask(lab, id) {
  const s0 = lab.target[0];
  const base = { ...lab, s: 0, additive: null, last: null };
  if (id === 'set') return { ...base, trials: lab.trials.filter((t) => !(t.id === lab.articles[0].id && t.s === s0)) };
  if (id === 'table') return { ...base, trials: lab.trials.filter((t) => !(t.id !== lab.articles[0].id && t.s === s0)), selected: lab.articles[0].id };
  if (id === 'add') return { ...base, additiveTrials: [] };
  if (id === 'chain') {
    return {
      ...base, chain: [], chains: lab.chains.filter((c) => !sameSteps(c.steps, lab.target)),
      betTrials: lab.betTrials.filter((b) => !sameSteps(b.steps, lab.target)),
    };
  }
  if (id === 'contrast') {
    const opposite = (c) => c.steps.length === 2 && c.steps[0] === -c.steps[1];
    return { ...base, chain: [], chains: lab.chains.filter((c) => !opposite(c)), betTrials: lab.betTrials.filter((b) => !(b.steps.length === 2 && b.steps[0] === -b.steps[1])) };
  }
  return base;
}

/** Le pari a-t-il été confronté à la chaîne de la leçon (juste ou faux) ? */
export const betTriedOnTarget = (lab) => lab.betTrials.some((b) => sameSteps(b.steps, lab.target));

/* ── La découverte ───────────────────────────────────────────────────────────────── */

/**
 * single : le t % de la leçon posé sur son article, un DEUXIÈME article au même t % (le
 * tableau a deux lignes : y / x constant), et la barre additive essayée (le refus).
 * chain  : la chaîne de la leçon, le pari juste confronté à elle, et la chaîne de contraste.
 */
export function discoveryReady(lab) {
  if (lab.mode === 'single') return targetSet(lab) && table(lab).length >= 2 && lab.additiveTrials.length > 0;
  return targetChainDone(lab) && betMatched(lab) && !!contrastChain(lab);
}

/* ── L'écriture (affichage seulement) ────────────────────────────────────────────── */

/** Un nombre exact écrit à la façon du manuel : « 1,05 », « 24,15 », sinon la fraction. */
export function dec(p, max = 6) {
  const d = fracDecimal(F(p), max);
  return d ?? toNumber(F(p)).toFixed(2).replace('.', ',');
}
/** Le même, pour KaTeX : la virgule entre accolades (« 24{,}15 »). */
export function decTex(p, max = 6) {
  const d = fracDecimal(F(p), max);
  return d ? d.replace(',', '{,}') : fracLatex(F(p));
}

/** « +5\% » / « -30\% » (pourcentage signé, entier ou décimal). */
export function pctTex(p) {
  const v = F(p);
  const sign = cmp(v, frac(0)) > 0 ? '+' : cmp(v, frac(0)) < 0 ? '-' : '';
  const abs = cmp(v, frac(0)) < 0 ? sub(frac(0), v) : v;
  return `${sign}${decTex(abs)}\\%`;
}

/** Le multiplicateur écrit avec sa règle : « 1 + \dfrac{5}{100} = 1{,}05 ». */
export function multiplierTex(s) {
  if (s === 0) return '1';
  const t = Math.abs(s);
  return `1 ${s > 0 ? '+' : '-'} \\dfrac{${t}}{100} = ${decTex(multiplier(s))}`;
}

/** La fonction linéaire associée : « x \longmapsto 1{,}05x ». */
export const fnTex = (k) => `x \\longmapsto ${decTex(k)}x`;

/** « 1200 \times 1{,}05 = 1260 ». */
export const productTex = (x, k) => `${decTex(x)} \\times ${decTex(k)} = ${decTex(mul(F(x), F(k)))}`;

/** Les lignes de la chaîne : « 30 \times 0{,}7 = 21 », « 21 \times 1{,}15 = 24{,}15 ». */
export function chainLinesTex(lab, steps = lab.chain) {
  const out = [];
  let v = lab.start;
  for (const s of steps) {
    const k = multiplier(s);
    const w = mul(v, k);
    out.push(`${decTex(v)} \\times ${decTex(k)} = ${decTex(w)}`);
    v = w;
  }
  return out;
}

/** Le produit des multiplicateurs : « 0{,}7 \times 1{,}15 = 0{,}805 ». */
export function chainKTex(steps) {
  if (steps.length === 0) return '1';
  const ks = steps.map((s) => decTex(multiplier(s)));
  return steps.length === 1 ? ks[0] : `${ks.join(' \\times ')} = ${decTex(chainK(steps))}`;
}

/* ── La géométrie des barres (pure, testée) ──────────────────────────────────────── */

/**
 * L'échelle d'une piste de barres : la grandeur `top` occupe toute la piste moins les marges.
 * single : top = 1,5·x (la poignée va jusqu'à +50 %) ; chain : la capacité (réservoir) ou
 * la plus grande valeur atteignable à l'écran.
 */
export function barScale({ width, top, edge = 14 }) {
  const usable = Math.max(40, width - 2 * edge);
  const t = toNumber(F(top));
  return { edge, usable, px: (v) => edge + (toNumber(F(v)) / t) * usable, value: (p) => ((p - edge) / usable) * t };
}

/** La position (px) sur la piste → le t % signé de la poignée, pour l'article x. */
export function sFromPosition(px, scale, x) {
  const v = scale.value(px);
  return clampS((v / toNumber(F(x)) - 1) * 100);
}

/** Les graduations en % d'une piste : toutes les 5 % (étiquetées toutes les 10 %, ou 25 % si étroit). */
export function percentTicks(x, scale, narrow = false) {
  const out = [];
  for (let s = -T_MAX; s <= T_MAX; s += 5) {
    const label = narrow ? s % 25 === 0 : s % 10 === 0;
    out.push({ s, at: scale.px(mul(F(x), multiplier(s))), label });
  }
  return out;
}

