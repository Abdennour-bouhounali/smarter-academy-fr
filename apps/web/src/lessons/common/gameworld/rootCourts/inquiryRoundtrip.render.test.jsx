import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { RoundtripView, ROUNDTRIP_LAYOUT } from './InquiryRoundtrip';
import { initRoundtrip, roundtripReducer } from './roundtrip';
import { tex } from './logic';
import { tiles } from './strings';
import { readFileSync } from 'node:fs';

globalThis.window = globalThis.window ?? {};

/**
 * A COMPLETE example of the spec of `roundtrip`, in French — every key the screen reads (GAME_WORLD.md « spec shape of
 * `roundtrip` »). Facts only: what went in, what came out, what he wrote. A number in a sentence is `$…$` (MathText).
 */
const m = (x) => `$${tex(x)}$`;
/** A thing in words: a rod, the wall of a court, a court, a walk. */
const what = (t) =>
  t.walk != null
    ? `la toise de la marche de Zéro, ${String(t.walk).replace('-', '')} pas à gauche du poteau`
    : t.court != null
      ? `une salle de ${tiles(t.court)}`
      : t.rod.root != null
        ? `le côté de la salle de ${tiles(t.rod.root)}`
        : `une toise de ${m(t.rod.q)}`;
const cap = (t) => t[0].toUpperCase() + t.slice(1);
const said = (x) =>
  x.area != null ? `${m(x.area)} dalles` : x.root != null ? `le côté de la salle de ${m(x.root)}` : m(x.q);
const ROUNDTRIP_SPEC = {
  kind: 'roundtrip',
  rounds: [
    { from: { rod: { root: '23' } }, path: ['build'] },
    { from: { rod: { q: '14' } }, path: ['build', 'take'] },
    { from: { walk: '-9' }, path: ['build', 'take'] },
    { from: { rod: { root: '7' } }, path: ['build', 'take', 'build'] },
  ],
  text: {
    lead: ({ from }) => `Tu as en main ${what(from)}.`,
    goal: () => 'Avant que chaque machine ne tourne, écris ce qui va en sortir.',
    buildName: 'Construis une salle',
    takeName: 'Prends le côté',
    askBuild: ({ in: t }) =>
      `${cap(what(t))} entre dans la machine « Construis une salle ». Qu’écrira la plaque de la salle ?`,
    askTake: ({ in: t }) => `${cap(what(t))} entre dans la machine « Prends le côté ». Quelle toise va sortir ?`,
    tiles: 'dalles',
    formNumber: 'Une toise de longueur…',
    formWall: 'Le côté d’une salle',
    wallBox: 'le côté de la salle de',
    wallLabel: ({ area }) => `côté de la salle ${area}`,
    plaque: ({ area }) => tiles(area),
    run: 'Lance la machine',
    unread: 'Écris un nombre dans la case, puis lance la machine.',
    unknown: '?',
    ran: ({ out, said: x, right }) =>
      `Il est sorti ${what(out)}${right ? ', comme tu l’as écrit' : ` ; tu avais écrit ${said(x)}`}.`,
    go: 'Vers la machine suivante',
    next: 'Voyage suivant',
    done: 'J’ai fini',
  },
};

const act = { type() {}, form() {}, run() {}, next() {} };
const html = (state, input) =>
  renderToString(<RoundtripView spec={ROUNDTRIP_SPEC} state={state} act={act} input={input} />);
const play = (actions, from = initRoundtrip(ROUNDTRIP_SPEC)) =>
  actions.reduce((s, a) => roundtripReducer(ROUNDTRIP_SPEC, s, a), from);
const station = (x) => [{ type: 'say', said: x }, { type: 'ran' }];
const seen = (out) =>
  out
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
const TOLD = /racine|exact|approch|arrondi|√|carré|[\u0600-\u06FF]/i;

