/**
 * elevator-reel — LA LOGIQUE PURE du « شريط المصعد » (3AM, unité 1 « الأعداد النسبية », درس « جداء عددين نسبيين », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/relativeOps.js` et de `powers.js` (importés PAR CHEMIN, jamais par le barrel).
 *
 * LE MODÈLE. Un ascenseur monte ou descend à vitesse CONSTANTE r (étages par minute, SIGNÉE : r < 0 = il descend) et passe par
 * le rez-de-chaussée (l'étage 0) à l'instant t = 0 du film. À l'instant t (minutes, SIGNÉ : t < 0 = AVANT le passage) il est à
 * l'étage r × t. Pour un temps positif c'est la somme répétée connue (r + r + … + r) ; pour un temps NÉGATIF le film
 * est rembobiné et la cabine apparaît de l'autre côté de la rue : (−2) × (−2) = +4 devient un fait du monde avant d'être une règle.
 *
 * La MAIN tient le temps t (un curseur sur la ligne du temps, −/+) et, en متقدم, la vitesse r (levier « يصعد / ينزل » + −/+).
 * Un « essai » est un temps LÂCHÉ (fin d'un glisser, −/+, flèche) ; l'aller-retour du glisser n'en est pas un.
 *
 * MISSIONS (`tasks`)
 *   floor    r imposée (fixée par l'histoire), un étage demandé : régler t (unique sur le rail, `timeFor`).
 *   both     un étage demandé, r libre : le réussir EN MONTANT (r > 0) puis EN DESCENDANT (r < 0).
 *   predict  r et t donnés : choisir l'étage parmi des cartes AVANT de voir (chaque carte porte une conviction fausse).
 *            En مبتدئ (p1, 2026-10-27, conseil) : où était l'ascenseur qui descend UNE minute avant son passage — posée après m1 et
 *            avant m2, pour que le choc du temps négatif soit prédit avant d'être vu.
 *
 * Le CALCUL (r × t = étage) n'est écrit nulle part avant la découverte (MANIPULATION_CONTRACT §5) : l'arrêt dit le temps, l'étage
 * et le côté de la rue ; `wrongSide` pose la question « avant ou après le passage ? ».
 */
import * as P from '@smarter-academy/core/arithmetic/powers.js';
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';

export const RANGE_T = Object.freeze([-3, 3]);
const RANGE_R = Object.freeze([-3, 3]);
const FLOOR_LIMIT = 9;
const FREE_R = Object.freeze([-3, 3]);

/** Les missions par défaut de chaque niveau (la leçon peut passer les siennes). */
export const PRESETS = Object.freeze({
  beginner: {
    step: '1',
    tasks: [
      { id: 'm1', r: '-2', floor: '-6' },
      { id: 'p1', kind: 'predict', r: '-2', t: '-1', options: ['2', '-2', '-3', '-1'], key: '2', misc: { '-2': 'MISC-JIDAA-NEGNEG', '-3': 'MISC-JIDAA-ADD', '-1': 'MISC-JIDAA-SUB' } },
      { id: 'm2', r: '-2', floor: '4' },
      { id: 'm3', r: '3', floor: '6' },
      { id: 'm4', r: '3', floor: '-9' },
    ],
  },
  advanced: {
    step: '0,5',
    tasks: [
      { id: 'a1', kind: 'predict', r: '-3', t: '-2', options: ['6', '-6', '-5', '1'], key: '6' },
      { id: 'a2', kind: 'both', floor: '-6' },
      { id: 'a3', r: '-2', floor: '3' },
      { id: 'a4', r: '2', floor: '-5' },
    ],
  },
});

/** Quelle conviction fausse porte chaque carte de la prédiction (clé = texte de la carte) — celle de a1 ; une mission peut porter les siennes (`misc`). */
const CARD_MISC = Object.freeze({ '-6': 'MISC-JIDAA-NEGNEG', '-5': 'MISC-JIDAA-ADD', 1: 'MISC-JIDAA-SUB' });

const rat = (x) => R.parseRel(String(x));
const num = (x) => { const q = rat(x); return Number(q.n) / Number(q.d); }; // exact, puis nombre (entiers et demis seulement)
const text = (x) => R.relText(x);

/* ── Lectures de base ───────────────────────────────────────────────────────────────────────── */

export const floorAt = (r, t) => r * t;

/** Le temps unique t (sur le rail de pas `step`) pour lequel r × t = floor, ou null. */
export function timeFor(r, floor, step = 1) {
  if (!r) return null;
  const t = P.div(rat(floor), rat(r));
  const v = Number(t.n) / Number(t.d);
  if (Math.abs(v) > RANGE_T[1]) return null;
  const k = v / step;
  return Math.abs(k - Math.round(k)) < 1e-9 ? Math.round(k) * step : null;
}

