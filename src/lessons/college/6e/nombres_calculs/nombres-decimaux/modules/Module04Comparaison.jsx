import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConceptCard from '../../../../../common/components/ConceptCard';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { Scale, Sparkles } from 'lucide-react';

const generateExercise = (difficulty) => {
  let num1, num2, correctSymbol;
  
  if (difficulty === 1) {
    // The Trap!
    num1 = 4.12;
    num2 = 4.5;
  } else if (difficulty === 2) {
    const whole = Math.floor(Math.random() * 20);
    const decA = Math.floor(Math.random() * 9) + 1;
    const decB = Math.floor(Math.random() * 90) + 10;
    num1 = Number(`${whole}.${decA}`);
    num2 = Number(`${whole}.${decB}`);
    if (Math.random() > 0.5) {
      const temp = num1; num1 = num2; num2 = temp;
    }
  } else {
    num1 = Number((Math.random() * 100).toFixed(1));
    num2 = Number((Math.random() * 100).toFixed(1));
    if (num1 === num2) num2 += 0.1;
  }
  
  if (num1 < num2) correctSymbol = '<';
  else if (num1 > num2) correctSymbol = '>';
  else correctSymbol = '=';
  
  return {
    num1: num1.toString().replace('.', ','),
    num2: num2.toString().replace('.', ','),
    correctSymbol
  };
};

export default function Module04Comparaison() {
  const { prevLink, nextLink } = getNavLinks(4);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(() => generateExercise(1));
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  const adaptiveState = useAdaptiveExercise({
    validate: () => {
      const isCorrect = selectedSymbol === currentExercise.correctSymbol;
      let feedback = "Ce n'est pas le bon symbole.";
      if (!isCorrect && exerciseIndex === 0 && selectedSymbol === '>') {
        feedback = "Tu as comparé 12 et 5 directement ! Mais dans 4,12 et 4,5, il faut d'abord comparer les dixièmes. 4,5 c'est 4 unités et 5 dixièmes (donc 50 centièmes).";
      } else if (!isCorrect) {
        feedback = "Compare d'abord les parties entières, puis les dixièmes, puis les centièmes.";
      }
      return { isCorrect, feedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "Compare d'abord la partie entière. Si elle est identique, compare les dixièmes, puis les centièmes." },
      { type: 'hint', content: "On peut ajouter des zéros à la fin de la partie décimale pour comparer plus facilement (ex: 4,5 = 4,50)." },
      { type: 'solution', content: `Le bon symbole est ${currentExercise.correctSymbol}.` }
    ],
    onSuccess: () => {}
  });

  const handleSelect = (symbol) => {
    if (adaptiveState.status === 'correct') return;
    setSelectedSymbol(symbol);
  };

  const handleNext = () => {
    const nextIndex = exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    setCurrentExercise(generateExercise(nextIndex > 0 ? 2 : 1));
    setSelectedSymbol(null);
    adaptiveState.reset();
  };

  const isModuleComplete = adaptiveState.status === 'correct' && exerciseIndex >= 2;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Comparaison"
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={isModuleComplete ? nextLink : undefined}
      isCompleted={isModuleComplete}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
          <div className="text-center mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission {exerciseIndex + 1} / 3</span>
            <h2 className="text-xl font-bold text-slate-800 mt-2">
              Le piège des décimaux ! Quel symbole manque-t-il entre ces deux nombres ?
            </h2>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-4xl font-space font-bold text-slate-700 bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-200">
              {currentExercise.num1}
            </div>
            
            <div className="flex flex-col gap-2">
              {['<', '=', '>'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSelect(symbol)}
                  disabled={adaptiveState.status === 'correct'}
                  className={`w-16 h-12 text-2xl font-bold rounded-xl border-2 transition-all ${
                    selectedSymbol === symbol
                      ? 'bg-blue-500 border-blue-600 text-white shadow-md scale-110'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>

            <div className="text-4xl font-space font-bold text-slate-700 bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-200">
              {currentExercise.num2}
            </div>
          </div>

          <div className="max-w-sm mx-auto">
            {!isModuleComplete ? (
              <div className="flex flex-col gap-4">
                <ExerciseValidator 
                  adaptiveState={adaptiveState}
                  onSubmit={() => adaptiveState.submitAnswer()}
                  disabled={!selectedSymbol}
                />
                {adaptiveState.status === 'correct' && exerciseIndex < 2 && (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors animate-pulse mt-4"
                  >
                    Question suivante ➔
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6 mt-8">
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
                  <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">Bien joué !</h3>
                  <p className="text-emerald-700 mb-6">Tu sais éviter le piège de la longueur ! On compare chiffre par chiffre, de gauche à droite.</p>
                </div>

                <KeyTakeaway color="blue">
                  <p className="font-bold text-lg mb-2">À retenir</p>
                  <li>On ne compare <strong>pas</strong> la longueur de la partie décimale. 4,5 n'est pas "plus petit" que 4,12 juste parce qu'il a moins de chiffres !</li>
                  <li>On peut ajouter des zéros à la fin pour avoir le même nombre de chiffres (ex: 4,5 = 4,50).</li>
                  <li>On compare <strong>chiffre par chiffre</strong>, de gauche à droite.</li>
                </KeyTakeaway>
              </div>
            )}
          </div>
        </div>

      </div>
    </ModuleLayout>
  );
}
