/**
 * Noyau mathématique de « Triangles : démontrer » (4e).
 *
 * ─── LA FIGURE NE MENT JAMAIS ─────────────────────────────────────────
 * Tout ce que la leçon affirme est MESURÉ sur les points dessinés : le centre
 * du cercle circonscrit, son rayon, l'angle en chaque sommet, le parallélisme
 * de la droite des milieux, le rapport des longueurs. Aucune valeur n'est
 * écrite à la main, aucune n'est « corrigée » pour tomber juste. C'est ce qui
 * garantit qu'un élève qui traîne un sommet voit des nombres exacts, et que la
 * leçon ne peut pas être démentie par sa propre figure
 * (INTERACTION_PEDAGOGY §28bis).
 *
 * ─── RIEN N'EST RÉIMPLÉMENTÉ ──────────────────────────────────────────
 * `circumcenter`, `triangleAngles`, `dist` et `midpoint` viennent de
 * `common/geo5e/geo5e.js` ; `lineThrough`, `areParallel` et `angleBetweenDeg`
 * de `common/utils/geometry2d.js`. Ce fichier n'ajoute que ce qui est
 * PROPRE à la 4e : la caractérisation par le cercle circonscrit, la droite des
 * milieux et sa réciproque, et la grammaire propriété / réciproque.
 *
 * ─── CE QUE LA 4e APPORTE, ET SA FRONTIÈRE ────────────────────────────
 * Objet officiel `triangles`, périmètre de 4e :
 *     include — cercle circonscrit du triangle rectangle, droite des milieux,
 *               propriété vs réciproque, rédaction d'une démonstration.
 *     exclude — Thalès, trigonométrie (3e) ; et le théorème de Pythagore
 *               lui-même, qui est l'objet de la leçon SŒUR `pythagore-4e`.
 * `assertScope4e` lève sur ces trois sujets : la frontière est EXÉCUTABLE, pas
 * commentée.
 *
 * ─── POURQUOI LES FAITS SONT RENVOYÉS, PAS LES CONCLUSIONS ────────────
 * `droiteDesMilieux` ne renvoie pas « c'est parallèle » : elle renvoie l'ANGLE
 * entre (IJ) et (BC) et le RAPPORT IJ / BC. C'est l'élève — puis les tests —
 * qui lisent dans ces deux nombres la propriété. Une fonction qui renverrait
 * `parallele: true` sans le nombre qui le justifie ferait exactement ce que la
 * leçon reproche : conclure sans preuve.
 */
import { dist, midpoint, circumcenter, triangleAngles } from '../../../../../common/geo5e/geo5e';
import { lineThrough, areParallel, angleBetweenDeg } from '../../../../../common/utils/geometry2d';

/* ══ Affichage ════════════════════════════════════════════════════════ */

/** Arrondi d'affichage et de comparaison. */
export const arrondi = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

/**
 * Format français : virgule décimale, avec un nombre de décimales FIXE.
 *
 * DÉFAUT ATTRAPÉ AU NAVIGATEUR. Une première version ne passait que
 * `maximumFractionDigits` : le rapport IJ ÷ BC s'affichait « 0,5 » et l'angle
 * « 0° ». Or les modules et la carte des connaissances promettent « 0,50 » et
 * « 0,0° » — l'élève qui compare la consigne à l'écran lisait deux nombres
 * différents. Pire, une colonne de relevés dont les décimales apparaissent et
 * disparaissent ne se lit plus comme une constante : c'était précisément la
 * chose que le module 3 demande de VOIR.
 *
 * Le minimum est donc épinglé au maximum : la précision affichée est celle
 * qu'on annonce, toujours.
 */
export const fr = (x, d = 1) =>
  (Number.isFinite(x)
    ? x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '—');

export { dist, midpoint };

/* ══ Le triangle et ses angles ════════════════════════════════════════ */

/** Les trois angles du triangle, en degrés, nommés par leur sommet. */
export function angles({ A, B, C }) {
  const [a, b, c] = triangleAngles([A, B, C]);
  return { A: a, B: b, C: c };
}

