/**
 * like-terms — la logique PURE de « طاولة الحدود » (3AM, unité 4 « الحساب الحرفي », درس « تبسيط عبارة جبرية وحذف الأقواس »,
 * 2026-10-20). Aucun React ici. Toute la vérité est EXACTE : des entiers (`@smarter-academy/core/arithmetic/brackets.js`, importé
 * PAR CHEMIN, jamais par le barrel du core).
 *
 * L'idée. Chaque TERME de l'expression écrite est une HAUTE PILE de pièces de bois identiques, dessinées à la forme de sa partie
 * littérale : x² une plaque carrée de côté x, x une réglette de longueur x, 1 un petit cube. Un coefficient négatif = les mêmes pièces
 * dans la finition « opposée ». La main PORTE une pile (une « حزمة ») :
 *   collect   dans la صينية de SA forme. Une autre forme est REFUSÉE (`kind`) : leurs valeurs à x diffèrent (témoin `kindWitness` quand
 *             le x réglé les confond : x = 1). Dans une صينية, une pièce et son opposée s'annulent deux à deux (مبتدئ : tout de suite ;
 *             متقدم : l'élève règle le coefficient de chaque صينية et « تحقّق » juge — refus avec la valeur à x).
 *   brackets  hors d'une CAISSE de signe + ou − vers l'une des deux sorties : « كما هي » ou « بعكس إشارتها ». Le juge est la VALEUR :
 *             une mauvaise sortie changerait la valeur de l'expression (`isRightExit`, `witness`), elle est refusée (`sign`). Quand
 *             toutes les caisses sont vides, les trois صواني apparaissent et on range comme dans `collect` (lectures visibles).
 * INVARIANT : la valeur de ce qui est sur la table (piles libres + caisses + صواني) est TOUJOURS celle de l'expression écrite, à tout x.
 *
 * Les événements (`events`, dans l'ordre ; la leçon les lit par `state.report`) — formes fixées par le brief :
 *   { kind: 'sort', world, task, term, tray } · { kind: 'cancel', world, task, tray }
 *   { kind: 'refused', world, task, reason: 'kind', term, tray, x, termValue, trayValue }
 *   { kind: 'exit', world: 'brackets', task, crateSign, term, flipped }
 *   { kind: 'refused', world: 'brackets', task, reason: 'sign', crateSign, term, flipped, x, before, after }
 *   { kind: 'check', world: 'collect', task, tray, ok } · { kind: 'x', x }
 *   { kind: 'solved', world, task, expr, opened, result } (LaTeX) · { kind: 'custom', world }
 */
import * as B from '@smarter-academy/core/arithmetic/brackets.js';
import { termTex } from '@smarter-academy/core/arithmetic/polynomials.js';

/** Les صواني, de gauche à droite dans l'écriture : x², x, nombres. */
export const TRAYS = Object.freeze([2, 1, 0]);
export const X_MIN = 1;
export const X_MAX = 6;
const X_DEFAULT = 3;
/** Le panneau « جرّب أعدادك » : au plus 12 pièces AJOUTÉES par forme (depuis le début ou « امسح »), au plus 3 termes dans une caisse. */
const MAX_PIECES = 12;
const MAX_CRATE_TERMS = 3;
export const COEF_MIN = -24;
export const COEF_MAX = 24;

const t = (c, p) => ({ c, p });
/** Les tâches par défaut — celles du brief, exactes. */
export const COLLECT_TASKS = Object.freeze({
  beginner: Object.freeze([
    { id: 'collect-1', expr: [t(2, 1), t(3, 0), t(4, 1), t(1, 0), t(1, 1)] },
    { id: 'collect-2', expr: [t(5, 1), t(6, 0), t(-2, 1), t(-4, 0)] },
  ]),
  advanced: Object.freeze([
    { id: 'collect-3', expr: [t(4, 2), t(7, 0), t(-1, 1), t(-2, 2), t(5, 1), t(-9, 0)] },
    { id: 'collect-4', expr: [t(3, 2), t(-4, 1), t(6, 0), t(1, 1), t(-3, 2), t(-2, 0)] },
  ]),
});
export const BRACKET_TASKS = Object.freeze([
  { id: 'plus', expr: [t(7, 0), B.group(1, [t(2, 1), t(-3, 0)])] },
  { id: 'minus', expr: [t(9, 0), B.group(-1, [t(4, 1), t(-5, 0)])] },
  { id: 'both', expr: [t(3, 1), B.group(1, [t(1, 1), t(-2, 0)]), B.group(-1, [t(5, 0), t(-2, 1)])] },
]);

