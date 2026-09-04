import { describe, it, expect } from 'vitest';
import {
  formatNumber, formatCoords, readCoords,
  samePoint, swap, swapLandsElsewhere, displace, displacementBetween, describeDisplacement,
  isHorizontal, isVertical, axisDistance, axisOf, midpointCoords,
  reflectAcrossAxis, reflectAcrossOrigin, fourthVertex, isAxisAlignedRectangle,
  isoscelesByCoords, quadrantOf, describeQuadrant,
  PARC, lieuById, FIGURES,
} from './reperageUtils';

const P = (x, y) => ({ x, y });

describe('écriture française', () => {
  it('utilise le moins typographique, jamais le tiret ASCII', () => {
    expect(formatNumber(-3)).toBe('−3');
    expect(formatCoords(P(-2, 5))).toBe('(−2 ; 5)');
    expect(formatCoords(P(-2, 5))).not.toContain('-');
  });

  it('écrit les décimaux avec une virgule', () => {
    expect(formatNumber(-1.5, 1)).toBe('−1,5');
    expect(formatCoords(P(2.5, -0.5), 1)).toBe('(2,5 ; −0,5)');
  });

  it('lit un point en toutes lettres', () => {
    expect(readCoords(P(3, -2), 'M')).toBe('M a pour abscisse 3 et pour ordonnée −2');
  });
});

describe('l’ordre du couple', () => {
  it('échanger les coordonnées change de point, sauf sur la diagonale', () => {
    expect(swap(P(2, -3))).toEqual({ x: -3, y: 2 });
    expect(swapLandsElsewhere(P(2, -3))).toBe(true);
    expect(swapLandsElsewhere(P(4, 4))).toBe(false);
    expect(swapLandsElsewhere(P(0, 0))).toBe(false);
  });

  it('(2 ; −3) et (−3 ; 2) ne sont pas dans le même quadrant', () => {
    const p = P(2, -3);
    expect(quadrantOf(p)).toBe(4);
    expect(quadrantOf(swap(p))).toBe(2);
  });
});

describe('déplacements', () => {
  it('un déplacement ne touche que la coordonnée concernée', () => {
    expect(displace(P(1, 1), 3, 0)).toEqual({ x: 4, y: 1 });
    expect(displace(P(1, 1), 0, -2)).toEqual({ x: 1, y: -1 });
  });

  it('le déplacement entre deux points est la différence des coordonnées', () => {
    expect(displacementBetween(P(-2, 1), P(3, -1))).toEqual({ dx: 5, dy: -2 });
  });

  it('décrit le déplacement en français', () => {
    expect(describeDisplacement({ dx: 3, dy: -2 })).toBe('3 vers la droite et 2 vers le bas');
    expect(describeDisplacement({ dx: -4, dy: 0 })).toBe('4 vers la gauche');
    expect(describeDisplacement({ dx: 0, dy: 0 })).toBe('aucun déplacement');
  });
});

describe('longueurs lues sur les coordonnées', () => {
  it('mesure un segment horizontal par l’écart des abscisses', () => {
    expect(axisDistance(P(-3, 2), P(4, 2))).toBe(7);
    expect(axisOf(P(-3, 2), P(4, 2))).toBe('abscisses');
    expect(isHorizontal(P(-3, 2), P(4, 2))).toBe(true);
  });

  it('mesure un segment vertical par l’écart des ordonnées', () => {
    expect(axisDistance(P(1, -4), P(1, 3))).toBe(7);
    expect(axisOf(P(1, -4), P(1, 3))).toBe('ordonnées');
    expect(isVertical(P(1, -4), P(1, 3))).toBe(true);
  });

  it('REFUSE de mesurer un segment oblique — Pythagore n’est pas encore là', () => {
    expect(axisDistance(P(0, 0), P(3, 4))).toBeNull();
    expect(axisOf(P(0, 0), P(3, 4))).toBeNull();
    expect(axisDistance(P(2, 2), P(2, 2))).toBeNull(); // segment réduit à un point
  });

  it('le milieu est la moyenne des coordonnées, et il est équidistant', () => {
    const a = P(-3, 1); const b = P(5, 1);
    const m = midpointCoords(a, b);
    expect(m).toEqual({ x: 1, y: 1 });
    expect(axisDistance(a, m)).toBe(axisDistance(m, b));
  });
});

