/**
 * mooring-lines — LA LOGIQUE PURE de « حبال المرسى » (2AM, unité 2 « الكسور والعمليات عليها », درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة », 2026-10-28).
 * Exacte : tout passe par `packages/core/arithmetic/fractions2.js` (importé PAR CHEMIN, jamais par le barrel du cœur) sur `decimals.js`.
 *
 * LE MODÈLE. Un quotient a ÷ b, jugé par un fait PHYSIQUE : des morceaux posés bout à bout sur un câble de longueur a. La MAIN tient le quotient
 * candidat q, à un RANG (0 : le mètre / l'unité, 1 : 0,1, 2 : 0,01) :
 *   - `share` (مبتدئ) : a mètres de corde coupés en b (naturel) cordes égales ; q = la longueur d'UNE corde (en m) ; on pose b morceaux de longueur q ;
 *   - `count` (متقدم) : a mètres de corde, des cordes de b mètres (b décimal) ; q = le NOMBRE de cordes (fractionnaire) ; on pose q morceaux de b mètres.
 * Dans les deux cas le verdict est le même, exact : b × q contre a (`fitsAtRank`) → « يكفي » (il reste du câble), « تماما » (la dernière pièce tombe sur le bout), « لا يكفي »
 * (ça déborde). Le rang se raffine à la main (le cadran) SEULEMENT après avoir TROUVÉ l'encadrement du rang courant : la plus grande valeur qui tient ET la plus petite qui
 * déborde, adjacentes (écart d'une unité du rang) — jamais de saut direct au centimètre. Au rang suivant la règle ZOOME dans ce segment (la fenêtre vaut 10 unités du nouveau rang).
 * Au niveau متقدم la main choisit aussi l'UNITÉ du ruban (m / dm / cm) : le curseur est verrouillé tant que la longueur d'UNE corde n'est pas un naturel (on PRÉDIT d'abord) ;
 * changer d'unité ne change pas q (les deux longueurs sont multipliées par 10 ensemble).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'lay', task, rank, q, verdict:'fits'|'exact'|'over', gap, model?:'remainderComma', free }
 *   { kind:'bracket', task, rank, lo, hi, ok:true, model:'right', free }
 *   { kind:'unit', task, unit, divisorNatural, free }
 *   { kind:'solved', task, exact, free }
 */
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import * as F from '@smarter-academy/core/arithmetic/fractions2.js';

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'r1', kind: 'share', a: '8', b: '3', maxRank: 2 },
    { id: 'r2', kind: 'share', a: '9', b: '4', maxRank: 2 },
    { id: 'r3', kind: 'share', a: '9,5', b: '3', maxRank: 2 },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'count', a: '4,6', b: '0,7', maxRank: 2 },
    { id: 'a2', kind: 'count', a: '13,5', b: '1,8', maxRank: 2 },
    { id: 'a3', kind: 'count', a: '5', b: '0,6', maxRank: 2 },
  ] },
});

export const UNITS = Object.freeze(['m', 'dm', 'cm']);
const unitExp = (u) => UNITS.indexOf(u);

function buildTask(raw, i) {
  const a = D.parse(String(raw.a)); const b = D.parse(String(raw.b));
  if (!a || !b || b.n === 0 || a.n === 0) throw new Error(`mooringLines: tâche illisible ${JSON.stringify(raw)}`);
  const kind = raw.kind === 'count' ? 'count' : 'share';
  const hi0 = F.decimalQuotientBracket(raw.a, raw.b, 0).hi.n;
  return Object.freeze({ id: raw.id ?? `t${i}`, kind, a: D.format(D.normalize(a)), b: D.format(D.normalize(b)), maxRank: raw.maxRank ?? 2, cap0: hi0 + 1 });
}

/** L'état de travail d'une tâche : rang, quotient candidat (en unités du rang), fenêtre, encadrement cherché. */
function initW(task) {
  return { rank: 0, qn: 0, w0: 0, w1: task.cap0, lo: 0, hi: null, brackets: [], laid: null, exact: false, unit: 'm', unitOk: task.kind !== 'count', touched: false };
}
function fresh(tasks, extra = {}) {
  return { tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, free: null, refusedOnce: false, ...extra };
}
export function init(numbers = {}) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  return fresh(tasks);
}

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => (s.free ? !!s.free.done : !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);

