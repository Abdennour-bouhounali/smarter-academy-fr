import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>V2.jsx — rebuilt on the shared lesson kit
// (src/lessons/common/kit), see docs/architecture/LESSON_INTEGRATION_GUIDE.md
// §11. The pre-kit originals (Module<NN>*.jsx, without the V2 suffix) are
// kept untouched next to these as the validated backup — to revert, drop the
// V2 suffix on any line below. Module 0 (prerequisite diagnostic) is new:
// it has no pre-kit original.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00DiagnosticV2.jsx')),
  1: lazy(() => import('./modules/Module01MissionV2.jsx')),
  2: lazy(() => import('./modules/Module02DecouperUniteV2.jsx')),
  3: lazy(() => import('./modules/Module03FractionsDecimalesV2.jsx')),
  4: lazy(() => import('./modules/Module04EcritureVirguleV2.jsx')),
  5: lazy(() => import('./modules/Module05ValeurPositionV2.jsx')),
  6: lazy(() => import('./modules/Module06EcrituresEquivalentesV2.jsx')),
  7: lazy(() => import('./modules/Module07ComparerRangerV2.jsx')),
  8: lazy(() => import('./modules/Module08DroiteGradueeV2.jsx')),
  9: lazy(() => import('./modules/Module09OrdreGrandeurV2.jsx')),
  10: lazy(() => import('./modules/Module10ProblemesV2.jsx')),
  11: lazy(() => import('./modules/Module11BossFinalV2.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function nombresDecimauxRoutes() {
  return [
    <Route key="nombres-decimaux-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`nombres-decimaux-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
