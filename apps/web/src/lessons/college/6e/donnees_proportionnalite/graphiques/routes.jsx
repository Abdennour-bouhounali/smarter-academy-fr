import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number`, not slug. Leçon construite d'emblée sur le lesson kit
// (common/kit) — pas de version pré-kit, pas d'archive.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01DouzeNombres.jsx')),
  2: lazy(() => import('./modules/Module02Anatomie.jsx')),
  3: lazy(() => import('./modules/Module03TableauGraphique.jsx')),
  4: lazy(() => import('./modules/Module04LireComparer.jsx')),
  5: lazy(() => import('./modules/Module05Evolution.jsx')),
  6: lazy(() => import('./modules/Module06GraphiqueQuiMent.jsx')),
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
export default function graphiquesRoutes() {
  return [
    <Route key="graphiques-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`graphiques-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
