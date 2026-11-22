import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SCRIPT, BOARD } from './script';
import { MEMO } from './memo';
import { TABLETS, KEYS } from '../world/tablets';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { courtCards, courtShown, courtWords } from '../../../../../../../features/classSession/lessonScripts';
import {
  compare,
  equal,
  minus,
  read,
  rootOf,
  square,
  times,
  write,
} from '../../../../../../common/gameworld/rootCourts/logic';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank';

/** « حصّة القسم » of `natiqa-ghayr-natiqa`: every number the board and the memo say is computed here, never trusted. */
const KINDS = ['court', 'name', 'trace'];
const courts = SCRIPT.steps.filter((s) => s.kind === 'court');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
const said = (s) => [s.title, s.text, s.question, s.after, s.cue].filter(Boolean).join(' ');
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const kindsOf = (s) => Object.fromEntries(courtCards(s).map((c) => [c.key, c.out]));
/** The lesson's world (its index): its keys and rules must be the tablets' — one wording for the world and the board. */
const WORLD = Object.values(import.meta.glob('../world/index.js', { eager: true }))[0] ?? null;

// ── an EXACT evaluator of the board's formulas: « 7{,}28 », \dfrac{…}{…}, ×, +, −, ( ), ^2, \sqrt{…}; =, <, > ──
/** A value: { v } an exact number, or { sq } the square root of an exact number that has none among the numbers. */
const exact = (v) => ({ v });
const sqrtOf = (x) => {
  const r = rootOf(write(x));
  return r == null ? { sq: x } : exact(read(r));
};
const sq = (x) => (x.sq ? x.sq : square(x.v));
const plus = (a, b) => minus(a, minus('0', b));
const over = (a, b) => times(a, { n: read(b).d, d: read(b).n });
/** Reads one formula; null when it holds a letter or anything the board does not write between numbers. */
function evaluate(f) {
  const src = f
    .replace(/\{,\}/g, ',')
    .replace(/\\times/g, '*')
    .replace(/\\;|\\,/g, ' ');
  const t = src.match(/\d+(?:,\d+)?|\\sqrt|\\dfrac|[{}()^*<>=+-]|\S/g) ?? [];
  if (t.some((x) => !/^(\d+(?:,\d+)?|\\sqrt|\\dfrac|[{}()^*<>=+-])$/.test(x))) return null;
  let i = 0;
  const need = (x) => {
    expect(t[i], f).toBe(x);
    i += 1;
  };
  const braced = () => {
    need('{');
    const v = sum(); // eslint-disable-line no-use-before-define
    need('}');
    return v;
  };
  const atom = () => {
    const x = t[i];
    if (x === '(') {
      i += 1;
      const v = sum(); // eslint-disable-line no-use-before-define
      need(')');
      return v;
    }
    if (x === '\\sqrt') {
      i += 1;
      const v = braced();
      expect(v.sq, `${f}: a root of a root`).toBeUndefined();
      return sqrtOf(v.v);
    }
    if (x === '\\dfrac') {
      i += 1;
      const [n, d] = [braced(), braced()];
      return exact(over(n.v, d.v));
    }
    i += 1;
    return exact(read(x));
  };
  const power = () => {
    const v = atom();
    if (t[i] !== '^') return v;
    i += 1;
    const b = t[i] === '{';
    if (b) i += 1;
    need('2');
    if (b) need('}');
    return exact(sq(v));
  };
  const product = () => {
    let v = power();
    while (t[i] === '*') {
      i += 1;
      const w = power();
      v = v.sq && w.sq && equal(v.sq, w.sq) ? exact(v.sq) : exact(times(v.v, w.v));
    }
    return v;
  };
  function sum() {
    let v = product();
    while (t[i] === '+' || t[i] === '-') {
      const op = t[i];
      i += 1;
      const w = product();
      v = exact(op === '+' ? plus(v.v, w.v) : minus(v.v, w.v));
    }
    return v;
  }
  const sides = [sum()];
  const rel = [];
  while (['=', '<', '>'].includes(t[i])) {
    rel.push(t[i]);
    i += 1;
    sides.push(sum());
  }
  expect(i, `${f}: read whole`).toBe(t.length);
  return { sides, rel };
}
/** Is a relation chain true? « = » compares the values, « < » / « > » their squares (every side is positive). */
function holds(f) {
  const e = evaluate(f);
  if (!e || !e.rel.length) return null;
  return e.rel.every((r, k) => {
    const [a, b] = [e.sides[k], e.sides[k + 1]];
    if (r !== '=') return compare(sq(a), sq(b)) === (r === '<' ? -1 : 1);
    if (a.sq || b.sq) return Boolean(a.sq && b.sq && equal(a.sq, b.sq));
    return equal(a.v, b.v);
  });
}
/** Every relation written in these texts is true; how many were checked. */
function allTrue(texts) {
  let n = 0;
  for (const t of texts)
    for (const f of formulas(t)) {
      const h = holds(f);
      if (h === null) continue;
      expect(h, `« ${f} » in « ${t} »`).toBe(true);
      n += 1;
    }
  return n;
}
/** The words a court never speaks (a plank's, the refused name of the rod, a verdict of error). */
const FOREIGN = /(?<![ء-ي])(?:ال|بال|و|ب|ف)?(?:لوح|ألواح|يثبت|ثبت|ينهار|انهار|جسر|جسور|قضيب|خطأ|خاطئ|غلط)(?![ء-ي])/;
/** The rounded value of √a to a step: the neighbour on the side of the wall that the middle mark's platform shows. */
const roundedOf = (lo, hi, a) => (compare(square(times(plus(lo, hi), '0,5')), a) < 0 ? hi : lo);

