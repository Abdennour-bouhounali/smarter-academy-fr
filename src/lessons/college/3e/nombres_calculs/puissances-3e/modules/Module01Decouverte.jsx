import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import AdaptiveFeedback from '../../../../../common/components/AdaptiveFeedback';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MathInput from '../../../../../common/components/MathInput';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// --- Composant utilitaire pour les mini-exercices adaptatifs ---
function MiniExercise({ question, questionLatex, expected, placeholder, hints, onCorrect }) {
  const [value, setValue] = useState('');
  
  const normalize = (s) => s.toLowerCase().replace(/\\times/g, '*').replace(/x/g, '*').replace(/\\cdot/g, '*').replace(/\s+/g, '');
  
  const validate = (valObj) => {
    const val = valObj.value;
    const normVal = normalize(val);
    
    let isCorrect = false;
    if (Array.isArray(expected)) {
      isCorrect = expected.some(exp => normalize(exp) === normVal);
    } else {
      isCorrect = normalize(expected) === normVal;
    }

    let feedback = null;
    if (!isCorrect) {
      if (normVal.includes('+')) feedback = "Attention, on utilise la multiplication (×), pas l'addition (+).";
      else if (normVal.match(/^[0-9]+$/) && !Array.isArray(expected) && expected.includes('^')) feedback = "N'oublie pas d'utiliser le symbole '^' pour écrire la puissance.";
    }

    return { isCorrect, fields: { global: isCorrect }, feedback };
  };

  const adaptiveState = useAdaptiveExercise({
    validate,
    guidanceSteps: hints,
    onSuccess: onCorrect
  });

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-4">
        {question && <p className="text-slate-700 font-medium mb-2">{question}</p>}
        {questionLatex && <div className="text-xl text-slate-800"><MathText>{questionLatex}</MathText></div>}
      </div>
      
      <ExerciseValidator
        adaptiveState={adaptiveState}
        onSubmit={() => adaptiveState.submitAnswer({ value })}
        disabled={adaptiveState.status === 'correct'}
      >
        <div className="flex items-center gap-3">
          <MathInput
            value={value}
            onChange={(val) => {
              setValue(val);
              if (adaptiveState.status !== 'idle') adaptiveState.reset();
            }}
            className={`flex-1 ${
              adaptiveState.status === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' :
              adaptiveState.status === 'error' ? 'border-amber-400 focus:border-amber-500' :
              'border-slate-300 focus:border-blue-500'
            }`}
            disabled={adaptiveState.status === 'correct'}
          />
          {adaptiveState.status === 'correct' && <CheckCircle2 className="text-emerald-500 shrink-0" size={28} />}
        </div>
      </ExerciseValidator>
    </div>
  );
}

