/**
 * fraction-knife — la logique PURE des écritures fractionnaires d'une même part (1AM, unité 4 « الكتابات الكسرية »,
 * درس « الكتابات الكسرية لحاصل قسمة واختزال كسر », manuel نشاط 4 p. 54, معارف 3 p. 55, طريقة p. 56). Aucun React ici ;
 * toute l'arithmétique est EXACTE et passe par `@smarter-academy/core/arithmetic/linear.js` (`frac`, `mul`, `eq`,
 * `isInteger`, `fracText`, `fracDecimal`) et `…/divisibility.js` (`divmod`), importés PAR CHEMIN — jamais le barrel du
 * core, jamais un flottant pour un verdict.
 *
 * L'objet : UN tout (le plateau de قلب اللوز, le rectangle du manuel) et UNE part FIXE p/q de ce tout — son bord ne bouge
 * jamais : il EST le nombre. La main tient le couteau : d, le nombre de morceaux égaux du tout. Pour une coupe d :
 *
 *   inShare = p × d / q (exact)       combien de morceaux tiennent dans la part ;
 *   lisible ⇔ inShare est entier      ⇔ q / pgcd(p, q) divise d — le bord tombe SUR une coupe ; l'écriture est inShare/d ;
 *   illisible                         ⌊inShare⌋ morceaux sont dedans et le suivant est à CHEVAL : il est coupé par le bord
 *                                     à la fraction inShare − ⌊inShare⌋ de sa largeur (dessinée exactement).
 *
 * D'un d lisible à un d′ lisible plus petit qui le divise, k = d / d′ morceaux se RÉUNISSENT en un (la colle) : les deux
 * termes sont divisés par k — c'est réduire. Un d de 10, 100 ou 1000 donne un كسر عشري et son écriture décimale.
 *
 *     let s = init({ world: 'tray', share: [3, 5], start: 5, max: 20, claim: [4, 6] });
 *     s = commitD(s, 10);              // lisible : 6/10 est tamponné (كسر عشري 0,6)
 *     s = commitD(s, 7);               // illisible : 4 morceaux et une partie (inShare = 21/5)
 *     s = commitD(s, 15);              // lisible : 9/15
 *     s = openClaim(s); s = commitD(s, 6); s = answerClaim(s, 'false');   // 3 × 6 / 5 = 18/5 ≠ 4
 *     discoveryReady(s) === true
 *
 * Un défaut n'est pas un essai (MANIPULATION_CONTRACT §6bis.2) : le couteau s'ouvre sur `start` (l'écriture du manuel, déjà
 * dans le cahier) et rien n'est inscrit dans `trials` avant un relâchement.
 */
import { frac, mul, eq, isInteger, fracText, fracDecimal } from '@smarter-academy/core/arithmetic/linear.js';
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';

/** Les dénominateurs d'un كسر عشري. */
const DECIMAL_DS = Object.freeze([10, 100, 1000]);
/** Le nombre maximal d'épingles de prédiction (متقدم). */
export const MAX_PINS = 3;

const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };

/* ── Mathématiques ──────────────────────────────────────────────────────────────────── */

/**
 * La lecture EXACTE d'une coupe d de la part p/q.
 *   { p, q, d, inShare (fraction exacte), readable, a (entier si lisible, sinon null), whole (morceaux entièrement
 *     dedans), part (fraction ]0, 1[ du morceau à cheval qui est dans la part, null si lisible), writing ('6/10' | null),
 *     decimal ('0,6' si d ∈ 10, 100, 1000 et lisible, sinon null) }
 */
export function readCut(p, q, d) {
  const inShare = frac(p * d, q);
  const readable = isInteger(inShare);
  const { q: whole, r } = divmod(p * d, q);
  const a = readable ? whole : null;
  const writing = readable ? `${a}/${d}` : null;
  const decimal = readable && DECIMAL_DS.includes(d) ? fracDecimal(frac(a, d)) : null;
  return Object.freeze({ p, q, d, inShare, readable, a, whole, part: readable ? null : frac(r, q), writing, decimal });
}

