/**
 * La mathématique du مختبر المثلثات, prouvée (§49).
 *
 * Ce que ces tests défendent avant tout, c'est l'HONNÊTETÉ numérique (§40) :
 * `cos(90°)` doit valoir 0 et non 6,12e−17 ; `tan(90°)` doit être indéfini et
 * non 1,6e+16. Un instrument qui se trompe là enseigne une fausseté à chaque
 * ouverture.
 */

import { describe, it, expect } from 'vitest';
import {
  clean, degToRad, radToDeg, normalizeDegrees, normalizeRadians, turnsIn,
  sinOf, cosOf, tanOf, pointAt, angleOfPoint, quadrantOf, signOf, signsAt,
  quadrantSigns, solveRightTriangle, ratiosFromTriangle, arcsinOf, arccosOf,
  arctanOf, pythagoreanIdentity, arcLength, symmetryOf, stateAt, EPSILON,
} from './trigMath.js';

const near = (value, expected, tolerance = 1e-9) => Math.abs(value - expected) <= tolerance;

describe('clean — le zéro qui n’en est pas un (§40)', () => {
  it('ramène à 0 l’erreur machine', () => {
    expect(clean(6.123233995736766e-17)).toBe(0);
    expect(clean(-1e-15)).toBe(0);
  });

  it('ramène à ±1 ce qui le frôle', () => {
    expect(clean(0.9999999999999999)).toBe(1);
    expect(clean(-0.9999999999999999)).toBe(-1);
  });

  it('ne touche pas une valeur franche', () => {
    expect(clean(0.5)).toBe(0.5);
    expect(clean(0.8660254037844386)).toBe(0.8660254037844386);
  });

  it('rend NaN pour ce qui n’est pas un nombre', () => {
    expect(clean(Infinity)).toBeNaN();
    expect(clean(NaN)).toBeNaN();
  });
});

describe('conversions degrés ↔ radians (§4)', () => {
  it('180° = π rad', () => {
    expect(near(degToRad(180), Math.PI)).toBe(true);
    expect(near(radToDeg(Math.PI), 180)).toBe(true);
  });

  it('les angles du manuel', () => {
    expect(near(degToRad(30), Math.PI / 6)).toBe(true);
    expect(near(degToRad(45), Math.PI / 4)).toBe(true);
    expect(near(degToRad(60), Math.PI / 3)).toBe(true);
    expect(near(degToRad(90), Math.PI / 2)).toBe(true);
    expect(near(radToDeg(Math.PI / 4), 45)).toBe(true);
  });

  it('l’aller-retour conserve la valeur', () => {
    for (const degrees of [0, 17, 33.7, 150, 359, -40, 450]) {
      expect(near(radToDeg(degToRad(degrees)), degrees, 1e-9)).toBe(true);
    }
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(degToRad(NaN)).toBeNaN();
    expect(radToDeg(Infinity)).toBeNaN();
  });
});

describe('normalisation (§15)', () => {
  it('450° équivaut à 90°', () => {
    expect(normalizeDegrees(450)).toBe(90);
  });

  it('720° équivaut à 0°', () => {
    expect(normalizeDegrees(720)).toBe(0);
  });

  it('−90° équivaut à 270°', () => {
    expect(normalizeDegrees(-90)).toBe(270);
  });

  it('−360° équivaut à 0°', () => {
    expect(normalizeDegrees(-360)).toBe(0);
  });

  it('360° rend 0 et jamais 360', () => {
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(359.9999999999999)).toBe(0);
  });

  it('laisse intact un angle déjà normalisé', () => {
    expect(normalizeDegrees(37)).toBe(37);
    expect(normalizeDegrees(0)).toBe(0);
  });

  it('normalise aussi les radians, au-delà de 2π et en négatif', () => {
    expect(near(normalizeRadians(3 * Math.PI), Math.PI)).toBe(true);
    expect(near(normalizeRadians(-Math.PI / 2), (3 * Math.PI) / 2)).toBe(true);
    expect(normalizeRadians(2 * Math.PI)).toBe(0);
  });

  it('compte les tours (§14)', () => {
    expect(turnsIn(450)).toBe(1);
    expect(turnsIn(720)).toBe(2);
    expect(turnsIn(90)).toBe(0);
    expect(turnsIn(-90)).toBe(-1);
  });
});

