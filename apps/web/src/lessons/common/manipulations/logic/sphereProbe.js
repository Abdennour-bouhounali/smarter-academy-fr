/**
 * sphere-probe — LA LOGIQUE PURE de la sonde (unité 14 « الهندسة في الفضاء », درس « الكرة والجلة », نشاط 1 et معارف 1).
 * Aucune arithmétique ici : chaque distance, chaque verdict, chaque section vient de packages/core/arithmetic/space.js
 * (`ballPosition` — comparaison EXACTE de OM² et R² —, `distance3`, `distanceSquared3`, `sphereSection`, `lengthLatex`) ;
 * ce module dit seulement ce que la main a le droit de faire et ce que l'écran montre.
 *
 * LE MONDE : une sphère (δ) de centre O = (0 ; 0 ; 0) et de rayon R dans un repère de l'espace (z vers le haut), la boule
 * (β) qu'elle délimite, et une SONDE M que l'élève déplace sur les nœuds entiers d'un cube [−bound ; bound]³.
 *   • `classify` (مبتدئ) — l'élève amène M (de préférence sur les sondes A, B, C du niveau) et DÉCLARE où elle est :
 *     « على الكرة » (M ∈ (δ), donc M ∈ (β)), « داخل الجلة » (M ∈ (β), M ∉ (δ)), « خارج الجلة » (ni l'une ni l'autre) ;
 *     la déclaration est jugée par `ballPosition`, un refus nomme la comparaison exacte qui la contredit
 *     (« M داخل الجلة لكنه ليس من الكرة : OM = √3 < 3 = R »).
 *   • `tasks` (متقدم, نشاط 1 + معارف 1) — l'élève PLACE à la demande M sur la كرة, P dans la جلة sans être sur la كرة, Q hors
 *     de la جلة (les noms de l'exemple de معارف 1) — OM n'est PAS affichée pendant le geste : il la calcule ; puis, étape qu'il
 *     ouvre lui-même, il place M′ pour que [MM′] soit un قطر, et règle la hauteur h d'un plan horizontal qui coupe la sphère
 *     selon une دائرة كبرى (h = 0) puis une دائرة صغرى (0 < |h| < R) — le pont vers le درس « المقاطع المستوية ».
 * La découverte s'ouvre quand les trois positions ont été jugées justes (le contraste : un point de la جلة qui n'est pas
 * de la كرة).
 */
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

export const KINDS = Object.freeze(['surface', 'inside', 'outside']);
/** Les noms de l'exemple de معارف 1 : M ∈ (δ), P ∈ (β) \ (δ), Q hors de (β). */
const TASK_NAMES = Object.freeze({ surface: 'M', inside: 'P', outside: 'Q' });
export const PLACE_TASKS = Object.freeze(['surface', 'inside', 'outside']);
const CIRCLE_TASKS = Object.freeze(['diameter', 'great-circle', 'small-circle']);
const O = Object.freeze([0, 0, 0]);
const PROBE_NAMES = 'ABCDEFGH';

const clampInt = (v, b) => Math.max(-b, Math.min(b, Math.round(Number(v) || 0)));
const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
const freezeP = (p) => Object.freeze([...p]);

/** Le départ de la sonde : un nœud qui n'est ni O ni une sonde ni une réponse attendue particulière. */
function defaultStart(R, bound) {
  return [-Math.min(bound, R), -2, 1].map((v) => clampInt(v, bound));
}

/** Le départ n'est jamais une réponse de la première tâche (M sur la كرة, P dedans, Q dehors) : on prend le premier candidat d'une autre nature. */
function defaultStartFor(R, bound, task) {
  const cands = [defaultStart(R, bound), [1, 1, 0], [bound, bound, bound], [R, 1, 0], [1, 0, 0]];
  const ok = cands.find((c) => { const p = c.map((v) => clampInt(v, bound)); return !p.every((v) => v === 0) && reading(R, p).where !== task; });
  return ok ?? cands[0];
}

