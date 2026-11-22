/**
 * orange-peel — LA LOGIQUE PURE de l'orange de Boufarik (unité 14 « الهندسة في الفضاء », درس « مساحة الكرة وحجم الجلة »,
 * مدخل الوحدة p. 163 : Archimède, la boule de rayon R dans le cylindre de rayon R et de hauteur 2R ; معارف 2 p. 166).
 * AUCUNE arithmétique ici : chaque aire, chaque volume, chaque rapport vient de packages/core/arithmetic/space.js
 * (`sphereArea`, `ballVolume`, `cylinder`, `archimedes`, `piMultiple`, `piRound`) sur les fractions exactes de linear.js ;
 * ce module dit seulement ce que la main a le droit de faire, ce que l'écran montre, et pourquoi la mathématique refuse.
 *
 * LE MONDE : une orange de rayon R (cm) posée sur la table de la cuisine. R est tenu en DIXIÈMES (`rt` entier : 14 ↔ 1,4)
 * pour rester exact. Trois phases dans UNE scène :
 *   1. `peel` — l'élève PRÉDIT combien de disques de rayon R (les « grands disques », πR² chacun) la peau couvrira (k posés
 *      sur la table, 1 … 6), puis il ÉPLUCHE (p de 0 à 1) : la peau se dépose dans les disques, l'un après l'autre. La
 *      prédiction est VERROUILLÉE dès que l'épluchage commence. À p = 1, la mesure juge : peau = 𝒜 = 4πR² ; k·πR² ≠ 𝒜 est
 *      refusé (`peelShort` : il reste de la peau pour 4 − k disques ; `peelLong` : k − 4 disques restent vides). Une fois la
 *      peau posée juste, l'élève ÉCRIT l'aire (cartes πR², 2πR, 4πR², 4/3·πR³) : un disque seul, une longueur, un volume
 *      sont refusés par la mesure ou par la dimension (le piège R = 3 : 4/3·π·27 = 36π = 4π·9, même NOMBRE, autre unité) ;
 *   2. `pour` — ouverte par l'élève : le verre cylindrique de rayon R et de hauteur 2R dans lequel l'orange tient tout juste.
 *      Il place D'ABORD la marque où, selon lui, le jus s'arrêtera (en douzièmes de la hauteur ; 1/6 au niveau مبتدئ), puis il
 *      PRESSE l'orange (q de 0 à 1) : le jus monte à q·𝒱/(πR²). À q = 1 la mesure juge : 𝒱 / 𝒱_cyl = 2/3 (`archimedes`) ;
 *      une marque plus basse (`pourLow`) ou plus haute (`pourHigh`) est refusée avec le volume qu'elle aurait voulu dire.
 *      Puis il écrit le volume (cartes 2πR³, 4/3·πR³, 4πR², 3/4·πR³) ;
 *   3. `book` (متقدم seulement, ouverte par l'élève après la règle) — l'exemple du manuel R = 1,4 cm : l'élève choisit le
 *      nombre de chiffres après la virgule ; 1 mm² = 0,01 cm² (2 chiffres) et 1 mm³ = 0,001 cm³ (3 chiffres) sont les seuls
 *      acceptés — une autre précision est refusée en disant ce qu'elle vaut en mm² / mm³.
 * La découverte s'ouvre quand l'aire ET le volume sont écrits justes ET qu'un contraste a été vu : un refus (prédiction,
 * marque, carte) ou la même expérience réussie à deux rayons différents (« quel que soit R : 4 disques, 2/3 »).
 */
import * as S from '@smarter-academy/core/arithmetic/space.js';
import * as Q from '@smarter-academy/core/arithmetic/linear.js';

export const K_MIN = 1;
export const K_MAX = 6;
export const MARK_DEN = 12;

