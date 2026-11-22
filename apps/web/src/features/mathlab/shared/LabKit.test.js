import { describe, it, expect } from 'vitest';
import { labelDirection } from './LabKit.jsx';

describe('labelDirection — une notation se distingue d’une phrase', () => {
  it('pose en LTR une étiquette de notation', () => {
    expect(labelDirection('(3 + 4) × 5')).toBe('ltr');
    expect(labelDirection('84 ; 36')).toBe('ltr');
    expect(labelDirection('x + y = 10 ; x − y = 2')).toBe('ltr');
    expect(labelDirection('sin(30°) ; cos(60°)')).toBe('ltr');
  });
  it('laisse le navigateur décider pour une étiquette en phrase', () => {
    expect(labelDirection('Tirage sans remise')).toBe('auto');
    expect(labelDirection('La règle 68 – 95 – 99,7')).toBe('auto');
  });
});
