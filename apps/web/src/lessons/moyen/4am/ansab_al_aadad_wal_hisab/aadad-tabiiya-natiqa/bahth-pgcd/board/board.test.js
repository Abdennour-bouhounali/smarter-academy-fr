import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { BOARD, KEYS, LADDERS, SCRIPT, differences, divisions, divisionsOf, subtractionsOf } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, askWords, fills } from '../../../../../../../features/classSession/lessonScripts';
import { outcome } from '../../../../../../common/gameworld/divisorIsles/ruleForge';

/** « حصّة القسم » of lesson 6: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const common = (a, b) => divisors(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
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
 * The truth of an equality written in LaTeX: every arithmetic side of « x = y = z » evaluated, all equal; every side
 * « PGCD(a ; b) » re-computed and all of them equal to each other and to the number the chain ends on.
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
  // a side that is neither arithmetic nor a PGCD would be skipped silently: there is none
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
  baqi: P,
  euclid: [E1, E2],
  race: R,
} = BOARD;

/**
 * The lesson's exercise bank (content/practice/4am/bahth-pgcd, read at every run): every pair it computes a PGCD of
 * (« PGCD(a ; b) », « a و b »), and, per exercise, every number it writes — two numbers of the board met in ONE exercise
 * are a pair of the bank too.
 */
const BANK_DIR = new URL('../../../../../../../../../../content/practice/4am/bahth-pgcd/', import.meta.url);
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

