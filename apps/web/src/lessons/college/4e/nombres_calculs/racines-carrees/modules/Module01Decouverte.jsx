import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { StepProgressBar } from '../../../../../common/components/LessonUI';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useSimpleExercise as useAdaptiveExercise } from '../../../../../common/hooks/useSimpleExercise';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ArrowRight } from 'lucide-react';
import { useProgress } from '../../../../../common/hooks/useProgress';

export default function Module01Decouverte() {
  const { prevLink, nextLink } = getNavLinks(1);
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const [coteSlider, setCoteSlider] = useState(5);
  
  // Etape 1: manipulation directe côté -> aire
  const aireValue = coteSlider * coteSlider;

  // Etape 2: problème inverse aire -> côté
  const reverseExercise = useAdaptiveExercise({
    validator: (val) => {
      if (val.trim() === '7') return { isCorrect: true };
      if (val.trim() === '49') return { isCorrect: false, feedback: "Tu as redonné l'aire. On cherche le côté du carré dont l'aire est 49 m²." };
      if (val.trim() === '24.5') return { isCorrect: false, feedback: "Attention, l'aire d'un carré n'est pas la moitié (côté × 2), c'est côté × côté." };
      return { isCorrect: false, feedback: "Cherche le nombre qui, multiplié par lui-même, donne 49." };
    },
    hints: [
      "L'aire d'un carré se calcule par la formule : Côté × Côté.",
      "Tu cherches donc un nombre qui vérifie : ? × ? = 49.",
      "Pense à tes tables de multiplication : 7 × 7 = ?"
    ]
  });

  // Progression des exercices — même source que le déverrouillage de
  // `nextLink`, pour que le bandeau ne puisse pas mentir sur l'état.
  const doneCount = (reverseExercise.isCorrect ? 1 : 0);
  const totalSteps = 1;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="4ème"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Pourquoi la racine carrée ?"
      estimatedTime="10 min"
      xp={50}
      prevLink={prevLink}
      nextLink={reverseExercise.isCorrect ? nextLink : null}
      onNextClick={() => markModuleCompleted('L01-4e')}
    >
      {doneCount < totalSteps && (
        <StepProgressBar doneCount={doneCount} total={totalSteps} />
      )}
      <div className="space-y-12 max-w-4xl mx-auto w-full">
        
        <section>
          <SectionHeader title="Le sens d'une opération" icon="🤔" />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Pourquoi les mathématiciens ont-ils inventé la notion de <strong>racine carrée</strong> ?
            Tout part d'un problème géométrique très concret.
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">1. Du côté vers l'aire</h3>
            <p className="text-slate-600 mb-6">
              Déplace le curseur pour changer la longueur du <strong>côté</strong> du carré. Observe comment son <strong>aire</strong> évolue.
            </p>

            <div className="flex flex-col items-center gap-8 mb-8">
              <div className="w-full max-w-md px-4">
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                  <span>Côté = 1 m</span>
                  <span className="text-indigo-600">Côté = {coteSlider} m</span>
                  <span>10 m</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={coteSlider}
                  onChange={(e) => setCoteSlider(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="bg-indigo-100 border-2 border-indigo-400 rounded flex items-center justify-center relative"
                  animate={{ 
                    width: `${coteSlider * 15}px`, 
                    height: `${coteSlider * 15}px`,
                    minWidth: '40px',
                    minHeight: '40px'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <span className="absolute -top-6 text-indigo-700 font-bold">{coteSlider} m</span>
                  <span className="absolute -right-10 text-indigo-700 font-bold">{coteSlider} m</span>
                  <span className="font-bold text-indigo-900 text-lg">
                    {aireValue} m²
                  </span>
                </motion.div>
                <div className="text-xl font-bold text-slate-700 mt-4">
                  Aire = <span className="text-indigo-600">{coteSlider} × {coteSlider}</span> = <span className="text-emerald-600">{aireValue} m²</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Le chemin inverse" icon="🔄" />
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Maintenant, imagine la situation inverse. Tu connais <strong>l'aire</strong> du champ, et tu veux retrouver la <strong>longueur de son côté</strong>.
          </p>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900 mb-4">À toi de jouer :</h3>
            <p className="text-amber-800 mb-6">
              Un agriculteur possède un champ carré dont l'aire totale est de <strong>49 m²</strong>.<br />
              Quelle est la longueur du côté de ce champ ?
            </p>
            
            <div className="flex justify-center mb-6">
               <div className="bg-amber-200 border-2 border-amber-400 rounded flex items-center justify-center w-32 h-32 relative">
                  <span className="absolute -top-6 text-amber-700 font-bold">? m</span>
                  <span className="absolute -right-8 text-amber-700 font-bold">? m</span>
                  <span className="font-bold text-amber-900 text-xl">49 m²</span>
               </div>
            </div>

            <ExerciseValidator adaptiveState={reverseExercise} onSubmit={() => reverseExercise.submitAnswer()}>
              <div className="flex items-center gap-4 text-xl">
                <span>Côté = </span>
                <input
                  type="text"
                  value={reverseExercise.value}
                  onChange={(e) => reverseExercise.setValue(e.target.value)}
                  className="w-24 border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-amber-500 focus:outline-none"
                  placeholder="?"
                  disabled={reverseExercise.isCorrect}
                />
                <span>m</span>
              </div>
            </ExerciseValidator>
          </div>
        </section>

        {reverseExercise.isCorrect && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <KeyTakeaway>
              <p>
                Tu viens de résoudre le problème inverse du carré ! <br/>
                Chercher le côté d'un carré d'aire 49 m², c'est chercher le nombre positif qui, multiplié par lui-même, donne 49.<br/>
                C'est <strong>exactement pour ça</strong> que les humains ont inventé la racine carrée.
              </p>
            </KeyTakeaway>
          </motion.section>
        )}

      </div>
    </ModuleLayout>
  );
}
