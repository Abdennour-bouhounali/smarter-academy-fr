import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { coefficientFromPair, coefficientFromTable, image, formatLinear } from '../components/linearUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 4 — FORMALISATION : « Retrouver le coefficient ».
 *
 * Activity: remonter à a depuis un point, depuis un tableau, depuis une droite.
 * Mathematical objective: fixer la méthode — a = y ÷ x, avec un point qui ne
 *   soit pas l'origine — et montrer que les trois sources disent la même chose.
 * Student action: calculer, puis choisir le point exploitable.
 * Controlled variable: aucune manipulation continue ; c'est le module où le
 *   geste des modules 2 et 3 devient une méthode nommée.
 * Mathematical state: des données fixes ; `coefficientFromPair` calcule la
 *   correction, si bien qu'énoncé et correction ne peuvent pas diverger.
 * Visual consequence: sur le graphique, le point choisi est marqué et la
 *   droite passe par lui et par l'origine.
 * Expected observation: « peu importe le point pris sur la droite, y ÷ x donne
 *   toujours le même nombre ».
 * Misconception targeted: prendre l'origine comme point de référence (elle ne
 *   détermine rien) ; et inverser le rapport en x ÷ y.
 * Feedback: explainFor cible l'inversion et la soustraction.
 * Formalization: la méthode en une ligne est posée en pied de module.
 * Scaffolding: point donné → point à choisir → graphique sans étiquette.
 * Transfer: le module 5 applique la méthode à trois contextes réels.
 */

const RANGE = { xMin: -1, xMax: 6, yMin: -1, yMax: 10 };
const A_GRAPH = 1.5;      // droite du graphique : passe par (4 ; 6)

export default function Module04RetrouverCoefficient() {
  const [pairDone, setPairDone] = useState(false);
  const [chooseDone, setChooseDone] = useState(false);
  const [tableDone, setTableDone] = useState(false);
  const [graphDone, setGraphDone] = useState(false);

  const rows = [{ x: 2, y: 9 }, { x: 5, y: 22.5 }, { x: 8, y: 36 }];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Retrouver le coefficient"
      moduleSubtitle="Un point, un tableau, une droite : trois façons de remonter à a."
      estimatedTime="8 min"
      brief={{
        tag: '🔍 Mission 04',
        title: 'Une seule division',
        tone: 'indigo',
        body: (
          <p>
            On te donne une trace de la fonction — un point, un tableau, un graphique.
            Dans les trois cas, la même division suffit.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'À partir d’un point',
          subtitle: 'Une fonction linéaire vérifie f(4) = 10.',
          done: pairDone,
          content: (kit) => (
            <NumericQuestion
              prompt={<>Quel est son coefficient <MathText>{'$a$'}</MathText> ?</>}
              expected={coefficientFromPair(4, 10)}
              parse={parseDec}
              display={formatDec(coefficientFromPair(4, 10))}
              explain="a = 10 ÷ 4 = 2,5. La fonction est donc f(x) = 2,5x — vérification : 2,5 × 4 = 10. ✓"
              explainFor={(n) => {
                if (n === 6) return 'Tu as soustrait (10 − 4). Le coefficient est un rapport : on divise.';
                if (Math.abs(n - 0.4) < 0.01) return 'Tu as divisé 4 par 10. C’est l’image divisée par l’antécédent : 10 ÷ 4.';
                if (n === 40) return 'Tu as multiplié. Pour remonter à a, il faut diviser l’image par l’antécédent.';
                return null;
              }}
              solved={pairDone}
              onAnswered={(ok) => { setPairDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 2,
          title: 'Le point qui ne sert à rien',
          done: chooseDone,
          content: (
            <TapQuestion
              prompt="Sur la droite d’une fonction linéaire, lequel de ces points ne permet PAS de trouver a ?"
              options={['(0 ; 0)', '(1 ; 3)', '(−2 ; −6)', '(4 ; 12)']}
              correct={0}
              cols={2}
              explain="Le point (0 ; 0) appartient à toutes les fonctions linéaires : il ne les distingue pas. Et 0 ÷ 0 n’a pas de sens. Il faut un point d’abscisse non nulle."
              explainWrong="Les trois autres donnent tous a = 3 par division. Seul un point d’abscisse nulle est inutilisable."
              solved={chooseDone}
              onAnswered={() => setChooseDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'À partir d’un tableau',
          done: tableDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Tableau à analyser</caption>
                  <tbody>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600">x</th>
                      {rows.map((r) => <td key={`x${r.x}`} className="px-3 text-center font-mono tabular-nums">{formatDec(r.x)}</td>)}
                    </tr>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600">f(x)</th>
                      {rows.map((r) => <td key={`y${r.x}`} className="px-3 text-center font-mono tabular-nums">{formatDec(r.y)}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
              <NumericQuestion
                prompt="Quel est le coefficient de cette fonction ?"
                expected={coefficientFromTable(rows)}
                parse={parseDec}
                display={formatDec(coefficientFromTable(rows))}
                explain="9 ÷ 2 = 4,5 ; 22,5 ÷ 5 = 4,5 ; 36 ÷ 8 = 4,5. Tous les rapports coïncident : a = 4,5. N’importe quelle colonne suffisait."
                explainFor={(n) => {
                  if (n === 7) return 'Tu as peut-être fait 9 − 2. Le coefficient est un rapport, pas une différence.';
                  return null;
                }}
                solved={tableDone}
                onAnswered={(ok) => { setTableDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'À partir d’une droite',
          subtitle: 'La droite passe par le point marqué.',
          done: graphDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                unit={32}
                functions={[{ id: 'f', a: A_GRAPH, b: 0, tone: 'indigo' }]}
                points={[{ id: 'A', name: 'A', x: 4, y: image(A_GRAPH, 4), color: '#e11d48' }]}
                ariaLabel="Repère : une droite passant par l’origine et par le point A"
                caption={false}
              />
              <TapQuestion
                prompt="Quelle est l’expression de cette fonction ?"
                options={['f(x) = 1,5x', 'f(x) = 6x', 'f(x) = 4x', 'f(x) = 0,67x']}
                correct={0}
                cols={2}
                explain="Le point A a pour coordonnées (4 ; 6), donc a = 6 ÷ 4 = 1,5. La droite passe bien par l’origine : c’est une fonction linéaire."
                explainWrong="Lis les coordonnées de A : abscisse 4, ordonnée 6. Le coefficient est l’ordonnée divisée par l’abscisse."
                solved={graphDone}
                onAnswered={(ok) => { setGraphDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>La méthode, en une ligne.</strong> Prends un point{' '}
          <MathText>{'$(x \\; ; \\; y)$'}</MathText> de la droite, avec{' '}
          <MathText>{'$x \\neq 0$'}</MathText>, et calcule{' '}
          <MathText>{'$a = y \\div x$'}</MathText>. Puis vérifie sur une autre donnée.
        </Feedback>
      }
    />
  );
}
