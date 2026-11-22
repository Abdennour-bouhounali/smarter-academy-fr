/**
 * corniche-ruler — LA LOGIQUE PURE de « مسطرة الكورنيش » (2AM, unité 3 « الأعداد النسبية », درس « التعليم على مستقيم مدرّج », 2026-10-29).
 * Exacte : positions et valeurs sont des BigInt en CENTIÈMES de mètre ; les maths viennent de `packages/core/arithmetic/relative.js`
 * (E1 : `abscissaOf`, `opposite`, `boardFit`, `smallestStep`, importé PAR CHEMIN).
 *
 * LE MODÈLE. Une planche graduée de 13 graduations (−6 … +6) est fixée sous des repères du front de mer (positions MONDE cachées, en mètres).
 * L'abscisse d'un repère est une SORTIE : (sa position monde) − (la position de l'origine). La MAIN tient
 *   مبتدئ — l'ORIGINE : le dernier dépôt du drapeau « 0 » (la graduation vaut 10 m) ; l'élève ÉCRIT ensuite l'abscisse d'un repère ;
 *   متقدم — la VALEUR D'UNE GRADUATION (le levier à crans) ; l'origine est fixe sous la fontaine ; l'élève fixe la graduation (les
 *           nombres de la planche restent voilés jusqu'à la fixer) puis TOUCHE la graduation de chaque point.
 * Tâches : `read` (origine verrouillée : écrire les abscisses de `ask`), `move` (amener l'origine sous `target`, puis écrire), `opp`
 * (placer l'origine pour que deux repères aient des abscisses OPPOSÉES), `fit` (choisir la graduation, puis toucher).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'pin', task, origin }      { kind:'read', task, landmark, value, ok, model }      { kind:'step', task, step, ok, off, between }
 *   { kind:'tap', task, landmark, cell, ok }      { kind:'solved', task }      { kind:'custom', free:true }
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';

export const HALF = 6;
/** Les crans du levier (mètres par graduation). */
export const NOTCHES = Object.freeze(['0,1', '0,5', '1', '2', '5', '10', '20', '25', '50', '100']);
/** Les repères du front de mer : position monde en mètres (cachée de l'élève). */
const LANDMARKS = Object.freeze({ fountain: '0', kiosk: '30', bench: '-20', lamp: '-40', palm: '20', bus: '-35', fish: '50', bench2: '60' });
const H = (x) => R.parse(x);
const tx = (h) => R.text(h);

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', kind: 'read', pin: '0', ask: ['kiosk', 'bench'] },
    { id: 'b2', kind: 'move', pin: '0', target: '-20', ask: ['kiosk'] },
    { id: 'b3', kind: 'opp', pin: '0', pair: ['lamp', 'palm'] },
    { id: 'b4', kind: 'read', pin: '0', ask: ['bus'] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'fit', marks: [{ id: 'A', x: '-50' }, { id: 'B', x: '75' }, { id: 'C', x: '150' }] },
    { id: 'a2', kind: 'fit', marks: [{ id: 'A', x: '0,3' }, { id: 'B', x: '-0,5' }, { id: 'C', x: '-0,1' }, { id: 'D', x: '0,6' }] },
    { id: 'a3', kind: 'fit', marks: [{ id: 'A', x: '-300' }, { id: 'B', x: '400' }, { id: 'C', x: '600' }] },
  ] },
});

