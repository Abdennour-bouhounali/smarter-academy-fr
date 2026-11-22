import { describe, it, expect } from 'vitest';
import { PEER_SHEET, A, WRONG, ROOT, WRONG_SQ } from './peerSheet';

const n = (tex) => Number(tex.replace('{,}', '.'));

describe('« ورقة أمينة » — the root of a decimal taken for its half', () => {
  it('the error is real: half of 0,16 is 0,08 but 0,08² = 0,0064; the root is 0,4', () => {
    expect(n(A) / 2).toBeCloseTo(n(WRONG), 12);
    expect(n(WRONG) ** 2).toBeCloseTo(n(WRONG_SQ), 12);
    expect(n(WRONG) ** 2).not.toBeCloseTo(n(A), 6);
    expect(n(ROOT) ** 2).toBeCloseTo(n(A), 12);
  });
  it('the sheet is well formed: 3 lines, the error is line 2, the conclusion is rewritten, exactly one right fix, wrong fixes explain', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.fixedLines[2]).toContain(ROOT);
    expect(PEER_SHEET.fixedLines[0]).toBeNull();
    expect(PEER_SHEET.fixes.filter((f) => f.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((f) => !f.ok).forEach((f) => expect(f.why).toBeTruthy());
    // the number of solutions is RIGHT on the sheet: only the root is wrong (not a climax error)
    expect(PEER_SHEET.lines[0]).toContain('حلّان');
    PEER_SHEET.fixes.forEach((f) => { expect(f.text).not.toContain('<'); expect(f.text).not.toMatch(/\(\$|\$\)/); });
  });
  it('never uses the climax numbers (64, 0,09, 0,3, 11, 3,3, 36, 42)', () => {
    const text = JSON.stringify(PEER_SHEET);
    ['0{,}09', '0{,}3$', '0{,}3 ', '11', '3{,}3', '36', '42'].forEach((x) => expect(text.includes(x), x).toBe(false));
    expect(/(^|[^0-9{,}])64([^0-9]|$)/.test(text)).toBe(false);
  });
});
