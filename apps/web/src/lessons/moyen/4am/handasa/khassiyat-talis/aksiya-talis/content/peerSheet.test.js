import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';

describe('« ورقة رياض » — part over part (AM/MB) instead of part over whole (AM/AB)', () => {
  it('the numbers are right: AM/MB = 6/9 = 2/3 (the error), AM/AB = 6/15 = 2/5 = 4/10 = AN/AC (the truth: parallel)', () => {
    expect(NUMS.MB).toBe(9);
    expect(NUMS.wrong).toEqual([2, 3]);
    expect(NUMS.right).toEqual([2, 5]);
    expect(NUMS.other).toEqual([2, 5]);
    expect(NUMS.AM * NUMS.AC).toBe(NUMS.AB * NUMS.AN);       // 60 = 60: the ratios are equal
    expect(NUMS.AM * NUMS.AC).not.toBe(NUMS.MB * NUMS.AN);   // the classmate's 2/3 ≠ 2/5
  });
  it('the sheet is well formed: the error starts on the ratio line, one right fix, wrong fixes explain, the conclusion follows from it', () => {
    expect(PEER_SHEET.lines).toHaveLength(4);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.lines[1]).toContain('MB');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['3']);
    PEER_SHEET.fixes.forEach((x) => expect(x.text).not.toMatch(/\(\$|\$\)/));
    expect(PEER_KID.name).toBe('رياض');
  });
  it('never uses the climax numbers, nor a control character', () => {
    const text = JSON.stringify(PEER_SHEET);
    ['80', '100', '24', '30', '36', '44', '45', '46', '2400', '3600', '3680', '25'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
    ['{3}{10}', '{9}{20}', '{23}{50}'].forEach((x) => expect(text.includes(x), x).toBe(false));
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
