/**
 * route-compare — LA LOGIQUE PURE de la comparaison de deux parcours (unité 12 « الأشعة في معلم », « أدمج تعلّماتي »,
 * وضعية « عدّاءان » p. 148). Aucune arithmétique ici : chaque centre, chaque longueur, chaque somme vient de
 * packages/core/arithmetic/vectors.js (`routeLength`, `arcEnd`, `semicircle`, `distance`, `vec`, `midpoint`) sur les fractions
 * exactes de linear.js ; ce module dit seulement ce que la main a le droit de faire et ce que l'écran montre.
 *
 * LE MONDE (unités = côtés de carreaux du معلم متعامد ومتجانس, y vers le HAUT) : deux parcours
 *   { start: [x, y], pieces: [{ to: [x, y], arc?: 'cw' | 'ccw' }], names: ['A', 'O', …], centres?: ['I', …] }
 * — un morceau droit (une ligne de balises) ou un DEMI-CERCLE de diamètre [from, to] (`arc`, le sens tel qu'on le voit).
 *
 * L'ÉLÈVE, dans UNE scène :
 *   0. PARIE d'abord (« أتوقّع… ») : lequel est le plus court ? — l'œil ne tranche pas (9,42 contre 9,96) ;
 *   1. CONSTRUIT chaque parcours morceau par morceau avec UNE épingle :
 *      — morceau droit : il porte le coureur sur la balise suivante (un nœud entier) ; la flèche, ses deux composantes et sa
 *        longueur √(Δx² + Δy²) suivent la main ; une autre place est refusée (`off`), sauter une balise aussi (`skip`, le
 *        raccourci : plus court, mais ce n'est pas le parcours) ;
 *      — demi-cercle : il pose le CENTRE (un nœud au demi-carreau) ; l'arc part du point courant et se referme au symétrique
 *        de ce point par rapport au centre (`arcEnd`) : il ne retombe sur le parcours QUE si le centre est le MILIEU du
 *        diamètre — sinon refus avec le point d'arrivée (`miss`), et le centre posé sur l'extrémité (`atEnd`) donne un arc
 *        deux fois trop grand (le diamètre pris pour le rayon) ;
 *   2. la montre de chaque coureur additionne les morceaux EXACTEMENT (3π ; √13 + √5 + √17) puis en valeur approchée ;
 *   3. les deux parcours construits : la comparaison, le pari confronté au calcul.
 */
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

const { frac, toNumber } = LIN;
const num = (p) => toNumber(p);
const pt = (p) => V.point(p[0], p[1]);
const same = (P, Q) => V.vecEq(P, Q);

/** Un parcours prêt à être construit : ses morceaux EXACTS (vectors.routeLength), ses noms, sa longueur. */
function prepare(route, idx) {
  const R = V.routeLength({ start: route.start, pieces: route.pieces });
  const names = route.names ?? [];
  const centres = route.centres ?? [];
  let c = 0;
  const pieces = R.pieces.map((p, k) => Object.freeze({
    ...p, k,
    fromName: names[k] ?? '', toName: names[k + 1] ?? '',
    centreName: p.kind === 'arc' ? (centres[c++] ?? '') : '',
  }));
  return Object.freeze({ idx, start: pt(route.start), pieces: Object.freeze(pieces), total: R, names });
}

/** Le cadre de la scène (en carreaux, entiers) : tous les points, le sommet de chaque arc, une marge d'un carreau. */
function frameOf(routes) {
  const xs = []; const ys = [];
  for (const r of routes) {
    xs.push(num(r.start.x)); ys.push(num(r.start.y));
    for (const p of r.pieces) {
      xs.push(num(p.to.x)); ys.push(num(p.to.y));
      if (p.kind === 'arc') {
        const c = [num(p.centre.x), num(p.centre.y)]; const rad = TR.surdNumber(p.radius);
        xs.push(c[0] - rad, c[0] + rad); ys.push(c[1] - rad, c[1] + rad);
      }
    }
  }
  return { xMin: Math.floor(Math.min(...xs)) - 1, xMax: Math.ceil(Math.max(...xs)) + 1, yMin: Math.floor(Math.min(...ys)) - 1, yMax: Math.ceil(Math.max(...ys)) + 1 };
}

/** L'état initial : rien de parié, rien de construit. */
export function init({ routes, unit = 'km' } = {}) {
  if (!Array.isArray(routes) || routes.length !== 2) throw new Error('route-compare : deux parcours');
  const R = Object.freeze(routes.map(prepare));
  const s = { routes: R, unit, frame: frameOf(R), bet: null, active: 0, built: Object.freeze([0, 0]), trials: Object.freeze([]), last: null };
  return Object.freeze({ ...s, pin: currentPoint(s, 0) });
}

/** Le point où en est la construction du parcours i (le départ, ou l'extrémité du dernier morceau posé). */
export function currentPoint(s, i = s.active) {
  const r = s.routes[i]; const k = s.built[i];
  return k === 0 ? r.start : r.pieces[k - 1].to;
}
/** Le morceau à construire sur le parcours i (null s'il est complet). */
export const nextPiece = (s, i = s.active) => s.routes[i].pieces[s.built[i]] ?? null;
export const isComplete = (s, i) => s.built[i] === s.routes[i].pieces.length;
export const allDone = (s) => isComplete(s, 0) && isComplete(s, 1);

