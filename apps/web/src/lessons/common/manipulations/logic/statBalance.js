/**
 * logic/statBalance — la logique PURE de `stat-balance` (unité 8 « الإحصاء », leçon 2 « مدى ووسيط ومتوسط
 * سلسلة إحصائية », réutilisée par la synthèse `mode="hidden"`). Aucune arithmétique propre : tout passe par
 * `packages/core/arithmetic/statistics.js` (fractions exactes de linear.js). Aucune React.
 *
 * Le modèle : une série est une liste de JETONS (une valeur chacun), posés en colonnes sur une poutre graduée.
 *   range     deux mâchoires d'un كلّاب, chacune sur une COLONNE (valeur distincte) ; prise quand plus aucun
 *             jeton n'est dehors — المدى = max − min
 *   mean      l'appui p, sur une graduation fine 1/D qui CONTIENT la moyenne ; la poutre penche selon le signe
 *             de Σ (x − p) et n'est de niveau QU'à p = m (statistics.mean) ; INVARIANT Σ (x − m) = 0
 *   median    le rideau c ∈ 0…2N dans l'espace des RANGS : c pair = entre le rang c/2 et le rang c/2 + 1,
 *             c impair = SUR le rang (c + 1)/2 ; verrouillé seulement si autant de jetons de chaque côté
 *   contrast  le plus grand jeton tiré loin : la moyenne court, la médiane reste
 *   hidden    des jetons cachés (« ? ») que la main pose entre leurs bornes jusqu'à ce que la médiane soit
 *             `targetMedian` ET la moyenne `targetMean`
 */
import * as S from '@smarter-academy/core/arithmetic/statistics.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

export const THEMES = Object.freeze(['esport', 'heatwave', 'medals']);

const { frac, add, sub, mul, div, cmp, eq } = Lin;
const P = (raw) => Lin.parseNumber(raw);
export const parseVal = P;
export const toNum = (p) => p.n / p.d;
export const same = (p, q) => eq(p, q);
/** « 39,3 », « 241/15 » (ARIA, data-*). */
export const text = (p) => S.statText(p);
/** LaTeX : « 39{,}3 », « \dfrac{241}{15} ». */
export const tex = (p) => S.statLatex(p);
/** « 16,07 » : valeur approchée (2 décimales), pour une fraction qui ne s'écrit pas en décimal court. */
export const approx = (p) => S.approx(p, 2);
export const isShort = (p) => Lin.fracDecimal(p, 3) != null;
/** « 39{,}3 » ou « \dfrac{241}{15} \approx 16{,}07 ». */
export const texApprox = (p) => (isShort(p) ? tex(p) : `${tex(p)} \\approx ${approx(p).replace(',', '{,}')}`);

