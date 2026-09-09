import {
  vec, add, dist, midpoint, normalize, cross, lineThrough, areParallel,
  sideLengths, oppositeSidesParallel, oppositeSidesEqual, diagonalLengths,
  interiorAngles, polygonArea,
} from '../../../../../common/utils/geometry2d';

/**
 * Noyau mathématique de « Parallélogrammes et translations » (4e).
 *
 * ─── LA FIGURE NE MENT JAMAIS ─────────────────────────────────────────
 * Tout ce que la leçon affirme est MESURÉ sur les quatre points dessinés :
 * les parallélismes, les longueurs, les diagonales et leur milieu commun,
 * l'aire. Aucune propriété n'est écrite en dur à côté d'un dessin
 * approximatif. C'est ce qui garantit qu'un élève qui traîne un sommet voit
 * les témoins s'éteindre pour de vrai, et que la leçon ne peut pas être
 * démentie par sa propre figure (INTERACTION_PEDAGOGY §28bis).
 *
 * ─── CE QUE LA 4e APPORTE, ET SA FRONTIÈRE ────────────────────────────
 * Objet officiel `parallelogrammes_translations`, périmètre de 4e :
 *     include — « lien entre translation et parallélogramme ».
 *     exclude — LES VECTEURS.
 * La 3e ajoutera le vecteur, sa notation, ses coordonnées et la relation de
 * Chasles. Ce noyau n'expose donc AUCUNE fonction vectorielle nommée comme
 * telle : le déplacement s'appelle un GLISSEMENT et se décrit par une
 * longueur, une direction et un sens — les trois caractères vus dans la
 * leçon sœur `transformations-4e`. `assertScope4e` lève si on demande le
 * vecteur, Chasles ou des coordonnées de vecteur.
 *
 * Ce n'est pas de la pudeur de vocabulaire : `{ dx, dy }` est de l'arithmétique
 * de translation, que la 4e pratique légitimement ; l'objet « vecteur », sa
 * flèche, l'égalité de deux d'entre eux et sa relation de Chasles sont une
 * couche conceptuelle de 3e qu'un élève de 4e n'a pas les moyens de recevoir.
 * (La notation fléchée elle-même n'est pas écrite ici : un test balaye la
 * leçon à sa recherche, et une garde qui viole sa propre règle ne tient pas.)
 *
 * ─── CE QUE LA 5e A DÉJÀ FAIT, ET POURQUOI ON NE LE REFAIT PAS ────────
 * `parallelogrammes-5e` construit le quatrième sommet par le MILIEU COMMUN
 * des diagonales : dans ABCD les diagonales sont [AC] et [BD], donc C est le
 * symétrique de A par rapport au milieu de [BD].
 * Cette leçon-ci le construit par le GLISSEMENT : le déplacement qui mène A
 * à D, appliqué à B. Les deux points coïncident — un test le prouve — mais
 * le geste, la justification et ce qu'ils autorisent ensuite diffèrent. On
 * n'importe donc RIEN de la leçon de 5e (§6ter.6 : jamais d'import entre
 * dossiers de leçons) : l'idée est réécrite, adaptée au geste de 4e.
 *
 * ─── L'ORDRE DES SOMMETS EST UNE MATHÉMATIQUE, PAS UNE CONVENTION ─────
 * Un quadrilatère est TOUJOURS donné dans l'ordre de son contour : ABCD veut
 * dire : A puis B puis C puis D, et on referme sur A. Relier A, B, D, C dans
 * cet ordre traverse la figure et fabrique un quadrilatère croisé : c'est
 * l'erreur n°1 de la leçon, et
 * `estCroise` la détecte pour que la figure puisse la MONTRER au lieu de
 * l'interdire.
 */

/* ══ Écritures ════════════════════════════════════════════════════════ */

/** Arrondi d'affichage et de comparaison. */
export const arrondi = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

/** Format français : virgule décimale. */
export const fr = (x, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }) : '—';

