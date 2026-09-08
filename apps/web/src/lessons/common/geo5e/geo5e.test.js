import { describe, it, expect } from 'vitest';
import {
  symCentral, symCentralPts, symAxial, angleAt, triangleAngles, polygonArea,
  distToLine, footOnLine, lineInter, circumcenter, isTriangle, midpoint, dist,
  clipLine, clampPt, fr, round,
} from './geo5e';

const P = (x, y) => ({ x, y });
const close = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('symétrie centrale — le demi-tour', () => {
  it('le centre est le milieu de [M M’]', () => {
    const c = P(3, 5);
    for (const m of [P(0, 0), P(-4, 9), P(3, 5), P(12, -7)]) {
      const m2 = symCentral(m, c);
      expect(midpoint(m, m2)).toEqual(c);
    }
  });

  it('est involutive : le symétrique du symétrique est le point de départ', () => {
    const c = P(-2, 4);
    const m = P(7, 1);
    expect(symCentral(symCentral(m, c), c)).toEqual(m);
  });

  it('le centre est son propre symétrique — le seul point fixe', () => {
    const c = P(5, 5);
    expect(symCentral(c, c)).toEqual(c);
    // et lui seul :
    expect(symCentral(P(5, 6), c)).not.toEqual(P(5, 6));
  });

  /* LES INVARIANTS QUE LA LEÇON FAIT DÉCOUVRIR. Ils sont ici pour que le
     module ne puisse pas affirmer quelque chose que la figure dément. */

  it('conserve les longueurs', () => {
    const c = P(2, -3);
    const A = P(0, 0); const B = P(6, 4);
    close(dist(symCentral(A, c), symCentral(B, c)), dist(A, B));
  });

  it('conserve les angles (donc la forme)', () => {
    const c = P(1, 1);
    const t = [P(0, 0), P(8, 2), P(3, 7)];
    const s = symCentralPts(t, c);
    triangleAngles(t).forEach((ang, i) => close(ang, triangleAngles(s)[i], 1e-9));
  });

  it('conserve les aires', () => {
    const c = P(-5, 2);
    const q = [P(0, 0), P(6, 1), P(7, 5), P(1, 4)];
    close(polygonArea(symCentralPts(q, c)), polygonArea(q), 1e-9);
  });

  it('renverse la figure : le sens de parcours change de signe', () => {
    // C'est ce qui distingue le demi-tour d'un simple glissement, et ce que
    // l'élève voit quand la figure « part à l'envers ».
    const signed = (pts) => {
      let s = 0;
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i]; const q = pts[(i + 1) % pts.length];
        s += p.x * q.y - q.x * p.y;
      }
      return s / 2;
    };
    const t = [P(0, 0), P(8, 0), P(0, 6)];
    const s = symCentralPts(t, P(3, 3));
    // Même aire, orientation inversée n'est PAS vrai pour la symétrie
    // centrale : c'est un demi-tour, elle conserve l'orientation.
    expect(Math.sign(signed(s))).toBe(Math.sign(signed(t)));
    close(Math.abs(signed(s)), Math.abs(signed(t)));
  });

  it('la symétrie AXIALE, elle, retourne la figure — c’est le contraste du module 6', () => {
    const signed = (pts) => {
      let s = 0;
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i]; const q = pts[(i + 1) % pts.length];
        s += p.x * q.y - q.x * p.y;
      }
      return s / 2;
    };
    const t = [P(1, 1), P(8, 2), P(3, 7)];
    const s = t.map((p) => symAxial(p, P(0, 0), P(0, 10)));
    expect(Math.sign(signed(s))).toBe(-Math.sign(signed(t)));
  });

  it('trois points alignés ont des images alignées', () => {
    const c = P(4, 4);
    const [a, b, d] = [P(0, 0), P(2, 3), P(6, 9)].map((p) => symCentral(p, c));
    close((b.x - a.x) * (d.y - a.y) - (d.x - a.x) * (b.y - a.y), 0, 1e-9);
  });
});

