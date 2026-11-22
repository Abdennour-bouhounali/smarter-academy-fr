/**
 * pythagoras-tanks — la LOGIQUE PURE du labo « خزّانات فيثاغورس » (3AM, unité 11, درس « خاصية فيثاغورس », 2026-10-20).
 * Tout verdict vient de `packages/core/arithmetic/pythagoras.js` (importé PAR CHEMIN) ; les flottants ne servent qu'à DESSINER.
 *
 * La machine : un triangle ABC, A charnière, [AB] (= c) posé sur la table, [AC] (= b) un bras qui tourne autour de A ; sur chaque
 * côté un bassin carré mince (même épaisseur : l'eau se mesure en AIRE). Les deux petits bassins (sur AB et AC) sont pleins :
 * b² + c² d'eau. « اسكب » verse tout dans le grand bassin (sur BC), qui contient BC².
 *   mode 'angle'  (مبتدئ) : la main tient l'ANGLE en A (entier, 30°…150°) ; tâches `fill` (le remplir tout juste) puis `compare`
 *                 (verser avec un angle plus petit ET plus grand).
 *   mode 'length' (متقدم) : la main tient la LONGUEUR BC (au dixième, sur un ruban) ; tâches `thirteen` (5 et 12) puis `surd`
 *                 (2 et 3 : aucun dixième ne remplit ; la touche √ donne √13 exact).
 * Les essais de « جرّب أعدادك » portent `free: true` et ne comptent jamais pour les tâches ni la découverte.
 */
import { frac, cmp } from '@smarter-academy/core/arithmetic/linear.js';
import * as PY from '@smarter-academy/core/arithmetic/pythagoras.js';

export const ANGLE_MIN = 30;
export const ANGLE_MAX = 150;
export const FREE_MIN = 1;
export const FREE_MAX = 12;
const ROOT_AFTER = 2;
/** Le ruban (mode longueur) couvre les longueurs BC des angles 50° … 130° : le grand bassin reste à la taille de la scène. */
export const TAPE_ANGLES = [50, 130]; // la touche √ s'ouvre après deux versements sans succès (la tâche `surd`)

const num = (x) => { const f = typeof x === 'object' ? x : frac(Math.round(Number(String(x).replace(',', '.')) * 1000), 1000); return f.n / f.d; };
const legTxt = (x) => String(x).replace('.', ',');

/** Les nombres du niveau → l'état initial. `numbers` : { mode, b, c } (les côtés de la PREMIÈRE machine ; la suite vient de `defaultTasks`). */
export function init(numbers) {
  const mode = numbers?.mode === 'length' ? 'length' : 'angle';
  const tasks = defaultTasks(mode, numbers?.b, numbers?.c).map((t) => ({ id: t.id, b: legTxt(t.b), c: legTxt(t.c) }));
  return place({ mode, tasks, ti: 0, done: tasks.map(() => false), free: null, trials: [], events: [], last: null, pour: null, angle: 60, tenths: 0, exact: false });
}

/** Les tâches d'un mode : angle → `fill` puis `compare` sur la même machine ; longueur → `thirteen` puis `surd` (2 et 3 : √13). */
function defaultTasks(mode, b, c) {
  return mode === 'length'
    ? [{ id: 'thirteen', b: b ?? '5', c: c ?? '12' }, { id: 'surd', b: '2', c: '3' }]
    : [{ id: 'fill', b: b ?? '3', c: c ?? '4' }, { id: 'compare', b: b ?? '3', c: c ?? '4' }];
}

/** Les deux côtés de l'angle droit de la machine affichée (la tâche, ou les nombres libres). */
export const legsOf = (s) => (s.free ? s.free : { b: s.tasks[s.ti].b, c: s.tasks[s.ti].c });
export const taskOf = (s) => (s.free ? 'free' : s.tasks[s.ti].id);
export const isFree = (s) => Boolean(s.free);

