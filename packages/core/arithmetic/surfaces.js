/**
 * surfaces — la mathématique EXACTE de « حوش البلاط » (1AM, unité 11, درس « مساحة سطح مستو ومحيطه », labo `tile-yard`).
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/surfaces.js`), jamais depuis le barrel du core. Aucun flottant : tout est entier
 * (les demi-carreaux se comptent en DEMIS, jamais en 0,5).
 *
 * Un « cour » (yard) est un ensemble de CELLULES d'une grille, `[r, c]` (r = ligne vers le bas, c = colonne). Le carreau est l'unité d'aire,
 * le côté d'une cellule est l'unité de longueur.
 *
 *     area(cells)                     le nombre de cellules
 *     perimeter(cells)                le nombre de côtés de cellule qui n'ont une cellule que d'UN seul côté (voisinage 4)
 *     isValid(cells)                  connexe par les côtés ET sans creux (aucune cellule vide non joignable de l'extérieur par des pas 4)
 *     liftCheck / dropCheck           ôter / poser un carreau : légal ssi le reste / le résultat reste valide (+ la raison du refus)
 *     canonical(cells)                une chaîne qui ne change ni par translation, ni par rotation, ni par symétrie
 *     boundaryLoop(cells)             la clôture, parcourue d'un seul tenant : autant de côtés que de périmètre
 *
 * Faits connus (testés) : 12 carreaux ⇒ périmètre 14 seulement pour le rectangle 3 × 4 ; le périmètre est toujours PAIR ;
 * à n carreaux il va de `minPerimeter(n)` à `2n + 2` ; à périmètre p fixé l'aire va de `p/2 − 1` à `⌊p²/16⌋`.
 *
 * Le sol (`floor`) : des cellules ENTIÈRES et des DEMI-cellules (une cellule coupée le long d'une diagonale). L'aire se compte en demis
 * d'unité ① ; l'unité ② est la tuile double (deux cellules) : la même surface a deux mesures, `n / 2` en unité ② si elle a n cellules.
 */

export const key = (r, c) => `${r},${c}`;
const uniq = (cells) => {
  const seen = new Set();
  const out = [];
  for (const [r, c] of cells) {
    const k = key(r, c);
    if (!seen.has(k)) { seen.add(k); out.push([r, c]); }
  }
  return out;
};
const setOf = (cells) => new Set(cells.map(([r, c]) => key(r, c)));
const has = (set, r, c) => set.has(key(r, c));
const N4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];

/** Le nombre de carreaux = l'aire. */
export const area = (cells) => uniq(cells).length;

/** Les côtés de bord : `{ r, c, side }` avec side ∈ 'N' | 'E' | 'S' | 'W' (le côté de la cellule qui n'a pas de voisine). */
export function boundaryEdges(cells) {
  const set = setOf(cells);
  const out = [];
  for (const [r, c] of uniq(cells)) {
    if (!has(set, r - 1, c)) out.push({ r, c, side: 'N' });
    if (!has(set, r, c + 1)) out.push({ r, c, side: 'E' });
    if (!has(set, r + 1, c)) out.push({ r, c, side: 'S' });
    if (!has(set, r, c - 1)) out.push({ r, c, side: 'W' });
  }
  return out;
}

/** Le périmètre = le nombre de côtés de bord (une unité de longueur chacun). */
export const perimeter = (cells) => boundaryEdges(cells).length;

/** Connexe par les côtés (voisinage 4). L'ensemble vide n'est PAS un cour. */
export function isConnected(cells) {
  const list = uniq(cells);
  if (list.length === 0) return false;
  const set = setOf(list);
  const seen = new Set([key(...list[0])]);
  const stack = [list[0]];
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of N4) {
      const k = key(r + dr, c + dc);
      if (set.has(k) && !seen.has(k)) { seen.add(k); stack.push([r + dr, c + dc]); }
    }
  }
  return seen.size === list.length;
}

/** Les cellules vides et enfermées (non joignables de l'extérieur par des pas 4 à travers des cellules vides). */
export function hollows(cells) {
  const list = uniq(cells);
  if (list.length === 0) return [];
  const set = setOf(list);
  let r0 = Infinity; let r1 = -Infinity; let c0 = Infinity; let c1 = -Infinity;
  for (const [r, c] of list) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  r0 -= 1; r1 += 1; c0 -= 1; c1 += 1;
  const out = new Set([key(r0, c0)]);
  const stack = [[r0, c0]];
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of N4) {
      const nr = r + dr; const nc = c + dc;
      if (nr < r0 || nr > r1 || nc < c0 || nc > c1) continue;
      const k = key(nr, nc);
      if (set.has(k) || out.has(k)) continue;
      out.add(k);
      stack.push([nr, nc]);
    }
  }
  const holes = [];
  for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) if (!set.has(key(r, c)) && !out.has(key(r, c))) holes.push([r, c]);
  return holes;
}
export const hasHole = (cells) => hollows(cells).length > 0;

