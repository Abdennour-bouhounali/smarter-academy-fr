import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { LazyLessonKnowledgeProvider } from '../../../../common/knowledge/LazyKnowledgeProvider';

// La carte des connaissances de cette leçon est chargée À LA DEMANDE : elle
// n'est pas nécessaire pour apparier l'URL, seulement pour rendre la page.
// Voir common/knowledge/LazyKnowledgeProvider.jsx.
const loadKnowledge = () => import('./knowledge');

const LessonHome = lazy(() => import('./index.jsx'));

// Module<NN><Descriptor>.jsx — rebuilt on the shared lesson kit (src/lessons/
// common/kit), see docs/architecture/LESSON_INTEGRATION_GUIDE.md §11.
// Validated 2026-08-23. The pre-kit originals live in git history.
// Module 0 (prerequisite diagnostic) is new: it has no pre-kit original.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02Construire.jsx')),
  3: lazy(() => import('./modules/Module03Vocabulaire.jsx')),
  4: lazy(() => import('./modules/Module04Representer.jsx')),
  5: lazy(() => import('./modules/Module05Quantite.jsx')),
  6: lazy(() => import('./modules/Module06Quotient.jsx')),
  7: lazy(() => import('./modules/Module07Simples.jsx')),
  8: lazy(() => import('./modules/Module08Droite.jsx')),
  9: lazy(() => import('./modules/Module09Decimales.jsx')),
  10: lazy(() => import('./modules/Module10BossFinal.jsx')),
};

// Chaque page de la leçon (index + modules) est enveloppée dans le provider de
// la carte des connaissances : il lit la progression, cumule les apports des
// modules validés, accueille les connaissances posées par les
// <KnowledgeBrick> au fil des étapes, et monte le tiroir « Ma carte »
// (docs/architecture/KNOWLEDGE_MAP.md).
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="LES FRACTIONS"
        printSubject="Mathématiques · 6e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function fractionsRoutes() {
  return [
    <Route key="fractions-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`fractions-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
