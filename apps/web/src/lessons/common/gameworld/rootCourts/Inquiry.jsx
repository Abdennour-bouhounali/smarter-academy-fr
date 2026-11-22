/**
 * THE INVESTIGATIONS of « قصر الساحات » — the first phase « استكشف » of `kit/RuleForge.jsx` when a forge declares
 * `inquiry` (contract: GAME_WORLD.md « استكشف »). The student ACTS on courts and rods until he has seen what the rule will
 * name; no rule is written here and none is told: what answers him is what the platform or the station does.
 *
 *   <Inquiry spec={forge.inquiry} game={game} onDone={(result) => …} />
 *   spec = { kind: 'calc', a, rods: [{ q } | { calc } | { root }], wall?, text }            (`InquiryCalc.jsx`, `calc.js`)
 *        | { kind: 'roundtrip', rounds: [{ from: { rod } | { court } | { walk }, path: ['build' | 'take', …] }], text }
 *                                                                                 (`InquiryRoundtrip.jsx`, `roundtrip.js`)
 *        | { kind: 'chase', a, fracs: ['p/q', …], text }                           (`InquiryChase.jsx`, `chase.js`)
 *        | { kind: 'peel', … }  — mounted, but NO lesson declares it yet            (`InquiryPeel.jsx`, `peel.js`)
 * `text` is the LESSON's wording: this world names no lesson and writes none of its numbers.
 */
import { Calc } from './InquiryCalc';
import { Roundtrip } from './InquiryRoundtrip';
import { Chase } from './InquiryChase';
import { Peel } from './InquiryPeel';
import './inquiry.css';

const KINDS = { calc: Calc, roundtrip: Roundtrip, chase: Chase, peel: Peel };

export default function Inquiry({ spec, game, onDone }) {
  const Kind = KINDS[spec.kind];
  if (!Kind) throw new Error(`rootCourts: no investigation of kind « ${spec.kind} »`);
  const play = (name, p) => game?.audio?.play(name, p);
  return (
    <div className="rq-iq-frame" dir="rtl">
      <Kind spec={spec} play={play} onDone={onDone} />
    </div>
  );
}
