/**
 * power-train — LA LOGIQUE PURE du « قطار القوى » (3AM, unité 3, درس « قوة عدد نسبي », 2026-10-21). Exacte : toute la
 * mathématique vient de `packages/core/arithmetic/powers.js` (importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Un train part de la gare en portant le nombre 1. Chaque wagon attelé est une opération sur ce qu'il porte :
 * un wagon « × a » le multiplie par a, un wagon « ÷ a » le divise par a. La MAIN tient l'EXPOSANT n : la longueur signée du
 * train (n wagons « × a » à droite de la locomotive, |n| wagons « ÷ a » à sa gauche, aucun wagon pour n = 0). Le train porte
 * alors aⁿ — la définition du manuel (n facteurs égaux à a ; a⁰ = 1 ; a⁻ⁿ = 1 / aⁿ) devient un geste.
 *
 * DEUX MONDES
 *   build   un train, une tâche = une CHARGE cible (« 16 », « -32 », « 1 », « 1/9 ») : la main règle n jusqu'à ce que le train
 *           la porte. Pour une base négative, la charge change de signe à chaque wagon.
 *   couple  deux trains de même base : A (m wagons, donné) et B (la main règle son exposant n) ; on les attelle (op 'times')
 *           ou on attelle B RETOURNÉ (op 'divide' : chaque « × » devient « ÷ ») ; un wagon « × a » et un wagon « ÷ a » qui se
 *           touchent s'annulent. La tâche est l'EXPOSANT du train attelé : la règle aᵐ × aⁿ = aᵐ⁺ⁿ (et aᵐ ÷ aⁿ = aᵐ⁻ⁿ) se voit.
 *
 * Un « essai » est un exposant LÂCHÉ (fin d'un glisser, un clic −/+, une flèche) ; l'aller-retour pendant le glisser n'en est
 * pas un. « جرّب أعدادك » (`free`) : l'élève choisit sa base, n reste libre, aucune tâche n'est cochée.
 */
import * as P from '@smarter-academy/core/arithmetic/powers.js';

const WORLDS = Object.freeze(['build', 'couple']);
/** La plage de l'exposant tenu par la main (le rail a 11 places : −4 … 6 ; B dans `couple` : −6 … 6). */
export const RANGE = Object.freeze({ build: [-4, 6], couple: [-6, 6] });
/** Bases permises dans « جرّب أعدادك » : un entier relatif non nul de −9 à 9. */
const FREE_BASE = Object.freeze([-9, 9]);

/** Les tâches par défaut de chaque monde et de chaque niveau (la leçon peut passer les siennes). */
export const PRESETS = Object.freeze({
  build: {
    beginner: { base: '-2', targets: ['16', '-32', '1'] },
    advanced: { base: '-3', targets: ['-27', '81', '1/9', '-1/27'] },
  },
  couple: {
    beginner: { base: '2', tasks: [{ m: 3, target: 7, op: 'times' }, { m: 4, target: -2, op: 'times' }, { m: 5, target: 2, op: 'divide' }] },
    advanced: { base: '-3', tasks: [{ m: -2, target: 3, op: 'times' }, { m: 2, target: -3, op: 'divide' }] },
  },
});

const clamp = (v, [lo, hi]) => Math.max(lo, Math.min(hi, v));
const text = (x) => P.ratText(x);

/** Les tâches normalisées : `build` → { id, target (texte), goal (exposant) } ; `couple` → { id, m, target, op, goal (n) }. */
function normalizeTasks(world, base, list) {
  if (world === 'couple') {
    return list.map((t, i) => {
      const goal = t.op === 'divide' ? t.m - t.target : t.target - t.m;
      const [lo, hi] = RANGE.couple;
      if (goal < lo || goal > hi) throw new Error(`tâche hors du rail : ${JSON.stringify(t)}`);
      return Object.freeze({ id: `c${i}`, m: t.m, target: t.target, op: t.op ?? 'times', goal });
    });
  }
  return list.map((target, i) => {
    const [lo, hi] = RANGE.build;
    const goal = P.exponentOf(base, target, lo, hi);
    if (goal == null) throw new Error(`charge impossible : ${base}^n = ${target}`);
    return Object.freeze({ id: `b${i}`, target: text(P.parseRat(target)), goal });
  });
}

