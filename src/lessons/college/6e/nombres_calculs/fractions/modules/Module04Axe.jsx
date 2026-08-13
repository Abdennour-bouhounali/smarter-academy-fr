import React, { useState, useEffect } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';

export default function Module04Axe() {
  const [selectedTick, setSelectedTick] = useState(null);
  const isCorrect = selectedTick === 3;

  const [trainTick, setTrainTick] = useState(null);
  const isTrainCorrect = trainTick === 5; // 5/8

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isTrainCorrect) {
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [isTrainCorrect]);

  const navLinks = getNavLinks(4);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Repérage sur un axe"
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      prevLink={navLinks.prevLink}
      nextLink={isCompleted ? navLinks.nextLink : undefined}
      isCompleted={isCompleted}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-12">
          
          <div className="mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission 4 / 5</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Où placer 3/4 sur cette ligne ?</h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-slate-600">
              Une fraction peut se placer sur une droite, comme un repère. 
              Clique sur le trait qui correspond exactement à la fraction <strong><MathText>{"$\\frac{3}{4}$"}</MathText></strong>.
            </p>

            <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm overflow-x-auto">
              <div className="relative w-full max-w-2xl mx-auto h-32 flex items-center mt-8">
                <div className="absolute w-full h-1 bg-slate-800 top-1/2 -translate-y-1/2"></div>
                <div className="absolute right-0 w-3 h-3 border-t-4 border-r-4 border-slate-800 rotate-45 top-1/2 -translate-y-1/2 -mt-0.5 mr-1"></div>

                {[0, 1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left: `${(i / 4) * 80}%` }}
                  >
                    {(i === 0 || i === 4) && (
                      <span className="absolute -top-8 font-bold text-lg text-slate-800">{i === 0 ? '0' : '1'}</span>
                    )}

                    <div 
                      onClick={() => setSelectedTick(i)}
                      className={`w-1 h-6 cursor-pointer transition-all duration-300 relative ${selectedTick === i ? 'bg-amber-500 scale-y-150' : 'bg-slate-800 hover:bg-amber-400 scale-y-100'} ${i === 0 || i === 4 ? 'h-8 scale-y-125' : ''}`}
                    >
                      <div className="absolute -inset-4 z-10 bg-transparent"></div>
                    </div>

                    {selectedTick === i && (
                      <div className="absolute top-8 flex flex-col items-center animate-bounce text-amber-600 font-bold">
                        <ArrowDown className="w-5 h-5 rotate-180" />
                        <span>Ici !</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedTick !== null && !isCorrect && (
                <div className="mt-8 text-center text-red-500 font-bold bg-red-50 p-4 rounded-xl animate-in fade-in">
                  <AlertTriangle className="w-6 h-6 inline-block mr-2" />
                  Oops ! Ce n'est pas le bon endroit. Recompte bien.
                </div>
              )}
              
              {isCorrect && (
                <div className="mt-8 text-center text-emerald-600 font-bold flex items-center justify-center gap-2 bg-emerald-50 p-4 rounded-xl animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6" />
                  Excellent ! Tu as trouvé les trois quarts.
                </div>
              )}
            </div>
          </div>

          {isCorrect && (
            <div className="space-y-12 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <ConceptCard label="Le piège des petits traits" emoji="🚨" color="amber">
                  <p>L'erreur classique est de compter les petits traits verticaux. Il ne faut surtout pas faire ça ! Il faut compter les espaces (les segments) entre les traits.</p>
                </ConceptCard>

                <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-4 text-center">Observe bien la différence :</h4>
                  <div className="relative w-full max-w-lg mx-auto h-24 flex items-center">
                    <div className="absolute w-full h-1 bg-slate-800 top-1/2 -translate-y-1/2"></div>
                    
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 w-1 bg-slate-800"
                        style={{ left: `${(i / 4) * 100}%`, height: i === 0 || i === 4 ? '32px' : '20px' }}
                      >
                        <span className="absolute -top-6 -left-1 text-xs font-bold text-red-400">{i + 1}</span>
                      </div>
                    ))}
                    
                    <div className="absolute top-1/2 mt-4 left-0 w-full flex justify-between px-[12.5%] text-emerald-600 font-bold">
                      <span>1 part</span>
                      <span>2 parts</span>
                      <span>3 parts</span>
                      <span>4 parts</span>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium mt-8 text-amber-700">Il y a 5 traits en tout, mais seulement 4 parts (le dénominateur = 4). On cherche la fin de la 3ème part !</p>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-slate-100">
                <p className="text-lg text-slate-600 font-medium text-center">
                  On corse la difficulté ! Place le point correspondant à <strong><MathText>{"$\\frac{5}{8}$"}</MathText></strong> sur cet axe.
                </p>

                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm overflow-x-auto">
                  <div className="relative w-full max-w-3xl mx-auto h-32 flex items-center mt-8">
                    <div className="absolute w-full h-1 bg-slate-800 top-1/2 -translate-y-1/2"></div>
                    <div className="absolute right-0 w-3 h-3 border-t-4 border-r-4 border-slate-800 rotate-45 top-1/2 -translate-y-1/2 -mt-0.5 mr-1"></div>

                    {Array.from({length: 9}).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: `${(i / 8) * 85}%` }}
                      >
                        {(i === 0 || i === 8) && (
                          <span className="absolute -top-8 font-bold text-lg text-slate-800">{i === 0 ? '0' : '1'}</span>
                        )}

                        <div 
                          onClick={() => setTrainTick(i)}
                          className={`w-1 h-6 cursor-pointer transition-all duration-300 relative ${trainTick === i ? 'bg-indigo-500 scale-y-150' : 'bg-slate-800 hover:bg-indigo-400 scale-y-100'} ${i === 0 || i === 8 ? 'h-8 scale-y-125' : ''}`}
                        >
                          <div className="absolute -inset-2 z-10 bg-transparent"></div>
                        </div>

                        {trainTick === i && (
                          <div className="absolute top-8 flex flex-col items-center animate-bounce text-indigo-600 font-bold">
                            <ArrowDown className="w-5 h-5 rotate-180" />
                            <span>Ici !</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {trainTick !== null && !isTrainCorrect && (
                    <div className="mt-8 text-center text-red-500 font-bold bg-red-50 p-4 rounded-xl animate-in fade-in">
                      Recompte bien les espaces (les parts), pas les traits !
                    </div>
                  )}
                  
                  {isTrainCorrect && (
                    <div className="mt-8 text-center text-emerald-600 font-bold flex items-center justify-center gap-2 bg-emerald-50 p-4 rounded-xl animate-in fade-in">
                      <CheckCircle2 className="w-6 h-6" />
                      C'est exactement ça, 5 parts sur les 8 possibles !
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
