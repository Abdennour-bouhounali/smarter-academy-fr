import { describe, it, expect } from 'vitest';
import {
  TOL, sameLength, sameAngle, triangleTraits, triangleKind, VERTEX_NAMES,
  triangleInequality, thirdVertex, thirdAngle, baseAngles, apexAngle, angleSum,
  midlineOf, PROOF_STEPS, checkProof, FIGURES, BOX, areaOf, dist,
} from './triangleUtils';
import { circleCircleIntersections } from '../../../../../common/utils/geometry2d';

const P = (x, y) => ({ x, y });
const near = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('tolérances', () => {
  it('l’écart absolu est plafonné pour que l’affichage entier ne mente pas', () => {
    // 143 et 141 sur une figure de 190 : 4 % autoriseraient 7,6 px.
    expect(sameLength(143, 141, 190)).toBe(false);
    expect(sameLength(143, 142, 190)).toBe(true);
    expect(TOL.absMax).toBeLessThanOrEqual(1.5);
  });

  it('compare les angles au degré près', () => {
    expect(sameAngle(90, 91)).toBe(true);
    expect(sameAngle(90, 95)).toBe(false);
  });
});

describe('le nom du triangle est CALCULÉ', () => {
  it('reconnaît un triangle quelconque', () => {
    expect(triangleKind(FIGURES.quelconque).id).toBe('quelconque');
  });

  it('reconnaît un isocèle et nomme son sommet principal', () => {
    const k = triangleKind(FIGURES.isocele);
    expect(k.id).toBe('isocele');
    expect(k.label).toBe('triangle isocèle en C');
    const t = triangleTraits(FIGURES.isocele);
    expect(VERTEX_NAMES[t.apex]).toBe('C');
  });

  it('reconnaît un rectangle et nomme le sommet de l’angle droit', () => {
    const k = triangleKind(FIGURES.rectangle);
    expect(k.id).toBe('rectangle');
    expect(k.label).toBe('triangle rectangle en A');
  });

  it('reconnaît un équilatéral', () => {
    expect(triangleKind(FIGURES.equilateral).id).toBe('equilateral');
    const t = triangleTraits(FIGURES.equilateral);
    expect(t.isocele).toBe(true);   // un équilatéral EST isocèle
    t.angles.forEach((a) => expect(Math.abs(a - 60)).toBeLessThan(1));
  });

  it('reconnaît le rectangle isocèle — les deux traits se cumulent', () => {
    const k = triangleKind([P(60, 200), P(220, 200), P(60, 40)]);
    expect(k.id).toBe('rectangle-isocele');
    expect(k.label).toMatch(/rectangle isocèle en A/);
  });

  it('les angles d’un triangle somment toujours 180°, quelle que soit la figure', () => {
    for (const pts of Object.values(FIGURES)) near(angleSum(pts), 180, 1e-6);
    near(angleSum([P(10, 10), P(300, 40), P(120, 230)]), 180, 1e-6);
  });
});

describe('inégalité triangulaire', () => {
  it('accepte les triplets constructibles', () => {
    expect(triangleInequality(3, 4, 5).ok).toBe(true);
    expect(triangleInequality(5, 5, 5).ok).toBe(true);
    expect(triangleInequality(2, 3, 4).ok).toBe(true);
  });

  it('refuse quand un côté est trop long, en le disant', () => {
    expect(triangleInequality(3, 4, 8)).toMatchObject({ ok: false, raison: 'trop-court' });
    expect(triangleInequality(1, 1, 5).ok).toBe(false);
  });

  it('distingue le cas plat du cas impossible', () => {
    expect(triangleInequality(3, 4, 7)).toMatchObject({ ok: false, degenerate: true, raison: 'plat' });
    expect(triangleInequality(2, 2, 4).degenerate).toBe(true);
  });

  it('INVARIANT : les arcs du compas se croisent ⟺ l’inégalité est vérifiée', () => {
    const cases = [[3, 4, 5], [3, 4, 6], [5, 5, 5], [2, 3, 4], [3, 4, 8], [1, 1, 5], [3, 4, 7], [6, 8, 10]];
    for (const [a, b, c] of cases) {
      // [AB] de longueur c ; arcs de rayon b en A et a en B.
      const inter = circleCircleIntersections(P(0, 0), b, P(c, 0), a);
      const ineq = triangleInequality(a, b, c);
      expect(inter.length > 0).toBe(ineq.ok || ineq.degenerate);
    }
  });

  it('thirdVertex construit un triangle aux bonnes longueurs, ou renvoie null', () => {
    const A = P(0, 100); const B = P(120, 100);
    const C = thirdVertex(A, B, 100, 90);
    expect(C).not.toBeNull();
    near(dist(A, C), 100, 1e-9);
    near(dist(B, C), 90, 1e-9);
    expect(thirdVertex(A, B, 20, 20)).toBeNull(); // 20 + 20 < 120
  });

  it('thirdVertex place le sommet au-dessus ou en dessous selon la demande', () => {
    const A = P(0, 200); const B = P(160, 200);
    const up = thirdVertex(A, B, 120, 120, true);
    const down = thirdVertex(A, B, 120, 120, false);
    expect(up.y).toBeLessThan(A.y);
    expect(down.y).toBeGreaterThan(A.y);
  });
});

