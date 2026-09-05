import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const SCALE = [
  { unit: 'mg', emoji: '💊', label: 'Un comprimé', hint: 'masses très petites' },
  { unit: 'g', emoji: '🪙', label: 'Une pièce de monnaie', hint: 'objets du quotidien' },
  { unit: 'kg', emoji: '🎒', label: 'Un sac à dos', hint: 'objets plus lourds' },
  { unit: 't', emoji: '🚚', label: 'Un camion', hint: 'masses très grandes' },
];

const INTRO_Q = {
  q: 'Un comprimé de médicament est extrêmement léger. Quelle unité te semble la plus adaptée pour exprimer sa masse ?',
  options: ['kg', 'g', 'mg'],
  correct: 2,
  explain: 'Le milligramme (mg) est fait pour des masses minuscules — un comprimé pèse souvent moins d’un gramme.',
};

function IntroQuestion({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SCALE.map((s) => (
          <div key={s.unit} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
            <div className="text-2xl" aria-hidden="true">{s.emoji}</div>
            <div className="font-mono font-extrabold text-sm text-slate-800">{s.unit}</div>
            <div className="text-[11px] text-slate-500 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-700">{INTRO_Q.q}</p>
      <ChoiceGrid options={INTRO_Q.options} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={INTRO_Q.correct} cols={3} disabled={solved} />
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === INTRO_Q.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {checked && (
        <Feedback tone={pick === INTRO_Q.correct ? 'ok' : 'ko'}>
          {INTRO_Q.explain}
          {pick !== INTRO_Q.correct && (
            <>
              {' '}
              <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

const MATCH_ITEMS = [
  { id: 'comprime', emoji: '💊', label: 'Un comprimé de médicament', correct: 'mg' },
  { id: 'piece', emoji: '🪙', label: 'Une pièce de monnaie', correct: 'g' },
  { id: 'sac', emoji: '🎒', label: 'Un sac à dos', correct: 'kg' },
  { id: 'camion', emoji: '🚚', label: 'Un camion', correct: 't' },
];
const UNIT_OPTIONS = ['mg', 'g', 'kg', 't'];

function MatchUnits({ solved, onSolved }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
  const allPicked = MATCH_ITEMS.every((it) => picks[it.id]);
  const nCorrect = MATCH_ITEMS.filter((it) => picks[it.id] === it.correct).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Choisis, parmi les quatre unités, celle qui convient à chaque objet.</p>
      <div className="space-y-3">
        {MATCH_ITEMS.map((it) => {
          const pick = picks[it.id];
          const isRight = checked && pick === it.correct;
          const isWrong = checked && pick && pick !== it.correct;
          return (
            <div key={it.id} className={`rounded-2xl border-2 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 ${isRight ? 'border-emerald-300 bg-emerald-50/50' : isWrong ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2.5 sm:w-56 shrink-0">
                <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                <span className="text-sm font-semibold text-slate-700">{it.label}</span>
              </div>
              <div className="flex gap-1.5" role="group" aria-label={`Unité pour : ${it.label}`}>
                {UNIT_OPTIONS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    disabled={solved}
                    onClick={() => { setChecked(false); setPicks((p) => ({ ...p, [it.id]: u })); }}
                    aria-pressed={pick === u}
                    className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      pick === u
                        ? checked
                          ? u === it.correct ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-rose-600 border-rose-700 text-white'
                          : 'bg-blue-600 border-blue-700 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (nCorrect === MATCH_ITEMS.length) onSolved?.(); }} disabled={!allPicked}>Vérifier</ValidateButton>
        </div>
      )}
      {checked && nCorrect < MATCH_ITEMS.length && (
        <Feedback tone="hint">{nCorrect} / {MATCH_ITEMS.length} corrects. mg pour le minuscule, g pour le quotidien léger, kg pour le quotidien lourd, t pour l’énorme.</Feedback>
      )}
      {(solved || nCorrect === MATCH_ITEMS.length) && checked && <Feedback tone="ok">Bien vu : l’unité suit toujours la taille de l’objet.</Feedback>}
    </div>
  );
}

const PLAUSIBLE_Q = {
  q: 'Un élève écrit : « Une voiture pèse 1 500 mg ». Est-ce plausible ?',
  options: ['Oui, c’est plausible', 'Non : 1 500 mg, c’est à peine plus lourd qu’un trombone — pas du tout une voiture'],
  correct: 1,
  explain: '1 500 mg = 1,5 g, une masse minuscule. Une voiture pèse environ une tonne : l’élève a sûrement voulu écrire 1 500 kg.',
};

function PlausibleCheck({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{PLAUSIBLE_Q.q}</p>
      <ChoiceGrid options={PLAUSIBLE_Q.options} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={PLAUSIBLE_Q.correct} cols={1} disabled={solved} />
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === PLAUSIBLE_Q.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {checked && (
        <Feedback tone={pick === PLAUSIBLE_Q.correct ? 'ok' : 'ko'}>
          {PLAUSIBLE_Q.explain}
          {pick !== PLAUSIBLE_Q.correct && (
            <>
              {' '}
              <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module02ChoisirUnite() {
  const navLinks = getNavLinks(2);
  const [introDone, setIntroDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [plausibleDone, setPlausibleDone] = useState(false);
  const allDone = introDone && matchDone && plausibleDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Choisir la bonne unité"
      moduleSubtitle="mg, g, kg, t : quatre unités pour quatre échelles de masse."
      moduleNumber={2}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 02" title="Quatre unités, quatre familles d’objets.">
          <p>Pas de règle à mémoriser : compare simplement à des objets que tu connais.</p>
        </MissionBrief>

        <StepCard num={1} title="Une échelle de masses" done={introDone}>
          <IntroQuestion solved={introDone} onSolved={() => setIntroDone(true)} />
        </StepCard>

        <StepCard num={2} title="À chaque objet, son unité" done={matchDone} locked={!introDone}>
          <MatchUnits solved={matchDone} onSolved={() => setMatchDone(true)} />
        </StepCard>

        <StepCard num={3} title="Plausible ou pas ?" done={plausibleDone} locked={!matchDone}>
          <PlausibleCheck solved={plausibleDone} onSolved={() => setPlausibleDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Layers className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              mg → g → kg → t : à chaque saut, l’unité correspond à des objets bien plus grands. C’est cette
              intuition qui te permettra de repérer une masse impossible.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
