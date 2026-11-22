/**
 * bridge-load — LA LOGIQUE PURE de « حمولة الجسر » (2AM, unité 4 « مفهوم معادلة », درس « اختبار مساواة أو متباينة », 2026-10-29).
 *
 * LE MODÈLE. Un camion de matériaux de construction doit passer le pont d'un oued. Avant le pont, un pèse-camion LIT la règle de la pancarte (« la masse totale est
 * plus petite que 5000 kg ») et l'ESSAI se fait comme dans le cahier : on COMPTE les sacs posés sur la benne (x sacs de ciment de 50 kg, y sacs de sable de 40 kg),
 * l'écran écrit la substitution (« 4000 + 50 × 15 = 4750 ») puis la comparaison (« 4750 < 5000 ؟ »). Tout est entier ; les maths (lire une relation, substituer, calculer
 * les deux membres, comparer) viennent de `packages/core/arithmetic/equation2.js` E3 (`parseRelation`, `testAt`), importé PAR CHEMIN.
 *
 * TÂCHE : { id, rule, loads?, cards?, kind?: 'claim', predict?, at? }.
 *   `rule`   une relation ASCII à UN signe (« 4000+50x<5000 », « 4500+50x+40y<=7000 », « 3000+70x=3600+50x ») ; si l'autre membre porte une lettre, la scène a DEUX voies
 *            (camion A = membre gauche, camion B = membre droit, UNE charge x pour les deux).
 *   `loads`  les charges DONNÉES à essayer l'une après l'autre (nombres, ou [x, y]) : pour chacune l'élève charge, passe au pèse-camion, puis répond à la question
 *            (« تعبر ؟ » / « نفس الكتلة ؟ ») AVANT que la barrière ne bouge.
 *   `cards`  les charges proposées comme CARTES : l'élève les glisse sur la benne une à une, puis coche celles qui passent.
 *   kind 'claim' (متقدم) : une affirmation « toujours vraie » ; l'élève cherche UNE charge qui la réfute (le juge : la relation est FAUSSE en ce point) ; `predict` : l'écran reste
 *            masqué jusqu'à ce que l'élève ait tapé les valeurs des DEUX membres.
 * Phases (`w.phase`) : 'bed' (charger, passer au pèse-camion) · 'predict' (écran masqué, taper les deux membres) · 'ask' (la charge demandée est pesée : verdict à donner) ·
 * 'ok' (verdict juste, charge suivante) · 'cards' (cocher les charges qui passent) · 'done'.
 *
 * ÉVÉNEMENTS (`state.trials`) : { kind:'weigh', task, x, y, holds, free } · { kind:'predict', task, ok, a, b } · { kind:'verdict', task, answer, ok } ·
 * { kind:'cards', task, ticked, ok } · { kind:'counter', task, x, ok } · { kind:'solved', task, free } · { kind:'custom', free:true }.
 */
import { parseRelation, testAt } from '@smarter-academy/core/arithmetic/equation2.js';

export const COUNT_MAX = 60;
export const FREE_RANGE = { e: { min: 0, max: 9000, step: 500 }, a: { min: 10, max: 100, step: 10 }, b: { min: 10, max: 100, step: 10 }, s: { min: 500, max: 12000, step: 500 } };
export const SIGNS = Object.freeze(['<', '≤', '=']);

/** La tâche du module « معارف » (poser seule, `levels={false}`) : la règle de b1 et une première pesée à x = 12 (4000 + 50 × 12 = 4600 < 5000). */
export const K1_TASK = Object.freeze({ id: 'k1', rule: '4000+50x<5000', loads: Object.freeze([12]) });

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', rule: '4000+50x<5000', loads: [15, 22], cards: [18, 19, 20, 21] },
    { id: 'b2', rule: '4500+50x+40y<7000', loads: [[20, 30], [30, 25], [25, 35]] },
    { id: 'b3', rule: '3000+70x=3600+50x', loads: [20, 30, 40] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'claim', rule: '3000+70x<3600+50x', predict: true },
    { id: 'a2', kind: 'claim', rule: '2000+100x=2400+60x', predict: true, at: 10 },
    { id: 'a3', rule: '4500+50x+40y<=7000', cards: [[10, 40], [30, 25], [40, 15], [25, 30]] },
  ] },
});

