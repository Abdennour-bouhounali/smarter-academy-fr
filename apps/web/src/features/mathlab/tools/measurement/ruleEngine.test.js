import { describe, it, expect } from 'vitest';
import * as R from './ruleEngine.js';

/** Une observation, telle que le tableau la garde. */
const observe = (values, id = null) => ({ id, values });

/** Les observations du cahier (§2) : trois rectangles. */
const RECTANGLES = [
  observe({ length: 3, width: 2, area: 6 }, 'a'),
  observe({ length: 4, width: 2, area: 8 }, 'b'),
  observe({ length: 4, width: 3, area: 12 }, 'c'),
  observe({ length: 5, width: 3, area: 15 }, 'd'),
];

const AREA_RULE = R.operation('*', R.variable('length'), R.variable('width'));
const WRONG_RULE = R.operation('+', R.variable('length'), R.variable('width'));

describe('l’évaluation d’une règle', () => {
  it('évalue un produit de variables', () => {
    expect(R.evaluateRule(AREA_RULE, { length: 7, width: 4 })).toBe(28);
  });

  it('évalue π × d', () => {
    const rule = R.operation('*', R.constant('pi'), R.variable('diameter'));
    expect(R.evaluateRule(rule, { diameter: 4 })).toBeCloseTo(12.566370, 5);
  });

  it('évalue une puissance', () => {
    expect(R.evaluateRule(R.power(R.variable('edge'), 3), { edge: 3 })).toBe(27);
    expect(R.evaluateRule(R.power(R.variable('r'), 2), { r: 5 })).toBe(25);
  });

  it('rend NaN — jamais 0 — quand une variable manque', () => {
    // Une règle incomplète ne PRÉDIT rien. Prédire 0 mettrait un ✗ trompeur
    // en face d'une observation, comme si l'élève s'était trompé.
    expect(Number.isNaN(R.evaluateRule(AREA_RULE, { length: 4 }))).toBe(true);
  });

  it('rend NaN pour une division par zéro', () => {
    const rule = R.operation('/', R.variable('a'), R.variable('b'));
    expect(Number.isNaN(R.evaluateRule(rule, { a: 4, b: 0 }))).toBe(true);
  });
});

describe('l’écriture d’une règle', () => {
  const symbols = { length: 'L', width: 'l', base: 'b', height: 'h' };
  const symbolOf = (name) => symbols[name] ?? name;

  it('écrit le produit avec le vrai signe ×', () => {
    expect(R.formatRule(AREA_RULE, symbolOf)).toBe('L × l');
  });

  it('écrit base × hauteur ÷ 2', () => {
    const rule = R.operation('/', R.operation('*', R.variable('base'), R.variable('height')), R.number(2));
    expect(R.formatRule(rule, symbolOf)).toBe('b × h ÷ 2');
  });

  it('ne pose des parenthèses que là où elles changent le sens', () => {
    const needed = R.operation('*', R.number(2), R.operation('+', R.variable('length'), R.variable('width')));
    expect(R.formatRule(needed, symbolOf)).toBe('2 × (L + l)');

    const notNeeded = R.operation('+', R.operation('*', R.variable('length'), R.variable('width')), R.number(2));
    expect(R.formatRule(notNeeded, symbolOf)).toBe('L × l + 2');
  });

  it('écrit π et les puissances', () => {
    const rule = R.operation('*', R.constant('pi'), R.power(R.variable('r'), 2));
    expect(R.formatRule(rule, (n) => n)).toBe('π × r²');
  });

  it('montre un trou plutôt que d’inventer', () => {
    expect(R.formatRule(R.operation('*', R.variable('length'), null), symbolOf)).toBe('L × …');
  });
});

describe('l’épreuve d’une règle (§20)', () => {
  it('reconnaît une règle qui tient sur toutes les observations', () => {
    const result = R.testRule(AREA_RULE, RECTANGLES, 'area');
    expect(result.verdict).toBe('holds');
    expect(result.passed).toBe(4);
    expect(result.failed).toBe(0);
    expect(result.counterexample).toBeNull();
  });

  it('DONNE un contre-exemple utile pour une règle fausse (§7)', () => {
    const result = R.testRule(WRONG_RULE, RECTANGLES, 'area');
    expect(result.verdict).toBe('fails');
    expect(result.failed).toBeGreaterThan(0);
    // Ce n'est pas « incorrect » : c'est une LIGNE, avec les deux nombres
    // que l'élève doit comparer lui-même.
    const counter = result.counterexample;
    expect(counter).not.toBeNull();
    expect(counter.measured).toBe(15);
    expect(counter.predicted).toBe(8);
    expect(counter.values).toMatchObject({ length: 5, width: 3 });
  });

  it('choisit toujours le MÊME contre-exemple pour le même état', () => {
    // Aucun hasard : deux élèves sur le même tableau voient la même ligne.
    const first = R.testRule(WRONG_RULE, RECTANGLES, 'area').counterexample;
    const second = R.testRule(WRONG_RULE, RECTANGLES, 'area').counterexample;
    expect(first.id).toBe(second.id);
  });

  it('dit « incomplete » pour une règle à trou, pas « faux »', () => {
    const hole = R.operation('*', R.variable('length'), null);
    expect(R.testRule(hole, RECTANGLES, 'area').verdict).toBe('incomplete');
  });

  it('dit « empty » quand il n’y a rien à confronter', () => {
    expect(R.testRule(AREA_RULE, [], 'area').verdict).toBe('empty');
  });

  it('tolère la mesure approchée sans laisser passer une règle fausse', () => {
    // Une circonférence lue au centième : π × d doit tenir.
    const rows = [
      observe({ diameter: 4, circumference: 12.57 }),
      observe({ diameter: 6, circumference: 18.85 }),
    ];
    const rule = R.operation('*', R.constant('pi'), R.variable('diameter'));
    expect(R.testRule(rule, rows, 'circumference').verdict).toBe('holds');

    // 3 × d est PROCHE mais faux : la tolérance ne doit pas l'absoudre.
    const almost = R.operation('*', R.number(3), R.variable('diameter'));
    expect(R.testRule(almost, rows, 'circumference').verdict).toBe('fails');
  });
});

