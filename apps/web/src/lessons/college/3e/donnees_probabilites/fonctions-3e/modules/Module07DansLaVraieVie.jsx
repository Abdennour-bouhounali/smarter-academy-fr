import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { affine, imageOf, antecedentsOf, formatRule } from '../components/functionUtils';
import { parseDec, formatDec, intersectionOfAffine } from '@smarter-academy/core';

/**
 * Module 7 — TRANSFERT : « La machine dans la vraie vie ».
 *
 * Activity: modéliser une course de taxi, puis comparer deux forfaits.
 * Mathematical objective: traduire une situation en fonction, savoir ce que
 *   valent a et b DANS LA SITUATION (prix par km, prise en charge), puis lire
 *   le graphique pour décider.
 * Student action: choisir l'expression, calculer une image (le prix), chercher
 *   un antécédent (la distance), déplacer le curseur pour comparer.
 * Controlled variable: la distance, via le curseur du repère.
 * Mathematical state: deux règles affines ; le point d'égalité est calculé par
 *   intersectionOfAffine — jamais écrit en dur.
 * Visual consequence: à x = 0 la courbe du taxi part de 2 € et NON de zéro —
 *   la prise en charge se voit. (L'ancienne leçon dessinait ce même taxi comme
 *   une droite passant par l'origine, ce qui contredisait son propre énoncé.)
 * Expected observation: « avant le croisement l'un est moins cher, après c'est
 *   l'autre » — et le croisement se lit.
 * Misconception targeted: « doubler la distance double le prix » (faux dès
 *   qu'il y a une prise en charge) ; et l'idée qu'un des deux forfaits serait
 *   meilleur en toutes circonstances.
 * Feedback: explainFor cible l'oubli de la prise en charge.
 * Formalization: le sens concret de a et de b est nommé.
 * Scaffolding: expression donnée à choisir → calcul d'image → recherche
 *   d'antécédent → comparaison libre au curseur.
 * Transfer: c'est le module de transfert de la leçon.
 */

const TAXI = affine(1.5, 2);        // 2 € de prise en charge + 1,50 €/km
const PLAN_A = affine(0.2, 0);      // 0,20 €/min, sans abonnement
const PLAN_B = affine(0.1, 6);      // 6 € d'abonnement + 0,10 €/min
const CROSS = intersectionOfAffine(PLAN_A, PLAN_B);   // → 60 min, 12 €

const TAXI_RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 18 };
const PLAN_RANGE = { xMin: 0, xMax: 120, yMin: 0, yMax: 26 };

