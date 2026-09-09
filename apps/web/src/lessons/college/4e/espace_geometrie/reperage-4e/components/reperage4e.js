import { snapCoord, planeGeometry, formatCoords } from '../../../../../common/components/CoordPlane';
import { dist, midpoint } from '../../../../../common/utils/geometry2d';

/**
 * Noyau mathématique de « Repérage dans le plan » (4e).
 *
 * ─── CE QUE LA 4e APPORTE, ET SA FRONTIÈRE ────────────────────────────
 * Objet officiel `reperage`, rôle APPROFONDISSEMENT dans la chaîne
 * 6e → 5e → 4e → 3e. La 5e (`reperage-5e`) a déjà ouvert les quatre
 * quadrants, les coordonnées négatives, et a même touché du doigt une
 * graduation non unitaire. La 4e ne re-enseigne donc NI « lire un point », NI
 * « le couple est ordonné » : elle déplace la question.
 *
 *     include — lire une coordonnée qui tombe ENTRE deux graduations ·
 *               CHOISIR la graduation d'un axe pour un jeu de données ·
 *               placer un point quand le pas n'est pas 1 ·
 *               se servir des coordonnées pour résoudre un problème.
 *     exclude — la sphère (latitude, longitude), les coordonnées dans
 *               l'espace, la formule du milieu et celle de la longueur comme
 *               objets d'étude formels (3e), les vecteurs (2nde).
 *
 * Ce noyau n'expose donc ni `longueurAB`, ni `milieuFormule`, ni quoi que ce
 * soit portant sur la sphère ou l'espace ; `assertScope4e` lève si on les
 * demande. `plusProche` compare des CARRÉS de distances, précisément pour
 * n'avoir jamais besoin d'écrire une racine ni une formule de longueur.
 *
 * ─── RÉUTILISATION, PAS RÉIMPLÉMENTATION ──────────────────────────────
 * L'aimantation vient de `snapCoord` (CoordPlane) et la géométrie de
 * `geometry2d`. Une seule définition du pas, une seule définition d'une
 * distance : c'est ce qui garantit qu'une cible calculée ici tombe VRAIMENT
 * sur un nœud dessiné par le composant.
 *
 * ─── LA FIGURE NE MENT JAMAIS ─────────────────────────────────────────
 * Le verdict d'une graduation n'est jamais une phrase écrite à l'avance : il
 * est CALCULÉ sur les données réelles (combien de graduations, combien de
 * points confondus, lesquels tombent entre deux traits). C'est ce qui permet
 * au labo signature de dire « ce pas est mauvais » sans que personne ne l'ait
 * décrété.
 */

/* ══ Formats et arrondis ══════════════════════════════════════════════ */

/** Arrondi d'affichage et de comparaison. */
export const arrondi = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

/** Format français : virgule décimale et vrai signe moins. */
export const fr = (x, d = 2) =>
  Number.isFinite(x)
    ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }).replace('-', '−')
    : '—';

/** Le couple, écrit à la française : (3 ; −2,5). */
export const couple = (p, d = 1) => formatCoords(p, d);

/**
 * Le nombre de décimales qu'un pas IMPOSE à l'affichage.
 * Avec un pas de 2,5, écrire « 3 » sous un point posé en 2,5 serait un
 * mensonge de la figure : l'élève lirait une valeur que le repère ne porte
 * pas. Cette fonction est la seule source de vérité sur ce point.
 */
export function decimalesDuPas(pas) {
  const s = String(pas);
  const i = s.indexOf('.');
  return i < 0 ? 0 : Math.min(3, s.length - i - 1);
}

/* ══ P2 — CHOISIR UNE GRADUATION ══════════════════════════════════════ */

/**
 * La famille de pas « lisibles » : 1, 2 et 5, multipliés par une puissance
 * de dix. C'est la famille qu'utilisent tous les axes du monde réel, et ce
 * n'est pas un hasard : ce sont les seuls pas dont on compte les graduations
 * de tête. On y ajoute 2,5, indispensable pour les demi-unités.
 */
export const PAS_CANDIDATS = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100];

/** Le multiple de `pas` immédiatement en dessous / au-dessus de `v`. */
const planchePas = (v, pas) => Math.floor(arrondi(v / pas, 9)) * pas;
const plafondPas = (v, pas) => Math.ceil(arrondi(v / pas, 9)) * pas;

/** `v` tombe-t-il EXACTEMENT sur une graduation de pas `pas` ? */
export function surUneGraduation(v, pas) {
  const k = v / pas;
  return Math.abs(k - Math.round(k)) < 1e-9;
}

