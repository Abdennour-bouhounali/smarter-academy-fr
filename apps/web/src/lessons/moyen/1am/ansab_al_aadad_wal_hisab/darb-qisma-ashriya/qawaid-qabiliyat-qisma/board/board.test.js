import { describe, it, expect } from 'vitest';
import { NOTEBOOK, SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, STONE, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, fills } from '../../../../../../../features/classSession/lessonScripts';

/** « حصّة القسم » of « قواعد قابلية القسمة »: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const sides = (f) =>
  f
    .replace(/\\times/g, '*')
    .split('=')
    .map((x) => x.trim());
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
/** Every side of « x = y = z » that is arithmetic evaluates to the same number; returns how many sides were checked. */
function checkEquality(f) {
  if (!f.includes('=')) return 0;
  const v = sides(f)
    .map(value)
    .filter((x) => x !== null);
  for (const x of v) expect(x, f).toBe(v[0]);
  return v.length;
}

/** The four keys, read from the DIGITS only — what the class is to find; the board's verdicts must agree with them. */
const digitsOf = (n) => String(n).split('').map(Number);
const digitSum = (n) => digitsOf(n).reduce((t, x) => t + x, 0);
const byDigits = {
  2: (n) => [0, 2, 4, 6, 8].includes(n % 10),
  5: (n) => [0, 5].includes(n % 10),
  3: (n) => digitSum(n) % 3 === 0,
  9: (n) => digitSum(n) % 9 === 0,
  4: (n) => (n % 100) % 4 === 0,
};

const { units: U, sum: S, last2: L, boss: B } = NUMBERS;
const N = NOTEBOOK;
const said = (s) => [s.title, s.text, s.question, s.after].filter(Boolean).join(' ');

