import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import TruncatedLine from '../components/TruncatedLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEMPERATURE, RESERVOIR } from '../components/graphData';
import { detectFault, relativeSpread } from '../components/graphUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 6 — ATELIER : « Quatre graphiques à réparer ».
 *
 * Activity: diagnostiquer quatre graphiques défectueux et dire, pour chacun,
 *   ce qu'il faut changer.
 * Mathematical objective: faire de l'erreur un objet d'étude (pédagogie §12).
 *   Un graphique peut être faux de quatre façons distinctes, et trois d'entre
 *   elles ne comportent aucun nombre erroné.
 * Student action: examiner chaque graphique, nommer le défaut, choisir la
 *   correction.
 * Controlled variable: aucune manipulation continue ; le diagnostic est
 *   l'activité.
 * Mathematical state: quatre `spec` de défaut ; `detectFault` en donne le nom,
 *   donc la correction ne peut pas diverger de l'énoncé.
 * Visual consequence: chaque défaut est rendu avec le composant qui le permet —
 *   l'axe tronqué avec `TruncatedLine` (impossible en `CoordPlane`), les axes
 *   inversés avec un `CoordPlane` aux étiquettes échangées.
 * Expected observation: « rien n'est faux dans les nombres, et pourtant ça
 *   trompe ».
 * Misconception targeted: croire qu'un graphique est honnête parce que ses
 *   données sont exactes.
 * Feedback: le lot révèle chaque bonne réponse ; les explications nomment le
 *   défaut ET sa correction.
 * Formalization: la liste des quatre vérifications est posée en pied de module.
 * Scaffolding: défaut montré → défaut à nommer → vérifications listées.
 * Transfer: le boss reprend les quatre défauts dans d'autres contextes.
 *
 * NOTE — le module « le graphique qui ment » de 6e traitait l'axe tronqué. Ici
 * on ajoute le défaut proprement 3e : l'échelle qui APLATIT une variation
 * réelle, mesurée par `relativeSpread`.
 */

const SPREAD = relativeSpread(TEMPERATURE.rows.map((r) => r.y));
const SWAPPED_RANGE = { xMin: 0, xMax: 72, yMin: 0, yMax: 8 };
const GOOD_RANGE = { xMin: 0, xMax: 8, yMin: 0, yMax: 72 };
const MISPLACED = [
  { x: 0, y: 60 }, { x: 2, y: 45 }, { x: 4, y: 52 }, { x: 6, y: 15 },
];

