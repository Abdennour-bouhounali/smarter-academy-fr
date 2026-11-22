/**
 * thales-beam — la logique PURE du faisceau (unité 9 « خاصية طالس », درس « خاصية طالس وحساب الأطوال »,
 * نشاط 1 p. 104). Aucun React ici, aucune arithmétique propre : rapports, partenaire parallèle et
 * coefficient viennent de `thales` / `linear` (packages/core). Seule la GÉOMÉTRIE DU DESSIN est en flottants.
 *
 * Le modèle : deux rayons issus de A — (d) porte B (abscisse signée AB > 0) et (d′) porte C (AC > 0).
 * L'écran (B′C′) : B′ à l'abscisse signée b′ = i · step sur (d) (la main tient i) ; C′ sur (d′) à
 *   c′ = c · b′ / b + t · tiltStep · signe(b′)          (thales.parallelPartner + l'inclinaison t)
 * t = 0 : l'écran est parallèle à (BC) ; t ≠ 0 : il est incliné. i < 0 : l'écran est passé de l'autre
 * côté de A (وضعية الفراشة, la chambre noire) ; i = 0 : l'écran est réduit au point A (aucun triangle).
 *
 *   const s = init({ AB: 6, AC: 7, BC: 6.1, ABp: 3.2, mode: 'projector|butterfly' });
 *   setPosition(s, 32)  → b′ = 16/5 ; c′ = 56/15 ; ratios({…}).equal === true (k = 8/15)
 *   setTilt(s, 1)       → c′ = 56/15 + 1/2 : AC′/AC ≠ AB′/AB — la logique NOMME le rapport qui diffère
 *   record(s) puis claim(s, 'equal' | 'unequal') : l'élève JUGE l'égalité, l'égalité exacte tranche.
 *
 * B′C′ se calcule par Al-Kashi en EXACT sur son carré : cos Â = (AB² + AC² − BC²) / (2·AB·AC) est
 * rationnel, donc B′C′² = b′² + c′² − 2·b′·c′·cos Â aussi ; l'égalité B′C′/BC = k se décide sur les carrés.
 * B′C′ n'est affiché exactement que s'il est rationnel (toujours quand t = 0 : B′C′ = |k|·BC).
 */
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const { frac, parseNumber, add, sub, mul, div, cmp, eq, isZero, toNumber, fracText, fracLatex, fracDecimal, neg } = LIN;

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(String(v)));
const absF = (p) => (cmp(p, frac(0)) < 0 ? neg(p) : p);
const sgn = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);

export const TILT_MAX = 3;

/** Les nombres du niveau → le modèle. Un défaut de contenu lève une erreur au rendu. */
export function init({ AB, AC, BC, ABp = null, mode = 'projector' } = {}) {
  const tri = { AB: F(AB), AC: F(AC), BC: F(BC) };
  for (const [k, v] of Object.entries(tri)) if (cmp(v, frac(0)) <= 0) throw new Error(`thales-beam: ${k} > 0`);
  // inégalité triangulaire stricte : un vrai triangle ABC
  if (cmp(add(tri.AB, tri.AC), tri.BC) <= 0 || cmp(add(tri.AB, tri.BC), tri.AC) <= 0 || cmp(add(tri.AC, tri.BC), tri.AB) <= 0) {
    throw new Error('thales-beam: AB, AC, BC ne forment pas un triangle');
  }
  const modes = String(mode).split('|');
  if (!modes.every((m) => m === 'projector' || m === 'butterfly')) throw new Error(`thales-beam: mode « ${mode} »`);
  const target = ABp == null ? null : F(ABp);
  const decimal = [tri.AB, tri.AC, tri.BC, target].some((v) => v && v.d !== 1);
  const step = decimal ? frac(1, 10) : frac(1);
  const n = toNumber(div(tri.AB, step));
  if (!Number.isInteger(n)) throw new Error('thales-beam: AB doit tomber sur une graduation');
  const butterfly = modes.includes('butterfly');
  const iMax = n;
  const iMin = butterfly ? -n : 1;
  const iTarget = target == null ? null : toNumber(div(target, step));
  if (iTarget != null && (!Number.isInteger(iTarget) || iTarget < 1 || iTarget > iMax)) throw new Error('thales-beam: ABp hors de [AB]');
  // départ : l'écran au milieu du faisceau, jamais sur la cible du manuel
  let i0 = Math.max(1, Math.round(iMax / 2));
  if (i0 === iTarget) i0 = Math.min(iMax, i0 + Math.max(1, Math.round(iMax / 6)));
  // cos Â exact (Al-Kashi)
  const cosA = div(sub(add(mul(tri.AB, tri.AB), mul(tri.AC, tri.AC)), mul(tri.BC, tri.BC)), mul(frac(2), mul(tri.AB, tri.AC)));
  return Object.freeze({
    tri, modes, butterfly, step, tiltStep: frac(1, 2), iMin, iMax, iTarget, target, cosA,
    i: i0, t: 0, stops: [], pending: null, last: null,
  });
}

