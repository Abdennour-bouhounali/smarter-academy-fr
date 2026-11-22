/**
 * shape-turn — LA LOGIQUE PURE du laboratoire « خواص الدوران » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة »,
 * leçon khawas-dawaran, manuel pp. 154–155 et 158–161). Aucune arithmétique propre : chaque image, chaque verdict,
 * chaque longueur, aire ou angle vient de packages/core/arithmetic/rotation.js (`rotateApprox`, `imageCheck`,
 * `findRotation`, `angleAt`, `lineAngle`, `polygonArea`, `onBisector`, `rotationCenter`) et vectors.js (`distance`,
 * `distanceSquared`) ; trigonometry.js n'écrit que les nombres (`surdText`, `surdNumber`). Ce module dit ce que la main a
 * le droit de faire et ce que l'écran doit montrer. Les coordonnées de DESSIN peuvent être flottantes : elles ne
 * décident de rien.
 *
 * L'OBJET : une feuille de PAPIER CALQUE (le « ورق شفاف » du نشاط 1 du manuel) épinglée en O, sur laquelle on a
 * recopié un motif. La main tient la ROTATION θ de la feuille (degrés signés, > 0 dans le sens direct) — et, en
 * contraste, un « faux » mors qui ÉTIRE la feuille d'un facteur k (dixièmes, 10 = pas d'étirement) le long de son
 * bord : ce n'est plus un دوران, les jauges le disent.
 *
 * DEUX SCÈNES (le niveau choisit la scène) :
 *
 *   'rosette'  (مبتدئ, plateforme — une rosace de zellige de Tlemcen) : le motif ABC (et I, milieu de [AB]) ; l'élève
 *              tourne la feuille et IMPRIME une copie quand elle est l'image d'une copie déjà posée par le دوران
 *              (O, α, sens) — `imageCheck` décide et dit l'élément qui manque (la distance quand la feuille est
 *              étirée, l'angle, le sens). La rosace est faite quand les 360/α − 1 copies sont posées.
 *   'prove'    (متقدم, la طريقة p. 155) : OAB et OCD rectangles isocèles en O ; la feuille porte une copie de [AC] ;
 *              elle « tombe » sur [BD] seulement pour le دوران (O, 90°, direct) — puis les AFFIRMATIONS AC = BD et
 *              (AC) ⊥ (BD) se prouvent en choisissant la propriété qui les justifie (cartes de preuve). Une seconde
 *              scène, ouverte par l'élève (`stage: 'center'`, تمرين 18 p. 161), demande le CENTRE W d'un دوران qui
 *              envoie MNP sur M′N′P′ : l'épingle se pose sur un nœud, refusée tant qu'elle n'est pas à égale
 *              distance de chaque point et de son image ; les médiatrices se tracent (celles de [MM′] et [NN′] sont
 *              CONFONDUES : il faut celle de [PP′]).
 */
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as T from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

export const STRETCH = Object.freeze({ min: 10, max: 15 });
export const TURN = Object.freeze({ min: -360, max: 360 });
/** Les cartes de preuve : ce que chacune PROUVE (la clé i18n `card_<id>` / `proves_<id>`). */
export const CARDS = Object.freeze(['atwal', 'zawaya', 'istiqama', 'masahat', 'taamud90', 'tawazi180']);
const PROVES = Object.freeze({
  atwal: 'length', zawaya: 'angle', istiqama: 'aligned', masahat: 'area', taamud90: 'perp', tawazi180: 'parallel',
});

const pt = (p) => V.point(p[0], p[1]);
const fl = (p) => ({ x: Lin.toNumber(p.x), y: Lin.toNumber(p.y) });
const norm360 = (t) => ((Math.round(t) % 360) + 360) % 360;
const sgn = (t) => (t < 0 ? 'indirect' : 'direct');
/** Un nombre lu par l'élève : 2 décimales au plus, la virgule du manuel. */
const dec = (x, d = 2) => String(Number(Number(x).toFixed(d))).replace('.', ',').replace('-', '−');
/** Une longueur exacte : « 3 », « √41 », « 3,6 » (une fraction s'écrit en décimal). */
function lengthText(s) {
  if (s.r === 1) { const n = T.surdNumber(s); return Number.isInteger(n) ? String(n) : dec(n); }
  return T.surdText(s).replace('/', '÷');
}