const decimals = (p) => { let d = p.d; let k = 0; while (d % 10 === 0 && d > 1) { d /= 10; k += 1; } return d === 1 ? k : 3; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => (a / gcd(a, b)) * b;

/* ── lecture du contrat ───────────────────────────────────────────────── */

/** « 40|35|34 » ou « 1:11|2:3|?:2 » → [{ v: frac | null, f }] dans l'ordre ÉCRIT (l'ordre du tableau). */
export function parseSeries(src) {
  if (typeof src !== 'string' || !src.trim()) throw new Error('stat-balance: series requis');
  return src.split('|').map((piece) => {
    const [rawV, rawF] = piece.split(':');
    const hiddenV = /^\s*[?⬡]\s*$/.test(rawV);
    const f = rawF == null ? 1 : Number(rawF.trim());
    if (!Number.isInteger(f) || f < 1) throw new Error(`stat-balance: effectif illisible « ${piece} »`);
    return Object.freeze({ v: hiddenV ? null : P(rawV), f });
  });
}

/** « range|mean|median » → les étapes, + « contrast » dès que la médiane est demandée. */
export function parseMode(mode) {
  const list = String(mode ?? '').split('|').map((s) => s.trim()).filter(Boolean);
  if (!list.length) throw new Error('stat-balance: mode requis');
  for (const m of list) if (!['range', 'mean', 'median', 'hidden'].includes(m)) throw new Error(`stat-balance: mode « ${m} »`);
  if (list.includes('hidden') && list.length > 1) throw new Error('stat-balance: hidden se joue seul');
  const ordered = ['range', 'mean', 'median', 'hidden'].filter((m) => list.includes(m));
  return ordered.includes('median') ? [...ordered, 'contrast'] : ordered;
}

/** « 2:2-4|12:26-32 » → [{ index, lo, hi }]. */
export function parseHidden(src) {
  if (!src) return [];
  return String(src).split('|').map((piece) => {
    const m = piece.trim().match(/^(\d+):([^-]+)-(.+)$/);
    if (!m) throw new Error(`stat-balance: hidden « ${piece} »`);
    const lo = P(m[2]);
    const hi = P(m[3]);
    if (cmp(lo, hi) >= 0) throw new Error(`stat-balance: bornes « ${piece} »`);
    return Object.freeze({ index: Number(m[1]), lo, hi });
  });
}

/** Une graduation « ronde » proche de `raw` : 1, 2, 5, 10, 20… (ou 0,1, 0,2, 0,5). */
function niceStep(raw) {
  if (!(raw > 0)) return frac(1);
  const e = Math.floor(Math.log10(raw));
  const base = raw / 10 ** e;
  const m = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
  return e >= 0 ? frac(m * 10 ** e) : frac(m, 10 ** -e);
}

/** « 0:50:5 » → { min, max, step } exacts. */
export function parseAxis(src) {
  const [a, b, c] = String(src).split(':');
  const axis = { min: P(a), max: P(b), step: c != null ? P(c) : niceStep((Number(b.replace(',', '.')) - Number(a.replace(',', '.'))) / 8) };
  if (cmp(axis.min, axis.max) >= 0) throw new Error(`stat-balance: axe « ${src} »`);
  return Object.freeze(axis);
}

const floorTo = (p, step) => mul(frac(Math.floor(toNum(div(p, step)) + 1e-9)), step);
const ceilTo = (p, step) => mul(frac(Math.ceil(toNum(div(p, step)) - 1e-9)), step);

/** L'axe par défaut : une graduation ronde, une case de marge de chaque côté, jamais sous 0 pour une série ≥ 0. */
function defaultAxis(lo, hi, room = 0) {
  const span = Math.max(toNum(sub(hi, lo)), 1e-9);
  const step = niceStep((span + room) / 8);
  let min = sub(floorTo(lo, step), step);
  if (cmp(lo, frac(0)) >= 0 && cmp(min, frac(0)) < 0) min = frac(0);
  const max = add(ceilTo(add(hi, frac(Math.round(room * 1000), 1000)), step), step);
  return Object.freeze({ min, max, step });
}

/* ── l'état ───────────────────────────────────────────────────────────── */

/** Les valeurs (fractions) des jetons ; un caché vaut sa position courante. */
export const values = (lab) => lab.tokens.map((t) => t.v);
/** La série des jetons, rangée (stable : l'ordre d'écriture départage les égaux). */
export function ranked(lab) {
  return lab.tokens.map((t, i) => ({ ...t, i })).sort((p, q) => cmp(p.v, q.v) || p.i - q.i);
}
/** Les colonnes : une par valeur distincte, ses jetons du bas vers le haut dans l'ordre des rangs. */
export function columns(lab) {
  const out = [];
  ranked(lab).forEach((t, r) => {
    const last = out[out.length - 1];
    if (last && eq(last.v, t.v)) last.tokens.push({ id: t.id, rank: r + 1 });
    else out.push({ v: t.v, tokens: [{ id: t.id, rank: r + 1 }] });
  });
  return out;
}

export function init({ series, mode, hidden, targetMean, targetMedian, axis }) {
  const entries = parseSeries(series);
  const stages = parseMode(mode);
  const isHidden = stages[0] === 'hidden';
  const holes = isHidden ? parseHidden(hidden) : [];
  if (isHidden) {
    if (!holes.length) throw new Error('stat-balance: hidden sans valeur cachée');
    if (holes.length > 3) throw new Error('stat-balance: au plus trois valeurs cachées');
    if (targetMean == null || targetMedian == null) throw new Error('stat-balance: hidden demande targetMean et targetMedian');
    for (const h of holes) if (!entries[h.index]) throw new Error(`stat-balance: hidden ${h.index} hors de la série`);
    entries.forEach((e, i) => { if (e.v == null && !holes.some((h) => h.index === i)) throw new Error(`stat-balance: « ? » ${i} sans bornes dans hidden`); });
  } else if (entries.some((e) => e.v == null)) {
    throw new Error('stat-balance: une valeur « ? » demande mode="hidden"');
  }
  const tokens = [];
  entries.forEach((e, index) => {
    const hole = holes.find((h) => h.index === index);
    for (let k = 0; k < e.f; k += 1) tokens.push({ id: `${index}.${k}`, entry: index, v: hole ? hole.lo : e.v, hidden: !!hole });
  });
  const N = tokens.length;
  if (N < 2) throw new Error('stat-balance: au moins deux valeurs');
  const known = tokens.map((t) => t.v);
  const bounds = holes.flatMap((h) => [h.lo, h.hi]);
  const all = [...known, ...bounds];
  const lo = all.reduce((m, v) => (cmp(v, m) < 0 ? v : m));
  const hi = all.reduce((m, v) => (cmp(v, m) > 0 ? v : m));
  const baseAxis = axis ? parseAxis(axis) : defaultAxis(lo, hi);
  const tm = targetMean != null ? P(targetMean) : null;
  const tmed = targetMedian != null ? P(targetMedian) : null;
  if (isHidden) {
    for (const t of [tm, tmed]) if (cmp(t, baseAxis.min) < 0 || cmp(t, baseAxis.max) > 0) throw new Error('stat-balance: cible hors de l’axe');
  }
  for (const v of all) if (cmp(v, baseAxis.min) < 0 || cmp(v, baseAxis.max) > 0) throw new Error(`stat-balance: ${text(v)} hors de l’axe`);
  // le pas des valeurs que la main pose (jeton tiré, jeton caché) : la plus fine écriture de la série
  const vDec = Math.max(0, ...all.map(decimals));
  const vstep = frac(1, 10 ** vDec);
  // le contraste : le PLUS GRAND jeton part jusqu'à max + 2 × (étendue) — l'axe s'allonge pour lui
  const r0 = sub(hi, lo);
  const farMax = add(hi, mul(r0.n === 0 ? frac(4) : r0, 2));
  const contrastAxis = stages.includes('contrast') ? defaultAxis(lo, farMax) : null;

  const m0 = isHidden ? null : S.mean(known);
  // la graduation de l'appui : 1/D avec D·m entier (la moyenne est TOUJOURS un multiple de 1/N) — au moins 10 crans par unité
  let D = 1;
  if (m0) {
    D = m0.d;
    if (10 % D === 0) D = 10;
    else if (D < 10) D *= Math.ceil(10 / D);
    D = lcm(D, baseAxis.min.d);
  }
  const lab = {
    N, stages, stage: 0, tokens, holes, targetMean: tm, targetMedian: tmed,
    baseAxis, contrastAxis, vstep, D,
    origMax: hi, origValues: known,
    fulcrumJ: null, curtain: null, jaws: null, moved: null,
    done: Object.fromEntries(stages.map((s) => [s, false])),
    trials: [], last: null,
  };
  // départs : l'appui au milieu de l'étendue (qui n'est PAS la moyenne en général), le rideau tout à gauche,
  // les mâchoires serrées au centre (des jetons dehors des deux côtés)
  if (stages.includes('mean')) {
    let j = fulcrumIndex(lab, div(add(lo, hi), 2));
    if (eq(fulcrumAt(lab, j), m0)) j = Math.min(fulcrumRange(lab).max, j + Math.max(1, Math.round(D / 2)));
    lab.fulcrumJ = j;
  }
  if (stages.includes('median')) lab.curtain = 0;
  if (stages.includes('range')) {
    const K = columns(lab).length;
    const a = Math.max(0, Math.floor((K - 1) / 2));
    lab.jaws = { lo: a, hi: Math.min(K - 1, a + 1) };
  }
  return lab;
}

export const stageOf = (lab) => lab.stages[lab.stage];
export const axisOf = (lab) => (stageOf(lab) === 'contrast' && lab.contrastAxis ? lab.contrastAxis : lab.baseAxis);
export const mean = (lab) => S.mean(values(lab));
export const median = (lab) => S.median(values(lab));
export const range = (lab) => S.range(values(lab));
export const minV = (lab) => S.min(values(lab));
export const maxV = (lab) => S.max(values(lab));
export const midrange = (lab) => div(add(minV(lab), maxV(lab)), 2);
export const sum = (lab) => S.weightedSum(values(lab));

/* ── المتوسط : l'appui ────────────────────────────────────────────────── */

export const fulcrumAt = (lab, j) => add(lab.baseAxis.min, frac(j, lab.D));
export const fulcrumIndex = (lab, p) => Math.round(toNum(mul(sub(p, lab.baseAxis.min), lab.D)));
export const fulcrumRange = (lab) => ({ min: 0, max: Math.floor(toNum(mul(sub(lab.baseAxis.max, lab.baseAxis.min), lab.D)) + 1e-9) });

/**
 * Les moments autour de p : left = Σ_{x<p} (p − x), right = Σ_{x>p} (x − p), torque = Σ (x − p) = right − left.
 * `tilt` : 'right' (le côté des grandes valeurs descend), 'left', ou 'level' — SEULEMENT si p est la moyenne.
 */
export function moments(lab, p) {
  let left = frac(0);
  let right = frac(0);
  for (const v of values(lab)) {
    const c = cmp(v, p);
    if (c < 0) left = add(left, sub(p, v));
    else if (c > 0) right = add(right, sub(v, p));
  }
  const torque = sub(right, left);
  const s = cmp(torque, frac(0));
  return { left, right, torque, tilt: s > 0 ? 'right' : s < 0 ? 'left' : 'level' };
}

/** L'angle dessiné (degrés, sens horaire = la droite descend) : jamais 0 hors de l'équilibre, borné. */
export function tiltAngle(lab, p, maxDeg = 9, minDeg = 2.5) {
  const { torque, tilt } = moments(lab, p);
  if (tilt === 'level') return 0;
  const ax = axisOf(lab);
  const scale = lab.N * toNum(sub(ax.max, ax.min)) / 2 || 1;
  const mag = Math.min(1, Math.abs(toNum(torque)) / scale);
  return (tilt === 'right' ? 1 : -1) * (minDeg + (maxDeg - minDeg) * Math.sqrt(mag));
}

/** Valider une position de l'appui (relâchement, pause clavier) : un essai. */
export function setFulcrum(lab, j) {
  const r = fulcrumRange(lab);
  const jj = Math.max(r.min, Math.min(r.max, j));
  const p = fulcrumAt(lab, jj);
  const mo = moments(lab, p);
  const trial = { stage: 'mean', p, ...mo };
  const next = { ...lab, fulcrumJ: jj, trials: [...lab.trials, trial], last: { kind: mo.tilt === 'level' ? 'balanced' : 'tilted', ...trial } };
  if (mo.tilt === 'level') next.done = { ...lab.done, mean: true };
  return next;
}

/* ── الوسيط : le rideau ───────────────────────────────────────────────── */

export const curtainRange = (lab) => ({ min: 0, max: 2 * lab.N });
/** Ce que le rideau c sépare : jetons à gauche, à droite, et le jeton SOUS le rideau (c impair). */
export function sides(lab, c) {
  const left = Math.floor(c / 2);
  const on = c % 2 === 1 ? (c + 1) / 2 : null;
  return { left, on, right: lab.N - left - (on ? 1 : 0) };
}
export const curtainLocked = (lab, c) => { const s = sides(lab, c); return s.left === s.right; };
/** La position (valeur) du rideau sur la poutre : sur un jeton, ou au milieu de deux rangs voisins. */
export function curtainValue(lab, c) {
  const sorted = ranked(lab).map((t) => t.v);
  const N = sorted.length;
  if (c % 2 === 1) return sorted[(c - 1) / 2];
  const k = c / 2;
  const half = div(axisOf(lab).step, 2);
  if (k === 0) return sub(sorted[0], half);
  if (k === N) return add(sorted[N - 1], half);
  return div(add(sorted[k - 1], sorted[k]), 2);
}
/** Le côté de chaque jeton pour un rideau c : 'left' | 'on' | 'right' (par rang). */
export function sideOfRank(lab, c, rank) {
  const s = sides(lab, c);
  if (rank <= s.left) return 'left';
  if (s.on === rank) return 'on';
  return 'right';
}
/**
 * Le rideau sous le doigt : la position c dont la valeur est la plus proche de x ; dans une COLONNE de jetons
 * égaux (plusieurs c au même x), la hauteur h (en jetons, depuis la poutre) choisit la coupe.
 */
export function curtainFrom(lab, x, h = 0) {
  const r = curtainRange(lab);
  let best = [];
  let bestD = Infinity;
  for (let c = r.min; c <= r.max; c += 1) {
    const d = Math.abs(toNum(curtainValue(lab, c)) - x);
    if (d < bestD - 1e-9) { best = [c]; bestD = d; } else if (Math.abs(d - bestD) <= 1e-9) best.push(c);
  }
  if (best.length === 1) return best[0];
  const i = Math.max(0, Math.min(best.length - 1, Math.round(2 * h - 1)));
  return best[i];
}
export function setCurtain(lab, c) {
  const r = curtainRange(lab);
  const cc = Math.max(r.min, Math.min(r.max, c));
  const s = sides(lab, cc);
  const locked = s.left === s.right;
  const trial = { stage: 'median', c: cc, ...s, locked, value: curtainValue(lab, cc) };
  const next = { ...lab, curtain: cc, trials: [...lab.trials, trial], last: { kind: locked ? 'locked' : 'unequal', ...trial } };
  if (locked) next.done = { ...lab.done, median: true };
  return next;
}
/** Les rangs du verrou (statistics.medianRanks) : [k] ou [k, k + 1]. */
export const medianRanks = (lab) => S.medianRanks(lab.N).ranks;

/* ── المدى : le كلّاب ─────────────────────────────────────────────────── */

export function outside(lab, jaws = lab.jaws) {
  const cols = columns(lab);
  const lo = cols[jaws.lo].v;
  const hi = cols[jaws.hi].v;
  const out = lab.tokens.filter((t) => cmp(t.v, lo) < 0 || cmp(t.v, hi) > 0);
  return { below: out.filter((t) => cmp(t.v, lo) < 0).length, above: out.filter((t) => cmp(t.v, hi) > 0).length, lo, hi, width: sub(hi, lo) };
}
export function setJaw(lab, which, idx) {
  const K = columns(lab).length;
  const j = { ...lab.jaws };
  if (which === 'lo') j.lo = Math.max(0, Math.min(j.hi, idx));
  else j.hi = Math.min(K - 1, Math.max(j.lo, idx));
  const o = outside(lab, j);
  const caught = o.below === 0 && o.above === 0;
  const trial = { stage: 'range', ...o, caught };
  const next = { ...lab, jaws: j, trials: [...lab.trials, trial], last: { kind: caught ? 'caught' : 'open', ...trial } };
  if (caught) next.done = { ...lab.done, range: true };
  return next;
}
/** La colonne la plus proche d'une valeur x. */
export function columnNear(lab, x) {
  const cols = columns(lab);
  let best = 0;
  cols.forEach((c, i) => { if (Math.abs(toNum(c.v) - x) < Math.abs(toNum(cols[best].v) - x)) best = i; });
  return best;
}

/* ── le contraste : le plus grand jeton tiré loin ─────────────────────── */

/** Le jeton tiré : le dernier rang de la série d'origine. */
export function movedTokenId(lab) {
  const r = lab.tokens.map((t, i) => ({ v: lab.origValues[i], i, id: t.id })).sort((p, q) => cmp(p.v, q.v) || p.i - q.i);
  return r[r.length - 1].id;
}
export const moveIndex = (lab, v) => Math.round(toNum(div(sub(v, lab.origMax), lab.vstep)));
export const moveAt = (lab, k) => add(lab.origMax, mul(lab.vstep, k));
export const moveRange = (lab) => ({ min: 0, max: Math.floor(toNum(div(sub(lab.contrastAxis.max, lab.origMax), lab.vstep)) + 1e-9) });

/** La série avec le jeton tiré à moveAt(k) — sans essai (le dessin pendant le geste). */
export function previewMoved(lab, k) {
  const r = moveRange(lab);
  const v = moveAt(lab, Math.max(r.min, Math.min(r.max, k)));
  const id = movedTokenId(lab);
  return { ...lab, tokens: lab.tokens.map((t) => (t.id === id ? { ...t, v } : t)) };
}
/** Poser le jeton tiré à la valeur moveAt(k) : la série change, la moyenne et la médiane sont relues. */
export function placeMoved(lab, k) {
  const r = moveRange(lab);
  const kk = Math.max(r.min, Math.min(r.max, k));
  const v = moveAt(lab, kk);
  const tmp = previewMoved(lab, kk);
  const trial = { stage: 'contrast', v, mean: mean(tmp), median: median(tmp), range: range(tmp) };
  const trials = [...lab.trials, trial];
  const tried = new Set(trials.filter((t) => t.stage === 'contrast' && !eq(t.v, lab.origMax)).map((t) => text(t.v)));
  const next = { ...tmp, moved: kk, trials, last: { kind: 'moved', ...trial } };
  if (tried.size >= 2) next.done = { ...lab.done, contrast: true };
  return next;
}
/** Les moyennes / médianes que l'élève a vues pendant le contraste (ses essais), dans l'ordre. */
export const contrastTrials = (lab) => lab.trials.filter((t) => t.stage === 'contrast');

/* ── hidden : les valeurs cachées retrouvées par la main ──────────────── */

export const holeTokens = (lab, h) => lab.tokens.filter((t) => t.entry === lab.holes[h].index);
export const holeValue = (lab, h) => holeTokens(lab, h)[0].v;
export const holeIndex = (lab, h, v) => Math.round(toNum(div(sub(v, lab.holes[h].lo), lab.vstep)));
export const holeAt = (lab, h, k) => add(lab.holes[h].lo, mul(lab.vstep, k));
export const holeRange = (lab, h) => ({ min: 0, max: Math.round(toNum(div(sub(lab.holes[h].hi, lab.holes[h].lo), lab.vstep))) });
/** La main veut poser la valeur cachée h à v : hors des bornes du tableau, c'est REFUSÉ (l'ordre du tableau). */
function canPlaceHole(lab, h, v) {
  const { lo, hi } = lab.holes[h];
  if (cmp(v, lo) < 0 || cmp(v, hi) > 0) return 'outOfOrder';
  return true;
}
export function hiddenStatus(lab) {
  const m = mean(lab);
  const med = median(lab);
  return { mean: m, median: med, meanOk: eq(m, lab.targetMean), medianOk: eq(med, lab.targetMedian), ...moments(lab, lab.targetMean) };
}
/** La série avec la valeur cachée h posée à v (bornée) — sans essai. */
export function previewHole(lab, h, v) {
  const { lo, hi, index } = lab.holes[h];
  const w = cmp(v, lo) < 0 ? lo : cmp(v, hi) > 0 ? hi : v;
  return { ...lab, tokens: lab.tokens.map((t) => (t.entry === index ? { ...t, v: w } : t)) };
}
export function placeHole(lab, h, v) {
  const ok = canPlaceHole(lab, h, v);
  if (ok !== true) {
    return { ...lab, trials: [...lab.trials, { stage: 'hidden', h, v, refused: true }], last: { kind: 'refused', h, v, lo: lab.holes[h].lo, hi: lab.holes[h].hi } };
  }
  const tmp = previewHole(lab, h, v);
  const st = hiddenStatus(tmp);
  const trial = { stage: 'hidden', h, v, refused: false, mean: st.mean, median: st.median, meanOk: st.meanOk, medianOk: st.medianOk };
  const next = { ...tmp, trials: [...lab.trials, trial], last: { kind: st.meanOk && st.medianOk ? 'found' : 'hiddenTry', ...trial } };
  if (st.meanOk && st.medianOk) next.done = { ...lab.done, hidden: true };
  return next;
}
/**
 * Une contre-preuve de « la moyenne seule suffit » : d'autres valeurs DANS les bornes qui donnent la même
 * moyenne mais une autre médiane (ou null). Balayage exhaustif sur les pas de la main (au plus trois trous).
 */
export function meanOnlyWitness(lab) {
  if (lab.holes.length < 2) return null;
  const grids = lab.holes.map((_, h) => Array.from({ length: holeRange(lab, h).max + 1 }, (_, k) => holeAt(lab, h, k)));
  const pick = (vals) => {
    const tokens = lab.tokens.map((t) => {
      const h = lab.holes.findIndex((hh) => hh.index === t.entry);
      return h >= 0 ? { ...t, v: vals[h] } : t;
    });
    return { ...lab, tokens };
  };
  const rec = (h, acc) => {
    if (h === grids.length) {
      const tmp = pick(acc);
      return eq(mean(tmp), lab.targetMean) && !eq(median(tmp), lab.targetMedian) ? acc : null;
    }
    for (const v of grids[h]) { const r = rec(h + 1, [...acc, v]); if (r) return r; }
    return null;
  };
  return rec(0, []);
}

/* ── étapes et découverte ─────────────────────────────────────────────── */

const stageDone = (lab, s = stageOf(lab)) => !!lab.done[s];
const allDone = (lab) => lab.stages.every((s) => lab.done[s]);
export const canAdvance = (lab) => stageDone(lab) && lab.stage < lab.stages.length - 1;
export function goStage(lab, i) {
  if (i < 0 || i >= lab.stages.length) return lab;
  // on n'ouvre une étape que si toutes les précédentes sont faites
  if (lab.stages.slice(0, i).some((s) => !lab.done[s])) return lab;
  let next = { ...lab, stage: i, last: null };
  // en entrant dans le contraste : le rideau sur la médiane trouvée (verrouillé), l'appui à la moyenne
  if (lab.stages[i] === 'contrast' && next.moved == null) {
    next = { ...next, moved: 0, curtain: next.curtain };
  }
  return next;
}
export const discoveryReady = (lab) => allDone(lab);
/** La question de la découverte : la dernière idée de la chaîne. */
export function discoveryKind(lab) {
  if (lab.stages.includes('hidden')) return 'hidden';
  if (lab.stages.includes('contrast')) return 'contrast';
  if (lab.stages.includes('mean')) return 'mean';
  return 'range';
}

/** Les valeurs de la série telles qu'écrites, pour la formule du formel (Σ x / N). */
export const valueList = (lab) => values(lab).map(tex);
/** Le mode (المنوال) s'il est UNIQUE, sinon null. */
export function uniqueMode(lab) {
  const m = S.mode(values(lab));
  return m.length === 1 ? m[0] : null;
}

/* ── géométrie (dessin seulement ; tout calcul plus haut) ─────────────── */

/**
 * La poutre dans un rectangle W × H : unité en px, taille d'un jeton (CARRÉ), hauteur de la pile la plus haute.
 * Les jetons d'une colonne s'empilent ; deux colonnes voisines ne se chevauchent pas ; tout tient dans W.
 */
export function beamLayout(lab, { width, height, pad = 14, reserved = 96, maxToken = 30, minToken = 5 }) {
  const ax = axisOf(lab);
  const span = toNum(sub(ax.max, ax.min));
  const unit = (width - 2 * pad) / span;
  const cols = columns(lab);
  let gap = Infinity;
  for (let i = 1; i < cols.length; i += 1) gap = Math.min(gap, toNum(sub(cols[i].v, cols[i - 1].v)));
  if (!Number.isFinite(gap)) gap = span;
  const tall = Math.max(...cols.map((c) => c.tokens.length));
  const byWidth = gap * unit * 0.92;
  const byHeight = (height - reserved) / tall;
  const token = Math.max(minToken, Math.min(maxToken, byWidth, byHeight));
  return { unit, pad, token, tall, px: (v) => pad + (toNum(v) - toNum(ax.min)) * unit, fromPx: (X) => toNum(ax.min) + (X - pad) / unit };
}

/* ── « جرّب كل الإمكانيات » (2026-10-09) : le balayage de l'étape, valeur par valeur ─────────────────
 * mean : toutes les graduations de l'appui ; median : toutes les positions 0…2N du rideau ; contrast : toutes
 * les positions du jeton tiré. Chaque valeur est l'essai EXACT du geste de la main (setFulcrum / setCurtain /
 * placeMoved). range (deux mâchoires) et hidden (construction) ne se balaient pas. */
export const SWEEPABLE = Object.freeze(['mean', 'median', 'contrast']);

/** Les valeurs du paramètre de l'étape courante pas encore essayées (vide si l'étape ne se balaie pas). */
export function untriedSweep(lab) {
  const st = stageOf(lab);
  if (st === 'mean') {
    const r = fulcrumRange(lab);
    return Array.from({ length: r.max - r.min + 1 }, (_, i) => r.min + i)
      .filter((j) => !lab.trials.some((t) => t.stage === 'mean' && eq(t.p, fulcrumAt(lab, j))));
  }
  if (st === 'median') {
    const r = curtainRange(lab);
    return Array.from({ length: r.max - r.min + 1 }, (_, i) => r.min + i)
      .filter((c) => !lab.trials.some((t) => t.stage === 'median' && t.c === c));
  }
  if (st === 'contrast' && lab.contrastAxis) {
    const r = moveRange(lab);
    return Array.from({ length: r.max - r.min + 1 }, (_, i) => r.min + i)
      .filter((k) => !lab.trials.some((t) => t.stage === 'contrast' && eq(t.v, moveAt(lab, k))));
  }
  return [];
}

/** Applique une valeur du balayage (le même essai que la main). */
export function applySweep(lab, v) {
  const st = stageOf(lab);
  if (st === 'mean') return setFulcrum(lab, v);
  if (st === 'median') return setCurtain(lab, v);
  if (st === 'contrast') return placeMoved(lab, v);
  return lab;
}
