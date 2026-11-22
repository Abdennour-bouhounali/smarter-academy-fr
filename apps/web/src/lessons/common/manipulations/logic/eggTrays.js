/**
 * egg-trays — la logique PURE de la division euclidienne pour TOUT diviseur et du حصر du quotient (2AM, unité 2
 * « الكسور والعمليات عليها », درس « القسمة الإقليدية وحصر حاصل القسمة », manuel نشاط 1 p. 24 — 2145 œufs en plateaux
 * de 30 —, معارف 1 p. 26). Aucun React ici ; toute l'arithmétique est ENTIÈRE et passe par `divmod`
 * (`@smarter-academy/core/arithmetic/divisibility.js`, importé par chemin — jamais le barrel du core). Les flottants ne
 * servent qu'à DESSINER (la position q + r/b du repère) ; chaque verdict compare des entiers (`n·b < a < (n+1)·b`).
 *
 * L'idée : b (les œufs d'une علبة / صفيحة) est DONNÉ ; la main tient a, le nombre d'œufs posés du tapis dans les
 * plateaux (1AM `division-jumps` tenait q, 4AM tenait b). Le plateau ouvert se FERME tout seul à b : il n'en tient
 * jamais b (r < b est physique). Sous le tapis, la RÈGLE DES PLATEAUX est la même ligne lue ÷ b : le repère « a ÷ b »
 * est en q + r/b, strictement entre q (plateaux pleins) et q + 1 (plateaux nécessaires) — et SUR une graduation si et
 * seulement si r = 0.
 *
 *     let s = init({ a: 50, b: 12, world: 'carton' });   // then = 60, max = 7
 *     s = commitFrame(s, 4);       // le pari : 50 ÷ 12 entre 4 et 5 (pas encore jugé : les œufs sont sur le tapis)
 *     s = commitCount(s, 50);      // le tapis est vide → le cadre est jugé : { kind: 'frame', n: 4, ok: true }
 *     s = addEggs(s);              // le contraste : 60 œufs
 *     s = commitCount(s, 60);      // la dernière boîte se ferme EXACTEMENT : le repère est SUR 5
 *     s = claimExact(s);           // « يقع على عدد طبيعي » — { kind: 'exact', ok: true } ; discoveryReady(s) === true
 *
 * Un défaut n'est pas un essai (MANIPULATION_CONTRACT §6bis.2) : le cadre part en [0 ; 1] NON posé (il ne compte pas, et
 * le tapis reste fermé tant qu'il n'est pas posé), les œufs partent à 0, et rien n'entre dans `trials` avant un geste
 * validé. Le cadre est verrouillé pendant le remplissage (0 < a < commande) : le pari ne se corrige pas en regardant le
 * repère avancer ; il se re-pose une fois la commande pleine, et chaque nouvelle pose est un nouvel essai.
 */
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';

/** Dix plateaux font une palette (متقدم) : la valeur de position du quotient se VOIT (7 palettes + 1 plateau = 71). */
export const PALLET = 10;

/* ── Les nombres ─────────────────────────────────────────────────────────────────── */

/** Le second nombre du contraste : celui de la leçon, sinon le multiple de b qui suit a (strictement au-dessus). */
export function thenOf(a, b, then) {
  if (then != null) return then === a ? null : then;
  const { q } = divmod(a, b);
  return b * (q + 1);
}

/** La fin de la règle des plateaux : celle de la leçon, sinon ⌈max(a, then) ÷ b⌉ + 2. */
export function maxOf(a, b, then, max) {
  if (max != null) return max;
  const top = Math.max(a, then ?? a);
  const { q, r } = divmod(top, b);
  return q + (r > 0 ? 1 : 0) + 2;
}

/** L'état de c œufs emballés par b : q plateaux FERMÉS, r œufs dans le plateau ouvert (r < b toujours). */
export function packOf(c, b) {
  const { q, r } = divmod(c, b);
  return { c, b, q, r, pallets: Math.floor(q / PALLET), loose: q % PALLET, marker: q + r / b, onMark: r === 0 };
}

