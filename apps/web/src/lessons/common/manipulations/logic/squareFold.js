import * as squareRoots from '@smarter-academy/core/arithmetic/squareRoots.js';

const { rationalSqrt, reduce, exactDecimal } = squareRoots;

/**
 * square-fold — LA DROITE QUI SE PLIE (unité 2, leçon 3 : x² = a).
 *
 * x est un entier `v` lu sur une graduation 1/scale (x = v / scale), de −R
 * à R. Sa flèche le porte vers x² sur la droite des carrés. Une cible a (un
 * décimal du manuel : 9, 25, 3, 0,04, 0, −9) est une carte.
 *
 * Épingler x comme solution de x² = a est une RÉPONSE, jugée ici :
 *   - a < 0 : refus (« x² لا يكون سالبًا ») — la moitié négative de la droite
 *     des carrés est hachurée, aucune flèche n'y entre ;
 *   - la solution exacte (√a ou −√a) est à moins d'une demi-graduation de x :
 *     acceptée, et c'est la VALEUR EXACTE qui est épinglée (√3, pas 1,7) ;
 *   - sinon refus, avec x² lu exactement.
 * Déclarer « لا حل » est aussi une réponse : juste seulement si a < 0.
 */

/** Une cible décimale → rationnel exact { num, den } (0,04 → 1/25). */
export function toRational(a) {
  if (Number.isInteger(a)) return { num: a, den: 1 };
  const frac = String(a).split('.')[1] ?? '';
  const den = 10 ** frac.length;
  return reduce({ num: Math.round(a * den), den });
}

export function init({ targets, scale, radius, exactOnly = false }) {
  // `radius` (lecteur) : une droite plus courte, des graduations plus larges sous le doigt — jamais trop courte pour une carte (−9 garde sa place)
  const need = Math.ceil(Math.sqrt(Math.max(...targets.map((a) => Math.abs(a)))));
  const R = radius != null ? Math.max(radius, need) : Math.max(4, need + 1);
  return {
    targets: targets.map((a) => ({ a, r: toRational(a) })),
    card: 0,
    scale,
    R,
    x: null, // entier v
    visited: [], // les v validés (tableau du manuel)
    pins: {}, // { [cardIndex]: [+1 | -1 | 0] } — signes des solutions épinglées
    declaredNone: {}, // { [cardIndex]: true }
    last: null, // le dernier verdict { kind, ... }
    // lecteur de mission (conseil 2026-11-10) : une graduation VOISINE de √3 n'est jamais acceptée comme valeur — `exactOnly`
    exactOnly,
    exactShown: {}, // { [cardIndex]: [+1 | -1] } — les marques EXACTES (√a, −√a) révélées entre deux graduations
    tried: {}, // { [cardIndex]: true } — une réponse (ثبّت / لا حل) déjà donnée pour cette carte
  };
}

export const range = (s) => ({ min: -s.R * s.scale, max: s.R * s.scale });
export const current = (s) => s.targets[s.card];

export function setCard(s, i) {
  if (i < 0 || i >= s.targets.length) return s;
  return { ...s, card: i, last: null };
}

export function move(s, v) {
  const r = range(s);
  if (!Number.isInteger(v) || v < r.min || v > r.max) return s;
  return { ...s, x: v, visited: s.visited.includes(v) ? s.visited : [...s.visited, v] };
}

/** Le nombre de solutions attendues : 2, 1 ou 0. */
export function solutionCount(r) {
  return r.num > 0 ? 2 : r.num === 0 ? 1 : 0;
}

/** La solution exacte de signe `sign` est-elle à moins d'une demi-graduation de v ? */
function near(v, scale, r, sign) {
  // Localiser la solution exacte : pour une cible qui est un carré de
  // décimal (9, 0,04) la solution EST une graduation et « à moins d'une
  // demi-graduation » veut dire « égale » ; pour √3 aucune graduation ne
  // l'atteint, on accepte la graduation la plus proche et on épingle √3.
  const root = Math.sqrt(r.num / r.den);
  return Math.abs(v / scale - sign * root) <= 0.5 / scale + 1e-12;
}

/**
 * La graduation (entier v) où tombe EXACTEMENT la solution positive de x² = a, ou null : √a rationnel p/q et q divise la graduation.
 * (Aucun flottant : 2,25 → 3/2 tombe sur les dixièmes à v = 15 ; 3 n'a pas de racine rationnelle.)
 */
