import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import Workshop, { benchKeptLines, plankRefusal } from './Workshop';
import { T } from './strings';
import { listsReducer, initLists } from './lists';
import { initSheet, sheetReducer } from './sheet';

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

  it('`typed` honours the workshop’s `min` and `max` (they were ignored: any length 1 … the longest gap was made)', () => {
    const W = T.workshop;
    // a min of more than 1: below it, the workshop's own sentence
    expect(plankRefusal('2', [60], W, { min: 3, max: 60 })).toBe(W.tooShortOf(3));
    expect(W.tooShortOf(3)).toBe('Cet atelier fabrique des moules de 3\u00a0cases au moins.');
    expect(plankRefusal('3', [60], W, { min: 3, max: 60 })).toBeNull();
    expect(plankRefusal('0', [60], W, { min: 3, max: 60 })).toBe(W.tooShort);
    // a max shorter than the gap (91 cases, planks up to 90): the gap's own length cannot be made
    expect(plankRefusal('91', [91], W, { min: 1, max: 90 })).toBe(W.tooLong(91, 90, 1, true));
    expect(W.tooLong(91, 90, 1, true)).toBe(
      'Cet atelier fabrique des moules de 90\u00a0cases au plus\u00a0: 91, c’est trop long.',
    );
    expect(plankRefusal('90', [91], W, { min: 1, max: 90 })).toBeNull();
    expect(plankRefusal('7', [91], W, { min: 1, max: 90 })).toBeNull();
    // a max as long as the gap, or longer: the gap bounds it, with the gap's sentence as before
    expect(plankRefusal('17', [16], W, { min: 1, max: 16 })).toBe(
      'Un moule de 17 est plus long que tout le fossé (16).',
    );
    expect(plankRefusal('17', [16], W, { min: 1, max: 99 })).toBe(
      'Un moule de 17 est plus long que tout le fossé (16).',
    );
    // min 1 and no limits: exactly the old answers
    expect(plankRefusal('1', [16], W, { min: 1 })).toBeNull();
    expect(plankRefusal('16', [16], W, {})).toBeNull();
  });

  it('`typed`: the form judges with the overlay’s own min and max', () => {
    const game = fakeGame();
    const out = html({ type: 'workshop', a: 91, seg: 3, gaps: [91], min: 1, max: 90, typed: true }, game);
    expect(out).toContain('data-di-workshop="typed"');
    // a story's sentence for the workshop's limit receives that limit (the lesson's: « … des planches de 90 cases au plus »)
    const story = { ...T.workshop, tooLong: (b, max) => `max ${max}, typed ${b}` };
    expect(plankRefusal('91', [91], story, { min: 1, max: 90 })).toBe('max 90, typed 91');
  });

  it('a number of four digits or more is grouped by thousands in every refusal and in the world’s lines (« 1 786 »)', () => {
    const W = T.workshop;
    // 2026-11-26, fraction-irreductible: « Un moule de 1787 est plus long que tout le fossé (1786). »
    expect(plankRefusal('1787', [1786], W)).toBe('Un moule de 1 787 est plus long que tout le fossé (1 786).');
    expect(plankRefusal('1787', [722, 1786], W)).toBe(
      'Un moule de 1 787 est plus long que chaque fossé ici : le plus long fait 1 786.',
    );
    expect(W.tooLong(1201, 1200, 1, true)).toContain('1 200 cases au plus : 1 201,');
    // the bridge's label, the verdicts, the prompts, the card on the right (LaTeX: « 1\,786 »)
    expect(T.mark.label(722, 1786)).toBe('722 cases éclairées sur 1 786');
    expect(T.verdict.holds(38, 1786)).toContain('exactement 1 786');
    expect(T.verdict.open(5, 1786)).toContain('pas 1 786');
    expect(T.verdict.markMiss(1001, 1722)).toContain(
      'moule 1 001 remplit le pont, mais aucune jointure à la case 1 722',
    );
    expect(T.say.markMiss(7, { m: 1722, q: 246, r: 0 })).toContain('1 722 = 7 × 246 + 0');
    expect(T.recall.bridge(1786, 38, 47)).toBe('Le fossé précédent : $1\\,786 = 38 \\times 47$');
    // small numbers as before
    expect(T.verdict.open(5, 96)).toBe('Le moule 5 ne remplit pas 96 : le pont ne tient pas');
    // no number of four digits or more is left without its space
    const all = [
      plankRefusal('1787', [1786], W),
      plankRefusal('12345', [1786, 9999], W),
      T.mark.label(1000, 2000),
      T.verdict.purse(3, 1200),
      T.prompt.take(1200),
      T.say.crafted(1200),
      T.say.tooLong(1201, 1200),
    ];
    for (const s of all) expect(s).not.toMatch(/\d{4}/);
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

/** A toy `sheet` bench (two decompositions to find) whose lesson writes what it kept: one line per round found. */
const SHEET_TEXT = {
  lead: (n) => `lead(${n})`,
  goal: (n) => `goal(${n})`,
  primeHead: 'head',
  ask: () => 'ask',
  prime: 'prime',
  held: () => 'held',
  miss: () => 'miss',
  notPrime: () => 'notPrime',
  end: () => 'end',
  foundLine: (r) => `line[${r.n}]`,
  next: 'next',
  done: 'done',
};
const KEPT_LINE = (r) => `$${r.n} = ${r.factors.join(' \\times ')}$`;
const SHEET = {
  kind: 'sheet',
  rounds: [{ n: 2431 }, { n: 4641 }],
  text: { ...SHEET_TEXT, kept: (s) => s.rounds.map(KEPT_LINE) },
};
const run = (spec, moves, from = initSheet(spec)) => moves.reduce((s, a) => sheetReducer(spec, s, a), from);
const filled = (spec, s) => (s.stage === 'fill' ? filled(spec, sheetReducer(spec, s, { type: 'tick' })) : s);
/** Both rounds played to their end: 2 431 = 11 × 13 × 17, 4 641 = 3 × 7 × 13 × 17. */
function bothDone(spec = SHEET) {
  let s = filled(spec, initSheet(spec));
  for (const p of [11, 13]) s = filled(spec, run(spec, [{ type: 'line', p }], s));
  s = filled(spec, run(spec, [{ type: 'prime' }, { type: 'next' }], s));
  for (const p of [3, 7, 13]) s = filled(spec, run(spec, [{ type: 'line', p }], s));
  return run(spec, [{ type: 'prime' }], s);
}

describe('the « kept » card of the typed workshop', () => {
  const o = { type: 'workshop', a: 32, seg: 3, gaps: [32, 44], typed: true, bench: SHEET };

  it('the bench kept a state and the lesson writes `bench.text.kept`: its lines in a card under the length box', () => {
    const kept = bothDone();
    expect(kept.rounds.map((r) => r.factors)).toEqual([
      [11, 13, 17],
      [3, 7, 13, 17],
    ]);
    const out = html(o, fakeGame(kept));
    expect(out).toContain('data-di-bench-kept="2"');
    expect(out).toContain(`data-di-bench-open="kept"`);
    // under the length box, before the buttons
    const at = (hook) => out.indexOf(hook);
    expect(at('data-di-in="plank"')).toBeLessThan(at('data-di-bench-kept'));
    expect(at('data-di-bench-kept')).toBeLessThan(at('data-di-craft'));
    // the lesson's lines, through MathText (no raw `$` on screen)
    expect(out).toContain('2431 = 11 \\times 13 \\times 17');
    expect(out).toContain('4641 = 3 \\times 7 \\times 13 \\times 17');
    expect(out).not.toMatch(/undefined|NaN|\[object/);
    const card = out.slice(at('data-di-bench-kept'), at('data-di-craft'));
    expect(card).not.toContain('$');
    // at least 18 px for what he reads (1.15 rem)
    expect(card).toContain('font-size:1.15rem');
    expect(benchKeptLines(o, fakeGame(kept))).toEqual(kept.rounds.map(KEPT_LINE));
  });

  it('half a bench is shown as the lesson words it (one round found); a card holds four lines at most', () => {
    let s = filled(SHEET, initSheet(SHEET));
    for (const p of [11, 13]) s = filled(SHEET, run(SHEET, [{ type: 'line', p }], s));
    s = run(SHEET, [{ type: 'prime' }], s);
    expect(html(o, fakeGame(s))).toContain('data-di-bench-kept="1"');
    const six = { ...SHEET, text: { ...SHEET.text, kept: () => ['a', 'b', 'c', 'd', 'e', 'f'] } };
    const out = html({ ...o, bench: six }, fakeGame(bothDone()));
    expect(out).toContain('data-di-bench-kept="4"');
    expect(out).not.toContain('>e<');
    // nothing to say (the lesson returns no line): no card
    expect(html(o, fakeGame(initSheet(SHEET)))).not.toContain('data-di-bench-kept');
  });

  it('nothing changes when the bench kept nothing, or the lesson writes no `kept`, or on the stepper', () => {
    expect(html(o)).not.toContain('data-di-bench-kept');
    const silent = { ...SHEET, text: SHEET_TEXT };
    const out = html({ ...o, bench: silent }, fakeGame(bothDone(silent)));
    expect(out).not.toContain('data-di-bench-kept');
    expect(out).toContain(`data-di-bench-open="kept"`);
    expect(html({ ...o, typed: false, min: 1, max: 44 }, fakeGame(bothDone()))).not.toContain('data-di-bench-kept');
  });

  it('a kept state that is not one of this bench’s (other numbers, another kind) or a `kept` that throws: no card, no crash', () => {
    const other = { ...SHEET, rounds: [{ n: 3127 }, { n: 4641 }] };
    for (const kept of [bothDone(), initLists(BENCH), { ri: 9 }, 'x']) {
      const out = html({ ...o, bench: other }, fakeGame(kept));
      expect(out).toContain('data-di-workshop="typed"');
      expect(out).not.toContain('data-di-bench-kept');
    }
    const throws = () => {
      throw new Error('lesson');
    };
    const broken = { ...SHEET, text: { ...SHEET.text, kept: throws } };
    expect(html({ ...o, bench: broken }, fakeGame(bothDone()))).not.toContain('data-di-bench-kept');
    const notLines = { ...SHEET, text: { ...SHEET.text, kept: () => 'one string' } };
    expect(html({ ...o, bench: notLines }, fakeGame(bothDone()))).not.toContain('data-di-bench-kept');
  });

  it('the sheet as a bench reopens where he left it — and a state of other numbers opens a fresh sheet', () => {
    const open = { ...o, benchOpen: true };
    const half = filled(SHEET, run(SHEET, [{ type: 'line', p: 11 }], filled(SHEET, initSheet(SHEET))));
    const out = html(open, fakeGame(half));
    expect(out).toContain('data-di-bench="sheet"');
    expect(out).toContain('data-iq-n="221"');
    expect(out).toContain('data-iq-note="2431:11:221"');
    const fresh = html({ ...open, bench: { ...SHEET, rounds: [{ n: 3127 }] } }, fakeGame(half));
    expect(fresh).toContain('data-iq-n="3127"');
    expect(fresh).toContain('data-iq-stage="fill"');
    expect(fresh).not.toMatch(/undefined|NaN/);
  });
});
