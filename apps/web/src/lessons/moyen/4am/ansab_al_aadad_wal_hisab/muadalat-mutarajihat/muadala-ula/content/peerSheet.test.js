import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT } from './forbidden.js';

describe('« ورقة أيوب » — dividing only one term', () => {
  it('the numbers are right: 2x + 6 = 14 → x = 4; his line gives x = 1 where the left side is 8, not 14', () => {
    expect(NUMS.X_RIGHT).toBe(4);
    expect(NUMS.check).toBe(NUMS.A.c);
    expect(NUMS.X_WRONG).toBe(1);
    expect([NUMS.at, NUMS.other]).toEqual([8, 14]);
    expect(NUMS.at).not.toBe(NUMS.other);
    // the check value shows every term (x = 1 would hide nothing here: 2 × 1 + 6)
    expect(NUMS.X_WRONG).not.toBe(0);
  });
  it('the sheet is well formed: the error is the first line, one right fix, wrong fixes explain, the next lines are rewritten', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(0);
    expect(PEER_SHEET.lines[0]).toContain('x + 6 = 7');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['1', '2']);
    expect(PEER_SHEET.fixedLines[2]).toContain('x = 4');
    expect(PEER_KID.name).toBe('أيوب');
    expect(PEER_KID.figure.hairStyle).toBeUndefined();
  });
  it('never shows the climax signature, ✓/✗ inside a string, a control character or the book', () => {
    const text = JSON.stringify(PEER_SHEET);
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    expect(/[✓✗]/.test(text)).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