/**
 * L'angle au sommet demandé est-il droit, à la tolérance donnée ?
 *
 * L'angle est MESURÉ. Le triangle n'est jamais corrigé pour que l'angle
 * tombe juste : c'est l'élève qui vise, et la tolérance dit à quel point il a
 * le droit d'être imprécis. Elle est volontairement LARGE (1,2°) par rapport à
 * ce que l'élève voit, pour qu'un pixel de trop ne lui refuse pas une cible
 * qu'il a visiblement atteinte (règle « tolérance < ce que l'élève voit »).
 */
export function estRectangleEn(T, sommet = 'C', tol = TOL_ANGLE) {
  const a = angles(T);
  if (!(sommet in a)) throw new Error(`estRectangleEn : sommet inconnu « ${sommet} »`);
  return Math.abs(a[sommet] - 90) <= tol;
}

/** Le triangle est-il dégénéré (trois points alignés ou confondus) ? */
export function estDegenere({ A, B, C }, eps = 1e-6) {
  const aire = Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)) / 2;
  return aire < eps;
}

/* ══ P1 — Le cercle circonscrit ═══════════════════════════════════════ */

/**
 * La TOLÉRANCE d'angle de toute la leçon, en degrés.
 *
 * Volontairement LARGE par rapport à ce que l'élève voit : à 620 unités de
 * cadre, 1,2° de jeu représente environ trois pixels sur la poignée. La règle
 * du dépôt est « tolérance < ce que l'élève voit » — une cible qu'il a
 * visiblement atteinte ne doit jamais lui être refusée.
 */
export const TOL_ANGLE = 1.2;

/**
 * L'ÉCART DE CENTRE ÉQUIVALENT À LA TOLÉRANCE D'ANGLE — et pourquoi il se
 * CALCULE au lieu d'être choisi.
 *
 * DÉFAUT RÉEL, ATTRAPÉ PAR LE TEST DE COÏNCIDENCE. Une première version fixait
 * deux seuils indépendants : 1,2° pour l'angle, et « 2 % de AB » pour l'écart
 * du centre au milieu. À C = (280, 180) l'angle valait 88,68° — donc « aigu »
 * pour le premier seuil — pendant que le second déclarait le centre posé sur le
 * milieu. Le lab aurait montré à l'élève un centre arrivé à destination sous un
 * angle annoncé faux : exactement le mensonge de figure que la leçon combat.
 *
 * La trigonométrie du cercle inscrit donne la relation exacte :
 *
 *     écart(O, milieu de [AB])  =  (AB / 2) × |cotangente(angle en C)|
 *
 * (elle vaut pour tout C, puisque le rayon est AB / (2 sin C)). Le seuil
 * d'écart est donc DÉRIVÉ du seuil d'angle, et les deux verdicts basculent
 * ensemble par construction. C'est ce que le test « les deux verdicts
 * s'allument ensemble » vérifie maintenant sur tout un balayage du demi-plan.
 *
 * Note : cette relation n'est pas enseignée à l'élève (la cotangente est
 * hors programme) — elle sert uniquement à faire coïncider deux seuils
 * internes. Le calcul reste dans le noyau, aucun module ne l'affiche.
 */
export const ecartCentreEquivalent = (ab, tolAngle = TOL_ANGLE) =>
  (ab / 2) * Math.abs(1 / Math.tan(((90 - tolAngle) * Math.PI) / 180));

/**
 * LE CERCLE CIRCONSCRIT, ET LE NOMBRE QUI FAIT VOIR LA PROPRIÉTÉ.
 *
 * Le centre est calculé par `circumcenter` (intersection de deux médiatrices —
 * l'acquis de 5e). Le rayon est mesuré sur les TROIS sommets, et
 * `rayonsEgaux` vérifie qu'ils tombent bien à la même distance : sans ce
 * contrôle, une erreur numérique passerait inaperçue et la figure mentirait.
 *
 * `ecartAuMilieu` est la clé pédagogique. La leçon affirme « quand l'angle en C
 * est droit, le centre est le milieu de [AB] ». Cette affirmation devient une
 * CIBLE VISABLE parce que l'écart est un nombre affiché en continu, qui tombe à
 * zéro. L'élève ne subit pas la propriété : il la vise.
 *
 * Renvoie `null` pour un triangle dégénéré — trois points alignés n'ont pas de
 * cercle circonscrit, et la leçon doit pouvoir le dire au lieu de dessiner un
 * cercle de rayon infini.
 */