/** Le nombre d'objets dessinés pour q plateaux fermés en palettes de 10 : ⌊q/10⌋ palettes + (q mod 10) plateaux. */
export const drawnUnits = (q) => Math.floor(q / PALLET) + (q % PALLET);

/** La grille d'un plateau (lignes × colonnes = b) : 12 → 2 × 6 (la boîte), 30 → 5 × 6 (le plateau du manuel). */
export function trayGrid(b) {
  const KNOWN = { 6: [2, 3], 10: [2, 5], 12: [2, 6], 30: [5, 6] };
  if (KNOWN[b]) return { rows: KNOWN[b][0], cols: KNOWN[b][1] };
  let r = Math.max(1, Math.floor(Math.sqrt(b)));
  while (b % r !== 0) r -= 1;
  return { rows: r, cols: b / r };
}

/** Les cases remplies d'un plateau ouvert : colonne par colonne, de gauche à droite (la règle se lit de gauche à droite),
 * pour que la part remplie du plateau soit la part r/b de son segment. */
export function openCells(r, b) {
  const { rows } = trayGrid(b);
  return Array.from({ length: r }, (_, j) => ({ row: j % rows, col: Math.floor(j / rows) }));
}

/* ── Les juges ───────────────────────────────────────────────────────────────────── */

/**
 * Le cadre [n ; n + 1] pour a ÷ b. ok ⇔ n·b < a < (n + 1)·b (entiers). Le modèle lit l'erreur :
 *   right      le repère est dans le cadre ;
 *   onMark     r = 0 et le cadre a q pour bord : a ÷ b tombe SUR la graduation, aucun cadre strict n'existe ;
 *   remainder  n = r (≠ q) : le reste pris pour le quotient (le cadre [15 ; 16] pour 2145 ÷ 30) ;
 *   below / above  le cadre est avant / après le repère ; `gap` = les pas jusqu'au segment [q ; q + 1].
 */
export function judgeFrame(a, b, n) {
  const { q, r } = divmod(a, b);
  const ok = n * b < a && a < (n + 1) * b;
  let model;
  if (ok) model = 'right';
  else if (r === 0 && (n === q || n === q - 1)) model = 'onMark';
  else if (r > 0 && n === r && n !== q) model = 'remainder';
  else model = n < q ? 'below' : 'above';
  return { a, b, n, q, r, ok, model, gap: Math.abs(q - n) };
}

/** « يقع على عدد طبيعي » : vrai ⇔ a % b = 0 (le dernier plateau s'est fermé exactement). */
export function judgeExact(a, b) {
  const { q, r } = divmod(a, b);
  return { a, b, q, r, ok: r === 0 };
}

/**
 * La division d'un camarade : a = b × q' + r'. L'égalité est-elle vraie, et est-ce une division euclidienne (0 ≤ r' < b) ?
 * `agree` = la réponse de l'élève (« أوافق »). ok ⇔ l'élève accepte exactement les divisions euclidiennes vraies.
 * Le rejeu : versés dans des plateaux, les r' œufs en ferment ⌊r'/b⌋ autres et en laissent r' mod b.
 */
export function judgeClaim(a, b, claimQ, claimR, agree) {
  const trueEq = claimQ * b + claimR === a;
  const euclid = trueEq && claimR >= 0 && claimR < b;
  const { q: extra, r: left } = divmod(Math.max(0, claimR), b);
  return { a, b, claimQ, claimR, agree, trueEq, euclid, ok: agree === euclid, extra, left, q: claimQ + extra };
}

/* ── État ─────────────────────────────────────────────────────────────────────────── */

const put = (s, patch) => Object.freeze({ ...s, ...patch });
const PASSED_CAP = 400;

