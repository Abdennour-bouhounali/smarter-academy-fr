/**
 * L'affichage : ce que l'élève LIT (§19, §36, §40, §49).
 *
 * Deux exigences croisées se vérifient ici :
 *   — §19 : jamais `0.7071067811865476` quand `√2/2` existe ;
 *   — §36/ARABIC_RTL_CONTRACT : chiffres LATINS, virgule décimale, vrai
 *     signe moins, et une notation qui se lit de gauche à droite.
 */

import { describe, it, expect } from 'vitest';
import {
  exactToText, exactToLatex, formatRatio, formatDegrees, formatRadians,
  radiansToLatex, formatPoint, formatSign, formatLength, quadrantKey,
  UNDEFINED_MARK,
} from './trigFormat.js';
import { exactValue } from './exactValues.js';
import { sinOf, cosOf, tanOf, pointAt, quadrantOf } from './trigMath.js';

describe('les formes exactes écrites (§19)', () => {
  it('√3/2', () => {
    expect(exactToText(exactValue(30, 'cos'))).toBe('√3/2');
  });

  it('1/2 — et non 1√1/2', () => {
    expect(exactToText(exactValue(30, 'sin'))).toBe('1/2');
  });

  it('√2/2', () => {
    expect(exactToText(exactValue(45, 'sin'))).toBe('√2/2');
  });

  it('√3 — sans dénominateur superflu', () => {
    expect(exactToText(exactValue(60, 'tan'))).toBe('√3');
  });

  it('1 et −1 s’écrivent nus', () => {
    expect(exactToText(exactValue(45, 'tan'))).toBe('1');
    expect(exactToText(exactValue(135, 'tan'))).toBe('−1');
    expect(exactToText(exactValue(180, 'cos'))).toBe('−1');
  });

  it('0 n’a pas de signe', () => {
    expect(exactToText(exactValue(0, 'sin'))).toBe('0');
    expect(exactToText(exactValue(180, 'sin'))).toBe('0');
  });

  it('le signe moins est le VRAI (U+2212), pas un trait d’union', () => {
    const text = exactToText(exactValue(120, 'cos'));
    expect(text).toBe('−1/2');
    expect(text.charCodeAt(0)).toBe(0x2212);
  });

  it('l’indéfini s’écrit en toutes lettres, jamais ∞ (§11)', () => {
    expect(exactToText(exactValue(90, 'tan'))).toBe(UNDEFINED_MARK);
    expect(exactToText(exactValue(90, 'tan'))).not.toContain('∞');
  });

  it('en LaTeX, la fraction et la racine', () => {
    expect(exactToLatex(exactValue(30, 'cos'))).toBe('\\frac{\\sqrt{3}}{2}');
    expect(exactToLatex(exactValue(30, 'sin'))).toBe('\\frac{1}{2}');
    expect(exactToLatex(exactValue(60, 'tan'))).toBe('\\sqrt{3}');
    expect(exactToLatex(exactValue(120, 'cos'))).toBe('-\\frac{1}{2}');
    // Un indéfini n’a pas de LaTeX : c’est un mot, pas une formule.
    expect(exactToLatex(exactValue(90, 'tan'))).toBeNull();
  });
});

describe('la lecture d’un rapport (§19)', () => {
  it('en mode exact, un angle remarquable rend sa forme ET son approximation', () => {
    const reading = formatRatio(60, 'sin', sinOf(60), 'exact');
    expect(reading.text).toBe('√3/2');
    expect(reading.approx).toBe('0,87');
    expect(reading.isExact).toBe(true);
  });

  it('une forme entière n’a pas besoin d’approximation', () => {
    expect(formatRatio(90, 'sin', sinOf(90), 'exact')).toMatchObject({ text: '1', approx: null });
    expect(formatRatio(0, 'sin', sinOf(0), 'exact')).toMatchObject({ text: '0', approx: null });
  });

  it('en mode décimal, la valeur décimale même pour un angle remarquable', () => {
    const reading = formatRatio(60, 'sin', sinOf(60), 'decimal');
    expect(reading.text).toBe('0,866');
    expect(reading.isExact).toBe(false);
  });

  it('un angle quelconque n’a pas de forme exacte : il rend la décimale', () => {
    const reading = formatRatio(37, 'sin', sinOf(37), 'exact');
    expect(reading.isExact).toBe(false);
    expect(reading.text).toBe('0,6018');
  });

  it('JAMAIS de bruit flottant (§40)', () => {
    for (const angle of [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360]) {
      for (const ratio of ['sin', 'cos', 'tan']) {
        const value = ratio === 'sin' ? sinOf(angle) : ratio === 'cos' ? cosOf(angle) : tanOf(angle);
        const reading = formatRatio(angle, ratio, value, 'exact');
        expect(reading.text, `${ratio}(${angle}°)`).not.toMatch(/0000000|9999999|e-|e\+/);
      }
    }
  });

  it('un rapport inexistant rend le mot, et le signale', () => {
    const reading = formatRatio(90, 'tan', tanOf(90), 'exact');
    expect(reading.isUndefined).toBe(true);
    expect(reading.text).toBe(UNDEFINED_MARK);
  });

  it('en mode décimal aussi, l’indéfini reste indéfini', () => {
    expect(formatRatio(90, 'tan', tanOf(90), 'decimal').isUndefined).toBe(true);
  });
});

