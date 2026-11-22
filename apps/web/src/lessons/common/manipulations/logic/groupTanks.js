/**
 * group-tanks — la logique PURE des réservoirs de groupes (unité 8 « الإحصاء », درس
 * « ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات »). Aucun React ici, aucune arithmétique propre :
 * la moyenne de groupes réunis vient de `statistics.combineGroups` (packages/core).
 *
 * Le modèle physique : un groupe est un réservoir de LARGEUR n (son effectif) rempli jusqu'au NIVEAU m
 * (sa moyenne) ; sa surface d'eau n·m est le total de ses points. Le réservoir de la classe a pour
 * largeur N = Σ n. La vanne ouverte, l'eau se répartit (vases communicants) : le niveau commun est
 * Σ n·m ÷ N — la moyenne pondérée, exactement. Le total d'eau Σ n·m est l'INVARIANT.
 *
 *   const s = init({ groups: '4:12|6:7' });           // une classe : 4 amis (12) + 6 amis (7)
 *   level(s, 0)            → 9      (pas 9,5 : la moyenne des moyennes)
 *   setBet(s, 0, 19)       → pari 9,5 (pas de ½)
 *   openValve(s, 0).last   → { kind: 'meanOfMeans', … }   le pari « moyenne des moyennes » refusé par l'eau
 *
 * Le pari est un ENTIER k sur une grille de pas `step` (½ si tous les niveaux de départ tombent sur
 * des demis, sinon 1/10) : il est juste quand k est la graduation la plus proche du niveau exact.
 */
import * as ST from '@smarter-academy/core/arithmetic/statistics.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const { frac, add, mul, div, cmp, eq, toNumber, parseNumber, isInteger } = LIN;

/** « 15:10|18:13|14:12,5|19:11 » → [{ n, m }] (n entier ≥ 1, m exact ≥ 0). */
function parseGroups(src) {
  const parts = String(src ?? '').split('|').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) throw new Error(`group-tanks: au moins deux groupes (« ${src} »)`);
  return parts.map((p) => {
    const [ns, ms] = p.split(':');
    const n = Number(ns);
    const m = parseNumber(ms);
    if (!Number.isInteger(n) || n < 1) throw new Error(`group-tanks: effectif « ${ns} »`);
    if (!m || cmp(m, frac(0)) < 0) throw new Error(`group-tanks: moyenne « ${ms} »`);
    return { n, m };
  });
}

/** « 2|2 » → [[0, 1], [2, 3]] ; absent → une seule classe avec tous les groupes. */
function parseClasses(src, count) {
  if (!src) return [Array.from({ length: count }, (_, i) => i)];
  const sizes = String(src).split('|').map(Number);
  if (sizes.some((k) => !Number.isInteger(k) || k < 2) || sizes.reduce((a, b) => a + b, 0) !== count) {
    throw new Error(`group-tanks: classes « ${src} » pour ${count} groupes`);
  }
  let i = 0;
  return sizes.map((k) => Array.from({ length: k }, () => i++));
}

/** Le niveau commun d'une liste de groupes : statistics.combineGroups (Σ n·m ÷ N). */
export const levelOf = (groups) => ST.combineGroups(groups.map((g) => ({ n: g.n, mean: g.m })));
/** La moyenne des moyennes — ce que l'eau REFUSE (MISC-IHSA-MUTAWASSIT-MUTAWASSITAYN). */
export const meanOfMeansOf = (groups) => div(groups.reduce((s, g) => add(s, g.m), frac(0)), groups.length);
/** Le total d'eau Σ n·m (les points de la classe) et l'effectif N. */
export const waterOf = (groups) => groups.reduce((s, g) => add(s, mul(g.m, g.n)), frac(0));
export const countOf = (groups) => groups.reduce((s, g) => s + g.n, 0);

const twice = (p) => isInteger(mul(p, 2));

export function init({ groups, classes } = {}) {
  const gs = parseGroups(groups).map((g, i) => ({ id: i, n: g.n, n0: g.n, m: g.m }));
  const cls = parseClasses(classes, gs.length).map((members, ci) => ({ id: ci, members, bet: null, opened: false }));
  const levels0 = cls.map((c) => levelOf(c.members.map((i) => gs[i])));
  // la grille du pari : demis si tous les niveaux exacts y tombent (مبتدئ : 9), sinon dixièmes (متقدم : 384/33)
  const step = levels0.every(twice) ? frac(1, 2) : frac(1, 10);
  const maxM = Math.max(...gs.map((g) => toNumber(g.m)));
  const top = maxM <= 20 ? 20 : Math.ceil((maxM * 1.1) / 5) * 5;
  return Object.freeze({
    groups: gs, classes: cls, step, top,
    kMax: Math.round(top / toNumber(step)),
    trials: [], sizeTrials: [], last: null,
  });
}

