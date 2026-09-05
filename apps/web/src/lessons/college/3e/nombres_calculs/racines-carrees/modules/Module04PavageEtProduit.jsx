import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareComposer from '../components/SquareComposer';
import { rootProduct, rootQuotient, formatRoot, formatSqrt } from '../components/rootUtils';

/**
 * Module 4 — MANIPULATION : « Pavage et produit ».
 *
 * Activity: coller deux carrés d'aires a et b, soit en RECTANGLE (côtés √a
 *   et √b), soit BOUT À BOUT (côtés additionnés) ; comparer chaque
 *   assemblage au carré d'aire ab ou a + b.
 * Mathematical objective: établir √a × √b = √(ab), et constater qu'aucune
 *   règle du même genre ne vaut pour l'addition.
 * Student action: taper les puces d'aires, taper l'onglet « × » ou « + ».
 * Controlled variable: (a, b, mode).
 * Mathematical state: (a, b, mode) ; les côtés et les aires sont dérivés.
 * Visual consequence: le rectangle affiche son aire ab ; en mode « + », la
 *   règle 3 + 4 = 7 dépasse visiblement le côté 5 du carré d'aire 25.
 * Expected observation: √4 × √9 = 2 × 3 = 6 = √36 ; mais √9 + √16 = 7 ≠ 5 = √25.
 * Misconception targeted: « √(a + b) = √a + √b » (le piège majeur du
 *   chapitre), et sa cousine « √a × √b = √a√b se calcule aussi pour + ».
 * Feedback: les deux longueurs sont chiffrées côte à côte (7 contre 5).
 * Formalization: étape 3, la règle produit puis la règle quotient.
 * Scaffolding: seules des aires de carrés parfaits, pour que les côtés
 *   soient entiers et lisibles.
 * Transfer: le module 5 utilise la règle produit à l'envers (extraction).
 */
