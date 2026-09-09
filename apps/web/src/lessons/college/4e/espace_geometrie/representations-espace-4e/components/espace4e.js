/**
 * Noyau mathématique de « Représentation de l'espace » (4e).
 *
 * ─── CE QUE LA 4e AJOUTE À LA 5e ──────────────────────────────────────
 * La 5e (`representations-espace-5e`) a posé les vues, la perspective
 * cavalière et les patrons du prisme droit et du cylindre. Le programme de 4e
 * ajoute exactement :
 *     include — « Pyramide, cône de révolution », « Reconnaître base,
 *               hauteur », « Volume de la pyramide et du cône ».
 *     exclude — « Sections de solides (boule, plan) ».
 * D'où deux solides POINTUS, la distinction base/hauteur, et la seule formule
 * de volume que le niveau confie : le tiers.
 *
 * ─── LE TIERS N'EST PAS UNE FORMULE À RETENIR ─────────────────────────
 * `versements()` COMPTE combien de contenus de pyramide remplissent le prisme
 * de même base et même hauteur. La leçon fait donc constater le 3 avant de
 * l'écrire, et l'élève peut changer les dimensions pour vérifier qu'il ne
 * bouge pas. C'est la manipulation qui porte la règle, pas l'inverse.
 *
 * ─── LA HAUTEUR N'EST PAS L'ARÊTE ─────────────────────────────────────
 * Le piège du niveau. `hauteurDe` renvoie la distance du sommet AU PLAN de la
 * base ; `areteLaterale` renvoie l'autre longueur, celle qu'on voit et qu'on
 * confond. Les deux sont exposées côte à côte pour que la leçon puisse les
 * opposer avec des nombres, jamais avec une mise en garde.
 *
 * ─── PÉRIMÈTRE, EN CODE ───────────────────────────────────────────────
 * Ni sphère, ni boule, ni section par un plan, ni agrandissement des volumes :
 * ce sont des objets de 3e (`representation-espace-3e`). Les tests vérifient
 * l'ABSENCE des fonctions correspondantes.
 */
import {
  makePyramide, makePrismeCarre, makeCone, makeCylindre,
  countsOf, eulerCheck, dist3, centroid3,
} from '../../../../../common/utils/geometry3d';

export { makePyramide, makePrismeCarre, makeCone, makeCylindre };

/* ══ Écritures ════════════════════════════════════════════════════════ */

export const arrondi = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

export const fr = (x, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }) : '—';

/** Un volume avec son unité, toujours au cube. */
export const vol = (x, unite = 'cm', d = 1) => `${fr(x, d)} ${unite}³`;

/* ══ Les volumes ══════════════════════════════════════════════════════ */

/** Aire d'une base carrée. */
export const aireBaseCarree = (cote) => cote * cote;

/**
 * Aire d'un disque — la base du cône et du cylindre.
 *
 * La garde porte sur le RAYON, pas sur l'aire : un rayon négatif a un carré
 * positif, il franchirait donc silencieusement une garde placée en aval et
 * produirait un volume parfaitement plausible pour un solide impossible.
 */
export function aireDisque(rayon) {
  if (!(rayon > 0)) throw new Error('aireDisque : le rayon doit être strictement positif');
  return Math.PI * rayon * rayon;
}

/** Volume d'un prisme droit : aire de base × hauteur. Acquis de 5e, rappelé. */
export function volumePrisme(aireBase, hauteur) {
  garde(aireBase, hauteur);
  return aireBase * hauteur;
}

/** Volume d'un cylindre de révolution. */
export const volumeCylindre = (rayon, hauteur) => volumePrisme(aireDisque(rayon), hauteur);

/**
 * Volume d'une pyramide : LE TIERS de celui du prisme de même base et même
 * hauteur. La formule est écrite ici, mais la leçon la fait d'abord constater
 * par `versements()`.
 */
export function volumePyramide(aireBase, hauteur) {
  garde(aireBase, hauteur);
  return (aireBase * hauteur) / 3;
}

/** Volume d'un cône de révolution — le même tiers, sur une base ronde. */
export const volumeCone = (rayon, hauteur) => volumePyramide(aireDisque(rayon), hauteur);

