import { describe, it, expect } from 'vitest';
import { SCRIPT, BOARD } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { TABLETS, KEYS } from '../world/tablets';
import * as WORLD_STORY from '../world/story';
import { COURSE } from '../world/run';
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

/** « حصّة القسم » of `jidhr-tarbii`: every number the board and the memo say is computed here, never trusted. */
const KINDS = ['court', 'name', 'trace'];
const courts = SCRIPT.steps.filter((s) => s.kind === 'court');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const kindsOf = (s) => Object.fromEntries(courtCards(s).map((c) => [c.key, c.out]));

// ── an EXACT evaluator of the board's formulas: numbers « 7{,}28 », ×, +, −, ( ), ^2, \sqrt{…}; relations = and < ──
/** A value: { v } an exact number, or { sq } the square root of an exact number that has none among the numbers. */
const exact = (v) => ({ v });
const sqrtOf = (x) => {
  const r = rootOf(write(x));
  return r == null ? { sq: x } : exact(read(r));
};
const sq = (x) => (x.sq ? x.sq : square(x.v));
const plus = (a, b) => minus(a, minus('0', b));
/** Reads one formula; null when it holds a letter or anything the board does not write between numbers. */
function evaluate(f) {
  const src = f
    .replace(/\{,\}/g, ',')
    .replace(/\\times/g, '*')
    .replace(/\\;|\\,/g, ' ');
  const t = src.match(/\d+(?:,\d+)?|\\sqrt|[{}()^*<=+-]|\S/g) ?? [];
  if (t.some((x) => !/^(\d+(?:,\d+)?|\\sqrt|[{}()^*<=+-])$/.test(x))) return null;
  let i = 0;
  const need = (x) => {
    expect(t[i], f).toBe(x);
    i += 1;
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
      need('{');
      const v = sum(); // eslint-disable-line no-use-before-define
      need('}');
      expect(v.sq, `${f}: a root of a root`).toBeUndefined();
      return sqrtOf(v.v);
    }
    i += 1;
    return exact(read(x));
  };
  const power = () => {
    const v = atom();
    if (t[i] !== '^') return v;
    i += 1;
    const braced = t[i] === '{';
    if (braced) i += 1;
    need('2');
    if (braced) need('}');
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
  while (t[i] === '=' || t[i] === '<') {
    rel.push(t[i]);
    i += 1;
    sides.push(sum());
  }
  expect(i, `${f}: read whole`).toBe(t.length);
  return { sides, rel };
}
/** Is a relation chain true? « = » compares the values, « < » compares their squares (every side is positive). */
function holds(f) {
  const e = evaluate(f);
  if (!e || !e.rel.length) return null;
  return e.rel.every((r, k) => {
    const [a, b] = [e.sides[k], e.sides[k + 1]];
    if (r === '<') return compare(sq(a), sq(b)) < 0;
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
/** The words a court never speaks (a plank's, the forbidden name of the rod, a verdict of error). */
const FOREIGN =
  /(?<![\u0621-\u064A])(?:ال|بال|و|ب|ف)?(?:لوح|ألواح|يثبت|ثبت|ينهار|انهار|جسر|جسور|قضيب|خطأ|خاطئ|غلط)(?![\u0621-\u064A])/;
/** The numbers of the student's world: its courts, its crates, its calculator, the products of its course of gates. */
const GATES = COURSE.map(([a, n]) => a ** n);
const { COURTS, YARD, CALCULATOR, MISSION = {} } = WORLD_STORY; // MISSION: the lesson's problem, when it is written
const STORY = [...Object.values(COURTS), ...YARD, CALCULATOR, ...Object.values(MISSION).map(String)];

describe('الجذر التربيعي لعدد موجب — the evaluator of the board’s formulas', () => {
  it('says the truth on hand-worked cases', () => {
    expect(holds('18 \\times 18 = 324')).toBe(true);
    expect(holds('18 \\times 18 = 325')).toBe(false);
    expect(holds('7{,}28 < \\sqrt{53} < 7{,}29')).toBe(true);
    expect(holds('7{,}29 < \\sqrt{53}')).toBe(false);
    expect(holds('(\\sqrt{61})^2 = 61')).toBe(true);
    expect(holds('\\sqrt{(3{,}4)^2} = \\sqrt{11{,}56} = 3{,}4')).toBe(true);
    expect(holds('\\sqrt{53} = 7{,}28')).toBe(false);
    expect(holds('\\sqrt{a^2} = a')).toBe(null); // a letter: not judged here
    expect(holds('7{,}28')).toBe(null); // no relation
  });
});

describe('الجذر التربيعي لعدد موجب — the script of the lesson on the board', () => {
  it('uses only the kinds of step it needs, with unique ids, a chapter and a short oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('court');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    for (const s of SCRIPT.steps) {
      // a cue longer than about 70 characters is cut in the footer
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
      // what the board draws as plain text holds no formula
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
    }
  });

  it('never names a key before the class has acted: every name follows a court, and nothing before says its name', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(SCRIPT.steps[i - 1].kind, s.id).toBe('court');
    });
    for (const n of names) {
      const before = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(n));
      const said = before.map((s) => [s.title, s.text, s.question, s.after, s.cue].join(' ')).join(' ');
      expect(said, n.tablet).not.toContain(TABLETS[n.tablet].title);
    }
    // before the naming of 🔑: neither « الجذر التربيعي » nor « جذر », nor the sign — in words, in formulas, on a card
    const first = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(names[0]));
    for (const s of first) {
      const said = [s.title, s.text, s.question, s.after, s.cue].join(' ');
      expect(said, s.id).not.toMatch(/جذر|√|\\sqrt/);
      expect(s.rod, s.id).toBeUndefined(); // no rod given — a wall would be drawn with its sign
      for (const c of courtCards(s)) {
        expect(c.rod.root, `${s.id}: ${c.key}`).toBeUndefined();
        expect(c.tex, `${s.id}: ${c.key}`).not.toContain('sqrt');
        expect(c.label, `${s.id}: ${c.key}`).toBe(courtWords(s).card);
      }
    }
  });

  it('every court’s answer is exactly the cards whose platform rides — and each court shows a band AND a jam', () => {
    expect(courts.map((s) => s.id)).toEqual(['opening', 'decimal', 'between', 'calc', 'build', 'take']);
    for (const s of courts) {
      const cards = courtCards(s);
      // the cards whose platform rides, computed by the world's exact law
      expect(
        cards.filter((c) => c.out.kind === 'ride').map((c) => c.key),
        s.id,
      ).toEqual(s.answer);
      expect(cards.length, s.id).toBeGreaterThanOrEqual(3);
      expect(cards.length, s.id).toBeLessThanOrEqual(6); // one column beside the court
      expect(new Set(cards.map((c) => c.key)).size, s.id).toBe(cards.length);
      const kinds = cards.map((c) => c.out.kind);
      expect(kinds, s.id).toContain('band');
      expect(kinds, s.id).toContain('jam');
      // the proof is shown once the riding cards were lowered — or every card, when none rides
      expect(courtShown(s, []), s.id).toBe(false);
      expect(
        courtShown(
          s,
          cards.map((c) => c.key),
        ),
        s.id,
      ).toBe(true);
      expect(s.after, s.id).toContain('$'); // its proof is written
    }
  });

  it('🔑 the side is the number whose square is the area — not half of it, not a quarter of it', () => {
    const o = kindsOf(step('opening'));
    expect(BOARD.opening.area).toBe('324');
    expect(write(square('18'))).toBe('324');
    expect(o['17']).toEqual({ kind: 'band', covers: '289', diff: '35' });
    expect(o['19']).toEqual({ kind: 'jam', covers: '361', diff: '37' });
    expect(write(times('81', '4'))).toBe('324'); // a quarter of the area: the « four sides » slip
    expect(write(times('162', '2'))).toBe('324'); // half of the area
    expect([o['81'].kind, o['162'].kind]).toEqual(['jam', 'jam']);
    const d = kindsOf(step('decimal'));
    expect(write(square('4,2'))).toBe('17,64');
    expect(write(times('8,82', '2'))).toBe('17,64');
    expect(d['4']).toEqual({ kind: 'band', covers: '16', diff: '1,64' });
    expect(d['4,1'].kind).toBe('band');
    expect(d['4,3'].kind).toBe('jam');
    expect(d['8,82'].kind).toBe('jam');
    expect(rootOf('17,64')).toBe('4,2');
  });

  it('✍️ no rod of tenths nor of hundredths rides 53; the calculator’s ten digits leave a band; the wall rides', () => {
    expect(rootOf('53')).toBe(null);
    const b = kindsOf(step('between'));
    expect(b['7']).toEqual({ kind: 'band', covers: '49', diff: '4' });
    expect(b['8']).toEqual({ kind: 'jam', covers: '64', diff: '11' });
    expect(b['7,2']).toEqual({ kind: 'band', covers: '51,84', diff: '1,16' });
    expect(b['7,3']).toEqual({ kind: 'jam', covers: '53,29', diff: '0,29' });
    // the calculator shows ten significant digits of √53, cut as a calculator rounds them
    expect(Math.sqrt(53).toPrecision(10).replace('.', ',')).toBe(BOARD.calc.calculator);
    const c = kindsOf(step('calc'));
    expect(c['7,28']).toEqual({ kind: 'band', covers: '52,9984', diff: '0,0016' });
    expect(c['7,29']).toEqual({ kind: 'jam', covers: '53,1441', diff: '0,1441' });
    expect(c[BOARD.calc.calculator].kind).toBe('band');
    expect(compare(c[BOARD.calc.calculator].diff, '0,0000001')).toBeLessThan(0); // a band no eye sees
    expect(c['√53'].kind).toBe('ride');
    const labels = Object.fromEntries(courtCards(step('calc')).map((x) => [x.key, x.label]));
    expect(labels[BOARD.calc.calculator]).toBe('الحاسبة');
    expect(labels['√53']).toBe('ضلع الساحة');
    // the oral question of the name: 7,29 is the value by excess to 0,01
    expect(compare(square('7,28'), '53') < 0 && compare(square('7,29'), '53') > 0).toBe(true);
  });

  it('🔁 the platform on √61 rides exactly the court of 61; a court built on 3,4 is ridden by 3,4', () => {
    const u = kindsOf(step('build'));
    expect(step('build').rod).toEqual({ root: '61' });
    expect(u['61'].kind).toBe('ride');
    expect(u['30,5']).toEqual({ kind: 'jam', covers: '61', diff: '30,5' });
    expect(u['122']).toEqual({ kind: 'band', covers: '61', diff: '61' });
    expect(u['3721']).toEqual({ kind: 'band', covers: '61', diff: '3660' });
    expect(write(square('61'))).toBe('3721');
    expect(write(times('30,5', '2'))).toBe('61');
    const t = kindsOf(step('take'));
    expect(write(square(BOARD.take.rod))).toBe(BOARD.take.area);
    expect(t['3,4'].kind).toBe('ride');
    expect(t['1,7']).toEqual({ kind: 'band', covers: '2,89', diff: '8,67' });
    expect(write(times('1,7', '2'))).toBe('3,4');
    expect(write(times('5,78', '2'))).toBe('11,56');
    expect([t['5,78'].kind, t['11,56'].kind]).toEqual(['jam', 'jam']);
  });

  it('writes only true relations in what the class reads, and its oral questions are true', () => {
    const n = allTrue(SCRIPT.steps.flatMap((s) => [s.text, s.after].filter(Boolean)));
    expect(n).toBeGreaterThanOrEqual(9);
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*√]/); // LaTeX, never a raw sign
    expect(write(square('33'))).toBe('1089'); // name-1: the court of 1089
    expect(rootOf(write(square('438')))).toBe('438'); // the oral question of « take »
  });

  it('speaks the world’s words only — never a plank’s, never the refused name of the rod, never « wrong »', () => {
    expect('لوح 5').toMatch(FOREIGN);
    expect('الجسر ينهار').toMatch(FOREIGN);
    expect('الكتابة الوحيدة').not.toMatch(FOREIGN); // a word that only holds the letters
    expect(JSON.stringify(SCRIPT)).not.toMatch(FOREIGN);
    expect(JSON.stringify(MEMO)).not.toMatch(FOREIGN);
    for (const s of courts) expect(courtWords(s)).toMatchObject({ ride: 'تركب', band: 'شريط', jam: 'تعلق' });
  });

  it('uses its OWN numbers: no court of the student’s story or of the course of gates, nothing of the bank', () => {
    const areas = courts.flatMap((s) => courtCards(s).map((c) => c.area));
    for (const a of areas) {
      expect(STORY, a).not.toContain(a);
      expect(GATES.map(String), a).not.toContain(a);
    }
    const said = JSON.stringify(SCRIPT);
    for (const x of STORY)
      expect(said, x).not.toMatch(new RegExp(`(?<![0-9,])${x.replace(',', '\\{?,\\}?')}(?![0-9,])`));
    const bank = readBank('jidhr-tarbii');
    const stories = storiesOf({ exceptId: 'jidhr-tarbii' });
    for (const n of [324, 162, 1089, 438, 3721, 122, 1444])
      expect(collisions(bank, [n], { stories }).clear, `${n}`).toBe(true);
  });

  it('names each key with the tablet of the STUDENT’S world: the three keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(names.map((s) => s.tablet)).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the three keys, in order
    expect(traced.every((id) => lesson.rules[id].math.length > 0)).toBe(true);
  });
});

