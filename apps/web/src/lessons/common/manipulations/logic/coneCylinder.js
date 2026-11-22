/**
 * cone-cylinder — LA LOGIQUE PURE du cylindre dans le cône (unité 9 « خاصية طالس », « أدمج تعلّماتي » p. 112).
 * Aucune arithmétique ici : chaque rayon permis, chaque volume vient de packages/core/arithmetic/thales.js
 * (`cylinderInCone` : `radiusFor`, `volumeOverPi`) sur les fractions de linear.js.
 *
 * LA COUPE AXIALE (le cône couché comme dans le manuel : la base à gauche, le sommet O à droite) :
 *   le cône      hauteur H (18), rayon de base R (6) ; sa génératrice va du bord de la base à O
 *   le cylindre  posé sur la base du cône, même axe ; sa longueur h et son rayon r sont TENUS PAR LA MAIN,
 *                chacun par sa poignée (h sur l'axe, r sur la face libre)
 *   la règle     au point d'abscisse h, le cône a le rayon radiusFor(h) = R (H − h) ÷ H (Thalès au sommet O) :
 *                r > radiusFor(h) → le cylindre PERCE le cône : REFUSÉ, la poignée revient ;
 *                r < radiusFor(h) → le bord ne touche pas : un jeu reste, le cylindre n'est pas « محاطة » ;
 *                r = radiusFor(h) → le bord est SUR la génératrice : le cylindre est inscrit.
 *
 * Les graduations : h par pas H ÷ n, r par pas R ÷ n, avec n choisi pour que (a) les deux pas s'écrivent en
 * décimal court et (b) le cylindre h = r tombe sur une graduation — ainsi chaque cylindre inscrit a ses deux
 * dimensions sur la règle (au cran i de h, le bord permis est au cran n − i de r : la génératrice).
 */
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';

const { frac, parseNumber, add, sub, mul, div, cmp, eq, isInteger, fracDecimal, toNumber } = LIN;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

/** Le nombre n de graduations (24 au plus) : pas décimaux courts, et h = r sur la règle. */
function divisionsFor(H, R) {
  for (let n = 24; n >= 6; n -= 1) {
    const ok = fracDecimal(div(H, n), 2) != null && fracDecimal(div(R, n), 2) != null && isInteger(div(mul(R, n), add(H, R)));
    if (ok) return n;
  }
  throw new Error('coneCylinder: aucune graduation ne met h = r sur la règle');
}

/** L'état initial : un cylindre court et maigre, à l'intérieur, qui ne touche pas (rien n'est donné). */
export function init({ H = 18, R = 6 } = {}) {
  const HH = F(H); const RR = F(R);
  const cone = TH.cylinderInCone({ H: HH, R: RR });
  const n = divisionsFor(HH, RR);
  const hIdx = Math.round(n / 2);
  const rIdx = Math.max(1, Math.round(n / 6));
  return Object.freeze({
    H: HH, R: RR, cone, n, hStep: div(HH, n), rStep: div(RR, n),
    hIdx, rIdx, trials: Object.freeze([]), refusals: 0, last: null,
  });
}

export const hOf = (s, i = s.hIdx) => mul(s.hStep, i);
export const rOf = (s, j = s.rIdx) => mul(s.rStep, j);
/** Le rayon permis à la longueur h : le cône au point d'abscisse h. */
export const rMaxAt = (s, i = s.hIdx) => s.cone.radiusFor(hOf(s, i));
/** Le cran de r où le bord touche la génératrice, pour le cran i de h. */
export const touchIndex = (s, i = s.hIdx) => toNumber(div(rMaxAt(s, i), s.rStep));

/** Ce qu'on VOIT pour un couple de crans (pendant le geste aussi) : perce, touche, ou laisse un jeu. */
export function probe(s, hIdx = s.hIdx, rIdx = s.rIdx) {
  const h = hOf(s, hIdx); const r = rOf(s, rIdx);
  const rMax = rMaxAt(s, hIdx);
  const c = cmp(r, rMax);
  const vop = s.cone.volumeOverPi(r, h);
  return Object.freeze({
    hIdx, rIdx, h, r, rMax,
    pierce: c > 0, inscribed: c === 0, gap: sub(rMax, r),
    square: c === 0 && eq(h, r),
    vop,
  });
}

const clamp = (s, i) => Math.min(s.n - 1, Math.max(1, Math.round(i)));

