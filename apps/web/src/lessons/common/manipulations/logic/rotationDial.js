/**
 * rotation-dial — la logique PURE de la grande roue (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », درس « مفهوم
 * الدوران وإنشاء صور أشكال هندسية بدوران », نشاطان 2 و 3 p. 152). Aucun React, aucune arithmétique propre : chaque
 * verdict « M′ est-elle l'image de M ? » vient de `rotation.imageCheck` (packages/core/arithmetic/rotation.js) — les
 * TROIS conditions du manuel (OM′ = OM, \widehat{MOM′} = α, le sens) — et ce module ne fait que dire LAQUELLE manque.
 *
 * DEUX SCÈNES, une même variable tenue : la position de l'IMAGE.
 *   • `wheel` (مبتدئ, plateforme) : la grande roue du parc de Ben Aknoun. k nacelles (A, B, C… dans le sens direct, la
 *     première à 0°) sur la jante de rayon r ; des lampes à mi-chemin sur la jante et sur un anneau intérieur (rayon
 *     `inner`), le long de 2k rayons. Une TÂCHE = « dans quelle place arrive la nacelle X si la roue tourne de n pas
 *     (n × step degrés) dans tel sens ? ». L'élève pose l'image sur un NŒUD (jante ou anneau, un rayon) : exact.
 *   • `plane` (متقدم, le manuel) : une feuille, le centre O, des MISSIONS (نشاط 2 : un point par 70° ; نشاط 3 : une
 *     قطعة puis une دائرة par 72°). Pour chaque point P, l'élève OUVRE le compas (le rayon, aimanté sur OP), TOURNE
 *     la règle de la منقلة (l'angle depuis [OP), au degré) et POSE P′ (aimantée sur l'intersection de SON cercle et de
 *     SA demi-droite) ; rien n'est jugé avant le dépôt.
 *
 * UN ESSAI est un dépôt VALIDÉ (relâchement, Entrée, toucher) : accepté si et seulement si `imageCheck(...).ok` ;
 * refusé sinon avec CE QUI MANQUE (`kind`) :
 *   'sense'   OM′ = OM et la bonne mesure, mais dans l'autre sens (le jumeau horaire) ;
 *   'radius'  la bonne direction mais OM′ ≠ OM ;
 *   'angle'   OM′ = OM mais la mesure lue n'est pas α ;
 *   'both'    ni le bon rayon ni la bonne mesure ;
 *   'zero'    l'image posée sur M (rien n'a tourné) ;
 *   'center'  l'image posée sur O.
 *
 * LA DÉCOUVERTE demande le CONTRASTE : `wheel` — toutes les tâches, qui vont par jumeaux (même angle, sens contraires) ;
 * `plane` — les trois missions (un point, une قطعة dont la longueur se garde, une دائرة dont le rayon se garde).
 */
import * as RT from '@smarter-academy/core/arithmetic/rotation.js';

/** Demi-côté du cadre (unités de la figure) : la scène est un CARRÉ centré sur O. */
export const BOX = Object.freeze({ wheel: 4.4, plane: 6 });
/** Tolérances : nœuds exacts sur la roue ; sur la feuille, au degré (la منقلة) et à 2 % près (le compas). */
export const TOL = Object.freeze({ wheel: { tol: 1e-6, tolDeg: 0.5 }, plane: { tol: 0.02, tolDeg: 0.5 } });

const NAMES = 'ABCDEFGHIJKL';
const O = Object.freeze({ x: 0, y: 0 });
const dist = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);
const pt = (p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p);
export const polar = (r, deg) => RT.pointOnCircle(O, r, deg);
/** Une valeur affichée : « 3,16 » (virgule algérienne) — affichage seulement, jamais un verdict. */
export const fmt = (x, nd = 2) => {
  const v = Math.round(x * 10 ** nd) / 10 ** nd;
  return (Object.is(v, -0) ? 0 : v).toString().replace('.', ',');
};

