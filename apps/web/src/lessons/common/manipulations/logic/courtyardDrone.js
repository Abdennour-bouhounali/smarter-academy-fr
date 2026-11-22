/**
 * La LOGIQUE du labo `courtyard-drone` (« مسيّرة الساحة », 1AM unité 5, درس « التعليم في المستوي », 2026-10-30) — pure, sans React.
 * L'arithmétique est entière et exacte, en DIXIÈMES d'unité (`packages/core/arithmetic/planeFrame.js`, importé PAR CHEMIN).
 *
 * Une TÂCHE : `{ id, kind: 'fly' | 'read', paper: 'squared' | 'plain', reads: [{ x, y, what }] }` (x, y en dixièmes). La main conduit UN drone au-dessus du plan d'une cour d'école (l'origine est le mât du drapeau, deux lignes
 * peintes sont les axes) : D'ABORD le long de l'axe horizontal (phase `x`), puis, l'abscisse fixée, le long de la verticale (phase `y`). Le drone REFUSE une diagonale : un geste qui sort de l'axe actif, ou une touche
 * de l'autre axe, est un refus (`refuse`), jamais un déplacement. « التقط الصورة » (`record`) n'est possible qu'à la fin de la phase `y`.
 *   `fly`   les nombres (x ; y) du lieu à photographier sont DITS (« النافورة عند (3 ; −2) ») : la main les applique dans le bon ORDRE ; mettre −2 d'abord sur l'axe horizontal mène à (−2 ; 3), un autre lieu.
 *   `read`  l'objet est DESSINÉ sur le plan : la main amène le drone dessus en deux temps, la pastille lit (x ; y) en direct (le couple est une SORTIE de la main) ; la lecture est ensuite posée en question.
 * `paper: 'squared'` montre le quadrillage de la cour ; `'plain'` ne montre que les deux axes gradués : le drone projette alors ses deux parallèles aux axes (pointillés).
 * Un enregistrement faux n'est jamais corrigé : il est jugé (`judge`) et le modèle d'erreur dit CE qui a été fait avec les nombres de l'élève, jamais le bon lieu.
 */
import * as P from '@smarter-academy/core/arithmetic/planeFrame.js';

const KINDS = Object.freeze(['fly', 'read']);
const PAPERS = Object.freeze(['squared', 'plain']);
/** Les objets de la cour qu'une lecture peut désigner (le décor les dessine). */
const THINGS = Object.freeze(['fountain', 'door', 'bench', 'tap', 'gate', 'kiosk', 'tree', 'board', 'chair', 'well']);
/** Le cadre de la cour : |x| ≤ 5, |y| ≤ 4 (en dixièmes). */
const BOX = Object.freeze({ x: 50, y: 40 });
export const FREE_LIMIT = Object.freeze({ x: 50, y: 40 });

const bad = (m) => { throw new Error(`courtyard-drone : ${m}`); };