function record(s, st, kind) {
  const trial = Object.freeze({ h: st.h, r: st.r, inscribed: st.inscribed, square: st.square, vop: st.vop });
  const prev = s.trials.at(-1);
  const same = prev && eq(prev.h, trial.h) && eq(prev.r, trial.r);
  return Object.freeze({
    ...s, hIdx: st.hIdx, rIdx: st.rIdx,
    trials: same ? s.trials : Object.freeze([...s.trials, trial]),
    last: Object.freeze({ kind, state: st }),
  });
}

/** Allonger / raccourcir le cylindre (poignée sur l'axe) : refusé si, à cette longueur, son bord perce le cône. */
export function setH(s, i0) {
  const st = probe(s, clamp(s, i0), s.rIdx);
  if (st.pierce) {
    return Object.freeze({ ...s, refusals: s.refusals + 1, last: Object.freeze({ kind: 'pierceH', state: st }) });
  }
  return record(s, st, 'h');
}

/** Gonfler / dégonfler le cylindre (poignée sur la face) : refusé au-delà de la génératrice. */
export function setR(s, j0) {
  const st = probe(s, s.hIdx, clamp(s, j0));
  if (st.pierce) {
    return Object.freeze({ ...s, refusals: s.refusals + 1, last: Object.freeze({ kind: 'pierceR', state: st }) });
  }
  return record(s, st, 'r');
}

export const status = (s) => probe(s);
export const inscribedTrials = (s) => s.trials.filter((t) => t.inscribed);

/**
 * La découverte : au moins DEUX cylindres inscrits de longueurs différentes (une relation se voit entre deux
 * cas au moins), et un CONTRASTE — un cylindre refusé (il perçait) ou un cylindre qui laissait un jeu.
 */
export function discoveryReady(s) {
  const hs = new Set(inscribedTrials(s).map((t) => LIN.fracText(t.h)));
  return hs.size >= 2 && (s.refusals > 0 || s.trials.some((t) => !t.inscribed));
}

/* ── les ÉTAPES du labo (questions pendant le labo, lot 4) ────────────────────────────────────────── */

export const STEPS = Object.freeze(['first', 'second']);

/** Étape 1 : un premier cylindre INSCRIT ; étape 2 : le contraste complet de la découverte (deux inscrits de longueurs différentes + un refus ou un jeu). */
export function stepReached(s, step) {
  return step === 'first' ? inscribedTrials(s).length >= 1 : discoveryReady(s);
}

/** La même étape repart : le cylindre revient au départ ; l'étape 2 garde le 1er cylindre inscrit (acquis de l'étape 1). */
export function retryStage(s, step) {
  const fresh = init({ H: s.H, R: s.R });
  if (step === 'first') return fresh;
  const first = inscribedTrials(s)[0];
  return Object.freeze({ ...fresh, trials: Object.freeze(first ? [first] : []) });
}

/** Le cylindre cherché par la وضعية : inscrit ET h = r (sa demi-coupe est un carré). */
export const goalFound = (s) => s.trials.some((t) => t.square);

/** π r² h ≈ … (au centième, virgule) — seule approximation, celle que le manuel demande. */
export function volumeApprox(vop, digits = 2) {
  const x = toNumber(vop) * Math.PI;
  return (Math.round(x * 10 ** digits) / 10 ** digits).toFixed(digits).replace('.', ',');
}

/** La relation (pour un cylindre inscrit) : r ÷ R et (H − h) ÷ H, égaux. */
export const ratios = (s, h, r) => ({ left: div(r, s.R), right: div(sub(s.H, h), s.H) });

/** Les écritures : « 4,5 », « 91,125 » ; LaTeX « 4{,}5 », « \dfrac{10}{3} ». */
export const dec = (p) => TH.thalesText(p, 3);
export const tex = (p) => TH.thalesLatex(p, 3);

/** La preuve envoyée à la leçon (`onTrial`) : le cylindre posé, ou le refus. */
export function evidenceOf(s) {
  const l = s.last;
  if (!l) return null;
  const st = l.state;
  return {
    kind: l.kind, h: dec(st.h), r: dec(st.r), inscribed: st.inscribed, pierce: st.pierce, square: st.square,
    vop: dec(st.vop), approx: volumeApprox(st.vop),
  };
}

/**
 * La géométrie de la coupe, en pixels (pure, testée) : base du cône à gauche (abscisse 0), sommet O à droite
 * (abscisse H), axe horizontal au milieu ; l'échelle tient la largeur et la hauteur données.
 */
