/**
 * « Séance en classe » — how wide the board draws a station's FIGURE (CLASS_SESSION.md §5ter, `ask` with `figure`).
 * The figure is a bank sheet's `statement.figure` (plane: points, segments, parallels, lengths), drawn by the practice
 * space's own `components/StatementFigure.jsx` — never a second renderer. Its size follows the exam sitting's rule
 * (`gameworld/kit/sheetFigure.js`: `k`, the figure's width in units of its smallest label), with the board's floor: a
 * board is read from the back of a class, so its smallest label is drawn at BOARD_LABEL_PX or more at 1366 × 768, the
 * one screen size — the board is designed 1280 × 720 and zoomed to the window (`TeacherSkeletons.jsx › boardFit`).
 */
import { layoutGeoFigure } from '../../lessons/common/components/geoFigure';
import { sheetFigure } from '../../lessons/common/gameworld/kit/sheetFigure';
import { boardFit } from './TeacherSkeletons';

export const BOARD_LABEL_PX = 18;
/** The zoom of the board at the one screen size. */
const ZOOM = boardFit(1366, 768).zoom;

/**
 * { kind, width, height, label } for a station's figure, or null when there is nothing to draw: its width and height in
 * the board's design pixels (1280 × 720), and the size its smallest label is drawn at on a 1366 × 768 screen.
 */
export function boardFigure(fig) {
  const f = sheetFigure(fig);
  if (!f) return null;
  if (f.kind !== 'plane') return { kind: f.kind, width: f.natural, height: null, label: null };
  const width = Math.max(f.natural, Math.ceil((f.k * BOARD_LABEL_PX) / ZOOM));
  const [, , vw, vh] = layoutGeoFigure(fig).viewBox;
  return {
    kind: 'plane',
    width,
    height: Math.ceil((width * vh) / vw),
    label: Math.round((width / f.k) * ZOOM * 100) / 100,
  };
}
