import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT, RULE_P } from './forbidden.js';

describe('« ورقة أسامة » — only one side multiplied before adding', () => {
  it('the numbers are right: 2x + y = 14 | 3x − 2y = 7 → (5 ; 4); his line gives (3 ; 8) where (2) is −7, not 7', () => {
    const sys = LS.system('2x+y=14', '3x-2y=7');
    const c = LS.classify(sys);
    expect([Lin.toNumber(c.x), Lin.toNumber(c.y)]).toEqual([NUMS.X_RIGHT, NUMS.Y_RIGHT]);
    expect([NUMS.X_RIGHT, NUMS.Y_RIGHT]).toEqual([5, 4]);
    expect([NUMS.X_WRONG, NUMS.Y_WRONG, NUMS.check]).toEqual([3, 8, -7]);
    expect(LS.pairHolds(sys, NUMS.X_WRONG, NUMS.Y_WRONG)).toEqual([true, false]);
    expect(NUMS.checkRight).toBe(7);
    // the check value shows every term (no zero)
    expect(NUMS.X_WRONG * NUMS.Y_WRONG).not.toBe(0);
  });
  it('the sheet is well formed: the error is the first line, one right fix, wrong fixes explain, the next lines are rewritten', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(0);
    expect(PEER_SHEET.lines[0]).toContain('4x + 2y = 14');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(new Set(PEER_SHEET.fixes.map((x) => x.text)).size).toBe(3);
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['1', '2']);
    expect(PEER_SHEET.fixedLines[2]).toContain('(5 ; 4)');
    expect(PEER_KID.name).toBe('أسامة');
    expect(PEER_SHEET.id).toBe('m2-usama');
    expect(PEER_KID.figure.hairStyle).toBeUndefined();
  });
  it('never shows the climax signature, a minus before a bracket, ✓/✗ inside a string, a control character or the book', () => {
    const text = JSON.stringify(PEER_SHEET);
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    expect(RULE_P.test(text)).toBe(false);
    expect(/[✓✗]/.test(text)).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
