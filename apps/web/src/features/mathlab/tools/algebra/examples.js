/**
 * Les EXEMPLES de chaque section, rangés par niveau (ExamplePicker du kit
 * partagé). Une saisie ASCII — lue par l'analyseur unique comme ce que
 * l'élève taperait — et son étiquette (texte LTR, chiffres latins).
 */

const ex = (id, level, source, label = source) => ({ id, level, source, label });

export const EQUATION_EXAMPLES = Object.freeze([
  ex('eq-add', 'beginner', 'x + 5 = 12'),
  ex('eq-times', 'beginner', '3x = 15'),
  ex('eq-classic', 'intermediate', '2x + 3 = 11'),
  ex('eq-negative', 'intermediate', '5 - 2x = 11'),
  ex('eq-both', 'intermediate', '4x - 7 = 2x + 5'),
  ex('eq-brackets', 'advanced', '3(x + 2) = 2x - 1'),
  ex('eq-fractions', 'advanced', 'x/2 + x/3 = 5'),
  ex('eq-minus-bracket', 'advanced', '2(x - 1) - (x + 3) = 4'),
]);

export const INEQUALITY_EXAMPLES = Object.freeze([
  ex('in-add', 'beginner', 'x + 4 > 1'),
  ex('in-times', 'beginner', '3x <= 12', '3x ≤ 12'),
  ex('in-flip', 'intermediate', '-2x + 3 < 9'),
  ex('in-flip-eq', 'intermediate', '-x >= 2', '−x ≥ 2'),
  ex('in-both', 'advanced', '5 - 2x > 3x + 20'),
  ex('in-brackets', 'advanced', '2(x - 1) < 3x + 1'),
]);

export const SYSTEM_EXAMPLES = Object.freeze([
  { id: 'sys-sum', level: 'beginner', first: 'x + y = 10', second: 'x - y = 2', label: 'x + y = 10 ; x − y = 2' },
  { id: 'sys-sub', level: 'beginner', first: 'y = 2x - 1', second: 'x + y = 5', label: 'y = 2x − 1 ; x + y = 5' },
  { id: 'sys-combo', level: 'intermediate', first: '2x + 3y = 12', second: '3x - y = 7', label: '2x + 3y = 12 ; 3x − y = 7' },
  { id: 'sys-lcm', level: 'intermediate', first: '3x + 2y = 7', second: '5x - 3y = 18', label: '3x + 2y = 7 ; 5x − 3y = 18' },
  { id: 'sys-fractions', level: 'advanced', first: 'x/2 + y/3 = 2', second: 'x - y = -1', label: 'x/2 + y/3 = 2 ; x − y = −1' },
  { id: 'sys-parallel', level: 'advanced', first: 'x + 2y = 4', second: '2x + 4y = 3', label: 'x + 2y = 4 ; 2x + 4y = 3' },
  { id: 'sys-same', level: 'advanced', first: 'x - y = 1', second: '3x - 3y = 3', label: 'x − y = 1 ; 3x − 3y = 3' },
]);

export const SIMPLIFY_EXAMPLES = Object.freeze([
  ex('si-like', 'beginner', '3x + 2x - 5'),
  ex('si-dist', 'beginner', '2(x + 3) - 4x'),
  ex('si-letters', 'intermediate', '(2a - b) - (a + 3b)'),
  ex('si-two', 'intermediate', '3(x - 2) - 2(x + 1) + 5'),
  ex('si-double', 'intermediate', '(x + 2)(x - 3)'),
  ex('si-square', 'advanced', '(x + 1)^2', '(x + 1)²'),
  ex('si-diff', 'advanced', '(2x - 3)(2x + 3)'),
  ex('si-fraction', 'advanced', '(x^2 - 1)/(x - 1)', '(x² − 1)/(x − 1)'),
]);

export const FACTOR_EXAMPLES = Object.freeze([
  ex('fa-common', 'beginner', '6x^2 + 9x', '6x² + 9x'),
  ex('fa-diff', 'beginner', '4x^2 - 9', '4x² − 9'),
  ex('fa-square', 'intermediate', 'x^2 + 6x + 9', 'x² + 6x + 9'),
  ex('fa-sum-product', 'intermediate', 'x^2 + 5x + 6', 'x² + 5x + 6'),
  ex('fa-combo', 'intermediate', '2x^2 - 8', '2x² − 8'),
  ex('fa-ac', 'advanced', '6x^2 + 5x + 1', '6x² + 5x + 1'),
  ex('fa-irrational', 'advanced', 'x^2 + x - 1', 'x² + x − 1'),
  ex('fa-none', 'advanced', 'x^2 + 1', 'x² + 1'),
]);

export const FUNCTION_EXAMPLES = Object.freeze([
  { id: 'fn-linear', level: 'beginner', label: 'f(x) = 2x', value: { family: 'linear', a: 2, b: 0, c: 0 } },
  { id: 'fn-affine', level: 'beginner', label: 'f(x) = 2x + 1', value: { family: 'affine', a: 2, b: 1, c: 0 } },
  { id: 'fn-decreasing', level: 'intermediate', label: 'f(x) = −0.5x + 3', value: { family: 'affine', a: -0.5, b: 3, c: 0 } },
  { id: 'fn-square', level: 'intermediate', label: 'f(x) = x²', value: { family: 'quadratic', a: 1, b: 0, c: 0 } },
  { id: 'fn-roots', level: 'advanced', label: 'f(x) = x² − 2x − 3', value: { family: 'quadratic', a: 1, b: -2, c: -3 } },
  { id: 'fn-down', level: 'advanced', label: 'f(x) = −x² + 4', value: { family: 'quadratic', a: -1, b: 0, c: 4 } },
]);
