/**
 * midpoint-distance — la logique PURE du RENDEZ-VOUS GPS (unité 12 « الأشعة في معلم », درس « إحداثيتا منتصف قطعة
 * مستقيم والمسافة بين نقطتين في معلم »). Aucun React ici et AUCUNE arithmétique propre : chaque verdict vient de
 * packages/core/arithmetic/vectors.js (`relation`, `midpoint`, `vec`, `vecAdd`, `vecScale`, `normSquared`, `distance`)
 * et des fractions de linear.js ; les flottants ne servent qu'au dessin.
 *
 * DEUX ÉTAPES dans un même niveau, la seconde OUVERTE par l'élève (MANIPULATION_CONTRACT §7quater : une carte, un
 * bouton, un retour) :
 *
 *   `meet` (نشاط 3) — deux amis A et B partagent leur position ; l'élève TIENT l'épingle du rendez-vous M (demi-maille
 *     par demi-maille) et la valide. « À mi-chemin » n'est accepté que si $\overrightarrow{AM} = \overrightarrow{MB}$
 *     (`vectors.relation`, la propriété de l'unité 11 que « أستعدّ » 5 rappelle) — c'est-à-dire en
 *     ((xA + xB)/2 ; (yA + yB)/2). Les deux propositions de la discussion de groupe sont des PIÈGES calculés : la somme
 *     (xA + xB ; yA + yB) sans diviser par 2 (MISC-MAALAM-MUNTASAF-NISF) et la demi-différence ((xB − xA)/2 ; …)
 *     (MISC-MAALAM-MUNTASAF-TARH) ; chacune, validée, est refusée avec sa raison.
 *
 *   `distance` (نشاط 4) — l'élève construit l'ESCALIER à angle droit : il tient le coin C (nœud par nœud) ; A → C puis
 *     C → B doivent suivre les rues du quadrillage (un pas horizontal, un pas vertical), donc C = (xB ; yA) ou
 *     (xA ; yB) — le manuel place C en (xB ; yA) par sa figure. Un coin ailleurs laisse un tronçon en biais : refusé en
 *     disant ce qui manque. L'escalier posé, les jambes |Δx| et |Δy| se lisent, et l'élève RÉCLAME la distance GPS :
 *     |Δx| + |Δy| (la marche dans les rues, MISC-MAALAM-MASAFA-JADHR-JAM), Δx² + Δy² (le carré, MISC-MAALAM-MASAFA-
 *     JADHR-NASI) ou √(Δx² + Δy²) — seule la troisième est acceptée (Pythagore, `vectors.distance`, exacte).
 *
 * UN ESSAI est une position VALIDÉE (relâchement, Entrée, ثبّت, pause du clavier) ou une réclamation — jamais une valeur
 * que le doigt a traversée.
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as Q from '@smarter-academy/core/arithmetic/linear.js';

const MEET_STEP = 0.5;
const CLAIMS = Object.freeze(['taxi', 'square', 'root']);

const toPt = (p) => (p && typeof p.x === 'object' ? p : V.point(p[0], p[1]));
export const xy = (p) => V.coords(toPt(p));
const same = (p, q) => V.vecEq(toPt(p), toPt(q));
const absF = (p) => (Q.cmp(p, 0) < 0 ? Q.neg(p) : p);
const ORIGIN = V.point(0, 0);

/** Le cadre (unités entières) qui contient des points, l'origine O et une maille de marge, rendu presque carré. */
function windowOf(points, { maxAspect = 1.6 } = {}) {
  const cs = [ORIGIN, ...points].map(xy);
  const xs = cs.map((c) => c[0]); const ys = cs.map((c) => c[1]);
  let xMin = Math.floor(Math.min(...xs)) - 1; let xMax = Math.ceil(Math.max(...xs)) + 1;
  let yMin = Math.floor(Math.min(...ys)) - 1; let yMax = Math.ceil(Math.max(...ys)) + 1;
  // une bande étroite n'est pas une carte : on élargit le petit côté, des deux côtés (règle §8bis « bloc presque carré »)
  while ((xMax - xMin) / (yMax - yMin) > maxAspect) { if ((yMax - yMin) % 2) yMax += 1; else yMin -= 1; }
  while ((yMax - yMin) / (xMax - xMin) > maxAspect) { if ((xMax - xMin) % 2) xMax += 1; else xMin -= 1; }
  return Object.freeze({ xMin, xMax, yMin, yMax });
}

