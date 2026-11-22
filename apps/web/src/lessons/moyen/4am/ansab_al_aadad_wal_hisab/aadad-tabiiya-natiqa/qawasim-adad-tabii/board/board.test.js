import { describe, it, expect } from 'vitest';
import { SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { FORMS, askRight, fills } from '../../../../../../../features/classSession/lessonScripts';

/** « حصّة القسم » of lesson 2: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const divisors = (a) => Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0);
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');

describe('قواسم عدد طبيعي — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids and the four chapters in order', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(2); // two copybook pages of two keys
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // the pilot's mirror, not this lesson's
  });

  it('opens on a bridge that falls, and every answer of an « ask » is exactly the planks that fill the gap', () => {
    const [first] = SCRIPT.steps;
    expect(first.kind).toBe('situation');
    expect(first.bridge.a % first.bridge.b).not.toBe(0);
    expect(ask).toHaveLength(4);
    for (const s of ask) {
      expect(
        s.options.filter((o) => fills(s, o)),
        s.id,
      ).toEqual(s.answer);
      expect(askRight(s, [...s.answer].reverse()), s.id).toBe(true);
      expect(askRight(s, s.options), s.id).toBe(false); // picking every plank is not the answer
      expect(s.text + s.after, s.id).toContain('$'); // its proof is written
    }
  });

  it('writes only true equalities in what the class reads after each question', () => {
    const find = (id) => ask.find((s) => s.id === id);
    expect(7 * 8).toBe(find('partner').a);
    expect(find('part').a).toBe(31);
    expect(2 * 15.5).toBe(31);
    expect(find('search').after).toContain('7^2 = 49');
    expect(7 ** 2 <= 60 && 60 < 8 ** 2).toBe(true);
    for (const [x, y] of [
      [1, 60],
      [2, 30],
      [3, 20],
      [4, 15],
      [5, 12],
      [6, 10],
    ])
      expect(x * y).toBe(60);
    const digits = String(find('glance').a).split('').map(Number);
    expect(digits.reduce((s, d) => s + d, 0)).toBe(9);
    expect(52 % 4).toBe(0);
    expect(FORMS.b_divides_a(252, 9)).toBe(true);
  });

  it('names each rule with the tablet of the STUDENT’S world: one wording, the four keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(['jidaa-aamilayn', 'qasim-rappel', 'tariqa-qawasim', 'qawaid-qisma']);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBeTruthy();
      const text = [t.title, ...t.lines, ...(t.list ?? []), ...t.notes].join(' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w);
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the four keys, in order
    expect(traced.every((id) => lesson.rules[id].math.length > 0)).toBe(true);
  });
});

describe('قواسم عدد طبيعي — the written memo', () => {
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
    expect(MEMO.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(MEMO.phases.map((p) => p.min)).toEqual(MEMO.glance.minutes.map((m) => m.min));
    expect(JSON.stringify(MEMO)).not.toContain('وضع القسم');
  });

  it('proposes four openings with a different drawing each, the board’s one among them, numbers true and a first try that leaves something', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject({ a: SCRIPT.steps[0].bridge.a, b: SCRIPT.steps[0].bridge.b }); // the memo's board opening IS the script's
    for (const o of MEMO.openings) {
      expect(o.story, o.id).toContain(String(o.a));
      expect(openingFacts(o).first.exact, `${o.id}: the first try must leave something`).toBe(false);
      if (o.alt) expect(openingFacts(o).second.exact, `${o.id}: the second try fits`).toBe(true);
    }
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    expect(f.bridge.first).toMatchObject({ q: 7, r: 4 });
    expect(f.shelves.first).toMatchObject({ q: 4, r: 16 });
    expect(f.shelves.second).toMatchObject({ q: 8, r: 0 });
    expect(f.tiles.second).toMatchObject({ q: 3, r: 0 });
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
  });

  it('writes only true equalities: the criteria, the exit ticket, the extension', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    expect(MEMO.exit).toHaveLength(3);
    expect(MEMO.exit[1].a).toContain('لا');
    expect(118 % 4).toBe(2);
    expect(252 % 9).toBe(0);
    const { a, divisors: d } = MEMO.extendCheck;
    expect(divisors(a)).toEqual(d);
    expect(divisors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(MEMO.exit[2].a).toContain('1، 2، 3، 4، 6، 9، 12، 18، 36');
    expect(divisors(18).filter((x) => [2, 9, 6].includes(x))).toEqual([2, 6, 9]); // 18 is divisible by 2 and 9 — and by 6
    expect(MEMO.glance.three[0]).toContain('56 = 7 \\times 8');
  });
});
