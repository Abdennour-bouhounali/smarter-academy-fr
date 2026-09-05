import { describe, it, expect } from 'vitest';
import {
  dirOf, toLine, normalizeAngle, relationOf, RELATIONS, RELATION_LABEL, RELATION_SYMBOL,
  intersectionOf, distanceTo, footOf, gapBetween, pointOn,
  parallelThroughPoint, perpendicularThroughPoint, isEquerreAligned, equerreHint,
  dist, angleBetweenDeg,
} from './relationsUtils';

const L = (x, y, angleDeg, name = 'd') => ({ p: { x, y }, angleDeg, name });
const near = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('convention d’angle (locale à cette leçon)', () => {
  it('0° pointe vers la droite, 90° vers le bas de l’écran', () => {
    near(dirOf(0).x, 1); near(dirOf(0).y, 0);
    near(dirOf(90).x, 0); near(dirOf(90).y, 1); // y descend en SVG
  });

  it('normalizeAngle ramène dans [0 ; 180[ — une droite n’a pas de sens', () => {
    expect(normalizeAngle(200)).toBeCloseTo(20, 9);
    expect(normalizeAngle(-30)).toBeCloseTo(150, 9);
    expect(normalizeAngle(180)).toBeCloseTo(0, 9);
  });

  it('deux inclinaisons opposées décrivent la même direction', () => {
    expect(relationOf(L(0, 0, 30), L(0, 60, 210))).toBe(RELATIONS.paralleles);
  });
});

describe('relationOf — le juge unique', () => {
  it('reconnaît deux parallèles distinctes', () => {
    expect(relationOf(L(0, 0, 25), L(0, 50, 25))).toBe(RELATIONS.paralleles);
  });

  it('reconnaît deux perpendiculaires', () => {
    expect(relationOf(L(0, 0, 25), L(0, 0, 115))).toBe(RELATIONS.perpendiculaires);
    expect(relationOf(L(10, 10, 0), L(10, 10, 90))).toBe(RELATIONS.perpendiculaires);
  });

  it('reconnaît deux sécantes quelconques', () => {
    expect(relationOf(L(0, 0, 0), L(0, 0, 40))).toBe(RELATIONS.secantes);
  });

  it('distingue « confondues » de « parallèles »', () => {
    expect(relationOf(L(0, 0, 30), L(0, 0, 30))).toBe(RELATIONS.confondues);
    // Un autre point de la MÊME droite : toujours confondues.
    const same = pointOn(L(0, 0, 30), 80);
    expect(relationOf(L(0, 0, 30), { p: same, angleDeg: 30 })).toBe(RELATIONS.confondues);
  });

  it('gère les verticales, que la comparaison de pentes casserait', () => {
    expect(relationOf(L(4, 0, 90), L(40, 0, 90))).toBe(RELATIONS.paralleles);
    expect(relationOf(L(4, 0, 90), L(4, 0, 0))).toBe(RELATIONS.perpendiculaires);
  });

  it('chaque relation a un libellé et un symbole', () => {
    for (const r of Object.values(RELATIONS)) {
      expect(RELATION_LABEL[r]).toBeTruthy();
      expect(RELATION_SYMBOL[r]).toBeTruthy();
    }
  });
});

describe('l’invariant qui rend la leçon démontrable', () => {
  it('intersectionOf est null EXACTEMENT quand les droites sont parallèles', () => {
    const cases = [
      [L(0, 0, 25), L(0, 50, 25)],     // parallèles
      [L(0, 0, 25), L(0, 0, 115)],     // perpendiculaires
      [L(0, 0, 0), L(0, 0, 40)],       // sécantes
      [L(4, 0, 90), L(40, 0, 90)],     // parallèles verticales
      [L(0, 0, 30), L(0, 0, 30)],      // confondues
    ];
    for (const [a, b] of cases) {
      const rel = relationOf(a, b);
      const parallelish = rel === RELATIONS.paralleles || rel === RELATIONS.confondues;
      expect(intersectionOf(a, b) === null).toBe(parallelish);
    }
  });

  it('quand elles se coupent, le point appartient bien aux deux droites', () => {
    const a = L(0, 100, 0);
    const b = L(60, 0, 90);
    const i = intersectionOf(a, b);
    expect(i).not.toBeNull();
    near(distanceTo(a, i), 0, 1e-6);
    near(distanceTo(b, i), 0, 1e-6);
    near(i.x, 60, 1e-6);
    near(i.y, 100, 1e-6);
  });
});

