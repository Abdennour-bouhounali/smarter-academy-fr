/**
 * Équations et inéquations — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 7 LPs (clé catalogue
 * 'seconde_equations_et_inequations', append-only) :
 *
 *   seconde_equations-et-inequations-2nde_P1  Comprendre une équation comme une égalité à résoudre.
 *   seconde_equations-et-inequations-2nde_P2  Résoudre une équation du premier degré.
 *   seconde_equations-et-inequations-2nde_P3  Comprendre et résoudre une inéquation du premier degré.
 *   seconde_equations-et-inequations-2nde_P4  Représenter l’ensemble des solutions sur une droite.
 *   seconde_equations-et-inequations-2nde_P5  Résoudre des équations produit.
 *   seconde_equations-et-inequations-2nde_P6  Résoudre des équations quotient avec les restrictions nécessaires.
 *   seconde_equations-et-inequations-2nde_P7  Interpréter et vérifier les solutions.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : résoudre, c'est trouver TOUTES
 * les valeurs de x qui rendent une égalité (ou une inégalité) vraie — on
 * peut les chercher en balayant x, et l'on découvre qu'une équation a
 * souvent une seule solution alors qu'une inéquation en a une infinité (une
 * demi-droite). Ensuite seulement : les transformations qui conservent les
 * solutions, le signe qui se retourne, le produit nul, la valeur interdite.
 *
 * Fil narratif : les deux forfaits (5 + 2x contre 13) — scannés (M1),
 * résolus (M2), comparés (M3), retrouvés au boss.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/equations-et-inequations-2nde';

export const LESSON_CONFIG = {
  id: 'equations-et-inequations-2nde',
  // Connaissances SUPPOSÉES acquises (calcul littéral de 3e, ordre et
  // intervalles d'« ensembles et intervalles »), diagnostiquées par le module 0.
  priorKnowledge: ['calcul-litteral', 'developper', 'nombres-relatifs',
    'ordre-nombres', 'intervalle', 'intervalle-crochets', 'ensemble-reels', 'appartient', 'aire', 'perimetre'],
  knowledgeAudit: {
    ignore: [
      // « au maximum 25 € » est la locution courante, pas la notion d'extremum
      // d'une fonction : la leçon ne l'enseigne ni ne la demande.
      { term: 'extremum', reason: 'locution courante « au maximum », pas la notion' },
    ],
  },
  sequentialUnlock: true,
  title: 'Équations et inéquations',
  description:
    "Balayer x pour voir deux forfaits se croiser, isoler x sans casser l'égalité, multiplier une inégalité par −1 et voir l'ordre se retourner, annuler un produit, éviter la valeur interdite d'un quotient : résoudre, c'est trouver toutes les solutions — et le vérifier.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 85,
  skills: [
    'Comprendre une équation comme une égalité à résoudre',
    'Résoudre une équation du premier degré',
    'Comprendre et résoudre une inéquation du premier degré',
    'Représenter l’ensemble des solutions sur une droite',
    'Résoudre des équations produit',
    'Résoudre des équations quotient avec les restrictions nécessaires',
    'Interpréter et vérifier les solutions',
  ],
  teachingScope: {
    include: [
      'Équation = égalité à résoudre ; ensemble des solutions ; vérifier une solution par substitution',
      'Équations du premier degré ax + b = cx + d : transformations qui conservent les solutions, solution fractionnaire exacte',
      'Inéquations du premier degré : le signe se retourne en multipliant/divisant par un négatif ; solutions = intervalle représenté sur la droite',
      'Équation produit nul A × B = 0 ⇔ A = 0 ou B = 0 ; équation quotient A/B = 0 ⇔ A = 0 et B ≠ 0 (valeur interdite)',
      'Modéliser un problème par une équation ou une inéquation, interpréter la solution',
    ],
    exclude: [
      'Les tableaux de signes de produits (leçon « Signe des fonctions »)',
      'Les équations du second degré non factorisées',
      'Les systèmes d’équations',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète. Aucun module « À retenir » n'est attendu
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-scanner-de-solutions', path: `${LESSON_BASE_PATH}/le-scanner-de-solutions`, title: 'Le scanner de solutions', desc: 'Deux forfaits, un curseur : balaye x et regarde où les deux prix se croisent — et où l’un est moins cher.', stage: 'trigger', teachesLearningPointIds: ['seconde_equations-et-inequations-2nde_P1', 'seconde_equations-et-inequations-2nde_P4', 'seconde_equations-et-inequations-2nde_P7', 'seconde_equations-et-inequations-2nde_P10'], color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Balayer x' },
    { id: '02', number: 2, slug: 'isoler-x-sans-casser-legalite', path: `${LESSON_BASE_PATH}/isoler-x-sans-casser-legalite`, title: 'Isoler x sans casser l’égalité', desc: 'Retire 5 des deux côtés, divise par 2 : l’égalité tient, les solutions restent. Un seul côté ? Tout casse.', stage: 'discovery', teachesLearningPointIds: ['seconde_equations-et-inequations-2nde_P2', 'seconde_equations-et-inequations-2nde_P7'], color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Isoler x' },
    { id: '03', number: 3, slug: 'le-signe-qui-se-retourne', path: `${LESSON_BASE_PATH}/le-signe-qui-se-retourne`, title: 'Le signe qui se retourne', desc: '2 < 5. Multiplie par −1 : −2 et −5 changent de côté du zéro… et d’ordre. Puis résous −3x + 4 ≤ 10.', stage: 'discovery', teachesLearningPointIds: ['seconde_equations-et-inequations-2nde_P3', 'seconde_equations-et-inequations-2nde_P4'], color: 'cyan', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Retourner le signe' },
    { id: '04', number: 4, slug: 'produit-nul', path: `${LESSON_BASE_PATH}/produit-nul`, title: 'Produit nul', desc: 'Deux facteurs, un produit : balaye x et vois le produit tomber à 0 exactement quand un facteur s’annule.', stage: 'manipulation', teachesLearningPointIds: ['seconde_equations-et-inequations-2nde_P5', 'seconde_equations-et-inequations-2nde_P7'], color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Annuler le produit' },
    { id: '05', number: 5, slug: 'quotient-et-valeur-interdite', path: `${LESSON_BASE_PATH}/quotient-et-valeur-interdite`, title: 'Quotient et valeur interdite', desc: 'Un trou dans la courbe : la valeur qui annule le dénominateur est interdite. À retenir, pour tous les types.', stage: 'formalization', teachesLearningPointIds: ['seconde_equations-et-inequations-2nde_P6', 'seconde_equations-et-inequations-2nde_P7', 'seconde_equations-et-inequations-2nde_P2', 'seconde_equations-et-inequations-2nde_P5', 'seconde_equations-et-inequations-2nde_P8'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Trouver le trou' },
    { id: '06', number: 6, slug: 'modeliser', path: `${LESSON_BASE_PATH}/modeliser`, title: 'Modéliser', desc: 'Un rectangle, un budget, une vitesse : traduire, résoudre, vérifier, interpréter.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_equations-et-inequations-2nde_P7', 'seconde_equations-et-inequations-2nde_P2', 'seconde_equations-et-inequations-2nde_P3', 'seconde_equations-et-inequations-2nde_P9'], color: 'rose', style: 'featured', estimatedMin: 14, difficulty: 4, actionText: 'Modéliser' },
    { id: '07', number: 7, slug: 'mission-finale-les-deux-forfaits', path: `${LESSON_BASE_PATH}/mission-finale-les-deux-forfaits`, title: '🏆 Mission finale : les deux forfaits', desc: 'Dix épreuves pour prouver qu’aucune équation ne te résiste.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
