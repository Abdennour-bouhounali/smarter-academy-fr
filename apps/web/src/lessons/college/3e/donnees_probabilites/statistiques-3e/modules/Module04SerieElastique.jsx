import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DotPlot from '../components/DotPlot';
import { mean, median, range, sortSeries } from '../components/statUtils';
import { TRAJETS, AXE } from '../components/trajetData';
import { formatDec, roundTo } from '@smarter-academy/core';

/**
 * Module 4 — MANIPULATION SIGNATURE : « La série élastique ».
 *
 * Activity: tirer une seule valeur vers l'extrême et regarder les trois
 *   indicateurs réagir — chacun à sa façon.
 * Mathematical objective: établir que les indicateurs ne sont pas
 *   interchangeables. Déplacer une valeur de Δ décale la moyenne de Δ/n
 *   TOUJOURS, alors que la médiane peut ne pas bouger du tout, et que l'étendue
 *   ne bouge que si on touche un extrême.
 * Student action: choisir une pastille, puis la tirer le long de l'axe.
 * Controlled variable: la valeur sélectionnée.
 * Mathematical state: `values` appartient au module ; moyenne, médiane et
 *   étendue sont recalculées à chaque rendu — aucune ne peut se désynchroniser.
 * Visual consequence: le triangle bleu de la moyenne glisse tandis que le trait
 *   vert de la médiane reste immobile. Les trois lectures sont côte à côte.
 * Expected observation: « je n'ai bougé qu'une valeur, et seule la moyenne a
 *   suivi ».
 * Misconception targeted: « moyenne et médiane, c'est pareil » ; et l'idée
 *   qu'une valeur extrême serait « une erreur » plutôt qu'une donnée qui pèse.
 * Feedback: les écarts depuis l'état initial sont affichés en permanence, avec
 *   leur signe.
 * Formalization: la règle est nommée à l'étape 3, après l'avoir constatée.
 * Scaffolding: prédiction → manipulation libre → généralisation.
 * Transfer: le module 6 s'en sert pour comparer deux classes.
 */

const M0 = mean(TRAJETS);
const MED0 = median(TRAJETS);
const RNG0 = range(TRAJETS);
const FAR_INDEX = TRAJETS.indexOf(Math.max(...TRAJETS));   // le trajet le plus long

