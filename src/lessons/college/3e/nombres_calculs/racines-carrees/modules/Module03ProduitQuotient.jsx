import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from './utils';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';

export default function Module03ProduitQuotient() {
  const { prevLink, nextLink } = getNavLinks(3);

  // Ex 1: Calcul direct
  const firstCalcExercise = useAdaptiveExercise({
    id: 'racine-produit-1',
    validator: (ans) => {
      const isOk = ans === '6';
      return {
        isCorrect: isOk,
        feedback: isOk ? "C'est exact ! √36 = 6." : "Calcule d'abord 9 × 4, ce qui fait 36. Ensuite, trouve √36."
      };
    },
    hints: [
      "Que fait 9 × 4 ?",
      "9 × 4 = 36. Combien fait √36 ?"
    ]
  });

  // Ex 2: Calcul séparé
  const secondCalcExercise = useAdaptiveExercise({
    id: 'racine-produit-2',
    validator: (ans) => {
      const isOk = ans === '6';
      return {
        isCorrect: isOk,
        feedback: isOk ? "C'est exact ! 3 × 2 = 6." : "Calcule √9 d'abord (ça fait 3), puis √4 (ça fait 2), et multiplie-les."
      };
    },
    hints: [
      "Calcule chaque racine séparément.",
      "√9 = 3 et √4 = 2.",
      "Combien fait 3 × 2 ?"
    ]
  });

  // Ex 3: Application de la règle
  const applicationExercise = useAdaptiveExercise({
    id: 'racine-produit-app',
    validator: (ans) => {
      // Peut utiliser MathInput, on vérifie la valeur "50"
      const val = ans.trim();
      const isOk = val === '50' || val === '5\\cdot10' || val === '10\\cdot5' || val === '5\\times10';
      return {
        isCorrect: isOk,
        feedback: isOk ? "Bravo ! √25 × √100 = 5 × 10 = 50." : "Non. Sépare le calcul : √25 d'un côté, et √100 de l'autre."
      };
    },
    hints: [
      "Applique la règle : √(25 × 100) = √25 × √100",
      "Combien fait √25 ? Combien fait √100 ?",
      "Calcule 5 × 10."
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
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Produit et Quotient"
      estimatedTime="12 min"
      xp={75}
      prevLink={prevLink}
      nextLink={applicationExercise.isCorrect ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        {/* STEP 1: DÉCOUVERTE */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            1. Une observation intéressante
          </h2>
          <p className="text-slate-600 mb-6">
            Comparons deux calculs différents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-4">Calcul 1</h3>
              <p className="text-slate-700 mb-4">On multiplie d'abord, puis on prend la racine.</p>
              <ExerciseValidator adaptiveState={firstCalcExercise} onSubmit={() => firstCalcExercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-xl">
                  <MathText math="\sqrt{9 \times 4} =" />
                  <input
                    type="number"
                    value={firstCalcExercise.value}
                    onChange={(e) => firstCalcExercise.setValue(e.target.value)}
                    disabled={firstCalcExercise.isCorrect}
                    className="w-20 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>

            <div className="bg-sky-50 border border-sky-100 p-6 rounded-xl">
              <h3 className="font-bold text-sky-900 mb-4">Calcul 2</h3>
              <p className="text-slate-700 mb-4">On prend les racines d'abord, puis on multiplie.</p>
              <ExerciseValidator adaptiveState={secondCalcExercise} onSubmit={() => secondCalcExercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-xl">
                  <MathText math="\sqrt{9} \times \sqrt{4} =" />
                  <input
                    type="number"
                    value={secondCalcExercise.value}
                    onChange={(e) => secondCalcExercise.setValue(e.target.value)}
                    disabled={secondCalcExercise.isCorrect}
                    className="w-20 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>
          </div>
        </section>

        {/* STEP 2: FORMALISATION */}
        {firstCalcExercise.isCorrect && secondCalcExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              2. Les règles de calcul
            </h2>
            <p className="text-slate-600 mb-6">
              Tu as trouvé le même résultat (6) ! Ce n'est pas un hasard. La racine carrée <strong>se distribue</strong> sur la multiplication et la division.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl mb-8 flex flex-col gap-4">
              <div className="flex items-center justify-center gap-8 bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                <div className="text-xl font-bold text-amber-900">
                  <MathText math="\sqrt{a \times b} = \sqrt{a} \times \sqrt{b}" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-8 bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                <div className="text-xl font-bold text-amber-900">
                  <MathText math="\sqrt{\frac{a}{b}} = \frac{\sqrt{a}}{\sqrt{b}}" />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-slate-700 mb-4">À toi de jouer :</h3>
            <ExerciseValidator adaptiveState={applicationExercise} onSubmit={() => applicationExercise.submitAnswer()} layout="vertical">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="mb-4">Calcule mentalement, sans poser la multiplication de 25 par 100 :</p>
                <div className="flex items-center gap-4 text-xl">
                  <MathText math="\sqrt{25 \times 100} =" />
                  <div className="flex-1 max-w-[200px]">
                    <MathInput
                      value={applicationExercise.value}
                      onChange={applicationExercise.setValue}
                      disabled={applicationExercise.isCorrect}
                    />
                  </div>
                </div>
              </div>
            </ExerciseValidator>
          </section>
        )}
      </div>
    </ModuleLayout>
  );
}
