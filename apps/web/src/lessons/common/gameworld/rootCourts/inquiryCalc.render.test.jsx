import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { CalcView } from './InquiryCalc';
import { readFileSync } from 'node:fs';
import { initCalc, calcReducer, CALC_LAYOUT, MAX_CELL, MAX_RODS } from './calc';
import { COURT_VIEW } from './courtParts';
import { tex } from './logic';
import { tiles } from './strings';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/**
 * A COMPLETE example of the spec of `calc`, in Arabic — every key the screen reads (GAME_WORLD.md « spec shape of
 * `calc` »). Facts only: no sentence names the rule, says « exact », « approximate », « root », or shows the sign.
 * A number inside a sentence goes through MathText as `$…$` (its comma written `{,}`).
 */
const m = (x) => `$${tex(x)}$`;
const CALC_SPEC = {
  kind: 'calc',
  a: '30',
  rods: [{ q: '5' }, { q: '5,5' }, { calc: '5,477225575' }],
  wall: true,
  text: {
    lead: ({ a }) => `الساحة التي مساحتها ${tiles(a)} لم يركبها أيّ مقياس بعد. بجانب جدارها مقاييس جاهزة.`,
    goal: ({ a }) => `جرّب المقاييس واحدًا واحدًا على الساحة التي مساحتها ${tiles(a)}.`,
    wallName: 'جدار الساحة',
    unknown: '؟',
    ask: ({ q, calc, wall }) =>
      wall
        ? 'المقياس مشدود على الجدار من الركن إلى الركن. هل تركب منصّته المصعد؟'
        : calc
          ? `هذا ما كتبته الحاسبة: ${m(q)}. هل تركب المنصّة المبنيّة عليه المصعد؟`
          : `المقياس ${m(q)}: هل تركب المنصّة المبنيّة عليه المصعد؟`,
    yes: 'تركب',
    no: 'لا تركب',
    zoomIn: 'كبّر',
    thin: ({ covers }) => `المنصّة تغطّي ${m(covers)} بلاطة. العين لا ترى فرقًا: كبّر ركن الساحة.`,
    fact: ({ kind, covers, diff, wall, k, zoom }) =>
      wall || kind === 'ride'
        ? 'المنصّة تلمس الجدران الأربعة: المصعد يحملها.'
        : `المنصّة تغطّي ${m(covers)} بلاطة: ${
            kind === 'band' ? `يبقى شريط مساحته ${m(diff)} بلاطة` : `تبرز عن الساحة بـ ${m(diff)} بلاطة فتعلق`
          }${k ? ` (رأيتَه عند التكبير $${zoom}$)` : ''}.`,
    colRod: 'المقياس',
    colCovers: 'ما تغطّيه المنصّة (بلاطة)',
    colDiff: 'ما يبقى أو ما يبرز (بلاطة)',
    band: 'يبقى',
    jam: 'يبرز',
    rides: 'تركب المصعد',
    wallAsk: () => 'لم يركب أيّ مقياس من هذه. الجدار نفسه من الركن إلى الركن: شُدّ المقياس عليه.',
    clamp: 'شُدّ المقياس على الجدار',
    wallNote: ({ a }) =>
      `؟ — مقياس طوله طول جدار الساحة التي مساحتها ${tiles(a)}، من الركن إلى الركن. لم يُكتب له عدد.`,
    next: 'المقياس التالي',
    done: 'انتهيت',
  },
};

const act = { say() {}, zoom() {}, next() {}, clamp() {} };
const html = (state, spec = CALC_SPEC) => renderToString(<CalcView spec={spec} state={state} act={act} />);
const play = (actions, from = initCalc(CALC_SPEC)) => actions.reduce((s, a) => calcReducer(CALC_SPEC, s, a), from);
const zoom = (s, n) =>
  play(
    Array.from({ length: n }, () => ({ type: 'zoom' })),
    s,
  );