/** Le domaine de R (en dixièmes) et son pas, selon le niveau : مبتدئ = entiers 1 … 5 ; متقدم = 1,0 … 6,0 au dixième. */
export function rangeFor(level) {
  return level === 'advanced'
    ? Object.freeze({ min: 10, max: 60, step: 1, big: 10 })
    : Object.freeze({ min: 10, max: 50, step: 10, big: 10 });
}
/** Le pas de la marque du jus, en douzièmes : 2 (= 1/6) au niveau مبتدئ, 1 (= 1/12) au niveau متقدم. */
export const markStep = (level) => (level === 'advanced' ? 1 : 2);

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const R = (rt) => Q.frac(rt, 10);
/** R écrit à la manière du manuel : « 3 », « 1,4 ». */
export const rText = (rt) => (rt % 10 === 0 ? String(rt / 10) : `${Math.floor(rt / 10)},${rt % 10}`);
/** R en LaTeX : 3, 1{,}4. */
export const rTex = (rt) => rText(rt).replace(',', '{,}');
/** Un nombre décimal écrit avec la virgule (LaTeX). */
const decTex = (s) => String(s).replace('.', ',').replace(',', '{,}');
/** Une fraction exacte en LaTeX : décimale quand elle est finie (7{,}84), sinon \frac{…}{…}. */
export function fracTex(p) {
  const d = Q.fracDecimal(p, 6);
  if (d != null && /^-?\d+([.,]\d+)?$/.test(String(d))) return decTex(String(d));
  return Q.fracLatex(p).replace('\\dfrac', '\\frac');
}
/** k·π en LaTeX, k écrit comme fracTex (36\pi, 7{,}84\pi, \frac{256}{3}\pi). */
export function piTex(k) {
  if (Q.isZero(k)) return '0';
  if (Q.eq(k, 1)) return '\\pi';
  return `${fracTex(k)}\\pi`;
}

/* ── les grandeurs, toutes depuis space.js ─────────────────────────────────── */

/** 𝒜 de la peau (sphère de rayon R). */
export const skin = (rt) => S.sphereArea(R(rt));
/** 𝒱 de la boule (le jus). */
export const juice = (rt) => S.ballVolume(R(rt));
/** Un grand disque (rayon R) : πR². */
export const disc = (rt) => S.piMultiple(Q.mul(R(rt), R(rt)));
/** Le verre : cylindre de rayon R et de hauteur 2R. */
export const glass = (rt) => S.cylinder(R(rt), Q.mul(R(rt), 2));
/** Combien de grands disques la peau couvre-t-elle EXACTEMENT ? 𝒜 / (πR²) (une fraction : 4). */
export const skinDiscs = (rt) => Q.div(skin(rt).k, disc(rt).k);
/** La fraction de la hauteur du verre où le jus s'arrête : 𝒱 / 𝒱_cylindre (2/3). */
export const juiceRatio = (rt) => S.archimedes(R(rt)).volumeRatio;

/* ── l'état ────────────────────────────────────────────────────────────────── */

export function init({ R: R0 = 3, level = 'beginner', example = '1,4', rounding = [2, 3] } = {}) {
  const rg = rangeFor(level);
  const rt = clamp(Math.round(Q.toNumber(Q.parseNumber(String(R0))) * 10), rg.min, rg.max);
  return Object.freeze({
    level, rt, phase: 'peel',
    k: 2, p: 0, peeled: null, areaCard: null, areaOk: false,
    m: 6, q: 0, poured: null, volumeCard: null, volumeOk: false,
    okPeelR: Object.freeze([]), okPourR: Object.freeze([]),
    book: Object.freeze({
      example: Math.round(Q.toNumber(Q.parseNumber(String(example))) * 10), targets: Object.freeze([...rounding]),
      which: 'area', digits: 1, areaOk: false, volumeOk: false,
    }),
    refusals: 0, trials: Object.freeze([]), last: null,
  });
}

const push = (s, trial, patch = {}) => {
  const t = Object.freeze({ n: s.trials.length + 1, R: rText(patch.rt ?? s.rt), ...trial });
  return Object.freeze({ ...s, ...patch, trials: Object.freeze([...s.trials, t]), last: t, refusals: s.refusals + (t.ok ? 0 : 1) });
};

/** Changer R : l'expérience en cours repart (peau remise, verre vidé) ; la prédiction, la marque et les acquis restent. */
export function setR(s, rt) {
  const rg = rangeFor(s.level);
  const v = clamp(Math.round(rt / rg.step) * rg.step, rg.min, rg.max);
  if (v === s.rt) return s;
  if (s.phase === 'book') return s; // l'exemple du manuel fixe R = 1,4
  return Object.freeze({ ...s, rt: v, p: 0, peeled: null, areaCard: null, q: 0, poured: null, volumeCard: null, last: null });
}

/* ── phase 1 : éplucher ───────────────────────────────────────────────────── */

/** La prédiction ne bouge plus dès que l'épluchage a commencé. */
export const canPredict = (s) => s.phase === 'peel' && s.p === 0;
export function setK(s, k) {
  if (!canPredict(s)) return s;
  return Object.freeze({ ...s, k: clamp(Math.round(k), K_MIN, K_MAX), last: null });
}

