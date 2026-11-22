import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT } from '../../_unit/signatures/mushkilat-jumla.js';
import { showsAny, solutionOf } from '../../_unit/forbiddenShared.js';

const lessons = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });

describe('« ورقة وئام » — a comparison written the wrong way round', () => {
  it('the numbers are right: her (14 ; 19) pays 8500 دج but has FEWER stories; the fix gives (20 ; 15)', () => {
    expect([NUMS.herX, NUMS.herY]).toEqual([14, 19]);
    expect(200 * NUMS.herX + 300 * NUMS.herY).toBe(8500);
    expect(NUMS.herX).toBeLessThan(NUMS.herY);
    expect(solutionOf('200x+300y=8500|x-y=5').key).toBe(`(${NUMS.rightX} ; ${NUMS.rightY})`);
    expect([NUMS.rightX, NUMS.rightY]).toEqual([20, 15]);
    // her pair is NOT the swap of the right one
    expect([NUMS.herY, NUMS.herX]).not.toEqual([NUMS.rightX, NUMS.rightY]);
  });
  it('the sheet is well formed: one error line, one right fix, wrong fixes explain themselves; y = x − 5 (equivalent) is not offered', () => {
    expect(PEER_SHEET.id).toBe('m2-wiam');
    expect(PEER_SHEET.lines[PEER_SHEET.errorLine]).toContain('y = x + 5');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(JSON.stringify(PEER_SHEET.fixes)).not.toContain('x - 5');
    expect(PEER_KID.name).toBe('وئام');
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
  });
  it('never shows the climax signature, the book, nor a control character (positive control of the signature)', () => {
    const text = JSON.stringify(PEER_SHEET).replace(/\\\\/g, '\\');
    expect(showsAny(TEXT, text)).toBe(false);
    expect(/الكتاب(?!ة)/.test(text)).toBe(false);
    expect(/[\t\r]/.test(text)).toBe(false);
  });
  it('the classmate\'s name is unique among the peer sheets', () => {
    const names = Object.values(lessons).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(names.filter((n) => n === PEER_KID.name)).toHaveLength(1);
  });
});