export function cercleCirconscrit(A, B, C, tolAngle = TOL_ANGLE) {
  if (estDegenere({ A, B, C })) return null;
  const centre = circumcenter([A, B, C]);
  if (!centre) return null;
  const rA = dist(centre, A);
  const rB = dist(centre, B);
  const rC = dist(centre, C);
  const rayon = (rA + rB + rC) / 3;
  const mAB = midpoint(A, B);
  const ecartAuMilieu = dist(centre, mAB);
  return {
    centre,
    rayon,
    rayons: { A: rA, B: rB, C: rC },
    // Le contrôle interne : les trois sommets sont-ils VRAIMENT équidistants ?
    rayonsEgaux: Math.max(rA, rB, rC) - Math.min(rA, rB, rC) < 1e-6 * Math.max(1, rayon),
    milieuAB: mAB,
    ecartAuMilieu,
    // Le centre est-il posé sur le milieu de [AB] ? Le seuil est DÉRIVÉ de la
    // tolérance d'angle (voir `ecartCentreEquivalent`) : les deux verdicts de
    // la caractérisation basculent alors exactement ensemble.
    seuilEcart: ecartCentreEquivalent(dist(A, B), tolAngle),
    centreEstMilieuAB: ecartAuMilieu <= ecartCentreEquivalent(dist(A, B), tolAngle),
    // [AB] est-il un diamètre ? C'est la même chose, dite avec le mot du cours,
    // et le seuil vient de la même dérivation.
    abEstDiametre: Math.abs(2 * rayon - dist(A, B))
      <= 2 * ecartCentreEquivalent(dist(A, B), tolAngle),
  };
}

/**
 * LA CARACTÉRISATION, DANS SES DEUX SENS.
 *
 * Une caractérisation n'est pas une propriété : c'est une propriété DONT LA
 * RÉCIPROQUE EST AUSSI VRAIE. On renvoie donc les deux verdicts séparément —
 * « l'angle est droit » et « le centre est sur le milieu » — pour que la leçon
 * puisse montrer qu'ils s'allument et s'éteignent ENSEMBLE, ce qui est
 * exactement ce que le mot « caractérisation » veut dire.
 */
export function caracterisationRectangle(A, B, C, tol = TOL_ANGLE) {
  const cercle = cercleCirconscrit(A, B, C, tol);
  const angleC = angles({ A, B, C }).C;
  const droit = Math.abs(angleC - 90) <= tol;
  return {
    angleC,
    droit,
    cercle,
    centreSurMilieu: cercle ? cercle.centreEstMilieuAB : false,
    // Les deux verdicts coïncident-ils ? La leçon l'affirme ; le test le
    // vérifie sur tout un balayage de positions.
    coincident: cercle ? droit === cercle.centreEstMilieuAB : false,
    nature: droit ? 'droit' : angleC > 90 ? 'obtus' : 'aigu',
  };
}

/**
 * La MÉDIANE relative à [AB] : le segment qui joint C au milieu de [AB].
 *
 * Dans un triangle rectangle en C, elle vaut la MOITIÉ de [AB] — parce que
 * c'est un rayon du cercle circonscrit dont [AB] est le diamètre. C'est la même
 * propriété que la précédente, vue avec des longueurs au lieu d'un centre :
 * la leçon peut donc l'offrir comme deuxième lecture, sans rien ajouter.
 *
 * DEUXIÈME DÉFAUT ATTRAPÉ PAR LES TESTS : le seuil de « c'est la moitié » ne
 * peut pas non plus être choisi au jugé. La longueur de la médiane vaut
 * (AB / 2) / sin(C) : elle est BEAUCOUP moins sensible à l'angle que la
 * position du centre. Avec un seuil de 2 % de AB, un triangle à 80° — que
 * personne ne prendrait pour un triangle rectangle — passait pour « la
 * moitié ». Le seuil est donc dérivé lui aussi de la tolérance d'angle :
 *
 *     |CM − AB/2|  =  (AB / 2) × (1 / sin C − 1)
 *
 * évaluée à la tolérance. Les trois lectures de la même propriété — angle,
 * centre, médiane — basculent alors au même endroit.
 */
