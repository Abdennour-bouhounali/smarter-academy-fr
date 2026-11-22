/**
 * kit-packer — LA LOGIQUE PURE de « ورشة الحقائب التضامنية » (2AM, unité 1, درس « توزيع الضرب على الجمع والطرح », 2026-10-29). Exacte : les produits viennent de
 * `packages/core/arithmetic/chainOps.js` (étage L4 : `expand`), importé PAR CHEMIN.
 *
 * LE MODÈLE. Le club de solidarité prépare `k` cartables identiques, chacun avec `a` cahiers et `b` stylos. Fatima remplit cartable par cartable (compteur `k × (a + b)`). Ali travaille
 * « صنفًا بصنف » : la MAIN règle deux distributeurs (le nombre `n` de cahiers, `m` de stylos) ; le tapis DISTRIBUE chaque chargement aux `k` cartables UN PAR CARTABLE à tour de rôle
 * (`deal`), si bien que n n'est partagé en parts égales que si k divise n. Un cartable est PRÊT quand il contient exactement `a` cahiers et `b` stylos ; seul `n = k × a`, `m = k × b`
 * remplit tous les cartables sans reste ni manque, et alors les deux compteurs (`n + m` et `k × (a + b)`) s'allument ensemble. L'ARBITRE est le cartable, jamais un corrigé : deux
 * compteurs égaux ne suffisent pas (n = 20, m = 10 donne 30 = 30 et des cartables mal remplis).
 *   - tâche `fill`  : `{ id, kind:'fill', k, a, b, op:'+'|'−', unit?:'items'|'m', predict?, start?:{n,m} }` (op '−' : le second distributeur est la BENNE des cahiers abîmés ; les cartables
 *                     reçoivent n − m bons cahiers ; unit 'm' : des bobines de ruban en mètres, partagées en parts égales n / k).
 *   - tâche `bags`  : `{ id, kind:'bags', n, m, a, b, k0? }` : distributeurs VERROUILLÉS, la main règle le NOMBRE de cartables.
 *   - tâche `split` : `{ id, kind:'split', k, n, predict? }` : n écrit comme un nombre rond ± un petit nombre (p + q ou p − q) ; k × p et k × q se calculent de tête.
 * Raisons de refus (`reason`) : 'short' (parts égales mais trop petites), 'extra' (trop grandes), 'unequal' (k ne divise pas le chargement : certains cartables ont une unité de plus),
 * 'pack' (k3 : les cartables sont prêts mais pas par « un paquet moins les abîmés »), 'split' (p ± q ≠ n).
 *
 * ÉVÉNEMENTS (`lab.trials`) :
 *   { tk:'deal', task, n, m, k, ok, reason, total, free:false }   { tk:'refused', task, reason, side, n, m, k }
 *   { tk:'predict', task, predicted, total, ok }                  { tk:'split', task, p, q, op, ok }
 *   { tk:'solved', task, total }                                  { tk:'custom', free:true }
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';

export const MAX_DIAL = 120;
export const MAX_BAGS = 16;
export const FREE_LIMITS = Object.freeze({ maxBags: 12, maxPerBag: 9 });

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'k1', kind: 'fill', k: 6, a: 3, b: 2, op: '+' },
    { id: 'k2', kind: 'fill', k: 8, a: 4, b: 5, op: '+' },
    { id: 'k3', kind: 'fill', k: 7, a: 10, b: 2, op: '−' },
    { id: 'k4', kind: 'bags', n: 60, m: 36, a: 5, b: 3, k0: 5 },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'split', k: 9, n: 48, predict: true },
    { id: 'a2', kind: 'fill', k: 15, a: '1,2', b: '0,8', op: '+', unit: 'm', predict: true },
    { id: 'a3', kind: 'fill', k: 6, a: 4, b: 3, op: '+', predict: true, start: { n: 24, m: 3 } },
  ] },
  alone: { tasks: [{ id: 'm1', kind: 'fill', k: 5, a: 6, b: 4, op: '+' }] },
});

const numOf = (t) => Number(String(t).replace(',', '.'));
/** UN PAR CARTABLE à tour de rôle : les parts de `total` entre `k` cartables (parts égales à une unité près). */
export function deal(total, k) {
  const base = Math.floor(total / k); const extra = total % k;
  return Array.from({ length: k }, (_, i) => base + (i < extra ? 1 : 0));
}
/** Les `p` premières unités distribuées (le tapis à mi-course) : même répartition que `deal(p, k)`. */
export const dealPrefix = (p, k) => deal(p, k);

