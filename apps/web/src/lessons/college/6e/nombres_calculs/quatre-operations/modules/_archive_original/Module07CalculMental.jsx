import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Stratégies de calcul mental ───────────────────────────── */
const STRATEGIES = [
  {
    id: 'plus10',
    title: '+9 = +10 puis −1',
    example: { calc: '47 + 9', steps: ['47 + 10 = 57', '57 − 1 = 56'], result: 56 },
    quiz: { q: '63 + 9 = ?', ans: 72, hint: 'Ajoute 10, puis retire 1.' },
    color: 'emerald',
  },
  {
    id: 'moins10',
    title: '−9 = −10 puis +1',
    example: { calc: '54 − 9', steps: ['54 − 10 = 44', '44 + 1 = 45'], result: 45 },
    quiz: { q: '83 − 9 = ?', ans: 74, hint: 'Retire 10, puis ajoute 1.' },
    color: 'blue',
  },
  {
    id: 'fois5',
    title: '×5 = ×10 ÷ 2',
    example: { calc: '14 × 5', steps: ['14 × 10 = 140', '140 ÷ 2 = 70'], result: 70 },
    quiz: { q: '26 × 5 = ?', ans: 130, hint: '26 × 10 = 260, puis ÷ 2.' },
    color: 'violet',
  },
  {
    id: 'double',
    title: 'Double / moitié',
    example: { calc: '17 × 2', steps: ['Double de 17 = 34'], result: 34 },
    quiz: { q: '24 ÷ 2 = ?', ans: 12, hint: 'Moitié de 24 : moitié de 20 + moitié de 4.' },
    color: 'amber',
  },
  {
    id: 'decompose',
    title: 'Décomposer pour additionner',
    example: { calc: '39 + 27', steps: ['39 + 20 + 7', '= 59 + 7', '= 66'], result: 66 },
    quiz: { q: '48 + 35 = ?', ans: 83, hint: '48 + 30 + 5 = 78 + 5 = ?' },
    color: 'cyan',
  },
];

const colorBtn = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  blue: 'bg-blue-600 hover:bg-blue-700 text-white',
  violet: 'bg-violet-600 hover:bg-violet-700 text-white',
  amber: 'bg-amber-600 hover:bg-amber-700 text-white',
  cyan: 'bg-cyan-600 hover:bg-cyan-700 text-white',
};

const colorCard = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
};

