import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Contexte du Boss ───────────────────────────────────────── */
// Mission : Organiser la fête du collège
// Budget : 500 €
// Tâches :
//   1. Acheter des ballons (40 paquets à 3,25 € chacun)
//   2. Répartir les 120 gobelets entre 8 tables
//   3. Commander des pizzas (6 pizzas de 8 parts, 180 élèves → combien de pizzas manquent ?)
//   4. Bilan du budget

const TOTAL_BUDGET = 500;

// Assessment metadata (docs/architecture/AI_LESSON_CONTRACT.md) — each
// multi-step phase below is a real posed calculation embedded in a problem,
// certifying this evaluation-stage module's learning points.
const PHASES = [
  {
    id: 'balloons',
    title: '🎈 Phase 1 — Les ballons',
    description: 'Tu commandes 40 paquets de ballons à 3,25 € chacun. Calcule le coût total.',
    operation: '40 × 3,25',
    expected: 130,
    displayExpected: '130,00',
    hint: '40 × 3 = 120 et 40 × 0,25 = 10 → total = 130.',
    category: 'Multiplication',
    success: 'Parfait ! 40 × 3,25 = 130 €. Cette dépense est enregistrée.',
    remainingLabel: 'Budget restant',
  },
  {
    id: 'cups',
    title: '🥤 Phase 2 — Les gobelets',
    description: 'Il y a 120 gobelets à répartir équitablement sur 8 tables. Combien de gobelets par table ?',
    operation: '120 ÷ 8',
    expected: 15,
    displayExpected: '15',
    hint: '8 × 15 = 120. Vérifie : 8 × 10 = 80 et 8 × 5 = 40 → 80 + 40 = 120.',
    category: 'Division',
    success: 'Exact ! 120 ÷ 8 = 15 gobelets par table.',
    remainingLabel: null, // pas de budget
  },
  {
    id: 'pizzas',
    title: '🍕 Phase 3 — Les pizzas',
    description: '180 élèves viennent. Chaque pizza a 8 parts. On a déjà commandé 6 pizzas. Combien de pizzas supplémentaires faut-il commander ?',
    multiStep: true,
    steps: [
      { label: '1. Parts disponibles : 6 × 8', expected: 48, hint: '6 × 8 = 48 parts.' },
      { label: '2. Parts manquantes : 180 − 48', expected: 132, hint: '180 − 48 : je peux faire 180 − 50 + 2 = 132.' },
      { label: '3. Pizzas supplémentaires : 132 ÷ 8 (arrondi au supérieur)', expected: 17, hint: '132 ÷ 8 = 16 reste 4 → il faut 17 pizzas (le reste impose une pizza de plus !)', isRemainder: true, quotient: 16, remainder: 4 },
    ],
    category: 'Multi-étapes',
    success: 'Excellent ! 6 + 17 = 23 pizzas au total. Tu as bien interprété le reste !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P6'] },
  },
  {
    id: 'budget',
    title: '💰 Phase 4 — Bilan du budget',
    description: 'Tu as dépensé 130 € pour les ballons et 17 × 12 € = 204 € pour les pizzas supplémentaires. Calcule la dépense totale, puis le budget restant.',
    multiStep: true,
    steps: [
      { label: '1. Coût des pizzas supplémentaires : 17 × 12', expected: 204, hint: '17 × 12 = 17 × 10 + 17 × 2 = 170 + 34 = 204.' },
      { label: '2. Dépense totale : 130 + 204', expected: 334, hint: '130 + 204 = 334.' },
      { label: '3. Budget restant : 500 − 334', expected: 166, hint: '500 − 334 = 166.' },
    ],
    category: 'Multi-étapes',
    success: 'Superbe ! Budget restant = 166 €. Mission accomplie !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P2'] },
  },
];