/* ── la position et l'inclinaison (ce que la main tient) ── */

export const bOf = (s, i = s.i) => mul(frac(i), s.step);
/** c′ exact pour la position i et l'inclinaison t. */
export function cOf(s, i = s.i, t = s.t) {
  const b = bOf(s, i);
  if (isZero(b)) return frac(0);
  const c0 = TH.parallelPartner({ b: s.tri.AB, bp: b, c: s.tri.AC });
  return add(c0, mul(frac(t * sgn(i)), s.tiltStep));
}
/** Les inclinaisons permises à la position i : C′ reste du côté de B′ (même signe) et à distance > 0 de A. */
export function tiltRange(s, i = s.i) {
  if (i === 0) return { min: 0, max: 0 };
  const c0 = absF(TH.parallelPartner({ b: s.tri.AB, bp: bOf(s, i), c: s.tri.AC }));
  // |c0| − k·½ > 0  ⇔ k < 2|c0|
  const maxDown = Math.min(TILT_MAX, Math.ceil(toNumber(div(c0, s.tiltStep))) - 1);
  return { min: -Math.max(0, maxDown), max: TILT_MAX };
}
const clampTilt = (s, i, t) => { const r = tiltRange(s, i); return Math.max(r.min, Math.min(r.max, t)); };

export function setPosition(s, i) {
  const ii = Math.max(s.iMin, Math.min(s.iMax, Math.round(i)));
  if (ii === s.i) return s;
  return Object.freeze({ ...s, i: ii, t: clampTilt(s, ii, s.t), pending: null, last: { kind: 'move', i: ii } });
}
export function setTilt(s, t) {
  if (s.i === 0) return Object.freeze({ ...s, last: { kind: 'tiltAtA' } });
  const tt = clampTilt(s, s.i, Math.round(t));
  if (tt === s.t) return s;
  return Object.freeze({ ...s, t: tt, pending: null, last: { kind: tt === 0 ? 'parallelAgain' : 'tilt', t: tt } });
}

/* ── ce que la règle et l'écran lisent ── */

/** B′C′² exact (Al-Kashi sur les abscisses signées). */
function bcSquared(s, i = s.i, t = s.t) {
  const b = bOf(s, i); const c = cOf(s, i, t);
  return sub(add(mul(b, b), mul(c, c)), mul(mul(frac(2), mul(b, c)), s.cosA));
}
/** La racine exacte d'un rationnel quand elle existe (sinon null). */
function exactSqrt(p) {
  const r = (x) => { const q = Math.round(Math.sqrt(x)); return q * q === x ? q : null; };
  const n = r(p.n); const d = r(p.d);
  return n == null || d == null ? null : frac(n, d);
}

/**
 * La lecture complète à la position courante : les trois longueurs (exactes ou approchées), les trois
 * rapports, l'égalité exacte, et le(s) rapport(s) qui diffèrent de AB′/AB.
 */
export function reading(s, i = s.i, t = s.t) {
  if (i === 0) return Object.freeze({ atA: true });
  const b = absF(bOf(s, i)); const c = absF(cOf(s, i, t));
  const bc2 = bcSquared(s, i, t);
  const bcExact = exactSqrt(bc2);
  const rB = TH.ratio(b, s.tri.AB);
  const rC = TH.ratio(c, s.tri.AC);
  const rBCsq = div(bc2, mul(s.tri.BC, s.tri.BC));
  const okC = eq(rC, rB);
  const okBC = eq(rBCsq, mul(rB, rB));
  const differs = [...(okC ? [] : ['AC']), ...(okBC ? [] : ['BC'])];
  return Object.freeze({
    atA: false, parallel: t === 0, butterfly: i < 0,
    ABp: b, ACp: c, BCp: bcExact, BCpApprox: Math.sqrt(toNumber(bc2)),
    rB, rC, rBC: bcExact ? div(bcExact, s.tri.BC) : null, rBCApprox: Math.sqrt(toNumber(rBCsq)),
    equal: differs.length === 0, differs, k: rB,
    kind: differs.length ? 'unequal' : TH.scale(s.tri.AB, b).kind,
  });
}

