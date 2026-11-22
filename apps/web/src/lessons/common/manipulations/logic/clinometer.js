/**
 * clinometer — LA LOGIQUE PURE du clinomètre du téléphone (unité 10 « حساب المثلثات في المثلث القائم », درس 4
 * « حل مشكلات وترييض وضعيات بتوظيف النسب المثلثية », réutilisé par « أدمج تعلّماتي » en mode `align`).
 * Aucune arithmétique trigonométrique ici : chaque angle et chaque longueur vient de
 * packages/core/arithmetic/trigonometry.js (`lengthPlan`, `ratioLinking`, `RATIO_SIDES`, `lengthByAngle`,
 * `anglePlan`, `roundTo`) et, pour l'alignement, de thales.js (`fourthProportional`) sur les fractions de linear.js.
 * Ce module dit seulement ce que la main a le droit de faire, ce qui est refusé et ce que l'écran doit montrer.
 *
 * TROIS MODES, une même démarche (la main tient une grandeur → un triangle rectangle apparaît → l'élève CHOISIT le
 * rapport qui lie le connu et l'inconnu → le calcul) :
 *
 *   height  le projecteur du stade (hauteur H cachée). La main tient la DISTANCE d (pas de 1 m, au sol) et
 *           l'INCLINAISON α du téléphone (pas de 1°). Le déclencheur « قِس » n'accepte que la visée juste :
 *           α = l'angle d'élévation arrondi au degré (sinon l'écart est écrit). Connu : d (côté ADJACENT à α),
 *           cherché : h (côté OPPOSÉ) → tan, multiplication : h = d × tan α (+ œil). Le plan, une fois trouvé,
 *           sert à chaque nouvelle mesure ; la hauteur trouvée est la MÊME de partout (à l'arrondi de α près).
 *   ladder  l'échelle des graffeurs (le تحدّ) : angle θ au sol FIXÉ (59°), marque du mur à hm (1,60 m). La main
 *           allonge l'échelle télescopique L (pas de 0,1 m) : son sommet arrive SOUS ou AU-DESSUS de la marque
 *           (jamais dessus pour 1,6 / 59°) ; l'élève encadre L, puis choisit : connu hm (OPPOSÉ), cherché L
 *           (HYPOTÉNUSE) → sin, division : L = hm ÷ sin θ ≈ 1,9.
 *   align   مقام الشهيد (synthèse) : un poteau de hauteur `pole` à `poleAt` du pied du monument ; la main fait
 *           glisser l'observateur à la distance d du poteau (pas de 0,05 m) jusqu'à ce que le sommet du poteau
 *           CACHE le sommet du monument (deux rayons confondus). `total` (si donné) fixe l'endroit de
 *           l'alignement à `total` du monument (manuel : 95,65 + 2,45 = 98,1) et donc H par Thalès ; sinon
 *           `height` donne H. Puis l'angle x : connus les deux côtés de l'angle droit (poteau OPPOSÉ, d ADJACENT)
 *           → tan x = pole ÷ d (manuel : x ≈ 43°, H ≈ 92,09 m).
 *
 * Toute grandeur tenue par la main est un INDICE entier sur une graduation (le moteur « étirer » ne connaît que des
 * entiers) ; `valueAt` le traduit en mètres ou en degrés.
 */
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

const { frac, parseNumber, add, sub, mul, div, cmp, isInteger, toNumber } = LIN;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(String(v)));
const num = (v) => toNumber(F(v));
const EPS = 1e-9;

export const MODES = Object.freeze(['height', 'ladder', 'align']);

/** Ce que chaque mode connaît et cherche, nommé RELATIVEMENT à l'angle du triangle (α, θ ou x). */
const ROLES = Object.freeze({
  height: Object.freeze({ known: 'adjacent', wanted: 'opposite' }),
  ladder: Object.freeze({ known: 'opposite', wanted: 'hypotenuse' }),
  // align : l'inconnue est l'ANGLE ; les deux côtés connus sont les côtés de l'angle droit.
  align: Object.freeze({ known: 'adjacent', wanted: 'opposite', angle: true }),
});

/** Le rapport juste et l'opération juste d'un mode (trigonometry.lengthPlan / ratioLinking). */
export function planFor(mode) {
  const r = ROLES[mode];
  if (r.angle) return Object.freeze({ ratio: TR.ratioLinking(r.known, r.wanted), op: 'inv' });
  return TR.lengthPlan({ known: r.known, wanted: r.wanted });
}

