/**
 * sheet-lab — la logique PURE du majdoul (unité 8 « الإحصاء », leçon « استعمال المجدولات »).
 * Aucune arithmétique propre : chaque indicateur vient de `statistics` (core) ; ce fichier ne fait
 * que LIRE une feuille (adresses, plages, دساتير) et décider de ce qu'elle affiche et refuse.
 *
 *   const s = init({ cells: '4|10|8|4|3|2|4', ask: 'MAX-MIN|MEDIANE|MOYENNE|MODE', entry: 'type' });
 *   typeCell(s, 0, '4') … → la ligne 1 (A1:G1) est saisie ;
 *   setHand(s, 0, '8') ; setBar(s, '=MAX(A1:G1)-MIN(A1:G1)') ; enter(s) → B2 = 8, ligne vérifiée ;
 *   nudge(s, 1, +30) → B4 (MOYENNE) bouge, B3 (MEDIANE) reste : le contraste.
 *
 * LA FEUILLE. Ligne 1 = les n valeurs (A1 … ; n ≤ 12). Lignes 2… = un indicateur chacune : A = son nom
 * (texte), B = le دستور, C = le calcul À LA MAIN de l'élève (un nombre tapé, qui ne se recalcule jamais).
 *
 * CE QUE LE TABLEUR FAIT VRAIMENT (fidélité, jamais une règle inventée) :
 *   - une saisie sans « = » n'est pas calculée (le tableur garde le texte) → refusée ici avec cette raison ;
 *   - un nombre tapé dans B n'est pas un دستور : il ne suivra pas les cellules → refusé ;
 *   - une fonction inconnue donne #NOM? → refusée, le nom est cité ;
 *   - une plage qui sort de la ligne 1 contient la cellule du دستور lui-même (référence circulaire) ou des
 *     دساتير voisins → refusée ;
 *   - une plage trop courte (A1:F1) est CALCULÉE (le tableur ne sait pas ce qu'on voulait) : le nombre
 *     contredit alors le calcul à la main ; une plage qui déborde sur des cellules vides (A1:H1) donne le
 *     même nombre (les cellules vides sont ignorées) ;
 *   - MODE renvoie la PREMIÈRE valeur (ordre des cellules) de plus grand effectif, #N/A si aucune ne se
 *     répète ; MOYENNE d'une plage vide = #DIV/0!.
 * Noms acceptés : ceux que le manuel imprime (MAX, MIN, MEDIANE, MOYENNE, MODE — Excel en français) ET
 * leurs noms anglais (MEDIAN, AVERAGE) ; SOMME / SUM sont connus (ils existent) mais ne sont aucun des
 * quatre indicateurs.
 */
import { parseDec } from '@smarter-academy/core';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as S from '@smarter-academy/core/arithmetic/statistics.js';

export const COLS = 'ABCDEFGHIJKL';
const MAX_CELLS = 12;

/** Les noms du manuel (français) et leurs équivalents anglais — même calcul. */
const FUNCTIONS = Object.freeze({
  MAX: 'max', MIN: 'min',
  MEDIANE: 'median', MEDIAN: 'median',
  MOYENNE: 'mean', AVERAGE: 'mean',
  MODE: 'mode',
  SOMME: 'sum', SUM: 'sum',
});
/** Les jetons de `ask` → l'indicateur de la ligne. */
const ASK = { 'MAX-MIN': 'range', MEDIANE: 'median', MEDIAN: 'median', MOYENNE: 'mean', AVERAGE: 'mean', MODE: 'mode' };
/** La carte que la ligne propose (le nom imprimé par le manuel). */
export const CARD_OF = { range: 'MAX-MIN', median: 'MEDIANE', mean: 'MOYENNE', mode: 'MODE' };

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? Lin.frac(v) : Lin.parseNumber(String(v)));

/* ── écriture ─────────────────────────────────────────────────────────── */

