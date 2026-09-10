/**
 * Le noyau binomial, vérifié CONTRE UN CALCUL EXACT.
 *
 * Le point sensible n'est pas la formule — elle tient en une ligne — mais la
 * PRÉCISION : un coefficient binomial calculé par factorielles devient faux en
 * silence dès n = 21, et une somme de pmf qui ne fait pas 1 signale une erreur
 * d'implémentation qu'aucun contrôle d'affichage ne rattraperait.
 *
 * Les références sont calculées en BigInt (exactes par construction), jamais
 * recopiées d'une table : un test qui recopie ne teste que la copie.
 */
import { describe, it, expect } from 'vitest';
import {
  binomialCoeff, binomialPmf, binomialCdf, binomialExpectation,
  binomialVariance, binomialSd, binomialLaw,
} from './binomial';
import { expectation, lawStandardDeviation, probabilitySum } from './randomVariable';

/** C(n, k) exact, en BigInt — la référence contre laquelle on mesure. */
function coeffExact(n, k) {
  if (k < 0 || k > n) return 0n;
  let num = 1n;
  let den = 1n;
  const kk = BigInt(Math.min(k, n - k));
  for (let i = 1n; i <= kk; i += 1n) {
    num *= BigInt(n) - kk + i;
    den *= i;
  }
  return num / den;
}

describe('binomialCoeff — multiplicatif, jamais par factorielles', () => {
  it('les cas de bord : C(n,0) = C(n,n) = 1, et 0 hors des bornes', () => {
    for (let n = 0; n <= 12; n += 1) {
      expect(binomialCoeff(n, 0)).toBe(1);
      expect(binomialCoeff(n, n)).toBe(1);
    }
    expect(binomialCoeff(5, -1)).toBe(0);
    expect(binomialCoeff(5, 6)).toBe(0);
    expect(binomialCoeff(0, 0)).toBe(1);
  });

  it('EXACT jusqu’à n = 50, balayé sur tous les k — comparé à un BigInt', () => {
    for (let n = 0; n <= 50; n += 1) {
      for (let k = 0; k <= n; k += 1) {
        expect(binomialCoeff(n, k)).toBe(Number(coeffExact(n, k)));
      }
    }
  });

  it('C(50,25) reste un entier sûr, là où 50! est hors de portée', () => {
    const c = binomialCoeff(50, 25);
    expect(c).toBe(126410606437752);
    expect(Number.isSafeInteger(c)).toBe(true);
    // 21! dépasse déjà MAX_SAFE_INTEGER : la voie « factorielles » est morte
    // bien avant n = 50, et c'est la raison d'être de la boucle multiplicative.
    let fact = 1;
    for (let i = 1; i <= 21; i += 1) fact *= i;
    expect(fact).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
  });

  it('symétrie C(n,k) = C(n,n−k), balayée', () => {
    for (let n = 0; n <= 40; n += 1) {
      for (let k = 0; k <= n; k += 1) {
        expect(binomialCoeff(n, k)).toBe(binomialCoeff(n, n - k));
      }
    }
  });

  it('récurrence de Pascal C(n,k) = C(n−1,k−1) + C(n−1,k), balayée', () => {
    for (let n = 1; n <= 40; n += 1) {
      for (let k = 1; k < n; k += 1) {
        expect(binomialCoeff(n, k)).toBe(binomialCoeff(n - 1, k - 1) + binomialCoeff(n - 1, k));
      }
    }
  });

  it('rejette les arguments non entiers ou n négatif', () => {
    expect(() => binomialCoeff(5.5, 2)).toThrow();
    expect(() => binomialCoeff(5, 2.5)).toThrow();
    expect(() => binomialCoeff(-1, 0)).toThrow();
  });
});

