/**
 * coop-calculator — LA LOGIQUE PURE de « حاسبة التعاونية » (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية », درس « سلسلة عمليات تتضمّن أقواسا »,
 * 2026-10-29). Exacte : tout vient de `packages/core/arithmetic/chainOps.js` (étage L2 : `calculatorRead`, `uselessBrackets`, `barToLine`, `leftToRight`…), importé PAR CHEMIN.
 *
 * LE MODÈLE. Une TÂCHE est une histoire de coopérative scolaire dont la VÉRITÉ est une quantité (ce que l'histoire dit) et dont l'élève doit faire AFFICHER cette quantité
 * par une calculatrice scientifique qui, elle, obéit aux priorités. La MAIN pose les PARENTHÈSES de la ligne tapée :
 *   - `insert` (مبتدئ) : la ligne est déjà tapée SANS parenthèses (touches verrouillées) ; l'élève touche un INTERVALLE entre deux touches (le curseur) puis « ( » ou « ) » ;
 *   - `type` (متقدم) : l'élève tape toute la ligne avec les touches (carte : une barre de fraction ou une histoire).
 * « = » IMPRIME la ligne et la valeur de la calculatrice sur le ruban : une ligne mal équilibrée → « Syntax ERROR » (la calculatrice elle-même) ; une valeur ≠ la vérité →
 * le ruban la barre ✗ et l'HISTOIRE montre pourquoi (`reason: 'story'`) ; la bonne valeur → ✓ et la carte « ما تقوله الوضعية ». Une paire INUTILE (qui ne change pas l'arbre de
 * calcul) est ACCEPTÉE avec une remarque.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués vers `onTrial`) :
 *   { tk: 'print', id, line, value, ok, reason, useless, free }          // chaque « = » (jamais compté en libre)
 *   { tk: 'refused', id, reason: 'syntax' | 'math' | 'story' | 'numbers' | 'nopair', line, value, truth }
 *   { tk: 'solved', id, line, value }
 *   { tk: 'custom', free: true, line, value, ltr }                       // « جرّب أعدادك » (jamais compté)
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { eq } from '@smarter-academy/core/arithmetic/powers.js';

const MAX_KEYS = 24;
export const FREE_LIMITS = Object.freeze({ maxKeys: 24, maxDepth: 2 });

/**
 * Les tâches. `pre` : la ligne tapée sans parenthèses (insert) ; `truthLine` : une ligne qui donne la vérité (sert à CALCULER la vérité, jamais montrée) ; `traps` : des lignes
 * fautives connues dont la valeur a un message propre (`refute.<id>.<key>`) ; `needPair` : la tâche exige au moins une paire (sinon « نبّه ») ; `facts` : les nombres de
 * l'histoire, pour que les questions du labo s'écrivent avec eux ; `world` : ce que dessine le comptoir (`items`) et la façon dont la vérité se partage (`share`).
 */
