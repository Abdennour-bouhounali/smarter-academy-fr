// THE MATHS of multiples-et-diviseurs-communs: every number of the design (its proof script
// `multiples-et-diviseurs-communs-design-proof.mjs`) re-computed here against the world's own logic — the walkway's `lay`
// and the crews' `daysFact` / `allButOne` — so that no number of the lesson rests on a retyped value.
import { describe, it, expect } from 'vitest';
import { allButOne, daysFact, worksOn } from '../../../../../../common/gameworld/divisorIsles/crews';
import { lay } from '../../../../../../common/gameworld/divisorIsles/walkway';
import {
  NUMBERS,
  commonPowers,
  gcd,
  lcm,
  lcmOf,
  lcmPowers,
  ordinal,
  powTex,
  powersOf,
  togetherDay,
  valueOfPowers,
} from './math';

const { pillar: PI, factors: FC, story: ST, days: DY, mission: MI } = NUMBERS;
const holding = (crews, max, purse) => {
  const out = [];
  for (let d = 1; d <= max; d += 1) if (lay(crews, d, purse).holds) out.push(d);
  return out;
};

describe('math — the smallest common multiple and the decompositions', () => {
  it('lcm and lcmOf: two numbers, three, a coprime pair, a number dividing the other', () => {
    expect(lcm(16, 20)).toBe(80);
    expect(lcmOf([6, 8, 10])).toBe(120);
    expect(lcm(32, 27)).toBe(864);
    expect(lcm(5, 15)).toBe(15);
    expect(lcmOf([])).toBe(1);
    expect(gcd(16, 20)).toBe(4);
  });

  it('powersOf, powTex, valueOfPowers: 414 = 2 × 3² × 23, 192 = 2⁶ × 3', () => {
    expect(powersOf(414)).toEqual([
      { p: 2, e: 1 },
      { p: 3, e: 2 },
      { p: 23, e: 1 },
    ]);
    expect(powersOf(192)).toEqual([
      { p: 2, e: 6 },
      { p: 3, e: 1 },
    ]);
    expect(powTex(powersOf(13248))).toBe('2^{6} \\times 3^{2} \\times 23');
    expect(valueOfPowers(powersOf(13248))).toBe(13248);
    expect(powTex(powersOf(1156))).toBe('2^{2} \\times 17^{2}');
  });

  it('lcmPowers takes EVERY prime with its LARGER exponent; commonPowers is lesson 2’s rule (the wrong tile)', () => {
    const [x, y] = FC.crews.map(powersOf);
    expect(valueOfPowers(lcmPowers(x, y))).toBe(13248);
    expect(valueOfPowers(commonPowers(x, y))).toBe(6);
    expect(valueOfPowers(lcmPowers(...FC.use))).toBe(6776);
    expect(powTex(lcmPowers(...FC.use))).toBe('2^{3} \\times 7 \\times 11^{2}');
    expect(valueOfPowers(commonPowers(...FC.use))).toBe(44);
    expect(valueOfPowers(lcmPowers(...FC.coprime))).toBe(864);
    expect(commonPowers(...FC.coprime)).toEqual([]);
  });

  it('the ordinal of a plank: 1re, 4e', () => {
    expect(ordinal(1)).toBe('1re');
    expect(ordinal(4)).toBe('4e');
  });
});

describe('math — K1 the walkway of the quay (proof « K1 pilier »)', () => {
  it('on 0 … 400 the pillars that hold are 80 160 240 320 400, and the purse of 14 pays only 80', () => {
    expect(holding(PI.crews, PI.ruler)).toEqual([80, 160, 240, 320, 400]);
    const paid = [];
    for (let d = 1; d <= PI.ruler; d += 1) if (lay(PI.crews, d, PI.purse).paid) paid.push(d);
    expect(paid).toEqual([80]);
    expect(lay(PI.crews, 80, PI.purse).cost).toBe(9);
    expect(lay(PI.crews, 160, PI.purse).cost).toBe(18);
    expect(lay(PI.crews, 320, PI.purse)).toMatchObject({ holds: true, cost: 36, verdict: 'ruins' });
    expect(PI.crews[0] * PI.crews[1]).toBe(320);
  });

  it('the facts of the design: 64 (B 4 short), 20, 16, 36, 40, 48, 60, 4, 0', () => {
    const short = (d) => lay(PI.crews, d).lanes.map((l) => l.short);
    expect(short(64)).toEqual([0, 4]);
    expect(short(20)).toEqual([4, 0]);
    expect(lay(PI.crews, 16).lanes[1].planks).toBe(0);
    expect(short(36)).toEqual([4, 16]);
    expect(short(40)).toEqual([8, 0]);
    expect(short(48)).toEqual([0, 8]);
    expect(short(60)).toEqual([12, 0]);
    expect(lay(PI.crews, 4).lanes.map((l) => l.planks)).toEqual([0, 0]);
    expect(lay(PI.crews, 0).verdict).toBe('shore');
  });

  it('the last step: 14 and 49 → 98 (7 and 2 planks); the wrong ones: 49, 686', () => {
    expect(lcm(...PI.use)).toBe(98);
    expect(lay(PI.use, 98).lanes.map((l) => l.planks)).toEqual([7, 2]);
    expect(49 % 14).toBe(7);
    expect(14 * 49).toBe(686);
    expect(lay(PI.use, 686).holds).toBe(true);
  });
});

