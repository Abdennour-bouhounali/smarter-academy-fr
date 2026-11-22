import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import { parseEquation, applyOperation, equationToText } from './equation.js';
import {
  normalizeAlgebraData, createAlgebraData, pushStep, currentEquation, setSection, updatePath, updateSection,
  enforceSizeBudget, serializedBytes, SIZE_BUDGET, ALGEBRA_SECTIONS, MAX_STEPS, MAX_INEQUALITY_STEPS,
  DEFAULT_INEQUALITY_SOURCE,
} from './algebraState.js';
import { summarizeAlgebra } from './summarize.js';

/** Un document tel que la V1 l'enregistrait (MATH_LAB.md §5e.5). */
const V1_DOCUMENT = {
  source: '2x + 3 = 11',
  steps: [
    { equation: { left: { a: { n: 2, d: 1 }, b: { n: 3, d: 1 } }, right: { a: { n: 0, d: 1 }, b: { n: 11, d: 1 } }, relation: '=' }, operation: null, flipped: false },
    { equation: { left: { a: { n: 2, d: 1 }, b: { n: 0, d: 1 } }, right: { a: { n: 0, d: 1 }, b: { n: 8, d: 1 } }, relation: '=' }, operation: { kind: 'subtract', value: { n: 3, d: 1 } }, flipped: false },
  ],
  cursor: 1,
  showSolution: false,
  parameters: { a: 2, b: 3, c: 11 },
  numberLine: { center: 1, span: 12 },
};

describe('algebraState V2 — compatibilité et sections', () => {
  it('un document V1 se rouvre À L’IDENTIQUE, sur « المعادلات »', () => {
    const data = normalizeAlgebraData(JSON.parse(JSON.stringify(V1_DOCUMENT)));
    for (const key of Object.keys(V1_DOCUMENT)) expect(data[key]).toEqual(V1_DOCUMENT[key]);
    expect(data.section).toBe('equations');
    expect(equationToText(currentEquation(data))).toBe('2x = 8');
  });

  it('un document neuf ouvre sur 2x + 3 = 11, les autres sections sur leurs valeurs d’ouverture', () => {
    const data = createAlgebraData();
    expect(data.section).toBe('equations');
    expect(data.source).toBe('2x + 3 = 11');
    expect(data.showSolution).toBe(false);
    expect(data.inequalities.source).toBe(DEFAULT_INEQUALITY_SOURCE);
    expect(data.inequalities.steps).toHaveLength(1);
    expect(data.inequalities.showSolution).toBe(false);
    expect(data.systems).toEqual({ first: 'x + y = 10', second: 'x - y = 2', method: 'substitution' });
    expect(data.simplify.source).toBe('(x + 2)(x - 3)');
    expect(data.factor.source).toBe('x^2 + 5x + 6');
    expect(data.functions).toMatchObject({ family: 'affine', a: 2, b: 1 });
    expect(createAlgebraData({ section: 'factor' }).section).toBe('factor');
  });

  it('chaque section garde SES valeurs : aucune ne touche aux autres', () => {
    let data = createAlgebraData();
    const start = currentEquation(data);
    data = setSection(data, 'inequalities');
    const ineq = data.inequalities.steps[0].equation;
    const result = applyOperation(ineq, { kind: 'subtract', value: R.makeRational(3) });
    data = updatePath(data, 'inequalities', (path) => pushStep(path, result.equation, { kind: 'subtract', value: R.makeRational(3) }, false, MAX_INEQUALITY_STEPS));
    data = updateSection(data, 'systems', { method: 'graphical' });
    expect(data.inequalities.steps).toHaveLength(2);
    expect(data.steps).toHaveLength(1);
    expect(currentEquation(data)).toEqual(start);
    expect(data.systems.method).toBe('graphical');
    const reopened = normalizeAlgebraData(JSON.parse(JSON.stringify(data)));
    expect(reopened).toEqual(data);
  });

  it('ne jette JAMAIS, quel que soit ce qu’on lui donne', () => {
    const rubbish = [null, undefined, 0, 'x', [], {}, { section: 'nope' }, { inequalities: 'x' }, { inequalities: { steps: [{}] } },
      { systems: { first: 42, method: 'magic' } }, { functions: { family: 'cubic', a: 'x', tableStep: 0 } }, { simplify: null, factor: [] },
      { functions: { family: 'quadratic', a: 0 } }];
    for (const raw of rubbish) {
      const data = normalizeAlgebraData(raw);
      expect(ALGEBRA_SECTIONS).toContain(data.section);
      expect(data.inequalities.steps.length).toBeGreaterThanOrEqual(1);
      expect(typeof data.systems.first).toBe('string');
      expect(data.functions.tableStep).not.toBe(0);
      if (data.functions.family === 'quadratic') expect(data.functions.a).not.toBe(0);
      for (const section of ALGEBRA_SECTIONS) expect(() => summarizeAlgebra({ ...data, section })).not.toThrow();
      expect(() => summarizeAlgebra(raw)).not.toThrow();
    }
  });

  it('le pire cas tient sous le plafond du serveur (20 000 octets)', () => {
    // Des fractions à treize chiffres, deux chemins pleins, les champs texte au maximum.
    const big = { n: -999999999999, d: 999999999989 };
    const step = (index) => ({
      equation: { left: { a: big, b: big }, right: { a: big, b: big }, relation: '<=' },
      operation: index === 0 ? null : { kind: 'multiply', value: big },
      flipped: true,
    });
    const raw = {
      source: 'x'.repeat(500),
      steps: Array.from({ length: 80 }, (_, i) => step(i)),
      cursor: 70,
      inequalities: { source: 'y'.repeat(500), steps: Array.from({ length: 80 }, (_, i) => step(i)) },
      systems: { first: 'a'.repeat(500), second: 'b'.repeat(500), method: 'elimination' },
      simplify: { source: 's'.repeat(500) },
      factor: { source: 'f'.repeat(500) },
    };
    const data = enforceSizeBudget(normalizeAlgebraData(raw));
    expect(data.steps.length).toBeLessThanOrEqual(MAX_STEPS);
    expect(data.inequalities.steps.length).toBeLessThanOrEqual(MAX_INEQUALITY_STEPS);
    expect(serializedBytes(data)).toBeLessThanOrEqual(SIZE_BUDGET);
    expect(serializedBytes(data)).toBeLessThan(20_000);
    expect(data.steps[0].operation).toBeNull();
    expect(data.cursor).toBeLessThan(data.steps.length);
    expect(normalizeAlgebraData(JSON.parse(JSON.stringify(data))).steps.length).toBe(data.steps.length);
  });

  it('un document réaliste n’est pas touché par le budget', () => {
    let data = createAlgebraData();
    const result = applyOperation(currentEquation(data), { kind: 'subtract', value: R.makeRational(3) });
    data = pushStep(data, result.equation, { kind: 'subtract', value: R.makeRational(3) });
    expect(enforceSizeBudget(data)).toBe(data);
  });
});

