/**
 * shape-prover — la logique PURE du « فار » du ملعب الحي (unité 12 « الأشعة في معلم », درس « توظيف الحساب الشعاعي
 * والإحداثيات لإثبات الخواص الهندسية »). Aucun React ici et AUCUNE arithmétique propre : chaque carré de distance,
 * chaque composante, chaque milieu, chaque nature vient de packages/core/arithmetic/vectors.js (fractions exactes) ;
 * une égalité se juge par `linear.eq` sur des fractions. Les flottants ne servent qu'au dessin.
 *
 * L'IDÉE : la nature d'une figure se PROUVE par des égalités calculées dans le repère — jamais par ce que l'œil voit
 * sur le quadrillage. Des plots (A, B, C, D) sont posés sur les nœuds du terrain ; l'élève DÉPLACE le plot tenu, choisit
 * ce qu'il veut prouver (une « affirmation ») et les CARTES-PREUVES qu'il envoie au فار ; le فار accepte seulement si
 * l'affirmation est vraie ET si les cartes envoyées SUFFISENT.
 *
 *   Les cartes (chacune compare deux nombres calculés, en direct) :
 *     pyth:X   le triangle en X : XY² + XZ² ⟷ YZ²   (عكس فيثاغورس — le côté SEUL est l'opposé de X)
 *     iso:X    le sommet X     : XY² ⟷ XZ²
 *     vec      AB⃗ ⟷ DC⃗        (composantes)              mid   milieu de [AC] ⟷ milieu de [BD]
 *     diag     AC² ⟷ BD²                                    side  AB² ⟷ BC²  (deux côtés consécutifs)
 *     circ     IB², ID² ⟷ IA²  (I milieu de [AC] : B et D sur le cercle de diamètre [AC])
 *
 *   Ce qu'il faut pour chaque affirmation (REQUIRE — un groupe = « une de ces cartes ») :
 *     right:X → pyth:X ; iso:X → iso:X ; para → vec | mid ; rect → (vec | mid) + diag ; rhombus → (vec | mid) + side ;
 *     square → (vec | mid) + diag + side ; circle → circ.
 *
 *   Les refus (un par erreur nommée) :
 *     noClaim / noCard — rien à juger ;
 *     flat     — A, B, C alignés : pas de triangle (la carte iso:C s'équilibre au milieu de [AB] !) ;
 *     watar    — « قائم في A » prouvé avec la carte d'un AUTRE sommet (MISC-MAALAM-FITHAGHURAS-WATAR) ;
 *     apex     — « متساوي الساقين رأسه C » prouvé avec l'égalité d'un autre sommet ;
 *     missing  — une carte nécessaire manque (`need` : 'para' | 'diag' | 'side' | une carte) : متوازي الأضلاع وحده
 *                n'est pas un مستطيل (MISC-MAALAM-MUTAWAZI-KAFI), deux diagonales égales seules non plus ;
 *     false    — une carte nécessaire n'est PAS équilibrée à cette position (`card`) : l'affirmation est fausse.
 *
 * DEUX MODES, un objectif (« إثبات طبيعة شكل في معلم بالحساب، بالأدلة الكافية ») :
 *   `triangle` (مبتدئ, plateforme) — A, B fixes, C tenu (nœud par nœud) ; objectifs « قائم في A » puis
 *     « متساوي الساقين رأسه C ». Le départ C(−1 ; 2) a l'AIR droit en A (98°) — le فار le refuse : 10 + 5 ≠ 17.
 *   `unknown` (متقدم, طرائق p. 145 « حساب مسافات ») — A(0 ; 2), B(−4 ; 0), C(−2 ; y) GLISSE sur sa droite x = −2 ;
 *     objectif « (AB) ⊥ (BC) » = « قائم في B » (y = −4). Puis, ouvert par l'élève, l'étape `quad` : D tenu ;
 *     objectifs « ABCD مربع » et « B و D على الدائرة التي قطرها [AC] » (D(2 ; −2), I(−1 ; −1), IA² = 10).
 *
 * UN ESSAI est une demande au فار (`check`) — jamais un déplacement.
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as Lq from '@smarter-academy/core/arithmetic/linear.js';

const TRI_CARDS = Object.freeze(['pyth:A', 'pyth:B', 'pyth:C', 'iso:A', 'iso:B', 'iso:C']);
const QUAD_CARDS = Object.freeze(['vec', 'mid', 'diag', 'side', 'circ']);
const QUAD_CLAIMS = Object.freeze(['para', 'rect', 'rhombus', 'square', 'circle']);
const PARA = Object.freeze(['vec', 'mid']);

/** Les cartes nécessaires : une liste de GROUPES (chaque groupe exige l'une de ses cartes). */
export const REQUIRE = Object.freeze({
  'right:A': [['pyth:A']], 'right:B': [['pyth:B']], 'right:C': [['pyth:C']],
  'iso:A': [['iso:A']], 'iso:B': [['iso:B']], 'iso:C': [['iso:C']],
  para: [PARA], rect: [PARA, ['diag']], rhombus: [PARA, ['side']], square: [PARA, ['diag'], ['side']], circle: [['circ']],
});

