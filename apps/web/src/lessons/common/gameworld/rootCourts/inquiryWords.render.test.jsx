import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { CalcView } from './InquiryCalc';
import { RoundtripView } from './InquiryRoundtrip';
import { initCalc, calcReducer } from './calc';
import { initRoundtrip, roundtripReducer } from './roundtrip';

/**
 * THE KIT WRITES NO WORD of its own in the two experiments: every sentence, label and button is the lesson's
 * (`spec.text`). Here every key is a Latin tag, the court (`courtParts.jsx`, which has its own world labels) is a stub
 * with its hooks, and every stage of both kinds is rendered: not one Arabic letter may appear, nor the sign of the rule,
 * nor the words « exact » / « approximate ».
 */
vi.mock('./courtParts', async () => {
  const { createElement } = await import('react');
  return {
    Court: ({ area, rod, stage, zoom }) =>
      createElement('svg', {
        'data-court': area,
        'data-court-rod': rod ? (rod.root != null ? `wall:${rod.root}` : rod.q) : undefined,
        'data-court-stage': stage,
        'data-court-zoom': zoom,
      }),
  };
});
globalThis.window = globalThis.window ?? {};

const tag =
  (name) =>
  (f = {}) =>
    `${name}[${Object.keys(f).sort().join(',')}]`;
const CALC = {
  kind: 'calc',
  a: '30',
  rods: [{ q: '5' }, { q: '5,5' }, { calc: '5,477225575' }],
  wall: true,
  text: {
    lead: tag('lead'),
    goal: tag('goal'),
    wallName: 'wallName',
    unknown: 'unknown',
    ask: tag('ask'),
    yes: 'yes',
    no: 'no',
    zoomIn: 'zoomIn',
    thin: tag('thin'),
    fact: tag('fact'),
    colRod: 'colRod',
    colCovers: 'colCovers',
    colDiff: 'colDiff',
    band: 'band',
    jam: 'jam',
    rides: 'rides',
    wallAsk: tag('wallAsk'),
    clamp: 'clamp',
    wallNote: tag('wallNote'),
    next: 'next',
    done: 'done',
  },
};
const RT = {
  kind: 'roundtrip',
  rounds: [
    { from: { rod: { root: '23' } }, path: ['build'] },
    { from: { walk: '-9' }, path: ['build', 'take'] },
    { from: { rod: { q: '2/3' } }, path: ['build', 'take', 'build'] },
  ],
  text: {
    lead: tag('lead'),
    goal: tag('goal'),
    buildName: 'buildName',
    takeName: 'takeName',
    askBuild: tag('askBuild'),
    askTake: tag('askTake'),
    tiles: 'tiles',
    formNumber: 'formNumber',
    formWall: 'formWall',
    wallBox: 'wallBox',
    wallLabel: tag('wallLabel'),
    plaque: tag('plaque'),
    run: 'run',
    unread: 'unread',
    unknown: 'unknown',
    ran: tag('ran'),
    go: 'go',
    next: 'next',
    done: 'done',
  },
};

/** Every state the experiment passes through, played to its end. */
function statesOf(init, reducer, moves) {
  const out = [init];
  let s = init;
  for (const a of moves) {
    const t = reducer(s, a);
    if (t !== s) out.push(t);
    s = t;
  }
  return out;
}
const calcMoves = [
  ...[{ type: 'say', v: false }, { type: 'built' }, { type: 'next' }],
  ...[{ type: 'say', v: true }, { type: 'built' }, { type: 'zoom' }, { type: 'next' }],
  ...[
    { type: 'say', v: true },
    { type: 'built' },
    ...Array.from({ length: 10 }, () => ({ type: 'zoom' })),
    { type: 'next' },
  ],
  ...[{ type: 'clamp' }, { type: 'clamped' }, { type: 'say', v: true }, { type: 'built' }],
];
const st = (said) => [{ type: 'say', said }, { type: 'ran' }, { type: 'next' }];
const rtMoves = [
  { type: 'say', said: null },
  ...st({ area: '23' }),
  ...st({ area: '-81' }),
  ...st({ q: '-9' }),
  ...st({ area: '4/9' }),
  ...st({ root: '4/9' }),
  { type: 'say', said: { area: '4/9' } },
  { type: 'ran' },
];

const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const TOLD = /√|\\sqrt|exact|approx/i;
const visible = (out) => out.replace(/<annotation[^>]*>.*?<\/annotation>/g, '');

describe('the kit writes no word of its own', () => {
  const calcStates = statesOf(initCalc(CALC), (s, a) => calcReducer(CALC, s, a), calcMoves);
  const rtStates = statesOf(initRoundtrip(RT), (s, a) => roundtripReducer(RT, s, a), rtMoves);

  it('calc: every stage, every row', () => {
    expect(new Set(calcStates.map((s) => s.stage))).toEqual(
      new Set(['say', 'build', 'zoom', 'seen', 'wall', 'clamping']),
    );
    for (const s of calcStates) {
      const out = renderToString(<CalcView spec={CALC} state={s} act={{}} />);
      expect(out).not.toMatch(ARABIC);
      expect(visible(out)).not.toMatch(TOLD);
      expect(out).not.toMatch(/undefined|NaN|\[object/);
    }
  });

  it('roundtrip: every stage, both answer shapes, both forms of a rod, a fraction', () => {
    expect(new Set(rtStates.map((s) => s.stage))).toEqual(new Set(['ask', 'run', 'seen']));
    for (const s of rtStates)
      for (const input of [
        { text: '', form: 'number' },
        { text: '4/9', form: 'wall' },
      ]) {
        const out = renderToString(<RoundtripView spec={RT} state={s} act={{}} input={input} />);
        expect(out).not.toMatch(ARABIC);
        expect(visible(out)).not.toMatch(TOLD);
        expect(out).not.toMatch(/undefined|NaN|\[object/);
      }
  });

  it('nor in its source: outside comments, no Arabic letter is written by the kinds themselves', () => {
    for (const f of ['Inquiry.jsx', 'InquiryCalc.jsx', 'InquiryRoundtrip.jsx', 'calc.js', 'roundtrip.js']) {
      const code = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
      expect(code, f).not.toMatch(ARABIC);
      expect(code, f).not.toMatch(/√/);
    }
  });
});
