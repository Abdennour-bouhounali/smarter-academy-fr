import officialProgram from '../../smarter_academy_programmes_maths_2026.json';

// --- Métadonnées Smarter Academy ---
// Ces données enrichissent les objets officiels sans en modifier la liste ou la structure.
const smaMetadata = {
  '3e_nombres_rationnels': {
    id: 'nombres-rationnels',
    description: "Maîtriser les calculs sur les nombres rationnels et les fractions dans des expressions et des problèmes, en mobilisant simplification, comparaison et opérations.",
    prerequisites: ["Fractions","Nombres relatifs","Opérations","Priorités opératoires"],
    pointsToLearn: ["Comprendre et utiliser les nombres rationnels","Rendre une fraction irréductible","Comparer des rationnels","Additionner et soustraire des fractions","Multiplier et diviser des fractions","Résoudre des problèmes avec des rationnels"],
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '➗',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/nombres_calculs/nombres-rationnels'
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
    duration: '40 min',
    difficulty: 'Facile',
    status: 'available',
    icon: '√',
    isNew: true,
    totalModules: 5,
    path: '/courses/college/4e/nombres_calculs/racines-carrees'
  },
  '3e_racine_carree': {
    id: 'racines-carrees',
    description: "Comprendre et utiliser la racine carrée comme opération inverse du carré, calculer des racines exactes et utiliser les propriétés nécessaires aux problèmes de niveau 3e.",
    prerequisites: ["Carrés parfaits","Puissances","Calcul littéral"],
    pointsToLearn: ["Comprendre le sens de √a","Reconnaître les carrés parfaits","Calculer des racines carrées exactes","Utiliser les propriétés adaptées","Simplifier certaines racines","Utiliser la racine carrée dans des problèmes"],
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '√',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/nombres_calculs/racines-carrees'
  },
  '3e_equations_inequations': {
    id: 'equations-produit',
    titleSma: 'Équations produit nul',
    description: "Résoudre des équations et inéquations du premier degré en mobilisant des transformations équivalentes et interpréter les solutions.",
    prerequisites: ["Calcul littéral","Distributivité","Nombres relatifs"],
    pointsToLearn: ["Résoudre une équation du premier degré","Résoudre une inéquation","Vérifier une solution","Représenter un ensemble de solutions","Modéliser un problème"],
    duration: '25 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '⚖️',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/nombres_calculs/equations-produit'
  },
  '3e_thales': {
    id: 'thales-3e',
    description: "Reconnaître les configurations de Thalès, utiliser le théorème pour calculer des longueurs et mobiliser sa réciproque ou sa contraposée dans des démonstrations.",
    prerequisites: ["Proportionnalité","Triangles","Parallélisme"],
    pointsToLearn: ["Reconnaître une configuration de Thalès","Écrire les rapports correctement","Calculer une longueur","Utiliser la réciproque","Utiliser la contraposée","Résoudre des problèmes concrets"],
    duration: '70 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/espace_geometrie/thales-3e'
  },
  '3e_pythagore': {
    id: 'pythagore-3e',
    description: "Utiliser le théorème de Pythagore pour calculer une longueur dans un triangle rectangle et sa réciproque pour démontrer qu'un triangle est rectangle.",
    prerequisites: ["Triangles","Carrés","Racine carrée"],
    pointsToLearn: ["Identifier l'hypoténuse","Écrire l'égalité de Pythagore","Calculer l'hypoténuse","Calculer un côté de l'angle droit","Utiliser la réciproque","Résoudre des problèmes"],
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/espace_geometrie/pythagore-3e'
  },
  '3e_fonctions_lineaires': {
    id: 'fonctions-lineaires',
    description: "Étudier les fonctions linéaires, leur expression, leur représentation graphique et leur lien avec la proportionnalité.",
    prerequisites: ["Fonctions","Proportionnalité"],
    pointsToLearn: ["Expression f(x)=ax","Coefficient","Tableau de valeurs","Représentation graphique","Modélisation"],
    duration: '30 min',
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '📈',
  },
  '3e_fonctions_affines': {
    id: 'fonctions-lineaires-affines',
    description: "Étudier les fonctions affines, leur expression et leur représentation graphique et les utiliser pour modéliser des situations.",
    prerequisites: ["Fonctions linéaires","Calcul littéral"],
    pointsToLearn: ["Expression f(x)=ax+b","Coefficient directeur","Ordonnée à l'origine","Tableau de valeurs","Graphique","Modélisation"],
    duration: '55 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '📈',
    isNew: true,
    totalModules: 10,
    path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines'
  },
  '3e_puissances': {
    id: 'puissances-3e',
    titleSma: 'Puissances',
    description: "Maîtriser les puissances et leurs règles de calcul, notamment dans les calculs numériques, l'écriture scientifique et les situations impliquant des ordres de grandeur.",
    prerequisites: ["Puissances de 5e et 4e","Calcul littéral","Multiplication et division"],
    pointsToLearn: ["Interpréter une puissance","Utiliser les règles de calcul sur les puissances","Calculer avec des puissances de 10","Utiliser les puissances dans l'écriture scientifique","Comparer des ordres de grandeur","Résoudre des problèmes scientifiques ou numériques"],
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '🚀',
    isNew: true,
    totalModules: 6,
    path: '/courses/college/3e/nombres_calculs/puissances-3e'
  },
  '4e_puissances': {
    id: 'puissances-4e',
    titleSma: 'Puissances',
    description: "Approfondir l'utilisation des puissances et développer les règles de calcul nécessaires à la transformation d'expressions numériques et algébriques.",
    prerequisites: ["Puissances de 5e","Calcul littéral"],
    pointsToLearn: ["Consolider la notation puissance","Calculer avec les puissances","Utiliser les règles de calcul attendues","Travailler avec les puissances de 10","Utiliser les puissances dans des problèmes"],
    duration: '35 min',
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '⚡',
    totalModules: 6,
  },
  '4e_calcul_litteral': {
    id: 'calcul-litteral-4e',
    description: "Approfondir la transformation d'expressions littérales, la distributivité, la réduction et la factorisation selon les objectifs du niveau.",
    prerequisites: ["Calcul littéral de 5e","Nombres relatifs"],
    pointsToLearn: ["Réduire une expression","Développer","Utiliser la distributivité","Factoriser des expressions simples","Transformer des expressions"],
    duration: '45 min',
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '🔤',
    totalModules: 6,
  },
};