export default function Module04SerieElastique() {
  const [values, setValues] = useState(TRAJETS);
  const [active, setActive] = useState(FAR_INDEX);
  const [predicted, setPredicted] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);
  const [midDone, setMidDone] = useState(false);

  const m = mean(values);
  const med = median(values);
  const rng = range(values);
  const dMean = roundTo(m - M0, 2);
  const dMed = roundTo(med - MED0, 2);
  const dRng = roundTo(rng - RNG0, 2);

  // On veut que l'élève ait VU la moyenne bouger sans que la médiane suive.
  const [sawDivergence, setSawDivergence] = useState(false);

  const change = (i, v, kit) => {
    if (values[i] === v) return;
    const next = [...values];
    next[i] = v;
    setValues(next);
    if (roundTo(mean(next) - M0, 2) !== 0 && median(next) === MED0) setSawDivergence(true);
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La série élastique"
      moduleSubtitle="Tire une valeur vers l’extrême : un indicateur suit, l’autre non."
      estimatedTime="11 min"
      brief={{
        tag: '🧲 Mission 04',
        title: 'Un déménagement change tout ?',
        tone: 'indigo',
        body: (
          <p>
            Un élève déménage plus loin : son trajet s’allonge. Une seule valeur bouge — mais
            que deviennent les trois indicateurs ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de tirer',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Si l’élève le plus éloigné double son temps de trajet, que se passe-t-il ?"
              options={[
                'La moyenne augmente, la médiane ne bouge pas',
                'Les deux augmentent de la même façon',
                'Aucun des deux ne bouge',
                'La médiane augmente, la moyenne ne bouge pas',
              ]}
              correct={0}
              cols={1}
              explain="La moyenne partage le total : allonger un trajet augmente le total, donc la moyenne. La médiane, elle, ne regarde que le RANG des valeurs — et le plus éloigné reste le plus éloigné."
              explainWrong="Tu vas pouvoir le vérifier juste en dessous : garde l’œil sur le trait vert de la médiane pendant que tu tires."
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Tire une valeur et observe',
          subtitle: 'Choisis une pastille, puis déplace-la sur l’axe.',
          done: sawDivergence,
          content: (kit) => (
            <div className="space-y-3">
              <DotPlot
                values={values}
                min={AXE.min}
                max={AXE.max}
                step={AXE.step}
                mode="drag"
                activeIndex={active}
                onActiveChange={setActive}
                onChange={(i, v) => change(i, v, kit)}
                showMean
                showMedian
                showRange
                ariaLabel="Axe : tire une valeur et observe les indicateurs"
              />
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-sky-100 p-2">
                  <p className="text-xs font-semibold text-sky-700">Moyenne</p>
                  <p className="font-mono font-bold text-sky-900">{formatDec(roundTo(m, 2))}</p>
                  <p className="text-xs text-sky-700">{dMean === 0 ? 'inchangée' : `${dMean > 0 ? '+' : ''}${formatDec(dMean)}`}</p>
                </div>
                <div className="rounded-lg bg-emerald-100 p-2">
                  <p className="text-xs font-semibold text-emerald-700">Médiane</p>
                  <p className="font-mono font-bold text-emerald-900">{formatDec(med)}</p>
                  <p className="text-xs text-emerald-700">{dMed === 0 ? 'inchangée' : `${dMed > 0 ? '+' : ''}${formatDec(dMed)}`}</p>
                </div>
                <div className="rounded-lg bg-violet-100 p-2">
                  <p className="text-xs font-semibold text-violet-700">Étendue</p>
                  <p className="font-mono font-bold text-violet-900">{formatDec(rng)}</p>
                  <p className="text-xs text-violet-700">{dRng === 0 ? 'inchangée' : `${dRng > 0 ? '+' : ''}${formatDec(dRng)}`}</p>
                </div>
              </div>
              <Feedback tone={sawDivergence ? 'ok' : 'info'}>
                {sawDivergence ? (
                  <>
                    Le voilà, le point clé : la moyenne a bougé de{' '}
                    <strong>{dMean > 0 ? '+' : ''}{formatDec(dMean)}</strong> pendant que la
                    médiane restait <strong>immobile</strong>. Un seul élève a suffi à
                    déplacer la moyenne de toute la classe.
                  </>
                ) : (
                  <>
                    Déplace une valeur jusqu’à ce que la moyenne change{' '}
                    <strong>sans</strong> que la médiane bouge. Essaie avec une valeur
                    située à l’une des extrémités.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 3,
          title: 'Pourquoi la médiane résiste-t-elle ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Pourquoi la médiane ne bouge-t-elle pas quand on éloigne la plus grande valeur ?"
              options={[
                'Parce qu’elle ne dépend que du rang des valeurs, pas de leur taille',
                'Parce qu’elle est toujours égale à la moyenne',
                'Parce que la plus grande valeur est ignorée dans son calcul',
                'C’est un hasard, avec d’autres nombres elle bougerait',
              ]}
              correct={0}
              cols={1}
              explain="La médiane est la valeur du milieu une fois la série rangée : elle regarde l’ORDRE, pas les distances. Éloigner le maximum ne change pas son rang, donc la médiane reste. La moyenne, elle, additionne toutes les valeurs : chacune pèse."
              explainWrong="La plus grande valeur n’est pas ignorée : elle occupe toujours la dernière place. C’est justement que seule sa PLACE compte pour la médiane."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Et si on déplace une valeur du milieu ?',
          done: midDone,
          content: (
            <TapQuestion
              prompt="Cette fois on modifie légèrement une valeur centrale, sans changer son rang. Que se passe-t-il ?"
              options={[
                'La moyenne bouge un peu, la médiane peut bouger aussi',
                'Rien ne bouge : ce n’est pas un extrême',
                'Seule l’étendue change',
                'Seule la médiane change',
              ]}
              correct={0}
              cols={1}
              explain="Toute valeur déplacée modifie la moyenne — de Δ ÷ effectif, sans exception. Une valeur centrale peut en plus déplacer la médiane, puisqu’elle est justement au milieu. L’étendue, elle, ne bouge que si on touche un extrême."
              explainWrong="La moyenne réagit à TOUT déplacement, même minime : elle additionne les douze valeurs."
              solved={midDone}
              onAnswered={() => setMidDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>La règle.</strong> Déplacer une valeur de Δ décale la moyenne de Δ divisé
          par l’effectif — toujours. La médiane ne bouge que si le déplacement change l’ordre.
          L’étendue ne bouge que si on touche un extrême.
        </Feedback>
      }
    />
  );
}
