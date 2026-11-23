import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FAMILIES, MISTAKES, familyFor, complete, grade, slotsOf, makeQuestion, pickForm } from './families';
import { toolsForLesson, getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { toolById, toolsFor } from '../lessonlab/registry';
import { GRADES } from '../lessonlab/order';
import ORDER from '../lessonlab/lessonOrder.generated.json';
import { typographyErrors, stringsIn } from '../gameworld/kit/authoring/test/suites';
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
  it('has the families of the French net: `4e.m1.r06` (the first 3e lesson), `3e.m1.r05` and `4e.m1.r08` (the second)', () => {
    expect(Object.keys(FAMILIES)).toEqual(['4e.m1.r06', '3e.m1.r05', '4e.m1.r08']);
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

describe('L’échauffement — « Nombres premiers et produits » (4e.m1.r06), the tool of « Décomposer en facteurs premiers »', () => {
  const ITEM = '4e.m1.r06';
  const F = FAMILIES[ITEM];
  const rng = (seed) => {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  /** Everything computed HERE, never read from the family: primes by trying every divisor, products, values. */
  const primeApart = (n) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
  const powApart = (x, e) => Array.from({ length: e }).reduce((p) => p * x, 1);
  /** « $30 = 2 \\times 3 \\times 5$ » → is it n written as a product of primes? */
  const decompTrue = (text) => {
    const m = text.match(/^\$(\d+) = (\d+(?: \\times \d+)+)\$$/);
    if (!m) return null;
    const fs = m[2].split(' \\times ').map(Number);
    return fs.reduce((p, x) => p * x, 1) === Number(m[1]) && fs.every(primeApart);
  };
  const accepts = (q, c) => decompTrue(c.text) ?? (q.k ? c.n % q.k === 0 : primeApart(c.n));
  const right = (q) => {
    if (q.gesture === 'sort') return Object.fromEntries(q.cards.map((c) => [c.id, accepts(q, c) ? 'yes' : 'no']));
    if (q.calc.op === 'pow') return { v: String(powApart(q.calc.x, q.calc.e)) };
    // « n = a × ▢ × b »: the missing number, found by trying every number
    const known = q.tokens.filter((t) => typeof t === 'string' && /^\d+$/.test(t)).map(Number);
    const [n, ...given] = known;
    const v = Array.from({ length: n }, (_, i) => i + 1).find((x) => given.reduce((p, y) => p * y, x) === n);
    return { v: String(v) };
  };
  const each = (fn) => {
    for (const level of [1, 2])
      for (const form of F.forms[level])
        for (let seed = 1; seed <= 200; seed += 1)
          fn(level, form, makeQuestion(rng(seed * 7 + level), ITEM, level, form, { first: seed % 5 === 0 }), seed);
  };

  it('is the tool the learning net gives the lesson, an item of the net, with its rules, its memo and no instrument', () => {
    const tools = toolsForLesson('decomposer-en-facteurs-premiers');
    expect(tools.map((t) => t.id)).toContain(ITEM);
    expect(planTools(tools, (id) => Boolean(familyFor(id))).map((t) => t.item)).toEqual([ITEM]);
    expect(getItem(ITEM)).toBeTruthy();
    expect(F.item).toBe(ITEM);
    expect(F.memo.length).toBeGreaterThanOrEqual(3);
    expect(F.memo.length).toBeLessThanOrEqual(4);
    expect(F.forms[1].length).toBeGreaterThanOrEqual(1);
    expect(F.forms[2].length).toBeGreaterThanOrEqual(2);
    expect(F.forms[2][0]).toBe('sort'); // the level-2 question a launch asks once is the sort of products
    for (const m of F.mistakes) expect(MISTAKES[m], m).toBeTruthy();
    // no French lesson before the first 3e lesson has an instrument: the capsule's lab would be empty
    expect(F.labTool).toBeNull();
  });

  it('the capsule’s lab never opens on an instrument of the lesson being prepared — for every lesson of the cycle', () => {
    for (const g of GRADES)
      for (const code of ORDER[g])
        for (const t of planTools(toolsForLesson(code), (id) => Boolean(familyFor(id)))) {
          const tool = familyFor(t.item).labTool;
          if (tool === null) continue;
          expect(toolById(tool).lesson, `${code}: ${t.item} → ${tool}`).not.toBe(code);
          expect(toolsFor(code, { earlierOnly: true }).all.map((x) => x.id)).toContain(tool);
        }
  });

  it('every generated question is true: the answer computed apart is graded right, and it can be handed in', () => {
    let n = 0;
    each((level, form, q) => {
      n += 1;
      const a = right(q);
      expect(complete(q, a), `${form}`).toBe(true);
      expect(grade(q, a), `L${level} ${form}: ${JSON.stringify(q).slice(0, 200)}`).toEqual({
        correct: true,
        mistake: null,
      });
      expect(q.prompt).not.toMatch(/undefined|NaN/);
    });
    expect(n).toBe(1200);
  });

  it('keeps each form in its numbers: small products, primes under 30, three different cards with both boxes used', () => {
    each((level, form, q, seed) => {
      if (q.gesture === 'sort') {
        expect(q.cards).toHaveLength(3);
        expect(new Set(q.cards.map((c) => c.text)).size).toBe(3);
        expect(
          q.cards.some((c) => c.bin === 'yes'),
          form,
        ).toBe(true);
        expect(
          q.cards.some((c) => c.bin === 'no'),
          form,
        ).toBe(true);
        for (const c of q.cards) expect(c.bin, `${form} ${c.text}`).toBe(accepts(q, c) ? 'yes' : 'no');
        if (form === 'primes') for (const c of q.cards) expect(c.n).toBeLessThan(30);
        if (form === 'divisible') expect([2, 3, 5]).toContain(q.k);
        // a product is written factor after factor: never with an exponent (that is the lesson's own writing)
        if (form === 'sort') for (const c of q.cards) expect(c.text, c.text).not.toContain('^');
      }
      if (q.calc?.op === 'factor') {
        expect(q.calc.n).toBeLessThanOrEqual(level === 1 ? 50 : 200);
        expect(primeApart(Number(right(q).v))).toBe(true);
        if (seed % 5 === 0 && level === 1) expect(q.tokens.join(' ')).toMatch(/^12 = 2 × 2 × /); // the first question: a win
      }
      if (q.calc?.op === 'pow') {
        expect(q.calc.x * q.calc.e, 'the slip never equals the value (defects.md C17)').not.toBe(
          powApart(q.calc.x, q.calc.e),
        );
        expect(powApart(q.calc.x, q.calc.e)).toBeLessThanOrEqual(32);
      }
    });
  });

  it('a wrong answer names its mistake: 1 or 9 taken for primes, a 6 kept in a product, 2 × 3 for 2³', () => {
    each((level, form, q) => {
      if (q.gesture !== 'sort') return;
      for (const c of q.cards) {
        if (c.trap) {
          expect(MISTAKES[c.trap], c.trap).toBeTruthy();
          expect(c.bin).toBe('no');
          expect(grade(q, { ...right(q), [c.id]: 'yes' }).mistake, c.text).toBeTruthy();
        }
        if (c.miss) expect(grade(q, { ...right(q), [c.id]: 'no' }).mistake).toBe(c.miss);
      }
    });
    const one = { gesture: 'sort', cards: [{ id: 'c1', text: '1', n: 1, bin: 'no', trap: 'one-not-prime' }] };
    expect(grade(one, { c1: 'yes' })).toEqual({ correct: false, mistake: 'one-not-prime' });
    const pow = makeQuestion(rng(3), ITEM, 1, 'power');
    expect(grade(pow, { v: String(pow.calc.x * pow.calc.e) })).toEqual({ correct: false, mistake: 'power-times' });
    const w = makeQuestion(rng(4), ITEM, 1, 'write');
    expect(grade(w, { v: '1' })).toEqual({ correct: false, mistake: 'product-false' });
    expect(pickForm(ITEM, 2)).toBe('sort');
  });

  it('every EASY form the family declares is asked by a launch: a launch that misses everything meets write, primes and power', () => {
    // the order LaunchKit.jsx asks them: the station's first easy question, its second after a miss, the workshop's two
    // (LIKE the missed one: nextForm repeats it), then the capsule's two (level 1, `pickForm`)
    const used = [];
    const ask = (form) => used.push(`1:${form}`) && form;
    ask(pickForm(ITEM, 1, used)); // station 1
    const second = ask(pickForm(ITEM, 1, used)); // station 2, after a miss
    ask(second); // workshop, LIKE the miss
    ask(second);
    const capsule = [ask(pickForm(ITEM, 1, used)), ask(pickForm(ITEM, 1, used))];
    expect(used).toEqual(['1:write', '1:primes', '1:primes', '1:primes', '1:power', '1:write']);
    expect(new Set(used.map((u) => u.slice(2)))).toEqual(new Set(F.forms[1]));
    expect(capsule[0]).not.toBe(capsule[1]);
  });

  it('the worked example is true and answers the mistake shown', () => {
    for (let seed = 1; seed <= 80; seed += 1) {
      for (const level of [1, 2]) {
        const d = F.example(rng(seed), level);
        const m = d.steps.at(-1).match(/\$(\d+) = (\d+(?: \\times \d+)+)\$/);
        expect(decompTrue(m[0]), d.steps.at(-1)).toBe(true);
        // split from its LARGEST prime: never the order of the 3e procedure (the smallest first)
        const first = d.steps[0].match(/^\$(\d+) = (\d+) \\times (\d+)\$/);
        expect(Number(first[2]) * Number(first[3])).toBe(Number(first[1]));
        expect(Math.max(...m[2].split(' \\times ').map(Number))).toBe(Number(first[3]));
      }
      const p = F.example(rng(seed), 1, { mistake: 'power-times' });
      const v = p.steps.at(-1).match(/\$(\d+)\^(\d+) = (\d+)\$, et non \$\d+ \\times \d+ = (\d+)\$/);
      expect(powApart(Number(v[1]), Number(v[2]))).toBe(Number(v[3]));
      expect(Number(v[1]) * Number(v[2])).toBe(Number(v[4]));
      const q = F.example(rng(seed), 1, { mistake: 'odd-not-prime' });
      const c = Number(q.title.match(/\d+/)[0]);
      expect(primeApart(c)).toBe(false);
      expect(c % 2).toBe(1);
      for (const k of [2, 3, 5]) {
        const e = F.example(rng(seed), 2, { k });
        const n = Number(e.title.match(/\d+/)[0]);
        expect(e.steps.at(-1)).toBe(`Donc ${n} ${n % k === 0 ? 'est' : 'n’est pas'} divisible par ${k}.`);
      }
    }
  });

  it('its revision cards say the truth', () => {
    const [prime, divisible, product, value] = F.rules;
    expect(prime.check.primes).toEqual(Array.from({ length: 29 }, (_, i) => i + 1).filter(primeApart));
    expect(prime.example).toContain('2, 3, 5, 7, 11, 13, 17, 19, 23 et 29');
    const { n, yes, no, sum } = divisible.check;
    expect(yes.every((k) => n % k === 0) && no.every((k) => n % k !== 0)).toBe(true);
    expect(
      String(n)
        .split('')
        .reduce((s, d) => s + Number(d), 0),
    ).toBe(sum);
    expect(product.check.factors.reduce((p, x) => p * x, 1)).toBe(product.check.n);
    expect(product.check.factors.every(primeApart)).toBe(true);
    expect(5 * 6).toBe(30);
    expect(powApart(value.check.x, value.check.e)).toBe(value.check.v);
    expect(powApart(3, 2)).toBe(9);
  });

  it('writes French, and no word of the lesson’s keys (it is played BEFORE the lesson)', () => {
    const texts = [...stringsIn({ rules: F.rules, memo: F.memo, name: F.name }), ...F.mistakes.map((m) => MISTAKES[m])];
    for (let seed = 1; seed <= 60; seed += 1)
      for (const level of [1, 2]) {
        for (const form of F.forms[level]) {
          const q = makeQuestion(rng(seed), ITEM, level, form);
          texts.push(q.prompt, ...(q.bins ?? []).map((b) => b.label), ...(q.cards ?? []).map((c) => c.text));
        }
        for (const mistake of [null, ...F.mistakes]) {
          const e = F.example(rng(seed), level, { mistake });
          texts.push(e.title, ...e.steps);
        }
      }
    for (const t of texts) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(t.toLowerCase(), t).not.toMatch(
        /puissance|tableur|s’arrêt|plus petit nombre premier|facteur premier|décompos/,
      );
    }
  });
});

// ───────────────────────── the two tools of « Trouver le PGCD » (3e.m1.r05, 4e.m1.r08) ─────────────────────────
describe('L’échauffement — the two tools of « Trouver le PGCD de deux nombres »', () => {
  const rng = (seed) => {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  /** Everything computed HERE, never read from the family. */
  const primeApart = (n) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
  const divisorsApart = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
  const decompTrue = (text) => {
    const m = text.match(/^\$(\d+) = (\d+(?: \\times \d+)+)\$$/);
    if (!m) return null;
    const fs = m[2].split(' \\times ').map(Number);
    return fs.reduce((p, x) => p * x, 1) === Number(m[1]) && fs.every(primeApart);
  };
  /** « Diviseurs de n : 1, 2 et 4 » → is it the WHOLE list of n's divisors? */
  const listTrue = (text) => {
    const m = text.match(/^Diviseurs de (\d+) : (.+)$/);
    if (!m) return null;
    const list = m[2].split(/, | et /).map(Number);
    return JSON.stringify(list) === JSON.stringify(divisorsApart(Number(m[1])));
  };
  const right = (q) => {
    if (q.gesture === 'sort')
      return Object.fromEntries(q.cards.map((c) => [c.id, (decompTrue(c.text) ?? listTrue(c.text)) ? 'yes' : 'no']));
    const nums = q.tokens.filter((t) => typeof t === 'string' && /^\d+$/.test(t)).map(Number);
    const [n, ...given] = nums;
    const v = Array.from({ length: n }, (_, i) => i + 1).find((x) => given.reduce((p, y) => p * y, x) === n);
    return q.calc ? { v: String(v) } : { q: String(v) };
  };
  const each = (item, fn) => {
    const F = FAMILIES[item];
    for (const level of [1, 2])
      for (const form of F.forms[level])
        for (let seed = 1; seed <= 150; seed += 1)
          fn(level, form, makeQuestion(rng(seed * 7 + level), item, level, form, { first: seed % 5 === 0 }), seed);
  };
  // the words of the PGCD lesson's keys: a warm-up is played BEFORE the lesson
  const KEY_WORDS = /commun|pgcd|plus grand|exposant|puissance|lots? identiques|euclide|algorithme|dernier reste/;

  it('are the two core tools the learning net gives the lesson, in its order, each with its rules and memo', () => {
    const tools = planTools(toolsForLesson('trouver-le-pgcd'), (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.weight])).toEqual([
      ['3e.m1.r05', 'core'],
      ['4e.m1.r08', 'core'],
    ]);
    for (const item of ['3e.m1.r05', '4e.m1.r08']) {
      const F = FAMILIES[item];
      expect(getItem(item)).toBeTruthy();
      expect(F.item).toBe(item);
      expect(F.memo.length).toBeGreaterThanOrEqual(3);
      expect(F.memo.length).toBeLessThanOrEqual(4);
      expect(F.forms[1][0]).toBe('write'); // the first question of a launch is an easy one to write
      expect(F.forms[2][0]).toBe('sort');
      for (const m of F.mistakes) expect(MISTAKES[m], m).toBeTruthy();
    }
    // the instrument of the decomposition's home lesson; the 4e item has no French lesson, so no instrument
    expect(FAMILIES['3e.m1.r05'].labTool).toBe('factor');
    expect(toolById('factor').lesson).toBe('decomposer-en-facteurs-premiers');
    expect(FAMILIES['4e.m1.r08'].labTool).toBeNull();
  });

  it('every generated question is true: the answer computed apart is graded right, and it can be handed in', () => {
    for (const item of ['3e.m1.r05', '4e.m1.r08'])
      each(item, (level, form, q) => {
        const a = right(q);
        expect(complete(q, a), `${item} ${form}`).toBe(true);
        expect(grade(q, a), `${item} L${level} ${form}: ${JSON.stringify(q).slice(0, 200)}`).toEqual({
          correct: true,
          mistake: null,
        });
        expect(q.prompt).not.toMatch(/undefined|NaN/);
        if (q.gesture === 'sort') {
          expect(q.cards).toHaveLength(3);
          expect(new Set(q.cards.map((c) => c.text)).size).toBe(3);
          expect(q.cards.some((c) => c.bin === 'yes') && q.cards.some((c) => c.bin === 'no')).toBe(true);
          for (const c of q.cards) {
            // products factor after factor, never with an exponent (the launch walk reads them so)
            expect(c.text).not.toContain('^');
            if (c.trap) {
              expect(MISTAKES[c.trap], c.trap).toBeTruthy();
              expect(grade(q, { ...a, [c.id]: 'yes' }).mistake, c.text).toBeTruthy();
            }
          }
        }
        if (q.calc?.op === 'factor') {
          expect(primeApart(Number(a.v))).toBe(true);
          expect(q.calc.n).toBeLessThanOrEqual(level === 1 ? 100 : 300);
        }
      });
  });

  it('the very first question is a near-certain win: 24 = 2 × 2 × 2 × ▢; a wrong partner is named', () => {
    const q = makeQuestion(rng(5), '3e.m1.r05', 1, 'write', { first: true });
    expect(q.tokens.join(' ')).toMatch(/^24 = 2 × 2 × 2 × /);
    const w = makeQuestion(rng(9), '4e.m1.r08', 1, 'write');
    expect(grade(w, { q: String(w.a / w.b + 1) })).toEqual({ correct: false, mistake: 'product-false' });
  });

  it('the worked examples are true', () => {
    for (let seed = 1; seed <= 60; seed += 1)
      for (const level of [1, 2]) {
        const d = FAMILIES['3e.m1.r05'].example(rng(seed), level, { mistake: 'not-all-prime' });
        expect(
          decompTrue(
            d.steps
              .at(-1)
              .replace(/^Donc /, '')
              .replace(/\.$/, ''),
          ),
        ).toBe(true);
        for (const step of d.steps.slice(1, -1)) {
          const m = step.match(/^\$(\d+) = (\d+) \\times (\d+)\$, et (\d+) est premier\.$/);
          expect(Number(m[2]) * Number(m[3])).toBe(Number(m[1]));
          expect(primeApart(Number(m[4]))).toBe(true);
        }
        for (const mistake of [null, ...FAMILIES['4e.m1.r08'].mistakes]) {
          const e = FAMILIES['4e.m1.r08'].example(rng(seed), level, { mistake });
          expect(listTrue(e.steps.at(-1).replace(/\.$/, ''))).toBe(true);
          for (const m of e.steps.join(' ').matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
            expect(Number(m[2]) * Number(m[3]) + Number(m[4] ?? 0)).toBe(Number(m[1]));
        }
      }
    const [pairs, , whole] = FAMILIES['4e.m1.r08'].rules;
    expect(pairs.check.b * pairs.check.q).toBe(pairs.check.a);
    expect(whole.check.b * whole.check.q + whole.check.r).toBe(whole.check.a);
    for (const r of FAMILIES['3e.m1.r05'].rules) {
      expect(r.check.factors.reduce((p, x) => p * x, 1)).toBe(r.check.n);
    }
  });

  it('writes French, and no word of the PGCD lesson’s keys (it is played BEFORE the lesson)', () => {
    for (const item of ['3e.m1.r05', '4e.m1.r08']) {
      const F = FAMILIES[item];
      const texts = [
        ...stringsIn({ rules: F.rules, memo: F.memo, name: F.name }),
        ...F.mistakes.map((m) => MISTAKES[m]),
      ];
      for (let seed = 1; seed <= 40; seed += 1)
        for (const level of [1, 2]) {
          for (const form of F.forms[level]) {
            const q = makeQuestion(rng(seed), item, level, form);
            texts.push(q.prompt, ...(q.bins ?? []).map((b) => b.label), ...(q.cards ?? []).map((c) => c.text));
          }
          for (const mistake of [null, ...F.mistakes]) {
            const e = F.example(rng(seed), level, { mistake });
            texts.push(e.title, ...e.steps);
          }
        }
      for (const t of texts) {
        expect(typographyErrors(t), t).toEqual([]);
        expect(t.toLowerCase(), t).not.toMatch(KEY_WORDS);
      }
    }
  });
});
