import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, parseDec, formatCapacity, roundTo } from '../components/capacityUtils';
import { isStepLocked } from '../../../../../common/utils/stepUnlock';

function WorkedExample({ done, onSolved }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Avant de t’entraîner, regarde d’où vient chaque chiffre.</p>
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2 text-center">
        <div className="font-mono text-lg font-bold text-slate-800">1,5 L = ? cL</div>
        <div className="text-sm text-slate-600 space-y-1">
          <div>1 L = 100 cL</div>
          <div>0,5 L = 50 cL</div>
          <div className="font-bold text-slate-800">1 L + 0,5 L = 100 cL + 50 cL = <span className="text-blue-700">150 cL</span></div>
        </div>
      </div>
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => onSolved?.()}>J’ai compris, continuer</ValidateButton>
        </div>
      )}
    </div>
  );
}

const ROUNDS = [
  { id: 'r1', value: 2, from: 'L', to: 'cL', grow: true },
  { id: 'r2', value: 750, from: 'mL', to: 'L', grow: false },
  { id: 'r3', value: 1.5, from: 'L', to: 'mL', grow: true },
  { id: 'r4', value: 320, from: 'cL', to: 'L', grow: false },
];

const DIRECTION_OPTIONS = ['Le nombre va devenir PLUS GRAND', 'Le nombre va devenir PLUS PETIT'];

function ConversionRound({ round, done, onSolved }) {
  const [dirPick, setDirPick] = useState(null);
  const [dirChecked, setDirChecked] = useState(false);
  const dirOk = dirChecked && ((dirPick === 0) === round.grow);

  const [val, setVal] = useState('');
  const [valChecked, setValChecked] = useState(false);
  const expected = convert(round.value, round.from, round.to);
  const parsed = parseDec(val);
  const valOk = valChecked && !Number.isNaN(parsed) && Math.abs(roundTo(parsed, 4) - roundTo(expected, 4)) < 1e-6;

  const smaller = round.grow ? round.to : round.from;
  const bigger = round.grow ? round.from : round.to;

  return (
    <div className="space-y-4">
      <div className="text-center font-mono text-lg font-bold text-slate-800">
        {formatCapacity(round.value, round.from)} = ? {round.to}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Le {smaller} est plus petit que le {bigger}. Avant de calculer : le nombre va-t-il changer comment ?
        </p>
        <ChoiceGrid
          options={DIRECTION_OPTIONS}
          selected={dirPick}
          onSelect={(i) => { setDirPick(i); setDirChecked(true); }}
          revealed={dirChecked}
          correctIndex={round.grow ? 0 : 1}
          cols={1}
          disabled={done}
        />
        {dirChecked && (
          <Feedback tone={dirOk ? 'ok' : 'ko'}>
            {!dirOk && (
              <>
                Bonne réponse : <strong>{DIRECTION_OPTIONS[round.grow ? 0 : 1].toLowerCase()}</strong>. {' '}
              </>
            )}
            On exprime la même contenance avec une unité {round.grow ? 'plus petite' : 'plus grande'} : il en faut
            donc {round.grow ? 'davantage' : 'moins'}, le nombre {round.grow ? 'augmente' : 'diminue'}.
          </Feedback>
        )}
      </div>

      {(dirChecked || done) && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Calcule maintenant la valeur exacte, en {round.to}.</p>
          <div className="flex items-center justify-center gap-2">
            <NumberField
              value={val}
              onChange={(v) => { setValChecked(false); setVal(v); }}
              onEnter={() => { if (val !== '') { setValChecked(true); onSolved?.(); } }}
              ariaLabel={`Résultat en ${round.to}`}
              width="w-32"
            />
            <span className="font-mono text-sm text-slate-500">{round.to}</span>
          </div>
          {!done && (
            <div className="text-center">
              <ValidateButton onClick={() => { setValChecked(true); onSolved?.(); }} disabled={val === ''}>
                Valider
              </ValidateButton>
            </div>
          )}
          {valChecked && (
            <Feedback tone={valOk ? 'ok' : 'ko'}>
              {!valOk && <>La bonne réponse : </>}
              {formatCapacity(round.value, round.from)} = <strong>{formatCapacity(expected, round.to)}</strong>
              {!valOk && <> — l'échelle entre {round.from} et {round.to} s'applique à tout le nombre.</>}
            </Feedback>
          )}
          {!valChecked && done && (
            <Feedback tone="ok">{formatCapacity(round.value, round.from)} = <strong>{formatCapacity(expected, round.to)}</strong></Feedback>
          )}
        </div>
      )}
    </div>
  );
}

