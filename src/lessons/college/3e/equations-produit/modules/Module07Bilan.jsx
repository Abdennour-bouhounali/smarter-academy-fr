import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../common/components/SectionHeader';
import MathText from '../../../../common/components/MathText';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, XCircle, Award, ChevronRight } from 'lucide-react';

export default function Module07Bilan() {
  const { xp, awardXP, markModuleCompleted, markLessonCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink } = getNavLinks(7);
  const navigate = useNavigate();

  const questions = [
    {
      id: 1,
      q: "Parmi ces propositions, laquelle est une « Équation Produit Nul » ?",
      options: [
        { text: "x + (x - 5) = 0", isCorrect: false },
        { text: "x(x - 5) = 0", isCorrect: true },
        { text: "x² - 5 = 0", isCorrect: false }
      ],
      explanation: "Il faut une MULTIPLICATION de deux facteurs égale à zéro. « x + (x-5) » est une somme, et « x² - 5 » est une différence."
    },
    {
      id: 2,
      q: "Quelles sont les solutions de l'équation (x - 7)(2x + 8) = 0 ?",
      options: [
        { text: "x = -7 ou x = 4", isCorrect: false },
        { text: "x = 7 ou x = -4", isCorrect: true },
        { text: "x = 7 ou x = 4", isCorrect: false },
        { text: "x = -7 ou x = -8", isCorrect: false }
      ],
      explanation: "D'une part x - 7 = 0 donne x = 7. D'autre part 2x + 8 = 0 donne 2x = -8, soit x = -4."
    },
    {
      id: 3,
      q: "Comment factoriser x² - 9 pour pouvoir résoudre x² - 9 = 0 ?",
      options: [
        { text: "x(x - 9)", isCorrect: false },
        { text: "(x - 9)(x + 9)", isCorrect: false },
        { text: "(x - 3)(x + 3)", isCorrect: true }
      ],
      explanation: "C'est la différence de deux carrés : a² - b² = (a-b)(a+b). Ici, b² = 9 donc b = 3."
    },
    {
      id: 4,
      q: "Vrai ou Faux ? « Si A × B = 0, alors A = 0 ET B = 0 obligatoirement. »",
      options: [
        { text: "Vrai", isCorrect: false },
        { text: "Faux", isCorrect: true }
      ],
      explanation: "Faux ! C'est A = 0 OU B = 0. Il suffit qu'un SEUL des facteurs soit nul pour que le produit soit nul."
    },
    {
      id: 5,
      q: "Quelles sont les solutions de 5x(x + 1) = 0 ?",
      options: [
        { text: "x = -5 ou x = -1", isCorrect: false },
        { text: "x = 0 ou x = 1", isCorrect: false },
        { text: "x = 0 ou x = -1", isCorrect: true }
      ],
      explanation: "Le premier facteur est 5x (5x = 0 donne x = 0). Le deuxième est x + 1 (x + 1 = 0 donne x = -1)."
    }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (idx) => {
    if (isRevealed) return;
    setSelectedOpt(idx);
    setIsRevealed(true);

    const correct = questions[currentQ].options[idx].isCorrect;
    if (correct) {
      setScore(s => s + 1);
      awardXP({ moduleId: 'L07', exerciseId: `q${questions[currentQ].id}`, amount: 20 });
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelectedOpt(null);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
      markModuleCompleted('L07');
      markLessonCompleted();
      if (score === 5) {
        awardXP({ moduleId: 'L07', exerciseId: 'perfect', amount: 50 });
      }
    }
  };

  const handleFinish = () => {
    navigate('/courses');
  };

  const q = questions[currentQ];

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
      moduleSubtitle="Vérifiez vos acquis sur les équations produit nul."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={null}
      onNextClick={null}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* On met un fond clair (bg-slate-50) pour contraster avec le texte sombre du SectionHeader */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border-b border-slate-200 relative overflow-hidden">
          <SectionHeader number={7} title="Évaluation : Équations produit" color="slate" />
          {!isFinished && (
            <p className="text-slate-600 font-bold mt-2">
              Question {currentQ + 1} sur {questions.length}
            </p>
          )}
        </div>

        {!isFinished ? (
          <div className="p-4 md:p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-8">{q.q}</h3>
            
            <div className="space-y-4">
              {q.options.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-between ";
                
                if (!isRevealed) {
                  btnClass += "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50";
                } else {
                  if (opt.isCorrect) {
                    btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800";
                  } else if (idx === selectedOpt) {
                    btnClass += "bg-rose-100 border-rose-500 text-rose-800";
                  } else {
                    btnClass += "bg-white border-slate-200 text-slate-400 opacity-50";
                  }
                }

                return (
                  <button 
                    key={idx}
                    disabled={isRevealed}
                    onClick={() => handleSelect(idx)}
                    className={btnClass}
                  >
                    <MathText>{opt.text}</MathText>
                    {isRevealed && opt.isCorrect && <CheckCircle2 className="text-emerald-600" />}
                    {isRevealed && !opt.isCorrect && idx === selectedOpt && <XCircle className="text-rose-600" />}
                  </button>
                );
              })}
            </div>

            {isRevealed && (
              <div className="mt-8 animate-in slide-in-from-bottom-4">
                <div className={`p-4 rounded-xl mb-6 font-bold ${q.options[selectedOpt].isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {q.options[selectedOpt].isCorrect ? '✨ Bonne réponse !' : '❌ Mauvaise réponse.'}
                  <p className="text-slate-700 mt-2 font-normal">{q.explanation}</p>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
                  >
                    {currentQ < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center animate-in zoom-in duration-500">
            <Award size={64} className={`mx-auto mb-6 ${score === 5 ? 'text-amber-400' : 'text-slate-400'}`} />
            <h2 className="text-3xl font-black text-slate-800 mb-4">Leçon Terminée !</h2>
            <p className="text-xl text-slate-600 mb-8">
              Votre score : <strong className="text-indigo-600">{score} / {questions.length}</strong>
            </p>
            
            {score === 5 ? (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8">
                <h3 className="font-bold text-amber-800 mb-2">Perfection !</h3>
                <p className="text-amber-700">Vous maîtrisez parfaitement la résolution des équations produit nul et la factorisation.</p>
              </div>
            ) : score >= 3 ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl mb-8">
                <h3 className="font-bold text-emerald-800 mb-2">Bon travail !</h3>
                <p className="text-emerald-700">Vous avez acquis de solides bases. N'hésitez pas à refaire les modules où vous avez hésité.</p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8">
                <h3 className="font-bold text-blue-800 mb-2">Encore un peu d'entraînement</h3>
                <p className="text-blue-700">Les équations demandent de la pratique. Reprenez calmement la leçon depuis le début !</p>
              </div>
            )}

            <button 
              onClick={handleFinish}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Retourner aux cours
            </button>
          </div>
        )}
      </section>
    </ModuleLayout>
  );
}
