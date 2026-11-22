import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { BOARD, KEYS, LADDERS, SCRIPT, divisions, divisorsOf } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { TABLETS } from '../world/story';
import * as OWN_WORLD from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, askWords, fills } from '../../../../../../../features/classSession/lessonScripts';
import { outcome } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
// the other lessons of the unit on the islands: their scripts and the numbers of their stories (defects A9)
import { SCRIPT as S1 } from '../../qasim-adad-tabii/board/script';
import { SCRIPT as S2 } from '../../qawasim-adad-tabii/board/script';
import { SCRIPT as S3 } from '../../khawass-qawasim/board/script';
import { SCRIPT as S4 } from '../../qasim-mushtarak-akbar/board/script';
import { SCRIPT as S5 } from '../../tayin-pgcd/board/script';
import { SCRIPT as S6 } from '../../bahth-pgcd/board/script';
import { NUMBERS as N3 } from '../../khawass-qawasim/world/story';
import { NUMBERS as N4 } from '../../qasim-mushtarak-akbar/world/story';
import { NUMBERS as N5 } from '../../tayin-pgcd/world/math';
import { NUMBERS as N6 } from '../../bahth-pgcd/world/math';

/** « حصّة القسم » of lesson 7: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const common = (a, b) => divisorsOf(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
const isPrime = (n) => n > 1 && divisorsOf(n).length === 2;
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** An arithmetic side (digits, + − × and parentheses) evaluated; null when it holds anything else. */
function value(side) {
  if (!/^[\d\s+\-*]+$/.test(side)) return null;
  return side
    .split('+')
    .map((t) => t.split('-').map((u) => u.split('*').reduce((p, x) => p * Number(x), 1)))
    .reduce((s, [first, ...rest]) => s + rest.reduce((v, x) => v - x, first), 0);
}
/**
 * The truth of an equality written in LaTeX: every arithmetic side of « x = y = z » evaluated, all equal; every side
 * « PGCD(a ; b) » re-computed and equal to the number the chain ends on.
 */
function checkEquality(f) {
  if (!f.includes('=')) return;
  const sides = f
    .replace(/\\times/g, '*')
    .split('=')
    .map((x) => x.trim());
  const pg = sides
    .map((x) => x.match(/^\\mathrm\{PGCD\}\((\d+) ; (\d+)\)$/))
    .filter(Boolean)
    .map((m) => gcd(Number(m[1]), Number(m[2])));
  const v = sides.map(value).filter((x) => x !== null);
  for (const x of v) expect(x, f).toBe(v[0]);
  for (const g of pg) expect(g, f).toBe(pg[0]);
  for (const x of sides)
    expect(value(x) !== null || /^\\mathrm\{PGCD\}\(\d+ ; \d+\)$/.test(x), `${f}: « ${x} »`).toBe(true);
  if (pg.length && v.length) expect(v.at(-1), f).toBe(pg[0]);
}
const said = (s) => [s.title, s.text, s.question, s.after].filter(Boolean).join(' ');
/** Every number written in a text, formulas included. */
const numbersIn = (text) => [...String(text).matchAll(/\d+/g)].map((m) => Number(m[0]));

const {
  streams: [A, B],
  first: F,
  euclid: [E1, E2],
  witness: W,
} = BOARD;

/**
 * The lesson's exercise bank (content/practice/4am/awwaliyan-fima-baynahuma, read at every run): every pair it computes
 * a PGCD of (« PGCD(a ; b) », « a و b »), and, per exercise, every number it writes — two numbers of the board met in ONE
 * exercise are a pair of the bank too.
 */
const BANK_DIR = new URL(
  '../../../../../../../../../../content/practice/4am/awwaliyan-fima-baynahuma/',
  import.meta.url,
);
const bankTexts = readdirSync(BANK_DIR, { recursive: true })
  .filter((f) => String(f).endsWith('.json'))
  .map((f) => JSON.stringify(JSON.parse(readFileSync(new URL(String(f), BANK_DIR), 'utf8'))));
