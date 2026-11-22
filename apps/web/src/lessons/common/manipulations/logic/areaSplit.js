/**
 * area-split — la logique PURE de « أرض الحديقة » (3AM, unité 4 « الحساب الحرفي », درس « نشر عبارات جبرية », 2026-10-21).
 * Aucun React ici. Toute la vérité est EXACTE (`@smarter-academy/core/arithmetic/expansion.js`, importé PAR CHEMIN).
 *
 * L'idée. L'aire d'un rectangle se compte DEUX fois : le produit de ses deux côtés, et la somme des aires de ses parties. Deux mondes :
 *   plot    un terrain du jardin de l'école dont les côtés sont m·x + n. La main fait glisser la COUPURE (poignée sur un bord) à l'endroit
 *           où l'écriture du côté change de terme (`cutTo`) ; puis elle DÉCIDE ce que chaque parcelle compte (`decide`) : ajoutée, ou
 *           ôtée (l'allée dallée) ; la parcelle du COIN, ôtée deux fois, se rend. Le juge est l'aire COMPTÉE du terrain au x que la
 *           main règle aussi ; مبتدئ : la ligne réduite s'écrit seule ; متقدم : la main écrit le coefficient de chaque puissance et « تحقّق ».
 *   arrows  l'expression est écrite ; la main TRACE la flèche de chaque terme du 1er facteur vers chaque terme de l'autre parenthèse
 *           (`link`), décide le SIGNE de chaque produit partiel (`setProductSign`, jugé par sa valeur à x) ; puis les termes semblables
 *           se réunissent (coefficients écrits + « تحقّق »).
 * INVARIANT : la valeur de ce que la main a écrit (parcelles / produits décidés) rejoint celle de l'expression écrite, à tout x.
 *
 * Les événements (`events`, dans l'ordre ; la leçon les lit par `state.report`) — formes fixées par le brief :
 *   { kind: 'cut', world: 'plot', task, side: 'h'|'w', at, ok } · { kind: 'refused', world: 'plot', task, reason: 'cut', side, at, a, b }
 *   { kind: 'patch', world: 'plot', task, patch, sign, ok, corner } · { kind: 'refused', world: 'plot', task, reason: 'sign', patch, corner, x, counted, written }
 *   { kind: 'arrow', world: 'arrows', task, from, to, ok } · { kind: 'product', world: 'arrows', task, from, to, sign, ok }
 *   { kind: 'refused', world: 'arrows', task, reason: 'arrow', from, to, why } · { kind: 'refused', world: 'arrows', task, reason: 'sign', from, to, x, truth, shown }
 *   { kind: 'coef', world, task, power, ok } · { kind: 'refused', world, task, reason: 'coef', power, x, counted, written }
 *   { kind: 'x', x } · { kind: 'solved', world, task, expr, expanded, result } (LaTeX) · { kind: 'custom', world }
 */
import * as E from '@smarter-academy/core/arithmetic/expansion.js';

export const X_MAX = E.X_MAX;
const X_DEFAULT = E.X_DEFAULT;
const ARROWS_X_MIN = 2;
const ARROWS_X_DEFAULT = 5;
export const COEF_MIN = -99;
export const COEF_MAX = 99;
/** Le panneau « جرّب أعدادك » : les bornes des steppers. */
export const FREE = Object.freeze({ plot: { h: { m: [0, 2], n: [-6, 6] }, w: { m: [1, 2], n: [-6, 6] } }, arrows: { c: [-6, 6] } });

const t = (c, p = 0) => ({ c, p });
const sd = (m, n) => ({ m, n });
/** Les tâches par défaut — celles du brief, exactes. */
export const PLOT_TASKS = Object.freeze({
  beginner: Object.freeze([
    { id: 'p1', h: sd(0, 3), w: sd(1, 4) },
    { id: 'p2', h: sd(0, 2), w: sd(1, -3) },
  ]),
  advanced: Object.freeze([
    { id: 'p3', h: sd(1, 3), w: sd(1, 2) },
    { id: 'p4', h: sd(1, -2), w: sd(1, -3) },
  ]),
});
export const ARROW_TASKS = Object.freeze([
  { id: 'a1', expr: { products: [E.product(1, [t(5)], [t(1, 1), t(2)])] } },
  { id: 'a2', expr: { products: [E.product(1, [t(-3)], [t(1, 1), t(-4)])] } },
  { id: 'a3', expr: { products: [E.product(1, [t(2, 1), t(1)], [t(1, 1), t(-3)])] } },
  { id: 'a4', expr: { products: [E.product(1, [t(3)], [t(2), t(-1, 1)]), E.product(-1, [t(4)], [t(1, 1), t(-1)])] } },
]);

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const cloneExpr = (e) => ({ products: e.products.map((pr) => E.product(pr.sign, pr.f1.map((q) => ({ ...q })), pr.f2.map((q) => ({ ...q })))) });
const cloneTask = (tk, world, k) => (world === 'arrows'
  ? { id: tk.id ?? `task-${k + 1}`, expr: cloneExpr(tk.expr) }
  : { id: tk.id ?? `task-${k + 1}`, h: { ...tk.h }, w: { ...tk.w } });

