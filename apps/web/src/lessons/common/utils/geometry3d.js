/**
 * geometry3d — représentation de l'espace : modèles de solides et projections.
 *
 * ─── POURQUOI CE MODULE EXISTE ─────────────────────────────────────────
 *
 * `solides-patrons` (6e) dessine ses solides avec des sommets écrits en dur
 * dans le composant : un cube y est un assemblage de traits, pas un objet.
 * On ne peut donc ni le tourner, ni savoir quelle arête est cachée. Or c'est
 * précisément ce que la leçon de 3e doit faire découvrir : un dessin plat
 * n'est PAS l'objet, et ce qu'on voit dépend du point de vue.
 *
 * Ici, un solide est un vrai modèle 3D — sommets, arêtes, faces — et tout le
 * reste est CALCULÉ :
 *   - les comptes F/A/S viennent du modèle (jamais du dessin) ;
 *   - la visibilité d'une arête est déduite des normales de ses faces ;
 *   - une rotation transforme les sommets, pas le tracé.
 * Un composant ne peut donc pas afficher « 12 arêtes » sur un solide qui n'en
 * a que 9, ni dessiner en trait plein une arête qui est derrière.
 *
 * ─── CONVENTIONS (à lire avant tout usage) ─────────────────────────────
 *
 * 1. REPÈRE MONDE (main droite, orienté « école ») : x vers la DROITE,
 *    y vers le HAUT, z vers l'OBSERVATEUR. C'est l'inverse du y de SVG : les
 *    projections ci-dessous font la conversion (elles renvoient un y déjà
 *    orienté écran), et elles sont le SEUL endroit où ce retournement a lieu.
 *
 * 2. ANGLES en DEGRÉS. `yaw` tourne autour de l'axe vertical y (le geste
 *    « faire pivoter l'objet sur la table »), `pitch` autour de l'axe
 *    horizontal x (le geste « le pencher vers soi »). Les deux dans le sens
 *    direct vu depuis l'axe positif.
 *
 * 3. FACES ORIENTÉES : les sommets de chaque face sont listés dans le sens
 *    anti-horaire VU DE L'EXTÉRIEUR du solide. C'est cette convention qui
 *    donne une normale sortante, donc un test de visibilité correct. Une face
 *    listée à l'envers rendrait le solide « retourné » — les tests le
 *    vérifient sur les quatre solides.
 *
 * 4. SOLIDES CONVEXES uniquement. Le test de visibilité par face arrière
 *    (« back-face culling ») n'est exact que pour un convexe ; tous les
 *    solides du programme de collège le sont.
 */

/* ── Vecteurs 3D ──────────────────────────────────────────────────────── */

export function v3(x, y, z) {
  return { x, y, z };
}

