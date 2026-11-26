// THE LIMITS of multiples-et-diviseurs-communs: its data against what the walks proved (the defaults of `PROVEN_LIMITS`; a limit is
// raised here ONLY with the number a walk of this lesson measured — none is). Fails until `forges.js` (wave 2) and
// `board/script.js` (the board agent) exist: it reads both. What this lesson's own files decide (every instruction, the
// tablets, the maps) is also checked, without them, in `story.test.js › its own limits`.
import { describeLimits } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { SCRIPT } from '../board/script';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { NUMBERS } from './math';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';

const O = STORY.text.objective;
const { pillar: PI, factors: FC } = NUMBERS;
/** Every instruction the story can show, with the longest arguments its road gives them. */
const OBJECTIVES = [
  O.walkway(PI.crews, PI.purse, false),
  O.walkway(FC.crews, FC.purse, true),
  O.cross,
  ...STORY.islands.slice(1).map((x) => O.standing(x.name)),
  O.board,
  O.end,
  STORY.mission.objective,
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
