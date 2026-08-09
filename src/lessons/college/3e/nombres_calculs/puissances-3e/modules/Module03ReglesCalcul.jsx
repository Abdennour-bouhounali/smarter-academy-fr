import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module03ReglesCalcul() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(3);

  // 0: Init Mult, 1: Developed Mult, 2: Grouped Mult, 3: Rule Mult
  // 4: Init Div, 5: Developed Div, 6: Simplified Div, 7: Rule Div
  const [step, setStep] = useState(0);

  const handleNext = () => markModuleCompleted('L03');

  const advanceStep = () => {
    setStep(s => s + 1);
    if (step === 2) {
      awardXP({ moduleId: 'L03', exerciseId: 'rule-mult', amount: 35 });
    }
    if (step === 6) {
      awardXP({ moduleId: 'L03', exerciseId: 'rule-div', amount: 40 });
    }
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
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Calculer avec les puissances"
      moduleSubtitle="Découvrez d'où viennent les règles de calcul en décomposant les opérations."
      estimatedTime="12 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        
        {/* MULTIPLICATION */}
        <SectionHeader number={1} title="La Multiplication" color="blue" />
        
        <p className="text-slate-700 text-lg">
          Que se passe-t-il quand on multiplie deux puissances qui ont la même base ?
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center gap-6 min-h-[250px] justify-center transition-all">
          
          <div className="text-4xl text-blue-800">
            <MathText>{`$2^3 \\times 2^2$`}</MathText>
          </div>

          {step >= 1 && (
            <div className="text-2xl text-slate-700 animate-fade-in flex flex-wrap justify-center gap-2">
              <span>=</span>
              <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded"><MathText>{`$(2 \\times 2 \\times 2)$`}</MathText></span>
              <span><MathText>{`$\\times$`}</MathText></span>
              <span className="text-indigo-600 bg-indigo-100 px-2 py-1 rounded"><MathText>{`$(2 \\times 2)$`}</MathText></span>
            </div>
          )}

          {step >= 2 && (
            <div className="text-3xl font-bold text-blue-700 animate-fade-in">
              <span>=</span> <MathText>{`$2^5$`}</MathText>
            </div>
          )}

          {step < 3 ? (
            <button 
              onClick={advanceStep}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              {step === 0 && "Développer"}
              {step === 1 && "Regrouper"}
              {step === 2 && "Découvrir la règle"}
            </button>
          ) : (
            <div className="w-full animate-fade-in">
              <KeyTakeaway color="blue">
                On observe que l'exposant final <strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">5</strong> est la <strong>somme</strong> des exposants de départ (<strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">3</strong> et <strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">2</strong>).<br/><br/>
                <strong>Règle : </strong> <MathText>{`$a^m \\times a^n = a^{m+n}$`}</MathText>
              </KeyTakeaway>
            </div>
          )}
        </div>

        {/* DIVISION */}
        {step >= 3 && (
          <div className="animate-fade-in space-y-8 mt-12 pt-8 border-t border-slate-100">
            <SectionHeader number={2} title="La Division" color="purple" />
            
            <p className="text-slate-700 text-lg">
              Et pour la division ? Le principe est le même : on développe et on simplifie.
            </p>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex flex-col items-center gap-6 min-h-[250px] justify-center transition-all">
              
              <div className="text-4xl text-purple-800">
                <MathText>{`$\\frac{5^4}{5^2}$`}</MathText>
              </div>

              {step >= 4 && (
                <div className="text-2xl text-slate-700 animate-fade-in flex flex-col items-center gap-2">
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded border-b border-purple-300">
                      <MathText>{`$5 \\times 5 \\times 5 \\times 5$`}</MathText>
                    </span>
                    <div className="border-t-2 border-slate-400">
                      <MathText>{`$5 \\times 5$`}</MathText>
                    </div>
                  </div>
                </div>
              )}

              {step >= 5 && (
                <div className="text-2xl text-slate-700 animate-fade-in flex flex-col items-center gap-2">
                  <span className="text-sm text-slate-500">(On simplifie en barrant deux '5' en haut et en bas)</span>
                  <div className="text-3xl font-bold text-purple-700 mt-2">
                    = <MathText>{`$5^2$`}</MathText>
                  </div>
                </div>
              )}

              {step < 6 ? (
                <button 
                  onClick={advanceStep}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                >
                  {step === 3 && "Développer"}
                  {step === 4 && "Simplifier la fraction"}
                  {step === 5 && "Découvrir la règle"}
                </button>
              ) : (
                <div className="w-full animate-fade-in">
                  <KeyTakeaway color="purple">
                    On observe que l'exposant final <strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded">2</strong> est la <strong>différence</strong> des exposants de départ (<strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded">4</strong> et <strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded">2</strong>).<br/><br/>
                    <strong>Règle : </strong> <MathText>{`$\\frac{a^m}{a^n} = a^{m-n}$`}</MathText>
                  </KeyTakeaway>
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </ModuleLayout>
  );
}