// ── Initialisation ────────────────────────────────────────────────────────────

export function init(nums = {}) {
  const mode = nums.mode === 'prove' ? 'prove' : 'rosette';
  const O = pt(nums.center ?? [0, 0]);
  const alpha = Number(nums.alpha ?? (mode === 'prove' ? 90 : 60));
  const direction = nums.direction === 'indirect' ? 'indirect' : 'direct';
  const base = {
    mode, O, alpha, direction, theta: 0, stretch: STRETCH.min, fakeTried: false,
    trials: Object.freeze([]), last: null, claims: Object.freeze({}), stage: 'turn',
  };
  if (mode === 'rosette') {
    const shape = nums.shape ?? { A: [1, 0], B: [4, 0], C: [2, 2] };
    const pts = Object.fromEntries(Object.entries(shape).map(([n, p]) => [n, pt(p)]));
    pts.I = V.midpoint(pts.A, pts.B);
    return Object.freeze({ ...base, pts: Object.freeze(pts), carried: ['A', 'B', 'C'], stamps: Object.freeze([]) });
  }
  const p = nums.points ?? { A: [4, -2], B: [2, 4], C: [-1, 2], D: [-2, -1] };
  const pts = Object.fromEntries(Object.entries(p).map(([n, q]) => [n, pt(q)]));
  pts.O = O;
  pts.I = V.midpoint(pts.A, pts.C);
  const ct = nums.centerTask ?? { M: [1, 3], N: [0, 2], P: [2, 2], "M'": [3, 3], "N'": [4, 2], "P'": [4, 4], grid: 5, start: [0, 0] };
  const task = Object.freeze({
    pts: Object.freeze(Object.fromEntries(['M', 'N', 'P', "M'", "N'", "P'"].map((n) => [n, pt(ct[n])]))),
    grid: ct.grid ?? 5,
  });
  return Object.freeze({
    ...base, pts: Object.freeze(pts), carried: ['A', 'C'], landed: false,
    task, pin: Object.freeze([...(ct.start ?? [0, 0])]), pins: Object.freeze([]), bisectors: Object.freeze([]), center: null,
  });
}

// ── La feuille : étirement (le faux mors) puis rotation ────────────────────────

/** Le point `name` recopié sur la feuille ÉTIRÉE (k = stretch/10 le long du bord de la feuille), AVANT rotation — exact. */
function stretchedExact(s, name, stretch = s.stretch) {
  const p = s.pts[name];
  const k = Lin.frac(stretch, 10);
  return V.point(Lin.add(s.O.x, Lin.mul(k, Lin.sub(p.x, s.O.x))), p.y);
}
/** Le point `name` de la copie, feuille tournée de θ et étirée : flottant, pour DESSINER. */
export function copyPoint(s, name, theta = s.theta, stretch = s.stretch) {
  const e = stretchedExact(s, name, stretch);
  return R.rotateApprox(fl(e), fl(s.O), Math.abs(theta), sgn(theta));
}
export const copyPoints = (s, theta = s.theta, stretch = s.stretch) =>
  Object.fromEntries([...s.carried, 'I'].map((n) => [n, copyPoint(s, n, theta, stretch)]));

/**
 * Les JAUGES (ce qui reste, ce qui change) pour la feuille à (θ, k) : longueur du segment porté et de sa copie, un
 * angle, l'aire, l'alignement de trois points et l'angle entre la droite et son image. Tout vient de rotation.js /
 * vectors.js ; les grandeurs se lisent sur les points ÉTIRÉS non tournés (une rotation ne change rien), l'angle entre
 * les droites sur la copie tournée.
 */
