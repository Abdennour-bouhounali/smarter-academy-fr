// The investigation `crews` (InquiryCrews.jsx): mounted by `Inquiry` on its kind, each mode drawn stage by stage from its
// reducer (crews.js) by its pure view — the hooks a walk drives, nothing drawn as a gear, the 62 day columns at
// 1366 × 768, and no word of its own: every word on screen is one of the lesson's (tokens « §… »). Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { StoryView, DaysView } from './InquiryCrews';
import { daysReducer, initDays, initStory, storyReducer } from './crews';
import { lanesHeight, PANEL, rowsWidth, STORY_LANES } from './crewLanes';

globalThis.window = globalThis.window ?? {};

const PILLAR = {
  before: '§before',
  after: '§after',
  plant: '§plant',
  lay: '§lay',
  take: '§take',
  error: { empty: '§empty', nan: '§nan', range: (m) => `§range${m}` },
  crew: (i, b) => `§crew${i}_${b}`,
  pillar: (d) => `§pillar${d}`,
  short: (n) => `§short${n}`,
  band: (n, b) => `§band${n}x${b}`,
  lane: (l, i) => `§lane${i}_${l.planks}_${l.short}`,
  shore: '§shore',
  verdict: (t) => `§verdict_${t.verdict}`,
  purse: () => '§purse',
};
const STORY = {
  kind: 'crews',
  mode: 'story',
  ruler: 700,
  rounds: [
    {
      text: ['§story1', '§story2'],
      unit: { options: ['§tooth', '§turn', '§wheel'], right: '§tooth' },
      numbers: [32, 20, 52, 12, 2],
      crews: [32, 20],
      ask: [
        { id: 'teeth', label: '§teeth', value: 160 },
        { id: 'turns32', label: '§turns32', value: 5 },
      ],
    },
    {
      text: '§bus',
      unit: { options: ['§minute', '§bus', '§hour'], right: '§minute' },
      numbers: [10, 46, 6, 2, 3],
      crews: [10, 46],
      ask: [{ id: 'at', label: '§at', value: [10, 0], clock: true }],
    },
  ],
  text: {
    lead: (r, i) => `§lead${i}`,
    goal: (r, i) => `§goal${i}`,
    translate: '§translate',
    unitAsk: '§unitAsk',
    crewAsk: (i) => `§crewAsk${i}`,
    mapFact: (f) => `§mapFact_${f.slot}_${f.value}`,
    pillar: PILLAR,
    toStory: '§toStory',
    hour: '§h',
    minute: '§min',
    check: '§check',
    backFact: (f) => `§backFact_${f.id}_${f.said}`,
    end: () => '§end',
    foundLine: (r) => `§found${r.d}`,
    next: '§next',
    done: '§done',
  },
};
const FIVE = [1, 2, 3, 4, 5].map((sleep) => ({ sleep }));
const DAYS = {
  kind: 'crews',
  mode: 'days',
  teams: FIVE,
  days: 62,
  stages: [
    { ask: 'zero', options: [0, 1] },
    { teams: [1, 2], run: 'step' },
    { teams: [1, 2, 3, 4], run: 'fast', stopOn: 'all-but-one' },
  ],
  text: {
    lead: (st, i) => `§lead${i}`,
    goal: (st, i) => `§goal${i}`,
    rows: { team: (i) => `§team${i + 1}`, since: (n) => String(n) },
    zeroAsk: '§zeroAsk',
    zeroFact: (f) => `§zeroFact_${f.said}_${f.right}`,
    sayAsk: (st) => `§sayAsk${st.teams.join('')}`,
    dayBefore: '§dayBefore',
    say: '§say',
    saidLine: (d) => `§said${d}`,
    step: '§step',
    fast: '§fast',
    pause: '§pause',
    stopFact: (s) => `§stop${s.day}_${s.team}`,
    met: (f) => `§met${f.day}_${f.said}`,
    foundLine: (x) => `§found${x.day}`,
    next: '§next',
    done: '§done',
  },
};
const noop = () => {};
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);
const visible = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ');
const noWords = (html) => expect(visible(html).replace(/§\S+/g, '')).not.toMatch(/\p{L}{2,}/u);
const noGear = (html) => expect(html).not.toMatch(/gear|cog|engrenage|roue|dent/i);

const sAct = {
  read: noop,
  chip: noop,
  walk: { type: noop, nudge: noop, plant: noop, lay: noop, take: noop },
  back: noop,
  type: noop,
  check: noop,
  next: noop,
};
const story = (moves, from = initStory()) => moves.reduce((s, a) => storyReducer(STORY, s, a), from);
const walk = (action) => ({ type: 'walk', action });
const pillar = (d) => [
  walk({ type: 'take' }),
  walk({ type: 'type', text: String(d) }),
  walk({ type: 'plant' }),
  walk({ type: 'lay' }),
  ...Array.from({ length: 45 }, () => walk({ type: 'tick' })),
];
const sView = (s) => renderToString(<StoryView spec={STORY} state={s} act={sAct} />).replaceAll('<!-- -->', '');

