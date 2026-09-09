import { BossFinal } from '../../../../common/kit';
const EPREUVES = [
  { id: 'demo-e1', skill: 'pente', prompt: 'Pente de la droite ?', options: ['2', '3'], correct: 0, explain: 'ok',
    requires: ['pente'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_demo-lesson-2nde_P1'] } },
  { id: 'demo-e2', skill: 'lire', prompt: 'Lis la pente.', options: ['1', '4'], correct: 1, explain: 'ok',
    requires: ['lecture'], assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_demo-lesson-2nde_P2'] } },
];
export default function Module03Finale() { return <BossFinal epreuves={EPREUVES} />; }
