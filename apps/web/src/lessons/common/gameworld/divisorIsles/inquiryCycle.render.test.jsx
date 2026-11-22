import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { CycleView } from './InquiryCycle';
import { cycleReducer, initCycle } from './cycle';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `cycle` »), as plain tags. */
const say =
  (tag) =>
  (...args) =>
    `${tag}(${args.map((x) => (x && typeof x === 'object' ? Object.keys(x).length : x)).join(',')})`;
const SPEC = {
  kind: 'cycle',
  rounds: [
    { b: 5, from: 18, count: 4 },
    { b: 3, from: 9, count: 3 },
  ],
  probes: [{ b: 7, from: 21 }],
  text: {
    lead: say('lead'),
    goal: say('goal'),
    start: say('start'),
    ask: say('ask'),
    grew: (f) => `grew[${f.a}:${f.r}:${f.wraps}:${f.said}]`,
    left: (n) => `left${n}`,
    foundLine: (r) => `line[${r.b}:${r.steps.map((st) => st.r).join('')}]`,
    next: 'next',
    toProbe: 'toProbe',
    done: 'done',
    probeLead: say('probeLead'),
    maxAsk: say('maxAsk'),
    maxUnit: 'unit',
    sameAsk: say('sameAsk'),
    yes: 'yes',
    no: 'no',
    grow: 'grow',
    probeSeen: (p) => `seen[${p.b}:${p.max}:${p.said.max}:${p.said.same}]`,
    probeLine: (p) => `pline[${p.b}:${p.max}]`,
  },
};
const act = { say() {}, next() {}, max() {}, same() {}, grow() {} };
const html = (state, maxIn) => renderToString(<CycleView spec={SPEC} state={state} act={act} maxIn={maxIn} />);
const play = (actions, from = initCycle()) => actions.reduce((s, a) => cycleReducer(SPEC, s, a), from);

describe('the investigation screen `cycle`', () => {
  it('is mounted by Inquiry and opens on its question, its goal, the first gap as a fact and the chips of a prediction', () => {
    const out = renderToString(<Inquiry spec={SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="cycle"');
    expect(out).toContain('data-iq-stage="guess"');
    expect(out).toContain('lead(5,18,4)');
    expect(out).toContain('data-iq-goal');
    expect(out).toContain('goal(5)');
    // 18 = 5 × 3 + 3: three planks, three cells left, said as a fact; the question is about 19
    expect(out).toContain('data-iq-strip="18"');
    expect(out).toContain('data-iq-left="3"');
    expect(out).toContain('start(5)');
    expect(out).toContain('ask(4)');
    expect(out).toContain('data-iq-col-next="19"');
    // the chips go one past the plank: « 5 » and « 6 » can be said
    for (let n = 0; n <= 6; n += 1) expect(out).toContain(`data-iq-say="${n}"`);
    expect(out).not.toContain('data-iq-say="7"');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('PLAYS a round: a prediction, the world lays, the staircase climbs — and falls where a plank goes in', () => {
    let s = initCycle();
    // 19 → 4 left: he says 4
    s = cycleReducer(SPEC, s, { type: 'say', n: 4 });
    let out = html(s);
    expect(out).toContain('data-iq-stage="lay"');
    expect(out).toMatch(/class="iq-chip is-on"[^>]*data-iq-say="4"/);
    expect(out).toContain('data-iq-strip="18"'); // the world has not grown the gap yet
    s = cycleReducer(SPEC, s, { type: 'shown' });
    out = html(s);
    expect(out).toContain('data-iq-stage="guess"');
    expect(out).toContain('data-iq-strip="19"');
    expect(out).toContain('data-iq-stairs="3,4"');
    expect(out).toContain('grew[19:4:false:4]');
    expect(out).toContain('19 = 5 \\times 3 +');
    // 20: he says 5 — the strip lays a fourth plank and nothing is left; what he said stays beside the fact
    s = play([{ type: 'say', n: 5 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('data-iq-strip="20"');
    expect(out).toContain('data-iq-stairs="3,4,0"');
    expect(out).toContain('data-iq-col="20:0"');
    expect(out).toContain('grew[20:0:true:5]');
    expect(out).toContain('iq-cyc-plank'); // the mark of the plank that went in
    expect(out).toContain('iq-cyc-said'); // his 5, struck through
    expect(out).not.toContain('data-iq-left='); // no cell left on the strip
    // the last gap of the round
    s = play([{ type: 'say', n: 1 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-next');
    expect(out).toContain('>next<');
    expect(out).toContain('line[5:3401]');
    expect(out).not.toContain('data-iq-say=');
  });

  it('PLAYS the probe: two answers before the world moves, then the gap grows alone and the staircase answers', () => {
    const round = (state, n) => {
      let s = state;
      for (let k = 0; k < n; k += 1) s = play([{ type: 'say', n: 0 }, { type: 'shown' }], s);
      return cycleReducer(SPEC, s, { type: 'next' });
    };
    let s = round(initCycle(), 3);
    expect(
      html(play([{ type: 'say', n: 1 }, { type: 'shown' }, { type: 'say', n: 2 }, { type: 'shown' }], s)),
    ).toContain('>toProbe<');
    s = round(s, 2);
    let out = html(s, '');
    expect(out).toContain('data-iq-part="probe"');
    expect(out).toContain('data-iq-stage="ask"');
    expect(out).toContain('probeLead(7,21)');
    expect(out).toContain('data-iq-in="max"');
    expect(out).toContain('data-iq-same="yes"');
    expect(out).toContain('data-iq-same="no"');
    expect(out).toMatch(/disabled=""[^>]*data-iq-grow/);
    s = play(
      [
        { type: 'max', n: 7 },
        { type: 'same', v: true },
      ],
      s,
    );
    out = html(s, '7');
    expect(out).not.toMatch(/disabled=""[^>]*data-iq-grow/);
    expect(out).toMatch(/class="rf-btn is-on"[^>]*data-iq-same="yes"/);
    s = cycleReducer(SPEC, s, { type: 'grow' });
    for (let k = 0; k < 6; k += 1) s = cycleReducer(SPEC, s, { type: 'tick' });
    out = html(s);
    expect(out).toContain('data-iq-stage="run"');
    expect(out).toContain('data-iq-stairs="0,1,2,3,4,5,6"');
    expect(out).toContain('data-iq-left="6"');
    expect(out).not.toContain('data-iq-grow');
    s = play([{ type: 'tick' }, { type: 'tick' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-stairs="0,1,2,3,4,5,6,0,1"');
    expect(out).toContain('seen[7:6:7:true]');
    expect(out).toContain('pline[7:6]');
    expect(out).toContain('>done<');
    expect(out).not.toMatch(/undefined|NaN/);
  });
});
