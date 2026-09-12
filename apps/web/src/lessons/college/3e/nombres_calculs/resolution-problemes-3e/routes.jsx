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

// Module<NN><Descriptor>.jsx (docs/architecture/LESSON_CONTRACT.md), résolus par
// le NUMÉRO de module lu dans le nom de fichier, pas par un import statique.
//
// `import.meta.glob` est volontairement paresseux : pendant la construction de
// la leçon, un module encore à écrire fait simplement disparaître SA route, au
// lieu de casser la résolution d'App.jsx (qui importe toutes les leçons) et de
// renvoyer un 500 pour l'application entière.
const MODULE_FILES = import.meta.glob('./modules/Module*.jsx');

const MODULE_COMPONENTS = Object.entries(MODULE_FILES).reduce((acc, [path, loader]) => {
  const match = path.match(/Module(\d+)/);
  if (match) acc[Number(match[1])] = lazy(loader);
  return acc;
}, {});

// Chaque page est enveloppée dans le provider de la carte des connaissances.
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={LESSON_CONFIG.id}
        printTitle="RÉSOLUTION DE PROBLÈMES"
        printSubject="Mathématiques · 3e"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

/** Route elements for this lesson, spread into App.jsx's <Routes>. */
export default function resolutionProblemes3eRoutes() {
  return [
    <Route key="resolution-problemes-3e-index" path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => {
        const Component = MODULE_COMPONENTS[m.number];
        if (!Component) return null;
        return <Route key={`resolution-problemes-3e-${m.id}`} path={m.path} element={withSuspense(Component)} />;
      })
      .filter(Boolean),
  ];
}
