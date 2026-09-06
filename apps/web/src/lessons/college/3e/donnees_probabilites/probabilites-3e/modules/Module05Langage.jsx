import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
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
 * Formalization: le bloc « À retenir » manuscrit a disparu — il recopiait des
 *   définitions déjà posées aux modules 1 à 4. Trois <KnowledgeBrick>
 *   subsistent, une par notion RÉELLEMENT neuve ici : l'échelle 0–1 après le
 *   placement, l'événement contraire avant la question qui l'exige,
 *   l'interprétation avant la météo. Le récapitulatif complet est la carte
 *   elle-même, en pied de module.
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
                <>
                  <Feedback tone={scaleRight === ITEMS.length ? 'ok' : 'ko'}>
                    {scaleRight} sur {ITEMS.length} bien placés. Sur l’échelle : 0 = impossible (somme 13),
                    1 = certain (au plus 6), 1/2 au milieu (pair), 1/4 = 3 douzièmes (rouge), 1/6 = 2 douzièmes
                    (somme 7).
                  </Feedback>
                  <KnowledgeBrick
                    id="echelle-probabilites"
                    variant="new"
                    lead="Trois expériences différentes, une seule règle graduée : c’est cette règle qui borne toute probabilité."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'L’événement contraire',
          subtitle: 'Le dernier mot qui manque — puis quatre affirmations à trier.',
          done: vfDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="evenement-contraire"
                variant="new"
                lead="Il te manque un seul mot pour dire tout ce que tu sais faire : celui du « tout le reste »."
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">Vrai ou faux ?</p>}
                requires={['evenement-contraire', 'echelle-probabilites', 'mem-frequence-vs-probabilite', 'stabilisation']}
                rows={[
                  { id: 'a', label: 'Sur 1 000 lancers, la fréquence du 6 est exactement 1/6.', options: ['Vrai', 'Faux'], correct: 1, correction: 'Elle en est proche, pas forcément égale.' },
                  { id: 'b', label: 'Une probabilité peut valoir 1,2.', options: ['Vrai', 'Faux'], correct: 1, correction: 'Jamais au-delà de 1.' },
                  { id: 'c', label: 'P(ne pas obtenir 6) = 5/6.', options: ['Vrai', 'Faux'], correct: 0, correction: '1 − 1/6 = 5/6.' },
                  { id: 'd', label: 'Plus on lance, plus la fréquence se rapproche de la probabilité.', options: ['Vrai', 'Faux'], correct: 0, correction: 'C’est la stabilisation des fréquences.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Les quatre affirmations
                    rejouent les quatre pièges de la leçon : l’égalité exacte, le dépassement de 1, le
                    contraire, et la stabilisation.
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
              <KnowledgeBrick
                id="interpreter-une-probabilite"
                variant="new"
                lead="Hors des dés et des billes, une probabilité s’écrit dans une phrase — et se lit de travers une fois sur deux."
              />
              <TapQuestion
                prompt="La météo annonce : « probabilité de pluie 0,7 ». Que signifie ce nombre ?"
                requires={['interpreter-une-probabilite', 'echelle-probabilites']}
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
                  requires={['interpreter-une-probabilite', 'effectif-attendu']}
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
        <KnowledgeSnapshot moduleNumber={5}>
          Tu as maintenant le vocabulaire complet et les deux règles. Le module suivant fait travailler tout
          cela sur des situations réelles : une roue de kermesse, une usine, un tirage au sort dans une
          classe.
        </KnowledgeSnapshot>
      }
    />
  );
}
