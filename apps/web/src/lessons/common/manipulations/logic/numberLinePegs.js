/**
 * number-line-pegs — LA LOGIQUE PURE de « حبل الأعداد » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « العدد الناطق », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/fractions3.js` (`writingValue`, `normalize`, `isDecimalRational`, `twelfths`, `unitOf`, `integerAndFraction`)
 * et de `powers.js`, importés PAR CHEMIN, jamais par le barrel du cœur. Aucun flottant pour un VERDICT.
 *
 * LE MODÈLE. Un حبل tendu dans la cour de l'école, gradué aux entiers. Des CARTES portent une ÉCRITURE a/b (a et b relatifs, a éventuellement décimal : « 6/-8 »,
 * « -9/-12 », « -1,5 »). La MAIN porte une carte et l'ACCROCHE où elle croit que le nombre habite (une prédiction, MANUEL §16.3) : la position est un rationnel
 * x = k / SNAP (SNAP = 12 en مبتدئ, 48 en متقدم ≈ continu). « تحقّق » laisse le VENT agir : chaque carte glisse jusqu'à son VRAI piquet (la valeur exacte de son
 * écriture). Les écritures de la MÊME valeur s'EMPILENT sur un piquet ; une carte accrochée du mauvais côté du zéro le TRAVERSE.
 *
 * Une TÂCHE : `{ id, kind: 'hang' | 'order', cards: ['6/-8', …], range?: [lo, hi] }`.
 *  - `hang` (مبتدئ) : on accroche des cartes, « تحقّق » fait glisser celles qui sont accrochées ; finie quand TOUTES les cartes ont atterri.
 *  - `order` (متقدم) : TOUTES les cartes d'abord, puis UN « تحقّق » : le verdict exige le BON ORDRE et, pour chaque carte, le bon intervalle unité. Un verdict
 *    faux laisse glisser les cartes (on voit l'échange) puis « أعد » les remet dans le panier.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`) :
 *   { kind: 'hang', task, taskId, card, x: 'a/b' , free }                                         // une carte accrochée (x exact)
 *   { kind: 'settle', task, taskId, moves: [{ card, from, to, crossedZero }], stacks: [[id…]], free } // « تحقّق » sur `hang`
 *   { kind: 'order', task, taskId, ok, why?: 'unit' | 'order', free }                              // « تحقّق » sur `order`
 *   { kind: 'custom', free: true }                                                                  // « جرّب أعدادك » (jamais compté)
 *   { kind: 'solved', task, taskId }
 */
import { rat, ratText, eq, sign, sub, mul } from '@smarter-academy/core/arithmetic/powers.js';
import { writingValue, normalize, isDecimalRational, twelfths, unitOf } from '@smarter-academy/core/arithmetic/fractions3.js';

export const SNAP_HANG = 12;
const SNAP_ORDER = 48;
const RANGE = Object.freeze([-4, 4]);
const FREE_MAX_A = 48;
const FREE_MAX_B = 12;
const FREE_MAX_CARDS = 8;

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'w1', cards: ['6/-8', '-3/4', '3/4', '-9/-12'], range: [-2, 2] },
    { id: 'w2', cards: ['-7/3', '7/-3', '-14/6', '14/6'], range: [-3, 3] },
    { id: 'w3', cards: ['-1,5', '2', '-20/-8', '-3'], range: [-4, 4] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'order', cards: ['-7/4', '5/6', '-2/3', '-13/6', '3/2', '-1/12'], range: [-3, 3] },
    { id: 'a2', kind: 'order', cards: ['9/-4', '-11/4', '-10/4'], range: [-4, 0] },
    { id: 'a3', kind: 'order', cards: ['15/-20', '-6/8', '-5/6'], range: [-2, 1] },
  ] },
  writings: { world: 'writings', tasks: [{ id: 'k1', cards: ['15/-20', '-6/8', '3/-4', '-12/16', '3/4'], range: [-2, 2] }] },
});

const latin = (text) => String(text ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/٫|،/g, ',').replace(/−|–/g, '-');
export { latin };

/** Une carte : son écriture (affichée telle quelle), sa valeur exacte, sa forme modèle. */
export function buildCard(text, i = 0) {
  const t = latin(text).trim().replace(/\s+/g, '');
  const k = t.indexOf('/');
  const num = k < 0 ? t : t.slice(0, k);
  const den = k < 0 ? null : t.slice(k + 1);
  const value = writingValue(t);               // exception si b = 0
  const norm = normalize(value);
  return Object.freeze({
    id: `c${i}`, text: t, num, den, value, valueText: ratText(value), norm,
    tw: twelfths(value), decimal: isDecimalRational(value), unit: unitOf(value),
  });
}