/** BC (flottant) pour un angle en degrés. */
const bcAt = (b, c, deg) => Math.sqrt(Math.max(0, PY.capAtAngle(b, c, deg)));

/** Les bornes du ruban (en dixièmes) : les longueurs BC des angles `TAPE_ANGLES`. */
export function tapeRange(s) {
  const { b, c } = legsOf(s);
  return { lo: Math.ceil(bcAt(b, c, TAPE_ANGLES[0]) * 10 - 1e-9), hi: Math.floor(bcAt(b, c, TAPE_ANGLES[1]) * 10 + 1e-9) };
}

/** Remet la machine en position de départ (angle 60°, ou le dixième le plus proche de 60°) — bassins pleins. */
function place(s) {
  const { b, c } = legsOf(s);
  const tenths = Math.round(bcAt(b, c, 60) * 10);
  const r = { ...s, angle: 60, tenths, exact: false, pour: null };
  if (s.mode === 'length') r.tenths = Math.min(Math.max(tenths, tapeRange(r).lo), tapeRange(r).hi);
  return r;
}

/** La longueur BC tenue : texte et valeur exacte (fraction) — ou √n exact après la touche √. */
export function bcOf(s) {
  const { b, c } = legsOf(s);
  if (s.mode === 'length') {
    if (s.exact) { const side = PY.sideFrom({ legs: [b, c] }); return { text: side.text, square: side.square, value: Math.sqrt(num(side.square)), exact: true }; }
    const f = frac(s.tenths, 10);
    return { text: PY.decText(f), square: PY.square(f), value: s.tenths / 10, exact: false };
  }
  const v = bcAt(b, c, s.angle);
  return { text: null, square: s.angle === 90 ? PY.hypotenuseSquare(b, c) : null, value: v, exact: s.angle === 90 };
}

/** L'angle en A (degrés flottants) : tenu (mode angle) ou suivi (mode longueur, loi des cosinus). */
export function angleOf(s) {
  if (s.mode === 'angle') return s.angle;
  const { b, c } = legsOf(s);
  const bv = num(b); const cv = num(c); const a = bcOf(s).value;
  const cos = (bv * bv + cv * cv - a * a) / (2 * bv * cv);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** L'eau (b² + c², exacte) et la contenance du grand bassin (BC², exacte quand elle l'est, sinon flottante). */
export function amounts(s) {
  const { b, c } = legsOf(s);
  const water = PY.hypotenuseSquare(b, c);
  const bc = bcOf(s);
  const cap = bc.square ? num(bc.square) : bc.value * bc.value;
  return { water, waterN: num(water), small: [num(PY.square(b)), num(PY.square(c))], cap, capExact: bc.square };
}

/** Le verdict d'un versement MAINTENANT (exact, déborde, vide) — jamais par un flottant. */
export function verdictOf(s) {
  if (s.mode === 'angle') return PY.angleVerdict(s.angle);
  const { water } = amounts(s);
  return PY.pourVerdict(cmp(bcOf(s).square, water));
}

/** Un nombre à deux décimales au plus, virgule (affichage seulement). */
export const show = (x) => (Math.round(x * 100) / 100).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

const evt = (s, e) => ({ ...s, events: [...s.events, e], last: e });

/** Tourner le bras : un angle entier (mode angle). */
export function setAngle(s, deg) {
  if (s.mode !== 'angle') return s;
  const d = Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, Math.round(deg)));
  if (d === s.angle && !s.pour) return s;
  return evt({ ...s, angle: d, pour: null }, { kind: 'turn', mode: 'angle', angle: d, free: isFree(s) });
}

/** Étirer le ruban : un nombre entier de dixièmes (mode longueur). */
export function setTenths(s, t) {
  if (s.mode !== 'length') return s;
  const { lo, hi } = tapeRange(s);
  const v = Math.max(lo, Math.min(hi, Math.round(t)));
  if (v === s.tenths && !s.exact && !s.pour) return s;
  return evt({ ...s, tenths: v, exact: false, pour: null }, { kind: 'stretch', mode: 'length', bc: PY.decText(frac(v, 10)), free: isFree(s) });
}