/* ══ Tolérances ═══════════════════════════════════════════════════════
   Elles sont SOUS ce que l'élève voit à la taille de rendu (§28bis : une
   tolérance plus large que l'œil enseigne qu'« à peu près » suffit). Le
   cadre de `ConstructeurLab` fait environ 620 unités de viewBox pour ~620 px
   sur un écran de bureau : une unité vaut donc à peu près un pixel, et
   6 unités d'écart sur un côté de 200 se voient nettement. */

/** Écart d'angle, en degrés, sous lequel deux droites sont dites parallèles. */
export const TOL_ANGLE = 2.2;
/** Écart de longueur, en unités de figure, sous lequel deux côtés sont dits égaux. */
export const TOL_LONG = 6;
/** Rayon d'acceptation du défi « replace le sommet », en unités de figure. */
export const TOL_DEFI = 18;

/* ══ Le glissement — un déplacement, pas un vecteur ═══════════════════ */

/**
 * LE GLISSEMENT QUI MÈNE A À A'.
 *
 * Décrit par ce que l'élève de 4e peut lire sur la figure : de combien on va
 * à droite, de combien on descend, quelle longueur ce trajet fait, et dans
 * quelle direction il pointe. Rien de plus. Ce n'est PAS un vecteur : il n'a
 * ni notation fléchée, ni somme, ni relation de Chasles — ces trois choses
 * sont ce qui distingue l'objet de 3e du calcul de 4e.
 *
 * `directionDeg` est ramenée dans [0 ; 180[ : deux trajets opposés ont la
 * même DIRECTION (ils sont portés par des droites parallèles) mais des SENS
 * contraires, et la leçon a besoin de distinguer les deux — c'est
 * exactement ce qui sépare le parallélogramme ABCD du croisé ABDC.
 */
export function glissementEntre(A, Aprime) {
  const dx = Aprime.x - A.x;
  const dy = Aprime.y - A.y;
  const longueur = Math.hypot(dx, dy);
  let directionDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  directionDeg = ((directionDeg % 180) + 180) % 180;
  return { dx, dy, longueur, directionDeg };
}

/** L'image d'un point par le glissement : le point d'arrivée du même trajet. */
export const glisser = (P, g) => ({ x: P.x + g.dx, y: P.y + g.dy });

/** L'image d'une figure entière — chaque sommet fait le MÊME trajet. */
export const glisserFigure = (pts, g) => pts.map((p) => glisser(p, g));

/**
 * Deux glissements sont-ils LE MÊME ?
 *
 * C'est la question centrale du module 2 : « le trajet de A vers D et celui
 * de B vers C, est-ce le même déplacement ? ». La réponse porte sur les deux
 * composantes à la fois — même direction ET même sens ET même longueur —
 * donc on compare simplement dx et dy. Une comparaison sur la seule longueur
 * laisserait passer deux trajets opposés, qui font justement le quadrilatère
 * croisé que la leçon veut faire rejeter.
 */
export const memeGlissement = (g1, g2, tol = TOL_LONG) =>
  Math.hypot(g1.dx - g2.dx, g1.dy - g2.dy) <= tol;

/**
 * L'écart entre deux glissements, décomposé pour l'affichage : ce qui manque
 * en longueur, et ce qui manque en direction. Un retour qui NOMME l'écart
 * restant (« il s'en faut de 14° ») vaut mieux qu'une lampe éteinte.
 */
export function ecartGlissements(g1, g2) {
  const brut = Math.abs(g1.directionDeg - g2.directionDeg);
  return {
    longueur: Math.abs(g1.longueur - g2.longueur),
    direction: Math.min(brut, 180 - brut),
    // Le SENS : deux trajets de même direction peuvent aller à l'opposé.
    memeSens: g1.dx * g2.dx + g1.dy * g2.dy >= 0,
    distance: Math.hypot(g1.dx - g2.dx, g1.dy - g2.dy),
  };
}

