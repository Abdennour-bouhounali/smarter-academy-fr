import * as squareRoots from '@smarter-academy/core/arithmetic/squareRoots.js';

const { compareSquare, rationalSqrt, squareOf, exactDecimal, reduce } = squareRoots;

/**
 * square-root-side — LE CARRÉ QU'ON ÉTIRE (unité 2, leçons 1 et 2).
 *
 * Le côté est un entier `v` lu sur une graduation 1/scale : côté = v / scale.
 * Son carré se compare à l'aire visée EN ENTIERS (core/squareRoots) : aucun
 * flottant ne décide jamais « égal ».
 *
 * Deux usages, une seule mémoire — les essais par (carte, graduation) :
 *
 *   refine      une aire ; graduations 1, 10, 100, 1000 dans l'ordre. On
 *               n'ouvre la graduation suivante (« دقّق ») qu'après avoir
 *               ENCADRÉ soi-même le côté à la graduation courante (deux essais
 *               voisins, l'un trop petit, l'autre trop grand). La fenêtre de la
 *               règle se resserre sur l'encadrement : c'est la loupe.
 *   graduation  plusieurs aires (cartes) ; l'élève choisit la graduation g
 *               (1/1 … 1/maxScale) librement. Une carte « résiste » quand
 *               trois graduations différentes l'ont encadrée sans l'atteindre.
 */

export const REFINE_SCALES = [1, 10, 100, 1000];
const RESIST_AFTER = 3;

const keyOf = ({ num, den }) => { const r = reduce({ num, den }); return `${r.num}/${r.den}`; };

/** Le plus petit entier m tel que m² dépasse l'aire : la règle va jusque-là (+1). */
function ceilRoot({ num, den }) {
  let m = 0;
  while (compareSquare(m, 1, { num, den }) <= 0) m += 1;
  return m;
}

export function init({ mode = 'refine', areas, maxScale = 1000, truthful = false }) {
  // Les aires gardent leur ÉCRITURE (0,25 reste 25/100, pas 1/4) : c'est ce
  // que l'élève lit sur la carte ; les comparaisons, elles, n'en dépendent pas.
  const cards = areas.map(({ num, den }) => { reduce({ num, den }); return { num, den }; });
  return {
    mode,
    cards,
    card: 0,
    maxScale,
    // graduation, lecteur de mission (rollout 2026-11-09, leçon 2 ; conseil) : une carte dont le côté TOMBE sur une graduation offerte ne « résiste »
    // jamais, même encadrée sur trois graduations qui ne sont pas la sienne (16/9 sur 1/1, 1/2, 1/4) — le ✗ et « لن يسقط على أي تدريجة » seraient faux.
    truthful,
    scale: 1,
    // refine : la fenêtre de la règle, en unités de la graduation courante.
    window: { min: 0, max: ceilRoot(cards[0]) + 1 },
    side: null,
    // memo[cardKey][scale] = { below, above, exact } — below/above en unités de 1/scale.
    memo: {},
    last: null,
  };
}

export const currentArea = (s) => s.cards[s.card];
const cell = (s, card = s.card, scale = s.scale) => s.memo[keyOf(s.cards[card])]?.[scale] ?? { below: null, above: null, exact: null };

/** La règle de la graduation courante : { min, max } en unités de 1/scale. */
export function range(s) {
  if (s.mode === 'refine') return s.window;
  return { min: 0, max: s.scale * (ceilRoot(currentArea(s)) + 1) };
}

export function canTest(s, v) {
  if (!Number.isInteger(v) || v < 0) return 'notNatural';
  const r = range(s);
  if (v < r.min || v > r.max) return 'outOfRuler';
  return true;
}

/** Un ESSAI validé (relâchement, touche après pause, bouton). */
export function test(s, v) {
  if (canTest(s, v) !== true) return s;
  const area = currentArea(s);
  const cmp = compareSquare(v, s.scale, area);
  const prev = cell(s);
  const next = {
    below: cmp < 0 ? Math.max(prev.below ?? -Infinity, v) : prev.below,
    above: cmp > 0 ? Math.min(prev.above ?? Infinity, v) : prev.above,
    exact: cmp === 0 ? v : prev.exact,
  };
  const k = keyOf(area);
  return {
    ...s,
    side: v,
    last: { v, scale: s.scale, cmp },
    memo: { ...s.memo, [k]: { ...(s.memo[k] ?? {}), [s.scale]: next } },
  };
}

