import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, formatLength, formatDec, parseDec } from '../components/lengthUtils';
import ConservedSegment from '../components/ConservedSegment';

/**
 * Module 4 — formalisation, reconstruit sur le lesson kit.
 *
 * Convertir, ce n'est pas « déplacer la virgule au hasard » : on raisonne
 * d'abord sur le SENS du changement (plus grand ou plus petit), puis on
 * calcule la valeur. Corrige un bug présent aussi bien dans la version
 * pré-kit de cette leçon que dans le module de référence (Contenances
 * Module05Conversions.jsx) : la direction et la valeur y étaient toutes les
 * deux bloquées sur la bonne réponse avec un bouton « Réessayer ». Ici,
 * TapQuestion/NumericQuestion révèlent toujours, sans jamais bloquer.
 */
const DIRECTION_OPTIONS = [
  'Le nombre va devenir PLUS GRAND',
  'Le nombre va devenir PLUS PETIT',
];

const ROUNDS = [
  { id: 'r1', value: 2, from: 'm', to: 'cm', grow: true },
  { id: 'r2', value: 350, from: 'cm', to: 'm', grow: false },
  { id: 'r3', value: 1.2, from: 'km', to: 'm', grow: true },
  { id: 'r4', value: 45, from: 'mm', to: 'cm', grow: false },
];

function ConversionRound({ round, dirDone, setDirDone, solved, onAnswered, showSegment = false }) {
  const expected = convert(round.value, round.from, round.to);
  const smaller = round.grow ? round.to : round.from;
  const bigger = round.grow ? round.from : round.to;
  const [segmentUnit, setSegmentUnit] = useState(round.from);

  return (
    <div className="space-y-4">
      <div className="text-center font-mono text-lg font-bold text-slate-800">
        {formatLength(round.value, round.from)} = ? {round.to}
      </div>

      <TapQuestion
        prompt={`Le ${smaller} est plus petit que le ${bigger}. Avant de calculer : le nombre va-t-il changer comment ?`}
        options={DIRECTION_OPTIONS}
        correct={round.grow ? 0 : 1}
        cols={1}
        explain={
          `On mesure la même longueur avec une unité ${round.grow ? 'plus petite' : 'plus grande'} : il en faut donc ` +
          `${round.grow ? 'davantage' : 'moins'}, le nombre ${round.grow ? 'augmente' : 'diminue'}.`
        }
        solved={dirDone || solved}
        onAnswered={() => setDirDone(true)}
      />

      {(dirDone || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            prompt={`Calcule maintenant la valeur exacte, en ${round.to}.`}
            suffix={round.to}
            expected={expected}
            parse={parseDec}
            display={formatDec(expected)}
            above={
              showSegment
                ? () => (
                    <ConservedSegment
                      value={round.value}
                      fromUnit={round.from}
                      toUnit={round.to}
                      unit={segmentUnit}
                      onUnitChange={setSegmentUnit}
                    />
                  )
                : undefined
            }
            explain={<>{formatLength(round.value, round.from)} = <strong>{formatLength(expected, round.to)}</strong></>}
            explainFor={() => `Pense à l'échelle entre ${round.from} et ${round.to} (×10, ×100 ou ×1000 selon les unités) et applique-la à ${formatLength(round.value, round.from)}.`}
            solved={solved}
            onAnswered={onAnswered}
          />
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
  const [dirDone, setDirDone] = useState({});
  const [roundsDone, setRoundsDone] = useState({});
  const allRoundsDone = ROUNDS.every((r) => roundsDone[r.id]);

  const [detDone, setDetDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Convertir"
      moduleSubtitle="Passer d’une unité à l’autre en comprenant pourquoi le nombre change."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 04',
        title: "Convertir, ce n'est pas « déplacer la virgule au hasard ».",
        body: <p>Avant de calculer, demande-toi toujours : cette nouvelle unité est-elle plus grande ou plus petite ?</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Quatre conversions, une seule logique',
          done: allRoundsDone,
          content: (
            <div className="space-y-8">
              {ROUNDS.map((r, i) =>
                i === 0 || roundsDone[ROUNDS[i - 1].id] ? (
                  <ConversionRound
                    key={r.id}
                    round={r}
                    dirDone={!!dirDone[r.id]}
                    setDirDone={() => setDirDone((d) => ({ ...d, [r.id]: true }))}
                    solved={!!roundsDone[r.id]}
                    onAnswered={() => setRoundsDone((d) => ({ ...d, [r.id]: true }))}
                    showSegment={i === 0}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Détective des erreurs',
          done: detDone,
          content: (
            <TapQuestion
              prompt={DETECTIVE_Q.q}
              options={DETECTIVE_Q.options}
              correct={DETECTIVE_Q.correct}
              cols={1}
              explain={DETECTIVE_Q.explain}
              solved={detDone}
              onAnswered={() => setDetDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <ArrowLeftRight className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Avant de « déplacer la virgule », demande-toi toujours pourquoi elle bouge : c'est ce raisonnement qui
            évite les erreurs.
          </p>
        </motion.div>
      }
    />
  );
}