/** La période des coupes lisibles : q / pgcd(p, q) (le plus petit d lisible). */
export const readablePeriod = (p, q) => q / gcd(p, q);

/** Tous les d lisibles dans 1 … max (pour les tests et la vérification : JAMAIS affichés à l'élève). */
export function readableDs(p, q, max) {
  const out = [];
  for (let d = 1; d <= max; d += 1) if (readCut(p, q, d).readable) out.push(d);
  return out;
}

/**
 * La colle : passer d'un d lisible à un d′ lisible PLUS PETIT qui le divise réunit k = d / d′ morceaux en un.
 * { k, a, a2 } (a = morceaux dans la part avant, a2 après : a = a2 × k) ou null si d′ ne divise pas d ou si l'une des
 * deux coupes n'est pas lisible.
 */
export function glue(p, q, d, d2) {
  if (!(d2 < d) || d % d2 !== 0) return null;
  const from = readCut(p, q, d);
  const to = readCut(p, q, d2);
  if (!from.readable || !to.readable) return null;
  return Object.freeze({ k: d / d2, a: from.a, a2: to.a, d, d2 });
}

/**
 * La proposition d'un camarade « p/q = a/b » jugée par la part, coupée en b : vraie ssi la coupe b est lisible avec
 * exactement a morceaux. `overflow` = a − inShare (exact ; > 0 : ses morceaux DÉBORDENT le bord).
 */
export function judgeClaim(p, q, [a, b]) {
  const cut = readCut(p, q, b);
  const overflow = frac(a * q - p * b, q);
  return Object.freeze({ a, b, ok: eq(cut.inShare, frac(a)), cut, overflow });
}

/** La valeur de la part (exacte). */
export const shareValue = (p, q) => frac(p, q);

/* ── État ───────────────────────────────────────────────────────────────────────────── */

const put = (s, patch) => Object.freeze({ ...s, ...patch });
const label = ([p, q]) => `${p}/${q}`;
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

function stageOf(cfg, index) {
  const [p, q] = cfg.share;
  const max = cfg.max ?? Math.max(20, cfg.start ?? q);
  const start = clampInt(cfg.start ?? q, 1, max);
  return Object.freeze({ index, p, q, max, start, predict: !!cfg.predict, label: label(cfg.share) });
}

function initialStamp(stage, targets) {
  const c = readCut(stage.p, stage.q, stage.start);
  if (!c.readable) return [];
  return [Object.freeze({ a: c.a, d: c.d, writing: c.writing, decimal: c.decimal, figure: stage.index === 0 && targets ? 1 : null, initial: true })];
}

/**
 * world 'tray' (مبتدئ) | 'paper' (متقدم) ; share [p, q] ; start (d initial) ; max (le plus grand d du rail) ;
 * claim [a, b] (facultatif) ; targets [[a, d], …] (facultatif, les rectangles 2, 3 … du manuel) ;
 * then { share, start, max, predict } (facultatif, la seconde part).
 */
export function init({ world = 'tray', share, start, max, claim = null, targets = null, then = null }) {
  const st0 = stageOf({ share, start, max }, 0);
  const st1 = then ? stageOf(then, 1) : null;
  const tg = targets && targets.length ? Object.freeze(targets.map(([a, d]) => Object.freeze([a, d]))) : null;
  return Object.freeze({
    world,
    config: Object.freeze({ world, share, start, max, claim, targets, then }),
    stages: Object.freeze(st1 ? [st0, st1] : [st0]),
    stage: 0,
    d: st0.start,
    notebook: Object.freeze([Object.freeze(initialStamp(st0, tg)), Object.freeze(st1 ? initialStamp(st1, null) : [])]),
    targets: tg,
    claim: claim ? Object.freeze({ a: claim[0], b: claim[1], state: 'closed', answers: Object.freeze([]) }) : null,
    predicting: false,
    pins: Object.freeze([]),
    cursor: null,
    trials: Object.freeze([]),
    last: null,
  });
}

