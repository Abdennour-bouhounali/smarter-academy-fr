import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { ListsView } from './InquiryLists';
import { initLists, listsReducer } from './lists';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `lists` »), as plain tags. */
const SPEC = {
  kind: 'lists',
  rounds: [
    { a: 32, b: 44 },
    { a: 65, b: 39 },
  ],
  text: {
    lead: (a, b) => `lead(${a},${b})`,
    goal: (a, b) => `goal(${a},${b})`,
    listLabel: (n) => `list${n}`,
    buildAsk: (f) => `buildAsk[${f.n}:${f.list.length}]`,
    unit: 'cells',
    lay: 'lay',
    claim: 'claim',
    bound: (f) => `bound[${f.n}]`,
    fills: (f) => `fills[${f.n}:${f.d}:${f.q}]`,
    again: (f) => `again[${f.d}:${f.q}]`,
    misses: (f) => `misses[${f.d}:${f.q}:${f.r}]`,
    missing: (f) => `missing[${f.n}:${f.d}:${f.q}]`,
    closed: (f) => `closed[${f.n}:${f.list.join(' ')}]`,
    go: 'go',
    linkAsk: (f) => `linkAsk[${f.a}:${f.b}]`,
    allLinked: 'allLinked',
    linked: (f) => `linked[${f.d}:${f.from}]`,
    unlinked: (f) => `unlinked[${f.d}:${f.n}:${f.q}:${f.r}]`,
    linkMissing: (f) => `linkMissing[${f.d}]`,
    linksDone: (f) => `linksDone[${f.links.join(' ')}]`,
    longAsk: (f) => `longAsk[${f.a}:${f.b}]`,
    longer: (f) => `longer[${f.d}:${f.longer}]`,
    crowned: (f) => `crowned[${f.d}:${f.picks.join(' ')}]`,
    foundLine: (r) => `line[${r.a}:${r.longest}]`,
    next: 'next',
    done: 'done',
  },
};
const act = { type() {}, lay() {}, complete() {}, go() {}, tap() {}, allLinked() {}, pick() {}, next() {} };
const html = (state, input) => renderToString(<ListsView spec={SPEC} state={state} act={act} input={input} />);
const play = (actions, from = initLists(SPEC)) => actions.reduce((s, a) => listsReducer(SPEC, s, a), from);
const lay = (...ds) => ds.flatMap((d) => [{ type: 'try', d }, { type: 'shown' }]);