/** La tâche complétée ; exception si une donnée est invalide. */
export function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'hang';
  if (kind !== 'hang' && kind !== 'order') throw new Error('tâche inconnue');
  const [lo, hi] = raw.range ?? RANGE;
  if (!(hi > lo)) throw new Error('intervalle vide');
  const cards = (raw.cards ?? []).map((c, j) => buildCard(c, j));
  if (cards.length < 1 || cards.length > 8) throw new Error('une à huit cartes');
  cards.forEach((c) => { if (sub(c.value, rat(lo, 1)).n < 0n || sub(rat(hi, 1), c.value).n < 0n) throw new Error('carte hors du حبل'); });
  const snap = kind === 'order' ? SNAP_ORDER : SNAP_HANG;
  return Object.freeze({ id: raw.id ?? `t${i}`, kind, cards: Object.freeze(cards), range: [lo, hi], snap, free: !!raw.free });
}

const BLANK = { hung: {}, landed: {}, held: null, last: null, verdict: null, stackSeen: false, failed: false, touched: false };

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const world = numbers.world === 'writings' ? 'writings' : 'rope';
  const tasks = raws.map(buildTask);
  return { world, tasks, ti: 0, ...BLANK, done: {}, trials: [], free: null, freeCards: [], record: {} };
}

/* ── Lecture ────────────────────────────────────────────────────────────────────────────────── */

export const isFree = (s) => !!s.free;
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s, i = s.ti) => !s.free && !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const cardOf = (s, id) => taskOf(s).cards.find((c) => c.id === id);
/** La découverte (مبتدئ, monde `rope`) s'ouvre quand toutes les tâches `hang` sont faites. */
export const discoveryReady = (s) => !s.free && s.world === 'rope' && s.tasks.length >= 2 && s.tasks.every((t) => t.kind === 'hang') && allDone(s);
export const inBasket = (s) => taskOf(s).cards.filter((c) => !(c.id in s.hung) && s.held?.id !== c.id);
export const hungCards = (s) => taskOf(s).cards.filter((c) => c.id in s.hung);
export const isLanded = (s, id) => !!s.landed[id];
const unlanded = (s) => hungCards(s).filter((c) => !s.landed[c.id]);

/** La position (rationnel) k / snap d'un entier k. */
const posOf = (s, k) => rat(k, taskOf(s).snap);
/** L'abscisse en UNITÉS (flottant, POUR LE DESSIN seulement) d'un k / snap. */
export const unitsOf = (s, k) => k / taskOf(s).snap;
const kRange = (s) => { const t = taskOf(s); return [t.range[0] * t.snap, t.range[1] * t.snap]; };

/** La position où une carte atterrit (sa vraie valeur, flottant pour le dessin). */
export const trueUnits = (c) => Number(c.value.n) / Number(c.value.d);

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

const ev = (s, e) => Object.freeze({ taskId: taskOf(s).id, task: s.free ? 'free' : s.ti, free: !!s.free, ...e });
const clampK = (s, k) => { const [lo, hi] = kRange(s); return Math.max(lo, Math.min(hi, Math.round(k))); };

/** Prendre une carte (du panier, ou une carte déjà accrochée mais pas encore atterrie : on la reprend). */
export function take(s, id) {
  if (s.landed[id] || taskDone(s)) return s;
  const c = cardOf(s, id);
  if (!c) return s;
  const hung = { ...s.hung };
  const startK = id in hung ? hung[id] : null;
  delete hung[id];
  return { ...s, hung, held: { id, k: startK }, touched: true, verdict: null };
}
/** Poser (aperçu) la carte tenue à k / snap : rien n'est jugé. */
export function holdAt(s, k) {
  if (!s.held) return s;
  return { ...s, held: { ...s.held, k: clampK(s, k) } };
}
/** Déplacer la carte tenue de `delta` pas ; la 1re fois elle part de 0. */
export function nudge(s, delta) {
  if (!s.held) return s;
  const k = s.held.k == null ? 0 : s.held.k;
  return holdAt(s, k + delta);
}
/** Lâcher la carte tenue hors du حبل : elle retourne au panier. */
export function drop(s) { return s.held ? { ...s, held: null } : s; }