/**
 * LE VERDICT d'une image posée Q pour le point P (centre O, α, sens) — `imageCheck` et rien d'autre.
 * Rend { ok, kind, length, angle, sense, measured (degrés, entier lu), measuredDir, rP, rQ }.
 */
export function judge(P, Q, alpha, direction, tol = TOL.wheel, center = O) {
  P = pt(P); Q = pt(Q);
  const rP = dist(center, P); const rQ = dist(center, Q);
  if (rQ < 1e-9) return Object.freeze({ ok: false, kind: 'center', length: false, angle: false, sense: null, measured: 0, measuredDir: null, rP, rQ });
  const c = RT.imageCheck(center, P, Q, alpha, direction, tol);
  const measured = Math.round(c.measured.angle);
  let kind;
  if (c.ok) kind = 'ok';
  else if (dist(P, Q) < 1e-6) kind = 'zero';
  else if (!c.length && !c.angle) kind = 'both';
  else if (!c.length) kind = 'radius';
  else if (!c.angle) kind = 'angle';
  else kind = 'sense';
  return Object.freeze({ ok: c.ok, kind, length: c.length, angle: c.angle, sense: c.sense, measured, measuredDir: c.measured.direction, rP, rQ });
}

/** La lecture VIVANTE pendant le geste (rayons, mesure, sens) — sans verdict. */
export function reading(P, Q, center = O) {
  P = pt(P); Q = pt(Q);
  const rP = dist(center, P); const rQ = dist(center, Q);
  if (rQ < 1e-9 || rP < 1e-9) return { rP, rQ, measured: null, dir: null };
  const t = RT.orientedAngle(center, P, Q);
  return { rP, rQ, measured: Math.round(Math.abs(t)), dir: Math.abs(t) < 0.5 || Math.abs(Math.abs(t) - 180) < 0.5 ? null : t > 0 ? RT.DIRECT : RT.INDIRECT, signed: t };
}

// ── La roue (مبتدئ) ─────────────────────────────────────────────────────────

const DEFAULT_TASKS = [['A', 1, 'direct'], ['A', 1, 'indirect'], ['C', 2, 'direct'], ['C', 2, 'indirect']];

function initWheel(n) {
  const k = n.gondolas ?? 6;
  const step = n.step ?? 360 / k;
  const names = NAMES.slice(0, k).split('');
  const gondolas = Object.fromEntries(names.map((nm, i) => [nm, (i * 360) / k]));
  const tasks = (n.tasks ?? DEFAULT_TASKS).map(([from, steps, direction], i) => ({ id: `t${i + 1}`, from, steps, alpha: steps * step, direction }));
  return { scene: 'wheel', r: n.r ?? 3, inner: n.inner ?? 1.8, k, step, names, gondolas, tasks, t: 0, done: {}, trials: [], last: null };
}

/** Les nœuds de la roue : 2k rayons × { jante, anneau intérieur } (le centre n'est pas un nœud). */
export function nodes(lab) {
  const out = [];
  const m = lab.k * 2;
  for (let i = 0; i < m; i += 1) {
    const deg = (i * 360) / m;
    for (const ring of ['rim', 'inner']) {
      const p = polar(ring === 'rim' ? lab.r : lab.inner, deg);
      out.push({ id: `${ring}:${i}`, ring, i, deg, x: p.x, y: p.y });
    }
  }
  return out;
}
/** Le nœud le plus proche d'un point (unités de la figure). */
export function nodeNear(lab, x, y) {
  let best = null; let bd = Infinity;
  for (const nd of nodes(lab)) { const d = Math.hypot(nd.x - x, nd.y - y); if (d < bd) { bd = d; best = nd; } }
  return best;
}
/** Le nœud (anneau, indice de rayon) — pour le clavier. */
export const nodeAt = (lab, ring, i) => { const m = lab.k * 2; const j = ((i % m) + m) % m; return nodes(lab).find((nd) => nd.ring === ring && nd.i === j); };
/** La nacelle posée à ce nœud (jante, rayon pair), ou null. */
export const gondolaAt = (lab, nd) => (nd && nd.ring === 'rim' && nd.i % 2 === 0 ? lab.names[nd.i / 2] : null);
export const gondolaPoint = (lab, name) => polar(lab.r, lab.gondolas[name]);
export const task = (lab, t = lab.t) => lab.tasks[t];

