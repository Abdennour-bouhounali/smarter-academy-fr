/**
 * Le modèle mathématique de « L'espace : vecteurs et coordonnées » (1ère spé).
 *
 * ─── CE QUE CE FICHIER NE FAIT PAS ─────────────────────────────────────
 * Il NE RECRÉE PAS l'algèbre 3D : `dot3`, `norm3`, `cross3`, `sub3`,
 * `rotateSolid`, `projectCavaliere`, `visibleEdges`, `relativePosition` et
 * `vertexName` viennent tous de `common/utils/geometry3d.js`. Ce fichier les
 * SPÉCIALISE pour la leçon : il pose le cube d'arête 2, le repère qu'il
 * porte, et il dérive tout ce que les modules affichent.
 *
 * ─── POURQUOI UN CUBE D'ARÊTE 2, ET NON LE CUBE DE `SOLIDS` ────────────
 * `SOLIDS.cube` mesure 100 unités de côté et est CENTRÉ sur l'origine : ses
 * sommets valent (±50 ; ±50 ; ±50). C'est parfait pour un dessin, et
 * inutilisable pour une leçon de coordonnées — l'élève lirait AB = (100 ; 0 ; 0)
 * et une norme de 173,2.
 *
 * Ici le cube a pour arête 2 et son sommet A est à l'ORIGINE : le repère de la
 * leçon est (A ; AB, AD, AE), donc chaque sommet a des coordonnées dans
 * {0 ; 2}³ et chaque vecteur d'arête ou de diagonale a des coordonnées
 * ENTIÈRES. Conséquences vérifiées par les tests :
 *   - tout produit scalaire est un entier EXACT (jamais un 1e-16) ;
 *   - les normes remarquables sont 2, 2√2 et 2√3 — lisibles, et différentes
 *     entre elles, donc discriminantes dans un QCM ;
 *   - le milieu d'une arête a des coordonnées entières lui aussi (1), ce qui
 *     autorise des vecteurs « à mi-arête » sans introduire de décimales.
 *
 * ─── LE PIÈGE DE LA PERSPECTIVE, ET SA PARADE ──────────────────────────
 * En projection cavalière, deux arêtes qui ne se rencontrent PAS peuvent se
 * croiser sur le dessin : (AB) et (CG) se coupent visuellement dans la vue de
 * face, alors qu'elles ne sont pas coplanaires. C'est la conception erronée
 * centrale de la géométrie dans l'espace.
 *
 * La leçon ne demande donc JAMAIS une position relative sans avoir d'abord
 * donné la rotation à l'élève. Et `orientationsQuiLevent` prouve, par
 * balayage, qu'il existe bien une orientation où le croisement apparent se
 * défait — sans quoi la consigne « tourne pour t'en assurer » serait un
 * mensonge. Un test verrouille cette existence pour chaque couple proposé.
 */
import {
  v3, sub3, add3, scale3, dot3, cross3, norm3, dist3, normalize3,
  rotateSolid, projectCavaliere, visibleEdges, visibleVertices,
  relativePosition, vertexName,
} from '../../../../../common/utils/geometry3d';

export {
  v3, sub3, add3, scale3, dot3, cross3, norm3, dist3, normalize3,
  rotateSolid, projectCavaliere, visibleEdges, visibleVertices,
  relativePosition, vertexName,
};

/* ── Écriture française ───────────────────────────────────────────────── */

/**
 * ZÉRO EST UN ZÉRO — la normalisation qui empêche « −0 » d'exister.
 *
 * Le modèle nie le z (le repère de la leçon compte vers le FOND, geometry3d
 * compte vers l'OBSERVATEUR), et `-0 / 2` vaut `-0` en JavaScript. Ce `−0` est
 * invisible à l'écran mais pas au code : `Object.is(-0, 0)` est faux, si bien
 * qu'un `toBe(0)`, un `expect(…).toEqual([1, 1, 0])` ou une comparaison
 * d'option de QCM échouent sans que rien ne paraisse anormal. Trois tests l'ont
 * attrapé ici, sur `coordsDansRepere`, `decomposition` et `aimanter`.
 *
 * On le normalise DONC À LA SOURCE, et non à l'affichage : un module qui
 * compare une réponse d'élève au troisième compte d'un trajet doit trouver 0,
 * pas quelque chose qui lui ressemble.
 */