/** Le verdict d'une peau entièrement posée dans k disques (comparaison EXACTE de 𝒜 et k·πR²). */
function judgePeel(rt, k) {
  const discs = skinDiscs(rt);
  const c = Q.cmp(Q.frac(k), discs);
  const area = skin(rt);
  const laid = S.piMultiple(Q.mul(disc(rt).k, k));
  if (c === 0) return Object.freeze({ kind: 'peelOk', ok: true, k, discs: Q.toNumber(discs), area, laid });
  if (c < 0) return Object.freeze({ kind: 'peelShort', ok: false, k, discs: Q.toNumber(discs), extra: Q.toNumber(Q.sub(discs, k)), area, laid });
  return Object.freeze({ kind: 'peelLong', ok: false, k, discs: Q.toNumber(discs), empty: Q.toNumber(Q.sub(k, discs)), area, laid });
}

/** Éplucher jusqu'à p (la peau ne revient pas toute seule) ; à p = 1, la mesure juge la prédiction. */
export function peelTo(s, p) {
  if (s.phase !== 'peel' || s.peeled) return s;
  const v = clamp(p, 0, 1);
  if (v <= s.p) return s;
  if (v < 1) return Object.freeze({ ...s, p: v, last: null });
  const verdict = judgePeel(s.rt, s.k);
  const next = push(s, { kind: verdict.kind, ok: verdict.ok, k: s.k, stage: 'peel' }, { p: 1, peeled: verdict });
  return verdict.ok ? Object.freeze({ ...next, okPeelR: Object.freeze([...new Set([...s.okPeelR, s.rt])]) }) : next;
}
/** Remettre la peau (une autre prédiction, ou un autre R). */
export function resetPeel(s) {
  if (s.phase !== 'peel') return s;
  return Object.freeze({ ...s, p: 0, peeled: null, areaCard: null, last: null });
}

/** Les cartes de l'aire : la valeur (π-multiple) et la dimension (1 longueur, 2 aire, 3 volume). */
export const AREA_CARDS = Object.freeze(['disc', 'perimeter', 'skin', 'ball']);
export const VOLUME_CARDS = Object.freeze(['cylinder', 'ball', 'skin', 'inverted']);
export function cardValue(id, rt) {
  const r = R(rt);
  const r2 = Q.mul(r, r); const r3 = Q.mul(r2, r);
  switch (id) {
    case 'disc': return { dim: 2, value: S.piMultiple(r2), tex: '\\pi R^2' };
    case 'perimeter': return { dim: 1, value: S.piMultiple(Q.mul(2, r)), tex: '2\\pi R' };
    case 'skin': return { dim: 2, value: S.sphereArea(r), tex: '4\\pi R^2' };
    case 'ball': return { dim: 3, value: S.ballVolume(r), tex: '\\frac{4}{3}\\pi R^3' };
    case 'cylinder': return { dim: 3, value: glass(rt).volume, tex: '2\\pi R^3' };
    case 'inverted': return { dim: 3, value: S.piMultiple(Q.mul(Q.frac(3, 4), r3)), tex: '\\frac{3}{4}\\pi R^3' };
    default: throw new Error(`carte inconnue ${id}`);
  }
}

/**
 * Juger une carte « 𝒜 = … » contre la peau mesurée : la DIMENSION d'abord (une longueur ou un volume n'est pas une aire,
 * même quand le nombre coïncide — R = 3 : 36π cm³ et 36π cm²), puis la valeur exacte.
 */
export function judgeAreaCard(rt, id) {
  const c = cardValue(id, rt);
  const truth = skin(rt);
  if (c.dim === 1) return Object.freeze({ kind: 'cardLength', ok: false, id, value: c.value, truth });
  if (c.dim === 3) return Object.freeze({ kind: 'cardVolume', ok: false, id, value: c.value, truth, same: Q.eq(c.value.k, truth.k) });
  if (Q.eq(c.value.k, truth.k)) return Object.freeze({ kind: 'cardAreaOk', ok: true, id, value: c.value, truth });
  return Object.freeze({ kind: 'cardOneDisc', ok: false, id, value: c.value, truth, times: Q.toNumber(Q.div(truth.k, c.value.k)) });
}
export function pickAreaCard(s, id) {
  if (s.phase !== 'peel' || !s.peeled?.ok || s.areaOk) return s;
  const v = judgeAreaCard(s.rt, id);
  return push(s, { kind: v.kind, ok: v.ok, card: id, stage: 'area' }, { areaCard: v, areaOk: v.ok });
}

/* ── phase 2 : presser ────────────────────────────────────────────────────── */

