/**
 * fourth-gauges — LA LOGIQUE PURE des « موازين الرابع المتناسب » (2AM, unité 5 « التناسبية », درس « حساب الرابع المتناسب », 2026-10-21).
 * Exacte : toute la mathématique vient de `packages/core/arithmetic/fourthProportional.js` (fractions de `linear.js`, importé PAR CHEMIN).
 *
 * LE MODÈLE. Une planche de prix de marchand : un tableau `[[a, c], [b, d]]` (ligne 1 : quantité, ligne 2 : prix ; colonne 1 = (a, b),
 * colonne 2 = (c, d)). UNE case manque (« le trou » : a, b, c ou d), les trois autres sont imposées. La MAIN tient le nombre qui MANQUE
 * (`hh`, en centièmes : une poignée glisse sur une règle de 0 à `max`, par `step`) ; trois balances d'égalité (« في الكيلو », « بين
 * العمودين », « الجداءان ») s'inclinent sous le doigt — elles ne s'équilibrent ENSEMBLE que pour UN seul nombre. Une 4e balance
 * « الفرق » (le leurre) s'équilibre au MAUVAIS nombre. Ce n'est ni `linear-machine` (la main tient l'entrée x), ni `origin-line`,
 * ni `ratio-ride` (la main tient la durée), ni `percent-tag`, ni `solution-ray`, ni `story-bars` : ici la main tient la case manquante.
 *
 * Une tâche est ACCOMPLIE par un RELÂCHEMENT (fin de glissement, clic −/+, flèche, saisie validée par Entrée) sur le quatrième
 * proportionnel EXACT. Une tâche `decoy: true` demande DEUX relâchements : d'abord celui qui allume « الفرق » (le leurre), puis le
 * vrai (le vrai relâché AVANT le leurre est juste mais n'accomplit pas la tâche). Les balances `covered` sont voilées jusqu'au
 * relâchement : elles se revoilent dès qu'on rebouge, et à la tâche suivante.
 *
 * « جرّب أعدادك » (`free`) : trois nombres a, b, c de l'élève, le trou est `d` ; les essais libres ne comptent jamais.
 */
import * as F from '@smarter-academy/core/arithmetic/fourthProportional.js';
import { add, sub } from '@smarter-academy/core/arithmetic/linear.js';

const WORLDS = Object.freeze(['market']);
const DEFAULT_ROWS = Object.freeze(['الكمية', 'الثمن']);

/** Les tâches par défaut de chaque niveau — les mêmes que `levels.js`. */
export const PRESETS = Object.freeze({
  beginner: [
    { hole: 'd', a: '4', b: '520', c: '6', rows: ['التفاح (kg)', 'الثمن (DA)'], step: '1', max: '1560' },
    { hole: 'c', a: '3', b: '840', d: '1400', rows: ['التمر (kg)', 'الثمن (DA)'], step: '1', max: '10' },
    { hole: 'd', a: '8', b: '400', c: '12', rows: ['البطاطا (kg)', 'الثمن (DA)'], step: '1', max: '1200', decoy: true },
  ],
  advanced: [
    { hole: 'd', a: '2,5', b: '325', c: '4', rows: ['الجزر (kg)', 'الثمن (DA)'], step: '1', max: '1000', covered: true },
    { hole: 'b', a: '6', c: '9', d: '2700', rows: ['الكتلة (kg)', 'الثمن (DA)'], step: '10', max: '5400', covered: true },
    { hole: 'a', b: '720', c: '7,5', d: '1800', rows: ['الكتلة (kg)', 'الثمن (DA)'], step: '0,1', max: '15', covered: true },
    { hole: 'd', a: '12', b: '3', c: '18', rows: ['مساحة الجدار (m²)', 'الدهان (L)'], step: '0,1', max: '10', covered: true },
  ],
});

const T = (hh) => F.decimalText(F.fromHundredths(hh), 2);
const H = (x) => F.toHundredths(x);

