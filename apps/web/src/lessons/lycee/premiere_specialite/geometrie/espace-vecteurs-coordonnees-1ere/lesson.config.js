/**
 * L'espace : vecteurs et coordonnées — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_geometrie_espace', partie 1/2, append-only) :
 *
 *   premiere_specialite_espace-vecteurs-coordonnees-1ere_P1  Déterminer les coordonnées d'un vecteur dans l'espace
 *   premiere_specialite_espace-vecteurs-coordonnees-1ere_P2  Calculer la norme d'un vecteur de l'espace
 *   premiere_specialite_espace-vecteurs-coordonnees-1ere_P3  Calculer un produit scalaire dans l'espace
 *   premiere_specialite_espace-vecteurs-coordonnees-1ere_P4  Reconnaître le parallélisme de deux droites de l'espace
 *   premiere_specialite_espace-vecteurs-coordonnees-1ere_P5  Reconnaître l'orthogonalité de deux droites de l'espace
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : TROIS NOMBRES suffisent à situer
 * n'importe quoi dans une boîte, et la longueur d'un déplacement s'obtient en
 * appliquant Pythagore DEUX FOIS — une fois sur le plancher, une fois dans
 * l'espace. Tout le reste (le produit scalaire, le parallélisme,
 * l'orthogonalité) est la MÊME machinerie qu'au plan, avec un terme de plus.
 *
 * Objet porté : LA BOÎTE ET LES TROIS NOMBRES (components/CubeLab.jsx) — un
 * cube que l'élève fait tourner AU DOIGT et dont il clique les sommets. Il
 * revient à chaque module, jamais gelé, parce que la perspective ment et qu'il
 * faut pouvoir tourner pour s'en assurer.
 *
 * LE PIÈGE CENTRAL, et pourquoi la rotation est un DROIT et non une option :
 * en perspective cavalière, deux arêtes qui ne se rencontrent pas peuvent se
 * croiser SUR LE DESSIN. La leçon ne pose donc jamais une question de position
 * relative sans donner d'abord la rotation ; `orientationsQuiLevent` prouve,
 * par balayage, qu'une orientation atteignable défait le croisement apparent.
 *
 * PÉRIMÈTRE : pas de représentation paramétrique d'une droite, pas d'équation
 * de plan, pas de distance point-plan, pas de positions relatives droite/plan
 * — « L'espace : droites, plans et distances ». Pas de produit vectoriel.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/geometrie/espace-vecteurs-coordonnees-1ere';

export const LESSON_CONFIG = {
  id: 'espace-vecteurs-coordonnees-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0. Une leçon de
  // Première hérite du vocabulaire de la 2de et de ses propres leçons voisines,
  // elle ne le réinvente pas :
  //   vecteur-deplacement, coordonnees-vecteur, regle-coordonnees — « Vecteurs »
  //     (2de) : la leçon écrit AB = (1 ; 1 ; 1) dès son module 2 et applique la
  //     règle « arrivée moins départ » à une troisième coordonnée (ev-d1) ;
  //   abscisse, ordonnee — acquis de 6e, DÉCLARÉS car la leçon les emploie en
  //     position d'enseignement quand elle ajoute la TROISIÈME coordonnée à
  //     côté d'eux (ev-d2) ;
  //   vocab-norme, formule-norme — « Vecteurs » (2de) : ‖u‖ = √(x² + y²) est
  //     exactement la formule que le module 3 prolonge d'un terme (ev-d3) ;
  //   colin-direction, mem-colin-multiple — « Colinéarité et alignement » (2de) :
  //     le critère de parallélisme du module 5 EST celui du plan, transporté
  //     tel quel (ev-d4) ;
  //   vocab-produit-scalaire, formule-coordonnees-scalaire, regle-orthogonalite
  //     — « Produit scalaire : définir et détecter l'orthogonalité » (1ère,
  //     leçon voisine, prérequis catalogue) : le module 4 ne redéfinit pas le
  //     produit scalaire, il lui ajoute un terme (ev-d5, ev-d6). Sans ces trois
  //     ids, « produit scalaire » et « orthogonal » — deux termes du lexique de
  //     Première — seraient employés avant d'avoir été posés ;
  //   perspective-cavaliere, arete-cachee — « Représentation de l'espace » (3e) :
  //     le dessin de la boîte et son pointillé sont l'outil de la leçon, pas
  //     son objet (ev-d7) ;
  //   arete, face-solide, sommet-solide — le vocabulaire du solide (6e). La
  //     leçon parle d'arêtes et de faces à chaque phrase parce que c'est le
  //     support du repère, jamais parce qu'elle les enseigne (ev-d8) ;
  //   origine-repere — acquis de 6e, DÉCLARÉ car le module 2 prend le coin A
  //     comme origine et emploie le mot en position d'enseignement à côté de
  //     « cote », le seul terme réellement neuf de cette phrase (ev-d9) ;
  //   droites-paralleles, secantes — les deux positions relatives du PLAN (6e
  //     et 3e). L'apport de la leçon n'est pas de les définir : c'est de
  //     montrer qu'elles ne suffisent plus, et d'ajouter un troisième cas
  //     (ev-d10) ;
  //   arrondi — acquis de 6e, employé par le module 3 pour ÉCARTER une
  //     explication (« l'écart n'est pas un arrondi ») ; le mot doit donc être
  //     disponible avant d'être nié (ev-d11).
  //
  // Ces six derniers ids ont été ajoutés APRÈS l'audit strict, qui les
  // signalait comme employés avant d'être posés. Les déclarer ici et les
  // diagnostiquer au module 0 est la réparation prescrite ; les retirer des
  // énoncés aurait appauvri la leçon sans rien enseigner de plus.
  priorKnowledge: [
    'vecteur-deplacement', 'coordonnees-vecteur', 'regle-coordonnees',
    'abscisse', 'ordonnee', 'origine-repere',
    'vocab-norme', 'formule-norme', 'arrondi',
    'colin-direction', 'mem-colin-multiple',
    'vocab-produit-scalaire', 'formule-coordonnees-scalaire', 'regle-orthogonalite',
    'perspective-cavaliere', 'arete-cachee',
    'arete', 'face-solide', 'sommet-solide',
    'droites-paralleles', 'secantes',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'L’espace : vecteurs et coordonnées',
  description:
    'Attrape une boîte, tourne-la au doigt, clique deux de ses coins : le déplacement de l’un à l’autre se compte en trois nombres, et sa longueur s’obtient en appliquant Pythagore deux fois — une fois sur le plancher, une fois dans l’espace. Tout ce que tu savais du plan se transporte, avec un terme de plus.',
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧊',
  estimatedDurationMin: 80,
  skills: [
    'Déterminer les coordonnées d’un vecteur de l’espace à partir de deux points',
    'Calculer la norme d’un vecteur de l’espace par le double Pythagore',
    'Calculer un produit scalaire dans l’espace à partir des coordonnées',
    'Reconnaître deux droites parallèles de l’espace par leurs vecteurs directeurs',
    'Reconnaître deux droites orthogonales de l’espace, qu’elles se coupent ou non',
  ],
  teachingScope: {
    include: [
      'Repère de l’espace : trois nombres situent un point, et un vecteur se lit « arrivée moins départ » sur chacune des trois coordonnées',
      'Norme d’un vecteur de l’espace : ‖u‖ = √(x² + y² + z²), obtenue en appliquant Pythagore deux fois',
      'Produit scalaire dans l’espace : u·v = xx′ + yy′ + zz′, la formule du plan avec un terme de plus',
      'Deux droites de l’espace sont parallèles quand leurs vecteurs directeurs sont colinéaires',
      'Deux droites de l’espace sont orthogonales quand le produit scalaire de leurs directeurs est nul — même si elles ne se coupent pas',
    ],
    exclude: [
      'La représentation paramétrique d’une droite et l’équation cartésienne d’un plan (leçon « L’espace : droites, plans et distances »)',
      'Les positions relatives d’une droite et d’un plan, et de deux plans (leçon « L’espace : droites, plans et distances »)',
      'La distance d’un point à un plan et les calculs de distance dans l’espace (leçon « L’espace : droites, plans et distances »)',
      'Le produit vectoriel et le déterminant en dimension 3 (post-baccalauréat)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur les coordonnées d’un vecteur du plan, sa longueur, le produit scalaire et le dessin d’un solide.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-boite-et-les-trois-nombres', path: `${LESSON_BASE_PATH}/la-boite-et-les-trois-nombres`, title: 'La boîte et les trois nombres', desc: 'Attrape la boîte, tourne-la au doigt, clique deux coins. Le déplacement se décompose en trois trajets comptés — et sa longueur sort de deux triangles rectangles.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P1', 'premiere_specialite_espace-vecteurs-coordonnees-1ere_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Attraper la boîte' },
    { id: '02', number: 2, slug: 'la-troisieme-coordonnee', path: `${LESSON_BASE_PATH}/la-troisieme-coordonnee`, title: 'La troisième coordonnée', desc: 'Ce que tu viens de compter porte un nom et une écriture : trois nombres, obtenus exactement comme au plan — arrivée moins départ, sur chaque direction.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Écrire les trois nombres' },
    { id: '03', number: 3, slug: 'pythagore-deux-fois', path: `${LESSON_BASE_PATH}/pythagore-deux-fois`, title: 'Pythagore, deux fois', desc: 'Les deux triangles que tu as vus s’écrivent en une formule. Elle ressemble à celle du plan — avec un carré de plus sous la racine.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Établir la formule' },
    { id: '04', number: 4, slug: 'un-terme-de-plus', path: `${LESSON_BASE_PATH}/un-terme-de-plus`, title: 'Un terme de plus', desc: 'Le produit scalaire ne change pas de nature en passant à l’espace : la même somme de produits, avec un troisième terme. Vérifie-le sur la boîte.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Calculer sur la boîte' },
    { id: '05', number: 5, slug: 'les-droites-paralleles', path: `${LESSON_BASE_PATH}/les-droites-paralleles`, title: 'Les droites parallèles', desc: 'Deux arêtes qui ont l’air parallèles le sont-elles ? Le dessin ne tranche pas — les vecteurs directeurs, si.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Trancher' },
    { id: '06', number: 6, slug: 'orthogonales-sans-se-couper', path: `${LESSON_BASE_PATH}/orthogonales-sans-se-couper`, title: 'Orthogonales sans se couper', desc: 'Le fait qui n’existe pas dans le plan : deux droites peuvent faire un angle droit sans jamais se rencontrer. Tourne la boîte, et vois-le.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P5'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Tourner et conclure' },
    { id: '07', number: 7, slug: 'mission-finale-la-boite', path: `${LESSON_BASE_PATH}/mission-finale-la-boite`, title: '🏆 Mission finale : la boîte', desc: 'Dix épreuves pour prouver que tu sais lire trois coordonnées, calculer une norme et un produit scalaire, et trancher entre parallèles et orthogonales.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