export function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'fill';
  const id = raw.id ?? `k${i}`;
  if (kind === 'bags') {
    const e = C.expand(raw.k0 ?? 1, raw.a, raw.b, '+');
    return Object.freeze({ ...raw, id, kind, op: '+', unit: 'items', k: raw.k0 ?? 1, kitK: null, needA: raw.a, needB: raw.b, targetK: raw.n / raw.a, total: raw.n + raw.m, totalText: String(raw.n + raw.m), eg: e.value });
  }
  if (kind === 'split') {
    const splits = C.mentalSplits(raw.n);
    return Object.freeze({ ...raw, id, kind, op: '+', unit: 'items', splits, total: raw.k * raw.n, totalText: String(raw.k * raw.n) });
  }
  const op = raw.op === '-' ? '−' : (raw.op ?? '+');
  const unit = raw.unit ?? 'items';
  const e = C.expand(raw.k, raw.a, raw.b, op);
  const needA = op === '−' ? C.numText(C.evaluateB(`${raw.a} − ${raw.b}`)) : String(raw.a);
  return Object.freeze({
    ...raw, id, kind: 'fill', op, unit, kitText: e.factored, splitText: e.split, kA: e.kA, kB: e.kB, total: numOf(e.value), totalText: e.value, needA, needB: String(raw.b),
    start: raw.start ?? { n: 0, m: 0 }, predict: !!raw.predict,
  });
}

function fresh(task) {
  return { n: task.start?.n ?? 0, m: task.start?.m ?? 0, k: task.kind === 'bags' ? task.k : task.k, p: 50, q: 0, sop: '−', predicted: '', predictLocked: !task.predict, dealt: null, flash: null, shake: 0 };
}

export function init(numbers = {}) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  return { world: numbers.world ?? 'solidarity', tasks, ti: 0, ...fresh(tasks[0]), done: {}, refusals: {}, trials: [] };
}
export const taskOf = (s) => s.tasks[s.ti];
export const taskDone = (s) => !!s.done[s.ti];
export const canNext = (s) => taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const predictOpen = (s) => !!taskOf(s).predict && !s.predictLocked;
/** Les distributeurs sont réglables : après la prédiction (متقدم), tant que la tâche n'est pas finie, sauf les distributeurs VERROUILLÉS de `bags`. */
export const dialsOpen = (s) => taskOf(s).kind === 'fill' && !taskDone(s) && !predictOpen(s);
export const bagsOpen = (s) => taskOf(s).kind === 'bags' && !taskDone(s);
export const splitOpen = (s) => taskOf(s).kind === 'split' && !taskDone(s) && !predictOpen(s);
export const canDeal = (s) => { const t = taskOf(s); if (taskDone(s) || predictOpen(s)) return false; if (t.kind === 'fill') return s.n > 0 || s.m > 0; return true; };

const clampDial = (v) => Math.max(0, Math.min(MAX_DIAL, Math.round(Number(v) || 0)));
export function setDial(s, which, v) {
  if (!dialsOpen(s)) return s;
  return { ...s, [which]: clampDial(v), dealt: null, flash: null };
}
export function setBags(s, v) {
  if (!bagsOpen(s)) return s;
  return { ...s, k: Math.max(1, Math.min(MAX_BAGS, Math.round(Number(v) || 1))), dealt: null, flash: null };
}
export function setSplit(s, patch) {
  if (!splitOpen(s)) return s;
  const next = { ...s, ...patch, dealt: null, flash: null };
  next.p = Math.max(10, Math.min(100, Math.round(next.p / 10) * 10));
  next.q = Math.max(0, Math.min(20, Math.round(next.q)));
  return next;
}
export function setPredict(s, text) {
  if (!predictOpen(s)) return s;
  return { ...s, predicted: String(text).replace(/[^\d,]/g, '').slice(0, 7) };
}
export const canLockPredict = (s) => predictOpen(s) && s.predicted !== '';
export function lockPredict(s) {
  if (!canLockPredict(s)) return s;
  const t = taskOf(s);
  const predicted = numOf(s.predicted);
  const ok = predicted === t.total;
  return { ...s, predictLocked: true, trials: [...s.trials, Object.freeze({ tk: 'predict', task: t.id, predicted: s.predicted, total: t.totalText, ok })] };
}

