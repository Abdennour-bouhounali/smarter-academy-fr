import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { AlertCircle, Target, XCircle } from 'lucide-react';

export default function Module05Priorites() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(5);

  const handleNext = () => markModuleCompleted('L05');

  const [step, setStep] = useState(0);

  const steps = [
    {
      calc: '$\\frac{3}{4} + \\frac{1}{4} \\times \\frac{2}{3}$',
      desc: "Calcul de départ. Par où commencer ?",
      action: "La multiplication est prioritaire !"
    },
    {
      calc: '$\\frac{3}{4} + \\left(\\frac{1 \\times 2}{4 \\times 3}\\right)$',
      desc: "On effectue d'abord la multiplication.",
      action: "On simplifie avant de calculer (2 en haut et 4=2x2 en bas)."
    },
    {
      calc: '$\\frac{3}{4} + \\frac{1}{6}$',
      desc: "On a maintenant une addition.",
      action: "On cherche le dénominateur commun entre 4 et 6 (c'est 12)."
    },
    {
      calc: '$\\frac{3 \\times 3}{4 \\times 3} + \\frac{1 \\times 2}{6 \\times 2}$',
      desc: "On met au même dénominateur.",
      action: "On calcule les numérateurs."
    },
    {
      calc: '$\\frac{9}{12} + \\frac{2}{12}$',
      desc: "Les fractions ont le même dénominateur.",
      action: "On additionne les numérateurs."
    },
    {
      calc: '$\\frac{11}{12}$',
      desc: "Résultat final ! La fraction est irréductible.",
      action: "Terminé !"
    }
  ];

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Priorités opératoires"
      moduleSubtitle="Savoir dans quel ordre effectuer les calculs quand tout se mélange."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Ordre des calculs */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Qui est prioritaire ?" color="rose" />

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-slate-700 leading-relaxed mb-6">
            Les règles de priorité ne changent pas avec les fractions. Il faut toujours respecter cet ordre :
          </p>

          <ol className="list-decimal pl-6 space-y-3 font-medium text-slate-800 bg-white p-6 rounded-xl border border-slate-200">
            <li className="marker:text-rose-500">
              Les calculs entre <strong>parenthèses</strong>.
            </li>
            <li className="marker:text-rose-500">
              Les <strong>multiplications</strong> et <strong>divisions</strong> (de la gauche vers la droite).
            </li>
            <li className="marker:text-rose-500">
              Les <strong>additions</strong> et <strong>soustractions</strong> (de la gauche vers la droite).
            </li>
          </ol>
        </div>
      </section>

      {/* Section 2 : Pas à pas */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Le calcul étape par étape" color="indigo" />

        <p className="text-slate-700 leading-relaxed mb-6">
          Découvrez la résolution d'une expression complexe étape par étape.
        </p>

        <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl max-w-xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[160px] bg-white rounded-xl shadow-sm border border-indigo-200 p-6 mb-6 transition-all">
            <div className="text-2xl font-bold text-slate-800 mb-4">
              <MathText>{steps[step].calc}</MathText>
            </div>
            <p className="text-indigo-800 text-sm font-medium text-center">{steps[step].desc}</p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${step === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}
            >
              Précédent
            </button>
            <div className="text-xs font-bold text-indigo-400">
              Étape {step + 1} / {steps.length}
            </div>
            <button
              onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
              disabled={step === steps.length - 1}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${step === steps.length - 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              Suivant
            </button>
          </div>
          
          {step < steps.length - 1 && (
             <p className="text-xs text-center text-slate-500 mt-4 italic">Prochaine action : {steps[step].action}</p>
          )}
        </div>

        {/* Erreur fréquente */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mt-6">
          <p className="font-bold text-rose-900 mb-2 flex items-center gap-2 text-lg">
            <XCircle size={24} /> L'erreur de lecture
          </p>
          <p className="text-sm text-rose-800 mb-4">
            Notre cerveau aime lire de gauche à droite, et il est très tentant de faire l'addition en premier... C'est <strong>faux</strong> ! La multiplication reste prioritaire.
          </p>
          <div className="bg-white p-4 rounded-xl border border-rose-100 flex flex-col md:flex-row items-center gap-6 justify-center shadow-sm">
             <div className="text-center relative">
               <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-rose-200 text-rose-900 font-bold px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-sm">INTERDIT</span>
               <div className="text-rose-600 font-bold text-lg mt-4 bg-rose-50 p-3 rounded-lg border border-rose-100">
                 <MathText>{'$\\frac{3}{4} + \\frac{1}{4} \\times \\frac{2}{3} \\neq \\frac{4}{4} \\times \\frac{2}{3}$'}</MathText>
               </div>
             </div>
             
             <div className="text-slate-300 font-bold text-2xl hidden md:block">VS</div>
             
             <div className="text-center relative">
               <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-200 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-sm">CORRECT</span>
               <div className="text-emerald-700 font-bold text-lg mt-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                 <MathText>{'$\\frac{3}{4} + \\left( \\frac{1}{4} \\times \\frac{2}{3} \\right)$'}</MathText>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="À vous de jouer !" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Quelle opération effectuez-vous en premier dans le calcul : <br/>
              <span className="text-lg font-bold block text-center my-4"><MathText>{'$\\frac{5}{2} - \\frac{1}{2} \\div \\left( \\frac{3}{4} + \\frac{1}{4} \\right)$'}</MathText></span>
            </p>
          }
          choices={[
            { label: "La soustraction (à gauche)", correct: false },
            { label: "La division (prioritaire sur la soustraction)", correct: false },
            { label: "L'addition (car elle est entre parenthèses)", correct: true },
          ]}
          successFeedback={
            <>
              <strong>Bravo !</strong> Les parenthèses sont les reines absolues des mathématiques. Elles gagnent toujours. (+75 XP)
            </>
          }
          errorFeedback={
            <>
              Souvenez-vous de la liste des priorités (Parenthèses, puis Multiplications/Divisions, puis Additions/Soustractions).
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L05', exerciseId: 'L05-Q1', amount: 75 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="rose">
        <li>
          • Ne calculez jamais de gauche à droite machinalement avec des fractions.
        </li>
        <li>
          • Repérez toujours la <strong>multiplication</strong> ou la <strong>division</strong> et faites-les avant les additions/soustractions, sauf s'il y a des <strong>parenthèses</strong>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
