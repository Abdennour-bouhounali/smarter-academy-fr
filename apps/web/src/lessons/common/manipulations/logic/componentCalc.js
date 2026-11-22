/**
 * component-calc — la logique PURE de la carte de jeu et de ses portails (unité 12 « الأشعة في معلم », درس « حساب
 * مركبتي شعاع وتساوي شعاعين في معلم »). Aucun React ici et AUCUNE arithmétique propre : chaque composante vient de
 * `vectors.vec` (x_B − x_A ; y_B − y_A), chaque point de `vectors.translate`, chaque verdict « même vecteur ? » de
 * `vectors.vecEq` / `vectors.relation`, le متوازي أضلاع de `vectors.isParallelogram` (packages/core/arithmetic/vectors.js,
 * fractions exactes). Les flottants ne servent qu'au dessin.
 *
 * Une carte = des POINTS nommés (les portails, coordonnées entières) et une suite de MISSIONS, jouées dans l'ordre :
 *
 *   { kind: 'calc', from: 'A', to: 'B', compare?: ['D', 'E'] }
 *       Le CODE du portail A → B = les deux composantes de AB. L'élève les PRÉDIT (deux compteurs signés), puis valide :
 *       le héros saute de A du vecteur qu'il a écrit. Il n'atterrit sur B que pour (x_B − x_A ; y_B − y_A). La
 *       soustraction à l'envers (x_A − x_B ; y_A − y_B) le jette dans le sens contraire (MISC-MAALAM-TARH-MAQLUB) ;
 *       les deux composantes échangées (TABDIL-X-Y), les coordonnées de B (IHDATHIYAT-MURAKKIBAT) et un seul signe
 *       oublié (ISHARA) sont nommés. `compare` : une fois juste, le code est comparé à celui d'un autre portail
 *       (نشاط 2 : DE = CF, « deux portails jumeaux »).
 *
 *   { kind: 'place', point: 'D', vec: ['D', 'C'], ref: ['A', 'B'] | [3, 4] }
 *       Le point `point` a deux coordonnées INCONNUES : l'élève le tient (glisser, toucher un nœud, flèches, ou ses deux
 *       compteurs x / y) et le valide. Le vecteur `vec` (qui contient `point`) doit être égal à `ref` (deux points ou
 *       deux composantes). Les deux égalités de composantes (x … = …, y … = …) sont écrites ; le piège de l'ORDRE
 *       (CD = AB au lieu de DC = AB : le quadrilatère se croise — MISC-MAALAM-TARTIB-NUQAT ; ED au lieu de DE) est
 *       refusé avec sa raison. Une fois juste, le point rejoint la carte (une mission suivante peut l'utiliser).
 *
 * `live` (défaut true) : les voyants des composantes s'allument PENDANT le geste (مبتدئ) ; `live: false` (متقدم) :
 * seulement à la validation — l'élève calcule les coordonnées au lieu de tâtonner.
 *
 * UN ESSAI est un code validé (« افتح البوابة ») ou une position validée (relâchement, Entrée, ثبّت, pause du clavier) —
 * jamais une valeur que le doigt a traversée.
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';

export const PAD_RANGE = Object.freeze({ min: -12, max: 12 });

const toPt = (p) => (p && typeof p.x === 'object' ? p : V.point(p[0], p[1]));
export const xy = (p) => V.coords(toPt(p));
const isInt = (n) => Number.isInteger(n);

/** Les composantes d'un vecteur nommé par deux points de la carte (s.points). */
const vecNamed = (pts, [p, q]) => V.vec(pts[p], pts[q]);

