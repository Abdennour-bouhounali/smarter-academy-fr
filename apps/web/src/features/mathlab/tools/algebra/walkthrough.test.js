import { describe, it, expect } from 'vitest';
import { validateFrames, rowLatex } from '../../shared/mathBoard/frames.js';
import * as R from './rational.js';
import { parseEquation, equationToLatex, applyOperation } from './equation.js';
import { suggestOperations } from './operationHints.js';
import { buildWalkthrough } from './walkthrough.js';
import { resolutionFrames, verificationFrames, opLatexOf } from './equationFrames.js';
import { equationExpansion } from './equationDisplay.js';
import { verifyResolution } from './verify.js';
import { generateEquation, LEVELS } from './generator.js';
import { EQUATION_EXAMPLES, INEQUALITY_EXAMPLES } from './examples.js';

const eq = (source) => parseEquation(source).equation;
const summary = (walk) => walk.steps.map((s) => [opLatexOf(s.operation), s.resultLatex, s.flipped]);

describe('buildWalkthrough — les VRAIS états successifs, le résultat en dernier', () => {
  it('2x + 3 < 9 : −3 → 2x < 6, ÷2 → x < 3, puis S = ]−∞ ; 3[', () => {
    const walk = buildWalkthrough(eq('2x + 3 < 9'));
    expect(summary(walk)).toEqual([['- 3', '2x < 6', false], ['\\div 2', 'x < 3', false]]);
    expect(walk.steps[0].intermediateLatex).toBe('2x + 3 \\textcolor{#F36D21}{{} - 3} < 9 \\textcolor{#F36D21}{{} - 3}');
    expect(walk.steps.map((s) => s.explanationKey)).toEqual(['subtract', 'divide']);
    expect(walk.final).toMatchObject({ kind: 'solved', inequality: true, latex: 'x < 3' });
    expect(walk.final.set.latex).toBe('\\left]-\\infty\\,;\\,3\\right[');
  });

  it('−2x < 6 : ÷(−2) RETOURNE le sens (flipped), x > −3', () => {
    const walk = buildWalkthrough(eq('-2x < 6'));
    expect(summary(walk)).toEqual([['\\div \\left(-2\\right)', 'x > -3', true]]);
    expect(walk.steps[0].explanationKey).toBe('divideNegative');
    expect(walk.final.latex).toBe('x > -3');
  });

  it('2x + 3 = 2x + 5 : −2x → 3 = 5, puis « لا يوجد حل » (aucun faux nombre)', () => {
    const walk = buildWalkthrough(eq('2x + 3 = 2x + 5'));
    expect(summary(walk)).toEqual([['- 2x', '3 = 5', false]]);
    expect(walk.steps[0].explanationKey).toBe('subtractX');
    expect(walk.final).toMatchObject({ kind: 'none', inequality: false });
    expect(walk.final.solution).toBeUndefined();
    expect(buildWalkthrough(eq('2x + 3 = 2x + 3')).final.kind).toBe('infinite');
  });

  it('x des deux côtés : on déplace le TERME 2x, pas le nombre 2 (4x − 7 = 2x + 5 → x = 6)', () => {
    const walk = buildWalkthrough(eq('4x - 7 = 2x + 5'));
    expect(summary(walk)).toEqual([['- 2x', '2x - 7 = 5', false], ['+ 7', '2x = 12', false], ['\\div 2', 'x = 6', false]]);
    expect(walk.final.latex).toBe('x = 6');
    const hint = suggestOperations(eq('4x - 7 = 2x + 5'))[0];
    expect(hint).toMatchObject({ kind: 'subtract', term: 'x', label: '− 2x' });
  });

  it('une forme déjà résolue n’a que le pas final ; `3 > x` se lit x < 3', () => {
    expect(buildWalkthrough(eq('x = 4')).steps).toEqual([]);
    const mirrored = buildWalkthrough(eq('3 > x'));
    expect(mirrored.steps).toEqual([]);
    expect(mirrored.final.latex).toBe('x < 3');
  });

  it('sur 2 000 équations et inéquations générées, le déroulé aboutit à la solution du moteur en ≤ 3 opérations', () => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (const relation of ['=', '<', '>=']) {
      for (const level of LEVELS) {
        for (let i = 0; i < 130; i += 1) {
          const { equation } = generateEquation({ level, relation, random });
          const walk = buildWalkthrough(equation);
          expect(walk.steps.length).toBeLessThanOrEqual(3);
          // Chaque pas est bien l'opération du moteur appliquée à l'état précédent.
          for (const s of walk.steps) {
            expect(equationToLatex(applyOperation(s.before, s.operation).equation)).toBe(s.resultLatex);
          }
          if (walk.final.kind === 'solved') {
            const check = verifyResolution(equation, walk.final.solution, walk.final.relation);
            expect(check.holds).toBe(true);
          }
          expect(validateFrames(resolutionFrames(walk))).toEqual([]);
        }
      }
    }
  });
});