/** Un cran (± 1° ou ± 0,1). */
export const nudge = (s, d) => (s.mode === 'angle' ? setAngle(s, s.angle + d) : setTenths(s, (s.exact ? Math.round(bcOf(s).value * 10) : s.tenths) + d));

/** Les versements de la tâche en cours (hors essais libres). */
const taskTrials = (s) => s.trials.filter((t) => !t.free && t.task === taskOf(s));

/** La touche √ est-elle disponible ? (mode longueur : dans la tâche `surd` après deux versements, toujours en libre). */
export function canRoot(s) {
  if (s.mode !== 'length' || s.exact) return false;
  if (isFree(s)) return true;
  return taskOf(s) === 'surd' && taskTrials(s).length >= ROOT_AFTER;
}

/** La touche √ : le ruban se règle sur la longueur EXACTE √(b² + c²). */
export function useRoot(s) {
  if (!canRoot(s)) return s;
  const { b, c } = legsOf(s);
  const side = PY.sideFrom({ legs: [b, c] });
  return evt({ ...s, exact: true, pour: null }, { kind: 'root', mode: 'length', value: side.text, screen: PY.screenSqrt(side.square), rounded: side.rounded(2), free: isFree(s) });
}

/** Une tâche est-elle faite, d'après les essais ? */
function taskDoneBy(task, trials) {
  const own = trials.filter((t) => !t.free);
  if (task === 'fill' || task === 'thirteen') return own.some((t) => t.task === task && t.verdict === 'exact');
  if (task === 'compare') {
    const mine = own.filter((t) => t.mode === 'angle');
    return mine.some((t) => t.verdict === 'over') && mine.some((t) => t.verdict === 'gap') && mine.some((t) => t.verdict === 'exact');
  }
  if (task === 'surd') return own.some((t) => t.task === 'surd' && t.verdict === 'exact' && t.root);
  return false;
}

/** « اسكب » : un ESSAI validé. */
export function pour(s) {
  if (s.pour) return s;
  const verdict = verdictOf(s);
  const a = amounts(s);
  const { b, c } = legsOf(s);
  const bc = bcOf(s);
  const trial = {
    kind: 'pour', mode: s.mode, task: taskOf(s), verdict, free: isFree(s),
    b: legTxt(b), c: legTxt(c),
    angle: s.mode === 'angle' ? s.angle : Math.round(angleOf(s)),
    bc: bc.text ?? show(bc.value),
    root: s.mode === 'length' && s.exact,
    water: PY.decText(a.water),
    cap: a.capExact ? PY.decText(a.capExact) : show(a.cap),
    capExact: Boolean(a.capExact),
    diff: verdict === 'exact' ? '0' : show(Math.abs(a.waterN - a.cap)),
  };
  const trials = [...s.trials, trial];
  const done = s.tasks.map((t, i) => s.done[i] || taskDoneBy(t.id, trials));
  let r = evt({ ...s, trials, done, pour: { verdict, ...trial } }, trial);
  const i = s.ti;
  if (!s.free && done[i] && !s.done[i]) r = evt(r, { kind: 'task', task: s.tasks[i].id, free: false });
  return r;
}

export const taskDone = (s) => !s.free && Boolean(s.done[s.ti]);
const allDone = (s) => s.done.every(Boolean);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;

/** « أعِد التجربة » (carte de questions) : la MÊME tâche repart — ses versements sont effacés, la machine revient au départ. */
export function restartTask(s) {
  if (s.free) return s;
  const id = s.tasks[s.ti].id;
  const trials = s.trials.filter((t) => t.free || t.task !== id);
  const done = s.tasks.map((_, i) => (i === s.ti ? false : s.done[i]));
  return evt(place({ ...s, trials, done }), { kind: 'retry', task: id, free: false });
}

