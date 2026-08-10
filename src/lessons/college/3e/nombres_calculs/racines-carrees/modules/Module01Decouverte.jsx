import React, { useState } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';

import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from './utils';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';

export default function Module01Decouverte() {
  const { prevLink, nextLink } = getNavLinks(1);
  const [sideLength, setSideLength] = useState(5);

  const area = sideLength * sideLength;

  // Ex 1: Problème inverse
  const inverseExercise = useAdaptiveExercise({
    id: 'racine-decouverte-1',
    validator: (ans) => {
      const isOk = ans === '6';
      return {
        isCorrect: isOk,
        feedback: isOk ? "C'est exact ! 6 × 6 = 36." : "Quel nombre multiplié par lui-même donne 36 ?"
      };
    },
    hints: [
      "Cherche un nombre qui, quand on le multiplie par lui-même (carré), fait 36.",
      "Essaie avec 5 (5×5=25), puis 6..."
    ]
  });

  // Ex 2: Saisie de racine avec MathInput
  const notationExercise = useAdaptiveExercise({
    id: 'racine-decouverte-2',
    validator: (ans) => {
      const isOk = ans.trim() === '\\sqrt{36}' || ans.trim() === '\\sqrt36';
      return {
        isCorrect: isOk,
        feedback: isOk ? "Parfait ! La notation est maîtrisée." : "Utilise le bouton de racine carrée, et mets 36 à l'intérieur."
      };
    },
    hints: [
      "Cherche le symbole de la racine carrée (√) sur le clavier virtuel.",
      "Le résultat qu'on cherche est la racine de l'aire : tape \\sqrt{36}"
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
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Découverte et Aire"
      estimatedTime="10 min"
      xp={50}
      prevLink={prevLink}
      nextLink={notationExercise.isCorrect ? nextLink : null}
      onNextClick={() => {}}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        {/* STEP 1: MANIPULATION */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            1. De l'aire au côté
          </h2>
          <p className="text-slate-600 mb-6">
            L'humanité a inventé la racine carrée pour résoudre un problème géométrique très simple : connaissant <strong>l'aire</strong> d'un champ carré, quelle est la <strong>longueur</strong> de son côté ?
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Visualisation interactive */}
            <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <div 
                className="bg-emerald-100 border-2 border-emerald-500 rounded flex items-center justify-center transition-all duration-300"
                style={{ width: `${sideLength * 20}px`, height: `${sideLength * 20}px` }}
              >
                <span className="font-bold text-emerald-800">{area} cm²</span>
              </div>
              
              <div className="mt-8 w-full max-w-xs space-y-4 text-center">
                <label className="block text-slate-700 font-bold">
                  Longueur du côté : {sideLength} cm
                </label>
                <input 
                  type="range" 
                  min="1" max="10" step="1"
                  value={sideLength}
                  onChange={(e) => setSideLength(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-slate-500 text-sm">
                  Aire = Côté × Côté = {sideLength} × {sideLength} = {area} cm²
                </p>
              </div>
            </div>
            
            {/* Problème inverse */}
            <div className="flex-1 space-y-6">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                <p className="text-emerald-900 font-medium">
                  Le problème inverse : On a un carré dont l'aire est de <strong>36 cm²</strong>. Quelle est la longueur de son côté ?
                </p>
              </div>
              
              <ExerciseValidator adaptiveState={inverseExercise} onSubmit={() => inverseExercise.submitAnswer()} layout="vertical">
                <div className="flex items-center gap-4">
                  <span className="text-lg text-slate-700 font-bold">Côté =</span>
                  <input
                    type="number"
                    value={inverseExercise.value}
                    onChange={(e) => inverseExercise.setValue(e.target.value)}
                    disabled={inverseExercise.isCorrect}
                    className="w-24 px-4 py-2 text-center border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none text-lg"
                    placeholder="?"
                  />
                  <span className="text-lg text-slate-700">cm</span>
                </div>
              </ExerciseValidator>
            </div>
          </div>
        </section>

        {/* STEP 2: NOTATION MATHÉMATIQUE */}
        {inverseExercise.isCorrect && (
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              2. La notation mathématique
            </h2>
            <p className="text-slate-600 mb-6">
              Chercher le côté d'un carré quand on connaît son aire, c'est chercher sa <strong>racine carrée</strong>. Le symbole de la racine carrée est <MathText math="\sqrt{\quad}" />.
            </p>
            
            <div className="bg-slate-800 text-white rounded-xl p-6 mb-8 text-center text-xl font-mono">
              <MathText math="6 \times 6 = 36 \implies \sqrt{36} = 6" />
            </div>

            <h3 className="font-bold text-slate-700 mb-4">À toi de jouer :</h3>
            <p className="text-slate-600 mb-4">Saisis l'expression "Racine carrée de 36" (sans calculer le résultat) dans le champ ci-dessous.</p>
            
            <ExerciseValidator adaptiveState={notationExercise} onSubmit={() => notationExercise.submitAnswer()} layout="vertical">
              <div className="max-w-xs">
                <MathInput
                  value={notationExercise.value}
                  onChange={notationExercise.setValue}
                  disabled={notationExercise.isCorrect}
                />
              </div>
            </ExerciseValidator>
          </section>
        )}

      </div>
    </ModuleLayout>
  );
}
