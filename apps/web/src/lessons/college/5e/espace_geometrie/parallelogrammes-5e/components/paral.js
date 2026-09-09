import {
  angleAt, dist, distToLine, footOnLine, lineInter, midpoint, polygonArea, round,
} from '../../../../../common/geo5e/geo5e';

/**
 * paral — le noyau de calcul de la leçon « Parallélogrammes » (5e).
 *
 * LA RÈGLE DU FICHIER, héritée de geo5e : LA FIGURE NE MENT JAMAIS. Tout ce
 * que la leçon affirme — « ces deux côtés sont parallèles », « ces deux
 * longueurs sont égales », « O est le milieu des deux diagonales », « l'aire
 * n'a pas changé » — est CALCULÉ ici à partir des quatre points réellement
 * dessinés. Aucune propriété n'est écrite en dur à côté d'un dessin
 * approximatif : si l'élève traîne un sommet, les témoins suivent, et ils
 * restent vrais. paral.test.js vérifie exactement cela.
 *
 * PÉRIMÈTRE EXÉCUTABLE (docs/lessons/5E_PARALLELOGRAMMES_SPEC.md). L'objet
 * officiel 5e exclut LES VECTEURS. Cette exclusion n'est pas un commentaire :
 * `translater` LÈVE si on lui passe un déplacement nommé comme un vecteur,
 * parce qu'une leçon de 5e qui construirait le quatrième sommet « par la
 * translation de vecteur AB » aurait quitté son programme (c'est l'objet
 * `4e_parallelogrammes_translations`). Le test le vérifie.
 *
 * Le repère est celui du SVG : x vers la droite, y VERS LE BAS. Aucun axe
 * n'est affiché : à ce niveau, un « y qui descend » ne se voit pas.
 */

/* ── Tolérances ────────────────────────────────────────────────────────────
   Elles sont sous ce que l'élève VOIT à la taille de rendu (§28bis « une
   tolérance plus large que l'œil enseigne que "à peu près" suffit »). Le
   cadre fait 760 unités de viewBox pour ~700 px à l'écran : une unité vaut
   donc à peu près un pixel, et 6 unités d'écart sur un côté de 200 sont
   parfaitement visibles. */

/** Écart d'angle, en degrés, sous lequel deux droites sont dites parallèles. */
export const TOL_ANGLE = 2.2;
/** Écart de longueur, en unités de figure, sous lequel deux côtés sont dits égaux. */
export const TOL_LONG = 6;

/* ── Vocabulaire de base sur le quadrilatère ABCD ──────────────────────── */

/** Les quatre côtés, dans l'ordre du contour : [AB], [BC], [CD], [DA]. */
export const cotes = ([A, B, C, D]) => [[A, B], [B, C], [C, D], [D, A]];

/** Les quatre longueurs, dans le même ordre. */
export const longueurs = (q) => cotes(q).map(([p, r]) => dist(p, r));

/** Les quatre angles du quadrilatère, aux sommets A, B, C, D. */
export const anglesQuad = ([A, B, C, D]) => [
  angleAt(D, A, B),
  angleAt(A, B, C),
  angleAt(B, C, D),
  angleAt(C, D, A),
];

/**
 * L'écart d'angle entre les DROITES (a,b) et (c,d), en degrés, dans [0 ; 90].
 *
 * On compare des droites, pas des demi-droites : deux côtés opposés d'un
 * quadrilatère sont parcourus en sens contraire par le contour, si bien qu'un
 * angle orienté annoncerait 180° là où l'élève voit deux traits parallèles.
 */
export function ecartDirection(a, b, c, d) {
  const t1 = Math.atan2(b.y - a.y, b.x - a.x);
  const t2 = Math.atan2(d.y - c.y, d.x - c.x);
  let e = ((t1 - t2) * 180) / Math.PI;
  e = ((e % 180) + 180) % 180;      // ramené dans [0 ; 180[
  return e > 90 ? 180 - e : e;      // puis dans [0 ; 90]
}

/** Les deux droites (a,b) et (c,d) sont-elles parallèles, à TOL_ANGLE près ? */
export const sontParalleles = (a, b, c, d, tol = TOL_ANGLE) =>
  ecartDirection(a, b, c, d) <= tol;

/* ── Les quatre témoins que l'élève voit s'allumer ─────────────────────── */

/**
 * L'état complet d'un quadrilatère ABCD : ce que la figure DIT d'elle-même.
 *
 * Une seule source de vérité pour les lampes, les codages, la table de
 * mesures et la validation de l'étape (§28 : une seule fois, dérivé partout).
 * `ecart` accompagne chaque témoin, parce qu'un retour qui NOMME l'écart
 * restant (« il s'en faut de 14° ») vaut mieux qu'une lampe éteinte.
 */