/** « إعادة » : tout recommencer, le cahier et la mémoire des essais compris. */
export const reset = (s) => init(s.config);
/** « أعِد التجربة » (questions du labo) : LA MÊME part repart — la première : tout ; la seconde : son cahier, ses épingles, ses essais. */
export function retryStage(s) {
  if (s.stage === 0) return init(s.config);
  const st = s.stages[1];
  return put(s, {
    d: st.start, predicting: st.predict, cursor: st.predict ? Math.max(1, st.start - 1) : null, pins: Object.freeze([]), last: null,
    notebook: Object.freeze([s.notebook[0], Object.freeze(initialStamp(st, null))]),
    trials: Object.freeze(s.trials.filter((t) => t.stage !== 1)),
  });
}

/** La part en cours. */
export const current = (s) => s.stages[s.stage];
/** Le cahier de la part en cours. */
export const stamps = (s) => s.notebook[s.stage];

function judgePassedPins(s, from, to) {
  if (s.stage !== 1 || s.predicting || !s.pins.length) return s;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const st = current(s);
  let trials = s.trials;
  let changed = false;
  const pins = s.pins.map((pin) => {
    if (pin.state !== 'planted' || pin.d < lo || pin.d > hi) return pin;
    changed = true;
    const c = readCut(st.p, st.q, pin.d);
    trials = [...trials, Object.freeze({ kind: 'pin', stage: 1, share: st.label, d: pin.d, readable: c.readable, inShare: fracText(c.inShare) })];
    return Object.freeze({ d: pin.d, state: c.readable ? 'readable' : 'straddle' });
  });
  return changed ? put(s, { pins: Object.freeze(pins), trials: Object.freeze(trials) }) : s;
}

/** Pendant le geste : les coupes suivent le doigt (pas un essai) ; une épingle que le couteau traverse est jugée. */
export function setD(s, d) {
  if (s.predicting) return s;
  const dd = clampInt(d, 1, current(s).max);
  if (dd === s.d) return s;
  return judgePassedPins(put(s, { d: dd }), s.d, dd);
}

/** Le relâchement (ou la pause du clavier / des boutons) : un ESSAI jugé ; une écriture lisible est tamponnée. */
export function commitD(s, d) {
  if (s.predicting) return s;
  const st = current(s);
  const dd = clampInt(d, 1, st.max);
  const s1 = judgePassedPins(s.d === dd ? s : put(s, { d: dd }), s.d, dd);
  const c = readCut(st.p, st.q, dd);
  const book = s1.notebook[s1.stage];
  const fresh = c.readable && !book.some((x) => x.d === dd);
  const figure = fresh && s1.stage === 0 && s1.targets ? s1.targets.findIndex(([a, td]) => td === dd && a === c.a) : -1;
  const stamp = fresh ? Object.freeze({ a: c.a, d: dd, writing: c.writing, decimal: c.decimal, figure: figure >= 0 ? figure + 2 : null, initial: false }) : null;
  const notebook = stamp
    ? Object.freeze(s1.notebook.map((b, i) => (i === s1.stage ? Object.freeze([...b, stamp]) : b)))
    : s1.notebook;
  const trial = Object.freeze({ kind: 'cut', stage: s1.stage, share: st.label, d: dd, readable: c.readable, inShare: fracText(c.inShare), writing: c.writing });
  return put(s1, {
    d: dd, notebook,
    trials: Object.freeze([...s1.trials, trial]),
    last: Object.freeze({ stage: s1.stage, d: dd, cut: c, stamped: !!stamp }),
  });
}

/** Le verdict à montrer : celui du dernier relâchement, seulement s'il porte sur la coupe affichée. */
export const shownCut = (s) => (s.last && s.last.stage === s.stage && s.last.d === s.d ? s.last.cut : null);

/* ── La proposition d'Amine (مبتدئ) ─────────────────────────────────────────────────── */

/** La carte s'ouvre (à la demande de l'élève) quand le cahier a au moins 2 écritures. */
export const canOpenClaim = (s) => !!s.claim && s.claim.state === 'closed' && s.stage === 0 && stamps(s).length >= 2;
export const openClaim = (s) => (canOpenClaim(s) ? put(s, { claim: put(s.claim, { state: 'open' }) }) : s);
/** On ne juge la proposition qu'avec le couteau sur son dénominateur : le plateau coupé en b. */
export const claimCuttable = (s) => !!s.claim && s.claim.state !== 'closed' && s.claim.state !== 'right' && s.d === s.claim.b;
/** La proposition telle que le plateau la juge. */
export const claimVerdict = (s) => (s.claim ? judgeClaim(s.stages[0].p, s.stages[0].q, [s.claim.a, s.claim.b]) : null);

