/**
 * Noyau mathématique de « Transformations — la translation » (4e).
 *
 * ─── LE GLISSEMENT SE DÉCRIT PAR TROIS CARACTÈRES, PAS PAR UN OBJET NOMMÉ ──
 * Le programme de 4e demande la TRANSLATION, et réserve à la 3e l'objet qui
 * la porte formellement. Ce noyau tient donc la frontière par sa STRUCTURE, et
 * pas par une note de bas de page : un glissement y est toujours décrit par sa
 * `direction`, son `sens` et sa `longueur` — trois mots de français que
 * l'élève de 4e peut dire, mesurer et vérifier sur la figure. Les champs `dx`
 * et `dy` existent parce qu'il faut bien calculer, mais aucun affichage ne les
 * montre comme un couple, aucune fonction ne les additionne entre glissements
 * (ce serait la relation de Chasles), et le mot interdit ne figure nulle part
 * dans ce fichier — `translation4e.test.js` le vérifie mécaniquement sur le
 * texte source, ce qu'aucune relecture ne garantit dans la durée.
 *
 * ─── LA FIGURE NE MENT JAMAIS ──────────────────────────────────────────────
 * `invariants` ne DÉCLARE aucune conservation : il MESURE les longueurs, les
 * angles, l'aire et le parallélisme sur les points RÉELLEMENT dessinés, des
 * deux côtés, et les compare. Si un composant déformait la copie, l'écran
 * dirait « non conservé » — la leçon ne peut donc pas affirmer une propriété
 * que le dessin contredirait (mémoire « invariant visuel »).
 *
 * ─── RIEN N'EST RÉIMPLÉMENTÉ ───────────────────────────────────────────────
 * `dist`, `midpoint`, `areParallel`, `polygonArea`, `sideLengths`,
 * `interiorAngles`, `lineThrough`, `add`, `vec`, `scale`, `normalize` et
 * `oppositeSidesParallel` viennent de `common/utils/geometry2d.js`. Ce fichier
 * n'ajoute que ce qui est propre à la translation de 4e.
 *
 * ─── REPÈRE ────────────────────────────────────────────────────────────────
 * Repère SVG : x vers la droite, y vers le BAS. Le `sens` exposé à l'élève est
 * donc traduit (« vers le haut » quand dy < 0), une fois, ici — jamais dans un
 * composant, où l'erreur de signe se reproduirait à chaque leçon.
 */
import {
  add, vec, scale, normalize, norm, dist, midpoint,
  lineThrough, areParallel, polygonArea, sideLengths, interiorAngles,
  oppositeSidesParallel, centroid,
} from '../../../../../common/utils/geometry2d';

/* ══ Écritures ════════════════════════════════════════════════════════════ */

/** Arrondi à n décimales, sans bruit binaire. */
export const round = (x, n = 2) => {
  const f = 10 ** n;
  return Math.round((x + Number.EPSILON) * f) / f;
};

/** Format français : virgule décimale. */
export const fr = (x, n = 1) => {
  if (!Number.isFinite(x)) return '—';
  return round(x, n).toLocaleString('fr-FR', { maximumFractionDigits: n });
};

/**
 * Une longueur exprimée en CARREAUX du quadrillage, pas en pixels.
 * L'élève compte des carreaux ; lui montrer « 148 » n'a aucun sens scolaire.
 */
export const enCarreaux = (px, pas = PAS) => px / pas;

/* ══ Le quadrillage partagé ═══════════════════════════════════════════════
 *
 * Un seul pas pour toute la leçon. C'est ce qui rend les cibles ATTEIGNABLES :
 * si une image tombait entre deux nœuds, l'élève ne pourrait pas la placer et
 * l'étape serait impossible (mémoire « cible atteignable »). `parcours.test.js`
 * vérifie, pour chaque figure de chaque module, que tous les sommets ET toutes
 * leurs images sont des nœuds.
 */
