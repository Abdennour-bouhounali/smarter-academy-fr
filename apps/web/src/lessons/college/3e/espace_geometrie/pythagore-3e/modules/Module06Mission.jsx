import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Check, ChevronRight } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';
import { compareMathExpressions } from '@smarter-academy/core';
import { motion } from 'framer-motion';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module06Mission() {
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const handleNext = () => markModuleCompleted('L06');

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

  // Calculs pour les lignes de cote (dimensions)
  const L = ladderLength * scale;
  const ux = (ladderEndX - wallX) / L;
  const uy = (groundY - ladderEndY) / L;
  const px = uy;
  const py = -ux;
  const offsetD = 35;

  const checkAnswer = () => {
    const isEquivalent = compareMathExpressions(userAnswer, expectedHeight.toString());
    const val = parseFloat(userAnswer.replace(',', '.'));
    const isApprox = !isNaN(val) && Math.abs(val - expectedHeight) < 0.01;
    const forgotSqrt = !isNaN(val) && Math.abs(val - 16) < 0.01;

    if (isEquivalent || isApprox) {
      setFeedback('correct');
      setIsCompleted(true);
    } else if (forgotSqrt) {
      setFeedback('forgot_sqrt');
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <ModuleLayout
      onNextClick={handleNext}
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
              <defs>
                <linearGradient id="wallGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#CBD5E1"/>
                  <stop offset="100%" stopColor="#94A3B8"/>
                </linearGradient>
                <linearGradient id="groundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E"/>
                  <stop offset="100%" stopColor="#166534"/>
                </linearGradient>
              </defs>

              {/* Le mur */}
              <rect x="0" y="0" width={wallX} height={groundY} fill="url(#wallGradient)" stroke="#64748B" strokeWidth="2" />
              {/* Le sol */}
              <rect x="0" y={groundY} width="300" height={300 - groundY} fill="url(#groundGradient)" />
              
              {/* L'angle droit du mur */}
              <polyline points={`${wallX},${groundY-15} ${wallX+15},${groundY-15} ${wallX+15},${groundY}`} fill="none" stroke="#EF4444" strokeWidth="2" />

              {/* L'échelle (avec deux montants) */}
              <g stroke="#92400E" strokeLinecap="round">
                <line x1={ladderEndX + 4} y1={groundY - 3} x2={wallX + 4} y2={ladderEndY - 3} strokeWidth="4" />
                <line x1={ladderEndX - 4} y1={groundY + 3} x2={wallX - 4} y2={ladderEndY + 3} strokeWidth="4" />
                {[1,2,3,4,5,6,7,8].map(i => {
                  const frac = i / 9;
                  const bx1 = ladderEndX + 4 - frac * (ladderEndX - wallX);
                  const by1 = groundY - 3 - frac * (groundY - ladderEndY);
                  const bx2 = ladderEndX - 4 - frac * (ladderEndX - wallX);
                  const by2 = groundY + 3 - frac * (groundY - ladderEndY);
                  return <line key={i} x1={bx1} y1={by1} x2={bx2} y2={by2} strokeWidth="3" />
                })}
              </g>

              {/* Lignes de cote et annotations */}
              
              {/* Cote: Sol */}
              <g stroke="#065F46" strokeWidth="2">
                <line x1={wallX} y1={groundY + 30} x2={ladderEndX} y2={groundY + 30} />
                <line x1={wallX} y1={groundY + 20} x2={wallX} y2={groundY + 40} />
                <line x1={ladderEndX} y1={groundY + 20} x2={ladderEndX} y2={groundY + 40} />
              </g>
              <rect x={wallX + (ladderEndX - wallX)/2 - 35} y={groundY + 21} width="70" height="18" fill="#22C55E" opacity="0.8" rx="4" />
              <text x={wallX + (distWall*scale)/2} y={groundY + 35} fontSize="14" fontWeight="bold" fill="#064E3B" textAnchor="middle">Sol = 3 m</text>
              
              {/* Cote: Échelle */}
              <g stroke="#78350F" strokeWidth="2">
                {/* Ticks */}
                <line x1={wallX + px*10} y1={ladderEndY + py*10} x2={wallX + px*(offsetD+10)} y2={ladderEndY + py*(offsetD+10)} />
                <line x1={ladderEndX + px*10} y1={groundY + py*10} x2={ladderEndX + px*(offsetD+10)} y2={groundY + py*(offsetD+10)} />
                {/* Ligne (coupée au milieu pour le texte) */}
                <line x1={wallX + px*offsetD} y1={ladderEndY + py*offsetD} x2={wallX + ux*(L/2 - 45) + px*offsetD} y2={ladderEndY + uy*(L/2 - 45) + py*offsetD} />
                <line x1={wallX + ux*(L/2 + 45) + px*offsetD} y1={ladderEndY + uy*(L/2 + 45) + py*offsetD} x2={ladderEndX + px*offsetD} y2={groundY + py*offsetD} />
              </g>
              <text 
                x={wallX + ux*(L/2) + px*offsetD} 
                y={ladderEndY + uy*(L/2) + py*offsetD} 
                fontSize="14" fontWeight="bold" fill="#78350F" textAnchor="middle" dy="0.35em"
                transform={`rotate(53.13, ${wallX + ux*(L/2) + px*offsetD}, ${ladderEndY + uy*(L/2) + py*offsetD})`}
              >
                Échelle = 5 m
              </text>

              {/* Cote: Mur */}
              <g stroke="#1E293B" strokeWidth="2">
                {/* Ticks */}
                <line x1={15} y1={groundY} x2={35} y2={groundY} />
                <line x1={15} y1={ladderEndY} x2={35} y2={ladderEndY} />
                {/* Ligne (coupée au milieu pour le texte) */}
                <line x1={25} y1={groundY} x2={25} y2={groundY - (expectedHeight*scale)/2 + 20} />
                <line x1={25} y1={groundY - (expectedHeight*scale)/2 - 20} x2={25} y2={ladderEndY} />
              </g>
              <text x={25} y={groundY - (expectedHeight*scale)/2} fontSize="16" fontWeight="bold" fill="#1E293B" textAnchor="middle" dy="0.35em">
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
                  <div className="text-center mt-2"><MathText>{`$Mur^2 + Sol^2 = Echelle^2$`}</MathText></div>
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
                    <MathInput 
                      value={userAnswer}
                      onChange={(val) => { setUserAnswer(val); setFeedback(null); }}
                      onCommit={checkAnswer}
                      placeholder="Ex: 2.5"
                      disabled={isCompleted}
                    />
                    {!isCompleted ? (
                      <button onClick={checkAnswer} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors ml-2">
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
                  {feedback === 'forgot_sqrt' && (
                    <p className="text-sm text-amber-600 mt-2 font-bold border border-amber-200 bg-amber-50 p-2 rounded">Vous avez trouvé le carré du mur (16), mais n'oubliez pas d'utiliser la racine carrée pour trouver la hauteur finale !</p>
                  )}
                  {feedback === 'correct' && (
                    <p className="text-sm text-emerald-700 mt-3 font-bold border border-emerald-200 bg-emerald-50 p-2 rounded">
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
