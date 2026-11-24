/**
 * The figure of a bank sheet (`statement.figure`) as the exam sitting draws it: by the practice space's own renderer
 * (`components/StatementFigure.jsx`, the same switch on `kind` as `ExerciseStatement` and `ExamSheet`) — never a second
 * drawing. This module only says HOW WIDE the drawing must be on the sitting's paper:
 *   natural  the width the practice space gives it (`maxWidth`, GeoFigure's default 360 — 540 on squared paper);
 *   k        for a PLANE figure, the width in units of the 12 px floor (`--di-min-font`) at which its smallest label is
 *            drawn at 12 px or more, however far the paper is zoomed down to fit (GeoFigure writes its labels in the units of
 *            its viewBox: 13 for a length, 12 for an angle, 10 for an axis tick). The paper is zoomed; the figure is not
 *            drawn below that width (examSitting.css › .xs-figure). Other kinds (space, chart, tape) keep their natural
 *            width only.
 */
import { layoutGeoFigure } from '../../components/geoFigure';

/** The smallest font size, in viewBox units, of the texts GeoFigure writes for this figure. */
function smallestLabel(fig) {
  if (fig.axes) return 10;
  const named = (list) => (list ?? []).some((x) => x && x.label != null && x.label !== '');
  if (named(fig.angles) || named(fig.arcs) || named(fig.circles)) return 12;
  return 13;
}

/** The plane figure drawn by GeoFigure: one with points (StatementFigure draws nothing otherwise). */
const plane = (fig) => !fig.kind && fig.points && Object.keys(fig.points).length > 0;

/** { kind, natural, k } for a sheet's figure, or null when there is nothing to draw. */
export function sheetFigure(fig) {
  if (!fig || typeof fig !== 'object') return null;
  if (!fig.kind && !plane(fig)) return null;
  const natural = Number(fig.maxWidth) || (fig.grid ? 540 : 360);
  if (!plane(fig)) return { kind: fig.kind, natural, k: 0 };
  // GeoFigure writes its viewBox to 0.1: the floor is measured on the width as it is written, rounded up
  const width = Math.ceil(layoutGeoFigure(fig).viewBox[2] * 10 + 1) / 10;
  return { kind: 'plane', natural, k: Math.ceil((width / smallestLabel(fig)) * 100) / 100 };
}