const pow = (x, p) => x ** p;
const clampX = (x) => (Number.isFinite(Number(x)) ? Math.max(X_MIN, Math.min(X_MAX, Math.round(Number(x)))) : X_DEFAULT);
const cloneExpr = (expr) => expr.map((it) => (B.isGroup(it) ? B.group(it.sign, it.terms.map((q) => ({ ...q }))) : { ...it }));
const termOf = (b) => ({ c: b.c, p: b.p });

/* ═════════════ Construction ═════════════ */

/** La table d'une expression : une pile par terme (`slot` = son rang dans l'écriture sans parenthèses), une caisse par groupe. */
function tableOf(expr) {
  const bundles = [];
  const crates = [];
  let slot = 0;
  expr.forEach((it, i) => {
    if (B.isGroup(it)) {
      crates.push({ item: i, sign: it.sign });
      it.terms.forEach((q, j) => { bundles.push({ id: `b${slot}`, slot, item: i, term: j, p: q.p, c0: q.c, c: q.c, place: 'crate', crate: i }); slot += 1; });
    } else {
      bundles.push({ id: `b${slot}`, slot, item: i, term: null, p: it.p, c0: it.c, c: it.c, place: 'row', crate: null });
      slot += 1;
    }
  });
  return { bundles, crates, nextSlot: slot };
}

/** Les tâches demandées (celles de la leçon, ou celles du monde / du niveau). */
export function tasksFor(world, tasks, level = 'beginner') {
  if (Array.isArray(tasks) && tasks.length) return tasks.map((tk, k) => ({ id: tk.id ?? `task-${k + 1}`, expr: cloneExpr(tk.expr ?? []) }));
  if (world === 'brackets') return BRACKET_TASKS.map((tk) => ({ id: tk.id, expr: cloneExpr(tk.expr) }));
  return COLLECT_TASKS[level === 'advanced' ? 'advanced' : 'beginner'].map((tk) => ({ id: tk.id, expr: cloneExpr(tk.expr) }));
}

/**
 * L'état initial. `scaffold` : lectures des صواني visibles et annulation immédiate (مبتدئ, et toujours dans `brackets`) ;
 * sans lui (متقدم), l'élève règle le coefficient de chaque صينية puis « تحقّق ».
 */
export function init({ world = 'collect', tasks, scaffold = true, level } = {}) {
  const w = world === 'brackets' ? 'brackets' : 'collect';
  const list = tasksFor(w, tasks, level ?? (scaffold ? 'beginner' : 'advanced'));
  const base = {
    world: w, scaffold: w === 'brackets' ? true : !!scaffold, tasks: list, ti: 0, done: list.map(() => false), x: X_DEFAULT,
    xMoved: false, sorts: 0, exits: 0, seenCancel: false, refusals: [], exited: [], solvedLog: [], last: null, events: [],
  };
  return load(base, 0);
}

function load(s, ti) {
  const expr = cloneExpr(s.tasks[ti]?.expr ?? []);
  return {
    ...s, ti, custom: false, expr, ...tableOf(expr), coefs: {}, coefTouched: {}, checked: {}, solvedNow: false,
    lastFree: null, freeCrate: {}, freeAdded: {}, last: null,
  };
}

/* ═════════════ Lectures ═════════════ */

