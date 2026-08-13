import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Table, Sparkles } from 'lucide-react';
import ConceptCard from '../../../../../common/components/ConceptCard';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';

const generateExercise = (difficulty) => {
  if (difficulty === 1) {
    return {
      number: '4,5',
      targetParts: {
        units: '4',
        tenths: '5'
      }
    };
  } else if (difficulty === 2) {
    return {
      number: '12,08',
      targetParts: {
        tens: '1',
        units: '2',
        tenths: '0',
        hundredths: '8'
      }
    };
  } else {
    return {
      number: '405,102',
      targetParts: {
        hundreds: '4',
        tens: '0',
        units: '5',
        tenths: '1',
        hundredths: '0',
        thousandths: '2'
      }
    };
  }
};

export default function Module02Tableau() {
  const { prevLink, nextLink } = getNavLinks(2);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(() => generateExercise(1));
  const [inputs, setInputs] = useState({
    hundreds: '', tens: '', units: '', tenths: '', hundredths: '', thousandths: ''
  });

  const adaptiveState = useAdaptiveExercise({
    validate: () => {
      const { targetParts } = currentExercise;
      // All required fields must match, and others must be empty
      let isCorrect = true;
      const fields = {};

      Object.keys(inputs).forEach(key => {
        const expected = targetParts[key] || '';
        const isFieldCorrect = inputs[key] === expected;
        fields[key] = isFieldCorrect;
        if (!isFieldCorrect) isCorrect = false;
      });

      let customFeedback = "Regarde bien où placer la virgule !";
      if (!isCorrect && exerciseIndex === 1 && inputs.tenths === '8') {
        customFeedback = "Attention ! 8 est le chiffre des centièmes, pas des dixièmes. Que faut-il mettre dans la colonne des dixièmes ?";
      }

      return { isCorrect, fields, feedback: isCorrect ? null : customFeedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "Repère d'abord le chiffre des unités, il est juste avant la virgule." },
      { type: 'hint', content: exerciseIndex === 1 ? "S'il n'y a pas de dixièmes, il faut mettre un zéro (zéro intercalaire)." : "La position du chiffre donne sa valeur." },
      { type: 'solution', content: "Le tableau doit correspondre exactement à l'écriture du nombre." }
    ],
    onSuccess: () => {}
  });

  const handleInputChange = (field, value) => {
    // Only allow single digit or empty
    if (/^\d?$/.test(value)) {
      setInputs(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    const nextIndex = exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    setCurrentExercise(generateExercise(nextIndex + 1));
    setInputs({ hundreds: '', tens: '', units: '', tenths: '', hundredths: '', thousandths: '' });
    adaptiveState.reset();
  };

  const isModuleComplete = adaptiveState.status === 'correct' && exerciseIndex >= 2;

  const renderCell = (field, label, colorClass) => {
    const isError = adaptiveState.fieldStatuses && adaptiveState.fieldStatuses[field] === false;
    return (
      <div className="flex flex-col items-center">
        <div className={`text-xs sm:text-sm font-bold mb-2 ${colorClass}`}>{label}</div>
        <input
          type="text"
          value={inputs[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          disabled={adaptiveState.status === 'correct'}
          className={`w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl font-space font-bold border-2 rounded-xl focus:outline-none focus:ring-4 transition-all
            ${isError 
              ? 'border-rose-400 bg-rose-50 text-rose-700 focus:ring-rose-200' 
              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
            }
          `}
        />
      </div>
    );
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Le tableau de numération"
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={isModuleComplete ? nextLink : undefined}
      isCompleted={isModuleComplete}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 mt-2 mb-2">
              Le tableau de numération permet de ranger chaque chiffre à sa place.
            </h2>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission {exerciseIndex + 1} / 3</span>
            <h2 className="text-xl font-bold text-slate-800 mt-2">
              Place les chiffres du nombre <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg font-space">{currentExercise.number}</span> dans le tableau.
            </h2>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex items-end justify-center gap-1 sm:gap-2 min-w-max px-4">
              {/* Partie Entière */}
              <div className="bg-blue-50/50 p-2 rounded-2xl border border-blue-100 flex gap-1 sm:gap-2 relative">
                <div className="absolute -top-6 left-0 w-full text-center text-xs font-bold text-blue-400 uppercase tracking-widest">Partie Entière</div>
                {renderCell('hundreds', 'Centaines', 'text-blue-600')}
                {renderCell('tens', 'Dizaines', 'text-blue-600')}
                {renderCell('units', 'Unités', 'text-blue-600')}
              </div>

              {/* La Virgule */}
              <div className="flex flex-col items-center justify-end h-full pb-2">
                <div className="text-4xl font-black text-rose-500 font-space animate-pulse drop-shadow-md">,</div>
              </div>

              {/* Partie Décimale */}
              <div className="bg-amber-50/50 p-2 rounded-2xl border border-amber-100 flex gap-1 sm:gap-2 relative">
                <div className="absolute -top-6 left-0 w-full text-center text-xs font-bold text-amber-500 uppercase tracking-widest">Partie Décimale</div>
                {renderCell('tenths', 'Dixièmes', 'text-amber-600')}
                {renderCell('hundredths', 'Centièmes', 'text-amber-600')}
                {renderCell('thousandths', 'Millièmes', 'text-amber-600')}
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-sm mx-auto">
            {!isModuleComplete ? (
              <div className="flex flex-col gap-4">
                <ExerciseValidator 
                  adaptiveState={adaptiveState}
                  onSubmit={() => adaptiveState.submitAnswer()}
                />
                {adaptiveState.status === 'correct' && exerciseIndex < 2 && (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors animate-pulse mt-4"
                  >
                    Nombre suivant ➔
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6 mt-8">
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
                  <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">Parfait !</h3>
                  <p className="text-emerald-700 mb-6">Tu sais placer un nombre décimal dans le tableau de numération.</p>
                </div>

                <ConceptCard label="Erreur fréquente" emoji="⚠️" color="rose">
                  <p><strong>Le piège du zéro intercalaire !</strong></p>
                  <p className="text-slate-700 mt-2">
                    Dans le nombre <strong>12,08</strong>, on entend "douze virgule huit". Beaucoup d'élèves écrivent <strong>12,8</strong>. 
                  </p>
                  <p className="text-rose-700 mt-2 font-bold">
                    Attention ! Le zéro est indispensable : il indique qu'il y a 0 dixième. Le 8 est bien dans la colonne des centièmes. 
                  </p>
                </ConceptCard>
              </div>
            )}
          </div>
        </div>

      </div>
    </ModuleLayout>
  );
}