function normalizeMission(m, pts, i) {
  if (m.kind === 'calc') {
    for (const n of [m.from, m.to]) if (!pts[n]) throw new Error(`component-calc: mission ${i} — point inconnu « ${n} »`);
    if (V.vecEq(pts[m.from], pts[m.to])) throw new Error(`component-calc: mission ${i} — ${m.from} = ${m.to}`);
    return Object.freeze({ kind: 'calc', from: m.from, to: m.to, compare: m.compare ? Object.freeze([...m.compare]) : null });
  }
  if (m.kind === 'place') {
    const [p, q] = m.vec;
    if (p !== m.point && q !== m.point) throw new Error(`component-calc: mission ${i} — ${m.point} absent de ${m.vec.join('')}`);
    const other = p === m.point ? q : p;
    if (!pts[other]) throw new Error(`component-calc: mission ${i} — point inconnu « ${other} »`);
    const refNamed = typeof m.ref[0] === 'string';
    if (refNamed) for (const n of m.ref) if (!pts[n]) throw new Error(`component-calc: mission ${i} — point inconnu « ${n} »`);
    const ref = refNamed ? vecNamed(pts, m.ref) : V.point(m.ref[0], m.ref[1]);
    if (V.isZeroVec(ref)) throw new Error(`component-calc: mission ${i} — vecteur de référence nul`);
    // vec = [X, Q] : Q − X = ref ⇒ X = Q − ref ; vec = [P, X] : X − P = ref ⇒ X = P + ref.
    const startsAtX = p === m.point;
    const target = startsAtX ? V.translate(pts[q], V.vecNeg(ref)) : V.translate(pts[p], ref);
    const trap = startsAtX ? V.translate(pts[q], ref) : V.translate(pts[p], V.vecNeg(ref));
    return Object.freeze({
      kind: 'place', point: m.point, vec: Object.freeze([p, q]), other, startsAtX,
      refNamed, refNames: refNamed ? Object.freeze([...m.ref]) : null, ref, target, trap,
    });
  }
  throw new Error(`component-calc: mission ${i} — kind inconnu « ${m.kind} »`);
}

/** Le cadre de la carte : O, les points, les cibles et pièges des points à poser, une maille autour. */
function windowOf(points) {
  const cs = points.map(xy);
  const xs = cs.map((c) => c[0]); const ys = cs.map((c) => c[1]);
  return Object.freeze({
    xMin: Math.floor(Math.min(0, ...xs)) - 1, xMax: Math.ceil(Math.max(0, ...xs)) + 1,
    yMin: Math.floor(Math.min(0, ...ys)) - 1, yMax: Math.ceil(Math.max(0, ...ys)) + 1,
  });
}
const inWin = (win, p) => { const [x, y] = xy(p); return x >= win.xMin && x <= win.xMax && y >= win.yMin && y <= win.yMax; };

/** La position de départ d'un point à poser : un nœud libre de la carte, ni la cible, ni le piège, ni un portail. */
function startFor(m, win, taken) {
  const [tx, ty] = xy(m.target);
  const cands = [[-2, -1], [-1, -2], [2, -2], [-2, 2], [1, -3], [-3, 1], [3, 1], [1, 3], [-1, 2], [2, 1]];
  for (const [dx, dy] of cands) {
    const p = V.point(tx + dx, ty + dy);
    if (inWin(win, p) && ![m.target, m.trap, ...taken].some((q) => V.vecEq(p, q))) return p;
  }
  throw new Error('component-calc: pas de départ libre');
}

export function init(n = {}) {
  const raw = n.points ?? { A: [1, 2], B: [4, 3] };
  const pts = {};
  for (const [name, p] of Object.entries(raw)) {
    if (!/^[A-Z]$/.test(name)) throw new Error(`component-calc: nom de point « ${name} »`);
    if (!xy(p).every(isInt)) throw new Error('component-calc: coordonnées entières');
    pts[name] = toPt(p);
  }
  const missionsIn = n.missions ?? [{ kind: 'calc', from: Object.keys(pts)[0], to: Object.keys(pts)[1] }];
  // Les points posés rejoignent la carte : on normalise mission par mission avec les points déjà connus.
  const known = { ...pts };
  const missions = missionsIn.map((m, i) => {
    const nm = normalizeMission(m, known, i);
    if (nm.kind === 'place') known[nm.point] = nm.target;
    return nm;
  });
  // La carte couvre O, les portails et les cibles ; un PIÈGE d'ordre n'y entre que s'il est proche (≤ 2 mailles au-delà) :
  // l'élève doit pouvoir y poser le point et voir le quadrilatère se croiser, sans que la carte devienne une bande.
  const places = missions.filter((m) => m.kind === 'place');
  const base = windowOf([...Object.values(pts), ...places.map((m) => m.target)]);
  const near = places.map((m) => m.trap).filter((t) => {
    const [x, y] = xy(t);
    return x >= base.xMin - 2 && x <= base.xMax + 2 && y >= base.yMin - 2 && y <= base.yMax + 2;
  });
  const win = windowOf([...Object.values(pts), ...places.map((m) => m.target), ...near]);
  const taken = Object.values(pts);
  const placed = {};
  for (const m of missions) if (m.kind === 'place') placed[m.point] = startFor(m, win, [...taken, ...Object.values(placed)]);
  return Object.freeze({
    points: Object.freeze(pts), missions: Object.freeze(missions), win,
    live: n.live !== false,
    idx: 0,
    solved: Object.freeze(missions.map(() => false)),
    entry: Object.freeze(missions.map(() => Object.freeze([0, 0]))),
    placed: Object.freeze(placed), starts: Object.freeze({ ...placed }),
    trials: Object.freeze([]), last: null,
  });
}

