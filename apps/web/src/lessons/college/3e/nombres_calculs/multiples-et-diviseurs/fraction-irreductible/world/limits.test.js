// THE LIMITS of fraction-irreductible: its data against what the walks proved (the defaults of `PROVEN_LIMITS`; a limit is
// raised here ONLY with the number a walk of this lesson measured — none is). Fails until `forges.js` (the forges agent)
// and `board/script.js` (the board agent) exist: it reads both.
import { describeLimits } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { SCRIPT } from '../board/script';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { NUMBERS } from './math';
import { PRACTICE_MAP } from './practice';
import { STORY, TABLETS } from './story';

const O = STORY.text.objective;
const { pgcd: PG } = NUMBERS;
const [S1, S2, S3, S4] = STORY.segments;
/** Every instruction the story can show, with the longest arguments its road gives them. */
const OBJECTIVES = [
  O.pickA,
  O.pickB,
  O.pickD,
  O.carry(S1, 7, null),
  O.carry(S2, 13, null),
  O.carry(S4, 13, null),
  O.carry(S3, PG.gap, PG.purse),
  O.make(S3, PG.purse),
  O.other('\\dfrac{138}{246} = \\dfrac{69}{123}'),
  O.crossA('\\dfrac{138}{246} = \\dfrac{69}{123} = \\dfrac{46}{82}'),
  O.backA,
  O.backB,
  O.backD,
  O.board,
  O.plaque,
  O.plaqueBack,
  O.plaqueCross,
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