/* ── Lecture de l'état ───────────────────────────────────────────────────────────────────────── */

export const qText = (s) => D.format(D.make(s.w.qn, s.w.rank));
export const qAt = (s, n) => D.format(D.make(n, s.w.rank));
export const stepText = (s) => D.format(D.make(1, s.w.rank));
/** Le verdict du candidat courant (b × q contre a) : { product, verdict, gap }. */
export const measure = (s, qn = s.w.qn) => { const t = taskOf(s); return F.fitsAtRank(t.a, t.b, qAt(s, qn)); };
export const bracketFound = (s) => { const w = s.w; return w.exact || (w.lo != null && w.hi != null && w.hi - w.lo === 1); };
const finalRank = (s) => s.w.rank >= taskOf(s).maxRank;
export const exactLanded = (s) => !!s.w.exact;
/** Le cadran n'ouvre le rang suivant qu'après l'encadrement du rang courant (et jamais après un atterrissage exact). */
export const dialUnlocked = (s, r) => r <= s.w.rank || (r === s.w.rank + 1 && bracketFound(s) && !s.w.exact && r <= taskOf(s).maxRank);
export const clipLocked = (s) => taskOf(s).kind === 'count' && !s.w.unitOk;
export const window = (s) => ({ w0: s.w.w0, w1: s.w.w1 });
/** L'unité du ruban en cours (le facteur 10^e appliqué aux DEUX longueurs) et les longueurs lues dans cette unité. */
export function tape(s) {
  const t = taskOf(s); const e = unitExp(s.w.unit);
  return { unit: s.w.unit, e, a: shiftText(t.a, e), b: shiftText(t.b, e) };
}
/** « 4,6 » × 10^e → « 46 » (virgule déplacée, jamais de flottant). */
export function shiftText(txt, e) {
  const v = D.parse(txt);
  const n = BigInt(v.n) * 10n ** BigInt(e);
  const k = v.k;
  const p = 10n ** BigInt(k);
  const whole = n / p; const frac = n % p;
  if (frac === 0n) return String(whole);
  const f = String(frac).padStart(k, '0').replace(/0+$/, '');
  return `${whole},${f}`;
}
const isNaturalText = (txt) => !String(txt).includes(',');
/** La longueur d'une corde / la longueur à couper est-elle un naturel dans l'unité u ? */
const divisorNaturalIn = (s, u) => isNaturalText(shiftText(taskOf(s).b, unitExp(u)));

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

const clampQ = (s, n) => Math.max(s.w.w0, Math.min(s.w.w1, Math.round(n)));
export function setQ(s, n) {
  if (clipLocked(s)) return s;
  const qn = clampQ(s, n);
  if (qn === s.w.qn) return s;
  return { ...s, w: { ...s.w, qn, laid: null, touched: true }, last: null };
}
export const nudge = (s, d) => setQ(s, s.w.qn + d);
export const toStart = (s) => setQ({ ...s, w: { ...s.w, touched: false } }, s.w.w0);

export function setUnit(s, u) {
  const t = taskOf(s);
  if (t.kind !== 'count' || !UNITS.includes(u) || u === s.w.unit) return s;
  const divisorNatural = divisorNaturalIn(s, u);
  const trial = Object.freeze({ kind: 'unit', task: s.free ? -1 : s.ti, unit: u, divisorNatural, free: !!s.free });
  return { ...s, w: { ...s.w, unit: u, unitOk: divisorNatural }, trials: [...s.trials, trial] };
}

