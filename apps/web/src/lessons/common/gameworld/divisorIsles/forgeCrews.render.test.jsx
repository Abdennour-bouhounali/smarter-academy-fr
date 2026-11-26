// A rule forge's case about CREWS (forgeCrews.jsx, through forgeParts.jsx): a pillar on a two-crew walkway, a story claim,
// teams on their days — drawn with the walkway's lanes and the days' rows, never as an empty bridge; a case without
// those fields draws exactly as before. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FORGE_PARTS } from './forgeParts';
import { daysWindow, isCrewCase, walkOf } from './forgeCrews';
import { CASE, lanesHeight } from './crewLanes';

globalThis.window = globalThis.window ?? {};

const { Mirror, Line, beats } = FORGE_PARTS;
const mirror = (c, stage = 'done') => renderToString(<Mirror c={c} stage={stage} fast />).replaceAll('<!-- -->', '');
const line = (c) => renderToString(<Line c={c} />).replaceAll('<!-- -->', '');
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);
const noGear = (html) => expect(html).not.toMatch(/gear|cog|engrenage|roue|dent/i);

const walkCase = (A, B, d, held = false) => ({ text: '§walk', walk: { crews: [A, B], d }, held, tag: '§tag' });

describe('a case on a walkway (`c.walk`)', () => {
  it('64 on crews 16 and 20: two lanes from one start, the pillar, crew B 4 cases short — no bridge', () => {
    const html = mirror(walkCase(16, 20, 64));
    clean(html);
    expect(html).toContain('rf-walk');
    expect(html).not.toContain('data-rf-bridge');
    expect(html).toMatch(/data-rf-lane="A" data-di-planks="4" data-di-short="0"/);
    expect(html).toMatch(/data-rf-lane="B" data-di-planks="3" data-di-short="4"/);
    expect(html).toContain('data-di-post="64"');
    expect(html).toContain('planche de 16');
    expect(html).toMatch(/>64[\s\u00a0]cases</);
    expect(html).toMatch(/>4[\s\u00a0]cases</);
    expect(html).toContain('§walk');
    expect(html).toContain('is-fell');
    // the case's geometry: 720 wide, two lanes
    expect(html).toContain(`viewBox="0 0 ${CASE.W} ${lanesHeight(2, CASE)}"`);
  });

  it('80 holds (green); 13 248 on 414 / 192 drawn plank by plank at the fitted scale; 79 488: one band a lane, its count', () => {
    expect(mirror(walkCase(16, 20, 80, true))).toContain('is-held');
    let html = mirror(walkCase(414, 192, 13248, true));
    clean(html);
    expect(html).toMatch(/data-rf-lane="A" data-di-planks="32" data-di-short="0"/);
    html = mirror(walkCase(414, 192, 79488));
    expect(html).toContain('192 × 414');
    expect(html).toContain('414 × 192');
  });

  it('the pillar on the shore (0): no plank, nothing short, the post at 0', () => {
    const html = mirror(walkCase(16, 20, 0));
    clean(html);
    expect(html).toContain('data-di-post="0"');
    expect(html).toMatch(/data-rf-lane="A" data-di-planks="0" data-di-short="0"/);
  });

  it('asked: the sentence alone, without the bridge’s hint and without the drawing', () => {
    const html = mirror(walkCase(16, 20, 64), 'ask');
    expect(html).toContain('rf-sentence--alone');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('De quel pont');
  });

  it('its line: its sentence and tag, and a small drawing of the two lanes; its beats are its planks (≤ 40)', () => {
    const html = line(walkCase(16, 20, 64));
    clean(html);
    expect(html).toContain('§walk');
    expect(html).toContain('§tag');
    expect(html).toContain('rf-mini--pair');
    expect(beats(walkCase(16, 20, 64))).toBe(7);
    expect(beats(walkCase(414, 192, 79488))).toBe(40);
  });
});

