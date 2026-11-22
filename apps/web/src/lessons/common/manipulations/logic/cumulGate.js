/**
 * cumul-gate — la logique PURE de LA TOISE DU MANÈGE (unité 8 « الإحصاء », leçon 1
 * « التكرار المجمع والتواتر المجمع »). Aucune arithmétique propre : tout compte passe par
 * `statistics` (packages/core/arithmetic/statistics.js) — `tableOf`, `table`, `countAtMost`,
 * `countAtLeast`, `countWhere`, `cumulativeUp/Down`, `total`.
 *
 *   const s = init({ series: '160|165|154|…', mode: 'up|down|table' })   (la série du manuel, dans SON ordre)
 *   s = sortQueue(s)                       la file se range par taille (le premier geste du manuel)
 *   s = claim(s, 159, 'down', '13')        « 159cm على الأقل » : 13 → accepté, la case du tableau se remplit
 *   s = claim(s, 159, 'down', '8')         refusé : 'strict' (les 5 élèves de 159 cm oubliés), 'under', 'over',
 *                                          'otherSide' — avec les groupes allumés comme témoin
 *   discoveryReady(s)                      une même valeur t de la série comptée des DEUX côtés
 *   invariantAt(s, 159)                    { up: 12, down: 13, N: 20, f: 5 } : 12 + 13 = 20 + 5
 *
 * Une série s'écrit « valeur:effectif|… » (le tableau) ou « a|b|c » (les valeurs brutes, dans l'ordre du
 * manuel) ; virgule décimale. La toise est graduée en UNITÉS ENTIÈRES (des centimètres) : les valeurs
 * doivent être entières (un défaut de contenu lève une erreur au rendu).
 */
import * as S from '@smarter-academy/core/arithmetic/statistics.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

export const SIDES = Object.freeze(['up', 'down']);
const STRICT = Object.freeze({ up: '<', down: '>' });

/** Lit la série : { values (fractions, ordre brut), table: { values, freqs }, given: bool (ordre du manuel) }. */
function parseSeries(src) {
  const parts = String(src ?? '').split('|').map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new Error('cumul-gate: série vide');
  const withCounts = parts.every((p) => p.includes(':'));
  if (!withCounts && parts.some((p) => p.includes(':'))) throw new Error('cumul-gate: mélange « v:f » et valeurs brutes');
  let raw;
  if (withCounts) {
    const rows = parts.map((p) => {
      const [v, f] = p.split(':');
      const n = Number(f);
      if (!Number.isInteger(n) || n < 1) throw new Error(`cumul-gate: effectif « ${f} »`);
      return { v: Lin.parseNumber(v), f: n };
    });
    raw = interleave(rows);
  } else {
    raw = parts.map((p) => Lin.parseNumber(p));
  }
  if (raw.some((v) => v == null || !Lin.isInteger(v))) throw new Error('cumul-gate: la toise ne porte que des valeurs entières');
  const table = S.tableOf(raw);
  return { values: raw, table, given: !withCounts };
}

/**
 * Un ordre « file d'attente » déterministe quand la série est donnée par son tableau : on prend tour à tour
 * une personne de chaque taille, en commençant par le milieu — jamais déjà rangée.
 */
function interleave(rows) {
  const left = rows.map((r) => ({ ...r }));
  // un tour : le milieu, puis alternativement un bord et l'autre (jamais croissant)
  const n = left.length;
  const mid = Math.floor(n / 2);
  const turn = [mid];
  for (let k = 0; turn.length < n; k += 1) {
    if (k < mid) turn.push(k);
    if (n - 1 - k > mid && turn.length < n) turn.push(n - 1 - k);
  }
  const order = [];
  while (left.some((r) => r.f > 0)) {
    for (const i of turn) if (left[i].f > 0) { order.push(left[i].v); left[i].f -= 1; }
  }
  return order;
}

/** Les modes : 'up|down' (compter des deux côtés) ou 'up|down|table' (+ le tableau du manuel). */
function parseMode(mode = 'up|down') {
  const m = String(mode).split('|').map((s) => s.trim()).filter(Boolean);
  if (!m.includes('up') || !m.includes('down') || m.some((x) => !['up', 'down', 'table'].includes(x))) {
    throw new Error(`cumul-gate: mode « ${mode} »`);
  }
  return { table: m.includes('table') };
}

