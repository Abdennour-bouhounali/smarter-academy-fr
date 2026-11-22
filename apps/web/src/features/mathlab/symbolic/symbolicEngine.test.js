import { describe, it, expect, beforeAll } from 'vitest';
import {
  ensureEngine, isEngineReady, resetQuarantine,
  limitOf, verifiedLimitAtInfinity, derivativeOf, simplifyExpression,
  factorExpression, expandExpression, solveEquation, areEquivalent, antiderivativeOf,
} from './index.js';
import { toSymbolicSource } from './symbolicSyntax.js';
import { compileSource } from '../tools/functionGrapher/expressionEvaluator.js';

const fn = (source) => compileSource(source).fn;

describe('la traduction vers Nerdamer', () => {
  /**
   * On ne bricole PAS des `replace` sur du LaTeX : on passe par l'AST déjà
   * testé du grapheur. Une fraction imbriquée le prouve — une expression
   * régulière y produirait une expression fausse mais analysable.
   */
  it('traduit ce que MathLive produit', () => {
    expect(toSymbolicSource('x^2')).toBe('((x)^(2))');
    expect(toSymbolicSource('\\frac{1}{x}')).toBe('((1)/(x))');
    expect(toSymbolicSource('\\sqrt{x}')).toBe('sqrt(x)');
    expect(toSymbolicSource('\\left|x\\right|')).toBe('abs(x)');
    expect(toSymbolicSource('\\sin\\left(x\\right)')).toBe('sin(x)');
    // `ln` de la plateforme = `log` de Nerdamer ; `log` décimal se pose.
    expect(toSymbolicSource('\\ln(x)')).toBe('log(x)');
    expect(toSymbolicSource('\\log(x)')).toBe('(log(x)/log(10))');
  });

  it('traduit une fraction IMBRIQUÉE sans se tromper', () => {
    const translated = toSymbolicSource('\\frac{\\frac{1}{2}}{x}');
    expect(translated).toBe('((((1)/(2)))/(x))');
  });

  /** Ce que notre analyseur refuse n'atteint jamais le moteur. */
  it('refuse ce qui n’est pas analysable', () => {
    expect(toSymbolicSource('x^^2')).toBeNull();
    expect(toSymbolicSource('((x')).toBeNull();
    expect(toSymbolicSource('')).toBeNull();
    expect(toSymbolicSource(null)).toBeNull();
  });
});

describe('le moteur symbolique', () => {
  beforeAll(async () => {
    await ensureEngine();
  }, 30000);

  it('se charge une fois et se déclare prêt', () => {
    expect(isEngineReady()).toBe(true);
  });

  it('calcule des limites en un point', () => {
    expect(limitOf('\\frac{x^2-1}{x-1}', 1)).toMatchObject({ ok: true, kind: 'finite', value: 2 });
    expect(limitOf('\\frac{\\sin(x)}{x}', 0)).toMatchObject({ ok: true, kind: 'finite', value: 1 });
  });

  it('dérive, simplifie, factorise, développe, résout', () => {
    expect(derivativeOf('x^2')).toMatchObject({ ok: true, text: '2*x' });
    expect(simplifyExpression('\\frac{x^2-1}{x-1}')).toMatchObject({ ok: true, text: '1+x' });
    expect(factorExpression('x^2-4x+3').text).toContain('x');
    expect(expandExpression('(x+1)^2')).toMatchObject({ ok: true });
    expect(solveEquation('x^2-4x+3')).toMatchObject({ ok: true, solutions: ['1', '3'] });
    expect(antiderivativeOf('x^2')).toMatchObject({ ok: true });
  });

  it('décide l’équivalence algébrique', () => {
    expect(areEquivalent('(x+1)^2', 'x^2+2x+1')).toMatchObject({ ok: true, equivalent: true });
    expect(areEquivalent('x^2', 'x^3')).toMatchObject({ ok: true, equivalent: false });
  });

  it('rend un refus, jamais une exception, sur une entrée illisible', () => {
    for (const bad of ['x^^2', '((x', '']) {
      expect(() => limitOf(bad, 0)).not.toThrow();
      expect(limitOf(bad, 0).ok).toBe(false);
    }
  });
});

/**
 * ── LA raison d'être de la vérification ──────────────────────────────────
 *
 * Nerdamer 1.1.13 se trompe sur les limites à l'infini : mesuré, 5 réponses
 * fausses sur 22. Il rend `+∞` pour `2x+1` en −∞, `−∞` pour `x³−3x` en +∞
 * (faux aux DEUX bornes), et `e^Infinity` au lieu de `+∞`. Les formes
 * indéterminées `∞ − ∞` l'arrêtent, et la factorisation qui sauve `x²−4x+3`
 * casse `x³−3x`.
 *
 * `verifiedLimitAtInfinity` confronte donc sa réponse au comportement réel
 * de f. Ces épreuves fixent le contrat : **jamais une réponse fausse** —
 * une réponse juste, ou pas de réponse.
 */
describe('les limites à l’infini sont VÉRIFIÉES avant d’être crues', () => {
  beforeAll(async () => {
    await ensureEngine();
    resetQuarantine();
  }, 30000);

  const read = (result) => {
    if (!result.ok) return null;
    if (result.kind === 'infinite') return result.sign > 0 ? '+inf' : '-inf';

    return result.kind === 'finite' ? String(result.value) : null;
  };

  it.each([
    ['x^2', '+inf', '+inf'],
    ['x^3', '-inf', '+inf'],
    ['3x', '-inf', '+inf'],
    ['x^2-4x+3', '+inf', '+inf'],
    ['\\frac{1}{x}', '0', '0'],
    ['\\frac{2x+1}{x-3}', '2', '2'],
  ])('%s : les deux bornes, ou rien de faux', (source, minus, plus) => {
    const f = fn(source);
    const atMinus = read(verifiedLimitAtInfinity(source, '-inf', f));
    const atPlus = read(verifiedLimitAtInfinity(source, '+inf', f));
    // Une réponse donnée doit être JUSTE ; l'absence de réponse est permise.
    if (atMinus !== null) expect(atMinus, `${source} en −∞`).toBe(minus);
    if (atPlus !== null) expect(atPlus, `${source} en +∞`).toBe(plus);
  });

  /** Les cas où Nerdamer se trompait : on ne rend RIEN plutôt qu'un faux. */
  it.each([
    ['2x+1', '-inf'],
    ['x^3-3x', '+inf'],
    ['\\ln(x)', '-inf'],
  ])('ne croit pas %s en %s', (source, direction) => {
    const result = verifiedLimitAtInfinity(source, direction, fn(source));
    // Soit il refuse, soit sa réponse a passé la vérification numérique.
    if (result.ok) {
      expect(result.verified).toBe(true);
      expect(result.observed).toBeTruthy();
    } else {
      expect(typeof result.reason).toBe('string');
    }
  });

  it('ne rend jamais une limite qu’une mesure contredit', () => {
    // `sin` n'a pas de limite en l'infini : aucune réponse ne doit sortir.
    expect(verifiedLimitAtInfinity('\\sin(x)', '+inf', fn('\\sin(x)')).ok).toBe(false);
  });
});
