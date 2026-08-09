import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { motion } from 'framer-motion';

export default function Module06Mission() {
  const { prevLink, nextLink } = getNavLinks(6);

  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Paramètres physiques
  const ladderLength = 5;
  const distWall = 3;
  const expectedHeight = 4; // sqrt(25 - 9)

  // Simulation visuelle
  const scale = 40; // pixels par mètre
  const wallX = 50;
  const groundY = 250;
  const ladderEndX = wallX + distWall * scale;
  const ladderEndY = groundY - expectedHeight * scale;

  const checkAnswer = () => {
    const val = parseFloat(userAnswer);
    if (Math.abs(val - expectedHeight) < 0.01) {
      setFeedback('correct');
      setTimeout(() => {
        setIsCompleted(true);
      }, 1000);
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleNumber={6}
      moduleTitle="Mission : L'échelle"
      moduleSubtitle="Appliquer le théorème de Pythagore à une situation réelle."
      estimatedTime="15 min"
      prevLink={prevLink}
      nextLink={isCompleted ? nextLink : null}
      xp={150}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* En-tête du problème */}
        <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200">
          <h2 className="text-xl font-extrabold text-amber-800 mb-2">Problème à résoudre</h2>
          <p className="text-amber-900 font-medium text-lg">
            Une échelle mesure <strong>5 m</strong> de long. Son pied est posé sur le sol à <strong>3 m</strong> du mur. 
            À quelle hauteur l'échelle touche-t-elle le mur ?
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Zone Visuelle */}
          <div className="flex-1 p-6 flex flex-col items-center justify-end bg-blue-50 relative min-h-[350px]">
            {/* Ciel et sol */}
            <div className="absolute bottom-0 w-full h-8 bg-green-500"></div>
            
            <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible absolute bottom-8 left-1/2 -translate-x-1/2">
              {/* Le mur (vertical) */}
              <line x1={wallX} y1="0" x2={wallX} y2={groundY} stroke="#94A3B8" strokeWidth="8" />
              {/* Le sol (horizontal) */}
              <line x1="0" y1={groundY} x2="300" y2={groundY} stroke="#22C55E" strokeWidth="4" />
              
              {/* L'angle droit du mur */}
              <polyline points={`${wallX},${groundY-15} ${wallX+15},${groundY-15} ${wallX+15},${groundY}`} fill="none" stroke="#EF4444" strokeWidth="2" />

              {/* L'échelle */}
              <line x1={ladderEndX} y1={groundY} x2={wallX} y2={ladderEndY} stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
              {/* Barreaux de l'échelle (décoratif, approximatif) */}
              {[1,2,3,4,5,6].map(i => {
                const frac = i / 7;
                const lx1 = ladderEndX - frac * (ladderEndX - wallX);
                const ly1 = groundY - frac * (groundY - ladderEndY);
                return <circle key={i} cx={lx1} cy={ly1} r="3" fill="#78350F" />
              })}

              {/* Annotations */}
              <text x={wallX + (distWall*scale)/2} y={groundY + 20} fontSize="14" fontWeight="bold" fill="#15803D" textAnchor="middle">Sol = 3 m</text>
              
              <text x={wallX + (distWall*scale)/2 + 20} y={groundY - (expectedHeight*scale)/2} fontSize="14" fontWeight="bold" fill="#B45309" textAnchor="middle" transform={`rotate(-53, ${wallX + (distWall*scale)/2}, ${groundY - (expectedHeight*scale)/2})`}>
                Échelle = 5 m
              </text>

              <text x={wallX - 20} y={groundY - (expectedHeight*scale)/2} fontSize="16" fontWeight="bold" fill="#334155" textAnchor="end">
                Mur = ?
              </text>
            </svg>
          </div>

          {/* Panneau de résolution */}
          <div className="w-full md:w-[450px] p-6 flex flex-col border-l border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Résolution pas-à-pas</h2>
            
            <div className="space-y-4 text-sm text-slate-600 flex-1 overflow-y-auto pr-2">
              
              {/* 1. Identification */}
              <div className={`p-3 rounded-lg border-2 ${step === 1 ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                <p className="font-bold text-slate-700 mb-2">1. Modélisation géométrique</p>
                <p>Le mur, le sol et l'échelle forment un triangle rectangle.</p>
                {step === 1 && <button onClick={() => setStep(2)} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded font-bold">Suite</button>}
              </div>

              {/* 2. Formule */}
              {step >= 2 && (
                <div className={`p-3 rounded-lg border-2 ${step === 2 ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                  <p className="font-bold text-slate-700 mb-2">2. Égalité de Pythagore</p>
                  <p>L'hypoténuse est l'échelle (le côté opposé à l'angle droit).</p>
                  <div className="text-center mt-2"><MathText>{`$Mur^2 + Sol^2 = Échelle^2$`}</MathText></div>
                  {step === 2 && <button onClick={() => setStep(3)} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded font-bold">Suite</button>}
                </div>
              )}

              {/* 3. Remplacement */}
              {step >= 3 && (
                <div className={`p-3 rounded-lg border-2 ${step === 3 ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                  <p className="font-bold text-slate-700 mb-2">3. Quel côté cherche-t-on ?</p>
                  <p>On cherche un petit côté (le mur), il faut donc <strong>soustraire</strong> les carrés :</p>
                  <div className="text-center mt-2 font-bold text-slate-700">
                    <MathText>{`$Mur^2 = 5^2 - 3^2$`}</MathText>
                  </div>
                  {step === 3 && <button onClick={() => setStep(4)} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded font-bold">Suite</button>}
                </div>
              )}

              {/* 4. Calcul final */}
              {step >= 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg border-2 border-emerald-300 bg-emerald-50">
                  <p className="font-bold text-emerald-800 mb-2">4. À vous de calculer !</p>
                  <p className="mb-3 text-emerald-700">Calculez le carré manquant, puis utilisez la racine carrée pour trouver la hauteur exacte en mètres.</p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={userAnswer}
                      onChange={(e) => { setUserAnswer(e.target.value); setFeedback(null); }}
                      placeholder="Ex: 2.5"
                      className={`flex-1 p-2 border rounded-lg font-bold text-lg text-center focus:outline-none focus:ring-2 ${feedback === 'incorrect' ? 'border-red-400 focus:ring-red-200' : 'border-emerald-300 focus:ring-emerald-200'}`}
                      disabled={isCompleted}
                    />
                    {!isCompleted ? (
                      <button onClick={checkAnswer} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">
                        Vérifier
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center justify-center">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                  {feedback === 'incorrect' && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">Erreur. Calculez 25 - 9, puis prenez la racine carrée du résultat.</p>
                  )}
                  {feedback === 'correct' && (
                    <p className="text-sm text-emerald-700 mt-3 font-bold">
                      Bravo ! <br/><MathText>{`$Mur^2 = 25 - 9 = 16$`}</MathText><br/>Donc l'échelle atteint le mur à <MathText>{`$\\sqrt{16} = 4$`}</MathText> mètres de hauteur.
                    </p>
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
