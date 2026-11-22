import { describe, it, expect } from 'vitest';
import { SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, SPYGLASS, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, cellsOf, fills } from '../../../../../../../features/classSession/lessonScripts';
// what `LessonBoard › Ask` draws for a choice: the bridge of the gap and that plank — `held` colours it
import { outcome } from '../../../../../../common/gameworld/divisorIsles/ruleForge';

/** « حصّة القسم » of « القسمة الإقليدية »: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
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
/** Checks an equality; returns how many arithmetic sides it compared (0 = nothing to check: letters only). */
function checkEquality(f) {
  if (!f.includes('=')) return 0;
  const v = sides(f)
    .map(value)
    .filter((x) => x !== null);
  if (v.length < 2) return 0;
  for (const x of v) expect(x, f).toBe(v[0]);
  return v.length;
}

const { count: C, groups: GR, rebuild: RB, cable: CB } = NUMBERS;

describe('القسمة الإقليدية — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and a short oral question for each', () => {
    // the opening, then ONE question and ONE name per key (five keys), then the copybook: two keys a page
    expect(SCRIPT.steps.map((s) => s.kind)).toEqual([
      'situation',
      ...lesson.keys.flatMap(() => ['ask', 'name']),
      'trace',
      'trace',
      'trace',
    ]);
    expect(SCRIPT.steps).toHaveLength(14);
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    for (const s of SCRIPT.steps.filter((x) => x.kind === 'trace')) expect(s.tablets.length).toBeLessThanOrEqual(2);
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false);
    for (const s of SCRIPT.steps) {
      expect(s.cue.length, `${s.id}.cue`).toBeLessThanOrEqual(70); // cut in the footer at 1024 px otherwise
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
    }
    expect(JSON.stringify(SCRIPT)).not.toMatch(/الكتاب|DA\b/);
  });

  it('never names a key before the class has acted on it: every name follows an « ask », no title before its name', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(SCRIPT.steps[i - 1].kind, s.id).toBe('ask');
    });
    for (const n of names) {
      const before = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(n));
      const said = before.map((s) => [s.title, s.text, s.question, s.after, s.cue].join(' ')).join(' ');
      expect(said, n.tablet).not.toContain(TABLETS[n.tablet].title);
    }
  });

  it('opens on the gap of island C: full planks, then cells too few for another plank', () => {
    const { bridge } = step('situation');
    expect(bridge).toEqual({ a: GR.a, b: GR.moulds[0] });
    expect(bridge).toEqual({ a: 45, b: 8 });
    expect(div(45, 8)).toEqual({ q: 5, r: 5 });
    expect(bridge.a).toBeLessThanOrEqual(60); // the big bridge draws one slot per cell
  });

  it('THE RIGHT ANSWER OF EVERY « ask » IS A BRIDGE THAT HOLDS — the board colours a choice by « it fills the gap »', () => {
    // `LessonBoard › Ask` draws each choice as a bridge: green when the plank fills the gap, amber and falling when
    // it does not. A right answer that left cells empty would be shown as a fallen bridge.
    for (const s of ask) {
      expect(s.answer.length, s.id).toBeGreaterThan(0);
      expect(
        s.options.filter((o) => outcome(s.a, o).held),
        s.id,
      ).toEqual(s.answer);
      for (const o of s.answer) expect(fills(s, o) && o <= s.a, `${s.id}: ${o}`).toBe(true);
      // …and a plank that is NOT the answer falls: the class explains it with its division
      for (const o of s.options.filter((x) => !s.answer.includes(x)))
        expect(s.a % o, `${s.id}: ${o}`).toBeGreaterThan(0);
      expect(s.options.length - s.answer.length, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('every answer of an « ask » is exactly the planks its question asks for, computed', () => {
    expect(ask.map((s) => s.id)).toEqual(['count', 'grow', 'rebuild', 'scope', 'cable']);
    const right = {
      // exactly 5 full planks and nothing left
      count: (s, o) => div(s.a, o).q === 5 && div(s.a, o).r === 0,
      // the gap one cell longer: nothing is left
      grow: (s, o) => div(s.a, o).r === 0,
      rebuild: (s, o) => s.a % o === 0,
      // a number of planks between 20 and 30, and the bridge filled
      scope: (s, o) => div(s.a, o).q >= 20 && div(s.a, o).q < 30 && div(s.a, o).r === 0,
      // every cabin full and nobody left at the station
      cable: (s, o) => div(s.a, o).r === 0,
    };
    for (const s of ask) {
      expect(
        s.options.filter((o) => right[s.id](s, o)),
        s.id,
      ).toEqual(s.answer);
      expect(s.answer.length, s.id).toBeGreaterThan(0);
      expect(askRight(s, [...s.answer].reverse()), s.id).toBe(true);
      expect(askRight(s, s.options), s.id).toBe(false); // picking every plank is not the answer
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.text + s.after, s.id).toContain('$');
      // readable bars: a choice never draws more than a few dozen planks
      for (const o of s.options) expect(div(s.a, o).q, `${s.id}: ${o}`).toBeLessThanOrEqual(40);
    }
    // count: 30 cells — the plank 6 goes in 5 times and fills it; the plank 4 goes in 7 times, the eighth needs 32
    expect(step('count').a).toBe(C.a);
    expect(step('count').answer).toEqual([6]);
    expect(div(30, 4)).toEqual({ q: 7, r: 2 });
    expect(4 * 8).toBe(32);
    expect(step('count').after).toContain('$4 \\times 8 = 32$');
    // grow: 47 = 8 × 5 + 7, the longest leftover of a plank of 8; one cell more, 48 = 8 × 6: only 8 fills it
    expect(div(47, GR.probe)).toEqual({ q: 5, r: GR.probe - 1 });
    expect(step('grow').a).toBe(48);
    expect(step('grow').answer).toEqual([GR.probe]);
    expect(step('grow').text).toContain('$47 = 8 \\times 5 + 7$');
    expect(div(48, 7)).toEqual({ q: 6, r: 6 }); // the plank 7 leaves ITS longest leftover on the same gap
    // rebuild: 8 × 7 + 7 = 63, filled by 7 and 9
    expect(RB.probe * div(RB.a, RB.probe).q + div(RB.a, RB.probe).r).toBe(RB.a);
    expect(div(63, 8)).toEqual({ q: 7, r: 7 });
    expect(step('rebuild').answer).toEqual([7, 9]);
    // scope: an old bridge the spyglass plank fills, 27 × 20 = 540 ≤ 675 < 810 = 27 × 30, and 675 = 27 × 25
    expect(step('scope').a).toBe(SPYGLASS.b * 25);
    expect(step('scope').answer).toEqual([SPYGLASS.b]);
    expect(SPYGLASS.tens).toBe(20);
    expect(27 * 20 <= 675 && 675 < 27 * 30).toBe(true);
    expect(div(675, 35).q).toBe(19); // 35 × 20 = 700 > 675
    expect(div(675, 18).q).toBe(37); // 18: more than 30 planks
    // cable: 78 travellers — cabins of 13 are all full (6 of them); cabins of 8: 9 full, 6 travellers left, 10 needed
    expect(step('cable').a).toBe(CB.a);
    expect(step('cable').options).toContain(CB.b);
    expect(step('cable').answer).toEqual([13]);
    expect(div(CB.a, CB.b)).toEqual({ q: 9, r: 6 });
    expect(step('cable').after).toContain('$78 = 8 \\times 9 + 6$');
    expect(step('cable').after).toMatch(/فتلزم 10\.$/);
  });

  it('writes only true equalities in what the class reads', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          expect(checkEquality(f), f).toBeGreaterThanOrEqual(2);
          expect(f, s.id).not.toMatch(/[×*]/); // LaTeX « \\times », never a raw sign
          n += 1;
        }
    expect(n).toBeGreaterThanOrEqual(14);
  });

  it('says counts with the agreed words', () => {
    expect(step('count').question).toContain('ندخل 5 ألواح كاملة بالضبط');
    expect(step('count').cue).toBe('مع اللوح 4: لماذا نتوقّف عند 7 ألواح؟');
    expect(step('grow').text).toContain('تترك 7 خانات فارغة');
    expect(step('grow').after).toContain('8 خانات فارغة أخذت لوحًا آخر');
    expect(step('rebuild').text).toContain('7 ألواح كاملة');
    expect(step('rebuild').text).toContain(`${cellsOf(7)} فارغة`);
    expect(step('scope').after).toContain('بين 20 و 30 لوحًا');
    expect(step('cable').text).toContain('78 مسافرًا');
    expect(step('cable').after).toContain('تمتلئ 6 عربات');
    expect(step('cable').after).toContain('ويبقى 6 مسافرين');
    // « بلوح واحد من هذه الألواح » read as ONE single plank: no step says it any more
    expect(JSON.stringify(SCRIPT)).not.toMatch(/بلوح واحد|قارب|قوارب/);
    // no count glued to a word that does not agree
    for (const s of SCRIPT.steps)
      for (const t of [s.title, s.text, s.question, s.after, s.cue].filter(Boolean)) {
        expect(t, s.id).not.toMatch(/(^|[^\d])[12] (خانات|خانة|ألواح|لوحًا|عربات|عربة)/);
        expect(t, s.id).not.toMatch(/(^|[^\d])(1[1-9]|[2-9]\d) (خانات|ألواح|عربات)/);
      }
  });

  it('asks oral questions whose numbers are true', () => {
    expect(div(50, 6)).toEqual({ q: 8, r: 2 }); // name-1
    expect([0, 1, 2, 3, 4].every((r) => r < 5)).toBe(true); // name-2: the remainders of 5
    // name-3: Reem stops one plank too early — 63 = 8 × 6 + 15 is true arithmetic, and 15 cells take another plank
    expect(step('name-3').cue).toBe('ريم: «في 63 خانة 6 ألواح طولها 8، وتبقى 15». أين الخطأ؟');
    expect(8 * 6 + 15).toBe(RB.a);
    expect(15).toBeGreaterThanOrEqual(RB.probe);
    expect(23 * 20 <= 500 && 500 < 23 * 30).toBe(true); // name-4: tens 20
    expect(div(500, 23)).toEqual({ q: 21, r: 17 });
    // cable: with cabins of 8, 9 are not enough
    expect(step('cable').cue).toBe('مع حمولة 8: كم عربة تلزم ليعبر الجميع؟ ولماذا ليست 9؟');
    // name-5: 50 pupils, tables of 6 — 8 full tables, 2 pupils left, 9 tables needed
    expect(div(50, 6)).toEqual({ q: 8, r: 2 });
    expect(Math.ceil(50 / 6)).toBe(9);
    // grow: the plank 8 never leaves 8 cells — the most is 7
    expect(step('grow').cue).toBe('هل تبقى 8 خانات فارغة مع اللوح 8؟ وما أكثر ما يتركه؟');
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the five keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w);
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet));
    expect(traced.every((id) => lesson.rules[id].math.length > 0 && lesson.rules[id].math.length <= 2)).toBe(true);
  });
});