export const zero = (n) => (n === 0 ? 0 : n);

/** Un nombre à la française : virgule, vrai signe moins, jamais « −0 ». */
export function fr(n, maxDecimals = 2) {
  if (!Number.isFinite(n)) return '?';
  let r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  if (Object.is(r, -0) || r === 0) r = 0;
  return String(r).replace('.', ',').replace('-', '−');
}

/** Les coordonnées d'un vecteur ou d'un point de l'espace : (2 ; 0 ; −2). */
export const frVec3 = (v) => `(${fr(v.x)} ; ${fr(v.y)} ; ${fr(v.z)})`;

/**
 * Lecture d'une réponse numérique SIGNÉE.
 *
 * `parseDec` de @smarter-academy/core refuse le vrai signe moins « − »
 * (U+2212), celui que la leçon écrit partout, et `parseFr` refuse en plus les
 * décimaux. Une leçon dont les produits scalaires sont souvent négatifs a donc
 * besoin de sa propre lecture, sans quoi « −4 » ne validerait jamais.
 */
export function parseSigned(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const s = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

/* ── Le cube de la leçon ──────────────────────────────────────────────── */

/** L'arête du cube. Entière et paire : les milieux d'arête restent entiers. */
export const ARETE = 2;

/**
 * Le cube ABCDEFGH, sommet A à l'ORIGINE du repère de la leçon.
 *
 * L'ordre des sommets est celui des énoncés français, et le MÊME que celui de
 * `geometry3d` : face avant ABCD dans le sens direct vue de face, puis face
 * arrière EFGH avec E derrière A.
 *
 *   A(0;0;0)  B(2;0;0)  C(2;2;0)  D(0;2;0)      — la face avant
 *   E(0;0;−2) F(2;0;−2) G(2;2;−2) H(0;2;−2)     — la face arrière
 *
 * Le z NÉGATIF vers l'arrière n'est pas un caprice : dans geometry3d, z pointe
 * vers l'observateur (§ CONVENTIONS). Prendre z positif vers l'arrière
 * retournerait le solide et rendrait `visibleEdges` faux — les arêtes cachées
 * seraient dessinées en trait plein.
 *
 * Le repère de la leçon est donc (A ; AB, AD, AE) où AE = (0 ; 0 ; −2) : c'est
 * un repère du cube, et `coordsDansRepere` en fait la traduction quand un
 * module veut parler en « unités d'arête » plutôt qu'en unités de dessin.
 */
const c = ARETE;
export const CUBE = Object.freeze({
  id: 'cube-lecon',
  nom: 'cube',
  emoji: '🧊',
  arete: c,
  vertices: [
    v3(0, 0, 0), v3(c, 0, 0), v3(c, c, 0), v3(0, c, 0),
    v3(0, 0, -c), v3(c, 0, -c), v3(c, c, -c), v3(0, c, -c),
  ],
  names: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ],
  // Chaque face en sens anti-horaire VUE DE L'EXTÉRIEUR (convention
  // geometry3d § 3) : c'est elle qui donne une normale sortante, donc un test
  // de visibilité correct.
  faces: [
    [0, 1, 2, 3], // avant  (z = 0)
    [5, 4, 7, 6], // arrière (z = −2)
    [1, 5, 6, 2], // droite
    [4, 0, 3, 7], // gauche
    [3, 2, 6, 7], // dessus
    [4, 5, 1, 0], // dessous
  ],
});

/** Indice d'un sommet à partir de son nom : IDX.G vaut 6. */
export const IDX = Object.freeze(
  Object.fromEntries(CUBE.names.map((n, i) => [n, i]))
);

/** Le point de nom `nom` (« G ») dans le cube. */
export function pt(nom) {
  const i = IDX[nom];
  if (i === undefined) throw new Error(`pt: sommet inconnu « ${nom} »`);
  return CUBE.vertices[i];
}

/** Le vecteur d'un sommet vers un autre, par leurs NOMS : vecNom('A','G'). */
export function vecNom(depart, arrivee) {
  return sub3(pt(arrivee), pt(depart));
}

