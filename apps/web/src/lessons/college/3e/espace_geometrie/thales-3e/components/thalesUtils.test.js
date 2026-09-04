import { describe, it, expect } from 'vitest';
import {
  TOL, thalesPoint, constructN, freeN, ratiosOf, ratiosAgree, twoRatiosAgree,
  parallelMatchesRatios, isParallelMNBC, isPapillon,
  fourthProportional, roundTenth, coherenceCheck,
  PROOF_TEMPLATES, checkProof, FIGURES, BOX, RECONNAISSANCE, dist,
} from './thalesUtils';

const near = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);
const { A, B, C } = FIGURES.triangle;

describe('construction de la configuration', () => {
  it('M se place au bon paramètre sur (AB)', () => {
    const M = thalesPoint(A, B, 0.5);
    near(dist(A, M), dist(A, B) / 2, 1e-9);
  });

  it('N est CONSTRUIT : (MN) est parallèle à (BC) par construction', () => {
    for (const k of [0.2, 0.35, 0.5, 0.8]) {
      const M = thalesPoint(A, B, k);
      const N = constructN(A, B, C, M);
      expect(N, `k=${k}`).not.toBeNull();
      expect(isParallelMNBC(B, C, M, N), `k=${k}`).toBe(true);
    }
  });

  it('un k négatif donne la configuration papillon', () => {
    const M = thalesPoint(A, B, -0.4);
    expect(isPapillon(A, B, M)).toBe(true);
    const N = constructN(A, B, C, M);
    expect(isParallelMNBC(B, C, M, N)).toBe(true);
  });

  it('un k positif reste dans la configuration triangle', () => {
    expect(isPapillon(A, B, thalesPoint(A, B, 0.4))).toBe(false);
  });
});

describe('L’INVARIANT CENTRAL — les rapports ne bougent pas', () => {
  it('les trois rapports valent k, quel que soit k', () => {
    for (const k of [0.2, 0.35, 0.5, 0.75, 0.9]) {
      const M = thalesPoint(A, B, k);
      const N = constructN(A, B, C, M);
      const r = ratiosOf(A, B, C, M, N);
      near(r.am, k, 1e-9);
      near(r.an, k, 1e-9);
      near(r.mn, k, 1e-9);
      expect(ratiosAgree(r), `k=${k}`).toBe(true);
    }
  });

  it('ils restent égaux quand on change la FORME du triangle', () => {
    for (const fig of Object.values(FIGURES)) {
      const M = thalesPoint(fig.A, fig.B, 0.4);
      const N = constructN(fig.A, fig.B, fig.C, M);
      expect(ratiosAgree(ratiosOf(fig.A, fig.B, fig.C, M, N))).toBe(true);
    }
  });

  it('ils restent égaux dans la configuration papillon', () => {
    const M = thalesPoint(A, B, -0.5);
    const N = constructN(A, B, C, M);
    const r = ratiosOf(A, B, C, M, N);
    expect(ratiosAgree(r)).toBe(true);
    near(r.am, 0.5, 1e-9);   // la longueur AM vaut bien la moitié de AB
  });

  it('INVARIANT : rapports égaux ⟺ (MN) ∥ (BC), même eps des deux côtés', () => {
    const cases = [];
    // Configurations construites (parallèles).
    for (const k of [0.25, 0.5, 0.7, -0.4]) {
      const M = thalesPoint(A, B, k);
      cases.push([M, constructN(A, B, C, M)]);
    }
    // Configurations libres (N choisi indépendamment de M).
    for (const [k1, k2] of [[0.3, 0.6], [0.5, 0.2], [0.4, 0.75], [0.6, 0.6]]) {
      cases.push([thalesPoint(A, B, k1), freeN(A, C, k2)]);
    }
    for (const [M, N] of cases) {
      expect(parallelMatchesRatios(A, B, C, M, N), JSON.stringify({ M, N })).toBe(true);
    }
  });

  it('quand N est libre au MÊME paramètre, les droites redeviennent parallèles', () => {
    const M = thalesPoint(A, B, 0.45);
    const N = freeN(A, C, 0.45);
    expect(isParallelMNBC(B, C, M, N)).toBe(true);
    expect(ratiosAgree(ratiosOf(A, B, C, M, N))).toBe(true);
  });

  it('et à un paramètre différent, les deux échouent ENSEMBLE', () => {
    const M = thalesPoint(A, B, 0.45);
    const N = freeN(A, C, 0.7);
    expect(isParallelMNBC(B, C, M, N)).toBe(false);
    expect(ratiosAgree(ratiosOf(A, B, C, M, N))).toBe(false);
  });
});

