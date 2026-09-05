import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DotPlot from '../components/DotPlot';
import { mean, median, range, effectifs, weightedMean } from '../components/statUtils';
import { TRAJETS, AXE } from '../components/trajetData';
import { formatDec, roundTo } from '@smarter-academy/core';

/**
 * Module 5 — FORMALISATION : « Trois indicateurs ».
 *
 * Activity: mettre côte à côte ce que chaque indicateur dit, puis choisir
 *   lequel répond à une question donnée.
 * Mathematical objective: fixer les trois définitions sur des gestes déjà faits
 *   et introduire le CHOIX : la question détermine l'indicateur, pas l'inverse.
 * Student action: lire la synthèse, puis apparier questions et indicateurs.
 * Controlled variable: aucune manipulation continue — c'est le module qui
 *   nomme ce que les précédents ont fait éprouver.
 * Mathematical state: la série des trajets, figée, avec ses trois indicateurs
 *   calculés ; le tableau d'effectifs sert à montrer la moyenne pondérée.
 * Visual consequence: les trois repères sont affichés ENSEMBLE sur le même axe,
 *   ce qui rend leur écart visible d'un coup.
 * Expected observation: « ils ne tombent pas au même endroit ».
 * Misconception targeted: croire qu'un indicateur est « le bon » dans l'absolu ;
 *   et calculer une moyenne en oubliant les effectifs.
 * Feedback: le lot révèle la bonne réponse de chaque ligne.
 * Formalization: c'est le cœur du module.
 * Scaffolding: synthèse visuelle → moyenne pondérée → choix d'indicateur.
 * Transfer: le module 6 met ce choix à l'épreuve sur deux classes.
 */

const M = roundTo(mean(TRAJETS), 2);
const MED = median(TRAJETS);
const RNG = range(TRAJETS);
const EFF = effectifs(TRAJETS);