describe('deux écritures, une seule relation (§8)', () => {
  const names = ['length', 'width'];

  it('reconnaît L × l et l × L', () => {
    const swapped = R.operation('*', R.variable('width'), R.variable('length'));
    expect(R.sameRelation(AREA_RULE, swapped, names)).toBe(true);
  });

  it('reconnaît L + l + L + l, 2L + 2l et 2 × (L + l) comme UNE règle', () => {
    const longhand = R.operation('+',
      R.operation('+', R.variable('length'), R.variable('width')),
      R.operation('+', R.variable('length'), R.variable('width')));
    const doubled = R.operation('+',
      R.operation('*', R.number(2), R.variable('length')),
      R.operation('*', R.number(2), R.variable('width')));
    const factored = R.operation('*', R.number(2), R.operation('+', R.variable('length'), R.variable('width')));

    expect(R.sameRelation(longhand, doubled, names)).toBe(true);
    expect(R.sameRelation(longhand, factored, names)).toBe(true);
    expect(R.sameRelation(doubled, factored, names)).toBe(true);
  });

  it('sépare L × l de L + l', () => {
    expect(R.sameRelation(AREA_RULE, WRONG_RULE, names)).toBe(false);
  });

  it('sépare a³ de 3a — ce qu’un échantillon symétrique manquerait', () => {
    const cube = R.power(R.variable('a'), 3);
    const triple = R.operation('*', R.number(3), R.variable('a'));
    expect(R.sameRelation(cube, triple, ['a'])).toBe(false);
  });

  it('reconnaît a³ et a × a × a', () => {
    const cube = R.power(R.variable('a'), 3);
    const product = R.operation('*', R.operation('*', R.variable('a'), R.variable('a')), R.variable('a'));
    expect(R.sameRelation(cube, product, ['a'])).toBe(true);
  });

  it('sépare 2L + 2l de L + 3l (un échantillon symétrique les confondrait)', () => {
    const correct = R.operation('+',
      R.operation('*', R.number(2), R.variable('length')),
      R.operation('*', R.number(2), R.variable('width')));
    const wrong = R.operation('+',
      R.variable('length'),
      R.operation('*', R.number(3), R.variable('width')));
    expect(R.sameRelation(correct, wrong, names)).toBe(false);
  });
});

describe('la relecture d’une règle stockée', () => {
  it('relit un arbre valide', () => {
    expect(R.normalizeRule(JSON.parse(JSON.stringify(AREA_RULE)))).toEqual(AREA_RULE);
  });

  it('rejette un opérateur inconnu', () => {
    expect(R.normalizeRule({ kind: 'op', op: '^^', left: R.number(1), right: R.number(2) })).toBeNull();
  });

  it('rejette un arbre trop profond plutôt que d’exploser la pile', () => {
    let deep = R.number(1);
    for (let i = 0; i < 40; i += 1) deep = R.operation('+', deep, R.number(1));
    expect(R.normalizeRule(deep)).toBeNull();
  });

  it('rejette une constante inventée', () => {
    expect(R.normalizeRule({ kind: 'const', name: 'e' })).toBeNull();
  });

  it('n’exécute jamais du texte', () => {
    // Il n'y a pas d'analyseur syntaxique : une chaîne n'est pas une règle.
    expect(R.normalizeRule('length * width')).toBeNull();
    expect(R.normalizeRule({ kind: 'var', name: 'constructor' })).toEqual(R.variable('constructor'));
    // …et une variable exotique s'évalue en NaN, pas en une fonction.
    expect(Number.isNaN(R.evaluateRule(R.variable('constructor'), {}))).toBe(true);
  });
});

describe('isComplete', () => {
  it('distingue une règle finie d’une règle à trou', () => {
    expect(R.isComplete(AREA_RULE)).toBe(true);
    expect(R.isComplete(R.operation('*', R.variable('length'), null))).toBe(false);
    expect(R.isComplete(null)).toBe(false);
  });
});
