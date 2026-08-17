import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const SCALE = [
  { unit: 'mL', emoji: '💊', label: 'Un sirop médicament', hint: 'contenances très petites' },
  { unit: 'cL', emoji: '🥤', label: 'Un petit verre de jus', hint: 'petites quantités du quotidien' },
  { unit: 'dL', emoji: '🥣', label: 'Un bol de soupe', hint: 'quantités moyennes' },
  { unit: 'L', emoji: '🍶', label: 'Une bouteille d’eau', hint: 'contenances plus grandes' },
];

const INTRO_Q = {
  q: 'Une dose de sirop pour la toux se mesure en toute petite quantité. Quelle unité te semble la plus adaptée ?',
  options: ['L', 'cL', 'mL'],
  correct: 2,
  explain: 'Le millilitre (mL) est fait pour des quantités minuscules — une dose de sirop se mesure en quelques mL.',
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
  { id: 'sirop', emoji: '💊', label: 'Une dose de sirop', correct: 'mL' },
  { id: 'jus', emoji: '🥤', label: 'Un petit verre de jus', correct: 'cL' },
  { id: 'soupe', emoji: '🥣', label: 'Un bol de soupe', correct: 'dL' },
  { id: 'bouteille', emoji: '🍶', label: 'Une bouteille d’eau', correct: 'L' },
];
const UNIT_OPTIONS = ['mL', 'cL', 'dL', 'L'];

function MatchUnits({ solved, onSolved }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
  const allPicked = MATCH_ITEMS.every((it) => picks[it.id]);
  const nCorrect = MATCH_ITEMS.filter((it) => picks[it.id] === it.correct).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Choisis, parmi les quatre unités, celle qui convient à chaque situation.</p>
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
        <Feedback tone="hint">{nCorrect} / {MATCH_ITEMS.length} corrects. mL pour le minuscule, cL pour le petit verre, dL pour le bol, L pour la bouteille.</Feedback>
      )}
      {(solved || nCorrect === MATCH_ITEMS.length) && checked && <Feedback tone="ok">Bien vu : l’unité suit toujours la taille de ce qu’on mesure.</Feedback>}
    </div>
  );
}

const PLAUSIBLE_Q = {
  q: 'Une baignoire pleine contient environ…',
  options: ['3 mL', '3 L', '300 L'],
  correct: 2,
  explain: '3 mL, c’est à peine quelques gouttes ; 3 L, c’est une grande bouteille. Une baignoire, elle, contient environ 300 L.',
};

function PlausibleCheck({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{PLAUSIBLE_Q.q}</p>
      <ChoiceGrid options={PLAUSIBLE_Q.options} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={PLAUSIBLE_Q.correct} cols={3} disabled={solved} />
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

export default function Module03Unites() {
  const navLinks = getNavLinks(3);
  const [introDone, setIntroDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [plausibleDone, setPlausibleDone] = useState(false);
  const allDone = introDone && matchDone && plausibleDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Les unités L, dL, cL, mL"
      moduleSubtitle="Quatre unités pour quatre échelles de contenance."
      moduleNumber={3}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 03" title="Quatre unités, quatre familles de récipients.">
          <p>Pas de règle à mémoriser : compare simplement à des quantités que tu connais.</p>
        </MissionBrief>

        <StepCard num={1} title="Une échelle de contenances" done={introDone}>
          <IntroQuestion solved={introDone} onSolved={() => setIntroDone(true)} />
        </StepCard>

        <StepCard num={2} title="À chaque situation, son unité" done={matchDone} locked={!introDone}>
          <MatchUnits solved={matchDone} onSolved={() => setMatchDone(true)} />
        </StepCard>

        <StepCard num={3} title="Plausible ou pas ?" done={plausibleDone} locked={!matchDone}>
          <PlausibleCheck solved={plausibleDone} onSolved={() => setPlausibleDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Layers className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              mL, cL, dL, L : à chaque saut, l’unité correspond à des quantités bien plus grandes. C’est cette
              intuition qui te permettra de repérer une contenance impossible.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
