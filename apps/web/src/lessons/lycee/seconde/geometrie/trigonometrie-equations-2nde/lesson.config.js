/**
 * Trigonométrie : identités et équations — Seconde, LEÇON D'EXTENSION.
 *
 * ⚠️ HORS PROGRAMME OFFICIEL (voir trigonometrie-cercle-2nde). Partie 2 du
 * chapitre : elle SUPPOSE la première (cercle, radian, coordonnées, valeurs
 * remarquables) et ne la réenseigne pas.
 *
 * POSITIONNEMENT VERTICAL
 *   revisé      le théorème de Pythagore (4e) et les coordonnées du cercle.
 *   étendu      Pythagore appliqué au rayon 1 devient une identité valable pour
 *               TOUT réel — la première identité du parcours de l'élève.
 *   nouveau     cos²t + sin²t = 1, les formules d'addition, et la résolution
 *               d'une équation trigonométrique sur un intervalle donné.
 *   formalisé   l'idée qu'une équation trigonométrique a DEUX solutions par
 *               tour, lues comme deux points symétriques sur le cercle.
 *   outil       prépare les fonctions trigonométriques de Première.
 *
 * Couverture : P1 → M1 · P2 → M2 · P3 → M3 · P4 → M4.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/geometrie/trigonometrie-equations-2nde';

export const LESSON_CONFIG = {
  id: 'trigonometrie-equations-2nde',
  sequentialUnlock: true,
  title: 'Trigonométrie : identités et équations',
  description: "Utiliser cos²t + sin²t = 1 comme un Pythagore déguisé, additionner deux angles, et résoudre cos t = a ou sin t = b en lisant les solutions sur le cercle.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  emoji: '🧭',
  estimatedDurationMin: 75,
  passingScore: 0.7,
  masteryThreshold: 0.8,
  knowledgeMap: true,

  priorKnowledge: [
    'cercle-trigonometrique', 'radian', 'cos-sin-coordonnees', 'valeurs-remarquables',
    'triangle-rectangle', 'hypotenuse', 'abscisse', 'ordonnee', 'equation-solution',
  ],

  knowledgeAudit: {
    ignore: [
      { term: 'cote-adjacent', reason: 'Vocabulaire du triangle rectangle (3e), employé une fois pour rappeler d’où vient Pythagore.' },
      { term: 'axe-symetrie', reason: 'Symétrie axiale du collège (6e) : sert à décrire la position des deux solutions, ce n’est pas une notion enseignée ici.' },
      { term: 'valeur-absolue', reason: 'Enseignée par valeur-absolue-distance-2nde ; n’apparaît que pour dire que deux coordonnées ont la même valeur absolue.' },
      { term: 'arrondi', reason: 'Notion de 6e ; simple consigne de réponse.' },
      { term: 'coordonnees', reason: 'Repérage du collège, et prérequis déclaré : la partie 1 du chapitre s’appuie déjà dessus.' },
      { term: 'intervalle-crochets', reason: 'Enseigné par ensembles-et-intervalles-2nde ; sert ici à écrire l’intervalle de résolution, jamais à être appris.' },
      { term: 'racine-carree', reason: 'Notion de 4e ; n’apparaît que dans les écritures √2/2 et √3/2 des valeurs remarquables, acquises en partie 1.' },
      { term: 'perimetre', reason: 'Notion de 6e ; sert une fois à rappeler POURQUOI le tour vaut 2π (périmètre d’un cercle de rayon 1).' },
      { term: 'tangente', reason: 'Citée une seule fois, dans le diagnostic, pour désigner la troisième touche trigonométrique de la calculatrice (3e) — hors périmètre de cette leçon.' },
    ],
  },

  teachingScope: {
    include: [
      'cos²t + sin²t = 1, et son usage pour retrouver une coordonnée',
      'Les formules d\'addition du cosinus et du sinus',
      'Résoudre cos t = a sur un intervalle donné',
      'Résoudre sin t = b sur un intervalle donné',
    ],
    exclude: [
      'Le cercle, le radian et les coordonnées (partie 1 de ce chapitre)',
      'Les fonctions sinus et cosinus d\'une variable réelle (Première)',
      'Formules de duplication et de linéarisation (Première)',
    ],
  },

  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Ce que le cercle t\'a déjà appris.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'pythagore-sur-le-cercle', path: `${LESSON_BASE_PATH}/pythagore-sur-le-cercle`, title: 'Pythagore sur le cercle', desc: 'Un triangle rectangle caché sous chaque point du cercle.', stage: 'trigger', teachesLearningPointIds: ['seconde_trigonometrie-equations-2nde_P1'], color: 'violet', style: 'featured', estimatedMin: 18, difficulty: 2, actionText: 'Découvrir' },
    { id: '02', number: 2, slug: 'additionner-deux-angles', path: `${LESSON_BASE_PATH}/additionner-deux-angles`, title: 'Additionner deux angles', desc: 'cos(a + b) n\'est pas cos a + cos b — et le cercle le prouve.', stage: 'discovery', teachesLearningPointIds: ['seconde_trigonometrie-equations-2nde_P2'], color: 'indigo', style: 'default', estimatedMin: 16, difficulty: 3, actionText: 'Vérifier' },
    { id: '03', number: 3, slug: 'resoudre-cos-t-egale-a', path: `${LESSON_BASE_PATH}/resoudre-cos-t-egale-a`, title: 'Résoudre cos t = a', desc: 'Une droite verticale, deux points : deux solutions.', stage: 'formalization', teachesLearningPointIds: ['seconde_trigonometrie-equations-2nde_P3'], color: 'emerald', style: 'default', estimatedMin: 12, difficulty: 3, actionText: 'Résoudre' },
    { id: '04', number: 4, slug: 'resoudre-sin-t-egale-b', path: `${LESSON_BASE_PATH}/resoudre-sin-t-egale-b`, title: 'Résoudre sin t = b', desc: 'La même méthode, mais l\'autre symétrie.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_trigonometrie-equations-2nde_P4'], color: 'amber', style: 'default', estimatedMin: 12, difficulty: 4, actionText: 'Résoudre' },
    { id: '05', number: 5, slug: 'mission-finale-les-equations', path: `${LESSON_BASE_PATH}/mission-finale-les-equations`, title: '🏆 Mission finale : les équations', desc: 'Dix épreuves sur l\'identité, l\'addition et les deux résolutions.', stage: 'evaluation', color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi' },
  ],
};

export default LESSON_CONFIG;
