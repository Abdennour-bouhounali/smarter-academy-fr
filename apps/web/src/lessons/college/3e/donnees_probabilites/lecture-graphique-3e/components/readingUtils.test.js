import { describe, it, expect } from 'vitest';
import {
  image, antecedents, maxOf, minOf, variations, crossings,
  isReadingOk, rangeForCurve, mergeClose, describeVariation,
  solveGraphically, aboveThreshold,
} from './readingUtils';
import { BALLOON, BALLOON_2, DRONE, RANGE } from './balloonData';

describe('image — un x donne UNE altitude', () => {
  it('lit une valeur relevée', () => {
    expect(image(BALLOON, 3)).toBe(600);
    expect(image(BALLOON, 7)).toBe(0);
  });

  it('interpole entre deux relevés', () => {
    // Entre 1 h (200) et 2 h (400), la mi-heure vaut 300.
    expect(image(BALLOON, 1.5)).toBe(300);
  });

  it('renvoie null hors du domaine', () => {
    expect(image(BALLOON, 13)).toBeNull();
    expect(image(BALLOON, -1)).toBeNull();
  });
});

describe('antecedents — une altitude peut être atteinte plusieurs fois', () => {
  it('400 m est atteint QUATRE fois', () => {
    const xs = antecedents(BALLOON, 400);
    expect(xs).toHaveLength(4);
    expect(xs).toEqual([2, 5, 9, 11]);
  });

  it('200 m aussi est atteint quatre fois', () => {
    expect(antecedents(BALLOON, 200)).toEqual([1, 6, 8, 12]);
  });

  it('le maximum n’est atteint que sur son palier', () => {
    // 600 est le sommet, tenu de 3 h à 4 h, puis retrouvé une fois à 10 h.
    expect(antecedents(BALLOON, 600)).toEqual([3, 4, 10]);
  });

  it('une altitude jamais atteinte n’a AUCUN antécédent', () => {
    expect(antecedents(BALLOON, 800)).toHaveLength(0);
  });

  it('un antécédent trouvé a bien l’altitude annoncée (aller-retour)', () => {
    for (const y of [0, 200, 400, 600]) {
      for (const x of antecedents(BALLOON, y)) {
        expect(image(BALLOON, x)).toBeCloseTo(y, 6);
      }
    }
  });
});

describe('maximum, minimum et variations', () => {
  it('trouve le sommet et le point le plus bas', () => {
    expect(maxOf(BALLOON).y).toBe(600);
    expect(minOf(BALLOON).y).toBe(0);
  });

  it('découpe le vol en intervalles de monotonie', () => {
    const v = variations(BALLOON);
    expect(v[0]).toEqual({ from: 0, to: 3, direction: 'croissante' });
    expect(v[1]).toEqual({ from: 3, to: 4, direction: 'constante' });
    expect(v.some((iv) => iv.direction === 'decroissante')).toBe(true);
  });

  it('les intervalles se suivent et couvrent tout le vol', () => {
    const v = variations(BALLOON);
    expect(v[0].from).toBe(0);
    expect(v[v.length - 1].to).toBe(12);
    for (let i = 0; i < v.length - 1; i += 1) expect(v[i].to).toBe(v[i + 1].from);
  });

  it('décrit les variations en toutes lettres', () => {
    const txt = describeVariation(variations(BALLOON).slice(0, 2), { unit: ' h' });
    expect(txt).toContain('monte de 0 h à 3 h');
    expect(txt).toContain('reste stable');
  });
});

describe('croisement de deux vols', () => {
  it('les deux montgolfières se croisent', () => {
    const hits = crossings(BALLOON, BALLOON_2);
    expect(hits.length).toBeGreaterThanOrEqual(2);
    // Au croisement, les deux altitudes coïncident. La tolérance est celle de
    // la LECTURE graphique (au mètre près), pas celle du flottant : une
    // intersection interpolée tombe sur un décimal périodique.
    for (const h of hits) {
      expect(Math.abs(image(BALLOON, h.x) - image(BALLOON_2, h.x))).toBeLessThan(1);
    }
  });

  it('une courbe ne croise pas une copie d’elle-même décalée vers le haut', () => {
    const shifted = BALLOON.map((p) => ({ x: p.x, y: p.y + 2000 }));
    expect(crossings(BALLOON, shifted)).toHaveLength(0);
  });
});

describe('lecture approchée et outils de problème', () => {
  it('accepte une lecture à la tolérance près', () => {
    expect(isReadingOk(600, 620, 50)).toBe(true);
    expect(isReadingOk(600, 700, 50)).toBe(false);
  });

  it('résoudre graphiquement, c’est chercher les antécédents', () => {
    expect(solveGraphically(BALLOON, 400)).toEqual(antecedents(BALLOON, 400));
  });

  it('donne les périodes au-dessus d’un seuil', () => {
    const above = aboveThreshold(DRONE, 600);
    expect(above.length).toBeGreaterThan(0);
    for (const iv of above) expect(iv.to).toBeGreaterThan(iv.from);
  });

  it('l’étendue calculée contient toute la courbe', () => {
    const r = rangeForCurve(BALLOON, 1, 100);
    for (const p of BALLOON) {
      expect(p.x).toBeGreaterThanOrEqual(r.xMin);
      expect(p.x).toBeLessThanOrEqual(r.xMax);
      expect(p.y).toBeGreaterThanOrEqual(r.yMin);
      expect(p.y).toBeLessThanOrEqual(r.yMax);
    }
  });

  it('mergeClose ne sert QU’À l’affichage : la liste mathématique reste entière', () => {
    expect(mergeClose([1, 1.2, 5], 0.5)).toEqual([1, 5]);
    expect(antecedents(BALLOON, 400)).toHaveLength(4);
  });
});

describe('propriété d’affichage — les marqueurs ne se superposent jamais', () => {
  it('à chaque graduation, deux antécédents consécutifs sont distants d’au moins 1 h', () => {
    // Sans cette garantie, deux marqueurs se chevaucheraient sur le repère et
    // la lecture deviendrait impossible (règle §17bis).
    for (let y = RANGE.yMin; y <= RANGE.yMax; y += 100) {
      for (const curve of [BALLOON, BALLOON_2, DRONE]) {
        const xs = antecedents(curve, y);
        for (let i = 0; i < xs.length - 1; i += 1) {
          expect(xs[i + 1] - xs[i]).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it('le maximum de chaque courbe tombe sur une graduation de 100 m', () => {
    for (const curve of [BALLOON, BALLOON_2, DRONE]) {
      expect(maxOf(curve).y % 100).toBe(0);
      expect(minOf(curve).y % 100).toBe(0);
    }
  });
});
