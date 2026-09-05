import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, stepDelta } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Le bouton a » (b verrouillé).
 *
 * Activity: régler le seul coefficient a et regarder la droite s'incliner
 *   autour d'un point qui, lui, ne bouge pas.
 * Mathematical objective: isoler le rôle de a. Une variable à la fois
 *   (pédagogie §8) : le réglage de b reste VISIBLE mais désactivé, pour que
 *   l'élève voie qu'il existe et qu'il est tenu immobile.
 * Student action: glisser ou avancer pas à pas le réglage de a.
 * Controlled variable: a seul ; b est figé à 2.
 * Mathematical state: { a, b: 2 } — la droite, l'escalier et l'expression en
 *   dérivent ; `stepDelta` fournit la correction, donc elle ne peut pas
 *   diverger de ce qui est dessiné.
 * Visual consequence: la droite pivote autour de (0 ; 2) ; l'escalier +1 → +a
 *   se redessine ; le point d'ordonnée à l'origine reste sur place.
 * Expected observation: « le point de départ ne bouge pas, seule la pente
 *   change ».
 * Misconception targeted: « augmenter a fait monter toute la droite » — c'est
 *   le rôle de b, pas de a.
 * Feedback: le compteur d'inclinaisons explorées quantifie ce qui reste ;
 *   explainFor cible la confusion a/b sur le calcul d'image.
 * Formalization: le nom « coefficient directeur » est posé à l'étape 4.
 * Scaffolding: prédiction → exploration guidée (trois régimes) → lecture.
 * Transfer: le module 3 fait l'expérience symétrique sur b.
 */

const B_FIXED = 2;
const RANGE = { xMin: -5, xMax: 5, yMin: -7, yMax: 7 };

export default function Module02BoutonA() {
  const [a, setA] = useState(1);
  const [seen, setSeen] = useState(() => new Set(['1']));
  const [predicted, setPredicted] = useState(false);
  const [imageDone, setImageDone] = useState(false);
  const [nameDone, setNameDone] = useState(false);

  const kinds = new Set();
  for (const v of seen) {
    const n = Number(v);
    if (n < 0) kinds.add('neg');
    else if (n > 0 && n < 1) kinds.add('doux');
    else if (n >= 2) kinds.add('fort');
  }
  const LABELS = { fort: 'une pente forte (a ≥ 2)', doux: 'une pente douce (0 < a < 1)', neg: 'une pente négative (a < 0)' };
  const missing = ['fort', 'doux', 'neg'].filter((k) => !kinds.has(k));
  const explored = missing.length === 0;

  const change = ({ a: next }, kit) => {
    if (next === a) return;
    setA(next);
    setSeen((prev) => new Set(prev).add(String(next)));
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le bouton a"
      moduleSubtitle="On bloque b. Un seul réglage bouge — et la droite s’incline."
      estimatedTime="7 min"
      brief={{
        tag: '🎚️ Mission 02',
        title: 'Un seul réglage à la fois',
        tone: 'indigo',
        body: (
          <p>
            Le réglage de <MathText>{'$b$'}</MathText> est bloqué sur 2 : tu le vois, mais
            tu ne peux pas y toucher. Fais varier <MathText>{'$a$'}</MathText> et observe.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de régler',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Si tu augmentes a, que va faire la droite ?"
              options={[
                'Elle va s’incliner davantage, en gardant le même point de départ',
                'Elle va monter tout entière',
                'Elle va garder son inclinaison et glisser',
                'Rien ne changera',
              ]}
              correct={0}
              cols={1}
              explain="a commande l’inclinaison. Le point de départ, lui, est fixé par b — et b est bloqué."
              explainWrong="Tu vas pouvoir vérifier juste en dessous : garde l’œil sur le point orange, celui de l’axe des ordonnées."
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Explore les trois inclinaisons',
          subtitle: 'Une pente forte, une pente douce, une pente négative.',
          done: explored,
          content: (kit) => (
            <div className="space-y-3">
              <AffineExplorer
                a={a}
                b={B_FIXED}
                showB
                lockB
                onChange={(v) => change(v, kit)}
                aRange={{ min: -3, max: 3, step: 0.5 }}
                bRange={{ min: -4, max: 4, step: 1 }}
                range={RANGE}
                showStaircase
                showIntercept
              />
              <Feedback tone={explored ? 'ok' : 'info'}>
                {explored ? (
                  <>
                    Trois inclinaisons, un seul point immobile : <strong>(0 ; 2)</strong>. Le
                    réglage bloqué de b n’a jamais bougé, et le départ non plus.
                  </>
                ) : (
                  <>Il te reste à essayer <strong>{missing.map((k) => LABELS[k]).join(', ')}</strong>.</>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 3,
          title: 'Calcule une image',
          done: imageDone,
          content: (kit) => (
            <NumericQuestion
              prompt={<>Pour <MathText>{'$f(x) = 3x + 2$'}</MathText>, que vaut <MathText>{'$f(4)$'}</MathText> ?</>}
              expected={image(3, 2, 4)}
              parse={parseDec}
              display={formatDec(image(3, 2, 4))}
              explain="3 × 4 = 12, puis on ajoute 2 : f(4) = 14. On multiplie d’abord, on ajoute la part fixe ensuite."
              explainFor={(n) => {
                if (n === 18) return 'Tu as ajouté 2 à 4 avant de multiplier : c’est 3 × 4 puis + 2, pas 3 × (4 + 2).';
                if (n === 12) return 'Tu as oublié le + 2, la part fixe.';
                if (n === 9) return 'Tu as peut-être échangé les rôles : c’est a = 3 qui multiplie, b = 2 qui s’ajoute.';
                return null;
              }}
              solved={imageDone}
              onAnswered={(ok) => { setImageDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 4,
          title: 'Comment s’appelle ce nombre ?',
          done: nameDone,
          content: (
            <TapQuestion
              prompt={<>Dans <MathText>{'$f(x) = ax + b$'}</MathText>, comment appelle-t-on <MathText>{'$a$'}</MathText> ?</>}
              options={[
                'Le coefficient directeur : il donne l’inclinaison',
                'L’ordonnée à l’origine : il donne le départ',
                'La part fixe',
                'L’antécédent',
              ]}
              correct={0}
              cols={1}
              explain="a est le coefficient directeur : quand x avance de 1, f avance de a. C’est exactement ce que montrait l’escalier."
              explainWrong="L’ordonnée à l’origine, c’est b — le nombre que tu n’as pas pu régler dans ce module."
              solved={nameDone}
              onAnswered={() => setNameDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <MathText>{'$a$'}</MathText> commande <strong>l’inclinaison</strong>, et rien
          d’autre. Au module suivant, on bloque <MathText>{'$a$'}</MathText> et on libère{' '}
          <MathText>{'$b$'}</MathText>.
        </Feedback>
      }
    />
  );
}