/**
 * Les flèches empilées (le sens de « r + r + … + r ») : une flèche par minute entière, une demi-flèche pour une demi-minute.
 * t > 0 : le chemin PARCOURU depuis l'étage 0 (trait plein). t < 0 : le chemin qui RESTE à parcourir pour atteindre l'étage 0
 * (pointillé) — la cabine est de l'autre côté. Chaque flèche : { from, to, dashed, half }.
 */
export function arrowsOf(r, t) {
  if (!r || !t) return [];
  const whole = Math.floor(Math.abs(t));
  const half = Math.abs(t) - whole > 1e-9;
  const durations = [...Array(whole).fill(1), ...(half ? [0.5] : [])];
  const out = [];
  let at = t > 0 ? 0 : floorAt(r, t);
  for (const d of durations) {
    const to = at + r * d;
    out.push({ from: at, to, dashed: t < 0, half: d < 1 });
    at = to;
  }
  return out;
}

/** « (−2) × 3 = −6 » : le calcul d'un instant, en LaTeX (facteurs négatifs entre parenthèses). */
export function calcTex(r, t) {
  const f = (v) => (v < 0 ? `(${R.relTex(rat(v))})` : R.relTex(rat(v)));
  return `${f(r)} \\times ${f(t)} = ${R.relTex(rat(floorAt(r, t)))}`;
}
/** Idem en texte brut (aria, tests) — virgule décimale, vrai moins. */
export function calcText(r, t) {
  const f = (v) => (v < 0 ? `(${text(rat(v))})` : text(rat(v)));
  return `${f(r)} × ${f(t)} = ${text(rat(floorAt(r, t)))}`;
}

/* ── État ───────────────────────────────────────────────────────────────────────────────────── */

function normalize(list) {
  return list.map((t, i) => {
    const kind = t.kind ?? 'floor';
    const task = { id: t.id ?? `t${i}`, kind };
    if (kind === 'predict') return Object.freeze({ ...task, r: num(t.r), t: num(t.t), options: [...t.options], key: String(t.key), misc: t.misc ? { ...t.misc } : null });
    if (kind === 'both') return Object.freeze({ ...task, floor: num(t.floor), lockedR: false });
    return Object.freeze({ ...task, r: num(t.r), floor: num(t.floor), lockedR: true });
  });
}

/** L'état de départ. `numbers` = { step, tasks } (cf. PRESETS). Une mission impossible sur le rail lève une erreur. */
export function init(numbers = {}) {
  const step = num(numbers.step ?? PRESETS.beginner.step);
  const tasks = normalize(numbers.tasks ?? PRESETS.beginner.tasks);
  for (const tk of tasks) {
    if (tk.kind === 'floor' && timeFor(tk.r, tk.floor, step) == null) throw new Error(`étage impossible : ${tk.r} × t = ${tk.floor}`);
    if (tk.kind === 'predict' && !tk.options.includes(tk.key)) throw new Error('clé de prédiction absente des cartes');
    if (Math.abs(tk.kind === 'predict' ? tk.r * tk.t : tk.floor) > FLOOR_LIMIT) throw new Error('hors de la tour');
  }
  const first = tasks[0];
  return {
    step, tasks, ti: 0, r: first.kind === 'both' ? 2 : first.r, t: 0,
    done: {}, solved: {}, classes: {}, trials: [], last: null, free: null, below: false, rChanged: false, picked: null,
    advanced: step < 1,
  };
}

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const rOf = (s) => (s.free ? s.free.r : s.r);
export const tOf = (s) => (s.free ? s.free.t : s.t);
export const floorOf = (s) => floorAt(rOf(s), tOf(s));
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
const isPredict = (s) => !s.free && taskOf(s).kind === 'predict';
/** Le levier et le −/+ de la vitesse sont à la main (متقدم, mission `both` seulement). */
export const speedEditable = (s) => !s.free && taskOf(s).kind === 'both';
/** Les cartes de prédiction sont à l'écran (avant la bonne réponse). */
export const cardsOpen = (s) => isPredict(s) && !taskDone(s);

/**
 * « ▶ شغّل التسجيل » (le film joué de −3 à 3) : jamais avant que l'élève ait PRÉDIT. Tant qu'une mission `predict` de la liste n'est
 * pas réussie (même plus loin : le film montrerait sa réponse), il attend ; en libre, toujours permis.
 */
export const canPlay = (s) => !!s.free || s.tasks.every((tk, i) => tk.kind !== 'predict' || !!s.done[i]);

/** De quel côté de la rue est un étage : 'above' (> 0), 'below' (< 0), 'at' (0). */
export const sideOf = (floor) => (floor > 0 ? 'above' : floor < 0 ? 'below' : 'at');

