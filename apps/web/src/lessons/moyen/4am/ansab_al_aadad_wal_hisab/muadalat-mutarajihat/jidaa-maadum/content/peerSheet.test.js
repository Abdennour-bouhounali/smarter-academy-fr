import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT, SITUATION_REFUSAL } from './forbidden.js';

describe('« ورقة كوثر » — the zero-product property applied to a SUM', () => {
  it('the numbers are right: the sum is 8 at 7, −8 at −1, −20 at −7; it simplifies to 2x − 6 so the only solution is 3', () => {
    expect([NUMS.at7, NUMS.atMinus1, NUMS.atMinus7, NUMS.sol, NUMS.atSol]).toEqual([8, -8, -20, 3, 0]);
    // her own « solutions » 7 and −1 do NOT cancel her first member (the check she did)
    expect(NUMS.at7).not.toBe(0);
    expect(NUMS.atMinus1).not.toBe(0);
    // 2x − 6 has the same value as the sum for any x: the simplification is exact
    [-3, 0, 2, 5].forEach((x) => expect((x - 7) + (x + 1)).toBe(2 * x - 6));
  });
  it('the sheet is well formed: the error is the FIRST line, one right fix, wrong fixes explain, the lines that follow are corrected', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(0);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['1', '2']);
    expect(PEER_SHEET.fixedLines[2]).toContain('x = 3');
    expect(PEER_SHEET.id).toBe('m2-kawthar');
    expect(PEER_KID).toEqual({ name: 'كوثر', figure: { hairStyle: 'hijab', scarf: 'mint', outfit: 'violet' } });
  });
  it('never shows the climax signature, a situation refusal, ✓/✗ inside a string, a control character or the book', () => {
    const text = JSON.stringify(PEER_SHEET);
    TEXT.forEach((re) => expect(re.test(text.replace(/−/g, '-')), String(re)).toBe(false));
    expect(SITUATION_REFUSAL.test(text)).toBe(false);
    expect(/[✓✗]/.test(text)).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    ['سمير', 'رياض', 'مراد', 'ياسين', 'سفيان'].forEach((n) => expect(text.includes(n)).toBe(false));
  });
});