export const mission = (s, i = s.idx) => s.missions[i];

/** Les points connus à la mission i : ceux de la carte et les points posés JUSTE aux missions précédentes. */
export function knownPoints(s, i = s.idx) {
  const out = { ...s.points };
  s.missions.forEach((m, j) => { if (m.kind === 'place' && j < i && s.solved[j]) out[m.point] = m.target; });
  return out;
}

// ── mission « calc » : le code du portail ───────────────────────────────────

const clampPad = (v) => Math.min(PAD_RANGE.max, Math.max(PAD_RANGE.min, Math.round(v)));
const withEntry = (s, i, e) => Object.freeze({ ...s, entry: Object.freeze(s.entry.map((x, j) => (j === i ? Object.freeze(e) : x))), last: Object.freeze({ kind: 'edit' }) });

/** Écrit une composante du code (comp 0 = x, 1 = y). */
export function setEntry(s, comp, value) {
  const m = mission(s); if (m.kind !== 'calc' || s.solved[s.idx]) return s;
  const e = [...s.entry[s.idx]]; e[comp] = clampPad(value);
  return withEntry(s, s.idx, e);
}
export const nudgeEntry = (s, comp, d) => setEntry(s, comp, s.entry[s.idx][comp] + d);
export const toggleSign = (s, comp) => setEntry(s, comp, -s.entry[s.idx][comp]);

/** Le code juste d'une mission calc : (x_to − x_from ; y_to − y_from). */
export const calcTarget = (s, i = s.idx) => { const m = mission(s, i); const pts = knownPoints(s, i); return V.vec(pts[m.from], pts[m.to]); };

/**
 * Le verdict d'un code u pour la mission calc i :
 *   'ok'        u = (x_B − x_A ; y_B − y_A) : le héros atterrit sur B ;
 *   'reversed'  u = (x_A − x_B ; y_A − y_B) : la soustraction à l'envers, le héros part dans le sens contraire ;
 *   'swapped'   u = (y ; x) : les deux composantes échangées ;
 *   'coords'    u = (x_B ; y_B) : les coordonnées de l'arrivée au lieu des composantes ;
 *   'signX' / 'signY'  une composante juste, l'autre avec le mauvais signe ;
 *   'xOnly' / 'yOnly'  une seule composante juste ;
 *   'none'      aucune ; 'zero' : (0 ; 0), le héros ne bouge pas.
 */
export function judgeCalc(s, u, i = s.idx) {
  const t = calcTarget(s, i);
  const pts = knownPoints(s, i); const m = mission(s, i);
  const uu = toPt(u);
  const landing = V.translate(pts[m.from], uu);
  const [ux, uy] = xy(uu); const [tx, ty] = xy(t);
  let kind;
  if (V.vecEq(uu, t)) kind = 'ok';
  else if (V.isZeroVec(uu)) kind = 'zero';
  else if (V.vecEq(uu, V.vecNeg(t))) kind = 'reversed';
  else if (tx !== ty && ux === ty && uy === tx) kind = 'swapped';
  else if (V.vecEq(uu, pts[m.to])) kind = 'coords';
  else if (ux === tx && uy === -ty) kind = 'signY';
  else if (uy === ty && ux === -tx) kind = 'signX';
  else if (ux === tx) kind = 'xOnly';
  else if (uy === ty) kind = 'yOnly';
  else kind = 'none';
  return Object.freeze({ kind, u: uu, target: t, landing, okX: ux === tx, okY: uy === ty });
}

/** « افتح البوابة » : un essai ; juste, la mission est résolue. */
export function commitCalc(s) {
  const m = mission(s); if (m.kind !== 'calc' || s.solved[s.idx]) return s;
  const [ex, ey] = s.entry[s.idx];
  const j = judgeCalc(s, [ex, ey]);
  const trial = Object.freeze({ mission: s.idx, kind: j.kind, u: Object.freeze([ex, ey]), landing: Object.freeze(xy(j.landing)) });
  return Object.freeze({
    ...s,
    solved: j.kind === 'ok' ? Object.freeze(s.solved.map((v, k) => (k === s.idx ? true : v))) : s.solved,
    trials: Object.freeze([...s.trials, trial]),
    last: Object.freeze({ kind: 'commit', trial }),
  });
}