/**
 * LE VERDICT D'UNE GRADUATION, pour un jeu de valeurs donné.
 *
 * C'est le cœur du module signature. Un pas n'est pas « bon » ou « mauvais »
 * dans l'absolu : il l'est POUR CES DONNÉES. Trois défauts distincts peuvent
 * le disqualifier, et il est essentiel que l'élève les distingue, parce que
 * les remèdes sont opposés (affiner ou grossir).
 *
 *   `trop-de-graduations`  l'axe en porterait plus que le budget → illisible :
 *                          on ne peut plus compter les traits. Remède : grossir.
 *   `points-confondus`     deux valeurs DIFFÉRENTES atterrissent sur le même
 *                          nœud → les données sont détruites, pas seulement
 *                          mal affichées. Remède : affiner.
 *   `entre-les-graduations` des valeurs ne tombent sur aucun trait → l'élève
 *                          ne peut ni les poser ni les lire exactement.
 *                          Remède : changer de famille de pas (0,5 au lieu de 2).
 *
 * `budget` est le nombre MAXIMUM de graduations acceptable sur l'axe. 26 est
 * la valeur retenue par la leçon : au-delà, `CoordPlane` n'étiquette plus
 * qu'une graduation sur deux et l'axe devient une bande grise.
 *
 * @param {number[]} valeurs  les données à représenter sur cet axe
 * @param {{budget?:number, pas?:number[]}} options
 * @returns {{recommande:number|null, candidats:Array}}
 */
export function graduationPour(valeurs, options = {}) {
  const vals = [...valeurs];
  if (vals.length < 2) throw new Error('graduationPour : il faut au moins deux valeurs');
  const budget = options.budget ?? 26;
  const pasTestes = options.pas ?? PAS_CANDIDATS;

  const vMin = Math.min(...vals);
  const vMax = Math.max(...vals);

  const candidats = pasTestes.map((pas) => {
    const min = planchePas(vMin, pas);
    const max = plafondPas(vMax, pas);
    // Le nombre de TRAITS, bornes comprises : c'est ce que l'élève voit.
    const graduations = Math.round((max - min) / pas) + 1;

    // Les valeurs qui ne tombent sur aucun trait.
    const horsNoeud = vals.filter((v) => !surUneGraduation(v, pas));

    // Les valeurs distinctes qui, une fois aimantées, se confondent.
    const aimantees = vals.map((v) => arrondi(Math.round(v / pas) * pas, 9));
    const paires = [];
    for (let i = 0; i < vals.length; i += 1) {
      for (let j = i + 1; j < vals.length; j += 1) {
        if (Math.abs(vals[i] - vals[j]) > 1e-9 && Math.abs(aimantees[i] - aimantees[j]) < 1e-9) {
          paires.push([vals[i], vals[j]]);
        }
      }
    }

    // L'ORDRE des refus n'est pas arbitraire : un pas qui écrase les données
    // est plus grave qu'un pas qui les place entre deux traits, et un axe
    // illisible ne se juge même pas sur sa fidélité.
    let verdict = 'ok';
    if (graduations > budget) verdict = 'trop-de-graduations';
    else if (paires.length > 0) verdict = 'points-confondus';
    else if (horsNoeud.length > 0) verdict = 'entre-les-graduations';

    return {
      pas,
      min,
      max,
      graduations,
      confondus: paires,
      horsNoeud,
      verdict,
      ok: verdict === 'ok',
      raison: RAISONS[verdict](graduations, paires, horsNoeud, budget),
    };
  });

  // Parmi les pas acceptables, on garde le PLUS GRAND : moins de graduations
  // pour la même fidélité, donc l'axe le plus lisible.
  const acceptables = candidats.filter((c) => c.ok);
  const recommande = acceptables.length ? Math.max(...acceptables.map((c) => c.pas)) : null;

  return { recommande, candidats, vMin, vMax, budget };
}

/** Les phrases du verdict, DÉDUITES des nombres mesurés. */
const RAISONS = {
  'trop-de-graduations': (g, _p, _h, budget) =>
    `${g} graduations sur l’axe : au-delà de ${budget}, on ne peut plus les compter.`,
  'points-confondus': (_g, paires) =>
    `${paires.length} paire${paires.length > 1 ? 's' : ''} de relevés différents tombe${paires.length > 1 ? 'nt' : ''} sur le même point.`,
  'entre-les-graduations': (_g, _p, hors) =>
    `${hors.length} valeur${hors.length > 1 ? 's' : ''} ne tombe${hors.length > 1 ? 'nt' : ''} sur aucune graduation.`,
  ok: (g) => `${g} graduations, et chaque relevé a son propre point.`,
};

