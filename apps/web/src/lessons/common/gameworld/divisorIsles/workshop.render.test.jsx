import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import Workshop, { plankRefusal } from './Workshop';
import { T } from './strings';
import { listsReducer, initLists } from './lists';

// the bench draws the world's sound button and ✕ (its own header covers the top bar): the sound button reads the game's
// store, which a server render has not — it is drawn as a mark here, and the ✕ needs the shell's exit (null without it)
vi.mock('../kit/parts', async (importOriginal) => ({
  ...(await importOriginal()),
  SoundToggle: () => <i data-test-sound />,
}));

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy `lists` spec: every sentence as a plain tag (the lesson writes the real ones). */
const tag =
  (name) =>
  (...args) =>
    `${name}[${args.map((x) => (typeof x === 'object' ? Object.values(x).flat().join(':') : x)).join('|')}]`;
const LISTS_TEXT = new Proxy(
  { unit: 'cells', lay: 'lay', claim: 'claim', go: 'go', allLinked: 'all', next: 'next' },
  {
    get: (o, k) => (k in o ? o[k] : tag(String(k))),
  },
);
const BENCH = { kind: 'lists', rounds: [{ a: 32, b: 44 }], text: LISTS_TEXT };

/** A game as the workshop sees it: its words, its sound, and the bench it kept. */
function fakeGame(kept = null) {
  const calls = [];
  return {
    T,
    calls,
    flags: {},
    audio: { play() {} },
    benchKept: () => kept,
    openBench: () => calls.push('openBench'),
    closeBench: (s) => calls.push(['closeBench', s]),
    craft: (b) => calls.push(['craft', b]),
    closeOverlay: () => calls.push('close'),
  };
}
const html = (o, game = fakeGame()) => renderToString(<Workshop o={o} game={game} />);

describe('the workshop', () => {
  it('without `typed`: the stepper exactly as the pilot plays it (− / + and « make », no box, no bench)', () => {
    const out = html({ type: 'workshop', a: 7, seg: 6, gaps: [7], min: 2, max: 9 });
    expect(out).toContain(T.workshop.ask);
    expect(out).toContain('data-di-minus');
    expect(out).toContain('data-di-plus');
    expect(out).toContain('data-di-craft');
    expect(out).toContain('<output>4</output>'); // 1 + floor((9 − 2) / 2)
    expect(out.match(/<span class="(is-on)?"><\/span>/g)).toHaveLength(9);
    expect(out).not.toContain('data-di-in');
    expect(out).not.toContain('data-di-bench-open');
    expect(out).not.toContain('data-di-workshop="typed"');
  });

  it('`typed`: one box with its printed unit, the gaps it must build, « make » — no stepper', () => {
    const out = html({ type: 'workshop', a: 32, seg: 3, gaps: [32, 44], min: 1, max: 44, typed: true });
    expect(out).toContain('data-di-workshop="typed"');
    expect(out).toContain(T.workshop.typedAsk);
    expect(out).toContain('data-di-in="plank"');
    expect(out).toContain(`>${T.workshop.unit}<`);
    expect(out).toContain('data-di-gaps="32,44"');
    expect(out).toContain('Le moule pour les fossés 32 et 44');
    expect(out).toMatch(/type="submit"[^>]*data-di-craft/);
    expect(out).not.toContain('data-di-minus');
    expect(out).not.toContain('data-di-bench-open');
    // one gap only
    expect(html({ type: 'workshop', a: 15, seg: 1, gaps: [15], typed: true })).toContain('Le moule pour le fossé 15');
    expect(T.workshop.forGaps([12, 18, 30])).toBe('Le moule pour les fossés 12, 18 et 30');
  });

  it('`typed`: an empty box, 0, or a length past the longest gap is answered by a sentence; 1 … the longest is made', () => {
    const W = T.workshop;
    expect(plankRefusal('', [32, 44], W)).toBe(W.empty);
    expect(plankRefusal('0', [32, 44], W)).toBe(W.tooShort);
    expect(plankRefusal('45', [32, 44], W)).toBe(
      'Un moule de 45 est plus long que chaque fossé ici\u00a0: le plus long fait 44.',
    );
    expect(plankRefusal('16', [16], W)).toBeNull();
    expect(plankRefusal('17', [16], W)).toBe('Un moule de 17 est plus long que tout le fossé (16).');
    for (const t of ['1', '4', '33', '44']) expect(plankRefusal(t, [32, 44], W)).toBeNull();
  });

  it('`typed` with a bench: the button opens it — new, then « kept » once he has written in it', () => {
    const o = { type: 'workshop', a: 32, seg: 3, gaps: [32, 44], typed: true, bench: BENCH };
    expect(html(o)).toContain(`data-di-bench-open="new"`);
    expect(html(o)).toContain(T.workshop.bench);
    expect(html(o, fakeGame(initLists(BENCH)))).toContain(`data-di-bench-open="kept"`);
  });
});