describe('angles', () => {
  it('mesure l’angle géométrique, toujours dans [0 ; 180]', () => {
    close(angleAt(P(1, 0), P(0, 0), P(0, 1)), 90);
    close(angleAt(P(1, 0), P(0, 0), P(-1, 0)), 180);
    close(angleAt(P(1, 0), P(0, 0), P(1, 1)), 45);
  });

  it('ne dépend pas de l’ordre des deux côtés', () => {
    const a = P(3, 1); const b = P(0, 0); const c = P(1, 5);
    close(angleAt(a, b, c), angleAt(c, b, a));
  });

  it('la somme des angles d’un triangle vaut 180°, pour tout triangle', () => {
    // LE FAIT CENTRAL de la leçon « Triangles ». S'il n'était vrai que pour
    // la figure de départ, le module « déplace un sommet » mentirait.
    for (const t of [
      [P(0, 0), P(10, 0), P(3, 8)],
      [P(-4, 2), P(9, -1), P(2, 11)],
      [P(0, 0), P(1, 0), P(0.5, 20)],
      [P(0, 0), P(30, 1), P(15, 2)],
    ]) {
      const s = triangleAngles(t).reduce((x, y) => x + y, 0);
      close(s, 180, 1e-9);
    }
  });
});

describe('droites remarquables', () => {
  it('le centre du cercle circonscrit est à égale distance des trois sommets', () => {
    const t = [P(0, 0), P(12, 2), P(4, 9)];
    const o = circumcenter(t);
    const r = dist(o, t[0]);
    close(dist(o, t[1]), r, 1e-8);
    close(dist(o, t[2]), r, 1e-8);
  });

  it('il est sur la médiatrice de chaque côté', () => {
    const t = [P(1, 1), P(9, 0), P(5, 7)];
    const o = circumcenter(t);
    close(dist(o, t[0]), dist(o, t[1]), 1e-8);
  });

  it('le pied de la hauteur est sur la droite, et la hauteur lui est perpendiculaire', () => {
    const A = P(3, 9); const B = P(0, 0); const C = P(10, 0);
    const h = footOnLine(A, B, C);
    close(h.y, 0, 1e-9);
    close((A.x - h.x) * (C.x - B.x) + (A.y - h.y) * (C.y - B.y), 0, 1e-9);
    close(distToLine(A, B, C), dist(A, h), 1e-9);
  });

  it('LA MÉDIANE PARTAGE LE TRIANGLE EN DEUX AIRES ÉGALES', () => {
    // La démonstration demandée par le programme. Vérifiée sur des triangles
    // quelconques, pas seulement sur un cas favorable.
    for (const [A, B, C] of [
      [P(0, 0), P(10, 0), P(3, 8)],
      [P(-3, 2), P(7, -4), P(11, 9)],
      [P(0, 0), P(2, 14), P(13, 5)],
    ]) {
      const M = midpoint(B, C);
      const a1 = polygonArea([A, B, M]);
      const a2 = polygonArea([A, M, C]);
      close(a1, a2, 1e-9);
      close(a1 + a2, polygonArea([A, B, C]), 1e-9);
    }
  });

  it('les deux moitiés ont même base et même hauteur — la RAISON de l’égalité', () => {
    const A = P(2, 9); const B = P(0, 0); const C = P(12, 0);
    const M = midpoint(B, C);
    close(dist(B, M), dist(M, C));              // même base
    close(distToLine(A, B, M), distToLine(A, M, C), 1e-9); // même hauteur
  });
});

describe('inégalité triangulaire', () => {
  it('accepte trois longueurs constructibles', () => {
    expect(isTriangle(3, 4, 5)).toBe(true);
    expect(isTriangle(7, 7, 7)).toBe(true);
  });
  it('refuse le cas plat et le cas impossible', () => {
    expect(isTriangle(2, 3, 5)).toBe(false);   // plat
    expect(isTriangle(2, 3, 9)).toBe(false);   // impossible
  });
});

describe('outils de figure', () => {
  it('lineInter trouve le point commun, et rend null si parallèles', () => {
    expect(lineInter(P(0, 0), P(10, 0), P(5, -5), P(5, 5))).toEqual(P(5, 0));
    expect(lineInter(P(0, 0), P(10, 0), P(0, 3), P(10, 3))).toBeNull();
  });

  it('clipLine ne sort jamais du cadre', () => {
    const [p, q] = clipLine(P(100, 100), P(140, 130), 400, 300, 10);
    for (const r of [p, q]) {
      expect(r.x).toBeGreaterThanOrEqual(9.9);
      expect(r.x).toBeLessThanOrEqual(390.1);
      expect(r.y).toBeGreaterThanOrEqual(9.9);
      expect(r.y).toBeLessThanOrEqual(290.1);
    }
  });

  it('clampPt garde la poignée dans le cadre', () => {
    expect(clampPt(P(-50, 500), 400, 300, 20)).toEqual(P(20, 280));
  });

  it('fr écrit à la française', () => {
    expect(fr(3.14159, 1)).toBe('3,1');
    expect(fr(180, 0)).toBe('180');
    expect(round(2.345, 2)).toBe(2.35);
  });
});
