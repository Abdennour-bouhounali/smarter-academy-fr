/**
 * trail-odometer — LA LOGIQUE PURE de « عدّاد المسلك » (2AM, unité 2 « الكسور والعمليات عليها », درس « جمع وطرح كسرين », 2026-10-29).
 * Exacte : les nombres sont des entiers (postes blancs) et des fractions {num, den} ; les maths viennent de `packages/core/arithmetic/fractions2.js`
 * (importé PAR CHEMIN, jamais par le barrel du cœur) sur `fractions3.js`.
 *
 * LE MODÈLE. Un sentier de forêt de cèdres, du portail à la source ; il vaut 1 (ou un circuit fermé qu'on parcourt plusieurs fois). Des poteaux BLANCS tous les 1/n ;
 * en tâche à deux sortes de poteaux, un poteau ROUGE tous les k blancs (l'unité grossière 1/m, n = k·m). La MAIN tient la DISTANCE marchée : un entier de poteaux blancs
 * (0 … n·tours). Une tâche est une suite d'ÉTAPES écrites en fractions (`5/12`, puis `1/4`) ; « وصلنا » juge l'étape : la scoute doit se tenir EXACTEMENT sur le poteau visé
 * (position de départ ± nombre de poteaux blancs de l'étape = num × n/den). Ensuite l'élève ÉCRIT où il est (une fraction) : toute écriture ÉGALE est acceptée ;
 * les écritures fausses typiques sont refusées avec leur MODÈLE et DESSINÉES (un drapeau en pointillé à la position de cette fraction sur le sentier).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'leg', task, leg, posts, ok, free }              { kind:'writing', task, field, value, ok, model, free }
 *   { kind:'predict', task, field, value, ok, free }         { kind:'solved', task, free }        { kind:'custom', free:true, a, b, c, d, op }
 */
import * as F from '@smarter-academy/core/arithmetic/fractions2.js';

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'g1', n: 12, k: 0, legs: ['5/12', '4/12'] },
    { id: 'g2', n: 12, k: 3, legs: ['5/12', '1/4'] },
    { id: 'g3', n: 12, k: 3, start: '3/4', legs: ['-5/12'] },
  ] },
  advanced: { tasks: [
    { id: 'a1', n: 16, k: 2, legs: ['5/16', '3/8'], predict: true },
    { id: 'a2', n: 20, k: 4, start: '13/20', legs: ['-2/5'], predict: true },
    { id: 'a3', n: 12, k: 2, legs: ['1/6', '7/12'], predict: true },
    { id: 'a4', n: 6, k: 0, loop: true, legs: ['1/1', '5/6'], predict: true },
  ] },
});

/* ── Fractions entières (petits entiers) ─────────────────────────────────────────────────────── */

const arabicToLatin = (v) => String(v ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[⁦⁩\s]/g, '').replace('٫', ',').replace(/[−–]/g, '-').replace('⁄', '/');
/** « 5/12 » ou « -2/5 » ou « 1 » → { num, den, sign } (num ≥ 0). */
function parseLeg(txt) {
  const raw = arabicToLatin(txt);
  const m = /^(-?)(\d+)(?:\/(\d+))?$/.exec(raw);
  if (!m) return null;
  const den = m[3] ? Number(m[3]) : 1;
  if (den === 0) return null;
  return { num: Number(m[2]), den, dir: m[1] ? -1 : 1 };
}
/** Un écrit de l'élève : « 8/12 », « ٨/١٢ », « 2/3 », « 1 » → { num, den } ou null. */
function parseWriting(txt) {
  const p = parseLeg(txt);
  return p && p.dir === 1 ? { num: p.num, den: p.den } : null;
}
const sameValue = (a, b) => a.num * b.den === b.num * a.den;

/* ── Le sentier : paramétré par la longueur d'arc (des fractions égales = des longueurs égales) ── */

