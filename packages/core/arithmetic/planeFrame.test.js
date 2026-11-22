import { describe, it, expect } from 'vitest';
import * as P from './planeFrame.js';

describe('planeFrame — points du plan en dixièmes', () => {
  it('l\'ordre compte : (3 ; −2) et (−2 ; 3) sont deux endroits', () => {
    const f = { x: 30, y: -20 };
    expect(P.swap(f)).toEqual({ x: -20, y: 30 });
    expect(P.same(f, P.swap(f))).toBe(false);
    expect(P.swap(P.swap(f))).toEqual(f);
    expect(P.swapIsSame({ x: 20, y: 20 })).toBe(true);
    expect(P.swapIsSame(f)).toBe(false);
    expect(P.swap({ x: 40, y: 0 })).toEqual({ x: 0, y: 40 }); // (4 ; 0) → (0 ; 4)
  });
  it('les axes : ordonnée nulle sur l\'axe des abscisses, abscisse nulle sur l\'axe des ordonnées', () => {
    expect(P.onAxis({ x: 40, y: 0 })).toBe('x');
    expect(P.onAxis({ x: 0, y: -30 })).toBe('y');
    expect(P.onAxis({ x: 0, y: 0 })).toBe('origin');
    expect(P.onAxis({ x: 10, y: 10 })).toBeNull();
  });
  it('les symétriques par rapport aux axes et à l\'origine ; jamais −0', () => {
    const a = { x: -20, y: -10 };
    expect(P.reflectX(a)).toEqual({ x: -20, y: 10 });
    expect(P.reflectY(a)).toEqual({ x: 20, y: -10 });
    expect(P.reflectO(a)).toEqual({ x: 20, y: 10 });
    expect(Object.is(P.reflectX({ x: 30, y: 0 }).y, 0)).toBe(true);
    expect(Object.is(P.reflectY({ x: 0, y: 30 }).x, 0)).toBe(true);
    expect(P.reflectX(P.reflectX(a))).toEqual(a);
  });
  it('le quart de plan : mêmes signes ; un point d\'un axe n\'en a pas', () => {
    expect(P.quadrant({ x: 60, y: 20 })).toBe(1);
    expect(P.quadrant({ x: -30, y: 20 })).toBe(2);
    expect(P.quadrant({ x: -30, y: -20 })).toBe(3);
    expect(P.quadrant({ x: 30, y: -20 })).toBe(4);
    expect(P.quadrant({ x: 30, y: 0 })).toBeNull();
    expect(P.sameQuadrant({ x: 60, y: 20 }, { x: 30, y: 20 })).toBe(true);
    expect(P.sameQuadrant({ x: 60, y: 20 }, { x: 30, y: -20 })).toBe(false);
    expect(P.sameQuadrant({ x: 30, y: 0 }, { x: 30, y: 0 })).toBe(false);
  });
  it('lectures : coordonnées exactes, même abscisse / même ordonnée, cadre', () => {
    expect(P.matching({ x: 30, y: -20 }, { x: 30, y: 20 })).toBe(1);
    expect(P.matching({ x: 30, y: -20 }, { x: -20, y: 30 })).toBe(0);
    expect(P.matching({ x: 30, y: -20 }, { x: 30, y: -20 })).toBe(2);
    expect(P.sameAbscissa({ x: -10, y: 40 }, { x: -10, y: -10 })).toBe(true);
    expect(P.sameOrdinate({ x: -10, y: 40 }, { x: 50, y: 40 })).toBe(true);
    expect(P.inBox({ x: -40, y: 10 }, 50, 40)).toBe(true);
    expect(P.inBox({ x: -60, y: 10 }, 50, 40)).toBe(false);
  });
  it('le tick qui précède : −1,5 est entre −2 et −1 ; 2,5 entre 2 et 3', () => {
    expect(P.floorTick(-15)).toBe(-20);
    expect(P.floorTick(25)).toBe(20);
    expect(P.floorTick(-30)).toBe(-30);
    expect(P.floorTick(5)).toBe(0);
    expect(P.floorTick(-5)).toBe(-10);
  });
  it('l\'écriture : (−3 ; 2), (1,5 ; −3) et KaTeX', () => {
    expect(P.pair({ x: -30, y: 20 })).toBe('(−3 ; 2)');
    expect(P.pair({ x: 15, y: -30 })).toBe('(1,5 ; −3)');
    expect(P.pairTex({ x: -25, y: 15 })).toBe('(-2{,}5\\,;\\,1{,}5)');
  });
  it('la cible à couronnes carrées : couronne = max(|x|, |y|)', () => {
    const rings = [[10, 10], [20, 5], [30, 1]];
    expect(P.ring({ x: 10, y: -20 })).toBe(20);
    expect(P.score({ x: 0, y: 10 }, rings)).toBe(10);
    expect(P.score({ x: -10, y: 20 }, rings)).toBe(5);
    expect(P.score({ x: -30, y: 0 }, rings)).toBe(1);
    expect(P.score({ x: 40, y: 10 }, rings)).toBe(0);
  });
  it('le repère caché : l\'origine se déduit d\'un point connu', () => {
    // B est sur la case (colonne 2, ligne 7) et a pour coordonnées (−2 ; −3) → l'origine est à (colonne 4, ligne 4)
    const o = P.originFrom({ col: 2, row: 7 }, { x: -2, y: -3 });
    expect(o).toEqual({ col: 4, row: 4 });
    expect(P.coordsOfCell({ col: 2, row: 7 }, o)).toEqual({ x: -2, y: -3 });
    expect(P.coordsOfCell({ col: 4, row: 4 }, o)).toEqual({ x: 0, y: 0 });
    expect(P.coordsOfCell({ col: 6, row: 1 }, o)).toEqual({ x: 2, y: 3 });
  });
});
