import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { textViolations, NEVER } from './forbidden.js';

describe('« ورقة رانية » — the segment BA instead of the side OA', () => {
  it('the numbers are right: OA = OB + BA ; her answer is BE × BA ÷ OB, the truth BE × OA ÷ OB', () => {
    expect(NUMS.OA).toBe(NUMS.OB + NUMS.BA);
    expect(NUMS.wrong * NUMS.OB).toBe(NUMS.BE * NUMS.BA);
    expect(NUMS.right * NUMS.OB).toBe(NUMS.BE * NUMS.OA);          // BE/AM = OB/OA in cross products
    expect(NUMS.wrong).not.toBe(NUMS.right);
    expect(Number.isInteger(NUMS.wrong) && Number.isInteger(NUMS.right)).toBe(true);
    expect(NUMS.right - NUMS.wrong).toBe(NUMS.BE);                 // the segment error is exactly « one stick too short »
    const m = (cm) => String(cm / 100).replace('.', '{,}');
    expect(PEER_SHEET.lines[2]).toContain(m(NUMS.wrong));
    expect(PEER_SHEET.fixedLines[2]).toContain(m(NUMS.OA));
    expect(PEER_SHEET.fixedLines[2]).toContain(m(NUMS.right));
    expect(PEER_SHEET.fixedLines[3]).toContain(m(NUMS.right));
    expect(PEER_SHEET.fixes[1].text).toContain(m(NUMS.additive));
    expect(PEER_SHEET.fixes[2].text).toContain(m(NUMS.product));
  });
  it('the sheet is well formed: the error starts on the ratio line, one right fix, wrong fixes explain, the lines after follow from it', () => {
    expect(PEER_SHEET.lines).toHaveLength(4);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.lines[1]).toContain('\\dfrac{OB}{BA}');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['2', '3']);
    PEER_SHEET.fixes.forEach((x) => expect(x.text).not.toMatch(/\(\$|\$\)/));
    expect(PEER_KID.name).toBe('رانية');
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
    expect(PEER_SHEET.id).toBe('m2-rania');
  });
  it('never uses the climax signature, the synthesis challenge, the book, nor a control character', () => {
    const text = JSON.stringify(PEER_SHEET);
    expect(textViolations(text.replace(/\\\\/g, '\\'), 'peer')).toEqual([]);
    NEVER.forEach((n) => expect(text.includes(n.replace(',', '{,}')) || text.includes(` ${n} `), n).toBe(false));
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    expect(text.includes('وليد')).toBe(false);
  });
});
