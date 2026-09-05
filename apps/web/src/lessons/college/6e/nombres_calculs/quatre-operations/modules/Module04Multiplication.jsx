import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ContentModule, NumericQuestion } from '../../../../../common/kit';
import ConceptCard from '../../../../../common/components/ConceptCard';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 4 V2 — reconstruit sur le lesson kit.
 *
 * Quatre manipulations maison (groupes égaux, grille libre, décomposition de
 * 7×23, multiplication posée de 23×14) restent des composants bespoke —
 * elles suivent le contrat kit (solved/onSolved, react() au bon moment,
 * onSolved inconditionnel) mais ne sont pas des questions à choix. La seule
 * manipulation déjà libre (§11 : GridManip, exploration sans contrainte de
 * justesse) le reste : son bouton "J'ai exploré la grille" appelle
 * kit.react(true) puis onComplete, sans jamais bloquer.
 *
 * Les 3 exercices de pratique (Phase 4 de l'original) violaient la politique
 * formative — un "Réessayer" bloquant tant que la réponse n'était pas
 * correcte. Convertis ici en 3 <NumericQuestion> séquentielles : révélation
 * immédiate, onAnswered inconditionnel, indice affiché en cas d'erreur.
 */

/* ─── Manipulation 1 : Groupes égaux (bespoke) ────────────────────── */
function EqualGroups({ onSolved, solved, react }) {
  const [numGroups, setNumGroups] = useState(solved ? 4 : 1);
  const perGroup = 3;
  const target = 4;

  const total = numGroups * perGroup;
  const finished = numGroups === target;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        On prépare des boîtes, chacune contenant <strong>3 objets</strong>.
        Ajoute des boîtes une par une et observe comment la quantité totale évolue.
      </p>

      {/* Boîtes */}
      <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[100px]">
        {Array.from({ length: numGroups }).map((_, gi) => (
          <motion.div
            key={gi}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-1.5 bg-violet-50 border-2 border-violet-200 rounded-xl p-3"
          >
            <div className="flex gap-1">
              {Array.from({ length: perGroup }).map((_, oi) => (
                <div key={oi} className="w-6 h-6 rounded-full bg-violet-400 shadow-sm" />
              ))}
            </div>
            <span className="text-[10px] font-mono text-violet-600 font-bold">Boîte {gi + 1}</span>
          </motion.div>
        ))}
      </div>

      {/* Contrôle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setNumGroups((v) => Math.max(1, v - 1))}
          disabled={solved}
          className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 font-bold text-xl transition-all disabled:opacity-40"
        >−</button>
        <div className="text-center">
          <div className="text-2xl font-space font-bold text-violet-700">{numGroups} boîte{numGroups > 1 ? 's' : ''}</div>
          <div className="text-sm text-slate-500">{numGroups} × {perGroup} = <strong className="text-violet-700">{total}</strong> objets</div>
        </div>
        <button
          onClick={() => setNumGroups((v) => Math.min(v + 1, 8))}
          disabled={solved}
          className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xl transition-all disabled:opacity-40"
        >+</button>
      </div>

      {/* Addition répétée */}
      <div className="bg-slate-800 text-white rounded-xl p-4 text-center space-y-1">
        <div className="text-xs font-mono text-slate-400">Addition répétée → pont vers la multiplication</div>
        <div className="font-space font-bold text-lg">
          {Array.from({ length: numGroups }, () => perGroup).join(' + ')}
          <span className="text-violet-300 ml-2">= {total}</span>
        </div>
        <div className={`text-xl font-bold mt-1 ${numGroups >= 3 ? 'text-violet-300' : 'text-slate-500'}`}>
          {numGroups} × {perGroup} = {total}
        </div>
      </div>

      <AnimatePresence>
        {finished && !solved && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>4 × 3 = 12</strong> — 4 groupes de 3, c'est 12. La multiplication, c'est des <em>groupes de même taille</em>.
            </div>
            <div className="text-sm text-slate-600 bg-violet-50 border border-violet-200 rounded-xl p-3">
              💡 L'addition répétée (3+3+3+3) donne le même résultat, mais la multiplication est bien plus rapide
              quand le nombre de groupes est grand !
            </div>
            <button
              onClick={() => { react(true); onSolved(); }}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all"
            >
              Continuer →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Manipulation 2 : Grille interactive — exploration libre (bespoke) ─── */
function GridManip({ onSolved, solved, react }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const total = rows * cols;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        Une grille rectangulaire illustre parfaitement la multiplication.
        Modifie le nombre de lignes et de colonnes.
      </p>

      {/* Grille */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          {Array.from({ length: rows }).map((_, ri) => (
            <div key={ri} className="flex gap-1">
              {Array.from({ length: cols }).map((_, ci) => (
                <motion.div
                  key={ci}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (ri * cols + ci) * 0.02 }}
                  className="w-8 h-8 rounded-md bg-violet-400 shadow-sm flex items-center justify-center text-[10px] font-mono text-white font-bold"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Contrôles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-500 uppercase">Lignes (groupes)</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setRows((v) => Math.max(1, v - 1))} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 font-bold transition-all">−</button>
            <span className="w-8 text-center font-space font-bold text-xl text-violet-700">{rows}</span>
            <button onClick={() => setRows((v) => Math.min(v + 1, 8))} className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all">+</button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-500 uppercase">Colonnes (par groupe)</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setCols((v) => Math.max(1, v - 1))} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 font-bold transition-all">−</button>
            <span className="w-8 text-center font-space font-bold text-xl text-violet-700">{cols}</span>
            <button onClick={() => setCols((v) => Math.min(v + 1, 10))} className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all">+</button>
          </div>
        </div>
      </div>

      <div className="text-center font-space font-bold text-3xl bg-violet-50 border border-violet-200 rounded-xl py-4">
        <span className="text-slate-600">{rows}</span>
        <span className="text-violet-500 mx-3">×</span>
        <span className="text-slate-600">{cols}</span>
        <span className="text-violet-400 mx-3">=</span>
        <span className="text-violet-700">{total}</span>
      </div>

      {!solved && (
        <button
          onClick={() => { react(true); onSolved(); }}
          className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all"
        >
          J'ai exploré la grille → continuer
        </button>
      )}
    </div>
  );
}

/* ─── Manipulation 3 : Décomposition — 7 × 23 (bespoke walkthrough) ─── */
function DecompositionManip({ onSolved, solved, react }) {
  const [step, setStep] = useState(solved ? 2 : 0);
  // 7 × 23
  const a = 7, b = 23, b1 = 20, b2 = 3;

  const steps = [
    {
      title: '7 × 23 — Comment faire ?',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Calculer <strong>7 × 23</strong> de tête, c'est compliqué. Mais <strong>23 = 20 + 3</strong> !
          </p>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center text-lg font-space font-bold text-violet-700">
            23 = 20 + 3
          </div>
          <p className="text-sm text-slate-500">On peut donc découper le problème en deux parties plus simples.</p>
        </div>
      ),
    },
    {
      title: 'On distribue la multiplication',
      content: (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-center font-space font-bold text-xl">
            <div>
              <span className="text-slate-600">{a} × {b}</span>
              <span className="text-slate-400 mx-2">=</span>
              <span className="text-violet-600">{a} × {b1}</span>
              <span className="text-slate-400 mx-2">+</span>
              <span className="text-indigo-600">{a} × {b2}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
              <div className="text-xs font-mono text-violet-500 mb-1">{a} × {b1}</div>
              <div className="text-2xl font-space font-bold text-violet-700">{a * b1}</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
              <div className="text-xs font-mono text-indigo-500 mb-1">{a} × {b2}</div>
              <div className="text-2xl font-space font-bold text-indigo-700">{a * b2}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Résultat final',
      content: (
        <div className="space-y-3">
          <div className="bg-slate-800 text-white rounded-xl p-5 text-center space-y-2">
            <div className="text-slate-400 text-sm font-mono">{a} × {b1} + {a} × {b2}</div>
            <div className="text-2xl font-space font-bold">{a * b1} + {a * b2}</div>
            <div className="text-3xl font-space font-bold text-violet-300">= {a * b}</div>
          </div>
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="inline w-4 h-4 mr-1" />
            <strong>7 × 23 = {a * b}</strong> — La décomposition rend le calcul mental beaucoup plus simple !
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.slice(0, step + 1).map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-mono font-bold text-violet-600 uppercase">{s.title}</div>
          {s.content}
        </motion.div>
      ))}
      {step < steps.length - 1 && (
        <button onClick={() => setStep((v) => v + 1)} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all">
          Étape suivante →
        </button>
      )}
      {step === steps.length - 1 && !solved && (
        <button
          onClick={() => { react(true); onSolved(); }}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
        >
          Compris → suite
        </button>
      )}
    </div>
  );
}

/* ─── Multiplication posée : 23 × 14 (bespoke walkthrough) ─────────── */
function PosedMultiplication({ onSolved, solved, react }) {
  const [step, setStep] = useState(solved ? 3 : 0);

  const steps = [
    {
      title: 'Le sens : 23 × 14',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Avant de poser le calcul, comprenons ce que signifie <strong>23 × 14</strong> :</p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2 text-sm">
            <div className="font-bold text-indigo-700">23 × 14</div>
            <div className="text-indigo-600">= 23 × (10 + 4)</div>
            <div className="text-indigo-600">= <span className="font-bold">23 × 10</span> + <span className="font-bold">23 × 4</span></div>
          </div>
          <p className="text-sm text-slate-500">On va calculer ces deux parties séparément, puis les additionner.</p>
        </div>
      ),
    },
    {
      title: '1re partie : 23 × 4',
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
              <tbody>
                <tr><td className="px-5 py-2 font-bold">2</td><td className="px-5 py-2 font-bold">3</td></tr>
                <tr><td className="px-5 py-2 font-bold text-slate-500">×</td><td className="px-5 py-2 font-bold text-slate-500">4</td></tr>
                <tr className="border-t-2 border-slate-400">
                  <td className="px-5 py-2 text-indigo-700 font-bold">9</td>
                  <td className="px-5 py-2 text-indigo-700 font-bold">2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600 text-center">23 × 4 = 92</p>
        </div>
      ),
    },
    {
      title: "2e partie : 23 × 10 (décalage d'une position)",
      content: (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <p className="font-bold text-amber-800">Multiplier par 10 = décaler d'une position vers la gauche</p>
            <p className="text-amber-700 mt-1">23 × 10 = 230 (on écrit 0 à droite et on décale d'une colonne)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
              <tbody>
                <tr><td className="px-5 py-2 text-amber-600 font-bold">2</td><td className="px-5 py-2 text-amber-600 font-bold">3</td><td className="px-5 py-2 text-amber-600 font-bold">0</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-center text-slate-600">23 × 10 = 230</p>
        </div>
      ),
    },
    {
      title: 'Addition des deux parties',
      content: (
        <div className="space-y-3">
          <div className="bg-slate-800 text-white rounded-xl p-5 text-center space-y-2">
            <div className="text-slate-400 text-sm">23 × 4 + 23 × 10</div>
            <div className="text-2xl font-space font-bold">92 + 230</div>
            <div className="text-3xl font-space font-bold text-violet-300">= 322</div>
          </div>
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="inline w-4 h-4 mr-1" />
            <strong>23 × 14 = 322</strong> — L'algorithme posé fait exactement ces deux étapes !
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.slice(0, step + 1).map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-mono font-bold text-indigo-600 uppercase">{s.title}</div>
          {s.content}
        </motion.div>
      ))}
      {step < steps.length - 1 && (
        <button onClick={() => setStep((v) => v + 1)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all">
          Étape suivante →
        </button>
      )}
      {step === steps.length - 1 && !solved && (
        <button
          onClick={() => { react(true); onSolved(); }}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
        >
          Compris → pratique
        </button>
      )}
    </div>
  );
}

/* ─── ConceptCard "La multiplication" ───────────────────────────────── */
function MultiplicationConcept() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <ConceptCard label="La multiplication" emoji="✖️" color="violet">
        <p>
          Dans <MathText>{'$a \\times b = p$'}</MathText>, on appelle <strong className="text-violet-700">a</strong> et{' '}
          <strong className="text-violet-700">b</strong> les <strong>facteurs</strong> et{' '}
          <strong className="text-violet-700">p</strong> le <strong>produit</strong>.
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white rounded-lg border border-violet-100 p-2"><div className="font-bold text-violet-700">a</div><div className="text-slate-500">nombre de groupes</div></div>
          <div className="bg-white rounded-lg border border-violet-100 p-2"><div className="font-bold text-violet-700">b</div><div className="text-slate-500">taille de chaque groupe</div></div>
          <div className="bg-white rounded-lg border border-violet-100 p-2"><div className="font-bold text-violet-700">p</div><div className="text-slate-500">total</div></div>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          💡 <strong>Propriété pratique :</strong> <MathText>{'$a \\times b = b \\times a$'}</MathText> (on peut inverser les facteurs)
        </p>
      </ConceptCard>
    </motion.div>
  );
}

/* ─── Pratique — 3 exercices, NumericQuestion séquentielles ─────────── */
const EXERCISES = [
  { q: '6 × 7', expected: 42 },
  { q: '8 × 9', expected: 72, explainFor: () => 'Tu peux décomposer : 8×9 = 8×10 − 8×1' },
  { q: '4 × 25', expected: 100, explainFor: () => '4 × 25 = 4 × (20 + 5) = 80 + 20 = 100' },
];

function MultPractice({ q1, setQ1, q2, setQ2, q3, setQ3 }) {
  return (
    <div className="space-y-6">
      <NumericQuestion
        prompt={`Exercice 1/3 — ${EXERCISES[0].q} = ?`}
        expected={EXERCISES[0].expected}
        explain="6 × 7 = 42."
        solved={q1}
        onAnswered={() => setQ1(true)}
      />
      {q1 && (
        <NumericQuestion
          prompt={`Exercice 2/3 — ${EXERCISES[1].q} = ?`}
          expected={EXERCISES[1].expected}
          explain="8 × 9 = 72."
          explainFor={EXERCISES[1].explainFor}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      )}
      {q2 && (
        <NumericQuestion
          prompt={`Exercice 3/3 — ${EXERCISES[2].q} = ?`}
          expected={EXERCISES[2].expected}
          explain="4 × 25 = 100."
          explainFor={EXERCISES[2].explainFor}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      )}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module04Multiplication() {
  const [groupsDone, setGroupsDone] = useState(false);
  const [gridDone, setGridDone] = useState(false);
  const [decompDone, setDecompDone] = useState(false);
  const [posedDone, setPosedDone] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const s1 = groupsDone;
  const s2 = gridDone;
  const s3 = decompDone;
  const s4 = posedDone;
  const s5 = q1 && q2 && q3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Multiplier : construire des groupes"
      moduleSubtitle="Groupes égaux, grille interactive, décomposition et multiplication posée."
      estimatedTime="12 min"
      brief={{
        tag: '✖️ Mission 04',
        title: 'Des groupes de même taille',
        body: (
          <p>
            La multiplication, c'est compter vite des groupes identiques. Tu vas construire ces groupes à la
            main, puis découvrir comment décomposer un calcul pour le rendre simple.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Des groupes de même taille',
          done: s1,
          content: (kit) => (
            <EqualGroups solved={s1} onSolved={() => setGroupsDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: 'La grille rectangulaire',
          subtitle: 'Explore librement, puis découvre le vocabulaire de la multiplication.',
          done: s2,
          content: (kit) => (
            <div className="space-y-6">
              <GridManip solved={s2} onSolved={() => setGridDone(true)} react={kit.react} />
              {s2 && <MultiplicationConcept />}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Décomposer pour calculer',
          done: s3,
          content: (kit) => (
            <DecompositionManip solved={s3} onSolved={() => setDecompDone(true)} react={kit.react} />
          ),
        },
        {
          num: 4,
          title: 'La multiplication posée',
          done: s4,
          content: (kit) => (
            <PosedMultiplication solved={s4} onSolved={() => setPosedDone(true)} react={kit.react} />
          ),
        },
        {
          num: 5,
          title: "Je m'entraîne",
          done: s5,
          content: (
            <MultPractice q1={q1} setQ1={setQ1} q2={q2} setQ2={setQ2} q3={q3} setQ3={setQ3} />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl p-6 text-center space-y-2">
          <div className="text-3xl">🏅</div>
          <div className="text-xl font-space font-bold">Multiplication maîtrisée !</div>
          <p className="text-violet-100 text-sm">Groupes égaux, grille, décomposition — tu as tout compris.</p>
        </motion.div>
      }
    />
  );
}
