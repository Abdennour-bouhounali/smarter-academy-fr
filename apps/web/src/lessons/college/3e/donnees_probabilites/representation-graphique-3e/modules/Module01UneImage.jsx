import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { BATTERIE } from '../components/graphData';
import { describeError } from '../components/graphUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 1 — DÉCLENCHEUR : « Une image vaut cinq lignes » (manipulation signature).
 *
 * Activity: transformer soi-même un tableau de mesures en points, relier,
 *   prolonger — et voir la courbe répondre à une question que le tableau ne
 *   pose même pas.
 * Mathematical objective: faire naître le besoin d'un graphique : chaque
 *   ligne du tableau EST un point, et une fois les points posés la TENDANCE
 *   apparaît et permet de prévoir.
 * Student action: prédire la forme ; déplacer le point (doigt ou flèches) et
 *   le poser ; relier ; prédire l'heure de la panne ; prolonger le trait.
 * Controlled variable: la position du point courant, sur les nœuds de la
 *   grille (tout tombe sur une graduation — la difficulté du placement entre
 *   deux graduations est réservée au module 3).
 * Mathematical state: { placed[] } comparé à BATTERIE.rows ; l'écart est
 *   calculé par `describeError`, la correction ne peut donc pas diverger.
 * Visual consequence: la ligne du tableau en cours s'allume en ambre ; le
 *   point posé se fige en vert ; les points s'alignent ; le trait prolongé
 *   touche 0 % exactement à 5 h.
 * Expected observation: « les points sont alignés en descendant — et le trait
 *   dit quand la batterie sera vide ».
 * Misconception targeted: « un graphique, c'est décoratif » ; « les axes
 *   sont interchangeables ».
 * Feedback: l'écart est dit en mots (« 1 vers la droite »), jamais jugé ;
 *   échappée après 3 essais ; chaque QCM révèle sa règle.
 * Formalization: le vocabulaire des axes est posé à l'étape 4, après usage.
 * Scaffolding: prédiction → placement (cible affichée sur le premier point
 *   seulement) → relier/prolonger → axes nommés.
 * Transfer: le module 2 montre que la même courbe peut mentir selon l'échelle ;
 *   le module 4 fait CHOISIR l'échelle — ici elle est donnée.
 */

const DATA = BATTERIE;
const TARGETS = DATA.rows;
const RANGE = { xMin: 0, xMax: 6, yMin: 0, yMax: 100 };
const Y_STEP = 20;
const UNIT = 34;
const UNIT_Y = 240 / (RANGE.yMax - RANGE.yMin);
const EMPTY_AT = 5;                       // heure où le trait prolongé touche 0 %