const OFFSETS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [0, 2], [-2, 0], [0, -2]];
function freeStart(from, avoid, inWin) {
  for (const [dx, dy] of OFFSETS) {
    const p = V.translate(from, V.point(dx, dy));
    if (inWin(p) && !avoid.some((q) => V.vecEq(p, q))) return p;
  }
  throw new Error('midpoint-distance: pas de départ libre');
}
const insideOf = (win) => (p) => { const [x, y] = xy(p); return x >= win.xMin && x <= win.xMax && y >= win.yMin && y <= win.yMax; };

// ── l'étape « meet » (المنتصف) ───────────────────────────────────────────────

function initMeet({ A = [1, -1], B = [4, 3], names = ['A', 'B', 'I'] } = {}) {
  const a = toPt(A); const b = toPt(B);
  if (V.vecEq(a, b)) throw new Error('midpoint-distance: A = B');
  const I = V.midpoint(a, b);
  const sum = V.vecAdd(a, b);                    // le piège NISF : (xA + xB ; yA + yB)
  const diff = V.vecScale(V.vec(a, b), '1/2');   // le piège TARH : ((xB − xA)/2 ; (yB − yA)/2)
  if (V.vecEq(diff, I) || V.vecEq(sum, I)) throw new Error('midpoint-distance: un piège coïncide avec le milieu (A en O ?)');
  const win = windowOf([a, b, I, sum, diff]);
  // départ : un quart du chemin depuis A, sur un nœud entier, jamais sur le milieu ni sur un piège
  const quarter = V.point(Math.round(xy(a)[0] + (xy(b)[0] - xy(a)[0]) / 4), Math.round(xy(a)[1] + (xy(b)[1] - xy(a)[1]) / 4));
  const avoid = [a, b, I, sum, diff];
  const M = avoid.some((q) => V.vecEq(q, quarter)) ? freeStart(quarter, avoid, insideOf(win)) : quarter;
  return Object.freeze({ A: a, B: b, names, I, sum, diff, win, M, start: M, solved: false, trials: Object.freeze([]) });
}

/**
 * Le verdict d'une position M du rendez-vous :
 *   'ok'      — AM = MB : M est le milieu ;
 *   'sum'     — M = (xA + xB ; yA + yB) : on a additionné sans diviser par 2 ;
 *   'diff'    — M = ((xB − xA)/2 ; (yB − yA)/2) : la moitié des composantes de AB, posée depuis O et non depuis A ;
 *   'unequal' — M sur [AB] mais AM ≠ MB (même منحى, même اتجاه) — `closer` dit de quel ami M est plus près ;
 *   'off'     — M hors du segment : AM et MB n'ont pas le même منحى (ou des اتجاهان متعاكسان) ;
 *   'end'     — M sur A ou B : l'un des deux amis ne bouge pas.
 */
export function judgeMeet(m, P = m.M) {
  const p = toPt(P);
  const AM = V.vec(m.A, p); const MB = V.vec(p, m.B);
  if (V.isZeroVec(AM) || V.isZeroVec(MB)) return Object.freeze({ kind: 'end', AM, MB, rel: null, closer: V.isZeroVec(AM) ? 'A' : 'B' });
  const rel = V.relation(AM, MB);
  let kind;
  if (rel.equal) kind = 'ok';
  else if (V.vecEq(p, m.sum)) kind = 'sum';
  else if (V.vecEq(p, m.diff)) kind = 'diff';
  else if (rel.direction && rel.sense) kind = 'unequal';
  else kind = 'off';
  const c = Q.cmp(V.normSquared(AM), V.normSquared(MB));
  return Object.freeze({ kind, AM, MB, rel, closer: c < 0 ? 'A' : c > 0 ? 'B' : null });
}

/** Le nœud (demi-maille) le plus proche d'un point continu, borné au cadre. */
function meetNodeAt(m, x, y) {
  const snap = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(v / MEET_STEP) * MEET_STEP));
  return V.point(String(snap(x, m.win.xMin, m.win.xMax)), String(snap(y, m.win.yMin, m.win.yMax)));
}

// ── l'étape « distance » (المسافة) ───────────────────────────────────────────

