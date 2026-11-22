/**
 * size-ladder — LA LOGIQUE PURE de « سلّم الأحجام » (3AM, unité 3, درس « الكتابة العلمية ورتبة القدر », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/tenPowers.js` (importé PAR CHEMIN : `scientific`, `bracketOf`, `cellOf`, `orderOfMagnitude`, `compareDec`, `logPos`) ; la vue
 * (flottants) ne sert qu'au DESSIN — chaque verdict passe par les décimaux BigInt.
 *
 * LE MODÈLE. Un mur de couloir de foire des sciences porte un SLIDE de DÉCADES : chaque barreau n va de 10ⁿ m à 10ⁿ⁺¹ m et porte neuf cases entre les graduations 1 · 2 · … · 9 · 10,
 * placées LOGARITHMIQUEMENT (la case 1–2 est plus large que la case 9–10). Une carte porte une longueur (écrite de la façon donnée : décimale, k × 10ᵖ, en km …). La main tient
 * la POSITION de la carte : d'abord son BARREAU n (haut / bas), puis sa CASE (gauche / droite : la partie entière de a), puis l'AIMANT (arrondi à l'unité : a').
 *
 * Une tâche : { id, kind: 'hang' | 'compare', cards: [{ id, key, given: '265' | '0,048 × 10^-3', unit?: 'm' | 'km', typed?: bool, magnet?: bool }] }.
 * Phases d'une carte : 'type' (متقدم : on écrit a et n AVANT de la suspendre) → 'rung' → 'cell' → 'placed' (la carte s'écrit a × 10ⁿ ; l'aimant est facultatif ou requis).
 *
 * ÉVÉNEMENTS (`state.trials`) : { kind:'hover', task, rung } · { kind:'refused', task, rung, reason:'below'|'above'|'cell-before'|'cell-after'|'typed-value'|'typed-form'|'compare', value } ·
 * { kind:'dock', task, n, a } · { kind:'magnet', task, a1, n1 } · { kind:'typed', task, a, n, ok } · { kind:'compare', task, winner, ok } · { kind:'solved', task, sci, order } · { kind:'custom', value }.
 * Les essais libres portent `free: true`.
 */
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';

export const RUNG_MIN = -9;
export const RUNG_MAX = 11;
export const CELLS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const FREE_DIGITS = 15;
const FREE_P = 12;

/** Position d'une graduation k (1 … 10) sur un barreau, en fraction de sa longueur : échelle LOGARITHMIQUE. */
export const markFrac = (k) => Math.log10(k);
/** La case (1 … 9) sous une abscisse fractionnaire du barreau. */
export const cellAt = (frac) => Math.min(9, Math.max(1, Math.floor(10 ** Math.min(0.999999, Math.max(0, frac)))));
const clampRung = (n) => Math.max(RUNG_MIN, Math.min(RUNG_MAX, n));

/** La valeur d'une carte, en mètres, exacte. */
function valueOf(card) {
  const v = T.parseDec(card.given);
  if (!v || v.m <= 0n) throw new RangeError(`carte illisible : ${card.given}`);
  return T.timesPow10(v, T.UNIT_SCALE[card.unit ?? 'm']);
}

/* ── Presets (les mêmes valeurs que `levels.js`, comparées par un test) ───────────────────────────────────────────────────────── */
export const PRESETS = Object.freeze({
  beginner: { discovery: 'order', tasks: [
    { id: 'c1', kind: 'hang', cards: [{ id: 'minaret', key: 'minaret', given: '265', magnet: true }] },
    { id: 'c2', kind: 'hang', cards: [{ id: 'bus', key: 'bus', given: '1 950 000', magnet: true }] },
    { id: 'c3', kind: 'hang', cards: [{ id: 'sheet', key: 'sheet', given: '0,0001', magnet: true }] },
    { id: 'c4', kind: 'compare', cards: [{ id: 'sugar', key: 'sugar', given: '0,0006' }, { id: 'sheet2', key: 'sheet', given: '0,0001' }] },
  ] },
  advanced: { discovery: 'sci', tasks: [
    { id: 'c5', kind: 'hang', cards: [{ id: 'coast', key: 'coast', given: '1 200', unit: 'km', typed: true, magnet: true }] },
    { id: 'c6', kind: 'hang', cards: [{ id: 'hair', key: 'hair', given: '0,048 × 10^-3', typed: true, magnet: true }] },
    { id: 'c7', kind: 'hang', cards: [{ id: 'earth', key: 'earth', given: '12 742', unit: 'km', typed: true, magnet: true }] },
    { id: 'c8', kind: 'compare', cards: [{ id: 'cardA', key: 'cardA', given: '9,8 × 10^-5' }, { id: 'cardB', key: 'cardB', given: '1,2 × 10^-4' }] },
  ] },
});

