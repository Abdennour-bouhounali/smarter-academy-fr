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

// Module<NN><Descriptor>.jsx — the restored pre-reset naming convention
// (docs/architecture/LESSON_CONTRACT.md). Keyed by module `number`, not slug.
// V2 = rebuilt on the shared lesson kit (src/lessons/common/kit). The original
// Rebuilt on the shared lesson kit (src/lessons/common/kit), validated
// 2026-08-22. The pre-kit originals live in git history. L'atelier du bar à
// jus (module 6, stage `practice_lab`) a été ajouté pour enseigner
// 6e_contenances_P6, que plus aucun module ne couvrait ; le boss est redevenu
// le module 7.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  2: lazy(() => import('./modules/Module02Mesurer.jsx')),
  3: lazy(() => import('./modules/Module03Unites.jsx')),
  4: lazy(() => import('./modules/Module04RelationsUnites.jsx')),
  5: lazy(() => import('./modules/Module05Conversions.jsx')),
  6: lazy(() => import('./modules/Module06AtelierDuBar.jsx')),
  7: lazy(() => import('./modules/Module07LienVolumeMission.jsx')),
};

// Chaque page de la leçon (index + modules) est enveloppée dans le provider
// de la carte des connaissances : il lit la progression, cumule les apports
// des modules validés, accueille les connaissances posées par les
// <KnowledgeBrick> au fil des étapes, et monte le tiroir « Ma carte »
// (docs/architecture/KNOWLEDGE_MAP.md).
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="LES CONTENANCES"
        printSubject="Mathématiques · 6e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
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