export function sub3(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function add3(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function scale3(v, k) {
  return { x: v.x * k, y: v.y * k, z: v.z * k };
}

export function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function norm3(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function dist3(a, b) {
  return norm3(sub3(a, b));
}

export function normalize3(v, eps = 1e-9) {
  const n = norm3(v);
  if (n < eps) return { x: 0, y: 0, z: 0 };
  return { x: v.x / n, y: v.y / n, z: v.z / n };
}

export function centroid3(pts) {
  const n = pts.length || 1;
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / n,
    y: pts.reduce((s, p) => s + p.y, 0) / n,
    z: pts.reduce((s, p) => s + p.z, 0) / n,
  };
}

/* ── Rotations ────────────────────────────────────────────────────────── */

const rad = (deg) => (deg * Math.PI) / 180;

/** Rotation autour de l'axe vertical y — « faire pivoter sur la table ». */
export function rotateY(p, deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

/** Rotation autour de l'axe horizontal x — « pencher vers soi ». */
export function rotateX(p, deg) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

/**
 * Tourne un solide entier. L'ordre est fixé (yaw PUIS pitch) et documenté :
 * deux rotations ne commutent pas, et l'inverser ferait « glisser » le solide
 * de façon déroutante quand l'élève actionne les deux réglages.
 */
export function rotateSolid(solid, { yaw = 0, pitch = 0 } = {}) {
  return {
    ...solid,
    vertices: solid.vertices.map((p) => rotateX(rotateY(p, yaw), pitch)),
  };
}

/* ── Projections : du monde 3D vers le plan du dessin ─────────────────── */

/**
 * Perspective cavalière — la représentation du collège.
 *
 * La face avant est dessinée en VRAIE GRANDEUR ; la profondeur part en
 * fuyante, d'un angle `angle` et réduite d'un coefficient `k`. Les valeurs
 * usuelles (45°, k = 0,5) sont celles de l'enseignement, et sont nommées ici
 * une fois pour toutes plutôt que recopiées dans chaque composant.
 *
 * Renvoie un point d'écran : y est DÉJÀ retourné (vers le bas).
 */
export const CAVALIERE = { angle: 45, k: 0.5 };

export function projectCavaliere(p, { angle = CAVALIERE.angle, k = CAVALIERE.k } = {}) {
  const a = rad(angle);
  return {
    x: p.x + k * p.z * Math.cos(a),
    y: -(p.y + k * p.z * Math.sin(a)),
  };
}

/**
 * Projection orthogonale — les trois vues du dessin technique.
 *
 * 'face'   : on regarde depuis +z (on voit x et y)
 * 'dessus' : on regarde depuis +y (on voit x et z)
 * 'cote'   : on regarde depuis +x (on voit z et y)
 *
 * Toujours un y d'écran (vers le bas).
 */
export function projectOrtho(p, view = 'face') {
  switch (view) {
    case 'face':
      return { x: p.x, y: -p.y };
    case 'dessus':
      return { x: p.x, y: -p.z };
    case 'cote':
      return { x: p.z, y: -p.y };
    default:
      throw new Error(`projectOrtho: vue inconnue « ${view} » (attendu : face, dessus, cote).`);
  }
}

/* ── Visibilité ───────────────────────────────────────────────────────── */

/**
 * Normale sortante d'une face, déduite de l'ordre de ses sommets
 * (anti-horaire vu de l'extérieur ⇒ la normale pointe vers l'extérieur).
 */
export function faceNormal(solid, face) {
  const [i, j, k] = face;
  const a = solid.vertices[i];
  const b = solid.vertices[j];
  const c = solid.vertices[k];
  return normalize3(cross3(sub3(b, a), sub3(c, a)));
}

/**
 * La face est-elle tournée vers l'observateur ?
 *
 * L'observateur regarde depuis `eye` (direction du regard, par défaut +z, le
 * regard de la perspective cavalière). Une face est visible quand sa normale
 * sortante pointe vers lui.
 */
export function isFaceVisible(solid, face, eye = v3(0, 0, 1)) {
  return dot3(faceNormal(solid, face), eye) > 1e-9;
}

/** Clé canonique d'une arête, indépendante du sens de parcours. */
function edgeKey(i, j) {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

/**
 * Sépare les arêtes visibles des arêtes cachées.
 *
 * RÈGLE (celle du dessin technique, et l'invariant testé) : une arête est
 * cachée exactement quand TOUTES les faces qui la portent sont tournées de
 * l'autre côté. Il suffit qu'une seule face soit visible pour que l'arête se
 * voie — c'est le contour du solide.
 *
 * C'est ce calcul qui permet à l'élève de tourner le solide et de VOIR une
 * arête pointillée devenir pleine : rien n'est écrit à l'avance.
 */
export function visibleEdges(solid, eye = v3(0, 0, 1)) {
  const visibleFaces = solid.faces.filter((f) => isFaceVisible(solid, f, eye));
  const seen = new Set();
  for (const f of visibleFaces) {
    for (let n = 0; n < f.length; n += 1) {
      seen.add(edgeKey(f[n], f[(n + 1) % f.length]));
    }
  }
  const visible = [];
  const hidden = [];
  for (const [i, j] of solid.edges) {
    (seen.has(edgeKey(i, j)) ? visible : hidden).push([i, j]);
  }
  return { visible, hidden };
}

/**
 * Un sommet est visible si au moins une face visible le porte — sinon il est
 * derrière le solide (le sommet caché du cube, celui qu'on oublie de compter).
 */
export function visibleVertices(solid, eye = v3(0, 0, 1)) {
  const seen = new Set();
  for (const f of solid.faces) {
    if (isFaceVisible(solid, f, eye)) f.forEach((i) => seen.add(i));
  }
  return seen;
}

/* ── Comptes ──────────────────────────────────────────────────────────── */

/**
 * Faces / arêtes / sommets, LUS SUR LE MODÈLE.
 *
 * Aucun composant n'a le droit d'écrire ces nombres à la main : c'est ce qui
 * garantit qu'un dessin ne peut pas mentir sur ce qu'il représente.
 */
export function countsOf(solid) {
  return {
    faces: solid.faces.length,
    aretes: solid.edges.length,
    sommets: solid.vertices.length,
  };
}

/** Relation d'Euler pour un polyèdre convexe : F + S − A = 2. */
export function eulerCheck(solid) {
  const { faces, aretes, sommets } = countsOf(solid);
  return faces + sommets - aretes;
}

/* ── Positions relatives dans l'espace ────────────────────────────────── */

/**
 * Position relative de deux droites de l'espace, définies chacune par deux
 * points : « parallèles », « sécantes » ou « non coplanaires ».
 *
 * Le troisième cas est celui qui n'existe pas dans le plan, et c'est tout
 * l'enjeu de la géométrie dans l'espace : deux droites peuvent ne pas être
 * parallèles ET ne jamais se couper. Deux arêtes d'un cube en donnent
 * l'exemple immédiat.
 */
export function relativePosition(a1, a2, b1, b2, eps = 1e-6) {
  const u = sub3(a2, a1);
  const v = sub3(b2, b1);
  const n = cross3(u, v);
  if (norm3(n) < eps) {
    // Directions colinéaires : parallèles (ou confondues).
    const w = sub3(b1, a1);
    if (norm3(cross3(u, w)) < eps) return 'confondues';
    return 'paralleles';
  }
  // Coplanaires ⟺ le volume du parallélépipède (u, v, b1−a1) est nul.
  const w = sub3(b1, a1);
  return Math.abs(dot3(w, n)) < eps ? 'secantes' : 'non-coplanaires';
}

/** Le point q appartient-il au plan défini par trois points ? */
export function pointOnPlane(p1, p2, p3, q, eps = 1e-6) {
  const n = cross3(sub3(p2, p1), sub3(p3, p1));
  return Math.abs(dot3(sub3(q, p1), n)) < eps * Math.max(1, norm3(n));
}

/* ── Les solides au programme ─────────────────────────────────────────
 *
 * Sommets nommés dans l'ordre scolaire : la face avant ABCD (sens
 * anti-horaire vue de face), puis la face arrière EFGH, E étant derrière A.
 * Cet ordre est celui des énoncés de brevet ; le respecter permet de poser
 * une question sur « l'arête [AE] » sans traduction.
 */

const cubeAt = (w, h, d) => {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  return {
    // Face avant (z = +z) : A bas-gauche, B bas-droit, C haut-droit, D haut-gauche
    vertices: [
      v3(-x, -y, z), v3(x, -y, z), v3(x, y, z), v3(-x, y, z),
      v3(-x, -y, -z), v3(x, -y, -z), v3(x, y, -z), v3(-x, y, -z),
    ],
    names: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ],
    // Chaque face en sens anti-horaire VUE DE L'EXTÉRIEUR.
    faces: [
      [0, 1, 2, 3], // avant
      [5, 4, 7, 6], // arrière
      [1, 5, 6, 2], // droite
      [4, 0, 3, 7], // gauche
      [3, 2, 6, 7], // dessus
      [4, 5, 1, 0], // dessous
    ],
  };
};

export const SOLIDS = {
  cube: {
    id: 'cube',
    nom: 'cube',
    emoji: '🧊',
    natureFaces: '6 carrés identiques',
    ...cubeAt(100, 100, 100),
  },
  pave: {
    id: 'pave',
    nom: 'pavé droit',
    emoji: '📦',
    natureFaces: '6 rectangles, opposés deux à deux identiques',
    ...cubeAt(140, 80, 90),
  },
  prisme: {
    id: 'prisme',
    nom: 'prisme droit à base triangulaire',
    emoji: '⛺',
    natureFaces: '2 triangles et 3 rectangles',
    vertices: [
      v3(-55, -45, 45), v3(55, -45, 45), v3(0, 50, 45),
      v3(-55, -45, -45), v3(55, -45, -45), v3(0, 50, -45),
    ],
    names: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [
      [0, 1], [1, 2], [2, 0],
      [3, 4], [4, 5], [5, 3],
      [0, 3], [1, 4], [2, 5],
    ],
    faces: [
      [0, 1, 2], // base avant
      [4, 3, 5], // base arrière
      [0, 3, 4, 1], // dessous
      [1, 4, 5, 2], // flanc droit
      [2, 5, 3, 0], // flanc gauche
    ],
  },
  pyramide: {
    id: 'pyramide',
    nom: 'pyramide à base carrée',
    emoji: '🔺',
    natureFaces: '1 carré et 4 triangles',
    vertices: [
      v3(-55, -50, 55), v3(55, -50, 55), v3(55, -50, -55), v3(-55, -50, -55),
      v3(0, 70, 0),
    ],
    names: ['A', 'B', 'C', 'D', 'S'],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4],
    ],
    faces: [
      [3, 2, 1, 0], // base, vue de dessous
      [0, 1, 4],
      [1, 2, 4],
      [2, 3, 4],
      [3, 0, 4],
    ],
  },
};

/* ── Solides PARAMÉTRIQUES — pyramide, prisme, cône (4e) ──────────────── */

/**
 * POURQUOI DES CONSTRUCTEURS, ET PAS SEULEMENT DES SOLIDES FIGÉS.
 *
 * `SOLIDS` porte des solides d'illustration, aux dimensions fixes : ils
 * servent à MONTRER (les vues, les arêtes cachées, Euler). Le programme de
 * 4e demande autre chose — reconnaître la base et la hauteur, et découvrir
 * que le volume d'une pyramide vaut le TIERS de celui du prisme de même base
 * et de même hauteur. Cela exige que l'élève CHANGE ces deux grandeurs et
 * voie la conséquence : il faut donc des solides construits à la demande, et
 * un prisme et une pyramide qui partagent exactement la même base.
 *
 * Ces fonctions sont ADDITIVES : `SOLIDS`, `SOLIDS_LIST` et tous leurs
 * consommateurs existants sont inchangés. Les solides produits respectent
 * les mêmes invariants que ceux du catalogue (normales sortantes, F + S − A
 * = 2, chaque arête portée par deux faces) — c'est vérifié par les tests.
 */

/**
 * Pyramide à base carrée, DROITE : le sommet est à la verticale du centre de
 * la base. `cote` est le côté de la base, `hauteur` la hauteur — la vraie,
 * celle qui est perpendiculaire à la base, pas l'arête latérale.
 *
 * La base est posée à y = −hauteur/2 et le sommet à y = +hauteur/2 : le
 * solide reste centré, donc une rotation le fait tourner sur lui-même au
 * lieu de le faire fuir hors du cadre.
 */
export function makePyramide(cote = 110, hauteur = 120, { nom, emoji } = {}) {
  const c = cote / 2;
  const y0 = -hauteur / 2;
  const y1 = hauteur / 2;
  return {
    id: 'pyramide-param',
    nom: nom ?? 'pyramide à base carrée',
    emoji: emoji ?? '🔺',
    natureFaces: '1 carré et 4 triangles',
    cote,
    hauteur,
    aireBase: cote * cote,
    vertices: [
      v3(-c, y0, c), v3(c, y0, c), v3(c, y0, -c), v3(-c, y0, -c),
      v3(0, y1, 0),
    ],
    names: ['A', 'B', 'C', 'D', 'S'],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4],
    ],
    faces: [
      [3, 2, 1, 0], // base, vue de dessous
      [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4],
    ],
  };
}

