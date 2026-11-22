import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import {
  parseLinearEquation, classifySystem, substitutionSteps, eliminationSteps, verifyInEquation,
  frameSystem, chooseIsolation, sourceLatex, equationLatex,
} from './systems.js';
import { validateFrames } from '../../shared/mathBoard/frames.js';
import { eliminationFrames, substitutionFrames, graphicalFrames } from './systemsFrames.js';
import { SYSTEM_EXAMPLES } from './examples.js';

const r = (n, d = 1) => R.makeRational(n, d);
const eq = (s) => parseLinearEquation(s).equation;

describe('systems — lecture', () => {
  it('lit toutes les écritures linéaires en x et y', () => {
    expect(eq('2x + 3y = 12')).toEqual({ a: r(2), b: r(3), c: r(12) });
    expect(eq('y = 2x - 1')).toEqual({ a: r(-2), b: r(1), c: r(-1) });
    expect(eq('x/2 + y/3 = 2')).toEqual({ a: r(1, 2), b: r(1, 3), c: r(2) });
    expect(eq('2(x + y) = 3 + x')).toEqual({ a: r(1), b: r(2), c: r(3) });
    expect(equationLatex(eq('y = 2x - 1'))).toBe('-2x + y = -1');
    expect(sourceLatex('y = 2x - 1')).toBe('y = 2x - 1');
  });

  it('refuse avec un code : non linéaire, pas une équation, sans inconnue, illisible', () => {
    expect(parseLinearEquation('xy = 3').error.code).toBe('nonLinear');
    expect(parseLinearEquation('x^2 + y = 1').error.code).toBe('nonLinear');
    expect(parseLinearEquation('x + y < 3').error.code).toBe('notEquation');
    expect(parseLinearEquation('3 = 3').error.code).toBe('noUnknown');
    expect(parseLinearEquation('x + z = 1').ok).toBe(false);
    expect(parseLinearEquation('').error.code).toBe('empty');
    expect(parseLinearEquation('x + = 2').ok).toBe(false);
  });
});

describe('systems — verdicts et méthodes', () => {
  it('unique / none / infinite', () => {
    expect(classifySystem(eq('x + y = 10'), eq('x - y = 2'))).toMatchObject({ kind: 'unique', x: r(6), y: r(4) });
    expect(classifySystem(eq('x + 2y = 4'), eq('2x + 4y = 3')).kind).toBe('none');
    expect(classifySystem(eq('x - y = 1'), eq('3x - 3y = 3')).kind).toBe('infinite');
  });

  it('la substitution isole un coefficient ±1 et suit les étapes du manuel', () => {
    expect(chooseIsolation(eq('2x + 3y = 12'), eq('y = 2x - 1'))).toMatchObject({ index: 1, v: 'y' });
    const out = substitutionSteps(eq('2x + 3y = 12'), eq('y = 2x - 1'));
    expect(out.steps.map((s) => s.kind)).toEqual(['isolate', 'substitute', 'expand', 'solveOne', 'backSubstitute', 'solution']);
    expect(out.steps[1].latex).toBe('2x + 3\\left(2x - 1\\right) = 12');
    expect(out).toMatchObject({ kind: 'unique', x: r(15, 8), y: r(11, 4) });
  });

  it('la combinaison multiplie par le PPCM, puis additionne ou soustrait', () => {
    const out = eliminationSteps(eq('3x + 2y = 7'), eq('5x - 3y = 18'));
    expect(out.steps[0]).toMatchObject({ kind: 'multiply', params: { m1: 3, m2: 2, variable: 'y' } });
    expect(out.steps[1]).toMatchObject({ latex: '19x = 57', rules: ['addEquations'] });
    expect(out).toMatchObject({ kind: 'unique', x: r(3), y: r(-1) });
    const fractions = eliminationSteps(eq('x/2 + y/3 = 2'), eq('x - y = -1'));
    expect(fractions.steps[0]).toMatchObject({ kind: 'clearFractions', latex: '3x + 2y = 12', params: { factor: 6 } });
    expect(fractions).toMatchObject({ x: r(2), y: r(3) });
  });

  it('les cas dégénérés finissent sur LEUR phrase, jamais un nombre', () => {
    for (const method of [substitutionSteps, eliminationSteps]) {
      expect(method(eq('x + 2y = 4'), eq('2x + 4y = 3')).kind).toBe('none');
      expect(method(eq('x - y = 1'), eq('3x - 3y = 3')).kind).toBe('infinite');
    }
    expect(eliminationSteps(eq('x = 2'), eq('y = 3'))).toMatchObject({ kind: 'unique', x: r(2), y: r(3) });
  });

  it('sur 500 جمل tirées au hasard, les deux méthodes aboutissent au couple de classifySystem', () => {
    let seed = 3;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const int = () => Math.floor(random() * 13) - 6;
    for (let i = 0; i < 500; i += 1) {
      const e1 = { a: r(int()), b: r(int()), c: r(int()) };
      const e2 = { a: r(int()), b: r(int()), c: r(int()) };
      if ((e1.a.n === 0 && e1.b.n === 0) || (e2.a.n === 0 && e2.b.n === 0)) continue;
      const verdict = classifySystem(e1, e2);
      for (const method of [substitutionSteps, eliminationSteps]) {
        const out = method(e1, e2);
        expect(out.kind).toBe(verdict.kind);
        if (verdict.kind === 'unique') {
          expect(R.equals(out.x, verdict.x) && R.equals(out.y, verdict.y)).toBe(true);
          expect(verifyInEquation(e1, out.x, out.y).holds).toBe(true);
          expect(verifyInEquation(e2, out.x, out.y).holds).toBe(true);
        }
      }
    }
  });

  it('vérifie dans chaque équation et cadre l’intersection', () => {
    const check = verifyInEquation(eq('2x + 3y = 12'), r(3), r(2));
    expect(check).toEqual({ holds: true, substituted: '2 \\times 3 + 3 \\times 2 = 12', evaluated: '12 = 12' });
    expect(verifyInEquation(eq('x - y = 1'), r(3), r(-2)).substituted).toBe('3 - \\left(-2\\right) = 1');
    const frame = frameSystem([eq('x + y = 10'), eq('x - y = 2')], classifySystem(eq('x + y = 10'), eq('x - y = 2')));
    expect(frame.xMin).toBeLessThan(6);
    expect(frame.xMax).toBeGreaterThan(6);
    expect(frame.yMin).toBeLessThan(4);
    expect(frame.yMax).toBeGreaterThan(4);
  });
});