/** ACCROCHER la carte tenue à sa position : l'essai de la main. */
export function hang(s) {
  if (!s.held || s.held.k == null) return s;
  const { id, k } = s.held;
  const e = ev(s, { kind: 'hang', card: id, x: ratText(posOf(s, k)) });
  return { ...s, hung: { ...s.hung, [id]: k }, held: null, last: null, verdict: null, trials: [...s.trials, e] };
}

/* ── « تحقّق » : le vent ───────────────────────────────────────────────────────────────────── */

export function canCheck(s) {
  if (s.held || taskDone(s)) return false;
  const t = taskOf(s);
  if (t.kind === 'order') return hungCards(s).length === t.cards.length && unlanded(s).length === t.cards.length;
  return unlanded(s).length > 0;
}

/** Les piquets (valeurs) où des cartes ATTERRIES se sont empilées : [[id, id…]] (≥ 2 cartes de la même valeur). */
function stacksOf(s, ids = Object.keys(s.landed).filter((id) => s.landed[id])) {
  const t = taskOf(s);
  const groups = [];
  for (const id of ids) {
    const c = t.cards.find((x) => x.id === id);
    const g = groups.find((gr) => eq(gr.value, c.value));
    if (g) g.ids.push(id); else groups.push({ value: c.value, ids: [id] });
  }
  return groups.filter((g) => g.ids.length > 1).map((g) => g.ids);
}

/** Le déplacement d'une carte : de sa position accrochée à son vrai piquet. */
function moveOf(s, c) {
  const k = s.hung[c.id];
  const from = posOf(s, k);
  const to = c.value;
  const delta = sub(to, from);
  const crossedZero = sign(from) * sign(to) < 0;
  const tw = mul(delta, rat(12, 1));
  return Object.freeze({ card: c.id, from: ratText(from), to: ratText(to), delta: ratText(delta), twelfths: ratText(tw), dir: sign(delta) > 0 ? 'right' : sign(delta) < 0 ? 'left' : 'stay', crossedZero });
}

/**
 * Le verdict de l'ORDRE (tâche `order`, toutes les cartes accrochées) : chaque carte dans le bon intervalle unité [k, k+1[ ET, pour deux valeurs DIFFÉRENTES, la plus petite
 * à gauche (deux valeurs égales peuvent être accrochées n'importe comment l'une par rapport à l'autre).
 */
function verdictOrder(s) {
  const t = taskOf(s);
  const items = t.cards.map((c) => ({ c, x: posOf(s, s.hung[c.id]) }));
  for (const { c, x } of items) {
    if (unitOf(x) !== c.unit) return { ok: false, why: 'unit', card: c.id };
  }
  for (let i = 0; i < items.length; i += 1) {
    for (let j = 0; j < items.length; j += 1) {
      const a = items[i]; const b = items[j];
      if (sign(sub(a.c.value, b.c.value)) < 0 && sign(sub(a.x, b.x)) >= 0) return { ok: false, why: 'order', a: a.c.id, b: b.c.id };
    }
  }
  return { ok: true };
}

export function check(s) {
  if (!canCheck(s)) return s;
  const t = taskOf(s);
  const free = !!s.free;
  const list = unlanded(s);
  const moves = list.map((c) => moveOf(s, c));
  const landed = { ...s.landed };
  list.forEach((c) => { landed[c.id] = true; });
  const stacks = stacksOf({ ...s, landed });
  const base = { ...s, landed, last: { moves, stacks }, stackSeen: s.stackSeen || stacks.length > 0, trials: [...s.trials] };
  if (t.kind === 'order') {
    const v = verdictOrder(s);
    base.verdict = v;
    base.trials.push(ev(s, { kind: 'order', ok: v.ok, why: v.ok ? undefined : v.why }));
    if (v.ok && !free && !s.done[s.ti]) { base.done = { ...s.done, [s.ti]: true }; base.trials.push(ev(s, { kind: 'solved' })); }
    if (!v.ok) base.failed = true;
  } else {
    base.trials.push(ev(s, { kind: 'settle', moves: moves.map(({ card, from, to, crossedZero }) => ({ card, from, to, crossedZero })), stacks }));
    const all = t.cards.every((c) => landed[c.id]);
    if (all && !free && !s.done[s.ti]) { base.done = { ...s.done, [s.ti]: true }; base.trials.push(ev(s, { kind: 'solved' })); }
  }
  if (free) base.trials.push(Object.freeze({ kind: 'custom', free: true, taskId: 'free', task: 'free' }));
  return base;
}

