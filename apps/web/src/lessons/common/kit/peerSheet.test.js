import { describe, it, expect } from 'vitest';
import { startSheet, tapLine, pickFix, rightFix, peerFixOrder } from './peerSheet';

const SHEETS = Object.values(import.meta.glob('../../moyen/**/content/peerSheet.js', { eager: true })).map((m) => m.PEER_SHEET).filter(Boolean);

const sheet = {
  id: 's', errorLine: 1, lines: ['a', 'b', 'c'],
  fixes: [{ text: 'x', why: 'no' }, { text: 'y', ok: true }, { text: 'z', why: 'no' }],
};

describe('« ورقة زميل » — find the line, then the fix', () => {
  it('finding the line at the first tap moves to the fix and counts as « أمسكتَ الخطأ »', () => {
    const s = tapLine(startSheet(), 1, sheet);
    expect(s.phase).toBe('fix');
    expect(s.foundFirst).toBe(true);
    expect(s.shown).toBe(false);
  });
  it('a wrong line is remembered; after two misses the line is SHOWN and the student still goes on', () => {
    let s = tapLine(startSheet(), 0, sheet);
    expect(s.phase).toBe('find');
    expect(tapLine(s, 0, sheet)).toBe(s); // the same wrong line twice is not a second miss
    s = tapLine(s, 2, sheet);
    expect(s.phase).toBe('fix');
    expect(s.shown).toBe(true);
    expect(s.foundFirst).toBe(false);
  });
  it('a wrong fix keeps the phase and is remembered; the right one ends the sheet', () => {
    let s = tapLine(startSheet(), 1, sheet);
    s = pickFix(s, 0, sheet);
    expect(s.phase).toBe('fix');
    expect(s.wrongFixes).toEqual([0]);
    s = pickFix(s, rightFix(sheet), sheet);
    expect(s.phase).toBe('done');
    expect(s.fixedWith).toBe(1);
    expect(pickFix(s, 2, sheet)).toBe(s);
  });
  it('taps outside their phase change nothing', () => {
    const s = startSheet();
    expect(pickFix(s, 1, sheet)).toBe(s);
    const f = tapLine(s, 1, sheet);
    expect(tapLine(f, 0, sheet)).toBe(f);
  });
});

describe('the order the fixes are SHOWN (ECC review 2026-11-10)', () => {
  it('is a permutation, stable, never the written order', () => {
    const sh = { id: 'x', fixes: [{ ok: true }, {}, {}] };
    const o = peerFixOrder(sh);
    expect([...o].sort()).toEqual([0, 1, 2]);
    expect(peerFixOrder(sh)).toEqual(o);
    expect(o).not.toEqual([0, 1, 2]);
  });
  it('across every converted lesson\'s sheet, the right fix is not always shown first', () => {
    expect(SHEETS.length).toBeGreaterThan(5);
    const firstShown = SHEETS.map((sh) => peerFixOrder(sh).indexOf(rightFix(sh)));
    expect(firstShown.filter((p) => p === 0).length).toBeLessThan(SHEETS.length);
    expect(new Set(firstShown).size).toBeGreaterThan(1);
  });
});
