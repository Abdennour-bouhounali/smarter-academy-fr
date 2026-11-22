/**
 * merge-board — LA LOGIQUE PURE de « لوحة الدمج » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « العمليات على الأعداد الناطقة », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/fractions3.js` (`parseChain`, `links`, `linkStatus`, `stepOf`, `mergeLink`, `flipTile`, `flipStatus`, `nextLink`, `chainScale`),
 * importé PAR CHEMIN, jamais par le barrel du cœur. Aucun flottant pour un VERDICT.
 *
 * LE MODÈLE. Une chaîne de calcul sur des nombres ناطقة est une rangée de TUILES (chacune montre sa fraction et une BARRE signée : sa longueur ∝ la distance au zéro, bleue vers la droite
 * pour +, rouge vers la gauche pour −) séparées par des jetons d'opération. Deux tuiles VOISINES se FUSIONNENT en une seule ; la MAIN tient trois variables :
 *   (1) le SIGNE PRÉDIT du résultat (trois pavés + / − / 0) — requis AVANT chaque fusion : une prédiction fausse est REFUSÉE et les barres montrent pourquoi ;
 *   (2) la tuile à RETOURNER pour une division (le diviseur seul, son signe gardé) ;
 *   (3) l'ORDRE des fusions : les × ÷ sont tenus par un AIMANT (priorité), le contenu d'une BULLE (parenthèses) passe en premier, les + − se font de gauche à droite.
 *
 * Une TÂCHE : `{ id, chain: '-5/4 + 11/6', hidden?, signOnly? }` (syntaxe de `parseChain`). `hidden` (متقدم) : les barres ne se montrent qu'après la fusion, et reviennent après TROIS
 * prédictions fausses ; `signOnly` (monde `signs`, معارف) : seul le signe est demandé (pas de retournement), la série se mesure par une SÉRIE de prédictions justes consécutives.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`) :
 *   { kind: 'merge', task, taskId, chain, op, left, right, result, predicted, ok: true, free }
 *   { kind: 'refused', task, taskId, chain, reason: 'sign' | 'magnet' | 'bubble' | 'order' | 'noflip' | 'dividend' | 'zero', predicted?, op?, free }
 *   { kind: 'flip', task, taskId, chain, tile, ok, free }
 *   { kind: 'custom', free: true }                         // « جرّب أعدادك » (jamais compté)
 *   { kind: 'solved', task, taskId, chain, result }
 */
import { ratText } from '@smarter-academy/core/arithmetic/powers.js';
import {
  parseChain, links, linkStatus, stepOf, mergeLink, flipTile, flipStatus, findTile, tileValue, tileCount, nextLink, chainScale, tileTex,
} from '@smarter-academy/core/arithmetic/fractions3.js';

const STRIKES = 3;
const FREE_MAX_TILES = 4;
const FREE_MAX_ABS = 20;
export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'c1', chain: '-5/4 + 11/6' },
    { id: 'c2', chain: '7/13 × -8/5' },
    { id: 'c3', chain: '-9/8 ÷ -3/4' },
    { id: 'c4', chain: '7/3 - 8/15 ÷ 11/20' },
  ] },
  advanced: { tasks: [
    { id: 'a1', chain: '(2/3 - 5/2) × -6/11', hidden: true },
    { id: 'a2', chain: '-3/4 + 5/6 × -9/10', hidden: true },
    { id: 'a3', chain: '(1/2 - 4/3)@(5/6 + -3/4)', hidden: true },
    { id: 'a4', chain: '4/5 - 3/5 ÷ -9/10 + -2', hidden: true },
  ] },
  signs: { world: 'signs', tasks: [
    { id: 's1', chain: '-2/3 + 1/4', signOnly: true },
    { id: 's2', chain: '3/5 × -10/9', signOnly: true },
    { id: 's3', chain: '-4/7 ÷ -2/21', signOnly: true },
    { id: 's4', chain: '-1/2 - 1/3', signOnly: true },
    { id: 's5', chain: '5/6 - 7/8', signOnly: true },
    { id: 's6', chain: '-6 × -5/12', signOnly: true },
  ] },
});

const latin = (text) => String(text ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/٫|،/g, ',').replace(/−|–/g, '-');
export { latin };

function buildTask(raw, i = 0) {
  const text = latin(raw.chain);
  const root = parseChain(text);
  return Object.freeze({ id: raw.id ?? `t${i}`, chain: text, root, hidden: !!raw.hidden, signOnly: !!raw.signOnly, scale: chainScale(text), free: !!raw.free });
}