export const PAS = 40;

/** Le nœud du quadrillage le plus proche. */
export const auNoeud = (p, pas = PAS) => ({
  x: Math.round(p.x / pas) * pas,
  y: Math.round(p.y / pas) * pas,
});

/** Le point est-il exactement sur un nœud ? */
export const estSurNoeud = (p, pas = PAS, eps = 1e-6) =>
  Math.abs(p.x / pas - Math.round(p.x / pas)) < eps
  && Math.abs(p.y / pas - Math.round(p.y / pas)) < eps;

/* ══ Le glissement, par ses TROIS caractères ══════════════════════════════ */

/**
 * Les huit sens nommables, dans le repère de l'ÉLÈVE (y vers le haut).
 * On ne renvoie jamais un angle en degrés comme « sens » : le sens est une
 * information binaire par direction (« vers la droite » ou « vers la gauche »),
 * et c'est précisément ce que l'élève oublie quand il ne garde que la longueur.
 */
const SENS = [
  { nom: 'vers la droite', ux: 1, uy: 0 },
  { nom: 'vers la droite et vers le haut', ux: Math.SQRT1_2, uy: Math.SQRT1_2 },
  { nom: 'vers le haut', ux: 0, uy: 1 },
  { nom: 'vers la gauche et vers le haut', ux: -Math.SQRT1_2, uy: Math.SQRT1_2 },
  { nom: 'vers la gauche', ux: -1, uy: 0 },
  { nom: 'vers la gauche et vers le bas', ux: -Math.SQRT1_2, uy: -Math.SQRT1_2 },
  { nom: 'vers le bas', ux: 0, uy: -1 },
  { nom: 'vers la droite et vers le bas', ux: Math.SQRT1_2, uy: -Math.SQRT1_2 },
];

/**
 * Un glissement du plan.
 *
 * `dx`/`dy` sont le déplacement en unités SVG. Les TROIS caractères que la
 * leçon nomme en sont dérivés, jamais stockés séparément — deux champs qui
 * pourraient diverger permettraient à l'écran d'annoncer une longueur qui
 * n'est pas celle du trait dessiné.
 *
 *   · `longueur`  — la distance parcourue par chaque point (en unités SVG) ;
 *   · `direction` — l'angle de la droite support, dans [0 ; 180[ degrés, NON
 *                   orienté : deux glissements opposés ont la MÊME direction,
 *                   et c'est exactement ce qui rend le `sens` nécessaire ;
 *   · `sens`      — lequel des deux, en français, dans le repère de l'élève.
 */
export function glissement({ dx, dy }) {
  const longueur = Math.hypot(dx, dy);
  // Direction non orientée : l'angle de la droite, ramené dans [0 ; 180[.
  // On travaille dans le repère de l'élève (y vers le haut) pour que « 45° »
  // désigne bien la diagonale qui monte, comme sur son cahier.
  let direction = longueur === 0 ? 0 : (Math.atan2(-dy, dx) * 180) / Math.PI;
  direction = ((direction % 180) + 180) % 180;
  return {
    dx, dy, longueur, direction,
    sens: nomDuSens({ dx, dy }),
    /** Le glissement qui défait celui-ci — le RETOUR, pas une soustraction. */
    retour: () => glissement({ dx: -dx, dy: -dy }),
    /** Vrai quand il n'y a aucun déplacement : la figure ne bouge pas. */
    estNul: longueur < 1e-9,
  };
}

/**
 * Le sens, nommé en français dans le repère de l'élève.
 * `null` quand le glissement est nul : un déplacement nul n'a pas de sens, et
 * afficher « vers la droite » pour une flèche de longueur zéro serait un
 * mensonge de l'écran.
 */
