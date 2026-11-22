import { describe, it, expect } from 'vitest';
import { gcd } from './inquiry';
import {
  truthOf,
  listsOf,
  summitFactsOf,
  ladderFactsOf,
  toolSteps,
  witnessOf,
  answerSteps,
  sortProblems,
  initSort,
  sortReducer,
  sortNow,
  sortResult,
  basketsOf,
  SORT_MAX_GAP,
} from './sort';

const run = (spec, actions, from = initSort(spec)) => actions.reduce((s, a) => sortReducer(spec, s, a), from);
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
/** Every common divisor of a and b, the slow way. */
const commonSlow = (a, b) => {
  const out = [];
  for (let d = 1; d <= Math.min(a, b); d += 1) if (a % d === 0 && b % d === 0) out.push(d);
  return out;
};

describe('sort — the facts the world shows are true', () => {
  it('the basket of a card is `one` exactly when 1 is the only plank both gaps share (every pair up to 200)', () => {
    sweep((check) => {
      for (let a = 1; a <= 200; a += 1)
        for (let b = 1; b <= 200; b += 1) {
          const common = commonSlow(a, b);
          check(truthOf(a, b) === (common.length === 1 ? 'one' : 'more'), `${a} ${b}`);
        }
    });
    // the lessons' cards, traps included
    expect(
      [
        [26, 39],
        [25, 27],
        [44, 45],
        [85, 119],
        [13, 39],
      ].map(([a, b]) => truthOf(a, b)),
    ).toEqual(['more', 'one', 'one', 'more', 'more']);
    expect(
      [
        [25, 27],
        [11, 13],
        [22, 26],
        [13, 39],
        [15, 22],
      ].map(([a, b]) => truthOf(a, b)),
    ).toEqual(['one', 'one', 'more', 'more', 'one']);
  });

  it('lists: every plank of each gap, shortest first; the marked ones are exactly the common planks', () => {
    sweep((check) => {
      for (let a = 1; a <= 200; a += 1)
        for (let b = 1; b <= 200; b += 1) {
          const L = listsOf(a, b);
          check(
            L.a.every((d, i) => a % d === 0 && (i === 0 || d > L.a[i - 1])),
            `a ${a}`,
          );
          check(L.a.length === commonSlow(a, a).length && L.b.length === commonSlow(b, b).length, `len ${a} ${b}`);
          check(L.common.join() === commonSlow(a, b).join(), `common ${a} ${b}`);
        }
    });
    expect(listsOf(85, 119)).toEqual({ a: [1, 5, 17, 85], b: [1, 7, 17, 119], common: [1, 17] });
  });

  it('summit: the planks of the shorter gap from the longest down, each rest true, stopping on the gcd', () => {
    sweep((check) => {
      for (let a = 1; a <= 200; a += 1)
        for (let b = 1; b <= 200; b += 1) {
          const F = summitFactsOf(a, b);
          const at = `${a} ${b}`;
          check(F.stop === gcd(a, b) && F.tried.at(-1).d === F.stop && F.tried.at(-1).r === 0, `stop ${at}`);
          check(
            F.tried.every((t, i) => t.q * t.d + t.r === F.long && t.r < t.d && (i === F.tried.length - 1 || t.r > 0)),
            `rests ${at}`,
          );
          check(
            F.tried.every((t, i) => t.d === F.all[i] && F.short % t.d === 0),
            `order ${at}`,
          );
        }
    });
    // 44 ; 45: the planks of 44 are tried down to 1
    expect(summitFactsOf(44, 45).tried.map((t) => t.d)).toEqual([44, 22, 11, 4, 2, 1]);
    // 85 ; 119: 85 leaves 34, 17 fills
    expect(summitFactsOf(85, 119).tried).toEqual([
      { d: 85, q: 1, r: 34 },
      { d: 17, q: 7, r: 0 },
    ]);
  });

  it('ladder: every row is a Euclidean division, each pair is (b ; r) of the row before, and it ends on the gcd', () => {
    sweep((check) => {
      for (let a = 1; a <= 200; a += 1)
        for (let b = 1; b <= 200; b += 1) {
          const rows = ladderFactsOf(a, b);
          const at = `${a} ${b}`;
          check(rows[0].a === Math.max(a, b) && rows[0].b === Math.min(a, b), `first ${at}`);
          check(
            rows.every((r) => r.a === r.b * r.q + r.r && r.r < r.b),
            `division ${at}`,
          );
          check(
            rows.every((r, i) => i === 0 || (r.a === rows[i - 1].b && r.b === rows[i - 1].r)),
            `chain ${at}`,
          );
          check(rows.at(-1).r === 0 && rows.slice(0, -1).every((r) => r.r > 0), `end ${at}`);
          check(rows.at(-1).b === gcd(a, b), `gcd ${at}`);
        }
    });
    expect(ladderFactsOf(44, 45)).toEqual([
      { a: 45, b: 44, q: 1, r: 1 },
      { a: 44, b: 1, q: 44, r: 0 },
    ]);
    // the longest ladder of the cards' range fits the panel (three columns)
    expect(ladderFactsOf(377, 610)).toHaveLength(13);
  });

  it('the answer to a card in the other basket is a witness — and there is none for a card in its own basket', () => {
    sweep((check) => {
      for (let a = 1; a <= 200; a += 1)
        for (let b = 1; b <= 200; b += 1) {
          const truth = truthOf(a, b);
          const other = truth === 'one' ? 'more' : 'one';
          const at = `${a} ${b}`;
          check(witnessOf(a, b, truth) === null, `own ${at}`);
          const w = witnessOf(a, b, other);
          if (truth === 'more') {
            // a plank longer than 1 laid on both gaps: it fills both
            check(w.kind === 'common' && w.d > 1 && a % w.d === 0 && b % w.d === 0, `common ${at}`);
            check(w.qa * w.d === a && w.qb * w.d === b && w.both, `divisions ${at}`);
            check(answerSteps(w) === 1, `steps ${at}`);
          } else {
            // every plank of the shorter gap, longest down, laid on the longer: only 1 leaves no rest
            const short = Math.min(a, b);
            const long = Math.max(a, b);
            check(w.kind === 'none' && w.short === short && w.long === long, `none ${at}`);
            check(w.planks.length === commonSlow(short, short).length, `all ${at}`);
            check(
              w.planks.every(
                (p, i) => short % p.d === 0 && p.q * p.d + p.r === long && (i === 0 || p.d < w.planks[i - 1].d),
              ),
              `planks ${at}`,
            );
            check(
              w.planks.every((p) => (p.r === 0) === (p.d === 1)),
              `only 1 ${at}`,
            );
            check(answerSteps(w) === w.planks.length, `steps ${at}`);
          }
        }
    });
    expect(witnessOf(85, 119, 'one')).toMatchObject({ kind: 'common', d: 17, qa: 5, qb: 7 });
    expect(witnessOf(25, 27, 'more').planks.map((p) => [p.d, p.r])).toEqual([
      [25, 2],
      [5, 2],
      [1, 0],
    ]);
  });

  it('toolSteps counts the facts of each instrument', () => {
    expect(toolSteps('lists', 25, 27)).toBe(2);
    expect(toolSteps('summit', 85, 119)).toBe(2);
    expect(toolSteps('ladder', 44, 45)).toBe(2);
    expect(() => toolSteps('ruler', 4, 6)).toThrow(RangeError);
  });

  it('sortProblems: a hand of 5 to 8 cards up to the longest gap, known instruments, both baskets needed', () => {
    const cards = [
      { a: 26, b: 39 },
      { a: 25, b: 27 },
      { a: 44, b: 45 },
      { a: 85, b: 119 },
      { a: 13, b: 39 },
    ];
    expect(sortProblems({ as: 'pair', cards, instruments: ['lists', 'summit', 'ladder'] })).toEqual([]);
    expect(sortProblems({ as: 'card', cards, instruments: [] })).toEqual(['as: card']);
    expect(sortProblems({ as: 'pair', cards: cards.slice(0, 4) })).toEqual(['cards: 4']);
    expect(sortProblems({ as: 'pair', cards: [...cards, { a: 0, b: SORT_MAX_GAP + 1 }] })).toEqual(['card 5: 0 ; 701']);
    expect(sortProblems({ as: 'pair', cards, instruments: ['lists', 'lists'] })).toEqual(['instruments: lists,lists']);
    const allOne = cards.map(() => ({ a: 25, b: 27 }));
    expect(sortProblems({ as: 'fraction', cards: allOne })).toEqual(['one basket stays empty']);
  });
});

