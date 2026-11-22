import { describe, it, expect } from 'vitest';
import {
  compileSequenceExpression, normalizeSource, stripLeftHandSide, parseNumberInput,
  EXPLICIT_VARIABLES, RECURRENCE_VARIABLES, SECOND_ORDER_VARIABLES,
} from './sequenceExpression.js';

/**
 * L'ÉCRITURE LIBRE (§31) et sa sûreté (§32).
 *
 * Le point capital de ce fichier : on ne teste PAS une grammaire — celle du
 * grapheur est déjà testée chez elle (`expressionParser.test.js`). On teste
 * le BRANCHEMENT : que `n`, `u` et `v` soient liés aux bonnes valeurs, que la
 * notation du cahier soit acceptée, et qu'aucune saisie ne soit exécutée.
 */

describe('les variables liées selon la forme', () => {
  it('une explicite ne connaît que n', () => {
    const compiled = compileSequenceExpression('2n + 1', { explicit: true });
    expect(compiled.ok).toBe(true);
    expect(compiled.variables).toEqual([...EXPLICIT_VARIABLES]);
    expect(compiled.evaluate(0)).toBe(1);
    expect(compiled.evaluate(5)).toBe(11);
  });

  it('une récurrence du premier ordre connaît u (le terme courant) et n', () => {
    const compiled = compileSequenceExpression('2u + n', { order: 1 });
    expect(compiled.variables).toEqual([...RECURRENCE_VARIABLES]);
    // evaluate(previous, n)
    expect(compiled.evaluate(3, 0)).toBe(6);
    expect(compiled.evaluate(3, 4)).toBe(10);
  });

  it('une récurrence du second ordre connaît u (le plus récent), v (le précédent) et n', () => {
    const compiled = compileSequenceExpression('u + v', { order: 2 });
    expect(compiled.variables).toEqual([...SECOND_ORDER_VARIABLES]);
    // evaluate(previous, beforePrevious, n)
    expect(compiled.evaluate(5, 3, 0)).toBe(8);
  });

  it('u n’est PAS lié dans une explicite : l’élève ne peut pas s’en servir par accident', () => {
    expect(compileSequenceExpression('u + 1', { explicit: true }).ok).toBe(false);
  });
});

describe('la notation du cahier (§31, §44)', () => {
  it('accepte u(n+1) = 2u(n) − 1, membre gauche compris', () => {
    const compiled = compileSequenceExpression('u(n+1) = 2u(n) - 1');
    expect(compiled.ok).toBe(true);
    expect(compiled.source).toBe('2u - 1');
    expect(compiled.evaluate(3, 0)).toBe(5);
  });

  it('accepte les indices Unicode : uₙ₊₁ = uₙ + 3', () => {
    const compiled = compileSequenceExpression('uₙ₊₁ = uₙ + 3');
    expect(compiled.ok).toBe(true);
    expect(compiled.evaluate(2, 0)).toBe(5);
  });

  it('accepte les indices soulignés : u_{n+1} = u_n / 2', () => {
    const compiled = compileSequenceExpression('u_{n+1} = u_n / 2');
    expect(compiled.ok).toBe(true);
    expect(compiled.evaluate(8, 0)).toBe(4);
  });

  it('au second ordre, u(n+1) est le plus récent et u(n) le précédent', () => {
    // Fibonacci écrit comme dans le manuel
    const compiled = compileSequenceExpression('u(n+2) = u(n+1) + u(n)', { order: 2 });
    expect(compiled.ok).toBe(true);
    expect(compiled.source).toBe('u + v');
    expect(compiled.evaluate(5, 3, 0)).toBe(8);
  });

  it('ne coupe PAS à un « = » qui n’est pas un membre gauche de définition', () => {
    expect(stripLeftHandSide('2n + 1')).toBe('2n + 1');
    expect(stripLeftHandSide('u(n+1) = 2u')).toBe(' 2u');
    // une équation quelconque n'est pas une définition de suite : on ne la
    // décapite pas en silence
    expect(stripLeftHandSide('3x + 2 = 5')).toBe('3x + 2 = 5');
  });

  it('normalise les commandes LaTeX de MathLive', () => {
    expect(normalizeSource('u\\left(n\\right)')).toBe('u');
  });

  it('accepte le LaTeX que MathLive produit', () => {
    const compiled = compileSequenceExpression('\\frac{u}{2} + 3');
    expect(compiled.ok).toBe(true);
    expect(compiled.evaluate(8, 0)).toBe(7);
  });
});

