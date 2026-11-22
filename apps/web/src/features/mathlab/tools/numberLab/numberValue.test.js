import { describe, it, expect } from 'vitest';
import {
  representationsOf, valueToX, xToValue, viewBounds, ticksFor, tickStepFor,
  snapValue, snapToFraction, compareValues, absoluteValue, frameValues, formatNumber, valueFromInput,
} from './numberValue.js';
import { makeFrac } from './fraction.js';

/** §63 « Number line » : mise en correspondance, comparaisons, distances. */

describe('§46, §47 — une valeur, plusieurs représentations', () => {
  it('1/2 est AUSSI 0,5 et 50 %', () => {
    const rep = representationsOf(makeFrac(1, 2));
    expect(rep.decimalText).toBe('0,5');
    expect(rep.percent).toBe(50);
    expect(rep.value).toBe(0.5);
    expect(rep.exactDecimal).toBe(true);
  });

  it('1/3 dit la VÉRITÉ : son décimal ne tombe pas juste', () => {
    const rep = representationsOf(makeFrac(1, 3));
    expect(rep.exactDecimal).toBe(false);
    expect(rep.decimalText).toBe('0,(3)');
  });

  it('2/4 sait qu’il n’est pas réduit', () => {
    const rep = representationsOf(makeFrac(2, 4));
    expect(rep.alreadySimplified).toBe(false);
    expect(rep.simplifyFactor).toBe(2);
    expect(rep.reduced).toEqual({ n: 1, d: 2 });
  });

  it('le formatage suit la plateforme : virgule et VRAI moins (§58)', () => {
    expect(formatNumber(-1.5)).toBe('−1,5');
    expect(formatNumber(1000)).toBe('1000');
  });
});

describe('la mise en correspondance valeur ↔ position', () => {
  const view = { center: 0, span: 10 };

  it('aller et revenir rend la même valeur', () => {
    for (const value of [-5, -1.25, 0, 0.5, 3, 4.99]) {
      const x = valueToX(value, view, 600, 30);
      expect(xToValue(x, view, 600, 30)).toBeCloseTo(value, 9);
    }
  });

  it('le centre de la fenêtre tombe au milieu du dessin', () => {
    expect(valueToX(0, view, 600, 30)).toBeCloseTo(300, 6);
  });

  it('une fenêtre dégénérée ne casse rien', () => {
    expect(() => viewBounds({ center: 0, span: 0 })).not.toThrow();
    expect(viewBounds(null).span).toBeGreaterThan(0);
  });

  it('les graduations sont « rondes » et bornées', () => {
    expect(tickStepFor(10)).toBe(1);
    expect(tickStepFor(100)).toBe(10);
    expect(tickStepFor(2)).toBe(0.2);
    const { ticks } = ticksFor({ center: 0, span: 1e6 });
    expect(ticks.length).toBeLessThanOrEqual(80);
  });

  it('le zéro est EXACTEMENT zéro — jamais « −0 »', () => {
    const { ticks } = ticksFor({ center: 0, span: 10 });
    expect(ticks.filter((t) => Object.is(t, -0))).toHaveLength(0);
    expect(ticks).toContain(0);
  });
});

describe('§7 — l’accrochage', () => {
  it('accroche aux quarts, ce qui rend 1/4 atteignable au doigt', () => {
    expect(snapValue(0.26, { snapDenominator: 4 })).toBe(0.25);
    expect(snapToFraction(0.26, 4)).toEqual({ n: 1, d: 4 });
  });

  it('accroche aux TIERS — inatteignables autrement', () => {
    expect(snapToFraction(0.33, 3)).toEqual({ n: 1, d: 3 });
  });

  /**
   * La RÉGRESSION du QA visuel : au clavier, un pas plus petit que la grille
   * d'accrochage était ramené à sa valeur de départ — la flèche ne faisait
   * rien, et le mode était inutilisable sans souris (§59).
   */
  it('§59 — un pas égal à la grille DÉPLACE vraiment le point', () => {
    const start = 0.5;
    const denominator = 4;
    const unit = 1 / denominator;
    const moved = snapValue(start + unit, { snapDenominator: denominator, tolerance: 0.5 });
    expect(moved).not.toBe(start);
    expect(moved).toBe(0.75);
  });

  it('et un pas PLUS PETIT que la grille serait annulé — ce qui était le bug', () => {
    expect(snapValue(0.5 + 0.05, { snapDenominator: 4, tolerance: 0.5 })).toBe(0.5);
  });
});

describe('§45 — comparer, mesurer, encadrer', () => {
  it('compare exactement et rend la DISTANCE', () => {
    const comparison = compareValues(makeFrac(3, 5), makeFrac(4, 7));
    expect(comparison.sign).toBe('>');
    expect(comparison.difference).toEqual({ n: 1, d: 35 });
  });

  it('deux écritures de la même valeur sont égales', () => {
    expect(compareValues(makeFrac(1, 2), makeFrac(2, 4)).equal).toBe(true);
  });

  it('§44 — la valeur absolue est une distance à zéro', () => {
    expect(absoluteValue(makeFrac(-7, 1))).toMatchObject({ distance: 7 });
    expect(absoluteValue(makeFrac(-7, 1)).frac).toEqual({ n: 7, d: 1 });
  });
});

describe('le cadrage : un point n’est JAMAIS hors champ', () => {
  it('encadre les valeurs qu’on lui donne', () => {
    const view = frameValues([0, 360]);
    const { min, max } = viewBounds(view);
    expect(min).toBeLessThanOrEqual(0);
    expect(max).toBeGreaterThanOrEqual(360);
  });

  it('une seule valeur ne donne pas une fenêtre plate', () => {
    expect(frameValues([5]).span).toBeGreaterThan(0);
    expect(frameValues([]).span).toBeGreaterThan(0);
  });
});

describe('la saisie', () => {
  it('accepte toutes les écritures d’un même nombre', () => {
    for (const text of ['0,5', '1/2', '50%', '0.5']) {
      expect(valueFromInput(text)?.frac).toBeTruthy();
    }
  });

  it('rend null sur ce qui n’est pas un nombre', () => {
    expect(valueFromInput('abc')).toBeNull();
  });
});