describe('sin, cos, tan aux angles remarquables (§6)', () => {
  it('sin(0°) = 0, sin(90°) = 1, sin(180°) = 0, sin(270°) = −1', () => {
    expect(sinOf(0)).toBe(0);
    expect(sinOf(90)).toBe(1);
    expect(sinOf(180)).toBe(0);
    expect(sinOf(270)).toBe(-1);
  });

  it('cos(0°) = 1, cos(90°) = 0 — EXACTEMENT 0, pas 6e−17 (§40)', () => {
    expect(cosOf(0)).toBe(1);
    expect(cosOf(90)).toBe(0);
    expect(cosOf(180)).toBe(-1);
    expect(cosOf(270)).toBe(0);
  });

  it('sin(30°) = 1/2', () => {
    expect(near(sinOf(30), 0.5)).toBe(true);
  });

  it('cos(60°) = 1/2 et sin(60°) = √3/2', () => {
    expect(near(cosOf(60), 0.5)).toBe(true);
    expect(near(sinOf(60), Math.sqrt(3) / 2)).toBe(true);
  });

  it('sin(45°) = cos(45°) = √2/2', () => {
    expect(near(sinOf(45), Math.SQRT1_2)).toBe(true);
    expect(near(cosOf(45), Math.SQRT1_2)).toBe(true);
  });

  it('tan(45°) = 1 exactement', () => {
    expect(tanOf(45)).toBe(1);
  });

  it('tan(30°) = √3/3 et tan(60°) = √3', () => {
    expect(near(tanOf(30), Math.sqrt(3) / 3)).toBe(true);
    expect(near(tanOf(60), Math.sqrt(3))).toBe(true);
  });
});

describe('la tangente indéfinie (§11, §23)', () => {
  it('tan(90°) est null, pas un nombre géant', () => {
    expect(tanOf(90)).toBeNull();
    // Ce que Math.tan rendrait, et que l’instrument refuse d’afficher :
    expect(Math.abs(Math.tan(Math.PI / 2))).toBeGreaterThan(1e15);
  });

  it('tan(270°) est null', () => {
    expect(tanOf(270)).toBeNull();
  });

  it('tan(450°) est null aussi — la périodicité vaut pour l’indéfini', () => {
    expect(tanOf(450)).toBeNull();
    expect(tanOf(-90)).toBeNull();
  });

  it('tan reste FINI et grand juste avant 90°', () => {
    const value = tanOf(89.9);
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeGreaterThan(500);
  });

  it('tan(180°) vaut 0, pas indéfini — c’est sin qui s’annule', () => {
    expect(tanOf(180)).toBe(0);
    expect(tanOf(0)).toBe(0);
  });
});

describe('le point du cercle et l’angle qu’il porte (§3)', () => {
  it('30° donne (√3/2 ; 1/2)', () => {
    const p = pointAt(30);
    expect(near(p.x, Math.sqrt(3) / 2)).toBe(true);
    expect(near(p.y, 0.5)).toBe(true);
  });

  it('90° donne (0 ; 1) — l’abscisse est un vrai zéro', () => {
    expect(pointAt(90)).toEqual({ x: 0, y: 1 });
  });

  it('le rayon met le point à l’échelle (§17)', () => {
    const p = pointAt(0, 3);
    expect(p).toEqual({ x: 3, y: 0 });
  });

  it('l’angle d’un point, normalisé dans [0, 360[', () => {
    expect(angleOfPoint(1, 0)).toBe(0);
    expect(near(angleOfPoint(0, 1), 90)).toBe(true);
    expect(near(angleOfPoint(-1, 0), 180)).toBe(true);
    // atan2 rendrait −90 : l’élève doit lire 270.
    expect(near(angleOfPoint(0, -1), 270)).toBe(true);
  });

  it('le centre n’a pas de direction', () => {
    expect(angleOfPoint(0, 0)).toBeNaN();
  });

  it('point → angle → point est un aller-retour fidèle', () => {
    for (const degrees of [0, 17, 45, 123, 250, 359]) {
      const p = pointAt(degrees);
      expect(near(angleOfPoint(p.x, p.y), degrees, 1e-9)).toBe(true);
    }
  });
});

