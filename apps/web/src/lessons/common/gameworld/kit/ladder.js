/**
 * THE PRACTICE LADDER of a lesson's game world — PURE, and it names no lesson.
 *
 * The practice hangs on the lesson's keys (one node per rule earned in the story) plus ONE summary node. A node holds its
 * levels from the easiest to the most advanced. A level is either:
 *   a RUN of the gate dash — { speed, mix: [[kind, params], …] }: waves drawn from the lesson's generators;
 *   a real-world CASE      — { game, mission }: played in a world of the lesson (the kit only knows it is not a run).
 * A wave is DATA: { type, key, …numbers, gates: [n, n, n], good: index } — one sentence, three gates, exactly one right.
 *
 * The lesson gives (`createLadder`):
 *   nodes       [{ id, levels }] in the order of its mind map; the summary node has the id `SUMMARY`
 *   generators  { [kind]: (rand, params) => wave | null } — null = « these numbers do not make a fair wave, ask again »
 *   isRight     (wave, n) => boolean — ONE definition, used to build a wave, to judge the student and by the tests
 */
import { pick, shuffle } from './random';

const WAVES_PER_LEVEL = 6;
export const MAX_WAVES = 8; // a mistake brings the same kind of question back, as long as a gate is free on the rail
/**
 * May a mistake bring a wave back? Only while the run holds fewer than MAX_WAVES waves AND the rail has a gate left for
 * it: a world's rail has as many gates as its story dash has waves (6 in some lessons), never a gate it lacks.
 */
export const waveBack = (waves, gates) => waves < Math.min(MAX_WAVES, gates);
export const PRACTICE_HEARTS = 3;
/** The id of the summary node: it has no key of its own, every wave carries the key of the rule it uses. */
export const SUMMARY = 'exam';
const TRIES = 400;

/** Points of a right gate: 100, more with the streak (×1, ×1.5 from 3 in a row, ×2 from 5). */
export const gatePoints = (streak) => Math.round(100 * (streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1));

/**
 * For a lesson's generators: a wave from the right value and a pool of wrong ones.
 * Refuses (null) when two different wrong values cannot be found.
 */
export function buildWave(rand, base, right, wrongPool) {
  const wrong = shuffle(
    rand,
    [...new Set(wrongPool)].filter((n) => n !== right && n >= 0),
  ).slice(0, 2);
  if (wrong.length < 2) return null;
  const gates = shuffle(rand, [right, ...wrong]);
  return { ...base, gates, good: gates.indexOf(right) };
}

export function createLadder({ nodes, generators, isRight }) {
  const fair = (w) => Boolean(w) && w.gates.filter((n) => isRight(w, n)).length === 1;
  const levelId = (nodeIndex, level) => `${nodes[nodeIndex].id}:${level + 1}`;
  /** Every level in playing order: the easiest of the first node … the last of the summary. */
  const LEVEL_ORDER = nodes.flatMap((n, i) => n.levels.map((_, l) => ({ node: i, level: l, id: levelId(i, l) })));
  const stars = (progress, id) => progress[id]?.stars ?? 0;

  /** Is this level a real-world case rather than a run of the gate dash? */
  const isCase = (nodeIndex, level) => Boolean(nodes[nodeIndex].levels[level].game);

  /** One wave of ONE kind of question (always a fair one) — used by the trainer of the knowledge page. */
  function waveOf(rand, kind, params) {
    for (let tries = 0; tries < TRIES; tries += 1) {
      const w = generators[kind](rand, params);
      if (fair(w)) return w;
    }
    throw new Error(`practice: no wave of kind ${kind}`);
  }

  /** One wave of a level; `avoid` = the wave before it: never the same numbers twice in a row. */
  function makeWave(rand, nodeIndex, level, avoid = null) {
    const { mix } = nodes[nodeIndex].levels[level];
    for (let tries = 0; tries < TRIES; tries += 1) {
      const [kind, params] = pick(rand, mix);
      const w = generators[kind](rand, params);
      if (!fair(w)) continue;
      if (avoid && avoid.type === w.type && avoid.a === w.a && avoid.b === w.b) continue;
      return w;
    }
    throw new Error(`practice: no wave for ${levelId(nodeIndex, level)}`);
  }

  /** The waves of a run: the level's kinds of question in turn. */
  function makeRun(rand, nodeIndex, level, count = WAVES_PER_LEVEL) {
    const out = [];
    while (out.length < count) out.push(makeWave(rand, nodeIndex, level, out.at(-1)));
    return out;
  }

  /**
   * What is open. EVERY rule's node is open from the start, even for a student who never played the lesson's story
   * (owner, 2026-11-26 — a node used to open with its key, earned in the story; `keys` is kept in the signature for the
   * callers); the summary node opens once the first level of every other node is passed. Inside a node the levels open
   * one after the other.
   * `progress` = { [levelId]: { stars, best } }.
   */
  function nodeOpen(nodeIndex, keys, progress) {
    const node = nodes[nodeIndex];
    if (node.id !== SUMMARY) return true;
    return nodes.every((n, i) => n.id === SUMMARY || stars(progress, levelId(i, 0)) > 0);
  }
  function levelOpen(nodeIndex, level, keys, progress) {
    if (!nodeOpen(nodeIndex, keys, progress)) return false;
    return level === 0 || stars(progress, levelId(nodeIndex, level - 1)) > 0;
  }
  /** The next level to play: the first open one not yet passed; when everything is passed, the first one below three stars. */
  function nextLevel(keys, progress) {
    const open = LEVEL_ORDER.filter((x) => levelOpen(x.node, x.level, keys, progress));
    return open.find((x) => !(stars(progress, x.id) > 0)) ?? open.find((x) => stars(progress, x.id) < 3) ?? null;
  }
  const practiceStars = (progress) => LEVEL_ORDER.reduce((sum, x) => sum + stars(progress, x.id), 0);

  return {
    nodes,
    isRight,
    levelId,
    LEVEL_ORDER,
    MAX_PRACTICE_STARS: LEVEL_ORDER.length * 3,
    isCase,
    waveOf,
    makeWave,
    makeRun,
    nodeOpen,
    levelOpen,
    nextLevel,
    practiceStars,
  };
}