export function gauges(s, theta = s.theta, stretch = s.stretch) {
  const [a, b] = s.mode === 'rosette' ? ['A', 'B'] : ['A', 'C'];
  const third = s.mode === 'rosette' ? 'C' : 'O';
  const orig = (n) => s.pts[n];
  const cp = (n) => (n === 'O' && s.mode === 'prove' ? s.O : stretchedExact(s, n, stretch));
  const len0 = V.distance(orig(a), orig(b)); const len1 = V.distance(cp(a), cp(b));
  const tri0 = [orig(a), orig(b), orig(third)]; const tri1 = [cp(a), cp(b), cp(third)];
  const ang0 = R.angleAt(orig(a), orig(b), orig(third)); const ang1 = R.angleAt(cp(a), cp(b), cp(third));
  const area0 = R.polygonArea(tri0); const area1 = R.polygonArea(tri1);
  const c = copyPoints(s, theta, stretch);
  const between = R.lineAngle(fl(orig(a)), fl(orig(b)), c[a], c[b]);
  return Object.freeze({
    seg: `${a}${b}`,
    length: { orig: lengthText(len0), copy: lengthText(len1), equal: T.surdEq(len0, len1) },
    angle: { at: b, orig: Math.round(ang0 * 10) / 10, copy: Math.round(ang1 * 10) / 10, equal: Math.abs(ang0 - ang1) < 0.05 },
    area: { orig: dec(Lin.toNumber(area0)), copy: dec(Lin.toNumber(area1)), equal: Lin.eq(area0, area1) },
    aligned: V.collinear(cp(a), cp('I'), cp(b)),
    between: Math.round(between),
    perp: Math.abs(between - 90) < 0.5,
    parallel: between < 0.5,
    rotation: stretch === STRETCH.min,
  });
}

// ── Les gestes ────────────────────────────────────────────────────────────────

const log = (s, ev) => Object.freeze({ ...s, trials: Object.freeze([...s.trials, ev].slice(-40)), last: ev });

/** Le geste « tourner la feuille » validé (relâchement, ou une pause au clavier) : θ entier dans [−360 ; 360]. */
export function turn(s, theta) {
  const t = Math.max(TURN.min, Math.min(TURN.max, Math.round(theta)));
  let next = { ...s, theta: t };
  const g = gauges(next);
  const ev = { kind: 'turn', theta: t, stretch: s.stretch, between: g.between, length: g.length.copy };
  if (s.mode === 'prove' && s.stage === 'turn') {
    const v = landing(next);
    ev.landing = v.kind;
    if (v.kind === 'land' && !s.landed) next = { ...next, landed: true };
  }
  return log(Object.freeze(next), ev);
}

/** Le faux mors : la feuille étirée de k = stretch/10. Ce n'est plus un دوران — les jauges le disent. */
export function stretchTo(s, stretch) {
  const k = Math.max(STRETCH.min, Math.min(STRETCH.max, Math.round(stretch)));
  const next = Object.freeze({ ...s, stretch: k, fakeTried: s.fakeTried || k !== STRETCH.min });
  const g = gauges(next);
  return log(next, { kind: 'stretch', stretch: k, rotation: g.rotation, seg: g.seg, orig: g.length.orig, copy: g.length.copy });
}
/** Recoller la feuille (k = 1). */
export const unstretch = (s) => stretchTo(s, STRETCH.min);

// ── 'rosette' : imprimer une copie ─────────────────────────────────────────────

export const rosetteSize = (s) => Math.round(360 / s.alpha);
/** Les rotations (degrés, dans [0 ; 360[) des copies posées, la copie d'origine (0) comprise. */
const placed = (s) => [0, ...(s.stamps ?? []).map((st) => st.at)];
export const rosetteDone = (s) => s.mode === 'rosette' && (s.stamps ?? []).length >= rosetteSize(s) - 1;

/**
 * Peut-on IMPRIMER la copie (θ, k) ? true | { reason, … } :
 *   'stretch' — la feuille est étirée : « ليس دورانا: تغيّر الطول » (AB, A′B′ lus) ;
 *   'home'    — la copie est sur le motif lui-même (0° ou 360°) ;
 *   'twice'   — cette place porte déjà une copie ;
 *   'angle'   — sur la bonne distance mais pas à α d'une copie posée (l'angle mesuré depuis la plus proche) ;
 *   'sense'   — à α d'une copie, mais dans l'autre sens.
 * Le verdict est celui de `imageCheck(O, A_copie, A_feuille, α, sens)` contre CHAQUE copie posée.
 */
