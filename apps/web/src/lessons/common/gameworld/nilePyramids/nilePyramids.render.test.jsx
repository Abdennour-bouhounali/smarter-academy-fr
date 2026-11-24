/**
 * The world's screens rendered without a DOM — and the shell file imported, so that a wrong import path in it fails
 * here and not only in the browser (defects D35).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import NilePyramids, { Fact, Register, OrderCard, RopeChip, StoryCard, TopButton } from './NilePyramids';
import { NilePyramidsGame } from './Game';
import { slot } from '../kit/forge';
import { WORLDS } from '../worlds';
import { FIGURE_TEXT, WORLD_TEXT } from './strings';

const game = {
  T: WORLD_TEXT,
  drop() {},
  sendOrder() {},
  closeOrder() {},
  closeCard() {},
  story: {
    mission: {
      title: 'm',
      lead: ['$h$'],
      figure: { points: { A: [0, 0], B: [4, 0], C: [4, 3] }, segments: [['A', 'B']], ariaLabel: FIGURE_TEXT.pair('A') },
      lines: () => [{ dir: 'ltr', tokens: ['h =', slot('h', 'h', 5, { decimal: true })] }],
      check: () => 'ok',
    },
  },
};
const plain = (html) => html.replace(/<[^>]+>/g, ' ');

describe('the pyramids world on screen', () => {
  it('is registered last among the worlds and its shell is a component', async () => {
    expect(Object.keys(WORLDS).at(-1)).toBe('nile-pyramids');
    expect(typeof NilePyramids).toBe('function');
    expect((await WORLDS['nile-pyramids']()).default).toBe(NilePyramids);
  });

  it('a fact says what the world did and never a size (gate P1)', () => {
    const gap = renderToString(<Fact verdict={{ kind: 'course', fact: 'gap', typed: '11', seg: 'MN' }} game={game} />);
    expect(gap).toContain('data-np-fact="gap"');
    expect(plain(gap)).toContain(WORLD_TEXT.fact.gap);
    expect(plain(gap)).not.toMatch(/\b77\b/);
    const canal = renderToString(
      <Fact verdict={{ kind: 'canal', fact: 'longer', typed: '31,5', reading: '41', seg: 'PQ' }} game={game} />,
    );
    expect(canal).toContain('data-np-fact="longer"');
    expect(plain(canal)).toContain(WORLD_TEXT.fact.longer);
  });

  it("every step of the story has its own id — `done` is ONE map (the plateau's « AM » once read the field's 14)", () => {
    const stages = NilePyramidsGame.prototype.stageData.call({
      story: { forges: { field: 'k1' }, mission: {}, box: {} },
      lesson: { forges: { k1: {} } },
    });
    const ids = stages.flatMap((st) => st.steps.map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('the top view has ONE toggle: the top view, then back to Zero (aria-pressed)', () => {
    const off = renderToString(<TopButton on={false} game={game} />);
    expect(off).toContain('data-np-top="off"');
    expect(off).toContain('aria-pressed="false"');
    expect(plain(off)).toContain(WORLD_TEXT.hud.top);
    expect(off).not.toContain('data-np-top-back');
    const on = renderToString(<TopButton on game={game} />);
    expect(on).toContain('data-np-top="on"');
    expect(on).toContain('aria-pressed="true"');
    expect(on).toContain('data-np-top-back');
    expect(plain(on)).toContain(WORLD_TEXT.hud.topBack);
  });

  it('the register lists its rows, each with its hook', () => {
    const reg = {
      title: WORLD_TEXT.hud.register,
      rows: [
        { id: 'AB', tex: 'AB = 63', kind: 'record' },
        { id: 'AM', tex: 'AM = 14', kind: 'measured' },
      ],
    };
    const out = renderToString(<Register reg={reg} />);
    expect(out).toContain('data-np-register="2"');
    expect(out).toContain('data-np-row="AM"');
  });

  it('the rope shows its knots and a way to let it go', () => {
    const out = renderToString(<RopeChip rope={{ knots: 14 }} game={game} />);
    expect(out).toContain('data-np-rope="14"');
    expect(out).toContain('data-np-drop');
  });

  it('the order card: one box, its unit printed, the canal card marked as a prediction', () => {
    const out = renderToString(<OrderCard o={{ kind: 'canal', seg: 'MN', id: 'MN?', refused: 'empty' }} game={game} />);
    expect(out).toContain('data-np-order="canal"');
    expect(out).toContain('data-np-predict');
    expect(out).toContain('data-np-order-in');
    expect(out).toContain('data-np-refused="empty"');
    expect(plain(out)).toContain(WORLD_TEXT.unit);
  });

  it("the new facts of stages 2–5 speak with the world's words; a block too big is the quarry's order", () => {
    const cap = renderToString(
      <Fact verdict={{ kind: 'capstone', fact: 'big', typed: '36', seg: 'k', quarry: '3564' }} game={game} />,
    );
    expect(cap).toContain('data-np-fact="big"');
    expect(cap).toContain('data-np-quarry="3564"');
    expect(plain(cap)).toContain(WORLD_TEXT.stage.fact.big);
    const mark = renderToString(<Fact verdict={{ kind: 'mark', fact: 'gap', typed: '30', seg: 'BM' }} game={game} />);
    expect(plain(mark)).toContain(WORLD_TEXT.stage.fact.markGap);
    for (const f of ['ties', 'short', 'slack', 'apex', 'below', 'above'])
      expect(renderToString(<Fact verdict={{ kind: 'x', fact: f, typed: '1', seg: 'h' }} game={game} />)).toContain(
        `data-np-fact="${f}"`,
      );
  });

  it('the capstone card asks k as a fraction; the mark and the ferry cards print their unit', () => {
    const cap = renderToString(<OrderCard o={{ kind: 'capstone', seg: 'k', id: 'capstone' }} game={game} />);
    expect(cap).toContain('data-np-order-n');
    expect(cap).toContain('data-np-order-d');
    for (const kind of ['mark', 'ferry']) {
      const out = renderToString(<OrderCard o={{ kind, seg: 'AF', id: kind, row: '55' }} game={game} />);
      expect(out).toContain(`data-np-order="${kind}"`);
      expect(out).toContain('data-np-order-in');
    }
  });

  it('the mission card: its figure says it is not to scale, its boxes and its check', () => {
    const out = renderToString(<StoryCard kind="mission" game={game} />);
    expect(out).toContain('data-np-mission');
    expect(out).toContain('data-np-card-check');
    expect(plain(out)).toContain(WORLD_TEXT.stage.card.notToScale);
  });
});