export function normalizeTasks(list) {
  return (list ?? []).map((t) => {
    if (!t || typeof t.id !== 'string') bad('tâche sans id');
    if (!KINDS.includes(t.kind)) bad(`genre inconnu : ${t.kind}`);
    const paper = t.paper ?? 'squared';
    if (!PAPERS.includes(paper)) bad(`papier inconnu : ${t.paper}`);
    const advanced = /^a\d/.test(t.id);
    const grain = advanced ? 5 : P.TENTH;
    const reads = (t.reads ?? []).map((r) => {
      if (!r || !Number.isInteger(r.x) || !Number.isInteger(r.y)) bad(`lecture illisible ${JSON.stringify(r)}`);
      if (r.x % grain !== 0 || r.y % grain !== 0) bad(`lecture hors du pas (${grain}) : ${JSON.stringify(r)}`);
      if (!P.inBox(r, BOX.x, BOX.y)) bad(`lecture hors du cadre : ${JSON.stringify(r)}`);
      if (r.x === 0 && r.y === 0) bad('une lecture ne peut pas être l\'origine');
      if (r.what != null && !THINGS.includes(r.what)) bad(`objet inconnu : ${r.what}`);
      // l'échange doit RESTER dans le cadre (sinon l'erreur d'ordre serait inatteignable)
      if (t.kind === 'fly' && !P.swapIsSame(r) && !P.inBox(P.swap(r), BOX.x, BOX.y)) bad(`l'échange de ${JSON.stringify(r)} sort du cadre`);
      return { x: r.x, y: r.y, what: r.what ?? 'fountain' };
    });
    if (!reads.length) bad(`tâche ${t.id} sans lecture`);
    return Object.freeze({ id: t.id, kind: t.kind, paper, grain, reads: Object.freeze(reads), advanced });
  });
}

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', kind: 'fly', paper: 'squared', reads: [{ x: 30, y: -20, what: 'fountain' }, { x: -40, y: 10, what: 'door' }] },
    { id: 'b2', kind: 'fly', paper: 'squared', reads: [{ x: 40, y: 0, what: 'bench' }, { x: 0, y: -30, what: 'tap' }] },
    { id: 'b3', kind: 'read', paper: 'squared', reads: [{ x: -30, y: 20, what: 'gate' }, { x: 20, y: -40, what: 'kiosk' }] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'read', paper: 'squared', reads: [{ x: 15, y: -30, what: 'chair' }, { x: -25, y: 15, what: 'board' }] },
    { id: 'a2', kind: 'read', paper: 'plain', reads: [{ x: -40, y: 30, what: 'tree' }, { x: 35, y: -20, what: 'well' }] },
    { id: 'a3', kind: 'fly', paper: 'plain', reads: [{ x: 25, y: -15, what: 'fountain' }, { x: -10, y: 5, what: 'bench' }] },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) bad('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}

/** Le drone part TOUJOURS du mât (0 ; 0), sur l'axe horizontal : jamais le bon lieu ni une position qui donne la réponse. */
function fresh(s) {
  return { ...s, ri: 0, phase: 'x', x: 0, y: 0, moved: false, movedY: false, refusals: 0, log: [], last: null };
}
const rearm = (s) => ({ ...s, phase: 'x', x: 0, y: 0, moved: false, movedY: false });

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.advanced);
/** Le point où se trouve le drone (dixièmes). */
export const dronePos = (s) => (s.free ? { x: s.free.x, y: s.free.y } : { x: s.x, y: s.y });
/** Le pas de la main : une case (un demi-case au niveau متقدم) ; la droite libre : un dixième. */
const grainOf = (s) => (s.free ? 1 : taskOf(s).grain);
export const axisOf = (s) => (s.phase === 'x' ? 'x' : 'y');
export const limitOf = (axis) => (axis === 'x' ? BOX.x : BOX.y);

/* ── Le geste : la main conduit le drone, un axe à la fois ── */
const snap = (v, g, lim) => Math.max(-lim, Math.min(lim, Math.round(v / g) * g)) || 0;

/** Pose le drone sur l'axe ACTIF à la valeur `v` (dixièmes) ; l'autre axe ne bouge jamais. */
export function setActive(s, v) {
  if (s.free || taskDone(s)) return s;
  const g = grainOf(s);
  if (s.phase === 'x') {
    const next = snap(v, g, BOX.x);
    if (next === s.x) return s;
    return { ...s, x: next, moved: true, last: s.last?.ok ? null : s.last };
  }
  const next = snap(v, g, BOX.y);
  if (next === s.y) return s;
  return { ...s, y: next, movedY: true, last: s.last?.ok ? null : s.last };
}
/** Une touche : `axis` ('x' | 'y') et un nombre de pas ; l'autre axe est un REFUS (le drone ne fait pas de diagonale). */
export function move(s, axis, steps) {
  if (s.free || taskDone(s)) return s;
  if (axis !== axisOf(s)) return refuse(s, axis);
  const cur = axis === 'x' ? s.x : s.y;
  return setActive(s, cur + steps * grainOf(s));
}
/** Le refus : le drone ne bouge pas ; `axis` dit l'axe que la main a tenté (la diagonale = l'axe inactif). */
export function refuse(s, axis = axisOf(s) === 'x' ? 'y' : 'x') {
  if (s.free || taskDone(s)) return s;
  return { ...s, refusals: s.refusals + 1, last: Object.freeze({ kind: 'refuse', ok: null, axis, phase: s.phase, bad: 0 }) };
}
/** « ثبّت الفاصلة » : l'abscisse est fixée, le drone ne pourra plus que monter ou descendre. */
export function lock(s) {
  if (s.free || taskDone(s) || s.phase !== 'x') return s;
  return { ...s, phase: 'y', y: 0, movedY: false, last: s.last?.ok ? null : s.last };
}
/** « عُد إلى المحور » : le drone redescend sur l'axe horizontal (ordonnée 0) et l'abscisse peut changer. */
export function unlock(s) {
  if (s.free || taskDone(s) || s.phase !== 'y') return s;
  return { ...s, phase: 'x', y: 0, movedY: false, last: null };
}