export function canStamp(s) {
  if (s.mode !== 'rosette') return { reason: 'mode' };
  const g = gauges(s);
  if (!g.rotation) return { reason: 'stretch', seg: g.seg, orig: g.length.orig, copy: g.length.copy };
  const at = norm360(s.theta);
  if (at === 0) return { reason: 'home' };
  if (placed(s).includes(at)) return { reason: 'twice', at };
  const A = fl(s.pts.A); const O = fl(s.O);
  const now = copyPoint(s, 'A');
  let best = null;
  for (const c of placed(s)) {
    const from = R.rotateApprox(A, O, c, 'direct');
    const chk = R.imageCheck(O, from, now, s.alpha, s.direction);
    if (chk.ok) return true;
    const gap = Math.abs(chk.measured.angle - s.alpha);
    if (!best || gap < best.gap || (gap === best.gap && chk.sense === false)) best = { gap, chk, from: c };
  }
  if (best.chk.angle && best.chk.sense === false) return { reason: 'sense', measured: Math.round(best.chk.measured.angle) };
  return { reason: 'angle', measured: Math.round(best.chk.measured.angle), sense: best.chk.measured.direction };
}
/** Imprimer (si `canStamp`) ; sinon le refus est noté, rien n'est posé. */
export function stamp(s) {
  const ok = canStamp(s);
  if (ok !== true) return log(s, { kind: 'refuse', theta: s.theta, ...ok });
  const at = norm360(s.theta);
  const k = (s.stamps ?? []).length + 1;
  const next = Object.freeze({ ...s, stamps: Object.freeze([...(s.stamps ?? []), Object.freeze({ at, theta: s.theta, n: k })]) });
  return log(next, { kind: 'stamp', theta: s.theta, at, n: k, done: rosetteDone(next) });
}

// ── 'prove' : la copie de [AC] tombe-t-elle sur [BD] ? ──────────────────────────

/**
 * Le verdict de la feuille (mode 'prove') : 'land' quand la copie de A est B ET celle de C est D — `imageCheck` pour le
 * دوران (O, |θ|, sens de θ) — sinon 'stretch' (feuille étirée), 'miss' avec l'angle qui reste jusqu'à B (signé, > 0 :
 * encore dans le sens direct).
 */
export function landing(s) {
  if (s.stretch !== STRETCH.min) return { kind: 'stretch' };
  const t = s.theta;
  if (t === 0) return { kind: 'start' };
  const dir = sgn(t);
  const okA = R.imageCheck(s.O, s.pts.A, s.pts.B, Math.abs(t), dir).ok;
  const okC = R.imageCheck(s.O, s.pts.C, s.pts.D, Math.abs(t), dir).ok;
  if (okA && okC) {
    const rot = R.findRotation(s.O, s.pts.A, s.pts.B);
    return { kind: 'land', alpha: Math.round(rot.alpha), direction: rot.direction };
  }
  const rest = Math.round(R.orientedAngle(fl(s.O), copyPoint(s, 'A'), fl(s.pts.B)));
  return { kind: 'miss', rest };
}

// ── Les affirmations et leurs cartes de preuve ────────────────────────────────

/**
 * Les affirmations à prouver. 'rosette' (ouvertes quand la rosace est faite) : la première copie garde la longueur,
 * la copie à 180° est parallèle au motif, l'aire de chaque copie ; 'prove' (ouvertes quand [AC] est tombé sur [BD]) :
 * AC = BD et (AC) ⊥ (BD) — la طريقة p. 155.
 */
export function claimsOf(s) {
  if (s.mode === 'prove') {
    return [
      { id: 'eq', need: 'length', tex: 'AC = BD' },
      { id: 'perp', need: 'perp', tex: '(AC) \\perp (BD)' },
    ];
  }
  const half = 180 % s.alpha === 0 ? 180 / s.alpha : null;
  const out = [{ id: 'len', need: 'length', tex: 'A_1B_1 = AB' }];
  if (half) out.push({ id: 'par', need: 'parallel', tex: `(A_{${half}}B_{${half}}) \\parallel (AB)` });
  out.push({ id: 'area', need: 'area', tex: '' });
  return out;
}
export const claimsOpen = (s) => (s.mode === 'prove' ? !!s.landed : rosetteDone(s));
/**
 * Prouver l'affirmation `claimId` avec la carte `card` : true si la carte prouve ce que l'affirmation demande, sinon un
 * refus qui NOMME ce que la carte prouve (« بطاقة الزوايا تثبت تساوي زاويتين، والمطلوب تساوي طولين »).
 */
