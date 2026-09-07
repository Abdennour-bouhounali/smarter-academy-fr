import { describe, it, expect } from 'vitest';
import { SACS, sacTotal, pRougeSachant, pBleueSachant, pChemin, pCouleur, arbreBilles, BRIQUES, SITUATIONS } from './data';

/**
 * Ces tests protègent les affirmations chiffrées des modules ET les
 * propriétés qui rendent la leçon démonstrative (déséquilibre des sacs,
 * écart au piège de la moyenne).
 */

describe('les deux sacs', () => {
  it('a des lois de premier niveau qui somment à 1', () => {
    expect(SACS.A.p + SACS.B.p).toBeCloseTo(1, 10);
  });

  it('a des branches de second niveau qui somment à 1 pour chaque sac', () => {
    for (const s of ['A', 'B']) {
      expect(pRougeSachant(s) + pBleueSachant(s)).toBeCloseTo(1, 10);
    }
  });

  it('donne des compositions NETTEMENT différentes', () => {
    // Sans cet écart, le conditionnement du second niveau serait invisible.
    expect(Math.abs(pRougeSachant('A') - pRougeSachant('B'))).toBeGreaterThan(0.2);
  });

  it('a un premier niveau DÉSÉQUILIBRÉ', () => {
    // Sinon l'élève pourrait répondre par symétrie sans utiliser l'arbre.
    expect(Math.abs(SACS.A.p - SACS.B.p)).toBeGreaterThan(0.1);
  });

  it('compte 6 billes dans A et 8 dans B', () => {
    expect(sacTotal('A')).toBe(6);
    expect(sacTotal('B')).toBe(8);
  });
});

describe('chemins et événements', () => {
  it('donne les quatre produits cités : 0,30 · 0,30 · 0,10 · 0,30', () => {
    expect(pChemin('A', 'rouge')).toBeCloseTo(0.3, 10);
    expect(pChemin('A', 'bleue')).toBeCloseTo(0.3, 10);
    expect(pChemin('B', 'rouge')).toBeCloseTo(0.1, 10);
    expect(pChemin('B', 'bleue')).toBeCloseTo(0.3, 10);
  });

  it('a une somme de tous les chemins égale à 1', () => {
    const total = ['A', 'B'].flatMap((s) => ['rouge', 'bleue'].map((c) => pChemin(s, c)))
      .reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('donne P(rouge) = 0,40 — et NON la moyenne naïve 0,375', () => {
    expect(pCouleur('rouge')).toBeCloseTo(0.4, 10);
    const moyenneNaive = (pRougeSachant('A') + pRougeSachant('B')) / 2;
    expect(moyenneNaive).toBeCloseTo(0.375, 10);
    // L'écart doit être assez net pour que le distracteur soit distinguable.
    expect(Math.abs(pCouleur('rouge') - moyenneNaive)).toBeGreaterThan(0.02);
  });

  it('a des couleurs dont les probabilités somment à 1', () => {
    expect(pCouleur('rouge') + pCouleur('bleue')).toBeCloseTo(1, 10);
  });

  it('produit un arbre au format de ProbabilityTree', () => {
    const tree = arbreBilles();
    expect(tree).toHaveLength(2);
    for (const b of tree) {
      expect(b.children.reduce((a, c) => a + c.p, 0)).toBeCloseTo(1, 10);
    }
    expect(tree.reduce((a, b) => a + b.p, 0)).toBeCloseTo(1, 10);
  });
});

describe('briques du constructeur', () => {
  it('propose deux étapes par niveau et des intrus', () => {
    expect(BRIQUES.filter((b) => b.level === 1)).toHaveLength(2);
    expect(BRIQUES.filter((b) => b.level === 2)).toHaveLength(2);
    expect(BRIQUES.filter((b) => b.level === 0).length).toBeGreaterThan(0);
  });
});

describe('situations du module 5', () => {
  it('a des arbres valides (branches sommant à 1)', () => {
    for (const s of SITUATIONS) {
      expect(s.tree.reduce((a, b) => a + b.p, 0)).toBeCloseTo(1, 10);
      for (const b of s.tree) expect(b.children.reduce((a, c) => a + c.p, 0)).toBeCloseTo(1, 10);
    }
  });

  it('annonce une réponse égale à la somme des chemins favorables', () => {
    // Le premier enfant de chaque branche est l'issue « favorable » citée.
    for (const s of SITUATIONS) {
      const total = s.tree.reduce((a, b) => a + b.p * b.children[0].p, 0);
      expect(total).toBeCloseTo(s.answer, 10);
    }
  });

  it('donne des réponses qui contredisent la moyenne non pondérée', () => {
    for (const s of SITUATIONS) {
      const naive = s.tree.reduce((a, b) => a + b.children[0].p, 0) / s.tree.length;
      expect(Math.abs(naive - s.answer)).toBeGreaterThan(0.02);
    }
  });
});
