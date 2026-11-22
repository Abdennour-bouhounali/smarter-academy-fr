import { describe, it, expect } from 'vitest';
import { buildNextSteps } from './nextSteps';

const lp = (code) => ({ code, title: `نقطة ${code}` });
const modulePath = (n) => (n === 2 ? '/courses/x/m2' : null);

describe('buildNextSteps — « ما التالي؟ »', () => {
  it('traduit chaque type, dans l’ordre du serveur, au plus trois lignes', () => {
    const steps = buildNextSteps([
      { kind: 'reteach', learningPoint: lp('P1'), modules: [{ number: 2, title: 'المعارف' }] },
      { kind: 'practice', learningPoint: lp('P2'), modules: [] },
      { kind: 'assessment', learningPoint: lp('P3'), modules: [] },
      { kind: 'refresh', learningPoint: lp('P4'), modules: [] },
    ], { modulePath, practicePath: '/espace/pratique/x' });

    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatchObject({ labelKey: 'boss.nextReviewModule', params: { number: '02', title: 'المعارف' }, to: '/courses/x/m2' });
    expect(steps[1]).toMatchObject({ labelKey: 'boss.nextPractice', to: '/espace/pratique/x' });
    expect(steps[2]).toMatchObject({ labelKey: 'boss.nextAssessment', to: null });
  });

  it('ignore « start », sans lien quand le chemin n’est pas résolu', () => {
    const steps = buildNextSteps([
      { kind: 'start', learningPoint: lp('P1'), modules: [{ number: 1, title: 'أ' }] },
      { kind: 'prerequisite', learningPoint: lp('P2'), modules: [{ number: 5, title: 'ب' }] },
      { kind: 'prerequisite', learningPoint: lp('P3'), modules: [], prerequisites: [{ code: 'Q', title: 'سابق' }] },
    ], { modulePath });
    expect(steps.map((s) => s.labelKey)).toEqual(['boss.nextReviewModule', 'boss.nextReviewLearningPoint']);
    expect(steps[0].to).toBeNull();
    expect(steps[1].params.title).toBe('سابق');
  });

  it('ne répète pas le même module deux fois ; tolère une entrée vide', () => {
    const steps = buildNextSteps([
      { kind: 'reteach', learningPoint: lp('P1'), modules: [{ number: 2, title: 'م' }] },
      { kind: 'reteach', learningPoint: lp('P2'), modules: [{ number: 2, title: 'م' }] },
    ], { modulePath });
    expect(steps).toHaveLength(1);
    expect(buildNextSteps(null)).toEqual([]);
  });

  it('un prérequis faible renvoie à SA leçon, pas à un module de celle-ci', () => {
    const steps = buildNextSteps([
      { kind: 'prerequisite', learningPoint: lp('P2'), modules: [{ number: 2, title: 'م' }],
        prerequisites: [{ code: '4am_qasim-adad-tabii_P1', title: 'قاسم عدد', lessonCode: 'qasim-adad-tabii' }] },
    ], { modulePath, lessonPath: (code) => `/courses/l/${code}` });
    expect(steps).toEqual([expect.objectContaining({
      labelKey: 'boss.nextReviewLearningPoint', params: { title: 'قاسم عدد' }, to: '/courses/l/qasim-adad-tabii',
    })]);
  });
});
