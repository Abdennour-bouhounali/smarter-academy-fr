import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { BOARD, KEYS, LADDERS, SCRIPT, divisions, divisorsOf, stagesOf } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { TABLETS } from '../world/story';
import { NUMBERS as OWN } from '../world/math';
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
import { SCRIPT as S7 } from '../../awwaliyan-fima-baynahuma/board/script';
import { NUMBERS as N3 } from '../../khawass-qawasim/world/story';
import { NUMBERS as N4 } from '../../qasim-mushtarak-akbar/world/story';
import { NUMBERS as N5 } from '../../tayin-pgcd/world/math';
import { NUMBERS as N6 } from '../../bahth-pgcd/world/math';
import { NUMBERS as N7 } from '../../awwaliyan-fima-baynahuma/world/math';

/** « حصّة القسم » of lesson 8: every number the board says is computed here, never trusted. */
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
/**
 * The value of an arithmetic side written in LaTeX — digits, + − × ÷ and fractions « \frac{…}{…} » (nested arithmetic
 * allowed) — computed here; null when it holds anything else (a letter, a PGCD).
 */
function value(side) {
  let js = side;
  for (let i = 0; i < 4; i += 1) js = js.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  js = js.replace(/\\times/g, '*').replace(/\\div/g, '/');
  if (!/^[\d\s+\-*/().]+$/.test(js)) return null;
  return new Function(`return ${js};`)(); // eslint-disable-line no-new-func
}
const same = (x, y) => Math.abs(x - y) < 1e-9;
/** The PGCD of a side « PGCD(a ; b) », re-computed; null for another side. */
const pgcdOf = (x) => {
  const m = x.match(/^\\mathrm\{PGCD\}\((\d+) ; (\d+)\)$/);
  return m ? gcd(Number(m[1]), Number(m[2])) : null;
};
/** The truth of an equality « x = y = z »: every side computed, all equal (a PGCD side equal to the number it is set to). */
function checkEquality(f) {
  if (!f.includes('=')) return;
  const sides = f.split('=').map((x) => x.trim());
  const v = sides.map((x) => pgcdOf(x) ?? value(x));
  for (const [k, x] of v.entries()) expect(x, `${f}: « ${sides[k]} »`).not.toBe(null);
  for (const x of v) expect(same(x, v[0]), f).toBe(true);
}
const said = (s) => [s.title, s.text, s.question, s.after].filter(Boolean).join(' ');
/** Every number written in a text, formulas included. */
const numbersIn = (text) => [...String(text).matchAll(/\d+/g)].map((m) => Number(m[0]));
/** Every fraction « \frac{n}{d} » of a text with plain number terms. */
const fractionsIn = (text) => [...String(text).matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [+m[1], +m[2]]);

const { bridge: BR, stages: ST, locked: LK, euclid: EU, result: RE } = BOARD;
const RN = RE.x[0] * RE.y[0];
const RD = RE.x[1] * RE.y[1];

/**
 * The lesson's exercise bank (content/practice/4am/ikhtizal-kasr, read at every run): every pair it computes a PGCD of
 * (« PGCD(a ; b) », « a و b »), every fraction it writes, and, per exercise, every number it writes — two numbers of the
 * board met in ONE exercise are a pair of the bank too.
 */
const BANK_DIR = new URL('../../../../../../../../../../content/practice/4am/ikhtizal-kasr/', import.meta.url);
const bankTexts = readdirSync(BANK_DIR, { recursive: true })
  .filter((f) => String(f).endsWith('.json'))
  .map((f) => JSON.stringify(JSON.parse(readFileSync(new URL(String(f), BANK_DIR), 'utf8'))));
