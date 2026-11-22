import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FAMILIES, familyFor, complete, grade, slotsOf } from './families';
import {
  planTools,
  nextStep,
  kitOf,
  scoreOf,
  honesty,
  priorities,
  flowOf,
  mergeKit,
  workshopTool,
  gateOf,
  CAP,
  BANDS,
} from './engine';

describe('L’échauffement — the families and how an answer is graded', () => {
  it('has no family until the French learning net exists', () => {
    expect(FAMILIES).toEqual({});
    expect(familyFor('6e.t1.r01')).toBeNull();
  });

  // Neutral questions written here, one per gesture: the grader re-computes the value, it never reads a stored answer.
  const division = { gesture: 'write', a: 47, b: 6, tokens: ['47', '=', '6', '×', { slot: 'q' }, '+', { slot: 'r' }] };
  const product = { gesture: 'write', calc: { op: 'timesPlus', x: 6, y: 9, z: 5 }, tokens: [{ slot: 'v' }] };
  const flag = { gesture: 'place', a: 50, b: 7, target: 49 };

  it('a write question: right, swapped, or a remainder too big', () => {
    expect(slotsOf(division.tokens).map((t) => t.slot)).toEqual(['q', 'r']);
    expect(complete(division, { q: '7', r: '' })).toBe(false);
    expect(grade(division, { q: '7', r: '5' })).toEqual({ correct: true, mistake: null });
    expect(grade(division, { q: '5', r: '7' })).toEqual({ correct: false, mistake: 'swapped' });
    expect(grade(division, { q: '6', r: '11' })).toEqual({ correct: false, mistake: 'rest-too-big' });
  });

  it('a question carrying its operation is re-computed, and the order of operations is named', () => {
    expect(grade(product, { v: '59' })).toEqual({ correct: true, mistake: null });
    expect(grade(product, { v: '84' })).toEqual({ correct: false, mistake: 'order-ops' });
  });

  it('a flag on the number line: on the target, past the number, or not on a multiple', () => {
    expect(complete(flag, { x: 49, moved: true })).toBe(true);
    expect(grade(flag, { x: 49 })).toEqual({ correct: true, mistake: null });
    expect(grade(flag, { x: 56 })).toEqual({ correct: false, mistake: 'overshoot' });
    expect(grade(flag, { x: 45 })).toEqual({ correct: false, mistake: 'not-multiple' });
  });
});

