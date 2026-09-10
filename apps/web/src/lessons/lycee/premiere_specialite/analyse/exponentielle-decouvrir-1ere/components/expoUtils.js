/**
 * Le modèle mathématique de « Exponentielle : la fonction égale à sa dérivée ».
 *
 * LE MODÈLE PUR D'ABORD (PATRON §18). Tout ce que les modules affichent en est
 * DÉRIVÉ : aucune hauteur, aucune pente, aucune cible d'aimantation, aucune
 * largeur de zone tactile n'est écrite à la main dans un module ou dans un
 * composant. Les dérivées sont EXACTES et littérales — jamais
 * `numericDerivative`, qui ne sert qu'au tracé (cf. l'en-tête de
 * common/analysis/derivative.js).
 *
 * CE QUE LA CONSTRUCTION D'EULER EST, ET CE QU'ELLE N'EST PAS.
 *   La ligne brisée construite au module 1 APPROCHE la courbe cherchée ; elle
 *   ne la donne PAS. `ecartRelatifFinal` mesure l'écart, et le test le BORNE :
 *   aucun texte de la leçon ne peut donc prétendre que la construction « donne »
 *   l'exponentielle. Le mot juste est « s'en approche », et la leçon dit
 *   pourquoi : les segments sont droits alors que la vraie courbe se redresse
 *   entre deux points.
 */
import { numericDerivative, tangentAt, lineEquation } from '../../../../../common/analysis/derivative';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(n).replace('-', '−');

/**
 * `parseDec` refuse le VRAI signe moins U+2212 et les tirets typographiques,
 * alors que la leçon AFFICHE « −1 » partout et que l'élève le recopie.
 * (Piège n°1 du lot 1 : trois agents sur quatre l'ont payé.)
 */
export const parseSigned = (raw, parseDelegue) =>
  parseDelegue(String(raw ?? '').replace(/[−–—‒‐]/g, '-'));

/** Équation d'une droite, écrite en français scolaire. */
export const eq = (line) => lineEquation(line, fr);

// ─────────────────────────────────────────────────────────────────────────────
// La construction d'Euler — le laboratoire signature
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LE PAS D'EULER, ET POURQUOI 0,25.
 *
 * Trois exigences se contredisent, et ce nombre est leur arbitrage, mesuré :
 *
 *  1. La ligne brisée doit être une VRAIE construction : au moins quatre
 *     segments, sinon l'élève pose deux points et n'a rien construit.
 *  2. L'écart à la courbe cherchée doit être VISIBLE sans être grotesque.
 *     Mesuré (`ecartRelatifFinal`) : p = 0,5 laisse 31 % d'écart au bout de
 *     quatre pas — la ligne brisée passerait si bas qu'elle ne ressemblerait
 *     plus à ce qu'on cherche ; p = 0,25 en laisse 10,2 %, assez pour se voir,
 *     assez peu pour rester la même courbe.
 *  3. La zone d'aimantation doit être ATTEIGNABLE AU DOIGT. C'est elle qui a
 *     tranché : `largeurAimantPx` la mesure, et le test exige 14 px à l'écran
 *     dans le pire cas (le PREMIER pas, le plus court de tous).
 *
 * Les abscisses valent alors 0 ; 0,25 ; 0,5 ; 0,75 ; 1 — toutes exactement
 * représentables et toutes lisibles, ce qu'un pas de 1/3 n'aurait pas donné.
 */
export const PAS_EULER = 0.25;

/** Le nombre de segments à construire. 4 × 0,25 = 1 : la construction va de 0 à 1. */
export const NB_PAS = 4;

/**
 * LES TROIS HAUTEURS DE DÉPART.
 *
 * 1 est celle qui satisfait AUSSI la seconde exigence, f(0) = 1 ; les deux
 * autres existent pour que l'élève CONSTATE qu'une seule courbe la satisfait.
 * Elles ne sont pas décoratives : ce sont les contre-exemples, et le module 1
 * n'a de sens que si l'élève peut les construire elles aussi.
 */
export const DEPARTS = [0.5, 1, 2];