export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'k1', kind: 'insert', pre: '8 × 12 − 7', truthLine: '8 × (12 − 7)', traps: [{ line: '(8 × 12) − 7', key: 'bulk' }],
      facts: { boxes: 8, each: 12, out: 7 }, world: { items: [{ glyph: 'pencilBox', n: 8, label: '12' }], share: { groups: 8, each: 5, glyph: 'pencil', unit: '' } } },
    { id: 'k2', kind: 'insert', pre: '45 + 15 ÷ 4', truthLine: '(45 + 15) ÷ 4', traps: [{ line: '45 + (15 ÷ 4)', key: 'coverOnly' }],
      facts: { book: 45, cover: 15, friends: 4, total: 60 }, world: { items: [{ glyph: 'book', n: 1, label: '45 DA' }, { glyph: 'cover', n: 1, label: '15 DA' }], share: { groups: 4, each: 15, glyph: 'coin', unit: 'DA' } } },
    { id: 'k3', kind: 'insert', pre: '9 + 2 × 5', truthLine: '9 + (2 × 5)', needPair: true, traps: [{ line: '(9 + 2) × 5', key: 'wrongPair' }],
      facts: { loose: 9, boxes: 2, each: 5 }, world: { items: [{ glyph: 'notebook', n: 9, label: '' }, { glyph: 'notebookBox', n: 2, label: '5' }], share: { groups: 1, each: 19, glyph: 'notebook', unit: '' } } },
    { id: 'k4', kind: 'insert', pre: '2 × 50 − 12 + 8', truthLine: '2 × (50 − (12 + 8))', traps: [{ line: '2 × (50 − 12) + 8', key: 'early' }, { line: '2 × (50 − 12 + 8)', key: 'inside' }],
      facts: { buses: 2, seats: 50, teachers: 12, parents: 8, taken: 20, left: 30 }, world: { items: [{ glyph: 'bus', n: 2, label: '50' }], share: { groups: 2, each: 30, glyph: 'seat', unit: '' } } },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'type', truthLine: '(40 + 8) ÷ (15 − 9)', card: { bar: { num: '40 + 8', den: '15 − 9' } }, traps: [{ line: '(40 + 8) ÷ 15 − 9', key: 'numOnly' }],
      facts: { bread: 40, milk: 8, group: 15, absent: 9, present: 6, total: 48 }, world: { items: [{ glyph: 'bread', n: 1, label: '40 DA' }, { glyph: 'milk', n: 1, label: '8 DA' }], share: { groups: 6, each: 8, glyph: 'coin', unit: 'DA' } } },
    { id: 'a2', kind: 'type', truthLine: '(14 + 17 + 12,5) ÷ 3', card: { text: true }, traps: [{ line: '14 + 17 + 12,5 ÷ 3', key: 'lastOnly' }],
      facts: { m1: 14, m2: 17, m3: 12.5, count: 3 }, world: { items: [{ glyph: 'mark', n: 3, label: '' }], share: { groups: 1, each: 14.5, glyph: 'mark', unit: '' } } },
    { id: 'a3', kind: 'type', truthLine: '(18 + 129) ÷ 7', card: { text: true }, traps: [{ line: '18 + 129 ÷ 7', key: 'booksOnly' }],
      facts: { dictionaries: 18, stories: 129, perShelf: 7, total: 147 }, world: { items: [{ glyph: 'book', n: 2, label: '' }], share: { groups: 21, each: 7, glyph: 'book', unit: '' } } },
  ] },
  /** معارف : un seul exercice, posé seul (`levels={false}`). */
  alone: { world: 'coopshop', tasks: [
    { id: 'm1', kind: 'insert', pre: '5 × 20 − 3', truthLine: '5 × (20 − 3)', traps: [{ line: '(5 × 20) − 3', key: 'bulk' }],
      facts: { boxes: 5, each: 20, out: 3 }, world: { items: [{ glyph: 'ballBox', n: 5, label: '20' }], share: { groups: 5, each: 17, glyph: 'ball', unit: '' } } },
  ] },
});

/* ── les touches et la ligne ──────────────────────────────────────────────────────────────────────────────────── */

const isDigit = (k) => /^[0-9]$/.test(k);
const normKey = (key) => {
  const k = String(key);
  return ({ '-': '−', '*': '×', '/': '÷', ':': '÷', '.': ',', x: '×', X: '×' })[k] ?? k;
};
/** « 8 × 12 − 7 » → jetons verrouillés `[{ k, f: true }]` (les touches pré-tapées). */
export const tokensOf = (text, fixed = false) => C.tokenizeB(text).map((tk) => ({ k: tk.t === 'num' ? tk.text : tk.t === 'op' ? tk.o : tk.ch === '[' ? '(' : tk.ch === ']' ? ')' : tk.ch, ...(fixed ? { f: true } : {}) }));
export const textOf = (line) => line.map((x) => x.k).join(' ');
export const depthsOf = (line) => C.bracketDepths(line.map((x) => (x.k === '(' ? { t: 'open' } : x.k === ')' ? { t: 'close' } : { t: 'x' })));
const keyCount = (line) => line.reduce((n, x) => n + (/^\d/.test(x.k) ? x.k.length : 1), 0);

/**
 * Presser UNE touche sur une ligne à la position du curseur (`cur` = nombre de jetons à sa gauche). Les chiffres et la virgule se collent au nombre qui précède le curseur.
 * `{ line, cur, ok }` ; `ok: false` si la touche est refusée (ligne pleine, virgule en trop…).
 */
export function pressKey(line, cur, key, { max = MAX_KEYS } = {}) {
  const k = normKey(key);
  if (cur == null) return { line, cur, ok: false };
  const left = line[cur - 1];
  const isNum = isDigit(k) || k === ',';
  if (keyCount(line) >= max) return { line, cur, ok: false };
  if (isNum) {
    if (left && /^[0-9]/.test(left.k) && !left.f && (cur === line.length || true)) {
      if (k === ',' && left.k.includes(',')) return { line, cur, ok: false };
      if (left.k.replace(',', '').length >= 7) return { line, cur, ok: false };
      return { line: line.map((x, i) => (i === cur - 1 ? { ...x, k: x.k + k } : x)), cur, ok: true };
    }
    if (k === ',') return { line, cur, ok: false };
    return { line: [...line.slice(0, cur), { k }, ...line.slice(cur)], cur: cur + 1, ok: true };
  }
  if (!['+', '−', '×', '÷', '(', ')'].includes(k)) return { line, cur, ok: false };
  return { line: [...line.slice(0, cur), { k }, ...line.slice(cur)], cur: cur + 1, ok: true };
}