/** La tâche suivante (la machine change seulement si ses côtés changent). */
export function nextTask(s) {
  if (!canNext(s)) return s;
  const r = { ...s, ti: s.ti + 1 };
  const same = r.tasks[r.ti].b === s.tasks[s.ti].b && r.tasks[r.ti].c === s.tasks[s.ti].c;
  return evt(same ? { ...r, pour: null } : place(r), { kind: 'next', task: r.tasks[r.ti].id, free: false });
}

/** La découverte s'ouvre quand TOUTES les tâches du niveau sont faites (contraste compris). */
export const discoveryReady = (s) => allDone(s);

/** « جرّب أعدادك » : une machine libre (côtés entiers 1…12), sans jamais toucher aux tâches. */
export function setFree(s, b, c) {
  const clamp = (x) => Math.max(FREE_MIN, Math.min(FREE_MAX, Math.round(Number(x))));
  const f = { b: String(clamp(b)), c: String(clamp(c)) };
  return evt(place({ ...s, free: f }), { kind: 'free', b: f.b, c: f.c, free: true });
}
export function toGuided(s) {
  if (!s.free) return s;
  const first = s.done.findIndex((d) => !d);
  const ti = first === -1 ? s.ti : first;
  return evt(place({ ...s, free: null, ti }), { kind: 'guided', task: s.tasks[ti].id, free: false });
}

/** Les essais qui RÉFUTENT les conjectures fausses (les nombres de l'élève). */
export function witnesses(s) {
  const own = s.trials.filter((t) => !t.free && t.kind === 'pour');
  return {
    over: own.find((t) => t.verdict === 'over') ?? null,
    gap: own.find((t) => t.verdict === 'gap') ?? null,
    exact: own.find((t) => t.verdict === 'exact' && !t.root) ?? null,
    root: own.find((t) => t.verdict === 'exact' && t.root) ?? null,
    tape: own.filter((t) => t.task === 'surd' && !t.root),
  };
}

/** La règle formelle avec les nombres de l'élève. */
export function formalOf(s) {
  const w = witnesses(s);
  const t0 = s.tasks[0];
  const sq = (x) => PY.decText(PY.square(x));
  const side = PY.sideFrom({ legs: [t0.b, t0.c] });
  const out = { b: t0.b, c: t0.c, bb: sq(t0.b), cc: sq(t0.c), sum: PY.decText(side.square), bc: side.text, notRight: w.over ?? w.gap };
  if (s.mode === 'length' && s.tasks[1]) {
    const t1 = s.tasks[1];
    const s1 = PY.sideFrom({ legs: [t1.b, t1.c] });
    out.surd = { b: t1.b, c: t1.c, bb: sq(t1.b), cc: sq(t1.c), sum: PY.decText(s1.square), text: s1.text, screen: PY.screenSqrt(s1.square), rounded: s1.rounded(2) };
  }
  return out;
}

/* ══════════════ La géométrie du dessin (flottants : jamais un verdict) ══════════════ */

const sub2 = (p, q) => [p[0] - q[0], p[1] - q[1]];
const add2 = (p, q) => [p[0] + q[0], p[1] + q[1]];

/** Le carré construit à l'EXTÉRIEUR du triangle sur [PQ] (R est le troisième sommet) : [P, Q, Q', P']. */
function outerSquare(P, Q, R) {
  const d = sub2(Q, P);
  let n = [-d[1], d[0]];
  const toR = sub2(R, P);
  if (n[0] * toR[0] + n[1] * toR[1] > 0) n = [-n[0], -n[1]];
  return [P, Q, add2(Q, n), add2(P, n)];
}

/** Les points (repère maths, y vers le haut) : A à l'origine, B sur l'axe, C au bout du bras, et les trois bassins. */
export function machine(b, c, deg) {
  const bv = num(b); const cv = num(c);
  const th = (deg * Math.PI) / 180;
  const A = [0, 0]; const B = [cv, 0]; const C = [bv * Math.cos(th), bv * Math.sin(th)];
  return { A, B, C, sqAB: outerSquare(A, B, C), sqAC: outerSquare(A, C, B), sqBC: outerSquare(B, C, A) };
}

