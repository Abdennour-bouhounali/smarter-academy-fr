import { describe, it, expect } from 'vitest';
import { roundTo, formatFr, texFr, formatDec, texDec, parseDec, parseFr, decEquals, decimalPlaces, THIN } from './numberFormat';

describe('roundTo', () => {
  it('neutralizes floating-point artifacts', () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
  });
  it('rounds to 0 decimals by default precision usage', () => {
    expect(roundTo(3.14159, 0)).toBe(3);
  });
});

describe('formatFr', () => {
  it('groups thousands with a thin space', () => {
    expect(formatFr(1250)).toBe(`1${THIN}250`);
  });
  it('handles negative numbers with the minus sign', () => {
    expect(formatFr(-2350700)).toBe(`−2${THIN}350${THIN}700`);
  });
  it('returns empty string for null/undefined/NaN', () => {
    expect(formatFr(null)).toBe('');
    expect(formatFr(undefined)).toBe('');
    expect(formatFr(NaN)).toBe('');
  });
  it('truncates decimals (integer formatter)', () => {
    expect(formatFr(4.9)).toBe('4');
  });
});

describe('texFr', () => {
  it('uses LaTeX thin-space escapes for thousands', () => {
    expect(texFr(1250)).toBe('1\\,250');
  });
});

describe('formatDec', () => {
  it('formats a simple decimal with a comma', () => {
    expect(formatDec(3.5)).toBe('3,5');
  });
  it('respects minDecimals padding', () => {
    expect(formatDec(3.5, { minDecimals: 2 })).toBe('3,50');
  });
  it('groups thousands and keeps the decimal part', () => {
    expect(formatDec(1250.5)).toBe(`1${THIN}250,5`);
  });
  it('drops trailing zeros with no decimal part for whole numbers', () => {
    expect(formatDec(4)).toBe('4');
  });
  it('returns empty string for null/undefined/NaN', () => {
    expect(formatDec(null)).toBe('');
    expect(formatDec(undefined)).toBe('');
    expect(formatDec(NaN)).toBe('');
  });
});

describe('texDec', () => {
  it('wraps the decimal comma in braces for KaTeX spacing', () => {
    expect(texDec(3.5)).toBe('3{,}5');
  });
});

describe('parseDec', () => {
  it('reads French comma-decimal notation', () => {
    expect(parseDec('3,5')).toBe(3.5);
  });
  it('reads thousands-separated French notation', () => {
    expect(parseDec('1 250,5')).toBe(1250.5);
  });
  it('also accepts English dot notation', () => {
    expect(parseDec('3.5')).toBe(3.5);
  });
  it('returns NaN for garbage input', () => {
    expect(parseDec('abc')).toBeNaN();
  });
  it('passes finite numbers through unchanged', () => {
    expect(parseDec(3.5)).toBe(3.5);
  });
});

describe('parseFr', () => {
  it('reads a French-grouped integer', () => {
    expect(parseFr('4 582')).toBe(4582);
  });
  it('rejects decimal input (integer-only parser)', () => {
    expect(parseFr('3,5')).toBeNaN();
  });
});

describe('decEquals', () => {
  it('treats floating-point-adjacent values as equal within tolerance', () => {
    expect(decEquals(0.1 + 0.2, 0.3)).toBe(true);
  });
  it('rejects values that actually differ at the given precision', () => {
    expect(decEquals(1, 1.1, 2)).toBe(false);
  });
});

describe('decimalPlaces', () => {
  it('counts significant decimal digits, trimming trailing zeros', () => {
    expect(decimalPlaces(3.5)).toBe(1);
    expect(decimalPlaces(3)).toBe(0);
    expect(decimalPlaces(2.105)).toBe(3);
  });
});
