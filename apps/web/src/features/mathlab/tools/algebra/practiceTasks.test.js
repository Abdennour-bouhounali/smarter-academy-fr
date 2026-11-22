import { describe, it, expect } from 'vitest';
import { validateFrames } from '../../shared/mathBoard/frames.js';
import { parseEquation } from './equation.js';
import { buildWalkthrough } from './walkthrough.js';
import { resolutionFrames } from './equationFrames.js';
import { simplifyExpression } from './simplify.js';
import { simplifyFrames } from './simplifyFrames.js';
import { factorExpression } from './factor.js';
import { factorFrames } from './factorFrames.js';
import { parseLinearEquation, eliminationSteps, substitutionSteps } from './systems.js';
import { eliminationFrames, substitutionFrames } from './systemsFrames.js';

/** Les exercices « تدرّب بنفسك » d'un tableau : [latex des jetons à choisir, opérateur]. */
function tasks(frames) {
  return frames.filter((f) => f.task).map((f) => {
    const tokens = new Map(f.rows.flat().map((t) => [t.id, t.latex]));

    return [f.task.targets.map((id) => tokens.get(id)), f.task.operator];
  });
}
const eq = (s) => parseLinearEquation(s).equation;

describe('« تدرّب بنفسك » — chaque exercice est la VRAIE transformation suivante', () => {
  it('2x + 3 = 9 : choisir +3 puis −, choisir 2x puis ÷', () => {
    const frames = resolutionFrames(buildWalkthrough(parseEquation('2x + 3 = 9').equation));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([[['+ 3'], '-'], [['2x'], '\\div']]);
  });

  it('4x − 7 = 2x + 5 : choisir 2x (à droite) puis −, −7 puis +, 4x… le coefficient puis ÷', () => {
    const frames = resolutionFrames(buildWalkthrough(parseEquation('4x - 7 = 2x + 5').equation));
    expect(tasks(frames)).toEqual([[['2x'], '-'], [['- 7'], '+'], [['2x'], '\\div']]);
  });

  it('x² + 5x + 6 : choisir 5x et 6 ; le couple (2 ; 3) dans la liste ; 2, 3 puis × ; 2, 3 puis +', () => {
    const frames = factorFrames(factorExpression('x^2 + 5x + 6'));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([
      [['+ 5x', '+ 6'], null],
      [['2', '3'], null],
      [['2', '3'], '\\times'],
      [['2', '3'], '+'],
    ]);
  });

  it('3x + 2(x + 4) − x : choisir 2 et (x + 4) puis × ; puis les termes semblables et +', () => {
    const frames = simplifyFrames(simplifyExpression('3x + 2(x + 4) - x'));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([
      [['+ 2', '\\left(x + 4\\right)'], '\\times'],
      [['3x', '+ 2x', '- x'], '+'],
    ]);
  });

  it('الجمع sur x + y = 10, x − y = 2 : choisir +y et −y puis + ; x = 6 : ÷ ; remplacer x ; −6', () => {
    const e1 = eq('x + y = 10');
    const e2 = eq('x - y = 2');
    const frames = eliminationFrames(eliminationSteps(e1, e2), e1, e2);
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([
      [['+ y', '- y'], '+'],
      [['2x'], '\\div'],
      [['x'], null],
      [['+ 6'], '-'],
    ]);
  });

  it('التعويض : isoler (x puis −), désigner y à remplacer, résoudre, désigner x à remplacer', () => {
    const e1 = eq('x + y = 10');
    const frames = substitutionFrames(substitutionSteps(e1, eq('x - y = 2')), e1);
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([
      [['x'], '-'],
      [['- y'], null],
      [['- 10'], '+'],
      [['2x'], '\\div'],
      [['-x'], null],
    ]);
  });
});
