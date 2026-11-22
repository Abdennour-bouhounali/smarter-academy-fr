import { describe, it, expect } from 'vitest';
import { ladder } from './practice';
import { KEYS, journey } from './journey';
import { emptyExam, examLevelOpen } from '../../../../../../common/gameworld/kit/journey';

const { LEVEL_ORDER, levelId } = ladder;
const { examOpen, nextExamLevel, applySitting, lessonProgress, nextStep } = journey;
const four = Object.fromEntries([0, 1, 2, 3].map((i) => [levelId(i, 0), { stars: 2, best: 600 }]));

describe("the student's road: the two practice spaces and the progress", () => {
  it('opens the exam space only after the gaming space was played', () => {
    expect(examOpen(KEYS, {})).toBe(false);
    expect(examOpen(KEYS, { [levelId(0, 0)]: { stars: 3 } })).toBe(false);
    expect(examOpen(KEYS, four)).toBe(true);
    expect(examOpen([], four)).toBe(false);
  });

  it('climbs the ladder: 80 % passes and promotes once; a miss keeps the level and remembers what to work on', () => {
    let exam = emptyExam();
    expect(examLevelOpen(exam, 1)).toBe(true);
    expect(examLevelOpen(exam, 2)).toBe(false);
    expect(nextExamLevel(exam)).toBe(1);
    let r = applySitting(exam, 1, 2, 3, ['division']);
    expect(r.result).toMatchObject({
      passed: false,
      stars: 0,
      promoted: false,
      weak: ['division'],
      fails: 1,
      nextLevel: null,
    });
    exam = r.exam;
    expect(exam.weak[1]).toEqual(['division']);
    expect(examLevelOpen(exam, 2)).toBe(false);
    r = applySitting(exam, 1, 3, 3, []);
    expect(r.result).toMatchObject({ passed: true, stars: 3, promoted: true, nextLevel: 2, fails: 0 });
    exam = r.exam;
    expect(exam.weak[1]).toEqual([]);
    expect(examLevelOpen(exam, 2)).toBe(true);
    expect(nextExamLevel(exam)).toBe(2);
    r = applySitting(exam, 1, 2.5, 3, []); // sitting it again, lower: the best is kept, no second promotion
    expect(r.result.promoted).toBe(false);
    expect(r.exam.best[1].stars).toBe(3);
    for (const n of [2, 3, 4, 5]) exam = applySitting(exam, n, 99, 99, []).exam;
    expect(nextExamLevel(exam)).toBe(null);
    expect(applySitting(emptyExam(), 5, 12, 12, []).result.finished).toBe(true);
  });

  it("shows the progress of the lesson, and a readiness that the game's stars cannot buy", () => {
    const all = Object.fromEntries(LEVEL_ORDER.map((x) => [x.id, { stars: 3 }]));
    const played = lessonProgress({
      stage: 8,
      finished: true,
      keys: KEYS,
      openKeys: KEYS,
      practice: all,
      know: { read: [], sealed: [] },
    });
    expect(played.road.map((s) => s.id)).toEqual(['story', 'keys', 'game', 'exam', 'know']);
    expect(played.road[2].done).toBe(1);
    expect(played.readiness).toBe(0); // every star of the game, and still not ready for the exam
    let exam = emptyExam();
    for (const n of [1, 2, 3, 4, 5]) exam = applySitting(exam, n, 99, 99, []).exam;
    const ready = lessonProgress({
      stage: 8,
      finished: true,
      openKeys: KEYS,
      practice: all,
      exam,
      tally: { 'qasim-baqi': { ok: 9, n: 10 }, 'qasim-jidaa': { ok: 1, n: 2 } },
    });
    expect(ready.readiness).toBe(Math.round(100 * (0.5 + 0.5 * (10 / 12))));
    expect(ready.rows[0]).toMatchObject({ key: 'qasim-baqi', earned: true, exam: { ok: 9, n: 10 } });
    expect(ready.rows[3].exam.rate).toBe(null);
  });

  it('always knows the ONE next thing: the story, then the game, then the exam — and training after two misses', () => {
    expect(nextStep({ stage: 2, openKeys: [KEYS[0]] })).toEqual({ do: 'story' });
    expect(nextStep({ stage: 8, finished: true, openKeys: KEYS, practice: {} })).toMatchObject({
      do: 'game',
      node: 0,
      level: 0,
    });
    expect(nextStep({ stage: 8, finished: true, openKeys: KEYS, practice: four })).toEqual({ do: 'exam', level: 1 });
    const twice = { ...emptyExam(), fails: { 1: 2 } };
    expect(
      nextStep({
        finished: true,
        openKeys: KEYS,
        practice: four,
        exam: twice,
        tally: { 'qasim-jidaa': { ok: 0, n: 3 }, 'qasim-baqi': { ok: 3, n: 3 } },
      }),
    ).toEqual({ do: 'train', key: 'qasim-jidaa', level: 1 });
  });
});

describe('the numbers the road is bound to', () => {
  it('counts the cards of the knowledge map of the lesson', async () => {
    const { KNOWLEDGE_GRAPH } = await import('../knowledgeGraph');
    const { KNOWLEDGE_CARDS } = await import('./journey');
    expect(KNOWLEDGE_GRAPH.nodes).toHaveLength(KNOWLEDGE_CARDS);
  });
});