describe('L’échauffement — the engine of a launch', () => {
  // A neutral fixture in the shape of `toolsForLesson(code)`: two earlier tools, the core one first.
  const links = [
    { id: '6e.t1.r01', grade: '6e', text: 'Outil A', weight: 'core', lesson: { code: 'lecon-a', grade: '6e' } },
    { id: '6e.t1.r02', grade: '6e', text: 'Outil B', weight: 'support', lesson: { code: 'lecon-b', grade: '6e' } },
  ];
  const has = (id) => links.some((l) => l.id === id);
  const tools = planTools(links, has);
  const [A, B] = tools.map((t) => t.item);
  const ans = (item, level, correct, extra = {}) => ({
    item,
    level,
    correct,
    unsure: false,
    phase: 'station',
    mistake: null,
    ...extra,
  });
  const play = (answers, extra = {}) => nextStep({ tools, answers, elapsed: 30, ...extra });

  it("keeps the tools of the learning net that have a family, in the net's order, each with its home lesson", () => {
    expect(tools.map((t) => [t.item, t.lesson.code, t.grade, t.weight])).toEqual([
      ['6e.t1.r01', 'lecon-a', '6e', 'core'],
      ['6e.t1.r02', 'lecon-b', '6e', 'support'],
    ]); // the core tool is measured first
    expect(planTools(links, () => false)).toEqual([]);
  });

  it('asks an easy question then a harder one, and stops as soon as it knows', () => {
    expect(play([])).toEqual({ type: 'question', item: A, level: 1, phase: 'station', first: true });
    expect(play([ans(A, 1, true)])).toMatchObject({ item: A, level: 2, first: false });
    expect(play([ans(A, 1, true), ans(A, 2, true)])).toMatchObject({ item: B, level: 1 });
    expect(play([ans(A, 1, true), ans(A, 2, true), ans(B, 1, true), ans(B, 2, true)])).toEqual({ type: 'result' }); // four answers, no workshop
  });

  it('never judges a tool on one answer, and a doubt is not a success', () => {
    expect(play([ans(A, 1, false)])).toMatchObject({ item: A, level: 1 }); // a second easy one
    expect(play([ans(A, 1, false), ans(A, 1, true)])).toMatchObject({ item: A, level: 2 });
    expect(play([ans(A, 1, true, { unsure: true })])).toMatchObject({ item: A, level: 1 });
    const kit = kitOf(tools, [ans(A, 1, false), ans(A, 1, false), ans(B, 1, true), ans(B, 2, false)]);
    expect(kit.map((t) => [t.band, t.segments])).toEqual([
      [BANDS.START, 0],
      [BANDS.CONSOLIDATE, 1],
    ]);
    expect(scoreOf(kit)).toEqual({ lit: 1, total: 4, percent: 25 });
  });

  it('repairs the weakest tool on the spot: an example, two questions — and a repaired tool is not « Solide » yet', () => {
    const base = [ans(A, 1, false, { mistake: 'rest-too-big' }), ans(A, 1, false), ans(B, 1, true), ans(B, 2, false)];
    expect(workshopTool(tools, base)).toEqual({ item: A, level: 1 });
    expect(play(base)).toEqual({ type: 'example', item: A, level: 1 });
    expect(play(base, { exampleSeen: true })).toMatchObject({ type: 'question', item: A, level: 1, phase: 'workshop' });
    const shop = (c1, c2) => [...base, ans(A, 1, c1, { phase: 'workshop' }), ans(A, 1, c2, { phase: 'workshop' })];
    expect(play(shop(true, true), { exampleSeen: true })).toEqual({ type: 'result' }); // ONE workshop: B is not repaired in the same launch
    expect(kitOf(tools, shop(true, true))[0]).toMatchObject({
      band: BANDS.CONSOLIDATE,
      repaired: true,
      segments: 1,
      mistakes: ['rest-too-big'],
    });
    expect(kitOf(tools, shop(true, false))[0]).toMatchObject({ band: BANDS.START, repaired: false });
    expect(priorities(kitOf(tools, shop(true, false))).first.item).toBe(A);
    expect(priorities(kitOf(tools, shop(true, true))).first.item).toBe(B); // not repaired comes before repaired
    expect(play(base, { skipWorkshop: true })).toEqual({ type: 'result' });
  });

  it('respects the five minutes and the twelve questions: what was not asked stays « Pas encore testé » and does not cost points', () => {
    expect(nextStep({ tools, answers: [ans(A, 1, true), ans(A, 2, true)], elapsed: CAP.seconds })).toEqual({
      type: 'result',
    });
    const kit = kitOf(tools, [ans(A, 1, true), ans(A, 2, true)]);
    expect(kit[1].band).toBe(BANDS.UNSEEN);
    expect(scoreOf(kit)).toEqual({ lit: 2, total: 2, percent: 100 });
    expect(
      nextStep({
        tools,
        answers: [ans(A, 1, false), ans(A, 1, false), ans(B, 1, true), ans(B, 2, true)],
        elapsed: CAP.seconds - 10,
      }),
    ).toEqual({ type: 'result' }); // no time left for a workshop
    expect(scoreOf(kitOf(tools, [])).percent).toBe(null);
  });

  it('a tool measured « Solide » in the last three weeks arrives charged and is not asked again', () => {
    const now = 1e12;
    const store = mergeKit(
      {},
      'lecon-x',
      kitOf(tools, [ans(A, 1, true), ans(A, 2, true), ans(B, 1, true), ans(B, 2, false)]),
      now,
    );
    expect(store.items[A]).toEqual({ band: BANDS.SOLID, repaired: false, at: now });
    expect(store.lessons['lecon-x']).toMatchObject({
      tries: 1,
      last: { percent: 75 },
      first: { percent: 75 },
    });
    const again = planTools(links, has, store.items, now + 5 * 86400000);
    expect(again.map((t) => t.known)).toEqual([true, false]);
    expect(nextStep({ tools: again, answers: [] })).toMatchObject({ item: B, level: 1, first: true });
    expect(planTools(links, has, store.items, now + 30 * 86400000).map((t) => t.known)).toEqual([false, false]); // three weeks later it is asked again
    const second = mergeKit(store, 'lecon-x', kitOf(again, [ans(B, 1, true), ans(B, 2, true)]), now + 9);
    expect(second.lessons['lecon-x']).toMatchObject({
      tries: 2,
      first: { percent: 75 },
      last: { percent: 100 },
    });
    expect(second.items[A].at).toBe(now); // a tool that was not asked keeps its date
  });

  it('the gate: ONE capsule for a CORE tool left empty — it opens by doing, whatever the answers say', () => {
    const miss = (item) => [ans(item, 1, false), ans(item, 1, false)];
    const solid = (item) => [ans(item, 1, true), ans(item, 2, true)];
    const cap = (item, c1, c2) => [ans(item, 1, c1, { phase: 'capsule' }), ans(item, 1, c2, { phase: 'capsule' })];
    expect(gateOf(kitOf(tools, [...solid(A), ...solid(B)]))).toBe(null);
    expect(gateOf(kitOf(tools, [...miss(A), ...solid(B)])).item).toBe(A); // the division is core: the lesson cannot be passed without it
    expect(gateOf(kitOf(tools, [...solid(A), ...miss(B)]))).toBe(null); // the rules are a support: they never close the door
    expect(gateOf(kitOf(tools, [ans(A, 1, true), ans(A, 2, false), ...miss(B)]))).toBe(null); // « À consolider » is enough to go
    expect(gateOf(kitOf(tools, [ans(A, 1, false)]))).toBe(null); // a tool the clock did not let finish is not « À reprendre »
    const failed = kitOf(tools, [...miss(A), ...solid(B), ...cap(A, false, true)]);
    expect(failed[0]).toMatchObject({ band: BANDS.START, capsule: true, repaired: false });
    expect(gateOf(failed)).toBe(null); // done, not passed: he goes in, the tool stays flagged
    const passed = kitOf(tools, [...miss(A), ...solid(B), ...cap(A, true, true)]);
    expect(passed[0]).toMatchObject({ band: BANDS.CONSOLIDATE, capsule: true, repaired: true });
    expect(gateOf(kitOf(tools, [...miss(A), ...solid(B), ans(A, 1, true, { phase: 'capsule' })])).item).toBe(A); // one answer is not the capsule
    expect(mergeKit({}, 'lecon-x', failed, 5).items[A]).toEqual({
      band: BANDS.START,
      repaired: false,
      capsule: true,
      at: 5,
    });
    const unclassified = tools.map((t) => ({ ...t, weight: null }));
    expect(gateOf(kitOf(unclassified, [...solid(A), ...miss(B)])).item).toBe(B); // not classified yet counts as core
  });

  it('gives the honesty star to a student who knows what he knows', () => {
    const a = (correct, unsure) => ({ correct, unsure });
    expect(honesty([a(true, false), a(true, false), a(false, true), a(true, false)])).toMatchObject({
      star: true,
      matched: 4,
    });
    expect(honesty([a(true, false), a(false, false), a(false, false), a(true, false)]).star).toBe(false); // sure and wrong twice
    expect(honesty([a(true, true), a(true, true), a(true, true)]).star).toBe(false); // doubting everything is not knowing
    expect(honesty([a(true, false), a(true, false)]).star).toBe(false); // too few answers to say
    expect([
      flowOf([]),
      flowOf([ans(A, 1, true), ans(A, 2, true)]),
      flowOf([ans(A, 1, true), ans(A, 2, false)]),
      flowOf(Array(6).fill(ans(A, 1, true))),
    ]).toEqual([0, 2, 0, 3]);
  });
});

