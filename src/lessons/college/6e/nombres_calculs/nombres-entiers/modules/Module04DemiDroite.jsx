import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const q = {
  question: <>Clique sur la graduation qui correspond au nombre <strong>10 400</strong>.</>,
  correctAnswer: 4, // Index of the tick (0 = 10000, 1 = 10100... 4 = 10400)
  hints: [
    { type: 'hint', content: "Regarde bien les nombres aux extrémités : ça va de 10 000 à 11 000." },
    { type: 'hint', content: "Il y a 10 espaces entre 10 000 et 11 000. Donc chaque graduation avance de 100." },
    { type: 'solution', content: "Pour placer 10 400, il faut compter 4 graduations après 10 000. La 4ème petite graduation correspond à 10 400." }
  ]
};

export default function Module04DemiDroite() {
  const { prevLink, nextLink } = getNavLinks(4);
  const [selectedTick, setSelectedTick] = useState(null);
  const [hoveredTick, setHoveredTick] = useState(null);

  const adaptiveState = useAdaptiveExercise({
    validate: () => ({ isCorrect: selectedTick === q.correctAnswer }),
    guidanceSteps: q.hints
  });

  const isCompleted = adaptiveState.status === 'correct' || adaptiveState.status === 'solution_viewed';

  const handleTickClick = (tickIndex) => {
    if (isCompleted) return;
    setSelectedTick(tickIndex);
  };

  const startX = 50;
  const spacing = 70;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Demi-droite graduée"
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={nextLink}
    >
      <SectionHeader title="Repérage sur un axe" icon="📏" />

      <div className="prose prose-blue max-w-none mb-8">
        <p className="text-gray-700 text-lg">
          Une demi-droite graduée permet de ranger et de repérer les nombres visuellement. 
          L'écart entre deux graduations régulières s'appelle <strong>le pas</strong>.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-8">{q.question}</h3>
        
        {/* Interactive SVG Number Line */}
        <div className="w-full overflow-x-auto pb-4">
          <svg viewBox="0 0 800 180" className="w-full min-w-[600px] h-auto drop-shadow-sm select-none">
            {/* Main Axis Line */}
            <line x1="20" y1="120" x2="780" y2="120" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            <polygon points="780,115 790,120 780,125" fill="#334155" /> {/* Arrow head */}

            {/* Ticks and interaction areas */}
            {Array.from({ length: 11 }).map((_, i) => {
              const x = startX + i * spacing;
              const isMajor = i === 0 || i === 10;
              const tickHeight = isMajor ? 20 : 12;
              
              return (
                <g 
                  key={i} 
                  className={`cursor-pointer transition-all ${isCompleted ? 'cursor-default' : 'hover:opacity-80'}`}
                  onClick={() => handleTickClick(i)}
                  onMouseEnter={() => !isCompleted && setHoveredTick(i)}
                  onMouseLeave={() => setHoveredTick(null)}
                >
                  {/* Invisible rect to make clicking easier */}
                  <rect x={x - 20} y="40" width="40" height="120" fill="transparent" />
                  
                  {/* Tick line */}
                  <line 
                    x1={x} 
                    y1={120 - tickHeight} 
                    x2={x} 
                    y2={120 + tickHeight} 
                    stroke={selectedTick === i ? '#2563eb' : hoveredTick === i ? '#60a5fa' : '#475569'} 
                    strokeWidth={isMajor ? "3" : "2"} 
                    className="transition-colors duration-300"
                  />
                  
                  {/* Labels for extremities */}
                  {i === 0 && <text x={x} y="160" textAnchor="middle" className="text-lg font-bold fill-slate-800">10 000</text>}
                  {i === 10 && <text x={x} y="160" textAnchor="middle" className="text-lg font-bold fill-slate-800">11 000</text>}

                  {/* Marker Pin for selection */}
                  {selectedTick === i && (
                    <g className="animate-bounce" transform={`translate(${x - 12}, 70)`}>
                      <MapPin size={24} className="text-blue-600 stroke-blue-700 stroke-2" fill="#eff6ff" />
                    </g>
                  )}

                  {/* Hover preview marker */}
                  {hoveredTick === i && selectedTick !== i && !isCompleted && (
                    <g transform={`translate(${x - 12}, 70)`}>
                      <MapPin size={24} className="text-blue-300 stroke-blue-400 stroke-2 opacity-50" fill="transparent" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {selectedTick !== null && (
          <div className="mt-6">
            <ExerciseValidator
              adaptiveState={adaptiveState}
              onSubmit={() => adaptiveState.submitAnswer()}
            />
          </div>
        )}
      </div>

    </ModuleLayout>
  );
}
