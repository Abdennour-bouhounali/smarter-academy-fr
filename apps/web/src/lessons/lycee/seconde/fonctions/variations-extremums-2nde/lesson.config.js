/**
 * Variations et extremums — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 12 LPs (clé catalogue
 * 'seconde_variations_et_extremums', append-only) :
 *
 *   seconde_variations-extremums-2nde_P1   Comprendre la croissance d'une fonction
 *   seconde_variations-extremums-2nde_P2   Comprendre la décroissance d'une fonction
 *   seconde_variations-extremums-2nde_P3   Comprendre la monotonie
 *   seconde_variations-extremums-2nde_P4   Lire les variations sur un graphique
 *   seconde_variations-extremums-2nde_P5   Construire un tableau de variations
 *   seconde_variations-extremums-2nde_P6   Lire un tableau de variations
 *   seconde_variations-extremums-2nde_P7   Déterminer un maximum
 *   seconde_variations-extremums-2nde_P8   Déterminer un minimum
 *   seconde_variations-extremums-2nde_P9   Déterminer un extremum sur un intervalle
 *   seconde_variations-extremums-2nde_P10  Relier graphique et tableau de variations
 *   seconde_variations-extremums-2nde_P11  Comparer f(a) et f(b)
 *   seconde_variations-extremums-2nde_P12  Résoudre un problème d'optimisation
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : quand x augmente, f(x) monte
 * ou descend — sur un INTERVALLE. Croissante : a < b ⟹ f(a) ≤ f(b) ;
 * décroissante : a < b ⟹ f(a) ≥ f(b). Le tableau de variations résume la
 * courbe en flèches et en valeurs ; un maximum est une valeur ATTEINTE, à
 * distinguer de l'endroit où on l'atteint, et peut être au bord.
 *
 * Objet porté : le SENTIER (altitude selon la distance) que le randonneur
 * parcourt au module 1 ; son profil revient dans les modules 2, 3, 4.
 *
 * PÉRIMÈTRE : pas de dérivée, pas d'extremum local vs global au-delà de la
 * remarque « sur un intervalle », pas de fonctions de référence (leçon dédiée).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/fonctions/variations-extremums-2nde';

export const LESSON_CONFIG = {
  id: 'variations-extremums-2nde',
  // Connaissances SUPPOSÉES acquises, venues d'« Ensembles et intervalles ».
  // La leçon enseigne « croissante SUR UN INTERVALLE » — pas ce qu'est un
  // intervalle, ni ∈, ni ⊂, qu'elle emploie pour désigner ses domaines
  // ([−4 ; −2], 0 ∈ [−2 ; 2], [−1 ; 1] inclus dans [−2 ; 2]).
  // Diagnostiquées par va-d6 et va-d7.
  priorKnowledge: ['intervalle', 'intervalle-crochets', 'appartient', 'inclus'],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Variations et extremums',
  description:
    "Marcher sur le profil d'un sentier en regardant l'altimètre, peindre sous ses pas les montées et les descentes, puis découvrir que ces flèches sont un tableau de variations : croissante, décroissante, monotone, maximum et minimum — définis avec des inégalités, sans dérivée.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'fonctions',
  chapterTitle: 'Fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 85,
  skills: [
    'Reconnaître la croissance, la décroissance, la monotonie sur un intervalle',
    'Lire les variations sur une courbe et construire un tableau de variations',
    'Lire un tableau de variations et relier tableau et courbe',
    'Déterminer un maximum, un minimum, un extremum sur un intervalle',
    'Comparer f(a) et f(b) sans calculer ; résoudre un problème d’optimisation',
  ],
  teachingScope: {
    include: [
      'Croissante / décroissante / constante sur un intervalle, définitions par inégalités ; monotone ; une propriété se donne toujours sur un intervalle',
      'Tableau de variations : bornes, points de retournement, flèches, valeurs ; lecture et construction ; lien avec la courbe',
      'Maximum et minimum d’une fonction sur un intervalle : valeur atteinte, et où elle est atteinte ; extremum au bord',
      'Comparer f(a) et f(b) avec le seul tableau (et reconnaître quand on ne peut pas conclure) ; encadrer f(x) sur un intervalle',
      'Optimisation : l’aire d’un enclos, un coût minimal',
    ],
    exclude: [
      'La dérivée et le signe de la dérivée (Première)',
      'Le signe d’une fonction et le tableau de signes (leçon « Signe d’une fonction »)',
      'Les fonctions de référence (leçon dédiée)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les images, la lecture graphique et les inégalités.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-randonneur', path: `${LESSON_BASE_PATH}/le-randonneur`, title: 'Le randonneur', desc: 'Fais marcher le randonneur sur le profil du sentier : l’altimètre suit, les montées et les descentes se peignent sous ses pas. Où est le sommet ? Le point le plus bas ?', stage: 'trigger', teachesLearningPointIds: ['seconde_variations-extremums-2nde_P1', 'seconde_variations-extremums-2nde_P2', 'seconde_variations-extremums-2nde_P4'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Marcher' },
    { id: '02', number: 2, slug: 'croissante-decroissante', path: `${LESSON_BASE_PATH}/croissante-decroissante`, title: 'Croissante, décroissante', desc: 'Deux sondes a < b sur une montée : f(a) < f(b), toujours. Sur une descente : l’inverse. Et à cheval sur le sommet : rien de garanti — d’où « sur un intervalle ».', stage: 'discovery', teachesLearningPointIds: ['seconde_variations-extremums-2nde_P1', 'seconde_variations-extremums-2nde_P2', 'seconde_variations-extremums-2nde_P3', 'seconde_variations-extremums-2nde_P11'], color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Comparer' },
    { id: '03', number: 3, slug: 'le-tableau-de-variations', path: `${LESSON_BASE_PATH}/le-tableau-de-variations`, title: 'Le tableau de variations', desc: 'Les flèches peintes deviennent un tableau : bornes, sommets, vallées, valeurs. Construis-le, lis-en un, retrouve la courbe qui lui correspond.', stage: 'discovery', teachesLearningPointIds: ['seconde_variations-extremums-2nde_P5', 'seconde_variations-extremums-2nde_P6', 'seconde_variations-extremums-2nde_P10'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Construire le tableau' },
    { id: '04', number: 4, slug: 'maximum-minimum', path: `${LESSON_BASE_PATH}/maximum-minimum`, title: 'Maximum, minimum', desc: 'Règle l’intervalle : le maximum de h sur [5 ; 10] n’est pas celui sur [0 ; 10]. Une valeur atteinte, l’endroit où on l’atteint — et parfois au bord.', stage: 'manipulation', teachesLearningPointIds: ['seconde_variations-extremums-2nde_P7', 'seconde_variations-extremums-2nde_P8', 'seconde_variations-extremums-2nde_P9'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Régler l’intervalle' },
    { id: '05', number: 5, slug: 'comparer-sans-calculer', path: `${LESSON_BASE_PATH}/comparer-sans-calculer`, title: 'Comparer sans calculer', desc: 'Avec le seul tableau de variations : g(0,5) et g(1,2) ? g(−1) et g(3) ? Parfois on conclut, parfois on ne peut pas. Encadrer g(x) sur un intervalle.', stage: 'manipulation', teachesLearningPointIds: ['seconde_variations-extremums-2nde_P11', 'seconde_variations-extremums-2nde_P6', 'seconde_variations-extremums-2nde_P3'], color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Comparer' },
    { id: '06', number: 6, slug: 'atelier-optimiser', path: `${LESSON_BASE_PATH}/atelier-optimiser`, title: 'Atelier : optimiser', desc: 'Un enclos de 40 m de clôture : quelle largeur donne la plus grande aire ? Un coût minimal à lire dans un tableau. Les variations répondent.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_variations-extremums-2nde_P12', 'seconde_variations-extremums-2nde_P7', 'seconde_variations-extremums-2nde_P8', 'seconde_variations-extremums-2nde_P5', 'seconde_variations-extremums-2nde_P10', 'seconde_variations-extremums-2nde_P4'], color: 'rose', style: 'featured', estimatedMin: 13, difficulty: 4, actionText: 'Optimiser' },
    { id: '07', number: 7, slug: 'mission-finale-le-sommet', path: `${LESSON_BASE_PATH}/mission-finale-le-sommet`, title: '🏆 Mission finale : le sommet', desc: 'Dix épreuves pour prouver que tu lis, construis et utilises les variations d’une fonction.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
