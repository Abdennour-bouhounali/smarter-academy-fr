/**
 * Modèle mathématique de la leçon « Solides et patrons ».
 *
 * ─── LES SOLIDES ───────────────────────────────────────────────────────
 * Chaque solide est décrit par ses COMPTES (faces, arêtes, sommets) et la
 * nature de ses faces. Ces nombres ne sont jamais écrits en dur dans un
 * module : ils viennent d'ici, et la relation d'Euler (F + S − A = 2) les
 * vérifie — un chiffre faux serait détecté par les tests.
 *
 * ─── LES PATRONS DU CUBE ───────────────────────────────────────────────
 * Un patron est une grille 4×5 de cases cochées. Savoir s'il se replie en
 * cube n'est PAS une liste apprise par cœur : on le VÉRIFIE en simulant le
 * pliage, face par face, sur les six faces du cube. C'est ce qui permet
 * d'accepter n'importe quel patron valide que l'élève inventerait, et de
 * refuser les autres pour une raison exacte.
 */

/* ── Les solides au programme ────────────────────────────────────────── */

export const SOLIDES = {
  cube: {
    id: 'cube',
    nom: 'cube',
    faces: 6,
    aretes: 12,
    sommets: 8,
    natureFaces: '6 carrés identiques',
    emoji: '🧊',
  },
  pave: {
    id: 'pave',
    nom: 'pavé droit',
    faces: 6,
    aretes: 12,
    sommets: 8,
    natureFaces: '6 rectangles, opposés deux à deux identiques',
    emoji: '📦',
  },
  prisme: {
    id: 'prisme',
    nom: 'prisme droit à base triangulaire',
    faces: 5,
    aretes: 9,
    sommets: 6,
    natureFaces: '2 triangles et 3 rectangles',
    emoji: '⛺',
  },
  cylindre: {
    id: 'cylindre',
    nom: 'cylindre',
    faces: 3,
    aretes: 2,
    sommets: 0,
    natureFaces: '2 disques et une surface courbe',
    emoji: '🥫',
  },
};

export const SOLIDES_LIST = Object.values(SOLIDES);

/**
 * Relation d'Euler : pour tout POLYÈDRE, F + S − A = 2.
 * Le cylindre n'en est pas un (il a une face courbe) : la relation ne s'y
 * applique pas, et `isPolyhedron` le dit explicitement plutôt que de laisser
 * croire à une erreur.
 */
export function isPolyhedron(solide) {
  return solide.sommets > 0 && solide.aretes > 0;
}

export function eulerCheck(solide) {
  if (!isPolyhedron(solide)) return null;
  return solide.faces + solide.sommets - solide.aretes;
}

/* ── Patrons du cube ─────────────────────────────────────────────────── */

/** Un patron : une grille de booléens, lignes × colonnes. */
export function gridOf(rows, cols, cells) {
  return { rows, cols, cells };
}

/** Les cases cochées, sous forme de coordonnées [ligne, colonne]. */
export function filledCells(grid) {
  const out = [];
  for (let r = 0; r < grid.rows; r += 1) {
    for (let c = 0; c < grid.cols; c += 1) {
      if (grid.cells[r]?.[c]) out.push([r, c]);
    }
  }
  return out;
}

/** Les six faces d'un cube, et ce qu'elles deviennent quand on roule. */
const OPPOSITE = { haut: 'bas', bas: 'haut', nord: 'sud', sud: 'nord', est: 'ouest', ouest: 'est' };

/**
 * Roule le cube d'une case dans une direction, et renvoie la nouvelle
 * orientation. `orient.bas` est la face posée sur la grille — c'est elle
 * qu'on « imprime » sur la case courante.
 */
function roll(orient, dir) {
  const { haut, bas, nord, sud, est, ouest } = orient;
  switch (dir) {
    case 'droite': return { haut: ouest, bas: est, nord, sud, est: haut, ouest: bas };
    case 'gauche': return { haut: est, bas: ouest, nord, sud, est: bas, ouest: haut };
    case 'bas':    return { haut: nord, bas: sud, nord: bas, sud: haut, est, ouest };
    case 'haut':   return { haut: sud, bas: nord, nord: haut, sud: bas, est, ouest };
    default: return orient;
  }
}