export function init(numbers = {}) {
  const R = Number(numbers.R ?? 3);
  const bound = Number(numbers.bound ?? R + 1);
  const tasks = Array.isArray(numbers.tasks) && numbers.tasks.length ? Object.freeze([...numbers.tasks]) : null;
  const probes = Object.freeze((numbers.probes ?? []).map((at, i) => Object.freeze({ name: PROBE_NAMES[i], at: freezeP(at.map((v) => clampInt(v, bound))) })));
  const start = freezeP((numbers.start ?? defaultStartFor(R, bound, tasks?.[0])).map((v) => clampInt(v, bound)));
  return Object.freeze({
    R, bound, mode: tasks ? 'tasks' : 'classify', stage: 'probe',
    M: start, probes, tasks, taskIndex: 0,
    placed: Object.freeze([]), // les points acceptés : { name, kind, at }
    anchor: null, // le point M accepté sur la كرة (extrémité du قطر de l'étape 2)
    prime: freezeP([1, -2, 0].map((v) => clampInt(v, bound))), h: Math.min(2, R - 1),
    trials: Object.freeze([]), last: null, refusals: 0,
  });
}

/* ── la position de M ──────────────────────────────────────────────────────── */

/** Tout ce que l'écran peut lire de M : la position exacte et ses écritures. */
export function reading(R, M) {
  const pos = SP.ballPosition(O, R, M);
  const sq = (v) => (v < 0 ? `(${v})^2` : `${v}^2`);
  const n = pos.OM2.n; // OM² est entier (nœuds entiers)
  return Object.freeze({
    where: pos.where,
    OM2: n,
    R2: R * R,
    sumTex: `${sq(M[0])} + ${sq(M[1])} + ${sq(M[2])} = ${n}`,
    sumShortTex: `${M[0] * M[0]} + ${M[1] * M[1]} + ${M[2] * M[2]} = ${n}`,
    OMTex: SP.lengthLatex(pos.OM),
    OMNumber: TR.surdNumber(pos.OM),
    foot2: M[0] * M[0] + M[1] * M[1],
  });
}
/** Le nom de la sonde (A, B, C…) sur laquelle se trouve M, ou null. */
export const probeAt = (s, p = s.M) => s.probes.find((q) => same(q.at, p))?.name ?? null;

/* ── les gestes ───────────────────────────────────────────────────────────── */

// Un déplacement ne juge rien : le dernier verdict reste en mémoire, l'écran le dit « périmé » quand M a bougé (`isStale`).
const live = (s, patch) => Object.freeze({ ...s, ...patch });
/** Le dernier verdict porte-t-il encore sur la position affichée ? */
export function isStale(s) {
  const t = s.last;
  if (!t) return false;
  if (t.type === 'section') return t.h !== s.h;
  if (t.type === 'diameter') return !same(t.at, s.prime);
  return !same(t.at, s.M);
}
/** Porte M sur un nœud (arrondi, borné) — le geste de la main (glisser dans la scène, flèches, −/+). */
export function moveM(s, p) {
  const M = freezeP(p.map((v) => clampInt(v, s.bound)));
  return same(M, s.M) ? s : live(s, { M });
}
/** Un pas sur un axe (0 = x, 1 = y, 2 = z). */
export function stepM(s, axis, d) {
  const M = [...s.M]; M[axis] += d;
  return moveM(s, M);
}
export function movePrime(s, p) {
  const prime = freezeP(p.map((v) => clampInt(v, s.bound)));
  return same(prime, s.prime) ? s : live(s, { prime });
}
export function stepPrime(s, axis, d) { const p = [...s.prime]; p[axis] += d; return movePrime(s, p); }
/** La hauteur du plan horizontal z = h (entier, de −(R + 1) à R + 1). */
export function setPlane(s, h) {
  const v = Math.max(-(s.R + 1), Math.min(s.R + 1, Math.round(Number(h) || 0)));
  return v === s.h ? s : live(s, { h: v });
}

