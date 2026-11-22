/**
 * translation-glide — la logique PURE du spectacle de drones (unité 11 « الأشعة والانسحاب », درس « مفهوم الانسحاب
 * والشعاع وتساوي شعاعين », نشاط 1 p. 128). Aucun React ici, aucune arithmétique propre : chaque verdict « même
 * flèche ou non » et ce qui diffère (المنحى، الاتجاه، الطول) vient de `vectors.relation`
 * (packages/core/arithmetic/vectors.js) ; la longueur exacte de `vectors.distance` (√10, 2√2, 5).
 *
 * LE MODÈLE. Une grille de nœuds entiers (x ∈ [0 ; w], y ∈ [0 ; h], y vers le HAUT) — le quadrillage du manuel,
 * qui est ici la grille lumineuse du spectacle. Des drones nommés posés sur des nœuds. Un TABLEAU = une
 * translation : un drone « meneur » et son image, puis les drones dont l'élève POSE l'image (un nœud).
 *   • scène `show` (مبتدئ, plateforme) : UN tableau ; le meneur A n'a pas d'image imposée — l'élève la CHOISIT en
 *     portant A (le vecteur est dans sa main ; `vector` n'est que la balise du plan du spectacle, une orientation).
 *     Une fois les images posées, déplacer A′ déplace TOUTE la formation (les images posées restent P + u). Puis
 *     un drone « égaré » R vole avec la flèche −u (même منحى، même طول، اتجاه معاكس) : l'élève le répare.
 *   • scène `act1` (متقدم, le نشاط 1 du manuel, figure redessinée — voir ACT1) : le triangle ABC et le point K, quatre tableaux dont le couple est DONNÉ par le manuel (A ↦ G, C ↦ R, A ↦ M, A ↦ A′) ;
 *     l'élève pose les images des autres sommets (et de K au 4e) — la figure du manuel se reconstruit sous sa main.
 *
 * UN ESSAI est un placement VALIDÉ (relâchement, Entrée, toucher d'un nœud) : accepté si et seulement si la flèche
 * PP′ est ÉGALE à u (`relation(...).equal`) ; refusé sinon, avec CE QUI DIFFÈRE (`kind`) :
 *   'direction'    منحى مختلف (les deux flèches ne sont pas parallèles) ;
 *   'sense'        même منحى، même طول، اتجاه معاكس ;
 *   'length'       même منحى، même اتجاه، طول مختلف ;
 *   'senseLength'  même منحى، اتجاه et طول différents ;
 *   'zero'         le drone n'a pas bougé (flèche nulle) ;
 *   'outside'      (meneur) une image sortirait de la grille ;
 *   'tooFar'       (meneur) la flèche est trop longue pour que le drone égaré vole ±u dans le ciel.
 *
 * LA DÉCOUVERTE demande un CONTRASTE : `show` — toutes les images posées ET le drone égaré réparé (sa flèche
 * même منحى même طول mais اتجاه معاكس a été vue et refusée) ; `act1` — les quatre tableaux, dont A ↦ G et A ↦ M
 * (même منحى, اتجاه et طول différents) et A ↦ A′ / K ↦ H (deux couples, une seule translation).
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';

/**
 * Le نشاط 1 du manuel (p. 128), REDESSINÉ (règle du propriétaire, 2026-10-04 : le dessin du manuel est une bande 4 × 11
 * où les images se chevauchent et les étiquettes se heurtent) : même triangle ABC, même point K, quatre translations
 * données par un point et son image (A ↦ G, C ↦ R, A ↦ M, A ↦ A′), même concept — AG, CE, KH, AM sur des droites
 * parallèles, AM de sens contraire, AG = CE ≠ KH, C ↦ D et K ↦ H la translation A ↦ A′ — sur une grille 14 × 8 où les
 * quatre images sont séparées. Les noms d'images que le texte du manuel cite sont gardés (G, E, R, P, M, N, A′, C′, D,
 * H) ; Q, S, T nomment les images qui coïncidaient dans le dessin du manuel.
 */
