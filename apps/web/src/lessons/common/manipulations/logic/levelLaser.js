/**
 * level-laser — LA LOGIQUE PURE de « ليزر المستوى » (2AM, unité 2 « الكسور والعمليات عليها », درس « مقارنة كسرين », 2026-10-29).
 * Exacte : tout est entier. Deux (trois) réservoirs identiques ont un tube de verre, chacun gradué en son PROPRE nombre b de crans égaux ; l'huile monte à `a/b`
 * de réservoir (a peut être décimal : « 2,5 »). La MAIN tient la hauteur du laser : un niveau rouge qui traverse tous les tubes, collé aux crans de la UNION des graduations
 * (et aux niveaux d'huile). Les maths viennent de `packages/core/arithmetic/fractions2.js` (E4, importé PAR CHEMIN) ; ici l'état du labo.
 *
 * Positions : L = ppcm des b et des dénominateurs des niveaux ; le laser est à p/L de réservoir. `crossing(tube, p)` → { onMark: k | null, between: [k, k+1] } (en crans de CE tube).
 *
 * ÉTAPES (`task.steps`) — مبتدئ : laser (poser le laser sur l'huile du réservoir gauche) → choose (lequel a plus d'huile) → rewrite (si un dénominateur est multiple de l'autre) → one (si un réservoir
 * dépasse 1). متقدم (tubes voilés) : choose | order → rewrite → verify (les voiles se lèvent ; le laser se pose sur l'huile gauche). Un écrit faux lève les voiles (le MONDE répond).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'laser', task, h }     { kind:'compare', task, choice, ok, model, free }     { kind:'rewrite', task, value, ok, model }     { kind:'one', task, choice, ok, model }
 *   { kind:'order', task, seq, ok, model }     { kind:'predict', task, step, ok, model }     { kind:'solved', task, free }     { kind:'custom', free:true, tanks }
 */
import * as F from '@smarter-academy/core/arithmetic/fractions2.js';

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'l1', tanks: ['5/8', '7/8'] },
    { id: 'l2', tanks: ['3/4', '7/12'] },
    { id: 'l3', tanks: ['3/5', '3/8'] },
    { id: 'l4', tanks: ['9/8', '5/6'] },
  ] },
  advanced: { tasks: [
    { id: 'a1', tanks: ['5/6', '11/18'], predict: true },
    { id: 'a2', tanks: ['2/3', '5/9', '7/9'], predict: true, kind: 'order' },
    { id: 'a3', tanks: ['2,5/4', '5,5/8'], predict: true },
    { id: 'a4', tanks: ['7/5', '11/10'], predict: true },
  ] },
});