export function tickRoot(r, scale) {
  if (r.num < 0) return null;
  if (r.num === 0) return 0;
  const rs = rationalSqrt(r);
  if (!rs || scale % rs.den !== 0) return null;
  return (rs.num * scale) / rs.den;
}

/** Une solution de x² = a tombe-t-elle sur une graduation ? (la vérité de la prédiction « هل تقع تدريجة على حلّ؟ », lecteur) */
export const landsOnTick = (target, scale) => tickRoot(target.r, scale) != null;

/** Épingler x = v comme solution de x² = a. */
export function pin(s) {
  if (s.x == null) return { ...s, last: { kind: 'noX' } };
  const { r } = current(s);
  const v = s.x;
  const tried = { ...(s.tried ?? {}), [s.card]: true };
  if (r.num < 0) return { ...s, tried, last: { kind: 'negativeTarget', v } };
  const sign = v > 0 ? 1 : v < 0 ? -1 : 0;
  const have = s.pins[s.card] ?? [];
  if (s.exactOnly && r.num > 0) {
    // lecteur : une valeur n'est acceptée que si x² = a EXACTEMENT ; la graduation voisine de √3 révèle la marque exacte
    const t = tickRoot(r, s.scale);
    if (t != null) {
      if (sign === 0 || v !== sign * t) return { ...s, tried, last: { kind: 'notSolution', v } };
    } else if (sign !== 0 && near(v, s.scale, r, sign)) {
      const shown = s.exactShown?.[s.card] ?? [];
      if (have.includes(sign)) return { ...s, last: { kind: 'alreadyPinned', sign } };
      // la PREMIÈRE fois de ce côté du zéro : la découverte voulue (« لا تدريجة تعطي a بالضبط »), pas un essai
      return { ...s, tried, exactShown: { ...s.exactShown, [s.card]: shown.includes(sign) ? shown : [...shown, sign] }, last: { kind: 'nearTick', v, sign, free: !shown.includes(sign) } };
    } else {
      return { ...s, tried, last: { kind: 'notSolution', v } };
    }
  } else {
    const ok = r.num === 0 ? v === 0 : sign !== 0 && near(v, s.scale, r, sign);
    if (!ok) return { ...s, tried, last: { kind: 'notSolution', v } };
  }
  if (have.includes(sign)) return { ...s, last: { kind: 'alreadyPinned', sign } };
  return { ...s, tried, pins: { ...s.pins, [s.card]: [...have, sign] }, last: { kind: 'pinned', sign } };
}

/** Lecteur : épingler la marque EXACTE ±√a révélée entre deux graduations (l'élève la choisit — on épingle √3, jamais 1,7). */
export function pinExact(s, sign) {
  const shown = s.exactShown?.[s.card] ?? [];
  if (!shown.includes(sign)) return s;
  const have = s.pins[s.card] ?? [];
  if (have.includes(sign)) return { ...s, last: { kind: 'alreadyPinned', sign } };
  return { ...s, pins: { ...s.pins, [s.card]: [...have, sign] }, last: { kind: 'pinned', sign, exact: true } };
}

/** Les marques exactes encore à épingler sur la carte courante (lecteur). */
export const exactToPin = (s) => (s.exactShown?.[s.card] ?? []).filter((sign) => !(s.pins[s.card] ?? []).includes(sign));

/** Déclarer « لا تقبل أي حل ». */
export function declareNone(s) {
  const { r } = current(s);
  const tried = { ...(s.tried ?? {}), [s.card]: true };
  if (r.num >= 0) return { ...s, tried, last: { kind: 'hasSolution' } };
  return { ...s, tried, declaredNone: { ...s.declaredNone, [s.card]: true }, last: { kind: 'declaredNone' } };
}

/** Toutes les cartes résolues ? */
const allSolved = (s) => s.targets.every((_, i) => cardSolved(s, i));

/**
 * LE GUIDE (LabCoach, MANIPULATION_CONTRACT §8quater) : le geste nécessaire MAINTENANT — jamais la réponse. Tenir x et le déplacer ;
 * puis « ثبّت » (si le sommet de la flèche est sur a, c'est à l'élève de le voir) ; une autre carte quand celle-ci est résolue. Il ne
 * montre jamais « لا حل » (ce serait dire que a < 0 n'a pas de solution) ni la marque exacte (elle se découvre).
 */
export function coachOf(s) {
  if (!s || allSolved(s)) return null;
  if (s.visited.length === 0) return { id: 'drag', target: '[data-fold-handle]', gesture: 'drag' };
  if (cardSolved(s, s.card)) return { id: 'card', target: '[data-fold-cards]', gesture: 'tap' };
  if (!s.tried?.[s.card]) return { id: 'pin', target: '[data-fold-pin-button]', gesture: 'tap' };
  return { id: 'again', target: '[data-fold-handle]', gesture: 'drag' };
}