/** Un côté (un distributeur) : les parts égales ou non, comparées au besoin d'UN cartable. */
function side(total, k, need, unit) {
  if (unit === 'm') {
    const want = Math.round(k * need * 1000) / 1000;
    const ok = total === want;
    return { ok, counts: null, per: total / k, reason: ok ? null : total < want ? 'short' : 'extra' };
  }
  const counts = deal(total, k); const min = Math.min(...counts); const max = Math.max(...counts);
  if (min === need && max === need) return { ok: true, counts, per: need, reason: null };
  if (total % k !== 0) return { ok: false, counts, per: min, min, max, empty: counts.filter((c) => c === 0).length, reason: 'unequal' };
  return { ok: false, counts, per: min, reason: min < need ? 'short' : 'extra' };
}

/** JUGE un chargement : `{ ok, reason, side:'A'|'B'|null, sa, sb, total, counter }` — sans jamais lire un corrigé. */
export function judge(task, st) {
  if (task.kind === 'split') {
    const sa = st.sop === '+' ? st.p + st.q : st.p - st.q;
    const ok = sa === task.n && st.q > 0;
    return { ok, reason: ok ? null : 'split', side: null, sa: null, sb: null, total: ok ? task.total : null, got: sa };
  }
  if (task.kind === 'bags') {
    const a = side(task.n, st.k, task.needA, 'items'); const b = side(task.m, st.k, task.needB, 'items');
    const ok = a.ok && b.ok;
    return { ok, reason: ok ? null : (!a.ok ? a.reason : b.reason), side: ok ? null : (!a.ok ? 'A' : 'B'), sa: a, sb: b, total: task.n + task.m };
  }
  const k = task.k;
  const unit = task.unit;
  const goodA = task.op === '−' ? Math.max(0, st.n - st.m) : st.n;
  const sa = side(goodA, k, numOf(task.needA), unit);
  const sb = task.op === '−' ? { ok: true, counts: null, per: 0, reason: null } : side(st.m, k, numOf(task.needB), unit);
  let ok = sa.ok && sb.ok;
  let reason = ok ? null : (!sa.ok ? sa.reason : sb.reason);
  let sideId = ok ? null : (!sa.ok ? 'A' : 'B');
  if (ok && task.op === '−' && !(String(st.n) === task.kA && String(st.m) === task.kB)) { ok = false; reason = 'pack'; sideId = 'A'; }
  const total = task.op === '−' ? st.n - st.m : st.n + st.m;
  return { ok, reason, side: sideId, sa, sb, total };
}

/** « وزّع » : le tapis distribue ; le résultat est jugé par les cartables. */
export function dealNow(s) {
  if (!canDeal(s)) return s;
  const t = taskOf(s);
  const j = judge(t, s);
  const dealt = { n: s.n, m: s.m, k: s.k, p: s.p, q: s.q, sop: s.sop, judged: j };
  if (t.kind === 'split') {
    const ev = Object.freeze({ tk: 'split', task: t.id, p: s.p, q: s.q, op: s.sop, ok: j.ok });
    if (!j.ok) return fail(s, t, dealt, j, [ev]);
    return win(s, t, dealt, [ev], t.totalText);
  }
  const ev = Object.freeze({ tk: 'deal', task: t.id, n: s.n, m: s.m, k: s.k, ok: j.ok, reason: j.reason, total: String(j.total), free: false });
  if (!j.ok) return fail(s, t, dealt, j, [ev]);
  return win(s, t, dealt, [ev], String(j.total));
}
function fail(s, t, dealt, j, evs) {
  const refusals = { ...s.refusals, [s.ti]: (s.refusals[s.ti] ?? 0) + 1 };
  return { ...s, dealt, flash: { ok: false, reason: j.reason, side: j.side, j }, shake: s.shake + 1, refusals,
    trials: [...s.trials, ...evs, Object.freeze({ tk: 'refused', task: t.id, reason: j.reason, side: j.side, n: s.n, m: s.m, k: s.k })] };
}
function win(s, t, dealt, evs, total) {
  return { ...s, dealt, flash: { ok: true, j: dealt.judged }, done: { ...s.done, [s.ti]: true }, trials: [...s.trials, ...evs, Object.freeze({ tk: 'solved', task: t.id, total })] };
}

