import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import {
  parseEquation,
  applyOperation,
  classify,
  solve,
  flipRelation,
  splitRelation,
  equationToText,
  equationToLatex,
  sameEquation,
} from './equation.js';

/** `2x + 3 = 11` → l'équation, ou l'échec du test avec la raison. */
function parse(source) {
  const result = parseEquation(source);
  if (!result.ok) throw new Error(`« ${source} » refusée : ${result.error.code}`);

  return result.equation;
}

/** La solution sous forme de texte : `4`, `−3`, `1/3`. */
function solutionText(source) {
  const verdict = solve(parse(source));
  if (verdict.kind !== 'solved') return verdict.kind;

  return R.toPlainText(verdict.solution);
}

/** Enchaîne des opérations et rend l'équation obtenue en texte. */
function run(source, operations) {
  let equation = parse(source);
  for (const [kind, n, d = 1] of operations) {
    const result = applyOperation(equation, { kind, value: R.makeRational(n, d) });
    if (!result.ok) throw new Error(`opération refusée : ${result.error.code}`);
    equation = result.equation;
  }

  return equationToText(equation);
}

describe('parseEquation', () => {
  it('lit les deux membres et la relation', () => {
    expect(equationToText(parse('2x + 3 = 11'))).toBe('2x + 3 = 11');
    expect(equationToText(parse('5 - 2x = 11'))).toBe('−2x + 5 = 11');
  });

  it('accepte le LaTeX de MathLive comme l’ASCII', () => {
    expect(equationToText(parse('\\frac{x}{2}=5'))).toBe('1/2x = 5');
    expect(equationToText(parse('x/2 = 5'))).toBe('1/2x = 5');
  });

  it('accepte les quatre inégalités, écrites de plusieurs façons', () => {
    expect(parse('x + 3 > 7').relation).toBe('>');
    expect(parse('2x <= 10').relation).toBe('<=');
    expect(parse('2x \\leq 10').relation).toBe('<=');
    expect(parse('2x ≤ 10').relation).toBe('<=');
    expect(parse('x \\geqslant 1').relation).toBe('>=');
  });

  it('refuse ce qui n’est pas du premier degré', () => {
    expect(parseEquation('x^2 = 4').error.code).toBe('nonLinear');
    expect(parseEquation('x*x = 4').error.code).toBe('nonLinear');
    expect(parseEquation('3/x = 1').error.code).toBe('nonLinear');
    expect(parseEquation('sin(x) = 0').error.code).toBe('nonLinear');
  });

  it('refuse une saisie sans relation, à deux relations, ou à membre vide', () => {
    expect(parseEquation('2x + 3').error.code).toBe('noRelation');
    expect(parseEquation('1 < x < 5').error.code).toBe('manyRelations');
    expect(parseEquation('2x =').error.code).toBe('emptySide');
    expect(parseEquation('= 4').error.code).toBe('emptySide');
  });

  it('ne confond pas une accolade LaTeX avec une relation', () => {
    const split = splitRelation('\\frac{1}{2}x = 4');
    expect(split.ok).toBe(true);
    expect(split.relation).toBe('=');
    expect(split.right.trim()).toBe('4');
  });

  it('remonte le membre fautif', () => {
    expect(parseEquation('2x = y').error.side).toBe('right');
  });
});

describe('résolution — les cas du programme', () => {
  it('addition : x + 3 = 10 → x = 7', () => {
    expect(solutionText('x + 3 = 10')).toBe('7');
  });

  it('soustraction : x − 5 = 8 → x = 13', () => {
    expect(solutionText('x - 5 = 8')).toBe('13');
  });

  it('multiplication : 3x = 15 → x = 5', () => {
    expect(solutionText('3x = 15')).toBe('5');
  });

  it('division : x/4 = 5 → x = 20', () => {
    expect(solutionText('x/4 = 5')).toBe('20');
  });

  it('deux étapes : 2x + 3 = 11 → x = 4', () => {
    expect(solutionText('2x + 3 = 11')).toBe('4');
  });

  it('coefficient négatif : −2x + 4 = 10 → x = −3', () => {
    expect(solutionText('-2x + 4 = 10')).toBe('−3');
  });

  it('inconnue à droite : 5 − 2x = 11 → x = −3', () => {
    expect(solutionText('5 - 2x = 11')).toBe('−3');
  });

  it('inconnue des deux côtés : 4x + 1 = 2x + 9 → x = 4', () => {
    expect(solutionText('4x + 1 = 2x + 9')).toBe('4');
  });

  it('garde la solution EXACTE plutôt qu’un décimal approché', () => {
    expect(solutionText('3x = 1')).toBe('1/3');
    expect(solutionText('(1/2)x = 4')).toBe('8');
    expect(solutionText('2x = 5')).toBe('2,5');
  });
});

