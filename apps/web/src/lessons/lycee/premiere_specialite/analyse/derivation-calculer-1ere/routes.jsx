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

// Module<NN><Descriptor>.jsx résolus par le NUMÉRO de module lu dans le nom
// de fichier (import.meta.glob paresseux : un module absent ne fait
// disparaître que SA route, jamais l'application).
const MODULE_FILES = import.meta.glob('./modules/Module*.jsx');

const MODULE_COMPONENTS = Object.entries(MODULE_FILES).reduce((acc, [path, loader]) => {
  const match = path.match(/Module(\d+)/);
  if (match) acc[Number(match[1])] = lazy(loader);
  return acc;
}, {});

// Chaque page de la leçon (index + modules) est enveloppée dans le provider de
// la carte des connaissances (implémentation partagée, lessons/common/knowledge).
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="LES RÈGLES DE CALCUL DES DÉRIVÉES"
        printSubject="Mathématiques · 1ère spé"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function derivationCalculer1ereRoutes() {
  return [
    <Route key="deriv-calc-1ere-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`deriv-calc-1ere-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
