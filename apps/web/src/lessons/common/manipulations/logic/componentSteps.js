/**
 * component-steps — la logique PURE de l'appli de livraison (unité 12 « الأشعة في معلم », درس « قراءة مركبتي شعاع
 * وتمثيلهما في معلم », نشاط 1 p. 140). Aucun React ici, aucune arithmétique propre : chaque verdict « le livreur
 * arrive-t-il chez le client ? » vient de `vectors.vec / translate / vecEq` (packages/core/arithmetic/vectors.js).
 *
 * LE MODÈLE. Le quadrillage d'un quartier = un معلم متعامد ومتجانس : les rues sont les lignes de la grille (nœuds
 * entiers, x ∈ [xMin ; xMax], y ∈ [yMin ; yMax], y vers le HAUT), les deux grands boulevards sont les axes, et le dépôt
 * de l'appli est l'origine O. Des lieux nommés (restaurants, maisons) sont posés sur des nœuds. Une suite de COMMANDES
 * (`orders`), chacune un trajet `from` → `to` :
 *   • 'walk'     (مبتدئ) l'élève CONDUIT le livreur pas à pas (→ +1, ← −1, ↑ +1, ↓ −1) ; les deux compteurs SONT les
 *                مركبتان de from→position, écrits en colonne en direct ; la commande est livrée à l'arrivée ;
 *   • 'walkCode' (متقدم) le même trajet SANS compteurs : à l'arrivée l'élève ÉCRIT le code du trajet (deux nombres
 *                signés) — jugé contre le déplacement réel ;
 *   • 'code'     l'élève écrit le code AVANT de partir ; le pilote automatique suit le code (x d'abord, puis y) depuis
 *                `from` : la commande est livrée seulement si le code mène chez le client ;
 *   • 'pin'      le code u est DONNÉ : l'élève pose la destination (le pin) — représenter u à partir de `from`.
 *
 * UN ESSAI (un code envoyé, un pin posé, une arrivée) est jugé EXACTEMENT ; un refus dit CE QUI cloche :
 *   'sign'      les bons nombres de rues, mais une direction (← / ↓) écrite sans son signe (MISC-MAALAM-ISHARA) ;
 *   'reverse'   le trajet à l'envers (de `to` vers `from`) ;
 *   'swap'      les deux nombres échangés, le vertical d'abord (MISC-MAALAM-TABDIL-X-Y) ;
 *   'coords'    l'ADRESSE du client (ses إحداثيات) au lieu du trajet, alors qu'on ne part pas du dépôt O
 *               (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT) ;
 *   'zero'      rien n'a bougé ;  'outside'  le code sort du quartier ;  'other'  un autre lieu.
 *
 * LA DÉCOUVERTE demande toutes les commandes livrées — elles portent le CONTRASTE par construction : deux départs
 * différents et le même code (le vecteur, pas la position), un trajet vers la gauche / le bas (des signes moins), un
 * départ du dépôt O (le code = l'adresse) contre un départ ailleurs (le code ≠ l'adresse), puis le geste inverse
 * (le code donné, la destination à poser).
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';

export const CODE_LIMIT = 12;

const num = (q) => q.n / q.d;
const pair = (p) => [num(p.x), num(p.y)];
const ORIGIN = Object.freeze([0, 0]);

/** Le nœud d'un lieu nommé ('O' = l'origine, le dépôt de l'appli). */
export function at(lab, name) {
  if (name === 'O') return ORIGIN;
  return lab.points[name];
}

/** Les مركبتان de P→Q, par vectors.vec (exact), rendues en nombres. */
function vecOf(p, q) { return pair(V.vec(V.point(p[0], p[1]), V.point(q[0], q[1]))); }
/** L'image de P par le déplacement u, par vectors.translate. */
function moveBy(p, u) { return pair(V.translate(V.point(p[0], p[1]), V.point(u[0], u[1]))); }
const same = (u, v) => V.vecEq(V.point(u[0], u[1]), V.point(v[0], v[1]));

