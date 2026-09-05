import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitSwitcher from '../components/UnitSwitcher';
import { convert, formatMass } from '../components/massUtils';

/**
 * Module 2 — découverte, reconstruit sur le lesson kit.
 *
 * Avant de choisir une unité, on éprouve POURQUOI il en faut plusieurs :
 * UnitSwitcher exprime une même masse réelle (un camion chargé) dans les
 * quatre unités, et le nombre devient absurde bien avant qu'on l'explique.
 */
const INTRO_Q = {
  q: 'Un comprimé de médicament est extrêmement léger. Quelle unité te semble la plus adaptée pour exprimer sa masse ?',
  options: ['kg', 'g', 'mg'],
  correct: 2,
  explain: 'Le milligramme (mg) est fait pour des masses minuscules — un comprimé pèse souvent moins d’un gramme.',
};

const MATCH_ITEMS = [
  { id: 'comprime', emoji: '💊', label: 'Un comprimé de médicament', correct: 'mg', valueInCorrect: 500, badUnit: 't' },
  { id: 'piece', emoji: '🪙', label: 'Une pièce de monnaie', correct: 'g', valueInCorrect: 6, badUnit: 'mg' },
  { id: 'sac', emoji: '🎒', label: 'Un sac à dos', correct: 'kg', valueInCorrect: 5, badUnit: 'mg' },
  { id: 'camion', emoji: '🚚', label: 'Un camion', correct: 't', valueInCorrect: 12, badUnit: 'mg' },
];
const UNIT_OPTIONS = ['mg', 'g', 'kg', 't'];

const PLAUSIBLE_Q = {
  q: 'Un élève écrit : « Une voiture pèse 1 500 mg ». Est-ce plausible ?',
  options: ['Oui, c’est plausible', 'Non : 1 500 mg, c’est à peine plus lourd qu’un trombone — pas du tout une voiture'],
  correct: 1,
  explain: '1 500 mg = 1,5 g, une masse minuscule. Une voiture pèse environ une tonne : l’élève a sûrement voulu écrire 1 500 kg.',
};

export default function Module02ChoisirUnite() {
  const [switchDone, setSwitchDone] = useState(false);
  const [seenUnits, setSeenUnits] = useState(['t']);
  const [displayUnit, setDisplayUnit] = useState('t');
  const [introDone, setIntroDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [plausibleDone, setPlausibleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Choisir la bonne unité"
      moduleSubtitle="mg, g, kg, t : quatre unités pour quatre échelles de masse."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Une seule unité ne peut pas tout mesurer.',
        body: <p>Un comprimé et un camion : la même unité pour les deux ? Essaie, et regarde ce que devient le nombre.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Une même masse, quatre unités',
          done: switchDone,
          content: (kit) => (
            <div className="space-y-4">
              <UnitSwitcher
                massT={12}
                label="Le camion chargé"
                unit={displayUnit}
                onUnitChange={(u) => {
                  setDisplayUnit(u);
                  setSeenUnits((prev) => (prev.includes(u) ? prev : [...prev, u]));
                  const allSeen = new Set([...seenUnits, u]).size === UNIT_OPTIONS.length;
                  if (allSeen && !switchDone) {
                    kit.react(true);
                    setSwitchDone(true);
                  }
                }}
              />
              {switchDone && (
                <Feedback tone="ok">
                  Le camion n’a pas changé de masse : c’est l’unité qui devient plus grande ou plus petite, et le
                  nombre s’adapte. En mg, il faudrait douze milliards — personne ne lit un nombre pareil.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le plus léger des objets',
          done: introDone,
          content: (
            <TapQuestion
              prompt={INTRO_Q.q}
              options={INTRO_Q.options}
              correct={INTRO_Q.correct}
              cols={3}
              explain={INTRO_Q.explain}
              solved={introDone}
              onAnswered={() => setIntroDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'À chaque objet, son unité',
          done: matchDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Choisis, parmi les quatre unités, celle qui convient à chaque objet. Demande-toi simplement :
                  « à peu près quelle masse est-ce que je pèse ? »
                </p>
              }
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
                correction: (
                  <>
                    → {it.correct} — en {it.badUnit}, ça ferait{' '}
                    <span className="font-mono">{formatMass(convert(it.valueInCorrect, it.correct, it.badUnit), it.badUnit)}</span> :
                    peu pratique.
                  </>
                ),
              }))}
              solved={matchDone}
              onAnswered={() => setMatchDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  On choisit l’unité en fonction de la masse à peser : un comprimé se compte en mg, une pièce en g,
                  un sac en kg, un camion en tonnes.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 4,
          title: 'Détective des unités',
          done: plausibleDone,
          content: (
            <TapQuestion
              prompt={PLAUSIBLE_Q.q}
              options={PLAUSIBLE_Q.options}
              correct={PLAUSIBLE_Q.correct}
              cols={1}
              explain={PLAUSIBLE_Q.explain}
              solved={plausibleDone}
              onAnswered={() => setPlausibleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Layers className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            mg, g, kg, t : quatre unités pour quatre échelles. Choisir la bonne, c’est déjà éviter la moitié des
            erreurs.
          </p>
        </motion.div>
      }
    />
  );
}
