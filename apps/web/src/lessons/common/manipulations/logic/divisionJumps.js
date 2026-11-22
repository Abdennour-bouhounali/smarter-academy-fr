/**
 * division-jumps — la logique PURE de la division euclidienne (1AM, unité 3 « الضرب والقسمة », درس
 * « القسمة الإقليدية », manuel نشاط 3 p. 37, معارف 2 p. 41). Aucun React ici ; toute l'arithmétique est
 * ENTIÈRE et passe par `divmod` (`@smarter-academy/core/arithmetic/divisibility.js`, importé par chemin —
 * jamais le barrel du core).
 *
 * L'idée : b (la taille d'une باقة, la longueur d'une قفزة) est DONNÉ ; la main tient q, le nombre de
 * groupes. Trois verdicts, jugés exactement au relâchement (`judge`) :
 *
 *   over   b × q > a        un groupe de trop : il demande des objets qui n'existent pas ;
 *   short  a − b × q ≥ b    un groupe de moins : ce qui reste suffit pour un autre groupe ;
 *   exact  0 ≤ a − b × q < b  le PLUS GRAND nombre de groupes ; on s'arrête quand le reste est plus
 *                           petit que b — pas quand il ne reste rien.
 *
 * Donc a = b × q + r avec r < b, et le حصر b × q ≤ a < b × (q + 1).
 *
 *     let s = init({ a: 47, b: 6, world: 'flowers', then: 48 });
 *     s = commitQ(s, 8);   // over : 48 fleurs pour 8 bouquets, il en manque 1
 *     s = commitQ(s, 5);   // short : il reste 17 fleurs, assez pour un autre bouquet
 *     s = commitQ(s, 7);   // exact : 47 = 6 × 7 + 5, 5 < 6 — discoveryReady(s) === true
 *     s = addFlower(s);    // le contraste : 48 fleurs, et q = 8 ferme tout (r = 0)
 *
 * Un défaut n'est pas un essai (MANIPULATION_CONTRACT §6bis.2) : le ruban s'ouvre à q = 0 (aucun groupe
 * — jamais la réponse dès que a ≥ b) et rien n'est inscrit dans `trials` avant un relâchement.
 */
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';

export const WORLDS = Object.freeze(['flowers', 'line']);

/** Les marques du manuel (« 10 باقات؟ 20 باقة؟ », نشاط 3) : des nombres de groupes à visiter, jamais des réponses. */
export const MARKS = Object.freeze({ '279/14': Object.freeze([10, 20]) });
export const marksOf = (a, b) => MARKS[`${a}/${b}`] ?? [];

/**
 * Le nombre de groupes que la piste permet : le quotient, plus un groupe entamé, plus `extra` de trop (2 sur la
 * droite ; 1 pour les fleurs, dont chaque bouquet de trop coûte une rangée à l'écran d'un téléphone).
 */
export function qMaxOf(a, b, extra = 2) {
  const { q, r } = divmod(a, b);
  return q + (r > 0 ? 1 : 0) + extra;
}

/** Le défaut du ruban : aucun groupe (jamais une réponse quand a ≥ b, et jamais un essai). */
export const DEFAULT_Q = 0;

/**
 * Le verdict EXACT de q groupes de b pour a objets.
 *   { a, b, q, kind, ok, need: b·q, left: a − b·q (≥ 0) ou null, missing: b·q − a (> 0) ou 0, r }
 * `r` est le reste de la tentative quand il existe (left), null quand on a dépassé a.
 */
export function judge(a, b, q) {
  const need = b * q;
  if (need > a) return { a, b, q, kind: 'over', ok: false, need, left: null, missing: need - a, r: null };
  const left = a - need;
  if (left >= b) return { a, b, q, kind: 'short', ok: false, need, left, missing: 0, r: left };
  return { a, b, q, kind: 'exact', ok: true, need, left, missing: 0, r: left };
}

/** Le quotient et le reste euclidiens (divmod du core). */
export const euclid = (a, b) => divmod(a, b);

/* ── État ─────────────────────────────────────────────────────────────────────────── */

const put = (s, patch) => Object.freeze({ ...s, ...patch });

/**
 * `then` (monde flowers) : le second nombre du contraste (47 → 48) ; null sans contraste.
 * `qMax` est calculé sur le plus grand des deux, pour que la scène ne change pas de taille au contraste.
 */
