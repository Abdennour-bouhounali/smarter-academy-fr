import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { textHit } from './forbidden.js';

const lessons = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });

describe('« ورقة طارق » — the square of a sum written as the sum of the squares', () => {
  it('the numbers are right: (x + 7)² at x = 13 is 400; the classmate\'s x² + 49 gives 218; the two strips are 2 × 7 × 13 = 182', () => {
    expect(NUMS.side).toBe(20);
    expect(NUMS.area).toBe(400);
    expect(NUMS.wrong).toBe(218);
    expect(NUMS.right).toBe(NUMS.area);
    expect(NUMS.strips).toBe(182);
    expect(NUMS.area - NUMS.wrong).toBe(NUMS.strips);
  });
  it('the sheet is well formed: the error on line 0, one right fix, wrong fixes explain, line 1 follows from the fix', () => {
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(0);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['1']);
    expect(PEER_SHEET.fixedLines[1]).toContain(String(NUMS.area));
    expect(PEER_SHEET.fixes.find((x) => x.ok).text).toContain('14x');
    PEER_SHEET.fixes.forEach((x) => expect(x.text).not.toMatch(/\(\$|\$\)/));
    // the « one strip » fix is refuted by its own number (13² + 7 × 13 + 49 = 309)
    expect(PEER_SHEET.fixes[1].why).toContain('309');
    expect(PEER_KID.name).toBe('طارق');
    expect(PEER_KID.figure.hairStyle).toBeUndefined();   // a boy (KidFigure, hoodie)
  });
  it('« one value proves nothing » — and never that two values do', () => {
    expect(PEER_SHEET.why).toContain('قيمة واحدة');
    expect(JSON.stringify(PEER_SHEET)).not.toMatch(/قيمتين|قيمتان/);
  });
  it('never the climax signature, its method (a difference squared, a corner cut twice), the book, nor a control character', () => {
    const text = JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\');
    expect(textHit(text)).toBe(false);
    expect(/\(x - \d\)\^2|ركن|مرّتين/.test(text)).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
  });
  it('the classmate\'s name is unique among the peer sheets of 4AM (verdict X4)', () => {
    const names = Object.values(lessons).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
});
