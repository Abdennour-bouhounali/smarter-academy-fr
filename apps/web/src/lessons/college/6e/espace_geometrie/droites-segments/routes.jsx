import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number`, not slug.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01JusquOuCaVa.jsx')),
  2: lazy(() => import('./modules/Module02UnSeulBout.jsx')),
  3: lazy(() => import('./modules/Module03TriDesTraits.jsx')),
  4: lazy(() => import('./modules/Module04PointsSurLaDroite.jsx')),
  5: lazy(() => import('./modules/Module05Notations.jsx')),
  6: lazy(() => import('./modules/Module06AtelierDeTrace.jsx')),
  7: lazy(() => import('./modules/Module07DecrireUneFigure.jsx')),
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
export default function droitesSegmentsRoutes() {
  return [
    <Route key="droites-segments-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`droites-segments-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