/** Les cases que le manuel imprime déjà : « up:154|up:157|down:165 ». */
function parseGiven(src) {
  if (!src) return [];
  return String(src).split('|').map((p) => p.trim()).filter(Boolean).map((p) => {
    const [side, v] = p.split(':');
    if (!SIDES.includes(side)) throw new Error(`cumul-gate: case donnée « ${p} »`);
    return { side, t: Lin.toNumber(Lin.parseNumber(v)) };
  });
}

export function init({ series, mode = 'up|down', given = '' }) {
  const parsed = parseSeries(series);
  const { table: withTable } = parseMode(mode);
  const people = parsed.values.map((v, i) => ({ id: i, v: Lin.toNumber(v) }));
  const values = parsed.table.values.map(Lin.toNumber);
  const s = {
    people,
    values,
    freqs: [...parsed.table.freqs],
    T: parsed.table,
    N: S.total(parsed.table.freqs),
    withTable,
    sorted: false,
    claims: [],            // les comptes ACCEPTÉS : { t, side, n }
    refused: 0,
    cells: { up: {}, down: {} },   // le tableau : t → n (donné ou rempli par un compte accepté)
    given: { up: {}, down: {} },
    last: null,
  };
  for (const g of parseGiven(given)) {
    if (!values.includes(g.t)) throw new Error(`cumul-gate: case donnée hors série (${g.t})`);
    const n = count(s, g.t, g.side);
    s.cells[g.side][g.t] = n;
    s.given[g.side][g.t] = true;
  }
  return s;
}

/** La toise : de 3 unités sous la plus petite valeur à 3 au-dessus de la plus grande. */
export const rangeOf = (s) => ({ min: Math.min(...s.values) - 3, max: Math.max(...s.values) + 3 });

/** Le nombre de personnes du côté `side` du seuil t — TOUJOURS par statistics (« على الأكثر » ≤, « على الأقل » ≥). */
export const count = (s, t, side) => (side === 'up' ? S.countAtMost(s.T, t) : S.countAtLeast(s.T, t));
/** Le même compte SANS la valeur t (la confusion « au moins » / « plus que »). */
const strictCount = (s, t, side) => S.countWhere(s.T, STRICT[side], t);
/** L'effectif de la valeur t (0 si t n'est pas une valeur de la série). */
export const freqOf = (s, t) => { const i = s.values.indexOf(t); return i < 0 ? 0 : s.freqs[i]; };
/** Une personne est-elle allumée (du côté choisi) ? t compte des deux côtés. */
export const isLit = (v, t, side) => (t == null ? false : side === 'up' ? v <= t : v >= t);
/** Les groupes allumés { v, f } : le témoin d'un refus (la somme des effectifs se lit dessus). */
export const litGroups = (s, t, side) => s.values.map((v, i) => ({ v, f: s.freqs[i] })).filter((g) => isLit(g.v, t, side));

/** La file se range par taille (croissante) — le premier geste de la méthode du manuel. */
export function sortQueue(s) {
  if (s.sorted) return s;
  return { ...s, sorted: true, people: [...s.people].sort((a, b) => a.v - b.v || a.id - b.id), last: { kind: 'sorted' } };
}

/** Lire la saisie de l'élève : un entier naturel (chiffres arabes acceptés), sinon null. */
function readCount(raw) {
  const txt = String(raw ?? '').trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  return /^\d{1,4}$/.test(txt) ? Number(txt) : null;
}

/**
 * L'élève ANNONCE combien de personnes passent la barre (de son côté). La toise accepte le compte juste
 * (il entre dans SON tableau) et refuse l'autre en montrant pourquoi :
 *   'strict'     il a oublié ceux qui ont EXACTEMENT t (« على الأقل / على الأكثر » incluent t) ;
 *   'otherSide'  il a compté l'autre côté du seuil ;
 *   'under' / 'over'  un compte trop petit / trop grand.
 */