describe('قواعد قابلية القسمة — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and a short oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(SCRIPT.steps.length).toBeGreaterThanOrEqual(11);
    expect(SCRIPT.steps.length).toBeLessThanOrEqual(13);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    // a long cue is cut in the footer at 1024 px (CLASS_SESSION.md §5ter)
    for (const s of SCRIPT.steps) expect(s.cue.length, `${s.id}: ${s.cue}`).toBeLessThanOrEqual(70);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(2);
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // the pilot's mirror
    for (const s of SCRIPT.steps)
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
  });

  it('never names a key before the class has acted on it: every name follows an « ask », and nothing before tells it', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(SCRIPT.steps[i - 1].kind, s.id).toBe('ask');
    });
    for (const n of names) {
      const before = SCRIPT.steps
        .slice(0, SCRIPT.steps.indexOf(n))
        .map((s) => [said(s), s.cue].join(' '))
        .join(' ');
      const t = TABLETS[n.tablet];
      expect(before, n.tablet).not.toContain(t.title);
      for (const line of t.lines) expect(before, n.tablet).not.toContain(line); // no sentence of the rule is read before
    }
  });

  it('opens on the first gap of the story, and the bridge holds', () => {
    const { bridge } = step('situation');
    expect(bridge).toEqual({ a: U.gaps[0], b: U.planks[0] });
    expect(bridge).toEqual({ a: 35, b: 5 });
    expect(bridge.a % bridge.b).toBe(0);
    expect(step('situation').text).toContain(String(B.gap));
  });

  it('Zero’s notebook tells only true facts, and its facts carry the pattern the class is to find', () => {
    expect(N.five.every((n) => n % 5 === 0)).toBe(true);
    expect(N.two.every((n) => n % 2 === 0)).toBe(true);
    expect(N.none % 2 !== 0 && N.none % 5 !== 0).toBe(true);
    expect(N.five).toContain(U.gaps[0]);
    expect(N.two).toContain(U.gaps[1]);
    expect(N.nine.every((n) => n % 9 === 0 && digitSum(n) % 9 === 0)).toBe(true);
    expect(N.nine).toContain(S.gap);
    expect(N.notNine.every((n) => n % 9 !== 0 && digitSum(n) % 9 !== 0)).toBe(true);
    expect(N.three.every((n) => n % 3 === 0 && digitSum(n) % 3 === 0)).toBe(true);
    expect(N.notThree % 3).not.toBe(0);
    // the sums the class reads are DIFFERENT multiples: a notebook where every sum is 9 (or 3) teaches « the sum IS 9 »,
    // « the sum is 3, 6 or 9 » — the false rules of the student's mirror (world/forges.js › sumIs9, sumIs369)
    const sums9 = [...N.nine, N.sumGap].map(digitSum);
    expect(new Set(sums9)).toEqual(new Set([9, 18, 27]));
    expect(sums9.filter((x) => x > 9).length).toBeGreaterThanOrEqual(2);
    const sums3 = N.three.map(digitSum);
    expect(new Set(sums3).size).toBe(sums3.length);
    expect(sums3.filter((x) => ![3, 6, 9].includes(x)).length).toBeGreaterThanOrEqual(2); // « 3, 6 or 9 » fails twice
    expect(Math.max(...sums3)).toBeGreaterThan(9);
    // …and the plank 3 fills them WITHOUT the plank 9: « 3 and not 9 » is what this step is about
    expect(N.three.every((n) => n % 9 !== 0)).toBe(true);
    // the two false rules, as the mirror writes them, are refuted by the notebook itself
    expect(N.nine.some((n) => digitSum(n) !== 9)).toBe(true);
    expect(N.three.some((n) => ![3, 6, 9].includes(digitSum(n)))).toBe(true);
    // the units digit says nothing of 9 nor of 3 in the notebook: not every gap ends with 9, nor with 3, 6 or 9
    expect(N.nine.some((n) => n % 10 !== 9) && N.three.some((n) => ![3, 6, 9].includes(n % 10))).toBe(true);
    expect(N.four.every((n) => n % 4 === 0)).toBe(true);
    expect(N.four).toContain(L.use % 100); // 136 = 100 + 36: both parts are in the notebook
    expect(N.four).toContain(L.use - (L.use % 100));
    // the even numbers plank 4 did NOT fill: being even is not enough
    expect(N.notFour.every((n) => n % 2 === 0 && n % 4 !== 0)).toBe(true);
    // the notebook is written in the text the class reads
    for (const [id, xs] of [
      ['units', [...N.five, ...N.two, N.none, N.units]],
      ['sum-9', [...N.nine, ...N.notNine, N.sumGap]],
      ['sum-3', [...N.three, N.notThree, S.use]],
      ['last2', [...N.four, ...N.notFour, L.use]],
    ])
      for (const x of xs) expect(step(id).text, `${id}: ${x}`).toContain(String(x));
  });

  it('every answer of an « ask » is exactly the planks that fill its gap — and the planks the DIGITS predict', () => {
    expect(ask.map((s) => s.id)).toEqual(['units', 'sum-9', 'sum-3', 'last2', 'stone', 'boss']);
    for (const s of ask) {
      expect(
        s.options.filter((o) => fills(s, o)),
        s.id,
      ).toEqual(s.answer);
      expect(askRight(s, [...s.answer].reverse()), s.id).toBe(true);
      expect(askRight(s, s.options), s.id).toBe(false); // picking every plank is not the answer
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.text + s.after, s.id).toContain('$'); // its proof is written
      // the keys read from the digits give the same verdict as the bridges
      for (const o of s.options.filter((x) => byDigits[x])) expect(byDigits[o](s.a), `${s.id}: ${o}`).toBe(fills(s, o));
    }
    expect(step('units')).toMatchObject({ a: 470, answer: [2, 5] });
    expect(step('sum-9')).toMatchObject({ a: 783, answer: [3, 9] });
    expect([0, 2, 4, 5, 6, 8]).not.toContain(N.sumGap % 10); // the units digit rules 2 and 5 out, and says nothing of 9
    expect(step('sum-3')).toMatchObject({ a: S.use, options: S.useMoulds, answer: [S.usePlank] });
    expect(S.use % 3 === 0 && S.use % 9 !== 0).toBe(true);
    expect(step('last2')).toMatchObject({ a: L.use, options: L.useMoulds, answer: [L.plank] });
    expect(step('stone')).toMatchObject({ a: STONE.gap, options: STONE.read, answer: STONE.answer });
    expect(STONE.answer).toEqual([3, 5, 9]);
    expect(step('boss')).toMatchObject({ a: B.gap, options: B.options, answer: [B.plank] });
    expect(B.gap % B.plank).toBe(0);
  });

  it('writes only true equalities in what the class reads, as LaTeX', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          expect(f, s.id).not.toMatch(/[×*]/);
          n += checkEquality(f) > 1 ? 1 : 0;
        }
    expect(n).toBeGreaterThanOrEqual(15);
    const all = SCRIPT.steps.map(said).join(' ');
    for (const f of [
      '470 = 2 \\times 235',
      '470 = 5 \\times 94',
      '7 + 8 + 3 = 18',
      '3 + 8 + 7 = 18',
      '9 + 9 + 9 = 27',
      '1 + 2 + 8 = 11',
      '5 + 7 = 12',
      '7 + 8 + 6 = 21',
      '111 = 3 \\times 37',
      '111 = 9 \\times 12 + 3',
      '136 = 100 + 36',
      '36 = 4 \\times 9',
      '136 = 4 \\times 34',
      '1575 = 9 \\times 175 + 0',
      '1575 = 4 \\times 393 + 3',
      '1575 = 45 \\times 35 + 0',
      '1575 = 50 \\times 31 + 25',
      '35 \\times 80 = 2800',
    ])
      expect(all, f).toContain(`$${f}$`);
    // the remainders the board writes are smaller than the plank
    expect([1575 % 9, 1575 % 4, 1575 % 45, 1575 % 50, 111 % 9]).toEqual([0, 3, 0, 25, 3]);
    // the units digit of 470 is shared by exactly the notebook's numbers named after it
    expect(step('units').after).toContain('كما في 60 و 70');
    expect(step('stone').after).toContain('ثبتت الألواح 3 و 5 و 9');
    expect(step('stone').after).toContain('وانهارت الألواح 2 و 4');
    // sum-3 shows two sums of its notebook that are not 3, 6 nor 9 — and the plank 9 fills neither gap
    expect(step('sum-3').after).toContain('ولا يملؤهما اللوح 9');
    expect([57 % 3, 786 % 3, 57 % 9, 786 % 9]).toEqual([0, 0, 3, 3]);
  });

  it('a tablet the board names or traces holds at most two short equalities, and its notes no equality', () => {
    for (const s of names) {
      const t = TABLETS[s.tablet];
      expect(t.math.length, s.tablet).toBeGreaterThanOrEqual(1);
      expect(t.math.length, s.tablet).toBeLessThanOrEqual(2);
      for (const m of t.math) {
        expect(m.length, m).toBeLessThanOrEqual(30);
        expect(checkEquality(m), m).toBeGreaterThanOrEqual(2);
      }
      // a note is drawn as plain text, right to left: an equality written in it would be laid out of order
      for (const note of t.notes) {
        expect(note.includes('$') || note.includes('\\'), note).toBe(false);
        expect(note.includes('=') || note.includes('×'), note).toBe(false);
      }
    }
    // the tablet of the plank 4 says the bank's words: « العدد المشكّل من رقمَي آحاده وعشراته »
    expect(TABLETS['raqmayn-akhirayn'].lines.join(' ')).toContain('العدد المشكّل من رقمَي آحاده وعشراته');
    const all = JSON.stringify([SCRIPT, MEMO, TABLETS]);
    expect(all.includes('المكوّن') || all.includes('يكوّنان')).toBe(false);
    // the last tablet says OF WHICH number BY WHICH the remainder is
    expect(TABLETS['baqi-sifr'].lines[0]).toContain('باقي القسمة الإقليدية للعدد $a$ على $b$');
  });

  it('pays in دج, with no thousands space and never « DA »', () => {
    const all = JSON.stringify(SCRIPT) + JSON.stringify(MEMO);
    expect(step('boss').after).toContain(`${(B.gap / B.plank) * B.price} دج`);
    expect(B.price * (B.gap / B.plank)).toBe(2800);
    expect(all).not.toMatch(/\bDA\b/);
    expect(all).not.toMatch(/\d[   ]\d{3}(?!\d)/);
  });

  it('asks oral questions whose numbers are true', () => {
    expect(3574 % 2 === 0 && 3574 % 5 !== 0 && byDigits[2](3574) && !byDigits[5](3574)).toBe(true); // name-1
    expect(4005 % 3 === 0 && 4005 % 9 === 0 && 4006 % 3 !== 0 && 4006 % 9 !== 0).toBe(true); // name-2
    expect(digitSum(S.use)).toBe(3); // sum-3's cue
    expect(5716 % 4 === 0 && 5718 % 4 !== 0).toBe(true); // name-3
    expect(B.gap % 45 === 0 && B.gap % 50 !== 0).toBe(true); // name-4
    expect(step('name-4').cue).toContain('45 و 1575');
    expect(100 % 4).toBe(0); // last2's cue
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the four keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(['raqm-alahad', 'majmu-arqam', 'raqmayn-akhirayn', 'baqi-sifr']);
    expect(names.map((s) => s.tablet)).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      expect(s.recall.length, s.tablet).toBeGreaterThan(0);
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet));
    expect(traced.every((id) => lesson.rules[id].math.length > 0)).toBe(true);
  });
});