// Fonction utilitaire pour extraire les chapitres d'un niveau depuis le JSON officiel
function buildChaptersForGrade(gradeId) {
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
      lessons: (domain.official_objects || []).map(obj => {
        const meta = smaMetadata[`${gradeId}_${obj.id}`] || smaMetadata[obj.id] || {};
        return {
          officialObject: obj.id,
          title: meta.titleSma || obj.title,
          id: meta.id || obj.id.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-'),
          description: meta.description || obj.description || 'En préparation...',
          prerequisites: meta.prerequisites || obj.prerequisites || [],
          pointsToLearn: meta.pointsToLearn || obj.teaching_scope || [],
          duration: meta.duration || '--',
          difficulty: meta.difficulty || 'Non défini',
          status: meta.status || 'coming_soon',
          icon: meta.icon || '📘',
          isNew: meta.isNew || false,
          totalModules: meta.totalModules || 0,
          path: meta.path || `/courses/college/${gradeId}/${domain.id}/${meta.id || obj.id}`
        };
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
      { id: '6e', name: '6ème', chapters: buildChaptersForGrade('6e') },
      { id: '5e', name: '5ème', chapters: buildChaptersForGrade('5e') },
      { id: '4e', name: '4ème', chapters: buildChaptersForGrade('4e') },
      { id: '3e', name: '3ème', chapters: buildChaptersForGrade('3e') }
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
      { id: 'seconde', name: 'Seconde', chapters: buildChaptersForGrade('seconde') },
      { id: 'premiere_specialite', name: 'Première Spécialité', chapters: buildChaptersForGrade('premiere_specialite') },
      { id: 'terminale_specialite', name: 'Terminale Spécialité', chapters: buildChaptersForGrade('terminale_specialite') },
      { id: 'terminale_complementaires', name: 'Terminale Complémentaires', chapters: buildChaptersForGrade('terminale_complementaires') }
    ]
  }
];
