import { describe, it, expect } from 'vitest';
import { BOARD, KEYS, SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, askWords, fills } from '../../../../../../../features/classSession/lessonScripts';
import { outcome } from '../../../../../../common/gameworld/divisorIsles/ruleForge';

/** « حصّة القسم » of lesson 5: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const common = (a, b) => divisors(a).filter((d) => b % d === 0);
/** A list as the board prints it: a no-break space BEFORE each comma, so a line never starts with « ، ». */
const listAr = (xs) => xs.join(' ، ');
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** « 1 ، 2 ، 3 » (no-break space before the comma) read back as numbers. */
const listOf = (text) => text.split('،').map((x) => Number(x.trim()));
/** An arithmetic side (digits, + − × and parentheses) evaluated by a small parser; null when it holds anything else. */
function value(side) {
  if (!/^[\d\s+\-*()]+$/.test(side)) return null;
  const t = side.match(/\d+|[-+*()]/g);
  let i = 0;
  const factor = () => {
    if (t[i] !== '(') return Number(t[i++]);
    i += 1;
    const v = sum(); // eslint-disable-line no-use-before-define
    i += 1;
    return v;
  };
  const product = () => {
    let v = factor();
    while (t[i] === '*') {
      i += 1;
      v *= factor();
    }
    return v;
  };
  function sum() {
    let v = product();
    while (t[i] === '+' || t[i] === '-') {
      const op = t[i];
      i += 1;
      const w = product();
      v = op === '+' ? v + w : v - w;
    }
    return v;
  }
  const v = sum();
  expect(i, side).toBe(t.length); // the whole side was read
  return v;
}
/**
 * The truth of an equality written in LaTeX: every arithmetic side of « x = y = z » evaluated, all equal; and every
 * « PGCD(a ; b) = g » re-computed. Sides holding a letter are skipped.
 */
function checkEquality(f) {
  for (const m of f.matchAll(/\\mathrm\{PGCD\}\((\d+) ; (\d+)\) = (\d+)/g))
    expect(gcd(Number(m[1]), Number(m[2])), m[0]).toBe(Number(m[3]));
  if (!f.includes('=')) return;
  const v = f
    .replace(/\\times/g, '*')
    .split('=')
    .map((x) => value(x.trim()))
    .filter((x) => x !== null);
  for (const x of v) expect(x, f).toBe(v[0]);
}
const said = (s) => [s.title, s.text, s.question, s.after].filter(Boolean).join(' ');
/** Every number written in a text, formulas included. */
const numbersIn = (text) => [...String(text).matchAll(/\d+/g)].map((m) => Number(m[0]));

const {
  streams: [A, B],
  first: F,
  same: S,
  zero: Z,
  nest: N,
  against: V,
} = BOARD;

/** The pairs the lesson's exercise bank computes a PGCD of (content/practice/4am/tayin-pgcd, read 2026-11-19). */
const BANK = [
  [0, 7], [0, 45], [0, 91], [8, 40], [8, 88], [13, 143], [15, 30], [15, 35], [15, 45], [15, 50], [18, 36], [21, 35],
  [21, 42], [21, 84], [27, 30], [28, 28], [32, 96], [36, 54], [36, 60], [39, 65], [42, 60], [42, 98], [42, 168],
  [45, 45], [45, 180], [45, 270], [48, 72], [48, 144], [48, 240], [49, 63], [51, 85], [52, 91], [52, 117], [54, 81],
  [57, 95], [63, 105], [68, 119], [72, 120], [75, 90], [75, 180], [77, 121], [84, 112], [84, 252], [85, 204],
  [88, 120], [90, 150], [91, 91], [96, 144], [99, 176], [104, 156], [105, 135], [108, 156], [108, 324], [112, 120],
  [120, 168], [120, 200], [133, 171], [135, 360], [140, 210], [150, 600], [156, 234], [165, 275], [168, 252],
  [180, 720], [250, 1000],
]; // prettier-ignore
const same = (p, q) => (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);

