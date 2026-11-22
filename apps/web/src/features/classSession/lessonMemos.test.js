import { describe, it, expect } from 'vitest';
import { hasBoardMemo, MEMO_PARTS, partKeys, openingFacts } from './lessonMemos';
import { MEMO as memo } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/board/memo';
import { BOARD_LESSONS, MOMENTS } from './boardLessons';

const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;

describe('مذكّرة الدرس — the written memo of a lesson that has its board', () => {
  it('exists for the lessons that have a board, with every part a good lesson plan has', () => {
    for (const id of BOARD_LESSONS) expect(hasBoardMemo(id), id).toBe(true); // the memo is written with the script: one flag of the pack
    expect(hasBoardMemo('other')).toBe(false);
    expect(partKeys()).toEqual([
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'tiers',
    ]); // no notes part: his notes are « ملفّ الدرس »
    expect(MEMO_PARTS.map((g) => g.id)).toEqual(['before', 'during', 'after']);
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
      expect(memo[k], k).toBeTruthy();
  });

  it('runs the hour as « حصّة القسم » does: the four moments, in order, in a 45-minute hour', () => {
    expect(memo.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(memo.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(memo.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(memo.phases.map((p) => p.min)).toEqual(memo.glance.minutes.map((m) => m.min));
    expect(JSON.stringify(memo)).not.toContain('وضع القسم'); // the old mode no longer exists for this lesson
  });

  it('proposes several opening situations, the one of the class session among them, each with numbers that are true', () => {
    expect(memo.openings.length).toBeGreaterThanOrEqual(4);
    expect(memo.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(memo.openings.map((o) => o.kind)).size).toBe(memo.openings.length); // a different drawing for each
    const facts = Object.fromEntries(memo.openings.map((o) => [o.id, openingFacts(o)]));
    expect(facts.bridge.first).toEqual({ b: 4, q: 3, r: 3, exact: false });
    expect(facts.teams.first).toMatchObject({ q: 3, r: 3 });
    expect(facts.shelves.first).toMatchObject({ b: 32, q: 23, r: 20 });
    expect(facts.shelves.second).toMatchObject({ b: 36, q: 21, r: 0, exact: true });
    expect(facts.tiles.first).toMatchObject({ b: 25, q: 4, r: 20 });
    expect(facts.tiles.second).toMatchObject({ b: 30, q: 4, exact: true });
    for (const o of memo.openings) {
      expect(o.story).toContain(String(o.a));
      expect(openingFacts(o).first.exact, `${o.id}: the first try must leave something — the question is real`).toBe(
        false,
      );
    }
  });

  it('anticipates what students say — right answers and misconceptions — with a question to check and one to push forward', () => {
    expect(memo.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(memo.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of memo.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
  });

  it('writes only true equalities: the success criteria, the exit ticket, the extension', () => {
    for (const c of [...memo.criteria, ...memo.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    expect(memo.exit).toHaveLength(3);
    expect(memo.exit[1].a).toContain('لا');
    const { a, divisors } = memo.extendCheck;
    expect(Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0)).toEqual(divisors);
    for (const text of [memo.glance.three[1], memo.anticipated[1].says]) expect(text).toContain('48 = 6 \\times 8');
    expect(42 % 5).toBe(2);
    expect(47).toBe(6 * 7 + 5);
    expect(120 % 6).toBe(0);
  });
});
