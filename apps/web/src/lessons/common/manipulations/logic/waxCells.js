/**
 * wax-cells — LA LOGIQUE PURE de « خلايا الشمع » (2AM, unité 4 « مفهوم معادلة », درس « إنتاج عبارة حرفية واستعمالها », 2026-10-29).
 *
 * LE MODÈLE. Un rang de n cellules hexagonales faites de tiges de cire ; deux cellules voisines PARTAGENT une tige. `rodsOf` est un
 * DÉCOMPTE d'ARÊTES de la géométrie dessinée (jamais la formule) : sur le treillis entier, une cellule a son centre (cx, cy), ses sommets à
 * (cx, cy ∓ 2) et (cx ± 1, cy ∓ 1) ; deux cellules voisines d'un rang sont à 2 en x ; la cellule de la ligne suivante est à (+1, +3). Une
 * arête est une paire de sommets : les arêtes distinctes sont les tiges. Un rang compte 5n + 1 tiges, une bande de deux rangs décalés 8n + 3.
 * Les maths de la règle (`valueTable`, `firstMismatch`) viennent de `packages/core/arithmetic/equation2.js` (E1, importé PAR CHEMIN).
 *
 * TÂCHE : { id, kind: 'build' | 'rule' | 'far' | 'compare' | 'two', targets: [n…], strip?, predict?, m? , far? }. Une tâche a des
 * PHASES : 'build' (visiter chaque n de `targets`) → 'rule' (écrire la règle, jugée sur le dessin) → 'far' (la valeur lointaine) → 'done'.
 *
 * ÉVÉNEMENTS (`state.trials`) : { kind:'build', task, n, m, rods, free } · { kind:'rule', task, text, ok, model, free } ·
 * { kind:'predict', task, n, value, ok, free } · { kind:'far', task, value, ok, free } · { kind:'solved', task, free } · { kind:'custom', free:true, n, m }.
 */
import { valueTable, firstMismatch, sameCount } from '@smarter-academy/core/arithmetic/equation2.js';

export const FRAME_MAX = 8;            // le cadre ne tient que 8 cellules par rang
export const STRIP_MAX = 6;
export const TRAY_RODS = 50;
export const FAR_N = 40;

/* ── La géométrie : un décompte d'arêtes ─────────────────────────────────────────────────────── */

const vkey = (x, y) => `${x},${y}`;
const hexVertices = (cx, cy) => [[cx, cy - 2], [cx + 1, cy - 1], [cx + 1, cy + 1], [cx, cy + 2], [cx - 1, cy + 1], [cx - 1, cy - 1]];
/** Les arêtes d'une cellule centrée en (cx, cy) : paires de sommets triées (la clé identifie la tige). */
function hexEdges(cx, cy) {
  const v = hexVertices(cx, cy).map(([x, y]) => vkey(x, y));
  return v.map((a, i) => [a, v[(i + 1) % 6]].sort().join('|'));
}
/** Les centres d'un rang de n cellules (rang r : décalé de (+1, +3) par rang). */
const rowCenters = (n, r = 0) => Array.from({ length: n }, (_, i) => [2 * i + r, 3 * r]);

/** Le décompte des tiges d'une liste de centres : { count, edges: Map(clé → nombre de cellules qui la portent), shared: clés portées par 2 cellules }. */
export function rodsOf(centers) {
  const edges = new Map();
  for (const [cx, cy] of centers) for (const e of hexEdges(cx, cy)) edges.set(e, (edges.get(e) ?? 0) + 1);
  return { count: edges.size, edges, shared: [...edges].filter(([, c]) => c > 1).map(([e]) => e) };
}
/** Les centres d'un rang de n cellules, ou d'une bande de deux rangs de n. */
export const centersFor = (n, strip = false) => (strip ? [...rowCenters(n, 0), ...rowCenters(n, 1)] : rowCenters(n, 0));
export const rodsOfRow = (n, strip = false) => (n < 1 ? 0 : rodsOf(centersFor(n, strip)).count);
/** Tiges d'un rang de n cellules + d'une bande de m colonnes (deux rangs de m) — deux lettres (a3). */
export const rodsOfBoth = (n, m) => rodsOfRow(n, false) + rodsOfRow(m, true);