/** « 5 », « 4,5 », « 10,14 » : ce que la cellule affiche (décimal court exact, sinon arrondi à 2). */
export function cellText(v) {
  if (v == null) return '';
  if (typeof v === 'object' && v.error) return v.error;
  return Lin.fracDecimal(v, 3) ?? S.approx(v, 2);
}
const exact = (v) => (v && !v.error ? Lin.fracDecimal(v, 3) != null : false);
export const addr = (i, row = 1) => `${COLS[i]}${row}`;
function rangeText(sel) {
  if (!sel) return '';
  const a = Math.min(sel.a, sel.b); const b = Math.max(sel.a, sel.b);
  return a === b ? addr(a) : `${addr(a)}:${addr(b)}`;
}

/* ── la donnée ────────────────────────────────────────────────────────── */

function parseCells(text) {
  const vals = String(text).split('|').map((t) => t.trim()).filter(Boolean).map(F);
  if (vals.length < 2 || vals.length > MAX_CELLS) throw new Error(`sheet-lab: 2 à ${MAX_CELLS} cellules (« ${text} »)`);
  return vals;
}
function parseAsk(text) {
  const kinds = String(text).split('|').map((t) => t.trim().toUpperCase()).filter(Boolean).map((t) => {
    if (!ASK[t]) throw new Error(`sheet-lab: indicateur inconnu « ${t} »`);
    return ASK[t];
  });
  if (!kinds.length || new Set(kinds).size !== kinds.length) throw new Error(`sheet-lab: ask invalide « ${text} »`);
  return kinds;
}
/** « البلاستيك:60|الزجاج:40|الورق:50 » → [{ label, value }]. */
function parsePairs(text) {
  return String(text).split('|').map((t) => t.trim()).filter(Boolean).map((t) => {
    const i = t.lastIndexOf(':');
    if (i < 1) throw new Error(`sheet-lab: paire « ${t} »`);
    return { label: t.slice(0, i).trim(), value: F(t.slice(i + 1).trim()) };
  });
}
/** « 7-8:6|8-9:1|9-10:4 » → [{ lo, hi, value }] — des classes CONTIGUËS. */
function parseClasses(text) {
  const out = String(text).split('|').map((t) => t.trim()).filter(Boolean).map((t) => {
    const m = t.match(/^([\d,.]+)-([\d,.]+):([\d,.]+)$/);
    if (!m) throw new Error(`sheet-lab: classe « ${t} »`);
    return { lo: F(m[1]), hi: F(m[2]), value: F(m[3]) };
  });
  out.forEach((c, i) => { if (i && !Lin.eq(c.lo, out[i - 1].hi)) throw new Error('sheet-lab: classes non contiguës'); });
  return out;
}

/* ── les indicateurs (core) ───────────────────────────────────────────── */

/** MODE du tableur : la première valeur (ordre des cellules) de plus grand effectif ; #N/A si rien ne se répète. */
export function sheetMode(values) {
  if (!values.length) return { error: '#N/A' };
  const count = (v) => values.filter((w) => Lin.eq(w, v)).length;
  const top = Math.max(...values.map(count));
  if (top < 2) return { error: '#N/A' };
  return values.find((v) => count(v) === top);
}
function applyFn(kind, values) {
  if (kind === 'max') return values.length ? S.max(values) : Lin.frac(0);
  if (kind === 'min') return values.length ? S.min(values) : Lin.frac(0);
  if (kind === 'sum') return values.reduce((s, v) => Lin.add(s, v), Lin.frac(0));
  if (!values.length) return { error: kind === 'mean' ? '#DIV/0!' : '#NOMBRE!' };
  if (kind === 'median') return S.median(values);
  if (kind === 'mean') return S.mean(values);
  if (kind === 'mode') return sheetMode(values);
  throw new Error(kind);
}
/** La VRAIE valeur de l'indicateur d'une ligne, sur toute la ligne 1. */
export function truth(kind, values) {
  if (kind === 'range') return S.range(values);
  return applyFn(kind, values);
}

/* ── lire un دستور ─────────────────────────────────────────────────────── */

const CELL = /^([A-Z]{1,2})(\d{1,3})$/;
const colIndex = (letters) => (letters.length === 1 ? COLS.indexOf(letters) : -1);

/**
 * Analyse une saisie de la barre. → { ok: true, terms: [{ sign, fn, kind, a, b, row1 } | { sign, num }] }
 * ou { ok: false, reason, name? } avec reason ∈ empty | noEquals | typedNumber | unknownFn | syntax |
 * noRange | outsideRow.
 */