export default function Module06AReparer() {
  const [tronqueDone, setTronqueDone] = useState(false);
  const [inverseDone, setInverseDone] = useState(false);
  const [malPlaceDone, setMalPlaceDone] = useState(false);
  const [echelleDone, setEchelleDone] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Quatre graphiques à réparer"
      moduleSubtitle="Axe tronqué, axes inversés, point égaré, échelle qui aplatit."
      estimatedTime="10 min"
      brief={{
        tag: '🔧 Mission 06',
        title: 'Le bureau des réclamations',
        tone: 'indigo',
        body: (
          <p>
            Quatre graphiques posent problème. Dans trois d’entre eux, aucun nombre n’est
            faux — et pourtant le lecteur est trompé.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Défaut n° 1',
          subtitle: 'Titre du journal : « la salle surchauffe ! »',
          done: tronqueDone,
          content: (
            <div className="space-y-3">
              <TruncatedLine
                rows={TEMPERATURE.rows}
                base={17}
                top={20}
                step={0.5}
                xLabel="h"
                yLabel="°C"
                ariaLabel="Graphique défectueux : axe vertical tronqué"
              />
              <TapQuestion
                prompt="Quel est le défaut de ce graphique ?"
                options={[
                  'L’axe vertical ne part pas de 0, ce qui exagère la hausse',
                  'Les points sont mal placés',
                  'Les axes sont inversés',
                  'Aucun : il est correct',
                ]}
                correct={0}
                cols={1}
                explain={`Les températures vont de 17,5 à 19,5 °C : ${formatDec(Math.round(SPREAD * 100))} % d'écart seulement. En partant de 17, la courbe grimpe d'un bord à l'autre du cadre. Réparation : partir de 0, ou signaler clairement la troncature.`}
                explainWrong="Regarde la graduation la plus basse de l’axe vertical : elle ne vaut pas 0."
                solved={tronqueDone}
                onAnswered={() => setTronqueDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Défaut n° 2',
          subtitle: 'Le réservoir, encore — mais quelque chose cloche.',
          done: inverseDone,
          content: (
            <div className="space-y-3">
              <CoordPlane
                range={SWAPPED_RANGE}
                unit={4}
                unitY={312 / (SWAPPED_RANGE.yMax - SWAPPED_RANGE.yMin)}
                xStep={12}
                yStep={1}
                points={RESERVOIR.rows.map((r, i) => ({ id: `s${i}`, x: r.y, y: r.x, color: '#e11d48' }))}
                axisLabels={{ x: 'L', y: 'min' }}
                ariaLabel="Graphique défectueux : axes inversés"
                caption={false}
              />
              <TapQuestion
                prompt="Quel est le défaut cette fois ?"
                options={[
                  'Les axes sont inversés : le temps devrait être en abscisse',
                  'L’échelle est trop grande',
                  'Il manque des points',
                  'Aucun : il est correct',
                ]}
                correct={0}
                cols={1}
                explain="Le volume dépend du temps, donc le temps va en abscisse. Ici c’est l’inverse : le graphique suggère que le temps dépendrait du volume. Réparation : échanger les deux axes."
                explainWrong="Regarde les noms des axes : « L » en horizontal, « min » en vertical. Laquelle des deux grandeurs dépend de l’autre ?"
                solved={inverseDone}
                onAnswered={() => setInverseDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Défaut n° 3',
          subtitle: 'La vidange était pourtant régulière.',
          done: malPlaceDone,
          content: (
            <div className="space-y-3">
              <CoordPlane
                range={GOOD_RANGE}
                unit={28}
                unitY={312 / (GOOD_RANGE.yMax - GOOD_RANGE.yMin)}
                xStep={1}
                yStep={12}
                curves={[{ id: 'm', points: MISPLACED, tone: 'sky' }]}
                points={MISPLACED.map((r, i) => ({ id: `m${i}`, x: r.x, y: r.y, color: i === 2 ? '#e11d48' : '#0284c7' }))}
                axisLabels={{ x: 'min', y: 'L' }}
                ariaLabel="Graphique défectueux : un point mal placé"
                caption={false}
              />
              <TapQuestion
                prompt="Le tableau indique 30 L à 4 minutes. Que faut-il corriger ?"
                options={[
                  'Le point à 4 min : il est placé à 52 L au lieu de 30 L',
                  'L’échelle de l’axe vertical',
                  'Le sens des axes',
                  'Rien : la courbe est correcte',
                ]}
                correct={0}
                cols={1}
                explain="Trois points sont alignés, le quatrième non : il a été posé à 52 au lieu de 30. Une rupture d’alignement dans une évolution régulière signale presque toujours une erreur de placement."
                explainWrong="Compare la courbe au tableau, ligne à ligne. Un des quatre points ne correspond pas."
                solved={malPlaceDone}
                onAnswered={() => setMalPlaceDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Défaut n° 4',
          subtitle: 'Le défaut inverse du premier.',
          done: echelleDone,
          content: (
            <div className="space-y-3">
              <TruncatedLine
                rows={TEMPERATURE.rows}
                base={0}
                top={240}
                step={40}
                xLabel="h"
                yLabel="°C"
                ariaLabel="Graphique défectueux : échelle beaucoup trop grande"
              />
              <TapQuestion
                prompt="Ici l’axe part bien de 0. Où est le problème ?"
                options={[
                  'L’échelle est bien trop grande : la variation devient invisible',
                  'L’axe est tronqué',
                  'Les points sont mal placés',
                  'Aucun : partir de 0 est toujours correct',
                ]}
                correct={0}
                cols={1}
                explain="L’axe monte jusqu’à 240 °C pour des valeurs autour de 19 : la courbe est écrasée sur le bas et paraît plate. Partir de 0 ne suffit pas — encore faut-il que l’échelle soit adaptée à l’étendue des données."
                explainWrong="Aucun nombre n’est faux et l’axe part de 0. Regarde jusqu’où monte l’axe par rapport aux valeurs représentées."
                solved={echelleDone}
                onAnswered={() => setEchelleDone(true)}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'Les quatre vérifications',
          done: checkDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">À quoi sert chaque vérification ?</p>}
              rows={[
                { id: 'v1', label: 'Regarder d’où part l’axe vertical', options: ['détecter la troncature', 'détecter un point égaré'], correct: 0,
                  correction: 'Un axe qui ne part pas de 0 exagère les écarts.' },
                { id: 'v2', label: 'Regarder les noms des deux axes', options: ['détecter la troncature', 'détecter une inversion'], correct: 1,
                  correction: 'La grandeur dont l’autre dépend doit être en abscisse.' },
                { id: 'v3', label: 'Comparer chaque point au tableau', options: ['détecter un point égaré', 'détecter une échelle trop grande'], correct: 0,
                  correction: 'C’est la seule vérification qui attrape une erreur de placement.' },
                { id: 'v4', label: 'Comparer l’étendue des données au haut de l’axe', options: ['détecter une inversion', 'détecter une échelle inadaptée'], correct: 1,
                  correction: 'Un axe montant bien au-delà des données aplatit la courbe.' },
              ]}
              feedback={({ allRight, nCorrect, total }) =>
                allRight
                  ? <>Les quatre. Ces vérifications se font <strong>avant</strong> de lire la courbe, pas après.</>
                  : <>{nCorrect} sur {total}. Chaque défaut a son propre indice : le départ de l’axe, les noms, les points, l’étendue.</>
              }
              solved={checkDone}
              onAnswered={() => setCheckDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>Avant de croire un graphique.</strong> D’où part l’axe · qui est en abscisse ·
          les points correspondent-ils au tableau · l’échelle est-elle adaptée. Trois de ces
          quatre défauts n’altèrent aucun nombre.
        </Feedback>
      }
    />
  );
}
