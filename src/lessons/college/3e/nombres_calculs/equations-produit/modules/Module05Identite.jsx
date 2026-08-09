import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, ChevronRight, XCircle, Grid, ArrowRightLeft } from 'lucide-react';

export default function Module05Identite() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(5);

  const [step, setStep] = useState(0); 
  // 0: SVG visualization
  // 1: Recognition quiz
  // 2: Construction
  // 3: Resolution
  
  const handleNext = () => markModuleCompleted('L05');

  // Recognition Quiz
  const [selectedEx, setSelectedEx] = useState({});
  const recognitionOptions = [
    { id: '1', eq: 'x² - 16', isDiff: true },
    { id: '2', eq: 'x² + 16', isDiff: false },
    { id: '3', eq: 'x² - 25', isDiff: true },
    { id: '4', eq: 'x² - 9', isDiff: true }
  ];
  
  const handleSelectEx = (id, isDiff) => {
    setSelectedEx(prev => ({...prev, [id]: true}));
    awardXP({ moduleId: 'L05', exerciseId: `rec_${id}`, amount: 10 });
    
    // Check if all correct ones are found (1, 3, 4) and wrong (2) is not selected? 
    // Actually, let's just make it a "click to flip" reveal.
  };

  const allFound = selectedEx['1'] && selectedEx['3'] && selectedEx['4'];

  // Construction
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [constructionValid, setConstructionValid] = useState(false);

  const checkConstruction = () => {
    if ((val1 === '4' && val2 === '4') || (val1 === '-4' && val2 === '-4')) { // val1 is after minus, val2 is after plus
      setConstructionValid(true);
      awardXP({ moduleId: 'L05', exerciseId: 'construct', amount: 30 });
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
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="La différence de carrés"
      moduleSubtitle="Transformez une soustraction de carrés en produit pour résoudre l'équation."
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Le puzzle géométrique" color="violet" />

        <p className="text-slate-700 leading-relaxed">
          Pour résoudre <span className="font-mono bg-slate-100 px-1 rounded"><MathText>{'$x^2 - 16 = 0$'}</MathText></span>, il n'y a pas de facteur commun évident. 
          Mais c'est une <strong>différence de deux carrés</strong> : <span className="font-mono bg-slate-100 px-1 rounded"><MathText>{'$a^2 - b^2$'}</MathText></span>.
        </p>

        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 flex flex-col items-center">
          
          <div className="flex flex-col md:flex-row items-center gap-12 mb-8 w-full max-w-2xl justify-center">
            {/* Visual a^2 - b^2 */}
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 bg-violet-200 border-2 border-violet-500 rounded flex items-center justify-center">
                 <span className="text-violet-700 font-bold font-mono"><MathText>{'$x^2$'}</MathText></span>
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-white border-2 border-dashed border-rose-400 flex items-center justify-center">
                 <span className="text-rose-500 font-bold font-mono"><MathText>{'$- 4^2$'}</MathText></span>
              </div>
            </div>

            <div className="text-4xl text-slate-300">
              <ArrowRightLeft />
            </div>

            {/* Visual (a-b)(a+b) - simplified representation */}
            <div className="w-56 h-24 bg-violet-100 border-2 border-violet-400 rounded flex items-center justify-center">
               <span className="text-violet-800 font-bold font-mono text-lg"><MathText>{'$(x - 4)(x + 4)$'}</MathText></span>
            </div>
          </div>

          <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <MathText className="text-xl text-slate-800">{'$a^2 - b^2 = (a - b)(a + b)$'}</MathText>
          </div>

          {step === 0 && (
            <button 
              onClick={() => { setStep(1); awardXP({ moduleId: 'L05', exerciseId: 'intro', amount: 10 }); }}
              className="mt-8 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all"
            >
              J'ai compris, passons au test
            </button>
          )}

        </div>
      </section>

      {step >= 1 && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4">
          <SectionHeader number={2} title="Reconnaître le motif" color="emerald" />
          
          <p className="text-slate-700 mb-6">
            Cliquez sur les expressions qui sont des différences de carrés et qui peuvent être factorisées.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {recognitionOptions.map(opt => {
              const isSelected = selectedEx[opt.id];
              let btnClass = "p-4 rounded-xl border-2 font-mono text-xl font-bold transition-all ";
              
              if (!isSelected) {
                btnClass += "bg-slate-50 border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50 cursor-pointer";
              } else {
                if (opt.isDiff) {
                  btnClass += "bg-emerald-100 border-emerald-400 text-emerald-800";
                } else {
                  btnClass += "bg-rose-100 border-rose-400 text-rose-800";
                }
              }

              return (
                <button 
                  key={opt.id}
                  disabled={isSelected}
                  onClick={() => handleSelectEx(opt.id, opt.isDiff)}
                  className={btnClass}
                >
                  <MathText>{`$${opt.eq}$`}</MathText>
                  {isSelected && opt.isDiff && <CheckCircle2 className="inline-block ml-2 text-emerald-600" size={20} />}
                  {isSelected && !opt.isDiff && <XCircle className="inline-block ml-2 text-rose-600" size={20} />}
                </button>
              );
            })}
          </div>

          {selectedEx['2'] && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 mt-4 text-rose-800 text-sm animate-in zoom-in">
              <strong>Attention :</strong> <MathText>{'$x^2 + 16$'}</MathText> est une somme, pas une différence ! On ne peut pas la factoriser avec cette méthode. L'équation <MathText>{'$x^2 + 16 = 0$'}</MathText> n'a d'ailleurs aucune solution.
            </div>
          )}

          {allFound && step === 1 && (
            <div className="flex justify-center mt-6 animate-in fade-in">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                Continuer <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      )}

      {step >= 2 && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4">
          <SectionHeader number={3} title="Factoriser et résoudre" color="blue" />
          
          <p className="text-slate-700">
            Complétez la factorisation pour l'équation <span className="font-mono font-bold"><MathText>{'$x^2 - 16 = 0$'}</MathText></span> :
          </p>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-mono font-bold text-slate-800 mb-8 flex items-center justify-center gap-2 flex-wrap">
              <span>( x -</span>
              <input 
                type="number" 
                value={val1} 
                onChange={e => setVal1(e.target.value)} 
                disabled={constructionValid}
                className={`w-16 p-2 text-center rounded-lg border-2 ${constructionValid ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-300'}`}
              />
              <span>) ( x +</span>
              <input 
                type="number" 
                value={val2} 
                onChange={e => setVal2(e.target.value)}
                disabled={constructionValid}
                className={`w-16 p-2 text-center rounded-lg border-2 ${constructionValid ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-300'}`}
              />
              <span>) = 0</span>
            </div>

            {!constructionValid ? (
              <button 
                onClick={checkConstruction}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vérifier
              </button>
            ) : (
              <div className="animate-in zoom-in space-y-6">
                <div className="text-emerald-700 font-bold flex items-center justify-center gap-2 bg-emerald-50 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 /> Factorisation réussie ! 16 est bien le carré de 4.
                </div>
                
                <div className="pt-6 border-t border-slate-200">
                  <p className="text-slate-600 font-bold mb-4">On applique la règle du produit nul :</p>
                  <div className="flex justify-around">
                    <div className="bg-white p-4 border-2 border-slate-200 rounded-xl">
                      <span className="font-mono font-bold text-slate-500"><MathText>{'$x - 4 = 0$'}</MathText></span><br/>
                      <span className="font-mono font-black text-xl text-blue-600"><MathText>{'$x = 4$'}</MathText></span>
                    </div>
                    <div className="font-bold text-slate-300 flex items-center">OU</div>
                    <div className="bg-white p-4 border-2 border-slate-200 rounded-xl">
                      <span className="font-mono font-bold text-slate-500"><MathText>{'$x + 4 = 0$'}</MathText></span><br/>
                      <span className="font-mono font-black text-xl text-emerald-600"><MathText>{'$x = -4$'}</MathText></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

    </ModuleLayout>
  );
}
