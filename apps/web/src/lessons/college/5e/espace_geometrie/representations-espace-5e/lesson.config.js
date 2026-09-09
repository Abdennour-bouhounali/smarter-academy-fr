/**
 * Représentation de l'espace — 5e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX (ils sont lus statiquement).
 * Les 6 LPs de cette leçon (clé catalogue '5e_representations_espace') :
 *
 *   5e_representations-espace-5e_P1  Identifier les vues de dessus, de face et de côté
 *   5e_representations-espace-5e_P2  Associer un solide à ses trois vues
 *   5e_representations-espace-5e_P3  Lire une perspective cavalière d'un prisme droit
 *   5e_representations-espace-5e_P4  Lire une perspective cavalière d'un cylindre
 *   5e_representations-espace-5e_P5  Reconnaître le patron d'un prisme droit
 *   5e_representations-espace-5e_P6  Reconnaître le patron d'un cylindre de révolution
 *
 * ─── L'IDÉE CENTRALE ──────────────────────────────────────────────────
 * Un objet de l'espace n'a pas UNE représentation, il en a plusieurs, et
 * chacune répond à un besoin différent : la perspective pour montrer, les
 * trois vues pour mesurer sans ambiguïté, le patron pour fabriquer. Le
 * module 1 ouvre donc sur un manque — une seule vue ne suffit pas à
 * identifier un solide — et chaque module suivant ajoute la représentation
 * qui lève l'ambiguïté précédente.
 *
 * ─── CE QUE LA 5e APPORTE (et que la 6e n'avait pas) ──────────────────
 * La 6e déplie le CUBE et le PAVÉ : six rectangles, un pliage « évident ».
 * La 5e introduit les solides à base non carrée — le prisme droit (deux
 * bases identiques + une bande de rectangles) et surtout le CYLINDRE, dont
 * la surface latérale déroulée est un rectangle dont un côté vaut le
 * PÉRIMÈTRE du disque. C'est le contenu neuf, et il porte la manipulation
 * signature (module 5). La leçon ne redéplie donc pas le cube, et ne
 * recompte pas faces/arêtes/sommets pour eux-mêmes (6e, puis Euler en 3e).
 *
 * ─── PÉRIMÈTRE (exécutable, pas déclaratif) ───────────────────────────
 * Le référentiel 2026 exclut la SPHÈRE, et place le VOLUME — ainsi que la
 * pyramide et le cône — en 4e. `components/espace5e.js` lève donc une
 * exception dans `solide()` pour la sphère, la boule, la pyramide et le
 * cône, et dans `volume()` tout court : l'exclusion est du code, pas un
 * commentaire qu'on peut contourner sans s'en apercevoir.
 * Voir docs/lessons/5E_REPRESENTATION_ESPACE_SPEC.md §2.
 *
 * ─── RÉUTILISATION ────────────────────────────────────────────────────
 * `SolidTurner` et `ViewsPanel` ont été PROMUS dans
 * `lessons/common/components/` (la leçon de 3e les ré-exporte en une ligne)
 * plutôt que recopiés une troisième fois. La visibilité des arêtes reste
 * CALCULÉE par `common/utils/geometry3d.js` : aucun module ne demande
 * « dessine cette arête en pointillé ».
 */
export const LESSON_BASE_PATH = '/courses/college/5e/espace_geometrie/representations-espace-5e';

export const LESSON_CONFIG = {
  id: 'representations-espace-5e',
  // Formalisation continue par la carte des connaissances.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, diagnostiquées par le module 0. Toutes
  // viennent de la 6e (« Solides et patrons », « Figures planes »).
  // `perimetre` est indispensable : la bande du cylindre en dépend.
  priorKnowledge: ['face-solide', 'arete', 'sommet-solide', 'patron-solide', 'perimetre', 'figures-planes-usuelles'],
  sequentialUnlock: true,
  title: 'Représentation de l’espace',
  description:
    "Découvrir qu'une seule vue ne suffit pas à identifier un solide, lire une perspective cavalière comme une convention plutôt qu'une photo, puis déplier un prisme droit et un cylindre — dont la bande a exactement pour longueur le périmètre de sa base.",
  level: 'college',
  grade: '5e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📦',
  estimatedDurationMin: 72,
  skills: [
    "Identifier les vues de dessus, de face et de côté d'un solide",
    'Associer un solide à ses trois vues',
    "Lire une perspective cavalière d'un prisme droit",
    "Lire une perspective cavalière d'un cylindre de révolution",
    "Reconnaître le patron d'un prisme droit",
    "Reconnaître le patron d'un cylindre de révolution",
  ],
  teachingScope: {
    include: [
      'Vues de dessus, de face et de côté',
      'Association d’un solide à ses trois vues',
      'Perspective cavalière du prisme droit et du cylindre',
      'Patron du prisme droit : deux bases et une bande de rectangles',
      'Patron du cylindre de révolution : deux disques et un rectangle',
      'Lien entre la longueur de la bande et le périmètre de la base',
    ],
    exclude: [
      'Sphère et boule',
      'Volume des solides (objet de 4e)',
      'Pyramide et cône (objets de 4e)',
      'Sections de solides par un plan (3e)',
      'Relation d’Euler et droites non coplanaires (3e)',
      'Patrons du cube et du pavé (traités en 6e)',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'trois-photos-un-carton', path: `${LESSON_BASE_PATH}/trois-photos-un-carton`,
      title: 'Trois photos, un carton', desc: 'Une seule vue, et déjà deux solides possibles.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_representations-espace-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Observer',
    },
    {
      id: '02', number: 2, slug: 'le-dessin-qui-ment', path: `${LESSON_BASE_PATH}/le-dessin-qui-ment`,
      title: 'Le dessin qui ment un peu', desc: 'La perspective cavalière est une convention, pas une photo.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_representations-espace-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Tourner',
    },
    {
      id: '03', number: 3, slug: 'lire-les-trois-vues', path: `${LESSON_BASE_PATH}/lire-les-trois-vues`,
      title: 'Lire les trois vues', desc: 'Comme sur un plan d’atelier : de face, de dessus, de côté.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_representations-espace-5e_P1', '5e_representations-espace-5e_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Projeter',
    },
    {
      id: '04', number: 4, slug: 'deplier-le-prisme', path: `${LESSON_BASE_PATH}/deplier-le-prisme`,
      title: 'Déplier le prisme', desc: 'Deux bases, une bande — et les bases ne vont pas du même côté.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_representations-espace-5e_P5'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Déplier',
    },
    {
      id: '05', number: 5, slug: 'la-bande-du-cylindre', path: `${LESSON_BASE_PATH}/la-bande-du-cylindre`,
      title: 'La bande du cylindre', desc: 'Règle la longueur jusqu’à ce que le tube se referme exactement.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_representations-espace-5e_P4', '5e_representations-espace-5e_P6'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Dérouler',
    },
    {
      id: '06', number: 6, slug: 'latelier-demballage', path: `${LESSON_BASE_PATH}/latelier-demballage`,
      title: 'L’atelier d’emballage', desc: 'Des dimensions au patron, et du patron aux dimensions.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '5e_representations-espace-5e_P2',
        '5e_representations-espace-5e_P5',
        '5e_representations-espace-5e_P6',
      ],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Fabriquer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-latelier', path: `${LESSON_BASE_PATH}/mission-finale-latelier`,
      title: '🏆 Mission finale : l’atelier', desc: 'Dix épreuves pour prouver que tu lis et déplies l’espace.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