/**
 * Prisme droit à base CARRÉE — le récipient de référence de la découverte du
 * tiers. Même base et même hauteur qu'une `makePyramide(cote, hauteur)` : ce
 * sont les deux solides qu'on compare, et c'est le seul cas où la comparaison
 * a un sens.
 */
export function makePrismeCarre(cote = 110, hauteur = 120, { nom, emoji } = {}) {
  const c = cote / 2;
  const y0 = -hauteur / 2;
  const y1 = hauteur / 2;
  return {
    id: 'prisme-carre-param',
    nom: nom ?? 'prisme droit à base carrée',
    emoji: emoji ?? '📦',
    natureFaces: '2 carrés et 4 rectangles',
    cote,
    hauteur,
    aireBase: cote * cote,
    vertices: [
      v3(-c, y0, c), v3(c, y0, c), v3(c, y1, c), v3(-c, y1, c),
      v3(-c, y0, -c), v3(c, y0, -c), v3(c, y1, -c), v3(-c, y1, -c),
    ],
    names: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ],
    faces: [
      [0, 1, 2, 3], // avant
      [5, 4, 7, 6], // arrière
      [1, 5, 6, 2], // droite
      [4, 0, 3, 7], // gauche
      [3, 2, 6, 7], // dessus
      [4, 5, 1, 0], // dessous
    ],
  };
}

