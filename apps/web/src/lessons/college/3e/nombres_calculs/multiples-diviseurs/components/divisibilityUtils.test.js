import { describe, it, expect } from 'vitest';
import {
  layoutRows, isDivisor, isMultiple, divisors, divisorPairs, mirrorThreshold,
  normalizePair, hasPair, divisorsFromPairs,
  isPrime, primesUpTo, sieveStrikes, sievePrimes,
  primeFactors, factorization, productOf, formatFactorization, factorPairOptions,
  makeTree, treeNodeAt, splitNode, treeLeaves, treeComplete, autoTree,
  digitSum, criterion, divisibleByCriterion, multiplesUpTo,
  mergeMin, mergeMax, commonFactors, gcd, lcm, simplifyFraction, formatClock,
} from './divisibilityUtils';

/* ── 1. Rectangles : le reste EST la conséquence visible ─────────── */
describe('layoutRows', () => {
  it('36 chaises en 5 rangées : 7 par rangée, reste 1, pas de rectangle', () => {
    expect(layoutRows(36, 5)).toEqual({ perRow: 7, remainder: 1, isRectangle: false });
  });
  it('36 chaises en 6 rangées : 6 par rangée, reste 0, rectangle complet', () => {
    expect(layoutRows(36, 6)).toEqual({ perRow: 6, remainder: 0, isRectangle: true });
  });
  it('invariant perRow × rows + remainder = n, et 0 ≤ remainder < rows', () => {
    for (let n = 1; n <= 120; n += 1) {
      for (let r = 1; r <= 12; r += 1) {
        const { perRow, remainder, isRectangle } = layoutRows(n, r);
        expect(perRow * r + remainder).toBe(n);
        expect(remainder).toBeGreaterThanOrEqual(0);
        expect(remainder).toBeLessThan(r);
        expect(isRectangle).toBe(remainder === 0 && perRow > 0);
      }
    }
  });
  it('refuse 0 rangée', () => {
    expect(() => layoutRows(36, 0)).toThrow();
  });
});

