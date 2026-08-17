import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InteractiveThales from '../components/InteractiveThales';

export default function Module02Egalite() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(2);

  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleNext = () => markModuleCompleted('L02');

  const correctSequence = [
    { target: 'smallLeft', label: 'Côté gauche du petit triangle (AM)' },
    { target: 'largeLeft', label: 'Côté gauche du grand triangle (AB)' },
    { target: 'smallRight', label: 'Côté droit du petit triangle (AN)' },
    { target: 'largeRight', label: 'Côté droit du grand triangle (AC)' },
    { target: 'smallBase', label: 'Base du petit triangle (MN)' },
    { target: 'largeBase', label: 'Base du grand triangle (BC)' },
  ];

  const handleSelectSide = (sideId) => {
    if (success) return;
    
    if (sideId === correctSequence[step].target) {
      setErrorMsg("");
      if (step + 1 === correctSequence.length) {
        setSuccess(true);
        setStep(step + 1);
        awardXP({ moduleId: 'L02', exerciseId: 'build-ratio', amount: 50 });
      } else {
        setStep(step + 1);
      }
    } else {
      setErrorMsg(`Erreur : On attendait "${correctSequence[step].label}". Repartez depuis le sommet principal A.`);
      setStep(0);
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
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Écrire l'égalité de Thalès"
      moduleSubtitle="Construisez les 3 rapports égaux en sélectionnant les bons côtés."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="L'Égalité des 3 Rapports" color="indigo" />

        <p className="text-slate-700 leading-relaxed mb-6">
          Puisque les deux droites (MN) et (BC) sont parallèles, les longueurs du petit triangle AMN sont proportionnelles aux longueurs du grand triangle ABC.
        </p>

        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center">
          <h3 className="font-bold text-indigo-800 mb-4 text-center">
            Cliquez sur les côtés dans le bon ordre pour construire l'égalité !<br/>
            <span className="text-sm font-normal text-indigo-600">Prochaine cible : <strong>{success ? "Terminé !" : correctSequence[step].label}</strong></span>
          </h3>
          
          {/* Simulated interactive figure for side selection */}
          <div className="relative w-[300px] h-[250px] bg-white rounded-xl shadow-sm border border-indigo-200 p-4 mb-6">
             <svg viewBox="0 0 300 250" className="w-full h-full">
               {/* Large Triangle ABC */}
               <polygon points="150,30 50,220 250,220" className="fill-slate-50 stroke-slate-300 stroke-2" />
               <polygon points="150,30 100,125 200,125" className="fill-slate-100 stroke-slate-400 stroke-2" />
               
               {/* Clickable sides */}
               {/* AM - smallLeft */}
               <line x1="150" y1="30" x2="100" y2="125" className={`stroke-[12px] cursor-pointer transition-colors ${step > 0 ? 'stroke-blue-500' : 'stroke-transparent hover:stroke-blue-200'}`} onClick={() => handleSelectSide('smallLeft')} />
               <line x1="150" y1="30" x2="100" y2="125" className="stroke-blue-600 stroke-2 pointer-events-none" />
               
               {/* AB - largeLeft */}
               <line x1="100" y1="125" x2="50" y2="220" className={`stroke-[12px] cursor-pointer transition-colors ${step > 1 ? 'stroke-blue-500' : 'stroke-transparent hover:stroke-blue-200'}`} onClick={() => handleSelectSide('largeLeft')} />
               <line x1="100" y1="125" x2="50" y2="220" className="stroke-blue-600 stroke-2 pointer-events-none" />

               {/* AN - smallRight */}
               <line x1="150" y1="30" x2="200" y2="125" className={`stroke-[12px] cursor-pointer transition-colors ${step > 2 ? 'stroke-emerald-500' : 'stroke-transparent hover:stroke-emerald-200'}`} onClick={() => handleSelectSide('smallRight')} />
               <line x1="150" y1="30" x2="200" y2="125" className="stroke-emerald-600 stroke-2 pointer-events-none" />
               
               {/* AC - largeRight */}
               <line x1="200" y1="125" x2="250" y2="220" className={`stroke-[12px] cursor-pointer transition-colors ${step > 3 ? 'stroke-emerald-500' : 'stroke-transparent hover:stroke-emerald-200'}`} onClick={() => handleSelectSide('largeRight')} />
               <line x1="200" y1="125" x2="250" y2="220" className="stroke-emerald-600 stroke-2 pointer-events-none" />
               
               {/* MN - smallBase */}
               <line x1="100" y1="125" x2="200" y2="125" className={`stroke-[12px] cursor-pointer transition-colors ${step > 4 ? 'stroke-rose-500' : 'stroke-transparent hover:stroke-rose-200'}`} onClick={() => handleSelectSide('smallBase')} />
               <line x1="100" y1="125" x2="200" y2="125" className="stroke-rose-600 stroke-2 pointer-events-none" />
               
               {/* BC - largeBase */}
               <line x1="50" y1="220" x2="250" y2="220" className={`stroke-[12px] cursor-pointer transition-colors ${step > 5 ? 'stroke-rose-500' : 'stroke-transparent hover:stroke-rose-200'}`} onClick={() => handleSelectSide('largeBase')} />
               <line x1="50" y1="220" x2="250" y2="220" className="stroke-rose-600 stroke-2 pointer-events-none" />

               {/* Labels */}
               <text x="150" y="20" className="font-bold text-sm" textAnchor="middle">A</text>
               <text x="35" y="235" className="font-bold text-sm" textAnchor="middle">B</text>
               <text x="265" y="235" className="font-bold text-sm" textAnchor="middle">C</text>
               <text x="85" y="125" className="font-bold text-sm" textAnchor="middle">M</text>
               <text x="215" y="125" className="font-bold text-sm" textAnchor="middle">N</text>
             </svg>
          </div>

          {/* Equation Builder */}
          <div className="flex items-center gap-4 text-xl font-bold font-mono bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center">
              <span className={`text-blue-600 h-8 ${step > 0 ? '' : 'text-slate-200'}`}>AM</span>
              <div className="w-10 h-0.5 bg-slate-800 my-1"></div>
              <span className={`text-blue-800 h-8 ${step > 1 ? '' : 'text-slate-200'}`}>AB</span>
            </div>
            <span>=</span>
            <div className="flex flex-col items-center">
              <span className={`text-emerald-600 h-8 ${step > 2 ? '' : 'text-slate-200'}`}>AN</span>
              <div className="w-10 h-0.5 bg-slate-800 my-1"></div>
              <span className={`text-emerald-800 h-8 ${step > 3 ? '' : 'text-slate-200'}`}>AC</span>
            </div>
            <span>=</span>
            <div className="flex flex-col items-center">
              <span className={`text-rose-600 h-8 ${step > 4 ? '' : 'text-slate-200'}`}>MN</span>
              <div className="w-10 h-0.5 bg-slate-800 my-1"></div>
              <span className={`text-rose-800 h-8 ${step > 5 ? '' : 'text-slate-200'}`}>BC</span>
            </div>
          </div>
          
          {errorMsg && (
            <div className="mt-4 text-sm text-red-600 font-bold bg-red-50 p-2 rounded-lg">{errorMsg}</div>
          )}

          {success && (
            <div className="mt-4 text-sm text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200 animate-bounce">
              🎉 Parfait ! L'égalité est complète. (+50 XP)
            </div>
          )}
        </div>
      </section>

      <KeyTakeaway color="indigo">
        <ul className="space-y-4 text-lg">
          <li>
            <strong className="text-indigo-800">1. Trois fractions égales :</strong> L'égalité comporte toujours 3 rapports (fractions) qui respectent la même logique :
            <div className="mt-3 flex justify-center text-xl text-indigo-700 bg-white/50 p-4 rounded-xl border border-indigo-100">
              <MathText>{`$\\frac{\\text{Côté du petit triangle}}{\\text{Côté correspondant du grand triangle}}$`}</MathText>
            </div>
          </li>
          <li>
            <strong className="text-indigo-800">2. Le point de départ :</strong> Pour les deux premières fractions, on part <strong className="underline decoration-indigo-300 decoration-2">toujours du sommet commun</strong> (ici <strong>A</strong>) !
            <div className="mt-3 flex justify-center text-lg">
               <span className="font-mono bg-white px-3 py-2 rounded-lg shadow-sm text-indigo-800 border border-indigo-100">
                 <strong className="text-indigo-600">A</strong>M / <strong className="text-indigo-600">A</strong>B = <strong className="text-indigo-600">A</strong>N / <strong className="text-indigo-600">A</strong>C
               </span>
            </div>
          </li>
        </ul>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
