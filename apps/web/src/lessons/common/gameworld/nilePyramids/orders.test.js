import { describe, expect, it } from 'vitest';
import { order, holds, FACTS } from './orders';
import { slide, slideStep, slideTap, knotsOf, tied, slidePoint } from './gestures';
import { FACE, topRate } from './logic';

describe('THE ONE ORDER — one number, one thing built, three facts (plan §2.1)', () => {
  it('a canal typed before the rope reads it: as · longer · shorter', () => {
    expect(order('canal', '18', '18').fact).toBe('as');
    expect(order('canal', '31,5', '41').fact).toBe('longer'); // he typed less than the canal is
    expect(order('canal', '50,1', '41').fact).toBe('shorter');
  });
  it('a course of the face at BM = 10: 88 fits; the piece 11 and the difference 89 leave a gap; 111,375 overhangs', () => {
    expect(order('course', '88', '88')).toMatchObject({ fact: 'fits', typed: '88', built: { length: '88' } });
    expect(order('course', '11', '88').fact).toBe('gap');
    expect(order('course', '89', '88').fact).toBe('overhang');
    expect(order('course', '87,5', '88').fact).toBe('gap');
    expect(order('course', '111,375', '88').fact).toBe('overhang');
  });
  it('the row of 55 already cut: his mark 40 fits; a lower mark leaves a gap round the row; a higher one overhangs', () => {
    expect(order('mark', '40', { face: FACE, row: '55' })).toMatchObject({ fact: 'fits', built: { level: '55' } });
    expect(order('mark', '30', { face: FACE, row: '55' }).fact).toBe('gap');
    expect(order('mark', '50', { face: FACE, row: '55' }).fact).toBe('overhang');
    expect(order('mark', '90', { face: FACE, row: '55' }).refused).toBe('out');
  });
  it('the ferry rope and the flight', () => {
    expect(order('ferry', '416', '416').fact).toBe('ties');
    expect(order('ferry', '133', '416').fact).toBe('short');
    expect(order('ferry', '500', '416').fact).toBe('slack');
    expect(order('flight', '146', '146').fact).toBe('apex');
    expect(order('flight', '69,3', '146').fact).toBe('below');
    expect(order('flight', '328,5', '146').fact).toBe('above');
  });
  it('nothing is built from an empty or unreadable box; a fact never carries a size (gate P1)', () => {
    expect(order('course', '', '88').refused).toBe('empty');
    expect(order('course', '8.8', '88').refused).toBe('empty');
    const out = order('course', '11', '88');
    expect(Object.keys(out).sort()).toEqual(['built', 'fact', 'kind', 'typed']);
    expect(JSON.stringify(out)).not.toContain('77');
  });
  it("the capstone « every length × [k] »: 1/36 sits (base 2,75); 1/40 is too small; 36 is the quarry's order", () => {
    const truth = { k: '1/36', base: '99' };
    expect(order('capstone', '1/36', truth)).toMatchObject({ fact: 'sits', built: { base: '2,75', quarry: false } });
    expect(order('capstone', '2/72', truth).fact).toBe('sits');
    expect(order('capstone', '1/40', truth).fact).toBe('small');
    expect(order('capstone', '36', truth)).toMatchObject({ fact: 'big', built: { base: '3564', quarry: true } });
    expect(order('capstone', 'x', truth).refused).toBe('empty');
  });
  it('exactly one fact of each order holds', () => {
    for (const facts of Object.values(FACTS)) expect(facts.filter(holds)).toHaveLength(1);
  });
});

describe('THE ONE GESTURE — the rope slides knot by knot (plan §2.1)', () => {
  const rope = (target = 14, max = 63) =>
    slide({ id: 'AM', from: { x: 0, z: 0 }, dir: { x: 3, z: -4 }, max, target, top: topRate(max) });

  it('a tap is one knot; the end of the line stops it', () => {
    let s = rope();
    s = slideTap(s, 1);
    expect(knotsOf(s)).toBe(1);
    s = slideTap(s, -1);
    s = slideTap(s, -1);
    expect(knotsOf(s)).toBe(0);
    s = { ...s, pos: 63 };
    expect(knotsOf(slideTap(s, 1))).toBe(s.max); // it cannot go further than what is built
  });
  it('a key held goes faster and faster; let go, the rope settles on a knot', () => {
    let s = rope();
    const seen = [];
    for (let i = 0; i < 60; i += 1) {
      const before = s.pos;
      s = slideStep(s, 1, 1 / 30);
      seen.push(s.pos - before);
    }
    expect(seen[1]).toBe(0); // the first instants: only the tap's knot
    expect(seen[59]).toBeGreaterThan(seen[10]);
    s = slideStep(s, 0, 1 / 30);
    expect(s.pos).toBe(Math.round(s.pos));
    expect(s.held).toBe(0);
  });
  it('the rope ties to the stake only when the keys are let go on its knot', () => {
    let s = { ...rope(), pos: 14, way: 1, held: 1 };
    expect(tied(s)).toBe(false);
    s = slideStep(s, 0, 1 / 30);
    expect(tied(s)).toBe(true);
    expect(tied(slideTap(s, 1))).toBe(false);
  });
  it('the knot stands on the line, in metres', () => {
    const s = { ...rope(), pos: 5 };
    const p = slidePoint(s);
    expect(p.x).toBeCloseTo(3, 9);
    expect(p.z).toBeCloseTo(-4, 9);
  });
});