/* ── Tâches ──────────────────────────────────────────────────────────────────────────────────── */

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'w1', kind: 'build', targets: [1, 2, 3] },
    { id: 'w2', kind: 'rule', targets: [1, 2, 3, 4] },
    { id: 'w3', kind: 'far', targets: [1, 2, 3, 4], far: 40 },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'rule', strip: true, predict: true, targets: [1, 2, 3] },
    { id: 'a2', kind: 'compare', targets: [1, 2, 3, 4], predict: true },
    { id: 'a3', kind: 'two', predict: true, targets: [], pair: [6, 4] },
  ] },
});

export function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'build';
  const strip = !!raw.strip;
  const max = strip ? STRIP_MAX : FRAME_MAX;
  const targets = raw.targets ?? [];
  if (targets.some((n) => n < 1 || n > max)) throw new Error(`waxCells: n hors 1…${max}`);
  if (kind === 'two' && !raw.pair) throw new Error('waxCells: pair requis pour kind two');
  return Object.freeze({
    id: raw.id ?? `t${i}`, kind, strip, predict: !!raw.predict, targets: Object.freeze([...targets]), far: raw.far ?? null,
    pair: raw.pair ?? null, max,
    // la bonne règle, vue comme une ÉCRITURE (jamais comparée comme texte : les écritures égales sont acceptées)
    law: kind === 'two' ? '5n+1+8m+3' : strip ? '8n+3' : '5n+1',
  });
}
const initW = (task) => ({ n: 0, m: 0, visited: [], phase: task.targets.length || task.kind === 'two' ? (task.kind === 'two' ? 'rule' : 'build') : 'rule', predictedAt: [], typed: null, compared: false, miss: null, rodBlink: null });
const fresh = (tasks, extra = {}) => ({ tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, free: null, flag: null, ...extra });
export function init(numbers = {}) { return fresh((numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask)); }

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => (s.free ? !!s.free.done : !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);

/** Le compteur du rang construit : le DESSIN (jamais la formule). */
export const drawn = (s) => { const t = taskOf(s); return t.kind === 'two' ? rodsOfBoth(s.w.n, s.w.m) : rodsOfRow(s.w.n, t.strip); };
/** Le compteur est-il caché ? (متقدم : jusqu'à ce que l'élève ait tapé le nombre pour ce n.) */
export const counterHidden = (s) => { const t = taskOf(s); return !s.free && s.w.phase === 'build' && t.predict && t.kind !== 'compare' && s.w.n > 0 && !s.w.predictedAt.includes(s.w.n); };
export const full = (s) => s.w.n >= taskOf(s).max;

/* ── Gestes : construire ─────────────────────────────────────────────────────────────────────── */

const rec = (s, ev) => ({ ...s, trials: [...s.trials, Object.freeze(ev)] });
function withVisit(s, n) {
  const t = taskOf(s);
  const visited = s.w.visited.includes(n) ? s.w.visited : [...s.w.visited, n];
  let next = { ...s, w: { ...s.w, n, visited, miss: null, rodBlink: null }, last: null, flag: null };
  next = rec(next, { kind: 'build', task: s.free ? -1 : s.ti, n, m: s.w.m, rods: t.kind === 'two' ? rodsOfBoth(n, s.w.m) : rodsOfRow(n, t.strip), free: !!s.free });
  return advance(next);
}
/** Passe de « build » à « rule » quand tous les n demandés ont été visités (et prédits en متقدم). */
function advance(s) {
  const t = taskOf(s);
  if (s.w.phase !== 'build') return s;
  const seen = t.targets.every((n) => s.w.visited.includes(n));
  const predicted = !t.predict || t.kind === 'compare' || t.targets.every((n) => s.w.predictedAt.includes(n));
  if (seen && predicted) {
    if (t.kind === 'build') return solve(s);
    return { ...s, w: { ...s.w, phase: 'rule' } };
  }
  return s;
}
function setCells(s, n) {
  const t = taskOf(s);
  const v = Math.max(0, Math.min(t.max, Math.round(n)));
  if (s.w.phase === 'done' || v === s.w.n) return s;
  return v === 0 ? { ...s, w: { ...s.w, n: 0, miss: null, rodBlink: null }, last: null, flag: null } : withVisit(s, v);
}
export const snap = (s) => (s.w.n < taskOf(s).max ? setCells(s, s.w.n + 1) : s);
export const lift = (s) => (s.w.n > 0 ? setCells(s, s.w.n - 1) : s);
export function setStrip(s, m) {
  const t = taskOf(s);
  if (t.kind !== 'two') return s;
  const v = Math.max(0, Math.min(STRIP_MAX, Math.round(m)));
  return v === s.w.m ? s : { ...s, w: { ...s.w, m: v, miss: null }, last: null };
}

