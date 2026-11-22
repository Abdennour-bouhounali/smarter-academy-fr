/**
 * lamp-ring — LA LOGIQUE PURE des lampadaires autour d'un massif circulaire (unité 13 « الدوران - الزوايا - المضلّعات
 * المنتظمة », « أدمج تعلّماتي », وضعية p. 160 : un حيّز دائري de rayon 3 m, 6 أعمدة متباعدة بنفس المسافة).
 * Aucune arithmétique ici : chaque écart, chaque arc, chaque verdict vient de packages/core/arithmetic/rotation.js
 * (`circleGaps`, `ringByRotation`, `chordOfArc`, `arcLength`, `sideFromRadius`, `centralAngle`) ; ce module dit seulement ce
 * que la main a le droit de faire et ce que l'écran montre.
 *
 * LE MONDE : un cercle de rayon r (mètres), n poteaux repérés par leur DIRECTION vue du centre O (degrés entiers, sens direct
 * depuis l'est, y vers le haut). L'élève, dans UNE scène, en trois phases :
 *   1. `hand` — il fait glisser chaque poteau sur le bord (accroché au cercle, au degré) ; les écarts (cordes) se lisent en
 *      direct ; « أشعل » JUGE : tous les arcs valent-ils 360°/n ? — sinon refus avec le plus grand et le plus petit écart ;
 *   2. `rotate` (ouverte par l'élève après un premier « أشعل ») — il garde le premier poteau P₁ et ne place QUE le deuxième :
 *      l'angle \widehat{P_1OP_2} = α (signé : direct ou indirect) définit le دوران (O, α) ; chaque « دوّر » pose le poteau
 *      suivant comme image du précédent. Le tour ne se REFERME (dernier écart = les autres) que si n·α = 360° ; un poteau qui
 *      retombe sur le premier ou le dépasse est refusé à l'instant où il est posé ;
 *   3. `measure` (dès que le tour s'allume par le دوران) — la distance entre deux poteaux voisins : l'élève choisit COMMENT la
 *      calculer (des cartes : le triangle rectangle et le sinus de α/2 ; le cas particulier — triangle équilatéral pour n = 6,
 *      Pythagore pour n = 4 ; la longueur de l'arc 2πr/n ; « d = r » ailleurs qu'à n = 6 ; 2r·sin α sans moitié) ; une carte
 *      fausse est refusée avec la valeur qu'elle donnerait.
 * La découverte s'ouvre quand le tour est allumé PAR LE دوران, la distance calculée juste, et qu'un contraste a été vu (un
 * refus — à la main, au دوران ou d'une carte — ou un tour allumé à la main aussi).
 */
import * as ROT from '@smarter-academy/core/arithmetic/rotation.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

const snap = (deg) => ((Math.round(deg) % 360) + 360) % 360;
const signed = (deg) => { const a = snap(deg); return a > 180 ? a - 360 : a; };

/**
 * Les directions de départ des poteaux : étalés sur environ 200° à partir de 200° avec des écarts TRÈS différents (poids
 * 3, 1, 4, 1,5, 5 …), jamais également espacés — mais assez loin les uns des autres pour que leurs noms et les longueurs
 * des câbles ne se chevauchent pas.
 */
const START_WEIGHTS = [3, 1, 4, 1.5, 5, 2, 3.5, 1, 4.5, 2.5, 6];
export function handStart(n) {
  const w = START_WEIGHTS.slice(0, n - 1);
  const total = w.reduce((a, b) => a + b, 0);
  const out = [200];
  for (const x of w) out.push(out[out.length - 1] + Math.round((200 * x) / total));
  return out.map(snap);
}

export function init({ n, r }) {
  return Object.freeze({
    n, r, phase: 'hand',
    posts: Object.freeze(handStart(n)),
    handTries: 0, handLit: false,
    rot: Object.freeze({ p1: handStart(n)[0], p2: snap(handStart(n)[0] + 40), placed: 2, result: null }),
    rotLit: false, formula: null, formulaOk: false,
    refusals: 0, trials: Object.freeze([]), last: null,
  });
}