const pt = (p) => (p && typeof p.x === 'object' ? p : V.point(p[0], p[1]));
export const xy = (p) => V.coords(pt(p));
const same = (p, q) => V.vecEq(pt(p), pt(q));
const OTHERS = { A: ['B', 'C'], B: ['A', 'C'], C: ['A', 'B'] };
const n = (f) => Lq.toNumber(f);

// ── le cadre (le terrain) ────────────────────────────────────────────────────

/** Un cadre quasi carré autour de points, avec une marge (unités), centré. */
function windowAround(points, margin) {
  const cs = points.map(xy);
  const xs = cs.map((c) => c[0]); const ys = cs.map((c) => c[1]);
  let xMin = Math.min(...xs) - margin; let xMax = Math.max(...xs) + margin;
  let yMin = Math.min(...ys) - margin; let yMax = Math.max(...ys) + margin;
  const w = xMax - xMin; const h = yMax - yMin;
  if (w < h) { xMin -= (h - w) / 2; xMax += (h - w) / 2; } else if (h < w) { yMin -= (w - h) / 2; yMax += (w - h) / 2; }
  return Object.freeze({ xMin, xMax, yMin, yMax });
}

// ── l'état ───────────────────────────────────────────────────────────────────

export function init(nums = {}) {
  const mode = nums.mode === 'unknown' ? 'unknown' : 'triangle';
  return mode === 'unknown' ? initUnknown(nums) : initTriangle(nums);
}

function initTriangle({ A = [0, 0], B = [3, 1], C = [-1, 2] } = {}) {
  const a = pt(A); const b = pt(B); const c = pt(C);
  for (const p of [a, b, c]) if (!xy(p).every(Number.isInteger)) throw new Error('shape-prover: nœuds entiers');
  if (V.collinear(a, b, c)) throw new Error('shape-prover: C de départ aligné avec A et B');
  return Object.freeze({
    mode: 'triangle', stage: 'tri', held: 'C', rail: null, starts: Object.freeze({ C: c }),
    pts: Object.freeze({ A: a, B: b, C: c }),
    win: windowAround([a, b, c], 2),
    goals: Object.freeze(['right:A', 'iso:C']), claims: Object.freeze(['right:A', 'iso:C']), cards: TRI_CARDS,
    claim: 'right:A', picked: Object.freeze([]), solved: Object.freeze({}), trials: Object.freeze([]), last: null,
  });
}

function initUnknown({ A = [0, 2], B = [-4, 0], rail = { x: -2, min: -5, max: 3, start: 3 }, D = [2, 2] } = {}) {
  const a = pt(A); const b = pt(B);
  const r = Object.freeze({ x: Number(rail.x), min: Number(rail.min), max: Number(rail.max) });
  const c = V.point(r.x, Number(rail.start ?? r.max));
  const d = pt(D);
  if (V.collinear(a, b, c)) throw new Error('shape-prover: C de départ aligné avec A et B');
  // le cadre contient la droite de C entière, D et le quatrième sommet de chaque position droite en B
  const fourth = railSolutions({ pts: { A: a, B: b }, rail: r }).map((y) => V.fourthVertex(a, b, V.point(r.x, y)));
  const win = windowAround([a, b, d, V.point(r.x, r.min), V.point(r.x, r.max), ...fourth], 0.6);
  return Object.freeze({
    mode: 'unknown', stage: 'tri', held: 'C', rail: r, starts: Object.freeze({ C: c, D: d }),
    pts: Object.freeze({ A: a, B: b, C: c, D: d }), dStart: d,
    win,
    goals: Object.freeze(['right:B']), claims: Object.freeze(['right:B']), cards: Object.freeze(['pyth:A', 'pyth:B', 'pyth:C']),
    claim: 'right:B', picked: Object.freeze([]), solved: Object.freeze({}), trials: Object.freeze([]), last: null,
  });
}

