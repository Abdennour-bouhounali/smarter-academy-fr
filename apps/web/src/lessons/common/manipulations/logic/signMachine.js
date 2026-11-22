/**
 * sign-machine — LA LOGIQUE PURE de « آلة الجداءات » (3AM, unité 1 « الأعداد النسبية », درس « جداء عددين نسبيين », module 2 معارف,
 * 2026-10-27). Entiers seulement : |a| ≤ 4, |b| ≤ 4, donc |a × b| ≤ 16 — aucun arrondi possible.
 *
 * LE MODÈLE. La machine du نادي الرياضيات porte un PREMIER facteur a (le cadran) ; la main tient le SECOND facteur b (un curseur sous un
 * tableau de neuf colonnes b = −4 … 4, −/+). Chaque b visité ALLUME sa colonne : une barre de hauteur a × b au-dessus (positif) ou
 * au-dessous (négatif) de la ligne 0. Les colonnes allumées restent : le tableau des جداءات se construit sous la main, et entre deux
 * colonnes voisines allumées une pastille écrit l'écart (« +3 »). Ce que le tableau MONTRE : le pas reste le même quand b traverse 0, donc
 * (−3) × (−1) = 3 est AU-DESSUS de la ligne — la règle se lit dans la régularité, elle n'est jamais énoncée.
 *
 * LA RÉSISTANCE. Le côté négatif de b est VERROUILLÉ (« ؟ ») tant que la mission de prédiction n'est pas réussie : on ne voit pas
 * (−3) × (−1) avant de l'avoir prédit (cartes, chacune porte une conviction fausse). En متقدم la main tient aussi a (le levier de signe
 * et −/+ de sa distance) : retourner le signe de a renverse TOUT le tableau autour de la ligne 0.
 *
 * MISSIONS (`tasks`)
 *   fill     allumer toutes les colonnes de `from` à `to` (b décroissant, a imposé).
 *   predict  a et b donnés : choisir le produit parmi des cartes AVANT de voir (déverrouille le côté négatif).
 *   reach    a imposé (`a` de la mission, sinon celui du labo), un produit demandé : trouver b (unique).
 *   both     un produit demandé, a libre : l'obtenir avec a > 0 PUIS avec a < 0 (deux manières, signes opposés).
 */

export const RANGE_B = Object.freeze([-4, 4]);
export const RANGE_A = Object.freeze([-4, 4]);
export const COLUMNS = Object.freeze([-4, -3, -2, -1, 0, 1, 2, 3, 4]);

/** Les missions par défaut de chaque niveau (la leçon peut passer les siennes). */
export const PRESETS = Object.freeze({
  beginner: {
    a: -3,
    tasks: [
      { id: 'm1', kind: 'fill', from: 4, to: 0 },
      { id: 'p1', kind: 'predict', b: -1, options: [3, -3, -4, -2], key: 3, misc: { '-3': 'MISC-JIDAA-NEGNEG', '-4': 'MISC-JIDAA-ADD', '-2': 'MISC-JIDAA-SUB' } },
      { id: 'm2', kind: 'reach', product: 12 },
    ],
  },
  advanced: {
    a: -4,
    tasks: [
      { id: 'a1', kind: 'predict', b: -2, options: [8, -8, -6, -2], key: 8, misc: { '-8': 'MISC-JIDAA-NEGNEG', '-6': 'MISC-JIDAA-ADD', '-2': 'MISC-JIDAA-SUB' } },
      { id: 'a2', kind: 'both', product: 8 },
      { id: 'a3', kind: 'reach', a: 2, product: -6 },
    ],
  },
});

const int = (v) => {
  const n = Number(String(v).replace('−', '-'));
  if (!Number.isInteger(n)) throw new Error(`entier attendu : ${v}`);
  return n;
};
const clamp = ([lo, hi], v) => Math.max(lo, Math.min(hi, Math.round(v)));

/* ── Lectures de base ───────────────────────────────────────────────────────────────────────── */