export const ecartMedianeEquivalent = (ab, tolAngle = TOL_ANGLE) =>
  (ab / 2) * (1 / Math.sin(((90 - tolAngle) * Math.PI) / 180) - 1);

export function medianeVersAB(A, B, C, tolAngle = TOL_ANGLE) {
  const M = midpoint(A, B);
  const longueur = dist(C, M);
  const ab = dist(A, B);
  return {
    milieu: M,
    longueur,
    demiAB: ab / 2,
    rapport: ab === 0 ? null : longueur / ab,
    seuilEcart: ecartMedianeEquivalent(ab, tolAngle),
    estLaMoitie: Math.abs(longueur - ab / 2) <= ecartMedianeEquivalent(ab, tolAngle),
  };
}

/* ══ P2 — La droite des milieux ═══════════════════════════════════════ */

/**
 * LA DROITE DES MILIEUX — les milieux, ET LES DEUX FAITS MESURÉS.
 *
 * I est le milieu de [AB], J celui de [AC]. La leçon affirme deux choses :
 * (IJ) est parallèle à (BC), et IJ vaut la moitié de BC. Aucune des deux n'est
 * écrite ici : on renvoie l'ANGLE entre les deux droites (0° si parallèles) et
 * le RAPPORT des longueurs. Ce sont ces deux nombres que l'élève relève sur
 * plusieurs triangles, et c'est de leur constance qu'il tire la propriété.
 *
 * Le parallélisme est décidé par `areParallel` (la fonction partagée), pas par
 * une comparaison d'angle maison : décision et affichage restent séparés, comme
 * l'exige geometry2d.
 */
export function droiteDesMilieux(A, B, C) {
  if (estDegenere({ A, B, C })) {
    throw new Error('droiteDesMilieux : les trois points sont alignés — il n’y a pas de triangle');
  }
  const I = midpoint(A, B);
  const J = midpoint(A, C);
  const ij = lineThrough(I, J);
  const bc = lineThrough(B, C);
  const longIJ = dist(I, J);
  const longBC = dist(B, C);
  return {
    I,
    J,
    // LES FAITS, mesurés :
    angleAvecBC: angleBetweenDeg(ij, bc),
    parallele: areParallel(ij, bc),
    longIJ,
    longBC,
    rapport: longBC === 0 ? null : longIJ / longBC,
    estLaMoitie: Math.abs(longIJ - longBC / 2) < longBC * 0.01,
  };
}

/**
 * LA TOLÉRANCE DE PARALLÉLISME, en degrés — et pourquoi `areParallel` ne
 * suffit PAS ici.
 *
 * DÉFAUT RÉEL, ATTRAPÉ PAR LE TEST D'ATTEIGNABILITÉ. `areParallel` de
 * geometry2d travaille à eps = 1e-6 : c'est la bonne valeur pour DÉCIDER d'un
 * parallélisme dans un calcul, et c'est pourquoi le sens direct
 * (`droiteDesMilieux`) s'en contente — I et J y sont des milieux EXACTS, le
 * parallélisme y est exact au flottant près.
 *
 * Mais au module 4, l'élève FAIT GLISSER un point : la zone gagnante était
 * réduite au seul t = 0,5 mathématique, donc inatteignable au doigt comme au
 * clavier. À t = 0,49 l'angle affiché vaut 0,7° — l'élève lit « 0,7° », voit
 * deux traits qu'il croit parallèles, et le lab lui refuse la victoire.
 *
 * La tolérance de la manipulation est donc explicite et LARGE devant ce que
 * l'élève voit : 0,8°, soit environ un pixel d'écart sur toute la longueur du
 * segment. Elle reste bien plus fine que l'écart des positions voisines que le
 * module fait essayer (0,42 donne 6,4°), donc « ça ne marche qu'au milieu »
 * reste vrai — c'est ce que vérifie `parcours.test.js`.
 */
export const TOL_PARALLELE = 0.8;

