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
// 'premium' when omitted. Target model: exactly 2 complete free lessons per
// grade, manually curated; `nombres-entiers` and `longueurs` keep their
// placeholder 'free' flag until the final free pair is settled.
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
    durationMinutes: 102,
    difficulty: 'Facile',
    status: 'available',
    icon: '🔎',
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
    durationMinutes: 112,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🧭',
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
    durationMinutes: 75,
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
    durationMinutes: 75,
    difficulty: 'Facile',
    status: 'available',
    icon: '⚖️',
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
  },
  '3e_nombres_rationnels': {
    id: 'nombres-rationnels',
    description: "Comprendre les nombres rationnels, rendre une fraction irréductible et comparer des rationnels, puis les additionner, soustraire, multiplier et diviser, et mobiliser ces opérations dans des expressions et des problèmes.",
    prerequisites: ["Fractions", "Nombres relatifs"],
    pointsToLearn: [
      "Comprendre et utiliser les nombres rationnels",
      "Rendre une fraction irréductible",
      "Comparer des rationnels",
      "Additionner et soustraire des fractions",
      "Multiplier et diviser des fractions",
      "Résoudre des problèmes avec des rationnels",
    ],
    durationMinutes: 71,
    difficulty: 'Moyen',
    status: 'available',
    icon: '➗',
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
  },
  '3e_racine_carree': {
    id: 'racines-carrees-3e',
    description: "Comprendre la racine carrée comme opération inverse du carré, reconnaître les carrés parfaits et calculer des racines exactes, puis utiliser ses propriétés, simplifier certaines racines et les mobiliser dans les problèmes de niveau 3e.",
    prerequisites: ["Carrés parfaits", "Puissances"],
    pointsToLearn: [
      "Comprendre le sens de √a",
      "Reconnaître les carrés parfaits",
      "Calculer des racines carrées exactes",
      "Utiliser les propriétés adaptées",
      "Simplifier certaines racines",
      "Utiliser la racine carrée dans des problèmes",
    ],
    durationMinutes: 75,
    difficulty: 'Moyen',
    status: 'available',
    icon: '√',
  },
  '3e_equations_inequations': {
    id: 'equations-produit',
    titleSma: 'Équations produit nul',
    description: "Résoudre des équations et inéquations du premier degré en mobilisant des transformations équivalentes et interpréter les solutions.",
    prerequisites: ["Calcul littéral", "Distributivité", "Nombres relatifs"],
    pointsToLearn: ["Résoudre une équation du premier degré", "Résoudre une inéquation", "Vérifier une solution", "Représenter un ensemble de solutions", "Modéliser un problème"],
    durationMinutes: 83,
    difficulty: 'Moyen',
    status: 'available',
    icon: '⚖️',
  },
  '3e_thales': {
    id: 'thales-3e',
    description: "Reconnaître les configurations de Thalès, écrire les rapports correctement et utiliser le théorème pour calculer des longueurs, puis mobiliser la réciproque et la contraposée dans des démonstrations et des problèmes concrets.",
    prerequisites: ["Proportionnalité", "Triangles", "Parallélisme"],
    pointsToLearn: [
      "Reconnaître une configuration de Thalès",
      "Écrire les rapports correctement",
      "Calculer une longueur",
      "Utiliser la réciproque",
      "Utiliser la contraposée",
      "Résoudre des problèmes concrets",
    ],
    durationMinutes: 77,
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
  },
  '3e_pythagore': {
    id: 'pythagore-3e',
    description: "Identifier l'hypoténuse, écrire l'égalité de Pythagore et l'utiliser pour calculer une longueur dans un triangle rectangle, puis calculer un côté de l'angle droit, utiliser la réciproque pour démontrer qu'un triangle est rectangle et résoudre des problèmes.",
    prerequisites: ["Triangles", "Carrés", "Racine carrée"],
    pointsToLearn: [
      "Identifier l'hypoténuse",
      "Écrire l'égalité de Pythagore",
      "Calculer l'hypoténuse",
      "Calculer un côté de l'angle droit",
      "Utiliser la réciproque",
      "Résoudre des problèmes",
    ],
    durationMinutes: 71,
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
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
  },
  '3e_puissances': {
    id: 'puissances-3e',
    description: "Interpréter une puissance, utiliser les règles de calcul sur les puissances et calculer avec des puissances de 10, puis les mobiliser dans l'écriture scientifique, comparer des ordres de grandeur et résoudre des problèmes scientifiques ou numériques.",
    prerequisites: ["Puissances de 5e et 4e", "Multiplication et division"],
    pointsToLearn: [
      "Interpréter une puissance",
      "Utiliser les règles de calcul sur les puissances",
      "Calculer avec des puissances de 10",
      "Utiliser les puissances dans l'écriture scientifique",
      "Comparer des ordres de grandeur",
      "Résoudre des problèmes scientifiques ou numériques",
    ],
    durationMinutes: 65,
    difficulty: 'Moyen',
    status: 'available',
    icon: '🚀',
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
    tier: meta.tier || 'premium',
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
