import { describe, it, expect } from 'vitest';
import { getModuleMastery, isModuleUnlocked, isMasteryGateSatisfied, getModuleStatus, lockedReason, lockedReasonData, MASTERY_UNLOCK_THRESHOLD } from './lessonAccess';

describe('getModuleMastery', () => {
  it('returns 100 when the module is completed', () => {
    expect(getModuleMastery((key) => key === '3', 3)).toBe(100);
  });
  it('returns 0 when the module is not completed', () => {
    expect(getModuleMastery(() => false, 5)).toBe(0);
  });
});

describe('isModuleUnlocked', () => {
  it('module 1 is always unlocked', () => {
    expect(isModuleUnlocked(() => false, 1)).toBe(true);
  });
  it('module 2 is locked when module 1 is not completed', () => {
    expect(isModuleUnlocked(() => false, 2)).toBe(false);
  });
  it('module 2 is unlocked once module 1 is completed', () => {
    expect(isModuleUnlocked((key) => key === '1', 2)).toBe(true);
  });

  // RÉGRESSION (2026-09-18) — 137 leçons commencent par un module 0
  // (« أستعدّ »). Traité comme « pas le premier », il exigeait la maîtrise
  // d'un module -1 inexistant : la leçon entière restait verrouillée et
  // l'élève lisait « أتمِم المحور -1 ».
  it('module 0 is unlocked when the lesson starts at 0', () => {
    expect(isModuleUnlocked(() => false, 0, { firstModuleNumber: 0 })).toBe(true);
    expect(isModuleUnlocked(() => false, 0)).toBe(true);
  });
  it('keeps the sequence inside a lesson that starts at 0', () => {
    expect(isModuleUnlocked(() => false, 1, { firstModuleNumber: 0 })).toBe(false);
    expect(isModuleUnlocked((key) => key === '0', 1, { firstModuleNumber: 0 })).toBe(true);
  });
  it('never asks for a negative module', () => {
    expect(Number(lockedReasonData(0).previousModule)).toBeGreaterThanOrEqual(0);
  });
});

// RÉGRESSION (2026-09-19) — un module TERMINÉ s'affichait « مقفل » quand son
// prédécesseur ne l'était pas : l'élève lisait « أتمِم المحور 00 » sur un
// module qu'il venait de finir, et ne pouvait plus y revenir.
// RÉGRESSION (2026-09-19) — un diagnostic (`prerequisite_check`) barrait la
// leçon : le premier vrai module affichait « أتمِم المحور 00 » alors qu'un
// diagnostic est « client-side only, never persisted as evidence ».
describe('un diagnostic ne barre pas le module suivant', () => {
  it('ouvre le module qui suit un prerequisite_check non fait', () => {
    expect(isModuleUnlocked(() => false, 1, { firstModuleNumber: 0, previousStage: 'prerequisite_check' })).toBe(true);
  });
  it('garde le verrou quand le module précédent enseigne vraiment', () => {
    expect(isModuleUnlocked(() => false, 2, { firstModuleNumber: 0, previousStage: 'trigger' })).toBe(false);
  });
});

describe('un module terminé ne se referme jamais', () => {
  it('reste « mastered » même si le module précédent est incomplet', () => {
    const status = getModuleStatus({ isModuleCompleted: (k) => k === '1', moduleNumber: 1, firstModuleNumber: 0 });
    expect(status).toBe('mastered');
  });
  it('laisse le module suivant ouvert et le précédent inachevé verrouillé', () => {
    const done = (k) => k === '1';
    expect(getModuleStatus({ isModuleCompleted: done, moduleNumber: 2, firstModuleNumber: 0 })).not.toBe('locked');
    expect(getModuleStatus({ isModuleCompleted: done, moduleNumber: 3, firstModuleNumber: 0 })).toBe('locked');
  });
});

