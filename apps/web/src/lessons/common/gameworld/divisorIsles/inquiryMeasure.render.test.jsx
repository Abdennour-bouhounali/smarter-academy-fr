import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { MeasureView } from './InquiryMeasure';
import { initMeasure, measureReducer } from './measure';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

const frac = (f) => (f ? f.join('_') : '-'); // a fraction written « a_b » in the fixture's words, never « a/b »
/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `measure` »), as plain tags. */
const SPEC = {
  kind: 'measure',
  rounds: [
    { a: 66, b: 78, mode: 'stages', chips: [2, 3, 4, 6] },
    { a: 66, b: 99, mode: 'direct' },
  ],
  text: {
    lead: (a, b, mode) => `lead(${a},${b},${mode})`,
    goal: (a, b, mode) => `goal(${a},${b},${mode})`,
    pickAsk: (f) => `pickAsk[${f.p}_${f.q}:${f.stage}:${f.run}]`,
    unit: 'units',
    lay: 'lay',
    end: 'end',
    bound: (f) => `bound[${f.max}]`,
    sameRoad: (f) => `sameRoad[${f.d}:${f.used.join('')}]`,
    refused: (f) => `refused[${f.d}:${f.ra}:${f.rb}]`,
    counted: (f) => `counted[${f.d}:${frac(f.from)}~${frac(f.to)}:${f.stage}]`,
    checkLabel: (f) => `checkLabel[${f.p}]`,
    checkSeen: (f) => `checkSeen[${f.found}:${f.tried.length}]`,
    runEnd: (f) => `runEnd[${f.run}:${frac(f.end)}:${frac(f.predicted)}:${f.same}:${f.found}]`,
    notEnough: (f) => `notEnough[${f.d}:${frac(f.end)}:${f.found}]`,
    predictAsk: (f) => `predictAsk[${f.run}]`,
    predictGo: 'predictGo',
    again: 'again',
    runLine: (f) => `runLine[${f.run}:${frac(f.end)}]`,
    foundLine: (r) => `line[${r.a}_${r.b}:${frac(r.final)}]`,
    next: 'next',
    done: 'done',
  },
};
const act = { type() {}, pick() {}, lay() {}, end() {}, predict() {}, again() {}, next() {} };
const html = (state, input) => renderToString(<MeasureView spec={SPEC} state={state} act={act} input={input} />);
const play = (actions, from = initMeasure(SPEC)) => actions.reduce((s, a) => measureReducer(SPEC, s, a), from);
const checkDone = (s) => {
  let at = s;
  while (at.stage === 'checkRun') at = measureReducer(SPEC, at, { type: 'tick' });
  return at;
};

