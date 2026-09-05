import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  image, antecedent, coefficientFromPair, formatLinear,
  percentChange, coefficientFromPercent,
} from '../components/linearUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 5 — ATELIER : « Le labo linéaire ».
 *
 * Activity: trois situations sans lien apparent — vitesse, remise,
 *   agrandissement — qui se ramènent toutes au même objet.
 * Mathematical objective: transférer. Reconnaître une fonction linéaire hors
 *   du contexte « prix au kilo » où elle a été rencontrée, et interpréter le
 *   coefficient dans les termes de chaque situation.
 * Student action: calculer une image, chercher un antécédent, choisir le
 *   coefficient qui traduit une remise.
 * Controlled variable: le curseur de distance sur le graphique de la vitesse.
 * Mathematical state: un coefficient par situation ; toutes les réponses sont
 *   calculées par les utils, jamais écrites en dur.
 * Visual consequence: la droite de la vitesse et le curseur montrent que
 *   « deux fois plus de temps » donne « deux fois plus de distance ».
 * Expected observation: « c'est toujours la même mathématique ».
 * Misconception targeted: « −20 % puis +20 % revient au point de départ »
 *   (étape 3, le piège des coefficients successifs) ; et l'idée qu'un
 *   agrandissement multiplie l'aire par le même coefficient que les longueurs.
 * Feedback: explainFor cible le pourcentage traité comme une addition.
 * Formalization: le coefficient est relu dans les mots de chaque situation.
 * Scaffolding: contexte guidé → contexte à traduire → piège.
 * Transfer: c'est le module de transfert de la leçon.
 */

const V = 12;                      // 12 km/h à vélo
const RANGE = { xMin: 0, xMax: 4, yMin: 0, yMax: 48 };
const REMISE = coefficientFromPercent(-20);   // 0,8

export default function Module05LaboLineaire() {
  const [t, setT] = useState(2);
  const [distDone, setDistDone] = useState(false);
  const [timeDone, setTimeDone] = useState(false);
  const [remiseDone, setRemiseDone] = useState(false);
  const [pieceDone, setPieceDone] = useState(false);
  const [aireDone, setAireDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le labo linéaire"
      moduleSubtitle="Vitesse, remise, agrandissement : la même droite partout."
      estimatedTime="9 min"
      brief={{
        tag: '🧪 Mission 05',
        title: 'Trois situations, une seule fonction',
        tone: 'indigo',
        body: (
          <p>
            Rien à voir entre un vélo, une étiquette de soldes et une photo agrandie ?
            Regarde le coefficient à chaque fois.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'À vélo, 12 km/h',
          subtitle: 'Déplace le curseur : la distance suit le temps.',
          done: distDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                unit={44}
                functions={[{ id: 'd', a: V, b: 0, tone: 'emerald', label: 'distance' }]}
                cursor={{ x: t, onChange: setT }}
                xStep={0.5}
                yStep={6}
                axisLabels={{ x: 'h', y: 'km' }}
                ariaLabel="Repère : distance parcourue selon la durée"
              />
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-center">
                <p className="text-sm text-emerald-800">
                  En <strong>{formatDec(t)} h</strong> :{' '}
                  <span className="font-mono font-bold">{formatDec(image(V, t))} km</span>
                </p>
              </div>
              <NumericQuestion
                prompt="Quelle distance parcourt-on en 3,5 h ?"
                expected={image(V, 3.5)}
                parse={parseDec}
                display={formatDec(image(V, 3.5))}
                suffix="km"
                explain="d(3,5) = 12 × 3,5 = 42 km. La vitesse est le coefficient : elle dit combien de kilomètres par heure."
                explainFor={(n) => {
                  if (n === 15.5) return 'Tu as ajouté 12 et 3,5. Ici on multiplie : la distance est proportionnelle au temps.';
                  return null;
                }}
                solved={distDone}
                onAnswered={(ok) => { setDistDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Combien de temps pour 30 km ?',
          done: timeDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Quelle durée faut-il pour parcourir 30 km ?"
              expected={antecedent(V, 30)}
              parse={parseDec}
              display={formatDec(antecedent(V, 30))}
              suffix="h"
              explain="On cherche l’antécédent de 30 : 12 × t = 30, donc t = 30 ÷ 12 = 2,5 h."
              explainFor={(n) => {
                if (n === 360) return 'Tu as multiplié 30 par 12. Pour remonter à la durée, il faut diviser.';
                if (n === 18) return 'Tu as soustrait. La relation est multiplicative : 12 × t = 30.';
                return null;
              }}
              solved={timeDone}
              onAnswered={(ok) => { setTimeDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Les soldes : −20 %',
          done: remiseDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Un article coûte 45 €. Quel est son prix après une remise de 20 % ?"
              expected={image(REMISE, 45)}
              parse={parseDec}
              display={formatDec(image(REMISE, 45))}
              suffix="€"
              explain="Enlever 20 %, c’est multiplier par 0,8 : 45 × 0,8 = 36 €. La remise est donc une fonction linéaire de coefficient 0,8."
              explainFor={(n) => {
                if (n === 25) return 'Tu as soustrait 20 au lieu d’enlever 20 %. Vingt pour cent de 45, c’est 9.';
                if (n === 9) return 'Tu as calculé la remise elle-même (9 €). On demande le prix payé : 45 − 9 = 36.';
                if (n === 54) return 'Tu as augmenté au lieu de diminuer : le coefficient d’une baisse est inférieur à 1.';
                return null;
              }}
              solved={remiseDone}
              onAnswered={(ok) => { setRemiseDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 4,
          title: 'Le piège des remises successives',
          done: pieceDone,
          content: (
            <TapQuestion
              prompt="Un prix baisse de 20 %, puis remonte de 20 %. Revient-on au prix de départ ?"
              options={[
                'Non : on obtient 96 % du prix initial',
                'Oui : −20 % puis +20 % s’annulent',
                'Non : on obtient plus que le prix initial',
              ]}
              correct={0}
              cols={1}
              explain="On multiplie par 0,8 puis par 1,2 : 0,8 × 1,2 = 0,96. Il manque 4 %. Les pourcentages ne s’additionnent pas — ce sont les coefficients qui se multiplient."
              explainWrong="Essaie sur 100 € : −20 % donne 80 €, puis +20 % de 80 € donne 96 €, pas 100 €."
              solved={pieceDone}
              onAnswered={() => setPieceDone(true)}
            />
          ),
        },
        {
          num: 5,
          title: 'Agrandir une photo',
          done: aireDone,
          content: (
            <TapQuestion
              prompt="On agrandit une photo : chaque longueur est multipliée par 3. Par combien son AIRE est-elle multipliée ?"
              options={['9', '3', '6', '12']}
              correct={0}
              cols={2}
              explain="La longueur et la largeur sont toutes deux multipliées par 3, donc l’aire est multipliée par 3 × 3 = 9. Les longueurs suivent une fonction linéaire de coefficient 3 ; l’aire, elle, n’en suit pas une de coefficient 3."
              explainWrong="Prends un rectangle 2 × 5 (aire 10). Agrandi, il devient 6 × 15, d’aire 90 : neuf fois plus, pas trois."
              solved={aireDone}
              onAnswered={() => setAireDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Une vitesse, un taux de remise, un facteur d’agrandissement : trois noms pour le
          même <MathText>{'$a$'}</MathText> de <MathText>{'$f(x) = ax$'}</MathText>.
          Reconnaître la fonction linéaire, c’est savoir quoi multiplier.
        </Feedback>
      }
    />
  );
}
