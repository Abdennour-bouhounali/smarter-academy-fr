import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, parseDec, formatMass, roundTo } from '../components/massUtils';

const ROUNDS = [
  { id: 'r1', value: 3, from: 'kg', to: 'g', grow: true },
  { id: 'r2', value: 2500, from: 'g', to: 'kg', grow: false },
  { id: 'r3', value: 4, from: 'g', to: 'mg', grow: true },
  { id: 'r4', value: 4200, from: 'g', to: 'kg', grow: false },
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
        {formatMass(round.value, round.from)} = ? {round.to}
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
            On exprime la même masse avec une unité {round.grow ? 'plus petite' : 'plus grande'} : il en faut donc{' '}
            {round.grow ? 'davantage' : 'moins'}, le nombre {round.grow ? 'augmente' : 'diminue'}.
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
              Pense à l'échelle entre {round.from} et {round.to} (×1000) et applique-la à {formatMass(round.value, round.from)}.
            </Feedback>
          )}
          {(valOk || done) && (
            <Feedback tone="ok">{formatMass(round.value, round.from)} = <strong>{formatMass(expected, round.to)}</strong></Feedback>
          )}
        </div>
      )}
    </div>
  );
}

const DETECTIVE_ITEMS = [
  {
    q: 'Un élève écrit : « 2 kg = 200 g ». Où est l’erreur ?',
    options: ['Il n’y a pas d’erreur, 2 kg = 200 g', 'Il a multiplié par 100 au lieu de 1000 : 1 kg = 1000 g, donc 2 kg = 2000 g'],
    correct: 1,
    explain: '1 kg contient 1000 g (pas 100). Donc 2 kg = 2 × 1000 = 2000 g, et non 200 g.',
  },
  {
    q: 'Une valise a une masse de « 18 g » d’après l’étiquette d’un élève. Que penses-tu de cette mesure ?',
    options: ['C’est plausible, le nombre 18 est correct', 'Le nombre semble correct pour une valise, mais l’unité ne convient pas : il voulait sûrement écrire 18 kg'],
    correct: 1,
    explain: 'Une valise de 18 g serait plus légère qu’une pièce de monnaie. Le nombre 18 est raisonnable pour une valise, mais seulement en kg : nombre ET unité doivent être cohérents ensemble.',
  },
];

function DetectiveMCQ({ item, done, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">{item.q}</p>
      <ChoiceGrid options={item.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={item.correct} cols={1} disabled={done} />
      {!done && !revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === item.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {item.explain}
          {pick !== item.correct && (
            <>
              {' '}
              <button type="button" onClick={() => { setRevealed(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module05Conversions() {
  const navLinks = getNavLinks(5);
  const [done, setDone] = useState({});
  const allRoundsDone = ROUNDS.every((r) => done[r.id]);

  const [det1Done, setDet1Done] = useState(false);
  const [det2Done, setDet2Done] = useState(false);
  const allDone = allRoundsDone && det1Done && det2Done;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Convertir les masses"
      moduleSubtitle="Passer d’une unité à l’autre en comprenant pourquoi le nombre change."
      moduleNumber={5}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 05" title="Convertir, ce n'est pas « déplacer la virgule au hasard ».">
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

        <StepCard num={2} title="Détective des erreurs" done={det1Done && det2Done} locked={!allRoundsDone}>
          <div className="space-y-6">
            <DetectiveMCQ item={DETECTIVE_ITEMS[0]} done={det1Done} onSolved={() => setDet1Done(true)} />
            {det1Done && <DetectiveMCQ item={DETECTIVE_ITEMS[1]} done={det2Done} onSolved={() => setDet2Done(true)} />}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <ArrowLeftRight className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Un nombre seul ne dit rien : c’est toujours NOMBRE + UNITÉ qui forme une mesure correcte.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
