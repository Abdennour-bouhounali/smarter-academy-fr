import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — FORMALISATION : « Quatre graphiques, quatre histoires ».
 *
 * Activity: associer une courbe à une situation, à un tableau, à une
 *   expression — et dire ce qui les distingue.
 * Mathematical objective: la forme d'une courbe PORTE une information. Une
 *   droite montante, une droite descendante, une horizontale et une courbe qui
 *   s'accélère racontent quatre évolutions différentes.
 * Student action: lire quatre repères côte à côte, puis apparier.
 * Controlled variable: aucune manipulation continue ; c'est le module qui
 *   nomme ce que les précédents ont fait construire.
 * Mathematical state: quatre fonctions fixes ; les courbes en dérivent.
 * Visual consequence: les quatre allures sont visibles d'un coup d'œil, à la
 *   même échelle — c'est la comparaison qui enseigne.
 * Expected observation: « celle qui descend, c'est forcément le réservoir ».
 * Misconception targeted: associer une courbe à une situation par le décor
 *   plutôt que par sa forme ; confondre « monte vite » et « part de haut ».
 * Feedback: le lot révèle la bonne réponse de CHAQUE ligne.
 * Formalization: le vocabulaire croissant / décroissant / constant est posé.
 * Scaffolding: comparaison → appariement situation → appariement expression.
 * Transfer: le module 6 demande de juger des graphiques défectueux.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   « croissante », « décroissante », « constante » et le lien signe de a ↔ sens
 *   de la droite vivaient dans des `explain` — c'est-à-dire APRÈS les avoir
 *   exigés. L'ordre est maintenant :
 *     étape 1  la question se pose en mots ordinaires (« qui ne change pas »),
 *              puis la brique `forme-de-la-courbe` nomme les trois cas
 *     étape 2  brique `forme-et-situation` → l'appariement devient une méthode
 *     étape 3  brique `forme-et-expression` → resitue a et b, acquis de
 *              `fonctions-affines-3e`, sur le DESSIN et non plus sur le calcul.
 */

const RANGE = { xMin: 0, xMax: 6, yMin: 0, yMax: 30 };

const GRAPHS = [
  { id: 'A', a: 4, b: 2, tone: 'indigo', label: 'A', desc: 'part de 2 et monte régulièrement' },
  { id: 'B', a: -4, b: 26, tone: 'rose', label: 'B', desc: 'part de 26 et descend régulièrement' },
  { id: 'C', a: 0, b: 14, tone: 'emerald', label: 'C', desc: 'ne bouge pas' },
  { id: 'D', fn: (x) => x * x * 0.8, tone: 'amber', label: 'D', desc: 'monte de plus en plus vite' },
];

function MiniGraph({ g }) {
  return (
    <div className="space-y-1">
      <p className="text-center text-sm font-bold text-slate-700">Graphique {g.label}</p>
      <CoordPlane
        range={RANGE}
        unit={20}
        xStep={1}
        yStep={5}
        functions={[g.fn ? { id: g.id, fn: g.fn, tone: g.tone } : { id: g.id, a: g.a, b: g.b, tone: g.tone }]}
        caption={false}
        ariaLabel={`Graphique ${g.label} : ${g.desc}`}
      />
    </div>
  );
}