/* ══ Le quatrième sommet ══════════════════════════════════════════════ */

/**
 * LE QUATRIÈME SOMMET, PAR LE GLISSEMENT.
 *
 * On cherche C tel que ABCD soit un parallélogramme (dans l'ordre du
 * contour A, B, C, D). Le geste de 4e : le glissement qui mène A à D est
 * appliqué à B, et C est là où B arrive.
 *
 * Pourquoi ça marche, et c'est toute la leçon : [AD] et [BC] deviennent les
 * deux trajets d'un même glissement, donc ils sont parallèles et de même
 * longueur — et un quadrilatère dont deux côtés opposés sont parallèles et
 * de même longueur est un parallélogramme.
 *
 * Le geste de 5e (C symétrique de A par rapport au milieu de [BD]) donne le
 * MÊME point ; `quatriemeSommetParMilieu` l'implémente et un test vérifie la
 * coïncidence. Deux chemins, une seule figure : c'est ce que le module 1
 * fait constater.
 */
export function quatriemeSommet(A, B, D) {
  return glisser(B, glissementEntre(A, D));
}

/**
 * Le même point, par le geste de 5e — le milieu commun des diagonales.
 *
 * Présent UNIQUEMENT pour que le test puisse prouver que les deux
 * constructions coïncident ; aucun module ne l'utilise pour construire.
 *
 * ATTENTION, ce point a coûté un bug : dans ABCD, les diagonales sont [AC]
 * et [BD] — PAS [AD]. Le milieu commun est donc celui de [BD], et C est le
 * symétrique de A par rapport à lui. Une première version prenait le milieu
 * de [AD] et renvoyait un point à 360 unités du bon ; le test « les deux
 * gestes donnent le même point » l'a attrapé immédiatement. C'est
 * exactement pourquoi la leçon garde les deux constructions côte à côte.
 */
export function quatriemeSommetParMilieu(A, B, D) {
  const O = midpoint(B, D);
  return { x: 2 * O.x - A.x, y: 2 * O.y - A.y };
}

/* ══ Ce que le quadrilatère dit de lui-même ═══════════════════════════ */

/** Les quatre côtés, dans l'ordre du contour : [AB], [BC], [CD], [DA]. */
export const cotes = ([A, B, C, D]) => [[A, B], [B, C], [C, D], [D, A]];

/**
 * L'écart de direction entre les DROITES (a,b) et (c,d), en degrés, dans
 * [0 ; 90].
 *
 * On compare des droites, pas des demi-droites : deux côtés opposés d'un
 * quadrilatère sont parcourus en sens contraire par le contour, si bien
 * qu'un angle orienté annoncerait 180° là où l'élève voit deux traits
 * parallèles.
 */
export function ecartDirection(a, b, c, d) {
  const t1 = Math.atan2(b.y - a.y, b.x - a.x);
  const t2 = Math.atan2(d.y - c.y, d.x - c.x);
  let e = ((t1 - t2) * 180) / Math.PI;
  e = ((e % 180) + 180) % 180;
  return e > 90 ? 180 - e : e;
}

/** Les droites (a,b) et (c,d) sont-elles parallèles, à TOL_ANGLE près ? */
export const sontParalleles = (a, b, c, d, tol = TOL_ANGLE) =>
  ecartDirection(a, b, c, d) <= tol;

/**
 * ABCD EST-IL UN PARALLÉLOGRAMME ?
 *
 * La DÉFINITION, et elle seule : les deux paires de côtés opposés sont
 * parallèles — calculée sur les points DESSINÉS par `oppositeSidesParallel`
 * de `geometry2d`, le juge unique du parallélisme dans ce dépôt (il ne
 * compare aucun coefficient directeur : une droite verticale donnerait
 * Infinity).
 *
 * `eps` de `oppositeSidesParallel` est un produit vectoriel de directions
 * UNITAIRES, donc le sinus de l'écart d'angle : on convertit TOL_ANGLE en
 * sinus pour que les deux tolérances de la leçon disent la même chose.
 */
