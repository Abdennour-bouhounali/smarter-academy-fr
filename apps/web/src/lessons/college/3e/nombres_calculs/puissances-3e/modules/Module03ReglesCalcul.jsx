import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';

export default function Module03ReglesCalcul() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(3);

  // 0: Init Mult, 1: Developed Mult, 2: Grouped Mult
  // 3: Init Div, 4: Developed Div, 5: Simplified Div
  const [step, setStep] = useState(0);

  const [multExp, setMultExp] = useState('');
  const [divExp, setDivExp] = useState('');

  const multAdaptiveState = useAdaptiveExercise({
    validate: (values) => {
      const isCorrect = values.exp.trim() === '5';
      let feedback = null;
      if (!isCorrect) {
        feedback = "Compte le nombre total de facteurs '2' dans la multiplication regroupée.";
      }
      return { isCorrect, feedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "Dans $(2 \\times 2 \\times 2) \\times (2 \\times 2)$, combien y a-t-il de 2 au total ?" },
      { type: 'solution', content: "Il y a 5 facteurs 2. La réponse est donc 5." }
    ],
    onSuccess: () => {
      awardXP({ moduleId: 'L03', exerciseId: 'rule-mult', amount: 35 });
    }
  });

  const divAdaptiveState = useAdaptiveExercise({
    validate: (values) => {
      const isCorrect = values.exp.trim() === '2';
      let feedback = null;
      if (!isCorrect) {
        feedback = "Après avoir simplifié en barrant deux facteurs '5' en haut et en bas, combien de '5' reste-t-il ?";
      }
      return { isCorrect, feedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "Regarde l'étape précédente. Après avoir barré, il ne reste que $5 \\times 5$." },
      { type: 'solution', content: "Puisqu'il reste deux fois le nombre 5, l'exposant est 2." }
    ],
    onSuccess: () => {
      awardXP({ moduleId: 'L03', exerciseId: 'rule-div', amount: 40 });
    }
  });

  const handleNext = () => markModuleCompleted('L03');

  const advanceStep = () => {
    setStep(s => s + 1);
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
            <div className="w-full mt-4 flex flex-col items-center">
              <ExerciseValidator
                adaptiveState={multAdaptiveState}
                onSubmit={() => multAdaptiveState.submitAnswer({ exp: multExp })}
                disabled={multAdaptiveState.status === 'correct'}
              >
                <div className="flex items-center gap-2 text-3xl font-bold text-blue-700 justify-center">
                  <span>= 2</span>
                  <input
                    type="text"
                    value={multExp}
                    onChange={(e) => {
                      setMultExp(e.target.value);
                      if (multAdaptiveState.status !== 'idle') multAdaptiveState.reset();
                    }}
                    placeholder="?"
                    className={`w-12 h-12 text-center rounded-xl border-2 font-bold text-xl focus:outline-none transition-colors -mt-6 ${
                      multAdaptiveState.status === 'correct' ? 'bg-emerald-600 text-white border-emerald-600' : 
                      multAdaptiveState.status === 'error' ? 'bg-rose-50 border-rose-400 text-rose-800' :
                      'bg-white border-blue-300 text-blue-800 focus:border-blue-500'
                    }`}
                    disabled={multAdaptiveState.status === 'correct'}
                  />
                </div>
              </ExerciseValidator>
            </div>
          )}

          {step < 2 ? (
            <button 
              onClick={advanceStep}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              {step === 0 && "Développer"}
              {step === 1 && "Regrouper"}
            </button>
          ) : multAdaptiveState.status === 'correct' && (
            <div className="w-full animate-fade-in mt-4">
              <KeyTakeaway color="blue">
                On observe que l'exposant final <strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">5</strong> est la <strong>somme</strong> des exposants de départ (<strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">3</strong> et <strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">2</strong>).<br/><br/>
                <strong>Règle : </strong> <MathText>{`$a^m \\times a^n = a^{m+n}$`}</MathText>
              </KeyTakeaway>
              <div className="flex justify-center mt-6">
                {step === 2 && (
                   <button onClick={advanceStep} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                     Suite : La Division
                   </button>
                )}
              </div>
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
              
              {step >= 3 && (
                <div className="text-4xl text-purple-800">
                  <MathText>{`$\\frac{5^4}{5^2}$`}</MathText>
                </div>
              )}

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
                <div className="w-full mt-4 flex flex-col items-center">
                  <span className="text-sm text-slate-500 mb-4">(On simplifie en barrant deux '5' en haut et en bas)</span>
                  <ExerciseValidator
                    adaptiveState={divAdaptiveState}
                    onSubmit={() => divAdaptiveState.submitAnswer({ exp: divExp })}
                    disabled={divAdaptiveState.status === 'correct'}
                  >
                    <div className="flex items-center gap-2 text-3xl font-bold text-purple-700 justify-center">
                      <span>= 5</span>
                      <input
                        type="text"
                        value={divExp}
                        onChange={(e) => {
                          setDivExp(e.target.value);
                          if (divAdaptiveState.status !== 'idle') divAdaptiveState.reset();
                        }}
                        placeholder="?"
                        className={`w-12 h-12 text-center rounded-xl border-2 font-bold text-xl focus:outline-none transition-colors -mt-6 ${
                          divAdaptiveState.status === 'correct' ? 'bg-emerald-600 text-white border-emerald-600' : 
                          divAdaptiveState.status === 'error' ? 'bg-rose-50 border-rose-400 text-rose-800' :
                          'bg-white border-purple-300 text-purple-800 focus:border-purple-500'
                        }`}
                        disabled={divAdaptiveState.status === 'correct'}
                      />
                    </div>
                  </ExerciseValidator>
                </div>
              )}

              {step < 5 ? (
                <button 
                  onClick={advanceStep}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                >
                  {step === 3 && "Développer"}
                  {step === 4 && "Simplifier la fraction"}
                </button>
              ) : divAdaptiveState.status === 'correct' && (
                <div className="w-full animate-fade-in mt-4">
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
