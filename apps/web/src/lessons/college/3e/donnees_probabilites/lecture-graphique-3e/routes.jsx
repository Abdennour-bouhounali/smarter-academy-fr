import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

const LessonHome = lazy(() => import('./index.jsx'));

const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Montgolfiere.jsx')),
  2: lazy(() => import('./modules/Module02ImageOuAntecedent.jsx')),
  3: lazy(() => import('./modules/Module03EchelleImposee.jsx')),
  4: lazy(() => import('./modules/Module04CurseurSonde.jsx')),
  5: lazy(() => import('./modules/Module05DeuxBallons.jsx')),
  6: lazy(() => import('./modules/Module06LaboLecture.jsx')),
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
export default function lectureGraphique3eRoutes() {
  return [
    <Route key="lecture-graphique-3e-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`lecture-graphique-3e-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