/** « ضع القطع » : l'essai. Met à jour l'encadrement cherché, jamais le quotient. */
export function lay(s) {
  if (clipLocked(s)) return s;
  const t = taskOf(s); const w = s.w; const qn = w.qn;
  const m = measure(s);
  const verdict = m.verdict;
  let { lo, hi } = w; let exact = w.exact;
  if (verdict === 'exact') { exact = true; lo = qn; hi = qn; }
  else if (verdict === 'fits') lo = lo == null ? qn : Math.max(lo, qn);
  else hi = hi == null ? qn : Math.min(hi, qn);
  const q0 = Math.floor(Number(D.parse(t.a).n) / D.pow10(D.parse(t.a).k) / (D.parse(t.b).n / D.pow10(D.parse(t.b).k)));
  let model = null;
  if (t.kind === 'share' && w.rank === 1 && isNaturalText(t.a) && isNaturalText(t.b) && verdict === 'fits') {
    const r = Number(t.a) - Number(t.b) * q0;
    if (r > 0 && r < 10 && qn === q0 * 10 + r) model = 'remainderComma';
  }
  const trial = Object.freeze({ kind: 'lay', task: s.free ? -1 : s.ti, rank: w.rank, q: qText(s), verdict, gap: D.format(m.gap), product: D.format(m.product), free: !!s.free, ...(model ? { model } : {}) });
  const w2 = { ...w, lo, hi, exact, laid: { verdict, gap: D.format(m.gap), qn } };
  let next = { ...s, w: w2, last: trial, trials: [...s.trials, trial], refusedOnce: s.refusedOnce || verdict === 'over' };
  const found = exact || (lo != null && hi != null && hi - lo === 1);
  if (found && !(w.exact || (w.lo != null && w.hi != null && w.hi - w.lo === 1))) {
    const b = Object.freeze({ kind: 'bracket', task: s.free ? -1 : s.ti, rank: w.rank, lo: qAt(s, lo), hi: qAt(s, hi), ok: true, model: 'right', exact, free: !!s.free });
    next = { ...next, w: { ...w2, brackets: [...w.brackets, { rank: w.rank, lo, hi, exact }] }, trials: [...next.trials, b] };
    if (exact || w.rank >= t.maxRank) {
      const sv = Object.freeze({ kind: 'solved', task: s.free ? -1 : s.ti, exact, free: !!s.free });
      next = { ...next, trials: [...next.trials, sv], ...(s.free ? { free: { ...s.free, done: true } } : { done: { ...s.done, [s.ti]: true } }) };
    }
  }
  return next;
}

/** Le cadran : ouvre le rang suivant (zoom dans le segment trouvé). */
export function setRank(s, r) {
  if (r === s.w.rank || !dialUnlocked(s, r) || r < s.w.rank) return s;
  const w = s.w;
  const w0 = w.lo * 10; const w1 = w.hi * 10;
  return { ...s, w: { ...w, rank: r, qn: w0, w0, w1, lo: w0, hi: w1, laid: null }, last: null };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, ...(s.free ? { free: { ...s.free, done: false } } : { done: { ...s.done, [s.ti]: false } }) });

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

const arabicToLatin = (v) => String(v ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', ',').trim();
/** a : 0 < a ≤ 99,99 (0 à 2 décimales). */
export function parseA(text) {
  const raw = arabicToLatin(text);
  if (!/^\d{1,2}([,.]\d{1,2})?$/.test(raw)) return null;
  const v = D.parse(raw.replace('.', ','));
  return v && v.n > 0 ? v : null;
}
/** b : un naturel de 2 à 12 (share) ou un décimal de 0,1 à 9,9 (count). */
export function parseB(text, kind) {
  const raw = arabicToLatin(text);
  if (kind === 'count') {
    if (!/^\d([,.]\d)?$/.test(raw)) return null;
    const v = D.parse(raw.replace('.', ','));
    return v && v.n > 0 && D.cmp(v, D.make(99, 1)) <= 0 ? v : null;
  }
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 && n <= 12 ? D.make(n, 0) : null;
}
export function freeTask(s, aText, bText) {
  const kind = s.tasks[0].kind;
  const a = parseA(aText); const b = parseB(bText, kind);
  if (!a || !b) return s;
  const task = buildTask({ id: 'free', kind, a: D.format(a), b: D.format(b), maxRank: 2 }, 0);
  return { ...s, free: { task, done: false }, w: initW(task), last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, w: initW(s.tasks[s.ti]), last: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
export const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-ml-next]', gesture: 'tap' } : null;
  if (clipLocked(s)) return { id: 'unit', target: '[data-ml-unit]', gesture: 'tap' };
  const mine = guidedTrials(s).filter((t) => t.kind === 'lay');
  if (bracketFound(s) && !finalRank(s)) return { id: 'dial', target: '[data-ml-dial]', gesture: 'tap' };
  if (mine.length === 0 && !s.w.touched) return { id: 'clip', target: '[data-ml-clip]', gesture: 'drag' };
  return { id: 'lay', target: '[data-ml-lay]', gesture: 'tap' };
}

