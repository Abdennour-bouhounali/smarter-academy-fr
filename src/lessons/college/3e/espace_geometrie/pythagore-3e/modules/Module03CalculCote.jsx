import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight, Info } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';
import { compareMathExpressions } from '../../../../../common/utils/mathComparison';
import { motion } from 'framer-motion';

export default function Module03CalculCote() {
  const { prevLink, nextLink } = getNavLinks(3);

  const [step, setStep] = useState(2);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSide, setSelectedSide] = useState('AC'); // 'AB' ou 'AC'
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
    const isEquivalent = compareMathExpressions(userAnswer, unknownSide.toString());
    const val = parseFloat(userAnswer.replace(',', '.'));
    const isApprox = !isNaN(val) && Math.abs(val - unknownSide) < 0.01;
    
    if (isEquivalent || isApprox) {
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
              
              {/* Carré sur BC (Hypoténuse) - Grand Carré */}
              {step >= 2 && (
                <g className="transition-all duration-500">
                  <polygon points="200,250 150,130 270,80 320,200" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
                  <text x="235" y="165" fontSize="14" fill="#BE185D" fontWeight="bold" textAnchor="middle" transform="rotate(-67.38, 235, 165)">
                    13² = 169
                  </text>
                </g>
              )}

              {/* Carré sur AB - Petit Carré */}
              {step >= 2 && (
                <g className="transition-all duration-500">
                  <polygon points="150,250 200,250 200,300 150,300" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                  <text x="175" y="280" fontSize="12" fill="#1D4ED8" fontWeight="bold" textAnchor="middle">
                    5² = 25
                  </text>
                </g>
              )}

              {/* Carré sur AC - Carré Cherché */}
              {step >= 2 && (
                <g className="transition-all duration-500">
                  <polygon points="150,250 30,250 30,130 150,130" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="2" strokeDasharray={step >= 3 ? "" : "4 4"} opacity={step >= 3 ? 1 : 0.5} />
                  <text x="90" y="190" fontSize="14" fill="#3730A3" fontWeight="bold" textAnchor="middle">
                    {step >= 3 ? '? = 144' : '?'}
                  </text>
                </g>
              )}

              {/* Triangle */}
              <polygon points="150,250 200,250 150,130" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
              
              {/* Angle droit */}
              <polyline points="150,235 165,235 165,250" fill="none" stroke="#EF4444" strokeWidth="2" />
              
              {/* Noms des sommets */}
              <text x="135" y="265" fontSize="14" fontWeight="bold">A</text>
              <text x="210" y="265" fontSize="14" fontWeight="bold">B</text>
              <text x="135" y="125" fontSize="14" fontWeight="bold">C</text>

              {/* Longueurs */}
              <text x="175" y="240" fontSize="14" fill="#2563EB" fontWeight="bold" textAnchor="middle">5</text>
              <text x="135" y="190" fontSize="14" fill="#4F46E5" fontWeight="bold" textAnchor="middle">?</text>
              <text x="185" y="185" fontSize="14" fill="#BE185D" fontWeight="bold" textAnchor="middle">13</text>

            </svg>
          </div>

          {/* Panneau de contrôle */}
          <div className="w-full md:w-[450px] p-6 flex flex-col border-l border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Soustraire les carrés</h2>
            
            <div className="space-y-4 text-sm text-slate-600 flex-1">
              
              <p className="mb-4">Dans un triangle rectangle, si l'on connaît l'hypoténuse et un petit côté, on peut trouver l'autre côté de l'angle droit.</p>

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
                    <MathInput 
                      value={userAnswer}
                      onChange={(val) => { setUserAnswer(val); setFeedback(null); }}
                      placeholder="Ex: 10"
                      disabled={isCompleted}
                    />
                    {!isCompleted ? (
                      <button onClick={checkAnswer} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors ml-2">
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