/** La machine de l'état courant. */
export const machineOf = (s) => { const { b, c } = legsOf(s); return machine(b, c, angleOf(s)); };

/** Les angles que la machine peut prendre : tous (mode angle), ceux du ruban (mode longueur). */
export const angleSpan = (mode) => (mode === 'length' ? TAPE_ANGLES : [ANGLE_MIN, ANGLE_MAX]);

/** La boîte englobante d'une machine sur TOUTE sa course (l'échelle ne bouge pas sous le doigt). */
export function sweepBox(b, c, [from, to] = [ANGLE_MIN, ANGLE_MAX]) {
  let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
  for (let d = from; d <= to; d += 1) {
    const m = machine(b, c, d);
    for (const p of [...m.sqAB, ...m.sqAC, ...m.sqBC]) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  }
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}

/**
 * Les ÉTIQUETTES de la scène, placées par la GÉOMÉTRIE, hors du triangle : le nom d'un petit côté (« AC = 3 ») et l'eau de son bassin
 * (« 9 cm² ») forment UNE pilule au CENTRE du bassin de ce côté (un petit bassin n'a pas la place de deux pilules) ; sur le grand bassin,
 * « BC = … » (mode longueur) est près du côté, vers B (loin du bassin AC qui touche le grand en C) et la contenance (après un
 * versement) plus loin (aux deux tiers). Les trois bassins sont disjoints (carrés extérieurs d'un triangle). Rend { id, at } (unités maths).
 */
export function labelPlan(m, { withBC = false, capacity = false } = {}) {
  const out = [];
  // `along` : la place le long du côté, depuis P (0,5 = le milieu) ; `depth` : la profondeur dans le bassin, en côtés
  const put = (id, P, Q, sq, depth, along = 0.5) => {
    const n = [sq[3][0] - P[0], sq[3][1] - P[1]];
    out.push({ id, at: [P[0] + (Q[0] - P[0]) * along + n[0] * depth, P[1] + (Q[1] - P[1]) * along + n[1] * depth] });
  };
  put('AB', m.A, m.B, m.sqAB, 0.5);
  put('AC', m.A, m.C, m.sqAC, 0.5, 0.38); // vers A : le point C (la poignée) reste libre
  // « BC = … » du côté de B : le petit bassin AC touche le grand en C
  if (withBC) put('BC', m.B, m.C, m.sqBC, 0.2, 0.3);
  if (capacity) put('capacity', m.B, m.C, m.sqBC, withBC ? 0.68 : 0.5);
  return out;
}

/** Le texte d'une étiquette de petit côté : « AC = 3 · 9 cm² » si la pilule tient dans le bassin (largeur ≤ 95 % du côté), sinon « AC = 3 ». */
export function sideText(name, len, area, sidePx, widthOf) {
  const long = area == null ? null : `${name} = ${len} · ${area} cm²`;
  return long && widthOf(long) <= 0.95 * sidePx ? long : `${name} = ${len}`;
}

/** Les boîtes en pixels (pour les tests) : `scale` px par unité, `widthOf(id)` la largeur de la pilule, `h` sa hauteur. */
export const labelBoxes = (plan, scale, widthOf, h) => plan.map((l) => {
  const w = widthOf(l.id);
  return { id: l.id, x0: l.at[0] * scale - w / 2, x1: l.at[0] * scale + w / 2, y0: -l.at[1] * scale - h / 2, y1: -l.at[1] * scale + h / 2 };
});
export const boxesMeet = (p, q) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;

/** Aire (positive) d'un polygone. */
export function polyArea(pts) {
  let s = 0;
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; });
  return Math.abs(s) / 2;
}