describe('crews — story', () => {
  it('is mounted by Inquiry on its kind and opens on the story card, words only, and « Traduis »', () => {
    const html = renderToString(<Inquiry spec={STORY} onDone={noop} />).replaceAll('<!-- -->', '');
    clean(html);
    noWords(html);
    noGear(html);
    expect(html).toContain('data-iq="crews"');
    expect(html).toContain('data-iq-mode="story"');
    expect(html).toContain('data-iq-stage="read"');
    expect(html).toContain('§story1');
    expect(html).toContain('data-iq-read');
    expect(html).not.toContain('data-iq-chip');
    expect(html).not.toContain('<svg');
  });

  it('the chips: the story’s options and numbers only — never a result; a wrong chip gets the story’s fact', () => {
    let s = story([{ type: 'read' }]);
    let html = sView(s);
    noWords(html);
    expect(html).toContain('data-iq-chip="unit:§tooth"');
    for (const n of [32, 20, 52, 12, 2]) expect(html).toContain(`data-iq-chip="A:${n}"`);
    for (const n of [5, 8, 160]) expect(html).not.toContain(`data-iq-chip="A:${n}"`);
    s = story([{ type: 'chip', slot: 'A', value: 52 }], s);
    html = sView(s);
    expect(html).toContain('§mapFact_A_52');
    expect(html).toContain('data-iq-chosen=""');
  });

  it('the pillar on the story’s own ruler 0 … 700 (1,571 px a case): 160 at 251 px, the lanes of 32 and 20', () => {
    let s = story([
      { type: 'read' },
      { type: 'chip', slot: 'unit', value: '§tooth' },
      { type: 'chip', slot: 'A', value: 32 },
      { type: 'chip', slot: 'B', value: 20 },
    ]);
    let html = sView(s);
    noWords(html);
    noGear(html);
    expect(html).toContain('data-iq-stage="pillar"');
    expect(html).toContain('data-cl-px="1.571"');
    expect(html).toContain('data-cl-tick="700"');
    expect(html).toMatch(/disabled=""[^>]*data-iq-back|data-iq-back[^>]*disabled/);
    s = story(pillar(160), s);
    html = sView(s);
    expect(html).toContain('data-di-walkway-verdict="paid"');
    expect(html).toMatch(/data-di-lane="A" data-di-planks="5" data-di-short="0"/);
    expect(html).toMatch(/data-di-lane="B" data-di-planks="8" data-di-short="0"/);
    expect(html).toContain('§verdict_paid');
    expect(html).not.toMatch(/disabled=""[^>]*data-iq-back/);
    // at 1366 × 768 the stage stands in the mirror's frame (walk 2026-11-26: « Reviens à l’histoire » at y 959): the
    // translation set on ONE row, « back to the story » among the panel's buttons, the lanes drawn tighter
    expect(html).toContain('iq-crews__map is-set');
    const btns = html.indexOf('class="ch-buttons"');
    expect(btns).toBeGreaterThan(-1);
    expect(html.indexOf('data-iq-back')).toBeGreaterThan(btns);
    expect(html.indexOf('data-iq-back')).toBeLessThan(html.indexOf('class="ch-facts"'));
    expect(html).not.toMatch(/iq-actions[^]*data-iq-back/);
    expect(html).toContain(`height="${lanesHeight(2, STORY_LANES)}"`);
    expect(lanesHeight(2, STORY_LANES)).toBeLessThanOrEqual(lanesHeight(2, PANEL) - 30);
    expect(STORY_LANES.W).toBe(PANEL.W);
    // a pillar short of both planks (walk 2026-11-26, 19 on 32 and 20): each shortfall label in its lane, past the post —
    // never on the next lane's name, under the pillar's line nor on its distance
    html = sView(story(pillar(19), s));
    expect(html).toMatch(
      /data-di-lane="A"[^]*data-cl-short-below="side"[^]*data-di-lane="B"[^]*data-cl-short-below="side"/,
    );
    // the product, laid on the same ruler: 640 at 1 006 px — inside the drawing
    s = story(pillar(640), s);
    html = sView(s);
    expect(html).toContain('data-di-post="640"');
  });

  it('back to the story: his boxes; a wrong value gets its fact; a clock time is two boxes « h » and « min »', () => {
    let s = story([
      { type: 'read' },
      { type: 'chip', slot: 'unit', value: '§tooth' },
      { type: 'chip', slot: 'A', value: 32 },
      { type: 'chip', slot: 'B', value: 20 },
      ...pillar(160),
      { type: 'back' },
      { type: 'type', id: 'teeth', value: '160' },
      { type: 'type', id: 'turns32', value: '8' },
      { type: 'check' },
    ]);
    let html = sView(s);
    noWords(html);
    expect(html).toContain('data-iq-in="teeth"');
    expect(html).toContain('§backFact_turns32_8');
    expect(html).toContain('data-iq-check');
    s = story([{ type: 'type', id: 'turns32', value: '5' }, { type: 'check' }], s);
    html = sView(s);
    expect(html).toContain('data-iq-stage="seen"');
    expect(html).toContain('§end');
    expect(html).toContain('§found160');
    expect(html).toContain('data-iq-next');
    s = story([{ type: 'next' }, { type: 'read' }, { type: 'chip', slot: 'unit', value: '§minute' }], s);
    s = story(
      [
        { type: 'chip', slot: 'A', value: 10 },
        { type: 'chip', slot: 'B', value: 46 },
        ...pillar(230),
        { type: 'back' },
      ],
      s,
    );
    html = sView(s);
    expect(html).toContain('data-iq-in="at:h"');
    expect(html).toContain('data-iq-in="at:min"');
    expect(html).toContain('§h');
    expect(html).toContain('§min');
  });
});

