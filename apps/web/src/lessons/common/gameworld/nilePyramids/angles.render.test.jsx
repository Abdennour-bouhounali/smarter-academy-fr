/**
 * The screen of `angles` rendered without a DOM: its hooks stage by stage, the world's lines (three terms, never a
 * partial sum; a quotient never evaluated), no French written by the code itself (every sentence is `ANGLES_TEXT`'s or
 * the lesson's), and the drawing's geometry (the needle at the angle lies on the side; the slide lays a on b).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import {
  AnglesView,
  Angles,
  angleLabels,
  placeRound,
  readingAt,
  zeroOf,
  slideMatrix,
  BOX,
  PRO_ROOM,
} from './InquiryAngles';
import { initAngles, anglesReducer, triOf, slideOf } from './angles';
import { ANGLES_TEXT } from './anglesText';

globalThis.window = globalThis.window ?? {};
const noop = () => {};
const act = new Proxy({}, { get: () => noop });
const plain = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, '’');

const FACE = { names: 'ABC', angles: ['27', '41'] };
const SPEC = {
  kind: 'angles',
  rounds: [
    {
      a: { ...FACE, side: '6' },
      b: { names: 'DEF', angles: ['41', '27'], side: '8', turn: 140, flip: true },
      measure: true,
    },
    {
      a: { ...FACE, side: '6', opp: 0 },
      b: { names: 'GHI', angles: ['27', '55'], side: '8', opp: 0, turn: 200 },
      measure: true,
    },
    { a: { ...FACE }, b: { names: 'JKL', times: '1,25' }, measure: true, drawn: true },
    {
      a: { names: 'MNP', between: { sides: ['4', '6'], angle: '27' } },
      b: { names: 'RST', between: { sides: ['6', '9'], angle: '41' }, turn: 90, flip: true },
      measure: false,
    },
  ],
};
const run = (s, actions) => actions.reduce((acc, a) => anglesReducer(SPEC, acc, a), s);
const readAt = (t, v, deg) => [{ type: 'place', t, v }, { type: 'needle', deg }, { type: 'read' }];
const view = (s, spec = SPEC) => renderToString(<AnglesView spec={spec} state={s} act={act} />);
/** Round i's first screen (every round starts on the same empty state). */
const measured = (i, reads) =>
  run({ ...initAngles(SPEC), i, stage: SPEC.rounds[i].measure ? 'measure' : 'predict' }, reads);

