/**
 * vector-sum — LA LOGIQUE PURE du laboratoire « مجموع شعاعين » (unité 11 « الأشعة والانسحاب », leçon majmu-shuaayn,
 * manuel pp. 127–135). Aucune arithmétique ici : chaque vecteur, chaque verdict et chaque longueur exacte vient de
 * packages/core/arithmetic/vectors.js (`translate`, `vec`, `relation`, `collinear`, `isZeroVec`, `distance`,
 * `crossing`, `crossingSide`) ; trigonometry.js n'écrit que les nombres (`surdLatex`, `roundTo`). Ce module dit ce que
 * la main a le droit de faire et ce que l'écran doit montrer.
 *
 * DEUX MODES, UNE IDÉE (le mode suit le niveau) :
 *
 *   'chasles'        (مبتدئ, plateforme — la trottinette dans Alger) : le premier trajet AB est fait, la trottinette est
 *                    en B. L'élève PORTE la flèche d'un second trajet (une carte de l'appli) et pose sa QUEUE sur une
 *                    station de la carte. Seule B l'accepte (« la fin du premier est le début du second ») ; A est
 *                    refusée (même origine : ce n'est pas un enchaînement — le niveau متقدم y répond) ; toute autre
 *                    station est refusée (la trottinette ne saute pas). Posée en B, la flèche BC fait apparaître la
 *                    SOMME AC ; trois cartes donnent trois cas : un virage (AC plus court que AB + BC), la même
 *                    direction (B sur [AC] : les longueurs s'ajoutent), le retour (AB + BA = 0, la trottinette rentre).
 *
 *   'parallelogram'  (متقدم, le تحدّ p. 127 — le nageur) : le courant c (2 km/h) est fixe, la vitesse propre s (4 km/h)
 *                    a une DIRECTION que l'élève tient (θ degrés depuis (AB), vers l'amont). La somme s + c est la
 *                    diagonale du parallélogramme construit sur s et c ; le nageur la suit jusqu'à l'autre rive. Il
 *                    n'arrive en B que si s + c suit (AB) : θ = 30° exactement (vectors.crossingSide) ; ailleurs il
 *                    touche la rive en aval (refusé) ou en amont, à une distance écrite en mètres.
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as T from '@smarter-academy/core/arithmetic/trigonometry.js';

const DECOY_IDS = ['P', 'Q', 'R'];
const num = (v) => (typeof v === 'number' ? v : Number(String(v).replace(',', '.')));

// ── 'chasles' : la trottinette ────────────────────────────────────────────────

function initChasles({ A = [1, 1], u = [3, 1], legs = [[1, 3], [3, 1], [-3, -1]], decoys = [[1, 4], [6, 0]] } = {}) {
  const a = V.point(A[0], A[1]);
  const uu = V.point(u[0], u[1]);
  const b = V.translate(a, uu);
  const stations = [
    { id: 'A', p: a, role: 'start' },
    { id: 'B', p: b, role: 'end' },
    ...decoys.map((d, i) => ({ id: DECOY_IDS[i], p: V.point(d[0], d[1]), role: 'other' })),
  ];
  return Object.freeze({
    mode: 'chasles', A: a, B: b, u: uu,
    legs: Object.freeze(legs.map((v) => V.point(v[0], v[1]))),
    stations: Object.freeze(stations),
    placed: null, trials: Object.freeze([]), refusals: Object.freeze([]), last: null,
  });
}

/** La station `id` de la carte. */
const stationOf = (s, id) => s.stations.find((st) => st.id === id) ?? null;

/**
 * Peut-on poser la QUEUE du trajet `leg` sur la station `id` ? true | 'origin' (c'est A, l'origine du premier trajet :
 * deux flèches de même origine ne s'enchaînent pas) | 'gap' (la trottinette est en B, elle ne saute pas ailleurs).
 */
export function canAttach(s, leg, id) {
  const st = stationOf(s, id);
  if (!st || s.legs[leg] == null) return 'gap';
  if (V.vecEq(st.p, s.B)) return true;
  if (V.vecEq(st.p, s.A)) return 'origin';
  return 'gap';
}

/** Ce que la somme AC dit d'un trajet `leg` posé en B. */
export function chainOf(s, leg) {
  const v = s.legs[leg];
  const C = V.translate(s.B, v);
  const sum = V.vec(s.A, C);
  const rel = V.relation(s.u, v);
  const zero = V.isZeroVec(sum);
  const kind = zero ? 'zero' : V.collinear(s.A, s.B, C) && rel.sense === true ? 'line' : 'turn';
  return Object.freeze({
    leg, C, sum, kind, opposite: rel.opposite,
    AB: V.distance(s.A, s.B), BC: V.norm(v), AC: zero ? null : V.distance(s.A, C),
  });
}

