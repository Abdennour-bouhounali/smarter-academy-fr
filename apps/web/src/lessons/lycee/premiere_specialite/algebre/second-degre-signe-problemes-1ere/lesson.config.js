/**
 * Second degré : signe et problèmes — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_second_degre', partie 2/2, append-only) :
 *
 *   premiere_specialite_second-degre-signe-problemes-1ere_P1  Déterminer le signe d'un trinôme du second degré
 *   premiere_specialite_second-degre-signe-problemes-1ere_P2  Résoudre une inéquation du second degré
 *   premiere_specialite_second-degre-signe-problemes-1ere_P3  Modéliser un problème concret par une équation du second degré
 *   premiere_specialite_second-degre-signe-problemes-1ere_P4  Modéliser un problème concret par une inéquation du second degré
 *   premiere_specialite_second-degre-signe-problemes-1ere_P5  Interpréter les solutions dans le contexte du problème
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un trinôme ne change de signe
 * qu'à ses racines. Les positions d'une péniche qui passe sous une arche
 * forment donc UNE SEULE bande — jamais un patchwork — et cette bande est
 * ENTRE les racines quand la courbe est tournée vers le bas. Savoir où un
 * trinôme est positif, c'est savoir répondre à « jusqu'où ? » et « à partir de
 * combien ? » dans un problème réel.
 *
 * Objet porté : LE PONT ET LA PÉNICHE (components/PontLab.jsx), repris au
 * module 2 pour établir les trois cas, et au module 3 pour passer de la bande
 * colorée au tableau de signes.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. « Second degré : résoudre » fait GLISSER une
 * courbe et COMPTE ses points d'intersection ; ici la courbe est FIXE et
 * l'élève déplace un OBJET dessous pour lire un INTERVALLE. Le geste est
 * différent, et l'objet mathématique aussi : un ensemble, pas un compteur.
 *
 * PÉRIMÈTRE : le discriminant, la formule des racines et la forme factorisée
 * sont ACQUIS (leçon « Second degré : résoudre ») — cette leçon les emploie
 * sans les réenseigner. Pas de forme canonique comme objet d'étude, pas de
 * variations ni de dérivée, pas d'inéquation-produit d'un degré supérieur.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/algebre/second-degre-signe-problemes-1ere';

export const LESSON_CONFIG = {
  id: 'second-degre-signe-problemes-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 :
  //   discriminant, formule-racines, forme-factorisee-trinome — les trois
  //     acquis de « Second degré : résoudre » (sp-d1, sp-d2). Cette leçon les
  //     EMPLOIE dès le module 2 sans jamais les réenseigner ;
  //   methode-resoudre-inequation, regle-signe-retourne, mem-signe-negatif —
  //     les gestes de 2de sur les inéquations du premier degré, réemployés
  //     tels quels au module 4 (sp-d3, sp-d4) ;
  //   intervalle, borne-incluse-exclue — un ensemble de solutions s'écrit en
  //     intervalles, bornes comprises ou non, et c'est de la 2de (sp-d5).
  //
  // Les deux derniers ids sont ceux du LEXIQUE (scripts/audit/lexicon.json),
  // et non des briques d'une leçon : `intervalle-crochets` (seconde) et
  // `trinome` (première, posé par la leçon amont). La leçon les EMPLOIE sans
  // les enseigner — elle écrit ]2 ; 3[ dès le module 3, et elle appelle
  // « trinôme » ce que la leçon précédente a nommé. Les déclarer ici les sort
  // de l'audit strict, ET oblige le module 0 à les mesurer :
  //     sp-d5  intervalle-crochets · sp-d1  trinome
  priorKnowledge: [
    'discriminant', 'formule-racines', 'forme-factorisee-trinome', 'trinome',
    'methode-resoudre-inequation', 'regle-signe-retourne', 'mem-signe-negatif',
    'intervalle', 'borne-incluse-exclue', 'intervalle-crochets',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Second degré : signe et problèmes',
  description:
    "Déplacer une péniche sous une arche de pont et découvrir que les positions qui passent forment toujours UNE seule bande, jamais un patchwork : un trinôme ne change de signe qu’à ses racines. De là, le tableau de signes, les inéquations du second degré, et les problèmes concrets — trajectoires, aires, optimisation — où une longueur négative n’est jamais une réponse.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'algebre',
  chapterTitle: 'Algèbre',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 80,
  skills: [
    'Déterminer le signe d’un trinôme du second degré',
    'Dresser le tableau de signes d’un trinôme',
    'Résoudre une inéquation du second degré',
    'Modéliser un problème concret par une équation ou une inéquation',
    'Interpréter les solutions dans le contexte du problème',
  ],
  teachingScope: {
    include: [
      'Le signe d’un trinôme selon le signe de Δ et le signe de a',
      'Le tableau de signes d’un trinôme du second degré',
      'La résolution d’une inéquation du second degré, bornes incluses ou exclues',
      'La modélisation d’un problème concret par une équation du second degré',
      'La modélisation d’un problème concret par une inéquation du second degré',
      'L’interprétation des solutions dans le contexte : écarter celles qui n’ont pas de sens',
    ],
    exclude: [
      'Le calcul du discriminant, la formule des racines et la factorisation (leçon « Second degré : résoudre »)',
      'La forme canonique comme objet d’étude, et les racines complexes (Terminale)',
      'Les variations d’une fonction du second degré et la dérivation (leçons d’analyse)',
      'Les inéquations-produits ou quotients de degré supérieur à deux',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur le discriminant, les racines, la forme factorisée et les inéquations du premier degré.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-pont-et-la-peniche', path: `${LESSON_BASE_PATH}/le-pont-et-la-peniche`, title: 'Le pont et la péniche', desc: 'Règle la largeur et la hauteur d’une péniche, puis fais-la glisser sous l’arche. Les positions qui passent s’allument — et elles ne s’allument jamais en morceaux séparés.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire passer la péniche' },
    { id: '02', number: 2, slug: 'le-signe-d-un-trinome', path: `${LESSON_BASE_PATH}/le-signe-d-un-trinome`, title: 'Le signe d’un trinôme', desc: 'Deux nombres suffisent à décider du signe partout : le signe de Δ et le signe de a. Trois cas, et rien d’autre.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Découvrir les trois cas' },
    { id: '03', number: 3, slug: 'le-tableau-de-signes', path: `${LESSON_BASE_PATH}/le-tableau-de-signes`, title: 'Le tableau de signes', desc: 'La bande colorée devient un tableau : les racines en tête de colonne, un signe par intervalle, et le zéro à sa place.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P1'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Dresser le tableau' },
    { id: '04', number: 4, slug: 'resoudre-une-inequation', path: `${LESSON_BASE_PATH}/resoudre-une-inequation`, title: 'Résoudre une inéquation', desc: 'Le tableau de signes lu comme une réponse : les intervalles où le signe convient, avec les bonnes bornes selon que l’inégalité est stricte ou large.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P2'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Résoudre' },
    { id: '05', number: 5, slug: 'du-probleme-au-modele', path: `${LESSON_BASE_PATH}/du-probleme-au-modele`, title: 'Du problème au modèle', desc: 'Un ballon, un rectangle, un enclos : traduire une situation en équation quand la question dit « exactement », en inéquation quand elle dit « au moins ».', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P3', 'premiere_specialite_second-degre-signe-problemes-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Modéliser' },
    { id: '06', number: 6, slug: 'la-reponse-au-probleme', path: `${LESSON_BASE_PATH}/la-reponse-au-probleme`, title: 'La réponse au problème', desc: 'Une longueur ne vaut pas −8 m. Retenir les solutions qui ont un sens, écarter les autres, et répondre par une phrase.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P5'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Interpréter' },
    { id: '07', number: 7, slug: 'mission-finale-le-signe', path: `${LESSON_BASE_PATH}/mission-finale-le-signe`, title: '🏆 Mission finale : le signe et le sens', desc: 'Dix épreuves pour prouver que tu sais lire un signe, résoudre une inéquation, modéliser une situation et répondre à la vraie question.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