/** Pose l'image de la nacelle de la tâche courante sur le nœud `nd` : un ESSAI. */
export function placeWheel(lab, nd) {
  const tk = task(lab);
  if (!tk || !nd) return lab;
  const v = judge(gondolaPoint(lab, tk.from), nd, tk.alpha, tk.direction, TOL.wheel);
  const trial = { n: lab.trials.length + 1, task: tk.id, from: tk.from, name: `${tk.from}'`, node: nd.id, at: { x: nd.x, y: nd.y }, landsOn: gondolaAt(lab, nd), ...v, alpha: tk.alpha, direction: tk.direction };
  const done = v.ok ? { ...lab.done, [tk.id]: nd.id } : lab.done;
  // une tâche réussie ouvre la suivante non faite (l'élève peut revenir par les onglets)
  let t = lab.t;
  if (v.ok) {
    const next = lab.tasks.findIndex((x, i) => i > lab.t && !done[x.id]);
    const any = lab.tasks.findIndex((x) => !done[x.id]);
    t = next >= 0 ? next : any >= 0 ? any : lab.t;
  }
  return { ...lab, done, t, trials: [...lab.trials, trial], last: trial };
}
export const goToTask = (lab, t) => (t >= 0 && t < lab.tasks.length ? { ...lab, t, last: null } : lab);
export const taskDone = (lab, t = lab.t) => !!lab.done[lab.tasks[t].id];

// ── La feuille (متقدم) ──────────────────────────────────────────────────────

const DEFAULT_MISSIONS = [
  { id: 'point', alpha: 70, direction: 'direct', points: { A: [3, 1], B: [-1, 2.5] } },
  { id: 'segment', alpha: 72, direction: 'direct', points: { A: [-3, 2], B: [1, 2] } },
  { id: 'circle', alpha: 72, direction: 'direct', points: { W: [-2.5, 2], A: [-2.5, 3.5] } },
];

function initPlane(n) {
  const missions = (n.missions ?? DEFAULT_MISSIONS).map((m) => ({ ...m, order: Object.keys(m.points), pts: Object.fromEntries(Object.entries(m.points).map(([k, p]) => [k, pt(p)])) }));
  return { scene: 'plane', missions, m: 0, radius: null, ray: null, images: {}, trials: [], last: null };
}

export const mission = (lab, m = lab.m) => lab.missions[m];
export const imagesOf = (lab, m = lab.m) => lab.images[lab.missions[m].id] ?? {};
/** Le point à construire maintenant (le premier sans image), ou null quand la mission est faite. */
export const current = (lab, m = lab.m) => mission(lab, m).order.find((nm) => !imagesOf(lab, m)[nm]) ?? null;
export const missionDone = (lab, m = lab.m) => current(lab, m) === null;
export const sourcePoint = (lab, name = current(lab)) => (name ? mission(lab).pts[name] : null);

/** Le compas : l'ouverture, aimantée sur OP quand elle en est à moins de `snap` (le crayon posé sur P). */
export function setRadius(lab, r, { snap = 0.08 } = {}) {
  const P = sourcePoint(lab);
  let v = Math.max(0.3, Math.min(BOX.plane * 1.35, r));
  if (P && Math.abs(v - dist(O, P)) < snap) v = dist(O, P);
  return { ...lab, radius: v };
}
/** La règle de la منقلة : l'angle (degrés, entier, ]−180 ; 180]) compté depuis [OP), positif dans le sens direct. */
export function setRay(lab, deg) {
  let d = Math.round(deg);
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  return { ...lab, ray: d };
}
/** La direction absolue de la règle (degrés depuis l'axe des abscisses). */
const rayBearing = (lab) => (lab.ray == null || !sourcePoint(lab) ? null : RT.bearing(O, sourcePoint(lab)) + lab.ray);
/** L'intersection du cercle de l'élève et de SA demi-droite, quand les deux existent. */
export const crossing = (lab) => (lab.radius == null || lab.ray == null || !sourcePoint(lab) ? null : polar(lab.radius, rayBearing(lab)));