const push = (s, trial, patch = {}) => Object.freeze({
  ...s, ...patch, trials: Object.freeze([...s.trials, Object.freeze(trial)]), last: Object.freeze(trial),
  refusals: s.refusals + (trial.ok ? 0 : 1),
});

/* ── phase 1 : à la main ─────────────────────────────────────────────────── */

/** Les écarts entre poteaux voisins (rotation.circleGaps) : ordre direct, arcs, cordes, `equal`, min / max. */
export const handGaps = (s) => ROT.circleGaps(s.posts, s.r);

/** Fait glisser le poteau i sur le bord (au degré). Un tour allumé à la main s'éteint si on le dérange. */
export function movePost(s, i, deg) {
  if (s.phase !== 'hand' || i < 0 || i >= s.n) return s;
  const posts = s.posts.map((d, k) => (k === i ? snap(deg) : d));
  return Object.freeze({ ...s, posts: Object.freeze(posts), handLit: false, last: s.last?.kind === 'handOk' ? null : s.last });
}

/** « أشعل » : les poteaux posés à la main sont-ils également espacés ? */
export function light(s) {
  if (s.phase !== 'hand') return s;
  const g = handGaps(s);
  const base = { handTries: s.handTries + 1 };
  if (g.equal) return push(s, { kind: 'handOk', ok: true, d: g.max }, { ...base, handLit: true });
  const big = g.arcs.reduce((a, b) => (b.chord > a.chord ? b : a));
  const small = g.arcs.reduce((a, b) => (b.chord < a.chord ? b : a));
  return push(s, { kind: 'handUnequal', ok: false, max: big.chord, min: small.chord, maxPair: [big.from, big.to], minPair: [small.from, small.to], zero: small.deg === 0 }, base);
}

/* ── phase 2 : par le دوران ───────────────────────────────────────────────── */

export const canRotate = (s) => s.handTries > 0;

/** L'élève ouvre la phase du دوران : P₁ reste où il l'a mis, P₂ part à 40° de lui. */
export function openRotate(s) {
  if (!canRotate(s) || s.phase !== 'hand') return s;
  const p1 = s.posts[0];
  return Object.freeze({ ...s, phase: s.rotLit ? 'measure' : 'rotate', rot: Object.freeze({ p1, p2: snap(p1 + 40), placed: 2, result: null }), last: null });
}
/** Le retour à la main (les poteaux posés à la main sont gardés). */
export const backToHand = (s) => (s.phase === 'hand' ? s : Object.freeze({ ...s, phase: 'hand', last: null }));

/** α signé de P₁ vers P₂ (degrés entiers, ]−180 ; 180]) : > 0 sens direct, < 0 sens indirect. */
const alphaSigned = (s) => signed(s.rot.p2 - s.rot.p1);
export const alphaOf = (s) => Math.abs(alphaSigned(s));
export const senseOf = (s) => (alphaSigned(s) >= 0 ? ROT.DIRECT : ROT.INDIRECT);

/** L'élève fait glisser P₂ : l'angle du دوران change, les poteaux déjà tournés repartent. */
export function moveP2(s, deg) {
  if (s.phase !== 'rotate') return s;
  const p2 = snap(deg);
  if (p2 === s.rot.p1) return s;
  return Object.freeze({ ...s, rot: Object.freeze({ ...s.rot, p2, placed: 2, result: null }), last: null });
}

/** Le tour que donne le دوران (O, |α|) — rotation.ringByRotation. */
export const ring = (s) => ROT.ringByRotation(s.n, alphaOf(s));

/** Les directions des poteaux posés par le دوران (P₁, P₂, puis les images successives). */
export function rotatedPosts(s) {
  const sg = Math.sign(alphaSigned(s)) || 1;
  return ring(s).offsets.slice(0, s.rot.placed).map((o) => snap(s.rot.p1 + sg * o));
}

