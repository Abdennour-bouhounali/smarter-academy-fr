import { describe, it, expect } from 'vitest';
import * as M from './measureMath.js';

/**
 * Le MOTEUR de mesure, éprouvé sans écran (§34).
 *
 * Si ces tests passent et que l'instrument ment, le défaut est dans
 * l'affichage. S'ils échouent, l'élève découvre une règle qui n'est pas
 * celle du monde — c'est la seule faute que ce laboratoire ne peut pas se
 * permettre.
 */

describe('cleanNumber', () => {
  it('efface la poussière des flottants sans changer la valeur', () => {
    expect(M.cleanNumber(0.1 + 0.2)).toBe(0.3);
    expect(M.cleanNumber(2.675 * 100)).toBe(267.5);
  });

  it('ne rend jamais -0 (une colonne n’affiche pas « −0 »)', () => {
    expect(Object.is(M.cleanNumber(-0), 0)).toBe(true);
  });

  it('laisse passer l’infini et NaN sans les maquiller', () => {
    expect(M.cleanNumber(Infinity)).toBe(Infinity);
    expect(Number.isNaN(M.cleanNumber(NaN))).toBe(true);
  });
});

describe('le rectangle', () => {
  it('mesure l’aire', () => {
    expect(M.rectangleArea(5, 3)).toBe(15);
    expect(M.rectangleArea(7, 3)).toBe(21);
    expect(M.rectangleArea(7, 5)).toBe(35);
  });

  it('mesure le périmètre', () => {
    expect(M.rectanglePerimeter(5, 3)).toBe(16);
    expect(M.rectanglePerimeter(6, 4)).toBe(20);
  });

  it('compte les carrés unités ligne par ligne — la structure du produit', () => {
    expect(M.rectangleUnitCount(4, 3)).toEqual({ perRow: 4, rows: 3, total: 12 });
  });

  it('refuse une dimension qui n’est pas un nombre', () => {
    expect(Number.isNaN(M.rectangleArea(NaN, 3))).toBe(true);
  });
});

describe('le triangle', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 6, y: 0 };

  it('mesure l’aire par les sommets — base × hauteur ÷ 2', () => {
    expect(M.triangleAreaFromVertices(a, b, { x: 2, y: 4 })).toBe(12);
  });

  it('donne la même aire quand le sommet glisse le long de la parallèle', () => {
    // C'est l'invariant de §9 : seule la HAUTEUR compte, pas où se trouve le sommet.
    const area = M.triangleAreaFromVertices(a, b, { x: 2, y: 4 });
    expect(M.triangleAreaFromVertices(a, b, { x: -3, y: 4 })).toBe(area);
    expect(M.triangleAreaFromVertices(a, b, { x: 11, y: 4 })).toBe(area);
  });

  it('mesure la hauteur relative à la base', () => {
    expect(M.heightToBase(a, b, { x: 2, y: 4 })).toBe(4);
  });

  it('place le pied de la hauteur, même HORS du segment', () => {
    const foot = M.footOfAltitude(a, b, { x: -3, y: 4 });
    expect(foot.x).toBe(-3);
    expect(foot.y).toBe(0);
    // t < 0 : le pied tombe avant A. L'instrument doit pouvoir le dessiner tel quel.
    expect(foot.t).toBeLessThan(0);
  });

  it('mesure les trois angles', () => {
    const angles = M.triangleAngles({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 });
    expect(angles[0]).toBeCloseTo(90, 6);
    expect(angles[1]).toBeCloseTo(36.8699, 3);
    expect(angles[2]).toBeCloseTo(53.1301, 3);
  });

  it('rend NaN pour un angle qui n’existe pas, jamais 0', () => {
    // Deux points confondus : il n'y a pas d'angle. Rendre 0 serait une mesure
    // inventée, et elle polluerait la somme des angles.
    expect(Number.isNaN(M.angleAt({ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 2 }))).toBe(true);
  });

  it('la somme des angles vaut 180° pour des triangles quelconques', () => {
    const triangles = [
      [{ x: 0, y: 0 }, { x: 7, y: 0 }, { x: 3, y: 4 }],
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: -4, y: 9 }],
      [{ x: -2, y: 1 }, { x: 6, y: 3 }, { x: 1, y: -5 }],
    ];
    for (const [p, q, r] of triangles) {
      const sum = M.triangleAngles(p, q, r).reduce((total, angle) => total + angle, 0);
      expect(sum).toBeCloseTo(180, 6);
    }
  });
});