export function init({ a, b, world = 'flowers', then = null }) {
  const th = world === 'flowers' && then != null && then !== a ? then : null;
  return Object.freeze({
    a0: a, a, b, world, then: th,
    qMax: qMaxOf(Math.max(a, th ?? a), b, world === 'flowers' ? 1 : 2),
    q: DEFAULT_Q,
    trials: Object.freeze([]),
    last: null,
  });
}
/** « إعادة » : tout recommencer, mémoire des essais comprise. */
export const reset = (s) => init({ a: s.a0, b: s.b, world: s.world, then: s.then });

const clampQ = (s, q) => Math.max(0, Math.min(s.qMax, Math.round(q)));

/** Pendant le geste : le ruban suit le doigt (pas un essai). */
export function setQ(s, q) {
  const qq = clampQ(s, q);
  return qq === s.q ? s : put(s, { q: qq });
}

/** Le relâchement (ou la pause du clavier / des boutons) : un ESSAI jugé. */
export function commitQ(s, q) {
  const qq = clampQ(s, q);
  const v = judge(s.a, s.b, qq);
  const trial = Object.freeze({ a: s.a, b: s.b, q: qq, kind: v.kind, ok: v.ok, r: v.r });
  return put(s, { q: qq, trials: Object.freeze([...s.trials, trial]), last: Object.freeze({ q: qq, a: s.a, verdict: v }) });
}

/** Le verdict à montrer : celui du dernier relâchement, seulement s'il porte sur le ruban affiché. */
export const shownVerdict = (s) => (s.last && s.last.q === s.q && s.last.a === s.a ? s.last.verdict : null);

/** L'élève a-t-il déjà relâché un essai de ce genre, pour ce a ? */
export const seen = (s, a, kind) => s.trials.some((tr) => tr.a === a && tr.kind === kind);

/**
 * Le contraste qui ouvre la découverte, sur le nombre de la leçon (a0) : un groupe de TROP (over), un groupe
 * de MOINS (short) ET l'arrêt exact. Le second nombre (48) vient APRÈS, en transfert : il ne compte pas.
 */
export function discoveryReady(s) {
  return ['over', 'short', 'exact'].every((kind) => seen(s, s.a0, kind));
}

/** Après l'arrêt exact, ce qu'il manque encore au contraste (« جرّب باقة أكثر / أقل ») — [] sinon. */
export function stillToTry(s) {
  if (!seen(s, s.a0, 'exact') || discoveryReady(s)) return [];
  return ['over', 'short'].filter((kind) => !seen(s, s.a0, kind));
}

/* ── Le contraste 47 → 48 (monde flowers) ─────────────────────────────────────────── */

/** La carte « زهرة جديدة! » s'ouvre après l'arrêt exact sur a0, quand la leçon a un second nombre. */
export const canAddFlower = (s) => s.then != null && s.a === s.a0 && seen(s, s.a0, 'exact');
/** Le même laboratoire, a0 → then ; le ruban reste où il est (7 bouquets : il reste maintenant 6 fleurs). */
export const addFlower = (s) => (canAddFlower(s) ? put(s, { a: s.then, last: null }) : s);
/** Revenir au nombre de la leçon (la mémoire des essais est gardée). */
export const backToFirst = (s) => (s.a === s.a0 ? s : put(s, { a: s.a0, last: null }));
/** Le contraste a-t-il été vu jusqu'au bout (then fermé exactement) ? */
export const thenDone = (s) => s.then != null && seen(s, s.then, 'exact');

/** « أعِد التجربة » (questions du labo) : l'étape repart — le nombre affiché revient au ruban vide et ses essais sont oubliés. */
export function retryStep(s) {
  return put(s, { q: DEFAULT_Q, trials: Object.freeze(s.trials.filter((tr) => tr.a !== s.a)), last: null });
}

/* ── Écritures ────────────────────────────────────────────────────────────────────── */

/** Ce que la leçon reçoit pour un essai (`onTrial`). `r` est null pour un dépassement. */
export const trialEvidence = (tr) => ({ a: tr.a, b: tr.b, q: tr.q, r: tr.r, kind: tr.kind, ok: tr.ok });

/** « 47 = 6 × 7 + 5 » (l'égalité de la division euclidienne de a par b). */
export function formalLine(a, b) {
  const { q, r } = divmod(a, b);
  return `${a} = ${b} × ${q} + ${r}`;
}
/** « 5 < 6 » */
export function remainderLine(a, b) {
  return `${divmod(a, b).r} < ${b}`;
}
/** Le حصر : « 14 × 19 ≤ 279 < 14 × 20 ». */
export function bracketLine(a, b) {
  const { q } = divmod(a, b);
  return `${b} × ${q} ≤ ${a} < ${b} × ${q + 1}`;
}

