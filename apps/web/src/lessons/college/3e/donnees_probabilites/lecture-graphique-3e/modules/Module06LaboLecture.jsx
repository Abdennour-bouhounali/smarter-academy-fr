import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import {
  image, antecedents, maxOf, aboveThreshold, isReadingOk,
} from '../components/readingUtils';
import { DRONE } from '../components/balloonData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 6 — ATELIER : « Le labo de lecture ».
 *
 * Activity: répondre à des questions de terrain sur une courbe jamais vue, en
 *   n'ayant que le dessin.
 * Mathematical objective: transférer. Les questions sont posées en langage de
 *   situation (« combien de temps au-dessus de 600 m ? »), et c'est à l'élève
 *   de traduire en lecture graphique.
 * Student action: promener la sonde dans les deux modes selon la question.
 * Controlled variable: le mode et la valeur de la sonde.
 * Mathematical state: une courbe inconnue ; toutes les réponses viennent de
 *   `image`, `antecedents`, `maxOf` et `aboveThreshold`.
 * Visual consequence: le mode altitude fait apparaître d'un coup les deux
 *   instants où le drone franchit le seuil.
 * Expected observation: « la durée au-dessus du seuil, c'est l'écart entre les
 *   deux croisements ».
 * Misconception targeted: donner un instant quand on demande une durée ; et
 *   répondre par une altitude à une question de temps.
 * Feedback: explainFor cible ces deux confusions nommément.
 * Formalization: aucune ; c'est l'atelier de transfert.
 * Scaffolding: question directe → question de durée → question inversée.
 * Transfer: c'est le module de transfert de la leçon.
 */

const MAXP = maxOf(DRONE);
const ABOVE = aboveThreshold(DRONE, 600);
const DURATION = ABOVE.reduce((n, iv) => n + (iv.to - iv.from), 0);

export default function Module06LaboLecture() {
  const [mode, setMode] = useState('x');
  const [value, setValue] = useState(0);
  const [peakDone, setPeakDone] = useState(false);
  const [durDone, setDurDone] = useState(false);
  const [whenDone, setWhenDone] = useState(false);
  const [interpDone, setInterpDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le labo de lecture"
      moduleSubtitle="Une courbe inconnue, des questions concrètes, aucune formule."
      estimatedTime="10 min"
      brief={{
        tag: '🚁 Mission 06',
        title: 'Le vol du drone',
        tone: 'indigo',
        body: (
          <p>
            Un drone de surveillance a volé douze heures. Le pilote pose ses questions en
            français ; à toi de les traduire en lectures.
          </p>
        ),
      }}
      intro={
        <GraphProbe
          curve={DRONE}
          mode={mode}
          value={value}
          onChange={setValue}
          onModeChange={(m) => { setMode(m); setValue(m === 'y' ? 600 : 3); }}
          ariaLabel="Repère : le vol du drone, à sonder librement"
        />
      }
      steps={[
        {
          num: 1,
          title: 'Quelle altitude maximale ?',
          done: peakDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Jusqu’où le drone est-il monté ?"
              expected={(n) => isReadingOk(MAXP.y, n, 50)}
              parse={parseDec}
              display={formatDec(MAXP.y)}
              suffix="m"
              explain={`Le sommet de la courbe est à ${formatDec(MAXP.y)} m, atteint à ${formatDec(MAXP.x)} h.`}
              explainFor={(n) => {
                if (Math.abs(n - MAXP.x) < 1) return 'Tu as donné l’heure du sommet. On demande l’altitude qu’il y atteint.';
                return null;
              }}
              solved={peakDone}
              onAnswered={(ok) => { setPeakDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 2,
          title: 'Combien de temps au-dessus de 600 m ?',
          subtitle: 'Passe la sonde en mode « altitude » et pose-la sur 600.',
          done: durDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Pendant combien d’heures le drone est-il resté au-dessus de 600 m ?"
              expected={(n) => isReadingOk(DURATION, n, 0.6)}
              parse={parseDec}
              display={formatDec(DURATION)}
              suffix="h"
              explain={`Le drone franchit 600 m à ${formatDec(ABOVE[0].from)} h et repasse en dessous à ${formatDec(ABOVE[ABOVE.length - 1].to)} h : la durée est l'ÉCART entre ces deux instants, soit ${formatDec(DURATION)} h.`}
              explainFor={(n) => {
                if (isReadingOk(ABOVE[0].from, n, 0.4)) return 'Tu as donné l’heure du franchissement, pas la durée. La durée est la différence entre les deux instants.';
                if (n === 600) return 'Tu as redonné l’altitude du seuil. La question porte sur une durée, en heures.';
                return null;
              }}
              solved={durDone}
              onAnswered={(ok) => { setDurDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Quand était-il à 400 m ?',
          done: whenDone,
          content: (
            <TapQuestion
              prompt="À quels moments le drone est-il passé par 400 m ?"
              options={[
                'Quatre fois : à 2 h, 7 h et deux autres moments',
                'Une seule fois, en montant',
                'Deux fois : une en montant, une en descendant',
                'Jamais : 400 m n’est pas une graduation',
              ]}
              correct={0}
              cols={1}
              explain={`Le guide horizontal à 400 m coupe la courbe en ${antecedents(DRONE, 400).length} endroits : à ${antecedents(DRONE, 400).map((x) => `${formatDec(x)} h`).join(', ')}. Un profil qui monte, redescend et remonte multiplie les passages.`}
              explainWrong="Place la sonde en mode « altitude » sur 400 m et compte les points qui s’allument."
              solved={whenDone}
              onAnswered={() => setWhenDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'La question du pilote',
          done: interpDone,
          content: (
            <TapQuestion
              prompt="« Le drone a-t-il volé plus longtemps en montant ou en descendant ? » Comment répondre ?"
              options={[
                'En comparant la durée des périodes de montée et de descente sur l’axe des heures',
                'En comparant les altitudes maximale et minimale',
                'En comptant les points de la courbe',
                'Impossible sans connaître sa vitesse',
              ]}
              correct={0}
              cols={1}
              explain="Une question de durée se lit toujours sur l’axe horizontal : on additionne les longueurs des intervalles où la courbe monte, puis celles où elle descend. Les altitudes ne renseignent que sur la hauteur, jamais sur le temps."
              explainWrong="Les altitudes se lisent verticalement, les durées horizontalement. La question porte sur du temps."
              solved={interpDone}
              onAnswered={() => setInterpDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Répondre à un problème graphique, c’est d’abord décider <strong>sur quel axe</strong>{' '}
          la réponse se lit : une altitude verticalement, un instant ou une durée
          horizontalement.
        </Feedback>
      }
    />
  );
}
