import React, { useState, useMemo } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import WheelLab from '../components/WheelLab';
import {
  GROS_LOT_DEFAUT, GROS_LOTS, NB_SECTEURS, secteursDeLaRoue, gainsDeLaRoue, euros,
} from '../components/roueUtils';

/**
 * Module 2 — DÉCOUVERTE : le nombre attaché à chaque issue reçoit son nom et sa
 * notation.
 *
 * Étape 1  le geste : promener le gros lot et LIRE l'étiquette de chaque
 *          secteur. Chaque issue porte un nombre, et ce nombre change quand on
 *          change la roue — c'est bien une RÈGLE qui associe, pas une constante.
 * Étape 2  compter les VALEURS, pas les issues : dix secteurs, trois valeurs.
 *          C'est la confusion n° 1, et elle se tranche par un comptage.
 * Étape 3  ce que X n'est pas : ni une probabilité, ni un résultat déjà tiré.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique `variable-aleatoire` ;
 * étape 2 comptage mené → brique `valeurs-prises` ; étape 3 la demande, qui
 * n'exige que ce qui précède.
 *
 * MANIPULATION JAMAIS GELÉE : la roue de l'étape 1 reste pilotable après
 * validation — l'élève doit pouvoir promener le gros lot en lisant la règle.
 */
export default function Module02UnNombreParIssue() {
  const [grosLot, setGrosLot] = useState(GROS_LOT_DEFAUT);
  const [lotsVus, setLotsVus] = useState([GROS_LOT_DEFAUT]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = lotsVus.length >= 3;
  const secteurs = useMemo(() => secteursDeLaRoue(grosLot), [grosLot]);
  const valeurs = useMemo(() => [...new Set(gainsDeLaRoue(grosLot))].sort((a, b) => a - b), [grosLot]);

  const bougerLot = (v, react) => {
    setGrosLot(v);
    if (lotsVus.includes(v)) return;
    const suivant = [...lotsVus, v];
    setLotsVus(suivant);
    if (!done1 && suivant.length >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Chaque secteur porte un nombre',
      subtitle:
        'Fais varier le gros lot avec − et + et lis, sous la roue, ce que paie chaque couleur. Visite au moins trois montants.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <WheelLab grosLot={grosLot} onChangeGrosLot={(v) => bougerLot(v, kit.react)} />
          {done1 ? (
            <>
              <Feedback tone="ok">
                Chaque secteur — chaque issue de l’expérience — se voit attribuer{' '}
                <strong>un nombre</strong> : le montant gagné. Ce n’est pas le hasard qui change
                quand tu bouges le montant, c’est la <strong>règle d’attribution</strong>. Cette
                règle porte un nom.
              </Feedback>
              <KnowledgeBrick
                id="variable-aleatoire"
                variant="new"
                lead={<>Le nom et la notation de cette règle. Repromène le gros lot en les lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Montants essayés : {lotsVus.length} sur 3.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dix secteurs, combien de valeurs ?',
      subtitle: 'Attention : on demande le nombre de valeurs DIFFÉRENTES que X peut prendre, pas le nombre de secteurs.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-white p-3 text-sm text-slate-700">
            La roue actuelle : {secteurs.map((s) => `${s.effectif} secteurs à ${euros(s.gain)}`).join(', ')}.
            Total : {NB_SECTEURS} secteurs.
          </div>
          <NumericQuestion
            prompt={<>Combien de valeurs <strong>différentes</strong> la variable aléatoire X peut-elle prendre ?</>}
            expected={valeurs.length}
            parse={parseDec}
            display={String(valeurs.length)}
            requires={['variable-aleatoire', 'issue-evenement']}
            explain={`X prend ${valeurs.length} valeurs : ${valeurs.map((v) => euros(v)).join(', ')}. Quatre secteurs donnent 0 € : cela fait UNE valeur obtenue de quatre façons, pas quatre valeurs.`}
            explainFor={(n) =>
              n === NB_SECTEURS
                ? `${NB_SECTEURS}, c’est le nombre de SECTEURS, donc d’issues. Plusieurs secteurs portent le même montant : les valeurs de X ne sont que ${valeurs.length}.`
                : n === 4
                ? 'Quatre est un nombre de SECTEURS, pas un nombre de valeurs. Compte les montants différents inscrits sur la roue.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Dix issues, <strong>{valeurs.length} valeurs</strong>. C’est cette distinction qui
                permettra d’écrire un tableau à {valeurs.length} colonnes plutôt qu’à {NB_SECTEURS}.
              </Feedback>
              <KnowledgeBrick
                id="valeurs-prises"
                variant="new"
                lead={<>La règle de comptage que tu viens d’appliquer.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que X est, et ce qu’il n’est pas',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p>La roue paie {gainsDeLaRoue(grosLot).map((g) => euros(g)).join(', ')}. Pour chaque phrase, dis si elle décrit correctement X.</p>}
            rows={[
              {
                id: 'v1',
                label: '« X est le gain, en euros, obtenu à un lancer »',
                options: ['Correct', 'Incorrect'],
                correct: 0,
                correction: 'C’est exactement cela : à chaque issue, X associe un montant en euros.',
              },
              {
                id: 'v2',
                label: '« X est la probabilité de gagner »',
                options: ['Correct', 'Incorrect'],
                correct: 1,
                correction: 'Non : une probabilité est un nombre entre 0 et 1 sans unité. X vaut 0, 1 ou plus, en euros.',
              },
              {
                id: 'v3',
                label: `« X = ${euros(grosLot)} » désigne l’événement « la roue s’arrête sur un secteur du gros lot »`,
                options: ['Correct', 'Incorrect'],
                correct: 0,
                correction: 'Oui : écrire « X = valeur » nomme l’ensemble des issues qui donnent cette valeur.',
              },
              {
                id: 'v4',
                label: '« X est le résultat du dernier lancer effectué »',
                options: ['Correct', 'Incorrect'],
                correct: 1,
                correction: 'Non : X est la RÈGLE qui associe un nombre à chaque issue, elle existe avant tout lancer. Le résultat d’un lancer est une valeur PRISE par X.',
              },
            ]}
            requires={['variable-aleatoire', 'valeurs-prises', 'probabilite']}
            feedback={({ allRight }) =>
              allRight ? (
                <>
                  X est une règle, pas un résultat, et pas une probabilité. Elle transforme chaque
                  issue en nombre — et « X = valeur » désigne un événement.
                </>
              ) : (
                <>
                  Deux confusions à trancher : X n’est pas une probabilité (il porte une unité, des
                  euros), et X n’est pas un tirage déjà fait (il existe avant qu’on lance).
                </>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un nombre par issue"
      moduleSubtitle="Une règle qui transforme chaque résultat en nombre"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce nombre a un nom',
        tone: 'indigo',
        body: (
          <p>
            Sur la roue, chaque secteur porte un montant. Cette façon d’attacher un nombre à chaque
            issue d’une expérience aléatoire a un nom et une notation : les voici.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Reste une question.</strong> On sait quelles valeurs X peut prendre. Avec quelles
          chances chacune ? Module suivant : la loi de probabilité et son tableau.
        </KnowledgeSnapshot>
      }
    />
  );
}
