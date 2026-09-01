import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Fiche visuelle de synthèse ─────────────────────────────── */
function SynthesisSheet() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        {
          op: '+', name: 'Addition', color: 'emerald',
          vocab: [['terme', 'a ou b'], ['somme', 'a + b']],
          sens: ['Réunir deux quantités', "Augmenter d'une valeur"],
          attention: 'Aligner les rangs avant de poser',
          formule: 'a + b = b + a',
        },
        {
          op: '−', name: 'Soustraction', color: 'blue',
          vocab: [['1er terme', 'a'], ['2e terme', 'b'], ['différence', 'a − b']],
          sens: ['Retirer', 'Comparer', 'Compléter'],
          attention: 'Attention aux échanges ! 3 − 7 impossible → emprunter',
          formule: 'Vérif : (a−b)+b=a',
        },
        {
          op: '×', name: 'Multiplication', color: 'violet',
          vocab: [['facteur', 'a ou b'], ['produit', 'a × b']],
          sens: ['Groupes égaux', 'Grille rectangulaire', "Mise à l'échelle"],
          attention: 'a × b = b × a (commutativité)',
          formule: 'a × (b+c) = a×b + a×c',
        },
        {
          op: '÷', name: 'Division', color: 'amber',
          vocab: [['dividende', 'a'], ['diviseur', 'b'], ['quotient', 'q'], ['reste', 'r']],
          sens: ['Partage équitable', 'Groupement'],
          attention: 'Le reste doit être < diviseur. Interpréter le reste dans les problèmes !',
          formule: 'a = b × q + r',
        },
      ].map(({ op, name, color, vocab, sens, attention, formule }) => (
        <div key={op} className={`bg-${color}-50 border-2 border-${color}-200 rounded-2xl p-4 space-y-3`}>
          <div className="flex items-center gap-3">
            <div className={`bg-${color}-500 text-white text-2xl font-bold w-12 h-12 rounded-xl flex items-center justify-center`}>{op}</div>
            <div className="font-space font-bold text-lg text-slate-800">{name}</div>
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">Vocabulaire</div>
            <div className="flex flex-wrap gap-2">
              {vocab.map(([term, def]) => (
                <div key={term} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                  <span className={`font-bold text-${color}-700`}>{term}</span>
                  <span className="text-slate-400 ml-1">= {def}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">Situations</div>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
              {sens.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>

          <div className="bg-white border border-amber-100 rounded-xl px-3 py-2 text-xs text-slate-600">
            ⚠️ {attention}
          </div>

          <div className={`bg-${color}-100 rounded-xl px-3 py-2 text-center font-mono font-bold text-${color}-700 text-sm`}>
            {formule}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Flash Quiz ──────────────────────────────────────────────── */
// Assessment metadata (docs/architecture/AI_LESSON_CONTRACT.md) — this
// 5-question flash quiz is part of the lesson's evaluation-stage checkpoint
// (alongside Module10BossFinal.jsx's PHASES).
const FLASH_QUESTIONS = [
  {
    id: 'quatre-operations-flash-01',
    q: 'Dans 45 ÷ 8 = 5 reste 5, quel est le quotient ?',
    options: ['45', '8', '5', '0'],
    correct: 2,
    explain: 'Le quotient est le résultat entier de la division : 5. (Le reste est aussi 5, mais ce sont deux valeurs différentes.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5'] },
  },
  {
    id: 'quatre-operations-flash-02',
    q: 'Laquelle de ces situations correspond à une multiplication ?',
    options: [
      "Taille d'une classe : 28 élèves. On en retire 5.",
      '6 rangées de 7 chaises = ?',
      'Distance de Paris à Lyon : 465 km. On a parcouru 230 km. Il reste ?',
      'On partage 36 bonbons entre 4 amis.',
    ],
    correct: 1,
    explain: '6 rangées × 7 chaises = groupes égaux → multiplication.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P1'] },
  },
  {
    id: 'quatre-operations-flash-03',
    q: '17 pizzas = 5 × q + r. Si 5 × 3 = 15 et 17 − 15 = 2, que vaut q ?',
    options: ['17', '5', '3', '2'],
    correct: 2,
    explain: 'q est le quotient : 17 ÷ 5 = 3 reste 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5'] },
  },
  {
    id: 'quatre-operations-flash-04',
    q: 'Pour 7 + 9, quelle stratégie de calcul mental est la plus rapide ?',
    options: ['Poser le calcul', '7 + 10 − 1 = 16', 'Estimer à 15', 'Calculer 7 + 9 = 7 + 7 + 2'],
    correct: 1,
    explain: '+9 = +10 − 1 → 7 + 10 − 1 = 16. Très rapide !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P3', '6e_quatre-operations_P4'] },
  },
  {
    id: 'quatre-operations-flash-05',
    q: '31 enfants dans 5 groupes. Quel est le nombre de groupes complets ?',
    options: ['31', '5', '6', '1'],
    correct: 2,
    explain: '31 ÷ 5 = 6 reste 1 → 6 groupes complets (et 1 enfant en plus).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5', '6e_quatre-operations_P6'] },
  },
];

