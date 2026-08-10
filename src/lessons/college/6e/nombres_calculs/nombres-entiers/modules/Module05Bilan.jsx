import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const q = {
  question: <>Voici les distances moyennes au Soleil de trois planètes de notre système solaire (en km) :<br/>- <strong>Mars</strong> : 227 900 000<br/>- <strong>Terre</strong> : 149 600 000<br/>- <strong>Vénus</strong> : 108 200 000<br/><br/>Quelle est la planète la plus éloignée du Soleil parmi ces trois ?</>,
  options: [
    { value: 'mars', label: 'Mars' },
    { value: 'terre', label: 'Terre' },
    { value: 'venus', label: 'Vénus' }
  ],
  correctAnswer: 'mars',
  hints: [
    { type: 'hint', content: "Regarde le nombre de chiffres de chaque distance. Elles ont toutes 9 chiffres." },
    { type: 'hint', content: "Puisqu'elles ont le même nombre de chiffres, compare les classes des millions (de gauche à droite)." },
    { type: 'hint', content: "Compare 227, 149 et 108. Lequel est le plus grand ?" },
    { type: 'solution', content: "Mars est à 227 millions de kilomètres, ce qui est plus grand que 149 millions (Terre) et 108 millions (Vénus). C'est donc Mars la plus éloignée." }
  ]
};

export default function Module05Bilan() {
  const { prevLink, nextLink } = getNavLinks(5);
  const [val, setVal] = useState(null);

  const adaptiveState = useAdaptiveExercise({
    validate: () => ({ isCorrect: val === q.correctAnswer }),
    guidanceSteps: q.hints
  });

  const isCompleted = adaptiveState.status === 'correct' || adaptiveState.status === 'solution_viewed';

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Mission & Bilan"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={nextLink}
    >
      <SectionHeader title="Mission finale" icon="🚀" />

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4 whitespace-pre-wrap">{q.question}</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {q.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => !isCompleted && setVal(opt.value)}
              disabled={isCompleted}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 transition-all ${
                val === opt.value
                  ? 'border-blue-500 bg-blue-100 text-blue-800'
                  : 'border-slate-300 bg-white hover:border-blue-400 text-slate-700'
              } ${isCompleted ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <ExerciseValidator 
          adaptiveState={adaptiveState}
          onSubmit={() => adaptiveState.submitAnswer()}
        />
      </div>

      {adaptiveState.status === 'correct' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-fade-in">
          <SectionHeader title="Bilan du Chapitre" icon="✅" />
          <p className="text-emerald-800 text-lg mb-4">
            Bravo ! Tu as terminé la leçon sur les nombres entiers. Voici ce que tu sais faire :
          </p>
          <ul className="list-disc pl-5 text-emerald-700 space-y-2 text-lg">
            <li>Regrouper les chiffres par classes (unités, milliers, millions) pour lire les grands nombres.</li>
            <li>Décomposer un nombre selon son tableau de numération.</li>
            <li>Comparer deux nombres en regardant le nombre de chiffres puis de gauche à droite.</li>
            <li>Placer et lire des nombres sur une demi-droite graduée en comprenant le pas.</li>
          </ul>
        </div>
      )}
    </ModuleLayout>
  );
}
