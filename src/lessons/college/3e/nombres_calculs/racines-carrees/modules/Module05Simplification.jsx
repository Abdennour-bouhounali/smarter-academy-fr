import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from './utils';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';

export default function Module05Simplification() {
  const { prevLink, nextLink } = getNavLinks(5);

  // Ex 1: Simplifier racine de 12 (étape par étape)
  // Etape 1: Trouver le carré parfait
  const factorExercise = useAdaptiveExercise({
    id: 'racine-simplif-1',
    validator: (ans) => {
      // On attend 4x3 ou 3x4
      const txt = ans.replace(/\s+/g, '');
      if (txt === '4*3' || txt === '3*4' || txt === '4\\cdot3' || txt === '3\\cdot4' || txt === '4\\times3' || txt === '3\\times4') {
        return { isCorrect: true };
      }
      return { isCorrect: false, feedback: "Cherche un carré parfait (4, 9, 16...) qui divise 12." };
    },
    hints: [
      "Quels sont les diviseurs de 12 ?",
      "Y a-t-il un carré parfait (4, 9, 16) parmi eux ?",
      "Écris 4*3"
    ]
  });

  // Etape 2: Résultat final
  const resultExercise = useAdaptiveExercise({
    id: 'racine-simplif-2',
    validator: (ans) => {
      // On attend 2\sqrt{3}
      const txt = ans.replace(/\s+/g, '');
      if (txt === '2\\sqrt{3}' || txt === '2\\sqrt3') {
        return { isCorrect: true, feedback: "Excellent ! Tu as extrait le carré." };
      }
      if (txt === '\\sqrt{4}\\sqrt{3}') {
        return { isCorrect: false, feedback: "C'est juste, mais tu peux encore simplifier √4 !" };
      }
      return { isCorrect: false, feedback: "Combien fait √4 ? Remplace-le par sa valeur." };
    },
    hints: [
      "On sait que √12 = √(4 × 3) = √4 × √3.",
      "Remplace √4 par 2.",
      "La réponse s'écrit 2\\sqrt{3} dans le champ MathInput."
    ]
  });

  // Ex 2: Autonomie avec racine de 50
  const autonomyExercise = useAdaptiveExercise({
    id: 'racine-simplif-3',
    validator: (ans) => {
      const txt = ans.replace(/\s+/g, '');
      if (txt === '5\\sqrt{2}' || txt === '5\\sqrt2') {
        return { isCorrect: true, feedback: "Parfait ! 50 = 25 × 2." };
      }
      return { isCorrect: false, feedback: "Cherche le plus grand carré parfait qui divise 50." };
    },
    hints: [
      "Divise 50 par des carrés parfaits : 4, 9, 16, 25...",
      "50 = 25 × 2.",
      "Combien fait √25 ?"
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
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Simplification (Extraction)"
      estimatedTime="15 min"
      xp={100}
      prevLink={prevLink}
      nextLink={autonomyExercise.isCorrect ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        {/* STEP 1: LA TECHNIQUE */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            1. Extraire un carré
          </h2>
          <p className="text-slate-600 mb-6">
            Certaines racines carrées ne tombent pas juste, mais on peut les écrire de façon plus "propre" (ou simplifiée). L'idée est de faire ressortir le plus grand carré parfait caché à l'intérieur.
          </p>

          <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-100">
            <h3 className="font-bold text-purple-900 mb-4">Exemple : Simplifier <MathText math="\sqrt{18}" /></h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 font-bold flex items-center justify-center shrink-0">1</div>
                <div>On cherche un carré parfait (4, 9, 16, 25...) qui divise 18. C'est <strong>9</strong> !</div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 font-bold flex items-center justify-center shrink-0">2</div>
                <div>On décompose 18 : <MathText math="\sqrt{18} = \sqrt{9 \times 2}" /></div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 font-bold flex items-center justify-center shrink-0">3</div>
                <div>On sépare la racine (règle du produit) : <MathText math="= \sqrt{9} \times \sqrt{2}" /></div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 font-bold flex items-center justify-center shrink-0">4</div>
                <div>On remplace la partie parfaite : <MathText math="= 3 \times \sqrt{2} = 3\sqrt{2}" /></div>
              </li>
            </ul>
          </div>
        </section>

        {/* STEP 2: GUIDED EXERCISE */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            2. À toi de jouer pas à pas
          </h2>
          <p className="text-slate-600 mb-6">
            Simplifie <MathText math="\sqrt{12}" />.
          </p>

          <div className="space-y-8">
            <ExerciseValidator adaptiveState={factorExercise} onSubmit={() => factorExercise.submitAnswer()} layout="vertical">
              <p className="mb-2">Étape 1 : Écris 12 sous la forme d'un produit avec un carré parfait (utilise * pour multiplier).</p>
              <div className="flex items-center gap-4 text-xl">
                <MathText math="\sqrt{12} = \sqrt{?}" />
                <div className="w-48">
                  <MathInput
                    value={factorExercise.value}
                    onChange={factorExercise.setValue}
                    disabled={factorExercise.isCorrect}
                  />
                </div>
              </div>
            </ExerciseValidator>

            {factorExercise.isCorrect && (
              <div className="animate-in fade-in duration-500">
                <ExerciseValidator adaptiveState={resultExercise} onSubmit={() => resultExercise.submitAnswer()} layout="vertical">
                  <p className="mb-2">Étape 2 : Extrais la racine du carré parfait.</p>
                  <div className="flex items-center gap-4 text-xl">
                    <MathText math="\sqrt{4 \times 3} =" />
                    <div className="w-48">
                      <MathInput
                        value={resultExercise.value}
                        onChange={resultExercise.setValue}
                        disabled={resultExercise.isCorrect}
                      />
                    </div>
                  </div>
                </ExerciseValidator>
              </div>
            )}
          </div>
        </section>

        {/* STEP 3: AUTONOMY */}
        {resultExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              3. En autonomie
            </h2>

            <ExerciseValidator adaptiveState={autonomyExercise} onSubmit={() => autonomyExercise.submitAnswer()} layout="vertical">
              <p className="mb-4">Simplifie au maximum <MathText math="\sqrt{50}" /> :</p>
              <div className="flex items-center gap-4 text-xl bg-slate-50 p-6 rounded-xl border border-slate-200">
                <MathText math="\sqrt{50} =" />
                <div className="w-48">
                  <MathInput
                    value={autonomyExercise.value}
                    onChange={autonomyExercise.setValue}
                    disabled={autonomyExercise.isCorrect}
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
