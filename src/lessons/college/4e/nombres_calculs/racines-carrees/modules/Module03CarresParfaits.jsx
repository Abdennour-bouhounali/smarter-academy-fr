import React from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from './utils';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LayoutGrid } from 'lucide-react';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module03CarresParfaits() {
  const { prevLink, nextLink } = getNavLinks(3);
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);

  const ex1 = useAdaptiveExercise({
    validator: (val) => {
      if (val.trim() === '9') return { isCorrect: true };
      return { isCorrect: false, feedback: "Quel nombre multiplié par lui-même donne 81 ?" };
    },
    hints: ["Cherche dans tes tables : ? × ? = 81", "C'est 9 × 9 = 81 !"]
  });

  const ex2 = useAdaptiveExercise({
    validator: (val) => {
      if (val.trim() === '11') return { isCorrect: true };
      if (val.trim() === '121') return { isCorrect: false, feedback: "La réponse n'est pas 121, on cherche sa racine." };
      return { isCorrect: false, feedback: "Le nombre est légèrement supérieur à 10 (car 10² = 100)." };
    },
    hints: ["10 × 10 = 100", "Essaie 11 × 11 !"]
  });

  const ex3 = useAdaptiveExercise({
    validator: (val) => {
      if (val.trim() === '1') return { isCorrect: true };
      return { isCorrect: false, feedback: "Attention, 1 × 1 ne fait pas 2." };
    },
    hints: ["Quel nombre, multiplié par lui-même, donne 1 ?", "1 × 1 = ?"]
  });

  const allCorrect = ex1.isCorrect && ex2.isCorrect && ex3.isCorrect;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="4ème"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Les Carrés Parfaits"
      estimatedTime="10 min"
      xp={75}
      prevLink={prevLink}
      nextLink={allCorrect ? nextLink : null}
      onNextClick={() => markModuleCompleted('L03-4e')}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        <section>
          <SectionHeader title="Reconnaître les carrés parfaits" icon={<LayoutGrid className="text-pink-500" size={24} />} />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Certains nombres ont une racine carrée qui tombe "juste" (un nombre entier). 
            On les appelle les <strong>carrés parfaits</strong>. Il faut les connaître par cœur pour faire du calcul mental.
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <div key={n} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center">
                  <div className="text-slate-400 text-sm mb-1"><MathText>{`$${n}^2$`}</MathText></div>
                  <div className="text-2xl font-bold text-pink-600">{n * n}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="À ton tour" icon="✍️" />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Utilise ce que tu viens d'apprendre pour calculer mentalement ces racines carrées exactes.
          </p>

          <div className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <ExerciseValidator adaptiveState={ex1} onSubmit={() => ex1.submitAnswer()}>
                <div className="flex items-center gap-4 text-2xl">
                  <MathText>{"$\\sqrt{81} = $"}</MathText>
                  <input
                    type="text"
                    value={ex1.value}
                    onChange={(e) => ex1.setValue(e.target.value)}
                    disabled={ex1.isCorrect}
                    className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <ExerciseValidator adaptiveState={ex2} onSubmit={() => ex2.submitAnswer()}>
                <div className="flex items-center gap-4 text-2xl">
                  <MathText>{"$\\sqrt{121} = $"}</MathText>
                  <input
                    type="text"
                    value={ex2.value}
                    onChange={(e) => ex2.setValue(e.target.value)}
                    disabled={ex2.isCorrect}
                    className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <ExerciseValidator adaptiveState={ex3} onSubmit={() => ex3.submitAnswer()}>
                <div className="flex items-center gap-4 text-2xl">
                  <MathText>{"$\\sqrt{1} = $"}</MathText>
                  <input
                    type="text"
                    value={ex3.value}
                    onChange={(e) => ex3.setValue(e.target.value)}
                    disabled={ex3.isCorrect}
                    className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </ExerciseValidator>
            </div>
          </div>
        </section>

      </div>
    </ModuleLayout>
  );
}
