import { describe, it, expect } from 'vitest';
import { Rational, rationalEquals, normalizeNumeric } from './rational.js';

const str = (raw) => { const r = Rational.parse(raw); return r ? r.toString() : null; };

describe('Rational.parse — saisies françaises', () => {
  it('lit les entiers et les décimaux à la virgule', () => {
    expect(str('4')).toBe('4');
    expect(str('-3')).toBe('-3');
    expect(str('3,5')).toBe('7/2');
    expect(str('3.5')).toBe('7/2');
    expect(str('0,25')).toBe('1/4');
  });

  it('accepte le VRAI moins typographique U+2212, que parseDec refuse', () => {
    // formatDec / affineText ÉCRIVENT U+2212 ; une valeur affichée doit se relire.
    expect(str('\u22123,5')).toBe('-7/2');
    expect(str('\u22124')).toBe('-4');
  });

  it("absorbe l'espace fine insécable que fr-FR insère dans les milliers", () => {
    expect(str('1\u202F250,5')).toBe('2501/2');
    expect(str('1\u00A0250')).toBe('1250');
  });

  it('lit les fractions et les réduit', () => {
    expect(str('7/2')).toBe('7/2');
    expect(str('6/8')).toBe('3/4');
    expect(str('-6/8')).toBe('-3/4');
    expect(str('6/-8')).toBe('-3/4'); // le signe migre au numérateur
    expect(str('\\frac{7}{2}')).toBe('7/2');
  });

  it('lit un pourcentage', () => {
    expect(str('50%')).toBe('1/2');
  });

  it("accepte un + de tête (une expression découpée en termes signés en produit)", () => {
    expect(str('+2')).toBe('2');
  });

  it('refuse ce qui n\'est pas un nombre — null, jamais une valeur par défaut', () => {
    for (const bad of ['', '   ', 'abc', '3,5,2', '1/0', 'x', '2x', null, undefined, {}, NaN]) {
      expect(Rational.parse(bad)).toBeNull();
    }
  });
});

describe('arithmétique exacte', () => {
  it('0,1 + 0,2 vaut exactement 0,3 — ce que les flottants ne garantissent pas', () => {
    expect(0.1 + 0.2).not.toBe(0.3); // le piège qu'on évite
    const sum = Rational.parse('0,1').add(Rational.parse('0,2'));
    expect(sum.equals(Rational.parse('0,3'))).toBe(true);
  });

  it('compare par produit en croix, sans flottant', () => {
    expect(Rational.parse('1/3').compare(Rational.parse('2/6'))).toBe(0);
    expect(Rational.parse('1/3').compare(Rational.parse('1/2'))).toBe(-1);
    expect(Rational.parse('7,5').compare(Rational.parse('15/2'))).toBe(0);
  });

  it('reconnaît deux écritures du même nombre', () => {
    expect(Rational.parse('1,5').equals(Rational.parse('3/2'))).toBe(true);
    expect(Rational.parse('0,5').equals(Rational.parse('50%'))).toBe(true);
  });

  it('applique une tolérance rationnelle quand la question la déclare', () => {
    const given = Rational.parse('3,14');
    const expected = Rational.parse('3,1416');
    expect(rationalEquals(given, expected, null)).toBe(false);
    expect(rationalEquals(given, expected, Rational.parse('0,01'))).toBe(true);
  });

  it('refuse les composantes trop grandes plutôt que de déborder', () => {
    expect(Rational.parse('123456789012345678')).toBeNull();
  });
});

describe('normalizeNumeric', () => {
  it('remplace TOUTES les virgules, pas seulement la première', () => {
    expect(normalizeNumeric('0,5x+1,5')).toBe('0.5x+1.5');
  });
});