/** Les y de la droite de C (entiers) pour lesquels ABC est rectangle en B. */
export function railSolutions(s) {
  const out = [];
  for (let y = s.rail.min; y <= s.rail.max; y += 1) {
    const c = V.point(s.rail.x, y);
    if (!V.collinear(s.pts.A, s.pts.B, c) && V.triangleNature(s.pts.A, s.pts.B, c).right === 'B') out.push(y);
  }
  return out;
}

// ── les cartes ───────────────────────────────────────────────────────────────

const d2 = (s, P, Q) => V.distanceSquared(s.pts[P], s.pts[Q]);
const I = (s) => V.midpoint(s.pts.A, s.pts.C);

/**
 * Une carte calculée à la position courante : `left` / `right` (fractions, ou points pour vec / mid), `parts` (les
 * termes d'une somme), `balanced` (égalité EXACTE), `names` (ce qui est comparé, pour l'écriture).
 */
export function card(s, id) {
  if (id.startsWith('pyth:')) {
    const X = id.slice(5); const [Y, Z] = OTHERS[X];
    const a = d2(s, X, Y); const b = d2(s, X, Z); const right = d2(s, Y, Z); const left = Lq.add(a, b);
    return Object.freeze({ id, kind: 'pyth', vertex: X, names: [`${X}${Y}`, `${X}${Z}`, `${Y}${Z}`], parts: [a, b], left, right, balanced: Lq.eq(left, right) });
  }
  if (id.startsWith('iso:')) {
    const X = id.slice(4); const [Y, Z] = OTHERS[X];
    const left = d2(s, X, Y); const right = d2(s, X, Z);
    return Object.freeze({ id, kind: 'iso', vertex: X, names: [`${X}${Y}`, `${X}${Z}`], left, right, balanced: Lq.eq(left, right) });
  }
  const { A, B, C, D } = s.pts;
  if (id === 'vec') { const left = V.vec(A, B); const right = V.vec(D, C); return Object.freeze({ id, kind: 'pair', names: ['AB', 'DC'], left, right, balanced: V.vecEq(left, right) }); }
  if (id === 'mid') { const left = V.midpoint(A, C); const right = V.midpoint(B, D); return Object.freeze({ id, kind: 'pair', names: ['AC', 'BD'], left, right, balanced: V.vecEq(left, right) }); }
  if (id === 'diag') { const left = d2(s, 'A', 'C'); const right = d2(s, 'B', 'D'); return Object.freeze({ id, kind: 'len', names: ['AC', 'BD'], left, right, balanced: Lq.eq(left, right) }); }
  if (id === 'side') { const left = d2(s, 'A', 'B'); const right = d2(s, 'B', 'C'); return Object.freeze({ id, kind: 'len', names: ['AB', 'BC'], left, right, balanced: Lq.eq(left, right) }); }
  if (id === 'circ') {
    const i = I(s); const ra = V.distanceSquared(i, A); const rb = V.distanceSquared(i, B); const rd = V.distanceSquared(i, D);
    return Object.freeze({ id, kind: 'circ', names: ['IB', 'ID', 'IA'], parts: [rb, rd], left: rb, right: ra, center: i, balanced: Lq.eq(rb, ra) && Lq.eq(rd, ra) });
  }
  throw new Error(`shape-prover: carte inconnue « ${id} »`);
}

export const cardsOf = (s) => shownCards(s).map((id) => card(s, id));

// ── la vérité (vectors.js juge) ──────────────────────────────────────────────

export const isFlat = (s) => V.collinear(s.pts.A, s.pts.B, s.pts.C);