export function parseFormula(raw) {
  const text = String(raw ?? '').replace(/[\s⁦-⁩]/g, '').toUpperCase().replace(/[−–]/g, '-').replace(/;/g, ':');
  if (!text) return { ok: false, reason: 'empty' };
  if (text[0] !== '=') {
    if (Number.isFinite(parseDec(raw))) return { ok: false, reason: 'typedNumber' };
    const name = text.match(/^([A-Z.]+)\(/)?.[1];
    return { ok: false, reason: 'noEquals', name: name ?? null };
  }
  const body = text.slice(1);
  if (!body) return { ok: false, reason: 'empty' };
  const terms = [];
  let i = 0;
  let sign = 1;
  while (i < body.length) {
    if (terms.length) {
      const op = body[i];
      if (op !== '+' && op !== '-') return { ok: false, reason: 'syntax' };
      sign = op === '-' ? -1 : 1;
      i += 1;
    } else if (body[i] === '-' || body[i] === '+') { sign = body[i] === '-' ? -1 : 1; i += 1; }
    const rest = body.slice(i);
    const call = rest.match(/^([A-Z][A-Z.]*)\(([^()]*)\)/);
    if (call) {
      const name = call[1];
      const kind = FUNCTIONS[name];
      if (!kind) return { ok: false, reason: 'unknownFn', name };
      if (!call[2]) return { ok: false, reason: 'noRange', name };
      const parts = call[2].split(':');
      if (parts.length > 2) return { ok: false, reason: 'syntax' };
      const cells = parts.map((p) => p.match(CELL));
      if (cells.some((c) => !c)) return { ok: false, reason: 'syntax' };
      const cols = cells.map((c) => colIndex(c[1]));
      const rows = cells.map((c) => Number(c[2]));
      if (cols.some((c) => c < 0)) return { ok: false, reason: 'syntax' };
      if (rows.some((r) => r !== 1)) return { ok: false, reason: 'outsideRow', name };
      const a = Math.min(...cols); const b = Math.max(...cols);
      terms.push({ sign, fn: name, kind, a, b });
      i += call[0].length;
      continue;
    }
    const num = rest.match(/^\d+(?:[.,]\d+)?/);
    if (num) { terms.push({ sign, num: F(num[0].replace('.', ',')) }); i += num[0].length; continue; }
    if (/^[A-Z][A-Z.]*\(/.test(rest)) return { ok: false, reason: 'syntax' };
    const bare = rest.match(/^[A-Z][A-Z.]*/);
    if (bare && !CELL.test(bare[0]) && !rest.slice(bare[0].length).match(/^\d/)) return { ok: false, reason: 'unknownFn', name: bare[0] };
    return { ok: false, reason: 'syntax' };
  }
  if (!terms.length) return { ok: false, reason: 'empty' };
  return { ok: true, terms };
}

/** Les valeurs de la ligne 1 couvertes par [a ; b] (les cellules vides ou hors des n données sont ignorées). */
const covered = (values, a, b) => values.filter((v, i) => i >= a && i <= b && v != null);

/** Évalue un دستور analysé sur la ligne 1. */
function evaluate(parsed, values) {
  let acc = Lin.frac(0);
  for (const t of parsed.terms) {
    const v = t.num ?? applyFn(t.kind, covered(values, t.a, t.b));
    if (v.error) return v;
    acc = t.sign < 0 ? Lin.sub(acc, v) : Lin.add(acc, v);
  }
  return acc;
}

/** Ce que le دستور calcule : range | median | mean | mode | max | min | sum | other. */
export function classify(parsed) {
  const fnTerms = parsed.terms.filter((t) => t.fn);
  if (parsed.terms.length === 1 && fnTerms.length === 1 && fnTerms[0].sign > 0) return fnTerms[0].kind;
  if (parsed.terms.length === 2 && fnTerms.length === 2) {
    const [p, m] = fnTerms;
    if (p.sign > 0 && m.sign < 0 && p.kind === 'max' && m.kind === 'min') return 'range';
  }
  return 'other';
}
/** Toutes les fonctions couvrent-elles EXACTEMENT les n données (A1 … dernière) ? Sinon les cellules oubliées. */
function coverage(parsed, n) {
  const missing = new Set();
  const extra = [];
  for (const t of parsed.terms.filter((x) => x.fn)) {
    for (let i = 0; i < n; i += 1) if (i < t.a || i > t.b) missing.add(i);
    if (t.b >= n) extra.push(t.b);
  }
  return { full: missing.size === 0, missing: [...missing].sort((x, y) => x - y), beyond: extra.length > 0 };
}
/** L'écriture canonique (celle du manuel, sans espaces). */
function canonical(parsed) {
  return `=${parsed.terms.map((t, i) => {
    const s = t.sign < 0 ? '-' : (i ? '+' : '');
    return t.num ? `${s}${cellText(t.num)}` : `${s}${t.fn}(${rangeText({ a: t.a, b: t.b })})`;
  }).join('')}`;
}

/* ── l'état du laboratoire ────────────────────────────────────────────── */

export function init({ cells, ask = 'MAX-MIN|MOYENNE', entry = 'given', chart, pie, classes } = {}) {
  const target = parseCells(cells);
  const kinds = parseAsk(ask);
  if (kinds.includes('mode') && sheetMode(target).error) throw new Error('sheet-lab: MODE demandé mais aucune valeur ne se répète');
  const charts = chart ? String(chart).split('|').map((c) => c.trim()).filter(Boolean) : [];
  for (const c of charts) if (!['bars', 'pie', 'histogram'].includes(c)) throw new Error(`sheet-lab: graphique « ${c} »`);
  const typing = entry === 'type';
  return {
    n: target.length,
    target,
    values: typing ? target.map(() => null) : target.slice(),
    typing,
    saved: false,
    rows: kinds.map((kind) => ({ kind, hand: null, handText: '', formula: null, status: null })),
    active: 0,
    bar: '',
    barTarget: typing ? { kind: 'cell', i: 0 } : { kind: 'row', r: 0 },
    sel: typing ? { a: 0, b: 0 } : null,
    trials: [],
    edits: [],
    snapshot: null,
    contrast: false,
    recalc: false,
    last: null,
    stage: 'formulas',
    charts: charts.map((id) => ({ id, sel: null, choice: null, verdict: null, done: false })),
    chartAt: 0,
    pie: pie ? parsePairs(pie) : null,
    classes: classes ? parseClasses(classes) : null,
  };
}

/** La ligne 1 est-elle saisie ET conforme à l'énoncé ? */
export const entered = (s) => !!s.snapshot || s.values.every((v, i) => v != null && Lin.eq(v, s.target[i]));
export const mismatched = (s) => (s.snapshot || !s.typing ? [] : s.values.map((v, i) => (v != null && !Lin.eq(v, s.target[i]) ? i : -1)).filter((i) => i >= 0));
export const allVerified = (s) => s.rows.every((r) => r.status === 'ok');
export const editMode = (s) => allVerified(s);

/** La valeur ACTUELLE du دستور d'une ligne (recalculée sur les cellules, jamais mémorisée). */
export function rowValue(s, r) {
  const row = s.rows[r];
  if (!row.formula) return null;
  return evaluate(row.formula.parsed, s.values);
}

/* ── gestes ───────────────────────────────────────────────────────────── */

/** Sélectionner des cellules de la ligne 1 (glisser, tap-tap, Maj + flèches). */
export function select(s, a, b = a) {
  const sel = { a: clampI(s, a), b: clampI(s, b) };
  const single = sel.a === sel.b;
  let { bar, barTarget } = s;
  if (s.typing && !entered(s) && single) { barTarget = { kind: 'cell', i: sel.a }; bar = s.values[sel.a] == null ? '' : cellText(s.values[sel.a]); }
  else if (editMode(s) && single) { barTarget = { kind: 'cell', i: sel.a }; bar = cellText(s.values[sel.a]); }
  else if (barTarget.kind === 'row' && /^=/.test(bar.trim())) {
    // la plage choisie à la main s'écrit dans le دستور en cours (comme le tableur)
    bar = bar.replace(/\(([^()]*)\)/g, `(${rangeText(sel)})`);
  }
  return { ...s, sel, bar, barTarget };
}
const clampI = (s, i) => Math.max(0, Math.min(s.n - 1, i));

/** Choisir la ligne (l'indicateur) où l'on écrira le دستور. */
export function pickRow(s, r) {
  if (s.typing && !entered(s)) return { ...s, last: { kind: 'refuse', reason: 'enterFirst' } };
  const row = s.rows[r];
  return { ...s, active: r, barTarget: { kind: 'row', r }, bar: row.formula ? row.formula.text : '', last: null };
}

/** Une carte de fonction : écrit le دستور dans la barre avec la plage sélectionnée. */
export function insertCard(s, card) {
  if (s.barTarget.kind !== 'row') return { ...s, last: { kind: 'refuse', reason: s.typing && !entered(s) ? 'enterFirst' : 'pickRow' } };
  const r = s.sel ? rangeText(s.sel) : '';
  const bar = card === 'MAX-MIN' ? `=MAX(${r})-MIN(${r})` : `=${card}(${r})`;
  return { ...s, bar, last: null };
}
export const setBar = (s, text) => ({ ...s, bar: String(text) });

/** Le calcul à la main (colonne C) : un nombre, chiffres arabes acceptés. */
export function setHand(s, r, text) {
  const t = String(text ?? '');
  const n = parseDec(t);
  const hand = t.trim() && Number.isFinite(n) ? Lin.parseNumber(String(n)) : null;
  const rows = s.rows.map((row, i) => (i === r ? { ...row, hand, handText: t } : row));
  return { ...s, rows };
}

/** Un nombre tapé à la main « vaut » une valeur exacte v s'il l'égale, ou s'il en est l'arrondi affiché à 0,01 près. */
export function handMatches(hand, v) {
  if (hand == null || v == null || v.error) return false;
  if (Lin.eq(hand, v)) return true;
  return Math.abs(Lin.toNumber(hand) - Lin.toNumber(v)) <= 0.005 + 1e-9 && !exact(v);
}

/** « ENTER » : valide la barre dans sa cible (une cellule de la ligne 1, ou le B d'une ligne). */
export function enter(s) {
  const tgt = s.barTarget;
  if (tgt.kind === 'cell') {
    const n = parseDec(s.bar);
    if (/^\s*=/.test(s.bar) || !Number.isFinite(n)) return { ...s, last: { kind: 'refuse', reason: 'cellNumber' } };
    const v = Lin.parseNumber(String(n));
    if (Lin.toNumber(v) < 0 || Lin.toNumber(v) > 999) return { ...s, last: { kind: 'refuse', reason: 'cellBounds' } };
    return setCell(s, tgt.i, v, true);
  }
  const r = tgt.r;
  const row = s.rows[r];
  if (row.hand == null) return { ...s, last: { kind: 'refuse', reason: 'needHand', row: r } };
  const parsed = parseFormula(s.bar);
  if (!parsed.ok) return { ...s, last: { kind: 'refuse', reason: parsed.reason, name: parsed.name ?? null, row: r } };
  const value = evaluate(parsed, s.values);
  const what = classify(parsed);
  const cov = coverage(parsed, s.n);
  const fnOk = what === row.kind;
  const status = fnOk && cov.full ? 'ok' : !fnOk && !cov.full ? 'wrongBoth' : fnOk ? 'wrongRange' : 'wrongFn';
  const text = canonical(parsed);
  const rows = s.rows.map((x, i) => (i === r ? { ...x, formula: { text, parsed, what }, status } : x));
  const trial = { row: r, indicator: row.kind, formula: text, what, value: cellText(value), hand: cellText(row.hand), handOk: handMatches(row.hand, value), status, missing: cov.missing.map((i) => addr(i)) };
  let next = { ...s, rows, trials: [...s.trials, trial], last: { kind: 'commit', ...trial } };
  if (status === 'ok') {
    const nextRow = rows.findIndex((x) => x.status !== 'ok');
    next = nextRow >= 0 ? { ...next, active: nextRow, barTarget: { kind: 'row', r: nextRow }, bar: rows[nextRow].formula?.text ?? '' } : { ...next, bar: '' };
    if (allVerified(next) && !next.snapshot) next = { ...next, snapshot: snapshotOf(next), barTarget: { kind: 'none' }, sel: null };
  }
  return next;
}

function snapshotOf(s) {
  return s.rows.map((_, r) => rowValue(s, r));
}

/** Changer une cellule de la ligne 1 (saisie, ou ±). En mode édition, tout se RECALCULE. */
export function setCell(s, i, v, typed = false) {
  const values = s.values.map((x, j) => (j === i ? F(v) : x));
  let next = { ...s, values };
  if (s.typing && !s.snapshot && !entered(s)) {
    // saisie de la série : la cellule suivante (comme Tab dans le tableur)
    const ok = Lin.eq(values[i], s.target[i]);
    const nxt = values.findIndex((x, j) => j > i && x == null);
    const done = entered(next);
    next = {
      ...next,
      last: { kind: 'typed', i, ok, done },
      ...(done ? { barTarget: { kind: 'row', r: 0 }, active: 0, bar: '', sel: null }
        : nxt >= 0 && ok ? { sel: { a: nxt, b: nxt }, barTarget: { kind: 'cell', i: nxt }, bar: '' } : { bar: typed ? cellText(values[i]) : s.bar }),
    };
    return next;
  }
  if (!editMode(s)) return { ...s, last: { kind: 'refuse', reason: 'notYet' } };
  const now = snapshotOf(next);
  const before = s.snapshot;
  const moved = s.rows.map((row, r) => ({ kind: row.kind, moved: !sameVal(now[r], before[r]), value: cellText(now[r]), was: cellText(before[r]) }));
  const anyMoved = moved.some((m) => m.moved);
  const median = moved.find((m) => m.kind === 'median');
  const mean = moved.find((m) => m.kind === 'mean');
  const contrast = s.contrast || (!!median && !!mean && mean.moved && !median.moved);
  const edit = { i, cell: addr(i), value: cellText(values[i]), moved };
  return { ...next, bar: cellText(values[i]), edits: [...s.edits, edit], contrast, recalc: s.recalc || anyMoved, last: { kind: 'edit', ...edit } };
}
const sameVal = (x, y) => (x?.error || y?.error ? x?.error === y?.error : Lin.eq(x, y));
export function nudge(s, i, d) {
  const cur = s.values[i] ?? Lin.frac(0);
  const v = Lin.add(cur, Lin.frac(d));
  if (Lin.toNumber(v) < 0 || Lin.toNumber(v) > 999) return s;
  return setCell(s, i, v);
}

/** Le nombre de lignes à vérifier avant d'éditer. */
export const verifiedCount = (s) => s.rows.filter((r) => r.status === 'ok').length;

/**
 * La découverte : toutes les lignes vérifiées, PUIS une cellule changée qui a fait bouger un دستور.
 * Avec MOYENNE et MEDIANE : il faut avoir vu la moyenne bouger pendant que la médiane restait.
 */
export function discoveryReady(s) {
  if (!allVerified(s)) return false;
  const both = s.rows.some((r) => r.kind === 'median') && s.rows.some((r) => r.kind === 'mean');
  return both ? s.contrast : s.recalc;
}

export const save = (s) => ({ ...s, saved: true, last: { kind: 'saved' } });

/* ── l'étape « graphique » ───────────────────────────────────────────── */

const CHART_FIT = { bars: 'bars', pie: 'pie', histogram: 'histogram' };

/** Le petit tableau (2 lignes) d'un jeu de données : les étiquettes et les valeurs. */
export function datasetOf(s, id) {
  if (id === 'bars') {
    const T = S.tableOf(s.target);
    return { id, labels: T.values.map(cellText), values: T.freqs.map((f) => Lin.frac(f)), rowNames: ['value', 'freq'] };
  }
  if (id === 'pie') {
    const p = s.pie ?? parsePairs('البلاستيك:60|الزجاج:40|الورق:50');
    return { id, labels: p.map((x) => x.label), values: p.map((x) => x.value), rowNames: ['category', 'mass'] };
  }
  const c = s.classes ?? parseClasses('7-8:6|8-9:1|9-10:4');
  return { id, labels: c.map((x) => `${cellText(x.lo)} ≤ t < ${cellText(x.hi)}`), classes: c, values: c.map((x) => x.value), rowNames: ['class', 'freq'] };
}

export const openCharts = (s) => (s.charts.length && allVerified(s) ? { ...s, stage: 'charts', last: null } : s);
export const backToSheet = (s) => ({ ...s, stage: 'formulas', last: null });
export const pickDataset = (s, k) => ({ ...s, chartAt: Math.max(0, Math.min(s.charts.length - 1, k)), last: null });

/** Sélection rectangulaire dans le petit tableau (lignes 0–1, colonnes 0…k−1). */
export function chartSelect(s, rect) {
  const charts = s.charts.map((c, k) => (k === s.chartAt ? { ...c, sel: norm(rect), verdict: null } : c));
  return { ...s, charts };
}
const norm = (r) => ({ c0: Math.min(r.c0, r.c1), c1: Math.max(r.c0, r.c1), r0: Math.min(r.r0, r.r1), r1: Math.max(r.r0, r.r1) });

/** Ce que la sélection laisse dehors : colonnes oubliées, ligne des noms ou des valeurs absente. */
function selectionGaps(ds, sel) {
  if (!sel) return { none: true };
  const k = ds.values.length;
  const missingCols = [];
  for (let c = 0; c < k; c += 1) if (c < sel.c0 || c > sel.c1) missingCols.push(c);
  return { none: false, missingCols, noLabels: sel.r0 > 0, noValues: sel.r1 < 1, complete: missingCols.length === 0 && sel.r0 === 0 && sel.r1 === 1 };
}

/** Choisir le type de graphique. Le mauvais type est REFUSÉ avec une raison ; une sélection incomplète dessine un graphique faux. */
export function chooseChart(s, kind) {
  const c = s.charts[s.chartAt];
  const ds = datasetOf(s, c.id);
  const gaps = selectionGaps(ds, c.sel);
  let verdict;
  if (gaps.none) verdict = { ok: false, reason: 'noSelection' };
  else if (kind !== CHART_FIT[c.id]) verdict = { ok: false, reason: `${c.id}_${kind}` };
  else if (gaps.noValues) verdict = { ok: false, reason: 'noValues' };
  else if (gaps.missingCols.length) verdict = { ok: false, reason: 'partial', missing: gaps.missingCols.map((i) => ds.labels[i]), drawn: true };
  else if (gaps.noLabels) verdict = { ok: false, reason: 'noLabels', drawn: true };
  else verdict = { ok: true, drawn: true };
  const charts = s.charts.map((x, k) => (k === s.chartAt ? { ...x, choice: kind, verdict, done: x.done || verdict.ok } : x));
  return { ...s, charts, last: { kind: 'chart', id: c.id, chart: kind, ok: verdict.ok, reason: verdict.reason ?? null } };
}
export const chartsDone = (s) => s.charts.length > 0 && s.charts.every((c) => c.done);

/** Les données que le graphique dessine : les colonnes SÉLECTIONNÉES seulement. */
export function drawnData(s, k = s.chartAt) {
  const c = s.charts[k];
  const ds = datasetOf(s, c.id);
  if (!c.sel || !c.verdict?.drawn) return null;
  const idx = ds.values.map((_, i) => i).filter((i) => i >= c.sel.c0 && i <= c.sel.c1);
  const values = idx.map((i) => ds.values[i]);
  const labels = idx.map((i) => (c.sel.r0 === 0 ? ds.labels[i] : String(i + 1)));
  const out = { id: c.id, labels, values, total: values.reduce((a, v) => Lin.add(a, v), Lin.frac(0)) };
  if (c.id === 'pie') out.angles = S.pieAngles(values.map((v) => Lin.toNumber(v)));
  if (c.id === 'histogram') out.classes = idx.map((i) => ds.classes[i]);
  return out;
}

/** La hauteur max d'un graphique en barres (graduation « ronde » : 2, 5, 10…). */
export function niceMax(values) {
  const m = Math.max(1, ...values.map((v) => Lin.toNumber(v)));
  for (const step of [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]) if (m / step <= 6) return Math.ceil(m / step) * step;
  return Math.ceil(m / 1000) * 1000;
}

/** Combien de cellules par rangée pour que chaque cellule fasse au moins `minPx` (la ligne 1 « repliée » sur un téléphone). */
export function perRow(n, width, minPx = 44) {
  return Math.max(1, Math.min(n, Math.floor(width / minPx)));
}
