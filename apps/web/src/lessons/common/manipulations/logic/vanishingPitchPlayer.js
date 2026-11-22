import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './vanishingPitch.js';

/**
 * vanishing-pitch dans le LECTEUR DE MISSION (2026-11-11, unité 4 leçon 2 « معادلات جداء معدوم », verdict L2) — logique PURE, additive : le
 * fichier de la page (vanishingPitch.js) n'est modifié que par `init({ startX, range })` et `defaultV`. Tout est exact (rationnels).
 *
 * UN ESSAI : épingler un x NOUVEAU (jamais jugé dans la manche) ; « لا حلول أخرى » alors qu'un zéro manque, UNE fois par ensemble d'épingles.
 * Bouger x, re-épingler le même x, « already », `notSwept` et la revendication acceptée ne sont PAS des essais.
 */

const judged = (s) => [...s.pins, ...s.refused];
/** `v` : le x qu'on s'apprête à épingler (par défaut le x courant) — jamais jugé dans la manche. */
export const isNewPin = (s, v = s.x) => v != null && !judged(s).includes(v);
export const claimKey = (s) => s.pins.join(',');
export const isNewMissingClaim = (s, seen) => !L.allPinned(s) && !seen.includes(claimKey(s));

/**
 * Ce que la manche reçoit (`onVerdict`) : une épingle juste → groups = l'indice du zéro (0, 1) ; un refus → 100 + l'indice du cran ;
 * une revendication fausse → 900 + le nombre d'épingles. `next` : l'état APRÈS l'épingle.
 */
export function pinVerdict(next, v) {
  const idx = next.rootUnits.indexOf(v);
  if (idx >= 0 && next.pins.includes(v)) return Object.freeze({ groups: idx, exact: true });
  return Object.freeze({ groups: 100 + (v - next.range.min), exact: false });
}
export const claimVerdict = (s) => Object.freeze({ groups: 900 + s.pins.length, exact: false });

/** Dans le lecteur la découverte est : tous les zéros épinglés ET « لا حلول أخرى » accepté — aucun refus n'est exigé (verdict L2.2). */
export const playerReady = (s) => L.allPinned(s) && s.claimed;

/** Le terrain MASQUÉ (manche couverte) : seul un x déjà jugé (épinglé ou refusé) se voit. */
export const isCovered = (s, v) => !judged(s).includes(v);

/* ── les PRÉDICTIONS (≤ 2 par manche) : des clés ; options et vérité CALCULÉES ici ── */
export const PREDICT_KEYS = Object.freeze(['count', 'atZero', 'zeroB']);

const uniq = (xs) => xs.filter((x, i) => xs.findIndex((y) => Lin.eq(y, x)) === i);

export function predictOptions(s, key) {
  if (key === 'count') return ['1', '2', '3'];
  if (key === 'atZero') return ['yes', 'no'];
  if (key === 'zeroB') {
    const z = s.zeros[1];
    return uniq([Lin.neg(z), z, Lin.div(Lin.frac(1, 1), z)]).map((r) => L.numText(r));
  }
  return [];
}
export function predictTruth(s, key) {
  if (key === 'count') return String(s.roots.length);
  if (key === 'atZero') return Lin.isZero(L.sides(s, 0).area) ? 'yes' : 'no';
  if (key === 'zeroB') return L.numText(s.zeros[1]);
  return null;
}
/** Jugées par le terrain : « atZero » dès que x = 0 est visité ; les autres à la revendication acceptée ; toutes quand `all`. */
export function judgedPredictions(s, keys, all = false) {
  return keys.filter((key) => all || s.claimed || (key === 'atZero' && s.visited.includes(0)));
}

/* ── les QUESTIONS du lecteur : leurs parties, CALCULÉES ── */