/**
 * L'élève répond « صحيح » ('true') ou « خطأ » ('false') ; jugé contre la logique. Une mauvaise réponse est réfutée et
 * l'élève peut répondre de nouveau ; la bonne ferme la carte (`state: 'right'`).
 */
export function answerClaim(s, answer) {
  if (!claimCuttable(s)) return s;
  const v = claimVerdict(s);
  const ok = (answer === 'true') === v.ok;
  const claim = put(s.claim, { state: ok ? 'right' : 'wrong', answers: Object.freeze([...s.claim.answers, answer]) });
  const trial = Object.freeze({ kind: 'claim', stage: 0, claim: `${s.claim.a}/${s.claim.b}`, answer, claimTrue: v.ok, ok });
  return put(s, { claim, trials: Object.freeze([...s.trials, trial]) });
}

/* ── متقدم : les rectangles du manuel, puis le cadeau du grand-père ─────────────────── */

/** Les cibles atteintes (tamponnées) : [true, false] pour [[6, 10], [12, 20]]. */
export const targetsDone = (s) => (s.targets ? s.targets.map(([a, d]) => s.notebook[0].some((x) => x.a === a && x.d === d)) : []);
export const allTargetsDone = (s) => !!s.targets && targetsDone(s).every(Boolean);

/** La seconde part s'ouvre (à la demande de l'élève) quand les cibles sont atteintes (ou, sans cible, après un essai lisible). */
export const canOpenNext = (s) => s.stages.length > 1 && s.stage === 0
  && (s.targets ? allTargetsDone(s) : s.notebook[0].length >= 2);
export function openNext(s) {
  if (!canOpenNext(s)) return s;
  const st = s.stages[1];
  return put(s, { stage: 1, d: st.start, predicting: st.predict, cursor: st.predict ? Math.max(1, st.start - 1) : null, last: null });
}
/** Revenir à la première part (la mémoire est gardée ; aucune prédiction n'est rouverte). */
export const backToFirst = (s) => (s.stage === 0 ? s : put(s, { stage: 0, d: s.stages[0].start, predicting: false, last: null }));
export const backToSecond = (s) => (s.stages.length < 2 || s.stage === 1 || !s.notebook[1].length ? s : put(s, { stage: 1, d: s.stages[1].start, predicting: false, last: null }));

/** Le curseur d'épingle (pendant la prédiction : d < max). */
export const setCursor = (s, d) => (s.predicting ? put(s, { cursor: clampInt(d, 1, current(s).max - 1) }) : s);
/** Planter une épingle (au plus MAX_PINS, d < max, distinctes). Une épingle déjà là est arrachée. */
export function togglePin(s, d) {
  if (!s.predicting) return s;
  const dd = clampInt(d, 1, current(s).max - 1);
  if (s.pins.some((p) => p.d === dd)) return put(s, { pins: Object.freeze(s.pins.filter((p) => p.d !== dd)) });
  if (s.pins.length >= MAX_PINS) return s;
  const pins = [...s.pins, Object.freeze({ d: dd, state: 'planted' })].sort((x, y) => y.d - x.d);
  return put(s, { pins: Object.freeze(pins) });
}
/** Lâcher le couteau : la prédiction est close (au moins une épingle). */
export const canStartKnife = (s) => s.predicting && s.pins.length > 0;
export const startKnife = (s) => (canStartKnife(s) ? put(s, { predicting: false, cursor: null }) : s);

/** La seconde part ramenée à `reduceTo` morceaux (5 pour 27/45) : le d lisible le plus petit, relâché. */
export function reducedTo(s) {
  if (s.stages.length < 2) return null;
  const st = s.stages[1];
  return readablePeriod(st.p, st.q);
}
export const reachedReduced = (s) => s.stages.length > 1
  && s.trials.some((t) => t.kind === 'cut' && t.stage === 1 && t.d === reducedTo(s));

