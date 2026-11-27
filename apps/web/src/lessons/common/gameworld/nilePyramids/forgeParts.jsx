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
 * A case that is NOT a Thalès figure brings its OWN drawing: `c.scene`, a GeoFigure spec (two triangles apart —
 * the similar-triangles lesson), and `c.thumb` (default the scene) for its line of evidence, drawn WITHOUT any text (`thumbSpec`). The three parts draw it as it is,
 * at its 12 px label floor, with no gauge (`sceneFigure`); a case without `scene` is drawn exactly as before.
 * The world's investigations (`Inquiry`) are another file: the parts object is `{ Mirror, Line, beats, Inquiry, UseFigure }`.
 */
import GeoFigure from '../../components/GeoFigure';
import MathText from '../../components/MathText';
import { layoutGeoFigure } from '../../components/geoFigure';
import { figureSpec, lastStepFigure, mirrorFigure } from './figure';
import { sheetFigure } from '../kit/sheetFigure';
import { caseId, runCase, THALES_TEXT } from './ruleForge';
import { Gauge } from './Gauge';
import Inquiry from './Inquiry';
import './forge.css';

/** The room the last step gives its figure (`figure.js › LAST_STEP_FIGURE`, the same numbers). */
const SCENE_ROOM = { label: 12, width: 380, height: 250 };
/**
 * A case's OWN drawing (`c.scene`, a GeoFigure spec) at its 12 px label floor: { spec, width, height, fits } (`fits`: in
 * the last step's room) — or null for a Thalès case.
 */
export function sceneFigure(c) {
  const spec = c?.scene;
  if (!spec) return null;
  const [, , vw, vh] = layoutGeoFigure(spec).viewBox;
  const width = Math.ceil((sheetFigure(spec)?.k ?? 0) * SCENE_ROOM.label);
  const height = Math.ceil((width * vh) / vw);
  return { spec, width, height, fits: width <= SCENE_ROOM.width && height <= SCENE_ROOM.height };
}

/** The room a scene takes under attack beyond its 12 px floor (rounding, a label's bold weight). */
const SCENE_SPARE = 1.04;

/** A case that brings its own drawing, in the mirror: the drawing alone, its verdict once built (no gauge). */
function SceneMirror({ c, stage, tight }) {
  const f = sceneFigure(c);
  const k = sheetFigure(f.spec)?.k ?? 0;
  // under attack the drawing is NEVER narrower than its 12 px label floor (`--di-min-font` × k, 4 % to spare, plus its
  // padding): a flex item that may shrink is sized by its content, and an SVG with a viewBox alone counts 300 px there —
  // the walk of 2026-11-27 read the lengths at 11.3 px and the angles at 10.4 px, whatever its flex-basis. Not shrinkable,
  // its width is its own; the mirror grows in height to hold it (ruleForge.css › .rf-main: minmax(min-content, 15.5rem)).
  const wide = { flex: '0 0 auto', width: `calc(var(--di-min-font, 12px) * ${k} * ${SCENE_SPARE} + 0.6rem)` };
  return (
    <div
      className={`np-mirror ${tight ? 'is-tight' : ''}`}
      data-rf-stage={stage}
      data-rf-case={c.id}
      data-rf-kind={stage === 'done' ? (c.held ? 'held' : 'fell') : undefined}
      data-np-scene
    >
      <div className="np-mirror__fig" style={{ '--np-fig-k': k, ...(!tight ? wide : {}) }}>
        <GeoFigure {...f.spec} maxWidth="100%" />
      </div>
    </div>
  );
}

/** The case in the mirror: its figure, then (built) the gauge beside it. */
export function Mirror({ c, stage, tight = false }) {
  if (c?.scene) return <SceneMirror c={c} stage={stage} tight={tight} />;
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

/** What a GeoFigure writes: the keys of a spec's items that carry text (a segment's length, an angle's measure, a name). */
const TEXT_KEYS = { segments: 'label', angles: 'label', arcs: 'label', vectors: 'label', lines: 'name', rays: 'name' };
/**
 * A THUMBNAIL of a drawing: its shapes only, NO text at all — no vertex letter, no length, no angle — drawn at a
 * thumbnail's width, any text would fall under the 12 px floor (the case's name is written beside it).
 */
export function thumbSpec(spec) {
  const out = { ...spec, hidden: Object.keys(spec.points ?? {}) };
  delete out.labels;
  for (const [key, text] of Object.entries(TEXT_KEYS)) {
    if (!Array.isArray(spec[key])) continue;
    out[key] = spec[key].map((it) => {
      if (!it || typeof it !== 'object' || Array.isArray(it)) return it;
      const rest = { ...it };
      delete rest[text];
      return rest;
    });
  }
  return out;
}

/**
 * A case that brings its own drawing, as one line of the evidence: its thumbnail (shapes only), its name, its tag — and
 * the mirror's verdict on his rule (`children`) on a line of its own under them, the card's whole width, wrapped, never
 * clipped (the walk of 2026-11-27: « ✓ Ta règle : pas la mê… » beside a tag on three lines).
 */
function SceneLine({ c, children }) {
  return (
    <div className="np-line" data-np-line={c.held ? 'held' : 'fell'} data-np-scene>
      <div className="np-line__thumb">
        <GeoFigure {...thumbSpec(c.thumb ?? c.scene)} />
      </div>
      <div className="np-line__text">
        <div className="np-line__head">
          {c.mirror && (
            <i className="rf-inmirror" title={THALES_TEXT.mirrored}>
              🪞
            </i>
          )}
          <span>
            <MathText>{c.head}</MathText>
          </span>
        </div>
        {c.tag && (
          <div className="np-line__foot">
            <small className="np-line__tag">
              <MathText>{c.tag}</MathText>
            </small>
          </div>
        )}
      </div>
      {children && (
        <div className="np-line__verdict" data-np-line-verdict>
          {children}
        </div>
      )}
    </div>
  );
}

/** A case as one line of the evidence. */
export function Line({ c, children }) {
  if (c?.scene) return <SceneLine c={c}>{children}</SceneLine>;
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
  const f = c?.scene ? sceneFigure(c) : lastStepFigure(c);
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
