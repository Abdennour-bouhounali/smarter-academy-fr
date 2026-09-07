import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 V2 — reconstruit sur le lesson kit.
 *
 * Les trois manipulations (billes, droite graduée, valeur de position)
 * restent des composants maison — pur clic-pour-avancer sans mauvais état,
 * donc rien à rendre formatif : `onSolved` (via `kit.react(true)`) est
 * appelé une seule fois, à l'atteinte de l'objectif. Le mini-exercice de
 * pratique (Phase 4 de l'original) était une boucle "Réessayer" — violation
 * du contrat §6 — remplacé ici par trois <NumericQuestion> séquentielles :
 * le contenu (énoncés, réponses, indices) est préservé à l'identique.
 */

/* ─── Étape 1 : Objets à réunir ─────────────────────────────────── */
function ManipObjects({ onSolved, done }) {
  const [moved, setMoved] = useState(0); // combien d'objets déplacés vers le groupe A
  const groupA = 5;
  const toMove = 7;

  const handleMove = () => {
    if (moved < toMove) {
      const next = moved + 1;
      setMoved(next);
      if (next === toMove) onSolved();
    }
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
            disabled={finished}
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

      {finished && (
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
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : Droite graduée ──────────────────────────────────── */
function ManipNumberLine({ onSolved, done }) {
  const start = 7;
  const steps = 4;
  const [pos, setPos] = useState(start);
  const target = start + steps;
  const finished = pos === target;

  const handleStep = () => {
    if (pos < target) {
      const next = pos + 1;
      setPos(next);
      if (next === target) onSolved();
    }
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
          disabled={finished}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            finished || done
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
          }`}
        >
          +1 pas →
        </button>
      </div>

      {finished && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-800 text-sm">
            <CheckCircle2 className="inline w-4 h-4 mr-1" />
            <strong>7 + 4 = 11 !</strong> Avancer sur la droite graduée, c'est additionner.
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 3 : Valeur de position + retenue (walkthrough guidé) ─── */
const PLACE_VALUE_STEPS = [
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

function ManipPlaceValue({ onSolved, done }) {
  const [step, setStep] = useState(0); // 0: alignement, 1: somme, 2: retenue

  return (
    <div className="space-y-5">
      <p className="text-slate-700 text-sm">
        Voyons maintenant comment poser une addition avec des décimaux.
        <br />
        <strong>Exemple : 38,4 + 7,25</strong>
      </p>

      <div className="space-y-4">
        {PLACE_VALUE_STEPS.slice(0, step + 1).map((s, i) => (
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
        {step < PLACE_VALUE_STEPS.length - 1 && (
          <button
            onClick={() => setStep((v) => v + 1)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
          >
            Étape suivante →
          </button>
        )}
        {step === PLACE_VALUE_STEPS.length - 1 && !done && (
          <button
            onClick={onSolved}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
          >
            J'ai compris → suite
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Étape 4 : exercices (NumericQuestion, formatif) ─────────────── */
const EXERCISES = [
  { expr: '23 + 45', answer: 68 },
  { expr: '157 + 86', answer: 243, hint: 'Unités : 7+6=13 → retenue ! Dizaines : 5+8+1=14 → retenue encore !' },
  { expr: '4,7 + 2,8', answer: 7.5, hint: 'Dixièmes : 7+8=15 → garde 5, reporte 1 aux unités.' },
];

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module02Addition() {
  const [manipObjectsDone, setManipObjectsDone] = useState(false);
  const [numberLineDone, setNumberLineDone] = useState(false);
  const [placeValueDone, setPlaceValueDone] = useState(false);
  const [exDone, setExDone] = useState([]); // indices d'exercices répondus

  const exAllDone = exDone.length === EXERCISES.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Additionner : réunir et augmenter"
      moduleSubtitle="Manipuler des objets, avancer sur la droite graduée, maîtriser les retenues."
      estimatedTime="8 min"
      brief={{
        tag: '➕ Découverte',
        title: "Qu'est-ce qu'additionner ?",
        tone: 'slate',
        body: (
          <p>
            Additionner, c'est <strong className="text-white">réunir</strong> deux quantités pour en former une
            plus grande. C'est aussi <strong className="text-white">augmenter</strong> une quantité d'un certain
            montant. Tu vas manipuler des billes pour découvrir le résultat et son vocabulaire :{' '}
            <strong className="text-white">5 billes + 7 billes = ?</strong>
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Réunis les billes',
          subtitle: 'Transfère les billes bleues une par une pour réunir les deux groupes.',
          done: manipObjectsDone,
          content: (kit) => (
            <div className="space-y-5">
              <ManipObjects
                done={manipObjectsDone}
                onSolved={() => {
                  kit.react(true);
                  setManipObjectsDone(true);
                }}
              />
              {/* Les deux mots arrivent quand les deux tas n'en font plus qu'un :
                  le geste vient de leur donner un sens. */}
              {manipObjectsDone && (
                <KnowledgeBrick
                  id="termes-somme"
                  variant="new"
                  lead="Les deux tas que tu as réunis, et le tas final : chacun porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Addition sur la droite graduée',
          subtitle: 'Avance pas à pas et observe le résultat grandir.',
          done: numberLineDone,
          content: (kit) => (
            <ManipNumberLine
              done={numberLineDone}
              onSolved={() => {
                kit.react(true);
                setNumberLineDone(true);
              }}
            />
          ),
        },
        {
          num: 3,
          title: "L'addition posée et les retenues",
          subtitle: 'Aligner, additionner colonne par colonne, gérer les échanges.',
          done: placeValueDone,
          content: (kit) => (
            <div className="space-y-6">
              <ManipPlaceValue
                done={placeValueDone}
                onSolved={() => {
                  kit.react(true);
                  setPlaceValueDone(true);
                }}
              />
              {/* La retenue vient d'être manipulée colonne par colonne :
                  c'est ici, et pas dans un encadré de fin, qu'on la nomme. */}
              {placeValueDone && (
                <KnowledgeBrick
                  id="retenue"
                  variant="new"
                  lead="La colonne des unités a débordé, et tu as vu où partait le trop-plein."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: "Je m'entraîne",
          subtitle: 'Trois additions, des unités aux décimaux.',
          done: exAllDone,
          content: (
            <div className="space-y-6">
              {EXERCISES.map((ex, i) =>
                i === 0 || exDone.includes(i - 1) ? (
                  <NumericQuestion
                    key={ex.expr}
                    prompt={`${ex.expr} = ?`}
                    requires={['termes-somme', 'retenue']}
                    expected={ex.answer}
                    parse={parseDec}
                    explain={ex.hint}
                    solved={exDone.includes(i)}
                    onAnswered={() => setExDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Réunir est fait. On passe à l'opération qui va dans l'autre
          sens — et qui, elle, raconte trois histoires différentes.
        </KnowledgeSnapshot>
      }
    />
  );
}
