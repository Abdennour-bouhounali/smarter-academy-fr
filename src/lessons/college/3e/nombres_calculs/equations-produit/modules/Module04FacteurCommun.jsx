import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { MousePointerClick, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function Module04FacteurCommun() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(4);

  const [step, setStep] = useState(0); 
  // 0: Initial expression
  // 1: Expanded x*x + x*5
  // 2: Factor selected
  // 3: Factor extracted
  // 4: Developed (verification)
  
  const [showErrorBox, setShowErrorBox] = useState(false);

  const handleNext = () => markModuleCompleted('L04');

  const handleExpand = () => {
    setStep(1);
    awardXP({ moduleId: 'L04', exerciseId: 'expand', amount: 10 });
  };

  const handleSelectFactor = () => {
    setStep(2);
    awardXP({ moduleId: 'L04', exerciseId: 'select', amount: 20 });
  };

  const handleExtract = () => {
    setStep(3);
    awardXP({ moduleId: 'L04', exerciseId: 'extract', amount: 30 });
    setTimeout(() => {
      setShowErrorBox(true);
    }, 1500);
  };

  const handleDevelop = () => {
    setStep(4);
    awardXP({ moduleId: 'L04', exerciseId: 'develop', amount: 20 });
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
      moduleTitle="Le Facteur Commun"
      moduleSubtitle="Comment résoudre quand l'équation n'est pas (encore) un produit ?"
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Créer un produit" color="sky" />

        <p className="text-slate-700 leading-relaxed mb-4">
          Vous savez résoudre <span className="font-mono bg-slate-100 px-1 rounded"><MathText>{'$A \\times B = 0$'}</MathText></span>. 
          Mais que faire face à <span className="font-mono bg-rose-100 px-1 rounded text-rose-800"><MathText>{'$x^2 + 5x = 0$'}</MathText></span> ?
          Ici, il y a une addition ! Il faut la transformer en multiplication : c'est la <strong>factorisation</strong>.
        </p>

        <div className="bg-slate-50 p-6 md:p-10 rounded-2xl border border-slate-200">
          
          <div className="flex flex-col items-center">
            
            {/* Step 0 */}
            <div className={`text-4xl font-mono font-bold transition-all duration-500 ${step === 0 ? 'text-slate-800 scale-110' : 'text-slate-400 opacity-50'}`}>
              <MathText>{'$x^2 + 5x$'}</MathText>
            </div>
            
            {step === 0 && (
              <button 
                onClick={handleExpand}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-all animate-in zoom-in"
              >
                Décomposer les termes
              </button>
            )}

            {/* Step 1 & 2 */}
            {step >= 1 && step < 3 && (
              <div className="mt-8 animate-in slide-in-from-top-4 flex flex-col items-center">
                <div className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Quel élément apparaît dans les deux termes ?</div>
                
                <div className="text-4xl font-mono font-bold flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border-2 border-slate-200 shadow-sm">
                    <span 
                      onClick={step === 1 ? handleSelectFactor : undefined}
                      className={`cursor-pointer transition-all px-2 rounded-lg ${step >= 2 ? 'bg-sky-100 text-sky-600 ring-2 ring-sky-400' : 'text-slate-800 hover:bg-slate-100'}`}
                    >
                      <MathText>{'$x$'}</MathText>
                    </span>
                    <span className="text-slate-400"><MathText>{'$\\times$'}</MathText></span>
                    <span className="text-slate-800"><MathText>{'$x$'}</MathText></span>
                  </div>
                  
                  <span className="text-slate-400"><MathText>{'$+$'}</MathText></span>
                  
                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border-2 border-slate-200 shadow-sm">
                    <span 
                      onClick={step === 1 ? handleSelectFactor : undefined}
                      className={`cursor-pointer transition-all px-2 rounded-lg ${step >= 2 ? 'bg-sky-100 text-sky-600 ring-2 ring-sky-400' : 'text-slate-800 hover:bg-slate-100'}`}
                    >
                      <MathText>{'$x$'}</MathText>
                    </span>
                    <span className="text-slate-400"><MathText>{'$\\times$'}</MathText></span>
                    <span className="text-slate-800"><MathText>{'$5$'}</MathText></span>
                  </div>
                </div>

                {step === 1 && (
                  <div className="mt-4 text-sky-600 font-bold flex items-center gap-2 animate-pulse">
                    <MousePointerClick size={18} /> Cliquez sur le "<MathText>{'$x$'}</MathText>" commun
                  </div>
                )}
                
                {step === 2 && (
                  <button 
                    onClick={handleExtract}
                    className="mt-8 flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-all animate-in zoom-in"
                  >
                    Extraire ce facteur commun
                  </button>
                )}
              </div>
            )}

            {/* Step 3 & 4 */}
            {step >= 3 && (
              <div className="mt-8 animate-in slide-in-from-top-8 flex flex-col items-center">
                <div className="text-sm font-bold text-sky-600 mb-4 uppercase tracking-wider">Expression factorisée !</div>
                
                <div className="text-5xl font-mono font-black flex items-center gap-2">
                  <span className="text-sky-600 bg-sky-100 px-3 py-1 rounded-xl"><MathText>{'$x$'}</MathText></span>
                  <span className="text-slate-800"><MathText>{'$(x + 5)$'}</MathText></span>
                </div>
                
                {step === 3 && (
                  <button 
                    onClick={handleDevelop}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-all animate-in fade-in"
                  >
                    <ArrowRightLeft size={16} /> Développer pour vérifier
                  </button>
                )}
                
                {step === 4 && (
                  <div className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-sm flex items-center gap-2 animate-in zoom-in">
                    <CheckCircle2 size={16} /> <MathText>{'$x \\times x + x \\times 5 = x^2 + 5x$'}</MathText> <span className="ml-1">(C'est bon !)</span>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </section>

      {showErrorBox && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-8">
          <SectionHeader number={2} title="Résolution de l'équation" color="emerald" />
          
          <p className="text-slate-700 mb-4">
            Maintenant que l'équation <span className="font-mono text-slate-500"><MathText>{'$x^2 + 5x = 0$'}</MathText></span> est transformée en un produit <span className="font-mono bg-emerald-50 text-emerald-800 px-1 rounded font-bold"><MathText>{'$x(x + 5) = 0$'}</MathText></span>, on peut utiliser la règle du zéro !
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
               <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wide text-sm">Le Facteur n°1</h4>
               <div className="text-3xl font-mono font-bold text-emerald-700 mb-2"><MathText>{'$x = 0$'}</MathText></div>
            </div>
            
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
               <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wide text-sm">Le Facteur n°2</h4>
               <div className="text-xl font-mono font-bold text-emerald-600 mb-2"><MathText>{'$x + 5 = 0$'}</MathText></div>
               <div className="text-3xl font-mono font-bold text-emerald-700"><MathText>{'$x = -5$'}</MathText></div>
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mt-6">
            <h4 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span> L'erreur classique
            </h4>
            <div className="flex flex-col md:flex-row items-center gap-4 text-slate-700">
              <div className="flex-1">
                Certains élèves factorisent mal et écrivent <span className="font-mono text-rose-600 font-bold"><MathText>{'$x(x + 5) = x^2 + 5$'}</MathText></span>. 
                <br/>C'est <strong>FAUX</strong> car le "<MathText>{'$x$'}</MathText>" se distribue sur le "<MathText>{'$x$'}</MathText>" ET sur le "<MathText>{'$5$'}</MathText>". <br/>
                Prenez l'habitude de toujours redévelopper mentalement votre factorisation.
              </div>
              <div className="font-mono text-lg bg-white p-4 rounded-xl border border-rose-200 text-center">
                <MathText>{'$\\color{#2563eb}{x}(\\color{#059669}{x} + \\color{#059669}{5})$'}</MathText> <br/>
                = <MathText>{'$\\color{#2563eb}{x} \\times \\color{#059669}{x} + \\color{#2563eb}{x} \\times \\color{#059669}{5}$'}</MathText>
              </div>
            </div>
          </div>
        </section>
      )}

    </ModuleLayout>
  );
}