export function nomDuSens({ dx, dy }) {
  const n = Math.hypot(dx, dy);
  if (n < 1e-9) return null;
  // Repère élève : l'axe vertical est inversé par rapport au SVG.
  const ux = dx / n;
  const uy = -dy / n;
  let best = SENS[0];
  let bestDot = -Infinity;
  for (const s of SENS) {
    const d = ux * s.ux + uy * s.uy;
    if (d > bestDot) { bestDot = d; best = s; }
  }
  return best.nom;
}

/**
 * L'image d'une liste de points par le glissement.
 *
 * UNE seule fonction pour le point et pour la figure : l'image d'une figure
 * EST l'image de chacun de ses points, et le code le dit en n'offrant aucune
 * autre voie. `translaterPoint` n'est qu'un raccourci de lecture.
 */
export function translater(points, g) {
  if (!Array.isArray(points)) throw new Error('translater : attend un tableau de points');
  return points.map((p) => add(p, { x: g.dx, y: g.dy }));
}

/** L'image d'UN point — le même calcul, nommé pour la lisibilité des modules. */
export const translaterPoint = (p, g) => translater([p], g)[0];

/**
 * Le glissement qui mène de `figure` à `image`, ou `null`.
 *
 * `null` est LE résultat pédagogique : il signifie « ces deux figures ne se
 * déduisent pas l'une de l'autre par un simple glissement » — elle a tourné,
 * elle a été retournée, ou elle a été déformée. C'est ce qui permet au module 1
 * de distinguer la translation du demi-tour de 5e SANS l'affirmer, et au
 * module 6 de trancher entre trois gestes.
 *
 * Le critère est celui de la définition : TOUS les points doivent avoir fait
 * le MÊME trajet. `tol` est en unités SVG, à comparer à ce que l'élève VOIT
 * (mémoire « tolérance vs affichage ») : 6 unités valent moins de 3 px à
 * l'écran, donc un écart accepté ici est invisible, et un écart visible est
 * refusé.
 */
export function retrouverGlissement(figure, image, tol = 6) {
  if (!Array.isArray(figure) || !Array.isArray(image)) return null;
  if (figure.length === 0 || figure.length !== image.length) return null;
  const d = vec(figure[0], image[0]);
  for (let i = 1; i < figure.length; i += 1) {
    const di = vec(figure[i], image[i]);
    if (Math.hypot(di.x - d.x, di.y - d.y) > tol) return null;
  }
  return glissement({ dx: d.x, dy: d.y });
}

/**
 * Les trajets de chaque point, tels qu'ils sont DESSINÉS.
 * Le module 1 les affiche : ce sont les segments [M M'] dont l'élève constate
 * qu'ils restent parallèles et de même longueur.
 */
export const trajets = (figure, image) =>
  figure.map((p, i) => ({ de: p, vers: image[i], longueur: dist(p, image[i]) }));

/**
 * Tous les trajets sont-ils parallèles ET de même longueur ?
 *
 * Mesuré sur les points dessinés, via `areParallel` de geometry2d (jamais par
 * comparaison de coefficients directeurs — une droite verticale y donnerait
 * l'infini). Vrai ⟺ le geste est un glissement.
 */
export function trajetsConcordants(figure, image, tolLong = 6, tolDir = 0.06) {
  const ts = trajets(figure, image);
  const utiles = ts.filter((t) => t.longueur > 1e-6);
  if (utiles.length === 0) return true; // aucun point n'a bougé : trivialement vrai
  if (utiles.length !== ts.length) return false; // certains ont bougé, d'autres non
  const l0 = utiles[0].longueur;
  const d0 = lineThrough(utiles[0].de, utiles[0].vers);
  return utiles.every((t) => {
    if (Math.abs(t.longueur - l0) > tolLong) return false;
    return areParallel(d0, lineThrough(t.de, t.vers), tolDir);
  });
}

/* ══ Ce que le glissement conserve — MESURÉ, jamais déclaré ═══════════════ */

