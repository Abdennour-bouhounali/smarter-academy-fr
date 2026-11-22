import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { PEER_SHEET, PEER_KID, NUMS, PEER_SYSTEM } from './peerSheet.js';
import { TEXT } from './forbidden.js';

describe('« ورقة صهيب » — the sign lost when substituting a negative value', () => {
  it('the numbers are right: (1 ; −2) solves 2x − 3y = 8 ∣ x + y = −1; his line gives −4', () => {
    expect(LS.pairHolds(LS.system(...PEER_SYSTEM), 1, -2)).toEqual([true, true]);
    expect(NUMS.RIGHT1).toBe(NUMS.SYS.c);
    expect(NUMS.RIGHT2).toBe(NUMS.SYS.c2);
    expect(NUMS.WRONG1).toBe(-4);
    expect(NUMS.WRONG1).not.toBe(NUMS.SYS.c);
    // the check pair shows every term (no zero coordinate)
    expect(NUMS.PAIR.x * NUMS.PAIR.y).not.toBe(0);
  });
  it('the sheet is well formed: the error is the first line, one right fix, wrong fixes explain, the next lines are rewritten', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(0);
    expect(PEER_SHEET.lines[0]).toContain('= -4');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['1', '2']);
    expect(PEER_SHEET.fixedLines[2]).toContain('حلّ للجملة');
    expect(PEER_KID.name).toBe('صهيب');
    expect(PEER_SHEET.id).toBe('m2-suhayb');
  });
  it('never shows the climax signature (positive control of L1.14: 2x − 3y = 8 passes), ✓/✗, a control character or the book', () => {
    const text = JSON.stringify(PEER_SHEET);
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    expect(/[✓✗]/.test(text)).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