const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const arabicToLatin = (v) => String(v ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace('⁄', '/');
/** « 9/12 », « ٩/١٢ » → { num, den } (naturels) ou null. */
function parseWriting(txt) {
  const m = /^(\d{1,4})\/(\d{1,4})$/.exec(arabicToLatin(txt));
  if (!m) return null;
  const den = Number(m[2]);
  return den === 0 ? null : { num: Number(m[1]), den };
}

/** « 2,5/4 » → { text, den, vn, vd } : valeur exacte vn/vd. */
function tank(text) {
  const m = /^(\d+(?:[.,]\d+)?)\/(\d+)$/.exec(String(text).trim());
  if (!m) throw new Error(`levelLaser: réservoir illisible « ${text} »`);
  const [ip, fp = ''] = m[1].replace(',', '.').split('.');
  const k = fp.length;
  const num = Number(ip + fp); const den = Number(m[2]);
  const vd = den * 10 ** k;
  const g = gcd(num, vd);
  return { text: String(text).replace('.', ','), numText: m[1].replace('.', ','), den, vn: num / g, vd: vd / g };
}

export function buildTask(rawTask, i = 0) {
  const tanks = rawTask.tanks.map(tank);
  if (tanks.length < 2 || tanks.length > 3) throw new Error('levelLaser: deux ou trois réservoirs');
  if (tanks.some((t) => t.den < 2 || t.den > 24)) throw new Error('levelLaser: crans de 2 à 24');
  if (tanks.some((t) => t.vn / t.vd > 2)) throw new Error('levelLaser: niveau au plus 2');
  const kind = rawTask.kind ?? 'compare';
  const L = tanks.reduce((m, t) => lcm(lcm(m, t.den), t.vd), 1);
  const maxVal = Math.max(...tanks.map((t) => t.vn / t.vd));
  const T4 = Math.max(4, Math.ceil(maxVal * 4 - 1e-9));         // hauteur du verre en quarts de réservoir
  const maxP = Math.ceil((L * T4) / 4);
  const pos = tanks.map((t) => (t.vn * L) / t.vd);
  const set = new Set(pos);
  tanks.forEach((t) => { for (let kk = 0; kk <= Math.floor((t.den * T4) / 4); kk += 1) set.add((kk * L) / t.den); });
  const snaps = [...set].filter((p) => p <= maxP).sort((a, b) => a - b);
  const marksOf = (t) => { const out = []; for (let kk = 0; kk <= Math.floor((t.den * T4) / 4); kk += 1) out.push((kk * L) / t.den); return out; };
  const coarser = tanks.reduce((a, t) => (t.den < a.den ? t : a));
  const coarse = marksOf(coarser);
  const Dmax = Math.max(...tanks.map((t) => t.den));
  const bigTank = tanks.findIndex((t) => t.den === Dmax);
  const rw = tanks.findIndex((t) => t.den < Dmax && Dmax % t.den === 0);          // le réservoir à réécrire
  const c0 = tanks.length === 2 ? F.compareCase(tanks[0].text, tanks[1].text) : (rw >= 0 ? 'multiple' : null);
  const predict = !!rawTask.predict;
  const steps = [];
  if (!predict) steps.push('laser');
  steps.push(kind === 'order' ? 'order' : 'choose');
  if (rw >= 0 && c0 === 'multiple') steps.push('rewrite');
  if (!predict && c0 === 'viaOne') steps.push('one');
  if (predict) steps.push('verify');
  const truth = tanks.length === 2 ? cmpSign(tanks[0], tanks[1]) : null;
  return Object.freeze({
    id: rawTask.id ?? `t${i}`, kind, tanks, n: tanks.length, predict, L, T4, maxP, pos, snaps, coarse, marksOf, case: c0, steps, rewrite: rw >= 0 ? rw : null, D: Dmax, bigTank, truth,
    rewritten: rw >= 0 ? Math.round((tanks[rw].vn * Dmax) / (tanks[rw].vd)) : null,
    order: tanks.map((_, ix) => ix).sort((a, b) => cmp(tanks[a], tanks[b])),
    overs: tanks.map((t) => t.vn > t.vd),
  });
}
const cmp = (x, y) => { const l = x.vn * y.vd; const r = y.vn * x.vd; return l === r ? 0 : l < r ? -1 : 1; };
const cmpSign = (x, y) => cmp(x, y);
/** Le nombre de crans (entier ou non) du niveau d'un réservoir, dans SON tube : { onMark, between } — rendu avec les chiffres de l'élève. */
export function crossing(tubeDen, p, L) {
  const x = p * tubeDen;
  if (x % L === 0) return { onMark: x / L, between: null };
  const lo = Math.floor(x / L);
  return { onMark: null, between: [lo, lo + 1] };
}

/* ── État ───────────────────────────────────────────────────────────────────────────────────── */

function initW(task) { return { p: 0, si: 0, touched: false, lifted: !task.predict, seq: [], miss: null, solvedOnce: false, aligned: false }; }
function fresh(tasks, extra = {}) { return { tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, free: null, flag: null, ...extra }; }
export function init(numbers = {}) { return fresh((numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask)); }

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => (s.free ? false : !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const stepOf = (s) => (s.free || taskDone(s) ? 'done' : taskOf(s).steps[s.w.si] ?? 'done');
export const laserLocked = (s) => !s.free && !s.w.lifted;
/** Les boutons « على زيت الخزّان » : offerts APRÈS un premier geste de la main (la main d'abord). */
export const snapOffered = (s) => s.free ? true : s.w.touched && !laserLocked(s);

function pushTrial(s, ev, extra = {}) { return { ...s, last: ev, trials: [...s.trials, ev], ...extra }; }
function solve(s) {
  const sv = Object.freeze({ kind: 'solved', task: s.free ? -1 : s.ti, free: !!s.free });
  return { ...s, trials: [...s.trials, sv], done: { ...s.done, [s.ti]: true }, w: { ...s.w, si: taskOf(s).steps.length } };
}
function advance(s) {
  const t = taskOf(s); const si = s.w.si + 1;
  if (si >= t.steps.length) return solve(s);
  const next = t.steps[si];
  return { ...s, w: { ...s.w, si, miss: null, lifted: s.w.lifted || next === 'verify', seq: [] } };
}

/* ── Gestes du laser ─────────────────────────────────────────────────────────────────────────── */

const nearest = (snaps, v) => snaps.reduce((b, x) => (Math.abs(x - v) < Math.abs(b - v) ? x : b), snaps[0]);
export function setLaser(s, v) {
  if (laserLocked(s)) return s;
  const t = taskOf(s); const p = nearest(t.snaps, Math.max(0, Math.min(t.maxP, v)));
  if (p === s.w.p && s.w.touched) return s;
  let n = { ...s, w: { ...s.w, p, touched: true, miss: null }, last: null, flag: null };
  const st = stepOf(n);
  if (!s.free && (st === 'laser' || st === 'verify') && p === t.pos[0]) {
    const ev = Object.freeze({ kind: 'laser', task: s.ti, h: `${t.tanks[0].text}`, free: false });
    n = pushTrial(n, ev, { w: { ...n.w, aligned: true } });
    return advance(n);
  }
  return n;
}
function stepMark(s, dir, marks) {
  const t = taskOf(s); const list = marks ?? t.snaps;
  const cur = s.w.p;
  const cand = dir > 0 ? list.find((x) => x > cur) : [...list].reverse().find((x) => x < cur);
  return cand == null ? s : setLaser(s, cand);
}
export const nudgeLaser = (s, d) => stepMark(s, d, null);
export const pageLaser = (s, d) => stepMark(s, d, taskOf(s).coarse);
export const snapToTank = (s, i) => setLaser(s, taskOf(s).pos[i]);

/* ── Jugements ───────────────────────────────────────────────────────────────────────────────── */

/** `claim` : 'left' | 'right' | 'eq' (deux réservoirs). Modèles faux : numOnly · bigDen · gap · other. */
export function judgeChoice(task, claim) {
  const [x, y] = task.tanks;
  const truth = task.truth; // -1 : le gauche est plus bas
  const trueClaim = truth === 0 ? 'eq' : truth > 0 ? 'left' : 'right';
  if (claim === trueClaim) return { ok: true, model: 'right' };
  const a = Number(x.numText.replace(',', '.')); const c = Number(y.numText.replace(',', '.'));
  const numClaim = a === c ? 'eq' : a > c ? 'left' : 'right';
  const denClaim = x.den === y.den ? 'eq' : x.den > y.den ? 'left' : 'right';
  if (claim === 'eq' && x.den - a === y.den - c) return { ok: false, model: 'gap' };
  if (claim === numClaim && x.den !== y.den) return { ok: false, model: 'numOnly' };
  if (claim === denClaim && x.den !== y.den) return { ok: false, model: 'bigDen' };
  return { ok: false, model: 'other' };
}
/** « اكتب الكسر بأجزاء D » : accepté si le dénominateur est D et la valeur égale ; noScale : D écrit mais le même numérateur. */
export function judgeRewrite(task, text) {
  const w = parseWriting(text);
  if (!w) return { ok: false, model: 'unreadable' };
  const t = task.tanks[task.rewrite];
  const equal = w.num * t.vd === t.vn * w.den;
  if (equal && w.den === task.D) return { ok: true, model: 'right' };
  if (equal) return { ok: false, model: 'otherDen' };
  if (w.den === task.D && String(w.num) === t.numText) return { ok: false, model: 'noScale' };
  return { ok: false, model: 'other' };
}
/** « أيّ الخزّانين فوق خطّ 1 ؟ » (l4) : 'left' | 'right'. */
export function judgeOne(task, claim) {
  const idx = task.tanks.findIndex((t) => t.vn > t.vd);
  const ok = (idx === 0 ? 'left' : 'right') === claim;
  return { ok, model: ok ? 'right' : 'oneWrong' };
}
/** L'ordre croissant tapé : `seq` d'indices. */
export function judgeOrder(task, seq) {
  const want = task.order;
  if (seq.every((v, i) => v === want[i])) return { ok: true, model: 'right' };
  if (seq.every((v, i) => v === want[want.length - 1 - i])) return { ok: false, model: 'reversed' };
  return { ok: false, model: 'other' };
}

function claimPos(task, claim) { return claim === 'right' ? task.pos[1] : task.pos[0]; }
function worldAnswer(s, p) {
  const t = taskOf(s);
  return { ...s, w: { ...s.w, p: nearest(t.snaps, p), lifted: true, touched: true } };
}

export function choose(s, claim) {
  if (s.free || stepOf(s) !== 'choose') return s;
  const t = taskOf(s); const j = judgeChoice(t, claim);
  const predicting = !s.w.lifted;
  const ev = Object.freeze({ kind: predicting ? 'predict' : 'compare', task: s.ti, step: 'choose', choice: claim, ok: j.ok, model: j.model, free: false });
  let n = pushTrial(s, ev, { flag: j.ok ? null : { model: j.model, claim } });
  if (j.ok) return advance(n);
  n = worldAnswer(n, claimPos(t, claim));
  return n;
}
export function rewrite(s, text) {
  if (s.free || stepOf(s) !== 'rewrite') return s;
  const t = taskOf(s); const j = judgeRewrite(t, text);
  const predicting = !s.w.lifted;
  const ev = Object.freeze({ kind: predicting ? 'predict' : 'rewrite', task: s.ti, step: 'rewrite', value: String(text).trim(), ok: j.ok, model: j.model, free: false });
  const n = pushTrial(s, ev, { flag: j.ok ? null : { model: j.model, text: String(text).trim() } });
  if (j.ok) return advance(n);
  if (!s.w.lifted && j.model !== 'unreadable') return worldAnswer(n, t.pos[t.rewrite]);
  return n;
}
export function chooseOne(s, claim) {
  if (s.free || stepOf(s) !== 'one') return s;
  const t = taskOf(s); const j = judgeOne(t, claim);
  const ev = Object.freeze({ kind: 'one', task: s.ti, choice: claim, ok: j.ok, model: j.model, free: false });
  const n = pushTrial(s, ev, { flag: j.ok ? null : { model: j.model, claim } });
  return j.ok ? advance(n) : n;
}
export function tapOrder(s, i) {
  if (s.free || stepOf(s) !== 'order' || s.w.seq.includes(i)) return s;
  const t = taskOf(s); const seq = [...s.w.seq, i];
  let n = { ...s, w: { ...s.w, seq } };
  if (seq.length < t.n) return n;
  const j = judgeOrder(t, seq);
  const predicting = !s.w.lifted;
  const ev = Object.freeze({ kind: predicting ? 'predict' : 'order', task: s.ti, step: 'order', seq: seq.join(''), ok: j.ok, model: j.model, free: false });
  n = pushTrial(n, ev, { flag: j.ok ? null : { model: j.model } });
  if (j.ok) return advance(n);
  return { ...worldAnswer(n, t.pos[t.order[0]]), w: { ...n.w, seq: [], p: nearest(t.snaps, t.pos[t.order[0]]), lifted: true, touched: true } };
}
export const clearOrder = (s) => (stepOf(s) === 'order' ? { ...s, w: { ...s.w, seq: [] } } : s);

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null, flag: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, flag: null, done: { ...s.done, [s.ti]: false } });

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