/**
 * Les mêmes lignes en MORCEAUX insécables, coupables seulement à une jointure mathématique (téléphone : la scène
 * fait 158 px dans معارف). `pieces.join(' ')` est la ligne entière ; la vue les pose dans UN îlot LTR qui
 * passe à la ligne entre deux morceaux — jamais au milieu d'un, jamais en réordonnant.
 */
export function formalPieces(a, b) {
  const { q, r } = divmod(a, b);
  return [`${a} = ${b} × ${q}`, `+ ${r}`];
}
export function bracketPieces(a, b) {
  const { q } = divmod(a, b);
  return [`${b} × ${q} ≤ ${a}`, `< ${b} × ${q + 1}`];
}

/* ── Géométrie : le bloc de fleurs (px), pure et testée ───────────────────────────── */

const GAP = 0.4;     // l'espace entre deux bouquets d'une même rangée, en tailles de fleur
const ROW_DEFAULT = 1.5;   // la hauteur d'une rangée : la voie du ruban (0,38) + la fleur (1) + l'interligne
const LANE_DEFAULT = 0.38;
/** Les proportions de la scène dessinée (2026-10-14) : la pochette de papier d'un bouquet descend à 1,08 taille sous le
 * haut de la fleur, sa pilule de compte est le nœud du ruban (à 0,8). `lane + 1,08 ≤ row` (testé). */
export const BOUQUET_ROWS = Object.freeze({ row: 1.5, lane: 0.2 });

/**
 * Les `slots` places de fleurs (b × qMax : les fleurs ET la place des fantômes d'un dépassement), en rangées
 * qui portent un nombre ENTIER de bouquets (`perRow` = m × b) — un bouquet n'est jamais coupé, son ruban est
 * un seul arc. Lues de DROITE à GAUCHE (le sens de l'élève), rangée après rangée.
 * m est choisi pour que la fleur soit la plus grande possible dans `width` × `maxHeight` (à égalité, le
 * moins de rangées : UNE rangée si elle tient) ; les fleurs rétrécissent avec la scène.
 *
 * @returns {{ m, perRow, rows, size, width, height, rowH, lane, x(i), y(i), posAt(x, y) }}
 *   x(i), y(i) : le coin haut-gauche de la fleur i ; posAt : la position continue (en fleurs) sous le
 *   pointeur, 0 … slots (le bout du ruban). `row` et `lane` (en tailles de fleur) : la hauteur d'une rangée et de
 *   sa voie (par défaut 1,5 et 0,38 ; la scène dessinée passe `BOUQUET_ROWS`).
 */
export function flowerLayout({ slots, b, width, maxHeight, maxSize = 44, row: ROW = ROW_DEFAULT, lane: LANE = LANE_DEFAULT }) {
  const groups = Math.ceil(slots / b);
  let best = null;
  for (let m = 1; m <= groups; m += 1) {
    const rows = Math.ceil(groups / m);
    const byW = width / (m * b + GAP * (m - 1));
    const byH = maxHeight / (rows * ROW);
    const size = Math.min(maxSize, byW, byH);
    if (!best || size > best.size + 1e-9 || Math.abs(size - best.size) <= 1e-9) best = { m, rows, size };
  }
  const { m, rows } = best;
  const size = Math.floor(best.size * 100) / 100;
  const perRow = m * b;
  const groupW = b * size + GAP * size;
  const rowW = m * b * size + GAP * size * (m - 1);
  const rowH = size * ROW;
  const lane = size * LANE;
  const right = width - Math.max(0, (width - rowW) / 2); // le bloc centré
  const x = (i) => {
    const j = i % perRow;
    const k = Math.floor(j / b);
    return right - (k * groupW + (j % b) * size) - size;
  };
  const y = (i) => Math.floor(i / perRow) * rowH + lane;
  const posAt = (px, py) => {
    const row = Math.max(0, Math.min(rows - 1, Math.floor(py / rowH)));
    const fromRight = right - px;
    if (fromRight <= 0) return Math.min(slots, row * perRow);
    const k = Math.floor(fromRight / groupW);
    if (k >= m) return Math.min(slots, (row + 1) * perRow);
    const inner = Math.min(b, (fromRight - k * groupW) / size);
    return Math.min(slots, row * perRow + k * b + inner);
  };
  return { m, perRow, rows, size, width, height: rows * rowH, rowH, lane, right, rowW, x, y, posAt };
}