const push = (s, trial, patch = {}) => Object.freeze({
  ...s, ...patch,
  trials: Object.freeze([...s.trials, Object.freeze({ ...trial, n: s.trials.length + 1 })]),
  last: Object.freeze({ ...trial, n: s.trials.length + 1 }),
  refusals: s.refusals + (trial.ok ? 0 : 1),
});

/** مبتدئ — l'élève déclare où est M ; jugé exactement. */
export function classify(s, claimed) {
  if (!KINDS.includes(claimed)) throw new Error(`verdict inconnu ${claimed}`);
  const r = reading(s.R, s.M);
  const ok = r.where === claimed;
  return push(s, { type: 'classify', ok, claimed, truth: r.where, at: s.M, name: probeAt(s) ?? 'M', OM2: r.OM2, OMTex: r.OMTex });
}

/** La tâche courante (متقدم) : un id de PLACE_TASKS ou CIRCLE_TASKS, ou null quand tout est fait. */
export const currentTask = (s) => (s.tasks ? s.tasks[s.taskIndex] ?? null : null);
/** Le nom du point que la tâche de placement fait poser (M, P ou Q). */
export const taskName = (task) => TASK_NAMES[task] ?? 'M';

/** متقدم, étape 1 — « هنا » : M est-elle là où la tâche la demande ? */
export function place(s) {
  const task = currentTask(s);
  if (!PLACE_TASKS.includes(task)) return s;
  const r = reading(s.R, s.M);
  const name = taskName(task);
  const clash = s.placed.find((p) => same(p.at, s.M));
  if (clash) return push(s, { type: 'place', ok: false, task, claimed: task, truth: r.where, reason: 'taken', at: s.M, name, other: clash.name, OM2: r.OM2, OMTex: r.OMTex });
  const ok = r.where === task;
  const trial = { type: 'place', ok, task, claimed: task, truth: r.where, at: s.M, name, OM2: r.OM2, OMTex: r.OMTex };
  if (!ok) return push(s, trial);
  return push(s, trial, {
    taskIndex: s.taskIndex + 1,
    placed: Object.freeze([...s.placed, Object.freeze({ name, kind: task, at: s.M })]),
    anchor: task === 'surface' ? s.M : s.anchor,
  });
}

/** Les trois positions ont-elles été jugées justes ? (le contraste du نشاط 1) */
export function discoveryReady(s) {
  if (s.mode === 'tasks') return s.taskIndex >= PLACE_TASKS.length;
  const kinds = new Set(s.trials.filter((t) => t.ok && t.type === 'classify').map((t) => t.truth));
  return KINDS.every((k) => kinds.has(k));
}
/** Les sondes déjà classées juste. */
export const probesDone = (s) => new Set(s.trials.filter((t) => t.ok && t.type === 'classify' && PROBE_NAMES.includes(t.name)).map((t) => t.name));

/* ── متقدم, étape 2 : الأقطار والدوائر (ouverte par l'élève) ─────────────── */

export const canOpenCircles = (s) => s.mode === 'tasks' && s.taskIndex >= PLACE_TASKS.length && s.tasks.some((t) => CIRCLE_TASKS.includes(t));
export function openCircles(s) { return canOpenCircles(s) ? Object.freeze({ ...s, stage: 'circles', last: null }) : s; }
export function backToProbe(s) { return Object.freeze({ ...s, stage: 'probe', last: null }); }
/** L'extrémité du قطر : le M que l'élève a posé sur la كرة (sinon le pôle N). */
export const anchorOf = (s) => s.anchor ?? Object.freeze([0, 0, s.R]);

/** [MM′] est-il un قطر ? M′ doit être sur la كرة ET O le milieu de [MM′]. */
export function claimDiameter(s) {
  if (currentTask(s) !== 'diameter') return s;
  const A = anchorOf(s); const P = s.prime;
  const r = reading(s.R, P);
  const chord = SP.distance3(A, P);
  const base = { type: 'diameter', at: P, OM2: r.OM2, OMTex: r.OMTex, chordTex: SP.lengthLatex(chord), chordNumber: TR.surdNumber(chord) };
  if (same(A, P)) return push(s, { ...base, ok: false, reason: 'same' });
  if (r.where !== 'surface') return push(s, { ...base, ok: false, reason: 'notOnSphere', truth: r.where });
  const opposite = same(P, A.map((v) => -v));
  if (!opposite) return push(s, { ...base, ok: false, reason: 'notMidpoint' });
  return push(s, { ...base, ok: true, reason: 'diameter' }, { taskIndex: s.taskIndex + 1 });
}