function garde(aireBase, hauteur) {
  if (!(aireBase > 0)) throw new Error('volume : l’aire de base doit être strictement positive');
  if (!(hauteur > 0)) throw new Error('volume : la hauteur doit être strictement positive');
}

/**
 * COMBIEN DE PYRAMIDES REMPLISSENT LE PRISME ?
 *
 * C'est la fonction que le module 1 fait tourner. Elle ne renvoie pas « 3 »
 * en dur : elle DIVISE les deux volumes, si bien que le résultat resterait
 * faux si l'une des deux formules l'était.
 */
export function versements(aireBase, hauteur) {
  const prisme = volumePrisme(aireBase, hauteur);
  const pyramide = volumePyramide(aireBase, hauteur);
  return { prisme, pyramide, nombre: prisme / pyramide };
}

/* ══ Base et hauteur — le piège du niveau ═════════════════════════════ */

/**
 * La HAUTEUR d'une pyramide : la distance du sommet au PLAN de la base.
 * Mesurée sur le solide, pas reprise du paramètre — si la construction du
 * solide changeait, la leçon dirait toujours la vérité.
 */
export function hauteurDe(pyramide) {
  const base = pyramide.vertices.slice(0, 4);
  const sommet = pyramide.vertices[4];
  const planY = base[0].y;
  return Math.abs(sommet.y - planY);
}

/**
 * L'ARÊTE LATÉRALE : du sommet à un coin de la base. C'est ce que l'élève
 * VOIT sur la perspective, et qu'il prend pour la hauteur.
 * Elle est TOUJOURS strictement plus longue que la hauteur (sauf pyramide
 * dégénérée) : un test le vérifie sur tout le domaine.
 */
export function areteLaterale(pyramide) {
  return dist3(pyramide.vertices[4], pyramide.vertices[0]);
}

/**
 * L'APOTHÈME d'une face latérale : la hauteur d'un triangle de la face,
 * du sommet au MILIEU d'une arête de base. C'est la longueur nécessaire pour
 * dessiner le patron — encore une autre, à ne pas confondre avec les deux
 * précédentes.
 */
export function apothemeFace(cote, hauteur) {
  garde(cote * cote, hauteur);
  return Math.sqrt(hauteur * hauteur + (cote / 2) * (cote / 2));
}

/** Les trois longueurs, côte à côte — c'est ce que le module 2 affiche. */
export function longueursDe(cote, hauteur) {
  const p = makePyramide(cote, hauteur);
  return {
    hauteur: arrondi(hauteurDe(p), 4),
    arete: arrondi(areteLaterale(p), 4),
    apotheme: arrondi(apothemeFace(cote, hauteur), 4),
  };
}

/* ══ Le patron de la pyramide ═════════════════════════════════════════ */

/**
 * Le patron : une base carrée et quatre triangles isocèles rabattus sur ses
 * quatre côtés. Chaque triangle a pour base le côté du carré et pour hauteur
 * l'APOTHÈME — surtout pas la hauteur de la pyramide.
 *
 * Les pièces sont données dans un repère plan, origine au coin bas-gauche du
 * carré, y vers le haut. Un test vérifie qu'aucune ne chevauche la base ni une
 * voisine, pour toutes les dimensions atteignables.
 */
export function patronPyramide(cote, hauteur) {
  const a = apothemeFace(cote, hauteur);
  const c = cote;
  return {
    cote: c,
    apotheme: a,
    base: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: c, y: c }, { x: 0, y: c }],
    triangles: [
      { id: 'bas', sommets: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: c / 2, y: -a }] },
      { id: 'droite', sommets: [{ x: c, y: 0 }, { x: c, y: c }, { x: c + a, y: c / 2 }] },
      { id: 'haut', sommets: [{ x: c, y: c }, { x: 0, y: c }, { x: c / 2, y: c + a }] },
      { id: 'gauche', sommets: [{ x: 0, y: c }, { x: 0, y: 0 }, { x: -a, y: c / 2 }] },
    ],
    // Le cadre exact du patron déplié — le composant en dérive son viewBox.
    cadre: { minX: -a, maxX: c + a, minY: -a, maxY: c + a },
  };
}