/* ── Géométrie : la droite graduée (px), pure et testée ───────────────────────────── */

const STEPS = [1, 2, 5, 10, 20, 25, 50, 100];
const ROUND = [50, 100, 200, 500];

/**
 * La droite de 0 à L = b × qMax (au-delà de a), de gauche à droite (la notation est LTR).
 *   xOf(v) : l'abscisse d'une valeur ; valueAt(x) : la valeur sous le pointeur ; jump(i) : le i-ème saut
 *   (de (i − 1)·b à i·b) ; ticks : une graduation lisible (≥ 5 px), un NOMBRE (`label`) seulement sur 0 et les
 *   « ronds » (50, 100 … espacés d'au moins 34 px) qui ne sont PAS des multiples de b — l'élève cherche les
 *   multiples de b lui-même (14 × 10 = 140, 14 × 20 = 280 ne sont jamais imprimés d'avance).
 */
export function lineLayout({ a, b, qMax, width, pad = 22 }) {
  const L = b * qMax;
  const x0 = pad;
  const x1 = Math.max(x0 + 40, width - pad);
  const k = (x1 - x0) / L;
  const xOf = (v) => x0 + v * k;
  const valueAt = (x) => (x - x0) / k;
  const minor = STEPS.find((s) => s * k >= 5) ?? 100;
  const major = ROUND.find((s) => s % minor === 0 && s * k >= 34) ?? 500;
  const ticks = [];
  for (let v = 0; v <= L; v += minor) {
    const isMajor = v % major === 0;
    ticks.push({ v, x: xOf(v), major: isMajor, label: isMajor && (v === 0 || v % b !== 0) });
  }
  const jump = (i) => ({ i, from: (i - 1) * b, to: i * b, x0: xOf((i - 1) * b), x1: xOf(i * b) });
  return { L, x0, x1, k, a, b, xOf, valueAt, ticks, minor, major, jump };
}

/**
 * Le bouquet g (0-based) d'un `flowerLayout` : la pochette de papier derrière ses b fleurs, le ruban qui serre leurs
 * tiges et l'inclinaison de chaque tige vers le centre. Un bouquet n'est jamais coupé (rangées d'un nombre entier de
 * bouquets), donc ses b places sont sur UNE rangée ; lues de droite à gauche, la première est la plus à droite.
 *   { x0, x1 (bords du papier), y (le haut des fleurs), top, band (le ruban, où se pose la pilule), bottom, cx,
 *     leans: [b] (en tailles de fleur, vers le centre) }
 */
export function bouquetShape(lay, g, b) {
  const s = lay.size;
  const first = g * b;
  const last = first + b - 1;
  const left = lay.x(last);
  const right = lay.x(first) + s;
  const y = lay.y(first);
  const cx = (left + right) / 2;
  const leans = Array.from({ length: b }, (_, j) => {
    const fc = lay.x(first + j) + s / 2;
    return ((cx + (fc - cx) * 0.8) - fc) / s;
  });
  return { x0: left - s * 0.08, x1: right + s * 0.08, cx, y, top: y + s * 0.02, band: y + s * 0.8, bottom: y + s * 1.08, leans };
}

/* ── Onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ────────────────────────── */

/**
 * La prochaine commande à montrer à l'élève — jamais la réponse (ni la taille du saut, ni q) : seulement le CONTRÔLE.
 *   handle  tant qu'aucun relâchement n'a eu lieu : la poignée (ruban / lapin) à tirer ;
 *   step    ensuite, tant que la découverte n'est pas prête : les boutons −/+ (le + ; le − si la piste est au bout) ;
 *   next    (fleurs) la carte « زهرة جديدة! » une fois ouverte, après la découverte.
 * Un pas n'est montré qu'une fois (LabCoach retient les ids) : les ids sont par genre de commande.
 * @returns {{ id: string, target: string, gesture: 'tap' | 'drag' } | null}
 */
export function coachOf(s) {
  if (s.trials.length === 0) return { id: 'handle', target: '[data-dj-handle]', gesture: 'drag' };
  if (!discoveryReady(s)) {
    return { id: 'step', target: s.q >= s.qMax ? '[data-dj-less]' : '[data-dj-more]', gesture: 'tap' };
  }
  if (canAddFlower(s)) return { id: 'next', target: '[data-dj-next-button]', gesture: 'tap' };
  return null;
}