describe('تعيين القاسم المشترك الأكبر — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and an oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps).toHaveLength(13);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(2);
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // forged in the world
    // what the board draws as plain text holds no formula (the cue, the question, the title)
    for (const s of SCRIPT.steps)
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
  });

  it('never names a key before the class has acted on it: every name follows an « ask », and nothing before says it', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(['ask', 'statements', 'forge'], s.id).toContain(SCRIPT.steps[i - 1].kind);
    });
    for (const n of names) {
      const at = SCRIPT.steps.indexOf(n);
      const before = SCRIPT.steps
        .slice(0, at)
        .map((s) => `${said(s)} ${s.cue}`)
        .join(' ');
      expect(before, n.tablet).not.toContain(TABLETS[n.tablet].title);
      // the cue of a name station is read WITH its tablet: it may hold the name, the stations before may not
    }
    // the names the design gives the three keys (BATCH_2_DESIGN.md §7), whatever the tablets' wording becomes
    const plain = (i) =>
      SCRIPT.steps
        .slice(0, SCRIPT.steps.indexOf(names[i]))
        .map((s) => `${said(s)} ${s.cue}`)
        .join(' ');
    expect(plain(0)).not.toMatch(/احصر|قاطع/);
    expect(plain(1)).not.toMatch(/نتائج مباشرة/);
    expect(plain(2)).not.toMatch(/يقسم الأصغر الأكبر|عندما يقسم/);
  });

  it('opens on the carpenter of the board, with his own numbers — never the student’s story nor the bank', () => {
    const { bridge } = step('situation');
    expect(bridge).toEqual({ a: A, b: F });
    expect([A, B, F]).toEqual([40, 56, 10]);
    expect(outcome(A, F).held).toBe(true); // the plank 10 fills the first stream: 4 planks
    expect(B % F).toBe(6); // … and leaves 6 cells of the second: the question of the hour
    // the story's numbers are the world's, never the board's
    const story = new Set(numbersIn(JSON.stringify(NUMBERS)));
    const pairs = [
      [A, B],
      [S.gap, S.gap],
      [Z.gap, 0],
      [N.small, N.big],
      [V.small, V.big],
    ];
    for (const [x, y] of pairs) expect(story.has(x) && story.has(y), `${x} ; ${y} in the story`).toBe(false);
    for (const n of [A, B, S.gap, Z.gap, N.big, V.small, V.big]) expect(story.has(n), `${n} in the story`).toBe(false);
  });

  it('every answer of an « ask » is exactly the planks that fill its gap — and the planks of the KEY it leads to', () => {
    expect(ask.map((s) => s.id)).toEqual(['list-a', 'list-b', 'cross', 'same', 'zero', 'nest', 'against']);
    for (const s of ask) {
      expect(
        s.options.filter((o) => fills(s, o)),
        s.id,
      ).toEqual(s.answer);
      expect(
        s.options.filter((o) => outcome(s.a, o).held),
        s.id,
      ).toEqual(s.answer); // the bridges the board draws as holding
      expect(askRight(s, [...s.answer].reverse()), s.id).toBe(true);
      expect(askRight(s, s.options), s.id).toBe(false); // picking every plank is not the answer
      expect(s.answer.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.options.length, s.id).toBeLessThanOrEqual(6); // one row on the board
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.text + s.after, s.id).toContain('$'); // its proof is written
      expect(s.words, `${s.id}: every question is about planks over a stream`).toBeUndefined();
      expect(askWords(s)).toEqual({ card: 'لوح', held: 'يثبت', fell: 'ينهار' });
    }
    // 📋 list-a / list-b: the planks after 1 and 2, up to the last whose square does not pass the stream
    const la = step('list-a');
    expect(la.options).toEqual([3, 4, 5, 6]);
    expect(Math.floor(Math.sqrt(A))).toBe(6);
    expect(la.answer).toEqual([4, 5]);
    expect(la.after).toContain(`قواسم ${A} هي ${listAr(divisors(A))}`);
    expect(la.after).toContain('40 = 4 \\times 10 = 5 \\times 8');
    expect(la.after).toContain('40 = 3 \\times 13 + 1 = 6 \\times 6 + 4');
    expect(la.after).toContain('7 \\times 7 = 49');
    expect(la.cue).toContain('قبل 7');
    expect(la.cue).toContain('8 و 10'); // the partners of 5 and 4
    const lb = step('list-b');
    expect(lb.options).toEqual([3, 4, 5, 6, 7]);
    expect(Math.floor(Math.sqrt(B))).toBe(7);
    expect(lb.answer).toEqual([4, 7]);
    expect(lb.after).toContain(`قواسم ${B} هي ${listAr(divisors(B))}`);
    expect(lb.after).toContain('56 = 3 \\times 18 + 2 = 5 \\times 11 + 1 = 6 \\times 9 + 2');
    expect(lb.after).toContain('8 \\times 8 = 64');
    // the two lists, read from the planks found by pairs, ARE the divisors
    for (const [n, st] of [
      [A, la],
      [B, lb],
    ]) {
      const small = [1, 2, ...st.answer];
      expect([...new Set([...small, ...small.map((d) => n / d)])].sort((x, y) => x - y)).toEqual(divisors(n));
    }
    // 📋 cross: the planks of 40 from 4 up tried on 56; 1 and 2 given; the common ones and the longest
    const cross = step('cross');
    expect(cross.options).toEqual(divisors(A).filter((d) => d >= 4));
    expect(cross.answer).toEqual([4, 8]);
    expect([1, 2, ...cross.answer]).toEqual(common(A, B));
    expect(cross.after).toContain(listAr(common(A, B)));
    expect(cross.after).toContain('5 و 10 و 20 و 40 ليست');
    expect(gcd(A, B)).toBe(8);
    // ⚡ same: two streams of 35; ⚡ zero: 26 and a stream of 0 cells — every plank « fills » 0
    expect(step('same').answer).toEqual([5, 7, 35]);
    expect(step('same').answer).toEqual(step('same').options.filter((o) => common(S.gap, S.gap).includes(o)));
    const zero = step('zero');
    expect(zero.answer).toEqual([2, 13, 26]);
    expect(zero.options.every((o) => 0 % o === 0)).toBe(true); // they all fill the stream filled in
    expect(zero.options.filter((o) => Z.gap % o !== 0)).toEqual([4, 52]);
    expect(zero.text).toContain('0 = 4 \\times 0 = 52 \\times 0');
    expect(zero.after).toContain(listAr(divisors(Z.gap)));
    expect(zero.after).toContain('\\mathrm{PGCD}(56 ; 40) = 8'); // the order of the two numbers
    // 🎯 nest: 14 divides 70 — the planks of 70 that fill 14 are the planks of 14; the longest is 14 itself
    const nest = step('nest');
    expect(N.big % N.small).toBe(0);
    expect(nest.options.every((o) => N.big % o === 0)).toBe(true);
    expect(nest.answer).toEqual([2, 7, 14]);
    expect([1, ...nest.answer]).toEqual(divisors(N.small));
    expect(common(N.small, N.big)).toEqual(divisors(N.small));
    expect(nest.text).toContain('70 = 1 \\times 70 = 2 \\times 35 = 5 \\times 14 = 7 \\times 10');
    // 🎯 against: 24 does not divide 60 — the planks of 24 that fill 60 stop at 12
    const against = step('against');
    expect(V.big % V.small).not.toBe(0);
    expect(against.options).toEqual(divisors(V.small).filter((d) => d >= 3));
    expect(against.answer).toEqual([3, 4, 6, 12]);
    expect([1, 2, ...against.answer]).toEqual(common(V.small, V.big));
    expect(against.after).toContain('60 = 24 \\times 2 + 12 = 8 \\times 7 + 4');
    expect(against.after).toContain('اللوحان 24 و 8 لا يملآن 60');
    expect(gcd(V.small, V.big)).toBe(12);
  });

  it('writes only true equalities in what the class reads (situation, questions, what comes after)', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          checkEquality(f);
          n += 1;
        }
    expect(n).toBeGreaterThanOrEqual(20);
    // the formulas are LaTeX: « \\times », never a raw « × » or « * »
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*]/);
    // a number of cells agrees with its noun (11 and more: « خانة »)
    expect(step('situation').text).toContain('الأولى 40 خانة والثانية 56 خانة');
    expect(step('nest').text).toContain('14 خانة و 70 خانة');
    // every list of the board is a true list of divisors
    let lists = 0;
    for (const s of SCRIPT.steps)
      for (const m of said(s).matchAll(/قواسم (\d+) هي ([\d ،\s]+\d)/g)) {
        expect(listOf(m[2]), m[0]).toEqual(divisors(Number(m[1])));
        lists += 1;
      }
    expect(lists).toBeGreaterThanOrEqual(5);
    // a list is joined with a no-break space BEFORE its comma: never a plain space there
    for (const s of SCRIPT.steps) expect(said(s), s.id).not.toMatch(/\d ،/);
  });

  it('keeps every oral question inside its footer and every tablet inside its card (CLASS_SESSION.md §5ter)', () => {
    for (const s of SCRIPT.steps)
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
    // a Latin name inside an Arabic cue would be scrambled by the bidi algorithm: the cues say it in Arabic
    for (const s of SCRIPT.steps) expect(s.cue, s.id).not.toMatch(/PGCD/);
    const drawn = (tex) =>
      tex
        .replace(/\\times/g, '×')
        .replace(/\\(geq|leq)/g, '≥')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    for (const [key, t] of Object.entries(TABLETS)) {
      expect(t.math.length, key).toBeGreaterThanOrEqual(1);
      expect(t.math.length, key).toBeLessThanOrEqual(2);
      for (const row of t.math)
        expect(drawn(row.replace('\\qquad', '  ')).length, `${key}: ${row}`).toBeLessThanOrEqual(28);
    }
  });

  it('asks oral questions whose numbers are true', () => {
    expect(gcd(12, 30)).toBe(6); // name-1
    expect(common(12, 30)).toEqual([1, 2, 3, 6]);
    expect(gcd(9, 9)).toBe(9); // name-2
    expect(gcd(9, 0)).toBe(9);
    expect(91 % 13).toBe(0); // name-3: 13 divides 91, PGCD 13
    expect(gcd(13, 91)).toBe(13);
    expect(Z.gap % 52).not.toBe(0); // the cue of « zero »: 52 does not fill 26, and it divides 0
    expect(0 % 52).toBe(0);
    expect(step('zero').cue).toContain('اللوح 52 الساقية 26');
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the three keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(KEYS).toEqual(lesson.keys); // the board and the world name the same keys
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the three keys, in order
  });
});

