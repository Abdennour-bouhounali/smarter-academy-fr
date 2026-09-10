/**
 * Exponentielle : la fonction égale à sa dérivée — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 6 LP
 * (clé catalogue 'premiere_specialite_fonction_exponentielle', partie 1/2,
 * append-only) :
 *
 *   premiere_specialite_exponentielle-decouvrir-1ere_P1  Connaître la définition de la fonction exponentielle
 *   premiere_specialite_exponentielle-decouvrir-1ere_P2  Comprendre la propriété caractéristique f' = f et f(0) = 1
 *   premiere_specialite_exponentielle-decouvrir-1ere_P3  Déterminer l'ensemble de définition et le signe de l'exponentielle
 *   premiere_specialite_exponentielle-decouvrir-1ere_P4  Étudier les variations de la fonction exponentielle
 *   premiere_specialite_exponentielle-decouvrir-1ere_P5  Représenter graphiquement la fonction exponentielle
 *   premiere_specialite_exponentielle-decouvrir-1ere_P6  Calculer la dérivée de exp(u) dans des cas simples
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : exiger d'une courbe que sa PENTE
 * vaille sa HAUTEUR en chaque point ne laisse presque aucune liberté ; ajouter
 * « et je pars de la hauteur 1 » n'en laisse plus AUCUNE. Une seule courbe
 * satisfait les deux exigences à la fois. Et cette courbe ne touche jamais
 * l'axe : si elle valait 0 quelque part, sa pente y serait nulle, elle serait
 * plate, donc nulle partout — ce qui contredit la hauteur 1 au départ.
 *
 * Objet porté : LA COURBE QUI CONSTRUIT SA PROPRE PENTE
 * (components/ConstructeurEuler.jsx) — l'élève TIRE l'extrémité de chaque
 * segment, et la règle « la pente vaut la hauteur » lui dicte où aller.
 *
 * PÉRIMÈTRE : les trois leçons de dérivation ont établi f′(a), les dérivées
 * usuelles, la règle de la composée et le lien signe de f′ / variations — on
 * s'en sert, on ne les réenseigne pas. Pas de règles de calcul sur les
 * exponentielles (e^a × e^b, e^{-a}, e^{na}) ni de modélisation : c'est
 * « Exponentielle : règles de calcul et modèles ». Pas de logarithme, pas de
 * limites en l'infini, pas de convexité (Terminale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/exponentielle-decouvrir-1ere';

export const LESSON_CONFIG = {
  id: 'exponentielle-decouvrir-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0 :
  //
  //   De « Dérivation : le nombre dérivé et la tangente » (1ère) :
  //     nombre-derive, derive-coefficient-directeur, formule-equation-tangente —
  //       la leçon PART de « la pente de la courbe en un point est un nombre, et
  //       ce nombre se lit sur la tangente ». Sans cela, « la pente vaut la
  //       hauteur » n'a aucun objet sur quoi porter (ex-d1, ex-d2).
  //   De « Dérivation : les règles de calcul » (1ère) :
  //     derivees-usuelles, regle-composee-simple — le module 6 dérive e^{ax+b}
  //       en réutilisant le geste de la composée, il ne le réinvente pas (ex-d3).
  //   De « Dérivation : variations et optimisation » (1ère) :
  //     signe-derivee-donne-sens, methode-construire-tableau-depuis-derivee —
  //       le sens de marche se lit sur le signe de la dérivée ; la leçon
  //       APPLIQUE ce théorème à un cas où le signe est immédiat (ex-d4, ex-d5).
  //
  // Les suivants portent les ids du LEXIQUE (scripts/audit/lexicon.json) : ce
  // sont des mots de 6e à 2de que la leçon EMPLOIE partout sans les enseigner.
  // L'audit --strict les voit et exige qu'ils soient DÉCLARÉS puis MESURÉS.
  // Chacun est mesuré par la question du module 0 indiquée en regard.
  //   fonction, notation-fx, pente, tangente ......... ex-d1
  //   tangente-courbe ................................ ex-d1 — « tangente à la
  //     courbe » est l'expression même de la leçon amont ; elle est ACQUISE, et
  //     le module 0 la mesure là où il mesure déjà le nombre dérivé.
  //   abscisse, ordonnee ............................. ex-d2
  //   facteur ........................................ ex-d3
  //   variations, ensemble-reels, intervalle ......... ex-d4
  //   intervalle-crochets ............................ ex-d4 — la leçon écrit
  //     ]−∞ ; +∞[ et ]0 ; +∞[ ; l'orientation des crochets est un acquis de 2de.
  //   tableau-de-signes .............................. ex-d5
  //   ensemble-definition ............................ ex-d4
  priorKnowledge: [
    'nombre-derive',
    'derive-coefficient-directeur',
    'formule-equation-tangente',
    'derivees-usuelles',
    'regle-composee-simple',
    'signe-derivee-donne-sens',
    'methode-construire-tableau-depuis-derivee',
    'fonction',
    'notation-fx',
    'pente',
    'tangente',
    'tangente-courbe',
    'abscisse',
    'ordonnee',
    'facteur',
    'variations',
    'ensemble-reels',
    'intervalle',
    'intervalle-crochets',
    'ensemble-definition',
    'tableau-de-signes',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Exponentielle : la fonction égale à sa dérivée',
  description:
    "Construire soi-même, segment par segment, une courbe dont la pente vaut la hauteur en chaque point. Deux exigences — la pente égale la hauteur, et l'on part de 1 — et il ne reste plus qu'une seule courbe possible : celle qui ne coupe jamais l'axe, monte toujours, et porte sa propre tangente en 0.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🚀',
  estimatedDurationMin: 80,
  skills: [
    'Reconnaître la fonction exponentielle par sa propriété caractéristique',
    'Justifier que l’exponentielle est définie sur ℝ et strictement positive',
    'Étudier ses variations à partir du signe de sa dérivée',
    'Tracer sa courbe et sa tangente en 0',
    'Dériver e^{ax+b} dans des cas simples',
  ],
  teachingScope: {
    include: [
      'La propriété caractéristique : f′ = f et f(0) = 1, et l’unicité de la fonction qui la vérifie',
      'La notation exp(x) puis e^x, et le nombre e = exp(1)',
      'L’ensemble de définition ℝ et le signe strictement positif, justifié par l’absurde',
      'Les variations : f′ = f > 0 donc strictement croissante sur ℝ',
      'La représentation graphique, la tangente en 0 d’équation y = x + 1, le comportement aux bornes',
      'La dérivée de e^{ax+b} : (e^{ax+b})′ = a·e^{ax+b}',
    ],
    exclude: [
      'Les règles de calcul sur les exponentielles (e^a × e^b, e^{−a}, e^{na}) et la modélisation d’un phénomène (leçon « Exponentielle : règles de calcul et modèles »)',
      'Le nombre dérivé, la tangente et les règles de dérivation, déjà établis par les trois leçons de dérivation',
      'La fonction logarithme népérien, les limites en l’infini et la convexité (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur la pente d’une courbe en un point, les dérivées usuelles et la lecture d’un tableau.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-courbe-qui-construit-sa-pente', path: `${LESSON_BASE_PATH}/la-courbe-qui-construit-sa-pente`, title: 'La courbe qui construit sa propre pente', desc: 'Tire l’extrémité de chaque segment. Une seule règle : la pente vaut la hauteur. Change la hauteur de départ, et regarde ce qui reste possible.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Construire la courbe' },
    { id: '02', number: 2, slug: 'une-seule-courbe-possible', path: `${LESSON_BASE_PATH}/une-seule-courbe-possible`, title: 'Une seule courbe possible', desc: 'Ce que tu as construit porte un nom. Deux exigences, et il n’en reste qu’une : voilà la fonction exponentielle.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P1', 'premiere_specialite_exponentielle-decouvrir-1ere_P2'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Nommer la fonction' },
    { id: '03', number: 3, slug: 'jamais-zero', path: `${LESSON_BASE_PATH}/jamais-zero`, title: 'Elle ne touche jamais l’axe', desc: 'Pars d’une hauteur nulle et essaie de construire : rien ne bouge. C’est la preuve que la courbe cherchée ne peut valoir zéro nulle part.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Tenter le zéro' },
    { id: '04', number: 4, slug: 'toujours-en-montee', path: `${LESSON_BASE_PATH}/toujours-en-montee`, title: 'Toujours en montée', desc: 'Sa dérivée est elle-même, donc strictement positive. Le théorème des variations n’a jamais eu de cas aussi simple à trancher.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P4'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Trancher le sens' },
    { id: '05', number: 5, slug: 'la-courbe-et-sa-tangente', path: `${LESSON_BASE_PATH}/la-courbe-et-sa-tangente`, title: 'La courbe et sa tangente en 0', desc: 'Trace-la, place sa tangente en 0, et regarde ce qu’elle fait très à gauche et très à droite.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Tracer la courbe' },
    { id: '06', number: 6, slug: 'deriver-exp-de-u', path: `${LESSON_BASE_PATH}/deriver-exp-de-u`, title: 'Dériver e^u', desc: 'e^{2x}, e^{−x}, e^{3x+1} : l’intérieur laisse une trace, exactement comme pour une composée. Un facteur oublié, et la pente est fausse.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_exponentielle-decouvrir-1ere_P6'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Dériver l’emboîtement' },
    { id: '07', number: 7, slug: 'mission-finale-l-exponentielle', path: `${LESSON_BASE_PATH}/mission-finale-l-exponentielle`, title: '🏆 Mission finale : l’exponentielle', desc: 'Dix épreuves pour prouver que tu sais la reconnaître, la situer, la dériver et la tracer.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