const BLANK = { root: null, sel: [], history: [], strikes: 0, barsBack: false, last: null, flash: 0, dirty: false };
const fresh = (task) => {
  const only = task.signOnly ? links(task.root)[0] : null;
  return { ...BLANK, root: task.root, history: [], sel: only?.ready ? [only.left.id, only.right.id] : [] };
};

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = raws.map(buildTask);
  return { world: numbers.world ?? 'board', tasks, ti: 0, done: {}, streak: 0, clean: 0, free: null, trials: [], seenMagnet: false, ...fresh(tasks[0]) };
}

export const isFree = (s) => !!s.free;
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s, i = s.ti) => !s.free && !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const isSigns = (s) => s.world === 'signs';
export const tilesLeft = (s) => tileCount(s.root);
export const finished = (s) => tilesLeft(s) === 1;
/** Les barres sont-elles visibles ? (متقدم : cachées jusqu'à la fusion, puis après trois prédictions fausses.) */
export const barsShown = (s) => { const t = taskOf(s); return !t.hidden || s.barsBack || s.strikes >= STRIKES; };

/** Les tuiles dans l'ordre de lecture (bulles et barres comprises). */
export function tilesOf(root) {
  const out = [];
  const walk = (n) => {
    if (n.t === 'n') out.push(n);
    else if (n.t === 'g') n.items.forEach((x, i) => { if (i % 2 === 0) walk(x); });
    else { walk(n.top); walk(n.bottom); }
  };
  walk(root);
  return out;
}
const linkOf = (s, a, b) => links(s.root).find((l) => l.left && l.right && ((l.left.id === a && l.right.id === b) || (l.left.id === b && l.right.id === a)));
const linkById = (s, id) => links(s.root).find((l) => l.id === id);
/** Le maillon choisi (deux tuiles voisines), ou null. */
export function selectedLink(s) {
  if (s.sel.length !== 2) return null;
  return linkOf(s, s.sel[0], s.sel[1]) ?? null;
}
/** Le statut du maillon choisi ; en monde `signs` le retournement n'est pas demandé. */
export function statusOf(s, link = selectedLink(s)) {
  if (!link) return null;
  if (s.world === 'signs' && link.op === '÷') return linkStatus(s.root, { ...link, right: { ...link.right, flip: true } });
  return linkStatus(s.root, link);
}

const note = (s, e) => ({ ...s, trials: [...s.trials, { task: s.ti, taskId: taskOf(s).id, chain: taskOf(s).chain, free: !!s.free, ...e }] });
const refuse = (s, reason, extra = {}) => note({ ...s, last: { kind: 'refused', reason, ...extra }, flash: s.flash + 1, ...(reason === 'magnet' ? { seenMagnet: true } : {}) }, { kind: 'refused', reason, ...extra.event });

/** Toucher une tuile : la 1re est choisie, la 2e (voisine) forme la paire. Une paire séparée par une bulle, un aimant ou l'ordre est REFUSÉE tout de suite. */
export function tapTile(s, id) {
  if (finished(s) || taskDone(s)) return s;
  if (s.sel.length === 0 || s.sel.length === 2 || s.sel[0] === id) return { ...s, sel: s.sel.length === 1 && s.sel[0] === id ? [] : [id], last: null };
  const [a] = s.sel;
  const order = tilesOf(s.root).map((t) => t.id);
  if (Math.abs(order.indexOf(a) - order.indexOf(id)) !== 1) return { ...s, sel: [id], last: null };
  const l = linkOf(s, a, id);
  if (!l) return refuse({ ...s, sel: [] }, 'bubble', { event: { op: null } });
  return pairSelected(s, l);
}
export function tapChip(s, linkId) {
  if (finished(s) || taskDone(s)) return s;
  const l = linkById(s, linkId);
  if (!l) return s;
  if (!l.ready) return refuse({ ...s, sel: [] }, 'bubble', { event: { op: l.op } });
  return pairSelected(s, l);
}
function pairSelected(s, l) {
  const st = statusOf(s, l);
  if (!st.ok && st.reason !== 'noflip') return refuse({ ...s, sel: [] }, st.reason, { op: l.op, pair: [l.left.id, l.right.id], event: { op: l.op } });
  return { ...s, sel: [l.left.id, l.right.id], last: null };
}

