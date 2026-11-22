/**
 * La table des valeurs exactes, PROUVÉE contre Math (§19, §49).
 *
 * Une table écrite à la main est une source d'erreurs silencieuses : une
 * ligne fautive donnerait « sin(150°) = −1/2 » sans que rien ne proteste. Le
 * premier test de ce fichier compare donc CHAQUE entrée de CHAQUE angle à la
 * fonction trigonométrique correspondante. La table ne peut plus mentir.
 */

import { describe, it, expect } from 'vitest';
import {
  SPECIAL_ANGLES, SPECIAL_DEGREES, CURRICULUM_ANGLES, exactAt, exactValue,
  isSpecialAngle, numericOf, snapToSpecial, radianFraction,
} from './exactValues.js';
import { sinOf, cosOf, tanOf, degToRad } from './trigMath.js';

const near = (a, b, tolerance = 1e-12) => Math.abs(a - b) <= tolerance;

describe('la table dit la vérité — chaque entrée contre Math (§19)', () => {
  it('sin, cos et tan de chacun des seize angles', () => {
    for (const entry of SPECIAL_ANGLES) {
      const sin = numericOf(entry.sin);
      const cos = numericOf(entry.cos);
      expect(near(sin, sinOf(entry.degrees)), `sin(${entry.degrees}°)`).toBe(true);
      expect(near(cos, cosOf(entry.degrees)), `cos(${entry.degrees}°)`).toBe(true);

      if (entry.tan.undefined) {
        expect(tanOf(entry.degrees), `tan(${entry.degrees}°)`).toBeNull();
      } else {
        expect(near(numericOf(entry.tan), tanOf(entry.degrees), 1e-12), `tan(${entry.degrees}°)`).toBe(true);
      }
    }
  });

  it('la mesure en radians de chaque entrée est la bonne', () => {
    for (const entry of SPECIAL_ANGLES) {
      const radians = (entry.radians.numerator * Math.PI) / entry.radians.denominator;
      expect(near(radians, degToRad(entry.degrees), 1e-12), `${entry.degrees}°`).toBe(true);
    }
  });

  it('couvre les seize angles de §6, plus 360°', () => {
    expect(SPECIAL_ANGLES.map((a) => a.degrees)).toEqual([
      0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
    ]);
    expect(SPECIAL_DEGREES.at(-1)).toBe(360);
  });

  it('les trois angles du programme de 4AM sont dedans', () => {
    for (const angle of CURRICULUM_ANGLES) {
      expect(isSpecialAngle(angle)).toBe(true);
    }
  });
});

describe('la reconnaissance d’un angle remarquable', () => {
  it('trouve 45°', () => {
    expect(exactAt(45).degrees).toBe(45);
  });

  it('405° est remarquable PARCE QUE 45° l’est (§14)', () => {
    expect(exactAt(405).degrees).toBe(45);
    expect(isSpecialAngle(405)).toBe(true);
  });

  it('−30° l’est par 330°', () => {
    expect(exactAt(-30).degrees).toBe(330);
  });

  it('37° ne l’est pas — et l’instrument ne fait pas semblant', () => {
    expect(exactAt(37)).toBeNull();
    expect(exactValue(37, 'sin')).toBeNull();
    expect(isSpecialAngle(37)).toBe(false);
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(exactAt(NaN)).toBeNull();
  });
});

