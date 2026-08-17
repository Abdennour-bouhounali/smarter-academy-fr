import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const QUESTIONS = [
  {
    id: 1,
    text: "Quelles sont les conditions nécessaires pour appliquer le théorème de Thalès ?",
    options: [
      { text: "Deux droites perpendiculaires et un triangle", isCorrect: false },
      { text: "Deux droites parallèles coupées par deux droites sécantes", isCorrect: true },
      { text: "Un triangle rectangle", isCorrect: false },
    ]
  },
  {
    id: 2,
    text: "Quelle fraction est TOUJOURS incorrecte dans l'égalité de Thalès ?",
    options: [
      { text: "Petit côté / Grand côté", isCorrect: false },
      { text: "Morceau de côté / Grand côté entier", isCorrect: true },
      { text: "Grand côté / Petit côté", isCorrect: false },
    ]
  },
  {
    id: 3,
    text: "Si les rapports AM/AB et AN/AC sont différents, que conclut-on ?",
    options: [
      { text: "Les droites (MN) et (BC) sont parallèles", isCorrect: false },
      { text: "Les droites (MN) et (BC) ne sont pas parallèles", isCorrect: true },
      { text: "On ne peut rien conclure", isCorrect: false },
    ]
  },
  {
    id: 4,
    text: "Dans la configuration 'Papillon', où se trouve le sommet commun ?",
    options: [
      { text: "À l'extérieur des deux triangles", isCorrect: false },
      { text: "Au milieu, entre les deux droites parallèles", isCorrect: true },
      { text: "Sur l'une des droites parallèles", isCorrect: false },
    ]
  },
  {
    id: 5,
    text: "À quoi sert principalement le théorème de Thalès classique ?",
    options: [
      { text: "À calculer une longueur manquante", isCorrect: true },
      { text: "À prouver qu'un triangle est rectangle", isCorrect: false },
      { text: "À calculer l'aire d'un triangle", isCorrect: false },
    ]
  }
];

export default function Module07Bilan() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(7);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => markModuleCompleted('L07');

  const currentQ = QUESTIONS[currentQIndex];
  
  const score = Object.values(answers).filter(Boolean).length;
  const isMastered = score >= LESSON_CONFIG.assessment.masteryScore;

  const handleSelectOption = (isCorrect) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: isCorrect }));
    
    if (currentQIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQIndex(prev => prev + 1), 500);
    } else {
      setTimeout(() => {
        setIsFinished(true);
        if (score + (isCorrect ? 1 : 0) >= LESSON_CONFIG.assessment.masteryScore) {
          awardXP({ moduleId: 'L07', exerciseId: 'final-quiz', amount: LESSON_CONFIG.assessment.xpReward || 150 });
        }
      }, 500);
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={7}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Bilan Final"
      moduleSubtitle="Testez vos connaissances sur le Théorème de Thalès pour valider la leçon."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 p-8 border-b border-slate-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 100 100">
               <polygon points="50,10 10,90 90,90" fill="none" stroke="#334155" strokeWidth="4" />
               <polygon points="50,10 30,50 70,50" fill="none" stroke="#334155" strokeWidth="4" />
            </svg>
          </div>
          <SectionHeader number={7} title="Évaluation : Maîtrise de Thalès" color="slate" />
          <p className="text-slate-600 mt-2 font-medium relative z-10">
            {isFinished ? "Évaluation terminée !" : `Question ${currentQIndex + 1} sur ${QUESTIONS.length}`}
          </p>
        </div>

        <div className="p-8">
          
          {!isFinished ? (
            <motion.div 
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <h3 className="text-2xl font-bold text-slate-800 text-center leading-tight">
                {currentQ.text}
              </h3>
              
              <div className="space-y-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] !== undefined;
                  const isThisSelected = isSelected && (opt.isCorrect === answers[currentQ.id]); // Approximation pour visuel immédiat
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.isCorrect)}
                      disabled={isSelected}
                      className={clsx(
                        "w-full p-4 rounded-xl text-left font-medium transition-all text-lg border-2",
                        isSelected
                          ? opt.isCorrect 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-500 opacity-50"
                          : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-md text-slate-700"
                      )}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center space-y-6"
            >
              <div className="text-6xl mb-4">
                {isMastered ? '🏆' : '💪'}
              </div>
              <h3 className="text-3xl font-bold text-slate-800">
                Score : {score} / {QUESTIONS.length}
              </h3>
              
              {isMastered ? (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-2xl text-emerald-800">
                  <h4 className="font-bold text-xl mb-2">Leçon Maîtrisée !</h4>
                  <p>Vous avez parfaitement compris le théorème de Thalès, sa réciproque, sa contraposée et ses configurations.</p>
                  <p className="mt-4 font-bold text-emerald-600 animate-pulse">+ {LESSON_CONFIG.assessment.xpReward} XP</p>
                </div>
              ) : (
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl text-amber-800">
                  <h4 className="font-bold text-xl mb-2">Encore un effort !</h4>
                  <p>Il vous manque quelques notions pour maîtriser complètement cette leçon. N'hésitez pas à revoir les modules précédents.</p>
                  <button 
                    onClick={() => {
                      setAnswers({});
                      setCurrentQIndex(0);
                      setIsFinished(false);
                    }}
                    className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </section>
    </ModuleLayout>
  );
}