describe('البحث عن القاسم المشترك الأكبر — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and an oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps).toHaveLength(14);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(3);
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // forged in the world
    // what the board draws as plain text holds no formula (the cue, the question, the title)
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
    // the cue of a name station is read WITH its tablet: it may hold the name, the stations before may not.
    // The words the design gives the five keys (BATCH_2_DESIGN.md §7), whatever the tablets' wording becomes:
    expect(before(names[0])).not.toMatch(/يحفظ/);
    expect(before(names[1])).not.toMatch(/خوارزمي|آخر فرق|غير معدوم/);
    expect(before(names[2])).not.toMatch(/الباقي/); // « يحفظ » is key 1's word, said after its name
    expect(before(names[3])).not.toMatch(/إقليدس|آخر باق|غير معدوم/);
    expect(before(names[4])).not.toMatch(/أسرع|الخوارزميتين|أقلّ خطوات/);
  });

  it('opens on the carpenter of the board, with his own numbers — never the student’s story', () => {
    expect(step('situation').bridge).toEqual({ a: A, b: F });
    expect([A, B, F]).toEqual([245, 175, 49]);
    expect(outcome(A, F).held).toBe(true); // the plank 49 fills the first stream: 5 planks
    expect(A / F).toBe(5);
    expect(B % F).toBe(28); // … and leaves 28 cells of the second
    expect(step('situation').text).toContain('الأولى 245 خانة والثانية 175 خانة');
    // the story's numbers are the world's, never the board's: no long number of the board, no pair of the board
    const story = new Set(numbersIn(JSON.stringify(NUMBERS)));
    const pairs = [
      [A, B],
      [B, A - B],
      [P.a, P.b],
      [P.b, P.a % P.b],
      [E1, E2],
      [R.a, R.b],
    ];
    for (const [x, y] of pairs) expect(story.has(x) && story.has(y), `${x} ; ${y} in the story`).toBe(false);
    for (const n of [...pairs.flat(), ...LADDERS.euclid.flat(), ...LADDERS.differences.flat()].filter((x) => x >= 100))
      expect(story.has(n), `${n} in the story`).toBe(false);
  });

  it('every answer of an « ask » is exactly the planks that fill its gap — and what its key says', () => {
    expect(ask.map((s) => s.id)).toEqual(['farq', 'tarh', 'baqi', 'iqlidis', 'sibaq']);
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
      expect(s.answer.length, s.id).toBeGreaterThanOrEqual(1);
      expect(s.options.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.options.length, s.id).toBeLessThanOrEqual(6); // one row on the board
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.options.every((o) => o <= s.a)).toBe(true); // no plank longer than its gap
      expect(s.text + s.after, s.id).toContain('$'); // its proof is written
      expect(s.words, `${s.id}: every question is about planks over a stream`).toBeUndefined();
      expect(askWords(s)).toEqual({ card: 'لوح', held: 'يثبت', fell: 'ينهار' });
    }
    // ➖ farq: the planks of 175 tried on 245 − 175 = 70; those that fill 70 are those that fill 245
    const farq = step('farq');
    expect(farq.a).toBe(A - B);
    expect(farq.a).toBe(70);
    expect(farq.options.every((o) => B % o === 0)).toBe(true);
    expect(farq.answer).toEqual([5, 7, 35]);
    expect(farq.answer).toEqual(farq.options.filter((o) => A % o === 0));
    expect(common(A, B)).toEqual(common(B, A - B));
    expect(farq.after).toContain('245 = 5 \\times 49 = 7 \\times 35 = 35 \\times 7');
    expect(farq.after).toContain('245 = 25 \\times 9 + 20');
    expect(farq.text).toContain('175 = 1 \\times 175 = 5 \\times 35 = 7 \\times 25');
    // 🪜 tarh: the ladder of differences of the carpenter's streams; of its numbers only the last before 0 fills 245
    const tarh = step('tarh');
    expect(LADDERS.differences).toEqual([
      [245, 175, 70],
      [175, 70, 105],
      [105, 70, 35],
      [70, 35, 35],
      [35, 35, 0],
    ]);
    expect(tarh.options).toEqual([70, 105, 35]);
    expect(tarh.answer).toEqual([gcd(A, B)]);
    expect(gcd(A, B)).toBe(35);
    expect(tarh.options.filter((o) => B % o === 0 && A % o === 0)).toEqual(tarh.answer); // fills BOTH streams too
    expect(tarh.text).toContain('245 - 175 = 70');
    expect(tarh.text).toContain('105 - 70 = 35');
    expect(tarh.after).toContain('35 - 35 = 0');
    // 🧮 baqi: 75 taken away five times from 405 leaves 30 — one division; the planks of 75 that fill 30 fill 405
    const baqi = step('baqi');
    expect([Math.floor(P.a / P.b), P.a % P.b]).toEqual([5, 30]);
    expect(baqi.a).toBe(30);
    expect(baqi.options.every((o) => P.b % o === 0)).toBe(true);
    expect(baqi.answer).toEqual([3, 5, 15]);
    expect(baqi.answer).toEqual(baqi.options.filter((o) => P.a % o === 0));
    expect(common(P.a, P.b)).toEqual(common(P.b, P.a % P.b));
    expect(baqi.text).toContain('405 - 75 - 75 - 75 - 75 - 75 = 30');
    expect(baqi.text).toContain('405 = 75 \\times 5 + 30');
    expect(baqi.after).toContain('405 = 25 \\times 16 + 5');
    // 🔁 iqlidis: the ladder of divisions; the plank 477 over 1325 draws its first row; only 53 fills 1325
    const iq = step('iqlidis');
    expect(LADDERS.euclid).toEqual([
      [1325, 477, 2, 371],
      [477, 371, 1, 106],
      [371, 106, 3, 53],
      [106, 53, 2, 0],
    ]);
    expect(iq.options).toEqual([477, 371, 106, 53]);
    expect(iq.answer).toEqual([53]);
    expect(gcd(E1, E2)).toBe(53);
    expect(E2 % 53).toBe(0);
    expect(outcome(E1, E2)).toMatchObject({ q: 2, r: 371 }); // the card of 477 IS the first division
    expect(iq.after).toContain('1325 = 53 \\times 25');
    expect(iq.after).toContain('477 = 53 \\times 9');
    expect(iq.cue).toContain('قسمة 371 على 106');
    // ⏱️ sibaq: two divisions where the differences take 28 subtractions
    const sb = step('sibaq');
    expect(LADDERS.race).toEqual([
      [1064, 42, 25, 14],
      [42, 14, 3, 0],
    ]);
    expect(sb.answer).toEqual([2, 7, 14]);
    expect(sb.answer).toEqual(divisors(gcd(R.a, R.b)).filter((d) => sb.options.includes(d)));
    expect(sb.options.every((o) => R.b % o === 0)).toBe(true);
    expect(LADDERS.steps).toEqual({
      carpenter: { sub: 5, div: 3 },
      euclid: { sub: 8, div: 4 },
      race: { sub: 28, div: 2 },
    });
    // the subtractions are the sum of the quotients: each division takes its quotient's worth of subtractions
    for (const [a, b] of [
      [A, B],
      [E1, E2],
      [R.a, R.b],
    ])
      expect(differences(a, b).length).toBe(divisions(a, b).reduce((s, r) => s + r[2], 0));
    expect(sb.text).toContain('مكان 25 عملية طرح للعدد 42');
    expect(sb.after).toContain('بالقسمة قسمتان، وبالفروق 28 عملية طرح');
    expect(sb.after).toContain('ومع 245 و 175: 3 قسمات و 5 عمليات طرح');
    expect(sb.after).toContain('ومع 1325 و 477: 4 قسمات و 8 عمليات طرح');
  });

  it('writes only true equalities in what the class reads (situation, questions, what comes after)', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          checkEquality(f);
          n += 1;
        }
    expect(n).toBeGreaterThanOrEqual(25);
    // the formulas are LaTeX: « \\times », never a raw « × » or « * »
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*]/);
    // a formula of the board is short enough for one line of the station (no chain longer than six terms)
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' ')))
        expect(f.replace(/\\[a-zA-Z]+/g, 'x').length, `${s.id}: ${f}`).toBeLessThanOrEqual(46);
    // a number of cells agrees with its noun (11 and more: « خانة »)
    expect(step('baqi').text).toContain('405 خانة و 75 خانة');
    expect(step('farq').text).toContain('قطعة من 70 خانة');
    // formulas one after the other are joined with a no-break space BEFORE the comma: never a plain space there
    for (const s of SCRIPT.steps) expect(said(s), s.id).not.toMatch(/[\d$] ،/);
  });

  it('agrees the counts of steps in Arabic', () => {
    expect([1, 2, 5, 11, 28].map(subtractionsOf)).toEqual([
      'عملية طرح واحدة',
      'عمليتا طرح',
      '5 عمليات طرح',
      '11 عملية طرح',
      '28 عملية طرح',
    ]);
    expect([1, 2, 3, 11].map(divisionsOf)).toEqual(['قسمة واحدة', 'قسمتان', '3 قسمات', '11 قسمة']);
  });

  it('keeps every oral question inside its footer and every tablet inside its card (CLASS_SESSION.md §5ter)', () => {
    for (const s of SCRIPT.steps)
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
    // a Latin name inside an Arabic cue would be scrambled by the bidi algorithm: the cues say it in Arabic
    for (const s of SCRIPT.steps) expect(s.cue, s.id).not.toMatch(/PGCD|[a-zA-Z]/);
    // a tablet shown on a naming station is short: a method line or two, two short rows of formulas (defects B17)
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
      expect(t.math.length, key).toBeGreaterThanOrEqual(1);
      expect(t.math.length, key).toBeLessThanOrEqual(2);
      // 28 characters, the measure of the earlier boards; an equality of two PGCDs (keys ➖ and 🧮: « PGCD(962 ; 296) =
      // PGCD(296 ; 74) », 32) cannot be shorter — that row is allowed 32, and its naming station must be LOOKED at
      // at 1024×768 (not measured in a browser when this test was written)
      for (const row of t.math) {
        const two = (row.match(/PGCD/g) ?? []).length === 2;
        expect(drawn(row.replace('\\qquad', '  ')).length, `${key}: ${row}`).toBeLessThanOrEqual(two ? 32 : 28);
      }
    }
  });

  it('asks oral questions whose numbers are true', () => {
    // name-1: 102 replaced by 102 − 72 = 30 keeps the PGCD
    expect(gcd(102, 72)).toBe(gcd(72, 102 - 72));
    expect(gcd(72, 30)).toBe(6);
    // name-2: the differences of 45 and 27 end on 9
    expect(differences(45, 27).map((r) => r[2])).toEqual([18, 9, 9, 0]);
    expect(gcd(45, 27)).toBe(9);
    // name-3: 244 = 52 × 4 + 36, the pair (52 ; 36)
    expect(244 % 52).toBe(36);
    expect(gcd(244, 52)).toBe(gcd(52, 36));
    // name-4: 132 and 54, three divisions, the last remainder before 0 is 6
    expect(divisions(132, 54)).toEqual([
      [132, 54, 2, 24],
      [54, 24, 2, 6],
      [24, 6, 4, 0],
    ]);
    // name-5: 410 and 12, 40 subtractions and 2 divisions
    expect([differences(410, 12).length, divisions(410, 12).length]).toEqual([40, 2]);
    expect(step('name-5').cue).toContain('410 و 12');
    // the cues of the stations
    expect(step('sibaq').cue).toContain('نطرح 42 من 1064 قبل أن يبقى 14');
    expect(step('situation').cue).toContain('الساقية 175');
    expect(B % F).not.toBe(0);
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the five keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(KEYS).toEqual(lesson.keys); // the board and the world name the same keys
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the five keys, in order
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace').every((s) => s.tablets.length <= 2)).toBe(true);
  });
});

