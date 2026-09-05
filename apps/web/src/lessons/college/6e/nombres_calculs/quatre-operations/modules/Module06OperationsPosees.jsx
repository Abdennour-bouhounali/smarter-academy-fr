import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, NumericQuestion } from '../../../../../common/kit';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Tableau de valeur de position (revue pas à pas, non interactif) ── */
function PlaceValueBoard({ operation, onComplete, done }) {
  const [step, setStep] = useState(0);
  const { title, steps } = operation;

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-slate-700">{title}</div>
      {steps.slice(0, step + 1).map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wide">{s.label}</div>
          {s.content}
        </motion.div>
      ))}
      {step < steps.length - 1 && (
        <button onClick={() => setStep((v) => v + 1)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all">
          Étape suivante →
        </button>
      )}
      {step === steps.length - 1 && !done && (
        <button onClick={onComplete} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all">
          Compris → opération suivante
        </button>
      )}
    </div>
  );
}

/* ─── Définitions des opérations posées ─────────────────────── */
const OPERATIONS = [
  {
    id: 'addition',
    title: 'Addition posée : 247 + 158',
    color: 'emerald',
    steps: [
      {
        label: 'Aligner les valeurs de même rang',
        content: (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr><td className="px-5 py-2 font-bold">2</td><td className="px-5 py-2 font-bold">4</td><td className="px-5 py-2 font-bold">7</td></tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">1</td><td className="px-5 py-2 font-bold text-slate-500">5</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-600 text-center">On aligne les chiffres de même rang avant d'additionner.</p>
          </div>
        ),
      },
      {
        label: 'Unités : 7 + 8 = 15 → retenue',
        content: (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>7 + 8 = 15 unités</strong> = 1 dizaine + 5 unités<br/>
              On écrit 5 dans la colonne unités et on reporte 1 dizaine.
            </div>
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr className="text-xs font-mono text-amber-600"><td></td><td className="px-5 py-0.5 font-bold">¹</td><td></td></tr>
                  <tr><td className="px-5 py-2 font-bold">2</td><td className="px-5 py-2 font-bold">4</td><td className="px-5 py-2 font-bold">7</td></tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">1</td><td className="px-5 py-2 font-bold text-slate-500">5</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                  <tr className="border-t-2 border-slate-400"><td></td><td></td><td className="px-5 py-2 text-emerald-600 font-bold">5</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        label: 'Dizaines : 4 + 5 + 1 = 10 → retenue',
        content: (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>4 + 5 + 1 (retenue) = 10</strong> = 1 centaine + 0 dizaine<br/>
              On écrit 0 dans les dizaines et on reporte 1 centaine.
            </div>
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr className="text-xs font-mono text-amber-600"><td className="px-5 py-0.5 font-bold">¹</td><td></td><td></td></tr>
                  <tr><td className="px-5 py-2 font-bold">2</td><td className="px-5 py-2 font-bold">4</td><td className="px-5 py-2 font-bold">7</td></tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">1</td><td className="px-5 py-2 font-bold text-slate-500">5</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                  <tr className="border-t-2 border-slate-400"><td></td><td className="px-5 py-2 text-emerald-600 font-bold">0</td><td className="px-5 py-2 text-emerald-600 font-bold">5</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        label: 'Centaines : 2 + 1 + 1 = 4 → résultat',
        content: (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr><td className="px-5 py-2 font-bold">2</td><td className="px-5 py-2 font-bold">4</td><td className="px-5 py-2 font-bold">7</td></tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">1</td><td className="px-5 py-2 font-bold text-slate-500">5</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                  <tr className="border-t-2 border-slate-400"><td className="px-5 py-2 text-indigo-700 font-bold">4</td><td className="px-5 py-2 text-indigo-700 font-bold">0</td><td className="px-5 py-2 text-indigo-700 font-bold">5</td></tr>
                </tbody>
              </table>
            </div>
            <div className="text-center font-bold text-indigo-700 bg-indigo-50 rounded-xl py-3 text-xl">
              247 + 158 = 405 ✓
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'soustraction',
    title: 'Soustraction posée : 543 − 278',
    color: 'blue',
    steps: [
      {
        label: 'Unités : 3 − 8 impossible → échange',
        content: (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>3 − 8</strong> est impossible. On emprunte 1 dizaine : 3 → 13<br/>
              La colonne des dizaines perd 1 : 4 → 3.
            </div>
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-2 font-bold">5</td>
                    <td className="px-5 py-2"><span className="line-through text-slate-300">4</span><span className="text-emerald-600 font-bold ml-1">3</span></td>
                    <td className="px-5 py-2"><span className="line-through text-slate-300">3</span><span className="text-emerald-600 font-bold ml-1">13</span></td>
                  </tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">2</td><td className="px-5 py-2 font-bold text-slate-500">7</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                  <tr className="border-t-2 border-slate-400"><td></td><td></td><td className="px-5 py-2 text-indigo-700 font-bold">5</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        label: 'Dizaines : 3 − 7 impossible → échange',
        content: (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>3 − 7</strong> est impossible. On emprunte 1 centaine : 3 → 13<br/>
              La colonne des centaines perd 1 : 5 → 4.
            </div>
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-2"><span className="line-through text-slate-300">5</span><span className="text-emerald-600 font-bold ml-1">4</span></td>
                    <td className="px-5 py-2"><span className="line-through text-slate-300">3</span><span className="text-emerald-600 font-bold ml-1">13</span></td>
                    <td className="px-5 py-2 font-bold">13</td>
                  </tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">2</td><td className="px-5 py-2 font-bold text-slate-500">7</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                  <tr className="border-t-2 border-slate-400"><td></td><td className="px-5 py-2 text-indigo-700 font-bold">6</td><td className="px-5 py-2 text-indigo-700 font-bold">5</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        label: 'Centaines : 4 − 2 = 2 → résultat',
        content: (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-center font-mono text-2xl">
                <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
                <tbody>
                  <tr><td className="px-5 py-2 font-bold">4</td><td className="px-5 py-2 font-bold">13</td><td className="px-5 py-2 font-bold">13</td></tr>
                  <tr><td className="px-5 py-2 font-bold text-slate-500">2</td><td className="px-5 py-2 font-bold text-slate-500">7</td><td className="px-5 py-2 font-bold text-slate-500">8</td></tr>
                  <tr className="border-t-2 border-slate-400"><td className="px-5 py-2 text-indigo-700 font-bold">2</td><td className="px-5 py-2 text-indigo-700 font-bold">6</td><td className="px-5 py-2 text-indigo-700 font-bold">5</td></tr>
                </tbody>
              </table>
            </div>
            <div className="text-center font-bold text-indigo-700 bg-indigo-50 rounded-xl py-3 text-xl">
              543 − 278 = 265 ✓
            </div>
            <div className="text-sm text-slate-500 text-center">Vérification : 265 + 278 = 543 ✓</div>
          </div>
        ),
      },
    ],
  },
];

const PRACTICE = [
  { q: '346 + 287', expected: 633, hint: 'Unités: 6+7=13 → retenue. Dizaines: 4+8+1=13 → retenue.' },
  { q: '501 − 248', expected: 253, hint: 'Échange nécessaire dans les dizaines (0 → emprunte aux centaines).' },
];

/* ─── Module principal (V2 — sur le lesson kit) ────────────────── */
export default function Module06OperationsPosees() {
  const [additionDone, setAdditionDone] = useState(false);
  const [soustractionDone, setSoustractionDone] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const s1 = additionDone;
  const s2 = soustractionDone;
  const s3 = allDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Les opérations posées"
      moduleSubtitle="Tableau de valeur de position, retenues et échanges expliqués pas à pas."
      estimatedTime="10 min"
      brief={{
        tag: '🗂️ Valeur de position',
        title: 'Poser une opération : aligner les rangs pour ne jamais se tromper.',
        body: (
          <ConceptCard label="Le tableau de valeur de position" emoji="🗂️" color="sky">
            <p className="text-sm">
              Chaque chiffre occupe une <strong>position</strong> qui lui donne sa valeur.
              En posant une opération, on s'assure que les chiffres de <em>même rang</em> sont dans la même colonne.
            </p>
            <div className="overflow-x-auto mt-2">
              <div className="flex border rounded-xl overflow-hidden text-center text-xs font-mono font-bold min-w-[400px]">
                {['Milliers', 'Centaines', 'Dizaines', 'Unités', ',', 'Dixièmes', 'Centièmes'].map((h, i) => (
                  <div key={i} className={`flex-1 py-2 px-1 ${h === ',' ? 'bg-slate-200 text-slate-500 max-w-[30px]' : i < 4 ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </ConceptCard>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Addition posée : 247 + 158',
          subtitle: 'Retenue au fil des colonnes, étape par étape.',
          done: s1,
          content: (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <PlaceValueBoard operation={OPERATIONS[0]} onComplete={() => setAdditionDone(true)} done={s1} />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Soustraction posée : 543 − 278',
          subtitle: 'Échange (emprunt) quand un chiffre du haut est trop petit.',
          done: s2,
          content: (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <PlaceValueBoard operation={OPERATIONS[1]} onComplete={() => setSoustractionDone(true)} done={s2} />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Je vérifie mes acquis',
          subtitle: 'Pose et calcule ces deux opérations.',
          done: s3,
          content: (
            <div className="space-y-6">
              {PRACTICE.map((ex, i) =>
                i === 0 || i <= practiceIdx ? (
                  <NumericQuestion
                    key={ex.q}
                    prompt={`${ex.q} = ?`}
                    expected={ex.expected}
                    explain={ex.hint}
                    solved={i < practiceIdx || (i === practiceIdx && allDone)}
                    onAnswered={(ok) => {
                      if (i === practiceIdx) {
                        if (practiceIdx < PRACTICE.length - 1) setPracticeIdx((v) => v + 1);
                        else setAllDone(true);
                      }
                    }}
                  />
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-2xl p-6 text-center space-y-2">
          <div className="text-3xl">🏅</div>
          <div className="text-xl font-space font-bold">Opérations posées maîtrisées !</div>
          <p className="text-sky-100 text-sm">Retenues et échanges n'ont plus de secrets pour toi.</p>
        </motion.div>
      }
    />
  );
}
