import { describe, it, expect } from 'vitest';
import { recommendModulesForLearningPoints } from './moduleRecommendations';

const modules = [
  { number: 1, stage: 'trigger' },
  { number: 2, stage: 'discovery', teachesLearningPointIds: ['6e_x_P1', '6e_x_P2'] },
  { number: 3, stage: 'manipulation', teachesLearningPointIds: ['6e_x_P2'] },
  { number: 4, stage: 'practice_lab', teachesLearningPointIds: ['6e_x_P3'] },
  { number: 5, stage: 'evaluation' },
];

describe('recommendModulesForLearningPoints', () => {
  it('maps each weak learning point to the modules teaching it, in lesson order', () => {
    const recs = recommendModulesForLearningPoints(modules, ['6e_x_P2', '6e_x_P3']);

    expect(recs.map((r) => r.module.number)).toEqual([2, 3, 4]);
    expect(recs[0].learningPointIds).toEqual(['6e_x_P2']);
    expect(recs[2].learningPointIds).toEqual(['6e_x_P3']);
  });

  it('recommends nothing when every learning point is mastered', () => {
    expect(recommendModulesForLearningPoints(modules, [])).toEqual([]);
  });

  it('ignores modules that teach nothing (trigger, evaluation)', () => {
    const recs = recommendModulesForLearningPoints(modules, ['6e_x_P1', '6e_x_P2', '6e_x_P3']);
    expect(recs.map((r) => r.module.number)).toEqual([2, 3, 4]);
  });

  it('tolerates missing inputs', () => {
    expect(recommendModulesForLearningPoints(undefined, ['6e_x_P1'])).toEqual([]);
    expect(recommendModulesForLearningPoints(modules, undefined)).toEqual([]);
  });
});
