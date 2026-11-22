import { describe, it, expect } from 'vitest';
import { masteryStatusByIdFromProfile } from './masteryStatus';

describe('masteryStatusByIdFromProfile', () => {
  it('aplatit currentMastery en code → statut', () => {
    const profile = { currentMastery: [{ grade: '3e', lessons: [{ lesson: 'x', learningPoints: [
      { code: 'P1', status: 'gap' }, { learningPointCode: 'P2', status: 'mastered' }, { code: 'P3' },
    ] }] }] };
    expect(masteryStatusByIdFromProfile(profile)).toEqual({ P1: 'gap', P2: 'mastered' });
    expect(masteryStatusByIdFromProfile(null)).toEqual({});
  });
});
