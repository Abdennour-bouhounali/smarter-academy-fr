export const LESSON_CONFIG = {
  id: 'demo-lesson-2nde',
  title: 'Démo',
  estimatedDurationMin: 20,
  knowledgeMap: true,
  priorKnowledge: ['abscisse'],
  modules: [
    { id: 'm1', number: 1, slug: 'le-labo', title: 'Le labo', stage: 'trigger', estimatedMin: 8, teachesLearningPointIds: ['seconde_demo-lesson-2nde_P1'] },
    { id: 'm2', number: 2, slug: 'atelier', title: 'Atelier', stage: 'practice_lab', estimatedMin: 5, teachesLearningPointIds: ['seconde_demo-lesson-2nde_P2'] },
    { id: 'm3', number: 3, slug: 'finale', title: 'Finale', stage: 'evaluation', estimatedMin: 6 },
  ],
};
export default LESSON_CONFIG;
