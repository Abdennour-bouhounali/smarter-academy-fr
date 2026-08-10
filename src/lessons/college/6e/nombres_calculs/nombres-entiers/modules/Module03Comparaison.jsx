import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const q1 = {
  question: <>Compare les deux nombres suivants : <strong>45 678</strong> et <strong>9 987</strong></>,
  options: [
    { value: '<', label: '< (plus petit que)' },
    { value: '>', label: '> (plus grand que)' },
    { value: '=', label: '= (égal)' }
  ],
  correctAnswer: '>',
  hints: [
    { type: 'hint', content: "Regarde bien le nombre de chiffres de chaque nombre." },
    { type: 'hint', content: "45 678 a 5 chiffres (dizaines de mille), alors que 9 987 a 4 chiffres (unités de mille)." },
    { type: 'solution', content: "Le nombre avec le plus de chiffres est toujours le plus grand. 45 678 a 5 chiffres et 9 987 a 4 chiffres, donc 45 678 > 9 987." }
  ]
};

const q2 = {
  question: <>Quel est l'ordre croissant correct de ces nombres ? (du plus petit au plus grand)<br/>Nombres : <strong>12 400</strong> ; <strong>12 040</strong> ; <strong>12 440</strong></>,
  correctOrder: ['12040', '12400', '12440'],
  hints: [
    { type: 'hint', content: "Tous ces nombres commencent par '12' (douze mille). Regarde ensuite la classe des unités simples." },
    { type: 'hint', content: "Compare 400, 40 et 440." },
    { type: 'solution', content: "12 040 (quarante) < 12 400 (quatre cents) < 12 440 (quatre cent quarante)." }
  ]
};

const NumberBlock = ({ numberStr, isCounted }) => {
  return (
    <div className="flex gap-1">
      {numberStr.replace(/\s/g, '').split('').map((digit, idx) => (
        <div 
          key={idx}
          className={`w-8 h-10 flex items-center justify-center rounded text-xl font-bold transition-all duration-500
            ${isCounted ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
          style={{ transitionDelay: `${idx * 150}ms` }}
        >
          {digit}
        </div>
      ))}
    </div>
  );
};

export default function Module03Comparaison() {
  const { prevLink, nextLink } = getNavLinks(3);
  
  const [val1, setVal1] = useState(null);
  const [counted, setCounted] = useState(false);

  const initialItems = [
    { id: '12440', label: '12 440' },
    { id: '12040', label: '12 040' },
    { id: '12400', label: '12 400' }
  ];
  const [items, setItems] = useState(initialItems);

  const ex1 = useAdaptiveExercise({
    validate: () => ({ isCorrect: val1 === q1.correctAnswer }),
    guidanceSteps: q1.hints
  });

  const ex2 = useAdaptiveExercise({
    validate: () => {
      const currentOrder = items.map(i => i.id);
      const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(q2.correctOrder);
      return { isCorrect };
    },
    guidanceSteps: q2.hints
  });

  const isCompleted1 = ex1.status === 'correct' || ex1.status === 'solution_viewed';
  const isCompleted2 = ex2.status === 'correct' || ex2.status === 'solution_viewed';

  useEffect(() => {
    if (ex2.status === 'solution_viewed') {
      const sorted = [...initialItems].sort((a, b) => q2.correctOrder.indexOf(a.id) - q2.correctOrder.indexOf(b.id));
      setItems(sorted);
    }
  }, [ex2.status]);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Comparaison et rangement"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={nextLink}
    >
      <SectionHeader title="Règles de comparaison" icon="⚖️" />

      <div className="prose prose-blue max-w-none mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
        <ul className="list-disc pl-5 text-blue-900 text-lg space-y-2">
          <li><strong>Règle 1 :</strong> Le nombre qui a <em>le plus de chiffres</em> est le plus grand.</li>
          <li><strong>Règle 2 :</strong> S'ils ont le même nombre de chiffres, on compare chiffre par chiffre en partant de la <em>gauche</em>.</li>
        </ul>
      </div>

      <div className="space-y-12">
        {/* Exercice 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{q1.question}</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8 bg-slate-50 p-8 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center gap-2">
              <NumberBlock numberStr="45678" isCounted={counted} />
              <div className={`text-sm font-bold text-blue-600 transition-opacity duration-500 ${counted ? 'opacity-100' : 'opacity-0'}`}>5 chiffres</div>
            </div>
            
            <button 
              onClick={() => setCounted(true)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${counted ? 'bg-green-100 text-green-700 pointer-events-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-105'}`}
            >
              {counted ? 'Vérifié !' : 'Compter les chiffres'}
            </button>

            <div className="flex flex-col items-center gap-2">
              <NumberBlock numberStr="9987" isCounted={counted} />
              <div className={`text-sm font-bold text-blue-600 transition-opacity duration-500 ${counted ? 'opacity-100' : 'opacity-0'}`}>4 chiffres</div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6">
            {q1.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => !isCompleted1 && setVal1(opt.value)}
                disabled={isCompleted1 || !counted}
                className={`flex-1 py-3 px-4 rounded-xl font-medium border-2 transition-all ${
                  val1 === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                } ${(isCompleted1 || !counted) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <ExerciseValidator 
            adaptiveState={ex1}
            onSubmit={() => ex1.submitAnswer()}
          />
        </div>

        {/* Exercice 2 */}
        {ex1.status === 'correct' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{q2.question}</h3>
            
            <p className="text-gray-600 mb-4 font-medium">Fais glisser les étiquettes pour les ranger dans l'ordre croissant :</p>
            
            <div className="mb-8">
              <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-3">
                {items.map((item) => (
                  <Reorder.Item key={item.id} value={item} className={`flex items-center gap-4 bg-white p-4 rounded-xl border-2 shadow-sm ${isCompleted2 ? 'border-green-200 pointer-events-none' : 'border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300'}`}>
                    <GripVertical className="text-gray-400" />
                    <span className="text-xl font-bold text-gray-800">{item.label}</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            <ExerciseValidator 
              adaptiveState={ex2}
              onSubmit={() => ex2.submitAnswer()}
            />
          </div>
        )}
      </div>

    </ModuleLayout>
  );
}
