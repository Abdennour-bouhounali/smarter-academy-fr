import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, QuantityCard } from '../../../../../common/components/LessonUI';
import { formatFr } from '../components/numberUtils';

/* ─── Le contenu du coffre ───────────────────────────────────────── */
const TRESOR = [
  { id: 'stylos', emoji: '🖊️', label: 'stylos du casier', value: 8 },
  { id: 'eleves', emoji: '🎒', label: 'élèves du niveau', value: 42 },
  { id: 'pages', emoji: '📖', label: 'pages du livre', value: 307 },
  { id: 'habitants', emoji: '🏘️', label: 'habitants du village', value: 2450 },
  { id: 'spectateurs', emoji: '🎪', label: 'spectateurs du festival', value: 18700 },
  { id: 'visiteurs', emoji: '🏛️', label: 'visiteurs du musée', value: 305000 },
];

/* ─── Étape 2 : ce qui a servi à décider ─────────────────────────── */
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
  wrongHint:
    "Attention : 9 commence par le chiffre 9, et 12 commence par le chiffre 1. Pourtant 12 est plus grand. Un seul chiffre ne suffit donc pas à décider.",
};

/* ─── Étape 3 : le piège qui crée le besoin ──────────────────────── */
const PIEGE = {
  a: 3900,
  b: 12000,
  options: ['3 900 est le plus grand', '12 000 est le plus grand', 'Ils sont égaux'],
  correct: 1,
};

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [step1Done, setStep1Done] = useState(false);

  const [reflexionPick, setReflexionPick] = useState(null);
  const [reflexionRevealed, setReflexionRevealed] = useState(false);

  const [piegePick, setPiegePick] = useState(null);
  const [piegeRevealed, setPiegeRevealed] = useState(false);

  const step2Done = reflexionRevealed && reflexionPick === REFLEXION.correct;
  const step3Done = piegeRevealed;
  const allDone = step1Done && step2Done && step3Done;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : Le coffre aux nombres"
      moduleSubtitle="Six quantités, aucune règle donnée. À toi de trouver comment les départager."
      moduleNumber={1}
      estimatedTime="7 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Tu ouvres le coffre aux nombres du collège.">
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
        </MissionBrief>

        {/* Le contenu du coffre */}
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

        {/* Étape 1 — ranger */}
        <StepCard
          num={1}
          title="Range les six quantités, de la plus petite à la plus grande"
          subtitle="Tape une carte pour la placer. Tape une carte placée pour la retirer."
          done={step1Done}
        >
          <OrderingGame
            items={TRESOR}
            direction="asc"
            solved={step1Done}
            onSolved={() => setStep1Done(true)}
          />
        </StepCard>

        {/* Étape 2 — expliciter la stratégie */}
        <StepCard
          num={2}
          title="Qu'est-ce qui t'a aidé à décider ?"
          subtitle="Range d'abord les cartes, puis reviens expliquer ta stratégie."
          done={step2Done}
          locked={!step1Done}
        >
          <p className="text-sm font-semibold text-slate-700">{REFLEXION.question}</p>
          <ChoiceGrid
            options={REFLEXION.options}
            selected={reflexionPick}
            onSelect={setReflexionPick}
            revealed={reflexionRevealed && reflexionPick === REFLEXION.correct}
            correctIndex={REFLEXION.correct}
          />
          {!step2Done && (
            <ValidateButton onClick={() => setReflexionRevealed(true)} disabled={reflexionPick === null}>
              Valider
            </ValidateButton>
          )}
          {reflexionRevealed && reflexionPick !== REFLEXION.correct && (
            <Feedback tone="hint">
              {REFLEXION.wrongHint}{' '}
              <button
                type="button"
                onClick={() => {
                  setReflexionRevealed(false);
                  setReflexionPick(null);
                }}
                className="underline font-semibold"
              >
                Réessayer
              </button>
            </Feedback>
          )}
          {step2Done && <Feedback tone="ok">{REFLEXION.explain}</Feedback>}
        </StepCard>

        {/* Étape 3 — le piège */}
        <StepCard
          num={3}
          title="Un dernier duel avant de partir"
          subtitle="Deux étiquettes ont été retrouvées au fond du coffre."
          done={step3Done}
          locked={!step2Done}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
              <div className="text-[11px] font-mono text-slate-500 uppercase">Étiquette A</div>
              <div className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">
                {formatFr(PIEGE.a)}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
              <div className="text-[11px] font-mono text-slate-500 uppercase">Étiquette B</div>
              <div className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">
                {formatFr(PIEGE.b)}
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-700">Laquelle représente la plus grande quantité ?</p>
          <ChoiceGrid
            options={PIEGE.options}
            selected={piegePick}
            onSelect={setPiegePick}
            revealed={piegeRevealed}
            correctIndex={PIEGE.correct}
            cols={3}
          />
          {!piegeRevealed && (
            <ValidateButton onClick={() => setPiegeRevealed(true)} disabled={piegePick === null}>
              Valider
            </ValidateButton>
          )}

          {piegeRevealed && (
            <div className="space-y-3">
              {/* Comparaison visuelle : la longueur parle d'elle-même */}
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

              <Feedback tone={piegePick === PIEGE.correct ? 'ok' : 'ko'}>
                {piegePick === PIEGE.correct
                  ? "Exact : 12 000 est le plus grand. Il a 5 chiffres, contre 4 pour 3 900."
                  : "Piège classique ! On est tenté de comparer 900 et 12, mais ce ne sont pas des quantités comparables : dans 12 000, le 12 compte des MILLIERS."}{' '}
                <strong>3 900 &lt; 12 000</strong>, parce que 12 000 contient 12 milliers alors que 3 900 n'en
                contient que 3.
              </Feedback>

              <Feedback tone="info">
                Ce que tu viens de sentir, c'est l'idée centrale de toute la leçon :{' '}
                <strong>un grand nombre n'est pas une suite de chiffres au hasard</strong>. Chaque chiffre occupe
                une position, et c'est cette position qui décide de sa valeur. Direction le module 2 : on va
                construire les nombres de nos mains.
              </Feedback>
            </div>
          )}
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