/** Poser le trajet `leg` en `id` (accepté) : la flèche BC et sa somme AC sont sur la carte ; l'essai est retenu. */
export function attach(s, leg, id) {
  if (canAttach(s, leg, id) !== true) return s;
  const chain = chainOf(s, leg);
  return Object.freeze({ ...s, placed: chain, trials: Object.freeze([...s.trials, chain]), last: { kind: 'chain', chain } });
}

/** Un refus (queue posée en A ou sur une autre station) : retenu pour la lecture et pour la découverte. */
export function refuse(s, leg, id) {
  const reason = canAttach(s, leg, id);
  if (reason === true) return s;
  const r = Object.freeze({ leg, at: id, reason });
  return Object.freeze({ ...s, refusals: Object.freeze([...s.refusals, r]), last: { kind: 'refusal', refusal: r } });
}

// ── 'parallelogram' : le nageur et le courant ──────────────────────────────────

function initSwim({ swim = 4, current = 2, width = 60, theta = 0, thetaMin = -40, thetaMax = 80 } = {}) {
  const k = V.crossing({ swim, current });
  if (!k.possible) throw new Error('vectorSum: le courant doit être plus lent que le nageur');
  return Object.freeze({
    mode: 'parallelogram', swim: num(swim), current: num(current), width: num(width), crossing: k,
    theta, thetaMin, thetaMax, trials: Object.freeze([]), last: null,
  });
}

/**
 * Les trois vitesses DESSINÉES quand le nageur vise à θ° de (AB) vers l'amont (flottants : elles ne décident rien).
 * Repère : x vers l'AVAL (le sens du courant), y de A vers B. s = (−swim·sin θ ; swim·cos θ), c = (current ; 0), r = s + c.
 */
export function velocities(s, theta) {
  const sw = { x: -s.swim * T.sinDeg(theta), y: s.swim * T.cosDeg(theta) };
  const c = { x: s.current, y: 0 };
  const r = { x: sw.x + c.x, y: sw.y + c.y };
  return { s: sw, c, r, speed: Math.hypot(r.x, r.y) };
}

/** L'écart (en mètres, > 0 vers l'aval) entre le point d'arrivée et B, pour une rivière de `width` mètres. */
export function driftAt(s, theta) {
  const { r } = velocities(s, theta);
  return (s.width * r.x) / r.y;
}

/** Un départ : le nageur suit s + c ; le côté d'arrivée est décidé EXACTEMENT par vectors.crossingSide. */
export function launch(s, theta) {
  const t = Math.round(theta);
  const side = V.crossingSide({ swim: s.swim, current: s.current }, t);
  const drift = side === 'target' ? 0 : driftAt(s, t);
  const trial = Object.freeze({ theta: t, side, drift, driftText: T.roundTo(Math.abs(drift), 0), speedText: T.roundTo(velocities(s, t).speed, 2) });
  return Object.freeze({ ...s, theta: t, trials: Object.freeze([...s.trials, trial]), last: { kind: 'swim', trial } });
}

/**
 * « جرّب كل الإمكانيات » (mode nageur) : les directions à parcourir — la graduation de 5° de la réglette (pageStep),
 * plus l'angle exact s'il n'y tombait pas. Chacune est un départ ordinaire (`launch`).
 */
export function sweepThetas(s) {
  if (s.mode !== 'parallelogram') return [];
  const out = new Set();
  for (let t = Math.ceil(s.thetaMin / 5) * 5; t <= s.thetaMax; t += 5) out.add(t);
  if (s.crossing.angle != null && s.crossing.angle >= s.thetaMin && s.crossing.angle <= s.thetaMax) out.add(s.crossing.angle);
  return [...out].sort((a, b) => a - b);
}
/** Les directions de la balade pas encore essayées par l'élève. */
export const untriedThetas = (s) => sweepThetas(s).filter((t) => !s.trials.some((tr) => tr.theta === t));

/** Ce que le nageur sait quand il touche B : l'angle exact (30°) et la vitesse réelle exacte (2√3 ≈ 3,46 km/h). */
export function crossingResult(s) {
  const k = s.crossing;
  return Object.freeze({
    angle: k.angle, sinTex: `\\dfrac{${s.current}}{${s.swim}}`,
    speedTex: T.surdLatex(k.speed), speedText: T.roundTo(T.surdNumber(k.speed), 2),
  });
}

