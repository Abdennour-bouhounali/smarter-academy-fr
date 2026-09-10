import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DeuxPanneaux from '../components/DeuxPanneaux';
import { CUBE, CUBE_SIMPLE, etatSonde, extremums, parseSigned, fr } from '../components/variationsUtils';

/**
 * Module 2 — DÉCOUVERTE : la synchronisation constatée au module 1 devient une
 * RÈGLE, puis reçoit sa RÉSERVE.
 *
 * Étape 1  reprendre la sonde sur f(x) = x³ − 3x, cette fois avec les bandes
 *          peintes, et LIRE la règle sur ce qu'on vient de faire →
 *          brique `signe-derivee-donne-sens`, puis `mem-positive-monte`.
 * Étape 2  LE CONTRE-EXEMPLE. Sur g(x) = x³, la sonde se pose exactement sur 0
 *          (cible atteignable, verrouillée par le test), la pastille du bas
 *          TOUCHE l'axe sans le traverser, et la courbe du haut repart en
 *          montant. Le geste précède la brique `changement-de-signe-decide`.
 * Étape 3  la demande, désormais légitime : distinguer les deux cas.
 *
 * POURQUOI x³ ET PAS UN AUTRE. Il faut une fonction dont la dérivée s'annule
 * SANS changer de signe, et dont le point (0 ; 0) soit VISIBLE dans le cadre
 * avec de la marge — c'est le piège n°5 du lot 1, et le test le vérifie
 * (« CONTRE-EXEMPLE VISIBLE »). g′(x) = 3x² est un carré : elle ne peut pas
 * être négative, ce qui rend la démonstration immédiate pour l'élève.
 *
 * CONNAISSANCES AVANT LA DEMANDE : geste → observation → brique → question.
 *
 * MANIPULATION JAMAIS GELÉE : les deux laboratoires restent pilotables une
 * fois l'étape validée.
 */
const MAX_CUBE = extremums(CUBE).find((e) => e.kind === 'maximum');