/** Les tâches normalisées en centièmes. Lève si mal formées. */
function normalizeTasks(list) {
  return list.map((t, i) => {
    const id = t.id ?? `t${i}`;
    if (t.kind === 'fit') {
      const marks = t.marks.map((m) => ({ id: m.id, x: H(m.x) }));
      if (marks.length < 1 || marks.length > 4) throw new Error('cornicheRuler: 1 à 4 points');
      return Object.freeze({ id, kind: 'fit', marks, best: R.smallestStep(marks.map((m) => m.x), NOTCHES, HALF) });
    }
    const names = t.kind === 'opp' ? t.pair : t.ask;
    for (const n of names) if (!(n in LANDMARKS)) throw new Error(`cornicheRuler: repère inconnu « ${n} »`);
    const marks = Object.keys(LANDMARKS).map((n) => ({ id: n, x: H(LANDMARKS[n]) }));
    return Object.freeze({ id, kind: t.kind, pin: H(t.pin ?? '0'), target: t.target != null ? H(t.target) : null, ask: t.ask ?? null, pair: t.pair ?? null, marks });
  });
}

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) throw new Error('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], last: null, free: null });
}
function fresh(s) {
  const t = s.tasks[s.ti];
  return { ...s, pin: t.kind === 'fit' ? 0n : t.pin, ai: 0, step: 5, confirmed: false, qi: 0, moved: false, last: null };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const isFit = (s) => (s.free ? true : taskOf(s).kind === 'fit');
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const pinLocked = (s) => !s.free && taskOf(s).kind === 'read';
export const stepText = (s) => NOTCHES[s.step];
export const stepH = (s) => H(NOTCHES[s.step]);
/** Les points de la tâche (ou de « جرّب أعدادك »). */
export const marksOf = (s) => (s.free ? s.free.marks : taskOf(s).marks);
export const markById = (s, id) => marksOf(s).find((m) => m.id === id);
/** L'abscisse (centièmes) d'un repère par rapport à l'origine courante (beginner) ; en fit : sa valeur fixe. */
export const abscissa = (s, id) => (isFit(s) ? markById(s, id).x : R.abscissaOf(markById(s, id).x, s.pin));
/** La cellule (entier, −6 … 6) du point `id` à la graduation courante, et si elle est exactement sur une graduation / hors planche. */
function cellOf(s, id) {
  const x = abscissa(s, id); const st = stepH(s);
  return { cell: x / st, exact: x % st === 0n, off: (x < 0n ? -x : x) > BigInt(HALF) * st, frac: x * 2n / st };
}
export const fit = (s) => R.boardFit(marksOf(s).map((m) => m.x), stepH(s), HALF);
/** Les repères à lire dans la tâche courante. */
const askList = (s) => { const t = taskOf(s); return t.kind === 'opp' || t.kind === 'fit' ? [] : t.ask; };
export const currentAsk = (s) => askList(s)[s.ai] ?? null;
export const currentTap = (s) => (!s.free && isFit(s) && s.confirmed ? marksOf(s)[s.qi]?.id ?? null : null);
/** Une lecture est permise ? (`move` : seulement une fois l'origine sous la cible). */
export const canRead = (s) => { const t = taskOf(s); return !s.free && (t.kind === 'read' || (t.kind === 'move' && s.pin === t.target)); };

/* ── Gestes : l'origine ── */
export function setPin(s, pin) {
  if (pinLocked(s) || isFit(s)) return s;
  const slot = BigInt(Math.max(-HALF, Math.min(HALF, Math.round(Number(pin) / 1000)))) * 1000n;
  if (slot === s.pin) return s;
  const next = { ...s, pin: slot, moved: true, ai: s.ai };
  const t = taskOf(s);
  let trial = Object.freeze({ kind: 'pin', task: s.ti, origin: tx(slot) });
  next.trials = [...s.trials, trial]; next.last = trial;
  if (t.kind === 'opp' && !s.done[s.ti]) {
    const [a, b] = t.pair.map((n) => R.abscissaOf(markById(s, n).x, slot));
    const ok = a === -b && a !== 0n;
    trial = Object.freeze({ kind: 'pin', task: s.ti, origin: tx(slot), ok, a: tx(a), b: tx(b), model: ok ? 'right' : 'notOpposite' });
    next.trials = [...s.trials, trial]; next.last = trial;
    if (ok) { next.done = { ...s.done, [s.ti]: true }; next.solved = { ...s.solved, [s.ti]: trial }; }
  }
  return next;
}
export const movePin = (s, dir) => setPin(s, Number(s.pin) + dir * 1000);

/** Les lectures typées : « -30 », « −30 », « ٣٠ ». null si illisible. */
function parseTyped(raw) {
  try {
    const h = R.parse(String(raw ?? '').replace(/[⁦⁩]/g, ''));
    return h;
  } catch { return null; }
}

/** Le jugement d'une lecture : { ok, model, ghost } — `model` ∈ right | unitIgnored | signSide | originFixed | other | format. */
export function judgeRead(s, id, raw) {
  const t = taskOf(s);
  const want = abscissa(s, id);
  const got = parseTyped(raw);
  if (got == null) return { ok: false, model: 'format', want };
  if (got === want) return { ok: true, model: 'right', want, value: got };
  const mark = markById(s, id);
  // 10 m par graduation : « 3 » au lieu de « 30 » = le nombre de graduations sans leur valeur
  const model = want !== 0n && want % 10n === 0n && got === want / 10n ? 'unitIgnored'
    : want !== 0n && got === -want ? 'signSide'
      : t.kind === 'move' && got === mark.x - t.pin ? 'originFixed'
        : 'other';
  return { ok: false, model, want, value: got };
}
/** Un repère fantôme (mètres depuis l'origine) qui MONTRE l'erreur : null si rien à montrer. */
function ghostOf(s, model, value) {
  if (!value && value !== 0n) return null;
  // `at` : la distance (m, signée) depuis l'origine à laquelle le fantôme se tient — celle que l'élève a ÉCRITE
  if (model === 'unitIgnored') return { kind: 'unit', at: value };
  if (model === 'signSide') return { kind: 'mirror', at: value };
  if (model === 'originFixed') return { kind: 'old', at: value };
  return null;
}

export function answerRead(s, raw) {
  if (!canRead(s) || taskDone(s)) return s;
  const id = currentAsk(s);
  const j = judgeRead(s, id, raw);
  const trial = Object.freeze({ kind: 'read', task: s.ti, landmark: id, value: j.value != null ? tx(j.value) : String(raw), ok: j.ok, model: j.model, want: tx(j.want), origin: tx(s.pin), free: false });
  let { done, solved, ai } = s;
  if (j.ok) {
    ai += 1;
    if (ai >= askList(s).length) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; }
  }
  return { ...s, ai, done, solved, trials: [...s.trials, trial], last: trial, ghost: j.ok ? null : ghostOf(s, j.model, j.value) };
}