export function restartTask(s) {
  return { ...s, ...fresh(taskOf(s)), done: { ...s.done, [s.ti]: false }, refusals: { ...s.refusals, [s.ti]: 0 } };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, ...fresh(s.tasks[ti]) };
}

/** Les deux compteurs : celui de Fatima (cartable par cartable) et celui du tapis (ce que la main a sorti du magasin). */
export function counters(task, st) {
  if (task.kind === 'split') {
    const p = st.p; const q = st.q;
    return { kit: `${task.k} × ${task.n}`, kitValue: task.totalText, hand: `${task.k * p} ${st.sop} ${task.k * q}`, handValue: String(st.sop === '+' ? task.k * (p + q) : task.k * (p - q)) };
  }
  if (task.kind === 'bags') return { kit: `${st.k} × (${task.a} + ${task.b})`, kitValue: String(st.k * (task.a + task.b)), hand: `${task.n} + ${task.m}`, handValue: String(task.n + task.m) };
  const handValue = task.op === '−' ? (st.n >= st.m ? String(st.n - st.m) : '0') : String(st.n + st.m);
  return { kit: task.kitText, kitValue: task.totalText, hand: `${st.n} ${task.op} ${st.m}`, handValue };
}

/* ── « جرّب أعدادك » ── */
/** k cartables, a et b par cartable (b < a pour la différence) : les deux écritures, leurs valeurs et la répartition. `{ ok, why?, kit, split, value, bags }`. */
export function freeRead({ k, a, b, op = '+' }) {
  const [K, A, B] = [k, a, b].map((x) => Math.floor(Number(x)));
  if (![K, A, B].every(Number.isFinite) || K < 1 || A < 0 || B < 0) return { ok: false, why: 'empty' };
  if (K > FREE_LIMITS.maxBags || A > FREE_LIMITS.maxPerBag || B > FREE_LIMITS.maxPerBag) return { ok: false, why: 'limit' };
  if (op === '−' && B >= A) return { ok: false, why: 'order' };
  const e = C.expand(K, A, B, op);
  return { ok: true, kit: e.factored, split: e.split, products: e.products, value: e.value, bags: Array.from({ length: K }, () => ({ a: op === '−' ? A - B : A, b: op === '−' ? 0 : B })) };
}

/* ── onboarding ── */
export function coachOf(s) {
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-kit-free]', gesture: 'type' };
  if (predictOpen(s)) return { id: 'predict', target: '[data-kit-predict-input]', gesture: 'type' };
  const last = s.flash;
  if (t.kind === 'bags') return last && !last.ok ? { id: 'retry', target: '[data-kit-dial-minus="k"]', gesture: 'tap' } : s.dealt ? null : { id: 'bags', target: '[data-kit-dial-plus="k"]', gesture: 'tap' };
  if (t.kind === 'split') return s.dealt && !last?.ok ? { id: 'retry', target: '[data-kit-split-q]', gesture: 'tap' } : { id: 'split', target: '[data-kit-split-p]', gesture: 'tap' };
  if (last && !last.ok) return { id: 'retry', target: '[data-kit-dial="n"]', gesture: 'tap' };
  if (s.n === 0 && s.m === 0) return { id: 'dial', target: '[data-kit-dial="n"]', gesture: 'drag' };
  if (s.m === 0 && !s.dealt) return { id: 'dial2', target: '[data-kit-dial="m"]', gesture: 'drag' };
  return { id: 'deal', target: '[data-kit-deal]', gesture: 'tap' };
}
