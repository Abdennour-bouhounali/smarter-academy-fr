/**
 * Les tests du MOTEUR de transformations (§57).
 *
 * Ils portent sur la mathématique seule : aucune ligne de React, aucun DOM.
 * C'est ce qui permet de les lire comme un énoncé — « une rotation de 90°
 * envoie (1,0) sur (0,1) » — et c'est ce qui les rend dignes de confiance
 * quand l'instrument, lui, change d'interface.
 */

import { describe, it, expect } from 'vitest';
import * as M from './transformMath.js';

const at = (x, y) => ({ x, y });
/** Deux points sont « les mêmes » à 1e−12 près : on teste l'exactitude, pas l'à-peu-près. */
const expectPoint = (actual, expected) => {
  expect(actual.x).toBeCloseTo(expected.x, 12);
  expect(actual.y).toBeCloseTo(expected.y, 12);
};

describe('الانسحاب — translation', () => {
  it('ajoute les composantes du شعاع', () => {
    const t = M.translation(3, -2);
    expectPoint(M.applyMatrix(t, at(2, 5)), at(5, 3));
    expectPoint(M.applyMatrix(t, at(-1, 0)), at(2, -2));
  });

  it('la translation nulle est l’identité', () => {
    expectPoint(M.applyMatrix(M.translation(0, 0), at(7, -4)), at(7, -4));
  });

  it('son inverse est la translation opposée', () => {
    const t = M.translation(4, 1);
    const inverse = M.invert(t);
    expectPoint(M.applyMatrix(inverse, at(0, 0)), at(-4, -1));
    // Composer les deux rend l'identité.
    expectPoint(M.applyMatrix(M.compose(inverse, t), at(3, 3)), at(3, 3));
  });

  it('refuse une composante non finie', () => {
    expect(M.translation(Number.NaN, 2)).toBeNull();
    expect(M.translation(1, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('الدوران — rotation', () => {
  it('90° autour de l’origine : (x,y) → (−y,x), EXACTEMENT', () => {
    const r = M.rotation(90);
    const image = M.applyMatrix(r, at(3, 1));
    // Pas de 1,8e−16 : l'élève lit des entiers, la table de §25 aussi.
    expect(image.x).toBe(-1);
    expect(image.y).toBe(3);
  });

  it('180° autour de l’origine : (x,y) → (−x,−y)', () => {
    const image = M.applyMatrix(M.rotation(180), at(2, -5));
    expect(image.x).toBe(-2);
    expect(image.y).toBe(5);
  });

  it('270° autour de l’origine : (x,y) → (y,−x)', () => {
    const image = M.applyMatrix(M.rotation(270), at(2, 7));
    expect(image.x).toBe(7);
    expect(image.y).toBe(-2);
  });

  it('360° et 0° ne bougent rien', () => {
    expectPoint(M.applyMatrix(M.rotation(360), at(5, -3)), at(5, -3));
    expectPoint(M.applyMatrix(M.rotation(0), at(5, -3)), at(5, -3));
  });

  it('un angle quelconque : 45° envoie (1,0) sur (√2/2, √2/2)', () => {
    const image = M.applyMatrix(M.rotation(45), at(1, 0));
    expectPoint(image, at(Math.SQRT1_2, Math.SQRT1_2));
  });

  it('autour d’un centre quelconque : le centre est FIXE', () => {
    const center = at(2, -1);
    const r = M.rotation(137, center);
    expectPoint(M.applyMatrix(r, center), center);
  });

  it('90° autour de (1,1) : (2,1) → (1,2)', () => {
    const image = M.applyMatrix(M.rotation(90, at(1, 1)), at(2, 1));
    expectPoint(image, at(1, 2));
  });

  it('conserve la distance au centre — le fait de §13', () => {
    const center = at(-2, 3);
    const point = at(4, 1);
    const image = M.applyMatrix(M.rotation(63.4, center), point);
    expect(M.distance(center, image)).toBeCloseTo(M.distance(center, point), 12);
  });

  it('un angle négatif tourne dans l’autre sens', () => {
    expectPoint(M.applyMatrix(M.rotation(-90), at(1, 0)), at(0, -1));
  });

  it('son inverse est la rotation d’angle opposé', () => {
    const center = at(1, 2);
    const composed = M.compose(M.rotation(-50, center), M.rotation(50, center));
    expectPoint(M.applyMatrix(composed, at(7, -3)), at(7, -3));
  });

  it('deux rotations de même centre s’ajoutent', () => {
    const composed = M.compose(M.rotation(50), M.rotation(40));
    expectPoint(M.applyMatrix(composed, at(1, 0)), M.applyMatrix(M.rotation(90), at(1, 0)));
  });
});

describe('التناظر المحوري — réflexion', () => {
  it('axe des abscisses : (x,y) → (x,−y)', () => {
    const image = M.applyMatrix(M.reflection(M.horizontalLine(0)), at(3, 4));
    expect(image.x).toBe(3);
    expect(image.y).toBe(-4);
  });

  it('axe des ordonnées : (x,y) → (−x,y)', () => {
    const image = M.applyMatrix(M.reflection(M.verticalLine(0)), at(3, 4));
    expect(image.x).toBe(-3);
    expect(image.y).toBe(4);
  });

  it('la droite y = x échange les coordonnées', () => {
    const image = M.applyMatrix(M.reflection(M.lineFromSlope(1, 0)), at(3, 4));
    expectPoint(image, at(4, 3));
  });

  it('la droite y = −x : (x,y) → (−y,−x)', () => {
    const image = M.applyMatrix(M.reflection(M.lineFromSlope(-1, 0)), at(3, 4));
    expectPoint(image, at(-4, -3));
  });

  it('une horizontale quelconque y = 2 : (3,5) → (3,−1)', () => {
    expectPoint(M.applyMatrix(M.reflection(M.horizontalLine(2)), at(3, 5)), at(3, -1));
  });

  it('une verticale quelconque x = −1 : (3,5) → (−5,5)', () => {
    expectPoint(M.applyMatrix(M.reflection(M.verticalLine(-1)), at(3, 5)), at(-5, 5));
  });

  it('une droite quelconque y = 2x + 1 : le milieu de [AA′] est SUR la droite', () => {
    const line = M.lineFromSlope(2, 1);
    const point = at(4, -3);
    const image = M.applyMatrix(M.reflection(line), point);
    const middle = M.midpoint(point, image);
    // Le milieu appartient à la droite : son projeté est lui-même.
    expectPoint(M.projectOnLine(middle, line), middle);
  });

  it('la droite est la MÉDIATRICE de [AA′] — perpendicularité (§15)', () => {
    const line = M.lineFromPoints(at(-2, 1), at(3, 4));
    const point = at(0, 6);
    const image = M.applyMatrix(M.reflection(line), point);
    const direction = { x: image.x - point.x, y: image.y - point.y };
    // [AA′] est perpendiculaire à la droite : produit scalaire nul.
    expect(direction.x * line.dx + direction.y * line.dy).toBeCloseTo(0, 10);
  });

  it('est involutive : réfléchir deux fois revient au point de départ', () => {
    const r = M.reflection(M.lineFromSlope(0.7, -2));
    expectPoint(M.applyMatrix(M.compose(r, r), at(5, 1)), at(5, 1));
  });

  it('retourne l’orientation : son déterminant vaut −1', () => {
    expect(M.determinant(M.reflection(M.lineFromSlope(3, 2)))).toBeCloseTo(-1, 12);
  });

  it('un point SUR l’axe est son propre image', () => {
    const line = M.lineFromSlope(1, 0);
    expectPoint(M.applyMatrix(M.reflection(line), at(4, 4)), at(4, 4));
  });

  it('une droite sans direction n’est pas une droite (§55)', () => {
    expect(M.lineFromPoints(at(2, 2), at(2, 2))).toBeNull();
    expect(M.reflection({ point: at(0, 0), dx: 0, dy: 0 })).toBeNull();
    expect(M.reflection(null)).toBeNull();
  });
});

describe('التحاكي — homothétie', () => {
  it('k = 2 autour de l’origine double les coordonnées', () => {
    expectPoint(M.applyMatrix(M.dilation(2), at(3, -1)), at(6, -2));
  });

  it('0 < k < 1 réduit', () => {
    expectPoint(M.applyMatrix(M.dilation(0.5), at(4, 6)), at(2, 3));
  });

  it('k = 1 est l’identité', () => {
    expectPoint(M.applyMatrix(M.dilation(1, at(3, 3)), at(-2, 7)), at(-2, 7));
  });

  it('k = −1 est la symétrie centrale', () => {
    expectPoint(M.applyMatrix(M.dilation(-1), at(3, -4)), at(-3, 4));
    expectPoint(M.applyMatrix(M.dilation(-1, at(1, 1)), at(3, 3)), at(-1, -1));
  });

  it('k < 0 retourne à travers le centre', () => {
    expectPoint(M.applyMatrix(M.dilation(-2, at(1, 0)), at(3, 2)), at(-3, -4));
  });

  it('le centre est FIXE', () => {
    const center = at(-3, 5);
    expectPoint(M.applyMatrix(M.dilation(4.2, center), center), center);
  });

  it('k = 0 écrase le plan sur le centre et n’est pas inversible (§55)', () => {
    const d = M.dilation(0, at(2, 2));
    expectPoint(M.applyMatrix(d, at(9, -9)), at(2, 2));
    expect(M.invert(d)).toBeNull();
  });

  it('son inverse est l’homothétie de rapport 1/k, même centre', () => {
    const center = at(1, -2);
    const composed = M.compose(M.dilation(1 / 3, center), M.dilation(3, center));
    expectPoint(M.applyMatrix(composed, at(5, 5)), at(5, 5));
  });

  it('multiplie les longueurs par |k| et les aires par k² (§18, §19)', () => {
    const triangle = [at(0, 0), at(2, 0), at(0, 3)];
    for (const k of [2, 0.5, -3]) {
      const d = M.dilation(k, at(1, 1));
      const image = triangle.map((v) => M.applyMatrix(d, v));
      expect(M.perimeter(image)).toBeCloseTo(Math.abs(k) * M.perimeter(triangle), 10);
      expect(M.area(image)).toBeCloseTo(k * k * M.area(triangle), 10);
    }
  });
});

describe('composition (§20, §23)', () => {
  const triangle = [at(0, 0), at(3, 0), at(0, 2)];

  it('compose(m2, m1) applique m1 PUIS m2', () => {
    const t = M.translation(1, 0);
    const r = M.rotation(90);
    // D'abord la translation : (0,0) → (1,0) ; puis la rotation : (1,0) → (0,1).
    expectPoint(M.applyMatrix(M.compose(r, t), at(0, 0)), at(0, 1));
  });

  it('composeAll suit l’ordre d’APPLICATION de la liste', () => {
    const matrices = [M.translation(1, 0), M.rotation(90)];
    expectPoint(M.applyMatrix(M.composeAll(matrices), at(0, 0)), at(0, 1));
  });

  it('composeAll d’une liste vide est l’identité', () => {
    expectPoint(M.applyMatrix(M.composeAll([]), at(4, 4)), at(4, 4));
  });

  it('l’ORDRE compte : انسحاب puis دوران ≠ دوران puis انسحاب (§23)', () => {
    const t = M.translation(3, 0);
    const r = M.rotation(90);
    const first = M.applyMatrix(M.composeAll([t, r]), at(0, 0));   // T puis R
    const second = M.applyMatrix(M.composeAll([r, t]), at(0, 0));  // R puis T
    expectPoint(first, at(0, 3));
    expectPoint(second, at(3, 0));
    expect(M.samePoint(first, second)).toBe(false);
  });

  it('deux translations, elles, COMMUTENT', () => {
    const u = M.translation(2, 1);
    const v = M.translation(-3, 4);
    expectPoint(M.applyMatrix(M.composeAll([u, v]), at(1, 1)), M.applyMatrix(M.composeAll([v, u]), at(1, 1)));
  });

  it('deux réflexions d’axes sécants font une rotation', () => {
    // Axes à 45° l'un de l'autre → rotation de 90° autour de leur point commun.
    const composed = M.compose(M.reflection(M.lineFromSlope(1, 0)), M.reflection(M.horizontalLine(0)));
    expectPoint(M.applyMatrix(composed, at(2, 0)), M.applyMatrix(M.rotation(90), at(2, 0)));
    expect(M.determinant(composed)).toBeCloseTo(1, 12);
  });

  it('deux réflexions d’axes parallèles font une translation', () => {
    const composed = M.compose(M.reflection(M.horizontalLine(3)), M.reflection(M.horizontalLine(0)));
    // Distance entre axes × 2 = 6.
    expectPoint(M.applyMatrix(composed, at(1, 1)), at(1, 7));
  });

  it('la composée entière conserve l’aire quand chaque pas la conserve', () => {
    const composed = M.composeAll([M.translation(2, -1), M.rotation(37, at(1, 1)), M.reflection(M.lineFromSlope(2, 0))]);
    const image = triangle.map((v) => M.applyMatrix(composed, v));
    expect(M.area(image)).toBeCloseTo(M.area(triangle), 10);
  });

  it('l’inverse d’une composée défait tout', () => {
    const composed = M.composeAll([M.translation(2, 5), M.rotation(73, at(-1, 2)), M.dilation(3, at(0, 1))]);
    const back = M.invert(composed);
    expectPoint(M.applyMatrix(M.compose(back, composed), at(6, -2)), at(6, -2));
  });
});

describe('géométrie mesurée (§29 – §32)', () => {
  const triangle = [at(0, 0), at(4, 0), at(0, 3)];

  it('distance', () => {
    expect(M.distance(at(0, 0), at(3, 4))).toBe(5);
    expect(M.distance(at(2, 2), at(2, 2))).toBe(0);
    expect(Number.isNaN(M.distance(at(0, 0), null))).toBe(true);
  });

  it('milieu', () => {
    expectPoint(M.midpoint(at(-2, 4), at(6, 0)), at(2, 2));
  });

  it('angle au sommet, en degrés', () => {
    expect(M.angleAt(at(1, 0), at(0, 0), at(0, 1))).toBeCloseTo(90, 10);
    expect(M.angleAt(at(4, 0), at(0, 0), at(0, 3))).toBeCloseTo(90, 10);
    expect(M.angleAt(at(1, 0), at(0, 0), at(-1, 0))).toBeCloseTo(180, 10);
  });

  it('un angle dont un côté est de longueur nulle n’est pas défini (§55)', () => {
    expect(Number.isNaN(M.angleAt(at(0, 0), at(0, 0), at(1, 1)))).toBe(true);
  });

  it('aire et périmètre d’un triangle 3-4-5', () => {
    expect(M.area(triangle)).toBe(6);
    expect(M.perimeter(triangle)).toBe(12);
  });

  it('l’aire ne dépend pas de l’ORDRE de parcours, l’orientation si', () => {
    const reversed = [...triangle].reverse();
    expect(M.area(reversed)).toBe(M.area(triangle));
    expect(M.orientation(reversed)).toBe(-M.orientation(triangle));
  });

  it('aire d’un carré unité, quel que soit l’endroit', () => {
    expect(M.area([at(3, 3), at(4, 3), at(4, 4), at(3, 4)])).toBeCloseTo(1, 12);
  });

  it('les angles intérieurs d’un triangle font 180°', () => {
    const sum = M.interiorAngles([at(0, 0), at(5, 1), at(2, 4)]).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(180, 10);
  });

  it('les angles intérieurs d’un quadrilatère font 360°', () => {
    const sum = M.interiorAngles([at(0, 0), at(4, 0), at(4, 3), at(0, 3)]).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(360, 10);
  });

  it('les longueurs des côtés sont dans l’ordre des sommets', () => {
    // AB = 4, BC = 5 (l'hypoténuse), CA = 3 — l'ordre des CÔTÉS, pas celui des longueurs.
    expect(M.sideLengths(triangle)).toEqual([4, 5, 3]);
  });

  it('un polygone aplati est DÉGÉNÉRÉ (§55)', () => {
    expect(M.isDegenerate([at(0, 0), at(1, 1), at(2, 2)])).toBe(true);
    expect(M.isDegenerate([at(0, 0), at(1, 1), at(1, 1)])).toBe(true);
    expect(M.isDegenerate(triangle)).toBe(false);
  });

  it('une aire dégénérée est nulle, jamais négative à l’affichage', () => {
    expect(M.area([at(0, 0), at(1, 1), at(2, 2)])).toBeCloseTo(0, 12);
  });
});

describe('constructions (§33)', () => {
  it('un polygone régulier a n sommets équidistants du centre', () => {
    const center = at(1, -1);
    const vertices = M.regularPolygon(center, 3, 6);
    expect(vertices).toHaveLength(6);
    for (const vertex of vertices) expect(M.distance(center, vertex)).toBeCloseTo(3, 10);
    // Tous ses côtés sont égaux.
    const sides = M.sideLengths(vertices);
    for (const side of sides) expect(side).toBeCloseTo(sides[0], 10);
  });

  it('moins de trois côtés n’est pas un polygone', () => {
    expect(M.regularPolygon(at(0, 0), 2, 2)).toEqual([]);
  });

  it('un rectangle a l’aire attendue et quatre angles droits', () => {
    const rectangle = M.rectangleVertices(at(1, 1), 4, 2);
    expect(M.area(rectangle)).toBeCloseTo(8, 12);
    for (const angle of M.interiorAngles(rectangle)) expect(angle).toBeCloseTo(90, 10);
  });
});

describe('accrochage et robustesse numérique (§34, §55)', () => {
  it('snapValue accroche au pas demandé', () => {
    expect(M.snapValue(2.4, 1)).toBe(2);
    expect(M.snapValue(2.6, 1)).toBe(3);
    expect(M.snapValue(2.4, 0.5)).toBe(2.5);
    expect(M.snapValue(-2.4, 1)).toBe(-2);
  });

  it('un pas nul ou absent n’accroche rien', () => {
    expect(M.snapValue(2.437, 0)).toBe(2.437);
    expect(M.snapValue(2.437, undefined)).toBe(2.437);
  });

  it('cleanNumber efface le bruit de virgule flottante', () => {
    expect(M.cleanNumber(0.1 + 0.2)).toBe(0.3);
    expect(M.cleanNumber(1e-15)).toBe(0);
    // Le zéro négatif est un zéro : l'élève ne doit jamais lire « −0 ».
    expect(Object.is(M.cleanNumber(-0), 0)).toBe(true);
  });

  it('une rotation de 90° d’un point entier rend des ENTIERS après nettoyage', () => {
    const image = M.cleanPoint(M.applyMatrix(M.rotation(90, at(2, 3)), at(5, 7)));
    expect(Number.isInteger(image.x)).toBe(true);
    expect(Number.isInteger(image.y)).toBe(true);
  });

  it('de très grandes coordonnées restent finies', () => {
    const image = M.applyMatrix(M.rotation(45), at(1e6, 1e6));
    expect(Number.isFinite(image.x)).toBe(true);
    expect(Number.isFinite(image.y)).toBe(true);
  });

  it('une rotation presque nulle ne bouge presque rien', () => {
    const image = M.applyMatrix(M.rotation(1e-9), at(1, 0));
    expect(M.distance(image, at(1, 0))).toBeLessThan(1e-8);
  });

  it('normalizeAngle ramène dans [0, 360)', () => {
    expect(M.normalizeAngle(-90)).toBe(270);
    expect(M.normalizeAngle(450)).toBe(90);
    expect(M.normalizeAngle(360)).toBe(0);
    expect(M.normalizeAngle(Number.NaN)).toBe(0);
  });

  it('applyMatrix refuse ce qui n’est pas un point ou une matrice', () => {
    expect(M.applyMatrix(null, at(1, 1))).toBeNull();
    expect(M.applyMatrix(M.IDENTITY, null)).toBeNull();
    expect(M.applyMatrix(M.IDENTITY, { x: Number.NaN, y: 1 })).toBeNull();
  });
});

describe('superposition des figures (§42)', () => {
  const triangle = [at(0, 0), at(3, 0), at(0, 2)];

  it('une figure coïncide avec elle-même', () => {
    expect(M.figuresCoincide(triangle, triangle)).toBe(true);
  });

  it('coïncide quel que soit le sommet de DÉPART', () => {
    expect(M.figuresCoincide(triangle, [at(3, 0), at(0, 2), at(0, 0)])).toBe(true);
  });

  it('coïncide même parcourue dans l’autre SENS — ce que fait une réflexion', () => {
    expect(M.figuresCoincide(triangle, [...triangle].reverse())).toBe(true);
  });

  it('ne coïncide pas avec une figure déplacée', () => {
    expect(M.figuresCoincide(triangle, triangle.map((v) => at(v.x + 0.5, v.y)))).toBe(false);
  });

  it('tolère l’imprécision d’un glissement, pas une vraie différence', () => {
    const nudged = triangle.map((v) => at(v.x + 1e-9, v.y));
    expect(M.figuresCoincide(triangle, nudged)).toBe(true);
    expect(M.figuresCoincide(triangle, triangle.map((v) => at(v.x + 0.01, v.y)))).toBe(false);
  });

  it('deux figures de tailles différentes ne coïncident pas', () => {
    expect(M.figuresCoincide(triangle, [at(0, 0), at(3, 0)])).toBe(false);
    expect(M.figuresCoincide([], [])).toBe(false);
  });
});