/** Les tâches demandées (celles de la leçon, ou celles du monde / du niveau). */
export function tasksFor(world, tasks, level = 'beginner') {
  const w = world === 'arrows' ? 'arrows' : 'plot';
  if (Array.isArray(tasks) && tasks.length) return tasks.map((tk, k) => cloneTask(tk, w, k));
  const src = w === 'arrows' ? ARROW_TASKS : PLOT_TASKS[level === 'advanced' ? 'advanced' : 'beginner'];
  return src.map((tk, k) => cloneTask(tk, w, k));
}

/* ═════════════ Construction ═════════════ */

export const xMinOf = (s) => (s.world === 'arrows' ? ARROWS_X_MIN : E.minX(s.h, s.w));

/** La coupure de départ : jamais la bonne (ni son écriture dans l'autre ordre), près du milieu du côté. */
export function defaultCut(side, x) {
  const len = E.drawnLength(side, x);
  const bad = [E.cutRight(side, x), Math.abs(side.n)];
  const mid = Math.floor(len / 2);
  for (let d = 0; d < len; d += 1) {
    for (const c of [mid + d, mid - d]) if (c >= 1 && c <= len - 1 && !bad.includes(c)) return c;
  }
  return 1;
}

/**
 * L'état initial. `scaffold` (plot) : les aires des parcelles sont écrites sur les cartes et la ligne réduite s'écrit seule (مبتدئ) ;
 * sans lui (متقدم), la main écrit le coefficient de chaque puissance puis « تحقّق ». Le monde `arrows` écrit toujours les coefficients.
 */
export function init({ world = 'plot', tasks, scaffold = true, level } = {}) {
  const w = world === 'arrows' ? 'arrows' : 'plot';
  const list = tasksFor(w, tasks, level ?? (scaffold ? 'beginner' : 'advanced'));
  const base = {
    world: w, scaffold: w === 'arrows' ? false : !!scaffold, tasks: list, ti: 0, done: list.map(() => false),
    x: w === 'arrows' ? ARROWS_X_DEFAULT : X_DEFAULT, xMoved: false, decisions: 0, refusals: [], solvedLog: [], last: null, events: [],
    free: freeDefaults(w),
  };
  return load(base, 0);
}

function freeDefaults(world) {
  return world === 'arrows' ? { f1: { a: 2, b: 3 }, f2: { a: 1, b: -2 } } : { h: { m: 1, n: 3 }, w: { m: 1, n: 2 } };
}

const taskFresh = (s, tk) => {
  if (s.world === 'arrows') {
    const expr = cloneExpr(tk.expr);
    return { expr, arrows: E.arrowsOf(expr), linked: {} };
  }
  const h = { ...tk.h }; const w = { ...tk.w };
  const x = clamp(s.x, E.minX(h, w), X_MAX);
  const cutAt = {};
  for (const k of ['h', 'w']) if (E.isCuttable(k === 'h' ? h : w)) cutAt[k] = defaultCut(k === 'h' ? h : w, x);
  return { h, w, patches: E.patchesOf(h, w), cuts: {}, cutAt, signs: {}, x };
};

function load(s, ti) {
  const tk = s.tasks[ti];
  const f = tk ? taskFresh(s, tk) : {};
  return { ...s, ...f, ti, custom: false, coefs: {}, coefTouched: {}, checked: {}, solvedNow: false, last: null, held: null };
}

/* ═════════════ Lectures ═════════════ */

