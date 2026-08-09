import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { motion } from 'framer-motion';

export default function Module05Contraposee() {
  const { prevLink, nextLink } = getNavLinks(5);

  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Triangle : 5, 7, 9 (Non-Rectangle)
  const a = 5;
  const b = 7;
  const c = 9; // Le plus grand côté
  
  const [selectedHypo, setSelectedHypo] = useState(null);
  const [sqHypo, setSqHypo] = useState('');
  const [sqSum, setSqSum] = useState('');

  const handleSelectHypo = (val) => {
    setSelectedHypo(val);
    if (val === 9) {
      setFeedback('hypo_correct');
      setTimeout(() => {
        setFeedback(null);
        setStep(2);
      }, 1500);
    } else {
      setFeedback('hypo_incorrect');
    }
  };

  const checkSqHypo = () => {
    if (parseFloat(sqHypo) === c * c) {
      setFeedback('sq_correct');
      setTimeout(() => {
        setFeedback(null);
        setStep(3);
      }, 1500);
    } else {
      setFeedback('sq_incorrect');
    }
  };

  const checkSqSum = () => {
    if (parseFloat(sqSum) === a * a + b * b) {
      setFeedback('sum_correct');
      setTimeout(() => {
        setFeedback(null);
        setStep(4);
      }, 1500);
    } else {
      setFeedback('sum_incorrect');
    }
  };

  const handleConclusion = () => {
    setIsCompleted(true);
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleNumber={5}
      moduleTitle="La Contraposée"
      moduleSubtitle="Prouver qu'un triangle n'est pas rectangle."
      estimatedTime="8 min"
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

            {/* Balance de comparaison */}
            <div className="w-full max-w-md bg-white p-6 rounded-2xl border-2 border-slate-200 flex justify-between items-end relative">
              {/* Gauche : Carré du plus grand côté */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">Carré du plus grand</div>
                <div className="h-20 w-20 bg-rose-100 border-2 border-rose-300 rounded-lg flex items-center justify-center text-xl font-bold text-rose-700">
                  {step >= 3 ? (c * c) : '?'}
                </div>
              </div>

              {/* Milieu : Signe */}
              <div className="flex flex-col items-center w-1/3 mb-4">
                <div className="text-3xl font-extrabold text-slate-400">
                  {step >= 4 ? '≠' : '?'}
                </div>
              </div>

              {/* Droite : Somme des deux autres */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">Somme des autres</div>
                <div className="h-20 w-20 bg-indigo-100 border-2 border-indigo-300 rounded-lg flex items-center justify-center text-xl font-bold text-indigo-700 relative">
                  {step >= 4 ? (a * a + b * b) : '?'}
                  {/* Petits carrés */}
                  <div className="absolute -top-3 -right-3 h-6 w-6 bg-blue-200 opacity-50 rounded"></div>
                  <div className="absolute -bottom-2 -left-2 h-8 w-8 bg-blue-300 opacity-50 rounded"></div>
                </div>
              </div>
            </div>

            {step >= 4 && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 px-6 py-3 bg-rose-100 text-rose-800 font-bold rounded-full border-2 border-rose-300 text-lg">
                ÉGALITÉ NON VÉRIFIÉE !
              </motion.div>
            )}

          </div>

          {/* Panneau de rédaction */}
          <div className="w-full md:w-[450px] p-6 flex flex-col border-l border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Rédaction (Contraposée)</h2>
            
            <div className="space-y-6 text-sm text-slate-600 flex-1">
              
              {/* Etape 1 */}
              <div className={`p-4 rounded-xl border-2 transition-all ${step === 1 ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <p className="font-bold text-slate-700 mb-2">1. Identifier le candidat hypoténuse</p>
                <p className="mb-3">Quel est le plus grand côté ?</p>
                {step === 1 ? (
                  <div className="flex gap-2">
                    {[5, 7, 9].map(val => (
                      <button key={val} onClick={() => handleSelectHypo(val)} className="flex-1 py-2 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold">
                        {val}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-700 font-bold">Le plus grand côté est 9.</p>
                )}
                {feedback === 'hypo_incorrect' && <p className="text-red-500 mt-2 text-xs">Faux.</p>}
              </div>

              {/* Etape 2 */}
              {step >= 2 && (
                <div className={`p-4 rounded-xl border-2 transition-all ${step === 2 ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}>
                  <p className="font-bold text-slate-700 mb-2">2. "Je sais que..."</p>
                  <p className="mb-3">Calculez son carré :</p>
                  {step === 2 ? (
                    <div className="flex gap-2">
                      <span className="py-2"><MathText>{`$9^2 = $`}</MathText></span>
                      <input type="number" value={sqHypo} onChange={(e) => setSqHypo(e.target.value)} className="w-20 p-2 border rounded" />
                      <button onClick={checkSqHypo} className="px-3 bg-rose-600 text-white rounded font-bold">OK</button>
                    </div>
                  ) : (
                    <p className="text-rose-700 font-bold"><MathText>{`$9^2 = 81$`}</MathText></p>
                  )}
                </div>
              )}

              {/* Etape 3 */}
              {step >= 3 && (
                <div className={`p-4 rounded-xl border-2 transition-all ${step === 3 ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                  <p className="font-bold text-slate-700 mb-2">3. "Et d'autre part..."</p>
                  <p className="mb-3">Calculez la somme des carrés des autres côtés :</p>
                  {step === 3 ? (
                    <div className="flex gap-2 flex-wrap items-center">
                      <span><MathText>{`$5^2 + 7^2 = $`}</MathText></span>
                      <input type="number" value={sqSum} onChange={(e) => setSqSum(e.target.value)} className="w-20 p-2 border rounded" />
                      <button onClick={checkSqSum} className="px-3 py-2 bg-indigo-600 text-white rounded font-bold">OK</button>
                    </div>
                  ) : (
                    <p className="text-indigo-700 font-bold"><MathText>{`$5^2 + 7^2 = 25 + 49 = 74$`}</MathText></p>
                  )}
                </div>
              )}

              {/* Etape 4 */}
              {step >= 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl border-2 border-rose-400 bg-rose-50">
                  <p className="font-bold text-slate-700 mb-2">4. Conclusion</p>
                  <p className="mb-3">
                    <strong>Or</strong>, <MathText>{`$81 \\neq 74$`}</MathText> (L'égalité de Pythagore n'est pas vérifiée).<br/>
                    <strong>Donc</strong>, d'après <strong>la contraposée</strong> du théorème de Pythagore, le triangle <strong>n'est pas rectangle</strong>.
                  </p>
                  {!isCompleted ? (
                    <button onClick={handleConclusion} className="w-full py-2 bg-rose-600 text-white rounded font-bold flex items-center justify-center gap-2">
                      <Check size={18} /> Valider la démonstration
                    </button>
                  ) : (
                    <div className="text-center font-bold text-rose-700">Démonstration validée !</div>
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