/**
 * La colle visible : après une coupe LISIBLE plus grossière de la seconde part (d′ divise le d de départ), les k = d / d′
 * anciens morceaux de chaque nouveau morceau sont groupés — dessinés seulement APRÈS ce relâchement.
 */
export function shownGlue(s) {
  const c = shownCut(s);
  if (!c || !c.readable || s.stage !== 1) return null;
  const st = current(s);
  return glue(st.p, st.q, st.start, c.d);
}

/* ── Le contraste et la découverte ──────────────────────────────────────────────────── */

const cutsOf = (s, stage) => s.trials.filter((t) => t.kind === 'cut' && t.stage === stage);

/**
 * مبتدئ : au moins 3 écritures distinctes dans le cahier (3/5 du départ et deux de la main), au moins une coupe
 * illisible, et la proposition d'Amine jugée juste (s'il y en a une).
 * متقدم : les cibles tamponnées, 27/45 ramené à 5 morceaux, et au moins un refus d < 45 sur la seconde part (épingle
 * jugée « à cheval » ou coupe illisible).
 */
export function discoveryReady(s) {
  if (s.world === 'paper' && s.stages.length > 1) {
    const refused = s.trials.some((t) => t.stage === 1 && (t.kind === 'cut' || t.kind === 'pin') && !t.readable && t.d < s.stages[1].max);
    return allTargetsDone(s) && reachedReduced(s) && refused;
  }
  const writings = s.notebook[0].length >= 3 && s.notebook[0].some((x) => x.d !== s.stages[0].start);
  const unreadable = cutsOf(s, 0).some((t) => !t.readable);
  const claim = !s.claim || s.claim.state === 'right';
  const targets = !s.targets || allTargetsDone(s);
  return writings && unreadable && claim && targets;
}

/** La première coupe illisible de l'élève sur une part (pour réfuter « يكفي أن نكبّر المقام ») ; null sinon. */
export const firstUnreadable = (s, stage = 0) => cutsOf(s, stage).find((t) => !t.readable)?.d ?? null;

/**
 * Le diviseur refusé de la seconde part pour réfuter « نقسم المقام على أيّ قاسم له » : le premier d de l'élève (épingle ou
 * coupe) qui DIVISE le d de départ et reste illisible ; sinon 9 (45 ÷ 5) — le piège du manuel.
 */
export function refusedDivisor(s) {
  if (s.stages.length < 2) return null;
  const st = s.stages[1];
  const own = s.trials.find((t) => t.stage === 1 && !t.readable && t.d < st.start && st.start % t.d === 0);
  if (own) return own.d;
  for (let d = st.start - 1; d >= 2; d -= 1) if (st.start % d === 0 && !readCut(st.p, st.q, d).readable) return d;
  return null;
}

/** Ce que la leçon reçoit pour un essai (`onTrial`). */
export function trialEvidence(t) {
  if (t.kind === 'claim') return { kind: 'claim', claim: t.claim, ok: t.ok, answer: t.answer };
  if (t.kind === 'pin') return { kind: 'pin', share: t.share, d: t.d, readable: t.readable };
  const e = { kind: 'cut', share: t.share, d: t.d, inShare: t.inShare, readable: t.readable };
  if (t.writing) e.writing = t.writing;
  return e;
}

/** La part au moment de la règle (onFinished) : la dernière travaillée. */
export const finishedShare = (s) => current(s).label;

/* ── Écritures formelles ────────────────────────────────────────────────────────────── */

/** Les facteurs k de l'élève pour la part de départ : chaque écriture tamponnée de la première part = (p×k)/(q×k). */
export function multiplyLines(s) {
  const st = s.stages[0];
  const base = readCut(st.p, st.q, st.start);
  if (!base.readable) return [];
  return s.notebook[0]
    .filter((x) => x.d !== st.start && x.d % st.start === 0)
    .sort((x, y) => x.d - y.d)
    .map((x) => Object.freeze({ k: x.d / st.start, a: base.a, d: st.start, a2: x.a, d2: x.d, decimal: x.decimal }));
}

