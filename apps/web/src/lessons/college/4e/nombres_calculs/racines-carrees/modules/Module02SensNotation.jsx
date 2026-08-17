import React from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import MathInput from '../../../../../common/components/MathInput';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from '../../../../../common/hooks/useSimpleExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module02SensNotation() {
  const { prevLink, nextLink } = getNavLinks(2);
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);

  // Exercise 1 : The meaning (symbol)
  const notationExercise = useAdaptiveExercise({
    validator: (val) => {
      // We expect \sqrt{64}
      const cleanVal = val.replace(/\s+/g, '');
      if (cleanVal === '\\sqrt{64}') return { isCorrect: true };
      if (cleanVal === '8') return { isCorrect: false, feedback: "8 est le RÉSULTAT du calcul. Mais ici on te demande juste d'écrire le symbole qui DÉSIGNE ce nombre." };
      if (cleanVal.includes('8')) return { isCorrect: false, feedback: "Ne calcule pas encore le résultat ! Utilise le symbole de la racine carrée." };
      return { isCorrect: false, feedback: "Utilise le bouton racine carrée (√) du clavier et écris 64 à l'intérieur." };
    },
    hints: [
      "On vient de voir que le nombre positif dont le carré est 'a' s'écrit √a.",
      "Ici 'a' vaut 64. Comment écris-tu cela avec le symbole ?"
    ]
  });

  // Exercise 2 : The calculation (result)
  const calcExercise = useAdaptiveExercise({
    validator: (val) => {
      const cleanVal = val.trim();
      if (cleanVal === '8') return { isCorrect: true };
      if (cleanVal === '\\sqrt{64}') return { isCorrect: false, feedback: "Cette fois on veut le résultat final (sans le symbole racine)." };
      return { isCorrect: false, feedback: "Quel nombre donne 64 quand on le multiplie par lui-même ?" };
    },
    hints: [
      "Cherche un nombre qui, multiplié par lui-même, donne 64.",
      "Dans tes tables : ? × ? = 64.",
      "C'est 8 ! Donc √64 = 8."
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
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Notation et Sens"
      estimatedTime="8 min"
      xp={50}
      prevLink={prevLink}
      nextLink={(notationExercise.isCorrect && calcExercise.isCorrect) ? nextLink : null}
      onNextClick={() => markModuleCompleted('L02-4e')}
    >
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        <section>
          <SectionHeader title="La définition mathématique" icon={<BookOpen className="text-emerald-600" size={24} />} />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Puisque les mathématiciens devaient souvent "trouver le côté à partir de l'aire", ils ont créé un symbole spécial pour l'écrire plus vite.
          </p>

          <KeyTakeaway>
            <div className="text-lg space-y-4">
              <p>
                La <strong>racine carrée</strong> d'un nombre positif <MathText>{"$a$"}</MathText> est le seul <strong>nombre positif</strong> dont le carré vaut <MathText>{"$a$"}</MathText>.
              </p>
              <p className="font-bold text-indigo-700 text-xl text-center">
                On la note : <MathText>{"$\\sqrt{a}$"}</MathText>
              </p>
            </div>
          </KeyTakeaway>
        </section>

        <section>
          <SectionHeader title="Distinguer le Sens et le Calcul" icon="✍️" />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Il est très important de ne pas confondre "la façon de l'écrire" et "le résultat du calcul".
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sens */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">1. Écrire le symbole</h3>
              <p className="text-slate-600 mb-6 min-h-[48px]">
                Comment <strong>notes-tu</strong> le nombre positif dont le carré est 64 ? (Ne le calcule pas !)
              </p>
              
              <ExerciseValidator adaptiveState={notationExercise} onSubmit={() => notationExercise.submitAnswer()}>
                <MathInput
                  value={notationExercise.value}
                  onChange={(val) => notationExercise.setValue(val)}
                  disabled={notationExercise.isCorrect}
                  placeholder="\sqrt{...}"
                />
              </ExerciseValidator>

              {notationExercise.isCorrect && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-emerald-600 font-bold flex items-center gap-2">
                  ✓ C'est bien ça ! L'écriture est <MathText>{"$\\sqrt{64}$"}</MathText>.
                </motion.div>
              )}
            </div>

            {/* Calcul */}
            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${notationExercise.isCorrect ? 'border-indigo-300' : 'border-slate-200 opacity-50'}`}>
              <h3 className="text-xl font-bold text-slate-800 mb-4">2. Faire le calcul</h3>
              <p className="text-slate-600 mb-6 min-h-[48px]">
                Maintenant, <strong>combien vaut</strong> ce nombre ? (Fais le calcul)
              </p>
              
              {notationExercise.isCorrect ? (
                <ExerciseValidator adaptiveState={calcExercise} onSubmit={() => calcExercise.submitAnswer()}>
                  <div className="flex items-center gap-4 text-2xl">
                    <MathText>{"$\\sqrt{64} = $"}</MathText>
                    <input
                      type="text"
                      value={calcExercise.value}
                      onChange={(e) => calcExercise.setValue(e.target.value)}
                      disabled={calcExercise.isCorrect}
                      className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </ExerciseValidator>
              ) : (
                <div className="text-slate-400 italic text-center py-8 bg-slate-50 rounded-xl">
                  Réussis l'étape 1 d'abord !
                </div>
              )}

              {calcExercise.isCorrect && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-emerald-600 font-bold flex items-center gap-2">
                  ✓ Parfait ! <MathText>{"$\\sqrt{64} = 8$"}</MathText> car <MathText>{"$8^2 = 64$"}</MathText>.
                </motion.div>
              )}
            </div>
          </div>
        </section>

      </div>
    </ModuleLayout>
  );
}
