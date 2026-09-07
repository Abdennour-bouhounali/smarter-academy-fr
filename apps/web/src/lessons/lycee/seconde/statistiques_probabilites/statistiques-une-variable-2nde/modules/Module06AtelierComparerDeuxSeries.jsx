import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { median, standardDeviation, interquartileRange, range as rangeOf, mean, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SeriesLab from '../components/SeriesLab';
import { TRAJETS_A, TRAJETS_B, ATELIER_X, ATELIER_Y } from '../data';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT. Comparer deux séries, c'est
 * toujours croiser UN indicateur de position et UN de dispersion, et dire
 * ce que la comparaison NE permet PAS de conclure.
 *
 * Trois situations, dont une où les deux séries ont la même médiane : c'est
 * le cas qui oblige à regarder la dispersion pour trancher.
 */
export default function Module06AtelierComparerDeuxSeries() {
  const [a1, setA1] = useState(false);
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [c1, setC1] = useState(false);

  const Situation = ({ emoji, title, children }) => (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <p className="text-sm font-black text-rose-900">{emoji} {title}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Les deux classes',
      done: a1,
      content: (
        <Situation emoji="🎒" title="2de A et 2de B — même moyenne, même médiane ou presque">
          <SeriesLab values={TRAJETS_A} min={0} max={60} unit="min" label="2de A"
            show={{ mean: true }} compareValues={TRAJETS_B} compareLabel="2de B" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[['2de A', TRAJETS_A], ['2de B', TRAJETS_B]].map(([n, s]) => (
              <div key={n} className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5">
                <p className="font-bold text-slate-700">{n}</p>
                <p className="font-mono text-slate-600">moyenne {formatNumber(mean(s), 2)} min</p>
                <p className="font-mono text-slate-600">médiane {formatNumber(median(s), 1)} min</p>
                <p className="font-mono text-slate-600">écart type {formatNumber(standardDeviation(s), 2)} min</p>
                <p className="font-mono text-slate-600">étendue {formatNumber(rangeOf(s), 1)} min</p>
              </div>
            ))}
          </div>
          <TapQuestion
            prompt="Le proviseur veut affréter un bus dont l’horaire convienne « à presque tout le monde ». Dans quelle classe est-ce le plus simple ?"
            options={[
              'En 2de B : ses trajets sont bien plus resserrés (écart type 2,98 contre 8,97 min)',
              'En 2de A : sa moyenne est légèrement plus grande',
              'C’est équivalent : les moyennes sont presque égales',
              'On ne peut pas savoir sans les effectifs',
            ]}
            correct={0} cols={1}
            explain="Les positions sont quasi identiques (19,15 et 19,10 min), donc elles ne départagent rien. C’est la DISPERSION qui tranche : en 2de B tout le monde est entre 14 et 25 min, en 2de A entre 5 et 40."
            explainWrong="Les deux classes ont les mêmes effectifs (20) et pratiquement la même moyenne : ces chiffres ne peuvent pas départager. Il faut regarder l’écart type ou l’étendue."
            solved={a1} onAnswered={() => setA1(true)}
          />
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Deux ateliers, même médiane',
      done: b1 && b2,
      content: (
        <Situation emoji="🔧" title="Durées de montage (min) dans deux ateliers">
          <SeriesLab values={ATELIER_X} min={0} max={45} unit="min" label="Atelier X"
            show={{ median: true, quartiles: true }} compareValues={ATELIER_Y} compareLabel="Atelier Y" />
          <p className="text-xs text-slate-600">
            Atelier X : médiane {formatNumber(median(ATELIER_X), 1)} min, écart interquartile {formatNumber(interquartileRange(ATELIER_X), 1)} min ·
            Atelier Y : médiane {formatNumber(median(ATELIER_Y), 1)} min, écart interquartile {formatNumber(interquartileRange(ATELIER_Y), 1)} min
          </p>
          <TapQuestion
            prompt="Les deux ateliers ont exactement la même médiane (16,5 min). Que peut-on en conclure ?"
            options={[
              'Rien sur la régularité : il faut comparer les dispersions, très différentes (4 min contre 19 min)',
              'Que les deux ateliers travaillent de la même façon',
              'Que l’atelier Y est plus rapide',
              'Que l’atelier X a moins de commandes',
            ]}
            correct={0} cols={1}
            explain="Même médiane ne veut pas dire mêmes séries : l’atelier X est très régulier (écart interquartile 4 min), l’atelier Y très irrégulier (19 min). Pour un client qui veut une durée prévisible, X est nettement préférable."
            explainWrong="La médiane ne dit que la position centrale. Ici elle est identique, donc elle ne distingue rien : c’est la dispersion qui sépare les deux ateliers."
            solved={b1} onAnswered={() => setB1(true)}
          />
          {b1 && (
            <NumericQuestion
              prompt="Quel est l’écart interquartile de l’atelier Y, en minutes ? (Q1 = 9 min, Q3 = 28 min)"
              expected={19} suffix="min"
              explain="Q3 − Q1 = 28 − 9 = 19 min, contre 4 min pour l’atelier X : presque cinq fois plus dispersé."
              explainFor={() => 'L’écart interquartile est la différence Q3 − Q1 = 28 − 9 = 19 min.'}
              solved={b2} onAnswered={() => setB2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’une comparaison ne dit pas',
      done: c1,
      content: (
        <Situation emoji="⚠️" title="Lire honnêtement">
          <TapQuestion
            prompt="La 2de A a une moyenne de 19,15 min et la 2de B de 19,10 min. Un élève écrit : « les élèves de 2de A habitent plus loin ». Est-ce défendable ?"
            options={[
              'Non : l’écart entre les moyennes est minuscule, et les deux séries se recouvrent largement',
              'Oui : 19,15 est supérieur à 19,10',
              'Oui, mais seulement pour la moitié des élèves',
              'Non, parce que la moyenne ne se compare jamais',
            ]}
            correct={0} cols={1}
            explain="Un écart de 0,05 min — trois secondes — sur des séries qui s’étalent sur des dizaines de minutes ne permet aucune conclusion. Comparer deux indicateurs suppose que leur écart soit grand devant la dispersion des données."
            explainWrong="Comparer deux moyennes est parfaitement légitime, mais un écart de 0,05 min entre des séries dispersées de 3 à 9 min d’écart type n’a aucune signification pratique."
            solved={c1} onAnswered={() => setC1(true)}
          />
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : comparer deux séries" moduleSubtitle="Position ET dispersion, toujours les deux" estimatedTime="11 min"
      brief={{
        tag: 'Atelier', title: 'Deux nombres, pas un', tone: 'rose',
        body: <p>Comparer deux séries, c’est croiser un indicateur de position et un de dispersion — et savoir dire quand l’écart observé ne permet aucune conclusion. Les erreurs ne comptent pas ici.</p>,
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
