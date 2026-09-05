import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import ConceptCard from '../../../../../common/components/ConceptCard';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 3 V2 — reconstruit sur le lesson kit.
 *
 * Sens 1 (Retirer) reste une manipulation maison — clic-pour-avancer pur,
 * sans mauvaise réponse possible — `onSolved` (via `kit.react(true)`) est
 * appelé une seule fois, à l'atteinte de l'objectif. Sens 2 (Comparer) et
 * Sens 3 (Compléter) étaient des saisies numériques libres sans retour
 * correctif clair : converties en <NumericQuestion>, contenu identique.
 * La droite graduée et la soustraction posée restent des manipulations
 * maison (clic-pour-avancer). Le Labo des erreurs était un QCM maison avec
 * une boucle "Réessayer" implicite (aucune remédiation en cas d'erreur) :
 * converti en <TapQuestion>, ce qui corrige ce blocage automatiquement.
 */

/* ─── Sens 1 : Retirer (manipulation maison) ─────────────────────── */
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

/* ─── Sens 2 : Comparer (visuel maison + NumericQuestion) ─────────── */
function MeaningComparer({ done, onAnswered }) {
  return (
    <div className="border-2 border-blue-100 rounded-2xl p-5 space-y-4 bg-blue-50/40">
      <div className="flex items-center gap-2">
        <span className="bg-blue-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">Sens 2</span>
        <span className="font-bold text-slate-800">COMPARER</span>
      </div>

      <NumericQuestion
        prompt="Groupe A : 13 billes. Groupe B : 8 billes. De combien le groupe A a-t-il plus de billes que le groupe B ?"
        above={
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
        }
        expected={5}
        explain="13 − 8 = 5 — Le groupe A a 5 billes de plus. On compare deux quantités."
        solved={done}
        onAnswered={() => onAnswered()}
      />
    </div>
  );
}

/* ─── Sens 3 : Compléter (visuel maison + NumericQuestion) ─────────── */
function MeaningCompleter({ done, onAnswered }) {
  return (
    <div className="border-2 border-violet-100 rounded-2xl p-5 space-y-4 bg-violet-50/40">
      <div className="flex items-center gap-2">
        <span className="bg-violet-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">Sens 3</span>
        <span className="font-bold text-slate-800">COMPLÉTER</span>
      </div>

      <NumericQuestion
        prompt="Tu as 8 €. Tu veux acheter quelque chose qui coûte 13 €. Combien d'euros te manque-t-il ?"
        above={
          <div className="bg-white rounded-xl border border-violet-100 p-4 space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>0 €</span><span>8 €</span><span>13 €</span>
            </div>
            <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-violet-400 rounded-full" style={{ width: `${(8 / 13) * 100}%` }} />
              <div className="absolute top-0 h-full bg-violet-200 rounded-full border-2 border-dashed border-violet-400" style={{ left: `${(8 / 13) * 100}%`, width: `${(5 / 13) * 100}%` }} />
            </div>
            <div className="text-xs text-violet-600 font-medium text-center">Les 8 € que tu as + ??? = 13 €</div>
          </div>
        }
        expected={5}
        explain="13 − 8 = 5 € — On cherche ce qui manque pour compléter. C'est aussi une soustraction !"
        solved={done}
        onAnswered={() => onAnswered()}
      />
    </div>
  );
}

/* ─── Droite graduée interactive (manipulation maison) ─────────────── */
function SubtractionLine({ onSolved, done }) {
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
          onClick={() => {
            if (!finished && !done) {
              const next = pos - 1;
              setPos(next);
              if (next === target) onSolved();
            }
          }}
          disabled={finished || done}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${finished || done ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'}`}
        >
          ← −1 pas
        </button>
      </div>

      {finished && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 className="inline w-4 h-4 mr-1" /> <strong>15 − 6 = 9</strong> — Reculer sur la droite graduée, c'est soustraire !
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Soustraction posée avec échange (manipulation maison) ────────── */
function SubtractionPosed({ onSolved, done }) {
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
            Problème : dans la colonne des unités, <strong>2 − 8</strong> est impossible !<br />
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
        <button onClick={onSolved} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all">
          J'ai compris → suite
        </button>
      )}
    </div>
  );
}

/* ─── Labo des erreurs (TapQuestion) ────────────────────────────────── */
const ERROR_OPTIONS = [
  "L'élève a oublié l'échange (1 dizaine → 10 unités) dans la colonne des unités.",
  "L'élève a mal aligné les chiffres dans le tableau.",
  "L'élève a confondu dividende et diviseur.",
];

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module03Soustraction() {
  const [retirerDone, setRetirerDone] = useState(false);
  const [comparerDone, setComparerDone] = useState(false);
  const [completerDone, setCompleterDone] = useState(false);
  const [lineDone, setLineDone] = useState(false);
  const [posedDone, setPosedDone] = useState(false);
  const [errorDone, setErrorDone] = useState(false);

  const sensDone = retirerDone && comparerDone && completerDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Soustraire : retirer, comparer, compléter"
      moduleSubtitle="Découvrir les trois sens de la soustraction et maîtriser les échanges."
      estimatedTime="12 min"
      brief={{
        tag: '➖ Découverte',
        title: 'La soustraction a trois visages',
        tone: 'slate',
        body: (
          <p>
            La soustraction traduit <strong className="text-white">trois situations différentes</strong> : retirer,
            comparer, compléter. Tu vas explorer chacune d'elles.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Les 3 sens de la soustraction',
          subtitle: 'Retirer, comparer, compléter : trois façons de voir la même opération.',
          done: sensDone,
          content: (kit) => (
            <div className="space-y-4">
              <MeaningRetirer
                done={retirerDone}
                onDone={() => {
                  kit.react(true);
                  setRetirerDone(true);
                }}
              />
              {retirerDone && (
                <MeaningComparer done={comparerDone} onAnswered={() => setComparerDone(true)} />
              )}
              {comparerDone && (
                <MeaningCompleter done={completerDone} onAnswered={() => setCompleterDone(true)} />
              )}

              {sensDone && (
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
            </div>
          ),
        },
        {
          num: 2,
          title: 'Soustraction sur la droite graduée',
          subtitle: 'Recule pas à pas et observe le résultat.',
          done: lineDone,
          content: (kit) => (
            <SubtractionLine
              done={lineDone}
              onSolved={() => {
                kit.react(true);
                setLineDone(true);
              }}
            />
          ),
        },
        {
          num: 3,
          title: 'La soustraction posée et les échanges',
          subtitle: 'Aligner, soustraire colonne par colonne, gérer les échanges.',
          done: posedDone,
          content: (kit) => (
            <SubtractionPosed
              done={posedDone}
              onSolved={() => {
                kit.react(true);
                setPosedDone(true);
              }}
            />
          ),
        },
        {
          num: 4,
          title: 'Labo des erreurs',
          subtitle: "Un élève a calculé 63 − 27 = 44. Trouve son erreur !",
          done: errorDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  <span className="text-xl mr-1">🔍</span>
                  Un élève a calculé <strong>63 − 27 = 44</strong>. Trouve son erreur !
                </>
              }
              above={
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
              }
              options={ERROR_OPTIONS}
              correct={0}
              cols={1}
              explain="Exact ! 3 − 7 est impossible sans échange. Il fallait emprunter 1 dizaine → 13 − 7 = 6. Résultat correct : 36."
              explainWrong="Pas tout à fait. Regarde la colonne des unités : 3 − 7, est-ce possible directement ?"
              solved={errorDone}
              onAnswered={() => setErrorDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-6 text-center space-y-2">
          <div className="text-3xl">🏅</div>
          <div className="text-xl font-space font-bold">Soustraction maîtrisée !</div>
          <p className="text-blue-100 text-sm">Tu connais les 3 sens et tu sais gérer les échanges.</p>
        </motion.div>
      }
    />
  );
}