export const estParallelogramme = (q, tolDeg = TOL_ANGLE) =>
  q.length === 4 && oppositeSidesParallel(q, Math.sin((tolDeg * Math.PI) / 180));

/**
 * Le quadrilatère est-il CROISÉ ?
 *
 * L'erreur n°1 de la leçon : relier A, B, D, C au lieu de A, B, C, D. La
 * figure obtenue traverse elle-même, et la leçon doit pouvoir la MONTRER —
 * c'est bien plus convaincant que de l'interdire. On teste si les deux
 * côtés opposés [AB] et [CD] se coupent (ou [BC] et [DA]).
 */
export function estCroise(q) {
  if (q.length !== 4) return false;
  const [A, B, C, D] = q;
  return seCoupent(A, B, C, D) || seCoupent(B, C, D, A);
}

/** Les segments [pq] et [rs] se coupent-ils en un point intérieur aux deux ? */
function seCoupent(p, q, r, s) {
  const d1 = cross(vec(p, q), vec(p, r));
  const d2 = cross(vec(p, q), vec(p, s));
  const d3 = cross(vec(r, s), vec(r, p));
  const d4 = cross(vec(r, s), vec(r, q));
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}

/**
 * L'ÉTAT COMPLET du quadrilatère : ce que la figure DIT d'elle-même.
 *
 * Une seule source de vérité pour les lampes, les codages et la validation
 * d'une étape (§28 : une seule fois, dérivé partout). Chaque témoin porte
 * son ÉCART, pour que le retour puisse le nommer.
 */
export function etatQuad(q) {
  const [A, B, C, D] = q;
  const [ab, bc, cd, da] = sideLengths(q);

  const parAbDc = ecartDirection(A, B, D, C);
  const parAdBc = ecartDirection(A, D, B, C);
  const [ac, bd] = diagonalLengths(q);
  const milieuAC = midpoint(A, C);
  const milieuBD = midpoint(B, D);

  return {
    longueurs: { AB: ab, BC: bc, CD: cd, DA: da },
    angles: interiorAngles(q),
    aire: polygonArea(q),
    diagonales: {
      AC: ac,
      BD: bd,
      milieuAC,
      milieuBD,
      // LE milieu commun : la propriété de 5e, revérifiée ici sur les points.
      ecartMilieux: dist(milieuAC, milieuBD),
      commun: dist(milieuAC, milieuBD) <= TOL_LONG,
    },
    temoins: {
      parAbDc: { ok: parAbDc <= TOL_ANGLE, ecart: parAbDc, label: '(AB) ∥ (DC)', unite: '°' },
      parAdBc: { ok: parAdBc <= TOL_ANGLE, ecart: parAdBc, label: '(AD) ∥ (BC)', unite: '°' },
      egAbDc: { ok: Math.abs(ab - cd) <= TOL_LONG, ecart: Math.abs(ab - cd), label: 'AB = DC', unite: '' },
      egAdBc: { ok: Math.abs(da - bc) <= TOL_LONG, ecart: Math.abs(da - bc), label: 'AD = BC', unite: '' },
    },
    croise: estCroise(q),
    parallelogramme: estParallelogramme(q),
    // Les côtés opposés sont-ils égaux deux à deux ? (propriété de 5e,
    // mesurée ici et non supposée)
    cotesOpposesEgaux: oppositeSidesEqual(q, TOL_LONG / Math.max(...sideLengths(q), 1)),
  };
}

/* ══ Ce que le glissement conserve ════════════════════════════════════ */