/**
 * Le REPÈRE que le pas choisi induit : l'étendue arrondie aux graduations,
 * plus le pas lui-même. C'est cet objet que les labos passent à `CoordPlane`,
 * de sorte que la grille dessinée soit EXACTEMENT celle que le noyau a jugée.
 */
export function repereDe(valeursX, valeursY, pasX, pasY) {
  return {
    xMin: planchePas(Math.min(...valeursX), pasX),
    xMax: plafondPas(Math.max(...valeursX), pasX),
    yMin: planchePas(Math.min(...valeursY), pasY),
    yMax: plafondPas(Math.max(...valeursY), pasY),
    xStep: pasX,
    yStep: pasY,
  };
}

/** Le nombre de graduations d'un axe du repère — la mesure de sa lisibilité. */
export const graduationsDe = (repere, axe = 'x') =>
  axe === 'x'
    ? Math.round((repere.xMax - repere.xMin) / repere.xStep) + 1
    : Math.round((repere.yMax - repere.yMin) / repere.yStep) + 1;

/* ══ P1 et P3 — LIRE et PLACER ════════════════════════════════════════ */

/**
 * LA LECTURE D'UN POINT, en deux langues.
 *
 * L'élève de 5e comptait des graduations ; celui de 4e doit passer du COMPTE
 * à la VALEUR, et le passage n'est plus l'identité dès que le pas n'est pas 1.
 * Cette fonction rend les deux, plus le nombre de décimales que le pas impose.
 */
export function lirePoint(p, repere) {
  const gx = (p.x - repere.xMin) / repere.xStep;
  const gy = (p.y - repere.yMin) / repere.yStep;
  return {
    x: arrondi(p.x, 6),
    y: arrondi(p.y, 6),
    graduationsX: arrondi(gx, 6),
    graduationsY: arrondi(gy, 6),
    surNoeud: surUneGraduation(p.x - repere.xMin, repere.xStep)
      && surUneGraduation(p.y - repere.yMin, repere.yStep),
    decimales: Math.max(decimalesDuPas(repere.xStep), decimalesDuPas(repere.yStep)),
    texte: formatCoords(
      { x: arrondi(p.x, 6), y: arrondi(p.y, 6) },
      Math.max(decimalesDuPas(repere.xStep), decimalesDuPas(repere.yStep))
    ),
  };
}

/**
 * PLACER un point : l'aimantation sur les nœuds RÉELLEMENT DESSINÉS.
 *
 * Délègue à `snapCoord`, qui est aussi ce qu'utilise `CoordPlane` en interne.
 * C'est délibéré et c'est une garantie : une cible calculée par ce noyau est
 * atteignable par le geste, parce que les deux passent par la même fonction.
 * Une cible en 2,5 dans une grille de pas 1 serait INATTEIGNABLE — ce défaut
 * a cassé deux labos plus tôt, et un test le surveille désormais.
 */
export function placer(p, repere) {
  return snapCoord(p, repere, { x: repere.xStep, y: repere.yStep });
}

/** La cible est-elle atteignable, c'est-à-dire posée sur un nœud dessiné ? */
export function atteignable(cible, repere) {
  const pose = placer(cible, repere);
  return Math.abs(pose.x - cible.x) < 1e-9 && Math.abs(pose.y - cible.y) < 1e-9;
}

/** Deux points sont-ils au même endroit, à la tolérance du pas ? */
export const memePoint = (a, b, eps = 1e-9) =>
  Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps;

/* ══ P4 — DÉCIDER PAR LES COORDONNÉES ═════════════════════════════════ */

/**
 * ABCD EST-IL UN PARALLÉLOGRAMME ?
 *
 * Le critère utilisé est celui des DIAGONALES : dans un parallélogramme, les
 * diagonales se coupent en leur milieu, donc [AC] et [BD] ont le même milieu.
 * C'est le seul critère de 4e qui se calcule entièrement sur les coordonnées,
 * sans écrire ni longueur ni vecteur — les deux étant hors programme ici.
 *
 * On rend les deux milieux, pas seulement le booléen : la conclusion doit être
 * LISIBLE par l'élève, qui doit pouvoir constater que les deux couples sont
 * égaux (ou ne le sont pas) plutôt que se voir asséner un verdict.
 */
