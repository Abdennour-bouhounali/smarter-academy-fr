import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the four division screens ask for (GAME_WORLD.md « spec shapes »), as plain tags. */
const say =
  (tag) =>
  (...args) =>
    `${tag}(${args.length})`;
const NX = { next: 'next', done: 'done' };

const SPECS = {
  groups: {
    kind: 'groups',
    rounds: [
      { a: 17, b: 5 },
      { a: 4, b: 9 },
      { a: 24, b: 6 },
      { a: 137, b: 9 },
    ],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      ask: say('ask'),
      yes: 'yes',
      no: 'no',
      laid: say('laid'),
      over: say('over'),
      finish: 'finish',
      left: say('left'),
      sayLead: say('sayLead'),
      sayPlanks: 'planks',
      sayLeft: 'left',
      check: 'check',
      sayMiss: say('sayMiss'),
      sayOk: say('sayOk'),
      foundLine: say('line'),
    },
  },
  rebuild: {
    kind: 'rebuild',
    rounds: [
      { b: 7, q: 4, r: 3 },
      { b: 6, q: 3, r: 8 },
    ],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      ask: say('ask'),
      label: say('label'),
      lift: 'lift',
      seen: say('seen'),
      more: say('more'),
      foundLine: say('line'),
    },
  },
  estimate: {
    kind: 'estimate',
    rounds: [
      { a: 943, b: 23 },
      { a: 7854, b: 37 },
    ],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      ask: say('ask'),
      left: say('left'),
      passes: say('passes'),
      short: say('short'),
      laid: say('laid'),
      sum: say('sum'),
      foundLine: say('line'),
    },
  },
  bracket: {
    kind: 'bracket',
    rounds: [
      { a: 38, b: 7 },
      { a: 42, b: 7 },
    ],
    text: {
      ...NX,
      lead: say('lead'),
      goal: say('goal'),
      ask: say('ask'),
      check: 'check',
      miss: say('miss'),
      ok: say('ok'),
      where: say('where'),
      between: 'between',
      onMark: 'onMark',
      seen: say('seen'),
      foundLine: say('line'),
    },
  },
};

describe('the investigation screens — groups, rebuild, estimate, bracket open on their question, their goal and their first act', () => {
  const first = {
    groups: 'data-iq-say="yes"',
    rebuild: 'data-iq-lift',
    estimate: 'data-iq-mark="40"', // 943 ÷ 23: the first step is by tens of planks
    bracket: 'data-iq-check',
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

  it('rebuild writes its template « b × q + r = □ » unless the round is bare; bracket « b × □ ≤ a < b × □ »', () => {
    const html = renderToString(<Inquiry spec={SPECS.rebuild} onDone={() => {}} />);
    expect(html).toContain('data-iq-in="a"');
    const bare = renderToString(
      <Inquiry spec={{ ...SPECS.rebuild, rounds: [{ b: 7, q: 4, r: 3, bare: true }] }} onDone={() => {}} />,
    );
    expect(bare.length).toBeLessThan(html.length);
    const br = renderToString(<Inquiry spec={SPECS.bracket} onDone={() => {}} />);
    expect(br).toContain('data-iq-in="lo"');
    expect(br).toContain('data-iq-in="hi"');
    expect(br).toContain('data-iq-flag="38"');
  });
});
