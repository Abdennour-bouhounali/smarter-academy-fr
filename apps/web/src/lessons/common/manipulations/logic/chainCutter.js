/**
 * chain-cutter — LA LOGIQUE PURE de « مقصّ السلسلة » (2AM, unité 1, درس « وصف سلسلة حسابات », 2026-10-29). Exacte : tout vient de `packages/core/arithmetic/chainOps.js` (étage L3 :
 * `cutAt`, `staplesOf`, `describe`, `build`, `chainName`, `sameStructure`), importé PAR CHEMIN.
 *
 * LE MODÈLE. Une bande de papier porte une chaîne. La MAIN choisit OÙ la couper en deux morceaux qui se calculent chacun seul : seule la DERNIÈRE opération laisse les deux morceaux se recoller
 * sans mordre une agrafe (celle que le calcul a posée). Le morceau coupé tombe dans deux poches nommées d'après l'opération (« الحدّ الأول / الحدّ الثاني », « العامل الأول / … », « المقسوم / القاسم »),
 * puis l'élève colle le NOM (autocollant مجموع / فرق / جداء / حاصل قسمة) sur la coupe, et peut recouper un morceau (`depth: 'full'`) jusqu'aux nombres : la phrase grandit.
 *   - tâche `cut`   : `{ id, kind:'cut', text, depth: 'root' | 'full', hidden? }` ; `hidden` : les agrafes ne se montrent qu'APRÈS la première coupe (prédire puis voir) ; sinon « ثبّت » les montre.
 *   - tâche `glue`  : `{ id, kind:'glue', cards: ['15','9','4'], target }` : coller des blocs deux à deux par une opération (avec des agrafes-parenthèses) pour obtenir la chaîne de la phrase ;
 *                     la chaîne finale doit avoir LA STRUCTURE de `target` (`sameStructure`) ; sinon elle est refusée et nommée (« شريطك مجموع »).
 *
 * ÉVÉNEMENTS (`lab.trials`, rejoués vers `onTrial`) :
 *   { tk:'cut', task, at, ok, rebuiltValue, value, free:false }       { tk:'refused', task, reason:'staple'|'name'|'glue', at?, name?, got? }
 *   { tk:'name', task, piece, name, ok }                               { tk:'glue', task, text, name, ok }
 *   { tk:'solved', task, sentence }                                    { tk:'custom', free:true }
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';

export const NAMES = Object.freeze(['مجموع', 'فرق', 'جداء', 'حاصل قسمة']);
export const OPS = Object.freeze(['+', '−', '×', '÷']);
const FREE_LIMITS = Object.freeze({ maxChars: 20 });
/** Les poches : leurs étiquettes selon l'opération de la coupe. */
export const POCKETS = Object.freeze({ '+': ['term1', 'term2'], '−': ['term1', 'term2'], '×': ['factor1', 'factor2'], '÷': ['dividend', 'divisor'] });

const isNumberText = (t) => /^\d+(,\d+)?$/.test(String(t).trim());
export const isNumberCell = (cell) => isNumberText(cell.text);

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'c1', kind: 'cut', text: '7 + 4 × 5', depth: 'root' },
    { id: 'c2', kind: 'cut', text: '(7 + 4) × 5', depth: 'root' },
    { id: 'c3', kind: 'cut', text: '40 − 12 ÷ 4', depth: 'root' },
    { id: 'c4', kind: 'cut', text: '(18 + 6) ÷ 3', depth: 'root' },
    { id: 'c5', kind: 'cut', text: '6 × (9 − 2) + 5', depth: 'full' },
    { id: 'c6', kind: 'cut', text: '20 + 5 − 3', depth: 'root' },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'cut', text: '63 − 28 ÷ 7', depth: 'full', hidden: true },
    { id: 'a2', kind: 'glue', cards: ['50', '6', '7'], target: '50 − 6 × 7' },
    { id: 'a3', kind: 'glue', cards: ['15', '9', '4'], target: '(15 + 9) ÷ 4' },
    { id: 'a4', kind: 'glue', cards: ['3', '5', '10', '4'], target: '(3 + 5) × (10 − 4)' },
  ] },
  alone: { tasks: [{ id: 'm1', kind: 'cut', text: '(20 − 8) ÷ (1 + 2)', depth: 'full' }] },
});