/**
 * LA RÈGLE DU JEU, écrite une fois : la pente du segment suivant est ÉGALE à
 * la hauteur actuelle. C'est la seule ligne de mathématiques du laboratoire ;
 * tout le reste du fichier n'en est que la conséquence.
 */
export const penteImposee = (hauteur) => hauteur;

/** La hauteur au bout d'un segment : hauteur + pas × pente, avec pente = hauteur. */
export const hauteurSuivante = (hauteur, pas = PAS_EULER) =>
  hauteur + pas * penteImposee(hauteur);

/**
 * La ligne brisée d'Euler complète, depuis une hauteur de départ.
 * Le point 0 est le départ imposé ; les suivants sont les cibles successives.
 */
export function ligneEuler(depart, nbPas = NB_PAS, pas = PAS_EULER) {
  const pts = [{ x: 0, y: depart }];
  for (let k = 0; k < nbPas; k += 1) {
    const prec = pts[k];
    pts.push({ x: arrondi((k + 1) * pas), y: hauteurSuivante(prec.y, pas) });
  }
  return pts;
}

/**
 * L'état complet d'UN pas de la construction : d'où l'on part, quelle pente la
 * règle impose, et où cette pente oblige à arriver.
 *
 * `cible` est la seule position acceptable, et elle est DÉRIVÉE de la règle —
 * jamais écrite à la main. C'est ce qui rend impossible qu'un module affiche
 * une cible que la règle ne donnerait pas.
 */
export function etatDuPas(depart, index, pas = PAS_EULER) {
  const pts = ligneEuler(depart, index + 1, pas);
  const de = pts[index];
  const vers = pts[index + 1];
  return {
    index,
    de,
    vers,
    pente: penteImposee(de.y),
    montee: vers.y - de.y,
    tolerance: toleranceDuPas(de.y, pas),
  };
}

/**
 * LA DEMI-BANDE D'AIMANTATION, en unités de l'axe des ordonnées.
 *
 * Une FRACTION de la montée, et non une valeur absolue : c'est ce qui rend le
 * laboratoire INVARIANT D'ÉCHELLE. Comme le cadre est lui aussi proportionnel à
 * la hauteur de départ (`cadreDe`), la zone d'aimantation mesure exactement le
 * même nombre de PIXELS pour les trois départs — un élève qui choisit 0,5 n'a
 * pas une cible trois fois plus dure à viser qu'un élève qui choisit 2. Le test
 * le vérifie départ par départ.
 *
 * POURQUOI 0,45 ET PAS PLUS. La bande accepte les pentes comprises entre
 * 0,55 × hauteur et 1,45 × hauteur. À 0,5 elle accepterait la pente MOITIÉ —
 * c'est-à-dire précisément l'erreur que la leçon combat. `pentesAcceptees` rend
 * cette borne lisible, et le test refuse la pente nulle comme la pente double.
 */
export const FRACTION_AIMANT = 0.45;

export const toleranceDuPas = (hauteur, pas = PAS_EULER) =>
  FRACTION_AIMANT * pas * penteImposee(hauteur);

/** L'intervalle de pentes que l'aimant accepte, en multiples de la hauteur. */
export const pentesAcceptees = () => ({
  min: 1 - FRACTION_AIMANT,
  max: 1 + FRACTION_AIMANT,
});

/**
 * L'aimantation elle-même : où le point se pose quand le doigt le lâche en `y`.
 *
 * Dans la bande, il COLLE à la cible — la construction reste donc exacte, et un
 * élève qui vise juste ne se voit jamais refuser un pas pour trois millièmes.
 * Hors de la bande, le point reste où le doigt l'a mis : l'élève VOIT sa ligne
 * partir de travers, ce qui est l'information dont il a besoin.
 */
