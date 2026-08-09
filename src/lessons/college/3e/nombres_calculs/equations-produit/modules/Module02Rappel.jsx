import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function Module02Rappel() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(2);

  const [balanceStep, setBalanceStep] = useState(0); 
  // 0: 3x - 6 = 0
  // 1: 3x = 6
  // 2: x = 2
  
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const exercises = [
    { eq: 'x + 4 = 0', ans: -4, opts: [4, -4, 0] },
    { eq: '3x - 9 = 0', ans: 3, opts: [3, -3, 9] },
    { eq: '5x + 10 = 0', ans: -2, opts: [2, -2, 5] },
    { eq: '-2x + 8 = 0', ans: 4, opts: [-4, 4, -8] }
  ];

  const handleNext = () => markModuleCompleted('L02');

  const doBalanceOp = (op) => {
    if (balanceStep === 0 && op === '+6') {
      setBalanceStep(1);
    } else if (balanceStep === 1 && op === '/3') {
      setBalanceStep(2);
      awardXP({ moduleId: 'L02', exerciseId: 'balance', amount: 30 });
    }
  };

  const handleExercise = (val) => {
    setSelectedAnswer(val);
    const isCorrect = val === exercises[exerciseIndex].ans;
    if (isCorrect) {
      awardXP({ moduleId: 'L02', exerciseId: `ex_${exerciseIndex}`, amount: 15 });
    }
  };

  const nextExercise = () => {
    setSelectedAnswer(null);
    setExerciseIndex(idx => idx + 1);
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
      moduleTitle="Rappel : Le Premier Degré"
      moduleSubtitle="S'entraîner à résoudre ax + b = 0, une compétence vitale pour la suite."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La Balance Interactive" color="amber" />

        <p className="text-slate-700 leading-relaxed mb-4">
          Avant d'attaquer les équations plus complexes, assurons-nous que vous maîtrisez la base : <strong>isoler x</strong>.
          <br />Pour résoudre <MathText>{'$3x - 6 = 0$'}</MathText>, vous devez faire les mêmes opérations des deux côtés de la balance.
        </p>

        <div className="bg-amber-50 p-6 md:p-8 rounded-2xl border border-amber-200 text-center">
          
          <div className="flex justify-center items-center gap-8 mb-8 text-2xl font-bold font-mono">
            <div className={`p-4 rounded-xl border-2 transition-all ${balanceStep >= 1 ? 'border-amber-300 bg-amber-100 text-amber-800' : 'border-slate-300 bg-white text-slate-800'}`}>
              {balanceStep === 0 && <MathText>{'$3x - 6$'}</MathText>}
              {balanceStep === 1 && <MathText>{'$3x$'}</MathText>}
              {balanceStep === 2 && <MathText>{'$x$'}</MathText>}
            </div>
            <div className="text-slate-400">=</div>
            <div className={`p-4 rounded-xl border-2 transition-all ${balanceStep >= 1 ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-white text-slate-800'}`}>
              {balanceStep === 0 && '0'}
              {balanceStep === 1 && '6'}
              {balanceStep === 2 && '2'}
            </div>
          </div>
          
          {/* Controls */}
          {balanceStep === 0 && (
            <div className="animate-in fade-in zoom-in duration-300">
              <p className="text-sm font-bold text-slate-600 mb-4">Quelle opération faire des deux côtés pour annuler le "-6" ?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => doBalanceOp('-6')} className="px-6 py-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all">-6</button>
                <button onClick={() => doBalanceOp('+6')} className="px-6 py-3 rounded-xl border-2 border-amber-500 bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all">+6</button>
                <button onClick={() => doBalanceOp('/3')} className="px-6 py-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all">÷3</button>
              </div>
            </div>
          )}
          
          {balanceStep === 1 && (
            <div className="animate-in fade-in zoom-in duration-300">
              <p className="text-sm font-bold text-slate-600 mb-4">Maintenant que nous avons 3x, comment trouver un seul x ?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => doBalanceOp('-3')} className="px-6 py-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all">-3</button>
                <button onClick={() => doBalanceOp('*3')} className="px-6 py-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all">×3</button>
                <button onClick={() => doBalanceOp('/3')} className="px-6 py-3 rounded-xl border-2 border-amber-500 bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all">÷3</button>
              </div>
            </div>
          )}
          
          {balanceStep === 2 && (
            <div className="animate-in fade-in zoom-in duration-300 p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-bold flex items-center justify-center gap-3">
              <CheckCircle2 /> Équation résolue ! x = 2.
            </div>
          )}
          
        </div>
      </section>

      {balanceStep === 2 && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4">
          <SectionHeader number={2} title="À vous de jouer (Mentalement !)" color="emerald" />
          
          <p className="text-slate-700 mb-4">
            Pour la suite de la leçon, vous devrez être capable de résoudre ces petites équations presque de tête. Entraînons-nous !
          </p>

          {exerciseIndex < exercises.length ? (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Équation {exerciseIndex + 1} / {exercises.length}</span>
              </div>
              
              <div className="text-3xl font-mono font-bold text-slate-800 text-center mb-8">
                <MathText>{`$${exercises[exerciseIndex].eq}$`}</MathText>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {exercises[exerciseIndex].opts.map(opt => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = exercises[exerciseIndex].ans === opt;
                  
                  let btnClass = "py-4 rounded-xl font-bold text-xl transition-all border-2 ";
                  if (!selectedAnswer) {
                    btnClass += "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50";
                  } else {
                    if (isSelected && isCorrect) btnClass += "bg-emerald-500 border-emerald-600 text-white";
                    else if (isSelected && !isCorrect) btnClass += "bg-rose-500 border-rose-600 text-white";
                    else if (!isSelected && isCorrect) btnClass += "bg-emerald-100 border-emerald-300 text-emerald-700 opacity-50";
                    else btnClass += "bg-white border-slate-200 text-slate-300 opacity-50";
                  }

                  return (
                    <button 
                      key={opt}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleExercise(opt)}
                      className={btnClass}
                    >
                      <MathText>{`$x = ${opt}$`}</MathText>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 animate-in fade-in">
                  <div className={`font-bold flex items-center gap-2 ${selectedAnswer === exercises[exerciseIndex].ans ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedAnswer === exercises[exerciseIndex].ans ? (
                      <><CheckCircle2 /> Parfait !</>
                    ) : (
                      <>❌ Attention, vérifiez en remplaçant x !</>
                    )}
                  </div>
                  
                  <button 
                    onClick={selectedAnswer === exercises[exerciseIndex].ans ? nextExercise : () => setSelectedAnswer(null)} 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    {selectedAnswer === exercises[exerciseIndex].ans ? 'Suivant' : 'Réessayer'} <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center animate-in zoom-in">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-bold text-emerald-800 text-xl mb-2">Excellent !</h3>
              <p className="text-emerald-700">Vous êtes prêt pour affronter l'Équation Produit Nul.</p>
            </div>
          )}
        </section>
      )}
    </ModuleLayout>
  );
}