const classGroups = (s, ci) => s.classes[ci].members.map((i) => s.groups[i]);
export const level = (s, ci) => levelOf(classGroups(s, ci));
export const meanOfMeans = (s, ci) => meanOfMeansOf(classGroups(s, ci));
export const water = (s, ci) => waterOf(classGroups(s, ci));
export const count = (s, ci) => countOf(classGroups(s, ci));
/** Le pari k (entier) en nombre exact. */
export const betValue = (s, k) => mul(s.step, k);
/** La graduation de la grille la plus proche d'une valeur exacte (½ arrondi vers le haut). */
const nearestK = (s, v) => Math.floor(toNumber(div(v, s.step)) + 0.5 + 1e-9);
export const classOfGroup = (s, gi) => s.classes.findIndex((c) => c.members.includes(gi));

const put = (s, patch) => Object.freeze({ ...s, ...patch });
const withClass = (s, ci, patch) => s.classes.map((c, i) => (i === ci ? { ...c, ...patch } : c));

/** Poser le pari (un repère sur le réservoir vide). Refusé quand l'eau est déjà dans la classe. */
export function setBet(s, ci, k) {
  if (s.classes[ci].opened) return put(s, { last: { kind: 'betLocked', ci } });
  const kk = Math.max(0, Math.min(s.kMax, Math.round(k)));
  return put(s, { classes: withClass(s, ci, { bet: kk }), last: { kind: 'bet', ci, k: kk } });
}

/** Le verdict d'un pari k pour la classe ci (avec les effectifs courants). */
export function judgeBet(s, ci, k) {
  const lv = level(s, ci);
  const kTrue = nearestK(s, lv);
  const mm = meanOfMeans(s, ci);
  const kMm = nearestK(s, mm);
  if (k === kTrue) return { kind: 'ok', k, kTrue, level: lv, mm };
  if (k === kMm && kMm !== kTrue) return { kind: 'meanOfMeans', k, kTrue, level: lv, mm };
  return { kind: k > kTrue ? 'high' : 'low', k, kTrue, level: lv, mm };
}

/** Ouvrir la vanne : refusé sans pari ; sinon l'eau descend et le pari est jugé. */
export function openValve(s, ci) {
  const c = s.classes[ci];
  if (c.bet == null) return put(s, { last: { kind: 'betFirst', ci } });
  if (c.opened) return put(s, { last: { kind: 'alreadyOpen', ci } });
  const v = judgeBet(s, ci, c.bet);
  const trial = { ci, bet: c.bet, kind: v.kind, ok: v.kind === 'ok', level: v.level, mm: v.mm, ns: classGroups(s, ci).map((g) => g.n) };
  return put(s, { classes: withClass(s, ci, { opened: true }), trials: [...s.trials, trial], last: { kind: 'opened', ci, verdict: v.kind } });
}

/** Remettre l'eau dans les réservoirs des groupes (pour un nouveau pari) — les effectifs restent. */
export function refill(s, ci) {
  return put(s, { classes: withClass(s, ci, { opened: false, bet: null }), last: { kind: 'refilled', ci } });
}

export const N_MIN = 1;
/** L'effectif maximal d'un groupe : le double de l'effectif de départ (au moins 10). */
export const nMax = (g) => Math.max(10, 2 * g.n0);

/** Changer l'effectif d'un groupe — seulement quand l'eau est dans la classe (le niveau BOUGE alors). */
export function setSize(s, gi, n) {
  const ci = classOfGroup(s, gi);
  if (!s.classes[ci].opened) return put(s, { last: { kind: 'sizeFirst', ci, gi } });
  const g = s.groups[gi];
  const nn = Math.max(N_MIN, Math.min(nMax(g), Math.round(n)));
  if (nn === g.n) return s;
  const groups = s.groups.map((h) => (h.id === gi ? { ...h, n: nn } : h));
  const next = put(s, { groups });
  const lv = level(next, ci);
  const trial = { ci, gi, n: nn, level: lv, ns: classGroups(next, ci).map((h) => h.n), equal: new Set(classGroups(next, ci).map((h) => h.n)).size === 1 };
  return put(next, { sizeTrials: [...s.sizeTrials, trial], last: { kind: 'size', ci, gi, n: nn } });
}

/** Chaque classe a-t-elle été versée au moins une fois ? */
const allOpenedOnce = (s) => s.classes.every((c) => s.trials.some((t) => t.ci === c.id));

