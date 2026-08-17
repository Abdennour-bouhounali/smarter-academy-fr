import React, { useState, useEffect } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Play, Check, ChevronRight, Info } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { motion } from 'framer-motion';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module01Decouverte() {
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const handleNext = () => markModuleCompleted('L01');

  const { prevLink, nextLink } = getNavLinks(1);

  // Étape 1 : Identifier, Étape 2 : Carrés, Étape 3 : Curseur, Étape 4 : Aires, Étape 5 : Formule
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Longueurs des côtés de l'angle droit
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);

  // Géométrie pour le SVG
  const scale = 20; // 1 unité = 20px
  const originX = 150;
  const originY = 250;

  // Sommets du triangle
  const ptA = { x: originX, y: originY };
  const ptB = { x: originX + a * scale, y: originY };
  const ptC = { x: originX, y: originY - b * scale };

  // Sommets du carré sur AB (en bas)
  const sqAB = [
    ptA,
    ptB,
    { x: ptB.x, y: ptB.y + a * scale },
    { x: ptA.x, y: ptA.y + a * scale },
  ];

  // Sommets du carré sur AC (à gauche)
  const sqAC = [
    ptA,
    { x: ptA.x - b * scale, y: ptA.y },
    { x: ptC.x - b * scale, y: ptC.y },
    ptC,
  ];

  // Sommets du carré sur BC (en haut à droite)
  // Vecteur BC = (ptC.x - ptB.x, ptC.y - ptB.y) = (-a*scale, -b*scale)
  // Normale sortante (vers le haut droit) = (b*scale, -a*scale)
  const nX = b * scale;
  const nY = -a * scale;
  const sqBC = [
    ptB,
    ptC,
    { x: ptC.x + nX, y: ptC.y + nY },
    { x: ptB.x + nX, y: ptB.y + nY },
  ];

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const hypotenuseSquare = a * a + b * b;
  const hypotenuse = Math.sqrt(hypotenuseSquare);

  return (
    <ModuleLayout
      onNextClick={handleNext}
      {...MODULE_CTX}
      moduleNumber={1}
      moduleTitle="Découverte de Pythagore"
      moduleSubtitle="Observer visuellement la relation entre les carrés construits sur les côtés."
      estimatedTime="8 min"
      prevLink={prevLink}
      nextLink={isCompleted ? nextLink : null}
      xp={50}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Scène interactive */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Zone SVG */}
          <div className="flex-1 p-6 flex justify-center items-center bg-slate-50 min-h-[400px]">
            <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible">
              
              {/* Carré sur AC (si étape >= 2) */}
              {step >= 2 && (
                <motion.polygon
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  points={`${sqAC[0].x},${sqAC[0].y} ${sqAC[1].x},${sqAC[1].y} ${sqAC[2].x},${sqAC[2].y} ${sqAC[3].x},${sqAC[3].y}`}
                  fill="#E0E7FF"
                  stroke="#4F46E5"
                  strokeWidth="2"
                />
              )}
              {/* Carré sur AB (si étape >= 2) */}
              {step >= 2 && (
                <motion.polygon
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  points={`${sqAB[0].x},${sqAB[0].y} ${sqAB[1].x},${sqAB[1].y} ${sqAB[2].x},${sqAB[2].y} ${sqAB[3].x},${sqAB[3].y}`}
                  fill="#DBEAFE"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
              )}
              {/* Carré sur BC (si étape >= 2) */}
              {step >= 2 && (
                <motion.polygon
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  points={`${sqBC[0].x},${sqBC[0].y} ${sqBC[1].x},${sqBC[1].y} ${sqBC[2].x},${sqBC[2].y} ${sqBC[3].x},${sqBC[3].y}`}
                  fill="#FCE7F3"
                  stroke="#DB2777"
                  strokeWidth="2"
                />
              )}

              {/* Triangle rectangle */}
              <polygon
                points={`${ptA.x},${ptA.y} ${ptB.x},${ptB.y} ${ptC.x},${ptC.y}`}
                fill="#F8FAFC"
                stroke="#0F172A"
                strokeWidth="3"
                className="transition-all duration-300"
              />

              {/* Symbole d'angle droit */}
              <polyline
                points={`${ptA.x},${ptA.y - 15} ${ptA.x + 15},${ptA.y - 15} ${ptA.x + 15},${ptA.y}`}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
              />

              {/* Points A, B, C */}
              <circle cx={ptA.x} cy={ptA.y} r="4" fill="#0F172A" />
              <circle cx={ptB.x} cy={ptB.y} r="4" fill="#0F172A" />
              <circle cx={ptC.x} cy={ptC.y} r="4" fill="#0F172A" />
              <text x={ptA.x - 15} y={ptA.y + 15} fontSize="14" fontWeight="bold">A</text>
              <text x={ptB.x + 10} y={ptB.y + 15} fontSize="14" fontWeight="bold">B</text>
              <text x={ptC.x - 15} y={ptC.y - 10} fontSize="14" fontWeight="bold">C</text>

              {/* Longueurs si étape >= 3 */}
              {step >= 3 && (
                <>
                  <text x={ptA.x + (a * scale) / 2} y={ptA.y - 10} fontSize="14" fill="#2563EB" fontWeight="bold" textAnchor="middle">{a}</text>
                  <text x={ptA.x + 10} y={ptA.y - (b * scale) / 2} fontSize="14" fill="#4F46E5" fontWeight="bold">{b}</text>
                </>
              )}

              {/* Aires si étape >= 4 */}
              {step >= 4 && (
                <>
                  <text x={ptA.x + (a * scale) / 2} y={ptA.y + (a * scale) / 2} fontSize="16" fill="#1D4ED8" fontWeight="bold" textAnchor="middle">Aire = {a * a}</text>
                  <text x={ptA.x - (b * scale) / 2} y={ptA.y - (b * scale) / 2} fontSize="16" fill="#3730A3" fontWeight="bold" textAnchor="middle">Aire = {b * b}</text>
                  <text x={ptB.x + nX / 2 - 20} y={ptB.y + nY / 2 - 20} fontSize="16" fill="#BE185D" fontWeight="bold" textAnchor="middle">Aire = {hypotenuseSquare}</text>
                </>
              )}
            </svg>
          </div>

          {/* Panneau de contrôle */}
          <div className="w-full md:w-80 p-6 flex flex-col justify-between border-l border-slate-200">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">Observation</h2>
              
              <div className="space-y-4 text-sm text-slate-600">
                {step === 1 && (
                  <p>Voici un triangle <MathText>{'$ABC$'}</MathText> rectangle en <MathText>{'$A$'}</MathText>. Remarquez le petit symbole rouge qui indique l'angle droit.</p>
                )}
                {step === 2 && (
                  <p>Construisons maintenant un carré sur <strong>chacun de ses trois côtés</strong>.</p>
                )}
                {step >= 3 && (
                  <div className="space-y-4">
                    {step === 3 && <p>Faites varier la longueur des deux côtés formant l'angle droit à l'aide des curseurs ci-dessous. Les carrés s'adaptent automatiquement.</p>}
                    <div className="space-y-2">
                      <label className="flex justify-between font-semibold text-slate-700">
                        <span>Côté AB (<MathText>{'$a$'}</MathText>)</span>
                        <span className="text-blue-600">{a}</span>
                      </label>
                      <input type="range" min="2" max="6" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex justify-between font-semibold text-slate-700">
                        <span>Côté AC (<MathText>{'$b$'}</MathText>)</span>
                        <span className="text-indigo-600">{b}</span>
                      </label>
                      <input type="range" min="2" max="6" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                  </div>
                )}
                {step >= 4 && (
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <p>Observons les aires des trois carrés :</p>
                    <ul className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <li>Petit : <MathText>{`$${a}^2 = ${a * a}$`}</MathText></li>
                      <li>Moyen : <MathText>{`$${b}^2 = ${b * b}$`}</MathText></li>
                      <li className="font-bold text-pink-700 border-t pt-2 mt-2">
                        Grand : <MathText>{`$${hypotenuseSquare}$`}</MathText>
                      </li>
                    </ul>
                    {step === 4 && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex gap-2 text-amber-800 font-medium">
                        <Info size={20} className="shrink-0 text-amber-600" />
                        <p>Remarquez-vous une relation entre ces trois aires ? <br/> <MathText>{`$${a * a} + ${b * b} = ${a * a + b * b}$`}</MathText></p>
                      </div>
                    )}
                  </div>
                )}
                {step >= 5 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <p>Le grand carré correspond toujours à <strong>la somme</strong> des deux autres carrés !</p>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center shadow-sm">
                      <h3 className="font-bold text-blue-800 mb-2">L'égalité de Pythagore</h3>
                      <div className="text-xl">
                        <MathText>{'$AB^2 + AC^2 = BC^2$'}</MathText>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">Le grand côté <MathText>{'$BC$'}</MathText> est appelé l'<strong>hypoténuse</strong>.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              {!isCompleted ? (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {step === 1 && "Afficher les carrés"}
                  {step === 2 && "Modifier les longueurs"}
                  {step === 3 && "Afficher les aires"}
                  {step === 4 && "Voir la conclusion"}
                  {step === 5 && "J'ai compris !"}
                  {step < 5 && <ChevronRight size={18} />}
                  {step === 5 && <Check size={18} />}
                </button>
              ) : (
                <div className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-200">
                  <Check size={18} /> Module complété
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
