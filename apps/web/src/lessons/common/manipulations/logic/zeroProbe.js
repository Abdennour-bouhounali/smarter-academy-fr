/**
 * zero-probe — LA LOGIQUE PURE du « المسبار » (2AM, unité 3 « الأعداد النسبية », درس « مقارنة وترتيب أعداد نسبية », 2026-10-21).
 * Exacte : toute la mathématique vient de `packages/core/arithmetic/relative.js` (centièmes en BigInt, importé PAR CHEMIN).
 *
 * LE MODÈLE. Deux capteurs sur une échelle d'altitudes (−10 … 10 m, le zéro = la surface de la mer). A est fixé à un nombre donné.
 * B pend au bout d'un câble qui part du ZÉRO : la MAIN tient la LONGUEUR du câble `d` ≥ 0 (la distance à zéro) ; le CÔTÉ
 * (« فوق » / « تحت » le zéro) est un autre geste, un interrupteur ; le nombre relatif de B est une SORTIE (côté + longueur).
 * Ce n'est ni `ruler-compare` (1AM : la main tient la graduation d'une règle de décimaux positifs) ni `solution-ray` (4AM : la main
 * tient x sur un rayon) : ici la main tient une DISTANCE et le signe en est la conséquence.
 *
 * Deux sortes de tâches (voir `relative.js › judge`) :
 *   beat     rendre B plus bas (`want: 'lower'`) ou plus haut ('higher') que A ; `side` : le côté imposé à B (null : libre) ;
 *            `both: true` : réussir une fois de chaque côté.
 *   between  rendre `lo < B < hi` (strict).
 * Quand aucune longueur ne convient (`R.isImpossible`), la tâche s'accomplit par le bouton « لا يوجد طول » (jugé exactement) ; ce
 * bouton existe dans TOUTES les tâches ; pressé quand une longueur convient il est refusé et MONTRE UNE longueur qui convient.
 *
 * Un « essai » est un RELÂCHEMENT : fin d'un glisser, clic −/+, flèche, changement de côté ; l'aller-retour pendant le glisser n'en est
 * pas un. « جرّب أعدادك » (`free`) : l'élève choisit le nombre de A ; les essais libres ne comptent jamais pour une tâche.
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';

const WORLDS = Object.freeze(['sea']);
/** La longueur du câble, en centièmes (0 … 10). */
export const RANGE_H = Object.freeze([0, R.MAX_D * 100]);

/** Les tâches par défaut de chaque niveau (la leçon peut passer les siennes) — les mêmes que `levels.js`. */
export const PRESETS = Object.freeze({
  beginner: [
    { kind: 'beat', a: '-3', side: 'below', want: 'lower' },
    { kind: 'beat', a: '-3', side: 'below', want: 'higher' },
    { kind: 'beat', a: '4', side: 'above', want: 'lower' },
    { kind: 'beat', a: '2', side: 'below', want: 'higher' },
  ],
  advanced: [
    { kind: 'between', lo: '-4,5', hi: '-4,3', side: null },
    { kind: 'beat', a: '1,2', side: null, want: 'lower', both: true },
    { kind: 'between', lo: '-0,4', hi: '-0,2', side: null },
  ],
});

const clamp = (v) => Math.max(RANGE_H[0], Math.min(RANGE_H[1], v));
const snap = (dh, step) => clamp(Math.round(dh / step) * step);
const T = (h) => R.text(BigInt(h));

/** `step` du texte « 1 » / « 0,1 » (ou d'un nombre) en centièmes. */
function stepFrom(x) {
  const h = Number(R.parse(x ?? '1'));
  if (![10, 100].includes(h)) throw new Error(`pas inconnu : ${x}`);
  return h;
}

/** Les tâches normalisées (texte canonique, id, impossible). Lève si une tâche est mal formée. */
function normalizeTasks(list, step) {
  return list.map((t, i) => {
    const base = t.kind === 'between'
      ? { kind: 'between', lo: R.text(t.lo), hi: R.text(t.hi) }
      : { kind: 'beat', a: R.text(t.a), want: t.want, ...(t.both ? { both: true } : {}) };
    const task = { ...base, side: t.side ?? null };
    R.judge(task, 'above', 0n); // lève si la tâche est mal formée
    return Object.freeze({ ...task, id: `z${i}`, impossible: R.isImpossible(task, BigInt(step)) });
  });
}

/** L'état de départ. `numbers` = { world, tasks, step } (`step` : « 1 » ou « 0,1 »). */
export function init(numbers = {}) {
  const world = WORLDS.includes(numbers.world) ? numbers.world : 'sea';
  const step = stepFrom(numbers.step ?? '1');
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner, step);
  if (!tasks.length) throw new Error('aucune tâche');
  return { world, step, tasks, ti: 0, dh: 0, side: tasks[0].side ?? 'above', done: {}, credit: {}, solved: {}, trials: [], last: null, free: null };
}