describe('angles on screen', () => {
  it('measure: the vertices to place it on, then the protractor, its needle and a reading off the side', () => {
    let s = initAngles(SPEC);
    let out = view(s);
    expect(out).toContain('data-iq="angles"');
    expect(out).toContain('data-iq-stage="measure"');
    for (const n of 'ABCDEF') expect(out).toContain(`data-iq-vertex="${n}"`);
    expect(out).not.toContain('data-iq-needle');
    s = run(s, [
      { type: 'place', t: 'a', v: 0 },
      { type: 'needle', deg: 20 },
    ]);
    out = view(s);
    expect(out).toContain('data-iq-at="A"');
    for (const d of [-10, -1, 1, 10]) expect(out).toContain(`data-iq-turn="${d}"`);
    expect(out).toContain('data-iq-needle');
    expect(out).toContain('data-iq-reading="20"');
    expect(out).toContain('np-iq-ang__pro');
    s = anglesReducer(SPEC, s, { type: 'read' });
    out = view(s);
    expect(out).toContain('data-iq-off');
    expect(plain(out)).toContain(ANGLES_TEXT.off);
  });

  it('after two angles the world writes the third with its three terms; a vertex read leaves the choice', () => {
    const s = run(initAngles(SPEC), [...readAt('a', 0, 27), ...readAt('a', 1, 41)]);
    const out = view(s);
    expect(out).toContain('data-iq-line="a" data-iq-third="112"');
    expect(out).toContain('data-iq-line="b" data-iq-third=""');
    expect(out).not.toContain('data-iq-vertex="A"');
    expect(out).toContain('data-iq-vertex="D"');
    const ann = [...out.matchAll(/<annotation[^>]*>(.*?)<\/annotation>/g)].map((m) => m[1]).join(' | ');
    expect(ann).toContain('180^\\circ - 27^\\circ - 41^\\circ = 112^\\circ');
    expect(ann).not.toMatch(/\b68\b/);
  });

  it('predict, then the slide of R1: it covers, its quotient written « 8 ÷ 6 », never evaluated', () => {
    let s = run(initAngles(SPEC), [
      ...readAt('a', 0, 27),
      ...readAt('a', 1, 41),
      ...readAt('b', 0, 41),
      ...readAt('b', 1, 27),
    ]);
    let out = view(s);
    expect(out).toContain('data-iq-stage="predict"');
    for (const v of ['same', 'other']) expect(out).toContain(`data-iq-say="${v}"`);
    expect(out).toContain('data-iq-slide');
    s = run(s, [{ type: 'say', v: 'same' }, { type: 'slide' }]);
    out = view(s);
    expect(out).toContain('data-iq-verdict="covers"');
    expect(out).toContain('data-iq-fact="hit"');
    expect(out).toContain('data-iq-ghost="covers"');
    expect(out).toContain('data-iq-next');
    const ann = [...out.matchAll(/<annotation[^>]*>(.*?)<\/annotation>/g)].map((m) => m[1]).join(' | ');
    expect(ann).toContain('8 \\div 6');
    expect(plain(out)).not.toMatch(/\d+\/\d+|4\/3|1,33/);
    expect(plain(out)).toContain(ANGLES_TEXT.fact.covers);
  });

  it('R3: the world draws the block as three wedges on a line, its sum with three terms; it cannot close', () => {
    let s = measured(2, [...readAt('a', 0, 27), ...readAt('a', 1, 41)]);
    let out = view(s);
    expect(out).toContain('data-iq-wedges');
    expect(out).not.toContain('data-iq-tri="b"');
    const ann = [...out.matchAll(/<annotation[^>]*>(.*?)<\/annotation>/g)].map((m) => m[1]).join(' | ');
    expect(ann).toContain('33{,}75^\\circ + 51{,}25^\\circ + 140^\\circ = 225^\\circ');
    expect(plain(out)).toContain('33,75°');
    s = run(s, [{ type: 'say', v: 'same' }, { type: 'slide' }]);
    out = view(s);
    expect(out).toContain('data-iq-verdict="open"');
    // « 225° ≠ 180° » where the world says it cannot close (gate B, 2026-11-27)
    const sum = [...out.matchAll(/<annotation[^>]*>(.*?)<\/annotation>/g)].map((m) => m[1]);
    expect(out).toContain('data-iq-open-sum');
    expect(sum.join(' | ')).toContain('225^\\circ \\neq 180^\\circ');
    // the measures taken, the protractor's instruction is gone; the place stays
    expect(plain(out)).not.toContain('Mesure deux angles');
    expect(plain(out)).toContain(ANGLES_TEXT.leadDrawnDone);
    expect(out).toContain('data-iq-fact="miss"');
    expect(out).not.toContain('data-iq-ghost');
  });

  it('R4: no protractor; the angle between the sides and the four sides written, no third side; the slide fails', () => {
    let s = { ...initAngles(SPEC), i: 3, stage: 'predict' };
    let out = view(s);
    expect(out).not.toContain('data-iq-vertex');
    expect(out).not.toContain('np-iq-ang__pro');
    const lens = [...out.matchAll(/np-iq-ang__len[^>]*>([^<]*)</g)].map((m) => m[1]);
    expect(lens.map((x) => x.replace(/\s/g, ' '))).toEqual(['4 m', '6 m', '6 m', '9 m']);
    expect(plain(out)).toContain(ANGLES_TEXT.leadGiven);
    s = run(s, [{ type: 'say', v: 'other' }, { type: 'slide' }]);
    out = view(s);
    expect(out).toContain('data-iq-verdict="apart"');
    expect(out).toContain('data-iq-ghost="apart"');
  });

  it('ONE round per screen: nothing of an earlier round is written', () => {
    let s = run(initAngles(SPEC), [
      ...readAt('a', 0, 27),
      ...readAt('a', 1, 41),
      ...readAt('b', 0, 41),
      ...readAt('b', 1, 27),
      { type: 'say', v: 'same' },
      { type: 'slide' },
      { type: 'next' },
    ]);
    const out = view(s);
    expect(out).toContain('data-iq-round="1"');
    expect(plain(out)).not.toMatch(/\bDEF\b|8 ÷ 6|112/);
  });

  it('the code writes no French of its own: with every sentence replaced, only names, numbers and symbols stay', () => {
    const blank = (x) =>
      typeof x === 'function'
        ? () => '§'
        : typeof x === 'string'
          ? '§'
          : Object.fromEntries(Object.entries(x).map(([k, v]) => [k, blank(v)]));
    const text = Object.fromEntries(Object.entries(ANGLES_TEXT).map(([k, v]) => [k, blank(v)]));
    text.unit = '§';
    const spec = { ...SPEC, text };
    const states = [
      run(initAngles(spec), [{ type: 'place', t: 'a', v: 0 }, { type: 'read' }]),
      run(initAngles(spec), [
        ...readAt('a', 0, 27),
        ...readAt('a', 1, 41),
        ...readAt('b', 0, 41),
        ...readAt('b', 1, 27),
        { type: 'say', v: 'same' },
        { type: 'slide' },
      ]),
      { ...initAngles(spec), i: 2 },
      run({ ...initAngles(spec), i: 3, stage: 'predict' }, [{ type: 'say', v: 'same' }, { type: 'slide' }]),
    ];
    for (const s of states) {
      const words = plain(renderToString(<AnglesView spec={spec} state={s} act={act} />)).replace(/§/g, ' ');
      expect(words).not.toMatch(/\p{Ll}{3,}/u);
    }
  });

  it('the player mounts on its first round', () => {
    const out = renderToString(<Angles spec={SPEC} play={noop} onDone={noop} />);
    expect(out).toContain('data-iq-stage="measure"');
  });
});