describe('the investigation screen `measure`', () => {
  it('is mounted by Inquiry and opens on its question, two strips with a bar between them, the fraction and the box', () => {
    const out = renderToString(<Inquiry spec={SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="measure"');
    expect(out).toContain('data-iq-stage="pick"');
    expect(out).toContain('data-iq-mode="stages"');
    expect(out).toContain('lead(66,78,stages)');
    expect(out).toContain('data-iq-goal');
    expect(out).toContain('data-iq-strip="a" data-iq-count="66"');
    expect(out).toContain('data-iq-strip="b" data-iq-count="78"');
    expect(out).toContain('class="iq-meas-bar"');
    // the fraction written with a real bar (KaTeX), never « a/b »
    expect(out).toContain('data-iq-chain="66/78"');
    expect(out).toContain('class="mfrac"');
    expect(out).toContain('pickAsk[66_78:0:0]');
    expect(out).toContain('data-iq-chip="4"');
    expect(out).toContain('data-iq-in="plank"');
    expect(out).toContain('data-iq-lay');
    expect(out).toContain('data-iq-end');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('stages: a refused plank is laid with what it leaves; a plank that fills both re-counts both strips; the chain grows', () => {
    let s = play([{ type: 'try', d: 99 }]);
    expect(html(s)).toContain('bound[78]');
    s = play([{ type: 'try', d: 4 }, { type: 'shown' }], s);
    let out = html(s);
    expect(out).toContain('refused[4:2:2]');
    expect(out).toContain('66 = 4 \\times 16 + \\textcolor{#fbbf24}{2}');
    expect(out).toContain('data-iq-chip="4" data-iq-chip-state="no"');
    expect(out).toContain('class="iq-rest"');
    s = play([{ type: 'try', d: 3 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('counted[3:66_78~22_26:1]');
    expect(out).toContain('data-iq-frac="22:26"');
    expect(out).toContain('data-iq-strip="a" data-iq-count="22"');
    expect(out).toContain('data-iq-chain="66/78,22/26"');
    expect(out).toContain('66 = 3 \\times 22 + \\textcolor{#8dffb0}{0}');
    expect(out).toContain('data-iq-chip="4" data-iq-chip-state=""'); // 4 was refused on 66/78, not on 22/26
    s = play([{ type: 'try', d: 2 }, { type: 'shown' }], s);
    expect(html(s)).toContain('data-iq-chain="66/78,22/26,11/13"');
    // the claim: the world tries the planks of 11 on 13, the run ends, the prediction of the next road is asked
    s = play([{ type: 'end' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="checkRun"');
    expect(out).toContain('checkLabel[11]');
    expect(out).not.toContain('data-iq-lay');
    s = checkDone(s);
    out = html(s);
    expect(out).toContain('data-iq-stage="predict"');
    expect(out).toContain('data-iq-check="11:0"');
    expect(out).toContain('runEnd[0:11_13:-:true:null]');
    expect(out).toContain('predictAsk[1]');
    expect(out).toContain('data-iq-in="num"');
    expect(out).toContain('data-iq-in="den"');
    expect(out).toContain('class="iq-fracin__bar"');
    expect(out).toContain('data-iq-predict');
    expect(out).toContain('runLine[0:11_13]');
    // another road: the plank 3 opened the first one
    s = play(
      [
        { type: 'predict', p: 11, q: 13 },
        { type: 'try', d: 3 },
      ],
      s,
    );
    expect(html(s)).toContain('sameRoad[3:3]');
    s = checkDone(play([{ type: 'try', d: 6 }, { type: 'shown' }, { type: 'end' }], s));
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('runEnd[1:11_13:11_13:true:null]');
    expect(out).toContain('line[66_78:11_13]');
    expect(out).toContain('>next<');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('stages: a wrong claim is answered by the plank the world finds; the run goes on', () => {
    const s = checkDone(play([{ type: 'try', d: 2 }, { type: 'shown' }, { type: 'end' }]));
    const out = html(s);
    expect(out).toContain('data-iq-stage="pick"');
    expect(out).toContain('checkSeen[3:1]');
    expect(out).toContain('data-iq-strip="b" data-iq-count="39"');
    expect(out).toContain('39 = 3 \\times 13 + \\textcolor{#8dffb0}{0}'); // the plank found lies on the strips
  });

  it('direct: one stage that is not enough is shown, he starts again, the gcd ends it', () => {
    let s = play([{ type: 'next' }], { ...initMeasure(SPEC), stage: 'seen' });
    let out = html(s);
    expect(out).toContain('data-iq-mode="direct"');
    expect(out).not.toContain('data-iq-end');
    expect(out).not.toContain('data-iq-chip=');
    s = checkDone(play([{ type: 'try', d: 3 }, { type: 'shown' }], s));
    out = html(s);
    expect(out).toContain('data-iq-stage="again"');
    expect(out).toContain('notEnough[3:22_33:11]');
    expect(out).toContain('data-iq-chain="66/99,22/33"');
    expect(out).toContain('data-iq-check="2:0,11:1"');
    expect(out).toContain('data-iq-again');
    s = play([{ type: 'again' }], s);
    out = html(s);
    expect(out).toContain('data-iq-chain="66/99"');
    expect(out).toContain('runLine[0:22_33]');
    s = checkDone(play([{ type: 'try', d: 33 }, { type: 'shown' }], s));
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-chain="66/99,2/3"');
    expect(out).toContain('runEnd[1:2_3:-:false:null]');
    expect(out).toContain('>done<');
    expect(out).not.toMatch(/undefined|NaN/);
    // the kit writes no word of its own: every sentence is the lesson's
    expect(out).not.toMatch(/[\u0600-\u06FF]/);
  });

  it('a gap of 130 cells is drawn cell by cell, and a fraction above 1 keeps one scale', () => {
    const spec = { ...SPEC, rounds: [{ a: 130, b: 117, mode: 'stages' }] };
    const out = renderToString(<MeasureView spec={spec} state={initMeasure(spec)} act={act} />);
    expect((out.match(/class="iq-gapcell"/g) ?? []).length).toBe(130 + 117);
    expect(out).toContain('x2="960"'); // the bar spans the longer strip, to the frame's end
  });
});
