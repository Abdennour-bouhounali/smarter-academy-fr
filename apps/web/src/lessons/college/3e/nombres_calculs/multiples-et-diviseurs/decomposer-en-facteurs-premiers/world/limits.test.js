// THE LIMITS of decomposer-en-facteurs-premiers: its data against what the walks proved (`trusted.md`; the defaults of
// `PROVEN_LIMITS` — no limit is raised here: no walk of this lesson has run yet). Past a limit, the screen is walked first.
import { describeLimits } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { SCRIPT } from '../board/script';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { NUMBERS } from './math';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';

const O = STORY.text.objective;
const [R60, R72, R1400, R91, R97, R2431] = NUMBERS.road;
/** Every instruction the story can show, with the longest arguments its road gives them. */
const OBJECTIVES = [
  O.pick(R60.a, R60.moulds),
  O.pick(R72.a, R72.moulds),
  O.carry(R1400.a, 8),
  O.carry(R72.a, 9),
  O.long(R1400.moulds),
  O.make91,
  O.make97,
  O.wait2431,
  O.make2431,
  O.carryMade(R2431.a, 2430),
  O.carryMade(R91.a, 13),
  O.carryMade(R97.a, 1),
  O.board,
  O.bossGo,
  O.bossCross,
  O.end,
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