/** Le plus grand pas (parmi `steps`) qui met `target` sur la graduation, sinon le dernier. */
function gridStep(target, steps) {
  for (const s of steps) if (isInteger(div(target, s))) return s;
  return steps[steps.length - 1];
}

const roundIdx = (p, step) => Math.round(num(div(p, step)));

/** L'état initial d'un mode. */
export function init(raw = {}) {
  const mode = MODES.includes(raw.mode) ? raw.mode : 'height';
  const base = { mode, trials: Object.freeze([]), refusals: Object.freeze([]), ratio: null, op: null, pending: null, last: null };
  if (mode === 'height') {
    const H = F(raw.height ?? 24);
    const eye = F(raw.eye ?? 0);
    const dMin = Math.max(1, Math.round(num(raw.minDistance ?? 10)));
    const dMax = Math.max(dMin + 2, Math.round(num(raw.maxDistance ?? 40)));
    if (cmp(H, eye) <= 0) throw new Error('clinometer: height > eye');
    const out = {
      ...base, H, eye, rise: sub(H, eye),
      iMin: dMin, iMax: dMax, i: Math.min(dMax, dMin + 5),
      aMin: 5, aMax: 85, a: 20,
    };
    // Le départ n'est JAMAIS la bonne visée : si 20° était l'angle lu à cette distance, on décale d'un cran.
    while (out.a < out.aMax && out.a === readAngle(out)) out.a += 1;
    return Object.freeze(out);
  }
  if (mode === 'ladder') {
    const hm = F(raw.height ?? 1.6);
    const theta = num(raw.angle ?? 59);
    if (!(theta > 0 && theta < 90)) throw new Error('clinometer: 0 < angle < 90');
    const step = frac(1, 10);
    const Lstar = TR.lengthByAngle({ known: 'opposite', wanted: 'hypotenuse', length: hm, angle: theta });
    const iMin = Math.max(2, Math.floor(num(hm) * 10 * 0.6));
    const iMax = Math.ceil(Lstar * 10 * 1.5);
    // L'échelle commence AUSSI LONGUE QUE LA HAUTEUR de la marque : l'idée fausse « L = 1,6 » se voit d'emblée.
    const i = Math.min(iMax, Math.max(iMin, roundIdx(hm, step)));
    return Object.freeze({ ...base, hm, theta, step, Lstar, iMin, iMax, i });
  }
  // align
  const P = F(raw.pole ?? 2.3);
  const a = F(raw.poleAt ?? 95.65);
  let H; let dStar;
  if (raw.total != null) {
    const T = F(raw.total);
    dStar = sub(T, a);
    if (cmp(dStar, frac(0)) <= 0) throw new Error('clinometer: total > poleAt');
    H = TH.fourthProportional(dStar, T, P); // H / pole = total / d
  } else {
    H = F(raw.height ?? 92);
    if (cmp(H, P) <= 0) throw new Error('clinometer: height > pole');
    dStar = div(mul(P, a), sub(H, P)); // P (a + d) = H d
  }
  const step = gridStep(dStar, [frac(1, 20), frac(1, 10), frac(1, 100)]);
  const iStar = roundIdx(dStar, step);
  const iMin = Math.max(1, Math.round(iStar * 0.25));
  const iMax = Math.max(iStar + 4, Math.round(iStar * 2.4));
  const exact = isInteger(div(dStar, step));
  return Object.freeze({ ...base, P, a, H, dStar, step, iStar, iMin, iMax, exact, i: Math.min(iMax, Math.round(iStar * 1.8)) });
}

/* ── les grandeurs tenues par la main ─────────────────────────────────────── */

/** La valeur (fraction) de l'indice i : d en m (height), L en m (ladder), d en m (align). */
export function valueAt(s, i = s.i) {
  if (s.mode === 'height') return frac(i);
  return mul(s.step, frac(i));
}
const clampI = (s, i) => Math.min(s.iMax, Math.max(s.iMin, Math.round(i)));
const clampA = (s, a) => Math.min(s.aMax, Math.max(s.aMin, Math.round(a)));

/* ── height : la visée ───────────────────────────────────────────────────── */