describe('الأعداد الناطقة والأعداد غير الناطقة — the evaluator of the board’s formulas', () => {
  it('says the truth on hand-worked cases, fractions included', () => {
    expect(holds('\\dfrac{23}{7} \\times \\dfrac{23}{7} = \\dfrac{529}{49}')).toBe(true);
    expect(holds('\\dfrac{23}{49} \\times \\dfrac{23}{49} = \\dfrac{529}{49}')).toBe(false);
    expect(holds('\\dfrac{722}{98} = \\dfrac{361}{49}')).toBe(true);
    expect(holds('8{,}3 < \\sqrt{69} < 8{,}4')).toBe(true);
    expect(holds('8{,}4 < \\sqrt{69}')).toBe(false);
    expect(holds('8{,}35 \\times 8{,}35 > 69')).toBe(true);
    expect(holds('\\sqrt{\\dfrac{48}{75}} = \\dfrac{4}{5}')).toBe(true);
    expect(holds('\\sqrt{14} = 3{,}741657387')).toBe(false);
    expect(holds('\\sqrt{3n}')).toBe(null); // a letter: not judged here
  });
});

describe('الأعداد الناطقة والأعداد غير الناطقة — the script of the lesson on the board', () => {
  it('uses only the kinds of step it needs, with unique ids, a chapter and a short oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('court');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    for (const s of SCRIPT.steps) {
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
      // a fraction is never written with a slash where the class reads: in a formula, with its bar
      for (const k of ['cue', 'question', 'title', 'text', 'after'])
        expect((s[k] ?? '').replace(/\$[^$]+\$/g, ''), `${s.id}.${k}`).not.toMatch(/\d\s*\/\s*\d/);
    }
  });

  it('never names a key before the class has acted: every name follows a court, and nothing before says its name', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(SCRIPT.steps[i - 1].kind, s.id).toBe('court');
    });
    // the names of the keys, as the tablets write them and as a cue could say them
    const words = { [KEYS[0]]: /ناطق/, [KEYS[1]]: /غير ناطق|غير الناطق/, [KEYS[2]]: /مدو/ };
    for (const n of names) {
      const before = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(n));
      const text = before.map(said).join(' ');
      expect(text, n.tablet).not.toContain(TABLETS[n.tablet].title);
      expect(text, n.tablet).not.toMatch(words[n.tablet]);
      // a card's label speaks too
      for (const s of before.filter((x) => x.kind === 'court'))
        for (const c of courtCards(s)) expect(c.label, `${s.id}: ${c.key}`).not.toMatch(words[n.tablet]);
    }
  });

  it('every court’s answer is exactly the cards whose platform rides — and each court shows a band AND a jam', () => {
    expect(courts.map((s) => s.id)).toEqual(['opening', 'unreduced', 'chase', 'tenth', 'hundredth']);
    for (const s of courts) {
      const cards = courtCards(s);
      expect(
        cards.filter((c) => c.out.kind === 'ride').map((c) => c.key),
        s.id,
      ).toEqual(s.answer);
      expect(cards.length, s.id).toBeGreaterThanOrEqual(3);
      expect(cards.length, s.id).toBeLessThanOrEqual(6);
      expect(new Set(cards.map((c) => c.key)).size, s.id).toBe(cards.length);
      const kinds = cards.map((c) => c.out.kind);
      expect(kinds, s.id).toContain('band');
      expect(kinds, s.id).toContain('jam');
      expect(courtShown(s, []), s.id).toBe(false);
      expect(
        courtShown(
          s,
          cards.map((c) => c.key),
        ),
        s.id,
      ).toBe(true);
      expect(s.after, s.id).toContain('$');
    }
  });

  it('🧩 a fraction is a rod: drawn with its bar, never turned into a decimal or reduced on its card', () => {
    const cards = courtCards(step('opening'));
    expect(cards.map((c) => c.key)).toEqual(['23/49', '3', '23/7', '24/7']);
    expect(cards.find((c) => c.key === '23/7').tex).toBe('\\dfrac{23}{7}');
    for (const s of courts)
      for (const c of courtCards(s)) if (c.key.includes('/')) expect(c.tex, `${s.id}: ${c.key}`).toMatch(/^\\dfrac/);
  });

  it('🧩 the side of a fraction court is a fraction whose square is the area — not the side of the numerator alone', () => {
    const { opening: O, unreduced: U } = BOARD;
    const o = kindsOf(step('opening'));
    expect(rootOf(`${O.top}/${O.bottom}`)).toBe(`${O.sideTop}/${O.sideBottom}`);
    expect(rootOf(O.top)).toBe(O.sideTop); // the numerator is a square…
    expect(o[`${O.sideTop}/${O.bottom}`].kind).toBe('band'); // …and its side alone leaves a band
    expect(o[O.whole].kind).toBe('band');
    expect(o[`${O.next}/${O.sideBottom}`].kind).toBe('jam');
    // a fraction NOT reduced, neither of its terms a square: its reduced form is the square of a fraction
    expect([rootOf(U.top), rootOf(U.bottom)]).toEqual([null, null]);
    expect(write(`${U.top}/${U.bottom}`)).toBe(write(square(`${U.sideTop}/${U.sideBottom}`)));
    const u = kindsOf(step('unreduced'));
    expect(u[`${U.sideTop}/${U.sideBottom}`].kind).toBe('ride');
    expect([u[U.low].kind, u[`${U.below}/${U.sideBottom}`].kind, u[U.whole].kind]).toEqual(['band', 'band', 'jam']);
    // the oral question of the naming: a decimal court ridden by a decimal
    expect(rootOf(BOARD.oral.decimal)).toBe('3,7');
  });

  it('♾️ no fraction and not the calculator ride the court of 14: each leaves a band or jams, ever nearer, never zero', () => {
    const { chase: C } = BOARD;
    expect(rootOf(C.area)).toBe(null);
    const cards = courtCards(step('chase'));
    // ever nearer: each fraction's difference (in tiles) smaller than the one before
    const diffs = cards.slice(0, 4).map((c) => c.out.diff);
    for (let k = 1; k < diffs.length; k += 1)
      expect(compare(diffs[k], diffs[k - 1]), diffs.join(' > ')).toBeLessThan(0);
    expect(cards.map((c) => c.out.kind)).toEqual(['band', 'jam', 'band', 'jam', 'jam']);
    // counted in small pieces of side 1/q: p × p against 14 × q × q — a few pieces apart
    expect(write(minus(times(C.area, square(C.b2)), square(C.t2)))).toBe('5');
    expect(write(minus(square(C.t3), times(C.area, square(C.b3))))).toBe('2');
    // the calculator shows ten significant digits of √14, as a calculator rounds them
    expect(Math.sqrt(Number(C.area)).toPrecision(10).replace('.', ',')).toBe(C.calculator);
    expect(cards.at(-1).label).toBe('الحاسبة');
    expect(compare(cards.at(-1).out.diff, '0,00000001')).toBeLessThan(0); // a gap no eye sees: the lens shows it
  });

  it('🎯 the middle mark decides: on 69, the lower tenth is nearer, then the upper hundredth', () => {
    const { marks: M } = BOARD;
    const t = kindsOf(step('tenth'));
    expect([t[M.low].kind, t[M.high].kind, t[M.lo].kind, t[M.hi].kind, t[M.mid].kind]).toEqual([
      'band',
      'jam',
      'band',
      'jam',
      'jam',
    ]);
    expect(write(times(plus(M.lo, M.hi), '0,5'))).toBe(M.mid);
    expect(roundedOf(M.lo, M.hi, M.area)).toBe(M.lo);
    const h = kindsOf(step('hundredth'));
    expect([h[M.lo].kind, h[M.hi2].kind, h[M.mid2].kind]).toEqual(['band', 'jam', 'band']);
    expect(write(times(plus(M.lo, M.hi2), '0,5'))).toBe(M.mid2);
    expect(roundedOf(M.lo, M.hi2, M.area)).toBe(M.hi2);
    // the middle card says what it is; the oral question of the naming: to 1, the middle mark 8,5 jams — the rounded is 8
    expect(courtCards(step('tenth')).at(-1).label).toBe('العلامة الوسطى');
    expect(write(times(plus(M.low, M.high), '0,5'))).toBe(BOARD.oral.half);
    expect(roundedOf(M.low, M.high, M.area)).toBe(M.low);
  });

  it('writes only true relations in what the class reads, every formula in LaTeX', () => {
    const n = allTrue(SCRIPT.steps.flatMap((s) => [s.text, s.after].filter(Boolean)));
    expect(n).toBeGreaterThanOrEqual(9);
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*√]/);
  });

  it('speaks the world’s words only — never a plank’s, never the refused name of the rod, never « wrong »', () => {
    expect('لوح 5').toMatch(FOREIGN);
    expect('الكتابة الوحيدة').not.toMatch(FOREIGN);
    expect(JSON.stringify(SCRIPT)).not.toMatch(FOREIGN);
    expect(JSON.stringify(MEMO)).not.toMatch(FOREIGN);
    for (const s of courts) expect(courtWords(s)).toMatchObject({ ride: 'تركب', band: 'شريط', jam: 'تعلق' });
  });

  it('holds ONE of its numbers a line of code, and uses its OWN numbers: none of a story, of lesson 1’s board, of the bank', () => {
    for (const file of ['./script.js', './memo.js']) {
      const lines = readFileSync(new URL(file, import.meta.url), 'utf8').split('\n');
      const headline = [
        ...Object.values(BOARD).flatMap((g) => Object.values(g)),
        ...['0,1369', '0,3', '0,37', '15', '3,8', '31', '8'],
      ].filter((x) => String(x).length >= 2);
      for (const l of lines) {
        const found = headline.filter((x) => new RegExp(`(?<![0-9,])${x}(?![0-9,])`).test(l));
        expect(new Set(found).size, `${file}: « ${l.trim()} »`).toBeLessThanOrEqual(1);
      }
    }
    // the areas the board lowers platforms into are no court of any story of the platform — this lesson's included
    const areas = [...new Set(courts.flatMap((s) => courtCards(s).map((c) => c.area)))];
    const all = storiesOf();
    expect(all.some((s) => s.file.includes('/natiqa-ghayr-natiqa/world/story.js'))).toBe(true);
    for (const a of areas)
      for (const s of all) expect(s.text, `${a} in ${s.file}`).not.toMatch(new RegExp(`'${a.replace('/', '\\/')}'`));
    // nor lesson 1's board
    const lesson1 = readFileSync(new URL('../../jidhr-tarbii/board/script.js', import.meta.url), 'utf8');
    for (const a of areas) expect(lesson1, a).not.toMatch(new RegExp(`'${a.replace('/', '\\/')}'`));
    // nothing of the exercise bank: the numbers of three digits and more, and the fractions as pairs
    const bank = readBank('natiqa-ghayr-natiqa');
    const stories = storiesOf({ exceptId: 'natiqa-ghayr-natiqa' });
    const { opening: O, unreduced: U, chase: C } = BOARD;
    for (const n of [O.top, U.top, C.t2, C.t3, '10201', '10206', '13456', '13454'])
      expect(collisions(bank, [Number(n)], { stories }).clear, n).toBe(true);
    for (const pair of [
      [O.top, O.bottom],
      [U.top, U.bottom],
      [C.t2, C.b2],
      [C.t3, C.b3],
    ])
      expect(collisions(bank, pair.map(Number), { stories }).clear, pair.join('/')).toBe(true);
  });

  it('names each key with the tablet of the STUDENT’S world: the three keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(KEYS).toEqual(['murabba-natiq', 'la-kasr-yarkab', 'al-mudawwar']);
    expect(WORLD?.lesson, 'the world index of the lesson').toBeTruthy();
    expect(names.map((s) => s.tablet)).toEqual(WORLD.lesson.keys);
    for (const s of names) expect(WORLD.lesson.rules[s.tablet], s.tablet).toBe(TABLETS[s.tablet]);
    for (const s of names) {
      const t = TABLETS[s.tablet];
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet));
    expect(traced.every((id) => TABLETS[id].math.length > 0 && TABLETS[id].math.length <= 2)).toBe(true);
  });
});

