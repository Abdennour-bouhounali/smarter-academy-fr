import ProblemTable from './ProblemTable';
import StatementFigure from '../components/StatementFigure';
import CoordPlane from '../components/CoordPlane';
import ProblemScene from './ProblemScene';
import ProblemIllustration from './ProblemIllustration';

/**
 * Le support d'un énoncé de مسألة (2026-10-06) : figure GeoFigure / SpaceFigure / StatChart (StatementFigure), repère CoordPlane
 * (`visual`), tableau (`table`) — mêmes données déclaratives que la pratique (ExerciseStatement).
 * Dessiné sous l'énoncé dans le module (GuidedProblem) ET sur la carte « مسألة الدرس »
 * (LessonProblemCard, chargé paresseusement) : un énoncé qui dit « الشكل » le montre partout.
 */
export default function ProblemSupport({ figure, visual, table, scene, illustration }) {
  return (
    <>
      {/* L'ILLUSTRATION de la situation (2026-10-13) : le dessin de la fiche, redessiné en SVG. */}
      {illustration && <ProblemIllustration illustration={illustration} />}
      {figure && <StatementFigure {...figure} />}
      {visual && <div className="max-w-full overflow-x-auto" data-problem-visual><CoordPlane {...visual} /></div>}
      {table && <ProblemTable {...table} />}
      {/* La scène INTERACTIVE (2026-10-13) : un curseur, un dessin qui réagit (problemScene.js). */}
      {scene && <ProblemScene scene={scene} />}
    </>
  );
}

export const hasSupport = (p) => Boolean(p && (p.figure || p.visual || p.table || p.scene || p.illustration));