/* ── Lectures ────────────────────────────────────────────────────────────────────────────────── */

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
/** Le côté qu'on ne peut pas changer (la tâche l'impose) ? */
export const sideLocked = (s) => !s.free && !!taskOf(s).side;
/** Le nombre relatif de B (centièmes) et son texte. */
const valueOf = (s) => R.fromSideDistance(s.side, BigInt(s.dh));
export const valueText = (s) => R.text(valueOf(s));
export const dText = (s) => T(s.dh);
/** Les marques de repère de la scène : A, ou les deux bornes (`between`). */
export function marksOf(s) {
  if (s.free) return [{ id: 'a', text: s.free.a }];
  const t = taskOf(s);
  return t.kind === 'beat' ? [{ id: 'a', text: t.a }] : [{ id: 'lo', text: t.lo }, { id: 'hi', text: t.hi }];
}
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
/** Le jugement exact de la position actuelle (sans la consigner). */
function judgeNow(s) {
  if (s.free) {
    const order = R.cmp(valueOf(s), s.free.a);
    return { ok: false, value: valueOf(s), order, credit: s.dh > 0 ? s.side : null };
  }
  return R.judge(taskOf(s), s.side, BigInt(s.dh));
}
/** Les côtés déjà réussis d'une tâche `both`. */
export const creditOf = (s, i = s.ti) => s.credit[i] ?? {};
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => t.kind === 'release' && !t.free && t.task === i);
const sideTrials = (s, i = s.ti) => s.trials.filter((t) => t.kind === 'side' && t.task === i);
/** Les longueurs (côté + d) déjà essayées en vain dans la tâche. */
const failedLengths = (s, i = s.ti) => new Set(guidedTrials(s, i).filter((t) => !t.ok).map((t) => `${t.side}|${t.d}`));

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

/** Pendant un glisser : la longueur suit la main (arrêtée à 0 et à 10), sans essai. */
export function preview(s, dh) {
  const v = snap(dh, s.step);
  return v === s.dh ? s : { ...s, dh: v };
}

function releaseTrial(s) {
  const j = judgeNow(s);
  const t = s.free ? null : taskOf(s);
  return Object.freeze({
    kind: 'release', task: s.ti, tk: t ? t.kind : 'free', a: s.free ? s.free.a : (t.kind === 'beat' ? t.a : null),
    ...(t && t.kind === 'between' ? { lo: t.lo, hi: t.hi } : {}),
    side: s.side, d: T(s.dh), value: R.text(j.value), ok: j.ok, free: !!s.free, order: j.order,
  });
}

function record(s, trial, credit) {
  let { done, solved, credit: cr } = s;
  if (trial.ok && !s.free && !done[s.ti]) {
    const t = taskOf(s);
    if (t.both) {
      const mine = { ...(cr[s.ti] ?? {}), [credit]: true };
      cr = { ...cr, [s.ti]: mine };
      if (mine.above && mine.below) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; }
    } else {
      done = { ...done, [s.ti]: true };
      solved = { ...solved, [s.ti]: trial };
    }
  }
  return { ...s, done, solved, credit: cr, trials: [...s.trials, trial], last: trial };
}

/** Une longueur LÂCHÉE : elle devient un essai jugé (même inchangée — l'élève a relâché ici). */
export function release(s, dh = s.dh) {
  const next = { ...s, dh: snap(dh, s.step) };
  const trial = releaseTrial(next);
  return record(next, trial, judgeNow(next).credit);
}

/** −/+ : un pas de câble en moins / en plus (un essai). */
export const stepBy = (s, dir) => release(s, s.dh + dir * s.step);

/** Le côté de B (un essai : le côté change, la longueur reste). Sans effet si la tâche l'impose. */
export function setSide(s, side) {
  if (!R.SIDES.includes(side) || sideLocked(s) || side === s.side) return s;
  const moved = { ...s, side, trials: [...s.trials, Object.freeze({ kind: 'side', task: s.ti, side })] };
  return release(moved);
}

/** « لا يوجد طول يحقّق ذلك » : juste si aucune longueur ne convient ; sinon refusé, en montrant UNE longueur qui convient. */
export function pressNone(s) {
  if (s.free) return s;
  const t = taskOf(s);
  const ok = t.impossible;
  const show = ok ? null : R.sample(t, BigInt(s.step));
  const trial = Object.freeze({ kind: 'none', task: s.ti, ok, free: false, ...(show ? { show: { side: show.side, d: T(show.d), value: R.text(show.value) } } : {}) });
  const done = ok && !s.done[s.ti] ? { ...s.done, [s.ti]: true } : s.done;
  const solved = ok && !s.solved[s.ti] ? { ...s.solved, [s.ti]: trial } : s.solved;
  return { ...s, done, solved, trials: [...s.trials, trial], last: trial };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const t = s.tasks[s.ti + 1];
  return { ...s, ti: s.ti + 1, dh: 0, side: t.side ?? s.side, last: null };
}

