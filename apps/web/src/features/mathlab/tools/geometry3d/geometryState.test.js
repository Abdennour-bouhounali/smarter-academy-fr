import { describe, it, expect } from 'vitest';
import {
  GEOMETRY3D_SCHEMA_VERSION, DIMENSION_MIN, DIMENSION_MAX, SHAPES, SHAPE_IDS, PARAM_SYMBOLS,
  clampDimension, isValidDimension, normalizeDimensions, dimensionsForShape, normalizeCamera,
  normalizeGeometry3DData, createGeometry3DData, sameCamera, getShape,
} from './geometryState.js';

describe('les solides', () => {
  it('sont les cinq de la V1, avec les paramètres attendus', () => {
    expect(SHAPE_IDS).toEqual(['cube', 'cuboid', 'sphere', 'cylinder', 'cone']);
    expect(getShape('cube').params).toEqual(['side']);
    expect(getShape('cuboid').params).toEqual(['length', 'width', 'height']);
    expect(getShape('sphere').params).toEqual(['radius']);
    expect(getShape('cylinder').params).toEqual(['radius', 'height']);
    expect(getShape('cone').params).toEqual(['radius', 'height']);
    for (const shape of SHAPES) {
      expect(Object.isFrozen(shape)).toBe(true);
      for (const param of shape.params) {
        expect(isValidDimension(shape.defaults[param])).toBe(true);
        expect(typeof PARAM_SYMBOLS[param]).toBe('string');
      }
    }
    expect(GEOMETRY3D_SCHEMA_VERSION).toBe(1);
  });

  it('un identifiant inconnu retombe sur le cube', () => {
    expect(getShape('torus').id).toBe('cube');
  });
});

describe('clampDimension', () => {
  it('borne, arrondit, lit la virgule décimale et le vrai signe moins', () => {
    expect(clampDimension(-4, 1)).toBe(DIMENSION_MIN);
    expect(clampDimension(0, 1)).toBe(DIMENSION_MIN);
    expect(clampDimension(1000, 1)).toBe(DIMENSION_MAX);
    expect(clampDimension('2,5', 1)).toBe(2.5);
    expect(clampDimension('−3', 1)).toBe(DIMENSION_MIN);
    expect(clampDimension(1.23456, 1)).toBe(1.235);
  });

  it('remplace ce qui n’est pas un nombre par la valeur de repli', () => {
    expect(clampDimension('abc', 2)).toBe(2);
    expect(clampDimension(NaN, 2)).toBe(2);
    expect(clampDimension(Infinity, 2)).toBe(2);
    expect(clampDimension(undefined, 2)).toBe(2);
    expect(clampDimension(null, 2)).toBe(2);
  });
});

describe('normalizeDimensions', () => {
  it('ne garde que les paramètres du solide, chacun borné ou par défaut', () => {
    expect(normalizeDimensions('cube', { side: 3, radius: 9 })).toEqual({ side: 3 });
    expect(normalizeDimensions('cuboid', { length: -1 })).toEqual({ length: DIMENSION_MIN, width: 2, height: 3 });
    expect(normalizeDimensions('sphere', null)).toEqual({ radius: 2 });
    expect(normalizeDimensions('cone', { radius: '1,5', height: 'x' })).toEqual({ radius: 1.5, height: 3 });
  });
});

