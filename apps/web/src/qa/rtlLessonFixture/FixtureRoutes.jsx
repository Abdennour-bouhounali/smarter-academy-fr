import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLessonKnowledgeProvider } from '../../lessons/common/knowledge/LazyKnowledgeProvider';
import LessonIndex from '../../lessons/common/components/LessonIndex';
import { FIXTURE_CONFIG, FIXTURE_BASE_PATH } from './fixture.config';

/**
 * La SURFACE DE QA du moteur de leçon, montée sous /__qa/rtl-lesson/*.
 *
 * Un sous-routeur plutôt qu'un tableau de <Route> : c'est ce qui permet à
 * App.jsx de ne référencer ce dossier que par un `import()` derrière une
 * condition littérale — donc de l'éliminer entièrement d'un lot de
 * production. Voir le commentaire de QA_FIXTURES_ENABLED dans App.jsx.
 *
 * Le montage lui-même reproduit celui d'une vraie leçon (fournisseur de carte
 * des connaissances compris), pour que ce qui est éprouvé soit le chemin
 * réel et non une approximation.
 */

const loadKnowledge = () => import('./knowledge.jsx');

const FixtureHome = () => <LessonIndex config={FIXTURE_CONFIG} basePath={FIXTURE_BASE_PATH} />;

const MODULE_COMPONENTS = {
  1: lazy(() => import('./modules.jsx').then((m) => ({ default: m.FixtureModule01 }))),
  2: lazy(() => import('./modules.jsx').then((m) => ({ default: m.FixtureModule02 }))),
  3: lazy(() => import('./modules.jsx').then((m) => ({ default: m.FixtureModule03 }))),
};

function withProvider(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LazyLessonKnowledgeProvider
        load={loadKnowledge}
        lessonId={FIXTURE_CONFIG.id}
        printTitle="واجهة اختبار العرض"
        printSubject="اختبار تقني"
      >
        <Component />
      </LazyLessonKnowledgeProvider>
    </Suspense>
  );
}

export default function FixtureRoutes() {
  return (
    <Routes>
      <Route index element={withProvider(FixtureHome)} />
      {FIXTURE_CONFIG.modules.map((module) => {
        const Component = MODULE_COMPONENTS[module.number];
        if (!Component) return null;
        // Le chemin est RELATIF au splat de App.jsx : seul le slug reste.
        return (
          <Route
            key={`qa-rtl-${module.id}`}
            path={module.slug}
            element={withProvider(Component)}
          />
        );
      })}
    </Routes>
  );
}