export const ACT1 = Object.freeze({
  grid: [14, 8],
  drones: { A: [8, 4], B: [10, 1], C: [10, 3], K: [7, 7] },
  tableaux: [
    { id: 'G', from: 'A', to: [2, 4], toName: 'G', place: [['B', 'Q'], ['C', 'E']], triangle: 'GQE' },
    { id: 'R', from: 'C', to: [12, 7], toName: 'R', place: [['A', 'S'], ['B', 'P']], triangle: 'SPR' },
    { id: 'M', from: 'A', to: [11, 4], toName: 'M', place: [['B', 'N'], ['C', 'T']], triangle: 'MNT' },
    { id: "A'", from: 'A', to: [5, 4], toName: "A'", place: [['B', "C'"], ['C', 'D'], ['K', 'H']], triangle: "A'C'D" },
  ],
});

const key = (p) => `${p[0]},${p[1]}`;
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const add = (p, u) => [p[0] + u[0], p[1] + u[1]];
const neg = (u) => [-u[0], -u[1]];
const inside = (lab, p) => p[0] >= 0 && p[0] <= lab.grid[0] && p[1] >= 0 && p[1] <= lab.grid[1];

/** Ce qui diffère entre la flèche v et la flèche de référence u (relation exacte de vectors.js). */
export function compare(u, v) {
  if (v[0] === 0 && v[1] === 0) return { kind: 'zero', direction: false, sense: null, length: false, equal: false };
  const r = V.relation(V.point(u[0], u[1]), V.point(v[0], v[1]));
  let kind = 'equal';
  if (!r.equal) {
    if (!r.direction) kind = 'direction';
    else if (r.sense === false && r.length) kind = 'sense';
    else if (r.sense === false) kind = 'senseLength';
    else kind = 'length';
  }
  return { kind, direction: r.direction, sense: r.sense, length: r.length, equal: r.equal };
}

/** La longueur d'une flèche en carreaux : exacte (« √10 », « 5 », « 2√2 ») et approchée (3,16). */
export function lengthOf(u) {
  const d = V.distance(V.point(0, 0), V.point(u[0], u[1]));
  const n = Math.hypot(u[0], u[1]);
  return { text: V.distanceText(V.point(0, 0), V.point(u[0], u[1])), latex: V.distanceLatex(V.point(0, 0), V.point(u[0], u[1])), value: n, exact: V.isRationalDistance(V.point(0, 0), V.point(u[0], u[1])), surd: d };
}

/** « 3,16 » : la valeur décimale au centième, virgule algérienne (affichage seulement). */
export const approx = (x) => (Math.round(x * 100) / 100).toString().replace('.', ',');

/**
 * L'état initial. `show` : { grid, drones, vector (balise du plan), names? } ; `act1` : rien d'autre (le manuel).
 */
export function init(numbers = {}) {
  const scene = numbers.scene === 'act1' ? 'act1' : 'show';
  if (scene === 'act1') {
    const n = { ...ACT1, ...numbers };
    return {
      scene, grid: n.grid, drones: { ...n.drones },
      tableaux: n.tableaux.map((t) => ({ ...t, u: sub(t.to, n.drones[t.from]) })),
      t: 0, placed: {}, trials: [], last: null, rogue: null, beacon: null,
    };
  }
  const drones = numbers.drones ?? { A: [1, 1], B: [3, 1], C: [2, 3] };
  const names = Object.keys(drones);
  const leader = names[0];
  return {
    scene,
    grid: numbers.grid ?? [9, 6],
    drones: { ...drones },
    beacon: numbers.vector ? add(drones[leader], numbers.vector) : null,
    tableaux: [{ id: 'show', from: leader, to: null, toName: `${leader}'`, u: null, place: names.slice(1).map((n) => [n, `${n}'`]) }],
    t: 0, placed: {}, trials: [], last: null,
    rogue: { name: numbers.rogueName ?? 'R', at: null, fixed: false },
  };
}

