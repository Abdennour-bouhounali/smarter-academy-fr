// The walkway segment's logic (walkway.js): every fact of the design's proof (K1 planks 16 / 20, purse 14; K2 planks
// 414 / 192, purse 120; K3's story ruler), the scale rule at 1366 × 768, and the panel's state machine played through
// with wrong moves.
import { describe, it, expect } from 'vitest';
import {
  boxMax,
  initWalkway,
  lay,
  laneDrawing,
  laneOf,
  layStep,
  readPillar,
  roundDown,
  roundStep,
  scaleOf,
  shownPerLane,
  spentBy,
  triesFrom,
  walkwayReducer,
} from './walkway';

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a / gcd(a, b)) * b;

describe('walkway — what the crews do', () => {
  it('a lane lays every whole plank that does not pass the pillar, for every plank ≤ 60 and pillar ≤ 400', () => {
    for (let b = 1; b <= 60; b += 1)
      for (let d = 0; d <= 400; d += 1) {
        const l = laneOf(b, d);
        expect(l.planks * b + l.short).toBe(d);
        expect(l.short).toBeGreaterThanOrEqual(0);
        expect(l.short).toBeLessThan(b);
        expect(l.ends).toBe(d % b === 0);
      }
  });

  it('holds exactly on the common multiples that are not 0 — for every pair of planks ≤ 30 on 0 … 400', () => {
    for (let a = 1; a <= 30; a += 1)
      for (let b = 1; b <= 30; b += 1)
        for (let d = 0; d <= 400; d += 1) {
          const t = lay([a, b], d);
          expect(t.holds).toBe(d > 0 && d % lcm(a, b) === 0);
          expect(t.cost).toBe(Math.floor(d / a) + Math.floor(d / b));
        }
  });

  it('K1 — planks 16 and 20, purse 14: the pillars that hold on 0 … 400 are 80, 160, 240, 320, 400; the purse pays only 80', () => {
    const holds = [];
    for (let d = 0; d <= 400; d += 1) if (lay([16, 20], d, 14).holds) holds.push(d);
    expect(holds).toEqual([80, 160, 240, 320, 400]);
    expect(holds.filter((d) => lay([16, 20], d, 14).paid)).toEqual([80]);
    const t80 = lay([16, 20], 80, 14);
    expect(t80).toMatchObject({ verdict: 'paid', cost: 9 });
    expect(t80.lanes.map((l) => l.planks)).toEqual([5, 4]);
    expect(14 - spentBy(t80)).toBe(5);
    expect(lay([16, 20], 160, 14)).toMatchObject({ holds: true, paid: false, verdict: 'ruins', cost: 18 });
    expect(lay([16, 20], 320, 14)).toMatchObject({ holds: true, paid: false, verdict: 'ruins', cost: 36 });
  });

  it('K1 — the facts of each wrong pillar: who stops, how many cases before', () => {
    const at = (d) => lay([16, 20], d, 14);
    // the owner's sentence: at 64, crew B stops 4 cases before (3 planks), crew A ends (4 planks)
    expect(at(64).lanes).toEqual([
      { b: 16, planks: 4, short: 0, ends: true },
      { b: 20, planks: 3, short: 4, ends: false },
    ]);
    expect(at(20).lanes[0].short).toBe(4); // the longer plank
    expect(at(16).lanes[1]).toEqual({ b: 20, planks: 0, short: 16, ends: false }); // B lays no plank
    expect(at(36).lanes.map((l) => l.short)).toEqual([4, 16]); // the sum
    expect(at(40).lanes[0].short).toBe(8);
    expect(at(48).lanes[1].short).toBe(8);
    expect(at(60).lanes[0].short).toBe(12);
    expect(at(4).lanes.map((l) => l.planks)).toEqual([0, 0]); // the PGCD: neither lays a plank
    expect(at(0)).toMatchObject({ verdict: 'shore', holds: false, cost: 0 }); // both « end », nothing is built
    for (const d of [4, 16, 20, 36, 40, 48, 60, 64]) expect(at(d).verdict).toBe('short');
  });

  it('a refused walkway costs no coin — short, ruins or shore', () => {
    for (const d of [0, 4, 64, 160, 320]) expect(spentBy(lay([16, 20], d, 14))).toBe(0);
    expect(spentBy(lay([16, 20], 80, 14))).toBe(9);
    // with no purse, a walkway that holds is paid
    expect(lay([16, 20], 320, null).paid).toBe(true);
  });

  it('K1 last step — planks 14 and 49: the first pillar that holds is 98 (7 and 2 planks); 49 leaves crew 14 7 short', () => {
    const first = Array.from({ length: 700 }, (_, d) => d).find((d) => lay([14, 49], d).holds);
    expect(first).toBe(98);
    expect(lay([14, 49], 98).lanes.map((l) => l.planks)).toEqual([7, 2]);
    expect(lay([14, 49], 49).lanes[0].short).toBe(7);
    expect(lay([14, 49], 686).holds).toBe(true); // the product holds — a nearer one holds already
  });

  it('K2 — planks 414 and 192, purse 120: 13 248 holds for 101 planks (19 coins left); every wrong pillar of the design', () => {
    const at = (d) => lay([414, 192], d, 120);
    expect(at(13248)).toMatchObject({ verdict: 'paid', cost: 101 });
    expect(at(13248).lanes.map((l) => l.planks)).toEqual([32, 69]);
    expect(120 - spentBy(at(13248))).toBe(19);
    expect(at(26496)).toMatchObject({ verdict: 'ruins', cost: 202 });
    expect(at(79488)).toMatchObject({ verdict: 'ruins', cost: 606 });
    expect(at(6).lanes.map((l) => l.planks)).toEqual([0, 0]);
    expect(at(576).lanes[0].short).toBe(162);
    expect(at(138).lanes.map((l) => l.planks)).toEqual([0, 0]);
    expect(at(414).lanes[1].short).toBe(30);
    expect(at(4416).lanes[0].short).toBe(276);
    // listing the multiples of 414 and testing 192 takes 32 tries
    const k = Array.from({ length: 40 }, (_, i) => i + 1).find((i) => (414 * i) % 192 === 0);
    expect(k).toBe(32);
  });
});

