import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Données des calculs ────────────────────────────────────── */
const CHALLENGES = [
  {
    q: '25 + 100',
    answer: 125,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 0,
    bestExplain: 'Ajouter 100 est immédiat mentalement : on fait juste +1 dans les centaines.',
    otherExplains: [
      '', // best
      'Possible, mais inutilement long pour +100.',
      'Inutilement complexe. Le calcul posé est pour des calculs difficiles.',
      "L'estimation convient pour des ordres de grandeur, pas pour une réponse exacte aussi simple.",
    ],
    category: 'Addition',
    categoryColor: 'emerald',
  },
  {
    q: '398 + 487',
    answer: 885,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 2,
    bestExplain: 'Trois chiffres avec retenues multiples → le calcul posé évite les erreurs.',
    otherExplains: [
      'Calculable mentalement, mais risqué pour ces nombres. Préférer le posé ou en ligne.',
      "En ligne c'est possible, mais le posé est plus sûr avec des retenues multiples.",
      '', // best
      "L'estimation donne ≈ 400+500=900, utile pour vérifier, mais pas pour la réponse exacte.",
    ],
    category: 'Addition',
    categoryColor: 'emerald',
  },
  {
    q: '83 − 9',
    answer: 74,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 0,
    bestExplain: 'Stratégie mentale : −9 = −10+1 → 83−10+1 = 74. Très rapide !',
    otherExplains: [
      '', // best
      'Fonctionne, mais inutilement long pour ce calcul simple.',
      'Beaucoup trop complexe pour 83−9.',
      "Estimation donne ≈70, utile pour vérifier mais pas pour répondre exactement.",
    ],
    category: 'Soustraction',
    categoryColor: 'blue',
  },
  {
    q: '199 × 5',
    answer: 995,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 0,
    bestExplain: '199×5 = 200×5 − 5 = 1000−5 = 995. La stratégie mentale est ici la plus élégante !',
    otherExplains: [
      '', // best
      'Possible, mais la stratégie mentale est bien plus efficace.',
      "Ça marche, mais cherche d'abord une stratégie mentale.",
      '≈200×5=1000 — utile pour contrôler le résultat, pas pour la réponse exacte.',
    ],
    category: 'Multiplication',
    categoryColor: 'violet',
  },
  {
    q: '49,7 + 12,38',
    answer: 62.08,
    displayAnswer: '62,08',
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 2,
    bestExplain: 'Les décimaux avec des rangs différents nécessitent un tableau de valeur de position → calcul posé.',
    otherExplains: [
      "Très difficile mentalement avec des centièmes. Risque d'erreur important.",
      "Possible mais difficile d'aligner correctement en ligne.",
      '', // best
      '≈50+12=62 — utile pour vérifier (62,08 est bien proche de 62 ✓), mais pas pour la précision.',
    ],
    category: 'Addition décimaux',
    categoryColor: 'sky',
  },
];

const TOOL_COLORS = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-amber-100 text-amber-700'];

/* ─── Carte challenge ────────────────────────────────────────── */
function ChallengeCard({ ch, idx, onCorrect, done }) {
  const [chosen, setChosen] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answerFb, setAnswerFb] = useState(null);

  const isBest = chosen === ch.bestIndex;

  const checkAnswer = () => {
    const expected = ch.answer;
    const user = parseFloat(answer.replace(',', '.'));
    if (Math.abs(user - expected) < 0.01) {
      setAnswerFb('ok');
      onCorrect();
    } else setAnswerFb('ko');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`border-2 rounded-2xl p-5 space-y-4 ${done ? 'bg-emerald-50/30 border-emerald-300' : 'bg-white border-slate-200'}`}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${TOOL_COLORS[idx % 4]}`}>{ch.category}</span>
        {done && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>

      <div className="text-2xl font-space font-bold text-slate-800 text-center">{ch.q} = ?</div>

      {/* Choix de l'outil */}
      {!done && (
        <>
          <p className="text-sm font-bold text-slate-600">Quel outil choisis-tu ?</p>
          <div className="grid grid-cols-2 gap-2">
            {ch.tools.map((t, i) => (
              <button key={i} onClick={() => !confirmed && setChosen(i)}
                disabled={confirmed}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${chosen === i ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                {t}
              </button>
            ))}
          </div>

          {chosen !== null && !confirmed && (
            <button onClick={() => setConfirmed(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm">
              Je choisis cet outil →
            </button>
          )}

          {confirmed && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${isBest ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              {isBest ? '✅ ' : '💡 '}{ch.otherExplains[chosen] || ch.bestExplain}
              {!isBest && (
                <div className="mt-2 font-bold">
                  L'outil recommandé : <span className="underline">{ch.tools[ch.bestIndex]}</span>
                  <div className="text-xs mt-1 font-normal">{ch.bestExplain}</div>
                </div>
              )}
            </div>
          )}

          {confirmed && (
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-600">Calcule le résultat :</div>
              <div className="flex gap-3">
                <input type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); setAnswerFb(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer(); }}
                  placeholder="?" className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xl font-mono text-center focus:outline-none focus:border-indigo-400" />
                <button onClick={checkAnswer} disabled={!answer || answerFb === 'ok'} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
              </div>
              <AnimatePresence mode="wait">
                {answerFb === 'ok' && (
                  <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
                    <CheckCircle2 className="inline w-4 h-4 mr-1" /> <strong>{ch.displayAnswer || ch.answer}</strong> ✓
                  </motion.div>
                )}
                {answerFb === 'ko' && (
                  <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm">
                    Réessaie. Applique la stratégie choisie.
                    <button onClick={() => setAnswerFb(null)} className="block mt-1 text-xs underline">Réessayer</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
      {done && (
        <div className="text-center text-emerald-600 font-bold text-sm">
          <CheckCircle2 className="inline w-4 h-4 mr-1" /> {ch.displayAnswer || ch.answer} — {ch.tools[ch.bestIndex]} recommandé
        </div>
      )}
    </motion.div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module08ChoisirOperation() {
  const [doneIndices, setDoneIndices] = useState([]);
  const navLinks = getNavLinks(8);
  const allDone = doneIndices.length >= CHALLENGES.length;

  const markDone = (i) => setDoneIndices((prev) => prev.includes(i) ? prev : [...prev, i]);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Choisir l'outil de calcul"
      moduleSubtitle="Pour chaque calcul : mental, en ligne, posé ou estimation ? La stratégie compte autant que le résultat !"
      moduleNumber={8}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🧠', label: 'Mental', desc: 'Calcul simple ou stratégie connue' },
            { icon: '✏️', label: 'En ligne', desc: 'Petit calcul à écrire sans poser' },
            { icon: '📐', label: 'Posé', desc: 'Grands nombres ou décimaux' },
            { icon: '🔎', label: 'Estimation', desc: "Contrôler l'ordre de grandeur" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-bold text-slate-700 text-sm">{label}</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-space font-bold text-slate-800">Les défis</h2>
          <span className="text-xs font-mono text-slate-400">{doneIndices.length}/{CHALLENGES.length} réussis</span>
        </div>

        <div className="space-y-4">
          {CHALLENGES.map((ch, i) => (
            <ChallengeCard
              key={i}
              ch={ch}
              idx={i}
              done={doneIndices.includes(i)}
              onCorrect={() => markDone(i)}
            />
          ))}
        </div>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-6 text-center space-y-2">
            <div className="text-3xl">🏅 Stratège du calcul</div>
            <div className="text-xl font-space font-bold">Tu sais choisir le bon outil !</div>
            <p className="text-pink-100 text-sm">Mental, en ligne, posé, estimation — chaque outil à sa place.</p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