export default function Module01Decouverte() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(1);

  const [step, setStep] = useState(1);
  const unlockStep = (s) => setStep(prev => Math.max(prev, s));

  const handleNext = () => markModuleCompleted('L01');

  // Étape 1 & 2
  const [repCount, setRepCount] = useState(7);
  const factorsArray = Array(repCount).fill(7);

  // Étape 3
  const [inputBase, setInputBase] = useState('');
  const [inputExp, setInputExp] = useState('');
  
  const step3AdaptiveState = useAdaptiveExercise({
    validate: (values) => {
      const b = values.base.trim();
      const e = values.exp.trim();
      let isCorrect = true;
      let fields = { base: true, exp: true };
      let feedback = null;

      if (b !== '7') {
        isCorrect = false;
        fields.base = false;
        feedback = b === repCount.toString() ? "Attention, tu as inversé la base et l'exposant !" : "Regarde bien le nombre qui se répète dans la multiplication.";
      }
      if (e !== repCount.toString()) {
        isCorrect = false;
        fields.exp = false;
        if (!feedback) {
          feedback = e === '7' ? "Attention, tu as inversé la base et l'exposant !" : `Combien de fois le nombre 7 apparaît-il dans la multiplication au-dessus ? Compte-les.`;
        }
      }

      return { isCorrect, fields, feedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "La base est le nombre qui se répète. L'exposant est le nombre de fois qu'il se répète." },
      { type: 'solution', content: `Le nombre qui se répète est 7 (la base). Il y en a ${repCount} (l'exposant). L'écriture est donc $7^{${repCount}}$.` }
    ],
    onSuccess: () => {
      awardXP({ moduleId: 'L01', exerciseId: 'decouverte-base-exp', amount: 50 });
      setTimeout(() => unlockStep(4), 1500);
    }
  });

  const isStep3Correct = step3AdaptiveState.status === 'correct';

  // Étape 5
  const [reverseCount, setReverseCount] = useState(1);
  
  const step5AdaptiveState = useAdaptiveExercise({
    validate: (values) => {
      const count = values.count;
      let isCorrect = count === 4;
      let feedback = null;
      if (!isCorrect) {
        if (count < 4) feedback = "Regarde bien l'exposant (4). Il faut plus de facteurs 5.";
        if (count > 4) feedback = "Tu as mis trop de facteurs 5. Regarde bien l'exposant (4).";
      }
      return { isCorrect, feedback };
    },
    guidanceSteps: [
      { type: 'hint', content: "L'exposant t'indique le nombre exact de facteurs qu'il faut afficher." },
      { type: 'solution', content: "Puisque l'exposant est 4, il faut exactement 4 facteurs 5." }
    ],
    onSuccess: () => {
      awardXP({ moduleId: 'L01', exerciseId: 'reverse-pow', amount: 30 });
      setTimeout(() => unlockStep(6), 1000);
    }
  });

  // Étape 6 - Entraînement
  const [ex1, setEx1] = useState(false);
  const [ex2, setEx2] = useState(false);
  const [ex3, setEx3] = useState(false);
  
  useEffect(() => {
    if (ex1 && ex2 && ex3 && step === 6) {
      awardXP({ moduleId: 'L01', exerciseId: 'training', amount: 50 });
      unlockStep(7);
    }
  }, [ex1, ex2, ex3, step, awardXP]);

  // Étape 7 - Erreur
  const [errorChoice, setErrorChoice] = useState(null);
  const [showErrorExplanations, setShowErrorExplanations] = useState(false);

  const handleErrorChoice = (choice) => {
    if (errorChoice !== null) return;
    setErrorChoice(choice);
    setShowErrorExplanations(true);
    if (choice === 'Non') {
      awardXP({ moduleId: 'L01', exerciseId: 'error-trap', amount: 30 });
    }
    setTimeout(() => unlockStep(8), 2000);
  };

  // Étape 8 - Libre
  const [freeBase, setFreeBase] = useState(3);
  const [freeExp, setFreeExp] = useState(4);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Qu'est-ce qu'une puissance ?"
      moduleSubtitle="Découvrez intuitivement pourquoi on utilise les puissances."
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <div className="space-y-12">
        
        {/* ÉTAPE 1, 2, 3 & 4 : DÉCOUVERTE */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10 space-y-8">
          <SectionHeader number={1} title="Le problème des multiplications longues" color="emerald" />
          
          <p className="text-slate-700 text-lg">
            Imaginons que nous devions multiplier le nombre <strong>7</strong> par lui-même un grand nombre de fois.
            Cette écriture devient vite très longue !
          </p>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-8">
            {/* Contrôle de répétitions */}
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <label className="text-emerald-800 font-medium">Nombre de répétitions (facteurs) : <span className="font-bold text-xl">{repCount}</span></label>
              <input 
                type="range" min="2" max="10" step="1" 
                value={repCount} 
                onChange={(e) => {
                  setRepCount(Number(e.target.value));
                  if (step < 2) unlockStep(2);
                  setInputExp(''); // Reset input if they are playing with slider
                }}
                className="w-full h-3 bg-white rounded-lg appearance-none cursor-pointer accent-emerald-600 border border-emerald-200 shadow-inner"
              />
            </div>

            {/* Affichage de la multiplication */}
            <div className="flex flex-wrap justify-center gap-2 items-center min-h-[80px]">
              <AnimatePresence>
                {factorsArray.map((_, i) => (
                  <motion.div
                    key={`factor-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-white border-2 border-emerald-300 text-emerald-700 font-bold text-2xl w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">
                      7
                    </div>
                    {i < repCount - 1 && (
                      <span className="text-emerald-400 font-bold text-xl">×</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Étape 3 : Saisie */}
            {step >= 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-lg mt-8 pt-8 border-t-2 border-emerald-200/50 flex flex-col items-center gap-6"
              >
                <p className="text-slate-700 text-lg text-center font-medium">
                  Peut-on écrire cette multiplication plus simplement ?<br/>
                  <span className="text-sm font-normal text-slate-500">
                    Complète l'écriture courte avec le nombre répété et le nombre de fois qu'il apparaît.
                  </span>
                </p>

                <ExerciseValidator
                  adaptiveState={step3AdaptiveState}
                  onSubmit={() => step3AdaptiveState.submitAnswer({ base: inputBase, exp: inputExp })}
                  disabled={isStep3Correct}
                >
                  <div className="flex items-center gap-4 text-3xl">
                    <div className="flex flex-col items-center">
                      <input 
                        type="text" 
                        value={inputBase}
                        onChange={(e) => { 
                          setInputBase(e.target.value); 
                          if (step < 3) unlockStep(3);
                          if (step3AdaptiveState.status !== 'idle') step3AdaptiveState.reset();
                        }}
                        className={`w-16 h-16 text-center rounded-xl border-2 font-bold focus:outline-none transition-colors ${
                          step3AdaptiveState.fieldStatuses?.base === true ? 'bg-emerald-600 text-white border-emerald-600' : 
                          step3AdaptiveState.fieldStatuses?.base === false ? 'bg-rose-50 border-rose-400 text-rose-800' :
                          'bg-white border-emerald-300 text-emerald-800 focus:border-emerald-500'
                        }`}
                        disabled={isStep3Correct || step3AdaptiveState.status === 'solution_viewed'}
                        placeholder="?"
                      />
                      <span className="text-xs text-slate-500 mt-2 font-medium">Base</span>
                    </div>

                    <div className="flex flex-col items-center -mt-8">
                      <input 
                        type="text" 
                        value={inputExp}
                        onChange={(e) => { 
                          setInputExp(e.target.value); 
                          if (step < 3) unlockStep(3);
                          if (step3AdaptiveState.status !== 'idle') step3AdaptiveState.reset();
                        }}
                        className={`w-12 h-12 text-center rounded-xl border-2 font-bold text-xl focus:outline-none transition-colors ${
                          step3AdaptiveState.fieldStatuses?.exp === true ? 'bg-emerald-600 text-white border-emerald-600' : 
                          step3AdaptiveState.fieldStatuses?.exp === false ? 'bg-rose-50 border-rose-400 text-rose-800' :
                          'bg-white border-emerald-300 text-emerald-800 focus:border-emerald-500'
                        }`}
                        disabled={isStep3Correct || step3AdaptiveState.status === 'solution_viewed'}
                        placeholder="?"
                      />
                      <span className="text-xs text-slate-500 mt-1 font-medium">Exposant</span>
                    </div>
                  </div>
                </ExerciseValidator>

                {isStep3Correct && (
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4">
                    <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-4xl font-bold shadow-lg flex items-center gap-4">
                      <span>🎉</span>
                      <MathText>{`$7^{${repCount}}$`}</MathText>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
          
          {step >= 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <KeyTakeaway color="emerald">
                <strong>La base</strong> est le nombre qui est multiplié.<br/>
                <strong>L'exposant</strong> indique combien de fois la base apparaît dans la multiplication.<br/><br/>
                On lit <strong>« 7 puissance {repCount} »</strong> ou <strong>« 7 exposant {repCount} »</strong>.
              </KeyTakeaway>
              <div className="mt-6 flex justify-center">
                <button onClick={() => unlockStep(5)} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 flex items-center gap-2">
                  Continuer <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </section>

        {/* ÉTAPE 5 : INVERSE */}
        {step >= 5 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10 space-y-8 animate-fade-in">
            <SectionHeader number={2} title="Le sens inverse" color="blue" />
            
            <p className="text-slate-700 text-lg">
              Si la puissance est une abréviation, que signifie l'écriture <span className="font-bold text-blue-700 text-xl"><MathText>{`$5^4$`}</MathText></span> ?<br/>
              Construis la multiplication correspondante en ajoutant le bon nombre de facteurs.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-8 min-h-[250px]">
              
              <ExerciseValidator
                adaptiveState={step5AdaptiveState}
                onSubmit={() => step5AdaptiveState.submitAnswer({ count: reverseCount })}
                disabled={step5AdaptiveState.status === 'correct'}
              >
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => {
                      setReverseCount(Math.max(1, reverseCount - 1));
                      if (step5AdaptiveState.status !== 'idle') step5AdaptiveState.reset();
                    }}
                    type="button"
                    className="w-12 h-12 bg-white border-2 border-slate-200 rounded-full text-slate-600 font-bold text-2xl hover:bg-slate-50 flex items-center justify-center shadow-sm disabled:opacity-50"
                    disabled={reverseCount <= 1 || step5AdaptiveState.status === 'correct'}
                  >
                    −
                  </button>
                  <div className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 min-w-[120px] text-center shadow-sm">
                    {reverseCount} facteur{reverseCount > 1 ? 's' : ''}
                  </div>
                  <button 
                    onClick={() => {
                      setReverseCount(Math.min(10, reverseCount + 1));
                      if (step5AdaptiveState.status !== 'idle') step5AdaptiveState.reset();
                    }}
                    type="button"
                    className="w-12 h-12 bg-blue-600 border-2 border-blue-700 rounded-full text-white font-bold text-2xl hover:bg-blue-700 flex items-center justify-center shadow-sm disabled:opacity-50"
                    disabled={reverseCount >= 10 || step5AdaptiveState.status === 'correct'}
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2 items-center min-h-[60px] mt-6">
                  <AnimatePresence>
                    {Array(reverseCount).fill(5).map((_, i) => (
                      <motion.div
                        key={`rev-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className={`border-2 font-bold text-2xl w-12 h-12 flex items-center justify-center rounded-xl shadow-sm transition-colors ${step5AdaptiveState.status === 'correct' ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-blue-300 text-blue-700'}`}>
                          5
                        </div>
                        {i < reverseCount - 1 && (
                          <span className={`font-bold text-xl ${step5AdaptiveState.status === 'correct' ? 'text-blue-600' : 'text-blue-400'}`}>×</span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ExerciseValidator>

              {step5AdaptiveState.status === 'correct' && (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-2 text-center space-y-4">
                  <KeyTakeaway color="blue">
                    L'exposant <strong>4</strong> indique bien que le nombre <strong>5</strong> apparaît <strong>4 fois</strong> dans la multiplication.
                  </KeyTakeaway>
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* ÉTAPE 6 : MINI-ENTRAÎNEMENT */}
        {step >= 6 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10 space-y-8 animate-fade-in">
            <SectionHeader number={3} title="Mini-entraînement" color="purple" />
            
            <p className="text-slate-700 text-lg">
              À vous de jouer ! Transformez ces écritures (utilisez `^` pour les puissances, et `*` pour la multiplication si besoin).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MiniExercise
                questionLatex="$2 \times 2 \times 2 \times 2$"
                expected={["2^4"]}
                placeholder="ex: 2^4"
                hints={[
                  { level: 1, type: 'hint', content: "Quel est le nombre qui est multiplié (la base) ?" },
                  { level: 2, type: 'hint', content: "Combien de fois apparaît le nombre 2 (l'exposant) ?" },
                  { level: 3, type: 'solution', content: "La réponse est 2^4." }
                ]}
                onCorrect={() => setEx1(true)}
              />
              
              <MiniExercise
                questionLatex="$6^3$"
                expected={["6*6*6", "6×6×6"]}
                placeholder="ex: 6*6*6"
                hints={[
                  { level: 1, type: 'hint', content: "La base est 6, donc c'est une multiplication de 6." },
                  { level: 2, type: 'hint', content: "L'exposant est 3, donc il faut écrire le nombre 6 trois fois." },
                  { level: 3, type: 'solution', content: "La réponse est 6*6*6." }
                ]}
                onCorrect={() => setEx2(true)}
              />

              <MiniExercise
                questionLatex="$5 \times 5 \times 5 \times 5 \times 5$"
                expected={["5^5"]}
                placeholder="ex: 5^5"
                hints={[
                  { level: 1, type: 'hint', content: "Compte le nombre de fois où le 5 apparaît." },
                  { level: 2, type: 'hint', content: "Le 5 apparaît 5 fois, donc l'exposant est 5." },
                  { level: 3, type: 'solution', content: "La réponse est 5^5." }
                ]}
                onCorrect={() => setEx3(true)}
              />
            </div>
          </section>
        )}

        {/* ÉTAPE 7 : L'ERREUR FRÉQUENTE */}
        {step >= 7 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10 space-y-8 animate-fade-in">
            <SectionHeader number={4} title="Le piège à éviter !" color="amber" />
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-8">
              <h3 className="text-2xl font-bold text-amber-900 text-center">
                Ces deux écritures représentent-elles la même chose ?
              </h3>
              
              <div className="flex gap-12 text-5xl font-black text-amber-700 bg-white px-8 py-6 rounded-2xl shadow-sm border border-amber-100">
                <MathText>{`$4 \\times 3$`}</MathText>
                <span className="text-slate-300">et</span>
                <MathText>{`$4^3$`}</MathText>
              </div>

              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={() => handleErrorChoice('Oui')}
                  className={`flex-1 py-4 rounded-xl font-bold text-xl transition-colors border-2 ${
                    errorChoice === 'Oui' ? 'bg-red-500 text-white border-red-600' : 
                    errorChoice !== null ? 'opacity-50 cursor-not-allowed bg-white border-slate-200 text-slate-500' :
                    'bg-white border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                  disabled={errorChoice !== null}
                >
                  Oui
                </button>
                <button
                  onClick={() => handleErrorChoice('Non')}
                  className={`flex-1 py-4 rounded-xl font-bold text-xl transition-colors border-2 ${
                    errorChoice === 'Non' ? 'bg-emerald-500 text-white border-emerald-600' : 
                    errorChoice !== null ? 'opacity-50 cursor-not-allowed bg-white border-slate-200 text-slate-500' :
                    'bg-white border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                  disabled={errorChoice !== null}
                >
                  Non
                </button>
              </div>

              {showErrorExplanations && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-4">
                  {errorChoice === 'Oui' ? (
                    <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200 mb-6 font-medium text-lg text-center">
                      Attention ! C'est l'erreur la plus classique. Regardons de plus près.
                    </div>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-200 mb-6 font-medium text-lg text-center flex items-center justify-center gap-2">
                      <CheckCircle2 /> Excellent réflexe ! Ce n'est absolument pas la même chose.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
                      <div className="text-3xl font-bold text-slate-700"><MathText>{`$4 \\times 3$`}</MathText></div>
                      <p className="text-slate-600">Signifie qu'on ajoute 4 trois fois.</p>
                      <div className="bg-slate-100 w-full py-3 rounded-lg text-lg font-mono text-slate-700">
                        4 + 4 + 4 = 12
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200 flex flex-col items-center text-center gap-4">
                      <div className="text-3xl font-bold text-amber-700"><MathText>{`$4^3$`}</MathText></div>
                      <p className="text-slate-600">Signifie qu'on multiplie 4 par lui-même trois fois.</p>
                      <div className="bg-amber-100 w-full py-3 rounded-lg text-lg font-mono text-amber-800 font-bold">
                        4 × 4 × 4 = 64
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* ÉTAPE 8 : MANIPULATION LIBRE */}
        {step >= 8 && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10 space-y-8 animate-fade-in">
            <SectionHeader number={5} title="Construis ta propre puissance" color="indigo" />
            
            <p className="text-slate-700 text-lg">
              Maintenant que tu as compris, amuse-toi à générer de grandes puissances !
            </p>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-200">
                  <div className="flex justify-between mb-4">
                    <label className="font-bold text-slate-700">Base</label>
                    <span className="font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded text-lg">{freeBase}</span>
                  </div>
                  <input 
                    type="range" min="1" max="9" step="1" 
                    value={freeBase} 
                    onChange={(e) => setFreeBase(Number(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-200">
                  <div className="flex justify-between mb-4">
                    <label className="font-bold text-slate-700">Exposant</label>
                    <span className="font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded text-lg">{freeExp}</span>
                  </div>
                  <input 
                    type="range" min="0" max="8" step="1" 
                    value={freeExp} 
                    onChange={(e) => setFreeExp(Number(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 mt-4 w-full">
                {freeExp === 0 ? (
                  <div className="text-2xl font-mono text-slate-500 bg-white px-8 py-4 rounded-xl border border-slate-200">
                    (Convention : tout nombre non nul à la puissance 0 vaut 1)
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
                    {Array(freeExp).fill(freeBase).map((_, i) => (
                      <React.Fragment key={i}>
                        <span className="text-2xl font-bold text-indigo-400">{freeBase}</span>
                        {i < freeExp - 1 && <span className="text-xl text-slate-400">×</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                
                <div className="text-4xl font-bold text-indigo-700 mt-4 bg-white px-10 py-6 rounded-2xl shadow-sm border border-indigo-200">
                  <MathText>{`$${freeBase}^{${freeExp}} = ${Math.pow(freeBase, freeExp)}$`}</MathText>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </ModuleLayout>
  );
}