/**
 * LES INVARIANTS DU GLISSEMENT, mesurés et non affirmés.
 *
 * On glisse la figure, et on compare TOUT ce qui peut se comparer : les
 * longueurs des côtés, les angles, l'aire, et le parallélisme de deux
 * droites de la figure. Le module 4 affiche le tableau tel quel : chaque
 * ligne est un calcul, pas une promesse.
 *
 * `orientationPreservee` dit que la figure n'a pas été RETOURNÉE (l'aire
 * signée garde son signe). C'est vrai du glissement — et, il faut le dire,
 * du demi-tour de 5e aussi : une symétrie centrale est une rotation d'un
 * demi-tour, elle ne retourne rien. Ce témoin sépare donc le glissement des
 * symétries AXIALES, pas du demi-tour.
 *
 * CE QUI SÉPARE LE GLISSEMENT DU DEMI-TOUR est ailleurs, et c'est
 * `trajets` qui le porte : les trajets d'un glissement sont TOUS le même
 * (parallèles, de même longueur, de même sens) ; ceux d'un demi-tour sont
 * tous différents et concourent au centre. `unSeulGlissement` est donc le
 * vrai discriminant, et c'est lui que le module 4 fait manipuler.
 */
export function invariants(g, pts) {
  const images = glisserFigure(pts, g);
  const avant = sideLengths(pts);
  const apres = sideLengths(images);
  const anglesAvant = interiorAngles(pts);
  const anglesApres = interiorAngles(images);

  const aireSignee = (P) => {
    let s = 0;
    for (let i = 0; i < P.length; i += 1) {
      const a = P[i];
      const b = P[(i + 1) % P.length];
      s += a.x * b.y - b.x * a.y;
    }
    return s / 2;
  };

  return {
    images,
    longueurs: avant.map((l, i) => ({ avant: l, apres: apres[i], egal: Math.abs(l - apres[i]) < 1e-9 })),
    angles: anglesAvant.map((a, i) => ({ avant: a, apres: anglesApres[i], egal: Math.abs(a - anglesApres[i]) < 1e-9 })),
    aire: { avant: polygonArea(pts), apres: polygonArea(images) },
    orientationPreservee: Math.sign(aireSignee(pts)) === Math.sign(aireSignee(images)),
    // Chaque point rejoint son image par le MÊME trajet : c'est la définition
    // même du glissement, et c'est ce que l'élève voit avec les traits.
    trajets: pts.map((p, i) => glissementEntre(p, images[i])),
  };
}

/**
 * Tous les trajets d'une figure vers son image sont-ils le même glissement ?
 * Le test que le module 4 fait passer à l'élève : si un seul point diffère,
 * ce n'est plus un glissement.
 */
export const unSeulGlissement = (pts, images, tol = TOL_LONG) => {
  if (pts.length !== images.length || pts.length === 0) return false;
  const g0 = glissementEntre(pts[0], images[0]);
  return pts.every((p, i) => memeGlissement(g0, glissementEntre(p, images[i]), tol));
};

/* ══ La démonstration, en trois maillons ══════════════════════════════ */

/**
 * LA CHAÎNE D'UNE DÉMONSTRATION RÉDIGÉE : donnée → propriété → conclusion.
 *
 * Ce sont des DONNÉES, pas un texte figé : chaque maillon est un objet avec
 * son rôle. Le module 6 les mélange et fait remettre l'ordre, puis fait
 * repérer le maillon manquant. Une démonstration dont on a retiré la
 * PROPRIÉTÉ est encore lisible et paraît juste : c'est précisément l'erreur
 * que la leçon vise, et il faut donc pouvoir la fabriquer.
 *
 * Les trois situations couvrent les trois usages du programme :
 *   `construction`  — j'ai glissé, donc c'est un parallélogramme (P3) ;
 *   `reconnaissance`— je vois un parallélogramme, donc il y a un glissement (P1) ;
 *   `chainee`       — deux glissements successifs sur la MÊME figure, où la
 *                     conclusion de l'un devient la donnée de l'autre (P4).
 */