function initDistance({ A = [1, -1], B = [4, 3], names = ['A', 'B', 'C'] } = {}) {
  const a = toPt(A); const b = toPt(B);
  const d = V.vec(a, b);
  if (Q.isZero(d.x) || Q.isZero(d.y)) throw new Error('midpoint-distance: [AB] parallèle à un axe, pas d’escalier');
  for (const p of [a, b]) if (!xy(p).every(Number.isInteger)) throw new Error('midpoint-distance: nœuds entiers');
  const cornerH = V.point(b.x, a.y); // (xB ; yA) : d'abord horizontal (la figure du manuel)
  const cornerV = V.point(a.x, b.y); // (xA ; yB) : d'abord vertical
  const win = windowOf([a, b, cornerH, cornerV]);
  const C = freeStart(a, [a, b, cornerH, cornerV], insideOf(win));
  const h = absF(d.x); const v = absF(d.y);
  return Object.freeze({
    A: a, B: b, names, cornerH, cornerV, win, C,
    h, v, taxi: Q.add(h, v), square: V.normSquared(d), root: V.distance(a, b),
    start: C, cornerOk: null, solved: false, trials: Object.freeze([]),
  });
}

/**
 * Le verdict d'un coin C de l'escalier :
 *   'ok'      — C = (xB ; yA) ou (xA ; yB) : A → C → B suit les rues, angle droit en C (`which` = 'h' | 'v') ;
 *   'slant'   — le premier tronçon suit une rue mais le second est en biais : `missing` = ce qu'il reste à parcourir
 *               dans la direction du premier tronçon pour arriver à l'aplomb de B (en carreaux, signé) ;
 *   'offStreet' — A → C n'est ni horizontal ni vertical ;
 *   'end'     — C posé sur A ou sur B : pas d'escalier.
 */
export function judgeCorner(s, P = s.C) {
  const c = toPt(P);
  if (V.vecEq(c, s.A) || V.vecEq(c, s.B)) return Object.freeze({ kind: 'end' });
  if (V.vecEq(c, s.cornerH)) return Object.freeze({ kind: 'ok', which: 'h' });
  if (V.vecEq(c, s.cornerV)) return Object.freeze({ kind: 'ok', which: 'v' });
  const ac = V.vec(s.A, c); const cb = V.vec(c, s.B);
  if (Q.isZero(ac.y)) return Object.freeze({ kind: 'slant', first: 'h', missing: Q.toNumber(cb.x) });
  if (Q.isZero(ac.x)) return Object.freeze({ kind: 'slant', first: 'v', missing: Q.toNumber(cb.y) });
  return Object.freeze({ kind: 'offStreet' });
}

function distNodeAt(s, x, y) {
  const cx = Math.min(s.win.xMax, Math.max(s.win.xMin, Math.round(x)));
  const cy = Math.min(s.win.yMax, Math.max(s.win.yMin, Math.round(y)));
  return V.point(cx, cy);
}

// ── l'état complet ───────────────────────────────────────────────────────────

/** numbers = { A, B, names } (le rendez-vous) et `dist: { A, B, names }` (l'escalier ; défaut : les mêmes amis). */
export function init(n = {}) {
  const meet = initMeet({ A: n.A, B: n.B, names: n.names });
  const d = n.dist ?? {};
  const dist = initDistance({ A: d.A ?? n.A, B: d.B ?? n.B, names: d.names ?? [meet.names[0], meet.names[1], 'C'] });
  return Object.freeze({ stage: 'meet', meet, dist, last: null, n: 0 });
}

const put = (s, key, part, last) => Object.freeze({ ...s, [key]: Object.freeze({ ...s[key], ...part }), ...(last !== undefined ? { last } : {}) });

/** Déplacer le point tenu de l'étape courante (M ou C), sans essai. */
export function moveHeld(s, x, y) {
  if (s.stage === 'meet') {
    const p = meetNodeAt(s.meet, x, y);
    return V.vecEq(p, s.meet.M) ? s : put(s, 'meet', { M: p }, Object.freeze({ kind: 'move' }));
  }
  if (s.dist.cornerOk) return s; // l'escalier posé est figé (le bouton « عودة » de la carte le libère)
  const p = distNodeAt(s.dist, x, y);
  return V.vecEq(p, s.dist.C) ? s : put(s, 'dist', { C: p }, Object.freeze({ kind: 'move' }));
}
export const nudgeHeld = (s, dx, dy) => {
  const [x, y] = xy(s.stage === 'meet' ? s.meet.M : s.dist.C);
  const step = s.stage === 'meet' ? MEET_STEP : 1;
  return moveHeld(s, x + dx * step, y + dy * step);
};