export function layout(s, { width, height, padX = 28, padY = 22 }) {
  const Hn = toNumber(s.H); const Rn = toNumber(s.R);
  const k = Math.max(3, Math.min((width - 2 * padX) / (Hn + 0.2 * Rn), (height - 2 * padY) / (2 * Rn)));
  const x0 = padX + 0.2 * Rn * k; // la place de l'ellipse de la base
  const yAxis = padY + Rn * k;
  return {
    k, x0, yAxis,
    X: (m) => x0 + toNumber(F(m)) * k,
    Y: (m) => yAxis - toNumber(F(m)) * k,
    width: x0 + Hn * k + padX,
    height: yAxis + Rn * k + padY,
  };
}

/* ══════════════ LE LECTEUR DE MISSION (la synthèse de l'unité 9, 2026-11-10 — conseil C, verdict) ══════════════
 *
 * Dans le lecteur, le cylindre se RÈGLE librement (h et r, aucun verdict pendant le geste, aucun nombre dans un verdict) et se JUGE quand
 * l'élève appuie sur « أدخِل الأسطوانة » : il touche (sa حافة sur le jarret du cône), il laisse un jeu, ou il perce (refusé, hachures ✗).
 * Un ESSAI = un appui ; le même (h ; r) deux fois n'est pas un essai ; le premier refus peut être GRATUIT (`freeFirstRefusal` : refuser fait
 * partie de la découverte). Le nombre de crans `n` est EXPLICITE (jamais `divisionsFor` : h = r ne doit PAS tomber sur la règle). Une manche
 * peut fixer h (`lockH`, une valeur) ou r (`lockR`, une liste de valeurs : la suivante dès que la précédente touche) — la tâche inverse.
 */
const fz = Object.freeze;
const idxOf = (step, v, n, what) => {
  const i = div(F(v), step);
  if (!isInteger(i) || toNumber(i) < 1 || toNumber(i) > n - 1) throw new Error(`coneCylinder: ${what} = ${v} n'est pas sur la règle`);
  return toNumber(i);
};

/** L'état initial du lecteur : { H, R, n, lockH?, lockR?, start?: { h, r }, freeFirstRefusal? }. */
export function initPlayer({ H = 25, R = 15, n, lockH = null, lockR = null, start = null, freeFirstRefusal = false } = {}) {
  const HH = F(H); const RR = F(R);
  if (!Number.isInteger(n) || n < 3) throw new Error('coneCylinder: le lecteur demande un nombre de crans `n` explicite (≥ 3)');
  const hStep = div(HH, n); const rStep = div(RR, n);
  if (fracDecimal(hStep, 2) == null || fracDecimal(rStep, 2) == null) throw new Error(`coneCylinder: pas non décimaux pour H = ${H}, R = ${R}, n = ${n}`);
  const base = { H: HH, R: RR, cone: TH.cylinderInCone({ H: HH, R: RR }), n, hStep, rStep };
  const lh = lockH == null ? null : idxOf(hStep, lockH, n, 'h');
  const lr = lockR == null ? null : fz((Array.isArray(lockR) ? lockR : [lockR]).map((v) => idxOf(rStep, v, n, 'r')));
  const hIdx = lh ?? (start?.h != null ? idxOf(hStep, start.h, n, 'h') : Math.ceil(n / 2));
  const rIdx = lr ? lr[0] : (start?.r != null ? idxOf(rStep, start.r, n, 'r') : 1);
  return fz({
    ...base, hIdx, rIdx, lockH: lh, lockR: lr, freeFirstRefusal: Boolean(freeFirstRefusal),
    trials: fz([]), refusals: 0, last: null, movedH: false, movedR: false,
  });
}

/** Le cran de r que la manche impose maintenant (`lockR`) : le premier pas encore inscrit, sinon le dernier ; null sans verrou. */
function lockedR(lab) {
  if (!lab.lockR) return null;
  const done = (j) => lab.trials.some((t) => t.rIdx === j && t.inscribed);
  return lab.lockR.find((j) => !done(j)) ?? lab.lockR[lab.lockR.length - 1];
}

/** Régler le cylindre (aucun jugement) : les crans sont bornés à 1 … n − 1, un verrou garde sa valeur. */
export function moveTo(lab, { hIdx = lab.hIdx, rIdx = lab.rIdx } = {}) {
  const c = (i) => Math.min(lab.n - 1, Math.max(1, Math.round(i)));
  const h = lab.lockH ?? c(hIdx);
  const r = lab.lockR ? lockedR(lab) : c(rIdx);
  if (h === lab.hIdx && r === lab.rIdx) return lab;
  return fz({ ...lab, hIdx: h, rIdx: r, movedH: lab.movedH || h !== lab.hIdx, movedR: lab.movedR || r !== lab.rIdx, last: fz({ kind: 'move' }) });
}