describe('les formes exactes rendues', () => {
  it('sin(30°) est 1/2 : numérateur 1, pas de radical, dénominateur 2', () => {
    expect(exactValue(30, 'sin')).toMatchObject({ sign: 1, numerator: 1, radicand: 1, denominator: 2 });
  });

  it('cos(30°) est √3/2', () => {
    expect(exactValue(30, 'cos')).toMatchObject({ sign: 1, numerator: 1, radicand: 3, denominator: 2 });
  });

  it('sin(45°) est √2/2', () => {
    expect(exactValue(45, 'sin')).toMatchObject({ sign: 1, numerator: 1, radicand: 2, denominator: 2 });
  });

  it('tan(60°) est √3 — sans dénominateur', () => {
    expect(exactValue(60, 'tan')).toMatchObject({ sign: 1, numerator: 1, radicand: 3, denominator: 1 });
  });

  it('cos(120°) est −1/2 : le signe est porté, pas le numérateur', () => {
    expect(exactValue(120, 'cos')).toMatchObject({ sign: -1, numerator: 1, denominator: 2 });
  });

  it('tan(90°) est marqué INDÉFINI, jamais un symbole infini (§11)', () => {
    expect(exactValue(90, 'tan')).toEqual({ undefined: true });
    expect(exactValue(270, 'tan')).toEqual({ undefined: true });
    expect(numericOf(exactValue(90, 'tan'))).toBeNull();
  });

  it('numericOf refuse un dénominateur nul plutôt que de rendre Infinity', () => {
    expect(numericOf({ sign: 1, numerator: 1, radicand: 1, denominator: 0 })).toBeNull();
    expect(numericOf(null)).toBeNull();
  });
});

describe('l’aimantation aux angles du manuel (§6)', () => {
  it('s’accroche à 30° depuis 31°', () => {
    expect(snapToSpecial(31)).toBe(30);
  });

  it('ne s’accroche pas depuis 37° — 37° reste atteignable (§28)', () => {
    expect(snapToSpecial(37)).toBeNull();
  });

  it('la distance est ANGULAIRE : 359° s’accroche à 360°, pas à 330°', () => {
    expect(snapToSpecial(359)).toBe(360);
    expect(snapToSpecial(1)).toBe(0);
  });

  it('s’accroche dans le TOUR de l’élève : 722° donne 720°, pas 0°', () => {
    expect(snapToSpecial(722)).toBe(720);
    expect(snapToSpecial(-358)).toBe(-360);
  });

  it('la tolérance se règle', () => {
    expect(snapToSpecial(37, 10)).toBe(30);
    expect(snapToSpecial(31, 0.5)).toBeNull();
  });

  it('l’angle accroché est bien remarquable', () => {
    for (let degrees = 0; degrees < 360; degrees += 0.25) {
      const snapped = snapToSpecial(degrees);
      if (snapped !== null) expect(isSpecialAngle(snapped)).toBe(true);
    }
  });
});

describe('l’écriture d’un angle en radians (§4)', () => {
  it('90° est π/2, réduit — jamais 2π/4', () => {
    expect(radianFraction(90)).toEqual({ numerator: 1, denominator: 2 });
  });

  it('180° est π', () => {
    expect(radianFraction(180)).toEqual({ numerator: 1, denominator: 1 });
  });

  it('360° est 2π', () => {
    expect(radianFraction(360)).toEqual({ numerator: 2, denominator: 1 });
  });

  it('120° est 2π/3', () => {
    expect(radianFraction(120)).toEqual({ numerator: 2, denominator: 3 });
  });

  it('−90° est −π/2', () => {
    expect(radianFraction(-90)).toEqual({ numerator: -1, denominator: 2 });
  });

  it('0° est 0', () => {
    expect(radianFraction(0)).toEqual({ numerator: 0, denominator: 1 });
  });

  it('un angle sans belle fraction rend null plutôt qu’une monstruosité', () => {
    expect(radianFraction(37)).toBeNull();
    expect(radianFraction(33.5)).toBeNull();
  });

  it('la fraction rendue vaut bien l’angle', () => {
    for (const degrees of [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360, 450, -90]) {
      const fraction = radianFraction(degrees);
      if (!fraction) continue;
      const radians = (fraction.numerator * Math.PI) / fraction.denominator;
      expect(near(radians, degToRad(degrees), 1e-12), `${degrees}°`).toBe(true);
    }
  });
});
