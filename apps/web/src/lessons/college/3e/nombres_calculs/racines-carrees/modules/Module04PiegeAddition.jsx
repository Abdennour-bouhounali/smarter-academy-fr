import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from '../../../../../common/hooks/useSimpleExercise';
import MathText from '../../../../../common/components/MathText';

export default function Module04PiegeAddition() {
  const { prevLink, nextLink } = getNavLinks(4);

  // Ex 1: Calcul avec addition globale
  const globalAddExercise = useAdaptiveExercise({
    id: 'racine-add-1',
    validator: (ans) => {
      const isOk = ans === '5';
      return {
        isCorrect: isOk,
        feedback: isOk ? "C'est exact ! √25 = 5." : "Calcule d'abord l'intérieur de la racine : 16 + 9 = 25. Ensuite, trouve √25."
      };
    },
    hints: [
      "Que fait 16 + 9 ?",
      "Combien fait √25 ?"
    ]
  });

  // Ex 2: Calcul avec addition séparée
  const separateAddExercise = useAdaptiveExercise({
    id: 'racine-add-2',
    validator: (ans) => {
      const isOk = ans === '7';
      return {
        isCorrect: isOk,
        feedback: isOk ? "Exact ! √16 = 4, √9 = 3, et 4 + 3 = 7." : "Calcule √16 d'abord (4), puis √9 (3), et additionne-les."
      };
    },
    hints: [
      "Calcule chaque racine séparément.",
      "√16 = 4 et √9 = 3.",
      "Combien fait 4 + 3 ?"
    ]
  });

  // Ex 3: Conclusion
  const conclusionExercise = useAdaptiveExercise({
    id: 'racine-add-conclusion',
    validator: (ans) => {
      const isOk = ans.trim().toLowerCase() === 'non';
      return {
        isCorrect: isOk,
        feedback: isOk ? "Bien vu ! 5 n'est pas égal à 7. La racine carrée ne se sépare PAS sur l'addition !" : "Regarde bien tes deux résultats au-dessus : 5 et 7. Sont-ils égaux ?"
      };
    },
    hints: [
      "Le premier calcul a donné 5.",
      "Le deuxième a donné 7.",
      "Écris 'oui' ou 'non'."
    ]
  });

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Le Piège de l'Addition"
      estimatedTime="8 min"
      xp={50}
      prevLink={prevLink}
      nextLink={conclusionExercise.isCorrect ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        {/* STEP 1: LE PIÈGE */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            1. Le grand piège
          </h2>
          <p className="text-slate-600 mb-6">
            Tu as vu que la racine carrée se sépare très bien avec la multiplication. Mais que se passe-t-il avec l'addition ? Faisons le test.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl">
              <h3 className="font-bold text-rose-900 mb-4">Calcul 1</h3>
              <p className="text-slate-700 mb-4">On additionne d'abord, puis on prend la racine.</p>
              <ExerciseValidator adaptiveState={globalAddExercise} onSubmit={() => globalAddExercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-xl">
                  <MathText math="\sqrt{16 + 9} =" />
                  <input
                    type="number"
                    value={globalAddExercise.value}
                    onChange={(e) => globalAddExercise.setValue(e.target.value)}
                    disabled={globalAddExercise.isCorrect}
                    className="w-20 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
              <h3 className="font-bold text-orange-900 mb-4">Calcul 2</h3>
              <p className="text-slate-700 mb-4">On prend les racines d'abord, puis on additionne.</p>
              <ExerciseValidator adaptiveState={separateAddExercise} onSubmit={() => separateAddExercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-xl">
                  <MathText math="\sqrt{16} + \sqrt{9} =" />
                  <input
                    type="number"
                    value={separateAddExercise.value}
                    onChange={(e) => separateAddExercise.setValue(e.target.value)}
                    disabled={separateAddExercise.isCorrect}
                    className="w-20 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>
          </div>

          {globalAddExercise.isCorrect && separateAddExercise.isCorrect && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in duration-500">
              <ExerciseValidator adaptiveState={conclusionExercise} onSubmit={() => conclusionExercise.submitAnswer()} layout="vertical">
                <div className="text-lg mb-4 text-slate-800">
                  Est-ce que <MathText math="\sqrt{16 + 9}" /> est égal à <MathText math="\sqrt{16} + \sqrt{9}" /> ? (Réponds par <strong>oui</strong> ou <strong>non</strong>)
                </div>
                <input
                  type="text"
                  value={conclusionExercise.value}
                  onChange={(e) => conclusionExercise.setValue(e.target.value)}
                  disabled={conclusionExercise.isCorrect}
                  className="w-32 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-rose-500 focus:outline-none"
                />
              </ExerciseValidator>
            </div>
          )}
        </section>

        {/* STEP 2: FORMALISATION */}
        {conclusionExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              2. À graver dans sa mémoire
            </h2>

            <div className="bg-rose-100 border-l-8 border-rose-500 p-6 rounded-r-xl mb-8 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-rose-900">ATTENTION DANGER ⚠️</h3>
              <p className="text-rose-800">
                La racine carrée <strong>ne se distribue JAMAIS</strong> sur l'addition (ni sur la soustraction).
              </p>
              <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm border border-rose-200">
                <div className="text-xl font-bold text-rose-900 text-center">
                  <MathText math="\sqrt{a + b} \neq \sqrt{a} + \sqrt{b}" />
                </div>
                <div className="text-xl font-bold text-rose-900 text-center">
                  <MathText math="\sqrt{a - b} \neq \sqrt{a} - \sqrt{b}" />
                </div>
              </div>
            </div>

            <p className="text-slate-700">
              Si tu rencontres une addition sous une racine, tu <strong>DOIS</strong> calculer l'addition d'abord.
            </p>
          </section>
        )}
      </div>
    </ModuleLayout>
  );
}