const BANK_PAIRS = bankTexts.flatMap((t) =>
  [...t.matchAll(/PGCD\}?\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|(\d+) و (\d+)/g)].map((m) =>
    [m[1] ?? m[3], m[2] ?? m[4]].map(Number),
  ),
);
const BANK_SETS = bankTexts.map((t) => new Set(numbersIn(t)));
const same = (p, q) => (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);
const inBank = (p) => BANK_PAIRS.some((q) => same(p, q)) || BANK_SETS.some((s) => s.has(p[0]) && s.has(p[1]));

/**
 * The numbers of the OTHER lessons (defects A9): their stories' numbers (10 and more), every number of 100 and more of
 * their boards, and the numbers the walks already hunt (`e2e/lib/walk.mjs`: the pilot's 756 and 1850; lesson 2's 252,
 * 96, 1400 and 11200).
 */
const OTHER_SCRIPTS = [S1, S2, S3, S4, S5, S6];
const FOREIGN = new Set([
  ...[N3, N4, N5, N6].flatMap((n) => numbersIn(JSON.stringify(n))).filter((n) => n >= 10),
  ...OTHER_SCRIPTS.flatMap((s) => numbersIn(JSON.stringify(s))).filter((n) => n >= 100),
  756,
  1850,
  252,
  96,
  1400,
  11200,
]);
/** This lesson's story: whatever its world exports as numbers (NUMBERS, or the whole story module as a fallback). */
const STORY = new Set(numbersIn(JSON.stringify(OWN_WORLD.NUMBERS ?? OWN_WORLD.TABLETS)));