/** La tâche brute → tâche gelée et vérifiée (les valeurs sont dans la plage de l'échelle). */
export function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'hang';
  if (!['hang', 'compare'].includes(kind)) throw new RangeError('kind hang | compare');
  const need = kind === 'compare' ? 2 : 1;
  if (!Array.isArray(raw.cards) || raw.cards.length !== need) throw new RangeError(`${kind} : ${need} carte(s)`);
  const cards = raw.cards.map((c, j) => {
    const value = valueOf(c);
    const n = T.bracketOf(value);
    if (n < RUNG_MIN || n > RUNG_MAX) throw new RangeError('valeur hors de l’échelle');
    const sci = T.scientific(value);
    const order = T.orderOfMagnitude(value);
    return Object.freeze({ id: c.id ?? `k${j}`, key: c.key ?? c.id ?? `k${j}`, given: c.given, unit: c.unit ?? 'm', typed: !!c.typed, magnet: !!c.magnet, value, n, cell: T.cellOf(value), sci, order });
  });
  if (kind === 'compare' && T.compareDec(cards[0].value, cards[1].value) === 0) throw new RangeError('cartes égales');
  return Object.freeze({ id: raw.id ?? `t${i}`, kind, cards: Object.freeze(cards), free: !!raw.free });
}

const fresh = (card) => ({ phase: card.typed ? 'type' : 'rung', hover: null, hoverCell: null, rung: null, cell: null, magnet: false, magnetUsed: false, typedOk: !card.typed });

export function init(numbers) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  return {
    tasks, discovery: numbers.discovery ?? null, ti: 0, cs: tasks[0].cards.map(fresh), pick: null, crown: null,
    done: tasks.map(() => false), trials: [], last: null, flash: 0, epoch: 0, moves: 0, free: null, magnetEver: false,
  };
}

export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
/** L'indice de la carte en cours : la première non terminée (-1 si toutes le sont). */
export function activeIndex(s) {
  const t = taskOf(s);
  return t.cards.findIndex((c, i) => !cardDone(c, s.cs[i]));
}
const cardDone = (card, st) => st.phase === 'placed' && (!card.magnet || st.magnetUsed);
export const activeCard = (s) => taskOf(s).cards[Math.max(0, activeIndex(s))];
export const activeState = (s) => s.cs[Math.max(0, activeIndex(s))];
const allPlaced = (s) => taskOf(s).cards.every((c, i) => s.cs[i].phase === 'placed');
/** Y a-t-il une carte à choisir (tâche « compare » : les deux sont posées) ? */
export const pickPending = (s) => {
  const t = taskOf(s);
  return t.kind === 'compare' && allPlaced(s) && !taskDone(s);
};
export function taskDone(s) {
  const t = taskOf(s);
  if (t.kind === 'compare') return allPlaced(s) && s.crown !== null;
  return t.cards.every((c, i) => cardDone(c, s.cs[i]));
}
export const allDone = (s) => s.done.every(Boolean);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
/** Le barreau autour duquel la fenêtre du mur se centre (jamais la réponse avant que la main l'ait touchée). */
export function centerRung(s) {
  const st = activeState(s);
  if (st.rung !== null) return st.rung;
  if (st.hover !== null) return st.hover;
  const placed = s.cs.find((c) => c.rung !== null);
  return placed ? placed.rung : 0;
}

const log = (s, ev) => ({ ...s, trials: [...s.trials, { ...ev, task: taskOf(s).id, ...(s.free ? { free: true } : {}) }] });
const setActive = (s, patch) => {
  const i = Math.max(0, activeIndex(s));
  return { ...s, cs: s.cs.map((c, j) => (j === i ? { ...c, ...patch } : c)) };
};