const dAct = { zero: noop, say: noop, step: noop, pause: noop, resume: noop, next: noop };
const days = (moves, from = initDays()) => moves.reduce((s, a) => daysReducer(DAYS, s, a), from);
const dView = (s, lit = null) =>
  renderToString(<DaysView spec={DAYS} state={s} act={dAct} lit={lit} />).replaceAll('<!-- -->', '');

describe('crews — days', () => {
  it('is mounted by Inquiry on its kind: five rows of 62 days of 17 px (1 164 px), day 1 lit, the question of day 1', () => {
    const html = renderToString(<Inquiry spec={DAYS} onDone={noop} />).replaceAll('<!-- -->', '');
    clean(html);
    noWords(html);
    expect(html).toContain('data-iq-mode="days"');
    expect(html).toContain('data-iq-stage="zero"');
    expect(html).toContain('data-cl-cols="62"');
    expect(html).toContain('data-cl-col="17"');
    expect(rowsWidth(62, 17)).toBe(1164);
    expect(html).toContain(`width="${rowsWidth(62, 17)}"`);
    expect(html).toContain('data-iq-zero="0"');
    expect(html).toContain('data-iq-zero="1"');
    // day 1: every team works, 0 days since the start under each
    for (let t = 1; t <= 5; t += 1) expect(html).toContain(`data-iq-cell="${t}:1" data-iq-on="1"`);
    expect(html).not.toContain('data-iq-cell="1:2"');
  });

  it('a wrong answer on day 1 gets the lesson’s fact; then the next stage asks the day, outlines the asked rows', () => {
    let s = days([{ type: 'zero', value: 1 }]);
    let html = dView(s);
    expect(html).toContain('§zeroFact_1_false');
    s = days([{ type: 'zero', value: 0 }, { type: 'next' }], s);
    html = dView(s);
    noWords(html);
    expect(html).toContain('data-iq-stage="say"');
    expect(html).toContain('data-iq-in="day"');
    expect(html).toContain('§sayAsk12');
    expect(html).toContain('data-iq-row="1" data-iq-asked="1"');
    expect(html).toContain('data-iq-row="3" data-iq-asked="0"');
  });

  it('a step run: « Jour suivant » lights the next column team after team; the day met is written beside his', () => {
    let s = days([{ type: 'zero', value: 0 }, { type: 'next' }, { type: 'say', text: '6' }, { type: 'step' }]);
    // day 2 lit for the first two teams only, so far
    let html = dView(s, 2);
    expect(html).toContain('data-iq-step');
    expect(html).toContain('§said6');
    expect(html).toContain('data-iq-cell="1:2" data-iq-on="0"');
    expect(html).toContain('data-iq-cell="2:2" data-iq-on="0"');
    expect(html).not.toContain('data-iq-cell="3:2"');
    for (let k = 0; k < 5; k += 1) s = days([{ type: 'step' }], s);
    html = dView(s);
    noWords(html);
    expect(html).toContain('data-iq-stage="met"');
    expect(html).toContain('data-iq-day="7"');
    expect(html).toContain('§met7_6');
    expect(html).toContain('data-cl-day="7"');
    // the rows are the tables: team 1's lit cells carry 0, 2, 4, 6
    expect(html).toMatch(/data-iq-cell="1:7" data-iq-on="1">.*?>6<\/text>/);
  });

  it('a fast run stops on the days where all but one work, names that one, and « Avance » goes on', () => {
    let s = days([
      { type: 'zero', value: 0 },
      { type: 'next' },
      { type: 'say', text: '7' },
      ...Array.from({ length: 6 }, () => ({ type: 'step' })),
      { type: 'next' },
      { type: 'say', text: '31' },
    ]);
    expect(s.si).toBe(2);
    while (s.phase !== 'stop') s = days([{ type: 'step' }], s);
    let html = dView(s);
    noWords(html);
    expect(html).toContain('data-iq-stage="stop"');
    expect(html).toContain('§stop13_4');
    expect(html).toContain('data-iq-fast');
    s = days([{ type: 'resume' }, { type: 'pause' }], s);
    html = dView(s);
    expect(html).toContain('data-iq-fast');
    s = days([{ type: 'resume' }], s);
    html = dView(s);
    expect(html).toContain('data-iq-pause');
  });
});