describe('العددان الأوّليّان فيما بينهما — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and an oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps).toHaveLength(9);
    expect(SCRIPT.steps.length).toBeLessThanOrEqual(14); // trusted.md: the board is proved for 14 stations
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(2);
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // forged in the world
    for (const s of SCRIPT.steps)
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
  });

  it('never names a key before the class has acted on it: every name follows an « ask », and nothing before says it', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(SCRIPT.steps[i - 1].kind, s.id).toBe('ask');
    });
    const before = (n) =>
      SCRIPT.steps
        .slice(0, SCRIPT.steps.indexOf(n))
        .map((s) => `${said(s)} ${s.cue}`)
        .join(' ');
    for (const n of names) expect(before(n), n.tablet).not.toContain(TABLETS[n.tablet].title);
    // the words of the three keys, whatever the tablets' wording becomes: the notion's name, the proof's « إثبات »,
    // the witness. « أوّليّ » alone (a prime number) is said before key 1 — on purpose: neither 64 nor 55 is prime.
    expect(before(names[0])).not.toMatch(/فيما بينهما|أوّليّان|أوّليّين/);
    expect(before(names[1])).not.toMatch(/إثبات|أثبت|نثبت|يثبت أنّ/);
    expect(before(names[2])).not.toMatch(/شاهد|يكفي|قاسم مشترك واحد|يختلف عن 1/);
  });

  it('opens on the carpenter of the board, with his own numbers — never the student’s story', () => {
    expect(step('situation').bridge).toEqual({ a: A, b: F });
    expect([A, B, F]).toEqual([64, 55, 8]);
    expect(outcome(A, F)).toMatchObject({ held: true, q: 8 }); // the plank 8 fills the first stream: 8 planks
    expect(B % F).toBe(7); // … and leaves 7 cells of the second
    expect(step('situation').text).toContain('الأولى 64 خانة والثانية 55 خانة');
    const pairs = [
      [A, B],
      [E1, E2],
      [W.a, W.b],
    ];
    for (const [x, y] of pairs) expect(STORY.has(x) && STORY.has(y), `${x} ; ${y} in the story`).toBe(false);
    for (const n of [...pairs.flat(), ...LADDERS.euclid.flat()].filter((x) => x >= 100))
      expect(STORY.has(n), `${n} in the story`).toBe(false);
  });

  it('every answer of an « ask » is exactly the planks that fill its gap — and what its key says', () => {
    expect(ask.map((s) => s.id)).toEqual(['mushtarak', 'ithbat', 'shahid']);
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
      expect(askRight(s, s.options), s.id).toBe(false);
      expect(s.answer, s.id).toHaveLength(1); // one right card: `single`
      expect(s.options.length, s.id).toBeGreaterThanOrEqual(4);
      expect(s.options.length, s.id).toBeLessThanOrEqual(6); // trusted.md: ≤ 6 cards on an ask, one row
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.options.every((o) => o <= s.a)).toBe(true);
      expect(s.text + s.after, s.id).toContain('$');
      expect(s.words, `${s.id}: every question is about planks over a stream`).toBeUndefined();
      expect(askWords(s)).toEqual({ card: 'لوح', held: 'يثبت', fell: 'ينهار' });
    }
    // 🤝 mushtarak: the planks of 55 tried on 64 — only 1; neither number is prime
    const mu = step('mushtarak');
    expect(mu.options).toEqual(divisorsOf(B));
    expect(mu.options).toEqual([1, 5, 11, 55]);
    expect(mu.answer).toEqual([1]);
    expect(common(A, B)).toEqual([1]);
    expect(isPrime(A) || isPrime(B)).toBe(false);
    expect(mu.text).toContain('55 = 8 \\times 6 + 7');
    expect(mu.text).toContain('55 = 1 \\times 55 = 5 \\times 11');
    expect(mu.after).toContain('\\mathrm{PGCD}(64 ; 55) = 1');
    expect(mu.after).toContain('64 = 2 \\times 32');
    // ✅ ithbat: the ladder of divisions of 799 and 366, neither prime, ends on the remainder 1; only 1 fills 799
    const it7 = step('ithbat');
    expect(LADDERS.euclid).toEqual([
      [799, 366, 2, 67],
      [366, 67, 5, 31],
      [67, 31, 2, 5],
      [31, 5, 6, 1],
      [5, 1, 5, 0],
    ]);
    expect(gcd(E1, E2)).toBe(1);
    expect(isPrime(E1) || isPrime(E2)).toBe(false);
    expect([17 * 47, 2 * 3 * 61]).toEqual([E1, E2]);
    expect(it7.options).toEqual([366, 67, 31, 5, 1]);
    expect(it7.answer).toEqual([1]);
    expect(outcome(E1, E2)).toMatchObject({ q: 2, r: 67 }); // the card of 366 IS the first division
    expect(it7.text).toContain('799 = 366 \\times 2 + 67');
    expect(it7.text).toContain('366 = 67 \\times 5 + 31');
    expect(it7.after).toContain('31 = 5 \\times 6 + 1');
    expect(it7.after).toContain('5 = 1 \\times 5 + 0');
    // the sentence of the proof, as the student writes it: « PGCD(a ; b) = 1 إذن … أوّليّان فيما بينهما »
    expect(it7.after).toMatch(/: \$\\mathrm\{PGCD\}\(799 ; 366\) = 1\$ إذن العددان 799 و 366 أوّليّان فيما بينهما\.$/);
    expect(it7.cue).toContain('قسمة 67 على 31');
    // ❌ shahid: 2, 3, 5 fill neither stream; 7 fills both — one witness, no PGCD computed
    const sh = step('shahid');
    expect(sh.options).toEqual([2, 3, 5, 7]);
    expect(sh.answer).toEqual([7]);
    for (const d of W.tried) expect(W.a % d !== 0 && W.b % d !== 0, `${d}`).toBe(true);
    expect(W.a % W.plank).toBe(0);
    expect(gcd(W.a, W.b)).toBe(7); // the witness is not even searched as « the greatest »: it happens to be
    expect(sh.text).toContain('847 = 7 \\times 121');
    expect(sh.after).toContain('413 = 7 \\times 59');
    expect(sh.cue).toContain('اللوح 5');
  });

  it('writes only true equalities in what the class reads (situation, questions, what comes after)', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          checkEquality(f);
          n += 1;
        }
    expect(n).toBeGreaterThanOrEqual(14);
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*]/);
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' ')))
        expect(f.replace(/\\[a-zA-Z]+/g, 'x').length, `${s.id}: ${f}`).toBeLessThanOrEqual(46);
    expect(step('ithbat').text).toContain('799 خانة و 366 خانة');
    expect(step('shahid').text).toContain('847 خانة و 413 خانة');
    for (const s of SCRIPT.steps) expect(said(s), s.id).not.toMatch(/[\d$] ،/);
    // an equality is never written in plain Arabic text (defects B16): outside the formulas, no « = »
    for (const s of SCRIPT.steps) expect(said(s).replace(/\$[^$]+\$/g, ''), s.id).not.toContain('=');
  });

  it('keeps every oral question inside its footer, in Arabic, with no number of another lesson', () => {
    for (const s of SCRIPT.steps)
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
    for (const s of SCRIPT.steps) expect(s.cue, s.id).not.toMatch(/PGCD|[a-zA-Z=]/);
    for (const s of SCRIPT.steps)
      for (const n of numbersIn(s.cue)) expect(FOREIGN.has(n), `${s.id}: ${n} is another lesson's`).toBe(false);
    // the long numbers of the board are not another lesson's either
    for (const n of numbersIn(SCRIPT.steps.map(said).join(' ')).filter((x) => x >= 100))
      expect(FOREIGN.has(n), `${n} is another lesson's`).toBe(false);
    expect(FOREIGN.size).toBeGreaterThan(20); // the other lessons were read
  });

  it('asks oral questions whose numbers are true', () => {
    expect(gcd(16, 33)).toBe(1); // name-1: coprime, the only common plank is 1
    expect(isPrime(16) || isPrime(33)).toBe(false);
    expect(divisions(91, 62).map((r) => r[3])).toEqual([29, 4, 1, 0]); // name-2: ends on 1
    expect(gcd(115, 65)).toBe(5); // name-3: both end in 5
    expect(step('name-3').cue).toContain('115 و 65');
    expect(step('trace-1').cue).toContain(`${A} و ${B}`);
    expect(step('situation').cue).toContain('الساقية 55');
  });

  it('names each key with the tablet of the STUDENT’S world, the three keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(KEYS).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w);
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(KEYS);
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace').every((s) => s.tablets.length <= 2)).toBe(true);
    // a tablet on a naming station is short (defects B17; trusted.md: math rows ≤ 28, or 32 for two PGCDs)
    const drawn = (tex) =>
      tex
        .replace(/\\times/g, '×')
        .replace(/\\(text|mathrm)\{([^}]*)\}/g, '$2')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    for (const key of KEYS) {
      const t = TABLETS[key];
      expect(t.lines.length, key).toBeLessThanOrEqual(2);
      expect((t.math ?? []).length, key).toBeLessThanOrEqual(2);
      for (const row of t.math ?? []) {
        const two = (row.match(/PGCD/g) ?? []).length === 2;
        expect(drawn(row.replace('\\qquad', '  ')).length, `${key}: ${row}`).toBeLessThanOrEqual(two ? 32 : 28);
      }
    }
  });
});

