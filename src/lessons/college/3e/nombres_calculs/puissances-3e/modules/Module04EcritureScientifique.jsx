import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module04EcritureScientifique() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(4);

  const [sliderVal, setSliderVal] = useState(0);

  // Example number: 620 000 -> 6.2 * 10^5
  const baseNum = 620000;
  
  // Exercise states
  const [coefInput, setCoefInput] = useState('');
  const [expInput, setExpInput] = useState('');

  // Setup the adaptive exercise
  const exerciseId = 'scientific-notation-1';
  const validateAnswer = (answerObj) => {
    // Check if the input is correct
    // answerObj will be { coef: '4.5', exp: '4' } (for 45000)
    
    let isCorrect = true;
    let hint = "";

    const c = answerObj.coef.replace(',', '.');
    const e = answerObj.exp;

    if (c !== '4.5') {
      isCorrect = false;
      const cNum = Number(c);
      if (isNaN(cNum)) {
        hint = "Le coefficient doit être un nombre.";
      } else if (cNum >= 10) {
        hint = "Attention, le coefficient doit être strictement inférieur à 10 !";
      } else if (cNum < 1) {
        hint = "Attention, le coefficient doit être supérieur ou égal à 1 !";
      } else {
        hint = "Le coefficient est incorrect. Où placer la virgule dans 45 000 ?";
      }
    } else if (e !== '4') {
      isCorrect = false;
      const eNum = Number(e);
      if (isNaN(eNum)) {
        hint = "L'exposant doit être un nombre entier.";
      } else {
        hint = `Presque ! De combien de rangs la virgule s'est-elle déplacée de 4,5 pour arriver à 45 000 ?`;
      }
    }

    if (isCorrect) {
      awardXP({ moduleId: 'L04', exerciseId, amount: 75 });
      markModuleCompleted('L04');
    }

    return { isCorrect, hint };
  };

  const {
    status,
    message,
    attempts,
    submitAnswer
  } = useAdaptiveExercise(MODULE_CTX.lessonId, exerciseId, validateAnswer);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAnswer({ coef: coefInput, exp: expInput });
  };

  const renderShiftingNumber = () => {
    // 620000 -> slider from 0 to 5
    // slider = 0 -> 620000
    // slider = 1 -> 62000,0 * 10^1
    // slider = 2 -> 6200,00 * 10^2
    // slider = 5 -> 6,20000 * 10^5
    
    // Quick string formatting
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
        
        <form onSubmit={handleSubmit} className="bg-amber-50 p-6 md:p-8 rounded-2xl border border-amber-100">
          <p className="font-bold text-slate-800 mb-6 text-lg">
            Convertissez le nombre <strong className="text-amber-700">45 000</strong> en écriture scientifique :
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-2xl font-bold text-slate-700">
            <input 
              type="text" 
              value={coefInput}
              onChange={(e) => setCoefInput(e.target.value)}
              className="w-32 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-center focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none"
              placeholder="a"
              disabled={status === 'success'}
            />
            <span className="text-slate-400"><MathText>{`$\\times$`}</MathText></span>
            <span className="text-amber-600">10</span>
            <input 
              type="text" 
              value={expInput}
              onChange={(e) => setExpInput(e.target.value)}
              className="w-20 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-center focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none -mt-4 text-lg"
              placeholder="n"
              disabled={status === 'success'}
            />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button 
              type="submit"
              disabled={status === 'success' || !coefInput || !expInput}
              className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              Vérifier
            </button>
            
            {status === 'success' && (
              <span className="text-emerald-600 font-bold flex items-center gap-2">
                ✅ Excellent !
              </span>
            )}
          </div>

          {/* Feedback Section */}
          {message && status !== 'success' && (
            <div className={`mt-6 p-4 rounded-xl border ${status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              <div className="flex gap-3">
                <span className="text-xl">💡</span>
                <p className="font-medium">{message}</p>
              </div>
            </div>
          )}
        </form>
        
      </section>
    </ModuleLayout>
  );
}