describe('quadrants et signes (§5, §20)', () => {
  it('nomme les quatre quadrants', () => {
    expect(quadrantOf(45).quadrant).toBe(1);
    expect(quadrantOf(135).quadrant).toBe(2);
    expect(quadrantOf(225).quadrant).toBe(3);
    expect(quadrantOf(315).quadrant).toBe(4);
  });

  it('un angle SUR un axe n’est dans aucun quadrant', () => {
    expect(quadrantOf(0)).toEqual({ quadrant: 0, axis: 'x+' });
    expect(quadrantOf(90)).toEqual({ quadrant: 0, axis: 'y+' });
    expect(quadrantOf(180)).toEqual({ quadrant: 0, axis: 'x-' });
    expect(quadrantOf(270)).toEqual({ quadrant: 0, axis: 'y-' });
    expect(quadrantOf(360)).toEqual({ quadrant: 0, axis: 'x+' });
  });

  it('le quadrant suit la normalisation', () => {
    expect(quadrantOf(405).quadrant).toBe(1);
    expect(quadrantOf(-45).quadrant).toBe(4);
  });

  it('les signes du quadrant II : sin +, cos −, tan −', () => {
    expect(signsAt(135)).toEqual({ sin: 1, cos: -1, tan: -1 });
  });

  it('les signes des quatre quadrants', () => {
    expect(signsAt(45)).toEqual({ sin: 1, cos: 1, tan: 1 });
    expect(signsAt(225)).toEqual({ sin: -1, cos: -1, tan: 1 });
    expect(signsAt(315)).toEqual({ sin: -1, cos: 1, tan: -1 });
  });

  it('à 90°, cos est nul et tan n’a pas de signe', () => {
    expect(signsAt(90)).toEqual({ sin: 1, cos: 0, tan: null });
  });

  it('la table des quadrants est cohérente avec les angles qui y vivent', () => {
    const middles = { 1: 45, 2: 135, 3: 225, 4: 315 };
    for (const quadrant of [1, 2, 3, 4]) {
      expect(quadrantSigns(quadrant)).toEqual(signsAt(middles[quadrant]));
    }
  });

  it('signOf distingue 0, null et les deux signes', () => {
    expect(signOf(0)).toBe(0);
    expect(signOf(null)).toBeNull();
    expect(signOf(2)).toBe(1);
    expect(signOf(-2)).toBe(-1);
  });
});