export default function Module07DansLaVraieVie() {
  const [modelDone, setModelDone] = useState(false);
  const [priceDone, setPriceDone] = useState(false);
  const [distDone, setDistDone] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [crossDone, setCrossDone] = useState(false);
  const [chooseDone, setChooseDone] = useState(false);

  // Le curseur a été promené des deux côtés du croisement : la comparaison
  // a réellement eu lieu, plutôt que d'être affirmée.
  const [seenBefore, setSeenBefore] = useState(false);
  const [seenAfter, setSeenAfter] = useState(false);
  const onCursor = (x) => {
    setMinutes(x);
    if (x < CROSS.x) setSeenBefore(true);
    if (x > CROSS.x) setSeenAfter(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="La machine dans la vraie vie"
      moduleSubtitle="Un taxi, un forfait : la fonction sort du cahier."
      estimatedTime="10 min"
      brief={{
        tag: '🚕 Mission 07',
        title: 'Des euros, pas des x',
        tone: 'indigo',
        body: (
          <p>
            Un taxi facture <strong>2 €</strong> dès la montée, puis{' '}
            <strong>1,50 € par kilomètre</strong>. Cette phrase cache une fonction.
          </p>
        ),
      }}
      intro={(
        <KnowledgeBrick
          id="modeliser"
          variant="new"
          lead="Jusqu’ici la machine avalait des nombres nus. Voici comment elle s’applique à une situation réelle."
        />
      )}
      steps={[
        {
          num: 1,
          title: 'Traduire la phrase',
          done: modelDone,
          content: (
            <TapQuestion
              prompt="Quelle fonction donne le prix d’une course de x kilomètres ?"
              requires={['modeliser', 'fonction-affine', 'notation-fx']}
              options={[
                'f(x) = 1,5x + 2',
                'f(x) = 2x + 1,5',
                'f(x) = 1,5x',
                'f(x) = 3,5x',
              ]}
              correct={0}
              cols={2}
              explain="Le prix au kilomètre multiplie la distance : 1,5x. La prise en charge s’ajoute une seule fois, quelle que soit la distance : + 2. D’où f(x) = 1,5x + 2."
              explainWrong="Demande-toi quel nombre dépend de la distance. Les 2 € sont dus même pour 0 km : ils ne peuvent pas multiplier x."
              solved={modelDone}
              onAnswered={() => setModelDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Le prix d’une course',
          subtitle: 'Le graphique part de 2 € : la prise en charge se voit.',
          done: priceDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={TAXI_RANGE}
                unit={30}
                functions={[{ id: 'taxi', a: TAXI.a, b: TAXI.b, tone: 'amber', label: 'prix' }]}
                intercept={{ y: TAXI.b, label: '2 € dès la montée' }}
                xStep={1}
                yStep={2}
                axisLabels={{ x: 'km', y: '€' }}
                ariaLabel="Repère : prix de la course en fonction de la distance"
                caption={false}
              />
              <NumericQuestion
                prompt="Combien coûte une course de 6 km ?"
                requires={['modeliser', 'image', 'notation-fx']}
                expected={imageOf(TAXI, 6)}
                parse={parseDec}
                display={formatDec(imageOf(TAXI, 6))}
                suffix="€"
                explain="f(6) = 1,5 × 6 + 2 = 9 + 2 = 11 €. Sur le graphique, au-dessus de 6, on lit bien 11."
                explainFor={(n) => {
                  if (n === 9) return 'Tu as oublié la prise en charge : 9 € pour les kilomètres, plus 2 € de montée.';
                  if (n === 8) return 'Tu as peut-être calculé 6 + 2. Le 1,5 multiplie la distance : 1,5 × 6 = 9.';
                  return null;
                }}
                solved={priceDone}
                onAnswered={(ok) => { setPriceDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Combien de kilomètres pour 14 € ?',
          subtitle: 'Cette fois, on connaît la sortie et on cherche l’entrée.',
          done: distDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Avec 14 €, quelle distance peux-tu parcourir ?"
              requires={['modeliser', 'antecedent']}
              expected={antecedentsOf(TAXI, 14)[0]}
              parse={parseDec}
              display={formatDec(antecedentsOf(TAXI, 14)[0])}
              suffix="km"
              explain="On cherche un ANTÉCÉDENT : 1,5x + 2 = 14, donc 1,5x = 12, donc x = 8 km."
              explainFor={(n) => {
                if (n === 9.33 || Math.abs(n - 14 / 1.5) < 0.05) return 'Tu as divisé 14 par 1,5 sans retirer d’abord les 2 € de prise en charge.';
                if (n === 12) return 'Tu as trouvé la part des kilomètres en euros (12 €). Il reste à la diviser par 1,50 € par km.';
                return null;
              }}
              solved={distDone}
              onAnswered={(ok) => { setDistDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 4,
          title: 'Deux forfaits téléphone',
          subtitle: 'Promène le curseur des deux côtés du croisement.',
          done: crossDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-2">
                  <p className="font-bold text-indigo-800">Forfait A</p>
                  <p className="text-slate-700">0,20 € la minute, sans abonnement</p>
                </div>
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-2">
                  <p className="font-bold text-emerald-800">Forfait B</p>
                  <p className="text-slate-700">6 € par mois, puis 0,10 € la minute</p>
                </div>
              </div>
              <CoordPlane
                range={PLAN_RANGE}
                unit={2.6}
                functions={[
                  { id: 'a', a: PLAN_A.a, b: PLAN_A.b, tone: 'indigo', label: 'A' },
                  { id: 'b', a: PLAN_B.a, b: PLAN_B.b, tone: 'emerald', label: 'B' },
                ]}
                cursor={{ x: minutes, onChange: onCursor }}
                xStep={10}
                yStep={2}
                labelEvery={2}
                axisLabels={{ x: 'min', y: '€' }}
                ariaLabel="Repère : comparer les deux forfaits"
              />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <p className="text-xs font-semibold text-indigo-700">A à {formatDec(minutes)} min</p>
                  <p className="font-mono font-bold text-indigo-900">{formatDec(imageOf(PLAN_A, minutes))} €</p>
                </div>
                <div className="rounded-lg bg-emerald-100 p-2">
                  <p className="text-xs font-semibold text-emerald-700">B à {formatDec(minutes)} min</p>
                  <p className="font-mono font-bold text-emerald-900">{formatDec(imageOf(PLAN_B, minutes))} €</p>
                </div>
              </div>
              {!(seenBefore && seenAfter) && !crossDone && (
                <Feedback tone="info">
                  Place le curseur <strong>avant</strong> puis <strong>après</strong> le point
                  où les deux droites se croisent, et regarde qui est en dessous.
                </Feedback>
              )}
              <NumericQuestion
                prompt="À combien de minutes les deux forfaits coûtent-ils exactement pareil ?"
                requires={['modeliser', 'representation-graphique']}
                expected={CROSS.x}
                parse={parseDec}
                display={formatDec(CROSS.x)}
                suffix="min"
                explain={`Au croisement, 0,2x = 0,1x + 6, donc 0,1x = 6 et x = ${formatDec(CROSS.x)} min — les deux coûtent alors ${formatDec(CROSS.y)} €.`}
                explainFor={(n) => {
                  if (n === 6) return 'Tu as donné le prix de l’abonnement, pas la durée. Cherche le x où les deux prix sont égaux.';
                  if (n === 12) return 'C’est le prix au croisement, en euros. La question porte sur les minutes.';
                  return null;
                }}
                solved={crossDone}
                onAnswered={(ok) => { setCrossDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'Choisir pour de vrai',
          done: chooseDone,
          content: (
            <TapQuestion
              prompt="Léa téléphone environ 40 minutes par mois. Que lui conseilles-tu ?"
              requires={['modeliser', 'representation-graphique']}
              options={[
                'Le forfait A : avant 60 min, il est moins cher',
                'Le forfait B : il a un abonnement, donc il est plus avantageux',
                'Peu importe : les deux reviennent au même',
              ]}
              correct={0}
              cols={1}
              explain="À 40 min : A coûte 8 €, B coûte 10 €. Aucun forfait n’est meilleur en toutes circonstances — c’est l’usage qui décide, et le croisement dit où bascule la réponse."
              explainWrong="Regarde les deux prix à 40 minutes sur le graphique : la droite du dessous est la moins chère."
              solved={chooseDone}
              onAnswered={() => setChooseDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Dans une situation réelle, <strong>a</strong> est un taux
          (par km, par minute) et <strong>b</strong> ce qu’on paie même sans rien consommer. Il
          ne reste qu’à mettre tout cela à l’épreuve.
        </KnowledgeSnapshot>
      )}
    />
  );
}
