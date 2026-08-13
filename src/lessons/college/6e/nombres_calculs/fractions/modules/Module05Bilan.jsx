import React, { useState, useEffect } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { CheckCircle2, XCircle } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';

export default function Module05Bilan() {
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  
  const score = Object.values(answers).filter(a => a.isCorrect).length;

  const handleAnswer = (qIndex, isCorrect, optionIndex) => {
    if (answers[qIndex] !== undefined) return; 
    setAnswers(prev => ({ ...prev, [qIndex]: { isCorrect, optionIndex } }));
  };

  const isStepComplete = (qIndex) => answers[qIndex] !== undefined;
  const isAllAnswered = isStepComplete(1) && isStepComplete(2) && isStepComplete(3);

  useEffect(() => {
    if (isAllAnswered) {
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [isAllAnswered]);

  const navLinks = getNavLinks(5);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Bilan et Défi"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      prevLink={navLinks.prevLink}
      nextLink={isCompleted ? navLinks.nextLink : undefined}
      isCompleted={isCompleted}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="mb-8 text-center">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission 5 / 5 : Le Boss Final</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">Peux-tu réussir sans aide ?</h2>
        </div>

        <div className="space-y-8">
          
          {/* ── QUESTION 1 ── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700 mb-6">Dans la fraction <MathText>{"$\\frac{5}{8}$"}</MathText>, que représente le nombre 8 ?</h3>
            <div className="flex flex-col gap-4">
              {[
                { text: 'Le Numérateur (le nombre de parts prises)', correct: false },
                { text: 'Le Dénominateur (la découpe totale)', correct: true },
                { text: 'Le résultat de la division', correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(1, opt.correct, i)}
                  className={`p-4 rounded-xl border-2 font-medium transition-all text-left flex justify-between items-center ${
                    answers[1]?.optionIndex === i
                      ? (opt.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700')
                      : answers[1] !== undefined
                        ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600'
                  }`}
                  disabled={answers[1] !== undefined}
                >
                  <span>{opt.text}</span>
                  {answers[1]?.optionIndex === i && (
                    opt.correct ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── QUESTION 2 ── */}
          {isStepComplete(1) && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-700 mb-6">Si je partage 2 pizzas entre 3 personnes, quelle fraction de pizza chacun aura-t-il ?</h3>
              <div className="flex flex-col gap-4">
                {[
                  { text: '3 / 2', correct: false },
                  { text: '2 / 3', correct: true },
                  { text: '2 + 3 = 5 parts', correct: false }
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(2, opt.correct, i)}
                    className={`p-4 rounded-xl border-2 font-medium transition-all text-left flex justify-between items-center ${
                      answers[2]?.optionIndex === i
                        ? (opt.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700')
                        : answers[2] !== undefined
                          ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50'
                          : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600'
                    }`}
                    disabled={answers[2] !== undefined}
                  >
                    <span className="font-space text-lg font-bold">{opt.text}</span>
                    {answers[2]?.optionIndex === i && (
                      opt.correct ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── QUESTION 3 ── */}
          {isStepComplete(2) && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-700 mb-6">Pour placer une fraction sur un axe, que dois-je compter entre 0 et 1 ?</h3>
              <div className="flex flex-col gap-4">
                {[
                  { text: 'Le nombre de petits traits verticaux', correct: false },
                  { text: 'Le nombre de segments (les espaces entre les traits)', correct: true }
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(3, opt.correct, i)}
                    className={`p-4 rounded-xl border-2 font-medium transition-all text-left flex justify-between items-center ${
                      answers[3]?.optionIndex === i
                        ? (opt.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700')
                        : answers[3] !== undefined
                          ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50'
                          : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600'
                    }`}
                    disabled={answers[3] !== undefined}
                  >
                    <span>{opt.text}</span>
                    {answers[3]?.optionIndex === i && (
                      opt.correct ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── BILAN FINAL ── */}
          {isCompleted && (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-3xl text-center shadow-sm animate-in zoom-in duration-500">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-2">Leçon terminée !</h3>
              <p className="text-lg text-emerald-700 mb-6">Tu as obtenu un score de <strong>{score} / 3</strong>.</p>
              
              {score === 3 ? (
                <p className="text-emerald-600 font-medium">Parfait ! Les fractions simples n'ont plus aucun secret pour toi. Tu es prêt pour passer à la suite.</p>
              ) : (
                <p className="text-amber-600 font-medium">C'est un bon début. N'hésite pas à refaire les modules précédents si tu as eu des doutes.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </ModuleLayout>
  );
}