describe('the investigation screen `lists`', () => {
  it('is mounted by Inquiry and opens on its question, its goal, the two empty gaps and the box of a plank', () => {
    expect(renderToString(<Inquiry spec={SPEC} onDone={() => {}} />)).toBe(html(initLists(SPEC), ''));
    const out = html(initLists(SPEC), '');
    expect(out).toContain('data-iq="lists"');
    expect(out).toContain('data-iq-stage="build"');
    expect(out).toContain('data-iq-side="a"');
    // the labels of the two lists start on the LEFT, where the lists start (the French screen, 2026-11-22)
    expect(out.match(/class="iq-li-label[^"]*" x="40"/g)).toHaveLength(2);
    expect(out).toContain('lead(32,44)');
    expect(out).toContain('goal(32,44)');
    expect(out).toContain('data-iq-strip="a"');
    expect(out).toContain('data-iq-strip="b"');
    expect(out).toContain('list32');
    expect(out).toContain('list44');
    expect(out).toContain('data-iq-list="a" data-iq-items=""');
    expect(out).toContain('buildAsk[32:0]');
    expect(out).toContain('data-iq-in="plank"');
    expect(out).toContain('data-iq-lay');
    expect(out).toContain('data-iq-complete');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('a round PLAYED through the screen: lists by pairs, wrong moves answered by facts, links, the longest', () => {
    // a plank that fills: its partner is written (gold) and both join the list
    let s = play(lay(4));
    let out = html(s);
    expect(out).toContain('fills[32:4:8]');
    expect(out).toContain('32 = 4 \\times \\textcolor{#fbbf24}{8}');
    expect(out).toContain('data-iq-items="4,8"');
    expect(out).toMatch(/data-iq-chip="4" data-iq-chip-state="new"/);
    expect(out).toMatch(/data-iq-chip="8" data-iq-chip-state="partner"/);
    // a plank that does not fill: the division, nothing added
    s = play(lay(5), s);
    out = html(s);
    expect(out).toContain('misses[5:6:2]');
    expect(out).toContain('32 = 5 \\times 6 + \\textcolor{#fbbf24}{2}');
    expect(out).toContain('data-iq-items="4,8"');
    // « complete » said early: one missing plank laid on the gap, not the list
    s = play([{ type: 'complete' }], s);
    out = html(s);
    expect(out).toContain('missing[32:1:32]');
    expect(out).toContain('data-iq-items="4,8"');
    // the world closes a full list
    s = play(lay(1, 2), s);
    out = html(s);
    expect(out).toContain('data-iq-stage="closed"');
    expect(out).toContain('closed[32:1 2 4 8 16 32]');
    expect(out).toContain('data-iq-go');
    expect(out).not.toContain('data-iq-in="plank"');
    s = play([{ type: 'go' }, ...lay(1, 2, 4, 11), { type: 'go' }], s);
    out = html(s);
    // the two lists aligned plank under plank: equal planks share a column (the same x)
    expect(out).toContain('data-iq-stage="link"');
    expect(out).toContain('data-iq-items="1,2,4,8,16,32"');
    expect(out).toContain('data-iq-items="1,2,4,11,22,44"');
    const xOf = (side, d) => {
      const row = out.slice(out.indexOf(`data-iq-list="${side}"`));
      const chip = row.slice(row.indexOf(`data-iq-chip="${d}"`));
      return chip.match(/<text x="([\d.]+)"/)[1];
    };
    expect(xOf('a', 4)).toBe(xOf('b', 4));
    expect(xOf('a', 8)).not.toBe(xOf('b', 11));
    expect(out).toContain('linkAsk[32:44]');
    expect(out).toContain('data-iq-all-linked');
    expect(out).toMatch(/data-iq-chip="8" data-iq-chip-state="" role="button"/);
    // a wrong link: outlined, its division on the other gap written
    s = play([{ type: 'tap', side: 'a', d: 8 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('unlinked[8:44:5:4]');
    expect(out).toContain('44 = 8 \\times 5 + \\textcolor{#fbbf24}{4}');
    expect(out).toMatch(/data-iq-chip="8" data-iq-chip-state="wrong"/);
    expect(out).toContain('data-iq-links=""');
    // right links
    s = play([{ type: 'tap', side: 'b', d: 4 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('linked[4:b]');
    expect(out).toContain('data-iq-links="4"');
    expect(out).toContain('class="iq-li-link "');
    // « all linked » early: one missing link shown
    s = play([{ type: 'allLinked' }], s);
    out = html(s);
    expect(out).toContain('linkMissing[1]');
    expect(out).toMatch(/data-iq-chip="1" data-iq-chip-state="hint"/);
    expect(out).toContain('iq-li-link is-hint');
    s = play(
      [{ type: 'tap', side: 'a', d: 1 }, { type: 'shown' }, { type: 'tap', side: 'a', d: 2 }, { type: 'shown' }],
      s,
    );
    s = play([{ type: 'allLinked' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="longest"');
    expect(out).toContain('longAsk[32:44]');
    expect(out).toContain('linksDone[1 2 4]');
    // only linked planks can be picked now
    expect(out).toMatch(/data-iq-chip="4" data-iq-chip-state="linked" role="button"/);
    expect(out).not.toMatch(/data-iq-chip="8" data-iq-chip-state="[^"]*" role="button"/);
    // a shorter pick: a longer linked plank shown
    s = play([{ type: 'pick', d: 2 }], s);
    out = html(s);
    expect(out).toContain('longer[2:4]');
    expect(out).toMatch(/data-iq-chip="4" data-iq-chip-state="longer"/);
    s = play([{ type: 'pick', d: 4 }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-crown="4"');
    expect(out).toContain('crowned[4:2 4]');
    expect(out).toContain('iq-li-link is-crown');
    expect(out).toContain('line[32:4]');
    expect(out).toContain('>next<');
    expect(out).not.toMatch(/undefined|NaN/);
    // the second round, the last: its button ends the experiment
    s = play(
      [
        { type: 'next' },
        ...lay(1, 5),
        { type: 'go' },
        ...lay(1, 3),
        { type: 'go' },
        { type: 'tap', side: 'a', d: 1 },
        { type: 'shown' },
        { type: 'tap', side: 'b', d: 13 },
        { type: 'shown' },
        { type: 'allLinked' },
        { type: 'pick', d: 13 },
      ],
      s,
    );
    out = html(s);
    expect(out).toContain('lead(65,39)');
    expect(out).toContain('data-iq-crown="13"');
    expect(out).toContain('>done<');
  });

  it('`crown: false`: the round ends on the two lists and their links — no question of the longest, no crown', () => {
    const spec = { ...SPEC, crown: false, rounds: [{ a: 32, b: 44 }] };
    const s = [
      ...lay(1, 2, 4),
      { type: 'go' },
      ...lay(1, 2, 4),
      { type: 'go' },
      ...[1, 2, 4].flatMap((d) => [{ type: 'tap', side: 'a', d }, { type: 'shown' }]),
      { type: 'allLinked' },
    ].reduce((st, a) => listsReducer(spec, st, a), initLists(spec));
    const out = renderToString(<ListsView spec={spec} state={s} act={act} />);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('linksDone[1 2 4]');
    expect(out).toContain('data-iq-links="1,2,4"');
    expect(out).not.toContain('data-iq-crown');
    expect(out).not.toContain('is-crown');
    expect(out).not.toMatch(/longAsk|crowned|longer\[/);
    expect(out).not.toMatch(/data-iq-chip-state="(crown|picked|longer)"/);
    expect(out).toContain('line[32:4]');
    expect(out).toContain('>done<');
    // the links stay drawn, tapped from no list any more
    expect(out.match(/class="iq-li-link "/g)).toHaveLength(3);
    expect(out).not.toContain('is-tap');
  });

  it('the widest pair up to 120 (84 and 120, 22 columns) draws every plank with readable SVG text', () => {
    const spec = { ...SPEC, rounds: [{ a: 84, b: 120 }] };
    const lay2 = (n) => {
      const out = [];
      for (let d = 1; d * d <= n; d += 1) out.push({ type: 'try', d }, { type: 'shown' });
      return out;
    };
    const s = [...lay2(84), { type: 'go' }, ...lay2(120), { type: 'go' }].reduce(
      (st, a) => listsReducer(spec, st, a),
      initLists(spec),
    );
    const out = renderToString(<ListsView spec={spec} state={s} act={act} />);
    expect(out.match(/data-iq-chip=/g)).toHaveLength(12 + 16);
    const sizes = [...out.matchAll(/font-size:(\d+)/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(18);
  });
});