/**
 * Les coordonnées d'un vecteur DANS LE REPÈRE DE LA LEÇON (A ; AB, AD, AE),
 * c'est-à-dire en unités d'arête : AG y vaut (1 ; 1 ; 1) et non (2 ; 2 ; −2).
 *
 * C'est cette écriture-là que les modules 2 et suivants emploient : elle est
 * celle des énoncés (« dans le repère (A ; AB, AD, AE) »), et elle rend les
 * produits scalaires petits et lisibles. Le passage aux unités de dessin est
 * l'affaire du composant, pas de l'élève.
 */
export function coordsDansRepere(v) {
  return { x: zero(v.x / c), y: zero(v.y / c), z: zero(-v.z / c) };
}

/** L'inverse : d'une écriture en unités d'arête vers le monde du dessin. */
export function repereVersMonde(v) {
  return { x: zero(v.x * c), y: zero(v.y * c), z: zero(-v.z * c) };
}

/* ── La décomposition en trois déplacements (module 1) ────────────────── */

/**
 * Le chemin en TROIS déplacements le long des arêtes, du sommet `depart` au
 * sommet `arrivee` : d'abord tout le x, puis tout le y, puis tout le z.
 *
 * C'est le cœur de la manipulation signature : le vecteur n'est pas « une
 * flèche oblique dans le vide », c'est la SOMME de trois déplacements comptés,
 * un par direction. Chaque étape rend son point de départ, son point d'arrivée
 * et le nombre d'arêtes parcourues — le composant n'a rien à calculer.
 *
 * Les points intermédiaires ne sont pas toujours des sommets du cube (par
 * exemple sur une diagonale), et c'est voulu : ils sont sur les ARÊTES ou dans
 * les faces, ce que le dessin montre.
 */
export function decomposition(depart, arrivee) {
  const P0 = pt(depart);
  const P3 = pt(arrivee);
  const d = sub3(P3, P0);
  const P1 = { x: P3.x, y: P0.y, z: P0.z };
  const P2 = { x: P3.x, y: P3.y, z: P0.z };
  const enArêtes = coordsDansRepere(d);
  return [
    { axe: 'x', from: P0, to: P1, delta: d.x, aretes: enArêtes.x, label: 'vers la droite' },
    { axe: 'y', from: P1, to: P2, delta: d.y, aretes: enArêtes.y, label: 'vers le haut' },
    { axe: 'z', from: P2, to: P3, delta: zero(-d.z), aretes: enArêtes.z, label: 'vers le fond' },
  ];
}

/* ── Le double Pythagore (module 1, puis module 3) ────────────────────── */

/**
 * La norme d'un vecteur, DÉCOMPOSÉE en ses deux applications de Pythagore.
 *
 * Étape 1 — le triangle du PLANCHER, rectangle en P1 : les deux côtés de
 *   l'angle droit sont le déplacement en x et le déplacement en y, et
 *   l'hypoténuse est la diagonale du plancher, d = √(x² + y²).
 * Étape 2 — le triangle de l'ESPACE, rectangle en P2 : les deux côtés de
 *   l'angle droit sont cette diagonale et le déplacement en z, et
 *   l'hypoténuse est le vecteur lui-même, √(d² + z²).
 *
 * Les deux triangles sont RECTANGLES par construction — c'est vérifié au bit
 * près par un test (le produit scalaire de leurs côtés vaut 0 exactement),
 * parce que la promesse du module 1 est justement « Pythagore s'applique ici,
 * deux fois ».
 *
 * `plancherCarre` et `total` sont rendus séparément pour que le module puisse
 * afficher x² + y² avant d'en prendre la racine : c'est l'étape que l'élève
 * saute quand il écrit √(x² + y²) + z².
 */
export function doublePythagore(v) {
  const plancherCarre = v.x * v.x + v.y * v.y;
  const plancher = Math.sqrt(plancherCarre);
  const totalCarre = plancherCarre + v.z * v.z;
  return {
    plancherCarre,
    plancher,
    hauteur: Math.abs(v.z),
    totalCarre,
    total: Math.sqrt(totalCarre),
  };
}