export function etatQuad(q) {
  const [A, B, C, D] = q;
  const [ab, bc, cd, da] = longueurs(q);

  const parAbDc = ecartDirection(A, B, D, C);
  const parAdBc = ecartDirection(A, D, B, C);

  return {
    longueurs: { AB: ab, BC: bc, CD: cd, DA: da },
    angles: anglesQuad(q),
    temoins: {
      parAbDc: { ok: parAbDc <= TOL_ANGLE, ecart: parAbDc, label: '(AB) ∥ (DC)' },
      parAdBc: { ok: parAdBc <= TOL_ANGLE, ecart: parAdBc, label: '(AD) ∥ (BC)' },
      egAbDc: { ok: Math.abs(ab - cd) <= TOL_LONG, ecart: Math.abs(ab - cd), label: 'AB = DC' },
      egAdBc: { ok: Math.abs(da - bc) <= TOL_LONG, ecart: Math.abs(da - bc), label: 'AD = BC' },
    },
  };
}

/**
 * ABCD est-il un parallélogramme ?
 *
 * La DÉFINITION, et elle seule : les deux paires de côtés opposés sont
 * parallèles. Les égalités de longueurs ne servent pas ici — c'est justement
 * la découverte du module 1 qu'elles arrivent d'elles-mêmes.
 */
export const estParallelogramme = (q, tol = TOL_ANGLE) => {
  const [A, B, C, D] = q;
  return sontParalleles(A, B, D, C, tol) && sontParalleles(A, D, B, C, tol);
};

/**
 * Le quadrilatère est-il non dégénéré (convexe, sans sommets confondus) ?
 *
 * Un quadrilatère croisé ou aplati a des « côtés opposés » qui n'ont plus de
 * sens pour l'élève : on empêche l'élève d'en fabriquer un en traînant un
 * sommet, plutôt que de lui montrer une figure dont la leçon ne parle pas.
 */
export function estSimple(q, minCote = 34) {
  if (longueurs(q).some((l) => l < minCote)) return false;
  // Toutes les rotations sont dans le même sens ⇔ le contour est convexe et
  // non croisé. Le produit vectoriel en z de deux côtés consécutifs donne ce
  // sens ; s'ils changent de signe, la figure se replie sur elle-même.
  let signe = 0;
  for (let i = 0; i < 4; i += 1) {
    const p = q[i];
    const r = q[(i + 1) % 4];
    const s = q[(i + 2) % 4];
    const z = (r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x);
    if (Math.abs(z) < 1e-6) return false;
    const sg = Math.sign(z);
    if (signe === 0) signe = sg;
    else if (sg !== signe) return false;
  }
  return true;
}

/* ── La quatrième place ────────────────────────────────────────────────── */

/**
 * L'unique position de D telle que ABCD soit un parallélogramme.
 *
 * C'est le cœur du module 2 : D n'est pas « à peu près là », il est à UNE
 * place, imposée par A, B et C. Le calcul est celui du milieu commun des
 * diagonales — la propriété du module 4, utilisée ici comme moteur et
 * seulement révélée plus tard : D est le symétrique de B par rapport au
 * milieu de [AC].
 */
export function quatriemeSommet(A, B, C) {
  const O = midpoint(A, C);
  return { x: 2 * O.x - B.x, y: 2 * O.y - B.y };
}

/**
 * INTERDIT EN 5e — le périmètre officiel, rendu exécutable.
 *
 * L'objet `parallelogrammes` du programme 2026 exclut explicitement LES
 * VECTEURS. Construire le quatrième sommet « par la translation de vecteur
 * AB » est la leçon de 4e (`4e_parallelogrammes_translations`), pas celle-ci.
 * Cette fonction existe pour que la frontière soit une ERREUR et non un
 * commentaire qu'on oublie de lire.
 */
export function translater() {
  throw new Error(
    'Périmètre 5e : les vecteurs et les translations sont exclus de l’objet '
    + '« parallelogrammes » (BO 2026). Utiliser quatriemeSommet(A, B, C), qui '
    + 'passe par le milieu commun des diagonales. La translation appartient à '
    + 'la leçon de 4e « Parallélogrammes et translations ».',
  );
}

/* ── Les diagonales ────────────────────────────────────────────────────── */

/**
 * Le point d'intersection des diagonales [AC] et [BD], ou null si elles sont
 * parallèles (figure dégénérée, que estSimple interdit déjà).
 */
export const centreDiagonales = ([A, B, C, D]) => lineInter(A, C, B, D);

/**
 * Ce que les diagonales disent : leurs longueurs, le point O, et les quatre
 * demi-diagonales.
 *
 * Sert le module 4, où la misconception visée est « les diagonales d'un
 * parallélogramme sont égales » : on affiche donc AC et BD À CÔTÉ de
 * OA/OC et OB/OD, pour que l'élève voie que les premières diffèrent pendant
 * que les secondes coïncident.
 */