/** Une longueur écrite comme sur la règle : décimal court exact, sinon ≈ au centième. */
function lengthTex(p, approx) {
  if (p) { const d = fracDecimal(p, 2); if (d != null) return { tex: d.replace(',', '{,}'), exact: true }; }
  const x = p ? toNumber(p) : approx;
  return { tex: x.toFixed(2).replace('.', '{,}'), exact: false };
}
/** Le rapport tel que l'élève le lit (non simplifié) : \dfrac{3{,}2}{6}, ≈ si la mesure est arrondie. */
function rawRatioTex(num, den) {
  return `${num.exact ? '' : '\\approx '}\\dfrac{${num.tex}}{${lengthTex(den).tex}}`;
}
/** Les trois rapports lus, en LaTeX, pour la position courante. */
export function readingTex(s, i = s.i, t = s.t) {
  const r = reading(s, i, t);
  if (r.atA) return null;
  const ab = lengthTex(r.ABp); const ac = lengthTex(r.ACp); const bc = lengthTex(r.BCp, r.BCpApprox);
  return {
    AB: { len: ab, tex: rawRatioTex(ab, s.tri.AB) },
    AC: { len: ac, tex: rawRatioTex(ac, s.tri.AC) },
    BC: { len: bc, tex: rawRatioTex(bc, s.tri.BC) },
  };
}

/* ── un arrêt : l'élève enregistre, puis JUGE ── */

export function record(s) {
  if (s.i === 0) return Object.freeze({ ...s, pending: null, last: { kind: 'atA' } });
  if (s.stops.some((st) => st.i === s.i && st.t === s.t)) return Object.freeze({ ...s, pending: null, last: { kind: 'dup' } });
  return Object.freeze({ ...s, pending: { i: s.i, t: s.t }, last: { kind: 'recorded' } });
}

/** says : 'equal' | 'unequal'. Juste ou faux, l'arrêt est gardé avec le verdict exact (non bloquant). */
export function claim(s, says) {
  if (!s.pending) return s;
  const { i, t } = s.pending;
  const r = reading(s, i, t);
  const ok = (says === 'equal') === r.equal;
  const stop = Object.freeze({ i, t, parallel: t === 0, butterfly: i < 0, equal: r.equal, differs: r.differs, says, ok, n: s.stops.length + 1 });
  return Object.freeze({ ...s, stops: [...s.stops, stop], pending: null, last: { kind: ok ? 'claimOk' : 'claimWrong', stop } });
}

/* ── le contraste et la découverte ── */

export function progress(s) {
  const par = s.stops.filter((st) => st.parallel);
  const sides = new Set(par.filter((st) => !st.butterfly).map((st) => st.i));
  const tilted = s.stops.some((st) => !st.parallel);
  const target = s.iTarget == null ? true : par.some((st) => st.i === s.iTarget);
  const fly = !s.butterfly ? true : par.some((st) => st.butterfly);
  const twoParallel = new Set(par.map((st) => Math.abs(st.i))).size >= 2 || (sides.size >= 1 && par.some((st) => st.butterfly));
  return { twoParallel, tilted, target, fly };
}
export function discoveryReady(s) {
  const p = progress(s);
  return p.twoParallel && p.tilted && p.target && p.fly;
}

/** Un arrêt parallèle et un arrêt incliné de l'élève (pour réfuter les distracteurs avec SES nombres). */
export function witnesses(s) {
  const par = s.stops.find((st) => st.parallel && st.i === s.iTarget) ?? s.stops.find((st) => st.parallel);
  const tilt = s.stops.find((st) => !st.parallel);
  return { par, tilt };
}

/** « AB − AB′ = AC − AC′ » (une différence constante) réfuté sur un arrêt parallèle de l'élève. */
export function differenceWitness(s, stop) {
  const r = reading(s, stop.i, stop.t);
  const dB = sub(s.tri.AB, r.ABp); const dC = sub(s.tri.AC, r.ACp);
  return { dB, dC, same: eq(dB, dC) };
}

