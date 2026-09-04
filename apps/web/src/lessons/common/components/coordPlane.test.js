import { describe, it, expect } from 'vitest';
import { planeGeometry, snapCoord, formatCoords } from './CoordPlane.jsx';

const near = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const R = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

describe('planeGeometry', () => {
  it('place l’origine au centre d’un repère symétrique', () => {
    const g = planeGeometry(R, 30);
    const o = g.toSvg(0, 0);
    near(o.x, g.width / 2);
    near(o.y, g.height / 2);
  });

  it('toSvg et toCoord sont réciproques', () => {
    const g = planeGeometry(R, 30);
    for (const p of [{ x: 3, y: -2 }, { x: -4.5, y: 1.5 }, { x: 0, y: 5 }]) {
      const s = g.toSvg(p.x, p.y);
      const back = g.toCoord(s.x, s.y);
      near(back.x, p.x); near(back.y, p.y);
    }
  });

  it('le y de l’élève monte quand le y de l’écran descend', () => {
    const g = planeGeometry(R, 30);
    expect(g.toSvg(0, 3).y).toBeLessThan(g.toSvg(0, -3).y);
  });

  it('une unité vaut le même nombre de pixels sur les deux axes', () => {
    const g = planeGeometry({ xMin: -3, xMax: 7, yMin: -2, yMax: 4 }, 25);
    near(g.toSvg(1, 0).x - g.toSvg(0, 0).x, 25);
    near(g.toSvg(0, 0).y - g.toSvg(0, 1).y, 25);
  });
});

describe('snapCoord', () => {
  it('arrondit au pas de la grille', () => {
    expect(snapCoord({ x: 2.4, y: -1.6 }, R, 1)).toEqual({ x: 2, y: -2 });
    expect(snapCoord({ x: 2.3, y: -1.6 }, R, 0.5)).toEqual({ x: 2.5, y: -1.5 });
  });

  it('borne au cadre — un point ne peut pas sortir du repère', () => {
    expect(snapCoord({ x: 99, y: -99 }, R, 1)).toEqual({ x: 5, y: -5 });
    expect(snapCoord({ x: -12, y: 40 }, R, 1)).toEqual({ x: -5, y: 5 });
  });
});

describe('formatCoords', () => {
  it('écrit à la française, avec le moins typographique', () => {
    expect(formatCoords({ x: 3, y: -2 })).toBe('(3 ; −2)');
    expect(formatCoords({ x: 0, y: 0 })).toBe('(0 ; 0)');
    expect(formatCoords({ x: -1.5, y: 2.5 }, 1)).toBe('(−1,5 ; 2,5)');
  });

  it('n’utilise jamais le tiret ASCII', () => {
    expect(formatCoords({ x: -4, y: -7 })).not.toContain('-');
  });
});