/**
 * LE BORD DE LA BANDE EST INCLUS, ET LES FLOTTANTS NE DOIVENT PAS LE MANGER.
 *
 * Défaut attrapé par le test : depuis 0,5, la demi-bande vaut exactement
 * 0,05625 et la cible 0,625 ; un doigt posé pile au bord donne
 * 0,625 + 0,05625 = 0,68125, dont la différence à la cible se calcule en
 * 0,05625000000000002. Comparée par `<=`, elle SORTAIT de la bande : l'élève
 * qui visait la limite exacte se voyait refuser son pas, sans rien voir de
 * différent à l'écran. On compare donc avec une marge d'un milliardième —
 * invisible pédagogiquement, décisive numériquement.
 */
const EPS_BANDE = 1e-9;

export function aimante(y, etat) {
  return Math.abs(y - etat.vers.y) <= etat.tolerance + EPS_BANDE ? etat.vers.y : y;
}

/** Le pas est-il validé ? La question ne porte que sur la position aimantée. */
export const pasReussi = (y, etat) => Math.abs(y - etat.vers.y) <= 1e-9;

// ─────────────────────────────────────────────────────────────────────────────
// Le cadre, DÉRIVÉ de la hauteur de départ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La graduation de l'axe des ordonnées pour un départ donné : un nombre rond à
 * l'échelle de la courbe construite. Elle est proportionnelle au départ, ce qui
 * est la clef de l'invariance d'échelle.
 */
export const graduationDe = (depart) => depart / 2;

/** La hauteur du cadre SVG, en pixels de viewBox. Voir `largeurAimantPx`. */
export const HAUTEUR_CADRE_PX = 375;

/** Les marges du cadre, en pixels de viewBox. */
export const MARGES = { left: 44, right: 24, top: 18, bottom: 30 };

/** Les pixels par unité horizontale : x va de 0 à 1, sur 270 px. */
export const UNITE_X_PX = 270;

/**
 * Le cadre complet pour un départ : l'étendue, les deux unités en pixels et la
 * graduation. `yMax` est arrondi au SUPÉRIEUR sur la graduation, pour que la
 * dernière ligne du quadrillage soit dessinée et que la ligne brisée ne touche
 * jamais le bord haut.
 */
export function cadreDe(depart, nbPas = NB_PAS, pas = PAS_EULER) {
  const g = graduationDe(depart);
  const sommet = ligneEuler(depart, nbPas, pas).at(-1).y;
  const yMax = arrondi(Math.ceil((sommet * 1.12) / g) * g);
  return {
    range: { xMin: 0, xMax: arrondi(nbPas * pas), yMin: 0, yMax },
    graduation: g,
    unitX: UNITE_X_PX / (nbPas * pas),
    unitY: HAUTEUR_CADRE_PX / yMax,
  };
}

/**
 * LA LARGEUR DE LA ZONE TACTILE, EN PIXELS — la mesure qui a décidé du pas
 * d'Euler.
 *
 * `derivation-variations-optimisation` a payé cette leçon : une cible qu'on ne
 * peut atteindre qu'en visant quatre pixels n'est pas atteignable au doigt, et
 * aucun test de mathématiques ne le voit. On mesure donc ici, et le test balaie
 * les trois départs et les quatre pas.
 *
 * Le nombre rendu est en pixels de VIEWBOX ; `facteurRendu` donne le facteur
 * d'échelle réellement appliqué à l'écran.
 */
export function largeurAimantPx(depart, index, pas = PAS_EULER) {
  const etat = etatDuPas(depart, index, pas);
  return 2 * etat.tolerance * cadreDe(depart, NB_PAS, pas).unitY;
}

/**
 * Le facteur d'échelle du SVG une fois rendu, pour une largeur d'écran donnée.
 *
 * Le composant borne la HAUTEUR rendue (`hauteurMaxRendue`) et laisse la
 * largeur suivre : sur un téléphone c'est la largeur disponible qui contraint,
 * sur un écran large c'est la hauteur. Le facteur est le plus petit des deux —
 * exactement ce que fait un `max-width` combiné à un `max-height`.
 */
export function facteurRendu(largeurEcranPx, hauteurMaxRendue = 430) {
  const l = MARGES.left + MARGES.right + UNITE_X_PX;
  const h = MARGES.top + MARGES.bottom + HAUTEUR_CADRE_PX;
  return Math.min(largeurEcranPx / l, hauteurMaxRendue / h);
}