/**
 * Une norme écrite en RADICAL SIMPLIFIÉ quand c'est possible : 8 devient 2√2,
 * 12 devient 2√3, 4 devient 2. Sinon, la valeur décimale arrondie.
 *
 * POURQUOI : la leçon promet des normes « lisibles ». Afficher 2,83 là où la
 * réponse exacte est 2√2 apprendrait à arrondir. Le carré étant toujours un
 * ENTIER (les coordonnées le sont), l'extraction du plus grand carré parfait
 * est exacte et se fait sans flottant.
 */
export function normeExacte(carre) {
  if (!Number.isInteger(carre) || carre < 0) return fr(Math.sqrt(carre));
  if (carre === 0) return '0';
  let dehors = 1;
  let dedans = carre;
  for (let k = 2; k * k <= dedans; k += 1) {
    while (dedans % (k * k) === 0) {
      dedans /= k * k;
      dehors *= k;
    }
  }
  if (dedans === 1) return String(dehors);
  return dehors === 1 ? `√${dedans}` : `${dehors}√${dedans}`;
}

/* ── Produit scalaire dans l'espace ───────────────────────────────────── */

/**
 * Le produit scalaire de deux vecteurs de l'espace : LA MÊME formule qu'au
 * plan, avec un terme de plus. C'est `dot3` du module partagé — nommé ici pour
 * que les modules lisent « produitEspace » et non un appel générique.
 */
export const produitEspace = dot3;

/** L'angle entre deux vecteurs de l'espace, en degrés. Pour le DESSIN et les
 *  légendes seulement : aucune réponse attendue de l'élève n'en dépend. */
