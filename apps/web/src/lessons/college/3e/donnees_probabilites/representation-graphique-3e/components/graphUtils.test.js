import { describe, it, expect } from 'vitest';
import { makeRng } from '@smarter-academy/core';
import { planeGeometry } from '../../../../../common/components/CoordPlane';
import {
  CELLS, scaleChoices, rangeFor, fitsIn, bestStep, isAssignmentValid,
  joinDecision, detectFault, pointError, describeError, relativeSpread,
} from './graphUtils';
import { BATTERIE } from './graphData';

describe('scaleChoices — un pas trop petit est écarté', () => {
  it('exclut le pas 1 pour des valeurs allant jusqu’à 2 000', () => {
    const steps = scaleChoices([120, 800, 2000]);
    expect(steps).not.toContain(1);
    expect(steps).not.toContain(10);
    expect(steps.every((s) => 2000 <= s * CELLS)).toBe(true);
  });

  it('garde les petits pas pour de petites valeurs', () => {
    expect(scaleChoices([2, 5, 6])).toContain(0.5);
    expect(scaleChoices([2, 5, 6])).toContain(1);
  });

  it('ne renvoie rien pour une série vide', () => {
    expect(scaleChoices([])).toEqual([]);
  });
});

describe('rangeFor et fitsIn', () => {
  it('un pas engendre un cadre de douze carreaux', () => {
    expect(rangeFor(50)).toEqual({ min: 0, max: 600 });
    expect(rangeFor(0.5)).toEqual({ min: 0, max: 6 });
  });

  it('sépare ce qui tient de ce qui sort', () => {
    const { inside, outside } = fitsIn(rangeFor(10), [20, 50, 130, 200]);
    expect(inside).toEqual([20, 50]);
    expect(outside).toEqual([130, 200]);
  });
});

describe('bestStep — le plus petit pas qui fait tout tenir', () => {
  it('choisit 200 pour un maximum de 2 000', () => {
    expect(bestStep([300, 1200, 2000])).toBe(200);
  });

  it('choisit un pas fin pour de petites valeurs', () => {
    expect(bestStep([1.5, 3, 5.5])).toBe(0.5);
  });

  it('le pas retenu ne laisse aucune valeur dehors', () => {
    for (const data of [[2, 9], [40, 90, 110], [0.5, 2.5, 6], [700, 1900]]) {
      const step = bestStep(data);
      expect(fitsIn(rangeFor(step), data).outside).toEqual([]);
    }
  });
});

describe('axes et tracé', () => {
  it('la grandeur dont l’autre dépend va en abscisse', () => {
    expect(isAssignmentValid({ x: 'temps', y: 'distance' }, { x: 'temps', y: 'distance' })).toBe(true);
    expect(isAssignmentValid({ x: 'distance', y: 'temps' }, { x: 'temps', y: 'distance' })).toBe(false);
  });

  it('on relie seulement quand la grandeur varie continûment', () => {
    expect(joinDecision('continu')).toBe(true);
    expect(joinDecision('discret')).toBe(false);
  });
});

describe('detectFault — les quatre défauts', () => {
  it('reconnaît chaque défaut, et le graphique correct', () => {
    expect(detectFault({ truncatedAxis: true })).toBe('tronque');
    expect(detectFault({ swapped: true })).toBe('inverse');
    expect(detectFault({ misplacedIndex: 2 })).toBe('mal-place');
    expect(detectFault({ stepTooLarge: true })).toBe('echelle');
    expect(detectFault({})).toBeNull();
  });
});

describe('pointError — le gap se dit, il ne se juge pas', () => {
  it('donne l’écart signé', () => {
    expect(pointError({ x: 2, y: 3 }, { x: 4, y: 1.5 })).toEqual({ dx: 2, dy: -1.5 });
  });

  it('décrit l’écart en mots', () => {
    expect(describeError({ x: 2, y: 3 }, { x: 4, y: 1.5 })).toBe('2 vers la droite et 1,5 vers le bas');
    expect(describeError({ x: 4, y: 1.5 }, { x: 4, y: 1.5 })).toBe('le point est au bon endroit');
  });
});

describe('relativeSpread — mesurer si un graphique paraîtra plat', () => {
  it('une série resserrée a une amplitude relative faible', () => {
    // 98 → 102 sur un axe partant de 0 : la variation est invisible.
    expect(relativeSpread([98, 100, 102])).toBeLessThan(0.05);
  });

  it('une série étalée a une amplitude relative forte', () => {
    expect(relativeSpread([10, 50, 100])).toBeGreaterThan(0.5);
  });
});

describe('propriétés', () => {
  it('tout pas proposé tient dans douze carreaux, et le meilleur ne laisse rien dehors', () => {
    const rng = makeRng(13);
    for (let i = 0; i < 150; i += 1) {
      const data = Array.from({ length: 3 + rng.int(4) }, () => rng.int(2000) + 1);
      for (const step of scaleChoices(data)) {
        expect(rangeFor(step).max / step).toBeCloseTo(CELLS, 9);
        expect(Math.max(...data)).toBeLessThanOrEqual(rangeFor(step).max + 1e-9);
      }
      const best = bestStep(data);
      if (best !== null) expect(fitsIn(rangeFor(best), data).outside).toEqual([]);
    }
  });

  it('la projection du repère est réversible sur tout le cadre construit', () => {
    // Le repère utilisé pour construire doit rendre exactement les coordonnées
    // qu'on y place — sinon un point « bien placé » serait relu faux.
    const g = planeGeometry({ xMin: 0, xMax: 12, yMin: 0, yMax: 600 }, 24);
    for (const p of [{ x: 0, y: 0 }, { x: 5, y: 250 }, { x: 12, y: 600 }]) {
      const s = g.toSvg(p.x, p.y);
      const back = g.toCoord(s.x, s.y);
      expect(back.x).toBeCloseTo(p.x, 9);
      expect(back.y).toBeCloseTo(p.y, 9);
    }
  });
});

describe('BATTERIE — le jeu de données du module 1 est une contrainte d’affichage', () => {
  it('tombe entièrement sur les graduations (x entier, y multiple de 20)', () => {
    for (const r of BATTERIE.rows) {
      expect(Number.isInteger(r.x)).toBe(true);
      expect(r.y % 20).toBe(0);
    }
  });
  it('baisse régulièrement et atteint 0 exactement une heure après le dernier relevé', () => {
    const d = BATTERIE.rows.slice(1).map((r, i) => r.y - BATTERIE.rows[i].y);
    expect(new Set(d).size).toBe(1);
    const last = BATTERIE.rows[BATTERIE.rows.length - 1];
    expect(last.y + d[0]).toBe(0);
  });
});