describe('the bench', () => {
  const o = { type: 'workshop', a: 32, seg: 3, gaps: [32, 44], typed: true, bench: BENCH, benchOpen: true };

  it('opens the experiment in the forge frame, with a way back to the workshop — and no workshop under it', () => {
    const out = html(o);
    expect(out).toContain('data-di-bench="lists"');
    expect(out).toContain('class="rf-root di-bench"');
    expect(out).toContain('class="rf-fit"');
    expect(out).toContain('data-di-bench-back');
    expect(out).toContain(T.workshop.benchBack);
    // it covers the top bar: it carries the sound button (and the ✕, drawn by the shell's ExitLink)
    expect(out).toContain('data-test-sound');
    expect(out).toContain('data-iq="lists"');
    expect(out).toContain('data-iq-stage="build"');
    expect(out).toContain('data-iq-pair="32:44"');
    expect(out).not.toContain('data-di-workshop="typed"');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('reopened, it shows what he did: his finished lists, not an empty bench', () => {
    const lay = (...ds) => ds.flatMap((d) => [{ type: 'try', d }, { type: 'shown' }]);
    const moves = [
      ...lay(1, 2, 4),
      { type: 'go' },
      ...lay(1, 2, 4, 11),
      { type: 'go' },
      ...[1, 2, 4].flatMap((d) => [{ type: 'tap', side: 'a', d }, { type: 'shown' }]),
      { type: 'allLinked' },
      { type: 'pick', d: 4 },
    ];
    const done = moves.reduce((s, a) => listsReducer(BENCH, s, a), initLists(BENCH));
    expect(done.stage).toBe('seen');
    const out = html(o, fakeGame(done));
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-items="1,2,4,8,16,32"');
    expect(out).toContain('data-iq-items="1,2,4,11,22,44"');
    expect(out).toContain('data-iq-links="1,2,4"');
    expect(out).toContain('data-iq-crown="4"');
  });

  it('the game opens it over the workshop, closes it back to the workshop, and keeps (and saves) what he did', async () => {
    const { DivisorIslesGame } = await import('./Game');
    const P = DivisorIslesGame.prototype;
    const saved = [];
    const g = {
      flags: {},
      segs: [{ id: 's0' }, { id: 's1' }, { id: 's2' }, { id: 'convoy-a' }],
      state: { phase: 'dialog', overlay: { type: 'workshop', seg: 3, bench: BENCH } },
      audio: { play() {} },
      set(patch) {
        this.state = { ...this.state, ...patch };
      },
      save() {
        saved.push(JSON.parse(JSON.stringify(this.flags)));
      },
    };
    P.openBench.call(g);
    expect(g.state.overlay.benchOpen).toBe(true);
    const kept = listsReducer(BENCH, initLists(BENCH), { type: 'try', d: 4 });
    P.closeBench.call(g, kept);
    expect(g.state.overlay).toMatchObject({ type: 'workshop', benchOpen: false });
    expect(g.state.phase).toBe('dialog');
    expect(P.benchKept.call(g, 3)).toBe(kept);
    expect(P.benchKept.call(g, 1)).toBeNull();
    expect(saved.at(-1).benches['convoy-a'].stage).toBe('buildLay'); // plain data: it goes into the world's save
    // a workshop without a bench has nothing to open
    g.state = { phase: 'dialog', overlay: { type: 'workshop', seg: 3 } };
    P.openBench.call(g);
    expect(g.state.overlay.benchOpen).toBeUndefined();
  });

  it('a plank the world was still laying when he left is laid when he comes back', () => {
    const mid = listsReducer(BENCH, initLists(BENCH), { type: 'try', d: 4 });
    expect(mid.stage).toBe('buildLay');
    const out = html(o, fakeGame(mid));
    expect(out).toContain('data-iq-stage="build"');
    expect(out).toContain('data-iq-items="4,8"');
  });
});
