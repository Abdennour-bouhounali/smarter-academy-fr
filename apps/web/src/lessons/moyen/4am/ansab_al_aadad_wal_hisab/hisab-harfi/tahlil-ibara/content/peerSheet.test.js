import { describe, it, expect } from 'vitest';
import { expand, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT, incompleteFactor } from './forbidden.js';

describe('« ورقة بلال » — the lost « 1 » (a term divided by itself gives 1, not 0)', () => {
  it('the numbers are right: 8x² + 4x = 4x(2x + 1); at x = 1 the sum is 12, the right factorisation 12, his 8', () => {
    expect(samePolynomial(expand([NUMS.K], NUMS.RIGHT), NUMS.A)).toBe(true);
    expect(NUMS.K).toEqual({ c: 4, p: 1 });
    expect([NUMS.at, NUMS.right, NUMS.wrong]).toEqual([12, 12, 8]);
    expect(NUMS.wrong).not.toBe(NUMS.at);
  });
  it('the sheet is well formed: the error is the division line, one right fix, wrong fixes explain, the conclusion follows from it', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.lines[1]).toContain('\\times 0');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['2']);
    expect(PEER_SHEET.fixedLines[2]).toContain('4x(2x + 1)');
    expect(PEER_KID.name).toBe('بلال');
    expect(PEER_KID.figure.hairStyle).toBeUndefined();
  });
  it('never shows the climax signature, an incomplete factorisation, ✓/✗ inside a string, a control character or the book', () => {
    const text = JSON.stringify(PEER_SHEET);
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    [PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.map((x) => `${x.text} ${x.why ?? ''}`), PEER_SHEET.fixedLines[2], PEER_SHEET.why]
      .forEach((s) => expect(incompleteFactor(s), s).toBe(false));
    expect(/[✓✗]/.test(text)).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    ['سمير', 'أمين'].forEach((n) => expect(text.includes(n)).toBe(false));
  });
});
