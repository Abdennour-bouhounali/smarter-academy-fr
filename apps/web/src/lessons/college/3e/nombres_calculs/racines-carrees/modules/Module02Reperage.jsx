import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from '../../../../../common/hooks/useSimpleExercise';
import MathText from '../../../../../common/components/MathText';

export default function Module02Reperage() {
  const { prevLink, nextLink } = getNavLinks(2);

  // Ex 1: Identifier les carrés parfaits
  const carresExercise = useAdaptiveExercise({
    id: 'racine-carres-parfaits',
    validator: (ans) => {
      const isOk = ans.trim() === '64';
      return {
        isCorrect: isOk,
        feedback: isOk ? "Exactement ! 8 × 8 = 64, donc √64 = 8." : "Non. Rappelle-toi, c'est le nombre qui, multiplié par lui-même, donne l'aire du carré de côté 8."
      };
    },
    hints: [
      "Cherche le carré de 8.",
      "8 × 8 = ?"
    ]
  });

  // Ex 2: Encadrement
  const encadrementExercise = useAdaptiveExercise({
    id: 'racine-encadrement',
    validator: (ans) => {
      // Attend un format type "6 et 7" ou "6,7"
      const txt = ans.toLowerCase().replace(/[^0-9]/g, '');
      if (txt === '67') return { isCorrect: true, feedback: "Parfait ! 6² = 36 et 7² = 49, donc √40 est entre 6 et 7." };
      
      return { 
        isCorrect: false, 
        feedback: "Ce n'est pas ça. Trouve les deux carrés parfaits qui encadrent 40." 
      };
    },
    hints: [
      "Quels sont les carrés parfaits (1, 4, 9, 16, 25, 36, 49...) autour de 40 ?",
      "40 est compris entre 36 et 49.",
      "Si 40 est entre 6² et 7², alors √40 est entre..."
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
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Carrés Parfaits et Repérage"
      estimatedTime="10 min"
      xp={50}
      prevLink={prevLink}
      nextLink={encadrementExercise.isCorrect ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        {/* STEP 1: LES CARRÉS PARFAITS */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            1. Les Carrés Parfaits
          </h2>
          <p className="text-slate-600 mb-6">
            Certains nombres ont une racine carrée qui tombe "juste" (un nombre entier). On appelle ces nombres des <strong>carrés parfaits</strong>. Ce sont simplement les résultats des tables de multiplication par eux-mêmes !
          </p>

          <div className="overflow-x-auto pb-4 mb-6">
            <div className="flex gap-4 min-w-max px-2">
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <div key={n} className="flex flex-col items-center bg-indigo-50 border border-indigo-100 rounded-lg p-4 w-20">
                  <span className="text-xl font-bold text-indigo-900 mb-2">{n * n}</span>
                  <div className="h-px w-full bg-indigo-200 mb-2"></div>
                  <span className="text-sm text-indigo-700"><MathText math={`\\sqrt{${n * n}} = ${n}`} /></span>
                </div>
              ))}
            </div>
          </div>

          <ExerciseValidator adaptiveState={carresExercise} onSubmit={() => carresExercise.submitAnswer()}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-lg">Quel est le carré parfait suivant ? (Celui dont la racine est 8)</span>
              <input
                type="number"
                value={carresExercise.value}
                onChange={(e) => carresExercise.setValue(e.target.value)}
                disabled={carresExercise.isCorrect}
                className="w-24 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="?"
              />
            </div>
          </ExerciseValidator>
        </section>

        {/* STEP 2: ENCADREMENT */}
        {carresExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              2. Encadrer une racine carrée
            </h2>
            <p className="text-slate-600 mb-6">
              Quand un nombre n'est pas un carré parfait (comme 15), sa racine carrée tombe entre deux entiers. Puisque 15 est coincé entre les carrés parfaits <strong>9</strong> (3²) et <strong>16</strong> (4²), alors <MathText math="\sqrt{15}" /> est coincé entre <strong>3</strong> et <strong>4</strong>.
            </p>

            <div className="bg-slate-100 rounded-xl p-8 mb-8 relative">
              {/* Droite graduée simple */}
              <div className="relative h-2 bg-slate-300 rounded-full w-full max-w-2xl mx-auto mb-12 mt-8">
                {/* Repères pour 3, 4, 5 */}
                {[3, 4, 5].map((n, i) => (
                  <div key={n} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-500 rounded-full" style={{ left: `${(i * 50)}%` }}>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-lg font-bold">{n}</div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-slate-500">√{n*n}</div>
                  </div>
                ))}
                
                {/* Exemple √15 */}
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full ring-4 ring-indigo-200 z-10" style={{ left: '44%' }}>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 text-indigo-600 font-bold">~3.87</div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-lg font-bold text-indigo-600 bg-white px-2 py-1 rounded shadow-sm border border-indigo-100">
                    <MathText math="\sqrt{15}" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <ExerciseValidator adaptiveState={encadrementExercise} onSubmit={() => encadrementExercise.submitAnswer()} layout="vertical">
                <div className="text-lg mb-4">
                  Entre quels entiers consécutifs se situe <MathText math="\sqrt{40}" /> ?
                </div>
                <div className="flex items-center gap-4">
                  <span>Entre</span>
                  <input
                    type="number"
                    maxLength={1}
                    value={encadrementExercise.value.split(',')[0] || ''}
                    onChange={(e) => encadrementExercise.setValue(e.target.value + ',' + (encadrementExercise.value.split(',')[1] || ''))}
                    className="w-16 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <span>et</span>
                  <input
                    type="number"
                    maxLength={1}
                    value={encadrementExercise.value.split(',')[1] || ''}
                    onChange={(e) => encadrementExercise.setValue((encadrementExercise.value.split(',')[0] || '') + ',' + e.target.value)}
                    className="w-16 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>
          </section>
        )}
      </div>
    </ModuleLayout>
  );
}