describe('le triangle rectangle (§9) — le sujet 4.2 du programme', () => {
  it('θ = 35°, hyp = 10 : opp ≈ 5,74 et adj ≈ 8,19', () => {
    const t = solveRightTriangle('angle-hyp', { angle: 35, hypotenuse: 10 });
    expect(t.ok).toBe(true);
    expect(near(t.opposite, 5.7358, 1e-3)).toBe(true);
    expect(near(t.adjacent, 8.1915, 1e-3)).toBe(true);
    expect(t.otherAngle).toBe(55);
  });

  it('le triplet 3-4-5 se retrouve dans les deux sens', () => {
    const fromSides = solveRightTriangle('opp-adj', { opposite: 3, adjacent: 4 });
    expect(near(fromSides.hypotenuse, 5)).toBe(true);
    expect(near(fromSides.angle, 36.8699, 1e-3)).toBe(true);

    const fromHyp = solveRightTriangle('opp-hyp', { opposite: 3, hypotenuse: 5 });
    expect(near(fromHyp.adjacent, 4)).toBe(true);
    expect(near(fromHyp.angle, 36.8699, 1e-3)).toBe(true);

    const fromAdj = solveRightTriangle('adj-hyp', { adjacent: 4, hypotenuse: 5 });
    expect(near(fromAdj.opposite, 3)).toBe(true);
  });

  it('θ = 30°, hyp = 10 : le côté opposé vaut exactement la moitié', () => {
    const t = solveRightTriangle('angle-hyp', { angle: 30, hypotenuse: 10 });
    expect(near(t.opposite, 5)).toBe(true);
  });

  it('θ et le côté opposé suffisent', () => {
    const t = solveRightTriangle('angle-opp', { angle: 30, opposite: 5 });
    expect(near(t.hypotenuse, 10)).toBe(true);
    expect(near(t.adjacent, 5 * Math.sqrt(3))).toBe(true);
  });

  it('θ et le côté adjacent suffisent', () => {
    const t = solveRightTriangle('angle-adj', { angle: 45, adjacent: 7 });
    expect(near(t.opposite, 7)).toBe(true);
    expect(near(t.hypotenuse, 7 * Math.SQRT2)).toBe(true);
  });

  it('les deux angles aigus sont complémentaires', () => {
    for (const angle of [10, 35, 60, 89]) {
      const t = solveRightTriangle('angle-hyp', { angle, hypotenuse: 4 });
      expect(near(t.angle + t.otherAngle, 90)).toBe(true);
    }
  });

  it('Pythagore est vérifié par toute solution', () => {
    for (const given of [
      ['angle-hyp', { angle: 25, hypotenuse: 9 }],
      ['angle-opp', { angle: 70, opposite: 3 }],
      ['angle-adj', { angle: 12, adjacent: 15 }],
      ['opp-adj', { opposite: 6, adjacent: 2.5 }],
    ]) {
      const t = solveRightTriangle(given[0], given[1]);
      expect(t.ok).toBe(true);
      expect(near(t.opposite ** 2 + t.adjacent ** 2, t.hypotenuse ** 2, 1e-6)).toBe(true);
    }
  });

  it('refuse un angle qui n’est pas aigu — un triangle rectangle n’en a qu’un', () => {
    expect(solveRightTriangle('angle-hyp', { angle: 90, hypotenuse: 10 })).toEqual({ ok: false, reason: 'angle' });
    expect(solveRightTriangle('angle-hyp', { angle: 120, hypotenuse: 10 }).ok).toBe(false);
    expect(solveRightTriangle('angle-hyp', { angle: 0, hypotenuse: 10 }).ok).toBe(false);
    expect(solveRightTriangle('angle-hyp', { angle: -20, hypotenuse: 10 }).ok).toBe(false);
  });

  it('refuse un côté nul ou négatif', () => {
    expect(solveRightTriangle('angle-hyp', { angle: 30, hypotenuse: 0 })).toEqual({ ok: false, reason: 'side' });
    expect(solveRightTriangle('opp-adj', { opposite: -3, adjacent: 4 }).ok).toBe(false);
  });

  it('refuse une hypoténuse qui n’est pas le plus grand côté', () => {
    expect(solveRightTriangle('opp-hyp', { opposite: 5, hypotenuse: 3 })).toEqual({ ok: false, reason: 'hypotenuse' });
    expect(solveRightTriangle('adj-hyp', { adjacent: 5, hypotenuse: 5 }).ok).toBe(false);
  });

  it('refuse une configuration inconnue', () => {
    expect(solveRightTriangle('rien', {}).ok).toBe(false);
  });

  it('les rapports LUS SUR LES CÔTÉS sont ceux de l’angle (§10)', () => {
    const t = solveRightTriangle('angle-hyp', { angle: 35, hypotenuse: 10 });
    const r = ratiosFromTriangle(t);
    expect(near(r.sin, sinOf(35), 1e-9)).toBe(true);
    expect(near(r.cos, cosOf(35), 1e-9)).toBe(true);
    expect(near(r.tan, tanOf(35), 1e-9)).toBe(true);
  });

  it('un triangle dégénéré ne rend pas Infinity mais null', () => {
    expect(ratiosFromTriangle({ opposite: 3, adjacent: 0, hypotenuse: 3 }).tan).toBeNull();
    expect(ratiosFromTriangle({ opposite: 1, adjacent: 1, hypotenuse: 0 }).sin).toBeNull();
  });
});

