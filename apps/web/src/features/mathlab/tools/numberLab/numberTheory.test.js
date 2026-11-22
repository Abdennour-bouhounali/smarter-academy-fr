import { describe, it, expect } from 'vitest';
import * as N from './numberTheory.js';

/**
 * §63 « Number theory » : primalité, factorisation, diviseurs, PGCD, PPCM,
 * divisibilité — et §63 « Rounding », y compris ses cas limites.
 */

describe('PGCD et PPCM', () => {
  it('PGCD(84, 36) = 12', () => {
    expect(N.gcd(84, 36)).toBe(12);
    expect(N.gcd(36, 84)).toBe(12);
  });

  it('gère le zéro et les négatifs', () => {
    expect(N.gcd(0, 5)).toBe(5);
    expect(N.gcd(0, 0)).toBe(0);
    expect(N.gcd(-12, 18)).toBe(6);
    expect(N.lcm(4, 0)).toBe(0);
  });

  it('PPCM(4, 6) = 12 — pas 24', () => {
    expect(N.lcm(4, 6)).toBe(12);
    expect(N.lcm(21, 6)).toBe(42);
  });

  it('les nombres premiers entre eux ont un PGCD de 1 (§29)', () => {
    expect(N.areCoprime(8, 15)).toBe(true);
    expect(N.areCoprime(8, 12)).toBe(false);
  });

  it('deux entiers CONSÉCUTIFS sont toujours premiers entre eux (§29)', () => {
    for (let n = 2; n < 40; n += 1) expect(N.gcd(n, n + 1)).toBe(1);
  });

  it('§31 — PGCD × PPCM = a × b, VÉRIFIÉ et non affirmé', () => {
    for (const [a, b] of [[84, 36], [12, 18], [7, 13], [100, 75], [6, 6]]) {
      const relation = N.gcdLcmRelation(a, b);
      expect(relation.holds, `${a}, ${b}`).toBe(true);
      expect(relation.product).toBe(a * b);
    }
  });
});

describe('§27, §28 — l’algorithme d’Euclide laisse sa TRACE', () => {
  it('PGCD(84, 36) se lit pas à pas', () => {
    const run = N.euclideanAlgorithm(84, 36);
    expect(run.gcd).toBe(12);
    expect(run.steps).toEqual([
      { dividend: 84, divisor: 36, quotient: 2, remainder: 12, square: 36, rest: 12 },
      { dividend: 36, divisor: 12, quotient: 3, remainder: 0, square: 12, rest: 0 },
    ]);
  });

  it('remet les nombres dans l’ordre tout seul', () => {
    expect(N.euclideanAlgorithm(36, 84).steps[0].dividend).toBe(84);
  });

  it('s’arrête tout de suite quand l’un divise l’autre', () => {
    const run = N.euclideanAlgorithm(12, 36);
    expect(run.gcd).toBe(12);
    expect(run.steps).toHaveLength(1);
  });

  it('chaque pas vérifie dividende = quotient × diviseur + reste', () => {
    const run = N.euclideanAlgorithm(1071, 462);
    for (const s of run.steps) {
      expect(s.quotient * s.divisor + s.remainder).toBe(s.dividend);
    }
    expect(run.gcd).toBe(21);
  });

  it('§27 — la méthode des facteurs donne le même PGCD', () => {
    const method = N.factorMethod(84, 36);
    expect(N.factorizationProduct(method.gcd)).toBe(12);
    expect(N.factorizationProduct(method.lcm)).toBe(252);
    expect(method.primes).toEqual([2, 3, 7]);
  });
});