export const tableau = (lab, t = lab.t) => lab.tableaux[t];
export const vectorOf = (lab, t = lab.t) => lab.tableaux[t].u;
export const placedIn = (lab, t = lab.t) => lab.placed[lab.tableaux[t].id] ?? {};

/** Les drones dont l'élève doit poser l'image dans le tableau t, dans l'ordre. */
export const toPlace = (lab, t = lab.t) => lab.tableaux[t].place.map(([from]) => from);
export const imageName = (lab, from, t = lab.t) => (lab.tableaux[t].place.find(([f]) => f === from) ?? [from, `${from}'`])[1];

/** Un tableau est fini quand chaque image est posée (et, en `show`, le drone égaré réparé). */
export function tableauDone(lab, t = lab.t) {
  const tb = lab.tableaux[t];
  if (!tb.u) return false;
  const placed = lab.placed[tb.id] ?? {};
  const all = tb.place.every(([from]) => placed[from]);
  return lab.scene === 'show' ? all && !!lab.rogue?.fixed : all;
}
export const imagesDone = (lab, t = lab.t) => {
  const tb = lab.tableaux[t];
  const placed = lab.placed[tb.id] ?? {};
  return !!tb.u && tb.place.every(([from]) => placed[from]);
};
export const allDone = (lab) => lab.tableaux.every((_, t) => tableauDone(lab, t));
export const discoveryReady = allDone;

/** Le drone égaré (scène `show`) : un nœud libre R tel que R + u et R − u restent dans la grille. */
function rogueSpot(lab, u) {
  if (!u) return null;
  const busy = new Set([...Object.values(lab.drones), ...Object.values(lab.drones).map((p) => add(p, u))].map(key));
  const { grid } = lab;
  let best = null;
  for (let y = grid[1]; y >= 0; y -= 1) {
    for (let x = 0; x <= grid[0]; x += 1) {
      const p = [x, y];
      if (busy.has(key(p)) || busy.has(key(add(p, u))) || busy.has(key(add(p, neg(u))))) continue;
      if (!inside(lab, add(p, u)) || !inside(lab, add(p, neg(u)))) continue;
      // le plus loin de la formation (lisible), puis le plus haut, puis le plus à droite
      const d = Math.min(...Object.values(lab.drones).map((q) => Math.hypot(q[0] - x, q[1] - y)));
      if (!best || d > best.d + 1e-9) best = { p, d };
    }
  }
  return best ? best.p : null;
}

/** La flèche d'un drone dans le tableau courant : son image posée, ou rien. */
export function imageOf(lab, from, t = lab.t) {
  const tb = lab.tableaux[t];
  if (from === tb.from) return tb.u ? add(lab.drones[from], tb.u) : null;
  const placed = (lab.placed[tb.id] ?? {})[from];
  return placed ? add(lab.drones[from], tb.u) : null;
}

/** Le drone égaré : sa position et la pointe de sa flèche (−u tant qu'il n'est pas réparé). */
export function rogueArrow(lab) {
  const u = vectorOf(lab, 0);
  if (lab.scene !== 'show' || !u || !lab.rogue?.at || !imagesDone(lab, 0)) return null;
  const at = lab.rogue.at;
  return { at, tip: add(at, lab.rogue.fixed ? u : neg(u)), fixed: lab.rogue.fixed };
}

function pushTrial(lab, trial) {
  return { ...lab, trials: [...lab.trials, { ...trial, n: lab.trials.length + 1 }], last: { ...trial } };
}

/**
 * Le meneur (scène `show`) : l'élève porte A jusqu'au nœud `to`. Refusé si nul ou si une image (formation ou
 * drone égaré) sortait de la grille. Les images déjà posées suivent (elles valent toujours P + u).
 */
