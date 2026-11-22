import { describe, it, expect } from 'vitest';
import { resolveModuleUnlock, resolveModuleStatus } from './moduleGate';

const nothingDone = () => false;

describe('resolveModuleUnlock — la porte d’un module', () => {
  it('l’élève reste sous le verrou séquentiel', () => {
    expect(resolveModuleUnlock({ sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 1, firstModuleNumber: 1 })).toBe(true);
    expect(resolveModuleUnlock({ sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 2, firstModuleNumber: 1 })).toBe(false);
    expect(resolveModuleUnlock({ sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 5, firstModuleNumber: 1 })).toBe(false);
  });

  it('la navigation libre (enseignant) ouvre n’importe quel module, sans toucher au verrou', () => {
    expect(resolveModuleUnlock({ freeNavigation: true, sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 2, firstModuleNumber: 1 })).toBe(true);
    expect(resolveModuleUnlock({ freeNavigation: true, sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 9, firstModuleNumber: 1 })).toBe(true);
  });

  it('présenter et « déjà fait » ouvrent aussi ; sans verrou séquentiel tout est ouvert', () => {
    expect(resolveModuleUnlock({ presenting: true, sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 3 })).toBe(true);
    expect(resolveModuleUnlock({ alreadyDone: true, sequentialUnlock: true, isModuleCompleted: nothingDone, moduleNumber: 3 })).toBe(true);
    expect(resolveModuleUnlock({ sequentialUnlock: false, isModuleCompleted: nothingDone, moduleNumber: 3 })).toBe(true);
  });
});

describe('resolveModuleStatus — la carte du sommaire', () => {
  const base = { sequentialUnlock: true, isModuleCompleted: nothingDone, currentModule: null, module: { number: 3, stage: 'learning' }, firstModuleNumber: 1, previousStage: 'learning' };

  it('un module retiré est verrouillé pour tout le monde', () => {
    expect(resolveModuleStatus({ ...base, closed: true, moduleNumber: 1, freeNavigation: true })).toBe('locked');
  });

  it('l’élève voit le module 3 verrouillé, l’enseignant le voit ouvert', () => {
    expect(resolveModuleStatus({ ...base, moduleNumber: 3 })).toBe('locked');
    expect(resolveModuleStatus({ ...base, moduleNumber: 3, freeNavigation: true })).toBe('unlocked');
    expect(resolveModuleStatus({ ...base, moduleNumber: 3, freeNavigation: true, isDone: true })).toBe('mastered');
  });

  it('sans verrou séquentiel, fait = maîtrisé, sinon ouvert', () => {
    expect(resolveModuleStatus({ ...base, sequentialUnlock: false, moduleNumber: 3, isDone: true })).toBe('mastered');
    expect(resolveModuleStatus({ ...base, sequentialUnlock: false, moduleNumber: 3 })).toBe('unlocked');
  });
});
