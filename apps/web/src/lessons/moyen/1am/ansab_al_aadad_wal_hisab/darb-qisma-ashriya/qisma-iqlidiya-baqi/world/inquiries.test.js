import { describe, it, expect } from 'vitest';
import { groupsOf, rebuildOf, estimateSteps } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { cycleOf, probeOf } from '../../../../../../common/gameworld/divisorIsles/cycle';
import { GROUPS_INQUIRY, CYCLE_INQUIRY, REBUILD_INQUIRY, ESTIMATE_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { NUMBERS, SPYGLASS, STORY } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|null|\[object/);
/** Every sentence of an investigation is said, and none states the rule it leads to. */
const noRule = (lines, words) => {
  for (const line of lines) {
    said(line);
    expect(line, line).not.toMatch(words);
  }
};
/** What goes into SVG text or the goal frame is plain: no formula. */
const plain = (x) => expect(String(x), String(x)).not.toMatch(/\$|\\/);
/** A count glued to a word that does not agree: « 2 خانات », « 1 لوحًا », « 100 لوحًا », « 12 ألواح »… */
const agreed = (line) => {
  expect(line, line).not.toMatch(/(^|[^\d])[12] (خانات|خانة|ألواح|لوحًا|لوح)(?![؀-ۿ])/);
  expect(line, line).not.toMatch(/(^|[^\d])(1[1-9]|[2-9]\d) (خانات|ألواح)(?![؀-ۿ])/);
  expect(line, line).not.toMatch(/(^|[^\d])\d*00 (لوحًا|ألواح|خانات)(?![؀-ۿ])/);
  expect(line, line).not.toMatch(/(^|[^\d])([3-9]|10) (لوحًا|خانة)(?![؀-ۿ])/);
  expect(line, line).not.toMatch(/وُضع لا |دخل لا /);
};

describe('the four investigations of « القسمة الإقليدية » — each rule found by an experiment of its own', () => {
  it('no two keys share a (kind, mode); the key that is one decision on a case has no investigation', () => {
    const forges = Object.values(FORGES);
    const kinds = forges.map((F) => F.inquiry?.kind);
    expect(kinds).toEqual(['groups', 'cycle', 'rebuild', 'estimate', undefined]);
    // the pair (kind, mode) of every investigation, compared one against every other
    const pairs = forges.filter((F) => F.inquiry).map((F) => `${F.inquiry.kind}/${F.inquiry.mode ?? ''}`);
    expect(pairs).toHaveLength(4);
    pairs.forEach((p, i) => pairs.forEach((o, j) => expect(i !== j && p === o, `${p} twice`).toBe(false)));
    for (const F of forges) if (F.inquiry) expect(F.inquiry.writes).toBeUndefined();
    // each investigation is the one its forge reads its evidence from
    expect(FORGES['majmuaat-kamila'].inquiry).toBe(GROUPS_INQUIRY);
    expect(FORGES['baqi-asghar'].inquiry).toBe(CYCLE_INQUIRY);
    expect(FORGES['musawat-qisma'].inquiry).toBe(REBUILD_INQUIRY);
    expect(FORGES['taqdir-hasil'].inquiry).toBe(ESTIMATE_INQUIRY);
  });

  it('nothing pre-solves the bridge that comes next: an experiment uses only gaps he has already crossed', () => {
    const bridges = STORY.segments.filter((s) => s.kind === 'bridge').map((s) => s.a);
    // the bridges still ahead when each mirror opens (arriving on islands C, D, E, G)
    const ahead = {
      groups: bridges.slice(2),
      cycle: bridges.slice(3),
      rebuild: bridges.slice(4),
      estimate: bridges.slice(5),
    };
    for (const { a } of GROUPS_INQUIRY.rounds) expect(ahead.groups).not.toContain(a);
    for (const { b, from, count } of CYCLE_INQUIRY.rounds)
      for (const st of cycleOf(b, from, count).steps) expect(ahead.cycle, `${st.a}`).not.toContain(st.a);
    for (const { b, from } of CYCLE_INQUIRY.probes)
      for (const st of probeOf(b, from).steps) expect(ahead.cycle, `${st.a}`).not.toContain(st.a);
    for (const { b, q, r } of REBUILD_INQUIRY.rounds) expect(ahead.rebuild).not.toContain(rebuildOf(b, q, r).a);
    for (const { a } of ESTIMATE_INQUIRY.rounds) expect(ahead.estimate).not.toContain(a);
  });

  it('GROUPS starts on the gap of island B with the plank that left cells; then an exact fit, a plank too long, a big gap', () => {
    const { rounds, manual } = GROUPS_INQUIRY;
    expect(rounds[0]).toEqual({ a: NUMBERS.count.a, b: NUMBERS.count.probe });
    expect(groupsOf(rounds[0].a, rounds[0].b)).toMatchObject({ q: 7, r: 2 });
    const facts = rounds.map(({ a, b }) => ({ a, b, ...groupsOf(a, b) }));
    expect(facts.some((f) => f.r === 0 && f.q > 0)).toBe(true); // an exact fit
    expect(facts.some((f) => f.b > f.a)).toBe(true); // no plank fits
    const big = facts.filter((f) => f.a >= 10 * f.b);
    expect(big.length).toBeGreaterThanOrEqual(1); // « أكمل » is offered there
    for (const f of big) expect(f.q).toBeGreaterThan(manual + 1);
    for (const f of facts) expect(f.a).toBeLessThanOrEqual(126);
  });

  it('GROUPS: every sentence says what the strip did, none states the rule, and every count agrees with its noun', () => {
    const T = GROUPS_INQUIRY.text;
    const lines = [T.yes, T.no, T.finish, T.sayPlanks, T.sayLeft, T.check, T.next, T.done];
    for (const { a, b } of GROUPS_INQUIRY.rounds) {
      const g = groupsOf(a, b);
      lines.push(T.lead(a, b), T.goal(a, b), T.sayLead({ a, b }));
      plain(T.goal(a, b));
      for (const s of g.steps) {
        const left = s.fits ? a - b * (s.k - 1) : s.left;
        lines.push(T.ask({ a, b, k: s.k, left }));
        for (const guess of [true, false, null]) {
          const f = { a, b, q: g.q, r: g.r, ...s, guess };
          lines.push(s.fits ? T.laid(f) : T.over(f));
        }
        if (s.left > 0) {
          lines.push(T.left(s.left));
          plain(T.left(s.left));
        }
      }
      const f = { a, b, q: g.q, r: g.r, ...g.steps.at(-1) };
      for (const miss of [
        { q: g.q + 1, r: g.r },
        { q: g.q, r: g.r + 1 },
        { q: g.r, r: g.q },
      ])
        lines.push(T.sayMiss({ ...f, said: miss }));
      lines.push(T.sayOk(f), T.foundLine({ a, b, q: g.q, r: g.r, said: { q: g.q, r: g.r } }));
    }
    noRule(lines, /حاصل|أقصر من|أصغر من|أكبر عدد|دائمًا|نتوقّف|توقّف عندما/);
    for (const line of lines) agreed(line);
    // the sentence every student reads on the first gap: 30 cells, the plank 4 — two cells left
    expect(T.ask({ a: 30, b: 4, k: 8, left: 2 })).toBe('على الهوّة خانتان فارغتان. هل يدخل اللوح رقم 8؟');
    expect(T.laid({ a: 30, b: 4, k: 7, left: 2, guess: null })).toBe('دخل اللوح رقم 7، وبقيت خانتان.');
    expect(T.sayOk({ q: 7, r: 2 })).toBe('على الهوّة 7 ألواح كاملة، وبقيت خانتان.');
  });

  it('CYCLE starts on the gap of island C with its mould; every round shows a whole climb and the fall after it', () => {
    const { rounds, probes } = CYCLE_INQUIRY;
    // every number can be played: a plank of 2 cells or more, a first gap it fits in, two gaps or more
    for (const r of rounds) expect(r.b >= 2 && r.from >= r.b && r.count >= 2, JSON.stringify(r)).toBe(true);
    for (const p of probes) expect(p.b >= 2 && p.from >= p.b, JSON.stringify(p)).toBe(true);
    const [one] = rounds;
    expect(one.b).toBe(NUMBERS.groups.probe);
    const first = cycleOf(one.b, one.from, one.count).steps;
    // the gap he has just crossed is the first gap he predicts: he saw it leave 5 cells
    expect(first[1]).toMatchObject({ a: NUMBERS.groups.a, r: NUMBERS.groups.a % one.b });
    expect(first.map((s) => s.r)).toEqual([4, 5, 6, 7, 0, 1, 2]);
    for (const { b, from, count } of rounds) {
      const { steps } = cycleOf(b, from, count);
      const lefts = steps.map((s) => s.r);
      expect(lefts, `plank ${b}`).toContain(b - 1); // the most it leaves is SEEN
      const fall = steps.findIndex((s) => s.wraps);
      expect(fall, `plank ${b}`).toBeGreaterThan(0); // …and so is the plank that goes in
      expect(steps[fall - 1].r).toBe(b - 1);
      expect(fall).toBeLessThan(steps.length - 1); // one gap more after the fall: the climb starts again
      expect(count).toBeLessThanOrEqual(8); // a round is short: every gap is predicted
      expect(steps.at(-1).a).toBeLessThanOrEqual(126);
      expect(b + 1).toBeLessThanOrEqual(11); // the chips 0 … b + 1 stand on one row
    }
    // then two planks he has not laid cell by cell — neither is a plank of the rounds
    expect(probes.length).toBeGreaterThanOrEqual(2);
    const seen = new Set(rounds.map((r) => r.b));
    for (const { b, from } of probes) {
      expect(seen.has(b)).toBe(false);
      seen.add(b);
      const p = probeOf(b, from);
      expect(p.steps.map((s) => s.r)).toEqual([...Array.from({ length: b }, (_, r) => r), 0, 1]);
      expect(p.steps.at(-1).a).toBeLessThanOrEqual(126);
      expect(p.steps.length).toBeLessThanOrEqual(14); // the staircase keeps one column per gap
    }
  });

  it('CYCLE: every sentence says what the strip did, none states the rule, and every count agrees with its noun', () => {
    const T = CYCLE_INQUIRY.text;
    const lines = [T.next, T.toProbe, T.done, T.maxUnit, T.yes, T.no, T.grow];
    for (const { b, from, count } of CYCLE_INQUIRY.rounds) {
      const { steps } = cycleOf(b, from, count);
      lines.push(T.lead(b, from, count), T.goal(b), T.start({ ...steps[0], b }));
      plain(T.goal(b));
      steps.slice(1).forEach((st, i) => {
        lines.push(T.ask({ a: st.a, b, from: steps[i].a, left: steps[i].r }));
        for (const guess of [st.r, st.r + 1, b, null]) lines.push(T.grew({ ...st, b, said: guess }));
        if (st.r > 0) {
          lines.push(T.left(st.r));
          plain(T.left(st.r));
        }
      });
      lines.push(T.foundLine({ b, from, steps: steps.map((st) => ({ a: st.a, r: st.r, said: null })) }));
    }
    for (const { b, from } of CYCLE_INQUIRY.probes) {
      const p = probeOf(b, from);
      lines.push(T.probeLead(b, p.start), T.maxAsk({ b }), T.sameAsk({ b }));
      for (const st of p.steps.slice(1)) lines.push(T.grew({ ...st, b, said: null }));
      for (const max of [b - 1, b, b + 1, 3])
        for (const same of [true, false]) {
          const probe = { b, from: p.start, max: b - 1, said: { max, same } };
          lines.push(T.probeSeen(probe), T.probeLine(probe));
        }
    }
    // the rule is the forge's to write and the tablet's to name: « smaller than », « always », « the remainder »
    noRule(lines, /أصغر من|أقلّ من|أقصر من|دائمًا|الباقي|باقٍ|باقي|المقسوم|ناقص 1|طول اللوح ناقص|لا يمكن/);
    for (const line of lines) agreed(line);
    expect(T.grew({ a: 46, b: 8, q: 5, r: 6, wraps: false, said: 6 })).toBe(
      'الهوّة 46 خانة: بقيت 6 خانات فارغة. كما قلتَ!',
    );
    expect(T.grew({ a: 30, b: 4, q: 7, r: 2, wraps: false, said: null })).toBe('الهوّة 30 خانة: بقيت خانتان فارغتان.');
    expect(T.grew({ a: 48, b: 8, q: 6, r: 0, wraps: true, said: 8 })).toContain('دخل فيها لوح آخر');
  });

  it('REBUILD starts on the gap of island D, shows the box alone until the last round, and hides a piece too long', () => {
    const { rounds } = REBUILD_INQUIRY;
    const [e] = rounds;
    expect(e.b).toBe(NUMBERS.rests.probe);
    expect(rebuildOf(e.b, e.q, e.r)).toMatchObject({ a: NUMBERS.rests.a, valid: true });
    // the template « b × q + r = □ » spells the rule: only the LAST round may show it
    expect(rounds.slice(0, -1).every((r) => r.bare)).toBe(true);
    expect(rounds.at(-1).bare).toBeFalsy();
    const facts = rounds.map(({ b, q, r }) => rebuildOf(b, q, r));
    expect(facts.some((x) => !x.valid && x.more >= 1)).toBe(true); // the world lays a plank in the piece
    expect(facts.filter((x) => x.valid).length).toBeGreaterThanOrEqual(2);
    for (const x of facts) expect(x.a).toBeLessThanOrEqual(126);
    expect(new Set(rounds.map((r) => r.b)).size).toBe(rounds.length); // a different plank each time
  });

  it('REBUILD: every sentence says what the cloth hid, none states the rule, and every count agrees', () => {
    const T = REBUILD_INQUIRY.text;
    const lines = [T.lift, T.next, T.done];
    for (const round of [...REBUILD_INQUIRY.rounds, { b: 5, q: 2, r: 1 }, { b: 9, q: 1, r: 2 }, { b: 4, q: 3, r: 9 }]) {
      const x = rebuildOf(round.b, round.q, round.r);
      lines.push(T.lead(round), T.goal(round), T.label(round), T.ask(round));
      plain(T.goal(round));
      plain(T.label(round));
      for (const s of [x.a, x.a + 1, round.b + round.q + round.r]) {
        const f = { ...round, said: s, ...x };
        lines.push(x.valid ? T.seen(f) : T.more(f), T.foundLine(f));
      }
    }
    noRule(lines, /×|\\times|ضرب|مضروب|نجمع|اجمع|حاصل|مقسوم|دائمًا/);
    for (const line of lines) agreed(line);
    expect(T.label({ b: 5, q: 2, r: 1 })).toBe('لوحان طولهما 5، وقطعة من خانة واحدة');
  });

  it('ESTIMATE starts on the spyglass’s old bridge; a ≤ 4 digits and a two-digit plank; a 0 step and hundreds of planks', () => {
    const { rounds } = ESTIMATE_INQUIRY;
    expect(rounds[0]).toEqual({ a: SPYGLASS.a, b: SPYGLASS.b });
    for (const { a, b } of rounds) {
      expect(a).toBeLessThanOrEqual(9999);
      expect(b >= 11 && b <= 99).toBe(true);
      const steps = estimateSteps(a, b);
      // the steps lay exactly the planks of the division
      expect(steps.reduce((t, s) => t + s.q * 10 ** s.place, 0)).toBe(Math.floor(a / b));
      expect(steps.at(-1).left).toBe(a % b);
      expect(steps.some((s) => s.place >= 1)).toBe(true); // tens of planks first
    }
    const all = rounds.map(({ a, b }) => estimateSteps(a, b));
    expect(all.some((steps) => steps.some((s) => s.q === 0))).toBe(true);
    expect(all.some((steps) => steps.some((s) => s.place === 2))).toBe(true);
  });

  it('ESTIMATE: every sentence says what the ruler did, none states the rule, and every count agrees', () => {
    const T = ESTIMATE_INQUIRY.text;
    const lines = [T.next, T.done];
    for (const { a, b } of ESTIMATE_INQUIRY.rounds) {
      const steps = estimateSteps(a, b);
      const q = Math.floor(a / b);
      lines.push(T.lead(a, b), T.goal(a, b), T.sum({ a, b, q, r: a % b, steps }));
      lines.push(T.foundLine({ a, b, q, r: a % b, tens: Math.floor(q / 10), units: q % 10 }));
      plain(T.goal(a, b));
      for (const s of steps) {
        lines.push(T.ask({ a, b, place: s.place, unit: s.unit, from: s.from }));
        if (s.from > 0) plain(T.left(s.from));
        for (let k = 0; k <= 9; k += 1) {
          const m = { a, b, place: s.place, unit: s.unit, from: s.from, k, count: k * 10 ** s.place };
          m.value = k * s.unit;
          m.left = s.from - m.value;
          if (m.value > s.from) lines.push(T.passes(m));
          else if (m.value + s.unit <= s.from) lines.push(T.short({ ...m, next: (k + 1) * s.unit }));
          else lines.push(T.laid(m));
        }
      }
    }
    noRule(lines, /أكبر|لا يتجاوز|لا تتجاوز|حاصل|دائمًا|أوّلًا/);
    for (const line of lines) agreed(line);
    // one hundred planks laid at once: « 100 لوح », never « 100 لوحًا »
    const laid = (count) =>
      T.laid({ a: 3172, b: 26, place: 2, unit: 2600, from: 3172, count, value: 26 * count, left: 572 });
    expect(laid(100)).toMatch(/^وُضع 100 لوح:/);
    expect(T.laid({ a: 692, b: 27, place: 1, unit: 270, from: 692, count: 20, value: 540, left: 152 })).toMatch(
      /^وُضع 20 لوحًا:/,
    );
    expect(T.laid({ a: 60, b: 27, place: 0, unit: 27, from: 60, count: 2, value: 54, left: 6 })).toMatch(
      /^وُضع لوحان:/,
    );
  });
});
