import officialProgram from '../../smarter_academy_programmes_maths_2026.json';

// --- Métadonnées Smarter Academy ---
// Ces données enrichissent les objets officiels sans en modifier la liste ou la structure.
const smaMetadata = {
  // --- 3ème ---
  'Nombres rationnels': {
    id: 'nombres-rationnels',
    description: 'Fractions, simplification, opérations et priorités.',
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '➗',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/nombres_calculs/nombres-rationnels'
  },
  'Équations et inéquations du premier degré': {
    id: 'equations-produit',
    titleSma: 'Équations produit nul', // On garde l'ID de la plateforme, mais on le lie à l'objet officiel
    description: 'Résoudre (ax + b)(cx + d) = 0 et factorisation.',
    duration: '25 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '⚖️',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/nombres_calculs/equations-produit'
  },
  'Théorème de Thalès': {
    id: 'thales-3e',
    description: 'Manipulations géométriques, égalité des rapports et démonstrations interactives.',
    duration: '70 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/espace_geometrie/thales-3e'
  },
  'Théorème de Pythagore': {
    id: 'pythagore-3e',
    description: 'Observer, calculer des longueurs et démontrer avec Pythagore.',
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '📐',
    isNew: true,
    totalModules: 7,
    path: '/courses/college/3e/espace_geometrie/pythagore-3e'
  },
  'Fonctions linéaires': {
    id: 'fonctions-lineaires',
    description: 'Notion de fonction linéaire, modélisation et représentation.',
    duration: '30 min',
    difficulty: 'Moyen',
    status: 'coming_soon',
    icon: '📈'
  },
  'Fonctions affines': {
    id: 'fonctions-lineaires-affines',
    description: 'Module interactif avec simulateur. De la découverte au choix du meilleur forfait.',
    duration: '55 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '📈',
    isNew: true,
    totalModules: 10,
    path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines'
  },

  '3e_Puissances': {
    id: 'puissances-3e',
    title: 'Puissances',
    description: 'Découverte des puissances, puissances de 10, écriture scientifique et règles de calcul.',
    duration: '60 min',
    difficulty: 'Moyen',
    status: 'available',
    icon: '🚀',
    isNew: true,
    totalModules: 6,
    path: '/courses/college/3e/nombres_calculs/puissances-3e'
  },
  
  // --- 4ème ---
  '4e_Puissances': { id: 'puissances-4e', description: 'Module complet en 6 micro-leçons : puissances de 10 et notation scientifique.', duration: '35 min total', difficulty: 'Moyen', status: 'coming_soon', icon: '⚡' },
  'Calcul littéral et algébrique': { id: 'calcul-litteral-4e', description: 'Module complet en 6 micro-leçons : distributivité simple, double, réduction et factorisation.', duration: '45 min total', difficulty: 'Moyen', status: 'coming_soon', icon: '🔤' },
  
  // Défauts pour les notions non définies spécifiquement
};

// Fonction utilitaire pour extraire les chapitres d'un niveau depuis le JSON officiel
function buildChaptersForGrade(gradeId) {
  const gradeData = officialProgram.levels[gradeId];
  if (!gradeData || !gradeData.domains) return [];

  return gradeData.domains.map(domain => {
    // Si domain est juste une string (comme au lycée), on la convertit en objet standard
    if (typeof domain === 'string') {
      return {
        id: domain.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_'),
        title: domain,
        lessons: [] // Pas de détails d'objets officiels au lycée dans le JSON actuel
      };
    }

    return {
      id: domain.id,
      title: domain.title,
      lessons: domain.official_objects.map(obj => {
        const meta = smaMetadata[`${gradeId}_${obj}`] || smaMetadata[obj] || {};
        return {
          // Données officielles
          officialObject: obj,
          title: meta.title || obj, // Le titre affiché sera l'officiel par défaut ou surchargé par les métadonnées
          // Métadonnées SMA
          id: meta.id || obj.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-'),
          description: meta.description || 'En préparation...',
          duration: meta.duration || '--',
          difficulty: meta.difficulty || 'Non défini',
          status: meta.status || 'coming_soon',
          icon: meta.icon || '📘',
          isNew: meta.isNew || false,
          totalModules: meta.totalModules || 0,
          path: meta.path || `/courses/college/${gradeId}/${domain.id}/${meta.id || 'not-found'}`
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