/** Le pas de l'épingle : un demi-carreau pour un centre (un milieu peut tomber entre deux nœuds), un carreau pour une balise. */
export const pinStep = (s) => (nextPiece(s)?.kind === 'arc' ? frac(1, 2) : frac(1));

/** Le nœud le plus proche (au pas de l'épingle), borné au cadre. */
export function snap(s, x, y) {
  const st = num(pinStep(s)); const f = s.frame;
  const q = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(v / st) * st));
  const X = q(x, f.xMin, f.xMax); const Y = q(y, f.yMin, f.yMax);
  return V.point(frac(Math.round(X * 2), 2), frac(Math.round(Y * 2), 2));
}

/** Parier (« أتوقّع ») — possible tant qu'aucun morceau n'est posé. */
export function placeBet(s, i) {
  if (i !== 0 && i !== 1) return s;
  if (s.built[0] + s.built[1] > 0) return s;
  return Object.freeze({ ...s, bet: i, last: Object.freeze({ kind: 'bet', bet: i }) });
}

/** Choisir le parcours à construire (après le pari). L'épingle revient à son point courant. */
export function selectRoute(s, i) {
  if (s.bet == null || (i !== 0 && i !== 1) || isComplete(s, i)) return s;
  const t = { ...s, active: i };
  return Object.freeze({ ...t, pin: currentPoint(t, i), last: Object.freeze({ kind: 'select', route: i }) });
}

/** Déplacer l'épingle (glisser, flèches) — rien n'est jugé. */
export function movePin(s, node) {
  if (s.bet == null || !nextPiece(s)) return s;
  return Object.freeze({ ...s, pin: snap(s, node.x, node.y) });
}

/**
 * Ce que la main propose en P pour le morceau à construire (sans rien poser) :
 *   seg  { kind: 'seg', end: P, length (surd), comp: vecteur }       arc  { kind: 'arc', centre: P, end (= arcEnd), radius (surd) }
 */
export function preview(s, P = s.pin) {
  const piece = nextPiece(s);
  if (!piece || !P) return null;
  const from = currentPoint(s);
  if (same(from, P)) return null;
  if (piece.kind === 'seg') return { kind: 'seg', from, end: P, comp: V.vec(from, P), length: V.distance(from, P) };
  return { kind: 'arc', from, centre: P, end: V.arcEnd(from, P), radius: V.distance(from, P), sweep: piece.sweep };
}

/**
 * Le verdict d'une épingle posée en P (relâchement, Entrée, toucher un nœud) :
 *   morceau droit  'ok' (la balise suivante) · 'skip' (une balise plus loin : un raccourci) · 'off' (hors du parcours) · 'zero'
 *   demi-cercle    'ok' (le milieu du diamètre : l'arc retombe sur le parcours) · 'atEnd' (le centre sur l'extrémité : le
 *                  diamètre pris pour le rayon) · 'miss' (l'arc se referme ailleurs) · 'zero'
 */
export function judge(s, P) {
  const piece = nextPiece(s);
  const pv = preview(s, P);
  if (!piece || !pv) return { kind: 'zero' };
  if (piece.kind === 'seg') {
    if (same(P, piece.to)) return { kind: 'ok', pv };
    const later = s.routes[s.active].pieces.slice(piece.k + 1).findIndex((q) => same(q.to, P));
    return later >= 0 ? { kind: 'skip', pv, skipped: later + 1 } : { kind: 'off', pv };
  }
  if (same(pv.end, piece.to)) return { kind: 'ok', pv };
  if (same(P, piece.to)) return { kind: 'atEnd', pv };
  return { kind: 'miss', pv };
}

/** Poser l'épingle : un ESSAI. Accepté, le morceau est construit ; refusé, l'épingle revient au point courant. */
export function placePin(s, node) {
  if (s.bet == null || !nextPiece(s)) return s;
  const P = snap(s, num(node.x), num(node.y));
  const v = judge(s, P);
  if (v.kind === 'zero') return Object.freeze({ ...s, pin: currentPoint(s), last: null });
  const piece = nextPiece(s);
  const trial = Object.freeze({ route: s.active, k: piece.k, piece: piece.kind, kind: v.kind, P, pv: v.pv });
  const trials = Object.freeze([...s.trials, trial]);
  if (v.kind !== 'ok') return Object.freeze({ ...s, pin: currentPoint(s), trials, last: Object.freeze({ kind: 'pin', trial }) });
  const built = [...s.built]; built[s.active] += 1;
  let t = { ...s, built: Object.freeze(built), trials };
  const doneHere = isComplete(t, s.active);
  // Le parcours est complet : la construction continue sur l'autre s'il en reste (même scène, aucun basculement de décor).
  if (doneHere && !isComplete(t, 1 - s.active)) t = { ...t, active: 1 - s.active };
  return Object.freeze({ ...t, pin: nextPiece(t) ? currentPoint(t) : null, last: Object.freeze({ kind: 'pin', trial, routeDone: doneHere ? s.active : null }) });
}

