/**
 * Fonctions trigonométriques : du cercle à la courbe — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue
 * (clé 'premiere_specialite_fonctions_trigonometriques', partie 1/2) :
 *
 *   premiere_specialite_trigonometrie-cercle-fonctions-1ere_P1  Situer un réel sur le cercle trigonométrique
 *   premiere_specialite_trigonometrie-cercle-fonctions-1ere_P2  Connaître les propriétés de parité des fonctions sinus et cosinus
 *   premiere_specialite_trigonometrie-cercle-fonctions-1ere_P3  Connaître et utiliser la périodicité des fonctions trigonométriques
 *   premiere_specialite_trigonometrie-cercle-fonctions-1ere_P4  Étudier les variations des fonctions sinus et cosinus
 *   premiere_specialite_trigonometrie-cercle-fonctions-1ere_P5  Représenter graphiquement les fonctions sinus et cosinus
 *   premiere_specialite_trigonometrie-cercle-fonctions-1ere_P6  Interpréter une représentation graphique d'une fonction trigonométrique
 *
 * ─── POSITIONNEMENT VERTICAL, load-bearing ─────────────────────────────────
 * La Seconde (`trigonometrie-cercle-2nde`, livrée) enseigne DÉJÀ le cercle
 * trigonométrique, l'enroulement de la droite des réels, le radian et sa
 * conversion, « cos = abscisse / sin = ordonnée », les signes par quadrant, la
 * borne −1 ≤ cos ≤ 1 et les valeurs remarquables. Rien de tout cela n'est à
 * enseigner ici : ce sont les `priorKnowledge`, et le module 0 les mesure.
 *
 * L'APPORT PROPRE de cette leçon tient en une phrase : passer du CERCLE à la
 * COURBE. Le point qui tourne devient une FONCTION — un objet qu'on étudie
 * pour lui-même, avec sa parité, sa périodicité, ses variations et sa
 * représentation graphique. La 2de faisait tourner un point ; la 1ère déroule
 * son mouvement le long d'un axe et obtient une courbe.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée (module 1) : en enroulant un
 * point sur le cercle, on reporte son ordonnée sur un axe à droite, et la
 * courbe SE DESSINE. Dépasser un tour fait repasser la trace exactement sur
 * elle-même ; enrouler dans l'autre sens donne la trace MIROIR pour le sinus,
 * et la MÊME trace pour le cosinus. Deux phénomènes constatés par le geste,
 * que le module 1 ne nomme pas — il DEMANDE comment on les nomme.
 *
 * Objet porté : le DÉROULOIR (components/DerouleurLab.jsx), cercle à gauche et
 * axe vide à droite, repris au module 3 (les deux traces superposées) et au
 * module 4 (le tableau de variations qui se remplit).
 *
 * PÉRIMÈTRE : pas de résolution de cos x = k ni de sin x = k, pas
 * d'inéquation, pas de formule d'addition ni de duplication, pas de
 * modélisation d'un phénomène périodique — c'est la leçon « Fonctions
 * trigonométriques : équations et phénomènes périodiques ». Pas de dérivée de
 * sinus ni de cosinus (Terminale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere';

export const LESSON_CONFIG = {
  id: 'trigonometrie-cercle-fonctions-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 (docs/architecture/KNOWLEDGE_DEPENDENCY.md). Les six premières
  // sont des briques de `trigonometrie-cercle-2nde`, LIVRÉE et disponible :
  // une leçon de Première hérite du vocabulaire de la Seconde, elle ne le
  // réinvente pas.
  //   cercle-trigonometrique, enroulement — le cercle de rayon 1 et le fait
  //     qu'à chaque réel corresponde un point ; le module 1 PART de là (tf-d1) ;
  //   radian — l'unité dans laquelle tout est écrit ici (tf-d2) ;
  //   cos-sin-coordonnees — « cos t est l'abscisse, sin t l'ordonnée » : c'est
  //     l'ordonnée que le dérouloir reporte sur l'axe (tf-d3) ;
  //   regle-borne-un — les deux valeurs ne quittent jamais [−1 ; 1], ce qui
  //     borne la hauteur de la courbe (tf-d4) ;
  //   valeurs-remarquables — les crans du cliquet sont des réels remarquables
  //     et leurs valeurs sont exigibles sans calcul (tf-d5) ;
  //   fonction, notation-fx — la leçon écrit sin(x) et parle de LA fonction
  //     sinus dès son module 2 (tf-d6) ;
  //   variations-sens, tableau-de-variations — de « Variations et extremums »
  //     (2de) : le module 4 REMPLIT un tableau de variations, il n'en explique
  //     pas la mécanique (tf-d7) ;
  //   abscisse, ordonnee — le report de l'ordonnée du point sur l'axe déroulé
  //     est le geste même du module 1 (tf-d8).
  priorKnowledge: [
    'cercle-trigonometrique', 'enroulement', 'radian', 'cos-sin-coordonnees',
    'regle-borne-un', 'valeurs-remarquables', 'fonction', 'notation-fx',
    'variations-sens', 'tableau-de-variations', 'abscisse', 'ordonnee',
  ],
  // Termes d'appui ANTÉRIEURS que la leçon emploie sans les enseigner. Chacun
  // est justifié — jamais ajouté pour faire taire l'audit.
  knowledgeAudit: {
    ignore: [
      { term: 'sinus', reason: 'Établi comme RAPPORT en 3e puis comme ORDONNÉE du point du cercle par trigonometrie-cercle-2nde (brique cos-sin-coordonnees, ici en priorKnowledge). Cette leçon n’enseigne pas le sinus : elle en fait une FONCTION, ce que porte la brique `fonction-sinus`.' },
      { term: 'cosinus', reason: 'Même statut que sinus : acquis en 2de comme abscisse du point du cercle, repris ici comme fonction.' },
      { term: 'coordonnees', reason: 'Notion de 6e, réactivée par la 2de ; le couple (abscisse ; ordonnée) est l’outil du report, pas une cible.' },
      { term: 'representation-graphique', reason: 'Établie par les fonctions de 3e puis de 2de ; la leçon l’APPLIQUE aux fonctions sinus et cosinus (LP5), elle n’enseigne pas ce qu’est une courbe représentative.' },
      { term: 'intervalle', reason: 'Écriture [0 ; 2π] établie par la 2de (variations-extremums-2nde) ; simple support d’énoncé ici.' },
      { term: 'extremum', reason: 'Maximum et minimum établis par variations-extremums-2nde (2de) ; le module 4 les LIT sur la courbe du sinus, il ne définit pas la notion.' },
      { term: 'variations', reason: 'Croissante / décroissante et le tableau de variations sont établis par variations-extremums-2nde (2de) et déclarés en priorKnowledge (variations-sens, tableau-de-variations). Le module 0 les MESURE — c’est son rôle — et le module 4 les APPLIQUE aux deux fonctions trigonométriques (brique variations-sin-cos) ; la leçon n’enseigne pas ce qu’est une fonction croissante.' },
      { term: 'arrondi', reason: 'Notion de 6e, réactivée par nombres-reels-2nde ; n’apparaît ici que comme consigne de réponse (« arrondie au centième ») dans une seule question du module 3, jamais comme objet d’étude.' },
    ],
  },
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Fonctions trigonométriques : du cercle à la courbe',
  description:
    "Enrouler un point sur le cercle et dérouler son mouvement le long d'un axe : la courbe du sinus se dessine toute seule. Dépasser un tour la fait repasser sur elle-même, tourner à l'envers la reflète — deux phénomènes qui portent un nom, et qui font du sinus une fonction qu'on étudie pour elle-même.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🌊',
  estimatedDurationMin: 80,
  skills: [
    'Situer un réel sur le cercle, y compris au-delà d’un tour ou négatif',
    'Reconnaître et utiliser la parité des fonctions sinus et cosinus',
    'Utiliser la périodicité pour ramener un réel dans un tour',
    'Décrire les variations des fonctions sinus et cosinus sur un tour',
    'Tracer et lire les courbes des fonctions sinus et cosinus',
  ],
  teachingScope: {
    include: [
      'Situer un réel sur le cercle trigonométrique, y compris au-delà de 2π et pour un réel négatif',
      'La fonction sinus et la fonction cosinus comme objets : à un réel x, un nombre sin x ou cos x',
      'Parité : cos(−x) = cos x (fonction paire) et sin(−x) = −sin x (fonction impaire)',
      'Périodicité : sin(x + 2π) = sin x et cos(x + 2π) = cos x, et l’usage qu’on en fait pour ramener un réel dans un tour',
      'Variations des fonctions sinus et cosinus sur [0 ; 2π], et leurs extremums',
      'Représentation graphique des fonctions sinus et cosinus sur plusieurs tours',
      'Lecture d’une courbe périodique : écart maximal à l’axe et longueur du motif qui se répète',
    ],
    exclude: [
      'Résoudre cos x = k ou sin x = k, sur un tour comme sur ℝ, et les inéquations (leçon « Fonctions trigonométriques : équations et phénomènes périodiques »)',
      'Les formules d’addition et de duplication (même leçon)',
      'La modélisation d’un phénomène périodique par une fonction trigonométrique (même leçon)',
      'La dérivée des fonctions sinus et cosinus (Terminale)',
      'Le cercle trigonométrique, le radian et la conversion degrés ↔ radians : acquis en Seconde',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur le cercle, le radian et les deux coordonnées vus en 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'derouler-le-cercle', path: `${LESSON_BASE_PATH}/derouler-le-cercle`, title: 'Dérouler le cercle', desc: 'Enroule un point sur le cercle : sa hauteur se reporte sur l’axe de droite, et une courbe se dessine sous ta main.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Dérouler' },
    { id: '02', number: 2, slug: 'un-reel-un-point', path: `${LESSON_BASE_PATH}/un-reel-un-point`, title: 'Un réel, un point', desc: 'Au-delà d’un tour et en dessous de zéro : tout réel a sa place sur le cercle, et le sinus devient une fonction.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Situer' },
    { id: '03', number: 3, slug: 'deux-mots-pour-deux-constats', path: `${LESSON_BASE_PATH}/deux-mots-pour-deux-constats`, title: 'Deux mots pour deux constats', desc: 'La trace qui repasse sur elle-même et la trace en miroir portent chacune un nom : périodicité et parité.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P2', 'premiere_specialite_trigonometrie-cercle-fonctions-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Nommer' },
    { id: '04', number: 4, slug: 'monter-descendre-remonter', path: `${LESSON_BASE_PATH}/monter-descendre-remonter`, title: 'Monter, descendre, remonter', desc: 'Parcours un tour complet et remplis le tableau : le sinus monte, descend, puis remonte. Le cosinus, lui, n’a que deux morceaux.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P4'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Parcourir' },
    { id: '05', number: 5, slug: 'tracer-les-deux-courbes', path: `${LESSON_BASE_PATH}/tracer-les-deux-courbes`, title: 'Tracer les deux courbes', desc: 'Place les points clés, laisse la courbe se fermer, et découvre le décalage qui sépare les deux.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Tracer' },
    { id: '06', number: 6, slug: 'lire-une-courbe-qui-se-repete', path: `${LESSON_BASE_PATH}/lire-une-courbe-qui-se-repete`, title: 'Lire une courbe qui se répète', desc: 'Deux nombres suffisent à décrire une courbe qui se répète : jusqu’où elle monte, et au bout de combien elle recommence.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_trigonometrie-cercle-fonctions-1ere_P6'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Lire' },
    { id: '07', number: 7, slug: 'mission-finale-du-cercle-a-la-courbe', path: `${LESSON_BASE_PATH}/mission-finale-du-cercle-a-la-courbe`, title: '🏆 Mission finale : du cercle à la courbe', desc: 'Dix épreuves pour prouver que tu sais situer, refléter, répéter, lire les variations et interpréter une courbe.', stage: 'evaluation', color: 'violet', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};

export default LESSON_CONFIG;