/* ─── Étape de calcul ────────────────────────────────────────── */
function CalcStep({ step, onDone, done }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    const u = parseInt(val);
    if (Math.abs(u - step.expected) < 0.01) { setFb('ok'); onDone(); }
    else setFb('ko');
  };

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${done ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
      <div className="text-sm font-bold text-slate-700">{step.label}</div>
      {step.isRemainder && !done && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-800">
          ⚠️ Attention : 132 ÷ 8 = {step.quotient} reste {step.remainder}.
          Le reste signifie que ces {step.remainder} élèves n'ont pas de parts → il faut une pizza de plus !
        </div>
      )}
      {!done && (
        <>
          <div className="flex gap-3">
            <input type="number" value={val} onChange={(e) => { setVal(e.target.value); setFb(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
              placeholder="?" className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xl font-mono text-center focus:outline-none focus:border-amber-400" />
            <button onClick={check} disabled={!val} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
          </div>
          <AnimatePresence mode="wait">
            {fb === 'ok' && (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
                <CheckCircle2 className="inline w-4 h-4 mr-1" /> {step.expected} ✓
              </motion.div>
            )}
            {fb === 'ko' && (
              <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm">
                  <XCircle className="inline w-4 h-4 mr-1" /> 💡 {step.hint}
                </div>
                <button onClick={() => { setVal(''); setFb(null); }} className="text-xs text-slate-400 underline">Réessayer</button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {done && <div className="text-emerald-600 text-sm font-bold"><CheckCircle2 className="inline w-4 h-4 mr-1" /> {step.expected} ✓</div>}
    </div>
  );
}

/* ─── Phase simple (une étape) ───────────────────────────────── */
function SimplePhase({ phase, onDone, done }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    const u = parseFloat(val.replace(',', '.'));
    if (Math.abs(u - phase.expected) < 0.01) { setFb('ok'); onDone(); }
    else setFb('ko');
  };

  return (
    <div className="space-y-3">
      <div className={`text-sm font-mono text-center text-slate-800 bg-slate-100 rounded-xl py-3 font-bold text-2xl`}>
        {phase.operation} = ?
      </div>
      {!done && (
        <>
          <div className="flex gap-3">
            <input type="text" value={val} onChange={(e) => { setVal(e.target.value); setFb(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
              placeholder="?" className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xl font-mono text-center focus:outline-none focus:border-amber-400" />
            <button onClick={check} disabled={!val} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
          </div>
          <AnimatePresence mode="wait">
            {fb === 'ok' && (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
                <CheckCircle2 className="inline w-4 h-4 mr-1" /> {phase.success}
              </motion.div>
            )}
            {fb === 'ko' && (
              <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
                  💡 {phase.hint}
                </div>
                <button onClick={() => { setVal(''); setFb(null); }} className="text-xs text-slate-400 underline">Réessayer</button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {done && (
        <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="inline w-4 h-4 mr-1" /> {phase.success}
        </div>
      )}
    </div>
  );
}

/* ─── Phase multi-étapes ─────────────────────────────────────── */
function MultiStepPhase({ phase, onDone, done }) {
  const [stepsDone, setStepsDone] = useState([]);
  const allDone = stepsDone.length >= phase.steps.length;

  const markStep = (i) => {
    const next = stepsDone.includes(i) ? stepsDone : [...stepsDone, i];
    setStepsDone(next);
    if (next.length >= phase.steps.length && !done) onDone();
  };

  return (
    <div className="space-y-3">
      {phase.steps.map((step, i) => (
        (i === 0 || stepsDone.includes(i - 1)) && (
          <CalcStep key={i} step={step} done={stepsDone.includes(i)} onDone={() => markStep(i)} />
        )
      ))}
      {allDone && (
        <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="inline w-4 h-4 mr-1" /> {phase.success}
        </div>
      )}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module10BossFinal() {
  const [doneIds, setDoneIds] = useState([]);
  const [budget, setBudget] = useState(TOTAL_BUDGET);
  const navLinks = getNavLinks(10);
  const allDone = doneIds.length >= PHASES.length;

  const markDone = (id) => {
    if (!doneIds.includes(id)) {
      setDoneIds((prev) => [...prev, id]);
      if (id === 'balloons') setBudget((b) => b - 130);
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="🏆 Boss Final : Mission Fête"
      moduleSubtitle="Organise l'événement scolaire en mobilisant les quatre opérations."
      moduleNumber={10}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="15 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brief mission */}
        <div className="bg-gradient-to-br from-amber-900 to-amber-700 text-white rounded-2xl p-6 space-y-3">
          <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Boss Final
          </div>
          <h2 className="text-2xl font-space font-bold">Mission : Organiser la fête du collège</h2>
          <p className="text-amber-200 text-sm leading-relaxed">
            Tu es responsable de l'organisation de la fête de fin d'année du collège.
            Budget total : <strong className="text-white text-lg">{TOTAL_BUDGET} €</strong>.
            Quatre phases t'attendent — chacune mobilise une ou plusieurs opérations.
          </p>
          <div className="flex gap-3 flex-wrap">
            {['🎈 Ballons', '🥤 Gobelets', '🍕 Pizzas', '💰 Bilan'].map((p, i) => (
              <div key={i} className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full transition-all ${doneIds.length > i ? 'bg-emerald-500 text-white' : 'bg-amber-800 text-amber-300'}`}>
                {doneIds.length > i ? '✓ ' : ''}{p}
              </div>
            ))}
          </div>
        </div>

        {/* Phases */}
        {PHASES.map((phase, pi) => (
          (pi === 0 || doneIds.includes(PHASES[pi - 1].id)) && (
            <motion.div key={phase.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 rounded-2xl p-6 space-y-4 ${doneIds.includes(phase.id) ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-space font-bold text-slate-800">{phase.title}</h3>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  {phase.category}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{phase.description}</p>

              {phase.multiStep ? (
                <MultiStepPhase phase={phase} done={doneIds.includes(phase.id)} onDone={() => markDone(phase.id)} />
              ) : (
                <SimplePhase phase={phase} done={doneIds.includes(phase.id)} onDone={() => markDone(phase.id)} />
              )}
            </motion.div>
          )
        ))}

        {/* Victoire */}
        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-8 text-center space-y-4">
            <div className="text-5xl">🏆</div>
            <div className="text-3xl font-space font-extrabold">Mission accomplie !</div>
            <p className="text-amber-100 text-sm leading-relaxed">
              Tu as utilisé la multiplication, la division (avec interprétation du reste !), l'addition et la soustraction
              pour organiser toute une fête. C'est exactement ce que font les mathématiques dans la vie réelle.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['Addition', 'Soustraction', 'Multiplication', 'Division'].map((op) => (
                <div key={op} className="bg-white/20 rounded-xl py-2 font-bold text-sm">✅ {op}</div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