/** Valider la position du point tenu : un essai. */
export function commitHeld(s, at) {
  const moved = at ? moveHeld(s, ...at) : s;
  if (moved.stage === 'meet') {
    const m = moved.meet;
    const j = judgeMeet(m);
    const trial = Object.freeze({ stage: 'meet', kind: j.kind, at: xy(m.M), closer: j.closer, AM: xy(j.AM), MB: xy(j.MB) });
    return Object.freeze({
      ...put(moved, 'meet', { solved: m.solved || j.kind === 'ok', trials: Object.freeze([...m.trials, trial]) }, Object.freeze({ kind: 'commit', trial })),
      n: moved.n + 1,
    });
  }
  const d = moved.dist;
  if (d.cornerOk) return moved;
  const j = judgeCorner(d);
  const trial = Object.freeze({ stage: 'distance', kind: j.kind, at: xy(d.C), which: j.which ?? null, first: j.first ?? null, missing: j.missing ?? null });
  return Object.freeze({
    ...put(moved, 'dist', { cornerOk: j.kind === 'ok' ? j.which : null, trials: Object.freeze([...d.trials, trial]) }, Object.freeze({ kind: 'commit', trial })),
    n: moved.n + 1,
  });
}

/** Une proposition de la discussion de groupe (piège) : l'épingle y va ; c'est à l'élève de la valider. */
export function tryProposal(s, which) {
  if (s.stage !== 'meet' || !['sum', 'diff'].includes(which)) return s;
  return moveHeld(s, ...xy(s.meet[which]));
}

/** Réclamer la distance GPS AB (après l'escalier) : 'taxi' | 'square' | 'root'. */
export function claim(s, which) {
  if (s.stage !== 'distance' || !s.dist.cornerOk || !CLAIMS.includes(which)) return s;
  const kind = which === 'root' ? 'ok' : which;
  const trial = Object.freeze({ stage: 'distance', kind: `claim-${kind}`, claim: which });
  return Object.freeze({
    ...put(s, 'dist', { solved: s.dist.solved || which === 'root', trials: Object.freeze([...s.dist.trials, trial]) }, Object.freeze({ kind: 'commit', trial })),
    n: s.n + 1,
  });
}

/** Rouvrir l'escalier (changer de coin) — l'étape reste accomplie si la distance a été trouvée. */
export const reopenCorner = (s) => (s.stage === 'distance' ? put(s, 'dist', { cornerOk: null }, null) : s);

/** « أعِد التجربة » : la MÊME étape repart (le point tenu au départ, le drapeau « réussie » effacé) ; les essais restent au journal. */
export const retryStage = (s, stage) => (stage === 'meet'
  ? put(s, 'meet', { M: s.meet.start, solved: false }, null)
  : put(s, 'dist', { C: s.dist.start, cornerOk: null, solved: false }, null));

export const openDistance = (s) => (s.meet.solved ? Object.freeze({ ...s, stage: 'distance', last: null }) : s);
export const backToMeet = (s) => Object.freeze({ ...s, stage: 'meet', last: null });

const refused = (t) => t.kind !== 'ok' && t.kind !== 'claim-ok' && t.kind !== 'end';
/** Le contraste de chaque étape : la réussite ET au moins un essai refusé par la mathématique. */
export const meetReady = (s) => s.meet.solved && s.meet.trials.some(refused);
export const distReady = (s) => s.dist.solved && s.dist.trials.some(refused);
export const discoveryReady = (s) => meetReady(s) && distReady(s);

/**
 * Les composantes AM et MB se lisent-elles ? مبتدئ : toujours ; متقدم : seulement sur la position du rendez-vous qui
 * vient d'être VALIDÉE. Le dernier essai peut être une réclamation de distance (sans `at`) : elle ne montre rien.
 */
export function meetReadingLive(s, advanced) {
  if (!advanced) return true;
  const t = s.last?.kind === 'commit' ? s.last.trial : null;
  return !!(t && t.stage === 'meet' && t.at && same(t.at, s.meet.M));
}

/** Le dernier essai d'une étape qui vérifie un prédicat (réfuter un distracteur par les essais de l'élève). */
export const lastTrial = (s, stage, pred) => [...s[stage === 'meet' ? 'meet' : 'dist'].trials].reverse().find(pred) ?? null;

// ── les écritures (KaTeX) ────────────────────────────────────────────────────