describe('العددان الأوّليّان فيما بينهما — the written memo', () => {
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
    expect(MEMO.criteria).toHaveLength(3); // one per الكفاءة (P1–P3)
    expect(MEMO.written).toHaveLength(3); // one per key
    expect(JSON.stringify(MEMO)).not.toContain('وضع القسم');
    expect(JSON.stringify(MEMO)).not.toMatch(/نقطة التعلّم|الكتاب المدرسي|DA\b/);
  });

  it('writes no formula and no equality where the memo page draws plain text', () => {
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
      ...MEMO.support,
      ...MEMO.extend,
    ];
    for (const t of plain) {
      expect(t, t).not.toContain('$');
      expect(t, t).not.toContain('=');
    }
  });

  it('proposes four openings with a different drawing each, the board’s one among them, numbers true', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject({ a: step('situation').bridge.a, b: step('situation').bridge.b });
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(String(o.a));
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    // bridge: 64 cells, planks of 8: 8 planks, nothing left
    expect(f.bridge.first).toMatchObject({ q: 8, r: 0, exact: true });
    expect(MEMO.openings[0].expect).toContain('8 ألواح');
    // teams: 28 and 51 players; 4 teams fit 28 and not 51; 51 is not prime and yet only 1 is common
    expect(f.teams.first).toMatchObject({ b: 4, q: 7, r: 0, exact: true });
    expect(51 % 4).not.toBe(0);
    expect(gcd(28, 51)).toBe(1);
    expect([51 % 3, 51 % 17]).toEqual([0, 0]);
    // shelves: 174 stories and 291 science books — digit sums 12 and 12, the witness 3
    expect([1 + 7 + 4, 2 + 9 + 1]).toEqual([12, 12]);
    expect([174 % 3, 291 % 3]).toEqual([0, 0]);
    expect(gcd(174, 291)).toBe(3);
    expect(f.shelves.first).toMatchObject({ b: 2, q: 145, r: 1, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 3, q: 97, r: 0, exact: true });
    expect(MEMO.openings[2].story).toContain('174');
    // tiles: 84 cm and 55 cm, coprime in six divisions; 9 leaves 3 cm, 12 fills 84 and not 55
    expect(gcd(84, 55)).toBe(1);
    expect(divisions(84, 55)).toHaveLength(6);
    expect(MEMO.openings[3].why).toContain('ستّ قسمات');
    expect(f.tiles.first).toMatchObject({ b: 9, q: 9, r: 3, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 12, q: 7, r: 0, exact: true });
    expect(55 % 12).not.toBe(0);
    // the drawings write « N ألواح / بلاطات », « N فِرق », « N رفًّا »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeGreaterThanOrEqual(3);
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
    expect(f.teams.first.b).toBeGreaterThanOrEqual(3);
    expect(f.teams.first.b).toBeLessThanOrEqual(10);
    expect(f.teams.first.q).toBeLessThanOrEqual(10);
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
    expect(f.tiles.first.r).toBeGreaterThanOrEqual(3);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misconceptions are really false: the last quotient (5) is not the PGCD; 64 not prime yet coprime with 55;
    // « tried 2, 3, 5 » misses the common 7
    const lastQ = LADDERS.euclid.at(-1)[2];
    expect(lastQ).toBe(5);
    expect(E2 % lastQ).not.toBe(0);
    expect(MEMO.anticipated.find((a) => a.says.includes('العدد الأخير')).says).toContain(`= ${lastQ}$`);
    expect(gcd(W.a, W.b)).toBeGreaterThan(1);
  });

  it('writes only true equalities: the criteria, the glance, the exit ticket, what is anticipated', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.filter((a) => a.kind === 'right').map((a) => a.says),
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      MEMO.connect,
    ];
    let n = 0;
    for (const t of texts)
      for (const f of formulas(t)) {
        if (/[a-z]\b/.test(f.replace(/\\[a-zA-Z]+/g, ''))) continue;
        checkEquality(f);
        n += 1;
      }
    expect(n).toBeGreaterThanOrEqual(15);
    // the exit ticket: 455 and 162 by Euclid down to 1; 1035 and 870 share 5; 63 and 64 coprime, 63 and 56 share 7
    expect(divisions(455, 162).map((r) => r[3])).toEqual([131, 31, 7, 3, 1, 0]);
    expect(gcd(1035, 870)).toBe(15);
    expect([1035 % 5, 870 % 5]).toEqual([0, 0]);
    expect([gcd(63, 64), gcd(63, 56)]).toEqual([1, 7]);
    // the extension: pairs above 100, neither prime, coprime — more than one; consecutive numbers always coprime;
    // two even numbers never
    const { above, upTo } = MEMO.extendCheck;
    let found = 0;
    for (let x = above + 1; x <= above + 30; x += 1)
      for (let y = above + 1; y < x; y += 1) if (!isPrime(x) && !isPrime(y) && gcd(x, y) === 1) found += 1;
    expect(found).toBeGreaterThan(1);
    expect(MEMO.extend[0]).toContain(String(above));
    for (let k = 1; k <= upTo; k += 1) expect(gcd(k, k + 1)).toBe(1);
    for (let x = 2; x <= 200; x += 2) for (let y = 2; y < x; y += 2) expect(gcd(x, y)).toBeGreaterThan(1);
    // the support: 8 and 9 coprime, 8 and 10 share 2
    expect([gcd(8, 9), gcd(8, 10)]).toEqual([1, 2]);
  });

  it('uses no pair of the lesson’s exercise bank (the board and the memo are the platform’s own numbers)', () => {
    expect(bankTexts.length).toBe(50);
    expect(BANK_PAIRS.length).toBeGreaterThan(50);
    const ours = [
      [A, B],
      [E1, E2],
      [W.a, W.b],
      [16, 33],
      [91, 62],
      [115, 65],
      [28, 51],
      [174, 291],
      [84, 55],
      [455, 162],
      [1035, 870],
      [63, 64],
      [63, 56],
    ];
    for (const p of ours) expect(inBank(p), p.join(' ; ')).toBe(false);
  });
});
