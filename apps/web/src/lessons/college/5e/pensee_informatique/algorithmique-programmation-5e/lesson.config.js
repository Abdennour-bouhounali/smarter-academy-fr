/**
 * Algorithmique et programmation — 5e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * des modules doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (dérivés
 * de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   5e_algorithmique-programmation-5e_P1  Décrire une procédure comme une suite ordonnée d'instructions
 *   5e_algorithmique-programmation-5e_P2  Définir une variable et lui affecter une valeur
 *   5e_algorithmique-programmation-5e_P3  Lire la valeur d'une variable au cours d'un programme
 *   5e_algorithmique-programmation-5e_P4  Utiliser une boucle « répéter n fois »
 *   5e_algorithmique-programmation-5e_P5  Tracer une figure simple avec un programme
 *   5e_algorithmique-programmation-5e_P6  Repérer et corriger une erreur dans un programme
 *
 * PÉRIMÈTRE OFFICIEL (JSON du programme, objet « algorithmique_programmation »,
 * niveau 5e — rôle : approfondissement de la 6e) :
 *   include — « Définir et utiliser des variables (lecture) »,
 *             « Boucles inconditionnelles (répéter n fois) »,
 *             « Tracer des figures simples »
 *   exclude — « Conditions composées »
 *
 * CE QUE LA 5e AJOUTE À LA 6e, ET RIEN D'AUTRE. La 6e déplaçait un robot de
 * case en case (leçon `algorithmique-programmation`) : instruction, séquence,
 * ordre, boucle simple, débogage. Cette leçon les REPREND comme acquis et
 * ajoute exactement trois choses : l'instruction porte un NOMBRE, ce nombre
 * peut être une VARIABLE lue (puis une FORMULE), et le programme produit une
 * FIGURE. La frontière est portée par la structure du moteur
 * (components/trace.js) : `KINDS` ne contient ni SI ni TANT QUE, et
 * `makeRepeat` aplatit toute imbrication.
 *
 * CE QUI EST LAISSÉ À LA 4e ET À LA 3e — vérifié module par module :
 *   4e : les conditions (si… alors… sinon), l'écriture DANS une variable au
 *        cours du programme (affectation répétée, compteur qui s'incrémente).
 *   3e : conditions composées (ET, OU), boucles « tant que », blocs/fonctions.
 * En 5e, la variable est LUE — le programme la consulte, il ne la modifie pas.
 * C'est exactement le mot du programme officiel : « variables (lecture) ».
 */
// Le segment de domaine est l'id OFFICIEL du référentiel (`pensee_informatique`,
// avec un souligné), parce que la carte des cours construit le lien de chaque
// leçon comme `/courses/{niveau}/{classe}/{domainId}/{lessonId}`
// (buildLesson, coursesData.js). Un tiret ici ne casse rien de visible : la
// route existe, `check:routes` passe — mais aucune carte ne pointe dessus, et
// l'élève qui clique atterrit sur la page d'accueil.
export const LESSON_BASE_PATH = '/courses/college/5e/pensee_informatique/algorithmique-programmation-5e';