describe('a story claim (`crews` / `story`)', () => {
  const meet = (v, held = false) => ({ story: 'gears', kind: 'meet', a: 32, b: 20, v, held, text: '§meet' });
  it('a meeting: the two rhythms as lanes, numbers only, the pillar at the meeting named', () => {
    const html = mirror(meet(160, true));
    clean(html);
    noGear(html);
    expect(html).toContain('data-di-post="160"');
    expect(html).toMatch(/data-rf-lane="A" data-di-planks="5" data-di-short="0"/);
    expect(html).toMatch(/data-rf-lane="B" data-di-planks="8" data-di-short="0"/);
    expect(html).not.toContain('planche');
    expect(html).toContain('is-held');
    expect(mirror(meet(640))).toContain('data-di-post="640"');
  });
  it('turns: n turns of the rhythm `who` — the pillar at n × who (8 × 32 = 256: crew 20 is 16 short)', () => {
    const c = { story: 'gears', kind: 'turns', a: 32, b: 20, who: 32, v: 8, text: '§turns' };
    expect(walkOf(c)).toEqual({ crews: [32, 20], d: 256, story: true });
    expect(mirror(c)).toMatch(/data-rf-lane="B" data-di-planks="12" data-di-short="16"/);
  });
  it('a clock claim without `walk`: its sentence alone — never an empty bridge; with `walk`, the lanes', () => {
    const c = { story: 'bus', kind: 'clock', a: 10, b: 46, v: 600, at: [10, 0], text: '§clock' };
    let html = mirror(c);
    clean(html);
    expect(html).toContain('§clock');
    expect(html).not.toContain('<svg');
    expect(isCrewCase(c)).toBe(true);
    html = mirror({ ...c, walk: { crews: [10, 46], d: 230 } });
    expect(html).toContain('data-di-post="230"');
  });
});

describe('teams on their days (`c.days`)', () => {
  const day = (cycles, d, held = false) => ({
    text: '§days',
    days: { cycles, day: d },
    teams: cycles.map((_, i) => i + 1),
    held,
  });
  it('teams 1 and 2 on day 7: their rows lit up to day 7, the day outlined; 31 columns from day 1', () => {
    const html = mirror(day([2, 3], 7, true));
    clean(html);
    expect(html).toContain('rf-days');
    expect(html).toContain('data-cl-from="1"');
    expect(html).toContain('data-cl-cols="31"');
    expect(html).toContain('data-cl-day="7"');
    expect(html).toContain('data-iq-cell="1:7" data-iq-on="1"');
    expect(html).toContain('data-iq-cell="2:7" data-iq-on="1"');
    expect(html).not.toContain('data-iq-cell="1:8"');
    expect(html).toContain('is-held');
    // compact: no « days since » under the cells
    expect(html).not.toContain('cl-since');
  });
  it('five teams on day 61: 62 columns of 10 (no glyph under 14); day 533: 31 days around it, « … » at the left', () => {
    let html = mirror(day([2, 3, 4, 5, 6], 61));
    clean(html);
    expect(html).toContain('data-cl-cols="62"');
    expect(html).toContain('data-cl-col="10"');
    expect(html).not.toContain('#cl-hammer"');
    expect(daysWindow(533)).toEqual({ from: 518, cols: 31 });
    html = mirror(day([4, 14, 19], 533));
    expect(html).toContain('data-cl-from="518"');
    expect(html).toContain('data-cl-before');
    expect(html).toContain('data-iq-cell="1:533" data-iq-on="1"');
    expect(line(day([4, 14, 19], 533))).toContain('rf-mini');
    expect(beats(day([2, 3], 7))).toBe(1);
  });
});

describe('a case without crews draws exactly as before', () => {
  it('a bridge: its cells and planks, its line', () => {
    const c = { a: 12, b: 4, q: 3, r: 0, held: true };
    expect(isCrewCase(c)).toBe(false);
    const html = mirror(c);
    expect(html).toContain('data-rf-bridge="12:4"');
    expect(html).not.toContain('rf-walk');
    expect(beats(c)).toBe(3);
  });
});