describe('walkway — the drawn water at 1366 × 768', () => {
  it('round steps', () => {
    expect([1, 3, 7, 26, 49, 51, 2400, 2600].map(roundStep)).toEqual([1, 5, 10, 50, 50, 100, 2500, 5000]);
    expect([3808, 119, 1, 0.5, 9].map(roundDown)).toEqual([2500, 100, 1, 1, 5]);
  });

  it('fixed — K1: 2,75 px a case (16 = 44 px, 20 = 55 px, 80 at 220 px, 320 at 880 px), labels every 50, ticks every 10', () => {
    const s = scaleOf({ scale: 'fixed', ruler: 400, crews: [16, 20] });
    expect(s.px).toBe(2.75);
    expect([16 * s.px, 20 * s.px, 80 * s.px, 320 * s.px]).toEqual([44, 55, 220, 880]);
    expect(s.labels).toEqual([0, 50, 100, 150, 200, 250, 300, 350, 400]);
    expect(s.labels).not.toContain(80);
    expect(s.minor).toContain(10);
    expect(s.minor).not.toContain(50);
    expect(s.minor.length).toBe(32);
  });

  it('fixed — K3’s story ruler 0 … 700: 1,57 px a case (32 = 50 px, 20 = 31 px; 160 at 251 px, 640 at 1 006 px)', () => {
    const s = scaleOf({ scale: 'fixed', ruler: 700 });
    expect(Math.round(32 * s.px)).toBe(50);
    expect(Math.round(20 * s.px)).toBe(31);
    expect(Math.round(160 * s.px)).toBe(251);
    expect(Math.round(640 * s.px)).toBe(1006);
    expect(Math.round(460 * s.px)).toBe(723);
    expect(Math.round(230 * s.px)).toBe(361);
    expect(s.labels).toEqual([0, 100, 200, 300, 400, 500, 600, 700]);
  });

  it('fit — per try: 1,15 × the longest, 4 to 7 round labels after 0 (K2 at 13 248: 414 = 30 px, 192 = 14 px)', () => {
    const s = scaleOf({ scale: 'fit', crews: [414, 192], d: 13248 });
    expect(Math.round(414 * s.px)).toBe(30);
    expect(Math.round(192 * s.px)).toBe(14);
    expect(s.labels.slice(0, 3)).toEqual([0, 2500, 5000]);
    for (let d = 0; d <= 999999; d += d < 2000 ? 7 : 9973) {
      const f = scaleOf({ scale: 'fit', crews: [414, 192], d });
      const n = f.labels.length - 1;
      expect(n).toBeGreaterThanOrEqual(4);
      expect(n).toBeLessThanOrEqual(7);
      expect(f.labels.every((v) => Number.isInteger(v))).toBe(true);
      expect(f.max * f.px).toBeCloseTo(1100);
    }
  });

  it('a lane too dense is one band; a shortfall narrower than its label goes under the lane', () => {
    const fit = scaleOf({ scale: 'fit', crews: [414, 192], d: 79488 });
    const t = lay([414, 192], 79488);
    expect(laneDrawing(t.lanes[1], fit.px).band).toBe(true); // 414 planks of 192, 2 px each
    expect(laneDrawing(t.lanes[0], fit.px).band).toBe(true); // 192 planks: more than 120
    const k1 = scaleOf({ ruler: 400 });
    const at64 = lay([16, 20], 64).lanes[1];
    const draw = laneDrawing(at64, k1.px);
    expect(draw.band).toBe(false);
    expect(draw.planks).toEqual([0, 55, 110]);
    expect(draw.shortPx).toBe(11);
    expect(draw.labelBelow).toBe(true); // 4 cases = 11 px
    // K2 at 576: crew A stops 162 cases before, 269 px wide at that try's scale — its label stands inside
    const at576 = scaleOf({ scale: 'fit', crews: [414, 192], d: 576 });
    expect(laneDrawing(lay([414, 192], 576).lanes[0], at576.px).labelBelow).toBe(false);
  });
});

