/**
 * Modélisation (3e) — « Traduire le réel en mathématiques ».
 *
 * Learning Points (coursesData.js, clé '3e_modelisation', dans l'ordre de
 * `pointsToLearn` — ne jamais inventer ni recalculer un id) :
 *   3e_modelisation-3e_P1  — Identifier les informations utiles dans une situation
 *   3e_modelisation-3e_P2  — Identifier les grandeurs et variables pertinentes
 *   3e_modelisation-3e_P3  — Choisir une représentation adaptée à une situation
 *   3e_modelisation-3e_P4  — Traduire une situation en relation mathématique
 *   3e_modelisation-3e_P5  — Construire un tableau à partir d'une situation
 *   3e_modelisation-3e_P6  — Construire une représentation graphique adaptée
 *   3e_modelisation-3e_P7  — Utiliser une expression littérale pour modéliser une relation
 *   3e_modelisation-3e_P8  — Utiliser une fonction pour modéliser une situation
 *   3e_modelisation-3e_P9  — Choisir entre plusieurs modèles possibles
 *   3e_modelisation-3e_P10 — Utiliser un modèle pour effectuer des prévisions ou des calculs
 *   3e_modelisation-3e_P11 — Interpréter le résultat dans le contexte de la situation
 *   3e_modelisation-3e_P12 — Vérifier la cohérence et les limites d'un modèle
 *
 * IDÉE CENTRALE — modéliser, c'est traduire une situation en mathématiques
 * (grandeurs → variable → relation → représentation) pour raisonner dessus,
 * puis REVENIR à la situation pour interpréter et vérifier. Un modèle doit
 * être d'accord avec TOUTES les données ; alors il prévoit — mais seulement là
 * où il est valable. L'élève doit le vivre avant qu'on le décrive : d'où le
 * laboratoire de modélisation en module 1, où quatre modèles candidats sont
 * rejoués sur trois tickets réels et où la prévision est confrontée au prix
 * réellement payé.
 *
 * CE QUI DISTINGUE CETTE LEÇON de « fonctions-3e » (la machine mystérieuse) :
 * la machine était donnée ; ici, c'est l'élève qui doit la FABRIQUER à partir
 * d'une situation encombrée d'informations inutiles — puis douter d'elle.
 *
 * FIL ROUGE : la trottinette électrique en libre-service (déblocage 1 €,
 * 0,15 € par minute, plafond 8 € par heure) — reprise jusqu'au boss.
 * Voir docs/lessons/3E_MODELISATION_SPEC.md.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/modelisation-3e';

export const LESSON_CONFIG = {
  id: 'modelisation-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (états A du contrat « connaissances avant
  // la demande ») : elles viennent de « fonctions-3e » et des années
  // précédentes, et le module 0 les diagnostique une à une. « affine » n'y
  // figure PAS : cette leçon en fait une famille de modèles et la pose
  // elle-même, par une brique au module 3.
  priorKnowledge: ['proportionnalite', 'fonction', 'notation-fx', 'image', 'fonction-lineaire', 'calcul-litteral', 'equation-premier-degre'],
  knowledgeAudit: {
    ignore: [
      // « aire » et « périmètre » : notions de 6e, jamais manipulées ici. Elles
      // n'apparaissent que dans le tri d'informations du module 2 (« pour
      // l'aire, la marque de la clôture est utile ou non ? »), où la demande
      // porte sur l'utilité d'une donnée, pas sur un calcul d'aire. Les
      // introduire par une brique alourdirait le module sans rien enseigner.
      { term: 'aire', reason: "notion de 6e ; sert seulement d'étiquette de situation dans le tri d'informations du module 2, jamais calculée" },
      { term: 'perimetre', reason: "notion de 6e ; apparaît dans une correction du module 2 (« le périmètre 4c fixe la longueur à clôturer »), jamais demandée" },
    ],
  },
  title: 'Modélisation',
  description:
    "Trier les informations d'une situation, choisir ses grandeurs, tester des modèles sur des données réelles, dérouler tableau, graphique et expression, prévoir — puis revenir au réel pour interpréter et douter.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧠',
  estimatedDurationMin: 88,
  skills: [
    'Identifier les informations utiles, les grandeurs et les variables',
    'Choisir une représentation adaptée à la question posée',
    'Traduire une situation en relation, tableau, graphique, expression, fonction',
    'Choisir entre plusieurs modèles possibles à partir des données',
    'Utiliser un modèle pour prévoir ou calculer',
    'Interpréter un résultat dans le contexte',
    "Vérifier la cohérence et les limites d'un modèle",
  ],
  teachingScope: {
    include: [
      'Tri des informations, grandeurs et variables',
      'Modèles proportionnel, affine, non affine (carré), numérique et géométrique',
      'Tableau, graphique, expression littérale, fonction : quatre écritures d’un même modèle',
      'Prévision, interprétation, domaine de validité, plafonds et extrapolation',
    ],
    exclude: [
      'Modélisation probabiliste continue',
      'Ajustement statistique (droite de régression)',
      'Résolution formelle d’équations (leçon dédiée)',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ',
      desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-laboratoire-de-modelisation', path: `${LESSON_BASE_PATH}/le-laboratoire-de-modelisation`,
      title: 'Le laboratoire de modélisation',
      desc: 'Trie les infos, choisis les grandeurs, teste quatre modèles sur trois tickets — puis prévois.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_modelisation-3e_P1', '3e_modelisation-3e_P2', '3e_modelisation-3e_P4', '3e_modelisation-3e_P10', '3e_modelisation-3e_P11'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Modéliser',
    },
    {
      id: '02', number: 2, slug: 'grandeurs-et-representations', path: `${LESSON_BASE_PATH}/grandeurs-et-representations`,
      title: 'Grandeurs, variables, représentations',
      desc: 'Quelle grandeur dépend de laquelle ? Et quelle écriture pour quelle question ?',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_modelisation-3e_P1', '3e_modelisation-3e_P2', '3e_modelisation-3e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Choisir',
    },
    {
      id: '03', number: 3, slug: 'du-tableau-au-graphique', path: `${LESSON_BASE_PATH}/du-tableau-au-graphique`,
      title: 'Du tableau au graphique',
      desc: 'Remplis le tableau, pose les points, reconnais la forme.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_modelisation-3e_P5', '3e_modelisation-3e_P6'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Construire',
    },
    {
      id: '04', number: 4, slug: 'quel-modele', path: `${LESSON_BASE_PATH}/quel-modele`,
      title: 'Quel modèle ?',
      desc: 'Règle a et b, essaie x² : les points décident du modèle — ou n’en acceptent aucun.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_modelisation-3e_P4', '3e_modelisation-3e_P7', '3e_modelisation-3e_P8', '3e_modelisation-3e_P9'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Ajuster',
    },
    {
      id: '05', number: 5, slug: 'modeliser-cest-traduire', path: `${LESSON_BASE_PATH}/modeliser-cest-traduire`,
      title: 'Modéliser, c’est traduire',
      desc: 'Construis l’expression par cartes, nomme ses paramètres — et le cycle complet.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_modelisation-3e_P4', '3e_modelisation-3e_P7', '3e_modelisation-3e_P8', '3e_modelisation-3e_P11'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Formaliser',
    },
    {
      id: '06', number: 6, slug: 'prevoir-interpreter-douter', path: `${LESSON_BASE_PATH}/prevoir-interpreter-douter`,
      title: 'Prévoir, interpréter, douter',
      desc: 'Un modèle prévoit — mais pas partout : plafond, valeurs impossibles, extrapolation.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_modelisation-3e_P10', '3e_modelisation-3e_P11', '3e_modelisation-3e_P12'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Douter',
    },
    {
      id: '07', number: 7, slug: 'le-grand-projet', path: `${LESSON_BASE_PATH}/le-grand-projet`,
      title: 'Le grand projet',
      desc: 'La fête de fin d’année : deux devis, un seuil, une décision argumentée.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_modelisation-3e_P1', '3e_modelisation-3e_P3', '3e_modelisation-3e_P9', '3e_modelisation-3e_P10', '3e_modelisation-3e_P12'],
      color: 'purple', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Décider',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-bureau-detudes', path: `${LESSON_BASE_PATH}/mission-finale-le-bureau-detudes`,
      title: '🏆 Mission finale : le bureau d’études',
      desc: 'Dix épreuves pour traduire, prévoir et douter comme un ingénieur.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
