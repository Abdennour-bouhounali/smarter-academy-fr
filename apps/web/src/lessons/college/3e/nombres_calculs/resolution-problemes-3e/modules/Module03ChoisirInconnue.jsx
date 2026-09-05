import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import BarModel from '../../../../../common/components/BarModel';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProblemText from '../components/ProblemText';
import UnknownPicker from '../components/UnknownPicker';
import { AGES } from '../components/problemsData';

/**
 * Module 3 — DÉCOUVERTE : « Choisir l'inconnue ».
 *
 * Activity: décider ce que x désigne dans l'histoire de Tom et Léa, et
 *   regarder les autres quantités se réécrire ; recommencer avec un autre
 *   choix valable ; traduire quatre relations courantes.
 * Mathematical objective: établir que choisir l'inconnue est une DÉCISION,
 *   que plusieurs choix marchent, et qu'un bon choix est celui dont les
 *   autres quantités dépendent.
 * Student action: taper une quantité pour la nommer x ; prédire quelle barre
 *   est la plus longue ; apparier quatre relations à leur écriture.
 * Controlled variable: le choix de l'inconnue (`chosen`).
 * Mathematical state: `chosen` ; les réécritures sont dérivées par
 *   `rewriteQuantities` — aucune écriture n'est codée en dur.
 * Visual consequence: les cinq quantités se réécrivent (Léa = x + 3, la
 *   somme dans 5 ans = 2x + 13) ; un choix invalide grise TOUTES les cartes.
 * Expected observation: « la somme des âges » ne permet d'écrire aucune autre
 *   quantité ; « l'âge de Tom » et « l'âge de Léa » marchent tous les deux.
 * Misconception targeted: n° 1 (piège du mot-clé : « 3 ans de plus » écrit
 *   x − 3, ou porté sur Tom) et n° 2 (« x, c'est toujours la réponse
 *   cherchée »).
 * Feedback: le BarModel montre que si Léa = x − 3, sa barre est PLUS COURTE
 *   que celle de Tom alors que l'énoncé la dit plus âgée.
 * Formalization: étape 3, « choisir x, c'est choisir par où on entre » —
 *   après les deux choix.
 * Scaffolding: le choix invalide est proposé exprès et n'est jamais bloquant ;
 *   les barres donnent une lecture non symbolique.
 * Transfer: le module 4 traduit ces mêmes quantités en équation ; le module 6
 *   remet x = 11 dans ces mêmes cinq lignes.
 */
const TOM = 11;

