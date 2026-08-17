import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX } from '../moduleContext';
import { Check, X, RotateCcw, Award, ChevronRight } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../../../../../common/hooks/useProgress';

const QUESTIONS = [
  {
    id: 1,
    title: "Identifier l'hypoténuse",
    question: "Dans le triangle DEF rectangle en E, quel est le côté qui représente l'hypoténuse ?",
    options: [
      { id: 'a', text: "Le côté DE" },
      { id: 'b', text: "Le côté DF" },
      { id: 'c', text: "Le côté EF" }
    ],
    correctId: 'b',
    explanation: "L'hypoténuse est le côté opposé à l'angle droit (ici E), c'est donc DF."
  },
  {
    id: 2,
    title: "L'égalité de Pythagore",
    question: "Quelle égalité est vraie pour le triangle DEF rectangle en E ?",
    options: [
      { id: 'a', text: <MathText>{'$DE^2 + EF^2 = DF^2$'}</MathText> },
      { id: 'b', text: <MathText>{'$DF^2 + EF^2 = DE^2$'}</MathText> },
      { id: 'c', text: <MathText>{'$DE + EF = DF$'}</MathText> }
    ],
    correctId: 'a',
    explanation: "La somme des carrés des petits côtés est égale au carré de l'hypoténuse."
  },
  {
    id: 3,
    title: "Calcul de l'hypoténuse",
    question: "Si DE = 3 et EF = 4 (triangle rectangle en E), combien vaut DF ?",
    options: [
      { id: 'a', text: "7" },
      { id: 'b', text: "5" },
      { id: 'c', text: "25" }
    ],
    correctId: 'b',
    explanation: "3² + 4² = 9 + 16 = 25. Et √25 = 5."
  },
  {
    id: 4,
    title: "Soustraction des carrés",
    question: "Un triangle GHI est rectangle en G. L'hypoténuse HI mesure 13 et GH mesure 12. Quelle est la valeur de GI² ?",
    options: [
      { id: 'a', text: "169 + 144 = 313" },
      { id: 'b', text: "169 - 144 = 25" },
      { id: 'c', text: "13 - 12 = 1" }
    ],
    correctId: 'b',
    explanation: "Pour trouver un petit côté, on soustrait le carré connu au carré de l'hypoténuse."
  },
  {
    id: 5,
    title: "Réciproque ou Contraposée ?",
    question: "On a un triangle JKL. On calcule le carré du plus grand côté et on trouve qu'il N'EST PAS ÉGAL à la somme des carrés des deux autres côtés. Que conclut-on ?",
    options: [
      { id: 'a', text: "Il est rectangle (Réciproque)" },
      { id: 'b', text: "Il n'est pas rectangle (Contraposée)" },
      { id: 'c', text: "On ne peut pas savoir" }
    ],
    correctId: 'b',
    explanation: "Puisque l'égalité de Pythagore n'est pas vérifiée, c'est la contraposée qui prouve qu'il n'est pas rectangle."
  }
];

export default function Module07Bilan() {
  const { markModuleCompleted } = useProgress(MODULE_CTX.lessonId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const q = QUESTIONS[currentQuestion];

  const handleSelect = (id) => {
    if (!isValidated) setSelectedAnswer(id);
  };

  const handleValidate = () => {
    if (!selectedAnswer) return;
    setIsValidated(true);
    if (selectedAnswer === q.correctId) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setIsValidated(false);
    } else {
      setShowResults(true);
      markModuleCompleted('L07');
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsValidated(false);
    setScore(0);
    setShowResults(false);
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleNumber={7}
      moduleTitle="Bilan Final"
      moduleSubtitle="Évaluation globale sur le théorème de Pythagore."
      estimatedTime="10 min"
      prevLink={null}
      nextLink={null} // C'est la fin du chapitre
      xp={100}
    >
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {!showResults ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
            {/* Progression */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Question {currentQuestion + 1} / {QUESTIONS.length}
              </span>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-2 w-8 rounded-full ${i === currentQuestion ? 'bg-blue-600' : i < currentQuestion ? 'bg-blue-200' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-slate-800 mb-2">{q.title}</h2>
              <p className="text-slate-600 mb-8">{q.question}</p>

              <div className="space-y-3 mb-8">
                {q.options.map(opt => {
                  const isSelected = selectedAnswer === opt.id;
                  const isCorrect = opt.id === q.correctId;
                  
                  let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                  if (!isValidated) {
                    btnClass += isSelected ? "border-blue-500 bg-blue-50 text-blue-800 font-medium" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
                  } else {
                    if (isCorrect) {
                      btnClass += "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                    } else if (isSelected && !isCorrect) {
                      btnClass += "border-rose-500 bg-rose-50 text-rose-800";
                    } else {
                      btnClass += "border-slate-200 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      disabled={isValidated}
                      className={btnClass}
                    >
                      <div className="flex justify-between items-center">
                        <span>{opt.text}</span>
                        {isValidated && isCorrect && <Check className="text-emerald-600" size={20} />}
                        {isValidated && isSelected && !isCorrect && <X className="text-rose-600" size={20} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto">
                <AnimatePresence>
                  {isValidated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl mb-6 ${selectedAnswer === q.correctId ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                    >
                      <p className="font-bold mb-1">{selectedAnswer === q.correctId ? 'Bonne réponse !' : 'Oups...'}</p>
                      <p className="text-sm opacity-90">{q.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isValidated ? (
                  <button
                    onClick={handleValidate}
                    disabled={!selectedAnswer}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedAnswer ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    Vérifier
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-slate-800 hover:bg-slate-900 text-white shadow-md flex justify-center items-center gap-2"
                  >
                    {currentQuestion < QUESTIONS.length - 1 ? 'Question suivante' : 'Voir les résultats'} <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-lg border border-slate-200"
          >
            <div className="w-24 h-24 mx-auto bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
              <Award size={48} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Bilan terminé !</h2>
            <p className="text-slate-600 mb-8">Vous avez complété l'évaluation sur le théorème de Pythagore.</p>
            
            <div className="text-6xl font-black text-blue-600 mb-4">
              {score} <span className="text-2xl text-slate-400">/ {QUESTIONS.length}</span>
            </div>
            
            <div className="mb-10 text-slate-700 font-medium">
              {score === QUESTIONS.length && "Parfait ! La leçon est maîtrisée à 100% !"}
              {score >= QUESTIONS.length / 2 && score < QUESTIONS.length && "Bon travail ! Quelques petites erreurs mais l'essentiel est compris."}
              {score < QUESTIONS.length / 2 && "C'est encore fragile, n'hésitez pas à refaire les modules d'entraînement."}
            </div>

            <button
              onClick={handleRetry}
              className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw size={20} /> Recommencer le test
            </button>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