// ── commun ────────────────────────────────────────────────────────────────────

export function init(numbers = {}) {
  return numbers.mode === 'parallelogram' ? initSwim(numbers) : initChasles(numbers);
}

/**
 * La découverte s'ouvre sur un CONTRASTE (MANIPULATION_DNA §3.6) :
 *   chasles        un enchaînement qui tourne (AC plus court que AB + BC) ET le retour à la maison (AB + BA = 0) ;
 *   parallelogram  l'arrivée en B ET au moins un départ manqué (le plus souvent : droit sur B, emporté par le courant).
 */
export function discoveryReady(s) {
  if (s.mode === 'parallelogram') return s.trials.some((t) => t.side === 'target') && s.trials.some((t) => t.side !== 'target');
  return s.trials.some((t) => t.kind === 'turn') && s.trials.some((t) => t.kind === 'zero');
}

/** Les ÉTAPES de la scène (une par contraste) : chasles `turn` · `zero` ; nageur `target` · `miss` — celles que les essais ont déjà atteintes. */
export const STEP_KINDS = Object.freeze({ chasles: ['turn', 'zero'], parallelogram: ['target', 'miss'] });
export function reachedKinds(s) {
  if (s.mode === 'parallelogram') return STEP_KINDS.parallelogram.filter((kd) => s.trials.some((t) => (kd === 'target' ? t.side === 'target' : t.side !== 'target')));
  return STEP_KINDS.chasles.filter((kd) => s.trials.some((t) => t.kind === kd));
}
/** Le dernier essai d'un genre d'étape (pour construire les questions sur SES nombres). */
export const trialOfKind = (s, kd) => [...s.trials].reverse().find((t) => (s.mode === 'parallelogram' ? (kd === 'target' ? t.side === 'target' : t.side !== 'target') : t.kind === kd)) ?? null;
/** « أعِد التجربة » : efface les essais de CETTE étape (les autres restent) et remet la scène au départ. */
export function restartStep(s, kd) {
  const keep = s.trials.filter((t) => (s.mode === 'parallelogram' ? (kd === 'target' ? t.side !== 'target' : t.side === 'target') : t.kind !== kd));
  return Object.freeze({ ...s, trials: Object.freeze(keep), placed: null, theta: s.mode === 'parallelogram' ? 0 : s.theta, last: null });
}

/** Le dernier événement, en données plates pour `onTrial` (les modules listent les essais de l'élève). */
export function evidenceOf(s) {
  const last = s.last;
  if (!last) return null;
  if (s.mode === 'parallelogram') {
    const { theta, side, driftText, speedText } = last.trial;
    return { mode: 'parallelogram', theta, side, drift: driftText, speed: speedText };
  }
  if (last.kind === 'refusal') return { mode: 'chasles', kind: 'refusal', at: last.refusal.at, reason: last.refusal.reason };
  const c = last.chain;
  return {
    mode: 'chasles', kind: c.kind, head: c.kind === 'zero' ? 'A' : 'C',
    path: T.roundTo(T.surdNumber(c.AB) + T.surdNumber(c.BC), 2),
    straight: c.AC ? T.roundTo(T.surdNumber(c.AC), 2) : '0',
  };
}

/**
 * La mise en page de la carte (mode chasles) : un quadrillage de rues aux nœuds entiers qui contient toutes les stations
 * et toutes les arrivées possibles, à cases CARRÉES ; X, Y en pixels (y vers le bas).
 */
export function mapLayout(s, { width, height, pad = 18 }) {
  const pts = [...s.stations.map((st) => st.p), ...s.legs.map((v) => V.translate(s.B, v))].map(V.coords);
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 1; const x1 = Math.max(...xs) + 1;
  const y0 = Math.min(...ys) - 1; const y1 = Math.max(...ys) + 1;
  const k = Math.max(8, Math.min((width - 2 * pad) / (x1 - x0), (height - 2 * pad) / (y1 - y0)));
  const w = (x1 - x0) * k + 2 * pad; const h = (y1 - y0) * k + 2 * pad;
  return {
    k, width: w, height: h, x0, x1, y0, y1,
    X: (x) => pad + (x - x0) * k,
    Y: (y) => h - pad - (y - y0) * k,
  };
}