/** L'état de départ. `numbers` = { world, base, targets } (build) ou { world, base, tasks } (couple). */
export function init(numbers = {}) {
  const world = WORLDS.includes(numbers.world) ? numbers.world : 'build';
  const preset = PRESETS[world].beginner;
  const base = text(P.parseRat(numbers.base ?? preset.base));
  if (P.isZero(base)) throw new Error('base nulle');
  const tasks = normalizeTasks(world, base, world === 'couple' ? (numbers.tasks ?? preset.tasks) : (numbers.targets ?? preset.targets));
  return { world, base, tasks, ti: 0, n: 0, done: {}, solved: {}, trials: [], last: null, free: null, below: false };
}

/* ── Lectures ────────────────────────────────────────────────────────────────────────────────── */

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
/** La base en jeu (celle de « جرّب أعدادك » si le panneau libre est actif). */
export const baseOf = (s) => (s.free ? s.free.base : s.base);
export const rangeOf = (s) => RANGE[s.world];
/** Ce que porte le train (build) ou le train attelé (couple). */
export function loadOf(s) {
  const a = baseOf(s);
  if (s.world === 'couple') { const t = taskOf(s); return P.couple(a, t.m, s.n, t.op).load; }
  return P.pow(a, s.n);
}
/** L'exposant du train qu'on juge : n (build) ou celui du train attelé (couple). */
export function exponentShown(s) {
  if (s.world === 'couple') { const t = taskOf(s); return t.op === 'divide' ? t.m - s.n : t.m + s.n; }
  return s.n;
}
/** Les charges successives après chaque wagon (build) — du premier wagon au dernier. */
export const loadsOf = (s) => P.trainLoads(baseOf(s), s.n).map(text);
/** Le train attelé (couple) : les wagons de A puis ceux de B (retournés si 'divide'), les paires annulées marquées. */
export function coupledOf(s) { const t = taskOf(s); return P.couple(baseOf(s), t.m, s.n, t.op); }

export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
/** La charge (ou l'exposant attelé) est-elle celle de la tâche ? */
export function onTarget(s) {
  if (s.free) return false;
  const t = taskOf(s);
  return s.world === 'couple' ? exponentShown(s) === t.target : P.eq(loadOf(s), t.target);
}

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

/** Pendant un glisser : l'exposant suit la main, sans essai. */
export function preview(s, n) {
  const v = clamp(Math.round(n), rangeOf(s));
  return v === s.n ? s : { ...s, n: v };
}

/** Un exposant LÂCHÉ : il devient un essai jugé (même s'il n'a pas changé — l'élève a relâché ici). */
export function release(s, n = s.n) {
  const v = clamp(Math.round(n), rangeOf(s));
  const next = { ...s, n: v };
  const load = text(loadOf(next));
  const ok = onTarget(next);
  const trial = Object.freeze({
    world: s.world, task: s.ti, base: baseOf(next), n: v, exponent: exponentShown(next), load, ok, free: !!s.free,
    target: s.free ? null : (s.world === 'couple' ? taskOf(s).target : taskOf(s).target),
  });
  const done = ok && !s.free ? { ...s.done, [s.ti]: true } : s.done;
  const solved = ok && !s.free && !s.solved[s.ti] ? { ...s.solved, [s.ti]: trial } : s.solved;
  return { ...next, done, solved, trials: [...s.trials, trial], last: trial, below: s.below || v < 0 };
}

/** −/+ : un wagon de moins / de plus (un essai). */
export const step = (s, d) => release(s, s.n + d);

export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, n: 0, last: null };
}

