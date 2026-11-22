import { describe, it, expect } from 'vitest';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import * as S from '@smarter-academy/core/arithmetic/space.js';
import * as Q from '@smarter-academy/core/arithmetic/linear.js';
import * as FIGS from './figures';
import { KNOW2_LINES, METHOD, METHOD_INVERSE } from './textbook';

/**
 * Les figures du درس sont valides et LISIBLES (guide §5 « Textbook figures » : aucun nom sur un nom, pas de bande), et les
 * nombres que la leçon écrit sont ceux de space.js (l'exemple du manuel R = 1,4 ; la méthode depuis le diamètre 8 ; l'inverse
 * depuis 100π).
 */
describe('misaha-hajm-kura — figures', () => {
  it.each(Object.entries(FIGS))('%s : valide, et spaceFigureQuality = []', (_, fig) => {
    expect(validateSpaceFigure(fig)).toEqual([]);
    expect(spaceFigureQuality(fig)).toEqual([]);
  });
  it('Archimède : la boule est tangente aux deux bases et au côté (R = rayon du cylindre, hauteur 2R)', () => {
    const f = FIGS.FIG_ARCHIMEDES;
    const [cyl, sph] = f.solids;
    expect(cyl.radius).toBe(sph.radius);
    expect(f.points[cyl.top][2] - f.points[cyl.base][2]).toBe(2 * sph.radius);
  });
});

describe('misaha-hajm-kura — les nombres écrits viennent de space.js', () => {
  it('معارف 2 : 7,84π ≈ 24,630086 cm² et 1372/375·π ≈ 11,494040 cm³', () => {
    expect(S.sphereArea('1,4').latex).toBe('\\frac{196}{25}\\pi');
    expect(S.piRound(S.sphereArea('1,4').k, 6)).toBe('24,630086');
    expect(S.ballVolume('1,4').latex).toBe('\\frac{1372}{375}\\pi');
    expect(S.piRound(S.ballVolume('1,4').k, 6)).toBe('11,494040');
    expect(KNOW2_LINES.areaExact).toContain('24{,}630086');
    expect(KNOW2_LINES.volumeExact).toContain('11{,}494040');
  });
  it('طرائق : diamètre 8 → 64π ≈ 201,1 et 256π/3 ≈ 268,1 ; aire 100π → R = 5 → 500π/3 ≈ 523,6', () => {
    const R = Q.div(METHOD.numbers.D, 2);
    expect(Q.eq(R, METHOD.numbers.R)).toBe(true);
    expect(S.sphereArea(R).latex).toBe('64\\pi');
    expect(S.piRound(S.sphereArea(R).k, 1)).toBe(METHOD.numbers.areaRounded);
    expect(S.ballVolume(R).latex).toBe('\\frac{256}{3}\\pi');
    expect(S.piRound(S.ballVolume(R).k, 1)).toBe(METHOD.numbers.volumeRounded);
    const r = S.radiusFromSphereArea(METHOD_INVERSE.numbers.k);
    expect(r).toMatchObject({ r: 1 });
    expect(Q.eq(r.q, METHOD_INVERSE.numbers.R)).toBe(true);
    expect(S.ballVolume(METHOD_INVERSE.numbers.R).latex).toBe('\\frac{500}{3}\\pi');
    expect(S.piRound(S.ballVolume(5).k, 1)).toBe(METHOD_INVERSE.numbers.volumeRounded);
  });
});
