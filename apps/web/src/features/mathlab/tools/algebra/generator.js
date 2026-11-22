/**
 * Le GÉNÉRATEUR d'équations de l'atelier d'algèbre — logique pure, sans React.
 *
 * « Nouvelle équation » doit rendre un exercice de manuel, pas une équation
 * tirée au hasard : une équation pédagogique se reconnaît à ce qu'elle
 * ÉVITE.
 *
 *   niveau 1   x + a = b        l'inconnue seule, une opération
 *   niveau 2   a·x = b          le coefficient, une division
 *   niveau 3   a·x + b = c      les deux — le cœur du chapitre
 *   niveau 4   a·x + b = c·x + d   l'inconnue des deux côtés
 *   niveau 5   a(x + b) = c   ou   a(x + b) = c·x + d   des parenthèses à développer
 *   niveau 6   x/p ± x/q = r   des fractions à réduire au même dénominateur
 *
 * Les niveaux 5 et 6 rendent une SAISIE (`source`) avec ses parenthèses ou
 * ses fractions : c'est elle que le laboratoire montre développée
 * (« Développer et réduire chaque membre ») avant le travail sur la balance.
 *
 * Les garde-fous, tous délibérés :
 *   — la solution est un ENTIER de [−10, 10] : l'élève doit pouvoir
 *     vérifier de tête, pas découvrir 47/13 à la fin ;
 *   — aucun coefficient nul (`0x + 3 = 5` n'est pas une équation) ;
 *   — aucun coefficient 1 pour les niveaux 2 et 3 (sinon il n'y a rien à
 *     diviser, et le niveau s'effondre sur le précédent) ;
 *   — au niveau 4, a ≠ c, sinon l'inconnue disparaît et l'exercice devient
 *     « aucune solution » — un cas à RENCONTRER, pas à tirer au sort ;
 *   — une solution nulle reste possible mais rare : `x = 0` surprend, et
 *     c'est bien, mais un exercice sur deux serait décourageant.
 *
 * Le tirage est injectable (`random`) pour que les tests soient
 * déterministes — même discipline que simulationEngine.js du laboratoire de
 * probabilités.
 */

import * as R from './rational.js';
import { makeLinear } from './linearForm.js';
import { equationToText, parseEquation } from './equation.js';
import { lcmInt } from './polynomial.js';

export const LEVELS = Object.freeze([1, 2, 3, 4, 5, 6]);

/** Les niveaux d'une inéquation : les quatre premiers, le sens tiré au hasard. */
export const INEQUALITY_LEVELS = Object.freeze([1, 2, 3, 4]);
const INEQUALITY_RELATIONS = Object.freeze(['<', '>', '<=', '>=']);
export const DEFAULT_LEVEL = 3;

const SOLUTION_MIN = -10;
const SOLUTION_MAX = 10;
const COEFFICIENT_MAX = 9;

function pickInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** Un coefficient non nul, et ≠ 1 quand le niveau a besoin d'une vraie division. */
function pickCoefficient(random, { allowOne }) {
  for (;;) {
    const value = pickInt(random, -COEFFICIENT_MAX, COEFFICIENT_MAX);
    if (value === 0) continue;
    if (!allowOne && Math.abs(value) === 1) continue;

    return value;
  }
}

/** Une solution entière lisible ; zéro seulement une fois sur dix. */
function pickSolution(random) {
  const value = pickInt(random, SOLUTION_MIN, SOLUTION_MAX);
  if (value !== 0) return value;

  return random() < 0.1 ? 0 : pickInt(random, 1, SOLUTION_MAX);
}

/**
 * Une équation du niveau demandé, construite À PARTIR de sa solution : on
 * choisit x, puis des coefficients, et on calcule le membre qui fait
 * l'égalité. L'équation tombe donc toujours juste par construction — jamais
 * de tirage-rejet, jamais de fraction surprise.
 *
 * @param {{level?: number, relation?: string, random?: () => number}} [options]
 * @returns {{equation: object, source: string, level: number, solution: number}}
 */
