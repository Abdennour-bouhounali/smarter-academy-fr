/**
 * Dérivation : le nombre dérivé et la tangente — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 4 LP
 * (clé catalogue 'premiere_specialite_derivation', partie 1/3, append-only) :
 *
 *   premiere_specialite_derivation-nombre-derive-1ere_P1  Calculer un taux de variation entre deux points
 *   premiere_specialite_derivation-nombre-derive-1ere_P2  Comprendre le nombre dérivé comme limite du taux de variation
 *   premiere_specialite_derivation-nombre-derive-1ere_P3  Interpréter le nombre dérivé comme coefficient directeur de la tangente
 *   premiere_specialite_derivation-nombre-derive-1ere_P4  Déterminer l'équation de la tangente en un point
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : le taux de variation entre deux
 * points d'une courbe est la pente d'une sécante ; quand le second point se
 * rapproche du premier, ces pentes CESSENT DE BOUGER alors même que l'écart
 * n'atteint jamais zéro. Ce nombre-limite est une propriété du POINT, pas d'un
 * couple de points : c'est la pente de la tangente en ce point.
 *
 * Objet porté : la SÉCANTE QUI SE COUCHE (components/SecantLab.jsx), reprise
 * au module 2 avec a mobile, puis gelée en vérification graphique aux modules
 * suivants.
 *
 * PÉRIMÈTRE : pas de règles de calcul (somme, produit, quotient, composée —
 * « Dérivation : les règles de calcul ») ; pas de lien signe de f′ / variations
 * ni d'optimisation (« Dérivation : variations et optimisation ») ; pas de
 * théorie des limites, pas de dérivabilité ni de ses contre-exemples.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/derivation-nombre-derive-1ere';

export const LESSON_CONFIG = {
  id: 'derivation-nombre-derive-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0 :
  //   notation-fx, fonction, image — la leçon écrit f(a) et f(a+h) dès sa
  //     première phrase, elle ne les enseigne pas (dv-d1) ;
  //   abscisse, ordonnee — le point A(a ; f(a)) est repéré par ses deux
  //     coordonnées dès le module 1 (dv-d2) ;
  //   coefficient-directeur, droite-equation-reduite — de « Équations de
  //     droites » (2de) : la pente d'une droite et l'écriture y = mx + p sont
  //     l'outil que la leçon applique à la sécante puis à la tangente
  //     (dv-d3, dv-d5). Les ids sont ceux que la 2de établit déjà : une leçon
  //     de Première hérite du vocabulaire, elle ne le réinvente pas ;
  //   taux-accroissement — établi par « Fonction affine » (2de) : la leçon
  //     PART de lui, elle ne le crée pas (dv-d4).
  priorKnowledge: ['notation-fx', 'fonction', 'image', 'abscisse', 'ordonnee', 'coefficient-directeur', 'droite-equation-reduite', 'taux-accroissement'],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Dérivation : le nombre dérivé et la tangente',
  description:
    "Rapprocher deux points d'une courbe jusqu'à ce que la sécante se couche : les pentes se stabilisent sur un nombre alors que l'écart n'atteint jamais zéro. Ce nombre est le nombre dérivé, et c'est le coefficient directeur de la tangente — de quoi l'écrire, la tracer et en donner l'équation.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 75,
  skills: [
    'Calculer un taux de variation entre deux points d’une courbe',
    'Comprendre le nombre dérivé comme la limite de ces taux',
    'Lire f′(a) comme le coefficient directeur de la tangente',
    'Déterminer et tracer l’équation de la tangente en un point',
  ],
  teachingScope: {
    include: [
      'Taux de variation entre deux points : pente de la sécante, montée divisée par avancée',
      'Nombre dérivé f′(a) comme limite du taux quand h tend vers 0, sans que h l’atteigne',
      'f′(a) est le coefficient directeur de la tangente à la courbe au point d’abscisse a',
      'Équation de la tangente : y = f′(a)(x − a) + f(a) ; la tangente touche en a et peut recouper la courbe ailleurs',
    ],
    exclude: [
      'Les règles de calcul des dérivées : somme, produit, quotient, composée (leçon « Dérivation : les règles de calcul »)',
      'Le lien entre le signe de f′ et les variations, et l’optimisation (leçon « Dérivation : variations et optimisation »)',
      'La théorie des limites, la dérivabilité et ses contre-exemples (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur les images, le coefficient directeur et le taux d’accroissement de 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-secante-qui-se-couche', path: `${LESSON_BASE_PATH}/la-secante-qui-se-couche`, title: 'La sécante qui se couche', desc: 'Rapproche B de A cran par cran. La sécante pivote, et les pentes cessent de bouger — alors que l’écart n’atteint jamais zéro.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P1', 'premiere_specialite_derivation-nombre-derive-1ere_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Rapprocher les points' },
    { id: '02', number: 2, slug: 'le-nombre-derive', path: `${LESSON_BASE_PATH}/le-nombre-derive`, title: 'Le nombre dérivé', desc: 'Le nombre sur lequel les pentes se posent porte un nom : f′(a). Déplace A et vois qu’il change avec le point.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P2', 'premiere_specialite_derivation-nombre-derive-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Nommer le nombre' },
    { id: '03', number: 3, slug: 'lire-une-tangente', path: `${LESSON_BASE_PATH}/lire-une-tangente`, title: 'Lire une tangente', desc: 'La position limite de la sécante est une droite. Sa pente se lit sur un escalier — et ce n’est pas l’ordonnée du point.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Lire la pente' },
    { id: '04', number: 4, slug: 'tracer-la-tangente', path: `${LESSON_BASE_PATH}/tracer-la-tangente`, title: 'Tracer la tangente', desc: 'Pose la droite au bon endroit avec la bonne pente. Et découvre qu’une tangente peut recouper la courbe plus loin.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P3', 'premiere_specialite_derivation-nombre-derive-1ere_P4'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Tracer' },
    { id: '05', number: 5, slug: 'l-equation-de-la-tangente', path: `${LESSON_BASE_PATH}/l-equation-de-la-tangente`, title: 'L’équation de la tangente', desc: 'y = f′(a)(x − a) + f(a) : trois nombres, un point de contact. Le piège classique est d’oublier le décalage.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_derivation-nombre-derive-1ere_P4', 'premiere_specialite_derivation-nombre-derive-1ere_P3', 'premiere_specialite_derivation-nombre-derive-1ere_P1'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Écrire l’équation' },
    { id: '06', number: 6, slug: 'mission-finale-la-tangente', path: `${LESSON_BASE_PATH}/mission-finale-la-tangente`, title: '🏆 Mission finale : la tangente', desc: 'Dix épreuves pour prouver que tu sais calculer un taux, lire un nombre dérivé et écrire une tangente.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
