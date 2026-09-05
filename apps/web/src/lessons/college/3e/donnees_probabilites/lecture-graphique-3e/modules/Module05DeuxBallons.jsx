import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import { crossings, image, isReadingOk } from '../components/readingUtils';
import { BALLOON, BALLOON_2 } from '../components/balloonData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 5 — FORMALISATION : « Deux ballons, un croisement ».
 *
 * Activity: superposer deux vols et chercher les instants où les ballons sont
 *   à la même altitude.
 * Mathematical objective: un point d'intersection se LIT, et il répond à une
 *   question concrète (« quand sont-ils à la même hauteur ? »). C'est la
 *   résolution graphique d'une égalité, sans aucune algèbre.
 * Student action: promener la sonde et comparer les deux lectures.
 * Controlled variable: l'heure visée.
 * Mathematical state: deux courbes fixes ; `crossings` fournit les instants de
 *   rencontre, donc la correction ne peut pas diverger du dessin.
 * Visual consequence: aux croisements, les deux courbes se touchent ; ailleurs
 *   l'écart entre elles se voit et se lit.
 * Expected observation: « avant 2 h le second est plus haut, après il est plus
 *   bas ».
 * Misconception targeted: croire qu'un croisement signifie « même vitesse » ou
 *   « même trajectoire » ; et lire l'ordonnée du croisement quand on demande
 *   l'heure.
 * Feedback: explainFor cible la confusion heure/altitude au croisement.
 * Formalization: « résoudre graphiquement », nommé sur le geste déjà fait.
 * Scaffolding: croisement guidé → second croisement → interprétation.
 * Transfer: le module 6 pose une question de problème sur une courbe inconnue.
 *
 * NOTE — les deux courbes ne sont PAS affines : `curveIntersections` sur des
 * polylignes est donc indispensable, et le croisement ne peut pas se calculer
 * algébriquement. C'est ce qui distingue ce module des comparaisons de tarifs
 * des leçons voisines.
 */

const HITS = crossings(BALLOON, BALLOON_2);
const FIRST = HITS[0];

export default function Module05DeuxBallons() {
  const [x, setX] = useState(0);
  const [seenBefore, setSeenBefore] = useState(false);
  const [seenAfter, setSeenAfter] = useState(false);
  const [hourDone, setHourDone] = useState(false);
  const [meanDone, setMeanDone] = useState(false);
  const [countDone, setCountDone] = useState(false);

  const compared = seenBefore && seenAfter;

  const move = (v, kit) => {
    setX(v);
    if (v < FIRST.x) setSeenBefore(true);
    if (v > FIRST.x) setSeenAfter(true);
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Deux ballons, un croisement"
      moduleSubtitle="Là où les courbes se coupent, les deux altitudes sont égales."
      estimatedTime="9 min"
      brief={{
        tag: '🎈🎈 Mission 05',
        title: 'Une rivale entre en scène',
        tone: 'indigo',
        body: (
          <p>
            Un second ballon décolle de 600 m et descend, pendant que le premier monte.
            Quand seront-ils à la même altitude ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Compare les deux vols',
          subtitle: 'Promène la sonde avant, puis après leur rencontre.',
          done: compared,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curves={[
                  { id: 'b1', points: BALLOON, tone: 'sky', label: 'ballon A' },
                  { id: 'b2', points: BALLOON_2, tone: 'rose', label: 'ballon B' },
                ]}
                curve={BALLOON}
                mode="x"
                value={x}
                onChange={(v) => move(v, kit)}
                ariaLabel="Repère : deux vols superposés"
              />
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-lg bg-sky-100 p-2">
                  <p className="text-xs font-semibold text-sky-700">Ballon A à {formatDec(x)} h</p>
                  <p className="font-mono font-bold text-sky-900">{formatDec(image(BALLOON, x))} m</p>
                </div>
                <div className="rounded-lg bg-rose-100 p-2">
                  <p className="text-xs font-semibold text-rose-700">Ballon B à {formatDec(x)} h</p>
                  <p className="font-mono font-bold text-rose-900">{formatDec(image(BALLOON_2, x))} m</p>
                </div>
              </div>
              <Feedback tone={compared ? 'ok' : 'info'}>
                {compared ? (
                  <>
                    Avant la rencontre, B est au-dessus ; après, c’est A. Le point où les
                    courbes se coupent est exactement l’instant où l’écart s’annule.
                  </>
                ) : (
                  <>
                    Place la sonde <strong>avant</strong> puis <strong>après</strong> le point
                    où les deux courbes se croisent, et compare les deux altitudes.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'À quelle heure se croisent-ils ?',
          done: hourDone,
          content: (kit) => (
            <NumericQuestion
              prompt="À quelle heure les deux ballons sont-ils pour la première fois à la même altitude ?"
              expected={(n) => isReadingOk(FIRST.x, n, 0.5)}
              parse={parseDec}
              display={formatDec(FIRST.x)}
              suffix="h"
              explain={`À ${formatDec(FIRST.x)} h, les deux courbes se coupent : les deux ballons sont alors à ${formatDec(FIRST.y)} m. Le croisement se lit sur l'axe des heures.`}
              explainFor={(n) => {
                if (Math.abs(n - FIRST.y) < 60) return 'Tu as donné l’altitude du croisement. La question porte sur l’HEURE, lue sur l’axe horizontal.';
                return null;
              }}
              solved={hourDone}
              onAnswered={(ok) => { setHourDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Et à quelle altitude ?',
          done: meanDone,
          content: (kit) => (
            <NumericQuestion
              prompt="À cet instant, à quelle altitude sont-ils tous les deux ?"
              expected={(n) => isReadingOk(FIRST.y, n, 60)}
              parse={parseDec}
              display={formatDec(FIRST.y)}
              suffix="m"
              explain={`Au croisement, les deux ballons sont à ${formatDec(FIRST.y)} m. C'est la même valeur pour les deux — c'est justement ce que « se croiser » veut dire.`}
              explainFor={(n) => {
                if (Math.abs(n - FIRST.x) < 1) return 'Tu as redonné l’heure. On demande maintenant l’altitude commune.';
                return null;
              }}
              solved={meanDone}
              onAnswered={(ok) => { setMeanDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 4,
          title: 'Que dit un point d’intersection ?',
          done: countDone,
          content: (
            <TapQuestion
              prompt="Que signifie exactement un point d’intersection entre les deux courbes ?"
              options={[
                'À cet instant, les deux ballons sont à la même altitude',
                'Les deux ballons se touchent dans le ciel',
                'Les deux ballons montent à la même vitesse',
                'Les deux ballons ont parcouru la même distance',
              ]}
              correct={0}
              cols={1}
              explain="Un croisement ne dit rien de la position réelle des ballons dans le ciel, ni de leur vitesse : il dit que leurs deux altitudes coïncident à cet instant. Lire l’intersection, c’est résoudre graphiquement une égalité."
              explainWrong="Les deux courbes représentent des altitudes, pas des trajectoires. Se couper signifie que les deux valeurs sont égales à cette heure-là."
              solved={countDone}
              onAnswered={() => setCountDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>À retenir.</strong> Chercher où deux courbes se coupent, c’est résoudre
          graphiquement l’égalité de leurs deux valeurs. L’abscisse du point donne{' '}
          <em>quand</em>, l’ordonnée donne <em>combien</em>.
        </Feedback>
      }
    />
  );
}