/* ── Gestes : le levier (متقدم) ── */
export function setStep(s, idx) {
  if (!isFit(s) || (s.confirmed && !s.free) || taskDone(s)) return s;
  const i = Math.max(0, Math.min(NOTCHES.length - 1, idx));
  return i === s.step ? s : { ...s, step: i, last: null };
}
export const stepBy = (s, dir) => setStep(s, s.step + dir);
/** « ثبّت التدريجة » : la graduation est jugée exactement (sur la planche ET sur des graduations). */
export function confirmStep(s) {
  if (!isFit(s) || s.free || s.confirmed) return s;
  const r = fit(s);
  const ok = r.fits && r.between.length === 0;
  const trial = Object.freeze({ kind: 'step', task: s.ti, step: stepText(s), ok, off: r.off.length, between: r.between.length, free: false });
  return { ...s, confirmed: ok, trials: [...s.trials, trial], last: trial };
}
/** Toucher la graduation `cell` pour le point courant. */
export function tapCell(s, cell) {
  const id = currentTap(s);
  if (!id) return s;
  const want = cellOf(s, id).cell;
  const ok = BigInt(cell) === want;
  const trial = Object.freeze({ kind: 'tap', task: s.ti, landmark: id, cell, ok, free: false });
  let { qi, done, solved } = s;
  if (ok) {
    qi += 1;
    if (qi >= marksOf(s).length) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; }
  }
  return { ...s, qi, done, solved, trials: [...s.trials, trial], last: trial };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  return fresh({ ...s, ti: s.ti + 1 });
}
/** « أعِد التجربة » : la MÊME tâche repart de zéro (les essais restent). */
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved), ghost: null });
}

/* ── « جرّب أعدادك » : jusqu'à quatre abscisses, un cran libre ── */
export function parseFree(raw) {
  const parts = String(raw ?? '').replace(/[⁦⁩]/g, '').split(/[\s;؛،]+/).filter(Boolean);
  if (!parts.length || parts.length > 4) return null;
  const out = [];
  for (const p of parts) {
    const h = parseTyped(p);
    if (h == null || (h < 0n ? -h : h) > 999900n) return null;
    out.push({ id: String.fromCharCode(65 + out.length), x: h });
  }
  return out;
}
export function setFree(s, raw) {
  const marks = parseFree(raw);
  if (!marks) return s;
  return { ...s, free: { marks }, confirmed: false, step: s.free ? s.step : 5, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);

/* ── Preuves (onTrial) ── */
export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-cr-next]', gesture: 'tap', prefer: 'below' } : null;
  const t = taskOf(s);
  const mine = s.trials.filter((x) => x.task === s.ti);
  if (t.kind === 'read') return { id: mine.length ? 'type' : 'read', target: '[data-cr-answer]', gesture: 'tap', prefer: 'below' };
  if (t.kind === 'move' || t.kind === 'opp') {
    if (!s.moved) return { id: 'pin', target: '[data-cr-pin]', gesture: 'drag', prefer: 'above' };
    return t.kind === 'move' ? { id: 'type', target: '[data-cr-answer]', gesture: 'tap', prefer: 'below' } : { id: 'pin', target: '[data-cr-pin]', gesture: 'drag', prefer: 'above' };
  }
  if (!s.confirmed) return { id: mine.length ? 'confirm' : 'lever', target: mine.length ? '[data-cr-confirm]' : '[data-cr-lever]', gesture: mine.length ? 'tap' : 'drag', prefer: 'below' };
  return { id: 'tap', target: '[data-cr-cell]', gesture: 'tap', prefer: 'above' };
}