describe('configurations', () => {
  it('symétrise par rapport aux axes et à l’origine', () => {
    expect(reflectAcrossAxis(P(3, -2), 'x')).toEqual({ x: 3, y: 2 });
    expect(reflectAcrossAxis(P(3, -2), 'y')).toEqual({ x: -3, y: -2 });
    expect(reflectAcrossOrigin(P(3, -2))).toEqual({ x: -3, y: 2 });
    expect(() => reflectAcrossAxis(P(0, 0), 'z')).toThrow(/axe inconnu/);
  });

  it('complète un rectangle par le quatrième sommet', () => {
    const [A, B, C] = FIGURES.rectangle;
    const D = fourthVertex(A, B, C);
    expect(D).toEqual(FIGURES.rectangle[3]);
    expect(isAxisAlignedRectangle([A, B, C, D])).toBe(true);
  });

  it('refuse un faux rectangle et un rectangle aplati', () => {
    expect(isAxisAlignedRectangle([P(0, 0), P(4, 0), P(4, 3), P(1, 3)])).toBe(false);
    expect(isAxisAlignedRectangle([P(0, 0), P(4, 0), P(4, 0), P(0, 0)])).toBe(false);
    expect(isAxisAlignedRectangle([P(0, 0), P(4, 0), P(4, 3)])).toBe(false);
  });

  it('décide l’isocèle sur les longueurs, sans tolérance', () => {
    expect(isoscelesByCoords(FIGURES.triangle)).toEqual({ isocele: true, sommet: 2 });
    expect(isoscelesByCoords([P(0, 0), P(4, 0), P(1, 2)]).isocele).toBe(false);
    // Un triangle qui a l'AIR isocèle mais ne l'est pas.
    expect(isoscelesByCoords([P(0, 0), P(6, 0), P(3.1, 5)]).isocele).toBe(false);
  });

  it('nomme les quadrants par le signe des coordonnées', () => {
    expect(quadrantOf(P(2, 3))).toBe(1);
    expect(quadrantOf(P(-2, 3))).toBe(2);
    expect(quadrantOf(P(-2, -3))).toBe(3);
    expect(quadrantOf(P(2, -3))).toBe(4);
    expect(quadrantOf(P(0, 5))).toBe(0);
    expect(describeQuadrant(P(-2, 3))).toBe('abscisse négative, ordonnée positive');
    expect(describeQuadrant(P(0, 5))).toBe('sur un axe');
  });
});

describe('la scène du parc', () => {
  it('centre le repère sur la fontaine', () => {
    expect(lieuById('fontaine')).toMatchObject({ x: 0, y: 0 });
  });

  it('place tous les lieux dans le cadre', () => {
    const { xMin, xMax, yMin, yMax } = PARC.range;
    for (const l of PARC.lieux) {
      expect(l.x).toBeGreaterThanOrEqual(xMin);
      expect(l.x).toBeLessThanOrEqual(xMax);
      expect(l.y).toBeGreaterThanOrEqual(yMin);
      expect(l.y).toBeLessThanOrEqual(yMax);
    }
  });

  it('occupe les quatre quadrants — la leçon a besoin des quatre signes', () => {
    const quadrants = new Set(PARC.lieux.map((l) => quadrantOf(l)).filter((q) => q > 0));
    expect(quadrants).toEqual(new Set([1, 2, 3, 4]));
  });

  it('n’a aucun lieu sur la diagonale x = y — l’échange se voit toujours', () => {
    for (const l of PARC.lieux.filter((p) => p.id !== 'fontaine')) {
      expect(swapLandsElsewhere(l)).toBe(true);
    }
  });

  it('INVARIANT : le repère est carré, donc tout couple inversé reste visible', () => {
    const { xMin, xMax, yMin, yMax } = PARC.range;
    expect(xMin).toBe(yMin);
    expect(xMax).toBe(yMax);
    // Sans cela, le fantôme de (y ; x) sortirait du cadre pour certains points
    // et l'élève ne verrait rien au moment clé de la découverte.
    const outside = [];
    for (let x = xMin; x <= xMax; x += 1) {
      for (let y = yMin; y <= yMax; y += 1) {
        const s = swap(P(x, y));
        if (s.x < xMin || s.x > xMax || s.y < yMin || s.y > yMax) outside.push([x, y]);
      }
    }
    expect(outside).toEqual([]);
  });

  it('donne au moins un couple de lieux alignés horizontalement et verticalement', () => {
    const pairs = [];
    for (const a of PARC.lieux) for (const b of PARC.lieux) if (a !== b) pairs.push([a, b]);
    expect(pairs.some(([a, b]) => isHorizontal(a, b))).toBe(true);
    expect(pairs.some(([a, b]) => isVertical(a, b))).toBe(true);
  });
});
