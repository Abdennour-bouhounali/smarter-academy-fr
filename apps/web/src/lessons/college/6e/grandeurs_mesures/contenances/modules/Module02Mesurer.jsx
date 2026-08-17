import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LiquidContainer from '../components/LiquidContainer';
import { formatDec } from '../components/capacityUtils';

const MAX_L = 2;
const GRADS = [0.5, 1, 1.5, 2].map((v) => ({ pct: v / MAX_L, label: `${formatDec(v)} L` }));

function LitreReference({ solved, onSolved }) {
  const [value, setValue] = useState(0);
  const [touched, setTouched] = useState(false);
  const atTarget = value === 1;

  const bump = (delta) => {
    setTouched(true);
    setValue((v) => Math.max(0, Math.min(MAX_L, Math.round((v + delta) * 2) / 2)));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voici un repère à connaître : <strong>1 litre (1 L)</strong>. Utilise les boutons pour faire monter ou
        descendre le niveau, et observe où se trouve 1 L.
      </p>
      <div className="flex justify-center">
        <LiquidContainer shape="glass" fillPct={value / MAX_L} graduations={GRADS} color="#0ea5e9" ariaLabel="Verre gradué de référence" />
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => bump(-0.5)}
          disabled={value <= 0}
          className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 font-bold text-lg disabled:opacity-30 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Diminuer de 0,5 L"
        >
          −
        </button>
        <div className="font-mono text-2xl font-extrabold text-slate-800 tabular-nums w-20 text-center">{formatDec(value)} L</div>
        <button
          type="button"
          onClick={() => bump(0.5)}
          disabled={value >= MAX_L}
          className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 font-bold text-lg disabled:opacity-30 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Augmenter de 0,5 L"
        >
          +
        </button>
      </div>
      {!solved && touched && !atTarget && (
        <Feedback tone="hint">
          Tu es à {formatDec(value)} L. Le repère à retrouver est <strong>1 L</strong>.
          {value > 1 ? ' Redescends vers 1 L.' : ' Fais encore monter le niveau.'}
        </Feedback>
      )}
      {!solved && atTarget && (
        <div className="text-center space-y-3">
          <Feedback tone="ok">✓ Exactement 1 L !</Feedback>
          <ValidateButton onClick={() => onSolved?.()}>J’ai repéré 1 L</ValidateButton>
        </div>
      )}
      {solved && <Feedback tone="ok">1 L, c’est le repère : une bouteille d’eau classique en contient à peu près autant.</Feedback>}
    </div>
  );
}

const READ_ROUNDS = [
  { value: 1, options: ['0,5 L', '1 L', '1,5 L'], correct: 1 },
  { value: 1.5, options: ['1 L', '1,5 L', '2 L'], correct: 1 },
  { value: 0.5, options: ['0,5 L', '1 L', '1,5 L'], correct: 0 },
];

function ReadRound({ round, done, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = checked && pick === round.correct;
  const unlabeledGrads = GRADS.map((g) => ({ pct: g.pct, label: null }));

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <LiquidContainer shape="glass" fillPct={round.value / MAX_L} graduations={unlabeledGrads} color="#0ea5e9" ariaLabel="Verre gradué, niveau à lire" height={190} />
      </div>
      <p className="text-sm font-semibold text-slate-700 text-center">Combien ce verre contient-il ?</p>
      <ChoiceGrid options={round.options} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={round.correct} cols={3} disabled={done} />
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === round.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {checked && !isRight && <Feedback tone="hint">Compte les graduations depuis le bas : chacune vaut 0,5 L.</Feedback>}
      {(isRight || done) && checked && <Feedback tone="ok">C’est bien {round.options[round.correct]}.</Feedback>}
    </div>
  );
}

export default function Module02Mesurer() {
  const navLinks = getNavLinks(2);
  const [refDone, setRefDone] = useState(false);
  const [readDone, setReadDone] = useState({});
  const allReadDone = READ_ROUNDS.every((_, i) => readDone[i]);
  const allDone = refDone && allReadDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mesurer une contenance"
      moduleSubtitle="Le litre comme repère : remplir, lire, comparer."
      moduleNumber={2}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 02" title="Pour mesurer une contenance, il faut un repère.">
          <p>Ce repère, c’est le litre. Découvre-le en le manipulant.</p>
        </MissionBrief>

        <StepCard num={1} title="1 litre, un repère à connaître" done={refDone}>
          <LitreReference solved={refDone} onSolved={() => setRefDone(true)} />
        </StepCard>

        <StepCard num={2} title="Lis le niveau" done={allReadDone} locked={!refDone}>
          <div className="space-y-8">
            {READ_ROUNDS.map((r, i) => (
              (i === 0 || readDone[i - 1]) && (
                <div key={i} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <ReadRound round={r} done={!!readDone[i]} onSolved={() => setReadDone((d) => ({ ...d, [i]: true }))} />
                </div>
              )
            ))}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Ruler className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Le litre n’est qu’un premier repère. D’autres unités existent pour les quantités plus petites ou plus
              grandes.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