describe('la sûreté : aucune exécution, aucune exception (§31, §32)', () => {
  it('ne contient NI eval NI new Function — la règle de §31, vérifiée sur le CODE', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const source = readFileSync(fileURLToPath(new URL('./sequenceExpression.js', import.meta.url)), 'utf8');
    // On retire les commentaires avant de chercher : l'en-tête du module
    // PARLE de `new Function` pour dire qu'il n'en fait pas, et une
    // vérification qui attrape sa propre documentation ne vérifie rien.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    expect(code).not.toMatch(/\beval\s*\(/);
    expect(code).not.toMatch(/new\s+Function/);
    expect(code).not.toMatch(/setTimeout\s*\(\s*['"`]/);
  });

  it('une expression incomplète est refusée avec un code, pas une exception', () => {
    for (const source of ['2u +', '(u + 1', 'u^', '/2']) {
      const compiled = compileSequenceExpression(source);
      expect(compiled.ok, source).toBe(false);
      expect(typeof compiled.error.code, source).toBe('string');
    }
  });

  it('un symbole inconnu est nommé, pour que l’interface puisse le montrer', () => {
    const compiled = compileSequenceExpression('foo(u)');
    expect(compiled.ok).toBe(false);
    expect(compiled.error.code).toBe('unknownSymbol');
  });

  it('une saisie vide est « empty », pas une erreur de syntaxe', () => {
    expect(compileSequenceExpression('').error.code).toBe('empty');
    expect(compileSequenceExpression('   ').error.code).toBe('empty');
    expect(compileSequenceExpression(null).error.code).toBe('empty');
    expect(compileSequenceExpression(undefined).error.code).toBe('empty');
  });

  it('hors domaine, la fonction rend un NON FINI — elle ne lève jamais (§32)', () => {
    // Ce qui compte n'est pas que ce soit précisément NaN : c'est que ce ne
    // soit JAMAIS un nombre utilisable, et jamais une exception. `generate`
    // arrête la suite sur tout non fini (`sequenceMath.test.js`), donc
    // −Infinity de ln(0) et NaN de 1/0 mènent au même arrêt propre.
    expect(compileSequenceExpression('1/u').evaluate(0, 0)).toBeNaN();
    expect(compileSequenceExpression('sqrt(u)').evaluate(-4, 0)).toBeNaN();
    expect(Number.isFinite(compileSequenceExpression('ln(u)').evaluate(0, 0))).toBe(false);
    expect(Number.isFinite(compileSequenceExpression('u^u').evaluate(1e6, 0))).toBe(false);
  });

  it('une règle hors domaine ARRÊTE la suite au lieu de la remplir d’infinis', async () => {
    const { generate } = await import('./sequenceMath.js');
    const compiled = compileSequenceExpression('ln(u - 1)');
    const run = generate({ kind: 'recurrence', startIndex: 0, initial: [1], step: compiled.evaluate }, 6);
    expect(run.terms.map((term) => term.value)).toEqual([1]);
    expect(run.stopped.reason).toBe('undefined');
  });

  it('une expression constante est licite : u(n) = 5 est une suite', () => {
    const compiled = compileSequenceExpression('5', { explicit: true });
    expect(compiled.ok).toBe(true);
    expect(compiled.evaluate(7)).toBe(5);
  });

  it('une saisie démesurément longue est refusée sans peiner', () => {
    const compiled = compileSequenceExpression(`${'u+'.repeat(5000)}1`);
    // Qu'elle passe ou non, elle ne doit ni lever ni boucler sans fin.
    expect(typeof compiled.ok).toBe('boolean');
  });
});

describe('les nombres tapés par un élève (§44)', () => {
  it('accepte la virgule décimale et le vrai signe moins', () => {
    expect(parseNumberInput('2,5')).toBe(2.5);
    expect(parseNumberInput('−3')).toBe(-3);
    expect(parseNumberInput('−2,5')).toBe(-2.5);
  });

  it('accepte les chiffres arabes-indiens', () => {
    expect(parseNumberInput('٣')).toBe(3);
    expect(parseNumberInput('١٢')).toBe(12);
  });

  it('accepte une fraction simple', () => {
    expect(parseNumberInput('1/2')).toBe(0.5);
    expect(parseNumberInput('-3/4')).toBe(-0.75);
    expect(parseNumberInput('1/0')).toBeNaN();
  });

  it('refuse ce qui n’est pas un nombre — l’appelant gardera l’ancienne valeur', () => {
    expect(parseNumberInput('abc')).toBeNaN();
    expect(parseNumberInput('')).toBeNaN();
    expect(parseNumberInput(null)).toBeNaN();
    expect(parseNumberInput(Number.NaN)).toBeNaN();
    expect(parseNumberInput(Number.POSITIVE_INFINITY)).toBeNaN();
  });

  it('laisse passer un nombre déjà numérique', () => {
    expect(parseNumberInput(7)).toBe(7);
    expect(parseNumberInput(-0.5)).toBe(-0.5);
  });
});
