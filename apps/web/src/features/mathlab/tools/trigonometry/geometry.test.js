/**
 * LE DESSIN — des mathématiques aux pixels (§49).
 *
 * Ces tests défendent surtout deux choses qu'un écran ne dit pas tout seul :
 *   — le RETOURNEMENT de l'axe des ordonnées (en SVG, y croît vers le bas),
 *     qui mettrait sin(30°) SOUS l'axe si on l'oubliait ;
 *   — l'ÉCRÊTAGE de la tangente, sans lequel un `y` de plusieurs millions
 *     part dans le SVG à 89,99° (§11 : « avoid visual instability »).
 */

import { describe, it, expect } from 'vitest';
import {
  project, unproject, arcPath, quadrantPath, wavePath, waveX, waveY,
  angleFromWaveX, tangentGeometry, specialMarkers, inscribedTriangle,
  freeTriangle, betweenArc,
} from './geometry.js';
import { sinOf, cosOf } from './trigMath.js';

const ORIGIN = { x: 200, y: 150 };
const UNIT = 50;

describe('math → pixels, et retour', () => {
  it('l’origine tombe sur l’origine', () => {
    expect(project({ x: 0, y: 0 }, ORIGIN, UNIT)).toEqual({ x: 200, y: 150 });
  });

  it('x croît vers la DROITE', () => {
    expect(project({ x: 1, y: 0 }, ORIGIN, UNIT).x).toBe(250);
  });

  it('y croît vers le HAUT — le retournement du SVG', () => {
    // (0 ; 1) doit être AU-DESSUS de l’origine, donc un y PLUS PETIT.
    expect(project({ x: 0, y: 1 }, ORIGIN, UNIT).y).toBe(100);
    expect(project({ x: 0, y: -1 }, ORIGIN, UNIT).y).toBe(200);
  });

  it('un point du premier quadrant est en haut à droite', () => {
    const p = project({ x: cosOf(30), y: sinOf(30) }, ORIGIN, UNIT);
    expect(p.x).toBeGreaterThan(ORIGIN.x);
    expect(p.y).toBeLessThan(ORIGIN.y);
  });

  it('l’aller-retour pixels ↔ math est fidèle', () => {
    for (const point of [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -0.5, y: 0.87 }, { x: 2, y: -3 }]) {
      const back = unproject(project(point, ORIGIN, UNIT), ORIGIN, UNIT);
      expect(back.x).toBeCloseTo(point.x, 10);
      expect(back.y).toBeCloseTo(point.y, 10);
    }
  });

  it('une échelle nulle ne produit pas NaN', () => {
    expect(unproject({ x: 10, y: 10 }, ORIGIN, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe('l’arc de l’angle (§14)', () => {
  it('un angle nul ne dessine rien', () => {
    expect(arcPath(0, ORIGIN, UNIT)).toBe('');
    expect(arcPath(NaN, ORIGIN, UNIT)).toBe('');
  });

  it('un angle ordinaire dessine un chemin qui commence par M', () => {
    expect(arcPath(60, ORIGIN, UNIT)).toMatch(/^M[\d.,-]+ L/);
  });

  it('450° dessine un chemin PLUS LONG que 90° — la spirale (§14)', () => {
    const short = arcPath(90, ORIGIN, UNIT).split('L').length;
    const long = arcPath(450, ORIGIN, UNIT).split('L').length;
    expect(long).toBeGreaterThan(short);
  });

  it('450° et 90° ne dessinent PAS le même arc', () => {
    expect(arcPath(450, ORIGIN, UNIT)).not.toBe(arcPath(90, ORIGIN, UNIT));
  });

  it('un angle négatif tourne dans l’autre sens', () => {
    const positive = arcPath(90, ORIGIN, UNIT);
    const negative = arcPath(-90, ORIGIN, UNIT);
    expect(negative).not.toBe(positive);
    expect(negative).toMatch(/^M/);
  });

  it('le nombre de points reste borné, même à 1080°', () => {
    expect(arcPath(1080, ORIGIN, UNIT).split('L').length).toBeLessThanOrEqual(721);
  });

  it('aucune coordonnée NaN dans le chemin', () => {
    for (const degrees of [1, 45, 90, 180, 359, 450, 720, -360]) {
      expect(arcPath(degrees, ORIGIN, UNIT), `${degrees}°`).not.toMatch(/NaN/);
    }
  });
});

describe('le secteur d’un quadrant (§5)', () => {
  it('chaque quadrant se dessine, fermé', () => {
    for (const q of [1, 2, 3, 4]) {
      const path = quadrantPath(q, ORIGIN, UNIT, 1);
      expect(path, `Q${q}`).toMatch(/^M.*A.*Z$/);
      expect(path).not.toMatch(/NaN/);
    }
  });

  it('un quadrant hors bornes ne dessine rien', () => {
    expect(quadrantPath(0, ORIGIN, UNIT, 1)).toBe('');
    expect(quadrantPath(5, ORIGIN, UNIT, 1)).toBe('');
  });
});

describe('les courbes (§12, §13)', () => {
  const BOX = { x: 0, y: 0, width: 360, height: 100 };

  it('la courbe du sinus est tracée', () => {
    expect(wavePath(sinOf, 0, 360, BOX)).toMatch(/^M[\d.,-]+ L/);
  });

  it('0° est à gauche du cadre, 360° à droite', () => {
    expect(waveX(0, 0, 360, BOX)).toBe(0);
    expect(waveX(360, 0, 360, BOX)).toBe(360);
    expect(waveX(180, 0, 360, BOX)).toBe(180);
  });

  it('+1 est en HAUT du cadre, −1 en bas', () => {
    expect(waveY(1, BOX)).toBe(0);
    expect(waveY(-1, BOX)).toBe(100);
    expect(waveY(0, BOX)).toBe(50);
  });

  it('une valeur hors [−1, 1] est écrêtée, jamais dessinée hors cadre', () => {
    expect(waveY(5, BOX)).toBe(0);
    expect(waveY(-5, BOX)).toBe(100);
  });

  it('l’abscisse du graphe redonne l’angle — le glissement de §32', () => {
    for (const degrees of [0, 45, 180, 270, 360]) {
      const x = waveX(degrees, 0, 360, BOX);
      expect(angleFromWaveX(x, 0, 360, BOX)).toBeCloseTo(degrees, 6);
    }
  });

  it('un glissement hors du cadre est ramené aux bornes', () => {
    expect(angleFromWaveX(-500, 0, 360, BOX)).toBe(0);
    expect(angleFromWaveX(9999, 0, 360, BOX)).toBe(360);
  });

  it('une boîte vide ne produit pas de chemin', () => {
    expect(wavePath(sinOf, 0, 360, { x: 0, y: 0, width: 0, height: 0 })).toBe('');
  });

  it('la courbe partielle s’ARRÊTE sous le marqueur — l’onde en train de naître (§13)', () => {
    /**
     * La régression que la QA visuelle a fait trouver : sans l'échelle
     * `axis`, `wavePath(sin, 0, 90, box)` rapportait 90° à la LARGEUR
     * ENTIÈRE du cadre. La courbe partielle était comprimée et son extrémité
     * n'était pas sous le marqueur — le lien cercle ↔ graphe (§12) mentait.
     */
    const lastX = (path) => Number(path.split('L').at(-1).split(',')[0]);
    const axis = { from: 0, to: 360 };
    expect(lastX(wavePath(sinOf, 0, 90, BOX, 240, axis))).toBeCloseTo(waveX(90, 0, 360, BOX), 0);
    expect(lastX(wavePath(sinOf, 0, 180, BOX, 240, axis))).toBeCloseTo(waveX(180, 0, 360, BOX), 0);
    expect(lastX(wavePath(sinOf, 0, 360, BOX, 240, axis))).toBeCloseTo(BOX.width, 0);
  });

  it('sans échelle explicite, l’intervalle occupe tout le cadre (le fantôme)', () => {
    const lastX = (path) => Number(path.split('L').at(-1).split(',')[0]);
    expect(lastX(wavePath(sinOf, 0, 360, BOX))).toBeCloseTo(BOX.width, 0);
  });

  it('la courbe partielle et le fantôme se SUPERPOSENT sur leur partie commune', () => {
    const axis = { from: 0, to: 360 };
    const ghost = wavePath(sinOf, 0, 360, BOX).split(' ');
    const partial = wavePath(sinOf, 0, 90, BOX, 240, axis).split(' ');
    // Le dernier point de la courbe partielle tombe sur le fantôme.
    const [px, py] = partial.at(-1).replace('L', '').split(',').map(Number);
    const nearest = ghost
      .map((p) => p.replace(/^[ML]/, '').split(',').map(Number))
      .reduce((best, p) => (Math.abs(p[0] - px) < Math.abs(best[0] - px) ? p : best));
    expect(Math.abs(nearest[1] - py)).toBeLessThan(2);
  });
});

describe('la tangente géométrique (§11) — le cas qui casse les écrans', () => {
  it('à 45°, la tangente vaut 1 et n’est pas écrêtée', () => {
    const t = tangentGeometry(45);
    expect(t.defined).toBe(true);
    expect(t.value).toBeCloseTo(1, 9);
    expect(t.clipped).toBe(false);
    expect(t.y).toBeCloseTo(1, 9);
  });

  it('à 90°, elle n’est PAS définie — aucune intersection', () => {
    const t = tangentGeometry(90);
    expect(t.defined).toBe(false);
    expect(t.value).toBeNull();
  });

  it('à 89,99°, elle est ÉCRÊTÉE et le dit — jamais un y de millions', () => {
    const t = tangentGeometry(89.99, 4);
    expect(t.defined).toBe(true);
    expect(t.clipped).toBe(true);
    expect(Math.abs(t.y)).toBe(4);
    // La VRAIE valeur reste disponible pour le panneau ; seul le DESSIN est borné.
    expect(Math.abs(t.value)).toBeGreaterThan(1000);
  });

  it('le y dessiné reste borné sur tout un tour — aucun débordement SVG', () => {
    for (let degrees = 0; degrees < 360; degrees += 0.25) {
      const t = tangentGeometry(degrees, 4);
      expect(Math.abs(t.y), `${degrees}°`).toBeLessThanOrEqual(4);
      expect(Number.isFinite(t.y), `${degrees}°`).toBe(true);
    }
  });

  it('le côté suit le signe du cosinus', () => {
    expect(tangentGeometry(45).side).toBe(1);
    expect(tangentGeometry(135).side).toBe(-1);
  });

  it('à 270°, elle n’est pas définie non plus', () => {
    expect(tangentGeometry(270).defined).toBe(false);
  });
});

describe('le triangle inscrit (§8)', () => {
  it('les trois sommets sont posés', () => {
    const t = inscribedTriangle(30, ORIGIN, UNIT, 1);
    expect(t.origin).toEqual(ORIGIN);
    expect(t.point.x).toBeGreaterThan(ORIGIN.x);
    expect(t.point.y).toBeLessThan(ORIGIN.y);
    // Le pied est SOUS le point, sur l’axe.
    expect(t.foot.y).toBe(ORIGIN.y);
    expect(t.foot.x).toBeCloseTo(t.point.x, 6);
  });

  it('un angle sur un axe donne un triangle DÉGÉNÉRÉ, et le signale', () => {
    expect(inscribedTriangle(0, ORIGIN, UNIT, 1).degenerate).toBe(true);
    expect(inscribedTriangle(90, ORIGIN, UNIT, 1).degenerate).toBe(true);
    expect(inscribedTriangle(180, ORIGIN, UNIT, 1).degenerate).toBe(true);
    expect(inscribedTriangle(45, ORIGIN, UNIT, 1).degenerate).toBe(false);
  });

  it('le carré de l’angle droit est tracé', () => {
    expect(inscribedTriangle(45, ORIGIN, UNIT, 1).rightAngle).toMatch(/^M.*L.*L/);
  });
});

describe('le triangle libre (§9)', () => {
  const BOX = { x: 0, y: 0, width: 600, height: 400 };

  it('les trois sommets tiennent DANS la boîte', () => {
    const t = freeTriangle({ opposite: 3, adjacent: 4 }, BOX);
    for (const vertex of [t.vertexAngle, t.vertexRight, t.vertexTop]) {
      expect(vertex.x).toBeGreaterThanOrEqual(0);
      expect(vertex.x).toBeLessThanOrEqual(BOX.width);
      expect(vertex.y).toBeGreaterThanOrEqual(0);
      expect(vertex.y).toBeLessThanOrEqual(BOX.height);
    }
  });

  it('la poignée garde de la marge à DROITE (régression : elle touchait le panneau)', () => {
    // Un triangle très plat est le cas où la poignée était collée au bord.
    const flat = freeTriangle({ opposite: 1, adjacent: 40 }, BOX);
    expect(BOX.width - flat.vertexTop.x).toBeGreaterThanOrEqual(56);
  });

  it('l’angle droit est en bas à droite, θ en bas à gauche (le manuel)', () => {
    const t = freeTriangle({ opposite: 3, adjacent: 4 }, BOX);
    expect(t.vertexAngle.x).toBeLessThan(t.vertexRight.x);
    expect(t.vertexAngle.y).toBe(t.vertexRight.y);
    expect(t.vertexTop.y).toBeLessThan(t.vertexRight.y);
  });

  it('3-4-5 et 30-40-50 se dessinent PAREIL — c’est la leçon (§9)', () => {
    const small = freeTriangle({ opposite: 3, adjacent: 4 }, BOX);
    const large = freeTriangle({ opposite: 30, adjacent: 40 }, BOX);
    const shape = (t) => ({
      w: Math.round(t.vertexRight.x - t.vertexAngle.x),
      h: Math.round(t.vertexRight.y - t.vertexTop.y),
    });
    expect(shape(small)).toEqual(shape(large));
  });

  it('refuse un côté nul ou une boîte plate', () => {
    expect(freeTriangle({ opposite: 0, adjacent: 4 }, BOX)).toBeNull();
    expect(freeTriangle({ opposite: 3, adjacent: 4 }, { x: 0, y: 0, width: 10, height: 10 })).toBeNull();
  });
});

describe('les marqueurs et l’arc entre deux angles', () => {
  it('les angles remarquables sont posés sur le cercle, 360° exclu (doublon de 0°)', () => {
    const markers = specialMarkers([0, 90, 180, 270, 360], ORIGIN, UNIT, 1);
    expect(markers).toHaveLength(4);
    expect(markers[0].point).toEqual({ x: 250, y: 150 });
  });

  it('l’arc entre deux angles se dessine, et rien pour un écart nul (§34)', () => {
    expect(betweenArc(30, 150, ORIGIN, UNIT, 1)).toMatch(/^M/);
    expect(betweenArc(30, 30, ORIGIN, UNIT, 1)).toBe('');
  });
});
