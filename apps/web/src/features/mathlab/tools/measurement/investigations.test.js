import { describe, it, expect } from 'vitest';
import {
  INVESTIGATIONS, INVESTIGATION_IDS, getInvestigation, initialParams, measureAll,
  matchesSolution, tableColumns, ruleVariablesFor, triangleVertices, STAGES,
} from './investigations.js';
import { evaluateRule, isComplete, testRule } from './ruleEngine.js';
import * as M from './measureMath.js';

describe('le catalogue', () => {
  it('contient les dix enquêtes du cahier', () => {
    expect(INVESTIGATIONS).toHaveLength(10);
    expect(INVESTIGATION_IDS).toEqual([
      'rectangle-area', 'rectangle-perimeter', 'triangle-area',
      'circle-circumference', 'circle-area', 'cube-volume', 'cuboid-volume',
      'unit-conversion', 'pythagoras', 'triangle-angle-sum',
    ]);
  });

  it('donne à chaque enquête une scène connue et une cible mesurée', () => {
    for (const investigation of INVESTIGATIONS) {
      expect(STAGES).toContain(investigation.stage);
      const keys = investigation.quantities.map((q) => q.key);
      expect(keys).toContain(investigation.target);
      expect(new Set(keys).size).toBe(keys.length);
      expect(investigation.hintCount).toBeGreaterThanOrEqual(3);
    }
  });

  it('n’a pas d’identifiant en double', () => {
    expect(new Set(INVESTIGATION_IDS).size).toBe(INVESTIGATIONS.length);
  });
});

describe('la MESURE de chaque enquête', () => {
  it('mesure toutes les grandeurs sur l’objet d’ouverture', () => {
    for (const investigation of INVESTIGATIONS) {
      const values = measureAll(investigation, initialParams(investigation), 0);
      for (const quantity of investigation.quantities) {
        expect(Number.isFinite(values[quantity.key])).toBe(true);
      }
    }
  });

  it('la solution de chaque enquête PRÉDIT exactement la mesure', () => {
    // C'est le test qui compte : si la relation cherchée ne reproduit pas ce
    // que l'instrument mesure, l'élève découvrirait une règle fausse.
    for (const investigation of INVESTIGATIONS) {
      const params = initialParams(investigation);
      const values = measureAll(investigation, params, 0);
      const predicted = evaluateRule(investigation.solution, values);
      expect(isComplete(investigation.solution)).toBe(true);
      expect(predicted).toBeCloseTo(values[investigation.target], 6);
    }
  });

  it('la solution tient sur TOUT le domaine réglable, pas seulement à l’ouverture', () => {
    for (const investigation of INVESTIGATIONS) {
      const rows = [];
      // Un balayage déterministe des dimensions de l'enquête.
      for (let step = 0; step < 6; step += 1) {
        const params = {};
        investigation.params.forEach((entry, index) => {
          const span = Math.max(1, Math.round((entry.max - entry.min) / entry.step));
          const position = (step * (index + 1) + index) % (span + 1);
          params[entry.key] = M.clamp(entry.min + position * entry.step, entry.min, entry.max);
        });
        rows.push({ id: `s${step}`, values: measureAll(investigation, params, 0) });
      }
      const result = testRule(investigation.solution, rows, investigation.target);
      expect(result.verdict, `${investigation.id} : ${JSON.stringify(result.counterexample)}`).toBe('holds');
    }
  });

  it('les écritures ALTERNATIVES sont reconnues comme la même règle', () => {
    for (const investigation of INVESTIGATIONS) {
      for (const alternate of investigation.alternateSolutions ?? []) {
        expect(matchesSolution(investigation, alternate), investigation.id).toBe(true);
      }
    }
  });

  it('une règle FAUSSE n’est jamais acceptée', () => {
    const rectangle = getInvestigation('rectangle-area');
    const wrong = { kind: 'op', op: '+', left: { kind: 'var', name: 'length' }, right: { kind: 'var', name: 'width' } };
    expect(matchesSolution(rectangle, wrong)).toBe(false);
  });
});

describe('le SECRET de chaque enquête (§23)', () => {
  it('ne nomme aucune formule dans les libellés visibles', () => {
    // Ce que l'interface affiche d'une enquête, c'est son `id` et ses
    // symboles. Aucun d'eux ne doit porter la relation cherchée.
    for (const investigation of INVESTIGATIONS) {
      const visible = [investigation.id, investigation.concept, ...investigation.quantities.map((q) => q.symbol)].join(' ');
      expect(visible).not.toMatch(/×\s*\w+\s*×/);
      expect(visible).not.toMatch(/=/);
    }
  });

  it('garde la solution HORS des colonnes du tableau', () => {
    // Le tableau montre des MESURES, jamais la relation.
    for (const investigation of INVESTIGATIONS) {
      const columns = tableColumns(investigation);
      for (const column of columns) {
        expect(column).not.toHaveProperty('solution');
      }
    }
  });

  it('propose comme variables tout SAUF la grandeur cherchée', () => {
    for (const investigation of INVESTIGATIONS) {
      const variables = ruleVariablesFor(investigation).map((v) => v.key);
      expect(variables).not.toContain(investigation.target);
      expect(variables.length).toBeGreaterThan(0);
    }
  });
});