export function angleEspaceDeg(u, v) {
  const n = norm3(u) * norm3(v);
  if (n === 0) return NaN;
  const cos = Math.min(1, Math.max(-1, dot3(u, v) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Deux vecteurs de l'espace sont-ils orthogonaux ? Test EXACT : les
 *  coordonnées étant entières, le produit scalaire l'est aussi. */
export function orthogonaux(u, v) {
  return dot3(u, v) === 0;
}

/** Deux vecteurs de l'espace sont-ils colinéaires ? Le produit vectoriel est
 *  nul exactement dans ce cas, et il reste entier : test EXACT lui aussi. */
export function colineaires(u, v) {
  const n = cross3(u, v);
  return n.x === 0 && n.y === 0 && n.z === 0;
}

/* ── Droites du cube : parallélisme et orthogonalité ──────────────────── */

/**
 * Une droite de la figure, désignée par deux sommets. `dir` est son vecteur
 * directeur, en unités d'arête.
 */
export function droite(a, b) {
  return {
    id: `${a}${b}`,
    nom: `(${a}${b})`,
    a, b,
    A: pt(a),
    B: pt(b),
    dir: coordsDansRepere(vecNom(a, b)),
  };
}

/**
 * Le VERDICT complet sur un couple de droites du cube, entièrement CALCULÉ.
 *
 * Trois faits indépendants, et c'est leur combinaison qui porte la leçon :
 *   `paralleles`   — les directeurs sont colinéaires ;
 *   `orthogonales` — le produit scalaire des directeurs est nul ;
 *   `position`     — sécantes, parallèles ou non coplanaires (`relativePosition`).
 *
 * LE FAIT CAPITAL de la leçon vit dans la combinaison `orthogonales && position
 * === 'non-coplanaires'` : deux droites de l'espace peuvent être orthogonales
 * SANS se couper. Dans le plan, « perpendiculaires » impliquait « sécantes » ;
 * ici, non. `secantes` est donc rendu séparément, et jamais déduit de
 * l'orthogonalité.
 */
export function verdictDroites(d1, d2) {
  const ps = dot3(d1.dir, d2.dir);
  const position = relativePosition(d1.A, d1.B, d2.A, d2.B);
  return {
    id: `${d1.id}-${d2.id}`,
    d1, d2,
    produit: ps,
    paralleles: colineaires(d1.dir, d2.dir),
    orthogonales: ps === 0,
    position,
    secantes: position === 'secantes',
  };
}

export const POSITION_LABEL = Object.freeze({
  paralleles: 'parallèles',
  secantes: 'sécantes',
  'non-coplanaires': 'non coplanaires : elles ne se coupent pas et ne sont pas parallèles',
  confondues: 'confondues',
});

/* ── Les couples travaillés par les modules 5 et 6 ────────────────────── */

/**
 * Les couples de droites du cube proposés à l'élève. Aucun verdict n'est écrit
 * ici : `verdictDroites` les calcule tous, si bien qu'un énoncé faux est
 * impossible. Le champ `piege` dit ce que la PERSPECTIVE laisse croire — c'est
 * lui qui justifie d'imposer une rotation avant la question.
 */
export const COUPLES_DROITES = Object.freeze([
  { id: 'c1', d1: ['A', 'B'], d2: ['H', 'G'], piege: null },
  { id: 'c2', d1: ['A', 'B'], d2: ['C', 'G'], piege: 'orthogonales-non-secantes' },
  { id: 'c3', d1: ['A', 'B'], d2: ['B', 'C'], piege: null },
  { id: 'c4', d1: ['A', 'E'], d2: ['C', 'G'], piege: null },
  { id: 'c5', d1: ['A', 'C'], d2: ['E', 'G'], piege: null },
  { id: 'c6', d1: ['A', 'C'], d2: ['D', 'F'], piege: 'croisement-apparent' },
]);

/**
 * LES DEUX PIÈGES, ET CE QU'UN TEST EN EXIGE.
 *
 * `croisement-apparent` — le couple DOIT se croiser sur le dessin dans la vue
 *   de départ (0 ; 0) alors qu'il n'est pas coplanaire, sinon le piège n'a
 *   jamais lieu et la consigne « tourne pour t'en assurer » ne sert à rien.
 *   (AC)/(DF) se croise dans 69 des 117 orientations, dont celle de départ ;
 *   48 le lèvent. La version antérieure de cette table nommait ainsi
 *   (AB)/(CG), qui ne se croise PAS dans la vue de départ (18 orientations sur
 *   117, aucune au repos) : le piège annoncé n'existait pas.
 *
 * `orthogonales-non-secantes` — le couple DOIT porter le fait capital de la
 *   leçon : produit scalaire nul ET non coplanaires. La version antérieure
 *   nommait ainsi (AD)/(FG), qui est en réalité PARALLÈLE (les deux directeurs
 *   valent (0 ; 1 ; 0)) : l'étiquette affirmait exactement le contraire du
 *   verdict calculé. (AB)/(CG) le porte vraiment.
 *
 * Ces deux corrections ont été faites après un balayage des 336 couples de
 * sommets et des 117 orientations ; les tests les verrouillent.
 */
export const EXIGENCE_PIEGE = Object.freeze({
  'croisement-apparent': (v) => v.position === 'non-coplanaires'
    && croisementApparent(v, { yaw: 0, pitch: 0 }),
  'orthogonales-non-secantes': (v) => v.orthogonales && v.position === 'non-coplanaires',
});

/** Les verdicts des six couples, CALCULÉS. */
export function verdicts() {
  return COUPLES_DROITES.map((k) => ({
    ...verdictDroites(droite(...k.d1), droite(...k.d2)),
    cle: k.id,
    piege: k.piege,
  }));
}

/* ── Rotation : la plage offerte, et la parade au piège de la vue ─────── */

/** Le pas du cliquet de rotation, en degrés. */
export const PAS_ROT = 15;

/** Les bornes offertes à l'élève — les mêmes que celles de SolidTurner. */
export const YAW_RANGE = Object.freeze({ min: -90, max: 90 });
export const PITCH_RANGE = Object.freeze({ min: -60, max: 60 });

/** Toutes les orientations réellement atteignables au cliquet, depuis (0 ; 0). */
export function orientationsAtteignables() {
  const out = [];
  for (let yaw = YAW_RANGE.min; yaw <= YAW_RANGE.max; yaw += PAS_ROT) {
    for (let pitch = PITCH_RANGE.min; pitch <= PITCH_RANGE.max; pitch += PAS_ROT) {
      out.push({ yaw, pitch });
    }
  }
  return out;
}

/**
 * LE CENTRE DU CUBE, autour duquel il TOURNE.
 *
 * Le cube de la leçon est ancré en A pour que les coordonnées soient entières
 * et petites — c'est sa raison d'être. Mais le faire tourner tel quel le ferait
 * pivoter AUTOUR DE A, donc décrire un grand arc de cercle à travers le cadre :
 * l'élève verrait la boîte fuir au lieu de tourner sur elle-même. Pire, au
 * repos le dessin s'étalait de 126 à 217 dans un cadre de 0 à 300 — poussé en
 * haut à gauche, la moitié du cadre perdue. Un test l'a mesuré.
 *
 * On recentre donc AVANT de tourner et de projeter. Le repère mathématique de
 * la leçon (A à l'origine, coordonnées entières) est intact : ce décalage est
 * purement une affaire de DESSIN, et il ne touche aucune valeur que l'élève lit.
 */
const CENTRE = Object.freeze({ x: c / 2, y: c / 2, z: -c / 2 });

/** La projection écran d'un sommet du cube, dans une orientation donnée. */
export function projeter(orientation, vertices = CUBE.vertices) {
  const recentres = vertices.map((p) => sub3(p, CENTRE));
  const tourne = rotateSolid({ ...CUBE, vertices: recentres }, orientation);
  return tourne.vertices.map((p) => projectCavaliere(p));
}

/** Deux segments du plan se croisent-ils STRICTEMENT (hors extrémités) ? */
function segmentsSeCroisent(p1, p2, p3, p4, eps = 1e-9) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < eps) return false;                 // parallèles à l'écran
  const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const s = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return t > eps && t < 1 - eps && s > eps && s < 1 - eps;
}

/**
 * LE CROISEMENT APPARENT : dans cette orientation, les deux segments du couple
 * se croisent-ils SUR LE DESSIN ?
 *
 * C'est le mensonge de la perspective, mesuré. Pour un couple non coplanaire,
 * « oui » signifie que le dessin montre une intersection qui n'existe pas.
 */
export function croisementApparent(v, orientation) {
  const P = projeter(orientation);
  const [a1, a2] = [IDX[v.d1.a], IDX[v.d1.b]];
  const [b1, b2] = [IDX[v.d2.a], IDX[v.d2.b]];
  // Un sommet commun n'est pas un croisement apparent : c'est une vraie
  // intersection, et elle est licite.
  if (new Set([a1, a2, b1, b2]).size < 4) return false;
  return segmentsSeCroisent(P[a1], P[a2], P[b1], P[b2]);
}

/**
 * LA PARADE, PROUVÉE : les orientations où le couple ne se croise PLUS sur le
 * dessin, c'est-à-dire celles où l'élève peut voir que les deux droites ne se
 * rencontrent pas.
 *
 * La leçon promet « tourne, et tu verras qu'elles ne se touchent pas ». Cette
 * fonction rend la liste des orientations qui tiennent cette promesse ; un
 * test vérifie qu'elle n'est vide pour AUCUN couple non coplanaire. Sans
 * cela, la consigne serait infaisable — et l'élève aurait raison de croire
 * ce que le dessin lui montre.
 */
export function orientationsQuiLevent(v) {
  return orientationsAtteignables().filter((o) => !croisementApparent(v, o));
}

/**
 * L'orientation RECOMMANDÉE pour lever l'ambiguïté d'un couple : la plus
 * proche de la vue de trois quarts (30 ; 20) parmi celles qui la lèvent, la
 * vue de trois quarts étant celle où le cube se lit le mieux.
 */
export function orientationRecommandee(v) {
  const cands = orientationsQuiLevent(v);
  if (cands.length === 0) return null;
  const cible = { yaw: 30, pitch: 20 };
  return cands.reduce((best, o) => {
    const d = (x) => (x.yaw - cible.yaw) ** 2 + (x.pitch - cible.pitch) ** 2;
    return d(o) < d(best) ? o : best;
  }, cands[0]);
}

/* ── Sécurité de mise en page ─────────────────────────────────────────── */

/**
 * L'étendue du dessin dans une orientation, en unités de projection.
 * Le composant s'en sert pour dimensionner son viewBox ; le test s'en sert
 * pour vérifier qu'aucune orientation atteignable ne déborde du cadre prévu.
 */
export function etendueProjetee(orientation) {
  const P = projeter(orientation);
  const xs = P.map((p) => p.x);
  const ys = P.map((p) => p.y);
  return {
    xMin: Math.min(...xs), xMax: Math.max(...xs),
    yMin: Math.min(...ys), yMax: Math.max(...ys),
  };
}

/**
 * Le RAYON maximal du dessin sur toute la plage atteignable : c'est lui qui
 * fixe l'échelle du composant, une fois pour toutes. Le calculer (au lieu de
 * l'estimer) est ce qui garantit qu'aucune rotation ne fait sortir une arête.
 */
export function rayonMaximal() {
  let r = 0;
  for (const o of orientationsAtteignables()) {
    const e = etendueProjetee(o);
    r = Math.max(r, -e.xMin, e.xMax, -e.yMin, e.yMax);
  }
  return r;
}

/* ── LE GLISSER : du déplacement du doigt à l'orientation ─────────────── */

/**
 * L'échelle du dessin, DÉRIVÉE de `rayonMaximal()` et non estimée.
 *
 * Le cadre est carré et son demi-côté vaut `DEMI_CADRE` unités d'écran. Le
 * cube d'arête 2 se projette dans un rayon de `rayonMaximal()` ≈ 3,56 unités
 * de monde SUR TOUTE LA PLAGE ATTEIGNABLE ; on l'agrandit du facteur
 * `ECHELLE` pour qu'il remplisse le cadre en gardant `MARGE_SOMMET` unités
 * d'écran de garde — de quoi loger la pastille de saisie d'un sommet et son
 * étiquette sans jamais sortir du viewBox, quelle que soit la rotation.
 *
 * Un test balaie les 117 orientations et vérifie que ni un sommet, ni sa
 * pastille, ni son étiquette ne franchissent le bord. Il ne l'échantillonne
 * pas.
 */
export const DEMI_CADRE = 150;
export const MARGE_SOMMET = 30;
export const ECHELLE = (DEMI_CADRE - MARGE_SOMMET) / rayonMaximal();

/** Le rayon de la pastille DESSINÉE au sommet, en unités d'écran. */
export const RAYON_SOMMET = 7;

/**
 * Le rayon de SAISIE d'un sommet, MESURÉ et non deviné.
 *
 * Le viewBox fait 2 × DEMI_CADRE = 300 unités de large et se rend sur ≈ 300 px
 * à 375 px de large (le module a ses marges) : le facteur est donc ≈ 1, et les
 * 44 px de cible tactile exigent un rayon de 22 unités. On prend 24, avec la
 * marge — mais il faut alors que deux sommets ne soient JAMAIS plus proches
 * que 24 unités l'un de l'autre à l'écran, sans quoi une pastille en
 * masquerait une autre et le clic serait ambigu. Ce n'est PAS vrai partout :
 * `orientationsSansAmbiguite` rend la liste des orientations où ça l'est, et
 * `sommetLePlusProche` départage par la distance quoi qu'il arrive.
 */
export const RAYON_SAISIE = 24;

/**
 * La position à l'ÉCRAN de chaque sommet, dans une orientation donnée :
 * un point du viewBox, prêt à être dessiné et prêt à être cliqué.
 *
 * C'est la SEULE traduction monde → écran de la leçon. Le composant ne
 * recalcule rien : il lit ce tableau, l'indice y est celui du sommet.
 */
export function sommetsEcran(orientation, points = CUBE.vertices) {
  return projeter(orientation, points).map((p) => ({
    x: DEMI_CADRE + p.x * ECHELLE,
    y: DEMI_CADRE + p.y * ECHELLE,
  }));
}

/**
 * Le sommet le plus proche d'un point de l'écran, s'il est à portée.
 *
 * Rend `null` au-delà de `RAYON_SAISIE` : un clic dans le vide ne sélectionne
 * rien, plutôt que d'attraper le sommet le moins loin de l'autre bout du
 * cadre. C'est ce qui rend le geste « je clique CE sommet » honnête.
 */
export function sommetLePlusProche(orientation, point, rayon = RAYON_SAISIE) {
  const S = sommetsEcran(orientation);
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < S.length; i += 1) {
    const d = Math.hypot(S[i].x - point.x, S[i].y - point.y);
    if (d < bestD) { bestD = d; best = i; }
  }
  return bestD <= rayon ? best : null;
}