describe('le cercle', () => {
  it('mesure la circonférence et l’aire', () => {
    expect(M.circleCircumference(2)).toBeCloseTo(12.566370, 5);
    expect(M.circleArea(3)).toBeCloseTo(28.274333, 5);
  });

  it('garde C ÷ d constant — c’est toute la découverte de π', () => {
    // `cleanNumber` garde douze chiffres significatifs : le quotient tombe
    // donc à ~1e-11 de π, ce qui est très au-delà de ce qu'un élève mesure.
    // C'est la CONSTANCE qui compte, et elle est là.
    const ratios = [1, 2.5, 4, 7.5].map((radius) => M.circleCircumference(radius) / (2 * radius));
    for (const ratio of ratios) expect(ratio).toBeCloseTo(Math.PI, 10);
    expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(1e-10);
  });

  it('refuse un rayon négatif', () => {
    expect(Number.isNaN(M.circleArea(-1))).toBe(true);
  });

  describe('le découpage en secteurs', () => {
    it('conserve l’aire exacte du disque quel que soit le nombre de secteurs', () => {
      for (const sectors of [4, 8, 16, 48]) {
        const r = M.sectorRearrangement(3, sectors);
        expect(r.exactArea).toBeCloseTo(M.circleArea(3), 9);
      }
    });

    it('approche le rectangle πr × r de mieux en mieux', () => {
      // C'est ce que l'élève DOIT voir : la hauteur monte vers r.
      const few = M.sectorRearrangement(4, 6);
      const many = M.sectorRearrangement(4, 48);
      expect(few.height).toBeLessThan(many.height);
      expect(many.height).toBeCloseTo(4, 1);
      expect(many.width).toBeCloseTo(Math.PI * 4, 9);
      // et l'aire du « rectangle » tend vers celle du disque, par en dessous.
      expect(many.rectangleArea).toBeLessThanOrEqual(many.exactArea + 1e-9);
      // Le « rectangle » reste toujours un peu SOUS le disque, et s'en
      // approche quand on découpe plus fin : c'est cela que l'élève voit.
      expect(many.exactArea - many.rectangleArea).toBeLessThan(few.exactArea - few.rectangleArea);
      expect(many.rectangleArea / many.exactArea).toBeGreaterThan(0.99);
    });
  });
});

describe('les volumes', () => {
  it('mesure le cube et le pavé', () => {
    expect(M.cubeVolume(3)).toBe(27);
    expect(M.cuboidVolume(4, 3, 2)).toBe(24);
  });

  it('compte les cubes par couche puis les couches', () => {
    expect(M.cuboidUnitCount(4, 3, 2)).toEqual({
      perRow: 4, rowsPerLayer: 3, perLayer: 12, layers: 2, total: 24,
    });
  });
});

describe('Pythagore', () => {
  it('trouve la relation sur les triangles rectangles connus', () => {
    const cases = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
    for (const [side1, side2, hypotenuse] of cases) {
      const s = M.squaresOnSides({ x: 0, y: side1 }, { x: 0, y: 0 }, { x: side2, y: 0 });
      expect(s.square1).toBeCloseTo(side1 * side1, 9);
      expect(s.square2).toBeCloseTo(side2 * side2, 9);
      expect(s.squareHypotenuse).toBeCloseTo(hypotenuse * hypotenuse, 9);
      expect(s.sum).toBeCloseTo(s.squareHypotenuse, 9);
      expect(s.rightAngle).toBeCloseTo(90, 9);
    }
  });

  it('ne tient PAS sur un triangle qui n’est pas rectangle', () => {
    // L'angle en B vaut ici ~68,2° : la relation doit FRANCHEMENT échouer,
    // sinon un élève la croirait universelle.
    const s = M.squaresOnSides({ x: 0, y: 5 }, { x: 0, y: 0 }, { x: 5, y: 2 });
    expect(s.rightAngle).toBeCloseTo(68.1986, 3);
    expect(Math.abs(s.sum - s.squareHypotenuse)).toBeGreaterThan(1);
    expect(M.isRightAngled({ x: 0, y: 5 }, { x: 0, y: 0 }, { x: 5, y: 2 })).toBe(false);
  });

  it('reconnaît l’angle droit à la tolérance d’une mesure', () => {
    expect(M.isRightAngled({ x: 0, y: 3 }, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
    expect(M.isRightAngled({ x: 1, y: 3 }, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(false);
  });
});

describe('les conversions', () => {
  it('convertit les longueurs', () => {
    expect(M.convert(1, 'm', 'cm', 1)).toBe(100);
    expect(M.convert(1, 'km', 'm', 1)).toBe(1000);
    expect(M.convert(250, 'cm', 'm', 1)).toBe(2.5);
  });

  it('élève le facteur au CARRÉ pour les aires', () => {
    expect(M.unitFactor('m', 'cm', 2)).toBe(10000);
    expect(M.convert(1, 'm', 'cm', 2)).toBe(10000);
    expect(M.convert(1, 'dm', 'cm', 2)).toBe(100);
  });

  it('élève le facteur au CUBE pour les volumes', () => {
    expect(M.unitFactor('m', 'cm', 3)).toBe(1000000);
    expect(M.convert(1, 'm', 'cm', 3)).toBe(1000000);
    expect(M.convert(1, 'dm', 'cm', 3)).toBe(1000);
  });

  it('refuse une unité ou une dimension inconnue', () => {
    expect(Number.isNaN(M.unitFactor('pouce', 'cm', 1))).toBe(true);
    expect(Number.isNaN(M.unitFactor('m', 'cm', 4))).toBe(true);
  });
});

describe('la mesure approchée (§27)', () => {
  it('lit à la graduation, sans jamais tirer au hasard', () => {
    expect(M.readWithPrecision(3.98123, 0.01)).toBe(3.98);
    expect(M.readWithPrecision(3.98123, 0.1)).toBe(4);
    // Déterministe : deux lectures du même segment donnent la même chose.
    expect(M.readWithPrecision(7.3333, 0.01)).toBe(M.readWithPrecision(7.3333, 0.01));
  });

  it('rend la valeur exacte quand il n’y a pas de graduation', () => {
    expect(M.readWithPrecision(Math.PI, 0)).toBeCloseTo(Math.PI, 11);
  });
});