export function judgeClaim(s, claimId, card) {
  const c = claimsOf(s).find((x) => x.id === claimId);
  if (!c || !CARDS.includes(card)) return { ok: false, reason: 'unknown' };
  if (!claimsOpen(s)) return { ok: false, reason: 'closed' };
  if (PROVES[card] === c.need) return { ok: true };
  return { ok: false, reason: 'card', proves: PROVES[card], need: c.need };
}
export function claim(s, claimId, card) {
  const v = judgeClaim(s, claimId, card);
  if (v.reason === 'unknown' || v.reason === 'closed') return s;
  const prev = s.claims[claimId];
  const claims = Object.freeze({ ...s.claims, [claimId]: Object.freeze({ card, ok: v.ok || !!prev?.ok }) });
  return log(Object.freeze({ ...s, claims }), { kind: 'claim', claim: claimId, card, ok: v.ok, ...(v.ok ? {} : { proves: v.proves, need: v.need }) });
}
export const claimsProved = (s) => claimsOf(s).every((c) => s.claims[c.id]?.ok);

// ── 'prove', seconde scène : le centre W (تمرين 18) ────────────────────────────

export const PAIRS = Object.freeze(['M', 'N', 'P']);
export const openCenter = (s) => (s.mode === 'prove' ? Object.freeze({ ...s, stage: 'center' }) : s);
export const backToTurn = (s) => Object.freeze({ ...s, stage: 'turn' });
/** Déplacer l'épingle sur un nœud du quadrillage (borné). */
export function movePin(s, p) {
  const g = s.task.grid;
  const q = [Math.max(0, Math.min(g, Math.round(p[0]))), Math.max(0, Math.min(g, Math.round(p[1])))];
  return Object.freeze({ ...s, pin: Object.freeze(q) });
}
/** Les distances au carré (exactes) de l'épingle à chaque point et à son image. */
export function pinDistances(s, pin = s.pin) {
  const W = pt(pin);
  return Object.fromEntries(PAIRS.map((n) => {
    const d1 = V.distanceSquared(W, s.task.pts[n]); const d2 = V.distanceSquared(W, s.task.pts[`${n}'`]);
    return [n, { d1: Lin.fracText(d1), d2: Lin.fracText(d2), equal: R.onBisector(s.task.pts[n], s.task.pts[`${n}'`], W) }];
  }));
}
/**
 * Poser l'épingle : acceptée seulement si elle est sur les TROIS médiatrices (à égale distance de chaque point et de son
 * image) ET que le دوران autour d'elle envoie M, N, P sur M′, N′, P′ ; sinon refusée en nommant la première paire qui
 * échoue et ses deux distances.
 */
export function placePin(s) {
  const d = pinDistances(s);
  const bad = PAIRS.find((n) => !d[n].equal);
  if (bad) return log(s, { kind: 'pin', ok: false, at: [...s.pin], pair: bad, d1: d[bad].d1, d2: d[bad].d2 });
  const W = fl(pt(s.pin));
  const rot = R.findRotation(W, fl(s.task.pts.M), fl(s.task.pts["M'"]));
  const all = rot && PAIRS.every((n) => R.imageCheck(W, fl(s.task.pts[n]), fl(s.task.pts[`${n}'`]), rot.alpha, rot.direction ?? 'direct').ok);
  if (!all) return log(s, { kind: 'pin', ok: false, at: [...s.pin], pair: 'turn' });
  const center = Object.freeze({ at: [...s.pin], alpha: Math.round(rot.alpha), direction: rot.direction });
  return log(Object.freeze({ ...s, center }), { kind: 'pin', ok: true, at: [...s.pin], alpha: center.alpha, direction: center.direction });
}
/** Tracer / effacer la médiatrice de [XX′]. Deux médiatrices tracées se coupent en `bisectorMeet` (ou sont confondues). */
export function toggleBisector(s, n) {
  if (!PAIRS.includes(n)) return s;
  const on = s.bisectors.includes(n);
  const bisectors = Object.freeze(on ? s.bisectors.filter((x) => x !== n) : [...s.bisectors, n]);
  return log(Object.freeze({ ...s, bisectors }), { kind: 'bisector', pair: n, on: !on, meet: bisectorMeet({ ...s, bisectors }) });
}
/** L'intersection des deux PREMIÈRES médiatrices tracées : { kind: 'point', at } | { kind: 'same' } | null. */
export function bisectorMeet(s) {
  if (s.bisectors.length < 2) return null;
  const [a, b] = s.bisectors;
  const P0 = s.task.pts;
  const c = R.rotationCenter(P0[a], P0[`${a}'`], P0[b], P0[`${b}'`]);
  if (!c) return { kind: 'same', pairs: [a, b] };
  return { kind: 'point', at: [Lin.toNumber(c.x), Lin.toNumber(c.y)], pairs: [a, b] };
}
/** La médiatrice de [XX′] en deux points lointains (flottants, pour dessiner). */
export function bisectorLine(s, n, span = 20) {
  const a = fl(s.task.pts[n]); const b = fl(s.task.pts[`${n}'`]);
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const u = { x: -(b.y - a.y), y: b.x - a.x }; const l = Math.hypot(u.x, u.y) || 1;
  return [{ x: m.x - (u.x / l) * span, y: m.y - (u.y / l) * span }, { x: m.x + (u.x / l) * span, y: m.y + (u.y / l) * span }];
}