describe('math — K2 the second walkway (proof « K2 ppcm-facteurs »)', () => {
  it('13 248 holds for 101 planks and 120 coins; 26 496 holds for 202; the product 79 488 for 606; the only pillar paid', () => {
    expect(lay(FC.crews, 13248, FC.purse)).toMatchObject({ holds: true, cost: 101, paid: true });
    expect(lay(FC.crews, 26496, FC.purse)).toMatchObject({ holds: true, cost: 202, paid: false });
    expect(lay(FC.crews, 79488, FC.purse)).toMatchObject({ holds: true, cost: 606, paid: false });
    expect(FC.crews[0] * FC.crews[1]).toBe(79488);
    expect(lcm(...FC.crews)).toBe(13248);
  });

  it('the wrong rules’ numbers: 6, 576 (A 162 short), 138, 414 (B 30 short), 4 416 (A 276 short)', () => {
    const l = (d) => lay(FC.crews, d).lanes;
    expect(l(6).map((x) => x.planks)).toEqual([0, 0]);
    expect(l(576)[0].short).toBe(162);
    expect(l(138).map((x) => x.planks)).toEqual([0, 0]);
    expect(l(414)[1].short).toBe(30);
    expect(l(4416)[0]).toMatchObject({ planks: 10, short: 276 });
    expect(l(4416)[1].ends).toBe(true);
  });

  it('the mirror’s second pair: six rules, six numbers — only « every prime, the larger exponent » is a multiple of both', () => {
    const [x, y] = FC.mirror.map(powersOf);
    const seen = [...new Set([...x, ...y].map((f) => f.p))];
    const both = seen.filter((p) => x.some((f) => f.p === p) && y.some((f) => f.p === p));
    const pick = (ps, e) =>
      valueOfPowers(ps.map((p) => ({ p, e: e(x.find((f) => f.p === p)?.e ?? 0, y.find((f) => f.p === p)?.e ?? 0) })));
    const smaller = (u, v) => (u && v ? Math.min(u, v) : Math.max(u, v));
    const six = {
      commonSmaller: pick(both, Math.min),
      commonLarger: pick(both, Math.max),
      commonOne: pick(both, () => 1),
      allSmaller: pick(seen, smaller),
      allLarger: pick(seen, Math.max),
      allOne: pick(seen, () => 1),
    };
    expect(six).toEqual({
      commonSmaller: 68,
      commonLarger: 2312,
      commonOne: 34,
      allSmaller: 476,
      allLarger: 16184,
      allOne: 238,
    });
    expect(
      Object.entries(six)
        .filter(([, v]) => v % FC.mirror[0] === 0 && v % FC.mirror[1] === 0)
        .map(([k]) => k),
    ).toEqual(['allLarger']);
    expect(lcm(...FC.mirror)).toBe(16184);
  });
});

describe('math — K3 and the stories (proof « K3 traduire »)', () => {
  it('gears of 32 and 20: 160 teeth, 5 and 8 turns; 8 turns of 32 = 256; the product 640; 4 teeth', () => {
    const [a, b] = ST.gears;
    expect(lcm(a, b)).toBe(160);
    expect([160 / a, 160 / b]).toEqual([5, 8]);
    expect(8 * a).toBe(256);
    expect(a * b).toBe(640);
    expect(gcd(a, b)).toBe(4);
  });

  it('buses every 10 and 46 min from 6 h 10: 230 min, back at 10 h 00; the product 460 → 13 h 50', () => {
    const [a, b] = ST.bus.every;
    const [h, m] = ST.bus.start;
    expect(lcm(a, b)).toBe(230);
    expect(h * 60 + m + 230).toBe(10 * 60);
    expect(h * 60 + m + a * b).toBe(13 * 60 + 50);
    expect([230 / a, 230 / b]).toEqual([23, 5]);
  });

  it('the story’s ruler 0 … 700 draws the pillars: 160 at 251 px, 230 at 361 px, 640 at 1 006 px', () => {
    const px = 1100 / ST.ruler;
    expect([160, 230, 640].map((d) => Math.round(px * d))).toEqual([251, 361, 1006]);
    expect(lay(ST.gears, 160).holds).toBe(true);
    expect(lay(ST.gears, 640).holds).toBe(true);
    expect(lay(ST.gears, 4).lanes.map((l) => l.planks)).toEqual([0, 0]);
    expect(lay(ST.rods, 160).holds).toBe(true);
  });
});

