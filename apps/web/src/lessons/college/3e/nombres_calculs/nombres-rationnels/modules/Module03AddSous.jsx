import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Module03AddSous() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(3);

  const handleNext = () => markModuleCompleted('L03');

  // Simulateur de Dénominateur Commun
  const num1 = 1; const den1 = 3;
  const num2 = 1; const den2 = 4;
  
  const [selectedDen, setSelectedDen] = useState(null);
  const commonDenominators = [3, 4, 7, 12, 24];

  const getSimResult = () => {
    if (!selectedDen) return null;
    if (selectedDen % den1 === 0 && selectedDen % den2 === 0) {
      const mul1 = selectedDen / den1;
      const mul2 = selectedDen / den2;
      return {
        success: true,
        newNum1: num1 * mul1,
        newNum2: num2 * mul2,
        mul1,
        mul2
      };
    }
    return { success: false };
  };

  const simResult = getSimResult();

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
      moduleTitle="Addition et Soustraction"
      moduleSubtitle="Mettre des fractions au même dénominateur pour pouvoir les additionner ou les soustraire."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Pourquoi un dénominateur commun ? */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Le problème des parts différentes" color="violet" />

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-slate-700 leading-relaxed mb-4">
            Imaginez que vous vouliez additionner un tiers de pizza et un quart de pizza. 
            Les parts n'ont <strong>pas la même taille</strong>. Vous ne pouvez pas juste dire "ça fait 2 parts".
          </p>

          {/* Simulateur interactif */}
          <div className="bg-white border-2 border-violet-100 rounded-xl p-6 mt-6 max-w-2xl mx-auto">
            <h4 className="font-bold text-violet-900 mb-4 text-center">Trouver un dénominateur commun</h4>
            <p className="text-sm text-slate-600 text-center mb-6">
              Pour additionner <MathText>{'$\\frac{1}{3} + \\frac{1}{4}$'}</MathText>, trouvez un multiple commun à 3 et 4.
            </p>

            <div className="flex justify-center gap-4 mb-6">
              {commonDenominators.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDen(d)}
                  className={`w-12 h-12 rounded-xl font-bold transition-all ${selectedDen === d ? 'bg-violet-600 text-white shadow-lg scale-110' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            {selectedDen && !simResult.success && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
                <AlertCircle size={18} /> {selectedDen} n'est pas un multiple commun de 3 et 4.
              </div>
            )}

            {selectedDen && simResult.success && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 mb-6 border border-emerald-200">
                  <CheckCircle2 size={20} /> Excellent ! {selectedDen} est un multiple commun.
                </div>

                <div className="flex items-center justify-center gap-8 flex-wrap">
                  {/* Fraction 1 transformation */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xl"><MathText>{'$\\frac{1}{3}$'}</MathText></div>
                      <ArrowRight className="text-slate-400" size={16} />
                      <div className="text-xl text-violet-700 font-bold"><MathText>{`$\\frac{${simResult.newNum1}}{${selectedDen}}$`}</MathText></div>
                    </div>
                    <span className="text-xs text-slate-500">(multiplié par {simResult.mul1})</span>
                  </div>

                  <div className="text-2xl font-bold text-slate-400">+</div>

                  {/* Fraction 2 transformation */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xl"><MathText>{'$\\frac{1}{4}$'}</MathText></div>
                      <ArrowRight className="text-slate-400" size={16} />
                      <div className="text-xl text-violet-700 font-bold"><MathText>{`$\\frac{${simResult.newNum2}}{${selectedDen}}$`}</MathText></div>
                    </div>
                    <span className="text-xs text-slate-500">(multiplié par {simResult.mul2})</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <p className="text-slate-600 mb-2">Maintenant que les parts ont la même taille, on peut les additionner :</p>
                  <div className="text-2xl font-bold bg-violet-100 text-violet-800 inline-block px-6 py-3 rounded-xl">
                    <MathText>{`$\\frac{${simResult.newNum1}}{${selectedDen}} + \\frac{${simResult.newNum2}}{${selectedDen}} = \\frac{${simResult.newNum1 + simResult.newNum2}}{${selectedDen}}$`}</MathText>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2 : Règle formelle et erreur classique */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="La règle et l'erreur fatale" color="rose" />

        <p className="text-slate-700 leading-relaxed mb-4">
          Pour additionner ou soustraire deux fractions :
          <br/>1. On les met <strong>au même dénominateur</strong>.
          <br/>2. On additionne (ou soustrait) <strong>uniquement les numérateurs</strong>.
          <br/>3. On garde le dénominateur commun.
        </p>

        {/* Erreur fréquente */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mt-4">
          <p className="font-bold text-rose-900 mb-2 flex items-center gap-2 text-lg">
            <AlertCircle size={24} /> L'erreur la plus fréquente du collège !
          </p>
          <p className="text-sm text-rose-800 mb-4">
            Ne tombez jamais dans ce piège : <strong>on n'additionne JAMAIS les dénominateurs.</strong>
          </p>
          <div className="bg-white p-4 rounded border border-rose-100 flex flex-col md:flex-row items-center gap-6 justify-center">
             <div className="text-center">
               <span className="bg-rose-200 text-rose-900 font-bold px-2 py-1 rounded text-xs mb-2 inline-block">FAUX</span>
               <div className="text-rose-600 font-bold line-through text-xl">
                 <MathText>{'$\\frac{2}{5} + \\frac{1}{5} = \\frac{3}{10}$'}</MathText>
               </div>
             </div>
             
             <div className="text-slate-300 font-bold text-2xl hidden md:block">VS</div>
             
             <div className="text-center">
               <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-1 rounded text-xs mb-2 inline-block">VRAI</span>
               <div className="text-emerald-600 font-bold text-xl">
                 <MathText>{'$\\frac{2}{5} + \\frac{1}{5} = \\frac{3}{5}$'}</MathText>
               </div>
             </div>
          </div>
          <p className="text-xs text-rose-700 mt-4 italic text-center">
            2 pommes + 1 pomme = 3 pommes. Pas 3 "double-pommes" !
          </p>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="Vérification" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Quel est le résultat de <MathText>{'$\\frac{3}{2} - \\frac{1}{4}$'}</MathText> ?
            </p>
          }
          choices={[
            { label: <MathText>{'$\\frac{2}{2}$'}</MathText>, correct: false },
            { label: <MathText>{'$\\frac{2}{-2}$'}</MathText>, correct: false },
            { label: <MathText>{'$\\frac{5}{4}$'}</MathText>, correct: true },
          ]}
          successFeedback={
            <>
              <strong>Parfait !</strong> Le dénominateur commun est 4. On transforme la première fraction : <MathText>{'$\\frac{3}{2} = \\frac{6}{4}$'}</MathText>. Puis on calcule : <MathText>{'$\\frac{6}{4} - \\frac{1}{4} = \\frac{5}{4}$'}</MathText>. (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Attention, vous ne pouvez pas soustraire directement ! Trouvez d'abord un dénominateur commun (4 est dans la table de 2). Modifiez la première fraction avant de soustraire.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L03', exerciseId: 'L03-Q1', amount: 50 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="violet">
        <li>
          • Pour additionner ou soustraire, on <strong>doit absolument</strong> mettre les fractions au même dénominateur.
        </li>
        <li>
          • On n'additionne <strong>jamais</strong> les dénominateurs entre eux !
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
