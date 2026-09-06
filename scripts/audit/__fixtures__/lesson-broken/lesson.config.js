export const LESSON_BASE_PATH = '/fixtures/lesson-broken';

export const LESSON_CONFIG = {
  id: 'fixture-broken',
  title: 'Fixture cassée',
  knowledgeMap: true,
  priorKnowledge: ['abscisse'],
  teachingScope: { include: ['Image et antécédent, notation f(x)'] },
  modules: [
    { id: '00', number: 0, slug: 'diagnostic', stage: 'prerequisite_check', estimatedMin: 4 },
    { id: '01', number: 1, slug: 'decouverte', stage: 'discovery', estimatedMin: 9 },
  ],
};
