// The final mission's card (Mission.jsx): the story's lead and boxes, the posters' chip, the window of 31 days around the
// typed day, the fact only once the run has reached that day, the end of a run — and no word of its own. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Mission, { MissionView } from './Mission';
import { formatFr } from '@smarter-academy/core';
import { daysFact } from './crews';
import { labelWidth, todayBox } from './crewLanes';
import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('./mission.css', import.meta.url), 'utf8');

globalThis.window = globalThis.window ?? {};

const C = [8, 17, 20];
const M = {
  prompt: '§board',
  title: '§title',
  lead: ['§lead1', '§lead2'],
  posters: 3,
  lines: () => [{ tokens: ['§day', { slot: 'day', w: 4 }] }],
  check: ({ day }) => (daysFact(C, Number(day)).kind === 'first' ? 'ok' : `§fact${day}`),
  window: {
    cycles: C,
    day: ({ day }) => Number(day),
    labels: { team: (i) => `§team${i}`, since: (n) => String(n), before: (from) => `§from${from}` },
  },
  text: { check: '§check', later: '§later', posters: (l, of) => `§posters${l}of${of}`, spent: '§spent' },
};
const noop = () => {};
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);
const visible = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ');
const noWords = (html) => expect(visible(html).replace(/§\S+/g, '')).not.toMatch(/\p{L}{2,}/u);
const view = (props) =>
  renderToString(
    <MissionView
      m={M}
      posters={{ of: 3, left: 3 }}
      vals={{}}
      onType={noop}
      out={null}
      upto={null}
      onCheck={noop}
      onLater={noop}
      {...props}
    />,
  ).replaceAll('<!-- -->', '');

describe('the final mission — its card', () => {
  it('opens on the story’s lead, its box, the posters, « check » disabled until the box is filled', () => {
    const html = view({});
    clean(html);
    noWords(html);
    expect(html).toContain('data-di-mission="open"');
    expect(html).toContain('§lead1');
    expect(html).toContain('data-rf-use="day"');
    expect(html).toContain('data-di-posters="3"');
    expect(html).toContain('§posters3of3');
    expect(html).toMatch(/disabled=""[^>]*data-di-mission-check|data-di-mission-check[^>]*disabled/);
    expect(html).not.toContain('data-di-window');
    expect(html).not.toContain('data-di-mission-fact');
  });

  it('a wrong day: the 31-day window around it, run up to it; the fact only once the run is there — never 681', () => {
    const out = { fact: '§fact2129', day: 2129, over: false };
    let html = view({ vals: { day: '2129' }, out, upto: 2120, posters: { of: 3, left: 2 } });
    clean(html);
    expect(html).toContain('data-di-window="2114:2129"');
    expect(html).toContain('data-cl-from="2114"');
    expect(html).toContain('data-cl-cols="31"');
    expect(html).toContain('data-cl-col="34"');
    expect(html).toContain('§from2114');
    expect(html).not.toContain('data-di-mission-fact');
    html = view({ vals: { day: '2129' }, out, upto: 2129, posters: { of: 3, left: 2 } });
    noWords(html);
    expect(html).toContain('data-di-mission-fact');
    expect(html).toContain('§fact2129');
    // on 2129 the north ferry crosses, the west and south ones are at port
    expect(html).toContain('data-iq-cell="1:2129" data-iq-on="1"');
    expect(html).toContain('data-iq-cell="2:2129" data-iq-on="0"');
    expect(html).toContain('data-iq-cell="3:2129" data-iq-on="0"');
    expect(html).toContain('data-cl-day="2129"');
    expect(visible(html)).not.toContain('681');
  });

  it('a window past day 1 000: every number the kit draws is grouped by thousands (walk 2026-11-26: « 2116 »)', () => {
    const grouped = { ...M, window: { ...M.window, labels: { ...M.window.labels, since: (n) => formatFr(n) } } };
    const html = renderToString(
      <MissionView
        m={grouped}
        posters={{ of: 3, left: 2 }}
        vals={{ day: '2129' }}
        onType={noop}
        out={{ fact: '§fact', day: 2129, over: false }}
        upto={2129}
        onCheck={noop}
        onLater={noop}
      />,
    );
    // tags out, the thin spaces kept (`visible` folds every white space into one)
    const text = html.replace(/<[^>]+>/g, '|').replace(/§[^|]+/g, '');
    expect(text).toMatch(/2\u202F116/);
    expect(text).not.toMatch(/(?<![\d\u202F])\d{4,}/);
  });

  it('a window near the start begins on day 1, with no left mark', () => {
    const html = view({ out: { fact: '§fact2', day: 2, over: false }, upto: 2 });
    expect(html).toContain('data-cl-from="1"');
    expect(html).not.toContain('data-cl-before');
  });

  it('the last poster spent: the run is over — the boxes close, only « later » remains', () => {
    const html = view({ out: { fact: '§fact41', day: 41, over: true }, upto: 41, posters: { of: 3, left: 0 } });
    noWords(html);
    expect(html).toContain('data-di-mission="over"');
    expect(html).toContain('data-di-mission-over');
    expect(html).toContain('§spent');
    expect(html).not.toContain('data-di-mission-check');
    expect(html).not.toContain('data-rf-use="day"');
    expect(html).toContain('data-di-mission-later');
  });

  it('the overlay reads the story’s mission and the posters of the run from the game', () => {
    const game = {
      story: { mission: M },
      missionPosters: () => ({ of: 3, left: 1 }),
      missionTry: noop,
      closeMission: noop,
    };
    const html = renderToString(<Mission game={game} />);
    clean(html);
    expect(html).toContain('data-di-posters="1"');
    expect(html).toContain('§title');
  });
});