export const DEMONSTRATIONS = {
  construction: {
    id: 'construction',
    titre: 'M et N glissent, MM’N’N se ferme',
    enonce:
      'Un même glissement mène M en M’ et N en N’. Montrer que M M’ N’ N est un parallélogramme.',
    maillons: [
      {
        id: 'c-donnee', role: 'donnee', ordre: 1,
        texte: 'Le même glissement mène M en M’ et N en N’.',
      },
      {
        id: 'c-propriete', role: 'propriete', ordre: 2,
        texte:
          'Or un glissement fait faire à tous les points le même trajet : [M M’] et [N N’] sont donc parallèles et de même longueur.',
      },
      {
        id: 'c-conclusion', role: 'conclusion', ordre: 3,
        texte:
          'Donc M M’ N’ N a deux côtés opposés parallèles et de même longueur : c’est un parallélogramme.',
      },
    ],
  },
  reconnaissance: {
    id: 'reconnaissance',
    titre: 'ABCD est un parallélogramme, donc un glissement s’y cache',
    enonce:
      'ABCD est un parallélogramme. Montrer que le glissement qui mène A en D mène aussi B en C.',
    maillons: [
      {
        id: 'r-donnee', role: 'donnee', ordre: 1,
        texte: 'ABCD est un parallélogramme.',
      },
      {
        id: 'r-propriete', role: 'propriete', ordre: 2,
        texte:
          'Or dans un parallélogramme, les côtés opposés [AD] et [BC] sont parallèles et de même longueur, et ils vont dans le même sens.',
      },
      {
        id: 'r-conclusion', role: 'conclusion', ordre: 3,
        texte:
          'Donc le trajet de A vers D et celui de B vers C sont le même glissement : il mène bien B en C.',
      },
    ],
  },
  chainee: {
    id: 'chainee',
    titre: 'Deux glissements, une seule figure',
    enonce:
      'Le glissement g mène A en B, et il mène aussi D en C. Montrer que ABCD est un parallélogramme, puis que AD = BC.',
    maillons: [
      {
        id: 'h-donnee', role: 'donnee', ordre: 1,
        texte: 'Le glissement g mène A en B et D en C.',
      },
      {
        id: 'h-propriete', role: 'propriete', ordre: 2,
        texte:
          'Or [AB] et [DC] sont alors les deux trajets d’un même glissement : ils sont parallèles et de même longueur.',
      },
      {
        id: 'h-conclusion', role: 'conclusion', ordre: 3,
        texte:
          'Donc ABCD est un parallélogramme ; et comme les côtés opposés d’un parallélogramme ont la même longueur, AD = BC.',
      },
    ],
  },
};

/** La chaîne d'une démonstration, dans le bon ordre. */
export function demonstration(nom) {
  const d = DEMONSTRATIONS[nom];
  if (!d) throw new Error(`demonstration : situation inconnue « ${nom} » (attendu : ${Object.keys(DEMONSTRATIONS).join(', ')})`);
  return { ...d, maillons: [...d.maillons].sort((a, b) => a.ordre - b.ordre) };
}

/**
 * Une proposition d'ordre est-elle la bonne ? Renvoie aussi le PREMIER
 * maillon mal placé, pour que le retour puisse le désigner au lieu de dire
 * « faux ».
 */