function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'cut';
  if (kind === 'glue') {
    const value = C.evaluateB(raw.target);
    return Object.freeze({ id: raw.id ?? `g${i}`, kind, cards: raw.cards, target: raw.target, value, valueText: C.numText(value), sentence: C.describe(raw.target), name: C.chainName(raw.target) });
  }
  const value = C.evaluateB(raw.text);
  return Object.freeze({
    id: raw.id ?? `c${i}`, kind: 'cut', text: raw.text, depth: raw.depth ?? 'root', hidden: !!raw.hidden, value, valueText: C.numText(value),
    staples: C.staplesOf(raw.text), ops: C.analyse(raw.text).tokens.filter((t) => t.t === 'op').length, sentence: C.describe(raw.text), name: C.chainName(raw.text),
  });
}

function fresh(task) {
  if (task.kind === 'glue') return { blocks: task.cards.map((t, i) => ({ id: `n${i}`, text: t })), history: [], pick: [], op: null, clipL: false, clipR: false, flash: null, result: null };
  return { cells: { '': { text: task.text, cut: null, named: false, lo: 0, hi: C.analyse(task.text).tokens.length - 1 } }, focus: '', sel: null, pinned: false, revealed: false, flash: null, shake: 0 };
}

export function init(numbers = {}) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  return { world: numbers.world ?? 'corkboard', tasks, ti: 0, ...fresh(tasks[0]), done: {}, refusals: {}, trials: [] };
}

export const taskOf = (s) => s.tasks[s.ti];
const task0 = (s) => s.tasks[s.ti].text;
export const taskDone = (s) => !!s.done[s.ti];
export const canNext = (s) => taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const focusCell = (s) => s.cells?.[s.focus] ?? null;
/** Les agrafes sont visibles : après « ثبّت » (مبتدئ) ou après la première coupe (متقدم, `hidden`). */
export const staplesShown = (s) => { const t = taskOf(s); return t.kind === 'cut' && (s.pinned || s.revealed || (!t.hidden && taskDone(s))); };
export const canPin = (s) => { const t = taskOf(s); return t.kind === 'cut' && !t.hidden && !s.pinned && !taskDone(s); };
export const canCut = (s) => { const t = taskOf(s); const c = focusCell(s); return t.kind === 'cut' && !taskDone(s) && !!c && !c.cut && !isNumberCell(c) && (s.pinned || t.hidden) && s.sel != null; };
export const cutAllowed = (s) => { const t = taskOf(s); const c = focusCell(s); return t.kind === 'cut' && !taskDone(s) && !!c && !c.cut && !isNumberCell(c) && (s.pinned || t.hidden); };

/** Les cellules (morceaux) dans l'ordre d'affichage : la racine, puis ses fils gauche-droite, etc. */
export function cellKeys(s) {
  const out = [];
  const walk = (k) => { if (!s.cells[k]) return; out.push(k); walk(`${k}l`); walk(`${k}r`); };
  walk('');
  return out;
}
const needsWork = (s, k) => { const c = s.cells[k]; return !isNumberCell(c) && (!c.cut || !c.named); };
const pending = (s) => cellKeys(s).filter((k) => needsWork(s, k) && (taskOf(s).depth === 'full' || k === ''));

export function selectOp(s, i) {
  if (!cutAllowed(s)) return s;
  return { ...s, sel: i, flash: null };
}
export function moveSel(s, dir) {
  if (!cutAllowed(s)) return s;
  const n = C.analyse(focusCell(s).text).tokens.filter((t) => t.t === 'op').length;
  if (!n) return s;
  const from = s.sel ?? (dir > 0 ? -1 : n);
  return { ...s, sel: Math.max(0, Math.min(n - 1, from + dir)) };
}
export function pin(s) {
  if (!canPin(s)) return s;
  return { ...s, pinned: true };
}
export function focusOn(s, key) {
  const c = s.cells?.[key];
  if (!c || taskDone(s) || isNumberCell(c)) return s;
  return { ...s, focus: key, sel: null, flash: null };
}