/**
 * Le chemin de réduction de la seconde part, avec les coupes de l'élève : d de départ → (d lisibles intermédiaires qui
 * divisent le précédent) → la plus petite. [{ from: [a, d], to: [a2, d2], k }].
 */
export function reduceSteps(s) {
  if (s.stages.length < 2) return [];
  const st = s.stages[1];
  const smallest = readablePeriod(st.p, st.q);
  const visited = [...new Set(cutsOf(s, 1).filter((t) => t.readable && st.start % t.d === 0 && t.d < st.start).map((t) => t.d))]
    .sort((x, y) => y - x);
  const chain = [st.start];
  for (const d of visited) if (chain.at(-1) % d === 0 && d !== chain.at(-1)) chain.push(d);
  if (chain.at(-1) !== smallest) chain.push(smallest);
  const steps = [];
  for (let i = 1; i < chain.length; i += 1) {
    const g = glue(st.p, st.q, chain[i - 1], chain[i]);
    if (g) steps.push(Object.freeze({ from: [g.a, g.d], to: [g.a2, g.d2], k: g.k }));
  }
  // un seul pas global (27/45 = (27 ÷ 9)/(45 ÷ 9)) : la colle totale
  return steps;
}

/** La colle totale de la seconde part (45 ÷ 5 = 9). */
export function totalGlue(s) {
  if (s.stages.length < 2) return null;
  const st = s.stages[1];
  return glue(st.p, st.q, st.start, readablePeriod(st.p, st.q));
}

/* ── Géométrie : le tout en bandes (px), pure et testée ─────────────────────────────── */

/** La largeur minimale confortable d'un morceau (px) ; le contrat en exige ≥ 6 (testé par balayage). */
const MIN_PIECE = 10;

/**
 * Le nombre de bandes B pour dessiner le tout jusqu'à `max` morceaux dans `width` px : B = 1 si chaque morceau fait au
 * moins `minPiece` px ; sinon le plus petit B ≤ 6 qui DIVISE max et le permet (45 → 3 bandes de 15 : à d = max aucun
 * morceau n'est coupé par une fin de bande) ; à défaut le plus petit B qui le permet. Fixé pour une scène : la mise en
 * page ne saute pas pendant que le couteau bouge.
 */
export function bandsFor(max, width, minPiece = MIN_PIECE) {
  if (width / max >= minPiece) return 1;
  for (let B = 2; B <= 6; B += 1) if (max % B === 0 && (width * B) / max >= minPiece) return B;
  for (let B = 2; B <= 6; B += 1) if ((width * B) / max >= minPiece) return B;
  return 6;
}

/**
 * Le tout de longueur 1, replié en B bandes de largeur `width` (px) lues de DROITE à GAUCHE puis de haut en bas (RTL) ;
 * coupé en d morceaux égaux ; la part [0, p/q] commence à droite de la première bande.
 *   at(n, m) : { band, x } du point à la fraction n/m de la longueur (x en px depuis le bord gauche ; un point sur une
 *              fin de bande est au DÉBUT de la suivante) ; endAt(n, m) : le même point vu comme une FIN (au bout de la
 *              bande précédente) ;
 *   pieces   : [{ i, in: 'full' | 'part' | 'out', len (px, sa longueur totale), segs: [{ band, x0, x1 }] }] —
 *              un morceau coupé par une fin de bande a deux segments (le ruban continue sur la bande suivante) ;
 *   edge     : { band, x } le bord de la part (exact : t = p/q) ; cut(i) : { band, x } de la i-ème coupe.
 * Les segments sont en px (x0 < x1), dans [0, width].
 */
