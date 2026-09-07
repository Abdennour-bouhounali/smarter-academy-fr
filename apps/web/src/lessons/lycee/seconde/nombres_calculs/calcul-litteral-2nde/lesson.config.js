/**
 * Calcul littéral — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 6 LPs (clé catalogue
 * 'seconde_calcul_litteral', append-only) :
 *
 *   seconde_calcul-litteral-2nde_P1  Identifier et manipuler une expression littérale.
 *   seconde_calcul-litteral-2nde_P2  Réduire une expression.
 *   seconde_calcul-litteral-2nde_P3  Développer une expression.
 *   seconde_calcul-litteral-2nde_P4  Factoriser une expression.
 *   seconde_calcul-litteral-2nde_P5  Choisir une forme développée ou factorisée selon le problème.
 *   seconde_calcul-litteral-2nde_P6  Utiliser le calcul littéral pour démontrer ou résoudre.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une lettre permet de suivre
 * TOUS les nombres à la fois. Un tour de magie qui rend toujours 3 n'est pas
 * une coïncidence testée sur dix nombres : c'est une égalité d'expressions,
 * vraie pour tout x. Réduire, développer, factoriser ne changent que
 * l'écriture ; et chaque écriture répond à une question différente.
 *
 * Périmètre : cette leçon ne résout pas d'équations (leçon « Équations et
 * inéquations ») — elle prépare les formes qui les rendent résolubles.
 * Distinct de la leçon 3e « Calcul littéral et algébrique » (bordure de
 * dalles, tuiles) : ici le programme de calcul, les identités avec des
 * paramètres réglables, le facteur commun composé et le choix de forme.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/calcul-litteral-2nde';

export const LESSON_CONFIG = {
  id: 'calcul-litteral-2nde',
  sequentialUnlock: true,
  // La formalisation de cette leçon est la carte des connaissances (knowledge.jsx),
  // alimentée module après module par les <KnowledgeBrick>.
  knowledgeMap: true,
  title: 'Calcul littéral',
  description:
    "Suivre un tour de magie avec une lettre, empiler des termes semblables, découper un carré de côté a + b, retrouver un facteur commun, choisir la forme qui répond à la question : réduire, développer et factoriser ne changent que l'écriture — et chaque écriture sert à quelque chose.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '✏️',
  estimatedDurationMin: 80,
  skills: [
    'Identifier et manipuler une expression littérale',
    'Réduire une expression',
    'Développer une expression',
    'Factoriser une expression',
    'Choisir une forme développée ou factorisée selon le problème',
    'Utiliser le calcul littéral pour démontrer ou résoudre',
  ],
  teachingScope: {
    include: [
      'Expression littérale = programme de calcul ; deux écritures égales pour tout x ; tester ne prouve pas, le calcul littéral prouve',
      'Réduire : termes semblables (x², x, constantes), coefficients négatifs et décimaux',
      'Développer : double distributivité et les trois identités remarquables, avec les aires',
      'Factoriser : facteur commun numérique, monôme ou binôme (x + 1) ; reconnaître a² − b² et (a + b)²',
      'Choisir la forme : valeur en 0, annulation, signe, minimum ; expressions fractionnaires simples',
    ],
    exclude: [
      'La résolution d’équations et d’inéquations (leçon dédiée)',
      'Les polynômes de degré > 2 et la forme canonique générale (Première)',
      'Les fractions rationnelles au-delà d’une simplification',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-tour-de-magie', path: `${LESSON_BASE_PATH}/le-tour-de-magie`, title: 'Le tour de magie', desc: 'Pense à un nombre, ×3, +9, ÷3, retire ton nombre : toujours 3. Pourquoi ? Suis le calcul avec une lettre.', stage: 'trigger', teachesLearningPointIds: ['seconde_calcul-litteral-2nde_P1', 'seconde_calcul-litteral-2nde_P6'], color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Tester le tour' },
    { id: '02', number: 2, slug: 'reduire', path: `${LESSON_BASE_PATH}/reduire`, title: 'Réduire', desc: 'Des termes de trois formes : x², x, nombres. Seuls les semblables s’empilent — et la valeur ne bouge pas.', stage: 'discovery', teachesLearningPointIds: ['seconde_calcul-litteral-2nde_P2', 'seconde_calcul-litteral-2nde_P1'], color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Empiler' },
    { id: '03', number: 3, slug: 'developper-laire-qui-se-decoupe', path: `${LESSON_BASE_PATH}/developper-laire-qui-se-decoupe`, title: 'Développer : l’aire qui se découpe', desc: 'Un carré de côté a + b se coupe en quatre morceaux. Compte-les : (a + b)² n’est pas a² + b².', stage: 'discovery', teachesLearningPointIds: ['seconde_calcul-litteral-2nde_P3'], color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Découper' },
    { id: '04', number: 4, slug: 'factoriser-le-facteur-commun', path: `${LESSON_BASE_PATH}/factoriser-le-facteur-commun`, title: 'Factoriser : le facteur commun', desc: 'Un nombre, un x, ou tout un (x + 1) : trouve ce que les termes partagent et sors-le devant.', stage: 'manipulation', teachesLearningPointIds: ['seconde_calcul-litteral-2nde_P4'], color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Factoriser' },
    { id: '05', number: 5, slug: 'trois-formes-trois-usages', path: `${LESSON_BASE_PATH}/trois-formes-trois-usages`, title: 'Trois formes, trois usages', desc: 'La même expression, trois écritures : l’une donne A(0), l’autre les zéros, la troisième le minimum. À retenir.', stage: 'formalization', teachesLearningPointIds: ['seconde_calcul-litteral-2nde_P5', 'seconde_calcul-litteral-2nde_P3', 'seconde_calcul-litteral-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Choisir la forme' },
    { id: '06', number: 6, slug: 'demontrer-et-resoudre', path: `${LESSON_BASE_PATH}/demontrer-et-resoudre`, title: 'Démontrer et résoudre', desc: 'Prouver le tour de magie, un carré caché, l’aire d’un cadre, une fraction qui se simplifie.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_calcul-litteral-2nde_P6', 'seconde_calcul-litteral-2nde_P5', 'seconde_calcul-litteral-2nde_P2'], color: 'rose', style: 'featured', estimatedMin: 13, difficulty: 4, actionText: 'Démontrer' },
    { id: '07', number: 7, slug: 'mission-finale-le-magicien', path: `${LESSON_BASE_PATH}/mission-finale-le-magicien`, title: '🏆 Mission finale : le magicien', desc: 'Dix épreuves pour prouver qu’aucune écriture ne te trompe.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