/** « إعادة » sur la même tâche : le train repart vide, les essais restent (la découverte s'en sert). */
function restartTask(s) { return { ...s, n: 0, last: null }; }

/** « جرّب أعدادك » : une base entière non nulle de −9 à 9 (texte libre de l'élève, « −4 » accepté). null si illisible. */
export function parseFreeBase(raw) {
  try {
    const v = P.parseRat(String(raw).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))));
    if (v.d !== 1n || v.n === 0n) return null;
    const k = Number(v.n);
    return k >= FREE_BASE[0] && k <= FREE_BASE[1] ? String(k) : null;
  } catch { return null; }
}
export function setFree(s, raw) {
  const base = parseFreeBase(raw);
  if (!base) return s;
  return { ...s, free: { base }, last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, n: 0, last: null } : s);

/* ── Preuves (onTrial) ───────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ kind: 'release', ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/* ── Onboarding (LabCoach) ───────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse : `grab` (le premier geste : la poignée de queue, ou −/+), `try` (continuer),
 * `divide` (une tâche demande de passer sous 0 et l'élève n'y est jamais allé : on montre le bouton −, pas le nombre de
 * wagons), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-pt-next]', gesture: 'tap' } : null;
  const mine = guidedTrials(s);
  const B = s.world === 'couple';
  if (mine.length === 0) return { id: B ? 'grabB' : 'grab', target: '[data-pt-knob]', gesture: 'drag' };
  const t = taskOf(s);
  if (!B && t.goal < 0 && !s.below && mine.length >= 1) return { id: 'divide', target: '[data-pt-less]', gesture: 'tap' };
  return { id: B ? 'tryB' : 'try', target: '[data-pt-stepper]', gesture: 'tap' };
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

/**
 * build — deux trains de l'élève de même base négative : un pair (positif) et un impair (négatif), et la charge du premier
 * wagon. Pris dans ses essais guidés ; à défaut, les tâches résolues (des faits qu'il a vus).
 */
export function parityWitness(s) {
  const base = s.base;
  const seen = s.trials.filter((t) => !t.free && t.base === base && t.n > 0);
  const find = (pred) => seen.findLast(pred) ?? null;
  const even = find((t) => t.n % 2 === 0) ?? { n: 2, load: text(P.pow(base, 2)) };
  const odd = find((t) => t.n % 2 === 1 && t.n > 1) ?? find((t) => t.n % 2 === 1) ?? { n: 3, load: text(P.pow(base, 3)) };
  const one = { n: 1, load: text(P.pow(base, 1)) };
  return { base, even, odd, one };
}

/** build (avancé) — un train « ÷ » de l'élève et le train « × » de même longueur. */
export function inverseWitness(s) {
  const base = s.base;
  const neg = s.trials.find((t) => !t.free && t.base === base && t.n < 0) ?? { n: -2, load: text(P.pow(base, -2)) };
  const k = -neg.n;
  return { base, k, divide: neg.load, times: text(P.pow(base, k)), opposite: text(P.neg(P.pow(base, k))) };
}

/** couple — une tâche attelée résolue : m, n, l'exposant attelé ; et le produit des exposants (la fausse règle). */
export function coupleWitness(s) {
  const i = Object.keys(s.solved).map(Number).sort((a, b) => a - b).find((k) => s.tasks[k].op === 'times') ?? 0;
  const t = s.tasks[i];
  const n = s.solved[i]?.n ?? t.goal;
  return { m: t.m, n, sum: t.m + n, product: t.m * n, op: t.op };
}

/** « أعِد التجربة » (questions pendant le labo) : la MÊME tâche repart ET son drapeau « fait » tombe (avec son essai gardé) — sinon l'étape resterait verte et la carte de questions ne se rouvrirait pas. */
export function retryTask(s) {
  const r = restartTask(s);
  if (s.free) return r;
  const done = { ...s.done }; delete done[s.ti];
  const solved = { ...s.solved }; delete solved[s.ti];
  return { ...r, done, solved };
}