export default function Module05QuatreHistoires() {
  const [shapeDone, setShapeDone] = useState(false);
  const [situDone, setSituDone] = useState(false);
  const [exprDone, setExprDone] = useState(false);
  const [formeDone, setFormeDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Quatre graphiques, quatre histoires"
      moduleSubtitle="Associer une courbe à une situation, à un tableau, à une expression."
      estimatedTime="9 min"
      brief={{
        tag: '🔀 Mission 05',
        title: 'Chaque forme raconte quelque chose',
        tone: 'indigo',
        body: (
          <p>
            Quatre graphiques, tracés à la même échelle. Aucun titre, aucune unité — et
            pourtant chacun décrit une évolution bien précise.
          </p>
        ),
      }}
      intro={
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {GRAPHS.map((g) => <MiniGraph key={g.id} g={g} />)}
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Ce que dit la forme',
          subtitle: 'Trouve d’abord, les mots viennent ensuite.',
          done: shapeDone && formeDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Lequel de ces graphiques montre une grandeur qui ne change pas ?"
                options={['C', 'A', 'B', 'D']}
                correct={0}
                cols={4}
                requires={['ligne-devient-point']}
                explain="C est la seule horizontale : sa hauteur est la même partout. A monte, B descend, D monte de plus en plus vite."
                explainWrong="Cherche celui dont la hauteur ne varie jamais, quel que soit l’endroit où on le lit."
                solved={shapeDone}
                onAnswered={() => setShapeDone(true)}
              />
              {shapeDone && (
                <KnowledgeBrick
                  id="forme-de-la-courbe"
                  variant="new"
                  lead="Monte, descend, reste plat : chacun de ces trois comportements porte un nom."
                >
                  <TapQuestion
                    prompt="Lequel de ces graphiques est décroissant ?"
                    options={['B', 'A', 'C', 'D']}
                    correct={0}
                    cols={4}
                    requires={['forme-de-la-courbe']}
                    explain="B descend quand on la parcourt de la gauche vers la droite : elle est décroissante."
                    explainWrong="Décroissante veut dire « qui descend ». Regarde le sens, pas la hauteur de départ."
                    solved={formeDone}
                    onAnswered={() => setFormeDone(true)}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À chaque histoire son graphique',
          done: situDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="forme-et-situation"
                variant="new"
                lead="Les quatre graphiques n’ont ni titre ni unité. Deux questions suffisent pourtant à les rattacher à une histoire."
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Associe chaque situation au graphique qui lui correspond.</p>}
                rows={[
                  { id: 'r1', label: 'Un réservoir qui se vide régulièrement', options: ['A', 'B', 'C', 'D'], correct: 1,
                    correction: 'B : la seule qui descend régulièrement.' },
                  { id: 'r2', label: 'Un abonnement à prix fixe, quel que soit l’usage', options: ['A', 'B', 'C', 'D'], correct: 2,
                    correction: 'C : la valeur ne change pas — c’est une horizontale.' },
                  { id: 'r3', label: 'Une épargne qui grossit de plus en plus vite', options: ['A', 'B', 'C', 'D'], correct: 3,
                    correction: 'D : la courbe se redresse, la hausse s’accélère.' },
                  { id: 'r4', label: 'Un taxi : 2 € puis un tarif régulier au kilomètre', options: ['A', 'B', 'C', 'D'], correct: 0,
                    correction: 'A : elle part de 2 et monte à rythme constant — une droite.' },
                ]}
                feedback={({ allRight, nCorrect, total }) =>
                  allRight
                    ? <>Les quatre. La <strong>forme</strong> suffit : monte, descend, reste plat, s’accélère.</>
                    : <>{nCorrect} sur {total}. Regarde d’abord le sens (monte ou descend), puis la régularité.</>
                }
                requires={['forme-et-situation', 'forme-de-la-courbe']}
                solved={situDone}
                onAnswered={() => setSituDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et son expression',
          done: exprDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="forme-et-expression"
                variant="new"
                lead="Tu connais déjà a et b d’une fonction affine. Voilà où ils se lisent sur le dessin, sans le moindre calcul."
              >
                <TapQuestion
                  prompt="Quelle expression correspond au graphique B ?"
                  options={['f(x) = −4x + 26', 'f(x) = 4x + 2', 'f(x) = 26', 'f(x) = 4x − 26']}
                  correct={0}
                  cols={2}
                  requires={['forme-et-expression', 'forme-de-la-courbe', 'fonction-affine', 'coefficient-lineaire', 'ordonnee-origine']}
                  explain="B descend : son coefficient est négatif, a = −4. Elle coupe l’axe vertical à 26 : b = 26."
                  explainWrong="Une droite qui descend a forcément un coefficient négatif. Et sa hauteur de départ se lit là où elle coupe l’axe vertical."
                  solved={exprDone}
                  onAnswered={() => setExprDone(true)}
                />
              </KnowledgeBrick>
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          Tu sais construire et tu sais lire. Reste le plus utile : reconnaître un graphique
          qui trompe — c’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
