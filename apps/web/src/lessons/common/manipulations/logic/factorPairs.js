import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { divmod, divisionTestBound, divisors } = divisibility;

/**
 * factor-pairs — ranger `n` points en `d` colonnes.
 *
 * Un rectangle PARFAIT (dernière ligne pleine) livre le couple (d, n ÷ d) —
 * DEUX diviseurs d'un coup. Le tableau `pairs` garde les couples trouvés
 * (ordonnés petit × grand) ; quand un test au-delà de √n redonne un couple
 * déjà là, il est marqué `repeat` : c'est la règle d'arrêt, VÉCUE avant
 * d'être lue.
 */
export function init({ n }) {
  return { n, cols: null, rows: null, rest: null, pairs: [], tested: [], bound: divisionTestBound(n) };
}

function canTest(state, d) {
  if (!Number.isInteger(d) || d < 1) return 'notNatural';
  if (d > state.n) return 'largerThanN';
  return true;
}

export function test(state, d) {
  if (canTest(state, d) !== true) return state;
  const { q, r } = divmod(state.n, d);
  const divides = r === 0;
  const key = divides ? `${Math.min(d, q)}x${Math.max(d, q)}` : null;
  // « TOURNÉ » est GÉOMÉTRIQUE, donc indépendant de l'ordre des essais : un
  // rectangle plus large que haut (d > q) est le rectangle q × d couché.
  // Avant (2026-09-29), `repeat` dépendait de ce qui avait été testé avant —
  // tester 8, 6, 5, 7 avant 1…4 marquait 3 et 4 « déjà vus ».
  const repeat = divides && d > q;
  const pairs = divides && !state.pairs.some((p) => p.key === key)
    ? [...state.pairs, { key, small: Math.min(d, q), big: Math.max(d, q), from: d }].sort((x, y) => x.small - y.small)
    : state.pairs;
  return {
    ...state, cols: d, rows: q, rest: r,
    pairs,
    tested: [...state.tested.filter((t) => t.d !== d), { d, divides, repeat, beyondBound: d > state.bound }].sort((x, y) => x.d - y.d),
  };
}

/**
 * La RÉGLETTE du rectangle : de 1 au premier diviseur au-delà de √n, et au
 * moins jusqu'à 2 × √n — assez pour voir les rectangles se coucher, jamais
 * jusqu'à n (105 colonnes ne se dessinent pas). Aucune marque ne signale √n :
 * c'est le rectangle qui devient carré qui le montre.
 */
export function widthRange(n) {
  const bound = divisionTestBound(n);
  let firstAbove = bound + 1;
  while (firstAbove <= n && n % firstAbove !== 0) firstAbove += 1;
  // Un nombre libre (« مختبر حر », jusqu'à 999) peut être premier ou presque :
  // 997 colonnes ne se dessinent pas. Passé 120, la réglette s'arrête à 2 × √n
  // quand le premier diviseur au-delà est loin.
  if (n > 120 && firstAbove > 3 * bound) firstAbove = 2 * bound;
  return { min: 1, max: Math.min(n, Math.max(firstAbove, 2 * bound)) };
}

/**
 * La largeur PAR DÉFAUT : jamais une réponse. La manipulation demande les
 * diviseurs de n ; s'ouvrir sur un diviseur (48 → 3 × 16) en donnerait un
 * gratuitement. On prend donc le premier d qui NE divise PAS n (48 → 5, 60 → 7),
 * et le minimum de la réglette si tout divise (n = 2).
 */
export function defaultWidth(n) {
  const { min, max } = widthRange(n);
  for (let d = min; d <= max; d += 1) if (n % d !== 0) return d;
  return min;
}

/**
 * La GÉOMÉTRIE du rectangle, dans un cadre carré de côté `box` : `d` livres
 * par rangée, `rows` rangées pleines, et une rangée incomplète de `rest`. La
 * cellule est la plus grande qui fait tenir le rectangle ENTIER dans le cadre
 * : un rectangle haut et mince devient carré puis large et plat quand d
 * grandit — le carré, c'est √n, et l'élève le VOIT. `maxCell` : la plus grande cellule (44 px ; le lecteur de mission en accorde plus,
 * son écran de jeu est plus grand).
 */
export function rectangleLayout({ n, d, box, boxW = box, boxH = box, maxCell = 44 }) {
  const rows = Math.floor(n / d);
  const rest = n - rows * d;
  const tall = rows + (rest > 0 ? 1 : 0);
  // Cadre RECTANGULAIRE possible (boxW × boxH) : on remplit la place offerte ;
  // le carré reste celui des livres (d = rows), jamais celui du cadre.
  const cell = Math.max(2, Math.min(boxW / d, boxH / tall, maxCell));
  return { cell, cols: d, rows, rest, width: d * cell, height: tall * cell, square: d === rows && rest === 0 };
}

/** Tous les couples sont là quand les tests 1..√n sont faits. */
export function complete(state) {
  return Array.from({ length: state.bound }, (_, i) => i + 1).every((d) => state.tested.some((t) => t.d === d));
}

/** La règle d'arrêt est VISIBLE quand un test au-delà de √n a redonné un couple connu, le tableau étant complet. */
export function discoveryReady(state) {
  return complete(state) && state.tested.some((t) => t.beyondBound && t.repeat);
}

export function foundDivisors(state) {
  return [...new Set(state.pairs.flatMap((p) => [p.small, p.big]))].sort((x, y) => x - y);
}

export function allDivisors(state) {
  return divisors(state.n);
}

/* ── Le guide d'onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ─────────────────────────────────────────── */

/**
 * La prochaine largeur à essayer, SANS la nommer à l'élève : le plus petit d de 1 … √n pas encore testé ; quand tous le
 * sont, le plus petit d au-delà pas encore testé (le rectangle couché qui montre qu'on peut s'arrêter). `null` : rien à tester.
 */
function nextWidth(state, range) {
  const todo = (from, to) => { for (let v = from; v <= to; v += 1) if (!state.tested.some((t) => t.d === v)) return v; return null; };
  return todo(1, state.bound) ?? todo(state.bound + 1, range.max);
}

/**
 * La prochaine action attendue : tirer la poignée du rectangle une première fois (`handle`), puis montrer les boutons
 * « + / − » (`nudge`, `rank` = +1 | −1 : le côté de la prochaine largeur à essayer). `d` = la largeur vivante.
 * `null` quand la règle d'arrêt est visible (`discoveryReady`).
 */
export function coachOf(state, { d, range }) {
  if (discoveryReady(state)) return null;
  if (state.tested.length === 0) return { id: 'handle', target: '[data-stretch-handle]', gesture: 'drag' };
  const want = nextWidth(state, range);
  if (want == null) return null;
  const dir = d != null && want < d ? -1 : 1;
  return { id: 'nudge', target: `[data-fp-nudge="${dir}"]`, rank: dir, gesture: 'tap' };
}