/* ── Les tâches ──────────────────────────────────────────────────────────────────────────────── */

/** Les tâches normalisées (textes canoniques, centièmes, réponse, leurre). Lève si une tâche est mal formée ou injouable. */
export function normalizeTasks(list) {
  return list.map((t, i) => {
    if (!F.HOLES.includes(t.hole)) throw new Error(`tâche ${i} : trou inconnu`);
    const nums = {};
    for (const k of F.HOLES) if (k !== t.hole) nums[k] = F.decimalText(F.parse(t[k]), 2);
    const stepH = H(t.step ?? '1');
    const maxH = H(t.max ?? '100');
    if (stepH <= 0 || maxH <= 0 || maxH % stepH !== 0) throw new Error(`tâche ${i} : pas / borne incohérents`);
    const answer = F.solve(t.hole, nums);
    const answerH = (answer.n * 100) / answer.d;
    if (!Number.isInteger(answerH) || answerH % stepH !== 0 || answerH > maxH || answerH <= 0) throw new Error(`tâche ${i} : le quatrième proportionnel ${F.showValue(answer)} n'est pas atteignable`);
    let decoyH = null;
    if (t.decoy) {
      const dv = F.decoyValue(t.hole, nums);
      decoyH = dv ? (dv.n * 100) / dv.d : null;
      if (!Number.isInteger(decoyH) || decoyH % stepH !== 0 || decoyH > maxH || decoyH === answerH) throw new Error(`tâche ${i} : le leurre n'est pas jouable`);
    }
    const rows = t.rows ?? DEFAULT_ROWS;
    return Object.freeze({
      id: `f${i}`, hole: t.hole, nums: Object.freeze(nums), rows: Object.freeze([...rows]), stepH, maxH,
      covered: !!t.covered, decoy: !!t.decoy, answerH, answer: T(answerH), decoyH, decoyText: decoyH == null ? null : T(decoyH),
    });
  });
}

/** L'état de départ. `numbers` = { world, tasks } (les tâches de la leçon, sinon celles du niveau). */
export function init(numbers = {}) {
  const world = WORLDS.includes(numbers.world) ? numbers.world : 'market';
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner);
  if (!tasks.length) throw new Error('aucune tâche');
  return { world, tasks, ti: 0, hh: 0, shown: null, done: {}, solved: {}, decoyLit: {}, opened: { unit: true }, trials: [], last: null, free: null };
}

/* ── Lectures ────────────────────────────────────────────────────────────────────────────────── */

export const isFree = (s) => !!s.free;
/** La tâche courante — ou, en libre, la tâche de l'élève (trou d, ses trois nombres). */
export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const guidedTask = (s) => s.tasks[s.ti];
export const holeOf = (s) => taskOf(s).hole;
/** Le texte du nombre tenu par la main. */
export const hText = (s) => T(s.hh);
/** Les balances pour la valeur `hh` (la quatrième seulement dans une tâche à leurre, jamais en libre). */
export const gaugesAt = (s, hh = s.hh) => {
  const t = taskOf(s);
  return F.gauges(t.hole, t.nums, F.fromHundredths(hh), { decoy: !s.free && t.decoy });
};
/** Les balances telles que l'écran les montre : `null` tant qu'elles sont voilées. */
export const covered = (s) => !s.free && taskOf(s).covered && s.shown == null;
export function gaugesShown(s) {
  if (covered(s)) return null;
  const t = taskOf(s);
  return gaugesAt(s, !s.free && t.covered ? s.shown : s.hh);
}
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => t.kind === 'release' && !t.free && t.task === i);
export const decoyLit = (s) => !s.free && !!s.decoyLit[s.ti];
export const answerOf = (s) => taskOf(s).answerH;
/** Le trou est-il en rangée 1 (a, c = une QUANTITÉ à trouver) ? */
export const holeIsQuantity = (s) => holeOf(s) === 'a' || holeOf(s) === 'c';

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