export function init({ a, b, world = 'carton', then, claim = null, max }) {
  const th = thenOf(a, b, then);
  return Object.freeze({
    a0: a, a, b, world, then: th,
    claim: claim && Number.isInteger(claim.q) && Number.isInteger(claim.r) ? Object.freeze({ q: claim.q, r: claim.r }) : null,
    max: maxOf(a, b, th, max),
    count: 0,
    committed: 0,
    frame: Object.freeze({ n: 0, placed: false }),
    trials: Object.freeze([]),
    last: null,
    passed: Object.freeze([]),
    claimAnswer: null,
  });
}
/** « إعادة » : tout recommencer (cadre, remplissage, contraste, camarade, mémoire). */
export const reset = (s) => init({ a: s.a0, b: s.b, world: s.world, then: s.then ?? s.a0, claim: s.claim, max: s.max });

/** Le tapis est fermé tant que le pari n'est pas posé (commande du jour seulement). */
export const fillLocked = (s) => s.a === s.a0 && !s.frame.placed && s.count === 0;
/** Le cadre est verrouillé pendant le remplissage. */
export const frameLocked = (s) => s.count > 0 && s.count < s.a;
/** La commande est-elle pleine (le tapis vide) ? */
export const full = (s) => s.count === s.a;

const clampCount = (s, c) => Math.max(0, Math.min(s.a, Math.round(c)));
const clampFrame = (s, n) => Math.max(0, Math.min(s.max - 1, Math.round(n)));
function remember(passed, c) {
  if (c <= 0 || passed.includes(c)) return passed;
  const next = [...passed, c];
  return Object.freeze(next.length > PASSED_CAP ? next.slice(next.length - PASSED_CAP) : next);
}

/** Pendant le geste : le tapis suit la main (pas un essai). */
export function setCount(s, c) {
  if (fillLocked(s)) return s;
  const cc = clampCount(s, c);
  return cc === s.count ? s : put(s, { count: cc, passed: remember(s.passed, cc) });
}

function pushTrial(s, trial, last) {
  return put(s, { trials: Object.freeze([...s.trials, Object.freeze(trial)]), last: Object.freeze(last ?? trial) });
}
function frameTrial(s) {
  const v = judgeFrame(s.a, s.b, s.frame.n);
  const prev = s.trials.at(-1);
  if (prev && prev.kind === 'frame' && prev.a === s.a && prev.n === s.frame.n && s.last === prev) return s;
  return pushTrial(s, { kind: 'frame', ...v });
}

/** Le relâchement (ou la pause des boutons) : la commande pleine fait juger le cadre posé. */
export function commitCount(s, c) {
  const s1 = setCount(s, c);
  if (s1 === s && s.committed === s.count) return s;
  const reached = s1.count === s1.a && s.committed !== s1.a;
  const s2 = put(s1, { committed: s1.count });
  return reached && s2.frame.placed ? frameTrial(s2) : s2;
}

/** Pendant le geste : le cadre suit la main (refusé pendant le remplissage). */
export function setFrame(s, n) {
  if (frameLocked(s)) return s;
  const nn = clampFrame(s, n);
  return nn === s.frame.n ? s : put(s, { frame: Object.freeze({ n: nn, placed: s.frame.placed }) });
}

/** Le relâchement du cadre : il est POSÉ ; commande pleine → un essai jugé. */
export function commitFrame(s, n) {
  if (frameLocked(s)) return s;
  const s1 = put(s, { frame: Object.freeze({ n: clampFrame(s, n), placed: true }) });
  return full(s1) ? frameTrial(s1) : s1;
}

/** « يقع على عدد طبيعي » — seulement commande pleine. */
export function claimExact(s) {
  if (!full(s) || s.count === 0) return s;
  const prev = s.trials.at(-1);
  if (prev && prev.kind === 'exact' && prev.a === s.a && s.last === prev) return s;
  return pushTrial(s, { kind: 'exact', ...judgeExact(s.a, s.b) });
}