/** Le côté est encadré par deux graduations VOISINES (l'élève a trouvé les deux). */
export function tight(c) {
  return c.below != null && c.above != null && c.above - c.below === 1;
}

/** refine : peut-on ouvrir la graduation suivante ? */
export function canRefine(s) {
  if (s.mode !== 'refine') return false;
  const c = cell(s);
  if (c.exact != null) return false;
  const i = REFINE_SCALES.indexOf(s.scale);
  return i >= 0 && i < REFINE_SCALES.length - 1 && REFINE_SCALES[i + 1] <= s.maxScale && tight(c);
}

/** refine : la loupe — la graduation ×10, la règle resserrée sur l'encadrement. */
export function refine(s) {
  if (!canRefine(s)) return s;
  const c = cell(s);
  return { ...s, scale: s.scale * 10, window: { min: c.below * 10, max: c.above * 10 }, side: null, last: null };
}

/** graduation : changer de graduation (1/g). */
export function setScale(s, g) {
  if (s.mode !== 'graduation' || !Number.isInteger(g) || g < 1 || g > s.maxScale) return s;
  return { ...s, scale: g, side: null, last: null };
}

/** graduation : changer de carte (d'aire). La mémoire reste. */
export function setCard(s, i) {
  if (s.mode !== 'graduation' || i < 0 || i >= s.cards.length) return s;
  return { ...s, card: i, side: null, last: null };
}

/** Le statut d'une carte : 'exact' | 'resisting' | 'open'. */
export function cardStatus(s, i) {
  const memo = s.memo[keyOf(s.cards[i])] ?? {};
  const cells = Object.values(memo);
  if (cells.some((c) => c.exact != null)) return 'exact';
  if (s.truthful && landsSomewhere(s.cards[i], s.maxScale)) return 'open';
  if (cells.filter(tight).length >= RESIST_AFTER) return 'resisting';
  return 'open';
}

/** Le côté exact trouvé pour une carte : { v, scale } ou null. */
export function foundSide(s, i = s.card) {
  const memo = s.memo[keyOf(s.cards[i])] ?? {};
  for (const [scale, c] of Object.entries(memo)) if (c.exact != null) return { v: c.exact, scale: Number(scale) };
  return null;
}

/** Les encadrements obtenus, graduation par graduation (refine) : [{ scale, below, above, exact }]. */
export function brackets(s, i = s.card) {
  const memo = s.memo[keyOf(s.cards[i])] ?? {};
  return Object.entries(memo).map(([scale, c]) => ({ scale: Number(scale), ...c })).sort((a, b) => a.scale - b.scale);
}

/**
 * La découverte :
 *   refine      le côté est tombé juste (carré d'un décimal), OU l'encadrement
 *               a été resserré jusqu'à la graduation la plus fine sans jamais
 *               tomber juste — deux cas qui disent la même définition ;
 *   graduation  une carte tombée juste ET une carte qui résiste (contraste).
 */
export function discoveryReady(s) {
  if (s.mode === 'refine') {
    const c = cell(s, 0, s.scale);
    const fine = REFINE_SCALES.filter((g) => g <= s.maxScale).at(-1);
    return c.exact != null || (s.scale === fine && tight(c));
  }
  const st = s.cards.map((_, i) => cardStatus(s, i));
  return st.includes('exact') && st.includes('resisting');
}

/** L'issue du mode refine pour l'aire : 'exact' | 'never' | null. */
export function refineOutcome(s) {
  if (s.mode !== 'refine' || !discoveryReady(s)) return null;
  return foundSide(s, 0) ? 'exact' : 'never';
}

/* ── Écritures ─────────────────────────────────────────────────────────── */

const digitsOf = (scale) => { const d = Math.round(Math.log10(scale)); return 10 ** d === scale ? d : null; };

/** Le côté v/scale écrit : « 2,23 » (décimal) ou « 4/3 » (graduation g). */
export function sideText(v, scale) {
  const d = digitsOf(scale);
  if (d != null) return exactDecimal(v, d);
  const r = reduce({ num: v, den: scale });
  return r.den === 1 ? String(r.num) : `${r.num}/${r.den}`;
}

