import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Ruler from '../components/Ruler';

const PIEGE = { min: 0, max: 15, object: { start: 3, end: 9, label: '✏️', color: '#f97316' } };
const PIEGE_Q = {
  q: 'Un élève regarde seulement où se termine le crayon et annonce : « il mesure 9 cm ». A-t-il raison ?',
  options: [
    'Oui : le crayon se termine à la graduation 9, donc il mesure 9 cm',
    "Non : le crayon ne commence pas à 0, il faut regarder où il commence ET où il se termine",
  ],
  correct: 1,
  explain:
    "Le crayon commence à la graduation 3 et se termine à la graduation 9. Sa longueur, c'est la distance entre les deux bords : 9 − 3 = 6 cm, pas 9 cm.",
};

const ROUNDS = [
  { min: 0, max: 15, object: { start: 3, end: 9, label: '✏️', color: '#f97316' } },
  { min: 0, max: 15, object: { start: 5, end: 13, label: '🖌️', color: '#0ea5e9' } },
  { min: 0, max: 15, object: { start: 2, end: 14, label: '🔑', color: '#8b5cf6' } },
];

function MeasureRound({ round, index, done, onSolved }) {
  const [phase, setPhase] = useState('start'); // 'start' | 'end' | 'done'
  const [startVal, setStartVal] = useState(null);
  const [endVal, setEndVal] = useState(null);
  const [checked, setChecked] = useState(false);

  const trueStart = round.object.start;
  const trueEnd = round.object.end;
  const readCorrect = checked && startVal === trueStart && endVal === trueEnd;

  const handleTick = (v) => {
    if (phase === 'start') {
      setStartVal(v);
      setPhase('end');
    } else if (phase === 'end') {
      setEndVal(v);
      setPhase('done');
    }
  };

  const reset = () => {
    setPhase('start');
    setStartVal(null);
    setEndVal(null);
    setChecked(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
        {phase === 'start' && 'Étape 1 · Tape la graduation où l’objet COMMENCE'}
        {phase === 'end' && 'Étape 2 · Tape la graduation où l’objet SE TERMINE'}
        {phase === 'done' && !checked && 'Vérifie ta lecture'}
      </p>
      <Ruler
        min={round.min}
        max={round.max}
        labelEvery={1}
        object={round.object}
        mode={done ? 'display' : 'read'}
        selectedValues={[startVal, endVal].filter((v) => v !== null)}
        onTickClick={handleTick}
        disabled={phase === 'done' || done}
        ariaLabel={`Règle, mesure ${index + 1}`}
      />
      {startVal !== null && endVal !== null && !checked && (
        <div className="text-center font-mono text-sm text-slate-700">
          Début : <strong>{startVal} cm</strong> · Fin : <strong>{endVal} cm</strong> → longueur ={' '}
          <strong>{endVal - startVal} cm</strong>
        </div>
      )}
      {phase === 'done' && !checked && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (startVal === trueStart && endVal === trueEnd) onSolved?.(); }}>
            Valider ma lecture
          </ValidateButton>
        </div>
      )}
      {checked && !readCorrect && (
        <Feedback tone="hint">
          Ta lecture n’est pas exacte. Regarde bien où le trait pointillé gauche touche la règle (le début), puis où
          le trait pointillé droit la touche (la fin).{' '}
          <button type="button" onClick={reset} className="underline font-semibold">Réessayer</button>
        </Feedback>
      )}
      {checked && readCorrect && (
        <Feedback tone="ok">
          Bien lu : {trueStart} cm → {trueEnd} cm, donc une longueur de <strong>{trueEnd - trueStart} cm</strong>.
        </Feedback>
      )}
    </div>
  );
}

export default function Module02MesurerComparer() {
  const navLinks = getNavLinks(2);
  const [piegePick, setPiegePick] = useState(null);
  const [piegeRevealed, setPiegeRevealed] = useState(false);
  const [round1Done, setRound1Done] = useState(false);
  const [round2Done, setRound2Done] = useState(false);
  const [round3Done, setRound3Done] = useState(false);

  const s1 = piegeRevealed && piegePick === PIEGE_Q.correct;
  const s2 = round1Done && round2Done && round3Done;
  const allDone = s1 && s2;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mesurer et comparer"
      moduleSubtitle="La règle ne commence pas toujours où l’objet commence : attention au piège du zéro."
      moduleNumber={2}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 02" title="Un crayon posé sur une règle graduée.">
          <p>Regarde bien où il commence, pas seulement où il se termine.</p>
        </MissionBrief>

        <StepCard num={1} title="Le piège du zéro" done={s1}>
          <div className="space-y-4">
            <Ruler {...PIEGE} mode="display" ariaLabel="Règle avec un crayon qui ne commence pas à zéro" />
            <p className="text-sm font-semibold text-slate-700">{PIEGE_Q.q}</p>
            <ChoiceGrid options={PIEGE_Q.options} selected={piegePick} onSelect={setPiegePick} revealed={piegeRevealed} correctIndex={PIEGE_Q.correct} cols={1} />
            {!piegeRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setPiegeRevealed(true)} disabled={piegePick === null}>Valider</ValidateButton>
              </div>
            )}
            {piegeRevealed && (
              <Feedback tone={piegePick === PIEGE_Q.correct ? 'ok' : 'ko'}>
                {PIEGE_Q.explain}
                {piegePick !== PIEGE_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setPiegeRevealed(false); setPiegePick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="À toi de mesurer" subtitle="Longueur = position de fin − position de début" done={s2} locked={!s1}>
          <div className="space-y-8">
            <MeasureRound round={ROUNDS[0]} index={0} done={round1Done} onSolved={() => setRound1Done(true)} />
            {round1Done && <MeasureRound round={ROUNDS[1]} index={1} done={round2Done} onSolved={() => setRound2Done(true)} />}
            {round1Done && round2Done && <MeasureRound round={ROUNDS[2]} index={2} done={round3Done} onSolved={() => setRound3Done(true)} />}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Retiens ce réflexe : sur une règle, une longueur se lit toujours comme une DIFFÉRENCE entre deux
              positions, pas comme un seul nombre.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
