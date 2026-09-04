import { describe, it, expect } from 'vitest';
import {
  TOL, VERTEX_NAMES, squareOnSide, squaresOf,
  longestSideIndex, rightVertexIndex, hypotenuseIndex, isRightTriangle,
  balanceOf, balanceMatchesRightAngle, kindFromSides, pythagoreanGap,
  computeHypotenuse, computePythagoreanLeg, roundTenth, isCoherentLeg,
  PROOF_STEPS, checkProof, FIGURES, ORIENTATIONS, BOX,
  dist, sideLengths, polygonArea,
} from './pythagoreUtils';

const P = (x, y) => ({ x, y });
const near = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('construction des carrés', () => {
  it('construit un vrai carré : quatre côtés égaux', () => {
    const sq = squareOnSide(P(0, 0), P(30, 0), P(0, -40));
    const L = sideLengths(sq);
    L.forEach((l) => near(l, 30));
  });

  it('son aire vaut le carré du côté', () => {
    const sq = squareOnSide(P(0, 0), P(30, 40), P(-50, 0));
    near(polygonArea(sq), 50 * 50, 1e-6);
  });

  it('le carré est construit du côté OPPOSÉ au troisième sommet', () => {
    // Triangle avec C au-dessus (y plus petit en SVG) : le carré sur [AB]
    // doit descendre.
    const A = P(0, 0); const B = P(40, 0); const C = P(0, -40);
    const sq = squareOnSide(A, B, C);
    const away = sq.filter((p) => p.y !== 0);
    expect(away.every((p) => p.y > 0)).toBe(true);
  });

  it('reste correct si l’on retourne le triangle', () => {
    const A = P(0, 0); const B = P(40, 0); const C = P(0, 40);
    const sq = squareOnSide(A, B, C);
    const away = sq.filter((p) => p.y !== 0);
    expect(away.every((p) => p.y < 0)).toBe(true);
  });

  it('les trois aires valent les carrés des trois côtés', () => {
    const { areas } = squaresOf(FIGURES.rect345);
    const L = sideLengths(FIGURES.rect345);
    areas.forEach((a, i) => near(a, L[i] * L[i], 1e-6));
  });
});

describe('LA BALANCE — l’invariant central de la leçon', () => {
  it('est à l’équilibre pour un triangle rectangle', () => {
    const b = balanceOf(FIGURES.rect345);
    expect(b.level).toBe(true);
    near(b.sumOthers, b.big, b.big * TOL.areaRatio);
  });

  it('penche du côté des petits carrés quand l’angle est aigu', () => {
    const b = balanceOf(FIGURES.aigu);
    expect(b.level).toBe(false);
    expect(b.tilt).toBe('petits');
  });

  it('penche du côté du grand carré quand l’angle est obtus', () => {
    const b = balanceOf(FIGURES.obtus);
    expect(b.level).toBe(false);
    expect(b.tilt).toBe('grand');
  });

  it('INVARIANT : équilibre ⟺ triangle rectangle, sur des figures variées', () => {
    const cases = [
      FIGURES.rect345, FIGURES.aigu, FIGURES.obtus,
      [P(0, 0), P(60, 0), P(0, 80)],       // rectangle
      [P(10, 10), P(90, 30), P(40, 120)],  // quelconque
      [P(0, 0), P(100, 0), P(50, 5)],      // très aplati
      ...ORIENTATIONS.map((o) => o.pts),
    ];
    for (const pts of cases) {
      expect(balanceMatchesRightAngle(pts), JSON.stringify(pts)).toBe(true);
    }
  });
});

describe('hypoténuse et angle droit', () => {
  it('l’hypoténuse est le côté OPPOSÉ à l’angle droit, pas le côté horizontal', () => {
    // Angle droit en A (indice 0) ⇒ hypoténuse = côté 1, soit [BC].
    const h = hypotenuseIndex(FIGURES.rect345);
    expect(h).toBe(1);
    expect(rightVertexIndex(FIGURES.rect345)).toBe(0);
  });

  it('l’hypoténuse est aussi le plus grand côté', () => {
    for (const o of ORIENTATIONS) {
      const h = hypotenuseIndex(o.pts);
      if (h === null) continue;
      expect(h, o.label).toBe(longestSideIndex(o.pts));
    }
  });

  it('refuse de nommer une hypoténuse dans un triangle non rectangle', () => {
    expect(hypotenuseIndex(FIGURES.aigu)).toBeNull();
    expect(isRightTriangle(FIGURES.aigu)).toBe(false);
  });

  it('les trois orientations « pièges » sont bien rectangles', () => {
    for (const o of ORIENTATIONS) {
      expect(isRightTriangle(o.pts, 3), o.label).toBe(true);
    }
  });

  it('et aucune n’a son hypoténuse horizontale — sinon le piège ne piège rien', () => {
    for (const o of ORIENTATIONS) {
      const h = hypotenuseIndex(o.pts, 3);
      const a = o.pts[h];
      const b = o.pts[(h + 1) % 3];
      const horizontal = Math.abs(a.y - b.y) < 4;
      expect(horizontal, o.label).toBe(false);
    }
  });
});