export default function Module05TroisIndicateurs() {
  const [gapDone, setGapDone] = useState(false);
  const [weightDone, setWeightDone] = useState(false);
  const [chooseDone, setChooseDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Trois indicateurs"
      moduleSubtitle="Ce que chacun dit, ce qu’aucun ne dit, et quand les utiliser."
      estimatedTime="9 min"
      brief={{
        tag: '📐 Mission 05',
        title: 'Trois façons de résumer',
        tone: 'indigo',
        body: (
          <p>
            Moyenne, médiane, étendue : la même série, trois chiffres différents. Il est
            temps de leur donner leur nom exact et de savoir lequel choisir.
          </p>
        ),
      }}
      intro={
        <div className="space-y-3">
          <DotPlot
            values={TRAJETS}
            min={AXE.min}
            max={AXE.max}
            step={AXE.step}
            mode="display"
            showMean
            showMedian
            showRange
            ariaLabel="Axe : les trois indicateurs de la série des trajets"
          />
          <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white p-4 space-y-2">
            <p className="font-bold">🔑 À retenir</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>
                La <strong>moyenne</strong> ({formatDec(M)} min) partage équitablement : somme
                des valeurs divisée par l’effectif. Toute valeur pèse.
              </li>
              <li>
                La <strong>médiane</strong> ({formatDec(MED)} min) partage l’effectif : autant
                en dessous qu’au-dessus. Seul l’ordre compte.
              </li>
              <li>
                L’<strong>étendue</strong> ({formatDec(RNG)} min) mesure la dispersion : écart
                entre le maximum et le minimum.
              </li>
            </ul>
          </div>
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Pourquoi ne tombent-ils pas au même endroit ?',
          done: gapDone,
          content: (
            <TapQuestion
              prompt={<>Ici la moyenne ({formatDec(M)} min) dépasse la médiane ({formatDec(MED)} min). Pourquoi ?</>}
              options={[
                'Quelques trajets très longs tirent la moyenne vers le haut',
                'Il y a plus d’élèves au-dessus de la médiane',
                'La médiane a été mal calculée',
                'C’est toujours le cas, dans toutes les séries',
              ]}
              correct={0}
              cols={1}
              explain="Les trajets de 30 et 35 min pèsent dans la somme, donc dans la moyenne, alors qu’ils ne comptent que pour deux rangs dans la médiane. Quand une série a des valeurs extrêmes d’un côté, la moyenne se déplace de ce côté — pas la médiane."
              explainWrong="Par construction, la médiane a exactement autant d’élèves de part et d’autre. Ce sont les VALEURS extrêmes, pas leur nombre, qui déplacent la moyenne."
              solved={gapDone}
              onAnswered={() => setGapDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Calculer avec les effectifs',
          done: weightDone,
          content: (
            <TapQuestion
              prompt="Pour calculer la moyenne à partir du tableau d’effectifs, que faut-il faire ?"
              above={
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Effectifs des temps de trajet</caption>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-left pr-2 font-semibold text-slate-600">Temps (min)</th>
                        {EFF.map((e) => <td key={`v${e.value}`} className="px-2 text-center font-mono">{formatDec(e.value)}</td>)}
                      </tr>
                      <tr>
                        <th scope="row" className="text-left pr-2 font-semibold text-slate-600">Effectif</th>
                        {EFF.map((e) => <td key={`c${e.value}`} className="px-2 text-center font-mono">{e.count}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              }
              options={[
                'Multiplier chaque temps par son effectif, additionner, puis diviser par 12',
                'Additionner les neuf temps, puis diviser par 9',
                'Additionner les effectifs, puis diviser par 9',
                'Prendre le temps dont l’effectif est le plus grand',
              ]}
              correct={0}
              cols={1}
              explain={`Chaque temps doit compter autant de fois qu'il y a d'élèves : 15 compte trois fois, pas une. On obtient ${formatDec(roundTo(weightedMean(EFF), 2))} min — la même moyenne que sur la liste complète. Oublier les effectifs revient à faire voter chaque valeur une seule fois.`}
              explainWrong="Diviser par 9 (le nombre de temps différents) reviendrait à ignorer que trois élèves mettent 15 min. C’est l’effectif total, 12, qui doit servir de diviseur."
              solved={weightDone}
              onAnswered={() => setWeightDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Quel indicateur pour quelle question ?',
          done: chooseDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">À chaque question, l’indicateur qui y répond.</p>}
              rows={[
                { id: 'q1', label: '« Combien de temps met un élève typique ? »',
                  options: ['moyenne', 'médiane', 'étendue'], correct: 1,
                  correction: 'La médiane : elle n’est pas déformée par les quelques élèves très éloignés.' },
                { id: 'q2', label: '« Combien de temps la classe passe-t-elle en transport au total ? »',
                  options: ['moyenne', 'médiane', 'étendue'], correct: 0,
                  correction: 'La moyenne : multipliée par l’effectif, elle redonne exactement le total.' },
                { id: 'q3', label: '« Les élèves habitent-ils tous à peu près à la même distance ? »',
                  options: ['moyenne', 'médiane', 'étendue'], correct: 2,
                  correction: 'L’étendue : elle mesure l’écart entre les cas extrêmes.' },
                { id: 'q4', label: '« Un élève met 40 min : est-ce beaucoup pour cette classe ? »',
                  options: ['moyenne', 'médiane', 'étendue'], correct: 1,
                  correction: 'La médiane situe l’élève par rapport à la moitié de la classe.' },
              ]}
              feedback={({ allRight, nCorrect, total }) =>
                allRight
                  ? <>Les quatre. Aucun indicateur n’est « le bon » : c’est la <strong>question</strong> qui décide.</>
                  : <>{nCorrect} sur {total}. Demande-toi ce que la question cherche : un total, un cas typique, ou un écart.</>
              }
              solved={chooseDone}
              onAnswered={() => setChooseDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Un indicateur résume — donc il <strong>perd</strong> de l’information. Le choisir,
          c’est décider quelle information on accepte de perdre.
        </Feedback>
      }
    />
  );
}