const BANK_PAIRS = bankTexts.flatMap((t) => [
  ...[...t.matchAll(/PGCD\}?\s*\(\s*(\d+)\s*;\s*(\d+)\s*\)|(\d+) و (\d+)/g)].map((m) =>
    [m[1] ?? m[3], m[2] ?? m[4]].map(Number),
  ),
  ...[...t.matchAll(/frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])]),
]);
const BANK_SETS = bankTexts.map((t) => new Set(numbersIn(t)));
const samePair = (p, q) => (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);
const inBank = (p) => BANK_PAIRS.some((q) => samePair(p, q)) || BANK_SETS.some((s) => s.has(p[0]) && s.has(p[1]));

/**
 * The numbers of the OTHER lessons (defects A9): their stories' numbers (10 and more), every number of 100 and more of
 * their boards, and the numbers the walks already hunt (`e2e/lib/walk.mjs`: the pilot's 756 and 1850; lesson 2's 252,
 * 96, 1400 and 11200 — 96 is this board's bridge: it is checked apart, below).
 */
const OTHER_SCRIPTS = [S1, S2, S3, S4, S5, S6, S7];
const FOREIGN = new Set([
  ...[N3, N4, N5, N6, N7].flatMap((n) => numbersIn(JSON.stringify(n))).filter((n) => n >= 10),
  ...OTHER_SCRIPTS.flatMap((s) => numbersIn(JSON.stringify(s))).filter((n) => n >= 100),
  756,
  1850,
  252,
  1400,
  11200,
]);
/** This lesson's story: the numbers of its world (`world/math.js › NUMBERS`: 66/78, 35/48, 66/99, 189/243, 5/39 + 8/39, 195/273). */
const STORY = new Set(numbersIn(JSON.stringify(OWN)));
/** The story's fractions, [lit, gap]: never a fraction of the board. */
const STORY_FRACTIONS = Object.values(OWN).map((n) => [n.mark ?? n.strokes.reduce((s, x) => s + x, 0), n.gap]);