/** La cible d'une commande : le nœud d'arrivée (pour 'pin' : from + u). */
export function targetOf(lab, order) {
  if (order.kind === 'pin') return moveBy(at(lab, order.from), order.u);
  return at(lab, order.to);
}
/** Le vecteur attendu d'une commande (ses مركبتان). */
export function expectedOf(lab, order) {
  if (order.kind === 'pin') return [...order.u];
  return vecOf(at(lab, order.from), at(lab, order.to));
}

export function inside(lab, p) {
  const [x0, x1, y0, y1] = lab.grid;
  return p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1;
}

/**
 * CE QUI CLOCHE entre le déplacement écrit (ou posé) `v` et le déplacement juste `u`, pour un départ `from`.
 * `address` est le déplacement que donnerait l'erreur « l'adresse au lieu du trajet » : pour un code, les إحداثيات du
 * client ; pour un pin, le déplacement vers le nœud qui porte les nombres de u. Toujours la PREMIÈRE raison qui
 * explique l'écart, dans l'ordre du modèle ci-dessus.
 */
export function classify(v, u, from, address) {
  if (same(v, u)) return 'equal';
  if (v[0] === 0 && v[1] === 0) return 'zero';
  if (same(v, [-u[0], -u[1]])) return 'reverse';
  if (u[0] !== u[1] && same(v, [u[1], u[0]])) return 'swap';
  if (Math.abs(v[0]) === Math.abs(u[0]) && Math.abs(v[1]) === Math.abs(u[1])) return 'sign';
  if (address && (from[0] !== 0 || from[1] !== 0) && same(v, address)) return 'coords';
  return 'other';
}

/** L'état initial d'une commande. */
function freshOrder(lab, order) {
  const from = at(lab, order.from);
  return { done: false, pos: [...from], path: [[...from]], arrived: false, code: [0, 0], pin: [...from], sent: null, tries: 0, refused: [] };
}

/** L'état initial du lab, à partir des nombres du niveau. */
export function init(numbers) {
  const lab = {
    grid: [...numbers.grid],
    points: Object.fromEntries(Object.entries(numbers.points).map(([k, p]) => [k, [...p]])),
    orders: numbers.orders.map((o) => ({ ...o, ...(o.u ? { u: [...o.u] } : {}) })),
    live: numbers.live !== false,
    story: numbers.story ?? null,
    t: 0,
    trials: [],
    last: null,
  };
  lab.states = lab.orders.map((o) => freshOrder(lab, o));
  return lab;
}

export const order = (lab, i = lab.t) => lab.orders[i];
export const stateOf = (lab, i = lab.t) => lab.states[i];
export const orderDone = (lab, i) => lab.states[i].done;
export const allDone = (lab) => lab.states.every((s) => s.done);
export const discoveryReady = (lab) => allDone(lab);
/** Les مركبتان du trajet courant (déplacement net depuis le départ) : les compteurs. */
export function counters(lab, i = lab.t) {
  const o = lab.orders[i];
  return vecOf(at(lab, o.from), lab.states[i].pos);
}

const withState = (lab, i, patch) => {
  const states = lab.states.slice();
  states[i] = { ...states[i], ...patch };
  return { ...lab, states };
};
const record = (lab, trial) => {
  const n = lab.trials.length + 1;
  const tr = { n, ...trial };
  return { ...lab, trials: [...lab.trials, tr], last: tr };
};

/** Aller à une autre commande (les onglets). */
export function goTo(lab, i) {
  if (i < 0 || i >= lab.orders.length) return lab;
  return { ...lab, t: i, last: null };
}
/** La première commande non livrée après `i` (ou `i`). */
export function nextOpen(lab, i = lab.t) {
  for (let k = i + 1; k < lab.orders.length; k += 1) if (!lab.states[k].done) return k;
  for (let k = 0; k < lab.orders.length; k += 1) if (!lab.states[k].done) return k;
  return i;
}

/**
 * UN PAS du livreur (walk / walkCode) : (dx ; dy) ∈ {(±1 ; 0), (0 ; ±1)}. Un pas hors du quartier est refusé
 * sans bruit (l'élève reste au bord). L'arrivée chez le client livre ('walk') ou ouvre le code ('walkCode').
 */