export function freeCheck(aT, bT, cT, dT) {
  const nat = (v) => { const r = arabicToLatin(v); return /^\d{1,2}$/.test(r) ? Number(r) : null; };
  const a = nat(aT); const b = nat(bT); const c = nat(cT); const d = nat(dT);
  if ([a, b, c, d].some((v) => v == null)) return { ok: false, why: 'incomplete' };
  if (b < 2 || b > 24 || d < 2 || d > 24 || a < 1 || c < 1) return { ok: false, why: 'range' };
  if (a > 2 * b || c > 2 * d) return { ok: false, why: 'tooBig' };
  return { ok: true, a, b, c, d };
}
/** Le cas de la paire libre : 'sameDen' | 'sameNum' | 'multiple' | 'viaOne' | 'equal' | 'later' (cas de 3AM : jamais de verdict). */
export function freeCase(task) {
  const [x, y] = task.tanks;
  if (cmp(x, y) === 0) return 'equal';
  return task.case ?? 'later';
}
export function freeTask(s, aT, bT, cT, dT) {
  const r = freeCheck(aT, bT, cT, dT);
  if (!r.ok) return s;
  const task = buildTask({ id: 'free', tanks: [`${r.a}/${r.b}`, `${r.c}/${r.d}`] }, 0);
  const custom = Object.freeze({ kind: 'custom', free: true, tanks: task.tanks.map((t) => t.text).join('|') });
  return { ...s, free: { task }, w: { ...initW(task), lifted: true, p: 0 }, last: null, flag: null, trials: [...s.trials, custom] };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, w: initW(s.tasks[s.ti]), last: null, flag: null } : s);

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-ll-next]', gesture: 'tap' } : null;
  const st = stepOf(s); const t = taskOf(s);
  if (st === 'laser') return !s.w.touched && s.ti === 0 ? { id: 'laser', target: '[data-ll-laser]', gesture: 'drag' } : null;
  if (st === 'choose' || st === 'order') {
    if (t.predict) return { id: 'predict', target: '[data-ll-choice-box]', gesture: 'tap' };
    return { id: s.ti === 0 && guidedTrials(s).filter((x) => x.kind === 'compare').length === 0 ? 'read' : 'choose', target: s.ti === 0 && guidedTrials(s).filter((x) => x.kind === 'compare').length === 0 ? '[data-ll-chip="1"]' : '[data-ll-choice-box]', gesture: 'tap' };
  }
  if (st === 'rewrite') return { id: 'rewrite', target: '[data-ll-rewrite]', gesture: 'tap' };
  if (st === 'one') return { id: 'one', target: '[data-ll-one]', gesture: 'tap' };
  if (st === 'verify') return { id: 'verify', target: '[data-ll-laser]', gesture: 'drag' };
  return null;
}
