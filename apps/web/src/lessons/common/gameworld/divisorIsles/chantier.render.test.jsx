// The walkway's panel (Chantier.jsx › PillarPanel, and the overlay with a stand-in game): every stage drawn from the
// reducer's state, the hooks a walk drives, the scale at 1366 × 768 — and NO word of its own: every word on screen is
// one of the story's (here, tokens « §… »). Server render.
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import Chantier, { PillarPanel, factsOf } from './Chantier';
import { initWalkway, lay, walkwayReducer } from './walkway';
import { LANES_W, lanesHeight } from './crewLanes';

// the bench's sound button reads the game's store, which a server render has not: drawn as a mark here
vi.mock('../kit/parts', async (importOriginal) => ({
  ...(await importOriginal()),
  SoundToggle: () => <i data-test-sound />,
}));

globalThis.window = globalThis.window ?? {};

const W = {
  title: '§title',
  instruction: '§instruction',
  prompt: '§prompt',
  objective: '§objective',
  before: '§before',
  after: '§after',
  plant: '§plant',
  lay: '§lay',
  take: '§take',
  bench: '§bench',
  benchSub: '§benchSub',
  benchBack: '§benchBack',
  error: { empty: '§empty', nan: '§nan', range: (m) => `§range${m}` },
  crew: (i, b) => `§crew${i}_${b}`,
  pillar: (d) => `§pillar${d}`,
  short: (n) => `§short${n}`,
  band: (n, b) => `§band${n}x${b}`,
  lane: (l, i) => `§lane${i}_${l.planks}_${l.short}`,
  shore: '§shore',
  verdict: (t, p) => `§verdict_${t.verdict}_${t.cost}_${p ? p.left - (t.paid ? t.cost : 0) : 'x'}`,
  purse: (left, of) => `§purse${left}of${of}`,
};
const K1 = { id: 'w1', crews: [16, 20], ruler: 400, scale: 'fixed' };
const K2 = { id: 'w2', crews: [414, 192], ruler: 0, scale: 'fit' };
const noop = () => {};
const act = { type: noop, nudge: noop, plant: noop, lay: noop, take: noop };
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);
const visible = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ');
/** Nothing on screen but the story's tokens and numbers: the kit writes no word. */
const noWords = (html) => expect(visible(html).replace(/§\S+/g, '')).not.toMatch(/\p{L}{2,}/u);
const cfg = (seg, purse = 14) => ({ crews: seg.crews, max: seg.scale === 'fit' ? 999999 : seg.ruler, purse });
const play = (seg, moves, purse) => moves.reduce((s, a) => walkwayReducer(cfg(seg, purse), s, a), initWalkway());
const laid = (seg, d, purse = 14) => {
  let s = play(seg, [{ type: 'type', text: String(d) }, { type: 'plant' }, { type: 'lay' }], purse);
  while (s.stage === 'laying') s = walkwayReducer(cfg(seg, purse), s, { type: 'tick' });
  return s;
};
const view = (seg, state, purse = { of: 14, left: 14 }) =>
  renderToString(<PillarPanel W={W} seg={seg} state={state} act={act} purse={purse} />).replaceAll('<!-- -->', '');