export function verifierOrdre(nom, ids) {
  const attendu = demonstration(nom).maillons.map((m) => m.id);
  const juste = ids.length === attendu.length && ids.every((id, i) => id === attendu[i]);
  const premierFaux = juste ? null : ids.findIndex((id, i) => id !== attendu[i]);
  return { juste, attendu, premierFaux: premierFaux === -1 ? null : premierFaux };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * L'objet officiel de 4e exclut LES VECTEURS. Cette leçon parle donc de
 * GLISSEMENT (une longueur, une direction, un sens) et jamais de vecteur, de
 * sa notation fléchée, de ses coordonnées ni de la relation de Chasles : ce
 * sont des objets de 3e. Cette fonction existe pour que la frontière soit une
 * ERREUR et non un commentaire qu'on oublie de lire — et un test balaye en
 * plus TOUS les fichiers de la leçon à la recherche du mot interdit.
 */
export function assertScope4e(sujet) {
  const interdits = {
    vecteur: 'le vecteur, sa notation et son égalité sont des objets de 3e',
    chasles: 'la relation de Chasles est un objet de 3e',
    'coordonnees-vecteur': 'les coordonnées d’un vecteur sont un objet de 3e',
    composition: 'composer deux translations est un objet de 3e',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/**
 * Le cadre de référence et les trois points de départ du module 1.
 *
 * Ils sont choisis pour que le parallélogramme initial soit franchement
 * OBLIQUE : un premier dessin presque rectangle laisserait croire que la
 * leçon parle de rectangles, et l'élève chercherait des angles droits là où
 * il n'y en a pas.
 */
export const CADRE = { largeur: 620, hauteur: 460 };
export const A_DEFAUT = { x: 150, y: 330 };
export const B_DEFAUT = { x: 330, y: 350 };
export const D_DEFAUT = { x: 250, y: 160 };

/** Le pas de la grille sur laquelle les sommets s'aimantent. */
export const PAS_GRILLE = 20;

/** Le nœud de grille le plus proche, borné au cadre avec une marge. */
export function surLaGrille(p, pas = PAS_GRILLE, marge = 40) {
  const clamp = (v, max) => Math.max(marge, Math.min(max - marge, v));
  return {
    x: clamp(Math.round(p.x / pas) * pas, CADRE.largeur),
    y: clamp(Math.round(p.y / pas) * pas, CADRE.hauteur),
  };
}

/**
 * LES CONFIGURATIONS DU DÉFI (module 3), toutes sur la grille.
 *
 * Chacune doit être ATTEIGNABLE : le sommet caché tombe exactement sur un
 * nœud de la grille, sinon l'élève ne pourrait jamais poser son point au bon
 * endroit et la manipulation serait infaisable (règle « cible atteignable
 * sur la grille » du dépôt). Un test le vérifie pour chaque configuration.
 */
export const DEFIS = [
  // Les trois TRAJETS sont volontairement très différents — (80 ; −160),
  // (180 ; −60) et (20 ; −180), soit des directions de 117°, 162° et 96°.
  // Une première version les avait tous égaux à (80 ; −160) : l'élève aurait
  // reporté trois fois le même déplacement, et la promesse du module (« deux
  // réussites, ce n'est plus de la chance ») aurait été creuse. C'est un test
  // de `parcours.test.js` qui l'a attrapé.
  { id: 'd1', A: { x: 140, y: 340 }, B: { x: 320, y: 360 }, D: { x: 220, y: 180 }, cache: 'C' },
  { id: 'd2', A: { x: 160, y: 300 }, B: { x: 300, y: 340 }, D: { x: 340, y: 240 }, cache: 'C' },
  { id: 'd3', A: { x: 180, y: 380 }, B: { x: 340, y: 320 }, D: { x: 200, y: 200 }, cache: 'C' },
];

/**
 * La figure entière du module 4 : un drapeau, volontairement DISSYMÉTRIQUE.
 *
 * Une figure symétrique glisserait « pareil » qu'elle tourne ou non ; celle-ci
 * révèle immédiatement une rotation ou un retournement, ce qui permet à la
 * leçon de distinguer le glissement du demi-tour de 5e sans le dire.
 */
export const DRAPEAU = [
  { x: 120, y: 340 }, { x: 120, y: 200 }, { x: 220, y: 240 }, { x: 170, y: 280 }, { x: 190, y: 340 },
];

/** Le glissement proposé au module 4, sur la grille lui aussi. */
export const GLISSEMENT_DEFAUT = { dx: 220, dy: 60 };

/* ── Réexports utiles aux composants (une seule source pour geometry2d) ── */
export { dist, midpoint, vec, add, normalize, areParallel, lineThrough, sideLengths, diagonalLengths, polygonArea };