describe('écart et distance', () => {
  it('la distance à une droite est mesurée perpendiculairement', () => {
    const d = L(0, 100, 0);           // horizontale y = 100
    const q = { x: 40, y: 40 };
    near(distanceTo(d, q), 60, 1e-6);
    const f = footOf(d, q);
    near(f.x, 40, 1e-6);              // le pied est à la verticale de q
    near(f.y, 100, 1e-6);
    near(dist(q, f), distanceTo(d, q), 1e-6);
  });

  it('l’écart entre parallèles est CONSTANT — mesuré n’importe où', () => {
    const d1 = L(0, 0, 20);
    const d2 = L(0, 70, 20);
    const g0 = gapBetween(d1, d2);
    for (const t of [-120, -40, 0, 55, 200]) {
      near(distanceTo(d2, pointOn(d1, t)), g0, 1e-6);
    }
  });

  it('l’écart n’a AUCUN sens pour deux sécantes : null', () => {
    expect(gapBetween(L(0, 0, 0), L(0, 0, 35))).toBeNull();
    expect(gapBetween(L(0, 0, 0), L(0, 0, 90))).toBeNull();
  });
});

describe('constructions', () => {
  it('la parallèle construite passe par le point et reste parallèle', () => {
    const d = L(10, 20, 37);
    const q = { x: 90, y: 130 };
    const par = parallelThroughPoint(d, q);
    expect(relationOf(d, par)).toBe(RELATIONS.paralleles);
    near(distanceTo(par, q), 0, 1e-9);
  });

  it('la perpendiculaire construite passe par le point et fait un angle droit', () => {
    const d = L(10, 20, 37);
    const q = { x: 90, y: 130 };
    const perp = perpendicularThroughPoint(d, q);
    expect(relationOf(d, perp)).toBe(RELATIONS.perpendiculaires);
    near(distanceTo(perp, q), 0, 1e-9);
    near(angleBetweenDeg(toLine(d), toLine(perp)), 90, 1e-6);
  });

  it('deux perpendiculaires successives redonnent une parallèle', () => {
    const d = L(0, 0, 23);
    const q = { x: 50, y: 50 };
    const perp = perpendicularThroughPoint(d, q);
    const back = perpendicularThroughPoint(perp, { x: 10, y: 90 });
    expect(relationOf(d, back)).toBe(RELATIONS.paralleles);
  });

  it('deux droites perpendiculaires à une même troisième sont parallèles entre elles', () => {
    const d = L(0, 0, 15);
    const a = perpendicularThroughPoint(d, { x: 20, y: 30 });
    const b = perpendicularThroughPoint(d, { x: 120, y: 30 });
    expect(relationOf(a, b)).toBe(RELATIONS.paralleles);
  });
});

describe('l’équerre — le rituel en deux gestes', () => {
  const d = L(0, 100, 0);            // droite horizontale
  const point = { x: 120, y: 100 };

  it('valide un placement correct : aligné ET sur le point', () => {
    const st = isEquerreAligned({ p: { x: 120, y: 100 }, angleDeg: 0 }, d, point);
    expect(st).toMatchObject({ onLine: true, atPoint: true, aligned: true, ok: true });
    expect(equerreHint(st)).toMatch(/bien posée/);
  });

  it('refuse une équerre mal orientée, et le dit', () => {
    const st = isEquerreAligned({ p: { x: 120, y: 100 }, angleDeg: 30 }, d, point);
    expect(st.ok).toBe(false);
    expect(st.aligned).toBe(false);
    expect(equerreHint(st)).toMatch(/le long de la droite/);
  });

  it('refuse une équerre alignée mais pas au bon endroit, et le dit', () => {
    const st = isEquerreAligned({ p: { x: 40, y: 100 }, angleDeg: 0 }, d, point);
    expect(st.ok).toBe(false);
    expect(st.aligned).toBe(true);
    expect(st.atPoint).toBe(false);
    expect(equerreHint(st)).toMatch(/sommet/);
  });

  it('refuse une équerre posée loin de la droite', () => {
    const st = isEquerreAligned({ p: { x: 120, y: 40 }, angleDeg: 0 }, d, point);
    expect(st.ok).toBe(false);
    expect(st.onLine).toBe(false);
  });
});
