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

// Les modules sont découverts par glob : un module encore absent (leçon en
// cours de construction) fait disparaître SA route, au lieu de casser le
// chargement de toute l'application — App.jsx importe ce fichier au démarrage.
// Le nom de fichier doit commencer par Module<NN> (LESSON_CONTRACT.md).
const MODULE_FILES = import.meta.glob('./modules/Module*.jsx');
const MODULE_COMPONENTS = Object.entries(MODULE_FILES).reduce((acc, [path, loader]) => {
  const match = path.match(/Module(\d+)/);
  if (match) acc[Number(match[1])] = lazy(loader);
  return acc;
}, {});

// Chaque page est enveloppée dans le provider de la carte des connaissances :
// il cumule les apports des modules validés et accueille les connaissances
// posées par les <KnowledgeBrick> au fil des étapes.
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="THÉORÈME DE THALÈS"
        printSubject="Mathématiques · 3e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function thales3eRoutes() {
  return [
    <Route key="thales-3e-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`thales-3e-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
