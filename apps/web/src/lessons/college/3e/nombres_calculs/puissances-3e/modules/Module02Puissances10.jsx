import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module02Puissances10() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(2);

  const [exponent, setExponent] = useState(0);
  
  const adaptiveState = useAdaptiveExercise({
    validate: (values) => {
      const exp = values.exp;
      const isCorrect = exp === 4;
      let feedback = null;
      if (!isCorrect) {
        if (exp > 4) feedback = "Tu as trop décalé la virgule. Reviens un peu en arrière.";
        else if (exp > 0) feedback = "Tu es dans la bonne direction, continue vers la droite !";
        else feedback = "Attention, un exposant négatif décale vers la gauche. On veut agrandir le nombre.";
      }
      return { isCorrect, feedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "Pour passer de 3,45 à 34 500, la virgule doit se décaler de 4 rangs vers la droite." },
      { type: 'solution', content: "Il faut choisir l'exposant 4 pour décaler de 4 rangs vers la droite." }
    ],
    onSuccess: () => {
      awardXP({ moduleId: 'L02', exerciseId: 'shift-comma', amount: 50 });
    }
  });

  const handleNext = () => markModuleCompleted('L02');

  const baseNumber = 3.45;
  
  // Format the number to visually see the comma shift
  const renderNumberWithComma = () => {
    // A simplified visualizer. 
    // We will show something like 0 0 3 , 4 5 0 0 and highlight the comma
    // In reality, 3.45 * 10^exponent.
    const val = baseNumber * Math.pow(10, exponent);
    
    // Convert to string safely avoiding JS scientific e notation for small numbers
    // by using toFixed and removing trailing zeros if needed, but here we want
    // to explicitly show the shifting.
    
    // Instead of raw formatting, let's just show the math step clearly:
    // 3,45 × 10^2 = 345
    // 3,45 × 10^-2 = 0,0345
    
    const stringVal = val.toLocaleString('fr-FR', { maximumFractionDigits: 10 });
    
    return stringVal;
  };

  const handleSliderChange = (e) => {
    setExponent(Number(e.target.value));
    if (adaptiveState.status !== 'idle') adaptiveState.reset();
  };

  // Helper text to explain the shift
  const getShiftText = () => {
    if (exponent === 0) return "La virgule ne bouge pas.";
    if (exponent > 0) return `La virgule se décale de ${exponent} rang${exponent > 1 ? 's' : ''} vers la droite (le nombre s'agrandit).`;
    return `La virgule se décale de ${Math.abs(exponent)} rang${Math.abs(exponent) > 1 ? 's' : ''} vers la gauche (le nombre rapetisse).`;
  };

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
      moduleTitle="Puissances de 10"
      moduleSubtitle="Comprenez l'effet des puissances de 10 sur un nombre décimal."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        <SectionHeader number={1} title="Le Décalage de la Virgule" color="indigo" />

        <p className="text-slate-700 leading-relaxed text-lg mb-6">
          <strong>Défi :</strong> Multiplier un nombre par une puissance de 10 revient simplement à déplacer sa virgule. 
          Déplace le curseur de l'exposant pour trouver l'écriture correspondante à <strong>34 500</strong>.
        </p>

        <div className="bg-indigo-50 rounded-2xl p-6 md:p-10 border border-indigo-100 flex flex-col items-center justify-center gap-8">
          
          {/* Main Visualizer */}
          <div className="flex items-center gap-4 text-4xl sm:text-5xl lg:text-6xl text-slate-800 drop-shadow-sm flex-wrap justify-center">
            <span className="font-bold">3,45</span>
            <span className="text-indigo-500"><MathText>{`$\\times$`}</MathText></span>
            <span className="font-bold text-indigo-600"><MathText>{`$10^{${exponent}}$`}</MathText></span>
            <span className="text-slate-400">=</span>
            <span className="font-black text-indigo-700 bg-white px-6 py-2 rounded-xl shadow-sm border border-indigo-200">
              {renderNumberWithComma()}
            </span>
          </div>

          <p className="text-xl text-indigo-800 font-medium h-8 transition-all">
            {getShiftText()}
          </p>

          {/* Slider */}
          <ExerciseValidator
            adaptiveState={adaptiveState}
            onSubmit={() => adaptiveState.submitAnswer({ exp: exponent })}
            disabled={adaptiveState.status === 'correct'}
          >
            <div className="w-full max-w-lg space-y-4 mt-4">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span><MathText>{`$10^{-4}$`}</MathText> (dix-millièmes)</span>
                <span><MathText>{`$10^{0}$`}</MathText> (unité)</span>
                <span><MathText>{`$10^{4}$`}</MathText> (dizaines de milliers)</span>
              </div>
              <input 
                type="range" min="-4" max="4" step="1" 
                value={exponent} 
                onChange={handleSliderChange}
                disabled={adaptiveState.status === 'correct'}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </ExerciseValidator>
        </div>

        {adaptiveState.status === 'correct' && (
          <div className="animate-fade-in space-y-4">
            <KeyTakeaway color="indigo">
              Multiplier par <MathText>{'$10^n$'}</MathText> avec <MathText>{'$n > 0$'}</MathText> décale la virgule vers la <strong>droite</strong>. C'est équivalent à multiplier par 10, 100, 1000...<br/><br/>
              Multiplier par <MathText>{'$10^{-n}$'}</MathText> décale la virgule vers la <strong>gauche</strong>. C'est équivalent à <strong>diviser</strong> par 10, 100, 1000...
            </KeyTakeaway>
          </div>
        )}

      </section>
    </ModuleLayout>
  );
}