describe('fonctions réciproques (§24)', () => {
  it('arcsin(0,5) : 30° en principale, et 150° comme seconde solution', () => {
    const r = arcsinOf(0.5);
    expect(near(r.principal, 30, 1e-9)).toBe(true);
    expect(r.solutions.length).toBe(2);
    expect(near(r.solutions[0], 30, 1e-9)).toBe(true);
    expect(near(r.solutions[1], 150, 1e-9)).toBe(true);
  });

  it('arccos(−1/2) : 120°, et 240°', () => {
    const r = arccosOf(-0.5);
    expect(near(r.principal, 120, 1e-9)).toBe(true);
    expect(near(r.solutions[0], 120, 1e-9)).toBe(true);
    expect(near(r.solutions[1], 240, 1e-9)).toBe(true);
  });

  it('arctan(1) : 45° et 225°', () => {
    const r = arctanOf(1);
    expect(near(r.principal, 45, 1e-9)).toBe(true);
    expect(near(r.solutions[1], 225, 1e-9)).toBe(true);
  });

  it('arcsin refuse hors de [−1, 1] — il n’y a pas d’angle dont le sinus vaut 2', () => {
    expect(arcsinOf(2)).toBeNull();
    expect(arcsinOf(-1.5)).toBeNull();
    expect(arccosOf(3)).toBeNull();
  });

  it('arctan accepte tout ℝ — c’est ce qui le distingue', () => {
    expect(arctanOf(1000)).not.toBeNull();
    expect(near(arctanOf(1000).principal, 89.9427, 1e-3)).toBe(true);
  });

  it('aux bornes, une seule solution et non deux confondues', () => {
    expect(arcsinOf(1).solutions).toEqual([90]);
    expect(arccosOf(1).solutions).toEqual([0]);
  });

  it('les solutions rendues ont bien le rapport demandé', () => {
    for (const value of [-0.9, -0.5, 0, 0.3, 0.5, 0.87]) {
      for (const angle of arcsinOf(value).solutions) {
        expect(near(sinOf(angle), value, 1e-9)).toBe(true);
      }
      for (const angle of arccosOf(value).solutions) {
        expect(near(cosOf(angle), value, 1e-9)).toBe(true);
      }
    }
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(arcsinOf(NaN)).toBeNull();
    expect(arctanOf(Infinity)).toBeNull();
  });
});

describe('l’identité sin²θ + cos²θ = 1 (§22)', () => {
  it('la somme vaut EXACTEMENT 1, jamais 0,9999999999999999', () => {
    for (const angle of [0, 17, 30, 45, 60, 90, 123.456, 180, 270, 359, -40, 450]) {
      const identity = pythagoreanIdentity(angle);
      expect(identity.sum).toBe(1);
      expect(identity.holds).toBe(true);
    }
  });

  it('les deux parts se compensent : à 0° tout est dans cos, à 90° tout dans sin', () => {
    expect(pythagoreanIdentity(0)).toMatchObject({ sinSquared: 0, cosSquared: 1 });
    expect(pythagoreanIdentity(90)).toMatchObject({ sinSquared: 1, cosSquared: 0 });
  });

  it('à 45° les deux parts sont égales', () => {
    const identity = pythagoreanIdentity(45);
    expect(near(identity.sinSquared, 0.5)).toBe(true);
    expect(near(identity.cosSquared, 0.5)).toBe(true);
  });
});

describe('la longueur d’arc (§16, §17)', () => {
  it('sur le cercle unité, l’arc EST la mesure en radians', () => {
    expect(near(arcLength(1, 180), Math.PI)).toBe(true);
    expect(near(arcLength(1, 90), Math.PI / 2)).toBe(true);
    expect(near(arcLength(1, 360), 2 * Math.PI)).toBe(true);
  });

  it('ℓ = r·θ pour un rayon quelconque', () => {
    expect(near(arcLength(3, 180), 3 * Math.PI)).toBe(true);
    expect(near(arcLength(2, 90), Math.PI)).toBe(true);
  });

  it('un angle négatif donne une longueur positive', () => {
    expect(near(arcLength(1, -90), Math.PI / 2)).toBe(true);
  });

  it('refuse un rayon négatif', () => {
    expect(arcLength(-1, 90)).toBeNaN();
  });

  it('un rayon nul donne un arc nul', () => {
    expect(arcLength(0, 90)).toBe(0);
  });
});

