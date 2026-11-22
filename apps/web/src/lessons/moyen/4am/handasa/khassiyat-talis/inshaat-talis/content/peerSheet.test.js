import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import * as L from '../../../../../../common/manipulations/logic/segmentDivider.js';

describe('« ورقة سلمى » — two different compass openings on the two parallels', () => {
  it('the numbers are right: 2 × 1,5 = 3 = 3 × 1 → ratio 1, M at the midpoint (3 cm); with ONE unit AM = 2/5 × 6 = 2,4 cm', () => {
    expect(NUMS.AF).toBe(NUMS.P * NUMS.openA);
    expect(NUMS.BE).toBe(NUMS.Q * NUMS.openB);
    expect(NUMS.openA).not.toBe(NUMS.openB);
    expect(NUMS.wrong).toEqual([1, 1]);
    expect(NUMS.amWrong[0] / NUMS.amWrong[1]).toBe(NUMS.AB / 2);
    expect(NUMS.amRight[0] / NUMS.amRight[1]).toBeCloseTo((NUMS.P / (NUMS.P + NUMS.Q)) * NUMS.AB, 10);
    expect(NUMS.amRight).toEqual([12, 5]);
  });

  it('the lab says the same: her graduations (two units) are refused; with one unit the ruler gives M inside [AB] at 2/5', () => {
    const grad = (s, rail, n, open) => { let x = L.setOpening(s, open); for (let i = 0; i < n; i += 1) x = L.carry(x, rail); return x; };
    const base = L.init({ mode: 'ratio', p: NUMS.P, q: NUMS.Q, marks: 3, sameUnitOnly: true, player: true });
    const hers = grad(grad(base, 'a-', NUMS.P, NUMS.openA), 'b+', NUMS.Q, NUMS.openB);
    const j1 = L.commitRuler(L.setEnd(L.setEnd(hers, 'a', -NUMS.AF), 'b', NUMS.BE)).joins.at(-1);
    expect(j1).toMatchObject({ kind: 'units', ok: false, mixed: true });
    const fixed = grad(grad(base, 'a-', NUMS.P, NUMS.openB), 'b+', NUMS.Q, NUMS.openB);
    const j2 = L.commitRuler(L.setEnd(L.setEnd(fixed, 'a', -NUMS.P * NUMS.openB), 'b', NUMS.Q * NUMS.openB)).joins.at(-1);
    expect(j2).toMatchObject({ kind: 'inside', ok: true });
    expect([j2.t.n, j2.t.d].map(Number)).toEqual([NUMS.P, NUMS.P + NUMS.Q]);
  });

  it('the sheet is well formed: the error is the graduation line, one right fix, wrong fixes explain, the conclusion follows from it', () => {
    expect(PEER_SHEET.lines).toHaveLength(4);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.lines[1]).toContain('1{,}5');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['3']);
    expect(PEER_SHEET.fixedLines[3]).toContain('2{,}4');
    PEER_SHEET.fixes.forEach((x) => expect(x.text).not.toMatch(/\(\$|\$\)/));
    expect(PEER_KID.name).toBe('سلمى');
    expect(PEER_KID.figure.hairStyle).toBe('hijab');
  });

  it('never uses the climax numbers, the climax classmate, nor a control character', () => {
    const text = JSON.stringify(PEER_SHEET);
    ['10', '40', '30', '35', '20', '15', '650', '600', '3000'].forEach((x) => expect(new RegExp(`(^|[^0-9,{}])${x}([^0-9]|$)`).test(text), x).toBe(false));
    ['{4}{3}', '{3}{4}', '{4}{7}', '{3}{7}', '{40}{7}', '{30}{7}'].forEach((x) => expect(text.includes(x), x).toBe(false));
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    expect(text.includes('وليد')).toBe(false);
  });
});