/** « إعادة » sur la même tâche : le câble remonte à 0, les essais restent (la découverte s'en sert). */
function restartTask(s) { return { ...s, dh: 0, last: null, side: s.free ? s.side : (taskOf(s).side ?? s.side) }; }

/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de zéro — câble à 0, tâche et crédits effacés (les essais restent). */
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return { ...restartTask(s), done: strip(s.done), solved: strip(s.solved), credit: strip(s.credit) };
}
/** « جرّب أعدادك » : un relatif décimal |A| ≤ 9,9 ; null si illisible. */
export const parseFreeA = (raw) => R.parseFree(raw);
export function setFree(s, raw) {
  const a = parseFreeA(raw);
  if (a == null) return s;
  return { ...s, free: { a }, last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, dh: 0, last: null, side: taskOf(s).side ?? s.side } : s);

/* ── Preuves (onTrial) ───────────────────────────────────────────────────────────────────────── */

/** L'événement d'un essai tel que le lit la leçon (sans les champs de travail). */
export function trialEvidence(tr) {
  if (tr.kind === 'side') return { kind: 'side', task: tr.task, side: tr.side };
  if (tr.kind === 'none') return { kind: 'none', task: tr.task, ok: tr.ok, free: false };
  const { order, ...ev } = tr; // eslint-disable-line no-unused-vars
  return ev;
}

/* ── Onboarding (LabCoach) ───────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse ni le sens : `grab` (le nœud du câble), `side` (une tâche à côté libre : les boutons du
 * côté, jamais lequel), `decide` (≥ 3 longueurs essayées en vain dans une tâche où aucune ne convient : le bouton « لا يوجد طول »),
 * `try` (−/+), `next`. `grab` demande la bulle AU-DESSUS du nœud (le câble se déroule dessous), les autres DESSOUS leur cible (rien d'utile sous les commandes : le verdict est au-dessus d'elles). `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-zp-next]', gesture: 'tap', prefer: 'below' } : null;
  const t = taskOf(s);
  const mine = guidedTrials(s);
  if (mine.length === 0) return { id: 'grab', target: '[data-zp-knob]', gesture: 'drag', prefer: 'above' }; // la zone de travail (le câble) est SOUS le nœud
  if (!t.side && sideTrials(s).length === 0) return { id: 'side', target: '[data-zp-sides]', gesture: 'tap', prefer: 'below' };
  if (t.impossible && failedLengths(s).size >= 3) return { id: 'decide', target: '[data-zp-none]', gesture: 'tap', prefer: 'below' };
  return { id: 'try', target: '[data-zp-stepper]', gesture: 'tap', prefer: 'below' };
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

const okTrials = (s) => Object.values(s.solved).filter((t) => t.kind === 'release');
const num = (x) => R.parse(x);

/** مبتدئ — deux négatifs de l'élève : B plus loin du zéro ET plus bas que A (« الأبعد هو الأخفض » sous le zéro). */
export function belowWitness(s) {
  const t = okTrials(s).find((x) => x.a != null && num(x.a) < 0n && num(x.value) < num(x.a));
  return t ? { a: t.a, b: t.value, da: R.text(R.distance(t.a)), db: R.text(R.distance(t.value)) } : { a: '-3', b: '-5', da: '3', db: '5' };
}
/** مبتدئ — deux positifs de l'élève : A plus loin du zéro que B et A plus HAUT (« الأبعد هو الأعلى » au-dessus du zéro). */
export function aboveWitness(s) {
  const t = okTrials(s).find((x) => x.a != null && num(x.a) > 0n && num(x.value) > 0n && num(x.value) < num(x.a));
  return t ? { a: t.a, b: t.value } : { a: '4', b: '2' };
}
/** متقدم — un négatif tout près du zéro, un négatif très loin, un positif : le plus bas est toujours le négatif. */
export function mixWitness(s) {
  const all = okTrials(s);
  const near = all.filter((x) => num(x.value) < 0n).sort((p, q) => Number(R.distance(p.value) - R.distance(q.value)))[0];
  const far = all.filter((x) => num(x.value) < 0n).sort((p, q) => Number(R.distance(q.value) - R.distance(p.value)))[0];
  const pos = s.tasks.find((t) => t.kind === 'beat' && num(t.a) > 0n);
  return { near: near?.value ?? '-0,3', far: far?.value ?? '-4,4', pos: pos?.a ?? '1,2' };
}
