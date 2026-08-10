import React from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from './utils';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Search } from 'lucide-react';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module04Encadrement() {
  const { prevLink, nextLink } = getNavLinks(4);
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);

  const encadrementEx = useAdaptiveExercise({
    validator: (val) => {
      const cleanVal = val.replace(/\s+/g, '');
      if (cleanVal === '9') return { isCorrect: true };
      if (cleanVal === '10') return { isCorrect: false, feedback: "10 est l'entier supérieur (car 10² = 100). Quel est l'entier juste avant ?" };
      if (cleanVal === '81') return { isCorrect: false, feedback: "81 est le carré parfait inférieur. Mais on te demande la racine (l'entier)." };
      return { isCorrect: false, feedback: "Cherche les deux carrés parfaits les plus proches de 85. Il y a 81 et 100. Donc √85 est compris entre... ?" };
    },
    hints: [
      "Quels sont les carrés parfaits les plus proches de 85 ?",
      "85 est compris entre 81 et 100.",
      "Donc √85 est compris entre √81 et √100.",
      "Or √81 = 9. Donc √85 est entre 9 et 10."
    ]
  });

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="4ème"
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Ordre de grandeur (Encadrement)"
      estimatedTime="10 min"
      xp={75}
      prevLink={prevLink}
      nextLink={encadrementEx.isCorrect ? nextLink : null}
      onNextClick={() => markModuleCompleted('L04-4e')}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        <section>
          <SectionHeader title="Que faire quand ça ne tombe pas juste ?" icon={<Search className="text-amber-500" size={24} />} />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Tous les nombres ne sont pas des carrés parfaits ! Par exemple, 50 n'en est pas un. 
            On ne peut pas calculer mentalement la valeur exacte de <MathText>{"$\\sqrt{50}$"}</MathText>.
          </p>

          <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200 mb-8">
            <h3 className="text-xl font-bold text-amber-900 mb-4">L'idée de l'encadrement :</h3>
            <p className="text-amber-800 mb-6">
              Même sans calculatrice, on peut <strong>encadrer</strong> <MathText>{"$\\sqrt{50}$"}</MathText> entre deux nombres entiers consécutifs en regardant les carrés parfaits autour de 50.
            </p>
            
            <div className="flex flex-col items-center gap-4 text-xl text-amber-900 font-bold bg-white p-6 rounded-xl border border-amber-300">
              <div className="flex justify-center gap-12 w-full text-center">
                <div className="flex-1">49</div>
                <div className="flex-1 text-slate-400">{"<"}</div>
                <div className="flex-1 text-2xl text-indigo-700">50</div>
                <div className="flex-1 text-slate-400">{"<"}</div>
                <div className="flex-1">64</div>
              </div>
              
              <div className="w-full text-center text-slate-400 text-sm">On passe à la racine :</div>
              
              <div className="flex justify-center gap-12 w-full text-center">
                <div className="flex-1"><MathText>{"$\\sqrt{49}$"}</MathText></div>
                <div className="flex-1 text-slate-400">{"<"}</div>
                <div className="flex-1 text-2xl text-indigo-700"><MathText>{"$\\sqrt{50}$"}</MathText></div>
                <div className="flex-1 text-slate-400">{"<"}</div>
                <div className="flex-1"><MathText>{"$\\sqrt{64}$"}</MathText></div>
              </div>

              <div className="w-full text-center text-slate-400 text-sm">Ce qui donne les entiers :</div>

              <div className="flex justify-center items-center gap-12 w-full text-center">
                <div className="flex-1 text-3xl text-emerald-600">7</div>
                <div className="flex-1 text-slate-400">{"<"}</div>
                <div className="flex-1 text-2xl text-indigo-700"><MathText>{"$\\sqrt{50}$"}</MathText></div>
                <div className="flex-1 text-slate-400">{"<"}</div>
                <div className="flex-1 text-3xl text-emerald-600">8</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="À ton tour" icon="🎯" />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Complète l'encadrement par l'entier inférieur.
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <ExerciseValidator adaptiveState={encadrementEx} onSubmit={() => encadrementEx.submitAnswer()}>
              <div className="flex items-center gap-6 text-3xl font-bold text-slate-700 py-8">
                <input
                  type="text"
                  value={encadrementEx.value}
                  onChange={(e) => encadrementEx.setValue(e.target.value)}
                  disabled={encadrementEx.isCorrect}
                  className="w-20 border-b-4 border-slate-300 px-2 py-2 text-center text-emerald-600 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-slate-400">{"<"}</span>
                <MathText>{"$\\sqrt{85}$"}</MathText>
                <span className="text-slate-400">{"<"}</span>
                <span>10</span>
              </div>
            </ExerciseValidator>
            
            {encadrementEx.isCorrect && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-emerald-600 font-bold">
                ✓ Exact ! Car 81 &lt; 85 &lt; 100, donc 9 &lt; √85 &lt; 10.
              </motion.div>
            )}
          </div>
        </section>

      </div>
    </ModuleLayout>
  );
}