describe('les nombres premiers', () => {
  it('reconnaît les premiers et les composés', () => {
    expect([2, 3, 5, 7, 11, 13, 97, 7919].every(N.isPrime)).toBe(true);
    expect([0, 1, 4, 9, 91, 100, 7917].some(N.isPrime)).toBe(false);
  });

  it('1 n’est PAS premier, et les négatifs non plus', () => {
    expect(N.isPrime(1)).toBe(false);
    expect(N.isPrime(-7)).toBe(false);
    expect(N.isPrime(2.5)).toBe(false);
  });

  it('§22 — le crible raye dans l’ORDRE, à partir de p²', () => {
    const run = N.sievePasses(30);
    expect(run.primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    expect(run.passes[0]).toEqual({ prime: 2, struck: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30] });
    // 3 ne raye plus 6 : 2 l'a déjà fait. C'est le crible d'Ératosthène.
    expect(run.passes[1].struck).toEqual([9, 15, 21, 27]);
  });

  it('aucun nombre n’est rayé deux fois', () => {
    const run = N.sievePasses(200);
    const all = run.passes.flatMap((p) => p.struck);
    expect(new Set(all).size).toBe(all.length);
    expect(all.length + run.primes.length).toBe(199);
  });

  it('refuse un crible plus grand que ce qu’on sait dessiner', () => {
    expect(N.sievePasses(N.MAX_GRID + 1)).toBeNull();
    expect(N.sievePasses(1)).toBeNull();
  });

  it('les premiers voisins (§4)', () => {
    expect(N.nextPrime(360)).toBe(367);
    expect(N.previousPrime(360)).toBe(359);
    expect(N.previousPrime(2)).toBeNull();
  });
});

describe('§23 — la factorisation', () => {
  it('360 = 2³ × 3² × 5', () => {
    const factors = N.primeFactorization(360);
    expect(factors).toEqual([{ p: 2, e: 3 }, { p: 3, e: 2 }, { p: 5, e: 1 }]);
    expect(N.factorizationToLatex(factors)).toBe('2^{3} \\times 3^{2} \\times 5');
    expect(N.factorizationToText(factors)).toBe('2^3 × 3^2 × 5');
  });

  it('un premier est sa propre décomposition', () => {
    expect(N.primeFactorization(97)).toEqual([{ p: 97, e: 1 }]);
  });

  it('le produit des facteurs redonne le nombre — §24 le vérifie', () => {
    for (const n of [2, 12, 360, 1024, 9973, 999983]) {
      expect(N.factorizationProduct(N.primeFactorization(n)), String(n)).toBe(n);
    }
  });

  it('1 et 0 n’ont pas de décomposition', () => {
    expect(N.primeFactorization(1)).toBeNull();
    expect(N.primeFactorization(0)).toBeNull();
  });
});