/** a × b, sans −0 (« −0 » ne s'affiche jamais). */
export const productOf = (a, b) => (a * b) || 0;
/** Le b unique (dans −4 … 4) tel que a × b = p, ou null. */
export function bFor(a, p) {
  if (!a) return null;
  const b = p / a;
  return Number.isInteger(b) && b >= RANGE_B[0] && b <= RANGE_B[1] ? b : null;
}
/** L'écart entre la colonne b − 1 et la colonne b : (a × (b − 1)) − (a × b) = −a. */
export const stepDown = (a) => -a;

/* ── État ───────────────────────────────────────────────────────────────────────────────────── */

function normalize(list, a0) {
  return list.map((t, i) => {
    const kind = t.kind ?? 'reach';
    const task = { id: t.id ?? `t${i}`, kind };
    if (kind === 'fill') return Object.freeze({ ...task, a: int(t.a ?? a0), from: int(t.from), to: int(t.to) });
    if (kind === 'predict') {
      return Object.freeze({ ...task, a: int(t.a ?? a0), b: int(t.b), options: t.options.map(int), key: int(t.key), misc: t.misc ? { ...t.misc } : null });
    }
    if (kind === 'both') return Object.freeze({ ...task, product: int(t.product) });
    return Object.freeze({ ...task, a: int(t.a ?? a0), product: int(t.product) });
  });
}

/** Le a avec lequel la mission s'ouvre (`both` : le a courant, sinon celui de la mission). */
const aOpening = (task, current) => (task.kind === 'both' ? (current || 2) : task.a);
/** Le b avec lequel une mission s'ouvre : le haut du tableau. */
const B_START = 4;

/** L'état de départ. `numbers` = { a, tasks } (cf. PRESETS). Une mission impossible lève une erreur. */
export function init(numbers = {}) {
  const a0 = int(numbers.a ?? PRESETS.beginner.a);
  const tasks = normalize(numbers.tasks ?? PRESETS.beginner.tasks, a0);
  for (const tk of tasks) {
    if (tk.kind === 'reach' && bFor(tk.a, tk.product) == null) throw new Error(`produit impossible : ${tk.a} × b = ${tk.product}`);
    if (tk.kind === 'predict' && !tk.options.includes(tk.key)) throw new Error('clé de prédiction absente des cartes');
    if (tk.kind === 'predict' && tk.key !== tk.a * tk.b) throw new Error('clé de prédiction fausse');
    if (tk.kind === 'both' && !COLUMNS.some((b) => b && Number.isInteger(tk.product / b) && Math.abs(tk.product / b) <= RANGE_A[1] && tk.product / b > 0)) throw new Error('both impossible');
  }
  const first = tasks[0];
  const a = aOpening(first, a0);
  return {
    a0, a, b: B_START, tasks, ti: 0, lit: { [B_START]: true },
    done: {}, solved: {}, classes: {}, trials: [], last: null, free: null, aChanged: false, picked: null,
    advanced: tasks.some((t) => t.kind === 'both'),
  };
}

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const aOf = (s) => (s.free ? s.free.a : s.a);
export const bOf = (s) => (s.free ? s.free.b : s.b);
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const cardsOpen = (s) => !s.free && taskOf(s).kind === 'predict' && !taskDone(s);
/** Le cadran de a est à la main (mission `both` seulement, et en libre par la carte « جرّب أعدادك »). */
export const aEditable = (s) => !s.free && taskOf(s).kind === 'both';

/**
 * Le côté négatif de b est verrouillé tant qu'une mission de prédiction n'est pas réussie (même plus loin dans la liste : le tableau
 * montrerait sa réponse). En libre, jamais.
 */
export const negLocked = (s) => !s.free && s.tasks.some((tk, i) => tk.kind === 'predict' && !s.done[i]);
export const minB = (s) => (negLocked(s) ? 0 : RANGE_B[0]);

/** Les colonnes allumées (en libre : toutes), dans l'ordre de l'axe. */
export const litColumns = (s) => (s.free ? [...COLUMNS] : COLUMNS.filter((b) => s.lit[b]));

/** Les pastilles d'écart : une entre chaque paire de colonnes voisines allumées { from: b, to: b − 1, diff }. */
export function stepPills(s) {
  const lit = new Set(litColumns(s));
  const a = aOf(s);
  return COLUMNS.filter((b) => b > RANGE_B[0] && lit.has(b) && lit.has(b - 1)).map((b) => ({ from: b, to: b - 1, diff: productOf(a, b - 1) - productOf(a, b) }));
}