/**
 * LA RÉCIPROQUE, MISE À L'ÉPREUVE.
 *
 * On part de I, milieu de [AB], et d'un point K sur [AC] au paramètre t
 * (t = 0 en A, t = 1 en C). La réciproque dit : si (IK) est parallèle à (BC),
 * alors K est le milieu de [AC]. La fonction ne conclut pas — elle renvoie le
 * paramètre, le parallélisme MESURÉ et le rapport, de sorte qu'un t voisin de
 * 1/2 (0,42 par exemple) donne une droite VISIBLEMENT non parallèle.
 *
 * C'est ce qui permet au module 4 de faire chercher : l'élève glisse K, et le
 * parallélisme n'apparaît qu'à un seul endroit. La réciproque n'est pas un
 * énoncé qu'on récite, c'est une position qu'on trouve.
 */
export function reciproqueMilieux(A, B, C, t, tolParallele = TOL_PARALLELE) {
  if (!(t >= 0 && t <= 1)) throw new Error('reciproqueMilieux : t doit être dans [0 ; 1]');
  if (estDegenere({ A, B, C })) {
    throw new Error('reciproqueMilieux : les trois points sont alignés — il n’y a pas de triangle');
  }
  const I = midpoint(A, B);
  const K = { x: A.x + (C.x - A.x) * t, y: A.y + (C.y - A.y) * t };
  const longIK = dist(I, K);
  const longBC = dist(B, C);
  // (IK) n'existe pas quand K est confondu avec I — impossible ici puisque I
  // est sur [AB] et K sur [AC], sauf triangle dégénéré, déjà écarté.
  const ik = lineThrough(I, K);
  const bc = lineThrough(B, C);
  const angleAvecBC = angleBetweenDeg(ik, bc);
  return {
    t,
    I,
    K,
    angleAvecBC,
    // La décision se prend sur l'angle AFFICHÉ, à la tolérance de la
    // manipulation — voir `TOL_PARALLELE`. `areParallel` reste la référence
    // pour le sens direct, où rien ne se glisse.
    parallele: angleAvecBC <= tolParallele,
    longIK,
    longBC,
    rapport: longBC === 0 ? null : longIK / longBC,
    /* La conclusion de la réciproque : K EST-IL le milieu ?
       DÉFAUT ATTRAPÉ PAR LE TEST DE COÏNCIDENCE. Une version antérieure
       comparait `t` à 0,5 avec un seuil FIXE de 0,012. Or la largeur de la zone
       de parallélisme dépend de la FORME du triangle : sur celui du module 4
       elle vaut ±0,0108, et un seuil fixe de 0,012 faisait afficher « K n'est
       pas le milieu » à côté de « parallèles » — une contradiction visible.
       Le seuil se DÉRIVE donc du même angle : les deux verdicts ne sont plus
       deux mesures qui doivent se rejoindre, mais deux lectures d'une seule.
       C'est d'ailleurs la mathématique de la réciproque elle-même : le
       parallélisme et le fait que K soit le milieu sont le MÊME fait. */
    tEstMilieu: angleAvecBC <= tolParallele,
  };
}

/* ══ P3 — Définition, propriété, caractérisation ══════════════════════ */

/**
 * LA GRAMMAIRE DES ÉNONCÉS — l'objet du P3, en données.
 *
 * Trois statuts, et un seul critère pour les distinguer :
 *
 *   définition       — l'énoncé DIT ce qu'est l'objet. Il n'y a rien à
 *                      démontrer, et « la réciproque » n'a pas de sens : les
 *                      deux membres sont la même chose par convention.
 *   propriété        — un chemin à sens unique : de l'hypothèse vers la
 *                      conclusion. Sa réciproque est une AUTRE affirmation, qui
 *                      peut être vraie ou fausse, et qu'il faut vérifier à part.
 *   caractérisation  — une propriété dont la réciproque est vraie aussi. Les
 *                      deux affirmations sont alors interchangeables, et on peut
 *                      écrire « si et seulement si ».
 *
 * `reciproqueVraie` n'est renseigné que pour une propriété ou une
 * caractérisation : pour une définition, il vaut `null`, et l'interface doit
 * afficher « sans objet » plutôt que « faux ».
 */
