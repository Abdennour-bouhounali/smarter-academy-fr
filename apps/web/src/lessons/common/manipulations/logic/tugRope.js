/**
 * tug-rope — LA LOGIQUE PURE de « شدّ الحبل » (2AM, unité 3 « الأعداد النسبية », درس « حساب مجموع جبري », 2026-10-29).
 * Exacte : les maths viennent de `packages/core/arithmetic/relative.js` (E3 : `terms`, `asSum`, `groupBySign`, `algebraicSum`, `simplifiedText`, importé PAR CHEMIN).
 *
 * LE MODÈLE. Une somme algébrique est une FILE d'enfants (dans l'ordre écrit). Chaque enfant porte une opération (`op`, le « + » ou le « − » qui le précède) et un nombre imprimé `v`.
 * Un enfant précédé de « − » se RETOURNE (`turn`) : sa dossard devient l'opposé du nombre imprimé. Puis il est envoyé (`send`) dans l'équipe de gauche (tire vers le drapeau orange, « − »)
 * ou de droite (drapeau vert, « + ») ; la force d'un enfant est la distance à zéro de son dossard. Au COUP DE SIFFLET le ruban avance de (total de droite − total de gauche) : c'est la SORTIE.
 * Le juge regarde, enfant par enfant : retourné ⇔ précédé de « − », et équipe = côté du signe de la CONTRIBUTION (+v ou −v). Une arrangement juste donne exactement la somme algébrique.
 * Un groupe « [ … ] » arrive comme un petit équipage : on le règle D'ABORD (étape 0 : ses enfants seulement), son résultat devient un enfant (avec son « − » éventuel) de l'étape suivante.
 * مبتدئ : arranger, siffler, puis ÉCRIRE où le ruban s'est arrêté ; متقدم (`predict`) : ÉCRIRE la position AVANT, puis arranger et siffler.
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'turn', task, i }   { kind:'send', task, i, side, ok }   { kind:'whistle', task, stage, mark, ok, model }   { kind:'answer'|'predict', task, value, ok, model }
 *   { kind:'solved', task }   { kind:'custom', free:true }
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';

const MAX_KIDS = 6;
const MAX_ABS = 2000n; // 20 en centièmes

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 't1', chain: '(+7)+(-3)+(+5)+(-6)' },
    { id: 't2', chain: '(-8)-(+3)+(-6)-(-5)' },
    { id: 't3', chain: '(+5)+(-7)+(-5)+(+7)+(-3)' },
  ] },
  advanced: { tasks: [
    { id: 'a1', chain: '(+4,5)+(-7)-(+8)+(+3,5)-(-4,5)-(-10)', predict: true },
    { id: 'a2', chain: '(+12)-[(-6)-(-2)+(+9)]', predict: true },
    { id: 'a3', chain: '-15+4+8+3', predict: true },
  ] },
});

const sgn = (x) => (x < 0n ? -1 : x > 0n ? 1 : 0);
const abs = (x) => (x < 0n ? -x : x);

/** Les tâches normalisées : arbre, valeur attendue, et les valeurs des erreurs nommées. */
export function normalizeTasks(list) {
  return list.map((t, i) => {
    const nodes = R.terms(t.chain);
    const gi = nodes.findIndex((n) => n.group);
    if (nodes.filter((n) => n.group).length > 1 || (gi >= 0 && nodes[gi].group.some((n) => n.group))) throw new Error('tugRope: un seul groupe, sans imbrication');
    const inner = gi >= 0 ? R.algebraicSum(nodes[gi].group) : null;
    const leaves = nodes.flatMap((n) => (n.group ? n.group : [n]));
    if (leaves.length > MAX_KIDS + 1) throw new Error('tugRope: trop de termes');
    const expected = R.algebraicSum(nodes);
    const noTurn = leaves.reduce((a, n) => a + n.value, 0n);
    const drop = gi >= 0 ? R.algebraicSum(nodes.map((n, k) => (k === gi ? { ...n, op: '+' } : n))) : null;
    return Object.freeze({ id: t.id ?? `t${i}`, chain: t.chain, predict: !!t.predict, nodes, gi, inner, expected, noTurn, drop, flip: -expected });
  });
}