const paren = (p) => { const t = V.numLatex(p); return Q.cmp(p, 0) < 0 ? `(${t})` : t; };
/** « \begin{pmatrix} 3 \\ -2 \end{pmatrix} » d'un couple. */
export const colLatex = (u) => V.vecLatex(toPt(u));
/** « x_J = \dfrac{5 + (-3)}{2} = 1 » et la même chose pour y. */
export function midFormulaLatex(m) {
  const [a, b, i] = m.names;
  const line = (k) => `${k}_{${i}} = \\dfrac{${V.numLatex(m.A[k])} + ${paren(m.B[k])}}{2} = ${V.numLatex(m.I[k])}`;
  return { x: line('x'), y: line('y'), point: V.pointLatex(i, m.I), general: `${'x'}_{${i}} = \\dfrac{x_{${a}} + x_{${b}}}{2}` };
}
/** « AB = \sqrt{(4 - 1)^2 + (3 - (-1))^2} = \sqrt{25} = 5 » — `distance` exacte de vectors.js. */
export function distFormulaLatex(s) {
  const [a, b] = s.names;
  const dx = `${V.numLatex(s.B.x)} - ${paren(s.A.x)}`; const dy = `${V.numLatex(s.B.y)} - ${paren(s.A.y)}`;
  const sq = V.numLatex(s.square);
  const exact = V.distanceLatex(s.A, s.B);
  const tail = exact === `\\sqrt{${sq}}` ? '' : ` = ${exact}`;
  return `${a}${b} = \\sqrt{(${dx})^2 + (${dy})^2} = \\sqrt{${sq}}${tail}`;
}
export const legLatex = (p) => V.numLatex(p);
/** La forme courte (écrans étroits) : « AB = \sqrt{25} = 5 ». */
export function distShortLatex(s) {
  const [a, b] = s.names; const sq = V.numLatex(s.square); const exact = V.distanceLatex(s.A, s.B);
  return exact === `\\sqrt{${sq}}` ? `${a}${b} = ${exact}` : `${a}${b} = \\sqrt{${sq}} = ${exact}`;
}
export const rootLatex = (s) => V.distanceLatex(s.A, s.B);
/** La distance exacte en texte (« 5 », « 2√13 ») pour une étiquette SVG. */
export const rootPlain = (s) => V.distanceText(s.A, s.B);

/** Ce que le module affiche de l'essai (`onTrial`) — les composantes, les jambes, la distance. */
export function evidenceOf(s) {
  const t = s.last?.kind === 'commit' ? s.last.trial : null;
  if (!t) return null;
  if (t.stage === 'meet') return { stage: 'meet', n: s.n, kind: t.kind, names: s.meet.names, at: t.at, AM: t.AM, MB: t.MB };
  return {
    stage: 'distance', n: s.n, kind: t.kind, names: s.dist.names, at: t.at ?? null, claim: t.claim ?? null,
    corner: s.dist.cornerOk ? xy(s.dist.C) : null, h: Q.toNumber(s.dist.h), v: Q.toNumber(s.dist.v), root: V.distanceText(s.dist.A, s.dist.B),
    claimTex: t.claim ? (t.claim === 'root' ? V.distanceLatex(s.dist.A, s.dist.B) : V.numLatex(t.claim === 'taxi' ? s.dist.taxi : s.dist.square)) : null,
  };
}

// ── le dessin ────────────────────────────────────────────────────────────────

const winOf = (s) => (s.stage === 'meet' ? s.meet.win : s.dist.win);
/** La géométrie du dessin : cadre (unités), échelle en px, conversions. */
export function frame(s, { width, height, pad = 22 }) {
  const win = winOf(s);
  const cols = win.xMax - win.xMin; const rows = win.yMax - win.yMin;
  const u = Math.max(8, Math.min((width - 2 * pad) / cols, (height - 2 * pad) / rows));
  const W = cols * u + 2 * pad; const H = rows * u + 2 * pad;
  const ox = (width - W) / 2; const oy = (height - H) / 2;
  const px = (x) => ox + pad + (x - win.xMin) * u;
  const py = (y) => oy + pad + (win.yMax - y) * u;
  const fromPx = (X, Y) => [win.xMin + (X - ox - pad) / u, win.yMax - (Y - oy - pad) / u];
  return { win, u, cols, rows, px, py, fromPx, P: (p) => { const [x, y] = xy(p); return [px(x), py(y)]; } };
}
/** La hauteur naturelle de la scène pour une largeur (un carreau plafonné à 60 px). */
export function naturalHeight(s, width, pad = 22) {
  const win = winOf(s);
  const u = Math.min(60, (width - 2 * pad) / (win.xMax - win.xMin));
  return (win.yMax - win.yMin) * u + 2 * pad;
}