describe('getModuleStatus', () => {
  it('is locked when the previous module is incomplete', () => {
    const status = getModuleStatus({ isModuleCompleted: () => false, moduleNumber: 2, currentModule: 2 });
    expect(status).toBe('locked');
  });
  it('is mastered when the module itself is completed', () => {
    const status = getModuleStatus({ isModuleCompleted: (k) => k === '1', moduleNumber: 1, currentModule: 1 });
    expect(status).toBe('mastered');
  });
  it('is in_progress when unlocked, not mastered, and is the current module', () => {
    const status = getModuleStatus({ isModuleCompleted: (k) => k === '1', moduleNumber: 2, currentModule: 2 });
    expect(status).toBe('in_progress');
  });
  it('is unlocked when reachable but not the current module and not mastered', () => {
    const status = getModuleStatus({ isModuleCompleted: (k) => k === '1', moduleNumber: 2, currentModule: 5 });
    expect(status).toBe('unlocked');
  });
});

describe('evaluation stage is always accessible (the mastery-bypass path)', () => {
  it('unlocks an evaluation module even when nothing is completed', () => {
    expect(isModuleUnlocked(() => false, 7, { stage: 'evaluation' })).toBe(true);
  });

  it('getModuleStatus never reports an evaluation module as locked', () => {
    const status = getModuleStatus({
      isModuleCompleted: () => false,
      moduleNumber: 7,
      currentModule: 1,
      module: { stage: 'evaluation' },
    });
    expect(status).toBe('unlocked');
  });

  it('other stages keep the sequential rule', () => {
    expect(isModuleUnlocked(() => false, 3, { stage: 'discovery' })).toBe(false);
  });
});

describe('isMasteryGateSatisfied', () => {
  it('passes when the module declares no gate', () => {
    expect(isMasteryGateSatisfied(undefined, { a: 'gap' })).toBe(true);
    expect(isMasteryGateSatisfied([], { a: 'gap' })).toBe(true);
  });

  it('passes when no mastery data is available — a gate never strands the student', () => {
    expect(isMasteryGateSatisfied(['6e_x_P1'], undefined)).toBe(true);
    expect(isMasteryGateSatisfied(['6e_x_P1'], {})).toBe(true);
  });

  it('blocks only on a demonstrated gap', () => {
    expect(isMasteryGateSatisfied(['6e_x_P1'], { '6e_x_P1': 'gap' })).toBe(false);
    expect(isMasteryGateSatisfied(['6e_x_P1'], { '6e_x_P1': 'reinforce' })).toBe(true);
    expect(isMasteryGateSatisfied(['6e_x_P1'], { '6e_x_P1': 'mastered' })).toBe(true);
    expect(isMasteryGateSatisfied(['6e_x_P1'], { '6e_x_P1': 'unassessed' })).toBe(true);
  });

  it('locks the module through getModuleStatus when a gap is demonstrated', () => {
    const status = getModuleStatus({
      isModuleCompleted: (k) => k === '1',
      moduleNumber: 2,
      currentModule: 2,
      module: { stage: 'practice_lab', requiresLearningPointIds: ['6e_x_P1'] },
      masteryStatusById: { '6e_x_P1': 'gap' },
    });
    expect(status).toBe('locked');
  });
});

describe('lockedReasonData', () => {
  it('rend les DONNÉES du verrouillage, sans phrase — la langue appartient à l’UI', () => {
    expect(lockedReasonData(3)).toEqual({ previousModule: '02', threshold: MASTERY_UNLOCK_THRESHOLD });
    expect(lockedReasonData(1)).toEqual({ previousModule: '00', threshold: MASTERY_UNLOCK_THRESHOLD });
    expect(lockedReasonData(10)).toEqual({ previousModule: '09', threshold: MASTERY_UNLOCK_THRESHOLD });
  });

  it('ne contient aucun texte destiné à l’élève', () => {
    // La garde de la régression : une phrase française réapparue ici
    // ressortirait telle quelle sur un écran arabe.
    for (const v of Object.values(lockedReasonData(4))) {
      expect(typeof v === 'string' ? /^[0-9]+$/.test(v) : typeof v === 'number').toBe(true);
    }
  });
});

describe('lockedReason', () => {
  it('references the zero-padded previous module number and the threshold', () => {
    expect(lockedReason(3)).toBe(`Termine le module 02 à ${MASTERY_UNLOCK_THRESHOLD} % pour débloquer ce module.`);
  });
});