describe('تعيين القاسم المشترك الأكبر — the written memo', () => {
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
    expect(MEMO.criteria).toHaveLength(3); // one per الكفاءة of the lesson (P1–P3)
    expect(MEMO.written).toHaveLength(3); // one per key
    expect(JSON.stringify(MEMO)).not.toContain('وضع القسم');
    expect(JSON.stringify(MEMO)).not.toMatch(/نقطة التعلّم|الكتاب المدرسي|DA\b/);
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
      ...MEMO.anticipated.flatMap((a) => [a.assess, a.advance]),
    ];
    for (const t of plain) expect(t, t).not.toContain('$');
  });

  it('proposes four openings with a different drawing each, the board’s one among them, numbers true', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject({ a: step('situation').bridge.a, b: step('situation').bridge.b });
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(String(o.a));
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    // bridge: 40 cells, planks of 10: 4 planks, nothing left (« 4 ألواح »)
    expect(f.bridge.first).toMatchObject({ q: 4, r: 0, exact: true });
    expect(MEMO.openings[0].expect).toContain('4 ألواح');
    // teams: 28 and 63 players share only 1 and 7; 4 teams fit 28 and not 63
    expect(common(28, 63)).toEqual([1, 7]);
    expect([divisors(28).length, divisors(63).length]).toEqual([6, 6]);
    expect(f.teams.first).toMatchObject({ b: 4, q: 7, r: 0, exact: true });
    expect(63 % 4).not.toBe(0);
    // shelves: 135 stories and 45 science books — 45 divides 135; shelves of 10 leave 5 stories, shelves of 9 are full
    expect(135 % 45).toBe(0);
    expect(gcd(135, 45)).toBe(45);
    expect(f.shelves.first).toMatchObject({ b: 10, q: 13, r: 5, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 9, q: 15, r: 0, exact: true });
    expect(45 % 9).toBe(0);
    expect(MEMO.openings[2].expect).toContain('تبقى 5 قصص');
    // tiles: 90 cm and 66 cm, PGCD 6; tiles of 20 leave 10 cm, tiles of 18 fit 90 and not 66
    expect(gcd(90, 66)).toBe(6);
    expect(f.tiles.first).toMatchObject({ b: 20, q: 4, r: 10, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 18, q: 5, r: 0, exact: true });
    expect(66 % 18).not.toBe(0);
    // the drawings write « N ألواح / بلاطات », « N فِرق » and « N رفًّا »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
    expect(f.teams.first.b).toBeGreaterThanOrEqual(3);
    expect(f.teams.first.b).toBeLessThanOrEqual(10);
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misconceptions are really false: 4 is not the greatest common one, 24 does not divide 60, PGCD(26 ; 0) is not
    // 0, and the list of 40 without the partners is short
    expect(Math.max(...common(A, B))).toBeGreaterThan(4);
    expect(common(A, B)[2]).toBe(4); // « the first after 1 and 2 »
    expect(V.big % V.small).not.toBe(0);
    expect(gcd(Z.gap, 0)).not.toBe(0);
    expect(divisors(A).length).toBeGreaterThan(4);
    expect(MEMO.anticipated.find((a) => a.kind === 'miss' && a.says.includes(`قواسم ${A}`)).says).toContain(
      '1، 2، 4، 5',
    );
  });

  it('writes only true equalities and lists: the criteria, the glance, the exit ticket, the extension', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.map((a) => a.says),
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      MEMO.connect,
    ];
    let n = 0;
    for (const t of texts)
      for (const f of formulas(t)) {
        checkEquality(f);
        n += 1;
      }
    expect(n).toBeGreaterThanOrEqual(12);
    expect(MEMO.criteria[0].see).toContain(listAr(divisors(A)));
    expect(MEMO.criteria[0].see).toContain(listAr(divisors(B)));
    expect(MEMO.criteria[0].see).toContain(listAr(common(A, B)));
    expect(MEMO.criteria[2].see).toContain('70 = 14 \\times 5');
    expect(MEMO.exit).toHaveLength(3);
    // exit 1: 20 and 32 by their lists
    expect(MEMO.exit[0].a).toContain(listAr(divisors(20)));
    expect(MEMO.exit[0].a).toContain(listAr(divisors(32)));
    expect(MEMO.exit[0].a).toContain(listAr(common(20, 32)));
    expect(common(20, 32)).toEqual([1, 2, 4]);
    // exit 2 and 3: the direct results, the smaller dividing the greater
    expect(MEMO.exit[1].a).toContain('\\mathrm{PGCD}(23 ; 0) = 23');
    expect(75 % 15).toBe(0);
    // the extension: one number divides the other and their PGCD is 13 — so the smaller IS 13, the greater a multiple
    // of 13 above 50: 52, 65, 78 … (more than one pair)
    const { g, least, streams } = MEMO.extendCheck;
    expect(MEMO.extend[0]).toContain(String(g));
    const pairs = [];
    for (let x = 1; x <= 200; x += 1)
      for (let y = x; y <= 200; y += 1) if (y % x === 0 && y > 50 && gcd(x, y) === g) pairs.push([x, y]);
    expect(pairs.length).toBeGreaterThan(1);
    expect(pairs.every(([x]) => x === g)).toBe(true);
    expect(pairs[0]).toEqual([13, 52]);
    expect(streams).toEqual([A, B]);
    expect(MEMO.extend[2]).toContain(`${least}`);
    expect(common(A, B).filter((d) => d >= least)).toEqual([4, 8]);
    // the support: 12 and 18 share 1, 2, 3, 6
    expect(common(12, 18)).toEqual([1, 2, 3, 6]);
  });

  it('uses no pair of the lesson’s exercise bank (the board and the memo are the platform’s own numbers)', () => {
    const ours = [
      [A, B],
      [S.gap, S.gap],
      [Z.gap, 0],
      [N.small, N.big],
      [V.small, V.big],
      [28, 63],
      [135, 45],
      [90, 66],
      [20, 32],
      [23, 23],
      [23, 0],
      [75, 15],
      [12, 30],
      [9, 9],
      [9, 0],
      [13, 91],
      [12, 18],
    ];
    for (const p of ours)
      expect(
        BANK.some((q) => same(p, q)),
        p.join(' ; '),
      ).toBe(false);
  });
});
