import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx — the restored pre-reset naming convention
// (docs/architecture/LESSON_CONTRACT.md). Keyed by module `number`, not slug.
const MODULE_COMPONENTS = {
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02MesurerComparer.jsx')),
  3: lazy(() => import('./modules/Module03ConstruireUnites.jsx')),
  4: lazy(() => import('./modules/Module04Conversions.jsx')),
  5: lazy(() => import('./modules/Module05ChoisirEstimer.jsx')),
  6: lazy(() => import('./modules/Module06Perimetres.jsx')),
  7: lazy(() => import('./modules/Module07MissionFinale.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function longueursRoutes() {
  return [
    <Route key="longueurs-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`longueurs-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