/** Une commande est accomplie : cadre juste (r ≠ 0) ou « يقع على عدد طبيعي » juste (r = 0). */
function orderDone(s, a) {
  const exact = a % s.b === 0;
  return s.trials.some((tr) => tr.a === a && tr.ok && tr.kind === (exact ? 'exact' : 'frame'));
}

/** La carte « بيض إضافي » : la commande du jour accomplie, et la leçon a un second nombre. */
export const canAddEggs = (s) => s.then != null && s.a === s.a0 && orderDone(s, s.a0);
/** Le même laboratoire, a0 → then : les œufs déjà emballés restent ; le cadre redevient un pari à poser. */
export const addEggs = (s) => (canAddEggs(s)
  ? put(s, { a: s.then, frame: Object.freeze({ n: s.frame.n, placed: false }), last: null })
  : s);
export const thenDone = (s) => s.then != null && orderDone(s, s.then);

/** La carte du camarade (متقدم) : après le contraste (ou la commande, sans contraste). */
export const claimOpen = (s) => s.claim != null && (s.then != null ? thenDone(s) : orderDone(s, s.a0));
export function answerClaim(s, agree) {
  if (!claimOpen(s) || s.claimAnswer != null) return s;
  const v = judgeClaim(s.a0, s.b, s.claim.q, s.claim.r, !!agree);
  return put(pushTrial(s, { kind: 'claim', ...v }), { claimAnswer: !!agree });
}

/* ── Les étapes du labo (LabStepper, questions pendant le labo) ─────────────────────── */

/** Les étapes : la commande du jour, le contraste (s'il existe), le camarade (s'il existe). */
export const stepIds = (s) => ['order', ...(s.then != null ? ['then'] : []), ...(s.claim != null ? ['claim'] : [])];
/** Une étape est-elle accomplie ? */
export function stepDone(s, id) {
  if (id === 'order') return orderDone(s, s.a0);
  if (id === 'then') return thenDone(s);
  return s.claimAnswer != null;
}
/** La dernière étape accomplie (celle dont les questions se posent), ou -1. Les étapes s'accomplissent dans l'ordre. */
export const lastDoneStep = (s) => stepIds(s).reduce((acc, id, i) => (stepDone(s, id) ? i : acc), -1);
/** L'étape en cours : la première non accomplie (la dernière si tout est fait). */
export const currentStep = (s) => { const ids = stepIds(s); const i = ids.findIndex((id) => !stepDone(s, id)); return i < 0 ? ids.length - 1 : i; };
/** « أعِد التجربة » : LA MÊME étape repart — la commande du jour (tout), le contraste (les œufs du jour restent), ou l'avis sur le camarade. */
export function retryStep(s, id) {
  if (id === 'order') return reset(s);
  if (id === 'then') {
    return put(s, { a: s.then, count: Math.min(s.count, s.a0), committed: Math.min(s.count, s.a0), frame: Object.freeze({ n: s.frame.n, placed: false }),
      trials: Object.freeze(s.trials.filter((tr) => tr.a !== s.then || tr.kind === 'claim')), last: null });
  }
  return put(s, { claimAnswer: null, trials: Object.freeze(s.trials.filter((tr) => tr.kind !== 'claim')), last: null });
}

/** La découverte : la commande du jour encadrée juste, le contraste atterri SUR la graduation, le camarade jugé. */
export function discoveryReady(s) {
  if (!orderDone(s, s.a0)) return false;
  if (s.then != null && !thenDone(s)) return false;
  return s.claim == null || s.claimAnswer != null;
}

/** Le verdict à montrer : celui du dernier geste jugé, tant qu'il porte sur ce qui est à l'écran. */
export function shownVerdict(s) {
  const v = s.last;
  if (!v) return null;
  if (v.kind === 'claim') return v;
  if (v.a !== s.a || !full(s)) return null;
  if (v.kind === 'frame' && v.n !== s.frame.n) return null;
  return v;
}