/** L'angle d'élévation VRAI (degrés, flottant) du sommet depuis la distance d. */
const trueAngle = (s, i = s.i) => TR.anglePlan({ opposite: s.rise, adjacent: valueAt(s, i) }).angle;
/** Ce que l'appli affiche une fois visé : l'angle arrondi au degré (le manuel lit les angles au degré). */
export const readAngle = (s, i = s.i) => Number(TR.roundTo(trueAngle(s, i), 0));
/** L'écart (degrés) entre le sommet et le réticule : > 0 le sommet est AU-DESSUS du réticule. */
export const aimGap = (s, i = s.i, a = s.a) => trueAngle(s, i) - a;
export const aimed = (s, i = s.i, a = s.a) => s.mode === 'height' && a === readAngle(s, i);

/** La hauteur calculée par le plan (h = d × tan α + œil), α étant l'angle LU. */
export function heightAt(s, i, a) {
  const d = valueAt(s, i);
  return TR.lengthByAngle({ known: 'adjacent', wanted: 'opposite', length: d, angle: a }) + num(s.eye);
}

/* ── ladder : le sommet de l'échelle ─────────────────────────────────────── */

/** La hauteur atteinte par le sommet d'une échelle de longueur L à l'angle θ : L × sin θ. */
export const topAt = (s, i = s.i) => TR.lengthByAngle({ known: 'hypotenuse', wanted: 'opposite', length: valueAt(s, i), angle: s.theta });
/** Le pied de l'échelle (distance au mur) : L × cos θ. */
export const footAt = (s, i = s.i) => TR.lengthByAngle({ known: 'hypotenuse', wanted: 'adjacent', length: valueAt(s, i), angle: s.theta });
export function topKind(s, i = s.i) {
  const g = topAt(s, i) - num(s.hm);
  return Math.abs(g) < EPS ? 'exact' : g < 0 ? 'below' : 'above';
}
/** L'encadrement trouvé à la main : deux longueurs voisines, l'une sous la marque, l'autre au-dessus (ou un arrêt exact). */
export function bracket(s) {
  const exact = s.trials.find((t) => t.kind === 'exact');
  if (exact) return Object.freeze({ lo: exact.i, hi: exact.i });
  const below = new Set(s.trials.filter((t) => t.kind === 'below').map((t) => t.i));
  const hit = s.trials.find((t) => t.kind === 'above' && below.has(t.i - 1));
  return hit ? Object.freeze({ lo: hit.i - 1, hi: hit.i }) : null;
}

/* ── align : le sommet du poteau et celui du monument ────────────────────── */

/**
 * Où passe le rayon (œil au sol → sommet du poteau) par rapport au sommet du monument, exactement :
 * P (a + d) > H d ⇔ le sommet du poteau est vu PLUS HAUT (trop près) ; < ⇔ plus bas (trop loin).
 */
export function alignKind(s, i = s.i) {
  if (!s.exact) return i === s.iStar ? 'aligned' : i < s.iStar ? 'over' : 'under';
  const d = valueAt(s, i);
  const c = cmp(mul(s.P, add(s.a, d)), mul(s.H, d));
  return c === 0 ? 'aligned' : c > 0 ? 'over' : 'under';
}
/** L'angle sous lequel on voit un sommet (degrés, flottant) : celui du poteau, celui du monument. */
export const poleAngle = (s, i = s.i) => TR.anglePlan({ opposite: s.P, adjacent: valueAt(s, i) }).angle;
export const monumentAngle = (s, i = s.i) => TR.anglePlan({ opposite: s.H, adjacent: add(s.a, valueAt(s, i)) }).angle;
/** L'angle x de l'alignement (tan x = pole ÷ d), arrondi au degré comme le demande le manuel. */
const angleX = (s, i = s.iStar) => TR.roundTo(poleAngle(s, i), 0);

/* ── les gestes ─────────────────────────────────────────────────────────── */

const push = (list, item) => Object.freeze([...list, Object.freeze(item)]);
const planDone = (s) => s.ratio != null && (s.mode === 'align' || s.op != null);

/** Déplacer la grandeur principale (relâchement, touche, bouton) : d, L ou d. */
export function moveTo(s, i0) {
  const i = clampI(s, i0);
  if (s.mode === 'height') return Object.freeze({ ...s, i, last: Object.freeze({ kind: 'move' }) });
  if (s.mode === 'ladder') {
    const kind = topKind(s, i);
    const prev = s.trials.at(-1);
    const trials = prev && prev.i === i ? s.trials : push(s.trials, { i, L: valueAt(s, i), top: topAt(s, i), kind });
    return Object.freeze({ ...s, i, trials, last: Object.freeze({ kind: 'ladder', i, top: topAt(s, i), what: kind }) });
  }
  const kind = alignKind(s, i);
  const prev = s.trials.at(-1);
  const trials = prev && prev.i === i ? s.trials : push(s.trials, { i, d: valueAt(s, i), kind });
  return Object.freeze({ ...s, i, trials, last: Object.freeze({ kind: 'align', i, what: kind }) });
}