// ── Découverte, preuves de l'élève ────────────────────────────────────────────

/** La découverte s'ouvre : rosace faite ET feuille étirée au moins une fois (le contraste) ; ou [AC] posé sur [BD] et les deux affirmations prouvées. */
export function discoveryReady(s) {
  if (s.mode === 'rosette') return rosetteDone(s) && s.fakeTried;
  return !!s.landed && claimsProved(s);
}
/** Ce que la leçon reçoit (`onTrial`) : le dernier essai, en données simples. */
export function evidenceOf(s) {
  const e = s.last;
  if (!e) return null;
  return Object.freeze({ mode: s.mode, ...e, between: e.between ?? null });
}

// ── Les questions pendant le labo (primitives/LabCheckpoint) ──────────────────

/** L'angle (degrés) du دوران qui envoie A sur B (mode 'prove') — celui que la feuille a trouvé en tombant sur [BD]. */
export function landedAlpha(s) {
  const r = s.mode === 'prove' ? R.findRotation(s.O, s.pts.A, s.pts.B) : null;
  return r ? Math.round(r.alpha) : s.alpha;
}
/** La première copie imprimée DONT le mot de l'angle se lit net (θ ≤ 90°, sinon la première qui n'est pas sur le motif) : { at, between }. */
export function readableStamp(s) {
  const list = (s.stamps ?? []).map((st) => ({ at: st.at, between: gauges(s, st.at, STRETCH.min).between }));
  return list.find((x) => x.at <= 90 && x.between > 0) ?? list.find((x) => x.between > 0) ?? list[0] ?? null;
}
/** Le dernier étirement refusé par l'élève (« ليس دورانا ») : { orig, copy, stretch } ou null. */
export const lastStretch = (s) => s.trials.findLast((e) => e.kind === 'stretch' && !e.rotation) ?? null;
/**
 * « أعِد التجربة » : remet LA MÊME étape au départ. r1 / p1 : tout recommence ; r2 : la feuille se recolle et l'étirement est oublié ;
 * p2 : les affirmations sont à reprendre ; p3 : l'épingle revient, les médiatrices s'effacent.
 */
export function retryStep(s, id, nums = {}) {
  const fresh = init(nums);
  if (id === 'r2') return Object.freeze({ ...s, stretch: STRETCH.min, fakeTried: false, last: null, trials: Object.freeze(s.trials.filter((e) => e.kind !== 'stretch' && !(e.kind === 'refuse' && e.reason === 'stretch'))) });
  if (id === 'p2') return Object.freeze({ ...s, claims: Object.freeze({}), last: null, stage: 'turn' });
  if (id === 'p3') return Object.freeze({ ...s, center: null, pin: fresh.pin, pins: fresh.pins, bisectors: fresh.bisectors, last: null });
  return fresh;
}

// ── Mise en page (pixels) ─────────────────────────────────────────────────────

/**
 * L'échelle et le cadre CARRÉ de la scène : la rosace est centrée sur O avec la place de la feuille la plus étirée ;
 * la figure 'prove' couvre tous ses points (et leurs copies) ; la scène du centre couvre le quadrillage 0…grid.
 */
/**
 * Le rectangle de la feuille calque, dans SON repère (origine O, unités de la figure) : ce qu'elle porte et l'épingle,
 * avec une marge. Son coin haut-droit est la poignée de rotation, son coin bas-droit le faux mors.
 */