/* ── Le jugement d'un enregistrement ── */
/** `judge(read, pos)` → `{ ok, model }`. Les modèles disent ce que l'élève a fait avec SES nombres. */
export function judge(read, pos) {
  if (P.same(read, pos)) return { ok: true, model: 'right' };
  if (!P.swapIsSame(read) && P.same(P.swap(read), pos)) return { ok: false, model: 'swap' };
  if (pos.x === -read.x && pos.y === read.y && read.x !== 0) return { ok: false, model: 'signx' };
  if (pos.x === read.x && pos.y === -read.y && read.y !== 0) return { ok: false, model: 'signy' };
  if (pos.x === -read.x && pos.y === -read.y) return { ok: false, model: 'signs' };
  if (P.matching(read, pos) === 1) return { ok: false, model: 'one' };
  return { ok: false, model: 'other' };
}

export function record(s) {
  if (s.free || taskDone(s) || s.phase !== 'y') return s;
  const task = taskOf(s);
  const read = task.reads[s.ri];
  const pos = { x: s.x, y: s.y };
  const verdict = judge(read, pos);
  const trial = Object.freeze({ kind: 'record', ok: verdict.ok, model: verdict.model, id: task.id, ri: s.ri, x: s.x, y: s.y, refusals: s.refusals, bad: verdict.ok ? 0 : 1 });
  const trials = [...s.trials, trial];
  if (!verdict.ok) return { ...s, trials, last: trial };
  const log = [...s.log, { ri: s.ri, x: s.x, y: s.y }];
  const finished = s.ri === task.reads.length - 1;
  const base = { ...s, trials, log, last: trial, ...(finished ? { done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } } : { ri: s.ri + 1 }) };
  // un lieu photographié : le drone retourne au mât pour la lecture suivante (le dernier reste posé)
  return finished ? base : { ...rearm(base), refusals: 0 };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : un couple (x ; y) avec |x| ≤ 5 et |y| ≤ 4 (un chiffre après la virgule) sur le plan libre ── */
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export function parseCoord(raw, limit) {
  const t = String(raw ?? '').replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace(/[٫،,]/g, '.').replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/^\+/, '');
  const m = /^(-?)(\d{1,2})(?:\.(\d))?$/.exec(t);
  if (!m) return null;
  const v = Number(m[2]) * P.TENTH + Number(m[3] ?? 0);
  return v > limit ? null : (m[1] ? -v : v) || 0;
}
/** Applique un couple de textes ; si l'un est illisible ou hors du cadre, rien ne change. */
export function setFree(s, rawX, rawY) {
  const x = parseCoord(rawX, FREE_LIMIT.x);
  const y = parseCoord(rawY, FREE_LIMIT.y);
  if (x === null || y === null) return s;
  return { ...s, free: { x, y }, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** Ce que le plan libre dit du point : ses nombres échangés, son axe, ses symétriques, son quart de plan. */
export function freeInfo(s) {
  if (!s.free) return null;
  const p = { x: s.free.x, y: s.free.y };
  return { p, axis: P.onAxis(p), swapped: P.swap(p), swapSame: P.swapIsSame(p), reflX: P.reflectX(p), reflY: P.reflectY(p), quadrant: P.quadrant(p) };
}

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) : la pastille suit le geste utile MAINTENANT, jamais la réponse ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-cd-next]', gesture: 'tap', prefer: 'below' } : null;
  if (s.last && s.last.ok === false) return { id: 'again', target: s.phase === 'y' ? '[data-cd-unlock]' : '[data-cd-knob]', gesture: s.phase === 'y' ? 'tap' : 'drag', prefer: 'above' };
  if (s.phase === 'x') return s.moved ? { id: 'lock', target: '[data-cd-lock]', gesture: 'tap', prefer: 'below' } : { id: 'driveX', target: '[data-cd-knob]', gesture: 'drag', prefer: 'above' };
  return s.movedY ? { id: 'record', target: '[data-cd-record]', gesture: 'tap', prefer: 'below' } : { id: 'driveY', target: '[data-cd-knob]', gesture: 'drag', prefer: 'above' };
}
