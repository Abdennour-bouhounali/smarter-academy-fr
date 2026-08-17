import { describe, it, expect } from 'vitest';
import { getModuleMastery, isModuleUnlocked, getModuleStatus, lockedReason, MASTERY_UNLOCK_THRESHOLD } from './lessonAccess';

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

describe('lockedReason', () => {
  it('references the zero-padded previous module number and the threshold', () => {
    expect(lockedReason(3)).toBe(`Termine le module 02 à ${MASTERY_UNLOCK_THRESHOLD} % pour débloquer ce module.`);
  });
});