describe('math — K4 the five teams (proof « K4 cinq équipes »)', () => {
  const cycles = DY.sleeps.map((s) => s + 1);
  it('cycles 2 … 6: days 7, 13, 61, 61; the pattern recurs every 60 days; 62 columns hold day 61', () => {
    expect([[2, 3], [2, 3, 4], [2, 3, 4, 5], cycles].map(togetherDay)).toEqual([7, 13, 61, 61]);
    expect(lcmOf(cycles)).toBe(60);
    expect(DY.span).toBe(62);
    expect(cycles.reduce((v, c) => v * c, 1)).toBe(720);
  });

  it('the run stops on the days where four of the five work: 13, 25, 31, 37, 49 (the sleeper named)', () => {
    expect(allButOne(cycles, 61)).toEqual([
      { day: 13, team: 4 },
      { day: 25, team: 4 },
      { day: 31, team: 3 },
      { day: 37, team: 4 },
      { day: 49, team: 4 },
    ]);
  });

  it('the beliefs it refutes: the rest days as the cycle (right on the headline by luck), the product, day 1 forgotten', () => {
    expect(lcmOf(DY.sleeps)).toBe(60);
    expect(1 + lcmOf(DY.sleeps.slice(0, 2))).toBe(3);
    expect(1 + 2 * 3).toBe(7);
    expect(1 + 2 * 3 * 4).toBe(25);
    expect(worksOn(2, 60)).toBe(false);
  });

  it('the last step: rests 3, 13, 18 → cycles 4, 14, 19 → 2² × 7 × 19 = 532 → day 533; 267, 235, 532, 1 065', () => {
    const cycles3 = DY.trio.map((s) => s + 1);
    expect(cycles3).toEqual([4, 14, 19]);
    expect(lcmOf(cycles3)).toBe(532);
    expect(powTex(powersOf(532))).toBe('2^{2} \\times 7 \\times 19');
    const at = (d) => daysFact(cycles3, d);
    expect(at(533).kind).toBe('first');
    expect(at(267)).toMatchObject({ working: [1, 2], idle: [0] });
    expect(lcmOf(DY.trio)).toBe(234);
    expect(at(235)).toMatchObject({ kind: 'none' });
    expect(at(532)).toMatchObject({ kind: 'none' });
    expect(at(1065).kind).toBe('again');
  });
});

describe('math — the final mission (proof « MISSION »)', () => {
  const cycles = MI.rests.map((r) => r + 1);
  const who = (d) => {
    const f = daysFact(cycles, d);
    return `${f.kind}:${f.working.map((i) => MI.names[i]).join('+')}|${f.idle.map((i) => MI.names[i]).join('+')}`;
  };
  it('cycles 8, 17, 20 → 2³ × 5 × 17 = 680 → day 681; the rest days taken as the cycle give 2 129; the product 2 721', () => {
    expect(cycles).toEqual([8, 17, 20]);
    expect(lcmOf(cycles)).toBe(680);
    expect(powTex(powersOf(680))).toBe('2^{3} \\times 5 \\times 17');
    expect(lcmOf(MI.rests)).toBe(2128);
    expect(cycles.reduce((v, c) => v * c, 1)).toBe(2720);
    expect(gcd(gcd(8, 17), 20)).toBe(1);
  });

  it('who crosses on each day of the design’s table — the fact is written from this, never the answer', () => {
    expect(who(2129)).toBe('some:nord|ouest+sud');
    expect(who(680)).toBe('none:|nord+ouest+sud');
    expect(who(2)).toBe('none:|nord+ouest+sud');
    expect(who(2721)).toBe('again:nord+ouest+sud|');
    expect(who(41)).toBe('some:nord+sud|ouest');
    expect(who(161)).toBe('some:nord+sud|ouest');
    expect(who(341)).toBe('some:ouest+sud|nord');
    expect(who(681)).toBe('first:nord+ouest+sud|');
    expect(who(1)).toBe('start:nord+ouest+sud|');
  });

  it('brute force over the largest cycle: 34 tries (680 ÷ 20); two ferries cross on many days before 681', () => {
    expect(680 / 20).toBe(34);
    let two = 0;
    for (let d = 2; d < 681; d += 1) if (daysFact(cycles, d).working.length === 2) two += 1;
    expect(two).toBeGreaterThan(10);
  });
});

describe('math — the gate dash’s six waves (proof « Gate dash »)', () => {
  it('W1 68 | 2 | 38 · W2 552 | 4 | 2 208 · W3 13 | 17 | 2 · W4 4 | 552 | 2 · W5 41 | 29 | 40 · W6 703 | 1 | 18', () => {
    expect([lcm(4, 34), gcd(4, 34), 4 + 34]).toEqual([68, 2, 38]);
    expect([lcm(24, 92), gcd(24, 92), 24 * 92]).toEqual([552, 4, 2208]);
    expect([lcm(26, 34), lcm(26, 34) / 34, lcm(26, 34) / 26, gcd(26, 34)]).toEqual([442, 13, 17, 2]);
    expect([gcd(24, 92), lcm(24, 92)]).toEqual([4, 552]);
    expect([togetherDay([5, 8]), 1 + lcm(4, 7), lcm(5, 8)]).toEqual([41, 29, 40]);
    expect([lcm(19, 37), gcd(19, 37), 37 - 19]).toEqual([703, 1, 18]);
  });
});