/** Le plus petit écart entre deux sommets À L'ÉCRAN, dans une orientation. */
export function ecartMinimalEcran(orientation) {
  const S = sommetsEcran(orientation);
  let m = Infinity;
  for (let i = 0; i < S.length; i += 1) {
    for (let j = i + 1; j < S.length; j += 1) {
      m = Math.min(m, Math.hypot(S[i].x - S[j].x, S[i].y - S[j].y));
    }
  }
  return m;
}

/**
 * Aimantation d'un angle sur le cliquet, puis bornage dans la plage.
 *
 * L'AIMANTATION EST CE QUI REND LE GLISSER COMPATIBLE AVEC L'ATTEIGNABILITÉ.
 * Un doigt ne vise pas au degré près ; sans elle, l'orientation recommandée
 * d'un couple ne serait jamais exactement atteinte, et un test d'atteignabilité
 * porterait sur des états que l'élève ne peut pas produire. Avec elle, tout
 * état atteint au doigt appartient à `orientationsAtteignables()` — c'est un
 * invariant testé.
 */
export function aimanter(angle, { min, max }, pas = PAS_ROT) {
  const k = zero(Math.round(angle / pas) * pas);
  return zero(Math.min(max, Math.max(min, k)));
}

/**
 * La conversion d'un déplacement du doigt en orientation.
 *
 * `SENSIBILITE` est le nombre d'unités d'écran qu'il faut parcourir pour
 * tourner d'un degré. Fixée à 2 : un balayage de 180 unités (les trois quarts
 * du cadre) couvre alors les 90° de la plage de yaw, ce qui est le geste
 * naturel « je fais pivoter la boîte d'un quart de tour ».
 *
 * Le signe du pitch est INVERSÉ : tirer vers le BAS penche le dessus du solide
 * VERS SOI, ce qui est le geste attendu — l'inverse donnerait la sensation de
 * pousser l'objet, et le §CONVENTIONS de geometry3d oriente déjà y vers le
 * haut du monde alors que l'écran l'oriente vers le bas.
 */