const SHEET_MARGIN = 0.45;
export function sheetRect(s) {
  const O = fl(s.O);
  const ps = s.carried.map((n) => { const p = fl(s.pts[n]); return { x: p.x - O.x, y: p.y - O.y }; });
  return {
    x0: Math.min(0, ...ps.map((p) => p.x)) - SHEET_MARGIN, x1: Math.max(0, ...ps.map((p) => p.x)) + SHEET_MARGIN,
    y0: Math.min(0, ...ps.map((p) => p.y)) - SHEET_MARGIN, y1: Math.max(0, ...ps.map((p) => p.y)) + SHEET_MARGIN,
  };
}
/**
 * Le FAUX MORS (étirement), dans le repère de la feuille : la place la plus LIBRE — la plus loin de tout point nommé de la
 * figure (portés, I, O, points fixes du niveau) et de la poignée de rotation — à au moins 1,5 unité de l'axe vertical de
 * la feuille (pour que tirer le long de son bord ait un sens) et sans sortir du disque que la scène contient déjà. Une
 * languette le relie à la feuille. Recherche sur une grille de pas 0,25 : déterministe, testée pour les deux niveaux.
 */
export function stretchHandle(s) {
  const O = fl(s.O);
  const sh = sheetRect(s);
  const reach = Math.hypot(Math.max(Math.abs(sh.x0), sh.x1), Math.max(Math.abs(sh.y0), sh.y1));
  const named = Object.keys(s.pts).map((n) => { const p = fl(s.pts[n]); return { x: p.x - O.x, y: p.y - O.y }; });
  const avoid = [...named, { x: 0, y: 0 }];
  const corner = { x: sh.x1, y: sh.y1 };
  let best = null;
  for (let x = -6; x <= 6; x += 0.25) {
    for (let y = -6; y <= 6; y += 0.25) {
      if (Math.abs(x) < 1.5 || Math.hypot(x, y) > reach - 0.3) continue;
      // distance « de boîte » (le mors est un carré) : max(|dx|, |dy|)
      const d = Math.min(...avoid.map((p) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y))), Math.hypot(corner.x - x, corner.y - y) - 0.5);
      if (!best || d > best.d + 1e-9) best = { x, y, d };
    }
  }
  return best;
}
export function sceneLayout(s, { size = 320, pad = 26 } = {}) {
  let x0; let x1; let y0; let y1;
  if (s.mode === 'prove' && s.stage === 'center') {
    x0 = -0.6; y0 = -0.6; x1 = s.task.grid + 0.6; y1 = s.task.grid + 0.6;
  } else {
    // la scène contient chaque point de la figure ET toute la feuille quelle que soit sa rotation (ses poignées restent
    // dans la scène) ; une feuille ÉTIRÉE peut déborder — c'est le contraste, il n'a pas à tenir.
    const O = fl(s.O);
    const names = s.mode === 'rosette' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
    const r = Math.max(...names.map((n) => { const p = fl(s.pts[n]); return Math.hypot(p.x - O.x, p.y - O.y); }));
    const sh = sheetRect(s);
    const corner = Math.max(...[[sh.x0, sh.y0], [sh.x0, sh.y1], [sh.x1, sh.y0], [sh.x1, sh.y1]].map(([x, y]) => Math.hypot(x, y)));
    const reach = Math.max(r, corner) + 0.35;
    x0 = O.x - reach; x1 = O.x + reach; y0 = O.y - reach; y1 = O.y + reach;
  }
  const span = Math.max(x1 - x0, y1 - y0);
  const k = (size - 2 * pad) / span;
  const X = (x) => pad + (x - x0) * k;
  const Y = (y) => pad + (y1 - y) * k;
  return Object.freeze({ size, k, X, Y, x0, x1, y0, y1, toWorld: (px, py) => ({ x: x0 + (px - pad) / k, y: y1 - (py - pad) / k }) });
}
/** La direction (degrés) du coin de la feuille quand θ = 0 : en bas à droite, loin du motif. */
/**
 * L'angle de la feuille sous le pointeur, DÉROULÉ près de la valeur courante (passer −180 → 180 ne fait pas sauter la
 * feuille d'un tour) : `pointerTheta(O, P, ref, offset)`, offset = la direction du coin quand θ = 0.
 */
export function pointerTheta(O, P, ref, offset = 0) {
  const raw = R.bearing(O, P) - offset; // [0, 360[ − offset
  let t = raw;
  while (t - ref > 180) t -= 360;
  while (ref - t > 180) t += 360;
  return t;
}
