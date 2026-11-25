/**
 * « Entraîne-toi » — how wide the trainer draws a question's FIGURE (`q.figure`, the data of a bank sheet's `statement.figure`:
 * plane — points, segments, parallels, lengths — or `space` / `chart` / `tape`), drawn by the practice space's own
 * `components/StatementFigure.jsx` — never a second renderer. Its size follows the exam sitting's rule (`sheetFigure.js`:
 * `k`, the figure's width in units of its smallest label): never narrower than `k × 12 px`, so its smallest label is drawn
 * at 12 px or more however far the panel's `Fit` zooms the question down (the CSS width is `k × --di-min-font`, the floor
 * in the units of every zoom above it — `Fit.jsx › floor`).
 *
 * Above the floor it takes at most its natural width (GeoFigure's 360) and no more than TRAINER_FIGURE.tall px of height,
 * so the question, its gates or its boxes and the correction stay on the screen at 1366 × 768. The room it may take is
 * TRAINER_FIGURE.room, a COLUMN: a figure that is not flat stands BESIDE its question (Trainer.jsx › besideIt), in a panel
 * about 570 px wide, and the question keeps the rest (about 250 px — an exam form's line of two fractions holds in 220).
 * A landscape figure at its floor took 340 px of it: the question, squeezed into 220 px, grew taller than the panel, the
 * panel zoomed down and its words fell under 12 px (the scale figures of talis-hisab-atwal, 2026-11-24). `pad`: the
 * figure's frame (its padding, trainer.css), outside the drawing. `fits` says whether a figure is drawn within that room
 * AT its floor (`fitsAbove`: within TRAINER_FIGURE.above, for a question whose form needs the whole width): a lesson's trainer test asserts it for every figure it gives (a figure too wide for its labels is turned
 * or redrawn in its own units, never shrunk below its floor).
 */
import { layoutGeoFigure } from '../../components/geoFigure';
import { sheetFigure } from './sheetFigure';

export const TRAINER_FIGURE = {
  label: 12,
  tall: 220,
  room: { width: 315, height: 350 },
  /** the room ABOVE a question whose form writes three fractions on one line (it keeps the panel's whole width) */
  above: { width: 560, height: 260 },
  pad: 13,
};

/**
 * { kind, k, width, height, label, fits } for a question's figure, or null when there is nothing to draw: its width and
 * height in px at zoom 1 (the panel unzoomed), and the size its smallest label is drawn at (plane figures only).
 */
export function trainerFigure(fig) {
  const f = sheetFigure(fig);
  if (!f) return null;
  const natural = Math.min(f.natural, 360);
  if (f.kind !== 'plane') return { kind: f.kind, k: 0, width: natural, height: null, label: null, fits: true };
  const [, , vw, vh] = layoutGeoFigure(fig).viewBox;
  const floor = Math.ceil(f.k * TRAINER_FIGURE.label);
  const width = Math.max(floor, Math.min(natural, Math.floor((TRAINER_FIGURE.tall * vw) / vh)));
  const height = Math.ceil((width * vh) / vw);
  const { room } = TRAINER_FIGURE;
  return {
    kind: 'plane',
    k: f.k,
    width,
    height,
    label: Math.round((width / f.k) * 100) / 100,
    fits: floor + TRAINER_FIGURE.pad <= room.width && Math.ceil((floor * vh) / vw) <= room.height,
    fitsAbove:
      floor + TRAINER_FIGURE.pad <= TRAINER_FIGURE.above.width &&
      Math.ceil((floor * vh) / vw) <= TRAINER_FIGURE.above.height,
  };
}

/**
 * THE RUN'S FIGURE (`kit/GateRunHud.jsx › data-gr-figure`): the drawing of a round that names points (`round.figure`),
 * in its own light panel on the inline-start side, BELOW the order's card (which may span most of the width: a French
 * order with its formula) — never over the order, its fact, the hearts, the buoys in mid-river or the two arrows at the
 * bottom corners (1366 × 768; gateRun.css › .gr-figure). RUN_FIGURE.room is the DRAWING's room in px (the panel adds `pad`
 * on each side: at most 306 × 360). A GeoFigure's longer side is 368 units and a length is written at 13: at its 12 px
 * floor a figure is 340 px along its longer side, so the room is a PORTRAIT one (a figure wider than high is turned,
 * `nilePyramids/figure.js › buoyFigure`). Drawn at the room's width, or narrower when it would stand taller than the
 * room, never under its floor (`sheetFigure.js › k`, as the trainer). `fits`: its floor stands in the room — the lessons'
 * `run.test.js` assert it for every figure they give. → { k, width, height, label, fits }, or null (no plane figure).
 */
export const RUN_FIGURE = { label: 12, room: { width: 290, height: 344 }, pad: 8 };
export function runFigure(fig) {
  const f = sheetFigure(fig);
  if (!f || f.kind !== 'plane') return null;
  const [, , vw, vh] = layoutGeoFigure(fig).viewBox;
  const { room, label } = RUN_FIGURE;
  const floor = Math.ceil(f.k * label);
  const width = Math.max(floor, Math.min(room.width, Math.floor((room.height * vw) / vh)));
  const height = Math.ceil((width * vh) / vw);
  return {
    k: f.k,
    width,
    height,
    label: Math.round((width / f.k) * 100) / 100,
    fits: width <= room.width && height <= room.height,
  };
}
