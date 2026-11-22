/**
 * THE STUDENT'S ROAD through a lesson — PURE, and it names no lesson: the two practice spaces and the progress page.
 *   « فضاء اللعب »     the gaming space first (the gate dash and the real-world cases — ladder.js);
 *   « فضاء الامتحان »  then the real one: a ladder of exam sittings (sitting.js). The game lives BETWEEN its levels
 *                      (stars, a promotion), never inside a sitting.
 * `lessonProgress` is what the page « تقدّمي » shows, and `nextStep` the ONE thing to do now.
 *
 * The lesson gives (`createJourney`):
 *   keys    the ids of its rules, in the order of the story — each is also a node of its practice ladder
 *   ladder  its practice ladder (`createLadder`)
 *   levels  the levels of its exam space (`createSittings`)
 *   stages  how many stages its story has
 *   cards   how many cards its knowledge map has
 */
import { SUMMARY } from './ladder';
import { sittingPassed, sittingStars } from './sitting';

export const emptyExam = () => ({ best: {}, fails: {}, weak: {}, sittings: 0 });
const starsOf = (exam, n) => exam.best?.[n]?.stars ?? 0;
export const examLevelOpen = (exam, n) => n === 1 || starsOf(exam, n - 1) > 0;

export function createJourney({ keys, ladder, levels, stages, cards }) {
  const summary = ladder.nodes.findIndex((n) => n.id === SUMMARY);
  const nodeOf = (key) => ladder.nodes.findIndex((n) => n.id === key);

  /** The exam space opens once the student has PLAYED: he holds every key and the first run of each is passed. */
  const examOpen = (held, practice) => keys.every((k) => held.includes(k)) && ladder.nodeOpen(summary, held, practice);
  const examLevelsPassed = (exam) => levels.filter((l) => starsOf(exam, l.n) > 0).length;
  const nextExamLevel = (exam) => levels.find((l) => !(starsOf(exam, l.n) > 0))?.n ?? null;

  /**
   * A sitting was handed in. Returns the new exam state and what the student is told:
   *   passed (≥ 80 % of the points) — `promoted` when it is the first time this level is passed (the next level opens);
   *   otherwise the kinds of exercise to work on: the NEXT sheet of this level puts them first, with other numbers.
   * A subject with no points (`total` 0) is never passed: no star, no promotion.
   */
  function applySitting(exam, level, mark, total, weak = []) {
    const stars = sittingStars(mark, total);
    const passed = sittingPassed(mark, total);
    const before = exam.best?.[level] ?? { stars: 0, mark: 0 };
    const next = {
      ...exam,
      sittings: (exam.sittings ?? 0) + 1,
      best: passed
        ? { ...exam.best, [level]: { stars: Math.max(before.stars, stars), mark: Math.max(before.mark, mark), total } }
        : { ...exam.best },
      fails: { ...exam.fails, [level]: passed ? 0 : (exam.fails?.[level] ?? 0) + 1 },
      weak: { ...exam.weak, [level]: passed ? [] : weak },
    };
    return {
      exam: next,
      result: {
        level,
        mark,
        total,
        stars,
        passed,
        promoted: passed && before.stars === 0,
        newBest: passed && stars > before.stars,
        weak: passed ? [] : weak,
        fails: next.fails[level],
        nextLevel: passed && level < levels.length ? level + 1 : null,
        finished: passed && level === levels.length,
      },
    };
  }

  /** What « تقدّمي » shows: the road (five stations) and, per key, everything the student did with it. */
  function lessonProgress({
    stage = 0,
    finished = false,
    keys: earned = [],
    openKeys = [],
    practice = {},
    know = {},
    exam = emptyExam(),
    tally = {},
  }) {
    const has = (k) => openKeys.includes(k) || earned.includes(k);
    const rows = keys.map((key) => {
      const i = nodeOf(key);
      const node = ladder.nodes[i];
      const stars = node.levels.reduce((t, _, l) => t + (practice[ladder.levelId(i, l)]?.stars ?? 0), 0);
      const t = tally[key] ?? { ok: 0, n: 0 };
      return {
        key,
        earned: has(key),
        game: { stars, max: node.levels.length * 3 },
        sealed: (know.sealed ?? []).includes(key),
        exam: { ok: t.ok, n: t.n, rate: t.n ? t.ok / t.n : null },
      };
    });
    const passed = examLevelsPassed(exam);
    const earnedCount = rows.filter((r) => r.earned).length;
    const played = ladder.practiceStars(practice);
    const read = (know.read ?? []).length;
    const road = [
      {
        id: 'story',
        done: finished ? 1 : Math.min(1, stage / stages),
        label: `${Math.min(stage, stages)}\u00a0/\u00a0${stages}`,
      },
      { id: 'keys', done: earnedCount / keys.length, label: `${earnedCount}\u00a0/\u00a0${keys.length}` },
      {
        id: 'game',
        done: played / ladder.MAX_PRACTICE_STARS,
        label: `${played}\u00a0/\u00a0${ladder.MAX_PRACTICE_STARS}`,
      },
      { id: 'exam', done: passed / levels.length, label: `${passed}\u00a0/\u00a0${levels.length}` },
      { id: 'know', done: read / cards, label: `${read}\u00a0/\u00a0${cards}` },
    ];
    // « جاهزيّتي للامتحان »: only what was done as in an exam counts — first tries on paper, and the ladder. Never the game's stars.
    const tries = rows.reduce((t, r) => ({ ok: t.ok + r.exam.ok, n: t.n + r.exam.n }), { ok: 0, n: 0 });
    const readiness = Math.round(
      100 * (0.5 * (passed / levels.length) + 0.5 * (tries.n >= 4 ? tries.ok / tries.n : 0)),
    );
    return { rows, road, readiness, tries };
  }

  /** The ONE thing to do now: finish the story, then play, then sit the exams — and train the weakest rule after two fails. */
  function nextStep(state) {
    const { stage = 0, finished = false, openKeys = [], practice = {}, exam = emptyExam(), tally = {} } = state;
    if (!finished && stage < stages && openKeys.length < keys.length) return { do: 'story' };
    if (!examOpen(openKeys, practice)) {
      const n = ladder.nextLevel(openKeys, practice);
      return n ? { do: 'game', node: n.node, level: n.level } : { do: 'story' };
    }
    const lvl = nextExamLevel(exam);
    if (lvl === null) {
      const n = ladder.nextLevel(openKeys, practice);
      return n ? { do: 'game', node: n.node, level: n.level } : { do: 'done' };
    }
    if ((exam.fails?.[lvl] ?? 0) >= 2) {
      const worst = keys
        .map((k) => ({ k, r: tally[k]?.n ? tally[k].ok / tally[k].n : 1 }))
        .sort((x, y) => x.r - y.r)[0];
      return { do: 'train', key: worst.k, level: lvl };
    }
    return { do: 'exam', level: lvl };
  }

  return { keys, examOpen, nextExamLevel, applySitting, lessonProgress, nextStep };
}