export function step(lab, dx, dy) {
  const o = order(lab);
  const s = stateOf(lab);
  if (!['walk', 'walkCode'].includes(o.kind) || s.done || s.arrived) return lab;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return lab;
  const next = moveBy(s.pos, [dx, dy]);
  if (!inside(lab, next)) return { ...lab, last: { kind: 'edge', order: o.id } };
  const path = [...s.path, next];
  let out = withState(lab, lab.t, { pos: next, path });
  out = { ...out, last: null };
  if (same(next, at(lab, o.to))) {
    const comps = vecOf(at(lab, o.from), next);
    if (o.kind === 'walk') {
      out = withState(out, lab.t, { arrived: true, done: true });
      out = record(out, { order: o.id, kind: 'walk', from: o.from, to: o.to, v: comps, u: comps, ok: true, reason: 'equal', steps: path.length - 1 });
    } else {
      out = withState(out, lab.t, { arrived: true });
      out = { ...out, last: { kind: 'arrivedCode', order: o.id } };
    }
  }
  return out;
}

/** Le livreur suit la RUE jusqu'au nœud `node` : les pas, un à un (un seul axe à la fois, l'écart le plus grand d'abord). */
export function walkTo(lab, node) {
  let out = lab;
  for (let guard = 0; guard < 64; guard += 1) {
    const s = stateOf(out);
    if (s.done || s.arrived) break;
    const d = [node[0] - s.pos[0], node[1] - s.pos[1]];
    if (d[0] === 0 && d[1] === 0) break;
    const stepX = Math.abs(d[0]) >= Math.abs(d[1]);
    const before = out;
    out = stepX ? step(out, Math.sign(d[0]), 0) : step(out, 0, Math.sign(d[1]));
    if (out === before || stateOf(out).pos === s.pos) break;
  }
  return out;
}
/** Un toucher sur un nœud : seulement le long d'UNE rue (même ligne ou même colonne que le livreur). */
export function rideTo(lab, node) {
  const s = stateOf(lab);
  if (node[0] !== s.pos[0] && node[1] !== s.pos[1]) return { ...lab, last: { kind: 'street', order: order(lab).id } };
  return walkTo(lab, node);
}
/** Recommencer le trajet de la commande courante (le livreur revient au départ, rien n'est livré). */
export function restartOrder(lab) {
  const o = order(lab);
  if (stateOf(lab).done) return lab;
  return { ...withState(lab, lab.t, freshOrder(lab, o)), last: null };
}

/** « أعِد التجربة » : la MÊME commande repart du départ, même déjà livrée (le drapeau est effacé) ; les essais restent au journal. */
export function retryOrder(lab, i = lab.t) {
  return { ...withState(lab, i, freshOrder(lab, lab.orders[i])), t: i, last: null };
}

/** Régler une des deux molettes du code (axe 0 = horizontal, 1 = vertical). */
export function setCode(lab, axis, value) {
  const s = stateOf(lab);
  if (s.done) return lab;
  const v = Math.max(-CODE_LIMIT, Math.min(CODE_LIMIT, Math.round(value)));
  const code = s.code.slice();
  code[axis] = v;
  return { ...withState(lab, lab.t, { code }), last: null };
}
export const bumpCode = (lab, axis, d) => setCode(lab, axis, stateOf(lab).code[axis] + d);

/**
 * ENVOYER le code ('code' : le pilote part de `from` ; 'walkCode' : le code du trajet déjà fait). Livré si et
 * seulement si le code est le vecteur from→to ; sinon refusé avec la raison et le lieu où le code mène.
 */
export function sendCode(lab) {
  const o = order(lab);
  const s = stateOf(lab);
  if (s.done || !['code', 'walkCode'].includes(o.kind)) return lab;
  if (o.kind === 'walkCode' && !s.arrived) return { ...lab, last: { kind: 'notArrived', order: o.id } };
  const from = at(lab, o.from);
  const to = at(lab, o.to);
  const u = vecOf(from, to);
  const v = s.code.slice();
  const lands = moveBy(from, v);
  const reason = classify(v, u, from, to);
  const ok = reason === 'equal';
  const kind = !ok && !inside(lab, lands) && reason === 'other' ? 'outside' : reason;
  let out = withState(lab, lab.t, { sent: { v, lands, ok }, tries: s.tries + 1, done: ok, refused: ok ? s.refused : [...s.refused, kind] });
  out = record(out, { order: o.id, kind: o.kind, from: o.from, to: o.to, v, u, lands, ok, reason: kind });
  return out;
}