/** « قصّ » : couper la cellule en focus à l'opérateur `at` (par défaut celui qu'on a choisi). */
export function cut(s, at = s.sel) {
  if (at == null || !cutAllowed(s)) return s;
  const t = taskOf(s);
  const cell = focusCell(s);
  const r = C.cutAt(cell.text, at);
  const base = { tk: 'cut', task: t.id, at, ok: r.ok, rebuiltValue: r.rebuilt, value: C.numText(C.evaluateB(cell.text)), free: false };
  if (r.ok) {
    const toks = C.analyse(task0(s)).tokens;
    let seen = -1; let tok = -1;
    for (let i = cell.lo; i <= cell.hi; i += 1) { if (toks[i].t === 'op') { seen += 1; if (seen === at) { tok = i; break; } } }
    const cells = { ...s.cells, [s.focus]: { ...cell, cut: { at, o: r.o, left: r.left, right: r.right, tok } },
      [`${s.focus}l`]: { text: r.left, cut: null, named: false, lo: cell.lo, hi: tok - 1 }, [`${s.focus}r`]: { text: r.right, cut: null, named: false, lo: tok + 1, hi: cell.hi } };
    return { ...s, cells, sel: at, revealed: true, flash: { ok: true, at }, trials: [...s.trials, Object.freeze(base)] };
  }
  const refusals = { ...s.refusals, [s.ti]: (s.refusals[s.ti] ?? 0) + 1 };
  return { ...s, sel: at, revealed: true, flash: { ok: false, reason: 'staple', at, rebuilt: r.rebuilt, same: r.same }, shake: s.shake + 1, refusals,
    trials: [...s.trials, Object.freeze(base), Object.freeze({ tk: 'refused', task: t.id, reason: 'staple', at, got: r.rebuilt })] };
}

/** Coller l'autocollant `name` sur la coupe de la cellule en focus. */
export function stick(s, name) {
  const t = taskOf(s);
  const cell = focusCell(s);
  if (t.kind !== 'cut' || taskDone(s) || !cell?.cut || cell.named) return s;
  const ok = name === C.CHAIN_NAMES[cell.cut.o];
  const ev = Object.freeze({ tk: 'name', task: t.id, piece: cell.text, name, ok });
  if (!ok) {
    return { ...s, flash: { ok: false, reason: 'name', name }, shake: s.shake + 1, refusals: { ...s.refusals, [s.ti]: (s.refusals[s.ti] ?? 0) + 1 },
      trials: [...s.trials, ev, Object.freeze({ tk: 'refused', task: t.id, reason: 'name', name })] };
  }
  const cells = { ...s.cells, [s.focus]: { ...cell, named: true } };
  const next = { ...s, cells, flash: { ok: true, named: s.focus }, trials: [...s.trials, ev] };
  const left = pending(next);
  if (left.length) return { ...next, focus: left[0], sel: null };
  return { ...next, done: { ...s.done, [s.ti]: true }, trials: [...next.trials, Object.freeze({ tk: 'solved', task: t.id, sentence: t.depth === 'full' ? t.sentence : `${t.name}` })] };
}

/** La phrase qui grandit : tant qu'un morceau n'est pas nommé il reste « … ». */
export function sentenceOf(s) {
  const t = taskOf(s);
  if (t.kind === 'glue') return taskDone(s) ? t.sentence : null;
  if (taskDone(s) && t.depth === 'full') return t.sentence;
  const root = s.cells[''];
  if (!root.named) return null;
  if (t.depth !== 'full') return `${C.CHAIN_NAMES[root.cut.o]} …`;
  const part = (k) => {
    const c = s.cells[k];
    if (isNumberCell(c)) return null;
    if (!c.named) return '…';
    const all = [`${k}l`, `${k}r`].every((x) => isNumberCell(s.cells[x]) || (s.cells[x].named && part(x) !== '…' && !String(part(x)).includes('…')));
    return all ? C.describe(c.text) : `${C.CHAIN_NAMES[c.cut.o]} …`;
  };
  return part('');
}

export function restartTask(s) {
  return { ...s, ...fresh(taskOf(s)), done: { ...s.done, [s.ti]: false }, refusals: { ...s.refusals, [s.ti]: 0 } };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, ...fresh(s.tasks[ti]) };
}