/* ── Barreau ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export function moveRung(s, n) {
  const st = activeState(s);
  if (st.phase !== 'rung' || taskDone(s)) return s;
  const r = clampRung(n);
  if (r === st.hover) return s;
  return { ...setActive(s, { hover: r }), moves: s.moves + 1, last: null };
}
export const stepRung = (s, d) => moveRung(s, (activeState(s).hover ?? 0) + d);

/** « علّق » : le jugement exact du barreau. */
export function dockRung(s) {
  const st = activeState(s);
  const card = activeCard(s);
  if (st.phase !== 'rung' || st.hover === null || taskDone(s)) return s;
  const r = st.hover;
  let n = log(s, { kind: 'hover', rung: r });
  if (r === card.n) {
    n = setActive(n, { phase: 'cell', rung: r, hoverCell: null });
    return { ...n, last: { kind: 'rung', n: r }, flash: s.flash + 1 };
  }
  const below = card.n < r; // la carte est plus petite que 10^r : sa place est plus bas
  const bound = below ? T.pow10(r) : T.pow10(r + 1);
  n = log(n, { kind: 'refused', rung: r, reason: below ? 'below' : 'above', value: T.decText(card.value) });
  return { ...setActive(n, { hover: null }), last: { kind: 'refused', reason: below ? 'below' : 'above', rung: r, bound: T.decText(bound), value: T.decText(card.value) }, flash: s.flash + 1 };
}

/* ── Case ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export function moveCell(s, c) {
  const st = activeState(s);
  if (st.phase !== 'cell' || taskDone(s)) return s;
  const k = Math.max(1, Math.min(9, c));
  if (k === st.hoverCell) return s;
  return { ...setActive(s, { hoverCell: k }), moves: s.moves + 1, last: null };
}
export const stepCell = (s, d) => moveCell(s, (activeState(s).hoverCell ?? 5) + d);

export function dockCell(s) {
  const st = activeState(s);
  const card = activeCard(s);
  if (st.phase !== 'cell' || st.hoverCell === null || taskDone(s)) return s;
  const c = st.hoverCell;
  if (c === card.cell) {
    let n = setActive(s, { phase: 'placed', cell: c });
    n = log(n, { kind: 'dock', n: card.n, a: card.sci.a });
    const ns = { ...n, last: { kind: 'dock', n: card.n, a: card.sci.a }, flash: s.flash + 1 };
    return finishIfDone(ns);
  }
  const mark = T.timesPow10(T.norm(BigInt(c), 0), st.rung);
  const mark1 = T.timesPow10(T.norm(BigInt(c + 1), 0), st.rung);
  const before = card.cell < c;
  const n = log(s, { kind: 'refused', rung: st.rung, reason: before ? 'cell-before' : 'cell-after', value: T.decText(card.value) });
  return { ...setActive(n, { hoverCell: null }), last: { kind: 'refused', reason: before ? 'cell-before' : 'cell-after', cell: c, bound: T.decText(before ? mark : mark1), value: T.decText(card.value) }, flash: s.flash + 1 };
}

export function toggleMagnet(s) {
  // l'aimant se manie sur la carte posée la plus récente qui n'est pas encore « terminée » ; sinon sur la dernière carte posée
  const placed = s.cs.map((c, i) => [c, i]).filter(([c]) => c.phase === 'placed');
  if (!placed.length) return s;
  const [target, ti] = placed.find(([c, i]) => !cardDone(taskOf(s).cards[i], c)) ?? placed.at(-1);
  if (taskOf(s).kind === 'compare') return s;
  const cd = taskOf(s).cards[ti];
  const on = !target.magnet;
  let n = { ...s, cs: s.cs.map((c, j) => (j === ti ? { ...c, magnet: on, magnetUsed: c.magnetUsed || on } : c)) };
  if (on) {
    n = log(n, { kind: 'magnet', a1: cd.order.a1, n1: cd.order.n1 });
    n = { ...n, magnetEver: true, last: { kind: 'magnet', a1: cd.order.a1, n1: cd.order.n1, carry: cd.order.n1 !== cd.n }, flash: s.flash + 1 };
  } else n = { ...n, last: { kind: 'magnet-off' } };
  return finishIfDone(n);
}

/* ── متقدم : on écrit a et n avant de suspendre ───────────────────────────────────────────────────────────────────────────────── */
/** Lit « 4,8 » (a) et « -5 » (n) ; `null` si illisible. */
function readTyped(aText, nText) {
  const a = T.parseDec(String(aText ?? '').trim());
  const nn = String(nText ?? '').trim().replace(/[−–]/g, '-');
  if (!a || a.m === 0n || !/^-?\d{1,2}$/.test(nn)) return null;
  return { a, n: Number(nn) };
}
export function submitTyped(s, aText, nText) {
  const st = activeState(s);
  const card = activeCard(s);
  if (st.phase !== 'type' || taskDone(s)) return s;
  const typed = readTyped(aText, nText);
  if (!typed) return { ...s, last: { kind: 'refused', reason: 'typed-invalid' }, flash: s.flash + 1 };
  const tv = T.timesPow10(typed.a, typed.n);
  const aStr = T.decText(typed.a, { group: false });
  if (T.compareDec(tv, card.value) !== 0) {
    const n = log(s, { kind: 'typed', a: aStr, n: typed.n, ok: false });
    return { ...log(n, { kind: 'refused', reason: 'typed-value', value: T.decText(tv) }), last: { kind: 'refused', reason: 'typed-value', a: aStr, n: typed.n, got: T.decText(tv, { group: true }), want: T.decText(card.value) }, flash: s.flash + 1 };
  }
  if (!T.isScientific(typed.a, typed.n)) {
    const n = log(s, { kind: 'typed', a: aStr, n: typed.n, ok: false });
    return { ...log(n, { kind: 'refused', reason: 'typed-form', value: aStr }), last: { kind: 'refused', reason: 'typed-form', a: aStr, n: typed.n }, flash: s.flash + 1 };
  }
  const n = log(s, { kind: 'typed', a: aStr, n: typed.n, ok: true });
  return { ...setActive(n, { phase: 'rung', typedOk: true }), last: { kind: 'typed-ok', a: aStr, n: typed.n }, flash: s.flash + 1 };
}