export const taskOf = (s) => (s.custom ? 'custom' : s.tasks[s.ti]?.id ?? '');
export const bundle = (s, id) => s.bundles.find((b) => b.id === id) ?? null;
export const inCrate = (s) => s.bundles.filter((b) => b.place === 'crate').sort((a, b) => a.slot - b.slot);
export const loose = (s) => s.bundles.filter((b) => b.place === 'row').sort((a, b) => a.slot - b.slot);
export const inTray = (s, p) => s.bundles.filter((b) => b.place === 'tray' && b.p === p).sort((a, b) => a.order - b.order);
export const cratesFull = (s) => s.bundles.some((b) => b.place === 'crate');
const crateHasTerms = (s, item) => s.bundles.some((b) => b.place === 'crate' && b.crate === item);
export const crateOf = (s, item) => s.crates.find((k) => k.item === item) ?? null;
/** Le coefficient EXACT d'une صينية (somme des piles qu'on y a posées). */
export const trayCoef = (s, p) => inTray(s, p).reduce((a, b) => a + b.c, 0);
/** Les pièces d'une صينية : de bois (positives) et opposées, avant annulation. */
export const trayPieces = (s, p) => inTray(s, p).reduce((acc, b) => (b.c > 0 ? { ...acc, pos: acc.pos + b.c } : { ...acc, neg: acc.neg - b.c }), { pos: 0, neg: 0 });
/** Les pièces d'une forme présentes sur la table (en valeur absolue), pour la limite du panneau libre. */
export const pieceCount = (s, p) => s.bundles.filter((b) => b.p === p).reduce((a, b) => a + Math.abs(b.place === 'crate' ? b.c0 : b.c), 0);
export const allSorted = (s) => s.bundles.length > 0 && s.bundles.every((b) => b.place === 'tray');
export const showTrays = (s) => !cratesFull(s) || s.bundles.some((b) => b.place === 'tray');
export const showExits = (s) => cratesFull(s);

/** La contribution d'une pile à la valeur de la table, à x. */
const contribution = (s, b, x) => (b.place === 'crate' ? crateOf(s, b.crate).sign * b.c0 : b.c) * pow(x, b.p);
/** La valeur de l'expression ÉCRITE, à x. */
export const writtenValue = (s, x = s.x) => B.valueAt(s.expr, x);
/** La valeur de ce qui est SUR LA TABLE (piles libres + caisses + صواني), à x. Toujours égale à `writtenValue`. */
export const tableValue = (s, x = s.x) => s.bundles.reduce((a, b) => a + contribution(s, b, x), 0);

/** L'expression que la table porte, dans l'ordre d'écriture (pour comparer une sortie hypothétique). */
function tableExpr(s, override = null) {
  const items = [];
  const byItem = new Map();
  [...s.bundles].sort((a, b) => a.slot - b.slot).forEach((b) => {
    const o = override && override.id === b.id ? override : null;
    if (b.place === 'crate' && !o) {
      if (!byItem.has(b.crate)) { const g = B.group(crateOf(s, b.crate).sign, []); byItem.set(b.crate, g); items.push(g); }
      byItem.get(b.crate).terms.push({ c: b.c0, p: b.p });
    } else items.push(o ? { c: o.c, p: b.p } : termOf(b));
  });
  return items;
}

/* ═════════════ Gestes ═════════════ */

const push = (s, ev) => ({ ...s, events: [...s.events, ev] });
const solvedEvent = (s) => ({ kind: 'solved', world: s.world, task: taskOf(s), expr: B.expressionTex(s.expr), opened: B.openedTex(s.expr), result: B.simplifiedTex(s.expr) });

function markSolved(s) {
  let n = { ...s, solvedNow: true, last: { event: 'solved' } };
  n = push(n, solvedEvent(n));
  if (!n.custom) {
    const done = n.done.slice(); done[n.ti] = true;
    n = { ...n, done, solvedLog: [...n.solvedLog, { task: taskOf(n), expr: cloneExpr(n.expr) }] };
  }
  return n;
}