export const taskOf = (s) => (s.custom ? 'custom' : s.tasks[s.ti]?.id ?? '');
export const allDone = (s) => s.done.every(Boolean);
export const sideOf = (s, k) => (k === 'h' ? s.h : s.w);
const lengthOf = (s, k) => E.drawnLength(sideOf(s, k), s.x);
export const cuttable = (s) => ['w', 'h'].filter((k) => E.isCuttable(sideOf(s, k)));
export const cutsPending = (s) => cuttable(s).filter((k) => !s.cuts[k]?.ok);
export const cutDone = (s) => s.world === 'plot' && cutsPending(s).length === 0;
export const patchOf = (s, id) => s.patches.find((p) => p.id === id) ?? null;
export const decided = (s) => s.patches.filter((p) => s.signs[p.id]);
export const undecided = (s) => s.patches.filter((p) => !s.signs[p.id]);
const allDecided = (s) => s.world === 'plot' && cutDone(s) && undecided(s).length === 0;
/** La phase du terrain : cut → sign → reduce (متقدم) → done. */
export function phaseOf(s) {
  if (s.solvedNow) return 'done';
  if (s.world === 'arrows') {
    if (s.arrows.some((a) => !s.linked[a.id] || s.linked[a.id].sign == null)) return 'arrow';
    return 'reduce';
  }
  if (!cutDone(s)) return 'cut';
  if (!allDecided(s)) return 'sign';
  return 'reduce';
}
const linkedCount = (s) => s.arrows.filter((a) => s.linked[a.id]).length;
export const signedArrows = (s) => s.arrows.filter((a) => s.linked[a.id]?.sign != null);

/** L'expression écrite : la valeur à x, l'aire comptée du terrain (plot) / la valeur de l'expression (arrows). */
export const writtenValue = (s, x = s.x) => (s.world === 'arrows' ? E.exprValue(s.expr, x) : E.plotArea(s.h, s.w, x));
/** Ce que la main a écrit jusqu'ici : la somme des parcelles décidées / des produits partiels signés, à x. */
export function partsValue(s, x = s.x) {
  if (s.world === 'arrows') return signedArrows(s).reduce((a, q) => a + s.linked[q.id].sign * Math.abs(E.arrowValue(q, x)), 0);
  return E.decidedSum(s.patches, x, s.signs);
}
export const bothEqual = (s) => (s.world === 'arrows' ? signedArrows(s).length === s.arrows.length : allDecided(s));

/** Les termes de l'expansion avant réduction, et la forme réduite. */
export const expansionTerms = (s) => (s.world === 'arrows' ? E.arrowTerms(s.expr) : E.expansionTerms(s.patches));
const reducedTerms = (s) => (s.world === 'arrows' ? E.reducedExprTerms(s.expr) : E.reducedTerms(s.patches));
export const powersOf = (s) => E.usedPowers(expansionTerms(s));
export const exprTex = (s) => (s.world === 'arrows' ? E.exprTex(s.expr) : `${E.sideFactorTex(s.h)}(${E.sideTex(s.w)})`);
const expandedTex = (s) => E.termsTex(expansionTerms(s));
export const resultTex = (s) => E.termsTex(reducedTerms(s));
/** Combien de termes l'expansion écrit déjà (la ligne qui grandit) : les parcelles décidées / les produits signés. */
export function writtenTerms(s) {
  if (s.world === 'arrows') return signedArrows(s).map((a) => a.term);
  return decided(s).map((p) => p.term);
}

/* ═════════════ Gestes ═════════════ */

const push = (s, ev) => ({ ...s, events: [...s.events, ev] });
const solvedEvent = (s) => ({ kind: 'solved', world: s.world, task: taskOf(s), expr: exprTex(s), expanded: expandedTex(s), result: resultTex(s) });

function markSolved(s) {
  let n = { ...s, solvedNow: true, last: { event: 'solved' } };
  n = push(n, solvedEvent(n));
  if (!n.custom) {
    const done = n.done.slice(); done[n.ti] = true;
    n = { ...n, done, solvedLog: [...n.solvedLog, snapshot(n)] };
  }
  return n;
}
/** Ce que la formule garde d'une tâche résolue. */
const snapshot = (s) => (s.world === 'arrows'
  ? { task: taskOf(s), expr: cloneExpr(s.expr), tex: E.exprTex(s.expr), expanded: expandedTex(s), result: resultTex(s) }
  : { task: taskOf(s), h: { ...s.h }, w: { ...s.w }, tex: exprTex(s), expanded: expandedTex(s), result: resultTex(s), patches: s.patches.map((p) => ({ ...p })) });