/** Les enfants d'une étape : l'étape 0 d'un groupe = ses membres ; sinon la file écrite (le groupe réglé devient UN enfant). */
function kidsFor(task, stage) {
  const src = task.gi >= 0 && stage === 0
    ? task.nodes[task.gi].group.map((n) => ({ op: n.op, v: n.value }))
    : task.nodes.map((n, k) => (k === task.gi ? { op: n.op, v: task.inner, fromGroup: true } : { op: n.op, v: n.value }));
  return src.map((k, i) => ({ i, op: k.op, v: k.v, fromGroup: !!k.fromGroup, turned: false, side: null }));
}

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) throw new Error('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}
function fresh(s) {
  const tk = s.free ? null : s.tasks[s.ti];
  return { ...s, stage: 0, kids: s.free ? s.free.kids : kidsFor(tk, 0), phase: tk && tk.predict ? 'predict' : 'act', predicted: null, last: null, ghost: null, pulled: null, bad: [], innerDone: null };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const bib = (k) => (k.turned ? -k.v : k.v);
/** La contribution VRAIE de l'enfant à la somme (+v pour « + », −v pour « − »). */
const contribution = (k) => (k.op === '+' ? k.v : -k.v);
export const placedAll = (s) => s.kids.every((k) => k.side);
export const gesturesOpen = (s) => (s.free ? true : s.phase === 'act' && !taskDone(s));
export const stageTarget = (s) => {
  if (s.free) return s.kids.reduce((a, k) => a + contribution(k), 0n);
  const tk = taskOf(s);
  return tk.gi >= 0 && s.stage === 0 ? tk.inner : tk.expected;
};
/** Les totaux de force : { left, right } (centièmes). */
export function teams(s) {
  let left = 0n; let right = 0n;
  for (const k of s.kids) { if (k.side === 'left') left += abs(bib(k)); else if (k.side === 'right') right += abs(bib(k)); }
  return { left, right, mark: right - left };
}
/** Les enfants dont la place ou le retournement est faux : [{ i, why }] — why ∈ noTurn | turnAll | wrongSide. */
export function badKids(s) {
  const out = [];
  for (const k of s.kids) {
    const needTurn = k.op === '-';
    if (needTurn && !k.turned) out.push({ i: k.i, why: 'noTurn' });
    else if (!needTurn && k.turned) out.push({ i: k.i, why: 'turnAll' });
    else if (k.side) {
      const c = sgn(contribution(k));
      if (c !== 0 && (c < 0 ? 'left' : 'right') !== k.side) out.push({ i: k.i, why: 'wrongSide' });
    }
  }
  return out;
}

/* ── Gestes ── */
const touched = (s, patch, trial) => ({ ...s, ...patch, pulled: null, bad: [], ghost: null, trials: trial ? [...s.trials, trial] : s.trials, last: trial ?? s.last });
export function turn(s, i) {
  if (!gesturesOpen(s) || !s.kids[i]) return s;
  const kids = s.kids.map((k) => (k.i === i ? { ...k, turned: !k.turned } : k));
  const tr = Object.freeze({ kind: 'turn', task: s.free ? -1 : s.ti, i, free: !!s.free });
  const next = touched(s, { kids }, tr);
  return s.free ? { ...next, free: { ...s.free, kids } } : next;
}
/** Envoie l'enfant `i` dans l'équipe `side` ('left' | 'right'), ou le rend à la file (`null`). */
export function send(s, i, side) {
  if (!gesturesOpen(s) || !s.kids[i]) return s;
  const kid = s.kids[i];
  if (kid.side === side) return s;
  const kids = s.kids.map((k) => (k.i === i ? { ...k, side } : k));
  const c = sgn(bib(kid));
  const ok = side == null ? true : c === 0 || (c < 0 ? 'left' : 'right') === side;
  const tr = Object.freeze({ kind: 'send', task: s.free ? -1 : s.ti, i, side, ok, free: !!s.free });
  const next = touched(s, { kids }, tr);
  return s.free ? { ...next, free: { ...s.free, kids } } : next;
}

/** Le coup de sifflet : le ruban avance de (droite − gauche). Juste ⇒ l'étape est réglée. */
export function whistle(s) {
  if (!gesturesOpen(s) || !placedAll(s)) return s;
  const { mark } = teams(s);
  const bad = badKids(s);
  const ok = bad.length === 0;
  const target = stageTarget(s);
  const model = ok ? 'right' : bad.some((b) => b.why === 'noTurn') ? 'noTurn' : bad.some((b) => b.why === 'turnAll') ? 'turnAll' : 'wrongSide';
  const trial = Object.freeze({ kind: 'whistle', task: s.free ? -1 : s.ti, stage: s.stage, mark: R.text(mark), ok, model, free: !!s.free });
  const base = { ...s, trials: [...s.trials, trial], last: trial, pulled: { mark, ok }, bad, ghost: ok || mark === target ? null : { kind: model, at: target } };
  if (s.free) return { ...base, last: trial };
  if (!ok) return base;
  const tk = taskOf(s);
  if (tk.gi >= 0 && s.stage === 0) {
    // le petit équipage est réglé : son résultat devient UN enfant de l'étape suivante
    return { ...base, stage: 1, kids: kidsFor(tk, 1), innerDone: mark, pulled: null, last: trial };
  }
  if (tk.predict) {
    const solved = Object.freeze({ kind: 'solved', task: s.ti });
    return { ...base, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: solved }, trials: [...base.trials, solved], phase: 'act' };
  }
  return { ...base, phase: 'read' };
}

/* ── Lectures typées ── */
function parseTyped(raw) {
  try {
    const h = R.parse(String(raw ?? '').replace(/[⁦⁩]/g, ''));
    return h;
  } catch { return null; }
}
/** Le jugement d'une position écrite : { ok, model, want, value } — model ∈ right | noTurn | bracketDrop | flipSign | other | format. */
export function judgeValue(task, raw) {
  const want = task.expected;
  const got = parseTyped(raw);
  if (got == null) return { ok: false, model: 'format', want };
  if (got === want) return { ok: true, model: 'right', want, value: got };
  let model = 'other';
  if (task.drop != null && got === task.drop) model = 'bracketDrop';
  else if (got === task.noTurn && task.noTurn !== want) model = 'noTurn';
  else if (got === task.flip && want !== 0n) model = 'flipSign';
  return { ok: false, model, want, value: got };
}
const ghostOf = (model, value) => (model === 'format' || value == null ? null : { kind: model, at: value });

/** مبتدئ : lire où le ruban s'est arrêté (après un coup de sifflet JUSTE). */
export function answer(s, raw) {
  if (s.free || taskDone(s) || taskOf(s).predict || s.phase !== 'read') return s;
  const tk = taskOf(s);
  const j = judgeValue(tk, raw);
  const trial = Object.freeze({ kind: 'answer', task: s.ti, value: j.value != null ? R.text(j.value) : String(raw), ok: j.ok, model: j.model, free: false });
  let { done, solved } = s;
  let trials = [...s.trials, trial];
  if (j.ok) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; trials = [...trials, Object.freeze({ kind: 'solved', task: s.ti })]; }
  return { ...s, done, solved, trials, last: trial, ghost: j.ok ? null : ghostOf(j.model, j.value) };
}
/** متقدم : écrire la position AVANT d'arranger. Une écriture juste ouvre les gestes. */
export function predict(s, raw) {
  if (s.free || !taskOf(s).predict || s.phase !== 'predict') return s;
  const tk = taskOf(s);
  const j = judgeValue(tk, raw);
  const trial = Object.freeze({ kind: 'predict', task: s.ti, value: j.value != null ? R.text(j.value) : String(raw), ok: j.ok, model: j.model, free: false });
  return { ...s, phase: j.ok ? 'act' : 'predict', predicted: j.ok ? j.value : null, trials: [...s.trials, trial], last: trial, ghost: j.ok ? null : ghostOf(j.model, j.value) };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
/** « أعِد التجربة » : la MÊME tâche repart de zéro (les essais restent). */
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : une chaîne plate de 2 à 6 termes, |terme| ≤ 20, ≤ 2 décimales ── */
export function parseFree(raw) {
  try {
    const nodes = R.terms(raw);
    if (nodes.length < 2 || nodes.length > MAX_KIDS || nodes.some((n) => n.group || abs(n.value) > MAX_ABS || n.value === 0n)) return null;
    return { chain: String(raw).trim(), kids: nodes.map((n, i) => ({ i, op: n.op, v: n.value, fromGroup: false, turned: false, side: null })) };
  } catch { return null; }
}
export function setFree(s, raw) {
  const f = parseFree(raw);
  if (!f) return s;
  return { ...s, free: f, kids: f.kids, stage: 0, phase: 'act', ghost: null, pulled: null, bad: [], last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);

export const trialEvidence = (tr) => tr;

/* ── Chaîne affichée sur le tableau : avec les parenthèses, puis simplifiée ── */
const par = (x) => `(${x < 0n ? '-' : '+'}${R.text(abs(x))})`;
/** Le tableau : { bracket, simple, red[] } — la chaîne telle que l'élève l'a retournée (rouge : un enfant « + » retourné). */
export function scoreboard(s) {
  const parts = s.kids.map((k) => {
    const op = k.turned ? '+' : k.op;
    const v = k.turned ? -k.v : k.v;
    return { op, v, red: k.turned && k.op === '+', fresh: k.fromGroup };
  });
  const bracket = parts.map((p, i) => (i === 0 ? (p.op === '-' ? `-${par(p.v)}` : par(p.v)) : `${p.op} ${par(p.v)}`));
  const addends = parts.map((p) => (p.op === '-' ? -p.v : p.v));
  const allAdded = parts.every((p) => p.op === '+');
  return { bracket, red: parts.map((p) => p.red), simple: allAdded ? R.simplifiedText(addends) : null, total: R.groupBySign(addends).total };
}

/* ── Onboarding (LabCoach) ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-tr-next]', gesture: 'tap', prefer: 'below' } : null;
  const tk = taskOf(s);
  if (tk.predict && s.phase === 'predict') return { id: 'predict', target: '[data-tr-answer]', gesture: 'tap', prefer: 'below' };
  if (tk.gi >= 0 && s.stage === 0 && !s.trials.some((x) => x.task === s.ti && x.kind === 'send')) return { id: 'group', target: '[data-tr-queue]', gesture: 'tap', prefer: 'below' };
  const turnable = s.kids.find((k) => k.op === '-' && !k.turned);
  if (turnable && !s.trials.some((x) => x.task === s.ti && x.kind === 'turn')) return { id: 'turn', target: `[data-tr-child="${turnable.i}"] [data-tr-turn]`, gesture: 'tap', prefer: 'below' };
  if (!placedAll(s)) return { id: 'send', target: '[data-tr-queue]', gesture: 'drag', prefer: 'below' };
  if (s.phase === 'read') return { id: 'type', target: '[data-tr-answer]', gesture: 'tap', prefer: 'below' };
  return { id: 'whistle', target: '[data-tr-whistle]', gesture: 'tap', prefer: 'above' };
}
