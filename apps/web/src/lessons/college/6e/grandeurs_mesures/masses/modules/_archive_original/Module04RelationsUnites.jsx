import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GroupBuilder from '../../../../../common/components/GroupBuilder';

function BuildRound({ perGroup, target, unit, targetLabel, tone, done, onSolved }) {
  const [groups, setGroups] = useState(0);
  const reached = groups * perGroup === target;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Empile des blocs de {perGroup}{unit} jusqu’à obtenir exactement {targetLabel}.
      </p>
      <GroupBuilder perGroup={perGroup} groups={done ? target / perGroup : groups} onChange={setGroups} max={target / perGroup} tone={tone} unit={unit} disabled={done} />
      {(reached || done) && (
        <Feedback tone="ok">
          {target / perGroup} × {perGroup}{unit} = <strong>{target}{unit} = {targetLabel}</strong>.
        </Feedback>
      )}
      {reached && !done && (
        <div className="text-center">
          <ValidateButton onClick={() => onSolved?.()}>C’est exact, continuer</ValidateButton>
        </div>
      )}
    </div>
  );
}

const LADDER = [
  { id: 'mg-g', from: 'mg', to: 'g', correct: 1000, options: [10, 100, 1000] },
  { id: 'g-kg', from: 'g', to: 'kg', correct: 1000, options: [10, 100, 1000] },
  { id: 'kg-t', from: 'kg', to: 't', correct: 1000, options: [10, 100, 1000] },
];

function UnitLadder({ solved, onSolved }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
  const allPicked = LADDER.every((s) => picks[s.id] !== undefined);
  const nCorrect = LADDER.filter((s) => picks[s.id] === s.correct).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Combien faut-il de la petite unité pour former la grande ?</p>
      <div className="space-y-3">
        {LADDER.map((s) => {
          const pick = picks[s.id];
          const isRight = checked && pick === s.correct;
          const isWrong = checked && pick !== undefined && pick !== s.correct;
          return (
            <div key={s.id} className={`rounded-2xl border-2 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 ${isRight ? 'border-emerald-300 bg-emerald-50/50' : isWrong ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
              <div className="font-mono text-sm font-bold text-slate-700 sm:w-32 shrink-0">1 {s.to} = … {s.from}</div>
              <div className="flex gap-1.5" role="group" aria-label={`Combien de ${s.from} dans 1 ${s.to}`}>
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
          <ValidateButton onClick={() => { setChecked(true); if (nCorrect === LADDER.length) onSolved?.(); }} disabled={!allPicked}>Vérifier</ValidateButton>
        </div>
      )}
      {checked && nCorrect < LADDER.length && (
        <Feedback tone="hint">{nCorrect} / {LADDER.length} corrects. Comme pour les longueurs, mg → g → kg → t avance toujours par ×1000.</Feedback>
      )}
      {(solved || nCorrect === LADDER.length) && checked && (
        <Feedback tone="ok">1 g = 1000 mg, 1 kg = 1000 g, 1 t = 1000 kg : toujours le même saut, ×1000.</Feedback>
      )}
    </div>
  );
}

export default function Module04RelationsUnites() {
  const navLinks = getNavLinks(4);
  const [gDone, setGDone] = useState(false);
  const [mgDone, setMgDone] = useState(false);
  const [ladderDone, setLadderDone] = useState(false);
  const allDone = gDone && mgDone && ladderDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Construire les relations"
      moduleSubtitle="Empiler des blocs de 100 g jusqu’à former 1 kg."
      moduleNumber={4}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 04" title="Construis toi-même les grandes unités.">
          <p>Plutôt que d’apprendre un tableau par cœur, assemble les petites unités pour voir apparaître les grandes.</p>
        </MissionBrief>

        <StepCard num={1} title="100 g × 10 = 1 kg" done={gDone}>
          <BuildRound perGroup={100} target={1000} unit=" g" targetLabel="1 kg" tone="violet" done={gDone} onSolved={() => setGDone(true)} />
        </StepCard>

        <StepCard num={2} title="100 mg × 10 = 1 g" done={mgDone} locked={!gDone}>
          <BuildRound perGroup={100} target={1000} unit=" mg" targetLabel="1 g" tone="sky" done={mgDone} onSolved={() => setMgDone(true)} />
        </StepCard>

        <StepCard num={3} title="Et pour la tonne ?" done={ladderDone} locked={!mgDone}>
          <UnitLadder solved={ladderDone} onSolved={() => setLadderDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Boxes className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Une masse ne change jamais quand on change d’unité — seule son écriture change. C’est cette idée qui
              va te permettre de convertir sans te tromper.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