export default function Module01UneImage() {
  const [shapeDone, setShapeDone] = useState(false);
  const [cur, setCur] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [joined, setJoined] = useState(false);
  const [emptyDone, setEmptyDone] = useState(false);
  const [extended, setExtended] = useState(false);
  const [axesDone, setAxesDone] = useState(false);

  const idx = placed.length;
  const target = idx < TARGETS.length ? TARGETS[idx] : null;
  const done2 = placed.length === TARGETS.length || revealed;
  const done3 = extended;

  const validate = (kit) => {
    if (done2 || !target) return;
    if (cur.x === target.x && cur.y === target.y) {
      setPlaced((p) => [...p, { x: cur.x, y: cur.y }]);
      setWrong(null);
      kit.react(true);
    } else {
      setWrong({ placed: { ...cur }, target });
      setTries((t) => t + 1);
      kit.react(false);
    }
  };

  const table = (highlight) => (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Charge de la batterie selon l’heure</caption>
        <tbody>
          <tr>
            <th scope="row" className="text-left pr-2 font-semibold text-slate-600">Temps (h)</th>
            {TARGETS.map((r, i) => (
              <td key={`x${r.x}`} className={`px-3 text-center font-mono tabular-nums ${highlight === i ? 'bg-amber-100 rounded font-bold' : ''} ${highlight !== null && i < highlight ? 'text-emerald-700' : ''}`}>
                {formatDec(r.x)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="text-left pr-2 font-semibold text-slate-600">Charge (%)</th>
            {TARGETS.map((r, i) => (
              <td key={`y${r.x}`} className={`px-3 text-center font-mono tabular-nums ${highlight === i ? 'bg-amber-100 rounded font-bold' : ''} ${highlight !== null && i < highlight ? 'text-emerald-700' : ''}`}>
                {formatDec(r.y)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const last = TARGETS[TARGETS.length - 1];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Une image vaut cinq lignes"
      moduleSubtitle="Cinq mesures dans un tableau. Mets-les en points : que voit-on de plus ?"
      estimatedTime="7 min"
      brief={{
        tag: '📱 Mission 01',
        title: 'La batterie qui se vide',
        tone: 'indigo',
        body: (
          <p>
            On relève la charge du téléphone toutes les heures. Le tableau donne les nombres.
            À toi de les transformer en image — et de voir ce que l’image dit en plus.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis la forme',
          subtitle: 'Avant de placer quoi que ce soit.',
          done: shapeDone,
          content: (
            <TapQuestion
              prompt="Une fois ces cinq lignes posées dans un repère, quelle forme vont dessiner les points ?"
              above={table(null)}
              options={[
                'Alignés, en descendant',
                'Alignés, en montant',
                'Une courbe qui se creuse',
                'Éparpillés au hasard',
              ]}
              correct={0}
              cols={2}
              explain="La charge perd 20 % à chaque heure, toujours le même pas : les points vont donc s’aligner en descendant. Tu vas le vérifier en les posant."
              explainWrong="Regarde la ligne du bas : −20, −20, −20, −20. Un pas régulier vers le bas donne des points alignés qui descendent. Pose-les pour le voir."
              solved={shapeDone}
              onAnswered={() => setShapeDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Place les cinq relevés',
          subtitle: 'Déplace le point jusqu’à la ligne allumée, puis pose-le.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              {table(done2 ? TARGETS.length : idx)}
              <CoordPlane
                range={RANGE}
                unit={UNIT}
                unitY={UNIT_Y}
                xStep={1}
                yStep={Y_STEP}
                step={{ x: 1, y: Y_STEP }}
                points={[
                  ...placed.map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: '#059669' })),
                  ...(done2 ? [] : [{ id: 'M', name: 'M', x: cur.x, y: cur.y, color: '#4f46e5' }]),
                ]}
                draggableId={done2 ? null : 'M'}
                onPointChange={(p) => { setCur(p); setWrong(null); }}
                target={!done2 && target && placed.length === 0 ? target : null}
                ghost={wrong ? { ...wrong.target, label: 'ici' } : null}
                axisLabels={{ x: 'h', y: '%' }}
                ariaLabel="Repère : placer la charge de la batterie heure par heure"
                caption={!done2}
              />
              {!done2 && (
                <>
                  <button
                    type="button"
                    onClick={() => validate(kit)}
                    className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Poser le point ({formatDec(target.x)} ; {formatDec(target.y)})
                  </button>
                  <Feedback tone={wrong ? 'ko' : 'info'}>
                    {wrong ? (
                      <>Ton point est à {describeError(wrong.placed, wrong.target)} de la position demandée.</>
                    ) : (
                      <>
                        Ligne allumée : à <strong>{formatDec(target.x)} h</strong>, <strong>{formatDec(target.y)} %</strong>.
                        L’heure se lit sur l’axe horizontal, la charge sur l’axe vertical.
                        Il reste {TARGETS.length - placed.length} point{TARGETS.length - placed.length > 1 ? 's' : ''}.
                      </>
                    )}
                  </Feedback>
                  {tries >= 3 && (
                    <button
                      type="button"
                      onClick={() => { setPlaced(TARGETS.map((t) => ({ ...t }))); setRevealed(true); setWrong(null); kit.react(false); }}
                      className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Je ne trouve pas — montre-moi les points
                    </button>
                  )}
                </>
              )}
              {done2 && (
                <Feedback tone={revealed ? 'info' : 'ok'}>
                  {revealed ? 'On te les montre. ' : 'Les cinq points sont posés. '}
                  Chaque ligne du tableau est devenue <strong>un point</strong> — et les cinq points
                  sont alignés en descendant, comme la ligne du bas le laissait deviner.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Relie, puis prolonge',
          subtitle: 'Ce que le tableau ne dit pas, le trait le dit.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                unit={UNIT}
                unitY={UNIT_Y}
                xStep={1}
                yStep={Y_STEP}
                points={TARGETS.map((p, i) => ({ id: `q${i}`, x: p.x, y: p.y, color: '#059669' }))}
                curves={[
                  ...(joined ? [{ id: 'trace', points: TARGETS, tone: 'emerald' }] : []),
                  ...(extended ? [{ id: 'ext', points: [last, { x: EMPTY_AT, y: 0 }], tone: 'rose', dashed: true }] : []),
                ]}
                ghost={extended ? { x: EMPTY_AT, y: 0, label: 'vide' } : null}
                axisLabels={{ x: 'h', y: '%' }}
                ariaLabel={`Repère : la charge de la batterie${joined ? ', points reliés' : ''}${extended ? `, trait prolongé jusqu’à ${EMPTY_AT} h` : ''}`}
                caption={false}
              />
              {!joined && (
                <button
                  type="button"
                  onClick={() => { setJoined(true); kit.react(true); }}
                  className="w-full min-h-[48px] rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }}
                >
                  Relier les points
                </button>
              )}
              {joined && (
                <TapQuestion
                  prompt="Si la batterie continue de se vider au même rythme, quand sera-t-elle à 0 % ?"
                  options={[`À ${EMPTY_AT} h`, 'À 6 h', 'À 4 h', 'On ne peut pas le savoir']}
                  correct={0}
                  cols={2}
                  explain={`À 4 h il reste 20 %, et la charge perd 20 % par heure : 0 % à ${EMPTY_AT} h. Prolonger le trait du regard suffit — c’est ce qu’un graphique permet et qu’un tableau ne dit pas.`}
                  explainWrong="Suis l’alignement des points jusqu’à l’axe horizontal : c’est là que la charge atteint 0 %. Prolonge le trait pour le voir."
                  solved={emptyDone}
                  onAnswered={() => setEmptyDone(true)}
                />
              )}
              {emptyDone && !extended && (
                <button
                  type="button"
                  onClick={() => { setExtended(true); kit.react(true); }}
                  className="w-full min-h-[48px] rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }}
                >
                  Prolonger le trait jusqu’à 0 %
                </button>
              )}
              {extended && (
                <Feedback tone="ok">
                  Le trait prolongé touche l’axe horizontal à <strong>{EMPTY_AT} h</strong>. Le
                  tableau s’arrêtait à 4 h ; l’image, elle, <strong>prévoit</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Qui va où ?',
          done: axesDone,
          content: (
            <TapQuestion
              prompt="Pourquoi le temps est-il sur l’axe horizontal, et pas la charge ?"
              options={[
                'Parce que la charge dépend du temps, et non l’inverse',
                'Parce que c’est plus joli ainsi',
                'Parce que le temps est toujours plus petit',
                'On peut mettre l’un ou l’autre indifféremment',
              ]}
              correct={0}
              cols={1}
              explain="L’axe horizontal — les abscisses — porte la grandeur dont l’autre dépend. La charge dépend du temps écoulé, donc le temps va en abscisse et la charge en ordonnée. Échanger les deux raconterait l’histoire à l’envers."
              explainWrong="Ce n’est pas une question de goût : c’est la dépendance entre les deux grandeurs qui décide."
              solved={axesDone}
              onAnswered={() => setAxesDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Un graphique montre la <strong>tendance</strong> et permet de prévoir. Encore
          faut-il l’avoir bien construit : l’<strong>échelle</strong> peut tout changer, et
          c’est le module suivant.
        </Feedback>
      }
    />
  );
}