/** « وكم طول الضلع الآخر ؟ » : la valeur du côté qui reste à la première épingle, et des leurres (0 = le côté nul, x lui-même). */
export function restParts(s) {
  const v = s.pins[0];
  const { A, B, x } = L.sides(s, v);
  const z = L.zeroSides(s, v)[0];
  const rest = z === 0 ? B : A;
  return { v, expected: L.labText(s, rest), options: uniq([rest, Lin.frac(0, 1), x]).map((r) => L.labText(s, r)) };
}
/** BÂTIR « ▢ = 0 ، إذن x = ▢ » (un côté constant) : le facteur qui s'annule et sa solution ; leurre = la constante prise pour une solution. */
export function buildConstParts(s) {
  const i = s.factors.findIndex((_, k) => !L.isConstant(s, k));
  const c = s.factors.findIndex((_, k) => L.isConstant(s, k));
  return { expected: [L.factorTex(s, i), L.labTex(s, s.zeros[i])], decoy: L.labTex(s, s.factors[c].b) };
}
/** BÂTIR « ▢ = 0 ▢ ▢ = 0 » : les deux facteurs, le connecteur « أو » (tuile de texte), leurre « معًا » ; les deux ordres sont justes. */
export function buildOrParts(s) {
  const f = [L.factorTex(s, 0), L.factorTex(s, 1)];
  return { expected: [f[0], 'أو', f[1]], accept: [[f[1], 'أو', f[0]]], decoy: 'معًا', factors: f };
}
/** BÂTIR « x = ▢ أو x = ▢ » : les deux solutions ; leurre = l'inverse de la première solution non nulle (le quotient retourné) ou le coefficient. */
export function buildSolParts(s) {
  const sols = s.roots.map((r) => L.rootTex(r, s.decimal));
  const nz = s.zeros.find((z) => !Lin.isZero(z));
  const decoy = Lin.isZero(s.zeros[0]) ? L.labTex(s, s.factors[0].a) : L.rootTex(Lin.div(Lin.frac(1, 1), nz), s.decimal);
  return { expected: sols, accept: [[sols[1], sols[0]]], decoy };
}

/**
 * Le GUIDE (LabCoach) — le geste, jamais la réponse :
 *   drag : la poignée, tant que x n'a pas bougé · pin : le bouton « ثبّت », après le 1er mouvement (1re manche de la leçon) ·
 *   claim : « لا حلول أخرى », quand tous les zéros sont épinglés et la revendication pas encore faite.
 * `ctx` : { done } — la manche n'attend plus rien ; { first } — la 1re manche.
 */
export function coachOf(s, ctx = {}) {
  if (ctx.done) return null;
  if (s.visited.length === 0 && s.pins.length === 0) return { id: 'drag', target: '[data-vanishing-handle]', gesture: 'drag', prefer: 'below' };
  if (ctx.first && s.pins.length === 0 && s.refused.length === 0) return { id: 'pin', target: '[data-vanishing-pin-button]', gesture: 'tap', prefer: 'above' };
  if (L.allPinned(s) && !s.claimed) return { id: 'claim', target: '[data-vanishing-claim]', gesture: 'tap', prefer: 'above' };
  return null;
}

/**
 * TOUT ce qu'un écran du lecteur peut montrer pour une manche (`props` : { expr, startX, range, chains, predict, choices }), avec son RÔLE :
 *   expr, factor ; tick (chaque cran) ; side / area (chaque lecture à chaque cran) ; root ; rest (le côté qui reste à chaque zéro) ;
 *   chip / tile / decoy / option (les questions et leurs leurres). Les choix de la manche libre sont balayés comme des manches.
 */
export function shownValues(props = {}) {
  const out = [];
  const add = (role, v) => out.push({ role, v: String(v) });
  const one = (pr) => {
    const s = L.init({ expr: pr.expr, startX: pr.startX, range: pr.range });
    add('expr', L.productTex(s));
    s.factors.forEach((_, i) => add('factor', L.factorTex(s, i)));
    for (let v = s.range.min; v <= s.range.max; v += 1) {
      const sd = L.sides(s, v);
      add('tick', L.labText(s, sd.x));
      add('side', L.labText(s, sd.A)); add('side', L.labText(s, sd.B)); add('area', L.labText(s, sd.area));
    }
    s.roots.forEach((r) => add('root', L.labText(s, r)));
    const withPins = { ...s, pins: s.rootUnits };
    s.rootUnits.forEach((u) => {
      const sd = L.sides(s, u);
      const z = L.zeroSides(s, u);
      if (z.length === 1) add('rest', L.labText(s, z[0] === 0 ? sd.B : sd.A));
    });
    const chains = pr.chains ?? 'none';
    if (chains !== 'none') {
      if (!s.square) restParts(withPins).options.forEach((o) => add('chip', o));
      if (chains === 'build') {
        const b = s.factors.some((_, k) => L.isConstant(s, k)) ? buildConstParts(s) : buildSolParts(s);
        b.expected.forEach((t) => add('tile', t)); add('decoy', b.decoy);
      }
      if (chains === 'rule') { const b = buildOrParts(s); b.expected.filter((t) => t !== 'أو').forEach((t) => add('tile', t)); }
    }
    (pr.predict ?? []).forEach((key) => predictOptions(s, key).forEach((o) => add('option', o)));
  };
  one(props);
  (props.choices ?? []).forEach(one);
  return out;
}
