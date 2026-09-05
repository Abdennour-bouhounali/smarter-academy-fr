import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number`, not slug. Modules 1-10 rebuilt on the shared lesson kit
// (common/kit) — pre-kit originals archived in ./modules/_archive_original/,
// never routed. Module 0 (diagnostic) added with the kit rebuild.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02Estimer.jsx')),
  3: lazy(() => import('./modules/Module03Arrondir.jsx')),
  4: lazy(() => import('./modules/Module04Somme.jsx')),
  5: lazy(() => import('./modules/Module05Difference.jsx')),
  6: lazy(() => import('./modules/Module06Produit.jsx')),
  7: lazy(() => import('./modules/Module07Detective.jsx')),
  8: lazy(() => import('./modules/Module08Problemes.jsx')),
  9: lazy(() => import('./modules/Module09Precision.jsx')),
  10: lazy(() => import('./modules/Module10BossFinal.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function ordreGrandeurEstimationRoutes() {
  return [
    <Route key="ordre-grandeur-estimation-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`ordre-grandeur-estimation-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
