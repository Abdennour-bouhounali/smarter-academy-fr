import React, { useState } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConceptCard from '../../../../../common/components/ConceptCard';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';

const generateExercise = (difficulty) => {
  const isHundredths = difficulty > 1;
  const startNum = Math.floor(Math.random() * 50);
  const endNum = startNum + 1;
  
  const tickIndex = Math.floor(Math.random() * 9) + 1; // 1 to 9
  
  if (isHundredths) {
    const baseTenth = Math.floor(Math.random() * 9);
    const startDecimal = startNum + baseTenth * 0.1;
    const endDecimal = startNum + (baseTenth + 1) * 0.1;
    const targetStr = (startDecimal + tickIndex * 0.01).toFixed(2).replace('.', ',');
    
    return {
      startText: startDecimal.toFixed(1).replace('.', ','),
      endText: endDecimal.toFixed(1).replace('.', ','),
      targetStr,
      tickIndex
    };
  } else {
    const targetStr = (startNum + tickIndex * 0.1).toFixed(1).replace('.', ',');
    return {
      startText: String(startNum),
      endText: String(endNum),
      targetStr,
      tickIndex
    };
  }
};

export default function Module03Axe() {
  const { prevLink, nextLink } = getNavLinks(3);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(() => generateExercise(1));
  const [selectedTick, setSelectedTick] = useState(null);
  const [hoveredTick, setHoveredTick] = useState(null);

  const adaptiveState = useAdaptiveExercise({
    validate: () => ({ isCorrect: selectedTick === currentExercise.tickIndex }),
    guidanceSteps: [
      { type: 'hint', content: "Compte le nombre de graduations entre les deux nombres écrits pour connaître la valeur d'une petite graduation." },
      { type: 'solution', content: "La bonne graduation était la numéro " + currentExercise.tickIndex + "." }
    ],
    onSuccess: () => {}
  });

  const handleTickClick = (tickIndex) => {
    if (adaptiveState.status === 'correct') return;
    setSelectedTick(tickIndex);
  };

  const handleNext = () => {
    const nextIndex = exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    setCurrentExercise(generateExercise(nextIndex > 0 ? 2 : 1));
    setSelectedTick(null);
    adaptiveState.reset();
  };

  const isModuleComplete = adaptiveState.status === 'correct' && exerciseIndex >= 2;

  const startX = 60;
  const spacing = 68; 

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Repérage sur un axe"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={isModuleComplete ? nextLink : undefined}
      isCompleted={isModuleComplete}
    >
      <div className="max-w-4xl mx-auto space-y-8">

        <ConceptCard label="Stratégie" emoji="🧭" color="indigo">
          <p className="font-bold text-lg text-indigo-900 mb-2">Comment trouver la valeur d'une petite graduation entre 6 et 7 ?</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-indigo-800">
            <li>Regarde les deux grands nombres de chaque côté (ex: 6 et 7).</li>
            <li>Compte le nombre d'espaces entre eux.</li>
            <li>S'il y a 10 espaces pour faire 1 unité entière, chaque petit trait vaut un <strong>dixième (0,1)</strong>.</li>
          </ul>
        </ConceptCard>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="text-center mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission {exerciseIndex + 1} / 3</span>
            <h2 className="text-xl font-bold text-slate-800 mt-2">
              Clique sur la graduation qui correspond à 
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg ml-2 font-space">{currentExercise.targetStr}</span>
            </h2>
          </div>
          
          <div className="w-full overflow-x-auto pb-8">
            <svg viewBox="0 0 800 180" className="w-full min-w-[600px] h-auto drop-shadow-sm select-none">
              <line x1="20" y1="120" x2="780" y2="120" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <polygon points="780,115 790,120 780,125" fill="#334155" />

              {Array.from({ length: 11 }).map((_, i) => {
                const x = startX + i * spacing;
                const isMajor = i === 0 || i === 10;
                const isMid = i === 5;
                const tickHeight = isMajor ? 20 : isMid ? 15 : 10;

                return (
                  <g
                    key={i}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => handleTickClick(i)}
                    onMouseEnter={() => setHoveredTick(i)}
                    onMouseLeave={() => setHoveredTick(null)}
                  >
                    <rect x={x - 20} y="40" width="40" height="120" fill="transparent" />

                    <line
                      x1={x}
                      y1={120 - tickHeight}
                      x2={x}
                      y2={120 + tickHeight}
                      stroke={selectedTick === i ? '#2563eb' : hoveredTick === i ? '#60a5fa' : '#475569'}
                      strokeWidth={isMajor ? "3" : "2"}
                      className="transition-colors duration-300"
                    />

                    {i === 0 && <text x={x} y="160" textAnchor="middle" className="text-xl font-bold font-space fill-slate-800">{currentExercise.startText}</text>}
                    {i === 10 && <text x={x} y="160" textAnchor="middle" className="text-xl font-bold font-space fill-slate-800">{currentExercise.endText}</text>}

                    {selectedTick === i && (
                      <g transform={`translate(${x - 12}, 70)`}>
                        <g className="animate-bounce">
                          <MapPin size={24} className="text-blue-600 stroke-blue-700 stroke-2" fill="#eff6ff" />
                        </g>
                      </g>
                    )}

                    {hoveredTick === i && selectedTick !== i && (
                      <g transform={`translate(${x - 12}, 70)`}>
                        <MapPin size={24} className="text-blue-300 stroke-blue-400 stroke-2 opacity-50" fill="transparent" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="max-w-sm mx-auto">
            {!isModuleComplete ? (
              <div className="flex flex-col gap-4">
                <ExerciseValidator 
                  adaptiveState={adaptiveState}
                  onSubmit={() => adaptiveState.submitAnswer()}
                  disabled={selectedTick === null}
                />
                {adaptiveState.status === 'correct' && exerciseIndex < 2 && (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors animate-pulse mt-4"
                  >
                    Suivant ➔
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6 mt-8">
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
                  <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">Excellent !</h3>
                  <p className="text-emerald-700 mb-6">Tu sais te repérer sur un axe gradué décimal.</p>
                </div>

                <KeyTakeaway color="blue">
                  <p className="font-bold text-lg mb-2">À retenir</p>
                  <li>Regarde toujours <strong>le point de départ</strong> et <strong>le point d'arrivée</strong> d'un grand intervalle.</li>
                  <li>Si un écart de 1 unité est coupé en 10, chaque petit trait vaut <strong>1 dixième (0,1)</strong>.</li>
                  <li>Si un écart de 1 dixième est coupé en 10, chaque petit trait vaut <strong>1 centième (0,01)</strong>.</li>
                </KeyTakeaway>
              </div>
            )}
          </div>
        </div>

      </div>
    </ModuleLayout>
  );
}