describe('الجذر التربيعي لعدد موجب — the written memo', () => {
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
    // the sign √ glued to a number in plain Arabic text would be turned round by the bidi algorithm
    for (const t of plain) expect(t, t).not.toMatch(/√\s*\d/);
  });

  it('proposes three openings drawn as courts, the board’s one first, every fact computed', () => {
    expect(MEMO.openings.map((o) => o.id)).toEqual(['court', 'yard', 'fountain']);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['court']);
    expect(MEMO.openings.every((o) => o.kind === 'court')).toBe(true);
    const [board] = MEMO.openings;
    expect(board.a).toBe(step('opening').area); // the memo's board opening IS the script's
    expect(step('opening').rods).toEqual(expect.arrayContaining([board.b, board.alt]));
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(o.a);
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.court.first).toMatchObject({ b: '17', kind: 'band', diff: '35', exact: false });
    expect(f.court.second).toMatchObject({ b: '18', kind: 'ride', exact: true });
    expect(f.yard.first).toMatchObject({ kind: 'band', diff: '2' });
    expect(f.yard.second).toMatchObject({ kind: 'jam', diff: '11' });
    expect(f.fountain.first).toMatchObject({ kind: 'band', diff: '0,75' });
    expect(f.fountain.second).toMatchObject({ kind: 'ride' });
    expect(rootOf('38')).toBe(null);
    for (const o of MEMO.openings) expect(STORY, o.id).not.toContain(o.a);
    // the expected answers say the facts the figure draws
    expect(board.expect).toContain(`شريط مساحته ${f.court.first.diff} بلاطة`);
    expect(MEMO.openings[2].expect).toContain(`شريطًا مساحته ${f.fountain.first.diff} بلاطة`);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward — the wrong ones ARE wrong', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    expect(equal(square('162'), '324')).toBe(false);
    expect(equal(square('81'), '324')).toBe(false);
    expect(equal(square(BOARD.calc.calculator), '53')).toBe(false);
    expect(holds('(\\sqrt{61})^2 = 3721')).toBe(false);
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
    expect(allTrue(texts)).toBeGreaterThanOrEqual(12);
    expect(MEMO.exit).toHaveLength(3);
    expect(write(square('33'))).toBe('1089');
    expect(compare(square('4,6'), '22') < 0 && compare(square('4,7'), '22') > 0).toBe(true);
    // the extension: a right triangle of legs 5 and 6 — its hypotenuse is √61, 7,8 by default to 0,1
    const { legs, root, below } = MEMO.extendCheck;
    expect(write(plus(square(String(legs[0])), square(String(legs[1]))))).toBe(root);
    expect(compare(square(below), root) < 0 && compare(square(minus(below, '-0,1')), root) > 0).toBe(true);
  });
});
