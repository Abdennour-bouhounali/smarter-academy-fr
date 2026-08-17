import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from '../../../../../common/hooks/useSimpleExercise';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';

export default function Module07Bilan() {
  const { prevLink, nextLink } = getNavLinks(7);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Q1: Définition et carrés parfaits
  const q1Exercise = useAdaptiveExercise({
    id: 'racine-bilan-1',
    validator: (ans) => {
      const isOk = ans === '9';
      if (isOk) setScore(s => Math.max(s, 1));
      return { isCorrect: isOk, feedback: isOk ? "Correct !" : "Faux. 9 × 9 = 81." };
    },
    hints: ["Cherche le nombre qui, multiplié par lui-même, donne 81."]
  });

  // Q2: Piège de l'addition
  const q2Exercise = useAdaptiveExercise({
    id: 'racine-bilan-2',
    validator: (ans) => {
      const isOk = ans === '10';
      if (isOk) setScore(s => Math.max(s, 2));
      return { isCorrect: isOk, feedback: isOk ? "Correct ! √100 = 10." : "Faux. Attention au piège de l'addition ! Calcule 36 + 64 d'abord." };
    },
    hints: ["Calcule l'intérieur de la racine d'abord : 36 + 64."]
  });

  // Q3: Produit
  const q3Exercise = useAdaptiveExercise({
    id: 'racine-bilan-3',
    validator: (ans) => {
      const isOk = ans === '6';
      if (isOk) setScore(s => Math.max(s, 3));
      return { isCorrect: isOk, feedback: isOk ? "Bravo ! √(2×18) = √36 = 6." : "Multiplie les deux nombres sous une seule racine." };
    },
    hints: ["Applique la règle : √a × √b = √(a × b)."]
  });

  // Q4: Simplification
  const q4Exercise = useAdaptiveExercise({
    id: 'racine-bilan-4',
    validator: (ans) => {
      const txt = ans.replace(/\s+/g, '');
      const isOk = txt === '3\\sqrt{2}' || txt === '3\\sqrt2';
      if (isOk) setScore(s => Math.max(s, 4));
      return { isCorrect: isOk, feedback: isOk ? "Parfait ! √18 = √(9×2) = 3√2." : "Faux. Cherche le plus grand carré parfait qui divise 18 (c'est 9)." };
    },
    hints: ["18 = 9 × 2. Applique la racine sur 9."]
  });

  // Q5: Équation
  const q5Exercise = useAdaptiveExercise({
    id: 'racine-bilan-5',
    validator: (ans) => {
      const txt = ans.replace(/\s+/g, '');
      const isOk = txt === '4,-4' || txt === '-4,4';
      if (isOk) {
        setScore(s => Math.max(s, 5));
        setCompleted(true);
      }
      return { isCorrect: isOk, feedback: isOk ? "Félicitations ! Tu as trouvé les deux solutions." : "Faux. N'oublie pas qu'il y a DEUX solutions à cette équation." };
    },
    hints: ["Quel est le carré parfait qui donne 16 ?", "Et son opposé négatif ?"]
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
      moduleNumber={7}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Bilan Final"
      estimatedTime="10 min"
      xp={150}
      prevLink={prevLink}
      nextLink={completed ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Évaluation Finale
          </h2>
          <p className="text-slate-600 mb-8">
            Vérifions si tu maîtrises toutes les propriétés de la racine carrée.
          </p>

          <div className="space-y-8">
            {/* Q1 */}
            <ExerciseValidator adaptiveState={q1Exercise} onSubmit={() => q1Exercise.submitAnswer()} layout="vertical">
              <div className="flex items-center gap-4 text-lg">
                <span className="font-bold text-slate-700">1.</span>
                <MathText math="\sqrt{81} =" />
                <input
                  type="number"
                  value={q1Exercise.value}
                  onChange={(e) => q1Exercise.setValue(e.target.value)}
                  disabled={q1Exercise.isCorrect}
                  className="w-24 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-slate-500 focus:outline-none"
                />
              </div>
            </ExerciseValidator>

            {/* Q2 */}
            {q1Exercise.isCorrect && (
              <ExerciseValidator adaptiveState={q2Exercise} onSubmit={() => q2Exercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-lg animate-in fade-in duration-500">
                  <span className="font-bold text-slate-700">2.</span>
                  <MathText math="\sqrt{36 + 64} =" />
                  <input
                    type="number"
                    value={q2Exercise.value}
                    onChange={(e) => q2Exercise.setValue(e.target.value)}
                    disabled={q2Exercise.isCorrect}
                    className="w-24 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            )}

            {/* Q3 */}
            {q2Exercise.isCorrect && (
              <ExerciseValidator adaptiveState={q3Exercise} onSubmit={() => q3Exercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-lg animate-in fade-in duration-500">
                  <span className="font-bold text-slate-700">3.</span>
                  <MathText math="\sqrt{2} \times \sqrt{18} =" />
                  <input
                    type="number"
                    value={q3Exercise.value}
                    onChange={(e) => q3Exercise.setValue(e.target.value)}
                    disabled={q3Exercise.isCorrect}
                    className="w-24 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            )}

            {/* Q4 */}
            {q3Exercise.isCorrect && (
              <ExerciseValidator adaptiveState={q4Exercise} onSubmit={() => q4Exercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4 text-lg animate-in fade-in duration-500">
                  <span className="font-bold text-slate-700">4.</span>
                  <span className="mr-2">Simplifier</span>
                  <MathText math="\sqrt{18} =" />
                  <div className="w-48">
                    <MathInput
                      value={q4Exercise.value}
                      onChange={q4Exercise.setValue}
                      disabled={q4Exercise.isCorrect}
                    />
                  </div>
                </div>
              </ExerciseValidator>
            )}

            {/* Q5 */}
            {q4Exercise.isCorrect && (
              <ExerciseValidator adaptiveState={q5Exercise} onSubmit={() => q5Exercise.submitAnswer()} layout="vertical">
                <div className="flex flex-col gap-2 text-lg animate-in fade-in duration-500">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">5.</span>
                    <span>Quelles sont les solutions de l'équation <MathText math="x^2 = 16" /> ?</span>
                  </div>
                  <div className="flex items-center gap-4 ml-8">
                    <input
                      type="text"
                      value={q5Exercise.value}
                      onChange={(e) => q5Exercise.setValue(e.target.value)}
                      disabled={q5Exercise.isCorrect}
                      className="w-32 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-500 focus:outline-none"
                      placeholder="ex: 3, -3"
                    />
                    <span className="text-sm text-slate-500">(sépare par une virgule)</span>
                  </div>
                </div>
              </ExerciseValidator>
            )}
          </div>
          
          {completed && (
            <div className="mt-12 p-8 bg-green-50 border border-green-200 rounded-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">Félicitations !</h3>
              <p className="text-green-800">
                Tu maîtrises désormais la notion de racine carrée, ses propriétés, et la résolution d'équations associées.
              </p>
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}
