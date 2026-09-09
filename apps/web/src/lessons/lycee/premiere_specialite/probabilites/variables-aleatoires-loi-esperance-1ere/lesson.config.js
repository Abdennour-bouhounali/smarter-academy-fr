/**
 * Variables aléatoires : loi et espérance — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 6 LP
 * (clé catalogue `premiere_specialite_variables-aleatoires`, partie 1/2,
 * append-only) :
 *
 *   premiere_specialite_variables-aleatoires-loi-esperance-1ere_P1  Définir une variable aléatoire discrète
 *   premiere_specialite_variables-aleatoires-loi-esperance-1ere_P2  Déterminer la loi de probabilité d'une variable aléatoire
 *   premiere_specialite_variables-aleatoires-loi-esperance-1ere_P3  Représenter une loi de probabilité par un tableau
 *   premiere_specialite_variables-aleatoires-loi-esperance-1ere_P4  Calculer l'espérance d'une variable aléatoire
 *   premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5  Interpréter l'espérance dans le contexte
 *   premiere_specialite_variables-aleatoires-loi-esperance-1ere_P6  Utiliser l'espérance pour une prise de décision
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un lancer de roue est
 * imprévisible, mais la MOYENNE d'un très grand nombre de lancers, elle, est
 * prévisible — et se calcule à partir du seul tableau des gains et de leurs
 * probabilités, sans jamais lancer la roue. Ce nombre prévisible n'est en
 * général AUCUN gain que la roue puisse donner : la roue paie 0, 1 ou 5 €, et
 * la moyenne se pose sur 1,40 €.
 *
 * Objet porté : LA ROUE ET LE GRAND LIVRE (components/WheelLab.jsx), reprise au
 * module 4 pour y superposer le calcul, puis remplacée par des situations
 * (tombola, deux offres) aux modules 5 et 6.
 *
 * PÉRIMÈTRE : pas de variance, pas d'écart type d'une variable aléatoire, pas
 * de loi binomiale ni de coefficients binomiaux — c'est « Variables aléatoires :
 * dispersion et loi binomiale ». Pas de somme de variables aléatoires ni de
 * linéarité de l'espérance (Terminale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/probabilites/variables-aleatoires-loi-esperance-1ere';

export const LESSON_CONFIG = {
  id: 'variables-aleatoires-loi-esperance-1ere',
  // Connaissances SUPPOSÉES acquises, établies par les leçons de 2de, chacune
  // MESURÉE par une question du module 0 :
  //   probabilite, frequence-probabilite — la leçon PART d'une probabilité
  //     connue et de son lien avec une fréquence observée (va-d1, va-d5) ;
  //   issue-evenement, experience-aleatoire — l'univers d'une expérience et
  //     ses issues sont le support sur lequel on posera un nombre (va-d2) ;
  //   somme-branches — la somme des probabilités d'un même nœud vaut 1 : c'est
  //     exactement ce que la ligne du tableau devra vérifier (va-d3) ;
  //   produit-chemin, somme-chemins — de « Arbres pondérés » (2de) : pour
  //     regrouper plusieurs issues sous un même résultat (va-d4) ;
  //   proportion-reference — une part se lit toujours PAR RAPPORT à un tout,
  //     et le tout ici est le nombre de secteurs (va-d6).
  priorKnowledge: [
    'experience-aleatoire', 'issue-evenement', 'probabilite', 'somme-branches',
    'produit-chemin', 'somme-chemins', 'frequence-probabilite', 'proportion-reference',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Variables aléatoires : loi et espérance',
  description:
    "Une roue de loterie donne 0, 1 ou 5 € au hasard : impossible de prévoir un lancer. Mais sur cinq cents lancers, la moyenne des gains se pose toujours au même endroit — 1,40 €, une somme que la roue ne paie jamais. Ce nombre se calcule à partir du seul tableau des gains : c'est l'espérance, et elle suffit à décider si un jeu vaut la peine d'être joué.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'probabilites',
  chapterTitle: 'Probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎲',
  estimatedDurationMin: 80,
  skills: [
    'Définir une variable aléatoire sur une expérience aléatoire',
    'Dresser la loi de probabilité et la présenter en tableau',
    'Calculer l’espérance et l’interpréter comme moyenne à long terme',
    'Décider si un jeu est équitable, et choisir entre deux offres',
  ],
  teachingScope: {
    include: [
      'Variable aléatoire discrète : un nombre associé à chaque issue d’une expérience aléatoire',
      'Loi de probabilité : les valeurs prises et leurs probabilités, de somme 1',
      'Tableau de loi de probabilité : le présenter, le lire, le compléter',
      'Espérance E(X) = Σ xᵢ pᵢ : le calcul',
      'Interprétation de l’espérance comme moyenne des résultats sur un très grand nombre de répétitions',
      'Jeu équitable, bénéfice espéré, comparaison de deux offres par leur espérance',
    ],
    exclude: [
      'La variance et l’écart type d’une variable aléatoire (leçon « Variables aléatoires : dispersion et loi binomiale »)',
      'La loi binomiale, les coefficients binomiaux et la répétition d’épreuves identiques (même leçon)',
      'La somme de deux variables aléatoires et la linéarité de l’espérance (Terminale)',
      'Les variables aléatoires continues et les densités (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur les probabilités, les arbres pondérés et les fréquences de 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-roue-et-le-grand-livre', path: `${LESSON_BASE_PATH}/la-roue-et-le-grand-livre`, title: 'La roue et le grand livre', desc: 'Un lancer : imprévisible. Cinq cents lancers : la moyenne se pose toujours au même endroit — et ce n’est aucun gain de la roue.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P1', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Lancer la roue' },
    { id: '02', number: 2, slug: 'un-nombre-par-issue', path: `${LESSON_BASE_PATH}/un-nombre-par-issue`, title: 'Un nombre par issue', desc: 'Le gain associé à chaque secteur porte un nom : c’est une variable aléatoire. Un nom, une notation, et ce qu’elle n’est pas.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Nommer le nombre' },
    { id: '03', number: 3, slug: 'la-loi-et-son-tableau', path: `${LESSON_BASE_PATH}/la-loi-et-son-tableau`, title: 'La loi et son tableau', desc: 'Regrouper les secteurs par gain, compter, diviser : le tableau de la loi se remplit, et sa dernière case vaut toujours 1.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P2', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Dresser la loi' },
    { id: '04', number: 4, slug: 'calculer-l-esperance', path: `${LESSON_BASE_PATH}/calculer-l-esperance`, title: 'Calculer l’espérance', desc: 'Somme des gains × leur probabilité : le nombre tombe, et c’est exactement la ligne où la moyenne des cinq cents lancers s’était posée.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P4'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Poser le calcul' },
    { id: '05', number: 5, slug: 'ce-que-l-esperance-veut-dire', path: `${LESSON_BASE_PATH}/ce-que-l-esperance-veut-dire`, title: 'Ce que l’espérance veut dire', desc: 'Une tombola de fête : 1,275 € par billet, et pourtant aucun billet ne paie ça. Ce que ce nombre annonce vraiment, et à qui.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Interpréter' },
    { id: '06', number: 6, slug: 'decider-avec-l-esperance', path: `${LESSON_BASE_PATH}/decider-avec-l-esperance`, title: 'Décider avec l’espérance', desc: 'Jeu équitable ou non ? Deux offres, un seul choix rationnel — et ce n’est pas celle qui affiche le plus gros lot.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-loi-esperance-1ere_P6', 'premiere_specialite_variables-aleatoires-loi-esperance-1ere_P5'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Choisir' },
    { id: '07', number: 7, slug: 'mission-finale-la-roue', path: `${LESSON_BASE_PATH}/mission-finale-la-roue`, title: '🏆 Mission finale : la roue', desc: 'Dix épreuves pour prouver que tu sais dresser une loi, calculer une espérance, l’interpréter et décider avec elle.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