describe('cas particuliers', () => {
  it('aucune solution : 2x + 3 = 2x + 5', () => {
    expect(classify(parse('2x + 3 = 2x + 5')).kind).toBe('none');
    expect(solve(parse('2x + 3 = 2x + 5')).solution).toBeNull();
  });

  it('une infinité de solutions : 2x + 3 = 2x + 3', () => {
    expect(classify(parse('2x + 3 = 2x + 3')).kind).toBe('infinite');
  });

  it('une inégalité toujours vraie ou toujours fausse est reconnue', () => {
    expect(classify(parse('2x + 5 > 2x + 1')).kind).toBe('infinite');
    expect(classify(parse('2x + 1 > 2x + 5')).kind).toBe('none');
  });

  it('reconnaît la forme résolue', () => {
    expect(classify(parse('x = 4')).kind).toBe('solved');
    expect(classify(parse('2x = 8')).kind).toBe('unique');
  });
});

describe('applyOperation — la même opération des deux côtés', () => {
  it('retranche puis divise : 2x + 3 = 11 → x = 4', () => {
    expect(run('2x + 3 = 11', [['subtract', 3], ['divide', 2]])).toBe('x = 4');
  });

  it('ajoute : x − 3 = 7 → x = 10', () => {
    expect(run('x - 3 = 7', [['add', 3]])).toBe('x = 10');
  });

  it('multiplie : x/4 = 3 → x = 12', () => {
    expect(run('x/4 = 3', [['multiply', 4]])).toBe('x = 12');
  });

  it('accepte une valeur fractionnaire', () => {
    expect(run('2x = 3', [['multiply', 1, 2]])).toBe('x = 3/2');
  });

  it('refuse de multiplier par zéro ou de diviser par zéro', () => {
    const equation = parse('2x = 8');
    expect(applyOperation(equation, { kind: 'multiply', value: R.ZERO }).error.code).toBe('multiplyByZero');
    expect(applyOperation(equation, { kind: 'divide', value: R.ZERO }).error.code).toBe('divideByZero');
  });

  it('ne change pas l’équation d’origine (état immuable)', () => {
    const equation = parse('2x + 3 = 11');
    applyOperation(equation, { kind: 'subtract', value: R.makeRational(3) });
    expect(equationToText(equation)).toBe('2x + 3 = 11');
  });
});

describe('inégalités — le sens se retourne', () => {
  it('2x > 6 → x > 3, sans retournement', () => {
    const result = applyOperation(parse('2x > 6'), { kind: 'divide', value: R.makeRational(2) });
    expect(result.flipped).toBe(false);
    expect(equationToText(result.equation)).toBe('x > 3');
  });

  it('−2x > 6 ÷(−2) → x < −3 : LE point du chapitre', () => {
    const result = applyOperation(parse('-2x > 6'), { kind: 'divide', value: R.makeRational(-2) });
    expect(result.flipped).toBe(true);
    expect(equationToText(result.equation)).toBe('x < −3');
  });

  it('multiplier par un négatif retourne aussi le sens', () => {
    const result = applyOperation(parse('x <= 4'), { kind: 'multiply', value: R.makeRational(-1) });
    expect(result.flipped).toBe(true);
    expect(equationToText(result.equation)).toBe('−x ≥ −4');
  });

  it('ajouter ou retrancher ne retourne JAMAIS le sens, même un négatif', () => {
    const result = applyOperation(parse('x + 3 > 7'), { kind: 'add', value: R.makeRational(-3) });
    expect(result.flipped).toBe(false);
    expect(equationToText(result.equation)).toBe('x > 4');
  });

  it('classe une inégalité déjà résolue en tenant compte du sens', () => {
    const verdict = classify(parse('-2x > 6'));
    expect(verdict.relation).toBe('<');
    expect(R.toPlainText(verdict.solution)).toBe('−3');
  });

  it('flipRelation laisse l’égalité intacte', () => {
    expect(flipRelation('=')).toBe('=');
    expect(flipRelation('<')).toBe('>');
    expect(flipRelation('>=')).toBe('<=');
  });
});

describe('écriture', () => {
  it('écrit comme un manuel, sans 1x ni + −3', () => {
    expect(equationToLatex(parse('1x + 0 = 4'))).toBe('x = 4');
    expect(equationToLatex(parse('x - 3 = 7'))).toBe('x - 3 = 7');
    expect(equationToLatex(parse('-x = 5'))).toBe('-x = 5');
    expect(equationToLatex(parse('x/3 = 5'))).toBe('\\frac{1}{3}x = 5');
    expect(equationToLatex(parse('2x <= 10'))).toBe('2x \\leq 10');
  });

  it('sameEquation distingue deux états', () => {
    expect(sameEquation(parse('2x = 8'), parse('2x = 8'))).toBe(true);
    expect(sameEquation(parse('2x = 8'), parse('x = 4'))).toBe(false);
    expect(sameEquation(parse('x > 3'), parse('x < 3'))).toBe(false);
  });
});