describe('nature d’un triangle depuis ses côtés', () => {
  it('reconnaît les trois cas', () => {
    expect(kindFromSides(3, 4, 5)).toBe('rectangle');
    expect(kindFromSides(6, 8, 10)).toBe('rectangle');
    expect(kindFromSides(5, 6, 7)).toBe('acutangle');
    expect(kindFromSides(3, 4, 6)).toBe('obtusangle');
  });

  it('l’ordre des côtés donnés n’a pas d’importance', () => {
    expect(kindFromSides(5, 3, 4)).toBe('rectangle');
    expect(kindFromSides(10, 6, 8)).toBe('rectangle');
  });

  it('l’écart de Pythagore est nul pour un rectangle, signé sinon', () => {
    near(pythagoreanGap(3, 4, 5), 0);
    expect(pythagoreanGap(5, 6, 7)).toBeGreaterThan(0);
    expect(pythagoreanGap(3, 4, 6)).toBeLessThan(0);
  });
});

describe('calculs de longueurs', () => {
  it('calcule l’hypoténuse', () => {
    near(computeHypotenuse(3, 4), 5);
    near(computeHypotenuse(6, 8), 10);
  });

  it('calcule un côté de l’angle droit — une SOUSTRACTION', () => {
    near(computePythagoreanLeg(13, 5), 12);
    near(computePythagoreanLeg(10, 6), 8);
  });

  it('arrondit au dixième comme les énoncés le demandent', () => {
    expect(roundTenth(computeHypotenuse(5, 7))).toBe(8.6);
    expect(roundTenth(4.04)).toBe(4);
  });

  it('un côté de l’angle droit est toujours plus court que l’hypoténuse', () => {
    expect(isCoherentLeg(8, 10)).toBe(true);
    expect(isCoherentLeg(12, 10)).toBe(false);
    expect(isCoherentLeg(0, 10)).toBe(false);
  });
});

describe('rédaction de la réciproque', () => {
  it('accepte la suite correcte', () => {
    expect(checkProof(PROOF_STEPS.reciproque.correct).ok).toBe(true);
  });

  it('refuse une suite fautive et situe l’erreur', () => {
    const r = checkProof(['d-cote-long', 'piege-direct', 'c-calc-somme', 'c-conclusion']);
    expect(r.ok).toBe(false);
    expect(r.firstWrong).toBe(1);
  });

  it('les distracteurs sont de vraies erreurs de rédaction', () => {
    const pieges = PROOF_STEPS.reciproque.steps.filter((s) => s.role === 'piege');
    // « D'après le théorème de Pythagore… » suppose ce qu'on cherche à prouver.
    expect(pieges.map((p) => p.id)).toContain('piege-direct');
    // Additionner les longueurs au lieu des carrés.
    expect(pieges.map((p) => p.id)).toContain('piege-somme');
    // Se tromper de sommet de l'angle droit.
    expect(pieges.map((p) => p.id)).toContain('piege-rect-r');
  });
});

describe('les figures de la leçon', () => {
  it('tiennent dans le cadre, carrés compris', () => {
    for (const [nom, pts] of Object.entries(FIGURES)) {
      const { squares } = squaresOf(pts);
      for (const sq of squares) {
        for (const p of sq) {
          expect(p.x, `${nom} x`).toBeGreaterThan(BOX.xMin - 130);
          expect(p.x, `${nom} x`).toBeLessThan(BOX.xMax + 130);
          expect(p.y, `${nom} y`).toBeGreaterThan(BOX.yMin - 130);
          expect(p.y, `${nom} y`).toBeLessThan(BOX.yMax + 130);
        }
      }
    }
  });

  it('rect345 est un vrai 3-4-5', () => {
    const L = sideLengths(FIGURES.rect345).slice().sort((a, b) => a - b);
    const k = L[0] / 3;
    near(L[1] / k, 4, 0.05);
    near(L[2] / k, 5, 0.05);
  });

  it('les figures déformées sont FRANCHEMENT hors équilibre', () => {
    // Sinon l'élève ne verrait pas la balance pencher.
    expect(balanceOf(FIGURES.aigu).gap).toBeGreaterThan(0.1);
    expect(balanceOf(FIGURES.obtus).gap).toBeGreaterThan(0.1);
  });
});
