import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { Feedback, QuantityCard } from '../../../../../common/components/LessonUI';
import { formatFr } from '../components/numberUtils';

/**
 * Module 1 V2 — reconstruit sur le lesson kit. Le contenu pédagogique
 * (trésor, réflexion, piège) est identique à Module01Mission.jsx ; le
 * shell (progression, effets, auto-scroll, auto-avance) vient du kit.
 */

const TRESOR = [
  { id: 'stylos', emoji: '🖊️', label: 'stylos du casier', value: 8 },
  { id: 'eleves', emoji: '🎒', label: 'élèves du niveau', value: 42 },
  { id: 'pages', emoji: '📖', label: 'pages du livre', value: 307 },
  { id: 'habitants', emoji: '🏘️', label: 'habitants du village', value: 2450 },
  { id: 'spectateurs', emoji: '🎪', label: 'spectateurs du festival', value: 18700 },
  { id: 'visiteurs', emoji: '🏛️', label: 'visiteurs du musée', value: 305000 },
];

const REFLEXION = {
  question: "Quel indice permet de repérer le plus grand nombre en un coup d'œil, à tous les coups ?",
  options: [
    'Le nombre de chiffres du nombre',
    "La longueur du mot quand on l'écrit en lettres",
    'Le premier chiffre, tout seul',
    'La taille des chiffres écrits',
  ],
  correct: 0,
  explain:
    "Le nombre de chiffres donne l'ordre de grandeur : un nombre à 6 chiffres est forcément plus grand qu'un nombre à 4 chiffres. Le premier chiffre seul ne suffit pas : 9 commence par 9 et pourtant 9 < 12.",
};

const PIEGE = {
  a: 3900,
  b: 12000,
  options: ['3 900 est le plus grand', '12 000 est le plus grand', 'Ils sont égaux'],
  correct: 1,
};

function PiegeVisuel() {
  return (
    <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
      {[
        { v: PIEGE.a, color: 'bg-rose-400' },
        { v: PIEGE.b, color: 'bg-emerald-500' },
      ].map(({ v, color }) => (
        <div key={v} className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-slate-600 w-16 shrink-0 tabular-nums">
            {formatFr(v)}
          </span>
          <div className="flex-1 h-5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(v / PIEGE.b) * 100}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${color} rounded-full`}
            />
          </div>
        </div>
      ))}
      <p className="text-[11px] font-mono text-slate-400 pt-1">
        Longueur de la barre = quantité représentée.
      </p>
    </div>
  );
}

export default function Module01Mission() {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le coffre aux nombres"
      moduleSubtitle="Six quantités, aucune règle donnée. À toi de trouver comment les départager."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Tu ouvres le coffre aux nombres du collège.',
        body: (
          <>
            <p>
              À l'intérieur, six étiquettes indiquent des quantités très différentes : des stylos, des élèves,
              des pages, des habitants, des spectateurs, des visiteurs.
            </p>
            <p className="text-white font-semibold">
              Comment peux-tu savoir laquelle représente la plus grande quantité ?
            </p>
            <p className="text-xs">
              Aucune règle ne t'est donnée pour l'instant. Explore, essaie, trompe-toi : c'est le but.
            </p>
          </>
        ),
      }}
      intro={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TRESOR.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <QuantityCard emoji={t.emoji} label={t.label} value={formatFr(t.value)} />
            </motion.div>
          ))}
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Range les six quantités, de la plus petite à la plus grande',
          subtitle: 'Tape une carte pour la placer. Tape une carte placée pour la retirer.',
          done: step1Done,
          // Module déclencheur : le rangement se découvre par l'essai, pas de
          // mode formatif ici (l'élève cherche la règle lui-même — c'est le but).
          content: (
            <OrderingGame
              items={TRESOR}
              direction="asc"
              solved={step1Done}
              onSolved={() => setStep1Done(true)}
            />
          ),
        },
        {
          num: 2,
          title: "Qu'est-ce qui t'a aidé à décider ?",
          subtitle: "Range d'abord les cartes, puis reviens expliquer ta stratégie.",
          done: step2Done,
          content: (
            <TapQuestion
              prompt={REFLEXION.question}
              options={REFLEXION.options}
              correct={REFLEXION.correct}
              explain={REFLEXION.explain}
              onAnswered={() => setStep2Done(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Un dernier duel avant de partir',
          subtitle: 'Deux étiquettes ont été retrouvées au fond du coffre.',
          done: step3Done,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Étiquette A', v: PIEGE.a },
                  { label: 'Étiquette B', v: PIEGE.b },
                ].map(({ label, v }) => (
                  <div key={label} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
                    <div className="text-[11px] font-mono text-slate-500 uppercase">{label}</div>
                    <div className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">
                      {formatFr(v)}
                    </div>
                  </div>
                ))}
              </div>

              <TapQuestion
                prompt="Laquelle représente la plus grande quantité ?"
                options={PIEGE.options}
                correct={PIEGE.correct}
                cols={3}
                explain={
                  <>
                    Exact : 12 000 est le plus grand. Il a 5 chiffres, contre 4 pour 3 900.{' '}
                    <strong>3 900 &lt; 12 000</strong>, parce que 12 000 contient 12 milliers alors que 3 900
                    n'en contient que 3.
                  </>
                }
                explainWrong={
                  <>
                    Piège classique ! On est tenté de comparer 900 et 12, mais ce ne sont pas des quantités
                    comparables : dans 12 000, le 12 compte des MILLIERS.{' '}
                    <strong>3 900 &lt; 12 000</strong>, parce que 12 000 contient 12 milliers alors que 3 900
                    n'en contient que 3.
                  </>
                }
                onAnswered={() => setStep3Done(true)}
              />

              {step3Done && (
                <div className="space-y-3">
                  <PiegeVisuel />
                  <Feedback tone="info">
                    Ce que tu viens de sentir, c'est l'idée centrale de toute la leçon :{' '}
                    <strong>un grand nombre n'est pas une suite de chiffres au hasard</strong>. Chaque chiffre
                    occupe une position, et c'est cette position qui décide de sa valeur. Direction le module 2 :
                    on va construire les nombres de nos mains.
                  </Feedback>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
