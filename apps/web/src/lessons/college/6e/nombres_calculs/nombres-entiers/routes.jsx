import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx — the restored pre-reset naming convention
// (docs/architecture/LESSON_CONTRACT.md). Keyed by module `number`, not slug.
// Rebuilt on the shared lesson kit (src/lessons/common/kit), validated
// 2026-08-22. The pre-kit originals are archived in ./modules/_archive_original/
// (not routed, kept for reference only).
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02Construire.jsx')),
  3: lazy(() => import('./modules/Module03LireEcrire.jsx')),
  4: lazy(() => import('./modules/Module04ValeurPosition.jsx')),
  5: lazy(() => import('./modules/Module05Decomposer.jsx')),
  6: lazy(() => import('./modules/Module06Comparer.jsx')),
  7: lazy(() => import('./modules/Module07RangerEncadrer.jsx')),
  8: lazy(() => import('./modules/Module08DroiteGraduee.jsx')),
  9: lazy(() => import('./modules/Module09MondeReel.jsx')),
  10: lazy(() => import('./modules/Module10Problemes.jsx')),
  11: lazy(() => import('./modules/Module11BossFinal.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function nombresEntiersRoutes() {
  return [
    <Route key="nombres-entiers-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`nombres-entiers-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