/** Déplacer le pin (mode 'pin') d'une maille, ou le poser sur un nœud. */
export function movePin(lab, dx, dy) {
  const s = stateOf(lab);
  if (order(lab).kind !== 'pin' || s.done) return lab;
  const next = moveBy(s.pin, [dx, dy]);
  if (!inside(lab, next)) return lab;
  return { ...withState(lab, lab.t, { pin: next }), last: null };
}
/** POSER la destination : livrée si et seulement si pin = from + u. */
export function dropPin(lab, node) {
  const o = order(lab);
  const s = stateOf(lab);
  if (o.kind !== 'pin' || s.done) return lab;
  const p = node ?? s.pin;
  if (!inside(lab, p)) return lab;
  const from = at(lab, o.from);
  const v = vecOf(from, p);
  const reason = classify(v, o.u, from, vecOf(from, o.u));
  const ok = reason === 'equal';
  let out = withState(lab, lab.t, { pin: [...p], sent: { v, lands: [...p], ok }, tries: s.tries + 1, done: ok, refused: ok ? s.refused : [...s.refused, reason] });
  out = record(out, { order: o.id, kind: 'pin', from: o.from, to: o.to, v, u: [...o.u], lands: [...p], ok, reason });
  return out;
}

/** Le nœud entier le plus proche d'un point (x ; y) réel, borné au quartier. */
export function nodeNear(lab, x, y) {
  const [x0, x1, y0, y1] = lab.grid;
  return [Math.max(x0, Math.min(x1, Math.round(x))), Math.max(y0, Math.min(y1, Math.round(y)))];
}

/** Ce que la leçon reçoit à chaque essai (`onTrial`). */
export function evidenceOf(lab) {
  const tr = lab.trials[lab.trials.length - 1];
  return tr ? { ...tr } : null;
}
/** Ce que la leçon reçoit à la règle (`onFinished`) : chaque commande livrée et son code. */
export function summaryOf(lab) {
  return {
    orders: lab.orders.map((o, i) => ({ id: o.id, kind: o.kind, from: o.from, to: o.to, u: expectedOf(lab, o), done: lab.states[i].done })),
    trials: lab.trials.length,
    refusals: lab.trials.filter((t) => !t.ok).map((t) => t.reason),
  };
}

/**
 * La mise en page : une maille carrée `cell` (le معلم est متجانس), le quartier centré dans (width × height) avec une
 * marge `pad` (les noms des lieux du bord restent dans la scène). Coordonnées pixel : y vers le BAS.
 */
export function layout(lab, { width, height, pad = 22 }) {
  const [x0, x1, y0, y1] = lab.grid;
  const gw = x1 - x0; const gh = y1 - y0;
  const cell = Math.max(8, Math.min((width - 2 * pad) / gw, (height - 2 * pad) / gh));
  const ox = (width - cell * gw) / 2;
  const oy = (height - cell * gh) / 2;
  const toPx = (p) => [ox + (p[0] - x0) * cell, oy + (y1 - p[1]) * cell];
  const fromPx = (px, py) => [x0 + (px - ox) / cell, y1 - (py - oy) / cell];
  return { width, height, cell, ox, oy, gw, gh, toPx, fromPx };
}
/** La hauteur « naturelle » de la scène pour une largeur donnée (maille plafonnée à `cap`). */
export function naturalHeight(lab, width, { pad = 22, cap = 54 } = {}) {
  const [x0, x1, y0, y1] = lab.grid;
  const gw = x1 - x0; const gh = y1 - y0;
  const cell = Math.min((width - 2 * pad) / gw, cap);
  return cell * gh + 2 * pad;
}
