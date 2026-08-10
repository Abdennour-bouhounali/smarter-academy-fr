import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from './utils';
import MathText from '../../../../../common/components/MathText';

export default function Module06Equations() {
  const { prevLink, nextLink } = getNavLinks(6);

  // Ex 1: Deviner le premier nombre
  const positiveExercise = useAdaptiveExercise({
    id: 'racine-eq-1',
    validator: (ans) => {
      const isOk = ans === '5';
      return {
        isCorrect: isOk,
        feedback: isOk ? "C'est ça ! 5 × 5 = 25." : "Quel nombre positif multiplié par lui-même donne 25 ?"
      };
    },
    hints: ["Pense à √25."]
  });

  // Ex 2: Le deuxième nombre caché
  const negativeExercise = useAdaptiveExercise({
    id: 'racine-eq-2',
    validator: (ans) => {
      const isOk = ans === '-5';
      return {
        isCorrect: isOk,
        feedback: isOk ? "Exactement ! (-5) × (-5) fait aussi +25." : "Pense aux nombres négatifs... (-x) × (-x) = +x² !"
      };
    },
    hints: [
      "Un nombre négatif multiplié par un nombre négatif donne un résultat positif.",
      "Si 5 marche, l'opposé de 5 marche aussi."
    ]
  });

  // Ex 3: Cas impossible
  const impossibleExercise = useAdaptiveExercise({
    id: 'racine-eq-3',
    validator: (ans) => {
      const txt = ans.toLowerCase().trim();
      const isOk = txt.includes('0') || txt.includes('aucune') || txt.includes('impossible');
      return {
        isCorrect: isOk,
        feedback: isOk ? "Très bien ! Un carré est TOUJOURS positif (ou nul)." : "Non. Essaie de multiplier un nombre positif par lui-même, puis un négatif par lui-même... Obtiens-tu jamais un résultat négatif ?"
      };
    },
    hints: [
      "(+3) × (+3) = +9",
      "(-3) × (-3) = +9",
      "Il n'y a aucune solution !"
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
      moduleNumber={6}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Équations du type x² = a"
      estimatedTime="10 min"
      xp={75}
      prevLink={prevLink}
      nextLink={impossibleExercise.isCorrect ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        {/* STEP 1: DÉCOUVERTE */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            1. Le jumeau caché
          </h2>
          <p className="text-slate-600 mb-6">
            Résolvons l'équation <MathText math="x^2 = 25" />. Cela veut dire : "Quel nombre <em>x</em>, élevé au carré, donne 25 ?"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ExerciseValidator adaptiveState={positiveExercise} onSubmit={() => positiveExercise.submitAnswer()} layout="vertical">
              <div className="bg-sky-50 border border-sky-100 p-6 rounded-xl h-full flex flex-col justify-center">
                <p className="mb-4 text-sky-900 font-bold">Trouve une première solution (évidente) :</p>
                <input
                  type="number"
                  value={positiveExercise.value}
                  onChange={(e) => positiveExercise.setValue(e.target.value)}
                  disabled={positiveExercise.isCorrect}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
                  placeholder="?"
                />
              </div>
            </ExerciseValidator>

            {positiveExercise.isCorrect && (
              <div className="animate-in fade-in duration-500">
                <ExerciseValidator adaptiveState={negativeExercise} onSubmit={() => negativeExercise.submitAnswer()} layout="vertical">
                  <div className="bg-sky-100 border border-sky-200 p-6 rounded-xl h-full flex flex-col justify-center">
                    <p className="mb-4 text-sky-900 font-bold">Mais il y a un autre nombre qui marche ! Lequel ?</p>
                    <input
                      type="number"
                      value={negativeExercise.value}
                      onChange={(e) => negativeExercise.setValue(e.target.value)}
                      disabled={negativeExercise.isCorrect}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
                      placeholder="?"
                    />
                  </div>
                </ExerciseValidator>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2: DISTINCTION & REGLE */}
        {negativeExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              2. La grande différence
            </h2>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1 bg-amber-50 border border-amber-200 p-6 rounded-xl">
                <h3 className="font-bold text-amber-900 mb-2">Le nombre <MathText math="\sqrt{25}" /></h3>
                <p className="text-amber-800">C'est UN SEUL nombre. Par définition, c'est le nombre <strong>positif</strong>. <br/> <MathText math="\sqrt{25} = 5" /></p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-200 p-6 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2">L'équation <MathText math="x^2 = 25" /></h3>
                <p className="text-blue-800">C'est une question. Elle a <strong>DEUX</strong> réponses : <br/> <MathText math="x = 5 \text{ ou } x = -5" /></p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4">Résumé des équations du type x² = a</h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 font-bold flex items-center justify-center shrink-0">+</div>
                <div>Si <strong>a {'>'} 0</strong> (ex: x² = 9), il y a 2 solutions : <MathText math="\sqrt{a}" /> et <MathText math="-\sqrt{a}" />.</div>
              </li>
              <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">0</div>
                <div>Si <strong>a = 0</strong> (ex: x² = 0), il y a 1 solution : x = 0.</div>
              </li>
            </ul>
          </section>
        )}

        {/* STEP 3: CAS IMPOSSIBLE */}
        {negativeExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              3. Le cas des nombres négatifs
            </h2>
            
            <ExerciseValidator adaptiveState={impossibleExercise} onSubmit={() => impossibleExercise.submitAnswer()} layout="vertical">
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl">
                <p className="mb-4 text-rose-900 font-bold">Combien de solutions a l'équation <MathText math="x^2 = -9" /> ?</p>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={impossibleExercise.value}
                    onChange={(e) => impossibleExercise.setValue(e.target.value)}
                    disabled={impossibleExercise.isCorrect}
                    className="w-32 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-rose-500 focus:outline-none"
                    placeholder="0, aucune..."
                  />
                </div>
              </div>
            </ExerciseValidator>
          </section>
        )}

      </div>
    </ModuleLayout>
  );
}