describe('walkway — the panel, played with wrong moves', () => {
  const cfg = { crews: [16, 20], max: 400, purse: 14 };
  const play = (moves, from = initWalkway()) => moves.reduce((s, a) => walkwayReducer(cfg, s, a), from);
  const layAll = (s) => {
    let x = walkwayReducer(cfg, s, { type: 'lay' });
    while (x.stage === 'laying') x = walkwayReducer(cfg, x, { type: 'tick' });
    return x;
  };

  it('refuses an empty box, a word, a pillar past the ruler — and moves nothing out of its stage', () => {
    let s = play([{ type: 'plant' }]);
    expect(s).toMatchObject({ stage: 'place', error: 'empty' });
    s = play([{ type: 'type', text: '4a' }, { type: 'plant' }]);
    expect(s.error).toBe('nan');
    s = play([{ type: 'type', text: '401' }, { type: 'plant' }]);
    expect(s.error).toBe('range');
    // lay before planting, tick before laying: nothing
    expect(play([{ type: 'lay' }, { type: 'tick' }])).toEqual(initWalkway());
    expect(readPillar('1 200', 999999)).toEqual({ d: 1200 });
    expect(boxMax({ scale: 'fit', ruler: 0 })).toBe(999999);
    expect(boxMax({ scale: 'fixed', ruler: 400 })).toBe(400);
  });

  it('nudges by 1 and by 10, between 0 and the ruler', () => {
    let s = play([{ type: 'nudge', by: -1 }]);
    expect(s.text).toBe('0');
    s = play([
      { type: 'type', text: '395' },
      { type: 'nudge', by: 10 },
    ]);
    expect(s.text).toBe('400');
    s = play([
      { type: 'type', text: '70' },
      { type: 'nudge', by: 10 },
      { type: 'nudge', by: -1 },
    ]);
    expect(s.text).toBe('79');
  });

  it('64 → B short; take it back; 320 → ruins; 0 → shore; 80 → paid — every try kept, in order', () => {
    let s = play([{ type: 'type', text: '64' }, { type: 'plant' }]);
    expect(s).toMatchObject({ stage: 'planted', d: 64 });
    // he cannot retype while laying, nor take the pillar back
    s = walkwayReducer(cfg, s, { type: 'lay' });
    expect(s.stage).toBe('laying');
    expect(walkwayReducer(cfg, s, { type: 'take' })).toBe(s);
    expect(walkwayReducer(cfg, s, { type: 'type', text: '1' })).toBe(s);
    while (s.stage === 'laying') s = walkwayReducer(cfg, s, { type: 'tick' });
    expect(s.now.verdict).toBe('short');
    expect(s.shown).toBe(7);
    s = play([{ type: 'take' }, { type: 'type', text: '320' }, { type: 'plant' }], s);
    s = layAll(s);
    expect(s.now.verdict).toBe('ruins');
    s = layAll(play([{ type: 'take' }, { type: 'type', text: '0' }, { type: 'plant' }], s));
    expect(s.now.verdict).toBe('shore');
    s = layAll(play([{ type: 'take' }, { type: 'type', text: '80' }, { type: 'plant' }], s));
    expect(s.now.verdict).toBe('paid');
    expect(s.tries.map((t) => [t.d, t.verdict])).toEqual([
      [64, 'short'],
      [320, 'ruins'],
      [0, 'shore'],
      [80, 'paid'],
    ]);
  });

  it('lays in at most 40 beats whatever the count, lane A then lane B', () => {
    const t = lay([414, 192], 79488);
    expect(Math.ceil(606 / layStep(t))).toBeLessThanOrEqual(40);
    expect(shownPerLane(lay([16, 20], 80), 6)).toEqual([5, 1]);
    expect(shownPerLane(lay([16, 20], 80), 9)).toEqual([5, 4]);
  });

  it('a kept try is read back only when these crews make it', () => {
    const good = lay([16, 20], 80, 14);
    expect(triesFrom([16, 20], [good, { d: 80, holds: false, cost: 9 }, null, { d: -1 }])).toEqual([good]);
    expect(triesFrom([16, 20], 'x')).toEqual([]);
  });
});
