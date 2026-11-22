// « الامتحان الأبيض » of qasim-mushtarak-akbar: the REAL bank (content/practice/4am/qasim-mushtarak-akbar), served as it is — every level draws
// real sheets, every step of every sheet is markable to full points by its own answer key, nothing generated, « دج » only.
import { describe, it, expect, beforeAll } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { keysOfPoints } from '../../../../../../common/gameworld/kit/bankSitting';
import { allQuestions, forgotten } from '../../../../../../common/gameworld/kit/sitting';
import { lesson } from './index';
import { sittings, LEVELS } from './sitting';

/** The answer the bank's own key expects, in the shape the practice widgets write. */
const right = (q) =>
  q.answerType === 'choice'
    ? { choiceId: q.bank.choices.find((c) => c.isCorrect).id }
    : q.paper
      ? undefined
      : { value: String(q.bank.expectedAnswer) };
const keyOf = keysOfPoints('qasim-mushtarak-akbar', lesson);
const shown = (q) => [
  q.text,
  q.lead,
  q.shown.statement,
  q.shown.answerFormat,
  ...(q.shown.choices ?? []).map((c) => c.content),
  ...sittings.model(q),
  ...sittings.guide(q),
  sittings.written(q, right(q)),
];
/** « DA » left as MONEY: glued to a number or after one (« 900DA », `$1500$ DA`, `11225\,DA`), `\text{ DA}`, « (DA) ». */
const MONEY_DA = /(?:\d\$?|\\,|\\text\{)\s*DA(?![A-Za-z])|\(\s*DA\s*\)|بال(?:ـ|دينار)\s*DA(?![A-Za-z])/;

describe('the sitting of qasim-mushtarak-akbar — the bank as it is', () => {
  beforeAll(() => sittings.prepare());

  it('loads the five levels of the bank: ten exam sheets each, with their minutes and points on the ladder', () => {
    expect(sittings.ready()).toBe(true);
    expect(LEVELS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5]);
    for (const L of LEVELS) {
      expect(sittings.levelPoints(L), `level ${L.n}`).toBeTruthy();
      expect(sittings.levelMinutes(L), `level ${L.n}`).toBeTruthy();
    }
  });

  it('serves real sheets, whole, and every step earns its points with the answer the bank expects', () => {
    const seen = new Set();
    for (const L of LEVELS)
      for (let seed = 1; seed <= 30; seed += 1) {
        const s = sittings.makeSubject(rng(seed * 7 + L.n), L.n, [], keyOf);
        const qs = allQuestions(s);
        expect(s.exercises).toHaveLength(L.sheets);
        expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
        for (const e of s.exercises) {
          seen.add(e.bankId);
          expect(e.bankId).toMatch(new RegExp(`^ex-4am-qasim-mushtarak-akbar-l${L.n}-\\d{3}$`));
          expect(e.questions.reduce((t, q) => t + q.points, 0)).toBe(e.points);
        }
        const full = Object.fromEntries(qs.map((q) => [q.id, right(q)]));
        expect(sittings.totalMark(s, full), s.exercises.map((e) => e.bankId).join()).toBe(s.total);
        expect(sittings.totalMark(s, {})).toBe(0);
        expect(forgotten(s, full, 0)).toEqual([]);
        for (const q of qs) {
          expect(sittings.model(q).length, q.id).toBeGreaterThan(0);
          expect(sittings.scheme(q).length).toBeGreaterThan(0);
          if (q.key) expect(lesson.keys).toContain(q.key);
          for (const line of shown(q).filter(Boolean)) {
            expect(line).not.toMatch(MONEY_DA);
            expect(line).not.toMatch(/undefined|NaN/);
          }
        }
        for (const e of s.exercises)
          for (const line of [
            e.statement,
            ...e.formulas,
            ...(e.table ? [...e.table.head, ...e.table.rows.flat()] : []),
          ])
            expect(String(line)).not.toMatch(MONEY_DA);
      }
    expect(seen.size).toBeGreaterThan(30); // the sheets vary: the bank is drawn from, not one fixed paper
  });

  it('hands in only the steps he answered, as he wrote them, for the server to judge again', () => {
    const s = sittings.makeSubject(rng(3), 2, [], keyOf);
    const qs = allQuestions(s).filter((q) => !q.paper);
    const answers = { [qs[0].id]: right(qs[0]) };
    let n = 0;
    const sheet = sittings.sheetOf(s, answers, () => `id-${(n += 1)}`);
    expect(sheet).toMatchObject({ lesson: 'qasim-mushtarak-akbar', level: 2 });
    expect(sheet.items).toEqual([
      {
        exerciseId: s.exercises[0].bankId,
        questionId: qs[0].qid,
        attemptUuid: expect.any(String),
        answer: right(qs[0]),
        outcome: 'correct',
      },
    ]);
  });

  it('ADAPTS the next sheet: the sheet he missed is left out while the level has others', () => {
    const s = sittings.makeSubject(rng(9), 1, [], keyOf);
    const weak = sittings.weakKinds(s, {});
    expect(weak).toContain(`ex:${s.exercises[0].bankId}`);
    for (let seed = 1; seed <= 10; seed += 1)
      expect(sittings.makeSubject(rng(seed), 1, weak, keyOf).exercises[0].bankId).not.toBe(s.exercises[0].bankId);
  });
});