const ENONCES = {
  'def-hypotenuse': {
    texte: 'Dans un triangle rectangle, l’hypoténuse est le côté opposé à l’angle droit.',
    statut: 'definition',
    reciproqueVraie: null,
    pourquoi: 'C’est le NOM qu’on donne à ce côté. Rien n’est démontré : on convient d’un mot.',
  },
  'def-mediatrice': {
    texte: 'La médiatrice d’un segment est la droite perpendiculaire à ce segment en son milieu.',
    statut: 'definition',
    reciproqueVraie: null,
    pourquoi: 'Là encore, c’est un mot qu’on pose. Il n’y a pas d’hypothèse ni de conclusion.',
  },
  'car-cercle': {
    texte: 'Un triangle est rectangle si et seulement si il est inscrit dans un cercle dont un côté est un diamètre.',
    statut: 'caracterisation',
    reciproqueVraie: true,
    pourquoi: 'Les deux affirmations se déduisent l’une de l’autre : c’est ce que dit « si et seulement si ».',
  },
  'prop-milieux': {
    texte: 'Si I et J sont les milieux de [AB] et [AC], alors (IJ) est parallèle à (BC).',
    statut: 'propriete',
    reciproqueVraie: true,
    pourquoi: 'Sens direct vrai, et sa réciproque l’est aussi — mais elle se démontre séparément.',
  },
  'prop-isocele': {
    texte: 'Si un triangle est isocèle, alors ses angles à la base sont égaux.',
    statut: 'propriete',
    reciproqueVraie: true,
    pourquoi: 'La réciproque est vraie : deux angles égaux forcent deux côtés égaux.',
  },
  'prop-somme': {
    texte: 'Si ABC est un triangle, alors la somme de ses angles vaut 180°.',
    statut: 'propriete',
    reciproqueVraie: false,
    pourquoi: 'La réciproque n’a pas de contenu : TOUS les triangles ont 180°, donc cette somme ne distingue aucune forme.',
  },
  'prop-equilateral': {
    texte: 'Si un triangle est équilatéral, alors il est isocèle.',
    statut: 'propriete',
    reciproqueVraie: false,
    pourquoi: 'Contre-exemple : un triangle de côtés 5, 5 et 8 est isocèle sans être équilatéral.',
  },
  'prop-mediane': {
    texte: 'Si un triangle est rectangle en C, alors la médiane issue de C vaut la moitié de [AB].',
    statut: 'propriete',
    reciproqueVraie: true,
    pourquoi: 'C’est une autre façon de dire que C est sur le cercle de diamètre [AB] : la réciproque tient.',
  },
};

/**
 * Le classement d'un énoncé, par sa clé. Lève sur une clé inconnue : un
 * énoncé qui n'est pas dans la table ne doit pas être classé « par défaut ».
 */
export function statut(enonce) {
  const e = ENONCES[enonce];
  if (!e) throw new Error(`statut : énoncé inconnu « ${enonce} »`);
  return { id: enonce, ...e };
}

/** Toutes les clés d'énoncés disponibles, dans l'ordre de la table. */
export const ENONCES_IDS = Object.keys(ENONCES);

/** Les trois statuts possibles, avec leur libellé d'affichage. */
export const STATUTS = [
  { id: 'definition', label: 'Définition' },
  { id: 'propriete', label: 'Propriété' },
  { id: 'caracterisation', label: 'Caractérisation' },
];

/* ══ P4 — La charpente d'une démonstration ════════════════════════════ */

/**
 * LES TROIS RÔLES D'UNE DÉMONSTRATION, en données.
 *
 * Une preuve géométrique de collège a toujours la même charpente :
 *   donnée      — ce que l'énoncé nous accorde, sans discussion ;
 *   propriété   — la règle du cours qu'on invoque, nommée ;
 *   conclusion  — ce qu'on en déduit.
 *
 * Le module 6 fait ASSEMBLER cette charpente. Le fait que les rôles soient des
 * données ici — et non du texte codé en dur dans un composant — permet aux
 * tests de vérifier que chaque preuve proposée à l'élève est complète : au
 * moins une donnée, au moins une propriété, exactement une conclusion.
 */
export const ROLES = ['donnee', 'propriete', 'conclusion'];

