/**
 * The practice space on the pyramids world — a level of the lesson's practice ladder (`kit/ladder.js`) is sailed by the felucca on
 * the kit's run in the river's skin, crocodiles in the lanes (`PYRAMIDS_WORLD_PLAN.md` §1.3: « the same rail is the
 * practice ladder »; §3.9: « levels on the river rail »). PURE: `Game.js › startPractice / endPractice` hold the 3D.
 *
 *   practiceRun({ ladder, node, level, random, names, text }) → { drill, content }
 *     drill   = { node, level, waves, speed } — what the world keeps while the level is sailed
 *     content = the kit's run content (`kit/GateRun.js › open`): one buoy per wave, `total` = the waves (a COURSE)
 *   practiceSpeed(drill, score) — the level's own pace (`levels[l].speed`, metres a second) rising a little with each buoy
 *   practiceEnd({ ladder, drill, result, practice, keys }) → { practice, win, stars, overlay }
 *     stars = the hearts left (a crocodile costs one, a wrong buoy one), a level lost gives none and never lowers a best
 *
 * A wave of the lesson carries what the river shows — `say` (the order), `tex?`, `gates` (three numbers or short texts,
 * « p/q » drawn over a real bar), `good`, `why: { right, wrong: { [gate]: fact } }`, `seconds?`, `figure?` (the drawing of a
 * wave that names points) — the felucca's legs' own shape.
 */
import { PRACTICE_HEARTS } from '../kit/ladder';
import { railSpeed } from '../kit/GateRun';

/** A buoy: a fraction « p/q » over a real bar, anything else as it is written. */
export const buoyOption = (g) => {
  const m = /^(−?)(\d+)\/(\d+)$/.exec(String(g));
  return m ? { tex: `${m[1] ? '-' : ''}\\dfrac{${m[2]}}{${m[3]}}` } : { t: String(g) };
};

/** A wave as the river plays it: { ask, tex, options × 3, right, why × 3 } — one FACT per buoy, never « wrong ». */
export const roundOfWave = (w) => ({
  ask: w.say,
  tex: w.tex ?? null,
  options: w.gates.map(buoyOption),
  right: w.good,
  why: w.gates.map((g, k) => (k === w.good ? w.why.right : (w.why.wrong?.[g] ?? w.why.right))),
  seconds: w.seconds,
  // the drawing of a wave that names points (`nilePyramids/figure.js › buoyFigure`), drawn beside the order
  ...(w.figure ? { figure: w.figure } : {}),
});

/** The pace of a level that names none: the felucca's legs' at their first buoy (`kit/GateRun.js › railSpeed`). */
const FALLBACK_SPEED = railSpeed(1, 0);

export function practiceRun({ ladder, node, level, random, names = [], text }) {
  const waves = ladder.makeRun(random, node, level);
  const speed = ladder.nodes[node].levels[level].speed ?? FALLBACK_SPEED;
  const drill = { node, level, waves, speed };
  const content = {
    total: waves.length,
    gates: waves.length + 1, // never a level up inside a practice level
    levels: [{ name: names[level] ?? '', from: '' }],
    round: (_level, _random, n) => roundOfWave(waves[n % waves.length]),
    text: { ...text, title: names[level] ?? text.title },
  };
  return { drill, content };
}

export const practiceSpeed = (drill, score) => Math.min(17, drill.speed + 0.05 * score);

export function practiceEnd({ ladder, drill, result, practice, keys }) {
  const id = ladder.levelId(drill.node, drill.level);
  const before = practice[id] ?? { stars: 0, best: 0 };
  const win = Boolean(result.won);
  const stars = win ? Math.max(1, Math.min(3, result.hearts)) : 0;
  const score = result.score * 100;
  const progress = win
    ? { ...practice, [id]: { stars: Math.max(before.stars, stars), best: Math.max(before.best, score) } }
    : practice;
  return {
    practice: progress,
    win,
    stars,
    overlay: {
      type: 'result',
      win,
      node: drill.node,
      level: drill.level,
      stars,
      score,
      best: Math.max(before.best, win ? score : 0),
      newBest: win && score > before.best,
      streak: 0,
      mistakes: PRACTICE_HEARTS - result.hearts,
      bumps: result.bumps ?? 0,
      key: drill.waves.at(-1)?.key ?? null,
      next: win ? ladder.nextLevel(keys, progress) : null,
    },
  };
}