const canOpenPour = (s) => s.phase === 'peel' && s.areaOk;
export function openPour(s) {
  if (!canOpenPour(s)) return s;
  return Object.freeze({ ...s, phase: 'pour', q: 0, poured: null, volumeCard: null, last: null });
}
export function backToPeel(s) {
  if (s.phase !== 'pour') return s;
  return Object.freeze({ ...s, phase: 'peel', p: 0, peeled: null, areaCard: null, last: null });
}
export const canMark = (s) => s.phase === 'pour' && s.q === 0;
export function setMark(s, m) {
  if (!canMark(s)) return s;
  const st = markStep(s.level);
  return Object.freeze({ ...s, m: clamp(Math.round(m / st) * st, st, MARK_DEN - st), last: null });
}

/** Le verdict d'une marque (en douzièmes de 2R) contre la hauteur réelle du jus (𝒱 / 𝒱_cyl, exact). */
function judgePour(rt, m) {
  const ratio = juiceRatio(rt);
  const f = Q.frac(m, MARK_DEN);
  const c = Q.cmp(f, ratio);
  const cyl = glass(rt).volume;
  const atMark = S.piMultiple(Q.mul(cyl.k, f));
  const base = { m, f, ratio, cyl, atMark, ball: juice(rt) };
  if (c === 0) return Object.freeze({ kind: 'pourOk', ok: true, ...base });
  return Object.freeze({ kind: c < 0 ? 'pourLow' : 'pourHigh', ok: false, ...base });
}
export function pourTo(s, q) {
  if (s.phase !== 'pour' || s.poured) return s;
  const v = clamp(q, 0, 1);
  if (v <= s.q) return s;
  if (v < 1) return Object.freeze({ ...s, q: v, last: null });
  const verdict = judgePour(s.rt, s.m);
  const next = push(s, { kind: verdict.kind, ok: verdict.ok, m: s.m, stage: 'pour' }, { q: 1, poured: verdict });
  return verdict.ok ? Object.freeze({ ...next, okPourR: Object.freeze([...new Set([...s.okPourR, s.rt])]) }) : next;
}
export function resetPour(s) {
  if (s.phase !== 'pour') return s;
  return Object.freeze({ ...s, q: 0, poured: null, volumeCard: null, last: null });
}

export function judgeVolumeCard(rt, id) {
  const c = cardValue(id, rt);
  const truth = juice(rt);
  if (c.dim === 2) return Object.freeze({ kind: 'cardArea', ok: false, id, value: c.value, truth, same: Q.eq(c.value.k, truth.k) });
  if (Q.eq(c.value.k, truth.k)) return Object.freeze({ kind: 'cardVolumeOk', ok: true, id, value: c.value, truth });
  if (id === 'cylinder') return Object.freeze({ kind: 'cardFullGlass', ok: false, id, value: c.value, truth });
  return Object.freeze({ kind: 'cardCoef', ok: false, id, value: c.value, truth });
}
export function pickVolumeCard(s, id) {
  if (s.phase !== 'pour' || !s.poured?.ok || s.volumeOk) return s;
  const v = judgeVolumeCard(s.rt, id);
  return push(s, { kind: v.kind, ok: v.ok, card: id, stage: 'volume' }, { volumeCard: v, volumeOk: v.ok });
}

/* ── la découverte ────────────────────────────────────────────────────────── */

/** Les rayons où une expérience a été réussie (peau ou jus). */
export const triedRadii = (s) => [...new Set([...s.okPeelR, ...s.okPourR])].sort((a, b) => a - b);
const hasContrast = (s) => s.refusals > 0 || s.okPeelR.length >= 2 || s.okPourR.length >= 2;
export const discoveryReady = (s) => s.areaOk && s.volumeOk && hasContrast(s);

/* ── phase 3 (متقدم) : l'exemple du manuel, R = 1,4 cm, arrondi au mm² et au mm³ ── */