export function estParallelogramme(A, B, C, D) {
  const mAC = midpoint(A, C);
  const mBD = midpoint(B, D);
  const ecart = dist(mAC, mBD);
  return {
    milieuAC: { x: arrondi(mAC.x, 6), y: arrondi(mAC.y, 6) },
    milieuBD: { x: arrondi(mBD.x, 6), y: arrondi(mBD.y, 6) },
    ecart: arrondi(ecart, 6),
    parallelogramme: ecart < 1e-9,
  };
}

/**
 * LE QUATRIÈME SOMMET qui ferme le parallélogramme ABCD.
 *
 * Il se calcule sans aucune formule à retenir : D est le symétrique de B par
 * rapport au milieu de [AC], donc D = A + C − B. L'élève ne l'apprend pas par
 * cœur, il le TROUVE en cherchant le point qui donne aux deux diagonales le
 * même milieu.
 */
export function quatriemeSommet(A, B, C) {
  return { x: arrondi(A.x + C.x - B.x, 6), y: arrondi(A.y + C.y - B.y, 6) };
}

/**
 * LE POINT LE PLUS PROCHE, décidé par les coordonnées.
 *
 * On compare les CARRÉS des distances, jamais les distances : le carré suffit
 * à classer (la fonction carré est croissante sur les positifs), et il évite
 * d'écrire la racine — la formule de la longueur est un objet de 3e. C'est
 * donc une contrainte de programme qui rend le calcul PLUS simple, pas moins.
 */