/** Un cour valide : non vide, connexe, sans creux. */
export const isValid = (cells) => isConnected(cells) && !hasHole(cells);

const without = (cells, [r, c]) => uniq(cells).filter(([a, b]) => !(a === r && b === c));

/**
 * Ôter le carreau `at` : légal ssi le reste est valide (ou vide). Sinon la raison :
 * 'absent' (pas de carreau là) · 'splits' (le reste se sépare en deux morceaux) · 'hole' (un creux s'ouvre au milieu).
 * @returns {{ ok: true } | { ok: false, reason: 'absent' | 'splits' | 'hole' }}
 */
export function liftCheck(cells, at) {
  const set = setOf(cells);
  if (!has(set, at[0], at[1])) return { ok: false, reason: 'absent' };
  const rest = without(cells, at);
  if (rest.length === 0) return { ok: true };
  if (!isConnected(rest)) return { ok: false, reason: 'splits' };
  if (hasHole(rest)) return { ok: false, reason: 'hole' };
  return { ok: true };
}

/** Le carreau `at` touche-t-il le cour par un côté entier ? */
export function touchesSide(cells, at) {
  const set = setOf(cells);
  return N4.some(([dr, dc]) => has(set, at[0] + dr, at[1] + dc));
}

/**
 * Poser un carreau sur la cellule `at` : légal ssi elle est vide, partage un côté ENTIER avec le cour (le premier carreau d'un cour vide
 * se pose n'importe où) et le résultat est valide. Sinon : 'occupied' · 'detached' (aucun côté commun : un coin seulement, ou rien) · 'hole'.
 * @returns {{ ok: true } | { ok: false, reason: 'occupied' | 'detached' | 'hole' }}
 */
export function dropCheck(cells, at) {
  const list = uniq(cells);
  const set = setOf(list);
  if (has(set, at[0], at[1])) return { ok: false, reason: 'occupied' };
  if (list.length === 0) return { ok: true };
  if (!touchesSide(list, at)) return { ok: false, reason: 'detached' };
  if (hasHole([...list, at])) return { ok: false, reason: 'hole' };
  return { ok: true };
}

/** Déplacer le carreau de `from` vers `to` : ôter puis poser, la première raison de refus l'emporte. */
export function moveCheck(cells, from, to) {
  const lift = liftCheck(cells, from);
  if (!lift.ok) return lift;
  return dropCheck(without(cells, from), to);
}

