import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Les 3 problèmes ────────────────────────────────────────── */
const PROBLEMS = [
  {
    id: 'p1',
    title: 'La classe de 6°A',
    difficulty: 1,
    color: 'emerald',
    situation: `La classe de 6°A compte 28 élèves. Pour une sortie scolaire, on dispose de 3 minibus pouvant transporter chacun 12 élèves.`,
    question: 'Y a-t-il assez de places pour tous les élèves ?',
    steps: [
      {
        label: 'Identifie les données utiles',
        type: 'check',
        options: ['28 élèves', '3 minibus', '12 places par minibus', 'une sortie scolaire'],
        correctIndices: [0, 1, 2],
        feedback: "3 données mathématiques : le nombre d'élèves, le nombre de minibus et les places par minibus.",
      },
      {
        label: 'Quelle opération te permet de calculer le nombre total de places ?',
        type: 'operation',
        options: ['+', '−', '×', '÷'],
        correctIndex: 2,
        explanation: '3 minibus × 12 places = total de places disponibles.',
      },
      {
        label: 'Calcule le nombre total de places',
        type: 'calc',
        expression: '3 × 12',
        expected: 36,
        hint: '3 × 12 = 3 × 10 + 3 × 2',
      },
      {
        label: 'Réponds à la question',
        type: 'choice',
        question: 'Y a-t-il assez de places (36) pour 28 élèves ?',
        options: ['Oui, il y a assez de places.', 'Non, il manque des places.'],
        correctIndex: 0,
        explanation: '36 > 28 → il y a assez de places (et même 8 places en plus).',
      },
    ],
  },
  {
    id: 'p2',
    title: 'Le goûter du club',
    difficulty: 2,
    color: 'blue',
    situation: `Pour le goûter du club, on achète 6 paquets de biscuits à 2,50 € chacun et 4 bouteilles d'eau à 0,75 € chacune. On paye avec un billet de 20 €.`,
    question: 'Combien rend-on en monnaie ?',
    steps: [
      {
        label: 'Quelle opération pour le coût des biscuits ?',
        type: 'operation',
        options: ['+', '−', '×', '÷'],
        correctIndex: 2,
        explanation: '6 paquets × 2,50 € = coût total des biscuits.',
      },
      {
        label: 'Coût des biscuits : 6 × 2,50',
        type: 'calc',
        expression: '6 × 2,50',
        expected: 15,
        displayExpected: '15,00',
        hint: '6 × 2 = 12, 6 × 0,5 = 3 → total 15.',
      },
      {
        label: 'Coût des bouteilles : 4 × 0,75',
        type: 'calc',
        expression: '4 × 0,75',
        expected: 3,
        displayExpected: '3,00',
        hint: '4 × 0,75 = 4 × (1 − 0,25) = 4 − 1 = 3.',
      },
      {
        label: 'Coût total : 15 + 3',
        type: 'calc',
        expression: '15 + 3',
        expected: 18,
        displayExpected: '18,00',
        hint: 'Addition simple.',
      },
      {
        label: 'Monnaie rendue : 20 − 18',
        type: 'calc',
        expression: '20 − 18',
        expected: 2,
        displayExpected: '2,00',
        hint: 'Soustraction : 20 − 18 = 2.',
      },
    ],
  },
  {
    id: 'p3',
    title: 'La bibliothèque',
    difficulty: 3,
    color: 'violet',
    situation: `La bibliothèque du collège possède 384 livres. On veut les ranger sur des étagères de 24 livres chacune. Il reste 7 livres sans place.`,
    question: "Combien y a-t-il d'étagères, et le bibliothécaire devra-t-il en ajouter une ?",
    steps: [
      {
        label: 'Quelle opération pour répondre ?',
        type: 'operation',
        options: ['+', '−', '×', '÷'],
        correctIndex: 3,
        explanation: 'On partage 384 livres en groupes de 24 → division.',
      },
      {
        label: 'Calcule : 384 ÷ 24',
        type: 'calc',
        expression: '384 ÷ 24',
        expected: 16,
        hint: '24 × 16 = 24 × 10 + 24 × 6 = 240 + 144 = 384.',
      },
      {
        label: 'Interprète le résultat',
        type: 'choice',
        question: "Le quotient est 16, le reste est 0. Mais l'énoncé dit qu'il reste 7 livres. Que conclure ?",
        options: [
          '16 étagères suffisent pour tous les livres.',
          'Il faut 17 étagères (16 pleines + 1 pour les 7 livres restants).',
          'Il faut 15 étagères.',
        ],
        correctIndex: 1,
        explanation: "384 ÷ 24 = 16 avec reste 0 (les 384 livres entrent pile). Mais avec les 7 livres supplémentaires de l'énoncé : 391 ÷ 24 = 16 reste 7 → il faut une 17e étagère pour les 7 livres restants.",
      },
    ],
  },
];

