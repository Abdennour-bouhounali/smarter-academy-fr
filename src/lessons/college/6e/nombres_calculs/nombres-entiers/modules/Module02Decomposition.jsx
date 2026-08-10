import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const q = {
  question: <>Décompose le nombre <strong>45 678</strong> en remplissant les cases vides :</>,
  check: (vals) => (
    vals.i1 === '40000' &&
    vals.i2 === '5000' &&
    vals.i3 === '600' &&
    vals.i4 === '70' &&
    vals.i5 === '8'
  ),
  hints: [
    { type: 'hint', content: "Regarde le premier chiffre (4). Il est dans la classe des milliers, à la position des dizaines. Que vaut 4 dizaines de mille ?" },
    { type: 'hint', content: "4 dizaines de mille = 40 000. Fais de même pour les autres chiffres." },
    { type: 'solution', content: "La décomposition est : 40 000 + 5 000 + 600 + 70 + 8" }
  ]
};

export default function Module02Decomposition() {
  const { prevLink, nextLink } = getNavLinks(2);
  const [userInputs, setUserInputs] = useState({ i1: '', i2: '', i3: '', i4: '', i5: '' });
  
  const adaptiveState = useAdaptiveExercise({
    validate: () => ({ isCorrect: q.check(userInputs) }),
    guidanceSteps: q.hints
  });

  const handleInputChange = (id, val) => {
    setUserInputs(prev => ({ ...prev, [id]: val }));
  };

  const isCompleted = adaptiveState.status === 'correct' || adaptiveState.status === 'solution_viewed';

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Décomposition et écriture"
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={nextLink}
    >
      <SectionHeader title="Le tableau de numération" icon="📊" />

      <div className="prose prose-blue max-w-none mb-8">
        <p className="text-gray-700 text-lg">
          Pour comprendre la valeur de chaque chiffre, on utilise un <strong>tableau de numération</strong>.
          Chaque chiffre a une valeur selon sa position : Unités, Dizaines ou Centaines de sa classe.
        </p>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-center border-collapse">
          <thead>
            <tr>
              <th colSpan="3" className="border border-blue-200 bg-blue-100 p-2 text-blue-900">Classe des millions</th>
              <th colSpan="3" className="border border-emerald-200 bg-emerald-100 p-2 text-emerald-900">Classe des milliers</th>
              <th colSpan="3" className="border border-purple-200 bg-purple-100 p-2 text-purple-900">Classe des unités</th>
            </tr>
            <tr className="text-sm">
              <th className="border border-gray-300 bg-gray-50 p-2">C</th>
              <th className="border border-gray-300 bg-gray-50 p-2">D</th>
              <th className="border border-gray-300 bg-gray-50 p-2">U</th>
              <th className="border border-gray-300 bg-gray-50 p-2">C</th>
              <th className="border border-gray-300 bg-gray-50 p-2">D</th>
              <th className="border border-gray-300 bg-gray-50 p-2">U</th>
              <th className="border border-gray-300 bg-gray-50 p-2">C</th>
              <th className="border border-gray-300 bg-gray-50 p-2">D</th>
              <th className="border border-gray-300 bg-gray-50 p-2">U</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-lg font-mono font-bold">
              <td className="border border-gray-300 p-3"></td>
              <td className="border border-gray-300 p-3"></td>
              <td className="border border-gray-300 p-3"></td>
              <td className="border border-gray-300 p-3"></td>
              <td className="border border-gray-300 p-3 text-blue-600">4</td>
              <td className="border border-gray-300 p-3 text-blue-600">5</td>
              <td className="border border-gray-300 p-3 text-emerald-600">6</td>
              <td className="border border-gray-300 p-3 text-emerald-600">7</td>
              <td className="border border-gray-300 p-3 text-emerald-600">8</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{q.question}</h3>
        <div className="flex flex-wrap items-center gap-3 text-lg font-mono mb-6">
          <span className="font-bold">45 678 = </span>
          <input
            type="number"
            className="w-28 p-2 border-2 border-gray-300 rounded-lg text-center"
            value={userInputs['i1']}
            onChange={(e) => handleInputChange('i1', e.target.value)}
            disabled={isCompleted}
            placeholder="40000"
          />
          <span>+</span>
          <input
            type="number"
            className="w-24 p-2 border-2 border-gray-300 rounded-lg text-center"
            value={userInputs['i2']}
            onChange={(e) => handleInputChange('i2', e.target.value)}
            disabled={isCompleted}
            placeholder="5000"
          />
          <span>+</span>
          <input
            type="number"
            className="w-20 p-2 border-2 border-gray-300 rounded-lg text-center"
            value={userInputs['i3']}
            onChange={(e) => handleInputChange('i3', e.target.value)}
            disabled={isCompleted}
            placeholder="600"
          />
          <span>+</span>
          <input
            type="number"
            className="w-16 p-2 border-2 border-gray-300 rounded-lg text-center"
            value={userInputs['i4']}
            onChange={(e) => handleInputChange('i4', e.target.value)}
            disabled={isCompleted}
            placeholder="70"
          />
          <span>+</span>
          <input
            type="number"
            className="w-12 p-2 border-2 border-gray-300 rounded-lg text-center"
            value={userInputs['i5']}
            onChange={(e) => handleInputChange('i5', e.target.value)}
            disabled={isCompleted}
            placeholder="8"
          />
        </div>

        <ExerciseValidator
          adaptiveState={adaptiveState}
          onSubmit={() => adaptiveState.submitAnswer()}
        />
      </div>
    </ModuleLayout>
  );
}
