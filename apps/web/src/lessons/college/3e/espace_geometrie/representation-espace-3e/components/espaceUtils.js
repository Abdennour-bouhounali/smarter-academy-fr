/**
 * Modèle de la leçon « Représentation de l'espace » (3e).
 *
 * ─── CE QUE CETTE LEÇON AJOUTE À CELLE DE 6e ───────────────────────────
 * En 6e (`solides-patrons`), les solides sont des DESSINS : les sommets sont
 * écrits en dur dans le composant, on ne peut ni tourner l'objet, ni savoir
 * quelle arête est cachée. Ici, tout part de `common/utils/geometry3d.js` :
 * un solide est un modèle 3D, la visibilité des arêtes est CALCULÉE, et
 * tourner l'objet change réellement ce qu'on voit.
 *
 * ─── L'IDÉE CENTRALE ───────────────────────────────────────────────────
 * Un dessin plat n'est pas l'objet. Ce qui est caché ou visible dépend du
 * POINT DE VUE, et deux dessins très différents peuvent représenter le même
 * solide. C'est pourquoi le module signature laisse l'élève tourner le solide
 * et regarder une arête pointillée devenir pleine.
 *
 * ─── CONVENTIONS ───────────────────────────────────────────────────────
 * Les angles de rotation sont en degrés (`yaw` autour de la verticale,
 * `pitch` autour de l'horizontale), conformément à geometry3d.js. Les
 * projections renvoient déjà un y d'écran : aucune leçon ne retourne l'axe
 * elle-même.
 */
import {
  SOLIDS, SOLIDS_LIST, rotateSolid, projectCavaliere, projectOrtho,
  visibleEdges, visibleVertices, countsOf, eulerCheck, relativePosition,
  pointOnPlane, vertexName, edgeName, v3,
} from '../../../../../common/utils/geometry3d';

export {
  SOLIDS, SOLIDS_LIST, rotateSolid, projectCavaliere, projectOrtho,
  visibleEdges, visibleVertices, countsOf, eulerCheck, relativePosition,
  pointOnPlane, vertexName, edgeName, v3,
};

/* ── Les solides courbes : dessinés, jamais tournés ───────────────────── */

/**
 * Cylindre, cône et boule n'ont pas de modèle en sommets/arêtes/faces : ce
 * sont des silhouettes. On les décrit par leurs COMPTES et leur nature, et le
 * composant les dessine à part. Les afficher dans le rotateur donnerait
 * l'illusion qu'on peut compter leurs arêtes comme celles d'un polyèdre.
 */
export const SOLIDES_COURBES = {
  cylindre: {
    id: 'cylindre', nom: 'cylindre', emoji: '🥫',
    faces: 3, aretes: 2, sommets: 0,
    natureFaces: '2 disques et une surface courbe',
    polyedre: false,
  },
  cone: {
    id: 'cone', nom: 'cône', emoji: '🍦',
    faces: 2, aretes: 1, sommets: 1,
    natureFaces: '1 disque et une surface courbe',
    polyedre: false,
  },
  boule: {
    id: 'boule', nom: 'boule', emoji: '⚽',
    faces: 1, aretes: 0, sommets: 0,
    natureFaces: 'une seule surface courbe',
    polyedre: false,
  },
};

/** Tous les solides de la leçon, polyèdres et courbes. */
export function allSolids() {
  return [
    ...SOLIDS_LIST.map((s) => ({ ...s, polyedre: true })),
    ...Object.values(SOLIDES_COURBES),
  ];
}

/* ── Vues et points de vue ────────────────────────────────────────────── */

export const VUES = [
  { id: 'face', label: 'de face', desc: 'on regarde le solide droit devant' },
  { id: 'dessus', label: 'de dessus', desc: 'on regarde le solide d’en haut' },
  { id: 'cote', label: 'de côté', desc: 'on regarde le solide par la droite' },
];

/**
 * Les dimensions apparentes d'un solide dans une vue donnée : c'est ce que
 * l'élève doit reconnaître pour associer une vue à un objet.
 */
export function viewExtent(solid, view) {
  const pts = solid.vertices.map((p) => projectOrtho(p, view));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    largeur: Math.round(Math.max(...xs) - Math.min(...xs)),
    hauteur: Math.round(Math.max(...ys) - Math.min(...ys)),
  };
}

/** Les orientations proposées dans le module « tourner pour vérifier ». */
export const ORIENTATIONS = [
  { id: 'o0', yaw: 0, pitch: 0, label: 'de face' },
  { id: 'o1', yaw: 30, pitch: 20, label: 'trois quarts' },
  { id: 'o2', yaw: -35, pitch: 15, label: 'trois quarts gauche' },
  { id: 'o3', yaw: 90, pitch: 0, label: 'de profil' },
];

/**
 * Combien d'arêtes sont cachées dans cette orientation ? Calculé, jamais
 * annoncé : c'est ce qui permet à l'élève de vérifier sa prédiction.
 */
export function hiddenCount(solid, { yaw, pitch }) {
  return visibleEdges(rotateSolid(solid, { yaw, pitch })).hidden.length;
}

/* ── Positions relatives dans le cube ─────────────────────────────────── */

/**
 * Les couples d'arêtes du cube proposés au module 7. Chaque réponse est
 * CALCULÉE par `relativePosition` — aucun libellé n'est écrit à la main, de
 * sorte qu'une erreur d'énoncé est impossible.
 *
 * Indices du cube : A=0 B=1 C=2 D=3 (face avant), E=4 F=5 G=6 H=7 (arrière).
 */
export const PAIRES_CUBE = [
  { id: 'p1', a: [0, 1], b: [3, 2], question: '(AB) et (DC)' },
  { id: 'p2', a: [0, 1], b: [1, 2], question: '(AB) et (BC)' },
  { id: 'p3', a: [0, 1], b: [2, 6], question: '(AB) et (CG)' },
  { id: 'p4', a: [0, 4], b: [1, 5], question: '(AE) et (BF)' },
  { id: 'p5', a: [0, 1], b: [7, 4], question: '(AB) et (HE)' },
];

/** La position relative d'un couple, calculée sur le modèle du cube. */
export function positionOf(pair, solid = SOLIDS.cube) {
  const P = (i) => solid.vertices[i];
  return relativePosition(P(pair.a[0]), P(pair.a[1]), P(pair.b[0]), P(pair.b[1]));
}

export const POSITION_LABEL = {
  paralleles: 'parallèles',
  secantes: 'sécantes',
  'non-coplanaires': 'ni parallèles ni sécantes (non coplanaires)',
  confondues: 'confondues',
};

/* ── Perspective cavalière : les paramètres réglables ─────────────────── */

export const CAVALIERE_DEFAUT = { angle: 45, k: 0.5 };
export const CAVALIERE_ANGLES = [30, 45, 60];
export const CAVALIERE_K = [0.3, 0.5, 0.7];