/** « أعِد التجربة » : le parcours i se REconstruit depuis son départ (rien n'est posé dessus, le pari reste) ; les essais restent au journal. */
export function retryRoute(s, i) {
  const built = [...s.built]; built[i] = 0;
  const t = { ...s, built: Object.freeze(built), active: i };
  return Object.freeze({ ...t, pin: currentPoint(t, i), last: null });
}

/** La longueur de ce qui est déjà construit sur le parcours i : la somme exacte (LaTeX) et la valeur approchée. */
export function builtLength(s, i) {
  const r = s.routes[i]; const k = s.built[i];
  if (k === 0) return { latex: '0', number: 0, complete: false };
  const R = V.routeLength({ start: r.start, pieces: r.pieces.slice(0, k).map((p) => ({ to: p.to, arc: p.kind === 'arc' ? p.sweep : undefined })) });
  return { latex: R.latex, number: R.number, complete: k === r.pieces.length };
}

/** Le plus court des deux parcours (0 ou 1) — décidé sur les valeurs approchées (un écart de sommes de racines et de π). */
export const shorter = (s) => (s.routes[0].total.number < s.routes[1].total.number ? 0 : 1);
/** L'écart entre les deux longueurs. */
export const gap = (s) => Math.abs(s.routes[0].total.number - s.routes[1].total.number);

/** La découverte s'ouvre quand les DEUX parcours sont construits (le pari a été fait avant : la prédiction confrontée). */
export const discoveryReady = (s) => s.bet != null && allDone(s);

/** La longueur du raccourci départ → arrivée du parcours i (le contraste « la ligne droite est plus courte, mais ce n'est pas le parcours »). */
export function shortcut(s, i) {
  const r = s.routes[i];
  return V.distance(r.start, r.pieces.at(-1).to);
}

/** La preuve envoyée à la leçon (`onTrial`) : le dernier geste, en écritures lisibles. */
export function evidenceOf(s) {
  const l = s.last;
  if (!l || l.kind !== 'pin') return l?.kind === 'bet' ? { kind: 'bet', bet: l.bet + 1 } : null;
  const t = l.trial; const piece = s.routes[t.route].pieces[t.k];
  const out = { kind: t.kind, route: t.route + 1, piece: t.piece };
  if (t.kind === 'ok') {
    if (t.piece === 'arc') Object.assign(out, { centre: pairText(piece.centre), length: `${TR.surdText(piece.radius) === '1' ? '' : TR.surdText(piece.radius)}π`, approx: dec(Math.PI * TR.surdNumber(piece.radius)) });
    else Object.assign(out, { comp: pairText(V.vec(piece.from, piece.to)), length: TR.surdText(piece.length), approx: dec(TR.surdNumber(piece.length)) });
  } else if (t.pv) {
    Object.assign(out, { at: pairText(t.P), end: pairText(t.pv.end) });
  }
  if (l.routeDone != null) out.routeDone = l.routeDone + 1;
  return out;
}

/** Écritures : un décimal à 2 chiffres avec la virgule ; un couple « (x ; y) » ; un nombre en LaTeX. */
export function dec(n, digits = 2) {
  const v = Math.round((n + Math.sign(n) * 1e-12) * 10 ** digits) / 10 ** digits;
  return v.toFixed(digits).replace('.', ',').replace('-', '−');
}
export const decTex = (n, digits = 2) => dec(n, digits).replace(',', '{,}').replace('−', '-');
export function pairText(P) {
  const t = (q) => { const v = num(q); return (Number.isInteger(v) ? String(v) : String(v).replace('.', ',')).replace('-', '−'); };
  return `(${t(P.x)} ; ${t(P.y)})`;
}
export const pairTex = (P) => `\\left(${V.numLatex(P.x)}\\,;\\,${V.numLatex(P.y)}\\right)`;

/**
 * La géométrie de la scène, en pixels, y vers le bas (pure, testée) : la même échelle k pour x et y (des CARRÉS), le tout
 * dans la largeur ET la hauteur données.
 */
export function layout(s, { width, height, pad = 12 }) {
  const f = s.frame;
  const spanX = f.xMax - f.xMin; const spanY = f.yMax - f.yMin;
  const k = Math.max(10, Math.min((width - 2 * pad) / spanX, (height - 2 * pad) / spanY));
  const W = Math.round(spanX * k + 2 * pad); const H = Math.round(spanY * k + 2 * pad);
  const X = (x) => pad + ((typeof x === 'number' ? x : num(x)) - f.xMin) * k;
  const Y = (y) => pad + (f.yMax - (typeof y === 'number' ? y : num(y))) * k;
  const fromPx = (px, py) => ({ x: f.xMin + (px - pad) / k, y: f.yMax - (py - pad) / k });
  return { k, width: W, height: H, X, Y, fromPx, frame: f };
}
