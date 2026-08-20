import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx — the restored pre-reset naming convention
// (docs/architecture/LESSON_CONTRACT.md). Keyed by module `number`, not slug.
const MODULE_COMPONENTS = {
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02Addition.jsx')),
  3: lazy(() => import('./modules/Module03Soustraction.jsx')),
  4: lazy(() => import('./modules/Module04Multiplication.jsx')),
  5: lazy(() => import('./modules/Module05Division.jsx')),
  6: lazy(() => import('./modules/Module06OperationsPosees.jsx')),
  7: lazy(() => import('./modules/Module07CalculMental.jsx')),
  8: lazy(() => import('./modules/Module08ChoisirOperation.jsx')),
  9: lazy(() => import('./modules/Module09Problemes.jsx')),
  10: lazy(() => import('./modules/Module10BossFinal.jsx')),
  11: lazy(() => import('./modules/Module11Synthese.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function quatreOperationsRoutes() {
  return [
    <Route key="quatre-operations-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`quatre-operations-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
