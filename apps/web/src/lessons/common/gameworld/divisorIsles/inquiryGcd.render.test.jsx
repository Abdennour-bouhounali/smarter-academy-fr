import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { Shelves } from './InquiryGcd';
import { commonOf } from './inquiry';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the three screens of the greatest common divisor ask for (GAME_WORLD.md), as plain tags. */
const say =
  (tag) =>
  (...args) =>
    `${tag}(${args.length})`;
const NX = { next: 'next', done: 'done', yes: 'yes', no: 'no' };

const SPECS = {
  common: {
    kind: 'common',
    rounds: [
      { a: 12, b: 18, candidates: [1, 2, 3, 4, 5, 6, 9, 12] },
      { a: 8, b: 15, candidates: [1, 2, 3, 5] },
    ],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      take: say('take'),
      ask: say('ask'),
      onA: say('onA'),
      onB: say('onB'),
      lay: 'lay',
      seen: say('seen'),
      shelf: { a: say('shelfA'), b: say('shelfB'), both: say('shelfBoth'), none: say('shelfNone') },
      sayLead: say('sayLead'),
      sayCount: 'count',
      check: 'check',
      sayMiss: say('sayMiss'),
      sayOk: say('sayOk'),
      foundLine: say('line'),
    },
  },
  ladder: {
    kind: 'ladder',
    mode: 'subtract',
    rounds: [
      { a: 84, b: 36 },
      { a: 84, b: 36, mode: 'divide' },
    ],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      ask: say('ask'),
      write: 'write',
      seen: say('seen'),
      planks: 'planks',
      folded: say('folded'),
      countAsk: say('countAsk'),
      countLabel: 'rows',
      finish: 'finish',
      end: say('end'),
      foundLine: say('line'),
    },
  },
  nest: {
    kind: 'nest',
    rounds: [{ a: 24, b: 36, probes: [5, 6, 8, 4, 24] }],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      given: say('given'),
      divisorsLabel: say('divisorsLabel'),
      ask: say('ask'),
      seen: say('seen'),
      foundLine: say('line'),
      compare: say('compare'),
      commonLabel: say('commonLabel'),
    },
  },
};