export function setVector(lab, to) {
  if (lab.scene !== 'show') return lab;
  const tb = lab.tableaux[0];
  const A = lab.drones[tb.from];
  const u = sub(to, A);
  if (u[0] === 0 && u[1] === 0) return { ...lab, last: { kind: 'zero', from: tb.from, to, leader: true } };
  const out = Object.entries(lab.drones).find(([, p]) => !inside(lab, add(p, u)));
  if (out) return { ...lab, last: { kind: 'outside', from: tb.from, to, leader: true, name: out[0] } };
  // le drone égaré doit pouvoir voler ±u dans le ciel : sinon la flèche est trop longue pour le spectacle
  if (!rogueSpot(lab, u)) return { ...lab, last: { kind: 'tooFar', from: tb.from, to, leader: true } };
  const next = withRogue({ ...lab, tableaux: [{ ...tb, to, u }] });
  return pushTrial(next, { kind: 'leader', from: tb.from, to, u, leader: true, ok: true });
}

/** Le drone égaré entre en scène dès que la formation est complète ; il garde sa place tant qu'elle reste valable. */
function withRogue(lab) {
  if (lab.scene !== 'show' || !imagesDone(lab, 0)) return lab;
  const u = lab.tableaux[0].u;
  const at = lab.rogue.at;
  const busy = new Set([...Object.values(lab.drones), ...Object.values(lab.drones).map((p) => add(p, u))].map(key));
  const ok = at && !busy.has(key(at)) && !busy.has(key(add(at, u))) && !busy.has(key(add(at, neg(u))))
    && inside(lab, add(at, u)) && inside(lab, add(at, neg(u)));
  return ok ? lab : { ...lab, rogue: { ...lab.rogue, at: rogueSpot(lab, u) } };
}

/**
 * Poser l'image du drone `from` sur le nœud `to` dans le tableau courant. Accepté ⇔ la flèche est égale à u.
 */
export function place(lab, from, to) {
  const tb = lab.tableaux[lab.t];
  if (!tb.u) return { ...lab, last: { kind: 'noVector', from, to } };
  if (!inside(lab, to)) return { ...lab, last: { kind: 'outsideNode', from, to } };
  const v = sub(to, lab.drones[from]);
  const c = compare(tb.u, v);
  const trial = { kind: c.kind, from, to, v, u: tb.u, tableau: tb.id, ok: c.equal, rel: c, name: imageName(lab, from) };
  if (!c.equal) return pushTrial(lab, trial);
  const placed = { ...lab.placed, [tb.id]: { ...(lab.placed[tb.id] ?? {}), [from]: true } };
  return pushTrial(withRogue({ ...lab, placed }), trial);
}

/** Réparer le drone égaré : poser la pointe de sa flèche en `to` (accepté ⇔ flèche égale à u). */
export function fixRogue(lab, to) {
  const r = rogueArrow(lab);
  if (!r || r.fixed) return lab;
  const u = vectorOf(lab, 0);
  const v = sub(to, r.at);
  const c = compare(u, v);
  const trial = { kind: c.kind, from: lab.rogue.name, to, v, u, tableau: 'rogue', ok: c.equal, rel: c, name: `${lab.rogue.name}'`, rogue: true };
  const next = c.equal ? { ...lab, rogue: { ...lab.rogue, fixed: true } } : lab;
  return pushTrial(next, trial);
}

/**
 * « أعِد التجربة » : remet la MÊME étape au départ. `act1` : les images du tableau courant s'effacent. `show` : phase 0 = toute la
 * formation (le meneur revient), phase 1 = le drone égaré redevient égaré.
 */
export function restartStep(lab, phase = 0) {
  if (lab.scene === 'act1') {
    const tb = lab.tableaux[lab.t];
    return { ...lab, placed: { ...lab.placed, [tb.id]: {} }, last: null };
  }
  if (phase === 1) return { ...lab, rogue: { ...lab.rogue, fixed: false }, last: null };
  const tb = lab.tableaux[0];
  return { ...lab, tableaux: [{ ...tb, to: null, u: null }], placed: {}, rogue: { ...lab.rogue, at: null, fixed: false }, last: null };
}

