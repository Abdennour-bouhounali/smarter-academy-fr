export const domainGradients = {
  "Collège": "from-blue-600 via-indigo-500 to-cyan-400",
  "Lycée": "from-purple-600 via-pink-500 to-rose-400",
  "Préparation Bac": "from-amber-500 via-orange-500 to-red-400",
  "Remise à niveau": "from-emerald-500 via-teal-500 to-cyan-400",
};

export const domainIcons = {
  "Collège": "📐",
  "Lycée": "📈",
  "Préparation Bac": "🏆",
  "Remise à niveau": "🎯",
};

export const domainColors = {
  "Collège": "bg-blue-100 text-blue-700",
  "Lycée": "bg-purple-100 text-purple-700",
  "Préparation Bac": "bg-amber-100 text-amber-700",
  "Remise à niveau": "bg-emerald-100 text-emerald-700",
};

export const projects = [
  {
    id: 1,
    domain: "Collège",
    name: "Mathématiques Collège (6ème à 3ème)",
    level: "Collège (6e, 5e, 4e, 3e)",
    description: "Renforcement des fondamentaux en calcul, géométrie et raisonnement. Explications adaptées pour lever les blocages et construire une base solide.",
    tech: ["Fractions", "Calcul Littéral", "Pythagore & Thalès", "Équations", "Probabilités"],
    images: null,
    github: null,
    demo: null,
    featured: true
  },
  {
    id: 2,
    domain: "Lycée",
    name: "Mathématiques Lycée (2nde & 1ère Spé)",
    level: "Lycée (Seconde & Première)",
    description: "Maîtrise approfondie du programme de Seconde et de la Spécialité Mathématiques en Première : étude de fonctions, dérivation, suites et géométrie.",
    tech: ["Second Degré", "Dérivation", "Suites Numériques", "Trigonométrie", "Géométrie Vectorielle"],
    images: null,
    github: null,
    demo: null,
    featured: true
  },
  {
    id: 3,
    domain: "Préparation Bac",
    name: "Préparation Bac Spécialité & Maths Expertes",
    level: "Terminale (Spé Maths & Expertes)",
    description: "Entraînement intensif aux épreuves du Baccalauréat. Analyse de sujets d'annales corrigés, méthode de rédaction rigoureuse et automatismes de calcul.",
    tech: ["Intégration", "Limites & Continuité", "Nombres Complexes", "Équations Différentielles", "Annales Bac"],
    images: null,
    github: null,
    demo: null,
    featured: true,
    award: "🏆 98% Taux de Réussite"
  },
  {
    id: 4,
    domain: "Remise à niveau",
    name: "Stage de Remise à Niveau & Consolidation",
    level: "Tous Niveaux (Collège & Lycée)",
    description: "Programme ciblé pour combler rapidement les lacunes accumulées, débloquer les anxiétés face aux maths et reprendre confiance grâce à des réussites guidées.",
    tech: ["Diagnostic initial", "Reprise des bases", "Méthodologie", "Gestion du stress", "Confiance en soi"],
    images: null,
    github: null,
    demo: null,
    featured: true
  },
  {
    id: 5,
    domain: "Préparation Bac",
    name: "Stage Intensif Vacances & Révisions Bac",
    level: "Lycée & Terminale",
    description: "Stages d'entraînement pendant les vacances scolaires (Toussaint, Février, Pâques) pour réviser les chapitres fondamentaux et prendre de l'avance.",
    tech: ["Stages Vacances", "Fiches Synthétiques", "Révisions Express", "Entraînement Bac"],
    images: null,
    github: null,
    demo: null,
    featured: false
  },
  {
    id: 6,
    domain: "Collège",
    name: "Stage Commando Brevet (DNB 3ème)",
    level: "3ème (Brevet des Collèges)",
    description: "Session spéciale de préparation au Brevet : méthodologie sur sujets complets, gestion du temps et révision systématique des exercices types.",
    tech: ["Sujets DNB", "Gestion du Temps", "Exercices Types", "Calcul & Géométrie"],
    images: null,
    github: null,
    demo: null,
    featured: false
  }
];