/** Ce que la leçon reçoit (`onTrial`) — le contrat de props du brief. */
export function trialEvidence(tr) {
  if (tr.kind === 'frame') return { kind: 'frame', a: tr.a, b: tr.b, q: tr.q, r: tr.r, n: tr.n, ok: tr.ok, model: tr.model };
  if (tr.kind === 'exact') return { kind: 'exact', a: tr.a, b: tr.b, q: tr.q, ok: tr.ok };
  return { kind: 'claim', a: tr.a, b: tr.b, claimQ: tr.claimQ, claimR: tr.claimR, agree: tr.agree, ok: tr.ok };
}

/* ── Les réfutations : les nombres de l'élève ─────────────────────────────────────── */

/**
 * « quand le nombre d'œufs est pair » : un a PAIR à reste non nul — a0 s'il l'est, sinon le dernier nombre pair que l'élève
 * a fait passer sur le tapis (2140 = 30 × 71 + 10), sinon un voisin de a0 (`passed: false`).
 * « quand il y a plus d'œufs qu'une boîte » : a0 lui-même (> b, reste non nul), et un multiple de b qu'il a traversé.
 */
export function refutations(s) {
  const { a0, b } = s;
  const nonExact = (n) => n > 0 && n % b !== 0;
  let even = null;
  if (a0 % 2 === 0 && nonExact(a0)) even = { n: a0, passed: true };
  else {
    const p = [...s.passed].reverse().find((c) => c % 2 === 0 && nonExact(c) && c > b);
    if (p != null) even = { n: p, passed: true };
    else {
      for (let d = 1; d <= 2 * b + 2 && !even; d += 1) {
        for (const n of [a0 - d, a0 + d]) if (!even && n > b && n % 2 === 0 && nonExact(n)) even = { n, passed: false };
      }
    }
  }
  if (even) Object.assign(even, divmod(even.n, b));
  const bigger = { n: a0, ...divmod(a0, b) };
  const multiples = s.passed.filter((c) => c >= b && c % b === 0).sort((x, y) => x - y);
  const mult = multiples.length ? multiples.at(-1) : null;
  return { even, bigger, mult: mult == null ? null : { n: mult, q: mult / b } };
}

/* ── Écritures (des morceaux insécables, posés dans UN îlot LTR) ────────────────────── */

export function formalPieces(a, b) {
  const { q, r } = divmod(a, b);
  return [`${a} = ${b} × ${q}`, `+ ${r}`];
}
export const remainderLine = (a, b) => `${divmod(a, b).r} < ${b}`;
/** Le حصر du quotient : [q, a, b, q + 1] (la vue écrit q < a/b < q + 1 avec une vraie fraction). */
export function bracketOf(a, b) {
  const { q, r } = divmod(a, b);
  return { q, r, q1: q + 1, a, b, exact: r === 0 };
}

/* ── Géométrie (px), pure et testée ───────────────────────────────────────────────── */

const LABEL_STEPS = [1, 10, 20, 50, 100];
const SHORT_STEPS = [1, 2, 5, 10];
const TICK_STEPS = [1, 2, 5, 10, 20, 50];

/**
 * La règle des plateaux (et le tapis : la MÊME ligne, en œufs ÷ b), de gauche à droite (la notation est LTR) :
 * 0 … max plateaux entre x0 et x1. `xOf(v)` (v en plateaux, flottant pour le dessin), `xOfEggs(c)`, `trayAt(px)` (le
 * segment sous le pointeur), `eggsAt(px)` ; `ticks` : une graduation tous les `tick` plateaux (≥ 3 px), un nombre tous
 * les `label` (≥ 22 px ; 1 si la place le permet).
 */
