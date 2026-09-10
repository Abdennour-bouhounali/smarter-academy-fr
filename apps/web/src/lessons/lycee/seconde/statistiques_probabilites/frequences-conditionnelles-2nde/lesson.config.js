/**
 * Fréquences conditionnelles — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 10 LPs (clé catalogue
 * 'seconde_frequences_conditionnelles', append-only) :
 *
 *   seconde_frequences-conditionnelles-2nde_P1   Comprendre une fréquence conditionnelle
 *   seconde_frequences-conditionnelles-2nde_P2   Calculer une fréquence conditionnelle
 *   seconde_frequences-conditionnelles-2nde_P3   Comprendre une fréquence marginale
 *   seconde_frequences-conditionnelles-2nde_P4   Calculer une fréquence marginale
 *   seconde_frequences-conditionnelles-2nde_P5   Compléter un tableau croisé
 *   seconde_frequences-conditionnelles-2nde_P6   Interpréter une fréquence conditionnelle
 *   seconde_frequences-conditionnelles-2nde_P7   Comparer des sous-populations
 *   seconde_frequences-conditionnelles-2nde_P8   Passer des effectifs aux fréquences
 *   seconde_frequences-conditionnelles-2nde_P9   Passer des fréquences aux effectifs
 *   seconde_frequences-conditionnelles-2nde_P10  Interpréter des données réelles
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : c'est le DÉNOMINATEUR qui
 * change tout. Le même effectif, rapporté au total, à sa ligne ou à sa
 * colonne, donne trois nombres différents qui répondent à trois questions
 * différentes. « Parmi les X, la proportion de Y » ne se lit pas comme
 * « parmi les Y, la proportion de X ».
 *
 * Situation portée : UNE ENQUÊTE SUR 400 LYCÉENS (mode de transport × niveau),
 * dont les effectifs sont volontairement déséquilibrés — c'est ce déséquilibre
 * qui rend la comparaison brute trompeuse et la conditionnelle nécessaire.
 *
 * PÉRIMÈTRE : suppose acquis le tableau croisé d'EFFECTIFS (leçon « Tableaux
 * croisés »). Ici on divise. La notation P_A(B) et le vocabulaire
 * probabiliste appartiennent à la leçon « Probabilités conditionnelles ».
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/frequences-conditionnelles-2nde';

export const LESSON_CONFIG = {
  id: 'frequences-conditionnelles-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md), toutes
  // diagnostiquées par le module 0 :
  //   — le quotient et ses deux termes (6e) : ici on ne fait que DIVISER, et
  //     toute la leçon consiste à choisir ce qu'on écrit au dénominateur ;
  //   — le pourcentage (5e) et la proportionnalité qui le porte (6e) ;
  //   — le tableau à double entrée (6e), l'effectif d'un groupe et la fréquence
  //     d'une série statistique (3e), tous posés par la leçon « Tableaux
  //     croisés » qui précède immédiatement celle-ci.
  // La leçon enseigne le reste : la population de référence, les trois
  // fréquences distinguées par leur dénominateur, la somme des conditionnelles
  // d'une même condition, l'erreur d'inversion, et le passage des fréquences
  // aux effectifs.
  priorKnowledge: [
    'quotient', 'numerateur', 'denominateur',
    'pourcentage', 'proportionnalite',
    'tableau-double-entree', 'effectif',
  ],
  // Le terme « même dénominateur » du module 2 ne parle pas de la mise au même
  // dénominateur de deux fractions (technique de 5e) : il dit qu'on ne peut
  // additionner deux fréquences que si elles portent sur le MÊME groupe de
  // référence. Le sens courant, hors périmètre de la leçon.
  knowledgeAudit: {
    ignore: [
      { term: 'denominateur-commun', reason: 'emploi au sens courant — « le même dénominateur », c’est-à-dire le même groupe de référence, pas la mise au même dénominateur de deux fractions' },
      // « la moyenne de 25 % et 40 % » est un distracteur du module 4 : la
      // leçon s'en sert pour dire que moyenner deux pourcentages de références
      // différentes n'a pas de sens. L'indicateur lui-même est du programme de
      // 3e et n'est ni enseigné ni exigé ici.
      { term: 'moyenne', reason: 'apparaît uniquement comme distracteur (« la moyenne de 25 % et 40 % »), justement pour être réfuté ; l’indicateur n’est ni enseigné ni demandé' },
    ],
  },
  title: 'Fréquences conditionnelles',
  description:
    "Prendre une case d'un tableau croisé et la diviser tour à tour par le total, par sa ligne, puis par sa colonne : trois nombres différents pour un même effectif. Changer soi-même la population de référence jusqu'à ce que le dénominateur cesse d'être une convention d'écriture et devienne le groupe dont on parle.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 78,
  skills: [
    'Distinguer fréquence marginale, conjointe et conditionnelle par leur dénominateur',
    'Calculer une fréquence conditionnelle et l’interpréter avec le mot « parmi »',
    'Comprendre pourquoi « parmi les X, les Y » diffère de « parmi les Y, les X »',
    'Compléter un tableau croisé et passer des effectifs aux fréquences, et inversement',
    'Comparer honnêtement deux sous-populations de tailles différentes',
  ],
  teachingScope: {
    include: [
      'Fréquence marginale : effectif d’une modalité ÷ effectif total',
      'Fréquence conjointe : effectif d’une case ÷ effectif total',
      'Fréquence conditionnelle : effectif d’une case ÷ effectif de la population de référence (sa ligne ou sa colonne)',
      'Les conditionnelles selon une même condition somment à 1 ; « parmi les X les Y » ≠ « parmi les Y les X »',
      'Passer des fréquences aux effectifs (effectif = fréquence × effectif de référence) et compléter un tableau',
    ],
    exclude: [
      'Construction du tableau croisé d’effectifs, variables nominales/ordinales, filtres ET/OU/NON (leçon « Tableaux croisés »)',
      'Notation P_A(B), arbre pondéré, probabilité (leçons « Probabilités conditionnelles » et « Arbres de probabilités »)',
      'Indépendance de deux variables (programme de première)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les proportions et la lecture d’un tableau croisé.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-meme-case-trois-nombres', path: `${LESSON_BASE_PATH}/la-meme-case-trois-nombres`, title: 'La même case, trois nombres', desc: 'Un effectif, trois dénominateurs possibles. Choisis la population de référence et regarde le pourcentage changer.', stage: 'trigger', teachesLearningPointIds: ['seconde_frequences-conditionnelles-2nde_P1', 'seconde_frequences-conditionnelles-2nde_P3'], color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Changer la référence' },
    { id: '02', number: 2, slug: 'marginale-conjointe-conditionnelle', path: `${LESSON_BASE_PATH}/marginale-conjointe-conditionnelle`, title: 'Marginale, conjointe, conditionnelle', desc: 'Trois noms pour trois dénominateurs. Et une somme qui vaut 1 — mais pas n’importe laquelle.', stage: 'discovery', teachesLearningPointIds: ['seconde_frequences-conditionnelles-2nde_P2', 'seconde_frequences-conditionnelles-2nde_P4', 'seconde_frequences-conditionnelles-2nde_P8'], color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Nommer les trois' },
    { id: '03', number: 3, slug: 'parmi-les-uns-parmi-les-autres', path: `${LESSON_BASE_PATH}/parmi-les-uns-parmi-les-autres`, title: 'Parmi les uns, parmi les autres', desc: 'Même case, deux conditions opposées : 80 % dans un sens, 30 % dans l’autre. Le mot « parmi » désigne le dénominateur.', stage: 'discovery', teachesLearningPointIds: ['seconde_frequences-conditionnelles-2nde_P6', 'seconde_frequences-conditionnelles-2nde_P7'], color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Inverser la condition' },
    { id: '04', number: 4, slug: 'des-frequences-aux-effectifs', path: `${LESSON_BASE_PATH}/des-frequences-aux-effectifs`, title: 'Des fréquences aux effectifs', desc: 'On ne donne plus que des pourcentages et un total. Reconstruis le tableau case par case.', stage: 'manipulation', teachesLearningPointIds: ['seconde_frequences-conditionnelles-2nde_P5', 'seconde_frequences-conditionnelles-2nde_P9'], color: 'emerald', style: 'featured', estimatedMin: 16, difficulty: 3, actionText: 'Reconstruire' },
    { id: '05', number: 5, slug: 'atelier-donnees-reelles', path: `${LESSON_BASE_PATH}/atelier-donnees-reelles`, title: 'Atelier : données réelles', desc: 'Trois affirmations tirées d’articles : laquelle le tableau soutient-il vraiment ?', stage: 'practice_lab', teachesLearningPointIds: ['seconde_frequences-conditionnelles-2nde_P10', 'seconde_frequences-conditionnelles-2nde_P6', 'seconde_frequences-conditionnelles-2nde_P7'], color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Vérifier' },
    { id: '06', number: 6, slug: 'mission-finale-le-denominateur', path: `${LESSON_BASE_PATH}/mission-finale-le-denominateur`, title: '🏆 Mission finale : le dénominateur', desc: 'Dix épreuves pour prouver que tu sais toujours par quoi diviser.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