/** La mission est-elle réussie par (a, b) ? (Pour `fill` : selon les colonnes allumées.) */
function judge(task, a, b, lit) {
  const product = productOf(a, b);
  if (task.kind === 'fill') {
    const need = COLUMNS.filter((x) => x <= task.from && x >= task.to);
    return { ok: a === task.a && need.every((x) => lit[x]), product };
  }
  if (task.kind === 'reach') return { ok: a === task.a && product === task.product, product };
  if (task.kind === 'both') return { ok: a !== 0 && product === task.product, product };
  return { ok: false, product };
}

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

/** Pendant un glisser : b suit la main et allume sa colonne, sans essai. */
export function preview(s, v) {
  const b = Math.max(minB(s), clamp(RANGE_B, v));
  if (s.free) return b === s.free.b ? s : { ...s, free: { ...s.free, b } };
  if (b === s.b && s.lit[b]) return s;
  return { ...s, b, lit: { ...s.lit, [b]: true } };
}

/** Un b LÂCHÉ : un essai jugé (même sans changement — l'élève a relâché ici). */
export function release(s, v = bOf(s)) {
  if (cardsOpen(s)) return s;
  const b = Math.max(minB(s), clamp(RANGE_B, v));
  if (s.free) {
    const trial = Object.freeze({ kind: 'release', task: s.ti, taskId: null, a: s.free.a, b, product: productOf(s.free.a, b), ok: false, free: true });
    return { ...s, free: { ...s.free, b }, trials: [...s.trials, trial], last: trial };
  }
  const lit = { ...s.lit, [b]: true };
  const task = taskOf(s);
  const a = s.a;
  // une mission déjà réussie (la prédiction surtout : sa colonne est allumée par la carte) n'est plus jugée : bouger est une EXPLORATION
  // (`look`), jamais un refus — sinon « ليس هذا العمود » s'afficherait après une réussite, sans produit demandé
  const look = !!s.done[s.ti];
  const j = look ? { ok: false, product: productOf(a, b) } : judge(task, a, b, lit);
  const trial = Object.freeze({ kind: 'release', task: s.ti, taskId: task.id, a, b, product: j.product, ok: j.ok, free: false, look, goal: task.product ?? null });
  let { done, solved, classes } = s;
  if (j.ok) {
    if (task.kind === 'both') {
      const c = { ...(classes[s.ti] ?? {}), [a > 0 ? 'pos' : 'neg']: { a, b } };
      classes = { ...classes, [s.ti]: c };
      if (c.pos && c.neg) {
        done = { ...done, [s.ti]: true };
        solved = { ...solved, [s.ti]: { a: c.pos.a, b: c.pos.b, product: task.product, also: c.neg } };
      }
    } else if (!done[s.ti]) {
      done = { ...done, [s.ti]: true };
      solved = { ...solved, [s.ti]: { a, b, product: j.product } };
    }
  }
  return { ...s, b, lit, done, solved, classes, trials: [...s.trials, trial], last: trial };
}

/** −/+ : une colonne de moins / de plus (un essai). */
export const step = (s, d) => release(s, bOf(s) + d);

/**
 * Le cadran de a (mission `both`) : a change, le tableau entier se redessine avec le nouveau a — toutes les colonnes allumées gardent
 * leur b. C'est un essai (la colonne tenue change de hauteur).
 */
export function setA(s, v) {
  if (!aEditable(s)) return s;
  const a = clamp(RANGE_A, v);
  if (a === s.a) return s;
  return release({ ...s, a, aChanged: true, last: null }, s.b);
}
/** Le levier de signe : change le signe de a en gardant sa distance à zéro (au moins 1). */
export const flipSign = (s) => setA(s, s.a === 0 ? 1 : -s.a);