/** Le verdict d'un couple de crans : 'inscribed' | 'gap' | 'pierce'. */
export const verdictKind = (lab, hIdx = lab.hIdx, rIdx = lab.rIdx) => { const p = probe(lab, hIdx, rIdx); return p.pierce ? 'pierce' : p.inscribed ? 'inscribed' : 'gap'; };
/** Le cylindre à l'écran a-t-il changé depuis le dernier appui ? (le guide montre alors le bouton) */
// comparé au DERNIER APPUI (pas au dernier essai) : un cylindre déjà essayé et repressé montre son verdict « جرّبتها » (revue 2026-11-10)
export const isDirty = (lab) => { const l = lab.last; return !(l?.kind === 'press' && l.hIdx === lab.hIdx && l.rIdx === lab.rIdx); };

/**
 * APPUYER sur « أدخِل الأسطوانة » : le cylindre est jugé. `last` : { kind: 'press', verdict, repeat, free, hIdx, rIdx }. Un couple déjà
 * essayé n'est pas un nouvel essai (`repeat`) ; le PREMIER refus est gratuit quand la manche le dit. Inscrit sous un verrou de r : r passe à
 * la valeur suivante au prochain réglage (la manche ⭐ en demande deux).
 */
export function press(lab) {
  const verdict = verdictKind(lab);
  const repeat = lab.trials.some((t) => t.hIdx === lab.hIdx && t.rIdx === lab.rIdx);
  const st = probe(lab);
  const free = !repeat && verdict === 'pierce' && lab.freeFirstRefusal && lab.refusals === 0;
  const trial = fz({ hIdx: lab.hIdx, rIdx: lab.rIdx, h: st.h, r: st.r, inscribed: st.inscribed, pierce: st.pierce, square: st.square, verdict });
  const next = fz({
    ...lab,
    trials: repeat ? lab.trials : fz([...lab.trials, trial]),
    refusals: lab.refusals + (!repeat && verdict === 'pierce' ? 1 : 0),
    last: fz({ kind: 'press', verdict, repeat, free, hIdx: lab.hIdx, rIdx: lab.rIdx }),
  });
  // sous un verrou de r, la valeur suivante vient au PROCHAIN réglage (`moveTo` lit `lockedR`) : le verdict de cet appui reste à l'écran
  return next;
}

/** Ce que la manche reçoit (`onVerdict`) d'un appui NOUVEAU : { groups: le cran de h, exact: il touche, free? }. */
export function verdictOfPress(lab) {
  const l = lab.last;
  if (l?.kind !== 'press' || l.repeat) return null;
  return fz({ groups: l.hIdx, exact: l.verdict === 'inscribed', ...(l.free ? { free: true } : {}) });
}

/** Les lignes du journal « 📋 جدول تجاربك » : # · h · r · le verdict · r/R et (H − h)/H en nombres (après la question `sec`). */
export function journalPlayer(lab, { ratios = false } = {}) {
  return lab.trials.map((t, i) => fz({
    i: i + 1, h: dec(t.h), r: dec(t.r), verdict: t.verdict,
    rr: ratios && t.inscribed ? `${dec(t.r)}/${dec(lab.R)}` : null,
    hh: ratios && t.inscribed ? `${dec(sub(lab.H, t.h))}/${dec(lab.H)}` : null,
  }));
}

/** Le premier cylindre inscrit (la question `sec` porte sur lui), ou null. */
export const firstInscribed = (lab) => lab.trials.find((t) => t.inscribed) ?? null;
/** Le cylindre inscrit au cran `hIdx` (la construction de r2 porte sur lui), ou null. */
export const inscribedAt = (lab, hIdx) => lab.trials.find((t) => t.inscribed && t.hIdx === hIdx) ?? null;

/** Les trois pastilles d'une question `sec` : r/R, (H − h)/H et le leurre h/H — non réduits (« 9/15 »), ordre tourné par la graine. */
export function secOptions(lab, t) {
  const rr = `${dec(t.r)}/${dec(lab.R)}`;
  const hh = `${dec(sub(lab.H, t.h))}/${dec(lab.H)}`;
  const decoy = `${dec(t.h)}/${dec(lab.H)}`;
  const xs = [rr, hh, decoy];
  const k = (t.hIdx + lab.n) % 3;
  return fz({ rr, hh, decoy, options: fz(xs.map((_, i) => xs[(i + k) % 3])) });
}

