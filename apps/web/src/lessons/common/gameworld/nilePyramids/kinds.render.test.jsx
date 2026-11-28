/**
 * The experiment screens and the forge parts rendered without a DOM: their hooks, their words (read from `./strings`),
 * and no fraction written « p/q » as text (defects D41, D47). That no rule is NAMED is a test of the Arabic wording
 * itself: `strings.ar.test.js`.
 */
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { PlanView } from './InquiryPlan';
import { HalfturnView } from './InquiryHalfturn';
import { ScaleView } from './InquiryScale';
import { Mirror, Line, UseFigure, beats, FORGE_PARTS } from './forgeParts';
import { RIVER, riverFigure } from './logic';
import { initPlan, planReducer } from './plan';
import { initHalfturn, halfturnReducer } from './halfturn';
import { initScale, scaleReducer } from './scale';
import { thalesCase } from './ruleForge';
import { PLAN_SPEC, HALFTURN_SPEC, SCALE_SPEC, BUTTERFLY_PLAN_SPEC, ACROSS_PLAN_SPEC } from './test/specs';
import { DIR, KIND_TEXT, WORLD_TEXT } from './strings';

globalThis.window = globalThis.window ?? {};
const noop = () => {};
const act = new Proxy({}, { get: () => noop });
const plain = (html) => html.replace(/<annotation[^>]*>.*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');
/** The words of a sentence before its first formula (MathText renders the formula apart). */
const lead = (sentence) => sentence.split('$')[0].trim();

describe('the experiments on screen', () => {
  it('the dispatcher mounts each kind, and refuses an unknown one', () => {
    for (const spec of [PLAN_SPEC, HALFTURN_SPEC, SCALE_SPEC]) {
      const out = renderToString(<Inquiry spec={spec} game={null} onDone={noop} />);
      expect(out).toContain(`data-iq="${spec.kind}"`);
      expect(out).toContain(`dir="${DIR}"`); // the frame's direction is the country's
    }
    expect(() => renderToString(<Inquiry spec={{ kind: 'nope' }} onDone={noop} />)).toThrow();
  });

  it('plan: its three cards, a refused card, a join and a course laid', () => {
    let s = initPlan(PLAN_SPEC);
    s = planReducer(PLAN_SPEC, s, { type: 'pick', card: 'VC' });
    let out = renderToString(<PlanView spec={PLAN_SPEC} state={s} act={act} />);
    for (const c of ['VB', 'VC', 'BC']) expect(out).toContain(`data-iq-card="${c}"`);
    expect(out).toContain('data-iq-refused="VC"');
    expect(out).toContain('data-iq-join="VB-MB"');
    s = [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '11' },
      { type: 'lay' },
    ].reduce((acc, a) => planReducer(PLAN_SPEC, acc, a), s);
    out = renderToString(<PlanView spec={PLAN_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-laid="gap"');
    expect(out).toContain('data-iq-fact="gap"');
    expect(out).toContain('data-iq-laid-on="course"');
    expect(plain(out)).toContain(lead(KIND_TEXT.plan.fact.gap('77')));
    expect(out).toContain('data-geo-figure');
  });

  it('plan on a BUTTERFLY: the length across the vertex written on its line, the cut across, a rope from the vertex', () => {
    // round 3 of France's K2: O A B E F, AE = 31,5 given across the vertex
    const B = BUTTERFLY_PLAN_SPEC;
    let s = [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '416' },
      { type: 'lay' },
      { type: 'next' },
      { type: 'tool', id: 'VM+MB' },
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '5,5' },
      { type: 'lay' },
      { type: 'next' },
    ].reduce((acc, a) => planReducer(B, acc, a), initPlan(B));
    let out = renderToString(<PlanView spec={B} state={s} act={act} />);
    expect(s.i).toBe(2);
    expect(plain(out)).toContain('AE = 31,5');
    expect(out).toContain('data-iq-join="VMB-VM"');
    expect(out).not.toContain('data-iq-join="VB-MB"');
    s = [
      { type: 'tool', id: 'VMB-VM' },
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '17,5' },
      { type: 'lay' },
    ].reduce((acc, a) => planReducer(B, acc, a), s);
    out = renderToString(<PlanView spec={B} state={s} act={act} />);
    expect(out).toContain('data-iq-laid="overhang"');
    expect(out).toContain('data-iq-laid-on="course"'); // EF faces the vertex: a course
    expect(plain(out)).toContain(lead(KIND_TEXT.plan.fact.overhang('5')));
    // the unknown ACROSS the vertex (BF): laid as a rope from the vertex, with its own words
    const A = ACROSS_PLAN_SPEC;
    s = [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'VC' },
      { type: 'type', text: '27,5' },
      { type: 'lay' },
    ].reduce((acc, a) => planReducer(A, acc, a), initPlan(A));
    out = renderToString(<PlanView spec={A} state={s} act={act} />);
    expect(out).toContain('data-iq-laid-on="line"');
    expect(plain(out)).toContain(lead(KIND_TEXT.plan.line.gap('11')));
    expect(plain(out)).not.toContain(lead(KIND_TEXT.plan.fact.gap('11')));
    expect(plain(out)).toContain('BF = ?');
  });

  it('halfturn: the two lines to predict, the turn, then the landing with its gauge', () => {
    let s = initHalfturn(HALFTURN_SPEC);
    let out = renderToString(<HalfturnView spec={HALFTURN_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-predict="B"');
    expect(out).toContain('data-iq-predict="C"');
    s = halfturnReducer(HALFTURN_SPEC, s, { type: 'predict', line: 'B' });
    out = renderToString(<HalfturnView spec={HALFTURN_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-turn="1"');
    for (let k = 0; k < 6; k += 1) s = halfturnReducer(HALFTURN_SPEC, s, { type: 'turn', d: 1 });
    out = renderToString(<HalfturnView spec={HALFTURN_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-landed="B"');
    expect(out).toContain('data-rf-aligned="yes"');
  });

  it('halfturn: the chain in the butterfly’s own letters is never written by default, only with `chainOwn: true`', () => {
    const landed = (spec) => {
      let s = halfturnReducer(spec, initHalfturn(spec), { type: 'predict', line: 'B' });
      for (let k = 0; k < 6; k += 1) s = halfturnReducer(spec, s, { type: 'turn', d: 1 });
      return renderToString(<HalfturnView spec={spec} state={s} act={act} />);
    };
    const own = landed({ ...HALFTURN_SPEC, chainOwn: true });
    expect(own).toContain('data-iq-chain-own');
    expect(plain(own)).toContain(KIND_TEXT.halfturn.chainOwn);
    for (const tex of ['\\dfrac{IK}{IP}', '\\dfrac{IL}{IQ}', '\\dfrac{KL}{PQ}']) expect(own).toContain(tex);
    const none = landed(HALFTURN_SPEC);
    expect(none).toContain('data-iq-landed="B"');
    expect(none).not.toContain('data-iq-chain-own');
    expect(plain(none)).not.toContain(KIND_TEXT.halfturn.chainOwn);
    for (const tex of ['\\dfrac{IK}{IP}', '\\dfrac{IL}{IQ}', '\\dfrac{KL}{PQ}']) expect(none).not.toContain(tex);
  });

  it('scale: the fact round, the prediction, the dial set by hand, the perimeters', () => {
    let s = initScale(SCALE_SPEC);
    let out = renderToString(<ScaleView spec={SCALE_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-stage="fact"');
    s = scaleReducer(SCALE_SPEC, s, { type: 'next' });
    out = renderToString(<ScaleView spec={SCALE_SPEC} state={s} act={act} />);
    for (const v of ['larger', 'exact', 'smaller']) expect(out).toContain(`data-iq-predict="${v}"`);
    s = scaleReducer(SCALE_SPEC, scaleReducer(SCALE_SPEC, s, { type: 'say', v: 'exact' }), { type: 'feed' });
    out = renderToString(<ScaleView spec={SCALE_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-image="exact"');
    s = { ...initScale(SCALE_SPEC), i: 3, stage: 'set', k: null };
    out = renderToString(<ScaleView spec={SCALE_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-kn');
    s = { ...initScale(SCALE_SPEC), i: 4, stage: 'perimeter', k: '6/5' };
    out = renderToString(<ScaleView spec={SCALE_SPEC} state={s} act={act} />);
    expect(out).toContain('data-iq-choose="times3"');
    expect(plain(out)).not.toMatch(/\d+\/\d+/);
  });
});

describe('the forge parts draw through GeoFigure', () => {
  const c = thalesCase({
    names: { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' },
    len: { VM: '14', VB: '63', VN: '16', VC: '72', MN: '18', BC: '81' },
  });
  it('the mirror shows the figure, then the gauge with its marks together', () => {
    expect(renderToString(<Mirror c={c} stage="ask" />)).not.toContain('data-rf-gauge');
    const out = renderToString(<Mirror c={c} stage="done" />);
    expect(out).toContain('data-geo-figure');
    expect(out).toContain('data-rf-aligned="yes"');
    expect(out).toContain('data-rf-kind="aligned"');
  });
  it('a line of evidence and the parts object', () => {
    const out = renderToString(<Line c={{ ...c, head: WORLD_TEXT.docks[0], tag: '⭐' }} />);
    expect(out).toContain('data-np-line="aligned"');
    expect(beats()).toBe(3);
    expect(Object.keys(FORGE_PARTS)).toEqual(['skin', 'Mirror', 'Line', 'beats', 'Inquiry', 'UseFigure']);
  });
  it('the gauge shows the values a case was TESTED with: a wrong chain apart, a copy short of its target apart', () => {
    // the new canal through the chain « piece »: 2/7, 2/7, 2/9 — the whole ratios are equal, the tested ones are not
    const piece = { ...c, held: false, tested: { values: ['2/7', '2/7', '2/9'] } };
    let out = renderToString(<Mirror c={piece} stage="done" />);
    expect(out).toContain('data-rf-aligned="no"');
    expect(out).toContain('data-rf-kind="apart"');
    expect(renderToString(<Line c={piece} />)).toContain('data-np-line="apart"');
    // a copy at 6/5 of a pair at k = 5/6: three equal values that are not the target 1
    const copy = { ...c, held: false, tested: { values: ['36/25', '36/25', '36/25'], to: '1' } };
    out = renderToString(<Mirror c={copy} stage="done" />);
    expect(out).toContain('data-rf-aligned="no"');
    expect(out).toContain('data-rf-gauge-target');
    const exact = { ...copy, held: true, tested: { values: ['1', '1', '1'], to: '1' } };
    expect(renderToString(<Mirror c={exact} stage="done" />)).toContain('data-rf-aligned="yes"');
  });
  it('a whole side given is written on the mirror’s drawing; the river is drawn whole, its measured lengths only', () => {
    const given = { ...c, show: ['VB', 'MB', 'BC'] };
    const out = plain(renderToString(<Mirror c={given} stage="ask" />));
    expect(out).toContain('AB = 63');
    expect(out).not.toContain('AC = 72');
    expect(plain(renderToString(<Mirror c={c} stage="ask" />))).not.toContain('AB = 63');
    const river = thalesCase(riverFigure(RIVER));
    const r = plain(renderToString(<Mirror c={river} stage="done" />));
    for (const x of ['72', '9', '52', '416']) expect(r).toContain(x);
    expect(r).not.toContain('√');
    expect(renderToString(<Line c={river} />)).toContain('data-np-line="aligned"');
  });
  it('the last step’s figure: drawn at its 12 px floor when it fits, nothing for a case without one', () => {
    const out = renderToString(<UseFigure c={{ ...c, show: ['VM', 'VB', 'MN'], ask: ['MN'] }} />);
    expect(out).toContain('data-geo-figure');
    expect(out).toContain('data-np-use-figure="fits"');
    expect(renderToString(<UseFigure c={{ names: c.names }} />)).toBe('');
  });
});
