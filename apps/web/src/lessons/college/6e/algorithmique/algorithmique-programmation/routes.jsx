import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number` — module 0 (le diagnostic) inclus.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01RobotDesobeit.jsx')),
  2: lazy(() => import('./modules/Module02UneInstruction.jsx')),
  3: lazy(() => import('./modules/Module03ConstruireSequence.jsx')),
  4: lazy(() => import('./modules/Module04OrdreChangeTout.jsx')),
  5: lazy(() => import('./modules/Module05Repeter.jsx')),
  6: lazy(() => import('./modules/Module06ReparerProgramme.jsx')),
  7: lazy(() => import('./modules/Module07LaboDebogage.jsx')),
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
export default function algorithmiqueProgrammationRoutes() {
  return [
    <Route key="algo-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`algo-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
