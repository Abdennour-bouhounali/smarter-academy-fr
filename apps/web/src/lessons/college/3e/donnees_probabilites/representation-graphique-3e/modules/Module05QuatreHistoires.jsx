import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatDec } from '@smarter-academy/core';

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
          done: shapeDone,
          content: (
            <TapQuestion
              prompt="Lequel de ces graphiques montre une grandeur qui ne change pas ?"
              options={['C', 'A', 'B', 'D']}
              correct={0}
              cols={4}
              explain="Une horizontale signifie que la grandeur garde la même valeur quand x augmente : elle est constante. A monte (croissante), B descend (décroissante), D monte de plus en plus vite."
              explainWrong="Cherche celui dont la hauteur ne varie jamais, quel que soit l’endroit où on le lit."
              solved={shapeDone}
              onAnswered={() => setShapeDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'À chaque histoire son graphique',
          done: situDone,
          content: (
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
              solved={situDone}
              onAnswered={() => setSituDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Et son expression',
          done: exprDone,
          content: (
            <TapQuestion
              prompt={<>Quelle expression correspond au graphique <strong>B</strong> ?</>}
              options={['f(x) = −4x + 26', 'f(x) = 4x + 2', 'f(x) = 26', 'f(x) = 4x − 26']}
              correct={0}
              cols={2}
              explain="B descend, donc son coefficient est négatif : a = −4. Elle part de 26 sur l’axe vertical, donc b = 26. Le signe de a se lit dans le SENS de la droite."
              explainWrong="Une droite qui descend a forcément un coefficient négatif. Et son point de départ se lit là où elle coupe l’axe vertical."
              solved={exprDone}
              onAnswered={() => setExprDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Situation, tableau, expression, graphique : quatre façons de dire la même chose. Le
          graphique est celle qui rend la <strong>forme</strong> immédiate — croissante,
          décroissante ou constante.
        </Feedback>
      }
    />
  );
}