const SPEC = {
  kind: 'sort',
  as: 'pair',
  cards: [
    { a: 26, b: 39 },
    { a: 25, b: 27 },
    { a: 44, b: 45 },
    { a: 85, b: 119 },
    { a: 13, b: 39 },
  ],
  instruments: ['lists', 'summit', 'ladder'],
};

describe('sort — the state machine plays a whole hand', () => {
  it('opens on the first card, the rest in his hand; one instrument per card, its facts tick in', () => {
    let s = initSort(SPEC);
    expect([s.stage, s.ci, s.hand, s.tool]).toEqual(['card', 0, [1, 2, 3, 4], null]);
    expect(sortNow(SPEC, s)).toMatchObject({ a: 26, b: 39, truth: 'more', short: 26, long: 39 });
    // an instrument the lesson did not hand over, or a drop in no basket: nothing
    expect(sortReducer({ ...SPEC, instruments: ['lists'] }, s, { type: 'open', tool: 'ladder' })).toBe(s);
    expect(sortReducer(SPEC, s, { type: 'drop', basket: 'maybe' })).toBe(s);
    expect(sortReducer(SPEC, s, { type: 'tick' })).toBe(s);
    expect(sortReducer(SPEC, s, { type: 'next' })).toBe(s);
    s = sortReducer(SPEC, s, { type: 'open', tool: 'summit' });
    expect([s.stage, s.tool, s.shown]).toEqual(['tool', 'summit', 0]);
    // no drop and no second instrument while the world runs
    expect(sortReducer(SPEC, s, { type: 'drop', basket: 'more' })).toBe(s);
    expect(sortReducer(SPEC, s, { type: 'open', tool: 'lists' })).toBe(s);
    s = run(SPEC, [{ type: 'tick' }], s); // 26 leaves 13 on 39
    expect([s.stage, s.shown]).toEqual(['tool', 1]);
    s = run(SPEC, [{ type: 'tick' }], s); // 13 fills 39
    expect([s.stage, s.shown]).toEqual(['card', 2]);
    expect(sortReducer(SPEC, s, { type: 'open', tool: 'lists' })).toBe(s); // one instrument per card
    expect(sortReducer(SPEC, s, { type: 'pick', i: 2 })).toBe(s); // the card stays once an instrument was opened
  });

  it('a card in its own basket goes there; the next card of his hand comes on the table', () => {
    let s = run(SPEC, [{ type: 'drop', basket: 'more' }]);
    expect([s.stage, s.ci, s.hand]).toEqual(['card', 1, [2, 3, 4]]);
    expect(s.placed).toEqual([
      { a: 26, b: 39, as: 'pair', said: 'more', truth: 'more', instrument: null, firstTry: true },
    ]);
  });

  it('a card in the other basket: the world answers, then « next » takes it to its basket', () => {
    // 25 ; 27 said « a longer plank »: the planks of 25 (25, 5, 1) laid on 27
    let s = run(SPEC, [
      { type: 'drop', basket: 'more' },
      { type: 'drop', basket: 'more' },
    ]);
    expect([s.stage, s.said, s.shown]).toEqual(['answer', 'more', 0]);
    expect(sortReducer(SPEC, s, { type: 'next' })).toBe(s);
    s = run(SPEC, [{ type: 'tick' }, { type: 'tick' }], s);
    expect(s.stage).toBe('answer');
    s = sortReducer(SPEC, s, { type: 'tick' });
    expect(s.stage).toBe('answered');
    expect(sortReducer(SPEC, s, { type: 'tick' })).toBe(s);
    s = sortReducer(SPEC, s, { type: 'next' });
    expect([s.stage, s.ci]).toEqual(['card', 2]);
    expect(s.placed.at(-1)).toEqual({
      a: 25,
      b: 27,
      as: 'pair',
      said: 'more',
      truth: 'one',
      instrument: null,
      firstTry: false,
    });
    expect(basketsOf(s).one.map((c) => c.a)).toEqual([25]);
    // 85 ; 119 said « only 1 », after the lists: 17 is laid on both (one tick)
    s = run(SPEC, [{ type: 'drop', basket: 'one' }], s); // 44 ; 45
    s = run(
      SPEC,
      [{ type: 'open', tool: 'lists' }, { type: 'tick' }, { type: 'tick' }, { type: 'drop', basket: 'one' }],
      s,
    );
    expect([s.stage, s.said]).toEqual(['answer', 'one']);
    s = run(SPEC, [{ type: 'tick' }, { type: 'next' }], s);
    expect(s.placed.at(-1)).toMatchObject({
      a: 85,
      b: 119,
      said: 'one',
      truth: 'more',
      instrument: 'lists',
      firstTry: false,
    });
  });

  it('he may choose the next card from his hand; the result keeps the order he played them; the end keeps both baskets', () => {
    let s = run(SPEC, [{ type: 'pick', i: 4 }]);
    expect([s.ci, s.hand]).toEqual([4, [0, 1, 2, 3]]);
    expect(sortReducer(SPEC, s, { type: 'pick', i: 4 })).toBe(s); // not in his hand
    s = run(SPEC, [{ type: 'open', tool: 'ladder' }, { type: 'tick' }], s); // 39 = 13 × 3 + 0: one row
    expect([s.stage, s.shown]).toEqual(['card', 1]);
    s = run(
      SPEC,
      [
        { type: 'drop', basket: 'more' }, // 13 ; 39
        { type: 'drop', basket: 'more' }, // 26 ; 39
        { type: 'drop', basket: 'one' }, // 25 ; 27
        { type: 'drop', basket: 'one' }, // 44 ; 45
        { type: 'drop', basket: 'more' }, // 85 ; 119
      ],
      s,
    );
    expect([s.stage, s.ci, s.hand]).toEqual(['end', null, []]);
    expect(sortNow(SPEC, s)).toBeNull();
    const B = basketsOf(s);
    expect(B.one.map((c) => `${c.a};${c.b}`)).toEqual(['25;27', '44;45']);
    expect(B.more.map((c) => `${c.a};${c.b}`)).toEqual(['13;39', '26;39', '85;119']);
    expect(sortReducer(SPEC, s, { type: 'drop', basket: 'one' })).toBe(s);
    s = sortReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    const r = sortResult(s);
    expect(r.cards.map((c) => c.a)).toEqual([13, 26, 25, 44, 85]);
    expect(r.cards[0]).toEqual({
      a: 13,
      b: 39,
      as: 'pair',
      said: 'more',
      truth: 'more',
      instrument: 'ladder',
      firstTry: true,
    });
    expect(r.cards.every((c) => c.firstTry)).toBe(true);
  });

  it('fraction cards are played the same way, the numerator as gap a', () => {
    const spec = {
      as: 'fraction',
      cards: [
        { a: 25, b: 27 },
        { a: 11, b: 13 },
        { a: 22, b: 26 },
        { a: 13, b: 39 },
        { a: 15, b: 22 },
      ],
      instruments: ['ladder'],
    };
    expect(sortProblems(spec)).toEqual([]);
    const s = run(spec, [
      { type: 'drop', basket: 'one' },
      { type: 'drop', basket: 'one' },
      { type: 'drop', basket: 'one' }, // 22/26: the world lays 2
    ]);
    expect(s.stage).toBe('answer');
    const w = witnessOf(22, 26, 'one');
    expect(w).toMatchObject({ kind: 'common', d: 2, qa: 11, qb: 13 });
    expect(run(spec, [{ type: 'tick' }, { type: 'next' }], s).placed.at(-1)).toMatchObject({
      as: 'fraction',
      truth: 'more',
    });
  });
});