/** Les portails jumeaux : le code de la mission i comparé au vecteur `compare` (une fois juste). */
export function twin(s, i = s.idx) {
  const m = mission(s, i);
  if (m.kind !== 'calc' || !m.compare || !s.solved[i]) return null;
  const pts = knownPoints(s, i);
  const other = vecNamed(pts, m.compare);
  return Object.freeze({ names: m.compare, other, equal: V.vecEq(other, calcTarget(s, i)) });
}

// ── mission « place » : le point aux coordonnées inconnues ──────────────────

/** Le nœud entier le plus proche, borné à la carte. */
function nodeAt(s, x, y) {
  return V.point(Math.min(s.win.xMax, Math.max(s.win.xMin, Math.round(x))), Math.min(s.win.yMax, Math.max(s.win.yMin, Math.round(y))));
}

/**
 * La lecture d'une position P du point à poser : le vecteur `vec` calculé, la référence, les deux égalités de
 * composantes, et le verdict :
 *   'ok'     les deux composantes égales ;
 *   'order'  vec = −ref : l'ordre des lettres (CD = AB au lieu de DC = AB ; ED au lieu de DE) ;
 *   'xOnly' / 'yOnly'  une seule égalité ;  'none' ;  'zero' : posé sur l'autre extrémité (pas de vecteur) ;
 *   'onPoint' posé sur un autre portail de la carte (sauf l'autre extrémité).
 */
export function judgePlace(s, P = s.placed[mission(s).point], i = s.idx) {
  const m = mission(s, i);
  const pts = knownPoints(s, i);
  const p = toPt(P);
  const all = { ...pts, [m.point]: p };
  const v = vecNamed(all, m.vec);
  const [vx, vy] = xy(v); const [rx, ry] = xy(m.ref);
  const okX = vx === rx; const okY = vy === ry;
  let kind;
  if (V.isZeroVec(v)) kind = 'zero';
  else if (okX && okY) kind = 'ok';
  else if (V.vecEq(v, V.vecNeg(m.ref))) kind = 'order';
  else if (Object.entries(pts).some(([n, q]) => n !== m.other && V.vecEq(q, p))) kind = 'onPoint';
  else if (okX) kind = 'xOnly';
  else if (okY) kind = 'yOnly';
  else kind = 'none';
  return Object.freeze({ kind, vec: v, ref: m.ref, okX, okY, at: p });
}

export function movePlace(s, P) {
  const m = mission(s); if (m.kind !== 'place' || s.solved[s.idx]) return s;
  const p = nodeAt(s, ...xy(P));
  if (V.vecEq(p, s.placed[m.point])) return s;
  return Object.freeze({ ...s, placed: Object.freeze({ ...s.placed, [m.point]: p }), last: Object.freeze({ kind: 'move' }) });
}
/** Une coordonnée du point à poser, réglée au compteur (comp 0 = x, 1 = y). */
export function setPlaceCoord(s, comp, value) {
  const m = mission(s); if (m.kind !== 'place') return s;
  const [x, y] = xy(s.placed[m.point]);
  return movePlace(s, comp === 0 ? [value, y] : [x, value]);
}

/** Valide la position (un essai). */
export function commitPlace(s, P) {
  const m = mission(s); if (m.kind !== 'place' || s.solved[s.idx]) return s;
  const moved = P ? movePlace(s, P) : s;
  const j = judgePlace(moved);
  const trial = Object.freeze({ mission: s.idx, kind: j.kind, at: Object.freeze(xy(j.at)), vec: Object.freeze(xy(j.vec)) });
  return Object.freeze({
    ...moved,
    solved: j.kind === 'ok' ? Object.freeze(moved.solved.map((v, k) => (k === s.idx ? true : v))) : moved.solved,
    trials: Object.freeze([...moved.trials, trial]),
    last: Object.freeze({ kind: 'commit', trial }),
  });
}

/**
 * La forme dessinée d'une mission place dont la référence est nommée (AB) et le vecteur contient deux autres
 * points (DC) : le quadrilatère « ref[0] ref[1] vec[1] vec[0] » (A B C D) — متوازي أضلاع quand AB = DC, croisé
 * quand AB = CD, quelconque sinon. `null` quand la référence est donnée par ses composantes.
 */