/* ── 2. Diviseurs et paires ─────────────────────────────────────── */
describe('divisors / divisorPairs / mirrorThreshold', () => {
  it('divisors(36) donne les 9 diviseurs triés', () => {
    expect(divisors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
  });
  it('divisorPairs(36) donne 5 paires a ≤ b, et le miroir est à 6', () => {
    expect(divisorPairs(36)).toEqual([[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]]);
    expect(mirrorThreshold(36)).toBe(6);
  });
  it('divisors(24) = 8 diviseurs, 4 paires, miroir à 5', () => {
    expect(divisors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
    expect(divisorPairs(24)).toHaveLength(4);
    expect(mirrorThreshold(24)).toBe(5);
  });
  it('nombre de diviseurs = 2 × paires − 1 si carré parfait, sinon 2 × paires', () => {
    for (let n = 1; n <= 200; n += 1) {
      const square = Number.isInteger(Math.sqrt(n));
      expect(divisors(n).length).toBe(divisorPairs(n).length * 2 - (square ? 1 : 0));
      divisorPairs(n).forEach(([a, b]) => {
        expect(a * b).toBe(n);
        expect(a).toBeLessThanOrEqual(b);
      });
    }
  });
  it('mirrorThreshold vaut ceil(√n)', () => {
    for (let n = 1; n <= 300; n += 1) expect(mirrorThreshold(n)).toBe(Math.ceil(Math.sqrt(n)));
  });
  it('isDivisor et isMultiple sont la même relation lue à l’envers', () => {
    expect(isDivisor(4, 36)).toBe(true);
    expect(isMultiple(36, 4)).toBe(true);
    expect(isMultiple(4, 36)).toBe(false); // le piège de direction
    expect(isDivisor(5, 36)).toBe(false);
    for (let d = 1; d <= 30; d += 1) {
      for (let n = 1; n <= 60; n += 1) expect(isMultiple(n, d)).toBe(isDivisor(d, n));
    }
  });
  it('normalizePair / hasPair / divisorsFromPairs servent la carte d’identité', () => {
    expect(normalizePair([9, 4])).toEqual([4, 9]);
    expect(hasPair([[4, 9]], [9, 4])).toBe(true);
    expect(hasPair([[4, 9]], [3, 12])).toBe(false);
    expect(divisorsFromPairs([[1, 36], [4, 9], [6, 6]])).toEqual([1, 4, 6, 9, 36]);
  });
});

/* ── 3. Nombres premiers ────────────────────────────────────────── */
describe('isPrime / primesUpTo / crible', () => {
  it('1 n’est pas premier, 2 l’est, 51/57/91 ne le sont pas, 59 l’est', () => {
    expect([1, 2, 51, 57, 59, 91].map(isPrime)).toEqual([false, true, false, false, true, false]);
  });
  it('primesUpTo(50) contient les 15 premiers jusqu’à 50', () => {
    expect(primesUpTo(50)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
    expect(primesUpTo(50)).toHaveLength(15);
  });
  it('barrer les multiples de 2, 3, 5, 7 (à partir de p²) laisse exactement les premiers', () => {
    expect(sievePrimes(50)).toEqual([2, 3, 5, 7]);
    const struck = new Set();
    sievePrimes(50).forEach((p) => sieveStrikes(50, p).forEach((k) => struck.add(k)));
    const survivors = [];
    for (let k = 2; k <= 50; k += 1) if (!struck.has(k)) survivors.push(k);
    expect(survivors).toEqual(primesUpTo(50));
  });
  it('sieveStrikes commence bien à p² : 3 barre 9, 15, 21… mais pas 6', () => {
    expect(sieveStrikes(50, 3)).toEqual([9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48]);
    expect(sieveStrikes(50, 3)).not.toContain(6);
    expect(sieveStrikes(50, 3)).toContain(21); // 21 = 3 × 7, barré par 3
  });
});

/* ── 4. Décomposition en facteurs premiers ──────────────────────── */
describe('primeFactors / factorization / formatFactorization', () => {
  it('60 = 2 × 2 × 3 × 5 et 180 = 2² × 3² × 5', () => {
    expect(primeFactors(60)).toEqual([2, 2, 3, 5]);
    expect(factorization(60)).toEqual([{ p: 2, e: 2 }, { p: 3, e: 1 }, { p: 5, e: 1 }]);
    expect(formatFactorization(180)).toBe('2² × 3² × 5');
    expect(formatFactorization(180, { latex: true })).toBe('2^{2}\\times 3^{2}\\times 5');
    expect(formatFactorization(60, { latex: true })).toBe('2^{2}\\times 3\\times 5');
  });
  it('le produit des facteurs redonne toujours n (2 ≤ n ≤ 400)', () => {
    for (let n = 2; n <= 400; n += 1) {
      expect(primeFactors(n).reduce((a, b) => a * b, 1)).toBe(n);
      expect(productOf(factorization(n))).toBe(n);
    }
  });
  it('91 = 7 × 13 : le faux premier du boss', () => {
    expect(primeFactors(91)).toEqual([7, 13]);
    expect(formatFactorization(91)).toBe('7 × 13');
  });
  it('factorPairOptions(36) exclut 1 × 36 et contient 6 × 6 une seule fois', () => {
    expect(factorPairOptions(36)).toEqual([[2, 18], [3, 12], [4, 9], [6, 6]]);
    expect(factorPairOptions(36).filter(([a, b]) => a === 6 && b === 6)).toHaveLength(1);
    expect(factorPairOptions(36)).not.toContainEqual([1, 36]);
    expect(factorPairOptions(13)).toEqual([]); // un premier n’a aucune coupe
  });
});

/* ── 5. Arbre des facteurs ──────────────────────────────────────── */
describe('arbre des facteurs', () => {
  it('couper 36 en 4 × 9 puis chaque feuille donne les mêmes feuilles que 6 × 6', () => {
    let t = splitNode(makeTree(36), '', [4, 9]);
    expect(treeComplete(t)).toBe(false);
    expect(treeLeaves(t).map((l) => l.value)).toEqual([4, 9]);
    t = splitNode(t, '0', [2, 2]);
    t = splitNode(t, '1', [3, 3]);
    expect(treeComplete(t)).toBe(true);
    const leavesA = treeLeaves(t).map((l) => l.value).sort((a, b) => a - b);

    let u = splitNode(makeTree(36), '', [6, 6]);
    u = splitNode(u, '0', [2, 3]);
    u = splitNode(u, '1', [2, 3]);
    const leavesB = treeLeaves(u).map((l) => l.value).sort((a, b) => a - b);

    expect(leavesA).toEqual(leavesB);
    expect(leavesA).toEqual(primeFactors(36));
  });
  it('treeNodeAt lit un chemin, une coupe invalide ne change rien', () => {
    const t = splitNode(makeTree(36), '', [4, 9]);
    expect(treeNodeAt(t, '').value).toBe(36);
    expect(treeNodeAt(t, '1').value).toBe(9);
    expect(treeNodeAt(t, '11')).toBeNull();
    expect(splitNode(t, '', [2, 18])).toBe(t); // racine déjà coupée
    expect(treeLeaves(splitNode(makeTree(36), '', [5, 7])).map((l) => l.value)).toEqual([36]);
  });
  it('autoTree(60) est complet et ses feuilles sont primeFactors(60)', () => {
    const t = autoTree(60);
    expect(treeComplete(t)).toBe(true);
    expect(treeLeaves(t).map((l) => l.value).sort((a, b) => a - b)).toEqual([2, 2, 3, 5]);
    expect(treeComplete(autoTree(13))).toBe(true);
  });
});

/* ── 6. Critères de divisibilité ────────────────────────────────── */
describe('critères de divisibilité', () => {
  it('digitSum et la forme des critères', () => {
    expect(digitSum(4725)).toBe(18);
    expect(criterion(2)).toEqual({ kind: 'lastDigit', digits: [0, 2, 4, 6, 8] });
    expect(criterion(3)).toEqual({ kind: 'digitSum', modulo: 3 });
    expect(() => criterion(7)).toThrow();
  });
  it('4 725 : divisible par 3, 5 et 9, pas par 2 ni 10 (piège du boss e3)', () => {
    expect([2, 3, 5, 9, 10].map((k) => divisibleByCriterion(4725, k))).toEqual([false, true, true, true, false]);
  });
  it('le critère coïncide avec % pour tout n ≤ 10 000 et k ∈ {2, 3, 5, 9, 10}', () => {
    for (const k of [2, 3, 5, 9, 10]) {
      for (let n = 1; n <= 10000; n += 1) {
        expect(divisibleByCriterion(n, k)).toBe(n % k === 0);
      }
    }
  });
  it('multiplesUpTo(4, 40) donne les 10 multiples de 4 de la droite graduée', () => {
    expect(multiplesUpTo(4, 40)).toEqual([4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);
    expect(multiplesUpTo(3, 10)).toEqual([3, 6, 9]);
  });
});

/* ── 7. PGCD / PPCM depuis les factorisations ───────────────────── */
describe('gcd / lcm / mergeMin / mergeMax', () => {
  it('84 et 126 : facteurs communs 2 × 3 × 7 = 42 ; 12 et 18 : PPCM 36', () => {
    expect(gcd(84, 126)).toBe(42);
    expect(lcm(12, 18)).toBe(36);
    expect(commonFactors(factorization(84), factorization(126))).toEqual([{ p: 2, e: 1 }, { p: 3, e: 1 }, { p: 7, e: 1 }]);
    expect(mergeMin).toBe(commonFactors);
    expect(productOf(mergeMax(factorization(12), factorization(18)))).toBe(36);
  });
  it('gcd(a, b) × lcm(a, b) = a × b sur un échantillon', () => {
    for (let a = 1; a <= 60; a += 1) {
      for (let b = 1; b <= 60; b += 1) expect(gcd(a, b) * lcm(a, b)).toBe(a * b);
    }
  });
  it('12 + 18 = 30 et 12 × 18 = 216 ne sont PAS le PPCM (pièges de M7)', () => {
    expect(lcm(12, 18)).not.toBe(30);
    expect(lcm(12, 18)).not.toBe(216);
    expect(lcm(6, 8)).toBe(24);
    expect(lcm(6, 8)).not.toBe(14);
  });
});

/* ── 8. Simplification de fraction ──────────────────────────────── */
describe('simplifyFraction', () => {
  it('84/126 se simplifie en 2/3 en divisant par 2, 3 puis 7', () => {
    expect(simplifyFraction(84, 126)).toEqual({ num: 2, den: 3, dividedBy: [2, 3, 7] });
  });
  it('42/63 est encore simplifiable, 2/3 ne l’est plus', () => {
    expect(simplifyFraction(42, 63)).toEqual({ num: 2, den: 3, dividedBy: [3, 7] });
    expect(simplifyFraction(2, 3)).toEqual({ num: 2, den: 3, dividedBy: [] });
  });
  it('la valeur de la fraction est conservée', () => {
    for (const [n, d] of [[84, 126], [42, 63], [14, 21], [180, 60], [7, 13]]) {
      const s = simplifyFraction(n, d);
      expect(s.num / s.den).toBeCloseTo(n / d, 12);
    }
  });
});

/* ── 9. Horaires ────────────────────────────────────────────────── */
describe('formatClock', () => {
  it('7 h 00 + 36 min = « 7 h 36 » et les pièges 7 h 30 / 8 h 12 / 7 h 06', () => {
    expect(formatClock(7 * 60 + lcm(12, 18))).toBe('7 h 36');
    expect(formatClock(7 * 60 + 30)).toBe('7 h 30');
    expect(formatClock(7 * 60 + 72)).toBe('8 h 12');
    expect(formatClock(7 * 60 + gcd(12, 18))).toBe('7 h 06');
  });
  it('les minutes sont toujours sur deux chiffres et l’heure passe minuit', () => {
    expect(formatClock(7 * 60)).toBe('7 h 00');
    expect(formatClock(24 * 60 + 5)).toBe('0 h 05');
    expect(() => formatClock(7.5)).toThrow();
  });
});
