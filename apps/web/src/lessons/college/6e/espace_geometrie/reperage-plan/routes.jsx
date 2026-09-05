import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number`, not slug.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01TresorPerdu.jsx')),
  2: lazy(() => import('./modules/Module02DeuxNombres.jsx')),
  3: lazy(() => import('./modules/Module03LireUnPoint.jsx')),
  4: lazy(() => import('./modules/Module04PlacerUnPoint.jsx')),
  5: lazy(() => import('./modules/Module05ParcoursRobot.jsx')),
  6: lazy(() => import('./modules/Module06NoeudsEtCases.jsx')),
  7: lazy(() => import('./modules/Module07MissionsReperage.jsx')),
  8: lazy(() => import('./modules/Module08MissionFinale.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function reperagePlanRoutes() {
  return [
    <Route key="reperage-plan-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`reperage-plan-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