/** Les 8 isométries du carré, sur des cellules (translation exclue). */
const SYM = [
  ([r, c]) => [r, c], ([r, c]) => [c, -r], ([r, c]) => [-r, -c], ([r, c]) => [-c, r],
  ([r, c]) => [r, -c], ([r, c]) => [-c, -r], ([r, c]) => [-r, c], ([r, c]) => [c, r],
];
const normalise = (cells) => {
  let r0 = Infinity; let c0 = Infinity;
  for (const [r, c] of cells) { r0 = Math.min(r0, r); c0 = Math.min(c0, c); }
  return cells.map(([r, c]) => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

/** La forme canonique : la plus petite des 8 écritures normalisées. Deux cours superposables (déplacés, tournés, retournés) ont la même. */
export function canonical(cells) {
  const list = uniq(cells);
  if (list.length === 0) return '';
  let best = null;
  for (const f of SYM) {
    const s = normalise(list.map(f)).map(([r, c]) => `${r}.${c}`).join(' ');
    if (best === null || s < best) best = s;
  }
  return best;
}
export const congruent = (a, b) => canonical(a) === canonical(b);

/**
 * La clôture parcourue d'un seul tenant (sens des aiguilles d'une montre, y vers le bas) : la liste des côtés `{ x0, y0, x1, y1 }` en
 * coordonnées de sommets (x = colonne, y = ligne). À un sommet où se croisent quatre côtés (deux carreaux qui se touchent par un coin),
 * on tourne vers l'extérieur du cour : le parcours reste d'un seul tenant. `length === perimeter(cells)` pour tout cour valide.
 */
export function boundaryLoop(cells) {
  const edges = boundaryEdges(cells).map(({ r, c, side }) => (
    side === 'N' ? { x0: c, y0: r, x1: c + 1, y1: r }
      : side === 'E' ? { x0: c + 1, y0: r, x1: c + 1, y1: r + 1 }
        : side === 'S' ? { x0: c + 1, y0: r + 1, x1: c, y1: r + 1 }
          : { x0: c, y0: r + 1, x1: c, y1: r }));
  if (edges.length === 0) return [];
  const from = new Map();
  for (const e of edges) {
    const k = key(e.y0, e.x0);
    if (!from.has(k)) from.set(k, []);
    from.get(k).push(e);
  }
  const start = edges.reduce((best, e) => (e.y0 < best.y0 || (e.y0 === best.y0 && e.x0 < best.x0) ? e : best), edges[0]);
  const used = new Set();
  const id = (e) => `${e.x0},${e.y0}>${e.x1},${e.y1}`;
  const out = [];
  let cur = start;
  // la direction d'un côté, et le « tournant » (gauche = −1, tout droit = 0, droite = +1 à l'écran, y vers le bas)
  const dir = (e) => [e.x1 - e.x0, e.y1 - e.y0];
  const turn = (a, b) => a[0] * b[1] - a[1] * b[0];
  for (let guard = 0; guard < edges.length + 2 && cur; guard += 1) {
    used.add(id(cur));
    out.push(cur);
    const options = (from.get(key(cur.y1, cur.x1)) ?? []).filter((e) => !used.has(id(e)));
    if (options.length === 0) break;
    const d = dir(cur);
    // vers l'extérieur du cour : le côté « gauche » (le cour est à droite du sens de marche)
    options.sort((a, b) => turn(d, dir(a)) - turn(d, dir(b)));
    cur = options[0];
  }
  return out;
}

/* ── Combien d'aires, combien de périmètres ─────────────────────────────────────────────── */

/** Le plus petit périmètre d'un cour de n carreaux : 2 × ⌈2√n⌉ (entier : le plus petit m avec m² ≥ 4n). */
export function minPerimeter(n) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('surfaces: n must be a positive integer');
  let m = 0;
  while (m * m < 4 * n) m += 1;
  return 2 * m;
}
/** Le plus grand : un cour « en arbre » (chaque carreau n'a qu'un voisin de plus) a 2n + 2. */
export const maxPerimeter = (n) => 2 * n + 2;

/** Les aires possibles d'un cour de périmètre p (p pair ≥ 4) : de p/2 − 1 (une file) à ⌊p²/16⌋ (le plus ramassé). */
export function areaRange(p) {
  if (!Number.isInteger(p) || p < 4 || p % 2 !== 0) throw new RangeError('surfaces: perimeter must be an even integer ≥ 4');
  return { min: p / 2 - 1, max: Math.floor((p * p) / 16) };
}

/* ── Le sol : demi-carreaux et unité double ─────────────────────────────────────────────── */

/** Un nombre de DEMIS écrit en décimal à virgule : 32 → '16', 21 → '10,5'. */
export function formatHalves(halves) {
  if (!Number.isInteger(halves) || halves < 0) throw new RangeError('surfaces: halves must be a non-negative integer');
  const whole = Math.floor(halves / 2);
  return halves % 2 === 0 ? String(whole) : `${whole},5`;
}

/** L'aire en demis d'unité ① d'un sol couvert de `whole` carreaux entiers et `halves` demi-carreaux. */
export const floorHalves = (whole, halves) => 2 * whole + halves;

/**
 * L'aire en unité ② (la tuile double = deux cellules) d'un sol de `cells` cellules couvert de `doubles` tuiles doubles et du reste en demi-doubles :
 * en demis d'unité ② elle vaut TOUJOURS `cells` — peu importe comment on a apparié les cellules.
 */
export function halvesInTwo(cells, doubles) {
  if (doubles < 0 || 2 * doubles > cells) throw new RangeError('surfaces: too many doubles');
  return 2 * doubles + (cells - 2 * doubles);
}

/** Un appariement est valide : des paires de cellules voisines par un côté, dans le sol, sans cellule commune. */
export function validPairing(cells, pairs) {
  const set = setOf(cells);
  const used = new Set();
  for (const [a, b] of pairs) {
    if (!has(set, a[0], a[1]) || !has(set, b[0], b[1])) return false;
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return false;
    for (const x of [a, b]) { const k = key(x[0], x[1]); if (used.has(k)) return false; used.add(k); }
  }
  return true;
}

export { uniq as uniqueCells };
