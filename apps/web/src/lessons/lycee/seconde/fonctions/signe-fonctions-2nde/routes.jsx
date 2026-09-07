import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { LESSON_KNOWLEDGE } from './knowledge';
import { LessonKnowledgeProvider } from '../../../../common/knowledge';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx résolus par le NUMÉRO de module lu dans le nom
// de fichier (import.meta.glob paresseux : un module absent ne fait
// disparaître que SA route, jamais l'application).
const MODULE_FILES = import.meta.glob('./modules/Module*.jsx');

const MODULE_COMPONENTS = Object.entries(MODULE_FILES).reduce((acc, [path, loader]) => {
  const match = path.match(/Module(\d+)/);
  if (match) acc[Number(match[1])] = lazy(loader);
  return acc;
}, {});

// Chaque page de la leçon (index + modules) est enveloppée dans le provider
// de la carte des connaissances (implémentation partagée, lessons/common/knowledge) :
// il lit la progression, cumule les apports des modules validés et monte le
// tiroir « Ma carte ». Un provider par page, relu à chaque navigation.
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LessonKnowledgeProvider
        lessonId={LESSON_CONFIG.id}
        knowledge={LESSON_KNOWLEDGE}
        printTitle="SIGNE D’UNE FONCTION"
        printSubject="Mathématiques · 2nde"
      >
        <Component />
      </LessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function signeFonctions2ndeRoutes() {
  return [
    <Route key="signe-2nde-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`signe-2nde-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