/** Incliner le téléphone (height) : la visée suit, aucun essai tant que le déclencheur n'est pas pressé. */
export function tiltTo(s, a0) {
  if (s.mode !== 'height') return s;
  return Object.freeze({ ...s, a: clampA(s, a0), last: Object.freeze({ kind: 'tilt' }) });
}

/** Le déclencheur « قِس » (height) : refusé hors visée (écart écrit) ; une visée juste est une LECTURE. */
export function shoot(s) {
  if (s.mode !== 'height') return s;
  if (!aimed(s)) {
    const gap = aimGap(s);
    const trial = { i: s.i, d: valueAt(s, s.i), a: s.a, kind: 'miss', gap };
    return Object.freeze({ ...s, trials: push(s.trials, trial), last: Object.freeze({ kind: 'miss', gap, read: readAngle(s) }) });
  }
  const reading = Object.freeze({ i: s.i, a: s.a });
  if (!planDone(s)) return Object.freeze({ ...s, pending: reading, last: Object.freeze({ kind: 'aimed' }) });
  return record(s, reading);
}

function record(s, reading) {
  const h = heightAt(s, reading.i, reading.a);
  const trial = { i: reading.i, d: valueAt(s, reading.i), a: reading.a, kind: 'measure', h };
  return Object.freeze({ ...s, pending: null, trials: push(s.trials, trial), last: Object.freeze({ kind: 'measure', h }) });
}

/** Le plan est-il ouvert (le triangle est là, il faut choisir) ? */
export function planOpen(s) {
  if (planDone(s)) return false;
  if (s.mode === 'height') return s.pending != null;
  if (s.mode === 'ladder') return bracket(s) != null;
  return s.trials.some((t) => t.kind === 'aligned') && s.i === s.iStar;
}
export { planDone };

/**
 * Le côté qu'un rapport demanderait et qu'on n'a pas (la raison d'un refus) : pour une longueur, le rapport doit
 * contenir le côté connu ET le côté cherché ; pour un angle, les deux côtés connus.
 */
export function ratioVerdict(mode, ratio) {
  const r = ROLES[mode];
  const { num: n, den: d } = TR.RATIO_SIDES[ratio];
  const have = r.angle ? [r.known, r.wanted] : [r.known, r.wanted];
  const sides = [n, d];
  const right = planFor(mode).ratio === ratio;
  if (right) return Object.freeze({ ok: true });
  const needs = sides.find((x) => !have.includes(x)) ?? null;
  const lacks = r.angle ? null : sides.includes(r.wanted) ? (sides.includes(r.known) ? null : r.known) : r.wanted;
  return Object.freeze({ ok: false, needs, lacks });
}

/** Choisir le rapport : le juste avance, un autre est refusé et dit quel côté il demanderait. */
export function chooseRatio(s, ratio) {
  if (!planOpen(s) || s.ratio != null || !TR.RATIOS.includes(ratio)) return s;
  const v = ratioVerdict(s.mode, ratio);
  if (!v.ok) {
    return Object.freeze({ ...s, refusals: push(s.refusals, { kind: 'ratio', ratio, ...v }), last: Object.freeze({ kind: 'refuseRatio', ratio, ...v }) });
  }
  const next = Object.freeze({ ...s, ratio, last: Object.freeze({ kind: 'ratio', ratio }) });
  return next;
}

/** La valeur que donnerait la MAUVAISE opération (le refus la dessine) : d ÷ tan α, hm × sin θ. */
export function wrongOpValue(s) {
  if (s.mode === 'height') {
    const r = s.pending ?? { i: s.i, a: s.a };
    return TR.lengthByAngle({ known: 'opposite', wanted: 'adjacent', length: valueAt(s, r.i), angle: r.a }) + num(s.eye);
  }
  if (s.mode === 'ladder') return TR.lengthByAngle({ known: 'hypotenuse', wanted: 'opposite', length: s.hm, angle: s.theta });
  return null;
}

