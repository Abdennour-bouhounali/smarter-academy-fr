import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Sparkles, Info, ArrowDown } from 'lucide-react';
import ConceptCard from '../../../../../common/components/ConceptCard';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import croissantSvg from '../assets/croissant.svg';

const MISSIONS = [
  {
    type: 'pourquoi',
    title: 'Pourquoi utiliser des virgules ?',
    instruction: "Le boulanger a écrit le prix des croissants sous forme de fractions : 2 + 4/10 + 5/100 €. Saisis cette valeur avec les compteurs pour voir comment on l'écrit dans la vie de tous les jours !",
    targetValue: 245,
    showSlider: false
  },
  {
    type: 'decouverte',
    title: 'Découverte',
    instruction: "Ajoute 14 dixièmes avec les boutons [+]. Observe comment ils se transforment en passant la dizaine !",
    targetValue: 140, // 1.40
    showSlider: false
  },
  {
    type: 'frac2dec',
    title: 'De la fraction au décimal',
    instruction: "Construis la fraction 125/100 (soit 1 unité, 2 dixièmes, 5 centièmes).",
    targetValue: 125, // 1.25
    showSlider: false
  },
  {
    type: 'dec2frac',
    title: 'Du décimal à la fraction',
    instruction: "Construis le nombre 0,34 pour découvrir sa fraction.",
    targetValue: 34, // 0.34
    showSlider: false
  },
  {
    type: 'axe',
    title: 'Sur la droite graduée',
    instruction: "Déplace le curseur pour placer le point sur 0,7 (c'est-à-dire 7/10).",
    targetValue: 70, // 0.70
    showSlider: true
  }
];

