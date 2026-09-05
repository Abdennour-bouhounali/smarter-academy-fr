import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx — the restored pre-reset naming convention
// (docs/architecture/LESSON_CONTRACT.md). Keyed by module `number`, not slug.
// Modules reconstruits sur le lesson kit ; les versions pré-kit sont
// conservées dans modules/_archive_original/ (jamais routées).
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02ChoisirUnite.jsx')),
  3: lazy(() => import('./modules/Module03ComparerMesurer.jsx')),
  4: lazy(() => import('./modules/Module04RelationsUnites.jsx')),
  5: lazy(() => import('./modules/Module05Conversions.jsx')),
  6: lazy(() => import('./modules/Module06EstimationProblemes.jsx')),
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
export default function massesRoutes() {
  return [
    <Route key="masses-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`masses-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
