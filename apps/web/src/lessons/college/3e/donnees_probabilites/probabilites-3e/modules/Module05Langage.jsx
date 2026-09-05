import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProbabilityScale from '../components/ProbabilityScale';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 5 — FORMALISATION : « Le langage des probabilités ».
 *
 * Activity: placer des événements sur l'échelle de 0 à 1 ; lire le bloc
 *   « À retenir » ; trier des affirmations vrai / faux ; interpréter.
 * Mathematical objective: fixer le vocabulaire (expérience aléatoire, issue,
 *   événement, probabilité, événement contraire, fréquence) et les deux
 *   propriétés : 0 ≤ P ≤ 1 et P(non A) = 1 − P(A) ; distinguer fréquence
 *   expérimentale et probabilité théorique ; interpréter une probabilité.
 * Student action: toucher un événement puis une graduation ; répondre.
 * Controlled variable: la graduation attribuée à chaque événement.
 * Mathematical state: `placed` {id → douzièmes} ; la valeur attendue est
 *   dérivée de la fraction de chaque événement.
 * Visual consequence: une lettre au-dessus de la graduation ; ✓ / ✗ à la
 *   révélation.
 * Expected observation: « 1/6 est à gauche de 1/4 ; 1/2 au milieu ».
 * Misconception targeted: « 1/6 > 1/4 » ; « P peut dépasser 1 » ; « 0,9 ⇒
 *   certain » ; « la fréquence sur 1 000 lancers EST la probabilité ».
 * Formalization: le bloc « À retenir », après le geste.
 */

const ITEMS = [
  { id: 'pair', label: 'un dé : « pair »', num: 1, den: 2 },
  { id: 'sept', label: 'deux dés : « somme 7 »', num: 1, den: 6 },
  { id: 'rouge', label: 'sac : « rouge » (2 sur 8)', num: 1, den: 4 },
  { id: 'treize', label: 'deux dés : « somme 13 »', num: 0, den: 1 },
  { id: 'six', label: 'un dé : « au plus 6 »', num: 1, den: 1 },
];

