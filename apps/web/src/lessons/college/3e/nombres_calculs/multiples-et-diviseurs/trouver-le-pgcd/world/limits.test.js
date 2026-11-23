// THE LIMITS of trouver-le-pgcd: its data against what the walks proved (the defaults of `PROVEN_LIMITS`; a limit is
// raised here ONLY with the number a walk of this lesson measured — none is). Fails until `forges.js` (wave 2) and
// `board/script.js` (the board agent) exist: it reads both.
import { describeLimits } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { SCRIPT } from '../board/script';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { NUMBERS } from './math';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';

const O = STORY.text.objective;
const CONVOYS = ['jumeaux', 'grands', 'euclide', 'jetee'];
const { twins: TW, factors: FC, euclide: EU, mission: MI } = NUMBERS;
/** Every instruction the story can show, with the longest arguments its road gives them. */
const OBJECTIVES = [
  ...CONVOYS.map((c) => O.make(c)),
  // the longest plank a workshop makes, and a full purse
  O.carry('jumeaux', 90, TW.purse),
  O.carry('grands', 1736, FC.purse),
  O.carry('euclide', 52015, EU.purse),
  O.carry('jetee', 1462, MI.purse),
  O.tail(TW.gaps[1], 54, TW.purse),
  O.tail(FC.gaps[1], 980, FC.purse),
  O.tail(EU.gaps[1], 31209, EU.purse),
  O.tail(MI.gaps[1], 946, MI.purse),
  ...STORY.islands.map((x) => O.convoyBack(x.name)),
  O.board,
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