/** La section de la sphère par le plan z = h (sphereSection). */
export function section(R, h) {
  const sec = SP.sphereSection(R, Math.abs(h));
  return Object.freeze({
    kind: sec.kind,
    radiusTex: sec.radius ? SP.lengthLatex(sec.radius) : null,
    radiusNumber: sec.radius ? TR.surdNumber(sec.radius) : 0,
    radius2: sec.radius2 ? sec.radius2.n / sec.radius2.d : null,
  });
}
/** « هنا » sur le plan : la section est-elle la دائرة demandée ? */
export function claimSection(s) {
  const task = currentTask(s);
  if (task !== 'great-circle' && task !== 'small-circle') return s;
  const sec = section(s.R, s.h);
  const want = task === 'great-circle' ? 'great-circle' : 'circle';
  const ok = sec.kind === want;
  const reason = ok ? task : ({ 'great-circle': 'isGreat', circle: 'isSmall', point: 'tangent', none: 'none' })[sec.kind];
  return push(s, { type: 'section', ok, task, h: s.h, kind: sec.kind, radiusTex: sec.radiusTex, reason }, ok ? { taskIndex: s.taskIndex + 1 } : {});
}
/* ── les étapes du labo et leurs questions (lot 4, `primitives/LabCheckpoint`) ───────────────────────────── */

/** Les étapes : مبتدئ = les trois positions (كرة, داخل, خارج) dans l'ordre où l'élève les juge ; متقدم = ses tâches. `trial` : l'essai juste de l'étape. */
export function stepsOf(s) {
  if (s.mode === 'classify') {
    return KINDS.map((id) => {
      const trial = [...s.trials].reverse().find((t) => t.ok && t.type === 'classify' && t.truth === id) ?? null;
      return Object.freeze({ id, reached: !!trial, trial });
    });
  }
  return s.tasks.map((id, i) => {
    const trial = [...s.trials].reverse().find((t) => t.ok && (PLACE_TASKS.includes(id) ? (t.type === 'place' && t.task === id) : id === 'diameter' ? t.type === 'diameter' : t.type === 'section' && t.task === id)) ?? null;
    return Object.freeze({ id, reached: i < s.taskIndex && !!trial, trial });
  });
}
/** « أعِد التجربة » : remet l'étape `id` au départ (son essai juste est retiré, la tâche redevient la courante). */
export function retryStep(s, id) {
  const st = stepsOf(s).find((x) => x.id === id);
  if (!st || !st.trial) return s;
  const trials = Object.freeze(s.trials.filter((t) => t !== st.trial).map((t, i) => Object.freeze({ ...t, n: i + 1 })));
  if (s.mode === 'classify') return Object.freeze({ ...s, trials, last: null });
  const i = s.tasks.indexOf(id);
  return Object.freeze({
    ...s, trials, last: null, taskIndex: i,
    placed: Object.freeze(s.placed.filter((p) => p.kind !== id)),
    anchor: id === 'surface' ? null : s.anchor,
  });
}
export const allDone = (s) => s.mode === 'tasks' && s.taskIndex >= (s.tasks?.length ?? 0);

/** Ce que la leçon reçoit à chaque geste jugé (`onTrial`) — jamais une réponse non trouvée. */
export function evidenceOf(trial) {
  if (!trial) return null;
  return Object.freeze({
    n: trial.n, ok: trial.ok, type: trial.type, name: trial.name ?? null, at: trial.at ? [...trial.at] : null,
    where: trial.truth ?? null, claimed: trial.claimed ?? null, OM2: trial.OM2 ?? null, OMTex: trial.OMTex ?? null,
    task: trial.task ?? null, h: trial.h ?? null,
  });
}
