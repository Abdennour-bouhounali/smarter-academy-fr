import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AbsMachine from '../components/AbsMachine';

/**
 * Module 2 — DISCOVERY : « Calculer |x| ».
 * Activity: entrer des nombres dans la machine à deux règles ; lire la règle
 *   utilisée ; comprendre pourquoi −x est positif quand x est négatif.
 * Mathematical objective: |x| = x si x ≥ 0 ; |x| = −x si x < 0 ; |0| = 0 ;
 *   |x| = |−x|.
 * Misconception targeted: « |−3| = −3 », « −x est toujours négatif »,
 *   « −|−3| = 3 ».
 */
const CHIPS = [3, -3, -0.5, 0, -12.75, 7.2];

export default function Module02CalculerValeurAbsolue() {
  const [trials, setTrials] = useState([]);
  const [whyDone, setWhyDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const negDone = trials.some((t) => t < 0);
  const posDone = trials.some((t) => t > 0);
  const zeroDone = trials.includes(0);
  const machineDone = negDone && posDone && zeroDone && trials.length >= 4;

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Calculer |x|"
      moduleSubtitle="Une machine à deux règles : si x ≥ 0 elle rend x, sinon elle rend −x. Pourquoi −x est-il positif ?"
      estimatedTime="7 min"
      brief={{ tag: '⚙️ Mission 02', title: 'Sans dessiner la côte : une machine qui rend la distance à 0.', tone: 'indigo', body: <p>Entre des nombres positifs, négatifs, 0, et regarde quelle règle s’allume.</p> }}
      steps={[
        {
          num: 1, title: 'Fais tourner la machine', subtitle: 'Au moins un positif, un négatif, et 0.', done: machineDone,
          content: (kit) => (
            <div className="space-y-3">
              <AbsMachine trials={trials} chips={CHIPS} onTry={(n) => { if (trials.length >= 12) return; setTrials([...trials, n]); if (n < 0 && !negDone) kit.react(true); }} />
              {machineDone ? (
                <Feedback tone="ok">Pour un négatif, la machine rend <strong>−x</strong> : l’opposé. −(−12,75) = 12,75, un nombre positif — le signe « − » devant x ne veut pas dire « négatif », il veut dire « l’opposé de ». Pour 0 : |0| = 0, la seule valeur absolue nulle.</Feedback>
              ) : (
                <Feedback tone="info">{!negDone ? 'Entre un nombre négatif : quelle règle s’allume ?' : !posDone ? 'Et un positif ?' : !zeroDone ? 'Et 0 ?' : 'Encore un essai, celui que tu veux — −4,5 par exemple.'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Pourquoi −x est positif ?', done: whyDone,
          content: (
            <TapQuestion
              prompt="Si x = −8, combien vaut −x ?"
              options={['−8', '8', 'On ne peut pas savoir']} cols={3} correct={1}
              explain="−x est l’opposé de x. L’opposé de −8 est 8 : quand x est négatif, −x est positif. C’est pour cela que la règle 2 rend bien une distance positive."
              explainWrong="« −x » ne signifie pas « un nombre négatif » mais « l’opposé de x ». Si x = −8, son opposé est 8 : −x = −(−8) = 8."
              solved={whyDone} onAnswered={() => setWhyDone(true)} />
          ),
        },
        {
          num: 3, title: 'Calcule', done: batchDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'r1', label: '|−3|', options: ['−3', '3'], correct: 1 },
                { id: 'r2', label: '−|−3|', options: ['−3', '3'], correct: 0, correction: 'd’abord |−3| = 3, puis l’opposé : −3.' },
                { id: 'r3', label: '|3 − 5|', options: ['−2', '2'], correct: 1, correction: '3 − 5 = −2, puis |−2| = 2.' },
                { id: 'r4', label: '|x| pour x = −2,5', options: ['−2,5', '2,5'], correct: 1 },
                { id: 'r5', label: '|−6| − |6|', options: ['0', '−12'], correct: 0, correction: '6 − 6 = 0 : opposés, même distance.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Cinq sur cinq.' : `${nCorrect} / ${total}.`} On calcule d’abord ce qu’il y a ENTRE les barres, puis on prend la distance à 0 ; un signe − devant les barres s’applique après.</Feedback>}
              solved={batchDone} onAnswered={() => setBatchDone(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok"><strong>À retenir :</strong> |x| = x si x ≥ 0, |x| = −x si x &lt; 0 ; |x| ≥ 0 toujours ; |x| = |−x|. Et entre deux bateaux ? Module suivant.</Feedback>}
    />
  );
}
