/**
 * How THIS world draws a case of a rule forge (kit/RuleForge.jsx › `parts`): a Thalès figure (ruleForge.js › thalesCase),
 * drawn by the shared `components/GeoFigure.jsx` — never a second renderer.
 *   Mirror({ c, stage, tight })  the figure with its lengths; at `done`, THE RATIO GAUGE (§2.3): each whole side from the
 *                                vertex stretched to one common length, its piece marked on it — the three marks on one
 *                                vertical line (gold) when the ratios are equal, apart otherwise
 *   Line({ c, children })        one line of evidence: a thumbnail, the case's name, the gauge in small
 *   beats()                      three strokes: the three marks of the gauge
 *   UseFigure({ c })             the last step's figure beside its lines (figure.js › lastStepFigure: `show`, `ask`,
 *                                `parallel`, `turn`; never below its 12 px label floor) — the kit's optional part
 * The world's investigations (`Inquiry`) are another file: the parts object is `{ Mirror, Line, beats, Inquiry, UseFigure }`.
 */
import GeoFigure from '../../components/GeoFigure';
import MathText from '../../components/MathText';
import { figureSpec, lastStepFigure, mirrorFigure } from './figure';
import { sheetFigure } from '../kit/sheetFigure';
import { caseId, runCase, THALES_TEXT } from './ruleForge';
import { Gauge } from './Gauge';
import Inquiry from './Inquiry';
import './forge.css';

/** The case in the mirror: its figure, then (built) the gauge beside it. */
export function Mirror({ c, stage, tight = false }) {
  const done = stage === 'done';
  const lie = mirrorFigure(c);
  const spec = figureSpec(c, { show: c.show ?? 'all', parallel: c.parallel ?? null, turn: lie.turn });
  // the figure is never narrower than its 12 px label floor (forge.css › --np-fig-k); its frame's padding is outside it
  const k = sheetFigure(spec)?.k ?? 0;
  return (
    <div
      className={`np-mirror ${tight ? 'is-tight' : ''}`}
      data-rf-stage={stage}
      data-rf-case={caseId(c)}
      data-rf-kind={done ? (runCase(c).aligned ? 'aligned' : 'apart') : undefined}
    >
      <div
        className="np-mirror__fig"
        style={{ '--np-fig-k': k, ...(lie.width && !tight ? { flexBasis: `calc(${lie.width}px + 0.6rem)` } : {}) }}
      >
        <GeoFigure {...spec} maxWidth={tight ? '100%' : (lie.width ?? 300)} />
      </div>
      {done && <Gauge c={c} />}
    </div>
  );
}

/** A case as one line of the evidence. */
export function Line({ c, children }) {
  const { aligned } = runCase(c);
  return (
    <div className="np-line" data-np-line={aligned ? 'aligned' : 'apart'}>
      <div className="np-line__thumb">
        <GeoFigure {...figureSpec(c, { small: true })} />
      </div>
      <div className="np-line__text">
        <div className="np-line__head">
          {c.mirror && (
            <i className="rf-inmirror" title={THALES_TEXT.mirrored}>
              🪞
            </i>
          )}
          <span>{c.head ?? `${c.names.V}${c.names.B}${c.names.C}`}</span>
        </div>
        <div className="np-line__foot">
          <Gauge c={c} small />
          {c.tag && (
            <small className="np-line__tag">
              <MathText>{c.tag}</MathText>
            </small>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/** The last step's figure (the kit's optional part): nothing for a case without one. */
export function UseFigure({ c }) {
  const f = lastStepFigure(c);
  if (!f) return null;
  return (
    <div className="np-usefig" style={{ width: `${f.width}px` }} data-np-use-figure={f.fits ? 'fits' : 'over'}>
      <GeoFigure {...f.spec} maxWidth="100%" />
    </div>
  );
}

/** Three strokes: the three marks of the gauge. */
export const beats = () => 3;

/** The parts object a lesson's forge is played with (NilePyramids.jsx passes it to the kit's RuleForge). */
export const FORGE_PARTS = { Mirror, Line, beats, Inquiry, UseFigure };