const num = (r) => Number(r.n) / Number(r.d);
const ARABIC = '٠١٢٣٤٥٦٧٨٩';
/** Un entier tapé (chiffres arabes ou latins, espaces tolérés) → nombre, ou null. */
function readInt(text) {
  const t = String(text ?? '').replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d))).replace(/[\s⁦⁩]/g, '');
  return /^\d{1,6}$/.test(t) ? Number(t) : null;
}

/** « 3000+70x » → « 3000 + 70x » (lisible ; la lettre reste x / y). */
export const pretty = (text) => String(text).replace(/\s+/g, '').replace(/\+/g, ' + ').replace(/-/g, ' − ').trim();
const coef = (txt, letter) => { const m = new RegExp(`(\\d+)\\*?${letter}`).exec(txt); return m ? Number(m[1]) : null; };
const emptyOf = (txt) => { const m = /^(\d+)/.exec(txt.replace(/\s+/g, '')); return m ? Number(m[1]) : 0; };

/** L'essai exact d'une règle (texte) pour une charge (x, y) → { holds, left, right, lines: { a, b, cmp } }. */
function weighRule(rule, x, y = 0) {
  const r = testAt(rule, { x, y });
  return { holds: r.holds, left: num(r.leftValue), right: num(r.rightValue), lines: { a: r.lines.leftEq, b: r.lines.rightEq, cmp: r.lines.cmp } };
}
export const weighAt = (task, x, y = 0) => weighRule(task.rule, x, y);

const asLoad = (v) => (Array.isArray(v) ? { x: v[0], y: v[1] } : { x: v, y: 0 });
const okCount = (v) => Number.isInteger(v) && v >= 0 && v <= COUNT_MAX;

export function buildTask(raw, i = 0) {
  const rel = parseRelation(raw.rule);
  const twoUnknowns = /y/.test(raw.rule);
  const lanes = /[xy]/.test(rel.rightText);
  const kind = raw.kind === 'claim' ? 'claim' : 'verdict';
  const loads = (raw.loads ?? []).map(asLoad);
  const cards = (raw.cards ?? []).map(asLoad);
  for (const l of [...loads, ...cards]) if (!okCount(l.x) || !okCount(l.y)) throw new Error('bridgeLoad: charge hors 0 … 60');
  if (kind === 'verdict' && !loads.length && !cards.length) throw new Error('bridgeLoad: une tâche demande des charges ou des cartes');
  const task = {
    id: raw.id ?? `b${i}`, kind, rule: raw.rule, rel: rel.rel, leftText: rel.leftText, rightText: rel.rightText, twoUnknowns, lanes,
    predict: !!raw.predict, at: raw.at ?? null, loads, cards,
    empty: emptyOf(rel.leftText), kgX: coef(rel.leftText, 'x'), kgY: coef(rel.leftText, 'y'),
    limit: lanes ? null : Number(String(rel.rightText).replace(/\s+/g, '')),
    laneInfo: lanes ? [{ id: 'A', text: rel.leftText, empty: emptyOf(rel.leftText), kg: coef(rel.leftText, 'x') }, { id: 'B', text: rel.rightText, empty: emptyOf(rel.rightText), kg: coef(rel.rightText, 'x') }] : null,
  };
  task.pass = cards.map((c) => weighAt(task, c.x, c.y).holds);
  task.loadsHold = loads.map((c) => weighAt(task, c.x, c.y).holds);
  if (kind === 'claim' && !counterexamples(task).length) throw new Error('bridgeLoad: une affirmation sans contre-exemple n’est pas une affirmation à réfuter');
  return Object.freeze(task);
}

/** Les charges x (0 … 60) qui RÉFUTENT une affirmation : la relation y est fausse. */
export function counterexamples(task) {
  const out = [];
  for (let x = 0; x <= COUNT_MAX; x += 1) if (!weighAt(task, x, 0).holds) out.push(x);
  return out;
}

const initW = (task) => ({
  x: 0, y: 0, k: 0, phase: task.loads.length || task.kind === 'claim' ? 'bed' : 'cards',
  screen: null, pending: null, judged: false, picked: [], miss: null, cw: 0,
});
const fresh = (tasks, extra = {}) => ({ tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, free: null, ...extra });
export function init(numbers = {}) { return fresh((numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask)); }

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const levelOf = (s) => (s.tasks.some((t) => t.kind === 'claim' || t.predict || t.rel === '≤') ? 'advanced' : 'beginner');
export const target = (s) => { const t = taskOf(s); return t.loads[s.w.k] ?? null; };
export const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);
export const trialEvidence = (tr) => ({ ...tr });