/**
 * Un arrêt refusé de l'AUTRE côté de la rue que l'étage demandé : la question « avant ou après le passage ? », jamais le calcul
 * (MANIPULATION_CONTRACT §5 : la règle n'apparaît pas avant la découverte).
 */
export const wrongSide = (trial) => !!trial && trial.kind === 'release' && !trial.ok && !trial.free && trial.goal != null
  && trial.floor !== 0 && Math.sign(trial.floor) !== Math.sign(trial.goal);

/** La mission est-elle réussie par (r, t) ? */
function judge(task, r, t) {
  const floor = floorAt(r, t);
  const ok = task.kind === 'predict' ? false : floor === task.floor && (task.lockedR ? r === task.r : r !== 0);
  return { ok, floor, calc: calcTex(r, t) };
}

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

const clampT = (v) => Math.max(RANGE_T[0], Math.min(RANGE_T[1], v));
const snap = (s, v) => clampT(Math.round(v / s.step) * s.step);

/** Pendant un glisser : le temps suit la main, sans essai. */
export function preview(s, v) {
  const t = snap(s, v);
  if (s.free) return t === s.free.t ? s : { ...s, free: { ...s.free, t } };
  return t === s.t ? s : { ...s, t };
}

/** Un temps LÂCHÉ : un essai jugé (même sans changement — l'élève a relâché ici). */
export function release(s, v = tOf(s)) {
  if (cardsOpen(s)) return s;
  const t = snap(s, v);
  const next = s.free ? { ...s, free: { ...s.free, t } } : { ...s, t };
  const r = rOf(next);
  const task = taskOf(s);
  const free = !!s.free;
  const j = free ? { ok: false, floor: floorAt(r, t), calc: calcTex(r, t) } : judge(task, r, t);
  const trial = Object.freeze({
    kind: 'release', task: s.ti, taskId: free ? null : task.id, r, t, floor: j.floor, ok: j.ok, free,
    goal: free ? null : (task.kind === 'both' ? task.floor : task.floor), speed: r < 0 ? 'down' : r > 0 ? 'up' : 'still',
  });
  let done = s.done; let solved = s.solved; let classes = s.classes;
  if (j.ok && !free) {
    if (task.kind === 'both') {
      const c = { ...(classes[s.ti] ?? {}), [r > 0 ? 'up' : 'down']: { r, t } };
      classes = { ...classes, [s.ti]: c };
      if (c.up && c.down) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: { r: c.up.r, t: c.up.t, floor: task.floor, also: c.down } }; }
    } else if (!done[s.ti]) {
      done = { ...done, [s.ti]: true };
      solved = { ...solved, [s.ti]: { r, t, floor: j.floor } };
    }
  }
  return { ...next, done, solved, classes, trials: [...s.trials, trial], last: trial, below: s.below || t < 0 };
}

/** −/+ : un pas de temps de moins / de plus (un essai). */
export const step = (s, d) => release(s, tOf(s) + d * s.step);

/** Le levier / le −/+ de la vitesse : r change ; c'est un essai (si le temps n'est pas 0, la cabine bouge). */
export function setR(s, r) {
  if (!speedEditable(s)) return s;
  const v = Math.max(RANGE_R[0], Math.min(RANGE_R[1], Math.round(r)));
  const moved = s.free ? { ...s, free: { ...s.free, r: v }, last: null } : { ...s, r: v, rChanged: true, last: null };
  return tOf(moved) === 0 ? moved : release(moved, tOf(moved));
}
/** Le levier : change le SENS (le signe) en gardant la distance de la vitesse (au moins 1). */
export function flipSense(s) {
  const r = rOf(s);
  return setR(s, r === 0 ? 1 : -r);
}

/** Prédiction (متقدم a1) : une carte. Chaque carte fausse porte une conviction (CARD_MISC) ; la bonne clôt la mission. */
export function choose(s, option) {
  const task = taskOf(s);
  if (!cardsOpen(s)) return s;
  const ok = String(option) === task.key;
  const trial = Object.freeze({
    kind: 'predict', task: s.ti, taskId: task.id, r: task.r, t: task.t, floor: floorAt(task.r, task.t), pick: String(option), ok, free: false,
    misc: ok ? null : ((task.misc ?? CARD_MISC)[String(option)] ?? null),
  });
  // une carte n'est pas la main sur la ligne du temps : `below` (la main est allée au temps négatif) reste ce qu'il était
  const base = { ...s, r: task.r, t: task.t, picked: String(option), trials: [...s.trials, trial], last: trial };
  if (!ok) return base;
  return { ...base, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: { r: task.r, t: task.t, floor: trial.floor } } };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const task = s.tasks[s.ti + 1];
  return { ...s, ti: s.ti + 1, t: 0, r: task.kind === 'both' ? 2 : task.r, last: null, picked: null };
}