describe('les symétries (§21)', () => {
  it('sin(−θ) = −sin θ et cos(−θ) = cos θ', () => {
    const s = symmetryOf(40, 'negate');
    expect(s.image).toBe(320);
    expect(near(s.values.sin, -s.origin.sin, 1e-9)).toBe(true);
    expect(near(s.values.cos, s.origin.cos, 1e-9)).toBe(true);
  });

  it('sin(180° − θ) = sin θ et cos(180° − θ) = −cos θ', () => {
    const s = symmetryOf(40, 'supplement');
    expect(s.image).toBe(140);
    expect(near(s.values.sin, s.origin.sin, 1e-9)).toBe(true);
    expect(near(s.values.cos, -s.origin.cos, 1e-9)).toBe(true);
  });

  it('sin(180° + θ) = −sin θ et cos(180° + θ) = −cos θ', () => {
    const s = symmetryOf(40, 'opposite');
    expect(s.image).toBe(220);
    expect(near(s.values.sin, -s.origin.sin, 1e-9)).toBe(true);
    expect(near(s.values.cos, -s.origin.cos, 1e-9)).toBe(true);
  });

  it('sin(90° − θ) = cos θ — la complémentarité du manuel de 4AM', () => {
    const s = symmetryOf(40, 'complement');
    expect(s.image).toBe(50);
    expect(near(s.values.sin, s.origin.cos, 1e-9)).toBe(true);
    expect(near(s.values.cos, s.origin.sin, 1e-9)).toBe(true);
  });

  it('refuse une symétrie inconnue', () => {
    expect(symmetryOf(40, 'rien')).toBeNull();
    expect(symmetryOf(NaN, 'negate')).toBeNull();
  });
});

describe('stateAt — tout ce que l’interface lit d’un angle (§31)', () => {
  it('à 450°, garde l’angle d’origine ET son équivalent', () => {
    const state = stateAt(450);
    expect(state.degrees).toBe(450);
    expect(state.normalized).toBe(90);
    expect(state.turns).toBe(1);
    expect(state.isNormalized).toBe(false);
    expect(state.sin).toBe(1);
    expect(state.tan).toBeNull();
  });

  it('à 60°, le point, les rapports et le quadrant', () => {
    const state = stateAt(60);
    expect(state.isNormalized).toBe(true);
    expect(near(state.point.x, 0.5)).toBe(true);
    expect(near(state.point.y, Math.sqrt(3) / 2)).toBe(true);
    expect(state.quadrant).toBe(1);
    expect(state.identity.sum).toBe(1);
  });

  it('le rayon met le point à l’échelle mais PAS les rapports', () => {
    const state = stateAt(60, 3);
    expect(near(state.point.x, 1.5)).toBe(true);
    // sin reste un rapport : il ne dépend pas du rayon (§26, expérience E).
    expect(near(state.sin, Math.sqrt(3) / 2)).toBe(true);
    expect(near(state.unitPoint.y, Math.sqrt(3) / 2)).toBe(true);
  });

  it('n’explose sur aucun angle d’un balayage complet', () => {
    for (let degrees = -720; degrees <= 1080; degrees += 0.5) {
      const state = stateAt(degrees);
      expect(Number.isFinite(state.sin)).toBe(true);
      expect(Number.isFinite(state.cos)).toBe(true);
      expect(state.tan === null || Number.isFinite(state.tan)).toBe(true);
      expect(Math.abs(state.sin)).toBeLessThanOrEqual(1 + EPSILON);
      expect(Math.abs(state.cos)).toBeLessThanOrEqual(1 + EPSILON);
    }
  });
});
