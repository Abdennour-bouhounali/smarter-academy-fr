import React, { useState, useEffect } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { CheckCircle2 } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';

export default function Module02Vocabulaire() {
  const [totalParts, setTotalParts] = useState(4);
  const [takenParts, setTakenParts] = useState(0);

  const [trainTotal, setTrainTotal] = useState(2);
  const [trainTaken, setTrainTaken] = useState(1);
  const targetTaken = 5;
  const targetTotal = 8;
  const isTrainingSuccess = trainTotal === targetTotal && trainTaken === targetTaken;
  
  const isStep1Success = totalParts === 4 && takenParts === 3;
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isTrainingSuccess) {
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [isTrainingSuccess]);

  const navLinks = getNavLinks(2);

  const togglePart = (index) => {
    if (index < takenParts) {
      setTakenParts(index); 
    } else {
      setTakenParts(index + 1); 
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Vocabulaire des fractions"
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      prevLink={navLinks.prevLink}
      nextLink={isCompleted ? navLinks.nextLink : undefined}
      isCompleted={isCompleted}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-12">
          
          <div className="mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission 2 / 5</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Comment décrire exactement ce que j'ai pris ?</h2>
          </div>

          {/* ── STEP 1 : MANIPULATION ── */}
          <div className="space-y-6">
            <p className="text-lg text-slate-600">
              Pour décrire une fraction, on a besoin de deux informations. 
              Découpe cette barre en <strong>4 parts égales</strong> et prends <strong>3 parts</strong> (clique sur les parts pour les prendre).
            </p>

            <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-4 mb-8">
                <span className="font-bold text-slate-500">Découpe (Total) :</span>
                <button onClick={() => { setTotalParts(Math.max(1, totalParts - 1)); setTakenParts(Math.min(takenParts, Math.max(1, totalParts - 1))); }} className="w-10 h-10 bg-slate-100 rounded-full font-bold hover:bg-slate-200">-</button>
                <span className="text-xl font-bold w-8 text-center">{totalParts}</span>
                <button onClick={() => setTotalParts(Math.min(10, totalParts + 1))} className="w-10 h-10 bg-slate-100 rounded-full font-bold hover:bg-slate-200">+</button>
              </div>

              <div className="flex w-full max-w-lg h-24 bg-amber-100 rounded-xl overflow-hidden border-4 border-amber-900 cursor-pointer shadow-inner">
                {Array.from({ length: totalParts }).map((_, i) => (
                  <div 
                    key={i}
                    onClick={() => togglePart(i)}
                    className={`flex-1 border-r-2 border-amber-900 transition-colors duration-300 ${i < takenParts ? 'bg-amber-700' : 'bg-amber-100 hover:bg-amber-200'}`}
                    style={{ borderRightWidth: i === totalParts - 1 ? 0 : 2 }}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-400">Parts prises : {takenParts} / {totalParts}</p>

              {isStep1Success && (
                <div className="mt-6 text-emerald-600 font-bold flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                  C'est parfait ! Tu as "pris 3 sur 4".
                </div>
              )}
            </div>
          </div>

          {/* ── STEP 2 : VOCABULAIRE & PIÈGE ── */}
          {isStep1Success && (
            <div className="space-y-12 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <p className="text-lg text-slate-600">
                  En mathématiques, on n'écrit pas "3 sur 4". On utilise une écriture très précise avec un vocabulaire spécial.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <div className="text-6xl font-space font-bold text-slate-800 flex flex-col items-center">
                    <span className="text-emerald-600">3</span>
                    <div className="w-16 h-2 bg-slate-800 my-2 rounded-full"></div>
                    <span className="text-indigo-600">4</span>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl relative">
                      <h4 className="font-bold text-emerald-700 text-lg">Le Numérateur (en haut)</h4>
                      <p className="text-emerald-600">C'est le nombre de parts que tu as sélectionnées.</p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl relative">
                      <h4 className="font-bold text-indigo-700 text-lg">Le Dénominateur (en bas)</h4>
                      <p className="text-indigo-600">C'est la découpe totale (en combien la forme a été coupée).</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <ConceptCard label="L'erreur classique" emoji="🚨" color="amber">
                  <p>Mélanger le haut et le bas est l'erreur la plus fréquente ! Si on te demande de prendre 3 parts sur 4, le 4 doit toujours être en bas.</p>
                </ConceptCard>
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-700 mb-4">L'astuce de mémorisation :</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                      <span className="text-2xl">☁️</span>
                      <span><strong>N</strong>umérateur = commence par N comme <strong>Nuage</strong> (c'est en haut).</span>
                    </li>
                    <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                      <span className="text-2xl">🌍</span>
                      <span><strong>D</strong>énominateur = commence par D comme <strong>Dessous</strong> (c'est en bas).</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ── STEP 4 : ENTRAÎNEMENT ── */}
              <div className="space-y-6">
                <p className="text-lg text-slate-600 text-center font-medium">
                  À toi de jouer ! Règle les compteurs pour afficher la fraction <strong>cinq huitièmes</strong> (<MathText>{"$\\frac{5}{8}$"}</MathText>).
                </p>

                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center max-w-sm mx-auto">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTrainTaken(Math.max(0, trainTaken - 1))} className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full font-bold hover:bg-emerald-200">-</button>
                    <span className="text-4xl font-space font-bold w-12 text-center text-emerald-600">{trainTaken}</span>
                    <button onClick={() => setTrainTaken(trainTaken + 1)} className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full font-bold hover:bg-emerald-200">+</button>
                  </div>
                  <div className="w-32 h-2 bg-slate-800 my-6 rounded-full"></div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTrainTotal(Math.max(1, trainTotal - 1))} className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full font-bold hover:bg-indigo-200">-</button>
                    <span className="text-4xl font-space font-bold w-12 text-center text-indigo-600">{trainTotal}</span>
                    <button onClick={() => setTrainTotal(trainTotal + 1)} className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full font-bold hover:bg-indigo-200">+</button>
                  </div>

                  {isTrainingSuccess && (
                    <div className="mt-8 text-emerald-600 font-bold flex items-center justify-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-6 h-6" />
                      Bravo ! Mission accomplie.
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