/**
 * La découverte s'ouvre — une classe (مبتدئ) : la vanne ouverte ET un effectif changé (le niveau qui
 * bouge avec les effectifs est le contraste) ; plusieurs classes (متقدم) : chaque classe versée.
 */
export function discoveryReady(s) {
  if (s.classes.length === 1) return s.trials.length > 0 && s.sizeTrials.length > 0;
  return allOpenedOnce(s);
}

/** Les classes ont-elles toutes le MÊME niveau (le contraste du تحدّ) ? */
export const sameLevels = (s) => s.classes.every((c) => eq(level(s, c.id), level(s, 0)));

/* ── Écriture (LaTeX, virgule décimale) ───────────────────────────────── */

export const dec = (p) => ST.statText(p, 3);
export const decTex = (p) => ST.statLatex(p, 3);
/** « 384/33 ≈ 11,64 » : la fraction NON réduite Σ ÷ N quand le décimal n'est pas fini. */
export function levelTex(s, ci) {
  const W = water(s, ci);
  const N = count(s, ci);
  const lv = div(W, N);
  const d = LIN.fracDecimal(lv, 3);
  if (d != null) return d.replace(',', '{,}');
  return `\\dfrac{${decTex(W)}}{${N}} \\approx ${ST.approx(lv, 2).replace(',', '{,}')}`;
}
/** « 15 × 10 + 18 × 13 = 384 » puis « ÷ 33 ». */
export function sumTex(s, ci) {
  const gs = classGroups(s, ci);
  return `${gs.map((g) => `${g.n} \\times ${decTex(g.m)}`).join(' + ')} = ${decTex(water(s, ci))}`;
}
export function formulaTex(s, ci) {
  const gs = classGroups(s, ci);
  return `\\dfrac{${gs.map((g) => `${g.n} \\times ${decTex(g.m)}`).join(' + ')}}{${gs.map((g) => g.n).join(' + ')}} = ${levelTex(s, ci)}`;
}
export const betTex = (s, k) => decTex(betValue(s, k));

/* ── Géométrie (px), pure et testée ───────────────────────────────────── */

/**
 * Une colonne de classe : les réservoirs des groupes côte à côte en haut, le réservoir de la classe en
 * bas, à la MÊME échelle (px par élève, px par point) : la surface d'eau d'un groupe (n·m) et celle de
 * la classe (N·niveau) sont donc dessinées égales — l'aire se conserve à l'œil.
 */
export function columnGeometry(s, ci, { width, tankH, gap = 6 }) {
  const gs = classGroups(s, ci);
  const N = countOf(gs);
  const ref = Math.max(N, countOf(gs.map((g) => ({ n: g.n0 }))));
  const unit = Math.max(1, (width - gap * (gs.length - 1)) / ref);
  const yOf = (v) => tankH - (toNumber(v) / s.top) * tankH;
  let x = 0;
  const totalW = N * unit + gap * (gs.length - 1);
  const x0 = (width - totalW) / 2;
  const tanks = gs.map((g) => {
    const w = g.n * unit;
    const t = { id: g.id, x: x0 + x, w, y: yOf(g.m), h: tankH - yOf(g.m) };
    x += w + gap;
    return t;
  });
  const classW = N * unit;
  return { unit, tanks, cls: { x: (width - classW) / 2, w: classW }, yOf, area: tanks.reduce((a, t) => a + t.w * t.h, 0) };
}

/** Les graduations verticales (points sur 20) : 0, 5, 10, 15, 20 — et la grille du pari. */
export const gradTicks = (s) => Array.from({ length: s.top / 5 + 1 }, (_, i) => i * 5);

/** La valeur sous le pointeur (y relatif au réservoir) → un pari k. */
export function kFromY(s, y, tankH) {
  const v = ((tankH - y) / tankH) * s.top;
  return Math.max(0, Math.min(s.kMax, Math.round(v / toNumber(s.step))));
}

/** Ce que la leçon reçoit à chaque essai : les paris et les effectifs essayés, écrits. */
export function evidenceOf(s) {
  return {
    bets: s.trials.map((t) => ({ ci: t.ci, bet: dec(betValue(s, t.bet)), ok: t.ok, kind: t.kind, level: dec(t.level), approx: ST.approx(t.level, 2), mm: dec(t.mm), ns: t.ns })),
    sizes: s.sizeTrials.map((t) => ({ ci: t.ci, gi: t.gi, n: t.n, ns: t.ns, level: ST.approx(t.level, 2), equal: t.equal })),
    sameLevels: s.classes.length > 1 ? sameLevels(s) : null,
  };
}

