import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SlopeFromTwoPoints from '../components/SlopeFromTwoPoints';
import { affineFromTwoPoints, image } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 5 — FORMALISATION : « Deux points suffisent ».
 *
 * Activity: déplacer deux points et lire le coefficient sur le triangle qu'ils
 *   forment, puis retrouver une expression sans aucun réglage.
 * Mathematical objective: poser la méthode — a = Δy/Δx, puis b = f(0) obtenu
 *   en remontant depuis un point connu.
 * Student action: choisir le point actif, le déplacer ; puis calculer.
 * Controlled variable: la position de A ou de B (un seul à la fois, comme
 *   l'exige `CoordPlane`).
 * Mathematical state: { A, B } ; `affineFromTwoPoints` produit la correction,
 *   qui ne peut donc pas diverger du dessin.
 * Visual consequence: le triangle se redessine, l'expression se réécrit.
 * Expected observation: « peu importe les deux points choisis sur la droite,
 *   le rapport Δy/Δx est le même ».
 * Misconception targeted: inverser le rapport (Δx/Δy) ; croire que b se lit
 *   sur n'importe quel point plutôt qu'en x = 0.
 * Feedback: explainFor cible l'inversion et l'oubli du retour à x = 0.
 * Formalization: la méthode en deux temps est nommée en pied de module.
 * Scaffolding: triangle guidé → objectif imposé → calcul sans dessin.
 * Transfer: le module 6 l'applique à des factures réelles.
 */

const TARGET_A = 2;   // objectif d'inclinaison à atteindre à l'étape 2

export default function Module05DeuxPoints() {
  const [A, setA] = useState({ x: -1, y: 0 });
  const [B, setB] = useState({ x: 2, y: 3 });
  const [active, setActive] = useState('B');
  const [ratioDone, setRatioDone] = useState(false);
  const [bDone, setBDone] = useState(false);
  const [fullDone, setFullDone] = useState(false);

  const move = (id, p) => {
    if (id === 'A') setA(p); else setB(p);
  };

  const f = affineFromTwoPoints(A, B);
  const hitSlope = f !== null && f.a === TARGET_A;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Deux points suffisent"
      moduleSubtitle="Un triangle entre deux points donne a ; le reste donne b."
      estimatedTime="9 min"
      brief={{
        tag: '📐 Mission 05',
        title: 'Le triangle qui mesure la pente',
        tone: 'indigo',
        body: (
          <p>
            Deux points définissent une droite. Le triangle entre eux se lit :
            l’avancée horizontale et la montée verticale donnent{' '}
            <MathText>{'$a$'}</MathText>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Fabrique une pente de 2',
          subtitle: 'Déplace A ou B jusqu’à ce que le coefficient vaille 2.',
          done: hitSlope || ratioDone,
          content: (kit) => (
            <div className="space-y-3">
              <SlopeFromTwoPoints
                A={A}
                B={B}
                active={active}
                onActiveChange={setActive}
                onPointChange={(id, p) => {
                  move(id, p);
                  const next = id === 'A' ? affineFromTwoPoints(p, B) : affineFromTwoPoints(A, p);
                  if (next && next.a === TARGET_A && !ratioDone) { setRatioDone(true); kit.react(true); }
                }}
              />
              <Feedback tone={hitSlope || ratioDone ? 'ok' : 'info'}>
                {hitSlope || ratioDone ? (
                  <>
                    Coefficient 2 : quand on avance de 1, on monte de 2. Plusieurs paires de
                    points donnent la même pente — c’est le <strong>rapport</strong> qui compte,
                    pas les points eux-mêmes.
                  </>
                ) : f === null ? (
                  <>Ces deux points ne définissent aucune fonction. Décale-en un horizontalement.</>
                ) : (
                  <>
                    Actuellement <MathText>{`$a = ${formatDec(f.a)}$`}</MathText>. Vise{' '}
                    <strong>2</strong> : il faut que la montée soit le double de l’avancée.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le coefficient, sans dessin',
          done: bDone,
          content: (kit) => (
            <NumericQuestion
              prompt={<>Une droite passe par <MathText>{'$(1 \\; ; \\; 5)$'}</MathText> et <MathText>{'$(4 \\; ; \\; 11)$'}</MathText>. Que vaut <MathText>{'$a$'}</MathText> ?</>}
              expected={affineFromTwoPoints({ x: 1, y: 5 }, { x: 4, y: 11 }).a}
              parse={parseDec}
              display={formatDec(affineFromTwoPoints({ x: 1, y: 5 }, { x: 4, y: 11 }).a)}
              explain="Δy = 11 − 5 = 6, Δx = 4 − 1 = 3, donc a = 6 ÷ 3 = 2."
              explainFor={(n) => {
                if (Math.abs(n - 0.5) < 0.01) return 'Tu as divisé Δx par Δy. Le coefficient est la montée DIVISÉE par l’avancée : 6 ÷ 3.';
                if (n === 6) return 'Tu as donné Δy seul. Il faut le diviser par Δx = 3.';
                if (n === 3) return 'Tu as donné Δx. Le coefficient est Δy ÷ Δx.';
                return null;
              }}
              solved={bDone}
              onAnswered={(ok) => { setBDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Et l’ordonnée à l’origine',
          done: fullDone,
          content: (
            <TapQuestion
              prompt={<>Même droite : <MathText>{'$a = 2$'}</MathText> et elle passe par <MathText>{'$(1 \\; ; \\; 5)$'}</MathText>. Quelle est son expression ?</>}
              options={['f(x) = 2x + 3', 'f(x) = 2x + 5', 'f(x) = 2x − 3', 'f(x) = 5x + 2']}
              correct={0}
              cols={2}
              explain="On sait que f(1) = 5, donc 2 × 1 + b = 5, d’où b = 3. Vérification sur l’autre point : 2 × 4 + 3 = 11. ✓"
              explainWrong="Le 5 est une image, pas b. b est l’image de 0 : remonte depuis le point connu en retirant a × x."
              solved={fullDone}
              onAnswered={() => setFullDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>La méthode.</strong> D’abord <MathText>{'$a = \\dfrac{\\Delta y}{\\Delta x}$'}</MathText>{' '}
          entre deux points. Ensuite <MathText>{'$b$'}</MathText> en remplaçant x et f(x) par
          un point connu. Et toujours une vérification sur l’autre point.
        </Feedback>
      }
    />
  );
}
