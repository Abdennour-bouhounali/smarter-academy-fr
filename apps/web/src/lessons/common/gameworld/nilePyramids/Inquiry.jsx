/**
 * THE INVESTIGATIONS of the pyramids world — the first phase (explore) of `kit/RuleForge.jsx` when a forge declares
 * `inquiry` (contract: GAME_WORLD.md, the explore phase). The student ACTS on Thalès figures; no rule is written here and none is
 * told: what answers him is what the world builds.
 *
 *   <Inquiry spec={forge.inquiry} game={game} onDone={(result) => …} />
 *   spec = { kind: 'plan', rounds, text? }        (`InquiryPlan.jsx`, `plan.js` — key 📐; may `writes` the rule)
 *        | { kind: 'halfturn', rounds, text? }    (`InquiryHalfturn.jsx`, `halfturn.js` — key 🦋)
 *        | { kind: 'scale', tri, rounds, text? }  (`InquiryScale.jsx`, `scale.js` — key 🔍)
 *        | { kind: 'pair', template, rounds, text? }   (`InquiryPair.jsx`, `pair.js` — two triangles APART, sides linked)
 *        | { kind: 'angles', rounds, text? }      (`InquiryAngles.jsx`, `angles.js` — a protractor; France, 2026-11-27)
 * `text` is the LESSON's wording over the world's (`strings.js › KIND_TEXT`); the frame's direction is `strings.js › DIR`.
 */
import { Plan } from './InquiryPlan';
import { Halfturn } from './InquiryHalfturn';
import { Scale } from './InquiryScale';
import { Pair } from './InquiryPair';
import { Angles } from './InquiryAngles';
import { DIR } from './strings';
import './inquiry.css';

const KINDS = { plan: Plan, halfturn: Halfturn, scale: Scale, pair: Pair, angles: Angles };

export default function Inquiry({ spec, game, onDone }) {
  const Kind = KINDS[spec.kind];
  if (!Kind) throw new Error(`nilePyramids: no investigation of kind « ${spec.kind} »`);
  const play = (name, p) => game?.audio?.play(name, p);
  return (
    <div className="np-iq-frame" dir={DIR}>
      <Kind spec={spec} play={play} onDone={onDone} />
    </div>
  );
}
