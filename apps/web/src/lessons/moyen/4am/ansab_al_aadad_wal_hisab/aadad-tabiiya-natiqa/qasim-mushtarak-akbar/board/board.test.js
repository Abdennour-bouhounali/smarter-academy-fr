import { describe, it, expect } from 'vitest';
import { BOARD, SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, askWords, fills } from '../../../../../../../features/classSession/lessonScripts';
import { outcome } from '../../../../../../common/gameworld/divisorIsles/ruleForge';

/** « حصّة القسم » of lesson 4: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const common = (a, b) => divisors(a).filter((d) => b % d === 0);
/** A list as the board prints it: a no-break space BEFORE each comma, so a line never starts with « ، ». */
const listAr = (xs) => xs.join('\u00a0، ');
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** « 1 ، 2 ، 3 » read back as numbers. */
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
  for (const p of f.split('\\qquad').map((x) => x.trim())) {
    const v = p
      .replace(/\\times/g, '*')
      .split('=')
      .map((x) => value(x.trim()))
      .filter((x) => x !== null);
    if (v.length < 2) continue;
    for (const x of v) expect(x, p).toBe(v[0]);
  }
}
const said = (s) => [s.title, s.text, s.question, s.after].filter(Boolean).join(' ');

const { roses: R, lilies: L, first: F, other: O } = BOARD;