export const LESSON_CONFIG = {
  id: 'algorithmique-programmation-5e',
  sequentialUnlock: true,
  knowledgeMap: true,
  /**
   * Connaissances SUPPOSÉES acquises (état A), toutes de 6e, toutes mesurées
   * par le module 0 :
   *  - `instruction-programme` et `boucle` : la leçon d'algorithmique de 6e a
   *    établi qu'un programme est une suite d'instructions ordonnées et qu'une
   *    répétition évite de tout réécrire. Ici on ne les redécouvre pas : on
   *    leur donne un nombre à porter.
   *  - `angle-droit` et `rapporteur` : tourner de 90°, lire un angle en degrés.
   *  - `calcul-numerique` et `tables-multiplication` : évaluer 4 × 90, 360 ÷ 6.
   *  - `perimetre` : le tour d'une figure, dont la longueur totale du tracé est
   *    la lecture directe.
   * La VARIABLE, l'ENTRÉE, la FORMULE, la boucle « n fois » paramétrée et le
   * lien 360 ÷ n sont tous établis DANS la leçon, jamais supposés.
   */
  priorKnowledge: [
    'instruction-programme',
    'boucle',
    'angle-droit',
    'rapporteur',
    'calcul-numerique',
    'tables-multiplication',
    'perimetre',
  ],
  title: 'Algorithmique et programmation',
  description:
    "Programmer KIWI, le stylo qui trace : prédire ce qu'un programme dessine, l'exécuter, changer un paramètre, donner une entrée au programme, écrire une formule, puis découvrir la boucle « répéter n fois » et le lien qui ferme toute figure régulière — 360 ÷ n.",
  level: 'college',
  grade: '5e',
  chapter: 'pensee_informatique',
  chapterTitle: 'Pensée informatique',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '💻',
  estimatedDurationMin: 85,
  skills: [
    "Prédire ce qu'un programme va produire, avant de l'exécuter",
    "Exécuter un programme instruction par instruction",
    'Donner une entrée à un programme et lire sa variable',
    'Écrire une formule qui calcule à partir d’une entrée',
    'Utiliser une boucle « répéter n fois »',
    'Tracer une figure régulière et justifier son angle par 360 ÷ n',
    'Repérer et corriger l’erreur d’un programme qui ne produit pas la figure attendue',
  ],
  teachingScope: {
    include: [
      'Définir et utiliser des variables (lecture)',
      'Boucles inconditionnelles (répéter n fois)',
      'Tracer des figures simples',
    ],
    exclude: [
      'Conditions composées',
      'Conditions simples (si… alors… sinon)',
      'Boucles conditionnelles (tant que)',
      'Boucles imbriquées',
      'Affectation en cours de programme (compteur)',
      'Création de blocs ou de fonctions',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Cinq questions — jamais bloquantes — sur ce que la 6e t’a déjà appris.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },

    { id: '01', number: 1, slug: 'le-stylo-qui-obeit', path: `${LESSON_BASE_PATH}/le-stylo-qui-obeit`,
      title: 'Le stylo qui obéit', desc: 'Quatre instructions. Devine le dessin, puis regarde-le se tracer.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_algorithmique-programmation-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Démarrer' },

    { id: '02', number: 2, slug: 'une-entree-pour-le-programme', path: `${LESSON_BASE_PATH}/une-entree-pour-le-programme`,
      title: 'Une entrée pour le programme', desc: 'Un seul programme, tous les carrés : la valeur n’est plus écrite dedans.',
      stage: 'discovery',
      teachesLearningPointIds: [
        '5e_algorithmique-programmation-5e_P2',
        '5e_algorithmique-programmation-5e_P3',
      ],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Explorer' },

    { id: '03', number: 3, slug: 'le-programme-calcule', path: `${LESSON_BASE_PATH}/le-programme-calcule`,
      title: 'Le programme calcule', desc: 'Une formule dans l’instruction : le programme ne lit plus, il calcule.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_algorithmique-programmation-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Calculer' },

    { id: '04', number: 4, slug: 'douze-fois-la-meme-chose', path: `${LESSON_BASE_PATH}/douze-fois-la-meme-chose`,
      title: 'Douze fois la même chose', desc: 'Le programme déborde de l’écran. Comment éviter de tout réécrire ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_algorithmique-programmation-5e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Raccourcir' },

    { id: '05', number: 5, slug: 'la-figure-qui-se-referme', path: `${LESSON_BASE_PATH}/la-figure-qui-se-referme`,
      title: 'La figure qui se referme', desc: 'Deux réglages, une seule combinaison qui ferme le tracé. Trouve la règle.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_algorithmique-programmation-5e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Chercher' },

    { id: '06', number: 6, slug: 'le-programme-qui-bugue', path: `${LESSON_BASE_PATH}/le-programme-qui-bugue`,
      title: 'Le programme qui bugue', desc: 'La figure attendue n’arrive pas. Trouve l’instruction fautive, et répare-la.',
      stage: 'formalization',
      teachesLearningPointIds: ['5e_algorithmique-programmation-5e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'Déboguer' },

    // Le module 6 ÉTABLIT la méthode de débogage ; celui-ci l'ENTRAÎNE sur deux
    // bugs d'une autre nature (une valeur en dur, puis un angle qui ne partage
    // pas 360). Séparer les deux n'est pas cosmétique : dans un `practice_lab`,
    // les erreurs ne comptent jamais comme preuve de maîtrise
    // (packages/core/curriculum/lessonStages.js).
    { id: '07', number: 7, slug: 'le-labo-de-reparation', path: `${LESSON_BASE_PATH}/le-labo-de-reparation`,
      title: 'Le labo de réparation', desc: 'Deux programmes cassés, deux causes différentes. À toi de les remettre d’aplomb.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_algorithmique-programmation-5e_P6'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Réparer' },

    { id: '08', number: 8, slug: 'mission-finale-latelier-de-kiwi', path: `${LESSON_BASE_PATH}/mission-finale-latelier-de-kiwi`,
      title: '🏆 Mission finale : l’atelier de KIWI', desc: 'Dix épreuves pour devenir Programmeur-dessinateur.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