/** Ce que la leçon reçoit à chaque arrêt jugé (`onTrial`). */
export function evidenceOf(s, stop) {
  const r = reading(s, stop.i, stop.t);
  const tx = readingTex(s, stop.i, stop.t);
  return {
    kind: 'stop', n: stop.n, parallel: stop.parallel, butterfly: stop.butterfly, equal: stop.equal, says: stop.says, ok: stop.ok,
    ABp: tx.AB.len.tex, ACp: tx.AC.len.tex, BCp: tx.BC.len.tex, ACexact: r.ACp.d !== 1 && fracDecimal(r.ACp, 2) == null ? fracText(r.ACp) : null,
    k: fracText(r.rB), kTex: fracLatex(r.rB), differs: stop.differs,
  };
}

/* ── la géométrie du dessin (flottants) ── */

/**
 * Les directions des deux rayons : la bissectrice de Â est horizontale, (d) au-dessus, (d′) en dessous
 * (y vers le HAUT). Renvoie un point du plan pour une abscisse signée sur chaque rayon.
 */
function rays(s) {
  const half = Math.acos(Math.max(-1, Math.min(1, toNumber(s.cosA)))) / 2;
  const u = [Math.cos(half), Math.sin(half)];
  const v = [Math.cos(half), -Math.sin(half)];
  return { u, v, half, onD: (x) => [x * u[0], x * u[1]], onDp: (x) => [x * v[0], x * v[1]] };
}

/**
 * La boîte du dessin en unités (A à l'origine) : du côté « projecteur » jusqu'au-delà de B et C, du côté
 * « chambre noire » jusqu'à −AB (s'il existe). `layout` renvoie l'échelle et la projection en pixels.
 */
function sceneBox(s) {
  const R = rays(s);
  const AB = toNumber(s.tri.AB); const AC = toNumber(s.tri.AC);
  const reach = Math.max(AB, AC + toNumber(s.tiltStep) * TILT_MAX);
  const far = reach * 1.04;
  const near = s.butterfly ? -reach * 1.02 : -Math.max(AB, AC) * 0.16;
  const xs = [far * R.u[0], near * R.u[0]];
  const yTop = Math.max(far * R.u[1], -near * R.u[1]);
  return { xMin: Math.min(...xs), xMax: Math.max(...xs), yMin: -yTop, yMax: yTop, R };
}

export function layout(s, { width, maxHeight, pad = 22 }) {
  const box = sceneBox(s);
  const spanX = box.xMax - box.xMin; const spanY = box.yMax - box.yMin;
  const scale = Math.max(4, Math.min((width - 2 * pad) / spanX, (maxHeight - 2 * pad) / spanY));
  const W = Math.round(spanX * scale + 2 * pad);
  const H = Math.round(spanY * scale + 2 * pad);
  const px = ([x, y]) => [pad + (x - box.xMin) * scale, pad + (box.yMax - y) * scale];
  return { W, H, scale, px, box, R: box.R };
}

/** La position i la plus proche d'un point du dessin (pixels) projeté sur (d). */
export function iFromPoint(s, L, [X, Y]) {
  const ux = L.R.u[0]; const uy = -L.R.u[1];
  const [ax, ay] = L.px([0, 0]);
  const along = ((X - ax) * ux + (Y - ay) * uy) / L.scale;
  return along / toNumber(s.step);
}
/** L'inclinaison t la plus proche d'un point projeté sur (d′), à la position courante. */
export function tFromPoint(s, L, [X, Y]) {
  const vx = L.R.v[0]; const vy = -L.R.v[1];
  const [ax, ay] = L.px([0, 0]);
  const along = ((X - ax) * vx + (Y - ay) * vy) / L.scale;
  const c0 = toNumber(cOf(s, s.i, 0));
  return ((along - c0) * sgn(s.i)) / toNumber(s.tiltStep);
}

/** Les graduations d'un rayon (abscisses signées, entières pour les chiffres, demi pour les petits traits). */
export function ticks(s, len) {
  const L0 = s.butterfly ? -Math.ceil(len) : 0;
  const out = [];
  for (let x = L0 * 2; x <= Math.ceil(len) * 2; x++) if (x !== 0) out.push({ x: x / 2, major: x % 2 === 0 });
  return out;
}
