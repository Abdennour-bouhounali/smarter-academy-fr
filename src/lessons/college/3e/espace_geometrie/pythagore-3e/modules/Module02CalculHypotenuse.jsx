import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';
import { compareMathExpressions } from '../../../../../common/utils/mathComparison';
import { motion } from 'framer-motion';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { isMissingSquareRoot } from '../../../../../common/utils/errorClassifiers';
import AdaptiveFeedback from '../../../../../common/components/AdaptiveFeedback';
import GuidedSolution from '../../../../../common/components/GuidedSolution';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module02CalculHypotenuse() {
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const handleNext = () => markModuleCompleted('L02');

  const { prevLink, nextLink } = getNavLinks(2);

  // Étape 1 : Identifier, Étape 2 : Formule, Étape 3 : Substitution, Étape 4 : Carrés, Étape 5 : Racine
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const [a, setA] = useState(3);
  const [b, setB] = useState(4);

  const scale = 25;
  const ptA = { x: 50, y: 250 };
  const ptB = { x: 50 + a * scale, y: 250 };
  const ptC = { x: 50, y: 250 - b * scale };

  const hypotenuseSquare = a * a + b * b;
  const hypotenuse = Math.sqrt(hypotenuseSquare);
  
  const validateAnswer = (val) => {
    const isEquivalent = compareMathExpressions(val, hypotenuse.toString());
    const parsedVal = parseFloat(val.replace(',', '.'));
    const isApprox = !isNaN(parsedVal) && Math.abs(parsedVal - hypotenuse) < 0.01;
    return isEquivalent || isApprox;
  };

  const {
    value: userAnswer,
    setValue: setUserAnswer,
    status: answerStatus,
    feedback: adaptiveFeedback,
    currentGuidance,
    submitAnswer,
    requestHint,
    hasMoreHints,
    isSolutionRevealed,
    reset: resetAdaptive
  } = useAdaptiveExercise({
    validate: validateAnswer,
    detectError: (val) => isMissingSquareRoot(val, hypotenuse),
    guidanceSteps: [
      { level: 1, type: 'encouragement', content: "Vérifiez votre calcul. Avez-vous pensé à la racine carrée ?" },
      { level: 2, type: 'hint', content: "L'égalité donne $BC^2 = " + hypotenuseSquare + "$. Vous devez trouver $BC$ et non $BC^2$." },
      { level: 3, type: 'solution', content: "$BC = \\sqrt{" + hypotenuseSquare + "} \\approx " + hypotenuse.toFixed(2) + "$" }
    ],
    onSuccess: () => setIsCompleted(true)
  });

  const checkAnswer = () => submitAnswer(userAnswer);

  const generateNewExercise = () => {
    const newA = Math.floor(Math.random() * 6) + 3; // 3 to 8
    const newB = Math.floor(Math.random() * 6) + 3; // 3 to 8
    setA(newA);
    setB(newB);
    setIsCompleted(false);
    resetAdaptive();
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  return (
    <ModuleLayout
      onNextClick={handleNext}
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
                <input type="range" min="3" max="8" value={a} onChange={(e) => { setA(Number(e.target.value)); setStep(1); setIsCompleted(false); resetAdaptive(); }} className="w-24 accent-blue-600" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Côté AC</label>
                <input type="range" min="3" max="8" value={b} onChange={(e) => { setB(Number(e.target.value)); setStep(1); setIsCompleted(false); resetAdaptive(); }} className="w-24 accent-indigo-600" />
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
                    <MathInput 
                      value={userAnswer}
                      onChange={(val) => { setUserAnswer(val); }}
                      onCommit={checkAnswer}
                      placeholder="Ex: 5"
                      disabled={isCompleted || isSolutionRevealed}
                    />
                    {!isCompleted && !isSolutionRevealed ? (
                      <button onClick={checkAnswer} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors ml-2">
                        Vérifier
                      </button>
                    ) : isCompleted ? (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center justify-center">
                        <Check size={18} />
                      </div>
                    ) : null}
                  </div>
                  
                  <AdaptiveFeedback 
                    status={answerStatus} 
                    feedback={adaptiveFeedback}
                    currentGuidance={currentGuidance}
                    onRequestHint={requestHint}
                    hasMoreHints={hasMoreHints}
                  />

                  {isSolutionRevealed && (
                    <GuidedSolution 
                      steps={[
                        `On sait que le triangle est rectangle en $A$, donc son hypoténuse est le côté $BC$.`,
                        `D'après le théorème de Pythagore : $BC^2 = AB^2 + AC^2$`,
                        `$BC^2 = ${a}^2 + ${b}^2 = ${hypotenuseSquare}$`,
                        `$BC = \\sqrt{${hypotenuseSquare}} \\approx ${hypotenuse.toFixed(2)}$`
                      ]}
                      onRetry={generateNewExercise}
                    />
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