/** La main règle x : le terrain se redessine, les deux valeurs suivent ensemble. */
export function setX(s, x) {
  const lo = xMinOf(s);
  const v = Number.isFinite(Number(x)) ? clamp(Math.round(Number(x)), lo, X_MAX) : s.x;
  if (v === s.x) return s;
  let n = { ...s, x: v, xMoved: true };
  if (s.world === 'plot') {
    const cutAt = { ...n.cutAt };
    for (const k of Object.keys(cutAt)) cutAt[k] = clamp(cutAt[k], 1, Math.max(1, E.drawnLength(sideOf(n, k), v) - 1));
    n = { ...n, cutAt };
  }
  return push(n, { kind: 'x', x: v });
}

/* ── plot : la coupure ── */

/** Déplace la poignée (aperçu : clavier ou glissement) SANS la juger. */
export function moveCut(s, k, at) {
  if (s.world !== 'plot' || !E.isCuttable(sideOf(s, k)) || s.cuts[k]?.ok || s.solvedNow) return s;
  const a = clamp(Math.round(at), 1, lengthOf(s, k) - 1);
  return a === s.cutAt[k] ? s : { ...s, cutAt: { ...s.cutAt, [k]: a } };
}

export function canCut(s, k) {
  return s.world === 'plot' && !s.solvedNow && E.isCuttable(sideOf(s, k)) && !s.cuts[k]?.ok;
}

/**
 * Le relâchement de la poignée `k` ('h' | 'w') en `at` (unités entières depuis le bord d'origine) : un essai. Juste → la coupure se fige
 * (elle suivra x) ; faux → REFUS `cut` avec les deux longueurs numériques que la coupure fait, la poignée revient.
 */
export function cutTo(s, k, at) {
  if (!canCut(s, k)) return s;
  const side = sideOf(s, k);
  const len = lengthOf(s, k);
  const a = clamp(Math.round(at), 1, len - 1);
  const j = E.judgeCut(side, s.x, a);
  const ev = { kind: 'cut', world: 'plot', task: taskOf(s), side: k, at: a, ok: j.ok };
  let n = push(s, ev);
  if (j.ok) {
    return { ...n, cuts: { ...n.cuts, [k]: { ok: true, at: j.right, swapped: j.swapped } }, cutAt: { ...n.cutAt, [k]: j.right }, last: { event: 'cut', side: k, at: j.right, swapped: j.swapped, ok: true } };
  }
  const [la, lb] = E.cutLengths(len, a);
  const ref = { kind: 'refused', world: 'plot', task: taskOf(s), reason: 'cut', side: k, at: a, a: la, b: lb };
  n = push(n, ref);
  return { ...n, refusals: [...n.refusals, ref], last: { event: 'refused', reason: 'cut', side: k, at: a, a: la, b: lb } };
}

/* ── plot : le signe de chaque parcelle ── */

export const canDecide = (s, id) => s.world === 'plot' && !s.solvedNow && cutDone(s) && !!patchOf(s, id) && !s.signs[id];

/**
 * La main décide ce que la parcelle `id` compte : `sign` +1 (تُضاف) ou −1 (تُطرح). Le juge : l'aire comptée du terrain contre la
 * somme des parcelles avec ce choix. Faux → REFUS `sign` avec les deux aires ; juste → la parcelle est figée.
 */
export function decide(s, id, sign) {
  if (!canDecide(s, id)) return s;
  const p = patchOf(s, id);
  const sg = sign < 0 ? -1 : 1;
  const j = E.signJudge(s.h, s.w, s.x, s.patches, s.signs, id, sg);
  let n = push(s, { kind: 'patch', world: 'plot', task: taskOf(s), patch: id, sign: sg, ok: j.ok, corner: p.corner });
  if (!j.ok) {
    const ref = { kind: 'refused', world: 'plot', task: taskOf(s), reason: 'sign', patch: id, corner: p.corner, x: s.x, counted: j.counted, written: j.written };
    n = push(n, ref);
    return { ...n, refusals: [...n.refusals, ref], last: { event: 'refused', reason: 'sign', patch: id, sign: sg, corner: p.corner, x: s.x, counted: j.counted, written: j.written } };
  }
  n = { ...n, signs: { ...n.signs, [id]: sg }, decisions: n.decisions + 1, last: { event: 'patch', patch: id, sign: sg, corner: p.corner } };
  if (n.scaffold && allDecided(n)) n = markSolved(n);
  return n;
}