describe('the investigation screen `roundtrip`', () => {
  it('is mounted by Inquiry: two stations, the wall of 23 waiting at « build », a plaque box with its printed unit', () => {
    const out = renderToString(<Inquiry spec={ROUNDTRIP_SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="roundtrip"');
    expect(out).toContain('data-iq-stage="ask"');
    expect(out).toContain('data-rt-station="build" data-rt-station-state="ask"');
    expect(out).toContain('data-rt-station="take" data-rt-station-state="idle"');
    expect(out).toContain('data-rt-rod="wall:23"');
    expect(out).toContain('côté de la salle 23');
    expect(out).toContain('data-rt-wait');
    expect(out).toContain('data-iq-in="plaque"');
    expect(out).toContain('>dalles<');
    expect(out).toContain('data-iq-run');
    expect(out).toContain('data-rt-strip="0"');
    expect(out).toContain('data-rt-chip="wall:23"');
    expect(out).toContain('data-rt-chip="?"');
    expect(out).not.toMatch(/undefined|NaN/);
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('the station runs: the rod slides in, the court unrolls tile by tile, the plaque is stamped; a miss is a fact', () => {
    let s = play([{ type: 'say', said: { area: '529' } }]);
    let out = html(s);
    expect(out).toContain('data-rt-station-state="run"');
    expect(out).toContain('class="rq-st__in is-going"');
    expect(out).toContain('data-rt-court="23" data-rt-blocks="no"');
    expect((out.match(/class="rq-unroll"/g) ?? []).length).toBe(5); // a side of 4,8 tiles: five rows, the last cut
    expect(out).toContain('rq-court__tile is-cut');
    expect(out).toContain('rq-plaque is-stamped');
    expect(out).not.toContain('data-iq-in=');
    s = play([{ type: 'ran' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('Il est sorti une salle de 23'); // what came out…
    expect(out).toContain(' ; tu avais'); // …and, a miss, what he had written (a fact, never « faux »)
    expect(out).toContain('data-iq-next');
    expect(out).toContain('Voyage suivant');
    expect(out).toContain('data-rt-chip="court:23"');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('14 → a court of 196 drawn tile by tile → « take »: a number box, or « the side of the court of [ ] » in a rod label', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' })]);
    let out = html(s);
    expect((out.match(/class="rq-court__tile[^"]*"/g) ?? []).length).toBe(196);
    expect(out).toContain('Vers la machine suivante');
    s = play([{ type: 'next' }], s);
    out = html(s, { text: '', form: 'number' });
    expect(out).toContain('data-rt-station="take" data-rt-station-state="ask"');
    expect(out).toContain('data-iq-form="number"');
    expect(out).toContain('data-iq-form="wall"');
    expect(out).toContain('data-iq-in="rod"');
    out = html(s, { text: '196', form: 'wall' });
    expect(out).toContain('data-iq-rodlabel');
    expect(out).toContain('le côté de la salle de');
    expect(out).toContain('data-iq-in="area"');
    s = play(station({ q: '196' }), s);
    out = html(s);
    expect(out).toContain('data-rt-rod="14"');
    expect(out).toContain('rq-rodp__bar is-growing');
    expect(out).toContain('data-rt-chip="rod:14"');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('the walk: the post in the middle of a graduated wall, the robot at −9; 81 tiles; the side that comes out is 9', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' }), { type: 'next' }]);
    s = play([...station({ q: '14' }), { type: 'next' }], s);
    let out = html(s);
    expect(out).toContain('data-rt-walk="-9"');
    expect(out).toContain('class="rq-robot"');
    expect(out).toContain('−9');
    expect(out).toContain('data-rt-chip="walk:-9"');
    s = play([...station({ area: '81' }), { type: 'next' }, ...station({ q: '-9' })], s);
    out = html(s);
    expect(out).toContain('data-rt-rod="9"');
    expect(out).not.toContain('data-rt-rod="-9"');
    // the strips of the journeys done stay drawn
    expect(out).toContain('data-rt-strip="0"');
    expect(out).toContain('data-rt-strip="1"');
    expect(out).toContain('data-rt-chip="court:196"');
  });

  it('a chain of three, and the last station says « done »', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' }), { type: 'next' }]);
    s = play([...station({ q: '14' }), { type: 'next' }, ...station({ area: '81' }), { type: 'next' }], s);
    s = play([...station({ q: '9' }), { type: 'next' }, ...station({ area: '7' }), { type: 'next' }], s);
    s = play([...station({ root: '7' }), { type: 'next' }, ...station({ area: '7' })], s);
    const out = html(s);
    expect(out).toContain('data-rt-strip="3"');
    expect((out.match(/data-rt-op="/g) ?? []).length).toBe(1 + 2 + 2 + 3);
    expect(out).toContain('J’ai fini');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('an unread answer is answered by the lesson’s guidance; a large court is drawn in blocks; a fraction in its shape', () => {
    let out = html(play([{ type: 'say', said: null }]));
    expect(out).toContain('Écris un nombre dans la case');
    const spec = {
      ...ROUNDTRIP_SPEC,
      rounds: [
        { from: { rod: { q: '30' } }, path: ['build'] },
        { from: { rod: { q: '2/3' } }, path: ['build', 'take'] },
      ],
    };
    let s = initRoundtrip(spec);
    s = roundtripReducer(spec, roundtripReducer(spec, s, { type: 'say', said: { area: '900' } }), { type: 'ran' });
    out = renderToString(<RoundtripView spec={spec} state={s} act={act} />);
    expect(out).toContain('data-rt-court="900" data-rt-blocks="yes"');
    expect((out.match(/class="rq-court__tile[^"]*"/g) ?? []).length).toBe(9);
    s = roundtripReducer(spec, s, { type: 'next' });
    out = renderToString(<RoundtripView spec={spec} state={s} act={act} input={{ text: '', form: 'number' }} />);
    expect(out).toContain('data-iq-in="plaque-num"');
    expect(out).toContain('data-iq-in="plaque-den"');
    expect(out).toContain('class="rq-fracin__bar"');
  });
});

describe('the roundtrip screen reads LEFT to right', () => {
  const num = (tag, name) => Number(tag.match(new RegExp(` ${name}="([\\d.-]+)"`))?.[1]);
  it('« build » is the station on the left, « take » on the right', () => {
    expect(ROUNDTRIP_LAYOUT.machine.build).toBeLessThan(ROUNDTRIP_LAYOUT.machine.take);
    const out = html(initRoundtrip(ROUNDTRIP_SPEC));
    const title = (op) =>
      out
        .match(new RegExp(`data-rt-station="${op}"[^>]*><text class="rq-st__title"[^>]*>`))[0]
        .match(/ x="([\d.]+)"/)[1];
    expect(Number(title('build'))).toBeLessThan(Number(title('take')));
    expect(out).not.toMatch(/direction="rtl"|dir="rtl"/);
  });
  it('in a station, what goes in stands on the LEFT of the machine, what comes out on its RIGHT, the arrow pointing right', () => {
    const { inn, body, out: tray, zone } = ROUNDTRIP_LAYOUT;
    expect(inn + zone).toBeLessThanOrEqual(body);
    expect(body + 110).toBeLessThanOrEqual(tray);
    // the court of 23 comes out of « build » right of its machine; the rod that went in sits left of it
    const s = play([{ type: 'say', said: { area: '529' } }]);
    const out = html(s);
    const st = out.slice(out.indexOf('data-rt-station="build"'), out.indexOf('data-rt-station="take"'));
    const machine = num(st.match(/<rect class="rq-st__body"[^>]*>/)[0], 'x');
    const rodIn = num(
      st
        .match(/<g class="rq-st__in[^>]*>.*?<rect class="rq-rodp__bar[^>]*>/s)[0]
        .match(/<rect class="rq-rodp__bar[^>]*>/)[0],
      'x',
    );
    const courtOut = num(
      st
        .match(/<g class="rq-st__out"[^>]*>.*?<rect class="rq-court__floor"[^>]*>/s)[0]
        .match(/<rect class="rq-court__floor"[^>]*>/)[0],
      'x',
    );
    expect(rodIn).toBeLessThan(machine);
    expect(courtOut).toBeGreaterThan(machine);
    const arrow = st.match(/<path class="rq-st__arrow" d="M ([\d.]+) 300 h (-?\d+)/);
    expect(Number(arrow[2])).toBeGreaterThan(0);
  });
  it('a strip reads in the order of the journey: its first chip left of the next one', () => {
    const s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' })]);
    const out = html(s);
    const strip = out.slice(out.indexOf('data-rt-strip="1"'));
    expect(strip.indexOf('data-rt-chip="rod:14"')).toBeLessThan(strip.indexOf('data-rt-chip="court:196"'));
    const css = readFileSync(new URL('./inquiry.css', import.meta.url), 'utf8');
    // the arrow between two chips points right: its head on the right end
    expect(css).toMatch(/\.rq-strip__op::after \{[^}]*right: 0;[^}]*border-right: 2px/);
  });
});
