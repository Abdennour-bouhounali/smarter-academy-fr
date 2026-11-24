// THE LIMITS of thales-configuration-papillon: its data against what the walks proved (the defaults of `PROVEN_LIMITS`;
// no limit is raised: no walk of this lesson has run yet). It reads `forges.js` (the forges agent's) and
// `board/script.js` (the board agent's): it FAILS with « SCAFFOLD » until both are written.
import { describe, it, expect } from 'vitest';
import { describeLimits, PROVEN_LIMITS } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { WORLD_TEXT, withStory } from '../../../../../../common/gameworld/nilePyramids/strings';
import { SCRIPT } from '../board/script';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { PRACTICE_MAP } from './practice';
import { STORY } from './story';
import { TABLETS } from './tablets';

const ID = 'thales-configuration-papillon';
const T = withStory(WORLD_TEXT, STORY.text);
/** Every instruction the story can show on its three docks — the world's and the story's, filled with their longest letters. */
const fill = (v) => (typeof v === 'function' ? v('AB', '[SE]', 'C') : v);
const OBJECTIVES = [
  ...Object.values(T.objective).map(fill),
  ...Object.values(T.stage.objective).map((v) => (typeof v === 'function' ? v('55') : v)),
];

describeLimits({
  forges: FORGES,
  keys: KEYS,
  tablets: TABLETS,
  objectives: OBJECTIVES,
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: SCRIPT,
});

describe(`${ID} — its own limits`, () => {
  it('the story’s own instructions (noon, the end) stay inside the instruction’s limit', () => {
    for (const s of [STORY.text.stage.objective.noon, STORY.text.stage.objective.end])
      expect([...s].length, s).toBeLessThanOrEqual(PROVEN_LIMITS.objective);
  });
});
