import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Ruler from '../components/Ruler';

const READ_Q = {
  q: 'Sur cette règle, la graduation 3 (en cm) tombe exactement au-dessus de quelle graduation, en mm ?',
  options: ['13 mm', '30 mm', '3 mm'],
  correctLabel: '30 mm',
  explain:
    "3 cm et 30 mm marquent exactement le même point sur la règle : c'est la même longueur physique, écrite avec deux unités différentes.",
};

const LADDER = [
  { id: 'km-m', from: 'km', to: 'm', correct: 1000, options: [10, 100, 1000] },
  { id: 'm-cm', from: 'm', to: 'cm', correct: 100, options: [10, 100, 1000] },
  { id: 'cm-mm', from: 'cm', to: 'mm', correct: 10, options: [10, 100, 1000] },
];

function ReadDualScale({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = checked && READ_Q.options[pick] === READ_Q.correctLabel;

  return (
    <div className="space-y-4">
      <Ruler
        min={0}
        max={10}
        labelEvery={1}
        height={190}
        secondary={{ scale: 10, step: 10, labelEvery: 1, unit: 'mm' }}
        mode="display"
        ariaLabel="Règle graduée en centimètres avec une deuxième rangée en millimètres"
      />
      <p className="text-sm font-semibold text-slate-700">{READ_Q.q}</p>
      <ChoiceGrid
        options={READ_Q.options}
        selected={pick}
        onSelect={(i) => { setChecked(false); setPick(i); }}
        revealed={checked}
        correctIndex={READ_Q.options.indexOf(READ_Q.correctLabel)}
        cols={3}
        disabled={solved}
      />
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (READ_Q.options[pick] === READ_Q.correctLabel) onSolved?.(); }} disabled={pick === null}>
            Valider
          </ValidateButton>
        </div>
      )}
      {checked && !isRight && (
        <Feedback tone="hint">Regarde bien la graduation « 3 » de la rangée du haut (cm) : suis la ligne verticale jusqu'à la rangée du bas (mm).{' '}
          <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
        </Feedback>
      )}
      {(solved || isRight) && <Feedback tone="ok">{READ_Q.explain}</Feedback>}
    </div>
  );
}

function UnitLadder({ solved, onSolved }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
  const allPicked = LADDER.every((s) => picks[s.id] !== undefined);
  const nCorrect = LADDER.filter((s) => picks[s.id] === s.correct).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Combien faut-il de la petite unité pour former la grande ? (Aide-toi de la règle ci-dessus pour cm → mm.)
      </p>
      <div className="space-y-3">
        {LADDER.map((s) => {
          const pick = picks[s.id];
          const isRight = checked && pick === s.correct;
          const isWrong = checked && pick !== undefined && pick !== s.correct;
          return (
            <div key={s.id} className={`rounded-2xl border-2 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 ${isRight ? 'border-emerald-300 bg-emerald-50/50' : isWrong ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
              <div className="font-mono text-sm font-bold text-slate-700 sm:w-40 shrink-0">
                1 {s.from} = … {s.to}
              </div>
              <div className="flex gap-1.5" role="group" aria-label={`Combien de ${s.to} dans 1 ${s.from}`}>
                {s.options.map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={solved}
                    onClick={() => { setChecked(false); setPicks((p) => ({ ...p, [s.id]: v })); }}
                    aria-pressed={pick === v}
                    className={`px-3.5 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      pick === v
                        ? checked
                          ? v === s.correct ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-rose-600 border-rose-700 text-white'
                          : 'bg-blue-600 border-blue-700 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (nCorrect === LADDER.length) onSolved?.(); }} disabled={!allPicked}>
            Vérifier
          </ValidateButton>
        </div>
      )}
      {checked && nCorrect < LADDER.length && (
        <Feedback tone="hint">{nCorrect} / {LADDER.length} corrects. Chaque unité est 10 fois plus petite que la précédente : km → m → cm → mm, toujours ×10.{' '}
          <button type="button" onClick={() => { setChecked(false); setPicks({}); }} className="underline font-semibold">Réessayer</button>
        </Feedback>
      )}
      {(solved || nCorrect === LADDER.length) && checked && (
        <Feedback tone="ok">1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm : chaque unité s'emboîte dans la suivante.</Feedback>
      )}
    </div>
  );
}

export default function Module03ConstruireUnites() {
  const navLinks = getNavLinks(3);
  const [readDone, setReadDone] = useState(false);
  const [ladderDone, setLadderDone] = useState(false);
  const allDone = readDone && ladderDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Construire les unités"
      moduleSubtitle="Km, m, cm, mm : une même longueur, plusieurs façons de l’écrire."
      moduleNumber={3}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 03" title="Une seule longueur, deux règles superposées.">
          <p>La rangée du haut est graduée en cm, celle du bas en mm — sur le même segment.</p>
        </MissionBrief>

        <StepCard num={1} title="Deux graduations, une seule longueur" done={readDone}>
          <ReadDualScale solved={readDone} onSolved={() => setReadDone(true)} />
        </StepCard>

        <StepCard num={2} title="Emboîter les unités" done={ladderDone} locked={!readDone}>
          <UnitLadder solved={ladderDone} onSolved={() => setLadderDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Layers className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Une longueur ne change jamais quand on change d'unité — seule son écriture change. C'est cette idée qui
              va te permettre de convertir sans te tromper.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