describe('les enquêtes, une à une', () => {
  it('§5 l’aire du rectangle : le tableau du cahier', () => {
    const investigation = getInvestigation('rectangle-area');
    const rows = [[3, 2, 6], [4, 2, 8], [4, 3, 12], [5, 3, 15]];
    for (const [length, width, area] of rows) {
      expect(measureAll(investigation, { length, width }, 0).area).toBe(area);
    }
  });

  it('§8 le périmètre : L + l + L + l vaut 2 × (L + l)', () => {
    const investigation = getInvestigation('rectangle-perimeter');
    expect(measureAll(investigation, { length: 6, width: 4 }, 0).perimeter).toBe(20);
  });

  it('§9 l’aire du triangle : la moitié du rectangle', () => {
    const investigation = getInvestigation('triangle-area');
    const values = measureAll(investigation, { base: 6, height: 4, apex: 2 }, 0);
    expect(values.area).toBe(12);
    // Et l'aire ne change pas quand le sommet glisse (l'invariant de §9).
    expect(measureAll(investigation, { base: 6, height: 4, apex: -5 }, 0).area).toBe(12);
  });

  it('§10 la circonférence : C ÷ d reste π', () => {
    const investigation = getInvestigation('circle-circumference');
    for (const radius of [1, 2, 3.5, 8]) {
      expect(measureAll(investigation, { radius }, 0).ratio).toBeCloseTo(Math.PI, 6);
    }
  });

  it('§11 l’aire du disque : A ÷ r² reste π', () => {
    const investigation = getInvestigation('circle-area');
    for (const radius of [1, 2, 4.5]) {
      expect(measureAll(investigation, { radius, sectors: 8 }, 0).ratio).toBeCloseTo(Math.PI, 6);
    }
  });

  it('§12 le volume du cube : la couche puis les couches', () => {
    const investigation = getInvestigation('cube-volume');
    const values = measureAll(investigation, { edge: 4 }, 0);
    expect(values.perLayer).toBe(16);
    expect(values.layers).toBe(4);
    expect(values.volume).toBe(64);
  });

  it('§13 le volume du pavé : une couche × le nombre de couches', () => {
    const investigation = getInvestigation('cuboid-volume');
    const values = measureAll(investigation, { length: 5, width: 3, height: 4 }, 0);
    expect(values.perLayer).toBe(15);
    expect(values.volume).toBe(60);
  });

  it('§14 les conversions : l’aire met le facteur des longueurs au CARRÉ', () => {
    const investigation = getInvestigation('unit-conversion');
    // 1 dm² = 10² cm² ; 1 m² = 100² cm² ; 1 m² = 1000² mm².
    expect(measureAll(investigation, { scale: 1 }, 0)).toMatchObject({ lengthFactor: 10, factor: 100 });
    expect(measureAll(investigation, { scale: 2 }, 0)).toMatchObject({ lengthFactor: 100, factor: 10000 });
    expect(measureAll(investigation, { scale: 3 }, 0)).toMatchObject({ lengthFactor: 1000, factor: 1000000 });
    // et le lien avec le moteur de conversion est le MÊME nombre.
    expect(M.unitFactor('m', 'cm', 2)).toBe(10000);
    expect(M.unitFactor('m', 'cm', 3)).toBe(1000000);
  });

  it('§15 Pythagore : a² + b² = c² sur les triplets connus', () => {
    const investigation = getInvestigation('pythagoras');
    for (const [side1, side2, hypotenuse] of [[3, 4, 5], [5, 12, 13], [8, 15, 17]]) {
      const values = measureAll(investigation, { side1, side2 }, 0);
      expect(values.square1 + values.square2).toBeCloseTo(values.squareHyp, 9);
      expect(values.hypotenuse).toBeCloseTo(hypotenuse, 9);
    }
  });

  it('§16 la somme des angles : 180°, quel que soit le triangle', () => {
    const investigation = getInvestigation('triangle-angle-sum');
    const configurations = [
      { base: 7, height: 4, apex: 3 },
      { base: 4, height: 8, apex: -5 },
      { base: 12, height: 1, apex: 11 },
      { base: 5, height: 5, apex: 0 },
    ];
    for (const params of configurations) {
      expect(measureAll(investigation, params, 0).sum).toBeCloseTo(180, 6);
    }
  });

  it('les sommets du triangle suivent bien base, hauteur et sommet', () => {
    expect(triangleVertices({ base: 6, height: 4, apex: 2 })).toEqual([
      { x: 0, y: 0 }, { x: 6, y: 0 }, { x: 2, y: 4 },
    ]);
  });
});
