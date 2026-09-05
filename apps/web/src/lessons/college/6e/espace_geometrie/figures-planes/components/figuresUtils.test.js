import { describe, it, expect } from 'vitest';
import {
  PROPERTIES, propertiesOf, TOL,
  classifyQuad, classifyTriangle, classify, shapeName, triangleTraits,
  countsOf, POLYGON_BY_SIDES, vertexNames, checkConstraints, SHAPE_LABEL,
  sameLength, sideLengths,
} from './figuresUtils';

const P = (x, y) => ({ x, y });

const CARRE = [P(0, 0), P(100, 0), P(100, 100), P(0, 100)];
const RECT = [P(0, 0), P(160, 0), P(160, 80), P(0, 80)];
const LOSANGE = [P(80, 0), P(160, 60), P(80, 120), P(0, 60)];
const PARALLELO = [P(0, 0), P(120, 0), P(150, 70), P(30, 70)];
const QUELCONQUE = [P(0, 0), P(130, 12), P(148, 96), P(24, 74)];
const EQUILATERAL = [P(0, 0), P(100, 0), P(50, 86.6)];
const ISOCELE = [P(0, 0), P(100, 0), P(50, 130)];
const TRI_RECT = [P(0, 0), P(90, 0), P(0, 120)];
const TRI_QUELCONQUE = [P(0, 0), P(120, 0), P(30, 70)];

describe('classification — le nom est CALCULÉ, jamais posé', () => {
  it('nomme chaque quadrilatère par sa propriété la plus spécifique', () => {
    expect(classifyQuad(CARRE)).toBe('carre');
    expect(classifyQuad(RECT)).toBe('rectangle');
    expect(classifyQuad(LOSANGE)).toBe('losange');
    expect(classifyQuad(PARALLELO)).toBe('parallelogramme');
    expect(classifyQuad(QUELCONQUE)).toBe('quadrilatere');
  });

  it('un carré est aussi un rectangle ET un losange — d’où l’ordre des tests', () => {
    const props = propertiesOf(CARRE);
    expect(props['angles-droits']).toBe(true);   // propriété du rectangle
    expect(props['cotes-egaux']).toBe(true);     // propriété du losange
    expect(classifyQuad(CARRE)).toBe('carre');   // mais on annonce le plus précis
  });

  it('nomme les triangles', () => {
    expect(classifyTriangle(EQUILATERAL)).toBe('triangle-equilateral');
    expect(classifyTriangle(TRI_RECT)).toBe('triangle-rectangle');
    expect(classifyTriangle(ISOCELE)).toBe('triangle-isocele');
    expect(classifyTriangle(TRI_QUELCONQUE)).toBe('triangle-quelconque');
  });

  it('triangleTraits cumule les caractères (isocèle ET rectangle)', () => {
    const isoRect = [P(0, 0), P(100, 0), P(0, 100)];
    const t = triangleTraits(isoRect);
    expect(t.rectangle).toBe(true);
    expect(t.isocele).toBe(true);
    expect(t.equilateral).toBe(false);
    // Un équilatéral est isocèle, jamais rectangle.
    const e = triangleTraits(EQUILATERAL);
    expect(e.equilateral && e.isocele).toBe(true);
    expect(e.rectangle).toBe(false);
  });

  it('classify route selon le nombre de sommets', () => {
    expect(classify(CARRE)).toBe('carre');
    expect(classify(TRI_RECT)).toBe('triangle-rectangle');
    expect(classify([P(0,0),P(10,0),P(12,9),P(5,14),P(-2,8)])).toBe('polygone');
  });

  it('shapeName donne un libellé français pour chaque cas', () => {
    expect(shapeName(CARRE)).toBe('carré');
    expect(shapeName(RECT)).toBe('rectangle');
    expect(shapeName(EQUILATERAL)).toBe('triangle équilatéral');
    for (const key of Object.keys(SHAPE_LABEL)) expect(SHAPE_LABEL[key]).toBeTruthy();
  });
});

describe('déformer une figure lui fait perdre son nom — le cœur de la leçon', () => {
  it('bouger un sommet du carré le dégrade, étape par étape', () => {
    expect(classifyQuad(CARRE)).toBe('carre');
    // On allonge un côté : ce n'est plus un carré, mais toujours un rectangle.
    const allonge = [P(0, 0), P(170, 0), P(170, 100), P(0, 100)];
    expect(classifyQuad(allonge)).toBe('rectangle');
    // On incline : les angles droits disparaissent.
    const incline = [P(0, 0), P(100, 0), P(130, 100), P(30, 100)];
    expect(classifyQuad(incline)).not.toBe('carre');
    expect(propertiesOf(incline)['angles-droits']).toBe(false);
  });

  it('un « presque carré » n’est PAS un carré — le piège du module 1', () => {
    // 6 px d'écart sur 100 : invisible à l'œil, au-delà de la tolérance.
    const presque = [P(0, 0), P(100, 0), P(106, 100), P(0, 100)];
    expect(classifyQuad(presque)).not.toBe('carre');
  });

  it('la tolérance absorbe le tremblement de la souris, pas une vraie erreur', () => {
    const tremble = [P(0, 0), P(100, 0), P(100.8, 99.4), P(0.5, 100)];
    expect(classifyQuad(tremble)).toBe('carre');
  });
});