export function etatDiagonales(q) {
  const [A, B, C, D] = q;
  const O = centreDiagonales(q);
  if (!O) return null;
  const OA = dist(O, A);
  const OC = dist(O, C);
  const OB = dist(O, B);
  const OD = dist(O, D);
  return {
    O,
    AC: dist(A, C),
    BD: dist(B, D),
    OA, OC, OB, OD,
    milieuAC: Math.abs(OA - OC) <= TOL_LONG,
    milieuBD: Math.abs(OB - OD) <= TOL_LONG,
    memeLongueur: Math.abs(dist(A, C) - dist(B, D)) <= TOL_LONG,
    perpendiculaires: Math.abs(angleAt(A, O, B) - 90) <= TOL_ANGLE,
  };
}

/* ── Les parallélogrammes particuliers ─────────────────────────────────── */

/**
 * La nature d'un quadrilatère, décidée par la FIGURE seule.
 *
 * L'ordre du test suit l'arbre d'inclusions que le module 6 fait construire :
 * un carré est un rectangle ET un losange, donc on le teste en premier ; et
 * tous trois sont des parallélogrammes, ce que la valeur `estPara` conserve.
 */
export function nature(q) {
  const para = estParallelogramme(q);
  const [A, B, C, D] = q;
  const [ab, bc] = longueurs(q);
  const droit = Math.abs(angleAt(D, A, B) - 90) <= TOL_ANGLE;
  const consecutifsEgaux = Math.abs(ab - bc) <= TOL_LONG;

  if (!para) {
    // Un seul couple parallèle : c'est un trapèze, la figure la plus
    // couramment confondue avec le parallélogramme.
    const trapeze = sontParalleles(A, B, D, C) || sontParalleles(A, D, B, C);
    return { estPara: false, id: trapeze ? 'trapeze' : 'quadrilatere', label: trapeze ? 'trapèze' : 'quadrilatère quelconque', droit, consecutifsEgaux };
  }
  if (droit && consecutifsEgaux) return { estPara: true, id: 'carre', label: 'carré', droit, consecutifsEgaux };
  if (droit) return { estPara: true, id: 'rectangle', label: 'rectangle', droit, consecutifsEgaux };
  if (consecutifsEgaux) return { estPara: true, id: 'losange', label: 'losange', droit, consecutifsEgaux };
  return { estPara: true, id: 'parallelogramme', label: 'parallélogramme', droit, consecutifsEgaux };
}

/* ── L'aire ────────────────────────────────────────────────────────────── */

/**
 * L'aire, la base et la hauteur d'un parallélogramme, relatives au côté [AB].
 *
 * `aire` est calculée par la formule du polygone (donc vraie pour toute
 * figure), et `base × hauteur` est calculé séparément : le module 7 les
 * affiche CÔTE À CÔTE pendant le cisaillement pour que l'élève constate
 * qu'ils coïncident — et que le côté oblique, lui, s'allonge sans que l'aire
 * bouge. C'est la misconception « aire = base × côté » détruite par le geste.
 */
export function etatAire(q) {
  const [A, B, , D] = q;
  const hauteur = distToLine(D, A, B);
  const base = dist(A, B);
  return {
    base,
    hauteur,
    pied: footOnLine(D, A, B),
    cote: dist(A, D),
    aire: polygonArea(q),
    produit: base * hauteur,
  };
}

/* ── Affichage ─────────────────────────────────────────────────────────── */

/**
 * Une longueur de figure, exprimée en centimètres « de la feuille ».
 *
 * ÉCHELLE UNIQUE : 40 unités de viewBox = 1 cm. Toutes les mesures affichées
 * par la leçon passent par ici, si bien qu'aucun nombre ne peut contredire un
 * autre — et que les aires, en cm², restent des nombres que l'élève de 5e
 * peut lire.
 */
export const UNITES_PAR_CM = 40;

export const enCm = (u, n = 1) => round(u / UNITES_PAR_CM, n);

/** Le même nombre, à la française (virgule décimale). */
export const cm = (u, n = 1) => String(enCm(u, n)).replace('.', ',');

/** Une aire en cm², depuis une aire en unités de figure. */
export const cm2 = (u, n = 1) =>
  String(round(u / (UNITES_PAR_CM * UNITES_PAR_CM), n)).replace('.', ',');

/* ── Configurations fixes ──────────────────────────────────────────────── */

/**
 * Les trois triangles de départ du module 2 : trois fois « A, B, C posés,
 * place D ». Ils sont FIXES et non tirés au hasard — la manipulation doit
 * être déterministe pour que l'aide, les tests et la progression soient
 * reproductibles (§28).
 *
 * Ils sont choisis pour que la quatrième place tombe dans trois directions
 * différentes : en haut à droite, en bas à droite, puis très obliquement —
 * de quoi empêcher un élève de placer D « au même endroit que la dernière
 * fois ».
 */
export const DEPARTS_M2 = [
  { id: 'd1', A: { x: 190, y: 380 }, B: { x: 520, y: 380 }, C: { x: 610, y: 180 } },
  { id: 'd2', A: { x: 200, y: 170 }, B: { x: 540, y: 220 }, C: { x: 470, y: 400 } },
  { id: 'd3', A: { x: 260, y: 400 }, B: { x: 430, y: 190 }, C: { x: 660, y: 260 } },
];