/* ── arrows : les flèches et les signes ── */

const arrowAt = (s, oi, tj) => s.arrows.find((a) => a.oi === oi && a.tj === tj) ?? null;
/** Les puces de la ligne : les origines (1er facteur) et les cibles (2e facteur), numérotées sur toute la ligne. */
export function chipsOf(s) {
  const origins = []; const targets = [];
  s.expr.products.forEach((pr, k) => {
    pr.f1.forEach((term, i) => origins.push({ oi: origins.length, k, i, term }));
    pr.f2.forEach((term, j) => targets.push({ tj: targets.length, k, j, term }));
  });
  return { origins, targets };
}
const originProduct = (s, oi) => chipsOf(s).origins[oi]?.k ?? -1;
const targetProduct = (s, tj) => chipsOf(s).targets[tj]?.k ?? -1;
export const targetsLeft = (s, oi) => {
  const { targets } = chipsOf(s);
  const k = originProduct(s, oi);
  return targets.filter((q) => q.k === k && !s.linked[`${oi}>${q.tj}`]);
};
const canLink = (s) => s.world === 'arrows' && !s.solvedNow;

/**
 * La main relie l'origine `oi` à la cible `tj` (un terme de l'AUTRE parenthèse du même produit). Une flèche valide fait apparaître la
 * carte du produit partiel (signe à décider) ; une flèche qui retombe dans sa propre parenthèse (`own`), dans un autre produit
 * (`other`) ou sur un terme déjà relié depuis la même origine (`twice`) est refusée (`arrow`).
 */
export function link(s, oi, tj) {
  if (!canLink(s)) return s;
  const a = arrowAt(s, oi, tj);
  if (a && !s.linked[a.id]) {
    const n = push(s, { kind: 'arrow', world: 'arrows', task: taskOf(s), from: oi, to: tj, ok: true });
    return { ...n, linked: { ...n.linked, [a.id]: { sign: null } }, last: { event: 'arrow', id: a.id, from: oi, to: tj } };
  }
  const why = a ? 'twice' : originProduct(s, oi) === targetProduct(s, tj) ? 'own' : 'other';
  return refuseArrow(s, oi, tj, why);
}
/** Relâcher sur une autre puce du 1er facteur : retomber dans sa PROPRE parenthèse (ou dans une autre). */
export function linkOnOrigin(s, oi, oj) {
  if (!canLink(s) || oi === oj) return s;
  return refuseArrow(s, oi, oj, originProduct(s, oi) === originProduct(s, oj) ? 'own' : 'other');
}
function refuseArrow(s, from, to, why) {
  let n = push(s, { kind: 'arrow', world: 'arrows', task: taskOf(s), from, to, ok: false });
  const ref = { kind: 'refused', world: 'arrows', task: taskOf(s), reason: 'arrow', from, to, why };
  n = push(n, ref);
  return { ...n, refusals: [...n.refusals, ref], last: { event: 'refused', reason: 'arrow', from, to, why } };
}

export const canSignProduct = (s, id) => s.world === 'arrows' && !s.solvedNow && !!s.linked[id] && s.linked[id].sign == null;
/** Le signe du produit partiel `id` : jugé par sa VALEUR à x (le produit des deux termes, avec le signe du produit). */
export function setProductSign(s, id, sign) {
  if (!canSignProduct(s, id)) return s;
  const a = s.arrows.find((q) => q.id === id);
  const sg = sign < 0 ? -1 : 1;
  const j = E.arrowJudge(a, sg, s.x);
  let n = push(s, { kind: 'product', world: 'arrows', task: taskOf(s), from: a.oi, to: a.tj, sign: sg, ok: j.ok });
  if (!j.ok) {
    const ref = { kind: 'refused', world: 'arrows', task: taskOf(s), reason: 'sign', from: a.oi, to: a.tj, x: s.x, truth: j.truth, shown: j.shown, id };
    n = push(n, ref);
    return { ...n, refusals: [...n.refusals, ref], last: { event: 'refused', reason: 'sign', id, sign: sg, x: s.x, truth: j.truth, shown: j.shown } };
  }
  n = { ...n, linked: { ...n.linked, [id]: { sign: sg } }, decisions: n.decisions + 1, last: { event: 'product', id, sign: sg } };
  return n;
}

/* ── les coefficients de la forme réduite ── */