describe('القاسم المشترك الأكبر — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and an oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps).toHaveLength(13);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(2); // two copybook pages of two keys
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // the pilot's mirror, not this lesson's
    // what the board draws as plain text holds no formula (the cue, the question, the title)
    for (const s of SCRIPT.steps)
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
  });

  it('never names a key before the class has acted on it: every name follows an « ask », and nothing before says it', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(['ask', 'statements', 'forge'], s.id).toContain(SCRIPT.steps[i - 1].kind);
    });
    for (const n of names) {
      const before = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(n));
      expect(before.map(said).join(' '), n.tablet).not.toContain(TABLETS[n.tablet].title);
    }
    // the notation PGCD is not written before the key that names it
    const k2 = SCRIPT.steps.indexOf(step('name-2'));
    expect(SCRIPT.steps.slice(0, k2).map(said).join(' ')).not.toContain('PGCD');
    // the word « مشترك » is not said before the first key: the class finds the planks of BOTH gaps first
    const k1 = SCRIPT.steps.indexOf(step('name-1'));
    expect(SCRIPT.steps.slice(0, k1).map(said).join(' ')).not.toMatch(/مشترك/);
  });

  it('opens on the florist of the board, with her own numbers — never the student’s story', () => {
    const { bridge } = step('situation');
    expect(bridge).toEqual({ a: R, b: F });
    expect([R, L, F]).toEqual([36, 60, 9]);
    expect(outcome(R, F).held).toBe(true); // 9 bouquets share the roses: 4 in each
    expect(R / F).toBe(4);
    expect(L % F).not.toBe(0); // … and not the lilies: the question of the hour
    // the story's numbers are the world's, never the board's
    const story = JSON.stringify(NUMBERS);
    for (const n of [R, L]) expect(story).not.toMatch(new RegExp(`\\b${n}\\b`));
    expect(gcd(R, L)).not.toBe(gcd(NUMBERS.bouquets.roses, NUMBERS.bouquets.lilies));
    expect(step('situation').text).not.toContain('الباقات المتماثلة');
  });

  it('every answer of an « ask » is exactly the planks that fill its gap — and the planks of the KEY it leads to', () => {
    expect(ask.map((s) => s.id)).toEqual(['twin', 'both', 'summit', 'deal', 'nest', 'other']);
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
      expect(s.options.length, s.id).toBeLessThanOrEqual(6); // one row on the board
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.text + s.after, s.id).toContain('$'); // its proof is written
    }
    const G = gcd(R, L);
    expect(G).toBe(12);
    // twin: the lilies' gap; 9 fills the roses' and not the lilies'; 5 the lilies' and not the roses'; 6 both
    expect(step('twin').a).toBe(L);
    expect(step('twin').answer).toEqual([5, 6]);
    expect(R % 5 !== 0 && L % 5 === 0 && R % 6 === 0 && L % 6 === 0).toBe(true);
    // both: every option is a plank of 36; those that fill 60 are the common ones; 1, 2, 3 added after
    const both = step('both');
    expect(both.options.every((o) => R % o === 0)).toBe(true);
    expect(divisors(R).filter((d) => !both.options.includes(d))).toEqual([1, 2, 3]); // the planks the text gives, not asked
    expect([1, 2, 3].every((d) => L % d === 0)).toBe(true);
    expect([...both.answer, 1, 2, 3].sort((x, y) => x - y)).toEqual(common(R, L));
    expect(both.after).toContain(listAr(common(R, L)));
    expect(both.text).toContain('36 = 1 \\times 36 = 2 \\times 18 = 3 \\times 12 = 4 \\times 9 = 6 \\times 6');
    // summit: the planks of 60 from 12 up are ALL tried on 36: only 12 holds — so no common plank is longer
    const summit = step('summit');
    expect(summit.options).toEqual(divisors(L).filter((d) => d >= G));
    expect(summit.answer).toEqual([G]);
    expect(common(R, L).at(-1)).toBe(G);
    // deal: every count tried shares the roses; those that share the lilies are common divisors; the most is the PGCD
    const deal = step('deal');
    expect(deal.options.every((k) => R % k === 0)).toBe(true);
    expect(deal.answer).toEqual(deal.options.filter((k) => common(R, L).includes(k)));
    expect(deal.answer).toEqual([3, 12]);
    expect(deal.after).toContain(`\\mathrm{PGCD}(${R} ; ${L}) = ${G}`);
    expect(deal.after).toContain('3 ورود و 5 زنبقات');
    expect(deal.after).toContain('3 باقات و 12 باقة');
    // nest: the gap of 12; the planks that fill it are the common planks among the options
    const nest = step('nest');
    expect(nest.a).toBe(G);
    expect(nest.answer).toEqual(nest.options.filter((o) => common(R, L).includes(o)));
    expect(divisors(G)).toEqual(common(R, L)); // the two lists ARE the same: the key
    // other: PGCD(48 ; 80) = 16, proved by the divisors of 80 above 16 that do not divide 48; the planks that fill 80
    // among the options are exactly those of 16, i.e. the common ones
    const other = step('other');
    expect(gcd(O.a, O.b)).toBe(16);
    const above = divisors(O.b).filter((d) => d > 16);
    expect(above).toEqual([20, 40, 80]);
    expect(above.every((d) => O.a % d !== 0)).toBe(true);
    expect(other.text).toContain('20 و 40 و 80');
    expect(other.a).toBe(O.b);
    expect(other.answer).toEqual(other.options.filter((o) => 16 % o === 0));
    expect(other.answer).toEqual(other.options.filter((o) => O.a % o === 0 && O.b % o === 0));
    expect(other.answer).toEqual([4, 8, 16]);
    expect(other.options.filter((o) => O.a % o === 0 && O.b % o !== 0)).toEqual([3, 6, 12]); // fill 48 only
    expect(other.after).toContain('3 و 6 و 12 فلا تملأ 80');
  });

  it('speaks of bouquets at the florist’s station, of planks everywhere else (an « ask »’s own `words`)', () => {
    // the bouquet station's cards are bouquet counts: no « لوح », no « يثبت / ينهار »
    expect(askWords(step('deal'))).toEqual({ card: 'عدد الباقات', held: 'توزَّع كلّها', fell: 'تبقى زنابق' });
    // the label needs no number agreement (3 باقات، 12 باقة): it never holds a number
    expect(step('deal').words.card).not.toMatch(/\d/);
    // the five other questions are about planks: the board's default words
    for (const s of ask.filter((x) => x.id !== 'deal')) {
      expect(s.words, s.id).toBeUndefined();
      expect(askWords(s), s.id).toEqual({ card: 'لوح', held: 'يثبت', fell: 'ينهار' });
    }
  });

  it('writes only true equalities in what the class reads (situation, questions, what comes after)', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          checkEquality(f);
          n += 1;
        }
    expect(n).toBeGreaterThanOrEqual(15);
    // the formulas are LaTeX: « \\times », never a raw « × » or « * »
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*]/);
    // the counted words agree with their numbers (Arabic agreement)
    expect(step('situation').text).toContain('36 وردة و 60 زنبقة');
    expect(step('situation').question).toContain('9 باقات');
    expect(step('twin').after).toContain('60 = 9 \\times 6 + 6');
    expect(step('twin').after).toContain('36 = 5 \\times 7 + 1');
    // every list of the board is a true list of divisors
    for (const s of SCRIPT.steps)
      for (const m of said(s).matchAll(/قواسم (\d+) هي ([\d ،]+\d)/g))
        expect(listOf(m[2]), m[0]).toEqual(divisors(Number(m[1])));
  });

  it('keeps every oral question inside its footer and every tablet inside its card (CLASS_SESSION.md §5ter)', () => {
    for (const s of SCRIPT.steps)
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
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
      for (const row of t.math) {
        const parts = row.split('\\qquad');
        expect(parts.length, `${key}: ${row}`).toBeLessThanOrEqual(2);
        for (const eq of parts) {
          expect(eq, `${key}: ${eq}`).toContain('=');
          expect(drawn(eq).length, `${key}: « ${drawn(eq)} »`).toBeLessThanOrEqual(parts.length === 2 ? 12 : 28);
        }
        expect(drawn(row.replace('\\qquad', '  ')).length, `${key}: ${row}`).toBeLessThanOrEqual(28);
      }
    }
  });

  it('asks oral questions whose numbers are true', () => {
    expect(common(10, 15)).toEqual([1, 5]); // name-1, name-2
    expect(gcd(42, 56)).toBe(14); // name-3: 14 boxes, 3 pens and 4 copybooks in each
    expect(gcd(20, 30)).toBe(10); // name-4
    expect(common(20, 30)).toEqual(divisors(10));
    expect(step('name-4').cue).toContain('PGCD(20 ; 30) = 10');
    expect(L % F).toBe(6); // the situation's cue: 60 lilies on 9 bouquets leave 6
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the four keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual([
      'qawasim-mushtaraka',
      'al-akbar',
      'baqat-mutamathila',
      'qawasim-al-pgcd',
    ]);
    expect(names.map((s) => s.tablet)).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the four keys, in order
  });
});

