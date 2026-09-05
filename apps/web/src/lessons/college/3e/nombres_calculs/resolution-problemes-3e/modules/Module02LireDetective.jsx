import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import InfoSorter from '../../../../../common/components/InfoSorter';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProblemText from '../components/ProblemText';
import { CREPES, FORFAIT } from '../components/problemsData';

/**
 * Module 2 — DÉCOUVERTE : « Lire comme un détective ».
 *
 * Activity: trier les informations d'un énoncé de 3e (utiles / inutiles),
 *   désigner la phrase qui pose la question, puis dire ce que le résultat a
 *   le droit d'être.
 * Mathematical objective: faire de « la question » et de « les contraintes »
 *   des objets distincts des données — trois choses différentes dans un même
 *   texte.
 * Student action: touche une information puis un bac ; touche la phrase de
 *   la question ; répond à trois contraintes en lot.
 * Controlled variable: l'affectation de chaque information à un bac ; le
 *   fragment désigné.
 * Mathematical state: l'ensemble des données retenues, le fragment choisi,
 *   les trois réponses de contraintes.
 * Visual consequence: le bac se remplit, la correction colore chaque carte ;
 *   la phrase désignée passe au vert si c'est la question.
 * Expected observation: un énoncé contient des nombres dont on n'a pas
 *   besoin ; et la question dit ce qu'on cherche, pas comment le trouver.
 * Misconception targeted: n° 8 du catalogue — utiliser TOUS les nombres de
 *   l'énoncé ; et l'oubli des contraintes (« n peut valoir 6,25 séances »).
 * Feedback: InfoSorter `formative` révèle le bon tri quoi qu'il arrive ; les
 *   contraintes sont corrigées en lot.
 * Formalization: « donnée utile / donnée inutile », « la question », « les
 *   contraintes » — nommées après les trois gestes.
 * Scaffolding: l'énoncé reste affiché en permanence ; les bacs sont grands.
 * Transfer: le tri revient au module 7 sur un énoncé neuf, et l'épreuve rp-e1
 *   du boss reprend exactement cet énoncé de crêpes.
 */
const ITEMS_CREPES = [
  { id: 'a', text: '250 g de farine pour 4 personnes', useful: true },
  { id: 'b', text: 'Il faut 7 personnes', useful: true },
  { id: 'c', text: '3 œufs dans la recette', useful: false },
  { id: 'd', text: '50 cL de lait dans la recette', useful: false },
  { id: 'e', text: 'Le paquet de farine pèse 1 kg', useful: false },
];

