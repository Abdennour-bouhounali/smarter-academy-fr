import { describe, it, expect } from 'vitest';
import { diagnosticAdviceLevel } from './diagnosticLevel';

describe('diagnosticAdviceLevel', () => {
  it('reproduit les anciens paliers sur 10 points', () => {
    expect([0, 4, 5, 7, 8, 10].map((s) => diagnosticAdviceLevel(s, 10)))
      .toEqual(['fragile', 'fragile', 'progres', 'progres', 'pret', 'pret']);
  });
  it('se rapporte au maximum réel (8 et 9 points dans l’unité 1)', () => {
    expect(diagnosticAdviceLevel(6, 8)).toBe('pret');    // 3 justes sur 4
    expect(diagnosticAdviceLevel(4, 8)).toBe('progres'); // 2 sur 4
    expect(diagnosticAdviceLevel(2, 8)).toBe('fragile');
    expect(diagnosticAdviceLevel(7, 9)).toBe('pret');
  });
  it('ne divise jamais par zéro', () => {
    expect(diagnosticAdviceLevel(0, 0)).toBe('fragile');
  });
});
