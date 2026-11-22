import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { NEVER, BAD_EXPANSION, bare } from './forbidden.js';

const lessons = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });

describe('« ورقة زينب » — only the facing zones, then a check at x = 0', () => {
  it('the numbers are right: (x + 3)(x + 6) = x² + 9x + 18; at 0 both forms give 18, at 1 the product is 28 and the classmate\'s form 19', () => {
    expect(NUMS.at0.product).toBe(18);
    expect(NUMS.at0.wrong).toBe(NUMS.at0.product);          // x = 0 hides the error
    expect(NUMS.at1.product).toBe(28);
    expect(NUMS.at1.right).toBe(NUMS.at1.product);
    expect(NUMS.at1.wrong).toBe(19);
    expect(NUMS.cross).toBe(9);
    // cross terms of the SAME sign (6x and 3x): no opposite terms reduce
    expect(Math.sign(NUMS.A)).toBe(Math.sign(NUMS.B));
  });
  it('the sheet is well formed: the error on line 0, one right fix, wrong fixes explain, line 1 follows from the fix', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(0);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['1']);
    expect(PEER_SHEET.fixedLines[1]).toContain('9x + 18');
    PEER_SHEET.fixes.forEach((x) => expect(x.text).not.toMatch(/\(\$|\$\)/));
    expect(PEER_KID.name).toBe('زينب');
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
  });
  it('« one value proves nothing » — and never that two values do', () => {
    expect(PEER_SHEET.why).toContain('قيمة واحدة');
    expect(JSON.stringify(PEER_SHEET)).not.toMatch(/قيمتين|قيمتان/);
  });
  it('never uses the climax numbers, factors or expansions, nor the book, nor a control character', () => {
    const text = JSON.stringify(PEER_SHEET);
    NEVER.forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
    ['2x+10', 'x-4', '2x+12', 'x-3'].forEach((f) => expect(bare(text).includes(f), f).toBe(false));
    BAD_EXPANSION.forEach((e) => expect(bare(text).includes(e), e).toBe(false));
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
  it('the classmate\'s name is unique among the peer sheets of 4AM (conseil X4)', () => {
    const names = Object.values(lessons).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
});