/** Choisir l'opération (longueurs) : × ou ÷. La mauvaise est refusée avec ce qu'elle donnerait. */
export function chooseOp(s, op) {
  if (s.mode === 'align' || s.ratio == null || s.op != null || !['mul', 'div'].includes(op)) return s;
  if (op !== planFor(s.mode).op) {
    const value = wrongOpValue(s);
    return Object.freeze({ ...s, refusals: push(s.refusals, { kind: 'op', op, value }), last: Object.freeze({ kind: 'refuseOp', op, value }) });
  }
  const next = Object.freeze({ ...s, op, last: Object.freeze({ kind: 'op', op }) });
  if (s.mode === 'height' && s.pending) return record(next, s.pending);
  if (s.mode === 'ladder') return Object.freeze({ ...next, last: Object.freeze({ kind: 'ladderResult', L: s.Lstar }) });
  return next;
}

/** Le résultat écrit du plan : la longueur de l'échelle (au dixième), l'angle x et H (synthèse). */
export function result(s) {
  if (!planDone(s)) return null;
  if (s.mode === 'ladder') return Object.freeze({ L: s.Lstar, L10: TR.roundTo(s.Lstar, 1), L100: TR.roundTo(s.Lstar, 2) });
  if (s.mode === 'align') return Object.freeze({ x: angleX(s), xExact: poleAngle(s, s.iStar), H: s.H, H100: TR.roundTo(num(s.H), 2), H1: TR.roundTo(num(s.H), 0) });
  const m = s.trials.filter((t) => t.kind === 'measure');
  return m.length ? Object.freeze({ h: m.at(-1).h, h10: TR.roundTo(m.at(-1).h, 1) }) : null;
}

/** Les mesures validées (height) : distances distinctes, hauteurs calculées. */
export const measures = (s) => s.trials.filter((t) => t.kind === 'measure');

/**
 * La découverte s'ouvre sur un CONTRASTE :
 *   height  deux mesures depuis deux distances écartées d'au moins 5 m (deux angles différents, une même hauteur) ;
 *   ladder  l'encadrement à la main ET le calcul (L entre les deux essais voisins) ;
 *   align   l'alignement ET une position ratée ET l'angle x choisi par le bon rapport.
 */
export function discoveryReady(s) {
  if (s.mode === 'height') {
    const ds = measures(s).map((t) => num(t.d));
    return ds.length >= 2 && Math.max(...ds) - Math.min(...ds) >= 5;
  }
  if (s.mode === 'ladder') return bracket(s) != null && planDone(s);
  return planDone(s) && s.trials.some((t) => t.kind === 'aligned') && s.trials.some((t) => t.kind !== 'aligned');
}

/* ── écritures ──────────────────────────────────────────────────────────── */

/** « 2,45 », « 15 », « 1,6 » (fractions finies) ; un flottant au centième. */
export const dec = (p) => (typeof p === 'number' ? TR.roundTo(p, 2).replace(/,?0+$/, '') : TH.thalesText(p, 3));
export const tex = (p) => dec(p).replace(',', '{,}');
/** Un flottant écrit au dixième / au centième (virgule) et son LaTeX. */
export const r1 = (x) => TR.roundTo(x, 1);
export const r2 = (x) => TR.roundTo(x, 2);
export const texOf = (s) => String(s).replace(',', '{,}');

/** La preuve envoyée à la leçon (`onTrial`) : le dernier geste, en nombres lisibles (chaînes à virgule). */
export function evidenceOf(s) {
  const l = s.last;
  if (!l) return null;
  const t = s.trials.at(-1);
  switch (l.kind) {
    case 'miss': return { mode: s.mode, stage: 'miss', d: dec(t.d), alpha: t.a, gap: r1(Math.abs(l.gap)), above: l.gap > 0 };
    case 'measure': return { mode: s.mode, stage: 'measure', d: dec(t.d), alpha: t.a, h: r1(t.h) };
    case 'ladder': return { mode: s.mode, stage: 'ladder', L: dec(valueAt(s, l.i)), top: r2(l.top), kind: l.what, hm: dec(s.hm) };
    case 'ladderResult': return { mode: s.mode, stage: 'result', L: r1(s.Lstar), L100: r2(s.Lstar) };
    case 'align': return { mode: s.mode, stage: 'align', d: dec(valueAt(s, l.i)), kind: l.what };
    case 'ratio': return s.mode === 'align' ? { mode: s.mode, stage: 'angle', x: angleX(s), H: TR.roundTo(num(s.H), 2) } : { mode: s.mode, stage: 'ratio', ratio: l.ratio };
    case 'refuseRatio': return { mode: s.mode, stage: 'refusal', ratio: l.ratio, needs: l.needs };
    case 'refuseOp': return { mode: s.mode, stage: 'refusal', op: l.op, value: r2(l.value) };
    default: return null;
  }
}

