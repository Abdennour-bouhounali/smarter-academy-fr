import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight, Calculator } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';
import { compareMathExpressions } from '../../../../../common/utils/mathComparison';
import { motion } from 'framer-motion';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module04Reciproque() {
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const handleNext = () => markModuleCompleted('L04');

  const { prevLink, nextLink } = getNavLinks(4);

  // Étape 1 : Choisir le plus grand côté
  // Étape 2 : Calculer son carré
  // Étape 3 : Calculer la somme des autres
  // Étape 4 : Comparer et conclure
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Triangle : 6, 8, 10 (Rectangle)
  const a = 6;
  const b = 8;
  const c = 10;
  
  const [selectedHypo, setSelectedHypo] = useState(null);
  const [sqHypo, setSqHypo] = useState('');
  const [sqSum, setSqSum] = useState('');

  const handleSelectHypo = (val) => {
    setSelectedHypo(val);
    if (val === 10) {
      setFeedback('hypo_correct');
      setStep(2);
    } else {
      setFeedback('hypo_incorrect');
    }
  };

  const checkSqHypo = () => {
    const isEquivalent = compareMathExpressions(sqHypo, (c * c).toString());
    const val = parseFloat(sqHypo);
    if (isEquivalent || (!isNaN(val) && val === c * c)) {
      setFeedback('sq_correct');
      setStep(3);
    } else {
      setFeedback('sq_incorrect');
    }
  };

  const checkSqSum = () => {
    const isEquivalent = compareMathExpressions(sqSum, (a * a + b * b).toString());
    const val = parseFloat(sqSum);
    if (isEquivalent || (!isNaN(val) && val === a * a + b * b)) {
      setFeedback('sum_correct');
      setStep(4);
    } else {
      setFeedback('sum_incorrect');
    }
  };

  const handleConclusion = () => {
    setIsCompleted(true);
  };

  return (
    <ModuleLayout
      onNextClick={handleNext}
      {...MODULE_CTX}
      moduleNumber={4}
      moduleTitle="La Réciproque"
      moduleSubtitle="Démontrer qu'un triangle est rectangle."
      estimatedTime="10 min"
      prevLink={prevLink}
      nextLink={isCompleted ? nextLink : null}
      xp={50}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Comparateur Dynamique */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 min-h-[450px]">
            <h3 className="font-bold text-slate-700 mb-8 text-center">
              Le triangle de côtés <MathText>{`$${a}$`}</MathText>, <MathText>{`$${b}$`}</MathText> et <MathText>{`$${c}$`}</MathText> est-il rectangle ?
            </h3>

            {/* Triangle SVG (Approximatif juste pour visuel) */}
            <svg width="200" height="150" viewBox="0 0 200 150" className="mb-8">
              <polygon points="10,140 130,140 10,20" fill="none" stroke="#64748B" strokeWidth="3" strokeLinejoin="round"/>
              <text x="70" y="135" fontSize="14" fill="#334155" fontWeight="bold">8</text>
              <text x="15" y="80" fontSize="14" fill="#334155" fontWeight="bold">6</text>
              <text x="80" y="70" fontSize="14" fill="#334155" fontWeight="bold">10</text>
            </svg>

            {/* Balance de comparaison */}
            <div className="w-full max-w-md bg-white p-6 rounded-2xl border-2 border-slate-200 flex justify-between items-end relative">
              {/* Gauche : Carré du plus grand côté */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">Carré du plus grand</div>
                <div className="h-20 w-20 bg-pink-100 border-2 border-pink-300 rounded-lg flex items-center justify-center text-xl font-bold text-pink-700">
                  {step >= 3 ? (c * c) : '?'}
                </div>
              </div>

              {/* Milieu : Signe */}
              <div className="flex flex-col items-center w-1/3 mb-4">
                <div className="text-3xl font-extrabold text-slate-400">
                  {step >= 4 ? '=' : '?'}
                </div>
              </div>

              {/* Droite : Somme des deux autres */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">Somme des autres</div>
                <div className="h-20 w-20 bg-indigo-100 border-2 border-indigo-300 rounded-lg flex items-center justify-center text-xl font-bold text-indigo-700 relative">
                  {step >= 4 ? (a * a + b * b) : '?'}
                  {/* Petits carrés visuels en arrière plan */}
                  <div className="absolute -top-3 -right-3 h-6 w-6 bg-blue-200 opacity-50 rounded"></div>
                  <div className="absolute -bottom-2 -left-2 h-8 w-8 bg-blue-300 opacity-50 rounded"></div>
                </div>
              </div>
            </div>

            {step >= 4 && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 px-6 py-3 bg-emerald-100 text-emerald-800 font-bold rounded-full border-2 border-emerald-300 text-lg">
                ÉGALITÉ VÉRIFIÉE !
              </motion.div>
            )}

          </div>

          {/* Panneau de rédaction */}
          <div className="w-full md:w-[450px] p-6 flex flex-col border-l border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Rédaction (Réciproque)</h2>
            
            <div className="space-y-6 text-sm text-slate-600 flex-1">
              
              {/* Etape 1 */}
              <div className={`p-4 rounded-xl border-2 transition-all ${step === 1 ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <p className="font-bold text-slate-700 mb-2">1. Identifier le candidat</p>
                <p className="mb-3">Quel est le côté le plus long du triangle ?</p>
                {step === 1 ? (
                  <div className="flex gap-2">
                    {[6, 8, 10].map(val => (
                      <button key={val} onClick={() => handleSelectHypo(val)} className="flex-1 py-2 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold">
                        {val}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-700 font-bold">Le plus grand côté est 10.</p>
                )}
                {feedback === 'hypo_incorrect' && <p className="text-red-500 mt-2 text-xs">Faux. Cherchez le nombre le plus grand.</p>}
              </div>

              {/* Etape 2 */}
              {step >= 2 && (
                <div className={`p-4 rounded-xl border-2 transition-all ${step === 2 ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-white'}`}>
                  <p className="font-bold text-slate-700 mb-2">2. "Je sais que..."</p>
                  <p className="mb-3">Calculez le carré du plus grand côté séparément.</p>
                  {step === 2 ? (
                    <div className="flex gap-2">
                      <span className="py-2"><MathText>{`$10^2 = $`}</MathText></span>
                      <MathInput value={sqHypo} onChange={(val) => { setSqHypo(val); setFeedback(null); }} onCommit={checkSqHypo} className="w-20" />
                      <button onClick={checkSqHypo} className="px-3 bg-pink-600 hover:bg-pink-700 text-white rounded font-bold ml-2">OK</button>
                    </div>
                  ) : (
                    <p className="text-pink-700 font-bold"><MathText>{`$10^2 = 100$`}</MathText></p>
                  )}
                  {feedback === 'sq_incorrect' && <p className="text-red-500 mt-2 text-xs">Faux. 10 × 10 = ?</p>}
                </div>
              )}

              {/* Etape 3 */}
              {step >= 3 && (
                <div className={`p-4 rounded-xl border-2 transition-all ${step === 3 ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                  <p className="font-bold text-slate-700 mb-2">3. "Et d'autre part..."</p>
                  <p className="mb-3">Calculez la somme des carrés des deux autres côtés.</p>
                  {step === 3 ? (
                    <div className="flex gap-2 flex-wrap items-center">
                      <span><MathText>{`$6^2 + 8^2 = $`}</MathText></span>
                      <MathInput value={sqSum} onChange={(val) => { setSqSum(val); setFeedback(null); }} onCommit={checkSqSum} className="w-20" />
                      <button onClick={checkSqSum} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold ml-2">OK</button>
                    </div>
                  ) : (
                    <p className="text-indigo-700 font-bold"><MathText>{`$6^2 + 8^2 = 36 + 64 = 100$`}</MathText></p>
                  )}
                  {feedback === 'sum_incorrect' && <p className="text-red-500 mt-2 text-xs">Faux. Calculez 36 + 64.</p>}
                </div>
              )}

              {/* Etape 4 */}
              {step >= 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50">
                  <p className="font-bold text-slate-700 mb-2">4. Conclusion</p>
                  <p className="mb-3">
                    <strong>Or</strong>, <MathText>{`$10^2 = 6^2 + 8^2$`}</MathText>.<br/>
                    <strong>Donc</strong>, d'après la réciproque du théorème de Pythagore, le triangle est bien rectangle !
                  </p>
                  {!isCompleted ? (
                    <button onClick={handleConclusion} className="w-full py-2 bg-emerald-600 text-white rounded font-bold flex items-center justify-center gap-2">
                      <Check size={18} /> Valider la démonstration
                    </button>
                  ) : (
                    <div className="text-center font-bold text-emerald-700">Démonstration parfaite !</div>
                  )}
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