describe('binomialPmf — la loi somme à 1', () => {
  const COUPLES = [
    [1, 0.5], [3, 0.5], [5, 0.2], [4, 0.25], [10, 0.5], [10, 0.1],
    [20, 0.3], [30, 0.7], [50, 0.5], [50, 0.02], [7, 0.13],
  ];

  it('Σ_k P(X = k) = 1 à 1e-12 près, pour chaque couple (n, p)', () => {
    for (const [n, p] of COUPLES) {
      let s = 0;
      for (let k = 0; k <= n; k += 1) s += binomialPmf(n, k, p);
      expect(Math.abs(s - 1)).toBeLessThan(1e-12);
    }
  });

  it('les cas k = 0 et k = n valent (1−p)^n et p^n', () => {
    for (const [n, p] of COUPLES) {
      expect(binomialPmf(n, 0, p)).toBeCloseTo((1 - p) ** n, 15);
      expect(binomialPmf(n, n, p)).toBeCloseTo(p ** n, 15);
    }
  });

  it('un nombre de succès impossible a une probabilité NULLE, pas indéfinie', () => {
    expect(binomialPmf(5, 6, 0.2)).toBe(0);
    expect(binomialPmf(5, -1, 0.2)).toBe(0);
  });

  it('p = 0 et p = 1 sont des lois certaines, sans NaN', () => {
    expect(binomialPmf(5, 0, 0)).toBe(1);
    expect(binomialPmf(5, 3, 0)).toBe(0);
    expect(binomialPmf(5, 5, 1)).toBe(1);
    expect(binomialPmf(5, 2, 1)).toBe(0);
  });

  it('symétrie de la loi quand p = 0,5 : P(X = k) = P(X = n − k)', () => {
    for (const n of [4, 5, 10, 17]) {
      for (let k = 0; k <= n; k += 1) {
        expect(binomialPmf(n, k, 0.5)).toBeCloseTo(binomialPmf(n, n - k, 0.5), 15);
      }
    }
  });

  it('n = 5, p = 0,2 : les six valeurs décimales EXACTES que la leçon affiche', () => {
    // 0,8^5 = 0,32768 ; 5×0,2×0,8^4 = 0,4096 ; 10×0,04×0,512 = 0,2048 ;
    // 10×0,008×0,64 = 0,0512 ; 5×0,0016×0,8 = 0,0064 ; 0,2^5 = 0,00032.
    const attendu = [0.32768, 0.4096, 0.2048, 0.0512, 0.0064, 0.00032];
    attendu.forEach((v, k) => expect(binomialPmf(5, k, 0.2)).toBeCloseTo(v, 12));
    expect(attendu.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });

  it('rejette une probabilité hors de [0 ; 1] ou un n non entier', () => {
    expect(() => binomialPmf(5, 2, 1.2)).toThrow();
    expect(() => binomialPmf(5, 2, -0.1)).toThrow();
    expect(() => binomialPmf(5.5, 2, 0.2)).toThrow();
    expect(() => binomialPmf(5, 2.5, 0.2)).toThrow();
  });
});

describe('binomialCdf — P(X ≤ k)', () => {
  it('vaut la somme des pmf, balayé sur n et k', () => {
    for (const [n, p] of [[5, 0.2], [10, 0.5], [12, 0.35]]) {
      let acc = 0;
      for (let k = 0; k <= n; k += 1) {
        acc += binomialPmf(n, k, p);
        expect(binomialCdf(n, k, p)).toBeCloseTo(acc, 12);
      }
    }
  });

  it('les bornes sont EXACTES : 0 sous 0, 1 à partir de n', () => {
    expect(binomialCdf(5, -1, 0.2)).toBe(0);
    expect(binomialCdf(5, 5, 0.2)).toBe(1);
    expect(binomialCdf(5, 9, 0.2)).toBe(1);
  });

  it('croissante en k', () => {
    for (let k = 0; k < 20; k += 1) {
      expect(binomialCdf(20, k + 1, 0.3)).toBeGreaterThanOrEqual(binomialCdf(20, k, 0.3));
    }
  });

  it('P(X ≥ 1) = 1 − P(X = 0) : le complémentaire, geste central de la leçon', () => {
    for (const [n, p] of [[5, 0.2], [10, 0.1], [8, 0.45]]) {
      expect(1 - binomialCdf(n, 0, p)).toBeCloseTo(1 - (1 - p) ** n, 12);
    }
  });
});

describe('espérance, variance et écart type binomiaux', () => {
  const COUPLES = [[5, 0.2], [10, 0.5], [20, 0.3], [4, 0.25], [30, 0.7], [50, 0.02]];

  it('E(X) = np coïncide avec Σ k P(X = k), calculée terme à terme', () => {
    for (const [n, p] of COUPLES) {
      let e = 0;
      for (let k = 0; k <= n; k += 1) e += k * binomialPmf(n, k, p);
      expect(binomialExpectation(n, p)).toBeCloseTo(e, 11);
    }
  });

  it('V(X) = np(1−p) coïncide avec Σ (k − np)² P(X = k)', () => {
    for (const [n, p] of COUPLES) {
      const m = n * p;
      let v = 0;
      for (let k = 0; k <= n; k += 1) v += (k - m) ** 2 * binomialPmf(n, k, p);
      expect(binomialVariance(n, p)).toBeCloseTo(v, 10);
    }
  });

  it('σ(X) = √V(X), et V = σ² : les deux sens', () => {
    for (const [n, p] of COUPLES) {
      expect(binomialSd(n, p)).toBeCloseTo(Math.sqrt(binomialVariance(n, p)), 15);
      expect(binomialSd(n, p) ** 2).toBeCloseTo(binomialVariance(n, p), 12);
    }
  });

  it('la variance est maximale en p = 0,5 et nulle aux bords', () => {
    expect(binomialVariance(10, 0)).toBe(0);
    expect(binomialVariance(10, 1)).toBe(0);
    for (const p of [0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 0.9]) {
      expect(binomialVariance(10, p)).toBeLessThan(binomialVariance(10, 0.5));
    }
  });
});

describe('binomialLaw — le pont vers randomVariable', () => {
  it('est une loi de probabilité au sens de randomVariable : Σp = 1', () => {
    for (const [n, p] of [[5, 0.2], [8, 0.5], [12, 0.35]]) {
      const loi = binomialLaw(n, p);
      expect(loi).toHaveLength(n + 1);
      expect(probabilitySum(loi)).toBeCloseTo(1, 12);
    }
  });

  it('expectation et lawStandardDeviation du noyau général retrouvent np et √(np(1−p))', () => {
    for (const [n, p] of [[5, 0.2], [10, 0.5], [20, 0.3]]) {
      const loi = binomialLaw(n, p);
      expect(expectation(loi)).toBeCloseTo(binomialExpectation(n, p), 11);
      expect(lawStandardDeviation(loi)).toBeCloseTo(binomialSd(n, p), 10);
    }
  });
});