describe('قواعد قابلية القسمة — the written memo', () => {
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
    const all = JSON.stringify(MEMO) + JSON.stringify(SCRIPT);
    expect(all).not.toContain('وضع القسم');
    for (const w of ['الكتاب المدرسي', 'كتابك', 'الصفحة', 'نرد', 'ورق اللعب']) expect(all, w).not.toContain(w);
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
  });

  it('proposes four openings with a different drawing each, the board’s one among them, numbers true', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject({ a: step('situation').bridge.a, b: step('situation').bridge.b });
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(String(o.a));
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.bridge.first).toMatchObject({ q: 7, r: 0, exact: true });
    // teams: 34 is even, yet 4 teams leave two pupils out — and the last two digits say so
    expect(f.teams.first).toMatchObject({ b: 4, q: 8, r: 2, exact: false });
    expect(byDigits[2](34) && !byDigits[4](34)).toBe(true);
    expect(MEMO.openings[1].expect).toContain('تلميذان');
    // shelves: 342 ends with 2 (not 5), its digits add to 9
    expect(f.shelves.first).toMatchObject({ b: 5, q: 68, r: 2, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 9, q: 38, r: 0, exact: true });
    expect(digitSum(342)).toBe(9);
    // tiles: 45 cm, a gap of 1 cm with the 4 cm tile, five 9 cm tiles
    expect(f.tiles.first).toMatchObject({ b: 4, q: 11, r: 1, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 9, q: 5, r: 0, exact: true });
    // the drawings write « N ألواح / بلاطات » (N ≤ 10), « N رفًّا » (N ≥ 11), and « N في كلّ فريق » around a small circle
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
    expect(f.teams.first.q).toBeLessThanOrEqual(8);
    expect(f.teams.first.b).toBeLessThanOrEqual(5);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misconceptions are really false
    expect(N.sumGap % 10 === 3 && 13 % 3 !== 0 && 23 % 3 !== 0).toBe(true); // « ends with 3 » says nothing
    expect(S.use % 3 === 0 && S.use % 9 !== 0).toBe(true); // 3 does not bring 9
    expect(34 % 2 === 0 && 34 % 4 !== 0).toBe(true); // even is not enough for 4
    expect(L.use % 4 === 0 && digitSum(L.use) === 10 && L.use % 10 === 6).toBe(true); // the wrong key read on 136
  });

  it('writes only true equalities: the criteria, the glance, the exit ticket, the extension', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.flatMap((a) => [a.says, a.assess]),
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      ...MEMO.written,
      MEMO.connect,
    ];
    let n = 0;
    for (const t of texts) for (const f of formulas(t)) n += checkEquality(f) > 1 ? 1 : 0;
    expect(n).toBeGreaterThanOrEqual(10);
    expect(MEMO.glance.three[1]).toContain('1 + 1 + 1 = 3');
    expect(MEMO.glance.three[2]).toContain('1575 = 9 \\times 175 + 0');
    expect(MEMO.criteria[2].see).toContain('136 = 100 + 36');
    expect(MEMO.connect).toContain('100 = 4 \\times 25');
    expect(MEMO.exit).toHaveLength(3);
    // exit 1: 2160 ends with 0, its digits add to 9 → 2, 5 and 9
    expect([2, 5, 9].every((d) => 2160 % d === 0 && byDigits[d](2160))).toBe(true);
    expect(MEMO.exit[0].a).toContain('2 + 1 + 6 + 0 = 9');
    // exit 2: 1318 → 18, not a multiple of 4
    expect(MEMO.exit[1].a).toContain('لا');
    expect(1318 % 100).toBe(18);
    expect(1318 % 4).not.toBe(0);
    // exit 3: 252 = 7 × 36
    expect(252 % 7).toBe(0);
    // the extension: 4□2 divisible by 9 has one digit only (3); the smallest three-digit multiple of 2, 3 and 5 is 120
    expect([...Array(10).keys()].filter((x) => (400 + 10 * x + 2) % 9 === 0)).toEqual([3]);
    expect(MEMO.extend[0]).toContain('4□2');
    const smallest = Array.from({ length: 900 }, (_, i) => 100 + i).find((x) => x % 30 === 0);
    expect(smallest).toBe(120);
    // the written trace says the same as the tablets read on the board
    expect(MEMO.written[0]).toContain(TABLETS['raqm-alahad'].lines[0].replace(/\.$/, '').slice(0, 30));
  });
});
