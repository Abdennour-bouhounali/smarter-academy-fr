import React, { useState } from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import MathText from '../../../../common/components/MathText';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, ChevronRight, Play, Trophy, XCircle } from 'lucide-react';

export default function Module07Bilan() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(7);

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const questions = [
    {
      q: "Laquelle de ces fractions est irréductible ?",
      options: [
        { label: "$\\frac{15}{20}$", correct: false },
        { label: "$\\frac{14}{21}$", correct: false },
        { label: "$\\frac{16}{25}$", correct: true }
      ],
      feedback: "16 et 25 n'ont aucun diviseur commun. (16 = 2x2x2x2 et 25 = 5x5)."
    },
    {
      q: "Calculez : $\\frac{1}{3} + \\frac{1}{6}$",
      options: [
        { label: "$\\frac{2}{9}$", correct: false },
        { label: "$\\frac{1}{2}$", correct: true },
        { label: "$\\frac{2}{6}$", correct: false }
      ],
      feedback: "1/3 = 2/6. Donc 2/6 + 1/6 = 3/6, qui se simplifie en 1/2."
    },
    {
      q: "Par quelle opération remplace-t-on le calcul : $\\frac{4}{5} \\div \\frac{3}{7}$ ?",
      options: [
        { label: "$\\frac{5}{4} \\times \\frac{3}{7}$", correct: false },
        { label: "$\\frac{4}{5} \\times \\frac{7}{3}$", correct: true },
        { label: "$\\frac{5}{4} \\times \\frac{7}{3}$", correct: false }
      ],
      feedback: "On multiplie par l'inverse de la deuxième fraction."
    },
    {
      q: "Quel calcul effectue-t-on en premier dans : $2 - \\frac{1}{3} \\times \\frac{4}{5}$ ?",
      options: [
        { label: "La soustraction : $2 - \\frac{1}{3}$", correct: false },
        { label: "La multiplication : $\\frac{1}{3} \\times \\frac{4}{5}$", correct: true }
      ],
      feedback: "La multiplication est toujours prioritaire sur la soustraction (s'il n'y a pas de parenthèses)."
    }
  ];

  const handleAnswer = (correct) => {
    setSelectedAnswer(true);
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      setShowResult(true);
      if (score >= 3) {
        awardXP({ moduleId: 'L07', exerciseId: 'FINAL', amount: 100 });
        markModuleCompleted('L07');
      }
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={7}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Évaluation Finale"
      moduleSubtitle="Testez vos connaissances sur l'ensemble de la leçon."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={null}
    >
      <div className="max-w-2xl mx-auto">
        {!started ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
            <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Prêt pour le bilan ?</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Ce test final comporte {questions.length} questions. Il permet de valider définitivement vos compétences sur les nombres rationnels.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-all flex items-center gap-2 mx-auto"
            >
              <Play fill="currentColor" size={20} />
              Démarrer l'évaluation
            </button>
          </div>
        ) : showResult ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center animate-in zoom-in duration-500">
            {score >= 3 ? (
              <>
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Félicitations !</h2>
                <p className="text-emerald-600 font-bold text-2xl mb-4">{score} / {questions.length}</p>
                <p className="text-slate-600 mb-6">Vous maîtrisez les nombres rationnels. La leçon est validée.</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <XCircle size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Presque...</h2>
                <p className="text-rose-600 font-bold text-2xl mb-4">{score} / {questions.length}</p>
                <p className="text-slate-600 mb-6">Il vous faut au moins 3 bonnes réponses pour valider. Révisez les modules précédents et réessayez.</p>
                <button
                  onClick={() => { setStarted(false); setCurrentQ(0); setScore(0); setShowResult(false); }}
                  className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200"
                >
                  Recommencer le test
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question {currentQ + 1} sur {questions.length}</span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`w-8 h-2 rounded-full ${i === currentQ ? 'bg-indigo-600' : i < currentQ ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              <MathText>{questions[currentQ].q}</MathText>
            </h3>

            <div className="space-y-3 mb-8">
              {questions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(opt.correct)}
                  className={`w-full text-left p-5 rounded-2xl border-2 font-medium text-lg transition-all ${
                    selectedAnswer
                      ? opt.correct
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-white border-slate-200 opacity-50'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700'
                  }`}
                >
                  <MathText>{opt.label}</MathText>
                </button>
              ))}
            </div>

            {selectedAnswer && (
              <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} animate-in fade-in`}>
                <p className="font-bold mb-1 flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
                </p>
                <p className="text-sm opacity-90"><MathText>{questions[currentQ].feedback}</MathText></p>
                <div className="mt-4 flex justify-end">
                  <button onClick={nextQuestion} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    {currentQ < questions.length - 1 ? 'Suivante' : 'Terminer'} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
