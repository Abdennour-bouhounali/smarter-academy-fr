import { describe, it, expect } from 'vitest';
import { labelDirection } from './LabKit.jsx';

describe('labelDirection — une notation ne se retourne pas sur une page arabe', () => {
  it('pose en LTR une étiquette sans lettre arabe', () => {
    expect(labelDirection('(3 + 4) × 5')).toBe('ltr');
    expect(labelDirection('84 ; 36')).toBe('ltr');
    expect(labelDirection('x + y = 10 ; x − y = 2')).toBe('ltr');
  });
  it('laisse le navigateur décider pour une étiquette arabe', () => {
    expect(labelDirection('سحب دون إرجاع')).toBe('auto');
    expect(labelDirection('القاعدة 68 – 95 – 99,7')).toBe('auto');
  });
});
