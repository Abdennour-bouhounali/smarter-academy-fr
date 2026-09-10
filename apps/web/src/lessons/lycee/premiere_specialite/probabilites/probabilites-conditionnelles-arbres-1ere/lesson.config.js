/**
 * Probabilités conditionnelles : arbres et probabilités totales — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_probabilites_conditionnelles_independance',
 * partie 1/2, append-only) :
 *
 *   premiere_specialite_probabilites-conditionnelles-arbres-1ere_P1  Calculer une probabilité conditionnelle
 *   premiere_specialite_probabilites-conditionnelles-arbres-1ere_P2  Interpréter une probabilité conditionnelle
 *   premiere_specialite_probabilites-conditionnelles-arbres-1ere_P3  Construire un arbre pondéré
 *   premiere_specialite_probabilites-conditionnelles-arbres-1ere_P4  Exploiter un arbre pondéré pour calculer une probabilité
 *   premiere_specialite_probabilites-conditionnelles-arbres-1ere_P5  Utiliser la formule des probabilités totales
 *
 * CE QUE CETTE LEÇON N'ENSEIGNE PAS, PARCE QUE LA 2de L'A DÉJÀ FAIT.
 * Deux leçons de Seconde sont livrées et leurs briques sont ACQUISES :
 *   « Probabilités conditionnelles » — univers-restreint, notation-sachant,
 *     inversion, mem-indice, frequence-probabilite, probabilites-composees ;
 *   « Arbres de probabilités » — arbre-structure, poids-conditionnels,
 *     somme-branches, produit-chemin, somme-chemins, mem-produit-somme.
 * On ne réenseigne donc NI l'univers restreint, NI la notation P_A(B), NI le
 * produit le long d'un chemin, NI la somme des chemins. Tout cela est en
 * priorKnowledge, mesuré par le module 0.
 *
 * L'APPORT PROPRE DE LA PREMIÈRE, et l'idée centrale vécue avant d'être nommée :
 * l'arbre cesse d'être un dessin qu'on remplit pour devenir un INSTRUMENT DE
 * CALCUL rigoureux — sur des partitions à plus de deux parts, avec la garantie
 * que les chemins menant à un événement le RECOUVRENT sans se recouvrir. De là,
 * la FORMULE DES PROBABILITÉS TOTALES, absente du programme de 2de :
 * P(B) = Σ P(Aᵢ) × P_Aᵢ(B). Et sa conséquence la plus contre-intuitive : un
 * test fiable à 99 % sur une maladie rare rend une majorité de faux positifs.
 *
 * Objet porté : LA BARRE QUI RÉTRÉCIT (components/SplitPopulationLab.jsx). Mille
 * habitants, DEUX SÉPARATIONS QU'ON FAIT GLISSER (jamais de bouton ± : règle
 * utilisateur « le glisser d'abord », 2026-09-10) ; l'élève cherche deux
 * compositions où le MÊME effectif d'intersection produit deux pourcentages
 * différents. Le comptage n'a pas bougé : le DÉNOMINATEUR a changé.
 *
 * PÉRIMÈTRE : pas d'inversion systématique du conditionnement ni de formule de
 * Bayes, pas d'indépendance, pas d'incompatibilité — c'est « Probabilités :
 * inverser le conditionnement et l'indépendance ». Pas de loi binomiale, pas de
 * répétition d'épreuves identiques.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/probabilites/probabilites-conditionnelles-arbres-1ere';

export const LESSON_CONFIG = {
  id: 'probabilites-conditionnelles-arbres-1ere',
  // Connaissances SUPPOSÉES acquises, établies par les DEUX leçons de 2de
  // livrées, chacune MESURÉE par une question du module 0 :
  //   univers-restreint, notation-sachant — « Probabilités conditionnelles »
  //     (2de) : conditionner, c'est changer de dénominateur, et cela s'écrit
  //     P_A(B). La Première PART de là (pc-d1, pc-d2) ;
  //   inversion — P_A(B) ≠ P_B(A) est DÉJÀ su ; la Première s'en sert pour
  //     lire le paradoxe du dépistage, elle ne le redémontre pas (pc-d3) ;
  //   arbre-structure, somme-branches — l'arbre pondéré, ses niveaux et la
  //     somme des branches d'un nœud (pc-d4) ;
  //   poids-conditionnels — au second niveau, un poids est une conditionnelle :
  //     l'acquis de 2de sur lequel tout le module 3 s'appuie (pc-d5) ;
  //   produit-chemin, somme-chemins — multiplier le long, additionner entre :
  //     les deux gestes que la Première va MUSCLER, pas découvrir (pc-d6) ;
  //   probabilite, issue-evenement, effectif, denominateur, quotient,
  //     pourcentage — le langage du comptage et ses écritures, posé au collège
  //     (3e pour l'expérience aléatoire et ses événements, 6e pour le
  //     quotient), employé partout par la leçon sans être enseigné (pc-d7,
  //     pc-d8). L'AUDIT STRICT les exige déclarés : « événement » et
  //     « quotient » apparaissent dès le module 0, et une leçon ne peut pas
  //     employer un mot qu'elle ne déclare ni n'établit.
  priorKnowledge: [
    'univers-restreint', 'notation-sachant', 'inversion',
    'arbre-structure', 'somme-branches', 'poids-conditionnels',
    'produit-chemin', 'somme-chemins',
    'probabilite', 'issue-evenement', 'effectif', 'denominateur',
    'quotient', 'pourcentage',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Probabilités conditionnelles : arbres et probabilités totales',
  description:
    "Mille habitants, deux séparations qu'on fait glisser : le même effectif d'intersection affiche 75 % ou 25 % selon l'univers où l'on se tient. De là, l'arbre pondéré repris comme instrument de calcul sur des partitions à plusieurs parts, et la formule des probabilités totales — de quoi comprendre pourquoi un test fiable à 99 % sur une maladie rare rend deux faux positifs pour un vrai.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'probabilites',
  chapterTitle: 'Probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 75,
  skills: [
    'Calculer une probabilité conditionnelle à partir d’effectifs ou d’un arbre',
    'Interpréter une probabilité conditionnelle par une phrase qui nomme son univers',
    'Construire un arbre pondéré en accrochant chaque poids à la bonne branche',
    'Exploiter un arbre : multiplier le long d’un chemin, additionner les chemins',
    'Reconnaître une partition et appliquer la formule des probabilités totales',
  ],
  teachingScope: {
    include: [
      'Probabilité conditionnelle sur des effectifs : le dénominateur est l’univers de la condition',
      'Interprétation d’une probabilité conditionnelle : la phrase nomme la population de référence',
      'Construction d’un arbre pondéré à partir d’une situation, poids conditionnels au second niveau',
      'Exploitation d’un arbre : produit le long d’un chemin, somme des chemins d’un événement',
      'Partition d’un univers : les cas se recouvrent l’ensemble sans se chevaucher',
      'Formule des probabilités totales P(B) = Σ P(Aᵢ) × P_Aᵢ(B), sur des partitions à plus de deux parts',
      'Le paradoxe du dépistage : un test très fiable sur un cas rare produit une majorité de faux positifs',
    ],
    exclude: [
      'Inverser systématiquement un conditionnement et la formule de Bayes (leçon « Probabilités : inverser le conditionnement et l’indépendance »)',
      'L’indépendance de deux événements et sa distinction d’avec l’incompatibilité (même leçon)',
      'La loi binomiale et la répétition d’épreuves identiques (leçon « Variables aléatoires : dispersion et loi binomiale »)',
      'Les arbres à trois niveaux ou plus',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur l’univers restreint, la notation P_A(B) et l’arbre pondéré de 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-monde-qui-retrecit', path: `${LESSON_BASE_PATH}/le-monde-qui-retrecit`, title: 'Le monde qui rétrécit', desc: 'Attrape les séparations, fais-les glisser. Trouve deux compositions où le même effectif affiche deux pourcentages différents.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P1', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire glisser' },
    { id: '02', number: 2, slug: 'calculer-et-dire', path: `${LESSON_BASE_PATH}/calculer-et-dire`, title: 'Calculer, puis le dire juste', desc: 'Un dépistage sur cent mille personnes : le même quotient dans les deux sens ne dit pas la même chose — et la phrase doit nommer sa population.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P1', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P2'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Calculer et dire' },
    { id: '03', number: 3, slug: 'accrocher-les-poids', path: `${LESSON_BASE_PATH}/accrocher-les-poids`, title: 'Accrocher les poids aux bonnes branches', desc: 'Construis l’arbre du dépistage : chaque poids a UNE branche, et une seule. Deux nombres identiques n’y jouent pas le même rôle.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Construire l’arbre' },
    { id: '04', number: 4, slug: 'exploiter-l-arbre', path: `${LESSON_BASE_PATH}/exploiter-l-arbre`, title: 'Exploiter l’arbre', desc: 'Trois fournisseurs, trois chemins vers le défaut. Le produit le long d’un chemin, la somme entre les chemins — sur une partition à trois parts.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P4', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Suivre les chemins' },
    { id: '05', number: 5, slug: 'la-formule-des-probabilites-totales', path: `${LESSON_BASE_PATH}/la-formule-des-probabilites-totales`, title: 'La formule des probabilités totales', desc: 'Les chemins qui mènent à un événement découpent la population entière, sans trou ni recouvrement. C’est ce qui autorise à les additionner — et cela s’écrit en une ligne.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P5', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Découvrir la formule' },
    { id: '06', number: 6, slug: 'mission-finale-l-arbre-et-la-formule', path: `${LESSON_BASE_PATH}/mission-finale-l-arbre-et-la-formule`, title: '🏆 Mission finale : l’arbre et la formule', desc: 'Dix épreuves pour prouver que tu sais toujours dans quel univers tu calcules, et quand la formule s’applique.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