/** « دوّر » : le poteau suivant est l'image du précédent par le دوران (O, α). Le dernier REFERME ou non le tour. */
export function rotateOnce(s) {
  if (s.phase !== 'rotate' || s.rot.result) return s;
  const R = ring(s);
  const a = alphaOf(s);
  if (R.overshoot != null && s.rot.placed >= R.overshoot) {
    return push(s, { kind: 'overshoot', ok: false, alpha: a, k: s.rot.placed + 1, turn: a * s.rot.placed }, { rot: Object.freeze({ ...s.rot, result: 'overshoot' }) });
  }
  const placed = s.rot.placed + 1;
  if (placed < s.n) return Object.freeze({ ...s, rot: Object.freeze({ ...s.rot, placed }), last: Object.freeze({ kind: 'rotated', ok: true, k: placed }) });
  if (R.closes) {
    return push(s, { kind: 'ringOk', ok: true, alpha: a, sense: senseOf(s), d: ROT.chordOfArc(s.r, a) }, { rot: Object.freeze({ ...s.rot, placed, result: 'closed' }), rotLit: true, phase: 'measure' });
  }
  return push(s, { kind: 'ringOpen', ok: false, alpha: a, closing: R.closing, d: ROT.chordOfArc(s.r, a), dLast: ROT.chordOfArc(s.r, R.closing), total: a * (s.n - 1) }, { rot: Object.freeze({ ...s.rot, placed, result: 'open' }) });
}
/** « أعد » : on garde P₁ et P₂, les images repartent. */
export const retryRotate = (s) => (s.phase !== 'rotate' ? s : Object.freeze({ ...s, rot: Object.freeze({ ...s.rot, placed: 2, result: null }), last: null }));

/* ── phase 3 : la distance ───────────────────────────────────────────────── */

/** La distance exacte / approchée entre deux poteaux voisins d'un tour régulier (rotation.sideFromRadius). */
export const gap = (n, r) => ROT.sideFromRadius(n, r);
/** L'arc du bord entre deux poteaux voisins (rotation.arcLength) — le chemin le long du massif, plus long. */
export const edge = (n, r) => ROT.arcLength(r, ROT.centralAngle(n).n / ROT.centralAngle(n).d);

/**
 * Les cartes « comment calculer d ? » pour (n, r), dans un ordre d'affichage fixe qui ne met pas la bonne en premier :
 *   sin     ✓  le triangle rectangle OHP₁ (H milieu de [P₁P₂]) : sin(α/2) = PH / r, d = 2·PH
 *   equi    ✓  (n = 6) OP₁P₂ isocèle de sommet 60° : équilatéral, d = r
 *   pyth    ✓  (n = 4) OP₁P₂ rectangle isocèle en O : d² = r² + r²
 *   arc     ✗  la longueur de l'arc 2πr/n (le chemin le long du bord, pas le câble droit)
 *   radius  ✗  (n ≠ 6) « d = r » comme dans l'hexagone
 *   noHalf  ✗  2r·sin α (l'angle au centre entier au lieu de sa moitié)
 */
export function formulaCards(n, r) {
  const a = ROT.centralAngle(n);
  const alpha = a.n / a.d;
  const right = gap(n, r);
  const card = (id, ok, value, extra = {}) => Object.freeze({ id, ok, value, ...extra });
  const sin = card('sin', true, right.number);
  const arc = card('arc', false, ROT.arcLength(r, alpha));
  const noHalf = card('noHalf', false, ROT.chordOfArc(r, 2 * alpha));
  const radius = card('radius', false, r);
  let list;
  if (n === 6) list = [arc, sin, noHalf, card('equi', true, r)];
  else if (n === 4) list = [arc, sin, radius, card('pyth', true, right.number)];
  else list = [arc, sin, radius, noHalf];
  return Object.freeze(list);
}