/** « أعد » : après un verdict d'ordre faux, les cartes retournent au panier (l'historique reste). */
export const canRetry = (s) => !s.free && taskOf(s).kind === 'order' && s.failed && !taskDone(s);
export function retry(s) { return canRetry(s) ? { ...s, ...BLANK } : s; }
/** Recommencer la tâche (bouton d'en-tête de la coque). */
export const restartTask = (s) => (s.free ? { ...s, ...BLANK } : { ...s, ...BLANK, done: { ...s.done, [s.ti]: false } });
export function nextTask(s) { return canNext(s) ? { ...s, ti: s.ti + 1, ...BLANK } : s; }

/* ── « جرّب أعدادك » : toujours ouvert ─────────────────────────────────────────────────────── */

/** Valide une écriture a/b de l'élève : `{ ok: true, text }` ou `{ ok: false, why }` avec why ∈ empty | range | zero | outside | full. */
export function validateFree(aText, bText, count = 0) {
  const a = latin(aText).trim(); const b = latin(bText).trim();
  if (a === '' || b === '') return { ok: false, why: 'empty' };
  if (!/^-?\d{1,2}(,\d)?$/.test(a) || !/^-?\d{1,2}$/.test(b)) return { ok: false, why: 'range' };
  if (Number(b) === 0) return { ok: false, why: 'zero' };
  if (Math.abs(Number(a.replace(',', '.'))) > FREE_MAX_A || Math.abs(Number(b)) > FREE_MAX_B) return { ok: false, why: 'range' };
  if (count >= FREE_MAX_CARDS) return { ok: false, why: 'full' };
  const text = `${a}/${b}`;
  const v = writingValue(text);
  if (sub(v, rat(RANGE[0], 1)).n < 0n || sub(rat(RANGE[1], 1), v).n < 0n) return { ok: false, why: 'outside' };
  return { ok: true, text };
}
/** Ajoute une carte au panier libre (la tâche libre est reconstruite, ce qui est déjà accroché reste). */
export function addFree(s, aText, bText) {
  const v = validateFree(aText, bText, s.freeCards.length);
  if (!v.ok) return s;
  const freeCards = [...s.freeCards, v.text];
  const free = buildTask({ id: 'free', cards: freeCards, free: true });
  return { ...s, free, freeCards, ...(s.free ? { held: null } : BLANK) };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, freeCards: [], ...BLANK } : s);

/* ── Lectures pour la scène ─────────────────────────────────────────────────────────────────── */

/** Les premiers `n` chiffres décimaux de |x| (BigInt, tronqués) : { int, digits } — « 2 » et « 333… » pour 7/3. */
export function decimalDigits(x, n = 12) {
  const v = typeof x === 'object' && 'n' in x ? x : rat(x, 1);
  const num = v.n < 0n ? -v.n : v.n;
  const int = num / v.d;
  let r = num % v.d;
  let digits = '';
  for (let i = 0; i < n && r !== 0n; i += 1) { r *= 10n; digits += String(r / v.d); r %= v.d; }
  return { int: String(int), digits, neg: v.n < 0n, endless: r !== 0n };
}

/** La première carte accrochée du mauvais côté du zéro (pour le verdict de مبتدئ), ou null. */
export function wrongSide(s) {
  for (const c of hungCards(s)) { const k = s.hung[c.id]; if (sign(rat(k, 1)) * sign(c.value) < 0) return c; }
  return null;
}

/* ── Onboarding ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais le nombre : `card` (porter une carte), `hang` (une carte est en main : l'accrocher), `check` (« تحقّق »), `stack` (une pile vient de
 * se former), `retry`, `free` quand TOUT est fait. `null` en libre ET dans la découverte de مبتدئ.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-npp-free]', gesture: 'type' };
  if (s.held) return { id: t.snap === SNAP_HANG ? 'loupe' : 'hang', target: '[data-npp-rope]', gesture: 'drag' };
  if (canRetry(s)) return { id: 'retry', target: '[data-npp-retry]', gesture: 'tap' };
  if (canCheck(s)) return { id: 'check', target: '[data-npp-check]', gesture: 'tap', prefer: 'above' };
  if (s.last?.stacks?.length) return { id: 'stack', target: '[data-npp-stack]', gesture: 'tap' };
  return { id: 'card', target: '[data-npp-card]', gesture: 'drag', prefer: 'above' };
}