const rec = (s, ev) => ({ ...s, trials: [...s.trials, Object.freeze(ev)] });
const tid = (s) => (s.free ? -1 : s.ti);
const clamp = (v) => Math.max(0, Math.min(COUNT_MAX, Math.round(v)));

/** La charge courante de la benne (guidée ou libre). */
export const bedOf = (s) => (s.free ? { x: s.free.x, y: s.free.y } : { x: s.w.x, y: s.w.y });

/* ── Gestes : la main charge et décharge les sacs ────────────────────────────────────────────── */

const LOCKED = new Set(['ok', 'done']);
const unweighed = (w, extra = {}) => ({ ...w, screen: null, pending: null, judged: false, miss: null, phase: w.phase === 'ask' || w.phase === 'predict' ? 'bed' : w.phase, ...extra });

/** Ajoute `delta` sacs (+1, −1, +5, −5 …) de la sorte `kind` ('x' ciment · 'y' sable). */
export function load(s, kind, delta) {
  const key = kind === 'y' ? 'y' : 'x';
  if (s.free) return setFree(s, { [key]: s.free[key] + delta });
  const t = taskOf(s);
  if (LOCKED.has(s.w.phase) || (key === 'y' && !t.twoUnknowns)) return s;
  const v = clamp(s.w[key] + delta);
  if (v === s.w[key]) return s;
  return { ...s, w: unweighed(s.w, { [key]: v }), last: null };
}
/** Pose exactement `v` sacs (un geste de pointeur, une carte déposée). */
function setCount(s, kind, v) { const key = kind === 'y' ? 'y' : 'x'; return load(s, key, clamp(v) - (s.free ? s.free[key] : s.w[key])); }
export function setBed(s, x, y = 0) { return setCount(setCount(s, 'x', x), 'y', y); }

/** « اعبر إلى الميزان » : le pèse-camion écrit la substitution de la charge présente sur la benne. */
export function pressWeigh(s) {
  if (s.free) return freeWeigh(s);
  const t = taskOf(s); const w = s.w;
  if (LOCKED.has(w.phase) || w.phase === 'predict') return s;
  const res = weighAt(t, w.x, w.y);
  const ev = { kind: 'weigh', task: s.ti, x: w.x, y: w.y, holds: res.holds, free: false };
  const next = rec({ ...s, last: Object.freeze(ev) }, ev);
  if (t.predict) return { ...next, w: { ...w, pending: { x: w.x, y: w.y }, screen: null, judged: false, miss: null, phase: 'predict' } };
  return { ...next, ...reveal(next, w.x, w.y, res, null) };
}

/** L'écran apparaît pour la charge (x, y) — et, si la charge est celle qu'on demandait, la question de verdict s'ouvre. */
function reveal(s, x, y, res, predicted) {
  const t = taskOf(s); const w = s.w;
  const want = w.phase === 'bed' || w.phase === 'predict' ? t.loads[w.k] : null;
  const on = !!want && want.x === x && want.y === y;
  const swap = !!want && !on && t.twoUnknowns && want.x === y && want.y === x && x !== y;
  const screen = Object.freeze({ x, y, ...res, on, swap, predicted });
  const phase = w.phase === 'cards' ? 'cards' : on ? 'ask' : 'bed';
  return { w: { ...w, screen, pending: null, judged: false, miss: null, phase } };
}

/** متقدم : l'écran était masqué ; l'élève tape la valeur des deux membres, puis l'écran répond (juste ou non, la vraie ligne apparaît). */
export function predict(s, aText, bText) {
  const w = s.w;
  if (s.free || w.phase !== 'predict' || !w.pending) return s;
  const { x, y } = w.pending;
  const res = weighAt(taskOf(s), x, y);
  const a = readInt(aText); const b = readInt(bText);
  if (a == null || b == null) return { ...s, w: { ...w, miss: { unreadable: true } } };
  const ok = a === res.left && b === res.right;
  const ev = { kind: 'predict', task: s.ti, ok, a, b, free: false };
  const next = rec({ ...s, last: Object.freeze(ev) }, ev);
  return { ...next, ...reveal({ ...next, w: { ...w, phase: 'bed' } }, x, y, res, Object.freeze({ a, b, ok })) };
}

/* ── Le verdict, AVANT que la barrière ne bouge ─────────────────────────────────────────────── */