export default function Module04PavageEtProduit() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(9);
  const [mode, setMode] = useState('product');

  // Objectif MATHÉMATIQUE de l'étape 1 : avoir vu au moins deux paires
  // différentes former un rectangle dont l'aire est le produit des aires.
  const [seenProducts, setSeenProducts] = useState(new Set(['4-9']));
  const productDone = seenProducts.size >= 2;

  const [trapMode, setTrapMode] = useState('sum');
  const [trapA, setTrapA] = useState(9);
  const [trapB, setTrapB] = useState(16);
  const [trapAnswered, setTrapAnswered] = useState(false);

  const [ruleDone, setRuleDone] = useState(false);
  const [quotientDone, setQuotientDone] = useState(false);

  const pick = (nextA, nextB, kitReact) => {
    setA(nextA);
    setB(nextB);
    setSeenProducts((s) => new Set(s).add(`${nextA}-${nextB}`));
    kitReact?.(true);
  };

  const prod = rootProduct(a, b);
  const quot = rootQuotient(50, 2);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Pavage et produit"
      moduleSubtitle="Deux carrés collés : ce qui marche, et ce qui ne marche pas."
      estimatedTime="10 min"
      brief={{
        tag: '🧱 Mission 04',
        title: 'Coller deux carrés, deux façons.',
        body: (
          <p>
            En <strong>rectangle</strong>, leurs côtés se multiplient. <strong>Bout à bout</strong>, leurs
            côtés s’additionnent. Une seule des deux opérations se transporte sous la racine — à toi de
            voir laquelle.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le rectangle : les racines se multiplient',
          subtitle: 'Change les deux aires et regarde l’aire du rectangle.',
          done: productDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le carré A a une aire de {a}, donc un côté de <MathText>{`$${formatSqrt(a)}$`}</MathText>.
                Idem pour B. Colle-les en rectangle : quelle est son aire ?
              </p>

              <SquareComposer
                a={a}
                b={b}
                mode="product"
                onA={(v) => pick(v, b, kit.react)}
                onB={(v) => pick(a, v, kit.react)}
              />

              <Feedback tone={productDone ? 'ok' : 'info'}>
                Le rectangle mesure <MathText>{`$${formatSqrt(a)}$`}</MathText> sur{' '}
                <MathText>{`$${formatSqrt(b)}$`}</MathText>, donc son aire vaut{' '}
                <MathText>{`$${formatSqrt(a)} \\times ${formatSqrt(b)} = ${formatRoot(prod)}$`}</MathText>.
                {' '}Or le carré d’aire <strong>{a * b}</strong> a lui aussi un côté de{' '}
                <MathText>{`$${formatRoot(prod)}$`}</MathText> : les deux racines se sont réunies sous une
                seule, <MathText>{`$${formatSqrt(a * b)}$`}</MathText>.
                {!productDone && ' Essaie une autre paire d’aires pour vérifier que ça marche à chaque fois.'}
                {productDone && (
                  <>
                    {' '}Sur {seenProducts.size} paires testées, la même chose à chaque fois :{' '}
                    <strong>le produit des racines est la racine du produit</strong>.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Bout à bout : le piège de l’addition',
          subtitle: 'Compare la longueur obtenue au côté du carré d’aire 25.',
          done: trapAnswered,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Cette fois on pose les deux carrés côte à côte, sans les empiler. Les côtés{' '}
                <MathText>{'$\\sqrt{9} = 3$'}</MathText> et <MathText>{'$\\sqrt{16} = 4$'}</MathText>{' '}
                s’additionnent. À droite, le carré d’aire 9 + 16 = 25 : compare les deux longueurs.
              </p>

              <SquareComposer
                a={trapA}
                b={trapB}
                mode={trapMode}
                onMode={setTrapMode}
                onA={setTrapA}
                onB={setTrapB}
              />

              <TapQuestion
                prompt={
                  <>
                    Vrai ou faux : <MathText>{'$\\sqrt{9} + \\sqrt{16} = \\sqrt{25}$'}</MathText> ?
                  </>
                }
                options={['Vrai', 'Faux']}
                cols={2}
                correct={1}
                explain={
                  <>
                    <MathText>{'$\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$'}</MathText>, alors que{' '}
                    <MathText>{'$\\sqrt{25} = 5$'}</MathText>. Sur la figure, la règle rose (7) dépasse
                    nettement le côté du carré en pointillés (5). <strong>La racine ne se distribue pas
                    sur l’addition.</strong>
                  </>
                }
                explainWrong={
                  <>
                    C’est le piège n°1 du chapitre. Les nombres le disent :{' '}
                    <MathText>{'$3 + 4 = 7$'}</MathText> mais <MathText>{'$\\sqrt{25} = 5$'}</MathText>.
                    Et la figure aussi : la longueur bout à bout dépasse le côté du carré d’aire 25. Ce
                    qui marche, c’est le PRODUIT, pas la somme.
                  </>
                }
                solved={trapAnswered}
                onAnswered={() => setTrapAnswered(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'La règle, maintenant qu’elle est vue',
          done: ruleDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 space-y-2 text-center">
                <p className="text-sm font-semibold text-sky-900">Pour a et b positifs :</p>
                <MathText className="text-lg text-slate-800">
                  {'$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$'}
                </MathText>
                <p className="text-sm text-rose-700 font-semibold pt-1">
                  Mais <MathText>{'$\\sqrt{a} + \\sqrt{b} \\neq \\sqrt{a + b}$'}</MathText> — aucune règle
                  pour l’addition.
                </p>
              </div>

              <TapQuestion
                prompt={
                  <>
                    Calcule <MathText>{'$\\sqrt{2} \\times \\sqrt{18}$'}</MathText>.
                  </>
                }
                options={['$\\sqrt{20}$', '$6$', '$36$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['√20', '6', '36'][i]}
                correctionLabel="6"
                cols={3}
                correct={1}
                explain={
                  <>
                    On passe sous une seule racine :{' '}
                    <MathText>{'$\\sqrt{2} \\times \\sqrt{18} = \\sqrt{36} = 6$'}</MathText>. Un produit de
                    racines peut donc redevenir un entier tout simple.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$\\sqrt{20}$'}</MathText>, ce serait <MathText>{'$\\sqrt{2 + 18}$'}</MathText>{' '}
                    — la règle de l’addition, celle qui n’existe pas. Ici on MULTIPLIE : 2 × 18 = 36, donc{' '}
                    <MathText>{'$\\sqrt{36} = 6$'}</MathText>. (36, c’est l’aire du carré, pas son côté.)
                  </>
                }
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Et le quotient ?',
          subtitle: 'Un rectangle qu’on découpe au lieu de l’assembler.',
          done: quotientDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 space-y-2 text-center">
                <p className="text-sm font-semibold text-sky-900">
                  La division suit la même logique que la multiplication :
                </p>
                <MathText className="text-lg text-slate-800">
                  {'$\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$'}
                </MathText>
              </div>

              <TapQuestion
                prompt={
                  <>
                    Calcule <MathText>{'$\\dfrac{\\sqrt{50}}{\\sqrt{2}}$'}</MathText>.
                  </>
                }
                options={['$5$', '$\\sqrt{48}$', '$25$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['5', '√48', '25'][i]}
                correctionLabel="5"
                cols={3}
                correct={0}
                explain={
                  <>
                    <MathText>{'$\\dfrac{\\sqrt{50}}{\\sqrt{2}} = \\sqrt{\\dfrac{50}{2}} = \\sqrt{25} = 5$'}</MathText>
                    {quot ? <> — soit <MathText>{`$${formatRoot(quot)}$`}</MathText>.</> : null}
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$\\sqrt{48}$'}</MathText> viendrait de 50 − 2 : la soustraction ne passe pas
                    sous la racine, pas plus que l’addition. Ici on DIVISE : 50 ÷ 2 = 25, donc{' '}
                    <MathText>{'$\\sqrt{25} = 5$'}</MathText>. (25 est l’aire, 5 est le côté.)
                  </>
                }
                solved={quotientDone}
                onAnswered={() => setQuotientDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Deux règles qui marchent — <MathText>{'$\\sqrt{a}\\sqrt{b} = \\sqrt{ab}$'}</MathText> et{' '}
          <MathText>{'$\\sqrt{a} / \\sqrt{b} = \\sqrt{a/b}$'}</MathText> — et une qui n’existe pas :{' '}
          <MathText>{'$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$'}</MathText>. Au module suivant, on
          utilise la règle du produit <strong>à l’envers</strong>, pour simplifier.
        </Feedback>
      }
    />
  );
}