const clamp = (s, hh) => Math.max(0, Math.min(taskOf(s).maxH, hh));
/** La valeur la plus proche sur la règle (multiple du pas, de 0 à max). */
const snapH = (s, hh) => {
  const step = taskOf(s).stepH;
  return clamp(s, Math.round(hh / step) * step);
};

/** Pendant un glisser : la valeur suit la main (sur la règle), sans essai ; les balances voilées se revoilent. */
export function preview(s, hh) {
  const v = snapH(s, hh);
  const shown = !s.free && taskOf(s).covered ? null : s.shown;
  return v === s.hh && shown === s.shown ? s : { ...s, hh: v, shown };
}

/** Un côté de balance AVEC son calcul : « 520 ÷ 4 = 130 » (exact), ou « 551 ÷ 6 ≈ 91,8 » (jamais la fraction brute à l'élève). */
export function calcText(side) {
  const exact = F.decimalText(side.value, 4);
  const lead = `${F.showValue(side.x)} ${side.op} ${F.showValue(side.y)}`;
  if (exact != null) return `${lead} = ${exact}`;
  const approx = (Number(side.value.n) / Number(side.value.d)).toFixed(1).replace('.', ',');
  return `${lead} ≈ ${approx}`;
}

function detail(g) {
  const out = {};
  for (const k of ['unit', 'between', 'cross', 'diff']) {
    const x = g[k];
    out[k] = x && x.state !== 'off' ? { l: F.sideText(x.left), r: F.sideText(x.right), lc: calcText(x.left), rc: calcText(x.right) } : null;
  }
  return out;
}

/**
 * Une valeur LÂCHÉE (déjà posée sur la règle, ou saisie à la main) : elle devient un essai jugé exactement — même inchangée.
 * `via` : 'drag' | 'step' | 'key' | 'type'.
 */
export function release(s, hh = s.hh, via = 'drag') {
  const t = taskOf(s);
  const v = via === 'type' ? clamp(s, Math.round(hh)) : snapH(s, hh);
  const g = F.gauges(t.hole, t.nums, F.fromHundredths(v), { decoy: !s.free && t.decoy });
  const ok = F.allBalanced(g);
  const hit = !s.free && t.decoy && g.diff.state === 'eq' && !ok;
  let { done, solved, decoyLit: lit } = s;
  if (!s.free) {
    if (hit && !lit[s.ti]) lit = { ...lit, [s.ti]: true };
    if (ok && !done[s.ti] && (!t.decoy || lit[s.ti])) { done = { ...done, [s.ti]: true }; }
  }
  const trial = Object.freeze({
    kind: 'release', task: s.ti, hole: t.hole, value: T(v), ok, gauges: F.statesOf(g), decoyHit: hit, free: !!s.free, via,
    done: !s.free && !!done[s.ti], detail: detail(g),
  });
  if (trial.done && !solved[s.ti]) solved = { ...solved, [s.ti]: trial };
  const trials = [...s.trials, trial];
  // un tableau libre sans solution décimale : l'essai est aussi annoncé comme tel (la leçon en fait une observation)
  if (s.free && s.free.res.kind === 'inexact') trials.push(Object.freeze({ kind: 'infinite', task: s.ti, free: true }));
  return { ...s, hh: v, shown: v, done, solved, decoyLit: lit, trials, last: trial };
}

/** −/+ : un pas en moins / en plus (un essai). */
export const stepBy = (s, dir) => release(s, s.hh + dir * taskOf(s).stepH, 'step');
/** Le clavier sur la poignée : une flèche (un pas), PageUp/PageDown (10 pas), Home / End. */
export function keyRelease(s, key) {
  const step = taskOf(s).stepH;
  const map = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: 10 * step, PageDown: -10 * step };
  if (key in map) return release(s, s.hh + map[key], 'key');
  if (key === 'Home') return release(s, 0, 'key');
  if (key === 'End') return release(s, taskOf(s).maxH, 'key');
  return s;
}