/** « ⌫ » : retire la touche à gauche du curseur (un chiffre d'un nombre long ne retire que ce chiffre) ; une touche verrouillée ne part pas. */
export function backKey(line, cur) {
  if (cur == null || cur <= 0) return { line, cur, ok: false };
  const x = line[cur - 1];
  if (x.f) return { line, cur, ok: false };
  if (/^[0-9]/.test(x.k) && x.k.length > 1) return { line: line.map((y, i) => (i === cur - 1 ? { ...y, k: y.k.slice(0, -1) } : y)), cur, ok: true };
  return { line: [...line.slice(0, cur - 1), ...line.slice(cur)], cur: cur - 1, ok: true };
}

/** La lecture d'une ligne libre : la calculatrice ET, à côté, la valeur « de gauche à droite sans priorité ». */
export function freeRead(line) {
  const text = textOf(line);
  const r = C.calculatorRead(text);
  const ltr = C.leftToRight(text);
  return { read: r, display: r.status === 'ok' ? r.display : null, ltr: ltr ? C.calcDisplay(ltr) : null, differs: r.status === 'ok' && ltr != null && !eq(r.value, ltr) };
}
export const freeDepthOk = (line) => { const d = depthsOf(line); return Math.max(0, ...d) <= FREE_LIMITS.maxDepth; };

/* ── les tâches ───────────────────────────────────────────────────────────────────────────────────────────────── */

export function buildTask(raw, i = 0) {
  const truth = C.evaluateB(raw.truthLine);
  const refLine = tokensOf(raw.truthLine);
  const numbers = refLine.filter((x) => /^\d/.test(x.k)).map((x) => x.k);
  const traps = (raw.traps ?? []).map((tp) => ({ ...tp, value: C.evaluateB(tp.line), display: C.calcDisplay(C.evaluateB(tp.line)) }));
  const pre = raw.pre ?? null;
  const without = pre ? C.calculatorRead(pre) : C.calculatorRead(C.tokenizeB(raw.truthLine).filter((tk) => tk.t !== 'open' && tk.t !== 'close'));
  return Object.freeze({
    id: raw.id ?? `k${i}`, kind: raw.kind ?? (pre ? 'insert' : 'type'), pre, truthLine: raw.truthLine, truth, truthText: C.calcDisplay(truth),
    numbers, needPair: !!raw.needPair, traps, card: raw.card ?? null, facts: raw.facts ?? {}, world: raw.world ?? { items: [], share: null },
    withoutDisplay: without.status === 'ok' ? without.display : null,
  });
}

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = raws.map(buildTask);
  return { world: numbers.world ?? 'coopshop', tasks, ti: 0, ...fresh(tasks[0]), done: {}, refusals: {}, trials: [], free: false };
}

function fresh(task) {
  const line = task?.pre ? tokensOf(task.pre, true) : [];
  return { line, cur: task?.kind === 'type' ? line.length : null, tape: [], remark: null, flash: null, shown: false };
}

export const taskOf = (s) => s.tasks[s.ti];
export const taskDone = (s) => !!s.done[s.ti];
export const canNext = (s) => taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
const frozen = (s) => taskDone(s);
const refusalsOf = (s) => s.refusals[s.ti] ?? 0;
/** La carte « ما تقوله الوضعية » : seulement quand la tâche est faite ou après le deuxième refus de l'histoire (jamais avant : elle donnerait la réponse). */
export const truthShown = (s) => taskDone(s) || refusalsOf(s) >= 2;
export const lineText = (s) => textOf(s.line);
export const hasPairs = (s) => s.line.some((x) => x.k === '(' || x.k === ')');
export const cursorSet = (s) => s.cur != null;
export const canPrint = (s) => !frozen(s) && s.line.length > 0;
export const lastEntry = (s) => s.tape.at(-1) ?? null;

/** Toucher un INTERVALLE (0 … n) : le curseur s'y pose. */
export function setCursor(s, i) {
  if (frozen(s) || i < 0 || i > s.line.length) return s;
  return { ...s, cur: i };
}
export function moveCursor(s, dir) {
  if (frozen(s)) return s;
  const from = s.cur ?? (dir < 0 ? s.line.length : 0);
  return { ...s, cur: Math.max(0, Math.min(s.line.length, from + dir)) };
}
const allowed = (task, key) => (task.kind === 'insert' ? key === '(' || key === ')' : true);
export function press(s, key) {
  const task = taskOf(s);
  const k = normKey(key);
  if (frozen(s) || !allowed(task, k)) return s;
  const r = pressKey(s.line, s.cur, k, { max: 30 });
  return r.ok ? { ...s, line: r.line, cur: r.cur, flash: null, remark: null } : s;
}
export function back(s) {
  if (frozen(s)) return s;
  const r = backKey(s.line, s.cur);
  return r.ok ? { ...s, line: r.line, cur: r.cur, flash: null } : s;
}
/** « AC » : la ligne revient à son départ (la ligne pré-tapée sans parenthèses, ou le vide). */
export function clear(s) {
  if (frozen(s)) return s;
  const f = fresh(taskOf(s));
  return { ...s, line: f.line, cur: f.cur, flash: null, remark: null };
}

