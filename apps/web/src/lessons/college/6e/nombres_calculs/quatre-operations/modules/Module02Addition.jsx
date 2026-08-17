import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Manipulation 1 : Objets à réunir ──────────────────────────── */
function ManipObjects({ onComplete, done }) {
  const [moved, setMoved] = useState(0); // combien d'objets déplacés vers le groupe A
  const groupA = 5;
  const toMove = 7;

  const handleMove = () => {
    if (moved < toMove) setMoved((v) => v + 1);
  };

  const total = groupA + moved;
  const finished = moved === toMove;

  return (
    <div className="space-y-5">
      <p className="text-slate-700 text-sm leading-relaxed">
        Tu as <strong>5 billes rouges</strong> dans ta main gauche et <strong>7 billes bleues</strong> dans
        ta main droite. Transfère les billes bleues, une par une, vers la main gauche.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
        {/* Groupe gauche */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[160px] min-h-[60px]">
            {Array.from({ length: groupA }).map((_, i) => (
              <div key={`r-${i}`} className="w-8 h-8 rounded-full bg-rose-400 shadow-sm border-2 border-rose-300" />
            ))}
            {Array.from({ length: moved }).map((_, i) => (
              <motion.div
                key={`b-moved-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-blue-400 shadow-sm border-2 border-blue-300"
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">Main gauche : {total}</span>
        </div>

        {/* Bouton de transfert */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleMove}
            disabled={finished || done}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none ${
              finished || done
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95'
            }`}
          >
            ← Transférer
          </button>
          <span className="text-[11px] text-slate-400 font-mono">{toMove - moved} restantes</span>
        </div>

        {/* Groupe droit */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px] min-h-[60px]">
            {Array.from({ length: toMove - moved }).map((_, i) => (
              <div key={`b-${i}`} className="w-8 h-8 rounded-full bg-blue-400 shadow-sm border-2 border-blue-300" />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">Main droite : {toMove - moved}</span>
        </div>
      </div>

      {/* Expression mathématique qui grandit progressivement */}
      <div className="text-center font-space font-bold text-2xl sm:text-3xl text-slate-800 tabular-nums">
        <span className="text-rose-500">{groupA}</span>
        <span className="mx-2">+</span>
        <span className="text-blue-500">{moved}</span>
        <span className="mx-2">=</span>
        <span className={total === 12 ? 'text-emerald-600' : 'text-slate-400'}>{total}</span>
      </div>

      <AnimatePresence>
        {finished && !done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-800 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>5 + 7 = 12 !</strong> Tu viens de réunir deux groupes. C'est exactement ce que fait l'addition.
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-center">
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 flex-1">
                <span className="text-rose-600 font-bold text-lg">5</span>
                <div className="text-slate-500 text-xs">1er terme</div>
              </div>
              <div className="text-2xl text-slate-400 self-center font-bold">+</div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex-1">
                <span className="text-blue-600 font-bold text-lg">7</span>
                <div className="text-slate-500 text-xs">2e terme</div>
              </div>
              <div className="text-2xl text-slate-400 self-center font-bold">=</div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex-1">
                <span className="text-emerald-600 font-bold text-lg">12</span>
                <div className="text-slate-500 text-xs">somme</div>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
            >
              J'ai compris la somme → continuer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Manipulation 2 : Droite graduée ───────────────────────────── */
function ManipNumberLine({ onComplete, done }) {
  const start = 7;
  const steps = 4;
  const [pos, setPos] = useState(start);
  const target = start + steps;
  const finished = pos === target;

  const handleStep = () => {
    if (pos < target) setPos((v) => v + 1);
  };

  const ticks = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="space-y-5">
      <p className="text-slate-700 text-sm leading-relaxed">
        Sur la droite graduée, tu pars de <strong>7</strong>. Avance de <strong>4</strong> pas vers la droite.
        Combien obtiens-tu ?
      </p>

      {/* Droite graduée */}
      <div className="overflow-x-auto pb-2">
        <div className="relative h-20 min-w-[480px] flex items-center">
          {/* Axe */}
          <div className="absolute left-2 right-2 h-0.5 bg-slate-400 top-1/2" />
          {/* Flèche */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-slate-400" />

          {/* Graduations */}
          {ticks.map((t) => {
            const left = `${(t / 14) * 96 + 2}%`;
            const isStart = t === start;
            const isCurrent = t === pos;
            const isTarget = t === target;
            return (
              <div key={t} className="absolute" style={{ left }}>
                <div className={`w-0.5 h-4 ${isCurrent ? 'bg-indigo-600' : 'bg-slate-400'} absolute -top-2`} />
                <span
                  className={`absolute top-4 -translate-x-1/2 text-xs font-mono ${
                    isCurrent ? 'font-bold text-indigo-700 text-sm' : isTarget ? 'text-emerald-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  {t}
                </span>
                {isCurrent && (
                  <motion.div
                    key={pos}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-6 -translate-x-1/2 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow-md"
                  />
                )}
              </div>
            );
          })}

          {/* Arc de progression */}
          {pos > start && (
            <svg className="absolute left-0 top-0 w-full h-full pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path
                d={`M ${(start / 14) * 96 + 2} 20 Q ${((start + pos) / 28) * 96 + 2} 5 ${(pos / 14) * 96 + 2} 20`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="text-center font-space font-bold text-2xl">
          <span className="text-slate-800">{start}</span>
          <span className="text-indigo-500 mx-2">+ {pos - start}</span>
          <span className="text-slate-400 mx-1">=</span>
          <span className={finished ? 'text-emerald-600' : 'text-slate-400'}>{pos}</span>
        </div>
        <button
          onClick={handleStep}
          disabled={finished || done}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            finished || done
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
          }`}
        >
          +1 pas →
        </button>
      </div>

      <AnimatePresence>
        {finished && !done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-800 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>7 + 4 = 11 !</strong> Avancer sur la droite graduée, c'est additionner.
            </div>
            <button
              onClick={onComplete}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
            >
              Continuer →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Manipulation 3 : Valeur de position + retenue ─────────────── */
function ManipPlaceValue({ onComplete, done }) {
  // Addition : 38,4 + 7,25
  // On montre le tableau, l'élève aligne
  const [step, setStep] = useState(0); // 0: avant alignement, 1: aligné, 2: somme, 3: retenue

  const steps = [
    {
      label: 'Étape 1 — Aligner les chiffres',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Pour additionner <strong>38,4 + 7,25</strong>, il faut aligner les chiffres de <em>même rang</em>.
            Les unités sous les unités, les dixièmes sous les dixièmes…
          </p>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-lg">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold">
                  <th className="px-4 py-1 border-b border-slate-200">Dizaines</th>
                  <th className="px-4 py-1 border-b border-slate-200">Unités</th>
                  <th className="px-3 py-1 border-b border-slate-200 text-slate-300">,</th>
                  <th className="px-4 py-1 border-b border-slate-200">Dixièmes</th>
                  <th className="px-4 py-1 border-b border-slate-200">Centièmes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-slate-800 font-bold">3</td>
                  <td className="px-4 py-2 text-slate-800 font-bold">8</td>
                  <td className="px-3 py-2 text-slate-400 font-bold">,</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">4</td>
                  <td className="px-4 py-2 text-slate-300">0</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-300">0</td>
                  <td className="px-4 py-2 text-slate-800 font-bold">7</td>
                  <td className="px-3 py-2 text-slate-400 font-bold">,</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">2</td>
                  <td className="px-4 py-2 text-blue-600 font-bold">5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Les virgules sont <strong>alignées</strong> → les dixièmes se trouvent sous les dixièmes, etc.
          </p>
        </div>
      ),
    },
    {
      label: 'Étape 2 — Additionner colonne par colonne',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            On additionne chaque colonne, de droite à gauche.
          </p>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-lg">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold">
                  <th className="px-4 py-1">Dizaines</th>
                  <th className="px-4 py-1">Unités</th>
                  <th className="px-3 py-1 text-slate-300">,</th>
                  <th className="px-4 py-1">Dixièmes</th>
                  <th className="px-4 py-1">Centièmes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 font-bold">3</td>
                  <td className="px-4 py-2 font-bold">8</td>
                  <td className="px-3 py-2 text-slate-400">,</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">4</td>
                  <td className="px-4 py-2 text-slate-300">0</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold">0</td>
                  <td className="px-4 py-2 font-bold">7</td>
                  <td className="px-3 py-2 text-slate-400">,</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">2</td>
                  <td className="px-4 py-2 text-blue-600 font-bold">5</td>
                </tr>
                <tr className="border-t-2 border-slate-400">
                  <td className="px-4 py-2 text-indigo-700 font-bold">4</td>
                  <td className="px-4 py-2 text-indigo-700 font-bold">5</td>
                  <td className="px-3 py-2 text-slate-400">,</td>
                  <td className="px-4 py-2 text-indigo-700 font-bold">6</td>
                  <td className="px-4 py-2 text-indigo-700 font-bold">5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl py-2">
            38,4 + 7,25 = 45,65
          </div>
        </div>
      ),
    },
    {
      label: 'Étape 3 — La retenue (échange)',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Que se passe-t-il si la somme d'une colonne dépasse 9 ? Par exemple <strong>8 + 7 = 15</strong> unités.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-amber-800">💡 L'échange :</p>
            <p className="text-amber-700">
              <strong>15 unités</strong> = <strong>1 dizaine</strong> + <strong>5 unités</strong>
            </p>
            <p className="text-amber-700">
              On garde les 5 unités dans la colonne unités, et on <em>reporte</em> la dizaine dans la colonne dizaines.
              C'est la <strong>retenue</strong>.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-lg">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold">
                  <th className="px-4 py-1">Dizaines</th>
                  <th className="px-4 py-1">Unités</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-[11px] font-mono text-amber-600">
                  <td className="px-4 py-1 font-bold">¹</td>
                  <td className="px-4 py-1"></td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold">3</td>
                  <td className="px-4 py-2 font-bold">8</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold">0</td>
                  <td className="px-4 py-2 font-bold">7</td>
                </tr>
                <tr className="border-t-2 border-slate-400">
                  <td className="px-4 py-2 text-indigo-700 font-bold">4</td>
                  <td className="px-4 py-2 text-indigo-700 font-bold">5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 text-center">
            La retenue n'est pas une règle magique : c'est simplement un échange <em>10 unités = 1 dizaine</em>.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <p className="text-slate-700 text-sm">
        Voyons maintenant comment poser une addition avec des décimaux.
        <br />
        <strong>Exemple : 38,4 + 7,25</strong>
      </p>

      <div className="space-y-4">
        {steps.slice(0, step + 1).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
          >
            <div className="text-xs font-mono font-bold text-indigo-600 uppercase">{s.label}</div>
            {s.content}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep((v) => v + 1)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
          >
            Étape suivante →
          </button>
        )}
        {step === steps.length - 1 && !done && (
          <button
            onClick={onComplete}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
          >
            J'ai compris → suite
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Mini-exercice de pratique ─────────────────────────────────── */
const EXERCISES = [
  { q: '23 + 45', answer: 68, hint: 'Additionne les unités (3+5=8) puis les dizaines (2+4=6).' },
  { q: '157 + 86', answer: 243, hint: 'Unités : 7+6=13 → retenue ! Dizaines : 5+8+1=14 → retenue encore !' },
  { q: '4,7 + 2,8', answer: 7.5, hint: 'Dixièmes : 7+8=15 → garde 5, reporte 1 aux unités.', display: '7,5' },
];

function PracticeExercise({ onComplete, done }) {
  const [exIndex, setExIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);

  const ex = EXERCISES[exIndex];
  const expectedStr = ex.display || String(ex.answer);

  const check = () => {
    const userVal = parseFloat(input.replace(',', '.'));
    if (Math.abs(userVal - ex.answer) < 0.001) {
      setFeedback('correct');
      setScore((s) => s + 1);
    } else {
      setFeedback('wrong');
    }
  };

  const next = () => {
    if (exIndex < EXERCISES.length - 1) {
      setExIndex((i) => i + 1);
      setInput('');
      setFeedback(null);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">
          Exercice {exIndex + 1} / {EXERCISES.length}
        </span>
        <span className="text-xs font-mono text-emerald-600 font-bold">{score} ✓</span>
      </div>

      <div className="bg-slate-800 text-white rounded-xl p-5 text-center">
        <div className="text-3xl font-space font-bold">{ex.q} = ?</div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setFeedback(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
          placeholder="Ta réponse"
          className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-mono text-center focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={check}
          disabled={!input || feedback === 'correct'}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-40 transition-all"
        >
          OK
        </button>
      </div>

      <AnimatePresence mode="wait">
        {feedback === 'correct' && (
          <motion.div key="ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 className="inline w-4 h-4 mr-1" /> Parfait ! <strong>{ex.q} = {expectedStr}</strong>
            </div>
            <button onClick={next} className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all">
              {exIndex < EXERCISES.length - 1 ? 'Exercice suivant →' : 'Terminer →'}
            </button>
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div key="nope" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
              <XCircle className="inline w-4 h-4 mr-1" /> Pas tout à fait. 💡 {ex.hint}
            </div>
            <button onClick={() => setFeedback(null)} className="text-sm text-slate-500 underline">Réessayer</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module02Addition() {
  const [phase, setPhase] = useState(0);
  // 0: intro, 1: manip objets, 2: droite, 3: valeur pos, 4: pratique, 5: done
  const navLinks = getNavLinks(2);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Additionner : réunir et augmenter"
      moduleSubtitle="Manipuler des objets, avancer sur la droite graduée, maîtriser les retenues."
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={phase >= 5 ? navLinks.nextLink : undefined}
      isCompleted={phase >= 5}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Progression interne */}
        <div className="flex gap-1.5 flex-wrap">
          {['Je découvre', 'Je manipule', 'Droite graduée', 'Valeur de position', "Je m'entraîne"].map((l, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                i < phase
                  ? 'bg-emerald-100 text-emerald-700'
                  : i === phase
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < phase ? '✓ ' : ''}{l}
            </div>
          ))}
        </div>

        {/* Phase 0 — Je découvre */}
        {phase === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Qu'est-ce qu'additionner ?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Additionner, c'est <strong>réunir</strong> deux quantités pour en former une plus grande.
              C'est aussi <strong>augmenter</strong> une quantité d'un certain montant.
            </p>
            <div className="bg-indigo-50 rounded-xl p-4 text-center text-2xl font-space font-bold text-indigo-700">
              5 billes + 7 billes = ?
            </div>
            <p className="text-sm text-slate-500">
              Tu vas manipuler ces billes pour découvrir le résultat et son vocabulaire.
            </p>
            <button
              onClick={() => setPhase(1)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
            >
              Commencer la manipulation →
            </button>
          </motion.div>
        )}

        {/* Phase 1 — Manipulation objets */}
        {phase === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Réunis les billes</h2>
            <ManipObjects onComplete={() => setPhase(2)} done={phase > 1} />
          </motion.div>
        )}

        {/* Phase 2 — Droite graduée */}
        {phase >= 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Addition sur la droite graduée</h2>
            <ManipNumberLine onComplete={() => setPhase(3)} done={phase > 2} />
          </motion.div>
        )}

        {/* Phase 3 — Valeur de position */}
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">L'addition posée et les retenues</h2>
            <ManipPlaceValue onComplete={() => setPhase(4)} done={phase > 3} />
          </motion.div>
        )}

        {/* ConceptCard — apparaît APRÈS manipulation */}
        {phase >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ConceptCard label="L'addition" emoji="➕" color="emerald">
              <p>
                Dans une addition <MathText>{'$a + b = s$'}</MathText>, on appelle{' '}
                <strong className="text-emerald-700">a</strong> et{' '}
                <strong className="text-emerald-700">b</strong> les <strong>termes</strong>, et{' '}
                <strong className="text-emerald-700">s</strong> la <strong>somme</strong>.
              </p>
              <p className="mt-2">
                Pour poser une addition : <em>aligner les chiffres de même rang</em> (virgules sous les virgules),
                puis additionner colonne par colonne en gérant les échanges (10 unités = 1 dizaine).
              </p>
              <div className="mt-3 bg-white rounded-xl border border-emerald-100 p-3 text-sm">
                <strong>À retenir :</strong> Avant de calculer, estime l'ordre de grandeur.
                38,4 + 7,25 ≈ 38 + 7 = 45 → le résultat 45,65 est cohérent ✓
              </div>
            </ConceptCard>
          </motion.div>
        )}

        {/* Phase 4 — Pratique */}
        {phase >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Je m'entraîne</h2>
            <PracticeExercise onComplete={() => setPhase(5)} done={phase >= 5} />
          </motion.div>
        )}

        {/* Fin */}
        {phase >= 5 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6 text-center space-y-2">
            <div className="text-3xl">🏅</div>
            <div className="text-xl font-space font-bold">Addition maîtrisée !</div>
            <p className="text-emerald-100 text-sm">Tu peux maintenant passer à la soustraction.</p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