/** La construction numérique de r2 : « r/R = □/□ » au cran `hIdx` — tuiles r, R, H − h, H et le leurre h. */
export function buildOf(lab, hIdx) {
  const h = hOf(lab, hIdx); const r = rMaxAt(lab, hIdx);
  const vals = { r: dec(r), R: dec(lab.R), OT: dec(sub(lab.H, h)), H: dec(lab.H), h: dec(h) };
  return fz({ ...vals, expected: fz([vals.r, vals.R, vals.OT, vals.H]), tiles: fz([vals.r, vals.R, vals.OT, vals.H, vals.h]) });
}

/** Les PRÉDICTIONS (calculées) : 'part' — « au cran 1 (h = H/n), r vaut-il R/n ? » ; 'double' — de h au cran 1 au cran 2, r devient … */
export function predictTruthPlayer(lab, key) {
  const r1 = rMaxAt(lab, 1); const r2 = rMaxAt(lab, 2);
  if (key === 'part') return eq(r1, div(lab.R, lab.n)) ? 'yes' : 'no';
  if (key === 'double') { const c = cmp(r2, div(r1, 2)); return c > 0 ? 'more' : c === 0 ? 'half' : 'less'; }
  return null;
}
export const predictOptionsPlayer = (key) => (key === 'part' ? ['yes', 'no'] : key === 'double' ? ['less', 'half', 'more'] : []);
/** Une prédiction est JUGÉE quand ce qu'elle annonce est à l'écran : le cylindre inscrit au cran 1 (et au cran 2 pour 'double'). */
export const predictJudgedPlayer = (lab, key) => Boolean(inscribedAt(lab, 1) && (key !== 'double' || inscribedAt(lab, 2)));

/** La découverte du lecteur : deux cylindres inscrits de longueurs différentes et un contraste (un refus ou un jeu). */
export const discoveredPlayer = (lab) => discoveryReady(lab);

/**
 * Le GUIDE (LabCoach) du lecteur — jamais un cran, jamais « plus grand / plus petit » : la poignée de h (si elle est libre), celle de r, puis
 * le bouton d'essai quand le cylindre a changé ; rien pendant une question ni à la fin. `ctx` : { done }.
 */
export function coachOfPlayer(lab, ctx = {}) {
  if (ctx.done) return null;
  const fresh = lab.trials.length === 0;
  if (fresh && lab.lockH == null && !lab.movedH) return fz({ id: 'h', target: '[data-cc-h-handle]', gesture: 'drag' });
  if (fresh && !lab.lockR && !lab.movedR) return fz({ id: 'r', target: '[data-cc-r-handle]', gesture: 'drag' });
  if (isDirty(lab)) return fz({ id: 'press', target: '[data-cc-press]', gesture: 'tap' });
  return null;
}

/**
 * TOUT ce qu'un écran du lecteur peut montrer (règle « valeurs interdites par RÔLE », content/forbidden.js de la synthèse) : `{ role, v }`.
 *   'cone-H' / 'cone-R' · 'h' et 'r' (chaque cran de la règle, chaque valeur verrouillée) · 'OT' (H − h, les pastilles) · 'ratio' (r/R, (H − h)/H,
 *   h/H — RÉDUITS par le balayage) · 'value' (les tuiles de la construction) · 'square' (un cran où h = r tomberait sur la règle — jamais).
 * Aucun volume n'est jamais montré. `choices` : { cones: [{ H, R, n }] } — la manche libre : chaque cône.
 */
export function shownValuesPlayer(props = {}) {
  const out = [];
  const push = (role, v) => out.push(fz({ role, v: String(v) }));
  const one = (p) => {
    const lab = initPlayer({ H: p.H, R: p.R, n: p.n, lockH: p.lockH, lockR: p.lockR, start: p.start });
    push('cone-H', dec(lab.H)); push('cone-R', dec(lab.R));
    for (let i = 1; i < lab.n; i += 1) {
      const h = hOf(lab, i); const r = rOf(lab, i); const rm = rMaxAt(lab, i);
      push('h', dec(h)); push('r', dec(r)); push('OT', dec(sub(lab.H, h)));
      if (eq(h, rm)) push('square', dec(h));
      const t = { hIdx: i, h, r: rm };
      const s = secOptions(lab, t);
      [s.rr, s.hh, s.decoy].forEach((x) => push('ratio', x));
    }
    if (p.build != null) buildOf(lab, idxOf(lab.hStep, p.build, lab.n, 'h')).tiles.forEach((x) => push('value', x));
  };
  one(props);
  (props.choices?.cones ?? []).forEach((c) => one({ ...c }));
  return out;
}
