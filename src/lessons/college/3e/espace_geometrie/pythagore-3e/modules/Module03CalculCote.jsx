import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight, Info } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { motion } from 'framer-motion';

export default function Module03CalculCote() {
  const { prevLink, nextLink } = getNavLinks(3);

  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null); // 'AB' ou 'AC'
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Valeurs fixes pour l'exercice
  const hypotenuse = 13; // BC
  const knownSide = 5; // AB (si on cherche AC) ou AC (si on cherche AB)
  const unknownSideSquare = hypotenuse * hypotenuse - knownSide * knownSide;
  const unknownSide = Math.sqrt(unknownSideSquare); // 12

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleSelectSide = (side) => {
    setSelectedSide(side);
    setStep(2);
  };

  const checkAnswer = () => {
    const val = parseFloat(userAnswer);
    if (Math.abs(val - unknownSide) < 0.01) {
      setFeedback('correct');
      setIsCompleted(true);
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleNumber={3}
      moduleTitle="Calculer un petit côté"
      moduleSubtitle="Comment trouver un côté de l'angle droit en connaissant l'hypoténuse."
      estimatedTime="10 min"
      prevLink={prevLink}
      nextLink={isCompleted ? nextLink : null}
      xp={50}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Zone Visuelle */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 min-h-[400px]">
            
            <svg width="350" height="350" viewBox="0 0 350 350" className="overflow-visible">
              {/* Carrés schématiques (Concept) */}
              {step >= 2 && (
                <g className="transition-all duration-500">
                  <rect x="20" y="20" width="120" height="120" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
                  <text x="80" y="80" fontSize="14" fill="#BE185D" fontWeight="bold" textAnchor="middle">Grand carré</text>
                  <text x="80" y="100" fontSize="12" fill="#BE185D" textAnchor="middle"><MathText>{`$${hypotenuse}^2 = ${hypotenuse*hypotenuse}$`}</MathText></text>

                  <text x="160" y="80" fontSize="30" fill="#333" fontWeight="bold" textAnchor="middle">−</text>

                  <rect x="180" y="50" width="60" height="60" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                  <text x="210" y="70" fontSize="12" fill="#1D4ED8" fontWeight="bold" textAnchor="middle">Petit carré</text>
                  <text x="210" y="90" fontSize="10" fill="#1D4ED8" textAnchor="middle"><MathText>{`$${knownSide}^2 = ${knownSide*knownSide}$`}</MathText></text>

                  <text x="260" y="80" fontSize="30" fill="#333" fontWeight="bold" textAnchor="middle">=</text>

                  <rect x="280" y="30" width="100" height="100" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="2" strokeDasharray={step >= 3 ? "" : "4 4"} opacity={step >= 3 ? 1 : 0.5}/>
                  <text x="330" y="80" fontSize="12" fill="#3730A3" fontWeight="bold" textAnchor="middle">Carré cherché</text>
                  <text x="330" y="100" fontSize="10" fill="#3730A3" textAnchor="middle">
                    {step >= 3 ? <MathText>{`$${unknownSideSquare}$`}</MathText> : '?'}
                  </text>
                </g>
              )}

              {/* Triangle (en dessous) */}
              <g transform="translate(100, 180)">
                <polygon points="0,0 50,0 0,-120" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
                <polyline points="0,-15 15,-15 15,0" fill="none" stroke="#EF4444" strokeWidth="2" />
                <text x="-15" y="15" fontSize="14" fontWeight="bold">A</text>
                
                {selectedSide === 'AC' ? (
                  <>
                    <text x="60" y="15" fontSize="14" fontWeight="bold">B</text>
                    <text x="-15" y="-130" fontSize="14" fontWeight="bold">C</text>
                    <text x="25" y="20" fontSize="14" fill="#2563EB" fontWeight="bold" textAnchor="middle">{knownSide}</text>
                    <text x="-15" y="-60" fontSize="14" fill="#4F46E5" fontWeight="bold">?</text>
                  </>
                ) : (
                  <>
                    <text x="60" y="15" fontSize="14" fontWeight="bold">C</text>
                    <text x="-15" y="-130" fontSize="14" fontWeight="bold">B</text>
                    <text x="25" y="20" fontSize="14" fill="#4F46E5" fontWeight="bold" textAnchor="middle">?</text>
                    <text x="-15" y="-60" fontSize="14" fill="#2563EB" fontWeight="bold">{knownSide}</text>
                  </>
                )}
                
                <text x="40" y="-60" fontSize="14" fill="#BE185D" fontWeight="bold">{hypotenuse}</text>
              </g>

            </svg>
          </div>

          {/* Panneau de contrôle */}
          <div className="w-full md:w-[450px] p-6 flex flex-col border-l border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Soustraire les carrés</h2>
            
            <div className="space-y-4 text-sm text-slate-600 flex-1">
              
              {step === 1 && (
                <div className="space-y-4">
                  <p>Dans un triangle rectangle, si l'on connaît l'hypoténuse et un petit côté, on peut trouver l'autre côté de l'angle droit.</p>
                  <p className="font-semibold text-slate-700">Quel côté souhaitez-vous calculer en premier ?</p>
                  <div className="flex gap-4">
                    <button onClick={() => handleSelectSide('AC')} className="flex-1 py-3 bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold rounded-xl shadow-sm transition-all">
                      Calculer AC
                    </button>
                    <button onClick={() => handleSelectSide('AB')} className="flex-1 py-3 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 font-bold rounded-xl shadow-sm transition-all">
                      Calculer AB
                    </button>
                  </div>
                </div>
              )}

              {step >= 2 && (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800">
                    <p className="font-semibold mb-1">On part de la formule :</p>
                    <div className="text-center">
                      <MathText>{'$AB^2 + AC^2 = BC^2$'}</MathText>
                    </div>
                  </div>
                  <p>Puisque le grand carré (<MathText>{'$BC^2$'}</MathText>) est la somme des deux petits, pour trouver un petit carré, il faut faire une <strong>soustraction</strong> :</p>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center font-bold text-indigo-700">
                    <MathText>
                      {selectedSide === 'AC' ? '$AC^2 = BC^2 - AB^2$' : '$AB^2 = BC^2 - AC^2$'}
                    </MathText>
                  </div>
                </div>
              )}

              {step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 border-t border-slate-200 pt-4">
                  <p>On remplace et on calcule :</p>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
                    <MathText>
                      {selectedSide === 'AC' ? `$AC^2 = ${hypotenuse}^2 - ${knownSide}^2$` : `$AB^2 = ${hypotenuse}^2 - ${knownSide}^2$`}
                    </MathText><br/>
                    <MathText>
                      {selectedSide === 'AC' ? `$AC^2 = ${hypotenuse*hypotenuse} - ${knownSide*knownSide}$` : `$AB^2 = ${hypotenuse*hypotenuse} - ${knownSide*knownSide}$`}
                    </MathText><br/>
                    <MathText>
                      {selectedSide === 'AC' ? `$AC^2 = ${unknownSideSquare}$` : `$AB^2 = ${unknownSideSquare}$`}
                    </MathText>
                  </div>
                </motion.div>
              )}

              {step >= 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 mt-4">
                  <p className="font-semibold text-indigo-800 mb-2">À vous de terminer !</p>
                  <p className="text-xs text-indigo-700 mb-3">Quelle est la longueur de <MathText>{`$${selectedSide}$`}</MathText> ?</p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={userAnswer}
                      onChange={(e) => { setUserAnswer(e.target.value); setFeedback(null); }}
                      placeholder="Ex: 10"
                      className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 ${feedback === 'incorrect' ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200'}`}
                      disabled={isCompleted}
                    />
                    {!isCompleted ? (
                      <button onClick={checkAnswer} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors">
                        Vérifier
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center justify-center">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                  {feedback === 'incorrect' && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">Erreur. Calculez la racine carrée de {unknownSideSquare}.</p>
                  )}
                  {feedback === 'correct' && (
                    <p className="text-xs text-emerald-600 mt-2 font-semibold">Parfait ! <MathText>{`$${selectedSide} = \\sqrt{${unknownSideSquare}} = ${unknownSide}$`}</MathText></p>
                  )}
                </motion.div>
              )}

            </div>

            <div className="pt-6 mt-auto">
              {step > 1 && step < 4 && (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Continuer <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
