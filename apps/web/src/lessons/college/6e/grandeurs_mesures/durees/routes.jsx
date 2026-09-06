import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { LESSON_KNOWLEDGE } from './knowledge';
import { LessonKnowledgeProvider } from '../../../../common/knowledge';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number`, not slug. Leçon construite d'emblée sur le lesson kit
// (common/kit) — pas de version pré-kit, pas d'archive.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02LireHeure.jsx')),
  3: lazy(() => import('./modules/Module03SecretDu60.jsx')),
  4: lazy(() => import('./modules/Module04ConvertirComparer.jsx')),
  5: lazy(() => import('./modules/Module05MethodeSauts.jsx')),
  6: lazy(() => import('./modules/Module06MissionsHoraires.jsx')),
  7: lazy(() => import('./modules/Module07MissionFinale.jsx')),
};

// Chaque page de la leçon (index + modules) est enveloppée dans le provider
// de la carte des connaissances : il lit la progression, cumule les apports
// des modules validés, accueille les connaissances posées par les
// <KnowledgeBrick> au fil des étapes, et monte le tiroir « Ma carte »
// (docs/architecture/KNOWLEDGE_MAP.md).
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LessonKnowledgeProvider
        lessonId={LESSON_CONFIG.id}
        knowledge={LESSON_KNOWLEDGE}
        printTitle="LES DURÉES"
        printSubject="Mathématiques · 6e"
      >
        <Component />
      </LessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function dureesRoutes() {
  return [
    <Route key="durees-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`durees-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
