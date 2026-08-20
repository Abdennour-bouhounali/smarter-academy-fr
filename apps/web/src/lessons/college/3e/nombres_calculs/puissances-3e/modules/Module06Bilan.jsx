import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useEvidenceSubmission } from '../../../../../common/hooks/useEvidenceSubmission';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

// Evaluation questions — final-evaluation stage, one entry per graded
// question in this Bilan. `learningPointIds` maps each question to the
// competency it certifies (docs/architecture/AI_LESSON_CONTRACT.md).
const Q1_META = {
  id: 'puissances-3e-bilan-q1',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P1'] },
};
const Q2_META = {
  id: 'puissances-3e-bilan-q2',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P2', '3e_puissances-3e_P3'] },
};
const Q3_META = {
  id: 'puissances-3e-bilan-q3',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P2'] },
};
const Q4_META = {
  id: 'puissances-3e-bilan-q4',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P4', '3e_puissances-3e_P5', '3e_puissances-3e_P6'] },
};

export default function Module06Bilan() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { submitEvidence } = useEvidenceSubmission(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(6);

  // States for the quiz
  const [q1Answer, setQ1Answer] = useState(null);
  const [q2Answer, setQ2Answer] = useState(null);
  const [q3Answer, setQ3Answer] = useState(null);
  
  // States for Q4 (Scientific Notation)
  const [q4Coef, setQ4Coef] = useState('');
  const [q4Exp, setQ4Exp] = useState('');

  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const q1Correct = 2; // "2^5"
  const q2Correct = 0; // "10^2"
  const q3Correct = 1; // "7^2"

  // Adaptive logic for Q4
  const validateQ4 = (coef, exp) => {
    let isCorrect = true;
    let hint = "";

    const c = coef.replace(',', '.');
    const e = exp;

    if (c !== '3.8') {
      isCorrect = false;
      const cNum = Number(c);
      if (isNaN(cNum)) {
        hint = "Le coefficient doit être un nombre.";
      } else if (cNum >= 10 || cNum < 1) {
        hint = "Le coefficient doit être compris entre 1 et 9,999...";
      } else {
        hint = "Mauvais coefficient pour 0,00038.";
      }
    } else if (e !== '-4') {
      isCorrect = false;
      hint = "Presque ! N'oubliez pas que pour un petit nombre (0,...), l'exposant de 10 est négatif.";
    }

    return { isCorrect, hint };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showResults) return;

    let newScore = 0;
    const isQ1Correct = q1Answer === q1Correct;
    const isQ2Correct = q2Answer === q2Correct;
    const isQ3Correct = q3Answer === q3Correct;
    if (isQ1Correct) newScore++;
    if (isQ2Correct) newScore++;
    if (isQ3Correct) newScore++;

    // Check Q4
    const resQ4 = validateQ4(q4Coef, q4Exp);
    if (resQ4.isCorrect) {
      newScore++;
    }

    submitEvidence(Q1_META, isQ1Correct, { picked: q1Answer });
    submitEvidence(Q2_META, isQ2Correct, { picked: q2Answer });
    submitEvidence(Q3_META, isQ3Correct, { picked: q3Answer });
    submitEvidence(Q4_META, resQ4.isCorrect, { coef: q4Coef, exp: q4Exp });

    setScore(newScore);
    setShowResults(true);

    if (newScore === 4) {
      awardXP({ moduleId: 'L06', exerciseId: 'bilan-perfect', amount: 100 });
      markModuleCompleted('L06');
    } else if (newScore >= 3) {
      awardXP({ moduleId: 'L06', exerciseId: 'bilan-pass', amount: 50 });
      markModuleCompleted('L06');
    }
  };

  const isPassed = score >= 3;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={6}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Bilan Final"
      moduleSubtitle="Vérifiez vos connaissances sur les puissances."
      estimatedTime="6 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={() => markModuleCompleted('L06')}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        <SectionHeader number={1} title="Évaluation" color="slate" />

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Q1 */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">
              1. Que vaut <MathText>{`$2 \\times 2 \\times 2 \\times 2 \\times 2$`}</MathText> ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['2 \\times 5', '5^2', '2^5'].map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !showResults && setQ1Answer(idx)}
                  className={`p-4 rounded-xl border-2 transition-all text-xl ${
                    q1Answer === idx 
                      ? showResults 
                        ? idx === q1Correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showResults && idx === q1Correct 
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-blue-200'
                  }`}
                  disabled={showResults}
                >
                  <MathText>{`$${opt}$`}</MathText>
                </button>
              ))}
            </div>
            {showResults && (
              <div className={`font-medium mt-2 p-3 rounded-lg border ${q1Answer === q1Correct ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {q1Answer === q1Correct ? '✅ Correct ! La base 2 est multipliée 5 fois par elle-même.' : '❌ Faux ! La base est 2, et elle apparaît 5 fois dans la multiplication, donc 2^5.'}
              </div>
            )}
          </div>

          {/* Q2 */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">
              2. Que vaut <MathText>{`$10^5 \\times 10^{-3}$`}</MathText> ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['10^2', '10^{-15}', '10^8'].map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !showResults && setQ2Answer(idx)}
                  className={`p-4 rounded-xl border-2 transition-all text-xl ${
                    q2Answer === idx 
                      ? showResults 
                        ? idx === q2Correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showResults && idx === q2Correct 
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-blue-200'
                  }`}
                  disabled={showResults}
                >
                  <MathText>{`$${opt}$`}</MathText>
                </button>
              ))}
            </div>
            {showResults && (
              <div className={`font-medium mt-2 p-3 rounded-lg border ${q2Answer === q2Correct ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {q2Answer === q2Correct ? '✅ Correct ! On additionne les exposants : 5 + (-3) = 2.' : '❌ Faux ! Il faut additionner les exposants : 5 + (-3) = 2, donc 10^2.'}
              </div>
            )}
          </div>

          {/* Q3 */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">
              3. Simplifiez <MathText>{`$\\frac{7^6}{7^4}$`}</MathText>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['7^{10}', '7^2', '7^{24}'].map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !showResults && setQ3Answer(idx)}
                  className={`p-4 rounded-xl border-2 transition-all text-xl ${
                    q3Answer === idx 
                      ? showResults 
                        ? idx === q3Correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showResults && idx === q3Correct 
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-blue-200'
                  }`}
                  disabled={showResults}
                >
                  <MathText>{`$${opt}$`}</MathText>
                </button>
              ))}
            </div>
            {showResults && (
              <div className={`font-medium mt-2 p-3 rounded-lg border ${q3Answer === q3Correct ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {q3Answer === q3Correct ? '✅ Correct ! On soustrait les exposants : 6 - 4 = 2.' : '❌ Faux ! Il faut soustraire les exposants : 6 - 4 = 2, donc 7^2.'}
              </div>
            )}
          </div>

          {/* Q4 */}
          <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg">
              4. Quelle est l'écriture scientifique de <strong className="text-slate-900">0,000 38</strong> ?
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 text-xl font-bold text-slate-700 mt-4">
              <input 
                type="text" 
                value={q4Coef}
                onChange={(e) => setQ4Coef(e.target.value)}
                className="w-24 bg-white border-2 border-slate-300 rounded-xl px-4 py-2 text-center focus:border-blue-500 outline-none"
                placeholder="a"
                disabled={showResults}
              />
              <span className="text-slate-400"><MathText>{`$\\times$`}</MathText></span>
              <span className="text-slate-800">10</span>
              <input 
                type="text" 
                value={q4Exp}
                onChange={(e) => setQ4Exp(e.target.value)}
                className="w-16 bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-center focus:border-blue-500 outline-none -mt-4 text-base"
                placeholder="n"
                disabled={showResults}
              />
            </div>
            
            {showResults && !validateQ4(q4Coef, q4Exp).isCorrect && (
              <div className="text-rose-600 font-medium mt-2 bg-rose-50 p-3 rounded-lg border border-rose-200">
                ❌ {validateQ4(q4Coef, q4Exp).hint}
              </div>
            )}
            {showResults && validateQ4(q4Coef, q4Exp).isCorrect && (
              <div className="text-emerald-700 font-medium mt-2 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                ✅ Correct !
              </div>
            )}
          </div>

          {/* Submit */}
          {!showResults ? (
            <div className="flex justify-center pt-6">
              <button 
                type="submit"
                disabled={q1Answer === null || q2Answer === null || q3Answer === null || !q4Coef || !q4Exp}
                className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 text-lg w-full sm:w-auto"
              >
                Valider mes réponses
              </button>
            </div>
          ) : (
            <div className="animate-fade-in text-center space-y-6 pt-6">
              <div className={`inline-block px-8 py-6 rounded-2xl border-4 ${isPassed ? 'border-emerald-500 bg-emerald-50' : 'border-amber-500 bg-amber-50'}`}>
                <div className="text-5xl mb-4">{isPassed ? '🏆' : '💪'}</div>
                <h3 className={`text-2xl font-black ${isPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                  Score : {score} / 4
                </h3>
                <p className={`mt-2 font-medium ${isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isPassed 
                    ? "Bravo ! Vous avez validé cette leçon avec succès."
                    : "Vous y êtes presque ! Révisez les points qui vous posent problème et réessayez."}
                </p>
              </div>
              
              {!isPassed && (
                <div>
                  <button 
                    onClick={() => {
                      setShowResults(false);
                      setScore(0);
                    }}
                    className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>
          )}

        </form>
      </section>
    </ModuleLayout>
  );
}