export function trayLayout({ p, q, d, bands = 1, width }) {
  const B = bands;
  const total = width * B; // la longueur dépliée en px
  const pos = (n, m) => {
    // le point de fraction n/m, entier par entier pour la bande (aucun flottant pour décider de la bande)
    let band = Math.floor((n * B) / m);
    let local = (n * B - band * m) / m; // ∈ [0, 1)
    if (band >= B) { band = B - 1; local = 1; }
    return { band, x: width - local * width };
  };
  const endPos = (n, m) => {
    // la FIN d'un segment : n/m tombant exactement sur une fin de bande reste au bout de la bande précédente
    if (n === 0) return { band: 0, x: width };
    const band = Math.ceil((n * B) / m) - 1;
    const local = (n * B - band * m) / m; // ∈ (0, 1]
    return { band, x: width - local * width };
  };
  const pieces = [];
  for (let i = 0; i < d; i += 1) {
    const a = pos(i, d);
    const b = endPos(i + 1, d);
    const segs = [];
    if (a.band === b.band) segs.push({ band: a.band, x0: b.x, x1: a.x });
    else {
      segs.push({ band: a.band, x0: 0, x1: a.x });
      for (let k = a.band + 1; k < b.band; k += 1) segs.push({ band: k, x0: 0, x1: width });
      segs.push({ band: b.band, x0: b.x, x1: width });
    }
    // dedans / à cheval / dehors : exact, en entiers ((i + 1)/d ≤ p/q ⇔ (i + 1)·q ≤ p·d)
    const kind = (i + 1) * q <= p * d ? 'full' : i * q < p * d ? 'part' : 'out';
    pieces.push({ i, in: kind, len: total / d, segs: segs.filter((g) => g.x1 - g.x0 > 1e-9) });
  }
  const edge = endPos(p, q);
  const cut = (i) => (i === 0 ? pos(0, d) : endPos(i, d));
  return { B, width, total, d, pieces, edge, cut, at: pos, endAt: endPos };
}

/** La position continue d (1 … max) sous le pointeur sur le rail (le rail va de droite = 1 à gauche = max, RTL). */
export function railValue(x, { x0, x1, max }) {
  if (x1 <= x0) return 1;
  const t = (x1 - x) / (x1 - x0);
  return 1 + Math.max(0, Math.min(1, t)) * (max - 1);
}
/** L'abscisse d'un d sur le rail. */
export function railX(d, { x0, x1, max }) {
  return max <= 1 ? x1 : x1 - ((d - 1) / (max - 1)) * (x1 - x0);
}

/** « 3,6 » : une fraction exacte en écriture décimale (virgule) si elle est courte, sinon « 18/5 ». */
export const decimalText = (f) => fracDecimal(f, 3) ?? fracText(f);
/** Le produit exact p × d / q, pour les phrases (« 27 × 9 ÷ 45 = 5,4 »). */
export const product = (p, q, d) => mul(frac(p, q), d);

/* ── Onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ──────────────────────────── */

/**
 * LE GUIDE : montre la COMMANDE à trouver maintenant, jamais la réponse (ni le nombre de morceaux, ni la fraction réduite).
 * Les ids se rangent par sorte de commande : knife (glisser le couteau), claim (ouvrir la proposition), claim-knife (recouper
 * pour la juger), judge (la carte de réponse — pas un bouton vrai/faux), next (le cadeau), cursor / plant / start (les épingles).
 * @returns {{ id: string, target: string, gesture: 'tap'|'drag' } | null}
 */
export function coachOf(s) {
  const st = current(s);
  if (s.predicting) {
    if (s.pins.length > 0) return { id: 'start', target: '[data-fk-start]', gesture: 'tap' };
    if (s.cursor === Math.max(1, st.start - 1)) return { id: 'cursor', target: '[data-fk-pin-cursor]', gesture: 'drag' };
    return { id: 'plant', target: '[data-fk-plant]', gesture: 'tap' };
  }
  if (!cutsOf(s, s.stage).length) return { id: 'knife', target: '[data-fk-knife]', gesture: 'drag' };
  if (canOpenClaim(s)) return { id: 'claim', target: '[data-fk-claim-open]', gesture: 'tap' };
  if (s.claim && s.stage === 0 && s.claim.state !== 'closed' && s.claim.state !== 'right') {
    return claimCuttable(s)
      ? { id: 'judge', target: '[data-fk-claim]', gesture: 'tap' }
      : { id: 'claim-knife', target: '[data-fk-knife]', gesture: 'drag' };
  }
  if (canOpenNext(s)) return { id: 'next', target: '[data-fk-next-button]', gesture: 'tap' };
  return null;
}