/** La largeur de la zone tactile telle que le doigt la rencontre VRAIMENT. */
export const largeurAimantEcranPx = (depart, index, largeurEcranPx) =>
  largeurAimantPx(depart, index) * facteurRendu(largeurEcranPx);

// ─────────────────────────────────────────────────────────────────────────────
// Ce que la construction approche — et de combien elle s'en écarte
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La fonction cherchée, pour un départ donné : x ↦ depart × e^x.
 * C'est la SEULE fonction dont la dérivée vaut elle-même et qui vaut `depart`
 * en 0 ; `verifieUnicite` en fait un test, pour que la leçon n'affirme pas
 * l'unicité sur parole.
 */
export const solutionExacte = (depart) => (x) => depart * Math.exp(x);

/**
 * L'ÉCART entre la ligne brisée et la solution exacte, au bout de la
 * construction, en pourcentage.
 *
 * Ce nombre est la raison pour laquelle aucun texte de la leçon n'écrit que la
 * construction « donne » l'exponentielle. Il est INDÉPENDANT du départ (le
 * problème est invariant d'échelle), et le test le borne.
 */
export function ecartRelatifFinal(depart = 1, nbPas = NB_PAS, pas = PAS_EULER) {
  const construite = ligneEuler(depart, nbPas, pas).at(-1).y;
  const exacte = solutionExacte(depart)(nbPas * pas);
  return (100 * (exacte - construite)) / exacte;
}

/**
 * L'unicité, VÉRIFIÉE et non affirmée : deux solutions de y′ = y qui coïncident
 * en 0 coïncident partout. On le contrôle numériquement en comparant
 * `solutionExacte(c)` à toute autre constante — l'écart en 0 se propage, il ne
 * s'efface jamais.
 */
export function verifieUnicite(c1, c2, xs = [0, 0.5, 1, 2]) {
  if (Math.abs(c1 - c2) < 1e-12) return true;
  return xs.every((x) => Math.abs(solutionExacte(c1)(x) - solutionExacte(c2)(x)) > 1e-9);
}

// ─────────────────────────────────────────────────────────────────────────────
// La fonction exponentielle elle-même (modules 3 à 6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le nombre e, et les valeurs remarquables que la leçon CITE. Chacune est
 * recalculée par le test : aucune décimale n'est recopiée d'une table.
 */
export const E = Math.E;

export const EXP = {
  id: 'exp',
  label: 'f(x) = e^x',
  f: (x) => Math.exp(x),
  fPrime: (x) => Math.exp(x),
  fPrimeText: 'f′(x) = e^x',
  range: { xMin: -2.5, xMax: 2, yMin: -0.6, yMax: 7.6 },
  unit: 64,
  unitY: 40,
};

/**
 * LA TANGENTE EN 0, exacte : f(0) = 1 et f′(0) = 1, donc y = x + 1.
 * Elle est DÉRIVÉE du noyau partagé, pas écrite à la main — c'est ce qui
 * garantit que le module 5 ne peut pas afficher une droite qui rate le point
 * de contact.
 */
export const tangenteEnZero = () => tangentAt(EXP.fPrime(0), 0, EXP.f(0));

/** La tangente en un point quelconque, même chemin. */
export const tangenteEn = (a) => tangentAt(EXP.fPrime(a), a, EXP.f(a));

/**
 * LE SIGNE, DÉMONTRÉ PAR L'ABSURDE — codé, pas commenté.
 *
 * Le raisonnement de la leçon : si l'exponentielle s'annulait en un point, sa
 * pente y vaudrait 0 (car f′ = f), la fonction serait plate en ce point, et de
 * proche en proche nulle partout — ce qui contredit f(0) = 1.
 *
 * La fonction ci-dessous EXÉCUTE ce raisonnement sur la construction d'Euler,
 * qui obéit exactement à la même règle : partie d'une hauteur nulle, elle ne
 * bouge JAMAIS. C'est le contre-exemple que le module 3 fait manipuler, et il
 * est une conséquence du modèle, pas une image dessinée à la main.
 */