describe('propriétés', () => {
  it('chaque propriété du catalogue est un prédicat exploitable', () => {
    for (const p of PROPERTIES) {
      expect(typeof p.test).toBe('function');
      expect(typeof p.test(CARRE)).toBe('boolean');
      expect(p.label).toBeTruthy();
    }
  });

  it('propertiesOf distingue rectangle et losange sur les bonnes lignes', () => {
    const r = propertiesOf(RECT);
    const l = propertiesOf(LOSANGE);
    expect(r['angles-droits']).toBe(true);
    expect(r['cotes-egaux']).toBe(false);
    expect(l['angles-droits']).toBe(false);
    expect(l['cotes-egaux']).toBe(true);
    // Les deux restent des parallélogrammes.
    expect(r['cotes-opposes-paralleles'] && l['cotes-opposes-paralleles']).toBe(true);
  });
});

describe('vocabulaire', () => {
  it('un polygone fermé a autant de sommets que de côtés', () => {
    expect(countsOf(CARRE)).toEqual({ cotes: 4, sommets: 4 });
    expect(countsOf(TRI_RECT)).toEqual({ cotes: 3, sommets: 3 });
  });

  it('nomme les polygones usuels et leurs sommets', () => {
    expect(POLYGON_BY_SIDES[3]).toBe('triangle');
    expect(POLYGON_BY_SIDES[4]).toBe('quadrilatère');
    expect(vertexNames(4)).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('construction sous contraintes', () => {
  it('détaille CHAQUE contrainte, pas seulement le verdict global', () => {
    const r = checkConstraints(RECT, ['angles-droits', 'cotes-egaux']);
    expect(r.ok).toBe(false);
    expect(r.detail.find((d) => d.id === 'angles-droits').ok).toBe(true);
    expect(r.detail.find((d) => d.id === 'cotes-egaux').ok).toBe(false);
    expect(r.detail.every((d) => d.label)).toBe(true);
  });

  it('valide un carré sur les deux contraintes du carré', () => {
    expect(checkConstraints(CARRE, ['angles-droits', 'cotes-egaux']).ok).toBe(true);
  });
});

describe('l’affichage ne peut PAS contredire le verdict (régression)', () => {
  // Bug constaté : un triangle 190/143/141 était annoncé « isocèle » alors
  // que les étiquettes affichaient deux nombres différents. La tolérance
  // relative (4 % de 190 = 7,6 px) dépassait l'unité d'arrondi.
  it('deux côtés déclarés égaux affichent le MÊME nombre arrondi', () => {
    const cas = [
      [P(60, 180), P(250, 180), P(200, 70)],
      [P(55, 180), P(245, 180), P(210, 85)],
      [P(60, 175), P(230, 175), P(150, 60)],
      [P(70, 180), P(240, 180), P(120, 55)],
      [P(50, 170), P(255, 170), P(180, 60)],
      CARRE, RECT, LOSANGE, PARALLELO, QUELCONQUE,
    ];
    for (const pts of cas) {
      const L = sideLengths(pts);
      const max = Math.max(...L);
      for (let i = 0; i < L.length; i += 1) {
        for (let j = i + 1; j < L.length; j += 1) {
          if (sameLength(L[i], L[j], max)) {
            // Si le moteur les dit égaux, l'élève doit lire le même entier.
            expect(Math.round(L[i])).toBe(Math.round(L[j]));
          }
        }
      }
    }
  });

  it('le triangle 190/143/141 du bug n’est PLUS déclaré isocèle', () => {
    // Reconstruit à partir des longueurs exactes du signalement.
    const pts = [P(60, 180), P(250, 180), P(160, 68)];
    const L = sideLengths(pts).map(Math.round);
    // Deux côtés visiblement différents…
    expect(L[1]).not.toBe(L[2]);
    // …ne doivent pas être déclarés égaux.
    expect(sameLength(sideLengths(pts)[1], sideLengths(pts)[2], Math.max(...sideLengths(pts)))).toBe(false);
    expect(triangleTraits(pts).isocele).toBe(false);
  });

  it('un vrai isocèle reste reconnu', () => {
    const iso = [P(60, 180), P(240, 180), P(150, 55)];
    const L = sideLengths(iso);
    expect(Math.round(L[1])).toBe(Math.round(L[2]));
    expect(triangleTraits(iso).isocele).toBe(true);
  });

  it('la tolérance absolue plafonne bien la tolérance relative', () => {
    // Sur une grande figure, 4 % ferait 8 px ; absMax doit ramener à 1,5.
    expect(sameLength(200, 195, 200)).toBe(false); // 5 px d'écart : refusé
    expect(sameLength(200, 199, 200)).toBe(true);  // 1 px : accepté
    expect(TOL.absMax).toBeLessThanOrEqual(1.5);
  });
});
