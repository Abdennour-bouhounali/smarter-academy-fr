import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

// 8 questions couvrant toutes les compétences de la leçon.
// Les libellés de réponses contenant du LaTeX sont stockés sous forme de chaîne.
// Le composant les rend via MathText.
const QUESTIONS = [
  {
    id: 'q1',
    skill: 'image',
    text: "Soit $f(x) = 5x - 2$. Quelle est l'image de $3$ par $f$ ?",
    choices: ['13', '17', '7', '11'],
    answer: '13',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P1'] },
  },
  {
    id: 'q2',
    skill: 'antécédent',
    text: "Soit $g(x) = 3x + 1$. Quel est l'antécédent de $10$ ?",
    choices: ['3', '4', '7', '31'],
    answer: '3',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P2'] },
  },
  {
    id: 'q3',
    skill: 'tableau',
    text: "Pour $h(x) = -2x + 4$, quelle est la valeur $h(-1)$ ?",
    choices: ['6', '2', '-6', '-2'],
    answer: '6',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P3'] },
  },
  {
    id: 'q4',
    skill: 'linéaire',
    text: "Laquelle de ces fonctions est linéaire ?",
    choices: ['$f(x) = 3x + 1$', '$g(x) = -2x$', '$h(x) = x^2$', '$k(x) = 5$'],
    answer: '$g(x) = -2x$',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P4'] },
  },
  {
    id: 'q5',
    skill: 'affine',
    text: "Pour $f(x) = -4x + 7$, quelles sont les valeurs de $a$ et $b$ ?",
    choices: ['$a=4$, $b=7$', '$a=-4$, $b=7$', '$a=7$, $b=-4$', '$a=-4x$, $b=7$'],
    answer: '$a=-4$, $b=7$',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P5'] },
  },
  {
    id: 'q6',
    skill: 'graphique',
    text: "Une droite coupe l'axe des $y$ en $2$ et passe par $(1, 5)$. Quelle est son expression ?",
    choices: ['$f(x) = 2x + 3$', '$f(x) = 3x + 2$', '$f(x) = 5x + 2$', '$f(x) = 3x - 2$'],
    answer: '$f(x) = 3x + 2$',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P6'] },
  },
  {
    id: 'q7',
    skill: 'deux-points',
    text: "Deux points $A(0, 3)$ et $B(2, 9)$. Quel est le coefficient directeur ?",
    choices: ['3', '6', '2', '4'],
    answer: '3',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P7'] },
  },
  {
    id: 'q8',
    skill: 'deux-points',
    text: "Avec $A(1, 4)$ et $B(3, 10)$ (et $a = 3$), quelle est l'expression complète de $f$ ?",
    choices: ['$f(x) = 3x + 1$', '$f(x) = 3x + 4$', '$f(x) = 3x - 1$', '$f(x) = 3x + 3$'],
    answer: '$f(x) = 3x + 1$',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-affines_P8'] },
  },
];

const SKILL_LABELS = {
  image: "Calcul d'image",
  antécédent: "Recherche d'antécédent",
  tableau: 'Tableau de valeurs',
  linéaire: 'Fonction linéaire',
  affine: 'Fonction affine',
  graphique: 'Lecture graphique',
  'deux-points': 'Détermination par deux points',
};

