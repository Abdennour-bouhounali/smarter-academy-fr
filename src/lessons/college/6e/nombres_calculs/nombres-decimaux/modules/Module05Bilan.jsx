import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import ConceptCard from '../../../../../common/components/ConceptCard';

const QUESTIONS = [
  {
    type: 'fraction',
    title: 'De la fraction au décimal',
    question: 'Comment s\'écrit la fraction 45/10 en écriture décimale ?',
    options: ['0,45', '4,5', '45,10'],
    correct: 1
  },
  {
    type: 'ordre',
    title: 'Ordre de grandeur',
    question: 'Quel est l\'entier le plus proche de 14,8 ?',
    options: ['14', '15', '148'],
    correct: 1
  },
  {
    type: 'comparaison',
    title: 'Piège de la virgule',
    question: 'Quel nombre est le plus grand ?',
    options: ['3,2', '3,15', 'Ils sont égaux'],
    correct: 0
  }
];

export default function Module05Bilan() {
  const { prevLink, nextLink } = getNavLinks(5);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const currentExercise = QUESTIONS[exerciseIndex];
  const [selectedOption, setSelectedOption] = useState(null);

  const adaptiveState = useAdaptiveExercise({
    validate: () => ({ isCorrect: selectedOption === currentExercise.correct }),
    guidanceSteps: [
      { type: 'solution', content: `La bonne réponse était la proposition numéro ${currentExercise.correct + 1}.` }
    ],
    onSuccess: () => {}
  });

  const handleValidate = () => {
    if (adaptiveState.status === 'correct') return;
    setSelectedOption(null);
  };

  const handleNext = () => {
    const nextIndex = exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    setSelectedOption(null);
    adaptiveState.reset();
  };

  const isModuleComplete = adaptiveState.status === 'correct' && exerciseIndex >= 2;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Bilan"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={isModuleComplete ? nextLink : undefined}
      isCompleted={isModuleComplete}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl shadow-lg text-white text-center mb-8">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-blue-200" />
          <h2 className="text-3xl font-bold mb-2 font-space">Le Grand Défi Final</h2>
          <p className="text-blue-100 text-lg">Prouve que tu maîtrises les nombres décimaux !</p>
        </div>

        {!isModuleComplete ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
            <span className="text-sm font-bold text-blue-500 uppercase tracking-wider block mb-2">
              Mission {exerciseIndex + 1} : {currentExercise.title}
            </span>
            <h2 className="text-xl font-bold text-slate-800 mb-8">
              {currentExercise.question}
            </h2>
            
            <div className="flex flex-col gap-4 max-w-md mx-auto mb-8">
              {currentExercise.options.map((opt, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  disabled={adaptiveState.status === 'correct'}
                  className={`px-6 py-4 text-lg font-bold rounded-xl border-2 transition-all ${
                    selectedOption === index
                      ? 'bg-blue-500 border-blue-600 text-white shadow-md transform scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="max-w-sm mx-auto">
              <ExerciseValidator 
                adaptiveState={adaptiveState}
                onSubmit={() => adaptiveState.submitAnswer()}
                disabled={selectedOption === null}
              />
              {adaptiveState.status === 'correct' && exerciseIndex < 2 && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors animate-pulse mt-4"
                >
                  Question suivante ➔
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-12 rounded-3xl shadow-sm border-2 border-emerald-400 text-center animate-in zoom-in duration-500">
              <Trophy size={64} className="text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-4 font-space">Chapitre validé !</h2>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Félicitations, tu maîtrises maintenant parfaitement les nombres décimaux, les fractions décimales et le repérage sur axe.
              </p>
            </div>

            <ConceptCard label="L'essentiel à retenir" emoji="📊" color="blue">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-center">
                  <h4 className="font-bold text-blue-800 mb-2">Fractions & Virgule</h4>
                  <p className="text-sm text-slate-600">
                    1 unité = 10 dixièmes<br/>
                    <span className="font-space font-bold mt-2 block">12/10 = 1,2</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-center">
                  <h4 className="font-bold text-emerald-800 mb-2">Tableau</h4>
                  <p className="text-sm text-slate-600">
                    Centaines, Dizaines, Unités<br/>
                    <span className="font-bold text-rose-500">,</span><br/>
                    Dixièmes, Centièmes, Millièmes
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-center">
                  <h4 className="font-bold text-amber-800 mb-2">Comparaison</h4>
                  <p className="text-sm text-slate-600">
                    On compare de gauche à droite sans se fier à la longueur.<br/>
                    <span className="font-space font-bold mt-2 block">4,50 {'>'} 4,12</span>
                  </p>
                </div>
              </div>
            </ConceptCard>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
