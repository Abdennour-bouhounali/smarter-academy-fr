/**
 * Produit scalaire : mesurer et démontrer — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_produit_scalaire', partie 2/2, append-only) :
 *
 *   premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P1  Calculer un angle à l'aide du produit scalaire
 *   premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P2  Calculer une distance à l'aide du produit scalaire
 *   premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P3  Établir une équation de droite sous forme normale
 *   premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P4  Démontrer un alignement ou une orthogonalité en géométrie plane
 *   premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P5  Déterminer la nature d'un triangle à l'aide du produit scalaire
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : UNE SEULE opération remplace le
 * rapporteur ET la règle. Le même produit scalaire qui détectait l'angle droit
 * MESURE maintenant n'importe quel angle (cos θ = u·v / ‖u‖‖v‖) et n'importe
 * quelle longueur (‖AB‖² = AB·AB) — et parce que les deux sortent du même
 * calcul, la NATURE d'un triangle se lit d'un coup, sans rien mesurer.
 *
 * OBJET PORTÉ : LE THÉODOLITE (components/TheodoliteLab.jsx), un triangle dont
 * l'élève déplace les trois sommets au cliquet, avec un panneau d'instrument
 * qui affiche trois angles, trois longueurs, et une pastille de nature vivante.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. « Produit scalaire : définir et détecter
 * l'orthogonalité » fait TOURNER une flèche pour lire UN nombre ; ici l'élève
 * DÉFORME une FIGURE pour lire une CLASSIFICATION. Mêmes mathématiques, gestes
 * opposés — et deux missions à ATTEINDRE au lieu d'un phénomène à constater.
 *
 * PÉRIMÈTRE : pas de définition du produit scalaire (acquise), pas de
 * bilinéarité, pas de produit scalaire dans l'espace, pas d'équation de cercle.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/geometrie/produit-scalaire-mesurer-demontrer-1ere';

export const LESSON_CONFIG = {
  id: 'produit-scalaire-mesurer-demontrer-1ere',
  /**
   * Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
   * état A), chacune MESURÉE par une question du module 0.
   *
   * DE LA LEÇON AMONT « Produit scalaire : définir et détecter l'orthogonalité » :
   *   vocab-produit-scalaire, formule-coordonnees-scalaire — cette leçon-ci
   *     CALCULE des produits scalaires dès son module 1 sans jamais les
   *     redéfinir (psm-d1) ;
   *   formule-normes-angle — la formule ‖u‖‖v‖cos est retournée au module 2
   *     pour EXTRAIRE l'angle : elle est le point de départ, pas la cible (psm-d2) ;
   *   regle-orthogonalite — « u·v = 0 ⟺ angle droit » est l'acquis dont toute
   *     la leçon est le prolongement (psm-d3) ;
   *   vocab-vecteur-normal — le module 4 s'appuie sur le normal pour poser la
   *     forme NORMALE d'une équation (psm-d6).
   *
   * DE LA 2de :
   *   coordonnees-vecteur, regle-coordonnees — la leçon écrit AB = arrivée −
   *     départ à chaque module (psm-d4) ;
   *   vocab-norme, formule-norme — ‖u‖ est un dénominateur de la formule du
   *     cosinus, jamais son objet (psm-d5) ;
   *   droite-vecteur-directeur — la forme normale s'oppose au directeur
   *     (psm-d6) ;
   *   regle-colineaire — l'alignement se démontre par la colinéarité, PAS par
   *     le produit scalaire : le module 5 en fait un contre-exemple, il faut
   *     donc que le critère soit déjà connu (psm-d7).
   *
   * TERMES DU LEXIQUE, DÉCLARÉS EXPLICITEMENT. Le lexique de l'audit connaît
   * `produit-scalaire`, `orthogonal` et `vecteur-normal` comme termes de
   * Première. Ce sont ici des ACQUIS — la leçon amont les établit — et non des
   * cibles ; les déclarer est la réparation juste, la seule autre étant de les
   * ignorer, ce qui masquerait un vrai signalement le jour où ils cesseraient
   * d'être acquis. Chacun est mesuré par une question du module 0.
   */
  priorKnowledge: [
    'vocab-produit-scalaire', 'formule-coordonnees-scalaire', 'formule-normes-angle',
    'regle-orthogonalite', 'vocab-vecteur-normal',
    'coordonnees-vecteur', 'regle-coordonnees',
    'vocab-norme', 'formule-norme',
    'droite-vecteur-directeur', 'regle-colineaire',
    // Les ids du LEXIQUE de l'audit, déclarés comme acquis parce qu'ils le
    // sont réellement — et mesurés par le module 0 :
    //   produit-scalaire, orthogonal, vecteur-normal  ← la leçon amont ;
    //   vecteur (3e), abscisse (6e), angle-droit et triangle-rectangle (6e),
    //   cosinus et sinus (3e, prérequis catalogue « Trigonométrie »),
    //   colineaire (2de), droites-perpendiculaires (6e).
    'produit-scalaire', 'orthogonal', 'vecteur-normal',
    'vecteur', 'abscisse', 'ordonnee',
    'angle-droit', 'triangle-rectangle', 'droites-perpendiculaires',
    'cosinus', 'sinus', 'colineaire',
  ],
  /**
   * Termes du lexique EXCLUS du scan, avec leur raison. Ce ne sont pas des
   * notions de la leçon : ce sont des mots de la langue mathématique courante,
   * employés une fois dans une correction, et qu'aucune brique n'a vocation à
   * poser ici. Les déclarer en `priorKnowledge` reviendrait à prétendre que le
   * module 0 les mesure, ce qui serait faux.
   */
  knowledgeAudit: {
    ignore: [
      { term: 'arrondi', reason: 'Mot de la langue courante des calculs (6e) : « arrondis au centième » est une consigne de forme, pas une notion enseignée ici.' },
      { term: 'numerateur', reason: 'Employé une seule fois pour désigner le haut d’une fraction dans la formule de distance (6e). Aucune brique ne l’enseigne, et la formule reste lisible sans lui.' },
      { term: 'appartient', reason: 'Le symbole ∈ de 2de, employé dans une correction pour dire « H est sur (QR) ». La leçon écrit partout « est sur », jamais le symbole.' },
      { term: 'issue-evenement', reason: 'Faux positif du lexique : le mot capté est « issue » au sens de « issues de A » (les flèches qui partent d’un sommet), et non l’issue d’une expérience aléatoire.' },
      { term: 'cote-oppose', reason: 'Employé une fois pour décrire ce qu’une hauteur doit rencontrer (3e). Notion de collège, hors du contrat de cette leçon.' },
    ],
  },
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Produit scalaire : mesurer et démontrer',
  description:
    'Déforme un triangle et regarde un instrument lire ses trois angles et ses trois longueurs — tous sortis du même calcul. Le produit scalaire remplace le rapporteur et la règle d’un coup : de quoi mesurer un angle, une distance, écrire une droite par son normal, et démontrer qu’un triangle est rectangle sans jamais le mesurer.',
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 75,
  skills: [
    'Calculer un angle à partir des coordonnées de deux vecteurs',
    'Calculer une distance par le carré scalaire, et appliquer Al-Kashi',
    'Écrire l’équation d’une droite sous forme normale à partir d’un point et d’un normal',
    'Démontrer un alignement ou une orthogonalité par le calcul',
    'Déterminer la nature d’un triangle sans rien mesurer sur la figure',
  ],
  teachingScope: {
    include: [
      'Calculer l’angle entre deux vecteurs par cos θ = (u · v) / (‖u‖ × ‖v‖), y compris obtus',
      'Calculer une longueur par le carré scalaire ‖AB‖² = AB · AB, et le théorème d’Al-Kashi',
      'Écrire une droite sous forme normale a(x − x₀) + b(y − y₀) = 0, et la distance d’un point à cette droite',
      'Démontrer un alignement (colinéarité) ou une orthogonalité (produit scalaire nul) en géométrie plane',
      'Déterminer la nature d’un triangle — rectangle, isocèle — à l’aide du produit scalaire',
    ],
    exclude: [
      'La définition du produit scalaire, la projection, la bilinéarité et la symétrie (leçon « Produit scalaire : définir et détecter l’orthogonalité »)',
      'L’équation d’un cercle, les lieux géométriques et les formules de polarisation',
      'Le produit scalaire dans l’espace et le produit vectoriel (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur ce que tu sais déjà du produit scalaire, de la norme, et de ce qui rend trois points alignés.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-theodolite', path: `${LESSON_BASE_PATH}/le-theodolite`, title: 'Le théodolite', desc: 'Déforme un triangle au cliquet et regarde un instrument lire ses trois angles et ses trois longueurs en direct. Deux missions à atteindre.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P1', 'premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P5'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Déformer le triangle' },
    { id: '02', number: 2, slug: 'l-angle-sans-rapporteur', path: `${LESSON_BASE_PATH}/l-angle-sans-rapporteur`, title: 'L’angle sans rapporteur', desc: 'La formule des normes et de l’angle, retournée : elle donne le cosinus, donc l’angle. Y compris quand il dépasse 90° et que le cosinus devient négatif.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Mesurer un angle' },
    { id: '03', number: 3, slug: 'la-longueur-sans-regle', path: `${LESSON_BASE_PATH}/la-longueur-sans-regle`, title: 'La longueur sans règle', desc: 'Une flèche multipliée par elle-même donne le carré de sa longueur. C’est la règle graduée du produit scalaire — et de quoi mesurer un côté sans coordonnées.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Mesurer une longueur' },
    { id: '04', number: 4, slug: 'la-droite-par-son-normal', path: `${LESSON_BASE_PATH}/la-droite-par-son-normal`, title: 'La droite par son normal', desc: 'Un point, une flèche en travers, et la droite s’écrit d’un trait : a(x − x₀) + b(y − y₀) = 0. Et la distance d’un point à cette droite en tombe.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P3', 'premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P2'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Écrire la droite' },
    { id: '05', number: 5, slug: 'le-tribunal-des-figures', path: `${LESSON_BASE_PATH}/le-tribunal-des-figures`, title: 'Le tribunal des figures', desc: 'Quatre triangles à juger, une hauteur à prouver, trois points à aligner. Un dessin ne prouve rien : deux d’entre eux trompent l’œil.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P4', 'premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Juger les figures' },
    { id: '06', number: 6, slug: 'mission-finale-l-instrument', path: `${LESSON_BASE_PATH}/mission-finale-l-instrument`, title: '🏆 Mission finale : l’instrument', desc: 'Dix épreuves pour prouver que tu sais mesurer un angle, une distance, écrire une droite par son normal et démontrer la nature d’une figure.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
