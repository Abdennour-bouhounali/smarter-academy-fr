import { describe, it, expect } from 'vitest';
import {
  vecFromPoints, translatePoint, translatePolygon, ZERO, isZero,
  equalVectors, opposite, addVectors, vectorLength,
  directionKey, sameDirection, sameSense, sameLength, attributesOf,
  diagnose, DIAGNOSIS_TEXT,
  isParallelogram, fourthPoint,
  formatVec, describeVec,
  RANGE, DRONES, FIGURES,
} from './vectorUtils';

const P = (x, y) => ({ x, y });
const V = (dx, dy) => ({ dx, dy });

describe('vecteurs et translations', () => {
  it('lit un déplacement entre deux points', () => {
    expect(vecFromPoints(P(-2, 1), P(3, -1))).toEqual({ dx: 5, dy: -2 });
    expect(vecFromPoints(P(4, 4), P(4, 4))).toEqual({ dx: 0, dy: 0 });
  });

  it('applique un déplacement à un point et à une figure', () => {
    expect(translatePoint(P(1, 1), V(3, -2))).toEqual({ x: 4, y: -1 });
    const img = translatePolygon(FIGURES.drone, V(2, 1));
    img.forEach((p, i) => {
      expect(p.x).toBe(FIGURES.drone[i].x + 2);
      expect(p.y).toBe(FIGURES.drone[i].y + 1);
    });
  });

  it('la translation CONSERVE les longueurs — l’image est superposable', () => {
    const v = V(3, -2);
    const img = translatePolygon(FIGURES.drone, v);
    const d = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
    for (let i = 0; i < 3; i += 1) {
      const j = (i + 1) % 3;
      expect(d(img[i], img[j])).toBeCloseTo(d(FIGURES.drone[i], FIGURES.drone[j]), 10);
    }
  });

  it('reconnaît le vecteur nul', () => {
    expect(isZero(ZERO)).toBe(true);
    expect(isZero(V(0, 0.0000000001))).toBe(true);
    expect(isZero(V(0, 1))).toBe(false);
  });
});

describe('L’IDÉE CENTRALE : un vecteur ne dépend pas de l’endroit', () => {
  it('deux flèches posées ailleurs sont le même vecteur', () => {
    const u = vecFromPoints(P(-5, -3), P(-1, -1));
    const v = vecFromPoints(P(2, 1), P(6, 3));
    const w = vecFromPoints(P(-6, 2), P(-2, 4));
    expect(equalVectors(u, v)).toBe(true);
    expect(equalVectors(u, w)).toBe(true);
    // Et pourtant les points de départ sont tous différents.
    expect(P(-5, -3)).not.toEqual(P(2, 1));
  });

  it('appliquer le même vecteur en quatre endroits donne quatre images distinctes', () => {
    const v = DRONES.mouvement;
    const images = DRONES.positions.map((p) => translatePoint(p, v));
    const keys = new Set(images.map((p) => `${p.x},${p.y}`));
    expect(keys.size).toBe(4);
    // Mais le déplacement lu sur chacune est IDENTIQUE.
    DRONES.positions.forEach((p, i) => {
      expect(equalVectors(vecFromPoints(p, images[i]), v)).toBe(true);
    });
  });
});

describe('direction, sens, longueur', () => {
  it('deux vecteurs opposés ont la MÊME direction mais un sens contraire', () => {
    const u = V(3, 2);
    const o = opposite(u);
    expect(sameDirection(u, o)).toBe(true);
    expect(sameSense(u, o)).toBe(false);
    expect(sameLength(u, o)).toBe(true);
    expect(equalVectors(u, o)).toBe(false);
  });

  it('deux vecteurs proportionnels ont même direction et même sens, pas même longueur', () => {
    const u = V(2, 1);
    const d = V(4, 2);
    expect(sameDirection(u, d)).toBe(true);
    expect(sameSense(u, d)).toBe(true);
    expect(sameLength(u, d)).toBe(false);
    expect(equalVectors(u, d)).toBe(false);
  });

  it('directionKey est canonique — il ignore le sens et la longueur', () => {
    expect(directionKey(V(2, 4))).toBe(directionKey(V(1, 2)));
    expect(directionKey(V(2, 4))).toBe(directionKey(V(-1, -2)));
    expect(directionKey(V(1, 2))).not.toBe(directionKey(V(2, 1)));
    expect(directionKey(ZERO)).toBe('nulle');
  });

  it('attributesOf rend les trois attributs séparément', () => {
    expect(attributesOf(V(3, 1), V(3, 1))).toEqual({
      direction: true, sens: true, longueur: true, egaux: true,
    });
    expect(attributesOf(V(3, 1), V(-3, -1))).toMatchObject({
      direction: true, sens: false, longueur: true, egaux: false,
    });
  });
});

