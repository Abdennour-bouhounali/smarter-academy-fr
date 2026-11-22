import { describe, it, expect } from 'vitest';
import {
  createFunctionGrapherData, normalizeGrapherData, nextFunctionName, nextFunctionColor, nextPointName,
  FUNCTION_PALETTE, FUNCTION_COLOR_CHOICES, MAX_FUNCTIONS, FIRST_RUN_EXPRESSION, FUNCTION_PRESETS, isGrapherEmpty,
  normalizeFunction, normalizeTangent, derivativeColorFor,
} from './grapherState.js';
import { parseExpression } from './expressionParser.js';

describe('état du grapheur', () => {
  it('un document neuf ouvre sur f(x) = x², une fenêtre par défaut et la grille', () => {
    const data = createFunctionGrapherData();
    expect(data.functions).toHaveLength(1);
    expect(data.functions[0]).toMatchObject({ name: 'f', expression: FIRST_RUN_EXPRESSION, visible: true, color: FUNCTION_PALETTE[0], domain: null });
    expect(data.points).toEqual([]);
    expect(data.viewport).toBeNull();
    expect(data.settings).toEqual({ grid: true });
    expect(isGrapherEmpty(data)).toBe(false);
    expect(isGrapherEmpty({ functions: [] })).toBe(true);
  });

  it('une amorce de leçon fixe fonctions, fenêtre et point', () => {
    const data = createFunctionGrapherData({
      functions: [{ expression: '2x+3', name: 'f' }, { expression: 'x^2', visible: false, domain: { min: 0 } }],
      viewport: { xMin: -2, xMax: 6, yMin: -1, yMax: 10 },
      points: [{ functionIndex: 0, x: 1 }],
    });
    expect(data.functions.map((f) => f.name)).toEqual(['f', 'g']);
    expect(data.functions[1]).toMatchObject({ visible: false, domain: { min: 0, max: null }, color: FUNCTION_PALETTE[1] });
    expect(data.viewport).toEqual({ xMin: -2, xMax: 6, yMin: -1, yMax: 10 });
    expect(data.points).toHaveLength(1);
    expect(data.points[0]).toMatchObject({ name: 'A', functionId: data.functions[0].id, x: 1 });
    const withTangent = createFunctionGrapherData({ functions: [{ expression: 'x' }, { expression: 'x^2' }], tangent: { enabled: true, functionIndex: 1, x: 2 } });
    expect(withTangent.tangent).toMatchObject({ enabled: true, functionId: withTangent.functions[1].id, x: 2 });
  });

  it('les exemples proposés sont tous analysables', () => {
    for (const preset of FUNCTION_PRESETS) {
      expect(parseExpression(preset.expression).ok, preset.expression).toBe(true);
    }
    expect(parseExpression(FIRST_RUN_EXPRESSION).ok).toBe(true);
  });

  it('normalise un document abîmé sans rien perdre d’utile', () => {
    const data = normalizeGrapherData({
      functions: [{ id: 'a', name: 'f', expression: 'x^', color: 'red', visible: 'yes' }, null, { expression: 42 }],
      points: [{ functionId: 'a', x: 2 }, { functionId: 'zzz', x: 1 }, { functionId: 'a', x: 'nan' }],
      viewport: { xMin: 0, xMax: 0, yMin: 0, yMax: 1 },
      settings: { grid: false },
    });
    expect(data.functions).toHaveLength(3);
    expect(data.functions[0]).toMatchObject({ id: 'a', expression: 'x^', color: FUNCTION_PALETTE[0], visible: true });
    expect(data.functions[1].name).toBe('g');
    expect(data.functions[2].expression).toBe('');
    expect(data.points).toHaveLength(1);
    expect(data.viewport).toBeNull();
    expect(data.settings.grid).toBe(false);
    expect(normalizeGrapherData(null)).toEqual({ functions: [], points: [], viewport: null, settings: { grid: true }, tangent: { enabled: false, functionId: null, x: 1, showDerivative: false, showTriangle: true } });
  });

  it('la couleur appartient à la fonction : choisie, elle est gardée telle quelle', () => {
    const custom = normalizeFunction({ name: 'f', expression: 'x', color: '#334155' });
    expect(custom.color).toBe('#334155');
    const data = normalizeGrapherData({ functions: [{ name: 'f', expression: 'x', color: '#7c3aed' }, { name: 'g', expression: 'x', color: '#7c3aed' }] });
    // Deux fonctions peuvent porter volontairement la même couleur : rien ne l'écrase.
    expect(data.functions.map((f) => f.color)).toEqual(['#7c3aed', '#7c3aed']);
  });

  it('un ancien document sans couleur reçoit une couleur par défaut distincte', () => {
    const data = normalizeGrapherData({ functions: [{ name: 'f', expression: 'x' }, { name: 'g', expression: 'x^2' }, { name: 'h', expression: 'x^3', color: null }] });
    expect(data.functions.map((f) => f.color)).toEqual(FUNCTION_PALETTE.slice(0, 3));
  });

  it('les couleurs proposées sont des hexadécimaux distincts, la palette automatique en tête', () => {
    expect(FUNCTION_COLOR_CHOICES.length).toBeGreaterThanOrEqual(MAX_FUNCTIONS);
    expect(new Set(FUNCTION_COLOR_CHOICES).size).toBe(FUNCTION_COLOR_CHOICES.length);
    for (const color of FUNCTION_COLOR_CHOICES) expect(color).toMatch(/^#[0-9a-f]{6}$/);
    expect(FUNCTION_COLOR_CHOICES.slice(0, FUNCTION_PALETTE.length)).toEqual([...FUNCTION_PALETTE]);
  });

  it('le mode tangente : éteint par défaut, compatible avec un document sans lui', () => {
    const old = normalizeGrapherData({ functions: [{ id: 'a', name: 'f', expression: 'x^2' }] });
    expect(old.tangent).toEqual({ enabled: false, functionId: 'a', x: 1, showDerivative: false, showTriangle: true });
    const on = normalizeGrapherData({ functions: [{ id: 'a', expression: 'x' }, { id: 'b', expression: 'x^2' }], tangent: { enabled: true, functionId: 'b', x: -2.5, showDerivative: true, showTriangle: false } });
    expect(on.tangent).toEqual({ enabled: true, functionId: 'b', x: -2.5, showDerivative: true, showTriangle: false });
    // Une fonction étudiée qui n'existe plus → la première ; une abscisse absurde → 1.
    expect(normalizeTangent({ enabled: true, functionId: 'zzz', x: 'nan' }, [{ id: 'a' }])).toEqual({ enabled: true, functionId: 'a', x: 1, showDerivative: false, showTriangle: true });
    expect(normalizeTangent(null, [])).toMatchObject({ enabled: false, functionId: null });
    for (const color of FUNCTION_COLOR_CHOICES) expect(derivativeColorFor(color)).not.toBe(color);
    // f′ évite aussi les couleurs des AUTRES courbes du plan.
    expect(derivativeColorFor(FUNCTION_PALETTE[0], [FUNCTION_PALETTE[1], FUNCTION_PALETTE[2]])).toBe(FUNCTION_PALETTE[3]);
    expect(derivativeColorFor(FUNCTION_PALETTE[0], FUNCTION_PALETTE)).toBe(FUNCTION_PALETTE[1]);
  });

  it('borne le nombre de fonctions et attribue noms et couleurs libres', () => {
    const many = normalizeGrapherData({ functions: Array.from({ length: 10 }, () => ({ expression: 'x' })) });
    expect(many.functions).toHaveLength(MAX_FUNCTIONS);
    expect(new Set(many.functions.map((f) => f.color)).size).toBe(MAX_FUNCTIONS);
    expect(nextFunctionName([{ name: 'f' }, { name: 'h' }])).toBe('g');
    expect(nextFunctionName(['f', 'g', 'h', 'k', 'l', 'm'].map((name) => ({ name })))).toBe('f2');
    expect(nextFunctionColor([{ color: FUNCTION_PALETTE[0] }])).toBe(FUNCTION_PALETTE[1]);
    expect(nextPointName([{ name: 'A' }])).toBe('B');
  });
});
