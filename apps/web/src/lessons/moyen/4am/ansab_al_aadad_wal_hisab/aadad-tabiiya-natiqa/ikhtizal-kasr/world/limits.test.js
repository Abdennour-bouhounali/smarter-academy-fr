/**
 * THE LIMITS the proven screens were WALKED for (.claude/skills/lesson-v2/SKILL.md §6, trusted.md) — this lesson's data
 * checked in seconds instead of a browser, through the shared suite (`describeLimits`). A forge that is still a
 * PLACEHOLDER (`forges.js`, written by wave 1) and a board that is not written yet (`../board/script.js`) are left out —
 * and said so — until their agents write them. Below, what the shared suite does not measure: every instruction the
 * story can show, and the card on the right (three lines at most).
 */
import { describe, it, expect } from 'vitest';
import { describeLimits, PROVEN_LIMITS } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';

/** The board's script, when its agent has written it (a missing file is no board, not an error). */
const BOARD = Object.values(import.meta.glob('../board/script.js', { eager: true }))[0]?.SCRIPT ?? null;
const O = STORY.text.objective;
const [A, B, C, D, E] = STORY.segments;
const TEX3 = '\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}';
/** Every instruction the story can show, with its longest data. */
const OBJECTIVES = [
  O.pickA,
  O.pickB,
  ...[2, 4, 6, 9].map((b) => O.carry(A, b, null)),
  ...[1, 3, 5, 7].map((b) => O.carry(B, b, null)),
  O.carry(C, 99, 3),
  O.carry(D, 243, 9),
  O.carry(E, 39, 3),
  O.make(C, 3),
  O.make(D, 9),
  O.make(E, 3),
  O.shorter('\\frac{66}{78} = \\frac{33}{39}'),
  O.other('\\frac{66}{78} = \\frac{11}{13}'),
  O.crossA(TEX3),
  O.backA,
  O.board,
  O.bossGo,
  O.bossCross,
];

describeLimits({
  forges: FORGES,
  keys: KEYS.filter((k) => !FORGES[k].placeholder),
  tablets: TABLETS,
  objectives: OBJECTIVES,
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: BOARD,
});

const len = (s) => [...String(s).replace(/[⁦⁩]/g, '')].length;

describe('ikhtizal-kasr — the data the shared suite does not measure', () => {
  it('the forges still placeholders are said, not hidden', () => {
    const waiting = KEYS.filter((k) => FORGES[k].placeholder);
    // wave 1 writes placeholders; once the forges' agent has written them, this list is empty
    expect(waiting.every((k) => KEYS.includes(k))).toBe(true);
  });

  it(`every instruction holds in ${PROVEN_LIMITS.objective} characters; the card on the right in three lines`, () => {
    for (const o of OBJECTIVES) expect(len(o), o).toBeLessThanOrEqual(PROVEN_LIMITS.objective);
    const game = {
      T: STORY.text,
      segs: STORY.segments,
      markSigns: { [A.id]: [2, 6], [B.id]: [1], [C.id]: [33], [D.id]: [27], [E.id]: [13] },
      log: [99, 1, 3, 11, 33, 243, 27, 81, 9].flatMap((b) => [48, 99, 243, 39].map((a) => ({ a, b }))),
    };
    for (let k = 1; k < STORY.islands.length; k += 1) {
      const card = STORY.recall(game, k);
      if (card) expect(card.length, `island ${k}`).toBeLessThanOrEqual(3);
    }
  });
});