/** Retourner une tuile (le diviseur d'un ÷). Refusé : le dividende, une tuile hors division, 0. */
export function flip(s, id) {
  if (finished(s) || taskDone(s)) return s;
  const cur = findTile(s.root, id);
  if (cur?.flip) return note({ ...s, root: flipTile(s.root, id), last: { kind: 'flipped', tile: id, back: true } }, { kind: 'flip', tile: id, ok: true, back: true });
  const st = flipStatus(s.root, id);
  if (!st.ok) return note({ ...s, last: { kind: 'refused', reason: st.reason, tile: id }, flash: s.flash + 1 }, { kind: 'flip', tile: id, ok: false, reason: st.reason });
  return note({ ...s, root: flipTile(s.root, id), last: { kind: 'flipped', tile: id, back: false } }, { kind: 'flip', tile: id, ok: true });
}

/** La PRÉDICTION du signe (1, −1 ou 0) pour la paire choisie : juste → la fusion a lieu ; fausse → REFUSÉE, les barres montrent pourquoi. */
export function predict(s, sg) {
  if (finished(s) || taskDone(s)) return s;
  const l = selectedLink(s);
  if (!l) return s;
  const st = statusOf(s, l);
  if (!st.ok) return refuse(s, st.reason, { op: l.op, event: { op: l.op, predicted: sg } });
  const link = s.world === 'signs' && l.op === '÷' ? { ...l, right: { ...l.right, flip: true } } : l;
  const step = stepOf(link);
  if (step.sign !== sg) {
    const wrongSign = { ...refuse({ ...s, strikes: s.strikes + 1, streak: 0, dirty: true }, 'sign', { op: l.op, predicted: sg, step, event: { op: l.op, predicted: sg, expected: step.sign } }) };
    return isSigns(s) ? { ...wrongSign, ti: 0, ...restartSigns(wrongSign) } : wrongSign;
  }
  const { root, step: done } = mergeLink(s.root, link);
  const clean = s.dirty ? s.clean : s.clean + 1;
  const before = new Set(tilesOf(s.root).map((t) => t.id));
  const mergedId = tilesOf(root).find((t) => !before.has(t.id))?.id ?? null;
  let n = note({ ...s, root, sel: [], clean, dirty: false, last: { kind: 'merge', step: done, predicted: sg, mergedId }, history: [...s.history, { ...done, predicted: sg }], flash: s.flash + 1 },
    { kind: 'merge', op: link.op, left: ratText(done.a), right: ratText(done.b), result: ratText(done.result), predicted: sg, ok: true });
  if (tileCount(root) === 1) {
    n = note({ ...n, done: { ...n.done, [n.ti]: true }, streak: n.streak + 1 }, { kind: 'solved', result: ratText(tileValue(tilesOf(root)[0])) });
  }
  return n;
}
function restartSigns(s) { return { ...fresh(s.tasks[0]), done: {}, trials: s.trials, last: s.last, flash: s.flash, strikes: s.strikes, clean: 0, streak: 0 }; }

export const canRetry = (s) => !s.free && !taskDone(s) && s.history.length > 0;
export function retry(s) { return canRetry(s) ? { ...s, ...fresh(taskOf(s)) } : s; }
export const restartTask = (s) => (s.free ? { ...s, ...fresh(s.free) } : { ...s, ...fresh(s.tasks[s.ti]), done: { ...s.done, [s.ti]: false } });
export function nextTask(s) { return canNext(s) ? { ...s, ti: s.ti + 1, ...fresh(s.tasks[s.ti + 1]) } : s; }

