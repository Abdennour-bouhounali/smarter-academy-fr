import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { LazyLessonKnowledgeProvider } from '../../../../common/knowledge/LazyKnowledgeProvider';

// La carte des connaissances de cette leçon est chargée À LA DEMANDE :
// elle n'est pas nécessaire pour APPARIER l'URL (les chemins viennent de
// lesson.config.js), seulement pour rendre la page. Voir
// common/knowledge/LazyKnowledgeProvider.jsx.
const loadKnowledge = () => import('./knowledge');

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), keyed by
// module `number` — module 0 (le diagnostic) inclus.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01LeStyloQuiObeit.jsx')),
  2: lazy(() => import('./modules/Module02UneEntree.jsx')),
  3: lazy(() => import('./modules/Module03LeProgrammeCalcule.jsx')),
  4: lazy(() => import('./modules/Module04DouzeFois.jsx')),
  5: lazy(() => import('./modules/Module05LaFigureQuiSeReferme.jsx')),
  6: lazy(() => import('./modules/Module06LeProgrammeQuiBugue.jsx')),
  7: lazy(() => import('./modules/Module07LaboDeReparation.jsx')),
  8: lazy(() => import('./modules/Module08MissionFinale.jsx')),
};

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="ALGORITHMIQUE ET PROGRAMMATION"
        printSubject="Mathématiques · 5e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function algorithmiqueProgrammation5eRoutes() {
  return [
    <Route key="algo5-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`algo5-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
