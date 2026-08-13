import React, { useState, useEffect } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { CheckCircle2, CakeSlice } from 'lucide-react';

export default function Module03Quotient() {
  const [aliceParts, setAliceParts] = useState([false, false, false]);
  const isAliceDone = aliceParts.every(part => part === true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isAliceDone) {
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [isAliceDone]);

  const navLinks = getNavLinks(3);

  const toggleAlicePart = (cakeIndex) => {
    const newParts = [...aliceParts];
    newParts[cakeIndex] = true;
    setAliceParts(newParts);
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="La fraction quotient"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      prevLink={navLinks.prevLink}
      nextLink={isCompleted ? navLinks.nextLink : undefined}
      isCompleted={isCompleted}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-12">
          
          <div className="mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission 3 / 5</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Pourquoi 3 ÷ 4 donne-t-il une fraction ?</h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-slate-600">
              Tu as <strong>3 gâteaux</strong> et tu veux les partager équitablement entre <strong>4 amis</strong>.
              Si tu essaies de faire $3 \div 4$ sur une calculatrice, ça ne tombe pas sur un nombre entier...
            </p>
            
            <div className="bg-rose-50 text-rose-800 p-6 rounded-2xl border border-rose-200">
              <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
                <span className="text-2xl">💡</span> L'astuce
              </h4>
              <p>
                Au lieu de diviser les gâteaux en essayant de calculer mentalement, 
                <strong>coupons chaque gâteau en 4</strong> (puisqu'il y a 4 amis) !
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-slate-100">
            <p className="text-lg text-slate-600 font-medium">
              Sers Alice ! Clique sur <strong>une part de chaque gâteau</strong> pour la donner à l'assiette d'Alice.
            </p>

            <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="flex flex-col gap-6">
                {[0, 1, 2].map((cakeIndex) => (
                  <div key={cakeIndex} className="flex gap-2">
                    <span className="font-bold text-slate-400 w-24 text-right">Gâteau {cakeIndex + 1}</span>
                    <div className="flex gap-1 h-8 items-center">
                      {[0, 1, 2, 3].map((partIndex) => {
                        const isAlicePart = partIndex === 0;
                        const isGiven = isAlicePart && aliceParts[cakeIndex];
                        return (
                          <div 
                            key={partIndex}
                            onClick={() => { if(isAlicePart) toggleAlicePart(cakeIndex); }}
                            className={`transition-all duration-300 ${isGiven ? 'w-0 opacity-0 overflow-hidden' : 'w-8 opacity-100'} ${isAlicePart && !isGiven ? 'text-pink-500 hover:text-pink-600 hover:scale-110 cursor-pointer' : 'text-pink-200'}`}
                          >
                            <CakeSlice className="w-full h-8" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center p-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl w-48 h-48 justify-center relative">
                <span className="font-bold text-indigo-800 absolute top-4">Assiette d'Alice</span>
                <div className="flex gap-1 mt-4 flex-wrap justify-center">
                  {aliceParts.filter(Boolean).map((_, i) => (
                    <CakeSlice key={i} className="w-8 h-8 text-pink-500 animate-in zoom-in duration-300" />
                  ))}
                  {aliceParts.filter(Boolean).length === 0 && (
                    <span className="text-slate-400 text-sm">Vide...</span>
                  )}
                </div>
              </div>
            </div>

            {isAliceDone && (
              <div className="mt-6 text-emerald-600 font-bold flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
                Super ! Alice a reçu 3 parts de "un quart" de gâteau.
              </div>
            )}
          </div>

          {isCompleted && (
            <div className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-indigo-800 mb-4">Bilan du partage</h3>
                <p className="text-lg text-indigo-700 mb-6 max-w-2xl">
                  Chaque personne a reçu une part de chaque gâteau. Comme il y a 3 gâteaux coupés en 4, chacun reçoit <strong>3 parts sur 4</strong>.
                </p>
                <div className="flex items-center gap-6 bg-white px-8 py-6 rounded-xl shadow-sm text-2xl font-space font-bold text-slate-700">
                  <span>3 ÷ 4</span>
                  <span className="text-slate-400">=</span>
                  <div className="flex flex-col items-center leading-none text-indigo-600">
                    <span>3</span>
                    <div className="w-full h-1 bg-indigo-600 my-1"></div>
                    <span>4</span>
                  </div>
                </div>
              </div>

              <ConceptCard label="La fraction comme quotient" emoji="💡" color="indigo">
                <p>Une fraction est aussi le résultat d'une division ! Le trait de fraction remplace le symbole de la division (÷). Ainsi, a ÷ b = a/b.</p>
              </ConceptCard>
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