export function plusProche(P, liste) {
  if (!liste.length) throw new Error('plusProche : la liste ne peut pas être vide');
  const mesures = liste.map((Q) => ({
    point: Q,
    nom: Q.nom ?? Q.name ?? null,
    dx: arrondi(Q.x - P.x, 6),
    dy: arrondi(Q.y - P.y, 6),
    carre: arrondi((Q.x - P.x) ** 2 + (Q.y - P.y) ** 2, 6),
  }));
  const tries = [...mesures].sort((a, b) => a.carre - b.carre);
  return { mesures, gagnant: tries[0], classement: tries };
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e / 2nde, EXÉCUTABLE.
 *
 * Ce noyau ne connaît que le repérage dans le PLAN, et ne sait ni situer un
 * point sur la sphère terrestre, ni manipuler une troisième coordonnée, ni
 * former un vecteur : ce sont des objets de 3e (`reperage-droite-plan-3e`) et
 * de 2nde (`vecteurs-2nde`). Les tests vérifient l'ABSENCE des fonctions
 * correspondantes ; cette fonction est la garde côté données.
 */
export function assertScope4e(sujet) {
  const interdits = {
    sphere: 'le repérage sur la sphère est un objet de 3e',
    'latitude-longitude': 'la latitude et la longitude sont des objets de 3e',
    'coordonnees-espace': 'le repérage dans l’espace est un objet de 3e',
    vecteur: 'les vecteurs sont un objet de 2nde',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/**
 * MODULE 1 — Douze relevés de température sur une journée de mars.
 *
 * L'AMPLITUDE EST CHOISIE, ET C'EST UN CHOIX DE CONCEPTION. Une première
 * version montait à 22,5 °C : au demi-degré, l'axe demandait alors 56
 * graduations, et AUCUN pas de la famille n'était acceptable — le labo
 * n'avait pas de bonne réponse et la pédagogie s'effondrait (défaut attrapé
 * par la sonde du noyau, avant qu'une seule ligne d'interface n'existe).
 *
 * Avec −3 à 7,5 °C, les quatre verdicts sont TOUS atteignables sur le même
 * jeu de données, ce qui est exactement ce que le module doit faire vivre :
 *
 *     pas 0,25 → 43 graduations          → trop-de-graduations
 *     pas 0,5  → 22 graduations, fidèle  → ok        ← la réponse
 *     pas 1    → 7 relevés hors nœud     → entre-les-graduations
 *     pas 2    → 7 paires écrasées       → points-confondus
 *
 * Les demi-degrés sont ce que donne un vrai thermomètre : c'est eux qui
 * rendent le choix non trivial, et le pas de 1 — celui que l'élève croit
 * naturel — insuffisant.
 */
export const TEMPERATURES = [
  { h: 0, t: -3 }, { h: 2, t: -2.5 }, { h: 4, t: -1.5 }, { h: 6, t: 0 },
  { h: 8, t: 1.5 }, { h: 10, t: 3.5 }, { h: 12, t: 5 }, { h: 14, t: 6.5 },
  { h: 16, t: 7.5 }, { h: 18, t: 6 }, { h: 20, t: 3.5 }, { h: 22, t: 1 },
];

/** Les températures seules, dans l'ordre de la journée. */
export const TEMPERATURES_VALEURS = TEMPERATURES.map((r) => r.t);
export const TEMPERATURES_HEURES = TEMPERATURES.map((r) => r.h);

/** Le nuage de points correspondant, prêt pour `CoordPlane`. */
export const nuageTemperatures = () =>
  TEMPERATURES.map((r) => ({ id: `t${r.h}`, x: r.h, y: r.t }));

/**
 * MODULE 3 — Des altitudes relevées le long d'une randonnée.
 *
 * Le point du module : la MÉTHODE est indépendante des nombres. Ici l'ordre
 * de grandeur change complètement — on ne choisit plus entre 0,25 et 2, mais
 * entre 50 et 500 — et pourtant les trois défauts sont exactement les mêmes,
 * repérés par exactement le même calcul :
 *
 *     pas 50  → 29 graduations   → trop-de-graduations
 *     pas 100 → 15 graduations   → ok        ← la réponse
 *     pas 200 → 2 paires écrasées → points-confondus
 *
 * L'élève qui a compris au module 1 n'a rien de nouveau à apprendre : il a à
 * TRANSPOSER, et c'est là que se mesure sa compréhension.
 */
export const ALTITUDES = [
  { km: 0, m: -200 }, { km: 2, m: 0 }, { km: 4, m: 300 }, { km: 6, m: 600 },
  { km: 8, m: 900 }, { km: 10, m: 1200 }, { km: 12, m: 1000 }, { km: 14, m: 500 },
];
export const ALTITUDES_VALEURS = ALTITUDES.map((r) => r.m);
export const ALTITUDES_KM = ALTITUDES.map((r) => r.km);

/**
 * MODULE 4 — Les cibles à placer, dans un repère de pas 0,5.
 * Toutes VÉRIFIÉES atteignables par le test de parcours : chacune tombe sur un
 * nœud réellement dessiné au pas du repère.
 */
export const REPERE_PLACEMENT = { xMin: -3, xMax: 3, yMin: -2, yMax: 2, xStep: 0.5, yStep: 0.5 };
export const CIBLES_PLACEMENT = [
  { id: 'c1', x: 1.5, y: 0.5, nom: 'A' },
  { id: 'c2', x: -2.5, y: 1.5, nom: 'B' },
  { id: 'c3', x: 0.5, y: -1.5, nom: 'C' },
];

/**
 * MODULE 5 — Le quadrilatère à fermer.
 * A, B, C sont donnés ; D se calcule. Le repère est au demi pour que D tombe
 * sur un nœud (vérifié).
 */
export const REPERE_PARALLELOGRAMME = { xMin: -4, xMax: 4, yMin: -3, yMax: 3, xStep: 0.5, yStep: 0.5 };
export const PARALLELOGRAMME = {
  // B est volontairement ÉLOIGNÉ de l'axe vertical : posé en x = −0,5, son
  // étiquette recouvrait les graduations de l'axe (audit de mise en page de
  // la suite navigateur). Avec x = −1,5, le quatrième sommet reste sur un
  // nœud et dans le cadre — vérifié par le test de parcours.
  A: { x: -3, y: -1.5 },
  B: { x: -1.5, y: -2.5 },
  C: { x: 2.5, y: 0.5 },
};

/**
 * MODULE 6 — La borne d'appel et les trois refuges.
 * Un seul est le plus proche, et ce n'est PAS celui qui a la plus petite
 * abscisse : c'est ce qui interdit de répondre à l'œil.
 */
export const REPERE_REFUGES = { xMin: -6, xMax: 6, yMin: -4, yMax: 4, xStep: 1, yStep: 1 };
export const BORNE = { x: -1, y: 1 };
export const REFUGES = [
  // `lettre` est le nom porté par la FIGURE : un nom complet chevaucherait les
  // graduations de l'axe. Le nom entier vit dans le DOM, sous le repère.
  { id: 'r1', x: -5, y: 2, nom: 'Refuge du Lac', lettre: 'L' },
  { id: 'r2', x: 2, y: -1, nom: 'Refuge du Col', lettre: 'C' },
  { id: 'r3', x: 3, y: 3, nom: 'Refuge des Pins', lettre: 'N' },
];

export { snapCoord, planeGeometry, dist, midpoint };