export default function Module01Fractions() {
  const { prevLink, nextLink } = getNavLinks(1);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const currentMission = MISSIONS[exerciseIndex];
  
  // value in hundredths (e.g. 247 = 2.47)
  const [value, setValue] = useState(0);

  const adaptiveState = useAdaptiveExercise({
    validate: () => ({ isCorrect: value === currentMission.targetValue }),
    guidanceSteps: [
      { type: 'hint', content: "Regarde bien la consigne et ajuste les compteurs pour atteindre la valeur demandée." },
      { type: 'hint', content: "N'oublie pas que 1 unité = 10 dixièmes = 100 centièmes." },
      { type: 'solution', content: "Il fallait construire exactement la valeur demandée." }
    ],
    onSuccess: () => {}
  });

  const units = Math.floor(value / 100);
  const tenths = Math.floor((value % 100) / 10);
  const hundredths = value % 10;

  const handleAdd = (amount) => {
    if (adaptiveState.status === 'correct') return;
    setValue(v => v + amount);
  };

  const handleSub = (amount) => {
    if (adaptiveState.status === 'correct') return;
    setValue(v => v >= amount ? v - amount : v);
  };

  const handleNext = () => {
    const nextIndex = exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    setValue(0);
    adaptiveState.reset();
  };

  const isModuleComplete = adaptiveState.status === 'correct' && exerciseIndex >= MISSIONS.length - 1;

  // Formatting helpers
  const textParts = [];
  if (units > 0) textParts.push(`${units} unité${units > 1 ? 's' : ''}`);
  if (tenths > 0) textParts.push(`${tenths} dixième${tenths > 1 ? 's' : ''}`);
  if (hundredths > 0) textParts.push(`${hundredths} centième${hundredths > 1 ? 's' : ''}`);
  const textLine1 = textParts.length > 0 ? textParts.join(' + ') : '0 unité';

  const fractionParts = [];
  if (units > 0) fractionParts.push(`${units}`);
  if (tenths > 0) fractionParts.push(`${tenths}/10`);
  if (hundredths > 0) fractionParts.push(`${hundredths}/100`);
  const textLine2 = fractionParts.length > 0 ? fractionParts.join(' + ') : '0';

  const decimalValue = (value / 100).toFixed(2).replace('.', ',').replace(/,00$/, '').replace(/(\d)0$/, '$1');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Fractions et virgules"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={isModuleComplete ? nextLink : undefined}
      isCompleted={isModuleComplete}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          
          <div className="text-center mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission {exerciseIndex + 1} / 4 : {currentMission.title}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 max-w-2xl mx-auto">
              {currentMission.instruction}
            </h2>
            {currentMission.type === 'pourquoi' && (
              <div className="flex flex-col items-center justify-center mt-10 gap-6">
                
                <div className="relative bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 flex items-center gap-6 shadow-sm">
                  {/* Croissant SVG */}
                  <img src={croissantSvg} alt="Croissant" className="w-24 h-auto" />
                  
                  {/* Ticket Container */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Confusing Sign */}
                    <div className="bg-red-100 border-2 border-red-300 text-red-600 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 rotate-3">
                      <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm font-bold uppercase tracking-tight">Illisible & Compliqué !</span>
                    </div>

                    <div className="bg-white px-5 py-3 rounded-xl border border-amber-200 shadow-sm relative flex items-center">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-amber-200 rotate-45"></div>
                      <span className="font-space font-bold text-2xl text-slate-800 relative z-10 whitespace-nowrap">
                        <span className="text-blue-600">2</span> + <span className="text-emerald-600">4/10</span> + <span className="text-amber-500">5/100</span> €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center text-blue-600 font-bold mt-4 animate-pulse">
                  <p className="mb-2">Utilise les compteurs pour l'écrire plus simplement avec une virgule 👇</p>
                  <ArrowDown className="w-6 h-6" />
                </div>
              </div>
            )}
          </div>

          {!currentMission.showSlider ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
              {/* Counter Unités */}
              <div className="flex flex-col items-center bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                <div className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider">Unités</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleSub(100)} disabled={value < 100} className="w-10 h-10 rounded-full bg-white border border-blue-300 text-blue-600 font-bold hover:bg-blue-100 disabled:opacity-50 text-xl">-</button>
                  <div className="text-4xl font-space font-bold w-12 text-center text-blue-900">{units}</div>
                  <button onClick={() => handleAdd(100)} className="w-10 h-10 rounded-full bg-white border border-blue-300 text-blue-600 font-bold hover:bg-blue-100 text-xl">+</button>
                </div>
              </div>

              {/* Counter Dixièmes */}
              <div className="flex flex-col items-center bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200">
                <div className="text-sm font-bold text-emerald-600 mb-3 uppercase tracking-wider">Dixièmes</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleSub(10)} disabled={value < 10} className="w-10 h-10 rounded-full bg-white border border-emerald-300 text-emerald-600 font-bold hover:bg-emerald-100 disabled:opacity-50 text-xl">-</button>
                  <div className="text-4xl font-space font-bold w-12 text-center text-emerald-900">{tenths}</div>
                  <button onClick={() => handleAdd(10)} className="w-10 h-10 rounded-full bg-white border border-emerald-300 text-emerald-600 font-bold hover:bg-emerald-100 text-xl">+</button>
                </div>
              </div>

              {/* Counter Centièmes */}
              <div className="flex flex-col items-center bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
                <div className="text-sm font-bold text-amber-600 mb-3 uppercase tracking-wider">Centièmes</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleSub(1)} disabled={value < 1} className="w-10 h-10 rounded-full bg-white border border-amber-300 text-amber-600 font-bold hover:bg-amber-100 disabled:opacity-50 text-xl">-</button>
                  <div className="text-4xl font-space font-bold w-12 text-center text-amber-900">{hundredths}</div>
                  <button onClick={() => handleAdd(1)} className="w-10 h-10 rounded-full bg-white border border-amber-300 text-amber-600 font-bold hover:bg-amber-100 text-xl">+</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mb-12 mt-8 px-4">
              <div className="relative pt-10 pb-8">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="10" 
                  value={value} 
                  onChange={(e) => setValue(parseInt(e.target.value))} 
                  className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="absolute -top-3 left-0 w-full flex justify-between px-2 text-slate-800 font-black font-space text-2xl">
                  <span>0</span>
                  <span>1</span>
                </div>
                <div className="absolute top-4 left-0 w-full flex justify-between px-2">
                  {Array.from({length: 11}).map((_, i) => (
                    <div key={i} className={`w-1 h-3 ${i === 0 || i === 10 ? 'bg-slate-400' : 'bg-slate-300'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Visualizer */}
          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 flex flex-col items-center justify-center text-center max-w-xl mx-auto mb-8 relative">
            
            <div className="text-lg sm:text-xl font-bold text-slate-700 transition-all duration-300">
              {textLine1}
            </div>
            
            <ArrowDown className="text-slate-300 my-2" />
            
            <div className="text-xl sm:text-2xl font-space font-bold text-slate-800 transition-all duration-300">
              {textLine2}
            </div>
            
            <ArrowDown className="text-slate-300 my-2" />
            
            <div className="text-4xl sm:text-5xl font-space font-black text-blue-600 transition-all duration-300">
              {decimalValue}
            </div>
            
            {/* The 125/100 combined fraction equivalent can also be shown if needed, but 2+4/10+7/100 is explicitly requested */}
            {(value > 0 && currentMission.type !== 'decouverte') && (
              <div className="absolute -right-4 -bottom-4 bg-white border-2 border-slate-200 p-2 rounded-xl text-sm font-bold text-slate-500 shadow-sm rotate-3 font-space">
                Soit {value}/100
              </div>
            )}
          </div>

          {!isModuleComplete ? (
            <div className="max-w-sm mx-auto">
              <ExerciseValidator
                adaptiveState={adaptiveState}
                onSubmit={() => adaptiveState.submitAnswer()}
                disabled={value === 0 && currentMission.type !== 'decouverte'}
              />
              {adaptiveState.status === 'correct' && exerciseIndex < MISSIONS.length - 1 && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors animate-pulse mt-4"
                >
                  Mission suivante ➔
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6 mt-8">
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto shadow-sm">
                <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-3xl font-bold font-space text-emerald-900 mb-4">L'écriture à virgule !</h3>
                <p className="text-emerald-800 text-lg mb-6">
                  Tu as compris le secret : <strong>125 centièmes</strong> s'écrit tout simplement <strong>1,25</strong>.<br/><br/>
                  La virgule sert à séparer les unités entières des morceaux (les dixièmes et centièmes). C'est beaucoup plus pratique que d'écrire des fractions dans la vie de tous les jours !
                </p>
              </div>

              <KeyTakeaway color="blue">
                <p className="font-bold text-lg mb-2">À retenir</p>
                <li>Les mathématiciens ont inventé l'écriture à virgule pour écrire les fractions de manière plus lisible.</li>
                <li>La virgule sépare <strong>la partie entière</strong> (les objets complets) de <strong>la partie décimale</strong> (les morceaux).</li>
                <li><strong className="font-space">2 + 4/10 + 5/100</strong> s'écrit tout simplement <strong className="font-space">2,45</strong>.</li>
              </KeyTakeaway>
            </div>
          )}
        </div>

      </div>
    </ModuleLayout>
  );
}