/** La valeur par défaut d'un réglage : jamais la réponse (MANIPULATION_CONTRACT §6bis « default parameters »). */
function defaultCoef(s, p) {
  const terms = expansionTerms(s).filter((q) => q.p === p);
  const answer = E.coefOf(expansionTerms(s), p);
  const cands = [terms[0]?.c ?? 1, terms.reduce((a, q) => a + Math.abs(q.c), 0), answer + 1, answer - 1];
  return cands.find((v) => v !== answer);
}
export const coefOf = (s, p) => s.coefs[p] ?? defaultCoef(s, p);
export function setCoef(s, p, v) {
  if (phaseOf(s) !== 'reduce' || s.scaffold) return s;
  const val = clamp(Math.round(v), COEF_MIN, COEF_MAX);
  const { [p]: _c, ...checked } = s.checked;
  return { ...s, coefs: { ...s.coefs, [p]: val }, coefTouched: { ...s.coefTouched, [p]: true }, checked };
}
export const canCheck = (s) => !s.scaffold && !s.solvedNow && phaseOf(s) === 'reduce';

/** Le x qui parle dans le refus : celui de la main, ou le premier où les coefficients écrits donnent une AUTRE valeur que le résultat juste. */
function coefWitness(s, terms, typed) {
  const lo = xMinOf(s);
  const differs = (x) => E.usedPowers(terms).reduce((a, p) => a + ((typed[p] ?? 0) - E.coefOf(terms, p)) * x ** p, 0) !== 0;
  if (differs(s.x)) return s.x;
  for (let d = 1; d <= X_MAX; d += 1) for (const c of [s.x + d, s.x - d]) if (c >= lo && c <= X_MAX && differs(c)) return c;
  return s.x;
}

/** « تحقّق » : chaque puissance est jugée ; une fausse est refusée avec les deux valeurs à x ; toutes justes : la ligne réduite s'écrit. */
export function check(s) {
  if (!canCheck(s)) return s;
  const terms = expansionTerms(s);
  const powers = E.usedPowers(terms);
  const typed = Object.fromEntries(powers.map((p) => [p, coefOf(s, p)]));
  const x = coefWitness(s, terms, typed);
  const j = E.coefJudge(terms, typed, x, writtenValue(s, x));
  let n = s;
  for (const p of powers) n = push(n, { kind: 'coef', world: s.world, task: taskOf(n), power: p, ok: !j.wrong.includes(p) });
  n = { ...n, checked: Object.fromEntries(powers.map((p) => [p, !j.wrong.includes(p)])) };
  if (!j.ok) {
    const p = j.wrong[0];
    const ref = { kind: 'refused', world: s.world, task: taskOf(s), reason: 'coef', power: p, x, counted: j.counted, written: j.written };
    n = push(n, ref);
    return { ...n, refusals: [...n.refusals, ref], last: { event: 'check', ok: false, power: p, x, counted: j.counted, written: j.written } };
  }
  return markSolved({ ...n, last: { event: 'check', ok: true } });
}

/* ── les tâches ── */