/**
 * Le patron se REFERME-t-il ? Condition mathématique, pas visuelle : chaque
 * triangle doit avoir pour côtés obliques l'arête latérale de la pyramide.
 * C'est ce qui permet de juger un patron proposé par l'élève.
 */
export function patronSeReferme(cote, hauteur, apothemePropose, tol = 1e-6) {
  return Math.abs(apothemePropose - apothemeFace(cote, hauteur)) <= tol;
}

/* ══ Le cône par révolution ═══════════════════════════════════════════ */

/**
 * Le cône engendré par la rotation d'un triangle rectangle autour d'un de ses
 * côtés de l'angle droit : ce côté devient la HAUTEUR, l'autre le RAYON, et
 * l'hypoténuse la génératrice (la ligne du bord).
 *
 * C'est la définition « de révolution », et elle donne gratuitement la
 * génératrice — que le module 4 fait apparaître sans jamais la calculer par
 * Pythagore devant l'élève (la leçon sœur s'en charge).
 */
export function coneParRevolution(rayon, hauteur) {
  if (!(rayon > 0) || !(hauteur > 0)) {
    throw new Error('coneParRevolution : rayon et hauteur strictement positifs');
  }
  return {
    rayon,
    hauteur,
    generatrice: Math.sqrt(rayon * rayon + hauteur * hauteur),
    aireBase: aireDisque(rayon),
    volume: volumeCone(rayon, hauteur),
  };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * La boule, la sphère, les sections de solides par un plan et l'effet d'un
 * agrandissement sur les volumes sont des objets de 3e
 * (`representation-espace-3e`). Ce noyau ne les expose pas, et cette fonction
 * lève si on les demande.
 *
 * La demande initiale du chantier évoquait un plan de coupe mobile : c'est
 * précisément ce que le référentiel réserve à la 3e. Le labo de cette leçon
 * fait tourner, déplier, redimensionner et remplir — il ne coupe pas.
 */
export function assertScope4e(sujet) {
  const interdits = {
    section: 'la section d’un solide par un plan est un objet de 3e',
    sphere: 'la sphère est un objet de 3e',
    boule: 'la boule et son volume sont des objets de 3e',
    'agrandissement-volume': 'l’effet d’un agrandissement sur les volumes (k³) est un objet de 3e',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/** Les dimensions réglables du module 1, et leurs bornes. */
export const DIMENSIONS = { coteMin: 4, coteMax: 12, hauteurMin: 4, hauteurMax: 14 };

/** Les problèmes du module 6 — chacun vérifié par un test. */
export const PROBLEMES = [
  {
    id: 'tente',
    titre: 'La tente',
    enonce: 'Une tente a une base carrée de 3 m de côté et une hauteur de 2,4 m.',
    question: 'Quel volume d’air contient-elle ?',
    calcul: () => volumePyramide(aireBaseCarree(3), 2.4),
    unite: 'm',
    piege: () => volumePrisme(aireBaseCarree(3), 2.4), // oublier le tiers
    piegeTexte: 'Tu as calculé le volume d’un prisme. Une pyramide n’en contient que le tiers.',
  },
  {
    id: 'cornet',
    titre: 'Le cornet',
    enonce: 'Un cornet de glace a un rayon de 3 cm et une hauteur de 12 cm.',
    question: 'Quel volume de glace peut-il contenir, au cm³ près ?',
    calcul: () => volumeCone(3, 12),
    unite: 'cm',
    piege: () => volumeCylindre(3, 12),
    piegeTexte: 'Tu as calculé un cylindre. Le cornet est un cône : c’est le tiers.',
  },
  {
    id: 'toit',
    titre: 'Le toit',
    enonce: 'Un toit en pyramide a une base carrée de 8 m de côté et une hauteur de 3 m. On double la hauteur.',
    question: 'Par combien le volume est-il multiplié ?',
    calcul: () => volumePyramide(aireBaseCarree(8), 6) / volumePyramide(aireBaseCarree(8), 3),
    unite: '',
    piege: () => 4,
    piegeTexte: 'Seule la HAUTEUR double, pas la base : le volume double, il ne quadruple pas.',
  },
];
