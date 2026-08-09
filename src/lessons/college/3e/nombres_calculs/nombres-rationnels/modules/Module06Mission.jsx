import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

export default function Module06Mission() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(6);

  const [step, setStep] = useState(1);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [selectedC, setSelectedC] = useState(null);

  const handleNext = () => markModuleCompleted('L06');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={6}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Mission : Le Budget du Club"
      moduleSubtitle="Modéliser un problème de la vie réelle avec des fractions pour trouver la solution."
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span>🎯</span> La situation
        </h2>
        
        <p className="text-slate-700 leading-relaxed mb-4">
          Le club de robotique du collège a reçu un budget pour l'année. 
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Il dépense <MathText>{'$\\frac{1}{3}$'}</MathText> du budget pour acheter des moteurs.</li>
          <li>Il dépense <MathText>{'$\\frac{1}{4}$'}</MathText> du budget pour des capteurs.</li>
          <li>Le <strong>reste</strong> est utilisé pour l'inscription au tournoi.</li>
        </ul>
        <p className="text-amber-800 font-bold bg-amber-50 p-4 rounded-xl border border-amber-200 text-center text-lg">
          Quelle fraction du budget représente l'inscription au tournoi ?
        </p>
      </section>

      {/* Étape 1 */}
      <section className={`bg-white rounded-3xl border shadow-sm p-6 mb-6 transition-all ${step >= 1 ? 'border-amber-200' : 'opacity-50 pointer-events-none'}`}>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
          Quelle opération permet de calculer la fraction totale dépensée pour le matériel ?
        </h3>
        
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          {[
            { id: 'a', math: '$\\frac{1}{3} \\times \\frac{1}{4}$' },
            { id: 'b', math: '$\\frac{1}{3} + \\frac{1}{4}$', correct: true },
            { id: 'c', math: '$\\frac{1}{3} - \\frac{1}{4}$' }
          ].map(choice => (
            <button
              key={choice.id}
              disabled={selectedA === 'b'}
              onClick={() => setSelectedA(choice.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedA === choice.id 
                  ? choice.correct 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                    : 'border-rose-500 bg-rose-50 text-rose-900'
                  : 'border-slate-200 hover:border-amber-300'
              }`}
            >
              <MathText>{choice.math}</MathText>
            </button>
          ))}
        </div>

        {selectedA && selectedA !== 'b' && (
          <p className="text-sm text-rose-600 flex items-center gap-2">
            <XCircle size={16} /> Faux. Pour trouver le total, il faut additionner les deux dépenses.
          </p>
        )}
        
        {selectedA === 'b' && (
          <div className="text-sm text-emerald-700 flex items-center justify-between">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Exact ! On additionne les parts.</span>
            {step === 1 && (
              <button 
                onClick={() => { setStep(2); awardXP({ moduleId: 'L06', exerciseId: 'L06-1', amount: 50 }); }}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-600 flex items-center gap-1"
              >
                Continuer <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Étape 2 */}
      {step >= 2 && (
        <section className={`bg-white rounded-3xl border shadow-sm p-6 mb-6 transition-all animate-in slide-in-from-top-4 ${step >= 2 ? 'border-amber-200' : 'opacity-50'}`}>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
            Calculez cette somme : <MathText>{'$\\frac{1}{3} + \\frac{1}{4}$'}</MathText>
          </h3>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              { id: 'a', math: '$\\frac{2}{7}$' },
              { id: 'b', math: '$\\frac{7}{12}$', correct: true },
              { id: 'c', math: '$\\frac{1}{12}$' }
            ].map(choice => (
              <button
                key={choice.id}
                disabled={selectedB === 'b'}
                onClick={() => setSelectedB(choice.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedB === choice.id 
                    ? choice.correct 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                      : 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <MathText>{choice.math}</MathText>
              </button>
            ))}
          </div>

          {selectedB === 'a' && (
            <p className="text-sm text-rose-600 flex items-center gap-2">
              <XCircle size={16} /> On n'additionne JAMAIS les dénominateurs ! Mettez sur 12.
            </p>
          )}
          
          {selectedB === 'b' && (
            <div className="text-sm text-emerald-700 flex flex-col gap-4">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Parfait ! <MathText>{'$\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$'}</MathText>. Le club a donc dépensé les 7/12 de son budget pour le matériel.</span>
              {step === 2 && (
                <button 
                  onClick={() => { setStep(3); awardXP({ moduleId: 'L06', exerciseId: 'L06-2', amount: 50 }); }}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-600 self-end flex items-center gap-1"
                >
                  Dernière étape <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Étape 3 */}
      {step >= 3 && (
        <section className={`bg-white rounded-3xl border shadow-sm p-6 mb-6 transition-all animate-in slide-in-from-top-4 ${step >= 3 ? 'border-amber-200' : 'opacity-50'}`}>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span> 
            Comment calculer la fraction restante pour le tournoi ?
          </h3>
          <p className="text-sm text-slate-600 mb-4">Le budget TOTAL correspond à l'unité complète, c'est-à-dire le nombre <MathText>$1$</MathText> (ou <MathText>{'$\\frac{12}{12}$'}</MathText>).</p>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {[
              { id: 'a', math: '$\\frac{7}{12} - 1 = -\\frac{5}{12}$' },
              { id: 'b', math: '$1 - \\frac{7}{12} = \\frac{5}{12}$', correct: true }
            ].map(choice => (
              <button
                key={choice.id}
                disabled={selectedC === 'b'}
                onClick={() => setSelectedC(choice.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedC === choice.id 
                    ? choice.correct 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                      : 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <MathText>{choice.math}</MathText>
              </button>
            ))}
          </div>
          
          {selectedC === 'b' && (
            <div className="text-sm text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200 font-bold flex items-center gap-2 mt-4">
              <CheckCircle2 size={24} /> Mission accomplie ! L'inscription au tournoi représente les 5/12 du budget. (+50 XP)
            </div>
          )}
        </section>
      )}

      {/* Résumé de mission */}
      {selectedC === 'b' && (
        <KeyTakeaway color="amber">
          <li>
            • Pour modéliser une part, on utilise une fraction.
          </li>
          <li>
            • Pour modéliser le "tout" (le total complet), on utilise le nombre <strong>1</strong>.
          </li>
          <li>
            • Pour trouver un reste, on calcule : <MathText>{'$1 - (somme\\ des\\ parts)$'}</MathText>.
          </li>
        </KeyTakeaway>
      )}
    </ModuleLayout>
  );
}
