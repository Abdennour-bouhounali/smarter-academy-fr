/**
 * L'espace : droites, plans et distances — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 7 LP
 * (clé catalogue 'premiere_specialite_geometrie_espace', partie 2/2, append-only) :
 *
 *   premiere_specialite_espace-droites-plans-1ere_P1  Étudier les positions relatives d'une droite et d'un plan
 *   premiere_specialite_espace-droites-plans-1ere_P2  Étudier les positions relatives de deux plans
 *   premiere_specialite_espace-droites-plans-1ere_P3  Démontrer le parallélisme dans l'espace
 *   premiere_specialite_espace-droites-plans-1ere_P4  Démontrer l'orthogonalité dans l'espace
 *   premiere_specialite_espace-droites-plans-1ere_P5  Déterminer une représentation paramétrique d'une droite
 *   premiere_specialite_espace-droites-plans-1ere_P6  Déterminer une équation cartésienne d'un plan
 *   premiere_specialite_espace-droites-plans-1ere_P7  Calculer une distance dans l'espace
 *
 * ─── L'IDÉE CENTRALE, vécue avant d'être nommée ────────────────────────
 * Une droite et un plan de l'espace n'ont que TROIS positions possibles, et
 * UN SEUL NOMBRE les départage : le produit scalaire du vecteur directeur de
 * la droite par le vecteur normal du plan.
 *     u·n ≠ 0                  → la droite PERCE le plan : 1 point commun
 *     u·n = 0 et A ∉ plan      → PARALLÈLE : 0 point commun
 *     u·n = 0 et A ∈ plan      → CONTENUE : une infinité
 * Tout le reste du chapitre en découle : deux plans se décident par leurs
 * normaux, le parallélisme et l'orthogonalité par le même produit — dont le
 * rôle S'INVERSE selon qu'on parle de deux droites ou d'une droite et d'un
 * plan — et la distance d'un point à un plan est ce que l'équation du plan
 * répond au point, divisé par la longueur du normal.
 *
 * ─── OBJET PORTÉ ───────────────────────────────────────────────────────
 * LA DROITE QUI TRAVERSE, OU PAS (components/DroitePlanLab.jsx) : un cube
 * qu'on tourne AU DOIGT, contenant un PLAN mobile et une DROITE mobile, tous
 * deux saisissables. L'élève fait glisser la droite : elle perce, puis devient
 * parallèle, puis se couche dans le plan. Un afficheur DOM donne le nombre de
 * points communs, et à côté, le calcul qui le décide.
 *
 * ─── LE PIÈGE CENTRAL, ET POURQUOI LA ROTATION EST UN DROIT ────────────
 * En projection cavalière, une droite peut PARAÎTRE percer un plan qu'elle
 * rate. La leçon ne pose donc JAMAIS une question de position relative sans
 * donner d'abord la rotation. Deux faits prouvés par balayage dans
 * components/planUtils.test.js : la plage de rotation offerte ne contient
 * AUCUNE orientation où le plan s'écrase sur un trait (elle a été CALCULÉE
 * pour cela, et n'est donc pas celle de la leçon voisine), et il existe pour
 * chaque configuration proposée une orientation atteignable où le croisement
 * apparent se défait.
 *
 * ─── PÉRIMÈTRE ─────────────────────────────────────────────────────────
 * Les coordonnées, la norme et le produit scalaire de l'espace sont ACQUIS —
 * c'est la leçon « L'espace : vecteurs et coordonnées », dont celle-ci est la
 * suite directe. Pas de produit vectoriel, pas de sphère, pas de surface.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/geometrie/espace-droites-plans-1ere';

export const LESSON_CONFIG = {
  id: 'espace-droites-plans-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0.
  //
  //   LA LEÇON D'AMONT — « L'espace : vecteurs et coordonnées » (1ère, prérequis
  //   catalogue nommé « L'espace : vecteurs et coordonnées »). Cette leçon-ci
  //   ne redéfinit RIEN de tout cela : elle s'en sert à chaque ligne.
  //     repere-espace, coordonnees-vecteur-espace — un point de l'espace se
  //       situe par trois nombres, un vecteur se lit « arrivée moins départ »
  //       sur les trois (ev-d1) ;
  //     formule-scalaire-espace, mem-un-terme-de-plus — u·v = xx′ + yy′ + zz′
  //       est LE calcul de toute la leçon : il décide les trois positions
  //       (ev-d2) ;
  //     formule-norme-espace, methode-calculer-norme-espace — ‖n‖ est le
  //       dénominateur de la distance d'un point à un plan (ev-d3) ;
  //     regle-parallelisme-espace, regle-orthogonalite-espace,
  //     droites-espace-trois-cas — les critères POUR DEUX DROITES, que les
  //       modules 6 et 7 transportent aux plans en INVERSANT le rôle du
  //       produit scalaire ; sans eux, l'inversion n'aurait rien à inverser
  //       (ev-d4, ev-d5).
  //
  //   LE VOCABULAIRE DU LEXIQUE DE PREMIÈRE que la leçon EMPLOIE sans
  //   l'enseigner — il appartient à la leçon voisine « Produit scalaire :
  //   définir et détecter l'orthogonalité », prérequis catalogue :
  //     vocab-produit-scalaire, formule-coordonnees-scalaire,
  //     regle-orthogonalite (ev-d6, ev-d7) ;
  //     vecteur-normal est en revanche ENSEIGNÉ ici : au plan, la leçon
  //       voisine ne l'a posé que pour une DROITE du plan. La brique du
  //       module 3 porte l'id du lexique.
  //
  //   LES ACQUIS DE SECONDE ET DE COLLÈGE, employés en position
  //   d'enseignement, donc déclarés :
  //     colin-direction, mem-colin-multiple — la colinéarité (2de) est le
  //       critère de parallélisme, transporté aux normaux (ev-d8) ;
  //     perspective-cavaliere, arete-cachee — le dessin de la boîte et son
  //       pointillé sont l'OUTIL de la leçon, pas son objet (ev-d9) ;
  //     arete, face-solide, sommet-solide — le vocabulaire du solide (6e),
  //       employé à chaque phrase parce qu'il porte le repère (ev-d10) ;
  //     droites-paralleles, secantes — les deux positions du PLAN (6e), que
  //       la leçon prolonge (ev-d11) ;
  //     abscisse, ordonnee, origine-repere — acquis de 6e, employés à côté des
  //       termes réellement neufs (ev-d12) ;
  //     arrondi — employé pour ÉCARTER une explication (« l'écart n'est pas un
  //       arrondi ») : le mot doit être disponible avant d'être nié (ev-d13).
  //
  //   TROIS TERMES DU LEXIQUE, ajoutés APRÈS l'audit strict qui les signalait
  //   comme employés avant d'être posés. Tous trois sont réellement des acquis,
  //   et les déclarer puis les diagnostiquer est la réparation prescrite ; les
  //   retirer des énoncés aurait privé la leçon du vocabulaire officiel :
  //     orthogonal — le lexique le classe en Première, et c'est la leçon
  //       VOISINE « Produit scalaire : définir et détecter l'orthogonalité »
  //       qui le pose. Celle-ci l'emploie dès son module 0 et le transporte à
  //       une droite et un plan, ce qui est son apport propre (ev-d14) ;
  //     coefficient-lineaire — le mot « coefficient » employé seul, acquis de
  //       3e. La leçon parle des « trois premiers coefficients » d'une équation
  //       à chaque phrase du module 5 (ev-d15) ;
  //     valeur-absolue — acquise de 5e, employée par la formule de la distance
  //       et citée par une explication du module 5 avant le module 7 (ev-d16) ;
  //     colineaire — acquis de 2de (« Colinéarité et alignement »). Le mot est
  //       le critère de parallélisme, employé pour deux directeurs comme pour
  //       deux normaux ; il est mesuré par la question qui l'emploie (ev-d8) ;
  //     terme-algebrique — le mot « terme » d'une somme, acquis de 3e, employé
  //       dès le module 0 pour dire que le troisième produit ne s'oublie pas
  //       (ev-d2) ;
  //     droites-perpendiculaires — acquis de 6e. La leçon s'en sert comme point
  //       de COMPARAISON : dans le plan, « perpendiculaires » impliquait
  //       « sécantes », et c'est ce que l'espace défait (ev-d11).
  priorKnowledge: [
    'repere-espace', 'coordonnees-vecteur-espace',
    'formule-scalaire-espace', 'mem-un-terme-de-plus',
    'formule-norme-espace', 'methode-calculer-norme-espace',
    'regle-parallelisme-espace', 'regle-orthogonalite-espace', 'droites-espace-trois-cas',
    'vocab-produit-scalaire', 'formule-coordonnees-scalaire', 'regle-orthogonalite',
    'colin-direction', 'mem-colin-multiple',
    'perspective-cavaliere', 'arete-cachee',
    'arete', 'face-solide', 'sommet-solide',
    'droites-paralleles', 'secantes',
    'abscisse', 'ordonnee', 'origine-repere',
    'arrondi', 'coefficient-lineaire', 'valeur-absolue',
    'orthogonal', 'colineaire', 'terme-algebrique', 'droites-perpendiculaires',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'L’espace : droites, plans et distances',
  description:
    'Attrape un plan, fais-le monter ; attrape une droite, fais-la basculer. Elle perce le plan, puis le longe, puis se couche dedans — et c’est un seul nombre qui décide lequel des trois. Ce nombre gouverne ensuite tout le chapitre : deux plans, le parallélisme, l’orthogonalité, et jusqu’aux distances.',
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📦',
  estimatedDurationMin: 85,
  skills: [
    'Étudier les positions relatives d’une droite et d’un plan par le produit directeur·normal',
    'Étudier les positions relatives de deux plans par leurs vecteurs normaux',
    'Démontrer un parallélisme dans l’espace par un calcul, et non par le dessin',
    'Démontrer une orthogonalité dans l’espace, entre droites comme entre une droite et un plan',
    'Déterminer une représentation paramétrique d’une droite à partir d’un point et d’un vecteur directeur',
    'Déterminer une équation cartésienne d’un plan à partir d’un point et d’un vecteur normal',
    'Calculer une distance d’un point à un plan, et entre deux plans parallèles',
  ],
  teachingScope: {
    include: [
      'Positions relatives d’une droite et d’un plan : sécante, parallèle ou contenue, décidées par le produit scalaire du vecteur directeur et du vecteur normal',
      'Positions relatives de deux plans : sécants ou parallèles, décidées par la colinéarité de leurs vecteurs normaux',
      'Démontrer un parallélisme dans l’espace : directeurs colinéaires pour deux droites, directeur orthogonal au normal pour une droite et un plan, normaux colinéaires pour deux plans',
      'Démontrer une orthogonalité dans l’espace : produit scalaire nul pour deux droites, directeur colinéaire au normal pour une droite et un plan',
      'Représentation paramétrique d’une droite : un point, un vecteur directeur, et un paramètre qui parcourt la droite',
      'Équation cartésienne d’un plan ax + by + cz + d = 0, dont les trois premiers coefficients sont les coordonnées d’un vecteur normal',
      'Distance d’un point à un plan par la formule |ax + by + cz + d| / √(a² + b² + c²), et distance entre deux plans parallèles',
    ],
    exclude: [
      'Les coordonnées, la norme et le produit scalaire dans l’espace, acquis de la leçon « L’espace : vecteurs et coordonnées »',
      'Le produit vectoriel et le déterminant en dimension 3 (post-baccalauréat)',
      'L’équation d’une sphère et l’intersection d’une sphère avec un plan (terminale)',
      'La représentation paramétrique d’un plan à deux paramètres (terminale)',
      'Les systèmes linéaires à trois inconnues et leur résolution générale',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur les coordonnées et le produit scalaire de l’espace, la colinéarité, et la lecture d’un dessin de solide.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-droite-qui-traverse', path: `${LESSON_BASE_PATH}/la-droite-qui-traverse`, title: 'La droite qui traverse, ou pas', desc: 'Attrape le plan, fais-le monter. Attrape la droite, fais-la basculer. Compte les points communs : il n’y a que trois réponses possibles, et un seul nombre les distingue.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Attraper la droite' },
    { id: '02', number: 2, slug: 'trois-positions-un-seul-calcul', path: `${LESSON_BASE_PATH}/trois-positions-un-seul-calcul`, title: 'Trois positions, un seul calcul', desc: 'Ce que tu viens de constater s’écrit. Un produit scalaire, puis une appartenance : deux tests suffisent à trancher, sans jamais regarder le dessin.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Écrire le critère' },
    { id: '03', number: 3, slug: 'deux-plans-deux-normaux', path: `${LESSON_BASE_PATH}/deux-plans-deux-normaux`, title: 'Deux plans, deux normaux', desc: 'Pour deux plans, le troisième cas des droites disparaît : il n’en reste que deux, et ce sont encore leurs directions perpendiculaires qui décident.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Comparer les normaux' },
    { id: '04', number: 4, slug: 'le-parametre-qui-parcourt', path: `${LESSON_BASE_PATH}/le-parametre-qui-parcourt`, title: 'Le paramètre qui parcourt', desc: 'Un point de départ, une direction, et un curseur qu’on fait coulisser : trois lignes suffisent à décrire une droite entière de l’espace.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P5'], color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Faire coulisser' },
    { id: '05', number: 5, slug: 'l-equation-du-plan', path: `${LESSON_BASE_PATH}/l-equation-du-plan`, title: 'L’équation du plan', desc: 'Une seule ligne décrit un plan entier — et ses trois premiers coefficients ne sont pas des nombres quelconques. Constate-le avant qu’on ne te le dise.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P6'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Constater' },
    { id: '06', number: 6, slug: 'demontrer-sans-le-dessin', path: `${LESSON_BASE_PATH}/demontrer-sans-le-dessin`, title: 'Démontrer sans le dessin', desc: 'Parallèle ou orthogonal ? Le même produit scalaire répond aux deux — mais il change de camp selon qu’on parle de deux droites ou d’une droite et d’un plan.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P3', 'premiere_specialite_espace-droites-plans-1ere_P4'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Démontrer' },
    { id: '07', number: 7, slug: 'mesurer-l-ecart', path: `${LESSON_BASE_PATH}/mesurer-l-ecart`, title: 'Mesurer l’écart', desc: 'À quelle distance un point est-il d’un plan ? L’équation du plan connaît déjà la réponse — il ne reste qu’à la diviser par la longueur du normal.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P7'], color: 'rose', style: 'featured', estimatedMin: 7, difficulty: 4, actionText: 'Mesurer' },
    { id: '08', number: 8, slug: 'mission-finale-la-boite-percee', path: `${LESSON_BASE_PATH}/mission-finale-la-boite-percee`, title: '🏆 Mission finale : la boîte percée', desc: 'Dix épreuves pour prouver que tu tranches par le calcul : positions relatives, représentation paramétrique, équation de plan, parallélisme, orthogonalité et distances.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 5, actionText: 'Relever le défi' },
  ],
};
