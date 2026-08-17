import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import clsx from 'clsx';

export default function Module04Reciproque() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(4);

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleNext = () => markModuleCompleted('L04');

  const steps = [
    {
      title: "1. Les conditions initiales",
      prompt: "Où se trouvent les points et comment sont-ils alignés ?",
      options: [
        { text: "Les points A, M, B et A, N, C sont alignés et dans le même ordre.", isCorrect: true },
        { text: "Les droites (MN) et (BC) sont parallèles.", isCorrect: false, error: "Non ! C'est ce qu'on cherche à prouver, on ne le sait pas encore." },
      ]
    },
    {
      title: "2. Calculer le premier rapport",
      prompt: "Quel est le premier rapport à calculer (séparément) ?",
      options: [
        { text: "AM / AB", isCorrect: true },
        { text: "AM / MB", isCorrect: false, error: "Attention, on compare toujours un côté du petit triangle avec un côté du grand triangle. MB n'est pas un côté complet du grand triangle !" },
      ]
    },
    {
      title: "3. Calculer le deuxième rapport",
      prompt: "Quel est le deuxième rapport à calculer (séparément) ?",
      options: [
        { text: "AN / AC", isCorrect: true },
        { text: "BC / MN", isCorrect: false, error: "Attention, pour appliquer la réciproque de Thalès, on ne calcule QUE les rapports des côtés alignés, pas les bases !" },
      ]
    },
    {
      title: "4. Comparer et conclure",
      prompt: "On trouve que AM/AB = 0.5 et AN/AC = 0.5. Que concluez-vous ?",
      options: [
        { text: "D'après la réciproque du théorème de Thalès, les droites sont parallèles.", isCorrect: true },
        { text: "D'après la contraposée du théorème de Thalès, les droites ne sont pas parallèles.", isCorrect: false, error: "Non, la contraposée c'est quand les rapports sont DIFFÉRENTS." },
      ]
    }
  ];

  const handleOptionClick = (option) => {
    setErrorMsg(null); // Clear previous error
    if (option.isCorrect) {
      if (step === steps.length - 1) {
        setStep(s => s + 1); // Move step past the array bounds to grey it out
        if (!completed) {
          setCompleted(true);
          awardXP({ moduleId: 'L04', exerciseId: 'decision-machine', amount: 75 });
        }
      } else {
        setStep(s => s + 1);
      }
    } else {
      setErrorMsg(option.error);
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
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="La Réciproque et la Contraposée"
      moduleSubtitle="Prouvez si deux droites sont parallèles à l'aide de la Machine de Décision."
      estimatedTime="12 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La Machine de Décision" color="purple" />

        <p className="text-slate-700 leading-relaxed mb-6">
          Au Brevet, la rédaction est primordiale ! Construisez votre démonstration pas à pas pour prouver si des droites sont parallèles.
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6">
          
          {/* Construction Area */}
          <div className="flex-1 space-y-4 relative">
             <div className="absolute left-6 top-6 bottom-6 w-1 bg-purple-100 rounded-full z-0" />
             
             {steps.map((s, idx) => (
               <div key={idx} className={clsx("relative z-10 p-4 rounded-xl border transition-all duration-300", 
                 idx < step ? "bg-purple-50 border-purple-200 opacity-70" :
                 idx === step ? "bg-white border-purple-400 shadow-md transform scale-105" :
                 "bg-slate-100 border-slate-200 opacity-40 blur-[1px]"
               )}>
                 <h3 className={clsx("font-bold mb-2", idx === step ? "text-purple-700" : "text-slate-600")}>{s.title}</h3>
                 
                 {idx < step && (
                   <p className="text-sm font-medium text-slate-700">✓ {s.options.find(o => o.isCorrect).text}</p>
                 )}
                 
                 {idx === step && (
                   <div className="space-y-3">
                     <p className="text-sm text-slate-700 mb-3">{s.prompt}</p>
                     {s.options.map((opt, i) => (
                       <button
                         key={i}
                         onClick={() => handleOptionClick(opt)}
                         className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm transition-colors text-slate-800"
                       >
                         {opt.text}
                       </button>
                     ))}
                     {errorMsg && (
                       <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg font-medium animate-pulse">
                         ❌ {errorMsg}
                       </div>
                     )}
                   </div>
                 )}
                 
               </div>
             ))}
             
             {completed && (
               <div className="relative z-10 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center shadow-sm">
                 <h3 className="font-bold text-emerald-800 mb-2">Démonstration Validée ! 🎉 (+75 XP)</h3>
                 <p className="text-sm text-emerald-700">Votre rédaction est parfaite pour le Brevet.</p>
               </div>
             )}
          </div>
          
          {/* Visualization / Paper preview */}
          <div className="flex-1 hidden md:block">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full font-mono text-sm leading-relaxed text-slate-700">
              <h4 className="font-bold text-slate-800 font-sans mb-4 border-b pb-2">Copie de l'élève</h4>
              
              <div className={step > 0 ? "opacity-100 transition-opacity" : "opacity-0"}>
                On sait que les points A, M, B et A, N, C sont alignés et dans le même ordre.<br/><br/>
              </div>
              <div className={step > 1 ? "opacity-100 transition-opacity" : "opacity-0"}>
                D'une part : AM / AB = 5 / 10 = 0.5<br/>
              </div>
              <div className={step > 2 ? "opacity-100 transition-opacity" : "opacity-0"}>
                D'autre part : AN / AC = 4 / 8 = 0.5<br/><br/>
              </div>
              <div className={step > 3 ? "opacity-100 transition-opacity" : "opacity-0"}>
                On constate que AM / AB = AN / AC.<br/>
                D'après la <strong>réciproque du théorème de Thalès</strong>, les droites (MN) et (BC) sont parallèles.
              </div>
            </div>
          </div>
        </div>
      </section>

      <KeyTakeaway color="purple">
        <li>
          • La <strong>Réciproque</strong> sert à prouver que des droites SONT parallèles (les rapports sont égaux).
        </li>
        <li>
          • La <strong>Contraposée</strong> sert à prouver que des droites NE SONT PAS parallèles (les rapports sont différents).
        </li>
        <li>
          • Attention ! On doit toujours calculer les rapports <strong>séparément</strong> au début de la rédaction !
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
