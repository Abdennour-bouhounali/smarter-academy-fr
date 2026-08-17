import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Les 3 sens de la soustraction ────────────────────────────── */
function ThreeMeanings({ onAllDone, allDone }) {
  const [doneIds, setDoneIds] = useState([]);

  const markDone = (id) => setDoneIds((prev) => {
    const next = prev.includes(id) ? prev : [...prev, id];
    if (next.length === 3 && !allDone) onAllDone();
    return next;
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 leading-relaxed">
        La soustraction traduit <strong>trois situations différentes</strong>. Explore chacune d'elles.
      </p>
      <MeaningRetirer done={doneIds.includes('retirer')} onDone={() => markDone('retirer')} />
      {doneIds.includes('retirer') && (
        <MeaningComparer done={doneIds.includes('comparer')} onDone={() => markDone('comparer')} />
      )}
      {doneIds.includes('comparer') && (
        <MeaningCompleter done={doneIds.includes('completer')} onDone={() => markDone('completer')} />
      )}
    </div>
  );
}

/* Sens 1 : Retirer */
function MeaningRetirer({ done, onDone }) {
  const total = 13;
  const [removedIds, setRemovedIds] = useState([]);
  const target = 5;
  const finished = removedIds.length === target;

  return (
    <div className="border-2 border-rose-100 rounded-2xl p-5 space-y-4 bg-rose-50/40">
      <div className="flex items-center gap-2">
        <span className="bg-rose-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">Sens 1</span>
        <span className="font-bold text-slate-800">RETIRER</span>
      </div>
      <p className="text-sm text-slate-600">
        Tu as <strong>13 jetons</strong>. Enlèves-en <strong>5</strong> un par un.
      </p>

      {/* Affichage des jetons */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-rose-100 min-h-[60px]">
        {Array.from({ length: total }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => { 
              if (!done && removedIds.length < target && !removedIds.includes(i)) {
                setRemovedIds((prev) => [...prev, i]);
              }
            }}
            whileHover={!done && removedIds.length < target && !removedIds.includes(i) ? { scale: 1.1 } : {}}
            className={`w-9 h-9 flex items-center justify-center rounded-full border-2 font-bold text-sm transition-all ${
              !removedIds.includes(i)
                ? 'bg-rose-100 border-rose-400 text-rose-600 cursor-pointer hover:bg-rose-200'
                : 'bg-slate-100 border-slate-200 text-slate-300 cursor-default scale-90 opacity-50'
            }`}
          >
            {!removedIds.includes(i) ? '●' : ''}
          </motion.button>
        ))}
      </div>

      <div className="text-center font-space font-bold text-2xl">
        <span className="text-rose-600">{total}</span>
        <span className="mx-2 text-slate-600">−</span>
        <span className="text-slate-600">{removedIds.length}</span>
        <span className="mx-2 text-slate-600">=</span>
        <span className={finished ? 'text-emerald-600' : 'text-slate-400'}>{total - removedIds.length}</span>
      </div>
      <p className="text-xs text-slate-400 text-center">Clique sur les jetons pour les retirer ({target - removedIds.length} à enlever)</p>

      <AnimatePresence>
        {finished && !done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>13 − 5 = 8</strong> — Tu as retiré 5 jetons. Il en reste 8.
            </div>
            <button onClick={onDone} className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm">
              Compris → Sens suivant
            </button>
          </motion.div>
        )}
        {done && (
          <div className="text-center text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="inline w-4 h-4 mr-1" /> Sens 1 compris !
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Sens 2 : Comparer */
function MeaningComparer({ done, onDone }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const check = () => {
    const val = parseInt(answer);
    if (val === 5) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-blue-100 rounded-2xl p-5 space-y-4 bg-blue-50/40">
      <div className="flex items-center gap-2">
        <span className="bg-blue-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">Sens 2</span>
        <span className="font-bold text-slate-800">COMPARER</span>
      </div>
      <p className="text-sm text-slate-600">
        Groupe A : <strong>13 billes</strong>. Groupe B : <strong>8 billes</strong>.
        De combien le groupe A a-t-il plus de billes que le groupe B ?
      </p>

      {/* Représentation visuelle */}
      <div className="space-y-2 bg-white rounded-xl border border-blue-100 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono w-10 text-slate-500">A</span>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${i < 8 ? 'bg-blue-400' : 'bg-blue-200 ring-2 ring-blue-400 ring-offset-1'}`} />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-500">13</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono w-10 text-slate-500">B</span>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-blue-400" />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-500">8</span>
        </div>
        <p className="text-xs text-blue-500 font-medium mt-1">Les billes encadrées = la différence</p>
      </div>

      {!done && (
        <div className="flex gap-3">
          <input
            type="number"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setFeedback(null); }}
            placeholder="?"
            className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-lg font-mono text-center focus:outline-none focus:border-blue-400"
          />
          <button onClick={check} disabled={!answer} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
        </div>
      )}

      <AnimatePresence>
        {feedback === 'correct' && !done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>13 − 8 = 5</strong> — Le groupe A a 5 billes de plus. On <em>compare</em> deux quantités.
            </div>
            <button onClick={onDone} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm">
              Sens suivant →
            </button>
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
            <XCircle className="inline w-4 h-4 mr-1" /> Compte les billes bleues encadrées dans le groupe A…
          </div>
        )}
        {done && <div className="text-emerald-600 font-bold text-sm text-center"><CheckCircle2 className="inline w-4 h-4 mr-1" /> Sens 2 compris !</div>}
      </AnimatePresence>
    </motion.div>
  );
}

/* Sens 3 : Compléter */
function MeaningCompleter({ done, onDone }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const check = () => {
    if (parseInt(answer) === 5) setFeedback('correct');
    else setFeedback('wrong');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-violet-100 rounded-2xl p-5 space-y-4 bg-violet-50/40">
      <div className="flex items-center gap-2">
        <span className="bg-violet-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">Sens 3</span>
        <span className="font-bold text-slate-800">COMPLÉTER</span>
      </div>
      <p className="text-sm text-slate-600">
        Tu as <strong>8 €</strong>. Tu veux acheter quelque chose qui coûte <strong>13 €</strong>.
        Combien d'euros te manque-t-il ?
      </p>

      {/* Barre de progression visuelle */}
      <div className="bg-white rounded-xl border border-violet-100 p-4 space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span>0 €</span><span>8 €</span><span>13 €</span>
        </div>
        <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-violet-400 rounded-full" style={{ width: `${(8/13)*100}%` }} />
          <div className="absolute top-0 h-full bg-violet-200 rounded-full border-2 border-dashed border-violet-400" style={{ left: `${(8/13)*100}%`, width: `${(5/13)*100}%` }} />
        </div>
        <div className="text-xs text-violet-600 font-medium text-center">Les 8 € que tu as + ??? = 13 €</div>
      </div>

      {!done && (
        <div className="flex gap-3">
          <input
            type="number"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setFeedback(null); }}
            placeholder="Il manque ?"
            className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-lg font-mono text-center focus:outline-none focus:border-violet-400"
          />
          <button onClick={check} disabled={!answer} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
        </div>
      )}

      <AnimatePresence>
        {feedback === 'correct' && !done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>13 − 8 = 5 €</strong> — On cherche ce qui manque pour compléter. C'est aussi une soustraction !
            </div>
            <button onClick={onDone} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm">
              J'ai compris les 3 sens !
            </button>
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
            <XCircle className="inline w-4 h-4 mr-1" /> Regarde la barre : que faut-il ajouter à 8 pour atteindre 13 ?
          </div>
        )}
        {done && <div className="text-emerald-600 font-bold text-sm text-center"><CheckCircle2 className="inline w-4 h-4 mr-1" /> Sens 3 compris !</div>}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Droite graduée interactive ─────────────────────────────────── */
function SubtractionLine({ onComplete, done }) {
  const start = 15;
  const steps = 6;
  const [pos, setPos] = useState(start);
  const target = start - steps;
  const finished = pos === target;

  const ticks = Array.from({ length: 17 }, (_, i) => i);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Sur la droite graduée, tu es à <strong>15</strong>. Recule de <strong>6</strong> pas.
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="relative h-20 min-w-[480px] flex items-center">
          <div className="absolute left-2 right-2 h-0.5 bg-slate-400 top-1/2" />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-slate-400" />
          {ticks.map((t) => {
            const left = `${(t / 16) * 96 + 2}%`;
            const isCurrent = t === pos;
            const isTarget = t === target;
            return (
              <div key={t} className="absolute" style={{ left }}>
                <div className={`w-0.5 h-4 ${isCurrent ? 'bg-rose-600' : 'bg-slate-400'} absolute -top-2`} />
                <span className={`absolute top-4 -translate-x-1/2 text-xs font-mono ${isCurrent ? 'font-bold text-rose-700 text-sm' : isTarget ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {t}
                </span>
                {isCurrent && (
                  <motion.div key={pos} initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                    className="absolute -top-6 -translate-x-1/2 w-5 h-5 bg-rose-600 rounded-full border-2 border-white shadow-md" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="text-center font-space font-bold text-2xl">
          <span className="text-slate-800">{start}</span>
          <span className="text-rose-500 mx-2">− {start - pos}</span>
          <span className="text-slate-400 mx-1">=</span>
          <span className={finished ? 'text-emerald-600' : 'text-slate-400'}>{pos}</span>
        </div>
        <button
          onClick={() => { if (!finished && !done) setPos((v) => v - 1); }}
          disabled={finished || done}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${finished || done ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'}`}
        >
          ← −1 pas
        </button>
      </div>

      <AnimatePresence>
        {finished && !done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" /> <strong>15 − 6 = 9</strong> — Reculer sur la droite graduée, c'est soustraire !
            </div>
            <button onClick={onComplete} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm">
              Suite →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Soustraction posée avec échange ────────────────────────────── */
function SubtractionPosed({ onComplete, done }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Situation : 42 − 18',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">On veut calculer <strong>42 − 18</strong>. Regardons les colonnes :</p>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-2xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-6 py-1">Dizaines</th><th className="px-6 py-1">Unités</th></tr></thead>
              <tbody>
                <tr><td className="px-6 py-2 font-bold text-slate-800">4</td><td className="px-6 py-2 font-bold text-slate-800">2</td></tr>
                <tr><td className="px-6 py-2 font-bold text-slate-600">1</td><td className="px-6 py-2 font-bold text-slate-600">8</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            Problème : dans la colonne des unités, <strong>2 − 8</strong> est impossible !<br/>
            Que faire ?
          </div>
        </div>
      ),
    },
    {
      title: "L'échange : 1 dizaine → 10 unités",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">On <strong>emprunte</strong> une dizaine à la colonne des dizaines. 1 dizaine = 10 unités.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <div className="text-xs font-mono text-rose-500 font-bold mb-1">AVANT</div>
              <div className="font-space font-bold text-2xl">4 diz. / 2 unit.</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="text-xs font-mono text-emerald-600 font-bold mb-1">APRÈS ÉCHANGE</div>
              <div className="font-space font-bold text-2xl">3 diz. / 12 unit.</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-2xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-6 py-1">Dizaines</th><th className="px-6 py-1">Unités</th></tr></thead>
              <tbody>
                <tr>
                  <td className="px-6 py-2">
                    <span className="line-through text-slate-400">4</span>
                    <span className="text-emerald-600 font-bold ml-1">3</span>
                  </td>
                  <td className="px-6 py-2">
                    <span className="line-through text-slate-400">2</span>
                    <span className="text-emerald-600 font-bold ml-1">12</span>
                  </td>
                </tr>
                <tr><td className="px-6 py-2 font-bold text-slate-600">1</td><td className="px-6 py-2 font-bold text-slate-600">8</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 text-center">La dizaine ne disparaît pas : elle est échangée en 10 unités.</p>
        </div>
      ),
    },
    {
      title: 'Calcul final',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Maintenant on peut calculer colonne par colonne :</p>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-2xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-6 py-1">Dizaines</th><th className="px-6 py-1">Unités</th></tr></thead>
              <tbody>
                <tr><td className="px-6 py-2 text-slate-700 font-bold">3</td><td className="px-6 py-2 text-slate-700 font-bold">12</td></tr>
                <tr><td className="px-6 py-2 text-slate-600 font-bold">1</td><td className="px-6 py-2 text-slate-600 font-bold">8</td></tr>
                <tr className="border-t-2 border-slate-400">
                  <td className="px-6 py-2 text-indigo-700 font-bold">2</td>
                  <td className="px-6 py-2 text-indigo-700 font-bold">4</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center text-indigo-700 font-bold text-xl bg-indigo-50 rounded-xl py-3">
            42 − 18 = 24 ✓
          </div>
          <p className="text-sm text-slate-500">Vérification : 24 + 18 = 42 ✓ (l'addition permet de vérifier la soustraction !)</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.slice(0, step + 1).map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-mono font-bold text-blue-600 uppercase">{s.title}</div>
          {s.content}
        </motion.div>
      ))}
      {step < steps.length - 1 && (
        <button onClick={() => setStep((v) => v + 1)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
          Étape suivante →
        </button>
      )}
      {step === steps.length - 1 && !done && (
        <button onClick={onComplete} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all">
          J'ai compris → suite
        </button>
      )}
    </div>
  );
}

/* ─── Laboratoire des erreurs ────────────────────────────────────── */
function ErrorLab({ onComplete, done }) {
  const [choice, setChoice] = useState(null);
  const [checked, setChecked] = useState(false);

  // Erreur : 63 - 27, quelqu'un a fait 44 en oubliant l'échange
  const errors = [
    { text: "L'élève a oublié l'échange (1 dizaine → 10 unités) dans la colonne des unités.", correct: true },
    { text: "L'élève a mal aligné les chiffres dans le tableau.", correct: false },
    { text: "L'élève a confondu dividende et diviseur.", correct: false },
  ];

  return (
    <div className="border-2 border-amber-200 rounded-2xl bg-amber-50/50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔍</span>
        <div>
          <h3 className="font-bold text-slate-800">Détective des erreurs</h3>
          <p className="text-sm text-slate-500">Un élève a calculé <strong>63 − 27 = 44</strong>. Trouve son erreur !</p>
        </div>
      </div>

      {/* Calcul erroné */}
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-center font-mono text-2xl">
          <thead><tr className="text-xs text-slate-400"><th className="px-6 py-1">Dizaines</th><th className="px-6 py-1">Unités</th></tr></thead>
          <tbody>
            <tr><td className="px-6 py-2 font-bold">6</td><td className="px-6 py-2 font-bold">3</td></tr>
            <tr><td className="px-6 py-2 font-bold text-slate-500">2</td><td className="px-6 py-2 font-bold text-slate-500">7</td></tr>
            <tr className="border-t-2 border-slate-400">
              <td className="px-6 py-2 text-rose-600 font-bold">4</td>
              <td className="px-6 py-2 text-rose-600 font-bold">4</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 text-center">Le résultat affiché : <strong className="text-rose-600">44</strong> — mais c'est faux ! Pourquoi ?</p>

      {!done && (
        <div className="space-y-2">
          {errors.map((e, i) => (
            <button
              key={i}
              onClick={() => !checked && setChoice(i)}
              disabled={checked}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                choice === i
                  ? checked
                    ? e.correct ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-rose-50 border-rose-400 text-rose-700'
                    : 'bg-amber-100 border-amber-400 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {e.text}
            </button>
          ))}
          <button
            onClick={() => { if (choice !== null) setChecked(true); }}
            disabled={choice === null || checked}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm disabled:opacity-40"
          >
            Valider
          </button>

          <AnimatePresence>
            {checked && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                {errors[choice].correct ? (
                  <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
                    <CheckCircle2 className="inline w-4 h-4 mr-1" />
                    Exact ! 3 − 7 est impossible sans échange. Il fallait emprunter 1 dizaine → 13 − 7 = 6. Résultat correct : <strong>36</strong>.
                  </div>
                ) : (
                  <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
                    <XCircle className="inline w-4 h-4 mr-1" /> Pas tout à fait. Regarde la colonne des unités : 3 − 7, est-ce possible directement ?
                  </div>
                )}
                {errors[choice].correct && (
                  <button onClick={onComplete} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm">
                    J'ai compris !
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {done && <div className="text-emerald-600 font-bold text-sm text-center"><CheckCircle2 className="inline w-4 h-4 mr-1" /> Erreur identifiée !</div>}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module03Soustraction() {
  const [phase, setPhase] = useState(0);
  const navLinks = getNavLinks(3);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Soustraire : retirer, comparer, compléter"
      moduleSubtitle="Découvrir les trois sens de la soustraction et maîtriser les échanges."
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={phase >= 4 ? navLinks.nextLink : undefined}
      isCompleted={phase >= 4}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-1.5 flex-wrap">
          {['3 sens', 'Droite graduée', 'Soustraction posée', 'Labo des erreurs'].map((l, i) => (
            <div key={i} className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${i < phase ? 'bg-emerald-100 text-emerald-700' : i === phase ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {i < phase ? '✓ ' : ''}{l}
            </div>
          ))}
        </div>

        {/* Phase 0 — 3 sens */}
        {phase === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">La soustraction a trois visages</h2>
            <ThreeMeanings onAllDone={() => setPhase(1)} allDone={phase > 0} />
          </div>
        )}

        {/* ConceptCard des 3 sens */}
        {phase >= 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ConceptCard label="La soustraction" emoji="➖" color="blue">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                {[
                  { emoji: '🗑️', title: 'Retirer', ex: '13 − 5' },
                  { emoji: '⚖️', title: 'Comparer', ex: '13 − 8' },
                  { emoji: '🧩', title: 'Compléter', ex: '13 − 8' },
                ].map(({ emoji, title, ex }) => (
                  <div key={title} className="bg-white rounded-xl border border-blue-100 p-3 text-center">
                    <div className="text-lg">{emoji}</div>
                    <div className="font-bold text-blue-700 text-sm">{title}</div>
                    <div className="text-xs text-slate-500">{ex}</div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Dans <MathText>{'$a - b = d$'}</MathText>, <strong>a</strong> est le <strong>premier terme</strong>, <strong>b</strong> le <strong>second terme</strong>, et <strong>d</strong> la <strong>différence</strong>.
              </p>
            </ConceptCard>
          </motion.div>
        )}

        {/* Phase 1 — Droite graduée */}
        {phase >= 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Soustraction sur la droite graduée</h2>
            <SubtractionLine onComplete={() => setPhase(2)} done={phase > 1} />
          </div>
        )}

        {/* Phase 2 — Soustraction posée */}
        {phase >= 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">La soustraction posée et les échanges</h2>
            <SubtractionPosed onComplete={() => setPhase(3)} done={phase > 2} />
          </div>
        )}

        {/* Phase 3 — Labo erreurs */}
        {phase >= 3 && (
          <ErrorLab onComplete={() => setPhase(4)} done={phase >= 4} />
        )}

        {phase >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-6 text-center space-y-2">
            <div className="text-3xl">🏅</div>
            <div className="text-xl font-space font-bold">Soustraction maîtrisée !</div>
            <p className="text-blue-100 text-sm">Tu connais les 3 sens et tu sais gérer les échanges.</p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