/** L'affirmation est-elle VRAIE à la position courante ? (indépendamment des cartes envoyées) */
export function truth(s, claim) {
  const { A, B, C, D } = s.pts;
  if (claim.startsWith('right:') || claim.startsWith('iso:')) {
    if (isFlat(s)) return false;
    const nat = V.triangleNature(A, B, C);
    if (claim.startsWith('right:')) return nat.right === claim.slice(6);
    return card(s, claim).balanced;
  }
  if (claim === 'circle') return V.onCircle(I(s), V.distance(I(s), A), B) && V.onCircle(I(s), V.distance(I(s), A), D);
  const kind = V.quadNature(A, B, C, D);
  if (claim === 'para') return kind !== 'none';
  if (claim === 'rect') return kind === 'rectangle' || kind === 'square';
  if (claim === 'rhombus') return kind === 'rhombus' || kind === 'square';
  if (claim === 'square') return kind === 'square';
  throw new Error(`shape-prover: affirmation inconnue « ${claim} »`);
}

/**
 * Le verdict du فار pour l'affirmation et les cartes choisies, à la position courante :
 * { kind: 'ok' | 'noClaim' | 'noCard' | 'flat' | 'watar' | 'apex' | 'missing' | 'false', card?, need?, decides? }.
 */
export function judge(s, claim = s.claim, picked = s.picked) {
  if (!claim) return Object.freeze({ kind: 'noClaim' });
  if (!picked.length) return Object.freeze({ kind: 'noCard' });
  const tri = claim.startsWith('right:') || claim.startsWith('iso:');
  if (tri && isFlat(s)) return Object.freeze({ kind: 'flat' });
  if (claim.startsWith('right:')) {
    const X = claim.slice(6);
    const other = picked.find((c) => c.startsWith('pyth:') && c !== `pyth:${X}`);
    if (other && !picked.includes(`pyth:${X}`)) return Object.freeze({ kind: 'watar', card: other, decides: other.slice(5), balanced: card(s, other).balanced });
  }
  if (claim.startsWith('iso:')) {
    const X = claim.slice(4);
    const other = picked.find((c) => c.startsWith('iso:') && c !== `iso:${X}`);
    if (other && !picked.includes(`iso:${X}`)) return Object.freeze({ kind: 'apex', card: other, decides: other.slice(4), balanced: card(s, other).balanced });
  }
  const groups = REQUIRE[claim];
  // une carte envoyée qui n'est PAS équilibrée réfute d'abord l'affirmation (à D(2 ; 2), « مربّع » avec AB⃗ ≠ DC⃗ : pas même
  // un parallélogramme) ; seulement ensuite le فار réclame la carte qui manque
  for (const g of groups) {
    const bad = g.find((c) => picked.includes(c) && !card(s, c).balanced);
    if (bad) return Object.freeze({ kind: 'false', card: bad });
  }
  for (const g of groups) {
    if (!g.some((c) => picked.includes(c))) return Object.freeze({ kind: 'missing', need: g.length > 1 ? 'para' : g[0] });
  }
  // filet de sécurité : cartes suffisantes et équilibrées ⇒ l'affirmation est vraie (vectors.js le confirme)
  if (!truth(s, claim)) return Object.freeze({ kind: 'false', card: groups.flat().find((c) => picked.includes(c)) });
  return Object.freeze({ kind: 'ok' });
}

// ── les gestes ───────────────────────────────────────────────────────────────

/** Le nœud entier le plus proche, borné au cadre (et à la droite de C à l'étape `tri` du mode `unknown`). */
function nodeAt(s, x, y) {
  const w = s.win;
  let cx = Math.min(Math.floor(w.xMax), Math.max(Math.ceil(w.xMin), Math.round(x)));
  let cy = Math.min(Math.floor(w.yMax), Math.max(Math.ceil(w.yMin), Math.round(y)));
  if (s.rail && s.held === 'C') { cx = s.rail.x; cy = Math.min(s.rail.max, Math.max(s.rail.min, cy)); }
  return V.point(cx, cy);
}

