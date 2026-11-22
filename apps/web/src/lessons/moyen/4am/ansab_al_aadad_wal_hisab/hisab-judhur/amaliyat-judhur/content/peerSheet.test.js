import { describe, it, expect } from 'vitest';
import { PEER_SHEET, NUMS } from './peerSheet.js';

describe('« ورقة ياسمين » — the root taken as if it distributed over a sum', () => {
  it('the error is real: √4 + √9 = 5 but 5² = 25 ≠ 13', () => {
    expect(NUMS.RA ** 2).toBe(NUMS.A);
    expect(NUMS.RB ** 2).toBe(NUMS.B);
    expect(NUMS.WRONG ** 2).not.toBe(NUMS.SUM);
    expect(NUMS.HALF ** 2).not.toBe(NUMS.SUM);
    expect((NUMS.A + NUMS.RB) ** 2).not.toBe(NUMS.SUM);
    expect(Number.isInteger(Math.sqrt(NUMS.SUM))).toBe(false);
  });
  it('the sheet is well formed: 3 lines, the error is line 2, the conclusion is rewritten, exactly one right fix, wrong fixes explain', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.fixedLines[2]).toContain(`\\sqrt{${NUMS.SUM}}`);
    expect(PEER_SHEET.fixedLines[0]).toBeNull();
    expect(PEER_SHEET.fixes.filter((f) => f.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((f) => !f.ok).forEach((f) => expect(f.why).toBeTruthy());
    // a formula inside parentheses in Arabic text mirrors its brackets: never « ($…$) »
    PEER_SHEET.fixes.forEach((f) => expect(f.text).not.toMatch(/\(\$|\$\)/));
  });
  it('never uses the climax numbers (180, 12, 36, 192, 45, 18, 90, 150) nor the module\'s own examples (16 + 9, 100 − 36)', () => {
    const text = JSON.stringify(PEER_SHEET);
    ['180', '12', '36', '192', '45', '18', '90', '150', '16', '100'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
  });
});