describe('اختزال كسر — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and an oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps).toHaveLength(11);
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
    // the words of the four keys, whatever the tablets' wording becomes: stages, the fraction that stays, the PGCD in one
    // division, the result given reduced. « اختزال » itself is the 1AM word (the lesson's title): never said before key 1
    // all the same — the class rewrites a sign, it does not « reduce » yet.
    expect(before(names[0])).not.toMatch(/مراحل|مرحلة|اختزال|نختزل|مختزل/);
    expect(before(names[1])).not.toMatch(/غير قابل|لا يقبل الاختزال|لا يُختزل/);
    expect(before(names[2])).not.toMatch(/خطوة واحدة|دفعة واحدة|مباشرة/);
    expect(before(names[3])).not.toMatch(/نتيجة حساب|النتيجة مختزلة|نعطي النتيجة/);
  });

  it('opens on the carpenter of the board, with his own numbers — never the student’s story', () => {
    expect(step('situation').bridge).toEqual({ a: BR.lit, b: BR.first });
    expect([BR.lit, BR.whole, BR.first]).toEqual([60, 96, 8]);
    expect(outcome(BR.whole, BR.first)).toMatchObject({ held: true, q: 12 }); // the plank 8 fills the bridge
    expect(outcome(BR.lit, BR.first)).toMatchObject({ held: false, q: 7, r: 4 }); // … not the lit stretch
    expect(step('situation').text).toContain('جسر من 96 خانة، أُضيء منها 60 خانة');
    expect(step('situation').text).toContain('\\frac{60}{96}');
    const pairs = [
      [BR.lit, BR.whole],
      [LK.lit, LK.whole],
      [EU.lit, EU.whole],
      [RN, RD],
    ];
    for (const [x, y] of pairs) expect(STORY.has(x) && STORY.has(y), `${x} ; ${y} in the story`).toBe(false);
    for (const n of [...pairs.flat(), ...LADDERS.euclid.flat(), ...LADDERS.result.flat()].filter((x) => x >= 100))
      expect(STORY.has(n), `${n} in the story`).toBe(false);
    expect(STORY_FRACTIONS).toEqual([
      [66, 78],
      [35, 48],
      [66, 99],
      [189, 243],
      [13, 39],
      [195, 273],
    ]);
    // no fraction of the story is written by the board, reduced or not, in a formula or in an oral question
    const value = ([n, d]) => n / d;
    for (const s of SCRIPT.steps) {
      const fs = [...fractionsIn(said(s)), ...[...s.cue.matchAll(/(\d+) على (\d+)/g)].map((m) => [+m[1], +m[2]])];
      for (const f of fs)
        for (const t of STORY_FRACTIONS)
          expect(f[0] === t[0] && f[1] === t[1], `${s.id}: ${f} is the story's`).toBe(false);
      for (const f of fs)
        for (const t of STORY_FRACTIONS) expect(value(f) === value(t), `${s.id}: ${f} = ${t}`).toBe(false);
    }
  });

  it('every answer of an « ask » is exactly the planks that fill its bridge — and what its key says', () => {
    expect(ask.map((s) => s.id)).toEqual(['marahil', 'ghayr', 'pgcd', 'natija']);
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
      expect(s.options.length, s.id).toBeGreaterThanOrEqual(4);
      expect(s.options.length, s.id).toBeLessThanOrEqual(6); // trusted.md: ≤ 6 cards on an ask, one row
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.options.every((o) => o <= s.a)).toBe(true);
      expect(s.text + s.after, s.id).toContain('$');
      expect(s.words, `${s.id}: every question is about planks over a bridge`).toBeUndefined();
      expect(askWords(s)).toEqual({ card: 'لوح', held: 'يثبت', fell: 'ينهار' });
    }
    // every option is a plank of the LIT stretch, and the text proves it by an equality that names it
    const lit = { marahil: BR.lit, ghayr: LK.lit, pgcd: EU.lit, natija: RN };
    for (const s of ask) {
      expect(s.a, s.id).toBe({ marahil: BR.whole, ghayr: LK.whole, pgcd: EU.whole, natija: RD }[s.id]);
      for (const o of s.options) {
        expect(lit[s.id] % o, `${s.id}: ${o} fills ${lit[s.id]}`).toBe(0);
        const shown = formulas(s.text).some(
          (f) =>
            f.startsWith(`${lit[s.id]} = `) && f.split(' = ').some((t) => t.split(' \\times ').includes(String(o))),
        );
        expect(shown, `${s.id}: the text proves that ${o} fills the lit stretch`).toBe(true);
      }
    }
    // 🪜 marahil: 2, 3, 4, 6 fill 60 and 96; the stages 60/96 = 30/48 = 15/24 = 5/8, the last one with only 1 in common
    const ma = step('marahil');
    expect(ma.answer).toEqual([2, 3, 4, 6]);
    expect(common(BR.lit, BR.whole)).toEqual([1, 2, 3, 4, 6, 12]);
    expect(LADDERS.stages).toEqual([
      [60, 96],
      [30, 48],
      [15, 24],
      [5, 8],
    ]);
    expect(stagesOf(60, 96, ST.by)).toEqual(LADDERS.stages);
    expect(ST.by.every((k) => ma.answer.includes(k))).toBe(true); // each stage divides by a plank the class found
    LADDERS.stages.slice(0, -1).forEach(([n, d], i) => expect(gcd(n, d), `stage ${i}`).toBeGreaterThan(1));
    expect(gcd(...LADDERS.stages.at(-1))).toBe(1);
    expect(ma.after).toContain('\\frac{60}{96} = \\frac{30}{48} = \\frac{15}{24} = \\frac{5}{8}');
    expect(ma.text).toContain('60 = 8 \\times 7 + 4');
    expect(ma.cue).toContain('5 خانات و 8 خانات');
    // 🔒 ghayr: only 1 of the planks of 63 fills 80; neither is prime
    const gh = step('ghayr');
    expect(gh.options).toEqual(divisorsOf(LK.lit));
    expect(gh.options).toEqual([1, 3, 7, 9, 21, 63]);
    expect(gh.answer).toEqual([1]);
    expect(gcd(LK.lit, LK.whole)).toBe(1);
    expect(isPrime(LK.lit) || isPrime(LK.whole)).toBe(false);
    expect(gh.text).toContain('63 = 1 \\times 63 = 3 \\times 21 = 7 \\times 9');
    expect(gh.after).toContain('\\mathrm{PGCD}(80 ; 63) = 1');
    expect(gh.cue).toContain('5 على 8'); // the end of the stages comes back: it could not go on
    // 🎯 pgcd: the ladder of 368 and 304 ends on 16; the planks 4, 8, 16 fill both; one division by 16 gives 19/23
    const pg = step('pgcd');
    expect(LADDERS.euclid).toEqual([
      [368, 304, 1, 64],
      [304, 64, 4, 48],
      [64, 48, 1, 16],
      [48, 16, 3, 0],
    ]);
    expect(LADDERS.g.euclid).toBe(16);
    expect(gcd(EU.lit, EU.whole)).toBe(16);
    expect(pg.answer).toEqual([4, 8, 16]);
    expect(Math.max(...pg.answer)).toBe(LADDERS.g.euclid); // the longest plank of both IS the PGCD
    expect(pg.answer.every((d) => LADDERS.g.euclid % d === 0)).toBe(true); // … and every other one divides it
    expect(gcd(EU.lit / 16, EU.whole / 16)).toBe(1); // one division: nothing left to do
    expect(gcd(EU.lit / 8, EU.whole / 8)).toBe(2); // by 8 only: one stage more — the oral question
    expect(pg.cue).toContain('على 8 بدل 16');
    expect(pg.text).toContain('368 = 304 \\times 1 + 64');
    expect(pg.text).toContain('304 = 64 \\times 4 + 48');
    expect(pg.text).toContain('304 = 4 \\times 76 = 8 \\times 38 = 16 \\times 19');
    expect(pg.after).toContain('64 = 48 \\times 1 + 16');
    expect(pg.after).toContain('48 = 16 \\times 3 + 0');
    // the model line, as the student writes it
    expect(pg.after).toContain('$\\frac{304}{368} = \\frac{304 \\div 16}{368 \\div 16} = \\frac{19}{23}$');
    // 🧾 natija: 11/20 × 15/22 = 165/440; 5, 11 and 55 fill both; the result is 3/8
    const na = step('natija');
    expect([RN, RD]).toEqual([165, 440]);
    expect(na.answer).toEqual([5, 11, 55]);
    expect(LADDERS.result.map((r) => r[3])).toEqual([110, 55, 0]);
    expect(LADDERS.g.result).toBe(55);
    expect(na.text).toContain('\\frac{11}{20} \\times \\frac{15}{22} = \\frac{165}{440}');
    expect(na.after).toContain('= \\frac{3}{8}$');
    expect(gcd(3, 8)).toBe(1);
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
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*]/);
    // a formula never breaks across two lines: what it draws is short (a fraction draws its terms one above the other)
    const drawn = (f) =>
      f
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (m, a, b) => (a.length > b.length ? a : b))
        .replace(/\\[a-zA-Z]+/g, 'x');
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' ')))
        expect(drawn(f).length, `${s.id}: ${f}`).toBeLessThanOrEqual(46);
    // every fraction written in a formula with plain terms is a true fraction of the board (n < d: a lit stretch)
    for (const s of SCRIPT.steps)
      for (const [x, y] of fractionsIn(s.text)) expect(x < y, `${s.id}: ${x}/${y}`).toBe(true);
    for (const s of SCRIPT.steps) expect(said(s), s.id).not.toMatch(/[\d$] ،/);
    // an equality is never written in plain Arabic text (defects B16): outside the formulas, no « = »
    for (const s of SCRIPT.steps) expect(said(s).replace(/\$[^$]+\$/g, ''), s.id).not.toContain('=');
  });

  it('keeps every oral question inside its footer, in Arabic, with no number of another lesson', () => {
    for (const s of SCRIPT.steps)
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
    for (const s of SCRIPT.steps) expect(s.cue, s.id).not.toMatch(/PGCD|[a-zA-Z=]/);
    // 96 is lesson 2's hunted number on ITS screens; here it is this board's own bridge (checked against the stories)
    for (const s of SCRIPT.steps)
      for (const n of numbersIn(s.cue)) expect(FOREIGN.has(n), `${s.id}: ${n} is another lesson's`).toBe(false);
    for (const n of numbersIn(SCRIPT.steps.map(said).join(' ')).filter((x) => x >= 100))
      expect(FOREIGN.has(n), `${n} is another lesson's`).toBe(false);
    for (const n of [BR.lit, BR.whole, LK.lit, LK.whole]) expect(FOREIGN.has(n), `${n}`).toBe(false);
    expect(FOREIGN.size).toBeGreaterThan(20); // the other lessons were read
  });

  it('asks oral questions whose numbers are true', () => {
    // name-1: 64/88 by 2 then 4 → 8/11 (or by 4 then 2: more than one road of stages)
    expect(stagesOf(64, 88, [2, 4])).toEqual([
      [64, 88],
      [32, 44],
      [8, 11],
    ]);
    expect(stagesOf(64, 88, [4, 2]).at(-1)).toEqual([8, 11]);
    expect(gcd(8, 11)).toBe(1);
    expect(step('name-1').cue).toContain('64 على 88');
    expect(gcd(46, 75)).toBe(1); // name-2: it cannot be reduced, only 1 fills both
    expect(isPrime(46) || isPrime(75)).toBe(false);
    expect(gcd(155, 186)).toBe(31); // name-3: one division by 31 → 5/6
    expect([155 / 31, 186 / 31]).toEqual([5, 6]);
    expect(gcd(23 + 49, 84)).toBe(12); // name-4: 72/84 → 6/7
    expect(step('name-4').cue).toContain('23 على 84 زائد 49 على 84');
    expect(step('trace-1').cue).toContain(`${BR.lit} على ${BR.whole}`);
    expect(step('trace-2').cue).toContain(`${EU.lit} على ${EU.whole}`);
    expect(step('natija').cue).toContain(`${RN} على ${RD}`);
  });

  it('names each key with the tablet of the STUDENT’S world, the four keys in order, each recall word in its text', () => {
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
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (m, a, b) => (a.length > b.length ? a : b))
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

describe('اختزال كسر — the written memo', () => {
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
    expect(MEMO.criteria).toHaveLength(4); // one per الكفاءة (P1–P4)
    expect(MEMO.written).toHaveLength(4); // one per key
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
    // bridge: 60 lit cells, planks of 8: 7 planks, 4 lit cells left — while 8 fills the 96 cells
    expect(f.bridge.first).toMatchObject({ q: 7, r: 4, exact: false });
    expect(BR.whole % BR.first).toBe(0);
    expect(MEMO.openings[0].expect).toContain('7 ألواح وتبقى 4 خانات');
    expect(common(BR.lit, BR.whole).filter((d) => d > 1 && d < 12)).toEqual([2, 3, 4, 6]); // « 2 و 3 و 4 و 6 »
    expect(MEMO.openings[0].why).toContain('2 و 3 و 4 و 6');
    // teams: 50 players, 20 juniors; 5 teams of 10 with 4 juniors; 10 teams of 5 with 2 juniors — and 10 is the PGCD
    expect(f.teams.first).toMatchObject({ b: 5, q: 10, r: 0, exact: true });
    expect([20 / 5, 20 / 10, 50 / 10]).toEqual([4, 2, 5]);
    expect(gcd(20, 50)).toBe(10);
    expect(gcd(2, 5)).toBe(1);
    // shelves: 144 books, 84 stories; shelves of 10 leave 4, shelves of 12: 12 shelves, 7 of stories
    expect(f.shelves.first).toMatchObject({ b: 10, q: 14, r: 4, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 12, q: 12, r: 0, exact: true });
    expect([84 % 12, 84 / 12, gcd(84, 144)]).toEqual([0, 7, 12]);
    expect(MEMO.openings[2].story).toContain('84 قصّة');
    // tiles: a ribbon of 90 cm, 75 cm painted; pieces of 12 leave 6 cm, pieces of 15: 6 pieces, 5 painted — one division
    expect(f.tiles.first).toMatchObject({ b: 12, q: 7, r: 6, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 15, q: 6, r: 0, exact: true });
    expect([75 / 15, gcd(75, 90), 75 % 12]).toEqual([5, 15, 3]);
    // the drawings write « N ألواح », « N فِرق », « N رفًّا », « N بلاطات »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeGreaterThanOrEqual(3);
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.bridge.first.r).toBeGreaterThanOrEqual(3);
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
    // the misconceptions are really false: stopping at 30/48 (2 still divides both), « 63 is not prime » (yet only 1 is
    // common), 57/93 is not 60/96, 165/440 is not given reduced
    expect(gcd(30, 48)).toBe(6);
    expect(gcd(LK.lit, LK.whole)).toBe(1);
    expect(57 * 96).not.toBe(60 * 93);
    expect(MEMO.anticipated.find((a) => a.says.includes('نزعت')).says).toContain('\\frac{57}{93}');
    expect(gcd(RN, RD)).toBeGreaterThan(1);
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
    // every fraction a memo answer gives as its END is irreducible
    for (const t of [...MEMO.exit.map((e) => e.a), ...MEMO.criteria.map((c) => c.see)]) {
      const last = fractionsIn(t).at(-1);
      expect(gcd(...last), `${t}: ${last}`).toBe(1);
    }
    // the exit ticket: 187/253 by Euclid down to 11 → 17/23; 77/90 cannot be reduced; 3/8 + 7/24 = 16/24 = 2/3
    expect(divisions(187, 253).map((r) => r[3])).toEqual([66, 55, 11, 0]);
    expect([187 / 11, 253 / 11]).toEqual([17, 23]);
    expect(gcd(77, 90)).toBe(1);
    expect(gcd(16, 24)).toBe(8);
    // the extension: a fraction above 100 reduced in three stages or more by prime numbers exists; consecutive numbers
    // never share a divisor; two irreducible fractions whose sum can be reduced (1/6 + 1/3 = 3/6)
    const { above, stages } = MEMO.extendCheck;
    const primeFactors = (k) => {
      let [m, c] = [k, 0];
      for (let p = 2; p <= m; p += 1)
        while (m % p === 0) {
          m /= p;
          c += 1;
        }
      return c;
    };
    let found = 0;
    for (let x = above + 1; x <= above + 60; x += 1)
      for (let y = x + 1; y <= above + 80; y += 1) if (primeFactors(gcd(x, y)) >= stages) found += 1;
    expect(found).toBeGreaterThan(1);
    expect(MEMO.extend[0]).toContain(String(above));
    for (let k = 1; k <= 1000; k += 1) expect(gcd(k, k + 1)).toBe(1);
    expect([gcd(1, 6), gcd(1, 3), gcd(1 + 2, 6)]).toEqual([1, 1, 3]);
    // the support: 6/8 and 9/12 both reduce
    expect([gcd(6, 8), gcd(9, 12)]).toEqual([2, 3]);
  });

  it('uses no pair of the lesson’s exercise bank (the board and the memo are the platform’s own numbers)', () => {
    expect(bankTexts.length).toBe(50);
    expect(BANK_PAIRS.length).toBeGreaterThan(50);
    const ours = [
      [BR.lit, BR.whole],
      [LK.lit, LK.whole],
      [EU.lit, EU.whole],
      [RN, RD],
      [64, 88],
      [46, 75],
      [23, 84],
      [72, 84],
      [155, 186],
      [20, 50],
      [84, 144],
      [75, 90],
      [187, 253],
      [77, 90],
    ];
    for (const p of ours) expect(inBank(p), p.join(' ; ')).toBe(false);
  });
});