describe('calculs d’angles', () => {
  it('trouve le troisième angle', () => {
    expect(thirdAngle(40, 70)).toBe(70);
    expect(thirdAngle(90, 35)).toBe(55);
  });

  it('relie l’angle au sommet et les angles à la base d’un isocèle', () => {
    expect(baseAngles(40)).toBe(70);
    expect(apexAngle(70)).toBe(40);
    expect(baseAngles(60)).toBe(60);          // l'équilatéral est un cas particulier
    expect(apexAngle(baseAngles(38))).toBe(38); // aller-retour
  });

  it('les angles aigus d’un triangle rectangle somment 90°', () => {
    const t = triangleTraits(FIGURES.rectangle);
    const aigus = t.angles.filter((a) => a < 89);
    near(aigus.reduce((s, a) => s + a, 0), 90, 1e-6);
  });
});

describe('droite des milieux', () => {
  it('le segment des milieux vaut la moitié du troisième côté', () => {
    const m = midlineOf(FIGURES.quelconque);
    near(m.ratio, 0.5, 1e-9);
    near(m.ij, m.bc / 2, 1e-9);
  });

  it('il est parallèle au troisième côté — calculé, pas affirmé', () => {
    for (const pts of Object.values(FIGURES)) {
      expect(midlineOf(pts).parallel).toBe(true);
    }
  });
});

describe('rédaction d’un raisonnement', () => {
  it('accepte la suite correcte', () => {
    const { correct } = PROOF_STEPS.isocele;
    expect(checkProof(correct).ok).toBe(true);
  });

  it('refuse une suite fautive et indique la première erreur', () => {
    const r = checkProof(['d-isocele', 'piege-60', 'p-somme', 'c-70']);
    expect(r.ok).toBe(false);
    expect(r.firstWrong).toBe(1);
  });

  it('chaque distracteur est une erreur mathématique réelle, pas un remplissage', () => {
    const pieges = PROOF_STEPS.isocele.steps.filter((s) => s.role === 'piege');
    expect(pieges.length).toBeGreaterThanOrEqual(3);
    // « les trois angles valent 60° » confond isocèle et équilatéral ;
    // « 140° » oublie de partager entre les deux angles à la base.
    expect(pieges.map((p) => p.id)).toContain('piege-60');
    expect(pieges.map((p) => p.id)).toContain('piege-140');
  });
});

describe('les figures de la leçon', () => {
  it('tiennent toutes dans le cadre', () => {
    for (const [nom, pts] of Object.entries(FIGURES)) {
      for (const p of pts) {
        expect(p.x, nom).toBeGreaterThanOrEqual(BOX.xMin);
        expect(p.x, nom).toBeLessThanOrEqual(BOX.xMax);
        expect(p.y, nom).toBeGreaterThanOrEqual(BOX.yMin);
        expect(p.y, nom).toBeLessThanOrEqual(BOX.yMax);
      }
    }
  });

  it('ont une aire franche — aucune n’est aplatie', () => {
    for (const [nom, pts] of Object.entries(FIGURES)) {
      expect(areaOf(pts), nom).toBeGreaterThan(2000);
    }
  });

  it('le triangle « quelconque » n’est ni isocèle ni rectangle au départ', () => {
    const t = triangleTraits(FIGURES.quelconque);
    expect(t.isocele).toBe(false);
    expect(t.rectangle).toBe(false);
  });

  it('les angles du quelconque sont assez distincts pour être comparés à l’œil', () => {
    const [a, b, c] = triangleTraits(FIGURES.quelconque).angles;
    const gaps = [Math.abs(a - b), Math.abs(b - c), Math.abs(a - c)];
    expect(Math.min(...gaps)).toBeGreaterThan(8);
  });
});