export default function Module05Langage() {
  const [placed, setPlaced] = useState({});
  const [selected, setSelected] = useState(null);
  const [scaleDone, setScaleDone] = useState(false);
  const [scaleRight, setScaleRight] = useState(0);
  const [vfDone, setVfDone] = useState(false);
  const [interpDone, setInterpDone] = useState(false);
  const [ticketsDone, setTicketsDone] = useState(false);

  const allPlaced = ITEMS.every((it) => placed[it.id] !== undefined);
  const place = (id, t) => { setPlaced((p) => ({ ...p, [id]: t })); setSelected(null); };
  const checkScale = (react) => {
    const right = ITEMS.filter((it) => placed[it.id] === (it.num * 12) / it.den).length;
    setScaleRight(right);
    react(right === ITEMS.length);
    setScaleDone(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le langage des probabilités"
      moduleSubtitle="L’échelle de 0 à 1, l’événement contraire, et ce qu’une probabilité veut dire."
      estimatedTime="9 min"
      brief={{
        tag: '📏 Mission 05',
        title: 'Tout sur une même échelle',
        tone: 'violet',
        body: (
          <p>
            Dé, deux dés, sac de billes : tu as calculé des probabilités dans trois expériences. Place-les
            toutes sur une seule échelle, de 0 à 1.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'L’échelle de 0 à 1',
          subtitle: 'Touche un événement, puis la graduation où il va (douzièmes). Puis vérifie.',
          done: scaleDone,
          content: (kit) => (
            <div className="space-y-3">
              <ProbabilityScale items={ITEMS} placed={placed} selected={selected} onSelect={setSelected} onPlace={place} revealed={scaleDone} />
              {!scaleDone && (
                <ValidateButton onClick={() => checkScale(kit.react)} disabled={!allPlaced} tone="indigo">Vérifier mes placements</ValidateButton>
              )}
              {scaleDone && (
                <Feedback tone={scaleRight === ITEMS.length ? 'ok' : 'ko'}>
                  {scaleRight} sur {ITEMS.length} bien placés. Sur l’échelle : 0 = impossible (somme 13), 1 = certain (au plus 6),{' '}
                  1/2 au milieu (pair), 1/4 = 3 douzièmes (rouge), 1/6 = 2 douzièmes (somme 7). Toute probabilité est un nombre
                  entre 0 et 1 — jamais au-delà.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À retenir',
          subtitle: 'Les mots précis pour ce que tu as fait.',
          done: vfDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2 text-sm text-slate-800">
                <p><strong>Expérience aléatoire</strong> : on connaît les <strong>issues</strong> possibles, pas le résultat.</p>
                <p><strong>Événement</strong> : un ensemble d’issues. <strong>Impossible</strong> : aucune issue (P = 0). <strong>Certain</strong> : toutes (P = 1).</p>
                <p>
                  <strong>Probabilité</strong> d’un événement A, quand les issues ont toutes la même chance :{' '}
                  <MathText>{'$P(A) = \\dfrac{\\text{nombre d’issues favorables}}{\\text{nombre d’issues possibles}}$'}</MathText>, un nombre entre 0 et 1.
                </p>
                <p><strong>Événement contraire</strong> (« non A ») : <MathText>{'$P(\\text{non } A) = 1 - P(A)$'}</MathText>. Exemple : P(pas de 6) = 1 − 1/6 = 5/6.</p>
                <p><strong>Fréquence observée</strong> : effectif ÷ nombre d’essais. Elle change d’une série à l’autre et se <strong>rapproche</strong> de la probabilité quand le nombre d’essais grandit — sans jamais être obligée de l’égaler.</p>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">Vrai ou faux ?</p>}
                rows={[
                  { id: 'a', label: 'Sur 1 000 lancers, la fréquence du 6 est exactement 1/6.', options: ['Vrai', 'Faux'], correct: 1, correction: 'Elle en est proche, pas forcément égale.' },
                  { id: 'b', label: 'Une probabilité peut valoir 1,2.', options: ['Vrai', 'Faux'], correct: 1, correction: 'Jamais au-delà de 1.' },
                  { id: 'c', label: 'P(ne pas obtenir 6) = 5/6.', options: ['Vrai', 'Faux'], correct: 0, correction: '1 − 1/6 = 5/6.' },
                  { id: 'd', label: 'Plus on lance, plus la fréquence se rapproche de la probabilité.', options: ['Vrai', 'Faux'], correct: 0, correction: 'C’est la stabilisation des fréquences.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Retiens la différence : la <strong>fréquence</strong> raconte
                    une expérience passée ; la <strong>probabilité</strong> décrit le modèle et sert à prévoir.
                  </Feedback>
                )}
                solved={vfDone}
                onAnswered={() => setVfDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Interpréter',
          subtitle: 'Ce qu’une probabilité veut dire dans la vie.',
          done: interpDone && ticketsDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="La météo annonce : « probabilité de pluie 0,7 ». Que signifie ce nombre ?"
                options={[
                  'Il y a 7 chances sur 10 qu’il pleuve : la pluie est probable, mais pas certaine',
                  'Il pleuvra pendant 70 % de la journée',
                  'Il pleuvra sûrement, puisque 0,7 est proche de 1',
                  'Il a plu 7 jours sur les 10 derniers',
                ]}
                correct={0}
                cols={1}
                explain="0,7 = 7/10 : sur beaucoup de journées annoncées ainsi, il pleut environ 7 fois sur 10. Une probabilité proche de 1 rend l’événement probable — elle ne le rend certain qu’à 1 exactement."
                solved={interpDone}
                onAnswered={() => setInterpDone(true)}
              />
              {interpDone && (
                <NumericQuestion
                  prompt="Une loterie donne une probabilité de gagner de 0,02 par ticket. Sur 1 000 tickets, combien de gagnants peut-on attendre, environ ?"
                  expected={20}
                  parse={parseDec}
                  display={formatDec(20)}
                  explain="0,02 × 1 000 = 20 : sur 1 000 tickets, ENVIRON 20 gagnants — pas exactement, mais c’est ce que la probabilité laisse prévoir."
                  explainFor={(n) => {
                    if (n === 2) return '0,02, c’est 2 sur 100 — donc 20 sur 1 000.';
                    if (n === 200) return '0,02 = 2 %, pas 20 % : 2 % de 1 000 tickets font 20.';
                    return null;
                  }}
                  solved={ticketsDone}
                  onAnswered={() => setTicketsDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Tu as maintenant le vocabulaire et les deux règles (0 ≤ P ≤ 1, contraire = 1 − P). Le module suivant
          fait travailler tout cela sur des situations réelles : une roue, une usine, un tirage au sort.
        </Feedback>
      }
    />
  );
}