/** « 780 », « ٧٨٠,٥ » → centièmes ou null (≤ 2 décimales, 0 … max). */
function parseTyped(s, raw) {
  try {
    const f = F.parse(String(raw));
    const hh = (f.n * 100) / f.d;
    return Number.isInteger(hh) && hh <= taskOf(s).maxH ? hh : null;
  } catch { return null; }
}
/** La saisie directe validée par Entrée : un essai jugé exactement (pas besoin d'être sur la graduation). */
export function typeValue(s, raw) {
  const hh = parseTyped(s, raw);
  return hh == null ? s : release(s, hh, 'type');
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, hh: 0, shown: null, last: null };
}
/** « إعادة » sur la même tâche : la poignée revient à 0, les essais restent (la découverte s'en sert). */
export function restartTask(s) { return { ...s, hh: 0, shown: null, last: null }; }

/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de zéro — poignée à 0, tâche, leurre et réussite effacés (les essais restent). */
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return { ...restartTask(s), done: strip(s.done), solved: strip(s.solved), decoyLit: strip(s.decoyLit) };
}

/** Ouvre / ferme les deux nombres exacts sous une balance. */
export function toggleGauge(s, id) {
  if (!['unit', 'between', 'cross', 'diff'].includes(id)) return s;
  return { ...s, opened: { ...s.opened, [id]: !s.opened[id] } };
}

/* ── « جرّب أعدادك » : a, b, c de l'élève, le trou est d ───────────────────────────────────────── */

/** Les trois nombres lus → { a, b, c, res } ou null s'ils sont illisibles / trop grands / trop petits pour la règle. */
export function freeFrom(a, b, c) {
  const na = F.parseFree(a); const nb = F.parseFree(b); const nc = F.parseFree(c);
  if (!na || !nb || !nc) return null;
  const res = F.freeAnswer(na, nb, nc);
  if (res.kind === 'range') return null;
  return { a: na, b: nb, c: nc, res };
}
export function setFree(s, a, b, c) {
  const f = freeFrom(a, b, c);
  if (!f) return s;
  const base = s.free ? s.free.task.rows : guidedTask(s).rows;
  const task = Object.freeze({
    id: 'free', hole: 'd', nums: Object.freeze({ a: f.a, b: f.b, c: f.c }), rows: base, stepH: f.res.step, maxH: f.res.max,
    covered: false, decoy: false, answerH: f.res.kind === 'exact' ? (f.res.h.n * 100) / f.res.h.d : null,
    answer: f.res.kind === 'exact' ? f.res.text : null, decoyH: null, decoyText: null,
  });
  return { ...s, free: { a: f.a, b: f.b, c: f.c, res: f.res, task }, hh: 0, shown: null, last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, hh: 0, shown: null, last: null } : s);
/** Le message de « جرّب أعدادك » pour un tableau sans solution décimale (le texte du quatrième proportionnel). */
export const freeInexact = (s) => (s.free && s.free.res.kind === 'inexact' ? s.free.res : null);

/* ── Preuves (onTrial) ───────────────────────────────────────────────────────────────────────── */

/** L'événement d'un essai tel que le lit la leçon (sans les champs de travail). */
export function trialEvidence(tr) {
  if (tr.kind === 'infinite') return { kind: 'infinite', task: tr.task, free: true };
  const { detail: _detail, ...ev } = tr; // eslint-disable-line no-unused-vars
  return ev;
}

