/**
 * Probabilités : inverser le conditionnement et l'indépendance — 1ère spé.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_probabilites_conditionnelles_independance',
 * partie 2/2, append-only) :
 *
 *   premiere_specialite_probabilites-independance-1ere_P1  Inverser un conditionnement
 *   premiere_specialite_probabilites-independance-1ere_P2  Reconnaître l'indépendance de deux événements
 *   premiere_specialite_probabilites-independance-1ere_P3  Vérifier l'indépendance par le calcul
 *   premiere_specialite_probabilites-independance-1ere_P4  Distinguer indépendance et incompatibilité
 *   premiere_specialite_probabilites-independance-1ere_P5  Résoudre un problème concret avec des probabilités conditionnelles
 *
 * CETTE LEÇON EST LA SUITE DIRECTE DE « Probabilités conditionnelles : arbres
 * et probabilités totales » (même clé catalogue, partie 1/2). Ce que celle-là
 * a établi est ACQUIS et vit en `priorKnowledge` :
 *   · `denominateur-decide` — c'est l'ensemble de référence qui décide du
 *     pourcentage ; deux univers concurrents sur les mêmes individus donnent
 *     deux nombres différents ;
 *   · `intersection-vs-conditionnelle` — P(A ∩ B) et P_B(A) ont le même
 *     numérateur et deux dénominateurs ;
 *   · `conditionnelle-sur-effectifs` — la méthode de calcul sur un comptage ;
 *   · `phrase-population-reference` — dire « parmi les… » avant de parler ;
 *   · `arbre-instrument`, `probabilites-totales`, `partition` — l'arbre comme
 *     dispositif de calcul, la somme des chemins et sa condition d'emploi.
 * Et ce que la SECONDE a établi (deux leçons livrées) : `univers-restreint`,
 * `notation-sachant`, `inversion`, `arbre-structure`, `somme-branches`,
 * `poids-conditionnels`, `produit-chemin`, `somme-chemins`.
 *
 * L'APPORT PROPRE DE CETTE LEÇON, et l'idée centrale vécue avant d'être
 * nommée : RETOURNER UN CONDITIONNEMENT N'EST PAS ÉCHANGER DEUX LETTRES. Les
 * deux arbres d'une même population — l'un conditionné par A d'abord, l'autre
 * par B d'abord — portent des poids DIFFÉRENTS, parce que le dénominateur
 * change de camp. Sauf dans un cas très particulier, où les poids de deuxième
 * génération deviennent identiques dans les deux branches : savoir A ne change
 * alors RIEN à B. Ce cas a un nom, il se RECONNAÎT à l'œil sur l'arbre et se
 * VÉRIFIE par le calcul. Et il ne faut surtout pas le confondre avec le cas où
 * A et B ne peuvent pas se produire ensemble — qui en est presque l'opposé.
 *
 * Objet porté : LES DEUX ARBRES QU'ON RETOURNE
 * (components/TwoTreesLab.jsx). Mille élèves, DEUX SÉPARATIONS QU'ON FAIT
 * GLISSER (jamais de bouton ± : règle utilisateur « le glisser d'abord »,
 * 2026-09-10) ; les deux arbres se recalculent sous le doigt, et l'élève
 * CHERCHE le réglage où les poids de deuxième génération coïncident.
 *
 * PÉRIMÈTRE : pas de répétition d'épreuves identiques ni de loi binomiale
 * (leçon « Variables aléatoires : dispersion et loi binomiale ») ; pas
 * d'indépendance de plus de deux événements ; pas de variables aléatoires
 * indépendantes ; la formule des probabilités totales est EMPLOYÉE, pas
 * réenseignée.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/probabilites/probabilites-independance-1ere';

export const LESSON_CONFIG = {
  id: 'probabilites-independance-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 (voir la table de correspondance dans Module00Diagnostic.jsx) :
  //   univers-restreint, notation-sachant — l'écriture P_A(B) et son
  //     dénominateur (2de) : pi-d1, pi-d2 ;
  //   inversion, denominateur-decide, intersection-vs-conditionnelle —
  //     P_A(B) ≠ P_B(A) est SU ; cette leçon en fait un OUTIL de calcul, elle
  //     ne le redécouvre pas : pi-d2, pi-d3 ;
  //   conditionnelle-sur-effectifs — la méthode de la leçon précédente,
  //     employée à chaque étape : pi-d3 ;
  //   arbre-structure, somme-branches, poids-conditionnels, produit-chemin,
  //     somme-chemins — l'arbre pondéré et ses gestes (2de) : pi-d4, pi-d5 ;
  //   arbre-instrument, probabilites-totales, partition — l'arbre comme
  //     instrument sûr et la somme des chemins (partie 1/2) : pi-d6 ;
  //   probabilite, issue-evenement, effectif, denominateur, quotient,
  //     pourcentage, frequence-conditionnelle — le langage du comptage et de
  //     ses écritures, posé au collège et en 2de, employé partout sans être
  //     enseigné : pi-d7, pi-d8. L'audit strict les exige DÉCLARÉS : une
  //     leçon ne peut pas employer un mot qu'elle ne déclare ni n'établit.
  priorKnowledge: [
    'univers-restreint', 'notation-sachant', 'inversion',
    'denominateur-decide', 'intersection-vs-conditionnelle',
    'conditionnelle-sur-effectifs', 'phrase-population-reference',
    'arbre-structure', 'somme-branches', 'poids-conditionnels',
    'produit-chemin', 'somme-chemins',
    'arbre-instrument', 'probabilites-totales', 'partition',
    'probabilite', 'issue-evenement', 'effectif', 'denominateur',
    'quotient', 'pourcentage', 'frequence-conditionnelle',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Probabilités : inverser le conditionnement et l’indépendance',
  description:
    "Deux arbres de la MÊME population, l'un conditionné dans un sens, l'autre dans l'autre : les poids ne coïncident pas — retourner un conditionnement n'est pas échanger deux lettres. Sauf dans un cas très particulier, qu'on cherche au glisser, qui se reconnaît à l'œil sur l'arbre, se vérifie par une égalité d'entiers, et qu'il ne faut jamais confondre avec deux événements qui ne peuvent pas se produire ensemble.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'probabilites',
  chapterTitle: 'Probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔀',
  estimatedDurationMin: 75,
  skills: [
    'Passer de P_A(B) à P_B(A) en changeant le dénominateur, sur un tableau ou un arbre',
    'Reconnaître sur un arbre que savoir A ne change rien à B',
    'Vérifier l’indépendance par le calcul, dans les trois écritures équivalentes',
    'Distinguer deux événements indépendants de deux événements qui s’excluent',
    'Résoudre un problème concret mêlant les deux sens du conditionnement',
  ],
  teachingScope: {
    include: [
      'Inverser un conditionnement : P_B(A) à partir de P_A(B), le numérateur commun et les deux dénominateurs',
      'Inverser sur un arbre : le chemin rapporté à la somme des chemins',
      'Reconnaître l’indépendance sur un arbre et sur un tableau : les poids de deuxième génération coïncident',
      'Vérifier l’indépendance par le calcul : P(A ∩ B) = P(A) × P(B), et les deux formes conditionnelles équivalentes',
      'Distinguer indépendance et incompatibilité : deux événements possibles qui s’excluent ne sont jamais indépendants',
      'Résoudre un problème concret demandant les deux sens du conditionnement et un verdict d’indépendance',
    ],
    exclude: [
      'La répétition d’épreuves identiques et indépendantes, et la loi binomiale (leçon « Variables aléatoires : dispersion et loi binomiale »)',
      'L’indépendance de trois événements ou plus, et l’indépendance deux à deux',
      'L’indépendance de deux variables aléatoires',
      'La construction d’un arbre pondéré à partir d’un énoncé, et la formule des probabilités totales elle-même (leçon « Probabilités conditionnelles : arbres et probabilités totales »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur l’écriture P_A(B), le dénominateur qui décide et l’arbre pondéré.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'l-arbre-qu-on-retourne', path: `${LESSON_BASE_PATH}/l-arbre-qu-on-retourne`, title: 'L’arbre qu’on retourne', desc: 'Deux arbres de la même population, l’un dans un sens, l’autre dans l’autre. Fais glisser les séparations : les deux se recalculent, et leurs poids ne coïncident jamais — sauf une fois.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_probabilites-independance-1ere_P1', 'premiere_specialite_probabilites-independance-1ere_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire glisser' },
    { id: '02', number: 2, slug: 'retourner-un-conditionnement', path: `${LESSON_BASE_PATH}/retourner-un-conditionnement`, title: 'Retourner un conditionnement', desc: '90 % des préparés sont reçus, mais 45 % seulement des reçus étaient préparés. Le numérateur n’a pas bougé : c’est le dénominateur qui a changé de camp.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_probabilites-independance-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Retourner le calcul' },
    { id: '03', number: 3, slug: 'quand-savoir-ne-change-rien', path: `${LESSON_BASE_PATH}/quand-savoir-ne-change-rien`, title: 'Quand savoir ne change rien', desc: 'Quatre populations à juger. Les poids de deuxième génération coïncident-ils ? L’œil repère un candidat — et se fait piéger une fois sur quatre.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_probabilites-independance-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Juger les quatre cas' },
    { id: '04', number: 4, slug: 'le-verdict-par-le-calcul', path: `${LESSON_BASE_PATH}/le-verdict-par-le-calcul`, title: 'Le verdict par le calcul', desc: 'Trois écritures qui disent la même chose, et une égalité d’entiers qui tranche sans arrondi. Deux dés, deux sommes presque identiques, deux verdicts opposés.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_probabilites-independance-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Trancher par le calcul' },
    { id: '05', number: 5, slug: 'independant-n-est-pas-incompatible', path: `${LESSON_BASE_PATH}/independant-n-est-pas-incompatible`, title: 'Indépendant n’est pas incompatible', desc: 'Deux événements qui ne peuvent pas se produire ensemble sont, en réalité, le contraire d’indépendants. Puis un atelier de 2 000 pièces où tout se joue en même temps.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_probabilites-independance-1ere_P4', 'premiere_specialite_probabilites-independance-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Séparer les deux mots' },
    { id: '06', number: 6, slug: 'mission-finale-les-deux-sens', path: `${LESSON_BASE_PATH}/mission-finale-les-deux-sens`, title: '🏆 Mission finale : les deux sens', desc: 'Dix épreuves pour prouver que tu sais retourner un conditionnement, reconnaître l’indépendance et ne jamais la confondre avec l’exclusion.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
