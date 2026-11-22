import { describe, it, expect } from 'vitest';
import * as S from '@smarter-academy/core/arithmetic/space.js';
import * as Q from '@smarter-academy/core/arithmetic/linear.js';
import { EX } from './exercises';

/** Les réponses de « أوظّف تعلّماتي » (ajouts de la plateforme) recalculées sur space.js. */
describe('misaha-hajm-kura — أوظّف تعلّماتي', () => {
  it('le ballon : D = 22 → 484π ≈ 1520,5 cm²', () => {
    expect(S.sphereArea(11).latex).toBe('484\\pi');
    expect(S.piRound(S.sphereArea(11).k, 1)).toBe('1520,5');
    expect(EX['ex-p1'].question.expected).toBe(1520.5);
  });
  it('la coupole : la moitié de 4π·36 = 72π m²', () => {
    expect(Q.eq(Q.div(S.sphereArea(6).k, 2), 72)).toBe(true);
  });
  it('le château d’eau : 125π/6 ≈ 65,4 m³', () => {
    expect(S.ballVolume('2,5').latex).toBe('\\frac{125}{6}\\pi');
    expect(S.piRound(S.ballVolume('2,5').k, 1)).toBe('65,4');
  });
  it('la bille : 4,5π ≈ 14,1 et 14,14', () => {
    expect(Q.eq(S.ballVolume('1,5').k, Q.parseNumber('4,5'))).toBe(true);
    expect(S.piRound(S.ballVolume('1,5').k, 1)).toBe('14,1');
    expect(S.piRound(S.ballVolume('1,5').k, 2)).toBe('14,14');
  });
  it('la balle de ping-pong : étui 16π, balle 32π/3 = 2/3 de l’étui, vide 16π/3', () => {
    const a = S.archimedes(2);
    expect(a.cylinderVolume.latex).toBe('16\\pi');
    expect(a.ballVolume.latex).toBe('\\frac{32}{3}\\pi');
    expect(Q.eq(a.volumeRatio, Q.frac(2, 3))).toBe(true);
    expect(Q.eq(Q.sub(a.cylinderVolume.k, a.ballVolume.k), Q.frac(16, 3))).toBe(true);
  });
});