describe('le tableau d’une résolution (frames)', () => {
  it('2x + 3 = 9 : +3 désigné → ↓−3 sous les deux membres → 2x + 3 − 3 = 9 − 3 → 2x = 6 → ↓÷2 → x = 3 → x = 3 (dernier)', () => {
    const frames = resolutionFrames(buildWalkthrough(eq('2x + 3 = 9')));
    expect(validateFrames(frames)).toEqual([]);
    expect(frames).toHaveLength(9);
    // 1. désigner +3
    expect(frames[0].rows[0].find((t) => t.id === 'Lc')).toMatchObject({ latex: '+ 3', tone: 'selected' });
    // 2. −3 sous chaque membre
    expect(frames[1].marks.map((m) => [m.type, m.target, m.latex])).toEqual([['under', 'Lc', '- 3'], ['under', 'Rc', '- 3']]);
    // 3. écrit dans l'expression
    expect(rowLatex(frames[2].rows[0])).toBe('2x + 3 - 3 = 9 - 3');
    // 4. simplifié, le 6 en vert
    expect(rowLatex(frames[3].rows[0])).toBe('2x = 6');
    expect(frames[3].rows[0].find((t) => t.id === 'Rc').tone).toBe('result');
    // 5–8. ÷2 : désigner 2x, ↓÷2, les fractions, x = 3
    expect(frames[5].marks.map((m) => m.latex)).toEqual(['\\div 2', '\\div 2']);
    expect(rowLatex(frames[7].rows[0])).toBe('x = 3');
    // 9. le résultat, et lui seul, est le dernier frame
    expect(frames[8]).toMatchObject({ tone: 'result', textKey: 'tools.algebra.board.final.equation' });
    expect(frames.slice(0, 8).every((f) => f.tone !== 'result')).toBe(true);
  });

  it('−2x < 6 : la relation en warning, marque `< \\to >`, la phrase de la règle', () => {
    const frames = resolutionFrames(buildWalkthrough(eq('-2x < 6')));
    expect(validateFrames(frames)).toEqual([]);
    const flip = frames.find((f) => f.tone === 'warning');
    expect(flip.textKey).toBe('tools.algebra.board.flip.divide');
    expect(flip.rows[0].find((t) => t.id === 'rel')).toMatchObject({ latex: '>', tone: 'warning' });
    expect(flip.marks).toEqual([{ type: 'under', target: 'rel', latex: '< \\to >', tone: 'warning' }]);
    expect(frames.at(-1).rows[1].map((t) => t.latex)).toEqual(['S =', '\\left]-3\\,;\\,+\\infty\\right[']);
  });

  it('une saisie à parenthèses commence par « نشر وتبسيط » de chaque membre', () => {
    const source = '3(x + 2) = 2x - 1';
    const start = eq(source);
    const frames = resolutionFrames(buildWalkthrough(start), { expansion: equationExpansion(source), start });
    expect(validateFrames(frames)).toEqual([]);
    expect(frames[0].textKey).toBe('tools.algebra.board.expand.left');
    expect(frames.find((f) => f.textKey === 'tools.algebra.board.expand.done').settle).toBe('3x + 6 = 2x - 1');
  });

  it('tous les exemples de la section donnent un tableau sain', () => {
    for (const example of [...EQUATION_EXAMPLES, ...INEQUALITY_EXAMPLES]) {
      const start = eq(example.source);
      const frames = resolutionFrames(buildWalkthrough(start), { expansion: equationExpansion(example.source), start });
      expect(validateFrames(frames)).toEqual([]);
    }
  });

  it('« التحقق » se déroule : substitution → calcul → verdict (et la borne pour une متراجحة)', () => {
    const start = eq('2x + 3 = 11');
    const frames = verificationFrames(start, verifyResolution(start, R.makeRational(4), '='));
    expect(validateFrames(frames)).toEqual([]);
    expect(rowLatex(frames[0].rows[0])).toBe('2 \\times 4 + 3 = 11');
    expect(rowLatex(frames[1].rows[0])).toBe('11 = 11');
    expect(frames[2].textKey).toBe('tools.algebra.verificationTrue');
    const ineq = eq('x - 7 < -7');
    const more = verificationFrames(ineq, verifyResolution(ineq, R.ZERO, '<'));
    expect(validateFrames(more)).toEqual([]);
    expect(more).toHaveLength(4);
    expect(more[3].textKey).toBe('tools.algebra.verificationBoundaryExcluded');
  });
});