export function openBook(s) {
  if (s.level !== 'advanced' || !s.areaOk || !s.volumeOk) return s;
  return Object.freeze({ ...s, phase: 'book', rt: s.book.example, p: 1, q: 1, last: null, book: Object.freeze({ ...s.book, which: 'area', digits: 1 }) });
}
export function closeBook(s) {
  if (s.phase !== 'book') return s;
  return Object.freeze({ ...s, phase: 'pour', q: 0, poured: null, volumeCard: null, last: null });
}
export function setDigits(s, d) {
  if (s.phase !== 'book') return s;
  return Object.freeze({ ...s, book: Object.freeze({ ...s.book, digits: clamp(Math.round(d), 0, 4) }), last: null });
}
/** Ce que vaut la précision « d chiffres après la virgule » en mm² (dim 2) ou en mm³ (dim 3) : 10^(dim − d). */
export const precisionInMm = (dim, d) => 10 ** (dim - d);
/** La valeur exacte (k·π) de la grandeur demandée dans l'exemple, et sa valeur arrondie à d chiffres (« 24,63 »). */
export function bookValue(s, which = s.book.which, d = s.book.digits) {
  const value = which === 'area' ? skin(s.book.example) : juice(s.book.example);
  return { value, rounded: S.piRound(value.k, d), full: S.piRound(value.k, 6) };
}
export function checkRounding(s) {
  if (s.phase !== 'book') return s;
  const { which, digits, targets } = s.book;
  const dim = which === 'area' ? 2 : 3;
  const target = which === 'area' ? targets[0] : targets[1];
  const ok = digits === target;
  const kind = ok ? 'roundOk' : digits < target ? 'roundCoarse' : 'roundFine';
  const { rounded } = bookValue(s, which, digits);
  const patch = ok
    ? { book: Object.freeze({ ...s.book, [`${which}Ok`]: true, which: 'volume', digits: which === 'area' ? 1 : digits }) }
    : {};
  return push(s, { kind, ok, which, digits, rounded, mm: precisionInMm(dim, digits), stage: 'book' }, patch);
}
export const bookDone = (s) => s.book.areaOk && s.book.volumeOk;

/* ── le dessin (des nombres flottants pour la scène, jamais un verdict) ─────── */

/** Le rayon AFFICHÉ de l'orange (unités de scène) : croît avec R, borné pour que tout tienne dans la fenêtre 3D. */
export function displayRadius(rt, level) {
  const rg = rangeFor(level);
  const t = (rt - rg.min) / Math.max(1, rg.max - rg.min);
  return 0.62 + 0.5 * t;
}
/** Combien de chaque disque est rempli de peau quand l'épluchage en est à p (disque i : entre 0 et 1). */
export function discFill(p, i, discs = 4) {
  return clamp(p * discs - i, 0, 1);
}
/** La hauteur du jus dans le verre (fraction de 2R) quand on a pressé q de l'orange. */
export const juiceLevel = (q, ratio = 2 / 3) => clamp(q, 0, 1) * ratio;
/** Les places des disques sur la table : une grille de `cols` colonnes à droite de l'orange, la rangée de DEVANT d'abord. */
export function discSlots(count, rho, cols = 3) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const col = i % cols; const row = Math.floor(i / cols);
    out.push([rho * (2.45 + 2.25 * col), rho * (-1.15 + 2.3 * row), 0]);
  }
  return out;
}

/** Ce que la leçon reçoit à chaque geste jugé (`onTrial`). */
/* ── les étapes du labo et leurs questions (lot 4, `primitives/LabCheckpoint`) ───────────────────────────── */

/** La peau (aire juste), le jus (volume juste), le CONTRASTE puis la règle ; et (متقدم) l'exemple arrondi. */
export function stepsOf(s) {
  const steps = [
    { id: 'peel', reached: s.areaOk },
    { id: 'pour', reached: s.volumeOk },
    { id: 'rule', reached: discoveryReady(s) },
  ];
  if (s.level === 'advanced') steps.push({ id: 'book', reached: s.phase === 'book' && bookDone(s) });
  return steps.map((x) => Object.freeze(x));
}
/** « أعِد التجربة » : l'expérience de l'étape repart (la peau remise, le verre vidé ; le contraste : les essais réussis et refus sont effacés). */
export function retryStep(s, id) {
  if (id === 'peel') return Object.freeze({ ...s, phase: 'peel', areaOk: false, areaCard: null, p: 0, peeled: null, last: null });
  if (id === 'pour') return Object.freeze({ ...s, phase: 'pour', volumeOk: false, volumeCard: null, q: 0, poured: null, last: null });
  if (id === 'rule') {
    return Object.freeze({
      ...s, phase: 'peel', p: 0, peeled: null, areaCard: null, q: 0, poured: null, volumeCard: null,
      refusals: 0, okPeelR: Object.freeze([]), okPourR: Object.freeze([]), last: null,
    });
  }
  if (id === 'book') return Object.freeze({ ...s, book: Object.freeze({ ...s.book, areaOk: false, volumeOk: false }), last: null });
  return s;
}
/** Un nombre exact écrit comme une réponse (« 36 », « 7,84 » → « 196/25 »). */
export const answerText = (p) => Q.fracText(p);

export const evidenceOf = (s) => (s.last ? { ...s.last, okPeelR: s.okPeelR.map(rText), okPourR: s.okPourR.map(rText) } : null);