describe('the chantier — its panel', () => {
  it('opens on the box: no pillar, empty lanes, the purse; the box and « plant » hooked', () => {
    const html = view(K1, initWalkway());
    clean(html);
    noWords(html);
    expect(html).toContain('data-di-stage="place"');
    expect(html).toContain('data-di-in="pillar"');
    expect(html).toContain('data-di-plant');
    expect(html).not.toContain('data-di-lay');
    expect(html).not.toContain('data-di-post=');
    expect(html).toContain('data-di-purse="14"');
    expect(html).toContain('§purse14of14');
    expect(html).toContain('data-di-lane="A"');
    expect(html).toContain('data-di-lane="B"');
    expect(html).toContain('§crew0_16');
    // the drawing at 1 : 1 — 1 160 px wide, the water 1 100 px, 2,75 px a case
    expect(html).toContain(`width="${LANES_W}" height="${lanesHeight(2)}"`);
    expect(html).toContain('data-cl-px="2.75"');
    // labels every 50: 80 is not one
    expect(html).toContain('data-cl-tick="350"');
    expect(html).not.toContain('data-cl-tick="80"');
  });

  it('a pillar planted stands at once, before the crews lay; « lay » and « take back » appear', () => {
    const s = play(K1, [{ type: 'type', text: '64' }, { type: 'plant' }]);
    const html = view(K1, s);
    noWords(html);
    expect(html).toContain('data-di-post="64"');
    expect(html).toContain('§pillar64');
    expect(html).toContain('data-di-lay');
    expect(html).toContain('data-di-take');
    expect(html).not.toContain('data-di-plant');
    expect(html).not.toContain('data-di-walkway-verdict');
    expect(html).toContain('data-di-planks="0"');
  });

  it('64 laid: A ends (4 planks), B stops 4 short — the amber label in the lane past the pillar; the facts, the verdict', () => {
    const s = laid(K1, 64);
    const html = view(K1, s);
    clean(html);
    noWords(html);
    expect(html).toContain('data-di-walkway-verdict="short"');
    expect(html).toMatch(/data-di-lane="A" data-di-planks="4" data-di-short="0"/);
    expect(html).toMatch(/data-di-lane="B" data-di-planks="3" data-di-short="4"/);
    // gate B 2026-11-26: under the lane it sat under the pillar's line, glued over « 64 cases » — now beside the post
    expect(html).toContain('data-cl-short-below="side"');
    expect(html).not.toContain('data-cl-short-below="1"');
    // the crews' names come after the post: its line passes behind them
    expect(html.indexOf('data-cl-crew="0"')).toBeGreaterThan(html.indexOf('data-di-post'));
    expect(html).toContain('§short4');
    expect(html).toContain('§lane0_4_0');
    expect(html).toContain('§lane1_3_4');
    expect(html).toContain('§verdict_short_7_14');
    expect(html).toContain('data-di-walkway-fact="3"');
    // the planks of 16 are 44 px, of 20 are 55 px
    expect(html).toContain('width="44"');
    expect(html).toContain('width="55"');
  });

  it('0 → one fact, the shore; 320 → ruins (no coin spent); 80 → paid, 5 coins left', () => {
    expect(factsOf(W, lay([16, 20], 0, 14))).toEqual(['§shore']);
    let html = view(K1, laid(K1, 0));
    expect(html).toContain('data-di-walkway-verdict="shore"');
    expect(html).toContain('data-di-walkway-fact="1"');
    html = view(K1, laid(K1, 320));
    expect(html).toContain('data-di-walkway-verdict="ruins"');
    expect(html).toContain('§verdict_ruins_36_14');
    html = view(K1, laid(K1, 80));
    expect(html).toContain('data-di-walkway-verdict="paid"');
    expect(html).toContain('§verdict_paid_9_5');
    expect(html).toMatch(/class="is-ok"/);
  });

  it('a wrong box is answered by the story’s words', () => {
    let html = view(K1, play(K1, [{ type: 'plant' }]));
    expect(html).toContain('data-di-walkway-error="empty"');
    expect(html).toContain('§empty');
    html = view(K1, play(K1, [{ type: 'type', text: '999' }, { type: 'plant' }]));
    expect(html).toContain('§range400');
  });

  it('fit — K2 at 13 248: the ruler relabelled for the try (2 500 a label), planks drawn; 79 488: each lane one band', () => {
    let html = view(K2, laid(K2, 13248, 120), { of: 120, left: 120 });
    clean(html);
    noWords(html);
    expect(html).toContain('data-di-walkway-verdict="paid"');
    expect(html).toContain('data-cl-tick="2500"');
    expect(html).toMatch(/data-di-lane="A" data-di-planks="32"/);
    expect(html).toMatch(/data-di-lane="B" data-di-planks="69"/);
    expect(html).not.toContain('§band');
    html = view(K2, laid(K2, 79488, 120), { of: 120, left: 120 });
    expect(html).toContain('data-di-walkway-verdict="ruins"');
    expect(html).toContain('§band192x414');
    expect(html).toContain('§band414x192');
  });
});

describe('the chantier — its overlay, on a stand-in game', () => {
  const game = (tries = [], bench = null) => ({
    T: { walkway: W, workshop: {} },
    segs: [{ ...K1, index: 0, ...(bench ? { bench } : {}) }],
    walkwayPurse: () => ({ of: 14, left: 14 }),
    walkwayTries: () => tries,
    walkwayLaid: noop,
    closeWalkway: noop,
    openBench: noop,
    benchKept: () => null,
    audio: { play: noop },
  });
  it('shows the story’s title and instruction, the panel, its hooks — and the bench’s button when there is one', () => {
    let html = renderToString(<Chantier o={{ type: 'walkway', seg: 0 }} game={game()} />).replaceAll('<!-- -->', '');
    clean(html);
    noWords(html);
    expect(html).toContain('data-di-walkway="w1"');
    expect(html).toContain('§title');
    expect(html).toContain('§instruction');
    expect(html).not.toContain('data-di-bench-open');
    const bench = { kind: 'sheet', rounds: [{ n: 414 }], text: {} };
    html = renderToString(<Chantier o={{ type: 'walkway', seg: 0, bench }} game={game([], bench)} />);
    expect(html).toContain('data-di-bench-open="new"');
    expect(html).toContain('§bench');
  });

  it('« Le tableur » open: the workshop’s bench frame, in the walkway’s words (the story’s)', () => {
    const bench = {
      kind: 'sheet',
      rounds: [{ n: 414 }],
      text: {
        lead: () => '§lead',
        goal: () => '§goal',
        primeHead: '§head',
        ask: () => '§ask',
        prime: '§prime',
        held: () => '§held',
        miss: () => '§miss',
        notPrime: () => '§notPrime',
        end: () => '§end',
        foundLine: () => '§found',
        next: '§next',
        done: '§done',
      },
    };
    const g = { ...game([], bench), closeBench: noop };
    const html = renderToString(<Chantier o={{ type: 'walkway', seg: 0, bench, benchOpen: true }} game={g} />);
    clean(html);
    expect(html).toContain('data-di-bench="sheet"');
    expect(html).toContain('§benchSub');
    expect(html).toContain('§benchBack');
    expect(html).toContain('data-iq="sheet"');
  });
});