describe('الأعداد الناطقة والأعداد غير الناطقة — the written memo', () => {
  it('has every part of a good lesson plan and runs the four moments in a 45-minute hour', () => {
    expect(partKeys()).toHaveLength(9);
    for (const k of [
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'support',
      'extend',
      'next',
      'connect',
      'stands',
    ])
      expect(MEMO[k], k).toBeTruthy();
    expect(MEMO.title).toBe(SCRIPT.title);
    expect(MEMO.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(MEMO.phases.map((p) => p.min)).toEqual(MEMO.glance.minutes.map((m) => m.min));
    expect(JSON.stringify(MEMO)).not.toContain('وضع القسم');
    // the four الكفاءات of the lesson, each with what can be seen
    expect(MEMO.criteria).toHaveLength(4);
  });

  it('writes no formula where the memo page draws plain text', () => {
    const plain = [
      MEMO.glance.goal,
      MEMO.glance.idea,
      MEMO.glance.trap,
      MEMO.stands,
      MEMO.next,
      ...MEMO.sequence,
      ...MEMO.criteria.map((c) => c.can),
      ...MEMO.openings.flatMap((o) => [o.title, o.story, o.ask, o.why, o.expect]),
      ...MEMO.phases.flatMap((p) => [p.name, p.aim, p.teacher, p.class, p.watch]),
    ];
    for (const t of plain) expect(t, t).not.toContain('$');
    for (const t of plain) expect(t, t).not.toMatch(/√\s*\d/);
    for (const t of plain) expect(t, t).not.toMatch(/\d\s*\/\s*\d/); // a fraction in plain text is said « 23 على 7 »
  });

  it('proposes three openings drawn as courts, the board’s one first, every fact computed', () => {
    expect(MEMO.openings.map((o) => o.id)).toEqual(['court', 'small', 'never']);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['court']);
    expect(MEMO.openings.every((o) => o.kind === 'court')).toBe(true);
    const [board] = MEMO.openings;
    expect(board.a).toBe(step('opening').area);
    expect(step('opening').rods).toEqual(expect.arrayContaining([board.b, board.alt]));
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.court.first).toMatchObject({ b: '3', kind: 'band', diff: '88/49' });
    expect(f.court.second).toMatchObject({ b: '23/7', kind: 'ride' });
    expect(f.small.first).toMatchObject({ kind: 'band' });
    expect(f.small.second).toMatchObject({ kind: 'ride' });
    expect(rootOf(f.small.a)).toBe(f.small.second.b);
    expect(f.never.first).toMatchObject({ kind: 'band' });
    expect(f.never.second).toMatchObject({ b: '31/8', kind: 'jam', diff: '0,015625' }); // 31/8 = 3,875
    expect(rootOf(f.never.a)).toBe(null);
    // the story of an opening says its area — a fraction said « 529 على 49 »
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(o.a.replace('/', ' على '));
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward — the wrong ones ARE wrong', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    const { opening: O, unreduced: U, chase: C, marks: M } = BOARD;
    expect(equal(square(`${O.sideTop}/${O.bottom}`), `${O.top}/${O.bottom}`)).toBe(false);
    expect(rootOf(`${U.top}/${U.bottom}`)).not.toBe(null); // « not a square, so no fraction » is wrong
    expect(equal(square(C.calculator), C.area)).toBe(false);
    expect(roundedOf(M.lo, M.hi2, M.area)).not.toBe(M.lo); // « the rounded is the value by default » is wrong here
    expect(holds(`8{,}35 \\times 8{,}35 = 69{,}7225`)).toBe(true);
  });

  it('writes only true relations: the glance, the criteria, the answers, the written trace, the exit ticket', () => {
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.filter((a) => a.kind === 'right').map((a) => a.says),
      MEMO.connect,
      ...MEMO.written,
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      ...MEMO.support,
      ...MEMO.extend,
    ];
    expect(allTrue(texts)).toBeGreaterThanOrEqual(14);
    expect(MEMO.exit).toHaveLength(3);
    // exit: 48/75 = 16/25; 9/40 is reduced and 40 is no square; √62: 7,85² < 62, the rounded is 7,9
    expect(write('48/75')).toBe('0,64');
    expect(rootOf('9/40')).toBe(null);
    expect(roundedOf('7,8', '7,9', '62')).toBe('7,9');
    // the extension: n from 1 to 30 with √(3n) a rational number — 3, 12 and 27
    const { times: k, upTo } = MEMO.extendCheck;
    const ns = Array.from({ length: upTo }, (_, i) => i + 1).filter((n) => rootOf(String(Number(k) * n)) != null);
    expect(ns).toEqual([3, 12, 27]);
    // « only two small pieces »: 116 × 116 against 14 × 31 × 31
    expect(write(minus(square(BOARD.chase.t3), times(BOARD.chase.area, square(BOARD.chase.b3))))).toBe('2');
  });
});