export function claim(s, t, side, raw) {
  if (t == null) return { ...s, last: { kind: 'noT' } };
  if (!SIDES.includes(side)) throw new Error(`cumul-gate: côté « ${side} »`);
  const n = readCount(raw);
  if (n == null) return { ...s, last: { kind: 'syntax' } };
  const want = count(s, t, side);
  const groups = litGroups(s, t, side);
  if (n === want) {
    const claims = [...s.claims.filter((c) => !(c.t === t && c.side === side)), { t, side, n }];
    const cells = s.withTable && s.values.includes(t)
      ? { ...s.cells, [side]: { ...s.cells[side], [t]: n } } : s.cells;
    return { ...s, claims, cells, last: { kind: 'ok', t, side, n, groups, value: s.values.includes(t) } };
  }
  const f = freqOf(s, t);
  const other = side === 'up' ? 'down' : 'up';
  let kind = n < want ? 'under' : 'over';
  if (f > 0 && n === strictCount(s, t, side)) kind = 'strict';
  else if (n === count(s, t, other) && n !== want) kind = 'otherSide';
  return { ...s, refused: s.refused + 1, last: { kind, t, side, n, want, f, groups } };
}

/** La valeur t a-t-elle été comptée des DEUX côtés (deux comptes acceptés) ? */
const bothAt = (s, t) => SIDES.every((side) => s.claims.some((c) => c.t === t && c.side === side));
/** Les seuils comptés des deux côtés, dans l'ordre croissant. */
const bothSides = (s) => [...new Set(s.claims.map((c) => c.t))].filter((t) => bothAt(s, t)).sort((a, b) => a - b);

/**
 * LE CONTRASTE qui ouvre la découverte : une VALEUR de la série (effectif > 0) comptée des deux côtés —
 * c'est là que « up + down » dépasse N, de l'effectif de t.
 */
export const discoveryReady = (s) => bothSides(s).some((t) => freqOf(s, t) > 0);

/** L'invariant au seuil t : up(t) + down(t) = N + f(t). */
export function invariantAt(s, t) {
  return { t, up: count(s, t, 'up'), down: count(s, t, 'down'), N: s.N, f: freqOf(s, t) };
}

/** Le seuil de la découverte : la première valeur de la série comptée des deux côtés. */
export const discoveryT = (s) => bothSides(s).find((t) => freqOf(s, t) > 0) ?? null;

/** Un couple accepté (up, down) au même t où les deux comptes diffèrent : réfute « الصاعد = النازل ». */
export function unequalPair(s) {
  const t = bothSides(s).find((u) => count(s, u, 'up') !== count(s, u, 'down'));
  return t == null ? null : invariantAt(s, t);
}

/** Le tableau du manuel : pour chaque valeur, l'effectif et les deux cases (nombre ou null). */
export function tableRows(s) {
  return s.values.map((v, i) => ({
    v, f: s.freqs[i],
    up: s.cells.up[v] ?? null, down: s.cells.down[v] ?? null,
    givenUp: Boolean(s.given.up[v]), givenDown: Boolean(s.given.down[v]),
  }));
}
export const tableComplete = (s) => s.withTable && s.values.every((v) => s.cells.up[v] != null && s.cells.down[v] != null);
/** Les cases attendues (pour le contrôle) : statistics.cumulativeUp / Down. */
export const expectedColumns = (s) => ({ up: S.cumulativeUp(s.freqs), down: S.cumulativeDown(s.freqs) });

/**
 * Le BLOC quasi carré des personnes (MANIPULATION_CONTRACT §8bis) : cols ≈ ⌈√(n · aspect)⌉, ajusté pour que
 * rows × cols ≥ n — 20 → 5 × 4, 8 → 3 × 3 sur une scène carrée.
 */
export function blockLayout(n, aspect = 1) {
  if (n < 1) return { cols: 1, rows: 1 };
  let cols = Math.max(1, Math.min(n, Math.ceil(Math.sqrt(n * Math.max(0.25, aspect)))));
  let rows = Math.ceil(n / cols);
  while (cols > 1 && Math.ceil(n / (cols - 1)) === rows) { cols -= 1; rows = Math.ceil(n / cols); }
  return { cols, rows };
}

/**
 * La hauteur DESSINÉE d'une personne (fraction de la cellule) : croissante avec la taille, la plus grande à
 * 1, la plus petite vers 0,6 — base = min − 1,5 × (max − min) ; toutes égales → 1.
 */
export function figureScale(v, values) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (hi === lo) return 1;
  const base = lo - 1.5 * (hi - lo);
  return (v - base) / (hi - base);
}