const DETECTIVE_ITEMS = [
  {
    q: 'Un élève écrit : « 2 L = 20 mL ». Où est l’erreur ?',
    options: ['Il n’y a pas d’erreur, 2 L = 20 mL', 'Il s’est trompé d’échelle : 1 L = 1000 mL, donc 2 L = 2000 mL'],
    correct: 1,
    explain: '1 L contient 1000 mL (pas 10). Donc 2 L = 2 × 1000 = 2000 mL, et non 20 mL.',
  },
  {
    q: 'Un élève écrit : « 3,2 L = 320 cL ». A-t-il raison ?',
    options: ['Oui : 1 L = 100 cL, donc 3,2 L = 320 cL', 'Non, il a dû se tromper quelque part'],
    correct: 0,
    explain: 'C’est correct ! 1 L = 100 cL, donc 3,2 × 100 = 320 cL. Toutes les affirmations à vérifier ne sont pas fausses.',
  },
];

function DetectiveMCQ({ item, done, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">{item.q}</p>
      <ChoiceGrid options={item.options} selected={pick} onSelect={(i) => { setPick(i); setRevealed(true); onSolved?.(); }} revealed={revealed} correctIndex={item.correct} cols={1} disabled={done} />
      {revealed && (
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {pick !== item.correct && (
            <>
              Bonne réponse : <strong>{item.options[item.correct]}</strong>. {' '}
            </>
          )}
          {item.explain}
        </Feedback>
      )}
    </div>
  );
}

export default function Module05Conversions() {
  const navLinks = getNavLinks(5);
  const { isModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const alreadyCompleted = isModuleCompleted('5');

  const [exampleDone, setExampleDone] = useState(false);
  const [done, setDone] = useState({});
  const allRoundsDone = ROUNDS.every((r) => done[r.id]);

  const [det1Done, setDet1Done] = useState(false);
  const [det2Done, setDet2Done] = useState(false);
  const allDone = alreadyCompleted || (exampleDone && allRoundsDone && det1Done && det2Done);

  const incompleteSteps = [
    !exampleDone && { num: 1, title: 'D’où vient le chiffre ?' },
    !allRoundsDone && { num: 2, title: 'Quatre conversions, une seule logique' },
    !(det1Done && det2Done) && { num: 3, title: 'Détective des erreurs' },
  ].filter(Boolean);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Convertir les contenances"
      moduleSubtitle="Passer d’une unité à l’autre en comprenant pourquoi le nombre change."
      moduleNumber={5}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
      incompleteSteps={incompleteSteps}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 05" title="Convertir, ce n'est pas « déplacer la virgule au hasard ».">
          <p>Avant de calculer, demande-toi toujours : cette nouvelle unité est-elle plus grande ou plus petite ?</p>
        </MissionBrief>

        <StepCard num={1} title="D’où vient le chiffre ?" done={exampleDone}>
          <WorkedExample done={exampleDone} onSolved={() => setExampleDone(true)} />
        </StepCard>

        <StepCard num={2} title="Quatre conversions, une seule logique" done={allRoundsDone} locked={isStepLocked(alreadyCompleted, !exampleDone)}>
          <div className="space-y-8">
            {ROUNDS.map((r, i) => (
              (i === 0 || done[ROUNDS[i - 1].id]) && (
                <ConversionRound key={r.id} round={r} done={!!done[r.id]} onSolved={() => setDone((d) => ({ ...d, [r.id]: true }))} />
              )
            ))}
          </div>
        </StepCard>

        <StepCard num={3} title="Détective des erreurs" done={det1Done && det2Done} locked={isStepLocked(alreadyCompleted, !allRoundsDone)}>
          <div className="space-y-6">
            <DetectiveMCQ item={DETECTIVE_ITEMS[0]} done={det1Done} onSolved={() => setDet1Done(true)} />
            {det1Done && <DetectiveMCQ item={DETECTIVE_ITEMS[1]} done={det2Done} onSolved={() => setDet2Done(true)} />}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <ArrowLeftRight className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Avant de « déplacer la virgule », demande-toi toujours pourquoi elle bouge : c'est ce raisonnement qui
              évite les erreurs.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