export default function Module02LeSigneDecideDuSens() {
  const [x1, setX1] = useState(-1.5);
  const [q1, setQ1] = useState(false);
  const [x2, setX2] = useState(CUBE_SIMPLE.domain.xMin);
  const [vus2, setVus2] = useState([CUBE_SIMPLE.domain.xMin]);
  const [tri3, setTri3] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  // Trois relevés de part et d'autre de 0, dont 0 lui-même : c'est ce qui rend
  // le « même signe des deux côtés » constatable et non asséné.
  const done2 = [-0.5, 0, 0.5].every((v) => vus2.some((u) => Math.abs(u - v) < 1e-9));
  const done3 = tri3 && q3;

  const bouger2 = (v, react) => {
    setX2(v);
    if (vus2.includes(v)) return;
    const suivant = [...vus2, v];
    setVus2(suivant);
    if (!done2 && [-0.5, 0, 0.5].every((c) => suivant.some((u) => Math.abs(u - c) < 1e-9))) react?.(true);
  };

  const restants = [-0.5, 0, 0.5].filter((v) => !vus2.some((u) => Math.abs(u - v) < 1e-9));

  const steps = [
    {
      num: 1,
      title: 'La règle, sur ce que tu viens de voir',
      subtitle:
        'Les bandes sont peintes : verte là où la courbe du bas est au-dessus de l’axe, rose là où elle est en dessous. Promène la sonde et vérifie que la flèche du haut suit la couleur, puis réponds.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DeuxPanneaux fn={CUBE} x={x1} onChangeX={setX1} montrerBandes />
          <NumericQuestion
            prompt={
              <>
                Pose la sonde en <strong>x = −1</strong> : la courbe du haut atteint là son point le
                plus haut de tout l’intervalle. Quelle est sa <strong>valeur</strong> f(−1) en ce
                point ?
              </>
            }
            expected={MAX_CUBE.y}
            parse={(raw) => parseSigned(raw, parseDec)}
            display={fr(MAX_CUBE.y)}
            requires={['nombre-derive', 'derive-coefficient-directeur', 'maximum-minimum', 'extremum']}
            explain={`f(−1) = (−1)³ − 3 × (−1) = −1 + 3 = 2. C’est la VALEUR atteinte ; l’endroit où elle est atteinte, lui, s’écrit x = −1. Et c’est précisément là que la courbe du bas traverse l’axe en passant du dessus au dessous.`}
            explainFor={(n) =>
              n === -1
                ? 'C’est l’ENDROIT, l’abscisse du point. La valeur atteinte est l’ordonnée : f(−1) = −1 + 3 = 2.'
                : n === 0
                ? 'C’est ce que vaut la courbe DU BAS en ce point, f′(−1) = 0. La courbe du haut, elle, y vaut 2.'
                : null
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Une bande verte, la flèche monte ; une bande rose, elle descend. Et au passage
                d’une couleur à l’autre, la courbe du haut se retourne.
              </Feedback>
              <KnowledgeBrick
                id="signe-derivee-donne-sens"
                variant="new"
                lead={<>Ce que les deux panneaux montrent ensemble s’écrit en une règle. Repromène la sonde en la lisant.</>}
              />
              <KnowledgeBrick
                id="mem-positive-monte"
                variant="new"
                lead={<>Et voici la forme courte, celle qu’on garde en tête.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une dérivée nulle suffit-elle ?',
      subtitle:
        'Nouvelle fonction : g(x) = x³, dont la dérivée est g′(x) = 3x². Fais glisser la sonde sur −0,5, puis sur 0, puis sur 0,5, et relève à chaque fois le signe du bas.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <DeuxPanneaux
            fn={CUBE_SIMPLE}
            x={x2}
            onChangeX={(v) => bouger2(v, kit.react)}
            visites={vus2}
            montrerBandes
            disabled={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                g′(−0,5) = <strong>{fr(CUBE_SIMPLE.fPrime(-0.5))}</strong> et
                g′(0,5) = <strong>{fr(CUBE_SIMPLE.fPrime(0.5))}</strong> : le même signe des deux
                côtés. En 0 la courbe du bas <strong>touche</strong> l’axe sans le traverser — et
                en haut, la courbe s’aplatit un instant puis <strong>repart en montant</strong>.
                Il n’y a aucune bande rose : la fonction ne redescend jamais.
              </Feedback>
              <KnowledgeBrick
                id="changement-de-signe-decide"
                variant="new"
                lead={<>Voilà ce que le contre-exemple oblige à ajouter à la règle. Repasse la sonde sur 0 en le lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Encore à relever : {restants.map((v) => `x = ${fr(v)}`).join(', ')}. Compare le signe
              du bas de part et d’autre de 0.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux fonctions, deux conclusions',
      done: done3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Dans les deux cas la dérivée <strong>s’annule</strong>. Dans un seul, la courbe se
                retourne. Choisis pour chaque ligne.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <>f(x) = x³ − 3x en x = −1 : f′ passe de <strong>+</strong> à <strong>−</strong></>,
                options: ['la courbe se retourne', 'la courbe continue dans le même sens'],
                correct: 0,
                correction: 'Le signe CHANGE : + avant, − après. La courbe monte puis descend, donc elle se retourne.',
              },
              {
                id: 'r2',
                label: <>g(x) = x³ en x = 0 : g′ vaut <strong>+</strong> avant et <strong>+</strong> après</>,
                options: ['la courbe se retourne', 'la courbe continue dans le même sens'],
                correct: 1,
                correction: 'Le signe ne change PAS. La courbe s’aplatit un instant, puis repart dans le même sens.',
              },
            ]}
            requires={['signe-derivee-donne-sens', 'changement-de-signe-decide']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm">
                  « La dérivée s’annule » ne conclut rien à elle seule. Ce qui conclut, c’est le
                  <strong> changement de signe</strong> de part et d’autre.
                </p>
              ) : (
                <p className="text-sm">
                  Regarde le signe AVANT et APRÈS, pas la valeur EN le point. Les deux fonctions ont
                  une dérivée nulle ; une seule voit son signe changer.
                </p>
              )
            }
            solved={tri3}
            onAnswered={() => setTri3(true)}
          />
          {tri3 && (
            <TapQuestion
              prompt="Une fonction u vérifie u′(3) = 0. Que peut-on en conclure, à coup sûr ?"
              options={[
                'Rien encore : il faut regarder le signe de u′ de part et d’autre de 3',
                'Que u atteint sa plus grande valeur en 3',
                'Que u atteint sa plus petite valeur en 3',
                'Que u est constante autour de 3',
              ]}
              correct={0}
              cols={1}
              requires={['changement-de-signe-decide', 'mem-positive-monte']}
              explain="Une dérivée nulle en un point est un CANDIDAT, pas une conclusion. Sur g(x) = x³, g′(0) = 0 et pourtant la fonction continue de monter : rien ne se retourne."
              explainWrong="g(x) = x³ vérifie g′(0) = 0 et n’a pourtant ni plus grande ni plus petite valeur en 0 — elle passe. Et elle n’est pas constante autour de 0 : elle monte."
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le signe décide du sens"
      moduleSubtitle="Une règle, et la réserve qui l’accompagne"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'De la constatation à la règle',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu les deux panneaux basculer ensemble. Il reste à l’écrire comme une règle
            utilisable — et à découvrir le cas où la dérivée s’annule sans que rien ne se retourne.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et maintenant ?</strong> Tu sais lire le sens de marche dans le signe de f′. Le
          module suivant range tout cela dans le tableau que tu connais depuis la 2de — cette
          fois rempli sans jamais regarder la courbe.
        </KnowledgeSnapshot>
      }
    />
  );
}