export function generateEquation(options = {}) {
  const level = LEVELS.includes(options.level) ? options.level : DEFAULT_LEVEL;
  const random = typeof options.random === 'function' ? options.random : Math.random;
  const relation = options.relation ?? '=';
  const x = pickSolution(random);
  if (level === 5 || level === 6) return generateWritten(level, x, random, relation);

  let left;
  let right;

  if (level === 1) {
    // x + b = c
    const b = pickCoefficient(random, { allowOne: true });
    left = makeLinear(R.ONE, R.makeRational(b));
    right = makeLinear(R.ZERO, R.makeRational(x + b));
  } else if (level === 2) {
    // a·x = c
    const a = pickCoefficient(random, { allowOne: false });
    left = makeLinear(R.makeRational(a), R.ZERO);
    right = makeLinear(R.ZERO, R.makeRational(a * x));
  } else if (level === 3) {
    // a·x + b = c
    const a = pickCoefficient(random, { allowOne: false });
    const b = pickCoefficient(random, { allowOne: true });
    left = makeLinear(R.makeRational(a), R.makeRational(b));
    right = makeLinear(R.ZERO, R.makeRational(a * x + b));
  } else {
    // a·x + b = c·x + d, avec a ≠ c pour que l'inconnue survive.
    const a = pickCoefficient(random, { allowOne: true });
    let c = pickCoefficient(random, { allowOne: true });
    let guard = 0;
    while (c === a && guard < 32) { c = pickCoefficient(random, { allowOne: true }); guard += 1; }
    if (c === a) c = a === COEFFICIENT_MAX ? a - 1 : a + 1;
    const b = pickCoefficient(random, { allowOne: true });
    const d = (a - c) * x + b;
    left = makeLinear(R.makeRational(a), R.makeRational(b));
    right = makeLinear(R.makeRational(c), R.makeRational(d));
  }

  const equation = { left, right, relation };

  return { equation, source: equationToText(equation), level, solution: x };
}

const REL_TEXT = { '=': '=', '<': '<', '>': '>', '<=': '<=', '>=': '>=' };

/** `3(x - 2)` : un coefficient devant une parenthèse, écrit comme au tableau. */
function bracket(a, b) {
  const head = a === 1 ? '' : (a === -1 ? '-' : String(a));

  return `${head}(x ${b < 0 ? '-' : '+'} ${Math.abs(b)})`;
}

function linearText(c, d) {
  const head = c === 1 ? 'x' : (c === -1 ? '-x' : `${c}x`);
  if (d === 0) return head;

  return `${head} ${d < 0 ? '-' : '+'} ${Math.abs(d)}`;
}

/** Les niveaux « écrits » : la saisie d'abord, l'équation réduite ensuite (par l'analyseur). */
function generateWritten(level, solution, random, relation) {
  let source;
  let x = solution;
  const rel = REL_TEXT[relation] ?? '=';
  if (level === 5) {
    const a = pickCoefficient(random, { allowOne: false });
    const b = pickCoefficient(random, { allowOne: true });
    if (random() < 0.5) {
      source = `${bracket(a, b)} ${rel} ${a * (x + b)}`;
    } else {
      let c = pickCoefficient(random, { allowOne: true });
      if (c === a) c = a === COEFFICIENT_MAX ? a - 1 : a + 1;
      const d = a * (x + b) - c * x;
      source = `${bracket(a, b)} ${rel} ${linearText(c, d)}`;
    }
  } else {
    // Des dénominateurs dont le PPCM reste ≤ 10 : la solution garde la borne [−10, 10] des autres niveaux.
    const pairs = [[2, 3], [3, 2], [2, 4], [4, 2], [2, 5], [5, 2], [2, 6], [3, 6], [6, 3]];
    const [p, q] = pairs[Math.floor(random() * pairs.length)];
    const minus = random() < 0.35;
    const common = lcmInt(p, q);
    const k = pickInt(random, 1, Math.max(1, Math.floor(SOLUTION_MAX / common))) * (random() < 0.3 ? -1 : 1);
    x = k * common;
    const r = minus ? x / p - x / q : x / p + x / q;
    source = `x/${p} ${minus ? '-' : '+'} x/${q} ${rel} ${r}`;
  }
  const parsed = parseEquation(source);

  return { equation: parsed.equation, source, level, solution: x };
}

/** Une inéquation d'un niveau 1–4, le sens tiré au hasard. */
export function generateInequality(options = {}) {
  const random = typeof options.random === 'function' ? options.random : Math.random;
  const level = INEQUALITY_LEVELS.includes(options.level) ? options.level : DEFAULT_LEVEL;
  const relation = INEQUALITY_RELATIONS[Math.floor(random() * INEQUALITY_RELATIONS.length)];

  return generateEquation({ level, relation, random });
}
