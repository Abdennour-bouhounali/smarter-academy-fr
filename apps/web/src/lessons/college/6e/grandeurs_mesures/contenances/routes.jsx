import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx — the restored pre-reset naming convention
// (docs/architecture/LESSON_CONTRACT.md). Keyed by module `number`, not slug.
// V2 = rebuilt on the shared lesson kit (src/lessons/common/kit). The original
// Module<NN>*.jsx files are kept untouched as the validated backup — to revert,
// drop the V2 suffix on any line below.
// Rebuilt on the shared lesson kit (src/lessons/common/kit), validated
// 2026-08-22. The pre-kit originals are archived in ./modules/_archive_original/
// (not routed, kept for reference only). Original module 6 ("Problèmes et
// choix d'unité") was removed 2026-08-22 — the boss is now module 6.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02Mesurer.jsx')),
  3: lazy(() => import('./modules/Module03Unites.jsx')),
  4: lazy(() => import('./modules/Module04RelationsUnites.jsx')),
  5: lazy(() => import('./modules/Module05Conversions.jsx')),
  6: lazy(() => import('./modules/Module06LienVolumeMission.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Component />
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function contenancesRoutes() {
  return [
    <Route key="contenances-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`contenances-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