/* ── Comparer ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export function pickBigger(s, i) {
  if (!pickPending(s)) return s;
  const [x, y] = taskOf(s).cards;
  const win = T.compareDec(x.value, y.value) > 0 ? 0 : 1;
  const win0 = taskOf(s).cards[win];
  const lose0 = taskOf(s).cards[1 - win];
  const same = win0.n === lose0.n;
  if (i === win) {
    let n = log({ ...s, crown: i }, { kind: 'compare', winner: i, ok: true });
    n = { ...n, last: { kind: 'crown', winner: i, same }, flash: s.flash + 1 };
    return finishIfDone(n);
  }
  const n = log(s, { kind: 'compare', winner: i, ok: false });
  return { ...log(n, { kind: 'refused', reason: 'compare', value: String(i) }), last: { kind: 'refused', reason: 'compare', picked: i, same, rungs: [taskOf(s).cards[i].n, taskOf(s).cards[1 - i].n], aWins: win0.sci.a, cellWin: win0.cell, cellLose: lose0.cell }, flash: s.flash + 1 };
}

function finishIfDone(s) {
  if (!taskDone(s)) return s;
  const t = taskOf(s);
  if (s.free ? s.free.done : s.done[s.ti]) return s;
  const c = t.cards[0];
  let n = log(s, { kind: 'solved', sci: t.kind === 'compare' ? t.cards.map((k) => `${k.sci.a}|${k.sci.n}`).join(' ; ') : `${c.sci.a}|${c.sci.n}`, order: t.kind === 'compare' ? '' : `${c.order.a1}|${c.order.n1}` });
  if (s.free) return { ...n, free: { ...s.free, done: true } };
  const done = n.done.slice(); done[n.ti] = true;
  return { ...n, done };
}

function reset(s, extra = {}) {
  const t = extra.free ?? s.tasks[extra.ti ?? s.ti];
  return { ...s, ...extra, cs: t.cards.map(fresh), pick: null, crown: null, last: null, moves: 0, epoch: s.epoch + 1 };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  return reset({ ...s, ti: s.ti + 1 }, { ti: s.ti + 1 });
}
export function restartTask(s) {
  if (s.free) return reset(s, { free: { ...s.free, done: false } });
  return reset(s, {});
}

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────────────────────────────────────── */
/** Lit « 0,00045 » ou « 35,2 × 10^4 » ; { ok, value } ou { ok:false, why: 'invalid' | 'zero' | 'neg' | 'digits' | 'range' }. */
export function parseFree(text) {
  const raw = String(text ?? '').trim().replace(/[xX]/g, '×');
  if (!raw) return { ok: false, why: 'invalid' };
  const pm = /\^\s*\{?\s*(-?\d+)\s*\}?\s*$/.exec(raw.replace(/[−–]/g, '-'));
  if (pm && Math.abs(Number(pm[1])) > FREE_P) return { ok: false, why: 'range' };
  const v = T.parseDec(raw);
  if (!v) return { ok: false, why: 'invalid' };
  if (v.m === 0n) return { ok: false, why: 'zero' };
  if (v.m < 0n) return { ok: false, why: 'neg' };
  if (String(v.m).length > FREE_DIGITS) return { ok: false, why: 'digits' };
  const n = T.bracketOf(v);
  if (n < RUNG_MIN || n > RUNG_MAX) return { ok: false, why: 'range' };
  return { ok: true, value: v, given: raw.replace(/\s*×\s*/, ' × ') };
}
export function setFree(s, text) {
  const p = parseFree(text);
  if (!p.ok) return s;
  const card = Object.freeze({ id: 'free', key: 'free', given: p.given, unit: 'm', typed: false, magnet: false, value: p.value, n: T.bracketOf(p.value), cell: T.cellOf(p.value), sci: T.scientific(p.value), order: T.orderOfMagnitude(p.value) });
  const task = Object.freeze({ id: 'free', kind: 'hang', cards: Object.freeze([card]), free: true, done: false });
  return log(reset(s, { free: task }), { kind: 'custom', value: p.given });
}
export function toGuided(s) {
  return reset({ ...s, free: null }, {});
}