describe('the final mission — the plaque (`write`: a fraction)', () => {
  const P = {
    prompt: '§plaque',
    title: '§title',
    lead: ['§lead'],
    plaques: 2,
    write: { calc: { x: 3, y: 34, op: '*', z: 85, w: 87 }, p: 5, q: 58 },
    check: () => '§fact',
    text: { check: '§check', later: '§later', plaques: (l, of) => `§plaques${l}of${of}`, spent: '§spent' },
  };
  it('without `lines`, one fraction box (p over q); the chip of plaques; no window', () => {
    const html = renderToString(
      <MissionView
        m={P}
        posters={{ of: 2, left: 2 }}
        vals={{}}
        onType={noop}
        out={null}
        upto={null}
        onCheck={noop}
        onLater={noop}
      />,
    ).replaceAll('<!-- -->', '');
    clean(html);
    noWords(html);
    expect(html).toContain('data-rf-use="p"');
    expect(html).toContain('data-rf-use="q"');
    expect(html).toContain('data-rf-frac');
    expect(html).toContain('data-di-posters="2"');
    expect(html).toContain('§plaques2of2');
    expect(html).not.toContain('data-di-window');
  });
  it('the plaque stands UNDER the story’s mission card: a capped card, the box centred, the chip beside the buttons', () => {
    // walk 2026-11-26 (lesson 3, 80-plaque / 81-plaque-refused): a 1 220 px card, two-thirds empty, centred on the screen,
    // covered the mission card at the top (it ends near 210 px with a fraction in it) and cut its fraction
    const html = renderToString(
      <MissionView
        m={P}
        posters={{ of: 2, left: 1 }}
        vals={{ p: '85', q: '986' }}
        onType={noop}
        out={{ fact: '§fact', over: false }}
        upto={null}
        onCheck={noop}
        onLater={noop}
      />,
    ).replaceAll('<!-- -->', '');
    expect(html).toContain('mi-root mi-root--plaque');
    const go = html.indexOf('class="mi-go"');
    expect(go).toBeGreaterThan(-1);
    expect(html.indexOf('data-di-posters')).toBeGreaterThan(go);
    expect(html.indexOf('data-di-posters')).toBeGreaterThan(html.indexOf('data-di-mission-later'));
    // the veil keeps the mission card's box free (its top 210 px at 1366 × 768); the card's room is what is left
    const rule = (sel) => CSS.match(new RegExp(`${sel.replace(/[.()]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    const veil = rule('.di-veil:has(.mi-root--plaque)');
    expect(veil).toMatch(/place-items:\s*start center/);
    const top = Number(veil.match(/padding-top:\s*([\d.]+)rem/)?.[1]) * 16;
    expect(top).toBeGreaterThanOrEqual(214);
    expect(768 - top - 19.2).toBeGreaterThanOrEqual(500); // room left for the plaque's card
    expect(rule('.di-card:has(.mi-root--plaque)')).toMatch(/width:\s*min\(100%,\s*820px\)/);
    expect(rule('.mi-root--plaque .mi-answer')).toMatch(/justify-content:\s*center/);
    // the day mission keeps its wide card in the middle, its chip beside the box
    const day = view({});
    expect(day).not.toContain('mi-root--plaque');
    expect(day.indexOf('data-di-posters')).toBeLessThan(day.indexOf('class="mi-go"'));
  });

  it('a refused plaque: the story’s fact, no number; the last one: the run over, the walk back is the story’s', () => {
    let html = renderToString(
      <MissionView
        m={P}
        posters={{ of: 2, left: 1 }}
        vals={{ p: '85', q: '986' }}
        onType={noop}
        out={{ fact: '§fact', over: false, day: null }}
        upto={null}
        onCheck={noop}
        onLater={noop}
      />,
    );
    expect(html).toContain('data-di-mission-fact');
    expect(html).not.toContain('data-di-window');
    html = renderToString(
      <MissionView
        m={P}
        posters={{ of: 2, left: 0 }}
        vals={{}}
        onType={noop}
        out={{ fact: '§fact', over: true, day: null }}
        upto={null}
        onCheck={noop}
        onLater={noop}
      />,
    );
    expect(html).toContain('data-di-mission="over"');
    expect(html).toContain('§spent');
    expect(html).not.toContain('data-rf-use="p"');
  });
});

describe('the day rows — the gold outline of the asked day (gate B 2026-11-26)', () => {
  const x = (d) => 110 + (d - 2114) * 34;
  const labels = { team: String, since: (n) => formatFr(n), before: (f) => `… ${formatFr(f - 1)} jours` };
  it('is as wide as the numbers it holds: « 2 129 » over it, « 2 128 » under it — never across one', () => {
    const b = todayBox({ day: 2129, x, colW: 34, H: 210, ROW: 60, teams: [1, 2, 3], labels });
    expect(b.width).toBeGreaterThanOrEqual(labelWidth(formatFr(2128)) + 8);
    expect(b.x + b.width / 2).toBe(x(2129) + 17);
    expect([b.y, b.height]).toEqual([2, 206]);
  });
  it('covers only the rows the stage asks about: team 5 is never outlined before its stage', () => {
    const teams = [1, 2, 3, 4, 5];
    const b = todayBox({
      day: 61,
      x: (d) => 110 + (d - 1) * 17,
      colW: 17,
      H: 330,
      ROW: 60,
      teams,
      outline: [0, 1, 2, 3],
      labels,
    });
    expect(b.y).toBe(30 + 1);
    expect(b.y + b.height).toBe(30 + 4 * 60 - 1);
    const all = todayBox({
      day: 61,
      x: (d) => 110 + (d - 1) * 17,
      colW: 17,
      H: 330,
      ROW: 60,
      teams,
      outline: [0, 1, 2, 3, 4],
      labels,
    });
    expect([all.y, all.y + all.height]).toEqual([2, 328]);
  });
  it('the window past day 1 000: no head touches the elided days’ label (« … 1 345 jours » / « 1 346 »)', () => {
    const html = renderToString(
      <MissionView
        m={{ ...M, window: { ...M.window, labels: { ...labels, before: (f) => `§from${f}` } } }}
        posters={{ of: 3, left: 2 }}
        vals={{ day: '1361' }}
        onType={noop}
        out={{ fact: '§fact', day: 1361, over: false }}
        upto={1361}
        onCheck={noop}
        onLater={noop}
      />,
    );
    expect(html).toContain('data-cl-from="1346"');
    expect(html).toContain('data-cl-before');
    expect(html).not.toMatch(/>1 346</);
    expect(html).toMatch(/>1 351</);
  });
});
