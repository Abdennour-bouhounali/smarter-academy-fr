// The run's HUD (`GateRunHud.jsx`) with a round that names points: its FIGURE (`state.run.figure`, a GeoFigure spec) is
// drawn by the practice space's own StatementFigure in its own panel `data-gr-figure` while the order is up (`go`,
// `paused`) and beside the fact (`hit`), at the width `runFigure` gives (never under its 12 px floor). A round without
// one draws exactly as before: no panel. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import GateRunHud from './GateRunHud';
import { RUN_FIGURE, runFigure } from './trainerFigure';

globalThis.window = globalThis.window ?? {};

/** A Thalès figure as a lesson's `run.js` gives it: a triangle, a parallel cut, the lengths given and the one asked. */
const FIGURE = {
  points: { A: [0, 0], B: [3, 0], C: [1, 5.5], M: [1.8, 0], N: [0.6, 3.3] },
  segments: [
    { from: 'A', to: 'B', label: 'AB = 40', labelSide: -1 },
    { from: 'A', to: 'C', label: 'AC = ?', labelSide: 1 },
    { from: 'A', to: 'M', label: '24' },
    { from: 'A', to: 'N', label: '18' },
    { from: 'M', to: 'N', arrows: 1 },
    { from: 'B', to: 'C', arrows: 1 },
  ],
  ariaLabel: 'figure',
};
const TEXT = { order: 'order', gate: 'gate', of: 'of', pause: 'pause', resume: 'resume', quit: 'quit', leave: 'leave' };
const run = (more) => ({
  stage: 'go',
  ask: 'AC',
  tex: 'AM = 24',
  figure: null,
  options: [{ t: '1' }, { t: '2' }, { t: '3' }],
  lane: 1,
  hearts: 3,
  score: 0,
  streak: 0,
  n: 1,
  total: 4,
  ...more,
});
const game = { gateRun: { els: [], o: { skin: { name: 'river' } } } };
const html = (r) => renderToString(<GateRunHud run={r} game={game} content={{ text: TEXT }} />);

describe('the run’s HUD draws the round’s figure in its own panel', () => {
  it('a round without a figure: no panel (as before)', () => {
    expect(html(run())).not.toContain('data-gr-figure');
    expect(html(run({ stage: 'hit', why: 'fact', picked: 0, right: 1 }))).not.toContain('data-gr-figure');
  });

  it('while the order is up, paused, and beside the fact: the figure, by StatementFigure, at its floor or more', () => {
    const f = runFigure(FIGURE);
    expect(f.fits).toBe(true);
    expect(f.label).toBeGreaterThanOrEqual(12);
    for (const more of [{}, { stage: 'paused' }, { stage: 'hit', why: 'fact', picked: 0, right: 1 }]) {
      const out = html(run({ figure: FIGURE, ...more }));
      const panel = /<div class="gr-figure" data-gr-figure="true" style="([^"]*)">/.exec(out);
      expect(panel, JSON.stringify(more)).toBeTruthy();
      expect(panel[1]).toContain(`width:${f.width + 2 * RUN_FIGURE.pad}px`);
      expect(out).toContain('data-geo-figure');
      expect(out).toContain('AC = ?');
      expect(out).toContain('AB = 40');
    }
    // the fact card and the figure together
    expect(html(run({ figure: FIGURE, stage: 'hit', why: 'fact', picked: 0, right: 1 }))).toContain('data-gr-why');
  });

  it('the cards before the start and at the end draw no figure', () => {
    const ready = renderToString(
      <GateRunHud run={run({ stage: 'ready', figure: FIGURE })} game={game} content={{ text: { ...TEXT } }} />,
    );
    expect(ready).not.toContain('data-gr-figure');
  });
});
