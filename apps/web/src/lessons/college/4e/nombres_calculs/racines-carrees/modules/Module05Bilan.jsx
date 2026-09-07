import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { StepProgressBar } from '../../../../../common/components/LessonUI';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from '../../../../../common/hooks/useSimpleExercise';
import { MODULE_CTX } from '../moduleContext';
import { Trophy, CheckCircle, ArrowRight } from 'lucide-react';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module05Bilan() {
  const navigate = useNavigate();
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);

  // Evaluation-stage assessment metadata (docs/architecture/AI_LESSON_CONTRACT.md):
  // each question below is tagged with the learning point(s) it certifies so
  // this module's answers generate server-side mastery evidence.
  const q1Meta = {
    id: 'racines-carrees-4e-eval-01',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P1'] },
  };
  const q2Meta = {
    id: 'racines-carrees-4e-eval-02',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P2', '4e_racines-carrees-4e_P3'] },
  };
  const q3Meta = {
    id: 'racines-carrees-4e-eval-03',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_racines-carrees-4e_P4'] },
  };

  const q1 = useAdaptiveExercise({
    validator: (val) => {
      const cleanVal = val.replace(/\s+/g, '');
      if (cleanVal === '\\sqrt{100}') return { isCorrect: true };
      if (cleanVal === '10') return { isCorrect: false, feedback: "10 est le résultat. On te demande le symbole." };
      return { isCorrect: false, feedback: "Utilise le symbole √ et le nombre 100." };
    }
  });

  const q2 = useAdaptiveExercise({
    validator: (val) => {
      if (val.trim() === '12') return { isCorrect: true };
      return { isCorrect: false, feedback: "Quel nombre multiplié par lui-même donne 144 ?" };
    }
  });

  const q3 = useAdaptiveExercise({
    validator: (val) => {
      if (val.trim() === '5') return { isCorrect: true };
      return { isCorrect: false, feedback: "La racine de 25 est 5, la racine de 36 est 6. Trouve l'entier inférieur pour 30." };
    }
  });

  const allCorrect = q1.isCorrect && q2.isCorrect && q3.isCorrect;

  // Progression des exercices — même source que le déverrouillage de
  // `nextLink`, pour que le bandeau ne puisse pas mentir sur l'état.
  const doneCount = (q1.isCorrect ? 1 : 0) + (q2.isCorrect ? 1 : 0) + (q3.isCorrect ? 1 : 0);
  const totalSteps = 3;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="4ème"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Bilan des Compétences"
      estimatedTime="15 min"
      xp={150}
      prevLink={MODULE_CTX.coursePath + "/4"}
      nextLink={null}
      onNextClick={() => markModuleCompleted('L05-4e')}
    >
      {doneCount < totalSteps && (
        <StepProgressBar doneCount={doneCount} total={totalSteps} />
      )}
      <div className="space-y-12 max-w-4xl mx-auto w-full pb-20">
        
        <section>
          <SectionHeader title="Quiz Final" icon={<Trophy className="text-yellow-500" size={24} />} />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Prouve que tu as bien compris le sens et les bases du calcul de la racine carrée !
          </p>

          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" data-question-id={q1Meta.id}>
              <h3 className="font-bold text-lg mb-4 text-slate-800">1. Symbole et notation</h3>
              <p className="mb-4 text-slate-600">Le nombre positif dont le carré est 100 se note :</p>
              <ExerciseValidator adaptiveState={q1} onSubmit={() => q1.submitAnswer()}>
                <MathInput
                  value={q1.value}
                  onChange={(v) => q1.setValue(v)}
                  disabled={q1.isCorrect}
                  placeholder="\sqrt{...}"
                />
              </ExerciseValidator>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" data-question-id={q2Meta.id}>
              <h3 className="font-bold text-lg mb-4 text-slate-800">2. Calcul d'un carré parfait</h3>
              <p className="mb-4 text-slate-600">Calcule :</p>
              <ExerciseValidator adaptiveState={q2} onSubmit={() => q2.submitAnswer()}>
                <div className="flex items-center gap-4 text-2xl">
                  <MathText>{"$\\sqrt{144} = $"}</MathText>
                  <input
                    type="text"
                    value={q2.value}
                    onChange={(e) => q2.setValue(e.target.value)}
                    disabled={q2.isCorrect}
                    className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" data-question-id={q3Meta.id}>
              <h3 className="font-bold text-lg mb-4 text-slate-800">3. Encadrement</h3>
              <p className="mb-4 text-slate-600">Donne l'entier directement inférieur à <MathText>{"$\\sqrt{30}$"}</MathText> :</p>
              <ExerciseValidator adaptiveState={q3} onSubmit={() => q3.submitAnswer()}>
                <div className="flex items-center gap-4 text-2xl">
                  <input
                    type="text"
                    value={q3.value}
                    onChange={(e) => q3.setValue(e.target.value)}
                    disabled={q3.isCorrect}
                    className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-slate-400">{"<"}</span>
                  <MathText>{"$\\sqrt{30}$"}</MathText>
                </div>
              </ExerciseValidator>
            </div>

          </div>
        </section>

        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-8 text-center shadow-lg"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="text-emerald-600 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">Leçon validée !</h2>
            <p className="text-emerald-700 text-lg mb-8 max-w-lg mx-auto">
              Félicitations ! Tu as compris la notion fondamentale de racine carrée, et tu sais encadrer ou calculer mentalement les cas simples.
            </p>
            <button
              onClick={() => {
                markModuleCompleted('L05-4e');
                navigate(MODULE_CTX.coursePath);
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-md transition-all hover:-translate-y-1"
            >
              Retourner à la leçon <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

      </div>
    </ModuleLayout>
  );
}