/** Prédiction : une carte. Chaque carte fausse porte une conviction ; la bonne allume la colonne prédite et déverrouille. */
export function choose(s, option) {
  if (!cardsOpen(s)) return s;
  const task = taskOf(s);
  const pick = int(option);
  const ok = pick === task.key;
  const trial = Object.freeze({
    kind: 'predict', task: s.ti, taskId: task.id, a: task.a, b: task.b, product: productOf(task.a, task.b), pick, ok, free: false,
    misc: ok ? null : (task.misc?.[String(pick)] ?? null),
  });
  const base = { ...s, picked: pick, trials: [...s.trials, trial], last: trial };
  if (!ok) return base;
  return {
    ...base, a: task.a, b: task.b, lit: { ...s.lit, [task.b]: true },
    done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: { a: task.a, b: task.b, product: trial.product } },
  };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const task = s.tasks[s.ti + 1];
  const a = aOpening(task, s.a);
  // le curseur remonte en haut du tableau (la réponse n'est jamais déjà sous la main) ; le même a : les colonnes allumées restent
  // (le tableau se prolonge) ; un nouveau a : le tableau repart de sa première colonne
  const keep = a === s.a;
  return { ...s, ti: s.ti + 1, a, b: B_START, lit: keep ? { ...s.lit, [B_START]: true } : { [B_START]: true }, last: null, picked: null };
}

/** « إعادة » : le tableau de la mission repart de b = 4, les essais restent. */
function restartTask(s) {
  const task = taskOf(s);
  return { ...s, a: aOpening(task, s.a), b: B_START, lit: { [B_START]: true }, last: null, picked: null, free: null };
}

/** « أعِد التجربة » (questions du labo) : LA MÊME mission repart, non résolue (b = 4, ses colonnes éteintes). */
export function retryTask(s) {
  const { [s.ti]: _d, ...done } = s.done;
  const { [s.ti]: _s, ...solved } = s.solved;
  const { [s.ti]: _c, ...classes } = s.classes;
  return { ...restartTask(s), done, solved, classes };
}

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** a : entier de −4 à 4 (0 permis : toutes les colonnes restent sur la ligne). null si illisible. */
export function parseFree(raw) {
  const t = String(raw).trim().replace('−', '-');
  if (!/^-?\d$/.test(t)) return null;
  const a = Number(t);
  return a >= RANGE_A[0] && a <= RANGE_A[1] ? a : null;
}
export function setFree(s, raw) {
  const a = parseFree(raw);
  if (a == null) return s;
  if (s.free && s.free.a === a) return s;
  return { ...s, free: { a, b: s.free?.b ?? s.b }, last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, last: null } : s);

/* ── Preuves (onTrial) ──────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((x) => !x.free && x.task === i);

/* ── Onboarding (LabCoach) ──────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse : `cards` (la prédiction), `grab` (le curseur de b), `sign` (mission `both` : le levier
 * de signe de a, après deux essais sans l'avoir touché, ou quand la manière qui reste demande l'autre signe), `try` (−/+), `next`.
 * `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-sm-next]', gesture: 'tap' } : null;
  const t = taskOf(s);
  if (t.kind === 'predict') return { id: 'cards', target: '[data-sm-cards]', gesture: 'tap' };
  const mine = guidedTrials(s);
  if (mine.length === 0) return { id: 'grab', target: '[data-sm-knob]', gesture: 'drag', prefer: 'above', noFlip: true };
  if (t.kind === 'both' && mine.length >= 2) {
    const c = s.classes[s.ti] ?? {};
    const needSide = c.pos && !c.neg ? 'neg' : c.neg && !c.pos ? 'pos' : null;
    const onWrongSide = needSide && ((needSide === 'neg' && s.a > 0) || (needSide === 'pos' && s.a < 0));
    if (!s.aChanged || onWrongSide) return { id: 'sign', target: '[data-sm-a]', gesture: 'tap' };
  }
  return { id: 'try', target: '[data-sm-stepper]', gesture: 'tap', prefer: 'above', noFlip: true };
}

/* ── Découverte : le pas reste le même de l'autre côté de 0 ─────────────────────────────────── */

/**
 * Le témoin de la découverte et de la règle : le premier facteur du labo (a0, celui de l'histoire), le pas quand b descend (−a0), les
 * colonnes opposées b = 4 et b = −4 (leur somme est a0 × 0 = 0) et la colonne b = −1.
 */
export function witness(s) {
  const a = s.a0 || PRESETS.beginner.a;
  return { a, step: stepDown(a), b: 4, pos: productOf(a, 4), neg: productOf(a, -4), one: productOf(a, -1) };
}