/** متقدم : l'élève TAPE le nombre de tiges du rang construit avant qu'on le lui montre. → { ok, value }. */
export function predict(s, text) {
  const t = taskOf(s);
  if (!t.predict || s.w.n < 1) return s;
  const value = Number(String(text).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g, ''));
  const real = t.kind === 'two' ? rodsOfBoth(s.w.n, s.w.m) : rodsOfRow(s.w.n, t.strip);
  const ok = Number.isFinite(value) && String(text).trim() !== '' && value === real;
  let next = rec({ ...s, last: Object.freeze({ kind: 'predict', task: s.free ? -1 : s.ti, n: s.w.n, value, ok }) }, { kind: 'predict', task: s.free ? -1 : s.ti, n: s.w.n, value, ok, free: !!s.free });
  if (ok) next = advance({ ...next, w: { ...next.w, predictedAt: [...new Set([...next.w.predictedAt, s.w.n])] } });
  return next;
}

/* ── La règle, jugée sur le DESSIN ───────────────────────────────────────────────────────────── */

const LETTER_OK = /^[0-9nm+\-−×*()\s]+$/i;
const normalizeRule = (txt) => String(txt).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[×·]/g, '*').toLowerCase();

/** Les n sur lesquels une règle est jugée : tous ceux qui ont été construits, et au moins 1…4 (une règle jugée sur un seul rang n'est jamais acceptée). */
export const judgeColumns = (s) => [...new Set([...s.w.visited, 1, 2, 3, 4])].filter((n) => n >= 1 && n <= taskOf(s).max).sort((a, b) => a - b);

/** Juge `text` : { ok, model, column, columns, rows, unreadable }. `model` : 'right' | 'perCell' | 'noFirst' | 'plusSix' | 'other'. */
function judgeRule(task, columns, text, pair) {
  const raw = String(text).trim();
  if (!raw || !LETTER_OK.test(raw)) return { ok: false, model: 'other', unreadable: true, column: null, columns, rows: [] };
  const t = normalizeRule(raw);
  const one = task.kind !== 'two';
  try {
    if (one) {
      const rows = valueTable(t, 'n', columns).map((r, i) => ({ n: columns[i], rule: Number(r.value.n / r.value.d), real: rodsOfRow(columns[i], task.strip), line: r.text }));
      const bad = rows.find((r) => r.rule !== r.real);
      if (!bad) return { ok: true, model: 'right', column: null, columns, rows };
      let model = 'other';
      if (!task.strip) {
        if (matches(t, '6n', columns)) model = 'perCell';
        else if (matches(t, '5n', columns)) model = 'noFirst';
        else if (matches(t, '5n+6', columns)) model = 'plusSix';
      } else if (matches(t, '10n+2', columns)) model = 'perCell';
      else if (matches(t, '8n', columns)) model = 'noFirst';
      return { ok: false, model, column: bad.n, columns, rows };
    }
    // deux lettres : la règle est jugée à (n, m) pour plusieurs couples (le couple de la tâche en dernier)
    const pairs = [[1, 1], [2, 3], [3, 2], pair ?? [6, 4]];
    const rows = pairs.map(([n, m]) => {
      const r = valueTable(t, 'n', [n], { m })[0];
      return { n, m, rule: Number(r.value.n / r.value.d), real: rodsOfBoth(n, m), line: r.text };
    });
    const bad = rows.find((r) => r.rule !== r.real);
    return bad ? { ok: false, model: 'other', column: bad.n, columns: pairs.map((p) => p.join(',')), rows } : { ok: true, model: 'right', column: null, columns: [], rows };
  } catch {
    return { ok: false, model: 'other', unreadable: true, column: null, columns, rows: [] };
  }
}
const matches = (text, law, columns) => columns.every((n) => valueTable(text, 'n', [n])[0].value.n === valueTable(law, 'n', [n])[0].value.n);

