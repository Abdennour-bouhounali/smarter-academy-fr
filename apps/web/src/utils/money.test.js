import { describe, it, expect } from 'vitest';
import { formatEur, EURO_SIGN } from './money.js';

const NBSP = ' ';
const NNBSP = ' ';

describe('formatEur — euros, written the French way', () => {
  it('writes a whole amount without decimals, the sign after a no-break space', () => {
    expect(formatEur(3500)).toBe(`35${NBSP}€`);
    expect(formatEur(0)).toBe(`0${NBSP}€`);
  });

  it('writes cents with the decimal comma and two digits', () => {
    expect(formatEur(990)).toBe(`9,90${NBSP}€`);
    expect(formatEur(1205)).toBe(`12,05${NBSP}€`);
  });

  it('groups thousands with the narrow no-break space', () => {
    expect(formatEur(125000)).toBe(`1${NNBSP}250${NBSP}€`);
  });

  it('reads an amount already in euros when told so', () => {
    expect(formatEur(35, { unit: 'euros' })).toBe(`35${NBSP}€`);
    expect(formatEur(9.9, { unit: 'euros' })).toBe(`9,90${NBSP}€`);
  });

  it('never writes « EUR », a dinar, or the sign first', () => {
    const out = formatEur(2000000);
    expect(out.endsWith(`${NBSP}${EURO_SIGN}`)).toBe(true);
    expect(out).not.toMatch(/EUR|DZD|\bDA\b|^€/);
    expect(out).not.toMatch(/[\u0600-\u06FF]/);
  });
});
