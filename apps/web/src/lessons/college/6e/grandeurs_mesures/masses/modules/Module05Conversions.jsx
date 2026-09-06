import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, formatMass, formatDec, parseDec } from '../components/massUtils';
import ConservedMass from '../components/ConservedMass';

/**
 * Module 5 — formalisation, reconstruit sur le lesson kit.
 *
 * Convertir, ce n'est pas « déplacer la virgule au hasard » : on raisonne
 * d'abord sur le SENS du changement, puis on calcule. Deux corrections par
 * rapport à la version pré-kit :
 *   — la valeur n'est plus bloquée derrière une direction juste (le champ
 *     n'apparaissait qu'une fois le QCM réussi), et plus aucun « Réessayer »
 *     n'efface la réponse ;
 *   — NumericQuestion reçoit parse/display DÉCIMAUX. Par défaut le kit
 *     utilise parseFr/formatFr, qui tronquent : 2 500 g → 2 kg au lieu de
 *     2,5 kg. Deux manches sur quatre tombent ici.
 */
const ROUNDS = [
  { id: 'r1', value: 3, from: 'kg', to: 'g', grow: true },
  { id: 'r2', value: 2500, from: 'g', to: 'kg', grow: false },
  { id: 'r3', value: 4, from: 'g', to: 'mg', grow: true },
  { id: 'r4', value: 4200, from: 'g', to: 'kg', grow: false },
];

const DIRECTION_OPTIONS = ['Le nombre va devenir PLUS GRAND', 'Le nombre va devenir PLUS PETIT'];

function ConversionRound({ round, dirDone, setDirDone, solved, onAnswered, showMass = false }) {
  const expected = convert(round.value, round.from, round.to);
  const smaller = round.grow ? round.to : round.from;
  const bigger = round.grow ? round.from : round.to;
  const [massUnit, setMassUnit] = useState(round.from);

  return (
    <div className="space-y-4">
      <div className="text-center font-mono text-lg font-bold text-slate-800">
        {formatMass(round.value, round.from)} = ? {round.to}
      </div>

      <TapQuestion
        requires={['escalier-masses', 'masse-invariante']}
        prompt={`Le ${smaller} est plus petit que le ${bigger}. Avant de calculer : le nombre va-t-il changer comment ?`}
        options={DIRECTION_OPTIONS}
        correct={round.grow ? 0 : 1}
        cols={1}
        explain={
          `On pèse la même masse avec une unité ${round.grow ? 'plus petite' : 'plus grande'} : il en faut donc ` +
          `${round.grow ? 'davantage' : 'moins'}, le nombre ${round.grow ? 'augmente' : 'diminue'}.`
        }
        solved={dirDone || solved}
        onAnswered={() => setDirDone(true)}
      />

      {(dirDone || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            requires={['convertir-masse-methode', 'escalier-masses']}
            prompt={`Calcule maintenant la valeur exacte, en ${round.to}.`}
            suffix={round.to}
            expected={expected}
            parse={parseDec}
            display={formatDec(expected)}
            above={
              showMass
                ? () => (
                    <ConservedMass
                      value={round.value}
                      fromUnit={round.from}
                      toUnit={round.to}
                      unit={massUnit}
                      onUnitChange={setMassUnit}
                    />
                  )
                : undefined
            }
            explain={<>{formatMass(round.value, round.from)} = <strong>{formatMass(expected, round.to)}</strong></>}
            explainFor={() => `Entre ${round.from} et ${round.to} le facteur est 1 000 : applique-le à ${formatMass(round.value, round.from)}.`}
            solved={solved}
            onAnswered={onAnswered}
          />
        </div>
      )}
    </div>
  );
}

const DETECTIVE_ITEMS = [
  {
    id: 'd1',
    q: 'Un élève écrit : « 2 kg = 200 g ». Où est l’erreur ?',
    options: ['Il n’y a pas d’erreur, 2 kg = 200 g', 'Il a multiplié par 100 au lieu de 1000 : 1 kg = 1000 g, donc 2 kg = 2000 g'],
    correct: 1,
    explain: '1 kg contient 1000 g (pas 100). Donc 2 kg = 2 × 1000 = 2000 g, et non 200 g.',
  },
  {
    id: 'd2',
    q: 'Une valise a une masse de « 18 g » d’après l’étiquette d’un élève. Que penses-tu de cette mesure ?',
    options: ['C’est plausible, le nombre 18 est correct', 'Le nombre semble correct pour une valise, mais l’unité ne convient pas : il voulait sûrement écrire 18 kg'],
    correct: 1,
    explain: 'Une valise de 18 g serait plus légère qu’une pièce de monnaie. Le nombre 18 est raisonnable pour une valise, mais seulement en kg : nombre ET unité doivent être cohérents ensemble.',
  },
];

export default function Module05Conversions() {
  const [dirDone, setDirDone] = useState({});
  const [roundsDone, setRoundsDone] = useState({});
  const allRoundsDone = ROUNDS.every((r) => roundsDone[r.id]);

  const [detDone, setDetDone] = useState({});
  const allDetDone = DETECTIVE_ITEMS.every((d) => detDone[d.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Convertir les masses"
      moduleSubtitle="Passer d’une unité à l’autre en comprenant pourquoi le nombre change."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 05',
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
              {/* La méthode est posée AVANT le premier calcul exact : la
                  première manche fait choisir le sens (le geste), les briques
                  le nomment, et seulement ensuite on chiffre. */}
              {dirDone.r1 && (
                <KnowledgeBrick
                  id="convertir-masse-methode"
                  variant="new"
                  lead="Tu viens de décider dans quel sens le nombre part. C'est la première moitié du travail."
                />
              )}
              {dirDone.r1 && (
                <KnowledgeBrick
                  id="mem-sens-conversion-masse"
                  variant="new"
                  lead="Le seul réflexe à retenir pour ne jamais convertir à l'envers."
                />
              )}
              {ROUNDS.map((r, i) =>
                i === 0 || roundsDone[ROUNDS[i - 1].id] ? (
                  <ConversionRound
                    key={r.id}
                    round={r}
                    dirDone={!!dirDone[r.id]}
                    setDirDone={() => setDirDone((d) => ({ ...d, [r.id]: true }))}
                    solved={!!roundsDone[r.id]}
                    onAnswered={() => setRoundsDone((d) => ({ ...d, [r.id]: true }))}
                    showMass={i === 0}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Détective des erreurs',
          done: allDetDone,
          content: (
            <div className="space-y-6">
              {DETECTIVE_ITEMS.map((item, i) =>
                i === 0 || detDone[DETECTIVE_ITEMS[i - 1].id] ? (
                  <div key={item.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                    <TapQuestion
                      requires={['convertir-masse-methode', 'mem-sens-conversion-masse', 'escalier-masses', 'unite-masse-adaptee']}
                      prompt={item.q}
                      options={item.options}
                      correct={item.correct}
                      cols={1}
                      explain={item.explain}
                      solved={!!detDone[item.id]}
                      onAnswered={() => setDetDone((d) => ({ ...d, [item.id]: true }))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu convertis juste. Reste à savoir, avant même de calculer,
          quel résultat est plausible — et à ne jamais mélanger deux unités.
        </KnowledgeSnapshot>
      }
    />
  );
}
