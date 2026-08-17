import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Split, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

export default function Module03ProduitNul() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(3);

  const [step, setStep] = useState('start'); // 'start', 'split', 'solved_left', 'solved_right', 'solved_both'
  const [leftSolved, setLeftSolved] = useState(false);
  const [rightSolved, setRightSolved] = useState(false);
  
  const handleSplit = () => {
    setStep('split');
    awardXP({ moduleId: 'L03', exerciseId: 'split_eq', amount: 20 });
  };

  const handleSolveLeft = () => {
    setLeftSolved(true);
    if (rightSolved) {
      setStep('solved_both');
      awardXP({ moduleId: 'L03', exerciseId: 'solve_both', amount: 50 });
    } else {
      setStep('solved_left');
    }
  };

  const handleSolveRight = () => {
    setRightSolved(true);
    if (leftSolved) {
      setStep('solved_both');
      awardXP({ moduleId: 'L03', exerciseId: 'solve_both', amount: 50 });
    } else {
      setStep('solved_right');
    }
  };

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exLeftStatus, setExLeftStatus] = useState('pending'); // 'pending', 'wrong', 'correct'
  const [exRightStatus, setExRightStatus] = useState('pending');
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');

  const exercises = [
    { eq: 'x(x + 5) = 0', leftAns: 0, rightAns: -5, leftEq: 'x = 0', rightEq: 'x + 5 = 0' },
    { eq: '(2x - 6)(x + 4) = 0', leftAns: 3, rightAns: -4, leftEq: '2x - 6 = 0', rightEq: 'x + 4 = 0' },
    { eq: '(3x + 9)(2x - 5) = 0', leftAns: -3, rightAns: 2.5, leftEq: '3x + 9 = 0', rightEq: '2x - 5 = 0' }
  ];

  const handleVerify = () => {
    let lCorrect = false;
    let rCorrect = false;

    if (parseFloat(leftValue) === exercises[exerciseIndex].leftAns) {
      setExLeftStatus('correct');
      lCorrect = true;
    } else {
      setExLeftStatus('wrong');
    }

    if (parseFloat(rightValue) === exercises[exerciseIndex].rightAns) {
      setExRightStatus('correct');
      rCorrect = true;
    } else {
      setExRightStatus('wrong');
    }

    if (lCorrect && rCorrect && (exLeftStatus !== 'correct' || exRightStatus !== 'correct')) {
      awardXP({ moduleId: 'L03', exerciseId: `ex_${exerciseIndex}`, amount: 30 });
    }
  };

  const nextExercise = () => {
    setExLeftStatus('pending');
    setExRightStatus('pending');
    setLeftValue('');
    setRightValue('');
    setExerciseIndex(idx => idx + 1);
  };

  const handleNext = () => markModuleCompleted('L03');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Séparer pour régner"
      moduleSubtitle="Appliquez la règle du zéro pour résoudre des équations produit."
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Séparation de l'équation" color="blue" />

        <p className="text-slate-700 leading-relaxed mb-4">
          Voici une <strong>Équation Produit Nul</strong> : deux blocs entre parenthèses sont multipliés et le résultat vaut zéro.
          <br />D'après la Règle du Zéro, il faut séparer cette équation en <strong>deux équations plus simples</strong> !
        </p>

        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
          
          <div className="text-center mb-8">
            <div className="text-3xl font-mono font-bold text-slate-800 bg-white inline-block px-6 py-4 rounded-xl border-2 border-slate-300 shadow-sm">
              <MathText>{'$\\color{#2563eb}{(2x + 4)} \\times \\color{#059669}{(x - 3)} = 0$'}</MathText>
            </div>
          </div>

          {step === 'start' && (
            <div className="flex justify-center animate-in zoom-in">
              <button 
                onClick={handleSplit}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all"
              >
                <Split size={20} /> Séparer en deux branches
              </button>
            </div>
          )}

          {step !== 'start' && (
            <div className="animate-in slide-in-from-top-4">
              {/* Splitting lines SVG */}
              <div className="relative w-full h-12 -mt-4 mb-4 pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none">
                   <line x1="50%" y1="0" x2="25%" y2="100%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                   <line x1="50%" y1="0" x2="75%" y2="100%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-50 px-2 text-xs font-bold text-slate-400 uppercase">
                  OU
                </div>
              </div>

              <div className="flex justify-between md:justify-around gap-4">
              <div className="flex-1 flex flex-col items-center">
                <div className={`p-4 rounded-xl border-2 mb-4 w-full text-center font-mono font-bold text-xl transition-all ${leftSolved ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-blue-400 text-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.2)]'}`}>
                  <MathText>{'$2x + 4 = 0$'}</MathText>
                </div>
                {!leftSolved ? (
                  <button onClick={handleSolveLeft} className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-lg transition-colors text-sm">
                    Résoudre : x = -2
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> x = -2
                  </div>
                )}
              </div>

              {/* Right Branch */}
              <div className="flex-1 flex flex-col items-center">
                <div className={`p-4 rounded-xl border-2 mb-4 w-full text-center font-mono font-bold text-xl transition-all ${rightSolved ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-emerald-400 text-slate-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
                  <MathText>{'$x - 3 = 0$'}</MathText>
                </div>
                {!rightSolved ? (
                  <button onClick={handleSolveRight} className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold rounded-lg transition-colors text-sm">
                    Résoudre : x = 3
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> x = 3
                  </div>
                )}
              </div>
            </div>
            </div>
          )}

          {(step === 'solved_left' || step === 'solved_right') && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-pulse">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-amber-800">
                Il manque une possibilité ! L'équation de départ s'annule aussi si l'autre parenthèse vaut zéro. Vous devez toujours résoudre les deux branches.
              </p>
            </div>
          )}

          {step === 'solved_both' && (
            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center animate-in zoom-in">
              <h4 className="font-bold text-indigo-800 mb-1">Excellent !</h4>
              <p className="text-indigo-700 text-sm">
                L'équation admet donc <strong>deux solutions</strong> : <span className="font-mono bg-white px-1 rounded"><MathText>{'$-2$'}</MathText></span> et <span className="font-mono bg-white px-1 rounded"><MathText>{'$3$'}</MathText></span>. On note souvent l'ensemble des solutions <MathText>{'$S = \\{ -2 ; 3 \\}$'}</MathText>.
              </p>
            </div>
          )}
          
        </div>
      </section>

      {step === 'solved_both' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4">
          <SectionHeader number={2} title="À vous de séparer" color="emerald" />
          
          <p className="text-slate-700 mb-4">
            C'est à votre tour. L'ordinateur a déjà séparé les deux branches, saisissez directement les solutions (rappel: utilisez un point pour les décimales, ex: 2.5).
          </p>

          {exerciseIndex < exercises.length ? (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Entraînement {exerciseIndex + 1} / {exercises.length}</span>
              </div>
              
              <div className="text-2xl md:text-3xl font-mono font-bold text-slate-800 text-center mb-8">
                <MathText>{`$${exercises[exerciseIndex].eq}$`}</MathText>
              </div>
              
              <div className="flex justify-between md:justify-center md:gap-16 items-start">
                
                {/* Left Eq */}
                <div className="flex-1 max-w-[200px] flex flex-col items-center">
                  <span className="font-mono font-bold text-blue-700 mb-2"><MathText>{`$${exercises[exerciseIndex].leftEq}$`}</MathText></span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">x =</span>
                    <input 
                      type="number" step="0.1"
                      disabled={exLeftStatus === 'correct'}
                      value={leftValue}
                      onChange={(e) => { setLeftValue(e.target.value); setExLeftStatus('pending'); }}
                      className={`w-20 p-2 text-center rounded-lg border-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${exLeftStatus === 'correct' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : exLeftStatus === 'wrong' ? 'bg-rose-50 border-rose-400 text-rose-800' : 'bg-white border-slate-300'}`} 
                    />
                  </div>
                  {exLeftStatus === 'wrong' && <span className="text-xs font-bold text-rose-600 mt-2">Revérifiez !</span>}
                  {exLeftStatus === 'correct' && <span className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Validé</span>}
                </div>

                <div className="font-bold text-slate-400 mt-8">OU</div>

                {/* Right Eq */}
                <div className="flex-1 max-w-[200px] flex flex-col items-center">
                  <span className="font-mono font-bold text-emerald-700 mb-2"><MathText>{`$${exercises[exerciseIndex].rightEq}$`}</MathText></span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">x =</span>
                    <input 
                      type="number" step="0.1"
                      disabled={exRightStatus === 'correct'}
                      value={rightValue}
                      onChange={(e) => { setRightValue(e.target.value); setExRightStatus('pending'); }}
                      className={`w-20 p-2 text-center rounded-lg border-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-colors ${exRightStatus === 'correct' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : exRightStatus === 'wrong' ? 'bg-rose-50 border-rose-400 text-rose-800' : 'bg-white border-slate-300'}`} 
                    />
                  </div>
                  {exRightStatus === 'wrong' && <span className="text-xs font-bold text-rose-600 mt-2">Revérifiez !</span>}
                  {exRightStatus === 'correct' && <span className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Validé</span>}
                </div>

              </div>

              {!(exLeftStatus === 'correct' && exRightStatus === 'correct') && (
                <div className="mt-8 flex justify-center animate-in fade-in">
                  <button 
                    onClick={handleVerify}
                    disabled={leftValue === '' || rightValue === ''}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Vérifier mes réponses
                  </button>
                </div>
              )}

              {exLeftStatus === 'correct' && exRightStatus === 'correct' && (
                <div className="mt-8 flex justify-end animate-in fade-in">
                  <button 
                    onClick={nextExercise} 
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
                  >
                    Exercice suivant <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center animate-in zoom-in">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="font-bold text-emerald-800 text-xl mb-2">Méthode acquise !</h3>
              <p className="text-emerald-700">Vous savez maintenant résoudre une équation produit nul complète.</p>
            </div>
          )}
        </section>
      )}
    </ModuleLayout>
  );
}