/**
 * Les invariants, calculés des DEUX côtés sur les points réellement dessinés.
 *
 * Chaque entrée porte les deux valeurs et le verdict : un composant qui
 * afficherait « conservé » alors que les nombres diffèrent contredirait sa
 * propre source. La leçon peut donc dire « regarde », pas « crois-moi ».
 *
 * Les tolérances sont RELATIVES aux longueurs pour les longueurs et l'aire —
 * un écart de 1 unité n'a pas le même sens sur un triangle de 40 unités et sur
 * un carrelage de 400.
 */
export function invariants(figure, image) {
  const lf = sideLengths(figure);
  const li = sideLengths(image);
  const af = interiorAngles(figure);
  const ai = interiorAngles(image);
  const airef = polygonArea(figure);
  const airei = polygonArea(image);
  const echelle = Math.max(...lf, 1);

  const memeListe = (a, b, tol) =>
    a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= tol);

  // Le parallélisme : chaque côté de la figure est-il parallèle au côté
  // correspondant de l'image ? On saute les côtés dégénérés, qui ne
  // définissent aucune droite (lineThrough lèverait).
  let parallelisme = true;
  for (let i = 0; i < figure.length; i += 1) {
    const a1 = figure[i];
    const b1 = figure[(i + 1) % figure.length];
    const a2 = image[i];
    const b2 = image[(i + 1) % image.length];
    if (dist(a1, b1) < 1e-6 || dist(a2, b2) < 1e-6) continue;
    if (!areParallel(lineThrough(a1, b1), lineThrough(a2, b2), 1e-3)) parallelisme = false;
  }

  return {
    longueurs: {
      figure: lf, image: li,
      conserve: memeListe(lf, li, 0.02 * echelle),
    },
    angles: {
      figure: af, image: ai,
      conserve: memeListe(af, ai, 0.6), // en degrés : sous ce que l'œil voit
    },
    aire: {
      figure: airef, image: airei,
      conserve: Math.abs(airef - airei) <= 0.02 * Math.max(airef, 1),
    },
    parallelisme: {
      conserve: parallelisme,
    },
    /** Tout est-il conservé ? Le résumé que le module 4 affiche. */
    get tout() {
      return this.longueurs.conserve && this.angles.conserve
        && this.aire.conserve && this.parallelisme.conserve;
    },
  };
}

/* ══ Le lien avec le parallélogramme ══════════════════════════════════════ */

/**
 * Les quatre sommets M, M', N', N — DANS CET ORDRE — et le verdict mesuré.
 *
 * L'ORDRE EST LE POINT DE LA LEÇON. Avec M, M', N', N on fait le tour du
 * quadrilatère ; avec M, N, M', N' on le traverse en croix et on obtient un
 * quadrilatère croisé qui n'est pas un parallélogramme. C'est l'erreur que le
 * module 5 vise, et elle n'est pas une faute d'inattention : elle vient de
 * lire « les deux points, puis leurs deux images ».
 *
 * `estParallelogramme` passe par `oppositeSidesParallel` de geometry2d, sur
 * les points dessinés. Le cas dégénéré — M, N et le glissement alignés — est
 * signalé à part : quatre points alignés ne forment pas un parallélogramme, et
 * le laisser passer ferait mentir la figure.
 */
export function parallelogrammeDe(M, N, g) {
  const Mp = translaterPoint(M, g);
  const Np = translaterPoint(N, g);
  const sommets = [M, Mp, Np, N];
  const aplati = polygonArea(sommets) < 1e-6;
  return {
    M, N, Mprime: Mp, Nprime: Np,
    sommets,
    /** L'ordre FAUX, celui que le module met en face pour qu'on le voie. */
    sommetsCroises: [M, N, Mp, Np],
    aplati,
    estParallelogramme: !aplati && oppositeSidesParallel(sommets, 1e-3),
    /** Les deux diagonales se coupent en leur milieu — l'autre caractérisation. */
    milieuDiagonale1: midpoint(M, Np),
    milieuDiagonale2: midpoint(Mp, N),
  };
}

