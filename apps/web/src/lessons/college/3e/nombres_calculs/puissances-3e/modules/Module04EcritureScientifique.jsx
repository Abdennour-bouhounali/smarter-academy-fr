import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { validateScientificNotation } from '@smarter-academy/core';

const SCIENTIFIC_NOTATION_FEEDBACK = {
  coef_not_numeric: 'Le coefficient doit être un nombre.',
  coef_too_large: 'Attention, le coefficient doit être strictement inférieur à 10 !',
  coef_too_small: 'Attention, le coefficient doit être supérieur ou égal à 1 !',
  coef_wrong: 'Le coefficient est incorrect. Où placer la virgule dans 45 000 ?',
  exp_not_numeric: "L'exposant doit être un nombre entier.",
  exp_wrong: `Presque ! De combien de rangs la virgule s'est-elle déplacée de 4,5 pour arriver à 45 000 ?`,
};

export default function Module04EcritureScientifique() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(4);

  const [sliderVal, setSliderVal] = useState(0);

  // Exercise states
  const [coefInput, setCoefInput] = useState('');
  const [expInput, setExpInput] = useState('');

  // Setup the adaptive exercise
  const exerciseId = 'scientific-notation-1';
  
  const validateAnswer = (answerObj) => {
    const { isCorrect, fields, reason } = validateScientificNotation(
      answerObj.coef,
      answerObj.exp,
      { coefficient: 4.5, exponent: 4 }
    );
    return { isCorrect, fields, feedback: reason ? SCIENTIFIC_NOTATION_FEEDBACK[reason] : null };
  };

  const guidanceSteps = [
    { type: 'hint', content: "Rappelle-toi de la règle : l'écriture scientifique s'écrit $a \\times 10^n$, avec $1 \\le a < 10$." },
    { type: 'hint', content: "Pour 45 000, trouve d'abord le coefficient $a$. Place la virgule pour avoir un nombre entre 1 et 10." },
    { type: 'hint', content: "Le coefficient est 4,5. Demande-toi par combien il faut multiplier 4,5 pour retrouver 45 000." },
    { type: 'solution', content: ["Le coefficient doit être compris entre 1 et 10, donc on choisit $a = 4,5$.", "Pour passer de 4,5 à 45 000, la virgule se déplace de 4 rangs vers la droite.", "Donc l'exposant est 4.", "L'écriture scientifique est $4,5 \\times 10^4$."] }
  ];

  const adaptiveState = useAdaptiveExercise({
    validate: validateAnswer,
    guidanceSteps,
    onSuccess: () => {
      awardXP({ moduleId: 'L04', exerciseId, amount: 75 });
      markModuleCompleted('L04');
    }
  });

  const handleSubmit = () => {
    adaptiveState.submitAnswer({ coef: coefInput, exp: expInput });
  };

  const renderShiftingNumber = () => {
    const str = "620000";
    if (sliderVal === 0) return <span>{str}</span>;
    
    const leftPart = str.slice(0, str.length - sliderVal);
    const rightPart = str.slice(str.length - sliderVal);
    
    return (
      <span className="font-bold text-4xl">
        {leftPart}<span className="text-purple-600">,</span>{rightPart}
      </span>
    );
  };

  const coefStatus = adaptiveState.fieldStatuses.coef;
  const expStatus = adaptiveState.fieldStatuses.exp;

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
      moduleTitle="Écriture scientifique"
      moduleSubtitle="Manipulez la virgule pour comprendre l'écriture scientifique."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={() => markModuleCompleted('L04')}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        
        <SectionHeader number={1} title="Pourquoi l'Écriture Scientifique ?" color="purple" />
        
        <p className="text-slate-700 text-lg">
          L'écriture scientifique permet d'écrire des nombres très grands ou très petits de manière compacte.
          La règle : <MathText>{`$a \\times 10^n$`}</MathText> avec <MathText>{`$1 \\le a < 10$`}</MathText>.
        </p>

        {/* Visual Interactive */}
        <div className="bg-purple-50 rounded-2xl p-6 md:p-10 border border-purple-100 flex flex-col items-center justify-center gap-8">
          <h3 className="font-bold text-purple-800 text-xl text-center">Déplacez la virgule pour former l'écriture scientifique de 620 000</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-4xl text-slate-800">
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 min-w-[200px] text-center">
              {renderShiftingNumber()}
            </div>
            
            {sliderVal > 0 && (
              <div className="animate-fade-in flex items-center gap-4">
                <span className="text-purple-500"><MathText>{`$\\times$`}</MathText></span>
                <span className="font-bold text-purple-700 bg-white px-4 py-3 rounded-xl shadow-sm border border-purple-200">
                  <MathText>{`$10^{${sliderVal}}$`}</MathText>
                </span>
              </div>
            )}
          </div>

          <div className="w-full max-w-lg mt-4">
            <input 
              type="range" min="0" max="5" step="1" 
              value={sliderVal} 
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="mt-4 text-center text-purple-800 font-medium h-6">
              {sliderVal > 0 ? `La virgule s'est déplacée de ${sliderVal} rang(s).` : "Le nombre sous sa forme décimale classique."}
            </div>
          </div>
        </div>

        {sliderVal === 5 && (
          <div className="animate-fade-in">
            <KeyTakeaway color="purple">
              Parfait ! 6,2 est bien compris entre 1 et 10. L'écriture scientifique est donc <MathText>{`$6,2 \\times 10^5$`}</MathText>.
            </KeyTakeaway>
          </div>
        )}

        {/* Adaptive Exercise */}
        <SectionHeader number={2} title="À vous de jouer" color="amber" />
        
        <div className="bg-amber-50 p-6 md:p-8 rounded-2xl border border-amber-100">
          <p className="font-bold text-slate-800 mb-6 text-lg">
            Convertissez le nombre <strong className="text-amber-700">45 000</strong> en écriture scientifique :
          </p>
          
          <ExerciseValidator 
            adaptiveState={adaptiveState}
            onSubmit={handleSubmit}
            disabled={adaptiveState.status === 'correct'}
          >
            <div className="flex flex-wrap items-center gap-4 text-2xl font-bold text-slate-700">
              <input 
                type="text" 
                value={coefInput}
                onChange={(e) => {
                  setCoefInput(e.target.value);
                  if (adaptiveState.status !== 'idle') adaptiveState.reset();
                }}
                className={`w-32 bg-white border-2 rounded-xl px-4 py-3 text-center outline-none transition-colors
                  ${coefStatus === true ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : ''}
                  ${coefStatus === false ? 'border-rose-500 bg-rose-50 text-rose-800' : ''}
                  ${coefStatus === undefined ? 'border-slate-300 focus:border-amber-500' : ''}
                `}
                placeholder="a"
                disabled={adaptiveState.status === 'correct' || adaptiveState.status === 'solution_viewed'}
              />
              <span className="text-slate-400"><MathText>{`$\\times$`}</MathText></span>
              <span className="text-amber-600">10</span>
              <input 
                type="text" 
                value={expInput}
                onChange={(e) => {
                  setExpInput(e.target.value);
                  if (adaptiveState.status !== 'idle') adaptiveState.reset();
                }}
                className={`w-20 bg-white border-2 rounded-xl px-4 py-3 text-center outline-none -mt-4 text-lg transition-colors
                  ${expStatus === true ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : ''}
                  ${expStatus === false ? 'border-rose-500 bg-rose-50 text-rose-800' : ''}
                  ${expStatus === undefined ? 'border-slate-300 focus:border-amber-500' : ''}
                `}
                placeholder="n"
                disabled={adaptiveState.status === 'correct' || adaptiveState.status === 'solution_viewed'}
              />
            </div>
          </ExerciseValidator>

        </div>
        
      </section>
    </ModuleLayout>
  );
}