/**
 * Ce patron se replie-t-il en cube ?
 *
 * On simule le pliage : on part d'une case, on « roule » un cube virtuel de
 * proche en proche, et l'on note quelle face du cube atterrit sur chaque
 * case. Le patron est valide si et seulement si :
 *   - toutes les cases sont connexes (une seule pièce) ;
 *   - il y a exactement 6 cases ;
 *   - les 6 faces du cube sont utilisées EXACTEMENT une fois chacune.
 *
 * Deux cases qui réclameraient la même face du cube ⇒ elles se
 * superposeraient au pliage : c'est précisément ce qui rend un patron
 * impossible, et la raison est renvoyée telle quelle.
 */
export function foldsIntoCube(grid) {
  const cells = filledCells(grid);
  if (cells.length !== 6) {
    return { ok: false, reason: cells.length < 6 ? 'pas-assez' : 'trop', used: {} };
  }

  const key = (r, c) => `${r},${c}`;
  const set = new Set(cells.map(([r, c]) => key(r, c)));
  const start = cells[0];
  const orient0 = { haut: 'H', bas: 'B', nord: 'N', sud: 'S', est: 'E', ouest: 'O' };

  const used = {};                    // face du cube -> case qui l'occupe
  const seen = new Set();
  const stack = [[start, orient0]];
  let conflit = null;

  while (stack.length) {
    const [[r, c], orient] = stack.pop();
    if (seen.has(key(r, c))) continue;
    seen.add(key(r, c));

    const face = orient.bas;
    if (used[face]) { conflit = { face, cases: [used[face], [r, c]] }; }
    else used[face] = [r, c];

    const voisins = [
      [[r, c + 1], 'droite'],
      [[r, c - 1], 'gauche'],
      [[r + 1, c], 'bas'],
      [[r - 1, c], 'haut'],
    ];
    for (const [[nr, nc], dir] of voisins) {
      if (set.has(key(nr, nc)) && !seen.has(key(nr, nc))) {
        stack.push([[nr, nc], roll(orient, dir)]);
      }
    }
  }

  if (seen.size !== 6) return { ok: false, reason: 'non-connexe', used };
  if (conflit) return { ok: false, reason: 'superposition', conflit, used };
  if (Object.keys(used).length !== 6) return { ok: false, reason: 'superposition', used };
  return { ok: true, reason: null, used };
}

/** Explication française du refus — jamais un « faux » sec. */
export function patronHint(result) {
  switch (result.reason) {
    case 'pas-assez':
      return 'Un cube a 6 faces : il manque des cases.';
    case 'trop':
      return 'Un cube a exactement 6 faces : il y a trop de cases.';
    case 'non-connexe':
      return 'Les cases doivent se toucher par un côté : ce patron est en plusieurs morceaux.';
    case 'superposition':
      return 'En pliant, deux cases tombent sur la même face du cube — et une face resterait à découvert.';
    default:
      return 'Ce patron se replie bien en cube.';
  }
}

/* ── Patrons de référence ────────────────────────────────────────────── */

/** Construit une grille à partir d'un dessin en texte (# = case pleine). */
export function gridFromArt(lines) {
  const rows = lines.length;
  const cols = Math.max(...lines.map((l) => l.length));
  const cells = lines.map((l) =>
    Array.from({ length: cols }, (_, c) => l[c] === '#')
  );
  return gridOf(rows, cols, cells);
}

/** Le patron « en croix », le plus classique — valide. */
export const PATRON_CROIX = gridFromArt([
  '.#..',
  '####',
  '.#..',
]);

/** Un patron « en escalier » — valide lui aussi, moins attendu. */
export const PATRON_ESCALIER = gridFromArt([
  '##..',
  '.##.',
  '..##',
]);

/** Le piège classique : 6 cases, mais deux se superposent au pliage. */
export const PATRON_IMPOSSIBLE = gridFromArt([
  '.##.',
  '.##.',
  '.##.',
]);

/** Un autre impossible : la bande de 6 cases alignées. */
export const PATRON_BANDE = gridFromArt([
  '######',
]);