describe('القاسم المشترك الأكبر — the written memo', () => {
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
    expect(MEMO.criteria).toHaveLength(4); // one per الكفاءة of the lesson (P1–P4)
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
    expect(f.bridge.first).toMatchObject({ q: 4, r: 0, exact: true });
    expect(MEMO.openings[0].expect).toContain('4 ورود');
    // teams: 24 and 30 players, PGCD 6 teams of 4 + 5; 4 teams fail on 30
    expect(gcd(24, 30)).toBe(6);
    expect(f.teams.first).toMatchObject({ b: 6, q: 4, r: 0, exact: true });
    expect(24 % 4 === 0 && 30 % 4 !== 0).toBe(true);
    // shelves: 132 and 77 books share only 1 and 11; shelves of 10 leave 2 books, shelves of 11 are full
    expect(common(132, 77)).toEqual([1, 11]);
    expect(f.shelves.first).toMatchObject({ b: 10, q: 13, r: 2, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 11, q: 12, r: 0, exact: true });
    expect(77 % 11).toBe(0);
    // tiles: 84 cm and 63 cm, PGCD 21; tiles of 10 leave 4 cm, tiles of 21 fit
    expect(gcd(84, 63)).toBe(21);
    expect(f.tiles.first).toMatchObject({ b: 10, q: 8, r: 4, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 21, q: 4, r: 0, exact: true });
    // the drawings write « N ألواح / بلاطات » and « N رفًّا »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
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
    // the misconceptions are really false: 9 bouquets fail on the lilies, 36 is not the PGCD, 5 is not common
    expect(L % F).not.toBe(0);
    expect(L % R).not.toBe(0);
    expect(R % 5).not.toBe(0);
    expect(gcd(R, L) * gcd(R, L)).toBeGreaterThan(R); // 12 roses in each of 12 bouquets: more roses than she has
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
    expect(n).toBeGreaterThanOrEqual(8);
    expect(MEMO.criteria[0].see).toContain(listAr(common(R, L)));
    expect(MEMO.criteria[2].see).toContain('12 باقة على الأكثر، في كلّ واحدة 3 ورود و 5 زنبقات');
    expect(MEMO.criteria[3].see).toContain(listAr(divisors(16)));
    expect(MEMO.connect).toContain(listAr(common(R, L)));
    expect(MEMO.exit).toHaveLength(3);
    // exit 1: the common divisors of 18 and 30
    expect(MEMO.exit[0].a).toContain(listAr(divisors(18)));
    expect(MEMO.exit[0].a).toContain(listAr(common(18, 30)));
    expect(common(18, 30)).toEqual([1, 2, 3, 6]);
    // exit 2: PGCD(26 ; 65) = 13 — the only divisor of 26 above 13 is 26 itself, and it does not divide 65
    expect(divisors(26).filter((d) => d > 13)).toEqual([26]);
    expect(65 % 26).not.toBe(0);
    // exit 3: 30 and 42 pieces → 6 boxes, 5 and 7 in each (the words agree: « 6 علب », « 5 قطع », « 7 قطع »)
    expect(MEMO.exit[2].a).toContain('6 علب، في كلّ واحدة 5 قطع بقلاوة و 7 قطع مقروط');
    // the extension: PGCD 15 → its divisors; bouquets of at least 4 roses with 36 roses and 60 lilies
    const { g, roses, lilies, least } = MEMO.extendCheck;
    expect(MEMO.extend[0]).toContain(`= ${g}`);
    expect(divisors(g)).toEqual([1, 3, 5, 15]);
    expect([roses, lilies]).toEqual([R, L]);
    expect(MEMO.extend[2]).toContain(`${least} ورود`);
    expect(common(roses, lilies).filter((k) => roses / k >= least)).toEqual([1, 2, 3, 4, 6]);
    // the support: 8 and 12 share 1, 2, 4
    expect(common(8, 12)).toEqual([1, 2, 4]);
  });

  it('uses no pair of the lesson’s exercise bank (the board and the memo are the platform’s own numbers)', () => {
    // the pairs the bank computes a PGCD of (content/practice/4am/qasim-mushtarak-akbar, read 2026-11-19)
    const BANK = [
      [12, 18],
      [28, 42],
      [36, 48],
      [40, 64],
      [42, 70],
      [45, 75],
      [50, 75],
      [52, 78],
      [56, 84],
      [56, 96],
      [63, 81],
      [64, 96],
      [65, 78],
      [66, 88],
      [70, 98],
      [75, 108],
      [84, 126],
      [90, 54],
      [98, 126],
    ];
    const ours = [
      [R, L],
      [O.a, O.b],
      [24, 30],
      [132, 77],
      [84, 63],
      [18, 30],
      [26, 65],
      [30, 42],
      [42, 56],
      [20, 30],
      [10, 15],
    ];
    const same = (p, q) => (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);
    for (const p of ours)
      expect(
        BANK.some((q) => same(p, q)),
        p.join(' ; '),
      ).toBe(false);
  });
});
