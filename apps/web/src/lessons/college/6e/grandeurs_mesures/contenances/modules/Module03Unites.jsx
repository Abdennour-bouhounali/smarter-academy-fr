import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 3 V2 — reconstruit sur le lesson kit : QCM en TapQuestion,
 * association situation ↔ unité en BatchChoiceQuestion.
 */

const SCALE = [
  { unit: 'mL', emoji: '💊', label: 'Un sirop médicament', sizeClass: 'text-2xl' },
  { unit: 'cL', emoji: '🥤', label: 'Un petit verre de jus', sizeClass: 'text-4xl' },
  { unit: 'dL', emoji: '🥣', label: 'Un bol de soupe', sizeClass: 'text-5xl' },
  { unit: 'L', emoji: '🍶', label: 'Une bouteille d’eau', sizeClass: 'text-6xl' },
];

const INTRO_Q = {
  q: 'Une dose de sirop pour la toux se mesure en toute petite quantité. Quelle unité te semble la plus adaptée ?',
  options: ['L', 'cL', 'mL'],
  correct: 2,
  explain: 'Le millilitre (mL) est fait pour des quantités minuscules — une dose de sirop se mesure en quelques mL.',
};

const MATCH_ITEMS = [
  { id: 'sirop', emoji: '💊', label: 'Une dose de sirop', correct: 'mL' },
  { id: 'jus', emoji: '🥤', label: 'Un petit verre de jus', correct: 'cL' },
  { id: 'soupe', emoji: '🥣', label: 'Un bol de soupe', correct: 'dL' },
  { id: 'bouteille', emoji: '🍶', label: 'Une bouteille d’eau', correct: 'L' },
];
const UNIT_OPTIONS = ['mL', 'cL', 'dL', 'L'];

const PLAUSIBLE_Q = {
  q: 'Une baignoire pleine contient environ…',
  options: ['3 mL', '3 L', '300 L'],
  correct: 2,
  explain: '3 mL, c’est à peine quelques gouttes ; 3 L, c’est une grande bouteille. Une baignoire, elle, contient environ 300 L.',
};

export default function Module03Unites() {
  const [introDone, setIntroDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [plausibleDone, setPlausibleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les unités L, dL, cL, mL"
      moduleSubtitle="Quatre unités pour quatre échelles de contenance."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Quatre unités, quatre familles de récipients.',
        body: <p>Pas de règle à mémoriser : compare simplement à des quantités que tu connais.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Une échelle de contenances',
          done: introDone,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SCALE.map((s) => (
                  <div key={s.unit} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center flex flex-col items-center justify-end h-36">
                    <div className="flex-1 flex items-center justify-center">
                      <div className={`${s.sizeClass} transition-transform duration-300 hover:scale-110`} aria-hidden="true">{s.emoji}</div>
                    </div>
                    <div className="font-mono font-extrabold text-sm text-slate-800 mt-1">{s.unit}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
              <TapQuestion
                prompt={INTRO_Q.q}
                options={INTRO_Q.options}
                correct={INTRO_Q.correct}
                cols={3}
                explain={INTRO_Q.explain}
                solved={introDone}
                onAnswered={() => setIntroDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'À chaque situation, son unité',
          done: matchDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">Choisis, parmi les quatre unités, celle qui convient à chaque situation.</p>}
              rows={MATCH_ITEMS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: UNIT_OPTIONS,
                correct: UNIT_OPTIONS.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={matchDone}
              onAnswered={() => setMatchDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes associations sont en vert.{' '}
                    </>
                  )}
                  mL pour la dose de sirop, cL pour le petit verre, dL pour le bol, L pour la bouteille : l’unité suit
                  toujours la taille de ce qu’on mesure.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Plausible ou pas ?',
          done: plausibleDone,
          content: (
            <TapQuestion
              prompt={PLAUSIBLE_Q.q}
              options={PLAUSIBLE_Q.options}
              correct={PLAUSIBLE_Q.correct}
              cols={3}
              explain={PLAUSIBLE_Q.explain}
              solved={plausibleDone}
              onAnswered={() => setPlausibleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Layers className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            mL, cL, dL, L : à chaque saut, l’unité correspond à des quantités bien plus grandes. C’est cette
            intuition qui te permettra de repérer une contenance impossible.
          </p>
        </div>
      }
    />
  );
}