describe('rapports chiffrés', () => {
  it('compare deux rapports d’un énoncé', () => {
    expect(twoRatiosAgree(4 / 10, 6 / 15)).toBe(true);
    expect(twoRatiosAgree(4 / 10, 6 / 14)).toBe(false);
    expect(twoRatiosAgree(null, 0.4)).toBe(false);
  });

  it('résout une quatrième proportionnelle par produit en croix', () => {
    // AM/AB = MN/BC avec AM=3, AB=9, BC=12 → MN = 4
    near(fourthProportional({ a: 3, b: 9, c: null, d: 12 }), 4, 1e-9);
    near(fourthProportional({ a: null, b: 9, c: 4, d: 12 }), 3, 1e-9);
  });

  it('arrondit au dixième', () => {
    expect(roundTenth(4.04)).toBe(4);
    expect(roundTenth(4.06)).toBe(4.1);
  });

  it('contrôle la cohérence : une réduction raccourcit', () => {
    expect(coherenceCheck(0.5, 12, 6)).toBe(true);
    expect(coherenceCheck(0.5, 12, 20)).toBe(false);   // plus long : impossible
    expect(coherenceCheck(2, 12, 24)).toBe(true);
  });
});

describe('rédaction', () => {
  it('accepte les deux suites correctes', () => {
    expect(checkProof(PROOF_TEMPLATES.direct.correct, 'direct').ok).toBe(true);
    expect(checkProof(PROOF_TEMPLATES.reciproque.correct, 'reciproque').ok).toBe(true);
  });

  it('refuse une suite fautive et situe l’erreur', () => {
    const r = checkProof(['d-config', 'piege-reciproque', 'p-thales', 'c-calcul'], 'direct');
    expect(r.ok).toBe(false);
    expect(r.firstWrong).toBe(1);
  });

  it('les distracteurs encodent de vraies confusions', () => {
    const direct = PROOF_TEMPLATES.direct.steps.filter((s) => s.role === 'piege').map((s) => s.id);
    // Invoquer la réciproque quand on doit invoquer le théorème direct.
    expect(direct).toContain('piege-reciproque');
    // Soustraire les longueurs au lieu d'appliquer un rapport.
    expect(direct).toContain('piege-somme');
    // Inverser le produit en croix.
    expect(direct).toContain('piege-inverse');

    const rec = PROOF_TEMPLATES.reciproque.steps.filter((s) => s.role === 'piege').map((s) => s.id);
    // Invoquer le direct dans une réciproque, c'est supposer le parallélisme.
    expect(rec).toContain('piege-direct2');
    // Comparer des différences au lieu de rapports.
    expect(rec).toContain('piege-diff');
  });

  it('le piège du produit en croix inversé donne bien un résultat absurde', () => {
    // (9 × 12) / 3 = 36, plus long que BC alors qu'il s'agit d'une réduction.
    const faux = (9 * 12) / 3;
    expect(coherenceCheck(3 / 9, 12, faux)).toBe(false);
  });
});

describe('les figures de la leçon', () => {
  it('tiennent dans le cadre', () => {
    for (const [nom, f] of Object.entries(FIGURES)) {
      for (const p of [f.A, f.B, f.C]) {
        expect(p.x, nom).toBeGreaterThanOrEqual(BOX.xMin);
        expect(p.x, nom).toBeLessThanOrEqual(BOX.xMax);
        expect(p.y, nom).toBeGreaterThanOrEqual(BOX.yMin);
        expect(p.y, nom).toBeLessThanOrEqual(BOX.yMax);
      }
    }
  });

  it('les points M et N restent visibles pour tout k utile', () => {
    for (const fig of Object.values(FIGURES)) {
      for (const k of [0.2, 0.5, 0.85, -0.3]) {
        const M = thalesPoint(fig.A, fig.B, k);
        const N = constructN(fig.A, fig.B, fig.C, M);
        for (const p of [M, N]) {
          expect(p.x).toBeGreaterThan(BOX.xMin - 60);
          expect(p.x).toBeLessThan(BOX.xMax + 60);
          expect(p.y).toBeGreaterThan(BOX.yMin - 60);
          expect(p.y).toBeLessThan(BOX.yMax + 60);
        }
      }
    }
  });

  it('la reconnaissance propose des cas valides ET invalides', () => {
    expect(RECONNAISSANCE.some((r) => r.valide)).toBe(true);
    expect(RECONNAISSANCE.some((r) => !r.valide)).toBe(true);
    expect(RECONNAISSANCE.some((r) => r.kind === 'papillon')).toBe(true);
  });
});