describe('les angles écrits (§4)', () => {
  it('les degrés portent leur symbole', () => {
    expect(formatDegrees(45)).toBe('45°');
    expect(formatDegrees(450)).toBe('450°');
  });

  it('un angle négatif prend le vrai signe moins', () => {
    expect(formatDegrees(-90)).toBe('−90°');
    expect(formatDegrees(-90).charCodeAt(0)).toBe(0x2212);
  });

  it('la virgule décimale, pas le point', () => {
    expect(formatDegrees(33.5)).toBe('33,5°');
  });

  it('les radians en fraction de π', () => {
    expect(formatRadians(45)).toBe('π/4');
    expect(formatRadians(60)).toBe('π/3');
    expect(formatRadians(120)).toBe('2π/3');
    expect(formatRadians(180)).toBe('π');
    expect(formatRadians(360)).toBe('2π');
    expect(formatRadians(0)).toBe('0');
    expect(formatRadians(-90)).toBe('−π/2');
  });

  it('un angle sans belle fraction rend sa décimale', () => {
    expect(formatRadians(37)).toBe('0,646');
  });

  it('les radians en LaTeX', () => {
    expect(radiansToLatex(45)).toBe('\\frac{\\pi}{4}');
    expect(radiansToLatex(180)).toBe('\\pi');
    expect(radiansToLatex(120)).toBe('\\frac{2\\pi}{3}');
    expect(radiansToLatex(37)).toBeNull();
  });
});

describe('le point, le signe, la longueur', () => {
  it('le couple en formes exactes (§31)', () => {
    expect(formatPoint(60, pointAt(60), 'exact')).toBe('(1/2 ; √3/2)');
    expect(formatPoint(30, pointAt(30), 'exact')).toBe('(√3/2 ; 1/2)');
    expect(formatPoint(90, pointAt(90), 'exact')).toBe('(0 ; 1)');
  });

  it('le couple en décimal', () => {
    expect(formatPoint(60, pointAt(60), 'decimal')).toBe('(0,5 ; 0,866)');
  });

  it('le séparateur est un point-virgule — la virgule est déjà le séparateur décimal', () => {
    const text = formatPoint(37, pointAt(37), 'decimal');
    expect(text).toContain(' ; ');
    expect(text.match(/;/g)).toHaveLength(1);
  });

  it('les signes de la table (§20)', () => {
    expect(formatSign(1)).toBe('+');
    expect(formatSign(-1)).toBe('−');
    expect(formatSign(0)).toBe('0');
    expect(formatSign(null)).toBe(UNDEFINED_MARK);
  });

  it('une longueur, deux décimales', () => {
    expect(formatLength(5.7358)).toBe('5,74');
    expect(formatLength(10)).toBe('10');
  });

  it('une valeur absente rend un tiret, jamais NaN', () => {
    expect(formatLength(NaN)).toBe('—');
    expect(formatDegrees(NaN)).toBe('—');
    expect(formatPoint(0, null)).toBe('—');
  });
});

describe('les clés de quadrant (§5)', () => {
  it('nomme les quatre quadrants', () => {
    expect(quadrantKey(quadrantOf(45))).toBe('tools.trigonometry.quadrants.q1');
    expect(quadrantKey(quadrantOf(135))).toBe('tools.trigonometry.quadrants.q2');
    expect(quadrantKey(quadrantOf(225))).toBe('tools.trigonometry.quadrants.q3');
    expect(quadrantKey(quadrantOf(315))).toBe('tools.trigonometry.quadrants.q4');
  });

  it('nomme les axes plutôt que d’inventer un quadrant', () => {
    expect(quadrantKey(quadrantOf(0))).toBe('tools.trigonometry.axes.xPositive');
    expect(quadrantKey(quadrantOf(90))).toBe('tools.trigonometry.axes.yPositive');
    expect(quadrantKey(quadrantOf(180))).toBe('tools.trigonometry.axes.xNegative');
    expect(quadrantKey(quadrantOf(270))).toBe('tools.trigonometry.axes.yNegative');
  });
});

describe('les chiffres restent LATINS (ARABIC_RTL_CONTRACT)', () => {
  it('aucun chiffre arabe-indien nulle part', () => {
    const samples = [
      formatDegrees(45), formatRadians(120), formatLength(5.74),
      formatPoint(60, pointAt(60), 'exact'), formatPoint(37, pointAt(37), 'decimal'),
      exactToText(exactValue(30, 'cos')), formatRatio(60, 'sin', sinOf(60), 'exact').text,
    ];
    for (const sample of samples) {
      expect(sample, sample).not.toMatch(/[٠-٩]/);
    }
  });

  it('aucun point décimal anglo-saxon', () => {
    expect(formatDegrees(33.5)).not.toContain('.');
    expect(formatLength(5.74)).not.toContain('.');
  });
});