describe('systems — le tableau (frames), geste par geste', () => {
  const lines = (frames) => frames.filter((f) => f.settle).map((f) => f.settle);

  it('الجمع sur x + y = 10, x − y = 2 : ±y désignés → ↓0 → (x + y) + (x − y) = 10 + 2 → 2x = 12 → x = 6 → 6 + y = 10 → y = 4 → (6 ; 4) en dernier', () => {
    const e1 = eq('x + y = 10');
    const e2 = eq('x - y = 2');
    const frames = eliminationFrames(eliminationSteps(e1, e2), e1, e2);
    expect(validateFrames(frames)).toEqual([]);
    expect(frames[0].rows.map((row) => row.filter((t) => t.tone === 'selected').map((t) => t.latex))).toEqual([['+ y'], ['- y']]);
    expect(frames[1].marks).toEqual([{ type: 'result', from: ['1y', '2y'], latex: '0' }]);
    expect(lines(frames)).toEqual([
      '\\left(x + y\\right) + \\left(x - y\\right) = 10 + 2',
      '2x = 12',
      'x = 6',
      '6 + y = 10',
      'y = 4',
      '\\left(x\\,;\\,y\\right) = \\left(6\\,;\\,4\\right)',
    ]);
    // ÷2 posé sous les deux membres
    expect(frames.some((f) => f.marks.length === 2 && f.marks.every((m) => m.latex === '\\div 2'))).toBe(true);
    // Le 6 remplace x, en vert
    expect(frames.find((f) => f.settle === '6 + y = 10').rows[0][0]).toMatchObject({ latex: '6', tone: 'result' });
    // −6 sous les deux membres pour finir
    expect(frames.some((f) => f.marks.length === 2 && f.marks.every((m) => m.latex === '- 6'))).toBe(true);
    // Le couple n'apparaît QUE dans le dernier frame
    expect(frames.slice(0, -1).some((f) => JSON.stringify(f).includes('\\left(6\\,;\\,4\\right)'))).toBe(false);
  });

  it('التعويض : isoler, remplacer, développer, résoudre, revenir — puis le couple', () => {
    const e1 = eq('x + y = 10');
    const e2 = eq('x - y = 2');
    const frames = substitutionFrames(substitutionSteps(e1, e2), e1);
    expect(validateFrames(frames)).toEqual([]);
    expect(lines(frames)).toEqual([
      'y = -x + 10',
      'x - \\left(-x + 10\\right) = 2',
      '2x - 10 = 2',
      '2x = 12',
      'x = 6',
      'y = -6 + 10',
      'y = 4',
      '\\left(x\\,;\\,y\\right) = \\left(6\\,;\\,4\\right)',
    ]);
  });

  it('البياني : droite (1), droite (2), le point, la lecture — le plan suit `draw`', () => {
    const frames = graphicalFrames(eq('x + y = 10'), eq('x - y = 2'));
    expect(validateFrames(frames)).toEqual([]);
    expect(frames.map((f) => f.draw)).toEqual([1, 2, 3, 4]);
    expect(graphicalFrames(eq('x + 2y = 4'), eq('2x + 4y = 3')).map((f) => f.draw)).toEqual([1, 2, 2]);
  });

  it('chaque exemple, chaque méthode, 300 جمل au hasard : un tableau sain qui finit sur le verdict', () => {
    for (const example of SYSTEM_EXAMPLES) {
      const e1 = eq(example.first);
      const e2 = eq(example.second);
      expect(validateFrames(eliminationFrames(eliminationSteps(e1, e2), e1, e2))).toEqual([]);
      expect(validateFrames(substitutionFrames(substitutionSteps(e1, e2), e1))).toEqual([]);
      expect(validateFrames(graphicalFrames(e1, e2))).toEqual([]);
    }
    let seed = 11;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const int = () => Math.floor(random() * 11) - 5;
    for (let i = 0; i < 300; i += 1) {
      const e1 = { a: r(int()), b: r(int()), c: r(int()) };
      const e2 = { a: r(int()), b: r(int()), c: r(int()) };
      if ((e1.a.n === 0 && e1.b.n === 0) || (e2.a.n === 0 && e2.b.n === 0)) continue;
      const elim = eliminationFrames(eliminationSteps(e1, e2), e1, e2);
      const subs = substitutionFrames(substitutionSteps(e1, e2), e1);
      expect(validateFrames(elim)).toEqual([]);
      expect(validateFrames(subs)).toEqual([]);
    }
  });
});
