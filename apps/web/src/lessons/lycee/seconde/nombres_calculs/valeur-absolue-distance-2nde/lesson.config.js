/**
 * Valeur absolue et distance — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 5 LPs (clé catalogue
 * 'seconde_valeur_absolue_et_distance', append-only) :
 *
 *   seconde_valeur-absolue-distance-2nde_P1  Interpréter la valeur absolue comme une distance à zéro.
 *   seconde_valeur-absolue-distance-2nde_P2  Calculer la valeur absolue d’un nombre réel.
 *   seconde_valeur-absolue-distance-2nde_P3  Interpréter la distance entre deux nombres réels.
 *   seconde_valeur-absolue-distance-2nde_P4  Résoudre des situations utilisant des distances.
 *   seconde_valeur-absolue-distance-2nde_P5  Relier distance, valeur absolue et intervalles.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : |x| est une LONGUEUR sur la
 * droite — la distance de x à 0 — et deux nombres opposés ont la même ;
 * |b − a| est la distance entre a et b, quel que soit l'ordre ; « |x − a| ≤ r »
 * décrit un faisceau centré en a, c'est-à-dire l'intervalle [a − r ; a + r].
 *
 * Fil narratif : le phare (0) et la côte graduée en km — deux bateaux (M1),
 * la sonde (M2), deux points (M3), le faisceau du phare (M4), figé au boss.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/valeur-absolue-distance-2nde';

export const LESSON_CONFIG = {
  id: 'valeur-absolue-distance-2nde',
  // Connaissances SUPPOSÉES acquises. 'nombres-relatifs' (5e) et 'abscisse'
  // (6e) portent l'opposé et la lecture sur la droite graduée, vécus dès le
  // module 1 ; 'intervalle', 'intervalle-crochets', 'appartient' viennent
  // d'« Ensembles et intervalles » — la leçon écrit ses ensembles de
  // solutions en crochets dès le module 4. Diagnostiquées par q1 (opposé),
  // q2 (abscisse), q3 (soustraction de relatifs), q4 (appartenance) et q5
  // (écriture en crochets).
  priorKnowledge: ['nombres-relatifs', 'abscisse', 'intervalle', 'intervalle-crochets', 'appartient'],
  sequentialUnlock: true,
  title: 'Valeur absolue et distance',
  description:
    "Déplacer un bateau le long d'une côte graduée et lire sa distance au phare, trouver les deux positions à 5 km, mesurer l'écart entre deux bateaux, allumer le faisceau du phare : la valeur absolue comme distance, découverte sur la droite avant d'être écrite.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 59,
  skills: [
    'Interpréter la valeur absolue comme une distance à zéro',
    'Calculer la valeur absolue d’un nombre réel',
    'Interpréter la distance entre deux nombres réels',
    'Résoudre des situations utilisant des distances',
    'Relier distance, valeur absolue et intervalles',
  ],
  teachingScope: {
    include: [
      '|x| = distance de x à 0 ; |x| = x si x ≥ 0, −x si x < 0 ; |x| = |−x|',
      'Distance entre a et b : |b − a| = |a − b|',
      '|x − a| = r : deux solutions a − r et a + r (une si r = 0, aucune si r < 0)',
      '|x − a| ≤ r ⇔ x ∈ [a − r ; a + r] ; version stricte ⇔ intervalle ouvert ; centre et rayon d’un intervalle',
      'Situations : tolérance industrielle, plage de conservation, position à moins de r d’un repère',
    ],
    exclude: [
      'Les inégalités triangulaires et |xy| = |x||y|',
      'La fonction valeur absolue et sa courbe (leçon « Fonctions de référence »)',
      'La résolution générale d’inéquations (leçon « Équations et inéquations »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète. Aucun module « À retenir » n'est attendu
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'deux-bateaux-une-distance', path: `${LESSON_BASE_PATH}/deux-bateaux-une-distance`, title: 'Deux bateaux, une distance', desc: 'Un phare en 0, une côte graduée en km. Déplace le bateau : à quelle distance du phare est-il ?', stage: 'trigger', teachesLearningPointIds: ['seconde_valeur-absolue-distance-2nde_P1'], color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Déplacer le bateau' },
    { id: '02', number: 2, slug: 'calculer-une-valeur-absolue', path: `${LESSON_BASE_PATH}/calculer-une-valeur-absolue`, title: 'Calculer |x|', desc: 'Une machine à deux règles : si x ≥ 0 elle rend x, sinon elle rend −x. Pourquoi −x est-il positif ?', stage: 'discovery', teachesLearningPointIds: ['seconde_valeur-absolue-distance-2nde_P2', 'seconde_valeur-absolue-distance-2nde_P1'], color: 'sky', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Tester la machine' },
    { id: '03', number: 3, slug: 'la-distance-entre-deux-nombres', path: `${LESSON_BASE_PATH}/la-distance-entre-deux-nombres`, title: 'La distance entre deux nombres', desc: 'Deux bateaux, une barre entre eux : |b − a| ou |a − b|, c’est la même longueur. Et si les deux avancent ?', stage: 'discovery', teachesLearningPointIds: ['seconde_valeur-absolue-distance-2nde_P3'], color: 'cyan', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Mesurer l’écart' },
    { id: '04', number: 4, slug: 'le-faisceau', path: `${LESSON_BASE_PATH}/le-faisceau`, title: 'Le faisceau du phare', desc: 'Un centre, un rayon : le faisceau éclaire tous les x tels que |x − a| ≤ r. C’est un intervalle.', stage: 'manipulation', teachesLearningPointIds: ['seconde_valeur-absolue-distance-2nde_P5', 'seconde_valeur-absolue-distance-2nde_P4'], color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Allumer le faisceau' },
    { id: '05', number: 5, slug: 'situations', path: `${LESSON_BASE_PATH}/situations`, title: 'Situations', desc: 'Une vis à 20 mm ± 0,5, un vaccin entre 2 et 8 °C, un randonneur à moins de 1,5 km de la borne 12.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_valeur-absolue-distance-2nde_P4', 'seconde_valeur-absolue-distance-2nde_P5'], color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Résoudre' },
    { id: '06', number: 6, slug: 'mission-finale-le-phare', path: `${LESSON_BASE_PATH}/mission-finale-le-phare`, title: '🏆 Mission finale : le phare', desc: 'Dix épreuves pour prouver qu’aucune distance ne te trompe.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