export default function Module02LireDetective() {
  const [sorted, setSorted] = useState(false);
  const [tappedFragment, setTappedFragment] = useState(null);
  const [constraintsDone, setConstraintsDone] = useState(false);
  const [missingDone, setMissingDone] = useState(false);

  const questionOk = tappedFragment === 'f-question';

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Lire comme un détective"
      moduleSubtitle="Toutes les données ne servent pas. Trouve la question, et ce que le résultat a le droit d’être."
      estimatedTime="8 min"
      brief={{
        tag: '🔎 Mission 02',
        title: 'Un énoncé, c’est une scène de crime : tout n’est pas un indice.',
        body: (
          <p>
            Avant de calculer quoi que ce soit, un bon résolveur trie. Il sépare ce qui sert de ce qui
            décore, il repère ce qu’on lui demande, et il note ce que la réponse a le droit d’être.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trie les informations',
          subtitle: 'Cinq informations, mais la question ne parle que de farine.',
          done: sorted,
          content: (kit) => (
            <div className="space-y-4">
              <ProblemText fragments={CREPES.fragments} title="Énoncé — Les crêpes" />
              <InfoSorter
                items={ITEMS_CREPES}
                solved={sorted}
                onSolved={() => setSorted(true)}
                formative
                onCheck={kit.react}
              />
              {sorted && (
                <Feedback tone="info">
                  Les œufs, le lait et le poids du paquet sont vrais — mais ils ne servent pas à répondre à
                  <em> cette </em>question. Une donnée est <strong>utile</strong> quand la question ne peut
                  pas être résolue sans elle, pas quand elle est écrite dans l’énoncé.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Où est la question ?',
          subtitle: 'Touche la phrase qui dit ce qu’on cherche.',
          done: tappedFragment !== null,
          content: (kit) => (
            <div className="space-y-3">
              <ProblemText
                fragments={CREPES.fragments}
                mode="question"
                tapped={tappedFragment}
                revealed={tappedFragment !== null}
                disabled={tappedFragment !== null}
                onTapFragment={(id) => {
                  setTappedFragment(id);
                  kit.react(id === 'f-question');
                }}
                title="Touche la phrase qui pose la question"
              />
              {tappedFragment !== null && (
                <Feedback tone={questionOk ? 'ok' : 'ko'}>
                  {!questionOk && (
                    <>
                      La phrase que tu as touchée donne une <strong>donnée</strong>, pas la question.{' '}
                    </>
                  )}
                  La question est : «{' '}
                  <strong>Quelle masse de farine faut-il pour 7 personnes ?</strong> ». C’est la seule
                  phrase qui demande quelque chose — elle se reconnaît à son point d’interrogation et au
                  fait qu’elle nomme <em>ce qu’on cherche</em> : une masse de farine, en grammes.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Ce que le résultat a le droit d’être',
          subtitle: 'On revient au cinéma : n est un nombre de séances.',
          done: constraintsDone,
          content: (
            <div className="space-y-4">
              <ProblemText fragments={FORFAIT.fragments} title="Rappel — Le forfait de cinéma" />
              <BatchChoiceQuestion
                intro={
                  <p className="text-sm text-slate-700">
                    <MathText>{'$n$'}</MathText> désigne le nombre de séances. Pour chaque affirmation, dis
                    si elle est vraie ou fausse.
                  </p>
                }
                rows={[
                  {
                    id: 'entier',
                    label: <span>n doit être un nombre entier</span>,
                    options: ['Vrai', 'Faux'],
                    correct: 0,
                    correction: 'On ne va pas au cinéma 6,25 fois : n compte des séances entières.',
                  },
                  {
                    id: 'positif',
                    label: <span>n peut être négatif</span>,
                    options: ['Vrai', 'Faux'],
                    correct: 1,
                    correction: 'Un nombre de séances ne peut pas être négatif : n ≥ 0.',
                  },
                  {
                    id: 'grand',
                    label: <span>n peut dépasser 100</span>,
                    options: ['Vrai', 'Faux'],
                    correct: 0,
                    correction: 'Rien dans l’énoncé ne limite le nombre de séances — 120 séances est permis.',
                  },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {nCorrect}/{total}. Ces trois phrases sont les <strong>contraintes</strong> :
                    l’ensemble des valeurs que la réponse a le droit de prendre. Elles ne se calculent pas —
                    elles se lisent dans la situation. Ici : <MathText>{'$n$'}</MathText> entier, positif,
                    sans plafond.
                  </Feedback>
                )}
                solved={constraintsDone}
                onAnswered={() => setConstraintsDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Quand une donnée manque',
          subtitle: 'Le détective sait aussi dire qu’il n’a pas assez d’indices.',
          done: missingDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  « Un cinéma vend 320 places pour la séance de 20 h. La salle compte 12 rangées. Combien
                  reste-t-il de places libres ? » — Quelle information manque pour répondre ?
                </>
              }
              options={[
                'Le prix d’une place',
                'Le nombre total de places de la salle',
                'L’heure de la séance suivante',
              ]}
              cols={1}
              correct={1}
              explain={
                <>
                  « Il reste » suppose de connaître le <strong>total</strong> : sans la capacité de la
                  salle, 320 places vendues ne dit rien du nombre de libres. Les 12 rangées et l’heure sont
                  des données <em>inutiles</em> — un énoncé peut être incomplet <em>et</em> bavard en même
                  temps.
                </>
              }
              explainWrong={
                <>
                  Le prix ne dit rien du nombre de places, et l’heure non plus. Ce qui manque, c’est le{' '}
                  <strong>total</strong> : sans lui, on ne peut pas soustraire les 320 places vendues.
                </>
              }
              solved={missingDone}
              onAnswered={() => setMissingDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          La question dit ce qu’on cherche ; les contraintes disent ce qu’on a le droit de trouver ; les
          données utiles sont celles sans lesquelles la question reste sans réponse. Onglet{' '}
          <strong>Lire</strong> du carnet : rempli.
        </Feedback>
      }
    />
  );
}