/** Le nombre d'événements qui méritent un rapport à la leçon (essais + refus + choix). */
export const eventCount = (s) => s.trials.length + s.refusals.length + (s.ratio ? 1 : 0) + (s.op ? 1 : 0);

/* ── la géométrie des scènes (pixels, y vers le bas ; pure, testée) ─────────── */

/**
 * height : le mât à gauche (x = 0 m), le téléphone à d ; l'échelle tient la largeur ET la hauteur.
 * ladder : le mur à gauche, l'échelle à l'angle θ ; la graduation du mur en mètres.
 * align  : le panorama (vrai rapport) et le zoom sur le poteau et l'observateur.
 */
export function layout(s, { width, height, pad = 16, top = 18, bottom = 30 }) {
  let spanX; let spanY; let x0m = 0;
  if (s.mode === 'height') { spanX = s.iMax + 3; spanY = num(s.H) * 1.14; x0m = 1.5; }
  else if (s.mode === 'ladder') {
    const Lmax = num(valueAt(s, s.iMax));
    spanX = Lmax * Math.cos((s.theta * Math.PI) / 180) + 1.4; spanY = Math.max(num(s.hm) * 1.35, Lmax * Math.sin((s.theta * Math.PI) / 180) * 1.08); x0m = 0.9;
  } else { spanX = num(s.a) + num(valueAt(s, s.iMax)) + 6; spanY = num(s.H) * 1.12; x0m = num(s.H) * 0.27; }
  const k = Math.max(2, Math.min((width - 2 * pad) / (spanX + x0m), (height - top - bottom) / spanY));
  const x0 = pad + x0m * k;
  const yGround = top + spanY * k;
  const X = (m) => x0 + m * k;
  const Y = (m) => yGround - m * k;
  return { k, x0, yGround, X, Y, width: Math.min(width, Math.ceil(x0 + spanX * k + pad)), height: Math.ceil(yGround + bottom) };
}

/** Le zoom de l'alignement : le poteau à gauche, l'observateur à d, assez grand pour viser au centimètre près. */
export function zoomLayout(s, { width, height, pad = 14, top = 12, bottom = 26 }) {
  const spanX = num(valueAt(s, s.iMax)) + 0.8;
  const spanY = num(s.P) * 1.35;
  const k = Math.max(8, Math.min((width - 2 * pad) / (spanX + 0.5), (height - top - bottom) / spanY));
  const x0 = pad + 0.5 * k;
  const yGround = top + spanY * k;
  return { k, x0, yGround, X: (m) => x0 + m * k, Y: (m) => yGround - m * k, width: Math.min(width, Math.ceil(x0 + spanX * k + pad)), height: Math.ceil(yGround + bottom) };
}

/* ── « جرّب كل الإمكانيات » : ladder (toutes les longueurs) et align (toutes les places) ───────────── */

/**
 * Les valeurs de la grandeur tenue par la main qu'il reste à essayer. `height` n'en a pas : sa main est une VISÉE
 * (d et α doivent s'accorder), donc un choix de l'élève, pas un balayage. En `align`, la bonne place (iStar) est
 * jouée EN DERNIER pour que l'observateur s'y retrouve (le plan s'ouvre seulement sur l'alignement).
 */
export function tryAllPlan(s) {
  if (s.mode === 'height') return [];
  const tried = new Set(s.trials.map((t) => t.i));
  const plan = [];
  for (let i = s.iMin; i <= s.iMax; i += 1) if (!tried.has(i) && !(s.mode === 'align' && i === s.iStar)) plan.push(i);
  if (s.mode === 'align' && !(s.i === s.iStar && tried.has(s.iStar))) plan.push(s.iStar);
  return plan;
}
/** Joue UN essai : exactement `moveTo` ; revenir sur une place déjà essayée ne réécrit pas d'essai. */
export function tryAllApply(s, i) {
  if (s.trials.some((t) => t.i === i)) {
    return Object.freeze({ ...s, i, last: Object.freeze({ kind: s.mode === 'ladder' ? 'ladder' : 'align', i, ...(s.mode === 'ladder' ? { top: topAt(s, i), what: topKind(s, i) } : { what: alignKind(s, i) }) }) });
  }
  return moveTo(s, i);
}
