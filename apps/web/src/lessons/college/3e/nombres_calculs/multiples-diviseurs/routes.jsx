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
// module `number`, not slug. Leçon construite d'emblée sur le lesson kit
// (common/kit) — pas de version pré-kit, pas d'archive.
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01ChaisesDeLaFete.jsx')),
  2: lazy(() => import('./modules/Module02DeuxLectures.jsx')),
  3: lazy(() => import('./modules/Module03GrilleDesMultiples.jsx')),
  4: lazy(() => import('./modules/Module04RectangleDetecteur.jsx')),
  5: lazy(() => import('./modules/Module05Crible.jsx')),
  6: lazy(() => import('./modules/Module06ArbreDesFacteurs.jsx')),
  7: lazy(() => import('./modules/Module07LaboDecompositions.jsx')),
  8: lazy(() => import('./modules/Module08MissionFinale.jsx')),
};

// Chaque page est enveloppée dans le provider de la carte des connaissances.
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="MULTIPLES ET DIVISEURS"
        printSubject="Mathématiques · 3e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function multiplesDiviseursRoutes() {
  return [
    <Route key="multiples-diviseurs-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`multiples-diviseurs-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
