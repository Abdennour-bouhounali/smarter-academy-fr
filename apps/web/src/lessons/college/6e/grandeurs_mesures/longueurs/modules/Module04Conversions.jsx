import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, parseDec, formatLength, roundTo } from '../components/lengthUtils';

const ROUNDS = [
  { id: 'r1', value: 2, from: 'm', to: 'cm', grow: true },
  { id: 'r2', value: 350, from: 'cm', to: 'm', grow: false },
  { id: 'r3', value: 1.2, from: 'km', to: 'm', grow: true },
  { id: 'r4', value: 45, from: 'mm', to: 'cm', grow: false },
];

const DIRECTION_OPTIONS = [
  'Le nombre va devenir PLUS GRAND',
  'Le nombre va devenir PLUS PETIT',
];

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
        {formatLength(round.value, round.from)} = ? {round.to}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Le {smaller} est plus petit que le {bigger}. Avant de calculer : le nombre va-t-il changer comment ?
        </p>
        <ChoiceGrid
          options={DIRECTION_OPTIONS}
          selected={dirPick}
          onSelect={(i) => { setDirChecked(false); setDirPick(i); }}
          revealed={dirChecked}
          correctIndex={round.grow ? 0 : 1}
          cols={1}
          disabled={done}
        />
        {!done && !dirOk && (
          <div className="text-center">
            <ValidateButton onClick={() => setDirChecked(true)} disabled={dirPick === null}>Valider</ValidateButton>
          </div>
        )}
        {dirChecked && !dirOk && (
          <Feedback tone="hint">
            On mesure la même longueur avec une unité {round.grow ? 'plus petite' : 'plus grande'} : il en faut donc{' '}
            {round.grow ? 'davantage' : 'moins'}, le nombre {round.grow ? 'augmente' : 'diminue'}.{' '}
            <button type="button" onClick={() => { setDirChecked(false); setDirPick(null); }} className="underline font-semibold">Réessayer</button>
          </Feedback>
        )}
      </div>

      {(dirOk || done) && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Calcule maintenant la valeur exacte, en {round.to}.</p>
          <div className="flex items-center justify-center gap-2">
            <NumberField value={val} onChange={(v) => { setValChecked(false); setVal(v); }} ariaLabel={`Résultat en ${round.to}`} width="w-32" />
            <span className="font-mono text-sm text-slate-500">{round.to}</span>
          </div>
          {!done && (
            <div className="text-center">
              <ValidateButton onClick={() => { setValChecked(true); if (!Number.isNaN(parseDec(val)) && Math.abs(roundTo(parseDec(val), 4) - roundTo(expected, 4)) < 1e-6) onSolved?.(); }} disabled={val === ''}>
                Valider
              </ValidateButton>
            </div>
          )}
          {valChecked && !valOk && (
            <Feedback tone="hint">
              Pense à l'échelle entre {round.from} et {round.to} (×10, ×100 ou ×1000 selon les unités) et applique-la à {formatLength(round.value, round.from)}.{' '}
              <button type="button" onClick={() => { setValChecked(false); setVal(''); }} className="underline font-semibold">Réessayer</button>
            </Feedback>
          )}
          {(valOk || done) && (
            <Feedback tone="ok">{formatLength(round.value, round.from)} = <strong>{formatLength(expected, round.to)}</strong></Feedback>
          )}
        </div>
      )}
    </div>
  );
}

const DETECTIVE_Q = {
  q: 'Un élève écrit : « 3 m = 30 cm ». Où est l’erreur ?',
  options: [
    "Il n'y a pas d'erreur, 3 m = 30 cm",
    'Il a multiplié par 10 au lieu de 100 : 1 m = 100 cm, donc 3 m = 300 cm',
  ],
  correct: 1,
  explain: '1 m contient 100 cm (pas 10). Donc 3 m = 3 × 100 = 300 cm, et non 30 cm.',
};

export default function Module04Conversions() {
  const navLinks = getNavLinks(4);
  const [done, setDone] = useState({});
  const allRoundsDone = ROUNDS.every((r) => done[r.id]);

  const [detPick, setDetPick] = useState(null);
  const [detRevealed, setDetRevealed] = useState(false);
  const detOk = detRevealed && detPick === DETECTIVE_Q.correct;

  const allDone = allRoundsDone && detOk;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Convertir"
      moduleSubtitle="Passer d’une unité à l’autre en comprenant pourquoi le nombre change."
      moduleNumber={4}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 04" title="Convertir, ce n'est pas « déplacer la virgule au hasard ».">
          <p>Avant de calculer, demande-toi toujours : cette nouvelle unité est-elle plus grande ou plus petite ?</p>
        </MissionBrief>

        <StepCard num={1} title="Quatre conversions, une seule logique" done={allRoundsDone}>
          <div className="space-y-8">
            {ROUNDS.map((r, i) => (
              (i === 0 || done[ROUNDS[i - 1].id]) && (
                <ConversionRound key={r.id} round={r} done={!!done[r.id]} onSolved={() => setDone((d) => ({ ...d, [r.id]: true }))} />
              )
            ))}
          </div>
        </StepCard>

        <StepCard num={2} title="Détective des erreurs" done={detOk} locked={!allRoundsDone}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{DETECTIVE_Q.q}</p>
            <ChoiceGrid options={DETECTIVE_Q.options} selected={detPick} onSelect={setDetPick} revealed={detRevealed} correctIndex={DETECTIVE_Q.correct} cols={1} />
            {!detRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setDetRevealed(true)} disabled={detPick === null}>Valider</ValidateButton>
              </div>
            )}
            {detRevealed && (
              <Feedback tone={detPick === DETECTIVE_Q.correct ? 'ok' : 'ko'}>
                {DETECTIVE_Q.explain}
                {detPick !== DETECTIVE_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setDetRevealed(false); setDetPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <ArrowLeftRight className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
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