function FlashQuiz({ onComplete, done }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [allAnswered, setAllAnswered] = useState(false);

  const q = FLASH_QUESTIONS[qIdx];
  const isCorrect = selected === q.correct;

  const confirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    if (isCorrect) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIdx < FLASH_QUESTIONS.length - 1) {
      setQIdx((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setAllAnswered(true);
      onComplete();
    }
  };

  if (allAnswered) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">{score >= 4 ? '🏆' : score >= 3 ? '🥈' : '📚'}</div>
        <div className="text-2xl font-space font-bold text-slate-800">{score} / {FLASH_QUESTIONS.length}</div>
        <div className="text-sm text-slate-500">
          {score === FLASH_QUESTIONS.length ? 'Score parfait ! Tu maîtrises les quatre opérations !' : `Bien joué ! ${FLASH_QUESTIONS.length - score} erreur(s) — relis les concepts correspondants.`}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Question {qIdx + 1} / {FLASH_QUESTIONS.length}</span>
        <span className="text-emerald-600 font-bold">{score} ✓</span>
      </div>
      <div className="bg-slate-800 text-white rounded-xl p-5 text-sm font-semibold leading-relaxed">
        {q.q}
      </div>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button key={i}
            onClick={() => !confirmed && setSelected(i)}
            disabled={confirmed}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              confirmed
                ? i === q.correct
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : i === selected
                  ? 'bg-rose-50 border-rose-400 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
                : selected === i
                ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {confirmed && i === q.correct && <CheckCircle2 className="inline w-4 h-4 mr-2" />}
            {confirmed && i === selected && i !== q.correct && <XCircle className="inline w-4 h-4 mr-2" />}
            {opt}
          </button>
        ))}
      </div>

      {!confirmed && (
        <button onClick={confirm} disabled={selected === null} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-sm disabled:opacity-40">
          Valider
        </button>
      )}

      <AnimatePresence>
        {confirmed && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-4 py-3 text-sm border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            {isCorrect ? <CheckCircle2 className="inline w-4 h-4 mr-1" /> : '💡 '}{q.explain}
          </motion.div>
        )}
      </AnimatePresence>

      {confirmed && (
        <button onClick={next} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm">
          {qIdx < FLASH_QUESTIONS.length - 1 ? 'Question suivante →' : 'Voir mon score →'}
        </button>
      )}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module11Synthese() {
  const [phase, setPhase] = useState(0); // 0: fiche, 1: quiz
  const [quizDone, setQuizDone] = useState(false);
  const navLinks = getNavLinks(11);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Synthèse & Flash Quiz"
      moduleSubtitle="Fiche visuelle des quatre opérations + 5 questions de réactivation."
      moduleNumber={11}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={quizDone ? navLinks.nextLink : undefined}
      isCompleted={quizDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-2">
          {['Fiche de synthèse', 'Flash Quiz'].map((l, i) => (
            <button key={i} onClick={() => i === 1 ? null : setPhase(0)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${phase === i ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Fiche visuelle */}
        {phase === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Fiche des 4 opérations</h2>
            <SynthesisSheet />
            <button onClick={() => setPhase(1)} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all">
              Je passe au Flash Quiz →
            </button>
          </div>
        )}

        {/* Flash Quiz */}
        {phase === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">⚡ Flash Quiz — 5 questions</h2>
            <FlashQuiz onComplete={() => setQuizDone(true)} done={quizDone} />
          </div>
        )}

        {quizDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 text-center space-y-3">
            <div className="text-4xl">🎓</div>
            <div className="text-2xl font-space font-extrabold">Leçon complétée !</div>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Tu maîtrises maintenant les quatre opérations fondamentales :
              leur sens, leurs algorithmes, leurs stratégies et leur utilisation dans des problèmes réels.
            </p>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {['+', '−', '×', '÷'].map((s) => (
                <div key={s} className="bg-white/20 rounded-xl py-3 text-2xl font-bold">{s}</div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