/** Peut-on poser la pile `id` dans la صينية `p` ? `true`, `'kind'` (autre forme : refus expliqué) ou `''` (geste sans effet). */
export function canSort(s, id, p) {
  const b = bundle(s, id);
  if (!b || b.place !== 'row' || s.solvedNow || cratesFull(s)) return '';
  if (!TRAYS.includes(p)) return '';
  return b.p === p ? true : 'kind';
}

/** La pile `id` rejoint la صينية `p` (déjà vérifié par `canSort`). مبتدئ : une pièce et son opposée s'annulent aussitôt. */
export function sort(s, id, p) {
  if (canSort(s, id, p) !== true) return s;
  const b = bundle(s, id);
  const before = trayCoef(s, p);
  const order = s.bundles.reduce((m, q) => Math.max(m, q.order ?? -1), -1) + 1;
  let n = { ...s, bundles: s.bundles.map((q) => (q.id === id ? { ...q, place: 'tray', order } : q)), sorts: s.sorts + 1, lastFree: null };
  const { [p]: _drop, ...checked } = n.checked;
  n = { ...n, checked };
  n = push(n, { kind: 'sort', world: n.world, task: taskOf(n), term: termOf(b), tray: p });
  let cancelled = 0;
  if (n.scaffold && before !== 0 && Math.sign(before) !== Math.sign(b.c)) {
    cancelled = Math.min(Math.abs(before), Math.abs(b.c));
    n = push({ ...n, seenCancel: true }, { kind: 'cancel', world: n.world, task: taskOf(n), tray: p });
  }
  n = { ...n, last: { event: 'sort', tray: p, term: termOf(b), cancelled, coef: trayCoef(n, p) } };
  if (n.scaffold && allSorted(n)) n = markSolved(n);
  return n;
}

/** Le refus d'une forme : la pile revient ; la bannière donne les valeurs d'UNE pièce de chaque forme, au x réglé ou à un témoin. */
export function refuseKind(s, id, p) {
  const b = bundle(s, id);
  if (!b || b.p === p) return s;
  const x = B.kindWitness({ c: 1, p: b.p }, { c: 1, p }, { prefer: s.x, range: [X_MIN, X_MAX] });
  const ev = { kind: 'refused', world: s.world, task: taskOf(s), reason: 'kind', term: termOf(b), tray: p, x, termValue: pow(x, b.p), trayValue: pow(x, p) };
  return push({ ...s, refusals: [...s.refusals, ev], last: { event: 'refused', reason: 'kind', ...ev } }, ev);
}

/** Peut-on faire sortir la pile `id` de sa caisse ? (la sortie choisie est jugée par `exitTo`, pas avant : rien ne la trahit au survol) */
export function canExit(s, id) {
  const b = bundle(s, id);
  return !!b && b.place === 'crate' && !s.solvedNow;
}

/**
 * La main pose la pile `id` (sortie de sa caisse) sur la sortie `flipped` (« بعكس إشارتها ») ou non (« كما هي »). Juste : la pile rejoint
 * la table avec le terme qui sort (`exitTerm`). Faux : REFUS `sign` — la valeur de l'expression écrite (`before`) et celle que la table
 * porterait (`after`) au x réglé, ou au premier témoin qui les sépare.
 */