export const SENSIBILITE = 2;

export function orientationApresGlisser(depart, dx, dy) {
  return {
    yaw: aimanter(depart.yaw + dx / SENSIBILITE, YAW_RANGE),
    pitch: aimanter(depart.pitch - dy / SENSIBILITE, PITCH_RANGE),
  };
}

/** Un cran de rotation au clavier, borné — le chemin clavier complet. */
export function orientationApresTouche(depart, touche) {
  const { yaw, pitch } = depart;
  switch (touche) {
    case 'ArrowLeft': return { yaw: aimanter(yaw - PAS_ROT, YAW_RANGE), pitch };
    case 'ArrowRight': return { yaw: aimanter(yaw + PAS_ROT, YAW_RANGE), pitch };
    case 'ArrowUp': return { yaw, pitch: aimanter(pitch + PAS_ROT, PITCH_RANGE) };
    case 'ArrowDown': return { yaw, pitch: aimanter(pitch - PAS_ROT, PITCH_RANGE) };
    case 'Home': return { yaw: YAW_RANGE.min, pitch };
    case 'End': return { yaw: YAW_RANGE.max, pitch };
    case 'PageUp': return { yaw, pitch: PITCH_RANGE.max };
    case 'PageDown': return { yaw, pitch: PITCH_RANGE.min };
    default: return null;
  }
}

/** L'orientation de départ de tous les laboratoires : la vue de face. */
export const ORIENTATION_DEPART = Object.freeze({ yaw: 0, pitch: 0 });

/**
 * Une orientation est-elle atteignable au geste depuis le départ ?
 * (yaw et pitch tombent sur un cran ET restent dans les bornes.)
 */
export function estAtteignable(o) {
  const ok = (a, r) => Number.isInteger(a / PAS_ROT) && a >= r.min && a <= r.max;
  return ok(o.yaw, YAW_RANGE) && ok(o.pitch, PITCH_RANGE);
}