describe('angles: the drawing agrees with the numbers', () => {
  it('in every round, the needle at a vertex’s angle points along its second side', () => {
    for (const r of SPEC.rounds) {
      const { tris, px } = placeRound(r);
      for (const t of ['a', 'b']) {
        if (!px[t] || !tris[t].angles) continue;
        for (const v of [0, 1, 2]) {
          const [u, w] = [0, 1, 2].filter((x) => x !== v);
          const reads = [readingAt(px[t], v, px[t][u]), readingAt(px[t], v, px[t][w])];
          // one side is the zero, the other reads the angle
          expect(Math.min(...reads)).toBeLessThan(1e-6);
          expect(Math.max(...reads)).toBeCloseTo(Number(tris[t].angles[v].replace(',', '.')), 6);
          expect(Number.isFinite(zeroOf(px[t], v))).toBe(true);
        }
      }
    }
  });

  it('every corner and its label stay inside the box; the two triangles stay in their halves', () => {
    for (const r of SPEC.rounds) {
      const { px } = placeRound(r);
      for (const [k, t] of [
        [0, 'a'],
        [1, 'b'],
      ]) {
        if (!px[t]) continue;
        for (const [x, y] of px[t]) {
          expect(x).toBeGreaterThanOrEqual((BOX.w / 2) * k + BOX.pad - 1e-6);
          expect(x).toBeLessThanOrEqual((BOX.w / 2) * (k + 1) - BOX.pad + 1e-6);
          expect(y).toBeGreaterThanOrEqual(BOX.pad - 1e-6);
          expect(y).toBeLessThanOrEqual(BOX.h - BOX.pad + 1e-6);
        }
      }
    }
  });

  it('the slide lays a exactly on b when the world says it covers, and not when it does not', () => {
    const apply = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
    for (const r of SPEC.rounds) {
      const v = slideOf(r);
      if (v.fact === 'open') continue;
      const { px } = placeRound(r);
      const m = slideMatrix(px.a, px.b, v.map);
      const lands = px.a.map((p) => apply(m, p));
      const gap = Math.max(...lands.map((q) => Math.min(...px.b.map((b) => Math.hypot(q[0] - b[0], q[1] - b[1])))));
      if (v.fact === 'covers') expect(gap).toBeLessThan(1e-6);
      else expect(gap).toBeGreaterThan(5);
    }
    expect(triOf(SPEC.rounds[0], 'b').angles[2]).toBe('112');
  });

  it('the figure is 40 rem wide or more for its 640-unit box: its 18-unit text is 18 px or more', () => {
    const css = readFileSync(new URL('./inquiry.css', import.meta.url), 'utf8');
    const block = css.slice(css.indexOf('/* kind angles */'));
    expect(block).toMatch(/\.np-iq-ang__fig \{[^}]*flex: 0 0 40rem/);
    expect(BOX.w).toBe(640);
    expect(block).toMatch(/np-iq-ang__deg,[^{]*\{[^}]*font-size: 18px/);
  });
  it('the angles written on a triangle never overlap one another (« 112° » on « 41° » of a long flat triangle) and stay in the figure', () => {
    const box = (t, [x, y]) => ({ x, y, w: [...t].length * 10.5 + 6, h: 22 });
    const apart = (a, b) => Math.abs(a.x - b.x) >= (a.w + b.w) / 2 || Math.abs(a.y - b.y) >= (a.h + b.h) / 2;
    const rounds = [...SPEC.rounds];
    for (let x = 15; x <= 140; x += 9)
      for (let y = 15; x + y <= 165; y += 11)
        for (const turn of [0, 70, 160, 250])
          rounds.push({
            a: { names: 'ABC', angles: [String(x), String(y)], side: '6' },
            b: { names: 'DEF', angles: [String(y), String(x)], side: '8', turn, flip: turn > 100 },
            measure: true,
          });
    let checked = 0;
    for (const r of rounds) {
      const { px } = placeRound(r);
      for (const t of ['a', 'b']) {
        const tri = triOf(r, t);
        if (!px[t] || !tri.angles || !tri.closes) continue;
        const angles = Object.fromEntries(tri.angles.map((v, i) => [i, v]));
        const at = angleLabels(px[t], angles);
        const boxes = tri.angles.map((v, i) => box(`${String(v).replace('.', ',')}°`, at[i]));
        for (const b of boxes) {
          expect(b.x - b.w / 2, tri.angles.join(' ')).toBeGreaterThanOrEqual(0);
          expect(b.x + b.w / 2, tri.angles.join(' ')).toBeLessThanOrEqual(BOX.w);
          expect(b.y - b.h / 2, tri.angles.join(' ')).toBeGreaterThanOrEqual(0);
          expect(b.y + b.h / 2, tri.angles.join(' ')).toBeLessThanOrEqual(BOX.h);
        }
        for (let i = 0; i < 3; i += 1)
          for (let j = i + 1; j < 3; j += 1)
            expect(apart(boxes[i], boxes[j]), `${tri.names.join('')} ${tri.angles.join(' ')} ${i}/${j}`).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(300);
  });
});

describe('angles — the gate B notes of 2026-11-27', () => {
  it('the viewBox holds the protractor on any vertex: its needle’s handle never leaves the figure’s card', () => {
    expect(PRO_ROOM).toBeGreaterThanOrEqual(94 + 11 - BOX.pad);
    const out = view(initAngles(SPEC));
    expect(out).toContain(`viewBox="${-PRO_ROOM} ${-PRO_ROOM} ${BOX.w + 2 * PRO_ROOM} ${BOX.h + 2 * PRO_ROOM}"`);
  });
  it('nothing read yet: no triangle name stands alone under the figure; measured: the instruction is gone', () => {
    let s = initAngles(SPEC);
    let out = view(s);
    for (const t of ['a', 'b']) expect(out).toMatch(new RegExp(`data-iq-line="${t}"[^>]*></p>`));
    expect(plain(out)).toContain('Pose le rapporteur');
    s = measured(0, [...readAt('a', 0, 27), ...readAt('a', 1, 41), ...readAt('b', 0, 41), ...readAt('b', 1, 27)]);
    out = view(s);
    expect(out).toContain('data-iq-stage="predict"');
    expect(plain(out)).not.toContain('amène son aiguille');
    expect(plain(out)).toContain(ANGLES_TEXT.leadDone);
  });
});
