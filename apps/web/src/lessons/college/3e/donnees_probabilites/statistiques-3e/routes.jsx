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

const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01LancerLeDe.jsx')),
  2: lazy(() => import('./modules/Module02PointDequilibre.jsx')),
  3: lazy(() => import('./modules/Module03ValeurDuMilieu.jsx')),
  4: lazy(() => import('./modules/Module04SerieElastique.jsx')),
  5: lazy(() => import('./modules/Module05TroisIndicateurs.jsx')),
  6: lazy(() => import('./modules/Module06DeuxClasses.jsx')),
  7: lazy(() => import('./modules/Module07LaboDonnees.jsx')),
  8: lazy(() => import('./modules/Module08MissionFinale.jsx')),
};

// Chaque page de la leçon (index + modules) est enveloppée dans le provider de
// la carte des connaissances : il lit la progression, cumule les apports des
// modules validés, accueille les connaissances posées par les
// <KnowledgeBrick> au fil des étapes, et monte le tiroir « Ma carte ».
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="LES STATISTIQUES"
        printSubject="Mathématiques · 3e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function statistiques3eRoutes() {
  return [
    <Route key="statistiques-3e-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`statistiques-3e-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