export function constructionDepuisZero(nbPas = NB_PAS, pas = PAS_EULER) {
  return ligneEuler(0, nbPas, pas);
}

/** L'exponentielle ne s'annule jamais : vérifié par balayage dans le test. */
export const estStrictementPositive = (x) => EXP.f(x) > 0;

// ─────────────────────────────────────────────────────────────────────────────
// Dériver exp(u) — module 6
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Les cas de `exp(u)` travaillés par la leçon, avec leur dérivée EXACTE.
 *
 * PÉRIMÈTRE CODÉ, PAS COMMENTÉ (mémoire `perimetre_executable_lecon`) :
 * `assertCasSimple` REFUSE tout u qui ne soit pas affine. La leçon dit « dans
 * des cas simples » ; le noyau le fait respecter, de sorte qu'un module ne
 * puisse pas glisser un exp(x²) sans que le test tombe.
 */
export const CAS_EXP_U = [
  { id: 'exp2x', u: { a: 2, b: 0 }, texte: 'e^{2x}', derivee: '2e^{2x}', facteur: 2 },
  { id: 'expmx', u: { a: -1, b: 0 }, texte: 'e^{-x}', derivee: '-e^{-x}', facteur: -1 },
  { id: 'exp3x1', u: { a: 3, b: 1 }, texte: 'e^{3x+1}', derivee: '3e^{3x+1}', facteur: 3 },
];

export function assertCasSimple(cas) {
  if (!cas.u || typeof cas.u.a !== 'number' || typeof cas.u.b !== 'number') {
    throw new Error(`${cas.id} : u doit être affine, déclaré par ses deux coefficients { a, b }`);
  }
  if (cas.u.a === 0) {
    throw new Error(`${cas.id} : u constante ne produit pas un cas de dérivation`);
  }
  if (cas.facteur !== cas.u.a) {
    throw new Error(`${cas.id} : le facteur annoncé (${cas.facteur}) doit être le coefficient de x (${cas.u.a})`);
  }
  return true;
}

/** f : x ↦ e^{ax+b}, et sa dérivée EXACTE x ↦ a·e^{ax+b}. */
export const expU = ({ a, b }) => (x) => Math.exp(a * x + b);
export const expUPrime = ({ a, b }) => (x) => a * Math.exp(a * x + b);

/**
 * Le contrôle de justesse d'un cas : la dérivée annoncée coïncide-t-elle avec
 * la pente réellement mesurée ? Le test le balaie sur chaque cas.
 * `numericDerivative` n'entre ICI que pour VÉRIFIER une formule exacte, jamais
 * pour juger la réponse d'un élève.
 *
 * L'ÉCART SE MESURE EN RELATIF, et c'est un défaut que le test a attrapé : sur
 * e^{3x+1}, la dérivée vaut 163,8 en x = 1, et une différence centrée y laisse
 * 2,5e-6 d'écart ABSOLU — au-dessus d'un seuil de 1e-6 — pour 1,5e-8 d'écart
 * RELATIF, rigoureusement identique en tout point. Juger une formule
 * exponentielle sur une tolérance absolue revient à la déclarer fausse
 * simplement parce qu'elle est grande.
 */
export function deriveeVerifiee(cas, xs = [-1, -0.5, 0, 0.5, 1]) {
  assertCasSimple(cas);
  const exacte = expUPrime(cas.u);
  return xs.every((x) => {
    const attendu = exacte(x);
    const mesure = numericDerivative(expU(cas.u), x);
    return Math.abs(attendu - mesure) / Math.abs(attendu) < 1e-6;
  });
}

/** Arrondi de calcul : neutralise les artefacts de flottants sans mentir. */
export function arrondi(n, decimales = 9) {
  const p = 10 ** decimales;
  return Math.round(n * p) / p;
}

/** Arrondi d'AFFICHAGE : quatre décimales suffisent et évitent 1,2207031249. */
export const affiche = (n) => arrondi(n, 4);

/** Réexporté pour que la leçon consomme le noyau partagé plutôt que de le doubler. */
export { numericDerivative, tangentAt };