/** Déplacer le plot tenu (jamais sur un autre plot) ; la dernière réponse du فار s'efface. */
export function moveHeld(s, P) {
  const p = nodeAt(s, ...xy(P));
  if (same(p, s.pts[s.held])) return s;
  if (Object.entries(s.pts).some(([k, q]) => k !== s.held && (s.stage === 'quad' || k !== 'D') && same(p, q))) return s;
  return Object.freeze({ ...s, pts: Object.freeze({ ...s.pts, [s.held]: p }), last: null });
}
export const nudge = (s, dx, dy) => { const [x, y] = xy(s.pts[s.held]); return moveHeld(s, [x + dx, y + dy]); };

/**
 * Les cartes PRÉSENTÉES : au triangle, la famille de l'affirmation (les trois cartes « زاوية قائمة » pour « قائم في X »,
 * les trois « رأس » pour « متساوي الساقين ») — choisir le BON sommet reste à l'élève ; au quadrilatère, toutes (choisir
 * ce qui SUFFIT est la question).
 */
export function shownCards(s, claim = s.claim) {
  if (s.stage === 'quad' || !claim) return s.cards;
  const family = claim.startsWith('right:') ? 'pyth:' : 'iso:';
  return s.cards.filter((c) => c.startsWith(family));
}
/** Choisir l'affirmation ; au triangle, les cartes d'une autre famille sont retirées du dossier. */
export function setClaim(s, claim) {
  if (!s.claims.includes(claim)) return s;
  const keep = s.stage === 'quad' ? s.picked : s.picked.filter((c) => shownCards(s, claim).includes(c));
  return Object.freeze({ ...s, claim, picked: Object.freeze(keep), last: null });
}
export function toggleCard(s, id) {
  if (!shownCards(s).includes(id)) return s;
  const picked = s.picked.includes(id) ? s.picked.filter((c) => c !== id) : [...s.picked, id];
  return Object.freeze({ ...s, picked: Object.freeze(picked), last: null });
}

/** Demander au فار (un essai). */
export function check(s) {
  const v = judge(s);
  const at = xy(s.pts[s.held]);
  const trial = Object.freeze({ stage: s.stage, claim: s.claim, cards: s.picked, held: s.held, at, ...v });
  const solved = v.kind === 'ok' ? Object.freeze({ ...s.solved, [s.claim]: true }) : s.solved;
  return Object.freeze({
    ...s, solved, trials: Object.freeze([...s.trials, trial]), last: trial,
    ...(v.kind === 'ok' && s.mode === 'unknown' && s.stage === 'tri' ? { solvedC: s.pts.C } : {}),
  });
}

/** Étape suivante (mode `unknown`) : ouverte par l'élève une fois « قائم في B » prouvé ; C reste à sa place prouvée. */
export function openQuad(s) {
  if (s.mode !== 'unknown' || !s.solved['right:B']) return s;
  return Object.freeze({
    ...s, stage: 'quad', held: 'D',
    pts: Object.freeze({ ...s.pts, C: s.solvedC ?? s.pts.C, D: s.pts.D ?? s.dStart }),
    goals: Object.freeze(['square', 'circle']), claims: QUAD_CLAIMS, cards: QUAD_CARDS,
    claim: null, picked: Object.freeze([]), last: null,
  });
}
export function backToTri(s) {
  if (s.stage !== 'quad') return s;
  return Object.freeze({
    ...s, stage: 'tri', held: 'C',
    goals: Object.freeze(['right:B']), claims: Object.freeze(['right:B']), cards: Object.freeze(['pyth:A', 'pyth:B', 'pyth:C']),
    claim: 'right:B', picked: Object.freeze([]), last: null,
  });
}

/** Les preuves (affirmations à établir) du mode, dans l'ordre : ce sont les ÉTAPES du labo. */
export const proofsOf = (s) => (s.mode === 'triangle' ? ['right:A', 'iso:C'] : ['right:B', 'square', 'circle']);

/** « أعِد التجربة » : la MÊME preuve repart — son drapeau est effacé, le plot tenu revient au départ, les cartes sont retirées. */
export function retryClaim(s, claim) {
  const solved = { ...s.solved }; delete solved[claim];
  const held = claim === 'square' || claim === 'circle' ? 'D' : 'C';
  return Object.freeze({
    ...s, solved: Object.freeze(solved), claim, picked: Object.freeze([]), last: null,
    pts: Object.freeze({ ...s.pts, [held]: s.starts[held] ?? s.pts[held] }),
  });
}