describe('the investigation screens — common, ladder, nest open on their question, their goal and their first act', () => {
  const first = {
    common: 'data-iq-plank="1"',
    ladder: 'data-iq-in="x"',
    nest: 'data-iq-say="yes"',
  };
  for (const [kind, spec] of Object.entries(SPECS))
    it(kind, () => {
      const html = renderToString(<Inquiry spec={spec} onDone={() => {}} />);
      expect(html).toContain(`data-iq="${kind}"`);
      expect(html).toContain('lead(');
      expect(html).toContain('data-iq-goal');
      expect(html).toContain('goal(');
      expect(html).toContain(first[kind]);
      expect(html).not.toMatch(/undefined|NaN/);
    });

  it('common shows its tray and its three shelves; nest shows g and its planks; ladder its first pair and its ticks', () => {
    const c = renderToString(<Inquiry spec={SPECS.common} onDone={() => {}} />);
    expect(c).toContain('data-iq-tray');
    for (const s of ['a', 'b', 'both']) expect(c).toContain(`data-iq-shelf="${s}"`);
    expect(c).toContain('data-iq-shelf="none"'); // plank 5 holds neither 12 nor 18
    const n = renderToString(<Inquiry spec={SPECS.nest} onDone={() => {}} />);
    expect(n).toContain('data-iq-divs="1,2,3,4,6,12"');
    expect(n).toContain('data-iq-strip="g"');
    const l = renderToString(<Inquiry spec={SPECS.ladder} onDone={() => {}} />);
    expect(l).toContain('data-iq-row="1"');
    expect(l).not.toContain('data-iq-row="2"');
    expect(l).toContain('data-iq-ticks="1,2,3,4,6,12"');
  });

  it('a ladder `plain` (a workshop’s bench) shows its rows, no column of common planks and no gold at the end', () => {
    for (const plain of [{ plain: true }, { rounds: SPECS.ladder.rounds.map((r) => ({ ...r, plain: true })) }]) {
      const html = renderToString(<Inquiry spec={{ ...SPECS.ladder, ...plain }} onDone={() => {}} />);
      expect(html).toContain('data-iq-plain');
      expect(html).toContain('data-iq-row="1"');
      expect(html).not.toContain('data-iq-ticks');
      expect(html).not.toContain('>planks<');
    }
    // finished, kept on the bench: every row written, the last value not lit
    const from = { ri: 0, written: 5, stage: 'seen', guesses: [], last: null, guessed: 5, found: [] };
    const seen = renderToString(<Inquiry spec={{ ...SPECS.ladder, plain: true, from }} onDone={() => {}} />);
    expect(seen).toContain('data-iq-row="5"');
    expect(seen).toContain('data-iq-stage="seen"');
    expect(seen).not.toContain('fbbf24');
    expect(seen).not.toContain('is-end');
    const lit = renderToString(<Inquiry spec={{ ...SPECS.ladder, from }} onDone={() => {}} />);
    expect(lit).toContain('fbbf24');
    expect(lit).toContain('data-iq-ticks="1,2,3,4,6,12"');
    // without `plain`, as before
    expect(renderToString(<Inquiry spec={SPECS.ladder} onDone={() => {}} />)).not.toContain('data-iq-plain');
  });

  it('a ladder reopened on its bench (`spec.from`) shows the rows he had and waits where he stopped', () => {
    const from = { ri: 0, written: 2, stage: 'count', guesses: [], last: null, guessed: null, found: [] };
    const html = renderToString(<Inquiry spec={{ ...SPECS.ladder, from }} onDone={() => {}} />);
    expect(html).toContain('data-iq-row="3"');
    expect(html).toContain('data-iq-in="count"');
    expect(html).toContain('data-iq-stage="count"');
  });

  it('a ladder of one row asks for the count at once (b fills a)', () => {
    const one = { ...SPECS.ladder, mode: 'divide', rounds: [{ a: 36, b: 12 }] };
    const html = renderToString(<Inquiry spec={one} onDone={() => {}} />);
    expect(html).toContain('data-iq-in="count"');
    expect(html).toContain('countAsk(');
  });

  describe('common with crown: false — the experiment ends on the shelves and their count', () => {
    const rows = commonOf(12, 18, [1, 2, 3, 5, 6, 9]).rows;
    const placed = rows.map((r) => ({ ...r, guessA: r.holdsA, guessB: r.holdsB }));
    const shelves = (crown, stage, long = null) =>
      renderToString(
        <Shelves
          T={SPECS.common.text}
          a={12}
          b={18}
          rows={rows}
          tray={[]}
          placed={placed}
          hand={null}
          stage={stage}
          crown={crown}
          long={long}
          longest={6}
          onTake={() => {}}
          onMark={() => {}}
        />,
      );

    it('by default the chips of « both » can be marked once the tray is empty, and the longest is lit at the end', () => {
      const say = shelves(true, 'say', 3);
      expect(say).toContain('data-iq-long="6"');
      expect(say).toMatch(/class="iq-chip iq-chip--s is-on"[^>]*data-iq-long="3"/);
      expect(say).not.toMatch(/disabled=""[^>]*data-iq-long="6"/);
      expect(shelves(true, 'seen')).toMatch(/class="iq-chip iq-chip--s is-on"[^>]*data-iq-long="6"/);
    });

    it('crown: false — no chip of a shelf is pickable, marked or lit; nothing names or outlines the longest', () => {
      for (const stage of ['say', 'seen']) {
        const out = shelves(false, stage, 6);
        expect(out).toContain('data-iq-shelf="both"');
        expect(out).not.toContain('data-iq-long');
        expect(out).not.toContain('is-on');
        expect(out).not.toMatch(/<button(?![^>]*disabled)[^>]*iq-chip--s/);
      }
    });

    it('the screen carries the option (spec or round) for the walks', () => {
      const off = { ...SPECS.common, crown: false };
      expect(renderToString(<Inquiry spec={off} onDone={() => {}} />)).toContain('data-iq-crown="0"');
      const round = { ...SPECS.common, rounds: [{ ...SPECS.common.rounds[0], crown: false }] };
      expect(renderToString(<Inquiry spec={round} onDone={() => {}} />)).toContain('data-iq-crown="0"');
      expect(renderToString(<Inquiry spec={SPECS.common} onDone={() => {}} />)).toContain('data-iq-crown="1"');
    });
  });
});
