import { describe, it, expect } from 'vitest';
import { softGateHint, masteryStatusByIdFromProfile } from './softGate';
import { resolveModuleStatus } from './moduleGate';

const modules = [
  { number: 1, teachesLearningPointIds: ['P1'] },
  { number: 2, teachesLearningPointIds: ['P2', 'P3'] },
  { number: 3, teachesLearningPointIds: ['P3'], requiresLearningPointIds: ['P1', 'P2'] },
  { number: 4, stage: 'evaluation' },
];

describe('softGateHint — un conseil, jamais un verrou', () => {
  it('rien à dire sans exigence, sans profil, ou quand les points ne sont pas en lacune', () => {
    expect(softGateHint(modules[0], { P1: 'gap' }, modules).show).toBe(false);
    expect(softGateHint(modules[2], undefined, modules).show).toBe(false);
    expect(softGateHint(modules[2], {}, modules).show).toBe(false);
    expect(softGateHint(modules[2], { P1: 'reinforce', P2: 'unassessed' }, modules).show).toBe(false);
  });

  it('nomme les points en lacune et les modules qui les enseignent', () => {
    const hint = softGateHint(modules[2], { P1: 'gap', P2: 'mastered' }, modules);
    expect(hint.show).toBe(true);
    expect(hint.learningPointIds).toEqual(['P1']);
    expect(hint.recommendedModules.map((m) => m.number)).toEqual([1]);
  });

  it('ne se recommande jamais lui-même', () => {
    const self = { number: 5, teachesLearningPointIds: ['P9'], requiresLearningPointIds: ['P9'] };
    const hint = softGateHint(self, { P9: 'gap' }, [...modules, self]);
    expect(hint.show).toBe(true);
    expect(hint.recommendedModules).toEqual([]);
  });
});

describe('resolveModuleStatus ignore la porte de maîtrise (invariant non bloquant)', () => {
  it('un point en lacune ne verrouille jamais un module ouvert', () => {
    const status = resolveModuleStatus({
      sequentialUnlock: true,
      isModuleCompleted: (k) => k === '2',
      moduleNumber: 3,
      module: modules[2],
      masteryStatusById: { P1: 'gap', P2: 'gap' },
      firstModuleNumber: 1,
      previousStage: 'learning',
    });
    expect(status).not.toBe('locked');
  });
});

describe('masteryStatusByIdFromProfile', () => {
  it('aplatit currentMastery en code → statut', () => {
    const profile = { currentMastery: [{ grade: '4am', lessons: [{ lesson: 'x', learningPoints: [
      { code: 'P1', status: 'gap' }, { learningPointCode: 'P2', status: 'mastered' }, { code: 'P3' },
    ] }] }] };
    expect(masteryStatusByIdFromProfile(profile)).toEqual({ P1: 'gap', P2: 'mastered' });
    expect(masteryStatusByIdFromProfile(null)).toEqual({});
  });
});