/* ─── Carte stratégie ────────────────────────────────────────── */
function StrategyCard({ strat, onMastered, mastered }) {
  const [showExample, setShowExample] = useState(false);
  const [exStep, setExStep] = useState(0);
  const [quizVal, setQuizVal] = useState('');
  const [quizFb, setQuizFb] = useState(null);
  const c = colorCard[strat.color];
  const btn = colorBtn[strat.color];

  const checkQuiz = () => {
    if (parseInt(quizVal) === strat.quiz.ans) {
      setQuizFb('ok');
      if (!mastered) onMastered();
    } else setQuizFb('ko');
  };

  return (
    <div className={`border-2 rounded-2xl p-5 space-y-4 ${mastered ? 'border-emerald-300 bg-emerald-50/30' : `${c} border`}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">Stratégie</div>
          <div className="text-base font-space font-bold text-slate-800">{strat.title}</div>
        </div>
        {mastered && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
      </div>

      {!showExample && !mastered && (
        <button onClick={() => setShowExample(true)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${btn}`}>
          Voir l'exemple →
        </button>
      )}

      {(showExample || mastered) && (
        <div className="space-y-3">
          {/* Exemple animé */}
          <div className={`rounded-xl p-4 border ${c} space-y-2`}>
            <div className="text-xs font-mono font-bold uppercase">Exemple : {strat.example.calc}</div>
            <div className="space-y-1">
              {strat.example.steps.slice(0, exStep + 1).map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-sm font-bold">
                  {i < strat.example.steps.length - 1 ? `→ ${s}` : `✓ ${s} = ${strat.example.result}`}
                </motion.div>
              ))}
            </div>
            {exStep < strat.example.steps.length - 1 && (
              <button onClick={() => setExStep((v) => v + 1)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${btn}`}>
                Étape suivante →
              </button>
            )}
          </div>

          {/* Quiz */}
          {exStep >= strat.example.steps.length - 1 && !mastered && (
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-700">À toi : <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{strat.quiz.q}</span></div>
              <div className="flex gap-2">
                <input type="number" value={quizVal} onChange={(e) => { setQuizVal(e.target.value); setQuizFb(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') checkQuiz(); }}
                  placeholder="?" className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 text-lg font-mono text-center focus:outline-none focus:border-indigo-400" />
                <button onClick={checkQuiz} disabled={!quizVal} className={`px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-40 ${btn}`}>OK</button>
              </div>
              <AnimatePresence mode="wait">
                {quizFb === 'ok' && (
                  <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
                    <CheckCircle2 className="inline w-4 h-4 mr-1" /> <strong>{strat.quiz.ans}</strong> ✓ Stratégie maîtrisée !
                  </motion.div>
                )}
                {quizFb === 'ko' && (
                  <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                    <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm">
                      💡 {strat.quiz.hint}
                    </div>
                    <button onClick={() => { setQuizVal(''); setQuizFb(null); }} className="text-xs text-slate-400 underline">Réessayer</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Défi final : choisir sa stratégie ─────────────────────── */
const CHALLENGES = [
  {
    q: '39 + 27',
    opts: [
      { label: '39 + 20 + 7', correct: true, explain: 'Excellent ! Décomposer le second terme est très efficace ici.' },
      { label: '40 + 27 − 1', correct: true, explain: 'Très bien ! Arrondir à 40 puis corriger fonctionne aussi.' },
      { label: 'Poser le calcul', correct: false, explain: 'Ça marche, mais pour 39 + 27, le calcul mental est plus rapide !' },
    ],
    expectedAnswer: 66,
  },
  {
    q: '199 × 5',
    opts: [
      { label: '200 × 5 − 5', correct: true, explain: 'Parfait ! 200×5=1000, puis −5 = 995.' },
      { label: '199 × 10 ÷ 2', correct: true, explain: 'Bien joué ! 199×10=1990, ÷2=995.' },
      { label: 'Poser 199×5 colonnes', correct: false, explain: "Ça marche, mais c'est bien plus long. Les stratégies mentales sont à préférer ici !" },
    ],
    expectedAnswer: 995,
  },
];

function FinalChallenge({ onComplete, done }) {
  const [cidx, setCidx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answerVal, setAnswerVal] = useState('');
  const [answerFb, setAnswerFb] = useState(null);

  const ch = CHALLENGES[cidx];
  const opt = chosen !== null ? ch.opts[chosen] : null;

  const checkAnswer = () => {
    if (parseInt(answerVal) === ch.expectedAnswer) {
      setAnswerFb('ok');
    } else setAnswerFb('ko');
  };

  const nextChallenge = () => {
    if (cidx < CHALLENGES.length - 1) {
      setCidx((v) => v + 1);
      setChosen(null);
      setConfirmed(false);
      setAnswerVal('');
      setAnswerFb(null);
    } else onComplete();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Défi {cidx + 1} / {CHALLENGES.length}</span>
      </div>
      <div className="bg-slate-800 text-white rounded-xl p-5 text-center text-3xl font-space font-bold">{ch.q} = ?</div>

      {!done && (
        <>
          <p className="text-sm font-bold text-slate-600">Quelle stratégie choisis-tu ?</p>
          <div className="space-y-2">
            {ch.opts.map((o, i) => (
              <button key={i} onClick={() => !confirmed && setChosen(i)}
                disabled={confirmed}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${chosen === i ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                {o.label}
              </button>
            ))}
          </div>

          {chosen !== null && !confirmed && (
            <button onClick={() => setConfirmed(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm">
              Valider ma stratégie →
            </button>
          )}

          {confirmed && opt && (
            <div className={`${opt.correct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'} border rounded-xl px-4 py-3 text-sm`}>
              {opt.explain}
            </div>
          )}

          {confirmed && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-600">Maintenant calcule le résultat :</p>
              <div className="flex gap-3">
                <input type="number" value={answerVal} onChange={(e) => { setAnswerVal(e.target.value); setAnswerFb(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer(); }}
                  placeholder="?" className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xl font-mono text-center focus:outline-none focus:border-indigo-400" />
                <button onClick={checkAnswer} disabled={!answerVal || answerFb === 'ok'} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
              </div>
              <AnimatePresence mode="wait">
                {answerFb === 'ok' && (
                  <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
                      <CheckCircle2 className="inline w-4 h-4 mr-1" /> <strong>{ch.q} = {ch.expectedAnswer}</strong> ✓ Stratégie + calcul réussis !
                    </div>
                    <button onClick={nextChallenge} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm">
                      {cidx < CHALLENGES.length - 1 ? 'Défi suivant →' : 'Terminer →'}
                    </button>
                  </motion.div>
                )}
                {answerFb === 'ko' && (
                  <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm">
                    Essaie encore — applique ta stratégie choisie étape par étape.
                    <button onClick={() => setAnswerFb(null)} className="block mt-1 text-xs text-rose-500 underline">Réessayer</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module07CalculMental() {
  const [masteredIds, setMasteredIds] = useState([]);
  const [phase, setPhase] = useState(0); // 0: stratégies, 1: défi
  const [allDone, setAllDone] = useState(false);
  const navLinks = getNavLinks(7);

  const markMastered = (id) => setMasteredIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  const allStrategiesDone = masteredIds.length >= STRATEGIES.length;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Le laboratoire du calcul malin"
      moduleSubtitle="Apprendre des stratégies de calcul mental et choisir la plus efficace."
      moduleNumber={7}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <ConceptCard label="Principe du calcul malin" emoji="🧠" color="cyan">
          <p className="text-sm">
            Un bon calculateur ne pose pas <em>tous</em> les calculs. Il choisit la stratégie la plus efficace
            selon la situation. Explore les stratégies ci-dessous, puis teste-les dans les défis.
          </p>
        </ConceptCard>

        {/* Stratégies */}
        {phase === 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-space font-bold text-slate-800">Les stratégies</h2>
              <span className="text-xs font-mono text-slate-400">{masteredIds.length}/{STRATEGIES.length} maîtrisées</span>
            </div>
            {STRATEGIES.map((strat) => (
              <StrategyCard
                key={strat.id}
                strat={strat}
                mastered={masteredIds.includes(strat.id)}
                onMastered={() => markMastered(strat.id)}
              />
            ))}
            {allStrategiesDone && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => setPhase(1)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl">
                  Relever le défi final →
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Défi final */}
        {phase === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">🎯 Défi stratège</h2>
            <p className="text-sm text-slate-500">Choisis ta stratégie, puis calcule. La stratégie compte autant que le résultat !</p>
            <FinalChallenge onComplete={() => setAllDone(true)} done={allDone} />
          </div>
        )}

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl p-6 text-center space-y-2">
            <div className="text-3xl">🏅 Stratège du calcul</div>
            <div className="text-xl font-space font-bold">Tu penses avant de calculer !</div>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