/**
 * L'AIMANT de la feuille : vers l'intersection (cercle ∩ demi-droite) de l'élève, sinon vers son cercle, sinon vers sa
 * demi-droite — jamais vers la bonne réponse : seules ses propres constructions attirent.
 */
export function snapImage(lab, q, snap = 0.35) {
  q = pt(q);
  const I = crossing(lab);
  if (I && dist(I, q) < snap) return { ...I, snapped: 'cross' };
  const rq = dist(O, q);
  if (lab.radius != null && rq > 1e-9 && Math.abs(rq - lab.radius) < snap * 0.6) return { x: (q.x * lab.radius) / rq, y: (q.y * lab.radius) / rq, snapped: 'circle' };
  const b = rayBearing(lab);
  if (b != null) {
    const u = { x: Math.cos((b * Math.PI) / 180), y: Math.sin((b * Math.PI) / 180) };
    const along = q.x * u.x + q.y * u.y;
    const off = Math.abs(q.x * u.y - q.y * u.x);
    if (along > 0 && off < snap * 0.6) return { x: along * u.x, y: along * u.y, snapped: 'ray' };
  }
  return { ...q, snapped: null };
}

/** Pose l'image du point courant : un ESSAI, jugé par `imageCheck`. Le compas et la منقلة se referment après une réussite. */
export function placePlane(lab, q) {
  const name = current(lab);
  if (!name) return lab;
  const ms = mission(lab);
  const P = ms.pts[name];
  const Q = { x: q.x, y: q.y };
  const v = judge(P, Q, ms.alpha, ms.direction, TOL.plane);
  const trial = { n: lab.trials.length + 1, mission: ms.id, from: name, name: `${name}'`, at: Q, ...v, alpha: ms.alpha, direction: ms.direction };
  if (!v.ok) return { ...lab, trials: [...lab.trials, trial], last: trial };
  // l'image retenue est l'image EXACTE (rotateApprox) : la figure dessinée ensuite ne garde pas l'erreur de la main
  const exact = RT.rotateApprox(P, O, ms.alpha, ms.direction);
  const images = { ...lab.images, [ms.id]: { ...imagesOf(lab), [name]: exact } };
  return { ...lab, images, radius: null, ray: null, trials: [...lab.trials, trial], last: trial };
}
export const goToMission = (lab, m) => (m >= 0 && m < lab.missions.length ? { ...lab, m, radius: null, ray: null, last: null } : lab);

/** Ce que la mission finie MONTRE : la قطعة [A′B′] et sa longueur, ou la دائرة (W′, W′A′) et son rayon. */
export function outcome(lab, m = lab.m) {
  const ms = mission(lab, m);
  if (!missionDone(lab, m)) return null;
  const im = imagesOf(lab, m);
  const [a, b] = ms.order;
  const before = dist(ms.pts[a], ms.pts[b]); const after = dist(im[a], im[b]);
  return { kind: ms.id, a, b, before, after, kept: Math.abs(before - after) < 1e-9 };
}

// ── Commun ──────────────────────────────────────────────────────────────────

export function init(numbers = {}) {
  return numbers.scene === 'plane' ? initPlane(numbers) : initWheel(numbers);
}

/** La découverte s'ouvre sur le contraste : toutes les tâches (jumeaux de sens) / les trois missions. */
export function discoveryReady(lab) {
  if (lab.scene === 'wheel') return lab.tasks.every((x) => lab.done[x.id]);
  return lab.missions.every((_, i) => missionDone(lab, i));
}
/** Une tâche / mission du niveau a-t-elle été refusée pour le sens, le rayon, la mesure ? (les jumeaux vus). */
export const refusedKinds = (lab) => [...new Set(lab.trials.filter((x) => !x.ok).map((x) => x.kind))];