/** Les diagonales du quadrilatère ont-elles le même milieu ? (mesuré) */
export const diagonalesMemeMilieu = (q, tol = 2) =>
  dist(q.milieuDiagonale1, q.milieuDiagonale2) <= tol;

/* ══ Les autres gestes, pour le CONTRASTE ═════════════════════════════════ */

/**
 * Le demi-tour de 5e (symétrie centrale), reproduit ici pour le module 1.
 *
 * Il n'est pas importé de `transformations-5e` : cette leçon ne dépend pas du
 * code d'une autre, et la symétrie centrale se réduit ici à deux lignes. Ce
 * qu'on RÉUTILISE de la 5e, ce sont ses briques de connaissance
 * (`priorKnowledge`), pas ses composants.
 */
export const demiTour = (points, centre) =>
  points.map((p) => ({ x: 2 * centre.x - p.x, y: 2 * centre.y - p.y }));

/** Le centre du demi-tour qui mène de figure à image, ou `null`. */
export function retrouverCentre(figure, image, tol = 6) {
  if (figure.length === 0 || figure.length !== image.length) return null;
  const c = midpoint(figure[0], image[0]);
  for (let i = 1; i < figure.length; i += 1) {
    const m = midpoint(figure[i], image[i]);
    if (dist(m, c) > tol) return null;
  }
  return c;
}

/**
 * Quel geste mène de `figure` à `image` ?
 *   'glissement' | 'demi-tour' | 'aucun'
 *
 * L'ordre du test compte : une figure qui n'a pas bougé satisfait les deux
 * définitions, et on la classe alors comme glissement nul plutôt que comme
 * demi-tour autour d'un centre indéfini.
 */
export function quelGeste(figure, image, tol = 6) {
  if (retrouverGlissement(figure, image, tol)) return 'glissement';
  if (retrouverCentre(figure, image, tol)) return 'demi-tour';
  return 'aucun';
}

/* ══ Périmètre EXÉCUTABLE ═════════════════════════════════════════════════ */

/**
 * La frontière 4e / 3e, codée.
 *
 * Le programme de 4e s'arrête à la translation comme GESTE. L'objet formel qui
 * la porte, sa notation, ses coordonnées, la loi qui compose deux glissements
 * et l'agrandissement-réduction sont des objets de 3e. Les demander à ce noyau
 * LÈVE : le périmètre se code, il ne se commente pas (mémoire « périmètre
 * exécutable »).
 */
const HORS_PERIMETRE_4E = {
  vecteur: 'l’objet formel qui porte une translation, sa notation et ses coordonnées',
  chasles: 'la loi qui compose deux glissements bout à bout',
  'coordonnees-vecteur': 'les coordonnées de l’objet formel qui porte la translation',
  homothetie: 'l’agrandissement-réduction de rapport k',
};

export function assertScope4e(sujet) {
  const raison = HORS_PERIMETRE_4E[sujet];
  if (raison) {
    throw new Error(
      `transformations-4e : « ${sujet} » (${raison}) est réservé à la 3e. `
      + 'La 4e décrit le glissement par sa direction, son sens et sa longueur.',
    );
  }
  return true;
}

/** Les sujets refusés, exposés pour que le test les balaie tous. */
export const SUJETS_HORS_PERIMETRE = Object.keys(HORS_PERIMETRE_4E);

/* ══ Les figures de la leçon ══════════════════════════════════════════════
 *
 * Toutes en unités SVG, toutes sur des NŒUDS du quadrillage de pas 40 —
 * comme leurs images par les glissements que les modules proposent.
 * `parcours.test.js` le vérifie figure par figure : une image entre deux
 * nœuds rendrait l'étape impossible.
 */

/** M1 — le drapeau du tapis roulant : une forme franchement dissymétrique,
 *  pour qu'un demi-tour se VOIE (un carré tournerait sans qu'on le sache).
 *  6,5 carreaux d'aire, cinq sommets, aucun axe de symétrie. */