export default function Module03ChoisirInconnue() {
  const [chosen1, setChosen1] = useState(null);
  const [barDone, setBarDone] = useState(false);
  const [chosen2, setChosen2] = useState(null);
  const [relationsDone, setRelationsDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Choisir l’inconnue"
      moduleSubtitle="Nomme une quantité x — et regarde les autres s’écrire toutes seules."
      estimatedTime="9 min"
      brief={{
        tag: '🎯 Mission 03',
        title: 'Une histoire, plusieurs portes d’entrée.',
        body: (
          <p>
            Dans un problème, plusieurs quantités se baladent. Tu vas en désigner une comme{' '}
            <MathText>{'$x$'}</MathText> et voir ce que ça change — parce que ce choix, c’est toi qui le
            fais, et il n’y en a pas qu’un de bon.
          </p>
        ),
      }}
      intro={<ProblemText fragments={AGES.fragments} title="Énoncé — Tom et Léa" />}
      steps={[
        {
          num: 1,
          title: 'Nomme une quantité x',
          subtitle: 'Trois candidats. Deux marchent, un ne mène nulle part.',
          done: chosen1 !== null,
          content: (kit) => (
            <div className="space-y-3">
              <UnknownPicker
                problem={AGES}
                chosen={chosen1}
                onChoose={(id) => {
                  setChosen1(id);
                  kit.react(id !== 'somme');
                }}
              />
              {chosen1 === 'somme' && (
                <Feedback tone="ko">
                  Avec « la somme de leurs âges dans 5 ans » comme <MathText>{'$x$'}</MathText>, aucune
                  autre quantité ne s’écrit : l’âge de Tom n’est pas <em>une part fixe</em> de cette somme,
                  et on ne peut pas remonter à lui. C’est le piège du « x, c’est ce que je cherche » :
                  choisir x, c’est choisir une quantité <strong>dont les autres dépendent</strong>. Touche
                  un autre candidat.
                </Feedback>
              )}
              {chosen1 === 'tom' && (
                <Feedback tone="ok">
                  Avec <MathText>{'$x$'}</MathText> = âge de Tom, tout se déduit : Léa a 3 ans de plus donc{' '}
                  <MathText>{'$x + 3$'}</MathText>, dans 5 ans Tom aura{' '}
                  <MathText>{'$x + 5$'}</MathText> et Léa <MathText>{'$x + 8$'}</MathText>, et leur somme{' '}
                  <MathText>{'$2x + 13$'}</MathText>. Une seule lettre suffit pour dire toute l’histoire.
                </Feedback>
              )}
              {chosen1 === 'lea' && (
                <Feedback tone="ok">
                  Avec <MathText>{'$x$'}</MathText> = âge de Léa, ça marche aussi : Tom est alors{' '}
                  <MathText>{'$x - 3$'}</MathText>, et la somme dans 5 ans{' '}
                  <MathText>{'$2x + 7$'}</MathText>. Ce n’est pas le choix de l’énoncé (qui demande l’âge de
                  Tom), mais c’est un choix valable — il faudra juste ne pas oublier de revenir à Tom à la
                  fin.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Qui est le plus âgé ?',
          subtitle: 'Le piège du mot « de plus », vu en barres.',
          done: barDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Un élève a écrit : <MathText>{'$x$'}</MathText> = âge de Tom, et « Léa ={' '}
                  <MathText>{'$x - 3$'}</MathText> ». Regarde les barres pour{' '}
                  <MathText>{'$x = 11$'}</MathText>. Que montrent-elles ?
                </>
              }
              above={
                <div className="space-y-2">
                  <BarModel
                    bars={[
                      {
                        label: 'Tom (x = 11)',
                        segments: [{ value: TOM, tone: 'sky', text: 'x' }],
                      },
                      {
                        label: 'Léa selon cet élève (x − 3)',
                        segments: [{ value: TOM - 3, tone: 'rose', text: 'x − 3' }],
                      },
                      {
                        label: 'Léa selon l’énoncé (x + 3)',
                        segments: [
                          { value: TOM, tone: 'sky', text: 'x' },
                          { value: 3, tone: 'emerald', text: '+3' },
                        ],
                      },
                    ]}
                    maxValue={16}
                    unit=" ans"
                  />
                  <p className="text-xs text-slate-500 text-center">
                    L’énoncé dit : « Léa a 3 ans <strong>de plus</strong> que Tom ».
                  </p>
                </div>
              }
              options={[
                'La barre de Léa est plus courte : cette écriture dit le contraire de l’énoncé',
                'Les deux écritures sont correctes, c’est au choix',
                'La barre de Léa est plus longue : l’écriture est bonne',
              ]}
              cols={1}
              correct={0}
              explain={
                <>
                  <MathText>{'$x - 3$'}</MathText> donne 8 ans à Léa alors que Tom en a 11 : elle serait
                  plus <em>jeune</em>. « De plus » veut dire qu’on <strong>ajoute</strong> à celui qui est
                  cité comme référence — ici Tom. Donc Léa = <MathText>{'$x + 3$'}</MathText>. Le mot-clé ne
                  suffit jamais : c’est la longueur des barres qui tranche.
                </>
              }
              explainWrong={
                <>
                  Compare les deux premières barres : 11 pour Tom, 8 pour Léa. L’énoncé dit que Léa est plus
                  âgée — l’écriture <MathText>{'$x - 3$'}</MathText> raconte donc l’inverse de l’histoire.
                </>
              }
              solved={barDone}
              onAnswered={() => setBarDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Refais le choix, autrement',
          subtitle: 'Cette fois, prends l’âge de Léa comme inconnue.',
          done: chosen2 === 'lea',
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Choisir l’inconnue</strong>, c’est choisir par où on entre dans l’histoire. Les
                  autres quantités s’écrivent alors <em>en fonction</em> de cette lettre — c’est ça qui rend
                  l’équation possible.
                </p>
                <p>
                  Plusieurs entrées marchent souvent. Ce qui change, c’est la forme de l’équation… et le
                  petit calcul de retour à la fin.
                </p>
              </div>
              <UnknownPicker
                problem={AGES}
                chosen={chosen2}
                onChoose={(id) => {
                  setChosen2(id);
                  kit.react(id === 'lea');
                }}
              />
              {chosen2 === 'somme' && (
                <Feedback tone="ko">
                  Toujours pas : « la somme » ne permet d’écrire aucune autre quantité. Prends{' '}
                  <strong>l’âge de Léa</strong>.
                </Feedback>
              )}
              {chosen2 === 'tom' && (
                <Feedback tone="info">
                  C’est le choix du premier essai — il est correct. Mais pour cette étape, prends{' '}
                  <strong>l’âge de Léa</strong> : tu verras Tom s’écrire{' '}
                  <MathText>{'$x - 3$'}</MathText>, avec un signe « moins » cette fois.
                </Feedback>
              )}
              {chosen2 === 'lea' && (
                <Feedback tone="ok">
                  Tom devient <MathText>{'$x - 3$'}</MathText> et la somme dans 5 ans{' '}
                  <MathText>{'$2x + 7$'}</MathText> au lieu de <MathText>{'$2x + 13$'}</MathText>. Deux
                  équations différentes, deux valeurs de x différentes (14 au lieu de 11) — et pourtant la
                  même histoire, et la même réponse finale : Tom a 11 ans.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Traduis quatre relations',
          subtitle: 'Les quatre formulations qui reviennent tout le temps.',
          done: relationsDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-700">
                  Marc a <MathText>{'$x$'}</MathText> billes. Écris ce que possède chaque personne.
                </p>
              }
              rows={[
                {
                  id: 'plus',
                  label: <span>Léo a 3 billes de plus que Marc</span>,
                  options: ['x + 3', 'x − 3', '3x'],
                  correct: 0,
                  correction: '« de plus » : on ajoute 3 au nombre de Marc.',
                },
                {
                  id: 'double',
                  label: <span>Nina a le double de Marc</span>,
                  options: ['x + 2', '2x', 'x ÷ 2'],
                  correct: 1,
                  correction: '« le double » : on multiplie par 2.',
                },
                {
                  id: 'moins',
                  label: <span>Sam a 5 billes de moins que Marc</span>,
                  options: ['5 − x', 'x − 5', '5x'],
                  correct: 1,
                  correction: '« 5 de moins que Marc » : on retire 5 à x — pas l’inverse.',
                },
                {
                  id: 'moitie',
                  label: <span>Ana a la moitié de Marc</span>,
                  options: ['x − 2', '2x', 'x ÷ 2'],
                  correct: 2,
                  correction: '« la moitié » : on divise par 2.',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {nCorrect}/{total}. Les deux pièges de cette liste :{' '}
                  <MathText>{'$5 - x$'}</MathText> au lieu de <MathText>{'$x - 5$'}</MathText> (« de moins
                  que Marc » retire à Marc), et <MathText>{'$3x$'}</MathText> pour « 3 de plus » (multiplier
                  n’est pas ajouter). Quand tu hésites, prends une valeur : si Marc a 10 billes, Sam en a 5,
                  et <MathText>{'$5 - 10 = -5$'}</MathText> n’a aucun sens.
                </Feedback>
              )}
              solved={relationsDone}
              onAnswered={() => setRelationsDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Choisir <MathText>{'$x$'}</MathText>, c’est choisir par où on entre ; les autres quantités
          s’écrivent alors avec cette lettre. Onglet <strong>Inconnue</strong> du carnet : rempli. Au module
          suivant, on relie ces écritures par un signe <MathText>{'$=$'}</MathText>.
        </Feedback>
      }
    />
  );
}