/* ── le collage (متقدم) ── */
export function pickBlock(s, id) {
  const t = taskOf(s);
  if (t.kind !== 'glue' || taskDone(s)) return s;
  const pick = s.pick.includes(id) ? s.pick.filter((x) => x !== id) : [...s.pick, id].slice(-2);
  return { ...s, pick, flash: null };
}
export function setOp(s, op) { return taskOf(s).kind === 'glue' && !taskDone(s) ? { ...s, op, flash: null } : s; }
export function toggleClip(s, side) { return taskOf(s).kind === 'glue' && !taskDone(s) ? { ...s, [side === 'l' ? 'clipL' : 'clipR']: !(side === 'l' ? s.clipL : s.clipR), flash: null } : s; }
export const canGlue = (s) => taskOf(s).kind === 'glue' && !taskDone(s) && s.pick.length === 2 && !!s.op;
export const canUndo = (s) => taskOf(s).kind === 'glue' && !taskDone(s) && s.history.length > 0;
export function undo(s) {
  if (!canUndo(s)) return s;
  const last = s.history.at(-1);
  return { ...s, blocks: last, history: s.history.slice(0, -1), pick: [], flash: null };
}
export function glue(s) {
  if (!canGlue(s)) return s;
  const t = taskOf(s);
  const [a, b] = s.pick.map((id) => s.blocks.find((x) => x.id === id));
  const r = C.build(s.op, a.text, b.text, { clipLeft: s.clipL, clipRight: s.clipR });
  const id = `g${s.history.length + 1}`;
  const blocks = [...s.blocks.filter((x) => x.id !== a.id && x.id !== b.id), { id, text: r.text, clipped: r.clipped, needs: r.needs }];
  const history = [...s.history, s.blocks];
  const reset = { pick: [], op: null, clipL: false, clipR: false };
  if (blocks.length > 1) {
    return { ...s, ...reset, blocks, history, flash: { ok: true, step: true }, trials: [...s.trials, Object.freeze({ tk: 'glue', task: t.id, text: r.text, name: r.name, ok: null })] };
  }
  const ok = C.sameStructure(r.text, t.target);
  const ev = Object.freeze({ tk: 'glue', task: t.id, text: r.text, name: r.name, ok });
  if (ok) return { ...s, ...reset, blocks, history, done: { ...s.done, [s.ti]: true }, flash: { ok: true, final: true, value: C.numText(C.evaluateB(r.text)) }, trials: [...s.trials, ev, Object.freeze({ tk: 'solved', task: t.id, sentence: t.sentence })] };
  const refusals = { ...s.refusals, [s.ti]: (s.refusals[s.ti] ?? 0) + 1 };
  const got = C.numText(C.evaluateB(r.text));
  return { ...s, ...reset, blocks, history, flash: { ok: false, reason: 'glue', name: r.name, got, wantName: t.name }, shake: s.shake + 1, refusals,
    trials: [...s.trials, ev, Object.freeze({ tk: 'refused', task: t.id, reason: 'glue', name: r.name, got })] };
}

/* ── « جرّب أعدادك » ── */
/** Lit une bande libre : refuse ce qui n'est pas une chaîne ≥ 0 de ≤ 20 caractères. `{ ok, text, name, sentence, value, ops, why }`. */
export function freeRead(input) {
  const text = String(input ?? '').trim();
  if (!text) return { ok: false, why: 'empty' };
  if (text.length > FREE_LIMITS.maxChars) return { ok: false, why: 'long' };
  let node;
  try { node = C.analyse(text); C.evaluateB(text); } catch { return { ok: false, why: 'syntax' }; }
  if (node.root.t !== 'op') return { ok: false, why: 'number' };
  if (!nonNegative(text)) return { ok: false, why: 'negative' };
  return { ok: true, text, name: C.chainName(text), sentence: C.describe(text), value: C.numText(C.evaluateB(text)), ops: node.tokens.filter((x) => x.t === 'op').map((x) => x.o), rootAt: C.analyse(text).root.opIndex };
}
/** Toute valeur intermédiaire ≥ 0 (les agrafes) ; la division par 0 est refusée. */
function nonNegative(text) {
  try { return C.staplesOf(text).every((x) => { const [n, d] = [x.value.n, x.value.d]; return Number(n) >= 0 && Number(d) > 0; }); } catch { return false; }
}

/* ── onboarding ── */
export function coachOf(s) {
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-cutter-free]', gesture: 'type' };
  if (t.kind === 'glue') {
    const last = s.flash;
    if (last && !last.ok && last.reason === 'glue') return { id: 'clip', target: '[data-cutter-clip]', gesture: 'tap' };
    return { id: 'glue', target: '[data-cutter-block]', gesture: 'tap' };
  }
  if (canPin(s)) return { id: 'pin', target: '[data-cutter-pin]', gesture: 'tap' };
  const c = focusCell(s);
  if (c?.cut && !c.named) return { id: 'sticker', target: '[data-cutter-sticker]', gesture: 'tap' };
  if (c && isNumberCell(c)) return null;
  if (Object.values(s.cells).some((x) => x.cut && x.named) && !(c?.cut)) return { id: 'again', target: '[data-cutter-cell]', gesture: 'tap' };
  return { id: 'cut', target: '[data-cutter-scissors]', gesture: 'drag' };
}
