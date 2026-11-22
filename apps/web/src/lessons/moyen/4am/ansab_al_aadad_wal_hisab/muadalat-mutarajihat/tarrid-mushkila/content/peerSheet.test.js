import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT } from '../../_unit/signatures/tarrid-mushkila.js';
import { showsAny } from '../../_unit/forbiddenShared.js';

const lessons = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });

describe('« ورقة شيماء » — a non-natural solution kept', () => {
  it('the numbers are right: 3x + 3 = 100 gives 97/3, not an integer; 32 + 33 + 34 = 99, the next triple 102', () => {
    expect(97 % 3).toBe(1);
    expect(NUMS.remainder).toBe(1);
    expect(NUMS.kept).toBe(32 + 33 + 34);
    expect(NUMS.next).toBe(33 + 34 + 35);
    expect([NUMS.kept, NUMS.next]).toEqual([99, 102]);
  });
  it('the sheet is well formed: one error line, one right fix, wrong fixes explain themselves', () => {
    expect(PEER_SHEET.lines).toHaveLength(4);
    expect(PEER_SHEET.errorLine).toBe(3);
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(PEER_KID.name).toBe('شيماء');
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
  });
  it('never shows the climax signature, the book, nor a control character', () => {
    const text = JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\');
    expect(showsAny(TEXT, text)).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    expect(/[\t\r]/.test(text)).toBe(false);
  });
  it('the classmate\'s name is unique among the peer sheets of 4AM', () => {
    const names = Object.values(lessons).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
});
