import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), indexés par
// le `number` du module. Leçon construite d'emblée sur le lesson kit.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01PrixAuKilo.jsx')),
  2: lazy(() => import('./modules/Module02Coefficient.jsx')),
  3: lazy(() => import('./modules/Module03DroiteAPivot.jsx')),
  4: lazy(() => import('./modules/Module04RetrouverCoefficient.jsx')),
  5: lazy(() => import('./modules/Module05LaboLineaire.jsx')),
  6: lazy(() => import('./modules/Module06MissionFinale.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function fonctionsLineaires3eRoutes() {
  return [
    <Route key="fonctions-lineaires-3e-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`fonctions-lineaires-3e-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
