/**
 * How THIS world draws a case of a rule forge (kit/RuleForge.jsx › `parts`): a COURT and a ROD (ruleForge.js › caseOf).
 *   Mirror({ c, stage, fast, tight })  the case in the mirror, drawn by THE court (courtParts.jsx › Court): `ask` the
 *                                      platform hovering, `build` it lowers, `done` what the world did — the band, the
 *                                      overhang or the ride, the exact difference written, the lens when it is thin
 *   Line({ c, children })              one line of evidence: a thumbnail of the court, « salle 36 · toise 6 » (or the
 *                                      case's own `head`), what the world did, the case's `tag`; `children` = what the
 *                                      student's rule says of it while the mirror tests it
 *   beats(c)                           four strokes: the mirror waits 4 × 110 + 520 = 960 ms, the lowering takes 900
 * The look of a line follows what the WORLD did (ride / band / jam), never the case's `held` — a forge may ask another
 * question of the same platform. The world's investigations (`Inquiry`) are another file: the world's parts object is
 * `{ Mirror, Line, beats, Inquiry }` (RootCourts.jsx).
 */
import { Court, CourtMini } from './courtParts';
import { caseId, runCase } from './ruleForge';
import { isWall, rodTex, rodText } from './logic';
import MathText from '../../components/MathText';
import { DRAWING_TEXT } from './strings';
import './court.css';

const WORD = DRAWING_TEXT.kind;
const MIRRORED = DRAWING_TEXT.mirrored;

/** The case in the mirror: the court of `c.a` and the platform on the rod `c.s`. A case may force the lens (`c.zoom`). */
export function Mirror({ c, stage, fast = false, tight = false }) {
  return (
    <div
      className={`crt-mirror ${tight ? 'is-tight' : ''}`}
      data-rf-stage={stage}
      data-rf-court={caseId(c)}
      data-rf-kind={stage === 'done' ? runCase(c).kind : undefined}
    >
      <Court area={c.a} rod={c.s} stage={stage} tight={tight} zoom={c.zoom ?? null} fast={fast} />
    </div>
  );
}

/** A number of a line: a fraction « p/q » stacked over a real bar (the kit's `di-frac`), never « p/q » as text. */
function LineNum({ text }) {
  const m = /^(-?\d+)\/(\d+)$/.exec(String(text));
  if (!m) return text;
  return (
    <span className="di-frac crt-line__frac" data-rc-frac={text}>
      <b>{m[1]}</b>
      <span className="di-frac__bar" aria-hidden="true" />
      <b>{m[2]}</b>
    </span>
  );
}

/** A case as one line of the evidence. */
export function Line({ c, children }) {
  const { kind } = runCase(c);
  return (
    <div className="crt-line" data-rc-line={kind}>
      <CourtMini area={c.a} rod={c.s} />
      <div className="crt-line__text">
        <div className="crt-line__head">
          {c.mirror && (
            <i className="rf-inmirror" title={MIRRORED}>
              🪞
            </i>
          )}
          {c.head ? (
            // a case that is about something else than this court and this rod names itself (defects.md A10)
            <span className="crt-line__name">{c.head}</span>
          ) : (
            <>
              <span>{DRAWING_TEXT.court}</span>
              <strong dir="ltr">
                <LineNum text={c.a} />
              </strong>
              <span className="crt-line__dot">·</span>
              <span>{DRAWING_TEXT.rod}</span>
              {/* a wall is written with a real radical (its bar over the number), any other rod as its number */}
              <strong dir="ltr">
                {isWall(c.s) ? <MathText>{`$${rodTex(c.s)}$`}</MathText> : <LineNum text={rodText(c.s)} />}
              </strong>
            </>
          )}
        </div>
        <div className="crt-line__foot">
          <em className={`crt-kind crt-kind--${kind}`}>{WORD[kind]}</em>
          {c.tag && <small className="crt-line__tag">{c.tag}</small>}
          {children}
        </div>
      </div>
    </div>
  );
}

/** How many strokes the mirror needs to build a case (the sound and the wait follow): the lowering, always the same. */
export const beats = () => 4;