/** `answer` : true = « نعم / تعبر / نفس الكتلة », false = « لا ». Le monde dit la VÉRITÉ après toute réponse ; seule une réponse juste fait avancer. */
export function judgeVerdict(s, answer) {
  const w = s.w;
  if (s.free || w.phase !== 'ask' || !w.screen) return s;
  const ok = !!answer === w.screen.holds;
  const ev = { kind: 'verdict', task: s.ti, answer: !!answer, ok, free: false };
  const next = rec({ ...s, last: Object.freeze(ev) }, ev);
  if (!ok) return { ...next, w: { ...w, judged: true, miss: { verdict: !!answer } } };
  const t = taskOf(s);
  const lastLoad = w.k >= t.loads.length - 1;
  if (!lastLoad) return { ...next, w: { ...w, judged: true, miss: null, phase: 'ok' } };
  if (t.cards.length) return { ...next, w: { ...w, judged: true, miss: null, phase: 'ok', k: w.k } };
  return solve({ ...next, w: { ...w, judged: true, miss: null } });
}
/** « الحمولة التالية » (après un verdict juste) ; après la dernière charge d'une tâche à cartes : les cartes. */
export function nextLoad(s) {
  const w = s.w; const t = taskOf(s);
  if (s.free || w.phase !== 'ok') return s;
  const more = w.k < t.loads.length - 1;
  if (more) return { ...s, w: { ...initW(t), k: w.k + 1 }, last: null };
  return { ...s, w: { ...initW(t), k: w.k, phase: 'cards' }, last: null };
}
/** Le bouton qui suit un verdict juste : « الحمولة التالية » ou « إلى البطاقات ». */
export const afterOk = (s) => (s.w.phase === 'ok' ? (s.w.k < taskOf(s).loads.length - 1 ? 'load' : 'cards') : null);

/* ── Les cartes : on les glisse sur la benne (pesée), puis on COCHE celles qui passent ───────── */

export function dropCard(s, i) {
  const t = taskOf(s);
  if (s.free || s.w.phase !== 'cards' || !t.cards[i]) return s;
  const c = t.cards[i];
  return pressWeigh({ ...s, w: { ...s.w, x: c.x, y: c.y, screen: null, miss: null, judged: false, cw: s.w.cw + 1 } });
}
export function toggleCard(s, i) {
  if (s.free || s.w.phase !== 'cards') return s;
  const has = s.w.picked.includes(i);
  return { ...s, w: { ...s.w, picked: has ? s.w.picked.filter((c) => c !== i) : [...s.w.picked, i], miss: null }, last: null };
}
/** → { ok, wrong: [indices cochées à tort], missing: [indices qui passent et ne sont pas cochées] } */
export function judgeCards(task, ticked) {
  const wrong = ticked.filter((i) => !task.pass[i]);
  const missing = task.pass.map((p, i) => (p && !ticked.includes(i) ? i : -1)).filter((i) => i >= 0);
  return { ok: !wrong.length && !missing.length, wrong, missing };
}
export function checkCards(s) {
  const t = taskOf(s);
  if (s.free || s.w.phase !== 'cards') return s;
  const ticked = [...s.w.picked].sort((a, b) => a - b);
  const j = judgeCards(t, ticked);
  const ev = { kind: 'cards', task: s.ti, ticked, ok: j.ok, free: false };
  const next = rec({ ...s, last: Object.freeze(ev) }, ev);
  return j.ok ? solve(next) : { ...next, w: { ...s.w, miss: { cards: j } } };
}

/* ── Les affirmations : UNE charge qui les réfute suffit ────────────────────────────────────── */

/** Le juge d'un contre-exemple : la relation est FAUSSE pour la charge pesée. → { ok, weighed } */
export function judgeCounter(s) {
  const sc = s.w.screen;
  if (!sc) return { ok: false, weighed: false };
  return { ok: !sc.holds, weighed: true };
}
export function pressCounter(s) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'claim' || s.w.phase !== 'bed' || !s.w.screen) return s;
  const j = judgeCounter(s);
  const ev = { kind: 'counter', task: s.ti, x: s.w.screen.x, ok: j.ok, free: false };
  const next = rec({ ...s, last: Object.freeze(ev) }, ev);
  return j.ok ? solve({ ...next, w: { ...s.w, judged: true, miss: null } }) : { ...next, w: { ...s.w, judged: true, miss: { agrees: true } } };
}

function solve(s) {
  const sv = Object.freeze({ kind: 'solved', task: tid(s), free: false });
  return { ...s, w: { ...s.w, phase: 'done', miss: null }, trials: [...s.trials, sv], done: { ...s.done, [s.ti]: true } };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, done: { ...s.done, [s.ti]: false } });