export default function Module10BilanEvaluation() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink } = getNavLinks(10);

  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (qId, choice) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: choice }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < QUESTIONS.length) return;
    const score = QUESTIONS.filter(q => userAnswers[q.id] === q.answer).length;
    setSubmitted(true);
    if (score >= 6) {
      awardXP({ moduleId: 'L10', exerciseId: 'L10-bilan', amount: 150 });
      markModuleCompleted('L10');
    }
  };

  const score = submitted
    ? QUESTIONS.filter(q => userAnswers[q.id] === q.answer).length
    : null;

  const mastered = score !== null && score >= 6;
  const answeredAll = Object.keys(userAnswers).length === QUESTIONS.length;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={10}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Bilan Final"
      moduleSubtitle="Évaluation des 8 compétences clés de la leçon. Score de maîtrise : 6/8 minimum."
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={null}
      onNextClick={null}
    >
      {/* Résultats (si soumis) */}
      {submitted && (
        <section className={`rounded-3xl p-6 text-center space-y-4 border-2 ${mastered ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-300'}`}>
          <div className="text-5xl" aria-hidden="true">{mastered ? '🏆' : '📚'}</div>
          <h2 className="text-2xl font-space font-extrabold text-slate-900">
            Score : {score}/8
          </h2>
          <p className={`font-bold ${mastered ? 'text-emerald-700' : 'text-amber-700'}`}>
            {mastered
              ? '✅ Leçon maîtrisée ! Vous avez validé tous les objectifs de la leçon.'
              : '📖 Score insuffisant pour valider. Révisez les modules ci-dessous et réessayez.'}
          </p>
          {mastered && (
            <div className="text-sm text-emerald-600 font-mono">+150 XP gagnés !</div>
          )}

          {/* Bilan par compétence */}
          <div className="text-left space-y-2 mt-4">
            <h3 className="font-bold text-slate-800 text-sm">Bilan par compétence :</h3>
            {QUESTIONS.map(q => {
              const correct = userAnswers[q.id] === q.answer;
              return (
                <div key={q.id} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  <span aria-hidden="true">{correct ? '✓' : '✗'}</span>
                  <span className="font-bold">{SKILL_LABELS[q.skill]}</span>
                </div>
              );
            })}
          </div>

          {!mastered && (
            <Link
              to={MODULE_CTX.coursePath}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-800 text-white font-mono text-sm font-bold hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none"
            >
              ← Retour au parcours pour réviser
            </Link>
          )}
        </section>
      )}

      {/* Questions */}
      <section className="space-y-6">
        {!submitted && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-space font-bold text-slate-900">📝 Évaluation — 8 questions</h2>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {Object.keys(userAnswers).length}/{QUESTIONS.length} répondues
            </span>
          </div>
        )}

        {QUESTIONS.map((q, qi) => {
          const chosen = userAnswers[q.id];
          const isCorrect = submitted && chosen === q.answer;
          const isWrong = submitted && chosen !== q.answer;

          return (
            <div key={q.id} className={`bg-white rounded-2xl border p-5 space-y-3
              ${submitted ? (isCorrect ? 'border-emerald-300' : 'border-rose-300') : 'border-slate-200 shadow-sm'}`}>
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5
                  ${submitted ? (isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') : 'bg-slate-100 text-slate-600'}`}>
                  {qi + 1}
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">{SKILL_LABELS[q.skill]}</p>
                  <p className="text-sm text-slate-800 font-medium">
                    <MathText>{q.text}</MathText>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pl-10">
                {q.choices.map((choice, ci) => {
                  const isAnswer = choice === q.answer;
                  const isChosen = chosen === choice;
                  let btnClass = 'p-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-left focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none ';
                  if (!submitted && isChosen) btnClass += 'border-blue-400 bg-blue-50 text-blue-800';
                  else if (!submitted && !isChosen) btnClass += 'border-slate-200 hover:bg-slate-50 text-slate-700';
                  else if (submitted && isAnswer) btnClass += 'border-emerald-400 bg-emerald-50 text-emerald-800';
                  else if (submitted && isChosen && !isAnswer) btnClass += 'border-rose-400 bg-rose-50 text-rose-800';
                  else btnClass += 'border-slate-100 text-slate-400';

                  return (
                    <button
                      key={ci}
                      type="button"
                      onClick={() => handleAnswer(q.id, choice)}
                      disabled={submitted}
                      className={btnClass}
                      aria-pressed={isChosen}
                    >
                      <MathText>{String(choice)}</MathText>
                    </button>
                  );
                })}
              </div>

              {submitted && isWrong && (
                <p className="text-xs text-rose-700 pl-10 font-mono">
                  Bonne réponse : <strong><MathText>{String(q.answer)}</MathText></strong>
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* Bouton de soumission */}
      {!submitted && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answeredAll}
            className={`px-8 py-3 rounded-xl font-mono font-bold text-sm shadow-md transition-all focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none
              ${answeredAll
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {answeredAll
              ? '📝 Soumettre mon évaluation'
              : `Répondez à toutes les questions (${Object.keys(userAnswers).length}/${QUESTIONS.length})`}
          </button>
        </div>
      )}
    </ModuleLayout>
  );
}
