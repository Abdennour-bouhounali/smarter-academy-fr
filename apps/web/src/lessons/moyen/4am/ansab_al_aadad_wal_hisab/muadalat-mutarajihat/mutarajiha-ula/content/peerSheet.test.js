import { describe, it, expect } from 'vitest';
import { PEER_SHEET, PEER_KID, NUMS } from './peerSheet.js';
import { TEXT } from './forbidden.js';
import { parseIneq, evaluateX, initLab } from '../../../../../../common/manipulations/logic/solutionRay.js';
import { frac } from '@smarter-academy/core/arithmetic/linear.js';

describe('« ورقة لقمان » — the direction changed because of a negative number, not a negative divisor', () => {
  const lab = initLab({ ineq: '2x+19<=1', min: -20, max: 12 });
  const holds = (x) => evaluateX(lab, frac(x, 1)).ok;
  it('the numbers are right: 2x + 19 ≤ 1 gives x ≤ −9; at x = 1 the value is 21 and the inequality is false', () => {
    expect(NUMS.ray).toMatchObject({ rel: '<=' });
    expect(NUMS.BOUND).toBe(-9);
    expect(NUMS.at).toBe(21);
    expect(holds(1)).toBe(false);
    expect(holds(-9)).toBe(true);
    expect(holds(-10)).toBe(true);
    expect(holds(-8)).toBe(false);
  });
  it('line 0 and the right fix agree with the solver; line 1 is the ONLY wrong one; each wrong fix is false at its own witness', () => {
    expect(parseIneq('2x<=-18').rel).toBe('<=');
    expect(PEER_SHEET.lines).toHaveLength(3);
    expect(PEER_SHEET.errorLine).toBe(1);
    expect(PEER_SHEET.lines[0]).toContain('2x \\leq -18');
    expect(PEER_SHEET.fixes.filter((x) => x.ok)).toHaveLength(1);
    expect(PEER_SHEET.fixes[0].text).toContain('x \\leq -9');
    PEER_SHEET.fixes.filter((x) => !x.ok).forEach((x) => expect(x.why).toBeTruthy());
    expect(holds(NUMS.wrong1)).toBe(false);
    expect(holds(NUMS.wrong2)).toBe(false);
    expect(NUMS.wrong1At).toBe(37); expect(NUMS.wrong2At).toBe(39);
    expect(holds(NUMS.good)).toBe(true);
    expect(Object.keys(PEER_SHEET.fixedLines)).toEqual(['2']);
    expect(PEER_SHEET.fixedLines[2]).toContain('-1');
    expect(PEER_KID.name).toBe('لقمان');
    expect(PEER_KID.figure.hairStyle).toBeUndefined();
  });
  it('never shows the climax signature, ✓/✗ inside a string, a control character, the book or a climax name', () => {
    const text = JSON.stringify(PEER_SHEET);
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    expect(/[✓✗]/.test(text)).toBe(false);
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
    ['رياض', 'مراد', 'ياسين', 'سفيان', 'سمير'].forEach((n) => expect(text.includes(n)).toBe(false));
    expect(text.includes('x \\geq -6')).toBe(false);
  });
});