/* ── « جرّب أعدادك » : toujours ouvert, jamais compté ─────────────────────────────────────────── */

export const freeRule = (f) => `${f.e}+${f.a}x+${f.b}y${f.sign === '≤' ? '<=' : f.sign}${f.s}`;
export function freeTask(s) {
  const free = { e: 4000, a: 50, b: 40, s: 7000, sign: '<', x: 10, y: 10, screen: null };
  return { ...s, free, last: null, trials: [...s.trials, Object.freeze({ kind: 'custom', free: true })] };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, last: null } : s);
export function setFree(s, patch) {
  if (!s.free) return s;
  const c = (v, r) => Math.max(r.min, Math.min(r.max, Math.round(v / r.step) * r.step));
  const f = { ...s.free };
  for (const key of ['e', 'a', 'b', 's']) if (key in patch) f[key] = c(patch[key], FREE_RANGE[key]);
  for (const key of ['x', 'y']) if (key in patch) f[key] = clamp(patch[key]);
  if ('sign' in patch && SIGNS.includes(patch.sign)) f.sign = patch.sign;
  f.screen = null;
  return { ...s, free: f, last: null };
}
function freeWeigh(s) {
  const f = s.free; const res = weighRule(freeRule(f), f.x, f.y);
  const ev = { kind: 'weigh', task: -1, x: f.x, y: f.y, holds: res.holds, free: true };
  return rec({ ...s, free: { ...f, screen: Object.freeze({ x: f.x, y: f.y, ...res, on: false, swap: false, predicted: null }) }, last: Object.freeze(ev) }, ev);
}

/* ── La phase formelle : les nombres de l'élève, écrits comme dans le cahier ─────────────────── */

const texLine = (line) => String(line).replace(/ /g, '').replace(/×/g, '\\times').replace(/≤/g, '\\le').replace(/≥/g, '\\ge').replace(/−/g, '-');
/** Les lignes KaTeX d'une tâche (une charge qui compte : la première qui passe, sinon la première). → [{ tex, note }] */
export function formalLines(task) {
  if (task.kind === 'claim') {
    const x = counterexamples(task)[0];
    const r = weighAt(task, x, 0);
    return [{ tex: `${texLine(r.lines.a)}\\quad ${texLine(r.lines.b)}`, note: 'counter', x }];
  }
  const list = task.loads.length ? task.loads : task.cards;
  const idx = (task.loads.length ? task.loadsHold : task.pass).findIndex(Boolean);
  const c = list[Math.max(0, idx)];
  const r = weighAt(task, c.x, c.y);
  return task.lanes
    ? [{ tex: `${texLine(r.lines.a)}\\quad ${texLine(r.lines.b)}`, note: r.holds ? 'holds' : 'fails', x: c.x }]
    : [{ tex: `${texLine(r.lines.a)}\\quad ${texLine(r.lines.cmp)}`, note: r.holds ? 'holds' : 'fails', x: c.x, y: c.y }];
}

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free) return null;
  if (discoveryReady(s)) return { id: 'free', target: '[data-bl-free-start]', gesture: 'tap' };
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-bl-next]', gesture: 'tap' } : null;
  const t = taskOf(s); const w = s.w; const first = s.ti === 0;
  const empty = w.x === 0 && w.y === 0;
  if (w.phase === 'cards') return w.cw === 0 ? { id: 'cards', target: '[data-bl-cards]', gesture: 'drag' } : null;
  if (w.phase === 'bed' || w.phase === 'predict' || w.phase === 'ask') {
    if (t.lanes && first && empty && !w.screen) return { id: 'twin', target: '[data-bl-load]', gesture: 'drag' };
    if (t.kind === 'claim' && w.screen && !w.judged) return { id: 'claim', target: '[data-bl-counter]', gesture: 'tap' };
    if (empty && !w.screen && first && w.k === 0) return { id: 'load', target: '[data-bl-sack][data-kind="cement"][data-n="1"]', gesture: 'drag' };
    if (!w.screen && w.phase === 'bed' && !empty && first && w.k === 0 && !guidedTrials(s).length) return { id: 'weigh', target: '[data-bl-weigh]', gesture: 'tap' };
    if (w.screen && first && w.k === 0 && !w.judged && guidedTrials(s).length === 1) return { id: 'screen', target: '[data-bl-screen]', gesture: 'tap' };
  }
  return null;
}