export const DRAPEAU = [
  { x: 120, y: 320 },
  { x: 120, y: 160 },
  { x: 240, y: 200 },
  { x: 160, y: 240 },
  { x: 160, y: 320 },
];

/** M1 — le centre du demi-tour de 5e, posé pour que l'image RESTE dans le
 *  cadre : sans cette vérification, le contre-exemple sortirait de l'écran et
 *  l'élève ne verrait pas ce qu'on lui demande de comparer.
 *
 *  L'ORIGINE DE LA FLÈCHE du laboratoire est choisie de la même façon : elle
 *  est hors de la figure, et assez centrée pour que la pointe garde ~10
 *  carreaux de course horizontale et ~6 verticale SANS jamais pousser la
 *  copie hors du cadre. `parcours.test.js` mesure cette course. */
export const CENTRE_DEMI_TOUR = { x: 400, y: 240 };

/** M2 — le point isolé et son glissement. Sa longueur vaut EXACTEMENT
 *  5 carreaux : l'élève peut la compter, et les deux pièges du module (le sens
 *  opposé, et l'autre direction à même longueur) tiennent tous deux dans le
 *  cadre — sans quoi ils seraient inatteignables. */
export const M_POINT = { x: 360, y: 240 };

/** M3 — le triangle qu'on translate sommet par sommet (aire 4,5 carreaux). */
export const TRIANGLE_M3 = [
  { x: 120, y: 400 },
  { x: 240, y: 400 },
  { x: 160, y: 280 },
];

/** M4 — le quadrilatère dont on mesure les invariants.
 *
 *  IL EST SCALÈNE À DESSEIN : quatre côtés de longueurs deux à deux
 *  différentes (3 · 3,61 · 6,08 · 4,12 carreaux) et AUCUN angle droit
 *  (104° · 124° · 66° · 67°). Sur un carré, « les longueurs sont conservées »
 *  serait vrai par accident à la moindre erreur de code ; ici, la moindre
 *  déformation se voit dans les nombres. Son aire vaut 16 carreaux ronds. */
export const QUAD_M4 = [
  { x: 120, y: 400 },
  { x: 240, y: 400 },
  { x: 320, y: 280 },
  { x: 80, y: 240 },
];

/** M5 — les deux points de départ du parallélogramme. */
export const M_PARA = { x: 120, y: 360 };
export const N_PARA = { x: 280, y: 280 };

/**
 * Les glissements proposés, tous multiples entiers du pas : les images
 * tombent sur des nœuds, donc TOUTES les cibles sont atteignables, et
 * `parcours.test.js` vérifie en plus qu'aucune image ne sort du cadre.
 */
export const GLISSEMENTS = {
  m1: glissement({ dx: 320, dy: -80 }),   // 8 carreaux à droite, 2 vers le haut
  m2: glissement({ dx: 160, dy: -120 }),  // 4 à droite, 3 vers le haut — longueur 5
  m3: glissement({ dx: 280, dy: -120 }),  // 7 à droite, 3 vers le haut
  m4: glissement({ dx: 280, dy: -80 }),   // 7 à droite, 2 vers le haut
  m5: glissement({ dx: 280, dy: 40 }),    // 7 à droite, 1 vers le bas
};

/** Le cadre de dessin partagé par tous les laboratoires de la leçon, et la
 *  marge dans laquelle toute figure — originale ET image — doit tenir. */
export const CADRE = { w: 760, h: 470, marge: 40 };

/** La figure tient-elle dans le cadre ? Vérifié par `parcours.test.js` pour
 *  chaque couple (figure, glissement) que les modules affichent. */
export const dansLeCadre = (points, cadre = CADRE) => points.every(
  (p) => p.x >= cadre.marge && p.x <= cadre.w - cadre.marge
    && p.y >= cadre.marge && p.y <= cadre.h - cadre.marge,
);
