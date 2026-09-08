import {
  angleAt, triangleAngles, polygonArea, midpoint, dist, distToLine, footOnLine,
  circumcenter, lineInter, isTriangle, clampPt, clipLine, deg, rad, round, fr,
} from '../../../../../common/geo5e/geo5e';

export {
  angleAt, triangleAngles, polygonArea, midpoint, dist, distToLine, footOnLine,
  circumcenter, lineInter, isTriangle, clampPt, clipLine, deg, rad, round, fr,
};

/**
 * Le noyau de la leçon « Triangles » (5e).
 *
 * LA FIGURE NE MENT JAMAIS. Tout ce que la leçon affirme — « la somme fait
 * 180° », « ces deux aires sont égales », « ce point est à égale distance des
 * trois sommets » — est CALCULÉ ici à partir des points réellement dessinés.
 * Si l'élève traîne un sommet, les nombres suivent et restent vrais. C'est ce
 * qui permet de faire CHERCHER un contre-exemple sans risquer d'en fabriquer
 * un faux par arrondi.
 *
 * LE PÉRIMÈTRE EST EXÉCUTABLE. La 5e construit, mesure et démontre par
 * découpage ; elle n'utilise ni Pythagore (4e), ni Thalès (4e), ni la
 * trigonométrie (4e/3e). `triangleDe` LÈVE si les trois longueurs violent
 * l'inégalité triangulaire, et le test le vérifie : un module qui prétendrait
 * construire un triangle impossible casserait au lieu de dessiner une figure
 * absurde.
 */

/** La somme des angles, mesurée sur la figure — jamais écrite en dur. */
export const sommeAngles = (tri) => triangleAngles(tri).reduce((s, a) => s + a, 0);

/**
 * Le troisième angle d'un triangle, déduit des deux autres.
 * C'est l'usage NUMÉRIQUE du théorème, celui du module « calculer un angle ».
 */
export function troisiemeAngle(a, b) {
  if (!(a > 0) || !(b > 0) || a + b >= 180) {
    throw new Error(
      `triangles-5e : deux angles d’un triangle doivent être positifs et totaliser moins de 180° ; reçu ${a}° et ${b}°.`,
    );
  }
  return 180 - a - b;
}

/** La nature d'un triangle, DÉDUITE de ses côtés et de ses angles. */
export function natureDe(tri, tol = 1.2) {
  const [A, B, C] = tri;
  const cotes = [dist(B, C), dist(A, C), dist(A, B)].sort((x, y) => x - y);
  const angles = triangleAngles(tri);
  const maxAngle = Math.max(...angles);

  const egal = (x, y) => Math.abs(x - y) <= tol;
  const equilateral = egal(cotes[0], cotes[1]) && egal(cotes[1], cotes[2]);
  const isocele = !equilateral && (egal(cotes[0], cotes[1]) || egal(cotes[1], cotes[2]));
  const rectangle = Math.abs(maxAngle - 90) <= 0.9;

  return {
    equilateral,
    isocele,
    rectangle,
    obtusangle: maxAngle > 90.9,
    quelconque: !equilateral && !isocele && !rectangle,
    cotes,
    angles,
  };
}

/* ── L'inégalité triangulaire ────────────────────────────────────────────── */

/**
 * Trois longueurs forment-elles un triangle ? Et si non, POURQUOI.
 * Le diagnostic sert au module de construction : on ne dit jamais « impossible »
 * sans nommer le côté fautif.
 */
export function diagnostiquerCotes(a, b, c) {
  const cotes = [a, b, c];
  if (cotes.some((x) => !(x > 0))) {
    return { possible: false, raison: 'nul', plusGrand: null, sommeAutres: null };
  }
  const plusGrand = Math.max(a, b, c);
  const sommeAutres = a + b + c - plusGrand;
  if (sommeAutres > plusGrand) return { possible: true, raison: 'ok', plusGrand, sommeAutres };
  return {
    possible: false,
    raison: sommeAutres === plusGrand ? 'plat' : 'trop-court',
    plusGrand,
    sommeAutres,
  };
}

/**
 * Le triangle de côtés (a, b, c), placé à partir de `origine`.
 * Le troisième sommet est l'intersection de deux cercles — la construction au
 * compas, exactement celle que l'élève fait sur sa feuille.
 */