describe('القسمة الإقليدية — the written memo', () => {
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
    const all = JSON.stringify(MEMO);
    expect(all).not.toContain('وضع القسم');
    expect(all).not.toMatch(/الكتاب|DA\b/);
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
    // the drawings write « N ألواح — تبقى N خانات », « N في كلّ فريق », « N رفًّا », « N بلاطات »: the words agree
    expect(f.bridge.first).toMatchObject({ q: 5, r: 5, exact: false });
    expect(f.bridge.first.q).toBeGreaterThanOrEqual(3);
    expect(f.bridge.first.r).toBeGreaterThanOrEqual(3);
    expect(f.bridge.first.r).toBeLessThanOrEqual(10);
    expect(MEMO.openings[0].expect).toContain('6 ألواح');
    expect(f.teams.first).toMatchObject({ b: 4, q: 7, r: 3 });
    expect(4 * 8).toBe(32); // « 4 فِرق من 8 تحتاج 32 لاعبًا »
    expect(f.shelves.first).toMatchObject({ b: 12, q: 12, r: 6, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 10, q: 15, r: 0, exact: true });
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
    expect(f.tiles.first).toMatchObject({ b: 8, q: 8, r: 6, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 7, q: 10, r: 0, exact: true });
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
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
    expect(15).toBeGreaterThanOrEqual(8); // 63 = 8 × 6 + 15: the leftover holds another plank
    expect(div(52, 6).r).not.toBe(7);
    expect(27 * 2 <= 69 && 69 < 27 * 3).toBe(true); // « 27 goes twice in 69 » — tens, not units
    expect(div(692, 27).q).toBe(25);
  });

  it('writes only true equalities: the criteria, the glance, the anticipated answers, the exit ticket', () => {
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
    for (const t of texts) for (const f of formulas(t)) n += checkEquality(f) ? 1 : 0;
    expect(n).toBeGreaterThanOrEqual(12);
    expect(MEMO.glance.three[0]).toContain('45 = 8 \\times 5 + 5');
    expect(MEMO.criteria[2].see).toContain('63 = 8 \\times 6 + 15');
    expect(MEMO.exit).toHaveLength(4);
    expect(MEMO.exit[1].a).toContain('لا');
    expect(8).toBeGreaterThan(7); // exit 2: the leftover 8 is too big for 7
    expect(32 * 20 <= 815 && 815 < 32 * 30).toBe(true); // exit 3
    // exit 4: 110 pupils, buses of 25 — 4 full, 10 pupils left, 5 needed, 15 seats empty in the fifth
    expect(div(110, 25)).toEqual({ q: 4, r: 10 });
    expect([Math.ceil(110 / 25), 25 - 10]).toEqual([5, 15]);
    expect(MEMO.exit[3].a).toContain('فتلزم 5 حافلات');
    expect(MEMO.exit[3].a).toContain('15 مقعدًا');
    // the fifth criterion and the answer a class gives too fast: the station of the board
    expect(MEMO.criteria).toHaveLength(5);
    expect(MEMO.criteria[4].see).toBe('يقول: $78 = 8 \\times 9 + 6$، تمتلئ 9 عربات ويبقى 6 مسافرين، فتلزم 10 عربات.');
    expect(MEMO.anticipated.some((x) => x.kind === 'miss' && x.says.includes('9 عربات تكفي'))).toBe(true);
    expect(MEMO.written).toHaveLength(5);
    // the order of the answers on the board follows the script: its five questions
    expect(MEMO.sequence).toHaveLength(6);
    expect(MEMO.sequence[1]).toContain('اللوح 6 خمس مرّات');
    expect([C.a / C.plank, div(C.a, C.probe).q]).toEqual([5, 7]);
    expect(MEMO.sequence[2]).toContain('47 خانة');
    expect(MEMO.sequence[2]).toContain('48 خانة');
    expect(div(47, GR.probe).r).toBe(7);
    expect(JSON.stringify(MEMO)).not.toMatch(/قارب|قوارب|أنس|جسر المرفأ/);
    // the extension
    const { biggest, number, all } = MEMO.extendCheck;
    expect(div(biggest.a, biggest.b).r).toBe(biggest.b - 1);
    expect(number.a).toBe(number.b * number.q + (number.b - 1));
    expect(div(number.a, number.b)).toEqual({ q: number.q, r: number.b - 1 });
    const found = Array.from({ length: 60 }, (_, k) => k).filter((x) => div(x, all.b).q === all.q);
    expect([found[0], found.at(-1)]).toEqual([all.from, all.to]);
    // the support: 14 = 3 × 4 + 2
    expect(div(14, 3)).toEqual({ q: 4, r: 2 });
  });
});