const nextUnsolved = (s) => {
  for (let k = 1; k <= s.tasks.length; k += 1) { const i = (s.ti + k) % s.tasks.length; if (!s.done[i]) return i; }
  return -1;
};
/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de son état initial, non résolue (même si c'était la dernière). */
export const retryTask = (s) => (s.custom ? s : { ...load(s, s.ti), done: s.done.map((d, i) => (i === s.ti ? false : d)) });
/** « التالي » : la tâche suivante non résolue (ou le retour à la tâche après le panneau libre). */
export const canNext = (s) => (s.custom ? s.done.some((d) => !d) : s.solvedNow && nextUnsolved(s) >= 0);
export function nextTask(s) {
  if (!canNext(s)) return s;
  const i = s.custom && !s.done[s.ti] ? s.ti : nextUnsolved(s);
  return load(s, i);
}

/* ── « جرّب أعدادك » : l'élève construit SON terrain / SON expression ── */

/** Le terrain / l'expression libre est-il valide ? (plot : jamais dégénéré ; arrows : chaque facteur a un terme non nul) */
function freeValid(world, f) {
  if (world === 'arrows') return [f.f1, f.f2].every((q) => q.a !== 0 || q.b !== 0);
  return E.isValidPlot(f.h, f.w);
}
const freeTask = (world, f) => (world === 'arrows'
  ? { id: 'custom', expr: { products: [E.product(1, factorTerms(f.f1), factorTerms(f.f2))] } }
  : { id: 'custom', h: { ...f.h }, w: { ...f.w } });
const factorTerms = ({ a, b }) => [a ? t(a, 1) : null, b ? t(b, 0) : null].filter(Boolean);

/**
 * Un pas d'un stepper du panneau libre : plot → `which` 'h' | 'w', `field` 'm' | 'n' ; arrows → `which` 'f1' | 'f2', `field` 'a' | 'b'.
 * Le terrain / l'expression se reconstruit (même mécanique) ; une valeur qui le rendrait invalide est ignorée.
 */
export function stepFree(s, which, field, delta) {
  const world = s.world;
  const cur = freeOf(s);
  const [lo, hi] = world === 'arrows' ? FREE.arrows.c : FREE.plot[which][field];
  const v = clamp(cur[which][field] + delta, lo, hi);
  if (v === cur[which][field]) return s;
  const free = { ...cur, [which]: { ...cur[which], [field]: v } };
  if (!freeValid(world, free)) return s;
  return buildCustom(s, free);
}
function buildCustom(s, free) {
  const tk = freeTask(s.world, free);
  const x = s.world === 'arrows' ? s.x : clamp(s.x, E.minX(tk.h, tk.w), X_MAX);
  const base = { ...s, x };
  const f = taskFresh(base, tk);
  const n = { ...base, ...f, custom: true, free, coefs: {}, coefTouched: {}, checked: {}, solvedNow: false, held: null, last: { event: 'custom' } };
  return push(n, { kind: 'custom', world: s.world });
}
/** Les valeurs du panneau libre : celles du terrain libre, sinon celles de la tâche courante (quand elles s'y écrivent), sinon de départ. */
export function freeOf(s) {
  if (s.custom && s.free) return s.free;
  if (s.world === 'plot') return s.h && s.w ? { h: { m: s.h.m, n: s.h.n }, w: { m: s.w.m, n: s.w.n } } : freeDefaults('plot');
  const pr = s.expr?.products;
  const ab = (f) => (f.length <= 2 && f.every((q) => q.p <= 1) && new Set(f.map((q) => q.p)).size === f.length
    ? { a: f.find((q) => q.p === 1)?.c ?? 0, b: f.find((q) => q.p === 0)?.c ?? 0 } : null);
  const f1 = pr?.length === 1 ? ab(pr[0].f1) : null; const f2 = pr?.length === 1 ? ab(pr[0].f2) : null;
  const inB = (q) => q && Math.abs(q.a) <= FREE.arrows.c[1] && Math.abs(q.b) <= FREE.arrows.c[1];
  return pr?.length === 1 && pr[0].sign > 0 && inB(f1) && inB(f2) ? { f1, f2 } : freeDefaults('arrows');
}
/* ═════════════ Découverte ═════════════ */

/** plot : les tâches résolues ; arrows : une expression à 4 flèches (ou plus) résolue, ou toutes les tâches. */
export function discoveryReady(s) {
  if (s.world === 'plot') return allDone(s);
  return allDone(s) || s.solvedLog.some((e) => E.arrowCount(e.expr) >= 4);
}

/** Le terrain de l'élève pour la découverte : le dernier résolu (sinon le courant), et deux x où les deux aires se valent. */
export function plotWitness(s) {
  const e = [...s.solvedLog].reverse().find((q) => q.h) ?? { h: s.h, w: s.w, patches: s.patches ?? [], tex: exprTex(s) };
  const lo = E.minX(e.h, e.w);
  const x1 = clamp(s.x, lo, X_MAX);
  const x2 = x1 + 2 <= X_MAX ? x1 + 2 : x1 - 2 >= lo ? x1 - 2 : x1 + (x1 < X_MAX ? 1 : -1);
  const at = (x) => ({ x, whole: E.plotArea(e.h, e.w, x), parts: E.partsSum(e.patches, x) });
  return { tex: e.tex, a: at(x1), b: at(x2) };
}

/** Les deux lectures FAUSSES de « chaque terme du 1er facteur », sur l'expression la plus riche que la main a résolue : la valeur qu'elles donnent à x. */
export function arrowWitness(s) {
  const log = s.solvedLog.filter((e) => e.expr);
  const pick = [...log].sort((a, b) => E.arrowCount(b.expr) - E.arrowCount(a.expr))[0];
  const expr = pick?.expr ?? s.expr ?? ARROW_TASKS[2].expr;
  const first = (x) => expr.products.reduce((a, pr) => a + pr.sign * pr.f1.reduce((q, f) => q + f.c * x ** f.p * (pr.f2[0].c * x ** pr.f2[0].p), 0), 0);
  const added = (x) => expr.products.reduce((a, pr) => a + pr.sign * pr.f1.reduce((q, f) => q + pr.f2.reduce((r, g) => r + f.c * x ** f.p + g.c * x ** g.p, 0), 0), 0);
  const pickX = (wrong) => {
    for (let d = 0; d <= X_MAX; d += 1) for (const c of [s.x + d, s.x - d]) if (c >= 1 && c <= X_MAX && wrong(c) !== E.exprValue(expr, c)) return c;
    return s.x;
  };
  const xf = pickX(first); const xa = pickX(added);
  return {
    tex: E.exprTex(expr),
    first: { x: xf, right: E.exprValue(expr, xf), wrong: first(xf) },
    added: { x: xa, right: E.exprValue(expr, xa), wrong: added(xa) },
  };
}

/** Les lignes de la règle, avec les propres tâches de l'élève. */
export function formalLines(s) {
  const log = s.solvedLog;
  const lines = log.map((e) => ({ task: e.task, tex: e.tex, expanded: e.expanded, result: e.result }));
  const w = s.world === 'plot' ? plotWitness(s) : null;
  const first = log.find((e) => e.patches) ?? log[0];
  const corner = log.find((e) => e.patches?.some((p) => p.corner));
  return { lines, witness: w, first: first ?? null, corner: corner ?? null };
}

/* ═════════════ Onboarding (LabCoach) ═════════════ */

/**
 * Le PROCHAIN geste utile, en données pures `{ id, target, gesture }` (MANIPULATION_CONTRACT §8quater) — le geste, jamais la règle :
 * il montre la poignée à glisser, la parcelle / la carte à juger, la puce d'où partir, le réglage — jamais la bonne coupure ni le bon signe.
 *   plot : cut (la poignée du bord bas ; la poignée de gauche est toujours `cutMore`, sans bulle) · cutMore · sign · signMore · x · coef · check · next   |   arrows : arrow · arrowMore · productSign · x · coef · check · next
 */
export function coachOf(s) {
  if (allDone(s) && !s.custom) return null;
  if (s.solvedNow) return canNext(s) ? { id: 'next', target: '[data-as-next]', gesture: 'tap' } : null;
  const ph = phaseOf(s);
  if (s.world === 'plot') {
    if (ph === 'cut') {
      const k = cutsPending(s)[0];
      const moved = Object.values(s.cuts).some((c) => c?.ok);
      return { id: moved || k === 'h' ? 'cutMore' : 'cut', target: `[data-as-cut="${k}"]`, gesture: 'drag', prefer: 'above', side: k };
    }
    if (ph === 'sign') {
      if (s.decisions > 0 && !s.xMoved && s.scaffold) return { id: 'x', target: '[data-as-x]', gesture: 'tap' };
      const p = undecided(s)[0];
      return { id: s.decisions === 0 ? 'sign' : 'signMore', target: `[data-as-patch="${p.id}"]`, gesture: 'tap', patch: p.id };
    }
  } else if (ph === 'arrow') {
    const pend = s.arrows.find((a) => s.linked[a.id] && s.linked[a.id].sign == null);
    if (pend) return { id: 'productSign', target: `[data-as-product="${pend.id}"]`, gesture: 'tap', arrow: pend.id };
    if (s.decisions > 0 && !s.xMoved) return { id: 'x', target: '[data-as-x]', gesture: 'tap' };
    const { origins } = chipsOf(s);
    const o = origins.find((q) => targetsLeft(s, q.oi).length > 0);
    return { id: linkedCount(s) === 0 ? 'arrow' : 'arrowMore', target: `[data-as-origin="${o.oi}"]`, gesture: 'drag', from: o.oi, to: targetsLeft(s, o.oi)[0].tj };
  }
  if (ph === 'reduce' && !s.scaffold) {
    const p = powersOf(s).find((q) => !s.coefTouched[q]);
    if (p != null) return { id: 'coef', target: `[data-as-coef="${p}"]`, gesture: 'tap', power: p };
    return { id: 'check', target: '[data-as-check]', gesture: 'tap' };
  }
  return null;
}