describe('diagnostic d’une erreur de reproduction', () => {
  it('nomme précisément ce qui cloche', () => {
    const cible = V(4, 2);
    expect(diagnose(cible, V(4, 2))).toBeNull();
    expect(diagnose(cible, V(-4, -2))).toBe('sens');
    expect(diagnose(cible, V(2, 1))).toBe('longueur');
    expect(diagnose(cible, V(2, 4))).toBe('direction');
  });

  it('chaque diagnostic a un texte destiné à l’élève', () => {
    for (const key of ['direction', 'sens', 'longueur', 'autre']) {
      expect(DIAGNOSIS_TEXT[key]).toBeTruthy();
      expect(DIAGNOSIS_TEXT[key].length).toBeGreaterThan(20);
    }
  });
});

describe('parallélogrammes', () => {
  it('AB = CD caractérise le parallélogramme ABDC', () => {
    const A = P(-3, -1); const B = P(1, 0); const C = P(-2, 2);
    const D = fourthPoint(A, B, C);
    expect(D).toEqual({ x: 2, y: 3 });
    expect(isParallelogram(A, B, C, D)).toBe(true);
  });

  it('refuse un quadrilatère qui n’en est pas un', () => {
    expect(isParallelogram(P(0, 0), P(2, 0), P(0, 2), P(3, 2))).toBe(false);
  });

  it('appliquer un vecteur à un segment crée un parallélogramme', () => {
    const v = V(3, 2);
    const A = P(-2, -1); const B = P(0, 1);
    const A2 = translatePoint(A, v);
    const B2 = translatePoint(B, v);
    // [AA'] et [BB'] sont deux côtés opposés égaux : AA' = BB'.
    expect(equalVectors(vecFromPoints(A, A2), vecFromPoints(B, B2))).toBe(true);
  });
});

describe('enchaîner deux déplacements', () => {
  it('revient à ajouter les composantes', () => {
    expect(addVectors(V(3, -1), V(-1, 4))).toEqual({ dx: 2, dy: 3 });
    const p = P(0, 0);
    const deuxEtapes = translatePoint(translatePoint(p, V(3, -1)), V(-1, 4));
    const dUnCoup = translatePoint(p, addVectors(V(3, -1), V(-1, 4)));
    expect(deuxEtapes).toEqual(dUnCoup);
  });

  it('un vecteur et son opposé s’annulent', () => {
    const v = V(5, -2);
    expect(isZero(addVectors(v, opposite(v)))).toBe(true);
  });
});

describe('écriture française', () => {
  it('utilise le moins typographique et le point-virgule', () => {
    expect(formatVec(V(3, -2))).toBe('(3 ; −2)');
    expect(formatVec(V(-1, 0))).not.toContain('-');
  });

  it('décrit un déplacement en toutes lettres', () => {
    expect(describeVec(V(4, 2))).toBe('4 vers la droite et 2 vers le haut');
    expect(describeVec(V(-3, 0))).toBe('3 vers la gauche');
    expect(describeVec(ZERO)).toBe('aucun déplacement');
  });
});

describe('les scènes de la leçon', () => {
  it('les drones et leurs images tiennent tous dans le cadre', () => {
    const v = DRONES.mouvement;
    for (const p of DRONES.positions) {
      const img = translatePoint(p, v);
      expect(img.x).toBeGreaterThanOrEqual(RANGE.xMin);
      expect(img.x).toBeLessThanOrEqual(RANGE.xMax);
      expect(img.y).toBeGreaterThanOrEqual(RANGE.yMin);
      expect(img.y).toBeLessThanOrEqual(RANGE.yMax);
    }
  });

  it('les figures et leurs images tiennent dans le cadre', () => {
    for (const [nom, pts] of Object.entries(FIGURES)) {
      for (const p of translatePolygon(pts, DRONES.mouvement)) {
        expect(p.x, nom).toBeLessThanOrEqual(RANGE.xMax);
        expect(p.y, nom).toBeLessThanOrEqual(RANGE.yMax);
        expect(p.x, nom).toBeGreaterThanOrEqual(RANGE.xMin);
        expect(p.y, nom).toBeGreaterThanOrEqual(RANGE.yMin);
      }
    }
  });

  it('le mouvement de référence a ses deux composantes non nulles et distinctes', () => {
    // Sinon le déplacement serait purement horizontal (trop simple) ou
    // symétrique (on ne verrait pas que l'ordre des composantes compte).
    const { dx, dy } = DRONES.mouvement;
    expect(dx).not.toBe(0);
    expect(dy).not.toBe(0);
    expect(Math.abs(dx)).not.toBe(Math.abs(dy));
  });

  it('les quatre drones occupent des positions distinctes', () => {
    const keys = new Set(DRONES.positions.map((p) => `${p.x},${p.y}`));
    expect(keys.size).toBe(4);
  });
});