/** Une carte est résolue quand toutes ses solutions sont épinglées (ou « لا حل » déclaré pour a < 0). */
export function cardSolved(s, i) {
  const { r } = s.targets[i];
  const n = solutionCount(r);
  if (n === 0) return !!s.declaredNone[i];
  return (s.pins[i] ?? []).length === n;
}

/**
 * La découverte : le contraste des TROIS signes — une cible positive
 * résolue (deux solutions), la cible 0 (une seule), une cible négative
 * (aucune). C'est exactement la خاصية 2 du manuel.
 */
export function discoveryReady(s) {
  const done = (pred) => s.targets.some((t, i) => pred(t.r) && cardSolved(s, i));
  return done((r) => r.num > 0) && done((r) => r.num === 0) && done((r) => r.num < 0);
}

/* ── Écritures ─────────────────────────────────────────────────────────── */

const pow10 = (n) => { const d = Math.round(Math.log10(n)); return 10 ** d === n ? d : null; };

/** x = v / scale en texte : « −1,5 », « 3 », « −3/2 » si la graduation n'est pas décimale. */
export function xText(v, scale) {
  const d = pow10(scale);
  // « 3 », jamais « 3,0 » : la graduation 1/10 écrit l'entier comme les étiquettes de la droite (journal du lecteur, 2026-11-10)
  if (d != null) return exactDecimal(v, d).replace(/,(\d*?)0+$/, ',$1').replace(/,$/, '');
  const r = reduce({ num: v, den: scale });
  const sign = r.num < 0 ? '−' : '';
  return r.den === 1 ? `${sign}${Math.abs(r.num)}` : `${sign}${Math.abs(r.num)}/${r.den}`;
}

/** x² exact en texte (décimal si possible). */
export function squareText(v, scale) {
  const r = reduce({ num: v * v, den: scale * scale });
  if (r.den === 1) return String(r.num);
  const d = pow10(scale);
  if (d != null) return exactDecimal(v * v, 2 * d);
  return `${r.num}/${r.den}`;
}

/** a en texte : « 0,04 », « −9 ». */
export const targetText = (a) => String(a).replace('.', ',').replace('-', '−');

/** p/q en décimal fini LaTeX (« 0{,}2 »), ou null si q a un facteur autre que 2 et 5. */
function finiteDecimal({ num, den }) {
  for (let d = 0; d <= 6; d += 1) {
    const scaled = num * 10 ** d;
    if (scaled % den === 0) return exactDecimal(scaled / den, d).replace(',', '{,}');
  }
  return null;
}

/** La solution exacte de signe `sign` pour r, en LaTeX : « 3 », « -\sqrt{3} », « 0{,}2 ». */
export function solutionTex(target, sign) {
  if (sign === 0) return '0';
  const rs = rationalSqrt(target.r);
  let body;
  if (rs) {
    // Une cible DÉCIMALE (0,04) garde une solution décimale (0,2) quand elle
    // en a une : le manuel écrit « −0,5 و 0,5 », pas « −1/2 ».
    const dec = Number.isInteger(target.a) ? null : finiteDecimal(rs);
    body = rs.den === 1 ? String(rs.num) : (dec ?? `\\dfrac{${rs.num}}{${rs.den}}`);
  } else {
    body = `\\sqrt{${targetText(target.a).replace(',', '{,}')}}`;
  }
  return sign < 0 ? `-${body}` : body;
}

/** Même chose en texte simple (DOM, aria). */
export function solutionText(target, sign) {
  return solutionTex(target, sign).replace(/\\sqrt\{([^}]*)\}/g, '√$1').replace(/\{,\}/g, ',').replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/^-/, '−');
}

/**
 * Le x PAR DÉFAUT à l'ouverture (jamais une visite, jamais écrit dans `visited`) :
 * la première graduation (en partant de 0) qui n'est solution d'AUCUNE carte
 * (« ثبّت » la refuserait pour chacune). Sinon, le minimum de la règle.
 */
export function defaultX(s) {
  const r = range(s);
  for (let v = 0; v <= r.max; v += 1) {
    const isAnswer = s.targets.some((_, i) => pin({ ...s, x: v, card: i, pins: {} }).last.kind === 'pinned');
    if (!isAnswer) return v;
  }
  return r.min;
}
