/**
 * Proportions et pourcentages — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 11 LPs (clé catalogue
 * 'seconde_proportions_et_pourcentages', append-only) :
 *
 *   seconde_proportions-pourcentages-2nde_P1   Calculer une proportion
 *   seconde_proportions-pourcentages-2nde_P2   Exprimer une proportion sous forme décimale
 *   seconde_proportions-pourcentages-2nde_P3   Exprimer une proportion sous forme fractionnaire
 *   seconde_proportions-pourcentages-2nde_P4   Exprimer une proportion en pourcentage
 *   seconde_proportions-pourcentages-2nde_P5   Calculer une proportion de proportion
 *   seconde_proportions-pourcentages-2nde_P6   Interpréter un pourcentage de pourcentage
 *   seconde_proportions-pourcentages-2nde_P7   Distinguer proportion et évolution
 *   seconde_proportions-pourcentages-2nde_P8   Identifier une variation additive
 *   seconde_proportions-pourcentages-2nde_P9   Identifier une variation multiplicative
 *   seconde_proportions-pourcentages-2nde_P10  Utiliser un coefficient multiplicateur
 *   seconde_proportions-pourcentages-2nde_P11  Passer d'un taux d'évolution à un coefficient multiplicateur
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : « 30 % » ne veut rien dire
 * seul — il faut savoir DE QUOI. Une proportion se rapporte à un TOUT
 * (un état) ; une évolution se rapporte à la valeur de DÉPART (une variation).
 * Les deux s'écrivent « % », d'où toute la confusion. Le coefficient
 * multiplicateur k = 1 + t est ce qui rend les évolutions calculables.
 *
 * Situation portée : LE LYCÉE DE 800 ÉLÈVES — sous-groupes emboîtés
 * (demi-pensionnaires, dont les internes…) pour les proportions, et
 * l'effectif d'une année sur l'autre pour les évolutions. Elle ouvre la
 * leçon (M1) et revient aux modules 2, 3 et 5.
 *
 * PÉRIMÈTRE : la leçon n'enchaîne PAS plusieurs évolutions ni ne calcule
 * d'évolution réciproque (leçon « Évolutions successives et réciproques ») ;
 * elle installe le coefficient d'UNE évolution, dont l'autre leçon fera le
 * produit. Elle ne fait pas non plus de statistiques descriptives.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/proportions-pourcentages-2nde';

export const LESSON_CONFIG = {
  id: 'proportions-pourcentages-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md), toutes venues du
  // collège et toutes diagnostiquées par le module 0 :
  //   — écritures d'un même nombre : fraction, quotient, écriture décimale,
  //     numérateur/dénominateur, fraction décimale ;
  //   — le pourcentage tel qu'il est vu au collège (5e) : appliquer « 25 % de
  //     60 », et la proportionnalité qui le porte (6e) ;
  //   — l'effectif d'un groupe (3e), qu'on compte ici avant de le rapporter.
  // La leçon enseigne le reste : proportion et tout de référence, les trois
  // écritures comme un seul nombre, la proportion de proportion, la
  // distinction état/variation, le taux et le coefficient multiplicateur.
  priorKnowledge: [
    'quotient', 'numerateur', 'denominateur', 'fraction-decimale',
    'pourcentage', 'proportionnalite', 'coefficient-proportionnalite',
    'effectif',
  ],
  knowledgeAudit: {
    ignore: [
      // « fraction irréductible » (5e) et « facteur commun » (3e) : la leçon
      // demande de SIMPLIFIER une fraction au module 2, geste acquis au
      // collège, mais elle n'enseigne ni la définition ni la recherche du
      // PGCD — c'est arithmetique-2nde qui les porte. Les deux mots
      // n'apparaissent que dans une correction, pour nommer ce que l'élève
      // vient de faire.
      { term: 'irreductible', reason: 'geste de 5e réactivé dans une correction ; la leçon ne l’enseigne pas' },
      { term: 'facteur-commun', reason: 'mot de 3e employé pour nommer le diviseur choisi, hors périmètre de la leçon' },
      // « attention au chiffre des centièmes » (module 5, correction de la
      // ligne c5) sert à faire RELIRE 1,035 contre 1,35 : c'est du français
      // courant pour désigner un rang de l'écriture décimale, pas la
      // numération de position de 6e, qui n'est ni enseignée ni exigée ici —
      // aucune question ne demande d'identifier une valeur de position.
      { term: 'valeur-position', reason: 'emploi courant pour montrer où lire la virgule, hors périmètre de la leçon' },
      // Le titre de l'étape 3 du module 5, « Du coefficient au taux », abrège
      // « coefficient MULTIPLICATEUR », qui est l'objet du module et que
      // l'étape 1 a posé (brique coefficient-multiplicateur). Il ne s'agit pas
      // du coefficient d'une fonction linéaire de 3e. Le titre reste tel quel :
      // le raccourci est celui qu'emploie l'élève une fois la notion établie.
      { term: 'coefficient-lineaire', reason: 'abréviation du coefficient multiplicateur posé à l’étape 1 du même module ; autre notion que le coefficient d’une fonction linéaire' },
    ],
  },
  title: 'Proportions et pourcentages',
  description:
    "Découper une population en sous-groupes emboîtés et lire chaque part de trois façons — décimale, fraction, pourcentage —, comprendre qu'un pourcentage de pourcentage se multiplie, puis séparer nettement ce qui décrit un état (une proportion) de ce qui décrit une variation (une évolution), que le coefficient multiplicateur rend calculable.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '%',
  estimatedDurationMin: 73,
  skills: [
    'Calculer une proportion et la lire en décimal, en fraction et en pourcentage',
    'Appliquer un pourcentage à une quantité et retrouver le tout',
    'Calculer une proportion de proportion et savoir à quel tout elle se rapporte',
    'Distinguer une proportion d’une évolution, et un point de pourcentage d’un pourcentage',
    'Passer d’un taux d’évolution à un coefficient multiplicateur, et réciproquement',
  ],
  teachingScope: {
    include: [
      'Proportion p = partie/tout ∈ [0 ; 1] ; trois écritures (décimale, fractionnaire, pourcentage) du même nombre',
      'Appliquer une proportion (partie = p × tout) et remonter au tout (tout = partie/p)',
      'Proportion de proportion : les proportions emboîtées se multiplient ; à quel tout se rapporte le résultat',
      'Proportion (état) vs évolution (variation rapportée au DÉPART) ; point de pourcentage vs pourcentage',
      'Taux d’évolution t = (V_f − V_i)/V_i ; coefficient multiplicateur k = 1 + t ; hausse k > 1, baisse k < 1',
    ],
    exclude: [
      'Évolutions successives, coefficient global, évolution réciproque (leçon « Évolutions successives et réciproques »)',
      'Indicateurs statistiques : moyenne, médiane, quartiles (leçon « Statistiques à une variable »)',
      'Fréquences conditionnelles dans un tableau croisé (leçon « Fréquences conditionnelles »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les fractions, les pourcentages du collège et la proportionnalité.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-lycee-de-800-eleves', path: `${LESSON_BASE_PATH}/le-lycee-de-800-eleves`, title: 'Le lycée de 800 élèves', desc: 'Découpe la population, regarde la part changer. Puis découpe une part de la part : « 30 % » de quoi, au juste ?', stage: 'trigger', teachesLearningPointIds: ['seconde_proportions-pourcentages-2nde_P1', 'seconde_proportions-pourcentages-2nde_P2', 'seconde_proportions-pourcentages-2nde_P4'], color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Découper la population' },
    { id: '02', number: 2, slug: 'trois-ecritures-une-proportion', path: `${LESSON_BASE_PATH}/trois-ecritures-une-proportion`, title: 'Trois écritures, une proportion', desc: 'Décimale, fraction, pourcentage : le même nombre habillé trois fois. Et le tout qu’on retrouve quand on connaît la part.', stage: 'discovery', teachesLearningPointIds: ['seconde_proportions-pourcentages-2nde_P2', 'seconde_proportions-pourcentages-2nde_P3', 'seconde_proportions-pourcentages-2nde_P4', 'seconde_proportions-pourcentages-2nde_P1'], color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Changer d’écriture' },
    { id: '03', number: 3, slug: 'un-pourcentage-de-pourcentage', path: `${LESSON_BASE_PATH}/un-pourcentage-de-pourcentage`, title: 'Un pourcentage de pourcentage', desc: 'Les parts s’emboîtent : 60 % puis 25 % de ceux-là. Ça ne fait ni 85 %, ni 35 % — et le résultat se rapporte au lycée entier.', stage: 'discovery', teachesLearningPointIds: ['seconde_proportions-pourcentages-2nde_P5', 'seconde_proportions-pourcentages-2nde_P6'], color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Emboîter les parts' },
    { id: '04', number: 4, slug: 'etat-ou-variation', path: `${LESSON_BASE_PATH}/etat-ou-variation`, title: 'État ou variation ?', desc: 'Deux phrases, deux « % » qui ne parlent pas de la même chose. Passer de 20 % à 25 %, c’est +5 points — et +25 %.', stage: 'manipulation', teachesLearningPointIds: ['seconde_proportions-pourcentages-2nde_P7', 'seconde_proportions-pourcentages-2nde_P8', 'seconde_proportions-pourcentages-2nde_P9'], color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Trier les phrases' },
    { id: '05', number: 5, slug: 'le-coefficient-multiplicateur', path: `${LESSON_BASE_PATH}/le-coefficient-multiplicateur`, title: 'Le coefficient multiplicateur', desc: 'Une hausse de 12 %, c’est ×1,12. Une baisse de 12 %, ×0,88. Un seul nombre pour faire — et défaire — une évolution.', stage: 'manipulation', teachesLearningPointIds: ['seconde_proportions-pourcentages-2nde_P10', 'seconde_proportions-pourcentages-2nde_P11'], color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Régler le coefficient' },
    { id: '06', number: 6, slug: 'atelier-lire-les-pourcentages', path: `${LESSON_BASE_PATH}/atelier-lire-les-pourcentages`, title: 'Atelier : lire les pourcentages', desc: 'Une remise, un sondage, une hausse de loyer : à chaque fois, de quel tout parle-t-on, et est-ce un état ou une variation ?', stage: 'practice_lab', teachesLearningPointIds: ['seconde_proportions-pourcentages-2nde_P1', 'seconde_proportions-pourcentages-2nde_P5', 'seconde_proportions-pourcentages-2nde_P7', 'seconde_proportions-pourcentages-2nde_P10', 'seconde_proportions-pourcentages-2nde_P3'], color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Décoder' },
    { id: '07', number: 7, slug: 'mission-finale-de-quoi-parle-t-on', path: `${LESSON_BASE_PATH}/mission-finale-de-quoi-parle-t-on`, title: '🏆 Mission finale : de quoi parle-t-on ?', desc: 'Dix épreuves pour prouver que tu sais toujours de quel tout on parle.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 5, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