export function writeRule(s, text) {
  const t = taskOf(s);
  if (s.w.phase !== 'rule') return s;
  const pair = t.pair;
  const j = judgeRule(t, judgeColumns(s), text, pair);
  const ev = { kind: 'rule', task: s.free ? -1 : s.ti, text: String(text).trim(), ok: j.ok, model: j.model, free: !!s.free };
  const next = rec({ ...s, last: Object.freeze(ev), flag: j }, ev);
  const rodBlink = j.ok ? null : j.model === 'perCell' ? 'shared' : j.model === 'noFirst' ? 'first' : null;
  if (!j.ok) return { ...next, w: { ...s.w, miss: j, rodBlink } };
  if (t.kind === 'far') return { ...next, flag: j, w: { ...s.w, phase: 'far', miss: null, rodBlink: null } };
  if (t.kind === 'rule' || t.kind === 'two') {
    if (t.kind === 'two') return { ...next, flag: j, w: { ...s.w, phase: 'far', miss: null, rodBlink: null, n: pair[0], m: pair[1] } };
    return solve({ ...next, flag: j, w: { ...s.w, miss: null, rodBlink: null } });
  }
  if (t.kind === 'compare') return { ...next, flag: j, w: { ...s.w, phase: 'compare', miss: null, rodBlink: null } };
  return solve({ ...next, flag: j });
}

/** « a2 » : les deux écritures (celle de Yacine, celle de Rania) sur les rangs construits : les deux tableaux sont les mêmes. */
const COMPARE = Object.freeze({ yacine: '5n+1', rania: '6+5(n-1)' });
export function compareWritings(s) {
  const t = taskOf(s);
  if (t.kind !== 'compare' || s.w.phase !== 'compare') return s;
  const cols = judgeColumns(s);
  const mismatch = firstMismatch(COMPARE.yacine, COMPARE.rania, 'n', cols);
  const next = { ...s, w: { ...s.w, compared: true }, flag: { compare: true, columns: cols, same: mismatch == null, count: sameCount(COMPARE.yacine, COMPARE.rania) } };
  return solve(next);
}

/** « w3 » / « a3 » : la valeur lointaine, tapée : n = 40 → 201 ; (6, 4) → 66. */
export function farValue(task) { return task.kind === 'two' ? rodsOfBoth(task.pair[0], task.pair[1]) : (5 * task.far) + 1; }
export function answerFar(s, text) {
  const t = taskOf(s);
  if (s.w.phase !== 'far') return s;
  const value = Number(String(text).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g, ''));
  const ok = value === farValue(t);
  const ev = { kind: 'far', task: s.free ? -1 : s.ti, value, ok, free: !!s.free };
  const next = rec({ ...s, last: Object.freeze(ev) }, ev);
  return ok ? solve({ ...next, w: { ...s.w, phase: 'done' } }) : next;
}

function solve(s) {
  const sv = Object.freeze({ kind: 'solved', task: s.free ? -1 : s.ti, free: !!s.free });
  const base = { ...s, w: { ...s.w, phase: 'done' }, trials: [...s.trials, sv] };
  return s.free ? { ...base, free: { ...s.free, done: true } } : { ...base, done: { ...s.done, [s.ti]: true } };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null, flag: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, flag: null, ...(s.free ? { free: { ...s.free, done: false } } : { done: { ...s.done, [s.ti]: false } }) });

/* ── « جرّب أعدادك » : toujours ouvert, jamais compté ─────────────────────────────────────────── */

export function freeTask(s) {
  const task = buildTask({ id: 'free', kind: 'rule', targets: [], predict: false }, 0);
  const custom = Object.freeze({ kind: 'custom', free: true, n: 0, m: 0 });
  return { ...s, free: { task, done: false }, w: { ...initW(task), phase: 'rule' }, last: null, flag: null, trials: [...s.trials, custom] };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, w: initW(s.tasks[s.ti]), last: null, flag: null } : s);

export const trialEvidence = (tr) => ({ ...tr });

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-wc-next]', gesture: 'tap' } : null;
  const t = taskOf(s);
  const ph = s.w.phase;
  if (ph === 'build') {
    if (s.w.n === 0 && s.ti === 0) return { id: 'drag', target: '[data-wc-tray]', gesture: 'drag' };
    if (counterHidden(s)) return { id: 'predict', target: '[data-wc-predict]', gesture: 'tap' };
    if (s.ti === 0 && s.w.visited.length === 1) return { id: 'count', target: '[data-wc-counter]', gesture: 'tap' };
    if (s.w.visited.length >= 3 && s.w.visited.length < t.targets.length) return { id: 'table', target: '[data-wc-table]', gesture: 'tap' };
    return null;
  }
  if (ph === 'rule') return { id: 'rule', target: '[data-wc-rule]', gesture: 'tap' };
  if (ph === 'far') return { id: 'far', target: '[data-wc-far]', gesture: 'tap' };
  if (ph === 'compare') return { id: 'compare', target: '[data-wc-compare]', gesture: 'tap' };
  return null;
}