export function exitTo(s, id, flipped) {
  if (!canExit(s, id)) return s;
  const b = bundle(s, id);
  const crate = crateOf(s, b.crate);
  const term = { c: b.c0, p: b.p };
  if (!B.isRightExit(crate.sign, flipped)) {
    const would = flipped ? -b.c0 : b.c0;
    const wouldExpr = tableExpr(s, { id, c: would });
    const x = B.witness(s.expr, wouldExpr, { prefer: s.x, range: [X_MIN, X_MAX] }) ?? s.x;
    const ev = { kind: 'refused', world: 'brackets', task: taskOf(s), reason: 'sign', crateSign: crate.sign, term, flipped: !!flipped, x, before: B.valueAt(s.expr, x), after: B.valueAt(wouldExpr, x) };
    return push({ ...s, refusals: [...s.refusals, { ...ev, rank: s.bundles.filter((q) => q.crate === b.crate && q.slot < b.slot).length }], last: { event: 'refused', reason: 'sign', id, ...ev, wouldTex: termTex({ c: would, p: b.p }) } }, ev);
  }
  const out = B.exitTerm(crate.sign, term);
  const rank = s.bundles.filter((q) => q.crate === b.crate && q.slot < b.slot).length;
  let n = { ...s, bundles: s.bundles.map((q) => (q.id === id ? { ...q, place: 'row', c: out.c } : q)), exits: s.exits + 1, lastFree: null };
  n = { ...n, exited: [...n.exited, { task: taskOf(n), crateSign: crate.sign, term, out, rank }] };
  n = push(n, { kind: 'exit', world: 'brackets', task: taskOf(n), crateSign: crate.sign, term, flipped: !!flipped });
  return { ...n, last: { event: 'exit', id, crateSign: crate.sign, term, out, flipped: !!flipped, emptied: !cratesFull(n) } };
}

/** La main règle x (la longueur d'une réglette) : toutes les pièces se redessinent, les deux valeurs suivent ensemble. */
export function setX(s, x) {
  const v = clampX(x);
  if (v === s.x) return s;
  return push({ ...s, x: v, xMoved: true }, { kind: 'x', x: v });
}

/* ── متقدم : le coefficient de chaque صينية, puis « تحقّق » ── */

/** La valeur par défaut d'un réglage de coefficient : jamais la réponse (MANIPULATION_CONTRACT §6bis « default parameters »). */
function defaultCoef(s, p) {
  const list = inTray(s, p);
  const answer = trayCoef(s, p);
  const sumAbs = list.reduce((a, b) => a + Math.abs(b.c), 0);
  const cands = [list[0]?.c ?? 1, sumAbs, answer + 1];
  return cands.find((v) => v !== answer);
}
export const coefOf = (s, p) => (s.coefs[p] ?? defaultCoef(s, p));
export function setCoef(s, p, v) {
  if (s.scaffold || s.solvedNow) return s;
  const val = Math.max(COEF_MIN, Math.min(COEF_MAX, Math.round(v)));
  const { [p]: _c, ...checked } = s.checked;
  return { ...s, coefs: { ...s.coefs, [p]: val }, coefTouched: { ...s.coefTouched, [p]: true }, checked };
}
export const usedTrays = (s) => TRAYS.filter((p) => inTray(s, p).length > 0);
export const canCheck = (s) => !s.scaffold && !s.solvedNow && allSorted(s);

/**
 * « تحقّق » : chaque صينية non vide est jugée (un événement `check` par صينية). Une صينية fausse est refusée avec sa valeur à x et celle de
 * ce que l'élève a écrit ; toutes justes : les paires s'annulent (événements `cancel`), la forme réduite s'écrit.
 */
export function check(s) {
  if (!canCheck(s)) return s;
  let n = s;
  const results = usedTrays(s).map((p) => ({ p, ok: coefOf(s, p) === trayCoef(s, p) }));
  for (const r of results) n = push(n, { kind: 'check', world: 'collect', task: taskOf(n), tray: r.p, ok: r.ok });
  const checked = Object.fromEntries(results.map((r) => [r.p, r.ok]));
  n = { ...n, checked };
  const wrong = results.find((r) => !r.ok);
  if (wrong) {
    const p = wrong.p;
    const typed = coefOf(s, p);
    const x = p === 0 ? s.x : s.x; // x ≥ 1 : deux coefficients différents donnent deux valeurs différentes
    return {
      ...n,
      last: { event: 'check', ok: false, tray: p, x, trayTex: B.expressionTex(inTray(s, p).map(termOf)), trayValue: trayCoef(s, p) * pow(x, p), typedTex: termTex({ c: typed, p }), typedValue: typed * pow(x, p) },
    };
  }
  for (const r of results) {
    const { pos, neg } = trayPieces(s, r.p);
    if (pos > 0 && neg > 0) n = push({ ...n, seenCancel: true }, { kind: 'cancel', world: n.world, task: taskOf(n), tray: r.p });
  }
  return markSolved({ ...n, last: { event: 'check', ok: true } });
}