/* ── Onboarding (LabCoach) ───────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse ni la règle : `grab` (la poignée), `decoy` (le leurre : la balance « الفرق » à allumer),
 * `gauge` (ouvrir les deux nombres de la balance « الجداءان » : seulement quand les nombres ne sont pas déjà tous écrits, `roomy` faux),
 * `try` (−/+), `next`. `grab` : la bulle est SOUS la poignée (la règle est au bas de la scène : sous elle, c'est la consigne du geste,
 * jamais le tableau ni les balances) ; `gauge` / `decoy` : AU-DESSUS de la balance (le tableau est un décor lisible ailleurs).
 * `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s, { roomy = false } = {}) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-fg-next]', gesture: 'tap', prefer: 'below' } : null;
  const t = taskOf(s);
  const mine = guidedTrials(s);
  if (mine.length === 0) return { id: 'grab', target: '[data-fg-knob]', gesture: 'drag', prefer: 'below', noFlip: true };
  if (t.decoy && !s.decoyLit[s.ti]) return { id: 'decoy', target: '[data-fg-gauge=diff]', gesture: 'tap', prefer: 'above', noFlip: true };
  if (!roomy && mine.length >= 2 && !s.opened.cross) return { id: 'gauge', target: '[data-fg-gauge=cross]', gesture: 'tap', prefer: 'above', noFlip: true };
  return { id: 'try', target: '[data-fg-stepper]', gesture: 'tap', prefer: 'below' };
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

const okTrials = (s) => Object.values(s.solved).filter((t) => t.kind === 'release');
const decoyTrials = (s) => s.trials.filter((t) => t.kind === 'release' && !t.free && t.decoyHit);

/** مبتدئ — SON relâchement juste : les trois balances à l'égalité ensemble (« une seule à la fois » est réfutée). */
export function rightWitness(s) {
  const tr = okTrials(s)[0];
  if (tr) return { v: tr.value, l: tr.detail.unit?.l ?? tr.value, r: tr.detail.unit?.r ?? tr.value };
  const t = s.tasks.find((x) => !x.decoy) ?? s.tasks[0];
  return { v: t.answer, l: '130', r: '130' };
}
/** مبتدئ — SON essai au leurre : « الفرق » égale, les autres non (« الفرق يتوازن معها دائمًا » est réfutée). */
export function decoyWitness(s) {
  const tr = decoyTrials(s)[0];
  if (tr) return { v: tr.value, dl: tr.detail.diff?.l ?? '4', dr: tr.detail.diff?.r ?? '4', cl: tr.detail.cross?.l ?? '', cr: tr.detail.cross?.r ?? '', dlc: tr.detail.diff?.lc ?? '', drc: tr.detail.diff?.rc ?? '', clc: tr.detail.cross?.lc ?? '', crc: tr.detail.cross?.rc ?? '' };
  const t = s.tasks.find((x) => x.decoy);
  return t ? { v: t.decoyText, dl: '4', dr: '4', cl: '4800', cr: '3232' } : { v: '404', dl: '4', dr: '4', cl: '4800', cr: '3232' };
}
/**
 * متقدم — « جمع الفرق نفسه » avec SES nombres : la dernière tâche à trou `d` : la quantité passe de a à c (de w), ajouter ce w au prix
 * b donne `naive`, le prix juste est `good`.
 */
export function addWitness(s) {
  const t = [...s.tasks].reverse().find((x) => x.hole === 'd');
  if (!t) return { a: '12', b: '3', c: '18', w: '6', naive: '9', good: '4,5' };
  const w = sub(F.parse(t.nums.c), F.parse(t.nums.a));
  return { a: t.nums.a, b: t.nums.b, c: t.nums.c, w: F.showValue(w), naive: F.showValue(add(F.parse(t.nums.b), w)), good: t.answer };
}

/* ── Phase formelle : les cinq chemins avec SES nombres ─────────────────────────────────────── */

/** La tâche dont le دفتر écrit les cinq chemins : la dernière du niveau. `{ task, r (routes), table (les quatre nombres) }`. */
export function formalOf(s) {
  const task = s.tasks[s.tasks.length - 1];
  const r = F.routes(task.hole, task.nums);
  const table = { ...task.nums, [task.hole]: task.answer };
  return { task, r, table };
}