/**
 * Une preuve est-elle bien charpentée ?
 *
 * On vérifie la STRUCTURE, pas le contenu : les étapes correctes sont dans
 * l'ordre donnée(s) → propriété(s) → conclusion, et la conclusion est unique et
 * dernière. C'est ce qui fait qu'une conclusion posée sans la propriété qui
 * l'autorise est refusée — l'erreur exacte que le module vise.
 */
export function preuveEstCharpentee(etapes) {
  const roles = etapes.map((e) => e.role);
  const rangs = { donnee: 0, propriete: 1, conclusion: 2 };
  const inconnus = roles.filter((r) => !(r in rangs));
  if (inconnus.length > 0) return { ok: false, raison: `rôle inconnu : ${inconnus[0]}` };
  const nbConclusions = roles.filter((r) => r === 'conclusion').length;
  if (nbConclusions !== 1) return { ok: false, raison: 'une preuve a exactement une conclusion' };
  if (roles[roles.length - 1] !== 'conclusion') return { ok: false, raison: 'la conclusion vient en dernier' };
  if (!roles.includes('donnee')) return { ok: false, raison: 'aucune donnée n’est invoquée' };
  if (!roles.includes('propriete')) return { ok: false, raison: 'aucune propriété du cours n’est invoquée' };
  for (let i = 1; i < roles.length; i += 1) {
    if (rangs[roles[i]] < rangs[roles[i - 1]]) return { ok: false, raison: 'l’ordre donnée → propriété → conclusion n’est pas respecté' };
  }
  return { ok: true, raison: 'donnée, puis propriété, puis conclusion' };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE EXÉCUTABLE — 4e / 3e, et 4e / leçon sœur.
 *
 * Ce noyau ne sait ni appliquer Thalès, ni calculer un cosinus, ni faire le
 * calcul de Pythagore. Les deux premiers sont des objets de 3e (`thales-3e`,
 * `trigonometrie-triangle-rectangle-3e`) ; le troisième appartient à la leçon
 * SŒUR `pythagore-4e`, qui partage la même clé catalogue `4e_triangles`. Cette
 * leçon-ci peut CITER Pythagore comme acquis, elle ne le réenseigne jamais.
 *
 * Le `exclude` du teachingScope se code en `throw`, il ne se commente pas
 * (règle « périmètre exécutable » du dépôt).
 */
export function assertScope4e(sujet) {
  const interdits = {
    thales: 'le théorème de Thalès est un objet de 3e',
    trigonometrie: 'la trigonométrie (cosinus, sinus, tangente) est un objet de 3e',
    'pythagore-calcul': 'le calcul par le théorème de Pythagore appartient à la leçon sœur « pythagore-4e »',
  };
  if (interdits[sujet]) throw new Error(`Hors périmètre de « triangles-4e » : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/**
 * Le cadre de référence des labos. A et B sont FIXES et centrés : c'est la
 * corde dont l'élève apprend qu'elle devient un diamètre.
 */
export const CADRE = { largeur: 620, hauteur: 460 };
export const A_DEFAUT = { x: 170, y: 320 };
export const B_DEFAUT = { x: 450, y: 320 };

/** La position de départ de C : franchement OBTUS, donc visiblement à corriger. */
export const C_DEPART = { x: 300, y: 246 };

/** Le point du cercle de diamètre [AB] repéré par son angle (module 2). */
export function surLeCercleAB(A, B, theta) {
  const O = midpoint(A, B);
  const r = dist(A, B) / 2;
  return { x: O.x + r * Math.cos(theta), y: O.y - r * Math.sin(theta) };
}

/**
 * Le triangle du module 3, et ceux qu'on relève ensuite : trois formes très
 * différentes, pour que la constance du rapport ne puisse pas passer pour un
 * hasard de la première figure.
 */
export const TRIANGLES_MILIEUX = [
  { nom: 'Le toit', A: { x: 300, y: 110 }, B: { x: 150, y: 350 }, C: { x: 470, y: 350 } },
  { nom: 'La flèche', A: { x: 200, y: 120 }, B: { x: 140, y: 360 }, C: { x: 500, y: 300 } },
  { nom: 'La lame', A: { x: 430, y: 130 }, B: { x: 160, y: 300 }, C: { x: 480, y: 360 } },
];