describe('dimensionsForShape — changer de solide', () => {
  it('conserve ce qui porte le même nom', () => {
    expect(dimensionsForShape('cone', 'cylinder', { radius: 1, height: 4 })).toEqual({ radius: 1, height: 4 });
    expect(dimensionsForShape('sphere', 'cylinder', { radius: 1, height: 4 })).toEqual({ radius: 1 });
    expect(dimensionsForShape('cylinder', 'sphere', { radius: 3 })).toEqual({ radius: 3, height: 3 });
  });

  it('un cube devient un pavé de mêmes arêtes, un pavé un cube de côté sa longueur', () => {
    expect(dimensionsForShape('cuboid', 'cube', { side: 2.5 })).toEqual({ length: 2.5, width: 2.5, height: 2.5 });
    expect(dimensionsForShape('cube', 'cuboid', { length: 4, width: 2, height: 3 })).toEqual({ side: 4 });
  });

  it('sans précédent, les valeurs par défaut', () => {
    expect(dimensionsForShape('cuboid')).toEqual({ length: 4, width: 2, height: 3 });
    expect(dimensionsForShape('cube', 'sphere', { radius: 2 })).toEqual({ side: 2 });
  });
});

describe('normalizeCamera', () => {
  it('accepte une position et une cible finies, distinctes', () => {
    expect(normalizeCamera({ position: [3, 2, 4], target: [0, 1, 0] })).toEqual({ position: [3, 2, 4], target: [0, 1, 0] });
    expect(normalizeCamera({ position: [1.23456, 0, 0], target: [0, 0, 0] }).position[0]).toBe(1.235);
  });

  it('refuse le reste (→ vue par défaut)', () => {
    expect(normalizeCamera(null)).toBeNull();
    expect(normalizeCamera({ position: [0, 0, 0], target: [0, 0, 0] })).toBeNull();
    expect(normalizeCamera({ position: [1, 2], target: [0, 0, 0] })).toBeNull();
    expect(normalizeCamera({ position: [1, NaN, 0], target: [0, 0, 0] })).toBeNull();
    expect(normalizeCamera({ position: [1e5, 0, 0], target: [0, 0, 0] })).toBeNull();
    expect(normalizeCamera('camera')).toBeNull();
  });

  it('sameCamera compare au millième', () => {
    const a = { position: [1, 2, 3], target: [0, 0, 0] };
    expect(sameCamera(a, { position: [1.0004, 2, 3], target: [0, 0, 0] })).toBe(true);
    expect(sameCamera(a, { position: [1.1, 2, 3], target: [0, 0, 0] })).toBe(false);
    expect(sameCamera(a, null)).toBe(false);
    expect(sameCamera(null, null)).toBe(true);
  });
});

describe('normalizeGeometry3DData et createGeometry3DData', () => {
  it('un document neuf est un cube d’arête 2, tout visible, vue par défaut', () => {
    expect(createGeometry3DData()).toEqual({
      shape: 'cube', dimensions: { side: 2 }, showAxes: true, showGrid: true, showMeasurements: true, camera: null,
    });
  });

  it('rend sûr n’importe quel document', () => {
    expect(normalizeGeometry3DData(undefined).shape).toBe('cube');
    expect(normalizeGeometry3DData({ shape: 'torus', dimensions: { radius: 2 } }).shape).toBe('cube');
    const data = normalizeGeometry3DData({ shape: 'cone', dimensions: { radius: -2, height: 50 }, showGrid: false, camera: { position: [5, 5, 5], target: [0, 0, 0] }, extra: 1 });
    expect(data).toEqual({
      shape: 'cone', dimensions: { radius: DIMENSION_MIN, height: DIMENSION_MAX }, showAxes: true, showGrid: false, showMeasurements: true,
      camera: { position: [5, 5, 5], target: [0, 0, 0] },
    });
    expect('extra' in data).toBe(false);
  });

  it('une amorce de leçon fixe le solide et ses dimensions, jamais la caméra', () => {
    expect(createGeometry3DData({ shape: 'cylinder', dimensions: { radius: 1, height: 2 }, showAxes: false, camera: { position: [1, 1, 1], target: [0, 0, 0] } })).toEqual({
      shape: 'cylinder', dimensions: { radius: 1, height: 2 }, showAxes: false, showGrid: true, showMeasurements: true, camera: null,
    });
    expect(createGeometry3DData({ shape: 'torus' }).shape).toBe('cube');
  });
});
