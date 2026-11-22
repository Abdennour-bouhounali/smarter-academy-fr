import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { RoundtripView } from './InquiryRoundtrip';
import { initRoundtrip, roundtripReducer } from './roundtrip';
import { tex } from './logic';
import { tiles } from './strings';

globalThis.window = globalThis.window ?? {};

/**
 * A COMPLETE example of the spec of `roundtrip`, in Arabic — every key the screen reads (GAME_WORLD.md « spec shape of
 * `roundtrip` »). Facts only: what went in, what came out, what he wrote. A number in a sentence is `$…$` (MathText):
 * a « -9 » in plain Arabic text would be turned round by the bidi algorithm.
 */
const m = (x) => `$${tex(x)}$`;
/** A thing in words: a rod, the wall of a court, a court, a walk. */
const what = (t) =>
  t.walk != null
    ? `مقياس مشيِ زيرو من العمود ${String(t.walk).replace('-', '')} خطوات إلى اليسار`
    : t.court != null
      ? `ساحة مساحتها ${tiles(t.court)}`
      : t.rod.root != null
        ? `ضلع الساحة التي مساحتها ${tiles(t.rod.root)}`
        : `مقياس طوله ${m(t.rod.q)}`;
const said = (x) =>
  x.area != null ? `${m(x.area)} بلاطة` : x.root != null ? `ضلع الساحة التي مساحتها ${m(x.root)}` : m(x.q);
const ROUNDTRIP_SPEC = {
  kind: 'roundtrip',
  rounds: [
    { from: { rod: { root: '23' } }, path: ['build'] },
    { from: { rod: { q: '14' } }, path: ['build', 'take'] },
    { from: { walk: '-9' }, path: ['build', 'take'] },
    { from: { rod: { root: '7' } }, path: ['build', 'take', 'build'] },
  ],
  text: {
    lead: ({ from }) => `في يدك ${what(from)}.`,
    goal: () => 'قبل أن تعمل كلّ محطّة، اكتب ما سيخرج منها.',
    buildName: 'ابنِ ساحة',
    takeName: 'خذ الضلع',
    askBuild: ({ in: t }) => `يدخل ${what(t)} محطّة « ابنِ ساحة ». ماذا ستكتب لوحة الساحة؟`,
    askTake: ({ in: t }) => `تدخل ${what(t)} محطّة « خذ الضلع ». ما المقياس الذي يخرج؟`,
    tiles: 'بلاطة',
    formNumber: 'مقياس طوله عدد',
    formWall: 'ضلع ساحة',
    wallBox: 'ضلع الساحة التي مساحتها',
    wallLabel: ({ area }) => `ضلع الساحة ${area}`,
    plaque: ({ area }) => tiles(area),
    run: 'شغّل المحطّة',
    unread: 'اكتب عددًا في الخانة، ثمّ شغّل المحطّة.',
    unknown: '؟',
    ran: ({ op, out, said: x, right }) =>
      `${op === 'build' ? `خرجت ${what(out)}` : `خرج ${what(out)}`}${right ? '، كما كتبتَ' : `؛ كتبتَ ${said(x)}`}.`,
    go: 'إلى المحطّة التالية',
    next: 'الرحلة التالية',
    done: 'انتهيت',
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
const TOLD = /جذر|بالضبط|مضبوط|تقريب|مقرّب|مقرب|√|مربّع|مربع/;

describe('the investigation screen `roundtrip`', () => {
  it('is mounted by Inquiry: two stations, the wall of 23 waiting at « build », a plaque box with its printed unit', () => {
    const out = renderToString(<Inquiry spec={ROUNDTRIP_SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="roundtrip"');
    expect(out).toContain('data-iq-stage="ask"');
    expect(out).toContain('data-rt-station="build" data-rt-station-state="ask"');
    expect(out).toContain('data-rt-station="take" data-rt-station-state="idle"');
    expect(out).toContain('data-rt-rod="wall:23"');
    expect(out).toContain('ضلع الساحة 23');
    expect(out).toContain('data-rt-wait');
    expect(out).toContain('data-iq-in="plaque"');
    expect(out).toContain('>بلاطة<');
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
    expect(out).toContain('كتبتَ');
    expect(out).toContain('data-iq-next');
    expect(out).toContain('الرحلة التالية');
    expect(out).toContain('data-rt-chip="court:23"');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('14 → a court of 196 drawn tile by tile → « take »: a number box, or « the side of the court of [ ] » in a rod label', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' })]);
    let out = html(s);
    expect((out.match(/class="rq-court__tile[^"]*"/g) ?? []).length).toBe(196);
    expect(out).toContain('إلى المحطّة التالية');
    s = play([{ type: 'next' }], s);
    out = html(s, { text: '', form: 'number' });
    expect(out).toContain('data-rt-station="take" data-rt-station-state="ask"');
    expect(out).toContain('data-iq-form="number"');
    expect(out).toContain('data-iq-form="wall"');
    expect(out).toContain('data-iq-in="rod"');
    out = html(s, { text: '196', form: 'wall' });
    expect(out).toContain('data-iq-rodlabel');
    expect(out).toContain('ضلع الساحة التي مساحتها');
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

  it('a chain of three, and the last station says « done »', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' }), { type: 'next' }]);
    s = play([...station({ q: '14' }), { type: 'next' }, ...station({ area: '81' }), { type: 'next' }], s);
    s = play([...station({ q: '9' }), { type: 'next' }, ...station({ area: '7' }), { type: 'next' }], s);
    s = play([...station({ root: '7' }), { type: 'next' }, ...station({ area: '7' })], s);
    const out = html(s);
    expect(out).toContain('data-rt-strip="3"');
    expect((out.match(/data-rt-op="/g) ?? []).length).toBe(1 + 2 + 2 + 3);
    expect(out).toContain('انتهيت');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('an unread answer is answered by the lesson’s guidance; a large court is drawn in blocks; a fraction in its shape', () => {
    let out = html(play([{ type: 'say', said: null }]));
    expect(out).toContain('اكتب عددًا في الخانة');
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