describe('§25, §26 — diviseurs et couples de facteurs', () => {
  it('les diviseurs de 24, croissants', () => {
    expect(N.divisors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
  });

  it('un carré parfait ne compte pas sa racine deux fois', () => {
    expect(N.divisors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(N.factorPairs(36)).toEqual([[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]]);
  });

  it('les couples de 24 sont ceux de §25', () => {
    expect(N.factorPairs(24)).toEqual([[1, 24], [2, 12], [3, 8], [4, 6]]);
  });

  it('les multiples et les diviseurs communs (§27, §30)', () => {
    expect(N.multiples(4, 5)).toEqual([4, 8, 12, 16, 20]);
    expect(N.commonDivisors(84, 36)).toEqual([1, 2, 3, 4, 6, 12]);
  });
});

describe('§20 — la divisibilité dit POURQUOI', () => {
  it('360 est divisible par 9, et la somme des chiffres le montre', () => {
    const result = N.divisibilityBy(360, 9);
    expect(result.divisible).toBe(true);
    expect(result.quotient).toBe(40);
    expect(result.rule).toBe('digitSum');
    expect(result.evidence).toBe(9);
    expect(result.evidenceText).toBe('3 + 6 + 0');
  });

  it('le critère de 4 porte sur les DEUX derniers chiffres', () => {
    expect(N.divisibilityBy(1324, 4)).toMatchObject({ divisible: true, rule: 'lastTwo', evidence: 24 });
    expect(N.divisibilityBy(1322, 4).divisible).toBe(false);
  });

  it('6 n’a pas de critère propre : c’est 2 ET 3', () => {
    expect(N.divisibilityBy(360, 6).rule).toBe('composite');
  });

  it('le critère de 11 alterne les signes', () => {
    expect(N.divisibilityBy(918082, 11).divisible).toBe(true);
    expect(N.divisibilityBy(121, 11)).toMatchObject({ divisible: true, evidence: 0 });
  });

  it('le reste est toujours positif, même sur un négatif', () => {
    expect(N.divisibilityBy(-7, 3).remainder).toBe(2);
  });

  it('le tableau complet de 360', () => {
    const table = N.divisibilityTable(360);
    const yes = table.filter((r) => r.divisible).map((r) => r.by);
    expect(yes).toEqual([2, 3, 4, 5, 6, 8, 9, 10]);
  });

  it('§21 — la somme des chiffres redescend vers 9', () => {
    expect(N.digitSumChain(9999)).toEqual([9999, 36, 9]);
    expect(N.digitSum(360)).toBe(9);
  });
});

describe('§5, §6 — la valeur de position', () => {
  it('4582 se décompose en milliers, centaines, dizaines, unités', () => {
    expect(N.placeValues(4582)).toEqual([
      { power: 3, digit: 4, value: 4000 },
      { power: 2, digit: 5, value: 500 },
      { power: 1, digit: 8, value: 80 },
      { power: 0, digit: 2, value: 2 },
    ]);
  });

  it('12,347 descend jusqu’aux millièmes (§6)', () => {
    const places = N.placeValues(12.347);
    expect(places.map((p) => p.power)).toEqual([1, 0, -1, -2, -3]);
    expect(places.map((p) => p.digit)).toEqual([1, 2, 3, 4, 7]);
  });

  it('§4 — la décomposition saute les rangs nuls : 360 = 300 + 60', () => {
    expect(N.decomposition(360).map((p) => p.value)).toEqual([300, 60]);
  });
});

describe('§32, §33 — l’arrondi et l’erreur', () => {
  it('7,846 arrondi au dixième donne 7,8 et dit pourquoi', () => {
    const detail = N.roundingDetail(7.846, -1);
    expect(detail.lower).toBe(7.8);
    expect(detail.upper).toBe(7.9);
    expect(detail.midpoint).toBe(7.85);
    expect(detail.rounded).toBe(7.8);
    expect(detail.direction).toBe('down');
  });

  it('au centième, le même nombre monte', () => {
    expect(N.roundingDetail(7.846, -2).rounded).toBe(7.85);
  });

  it('à mi-chemin, on MONTE — la convention du manuel', () => {
    const detail = N.roundingDetail(7.5, 0);
    expect(detail.atMidpoint).toBe(true);
    expect(detail.rounded).toBe(8);
  });

  it('arrondit aussi à la dizaine et à la centaine', () => {
    expect(N.roundingDetail(360, 2).rounded).toBe(400);
    expect(N.roundingDetail(340, 2).rounded).toBe(300);
  });

  it('la troncature n’est PAS l’arrondi (§33)', () => {
    expect(N.truncateTo(7.89, -1)).toBe(7.8);
    expect(N.roundingDetail(7.89, -1).rounded).toBe(7.9);
  });

  it('roundTo ne laisse pas de bruit de flottant', () => {
    expect(N.roundTo(0.1 + 0.2, 6)).toBe(0.3);
    expect(N.roundTo(1.005, 2)).toBe(1.01);
  });

  it('§34 — l’erreur de π ≈ 3,14', () => {
    const error = N.approximationError(Math.PI, 3.14);
    expect(error.absolute).toBeCloseTo(0.0015926, 6);
    expect(error.over).toBe(false);
    expect(error.relative).toBeLessThan(0.001);
  });

  it('l’erreur RELATIVE n’existe pas quand l’exact vaut zéro', () => {
    expect(N.approximationError(0, 0.1).relative).toBeNull();
  });
});