/** La partie du polygone SOUS la droite horizontale y = h (Sutherland–Hodgman sur un demi-plan). */
export function clipBelow(pts, h) {
  const out = [];
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const pin = p[1] <= h; const qin = q[1] <= h;
    if (pin) out.push(p);
    if (pin !== qin) { const t = (h - p[1]) / (q[1] - p[1]); out.push([p[0] + t * (q[0] - p[0]), h]); }
  });
  return out;
}

/** L'eau d'un bassin : la région sous une surface HORIZONTALE dont l'aire vaut `area` (≤ aire du bassin). */
export function waterIn(pts, area) {
  const full = polyArea(pts);
  if (area <= 1e-9) return { poly: [], level: null };
  if (area >= full - 1e-9) return { poly: pts, level: Math.max(...pts.map((p) => p[1])) };
  let lo = Math.min(...pts.map((p) => p[1])); let hi = Math.max(...pts.map((p) => p[1]));
  for (let k = 0; k < 60; k += 1) {
    const mid = (lo + hi) / 2;
    if (polyArea(clipBelow(pts, mid)) < area) lo = mid; else hi = mid;
  }
  return { poly: clipBelow(pts, hi), level: hi };
}

/** L'état de l'eau à l'instant t ∈ [0, 1] d'un versement : les deux petits bassins se vident, le grand se remplit, l'excès tombe. */
export function pourFrame(s, t) {
  const m = machineOf(s);
  const a = amounts(s);
  const k = Math.max(0, Math.min(1, t));
  const inBig = Math.min(a.cap, k * a.waterN);
  return {
    ab: waterIn(m.sqAB, (1 - k) * a.small[1]),
    ac: waterIn(m.sqAC, (1 - k) * a.small[0]),
    bc: waterIn(m.sqBC, inBig),
    spill: Math.max(0, k * a.waterN - a.cap),
    gap: k >= 1 ? Math.max(0, a.cap - a.waterN) : 0,
  };
}

/* ══════════════ Le guide (LabCoach) : le geste à faire MAINTENANT, jamais la règle ══════════════ */

/**
 * `{ id, target, gesture }` ou null. Cibles : [data-pt-stepper] (la carte −/+ entière), [data-pt-pour], [data-pt-root], [data-pt-next] —
 * jamais un sens (« plus » / « moins ») ni la scène.
 *   angle : turn (bouger le bras) → pour (verser) → again (bouger encore) → next → turn2 / pour2
 *   length : stretch → pour → again → next → (pour → again)… → root (la touche √, après deux versements) → pourRoot
 */
/** Le guide montre la CARTE de commande (−/+ ET sa lecture), jamais la poignée sur la scène : sa bulle ne couvre ni le triangle ni
 * les bassins, et la carte entière ne donne aucun sens (« + » ou « − ») à suivre. */
const STEPPER = '[data-pt-stepper]';

export function coachOf(s) {
  if (s.free) return null;
  if (discoveryReady(s)) return null;
  if (canNext(s)) return { id: 'next', target: '[data-pt-next]', gesture: 'tap' };
  const task = taskOf(s);
  const mine = taskTrials(s);
  const moved = s.events.some((e) => (e.kind === 'turn' || e.kind === 'stretch') && !e.free);
  const angle = s.mode === 'angle';
  if (task === 'surd' && canRoot(s)) return { id: 'root', target: '[data-pt-root]', gesture: 'tap' };
  if (task === 'surd' && s.exact && !s.pour) return { id: 'pourRoot', target: '[data-pt-pour]', gesture: 'tap' };
  if (!moved && mine.length === 0 && s.ti === 0) return { id: angle ? 'turn' : 'stretch', target: STEPPER, gesture: 'drag' };
  if (task === 'compare') {
    if (s.pour || s.angle === 90) return { id: 'turn2', target: STEPPER, gesture: 'drag' };
    return { id: 'pour2', target: '[data-pt-pour]', gesture: 'tap' };
  }
  if (!s.pour) return { id: 'pour', target: '[data-pt-pour]', gesture: 'tap' };
  return { id: 'again', target: STEPPER, gesture: 'drag' };
}