/* ── Découverte et onboarding ────────────────────────────────────────────────────────────────────────────────────────────────── */
export const discoveryKind = (s) => (!s.free && s.discovery && allDone(s) ? s.discovery : null);
const discoveryReady = (s) => discoveryKind(s) !== null;

/** L'étape du guide : fonction pure de l'état ; elle ne nomme jamais une règle. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-sl-next]', gesture: 'tap' } : { id: 'free', target: '[data-sl-free]', gesture: 'type' };
  if (pickPending(s)) return { id: 'pick', target: '[data-sl-pick]', gesture: 'tap', prefer: 'below' };
  const i = activeIndex(s);
  if (i < 0) return null;
  const st = s.cs[i];
  const card = taskOf(s).cards[i];
  if (st.phase === 'type') return { id: 'type', target: '[data-sl-input]', gesture: 'type', prefer: 'below' };
  if (st.phase === 'rung') return st.hover === null && s.moves === 0 && s.ti === 0 ? { id: 'card', target: '[data-sl-card]', gesture: 'look', prefer: 'below' } : { id: 'rung', target: '[data-sl-card]', gesture: 'drag', prefer: 'below' };
  if (st.phase === 'cell') return { id: 'cell', target: '[data-sl-card]', gesture: 'drag', prefer: 'below' };
  if (st.phase === 'placed' && card.magnet && !st.magnetUsed) return { id: 'magnet', target: '[data-sl-magnet]', gesture: 'tap', prefer: 'above' };
  return null;
}

/** « أعِد التجربة » (questions pendant le labo) : la MÊME carte repart ET son drapeau « fait » tombe — sinon l'étape resterait verte et la carte de questions ne se rouvrirait pas. */
export function retryTask(s) {
  const n = restartTask(s);
  return s.free ? n : { ...n, done: n.done.map((d, i) => (i === s.ti ? false : d)) };
}
