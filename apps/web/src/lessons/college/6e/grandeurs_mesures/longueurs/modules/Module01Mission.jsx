import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler as RulerIcon } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const CONSTAT_Q = {
  q: "Léo doit indiquer la distance entre Paris et Lyon. Il écrit : « 465 000 000 mm ». Que penses-tu de son choix ?",
  options: [
    "C'est juste, du moment que le nombre est exact",
    "Le nombre est peut-être juste, mais le millimètre n'est pas une unité adaptée pour une aussi grande distance",
  ],
  correct: 1,
  explain:
    "465 000 000 mm et 465 km représentent la même distance. Mais un nombre avec autant de chiffres n'aide personne à se représenter la distance : on choisit une unité adaptée à la taille de ce qu'on mesure.",
};

const ITEMS = [
  { id: 'stylo', emoji: '🖊️', label: 'La longueur d’un stylo', correct: 'cm' },
  { id: 'paris', emoji: '🏙️', label: 'La distance entre deux villes', correct: 'km' },
  { id: 'piece', emoji: '🪙', label: 'L’épaisseur d’une pièce de monnaie', correct: 'mm' },
  { id: 'porte', emoji: '🚪', label: 'La hauteur d’une porte', correct: 'm' },
  { id: 'cahier', emoji: '📓', label: 'La largeur d’un cahier', correct: 'cm' },
];

const UNITS = ['km', 'm', 'cm', 'mm'];

function MatchUnits({ solved, onSolved }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);

  const allPicked = ITEMS.every((it) => picks[it.id]);
  const nCorrect = ITEMS.filter((it) => picks[it.id] === it.correct).length;
  const allCorrect = checked && nCorrect === ITEMS.length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Pour chaque situation, choisis l’unité la plus adaptée. Il n’y a pas de piège caché : demande-toi simplement
        « à peu près quelle taille est-ce que je mesure ? »
      </p>
      <div className="space-y-3">
        {ITEMS.map((it) => {
          const pick = picks[it.id];
          const isRight = checked && pick === it.correct;
          const isWrong = checked && pick && pick !== it.correct;
          return (
            <div
              key={it.id}
              className={`rounded-2xl border-2 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${
                isRight ? 'border-emerald-300 bg-emerald-50/50' : isWrong ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:w-64 shrink-0">
                <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                <span className="text-sm font-semibold text-slate-700">{it.label}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap" role="group" aria-label={`Unité pour : ${it.label}`}>
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    disabled={solved}
                    onClick={() => { setChecked(false); setPicks((p) => ({ ...p, [it.id]: u })); }}
                    aria-pressed={pick === u}
                    className={`px-3.5 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
          <ValidateButton
            onClick={() => { setChecked(true); if (nCorrect === ITEMS.length) onSolved?.(); }}
            disabled={!allPicked}
          >
            Vérifier mes choix
          </ValidateButton>
        </div>
      )}

      {checked && !allCorrect && (
        <Feedback tone="hint">
          {nCorrect} / {ITEMS.length} bonnes réponses. Compare la taille de l’objet à des repères connus : un stylo
          se mesure comme un cahier (cm), une pièce est très fine (mm), une porte est plus grande que toi (m), une
          distance entre villes se compte en km.
        </Feedback>
      )}

      {allCorrect && (
        <Feedback tone="ok">
          Exactement : on choisit l’unité en fonction de la taille de ce qu’on mesure, pas au hasard.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [constatPick, setConstatPick] = useState(null);
  const [constatRevealed, setConstatRevealed] = useState(false);
  const [matchDone, setMatchDone] = useState(false);

  const s1 = constatRevealed && constatPick === CONSTAT_Q.correct;
  const s2 = matchDone;
  const allDone = s1 && s2;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : quelle unité ?"
      moduleSubtitle="La largeur d’un cahier, la distance Paris–Lyon : une seule unité pour tout mesurer ?"
      moduleNumber={1}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Léo doit annoncer une distance… mais quelque chose cloche.">
          <div className="bg-white/10 rounded-xl p-4 text-center font-mono text-lg font-bold text-white mt-2">
            Paris → Lyon : 465 000 000 mm
          </div>
          <p className="pt-2">
            Le nombre est correct. Alors pourquoi ce choix te semble-t-il bizarre ?
          </p>
        </MissionBrief>

        <StepCard num={1} title="Un premier constat" done={s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{CONSTAT_Q.q}</p>
            <ChoiceGrid options={CONSTAT_Q.options} selected={constatPick} onSelect={setConstatPick} revealed={constatRevealed} correctIndex={CONSTAT_Q.correct} cols={1} />
            {!constatRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setConstatRevealed(true)} disabled={constatPick === null}>Valider</ValidateButton>
              </div>
            )}
            {constatRevealed && (
              <Feedback tone={constatPick === CONSTAT_Q.correct ? 'ok' : 'ko'}>
                {CONSTAT_Q.explain}
                {constatPick !== CONSTAT_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setConstatRevealed(false); setConstatPick(null); }} className="underline font-semibold">
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="À chaque situation, son unité" done={s2} locked={!s1}>
          <MatchUnits solved={matchDone} onSolved={() => setMatchDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <RulerIcon className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Km, m, cm, mm : quatre unités pour quatre échelles différentes. Dans cette leçon, tu vas apprendre à les
              mesurer, à passer de l’une à l’autre, et à calculer un périmètre.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
