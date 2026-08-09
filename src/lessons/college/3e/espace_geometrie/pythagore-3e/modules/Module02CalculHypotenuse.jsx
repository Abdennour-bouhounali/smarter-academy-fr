import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { motion } from 'framer-motion';

export default function Module02CalculHypotenuse() {
  const { prevLink, nextLink } = getNavLinks(2);

  // Étape 1 : Identifier, Étape 2 : Formule, Étape 3 : Substitution, Étape 4 : Carrés, Étape 5 : Racine
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const scale = 25;
  const ptA = { x: 50, y: 250 };
  const ptB = { x: 50 + a * scale, y: 250 };
  const ptC = { x: 50, y: 250 - b * scale };

  const hypotenuseSquare = a * a + b * b;
  const hypotenuse = Math.sqrt(hypotenuseSquare);
  
  // Fonction pour vérifier la réponse de l'utilisateur à l'étape finale
  const checkAnswer = () => {
    const val = parseFloat(userAnswer);
    if (Math.abs(val - hypotenuse) < 0.01) {
      setFeedback('correct');
      setIsCompleted(true);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleNumber={2}
      moduleTitle="Calculer l'hypoténuse"
      moduleSubtitle="Utiliser le théorème de Pythagore pour trouver la longueur du plus grand côté."
      estimatedTime="10 min"
      prevLink={prevLink}
      nextLink={isCompleted ? nextLink : null}
      xp={50}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Zone SVG */}
          <div className="flex-1 p-6 flex flex-col items-center bg-slate-50 min-h-[400px]">
            <div className="mb-4 flex gap-6 w-full justify-center">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Côté AB</label>
                <input type="range" min="3" max="8" value={a} onChange={(e) => { setA(Number(e.target.value)); setStep(1); setIsCompleted(false); setFeedback(null); setUserAnswer(''); }} className="w-24 accent-blue-600" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Côté AC</label>
                <input type="range" min="3" max="8" value={b} onChange={(e) => { setB(Number(e.target.value)); setStep(1); setIsCompleted(false); setFeedback(null); setUserAnswer(''); }} className="w-24 accent-indigo-600" />
              </div>
            </div>

            <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
              <polygon
                points={`${ptA.x},${ptA.y} ${ptB.x},${ptB.y} ${ptC.x},${ptC.y}`}
                fill="#F8FAFC"
                stroke="#0F172A"
                strokeWidth="3"
                className="transition-all duration-300"
              />
              <polyline
                points={`${ptA.x},${ptA.y - 15} ${ptA.x + 15},${ptA.y - 15} ${ptA.x + 15},${ptA.y}`}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <text x={ptA.x - 15} y={ptA.y + 15} fontSize="14" fontWeight="bold">A</text>
              <text x={ptB.x + 10} y={ptB.y + 15} fontSize="14" fontWeight="bold">B</text>
              <text x={ptC.x - 15} y={ptC.y - 10} fontSize="14" fontWeight="bold">C</text>

              <text x={ptA.x + (a * scale) / 2} y={ptA.y - 10} fontSize="14" fill="#2563EB" fontWeight="bold" textAnchor="middle">{a}</text>
              <text x={ptA.x + 10} y={ptA.y - (b * scale) / 2} fontSize="14" fill="#4F46E5" fontWeight="bold">{b}</text>
              
              {/* Hypoténuse affichée selon l'étape */}
              <text x={ptA.x + (a * scale) / 2 + 10} y={ptA.y - (b * scale) / 2 - 10} fontSize="14" fill="#BE185D" fontWeight="bold">
                {step < 5 ? '? (BC)' : (isCompleted ? hypotenuse.toFixed(2).replace('.00', '') : 'c')}
              </text>
            </svg>
          </div>

          {/* Panneau de contrôle */}
          <div className="w-full md:w-[400px] p-6 flex flex-col border-l border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Résolution guidée</h2>
            
            <div className="space-y-4 text-sm text-slate-600 flex-1">
              
              {/* Etape 1 */}
              <div className={`p-3 rounded-lg border ${step >= 1 ? 'border-slate-200 bg-white' : 'border-transparent opacity-30'}`}>
                <p>1. Le triangle est rectangle en <MathText>{'$A$'}</MathText>, donc son hypoténuse est le côté <MathText>{'$BC$'}</MathText>.</p>
              </div>

              {/* Etape 2 */}
              {step >= 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <p>2. D'après le théorème de Pythagore :</p>
                  <div className="text-center font-bold text-blue-700 mt-2">
                    <MathText>{'$BC^2 = AB^2 + AC^2$'}</MathText>
                  </div>
                </motion.div>
              )}

              {/* Etape 3 */}
              {step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <p>3. On remplace par les valeurs connues :</p>
                  <div className="text-center font-bold text-blue-700 mt-2">
                    <MathText>{`$BC^2 = ${a}^2 + ${b}^2$`}</MathText>
                  </div>
                </motion.div>
              )}

              {/* Etape 4 */}
              {step >= 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <p>4. On calcule les carrés puis la somme :</p>
                  <div className="text-center font-bold text-blue-700 mt-2">
                    <MathText>{`$BC^2 = ${a * a} + ${b * b}$`}</MathText><br/>
                    <MathText>{`$BC^2 = ${hypotenuseSquare}$`}</MathText>
                  </div>
                </motion.div>
              )}

              {/* Etape 5 */}
              {step >= 5 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border-2 border-pink-200 bg-pink-50">
                  <p className="font-semibold text-pink-800 mb-2">5. À vous de trouver BC !</p>
                  <p className="text-xs text-pink-700 mb-3">Puisque <MathText>{`$BC^2 = ${hypotenuseSquare}$`}</MathText>, quelle est la valeur de <MathText>{'$BC$'}</MathText> ? (Utilisez la touche racine carrée de votre calculatrice si besoin, arrondissez au centième).</p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={userAnswer}
                      onChange={(e) => { setUserAnswer(e.target.value); setFeedback(null); }}
                      placeholder="Ex: 5"
                      className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 ${feedback === 'incorrect' ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-pink-200'}`}
                      disabled={isCompleted}
                    />
                    {!isCompleted ? (
                      <button onClick={checkAnswer} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors">
                        Vérifier
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center justify-center">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                  {feedback === 'incorrect' && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">C'est incorrect. Essayez de calculer la racine carrée de {hypotenuseSquare}.</p>
                  )}
                  {feedback === 'correct' && (
                    <p className="text-xs text-emerald-600 mt-2 font-semibold">Excellent ! <MathText>{`$BC = \\sqrt{${hypotenuseSquare}} \\approx ${hypotenuse.toFixed(2)}$`}</MathText></p>
                  )}
                </motion.div>
              )}

            </div>

            <div className="pt-6 mt-auto">
              {step < 5 && (
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