/* ── Les tâches ── */

export const allDone = (s) => s.done.every(Boolean);
const nextUnsolved = (s) => {
  for (let k = 1; k <= s.tasks.length; k += 1) { const i = (s.ti + k) % s.tasks.length; if (!s.done[i]) return i; }
  return -1;
};
/** « التالي » : la tâche suivante non résolue (ou le retour à la tâche après le panneau libre). */
/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de son état initial, non résolue (même si c'était la dernière). */
export const retryTask = (s) => (s.custom ? s : { ...load(s, s.ti), done: s.done.map((d, i) => (i === s.ti ? false : d)) });
export const canNext = (s) => (s.custom ? s.done.some((d) => !d) : s.solvedNow && nextUnsolved(s) >= 0);
export function nextTask(s) {
  if (!canNext(s)) return s;
  const i = s.custom && !s.done[s.ti] ? s.ti : nextUnsolved(s);
  return load(s, i);
}

/* ── « جرّب أعدادك » : l'élève construit SA table ── */

const toCustom = (s) => (s.custom ? s : { ...s, custom: true, lastFree: null, freeCrate: {} });
const freeEvent = (s) => push(s, { kind: 'custom', world: s.world });

/** Le panneau libre peut-il ajouter une pièce de cette forme (≤ 12 pièces ajoutées par forme, depuis le début ou depuis « امسح ») ? */
export const canAdd = (s, p) => (s.freeAdded?.[p] ?? 0) < MAX_PIECES;

/**
 * Ajoute UNE pièce de forme `p` et de signe `sign` (±1) : à la pile qu'on vient de commencer avec le même bouton, sinon dans une
 * nouvelle pile. `target` : 'row' (un terme libre) ou 'plus' / 'minus' (dans une caisse de ce signe, créée au besoin, ≤ 3 termes).
 * L'expression écrite grandit avec la table : l'invariant de valeur tient toujours.
 */
export function addPiece(s, p, sign, target = 'row') {
  if (!TRAYS.includes(p) || !canAdd(s, p)) return s;
  const sg = sign < 0 ? -1 : 1;
  const tg = s.world === 'brackets' && (target === 'plus' || target === 'minus') ? target : 'row';
  let n = { ...toCustom(s), solvedNow: false, checked: {}, freeAdded: { ...s.freeAdded, [p]: (s.freeAdded?.[p] ?? 0) + 1 } };
  const lf = n.lastFree;
  const grow = lf && lf.target === tg && lf.p === p && lf.sign === sg ? bundle(n, lf.id) : null;
  if (grow && grow.place === (tg === 'row' ? 'row' : 'crate')) {
    const c = grow.c0 + sg;
    const expr = cloneExpr(n.expr);
    if (grow.term == null) expr[grow.item] = { c, p };
    else expr[grow.item].terms[grow.term] = { c, p };
    n = { ...n, expr, bundles: n.bundles.map((q) => (q.id === grow.id ? { ...q, c0: c, c: q.place === 'crate' ? c : c } : q)) };
    return freeEvent({ ...n, last: { event: 'custom' } });
  }
  const expr = cloneExpr(n.expr);
  const slot = n.nextSlot;
  const id = `b${slot}`;
  let nb;
  let crates = n.crates;
  let freeCrate = n.freeCrate;
  if (tg === 'row') {
    expr.push({ c: sg, p });
    nb = { id, slot, item: expr.length - 1, term: null, p, c0: sg, c: sg, place: 'row', crate: null };
  } else {
    const gs = tg === 'minus' ? -1 : 1;
    const open = freeCrate[tg];
    const usable = open != null && crateHasTerms(n, open) && !n.bundles.some((q) => q.item === open && q.place !== 'crate') && expr[open].terms.length < MAX_CRATE_TERMS;
    if (usable) {
      expr[open].terms.push({ c: sg, p });
      nb = { id, slot, item: open, term: expr[open].terms.length - 1, p, c0: sg, c: sg, place: 'crate', crate: open };
    } else {
      expr.push(B.group(gs, [{ c: sg, p }]));
      const item = expr.length - 1;
      crates = [...crates, { item, sign: gs }];
      freeCrate = { ...freeCrate, [tg]: item };
      nb = { id, slot, item, term: 0, p, c0: sg, c: sg, place: 'crate', crate: item };
    }
  }
  n = { ...n, expr, crates, freeCrate, bundles: [...n.bundles, nb], nextSlot: slot + 1, lastFree: { id, target: tg, p, sign: sg } };
  return freeEvent({ ...n, last: { event: 'custom' } });
}

/** « امسح » : une table vide (et une expression vide) pour construire la sienne. */
export function clearTable(s) {
  const n = { ...toCustom(s), expr: [], bundles: [], crates: [], nextSlot: 0, freeAdded: {}, coefs: {}, coefTouched: {}, checked: {}, solvedNow: false, lastFree: null, freeCrate: {} };
  return freeEvent({ ...n, last: { event: 'custom' } });
}

/* ═════════════ Découverte ═════════════ */

/** collect : les tâches résolues (et, en مبتدئ, une annulation vue) ; brackets : les tâches résolues. */
export function discoveryReady(s) {
  if (!allDone(s)) return false;
  return s.world === 'brackets' || !s.scaffold || s.seenCancel;
}

/** Le témoin de « دائمًا: 3x + 2 تصير 5x » : la valeur de 3x + 2 et de 5x au x de l'élève (ou au premier x qui les sépare). */
export function mergeAllWitness(s) {
  const a = [t(3, 1), t(2, 0)];
  const b = [t(5, 1)];
  const x = B.witness(a, b, { prefer: s.x, range: [X_MIN, X_MAX] });
  return { x, a: B.valueAt(a, x), b: B.valueAt(b, x) };
}
/** Le témoin de « عندما يكون لهما العدد نفسه: 2x و 2x² » : un refus `kind` de l'élève s'il existe, sinon 2x et 2x² à son x. */
export function sameNumberWitness(s) {
  const own = s.refusals.find((r) => r.reason === 'kind');
  const x = B.witness([t(2, 1)], [t(2, 2)], { prefer: own?.x ?? s.x, range: [X_MIN, X_MAX] });
  return { x, a: 2 * x, b: 2 * x * x, own: own ? { term: own.term, tray: own.tray, x: own.x, termValue: own.termValue, trayValue: own.trayValue } : null };
}

/**
 * Les deux lectures FAUSSES de « −( … ) », sur la caisse − de l'élève (la première tâche résolue qui en a une, ≥ 2 termes de préférence) :
 * `first` (seul le premier signe change) et `none` (aucun ne change) ; l'expression qu'elles écriraient et le témoin qui la réfute.
 * `own` : un refus `sign` de l'élève sur le 2e terme (ou suivant) d'une caisse −, gardé tel quel — sa propre réfutation de `first`.
 */
export function minusVariants(s) {
  const log = s.solvedLog.filter((e) => e.expr.some((it) => B.isGroup(it) && it.sign < 0));
  const pick = log.find((e) => e.expr.some((it) => B.isGroup(it) && it.sign < 0 && it.terms.length >= 2)) ?? log[0];
  const expr = pick?.expr ?? BRACKET_TASKS[1].expr;
  const variant = (mode) => expr.flatMap((it) => {
    if (!B.isGroup(it)) return [{ ...it }];
    if (it.sign > 0) return it.terms.map((q) => ({ ...q }));
    return it.terms.map((q, j) => (mode === 'first' && j === 0 ? B.opposite(q) : { ...q }));
  });
  const out = {};
  for (const mode of ['first', 'none']) {
    const v = variant(mode);
    const x = B.witness(expr, v, { prefer: s.x, range: [X_MIN, X_MAX] }) ?? s.x;
    out[mode] = { exprTex: B.expressionTex(expr), wrongTex: B.expressionTex(v), x, right: B.valueAt(expr, x), wrong: B.valueAt(v, x) };
  }
  const own = s.refusals.find((r) => r.reason === 'sign' && r.crateSign < 0 && !r.flipped && r.rank >= 1);
  out.own = own ? { termTex: termTex(own.term), x: own.x, before: own.before, after: own.after } : null;
  return out;
}

/** Les lignes de la règle, avec les propres tâches de l'élève. */
export function formalLines(s) {
  const log = s.solvedLog;
  const lines = log.map((e) => ({ task: e.task, expr: B.expressionTex(e.expr), opened: B.openedTex(e.expr), result: B.simplifiedTex(e.expr), hasGroup: e.expr.some(B.isGroup), plus: e.expr.some((it) => B.isGroup(it) && it.sign > 0), minus: e.expr.some((it) => B.isGroup(it) && it.sign < 0) }));
  // « on ajoute les coefficients » : la forme la plus nombreuse de la première tâche
  const first = log[0]?.expr ? B.removeBrackets(log[0].expr) : [];
  const byP = TRAYS.map((p) => first.filter((q) => q.p === p)).sort((a, b) => b.length - a.length)[0] ?? [];
  const sum = byP.length ? { lhs: B.expressionTex(byP), rhs: termTex({ c: byP.reduce((a, q) => a + q.c, 0), p: byP[0].p }) } : null;
  // « un terme et son opposé » : la première forme où des signes contraires se rencontrent
  let cancel = null;
  for (const e of log) {
    const terms = B.removeBrackets(e.expr);
    for (const p of TRAYS) {
      const pos = terms.filter((q) => q.p === p && q.c > 0).reduce((a, q) => a + q.c, 0);
      const neg = -terms.filter((q) => q.p === p && q.c < 0).reduce((a, q) => a + q.c, 0);
      if (pos > 0 && neg > 0) { const k = Math.min(pos, neg); cancel = { tex: `${termTex({ c: k, p })} ${termTex({ c: -k, p }, { lead: false })} = 0` }; break; }
    }
    if (cancel) break;
  }
  const own = log[0]?.expr;
  const value = own ? { x: s.x, expr: B.expressionTex(own), result: B.simplifiedTex(own), v: B.valueAt(own, s.x) } : null;
  return { lines, sum, cancel, value };
}

/* ═════════════ Onboarding (LabCoach) ═════════════ */

/**
 * Le PROCHAIN geste utile, en données pures `{ id, target, gesture }` (MANIPULATION_CONTRACT §8quater) — le geste, jamais la règle :
 * il montre la pile à porter, jamais la صينية ni la sortie qui l'accepterait ; en متقدم il montre le réglage, jamais sa valeur.
 *   brackets : exit · exitMore (une pile d'une caisse)  ·  collect : sort · x · sortMore  ·  متقدم : coef · check  ·  next
 */
export function coachOf(s) {
  if (allDone(s) && !s.custom) return null;
  if (s.solvedNow) return canNext(s) ? { id: 'next', target: '[data-lt-next]', gesture: 'tap' } : null;
  const crate = inCrate(s)[0];
  if (crate) return { id: s.exits === 0 ? 'exit' : 'exitMore', target: `[data-lt-bundle="${crate.id}"]`, gesture: 'drag' };
  const b = loose(s)[0];
  if (b) {
    if (s.sorts > 0 && !s.xMoved && s.scaffold && s.world === 'collect') return { id: 'x', target: '[data-lt-xbox]', gesture: 'tap' };
    return { id: s.sorts === 0 ? 'sort' : 'sortMore', target: `[data-lt-bundle="${b.id}"]`, gesture: 'drag' };
  }
  if (!s.scaffold && allSorted(s)) {
    const p = usedTrays(s).find((q) => !s.coefTouched[q]);
    if (p != null) return { id: 'coef', target: `[data-lt-coef="${p}"]`, gesture: 'tap' };
    return { id: 'check', target: '[data-lt-check]', gesture: 'tap' };
  }
  return null;
}
