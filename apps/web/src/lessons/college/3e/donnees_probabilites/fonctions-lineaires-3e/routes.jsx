import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { LESSON_KNOWLEDGE } from './knowledge';
import { LessonKnowledgeProvider } from '../../../../common/knowledge';

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

// Chaque page de la leçon (index + modules) est enveloppée dans le provider de
// la carte des connaissances : il lit la progression, cumule les apports des
// modules validés, accueille les connaissances posées par les
// <KnowledgeBrick> au fil des étapes, et monte le tiroir « Ma carte ».
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LessonKnowledgeProvider
        lessonId={LESSON_CONFIG.id}
        knowledge={LESSON_KNOWLEDGE}
        printTitle="LES FONCTIONS LINÉAIRES"
        printSubject="Mathématiques · 3e"
      >
        <Component />
      </LessonKnowledgeProvider>
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