/** L'élève choisit une carte : juste → la distance est écrite ; fausse → refus avec la valeur qu'elle donnerait. */
export function pickFormula(s, id) {
  if (s.phase !== 'measure' || s.formulaOk) return s;
  const c = formulaCards(s.n, s.r).find((x) => x.id === id);
  if (!c) return s;
  if (c.ok) return push(s, { kind: 'formulaOk', ok: true, id, value: c.value }, { formula: id, formulaOk: true });
  return push(s, { kind: 'formulaKo', ok: false, id, value: c.value, right: gap(s.n, s.r).number }, { formula: id });
}

/* ── découverte, preuves ──────────────────────────────────────────────────── */

/** Le tour allumé PAR LE دوران + la distance calculée juste + un contraste (un refus, ou un tour allumé à la main aussi). */
export const discoveryReady = (s) => s.rotLit && s.formulaOk && (s.refusals > 0 || s.handLit);

/** Le dernier geste jugé, pour la liste « محاولاتك » du module (onTrial). */
export const evidenceOf = (s) => (s.trials.length ? Object.freeze({ ...s.trials[s.trials.length - 1], n: s.n, r: s.r }) : null);

/* ── affichage ───────────────────────────────────────────────────────────── */

/** Un nombre décimal à la virgule, arrondi au centième (trigonometry.roundTo). */
export const dec = (x, k = 2) => TR.roundTo(x, k);
/** Le même pour KaTeX : la virgule entre accolades. */
export const decTex = (x, k = 2) => dec(x, k).replace(',', '{,}');
/** La distance d'un tour régulier en KaTeX : exacte (r, r√2, r√3) ou « ≈ » au centième. */
export function gapTex(n, r, unit = '\\,\\mathrm{m}') {
  const g = gap(n, r);
  if (g.exact) {
    const ex = TR.surdLatex(g.exact);
    const isInt = /^\d+$/.test(ex);
    return isInt ? `${ex}${unit}` : `${ex}${unit} \\approx ${decTex(g.number)}${unit}`;
  }
  return `\\approx ${decTex(g.number)}${unit}`;
}
/** « d … » en KaTeX, le signe compris : « = 3 m », « = 2√2 m ≈ 2,83 m » ou « ≈ 1,55 m ». */
export function gapEqTex(n, r, unit = '\\,\\mathrm{m}') {
  const g = gapTex(n, r, unit);
  return g.startsWith('\\approx') ? g : `= ${g}`;
}

/* ── les étapes du labo et leurs questions (LabCheckpoint, lot 4) ─────────── */

/**
 * Les ÉTAPES : `hand` (un premier « أشعل » a jugé les poteaux posés à la main), `rotate` (le tour s'allume PAR LE دوران), `measure` (la carte juste a
 * donné la distance). Une suite de questions s'ouvre quand l'objectif de l'étape ET des précédentes est atteint.
 */
export function stepsOf(s) {
  const flags = [['hand', s.handTries > 0], ['rotate', s.rotLit], ['measure', s.formulaOk]];
  return flags.map(([id], i) => ({ id, reached: flags.slice(0, i + 1).every(([, ok]) => ok) }));
}

/** « أعِد التجربة » : remet LA MÊME étape au départ (les essais déjà jugés restent dans la liste). */
export function retryStep(s, id) {
  if (id === 'hand') {
    const posts = handStart(s.n);
    return Object.freeze({ ...s, phase: 'hand', posts: Object.freeze(posts), handTries: 0, handLit: false, rot: Object.freeze({ p1: posts[0], p2: snap(posts[0] + 40), placed: 2, result: null }), rotLit: false, formula: null, formulaOk: false, last: null });
  }
  if (id === 'rotate') return Object.freeze({ ...s, phase: 'rotate', rot: Object.freeze({ ...s.rot, placed: 2, result: null }), rotLit: false, formula: null, formulaOk: false, last: null });
  if (id === 'measure') return Object.freeze({ ...s, phase: 'measure', formula: null, formulaOk: false, last: null });
  return s;
}