/**
 * LE CÔNE N'EST PAS UN POLYÈDRE — il n'a ni sommets ni arêtes au sens de ce
 * module, et lui en inventer mentirait (même raison qui a écarté le cylindre
 * de `SOLIDS` : voir `representations-espace-5e/components/espace5e.js`).
 * Il est donc décrit par ses GRANDEURS, et dessiné comme une révolution.
 *
 * `apex` et `centreBase` sont donnés pour que la hauteur soit traçable : ce
 * segment-là est ce que l'élève doit reconnaître, et il est perpendiculaire
 * au plan de base par construction.
 */
export function makeCone(rayon = 55, hauteur = 120, { nom, emoji } = {}) {
  return {
    id: 'cone-param',
    nom: nom ?? 'cône de révolution',
    emoji: emoji ?? '🍦',
    estPolyedre: false,
    natureFaces: 'un disque et une surface courbe',
    rayon,
    hauteur,
    aireBase: Math.PI * rayon * rayon,
    centreBase: v3(0, -hauteur / 2, 0),
    apex: v3(0, hauteur / 2, 0),
  };
}

/** Cylindre de révolution — le récipient de comparaison du cône. */
export function makeCylindre(rayon = 55, hauteur = 120, { nom, emoji } = {}) {
  return {
    id: 'cylindre-param',
    nom: nom ?? 'cylindre de révolution',
    emoji: emoji ?? '🥫',
    estPolyedre: false,
    natureFaces: 'deux disques et une surface courbe',
    rayon,
    hauteur,
    aireBase: Math.PI * rayon * rayon,
    centreBase: v3(0, -hauteur / 2, 0),
    centreHaut: v3(0, hauteur / 2, 0),
  };
}

export const SOLIDS_LIST = Object.values(SOLIDS);

/** Nom du sommet d'indice i (A, B, C…), tel qu'écrit dans les énoncés. */
export function vertexName(solid, i) {
  return solid.names?.[i] ?? String(i);
}

/** Nom d'une arête, dans la notation française : [AB]. */
export function edgeName(solid, [i, j]) {
  return `[${vertexName(solid, i)}${vertexName(solid, j)}]`;
}