const SAMPLES = 480;
/** Le sentier d'une scène W × H : `at(t)` (t en tours, boucle → modulo 1) → { x, y, ang } ; `project(x, y)` → t dans [0, 1). */
export function makePath(W, H, loop = false) {
  const raw = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const s = i / SAMPLES;
    if (loop) {
      const a = s * Math.PI * 2 - Math.PI / 2;
      raw.push([W / 2 + Math.cos(a) * (W / 2 - 70), H / 2 + 12 + Math.sin(a) * (H / 2 - 58)]);
    } else {
      const x = 56 + s * (W - 112);
      raw.push([x, H / 2 + 8 - Math.sin(s * Math.PI * 2.2 + 0.35) * (H / 2 - 54) * (0.55 + 0.45 * Math.sin(s * Math.PI))]);
    }
  }
  const cum = [0];
  for (let i = 1; i < raw.length; i += 1) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const len = cum[cum.length - 1];
  const at = (t) => {
    let u = loop ? ((t % 1) + 1) % 1 : Math.max(0, Math.min(1, t));
    if (loop && t > 0 && u === 0) u = 0;
    const d = u * len;
    let lo = 0; let hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
    const seg = cum[hi] - cum[lo] || 1;
    const f = (d - cum[lo]) / seg;
    const x = raw[lo][0] + (raw[hi][0] - raw[lo][0]) * f;
    const y = raw[lo][1] + (raw[hi][1] - raw[lo][1]) * f;
    return { x, y, ang: Math.atan2(raw[hi][1] - raw[lo][1], raw[hi][0] - raw[lo][0]) };
  };
  const project = (x, y) => {
    let best = 0; let bd = Infinity;
    for (let i = 0; i < raw.length; i += 1) { const d = (raw[i][0] - x) ** 2 + (raw[i][1] - y) ** 2; if (d < bd) { bd = d; best = i; } }
    return cum[best] / len;
  };
  const d = 'M' + raw.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  const sub = (t0, t1, steps = 40) => {
    const a = Math.min(t0, t1); const b = Math.max(t0, t1);
    const out = [];
    for (let i = 0; i <= steps; i += 1) { const p = at(a + ((b - a) * i) / steps); out.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`); }
    return 'M' + out.join(' L');
  };
  return { at, project, len, d, sub };
}

/* ── Tâches ──────────────────────────────────────────────────────────────────────────────────── */

function buildTask(rawTask, i) {
  const n = Number(rawTask.n);
  const k = Number(rawTask.k ?? 0);
  if (!Number.isInteger(n) || n < 2 || n > 24) throw new Error(`trailOdometer: n illisible ${JSON.stringify(rawTask)}`);
  if (k && (k < 2 || n % k !== 0)) throw new Error(`trailOdometer: k ne divise pas n ${JSON.stringify(rawTask)}`);
  const startF = rawTask.start ? parseLeg(rawTask.start) : { num: 0, den: 1, dir: 1 };
  if (!startF || n % startF.den !== 0) throw new Error(`trailOdometer: départ illisible ${JSON.stringify(rawTask)}`);
  const start = (startF.num * n) / startF.den;
  const legs = rawTask.legs.map((txt) => {
    const p = parseLeg(txt);
    if (!p || n % p.den !== 0) throw new Error(`trailOdometer: étape illisible « ${txt} »`);
    const red = k && p.den === n / k && p.den !== n;
    return Object.freeze({ num: p.num, den: p.den, dir: p.dir, posts: (p.num * n) / p.den, kind: red ? 'red' : p.den === 1 ? 'whole' : 'fine' });
  });
  const targets = [];
  let at = start;
  for (const l of legs) { at += l.dir * l.posts; targets.push(at); }
  if (targets.some((t) => t < 0)) throw new Error('trailOdometer: étape négative');
  const loop = !!rawTask.loop;
  const laps = loop ? 2 : 1;
  const max = n * laps;
  if (targets.some((t) => t > max)) throw new Error('trailOdometer: au-delà du sentier');
  const end = targets[targets.length - 1];
  const fields = rawTask.predict ? (loop || end > n ? ['pos'] : ['pos', 'rest']) : ['pos'];
  return Object.freeze({
    id: rawTask.id ?? `t${i}`, n, k, m: k ? n / k : 0, legs: Object.freeze(legs), start, startFrac: startF, targets: Object.freeze(targets), end, loop, laps, max,
    predict: !!rawTask.predict, fields, hasRed: !!k && legs.some((l) => l.kind === 'red'),
  });
}

function initW(task) {
  return { pos: task.start, li: 0, phase: task.predict ? 'predict' : 'walk', predicted: {}, written: null, touched: false, miss: null };
}
function fresh(tasks, extra = {}) {
  return { tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, free: null, flag: null, ...extra };
}
export function init(numbers = {}) {
  return fresh((numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask));
}

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => (s.free ? !!s.free.done : !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

/** Le sentier est verrouillé tant que l'élève n'a pas écrit sa prédiction (متقدم). */
export const hikerLocked = (s) => s.w.phase === 'predict' || s.w.phase === 'write' || s.w.phase === 'done';
export const counters = (s) => {
  const t = taskOf(s); const pos = s.w.pos;
  return { white: pos, red: t.k ? Math.floor(pos / t.k) : 0, leftover: t.k ? pos % t.k : 0, hasRed: !!t.k };
};
export const legsState = (s) => taskOf(s).legs.map((l, i) => (i < s.w.li ? 'done' : i === s.w.li && s.w.phase === 'walk' ? 'current' : 'todo'));
const arrivalFrac = (task) => ({ num: task.end, den: task.n });
const restFrac = (task) => ({ num: task.n - task.end, den: task.n });

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

export function setPos(s, p) {
  if (hikerLocked(s)) return s;
  const t = taskOf(s);
  const pos = Math.max(0, Math.min(t.max, Math.round(p)));
  if (pos === s.w.pos) return s;
  return { ...s, w: { ...s.w, pos, touched: true, miss: null }, last: null };
}
export const nudge = (s, d) => setPos(s, s.w.pos + d);
export const nudgeRed = (s, d) => { const t = taskOf(s); return t.k ? setPos(s, s.w.pos + d * t.k) : s; };
/** Glisser sur le sentier : t_proj dans [0, 1) → le poteau blanc le plus proche, au tour le plus proche de la position actuelle. */
export function dragTo(s, tProj) {
  if (hikerLocked(s)) return s;
  const t = taskOf(s);
  let best = null;
  for (let lap = 0; lap < t.laps + 1; lap += 1) {
    const cand = Math.round((tProj + lap) * t.n);
    if (cand < 0 || cand > t.max) continue;
    if (best == null || Math.abs(cand - s.w.pos) < Math.abs(best - s.w.pos)) best = cand;
  }
  return best == null ? s : setPos(s, best);
}

/** « وصلنا » : l'étape courante est jugée. */
export function arrive(s) {
  if (s.w.phase !== 'walk') return s;
  const t = taskOf(s);
  const li = s.w.li;
  const want = t.targets[li];
  const ok = s.w.pos === want;
  const trial = Object.freeze({ kind: 'leg', task: s.free ? -1 : s.ti, leg: li, posts: s.w.pos, want, ok, free: !!s.free });
  let next = { ...s, last: trial, trials: [...s.trials, trial] };
  if (!ok) return { ...next, w: { ...s.w, miss: s.w.pos < want ? 'short' : 'long' } };
  const nli = li + 1;
  if (nli < t.legs.length) return { ...next, w: { ...s.w, li: nli, miss: null } };
  if (t.predict) return solve({ ...next, w: { ...s.w, li: nli, miss: null, phase: 'done' } });
  return { ...next, w: { ...s.w, li: nli, miss: null, phase: 'write' } };
}
function solve(s) {
  const sv = Object.freeze({ kind: 'solved', task: s.free ? -1 : s.ti, free: !!s.free });
  return { ...s, trials: [...s.trials, sv], ...(s.free ? { free: { ...s.free, done: true } } : { done: { ...s.done, [s.ti]: true } }) };
}

/**
 * Juge une écriture : { ok, model: 'right' | 'across' | 'noScale' | 'natural' | 'part' | 'other', flagAt }. `field` : 'pos' (où est-on ?) ou 'rest' (combien reste-t-il ?).
 * `flagAt` : la position (en tours) où cette écriture serait sur le sentier, pour la dessiner.
 */
export function judgeWriting(task, text, field = 'pos') {
  const w = parseWriting(text);
  if (!w) return { ok: false, model: 'other', flagAt: null, unreadable: true };
  const val = w.num / w.den;
  const right = field === 'rest' ? restFrac(task) : arrivalFrac(task);
  if (sameValue(w, right)) return { ok: true, model: 'right', flagAt: null, value: val };
  const legs = [...(task.start ? [{ num: task.startFrac.num, den: task.startFrac.den, dir: 1 }] : []), ...task.legs];
  const sn = legs.reduce((a, l) => a + l.dir * l.num, 0);
  const sd = legs.reduce((a, l) => a + l.den, 0);
  const wrongs = [];
  if (field === 'pos') {
    if (sd > 0) wrongs.push(['across', { num: sn, den: sd }]);                                   // numérateurs et dénominateurs additionnés
    if (task.loop) wrongs.push(['natural', { num: sn, den: task.n }]);                           // n + a/b = (n + a)/b
    else wrongs.push(['noScale', { num: sn, den: task.n }]);                                     // le rouge compté comme un blanc
  } else {
    wrongs.push(['part', arrivalFrac(task)]);                                                    // la part donnée pour le reste
  }
  const hit = wrongs.find(([, f]) => f.den > 0 && f.num >= 0 && sameValue(w, f));
  const flagAt = Math.max(0, Math.min(task.laps, val));
  return { ok: false, model: hit ? hit[0] : 'other', flagAt, value: val };
}

/** Écrit une réponse (`pos` ou `rest`). En phase 'predict' : prédiction avant de marcher ; en phase 'write' : l'écriture finale. */
export function write(s, field, text) {
  const t = taskOf(s);
  if (s.w.phase !== 'predict' && s.w.phase !== 'write') return s;
  if (!t.fields.includes(field)) return s;
  const j = judgeWriting(t, text, field);
  const predicting = s.w.phase === 'predict';
  const trial = Object.freeze({ kind: predicting ? 'predict' : 'writing', task: s.free ? -1 : s.ti, field, value: String(text).trim(), ok: j.ok, model: j.model, free: !!s.free });
  let next = { ...s, last: trial, trials: [...s.trials, trial], flag: j.ok || j.flagAt == null ? null : { at: j.flagAt, model: j.model, text: String(text).trim(), field } };
  if (!j.ok) return next;
  if (predicting) {
    const predicted = { ...s.w.predicted, [field]: true };
    const all = t.fields.every((f) => predicted[f]);
    return { ...next, w: { ...s.w, predicted, phase: all ? 'walk' : 'predict' }, flag: null };
  }
  return solve({ ...next, w: { ...s.w, written: String(text).trim(), phase: 'done' }, flag: null });
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null, flag: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, flag: null, ...(s.free ? { free: { ...s.free, done: false } } : { done: { ...s.done, [s.ti]: false } }) });

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** a/b ± c/d, b et d de 2 à 24, l'un multiple de l'autre ; résultat de 0 (exclu) à 1. */
export function freeCheck(aT, bT, cT, dT, op = '+') {
  const nat = (v) => { const r = arabicToLatin(v); return /^\d{1,2}$/.test(r) ? Number(r) : null; };
  const a = nat(aT); const b = nat(bT); const c = nat(cT); const d = nat(dT);
  if ([a, b, c, d].some((v) => v == null)) return { ok: false, why: 'incomplete' };
  if (b < 2 || b > 24 || d < 2 || d > 24 || a < 1 || c < 1) return { ok: false, why: 'range' };
  if (!F.isMultipleCase(b, d)) return { ok: false, why: 'unrelated' };
  const n = Math.max(b, d);
  const total = (a * n) / b + (op === '-' ? -1 : 1) * ((c * n) / d);
  if (total <= 0) return { ok: false, why: 'negative' };
  if (total > n) return { ok: false, why: 'tooBig' };
  return { ok: true, n, a, b, c, d, op };
}
export function freeTask(s, aT, bT, cT, dT, op = '+') {
  const r = freeCheck(aT, bT, cT, dT, op);
  if (!r.ok) return s;
  const k = r.b === r.d ? 0 : Math.max(r.b, r.d) / Math.min(r.b, r.d);
  const task = buildTask({ id: 'free', n: r.n, k, legs: [`${r.a}/${r.b}`, `${r.op === '-' ? '-' : ''}${r.c}/${r.d}`] }, 0);
  const custom = Object.freeze({ kind: 'custom', free: true, a: r.a, b: r.b, c: r.c, d: r.d, op: r.op });
  return { ...s, free: { task, done: false }, w: initW(task), last: null, flag: null, trials: [...s.trials, custom] };
}
/** Une prédiction libre : dessine seulement le drapeau (jamais un verdict). */
export function freeFlag(s, text) {
  const w = parseWriting(text);
  if (!w) return { ...s, flag: null };
  const t = taskOf(s);
  return { ...s, flag: { at: Math.max(0, Math.min(t.laps, w.num / w.den)), model: 'free', text: String(text).trim(), field: 'pos' } };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, w: initW(s.tasks[s.ti]), last: null, flag: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-to-next]', gesture: 'tap' } : null;
  const t = taskOf(s);
  if (s.w.phase === 'predict') return { id: 'predict', target: '[data-to-write]', gesture: 'tap' };
  if (s.w.phase === 'write') return { id: 'write', target: '[data-to-write]', gesture: 'tap' };
  const leg = t.legs[s.w.li];
  if (!s.w.touched && s.w.li === 0 && guidedTrials(s).length === 0) return { id: 'walk', target: '[data-to-hiker]', gesture: 'drag' };
  if (leg?.kind === 'red' && t.hasRed && !guidedTrials(s).some((x) => x.kind === 'leg' && t.legs[x.leg]?.kind === 'red')) return { id: 'red', target: '[data-to-red-plus]', gesture: 'tap' };
  return { id: 'arrive', target: '[data-to-arrive]', gesture: 'tap' };
}
