import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the four screens ask for (GAME_WORLD.md « spec shapes »), as plain tags. */
const say =
  (tag) =>
  (...args) =>
    `${tag}(${args.length})`;
const YN = { yes: 'yes', no: 'no', next: 'next', done: 'done' };

const SPECS = {
  join: {
    kind: 'join',
    d: 7,
    rounds: [
      { op: 'sum', a: 21, b: 35 },
      { op: 'diff', a: 35, b: 21 },
      { op: 'sum', a: 22, b: 20 },
    ],
    text: {
      ...YN,
      lead: say('lead'),
      goal: say('goal'),
      label: say('label'),
      ask: say('ask'),
      seen: say('seen'),
      foundLine: say('line'),
    },
  },
  stack: {
    kind: 'stack',
    d: 7,
    base: 21,
    times: [2, 3, 10, 100],
    free: { d: 14, base: 21, times: [2, 3] },
    text: {
      ...YN,
      lead: say('lead'),
      goal: say('goal'),
      label: say('label'),
      ask: say('ask'),
      seen: say('seen'),
      foundLine: say('line'),
    },
  },
  peel: {
    kind: 'peel',
    rounds: [{ a: 54, b: 21, candidates: [2, 3, 6, 7] }],
    text: {
      ...YN,
      lead: say('lead'),
      goal: 'goal',
      peeling: say('peeling'),
      peelBtn: say('peelBtn'),
      piece: say('piece'),
      ask: say('ask'),
      shown: say('shown'),
      cols: { plank: 'plank', a: 'a', b: 'b', r: 'r' },
      nextRound: 'nextRound',
      toClaim: 'toClaim',
      claimLead: 'claimLead',
      claimIf: 'if',
      claimThen: 'then',
      colLabel: { a: 'fills a', b: 'fills b' },
      link: { and: 'and', or: 'or' },
      claimAsk: 'claimAsk',
      claimFact: say('claimFact'),
      claimOk: say('claimOk'),
      seal: 'seal',
    },
  },
  letters: {
    kind: 'letters',
    statement: { given: ['$d \\mid a$', '$d \\mid b$'], gives: ['d|a', 'd|b'], goal: '$d \\mid a + b$' },
    numbers: { value: (v) => v.a + v.b, by: (v) => v.d, max: 12 },
    samples: [
      { d: 7, a: 21, b: 35 },
      { d: 3, a: 12, b: 6 },
      { d: 5, a: 40, b: 15, hide: 'b' },
    ],
    cards: [{ id: 'ka', tex: '$a = d \\times k$', ok: true, needs: ['d|a'], gives: ['k'], holdsOn: () => true }],
    order: ['ka'],
    text: {
      lead: 'lead',
      goal: 'goal',
      numbersAsk: say('numbersAsk'),
      numbersOk: say('numbersOk'),
      numbersMiss: say('numbersMiss'),
      carry: say('carry'),
      hidden: say('hidden'),
      line: say('line'),
      nextSample: 'nextSample',
      toCards: 'toCards',
      cardsLead: 'cardsLead',
      cardsAsk: 'cardsAsk',
      givenLabel: 'given',
      goalLabel: 'goalLabel',
      needs: say('needs'),
      proved: 'proved',
      done: 'done',
    },
  },
};

describe('the investigation screens — join, stack, peel, letters open on their question, their goal and their first act', () => {
  const first = {
    join: 'data-iq-say="yes"',
    stack: 'data-iq-say="yes"',
    peel: 'data-iq-peel',
    letters: 'data-iq-q="8"',
  };
  for (const [kind, spec] of Object.entries(SPECS))
    it(kind, () => {
      const html = renderToString(<Inquiry spec={spec} onDone={() => {}} />);
      expect(html).toContain(`data-iq="${kind}"`);
      expect(html).toContain('data-iq-goal');
      expect(html).toContain(first[kind]);
      expect(html).not.toContain('undefined');
    });
});