/** Ce que la leçon reçoit à chaque essai (`onTrial`) : le dernier essai, lisible sans la scène. */
export function evidenceOf(lab) {
  const x = lab.last;
  if (!x) return null;
  return { n: x.n, scene: lab.scene, task: x.task ?? x.mission, from: x.from, name: x.name, ok: x.ok, kind: x.kind, measured: x.measured, alpha: x.alpha, direction: x.direction, landsOn: x.landsOn ?? null };
}
/** Ce que la leçon reçoit à la règle (`onFinished`). */
export function summaryOf(lab) {
  return {
    scene: lab.scene,
    trials: lab.trials.length,
    refused: refusedKinds(lab),
    ...(lab.scene === 'wheel'
      ? { tasks: lab.tasks.map((x) => ({ id: x.id, from: x.from, alpha: x.alpha, direction: x.direction, done: !!lab.done[x.id] })) }
      : { missions: lab.missions.map((ms, i) => ({ id: ms.id, done: missionDone(lab, i), outcome: outcome(lab, i) })) }),
  };
}

// ── Les questions pendant le labo (primitives/LabCheckpoint) ──────────────────

/**
 * Les ÉTAPES du niveau, dans l'ordre : une par tâche (roue) ou par mission (feuille). Une étape est ATTEINTE quand elle est finie ET que
 * toutes les précédentes le sont (la dernière, qui finit par la règle, ne s'ouvre donc qu'au contraste complet).
 */
export function stepsOf(lab) {
  const items = lab.scene === 'wheel' ? lab.tasks : lab.missions;
  const finished = items.map((_, i) => (lab.scene === 'wheel' ? taskDone(lab, i) : missionDone(lab, i)));
  return items.map((x, i) => ({ id: x.id, reached: finished.slice(0, i + 1).every(Boolean) }));
}
/** L'essai accepté de la tâche (roue) ou du point `from` de la mission (feuille), ou null. */
export const accepted = (lab, id, from) => lab.trials.find((x) => x.ok && (x.task ?? x.mission) === id && (from == null || x.from === from)) ?? null;
/** La tâche jumelle : même nacelle, même angle, sens contraire (le contraste du niveau مبتدئ), ou null. */
export const twinOf = (lab, tk) => lab.tasks.find((x) => x.id !== tk.id && x.from === tk.from && x.alpha === tk.alpha && x.direction !== tk.direction) ?? null;
/**
 * « أعِد التجربة » : remet LA MÊME étape au départ — la tâche (roue) ou la mission (feuille) `id` perd son image acceptée et ses essais, l'onglet
 * revient dessus ; les autres étapes ne bougent pas.
 */
export function retryStep(lab, id) {
  if (lab.scene === 'wheel') {
    const t = lab.tasks.findIndex((x) => x.id === id);
    if (t < 0) return lab;
    const { [id]: _gone, ...done } = lab.done;
    return { ...lab, done, t, trials: lab.trials.filter((x) => x.task !== id), last: null };
  }
  const m = lab.missions.findIndex((x) => x.id === id);
  if (m < 0) return lab;
  const { [id]: _gone, ...images } = lab.images;
  return { ...lab, images, m, radius: null, ray: null, trials: lab.trials.filter((x) => x.mission !== id), last: null };
}

/** La mise en page d'une scène CARRÉE de côté `side` px : unités ↔ pixels (y vers le haut). */
export function layout(lab, side, pad = 18) {
  const half = BOX[lab.scene];
  const s = (side - 2 * pad) / (2 * half);
  const c = side / 2;
  return {
    side, scale: s,
    toPx: (p) => { p = pt(p); return [c + p.x * s, c - p.y * s]; },
    fromPx: (px, py) => ({ x: (px - c) / s, y: (c - py) / s }),
  };
}