/** Passer à un tableau (scène `act1`) ; les tableaux faits restent faits. */
export const goTo = (lab, t) => (t >= 0 && t < lab.tableaux.length ? { ...lab, t, last: null } : lab);

/** Le nœud le plus proche d'un point de la grille (flottants) — borné à la grille. */
export function nodeNear(lab, x, y) {
  return [Math.max(0, Math.min(lab.grid[0], Math.round(x))), Math.max(0, Math.min(lab.grid[1], Math.round(y)))];
}

/** Déplacer un curseur clavier d'un nœud, borné. */
export const nudge = (lab, p, dx, dy) => nodeNear(lab, p[0] + dx, p[1] + dy);

/**
 * Le parallélogramme de la scène (le pont vers معارف 2) : le meneur A, un drone B, leurs images B′, A′ — dans
 * l'ordre A, B, B′, A′ ; `flat` quand les quatre points sont alignés (le cas « مسطّح »).
 */
export function parallelogram(lab, t = lab.t) {
  const tb = lab.tableaux[t];
  if (!tb.u) return null;
  const first = tb.place.find(([from]) => (lab.placed[tb.id] ?? {})[from]);
  if (!first) return null;
  const A = lab.drones[tb.from]; const B = lab.drones[first[0]];
  const pts = [A, B, add(B, tb.u), add(A, tb.u)];
  const flat = V.collinear(V.point(...A), V.point(...B), V.point(...add(A, tb.u)));
  return { names: [tb.from, first[0], first[1], tb.toName], points: pts, flat };
}

/**
 * La mise en page : la taille d'un carreau `cell` pour tenir `width` × `height`, les marges (le bas garde la mer et
 * la foule du décor), et les conversions grille ↔ pixels (y vers le bas à l'écran).
 */
export function layout(lab, { width, height, pad = 18, sea = 0 }) {
  const [w, h] = lab.grid;
  const cell = Math.max(10, Math.min((width - 2 * pad) / w, (height - 2 * pad - sea) / h));
  const gw = cell * w; const gh = cell * h;
  const ox = (width - gw) / 2;
  const oy = pad + Math.max(0, (height - 2 * pad - sea - gh) / 2);
  const toPx = (p) => [ox + p[0] * cell, oy + (h - p[1]) * cell];
  const fromPx = (px, py) => [(px - ox) / cell, h - (py - oy) / cell];
  return { cell, ox, oy, gw, gh, width, height, toPx, fromPx };
}

/** La hauteur naturelle de la scène pour une largeur donnée (carreaux ≤ `cap` px). */
export function naturalHeight(lab, width, { pad = 18, sea = 0, cap = 46 } = {}) {
  const [w, h] = lab.grid;
  const cell = Math.min(cap, (width - 2 * pad) / w);
  return Math.round(cell * h + 2 * pad + sea);
}

/** Ce que le module affiche des essais de l'élève (onTrial) : le tableau, le drone, l'image et le verdict. */
export function evidenceOf(lab) {
  const tr = lab.trials[lab.trials.length - 1];
  if (!tr) return null;
  return {
    n: tr.n, scene: lab.scene, tableau: tr.tableau ?? null, from: tr.from, name: tr.name ?? null, ok: !!tr.ok, kind: tr.kind,
    leader: !!tr.leader, rogue: !!tr.rogue,
    length: tr.u ? approx(Math.hypot(tr.u[0], tr.u[1])) : null,
  };
}

/** Le résumé de la scène finie (onFinished). */
export function summaryOf(lab) {
  return {
    scene: lab.scene,
    tableaux: lab.tableaux.map((tb, t) => ({ id: tb.id, from: tb.from, toName: tb.toName, done: tableauDone(lab, t), images: tb.place.map(([, n]) => n) })),
    refused: lab.trials.filter((tr) => !tr.ok).length,
  };
}
