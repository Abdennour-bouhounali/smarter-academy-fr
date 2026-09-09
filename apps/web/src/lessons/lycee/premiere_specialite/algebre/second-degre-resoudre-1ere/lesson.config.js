/**
 * Second degré : résoudre — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_second_degre', partie 1/2, append-only) :
 *
 *   premiere_specialite_second-degre-resoudre-1ere_P1  Calculer le discriminant d'une équation du second degré
 *   premiere_specialite_second-degre-resoudre-1ere_P2  Résoudre une équation du second degré selon le signe du discriminant
 *   premiere_specialite_second-degre-resoudre-1ere_P3  Déterminer les racines d'un trinôme
 *   premiere_specialite_second-degre-resoudre-1ere_P4  Factoriser un trinôme à partir de ses racines
 *   premiere_specialite_second-degre-resoudre-1ere_P5  Relier les racines et la représentation graphique de la parabole
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : le NOMBRE de solutions d'une
 * équation du second degré se décide AVANT toute résolution, par un seul
 * nombre qui change de signe pile au moment où les deux points d'intersection
 * de la courbe avec l'axe des abscisses se rencontrent. Faire monter la courbe
 * et regarder les points fusionner, c'est voir naître le discriminant.
 *
 * Objet porté : LA PARABOLE QUI REMONTE (components/ParabolaLab.jsx), reprise
 * au module 3 pour lire les trois cas, puis au module 6 pour relier racines et
 * dessin.
 *
 * PÉRIMÈTRE : pas de tableau de signes, pas d'inéquation, pas de modélisation
 * d'un problème concret — c'est « Second degré : signe et problèmes » ; pas de
 * forme canonique comme objet d'étude ; pas de racines complexes.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/algebre/second-degre-resoudre-1ere';

export const LESSON_CONFIG = {
  id: 'second-degre-resoudre-1ere',
  // Connaissances SUPPOSÉES acquises, toutes établies par la 2de, chacune
  // MESURÉE par une question du module 0 :
  //   vocab-notation-fx, image-antecedent — la leçon écrit f(x) = ax² + bx + c
  //     et parle de la valeur en x dès sa première phrase (sd-d1) ;
  //   courbe-representative — le laboratoire fait GLISSER une courbe et
  //     regarde où elle coupe un axe : l'objet « courbe d'une fonction » est
  //     l'outil, pas la matière (sd-d2) ;
  //   fonction-carre — x² et sa courbe sont le point de départ ; la leçon
  //     ajoute bx + c à ce qu'elle sait déjà (sd-d2) ;
  //   equation-solution, methode-verifier-solution — « une solution est un
  //     nombre qui rend l'égalité vraie » et « on vérifie en remplaçant » sont
  //     les gestes de 2de que la leçon réemploie tels quels (sd-d3) ;
  //   produit-nul, vocab-facteur — le passage de la forme factorisée aux
  //     solutions est la règle du produit nul, déjà établie (sd-d4) ;
  //   developper — l'élève doit pouvoir redévelopper ce qu'il factorise pour
  //     se relire (sd-d5).
  //
  // Les trois derniers ids sont ceux du LEXIQUE (scripts/audit/lexicon.json),
  // et non des briques d'une leçon : `coordonnees` (6e), `facteur` (3e) et
  // `racine-carree` (4e). La leçon les EMPLOIE sans les enseigner — un point
  // se lit par ses coordonnées dès le module 1, la forme factorisée est un
  // produit de facteurs, et √Δ suppose la racine carrée acquise. Les déclarer
  // ici les sort de l'audit strict, ET oblige le module 0 à les mesurer :
  //     sd-d2  coordonnees · sd-d4  facteur · sd-d6  racine-carree
  priorKnowledge: [
    'vocab-notation-fx', 'image-antecedent', 'courbe-representative', 'fonction-carre',
    'equation-solution', 'methode-verifier-solution', 'produit-nul', 'vocab-facteur',
    'developper', 'coordonnees', 'facteur', 'racine-carree',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Second degré : résoudre',
  description:
    "Faire monter une parabole jusqu’à ce que ses deux points d’intersection avec l’axe se rejoignent, puis disparaissent : un seul nombre change de signe pile à cet instant. Ce nombre est le discriminant — de quoi compter les solutions avant de les chercher, les calculer dans les trois cas, et factoriser le trinôme à partir d’elles.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'algebre',
  chapterTitle: 'Algèbre',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 80,
  skills: [
    'Calculer le discriminant d’une équation du second degré',
    'Résoudre une équation du second degré dans les trois cas',
    'Déterminer les racines d’un trinôme',
    'Factoriser un trinôme à partir de ses racines',
    'Relier les racines à la parabole',
  ],
  teachingScope: {
    include: [
      'Le discriminant Δ = b² − 4ac d’une équation du second degré ax² + bx + c = 0',
      'Résoudre selon le signe de Δ : deux solutions, une solution double, aucune solution réelle',
      'Les racines d’un trinôme par la formule (−b ± √Δ) / (2a)',
      'La forme factorisée a(x − x₁)(x − x₂) obtenue à partir des racines',
      'Le lien entre les racines et les points d’intersection de la parabole avec l’axe des abscisses',
    ],
    exclude: [
      'Le signe d’un trinôme, son tableau de signes et les inéquations du second degré (leçon « Second degré : signe et problèmes »)',
      'La modélisation de problèmes concrets et l’interprétation des solutions dans un contexte (leçon « Second degré : signe et problèmes »)',
      'La forme canonique comme objet d’étude, et les racines complexes (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur f(x), la courbe de la fonction carré, les solutions d’une équation et le produit nul de 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-parabole-qui-remonte', path: `${LESSON_BASE_PATH}/la-parabole-qui-remonte`, title: 'La parabole qui remonte', desc: 'Fais monter la courbe cran par cran. Les deux points d’intersection se rapprochent, fusionnent, disparaissent — et un nombre change de signe pile à cet instant.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P1', 'premiere_specialite_second-degre-resoudre-1ere_P5'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire monter la courbe' },
    { id: '02', number: 2, slug: 'le-discriminant', path: `${LESSON_BASE_PATH}/le-discriminant`, title: 'Le discriminant', desc: 'Le nombre qui a changé de signe porte un nom et une notation : Δ = b² − 4ac. Calcule-le sur des équations que tu ne résoudras pas.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P1', 'premiere_specialite_second-degre-resoudre-1ere_P2'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Nommer le nombre' },
    { id: '03', number: 3, slug: 'les-trois-cas', path: `${LESSON_BASE_PATH}/les-trois-cas`, title: 'Les trois cas', desc: 'Δ > 0, Δ = 0, Δ < 0 : une formule unique donne les solutions, et le troisième cas n’en donne aucune.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P2', 'premiere_specialite_second-degre-resoudre-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Voir les trois cas' },
    { id: '04', number: 4, slug: 'resoudre-pour-de-vrai', path: `${LESSON_BASE_PATH}/resoudre-pour-de-vrai`, title: 'Résoudre pour de vrai', desc: 'Trois équations, trois cas, la même méthode : identifier a, b, c, calculer Δ, conclure. Y compris quand il n’y a rien à conclure.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P2', 'premiere_specialite_second-degre-resoudre-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Résoudre' },
    { id: '05', number: 5, slug: 'factoriser-avec-les-racines', path: `${LESSON_BASE_PATH}/factoriser-avec-les-racines`, title: 'Factoriser avec les racines', desc: 'Une fois les racines connues, la factorisation est offerte : a(x − x₁)(x − x₂). Vérifie-la en redéveloppant.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P4', 'premiere_specialite_second-degre-resoudre-1ere_P3'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Factoriser' },
    { id: '06', number: 6, slug: 'les-racines-sur-la-parabole', path: `${LESSON_BASE_PATH}/les-racines-sur-la-parabole`, title: 'Les racines sur la parabole', desc: 'Un dessin, une réponse : le nombre de points communs avec l’axe donne le signe de Δ sans le moindre calcul.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P5'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Lire la parabole' },
    { id: '07', number: 7, slug: 'mission-finale-le-discriminant', path: `${LESSON_BASE_PATH}/mission-finale-le-discriminant`, title: '🏆 Mission finale : le discriminant', desc: 'Dix épreuves pour prouver que tu sais compter, résoudre, factoriser et lire une parabole.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
