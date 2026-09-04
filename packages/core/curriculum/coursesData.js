// `with { type: 'json' }` so this module also loads under plain Node (the
// curriculum export script) — Vite/vitest accept the attribute too.
import officialProgram from './smarter_academy_programmes_maths_2026.json' with { type: 'json' };

// --- Métadonnées Smarter Academy ---
// Ces données enrichissent les objets officiels sans en modifier la liste.
//
// Each entry is a single lesson-meta object: one lesson per official
// curriculum object. (An earlier revision split larger notions into
// "Partie 1 / Partie 2" lessons to respect a 45-minute-per-lesson cap; that
// split has been retired — every official object now maps to exactly one
// catalogue lesson, regardless of its total estimated teaching time.)
//
// `durationMinutes` is the authored duration estimate (number); the display
// string `duration` is derived from it in buildLesson.
//
// `tier` ('free' | 'premium') is the content-tier flag introduced for the
// visitor/free-account/premium distinction. There is no subscription/
// entitlement system yet — this only controls what a visitor or free account
// can open today (see lessonAccess.js's isLessonUnlocked). Defaults to
// 'premium' when omitted. Every lesson is currently 'free' — the
// free/premium split is not enforced yet; flip individual lessons back to
// 'premium' once the entitlement model is ready.
const smaMetadata = {
  '6e_nombres_entiers': {
    id: 'nombres-entiers',
    description: "Comprendre ce qu'est vraiment un grand nombre : le construire avec du matériel base 10, lire la valeur de chaque chiffre, décomposer et recomposer, puis comparer, ranger et encadrer les grands nombres, les repérer sur une demi-droite graduée et les interpréter dans des problèmes.",
    prerequisites: ["Numération décimale", "Lecture et écriture des nombres"],
    pointsToLearn: [
      "Construire un nombre avec du matériel base 10",
      "Lire et écrire les nombres, en chiffres et en lettres",
      "Comprendre la valeur de position de chaque chiffre",
      "Décomposer et recomposer les nombres entiers",
      "Comparer, ranger et encadrer",
      "Repérer sur une demi-droite graduée",
      "Résoudre des problèmes en interprétant les nombres",
    ],
    durationMinutes: 129,
    difficulty: 'Facile',
    status: 'available',
    icon: '🔢',
    tier: 'free',
  },
  '6e_nombres_decimaux': {
    id: 'nombres-decimaux',
    description: "Comprendre qu'un nombre décimal représente une quantité : découper l'unité en dixièmes et centièmes et relier fraction décimale et écriture à virgule, puis comparer, ranger et encadrer des décimaux, les repérer sur une droite graduée et estimer un ordre de grandeur.",
    prerequisites: ["Numération décimale", "Fractions simples"],
    pointsToLearn: [
      "Partager l'unité en dixièmes, centièmes et millièmes",
      "Relier fraction décimale et écriture à virgule",
      "Comprendre la valeur de position après la virgule",
      "Reconnaître des écritures équivalentes (3,5 = 3,50)",
      "Comparer, ranger et encadrer des décimaux",
      "Repérer un décimal sur une droite graduée",
      "Estimer un ordre de grandeur",
    ],
    durationMinutes: 138,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🎯',
    tier: 'free',
  },
  '6e_fractions': {
    id: 'fractions',
    description:
      "Construire le sens de la fraction comme résultat d'un partage en parts égales et comprendre le rôle du numérateur et du dénominateur.",
    prerequisites: ["Division", "Partage"],
    pointsToLearn: [
      'Construire une fraction en partageant une unité en parts égales',
      'Comprendre le sens du numérateur et du dénominateur',
      "Trouver une fraction simple d'une quantité",
      'Placer une fraction sur une demi-droite graduée',
    ],
    durationMinutes: 104,
    difficulty: 'Facile',
    status: 'available',
    icon: '🍕',
    tier: 'free',
  },
  '6e_ordre_grandeur_estimation': {
    id: 'ordre-grandeur-estimation',
    description: "Développer le réflexe d'estimer un résultat avant de calculer : arrondir pour simplifier et trouver l'ordre de grandeur d'un calcul, puis utiliser l'estimation pour détecter les erreurs, repérer un résultat impossible sans recalculer et choisir le bon niveau de précision.",
    prerequisites: ["Nombres entiers", "Nombres décimaux", "Opérations"],
    pointsToLearn: [
      'Estimer un résultat avant de calculer',
      'Arrondir un nombre pour simplifier un calcul',
      "Trouver l'ordre de grandeur d'une somme, d'une différence, d'un produit",
      'Détecter un résultat impossible ou suspect sans recalculer',
      'Choisir le bon niveau de précision selon la situation',
    ],
    durationMinutes: 89,
    difficulty: 'Facile',
    status: 'available',
    icon: '🔎',
    tier: 'free',
  },
  '6e_resolution_problemes': {
    id: 'resolution-problemes',
    description: "Comprendre une situation avant de calculer : extraire les informations utiles et modéliser avec un schéma, des groupes, une droite graduée ou un tableau, puis choisir une stratégie adaptée, résoudre des problèmes à une ou plusieurs étapes, estimer, vérifier et communiquer une réponse complète.",
    prerequisites: ["Opérations", "Fractions", "Nombres décimaux"],
    pointsToLearn: [
      'Comprendre une situation avant de calculer',
      'Extraire les informations utiles et repérer les informations manquantes',
      'Modéliser une situation (schéma, groupes, droite graduée, tableau)',
      'Choisir une stratégie adaptée parmi plusieurs valables',
      'Résoudre des problèmes à une ou plusieurs étapes',
      'Estimer, vérifier et communiquer une réponse complète',
    ],
    durationMinutes: 90,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🧭',
    tier: 'free',
  },
  '6e_operations': {
    id: 'quatre-operations',
    description: "Comprendre le sens profond des quatre opérations, maîtriser les opérations posées et développer des stratégies de calcul mental efficaces, puis choisir la bonne stratégie de calcul, réaliser la division euclidienne en interprétant le reste et résoudre des problèmes en choisissant l'opération adaptée.",
    prerequisites: ["Numération décimale", "Tables de multiplication"],
    pointsToLearn: [
      "Comprendre les quatre opérations et leurs situations",
      "Maîtriser les opérations posées (retenues et échanges)",
      "Utiliser des stratégies de calcul mental efficaces",
      "Choisir entre calcul mental, en ligne, posé ou estimation",
      "Réaliser la division euclidienne et interpréter le reste",
      "Résoudre des problèmes en choisissant l'opération adaptée",
    ],
    durationMinutes: 119,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🧮',
    tier: 'free',
  },
  '6e_longueurs': {
    id: 'longueurs',
    description: "Mesurer des longueurs dans des situations concrètes : choisir la bonne unité, manier la règle sans se laisser piéger et comprendre les relations entre unités, puis convertir en comprenant pourquoi la valeur change, estimer avant de calculer et calculer le périmètre d'un polygone.",
    prerequisites: ["Unités de longueur"],
    pointsToLearn: [
      'Choisir une unité de longueur adaptée à une situation',
      'Mesurer une longueur avec une règle, sans se laisser piéger par le zéro',
      'Comprendre les relations entre km, m, cm et mm',
      'Convertir une longueur en comprenant pourquoi la valeur change',
      'Estimer un ordre de grandeur avant de mesurer ou de calculer',
      'Calculer le périmètre d’un polygone',
    ],
    durationMinutes: 86,
    difficulty: 'Facile',
    status: 'available',
    icon: '📏',
    tier: 'free',
  },
  '6e_masses': {
    id: 'masses',
    description: "Comparer des masses à l'aide d'une balance, choisir la bonne unité et lire une masse sur une balance à affichage, puis comprendre les relations entre mg, g, kg et t, convertir en comprenant pourquoi la valeur change et résoudre des problèmes de masse.",
    prerequisites: ["Unités de mesure"],
    pointsToLearn: [
      'Comparer des masses à l’aide d’une balance',
      'Choisir une unité de masse adaptée à une situation',
      'Lire une masse sur une balance à affichage',
      'Comprendre les relations entre mg, g, kg et t',
      'Convertir une masse en comprenant pourquoi la valeur change',
      'Estimer et résoudre des problèmes de masse',
    ],
    durationMinutes: 85,
    difficulty: 'Facile',
    status: 'available',
    icon: '⚖️',
    tier: 'free',
  },
  '6e_contenances': {
    id: 'contenances',
    description: "Comparer des contenances en transvasant un liquide, mesurer avec un récipient gradué et choisir la bonne unité, puis comprendre les relations entre L, dL, cL et mL, convertir en comprenant pourquoi la valeur change et relier 1 L à 1 dm³ dans des problèmes concrets.",
    prerequisites: ["Conversions d'unités"],
    pointsToLearn: [
      'Comparer des contenances en transvasant un liquide',
      'Mesurer une contenance à l’aide d’un récipient gradué',
      'Choisir une unité de contenance adaptée à une situation',
      'Comprendre les relations entre L, dL, cL et mL',
      'Convertir une contenance en comprenant pourquoi la valeur change',
      'Relier 1 L à 1 dm³ et résoudre des problèmes concrets',
    ],
    durationMinutes: 74,
    difficulty: 'Facile',
    status: 'available',
    icon: '💧',
    tier: 'free',
  },
  '6e_perimetres': {
    id: 'perimetres',
    description: "Comprendre le périmètre comme la longueur du contour d’une figure : mesurer et additionner les longueurs des côtés, utiliser les propriétés des figures usuelles et calculer le périmètre de polygones dans des situations concrètes.",
    prerequisites: ["Longueurs", "Mesures de longueurs"],
    pointsToLearn: [
      'Comprendre le périmètre comme la longueur du contour d’une figure',
      'Mesurer les longueurs des côtés d’un polygone',
      'Calculer le périmètre en additionnant les longueurs des côtés',
      'Utiliser les propriétés du carré et du rectangle pour calculer leur périmètre',
      'Choisir une unité adaptée pour exprimer un périmètre',
      'Estimer un périmètre avant de le calculer',
      'Résoudre des problèmes faisant intervenir des périmètres',
      'Connaître et utiliser la longueur du cercle (P = π × D)',
    ],
    durationMinutes: 80,
    difficulty: 'Facile',
    status: 'available',
    icon: '📐',
    tier: 'free',
  },
  '6e_aires': {
    id: 'aires',
    description: "Construire le sens de l’aire à partir de situations concrètes : comparer des surfaces, mesurer une aire avec des unités adaptées, comprendre les relations entre unités d’aire et calculer l’aire de figures usuelles.",
    prerequisites: ["Longueurs", "Unités de longueur"],
    pointsToLearn: [
      'Comprendre l’aire comme la mesure d’une surface',
      'Comparer des surfaces sans se limiter à leur forme ou à leur contour',
      'Mesurer une aire avec des unités adaptées',
      'Comprendre les unités usuelles d’aire et leurs relations',
      'Calculer l’aire d’un rectangle et d’un carré',
      'Utiliser des décompositions et recompositions pour déterminer une aire',
      'Résoudre des problèmes faisant intervenir des aires',
    ],
    durationMinutes: 81,
    difficulty: 'Moyen',
    status: 'available',
    icon: '▦',
    tier: 'free',
  },
  '6e_durees': {
    id: 'durees',
    description: "Comprendre et mesurer le temps dans des situations concrètes : lire et utiliser les unités usuelles de durée, convertir entre heures, minutes et secondes, comparer des durées, calculer une durée entre deux instants et résoudre des problèmes impliquant des horaires et des durées.",
    prerequisites: ["Nombres entiers", "Opérations"],
    pointsToLearn: [
      'Utiliser les unités usuelles de durée (jour, heure, minute, seconde)',
      'Lire et interpréter des horaires sur une horloge ou une représentation du temps',
      'Comprendre les relations entre heures, minutes et secondes',
      'Convertir une durée dans une autre unité',
      'Comparer et ordonner des durées',
      'Calculer une durée entre deux instants',
      'Résoudre des problèmes de durée et d’horaires',
    ],
    durationMinutes: 78,
    difficulty: 'Moyen',
    status: 'available',
    icon: '⏱️',
    tier: 'free',
  },
  '6e_angles': {
    id: 'angles',
    description: "Comprendre l’angle comme une ouverture et non comme une longueur : identifier et comparer des angles, les mesurer avec un rapporteur, reconnaître les principales catégories d’angles et construire un angle de mesure donnée.",
    prerequisites: ["Longueurs", "Figures géométriques"],
    pointsToLearn: [
      'Comprendre l’angle comme une ouverture entre deux demi-droites',
      'Identifier et comparer des angles à partir de représentations',
      'Reconnaître un angle droit, aigu ou obtus',
      'Mesurer un angle avec un rapporteur',
      'Utiliser correctement le rapporteur et choisir la bonne graduation',
      'Construire un angle de mesure donnée',
      'Résoudre des problèmes impliquant des angles',
    ],
    durationMinutes: 77,
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
    tier: 'free',
  },
  // --- Espace et géométrie (6e) ---
  // Les clés reprennent l'id de l'objet officiel du programme
  // (`espace_geometrie.official_objects[].id`) : c'est ainsi que
  // buildChaptersForGrade retrouve ces métadonnées. Attention, l'objet
  // officiel s'appelle `paralleles_perpendiculaires` (et non
  // `parallelisme_perpendicularite`) : une clé qui ne correspond pas
  // retombe silencieusement sur `{}` et produit une leçon vide.
  '6e_reperage_plan': {
    id: 'reperage-plan',
    description: "Utiliser un repère et un quadrillage pour localiser précisément des points dans le plan, lire et écrire des coordonnées, comprendre le rôle de chaque coordonnée, placer des points à partir de leurs coordonnées et résoudre des problèmes de repérage.",
    prerequisites: ["Nombres entiers", "Lecture d'un quadrillage"],
    pointsToLearn: [
      "Comprendre qu'un point peut être localisé précisément dans un plan",
      "Comprendre le rôle de la première et de la deuxième coordonnée",
      "Lire les coordonnées d'un point dans un repère simple",
      "Placer un point à partir de ses coordonnées",
      "Retrouver les coordonnées d'un point placé dans le plan",
      "Se déplacer dans un quadrillage pour atteindre une position donnée",
      "Utiliser les coordonnées pour résoudre des problèmes de repérage",
    ],
    durationMinutes: 87,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🗺️',
    tier: 'free',
  },
  '6e_droites_segments': {
    id: 'droites-segments',
    description: "Reconnaître, distinguer et représenter une droite, un segment et une demi-droite, comprendre le rôle des points et des extrémités, utiliser les notations géométriques appropriées et construire des objets géométriques simples.",
    prerequisites: ["Repérage dans le plan", "Figures géométriques"],
    pointsToLearn: [
      "Reconnaître une droite",
      "Reconnaître un segment",
      "Reconnaître une demi-droite",
      "Comprendre la différence entre droite, segment et demi-droite",
      "Identifier les extrémités d'un segment et d'une demi-droite",
      "Comprendre le rôle des points sur une droite",
      "Utiliser correctement les notations géométriques",
      "Construire et prolonger une droite, un segment ou une demi-droite",
      "Décrire une figure à l'aide de droites et de segments",
    ],
    durationMinutes: 86,
    difficulty: 'Facile',
    status: 'available',
    icon: '📏',
    tier: 'free',
  },
  '6e_paralleles_perpendiculaires': {
    id: 'parallelisme-perpendicularite',
    description: "Reconnaître, construire et vérifier des droites parallèles et perpendiculaires, comprendre les propriétés qui caractérisent ces relations, identifier l'angle droit et utiliser les instruments géométriques adaptés pour réaliser des constructions précises.",
    prerequisites: ["Droites et segments", "Angles"],
    pointsToLearn: [
      "Reconnaître deux droites parallèles",
      "Comprendre que deux droites parallèles ne se coupent pas",
      "Reconnaître deux droites perpendiculaires",
      "Comprendre le rôle de l'angle droit dans la perpendicularité",
      "Identifier des situations de parallélisme et de perpendicularité",
      "Vérifier le parallélisme avec les instruments adaptés",
      "Vérifier la perpendicularité avec une équerre",
      "Construire une droite parallèle à une droite donnée",
      "Construire une droite perpendiculaire à une droite donnée",
      "Résoudre des problèmes utilisant le parallélisme et la perpendicularité",
    ],
    durationMinutes: 89,
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
    tier: 'free',
  },
  '6e_figures_planes': {
    id: 'figures-planes',
    description: "Reconnaître, construire, décrire et caractériser les principales figures planes en utilisant leurs côtés, leurs sommets, leurs angles et leurs propriétés géométriques, puis identifier une figure à partir de propriétés données et construire une figure répondant à des contraintes précises.",
    prerequisites: ["Droites et segments", "Angles", "Parallélisme et perpendicularité"],
    pointsToLearn: [
      "Reconnaître les principales figures planes",
      "Identifier les côtés et les sommets d'une figure",
      "Identifier et comparer les angles d'une figure",
      "Reconnaître et caractériser un carré",
      "Reconnaître et caractériser un rectangle",
      "Reconnaître et caractériser un triangle",
      "Décrire une figure à partir de ses propriétés",
      "Comparer des figures à partir de leurs propriétés",
      "Identifier une figure à partir d'indices géométriques",
      "Construire une figure répondant à des propriétés données",
    ],
    durationMinutes: 80,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🔷',
    tier: 'free',
  },
  '6e_symetrie': {
    id: 'symetrie',
    description: "Comprendre la symétrie axiale comme une transformation géométrique, identifier un axe de symétrie, construire le symétrique d'un point ou d'une figure et utiliser les relations de perpendicularité et de distance pour vérifier et réaliser des constructions symétriques.",
    prerequisites: ["Repérage dans le plan", "Figures planes", "Perpendicularité"],
    pointsToLearn: [
      "Comprendre le principe d'une symétrie axiale",
      "Identifier un axe de symétrie",
      "Reconnaître une figure ou une situation présentant une symétrie",
      "Comprendre la relation entre un point et son symétrique",
      "Construire le symétrique d'un point",
      "Construire le symétrique d'une figure",
      "Utiliser la perpendicularité pour construire un symétrique",
      "Utiliser l'égalité des distances à l'axe de symétrie",
      "Identifier les propriétés conservées par symétrie",
      "Résoudre des problèmes de symétrie",
    ],
    durationMinutes: 77,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🪞',
    tier: 'free',
  },
  '6e_solides_patrons': {
    id: 'solides-patrons',
    description: "Reconnaître et représenter les principaux solides, identifier leurs faces, arêtes et sommets, comprendre les différentes représentations d'un objet en trois dimensions et établir le lien entre un solide et son patron en manipulant, dépliant et repliant des représentations.",
    prerequisites: ["Figures planes", "Longueurs"],
    pointsToLearn: [
      "Reconnaître les principaux solides usuels",
      "Identifier les faces d'un solide",
      "Identifier les arêtes d'un solide",
      "Identifier les sommets d'un solide",
      "Distinguer les représentations planes et les objets en trois dimensions",
      "Associer un solide à son patron",
      "Comprendre comment un patron se replie pour former un solide",
      "Construire mentalement un solide à partir d'un patron",
      "Identifier les patrons impossibles",
      "Résoudre des problèmes de représentation de solides",
    ],
    durationMinutes: 80,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🧊',
    tier: 'free',
  },
  '6e_constructions_geometriques': {
    id: 'constructions-geometriques',
    description: "Construire des figures géométriques avec la règle, l'équerre et le compas, choisir l'instrument adapté à chaque construction, réaliser un programme de construction, vérifier la précision d'une figure et communiquer clairement les étapes nécessaires à sa réalisation.",
    prerequisites: ["Droites et segments", "Parallélisme et perpendicularité", "Figures planes"],
    pointsToLearn: [
      "Utiliser correctement une règle graduée",
      "Utiliser correctement une équerre",
      "Utiliser correctement un compas",
      "Tracer un segment de longueur donnée",
      "Reporter une longueur avec le compas",
      "Construire une droite parallèle",
      "Construire une droite perpendiculaire",
      "Choisir l'instrument adapté à une construction",
      "Construire une figure à partir d'un programme de construction",
      "Identifier et corriger une erreur de construction",
      "Vérifier qu'une construction respecte les propriétés demandées",
      "Communiquer clairement les étapes d'une construction",
    ],
    durationMinutes: 85,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🛠️',
    tier: 'free',
  },
  '6e_tableaux': {
    id: 'tableaux',
    description: "Lire, compléter et produire des tableaux pour organiser des informations numériques, identifier le rôle des lignes, colonnes et en-têtes, extraire des informations et utiliser un tableau pour comparer et résoudre des situations concrètes.",
    prerequisites: ["Nombres entiers", "Lecture d'informations"],
    pointsToLearn: [
      "Comprendre l'intérêt d'un tableau pour organiser des informations",
      "Identifier les lignes, les colonnes, les cellules et les en-têtes",
      "Lire et extraire des informations dans un tableau",
      "Compléter un tableau à partir d'informations données",
      "Organiser des informations dans un tableau",
      "Construire un tableau adapté à une situation",
      "Comparer des informations à l'aide d'un tableau",
      "Modifier et interpréter des données dans un tableau",
      "Utiliser un tableau pour résoudre des problèmes simples",
    ],
    durationMinutes: 79,
    difficulty: 'Facile',
    status: 'available',
    icon: '📋',
    tier: 'free',
  },
  '6e_graphiques': {
    id: 'graphiques',
    description: "Lire et interpréter des graphiques simples issus de situations concrètes, relier un graphique aux données d'un tableau, identifier et comparer des valeurs, repérer des évolutions et produire une représentation graphique adaptée.",
    prerequisites: ["Tableaux", "Lecture de nombres"],
    pointsToLearn: [
      "Comprendre l'intérêt d'un graphique pour représenter des données",
      "Identifier les éléments principaux d'un graphique",
      "Lire une valeur à partir d'un graphique",
      "Associer un graphique à un tableau de données",
      "Construire un graphique simple à partir d'un tableau",
      "Comparer des valeurs représentées graphiquement",
      "Identifier une valeur maximale ou minimale",
      "Repérer une augmentation ou une diminution",
      "Interpréter des informations issues d'un graphique",
      "Détecter et corriger une représentation graphique incorrecte",
    ],
    durationMinutes: 82,
    difficulty: 'Moyen',
    status: 'available',
    icon: '📊',
    tier: 'free',
  },
  '6e_proportionnalite': {
    id: 'proportionnalite',
    description: "Reconnaître et résoudre des situations de proportionnalité à l'aide de tableaux, de représentations et de procédures adaptées, comprendre les relations multiplicatives entre grandeurs et choisir une stratégie efficace pour déterminer une valeur inconnue.",
    prerequisites: ["Nombres entiers", "Multiplication et division", "Tableaux"],
    pointsToLearn: [
      "Reconnaître une situation de proportionnalité",
      "Comprendre qu'une situation de proportionnalité repose sur une relation multiplicative",
      "Identifier les grandeurs qui varient dans une situation",
      "Compléter un tableau de proportionnalité",
      "Utiliser le passage par l'unité lorsque cela est pertinent",
      "Utiliser la multiplication ou la division pour déterminer une valeur",
      "Utiliser des relations simples comme le double, le triple ou la moitié",
      "Comparer des situations proportionnelles et non proportionnelles",
      "Choisir une stratégie adaptée pour résoudre une situation de proportionnalité",
      "Résoudre des problèmes de proportionnalité issus de situations concrètes",
      "Vérifier la cohérence d'un résultat dans une situation de proportionnalité",
    ],
    durationMinutes: 86,
    difficulty: 'Moyen',
    status: 'available',
    icon: '⚖️',
    tier: 'free',
  },
  '6e_algorithmique_programmation': {
    id: 'algorithmique-programmation',
    description:
      "Découvrir les principes fondamentaux d'un algorithme et les traduire dans des programmes simples, en décomposant un problème en instructions, en construisant et exécutant des séquences d'actions et en identifiant et corrigeant les erreurs d'un programme.",
    prerequisites: ["Nombres entiers", "Repérage dans le plan"],
    pointsToLearn: [
      "Comprendre qu'un algorithme décrit une suite d'instructions permettant de résoudre un problème",
      "Identifier une instruction et comprendre son effet",
      "Décomposer un problème en étapes simples",
      "Construire une séquence d'instructions",
      "Exécuter mentalement ou visuellement un algorithme",
      "Comprendre l'ordre des instructions",
      "Utiliser des répétitions simples pour éviter de reproduire plusieurs fois la même instruction",
      "Modifier un programme pour obtenir le résultat attendu",
      "Repérer une erreur dans une séquence d'instructions",
      "Corriger un programme qui ne produit pas le résultat attendu",
      "Tester un programme et observer son comportement",
      "Traduire une stratégie de résolution en programme simple",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 86,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🤖',
    tier: 'free',
  },
  '3e_nombres_rationnels': {
    id: 'nombres-rationnels',
    description: "Comprendre les nombres rationnels, rendre une fraction irréductible et comparer des rationnels, puis les additionner, soustraire, multiplier et diviser, et mobiliser ces opérations dans des expressions et des problèmes.",
    prerequisites: ["Fractions", "Calcul numérique", "Nombres relatifs"],
    pointsToLearn: [
      "Comprendre les nombres rationnels comme des nombres pouvant s'écrire sous forme de quotient de deux entiers avec un dénominateur non nul",
      "Reconnaître différentes écritures d'un même nombre rationnel",
      "Rendre une fraction irréductible",
      "Comparer deux nombres rationnels",
      "Additionner et soustraire des nombres rationnels",
      "Multiplier des nombres rationnels",
      "Diviser des nombres rationnels",
      "Choisir et enchaîner les opérations adaptées dans une expression",
      "Respecter les priorités de calcul dans une expression contenant des rationnels",
      "Résoudre des problèmes faisant intervenir des nombres rationnels",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Difficile',
    status: 'available',
    icon: '➗',
    tier: 'free',
  },
  '4e_racine_carree': {
    id: 'racines-carrees-4e',
    description: "Construire la notion de racine carrée à partir du problème inverse du carré et l'utiliser dans les calculs et problèmes correspondant au niveau.",
    prerequisites: ["Carrés", "Puissances", "Aires"],
    pointsToLearn: [
      "Comprendre la racine carrée",
      "Identifier les carrés parfaits",
      "Calculer des racines carrées simples",
      "Utiliser la racine carrée dans des problèmes"
    ],
    durationMinutes: 53,
    difficulty: 'Facile',
    status: 'available',
    icon: '√',
    tier: 'free',
  },
  '3e_racine_carree': {
    id: 'racines-carrees-3e',
    description: "Comprendre la racine carrée comme opération inverse du carré, reconnaître les carrés parfaits et calculer des racines exactes, puis utiliser ses propriétés, simplifier certaines racines et les mobiliser dans les problèmes de niveau 3e.",
    prerequisites: ["Carrés et puissances", "Calcul numérique", "Longueurs"],
    pointsToLearn: [
      "Comprendre la racine carrée comme l'opération inverse du carré",
      "Reconnaître les carrés parfaits",
      "Calculer des racines carrées exactes",
      "Associer un nombre à son carré et à sa racine carrée",
      "Comprendre le sens géométrique de la racine carrée",
      "Utiliser les propriétés de la racine carrée",
      "Simplifier certaines expressions contenant des racines carrées",
      "Comparer des nombres contenant des racines carrées",
      "Utiliser les racines carrées dans des calculs",
      "Mobiliser les racines carrées dans des problèmes géométriques et numériques",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 78,
    difficulty: 'Difficile',
    status: 'available',
    icon: '√',
    tier: 'free',
  },
  '3e_equations_inequations': {
    id: 'equations-produit',
    titleSma: 'Équations produit nul',
    description: "Résoudre des équations et inéquations du premier degré en mobilisant des transformations équivalentes et interpréter les solutions, notamment dans les situations où un produit est nul.",
    prerequisites: ["Calcul littéral", "Nombres relatifs", "Distributivité"],
    pointsToLearn: [
      "Comprendre une équation comme une égalité contenant une inconnue",
      "Comprendre la notion de solution d'une équation",
      "Transformer une équation en conservant les mêmes solutions",
      "Résoudre une équation du premier degré",
      "Utiliser la distributivité dans une équation",
      "Comprendre la propriété du produit nul",
      "Résoudre une équation produit nul",
      "Vérifier une solution",
      "Interpréter une solution dans une situation concrète",
      "Résoudre des problèmes à l'aide d'équations",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 77,
    difficulty: 'Difficile',
    status: 'available',
    icon: '⚖️',
    tier: 'free',
  },
  '3e_reperage': {
    id: 'reperage-droite-plan-3e',
    description: "Utiliser les coordonnées et les représentations dans le plan pour résoudre des problèmes géométriques et interpréter des situations.",
    prerequisites: ["Nombres relatifs", "Repérage dans le plan", "Calcul numérique"],
    pointsToLearn: [
      "Repérer un point sur une droite graduée",
      "Lire et utiliser les coordonnées d'un point dans le plan",
      "Identifier l'abscisse et l'ordonnée d'un point",
      "Placer un point à partir de ses coordonnées",
      "Déterminer les coordonnées d'un point à partir d'une représentation",
      "Interpréter les coordonnées comme des déplacements dans le plan",
      "Utiliser les coordonnées pour déterminer des longueurs simples",
      "Utiliser les coordonnées pour étudier des configurations géométriques",
      "Résoudre des problèmes géométriques à l'aide du repérage",
      "Interpréter une situation géométrique à partir de coordonnées",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Difficile',
    status: 'available',
    icon: '🗺️',
    tier: 'free',
  },
  '3e_representations_espace': {
    id: 'representation-espace-3e',
    description: "Lire et produire des représentations de solides et raisonner sur les configurations de l'espace.",
    prerequisites: ["Figures planes", "Solides", "Repérage dans le plan"],
    pointsToLearn: [
      "Reconnaître les principaux solides usuels",
      "Identifier les faces, arêtes et sommets d'un solide",
      "Lire une représentation en perspective d'un solide",
      "Distinguer les éléments visibles et cachés d'un solide",
      "Identifier un solide à partir de différentes représentations",
      "Changer de point de vue sur un solide",
      "Associer différentes représentations d'un même solide",
      "Produire une représentation adaptée d'un solide",
      "Raisonner sur les positions relatives de points, droites et plans dans l'espace",
      "Résoudre des problèmes à partir de représentations de l'espace",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Difficile',
    status: 'coming_soon',
    icon: '🧊',
    tier: 'free',
  },
  '3e_triangles': {
    id: 'triangles-3e',
    description: "Mobiliser les propriétés des triangles pour construire, calculer, démontrer et résoudre des problèmes géométriques.",
    prerequisites: ["Angles", "Droites et segments", "Parallélisme et perpendicularité"],
    pointsToLearn: [
      "Reconnaître et caractériser les différents types de triangles",
      "Utiliser les propriétés des triangles particuliers",
      "Identifier les côtés et angles d'un triangle",
      "Utiliser la somme des angles d'un triangle",
      "Construire un triangle à partir de données données",
      "Construire un triangle répondant à des contraintes géométriques",
      "Calculer des longueurs ou des angles dans un triangle",
      "Utiliser les propriétés géométriques pour justifier une construction",
      "Formuler et vérifier une conjecture sur une configuration triangulaire",
      "Rédiger un raisonnement géométrique à partir des propriétés d'un triangle",
      "Résoudre des problèmes géométriques faisant intervenir des triangles",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 87,
    difficulty: 'Difficile',
    status: 'available',
    icon: '🔺',
    tier: 'free',
  },
  '3e_translations_vecteurs': {
    id: 'translations-vecteurs-3e',
    description: "Utiliser les translations et les vecteurs pour décrire des déplacements et résoudre des problèmes géométriques.",
    prerequisites: ["Repérage dans le plan", "Figures planes", "Coordonnées"],
    pointsToLearn: [
      "Comprendre une translation comme un déplacement",
      "Identifier la direction, le sens et la longueur d'un déplacement",
      "Représenter un déplacement à l'aide d'un vecteur",
      "Construire l'image d'un point par une translation",
      "Construire l'image d'une figure par une translation",
      "Comprendre qu'un même vecteur peut représenter un même déplacement en différents endroits",
      "Identifier des vecteurs égaux",
      "Utiliser les coordonnées pour représenter un vecteur",
      "Déterminer les coordonnées d'un vecteur à partir de deux points",
      "Utiliser les translations et les vecteurs pour résoudre des problèmes géométriques",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 83,
    difficulty: 'Difficile',
    status: 'coming_soon',
    icon: '➡️',
    tier: 'free',
  },
  '3e_thales': {
    id: 'thales-3e',
    description: "Reconnaître les configurations de Thalès, écrire les rapports correctement et utiliser le théorème pour calculer des longueurs, puis mobiliser la réciproque et la contraposée dans des démonstrations et des problèmes concrets.",
    prerequisites: ["Proportionnalité", "Triangles", "Parallélisme", "Fractions"],
    pointsToLearn: [
      "Reconnaître une configuration de Thalès",
      "Identifier les droites parallèles dans une configuration",
      "Identifier les longueurs correspondantes",
      "Comprendre le lien entre parallélisme et proportionnalité",
      "Écrire correctement les rapports de longueurs",
      "Utiliser le théorème de Thalès pour calculer une longueur",
      "Choisir les rapports adaptés à une configuration donnée",
      "Vérifier la cohérence d'un calcul utilisant le théorème de Thalès",
      "Utiliser la réciproque du théorème de Thalès",
      "Utiliser la contraposée du théorème de Thalès",
      "Rédiger une démonstration utilisant Thalès",
      "Résoudre des problèmes concrets faisant intervenir le théorème de Thalès",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Difficile',
    status: 'available',
    icon: '📐',
    tier: 'free',
  },
  '3e_pythagore': {
    id: 'pythagore-3e',
    description: "Identifier l'hypoténuse, écrire l'égalité de Pythagore et l'utiliser pour calculer une longueur dans un triangle rectangle, puis calculer un côté de l'angle droit, utiliser la réciproque pour démontrer qu'un triangle est rectangle et résoudre des problèmes.",
    prerequisites: ["Triangles", "Carrés et puissances", "Racines carrées", "Longueurs"],
    pointsToLearn: [
      "Reconnaître un triangle rectangle",
      "Identifier l'angle droit",
      "Identifier l'hypoténuse",
      "Comprendre la relation entre les carrés des longueurs des côtés",
      "Écrire correctement l'égalité de Pythagore",
      "Calculer la longueur de l'hypoténuse",
      "Calculer la longueur d'un côté de l'angle droit",
      "Utiliser les racines carrées dans les calculs de longueurs",
      "Vérifier qu'un résultat est cohérent avec la configuration",
      "Utiliser la réciproque du théorème de Pythagore",
      "Démontrer qu'un triangle est rectangle",
      "Résoudre des problèmes concrets à l'aide du théorème de Pythagore",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 82,
    difficulty: 'Difficile',
    status: 'available',
    icon: '📐',
    tier: 'free',
  },
  '3e_trigonometrie': {
    id: 'trigonometrie-triangle-rectangle-3e',
    description: "Utiliser sinus, cosinus et tangente dans un triangle rectangle pour calculer une longueur ou un angle.",
    prerequisites: ["Triangles", "Angles", "Pythagore", "Fractions"],
    pointsToLearn: [
      "Reconnaître un triangle rectangle",
      "Identifier l'angle étudié",
      "Identifier le côté opposé à un angle",
      "Identifier le côté adjacent à un angle",
      "Identifier l'hypoténuse",
      "Comprendre qu'un rapport de longueurs dépend de l'angle considéré",
      "Comprendre et utiliser le sinus d'un angle",
      "Comprendre et utiliser le cosinus d'un angle",
      "Comprendre et utiliser la tangente d'un angle",
      "Choisir le rapport trigonométrique adapté à une situation",
      "Calculer une longueur dans un triangle rectangle",
      "Calculer un angle à partir d'un rapport trigonométrique",
      "Utiliser la calculatrice pour les fonctions trigonométriques",
      "Résoudre des problèmes concrets utilisant la trigonométrie",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 87,
    difficulty: 'Difficile',
    status: 'coming_soon',
    icon: '📐',
    tier: 'free',
  },
  // This lesson intentionally covers TWO official objects at once
  // ('fonctions_lineaires' AND 'fonctions_affines') under the broader
  // 'fonctions' object, per docs/architecture/LESSON_CONTRACT.md's
  // documented design for apps/web/src/lessons/college/3e/
  // donnees_probabilites/fonctions-lineaires-affines (10 modules,
  // vocabulaire image/antécédent through fonction affine + graphique).
  // 'fonctions_lineaires' and 'fonctions_affines' below stay 'coming_soon'
  // as separate, narrower catalogue objects — not yet built standalone.
  '3e_fonctions': {
    id: 'fonctions-lineaires-affines',
    description: "Maîtriser le vocabulaire image/antécédent/f(x), construire un tableau de valeurs, identifier et représenter graphiquement une fonction linéaire puis une fonction affine (f(x)=ax+b), lire a et b sur un graphique, déterminer l'expression d'une fonction depuis deux points et modéliser une situation concrète.",
    prerequisites: ["Fonctions de 4e", "Calcul littéral"],
    pointsToLearn: [
      "Calculer l'image d'un nombre par une fonction",
      "Rechercher un antécédent",
      "Construire un tableau de valeurs",
      "Identifier et utiliser une fonction linéaire",
      "Identifier et utiliser une fonction affine (f(x)=ax+b)",
      "Lire a et b et tracer une représentation graphique",
      "Déterminer le coefficient directeur à partir de deux points",
      "Déterminer l'expression complète d'une fonction depuis deux points",
    ],
    durationMinutes: 107,
    difficulty: 'Moyen',
    status: 'available',
    icon: '📈',
    tier: 'free',
  },
  '3e_fonctions_lineaires': {
    id: 'fonctions-lineaires',
    description: "Étudier les fonctions linéaires, leur expression, leur représentation graphique et leur lien avec la proportionnalité.",
    prerequisites: ["Fonctions", "Proportionnalité"],
    pointsToLearn: ["Expression f(x)=ax", "Coefficient", "Tableau de valeurs", "Représentation graphique", "Modélisation"],
    durationMinutes: 30,
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '📈',
    tier: 'free',
  },
  '3e_fonctions_affines': {
    id: 'fonctions-affines',
    description: "Étudier l'expression f(x)=ax+b d'une fonction affine et comprendre le rôle du coefficient directeur et de l'ordonnée à l'origine, puis construire un tableau de valeurs, la représenter graphiquement et l'utiliser pour modéliser des situations.",
    prerequisites: ["Fonctions linéaires", "Calcul littéral"],
    pointsToLearn: [
      "Expression f(x)=ax+b",
      "Coefficient directeur",
      "Ordonnée à l'origine",
      "Tableau de valeurs",
      "Graphique",
      "Modélisation",
    ],
    durationMinutes: 55,
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '📈',
    tier: 'free',
  },
  '3e_puissances': {
    id: 'puissances-3e',
    description: "Interpréter une puissance, utiliser les règles de calcul sur les puissances et calculer avec des puissances de 10, puis les mobiliser dans l'écriture scientifique, comparer des ordres de grandeur et résoudre des problèmes scientifiques ou numériques.",
    prerequisites: ["Calcul numérique", "Multiplication", "Fractions"],
    pointsToLearn: [
      "Comprendre une puissance comme une multiplication répétée",
      "Lire et interpréter une écriture avec exposant",
      "Calculer des puissances d'un nombre",
      "Comprendre le rôle de l'exposant",
      "Utiliser les propriétés des puissances",
      "Calculer avec des puissances de 10",
      "Comprendre les ordres de grandeur",
      "Écrire un nombre en notation scientifique",
      "Passer d'une écriture décimale à une écriture scientifique",
      "Comparer des nombres à l'aide des puissances de 10",
      "Utiliser les puissances dans des problèmes scientifiques ou numériques",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 77,
    difficulty: 'Difficile',
    status: 'available',
    icon: '🚀',
    tier: 'free',
  },
  '3e_multiples_diviseurs': {
    id: 'multiples-diviseurs',
    description: "Utiliser les notions de multiples, diviseurs, critères de divisibilité et nombres premiers pour décomposer des nombres, raisonner sur la divisibilité et résoudre des problèmes numériques.",
    prerequisites: ["Nombres entiers", "Multiplication", "Division"],
    pointsToLearn: [
      "Comprendre la relation entre multiples et diviseurs",
      "Reconnaître si un nombre est multiple ou diviseur d'un autre",
      "Utiliser les critères de divisibilité usuels",
      "Identifier les diviseurs d'un nombre",
      "Identifier les multiples d'un nombre",
      "Reconnaître un nombre premier",
      "Décomposer un nombre en produit de facteurs premiers",
      "Utiliser la décomposition en facteurs premiers pour résoudre des problèmes",
      "Raisonner sur la divisibilité",
      "Résoudre des problèmes utilisant multiples, diviseurs et nombres premiers",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🔢',
    tier: 'free',
  },
  '3e_calcul_litteral': {
    id: 'calcul-litteral-algebrique',
    description: "Maîtriser les transformations d'expressions littérales nécessaires aux équations, factorisations, identités remarquables et problèmes, en développant, réduisant, factorisant et transformant des expressions de manière équivalente.",
    prerequisites: ["Nombres relatifs", "Calcul numérique", "Propriétés de la distributivité"],
    pointsToLearn: [
      "Comprendre une expression littérale",
      "Identifier les termes et facteurs d'une expression",
      "Réduire une expression littérale",
      "Regrouper des termes semblables",
      "Développer une expression",
      "Utiliser la distributivité simple",
      "Utiliser la double distributivité",
      "Factoriser une expression simple",
      "Comprendre l'équivalence entre différentes écritures d'une expression",
      "Utiliser les identités remarquables",
      "Choisir une transformation adaptée à un problème",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Difficile',
    status: 'available',
    icon: '𝑥',
    tier: 'free',
  },
  '3e_resolution_problemes': {
    id: 'resolution-problemes-3e',
    description: "Mobiliser les nombres, calculs, expressions, équations et raisonnements pour modéliser et résoudre des problèmes complexes, choisir une stratégie adaptée, vérifier les résultats et communiquer une solution argumentée.",
    prerequisites: ["Calcul numérique", "Calcul littéral", "Équations", "Proportionnalité"],
    pointsToLearn: [
      "Comprendre et extraire les informations utiles d'un problème",
      "Identifier la question et les contraintes",
      "Choisir une stratégie de résolution",
      "Traduire une situation en calcul, expression ou équation",
      "Mobiliser les nombres et opérations adaptés",
      "Utiliser le calcul littéral dans une situation problème",
      "Utiliser une équation pour modéliser une situation",
      "Organiser les étapes d'une résolution",
      "Vérifier la cohérence d'un résultat",
      "Interpréter le résultat dans le contexte du problème",
      "Communiquer une solution complète et argumentée",
    ],
    // Aligné sur la somme des `estimatedMin` des modules (lesson.config.js).
    durationMinutes: 85,
    difficulty: 'Difficile',
    status: 'available',
    icon: '🧠',
    tier: 'free',
  },
  '4e_puissances': {
    id: 'puissances-4e',
    titleSma: 'Puissances',
    description: "Approfondir l'utilisation des puissances et développer les règles de calcul nécessaires à la transformation d'expressions numériques et algébriques.",
    prerequisites: ["Puissances de 5e", "Calcul littéral"],
    pointsToLearn: ["Consolider la notation puissance", "Calculer avec les puissances", "Utiliser les règles de calcul attendues", "Travailler avec les puissances de 10", "Utiliser les puissances dans des problèmes"],
    durationMinutes: 35,
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '⚡',
    tier: 'free',
  },
  '4e_calcul_litteral': {
    id: 'calcul-litteral-4e',
    description: "Approfondir la transformation d'expressions littérales, la distributivité, la réduction et la factorisation selon les objectifs du niveau.",
    prerequisites: ["Calcul littéral de 5e", "Nombres relatifs"],
    pointsToLearn: ["Réduire une expression", "Développer", "Utiliser la distributivité", "Factoriser des expressions simples", "Transformer des expressions"],
    durationMinutes: 45,
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '🔤',
    tier: 'free',
  },
};

const slugify = (value) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-');

/**
 * Builds one lesson object from an official program object + one lesson-meta
 * entry. `partIndex`/`partTotal` are 1/1 for unsplit lessons; split parts get
 * 1..partTotal in the metadata array's order.
 */
function buildLesson({ gradeId, levelId, domainId, obj, meta, partIndex, partTotal }) {
  // Lesson codes must be GLOBALLY unique (bare-code API lookups — see the
  // catalogue invariants test). Authored ids take care of it themselves;
  // auto-generated stubs get a grade suffix because the same official object
  // id recurs across grades (e.g. 'triangles' in 5e and 4e).
  const lessonId = meta.id || `${slugify(obj.id)}-${gradeId}`;
  const pointsToLearn = meta.pointsToLearn || obj.teachingScope?.include || obj.teaching_scope || [];
  const durationMinutes = meta.durationMinutes ?? null;

  return {
    officialObject: obj.id,
    title: meta.titleSma || obj.title,
    id: lessonId,
    description: meta.description || obj.description || 'En préparation...',
    prerequisites: meta.prerequisites || obj.prerequisites || [],
    // The authored, free-text list — unchanged surface, every existing
    // reader keeps working exactly as before.
    pointsToLearn,
    // Canonical Learning Points, derived from pointsToLearn's order.
    // `id` is stable/deterministic/human-readable (e.g.
    // '6e_resolution-problemes-1_P3') and, once imported and referenced by
    // learning evidence, is effectively append-only: reordering or
    // removing a pointsToLearn entry shifts what an existing id means
    // (smarter:validate-curriculum flags that drift after import).
    learningPoints: pointsToLearn.map((title, i) => ({
      id: `${gradeId}_${lessonId}_P${i + 1}`,
      title,
      order: i + 1,
    })),
    // Authored duration estimate in minutes; the display string is derived
    // so there is a single source of truth for lesson length.
    durationMinutes,
    duration: durationMinutes != null ? `${durationMinutes} min` : '--',
    // Split-lesson metadata: "Partie {partIndex} / {partTotal}". 1/1 = unsplit.
    partIndex,
    partTotal,
    difficulty: meta.difficulty || 'Non défini',
    status: meta.status || 'coming_soon',
    icon: meta.icon || '📘',
    isNew: meta.isNew || false,
    tier: meta.tier || 'free',
    path: meta.path || `/courses/${levelId}/${gradeId}/${domainId}/${lessonId}`,
  };
}

// Fonction utilitaire pour extraire les chapitres d'un niveau depuis le JSON officiel
function buildChaptersForGrade(gradeId, levelId) {
  const gradeData = officialProgram.levels[gradeId];
  if (!gradeData || !gradeData.domains) return [];

  return gradeData.domains.map(domain => {
    if (typeof domain === 'string') {
      return {
        id: domain.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_'),
        title: domain,
        lessons: []
      };
    }

    return {
      id: domain.id,
      title: domain.title,
      // One official object can map to several lessons if a future entry in
      // smaMetadata is authored as an array (the retired "Partie 1 / Partie
      // 2" split); every current entry is a single lesson-meta object.
      lessons: (domain.official_objects || []).flatMap(obj => {
        const raw = smaMetadata[`${gradeId}_${obj.id}`] || smaMetadata[obj.id] || {};
        const metas = Array.isArray(raw) ? raw : [raw];
        return metas.map((meta, i) =>
          buildLesson({
            gradeId,
            levelId,
            domainId: domain.id,
            obj,
            meta,
            partIndex: i + 1,
            partTotal: metas.length,
          })
        );
      })
    };
  });
}

export const courseLevels = [
  {
    id: 'college',
    title: 'Collège',
    subtitle: 'De la 6ème à la 3ème',
    icon: '📘',
    color: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50/50 border-blue-200',
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700',
    grades: [
      { id: '6e', name: '6ème', chapters: buildChaptersForGrade('6e', 'college') },
      { id: '5e', name: '5ème', chapters: buildChaptersForGrade('5e', 'college') },
      { id: '4e', name: '4ème', chapters: buildChaptersForGrade('4e', 'college') },
      { id: '3e', name: '3ème', chapters: buildChaptersForGrade('3e', 'college') }
    ]
  },
  {
    id: 'lycee',
    title: 'Lycée',
    subtitle: 'De la Seconde à la Terminale',
    icon: '📗',
    color: 'from-emerald-500 to-teal-500',
    lightBg: 'bg-emerald-50/50 border-emerald-200',
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    grades: [
      { id: 'seconde', name: 'Seconde', chapters: buildChaptersForGrade('seconde', 'lycee') },
      { id: 'premiere_specialite', name: 'Première Spécialité', chapters: buildChaptersForGrade('premiere_specialite', 'lycee') },
      { id: 'terminale_specialite', name: 'Terminale Spécialité', chapters: buildChaptersForGrade('terminale_specialite', 'lycee') },
      { id: 'terminale_complementaires', name: 'Terminale Complémentaires', chapters: buildChaptersForGrade('terminale_complementaires', 'lycee') }
    ]
  }
];

/**
 * Flattens courseLevels into the list of every selectable grade — the single
 * source of truth for "which grades exist," consumed by registration's grade
 * picker and the student grade switcher alike. A grade's `id` here is
 * exactly the value stored as a student's `user.grade`.
 *
 * @returns {Array<{id: string, name: string, levelId: string, levelTitle: string}>}
 */
export function getAllGrades() {
  return courseLevels.flatMap((level) =>
    level.grades.map((grade) => ({
      id: grade.id,
      name: grade.name,
      levelId: level.id,
      levelTitle: level.title,
    }))
  );
}