/** La situation au moment où la preuve `claim` a été acceptée (le plot tenu a pu bouger depuis) : les nombres des questions. */
export function atProof(s, claim) {
  const tr = [...s.trials].reverse().find((t) => t.kind === 'ok' && t.claim === claim);
  if (!tr) return s;
  return Object.freeze({ ...s, pts: Object.freeze({ ...s.pts, [tr.held]: V.point(...tr.at) }) });
}

// ── la découverte ────────────────────────────────────────────────────────────

const refused = (s, stage) => s.trials.some((t) => t.kind !== 'ok' && (!stage || t.stage === stage));
export const stageDone = (s) => s.goals.every((g) => s.solved[g]);
/**
 * Le contraste : مبتدئ — les deux objectifs prouvés ET au moins un refus du فار (le départ qui « a l'air » droit) ;
 * متقدم — « قائم في B », le مربع et le cercle prouvés ET un refus ou une affirmation plus faible acceptée d'abord.
 */
export function discoveryReady(s) {
  if (s.mode === 'triangle') return !!(s.solved['right:A'] && s.solved['iso:C']) && refused(s);
  const weaker = s.trials.some((t) => t.kind === 'ok' && ['para', 'rect', 'rhombus'].includes(t.claim));
  return !!(s.solved['right:B'] && s.solved.square && s.solved.circle) && (refused(s, 'quad') || weaker);
}

/** Le premier refus « faux » de l'élève (pour réfuter « il a l'air droit » avec SES nombres). */
export const firstFalse = (s) => s.trials.find((t) => t.kind === 'false') ?? null;

/** Ce que le module affiche de l'essai (`onTrial`). */
export function evidenceOf(s) {
  const t = s.trials.at(-1);
  if (!t) return null;
  const c = t.card ? card({ ...s, pts: Object.freeze({ ...s.pts, [t.held]: V.point(...t.at) }) }, t.card) : null;
  return Object.freeze({
    mode: s.mode, stage: t.stage, n: s.trials.length, claim: t.claim, cards: t.cards, kind: t.kind, held: t.held, at: t.at,
    card: t.card ?? null, need: t.need ?? null, decides: t.decides ?? null,
    values: c && (c.kind === 'pyth' || c.kind === 'iso' || c.kind === 'len') ? [n(c.left), n(c.right)] : null,
  });
}

// ── la géométrie du dessin ───────────────────────────────────────────────────

export function frame(s, { width, height, pad = 22 }) {
  const win = s.win;
  const cols = win.xMax - win.xMin; const rows = win.yMax - win.yMin;
  const u = Math.max(8, Math.min((width - 2 * pad) / cols, (height - 2 * pad) / rows));
  const W = cols * u + 2 * pad; const H = rows * u + 2 * pad;
  const ox = (width - W) / 2; const oy = (height - H) / 2;
  const px = (x) => ox + pad + (x - win.xMin) * u;
  const py = (y) => oy + pad + (win.yMax - y) * u;
  const fromPx = (X, Y) => [win.xMin + (X - ox - pad) / u, win.yMax - (Y - oy - pad) / u];
  return { win, u, cols, rows, px, py, fromPx, P: (p) => { const [x, y] = xy(p); return [px(x), py(y)]; } };
}

/** La hauteur naturelle de la scène pour une largeur (le carré du quadrillage plafonné à 52 px). */
export function naturalHeight(s, width, pad = 22) {
  const cols = s.win.xMax - s.win.xMin; const rows = s.win.yMax - s.win.yMin;
  const u = Math.min(52, (width - 2 * pad) / cols);
  return rows * u + 2 * pad;
}

/** Les nœuds entiers du cadre (lignes du quadrillage). */
export function gridLines(s) {
  const w = s.win;
  const xs = []; const ys = [];
  for (let x = Math.ceil(w.xMin); x <= Math.floor(w.xMax); x += 1) xs.push(x);
  for (let y = Math.ceil(w.yMin); y <= Math.floor(w.yMax); y += 1) ys.push(y);
  return { xs, ys };
}