describe('summarizeAlgebra — chaque section se résume', () => {
  const base = createAlgebraData();

  it('المعادلات et المتراجحات : kind « equation »', () => {
    expect(summarizeAlgebra(base)).toMatchObject({ kind: 'equation', detail: { first: '2x + 3 = 11' } });
    expect(summarizeAlgebra({ ...base, section: 'inequalities' }).detail.first).toBe('−2x + 3 < 9');
  });

  it('الأنظمة, تبسيط, تحليل : l’entrée et son résultat', () => {
    expect(summarizeAlgebra({ ...base, section: 'systems' })).toMatchObject({ kind: 'equation', detail: { current: '(6 ; 4)' } });
    expect(summarizeAlgebra({ ...base, section: 'simplify' }).detail.current).toBe('x² − x − 6');
    expect(summarizeAlgebra({ ...base, section: 'factor' }).detail.current).toBe('(x + 2)(x + 3)');
  });

  it('الدوال : une courbe échantillonnée, sous 2 Ko', () => {
    const summary = summarizeAlgebra({ ...base, section: 'functions', functions: { family: 'quadratic', a: 1, b: -2, c: -3, tableStart: -3, tableStep: 1 } });
    expect(summary.kind).toBe('curve');
    expect(summary.detail.polylines[0].p).toHaveLength(24);
    expect(new TextEncoder().encode(JSON.stringify(summary)).length).toBeLessThan(2000);
  });

  it('le résultat d’une opération se lit toujours dans le chemin', () => {
    const eq = parseEquation('3(x + 2) = 2x - 1').equation;
    expect(equationToText(eq)).toBe('3x + 6 = 2x − 1');
  });
});
