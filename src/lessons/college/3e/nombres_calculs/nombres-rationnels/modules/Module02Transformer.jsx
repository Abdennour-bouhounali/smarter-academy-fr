import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Module02Transformer() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(2);

  const handleNext = () => markModuleCompleted('L02');

  // Interactive Simplifier State
  const [num, setNum] = useState(24);
  const [den, setDen] = useState(36);
  const [history, setHistory] = useState([{ num: 24, den: 36, by: null }]);
  const [errorMsg, setErrorMsg] = useState('');

  const isIrreducible = num === 2 && den === 3;

  const handleDivide = (divisor) => {
    if (num % divisor === 0 && den % divisor === 0) {
      const newNum = num / divisor;
      const newDen = den / divisor;
      setNum(newNum);
      setDen(newDen);
      setHistory([...history, { num: newNum, den: newDen, by: divisor }]);
      setErrorMsg('');
    } else {
      setErrorMsg(`Attention, ${divisor} n'est pas un diviseur commun de ${num} et ${den}.`);
    }
  };

  const resetSimplifier = () => {
    setNum(24);
    setDen(36);
    setHistory([{ num: 24, den: 36, by: null }]);
    setErrorMsg('');
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
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Fractions irréductibles"
      moduleSubtitle="Simplifier une fraction au maximum en divisant numérateur et dénominateur par un même nombre."
      estimatedTime="8 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Le principe */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Qu'est-ce qu'une fraction irréductible ?" color="indigo" />

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-slate-700 leading-relaxed mb-4">
            Une fraction est dite <strong>irréductible</strong> lorsqu'on ne peut plus la simplifier.
            Cela signifie que le numérateur et le dénominateur n'ont <strong>plus de diviseur commun</strong> (à part 1).
          </p>

          <p className="text-slate-700 leading-relaxed mb-6">
            Pour simplifier une fraction, on divise <strong>le haut et le bas</strong> par un même nombre.
          </p>

          <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 text-center max-w-xl mx-auto">
            <h4 className="font-bold text-indigo-900 mb-4">Outil de simplification</h4>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-mono text-slate-800">{num}</div>
                <div className="w-12 h-1 bg-slate-800 my-1"></div>
                <div className="text-3xl font-mono text-slate-800">{den}</div>
              </div>
              
              {!isIrreducible && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-500 mb-1">Diviser par :</p>
                  <div className="flex gap-2">
                    {[2, 3, 4, 6].map(d => (
                      <button 
                        key={d}
                        onClick={() => handleDivide(d)}
                        className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 hover:scale-105 transition-all"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isIrreducible && (
                <div className="flex flex-col items-center text-emerald-600 animate-in zoom-in">
                  <CheckCircle2 size={32} />
                  <span className="font-bold mt-1">Irréductible !</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="text-rose-600 text-sm font-medium mb-4 flex items-center justify-center gap-2">
                <XCircle size={16} /> {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-slate-600 mt-6 border-t pt-4">
              <span className="font-medium mr-2">Historique :</span>
              {history.map((step, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span className="text-slate-400 font-mono text-xs">
                      (divisé par {step.by}) ➔
                    </span>
                  )}
                  <span className="font-mono font-bold">
                    {step.num}/{step.den}
                  </span>
                </React.Fragment>
              ))}
            </div>
            
            {history.length > 1 && (
              <button onClick={resetSimplifier} className="mt-4 text-sm text-indigo-600 underline">
                Recommencer
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Section 2 : Les méthodes avancées */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Méthode directe : Le plus grand diviseur commun" color="blue" />

        <p className="text-slate-700 leading-relaxed">
          Plutôt que de diviser plusieurs fois de suite (par 2, puis encore par 2, puis par 3...), vous pouvez chercher le plus grand diviseur commun (<strong>PGCD</strong>) ou utiliser la décomposition en <strong>facteurs premiers</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
            <h4 className="font-bold text-slate-800 mb-2">Méthode pas-à-pas</h4>
            <p className="text-sm text-slate-600 mb-3">
              On divise par des petits nombres jusqu'à bloquer.
            </p>
            <div className="text-center font-mono text-sm space-y-2">
              <MathText>{'$\\frac{24}{36}$'}</MathText>
              <div className="text-slate-400">↓ divisé par 2 ↓</div>
              <MathText>{'$\\frac{12}{18}$'}</MathText>
              <div className="text-slate-400">↓ divisé par 2 ↓</div>
              <MathText>{'$\\frac{6}{9}$'}</MathText>
              <div className="text-slate-400">↓ divisé par 3 ↓</div>
              <MathText>{'$\\frac{2}{3}$'}</MathText>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">Méthode directe (Facteurs premiers)</h4>
            <p className="text-sm text-blue-800 mb-3">
              On décompose tout en multiplications de nombres premiers.
            </p>
            <div className="text-center font-mono text-sm space-y-2">
              <MathText>{'$\\frac{24}{36} = \\frac{2 \\times 2 \\times 2 \\times 3}{2 \\times 2 \\times 3 \\times 3}$'}</MathText>
              <p className="text-blue-600 font-sans text-xs mt-2 italic">On barre les facteurs communs (deux « 2 » et un « 3 » en haut et en bas) :</p>
              <div className="text-lg mt-2">
                <MathText>{'$\\frac{2}{3}$'}</MathText>
              </div>
            </div>
          </div>
        </div>

        {/* Erreur fréquente */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mt-6">
          <p className="font-bold text-rose-900 mb-1 flex items-center gap-2">
            <XCircle size={18} /> Erreur classique
          </p>
          <p className="text-sm text-rose-800 mb-2">
            "Je simplifie le numérateur, mais j'oublie le dénominateur."
          </p>
          <div className="bg-white p-3 rounded border border-rose-100 flex items-center gap-4">
             <div className="text-rose-600 font-bold line-through"><MathText>{'$\\frac{24}{36} = \\frac{12}{36}$'}</MathText></div>
             <div className="text-emerald-600 font-bold"><MathText>{'$\\frac{24}{36} = \\frac{12}{18}$'}</MathText></div>
          </div>
          <p className="text-xs text-rose-700 mt-2">
            La valeur de la fraction change si vous ne divisez pas en bas !
          </p>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="À vous de jouer !" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Parmi ces fractions, laquelle est <strong>irréductible</strong> ?
            </p>
          }
          choices={[
            { label: <MathText>{'$\\frac{14}{21}$'}</MathText>, correct: false },
            { label: <MathText>{'$\\frac{15}{22}$'}</MathText>, correct: true },
            { label: <MathText>{'$\\frac{9}{27}$'}</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong> 15 et 22 n'ont aucun diviseur commun autre que 1. (15 est dans les tables de 3 et 5, 22 dans les tables de 2 et 11). (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Cherchez bien. <MathText>{'$\\frac{14}{21}$'}</MathText> peut se diviser par 7 en haut et en bas. <MathText>{'$\\frac{9}{27}$'}</MathText> peut se diviser par 9.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L02', exerciseId: 'L02-Q1', amount: 50 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="indigo">
        <li>
          • Pour <strong>simplifier</strong> une fraction, on divise son numérateur et son dénominateur par un même nombre.
        </li>
        <li>
          • Une fraction est <strong>irréductible</strong> quand on ne peut plus la simplifier.
        </li>
        <li>
          • Astuce : utiliser la décomposition en facteurs premiers permet de simplifier d'un seul coup les très grosses fractions.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