export function quadOf(s, P = s.placed[mission(s).point], i = s.idx) {
  const m = mission(s, i);
  if (m.kind !== 'place' || !m.refNamed) return null;
  const pts = { ...knownPoints(s, i), [m.point]: toPt(P) };
  const [a, b] = m.refNames; const [p, q] = m.vec;
  const names = [a, b, q, p];
  if (new Set(names).size < 4) return null;
  // ABCD متوازي أضلاع ⇔ AB = DC ; ABCD croisé ⇔ ABDC متوازي أضلاع (AB = CD).
  const shape = V.isParallelogram(pts[a], pts[b], pts[q], pts[p]) ? 'para'
    : V.isParallelogram(pts[a], pts[b], pts[p], pts[q]) ? 'crossed' : 'other';
  return Object.freeze({ names, shape });
}

// ── le parcours ──────────────────────────────────────────────────────────────

/** L'élève passe à la mission suivante (seulement après avoir résolu la courante). */
/** « أعِد التجربة » : la MÊME mission repart du début (code à 0, point de départ), le drapeau « résolue » est effacé ; les essais restent au journal. */
export function restartMission(s) {
  const m = mission(s);
  return Object.freeze({
    ...s,
    solved: Object.freeze(s.solved.map((v, k) => (k === s.idx ? false : v))),
    entry: Object.freeze(s.entry.map((e, k) => (k === s.idx ? Object.freeze([0, 0]) : e))),
    placed: m.kind === 'place' ? Object.freeze({ ...s.placed, [m.point]: s.starts[m.point] }) : s.placed,
    last: null,
  });
}

export const nextMission = (s) => (s.solved[s.idx] && s.idx < s.missions.length - 1 ? Object.freeze({ ...s, idx: s.idx + 1, last: null }) : s);
/** Revenir voir une mission résolue. */
export const goMission = (s, i) => (i >= 0 && i < s.missions.length && (i <= s.idx || s.solved[i - 1]) ? Object.freeze({ ...s, idx: i, last: null }) : s);

const allSolved = (s) => s.solved.every(Boolean);
/** La découverte : toutes les missions résolues (un code calculé ET un point aux coordonnées inconnues). */
export const discoveryReady = (s) => allSolved(s);

/** Le dernier essai validé d'un certain genre (réfuter un distracteur avec les propres essais de l'élève). */
export const lastTrial = (s, pred) => [...s.trials].reverse().find(pred) ?? null;

/** Ce que le module affiche de l'essai (`onTrial`). */
export function evidenceOf(s) {
  const t = s.trials.at(-1);
  if (!t) return null;
  const m = s.missions[t.mission];
  const base = { n: s.trials.length, mission: t.mission, kind: t.kind };
  if (m.kind === 'calc') return { ...base, type: 'calc', from: m.from, to: m.to, u: [...t.u] };
  return { ...base, type: 'place', point: m.point, at: [...t.at], vec: m.vec.join(''), components: [...t.vec] };
}

// ── le dessin ────────────────────────────────────────────────────────────────

/** La géométrie de la carte : cadre (unités), échelle en px, conversions (y vers le haut). */
export function frame(s, { width, height, pad = 22 }) {
  const { win } = s;
  const cols = win.xMax - win.xMin; const rows = win.yMax - win.yMin;
  const u = Math.max(8, Math.min((width - 2 * pad) / cols, (height - 2 * pad) / rows));
  const W = cols * u + 2 * pad; const H = rows * u + 2 * pad;
  const ox = (width - W) / 2; const oy = (height - H) / 2;
  const px = (x) => ox + pad + (x - win.xMin) * u;
  const py = (y) => oy + pad + (win.yMax - y) * u;
  const fromPx = (X, Y) => [win.xMin + (X - ox - pad) / u, win.yMax - (Y - oy - pad) / u];
  return { win, u, cols, rows, px, py, fromPx, P: (p) => { const [x, y] = xy(p); return [px(x), py(y)]; } };
}

/** La hauteur naturelle de la carte pour une largeur : une maille plafonnée à 56 px. */
export function naturalHeight(s, width, pad = 22) {
  const cols = s.win.xMax - s.win.xMin; const rows = s.win.yMax - s.win.yMin;
  const u = Math.min(56, (width - 2 * pad) / cols);
  return rows * u + 2 * pad;
}
