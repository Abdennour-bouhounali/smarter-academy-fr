import { Suspense, lazy } from 'react';

/**
 * Les figures de l'OUVERTURE d'unité (تحدّ, encadré historique) : quand leur texte renvoie à « الشكل المقابل », la page
 * montre le dessin qu'une leçon de l'unité a déjà fait (jamais une seconde copie), chargé à la demande pour que la page
 * d'unité n'embarque pas les leçons des autres unités.
 *
 * Clé : `${unit.id}:${slot}` (= le code de l’unité), slot ∈ challenge | aside. Une unité sans entrée n'affiche rien.
 */
// Keyed by unit code: `'<unit>:challenge' | '<unit>:aside'` → `() => import(<the figure>)`. EMPTY until the French units
// exist (2026-11-22); the Algerian entries are in git, `git show 049380e:apps/web/src/pages/unit/UnitOpenerFigure.jsx`.
const FIGURES = {};

const lazyCache = {};
function figureFor(key) {
  if (!FIGURES[key]) return null;
  lazyCache[key] ??= lazy(FIGURES[key]);
  return lazyCache[key];
}

export default function UnitOpenerFigure({ code, slot }) {
  const Figure = figureFor(`${code}:${slot}`);
  if (!Figure) return null;
  return (
    <div className="mt-3" data-unit-figure={`${code}:${slot}`}>
      <Suspense fallback={<div className="mx-auto h-40 w-full max-w-sm animate-pulse rounded-xl bg-white/70" />}>
        <Figure />
      </Suspense>
    </div>
  );
}