describe('L’échauffement — the sounds', () => {
  const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
  const namesIn = (src) =>
    [...src.matchAll(/(?:play|playRef\.current)\(([^)]*?)[,)]/g)].flatMap((m) =>
      [...m[1].matchAll(/'([a-zA-Z]+)'/g)].map((x) => x[1]),
    );

  it('every sound the launch plays exists in its palette, and every sound of the palette is played', async () => {
    const { SOUND_NAMES, GAP, SOUNDS } = await import('./sound');
    const used = new Set(['./LaunchKit.jsx', './gestures.jsx'].flatMap((f) => namesIn(read(f))));
    for (const name of used) expect(SOUND_NAMES, `« ${name} » is played but not in sound.js`).toContain(name);
    for (const name of SOUND_NAMES) expect([...used], `« ${name} » is in sound.js but never played`).toContain(name);
    for (const k of Object.keys(GAP)) expect(Object.keys(SOUNDS)).toContain(k);
  });

  it('a sound is short and quiet; the two boxes of a sort have each their note, whatever the card', async () => {
    const { LaunchSound, SOUNDS } = await import('./sound');
    const s = new LaunchSound();
    const made = [];
    let now = 0;
    s.wake = () => {
      s.ctx = {
        get currentTime() {
          return now;
        },
        state: 'running',
      };
    };
    s.tone = (o) => made.push({ kind: 'tone', ...o });
    s.noise = (o) => made.push({ kind: 'noise', ...o });
    for (const name of Object.keys(SOUNDS)) {
      made.length = 0;
      now += 5;
      expect(s.play(name, 2), name).toBe(true);
      expect(made.length, name).toBeGreaterThan(0);
      for (const o of made) {
        expect((o.t ?? 0) + (o.d ?? 0.2), name).toBeLessThanOrEqual(name === 'liftoff' ? 1.7 : 1.3);
        /* only the take-off lasts */ expect(o.g ?? 0.2, name).toBeLessThanOrEqual(0.3);
      }
    }
    const notes = (yes) => {
      made.length = 0;
      now += 5;
      s.play('drop', yes);
      return made
        .filter((o) => o.kind === 'tone')
        .map((o) => Math.round(o.f))
        .join();
    };
    expect(notes(1)).not.toBe(notes(0)); // a box is recognised by its note — which says nothing about right or wrong
  });

  it('the bed of music gains a layer with the flow, and is silent about the answers', async () => {
    const { LaunchSound } = await import('./sound');
    const count = (flow) =>
      Array.from({ length: 32 }, (_, beat) => LaunchSound.layers(flow, beat).length).reduce((a, b) => a + b, 0);
    expect(count(0)).toBeGreaterThan(0);
    expect(count(1)).toBeGreaterThan(count(0));
    expect(count(2)).toBeGreaterThan(count(1));
    expect(count(3)).toBeGreaterThan(count(2));
    for (let beat = 0; beat < 64; beat += 1)
      for (const o of LaunchSound.layers(3, beat)) expect(o.g).toBeLessThanOrEqual(0.06);
  });
});