describe('البحث عن القاسم المشترك الأكبر — the written memo', () => {
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
    expect(MEMO.criteria).toHaveLength(5); // one per الكفاءة of the lesson (P1–P5)
    expect(MEMO.written).toHaveLength(5); // one per key
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
      ...MEMO.support,
      ...MEMO.extend,
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
    // bridge: 245 cells, planks of 49: 5 planks, nothing left (« 5 ألواح »)
    expect(f.bridge.first).toMatchObject({ q: 5, r: 0, exact: true });
    expect(MEMO.openings[0].expect).toContain('5 ألواح');
    // teams: 45 and 72 players; 5 teams fit 45 and not 72; the differences reach 9 in five subtractions
    expect(f.teams.first).toMatchObject({ b: 5, q: 9, r: 0, exact: true });
    expect(72 % 5).not.toBe(0);
    expect(72 - 45).toBe(27);
    expect(gcd(72, 45)).toBe(9);
    expect(differences(72, 45)).toHaveLength(5);
    expect(MEMO.openings[1].why).toContain('الفرق 27');
    expect(common(72, 45)).toEqual(common(45, 27));
    // shelves: 312 stories and 132 science books — four divisions reach 12, the differences eight subtractions
    expect(gcd(312, 132)).toBe(12);
    expect(divisions(312, 132)).toHaveLength(4);
    expect(differences(312, 132)).toHaveLength(8);
    expect(f.shelves.first).toMatchObject({ b: 10, q: 31, r: 2, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 12, q: 26, r: 0, exact: true });
    expect(132 % 12).toBe(0);
    expect(MEMO.openings[2].expect).toContain('تبقى قصّتان');
    // tiles: 216 cm and 1544 cm, PGCD 8; tiles of 40 leave 16 cm, tiles of 24 fit 216 and not 1544
    expect(gcd(216, 1544)).toBe(8);
    expect(Math.floor(1544 / 216)).toBe(7);
    expect([differences(1544, 216).length, divisions(1544, 216).length]).toEqual([17, 4]);
    expect(f.tiles.first).toMatchObject({ b: 40, q: 5, r: 16, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 24, q: 9, r: 0, exact: true });
    expect(1544 % 24).not.toBe(0);
    // the drawings write « N ألواح / بلاطات », « N فِرق » and « N رفًّا »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeGreaterThanOrEqual(3);
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
    expect(f.teams.first.b).toBeGreaterThanOrEqual(3);
    expect(f.teams.first.b).toBeLessThanOrEqual(10);
    expect(f.teams.first.q).toBeLessThanOrEqual(10); // the players of a team drawn round its circle
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
    // the misconceptions are really false: the last quotient is not the PGCD, nor 0; subtracting from the first number
    // again comes back to the second
    const lastQ = LADDERS.euclid.at(-1)[2];
    expect(lastQ).toBe(2);
    expect(gcd(E1, E2)).not.toBe(lastQ);
    expect(E1 % lastQ).not.toBe(0);
    expect(A - (A - B)).toBe(B);
    expect(MEMO.anticipated.find((a) => a.kind === 'miss' && a.says.includes('العدد الأخير')).says).toContain(
      `هو ${lastQ}`,
    );
  });

  it('writes only true equalities: the criteria, the glance, the exit ticket, what is anticipated', () => {
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
        if (/[a-z]\b/.test(f.replace(/\\[a-zA-Z]+/g, ''))) continue; // a formula with letters (the rule) is not a number
        checkEquality(f);
        n += 1;
      }
    expect(n).toBeGreaterThanOrEqual(20);
    // the exit ticket: 144 and 84 by differences, 611 and 235 by Euclid, 2011 and 17 — the choice
    expect(differences(144, 84).map((r) => r[2])).toEqual([60, 24, 36, 12, 12, 0]);
    expect(gcd(144, 84)).toBe(12);
    expect(divisions(611, 235).map((r) => r[3])).toEqual([141, 94, 47, 0]);
    expect(gcd(611, 235)).toBe(47);
    expect([divisions(2011, 17).length, differences(2011, 17).length, gcd(2011, 17)]).toEqual([4, 125, 1]);
    expect(MEMO.exit[2].a).toContain('4 قسمات مكان 125 عملية طرح');
    expect(MEMO.criteria[4].see).toContain('قسمتان مكان 28 عملية طرح');
    expect(MEMO.connect).toContain('قسمتان مكان 28 عملية طرح');
    // the extension: pairs above 100 whose differences take exactly 3 subtractions — more than one; and the planks of
    // the carpenter not shorter than 6
    const { steps, above, least, streams } = MEMO.extendCheck;
    const pairs = [];
    for (let x = above + 1; x <= 400; x += 1)
      for (let y = above + 1; y < x; y += 1) if (differences(x, y).length === steps) pairs.push([x, y]);
    expect(pairs.length).toBeGreaterThan(1);
    expect(MEMO.extend[0]).toContain(`${steps} عمليات طرح`);
    expect(MEMO.extend[0]).toContain(String(above));
    expect(streams).toEqual([A, B]);
    expect(MEMO.extend[2]).toContain(String(least));
    expect(common(A, B).filter((d) => d >= least)).toEqual([7, 35]);
    // the extension's claim: Euclid never takes more steps than the differences (every pair up to 300)
    for (let x = 1; x <= 300; x += 1)
      for (let y = 1; y <= x; y += 1) expect(divisions(x, y).length).toBeLessThanOrEqual(differences(x, y).length);
    // the support: 20 and 12, 12 and 8, 8 and 4 keep the same PGCD
    expect([gcd(20, 12), gcd(12, 8), gcd(8, 4)]).toEqual([4, 4, 4]);
  });

  it('uses no pair of the lesson’s exercise bank (the board and the memo are the platform’s own numbers)', () => {
    expect(bankTexts.length).toBe(50);
    expect(BANK_PAIRS.length).toBeGreaterThan(50);
    const ours = [
      [A, B],
      [B, A - B],
      [P.a, P.b],
      [P.b, P.a % P.b],
      [E1, E2],
      [R.a, R.b],
      [102, 72],
      [72, 30],
      [45, 27],
      [244, 52],
      [52, 36],
      [132, 54],
      [410, 12],
      [45, 72],
      [312, 132],
      [216, 1544],
      [144, 84],
      [611, 235],
      [2011, 17],
    ];
    for (const p of ours) expect(inBank(p), p.join(' ; ')).toBe(false);
  });
});