/** « إعادة » : la cabine repart du temps 0, les essais restent. */
function restartTask(s) {
  const task = taskOf(s);
  return { ...s, t: 0, r: task.kind === 'both' ? 2 : task.r, last: null, picked: null };
}

/** « أعِد التجربة » (questions du labo) : LA MÊME mission repart, non résolue (ses lignes du سجلّ retirées). */
export function retryTask(s) {
  const { [s.ti]: _d, ...done } = s.done;
  const { [s.ti]: _s, ...solved } = s.solved;
  const { [s.ti]: _c, ...classes } = s.classes;
  return { ...restartTask(s), done, solved, classes };
}

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** r : entier de −3 à 3 (0 permis : la cabine ne bouge jamais). t : multiple de 0,5 de −3 à 3. null si illisible. */
export function parseFree(rawR, rawT) {
  try {
    const r = R.parseRel(String(rawR).trim());
    const t = R.parseRel(String(rawT).trim() === '' ? '0' : String(rawT).trim());
    if (r.d !== 1n) return null;
    const rv = Number(r.n);
    if (rv < FREE_R[0] || rv > FREE_R[1]) return null;
    const tv = Number(t.n) / Number(t.d);
    if (tv < RANGE_T[0] || tv > RANGE_T[1] || Math.abs(tv * 2 - Math.round(tv * 2)) > 1e-9) return null;
    return { r: rv, t: tv };
  } catch { return null; }
}
export function setFree(s, rawR, rawT) {
  const f = parseFree(rawR, rawT);
  if (!f) return s;
  const was = s.free;
  const next = { ...s, free: f, last: null };
  return was && was.r === f.r && was.t === f.t ? s : next;
}
export const toGuided = (s) => (s.free ? { ...s, free: null, last: null } : s);

/* ── Preuves (onTrial) ──────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((x) => !x.free && x.task === i);

/** Les lignes du « سجلّ الكاميرا » : une par mission réussie, dans l'ordre. */
export function recordRows(s) {
  return Object.keys(s.solved).map(Number).sort((a, b) => a - b).flatMap((i) => {
    const row = s.solved[i];
    const rows = [{ i, r: row.r, t: row.t, floor: row.floor }];
    if (row.also) rows.push({ i, r: row.also.r, t: row.also.t, floor: row.floor });
    return rows;
  });
}

/* ── Onboarding (LabCoach) ──────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse : `cards` (la prédiction), `grab` (le curseur du temps), `left` (une mission demande
 * un temps négatif et la main n'y est jamais allée : la moitié gauche de la ligne du temps, pas le nombre), `lever` (la mission
 * `both` : le levier de la vitesse), `try` (−/+), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-er-next]', gesture: 'tap' } : null;
  const t = taskOf(s);
  if (t.kind === 'predict') return { id: 'cards', target: '[data-er-cards]', gesture: 'tap' };
  const mine = guidedTrials(s);
  // la bulle se pose AU-DESSUS (sur l'écran de la caméra), jamais sur la ligne du temps ni sur −/+ qu'elle montre
  const up = { prefer: 'above', noFlip: true };
  if (mine.length === 0) return { id: 'grab', target: '[data-er-knob]', gesture: 'drag', ...up };
  if (t.kind === 'both' && !s.rChanged && mine.length >= 2) return { id: 'lever', target: '[data-er-speed]', gesture: 'tap' };
  const goal = t.kind === 'both' ? null : timeFor(t.r, t.floor, s.step);
  if (goal != null && goal < 0 && !s.below && mine.length >= 1) return { id: 'left', target: '[data-er-left]', gesture: 'tap', ...up };
  return { id: 'try', target: '[data-er-stepper]', gesture: 'tap', ...up };
}

/* ── Découverte : la distance de l'étage, avec SES lignes ───────────────────────────────────── */

/**
 * Un témoin tiré du film de l'élève : une ligne du سجلّ où |r| + |t| ≠ |r| × |t| ≠ ||r| − |t||, de sorte que la somme ET la
 * différence des distances soient réfutées par son propre calcul. À défaut, la première ligne.
 */
export function distanceWitness(s) {
  const rows = recordRows(s).filter((x) => x.r !== 0 && x.t !== 0);
  const good = (x) => {
    const a = Math.abs(x.r); const b = Math.abs(x.t); const p = a * b;
    return p !== a + b && p !== Math.abs(a - b);
  };
  const row = rows.find(good) ?? rows[0] ?? { r: -2, t: 3, floor: -6 };
  const a = Math.abs(row.r); const b = Math.abs(row.t);
  return { ...row, a, b, sum: a + b, diff: Math.abs(a - b), product: a * b };
}