export function triangleDe(a, b, c, origine = { x: 0, y: 0 }) {
  const diag = diagnostiquerCotes(a, b, c);
  if (!diag.possible) {
    throw new Error(
      `triangles-5e : les longueurs ${a}, ${b}, ${c} ne forment pas un triangle `
      + `(le plus grand côté, ${diag.plusGrand}, doit être STRICTEMENT inférieur à la somme des deux autres, ${diag.sommeAutres}).`,
    );
  }
  const B = { x: origine.x, y: origine.y };
  const C = { x: origine.x + a, y: origine.y };
  // BA = c, CA = b : le sommet A est à l'intersection des deux cercles.
  const x = (a * a + c * c - b * b) / (2 * a);
  const h = Math.sqrt(Math.max(0, c * c - x * x));
  const A = { x: origine.x + x, y: origine.y - h };
  return [A, B, C];
}

/* ── Les droites remarquables ────────────────────────────────────────────── */

/** La médiatrice de [P Q] : son milieu, et un vecteur directeur perpendiculaire. */
export function mediatrice(P, Q) {
  const m = midpoint(P, Q);
  const d = { x: -(Q.y - P.y), y: Q.x - P.x };
  return [m, { x: m.x + d.x, y: m.y + d.y }];
}

/** Le rayon du cercle circonscrit, mesuré depuis le centre calculé. */
export function rayonCirconscrit(tri) {
  const O = circumcenter(tri);
  return O ? dist(O, tri[0]) : null;
}

/**
 * Le centre du cercle circonscrit est-il VRAIMENT à égale distance des trois
 * sommets ? La leçon l'affirme ; cette fonction le mesure, et le test s'en sert.
 */
export function ecartRayons(tri) {
  const O = circumcenter(tri);
  if (!O) return null;
  const r = tri.map((s) => dist(O, s));
  return Math.max(...r) - Math.min(...r);
}

/** La hauteur issue de `i` : le sommet, et son pied sur le côté opposé. */
export function hauteur(tri, i) {
  const A = tri[i];
  const B = tri[(i + 1) % 3];
  const C = tri[(i + 2) % 3];
  return { sommet: A, pied: footOnLine(A, B, C), longueur: distToLine(A, B, C), base: [B, C] };
}

/** La médiane issue de `i` : le sommet, et le milieu du côté opposé. */
export function mediane(tri, i) {
  const A = tri[i];
  const B = tri[(i + 1) % 3];
  const C = tri[(i + 2) % 3];
  return { sommet: A, milieu: midpoint(B, C), base: [B, C] };
}

/**
 * LES DEUX AIRES que la médiane sépare.
 *
 * C'est la démonstration exigée par le programme, rendue vérifiable : la
 * médiane issue de A coupe ABC en ABM et ACM. Les deux ont la MÊME base (BM =
 * MC, puisque M est le milieu) et la MÊME hauteur (celle issue de A, qui ne
 * dépend pas du côté choisi). Cette fonction retourne les deux aires calculées
 * — et le test vérifie qu'elles coïncident sur des triangles quelconques.
 */
export function airesSepareesParMediane(tri, i) {
  const A = tri[i];
  const B = tri[(i + 1) % 3];
  const C = tri[(i + 2) % 3];
  const M = midpoint(B, C);
  return {
    M,
    aire1: polygonArea([A, B, M]),
    aire2: polygonArea([A, M, C]),
    // Les deux ingrédients de la preuve, mesurés eux aussi :
    base1: dist(B, M),
    base2: dist(M, C),
    hauteurCommune: distToLine(A, B, C),
  };
}

/* ── Le découpage qui DÉMONTRE la somme des angles ───────────────────────── */

/**
 * Les trois angles rapportés autour d'un même point, bout à bout.
 *
 * C'est la manipulation qui fait la preuve en 5e : on découpe les trois coins
 * du triangle et on les recolle autour d'un point ; ils forment un angle plat.
 * `positionsCumulees` donne, pour chaque coin, l'angle de départ de son
 * secteur — donc la figure recollée est CALCULÉE à partir des angles réels du
 * triangle, et non dessinée à l'avance.
 */
export function recollageAngles(tri) {
  const angles = triangleAngles(tri);
  const cumul = [];
  let acc = 0;
  for (const a of angles) {
    cumul.push({ debut: acc, mesure: a });
    acc += a;
  }
  return { angles, cumul, total: acc };
}