/** Le côté v/scale en LaTeX. */
export function sideTex(v, scale) {
  const d = digitsOf(scale);
  if (d != null) return exactDecimal(v, d).replace(',', '{,}');
  const r = reduce({ num: v, den: scale });
  return r.den === 1 ? String(r.num) : `\\dfrac{${r.num}}{${r.den}}`;
}

/** L'aire { num, den } en LaTeX : « 5 », « 0{,}49 » (den puissance de 10), « \dfrac{16}{9} ». */
export function areaTex({ num, den }) {
  if (den === 1) return String(num);
  const d = digitsOf(den);
  if (d != null) return exactDecimal(num, d).replace(',', '{,}');
  return `\\dfrac{${num}}{${den}}`;
}

/** L'aire en texte simple (DOM) : « 5 », « 0,49 », « 16/9 ». */
export function areaText({ num, den }) {
  if (den === 1) return String(num);
  const d = digitsOf(den);
  return d != null ? exactDecimal(num, d) : `${num}/${den}`;
}

/** Le carré du côté v/scale, en LaTeX exact. */
export function squareTex(v, scale) {
  const sq = squareOf(v, scale);
  if (sq.decimal != null) return sq.decimal.replace(',', '{,}');
  return sq.den === 1 ? String(sq.num) : `\\dfrac{${sq.num}}{${sq.den}}`;
}

/** Longueur à DESSINER (jamais à juger). */
export const drawSide = (v, scale) => v / scale;
export const drawRoot = ({ num, den }) => Math.sqrt(num / den);

/* ── Lecteur de mission (rollout 2026-11-09, traitement v2) ─────────────── */

/**
 * La VÉRITÉ d'une prédiction « le côté tombera-t-il pile sur une graduation ? » — calculée, jamais lue sur l'écran.
 *   landsAt(area, scale)          le côté √a tombe-t-il sur une graduation 1/scale ?  (√a = p/q rationnel et q divise scale)
 *   landsSomewhere(area, maxScale) existe-t-il une graduation 1/g (g ≤ maxScale) où il tombe ?
 */
export function landsAt(area, scale) {
  const r = rationalSqrt(area);
  return Boolean(r) && scale % r.den === 0;
}
export function landsSomewhere(area, maxScale) {
  const r = rationalSqrt(area);
  return Boolean(r) && r.den <= maxScale;
}

/** Le nombre de chiffres après la virgule d'une écriture « 2,236 » (0 sans virgule). */
export const decimalsOf = (text) => { const i = String(text).indexOf(','); return i < 0 ? 0 : String(text).length - i - 1; };

/**
 * LE GUIDE (LabCoach, MANIPULATION_CONTRACT §8quater — ajouté au rollout du 2026-11-09 : ce labo n'en avait pas). Ce qu'il montre MAINTENANT,
 * jamais la réponse (ni la graduation où tomber, ni le sens où tirer) :
 *   refine      le bout du côté à tirer (aucun essai à cette graduation) → encore le bout (pas encore encadré) → « دقّق » (encadré) ; rien à la fin ;
 *   graduation  le bout → une autre graduation (la carte encadrée ici) → une autre carte (celle-ci tombée juste ou résistante) ; rien à la fin.
 */
export function coachOf(s) {
  if (!s || discoveryReady(s)) return null;
  const drag = { id: 'drag', target: '[data-root-handle]', gesture: 'drag' };
  if (s.last == null) return drag;
  if (s.mode === 'refine') {
    if (canRefine(s)) return { id: 'refine', target: '[data-root-refine]', gesture: 'tap' };
    return { id: 'again', target: '[data-root-handle]', gesture: 'drag' };
  }
  const st = cardStatus(s, s.card);
  if (st !== 'open') {
    return s.cards.some((_, i) => i !== s.card && cardStatus(s, i) === 'open') ? { id: 'card', target: '[data-root-cards]', gesture: 'tap' } : null;
  }
  if (tight(cell(s)) || cell(s).exact != null) return { id: 'grad', target: '[data-root-graduations]', gesture: 'tap' };
  return { id: 'again', target: '[data-root-handle]', gesture: 'drag' };
}

/** Une case de la mémoire (carte, graduation) — exportée pour le lecteur (journal, questions). */
export const cellOf = (s, card = s.card, scale = s.scale) => cell(s, card, scale);