/** What the student SEES: the text, without the tags (nor KaTeX's hidden TeX source). */
const seen = (out) =>
  out
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
/** Never on the screen of this experiment: the rule's words, and its sign. */
const TOLD = /جذر|بالضبط|مضبوط|تقريب|مقرّب|مقرب|√/;

describe('the investigation screen `calc`', () => {
  it('is mounted by Inquiry and opens on the court, the rods ready by its wall, the calculator and the question', () => {
    const out = renderToString(<Inquiry spec={CALC_SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="calc"');
    expect(out).toContain('data-iq-stage="say"');
    expect(out).toContain('data-court="30"');
    expect(out).toContain('data-court-stage="ask"');
    expect(out).toContain('data-court-rod="5"');
    expect(out).toContain('data-iq-rackrod="0" data-iq-rackrod-state="now"');
    expect(out).toContain('data-iq-rackrod="2" data-iq-rackrod-state="ready"');
    expect(out).toContain('data-iq-calculator="5,477225575"');
    expect(out).toContain('data-iq-say="yes"');
    expect(out).toContain('data-iq-say="no"');
    expect(out).toContain('data-iq-table="0"');
    expect(out).not.toMatch(/undefined|NaN/);
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('a band is lowered, written exactly, and its row stays', () => {
    let s = play([{ type: 'say', v: false }]);
    expect(html(s)).toContain('data-court-stage="build"');
    s = play([{ type: 'built' }], s);
    const out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-court-stage="done"');
    expect(out).toContain('data-court-kind="band"');
    expect(out).toContain('data-court-zoom="1"'); // he drives the lens: none until he presses
    expect(out).toContain('data-iq-row="0" data-iq-row-kind="band"');
    expect(out).toContain('data-iq-cell="band"');
    expect(out).toContain('data-iq-next');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('a thin overhang waits for « كبّر »; each press is a power of ten on the court, kept on the row', () => {
    let s = play([
      { type: 'say', v: false },
      { type: 'built' },
      { type: 'next' },
      { type: 'say', v: true },
      { type: 'built' },
    ]);
    let out = html(s);
    expect(out).toContain('data-iq-stage="zoom"');
    expect(out).toContain('data-iq-zoomin');
    expect(out).not.toContain('data-iq-next');
    expect(out).toContain('data-court-kind="jam"');
    s = zoom(s, 1);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-court-zoom="10"');
    expect(out).toContain('data-iq-zoomtag="1"');
    expect(out).toContain('data-iq-row="1" data-iq-row-kind="jam"');
  });

  it('the calculator rod: lit at its turn, its sliver seen after ten presses, its row a band of twenty digits', () => {
    let s = play([
      { type: 'say', v: false },
      { type: 'built' },
      { type: 'next' },
      { type: 'say', v: true },
      { type: 'built' },
    ]);
    s = play([{ type: 'zoom' }, { type: 'next' }], s);
    let out = html(s);
    expect(out).toContain('class="rq-calc is-now"');
    expect(out).toContain('data-court-rod="5,477225575"');
    s = zoom(play([{ type: 'say', v: true }, { type: 'built' }], s), 5);
    out = html(s);
    expect(out).toContain('data-iq-stage="zoom"');
    expect(out).toContain('data-court-zoom="100000"');
    s = zoom(s, 5);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-court-zoom="10000000000"');
    expect(out).toContain('data-iq-zoomtag="10"');
    expect(out).toContain('data-court-lens="10000000000"');
    expect(out).toContain('data-court-diff="0,000000000565919375"');
    expect(out).toContain('29,999999999434080625');
    expect(out).toContain('0,000000000565919375');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('the wall: clamped corner to corner, the rod stretches, it rides, and its cell has no number', () => {
    let s = play([
      { type: 'say', v: false },
      { type: 'built' },
      { type: 'next' },
      { type: 'say', v: true },
      { type: 'built' },
    ]);
    s = play([{ type: 'zoom' }, { type: 'next' }, { type: 'say', v: true }, { type: 'built' }], s);
    s = play([...Array.from({ length: 10 }, () => ({ type: 'zoom' })), { type: 'next' }], s);
    let out = html(s);
    expect(out).toContain('data-iq-stage="wall"');
    expect(out).toContain('data-iq-clamp');
    expect(out).not.toContain('data-court-rod=');
    s = play([{ type: 'clamp' }], s);
    out = html(s);
    expect(out).toContain('data-iq-clamp-rod');
    expect(out).toContain('is-stretching');
    s = play([{ type: 'clamped' }, { type: 'say', v: true }, { type: 'built' }], s);
    out = html(s);
    expect(out).toContain('data-court-kind="ride"');
    expect(out).toContain('data-iq-row="3" data-iq-row-kind="ride"');
    expect(out).toContain('data-iq-wallcell');
    expect(out).toContain('data-iq-wallnote');
    expect(out).toContain('انتهيت');
    // the court's own labels would write the wall's rod with its sign: they are off for that rod
    expect(out).not.toContain('data-court-radical');
    expect(seen(out)).not.toMatch(TOLD);
    expect(out).not.toMatch(/undefined|NaN/);
  });
});

/**
 * Screenshot review of 2026-11-21 at 1366 × 768: the wall's name was drawn ON the wall's bar (an Arabic text anchored at
 * its start runs LEFT, over the wall and its post); a third of the panel was empty while the court was ≈ 150 px wide; the
 * calculator's row ran past its column. The rack is checked on its drawing; the layout on its budget (calc.js ›
 * CALC_LAYOUT) — what a browser would measure, computed (the walk and the eyes check it again).
 */
describe('the calc screen at 1366 × 768: the rack readable, the court large, nothing past its place', () => {
  const attr = (tag, name) => Number(tag.match(new RegExp(` ${name}="([^"]+)"`))?.[1]);
  const through = (n) => {
    let st = initCalc(CALC_SPEC);
    for (let k = 0; k < n && !st.done; k += 1) {
      const type = { say: 'say', build: 'built', zoom: 'zoom', seen: 'next', wall: 'clamp', clamping: 'clamped' }[
        st.stage
      ];
      st = calcReducer(CALC_SPEC, st, type === 'say' ? { type, v: true } : { type });
    }
    return st;
  };
  const STATES = Array.from({ length: 40 }, (_, n) => through(n));

  it('the wall’s name is written ONCE, beside the far post — never on the bar — and the « ؟ » of the clamp stays clear of it', () => {
    for (const st of STATES) {
      const out = html(st);
      const rack = out.slice(
        out.indexOf('<svg class="rq-rack"'),
        out.indexOf('</svg>', out.indexOf('<svg class="rq-rack"')),
      );
      expect(seen(rack).split('جدار الساحة').length - 1).toBe(1);
      const label = rack.match(/<text[^>]*data-iq-wallname[^>]*>/)[0];
      const wall = rack.match(/<line class="rq-rack__wall"[^>]*>/)[0];
      const far = rack.match(/<rect class="rq-rack__post rq-rack__post--far"[^>]*>/)[0];
      // laid from its x to the right, its x right of the bar's end and of the far post
      expect(label).toContain('direction="ltr"');
      expect(label).toContain('text-anchor="start"');
      expect(attr(label, 'x')).toBeGreaterThan(attr(wall, 'x2'));
      expect(attr(label, 'x')).toBeGreaterThan(attr(far, 'x') + attr(far, 'width'));
      // every rod, its end and its mark, stays left of the labels' column
      for (const rod of rack.match(/<g class="rq-rack__rod[^"]*"[^>]*><rect [^>]*>/g)) {
        const r = rod.match(/<rect [^>]*>/)[0];
        expect(attr(r, 'x') + attr(r, 'width') + 7).toBeLessThan(attr(label, 'x'));
      }
      // the clamp's « ؟ »: centred over the bar, its glyph (26 units) far from the label's start
      const q = rack.match(/<text class="rq-rack__unknown"[^>]*>/)?.[0];
      if (q) expect(attr(q, 'x') + 26).toBeLessThan(attr(label, 'x'));
    }
  });

  const L = CALC_LAYOUT;
  const REM = 16;
  const px = (rem) => rem * REM;
  const onScreen = (designPx) => designPx * L.zoom;
  const courtH = px(L.court);
  const courtW = (courtH * COURT_VIEW.w) / COURT_VIEW.h;
  const rackW = L.rack.w * L.rack.scale;
  const calcW = px(L.calculator);
  const T = L.table;
  /** Cairo's digits ≈ 0.54 em (measured: « 29,99999999434080625 » took 204 px at 18.8 px on the walk's screenshot). */
  const DIGIT = 0.55;

  it('row 2 — the court, the rack, the calculator — fits the panel’s width, the court as wide as the room leaves', () => {
    const row = courtW + px(L.gap) + rackW + px(L.gap) + calcW;
    expect(row).toBeLessThanOrEqual(L.panel.w);
    // the court is the subject: its square (168 of 240 units) at least 1.25 × what it was (12 rem: 134 px of the frame)
    expect((168 * courtH) / COURT_VIEW.h).toBeGreaterThanOrEqual(1.25 * ((168 * px(12)) / COURT_VIEW.h));
  });

  it('row 3 — the question and the table — fits; the longest number (MAX_CELL) fits its cell on one line', () => {
    expect(px(L.talk) + px(L.gap) + px(T.rod + T.covers + T.diff)).toBeLessThanOrEqual(L.panel.w);
    const f = px(T.font);
    const pad = px(0.5) * 2;
    const digits = (n) => n * DIGIT * f;
    expect(digits(11) + 0.9 * f + 0.35 * f + pad).toBeLessThanOrEqual(px(T.rod)); // a calculator's rod, its icon
    expect(digits(MAX_CELL) + pad).toBeLessThanOrEqual(px(T.covers));
    // « يبقى », the number, the zoom's tag (🔍 and « ×10¹⁰ »), the chip's padding and border, the cell's padding
    const chip = 2.2 * f + digits(MAX_CELL) + 4.4 * f + 2 * 0.35 * f + pad + 3;
    expect(chip + pad).toBeLessThanOrEqual(px(T.diff));
  });

  it('the rows fit the panel’s height with every rod in the table and the wall’s note; nothing scrolls', () => {
    const table = px(T.header + (MAX_RODS + 1) * T.row + T.note);
    // the question on three lines, the buttons (3.3 rem), the fact's room (3.2 em), their gaps
    const talk = 3 * 1.12 * 1.5 * REM + px(3.3) + 3.2 * 1.12 * REM + 2 * px(0.5);
    const rows = px(L.head) + 2 * px(L.rowGap) + courtH + Math.max(table, talk);
    expect(rows).toBeLessThanOrEqual(L.panel.h);
  });

  it('what he reads is ≥ 18 px on screen: the court’s text, the rack, the table, the calculator’s display', () => {
    expect(onScreen((COURT_VIEW.font * courtH) / COURT_VIEW.h)).toBeGreaterThanOrEqual(18);
    expect(onScreen(L.rack.font * L.rack.scale)).toBeGreaterThanOrEqual(18);
    expect(onScreen(px(T.font))).toBeGreaterThanOrEqual(18);
    expect(onScreen((26 * calcW) / 200)).toBeGreaterThanOrEqual(18);
  });

  it('the screen sets the sizes the CSS reads, and the CSS reads them', () => {
    const out = html(initCalc(CALC_SPEC));
    expect(out).toContain(`--rq-court-h:${L.court}rem`);
    expect(out).toContain(`--rq-talk-w:${L.talk}rem`);
    expect(out).toContain(`width:${rackW / REM}rem`);
    const css = readFileSync(new URL('./inquiry.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.rq-calc__court \.crt-court \{\s*height: var\(--rq-court-h/);
    expect(css).toMatch(/grid-template-columns: var\(--rq-talk-w/);
    expect(css).toMatch(/\.rq-iq-frame \.rq-table \{[^}]*font-size: 1\.08rem/);
    expect(css).toMatch(/\.rq-calc \{[^}]*width: 9rem/);
  });
});