/* ── le verdict ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** Les nombres de la ligne, triés, sont-ils exactement ceux de l'histoire ? (متقدم : on ne triche pas en tapant le résultat) */
const sameNumbers = (task, line) => {
  const mine = line.filter((x) => /^\d/.test(x.k)).map((x) => C.numText(C.evaluateB(x.k))).sort();
  const want = task.numbers.map((x) => C.numText(C.evaluateB(x))).sort();
  return mine.length === want.length && mine.every((x, i) => x === want[i]);
};

/**
 * Juge une ligne : `{ status, value, display, ok, reason, useless, trap }`. `reason` : `null` (juste) | `'syntax'` | `'math'` | `'numbers'` | `'story'` | `'nopair'`.
 * `useless` : les paires qui ne changent pas l'arbre de calcul (acceptées, avec remarque).
 */
function judge(task, line) {
  const text = textOf(line);
  const r = C.calculatorRead(text);
  if (r.status !== 'ok') return { status: r.status, value: null, display: r.status === 'syntax' ? 'Syntax ERROR' : 'Math ERROR', ok: false, reason: r.status, useless: [], trap: null };
  const base = { status: 'ok', value: r.value, display: r.display, useless: [], trap: null };
  if (task.kind === 'type' && !sameNumbers(task, line)) return { ...base, ok: false, reason: 'numbers' };
  if (eq(r.value, task.truth)) {
    const useless = C.uselessBrackets(text);
    if (task.needPair && !line.some((x) => x.k === '(')) return { ...base, ok: false, reason: 'nopair' };
    return { ...base, ok: true, reason: null, useless };
  }
  const trap = task.traps.find((tp) => eq(tp.value, r.value)) ?? null;
  return { ...base, ok: false, reason: 'story', trap: trap?.key ?? null };
}

/** « = » : la ligne est IMPRIMÉE et jugée. Une ligne juste fait la tâche ; sinon elle reste modifiable. */
export function equals(s) {
  if (!canPrint(s)) return s;
  const task = taskOf(s);
  const j = judge(task, s.line);
  const text = textOf(s.line);
  const entry = { text, display: j.display, status: j.status, ok: j.ok, reason: j.reason, useless: j.useless.length, trap: j.trap };
  const base = { id: task.id, line: text, value: j.display, free: false };
  const add = [Object.freeze({ tk: 'print', ...base, ok: j.ok, reason: j.reason, useless: j.useless.length })];
  if (j.ok) add.push(Object.freeze({ tk: 'solved', id: task.id, line: text, value: j.display }));
  else add.push(Object.freeze({ tk: 'refused', ...base, reason: j.reason, truth: task.truthText }));
  const bump = !j.ok && (j.reason === 'story' || j.reason === 'numbers');
  return {
    ...s, tape: [...s.tape, entry].slice(-8), trials: [...s.trials, ...add],
    refusals: bump ? { ...s.refusals, [s.ti]: refusalsOf(s) + 1 } : s.refusals,
    done: j.ok ? { ...s.done, [s.ti]: true } : s.done,
    flash: j, remark: j.ok && j.useless.length ? 'useless' : null,
  };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, ...fresh(s.tasks[ti]) };
}
/** « أعِد التجربة » après les questions : la même tâche redevient à faire, le ruban reste vide. */
export function restartTask(s) {
  return { ...s, ...fresh(taskOf(s)), done: { ...s.done, [s.ti]: false }, refusals: { ...s.refusals, [s.ti]: 0 } };
}

/* ── onboarding ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** Le prochain geste utile — jamais une position ni une valeur. `null` quand la tâche est faite. */
export function coachOf(s) {
  const task = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-coop-free]', gesture: 'type' };
  const last = lastEntry(s);
  if (last && last.status === 'syntax') return { id: 'syntax', target: '[data-coop-back]', gesture: 'tap' };
  if (task.kind === 'type') {
    if (s.line.length === 0) return { id: 'type', target: '[data-coop-keys]', gesture: 'tap' };
    return { id: 'print', target: '[data-coop-equals]', gesture: 'tap' };
  }
  if (!cursorSet(s)) return { id: 'gap', target: '[data-coop-gap="1"]', gesture: 'tap' };
  if (!hasPairs(s)) return { id: 'bracket', target: '[data-coop-key="("]', gesture: 'tap' };
  return { id: 'print', target: '[data-coop-equals]', gesture: 'tap' };
}
