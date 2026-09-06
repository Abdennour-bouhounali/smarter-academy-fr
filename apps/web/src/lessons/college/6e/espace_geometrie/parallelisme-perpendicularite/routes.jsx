import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { LESSON_KNOWLEDGE } from './knowledge';
import { LessonKnowledgeProvider } from '../../../../common/knowledge';

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number`, not slug.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01LesRails.jsx')),
  2: lazy(() => import('./modules/Module02EcartConstant.jsx')),
  3: lazy(() => import('./modules/Module03AngleDroit.jsx')),
  4: lazy(() => import('./modules/Module04ChasseurRelations.jsx')),
  5: lazy(() => import('./modules/Module05PoserEquerre.jsx')),
  6: lazy(() => import('./modules/Module06LesDeuxRelations.jsx')),
  7: lazy(() => import('./modules/Module07AtelierConstruction.jsx')),
  8: lazy(() => import('./modules/Module08CheminPlusCourt.jsx')),
  9: lazy(() => import('./modules/Module09MissionFinale.jsx')),
};

// Provider de la carte des connaissances : il cumule les apports des modules
// validés et accueille les <KnowledgeBrick> posées au fil des étapes
// (docs/architecture/KNOWLEDGE_MAP.md).
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LessonKnowledgeProvider
        lessonId={LESSON_CONFIG.id}
        knowledge={LESSON_KNOWLEDGE}
        printTitle="PARALLÈLES ET PERPENDICULAIRES"
        printSubject="Mathématiques · 6e"
      >
        <Component />
      </LessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function parallelismePerpendiculariteRoutes() {
  return [
    <Route key="parallelisme-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`parallelisme-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
