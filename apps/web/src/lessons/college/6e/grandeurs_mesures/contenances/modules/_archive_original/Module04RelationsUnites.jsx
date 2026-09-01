import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GroupBuilder from '../../../../../common/components/GroupBuilder';
import { isStepLocked } from '../../../../../common/utils/stepUnlock';

function BuildRound({ perGroup, target, unit, targetLabel, tone, done, onSolved }) {
  const [groups, setGroups] = useState(0);
  const reached = groups * perGroup === target;

  // Objectif atteint → étape validée automatiquement, sans clic de confirmation.
  useEffect(() => {
    if (reached && !done) onSolved?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reached, done]);

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
    </div>
  );
}

const LADDER = [
  { id: 'mL-cL', from: 'mL', to: 'cL', correct: 10, options: [10, 100, 1000] },
  { id: 'cL-dL', from: 'cL', to: 'dL', correct: 10, options: [10, 100, 1000] },
  { id: 'dL-L', from: 'dL', to: 'L', correct: 10, options: [10, 100, 1000] },
];

function UnitLadder({ solved, onSolved }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
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
                    onClick={() => {
                      if (solved || checked) return;
                      const next = { ...picks, [s.id]: v };
                      setPicks(next);
                      // Dernier choix posé → correction immédiate, sans bouton
                      if (LADDER.every((l) => next[l.id] !== undefined)) { setChecked(true); onSolved?.(); }
                    }}
                    aria-pressed={pick === v}
                    className={`px-3.5 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      checked
                        ? v === s.correct
                          ? 'bg-emerald-600 border-emerald-700 text-white'
                          : pick === v
                          ? 'bg-rose-600 border-rose-700 text-white'
                          : 'bg-white border-slate-200 text-slate-400'
                        : pick === v
                        ? 'bg-blue-600 border-blue-700 text-white'
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
      {checked && (
        <Feedback tone={nCorrect === LADDER.length ? 'ok' : 'ko'}>
          {nCorrect < LADDER.length && (
            <>
              {nCorrect} / {LADDER.length} corrects — les bonnes réponses sont en vert : chaque marche vaut ×10. {' '}
            </>
          )}
          1 cL = 10 mL, 1 dL = 10 cL, 1 L = 10 dL : et donc 1 L = 100 cL = 1000 mL.
        </Feedback>
      )}
    </div>
  );
}

export default function Module04RelationsUnites() {
  const navLinks = getNavLinks(4);
  const { isModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const alreadyCompleted = isModuleCompleted('4');

  const [lDone, setLDone] = useState(false);
  const [dlDone, setDlDone] = useState(false);
  const [clDone, setClDone] = useState(false);
  const [ladderDone, setLadderDone] = useState(false);
  const allDone = alreadyCompleted || (lDone && dlDone && clDone && ladderDone);

  const incompleteSteps = [
    !lDone && { num: 1, title: '10 dL × 1 = 1 L' },
    !dlDone && { num: 2, title: '10 cL = 1 dL' },
    !clDone && { num: 3, title: '10 mL = 1 cL' },
    !ladderDone && { num: 4, title: 'Toute la chaîne' },
  ].filter(Boolean);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Construire les relations"
      moduleSubtitle="Partager 1 L en 10 dL, en 100 cL, en 1000 mL."
      moduleNumber={4}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
      incompleteSteps={incompleteSteps}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 04" title="Construis toi-même les unités, une par une.">
          <p>Plutôt que d’apprendre un tableau par cœur, assemble les petites unités pour voir apparaître les grandes.</p>
        </MissionBrief>

        <StepCard num={1} title="10 dL × 1 = 1 L" done={lDone}>
          <BuildRound perGroup={1} target={10} unit=" dL" targetLabel="1 L" tone="violet" done={lDone} onSolved={() => setLDone(true)} />
        </StepCard>

        <StepCard num={2} title="10 cL = 1 dL" done={dlDone} locked={isStepLocked(alreadyCompleted, !lDone)}>
          <BuildRound perGroup={1} target={10} unit=" cL" targetLabel="1 dL" tone="sky" done={dlDone} onSolved={() => setDlDone(true)} />
        </StepCard>

        <StepCard num={3} title="10 mL = 1 cL" done={clDone} locked={isStepLocked(alreadyCompleted, !dlDone)}>
          <BuildRound perGroup={1} target={10} unit=" mL" targetLabel="1 cL" tone="amber" done={clDone} onSolved={() => setClDone(true)} />
        </StepCard>

        <StepCard num={4} title="Toute la chaîne" done={ladderDone} locked={isStepLocked(alreadyCompleted, !clDone)}>
          <UnitLadder solved={ladderDone} onSolved={() => setLadderDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Boxes className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              1 L = 10 dL = 100 cL = 1 000 mL : une seule contenance, plusieurs écritures. C’est cette idée qui va te
              permettre de convertir sans te tromper.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