export function axisLayout({ max, b, width, padL = 14, padR = 14 }) {
  const x0 = padL;
  const x1 = Math.max(x0 + 40, width - padR);
  const u = (x1 - x0) / max;
  const xOf = (v) => x0 + v * u;
  const xOfEggs = (c) => xOf(c / b);
  const trayAt = (px) => Math.floor((px - x0) / u);
  const eggsAt = (px) => ((px - x0) / u) * b;
  // un nombre tous les 1, 2 ou 5 sur une règle courte ; tous les 10 sur une longue (jamais 71, 72 : l'élève les cherche)
  const label = (max >= 20 ? LABEL_STEPS : SHORT_STEPS).find((st) => st * u >= 22) ?? 100;
  const tick = TICK_STEPS.find((st) => st * u >= 3 && label % st === 0) ?? label;
  const ticks = [];
  for (let v = 0; v <= max; v += tick) ticks.push({ v, x: xOf(v), label: v % label === 0, major: v % label === 0 });
  return { max, b, x0, x1, u, xOf, xOfEggs, trayAt, eggsAt, ticks, label, tick };
}

/**
 * Les œufs ENCORE sur le tapis (monde `carton`, chaque œuf dessiné une fois) : l'œuf i (0-based) est posé à sa
 * place sur la ligne — la colonne ⌊i / rows⌋ d'une bande de `rows` rangées, chaque colonne large de u·rows/b —, donc
 * l'œuf i est au-dessus de i ÷ b sur la règle. `rows` est le plus petit nombre de rangées qui donne un œuf d'au moins
 * `minW` px. Retourne { rows, colW, w, h, height, pos(i) → { x, y } (le centre) }.
 */
export function beltLayout({ b, u, x0, minW = 7, maxW = 15, maxRows = 6 }) {
  let rows = 1;
  while (rows < maxRows && (u * rows) / b < minW) rows += 1;
  const colW = (u * rows) / b;
  const w = Math.min(maxW, colW * 0.86);
  const h = w * 1.25;
  const rowH = h + 1.5;
  const pos = (i) => ({ x: x0 + (Math.floor(i / rows) + 0.5) * colW, y: (i % rows) * rowH + rowH / 2 });
  return { rows, colW, w, h, rowH, height: rows * rowH, pos };
}

/** Le zoom sur [q ; q + 1] : le plateau ouvert agrandi (rows × cols cases carrées), dans `width` × `maxH`. */
export function zoomLayout({ b, width, maxH, maxCell = 30, minCell = 9 }) {
  const { rows, cols } = trayGrid(b);
  const cell = Math.max(minCell, Math.min(maxCell, width / cols, maxH / rows));
  return { rows, cols, cell, w: cols * cell, h: rows * cell, fillW: (r) => (cols * cell * r) / b };
}

/* ── LabCoach (MANIPULATION_CONTRACT §8quater) ───────────────────────────────────── */

/**
 * La prochaine action utile, en données pures `{ id, target, gesture }` — elle montre la COMMANDE, jamais la réponse
 * (ni le nombre de plateaux, ni le reste, ni si le quotient tombe sur une graduation) :
 *   frame  — avant le premier œuf : le cadre se pose sur la règle (le tapis est fermé tant qu'il n'est pas posé) ;
 *   handle — le manche du tapis, tant que la commande n'est pas pleine ;
 *   exact  — commande pleine, rien de jugé : le bouton « يقع على عدد طبيعي » existe (il est montré pour TOUT nombre) ;
 *   next   — la carte « بيض إضافي » (contraste) ;
 *   claim  — la carte du camarade (متقدم) : on montre la carte, pas un des deux avis.
 * `null` : rien à montrer (but atteint, ou un cadre à rejouer librement).
 */
export function coachOf(s) {
  if (discoveryReady(s)) return null;
  if (fillLocked(s)) return { id: 'frame', target: '[data-et-frame-handle]', gesture: 'drag' };
  if (!full(s)) return { id: 'handle', target: '[data-et-handle]', gesture: 'drag' };
  if (canAddEggs(s)) return { id: 'next', target: '[data-et-next-button]', gesture: 'tap' };
  if (claimOpen(s) && s.claimAnswer == null) return { id: 'claim', target: '[data-et-claim]', gesture: 'tap' };
  if (!orderDone(s, s.a)) return { id: 'exact', target: '[data-et-exact]', gesture: 'tap' };
  return null;
}