const colorMap = {
  emerald: { badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  blue: { badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700 text-white', border: 'border-blue-200', bg: 'bg-blue-50' },
  violet: { badge: 'bg-violet-100 text-violet-700', btn: 'bg-violet-600 hover:bg-violet-700 text-white', border: 'border-violet-200', bg: 'bg-violet-50' },
};

/* ─── Étape d'un problème ────────────────────────────────────── */
function ProblemStep({ step, onComplete, done }) {
  const [selected, setSelected] = useState(null); // for radio-style
  const [checked, setChecked] = useState([]); // for multi-check
  const [confirmed, setConfirmed] = useState(false);
  const [calcVal, setCalcVal] = useState('');
  const [fb, setFb] = useState(null);

  const validate = () => {
    if (step.type === 'calc') {
      const u = parseFloat(calcVal.replace(',', '.'));
      const e = step.expected;
      if (Math.abs(u - e) < 0.01) { setFb('ok'); onComplete(); }
      else setFb('ko');
    } else if (step.type === 'operation' || step.type === 'choice') {
      if (selected === step.correctIndex) { setFb('ok'); setConfirmed(true); onComplete(); }
      else { setFb('ko'); setConfirmed(true); }
    } else if (step.type === 'check') {
      const sortedChecked = [...checked].sort().join(',');
      const sortedExpected = [...step.correctIndices].sort().join(',');
      if (sortedChecked === sortedExpected) { setFb('ok'); setConfirmed(true); onComplete(); }
      else { setFb('ko'); }
    }
  };

  const retry = () => { setFb(null); setConfirmed(false); setSelected(null); setChecked([]); setCalcVal(''); };

  return (
    <div className={`border rounded-2xl p-4 space-y-3 ${done ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="text-xs font-mono font-bold text-indigo-600 uppercase">{step.label}</div>

      {step.type === 'check' && !done && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Sélectionne toutes les données utiles (plusieurs réponses possibles) :</p>
          {step.options.map((o, i) => (
            <button key={i}
              onClick={() => setChecked((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])}
              disabled={confirmed}
              className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${checked.includes(i) ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
              {o}
            </button>
          ))}
        </div>
      )}

      {(step.type === 'operation' || step.type === 'choice') && !done && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {step.options.map((o, i) => (
            <button key={i}
              onClick={() => !confirmed && setSelected(i)}
              disabled={confirmed}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selected === i ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'}`}>
              {o}
            </button>
          ))}
        </div>
      )}

      {step.type === 'calc' && !done && (
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-700 flex items-center">
            {step.expression} =
          </div>
          <input type="text" value={calcVal} onChange={(e) => { setCalcVal(e.target.value); setFb(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') validate(); }}
            placeholder="?"
            className="w-28 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xl font-mono text-center focus:outline-none focus:border-indigo-400" />
        </div>
      )}

      {!done && !confirmed && (
        <button onClick={validate}
          disabled={step.type === 'check' ? checked.length === 0 : step.type === 'calc' ? !calcVal : selected === null}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm disabled:opacity-40">
          Valider →
        </button>
      )}

      <AnimatePresence>
        {fb === 'ok' && (
          <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 className="inline w-4 h-4 mr-1" />
            {step.explanation || step.feedback || `${step.expression || ''} = ${step.displayExpected || step.expected} ✓`}
          </motion.div>
        )}
        {fb === 'ko' && !confirmed && (
          <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
              <XCircle className="inline w-4 h-4 mr-1" /> {step.hint || 'Pas tout à fait. Réfléchis à la situation.'}
            </div>
            <button onClick={retry} className="text-xs text-slate-400 underline">Réessayer</button>
          </motion.div>
        )}
        {fb === 'ko' && confirmed && (
          <motion.div key="ko2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
            💡 {step.explanation || step.feedback || ''}
          </motion.div>
        )}
      </AnimatePresence>
      {done && <div className="text-emerald-600 text-sm font-bold"><CheckCircle2 className="inline w-4 h-4 mr-1" /> Étape réussie</div>}
    </div>
  );
}

/* ─── Un problème complet ────────────────────────────────────── */
function ProblemBlock({ prob, onComplete, done }) {
  const [stepsDone, setStepsDone] = useState([]);
  const c = colorMap[prob.color];
  const allStepsDone = stepsDone.length >= prob.steps.length;

  return (
    <div className={`border-2 rounded-2xl p-5 space-y-4 ${done ? `${c.border} ${c.bg}` : 'border-slate-200 bg-white'}`}>
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full shrink-0 ${c.badge}`}>
          Niveau {'★'.repeat(prob.difficulty)}
        </span>
        <div>
          <div className="font-space font-bold text-slate-800">{prob.title}</div>
        </div>
        {done && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />}
      </div>

      {/* Situation */}
      <div className={`border rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed ${c.border} ${c.bg}`}>
        <div className="font-bold text-slate-500 text-xs font-mono mb-1">SITUATION</div>
        {prob.situation}
      </div>
      <div className="text-sm font-bold text-slate-800">❓ {prob.question}</div>

      {/* Étapes */}
      <div className="space-y-3">
        {prob.steps.map((step, si) => (
          (si === 0 || stepsDone.includes(si - 1)) && (
            <ProblemStep
              key={si}
              step={step}
              done={stepsDone.includes(si)}
              onComplete={() => {
                const next = stepsDone.includes(si) ? stepsDone : [...stepsDone, si];
                setStepsDone(next);
                if (next.length >= prob.steps.length && !done) onComplete();
              }}
            />
          )
        ))}
      </div>
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module09Problemes() {
  const [doneIds, setDoneIds] = useState([]);
  const navLinks = getNavLinks(9);
  const allDone = doneIds.length >= PROBLEMS.length;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Résoudre des problèmes"
      moduleSubtitle="Comprendre → Identifier → Choisir → Calculer → Vérifier → Répondre"
      moduleNumber={9}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2">
          <div className="font-bold text-indigo-800">🧩 La démarche en 5 étapes</div>
          <ol className="list-decimal list-inside space-y-1 text-sm text-indigo-700">
            <li><strong>Comprends</strong> la situation</li>
            <li><strong>Identifie</strong> les données utiles</li>
            <li><strong>Choisis</strong> l'opération</li>
            <li><strong>Calcule</strong></li>
            <li><strong>Vérifie</strong> et réponds clairement</li>
          </ol>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-space font-bold text-slate-800">Les problèmes</h2>
          <span className="text-xs font-mono text-slate-400">{doneIds.length}/{PROBLEMS.length} réussis</span>
        </div>

        <div className="space-y-6">
          {PROBLEMS.map((prob) => (
            <ProblemBlock
              key={prob.id}
              prob={prob}
              done={doneIds.includes(prob.id)}
              onComplete={() => setDoneIds((prev) => prev.includes(prob.id) ? prev : [...prev, prob.id])}
            />
          ))}
        </div>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 text-center space-y-2">
            <div className="text-3xl">🏅</div>
            <div className="text-xl font-space font-bold">Problèmes résolus !</div>
            <p className="text-purple-100 text-sm">Tu sais identifier, choisir et calculer. Tu es prêt pour le boss !</p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