/** La découverte (متقدم n'en a pas) : après c1–c3, sans mode libre. */
export const discoveryReady = (s) => !s.free && s.world === 'board' && s.tasks.length >= 3 && s.tasks.slice(0, 3).every((t, i) => !t.hidden && !!s.done[i]);

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** Valide une chaîne libre : `{ ok, text }` ou `{ ok: false, why }` — 'empty' | 'syntax' | 'tiles' | 'big' | 'bar'. */
export function validateFree(textRaw) {
  const text = latin(textRaw).trim();
  if (!text) return { ok: false, why: 'empty' };
  if (text.includes('@')) return { ok: false, why: 'syntax' };
  let root;
  try { root = parseChain(text); } catch { return { ok: false, why: 'syntax' }; }
  const tiles = tilesOf(root);
  if (tiles.length < 2 || tiles.length > FREE_MAX_TILES) return { ok: false, why: 'tiles' };
  for (const t of tiles) {
    const [a, b = '1'] = t.w.replace('-', '').split('/');
    if (Number(a.replace(',', '.')) > FREE_MAX_ABS || Number(b) > FREE_MAX_ABS) return { ok: false, why: 'big' };
  }
  if ((text.match(/\(/g) ?? []).length > 1) return { ok: false, why: 'syntax' };
  return { ok: true, text };
}
export function setFree(s, textRaw) {
  const v = validateFree(textRaw);
  if (!v.ok) return s;
  let free;
  try { free = buildTask({ id: 'free', chain: v.text, free: true }); } catch { return s; }
  return note({ ...s, free, ...fresh(free) }, { kind: 'custom', free: true });
}
export const toGuided = (s) => (s.free ? { ...s, free: null, ...fresh(s.tasks[s.ti]) } : s);

/* ── Lectures pour la scène ──────────────────────────────────────────────────────────────────── */

/** La barre signée d'une tuile : `{ sign, frac }` avec frac ∈ [0, 1] (|valeur| / échelle de la chaîne). */
export function barOf(s, node) {
  const v = tileValue(node);
  const sg = v.n < 0n ? -1 : v.n > 0n ? 1 : 0;
  const x = Number(v.n < 0n ? -v.n : v.n) / Number(v.d);
  return { sign: sg, frac: Math.min(1, x / taskOf(s).scale) };
}
/** La paire sous le doigt, pour la mini-droite des barres : `{ op, a, b, sa, sb, ... }` (distances exactes en fraction de l'échelle). */
export function pairBars(s) {
  const l = selectedLink(s);
  if (!l) return null;
  const a = barOf(s, l.left); const b = barOf(s, l.right);
  return { op: l.op, a, b, link: l };
}
/** Aide à la correction d'un signe refusé : les deux distances au dénominateur commun et laquelle est la plus grande (+ −), ou le nombre de signes négatifs (× ÷). */
export function whyOf(step) {
  if (step.op === '+' || step.op === '-') {
    const x = step.a; const y = step.op === '+' ? step.b : { n: -step.b.n, d: step.b.d };
    const dx = x.n * y.d < 0n ? -x.n * y.d : x.n * y.d; const dy = y.n * x.d < 0n ? -y.n * x.d : y.n * x.d;
    const same = (x.n < 0n) === (y.n < 0n) || x.n === 0n || y.n === 0n;
    return { type: 'sum', same, den: step.den, bigger: dx === dy ? 'tie' : dx > dy ? 'a' : 'b', a: x, b: y };
  }
  const neg = (step.a.n < 0n ? 1 : 0) + (step.b.n < 0n ? 1 : 0);
  return { type: 'prod', negatives: neg };
}

/* ── Onboarding ──────────────────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais le nombre : `pair` (choisir deux tuiles voisines), `flip` (÷ : retourner le diviseur), `sign` (toucher le pavé du signe), `magnet` (après un refus d'aimant),
 * `bubble` (après un refus de bulle), `free` quand TOUT est fait. `null` en libre ET dans la découverte.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) || isSigns(s) ? null : { id: 'free', target: '[data-mb-free]', gesture: 'type' };
  if (s.last?.kind === 'refused' && s.last.reason === 'magnet') return { id: 'magnet', target: '[data-mb-tile]', gesture: 'tap' };
  if (s.last?.kind === 'refused' && s.last.reason === 'bubble') return { id: 'bubble', target: '[data-mb-bubble]', gesture: 'tap' };
  const l = selectedLink(s);
  if (!l) return { id: 'pair', target: '[data-mb-tile]', gesture: 'tap', prefer: 'above' };
  if (l.op === '÷' && !l.right.flip && !isSigns(s)) return { id: 'flip', target: '[data-mb-flip]', gesture: 'tap' };
  return { id: 'sign', target: '[data-mb-pads]', gesture: 'tap', prefer: 'above' };
}

/** Le maillon canonique suivant (pour les tests et l'aide) : `{ id, op }` ou null. */
export function canonicalNext(s) { const l = nextLink(s.root); return l ? { id: l.id, op: l.op, left: l.left?.id, right: l.right?.id } : null; }

/* ── L'écriture d'une chaîne (LaTeX), pour l'énoncé ─────────────────────────────────────────── */
const OPTEX = { '+': '+', '-': '-', '×': '\\times', '÷': '\\div' };
export function chainTex(node, inner = false) {
  if (node.t === 'n') { const tx = tileTex(node); return inner && tx.startsWith('-') ? `\\left(${tx}\\right)` : tx; }
  if (node.t === 'b') return `\\dfrac{${chainTex(node.top)}}{${chainTex(node.bottom)}}`;
  const body = node.items.map((x, i) => (i % 2 ? OPTEX[x] : chainTex(x, i > 0))).join(' ');
  return node.paren ? `\\left(${body}\\right)` : body;
}
