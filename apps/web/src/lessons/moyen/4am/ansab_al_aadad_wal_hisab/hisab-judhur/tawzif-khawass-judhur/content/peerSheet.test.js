import { describe, it, expect } from 'vitest';
import { PEER_SHEET, NUMS } from './peerSheet.js';

describe('« ورقة رياض » — stopping at a form that is not the simplest', () => {
  it('the numbers are right: 96 = 2² × 24 = 4² × 6, 24 is not a square but divisible by 4, 6 by no square but 1', () => {
    expect(NUMS.K1 ** 2 * NUMS.B1).toBe(NUMS.N);
    expect(NUMS.KM ** 2 * NUMS.M).toBe(NUMS.N);
    expect(Number.isInteger(Math.sqrt(NUMS.B1))).toBe(false);
    expect(NUMS.B1 % 4).toBe(0);
    [4, 9, 16, 25].forEach((sq) => expect(NUMS.M % sq).not.toBe(0));
    expect(NUMS.K1 * NUMS.K1).toBe(NUMS.KM);              // 2 × 2√6 = 4√6
    expect(NUMS.K1 ** 2 * NUMS.B1).not.toBe(NUMS.HALF);   // 2√24 ≠ √48
  });
  it('the sheet is well formed: the error is the last line (the conclusion), exactly one right fix, wrong fixes explain', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(2);
    expect(PEER_SHEET.fixes.filter((f) => f.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((f) => !f.ok).forEach((f) => expect(f.why).toBeTruthy());
    PEER_SHEET.fixes.forEach((f) => expect(f.text).not.toMatch(/\(\$|\$\)/));
  });
  it('never uses the climax numbers nor the lab rounds\' cards', () => {
    const text = JSON.stringify(PEER_SHEET);
    ['200', '100', '50', '120', '12', '10', '25', '75', '32', '80', '72'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
  });
});
